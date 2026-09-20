#!/usr/bin/env node
// Synthesis lane · piece-gloss-rule-v1-a-piece-reads-what-its-source-said-at-this-position-not-what-the-key-means-in-general
//
// THE SOURCE'S OWN ENGLISH FOR EACH PIECE, CARRIED TO THE POSITION.
//
// When a reader opens a word the source divides — B + ARMENOTI + HEM — the
// card has until now looked each piece up in the route store BY KEY. On a
// whole word that is right. On a one-letter piece it is a disaster: the key
// for the letter VAV returns an 1890 concordance's list of every English word
// that letter ever helped render, so the conjunction "and" reads "describe".
// Six of the ten commonest pieces in our live cuts read as nonsense that way,
// and 1,419 of the 1,692 openable cuts contain at least one of them.
//
// The fix is not a better sort. Ordering the piece lane by the store's own
// rank would give a generic answer that happens to be less wrong — VAV would
// say "and" because "and" is rank 2 — and it would still be the key's general
// meaning rather than a statement about this position. The corpus lane put it
// exactly right: carrying the source's gloss gives what the source said about
// THIS position, and the difference is not cosmetic. The article HE is "the"
// at 22,250 positions and "her" at 1,111. No table keyed by letter can tell
// those apart; only the position can.
//
// So this projects the corpus lane's piece-gloss column onto the served zones,
// and the card reads the gloss off the word rather than out of the store.
//
// THE JOIN, AND WHY IT IS THIS ONE. Each record carries `book`, `ref`, a
// surface, and `j` — a running word index across the whole book, one-based,
// counting every word the zone carries including the sof-pasuq. The obvious
// key of book + ref + surface does NOT work: 1,485 records collide, because
// the same surface can stand twice in one verse. The running index does, and
// it was checked rather than assumed: 144,854 of 144,854 records land on a
// word whose surface AND whose verse reference both agree, in all 39 books.
// A record that does not land is dropped and counted, never guessed at.
//
// WHAT IS WRITTEN, AND WHAT IS NOT. Each word gains `pg`: the pieces in the
// source's own order, each with its key, its English, and which source said
// it. Nothing is removed and no reading is touched — the store's readings all
// still stand under the piece, in their own order, and the source's gloss is
// what leads. Priority, never a filter, which is the law every other lane on
// this site is held to.
//
// Run: node tools/project-piece-gloss-v1.mjs --col <piece-gloss-v1.jsonl.gz>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { zonesServed } from "./zones-on-disk-v1.mjs";

export const PIECE_GLOSS_RULE_ID = "piece-gloss-rule-v1-a-piece-reads-what-its-source-said-at-this-position-not-what-the-key-means-in-general";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };

/** the records of one book, indexed by the running word position they name */
export function byPosition(records) {
  const m = new Map();
  for (const r of records) m.set(r.j, r);
  return m;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const COL = arg("--col");
  if (!COL || !existsSync(COL)) { console.error("missing --col <piece-gloss-v1.jsonl.gz>"); process.exit(2); }
  const DIR = arg("--zones", "data/zones");

  const byBook = new Map();
  for (const line of gunzipSync(readFileSync(COL)).toString("utf8").trim().split("\n")) {
    const r = JSON.parse(line);
    if (!byBook.has(r.book)) byBook.set(r.book, []);
    byBook.get(r.book).push(r);
  }

  let books = 0, landed = 0, dropped = 0, piecesWritten = 0, noGloss = 0;
  const bySrc = new Map();
  for (const z of zonesServed(DIR)) {
    const recs = byBook.get(z);
    if (!recs || !recs.length) continue;
    const path = `${DIR}/${z}.bin`;
    const zz = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    const flat = [];
    for (const sec of zz.sections || []) for (const w of (sec.words || [])) flat.push([w, sec.label]);
    const at = byPosition(recs);
    let wrote = 0, lost = 0;
    for (const [j, r] of at) {
      const e = flat[j - 1];
      // THE JOIN IS PROVED PER RECORD, not trusted because it proved in bulk.
      // A record whose surface or whose verse disagrees is dropped and said.
      if (!e || String(e[0].s) !== String(r.surface) || e[1] !== r.ref) { lost += 1; dropped += 1; continue; }
      const pg = (r.pieces || []).map((p) => {
        piecesWritten += 1;
        if (p.gloss === null || p.gloss === undefined || p.gloss === "") noGloss += 1;
        bySrc.set(p.src || "(none)", (bySrc.get(p.src || "(none)") || 0) + 1);
        return { k: p.k, g: p.gloss ?? null, s: p.src ?? null, r: p.role ?? null };
      });
      e[0].pg = pg;
      wrote += 1; landed += 1;
    }
    zz.piece_gloss = {
      rule: PIECE_GLOSS_RULE_ID,
      from: COL.split("/").pop(),
      joined_on: "book and the running one-based word index the column calls j, with the surface and the verse checked on every record",
      positions_written: wrote,
      positions_dropped: lost,
      says: "each piece carries the English its source used AT THIS POSITION; the store's readings for the piece still stand under it, and this only leads",
    };
    writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(zz)), { level: 9 }));
    books += 1;
  }
  const n = (v) => Number(v).toLocaleString();
  console.log(`${books} books written`);
  console.log(`  positions carrying a piece gloss: ${n(landed)}`);
  console.log(`  records dropped (join disagreed): ${n(dropped)}`);
  console.log(`  piece entries written:            ${n(piecesWritten)}  (${n(noGloss)} with no gloss of their own)`);
  console.log(`  by source: ${[...bySrc].map(([s, c]) => `${s} ${n(c)}`).join(" · ")}`);
}
