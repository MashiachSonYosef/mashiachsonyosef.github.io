# check-default-picks-v1, its self-test H14: the sign planted back into a record may stand beside more than one place
# of STEP's own words (Daniel 1:16: the object marker beside a word of two entries, each carrying STEP's words), and
# the law names it once for each. H14 held it to exactly one fault; it holds every fault to the planted word.
# Usage: python3 patch-check-default-picks-h14.py <tools/check-default-picks-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = """went("H14", !GAPS.faults.length, h14.faults.length === 1 && h14.faults[0].startsWith(`${g14.b} ${g14.q.label} `),"""
new = """went("H14", !GAPS.faults.length, h14.faults.length >= 1 && h14.faults.every((f) => f.startsWith(`${g14.b} ${g14.q.label} `)),"""
assert s.count(old) == 1, s.count(old)
s = s.replace(old, new)
old = """  // it before STEP's words stood there (in memory: the first place whose gap stands only because STEP's words do)
"""
new = """  // it before STEP's words stood there (in memory: the first place whose gap stands only because STEP's words do).
  // The law names the word once for each place of STEP's words it stands beside (two at Daniel 1:16, a word of two
  // entries), so every fault is held to the planted word and there is at least one
"""
assert s.count(old) == 1, s.count(old)
s = s.replace(old, new)
open(p, "w", encoding="utf-8").write(s)
print("patched H14")
