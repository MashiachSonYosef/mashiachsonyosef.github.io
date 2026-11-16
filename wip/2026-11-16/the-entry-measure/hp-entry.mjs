// Plan section 1, step 3: at the places STEP gives no tag, would MACULA's lemma (the zone's hp) give the place an
// entry? The lemma's own key in the store, rows whose headword is the lemma exactly (vowel form), their entries (n).
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [RD] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { vowelForm, isPointed } = await import(join(RD, "tools/pointing-grade-v1.mjs"));
const rest = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const letters = (t) => [...String(t || "").normalize("NFD")].filter((c) => c >= "א" && c <= "ת").join("");
const books = Object.keys(JSON.parse(readFileSync(join(RD, "data/default-picks/index.json"), "utf8")).books);
const T = { no_tag: 0, with_hp: 0, entry_found: 0, one_entry: 0, rows_of_it_under_the_word: 0 }; const ex = [];
for (const book of books) {
  const zone = gz(join(RD, "data/zones", `${book}.bin`));
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    if (w.mark || w.kq || !w.k || !w.s || !isPointed(w.s)) continue;
    const hasTag = w.tg || (w.w || []).some((r) => r && r.tg && r.k === w.k);
    if (hasTag || !(rest.routesFor(w.k) || []).length) continue;
    T.no_tag += 1;
    if (!w.hp) continue;
    T.with_hp += 1;
    const lemma = w.hp.split(/\s+/u)[0], vf = vowelForm(lemma);
    const ns = new Set();
    for (const r of rest.routesFor(letters(lemma)) || []) if (Array.isArray(r[6]) && r[6].some((h) => isPointed(h) && vowelForm(h) === vf)) for (const n of [].concat(((r[10] || {}).n) || [])) ns.add(n);
    if (!ns.size) continue;
    T.entry_found += 1; if (ns.size === 1) T.one_entry += 1;
    const mine = (rest.routesFor(w.k) || []).filter((r) => [].concat(((r[10] || {}).n) || []).some((n) => ns.has(n))).length;
    if (mine) T.rows_of_it_under_the_word += 1;
    if (ex.length < 6) ex.push(`${book} ${sec.label} ${w.k} hp ${letters(lemma)} -> ${[...ns].join(",")} (${mine} rows of it under the word)`);
  }
}
console.log(JSON.stringify(T)); console.log(ex.join("\n"));
