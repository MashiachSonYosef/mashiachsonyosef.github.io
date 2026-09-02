#!/usr/bin/env node
// GUARDS: exact-k-rule-frame-38-rule-7-maqaf-preserved
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The rule is declared in tools/k-normalization-v1.mjs, which quotes it from
// definition-poc/FRAME.md rule 7 so that no builder ever re-guesses it:
//
//   "7. Exact K normalization may remove niqqud, cantillation, bidi controls,
//       sof pasuq, and paseq. It preserves Hebrew letters including final
//       forms, internal word boundaries, abbreviation punctuation, and
//       boundary hyphen/maqaf."
//
// Why it exists, in the declaring file's own words: "Stripping the maqaf
// fuses two words into one and the catalog then answers for a form that was
// never written." The file measured the fusion on the sealed text: +0.69%
// gloss coverage, "and every point of it is wrong" — "call me" glossed as a
// surname, "to Cain" as a hydrocarbon, "but rather" as a poet. Under the rule
// a maqaf-joined word that the catalog does not hold renders bare, "which is
// the honest answer."
//
// The key the rule governs is field k of a zone word, { s, k }. The zone is
// what the page reads, so the zone is where the rule is kept or broken. This
// check reads every word of every zone and asks the rule's two questions of
// it: is the maqaf kept, and is nothing else lost.
//
//   L1  the declaring file still declares this rule, and its function keeps a
//       maqaf between letters while stripping only the marks the rule names
//   L2  every occurrence whose surface writes a maqaf stores a key that
//       carries it, in field k
//   L3  no stored key is the fused form of a maqaf-written occurrence
//   L4  an occurrence stored as W cells carries the whole key, maqaf kept,
//       among its cells, and every cell key is exact for its own surface
//   L5  no key carries a mark the rule removes
//   L6  every key without a maqaf is its surface's letters, final forms and
//       abbreviation marks in written order, nothing preserved dropped and
//       nothing added
//   L7  an abbreviation mark written between two letters survives in the
//       key, whichever codepoint the source wrote it with
//   L8  every key is what the declared function makes of its surface, so
//       the shelf and the declaring file have not drifted apart
//   L9  every zone names this rule as the rule its keys were made under
//
// L2 is red on this shelf as of 2026-09-01: every maqaf-written occurrence
// stores no k at all. The record moves such an occurrence into w cells, a
// lattice of its atoms and their joined intervals, and L4 asks whether the
// whole key with its maqaf stands there. A red L2 beside a green L4 says
// exactly where the key went; a red L4 would say it is gone.
//
// L7 is also red: thousands of surfaces write gershayim as an ASCII double
// quote between two letters, the key drops it, and the letters around it run
// together into a form no source wrote. Where the catalog holds that form, a
// reading is served for it. That is the maqaf's harm by another codepoint.
//
// What this check does NOT prove: that the page opens the whole key from the
// lattice (that needs a browser); that the catalog's own keys obey the rule
// (a store check's question); anything about a quote-like mark at the end of
// a word, which may be a closing quotation rather than a geresh and is left
// unjudged; anything about what the source chose to write, only what the key
// did with it.
//
// Run: node tools/check-k-maqaf-preserved-v1.mjs [--zones data/zones]
//                                                 [--rule tools/k-normalization-v1.mjs]
//                                                 [--store data/route-store/index.json]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const RULE = arg("rule", join(HERE, "k-normalization-v1.mjs"));
const STORE = arg("store", join(K3, "data", "route-store", "index.json"));

const RULE_ID = "exact-k-rule-frame-38-rule-7-maqaf-preserved";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ── the rule, by codepoint ────────────────────────────────────────────────
// Named by codepoint, never typed — the tree's standing rule. These classes
// are written from the rule's text, not imported from the declaring file, so
// that the shelf is judged against the rule and the declaring file is judged
// against it too (L1, L8).
const MAQAF = "\u05be";
const isLetter = (c) => c >= 0x05d0 && c <= 0x05ea;                      // alef..tav, final forms included
const isKept = (c) => c === 0x05be || c === 0x05f3 || c === 0x05f4;      // maqaf, geresh, gershayim
// What rule 7 says may be removed: cantillation 0591-05AF, niqqud 05B0-05BC
// with 05C1, 05C2, 05C7, meteg 05BD, rafe 05BF, paseq 05C0, sof pasuq 05C3,
// bidi controls 200E, 200F, 202A-202E, 2066-2069. The declaring file also
// drops the combining grapheme joiner 034F, an invisible the chain carries on
// held rows; it is counted with them.
const isRemovable = (c) =>
  (c >= 0x0591 && c <= 0x05bd) || c === 0x05bf || c === 0x05c0 || c === 0x05c1 || c === 0x05c2 ||
  c === 0x05c3 || c === 0x05c7 || c === 0x200e || c === 0x200f || (c >= 0x202a && c <= 0x202e) ||
  (c >= 0x2066 && c <= 0x2069) || c === 0x034f;
