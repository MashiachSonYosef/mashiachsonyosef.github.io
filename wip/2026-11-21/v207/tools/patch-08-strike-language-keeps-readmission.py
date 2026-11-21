# Ship 12, patch 8: the strike tool keeps a re-admission. Run again it rebuilt its record without the re-admissions and
# wrote every source the record ever struck back into the index's struck list. A source the record marks re-admitted
# is not in that list, and the record's re-admissions are carried forward.
import io, sys
p = sys.argv[1] + "/tools/strike-language-v1.mjs"; s = io.open(p, encoding="utf-8").read()
def sub(old, new):
    global s
    assert s.count(old) == 1, old[:60]; s = s.replace(old, new)
sub("""    kept_sources: Object.entries(decisions).filter(([, d]) => d.admitted)
      .map(([m, d]) => ({ m_id: m, reason: d.reason, evidence: d.evidence, label: d.label })),
""", """    kept_sources: Object.entries(decisions).filter(([, d]) => d.admitted)
      .map(([m, d]) => ({ m_id: m, reason: d.reason, evidence: d.evidence, label: d.label })),
    // THE RE-ADMISSIONS ARE CARRIED FORWARD (21 November 2026, readmission-rule-v1: tools/readmit-sources-v1.mjs
    // writes them). A source struck here on its label and back since on what its own source names stays among
    // struck_sources, marked `readmitted`, because that it was struck, and why, stays said; this run rebuilds the
    // record and must not drop what the re-admission wrote
    ...(prior && Array.isArray(prior.readmissions) ? { readmissions: prior.readmissions } : {}),
""")
sub("""    const want = record.struck_sources.map((s) => s.m_id);
""", """    // the struck list is the sources struck and not re-admitted since: a source the record marks re-admitted is in
    // the index again, and writing it back here made the index call one source struck and served at once
    const want = record.struck_sources.filter((s) => !s.readmitted).map((s) => s.m_id);
""")
sub("""    struck_m_ids: record.struck_sources.map((s) => s.m_id),
""", """    struck_m_ids: record.struck_sources.filter((s) => !s.readmitted).map((s) => s.m_id),
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
