#!/usr/bin/env node
// RUN: tree
// GUARDS: stems-carried-rule-v1-a-key-carries-its-rows-stems-only-where-a-card-of-the-book-can-ask-them
// LEDGER: -
// no frame letter. A check reads the zones, their lattice sidecars and, where
// it is on this machine, the binyan ledger's file of row stems, and judges
// them; it is not the ledger for one.
//
// A KEY CARRIES ITS ROWS' STEMS ONLY WHERE A CARD OF THE BOOK CAN ASK THEM
// (tools/stems-carried-v1.mjs). The page asks a row's stems on a card whose
// word, or half of a word written one way and read another, has a pointed
// surface with a known stem in the book, under that form's own key; the
// projector bakes its leaders under the graded surface's own key. A key no
// card or leader asks under is never asked its rows' stems, and the sidecar
// does not carry them.
//
//   C1  every served book whose sidecar carries stems names this rule, and
//       says how many keys and rows it carries as a recount of its map does,
//       no more than the projection held before it chose
//   C2  every key a sidecar carries is one a card of the book asks its rows'
//       stems under: a word's, a read half's or a piece's key whose pointed
//       surface has a known stem in the book, or a graded surface's own key
//       with one
//   C3  with the binyan ledger's file 2 on this machine (--row-stems <file>,
//       or ROW_STEMS): it is the file every sidecar names, by its sha256; and
//       at every key the page asks a row's stems under, that the projection
//       reads, the sidecar holds each of the file's lines on that key that
//       gives stems, with exactly those stems. The keys the page asks are
//       found here as the page finds them, and not through the rule's own
//       module, so a rule that left a key out is caught and not agreed with:
//       a word's own key, or a read half's, where that form's pointed surface
//       (the half's inside its brackets) has a known stem in the book.
//       Without the file this is said and not judged
//
// The extension's rows are held to their lines at the same keys by
// check-stems-extension-v1 (B4). The words are found in the data, never named.
//
// Run: node tools/check-stems-carried-v1.mjs [--row-stems <row-stems-v2.jsonl>]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { STEMS_CARRIED_RULE_ID, keysAskedWithStems, stemsKnownAt } from "./stems-carried-v1.mjs";
import { stemsId } from "./stems-extension-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const FILE = arg("row-stems", process.env.ROW_STEMS || null);
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${STEMS_CARRIED_RULE_ID} —\n`);

// the keys the projection reads a book's row stems for: each word's own key, or its halves' where it has them, and its headword's
const keysRead = (zone) => {
  const out = new Set();
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    for (const k of (Array.isArray(w.w) ? w.w.map((r) => r && r.k) : [w.k])) if (typeof k === "string" && k) out.add(k);
    if (typeof w.h === "string" && w.h) out.add(w.h);
  }
  return out;
};

// THE KEYS THE PAGE ASKS A ROW'S STEMS UNDER, found as the page finds them (zone.html: askedWord gives the card a
// pointed surface only under the form's own key, the read half's inside its brackets, and the stem gate asks
// grades[that surface].st), not through the rule's module
const pageAsks = (zone, grades) => {
  const out = new Set();
  const inside = (s) => { let a = 0, b = s.length; while (a < b && s[a] === "[") a += 1; while (b > a && s[b - 1] === "]") b -= 1; return s.slice(a, b); };
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    if (w.mark) continue;
    const forms = Array.isArray(w.w) && w.w.length ? w.w.map((h) => [h && typeof h.s === "string" ? (h.role === "QERE" ? inside(h.s) : h.s) : null, h && h.k]) : [[w.s, w.k]];
    for (const [s, k] of forms) if (typeof k === "string" && k && stemsKnownAt(grades, s)) out.add(k);
  }
  return out;
};

// the file of row stems, where it is here: its lines with stems, by key
let lines = null, fileSha = null;
if (FILE) {
  if (!existsSync(FILE)) { console.log(`FAIL  the file of row stems given is not on this machine: ${FILE}`); process.exit(1); }
  const raw = readFileSync(FILE);
  fileSha = createHash("sha256").update(raw).digest("hex");
  lines = new Map();
  for (const t of raw.toString("utf8").split("\n")) {
    if (!t) continue;
    const l = JSON.parse(t);
    if (!Array.isArray(l.stems) || !l.stems.length) continue;
    if (!lines.has(l.key)) lines.set(l.key, []);
    lines.get(l.key).push(l);
  }
}

const c1 = { books: 0, keys: 0, rows: 0, keysBefore: 0, rowsBefore: 0, faults: [] };
const c2 = { keys: 0, faults: [] };
const c3 = { keys: 0, lines: 0, faults: [] };
for (const z of zonesServed()) {
  const sp = join(ZONES, `${z}.lattice.bin`);
  if (!existsSync(sp)) continue;
  const side = gz(sp);
  if (!side.stems || !side.binyan) continue;
  const zone = gz(join(ZONES, `${z}.bin`));
  c1.books += 1;
  // C1: the rule named, the counts a recount's
  const said = side.binyan.carried || null;
  const keys = Object.keys(side.stems);
  const rows = keys.reduce((n, k) => n + Object.keys(side.stems[k] || {}).length, 0);
  if (!said || said.rule !== STEMS_CARRIED_RULE_ID) c1.faults.push(`${z}: its sidecar carries stems and does not name ${STEMS_CARRIED_RULE_ID}`);
  else {
    if (said.keys_carried !== keys.length) c1.faults.push(`${z}: its sidecar says it carries ${said.keys_carried} keys, and it holds ${keys.length}`);
    if (said.rows_carried !== rows) c1.faults.push(`${z}: its sidecar says it carries ${said.rows_carried} rows, and it holds ${rows}`);
    if (!(said.keys_with_stems >= keys.length) || !(said.rows_with_stems >= rows)) c1.faults.push(`${z}: its sidecar says the projection held ${said.keys_with_stems} keys and ${said.rows_with_stems} rows, fewer than it carries`);
    c1.keysBefore += Number(said.keys_with_stems) || 0;
    c1.rowsBefore += Number(said.rows_with_stems) || 0;
  }
  c1.keys += keys.length;
  c1.rows += rows;
  // C2: no key carried that no card asks
  const asked = keysAskedWithStems(zone, side.grades || {});
  for (const k of keys) {
    c2.keys += 1;
    if (!asked.has(k) && c2.faults.length < 40) c2.faults.push(`${z} «${k}»: the sidecar carries its rows' stems and no card of the book asks them`);
  }
  // C3: every asked key the projection reads holds the file's lines on it
  if (!lines) continue;
  const named = (side.binyan.files || []).find((f) => f && f.file === basename(FILE));
  if (!named || named.sha256 !== fileSha) { c3.faults.push(`${z}: its sidecar names ${named ? `${named.file} as ${String(named.sha256).slice(0, 12)}…` : `no ${basename(FILE)}`}, and the file here is ${fileSha.slice(0, 12)}…`); continue; }
  const read = keysRead(zone);
  for (const k of pageAsks(zone, side.grades || {})) {
    if (!read.has(k) || !lines.has(k)) continue;
    c3.keys += 1;
    const held = side.stems[k] || {};
    for (const l of lines.get(k)) {
      c3.lines += 1;
      const got = held[stemsId(l.m, l.rank, l.route)];
      if (!same(got, l.stems) && c3.faults.length < 40) c3.faults.push(`${z} «${k}» ${l.m} rank ${l.rank}: its line gives ${l.stems.join("+")} and the sidecar holds ${got ? got.join("+") : "nothing"}`);
    }
  }
}

