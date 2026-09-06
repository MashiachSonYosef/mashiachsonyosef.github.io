// GUARDS: kq-rule-v1-both-halves-as-written
//
// Where the source writes a ketiv and a qere it writes both, and its licence
// is the licence of that pair: MAM prints the qere in square brackets and
// the ketiv in parentheses, in the running text, as the text. A build that
// selects one half has not shortened the text — it has substituted a text
// the source never released under that licence. This happened: an earlier
// acquisition selected ketiv or qere and dropped the other, and every
// Hebrew work built from it was withdrawn on 2026-08-23 rather than stand
// misattributed. CORPUS-DEFECT-2026-08-22-markup-in-the-text.md decided the
// intake half — the pair arrives as a marked thing; this check holds every
// zone that arrives to it.
//
// The contract, for any zone whose Hebrew stands on MAM:
//   - emitted_from.kq_policy says "BOTH_HALVES_AS_WRITTEN"
//   - every paired word carries both halves, brackets as the source wrote
//     them — the qere wearing its [ ], the ketiv its ( )
//   - a MAM zone carrying no pair in an entire book is a selection until
//     emitted_from.kq_none_attested names the record that says the book
//     truly has none
// And for every zone, MAM or not, today:
//   - no kq markup leaks into rendered text — a reader is never shown
//     "mam-kq" as if the provider wrote it
// No served zone stands on MAM yet; the MAM tier says so and waits. The
// law lands before the text returns, which is the right order.
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const zones = zonesOnDisk(join(HERE, "..", "data", "zones"));
if (!zones.length) { console.log("SKIPPED — no zone on disk to hold to the rule"); process.exit(3); }

const textOfWord = (w) => (w.w ? w.w.map((r) => r.t || "").join("") : (w.t || ""));
// A site sealed as ONE row carries both branches in its own surface — the
// ketiv in parentheses, the qere in brackets, in either order — and its kq
// record names each branch bare. "As written" is then judged on the surface:
// each branch the record names must stand in the surface wrapped as the
// source wraps it, and a branch the record says the source does not write
// (a ketiv the tradition does not read, a qere with no ketiv) is allowed to
// be absent only when the record says so. The pair is then reshaped into the
// two-row form the law below reads.
const oneRowAsWritten = (w) => {
  const s = String(w.s || ""), kq = w.kq;
  const k = kq.k == null ? null : (s.includes(`(${kq.k})`) ? `(${kq.k})` : "");
  const q = kq.q == null ? null : (s.includes(`[${kq.q}]`) ? `[${kq.q}]` : "");
  // a single-branch site the record names as such is whole when the branch
  // it does carry stands as written; a missing half the record does not
  // explain is a selection
  const only = (kq.order === "KETIV_ONLY" && q === null && !!k) || (kq.order === "QERE_ONLY" && k === null && !!q);
  return { k: k === null ? "" : k, q: q === null ? "" : q, only, finding: kq.finding };
};
const isMam = (z) => {
  const receipts = JSON.stringify(z.emitted_from?.license_receipts || "") + JSON.stringify(z.emitted_from?.acquisition || "");
  return /miqra according to the masorah|he\.wikisource/i.test(receipts);
};

let mamSeen = 0;
for (const slug of zones) {
  const z = JSON.parse(gunzipSync(readFileSync(join(HERE, "..", "data", "zones", `${slug}.bin`))).toString("utf8"));
  // the live tier: nobody's markup is ever shown to a reader as text
  let leaked = 0;
  for (const sec of z.sections || []) for (const w of sec.words || [])
    if (/mam-kq|class="/.test(textOfWord(w))) leaked += 1;
  check(`${slug}: no kq markup leaks into the rendered text`, leaked === 0,
    leaked ? `${leaked} word(s) carry markup as text` : "clean");

  if (!isMam(z)) continue;
  mamSeen += 1;
  // the MAM tier: the pair, both halves, as written
  check(`${slug}: the zone declares how it carries the pair`,
    z.emitted_from?.kq_policy === "BOTH_HALVES_AS_WRITTEN", String(z.emitted_from?.kq_policy || "undeclared"));
  const pairs = [];
  for (const sec of z.sections || []) for (const w of sec.words || [])
    if (w.kq) pairs.push(w.kq.rows === 1 && w.kq.convention === "ONE_ROW_PARENS_KETIV_BRACKETS_QERE" ? oneRowAsWritten(w) : w.kq);
  // As written, under the stream's own convention (kq.convention, named by
  // the builder): the ketiv in parentheses (the MAM presentation bundle) or
  // bare and unvocalized (the sealed body stream, genesis-8-17); the qere in
  // square brackets and vocalized. (An unbracketed convention was tried on
  // 2026-09-02 and withdrawn the same day: such streams flatten the Masorah's
  // annotation words to bare tokens.) What is refused is a half missing, a
  // ketiv retyped with vowels it never had, or a qere unbracketed or bare.
  const KETIV_BARE = /^[\u05D0-\u05EA\u05BE\u05F3\u05F4]+$/u, VOWEL = /[\u0591-\u05C7]/u;
  const broken = pairs.filter((p) => !p || (!p.only && (!p.q || !p.k
    || !(/\(.+\)/.test(p.k) || KETIV_BARE.test(p.k))
    || !(/\[.+\]/.test(p.q) && VOWEL.test(p.q)))));
  const findings = pairs.filter((p) => p && p.finding).length;
  check(`${slug}: every pair carries both halves as written (${pairs.length} pair${pairs.length === 1 ? "" : "s"})`,
    broken.length === 0, broken.length ? `${broken.length} selected, unbracketed, or a half not as written` : `whole${findings ? ` · ${findings} carry a finding the zone prints` : ""}`);
  if (!pairs.length)
    check(`${slug}: a MAM book with no pair names the record that attests it`,
      !!z.emitted_from?.kq_none_attested, "no pairs and no attestation — a selection until a record says otherwise");
}
if (!mamSeen) console.log("  --    no served zone stands on MAM; the pair tier waits for the text to return");

console.log();
process.exit(bad ? 1 : 0);
