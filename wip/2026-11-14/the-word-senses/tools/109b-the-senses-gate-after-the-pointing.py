# zone.html, word-senses-rule-v1: the word senses gate stands after the pointing's and the stem's gates on the rows
# beside the store, not before them, so a word sense the pointing withholds is counted with the pointing, and the
# card's count of word senses is exactly what pressing «show» brings onto the card. Refused unless each text stands once.
# python3 -I 109b-the-senses-gate-after-the-pointing.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
gate_old = """    // WORD SENSES (word-senses-rule-v1): a row of Jastrow's that is a word
    // sense is held back while the switch rests off, and counted; on, it
    // stays, and prints as a word sense below. A row a source switch already
    // withheld is counted there and not again.
    let withheldBySense = 0, sensesShown = 0;
    if (sensesPref === "on") sensesShown = extra.filter((row) => SENSE_ROWS.has(row)).length;
    else { const kept = extra.filter((row) => !SENSE_ROWS.has(row)); withheldBySense = extra.length - kept.length; extra = kept; }
"""
one(gate_old, "")
one("""        withheldByStem += extra.length - ofThisStem.length;
        extra = ofThisStem;
      }
    }
""", """        withheldByStem += extra.length - ofThisStem.length;
        extra = ofThisStem;
      }
    }
    // WORD SENSES (word-senses-rule-v1): a row of Jastrow's that is a word
    // sense is held back while the switch rests off, and counted; on, it
    // stays, and prints as a word sense below. It is asked last, so a row a
    // source switch, the pointing or the stem already withheld is counted
    // there and not again, and the count is what pressing "show" brings.
    let withheldBySense = 0, sensesShown = 0;
    if (sensesPref === "on") sensesShown = extra.filter((row) => SENSE_ROWS.has(row)).length;
    else { const kept = extra.filter((row) => !SENSE_ROWS.has(row)); withheldBySense = extra.length - kept.length; extra = kept; }
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the word senses gate moved after the pointing and the stem")
