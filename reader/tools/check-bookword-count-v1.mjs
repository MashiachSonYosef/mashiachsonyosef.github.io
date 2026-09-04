#!/usr/bin/env node
// GUARDS: count-gate-rule-v1-a-book-is-served-when-our-count-equals-the-count-the-scribes-published
// LEDGER: Y
// the measures of the address space: how many words a book has, and whether
// that agrees with the number the scribes published for it.
//
// THE COUNT GATE.
//
// Every other check in this suite is one lane grading its own homework. It
// reads what we wrote and holds it to what we said we would write. That is
// worth having and it cannot catch a rule that is wrong, because a wrong rule
// applied consistently passes every internal check there is.
//
// This one is different in kind. It is checked against arithmetic somebody
// else did, by hand, centuries before any of this, and wrote down at the end
// of the book. The masorah finalis is the only mark in the corpus that makes
// a claim a machine can test. Recording it is not attesting it: the half must
// be counted.
//
// The measure is the BOOKWORD — a word of the book as the scribes counted it.
// Twelve rules decide what is one and what is not, and six of them move the
// number:
//
//   rule 1  a qere/ketiv site is one word, not two
//   rule 2  a maqaf separates two words; it does not join one
//   rule 3  an abbreviation is one word, however many it stands for
//   rules 4, 5  setumah and petuchah are marks, not words
//   rule 6  the inverted nun's brackets are not words
//   rule 11 the paseq is a mark, not a word
//
// Get any of the six wrong and the number misses. On the five books of the
// Torah, reading a maqaf as a joiner rather than a separator moves the total
// by 11,443 words out of roughly 80,000 — so this is not a delicate
// instrument. It is a very loud one.
//
// WHAT MAKES IT UNFAKEABLE. A wrong rule does not produce a constant error.
// It produces an error proportional to how often that rule fires in that
// book, and no two books have the same mixture. Twenty-four books against
// twelve rules is more equations than unknowns: a wrong rule would have to
// produce exactly the compensating miss in every book independently. One
// book is a checksum. The set is a proof.
//
//   L1  every target holds a source at an address in this corpus. A number
//       remembered or looked up is not a target, however right it is
//   L2  a book passes only if it holds at least one target and matches every
//       target it holds, exactly. Not close
//   L3  nothing served carries a book that did not pass. A book with no
//       target is not proved, and not proved is not served
//
// What this does NOT prove: that the five rules which move no count are
// right — the number is blind to italics, shirah layout, and the scribal
// letters. It proves the six that move it, and only as far as each one
// actually fires: a rule with two occurrences in a book is barely
// constrained by that book's total no matter how exactly it lands.
//
// Run: node tools/check-bookword-count-v1.mjs [--zones data/zones]
//      [--targets data/masoretic-counts-v1.json]
//      [--receipt data/count-gate-receipt-v1.json] [--out deploy-root]
//      [--write] to rewrite the receipt
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : dflt;
};
const ZONES = join(K3, arg("zones", "data/zones"));
const TARGETS = join(K3, arg("targets", "data/masoretic-counts-v1.json"));
const RECEIPT = join(K3, arg("receipt", "data/count-gate-receipt-v1.json"));
const OUT = join(K3, arg("out", "deploy-root"));
const WRITE = process.argv.includes("--write");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const n = (x) => Number(x).toLocaleString("en-US");

if (!existsSync(TARGETS)) { console.log(`SKIPPED — no targets record at ${TARGETS}`); process.exit(3); }
const REC = JSON.parse(readFileSync(TARGETS, "utf8"));
const targets = REC.targets || [];

// ---- L1: a target without a source we hold is not a target ---------------
const l1 = [];
for (const t of targets) {
  const src = t.source || {};
  if (!src.held_at) { l1.push(`${t.book}/${t.measure}: names no source`); continue; }
  if (!existsSync(join(K3, src.held_at))) l1.push(`${t.book}/${t.measure}: source ${src.held_at} is not here`);
  if (!Number.isInteger(t.count)) l1.push(`${t.book}/${t.measure}: the count is not a whole number`);
  if (!["verses", "words", "letters"].includes(t.measure)) l1.push(`${t.book}: ${t.measure} is not a measure the scribes published`);
}
check("L1  every target holds a source at an address in this corpus", l1.length === 0,
  l1.length ? `${l1.length} — ${few(l1)}` : `${targets.length} target(s), each with its source on disk`);

