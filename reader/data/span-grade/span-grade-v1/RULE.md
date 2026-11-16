# RULE — the span store's pointing grade (span grade v1)

12 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. The clauses were written from a count of the characters that stand in the rows' headwords and in the places' words (the receipt carries that count).

Amended the same day, after the builder's first run. That run showed that where a word stands cannot part a word in another form from another word on the same letters: «Sea of Reeds» (יַם against יָם) and «the Jewish people» (עִם against עַם) differ in the same place, a word before a maqaf. The word's own headword parts them, so the grade **same word** was added, read from the zone's headword of each word.

## What is asked

The serving lane's ask 1 of 12 November: at each place where the served span store joins words, is each entry that stands there these words as the text points them here? The span store lists a place under a key of bare letters, so an entry pointed as another word (בֶּן־דּוֹד, «a cousin», at "son of David") stands beside one that is the words themselves. The page withholds a row of the route store that is pointed otherwise; with this grade it can do the same for a span row, and count it.

## What is read

- The served span store: its 39 book files. A book file lists places (`placesList`: a key, a verse, the first and last word, and the rows that stand there, `row_ids`, in the store's order) and the rows of each key (`keys`).
- The served zones of the same 39 books: each verse's words as the page prints them. A place's words are the verse's words with the scribes' marks left out, from the first to the last word of the place, as the span store numbers them.
- The zone's headword of each word (`hp`): the corpus lane's lattice v12 lemma of the word, MACULA's pointed lemma, which the zone gives where MACULA's and TAHOT's lemmas have the same letters. The builder also reads the lattice v12 positions files of the 39 books, only to count, word by word, where the zone's headword stands and whose it is; the grade does not read them.
- A row's headwords are the members of its slot 7 (`slots[6]`). A **pointed headword** is one that holds a Hebrew letter and a Hebrew point (a vowel point, the dagesh, the shin or sin dot, or the qamets qatan). Members with no Hebrew letter (the transliterations) are not headwords here.

The place's words, joined by the gaps the text gives them (a maqaf after a word that ends in one, a space otherwise, the last word's own maqaf left out), are the place's key in bare letters. The builder stops at any place where they are not.

## The grade

For each place and each row it names:

- **silent** — the row has no pointed headword.
- **same** — some pointed headword of the row, read by the steps below, is the place's words read by the same steps.
- **same word** — none is same, but some pointed headword of the row has the place's letters (step 5), and either
  - every word of the place whose points still differ after steps 6 to 9 has a headword in the zone with the same letters as the word, against which the row's headword at that word is the same: both read by steps 1 to 4, with steps 6, 7 and 9 at that word; or
  - every word of the place has one and the same headword in the zone, whose letters with its separators out are the place's letters, and against it the row's headword is the same by steps 1 to 9 (the place's words are one name or phrase by their own headword, as the zone gives a name's headword at each of its words).

  The entry heads these words by their own headwords.
- **otherwise** — the row has pointed headwords and none is same or same word.

## The steps, in order

Each form is read on its own by steps 1 to 4:

1. Unicode canonical decomposition (NFD), so every point stands apart from its letter in one order.
2. These are taken out: the cantillation accents U+0591 to U+05AF (the headwords use U+05AB to mark the stressed syllable), the meteg U+05BD (the silluq is written with it), the rafe U+05BF, the paseq U+05C0, the sof pasuq U+05C3, the upper and lower dots U+05C4 and U+05C5, the inverted nun U+05C6, and the grapheme joiner U+034F.
3. Two points written two ways are written one way: the qamets qatan U+05C7 as the qamets U+05B8, and the holam for a vav U+05BA as the holam U+05B9.
4. A holam written on a letter that is followed by a vav with no point of its own is written on that vav (the holam of a full spelling, written on either side of the vav).

Then the two forms are set side by side:

5. The separators are taken out: in a headword the space, the no-break space, the maqaf and the brackets `[` `]`; in the place, the gaps between its words and its last word's own maqaf. If the letters of the two forms are not then the same letters in the same order, the grade is otherwise, because **the letters differ**. Otherwise each letter of the headword stands against the same letter of the place, and steps 6 to 9 work letter by letter, on both forms at once.
6. At the first letter of each of the place's words, a dagesh is not compared (a dagesh there marks only that the word follows another), except on a vav, where it is the vowel shuruq.
7. At the last letter of each of the place's words, a shewa is not compared (it is silent there).
8. **The Name.** Where a word of the place ends in the four letters יהוה and has at most three letters before them, each one of ו ב ל כ מ ה ש, the points of those four letters are not compared: they are the reading's vowels written on the Name, and they differ from edition to edition.
9. Where a word of the headword (its letters between separators) carries no point at all, the points of the place at those letters are not compared.

The grade is same when every letter's points are then the same on both forms.

## What the list carries

`span-grade-v1.jsonl` holds one line for each place, in the book files' order and each book's order of places:

- `book`, `ref`, `w` (the first and last word), `key`, and `text`: the place's words as the page prints them, joined by their gaps;
- `rows`: for each row the place names, in the store's order: `row_id`, `m` (its source's m id), `grade`, and
  - for same: `set_aside`, the steps 3, 4, 5, 6, 7, 8 and 9 that the two forms needed to be the same. Step 5 is named when the headword's words are not cut where the place's words are, or the headword holds a bracket; each of the others is named when, with that one step left out and every other step kept, the two forms would not be the same;
  - for same word: `by_headword`, for each word matched by its own headword, the word's number in the place, the place's word, the zone's headword, and the row's headword at that word, each as steps 1 to 4 leave it; where the place's words share one headword, one member with `words`, the first and last word;
  - for otherwise: `differs`, for each word of the place where some letter's points still differ, the word's number in the place, the place's word and the headword's letters at that word as steps 1 to 9 leave them, and two facts read from the text: `before_maqaf` (the word ends in a maqaf) and `at_pause` (the word carries the atnah U+0591, or the next thing in the verse is the sof pasuq); and `class`, one of: the letters differ; only words before a maqaf differ; only words at a pause differ; only words before a maqaf or at a pause differ; a word that is neither differs. Where the letters differ, `differs` is empty and `letters` gives the letters of both forms with the separators out. Where a row has several pointed headwords, same is sought in all of them before same word, and same word before otherwise; for same and same word the first headword in the row's order that gives it is reported; for otherwise, the one whose differences fall on the fewest words, the first of them in the row's order.

## Checks the builder makes, each a hard stop

1. every place's words, joined by their gaps, are its key in bare letters;
2. every row a place names stands under the place's key in the same book file;
3. every place stands in a verse of its book's zone, and the verse has as many words as the place's last word;
4. reading a form twice by steps 1 to 4 gives the same form (the steps are settled);
5. every character of a pointed headword and of a place's words is a Hebrew letter, a point, a mark step 2 takes out, or a separator of step 5.

## The second count

`verify-span-grade-v1.mjs` reads the same files and grades every place and row again from these words, by another method: it rewrites each form as one string with regular expressions and a list of marks per letter, rather than letter clusters, and must agree with every line of the list and with the receipt's counts. It is by the same hand as the builder, and says so.

## Axes

Every figure names its axis: places (where the span store joins words), rows (a row at a place), keys, letters.
