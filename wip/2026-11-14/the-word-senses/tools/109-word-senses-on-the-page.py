# zone.html, word-senses-rule-v1 (the owner, 13 November 2026, relayed in v185.1: "toggle it so it could be like
# 'toggle on word senses' and the actual R pill showing something like 'word sense, not definition: pointed out'";
# whether the switch rests on or off left to this lane: off). A row of Jastrow's the corpus lane lists as a word
# sense is held back while the switch is off, and the card says how many with a press that shows them; on, it
# prints as «word sense, not definition: » and its route, a pill of its own. The line is the store's and never moves.
# Each edit is refused unless its text stands exactly once.
# python3 -I 109-word-senses-on-the-page.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

# 1. the switch, its record and the rows it marks
one("""    try { const v = localStorage.getItem(BLOBS_KEY); return BLOBS.includes(v) ? v : "every"; } catch { return "every"; }
  })();
""", """    try { const v = localStorage.getItem(BLOBS_KEY); return BLOBS.includes(v) ? v : "every"; } catch { return "every"; }
  })();
  // RULE: word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off
  // A WORD SENSE IS NOT A DEFINITION (the owner, 13 November 2026, of the
  // note Jastrow sets in square brackets on a word's sense, which the served
  // overlay serves as a reading of its own: «pointed out» under yadid, whose
  // entry reads "[pointed out,] chosen, beloved; chosen spot": "toggle it so
  // it could be like 'toggle on word senses' and the actual R pill showing
  // something like 'word sense, not definition: pointed out'"; whether it
  // rests on or off, "leave that to elijah"). The corpus lane lists the rows
  // (relay v185.1; data/word-senses/jastrow-v1.json, by key, rank and source
  // id, tools/bake-word-senses-v1.mjs). While the switch is off, where it
  // rests, such a row is held back from the card, and the card says how many
  // with a press that shows them. On, it prints as SENSE_PRINTS and its
  // route, a pill of its own beside the definitions. The line is the
  // store's, so no line moves either way. Kept on this device; ?senses= sets
  // it for one load (the checks ask it).
  const SENSES_KEY = "fh.senses", SENSE_PRINTS = "word sense, not definition: ";
  let sensesPref = (() => {
    const q = QUERY.get("senses"); if (q === "on" || q === "off") return q;
    try { return localStorage.getItem(SENSES_KEY) === "on" ? "on" : "off"; } catch { return "off"; }
  })();
  window.__senses = sensesPref;
  let WORD_SENSES = null;               // the record, once it is here
  const SENSE_ROWS = new WeakSet();     // a card's rows that are a word sense
  let reopenForSenses = () => {};       // the card open now, asked again (set where the card is drawn)
  const chooseSenses = (id) => {
    if (id !== "on" && id !== "off") return;
    sensesPref = id; window.__senses = id;
    try { localStorage.setItem(SENSES_KEY, id); } catch { /* the choice still stands on this page */ }
    reopenForSenses();
  };
""")
# 2. the record, fetched with the page's other small files
one("""MARKS_REC, ...OVERLAY_IX] = await Promise.all([""", """MARKS_REC, WORD_SENSES, ...OVERLAY_IX] = await Promise.all([""")
one("""      fetch(`${ROOT}data/masoretic-marks-v1.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
""", """      fetch(`${ROOT}data/masoretic-marks-v1.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      // the rows of Jastrow's that are a word sense (word-senses-rule-v1); without
      // it no row is marked and every row prints as it did
      fetch(`${ROOT}data/word-senses/jastrow-v1.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
""")
# 3. an overlay's rows under a key: the ones the record names are marked
one("""    const ruled = ix.lanes ? new Set(Object.entries(ix.lanes).filter(([, l]) => l && l.standing === "ruled").map(([id]) => id)) : null;
    return data[key]""", """    const ruled = ix.lanes ? new Set(Object.entries(ix.lanes).filter(([, l]) => l && l.standing === "ruled").map(([id]) => id)) : null;
    // a word sense is marked by its key, rank and source id, as the record names it (word-senses-rule-v1)
    const senses = o.id === "jastrow" && WORD_SENSES && WORD_SENSES.rows ? WORD_SENSES.rows[key] || null : null;
    return data[key]""")
