// Probe, 22 November 2026: the line at rest over every place ship 17 lays, read off the page as a first visit opens
// it, by the tree's own reader of the lines (tools/resting-lines-v1.mjs: linesOnPage, the reader the round's record
// is made with), one book at a time. The tree is served by tools/serve-tree-v1.mjs on a port the machine gives.
// A zone a tool rewrote is refused by the page until the round pins it again (data/zone-store-v1.json); the probe
// answers the page's one request for that record with each zone's pin as its file now stands, and nothing else.
// Reads only. Usage: node probe-laid.mjs <reader dir> <laid-places.json> <out.json> [book,book,...]
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
const [R, PLACES, OUT, ONLY] = process.argv.slice(2);
const { linesOnPage, pointerMapSaid } = await import(join(R, "tools/resting-lines-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools/playwright-v1.mjs"));
const { serveTree } = await import(join(R, "tools/serve-tree-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const books = [...new Set(places.map((p) => p.book))].filter((b) => !ONLY || ONLY.split(",").includes(b));
const rec = JSON.parse(readFileSync(join(R, "data/zone-store-v1.json"), "utf8"));
let repinned = 0;
for (const [name, pin] of Object.entries(rec.pins || {})) {
  let b = null; try { b = readFileSync(join(R, "data/zones", name)); } catch { continue; }
  const sha = createHash("sha256").update(b).digest("hex");
  if (sha !== pin.sha256) { rec.pins[name] = { ...pin, sha256: sha, bytes: statSync(join(R, "data/zones", name)).size }; repinned += 1; }
}
const BODY = JSON.stringify(rec);
const tree = await serveTree(R);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const out = { reader: R, port_given_by_the_machine: Number(new URL(tree.base).port), zones_repinned_for_the_probe: repinned, books: {} };
try {
  for (const book of books) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    await ctx.route("**/data/zone-store-v1.json", (route) => route.fulfill({ status: 200, contentType: "application/json; charset=utf-8", body: BODY }));
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e && e.message)));
    const at = { state: null, errors, places: {} };
    try {
      await p.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await pointerMapSaid(p);
      const here = places.filter((x) => x.book === book);
      for (const si of [...new Set(here.map((x) => x.si))]) {
        const got = await linesOnPage(p, { from: si, to: si + 1 });
        at.state = got.state;
        for (const x of here.filter((y) => y.si === si)) {
          const u = (got.sections[0].units || []).find((v) => v[0] <= x.at && x.at < v[0] + Math.max(1, v[1])) || null;
          at.places[x.place] = { unit: u, credits: u && u[3] ? String(u[3]).split(" ").map((id) => [id, (got.credits[id] || {}).says || ""]) : [] };
        }
      }
    } catch (e) { at.fault = String(e && e.message || e).split("\n")[0]; }
    await ctx.close();
    out.books[book] = at;
    console.log(`${book}: ${Object.keys(at.places).length} place(s)${at.fault ? ` · FAULT ${at.fault}` : ""}${errors.length ? ` · the page threw: ${errors[0]}` : ""}`);
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(out));
