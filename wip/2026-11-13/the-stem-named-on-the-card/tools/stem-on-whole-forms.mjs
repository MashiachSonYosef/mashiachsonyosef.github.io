// Words the place's sources divide (a prefix and a stem, say), whose WHOLE form the store also answers for: at how
// many such places does the stem gate withhold a store row from the whole form's pool, after the pointing has
// withheld its own? Those are the places where the card must say the stem's count on the whole-form division.
// Counted over the served books whose sidecar carries the binyan ledger, with the gate's own functions. Prints the
// totals and the first places, so one can be pressed.
// node stem-on-whole-forms.mjs <reader dir> [how many places to list]
// It measures; it changes nothing.
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [reader, many = "8"] = process.argv.slice(2);
const at = (f) => import(pathToFileURL(join(reader, "tools", f)).href);
const { gradeRow, isPointed } = await at("pointing-grade-v1.mjs");
const { isOtherStem } = await at("stem-family-v1.mjs");
const { openRouteStore } = await at("gloss-store-v1.mjs");
const { zonesServed } = await at("zones-on-disk-v1.mjs");
const store = openRouteStore(join(reader, "data", "route-store"));
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
const T = { books: 0, words: 0, divided: 0, divided_with_rows_on_the_whole_form: 0, where_the_stem_withholds: 0, rows_the_stem_withholds: 0, where_it_leaves_none: 0 };
const first = [];
for (const z of zonesServed(join(reader, "data", "zones"))) {
  const p = join(reader, "data", "zones", `${z}.lattice.bin`);
  if (!existsSync(p)) continue;
  const side = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  if (!(side.stems && side.binyan)) continue;
  T.books += 1;
  const zone = JSON.parse(gunzipSync(readFileSync(join(reader, "data", "zones", `${z}.bin`))).toString("utf8"));
  for (const sec of zone.sections || []) {
    let n = 0;
    for (const w of sec.words || []) {
      if (w.mark) continue;
      n += 1;
      T.words += 1;
      // a word the place's own pieces divide: its place carries more than one piece
      if (!w.k || !isPointed(w.s || "") || !Array.isArray(w.pg) || w.pg.length < 2) continue;
      T.divided += 1;
      const rows = rowsOf(w.k);
      if (!rows.length) continue;
      T.divided_with_rows_on_the_whole_form += 1;
      const g = side.grades[w.s];
      if (!g || !Array.isArray(g.st) || !g.st.length || !side.stems[w.k]) continue;
      const grades = rows.map((r) => gradeRow(r, w.s));
      const attested = grades.includes("m");
      const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
      const rs = side.stems[w.k];
      const other = kept.filter((r) => isOtherStem(rs[`${r[3]}\u0001${r[0]}\u0001${r[1]}`], g.st)).length;
      if (!other) continue;
      T.where_the_stem_withholds += 1; T.rows_the_stem_withholds += other;
      if (other === kept.length) T.where_it_leaves_none += 1;
      if (first.length < Number(many)) first.push(`${z} ${sec.label} word ${n} · ${g.st.join(" or ")} · ${rows.length} rows, ${rows.length - kept.length} withheld by the pointing, ${other} by the stem, ${kept.length - other} left`);
    }
  }
}
console.log(JSON.stringify(T));
for (const f of first) console.log("  ", f);
