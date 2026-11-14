# check-piece-store-v1, P9, after core-block-rule-v1 (the owner, 14 November 2026): a card whose line reads the
# source's set opens on the set's core block, and that open is itself the card's first ask of the book's piece file.
# So where the card opens on a block, the first ask is read as it opens (no piece claim while the file has not
# arrived), and the block pressed next is the ask that comes again; elsewhere the first ask is the block pressed, as
# before. Each edit is refused unless its text stands exactly once.
# python3 -I 104-the-piece-check-knows-the-first-ask.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""//   P9  a piece file that did not arrive is asked again: the first fetch of
//       the book's file fails, and the next card at the same cell carries
//       its claims
""", """//   P9  a piece file that did not arrive is asked again: the first fetch of
//       the book's file fails, and the next card at the same cell carries
//       its claims (a card that opens on the core block of its set asks as it
//       opens, core-block-rule-v1: that open is the first ask)
""")
one("""  await land(A.book, A.at); await press(CUT, A.cut); await press(CELL, A.cell);
  const first = await piecePills();
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
""", """  await land(A.book, A.at);
  // a card on the core block of its set asked the book's file as it opened: that ask is the first, read here
  const onCore = await p.evaluate(() => !!document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]') && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1);
  let first;
  if (onCore) { first = await piecePills(); await press(CUT, A.cut); await press(CELL, A.cell); }
  else { await press(CUT, A.cut); await press(CELL, A.cell); first = await piecePills(); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
""")
open(p, "w", encoding="utf-8").write(s)
print("check-piece-store-v1.mjs: 2 edits")
