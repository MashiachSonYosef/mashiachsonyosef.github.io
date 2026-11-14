# The review's completeness critic, 14 November 2026.
#  zone.html:
#   1. A word sense's record card prints Jastrow's bracketed record first. The overlay serves each note as a bare row
#      (definition field = the words) and its bracketed entry; with the twins folded into the word sense's pill, the
#      card printed the bare row, earliest first, so a reader who pressed a word sense saw no bracket and no legend
#      (Obadiah 1:3: «who will?» printed, «[who will?,] Oh that!» behind it).
#   2. The card asks about a word sense's record by the words, not by the pill's print: the record is lit as every
#      pressed pill's is, and «this reading is a piece cut out of the record above» no longer stands where only the
#      page's own prefix differs.
#   3. The voices' comment says the claims that are ours (the pointing, the word senses), not "the one claim".
#  tools/build-toggle-design-v1.mjs: the claim group's lede holds for any number of switches, and the word senses
#   switch is one a book page offers in its row of pills.
#  tools/build-chain-book-v2.mjs: "lifted" says the word senses are shown, as the lifted state is; "normalization".
# Refused unless each text stands once.
# python3 -I 129-the-critics-findings.py <reader dir>
import os, sys
R = sys.argv[1]
def edit(rel, pairs):
    p = os.path.join(R, rel); s = open(p, encoding="utf-8").read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1: sys.exit(f"{rel}: expected one of {old[:90]!r}, found {n}")
        s = s.replace(old, new)
    open(p, "w", encoding="utf-8").write(s); print(f"{rel}: {len(pairs)} edits")
edit("zone.html", [
    ("""        const leadRow = [...selected.records].sort(EARLIEST_FIRST)[0];
        const cutNote = (selected.records.some((r) => r[5] === 1) || (leadRow && spanJoin(routePrinted(leadRow)).toLowerCase() !== spanJoin(selected.text).toLowerCase()))""",
     """        // A WORD SENSE'S RECORD (word-senses-rule-v1): its pill prints the
        // page's own words before the source's, so the record is asked about
        // the source's words alone; and Jastrow's bracketed entry prints before
        // the bare row of the same words, so the card shows the bracket the
        // owner asked to keep, and the legend under it (the review of 14
        // November 2026: at Obadiah 1:3 «who will?» printed, «[who will?,] Oh
        // that!» behind it)
        const senseGroup = selected.records.length > 0 && selected.records.every((r) => SENSE_ROWS.has(r));
        const plainText = senseGroup && String(selected.text).startsWith(SENSE_PRINTS) ? String(selected.text).slice(SENSE_PRINTS.length) : selected.text;
        const bracketed = (r) => (/\\[/u.test(String(r[2] || "")) ? 1 : 0);
        const recordOrder = (a, b) => (senseGroup ? bracketed(b) - bracketed(a) : 0) || EARLIEST_FIRST(a, b);
        const leadRow = [...selected.records].sort(recordOrder)[0];
        const cutNote = (selected.records.some((r) => r[5] === 1) || (leadRow && spanJoin(routePrinted(leadRow)).toLowerCase() !== spanJoin(plainText).toLowerCase()))"""),
    ("""        const recs = [...selected.records].sort(EARLIEST_FIRST);""",
     """        const recs = [...selected.records].sort(recordOrder);"""),
    ("""            const s = document.createElement("span");
            const sel = readingKey(selected.text);
            const whole = routePrinted(row);""",
     """            const s = document.createElement("span");
            const sel = readingKey(plainText);
            const whole = routePrinted(row);"""),
    ("""            const s = document.createElement("span");
            const sel = readingKey(selected.text);
            const holds = readingKey(text) === sel""",
     """            const s = document.createElement("span");
            const sel = readingKey(plainText);
            const holds = readingKey(text) === sel"""),
    ("""   *  source tree exists to avoid. So every row names its voice, and the one
   *  claim that is ours is marked as ours. */""",
     """   *  source tree exists to avoid. So every row names its voice, and the
   *  claims that are ours (the pointing; which of Jastrow's brackets is a word
   *  sense) are marked as ours. */"""),
])
edit("tools/build-toggle-design-v1.mjs", [
    ("""  claim: "This one is a statement this project makes. It is the only switch here that is not somebody else's material, or our arrangement of it, and it is marked so a reader can refuse it.",""",
     """  claim: "These are statements this project makes. They are not somebody else's material, or our arrangement of it, and they are marked so a reader can refuse them.","""),
    ("""  const SERVED = new Set(["sources", "suggested"]);""",
     """  // the word senses switch also stands in a book page's row of pills («word senses»)
  const SERVED = new Set(["sources", "suggested", "senses"]);"""),
])
# (the chain book's builder: its three "no normalisation, no trimming" read "normalization", replaced by hand, all three)
edit("tools/build-chain-book-v2.mjs", [
    ("""Lifted: with every switch that withholds a reading lifted, which is the pointing kept whatever a source points, a source's own signs printed and every source on.""",
     """Lifted: with every switch that withholds a reading lifted, which is the pointing kept whatever a source points, a source's own signs printed, every source on and the word senses shown."""),
])
