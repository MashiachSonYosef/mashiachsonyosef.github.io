# zone.html, core-block-rule-v1 and the precedence of a ruling: a reading pressed on a block of the place's own
# division remembers that division, as a press on the division does. A card that stands on the place's own division
# without a press (the set's division; since core-block-rule-v1, 14 November 2026, every one-pill card, opened on its
# core block) remembered no division, and the reading pressed on one of its blocks was remembered under that block
# alone. Every line painter but the card's own reads a ruling on its division (ruledLine0, ruledMs, piecesAt): with no
# division it read the ruling on the whole form, found nothing there and printed the baked line back over the reader's
# choice at the next repaint, and in every section built after it. Found by the page lane's check W5, 14 November
# 2026, and reproduced on main (f2ba077659): at Obadiah 1:3, word 10, «understanding» pressed, the line read «in +
# understanding + his»; the source signs switch moved, it read «in + heart + his» again.
# Also: a form whose only rulings were word senses goes back to rest whole when the switch forgets them, its division
# with it (forgetSensePicks), since a word sense pressed on a block now remembers the block's division too.
# Refused unless each text stands once.
# python3 -I 115-a-block-pressed-rules-its-division.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""    const rungRuled = () => { if (opts.run && cover.length === 1 && mem.cut !== cutKey(cover)) mem.cut = cutKey(cover); };
""", """    const rungRuled = () => { if (opts.run && cover.length === 1 && mem.cut !== cutKey(cover)) mem.cut = cutKey(cover); };
    // A READING PRESSED ON A BLOCK RULES THE DIVISION IT STANDS ON. A card
    // standing on the place's own division without a press (the set's
    // division; a one-pill card opened on its core block, core-block-rule-v1)
    // remembered no division, so the reading pressed on one of its blocks was
    // read on the whole form by every painter but the card's own, and the
    // next repaint printed the baked line back over it: at Obadiah 1:3,
    // «understanding» pressed, the line went back to «in + heart + his» when
    // the source signs switch moved (found 14 November 2026, on main too).
    // The division is remembered as a press on it remembers it. TAHOT's set
    // chosen whole is filed under its division already (setRuling).
    const blockRuled = () => { if (!opts.run && !mem.cut && cover.length > 1 && surface !== SET_KEY) mem.cut = cutKey(cover); };
""")
# both places a reading is pressed
one("""            if (surface !== SET_KEY) mem.cells.delete(SET_KEY);
            [...pills.children].forEach((x) => x.setAttribute("aria-pressed", String((x.dataset.pointer || x.textContent) === group.text || x.textContent === spanJoin(group.text))));
            rungRuled(); markRuled(); selectedRecordRef.m = index.m_sources[row[3]] || null;
""", """            if (surface !== SET_KEY) mem.cells.delete(SET_KEY);
            [...pills.children].forEach((x) => x.setAttribute("aria-pressed", String((x.dataset.pointer || x.textContent) === group.text || x.textContent === spanJoin(group.text))));
            rungRuled(); blockRuled(); markRuled(); selectedRecordRef.m = index.m_sources[row[3]] || null;
""")
one("""        if (surface !== SET_KEY) mem.cells.delete(SET_KEY);
        rungRuled(); markRuled();
        selectedRecordRef.m = index.m_sources[route.records[0][3]] || null;
""", """        if (surface !== SET_KEY) mem.cells.delete(SET_KEY);
        rungRuled(); blockRuled(); markRuled();
        selectedRecordRef.m = index.m_sources[route.records[0][3]] || null;
""")
# forgetSensePicks: a form left with no reading pressed goes back to rest whole
one("""  // pill lays them, so each such line reads what it read before the press.
  // The line printed the word sense on after the card had held it back
  // (found by the page lane's own probe, 14 November 2026, at Obadiah 1:3).
  // Says how many it forgot.
""", """  // pill lays them, so each such line reads what it read before the press.
  // A form whose only readings pressed were word senses goes back to rest
  // whole, the division they were pressed on with them (a reading pressed on
  // a block remembers its division, blockRuled).
  // The line printed the word sense on after the card had held it back
  // (found by the page lane's own probe, 14 November 2026, at Obadiah 1:3).
  // Says how many it forgot.
""")
one("""      if (here && !m.cut && !m.cells.size) bare.push(k);
""", """      if (here && !m.cells.size) { m.cut = null; bare.push(k); }
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: a reading pressed on a block rules the division it stands on")
# (then, by hand on the same tree: blockRuled takes the pressed block's surface as its argument, blockRuled(sf), and
# both presses call blockRuled(surface), since surface is the readings band's own name and not the card's)
