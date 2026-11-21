#!/usr/bin/env python3
"""The cards' mends of 21 November 2026 (the second reader's report, findings 2, 4, 9, 10, 11, 12 and 13).

usage: python3 patch.py <reader dir>

Edits <reader dir>/zone.html by exact-string replacement. Every old string must stand exactly once in the
page it is given; the script stops, and writes nothing, where one does not. Each edit is named for its finding
and stands by itself: the two of finding 10 (they change what the line of a run the reader has ruled prints,
and nothing of a run nobody ruled) can be taken out together without the others moving.

The page file holds no Hebrew letters: a Hebrew letter in its code is a backslash-u escape. This file types
no such escape (a typed one is turned into the letter itself on its way to disk here): it writes <<U>> where
the page has a backslash and a u, and E() below puts them back.
"""
import os
import sys

BS = chr(92)


def E(s):
    return s.replace("<<U>>", BS + "u")


EDITS = []


def edit(name, old, new):
    EDITS.append((name, E(old), E(new)))


# Finding 2. A reading chosen through its witness line is remembered under the reading's own key.
edit(
    "f2 the witness's key",
    r'''            // on its pieces' line, and TAHOT's set on the division it was
            // chosen on
''',
    r'''            // on its pieces' line, and TAHOT's set on the division it was
            // chosen on
            // THE KEY IS THE READING'S, AS A PILL'S PRESS KEEPS IT (21 November
            // 2026). It was asked of the reading's first record, a row with no
            // text and no records of its own, so every witness pressed was
            // remembered under one key that no reading answers to: the line
            // read the witness's reading and the card opened again on another
            // pill (Ruth 1:2 word 3, «Elimelech» chosen through its witness:
            // the card reopened on «[was] Elimelech»). The credit stays the
            // witness pressed: mId and wy are its row's
''',
)
edit(
    "f2 the key",
    r'''key: routeKey(group.records[0]), text: group.text, mId: row[3], wy: row[4],''',
    r'''key: routeKey(group), text: group.text, mId: row[3], wy: row[4],''',
)

# Finding 4. One failed shard is one request; the block pressed again asks again.
edit(
    "f4 the law",
    r'''    // a block whose shard did not arrive: asked again on the next paint, and
    // said so meanwhile, never counted as 0 (a shard that did not arrive is not
    // an empty shard)
    const blockFailed = new Set();
''',
    r'''    // a block whose shard did not arrive: said so, never counted as 0 (a shard
    // that did not arrive is not an empty shard), and asked again when the
    // reader presses the block again, as the table says, and not before.
    // ONE FAILURE IS ONE REQUEST (21 November 2026). The block was asked again
    // on the next paint, and its failure paints, so a shard that failed was
    // asked again from inside its own failure with no pause: about 1,500
    // requests in five seconds from one press of a block, for as long as the
    // card stood open. A failed block now keeps its place in blockEntries
    // (null, as while the store is asked), so no paint asks for it; the block
    // pressed again gives the place up (below, where the card's rows are
    // watched), and the paint that follows that press asks once more
    const blockFailed = new Set();
''',
)
edit(
    "f4 the failure",
    r'''() => { blockEntries.delete(bl); blockFailed.add(bl); if (gen === hudGen) paint(); });''',
    r'''() => { blockFailed.add(bl); if (gen === hudGen) paint(); });''',
)
edit(
    "f4 the press",
    r'''    if (rowsEl) mo.observe(rowsEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
''',
    r'''    if (rowsEl) mo.observe(rowsEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
    // A FAILED BLOCK PRESSED AGAIN IS ASKED AGAIN (blockFailed, above; 21
    // November 2026). The press is heard here on its way to the card's own
    // button, the dropdown's press with it (it presses the card's), and gives
    // the block's place in blockEntries up, so the paint that follows the
    // card's redraw asks the store once more. The rows are this card's: the
    // listener goes with them when the card closes
    if (rowsEl) rowsEl.addEventListener("click", (e) => {
      const pressed = e.target && e.target.closest ? e.target.closest(".b-cell .s-pills button") : null;
      const L = pressed ? lettersOf(pressed.textContent) : null;
      if (L && blockFailed.has(L)) blockEntries.delete(L);
    }, true);
''',
)

