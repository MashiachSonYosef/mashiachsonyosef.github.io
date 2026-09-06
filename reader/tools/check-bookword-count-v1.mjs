#!/usr/bin/env node
// GUARDS: count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one, bookword-measure-rule-v1-every-count-names-its-axis
// LEDGER: Y
// the measures of the address space: how many words, letters and verses a
// book has on each named axis, and what other men reached for the same book.
//
// THE STAMP, RECOUNTED.
//
// Every other check in this suite is one lane grading its own homework. It
// reads what we wrote and holds it to what we said we would write. That is
// worth having and it cannot catch a rule that is wrong, because a wrong rule
// applied consistently passes every internal check there is.
//
// This one is different in kind. It is checked against arithmetic somebody
// else did, by hand, centuries before any of this, and wrote down at the end
// of the book — and against another edition this project holds, counted the
// same way. The owner's ruling (2026-09-05): the count is our stamp of
// proof, not a gate. So nothing here withholds a book. What it holds is the
// stamp itself: the number on the page must be the number in the bytes, and
// the difference shown must be the difference.
//
// The measure is the BOOKWORD on a named axis (tools/bookword-measure-v1.mjs)
// — the read branch, each maqaf piece a word — because that is the axis the
// men who counted this text counted on (Pardes Yosef, 79,980 on the Torah).
// Twelve rules decide what is one, and six of them move the number:
//
//   rule 1  a qere/ketiv site is one C0; its words are counted on a branch
//   rule 2  a maqaf separates two words; it does not join one
//   rule 3  an abbreviation is one word, however many it stands for
//   rules 4, 5  setumah and petuchah are marks, not words
//   rule 6  the inverted nun's brackets are not words
//   rule 11 the paseq and the sof pasuq are marks, not words
//
// Get any of the six wrong and the number misses. Reading a maqaf as a joiner
// rather than a separator moves the Torah by 11,475 words out of 79,980 —
// this is not a delicate instrument. It is a very loud one. And a wrong rule
// does not produce a constant error: it produces an error proportional to
// how often that rule fires in that book, and no two books have the same
// mixture. Twenty-four books against twelve rules is more equations than
// unknowns. One book is a checksum. The set is a proof.
//
//   L1  every served zone that carries a stamp recounts from its own bytes
//       to the numbers the stamp states, on every axis
//   L2  every stamp row's figure is the witness record's figure for that
//       book, axis and witness, and its difference and verdict follow
//   L3  every served book of the restore route carries a stamp (a counted
//       work is served with its count on its page, never without)
//   L4  the witness record names its sources and their hashes
//
// What this does NOT prove: that the five rules which move no count are
// right — the number is blind to italics, shirah layout, and the scribal
// letters; nor that a witness is right — a difference is shown, not judged.
//
// Run: node tools/check-bookword-count-v1.mjs [--zones data/zones]
//      [--witnesses data/masorah-witnesses-v1.json] [--gate data/serve-gate-receipt-v1.json]
//      [--receipt data/count-stamp-receipt-v1.json] [--write] to rewrite the receipt
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { measureZone, MEASURE_RULE_ID } from "./bookword-measure-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : dflt; };
const ZONES = join(K3, arg("zones", "data/zones"));
const WITNESSES = join(K3, arg("witnesses", "data/masorah-witnesses-v1.json"));
const GATE = join(K3, arg("gate", "data/serve-gate-receipt-v1.json"));
const RECEIPT = join(K3, arg("receipt", "data/count-stamp-receipt-v1.json"));
const WRITE = process.argv.includes("--write");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const num = (x) => Number(x).toLocaleString("en-US");

const witnesses = existsSync(WITNESSES) ? JSON.parse(readFileSync(WITNESSES, "utf8")) : null;
const gate = existsSync(GATE) ? JSON.parse(readFileSync(GATE, "utf8")) : null;
const servedSet = gate ? new Set(gate.served || []) : null;
const zones = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin") && !/^[0-9a-f]{2}\.bin$/u.test(f) && f !== "w-top.bin").map((f) => f.replace(/\.bin$/u, "")).sort()
  : [];
const served = servedSet ? zones.filter((z) => servedSet.has(z)) : zones;