// Abbreviation marks as sources write them: geresh and gershayim, and the
// ASCII and typographic quotes that stand in for them.
const isQuoteLike = (c) =>
  c === 0x05f3 || c === 0x05f4 || c === 0x22 || c === 0x27 ||
  c === 0x2018 || c === 0x2019 || c === 0x201c || c === 0x201d;
const cpName = (c) => `U+${c.toString(16).toUpperCase().padStart(4, "0")}`;

// The surface after the removable marks are gone, as codepoints. NFC first:
// a presentation-form letter decomposes to its letter and is a letter.
const lexOf = (s) => {
  const out = [];
  for (const ch of String(s ?? "").normalize("NFC")) { const c = ch.codePointAt(0); if (!isRemovable(c)) out.push(c); }
  return out;
};
// The key the rule describes: letters and the kept punctuation, in order.
const keyOf = (s) => {
  let out = "";
  for (const ch of String(s ?? "").normalize("NFC")) { const c = ch.codePointAt(0); if (isLetter(c) || isKept(c)) out += ch; }
  return out;
};
const carriesRemovable = (k) => { for (const ch of String(k ?? "")) if (isRemovable(ch.codePointAt(0))) return true; return false; };

// ── L1: the declaring file ────────────────────────────────────────────────
if (!existsSync(RULE)) {
  console.log(`SKIPPED — no declaring file at ${RULE}, so the rule this check guards cannot be quoted`);
  process.exit(3);
}
const rule = await import(pathToFileURL(RULE).href);
const exactK = typeof rule.exactK === "function" ? rule.exactK : null;
const idOk = rule.K_RULE_ID === RULE_ID;
const textOk = /preserves[^.]*maqaf/i.test(String(rule.K_RULE_TEXT || ""));
// Surfaces built from codepoints, never typed: a pointed pair joined by a
// maqaf; a pointed word with dagesh, sheva, an accent, a shin dot and a sof
// pasuq; a word ending in a final mem, wrapped in bidi controls and followed
// by a paseq; an abbreviation with gershayim.
const trials = [
  ["\u05d0\u05b6\u05ea\u05be\u05d0\u05b2\u05d1\u05b4\u05d9\u05e9\u05c1\u05b7\u05d2", "\u05d0\u05ea\u05be\u05d0\u05d1\u05d9\u05e9\u05d2"],
  ["\u05d1\u05bc\u05b0\u05e8\u05b5\u0591\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea\u05c3", "\u05d1\u05e8\u05d0\u05e9\u05d9\u05ea"],
  ["\u200f\u202b\u05e9\u05c1\u05b8\u05dc\u05d5\u05b9\u05dd\u202c\u05c0", "\u05e9\u05dc\u05d5\u05dd"],
  ["\u05e2\u05db\u05f4\u05e4", "\u05e2\u05db\u05f4\u05e4"],
];
const missed = exactK ? trials.filter(([s, want]) => exactK(s) !== want) : trials;
const l1Why = [];
if (!idOk) l1Why.push(`K_RULE_ID is ${JSON.stringify(rule.K_RULE_ID)}`);
if (!textOk) l1Why.push("K_RULE_TEXT no longer says the maqaf is preserved");
if (!exactK) l1Why.push("no exactK function is exported");
if (missed.length) l1Why.push(`${missed.length} of ${trials.length} built surfaces keyed wrong, first: ${missed[0][0]} -> ${exactK(missed[0][0])} wanted ${missed[0][1]}`);
check("L1  the declaring file still declares this rule and its function keeps the maqaf",
  idOk && textOk && !!exactK && missed.length === 0,
  l1Why.length ? l1Why.join(" · ")
    : `rule id and text quoted from ${basename(RULE)}; ${trials.length} built surfaces keyed as the rule says`);

// ── the shelf ─────────────────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`\nSKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("\nSKIPPED — no zones on this disk"); process.exit(3); }

const few = (list, n = 3) => list.filter(Boolean).slice(0, n).join(" · ");
const keep = (list, item, cap = 12) => { list.push(list.length < cap ? item : null); };

