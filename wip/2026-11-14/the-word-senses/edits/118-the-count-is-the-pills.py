# zone.html, word-senses-rule-v1: the card counts word senses as it prints them, one sense one pill, however many of
# Jastrow's rows print it (ONE READING, ONE PILL). At Obadiah 1:3, word 11, it said «4 word senses, not definitions,
# held back — show», and the press brought 2 pills. Refused unless each text stands once.
# python3 -I 118-the-count-is-the-pills.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""    // there and not again, and the count is what pressing "show" brings.
    let withheldBySense = 0, sensesShown = 0;
    if (sensesPref === "on") sensesShown = extra.filter((row) => SENSE_ROWS.has(row)).length;
    else { const kept = extra.filter((row) => !SENSE_ROWS.has(row)); withheldBySense = extra.length - kept.length; extra = kept; }
""", """    // there and not again, and the count is what pressing "show" brings.
    // Counted as the card prints them: one word sense, one pill, however
    // many of Jastrow's rows print it (ONE READING, ONE PILL, below, keyed
    // as it keys them). Counted by rows, the card said «4 word senses ...
    // held back» at Obadiah 1:3 and its press brought 2 pills.
    const sensesDrawn = (rows) => new Set(rows.filter((row) => SENSE_ROWS.has(row) && index.m_sources[row[3]]).flatMap((row) => {
      const nd = isNoDerivs(index.m_sources[row[3]].licensePosture);
      return (nd ? [routePrinted(row)] : readingsOfRow(row)).map((x) => (nd ? `\\u0001nd\\u0001${row[3]}\\u0001${SENSE_PRINTS}${x}` : readingKey(`${SENSE_PRINTS}${x}`)));
    })).size;
    let withheldBySense = 0, sensesShown = 0;
    if (sensesPref === "on") sensesShown = sensesDrawn(extra);
    else { withheldBySense = sensesDrawn(extra); extra = extra.filter((row) => !SENSE_ROWS.has(row)); }
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the word senses' count is the pills the press brings")
