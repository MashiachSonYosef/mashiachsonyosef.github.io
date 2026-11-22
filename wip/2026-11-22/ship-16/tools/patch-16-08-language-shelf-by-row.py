# Ship 16, patch 8: the language shelf of a witness the ledger judges row by row. The record says, for each BY_ROW
# witness, what its admitted lines count as (rows_count_as, recounted from the list's own lines: nothing typed); the
# page's language shelf and its mirror in tools/gloss-m-v1.mjs (which prices each shelf's set of switches) shelve a
# BY_ROW witness whose admitted lines all count as Aramaic under «Aramaic», so it draws no «+ Aramaic» tag; every
# other BY_ROW witness falls back as before. No order and no other reader of `corpus` changes. The check holds the
# field to the lines. Applied after patch 16-04. Usage: patch-16-08-language-shelf-by-row.py <reader>
import io, sys
R = sys.argv[1]
s = ""
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

# one rule, written the same in the page and in gloss-m-v1 (each in its own words of the record it holds)
RULE_COMMENT = """// THE LANGUAGE SHELF OF A WITNESS JUDGED ROW BY ROW (22 November 2026, the corpus lane's source ledger v1.1). A
// BY_ROW witness is neither admitted nor refused whole, so its value names no language and fell to «Hebrew in
// general»; the record says what its admitted lines count as (rows_count_as, recounted by the emitter from the
// list's own lines). Where every one of them counts as Aramaic it is shelved as Aramaic, and so wears no «+ Aramaic»
// tag; any other BY_ROW witness falls back as before. Only the language shelf asks this: the era and outside-the-era
// orders read the witness's value as the record gives it (BY_ROW is not the Bible's and is outside, as ARAMAIC is)."""
FN = """const shelfCorpusOf = (w) => { if (!w) return null; const c = w.rows_count_as; return w.corpus === "BY_ROW" && c && typeof c === "object" && !Array.isArray(c) && Object.keys(c).length === 1 && Object.keys(c)[0] === "Aramaic" ? "ARAMAIC" : w.corpus || null; };"""

