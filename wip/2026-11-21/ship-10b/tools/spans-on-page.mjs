// Ship 10b, measured before anything is built: with a default source set first, what the page draws at every
// place the corpus lane's spans list (relay v209) says that source's own line reads two or more words.
// node spans-on-page.mjs <reader dir> <base url of zone.html> <source: ubs|bdb|macula|step> <spans-v1.jsonl> <out dir> [book ...]
// Writes <out dir>/<source>/<book>.json: for each such line, the span's places and the line drawn under each.
import { join } from "node:path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
const [reader, base, source, spansPath, outDir, ...only] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(join(reader, "tools/playwright-v1.mjs"));
const { linesOnPage } = await import(join(reader, "tools/resting-lines-v1.mjs"));
const byBook = new Map();
for (const l of readFileSync(spansPath, "utf8").split("\n")) {
  if (!l) continue;
  const r = JSON.parse(l);
  if (r.source !== source || !Array.isArray(r.places) || r.places.length < 2) continue;
  if (!byBook.has(r.book)) byBook.set(r.book, []);
  byBook.get(r.book).push({ p: r.p, n: r.n, cls: r.class, places: r.places, filed: r.filed_in_span });
}
const books = [...byBook.keys()].filter((b) => !only.length || only.includes(b));
mkdirSync(join(outDir, source), { recursive: true });
const pw = await loadPlaywright();
for (const book of books) {
  const out = join(outDir, source, `${book}.json`);
  if (existsSync(out)) continue;
  const b = await pw.chromium.launch(launchOptions());
  try {
    const p = await b.newPage({ viewport: { width: 412, height: 915 } });
    await p.addInitScript((src) => { try { localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); if (src !== "step") localStorage.setItem("fh.defaults", src); } catch { /* none */ } }, source);
    let errors = 0;
    p.on("pageerror", () => { errors += 1; });
    await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    const got = await linesOnPage(p, {});
    // each section's words: whether a mark, and the cell it stands in (a run's cell holds several)
    const marks = await p.evaluate(() => [...document.querySelectorAll("section.seg")].map((s) => { const he = s.querySelector(".he-text"); const wbs = he ? [...he.querySelectorAll(".wb")] : []; return { label: (s.querySelector(".vnum") || {}).textContent || "", marks: wbs.map((w) => (w.classList.contains("mark") ? 1 : 0)), cell: wbs.map((w) => { const r = w.closest(".wjoin"); return r ? wbs.indexOf(r.querySelector(".wb")) : wbs.indexOf(w); }) }; }));
    const state = got.state;
    const secBy = new Map();
    got.sections.forEach((s, i) => { const m = marks[i]; const at = []; m.marks.forEach((mk, x) => { if (!mk) at.push(x); }); secBy.set(s.label, { s, m, at }); });
    const rows = [];
    for (const sp of byBook.get(book)) {
      const row = { p: sp.p, n: sp.n, cls: sp.cls, filed: sp.filed, places: sp.places, drawn: [] };
      for (const pl of sp.places) {
        const cut = pl.lastIndexOf(":"); const label = pl.slice(0, cut), k = Number(pl.slice(cut + 1));
        const sec = secBy.get(label);
        if (!sec) { row.drawn.push({ pl, none: "no section" }); continue; }
        const x = sec.at[k - 1];
        if (x === undefined) { row.drawn.push({ pl, none: "no word" }); continue; }
        const u = sec.s.units.find((q) => x >= q[0] && x < q[0] + q[1]);
        row.drawn.push({ pl, x, cell: sec.m.cell[x], unit: u ? [u[0], u[1]] : null, text: u ? u[2] : null, credit: u ? u[3] : null });
      }
      rows.push(row);
    }
    writeFileSync(out, JSON.stringify({ book, source, state, errors, credits: got.credits, rows }));
    console.log(`${source} ${book}: ${rows.length} span lines, defaults ${state.defaults}/${state.second}, page errors ${errors}`);
  } catch (e) { console.log(`${source} ${book}: FAILED ${String(e && e.message || e).slice(0, 200)}`); }
  await b.close();
}
