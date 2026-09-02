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
    if (w.kq) pairs.push(w.kq);
  // As written, under the stream's own convention (kq.convention, named by
  // the builder): the ketiv in parentheses (the MAM presentation bundle) or
  // bare and unvocalized (the sealed body stream, genesis-8-17); the qere in
  // square brackets, or, where the stream writes no brackets, vocalized
  // after its bare ketiv (ruth-3-3). What is refused is a half missing, a
  // ketiv retyped with vowels it never had, or a qere with none.
  const KETIV_BARE = /^[\u05D0-\u05EA\u05BE\u05F3\u05F4]+$/u, VOWEL = /[\u0591-\u05C7]/u;
  const broken = pairs.filter((p) => !p || !p.q || !p.k
    || !(/\(.+\)/.test(p.k) || KETIV_BARE.test(p.k))
    || !(p.convention === "BARE_KETIV_THEN_VOCALIZED_QERE" ? VOWEL.test(p.q) && !/[[\]()]/.test(p.q) : /\[.+\]/.test(p.q)));
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
