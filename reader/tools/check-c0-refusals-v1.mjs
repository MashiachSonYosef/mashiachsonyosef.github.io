#!/usr/bin/env node
// GUARDS: refusals-gate-rule-v1-a-book-is-served-when-no-line-of-the-frame-refuses-a-position-of-it
// LEDGER: C0
// the ink, the mark itself, at its position: what the frame refuses to call
// a C0, applied to every position of every built book before it is served.
//
// THE GATE. The owner's ruling (2026-09-05): the count is our stamp of proof,
// not a gate; the REFUSALS are the gate. The frame's C0 letter names what a
// position may not be — a torn word, a tag in the ink, a mark carrying a
// key, a mark welded to a word, a joiner standing alone — and the corpus
// lane wrote those lines as code and ran them over its thirty-nine streams
// (run-c0-refusals-v3: 39/39 PASS). This check is the website lane's own
// copy of the lines, run over what this lane actually SERVES: the words of
// the built zone, with the keys the builder gave them. A book with one
// refused position is not served. Nothing is repaired here; a refusal names
// the position and the line, and the door reads the receipt.
//
// The lines (the corpus lane's numbering kept, the owner's rules named):
//   C0.tag-boundary        a tag survives inside a surface
//   C0.bare-prefix-letter  a word that is one prefix letter and nothing else,
//                          unless the record marks the letter (rule 12)
//   C0.empty-surface       an empty position
//   C0.inkoff-keyed        a mark carrying a lexical key
//   C0.mark-welded         a section mark, inverted nun or brick gap welded
//                          to a word
//   R2.maqaf-glyph-alone   a joiner standing as its own position
//   R2.maqaf-torn          a joiner at the start of a word, doubled, or at
//                          the end of a verse with nothing to join
//   R11.mark-inside-word   a paseq or a sof pasuq carried inside a word
//   C0.non-hebrew-token    a position with no Hebrew letter and no known mark
//   C0.punctuation-keyed   punctuation standing alone and carrying a key
//   K.key-welded           a key that fuses the pieces a maqaf divides
//   K.key-not-of-surface   a key that is not the normalization of its surface
//
// What this does NOT prove: that a word is the source's word. The serve
// routes prove that against their own oracles (the restore's surface hash
// reproduced from the bytes; the body's shards re-hashed against the July
// manifest), and the single-pass check holds every zone to those receipts.
//
// The cache: a zone's verdict is a function of its bytes, so it is cached by
// the zone's sha256 and a rebuilt zone is judged again. Nothing served is
// judged from a cache entry whose hash is not the file's.
//
// Run: node tools/check-c0-refusals-v1.mjs [--zones data/zones] [--receipt data/serve-gate-receipt-v1.json]
//      [--cache build/refusals-cache-v1.json] [--out deploy-root] [--write] [--only <slug>]
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exactK } from "./k-normalization-v2.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : dflt; };
const ZONES = join(K3, arg("zones", "data/zones"));
const RECEIPT = join(K3, arg("receipt", "data/serve-gate-receipt-v1.json"));
const CACHE = join(K3, arg("cache", "build/refusals-cache-v1.json"));
const OUT = join(K3, arg("out", "deploy-root"));
const WRITE = process.argv.includes("--write");
const ONLY = arg("only", null);
const RULE = "refusals-gate-rule-v1-a-book-is-served-when-no-line-of-the-frame-refuses-a-position-of-it";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const num = (x) => Number(x).toLocaleString("en-US");
const sha = (b) => createHash("sha256").update(b).digest("hex");

// ---- the lines, over one zone word ---------------------------------------
// Codepoints are escaped: a check may not type a character of the text.
const MAQAF = "\u05be", PASEQ = "\u05c0", SOF = "\u05c3", NUN = "\u05c6", GAP = "\u25af";
const LETTER = /[\u05d0-\u05ea]/u;
const stripPoints = (s) => String(s ?? "").normalize("NFC").replace(/[\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7]/gu, "");
const core = (s) => stripPoints(s).replace(/[\u05c0\u05c3()\[\]]/gu, "");
const PREFIX = /^[\u05d1\u05db\u05dc\u05d5\u05d4\u05de\u05e9]$/u;
const SECTION_GROUP = /\{[\u05e1\u05e4]\}|\([\u05e1\u05e4]\)/u;
const MARK_ALONE = /^(\{[\u05e1\u05e4]\}|\([\u05e1\u05e4]\)|[\u05c6\u05c0\u05c3\u25af\u2014])$/u;
const hasLetters = (s) => LETTER.test(String(s ?? "").normalize("NFC"));
const keysOf = (w) => (w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []);
const regionsOf = (w) => (w.w ? w.w : w.k ? [{ s: w.s, k: w.k }] : []);