// ---- count every zone ----------------------------------------------------
// A bookword is a word of the book. A position carrying a mark is the
// scribes' bookkeeping and is not one; a position the chain is holding has
// not arrived and cannot be counted either way.
const LETTER = /[\u05d0-\u05ea]/gu;
const measure = (z) => {
  const secs = z.sections || [];
  let words = 0, marks = 0, held = 0, letters = 0;
  for (const s of secs) for (const w of (s.words || [])) {
    if (w.held) { held += 1; continue; }
    if (w.mark) { marks += 1; continue; }
    words += 1;
    letters += (String(w.s || "").match(LETTER) || []).length;
  }
  return { words, marks, held, letters, verses: secs.length };
};

const zones = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin")).sort()
  : [];
const counted = new Map();
for (const f of zones) {
  const slug = f.replace(/\.bin$/, "");
  try { counted.set(slug, measure(JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")))); }
  catch (e) { counted.set(slug, { error: String(e.message || e).slice(0, 90) }); }
}

// ---- L2: pass means every held target matched exactly --------------------
const byBook = new Map();
for (const t of targets) {
  if (!byBook.has(t.book)) byBook.set(t.book, []);
  byBook.get(t.book).push(t);
}
const passed = [], failed = [], noZone = [];
for (const [book, ts] of byBook) {
  const got = counted.get(book);
  if (!got) { noZone.push(`${book}: ${ts.length} target(s) held, no zone built`); continue; }
  if (got.error) { failed.push(`${book}: the zone did not open — ${got.error}`); continue; }
  const misses = ts.filter((t) => got[t.measure] !== t.count)
    .map((t) => `${t.measure} ${n(got[t.measure])} against ${n(t.count)}`);
  if (misses.length) failed.push(`${book}: ${misses.join(", ")}`);
  else passed.push(book);
}
const notProved = zones.map((f) => f.replace(/\.bin$/, "")).filter((s) => !byBook.has(s));
check("L2  a book passes only by matching every target it holds, exactly", failed.length === 0,
  failed.length ? `${failed.length} miss — ${few(failed)}` : `${passed.length} passed · ${noZone.length} target held with no zone · ${n(notProved.length)} zones hold no target`);

// ---- the receipt ---------------------------------------------------------
const receipt = {
  schema_version: "COUNT_GATE_RECEIPT_V1",
  rule_id: REC.rule_id,
  what: "The books whose own count equals the count the scribes published. Nothing else may be served. A book absent from `passed` is not a book this project has shown itself able to count, and the door reads this file rather than the shelf.",
  the_measure: "bookwords: a position that is neither a mark nor held. Verses are the units the zone carries. Letters are the letters of the words counted.",
  targets_held: targets.length,
  zones_on_the_shelf: zones.length,
  passed,
  target_held_no_zone: noZone,
  failed,
  not_proved: {
    count: notProved.length,
    cause: "CHOSEN",
    says: "These zones hold no published count this project can check them against, so nothing shows they are counted correctly. They are withheld until they hold one and match it. This is not a claim that they are wrong; it is a statement that nobody can tell, which is the same reason they may not be served.",
  },
};
if (WRITE) { writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + "\n"); console.log(`  receipt written · ${RECEIPT.replace(K3 + "/", "")}`); }

// ---- L3: nothing served belongs to a book that did not pass --------------
const l3 = [];
if (existsSync(OUT)) {
  const ok = new Set(passed);
  for (const name of readdirSync(OUT)) {
    if (name.startsWith(".") || name === "demonstrations" || name === "census") continue;
    const p = join(OUT, name);
    if (!statSync(p).isDirectory()) continue;
    if (!existsSync(join(p, "index.html"))) continue;
    if (!counted.has(name)) continue;           // not a shelf book: a group page, a redirect
    if (!ok.has(name)) l3.push(name);
  }
}
check("L3  nothing served carries a book that did not pass", l3.length === 0,
  l3.length ? `${n(l3.length)} served without a passing count — ${few(l3)}` : (existsSync(OUT) ? "no unproved book is served" : "nothing built yet"));

console.log("\n  what this does not say: anything about the five rules that move no count.");
console.log("  A number is blind to italics, to shirah layout, and to the scribal letters.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
