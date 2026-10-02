#!/usr/bin/env node
// Synthesis lane · toggle-projection-rule-v1-a-toggle-is-a-ledger-projected-over-a-zones-own-positions
//
// THE PIPELINE EVERY TOGGLE FOLLOWS (this file is the first one through it):
//
//   1. Moses counts. A toggle's ledger lives at r2:mishkan/moses-ledgers/
//      toggle-builds-v1/<toggle>/, one row per position, joined on
//      book + ref + the position's order inside its verse. Candidate-only.
//   2. This lane projects. A tool like this one reads ONE zone and ONE ledger,
//      joins on the zone's own positions, and writes ANOTHER zone that carries
//      the toggle's answer on each word plus a receipt in emitted_from.toggles.
//      Nothing is patched in place; the write is typed under the single-pass
//      exemption so the receipts check counts it rather than faulting it.
//   3. regloss re-projects the store over the zone's keys, which now include
//      the toggle's keys, so the line can answer under them without a fetch.
//   4. zone.html carries one entry per toggle in TOGGLES: id, label, positions,
//      what makes it live (the layer on the zone), what it waits on when it is
//      not, and the one function that applies it. The rail draws itself from
//      that registry. A toggle with no layer on this zone is drawn dead, with
//      its reason, because a rail that hides the questions it cannot answer
//      teaches that they were never asked.
//   5. The owner rules on the toggle's open questions (README-v1.md on R2
//      lists them per toggle); the ruling is recorded on the projection's
//      receipt, and the rail row goes live.
//
// THIS TOGGLE · look up by: the form / the headword. Moses's form-or-lemma-v2
// aligns MACULA's lemma and TAHOT's root tag to every ON position (both
// CC BY 4.0). Where the two witnesses agree on the headword, the word carries
// it: h (the headword's consonantal key), hp (the pointed headword). Where
// they differ — two dictionary conventions for one word — the word carries
// nothing and the receipt counts it: the page does not pick between
// witnesses. 63% of positions have a headword key that differs from their
// form key, and at 156,794 of them the headword reaches an English the form
// does not; the reader's toggle is that difference.
//
// THE JOIN. Rows are matched to the zone's own positions by verse, in order:
// the n-th ON word of a verse in the zone is the n-th row of that verse in
// the ledger, and the match is PROVED by the form key — the ledger's form_key
// must equal the zone's k at every position of the verse, or the whole verse
// is held and counted, never patched around. A ketiv-qere site is one
// position with two keys on the zone; it is matched when the row's form key
// is either of them.
//
// Run: node tools/project-toggle-headword-v1.mjs --zone data/zones/genesis.bin
//        --ledger <word-lemma-v1.csv.gz> --stamp YYYY-MM-DD --out build/toggles/genesis.bin
import { readFileSync, writeFileSync, createReadStream, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";

export const TOGGLE_RULE_ID = "toggle-projection-rule-v1-a-toggle-is-a-ledger-projected-over-a-zones-own-positions";
const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const zonePath = arg("--zone"), ledgerPath = arg("--ledger"), outPath = arg("--out"), stamp = arg("--stamp");
for (const [f, v] of [["--zone", zonePath], ["--ledger", ledgerPath], ["--out", outPath], ["--stamp", stamp]])
  if (!v) { console.error(`missing ${f}`); process.exit(2); }

const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
const slug = zone.work_slug || zonePath.split("/").pop().replace(/\.bin$/u, "");

// ---- the ledger, this book's rows only, grouped by verse in file order -----
const sha256Stream = (path) => new Promise((resolve, reject) => {
  const h = createHash("sha256");
  createReadStream(path).on("data", (c) => h.update(c)).on("end", () => resolve(h.digest("hex"))).on("error", reject);
});
const readLedger = async (path, book) => {
  const rl = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  let hi = null; const byRef = new Map(); let rows = 0, books = new Set();
  for await (const line of rl) {
    if (!line) continue;
    const f = line.split(",");
    if (!hi) { hi = Object.fromEntries(f.map((x, i) => [x, i])); continue; }
    books.add(f[hi.book]);
    if (f[hi.book] !== book) continue;
    rows += 1;
    const ref = f[hi.ref];
    if (!byRef.has(ref)) byRef.set(ref, []);
    byRef.get(ref).push({
      form_key: f[hi.form_key], surface: f[hi.surface],
      macula: f[hi.macula_lemma_key], macula_pointed: f[hi.macula_lemma], tahot: f[hi.tahot_lemma_key],
      agree: f[hi.agree], lemma_cards: Number(f[hi.lemma_cards] || 0), new_cards: Number(f[hi.new_cards] || 0),
    });
  }
  return { byRef, rows, books: [...books].sort() };
};

const ledger = await readLedger(ledgerPath, slug);
if (!ledger.rows) {
  console.error(`LEDGER_HAS_NO_ROWS_FOR ${slug}; books in the ledger: ${ledger.books.join(" ")}`);
  process.exit(1);
}

// ---- the join, verse by verse, proved by the form key --------------------
const keysOf = (w) => (w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []);
const stats = { verses: 0, verses_joined: 0, verses_held: 0, verses_absent_from_ledger: 0, words_on: 0,
  words_with_headword: 0, headword_differs_from_form: 0, witnesses_differ: 0, headword_reaches_more: 0,
  held_examples: [] };
for (const sec of zone.sections || []) {
  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
  stats.verses += 1; stats.words_on += on.length;
  const rows = ledger.byRef.get(sec.label);
  if (!rows) { stats.verses_absent_from_ledger += 1; continue; }
  const proved = rows.length === on.length && on.every((w, i) => keysOf(w).includes(rows[i].form_key));
  if (!proved) {
    stats.verses_held += 1;
    if (stats.held_examples.length < 6) stats.held_examples.push(`${sec.label}: zone ${on.length} words, ledger ${rows.length} rows${rows.length === on.length ? `, first mismatch at ${on.findIndex((w, i) => !keysOf(w).includes(rows[i].form_key)) + 1}` : ""}`);
    continue;
  }
  stats.verses_joined += 1;
  on.forEach((w, i) => {
    const r = rows[i];
    // a position with two forms on it (a ketiv-qere site) keeps its forms:
    // a headword is one entry, and the page will not say which half it is for
    if (w.w && w.w.length > 1) { stats.pairs_kept_as_forms = (stats.pairs_kept_as_forms || 0) + 1; return; }
    if (r.agree !== "same" || !r.macula) { if (r.agree !== "same") stats.witnesses_differ += 1; return; }
    w.h = r.macula; w.hp = r.macula_pointed;
    stats.words_with_headword += 1;
    if (r.macula !== r.form_key) stats.headword_differs_from_form += 1;
    if (r.new_cards > 0) stats.headword_reaches_more += 1;
  });
}

// ---- the receipt, typed ---------------------------------------------------
const ef = zone.emitted_from = zone.emitted_from || {};
ef.toggles = ef.toggles || {};
ef.toggles.headword = {
  rule: TOGGLE_RULE_ID,
  toggle: "look up by · the form / the headword",
  source: { path: ledgerPath.split("/").pop(), bytes: statSync(ledgerPath).size, sha256: await sha256Stream(ledgerPath),
    ledger: "moses-ledgers/toggle-builds-v1/form-or-lemma-v2/word-lemma-v1.csv.gz", witnesses: "MACULA lemma (CC BY 4.0) + TAHOT root tag (CC BY 4.0)", candidate_only: true },
  join: "verse by verse, in order, proved by form_key == k at every position; a verse that does not prove is held whole",
  projected_on: stamp,
  projected_by: "tools/project-toggle-headword-v1.mjs",
  counts: { ...stats },
  what_the_word_carries: "h: the headword's consonantal key, hp: the pointed headword — only where both witnesses agree; where they differ the word carries nothing and is counted under witnesses_differ",
  rulings_owed: "none for this toggle; the headword is imported, not sorted (the order INSIDE the headword's stack is lemma-sort, a separate projection)",
};
{
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/project-toggle-headword-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`) : me;
  // the receipts check names a mark by its box: emitted_from.<key>
  for (const f of ["emitted_from.toggles"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = me; }
  const why = "the look-up-by toggle is Moses's headword ledger projected over this zone's own positions";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : `${pb.why}; ${why}`) : why;
  const exp = "with this zone's rebuild by a build-zone run that projects the toggle ledgers in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : `${pb.expires}; ${exp}`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}

const body = JSON.stringify(zone);
writeFileSync(outPath, gzipSync(Buffer.from(body, "utf8"), { level: 9 }));
const s = stats;
console.log(`${outPath} · ${s.words_with_headword.toLocaleString()} of ${s.words_on.toLocaleString()} words carry a headword · ${s.headword_differs_from_form.toLocaleString()} differ from their form · ${s.headword_reaches_more.toLocaleString()} reach an English the form lacks`);
console.log(`  verses: ${s.verses_joined} joined · ${s.verses_held} held (form keys did not prove) · ${s.verses_absent_from_ledger} absent from the ledger · witnesses differ at ${s.witnesses_differ} words`);
if (s.held_examples.length) console.log(`  held: ${s.held_examples.join(" | ")}`);
