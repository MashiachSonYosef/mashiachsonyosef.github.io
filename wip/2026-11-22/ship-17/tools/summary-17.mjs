// Ship 17 (22 November 2026): what the pin lays on a reader tree, read through the tree's one reading of the bridge,
// and the 206 places ship 11d laid against bridge v1.1 on their zones. Reads only.
//   laid by class and by book, places and pieces;
//   at each of the 206: whether the piece's part as v1.1 writes it, trimmed, is the words the zone carries (trimmed
//   too, as the page draws them), and whether it is those bytes; every piece where the bytes differ, and how, is
//   written to <log dir>/the-206-against-v1.1.tsv
//   the places laid, with where each stands on its zone, to <log dir>/laid-places.json
// Usage: node summary-17.mjs <reader dir> <log dir>
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, W] = process.argv.slice(2);
const { readBridge, laidOf, findBridgePlace } = await import(join(R, "tools/spelling-bridge-v1.mjs"));
const bridge = readBridge(join(R, "data/spelling-bridge/PIN.json"));
const { laid, faults } = laidOf(bridge);
if (faults.length) { console.log(`REFUSED: ${faults.length} fault(s) in the reading: ${faults[0]}`); process.exit(1); }
const nf = (x) => Number(x).toLocaleString("en-US");
const tally = (xs, f) => { const m = new Map(); for (const x of xs) { const k = f(x); const t = m.get(k) || { places: 0, pieces: 0 }; t.places += 1; t.pieces += x.pieces.length; m.set(k, t); } return m; };
const say = (m) => [...m].map(([k, t]) => `${k} ${nf(t.places)} (${nf(t.pieces)})`).join(" · ");
console.log(`laid: ${nf(laid.length)} places, ${nf(laid.reduce((s, p) => s + p.pieces.length, 0))} pieces`);
console.log(`  by class, places (pieces): ${say(tally(laid, (p) => p.cls))}`);
console.log(`  by road: ${say(tally(laid, (p) => p.worded))}`);
console.log(`  by book: ${say(tally(laid, (p) => p.book))}`);
const zones = new Map();
const zone = (b) => { if (!zones.has(b)) zones.set(b, JSON.parse(gunzipSync(readFileSync(join(R, "data/zones", `${b}.bin`))).toString("utf8"))); return zones.get(b); };
const rows = ["book\tplace\tpiece\tlaid on the zone (JSON)\tthe part as v1.1 writes it (JSON)\tthe part trimmed (JSON)\thow they differ"];
let wordsSame = 0, bytesSame = 0, spaced = 0, spacedPieces = 0;
const places = [];
for (const p of laid) {
  const f = findBridgePlace(zone(p.book), p);
  if (f.fault) { console.log(`REFUSED: ${p.book} ${p.place}: ${f.fault}`); process.exit(1); }
  let n = 0; for (let i = 0; i < f.si; i += 1) n += (zone(p.book).sections[i].words || []).length;
  places.push({ book: p.book, ref: p.ref, place: p.place, cls: p.cls, worded: p.worded, si: f.si, at: f.at, n: n + f.at + 1, pieces: p.pieces.map((x) => x.g), as_written: p.as_written });
  if (p.worded !== "form_row") continue;
  const g = (f.word.pg || []).map((x) => String(x.g)), aw = p.as_written;
  if (g.length === aw.length && g.every((x, i) => x.trim() === aw[i].trim())) wordsSame += 1;
  if (g.length === aw.length && g.every((x, i) => x === aw[i].trim())) bytesSame += 1;
  else {
    spaced += 1;
    for (const [i, x] of g.entries()) if (x !== aw[i].trim()) { spacedPieces += 1; rows.push([p.book, p.place, i + 1, JSON.stringify(x), JSON.stringify(aw[i]), JSON.stringify(aw[i].trim()), x.trim() === aw[i].trim() ? (x === aw[i] ? "the zone carries the part as written, with STEP's space at an end; trimmed, the same words" : "spaces only") : "the words"].join("\t")); }
  }
}
writeFileSync(join(W, "the-206-against-v1.1.tsv"), rows.join("\n") + "\n");
writeFileSync(join(W, "laid-places.json"), JSON.stringify(places));
const r206 = laid.filter((p) => p.worded === "form_row").length;
console.log(`the ${nf(r206)} worded by their form rows, against v1.1: at ${nf(wordsSame)} the part as v1.1 writes it, trimmed, is the words the zone carries, trimmed as the page draws them; at ${nf(bytesSame)} it is those bytes; at ${nf(spaced)} (${nf(spacedPieces)} pieces) the zone carries the form row's part with STEP's space at an end, which the trimmed part leaves off (the-206-against-v1.1.tsv). They are kept as they are`);
