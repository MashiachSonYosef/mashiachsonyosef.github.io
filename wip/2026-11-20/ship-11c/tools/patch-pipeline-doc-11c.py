# Ship 11c: PIPELINE.md says how the landings that need no ruling land, and the store steps after a landing.
# Usage: python3 patch-pipeline-doc-11c.py <PIPELINE.md>
import sys, textwrap
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
anchor = "> `tools/check-words-back-v1.mjs` holds the landing.\n"
assert s.count(anchor) == 1, s.count(anchor)
assert "data/landings/PIN.json" not in s
para = ("Ship 11c (the corpus lane's relays v200, v201 and v202 of 20 November 2026: the landings that need no "
 "ruling) adds no step to the round. Each of the lane's lists is kept byte for byte in its own folder "
 "(`data/landings/`), and `data/landings/PIN.json` names them in the order they land. "
 "`tools/derive-landings-v1.mjs` proves every line of a list again on the store it meets when its turn comes "
 "and derives, only as the bytes the pin names, the rows that land and the lines not landed: a line its own "
 "source already prints under its key is named, not landed; a line with no rank takes the highest rank under "
 "its key plus one; lines of one source with the same words under one key are one row (landings-rule-v1). "
 "`tools/strike-rows-v1.mjs` (row-strike-rule-v8) lands each derived list, and a landing writes onto its row "
 "the entries its line names (`n`, `t`, `b`), which the row-strikes record keeps with the row. After the "
 "landings the store steps run once each, before the round and never by it, in this order: the ledgers' "
 "divisions; the made spaces, whose second road counts a row a later list landed as a row more "
 "(`tools/made-spaces-second-road-v1.mjs`); the own pointing; the row entries, which leave a landed row's "
 "entries to its landing and give a row landed back under the key a struck row's words stand under what that "
 "row's line alone said; the name rows; the sense openings; UBS's collocation rows. Then the form-of record "
 "is baked again. `tools/check-landings-v1.mjs` holds the landings: every line accounted for once, one round "
 "per list in the pin's order, and each landed line standing as its row with its entries.")
lines = textwrap.wrap(para, width=74, break_long_words=False, break_on_hyphens=False)
block = "".join("> " + l + "\n" for l in lines)
s = s.replace(anchor, anchor + block)
open(p, "w", encoding="utf-8").write(s)
print("PIPELINE.md: the landings' paragraph,", len(lines), "lines")