const LINES = {
  "C0.tag-boundary": (w) => (/<[^>]*>/u.test(w.s) ? "a tag survives inside a C0 surface — a torn or unstripped boundary" : null),
  "C0.bare-prefix-letter": (w) => (!w.mark && !w.kq && PREFIX.test(core(w.s)) && !(Array.isArray(w.letter_marks) && w.letter_marks.length)
    ? "a C0 whose whole surface is one prefix letter — a torn word (unless the record marks the letter: rule 12)" : null),
  "C0.empty-surface": (w) => (String(w.s ?? "").trim() === "" ? "an empty C0" : null),
  "C0.inkoff-keyed": (w) => (w.mark && keysOf(w).length ? "an INKOFF mark carrying a lexical key" : null),
  "C0.mark-welded": (w) => (!w.mark && hasLetters(String(w.s).replace(SECTION_GROUP, "")) && (SECTION_GROUP.test(w.s) || w.s.includes(NUN) || w.s.includes(GAP))
    ? "a section mark, inverted nun or brick gap welded to a word" : null),
  "R2.maqaf-glyph-alone": (w) => (!w.mark && core(w.s) === MAQAF ? "a maqaf glyph standing as its own C0 — the compound was torn on both sides" : null),
  "R2.maqaf-torn": (w, ctx) => {
    if (w.mark) return null;
    const c = core(w.s);
    if (c.startsWith(MAQAF)) return "a C0 beginning with a maqaf — the compound was torn";
    if (c.includes(MAQAF + MAQAF)) return "two joiners in a row — a compound torn at an empty piece";
    if (c.endsWith(MAQAF) && ctx.lastInUnit) return "a joiner at the end of a verse with nothing to join";
    return null;
  },
  "R11.mark-inside-word": (w) => (!w.mark && hasLetters(w.s) && (w.s.includes(PASEQ) || w.s.includes(SOF))
    ? "a paseq or a sof pasuq carried inside a word's C0 instead of standing as its own INKOFF C0 (rule 11)" : null),
  "C0.non-hebrew-token": (w) => (!w.mark && !w.held && !hasLetters(w.s) && !MARK_ALONE.test(stripPoints(w.s)) && !/[A-Za-z0-9\u0400-\u04ff\u0600-\u06ff]/u.test(w.s) && !/^[\s\p{P}\p{S}]+$/u.test(w.s)
    ? "a C0 with no Hebrew letter and no known mark" : null),
  "C0.punctuation-keyed": (w) => (!w.mark && /^[\s\p{P}\p{S}]+$/u.test(String(w.s ?? "")) && keysOf(w).length ? "punctuation set off by spaces carrying a key (it is INKOFF)" : null),
  "K.key-welded": (w) => {
    if (w.mark || w.kq) return null;
    const c = core(w.s).replace(/^\u05be+|\u05be+$/gu, "");
    if (!c.includes(MAQAF)) return null;
    return keysOf(w).some((k) => k === c.replace(/\u05be/gu, "")) ? "the key welds the maqaf pieces (NO WELDING)" : null;
  },
  "K.key-not-of-surface": (w) => {
    if (w.mark || w.held) return null;
    for (const r of regionsOf(w)) {
      if (!r.k) continue;
      const expect = exactK(String(r.s ?? "").replace(/^[(\[]|[)\]]$/gu, ""));
      if (r.k !== expect) return `the key ${JSON.stringify(r.k)} is not the normalization of its surface ${JSON.stringify(r.s)} (K is for finding; it must still come from the ink)`;
    }
    return null;
  },
};

