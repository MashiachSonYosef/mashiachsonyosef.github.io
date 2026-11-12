// What a book's span store holds for the keys whose rows carry a text asked for: the key, its rows as they stand,
// and the places listed for it; with the store's own description of its axes.
// node span-key.mjs <span-store/book.json> <text>
// Nothing is written. It prints; it does not judge.
import { readFileSync } from "node:fs";
const [path, text] = process.argv.slice(2);
const d = JSON.parse(readFileSync(path, "utf8"));
console.log(`schema ${d.schema_version} · rule ${JSON.stringify(d.rule).slice(0, 400)}`);
console.log(`keys_axis ${JSON.stringify(d.keys_axis)}\nplaces_axis ${JSON.stringify(d.places_axis)}`);
console.log(`from ${JSON.stringify(d.from).slice(0, 500)}`);
const keys = d.keys || {};
let n = 0;
for (const [k, v] of Object.entries(keys)) {
  if (!JSON.stringify(v).includes(text)) continue;
  n += 1;
  console.log(`\nkey ${JSON.stringify(k)}\n  ${JSON.stringify(v).slice(0, 3000)}`);
  const pl = d.places || {};
  const at = Array.isArray(d.placesList) ? d.placesList.filter((p) => JSON.stringify(p).includes(JSON.stringify(k).slice(1, -1))) : [];
  console.log(`  places listed with this key: ${at.length}${at.length ? ` · ${at.slice(0, 12).map((p) => JSON.stringify(p)).join(" ")}` : ""}`);
  if (pl && !Array.isArray(pl)) { const hits = Object.entries(pl).filter(([, x]) => JSON.stringify(x).includes(JSON.stringify(k).slice(1, -1))); console.log(`  places map entries naming it: ${hits.length}${hits.length ? ` · ${hits.slice(0, 8).map(([a, x]) => `${a}=${JSON.stringify(x).slice(0, 160)}`).join(" | ")}` : ""}`); }
}
console.log(`\n${n} key(s) carry ${JSON.stringify(text)} · ${Object.keys(keys).length} keys in the book's store`);