# Finding 9. The redraw hook is let go when a block is read again.
edit(
    "f9 the hook",
    r'''    const renderReadings = async () => {
      const surface = setWhole ? SET_KEY : cover[cellIdx].surface;
''',
    r'''    const renderReadings = async () => {
      // THE REDRAW HOOK IS LET GO WHEN A BLOCK IS READ AGAIN (21 November 2026).
      // The page's switches redraw the open card through the hook the last
      // block's pills set (redrawReadings, below), and a block with no pills
      // to draw (no reading, every record withheld, the catalog not reached)
      // returns before it sets its own. The hook left standing drew the block
      // before it into this band: at Ruth 1:1 word 4, the whole form pressed
      // and then «names: as sound», the last block's «3 readings carrying a
      // source's own sign switched off» and «4 of another entry than H8199,
      // withheld» stood under «No dictionary on this shelf gives this form
      // whole.» A block whose pills are drawn sets the hook again, as before
      redrawReadings = null;
      const surface = setWhole ? SET_KEY : cover[cellIdx].surface;
''',
)

# Finding 10, first half. A reading pressed on a block of several words of a run is the run's, and its line reads it.
edit(
    "f10 whose memory",
    r'''    const cellMap = (sf) => (wordsOwn && !/ /u.test(sf) ? memoryOf(kqCellKey(sf)).cells : mem.cells);
''',
    r'''    // (a named run's piece joined by a maqaf is several words too, 21 November 2026: «Beth-el» inside «El
    // Beth-el» at Genesis 35:7 was taken for one word, and a reading pressed on it went into the memory of
    // the chain that stands alone elsewhere, where neither this run's line nor that chain's reads it)
    const cellMap = (sf) => (wordsOwn && !/ /u.test(sf) && !(opts.run.named && sf.includes("<<U>>05be")) ? memoryOf(kqCellKey(sf)).cells : mem.cells);
''',
)
edit(
    "f10 the line",
    r'''    const parts = [];
    if (heldRun !== null) run.classList.add("chosen");
    for (const [j, wb] of wbs.entries()) {
      const chosen = memRun && run.__words && run.__words[j] ? memRun.cells.get(run.__words[j].k) : null;
''',
    r'''    const parts = [];
    if (heldRun !== null) run.classList.add("chosen");
    // A BLOCK OF SEVERAL WORDS THE READER RULED PRINTS ONCE OVER ITS WORDS (21 November 2026). A run ruled on a
    // division one of whose blocks is several words (a run named inside the run) keeps the reading pressed on
    // that block under the block's own letters, and this line asked each word for its own: at Genesis 35:7
    // words 6 to 8 the card said «El + Beth-el» and the line stayed «El + Beth- + -el». The division's blocks
    // are laid against the run's words, and a block of several words with a reading pressed on it draws one
    // part over them all (data-wn, tied to all their ink as a unit's part is), with the chip of the record it
    // was pressed on. A block left alone, a block of one word, and every run nobody ruled read as before
    const blockAt = new Map(), blockSkip = new Set();
    if (memRun && memRun.cut && memRun.cut.includes("+") && run.__words && run.__words.length === wbs.length) {
      let at = 0;
      for (const sf of memRun.cut.split("+")) {
        const ks = sf.split(/[ <<U>>05be]/u);
        if (!ks.every((k, x) => run.__words[at + x] && run.__words[at + x].k === k)) break;
        const p = ks.length > 1 ? memRun.cells.get(sf) : null;
        if (p && p.text) { blockAt.set(at, { p, n: ks.length }); for (let x = 1; x < ks.length; x += 1) blockSkip.add(at + x); }
        at += ks.length;
      }
    }
    for (const [j, wb] of wbs.entries()) {
      if (blockSkip.has(j)) continue;
      if (blockAt.has(j)) {
        const { p, n } = blockAt.get(j), wm = mOfPick(p);
        parts.push({ t: spanJoin(p.text), lic: wm ? licenseChipFor([wm]) : null, wi: j, wn: n });
        continue;
      }
      const chosen = memRun && run.__words && run.__words[j] ? memRun.cells.get(run.__words[j].k) : null;
''',
)

