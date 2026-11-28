// Scratch (builder H2): the resting lines of a few books, read off the live reader the way the tree's recorder reads
// them (tools/resting-lines-v1.mjs: pointerMapSaid, then linesOnPage), on S/base and on the sandbox: at rest (the place
// card, the older card's switch off), then with the switch pressed on, then pressed off again, on the same page. Every
// reading is held to base's live reading and to base's committed record (data/resting-lines/<book>.json.gz), section
// by section: the lines' places, words and credits. Read only; each site root is served on a port the machine gives.
// node h2-lines.mjs <base site root> <sandbox site root> <out.json> <book> …
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [BASE, SAND, OUT, ...books] = process.argv.slice(2);
const T = join(SAND, "reader", "tools");
const { serveTree } = await import(join(T, "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(T, "playwright-v1.mjs"));
const { linesOnPage, pointerMapSaid } = await import(join(T, "resting-lines-v1.mjs"));
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const report = { books: [] };
const shape = (got) => got.sections.map((s) => [s.label.trim(), s.units, s.bare]);
const read = async (site, book, steps) => {
  const tree = await serveTree(site);
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const out = {};
  try {
    const p = await ctx.newPage(); const errors = [];
    p.on("pageerror", (e) => errors.push(String(e.message)));
    await p.goto(`${tree.base}/reader/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    await pointerMapSaid(p);
    for (const step of steps) {
      if (step !== "rest") {
        const said = await p.evaluate(() => { const b = document.getElementById("cardPill"); if (!b || b.closest("[hidden]")) return null; b.click(); return window.__placeCard.on; });
        out[`${step}_switch_says`] = said;
      }
      const got = await linesOnPage(p);
      out[step] = { lines: shape(got), credits: got.credits, state: got.state, card: await p.evaluate(() => (window.__placeCard ? { here: window.__placeCard.here, on: window.__placeCard.on } : null)) };
    }
    out.errors = errors;
  } finally { await ctx.close(); await tree.close(); }
  return out;
};
try {
  for (const book of books) {
    const t0 = Date.now();
    const rec = JSON.parse(gunzipSync(readFileSync(join(BASE, "reader", "data", "resting-lines", `${book}.json.gz`))).toString("utf8"));
    const recLines = rec.sections.map(([label, units]) => [String(label).trim(), units]);
    const b = await read(BASE, book, ["rest"]);
    const s = await read(SAND, book, ["rest", "on", "off"]);
    const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    const units = (lines) => lines.map(([label, u]) => [label, u]);
    const differ = (x, y) => { const out = []; for (let i = 0; i < Math.max(x.length, y.length); i += 1) if (!same(x[i], y[i])) out.push(i); return out; };
    const one = {
      book, sections: b.rest.lines.length, lines: b.rest.lines.reduce((a, l) => a + l[1].length, 0), bare: b.rest.lines.reduce((a, l) => a + l[2], 0),
      base_live_as_its_record: same(units(b.rest.lines), recLines), base_live_differs_from_record_at: differ(units(b.rest.lines), recLines).slice(0, 5),
      sandbox_at_rest: { card: s.rest.card, as_base: same(s.rest.lines, b.rest.lines) && same(s.rest.credits, b.rest.credits), sections_differ: differ(s.rest.lines, b.rest.lines).slice(0, 5), state_as_base: same(s.rest.state, b.rest.state) },
      sandbox_switch_on: { says: s.on_switch_says, card: s.on.card, as_base: same(s.on.lines, b.rest.lines) && same(s.on.credits, b.rest.credits), sections_differ: differ(s.on.lines, b.rest.lines).slice(0, 5) },
      sandbox_switch_off_again: { says: s.off_switch_says, card: s.off.card, as_base: same(s.off.lines, b.rest.lines) && same(s.off.credits, b.rest.credits), sections_differ: differ(s.off.lines, b.rest.lines).slice(0, 5) },
      errors: { base: b.errors, sandbox: s.errors }, seconds: Math.round((Date.now() - t0) / 1000),
    };
    report.books.push(one);
    console.log(JSON.stringify(one));
  }
} finally { await browser.close(); }
writeFileSync(OUT, JSON.stringify(report, null, 1));