check("C1  every served book whose sidecar carries stems names this rule and says how many keys and rows it carries as a recount does, no more than the projection held", c1.books > 0 && c1.faults.length === 0,
  c1.faults.length ? `${nf(c1.faults.length)} · ${first(c1.faults)}` : `${c1.books} books · ${nf(c1.keys)} keys and ${nf(c1.rows)} rows carried, of ${nf(c1.keysBefore)} and ${nf(c1.rowsBefore)} the projection held`);
check("C2  every key a sidecar carries is one a card of the book asks its rows' stems under", c2.keys > 0 && c2.faults.length === 0,
  c2.faults.length ? `${nf(c2.faults.length)}${c2.faults.length >= 40 ? " or more" : ""} · ${first(c2.faults)}` : `${nf(c2.keys)} keys, each asked`);
if (!lines) console.log("  --  C3 was not judged here: the binyan ledger's file of row stems is not on this machine (--row-stems <row-stems-v2.jsonl> or ROW_STEMS)");
else check("C3  at every key the page asks a row's stems under that the projection reads, found as the page finds it, the sidecar holds each line of the binyan ledger's file 2 on that key with exactly its stems", c3.lines > 0 && c3.faults.length === 0,
  c3.faults.length ? `${nf(c3.faults.length)}${c3.faults.length >= 40 ? " or more" : ""} · ${first(c3.faults)}` : `${nf(c3.keys)} keys · ${nf(c3.lines)} lines, each held · ${basename(FILE)} ${fileSha.slice(0, 12)}…`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
