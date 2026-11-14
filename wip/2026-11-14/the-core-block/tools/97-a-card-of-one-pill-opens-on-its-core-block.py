# zone.html: a card whose line reads the source's set opens on the set's core block, the set still on top (the
# owner, 14 November 2026, call 10 of 13 November; the fresh readers' remark of relay v184 §5). Rule:
# core-block-rule-v1-a-card-whose-one-pill-is-the-places-set-opens-on-its-core-block-the-set-still-on-top
# Where the reader has chosen nothing on the card (no division, no block, not the set), it opens on the block of
# the set's division that is the word's core piece, and the line "here the source reads" prints the set above the
# readings of whatever block of the set's division stands open. Each edit is refused unless its text stands once.
# python3 -I 97-a-card-of-one-pill-opens-on-its-core-block.py <reader dir>
import os, sys
path = os.path.join(sys.argv[1], "zone.html")
s = open(path, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

one("""    if (setCut && cover === setCut && !setWhole) { const i = cover.findIndex((c) => mem.cells.get(c.surface)); if (i >= 0) cellIdx = i; }
""", """    if (setCut && cover === setCut && !setWhole) { const i = cover.findIndex((c) => mem.cells.get(c.surface)); if (i >= 0) cellIdx = i; }
    // A CARD OF ONE PILL OPENS ON THE PART THAT CARRIES THE MEANING (the owner, 14 November 2026, of the fresh
    // readers' remark of relay v184 §5: "a card of one pill that only repeats the line ... the same word without
    // it opens a full card"), under
    // core-block-rule-v1-a-card-whose-one-pill-is-the-places-set-opens-on-its-core-block-the-set-still-on-top.
    // Standing on the set whole, such a card printed one pill, the line again: in the twelve chain books 6,461 of
    // the 6,466 cards of a word with a prefix or an ending. Where the reader has chosen nothing on this card, it
    // opens on the block that is the word's core piece, the one piece the source marks so, with the readings of
    // the word without its prefix and its ending; the set, the place's own reading, stands above them ("here the
    // source reads", below), and the division pressed again stands on the set whole, as before.
    const coreAt = setCut && word && Array.isArray(word.pg) ? word.pg.reduce((at, p, i) => (p && p.r === "core" ? (at === -1 ? i : -2) : at), -1) : -1;
    if (setWhole && coreAt >= 0 && !mem.cut && !mem.cells.get(SET_KEY) && !cover.some((c) => mem.cells.get(c.surface))) { setWhole = false; cellIdx = coreAt; }
""")

one("""        // THE SOURCE'S SET CARRIES ONLY WHOLE (the owner's rule of 20
        // September, relayed by the corpus lane 2026-10-03: "the piece gloss
        // travels with the position ... if a reader presses the [he] piece on
        // its own, the card looks up [he] in the dictionaries ... That's where TAHOT's
        // set stops and the dictionaries start"). The line stands on the whole
        // word, never on one of its pieces pressed alone.
        const hit = setCut ? (setWhole ? { g: spanJoin(placeSet.text), s: word.pg[0].s } : null)
""", """        // THE SOURCE'S SET CARRIES ONLY WHOLE (the owner's rule of 20
        // September, relayed by the corpus lane 2026-10-03: "the piece gloss
        // travels with the position ... if a reader presses the [he] piece on
        // its own, the card looks up [he] in the dictionaries ... That's where TAHOT's
        // set stops and the dictionaries start"). The line stands on the whole
        // word, never on one of its pieces pressed alone. And the place's reading
        // stays on top (core-block-rule-v1, the owner, 14 November 2026): on a
        // block of the set's division the set is said whole above the block's own
        // readings, as what the source reads at this place, never as one of them.
        const hit = setCut ? { g: spanJoin(placeSet.text), s: word.pg[0].s }
""")
open(path, "w", encoding="utf-8").write(s)
print("zone.html: 2 edits")
