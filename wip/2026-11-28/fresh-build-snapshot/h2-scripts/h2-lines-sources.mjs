// Scratch (builder H2): what the source switches do to the lines under the place card. A book is read whole twice
// with the same sources switched off (the place's own source and the four that carry the most of the table's lines,
// as check-live-line-asks-its-own-word-v1 picks them): once at rest (the place card) and once with the older card's
// switch on (?card=spelling, which draws every line as the page did before the place card). The lines that differ
// are the lines the place card's reading moved under that switch; every other line is the same. Read only.
// node h2-lines-sources.mjs <site root> <out.json> <book> [book …]
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const [SITE, OUT, ...BOOKS] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
const rep = { books: {}, errors: [] };
const readBook = async (book, card, off) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage(); p.on("pageerror", (e) => rep.errors.push(`${book} ${card}: ${e.message}`));
  if (off) await p.addInitScript((ids) => { try { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* none */ } }, off);
  await p.goto(`${tree.base}/reader/zone.html?b=${book}${card === "spelling" ? "&card=spelling" : ""}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForFunction(() => typeof window.__materialise === "function", null, { timeout: 60000 });
  const pick = off ? null : await p.evaluate(() => {
    const z = window.__zone || {}, by = {};
    for (const sec of z.sections || []) for (const w of sec.words || []) { if (!w || w.mark || !w.k) continue; const gm = z.gloss_m ? z.gloss_m[w.k] : null; for (const id of (gm && gm.by) || []) by[id] = (by[id] || 0) + 1; }
    const wit = ((((z.emitted_from || {}).toggles || {}).lattice || {}).pieces || {}).witnesses || {};
    return { top: Object.entries(by).sort((a, c) => c[1] - a[1] || (a[0] < c[0] ? -1 : a[0] > c[0] ? 1 : 0)).map(([id]) => id), place: wit.english_tahot ? wit.english_tahot.m : null, resting: window.__sourcesOff || [] };
  });
  if (pick) { await ctx.close(); return { pick: [...new Set([...pick.resting, ...(pick.place ? [pick.place] : []), ...pick.top.slice(0, 4)])] }; }
  await p.evaluate(() => window.__materialise(0)); await p.waitForTimeout(1500);
  { let last = -1, still = 0; for (let t = 0; t < 300 && still < 6; t += 1) { await p.waitForTimeout(500); const n = await p.evaluate(() => [window.__livePending, document.querySelectorAll('.he-text .g[data-live="sources"]').length].join(",")); if (n === last) still += 1; else { still = 0; last = n; } } }
  const lines = await p.evaluate(() => [...document.querySelectorAll("section.seg")].flatMap((s) => [...s.querySelectorAll(".he-text .wb:not(.mark)")].map((wb, j) => { const g = wb.querySelector(":scope > .g"); const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return [`${s.__sec ? s.__sec.label : "?"}:${j + 1}`, c ? c.textContent.trim() : null, g ? g.dataset.live || "" : ""]; })));
  await ctx.close();
  return { lines };
};
try {
  for (const book of BOOKS) {
    const { pick } = await readBook(book, "place", null);
    const place = await readBook(book, "place", pick), older = await readBook(book, "spelling", pick);
    const o = new Map(older.lines.map(([k, t]) => [k, t]));
    const moved = place.lines.filter(([k, t]) => o.has(k) && o.get(k) !== t);
    rep.books[book] = { off: pick, words: place.lines.length, live_place: place.lines.filter((x) => x[2] === "sources").length, live_older: older.lines.filter((x) => x[2] === "sources").length, moved: moved.length, examples: moved.slice(0, 12).map(([k, t]) => `${k}: «${o.get(k)}» -> «${t}»`) };
    console.log(book, JSON.stringify({ ...rep.books[book], examples: rep.books[book].examples.slice(0, 3) }));
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(rep, null, 1));
