# zone.html: the confirmed findings of the review of 14 November 2026 on the word senses and the core block's ruling.
#  1. A reading pressed on a block of the place's own division is read on that place's own pieces by every painter
#     (placeCutOf), never remembered as a division for the form (blockRuled is withdrawn): the same letters divide
#     otherwise elsewhere, where a remembered division opened the card off its own division (Ruth 2:18 and 4:15).
#     A ruling none of whose blocks stands at a place is no ruling there, so the place keeps its own resting line.
#  2. The word senses switch turned off forgets the word senses pressed and nothing else: a division the reader
#     pressed stays, and a reading a word sense was pressed over comes back (under).
#  3. A ketiv's welded card counts the word senses of the read word, whose readings it prints.
#  4. The rows are marked only when the record was baked against the served overlay's version.
# Refused unless each text stands once.
# python3 -I 123-the-review-fixes-on-the-page.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

# 1. blockRuled withdrawn
one("""    // A READING PRESSED ON A BLOCK RULES THE DIVISION IT STANDS ON. A card
    // standing on the place's own division without a press (the set's
    // division; a one-pill card opened on its core block, core-block-rule-v1)
    // remembered no division, so the reading pressed on one of its blocks was
    // read on the whole form by every painter but the card's own, and the
    // next repaint printed the baked line back over it: at Obadiah 1:3,
    // «understanding» pressed, the line went back to «in + heart + his» when
    // the source signs switch moved (found 14 November 2026, on main too).
    // The division is remembered as a press on it remembers it. TAHOT's set
    // chosen whole is filed under its division already (setRuling).
    const blockRuled = (sf) => { if (!opts.run && !mem.cut && cover.length > 1 && sf !== SET_KEY) mem.cut = cutKey(cover); };
""", "")
one("rungRuled(); blockRuled(surface); markRuled(); selectedRecordRef.m", "rungRuled(); markRuled(); selectedRecordRef.m")
one("        rungRuled(); blockRuled(surface); markRuled();\n", "        rungRuled(); markRuled();\n")
# 1. the painters read a block's ruling on the place's own pieces
one("""  const setRuling = (m) => { const s = m.cells.get(SET_CELL); return s && (!m.cut || s.cut === m.cut) ? s : null; };
""", """  const setRuling = (m) => { const s = m.cells.get(SET_CELL); return s && (!m.cut || s.cut === m.cut) ? s : null; };
  // A RULING ON A BLOCK OF THE PLACE'S OWN DIVISION, NO DIVISION PRESSED. A
  // card stands on the place's own division without a press (the set's
  // division; since core-block-rule-v1 every one-pill card, opened on its
  // core block), and a reading pressed on one of its blocks is remembered
  // under that block alone, as the card itself reads it. The painters read a
  // ruling on its division, and with none they read this one on the whole
  // form, found nothing there and printed the baked line back over it at the
  // next repaint: at Obadiah 1:3, «understanding» pressed, the line went back
  // to «in + heart + his» when the source signs switch moved (found 14
  // November 2026, on main too). So such a ruling is read on each place's own
  // pieces, where they hold the block it was pressed on. It is never kept as a
  // division of the form: the same letters divide otherwise elsewhere, and a
  // division kept for the form opened the card off its own division there
  // (the review of 14 November, Ruth 2:18 and 4:15).
  const placeCutOf = (m, k, word) => {
    if (!m || m.cut || !word || word.k !== k || !Array.isArray(word.pg) || word.pg.length < 2) return null;
    const pcs = word.pg.map((x) => (x && x.k) || "");
    return pcs.join("") === k && pcs.some((sf) => sf && sf !== k && m.cells.has(sf)) ? pcs.join("+") : null;
  };
  // the blocks a ruling is read on at a place, or null where none of its
  // blocks stands there: a ruling none of whose blocks is at a place is no
  // ruling there, and the place keeps its own line (it printed the baked
  // column instead, the place's own reading forgotten)
  const ruledSurfaces = (m, k, table, word) => {
    const cut = m.cut || placeCutOf(m, k, word);
    const run = k.includes("\\u05be") && !(table && table[k]);
    const surfaces = cut ? cut.split("+") : run ? k.split("\\u05be") : [k];
    return m.cut || surfaces.some((sf) => m.cells.has(sf)) ? surfaces : null;
  };
""")
one("""    if (set) { const r = mOfPick(set); return r ? [r] : null; }
    const run = k.includes("\\u05be") && !(table && table[k]);
    const surfaces = m.cut ? m.cut.split("+") : run ? k.split("\\u05be") : [k];
    const pg = piecesAt(word, k, m);
    const ms = [];""", """    if (set) { const r = mOfPick(set); return r ? [r] : null; }
    const surfaces = ruledSurfaces(m, k, table, word);
    if (!surfaces) return null;
    const pg = piecesAt(word, k, m);
    const ms = [];""")
one("""  const piecesAt = (word, k, m) => {
    if (!word || word.k !== k || !m || !m.cut || !Array.isArray(word.pg) || word.pg.length < 2) return null;
    if (m.cut !== word.pg.map((p) => (p && p.k) || "").join("+")) return null;""", """  const piecesAt = (word, k, m) => {
    const cut = m ? m.cut || placeCutOf(m, k, word) : null;
    if (!word || word.k !== k || !cut || !Array.isArray(word.pg) || word.pg.length < 2) return null;
    if (cut !== word.pg.map((p) => (p && p.k) || "").join("+")) return null;""")
