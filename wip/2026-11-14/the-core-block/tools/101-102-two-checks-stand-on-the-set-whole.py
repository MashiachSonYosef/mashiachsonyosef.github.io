# check-citations-v1 (C10, C11) and check-dictionary-toggle-v1 (D7), after core-block-rule-v1 (the owner,
# 14 November 2026): a card whose line reads the source's set opens on the set's core block and shows that
# block's record. The line, and so the export's citation and the table's row of a divided reading, read the set.
# Where a check asks what the card says for the line's own reading, it first stands the card on the set whole
# again, its division pressed, as a reader would. Each edit is refused unless its text stands exactly once.
# python3 -I 101-102-two-checks-stand-on-the-set-whole.py <reader dir>
import os, sys
R = sys.argv[1]
STAND = ("const blk = document.querySelector('#hud .b-cell .s-pills button[aria-pressed=\"true\"]'); "
         "const cut = document.querySelector('#hud .b-cut .s-pills button[aria-pressed=\"true\"]'); "
         "if (blk && cut && document.querySelectorAll(\"#hud .b-cell .s-pills button\").length > 1) { cut.click(); return true; } return false;")
def edit(rel, pairs):
    p = os.path.join(R, rel); s = open(p, encoding="utf-8").read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1: sys.exit(f"{rel}: expected one of {old[:80]!r}, found {n}")
        s = s.replace(old, new)
    open(p, "w", encoding="utf-8").write(s); print(f"{rel}: {len(pairs)} edit(s)")
edit("tools/check-citations-v1.mjs", [("""  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(250);
  const card = await p.evaluate(() => {""", """  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(250);
  // a card that opens on the core block of the source's set (core-block-rule-v1, 14 November 2026) shows that
  // block's record; the line, and so the file, reads the set: the card is stood on the set whole again first
  if (await p.evaluate(() => { """ + STAND + """ })) await p.waitForTimeout(700);
  const card = await p.evaluate(() => {""")])
edit("tools/check-dictionary-toggle-v1.mjs", [("""  if ((await tabState()) !== "table") { await esc(); continue; }
  await settle();
  const row = await rowOf();
  if (!d7 && row && row.here && row.raw.includes("/")) {""", """  if ((await tabState()) !== "table") { await esc(); continue; }
  await settle();
  // a card that opens on the core block of the source's set (core-block-rule-v1, 14 November 2026) is stood on
  // the set whole again, its division pressed, so the set's own row is the one read here
  if (!d7 && await p.evaluate(() => { """ + STAND + """ })) await settle();
  const row = await rowOf();
  if (!d7 && row && row.here && row.raw.includes("/")) {""")])
