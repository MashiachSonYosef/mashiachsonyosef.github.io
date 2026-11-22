# Ship 16, patch 4: the record of what body each witness describes is emitted from the corpus lane's source ledger
# v1.1 (relay v210), at its own address, and learns the ledger's new value BY_ROW; its check holds a BY_ROW witness's
# served rows to the rows the ledger's admitted_rows names, by m, key and words. Applied on main's two tools.
# Usage: patch-16-04-source-corpus-by-row.py <reader>
import io, sys
R = sys.argv[1]
s = ""
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

# ---- tools/emit-source-corpus-v1.mjs --------------------------------------------------------------------------------
p = R + "/tools/emit-source-corpus-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""// Run: node tools/emit-source-corpus-v1.mjs --ledger <source-corpus-v1.json> --stamp YYYY-MM-DD
""", """// 2026-11-22. THE LEDGER IS v1.1, AND A LABEL MAY BE JUDGED ROW BY ROW. The
// corpus lane reissued its ledger as v1.1 (relay v210, 21 November 2026), at
// its own address beside v1, which stays as it was. Three labels carry a new
// value, BY_ROW: such a label is neither admitted whole nor refused whole, and
// a served row of it stands only where the ledger's admitted_rows names it, by
// m, key and words, each such row admitted by its own source's language field.
// admitted_rows names a landing list by its file and sha256. This tree keeps
// that list where the landings' pin names those bytes, and the record says
// where (kept_here), so the check reads the very bytes the ledger names. A row
// of a BY_ROW label the list does not name is refused, as a witness M refuses
// is, and counted. The ledger read must be v1.1's bytes, the ones the address
// names: a record that names one ledger and was emitted from another is the
// fault this file exists to stop.
//
// Run: node tools/emit-source-corpus-v1.mjs --ledger <source-corpus-v1.1.json> --stamp YYYY-MM-DD
""")
swap("""import { readFileSync, writeFileSync, readdirSync } from "node:fs";
""", """import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
""")
swap("""import { fileURLToPath } from "node:url";
""", """import { fileURLToPath } from "node:url";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";
""")
swap("""const LEDGER_AT = "r2:mishkan/v2/ledgers/all/toggle-ledgers/source-corpus-v1.json";
""", """const LEDGER_AT = "r2:mishkan/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json";
// the bytes that address holds, as the corpus lane's letter names them (relay v210)
const LEDGER_VERSION = "v1.1";
const LEDGER_SHA256 = "8d9caf8c5c5f253f307ce9ffac176d77c01642e7fb72fcb1ae4241c4b9c78bbc";
const BY_ROW = "BY_ROW";
const SEP = "\\x01";
""")
swap("""  die("UNEXPECTED_LEDGER_SCHEMA", String(ledger.schema));
""", """  die("UNEXPECTED_LEDGER_SCHEMA", String(ledger.schema));
const ledgerSha = createHash("sha256").update(ledgerBytes).digest("hex");
if (ledger.version !== LEDGER_VERSION || ledgerSha !== LEDGER_SHA256)
  die("NOT_THE_LEDGER_NAMED", `the ledger read is ${ledger.version || "unversioned"}, sha256 ${ledgerSha}; the record names ${LEDGER_AT}, ${LEDGER_VERSION}, sha256 ${LEDGER_SHA256}`);
""")
swap("""const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const rows of Object.values(shard)) for (const r of rows) cited.set(r[3], (cited.get(r[3]) || 0) + 1);
}
""", """// A label the ledger judges row by row: the rows its admitted_rows names, read
// from the list of the landings' pin that is those bytes (m, key and words).
const landingsPin = existsSync(join(K3, "data", "landings", "PIN.json")) ? JSON.parse(readFileSync(join(K3, "data", "landings", "PIN.json"), "utf8")) : { lists: [] };
const admittedOf = new Map();
const admittedRowsOf = (label) => {
  if (admittedOf.has(label)) return admittedOf.get(label);
  const a = (byLabel.get(label) || {}).admitted_rows || {};
  if (typeof a.file !== "string" || !/^[0-9a-f]{64}$/u.test(String(a.sha256))) die("BY_ROW_NAMES_NO_ROWS", `the ledger judges \\u00ab${label}\\u00bb row by row and names no list of the rows it admits`);
  const L = (landingsPin.lists || []).find((l) => l.list && l.list.sha256 === a.sha256);
  if (!L) die("BY_ROW_ROWS_NOT_HERE", `the rows the ledger admits for \\u00ab${label}\\u00bb are ${a.file} (sha256 ${a.sha256}), and no list of data/landings/PIN.json is those bytes`);
  const kept = `data/landings/${L.folder}/${L.list.file}`;
  let lines;
  try { lines = readPinnedLines(join(K3, kept), L.list, kept); } catch (e) { if (e instanceof PinFault) die("BY_ROW_ROWS_NOT_THEIR_BYTES", e.message); throw e; }
  const got = { entry: a, kept_here: kept, stored: L.list.stored || null, bytes: L.list.bytes, lines: L.list.lines, named: new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))) };
  admittedOf.set(label, got);
  return got;
};
const byRowLabelOf = new Map(Object.entries(mSources).filter(([, s]) => s && (byLabel.get(s.label) || {}).declared_corpus === BY_ROW).map(([m, s]) => [m, s.label]));
const notNamed = new Map();   // m -> rows of a BY_ROW label that its admitted_rows does not name
const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(shard)) for (const r of rows) {
    cited.set(r[3], (cited.get(r[3]) || 0) + 1);
    const m = String(r[3]);
    if (byRowLabelOf.has(m) && !admittedRowsOf(byRowLabelOf.get(m)).named.has([m, k, r[1]].join(SEP))) notNamed.set(m, (notNamed.get(m) || 0) + 1);
  }
}
""")
swap("""  witnesses[m] = { label, corpus: row.declared_corpus, evidence: row.evidence || null, rows };
  if (row.declared_corpus === "REFUSED") refused.push({ m, label, rows, why: row.evidence || "refused by M" });
