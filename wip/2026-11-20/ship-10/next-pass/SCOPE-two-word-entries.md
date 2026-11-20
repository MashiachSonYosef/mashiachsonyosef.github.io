# The next pass of ship 10: the twelve's own two-word entries, measured (20 November 2026 AD)

Page lane (Elijah). Done while ship 10a's records were building; nothing here is built yet. Inputs fetched read-only and matched to the hashes in Moses's letters: v209 (`spans-v1/`, 5 files) and v205 (`span-store-v1/`, 8 files). Tools beside this note; the lists they write (`multi-spans.json`, `places.json`, `no-place.json`) stay in scratch.

## What ship 10a keeps joined, and what the twelve mark themselves

Ship 10a keeps a joined cell at **754** of the span store's 2,845 places: where a row of a dictionary that stands is filed under the two words' own letters.

Moses's v209 reads each default-pick line by its source's own data: STEP's «+» («the same tag also covers the next Hebrew word»), UBS's lemmas of two words, BDB's headwords of two words, MACULA's words that are two of ours. Counted as distinct places, the four read **966** runs of two or more words in the 39 books (924 of two words, 38 of three, 4 of four; STEP at 810, UBS at 841, BDB at 314, MACULA at 6; all of the three at 297).

Set side by side (`compare.py`):

| | places |
|---|---|
| joined in 10a, and a source's own line reads the words as one | 553 |
| joined in 10a, and no source's line reads them as one | 201 |
| a source's line reads the words as one, and the span store has no place there | 412 |
| a source's line reads them as one, a place 10a sets aside | 1 (Bamoth-baal, Numbers 22:41) |

- **The 201** are mostly two fixed pairs STEP's TBESH files as an entry of their own: «כי אם» («if: except», 135 places) and «אף כי» («furthermore», 19); then names whose row is one dictionary's (Ben-Hur 6, Magor-missabib 5, Beer-lahai-roi 3).
- **The 412** are names the span store does not hold because its key is the bare name's letters. A name with a prefix on its first word is another key: «from Bethlehem» (11), «and Abed-nego» (13), «from Beersheba» (8), «in Bethel» (7), «the chief of the bodyguards» (23). 132 are written with a stroke, 280 with a space. At rest they read word by word in STEP's own pieces, «from + Beth-» «-lehem».

So the page today treats one name two ways: «Bethlehem» alone is one cell under the SDBH's «Bethlehem», and «from Bethlehem» is two cells, «from + Beth-» and «-lehem». That was so on live as well (the first by the span's line, the second inside a chain's cell or as two words).

## What I would build, unless the owner says otherwise

Read «joined» from the dictionaries' own marks, not from which keys the span store happens to hold:

1. A run of words is one cell where one of the twelve's own data reads it as one entry (v209's list), under the sources in force: STEP's mark at rest, and UBS's, BDB's or MACULA's own where that source is first. The cell's line is that source's own line, which v209 says reads the whole run. A name with a prefix then joins as the bare name does.
2. The fixed pairs («if: except», «furthermore») stay joined where STEP's own tags make the pair one entry at the place (v205's `entry_at_place`), and are words where STEP tags the two words apart.
3. v205's gate by entry replaces the span store's «held» for the rows that carry a number: a row stands where its own numbers cover every word of the place, counting a tag STEP's lexicon names as part of that number (Moses's call; it keeps Ramoth-gilead at 36 of 39 rows). Rows with no number (English Wiktionary's «Salt Sea», «day and night») rest shut already.

This is a visible change at about 400 places and wants its own before-and-after pictures. It is the «add carefully» half of the owner's direction, so it is put to them first in one line, and built if they do not object.
