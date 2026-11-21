#!/usr/bin/env python3
# The rail's mends of 21 November 2026 (the third reader's findings 3, 4, 6, 9, 13 and 15), as exact replacements
# in <reader dir>/zone.html. Every old string stands exactly once in the page, or nothing is written.
#
#   usage: python3 patch.py <reader dir>
#
# This file is plain ASCII and types no escape of a Hebrew letter or of any other character: the one character
# outside ASCII that an old string holds (the dash in a sentence the page already prints) is made by number.
import sys

DASH = chr(0x2014)

EDITS = []


def edit(finding, old, new):
    EDITS.append((finding, old, new))


# ---- finding 3: the scribes' marks button is taken before the rail's rows are cleared ----------------------------
edit("3", r'''    if (!rows) return;
    rows.replaceChildren();
''', r'''    if (!rows) return;
    // THE MARKS' BUTTON IS TAKEN BEFORE THE ROWS ARE CLEARED (21 November 2026).
    // It is one button, moved into the fold below at the first draw. A later
    // draw cleared it away with the rows and then looked for it in a page that
    // no longer held it, so after any switch that draws the rail again (the
    // word senses, the source signs, the names lead, the reset) the scribes'
    // marks had no button until the page was loaded again.
    const marks = document.getElementById("marksToggle");
    rows.replaceChildren();
''')
edit("3", r'''    // is the same one, moved, and works as it did
    const marks = document.getElementById("marksToggle");
    if (marks) {
''', r'''    // is the same one, moved, and works as it did (it is taken above, before
    // the rows are cleared)
    if (marks) {
''')

# ---- finding 9: the rail's one line counts the chips switched off, as the fold's own line does -------------------
edit("9", r'''    const drawn = window.__sourcesShelved || 0;
''', r'''    const drawn = window.__sourcesShelved || 0;
    // THE LINE COUNTS CHIPS, AS THE FOLD DOES (21 November 2026). It counted
    // ledger ids: a chip of two ids switched off said "2 off" over a fold
    // saying "1 switched off", and an id that rests off and draws no chip on
    // the strip said "1 off" on a fresh load with every chip on. What is said
    // off here is what a reader can see switched off, the fold's own count.
    const offN = window.__sourcesShelvedOff || 0;
''')
edit("9", r'''dictionaries${sourcesOff.size ? `''', r'''dictionaries${offN ? `''')
edit("9", r'''${sourcesOff.size} off`''', r'''${offN} off`''')
edit("9", r'''      const off = ordered.filter(isOff).length;
      sum.textContent = off ?''', r'''      const off = ordered.filter(isOff).length;
      window.__sourcesShelvedOff = off;   // for the rail's indicator, which says the same count
      sum.textContent = off ?''')

# ---- finding 4: the box on a "whole source" line is the source's switch, and its panel stays open ----------------
edit("4", r'''  const declBranch = (b, klass, showWork, stemKey) => {
''', r'''  const declBranch = (b, klass, showWork, stemKey, srcOff) => {
''')
edit("4", r'''    bx.setAttribute("aria-pressed", "true");
''', r'''    // a live box stands where its source's switch stands (srcOff), as the chip does
    bx.setAttribute("aria-pressed", String(!(whole && srcOff)));
''')
edit("4", r'''      bx.setAttribute("aria-label", `turn off: ${sayFor(b.aspect)}`);
''', r'''      bx.setAttribute("aria-label", `turn ${srcOff ? "on" : "off"}: ${sayFor(b.aspect)}`);
''')
edit("4", r'''      bx.addEventListener("click", (ev) => { ev.stopPropagation(); const t = box.closest(".src-row"); const s2 = t && t.querySelector(".dfp:not(.decl-bx)"); if (s2) s2.click(); });
''', r'''      // THE BOX FINDS ITS SOURCE'S CHIP ON THE STRIP, AND ITS PANEL STAYS OPEN (21 November 2026). The panel hangs
      // on the chip's shelf, under the strip, never inside the chip's own row, so the chip looked for above the box
      // was not found and a press did nothing. The chip is the one that carries the panel's key. Its press draws
      // the shelves again, which takes the panel down with them, so the panel is opened again by the source's name
      // (the declarations are in hand: nothing is waited for), its boxes drawn where the switch now stands, and
      // the box the reader pressed keeps the focus.
      bx.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const host = document.getElementById("sourcesRow"), panel = box.closest(".decl");
        const chipBox = host && panel && [...host.querySelectorAll(".src-row > .dfp")].find((x) => x.dataset.key === stemKey);
        if (!chipBox) return;
        const at = [...panel.querySelectorAll(".decl-bx")].indexOf(bx), held = document.activeElement === bx;
        chipBox.click();
        const name = [...host.querySelectorAll(".src-open")].find((x) => x.dataset.key === stemKey);
        if (name && name.getAttribute("aria-expanded") !== "true") name.click();
        const again = host.querySelectorAll(".decl .decl-bx")[at];
        if (held && again) again.focus({ preventScroll: true });
      });
''')
edit("4", '      reach.textContent = "the whole source says this ' + DASH + ' the box above turns it off";\n',
     '      reach.textContent = `the whole source says this ' + DASH + ' the box above turns it ${srcOff ? "back on" : "off"}`;\n')
