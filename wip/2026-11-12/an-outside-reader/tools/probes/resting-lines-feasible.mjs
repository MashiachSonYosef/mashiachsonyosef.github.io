// Can a whole book's resting lines be read off the page in one load, with no scrolling? Every section is built by
// the page's own hook (if the page offers one) or, where it does not, by landing on each section's anchor; then every
// line a reader would see is read in document order. Prints how long each step took, how many lines stand, how many
// changed between two readings a second apart (a page still settling), and a sample.
// node resting-lines-feasible.mjs <reader dir> <zone url base> <book> [--sample label]
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const si = argv.indexOf("--sample"); const SAMPLE = si >= 0 ? argv[si + 1] : null; if (si >= 0) argv.splice(si, 2);
const [reader, base, book] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
const errors = []; p.on("pageerror", (e) => errors.push(e.message));
const t0 = Date.now();
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const tLoad = Date.now() - t0;
const t1 = Date.now();
const how = await p.evaluate(async () => {
  if (typeof window.__materialiseAll === "function") { window.__materialiseAll(); return "the page's own hook"; }
  // no hook: a section's own build is its __body; the page calls it through materialise, which this cannot reach,
  // so each waiting section is landed on by its anchor, as a link to it would
  let n = 0;
  for (const s of document.querySelectorAll("section.seg.seg-wait")) { const a = document.createElement("a"); a.href = `#${s.id}`; a.style.display = "none"; document.body.append(a); a.click(); a.remove(); n += 1; if (n % 200 === 0) await new Promise((q) => setTimeout(q, 0)); }
  return `an anchor per section (${n})`;
});
const tBuild = Date.now() - t1;
const read = () => p.evaluate(() => {
  const out = [];
  const text = (g) => { const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return (c.textContent || "").trim(); };
  const lineOf = (g) => { const chip = g.querySelector(":scope > .g-lic"); return chip ? (chip.dataset.line || "") : ""; };
  const licOf = (g) => { const chip = g.querySelector(":scope > .g-lic"); return chip ? chip.textContent.replace(/\s+/g, " ").trim() : ""; };
  for (const s of document.querySelectorAll("section.seg")) {
    const he = s.querySelector(".he-text");
    const units = [];
    if (he) {
      const wbs = [...he.querySelectorAll(".wb")];
      for (const g of he.querySelectorAll(".g")) {
        if (g.closest(".g") !== g && g.parentElement.closest(".g")) continue;
        if (getComputedStyle(g).display === "none") continue;
        const wb = g.parentElement.classList.contains("wb") ? g.parentElement : null;
        const run = g.parentElement.classList.contains("wjoin") ? g.parentElement : null;
        if (wb && wb.classList.contains("mark")) continue;
        if (g.classList.contains("parts")) {
          const rw = [...run.querySelectorAll(".wb")];
          for (const part of g.querySelectorAll(":scope > .g-part")) { const w = rw[Number(part.dataset.wi)]; units.push([wbs.indexOf(w), 1, text(part), lineOf(part), licOf(part)]); }
        } else if (run) { const rw = [...run.querySelectorAll(".wb")]; units.push([wbs.indexOf(rw[0]), rw.length, text(g), lineOf(g), licOf(g)]); }
        else if (wb) units.push([wbs.indexOf(wb), 1, text(g), lineOf(g), licOf(g)]);
        else units.push([-1, 0, text(g), lineOf(g), licOf(g)]);
      }
    }
    out.push({ id: s.id, label: (s.querySelector(".vnum") || {}).textContent || "", built: !!he && !s.classList.contains("seg-wait"), units });
  }
  return out;
});
const t2 = Date.now();
const a = await read();
const tRead = Date.now() - t2;
await p.waitForTimeout(1500);
const c = await read();
let moved = 0, lines = 0, bare = 0, unplaced = 0;
const flat = (x) => x.map((s) => JSON.stringify(s.units));
const fa = flat(a), fc = flat(c);
for (let i = 0; i < fa.length; i += 1) if (fa[i] !== fc[i]) moved += 1;
for (const s of c) for (const u of s.units) { lines += 1; if (!u[2] || u[2] === "—") bare += 1; if (u[0] < 0) unplaced += 1; }
console.log(`${book}: loaded in ${tLoad} ms · every section built by ${how} in ${tBuild} ms · read in ${tRead} ms`);
console.log(`  ${c.length} sections, ${c.filter((s) => s.built).length} built · ${lines} lines drawn (${bare} of them empty, ${unplaced} under no word or run) · sections whose lines changed between two readings 1.5 s apart: ${moved}${errors.length ? ` · page errors: ${errors[0]}` : ""}`);
const by = new Map(); for (const s of c) for (const u of s.units) by.set(u[3], (by.get(u[3]) || 0) + 1);
console.log(`  credited: ${[...by].sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, n]) => `${k || "(no chip)"} ${n}`).join(" · ")}`);
const s = SAMPLE ? c.find((x) => x.label === SAMPLE) : c[0];
if (s) console.log(`  ${s.label}: ${s.units.map((u) => `${u[0]}${u[1] > 1 ? `+${u[1] - 1}` : ""}:${JSON.stringify(u[2])}[${u[3]}|${u[4]}]`).join(" ")}`);
await b.close();
