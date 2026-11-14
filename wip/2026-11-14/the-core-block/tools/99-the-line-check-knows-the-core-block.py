# check-card-opens-on-the-line-v1, after core-block-rule-v1 (the owner, 14 November 2026): a card whose line reads
# the source's set opens on the set's core block. The reading row and the line are still one reading, the set; the
# pressed pill is the line's own piece for the block standing open, and the block's pills stand in its own pool's
# order, so C2 (the first pill is the line) is not asked of such a card, and the count of them is said.
# Each edit is refused unless its text stands exactly once.
# python3 -I 99-the-line-check-knows-the-core-block.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""// A setting whose column is not baked on this book is reported, not failed,
// on C2: the rail says so in words, and C1 still holds there.
""", """// A setting whose column is not baked on this book is reported, not failed,
// on C2: the rail says so in words, and C1 still holds there.
//
// A CARD OF ONE PILL OPENS ON ITS CORE BLOCK (core-block-rule-v1, the owner,
// 14 November 2026). Where the line reads the source's set, the card opens on
// the set's division with the core block pressed: the reading row and the line
// are still the set, and the pressed pill is the line's own piece for that
// block. Its pills are that block's, in its own pool's order, so C2 is not
// asked of it; such cards are counted and said.
""")
one("""        out.push({ w: (wb.querySelector(".w")?.textContent || "").replace(/[֑-ׇ]/g, ""), line: (g?.title || "").trim(), now: (h.querySelector(".r-now .v")?.textContent || "").trim(), first: pills[0] ? pills[0].textContent.trim() : null, pressed: pressed ? pr""",
"""        const block = h.querySelector('.b-cell .s-pills button[aria-pressed="true"]');
        const blocks = [...h.querySelectorAll(".b-cell .s-pills button")];
        const pcs = [...wb.querySelectorAll(":scope > .g > .g-pcs > .g-pc")].map((x) => x.textContent.trim());
        out.push({ core: block && blocks.length > 1 ? { at: blocks.indexOf(block), pieces: pcs } : null, w: (wb.querySelector(".w")?.textContent || "").replace(/[֑-ׇ]/g, ""), line: (g?.title || "").trim(), now: (h.querySelector(".r-now .v")?.textContent || "").trim(), first: pills[0] ? pills[0].textContent.trim() : null, pressed: pressed ? pr""")
one("""      if (x.pressed === null) continue;   // a card that says a reason instead of readings is not this check's
      if (!(x.pressed === x.now && x.now === x.line)) c1.push(`${tag}${bakeOnly ? " (beside-store chips off)" : ""} · ${x.w}: line "${x.line}" · row "${x.now}" · pressed "${x.pressed}"`);
""", """      if (x.pressed === null) continue;   // a card that says a reason instead of readings is not this check's
      if (x.core) {
        // opened on a block of the set's division: the row and the line the set, the pill the line's piece there
        coreOpened += 1;
        const piece = x.core.pieces.length > x.core.at ? x.core.pieces[x.core.at] : (x.line.split(" + ")[x.core.at] || "");
        if (!(x.now === x.line && x.pressed.toLowerCase() === piece.toLowerCase())) c1.push(`${tag}${bakeOnly ? " (beside-store chips off)" : ""} · ${x.w} (on its core block): line "${x.line}" · row "${x.now}" · pressed "${x.pressed}", owed the line's piece "${piece}"`);
        continue;
      }
      if (!(x.pressed === x.now && x.now === x.line)) c1.push(`${tag}${bakeOnly ? " (beside-store chips off)" : ""} · ${x.w}: line "${x.line}" · row "${x.now}" · pressed "${x.pressed}"`);
""")
one("""const c1 = [], c2 = [], unbaked = [];
let opened = 0;
""", """const c1 = [], c2 = [], unbaked = [];
let opened = 0, coreOpened = 0;
""")
one("""console.log(`— ${trials.length} settings · ${opened} cards opened cold —`);
""", """console.log(`— ${trials.length} settings · ${opened} cards opened cold, ${coreOpened} of them on the core block of their set —`);
""")
open(p, "w", encoding="utf-8").write(s)
print("check-card-opens-on-the-line-v1.mjs: 5 edits")
