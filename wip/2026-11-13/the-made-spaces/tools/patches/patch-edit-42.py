# The page's three functions stand before the record key that uses the third of them, so nothing is used before it
# is defined: the insertion's anchor moves from the ledger-division comment to the record-key comment above it.
import sys
p = sys.argv[1]
s = open(p, encoding="utf8").read()
old_head = """  [`  // LEDGER DIVISION (ledger-division-rule-v1 of 6 November 2026, v2 the same evening). The readings
`,
   `  // MADE SPACES CLOSE AT PRINT"""
new_head = """  [`  // P \\u00b7 two D records are one record when their wording is the same by the
`,
   `  // MADE SPACES CLOSE AT PRINT"""
assert s.count(old_head) == 1, s.count(old_head)
s = s.replace(old_head, new_head)
old_tail = """  const recordPrinted = (row) => (row[2] ? closed(String(row[2]), Array.isArray(row[9]) ? row[9][1] : null) : routePrinted(row));
  // LEDGER DIVISION (ledger-division-rule-v1 of 6 November 2026, v2 the same evening). The readings
`],"""
new_tail = """  const recordPrinted = (row) => (row[2] ? closed(String(row[2]), Array.isArray(row[9]) ? row[9][1] : null) : routePrinted(row));
  // P \\u00b7 two D records are one record when their wording is the same by the
`],"""
assert s.count(old_tail) == 1, s.count(old_tail)
s = s.replace(old_tail, new_tail)
open(p, "w", encoding="utf8").write(s)
print("patched")