""", """  witnesses[m] = { label, corpus: row.declared_corpus, evidence: row.evidence || null, rows };
  if (row.declared_corpus === "REFUSED") refused.push({ m, label, rows, why: row.evidence || "refused by M" });
  if (row.declared_corpus === BY_ROW) {
    const a = admittedRowsOf(label), off = notNamed.get(m) || 0;
    witnesses[m].admitted_rows = { file: a.entry.file, in: a.entry.in || null, sha256: a.entry.sha256, bytes: a.bytes, lines: a.lines, ...(a.stored ? { stored: a.stored } : {}),
      kept_here: a.kept_here, lines_of_this_label: a.entry.lines_of_this_label ?? null, by_m: a.entry.by_m || null, how: a.entry.how || null };
    witnesses[m].rows_named_by_admitted_rows = rows - off;
    if (off) refused.push({ m, label, rows: off, why: "rows of a label the ledger judges row by row (BY_ROW) that its admitted_rows does not name: M refuses them" });
  }
""")
swap("""    sha256: createHash("sha256").update(ledgerBytes).digest("hex"),
    generated: ledger.generated || null,
""", """    sha256: ledgerSha,
    version: ledger.version || null,
    generated: ledger.generated || null,
""")
swap("""    sources_in_the_ledger: (ledger.sources || []).length,
""", """    sources_in_the_ledger: (ledger.sources || []).length,
    correction: ledger.correction || null,
""")
swap("""console.log(`${OUT.replace(K3 + "/", "")}: ${cited.size} witnesses cited · ${Object.keys(witnesses).length} classified · ${unclassified.length} not in the ledger · ${refused.length} refused`);
""", """console.log(`${OUT.replace(K3 + "/", "")}: ${cited.size} witnesses cited · ${Object.keys(witnesses).length} classified · ${unclassified.length} not in the ledger · ${refused.length} refused · ledger ${ledger.version} ${ledgerSha.slice(0, 12)}`);
for (const [m, w] of Object.entries(witnesses)) if (w.corpus === BY_ROW) console.log(`  ${m} judged row by row: ${w.rows} rows served, ${w.rows_named_by_admitted_rows} named by ${w.admitted_rows.kept_here}`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/check-source-corpus-v1.mjs -------------------------------------------------------------------------------
p = R + "/tools/check-source-corpus-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//   L2  NO witness the store cites is one M refuses. This is the line.
""", """//   L2  NO witness the store cites is one M refuses. This is the line. And a
//       witness of a label the ledger judges row by row (BY_ROW) stands only
//       in the rows its admitted_rows names, by m, key and words: any other
//       row of it is a row M refuses (22 November 2026, below)
""")
swap("""// Run: node tools/check-source-corpus-v1.mjs [--ledger <the lane's ledger, to re-hash>]
""", """// BY_ROW (22 November 2026, the corpus lane's relay v210 and its ledger v1.1).
// Three labels are neither admitted whole nor refused whole: each row is
// judged by its own source's language field, and the ledger names the rows it
// admits (admitted_rows: a landing list, by its file and sha256). The record
// says where this tree keeps those bytes (kept_here); they are read here and
// held to the sha256 the ledger gave, and every served row of such a witness
// must be one of them, or L2 fails, whatever the witness's other rows are.
//
// Run: node tools/check-source-corpus-v1.mjs [--ledger <the lane's ledger, to re-hash>]
""")
swap("""import { fileURLToPath } from "node:url";
""", """import { fileURLToPath } from "node:url";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";
""")
swap("""const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const rows of Object.values(shard)) for (const r of rows) cited.set(r[3], (cited.get(r[3]) || 0) + 1);
}
""", """// and, for a witness the record says is judged row by row, the rows its
// admitted_rows names, read from the bytes the record names (or why not)
const SEP = "\\x01";
const byRowNamed = new Map();   // m -> Set of m, key and words; or why they could not be read
for (const [m, w] of Object.entries(rec.witnesses || {})) {
  if (!w || w.corpus !== "BY_ROW") continue;
  const a = w.admitted_rows || {};
  try {
    if (typeof a.kept_here !== "string" || !/^[0-9a-f]{64}$/u.test(String(a.sha256)) || !Number.isInteger(a.bytes) || !Number.isInteger(a.lines)) throw new PinFault(`the record names no list of the rows the ledger admits for ${m}`);
    const lines = readPinnedLines(join(K3, a.kept_here), { bytes: a.bytes, sha256: a.sha256, lines: a.lines, ...(a.stored ? { stored: a.stored } : {}) }, a.kept_here);
    byRowNamed.set(m, new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))));
  } catch (e) { if (!(e instanceof PinFault)) throw e; byRowNamed.set(m, e.message); }
}
const byRowOff = new Map();   // m -> served rows of a BY_ROW witness that its admitted_rows does not name
const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(shard)) for (const r of rows) {
    cited.set(r[3], (cited.get(r[3]) || 0) + 1);
    const named = byRowNamed.get(String(r[3]));
    if (named instanceof Set && !named.has([String(r[3]), k, r[1]].join(SEP))) byRowOff.set(String(r[3]), (byRowOff.get(String(r[3])) || 0) + 1);
  }
}
""")
swap("""const served = [...cited.entries()].filter(([m]) => (known[m] || {}).corpus === REFUSED);
check("L2  no witness this shelf cites is one M refuses",
  served.length === 0,
  served.length
    ? `${served.length} refused witness(es) are cited by ${served.reduce((t, [, n]) => t + n, 0).toLocaleString()} rows: ${served.map(([m]) => `${m} ${known[m].label}`).join(" · ").slice(0, 220)}`
    : `${cited.size} witnesses, none describing a language outside Hebrew and Aramaic${(rec.values || {}).REFUSED ? ` — the ledger refuses ${rec.values.REFUSED.sources} source(s) and this shelf cites none of them` : ""}`);
