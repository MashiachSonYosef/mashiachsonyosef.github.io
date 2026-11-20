# Ship 11c: the row strike's rule takes its next name, version 8: a landing writes the entries its line names.
# The tool's rule id, its header and its summary; the GUARDS lines of the checks that guard the rule (a past
# round keeps the version it ran under, so check-words-back's own constant for the round of 15 November stays).
# Usage: python3 patch-strike-rule-v8.py <reader/tools dir>
import sys, os
d = sys.argv[1]
V7 = "row-strike-rule-v7-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-the-hole-is-typed-and-a-landed-cut-is-counted-a-retext-from-words-back-keeps-the-rows-closes-and-facts"
V8 = V7.replace("row-strike-rule-v7-", "row-strike-rule-v8-") + "-a-landing-writes-the-entries-its-line-names"

# the checks that guard the rule: their GUARDS line names the rule as it is now
edits = []
for f in ("check-audit-calls-v1.mjs", "check-fold-strike-landing-v1.mjs", "check-store-continuity-v1.mjs", "check-words-back-v1.mjs", "check-landings-v1.mjs"):
    p = os.path.join(d, f)
    lines = open(p, encoding="utf-8").read().split("\n")
    at = [i for i, l in enumerate(lines) if l.startswith("// GUARDS:")]
    assert at, f
    if any(V8 in lines[i] for i in at): continue   # done before
    if f == "check-landings-v1.mjs":
        assert len(at) == 1
        lines[at[0]] = lines[at[0]] + ", " + V8
    else:
        has = [i for i in at if V7 in lines[i]]
        assert len(has) == 1 and lines[has[0]].count(V7) == 1, (f, has)
        lines[has[0]] = lines[has[0]].replace(V7, V8)
    edits.append((p, "\n".join(lines)))
for p, text in edits: open(p, "w", encoding="utf-8").write(text)

# the tool
p = os.path.join(d, "strike-rows-v1.mjs")
s = open(p, encoding="utf-8").read()
if V8 in s: print("the tool names version 8 already"); sys.exit(0)
assert s.count(V7) == 2, s.count(V7)
s = s.replace(V7, V8)
old = """// same source already holds to_text under the key, the list is refused.
"""
new = """// same source already holds to_text under the key, the list is refused.
// VERSION 8 (20 November 2026, the corpus lane's v200, v201 and v202). A
// LANDING WRITES THE ENTRIES ITS LINE NAMES. A landing list of the corpus
// lane names, for each row, the entries its own source gives it (facts: n
// its Strong's numbers, t STEP's lettered tags, b BDB's own entries). Until
// now a landed row carried none, and the tool that lays the lane's entries
// had no line for it. The landing writes them onto the row (slot 10) and
// this record keeps them with the row it landed; tools/apply-row-entries-v1
// leaves a landed row's entries to its landing, and
// tools/check-landings-v1.mjs holds each landed row to its line. A line
// that names no facts lands as before.
"""
assert s.count(old) == 1
s = s.replace(old, new)
assert s.count("console.log(`row strike v7 ·") == 1
s = s.replace("console.log(`row strike v7 ·", "console.log(`row strike v8 ·")
open(p, "w", encoding="utf-8").write(s)

print("the row strike's rule is version 8:", V8)