# ---- tools/emit-source-corpus-v1.mjs ----------------------------------------------------------------------------
p = R + "/tools/emit-source-corpus-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""// fault this file exists to stop.
//
// Run: node tools/emit-source-corpus-v1.mjs""", """// fault this file exists to stop.
//
// 2026-11-22, the same day. WHAT A BY_ROW WITNESS'S ROWS COUNT AS. BY_ROW says
// how a label is judged, not which language it answers for, and the page's
// language shelf put such a witness under «Hebrew in general». Each line of
// the admitted list says what its own source's field counts as (language.
// counts_as), so the record carries, for each BY_ROW witness, those values
// over its own lines, each with its count (rows_count_as): recounted here from
// the lines, never typed. Lines that name none add nothing; a witness whose
// lines name none carries {}. The page shelves by it (shelfCorpusOf).
//
// Run: node tools/emit-source-corpus-v1.mjs""")
swap("""  const got = { entry: a, kept_here: kept, stored: L.list.stored || null, bytes: L.list.bytes, lines: L.list.lines, named: new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))) };
""", """  const got = { entry: a, kept_here: kept, stored: L.list.stored || null, bytes: L.list.bytes, lines: L.list.lines, named: new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))), countsAs: countsAsOf(lines) };
""")
swap("""const admittedOf = new Map();
""", """const admittedOf = new Map();
// what each m's lines count as, by their own language field, each value with its count (most first, then by name)
const countsAsOf = (lines) => {
  const by = new Map();
  for (const e of lines) {
    if (!by.has(e.m)) by.set(e.m, {});
    const v = e.language && typeof e.language.counts_as === "string" && e.language.counts_as ? e.language.counts_as : null;
    if (v) by.get(e.m)[v] = (by.get(e.m)[v] || 0) + 1;
  }
  for (const [m, o] of by) by.set(m, Object.fromEntries(Object.entries(o).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))));
  return by;
};
""")
swap("""    witnesses[m].rows_named_by_admitted_rows = rows - off;
""", """    witnesses[m].rows_named_by_admitted_rows = rows - off;
    witnesses[m].rows_count_as = a.countsAs.get(m) || {};
""")
swap("""${w.rows_named_by_admitted_rows} named by ${w.admitted_rows.kept_here}`);
""", """${w.rows_named_by_admitted_rows} named by ${w.admitted_rows.kept_here}; its lines count as ${JSON.stringify(w.rows_count_as)}`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/check-source-corpus-v1.mjs ---------------------------------------------------------------------------
p = R + "/tools/check-source-corpus-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//   L3  the record was emitted from the ledger it names, and the ledger it
//       names is the one on disk
""", """//   L3  the record was emitted from the ledger it names, and the ledger it
//       names is the one on disk
//   L4  each witness judged row by row says what its admitted lines count as
//       (rows_count_as, which the page's language shelf reads), and it is what
//       those lines count as, recounted here: a derived field, never typed
//       (22 November 2026)
""")
swap("""const byRowNamed = new Map();   // m -> Set of m, key and words; or why they could not be read
""", """const byRowNamed = new Map();   // m -> Set of m, key and words; or why they could not be read
const byRowCounts = new Map();  // m -> what its own lines count as, each value with its count
""")
swap("""    byRowNamed.set(m, new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))));
""", """    byRowNamed.set(m, new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))));
    const c = {};
    for (const e of lines) if (e.m === m && e.language && typeof e.language.counts_as === "string" && e.language.counts_as) c[e.language.counts_as] = (c[e.language.counts_as] || 0) + 1;
    byRowCounts.set(m, c);
""")
swap("""// L3 · the record stands on the ledger it names
""", """// L4 · what a BY_ROW witness's lines count as is the lines' own, recounted
{
  const ordered = (o) => JSON.stringify(Object.entries(o && typeof o === "object" && !Array.isArray(o) ? o : { "(not an object)": -1 }).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)));
  const off = [], said = [];
  for (const [m, w] of Object.entries(rec.witnesses || {})) {
    if (!w || w.corpus !== "BY_ROW") continue;
    const got = byRowCounts.get(m);
    if (!got) { off.push(`${m}: its admitted lines could not be read`); continue; }
    if (w.rows_count_as === undefined || ordered(w.rows_count_as) !== ordered(got)) off.push(`${m}: the record says its lines count as ${JSON.stringify(w.rows_count_as)}, and they count as ${JSON.stringify(got)}`);
    else said.push(`${m} ${Object.entries(got).map(([v, n]) => `${v} ${n}`).join(", ") || "none"}`);
  }
  check("L4  each witness judged row by row says what its admitted lines count as, and that is what they count as, recounted from the lines",
    off.length === 0, off.length ? off.join(" · ").slice(0, 400) : said.length ? said.join(" · ") : "no witness judged row by row is cited");
}

// L3 · the record stands on the ledger it names
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/gloss-m-v1.mjs: the shelves priced for the switches -------------------------------------------------
p = R + "/tools/gloss-m-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""export const jointSwitchCosts = (store, gloss, gm, table, corpusRec, weights = null) => {
""", RULE_COMMENT + """
// The page (zone.html) carries the same function under the same name, so a shelf priced here is the shelf it draws.
export """ + FN + """
export const jointSwitchCosts = (store, gloss, gm, table, corpusRec, weights = null) => {
""")
swap("""    const corpus = ids.map((id) => ((corpusRec && corpusRec.witnesses && corpusRec.witnesses[id]) || {}).corpus || null).find(Boolean) || "UNDECLARED";
    return { key, ids: [...ids].sort(), wcMain, corpus, lic: table[ids[0]].lic };
""", """    const corpus = ids.map((id) => ((corpusRec && corpusRec.witnesses && corpusRec.witnesses[id]) || {}).corpus || null).find(Boolean) || "UNDECLARED";
    const shelfCorpus = ids.map((id) => shelfCorpusOf(corpusRec && corpusRec.witnesses && corpusRec.witnesses[id])).find(Boolean) || "UNDECLARED";
    return { key, ids: [...ids].sort(), wcMain, corpus, shelfCorpus, lic: table[ids[0]].lic };
""")
swap("""    language: (g) => (g.corpus === "ARAMAIC" ? "Aramaic" : g.corpus === "BIBLICAL" ? "the Bible\\u2019s Hebrew" : "Hebrew in general"),
""", """    language: (g) => (g.shelfCorpus === "ARAMAIC" ? "Aramaic" : g.shelfCorpus === "BIBLICAL" ? "the Bible\\u2019s Hebrew" : "Hebrew in general"),
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- zone.html: the page's language shelf and its «+ Aramaic» tag ------------------------------------------------
p = R + "/zone.html"; s = io.open(p, encoding="utf-8").read()
swap("""  const CORPUS_OF = (m) => (CORPUS_REC && CORPUS_REC.witnesses && CORPUS_REC.witnesses[m] || {}).corpus || null;
""", """  const CORPUS_OF = (m) => (CORPUS_REC && CORPUS_REC.witnesses && CORPUS_REC.witnesses[m] || {}).corpus || null;
""" + "\n".join("  " + l for l in RULE_COMMENT.split("\n")) + """
  // tools/gloss-m-v1.mjs carries the same function under the same name, and prices the shelves it draws.
  """ + FN + """
  const SHELF_CORPUS_OF = (m) => shelfCorpusOf(CORPUS_REC && CORPUS_REC.witnesses && CORPUS_REC.witnesses[m]);
""")
swap("""      g.corpus = g.ids.map((id) => CORPUS_OF(id)).find(Boolean) || "UNDECLARED";
""", """      g.corpus = g.ids.map((id) => CORPUS_OF(id)).find(Boolean) || "UNDECLARED";
      g.shelfCorpus = g.ids.map((id) => SHELF_CORPUS_OF(id)).find(Boolean) || "UNDECLARED";
""")
swap("""if (ov) return ov.shelf; const c = g.corpus; return c === "ARAMAIC" ? "Aramaic" """, """if (ov) return ov.shelf; const c = g.shelfCorpus; return c === "ARAMAIC" ? "Aramaic" """)
swap("""      if (shelveBy === "language" && g.corpus !== "ARAMAIC" && /Aramaic|Chaldee/.test(g.lang)) {
""", """      if (shelveBy === "language" && g.shelfCorpus !== "ARAMAIC" && /Aramaic|Chaldee/.test(g.lang)) {
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
