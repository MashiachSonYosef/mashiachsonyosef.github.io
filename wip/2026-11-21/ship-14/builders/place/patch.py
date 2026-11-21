#!/usr/bin/env python3
"""X1: a word's card stays at its word when a pill is pressed on it.

usage: python3 patch.py <reader dir>     (edits <reader dir>/zone.html in place)

Three edits, each an exact string that stands once in the page:
  1. the clamp: a card the page placed, found away from its word, goes back to it
  2. the placement: it notes that the card stands at its word, for the clamp to hold it there
  3. the reset pill's line: written under an open card, it leaves the card's word where it stood in the window
No rule of the stylesheet is touched: the page at rest is laid as it was. A card whose record's control arrives
after its last placement now opens at its word too (the same fault, as a card opens).
"""
import sys

EDITS = []

# 1. the clamp holds the card at its word -----------------------------------------------------------------------
EDITS.append((
    "  const placeInBounds = (...a) => { placeInBoundsOnly(...a); snapBandsNow(); };\n",
    "  // AND THE CLAMP LEAVES THE CARD AT ITS WORD (21 November 2026). The\n"
    "  // placement stands a card 8px from its word, and a press inside the card\n"
    "  // changes what it measured to do so: the record drawn for another reading\n"
    "  // is another height, its \"the record, whole\" control arrives a frame later\n"
    "  // and the card is fitted again, the reading under the word wraps or stops\n"
    "  // wrapping. The clamp kept the card's top, so a card standing above its\n"
    "  // word that came out shorter stood away from it (Obadiah 1:1, the second\n"
    "  // pill pressed on a phone: 688px to 768 and placed again for that, then\n"
    "  // 668, and 108px of page between the card and its word), and a card\n"
    "  // beneath a word whose line lost a row stood a row under it. So the clamp\n"
    "  // looks before it fits. A card the page placed, standing at its word, is\n"
    "  // held, and stays held while the page has not scrolled, or has scrolled\n"
    "  // and left the word where it stood (the browser keeping the reader's\n"
    "  // place, the pin under the reset pill's line). A held card the fit and\n"
    "  // the snap leave away from its word goes back to it: one standing above a\n"
    "  // word that has not moved is stood on its foot again, where the foot was,\n"
    "  // nothing fitted anew; any other is placed again under the whole law. A\n"
    "  // card the reader moved is the reader's, and so is a page the reader\n"
    "  // scrolled: the card is not brought after a word scrolled away from it. A\n"
    "  // card come onto its word is the clamp's own case, below, as it was.\n"
    "  let hudHeld = null;\n"
    "  // the placed card and its word, in the layout's own pixels, as the clamp\n"
    "  // reads them (the pop draws the card scaled): where the word's block\n"
    "  // stands in the window, the card's foot where it stands above the block,\n"
    "  // and how far it stands from the block on its side of it (null: on the\n"
    "  // word). Nothing where there is no word to stand at.\n"
    "  const cardAtWord = () => {\n"
    "    if (hud.hidden || hudMoved || !hudAnchor || !hudAnchor.isConnected) return null;\n"
    "    const a = ((hudAnchor.closest && hudAnchor.closest(\".wb\")) || hudAnchor).getBoundingClientRect();\n"
    "    if (!a.width && !a.height) return null;\n"
    "    const top = parseFloat(hud.style.top) || 0, foot = top + (hud.offsetHeight || 0);\n"
    "    const above = foot <= a.top + 0.5;\n"
    "    return { word: a.top, foot: above ? foot : null, gap: above ? a.top - foot : top >= a.bottom - 0.5 ? top - a.bottom : null };\n"
    "  };\n"
    "  // at its word: the placement's own 8px, and 4px more, as the clamp lets a\n"
    "  // card come 4px nearer its word before it places it again (a fit that\n"
    "  // takes a pixel or three off a card moves nothing: the records drawer\n"
    "  // opened took one, and the card held still)\n"
    "  const AT_WORD = 12;\n"
    "  const holdCard = (c) => { if (c && c.gap !== null && c.gap <= AT_WORD) hudHeld = { y: window.scrollY, word: c.word, foot: c.foot }; };\n"
    "  const placeInBounds = (...a) => {\n"
    "    const was = cardAtWord();\n"
    "    holdCard(was);\n"
    "    const held = was && hudHeld && (hudHeld.y === window.scrollY || Math.abs(hudHeld.word - was.word) <= 1) ? hudHeld : null;\n"
    "    placeInBoundsOnly(...a); snapBandsNow();\n"
    "    const now = held ? cardAtWord() : null;\n"
    "    if (!now || !(now.gap > AT_WORD)) return;\n"
    "    const top = held.foot !== null && Math.abs(held.word - now.word) <= 1 ? held.foot - (hud.offsetHeight || 0) : 0;\n"
    "    if (top >= 8) hud.style.top = `${top}px`;\n"
    "    else { placeHud(); snapBandsNow(); }\n"
    "  };\n",
))

# 2. the placement notes where it left the card -----------------------------------------------------------------
EDITS.append((
    "    // the bands were fitted to whatever height the card had a moment ago\n"
    "    fitBands();\n",
    "    // the bands were fitted to whatever height the card had a moment ago\n"
    "    fitBands();\n"
    "    // placed at its word, the card is held there by the clamp (placeInBounds)\n"
    "    hudHeld = null; holdCard(cardAtWord());\n",
))

# 3. the line under the reset pill leaves the open card's word where it stood -----------------------------------
EDITS.append((
    "    resetPill.disabled = !n && at;\n"
    "    resetState.textContent = n ? `${n} picked` : at ? \"default\" : \"\";\n",
    "    resetPill.disabled = !n && at;\n"
    "    // THE LINE COMES AND GOES WITHOUT MOVING THE WORD OF AN OPEN CARD (21\n"
    "    // November 2026). The first reading picked on a page writes \"1 picked\"\n"
    "    // under the pill, and where the line stood empty the row of switches\n"
    "    // grows by it: on a phone at the top of a book the Hebrew moved 16px\n"
    "    // down, out from under the card the pick was made in. Farther down the\n"
    "    // page a browser that keeps the reader's place holds the text itself;\n"
    "    // at the top of the page it does not. So the open card's word is pinned\n"
    "    // as a section is when its commentary opens (holdingSection): where it\n"
    "    // stood in the window before the line was written, it stands after.\n"
    "    const say = n ? `${n} picked` : at ? \"default\" : \"\";\n"
    "    const word = !hud.hidden && hudAnchor && hudAnchor.isConnected ? hudAnchor : null;\n"
    "    if (word && resetState.textContent !== say) holdingSection(word, () => { resetState.textContent = say; });\n"
    "    else resetState.textContent = say;\n",
))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    path = sys.argv[1].rstrip("/") + "/zone.html"
    with open(path, encoding="utf-8", newline="") as f:
        page = f.read()
    for i, (old, new) in enumerate(EDITS, 1):
        n = page.count(old)
        assert n == 1, f"edit {i}: its old text stands {n} times in the page, not once"
    for old, new in EDITS:
        page = page.replace(old, new)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(page)
    print(f"{path}: {len(EDITS)} edits made")


if __name__ == "__main__":
    main()
