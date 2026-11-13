// Synthesis lane · the rows of the dictionaries beside the store, as the page takes them into a card
// LEDGER: -
// no frame letter. It reads the dictionaries served beside the route store
// and writes nothing.
//
// THE ROWS BESIDE THE STORE, AS THE PAGE TAKES THEM.
//
// Jastrow and the Samaritan dictionary are served beside the route store
// (data/overlays/<id>/, each a store of its own shape: an index and 256
// shards keyed as the store keys). The page takes their rows into a card
// after the store's, and a row of theirs is a row like the store's
// (overlay-rule-v2): asked its own pointing where some row of the store
// points the word as the text does, and, since the stems extension, asked
// its stem. A check that counts what a card withholds has to count these rows
// too, and it counts them by the functions here, which say what the page
// says:
//
//   which rows   every row under the key in a dictionary beside the store; in
//                a dictionary that keeps lanes, only the rows of a lane the
//                owner ruled in (as the page filters them)
//   the pointing a row whose own headword is pointed otherwise than the word
//                is withheld, where the word is pointed and some row of the
//                STORE points it as the text does (the store's rows decide
//                whether the pointing is attested; the rows beside it are
//                not asked that)
//   the stem     of the rows the pointing leaves, a row whose known stems
//                share no family with the word's is another stem's
//
// The piece store and the span store also stand beside the route store; their
// rows are a place's own or a span's and no source names a stem for them, so
// they are not read here.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { gradeRow, isPointed } from "./pointing-grade-v1.mjs";
import { isOtherStem } from "./stem-family-v1.mjs";
import { stemsId } from "./stems-extension-v1.mjs";

/** The dictionaries beside the store under `readerDir`, each with its index and a reader of its rows under a key. */
export const openBesideTheStore = (readerDir) => {
  const home = join(readerDir, "data", "overlays");
  const out = [];
  for (const id of existsSync(home) ? readdirSync(home).sort() : []) {
    const dir = join(home, id);
    if (!existsSync(join(dir, "index.json")) || !existsSync(join(dir, "shards"))) continue;
    const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
    const ruled = index.lanes ? new Set(Object.entries(index.lanes).filter(([, l]) => l && l.standing === "ruled").map(([k]) => k)) : null;
    const shards = new Map();
    const shard = (name) => { if (!shards.has(name)) { const p = join(dir, "shards", `${name}.bin`); shards.set(name, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {}); } return shards.get(name); };
    const rowsFor = (key) => ((shard(createHash("sha256").update(key, "utf8").digest("hex").slice(0, 2))[key]) || [])
      .filter((row) => (index.m_sources || {})[row[3]] && (!ruled || !row[7] || (row[7].lanes || [row[7].lane]).some((l) => ruled.has(l))));
    out.push({ id, index, rowsFor });
  }
  return out;
};

/** Every row beside the store under a key, as the page takes them: dictionary by dictionary, each in its own order. */
export const rowsBeside = (beside, key) => beside.flatMap((b) => b.rowsFor(key));

/** The m ids that rest off for a reader who has set nothing: the sources the record of defaults names by key
 *  (data/source-defaults-v1.json), found in the indexes given (the store's, and those of the dictionaries beside it). */
export const restingOff = (readerDir, indexes) => {
  const p = join(readerDir, "data", "source-defaults-v1.json");
  const off = existsSync(p) ? Object.keys(JSON.parse(readFileSync(p, "utf8")).off || {}) : [];
  const out = new Set();
  for (const ix of indexes) for (const [m, s] of Object.entries((ix && ix.m_sources) || {})) if (s && off.includes(s.key)) out.add(String(m));
  return out;
};

/** Of the rows beside the store under a key, what the page keeps and what it withholds at a word: `surface` the
 *  word as the text points it, `attested` whether some row of the STORE points it so, `rowStems` the sidecar's
 *  stems under the key (or null), `wordStems` the word's stems (or null where it is not asked its stem), and
 *  `sourcesOff` the m ids the reader has off (a row of a source that is off is not asked at all, and is the source
 *  switches' to count: the page takes it out before it asks a row beside the store its pointing). */
export const besideAtAWord = (rows, { surface, attested, rowStems = null, wordStems = null, sourcesOff = null }) => {
  const on = sourcesOff && sourcesOff.size ? rows.filter((row) => !sourcesOff.has(String(row[3]))) : rows;
  const asked = !!(attested && surface && isPointed(surface));
  const left = asked ? on.filter((row) => gradeRow(row, surface) !== "x") : on;
  const ofAnotherStem = rowStems && wordStems ? left.filter((row) => isOtherStem(rowStems[stemsId(row[3], row[0], row[1])], wordStems)) : [];
  return { rows: rows.length, bySources: rows.length - on.length, byPointing: on.length - left.length, ofAnotherStem, kept: left.filter((row) => !ofAnotherStem.includes(row)) };
};