let zonesRead = 0, wordsRead = 0, unkeyed = 0;
// L2
let written = 0, joined = 0, edge = 0, kCarries = 0, kAbsent = 0, kSilent = 0;
const l2Samples = [];
// L3
let fusedStored = 0;
const l3Samples = [];
// L4
let cellsRead = 0, wholeMissing = 0, cellInexact = 0, edgeNoCell = 0;
const l4Samples = [];
// L5
let removableKept = 0;
const l5Samples = [];
// L6
let plainKeys = 0, notPreserved = 0, exactStrip = 0, withOther = 0;
const otherHist = new Map();
const l6Samples = [];
// L7
let markWords = 0, markDropped = 0, fusedGlossed = 0;
const markHist = new Map(), markDropHist = new Map();
const l7Samples = [];
// L8
let drift = 0;
const l8Samples = [];
// L9
let zonesNaming = 0;
const l9Samples = [];
// for the catalog note
const joinedKeys = new Set(), fusedKeys = new Set(), abbrevFused = new Set();

for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const work = String(z.work || f.replace(/\.bin$/, ""));
  const gloss = z.gloss || {};
  const from = z.emitted_from || {};
  const keyRule = String((from.gloss_layer || {}).key_rule || "");
  // the field the law names, and only that field: an id mentioned in some
  // other note of emitted_from is not the gloss layer naming its key rule
  if (keyRule.startsWith(RULE_ID)) zonesNaming += 1;
  else keep(l9Samples, work);

  for (const sec of z.sections || []) {
    const label = String(sec.label || "");
    for (const w of sec.words || []) {
      wordsRead += 1;
      const s = String(w.s ?? "");
      const hasK = typeof w.k === "string";
      const cells = Array.isArray(w.w) ? w.w : null;
      const k = hasK ? w.k : "";

      if (s.includes(MAQAF)) {
        // ── an occurrence written with a maqaf ──
        written += 1;
        const parts = keyOf(s).split(MAQAF).filter(Boolean);
        const isJoined = parts.length >= 2;
        if (isJoined) joined += 1; else edge += 1;
        // L2 — the key field carries the maqaf
        if (hasK && k.includes(MAQAF)) kCarries += 1;
        else {
          if (!hasK) kAbsent += 1; else kSilent += 1;
          keep(l2Samples, `${work} ${label} ${s}`);
        }
        const whole = parts.join(MAQAF), fused = parts.join("");
        if (isJoined) { joinedKeys.add(whole); fusedKeys.add(fused); }
        // L3 — nothing stored is the fused form
        if (isJoined) {
          const stored = [];
          if (hasK) stored.push(k);
          if (cells) for (const c of cells) stored.push(String(c.k ?? ""));
          if (stored.includes(fused)) { fusedStored += 1; keep(l3Samples, `${work} ${label} ${s} -> ${fused}`); }
        }
        // L4 — the lattice holds the whole key; every cell key is exact
        if (cells) {
          let wholeSeen = false;
          for (const c of cells) {
            cellsRead += 1;
            const ck = String(c.k ?? "");
            if (ck === whole) wholeSeen = true;
            if (ck !== keyOf(c.s)) { cellInexact += 1; keep(l4Samples, `${work} ${label} cell ${String(c.s ?? "")} -> ${ck}`); }
            // L5 on the cells
            if (carriesRemovable(ck)) { removableKept += 1; keep(l5Samples, `${work} ${label} ${ck}`); }
            // L8 on the cells
            if (exactK && exactK(c.s) !== ck) { drift += 1; keep(l8Samples, `${work} ${label} cell ${String(c.s ?? "")}`); }
          }
          if (isJoined && !wholeSeen) { wholeMissing += 1; keep(l4Samples, `${work} ${label} ${s}: no cell keys ${whole}`); }
          if (!isJoined && !cells.some((c) => String(c.k ?? "").includes(MAQAF))) edgeNoCell += 1;
        } else if (isJoined && !(hasK && k === whole)) {
          wholeMissing += 1; keep(l4Samples, `${work} ${label} ${s}: no cells and k is ${JSON.stringify(k)}`);
        }
        if (hasK) {
          if (carriesRemovable(k)) { removableKept += 1; keep(l5Samples, `${work} ${label} ${k}`); }
          if (exactK && exactK(s) !== k) { drift += 1; keep(l8Samples, `${work} ${label} ${s}`); }
        }
        continue;
      }

      // ── an occurrence written without a maqaf ──
      if (!hasK) { unkeyed += 1; continue; }
      plainKeys += 1;
      const lex = lexOf(s);
      let pres = "", other = false;
      const marks = [];
      for (let i = 0; i < lex.length; i += 1) {
        const c = lex[i];
        if (isLetter(c) || isKept(c)) pres += String.fromCodePoint(c);
        else { other = true; otherHist.set(c, (otherHist.get(c) || 0) + 1); }
        if (isQuoteLike(c) && i > 0 && i + 1 < lex.length && isLetter(lex[i - 1]) && isLetter(lex[i + 1])) marks.push(c);
      }
      // L5 — no removable mark survives in the key
      if (carriesRemovable(k)) { removableKept += 1; keep(l5Samples, `${work} ${label} ${k}`); }
      // L6 — the key is the preserved sequence, in order, nothing more
      if (k !== pres) { notPreserved += 1; keep(l6Samples, `${work} ${label} ${s} -> ${k}`); }
      else if (!other) exactStrip += 1;
      if (other) withOther += 1;
      // L7 — an abbreviation mark between two letters survives
      if (marks.length) {
        markWords += 1;
        for (const c of marks) markHist.set(c, (markHist.get(c) || 0) + 1);
        const lost = marks.filter((c) => !k.includes(String.fromCodePoint(c)));
        if (lost.length) {
          markDropped += 1;
          for (const c of lost) markDropHist.set(c, (markDropHist.get(c) || 0) + 1);
          abbrevFused.add(k);
          const glossed = Object.prototype.hasOwnProperty.call(gloss, k);
          if (glossed) fusedGlossed += 1;
          keep(l7Samples, `${work} ${label} ${s} -> ${k}${glossed ? " (glossed)" : ""}`);
        }
      }
      // L8 — the declared function agrees with the shelf
      if (exactK && exactK(s) !== k) { drift += 1; keep(l8Samples, `${work} ${label} ${s} -> ${k} vs ${exactK(s)}`); }
    }
  }
}

