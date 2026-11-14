# check-piece-store-v1, P9, replacing edit 104's reading: the book's piece file is held back for as long as the
# check says (every fetch refused, the page's own second ask within the card included), and the card shows no
# piece claim meanwhile, wherever it opens (the core block of its set, core-block-rule-v1, or a block pressed);
# then the file is let through, and the next card at the same cell carries the claims. The law is the same: a
# file that did not arrive is asked again. A moment-to-moment reading (the first refused, the second let through)
# raced the page's own retry a moment later once the card asked as it opened. Refused unless each text stands once.
# python3 -I 104b-p9-holds-the-file-back-until-it-says.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""// P9: the first fetch of the book's piece file fails; the next card asks again
if (A) {
  let failed = 0;
  await p.route(`**/data/piece-store/${A.book}.json`, (r) => { if (failed === 0) { failed += 1; return r.abort(); } return r.continue(); });
""", """// P9: the book's piece file does not arrive while it is held back; let through, the next card asks again
if (A) {
  let failed = 0, holding = true;
  await p.route(`**/data/piece-store/${A.book}.json`, (r) => { if (holding) { failed += 1; return r.abort(); } return r.continue(); });
""")
one("""  await land(A.book, A.at);
  // a card on the core block of its set asked the book's file as it opened: that ask is the first, read here
  const onCore = await p.evaluate(() => !!document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]') && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1);
  let first;
  if (onCore) { first = await piecePills(); await press(CUT, A.cut); await press(CELL, A.cell); }
  else { await press(CUT, A.cut); await press(CELL, A.cell); first = await piecePills(); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
""", """  await land(A.book, A.at);
  // a card on the core block of its set asks the book's file as it opens (core-block-rule-v1); the block is then
  // pressed as before, and the page's own second ask a moment later is refused too
  const onCore = await p.evaluate(() => !!document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]') && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1);
  await press(CUT, A.cut); await press(CELL, A.cell);
  await p.waitForTimeout(1500);
  const first = await piecePills();
  holding = false;
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
""")
one("""  check("P9 a piece file that did not arrive is asked again on the next card", failed === 1 && first.length === 0 && again.some((h) => h.t === A.R), `first fetch failed: ${failed === 1} · the card opened on""",
    """  check("P9 a piece file that did not arrive is asked again on the next card", failed >= 1 && first.length === 0 && again.some((h) => h.t === A.R), `${failed} fetch(es) refused while held · the card opened on""")
open(p, "w", encoding="utf-8").write(s)
print("check-piece-store-v1.mjs: 3 edits")
