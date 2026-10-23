#!/usr/bin/env node
// Synthesis lane · pointing-grade-rule-v1-a-row-is-graded-by-its-own-headwords-against-the-open-word
// LEDGER: -
// no frame letter. A record, not a change: nothing here is served.
//
// THE RECOUNT. The corpus lane's contract says the per-source grade from a
// row's own headwords differs from the merged lattice card's grade at 6.1%
// of row-at-served-entry slots — the lattice merged every source's headwords
// into one card and graded the card, and a per-row grade undoes that mesh.
// This walks every served book: for each pointed surface the lattice graded,
// every store row under its key, graded twice — by the row's own headwords
// (pointing-grade-v1) and by the lattice card it fingerprints to — and counts
// where the two differ, on two axes: unique pointed surfaces × rows, and
// served entries (the words on the page carrying that surface) × rows. The
// crossing table says which way they differ. A row without headwords (a v1
// store) is counted apart and compared nowhere.
//
// Run: node tools/emit-pointing-grade-recount-v1.mjs [--store data/route-store] [--out data/pointing-grade-recount-v1.json]
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { gradeRow, POINTING_GRADE_RULE_ID } from "./pointing-grade-v1.mjs";
import { fnv1a } from "./lattice-lib-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";

export const recountBook = (store, b, cross = {}) => {
  const side = JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.lattice.bin`)).toString("utf8"));
  const zone = JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.bin`)).toString("utf8"));
  // served entries: every word of every section carrying a pointed surface,
  // and a kq word's other branch as an entry of its own
  const posOf = new Map();
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    if (typeof w.s === "string") posOf.set(w.s, (posOf.get(w.s) || 0) + 1);
    for (const br of w.w || []) if (br && typeof br.s === "string" && br.s !== w.s) posOf.set(br.s, (posOf.get(br.s) || 0) + 1);
  }
  const bk = { surfaces: 0, surface_slots: 0, surface_differ: 0, entry_slots: 0, entry_differ: 0, rows_without_headwords: 0, rows_not_in_lattice: 0 };
  for (const [s, gr] of Object.entries(side.grades || {})) {
    const lat = side.routes[gr.k]; if (!lat) continue;
    bk.surfaces += 1;
    const fp = new Map(lat.f.map((f, i) => [f, i]));
    const n = posOf.get(s) || 0;
    for (const row of store.routesFor(gr.k) || []) {
      const src = store.index.m_sources[row[3]]; if (!src) continue;
      const sg = gradeRow(row, s);
      if (sg === "-") { bk.rows_without_headwords += 1; continue; }
      const i = fp.get(fnv1a(`${row[1]}|${src.label}`));
      if (i === undefined) { bk.rows_not_in_lattice += 1; continue; }
      const lg = gr.g[i] || "-";
      bk.surface_slots += 1; bk.entry_slots += n;
      if (sg !== lg) { bk.surface_differ += 1; bk.entry_differ += n; const key = `${lg}>${sg}`; cross[key] = (cross[key] || 0) + 1; }
    }
  }
  return bk;
};

// a library to the guard, a program at the shell: nothing below runs on import
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
  const STORE = arg("--store", "data/route-store"), OUT = arg("--out", "data/pointing-grade-recount-v1.json");
  const store = openRouteStore(STORE);
  const books = {}; const cross = {};
  for (const b of zonesServed()) { books[b] = recountBook(store, b, cross); console.log(`${b}: surfaces×rows ${books[b].surface_differ.toLocaleString()} of ${books[b].surface_slots.toLocaleString()} differ · entries×rows ${books[b].entry_differ.toLocaleString()} of ${books[b].entry_slots.toLocaleString()}`); }
  const sum = (k) => Object.values(books).reduce((a, x) => a + x[k], 0);
  const totals = Object.fromEntries(["surfaces", "surface_slots", "surface_differ", "entry_slots", "entry_differ", "rows_without_headwords", "rows_not_in_lattice"].map((k) => [k, sum(k)]));
  const rec = {
    schema_version: "POINTING_GRADE_RECOUNT_V1", rule: POINTING_GRADE_RULE_ID, on: new Date().toISOString().slice(0, 10),
    store: STORE, store_version: store.index.store_version, store_schema: store.index.schema_version,
    axes: { surface_slots: "unique pointed surfaces the lattice graded × store rows under their key that carry headwords and fingerprint to a lattice card", entry_slots: "the same, each surface weighted by the words on the page carrying it (a kq word's other branch counted as its own entry)" },
    what_differs: "the row's own grade (pointing-grade-v1, from [6] against the surface) against the lattice card's grade at the same (surface, text | source)",
    totals: { ...totals, surface_differ_share: totals.surface_slots ? Number((100 * totals.surface_differ / totals.surface_slots).toFixed(3)) : null, entry_differ_share: totals.entry_slots ? Number((100 * totals.entry_differ / totals.entry_slots).toFixed(3)) : null },
    crossing: cross, crossing_key: "lattice grade > row grade (m match · n silent · x otherwise)",
    books,
    what_this_does_not_say: ["that either grade is wrong — the lattice graded a merged card, the row grades one source, and the toggle is built to undo the merge", "which of the two the reader sees under keep — neither; the grade acts only under only and the lattice orders", "anything about a row without headwords — a v1 row is compared nowhere and counted apart"],
  };
  writeFileSync(OUT, JSON.stringify(rec, null, 1));
  console.log(`ALL surfaces×rows ${totals.surface_differ.toLocaleString()} of ${totals.surface_slots.toLocaleString()} differ (${rec.totals.surface_differ_share}%) · entries×rows ${totals.entry_differ.toLocaleString()} of ${totals.entry_slots.toLocaleString()} (${rec.totals.entry_differ_share}%) · rows without headwords ${totals.rows_without_headwords.toLocaleString()} · crossing ${JSON.stringify(cross)} · ${OUT}`);
}
