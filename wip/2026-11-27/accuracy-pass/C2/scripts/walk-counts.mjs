// Second read-only walk: for every row of the four sources, at how many words of the 39 books it stands on the card
// as the card opens. The card opens on STEP's division: a word of one piece is asked under its own key, a word of
// several pieces under the key of its core piece (seen on the page: Ezra 5:1 word 13). The entry gate, the names gate
// and the stem gate are asked as the page asks them; the pointing gate is asked only where the key is the word's own
// (a piece's pointed letters are not in the zone), and it can only touch a row with no entry number.
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
const cnt = new Map();   // row -> [k, stands_this, stands_none, none_at_a_piece_key(pointing not asked), other, pointing, stem, name, first place]
const per = {}; for (const m of MINE) per[m] = { words_where_a_row_is_asked: 0, words_where_a_row_stands: 0, words_where_every_row_is_withheld: 0, pairs_asked: 0, pairs_standing: 0 };
let words = 0, onePiece = 0, several = 0, noCore = 0;
const pairs = [];   // the unabridged BDB's and the Open Scriptures BDB's standing rows, place by place, for their verse references
for (const z of zonesServed(join(BASE, "data", "zones"))) {
  if (!existsSync(join(BASE, "data", "zones", `${z}.lattice.bin`))) continue;
  const zone = gz(join(BASE, "data", "zones", `${z}.bin`));
  if (!(zone.route === "MAM_RESTORE_V5_SERVE__POSITIONAL_PROTOTYPE")) continue;
  const side = gz(join(BASE, "data", "zones", `${z}.lattice.bin`));
  for (const [si, sec] of (zone.sections || []).entries()) { let n = 0; for (const [e, w] of (sec.words || []).entries()) {
    if (w.mark) continue; n += 1; words += 1;
    const pg = Array.isArray(w.pg) ? w.pg.filter((p) => p && typeof p.k === "string" && p.k) : [];
    let keys;
    if (pg.length <= 1) { keys = [[w.k, true]]; onePiece += 1; }
    else { const core = pg.filter((p) => p.r === "core"); several += 1; if (!core.length) { noCore += 1; keys = [[w.k, true]]; } else keys = core.map((p) => [p.k, p.k === w.k]); }
    const tags = placeTags(w), place = tags ? placeEntry(tags) : null;
    const asked = new Set(), stood = new Set();
    for (const [k, own] of keys) {
      if (typeof k !== "string" || !k) continue;
      const all = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
      if (!all.some((r) => MINE.has(String(r[3])))) continue;
      const facts = all.map(factsOf);
      const bdbHere = place ? bdbEntriesAt(place, facts) : null;
      const verdicts = all.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
      const grades = own ? all.map((r) => gradeRow(r, w.s)) : null, attested = own ? grades.includes("m") : false;
      const gr = (side.grades || {})[w.s], rs = (side.stems || {})[k] || null;
      all.forEach((row, i) => {
        const m = String(row[3]); if (!MINE.has(m)) return;
        const f = facts[i] || {};
        if (f.opens) return;
        const c = cnt.get(row) || cnt.set(row, [k, 0, 0, 0, 0, 0, 0, 0, ""]).get(row);
        asked.add(m); per[m].pairs_asked += 1;
        let at;
        if (verdicts[i] === "other") at = 4;
        else if (f.name && !w.np) at = 7;
        else if (own && verdicts[i] !== "this" && attested && heldByPointing(grades[i])) at = 5;
        else if (rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st)) at = 6;
        else at = verdicts[i] === "this" ? 1 : (own ? 2 : 3);
        c[at] += 1;
        if (at <= 3) { stood.add(m); per[m].pairs_standing += 1; if (!c[8]) c[8] = `${z} ${sec.label}:${n} si${si} e${e}`; if (m === "M46" || m === "M5") pairs.push([m, z, sec.label, n, k, row[0], String(row[1]).replace(/\t/g, " ")].join("\t")); }
      });
    }
    for (const m of asked) { per[m].words_where_a_row_is_asked += 1; if (stood.has(m)) per[m].words_where_a_row_stands += 1; else per[m].words_where_every_row_is_withheld += 1; }
  } }
}
const lines = ["m\tkey\trank\tstands_this_entry\tstands_no_entry_word_key\tno_entry_at_a_piece_key_pointing_not_asked\tother_entry\tby_pointing\tby_stem\tby_name\tfirst_place\troute"];
for (const [row, c] of cnt) lines.push([row[3], c[0], row[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], String(row[1]).replace(/\t/g, " ")].join("\t"));
writeFileSync(join(OUT, "row-place-counts.tsv"), lines.join("\n") + "\n");
writeFileSync(join(OUT, "bdb-standing-pairs.tsv"), pairs.join("\n") + "\n");
writeFileSync(join(OUT, "walk2-stats.json"), JSON.stringify({ words, words_of_one_piece: onePiece, words_of_several_pieces: several, of_those_with_no_core_piece: noCore, per }, null, 1));
console.log(JSON.stringify({ words, onePiece, several, noCore, per }, null, 1));