console.log(`\n— ${zonesRead} zones · ${wordsRead.toLocaleString()} words · ${written.toLocaleString()} written with a maqaf · ${plainKeys.toLocaleString()} keyed without one${unkeyed ? ` · ${unkeyed.toLocaleString()} store no key` : ""} —`);

check("L2  every occurrence whose surface writes a maqaf stores a key that carries it, in field k",
  written > 0 && kCarries === written,
  written === 0
    ? "no surface on this shelf writes a maqaf, so nothing here was judged"
    : `${written.toLocaleString()} surfaces write one (${joined.toLocaleString()} between letters, ${edge.toLocaleString()} at an edge) · ` +
      `${kCarries.toLocaleString()} keys carry it · ${kAbsent.toLocaleString()} store no k at all` +
      (kSilent ? ` · ${kSilent.toLocaleString()} store a k without it` : "") +
      (kCarries === written ? "" : ` — ${few(l2Samples)}`));

check("L3  no stored key is the fused form of a maqaf-written occurrence",
  fusedStored === 0,
  fusedStored
    ? `${fusedStored.toLocaleString()} store their halves run together — ${few(l3Samples)}`
    : `none of ${joined.toLocaleString()} joined occurrences stores its halves run together`);

check("L4  an occurrence stored as W cells carries the whole key, maqaf kept, among them, and every cell key is exact",
  wholeMissing === 0 && cellInexact === 0,
  (wholeMissing || cellInexact)
    ? `${wholeMissing.toLocaleString()} without the whole key · ${cellInexact.toLocaleString()} inexact cells — ${few(l4Samples)}`
    : `${(joined - wholeMissing).toLocaleString()} whole keys stood among ${cellsRead.toLocaleString()} cells, every cell exact` +
      (edgeNoCell ? `; ${edgeNoCell.toLocaleString()} edge-maqaf occurrences carry the maqaf in no cell, the record reading it as the next occurrence's` : ""));

check("L5  no key carries a mark the rule removes",
  removableKept === 0,
  removableKept
    ? `${removableKept.toLocaleString()} keep one — ${few(l5Samples)}`
    : "no niqqud, cantillation, bidi control, sof pasuq or paseq survives in any key or cell key");