const judge = (z) => {
  const hits = {}, examples = {};
  let rows = 0;
  for (const sec of (z.sections || [])) {
    const words = sec.words || [];
    let lastOn = -1;
    words.forEach((w, i) => { if (!w.mark && !w.held) lastOn = i; });
    words.forEach((w, i) => {
      rows += 1;
      // a joiner needs a word after it; a closing mark (sof pasuq) is neither
      const ctx = { lastInUnit: i === lastOn };
      for (const [name, fn] of Object.entries(LINES)) {
        const why = fn(w, ctx);
        if (!why) continue;
        hits[name] = (hits[name] || 0) + 1;
        if (!examples[name]) examples[name] = { unit: sec.unit, surface: String(w.s ?? "").slice(0, 40), why };
      }
    });
  }
  return { rows, hits, examples, verdict: Object.keys(hits).length ? "REFUSED" : "PASS", stamped: !!(z.count_stamp && z.count_stamp.rule_id) };
};

// ---- every zone on the shelf, judged from its bytes ------------------------
const zones = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin") && !/^[0-9a-f]{2}\.bin$/u.test(f) && f !== "w-top.bin").sort()
  : [];
const LINES_VERSION = sha(readFileSync(fileURLToPath(import.meta.url))).slice(0, 16);
let cache = {};
try { const c = JSON.parse(readFileSync(CACHE, "utf8")); if (c.lines_version === LINES_VERSION) cache = c.by_sha256 || {}; } catch { cache = {}; }
const verdicts = new Map();
let judgedNow = 0, fromCache = 0, unreadable = 0;
for (const f of zones) {
  const slug = f.replace(/\.bin$/u, "");
  if (ONLY && slug !== ONLY) continue;
  const bytes = readFileSync(join(ZONES, f));
  const h = sha(bytes);
  if (cache[h]) { verdicts.set(slug, { ...cache[h], sha256: h }); fromCache += 1; continue; }
  let v;
  try { v = judge(JSON.parse(gunzipSync(bytes).toString("utf8"))); }
  catch (e) { v = { rows: 0, hits: { "zone.unreadable": 1 }, examples: { "zone.unreadable": { unit: null, surface: "", why: String(e.message || e).slice(0, 90) } }, verdict: "REFUSED" }; unreadable += 1; }
  cache[h] = v; verdicts.set(slug, { ...v, sha256: h }); judgedNow += 1;
}
mkdirSync(dirname(CACHE), { recursive: true });
writeFileSync(CACHE, JSON.stringify({ schema_version: "REFUSALS_CACHE_V1", rule_id: RULE, lines_version: LINES_VERSION, note: "a verdict is a function of the zone's bytes and of the lines; keyed by the zone's sha256 under this file's own hash, a rebuilt zone or a changed line is judged again", by_sha256: cache }));

const passed = [...verdicts.entries()].filter(([, v]) => v.verdict === "PASS").map(([s]) => s).sort();
// THE LAUNCH OF THE COUNTED WORKS (owner, 2026-09-06): what the door serves
// is a book no line refused AND whose count is stamped beside its witnesses
// on its own page. A book built before the stamp existed is not refused; it
// waits, named, for its rebuild under the one pipeline, which stamps it.
const stamped = [...verdicts.entries()].filter(([, v]) => v.stamped).map(([s]) => s).sort();
const served = passed.filter((s) => verdicts.get(s).stamped);
const notStamped = passed.filter((s) => !verdicts.get(s).stamped);
const refused = Object.fromEntries([...verdicts.entries()].filter(([, v]) => v.verdict !== "PASS").sort().map(([s, v]) => [s, { rows: v.rows, hits: v.hits, examples: v.examples }]));
const lineTotals = {};
for (const v of verdicts.values()) for (const [k, n] of Object.entries(v.hits)) lineTotals[k] = (lineTotals[k] || 0) + n;

// ---- L1: the lines were run over every position of every zone ------------
check("L1  every built zone was judged, position by position, from its bytes", verdicts.size === (ONLY ? 1 : zones.length) && unreadable === 0,
  `${num(verdicts.size)} zones · ${num(judgedNow)} judged now, ${num(fromCache)} from the cache by hash${unreadable ? ` · ${unreadable} unreadable` : ""}`);

