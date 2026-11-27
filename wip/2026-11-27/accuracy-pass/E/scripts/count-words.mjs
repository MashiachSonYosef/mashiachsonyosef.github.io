import { readFileSync, existsSync } from "node:fs"; import { gunzipSync } from "node:zlib"; import { join } from "node:path";
const R = process.argv[2];
const { zonesServed } = await import(join(R, "tools", "zones-on-disk-v1.mjs"));
const kinds = JSON.parse(readFileSync(join(R, "data", "dictionary-kinds-v1.json"), "utf8"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
let words = 0, pairs = 0, noPg = 0, onePg = 0, oneCore = 0, multiCore = 0, noCore = 0, tagged = 0, te = 0, np = 0, books = [];
const shapes = {};
for (const z of zonesServed(join(R, "data", "zones"))) {
  const zone = gz(join(R, "data", "zones", `${z}.bin`));
  if (!(zone.route === kinds.scope.zone.route && zone.schema_version === kinds.scope.zone.schema_version)) continue;
  books.push(z); let n = 0;
  for (const sec of zone.sections) for (const w of sec.words) {
    if (w.mark) continue; n += 1;
    if (Array.isArray(w.w) || w.kqw) { pairs += 1; const s = JSON.stringify(Object.keys(w)); shapes[s] = (shapes[s] || 0) + 1; }
    if (!Array.isArray(w.pg)) noPg += 1; else { const c = w.pg.filter((p) => p && p.r === "core").length; if (w.pg.length === 1) onePg += 1; if (c === 1) oneCore += 1; else if (c > 1) multiCore += 1; else noCore += 1; }
    if (w.tg) tagged += 1; else if (w.te) te += 1; if (w.np) np += 1;
  }
  words += n;
}
console.log(JSON.stringify({ books: books.length, words, pairs, noPg, onePg, oneCore, multiCore, noCore, tagged, te, np, shapes }, null, 1));
console.log(books.join(" "));
