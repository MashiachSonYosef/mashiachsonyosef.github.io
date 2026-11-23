#!/usr/bin/env node
// RUN: tree
// GUARDS: source-corpus-rule-v1-a-witness-names-the-body-it-describes-or-is-not-sorted-by-one
// LEDGER: M
// the witness and what body it describes: this holds the served route store to
// the corpus lane's classification, and refuses outright any witness that
// describes a language outside Hebrew and Aramaic.
//
// M's own words: the witness must be a source of Hebrew or Aramaic — the
// language it defines, not the language it defines in. A Yiddish dictionary is
// never admitted, and no Yiddish word is ever defined from a Yiddish source.
// That rule was written down long before anything could test it, because
// nothing on a card said what body its witness describes.
//
// On 2026-09-06 the corpus lane classified every source label from its own
// title and found three that M refuses — a Yiddish dictionary, an Arabic one,
// and a table of non-Hebrew languages written in Hebrew letters — feeding
// 8,173 cards into the twenty-four books, and producing wrong Hebrew through
// homographs: the letters that read "then" in Hebrew glossed "when" from the
// Yiddish word spelled the same way.
//
// None of the three is in this lane's store, checked row by row across all of
// them. This file is what keeps that true. It is the cheap half of a rule
// whose expensive half — reading eighty title pages — the other lane did.
//
//   L1  every witness the store cites is one the corpus ledger classifies,
//       or is named here as unclassified: named, not failed, because the
//       ledger answers the twenty-four books and this shelf is wider
//   L2  NO witness the store cites is one M refuses. This is the line. And a
//       witness of a label the ledger judges row by row (BY_ROW) stands only
//       in the rows its admitted_rows names, by m, key and words: any other
//       row of it is a row M refuses (22 November 2026, below)
//   L3  the record was emitted from the ledger it names, and the ledger it
//       names is the one on disk
//   L4  each witness judged row by row says what its admitted lines count as
//       (rows_count_as, which the page's language shelf reads), and it is what
//       those lines count as, recounted here: a derived field, never typed
//       (22 November 2026). And it says how many of its admitted lines stand
//       as no served row, and of those how many the landings' pin holds back
//       by their line or with their source (admitted_lines_not_served): a
//       named row not served is no fault, but the record must say it as it is. A line the pin held by its line
//       and let go (let_go, 23 November 2026, relay v221; re_reads) is held no more
//
// BY_ROW (22 November 2026, the corpus lane's relay v210 and its ledger v1.1).
// Three labels are neither admitted whole nor refused whole: each row is
// judged by its own source's language field, and the ledger names the rows it
// admits (admitted_rows: a landing list, by its file and sha256). The record
// says where this tree keeps those bytes (kept_here); they are read here and
// held to the sha256 the ledger gave, and every served row of such a witness
// must be one of them, or L2 fails, whatever the witness's other rows are.
//
// Run: node tools/check-source-corpus-v1.mjs [--ledger <the lane's ledger, to re-hash>]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const RECORD = join(K3, "data", "source-corpus-v1.json");
const STORE = join(K3, "data", "route-store");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(RECORD)) { console.log(`SKIPPED — no corpus record at ${RECORD.replace(K3 + "/", "")}; emit it with tools/emit-source-corpus-v1.mjs`); process.exit(3); }
if (!existsSync(join(STORE, "index.json"))) { console.log("SKIPPED — no route store on this disk"); process.exit(3); }
const rec = JSON.parse(readFileSync(RECORD, "utf8"));
const mSources = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8")).m_sources || {};