// ---- L1: the stamp is the bytes ------------------------------------------
const AXES = ["verses", "words", "words_written", "letters", "letters_read", "c0_on", "c0_off"];
const l1 = [], l2 = [], l3 = [];
const stamped = [];
const receiptBooks = {};
for (const slug of served) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${slug}.bin`))).toString("utf8")); }
  catch (e) { l1.push(`${slug}: the zone did not open — ${String(e.message || e).slice(0, 60)}`); continue; }
  const st = z.count_stamp;
  const isRestore = !!((z.emitted_from || {}).walk || {}).restore_oracle;
  if (!st) { if (isRestore) l3.push(slug); continue; }
  stamped.push(slug);
  const m = measureZone(z);
  const off = AXES.filter((a) => m[a] !== (st.ours || {})[a]).map((a) => `${a} bytes ${num(m[a])} vs stamp ${num((st.ours || {})[a])}`);
  if (st.measured_by !== MEASURE_RULE_ID) off.push(`measured_by ${st.measured_by}`);
  if (off.length) l1.push(`${slug}: ${off.join(", ")}`);
  // L2: theirs is the record's, delta and verdict follow
  const entry = witnesses && witnesses.books && witnesses.books[slug];
  const held = entry ? entry.rows : [];
  for (const r of (st.rows || [])) {
    if (r.verdict === "NO_WITNESS") {
      if (held.some((h) => h.measure === r.measure)) l2.push(`${slug}: ${r.measure} says no witness, the record holds one`);
      if (r.ours !== m[r.axis]) l2.push(`${slug}: ${r.measure} ours ${r.ours} vs bytes ${m[r.axis]}`);
      continue;
    }
    const h = held.find((x) => x.axis === r.axis && x.witness === r.witness && x.figure === r.theirs);
    if (!h) { l2.push(`${slug}: ${r.axis} ${JSON.stringify(String(r.witness).slice(0, 30))} ${r.theirs} is not in the witness record`); continue; }
    if (r.ours !== m[r.axis]) l2.push(`${slug}: ${r.axis} ours ${r.ours} vs bytes ${m[r.axis]}`);
    if (r.delta !== r.ours - r.theirs) l2.push(`${slug}: ${r.axis} delta ${r.delta} vs ${r.ours - r.theirs}`);
    if (r.verdict !== (r.delta === 0 ? "EXACT" : "DIFFERS")) l2.push(`${slug}: ${r.axis} verdict ${r.verdict} for delta ${r.delta}`);
  }
  for (const h of held) if (!(st.rows || []).some((r) => r.axis === h.axis && r.witness === h.witness && r.theirs === h.figure)) l2.push(`${slug}: the record's ${h.axis} ${JSON.stringify(String(h.witness).slice(0, 30))} ${h.figure} is not on the stamp`);
  receiptBooks[slug] = { ours: st.ours, exact: (st.rows || []).filter((r) => r.verdict === "EXACT").length, differs: (st.rows || []).filter((r) => r.verdict === "DIFFERS").length, no_witness: (st.rows || []).filter((r) => r.verdict === "NO_WITNESS").length,
    rows: (st.rows || []).map((r) => ({ axis: r.axis, witness: r.witness, class: r.class, theirs: r.theirs, ours: r.ours, delta: r.delta, verdict: r.verdict })) };
}
check("L1  every served stamp recounts from its own bytes, on every axis", l1.length === 0,
  l1.length ? `${l1.length} — ${few(l1)}` : `${num(stamped.length)} stamped book${stamped.length === 1 ? "" : "s"} recounted exactly${servedSet ? ` (of ${num(served.length)} served)` : ""}`);
check("L2  every stamp row is the witness record's figure, with the difference that follows", l2.length === 0,
  l2.length ? `${l2.length} — ${few(l2)}` : `${num(Object.values(receiptBooks).reduce((n, b) => n + b.rows.length, 0))} rows, each a figure the record holds`);
check("L3  every served book of the restore route carries its stamp", l3.length === 0,
  l3.length ? `${l3.length} without — ${few(l3)}` : (stamped.length ? "each counted work is served with its count on its page" : "no restore-route book is served yet"));
const l4 = [];
if (!witnesses) l4.push("no witness record");
else {
  if (witnesses.schema_version !== "MASORAH_WITNESSES_V1") l4.push(`schema ${witnesses.schema_version}`);
  for (const d of (witnesses.derived_from || [])) if (!/^[0-9a-f]{64}$/u.test(String(d.sha256 || ""))) l4.push(`${d.record}: no hash`);
  if (!(witnesses.derived_from || []).length) l4.push("names no source");
}
check("L4  the witness record names its sources and their hashes", l4.length === 0,
  l4.length ? few(l4) : `${(witnesses.derived_from || []).length} sources, hashed · ${num(Object.keys(witnesses.books || {}).length)} books, ${num(Object.keys(witnesses.sections || {}).length)} sections`);

// ---- the receipt: what the stamps say, book by book -------------------------
const receipt = {
  schema_version: "COUNT_STAMP_RECEIPT_V1",
  rule_id: "count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one",
  what: "What every served book's stamp says, recounted from the zone's bytes by this check. Nothing here withholds a book: a difference from a witness is shown as a difference, on the book's own page and here.",
  measured_by: MEASURE_RULE_ID,
  served: served.length,
  stamped: stamped.length,
  books: receiptBooks,
  totals: { exact: Object.values(receiptBooks).reduce((n, b) => n + b.exact, 0), differs: Object.values(receiptBooks).reduce((n, b) => n + b.differs, 0), no_witness: Object.values(receiptBooks).reduce((n, b) => n + b.no_witness, 0) },
};
if (WRITE) { writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + "\n"); console.log(`  receipt written · ${RECEIPT.replace(K3 + "/", "")}`); }
console.log(`      stamps: ${num(receipt.totals.exact)} exact · ${num(receipt.totals.differs)} differ · ${num(receipt.totals.no_witness)} unwitnessed`);

console.log("\n  what this does not say: that a witness is right, or anything about the rules that move no count.");
console.log("  A number is blind to italics, to shirah layout, and to the scribal letters.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
