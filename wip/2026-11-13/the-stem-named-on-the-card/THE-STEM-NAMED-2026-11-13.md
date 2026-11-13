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

## A count the card dropped, found beside it

While the suite ran on the change above I read the earlier readers' list again (`wip/2026-11-10/review/readers/page-script-lines-7100-11700.md`, finding 7) because it is about the same line of the card: "When a pool is copied (the whole form of a word the source divides; the written half of a pair) the stem gate's count is not carried over, so the card stops saying how many records the stem withheld." It was on my list of faults reported and not yet proven. I stopped the suite, proved it, and fixed it in the same change.

**Proven, on the live page** (`tools/card-divisions-stem.mjs`, `logs/l17-…-before.log`):

- Deuteronomy 22:29, word 17, the whole-form division: 37 readings and no withheld line at all. The stem gate had withheld 9 store rows there.
- Amos 4:2, word 10, the whole-form division: "14 records withheld by the pointing — their source points this word otherwise. No record is left to read here." Seven more rows were withheld by the stem and not said.

**Why.** The card keeps a filtered copy of a pool in two places: on the whole form of a word its place divides (the readings of the word in its parts are filed under the division, the owner's ruling of 3 October), and on the written half of a pair. Each copied the pool's counts by name, and the stem's count was not among the names.

**The fix.** One function, `carryWithheld`, names every count a pool carries, and both copies take them all. The stems ride with the count, so the copy names them too.

**After** (`logs/l17-…-after.log`):

- Deuteronomy 22:29, word 17: "9 of another stem than piel, withheld".
- Amos 4:2, word 10: "14 records withheld by the pointing — their source points this word otherwise; 7 records withheld by the stem — their source reads another stem of this verb than piel. No record is left to read here. Nothing here says the shelf lacks it."

**How many places** (`tools/stem-on-whole-forms.mjs`, `tools/whole-form-of-a-divided-word.mjs`; the store's rows only, and "divided" taken as a place with two or more pieces, so these are close counts and not the page's own): of 142,852 places where a divided word's whole form has rows in the store, the stem withholds a row at 457 (1,215 rows). At 91 of them readings are left and the withheld line now carries the count; at the rest no reading of the form as one word is left and the sentence now carries it.

**The check.** `check-pointing-gate-v1.mjs` has a fifth law: a word its place divides, whose whole form carries records of another stem, is found in the data; its whole-form division is pressed; the card must say the stem's count there, on its withheld line or in the sentence that says no record is left. It passes on the fixed page and fails on the live one (`logs/l14`, with G2).

## Seen on the way, and not changed

On the whole-form division of a divided word, the readings that read the word in its parts are set aside by design; they stand on the division. Where that leaves nothing, the card says one of two things:

- where a switch also withheld rows: "N records withheld by the pointing … No record is left to read here" (about 38,900 places by the count above);
- where no switch withheld anything: "No displayable route in the catalog for this form." (about 40,000 places).

Both are true of that view and neither says where the readings went: the catalog does have routes for the form, and they are on the other division. A plainer sentence there ("the catalog reads this form in its parts only; those readings stand on its division") would be a wording change on a common view, so it is put to the owner and not made here.