# Finding 11. Every head word of a run's own card is lit.
edit(
    "f11 the head",
    r'''    const openSurfaces = String((region && (region.s || region.k)) || "").split("<<U>>05be");
''',
    r'''    // (each piece without the space beside it, 21 November 2026: the card of a named run that is exactly a
    // maqaf chain names its words with a space after each joiner, openNamedRun, so only the first piece
    // matched its word and the run's own card lit its first word alone, the others at the regular weight)
    const openSurfaces = String((region && (region.s || region.k)) || "").split("<<U>>05be").map((x) => x.trim());
''',
)

# Finding 12. A line that is a row of parts no longer gives its smaller size back.
edit(
    "f12 the size",
    r'''    const line = run && run.__gloss;
    if (!line || !line.isConnected || !line.classList.contains("parts") || line.children.length < 2) return;
''',
    r'''    const line = run && run.__gloss;
    // A LINE THAT IS A ROW OF PARTS NO LONGER GIVES ITS SMALLER SIZE BACK (21 November 2026). The size a row is
    // let down to is set on the line itself, and it was taken off only below, which a line that is not a row of
    // two parts or more never reaches: a row let down to fit and then left with one reading printed that one
    // reading at the row's smaller size (Genesis 3:3 words 4 to 5 on a narrow screen, joined words as written:
    // the row let down, the shelf «no year given» switched off, «garden» alone at the smaller size beside its
    // neighbors' full one), and so would a run then read whole. A line with no such size is not touched
    if (line && line.style.fontSize && !(line.classList.contains("parts") && line.children.length >= 2)) line.style.fontSize = "";
    if (!line || !line.isConnected || !line.classList.contains("parts") || line.children.length < 2) return;
''',
)

# Finding 13. A bare run line says nothing in its title either.
edit(
    "f13 the title",
    r'''    if (!parts.some((p) => p.t)) {
      line.textContent = " ";
      line.classList.add("bare");
''',
    r'''    if (!parts.some((p) => p.t)) {
      line.textContent = " ";
      // a bare line says nothing, in its title either (21 November 2026: a line that went bare where it stood
      // kept the title of the reading it last drew, «top + before» over an empty line at Genesis 1:2 with
      // every source switched off); a line that never had a title is left as it was made
      line.removeAttribute("title");
      line.classList.add("bare");
''',
)


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: python3 patch.py <reader dir>")
    path = os.path.join(sys.argv[1], "zone.html")
    with open(path, encoding="utf-8", newline="") as f:
        page = f.read()
    base = page
    for name, old, new in EDITS:
        n = base.count(old)
        assert n == 1, f"{name}: the old string stands {n} times in the page, not once"
    for name, old, new in EDITS:
        assert page.count(old) == 1, f"{name}: an earlier edit moved this one's place"
        page = page.replace(old, new)
    # the page holds no Hebrew letter, and no character outside ASCII that it did not hold before
    assert not any(0x590 <= ord(c) <= 0x5FF for c in page), "a Hebrew letter stands in the patched page"
    fresh = sorted(set(c for c in page if ord(c) > 127) - set(c for c in base if ord(c) > 127))
    assert not fresh, f"characters outside ASCII new to the page: {fresh}"
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(page)
    print(f"patched {path}: {len(EDITS)} edits")


if __name__ == "__main__":
    main()
