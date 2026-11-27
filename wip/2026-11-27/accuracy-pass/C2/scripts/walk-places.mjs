// Read-only walk of every word of the 39 books: where a row of the four sources stands under the word's key or a
// piece's key, and what each gate of the card says of it (the entry, the pointing, the stem, the name), without a browser.
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [BASE, OUT] = process.argv.slice(2);
const T = (f) => import(join(BASE, "tools", f));
const { openRouteStore, factsOf } = await T("gloss-store-v1.mjs");
const { placeEntry, placeTags, bdbEntriesAt, entryVerdict } = await T("entry-gate-v1.mjs");
const { gradeRow, heldByPointing } = await T("pointing-grade-v1.mjs");
const { isOtherStem } = await T("stem-family-v1.mjs");
const { zonesServed } = await T("zones-on-disk-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(BASE, "data", "route-store"));
const MINE = new Set(["M5", "M9", "M14", "M46"]);
const stat = {}; for (const m of MINE) stat[m] = { pairs: 0, stands: 0, other_entry: 0, by_pointing: 0, by_stem: 0, by_name: 0, note_no_pill: 0, places_with_a_row: 0, places_with_a_standing_row: 0, words_with_a_standing_row_under_the_word_key: 0, entry_this: 0, entry_none: 0, entry_no_place_tag: 0 };
const firstPlaces = new Map();  // m|k|rank|text -> [places]
const perVerse = [];            // for M14: book, label, n, key, entries of standing rows / withheld rows
let words = 0; const books = [];
for (const z of zonesServed(join(BASE, "data", "zones"))) {
  if (!existsSync(join(BASE, "data", "zones", `${z}.lattice.bin`))) continue;
  const zone = gz(join(BASE, "data", "zones", `${z}.bin`));
  if (!(zone.route === "MAM_RESTORE_V5_SERVE__POSITIONAL_PROTOTYPE")) continue;
  const side = gz(join(BASE, "data", "zones", `${z}.lattice.bin`));
  books.push(z);
  for (const [si, sec] of (zone.sections || []).entries()) {
    let n = 0;
    for (const [e, w] of (sec.words || []).entries()) {
      if (w.mark) continue;
      n += 1; words += 1;
      const keys = [[w.k, "word"], ...(Array.isArray(w.pg) ? w.pg.filter((p) => p && p.k && p.k !== w.k).map((p) => [p.k, "piece"]) : [])];
      const seenM = new Set(), standM = new Set(), standWordM = new Set();
      const tags = placeTags(w), place = tags ? placeEntry(tags) : null;
      for (const [k, how] of keys) {
        if (typeof k !== "string" || !k) continue;
        const all = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
        if (!all.some((r) => MINE.has(String(r[3])))) continue;
        const facts = all.map(factsOf);
        const bdbHere = place ? bdbEntriesAt(place, facts) : null;
        const verdicts = all.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
        const grades = all.map((r) => gradeRow(r, w.s)), attested = grades.includes("m");
        const gr = (side.grades || {})[w.s], rs = (side.stems || {})[k] || null;
        all.forEach((row, i) => {
          const m = String(row[3]); if (!MINE.has(m)) return;
          const s = stat[m]; s.pairs += 1; seenM.add(m);
          const f = facts[i] || {};
          let out = "stands";
          if (f.opens) out = "note_no_pill";
          else if (verdicts[i] === "other") out = "other_entry";
          else if (f.name && !w.np) out = "by_name";
          else if (!(verdicts[i] === "this" || !attested || !heldByPointing(grades[i]))) out = "by_pointing";
          else if (rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st)) out = "by_stem";
          s[out] += 1;
          if (!place) s.entry_no_place_tag += 1; else if (verdicts[i] === "this") s.entry_this += 1; else if (verdicts[i] !== "other") s.entry_none += 1;
          if (out === "stands") {
            standM.add(m); if (how === "word") standWordM.add(m);
            const id = `${m}\u0001${k}\u0001${row[0]}\u0001${row[1]}`;
            const l = firstPlaces.get(id) || firstPlaces.set(id, []).get(id);
            if (l.length < 4 && !l.some((p) => p.book === z)) l.push({ book: z, label: sec.label, si, e, n, how });
          }
          if (m === "M14") perVerse.push([z, sec.label, n, how, k, (f.n || []).join("+"), out, row[0], String(row[1]).slice(0, 40)].join("\t"));
        });
      }
      for (const m of seenM) stat[m].places_with_a_row += 1;
      for (const m of standM) stat[m].places_with_a_standing_row += 1;
      for (const m of standWordM) stat[m].words_with_a_standing_row_under_the_word_key += 1;
    }
  }
}
writeFileSync(join(OUT, "walk-stats.json"), JSON.stringify({ books: books.length, words, stat }, null, 1));
const lines = []; for (const [id, l] of firstPlaces) { const [m, k, rank, text] = id.split("\u0001"); lines.push(JSON.stringify({ m, k, rank: Number(rank), text, places: l })); }
writeFileSync(join(OUT, "standing-rows.jsonl"), lines.join("\n") + "\n");
writeFileSync(join(OUT, "m14-row-places.tsv"), perVerse.join("\n") + "\n");
console.log(JSON.stringify({ books: books.length, words, stat }, null, 1));