// what the store cites NOW, read from the shards — not from the record, which
// is the thing being checked
// and, for a witness the record says is judged row by row, the rows its
// admitted_rows names, read from the bytes the record names (or why not)
const SEP = "\x01";
const byRowNamed = new Map();   // m -> Set of m, key and words; or why they could not be read
const byRowCounts = new Map();  // m -> what its own lines count as, each value with its count
const byRowIds = new Map();     // m -> its own lines (m, key and words), in the list's order
const landingsPin = existsSync(join(K3, "data", "landings", "PIN.json")) ? JSON.parse(readFileSync(join(K3, "data", "landings", "PIN.json"), "utf8")) : { lists: [] };
const pinListOf = (sha) => (landingsPin.lists || []).find((l) => l.list && l.list.sha256 === sha) || {};
for (const [m, w] of Object.entries(rec.witnesses || {})) {
  if (!w || w.corpus !== "BY_ROW") continue;
  const a = w.admitted_rows || {};
  try {
    if (typeof a.kept_here !== "string" || !/^[0-9a-f]{64}$/u.test(String(a.sha256)) || !Number.isInteger(a.bytes) || !Number.isInteger(a.lines)) throw new PinFault(`the record names no list of the rows the ledger admits for ${m}`);
    const lines = readPinnedLines(join(K3, a.kept_here), { bytes: a.bytes, sha256: a.sha256, lines: a.lines, ...(a.stored ? { stored: a.stored } : {}) }, a.kept_here);
    byRowNamed.set(m, new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))));
    const c = {};
    for (const e of lines) if (e.m === m && e.language && typeof e.language.counts_as === "string" && e.language.counts_as) c[e.language.counts_as] = (c[e.language.counts_as] || 0) + 1;
    byRowCounts.set(m, c);
    byRowIds.set(m, lines.filter((e) => e.m === m).map((e) => [e.m, e.key, e.route].join(SEP)));
  } catch (e) { if (!(e instanceof PinFault)) throw e; byRowNamed.set(m, e.message); }
}
const byRowOff = new Map();   // m -> served rows of a BY_ROW witness that its admitted_rows does not name
const byRowServed = new Map();   // m -> the named rows of a BY_ROW witness that stand served
const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(shard)) for (const r of rows) {
    cited.set(r[3], (cited.get(r[3]) || 0) + 1);
    const named = byRowNamed.get(String(r[3]));
    if (named instanceof Set && !named.has([String(r[3]), k, r[1]].join(SEP))) byRowOff.set(String(r[3]), (byRowOff.get(String(r[3])) || 0) + 1);
    else if (named instanceof Set) (byRowServed.get(String(r[3])) || byRowServed.set(String(r[3]), new Set()).get(String(r[3]))).add([String(r[3]), k, r[1]].join(SEP));
  }
}

const known = rec.witnesses || {};
const namedUnclassified = new Set((rec.unclassified || []).map((u) => u.m));
const strays = [...cited.keys()].filter((m) => !known[m] && !namedUnclassified.has(m));
check(`L1  every witness the store cites is classified or named as unclassified (${cited.size} cited)`,
  strays.length === 0,
  strays.length
    ? `${strays.length} cite nobody in the record: ${strays.slice(0, 4).map((m) => `${m} ${(mSources[m] || {}).label || "no label"}`).join(" · ").slice(0, 200)} — re-emit the record`
    : `${Object.keys(known).length} classified · ${namedUnclassified.size} named as outside the ledger`);

