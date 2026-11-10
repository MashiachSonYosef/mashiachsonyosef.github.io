// The store record's pins against (a) the bins in the tree, (b) the shelf backup's listing on the store,
// (c) the backup's own manifest when given. Read-only; prints counts.
// node shelf-compare.mjs <reader dir> <listing.tsv> [manifest.json]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
const [R, LIST, MAN] = process.argv.slice(2);
const pins = JSON.parse(readFileSync(join(R, "data", "zone-store-v1.json"), "utf8")).pins;
const here = new Set(readdirSync(join(R, "data", "zones")).filter((f) => f.endsWith(".bin")));
const listed = new Map();
for (const line of readFileSync(LIST, "utf8").split("\n")) {
  const [key, size] = line.split("\t");
  if (!key || !key.startsWith("serving-lane/shelf/zones/")) continue;
  listed.set(key.slice("serving-lane/shelf/zones/".length), Number(size));
}
const names = Object.keys(pins);
const absent = names.filter((f) => !here.has(f));
const isSide = (f) => /\.[a-z]+\.bin$/.test(f);
console.log(`pins ${names.length} · in the tree ${names.length - absent.length} · absent ${absent.length} (${absent.filter((f) => !isSide(f)).length} zones, ${absent.filter(isSide).length} sidecars)`);
console.log(`bins in the tree with no pin: ${[...here].filter((f) => !pins[f]).join(" ") || "none"}`);
console.log(`backup listing: ${listed.size} objects`);
const inBackup = absent.filter((f) => listed.has(f));
const sameSize = inBackup.filter((f) => listed.get(f) === pins[f].bytes);
console.log(`absent pins named in the backup: ${inBackup.length} · of them the same byte count as the pin: ${sameSize.length}`);
console.log(`absent pins not named in the backup: ${absent.filter((f) => !listed.has(f)).join(" ") || "none"}`);
console.log(`backup objects with no pin: ${[...listed.keys()].filter((f) => !pins[f]).join(" ") || "none"}`);
const sum = (l) => l.reduce((a, f) => a + pins[f].bytes, 0);
console.log(`bytes pinned, absent: ${sum(absent).toLocaleString()} · bytes of the backup's objects of those names: ${inBackup.reduce((a, f) => a + listed.get(f), 0).toLocaleString()}`);
const deltas = inBackup.map((f) => listed.get(f) - pins[f].bytes).sort((a, b) => a - b);
console.log(`size difference backup - pin: min ${deltas[0]} · median ${deltas[deltas.length >> 1]} · max ${deltas[deltas.length - 1]}`);
if (MAN && existsSync(MAN)) {
  const m = JSON.parse(readFileSync(MAN, "utf8"));
  console.log(`manifest keys: ${Object.keys(m).join(", ")}`);
  const mp = m.pins || {};
  const same = absent.filter((f) => mp[f] && mp[f].sha256 === pins[f].sha256 && mp[f].bytes === pins[f].bytes);
  const sizeAsListed = Object.keys(mp).filter((f) => listed.get(f) === mp[f].bytes);
  console.log(`manifest pins ${Object.keys(mp).length} · absent pins the manifest pins the same: ${same.length} · manifest pins whose byte count is the listed object's: ${sizeAsListed.length}`);
}
