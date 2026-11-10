// A key whose line is its name (gloss_names): is the name, letter for letter, the text of the pill that prints it?
// The store's pool gives a reading the text of the first row to arrive with that printed form; the name is the
// Strong's form the name rule chose. Where the two differ only as "Amos" and "Amos." differ, a compare letter
// for letter does not find the name among the pills.
// node name-lead-text.mjs <reader dir> [--list N]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const LIST = Number((() => { const i = process.argv.indexOf("--list"); return i >= 0 ? process.argv[i + 1] : "6"; })());
const { openRouteStore, readingKey } = await import(pathToFileURL(join(R, "tools", "gloss-store-v1.mjs")).href);
const store = openRouteStore(join(R, "data", "route-store"));
const zones = readdirSync(join(R, "data", "zones")).filter((f) => f.endsWith(".bin") && !/\.(lattice|commentary|volume|[a-z-]+)\.bin$/u.test(f.replace(/^[^.]+/u, "")) && !f.startsWith("fixture-"));
// --cases <book> <out.json>: the pointed surfaces of that book's words under such keys, for line-vs-first-pill.mjs
const casesAt = process.argv.indexOf("--cases");
const casesBook = casesAt >= 0 ? process.argv[casesAt + 1] : null, casesOut = casesAt >= 0 ? process.argv[casesAt + 2] : null;
const cases = new Set();
const tot = { books: 0, name_keys: 0, same_text: 0, other_text: 0, no_pill_prints_it: 0, words_other_text: 0 };
const ex = [];
for (const f of zones.sort()) {
  const z = JSON.parse(gunzipSync(readFileSync(join(R, "data", "zones", f))).toString("utf8"));
  const names = z.gloss_names || {};
  if (!Object.keys(names).length) continue;
  tot.books += 1;
  const places = new Map();
  for (const sec of z.sections || []) for (const w of sec.words || []) if (w && w.k && !w.w && Object.prototype.hasOwnProperty.call(names, w.k)) { if (!places.has(w.k)) places.set(w.k, { n: 0, at: sec.label }); places.get(w.k).n += 1; }
  for (const [k, name] of Object.entries(names)) {
    tot.name_keys += 1;
    const pool = store.readingPool(store.routesFor(k) || [], "oldest");
    const g = pool.find((x) => readingKey(x.text) === readingKey(name));
    if (!g) { tot.no_pill_prints_it += 1; continue; }
    if (g.text === name) { tot.same_text += 1; continue; }
    tot.other_text += 1; tot.words_other_text += (places.get(k) || { n: 0 }).n;
    if (casesBook && f === `${casesBook}.bin`) for (const sec of z.sections || []) for (const w of sec.words || []) if (w && w.k === k && !w.w && typeof w.s === "string") cases.add(w.s);
    if (ex.length < LIST) ex.push(`${f.replace(".bin", "")} ${(places.get(k) || {}).at} ${k}: the name ${JSON.stringify(name)}, the pill's text ${JSON.stringify(g.text)}, first of the pool ${JSON.stringify(pool[0].text)}`);
  }
}
console.log(JSON.stringify(tot));
if (casesOut) { const { writeFileSync } = await import("node:fs"); writeFileSync(casesOut, JSON.stringify([...cases])); console.log(`${casesBook}: ${cases.size} surfaces -> ${casesOut}`); }
for (const e of ex) console.log("  " + e);