one("""    // a maqaf run ruled cell by cell, its division never pressed, stands
    // under the division its card opened on: as written where the table
    // reads the run whole, else word by word. Read as one form it printed a
    // dash for the whole run the moment one word of it was chosen.
    const run = k.includes("\\u05be") && !(table && table[k]);
    const surfaces = m.cut ? m.cut.split("+") : run ? k.split("\\u05be") : [k];
""", """    // a maqaf run ruled cell by cell, its division never pressed, stands
    // under the division its card opened on: as written where the table
    // reads the run whole, else word by word. Read as one form it printed a
    // dash for the whole run the moment one word of it was chosen.
    // (ruledSurfaces: and a block of the place's own division, placeCutOf)
    const surfaces = ruledSurfaces(m, k, table, word);
    if (!surfaces) return null;
""")
# 2. the forgetting forgets the word senses alone, and gives back what a word sense was pressed over
one("""    const rungRuled = () => { if (opts.run && cover.length === 1 && mem.cut !== cutKey(cover)) mem.cut = cutKey(cover); };
""", """    const rungRuled = () => { if (opts.run && cover.length === 1 && mem.cut !== cutKey(cover)) mem.cut = cutKey(cover); };
    // a word sense pressed over a reading on the same block keeps that reading
    // under it, so the switch turned off gives it back (forgetSensePicks)
    const underOf = (prev) => (prev ? (prev.sense ? prev.under || null : prev) : null);
""")
one("""              ...(group.records.every((x) => SENSE_ROWS.has(x)) ? { sense: true } : {}) });""",
    """              ...(group.records.every((x) => SENSE_ROWS.has(x)) ? { sense: true, under: underOf(picked.get(surface)) } : {}) });""")
one("""          ...(route.records.every((x) => SENSE_ROWS.has(x)) ? { sense: true } : {}),""",
    """          ...(route.records.every((x) => SENSE_ROWS.has(x)) ? { sense: true, under: underOf(picked.get(surface)) } : {}),""")
one("""  // A form whose only readings pressed were word senses goes back to rest
  // whole, the division they were pressed on with them (a reading pressed on
  // a block remembers its division, blockRuled).
""", """  // A reading a word sense was pressed over on the same block comes back
  // (under), and a division the reader pressed stays where it was.
""")
one("""      for (const [sf, pk] of [...m.cells]) if (pk && pk.sense) { m.cells.delete(sf); here += 1; }
      if (here && !m.cells.size) { m.cut = null; bare.push(k); }
""", """      for (const [sf, pk] of [...m.cells]) if (pk && pk.sense) { if (pk.under) m.cells.set(sf, pk.under); else m.cells.delete(sf); here += 1; }
      if (here && !m.cut && !m.cells.size) bare.push(k);
""")
# 3. a ketiv's welded card counts the read word's word senses
one("""      const reads = kqReadRegions();
      for (const r of reads) {
        const qk = r.k;
        let qp = null;
        try { const at = placeOfCell(qk); qp = await poolFor(qk, { ...(at ? { place: at } : {}), piecePlace: piecePlaceOf(qk) }); } catch { qp = null; }
        if (!qp) continue;
""", """      const reads = kqReadRegions();
      let heldSenses = 0;
      for (const r of reads) {
        const qk = r.k;
        let qp = null;
        try { const at = placeOfCell(qk); qp = await poolFor(qk, { ...(at ? { place: at } : {}), piecePlace: piecePlaceOf(qk) }); } catch { qp = null; }
        if (!qp) continue;
        heldSenses += qp.withheldBySense || 0;
""")
one("""      const out = sortPool(kept, surface);
      carryWithheld(out, pool);
""", """      const out = sortPool(kept, surface);
      carryWithheld(out, pool);
      // the word senses are the read word's: its readings print here, and the
      // written letters' are withheld by the weld itself (word-senses-rule-v1;
      // the review of 14 November: Daniel 5:21, «5 word senses ... show»
      // brought none, counted on the written letters' catalog)
      out.withheldBySense = heldSenses;
      out.sensesShown = out.filter((g) => g.records.length && g.records.every((x) => SENSE_ROWS.has(x))).length;
""")
# 4. the rows are marked only against the overlay version the record was baked from
one("""    const senses = o.id === "jastrow" && WORD_SENSES && WORD_SENSES.rows ? WORD_SENSES.rows[key] || null : null;
    const legendOn = o.id === "jastrow" && WORD_SENSES && WORD_SENSES.legend && WORD_SENSES.legend.rows ? WORD_SENSES.legend.rows[key] || null : null;
""", """    // only against the overlay the record was baked from: rows are named by rank, and a reissued overlay ranks
    // them anew (the review of 14 November), so a record of another version marks nothing
    const fits = o.id === "jastrow" && !!(WORD_SENSES && WORD_SENSES.overlay && WORD_SENSES.overlay.store_version && WORD_SENSES.overlay.store_version === ix.store_version);
    const senses = fits && WORD_SENSES.rows ? WORD_SENSES.rows[key] || null : null;
    const legendOn = fits && WORD_SENSES.legend && WORD_SENSES.legend.rows ? WORD_SENSES.legend.rows[key] || null : null;
""")
one("""    window.__overlays = Object.keys(OVERLAYS);
""", """    window.__overlays = Object.keys(OVERLAYS);
    // whether the record of word senses was baked against the served overlay (word-senses-rule-v1), for a check
    window.__sensesFit = !!(WORD_SENSES && WORD_SENSES.overlay && OVERLAYS.jastrow && WORD_SENSES.overlay.store_version === OVERLAYS.jastrow.store_version);
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the review's fixes")
