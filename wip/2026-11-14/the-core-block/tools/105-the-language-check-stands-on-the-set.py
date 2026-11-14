# check-reading-language-v1, after core-block-rule-v1 (the owner, 14 November 2026): the card of a word whose line
# reads the source's set opens on the set's core block, and the concordance row is then that block's. The reading
# this check asks after is filed under the word's own key, so the card is stood on the set whole again (its
# division pressed) before the row is read, as a reader would. Refused unless its text stands exactly once.
# python3 -I 105-the-language-check-stands-on-the-set.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = """  await p.waitForSelector("#hud .dict-tab tbody tr.pick", { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(800);
  let r = await row();
"""
new = """  await p.waitForSelector("#hud .dict-tab tbody tr.pick", { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(800);
  // a card on the core block of its set (core-block-rule-v1) is stood on the set whole again: the reading is the word's
  if (await p.evaluate(() => { const blk = document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]'); const cut = document.querySelector('#hud .b-cut .s-pills button[aria-pressed="true"]'); if (blk && cut && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1) { cut.click(); return true; } return false; })) await p.waitForTimeout(1200);
  let r = await row();
"""
if s.count(old) != 1: sys.exit(f"found {s.count(old)}")
open(p, "w", encoding="utf-8").write(s.replace(old, new)); print("check-reading-language-v1.mjs: 1 edit")
