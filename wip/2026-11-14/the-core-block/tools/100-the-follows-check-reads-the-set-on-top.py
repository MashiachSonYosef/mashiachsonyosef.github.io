# check-line-follows-card-v1, F1, after core-block-rule-v1 (the owner, 14 November 2026): a card whose line reads the
# source's set opens on the set's core block, its first pill the block's own first reading, and the set, the line,
# said on top of it ("here the source reads"). Such a card is read by what it says on top. Each edit is refused
# unless its text stands exactly once.
# python3 -I 100-the-follows-check-reads-the-set-on-top.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""//       book: a line is bare only where the card has no reading, and where
//       the card has one, the line is the card's first pill
""", """//       book: a line is bare only where the card has no reading, and where
//       the card has one, the line is the card's first pill; a card that opens
//       on the core block of the source's set (core-block-rule-v1, the owner,
//       14 November 2026) is read by the set it says on top, its line
""")
one("""  const pill = document.querySelector("#hud .r-pills button");
  const text = pill ? pill.textContent.replace(/\\s+/g, " ").trim() : null;
  const count = document.querySelectorAll("#hud .r-pills button").length;
""", """  const pill = document.querySelector("#hud .r-pills button");
  const text = pill ? pill.textContent.replace(/\\s+/g, " ").trim() : null;
  const count = document.querySelectorAll("#hud .r-pills button").length;
  // a card standing on a block of the set's division says the set on top
  const onBlock = !!document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]') && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1;
  const topEl = onBlock ? document.querySelector("#hud .r-piece:not(.r-sug) b") : null;
  const top = topEl ? topEl.textContent.replace(/\\s+/g, " ").trim() : null;
""")
one("""  return { text, count };
}, idx);""", """  return { text: top || text, count };
}, idx);""")
open(p, "w", encoding="utf-8").write(s)
print("check-line-follows-card-v1.mjs: 3 edits")
