# Ship 12, patch 7: the standing law of the language admission knows a re-admitted source. It still judges every
# source by its own label; a source that stands re-admitted (readmission-rule-v1) is judged by the languages its own
# source names, as tools/strike-language-v1.mjs itself reads them, and the strike's cumulative figures count the
# sources struck now with the sources re-admitted since.
import io, sys
p = sys.argv[1] + "/tools/check-language-admitted-v1.mjs"; s = io.open(p, encoding="utf-8").read()
def sub(old, new):
    global s
    assert s.count(old) == 1, old[:60]; s = s.replace(old, new)
sub("""// Judeo-Arabic lexicon fails here rather than reaching a page.
""", """// Judeo-Arabic lexicon fails here rather than reaching a page.
//
// A SOURCE THAT STANDS RE-ADMITTED IS JUDGED BY WHAT ITS OWN SOURCE NAMES
// (21 November 2026, readmission-rule-v1). The strike judged a source by the
// label this project gave it, and its own record says the way back is what
// the source itself names. A source in the index's list of the re-admitted
// carries those languages on its entry, and is judged by them exactly as the
// strike tool reads them (classify, on the entry whole); any other source is
// judged by its label, as before, whatever its entry carries. That the list
// of the re-admitted is the re-admission's record, and that every row of
// such a source is a row the corpus lane listed, is check-readmission-v1's.
""")
sub("""const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
""", """const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const reAdmitted = new Set((index.language_admission || {}).readmitted_m_ids || []);
const decide = (m, v) => (reAdmitted.has(m) && Array.isArray(v.languages) && v.languages.length ? classify(v) : classify(v.label));
// a zone's credit names its source by its label: the labels of the re-admitted sources the law admits
const reAdmittedLabels = new Set(Object.entries(index.m_sources).filter(([m, v]) => reAdmitted.has(m) && decide(m, v).admitted).map(([, v]) => v.label));
""")
sub("""  .map(([m, v]) => [m, v.label, classify(v.label)])
""", """  .map(([m, v]) => [m, v.label, decide(m, v)])
""")
sub("""  inIndex.length ? inIndex.map(([m, , d]) => `${m} (${d.evidence})`).join(" · ") : `${Object.keys(index.m_sources).length} sources, all admitted`);
""", """  inIndex.length ? inIndex.map(([m, , d]) => `${m} (${d.evidence})`).join(" · ") : `${Object.keys(index.m_sources).length} sources, all admitted${reAdmitted.size ? ` (${reAdmitted.size} re-admitted, each by the languages its own source names)` : ""}`);
""")
sub("""    if (classify(v.m || "").admitted) continue;
""", """    if (classify(v.m || "").admitted || reAdmittedLabels.has(v.m)) continue;
""")
sub("""    Number.isInteger(cum.sources_struck) && cum.sources_struck === (la.struck_m_ids || []).length,
    `cumulative says ${cum.sources_struck} source(s) struck; the struck list holds ${(la.struck_m_ids || []).length}`);
""", """    Number.isInteger(cum.sources_struck) && cum.sources_struck === (la.struck_m_ids || []).length + reAdmitted.size
      && !(la.struck_m_ids || []).some((m) => reAdmitted.has(m)),
    `cumulative says ${cum.sources_struck} source(s) struck; the struck list holds ${(la.struck_m_ids || []).length}${reAdmitted.size ? ` and ${reAdmitted.size} stand re-admitted since` : ""}`);
""")
sub("""    cum.routes_struck === null || (from && from.covers_m_ids === (la.struck_m_ids || []).length),
    from ? `covers ${from.covers_m_ids} of ${(la.struck_m_ids || []).length} struck ids` : "no source named");
""", """    cum.routes_struck === null || (from && from.covers_m_ids === (la.struck_m_ids || []).length + reAdmitted.size),
    from ? `covers ${from.covers_m_ids} of ${(la.struck_m_ids || []).length + reAdmitted.size} ids ever struck${reAdmitted.size ? ` (${(la.struck_m_ids || []).length} struck now, ${reAdmitted.size} re-admitted)` : ""}` : "no source named");
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
