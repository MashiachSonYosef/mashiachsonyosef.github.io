# zone.html, gap-blob-rule-v1 (the owner, 14 November 2026, of the vav and the object marker at Genesis 1:1 once
# the joiner beside the hidden sign's gap went: "spacing looks better but blobs will need updated"). A hidden sign's
# letters still wear a blob of their own (16 and 23 October), but it closes around their ink, top and foot drawn as
# every blob's are, and ties to nothing: the gap prints nothing, and the blob that ran down to its empty slot was a
# stalk pressed against its neighbor's blob, crossing it in the English reader. The gap keeps its slot in the line.
# Each edit is refused unless its text stands exactly once.
# python3 -I 106-a-hidden-signs-letters-wear-their-own-blob.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

# the gap's own comment: its letters' blob closes around them
one("""  // source's division, and the gap's letters wear their own blob. The gap is
  // a zero-width space, which no trim removes; the row gives it a little
  // width to tie to. Where every piece is a sign, the signs stand.
""", """  // source's division, and the gap's letters wear their own blob, closed
  // around their ink (drawPairs). The gap is a zero-width space, which no
  // trim removes; the row keeps it a little width, its place in the line.
  // Where every piece is a sign, the signs stand.
""")
one("""    // blob"): the gap has no ink to measure, so its blob ties to a hair's
    // breadth where the gap stands, and the letters keep their shape
""", """    // blob"): the gap has no ink to measure, so it is measured as a hair's
    // breadth where it stands, and the letters keep their shape. Since
    // 2026-11-14 the letters' blob closes around them and ties to nothing
    // (drawPairs); the hair still says where the gap stands among the pieces
""")
# a pair says whether its English is a hidden sign's gap
one("""const e = enWhole(enEl); return e ? [{ he: whole, en: e, wi, piece: 0, n: 1 }] : []; }""",
    """const e = enWhole(enEl); return e ? [{ he: whole, en: e, wi, piece: 0, n: 1, gap: !!(enEl && enEl.classList.contains("gap")) }] : []; }""")
one("""    return boxes.map((x, i) => ({ he: x, en: enBoxes[i], wi, piece: i, n: boxes.length }));""",
    """    return boxes.map((x, i) => ({ he: x, en: enBoxes[i], wi, piece: i, n: boxes.length, gap: pcs[i].classList.contains("gap") }));""")
# a gap's English is drawn by no blob, so it shares no seam with the English beside it
one("""    seam(hebs); seam(engs);
""", """    seam(hebs); seam(engs.filter((_, k) => !pairs[k].gap));
""")
# a path walked the other way, for a foot drawn from right to left
one("""    for (const [k, pr] of pairs.entries()) {
      const he = hebs[k], eB = engs[k];
""", """    // a path of M, L and Q, every point written whole, walked from its far end: the same line, the other way
    const backward = (d) => {
      const segs = []; let at = null;
      for (const [, c, nums] of d.matchAll(/([MLQ])([^MLQ]*)/g)) {
        const v = nums.trim().split(/ +/).map(Number);
        if (c === "Q") { segs.push({ from: at, ctl: [v[0], v[1]], to: [v[2], v[3]] }); at = [v[2], v[3]]; continue; }
        if (at && c === "L") segs.push({ from: at, to: [v[0], v[1]] });
        at = [v[0], v[1]];
      }
      if (!at) return "";
      return [`L${f(at[0])} ${f(at[1])}`, ...segs.reverse().map((x) => (x.ctl ? `Q${f(x.ctl[0])} ${f(x.ctl[1])} ${f(x.from[0])} ${f(x.from[1])}` : `L${f(x.from[0])} ${f(x.from[1])}`))].join(" ");
    };
    for (const [k, pr] of pairs.entries()) {
      const he = hebs[k], eB = engs[k];
""")
# the top's band walls, for both readers and the gap's blob alike
one("""      let d;
      if (!en) {
        const h = hebrewEdge(he, "top", y1);
        const rd = Math.max(0, Math.min(r0, (D.R - D.L) / 2, (D.B - y2) / 2, room(D.iL - D.L, D.B - D.iB), room(D.R - D.iR, D.B - D.iB)));
        // the top keeps the band walls too: where a neighbor's mark reaches
        // over this piece (a telisha, a lamed's flag), the top steps down to
        // this piece's own letters there, on the line the two now share
        const inBand = (x, k) => x >= he.Lb[k] - GRAIN && x <= he.Rb[k] + GRAIN;
        const topCap = (x) => (inBand(x, 0) ? null : inBand(x, 1) ? he.yA : inBand(x, 2) ? he.yB : null);
        d = """, """      // the top keeps the band walls too: where a neighbor's mark reaches
      // over this piece (a telisha, a lamed's flag), the top steps down to
      // this piece's own letters there, on the line the two now share
      const inBand = (x, k) => x >= he.Lb[k] - GRAIN && x <= he.Rb[k] + GRAIN;
      const topCap = (x) => (inBand(x, 0) ? null : inBand(x, 1) ? he.yA : inBand(x, 2) ? he.yB : null);
      let d;
      // RULE: gap-blob-rule-v1-a-hidden-signs-letters-wear-a-blob-of-their-own-ink-and-tie-to-nothing
      // A HIDDEN SIGN'S LETTERS WEAR A BLOB CLOSED AROUND THEIR INK (the
      // owner, 2026-11-14, of the vav and the object marker at Genesis 1:1,
      // once the joiner beside the gap went: "spacing looks better but blobs
      // will need updated"). The gap prints nothing, and its letters' blob ran
      // down to its empty slot, a stalk pressed against the blob beside it,
      // and in the English reader it crossed that blob. The letters still wear
      // a blob of their own (2026-10-23: "2 examples of a missing blob"): its
      // top and its foot are drawn as every blob's far side is, and it ties to
      // nothing. The gap keeps its slot in the line (2026-10-16).
      if (pr.gap) d = `${topPath({ ...he, capAt: topCap })} ${backward(footPath(he))} Z`;
      else if (!en) {
        const h = hebrewEdge(he, "top", y1);
        const rd = Math.max(0, Math.min(r0, (D.R - D.L) / 2, (D.B - y2) / 2, room(D.iL - D.L, D.B - D.iB), room(D.R - D.iR, D.B - D.iB)));
        d = """)
one("""data-en="${f(eB.L)},${f(eB.R)},${f(eB.T)},${f(eB.B)}"`;""",
    """data-en="${f(eB.L)},${f(eB.R)},${f(eB.T)},${f(eB.B)}"${pr.gap ? ' data-gap="1"' : ""}`;""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: 8 edits")
