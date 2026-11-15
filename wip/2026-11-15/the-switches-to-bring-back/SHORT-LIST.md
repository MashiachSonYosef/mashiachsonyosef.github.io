# The switches worth bringing back: a short list (15 November 2026)

The owner, 15 November: «if we have some more toggles worth bringing back in we can start thinking about it. i know we have a ton of them sidelined as placeholders on /toggles/».

## Where the switches stand today

The page's registry (`reader/zone.html`, `TOGGLES`) holds 17 switches once this morning's ship lands. A book page shows, in its header row, the pills English reader, framed, card numbering, concordance hud, word senses and reset; on its rail, the sources strip and the forced «source suggested» label (the owner, 14 October: «move most of our toggle controls into the /toggles/ branch of the website until we have checked most of them»), and, from this ship, the default source pills and the second source's chooser in the header row. Every other switch works under `?rail=all`, which /toggles/ links to, and every check reaches each by its id.

| switch | positions | on a book page today |
|---|---|---|
| sources | each dictionary on or off | on the rail |
| source suggested | forced: «the BSB, for now» | on the rail |
| default source | STEP, MACULA, UBS, BDB | header row (new in this ship) |
| second source | chosen for this book, or one of the four | the default note (new in this ship) |
| the pointing | keep, only this pointing, the letters only | sidelined |
| pairs | which half of a written-and-read pair the English follows | sidelined |
| word senses | held back, shown | header row, as a pill (since 14 November) |
| edition | MAM, mark where Leningrad differs | sidelined |
| reads first, the line reads | which dictionary answers first; the source here or oldest first | sidelined |
| look up by | the form, the headword | sidelined |
| joined words | as written, as separate words | sidelined |
| license runs | off, the entry's own, any naming | sidelined |
| license | any, public domain, CC BY, CC BY-SA | sidelined |
| names | as meaning, as sound | sidelined |
| names lead | the name leads, no names | sidelined (stood as a pill for a day, 23 October) |
| source signs | off, as printed, after plain readings | sidelined (stood as a pill for a day, 23 to 24 October) |

Named by the owner and not built (`reader/data/toggles-named-v1.json`): makes sense, randomizer, newest first, source, Christian preferred, modern Judaism preferred, Masoretic preferred, most commonly selected, david theme. Placeholders on /toggles/: the commentary, the reading order, the order legend.

## The short list

Bring back to the book page, in this order. Each is built, each is held by checks today, and none changes what a source says.

1. **The vowels** (the registry's «the pointing»: keep, only this pointing, the letters only). It is the switch that decides the most on a card: «only this pointing» is what holds back every reading pointed otherwise, and a reader cannot see or lift that today. The wording proposal is ready (`reader/data/toggle-wording-proposals-v1.json`: «the vowels», in the owner's own phrase of 19 September). Bringing it back also delivers the named «Masoretic preferred».
2. **Written vs read** (the registry's «pairs»). The corpus lane's read words (v192) land in the next ship and put the right entry under each read word, so this is the moment the switch has the data it was waiting for. It shows only in books that have such a place.
3. **Other manuscripts** (the registry's «edition»: mark where Leningrad differs). It only marks; no reading moves.

(Corrected the same morning: the first writing of this list had «word senses» as its third. It already stands on the book page as a pill in the header row, since 14 November; it needs no bringing back.)

Next to build, of the named ones:

4. **Newest first.** Needs nothing: the card's order already knows each reading's year. It is the mirror of «oldest first».
5. **The named «source»** (one dictionary leads wherever it has a reading) is what the default source pills do. It should leave the named list when the switches ship, by that list's own rule («a toggle built is deleted from here»).

Not yet, and why:

- **reads first / the line reads, look up by, joined words, license runs, names, names lead, source signs, license.** Each changes how the line is built or ordered. The default source pills now decide the line too, so each of these should be proven beside them before it stands on a book page. The independent review of the default toggles is looking at exactly that seam.
- **Christian preferred, modern Judaism preferred.** They need what the owner's shelving idea needs (task 39): a declared record for each source, from the corpus lane, and the owner's names for the shelves. This is also the one lever seen for the outside reader's accuracy figure: most of the pills that reader calls wrong on Genesis 1 come from sources that carry no pointing, no entry and no name mark, so nothing a source says can set them apart yet (`../the-accuracy-question/GENESIS-1-VERB-CARDS-12-NOV-AND-NOW.md`).
- **most commonly selected** needs a count of presses, and the site keeps nothing of a reader: a ruling first. **david theme** and **makes sense** wait on ledgers from the corpus lane. **randomizer** needs nothing and is cheap; it is not on this list only because it does not help a reader read.
- **the commentary** is already reachable from the door; its credits are not finished (task 7).

## How it would be built

One ship after the ledgers: the three rows move out from under the fold (the `LEAD` set in `railSwitch`), the three open wordings are written into `TOGGLES` and deleted from the proposals file, the named «source» and «Masoretic preferred» leave the named list, /toggles/ is rebuilt, and the checks that count the rail's rows are amended with it.
