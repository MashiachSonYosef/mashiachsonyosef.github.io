// read the card at each named reading of the spelling bridge's pin, as the page rests
import path from "node:path";
import fs from "node:fs";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const TREE = process.argv[2];
const EXTRA = process.argv.slice(3);   // book:place more places to read
const imp = (f) => import(pathToFileURL(path.join(TREE, "tools", f)).href);
const { readBridge, laidOf, findBridgePlace, SPELLING_BRIDGE_HOME } = await imp("spelling-bridge-v1.mjs");
const { readCards } = await imp("card-readings-v1.mjs");
const { loadPlaywright, launchOptions } = await imp("playwright-v1.mjs");
const { serveTree } = await imp("serve-tree-v1.mjs");
const b = readBridge(path.join(TREE, SPELLING_BRIDGE_HOME, "PIN.json"));
const { laid } = laidOf(b);
const zone = (book) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(TREE, "data", "zones", `${book}.bin`))));
const want = [...b.pin.named_readings.map((r) => ({ book: r.book, place: r.place })), ...EXTRA.map((s) => { const [book, place] = s.split("@"); return { book, place }; })];
const tree = await serveTree(TREE);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const r of want) {
    const z = zone(r.book);
    const lp = laid.find((x) => x.book === r.book && x.place === r.place) || { book: r.book, place: r.place, ref: r.place };
    const found = findBridgePlace(z, lp);
    if (!found) { console.log("\n==", r.book, r.place, "not found"); continue; }
    const w = found.word;
    console.log(`\n== ${r.book} ${r.place} si ${found.si} at ${found.at} k ${w.k} pg ${JSON.stringify((w.pg || []).map((p) => [p.k, p.g, p.s, p.r]))}`);
    const cards = await readCards(browser, tree.base, r.book, "rest", { from: found.si, to: found.si + 1 });
    const card = ((cards.sections[0] || {}).cards || []).find((c) => c.e === found.at);
    if (!card) { console.log("  no card"); continue; }
    console.log("  divisions", JSON.stringify(card.divisions), "blocks", JSON.stringify(card.blocks));
    console.log("  here", JSON.stringify(card.here.map((h) => [h[0], h[1], h[2]])));
    for (const q of card.pills.slice(0, 14)) console.log(`   ${q[3] ? "PRESSED" : "       "} «${q[0]}» by ${q[2]} · ${String(q[1]).slice(0, 110)}`);
    console.log("  pills", card.pills.length);
  }
} finally { await browser.close(); await tree.close(); }
