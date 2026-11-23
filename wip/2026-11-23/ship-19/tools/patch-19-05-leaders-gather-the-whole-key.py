#!/usr/bin/env python3
"""Ship 19, patch 05: the leaders baked at a kind of place gather BDB's own entries from every row of the key, as the
page and the entry gate's check do.

The page asks a place its word's own key and gathers BDB's entries (bdbEntriesAt) from every row of that key, before
the pointing and the kinds hold any back (relay v212's reading 1, the reading this page reads). The projector bakes the
leaders at each kind of place (grades[surface].e) on a book the record of dictionary kinds rests shut from the rows that
rest open there, and it gathered BDB's entries from those rows alone. Until ship 19 the two came to the same: only
BDB's own rows carried b, and BDB rests open. With relay v218 the two entry lists land b too, on rows that rest shut,
so at a place where a list's row carries one of the place's numbers with BDB's entry, the page withholds BDB's rows of
another entry, and the baked leader could still be one of them: at Hosea 2:7 «their mother» the leader baked for
the place was BDB's «be wide, roomy», a row the card withholds (check-entry-gate-v1 E8 found it).

So the projector gathers BDB's entries from every row of the key (store.routesWhole), and still draws the leaders from
the rows that rest open. check-sign-does-not-lead-v1, which walks the leaders as the projector does, gathers the same
way. Every other law stands. 23 November 2026.

Usage: python3 patch-19-05-leaders-gather-the-whole-key.py <reader dir>
"""
import sys
from pathlib import Path

R = Path(sys.argv[1])
MARK = "BDB'S ENTRIES ARE GATHERED FROM EVERY ROW OF THE KEY"


def edit(rel, pairs):
    p = R / rel
    t = p.read_text(encoding="utf-8")
    if MARK in t:
        print("stands already:", rel)
        return
    for old, new in pairs:
        assert t.count(old) == 1, (rel, t.count(old), old[:100])
        t = t.replace(old, new)
    assert MARK in t
    p.write_text(t, encoding="utf-8")
    print("patched", rel)


edit("tools/project-lattice-v12-v1.mjs", [
    ("""const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const surfaceRows = new Map();   // pointed surface -> { srows, gradeOfRow, attested, otherStem, nameText, asked: the kinds of place asked so far }
const leadersAt = ({ srows, gradeOfRow, attested, otherStem, nameText }, place, isName) => {
  const bdbHere = place ? bdbEntriesAt(place, srows.map(factsOf)) : null;
""", """//
// BDB'S ENTRIES ARE GATHERED FROM EVERY ROW OF THE KEY (ship 19, 23 November
// 2026). The page gathers them (bdbEntriesAt) from every row of the word's
// key, before the pointing and the kinds hold any back (relay v212's reading
// 1), and so does this: from the key's whole rows (whole), while the leaders
// are drawn from the rows that rest open (srows). Until relay v218 only
// BDB's own rows, which rest open, carried b, and the two came to the same;
// the entry lists land b on rows that rest shut, and a leader gathered from
// the open rows alone could be a BDB row the card withholds (Hosea 2:7).
const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const surfaceRows = new Map();   // pointed surface -> { srows, whole, gradeOfRow, attested, otherStem, nameText, asked: the kinds of place asked so far }
const leadersAt = ({ srows, whole, gradeOfRow, attested, otherStem, nameText }, place, isName) => {
  const bdbHere = place ? bdbEntriesAt(place, whole.map(factsOf)) : null;
"""),
    ("""      surfaceRows.set(m.surface, { srows, gradeOfRow, attested, otherStem, nameText, asked: new Set() });""",
     """      surfaceRows.set(m.surface, { srows, whole: (store.routesWhole(m.key) || []).filter((row) => store.index.m_sources[row[3]]), gradeOfRow, attested, otherStem, nameText, asked: new Set() });"""),
])

edit("tools/check-sign-does-not-lead-v1.mjs", [
    ("""        const h = heldOf(surface, gr), place = tags ? placeEntry(tags) : null;
        const bdbHere = place ? bdbEntriesAt(place, h.srows.map(factsOf)) : null;
""", """        // BDB'S ENTRIES ARE GATHERED FROM EVERY ROW OF THE KEY, as the page and the projector gather them (ship 19,
        // 23 November 2026): the leaders are drawn from the rows that rest open, the entries from the key's whole rows
        const h = heldOf(surface, gr), place = tags ? placeEntry(tags) : null;
        const bdbHere = place ? bdbEntriesAt(place, (rest.routesWhole(gr.k) || []).filter((row) => mSources[row[3]]).map(factsOf)) : null;
"""),
])
