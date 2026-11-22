// Probe, 22 November 2026: the lines at rest, and optionally the cards, of chosen sections of a book, read off the
// page as a first visit opens it, by the tree's own readers (tools/resting-lines-v1.mjs, tools/card-readings-v1.mjs).
// The tree is served by tools/serve-tree-v1.mjs on a port the machine gives (never one of the round's). Reads only.
// A zone a tool rewrote is refused by the page until the round pins it again (data/zone-store-v1.json); so the probe
// answers the page's one request for that record with each zone's pin as its file now stands, and nothing else.
// Usage: node probe-sections.mjs <reader dir> <book> <section label,...> [--cards] > out.json
import { join } from "node:path";
const [R, BOOK, LABELS] = process.argv.slice(2);
const CARDS = process.argv.includes("--cards");
const { linesOnPage, pointerMapSaid } = await import(join(R, "tools/resting-lines-v1.mjs"));
const { readCards } = await import(join(R, "tools/card-readings-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools/playwright-v1.mjs"));
const { serveTree } = await import(join(R, "tools/serve-tree-v1.mjs"));
const { readFileSync } = await import("node:fs");
const { gunzipSync } = await import("node:zlib");
const zone = JSON.parse(gunzipSync(readFileSync(join(R, "data/zones", `${BOOK}.bin`))).toString("utf8"));
const want = String(LABELS).split(",");
const idx = want.map((l) => zone.sections.findIndex((s) => s.label === l));
const tree = await serveTree(R);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const { createHash } = await import("node:crypto");
const { statSync } = await import("node:fs");
const repin = () => {
  const rec = JSON.parse(readFileSync(join(R, "data/zone-store-v1.json"), "utf8"));
  let moved = 0;
  for (const [name, pin] of Object.entries(rec.pins || {})) {
    const f = join(R, "data/zones", name);
    let b = null; try { b = readFileSync(f); } catch { continue; }
    const sha = createHash("sha256").update(b).digest("hex");
    if (sha !== pin.sha256) { rec.pins[name] = { ...pin, sha256: sha, bytes: statSync(f).size }; moved += 1; }
  }
  return { body: JSON.stringify(rec), moved };
};
const REPIN = repin();
// every context the browser opens, the card reader's too, is answered so
const newContext = browser.newContext.bind(browser);
browser.newContext = async (o) => { const c = await newContext(o); await c.route("**/data/zone-store-v1.json", (route) => route.fulfill({ status: 200, contentType: "application/json; charset=utf-8", body: REPIN.body })); return c; };
const out = { book: BOOK, zones_repinned_for_the_probe: REPIN.moved, base_port_given_by_the_machine: Number(new URL(tree.base).port), sections: [] };
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e && e.message)));
  await p.goto(`${tree.base}/zone.html?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await pointerMapSaid(p);
  for (const [j, si] of idx.entries()) {
    if (si < 0) { out.sections.push({ label: want[j], fault: "no such section" }); continue; }
    const got = await linesOnPage(p, { from: si, to: si + 1 });
    out.state = got.state;
    out.sections.push({ label: want[j], si, units: got.sections[0].units, bare: got.sections[0].bare });
  }
  out.errors = errors;
  await ctx.close();
  if (CARDS) for (const s of out.sections) {
    if (s.si === undefined) continue;
    const c = await readCards(browser, tree.base, BOOK, "rest", { from: s.si, to: s.si + 1 });
    s.cards = (c.sections[0] || {}).cards || [];
  }
} finally { await browser.close(); await tree.close(); }
console.log(JSON.stringify(out));
