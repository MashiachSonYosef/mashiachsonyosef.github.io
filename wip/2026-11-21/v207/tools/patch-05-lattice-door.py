# Ship 12, patch 5: a lattice card of a source that returned for its listed rows alone heads a headword stack only
# where a served row of that source speaks the card's words under the card's key. Usage: patch-05-lattice-door.py <reader>
import io, sys
p = sys.argv[1] + "/tools/project-lattice-v12-v1.mjs"; s = io.open(p, encoding="utf-8").read()
old = "const heldLabels = new Set(labelOf.values());\n"
new = """const heldLabels = new Set(labelOf.values());
// A SOURCE THAT RETURNED FOR ITS LISTED ROWS ALONE IS HELD FOR THOSE ROWS ALONE (readmission-rule-v1, 21 November
// 2026). PanLex and English Wiktionary's translation tables came back for the rows whose own language field names
// Hebrew or Aramaic; their other rows stay out (PanLex: 10,052 of 14,008). The lattice is the corpus lane's own
// catalog and still carries a card for every row such a source ever had, so the label being held again is not
// enough: a card of such a source is the headword's line only where a served row of that source speaks the card's
// words under the card's key. A source that returned whole is held like any other.
const listedRowsAloneLabels = new Set(Object.values(store.index.m_sources || {}).filter((src) => src.readmitted && src.readmitted.returns !== "whole").map((src) => src.label || ""));
const cardHasItsRow = (key, card) => (store.routesWhole(key) || []).some((r) => labelOf.get(r[3]) === card.src && String(r[1]) === String(card.text));
"""
assert s.count(old) == 1; s = s.replace(old, new)
old = "      if (top && !heldLabels.has(top.src)) stats.hg_skipped_source_not_held += 1;\n"
new = old + "      else if (top && listedRowsAloneLabels.has(top.src) && !cardHasItsRow(L.key, top)) stats.hg_skipped_no_listed_row_of_its_source += 1;\n"
assert s.count(old) == 1; s = s.replace(old, new)
old = "hg_skipped_source_not_held: 0, "
assert s.count(old) == 1; s = s.replace(old, old + "...(listedRowsAloneLabels.size ? { hg_skipped_no_listed_row_of_its_source: 0 } : {}), ")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