edit("4", r'''    stem.branches.forEach((b) => wrap.append(declBranch(b, null, many, g.key)));
''', r'''    // where the source's switch stands, for its whole-source boxes: off when every id of its chip is off
    const srcOff = g.ids.every((id) => sourcesOff.has(id));
    stem.branches.forEach((b) => wrap.append(declBranch(b, null, many, g.key, srcOff)));
''')

# ---- finding 15: the search's hit shows the readings of the word it found ----------------------------------------
edit("15", r'''            try {
              const { v } = await dictKey(L);
              const n = new Map();
''', r'''            try {
              // THE READINGS ARE THE FOUND WORD'S (21 November 2026). The letters typed are not always the
              // word's own: typed without its final letter a word is still found (hebrew, above), and the
              // dictionary was then asked for the letters as typed. Under those the store holds nothing, or the
              // same letters where they stand inside longer words, so the hit showed no readings or another
              // key's. The hit's own letters are asked, as the hit itself asks them when it is opened (go).
              const { v } = await dictKey(r.exact[0]);
              const n = new Map();
''')

# ---- finding 6: a section laid again takes its bar's row down with it, and an opened commentary comes back -------
edit("6", r'''      for (const x of [...el.children]) if (["he-text", "c-bar", "c-slot", "xp-row"].some((c) => x.classList.contains(c))) x.remove();
      el.__body = el.__rebuild;
      if (materialise(el)) relaid += 1;
''', r'''      // THE BAR'S ROW GOES WITH THE TEXT, AND AN OPENED COMMENTARY COMES BACK (21 November 2026). The row the
      // commentary bar stands in was not taken down, and the build makes a new one and moves the bar into it: every
      // relay left an empty row, with its margins, in the section. The slot was taken down with the commentary
      // opened in it while the section was still remembered as holding it built, so the bar said open over nothing
      // and no press built it again. Which commentaries stood open is read before the slot goes; the section is
      // forgotten as built; and after the build they are built again and shown as they were.
      const shown = [...el.querySelectorAll(".c-inline")].map((x) => !x.hidden);
      for (const x of [...el.children]) if (["he-text", "c-bar", "c-barrow", "c-slot", "xp-row"].some((c) => x.classList.contains(c))) x.remove();
      inlineBuilt.delete(el);
      el.__body = el.__rebuild;
      if (materialise(el)) relaid += 1;
      if (shown.some(Boolean)) { buildSectionInline(el.__sec, el); el.querySelectorAll(".c-inline").forEach((x, i) => { x.hidden = !shown[i]; }); }
''')

# ---- finding 13: the pairs' ledger and the ledger of where each form stands forget what went, too ----------------
edit("13", r'''    for (let i = GLOSS_STANDS.length - 1; i >= 0; i -= 1) if (!GLOSS_STANDS[i].ge || !GLOSS_STANDS[i].ge.isConnected) GLOSS_STANDS.splice(i, 1);
''', r'''    for (let i = GLOSS_STANDS.length - 1; i >= 0; i -= 1) if (!GLOSS_STANDS[i].ge || !GLOSS_STANDS[i].ge.isConnected) GLOSS_STANDS.splice(i, 1);
    // AND THE TWO OTHER LEDGERS FORGET THEM TOO (21 November 2026). The pairs' ledger (KQ_STANDS) and the ledger of
    // every place a form stands (standsOf) were never pruned: each relay left its sections' old elements in both,
    // kept from the collector and painted again, off the page, at every change of order and every ruling.
    for (let i = KQ_STANDS.length - 1; i >= 0; i -= 1) if (!KQ_STANDS[i].ge || !KQ_STANDS[i].ge.isConnected) KQ_STANDS.splice(i, 1);
    for (const list of standsOf.values()) for (let i = list.length - 1; i >= 0; i -= 1) if (!list[i].wb || !list[i].wb.isConnected) list.splice(i, 1);
''')


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: python3 patch.py <reader dir>")
    path = sys.argv[1].rstrip("/") + "/zone.html"
    with open(path, encoding="utf-8", newline="") as f:
        page = f.read()
    base = page
    # every old string is counted in the page as it was handed over, before anything is replaced
    for finding, old, new in EDITS:
        n = base.count(old)
        assert n == 1, "finding %s: an old string stands %d times in the page, not once: %r" % (finding, n, old[:80])
    for finding, old, new in EDITS:
        assert page.count(old) == 1, "finding %s: an earlier replacement moved this old string: %r" % (finding, old[:80])
        page = page.replace(old, new)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(page)
    print("patched %s: %d replacements for findings %s" % (path, len(EDITS), ", ".join(sorted({e[0] for e in EDITS}, key=int))))


if __name__ == "__main__":
    main()