// ---- L2: what passed and what was refused, by line ------------------------
const refusedN = Object.keys(refused).length;
console.log(`      ${num(passed.length)} PASS · ${num(refusedN)} REFUSED${refusedN ? ` — ${Object.entries(lineTotals).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ×${num(n)}`).join(", ")}` : ""}`);
for (const [s, v] of Object.entries(refused).slice(0, 6)) {
  const [line, ex] = Object.entries(v.examples)[0];
  console.log(`        ${s}: ${Object.entries(v.hits).map(([k, n]) => `${k} ×${n}`).join(" ")} · e.g. ${ex.unit || "?"} ${JSON.stringify(ex.surface)} — ${ex.why.slice(0, 70)}`);
}
if (refusedN > 6) console.log(`        … and ${num(refusedN - 6)} more refused, named in the receipt`);
check("L2  a book passes only when no line refuses any position of it", true, `${num(passed.length)} pass · ${num(served.length)} of them stamped and served · ${num(notStamped.length)} unrefused and not yet stamped`);

// ---- the receipt ---------------------------------------------------------
const receipt = {
  schema_version: "SERVE_GATE_RECEIPT_V1",
  rule_id: RULE,
  what: "The books no line of the frame's C0 letter refuses, position by position, as built (`passed`), and among them the books whose count is stamped beside its witnesses on their own page (`served`) — the counted works. The door serves `served` and nothing else. A book in `refused` is named with the line that refused it and one position it refused; a book in `passed` and not in `served` waits, unrefused, for its rebuild under the one pipeline, which stamps it. The count is not a gate: it is the stamp (count-stamp-rule-v1).",
  lines: Object.keys(LINES),
  zones_on_the_shelf: zones.length,
  served,
  served_sha256: Object.fromEntries(served.map((s) => [s, verdicts.get(s).sha256])),
  passed,
  stamped,
  not_yet_stamped: { count: notStamped.length, says: "built before the count was stamped beside its witnesses; not refused by any line; served after its rebuild under the one pipeline" },
  refused,
  line_totals: lineTotals,
  not_a_claim: "that a passing book is the source's text — each serve route proves that against its own oracle (a hash reproduced from the bytes), and the single-pass check holds every zone to it",
};
if (WRITE && !ONLY) { writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + "\n"); console.log(`  receipt written · ${RECEIPT.replace(K3 + "/", "")}`); }

// ---- L3: nothing served belongs to a refused book --------------------------
const l3 = [];
if (existsSync(OUT) && !ONLY) {
  const ok = new Set(served);
  for (const name of readdirSync(OUT)) {
    if (name.startsWith(".") || name === "demonstrations" || name === "census") continue;
    const p = join(OUT, name);
    if (!statSync(p).isDirectory() || !existsSync(join(p, "index.html"))) continue;
    if (!verdicts.has(name)) continue;           // not a shelf book: a group page, a redirect
    if (!ok.has(name)) l3.push(name);
  }
}
check("L3  nothing served carries a book that is refused or not yet stamped", l3.length === 0,
  l3.length ? `${num(l3.length)} served outside the gate — ${few(l3)}` : (existsSync(OUT) ? `${num(served.length)} served: unrefused and stamped` : "nothing built yet"));

// ---- L4: withholding the address is not withholding the book ---------------
// A committed zone file is readable at zone.html?b=<slug> whatever the door
// links, so a refused book keeps its bin out of the published tree. -z,
// because git quotes non-ASCII paths and most of the shelf's slugs are Hebrew.
const l4 = [];
if (!ONLY) {
  const git = spawnSync("git", ["ls-files", "-z", "data/zones"], { cwd: K3, encoding: "utf8" });
  if (git.status === 0) {
    const ok = new Set(served);
    for (const f of git.stdout.split("\0")) {
      if (!f.endsWith(".bin") || f.includes("fixture-")) continue;
      const slug = f.replace(/^.*\//u, "").replace(/\.(commentary\.)?bin$/u, "");
      if (!ok.has(slug)) l4.push(slug);
    }
  }
}
check("L4  no book outside the gate is published as data", l4.length === 0,
  l4.length ? `${num(l4.length)} zone file(s) committed — ${few(l4)} · readable at zone.html?b= whatever the door links` : "books outside the gate are on disk and out of the published tree");

console.log("\n  what this does not say: that a passing word is the source's word — the route's oracle says that.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