one("""OVERLAY_ROWS.set(r, o.id); return r; });""",
    """OVERLAY_ROWS.set(r, o.id); if (senses && senses.some(([rk, m]) => rk === r[0] && m === r[3])) SENSE_ROWS.add(r); return r; });""")
# 4. the pool: held back while the switch is off, counted either way
one("""      const keptExtra = extra.filter((row) => !sourcesOff.has(row[3]));
      withheldBySources += extra.length - keptExtra.length;
      extra = keptExtra;
    }
""", """      const keptExtra = extra.filter((row) => !sourcesOff.has(row[3]));
      withheldBySources += extra.length - keptExtra.length;
      extra = keptExtra;
    }
    // WORD SENSES (word-senses-rule-v1): a row of Jastrow's that is a word
    // sense is held back while the switch rests off, and counted; on, it
    // stays, and prints as a word sense below. A row a source switch already
    // withheld is counted there and not again.
    let withheldBySense = 0, sensesShown = 0;
    if (sensesPref === "on") sensesShown = extra.filter((row) => SENSE_ROWS.has(row)).length;
    else { const kept = extra.filter((row) => !SENSE_ROWS.has(row)); withheldBySense = extra.length - kept.length; extra = kept; }
""")
# 5. a word sense's pill prints as one: its own pill, never folded into a definition's
one("""        const yr = orderYearOf(row);
        const nd = isNoDerivs(index.m_sources[mId].licensePosture);
        (nd ? [routePrinted(row)] : readingsOfRow(row)).forEach((reading) => {""", """        const yr = orderYearOf(row);
        const nd = isNoDerivs(index.m_sources[mId].licensePosture);
        (nd ? [routePrinted(row)] : readingsOfRow(row)).map((x) => (SENSE_ROWS.has(row) ? `${SENSE_PRINTS}${x}` : x)).forEach((reading) => {""")
# 6. the counts ride on the pool and on every copy of it
one("""    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere; pool.withheldByName = withheldByName;
""", """    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere; pool.withheldByName = withheldByName;
    pool.withheldBySense = withheldBySense; pool.sensesShown = sensesShown;
""")
one("""    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry; to.withheldByName = from.withheldByName;
""", """    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry; to.withheldByName = from.withheldByName;
    to.withheldBySense = from.withheldBySense; to.sensesShown = from.sensesShown;
""")
# 7. what the card says: in the sentence of a block left with nothing, and on the line under the pills
one("""        if (pool && (pool.withheld || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources)) {
          const bits = [];""", """        if (pool && (pool.withheld || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense)) {
          const bits = [];
          if (pool.withheldBySense) bits.push(`${pool.withheldBySense} word sense${pool.withheldBySense === 1 ? "" : "s"} held back — Jastrow's note${pool.withheldBySense === 1 ? "" : "s"} on the word's sense, not a definition, shown under the word senses switch`);""")
one("""        if (pool.withheld || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources) {
          if (!wLine) { wLine = document.createElement("p"); wLine.className = "kq-role withheld-line"; readRow.append(wLine); }""", """        if (pool.withheld || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense || pool.sensesShown) {
          if (!wLine) { wLine = document.createElement("p"); wLine.className = "kq-role withheld-line"; readRow.append(wLine); }""")