// L2 · the line itself
const REFUSED = "REFUSED";
const served = [...cited.entries()].filter(([m]) => (known[m] || {}).corpus === REFUSED);
const byRowCited = [...cited.keys()].filter((m) => byRowNamed.has(String(m)));
const byRowUnread = byRowCited.filter((m) => !(byRowNamed.get(String(m)) instanceof Set)).map((m) => `${m}: ${byRowNamed.get(String(m))}`);
const byRowStray = [...byRowOff.entries()];
check("L2  no witness this shelf cites is one M refuses, and a witness the ledger judges row by row (BY_ROW) stands only in the rows its admitted_rows names",
  served.length === 0 && byRowStray.length === 0 && byRowUnread.length === 0,
  served.length || byRowStray.length || byRowUnread.length
    ? [served.length ? `${served.length} refused witness(es) are cited by ${served.reduce((t, [, n]) => t + n, 0).toLocaleString()} rows: ${served.map(([m]) => `${m} ${known[m].label}`).join(" · ").slice(0, 220)}` : "",
      byRowStray.length ? `${byRowStray.length} witness(es) judged row by row stand in ${byRowStray.reduce((t, [, n]) => t + n, 0).toLocaleString()} row(s) their admitted_rows does not name: ${byRowStray.map(([m, n]) => `${m} ${n}`).join(" · ")}` : "",
      ...byRowUnread].filter(Boolean).join(" · ").slice(0, 400)
    : `${cited.size} witnesses, none describing a language outside Hebrew and Aramaic${(rec.values || {}).REFUSED ? ` — the ledger refuses ${rec.values.REFUSED.sources} source(s) and this shelf cites none of them` : ""}${byRowCited.length ? ` · ${byRowCited.length} judged row by row (${byRowCited.map((m) => `${m} ${cited.get(m)} rows served of ${(byRowIds.get(String(m)) || []).length} named`).join(", ")}), every served row named by its admitted_rows; a named row not served is L4's to say` : ""}`);

// L4 · what a BY_ROW witness's lines count as is the lines' own, recounted
{
  const ordered = (o) => JSON.stringify(Object.entries(o && typeof o === "object" && !Array.isArray(o) ? o : { "(not an object)": -1 }).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)));
  const off = [], said = [];
  for (const [m, w] of Object.entries(rec.witnesses || {})) {
    if (!w || w.corpus !== "BY_ROW") continue;
    const got = byRowCounts.get(m);
    if (!got) { off.push(`${m}: its admitted lines could not be read`); continue; }
    if (w.rows_count_as === undefined || ordered(w.rows_count_as) !== ordered(got)) { off.push(`${m}: the record says its lines count as ${JSON.stringify(w.rows_count_as)}, and they count as ${JSON.stringify(got)}`); continue; }
    // the admitted lines that stand as no served row, and why, recounted from the lines, the store and the landings' pin
    const L = pinListOf((w.admitted_rows || {}).sha256);
    const heldLineIds = new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h && !h.let_go).map((h) => [h.m, h.key, h.route].join(SEP)));
    const unserved = (byRowIds.get(m) || []).filter((id) => !(byRowServed.get(m) || new Set()).has(id));
    const byLine = unserved.filter((id) => heldLineIds.has(id)).length, bySource = Object.prototype.hasOwnProperty.call(L.held_sources || {}, m) ? unserved.length - byLine : 0;
    const want = { lines: unserved.length, held_by_their_line: byLine, held_with_their_source: bySource, other: unserved.length - byLine - bySource };
    if (ordered(w.admitted_lines_not_served) !== ordered(want)) { off.push(`${m}: the record says ${JSON.stringify(w.admitted_lines_not_served)} of its admitted lines stand as no served row, and a recount says ${JSON.stringify(want)}`); continue; }
    said.push(`${m} ${Object.entries(got).map(([v, n]) => `${v} ${n}`).join(", ") || "none"}; ${(byRowIds.get(m) || []).length - unserved.length} of ${(byRowIds.get(m) || []).length} admitted lines served${unserved.length ? `, ${unserved.length} not (${byLine} held by their line, ${bySource} with their source, ${want.other} other)` : ""}`);
  }
  check("L4  each witness judged row by row says what its admitted lines count as, and how many stand as no served row and why, and both are so, recounted from the lines, the store and the landings' pin",
    off.length === 0, off.length ? off.join(" · ").slice(0, 400) : said.length ? said.join(" · ") : "no witness judged row by row is cited");
}

// L3 · the record stands on the ledger it names
const ledgerPath = arg("ledger");
if (ledgerPath && existsSync(ledgerPath)) {
  const sha = createHash("sha256").update(readFileSync(ledgerPath)).digest("hex");
  // and each witness judged row by row names the rows the ledger names for its label
  const lg = JSON.parse(readFileSync(ledgerPath, "utf8")), lgOf = new Map((lg.sources || []).map((x) => [x.source, x]));
  const rowsAway = Object.entries(rec.witnesses || {}).filter(([, w]) => w && w.corpus === "BY_ROW" && ((lgOf.get(w.label) || {}).admitted_rows || {}).sha256 !== (w.admitted_rows || {}).sha256).map(([m]) => m);
  check("L3  each witness the record judges row by row names the rows the ledger names for its label", rowsAway.length === 0,
    rowsAway.length ? `${rowsAway.join(", ")}: the record's admitted rows are not the ones the ledger names` : `${Object.values(rec.witnesses || {}).filter((w) => w && w.corpus === "BY_ROW").length} witness(es) judged row by row`);
  check("L3  the record was emitted from the ledger it names", sha === (rec.ledger || {}).sha256,
    sha === (rec.ledger || {}).sha256 ? `${sha.slice(0, 12)}… · ${rec.ledger.sources_in_the_ledger} sources classified by the corpus lane`
      : `the ledger on disk hashes ${sha.slice(0, 12)}…, the record was emitted from ${String((rec.ledger || {}).sha256).slice(0, 12)}… — re-emit`);
} else {
  console.log(`  --  L3 the ledger itself is not on this disk; the record names it at ${(rec.ledger || {}).at || "an address it does not give"} and carries its hash`);
}

console.log();
console.log("  M's line, in its own words: the witness must be a source of Hebrew or Aramaic —");
console.log("  the language it defines, not the language it defines in. A source outside that");
console.log("  set is refused entirely, not ranked last, because a wrong definition from a");
console.log("  forbidden source is not a weaker reading; it is a different language's word");
console.log("  wearing these letters.");
process.exit(bad ? 1 : 0);