const otherTop = [...otherHist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  .map(([c, n]) => `${cpName(c)} x${n.toLocaleString()}`).join(", ");
check("L6  every key without a maqaf is its surface's letters, final forms and abbreviation marks in order, nothing dropped, nothing added",
  plainKeys > 0 && notPreserved === 0,
  plainKeys === 0
    ? "no keyed word without a maqaf on this shelf, so nothing here was judged"
    : notPreserved
      ? `${notPreserved.toLocaleString()} of ${plainKeys.toLocaleString()} differ — ${few(l6Samples)}`
      : `${plainKeys.toLocaleString()} keys · ${exactStrip.toLocaleString()} equal the surface with only the removable marks gone · ` +
        `${withOther.toLocaleString()} surfaces also carried characters the rule does not name (${otherTop || "none"}) and the key drops those too`);

const markLine = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${cpName(c)} x${n.toLocaleString()}`).join(", ");
check("L7  an abbreviation mark written between two letters survives in the key, whichever codepoint the source wrote",
  markDropped === 0,
  markDropped
    ? `${markWords.toLocaleString()} words carry one (${markLine(markHist)}) · ${markDropped.toLocaleString()} lose it (${markLine(markDropHist)}) and their letters run together · ` +
      `${fusedGlossed.toLocaleString()} of those keys are glossed, a reading served for a form no source wrote — ${few(l7Samples)}`
    : markWords
      ? `${markWords.toLocaleString()} words carry one (${markLine(markHist)}) and every one survives`
      : "no word on this shelf writes an abbreviation mark between two letters");

check("L8  every key is what the declared function makes of its surface",
  !!exactK && drift === 0,
  !exactK ? "the declaring file exports no exactK, so the shelf cannot be compared with it"
    : drift ? `${drift.toLocaleString()} keys drift from ${basename(RULE)} — ${few(l8Samples)}`
      : `${(plainKeys + cellsRead).toLocaleString()} keys and cell keys agree with ${basename(RULE)}`);

check("L9  every zone names this rule as the rule its keys were made under",
  zonesRead > 0 && zonesNaming === zonesRead,
  zonesNaming === zonesRead
    ? `${zonesRead} of ${zonesRead} name ${RULE_ID} in emitted_from.gloss_layer.key_rule`
    : `${zonesRead - zonesNaming} of ${zonesRead} do not — ${few(l9Samples)}`);

// ── the catalog the keys are asked of ─────────────────────────────────────
// Not a law of this rule; the store's keys are a store check's question. It
// is printed because it says what the rule buys: a fused key finds readings
// the written form never had.
if (existsSync(STORE)) {
  const shardsDir = join(dirname(STORE), "shards");
  const held = new Set();
  let maqafKeys = 0, abbrevKeys = 0, quoteKeys = 0;
  if (existsSync(shardsDir)) {
    for (const sf of readdirSync(shardsDir).filter((x) => x.endsWith(".bin"))) {
      let sh;
      try { sh = JSON.parse(gunzipSync(readFileSync(join(shardsDir, sf))).toString("utf8")); } catch { continue; }
      for (const key of Object.keys(sh)) {
        held.add(key);
        if (key.includes(MAQAF)) maqafKeys += 1;
        if (/[\u05f3\u05f4]/u.test(key)) abbrevKeys += 1;
        if (/["']/.test(key)) quoteKeys += 1;
      }
    }
  }
  let joinedHeld = 0, fusedHeld = 0, abbrevHeld = 0;
  for (const key of joinedKeys) if (held.has(key)) joinedHeld += 1;
  for (const key of fusedKeys) if (held.has(key)) fusedHeld += 1;
  for (const key of abbrevFused) if (held.has(key)) abbrevHeld += 1;
  console.log(`\n  --  the catalog holds ${held.size.toLocaleString()} keys: ${maqafKeys.toLocaleString()} carry a maqaf, ${abbrevKeys.toLocaleString()} a geresh or gershayim, ${quoteKeys.toLocaleString()} an ASCII quote`);
  console.log(`  --  of ${joinedKeys.size.toLocaleString()} distinct maqaf-kept keys on the shelf it holds ${joinedHeld.toLocaleString()}; run together, ${fusedHeld.toLocaleString()} of them would find a reading the written form never had`);
  if (abbrevFused.size) console.log(`  --  of ${abbrevFused.size.toLocaleString()} distinct keys that lost an abbreviation mark, it holds ${abbrevHeld.toLocaleString()} under the run-together form`);
} else {
  console.log(`\n  --  no catalog index at ${STORE}; what the fused forms would find went unasked`);
}

console.log("\n  what this does not say: that the page opens the whole key from the lattice,");
console.log("  which needs a browser; that the catalog's own keys obey the rule; anything about");
console.log("  a quote-like mark at the end of a word, which may be a closing quotation and is");
console.log("  left unjudged; anything about what the source wrote, only what the key did with it.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