one("""          if (pool.withheldBySources) parts.push(Object.assign(document.createElement("span"), { className: "sources-withheld", textContent: `${pool.withheldBySources} withheld by your source switches (${sourcesOffSay()})` }));
          parts.forEach((x, i) => { if (i) wLine.append(" \\u00b7 "); wLine.append(x); });""", """          if (pool.withheldBySources) parts.push(Object.assign(document.createElement("span"), { className: "sources-withheld", textContent: `${pool.withheldBySources} withheld by your source switches (${sourcesOffSay()})` }));
          // the word senses' count is the switch itself: one press shows them, or holds them back again
          const nS = pool.withheldBySense || pool.sensesShown || 0;
          if (nS) {
            const b = Object.assign(document.createElement("button"), { type: "button", className: "senses-switch",
              textContent: pool.withheldBySense ? `${nS} word sense${nS === 1 ? "" : "s"}, not definition${nS === 1 ? "" : "s"}, held back — show` : `${nS} word sense${nS === 1 ? "" : "s"} shown — hide` });
            b.setAttribute("aria-pressed", String(!pool.withheldBySense));
            b.addEventListener("click", (e) => { e.stopPropagation(); chooseSenses(pool.withheldBySense ? "on" : "off"); });
            parts.push(b);
          }
          parts.forEach((x, i) => { if (i) wLine.append(" \\u00b7 "); wLine.append(x); });""")
# 8. the switch on the rail and the switches page
one("""    { id: "suggested", voice: "them", lab: "source suggested",""", """    // WORD SENSES — see the note above SENSES_KEY. Jastrow's notes on a word's
    // sense, held back, or shown on the card as word senses.
    { id: "senses", voice: "them", lab: "word senses", why: "Jastrow's notes in square brackets on a word's sense, which the dictionary beside the store serves as readings of their own: held back, or shown on the card as «word sense, not definition: …», never as a definition",
      positions: [{ id: "off", lab: "held back" }, { id: "on", lab: "shown" }],
      live: () => !!WORD_SENSES,
      waits: "the corpus lane's list of Jastrow's word senses (tools/bake-word-senses-v1.mjs)",
      get: () => sensesPref,
      set: (id) => chooseSenses(id),
      now: () => (sensesPref === "on" ? "shown" : "held back") },
    { id: "suggested", voice: "them", lab: "source suggested",""")
# 9. the reset puts it back where it rests
one("""  const SWITCHES_DEFAULT = { mode: "he", blobs: "off", nums: "on", dict: "off", signs: "off", namelead: "lead" };""",
    """  const SWITCHES_DEFAULT = { mode: "he", blobs: "off", nums: "on", dict: "off", signs: "off", namelead: "lead", senses: "off" };""")
one("""&& signsPref === SWITCHES_DEFAULT.signs && nonamesPref === SWITCHES_DEFAULT.namelead;""",
    """&& signsPref === SWITCHES_DEFAULT.signs && nonamesPref === SWITCHES_DEFAULT.namelead && sensesPref === SWITCHES_DEFAULT.senses;""")
one("""    if (nonamesPref !== SWITCHES_DEFAULT.namelead) chooseNames(SWITCHES_DEFAULT.namelead);
""", """    if (nonamesPref !== SWITCHES_DEFAULT.namelead) chooseNames(SWITCHES_DEFAULT.namelead);
    if (sensesPref !== SWITCHES_DEFAULT.senses) chooseSenses(SWITCHES_DEFAULT.senses);
""")
# 10. the card asked again when the switch moves
one("""  const reopenCard = () => {""", """  reopenForSenses = () => { if (document.getElementById("railRows")) railSwitch(); reopenCard(); };
  const reopenCard = () => {""")
# 11. the count's press reads as a press inside a line of words
one("""  #hud .rows .band > .kq-role { margin: 0.05rem 0 0.3rem; font-size: 0.66rem; line-height: 1.35; color: var(--faint); }""",
    """  #hud .rows .band > .kq-role { margin: 0.05rem 0 0.3rem; font-size: 0.66rem; line-height: 1.35; color: var(--faint); }
  #hud .withheld-line .senses-switch { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; text-decoration: underline dotted; text-underline-offset: 0.2em; }""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: word senses, 17 edits")
