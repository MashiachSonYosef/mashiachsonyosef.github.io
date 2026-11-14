# zone.html, word-senses-rule-v1: the owner's legend, «brackets mean sense, not definition», stands in purple under a
# Jastrow record on the record card where the record (data/word-senses/jastrow-v1.json, legend) says it holds: the
# record shows exactly one bracket, and the corpus lane lists its words as a word sense. The owner, 14 November 2026:
# «i dont really see your legend that signifies its a sense, should it say that in purple somewhere if we are
# stripping the brackets». The card says on itself which rows it printed (data-rows), so a check can ask it.
# Refused unless each text stands once.
# python3 -I 121-the-legend-on-the-record-card.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""  const SENSE_ROWS = new WeakSet();     // a card's rows that are a word sense
""", """  const SENSE_ROWS = new WeakSet();     // a card's rows that are a word sense
  const LEGEND_ROWS = new WeakSet();    // a card's rows whose record the owner's legend holds on
""")
one("""    // a word sense is marked by its key, rank and source id, as the record names it (word-senses-rule-v1)
    const senses = o.id === "jastrow" && WORD_SENSES && WORD_SENSES.rows ? WORD_SENSES.rows[key] || null : null;
""", """    // a word sense is marked by its key, rank and source id, as the record names it (word-senses-rule-v1),
    // and so is a row whose record card the owner's legend holds on (its legend)
    const senses = o.id === "jastrow" && WORD_SENSES && WORD_SENSES.rows ? WORD_SENSES.rows[key] || null : null;
    const legendOn = o.id === "jastrow" && WORD_SENSES && WORD_SENSES.legend && WORD_SENSES.legend.rows ? WORD_SENSES.legend.rows[key] || null : null;
""")
one("""OVERLAY_ROWS.set(r, o.id); if (senses && senses.some(([rk, m]) => rk === r[0] && m === r[3])) SENSE_ROWS.add(r); return r; });
""", """OVERLAY_ROWS.set(r, o.id); if (senses && senses.some(([rk, m]) => rk === r[0] && m === r[3])) SENSE_ROWS.add(r); if (legendOn && legendOn.some(([rk, m]) => rk === r[0] && m === r[3])) LEGEND_ROWS.add(r); return r; });
""")
one("""        body.append(dText(firstText, isNoDerivs((index.m_sources[firstGroup[0][3]] || {}).licensePosture), firstGroup[0]));
""", """        body.append(dText(firstText, isNoDerivs((index.m_sources[firstGroup[0][3]] || {}).licensePosture), firstGroup[0]));
        // THE LEGEND, IN PURPLE (word-senses-rule-v1). Jastrow's record keeps
        // its brackets here, as the owner asked ("in the D+M card we would
        // leave it bracketed"), and the owner's legend says what they mean,
        // "brackets mean sense, not definition", under a record where the
        // record of word senses says it holds: one bracket, its words a word
        // sense on the corpus lane's list (the owner, 14 November 2026: "i
        // dont really see your legend that signifies its a sense, should it
        // say that in purple somewhere"). It is the page speaking about the
        // source's sign, so it is the page's purple. The card says which rows
        // it printed, for a check to ask.
        dCard.dataset.rows = firstGroup.map((row) => `${row[0]}|${row[3]}`).join(" ");
        if (WORD_SENSES && WORD_SENSES.legend && firstGroup.some((row) => LEGEND_ROWS.has(row))) {
          body.append(Object.assign(document.createElement("p"), { className: "sense-legend", textContent: WORD_SENSES.legend.text }));
        }
""")
one("""  #hud .r-pills button.sense[aria-pressed="true"] { color: var(--argaman); font-weight: 700; }
""", """  #hud .r-pills button.sense[aria-pressed="true"] { color: var(--argaman); font-weight: 700; }
  /* the owner's legend under a Jastrow record whose one bracket is a word
     sense: the page's purple, a size down, under the record it explains */
  #hud .d-card .sense-legend { margin: 0 0 0.3rem; font-size: 0.74rem; color: var(--argaman); }
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the legend under the record it holds on")
# (then, by hand on the same tree: the card also says the key its readings were asked under, dCard.dataset.key =
# surface, under dataset.rows)
# (and then: the legend is asked of the row whose wording prints, firstGroup[0], never of a row standing behind it in
# its group, since a group prints its first source's wording; the card says that row, dataset.row, not dataset.rows)