""", """const served = [...cited.entries()].filter(([m]) => (known[m] || {}).corpus === REFUSED);
const byRowCited = [...cited.keys()].filter((m) => byRowNamed.has(String(m)));
const byRowUnread = byRowCited.filter((m) => !(byRowNamed.get(String(m)) instanceof Set)).map((m) => `${m}: ${byRowNamed.get(String(m))}`);
const byRowStray = [...byRowOff.entries()];
check("L2  no witness this shelf cites is one M refuses, and a witness the ledger judges row by row (BY_ROW) stands only in the rows its admitted_rows names",
  served.length === 0 && byRowStray.length === 0 && byRowUnread.length === 0,
  served.length || byRowStray.length || byRowUnread.length
    ? [served.length ? `${served.length} refused witness(es) are cited by ${served.reduce((t, [, n]) => t + n, 0).toLocaleString()} rows: ${served.map(([m]) => `${m} ${known[m].label}`).join(" · ").slice(0, 220)}` : "",
      byRowStray.length ? `${byRowStray.length} witness(es) judged row by row stand in ${byRowStray.reduce((t, [, n]) => t + n, 0).toLocaleString()} row(s) their admitted_rows does not name: ${byRowStray.map(([m, n]) => `${m} ${n}`).join(" · ")}` : "",
      ...byRowUnread].filter(Boolean).join(" · ").slice(0, 400)
    : `${cited.size} witnesses, none describing a language outside Hebrew and Aramaic${(rec.values || {}).REFUSED ? ` — the ledger refuses ${rec.values.REFUSED.sources} source(s) and this shelf cites none of them` : ""}${byRowCited.length ? ` · ${byRowCited.length} judged row by row (${byRowCited.map((m) => `${m} ${cited.get(m)}`).join(", ")} rows), every row of them named by its admitted_rows` : ""}`);
""")
swap("""  const sha = createHash("sha256").update(readFileSync(ledgerPath)).digest("hex");
  check("L3  the record was emitted from the ledger it names", sha === (rec.ledger || {}).sha256,
""", """  const sha = createHash("sha256").update(readFileSync(ledgerPath)).digest("hex");
  // and each witness judged row by row names the rows the ledger names for its label
  const lg = JSON.parse(readFileSync(ledgerPath, "utf8")), lgOf = new Map((lg.sources || []).map((x) => [x.source, x]));
  const rowsAway = Object.entries(rec.witnesses || {}).filter(([, w]) => w && w.corpus === "BY_ROW" && ((lgOf.get(w.label) || {}).admitted_rows || {}).sha256 !== (w.admitted_rows || {}).sha256).map(([m]) => m);
  check("L3  each witness the record judges row by row names the rows the ledger names for its label", rowsAway.length === 0,
    rowsAway.length ? `${rowsAway.join(", ")}: the record's admitted rows are not the ones the ledger names` : `${Object.values(rec.witnesses || {}).filter((w) => w && w.corpus === "BY_ROW").length} witness(es) judged row by row`);
  check("L3  the record was emitted from the ledger it names", sha === (rec.ledger || {}).sha256,
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
