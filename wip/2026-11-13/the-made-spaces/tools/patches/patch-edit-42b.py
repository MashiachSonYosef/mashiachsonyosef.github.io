# The pool's two loops read alike but for their indent, so one pair with a count of two replaces the two pairs.
import sys
p = sys.argv[1]
s = open(p, encoding="utf8").read()
a = """  [`      (nd ? [String(routeText)] : readingsOfRow(row)).forEach((reading) => {
`,
   `      (nd ? [routePrinted(row)] : readingsOfRow(row)).forEach((reading) => {
`],
"""
b = """  [`        (nd ? [String(routeText)] : readingsOfRow(row)).forEach((reading) => {
`,
   `        (nd ? [routePrinted(row)] : readingsOfRow(row)).forEach((reading) => {
`],
"""
assert s.count(a) == 1 and s.count(b) == 1, (s.count(a), s.count(b))
s = s.replace(a, "")
s = s.replace(b, """  [`(nd ? [String(routeText)] : readingsOfRow(row)).forEach((reading) => {`,
   `(nd ? [routePrinted(row)] : readingsOfRow(row)).forEach((reading) => {`, 2],
""")
open(p, "w", encoding="utf8").write(s)
print("patched")
