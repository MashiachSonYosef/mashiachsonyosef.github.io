# Ship 12, patch 10: the lane state says the re-admission. The strike's figures stay cumulative (every source ever
# struck); beside them it names the sources struck now and the sources re-admitted since, and its check holds the
# three to one another.
import io, sys
R = sys.argv[1]
p = R + "/tools/emit-lane-state-v1.mjs"; s = io.open(p, encoding="utf-8").read()
old = """      struck_m_ids: la.struck_m_ids || [],
      record: "reader/data/language-admission-v1.json",
"""
new = """      struck_m_ids: la.struck_m_ids || [],
      // A SOURCE STRUCK AND BACK SINCE (readmission-rule-v1, 21 November 2026): sources_struck above is every source
      // the admission ever struck, which is what a peer lane differences its own store against; the sources struck
      // now are struck_m_ids, and the ones back on what their own source names are these. Said only once any is
      ...((la.readmitted_m_ids || []).length ? { readmitted_m_ids: la.readmitted_m_ids, sources_readmitted: la.readmitted_m_ids.length, sources_struck_now: (la.struck_m_ids || []).length,
        readmission: la.readmission ? { rule_id: la.readmission.rule_id, record: `reader/${la.readmission.record}`, relay: la.readmission.relay, rows_listed: la.readmission.rows_listed } : null } : {}),
      record: "reader/data/language-admission-v1.json",
"""
assert s.count(old) == 1; s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
p = R + "/tools/check-lane-state-v1.mjs"; s = io.open(p, encoding="utf-8").read()
old = """check("S3  the strike it reports is cumulative and matches the record",
  s.language_admission.sources_struck === (la.struck_m_ids || []).length
    && s.language_admission.sources_struck === cum.sources_struck
"""
new = """// (a source struck and back since stays in the cumulative figure and leaves the struck list: the lane state names the
// re-admitted beside the struck, as the index does, and the two together are every source ever struck)
const backSince = la.readmitted_m_ids || [];
check("S3  the strike it reports is cumulative and matches the record",
  s.language_admission.sources_struck === (la.struck_m_ids || []).length + backSince.length
    && JSON.stringify(s.language_admission.readmitted_m_ids || []) === JSON.stringify(backSince)
    && JSON.stringify(s.language_admission.struck_m_ids || []) === JSON.stringify(la.struck_m_ids || [])
    && s.language_admission.sources_struck === cum.sources_struck
"""
assert s.count(old) == 1; s = s.replace(old, new)
old = """  `${s.language_admission.sources_struck} sources · ${(s.language_admission.routes_struck || 0).toLocaleString()} routes · ${s.language_admission.rounds} round(s)`);
"""
new = """  `${s.language_admission.sources_struck} sources · ${(s.language_admission.routes_struck || 0).toLocaleString()} routes · ${s.language_admission.rounds} round(s)${backSince.length ? ` · ${(la.struck_m_ids || []).length} struck now, ${backSince.length} re-admitted since` : ""}`);
"""
assert s.count(old) == 1; s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
