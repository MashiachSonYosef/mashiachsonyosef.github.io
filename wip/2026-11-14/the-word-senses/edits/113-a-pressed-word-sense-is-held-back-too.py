# zone.html, word-senses-rule-v1: a word sense the reader pressed is held back with the rest when the switch goes off.
# Found by the page lane's own probe, 14 November 2026, at Obadiah 1:3, word 11: with the switch on, the reader
# presses «word sense, not definition: who will?» and the line under the word prints it; the switch turned off, the
# card held the word sense back and pressed «who?», while the line still printed the word sense. A ruling outranks a
# switch (THE ORDER TOGGLES, the precedence), but the rule's own promise is that a word sense prints only under its
# switch. So a pick remembers that it is a word sense, and the switch turned off forgets those picks, and only those,
# and lays the built sections again as the reset pill does. Refused unless each text stands once.
# python3 -I 113-a-pressed-word-sense-is-held-back-too.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
# 1. a pick remembers that it is a word sense, at both places a pick is made
one("""            selected = group; picked.set(surface, { key: routeKey(group.records[0]), text: group.text, mId: row[3], wy: row[4],
              place: PLACE_ROWS.has(row), cut: surface === SET_KEY ? cutKey(cover) : null, ...(group.kqRead ? { read: group.kqRead } : {}) });
""", """            selected = group; picked.set(surface, { key: routeKey(group.records[0]), text: group.text, mId: row[3], wy: row[4],
              place: PLACE_ROWS.has(row), cut: surface === SET_KEY ? cutKey(cover) : null, ...(group.kqRead ? { read: group.kqRead } : {}),
              ...(group.records.every((x) => SENSE_ROWS.has(x)) ? { sense: true } : {}) });
""")
one("""        selected = route; picked.set(surface, { key: routeKey(route), text: route.text, mId: route.records[0][3], wy: route.records[0][4],
""", """        // a word sense chosen is remembered as one, so the switch turned off
        // can hold it back from the line too (forgetSensePicks)
        selected = route; picked.set(surface, { key: routeKey(route), text: route.text, mId: route.records[0][3], wy: route.records[0][4],
          ...(route.records.every((x) => SENSE_ROWS.has(x)) ? { sense: true } : {}),
""")
# 2. the forgetting, beside the memory it forgets from
one("""  const cutKey = (c) => c.map((x) => x.surface).join("+");
""", """  const cutKey = (c) => c.map((x) => x.surface).join("+");
  // A WORD SENSE PRESSED IS HELD BACK WITH THE REST (word-senses-rule-v1). A
  // reading the reader pressed outranks every switch (THE ORDER TOGGLES, the
  // precedence), but a word sense prints only while its switch is on. Turned
  // off, the switch forgets the word senses the reader pressed, and nothing
  // else they pressed, and the built sections are laid again as the reset
  // pill lays them, so each such line reads what it read before the press.
  // The line printed the word sense on after the card had held it back
  // (found by the page lane's own probe, 14 November 2026, at Obadiah 1:3).
  // Says how many it forgot.
  const forgetSensePicks = () => {
    let gone = 0;
    const bare = [];
    for (const [k, m] of pickedByForm) {
      let here = 0;
      for (const [sf, pk] of [...m.cells]) if (pk && pk.sense) { m.cells.delete(sf); here += 1; }
      if (here && !m.cut && !m.cells.size) bare.push(k);
      gone += here;
    }
    if (!gone) return 0;
    // a form with no ruling left is no longer marked chosen where it stands
    // outside the sections (the book's title word); the sections' own words
    // are built again below, marked as their memory now says
    for (const k of bare) { ruledAt.delete(k); for (const st of standsOf.get(k) || []) if (st.wb) st.wb.classList.remove("chosen"); }
    relayBuiltSections();
    repaintGlossOrder();
    return gone;
  };
""")
# 3. the switch turned off forgets them before the card is asked again
one("""  reopenForSenses = () => { if (document.getElementById("railRows")) railSwitch(); reopenCard(); };
""", """  // off, a word sense the reader pressed is forgotten first (forgetSensePicks);
  // where one was, the sections are laid again and the card stands closed,
  // as under every switch that lays them again
  reopenForSenses = () => {
    if (sensesPref !== "on") forgetSensePicks();
    if (document.getElementById("railRows")) railSwitch();
    reopenCard();
  };
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: a pressed word sense is held back from the line when the switch goes off")
