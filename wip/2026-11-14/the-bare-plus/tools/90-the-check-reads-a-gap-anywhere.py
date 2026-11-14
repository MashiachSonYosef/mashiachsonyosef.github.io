# check-sign-gap-joiner-v1: a gap is read as a piece of its own wherever it stands in a stretch between joiners, so a
# joiner left out between two pieces that print («and[gap]this») fails G1 as a joiner beside the gap does. No line
# at rest holds a zero-width space inside a stretch (measured 14 November 2026: 0 of 22,063 lines with a gap, before
# and after), so the stricter reading changes no verdict on a sound page.
# python3 -I 90-the-check-reads-a-gap-anywhere.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""//   G1  every line at rest that holds a gap, in every served work, reads back into its pieces (by its joiners
//       and by the gap) and draws again to the same text: no joiner at either end beside a gap, none on both
//       sides of one, and one between any two pieces that print
""", """//   G1  every line at rest that holds a gap, in every served work, reads back into its pieces (by its joiners
//       and by the gap) and draws again to the same text: no joiner at either end beside a gap, none on both
//       sides of one, and one between any two pieces that print. A gap is read as a piece of its own wherever it
//       stands, so a joiner left out between two pieces that print fails here too; no reading holds a zero-width
//       space of its own (none of 22,063 lines with a gap did on 14 November 2026), so one inside a stretch
//       between joiners is a joiner missing, or a source's own character taken for a gap, and either is a fault
""")
one("""// a line read back into its pieces: by its joiners, and a gap at either edge of a stretch is a piece of its own
const piecesOf = (text) => {
  const out = [];
  for (const chunk of String(text).split(JOINER)) {
    let a = 0, b = chunk.length, tail = 0;
    while (a < b && chunk[a] === GAP) { out.push(GAP); a += 1; }
    while (b > a && chunk[b - 1] === GAP) { tail += 1; b -= 1; }
    if (b > a) out.push(chunk.slice(a, b));
    for (let t = 0; t < tail; t += 1) out.push(GAP);
  }
  return out;
};
""", """// a line read back into its pieces: by its joiners, and every gap, wherever it stands, is a piece of its own
const piecesOf = (text) => String(text).split(JOINER).flatMap((chunk) => chunk.split(GAP).flatMap((x, i) => (i ? [GAP, x] : [x]))).filter((x) => x !== "");
""")
open(p, "w", encoding="utf-8").write(s)
print("check-sign-gap-joiner-v1.mjs: 2 edits")
