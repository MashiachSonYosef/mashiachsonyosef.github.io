// The live resting line at each place where the span store's leading row is graded otherwise or silent: does a
// joined line still stand there (one entry covering the run), and whose?
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [J, RL] = process.argv.slice(2);
const cache = new Map();
const secs = (book) => { if (!cache.has(book)) { const R = JSON.parse(gunzipSync(readFileSync(`${RL}/${book}.json.gz`)).toString("utf8")); cache.set(book, new Map(R.sections)); } return cache.get(book); };
const T = { otherwise: { places: 0, joined_stands: 0, word_by_word: 0 }, silent: { places: 0, joined_stands: 0, word_by_word: 0 } };
const ex = { otherwise: [], silent: [] };
for (const line of readFileSync(J, "utf8").split("\n")) {
  if (!line) continue;
  const o = JSON.parse(line);
  const g = o.rows[0].grade;
  if (g !== "otherwise" && g !== "silent") continue;
  const L = secs(o.book).get(o.ref) || [];
  // the zone's entries count marks too; find entries overlapping the run's word span by index (words 1-based)
  const a = o.w[0] - 3, b = o.w[o.w.length - 1] + 1;
  const hit = L.filter(([f, n]) => f <= b && f + n - 1 >= a);
  const joined = hit.some(([f, n]) => n > 1);
  T[g].places += 1; T[g][joined ? "joined_stands" : "word_by_word"] += 1;
  if (ex[g].length < 400) ex[g].push(`${joined ? "JOINED" : "words "} ${o.book} ${o.ref} ${o.key} lead ${o.rows[0].m}: ${hit.map((h) => `«${h[2]}» ${h[3]}`).join(" · ")}`);
}
console.log(JSON.stringify(T));
for (const g of ["otherwise", "silent"]) { console.log(`\n== ${g} (joined lines first)`); for (const e of ex[g].sort().slice(0, 30)) console.log(" ", e); }
