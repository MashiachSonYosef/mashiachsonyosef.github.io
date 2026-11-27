// How far each source reaches by its own entry: of the words whose STEP tag names an entry the source serves rows for
// (the row's own Strong's number, fact n), at how many does a row of that very entry stand under the card's key?
// The card's key is the word's letters or its core piece's letters; a row is found by letters and gated by entry.
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [BASE, OUT] = process.argv.slice(2);
const T = (f) => import(join(BASE, "tools", f));
const { openRouteStore, factsOf } = await T("gloss-store-v1.mjs");
const { placeEntry, placeTags } = await T("entry-gate-v1.mjs");
const { zonesServed } = await T("zones-on-disk-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(BASE, "data", "route-store"));
const MINE = ["M5", "M9", "M14", "M46"];
// the entries each source serves pill rows for, and under which keys
const entries = {}; for (const m of MINE) entries[m] = new Map();   // n -> Set(keys)
for (const m of MINE) for (const line of readFileSync(join(OUT, `rows-${m}.jsonl`), "utf8").split("\n")) {
  if (!line) continue; const r = JSON.parse(line);
  if (!r.readings.length) continue;
  for (const n of ((r.facts || {}).n || [])) { const s = entries[m].get(n) || entries[m].set(n, new Set()).get(n); s.add(r.k); }
}
const stat = {}; for (const m of MINE) stat[m] = { entries_with_pill_rows: entries[m].size, words_tagged_with_such_an_entry: 0, of_them_the_cards_key_is_a_key_the_entry_is_filed_under: 0, of_them_it_is_not: 0, examples_not: [] };
let words = 0, tagged = 0;
for (const z of zonesServed(join(BASE, "data", "zones"))) {
  if (!existsSync(join(BASE, "data", "zones", `${z}.lattice.bin`))) continue;
  const zone = gz(join(BASE, "data", "zones", `${z}.bin`));
  if (!(zone.route === "MAM_RESTORE_V5_SERVE__POSITIONAL_PROTOTYPE")) continue;
  for (const sec of zone.sections || []) { let n = 0; for (const w of sec.words || []) {
    if (w.mark) continue; n += 1; words += 1;
    const tags = placeTags(w), place = tags ? placeEntry(tags) : null;
    if (!place) continue; tagged += 1;
    const pg = Array.isArray(w.pg) ? w.pg.filter((p) => p && typeof p.k === "string" && p.k) : [];
    const core = pg.length <= 1 ? [w.k] : pg.filter((p) => p.r === "core").map((p) => p.k);
    for (const m of MINE) {
      const ns = place.numbers.filter((x) => entries[m].has(x));
      if (!ns.length) continue;
      const s = stat[m]; s.words_tagged_with_such_an_entry += 1;
      const hit = ns.some((x) => core.some((k) => entries[m].get(x).has(k)));
      if (hit) s.of_them_the_cards_key_is_a_key_the_entry_is_filed_under += 1;
      else { s.of_them_it_is_not += 1; if (s.examples_not.length < 25 && Math.random() < 0.002) s.examples_not.push(`${z} ${sec.label}:${n} ${w.s} ${ns.join("+")} card key ${core.join("+")}; the entry is filed under ${[...entries[m].get(ns[0])].slice(0, 3).join(", ")}`); }
    }
  } }
}
writeFileSync(join(OUT, "entry-reach.json"), JSON.stringify({ words, words_with_a_step_tag: tagged, stat }, null, 1));
console.log(JSON.stringify({ words, tagged, stat }, null, 1));
