# The card names the stem it held the rows to — 13 November 2026 AD

Elijah, page lane. A small page fault from the outside reader's list of 12 November (`wip/2026-11-12/an-outside-reader/AN-OUTSIDE-READER-2026-11-12.md`, section 4): "The stem is not named on the card. The page knows it and uses it for the gate without saying it." I marked it as owed with the next page change and then shipped a page change without it (the made spaces, earlier today). This pays it.

## What the card said, and says

Under "only this pointing", a row whose own source files it under another stem than the word has at this place is withheld and counted. The card said how many and never said than which:

    113 of 304 pointed otherwise, withheld · 5 of another stem, withheld

It now names the stem or stems the place's own parsing gives the word, which are the ones the gate reads (the lattice sidecar's, from the corpus lane's binyan ledger):

    113 of 304 pointed otherwise, withheld · 5 of another stem than qal, withheld

Where a card's every row is withheld, the sentence that says so names it too ("their source reads another stem of this verb than qal").

- The names are the sidecar's own, lower case as the sources write them: qal on 38,378 pointed surfaces of the thirty-nine books, hiphil 8,532, piel 5,426, niphal 3,767, and thirty-three more (`tools/stems-in-the-sidecars.py`). 292 surfaces carry two names, where the place's two sources disagree; the card then says both ("than hiphil or qal").
- The gate is not changed. What is withheld, and what stays, is what it was. A row whose source names no stem still stays, which is why a reading can stand on the card under Strong's while BDB's row of the same English, filed under another stem, is withheld: each source's rows are judged by what that source says.
- The card says the stem only where the stem withheld something. Saying it on every verb's card would be a new line on the card, and that is the owner's to want.

## The check

`tools/check-pointing-gate-v1.mjs`, law G2, now holds the wording to the data: the card's withheld line must read "N of another stem than <the sidecar's stems for the word>, withheld", and the row of pills must carry the same stems. On the edited page it passes (Amos 1:3, the verb "said": qal, 5 of 5). Run against the live page, which does not name the stem yet, it fails (`logs/l14`).
