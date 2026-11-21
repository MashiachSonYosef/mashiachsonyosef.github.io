# RULE — spans: the words each default-pick line reads (spans v1)

20 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. Nothing served is changed: this is a list for the serving lane.

## Why

The serving lane's letter of 15 November, ask 7: «Spans. Some lines read their neighbors' words, and the page cannot see it. At II Samuel 10:6:15, UBS's pick is the name «Aram Zoba», filed at the object marker's word, which a maqaf joins to «Aram». UBS has no line at 10:6:16-17, and TAHOT writes «Aram» «Zobah» with no mark across. So under UBS the name prints twice. … The page will not guess a span from the English. Shape: for each default-pick line, the words of the place it reads (first and last word), in the book files you send.»

So for every default-pick line this rule gives the first and the last word of the place the line reads, judged only by its own source's data: its lemma's or headword's words, its references, its own row boundaries and marks. Never by the English. Every line falls in one labelled class; a line whose span its source's data cannot give says so and why, and nothing is guessed.

## 1. Terms

- **The lines.** The default picks as the page landed them: default picks v1's book files (`default-picks-v1/<book>.jsonl`), with v1.1's `step-mend-v1.1.jsonl` and then v1.2's `step-mend-v1.2.jsonl` replacing a listed place's `step` array, and v1.2's `bdb-mend-v1.2.jsonl` replacing a listed place's `bdb` array; MACULA's and UBS's arrays are v1's. And Jastrow's default picks (`jastrow-default-v1/<book>.jsonl`). A line is one pick: a STEP pick `[n, kind, entry, …]`, the MACULA pick of a place, a UBS pick `[n, meaning id, …]` on one piece, a BDB pick `[n, BDBid, meaning, …]`, a Jastrow pick `{n, entry, …}`.
- **A place**: a word of the word numbering v1.1 (`moses-word-numbering-v1/build-v1.1/numbering-v1.1/<book>.jsonl`), written as the lines write `p`: its address with the full stop as a colon (`10:6.15` is `10:6:15`). **Our word** is a place.
- **First and last word**: the first and the last place of the span, in the numbering's order. `places` lists every place of the span in order.
- **Letters**: after Unicode NFD, the characters U+05D0 to U+05EA, each final form (ך ם ן ף ץ) read as its plain form; points, accents and every other character are set aside.
- **MACULA's words of a verse**: the lines of `macula-hebrew.tsv` whose `xml:id` holds the verse (its characters 2 to 9, book in the English Bible's order, chapter and verse), in file order, the pronoun endings (`pos` `suffix`) set aside. Each word has **written letters** (the letters of its `text`) and **dictionary letters** (the letters of its `lemma`). A MACULA word's places are the places whose `macula_xml_ids` hold it. Two neighbouring MACULA words **stand in one written word** when they have the same places.

## 2. UBS (M18): the reference and its encoding

UBS's README: «{S:00200300100012} … The key to the encoding is BBBCCCVVVSSWWW (Book, Chapter, Verse, Segment, Word). Segments are irrelevant for the Hebrew text … Words are counted using even numbers only. Hebrew words that are written together are still counted as separate words.» Each meaning's `LEXReferences` holds such keys. Read from the data itself:

- Every one of the 260,813 references opens with 14 digits. 258,116 have nothing after them; 2,697 carry a footnote mark after the 14 digits (`{N:001}`, and once each `!{N:001}`, `{N:-001}`, `{N:001}{N:002}`). The mark is set aside.
- The book (digits 1 to 3) is 1 to 39 in the English Bible's order (Genesis 001, II Samuel 010, Psalms 019, Malachi 039): all 39 occur.
- The chapter and verse (digits 4 to 9) number verses as the Hebrew Bible does, as MACULA does: every reference names a verse MACULA holds (Psalm 60's title is verses 1 and 2, and «Aram Zoba» is cited at Psalms 60:2).
- The segment (digits 10 and 11) is 00 in all 260,813.
- The word (digits 12 to 14) is even in all 260,813. Half of it is **the counted word**: UBS's number of the word in the verse, counting MACULA's words of the verse as above. Evidence, recounted by the builder and held to these figures: of the references whose entry's forms (§3) are all one word and whose letters are the dictionary letters of exactly one MACULA word of the verse, that word is the counted word in most, and the receipt gives how many it is, and how many stand earlier or later and by how far. Where they differ it is mostly because UBS counts as one some words MACULA makes two: לָמָּה, which MACULA writes לָ + מָּה (Genesis 4:6), and a name MACULA marks across two words, as בֵּית רְחֹוב at II Samuel 10:6, after which UBS's count runs one behind MACULA's.
- So the encoding is: book (3), chapter (3), verse (3), segment (2, always 00), twice the counted word (3).

II Samuel 10:6, the serving lane's example: «Aram Zoba» is meaning 000699001001000 of entry 000699 (lemma «אֲרַם צֹובָא», alternate lemma «אֲרַם צֹובָה»), reference 01001000600040: book 010, chapter 010, verse 006, segment 00, word 040, the 20th word. MACULA's 20th word of the verse is the object marker אֶת (o100100060152); its 21st and 22nd are אֲרַם and צוֹבָא. UBS counts בֵּית רְחֹוב (MACULA's 17th and 18th) as one, so its 20th is אֲרַם.

## 3. UBS: the place a line reads

**The filed word.** A UBS line stands on the MACULA word default picks v1 placed its reference on (v1's rule, unchanged): the MACULA word of the verse whose dictionary letters are those of the entry's lemma or one of its alternate lemmas, the nearest to the counted word (the earlier of two equally near); where none has them, the counted word itself. The builder places every reference again by that rule and stops unless it gives v1's `ubs` arrays at every place, byte for byte in their ids and order. A reference placed on a MACULA word that no place ties gives no line; it is counted.

**The entry's forms**: its `Lemma`, then each of its `AlternateLemmas`, in the file's order. A form's **words** are its parts between spaces (U+0020, U+00A0) and maqaf (U+05BE), each part's letters; parts with no letters are dropped. A form's **letters** are its words' letters joined. II Samuel 10:6: «אֲרַם צֹובָא» is two words, ארמ and צובא.

**A run spells a form** when it is consecutive MACULA words of the verse and one of these holds:

1. *Word by word.* Each word of the run gives either its written letters or its dictionary letters, at least one letter; joined in order they are the form's letters; and wherever two neighbouring words of the run stand in different written words, the letters given before that point are whole words of the form (the break between our words falls between two of the form's words).
2. *A name MACULA marks whole.* The form has two or more words; every word of the run has the form's letters as its dictionary letters; the run has two or more words and stands in no more of our words than the form has words. (Genesis 35:27: MACULA gives both קִרְיַ֣ת and הָֽאַרְבַּ֑ע the dictionary form «קִרְיַת אַרְבַּע».)

A run's places are its words' places. **The span of a reference** is found in this order:

1. Among the runs that spell any form and hold the filed word: the one with the most places; then the earliest first place; then the form that comes first.
2. Where no such run exists: among the runs that spell any form and hold no word where another reference of the same entry in this verse is filed, the one nearest the counted word (0 when the counted word is inside the run, else the count of words from it to the run's nearer end, in MACULA's count); then the most places; then the earliest first place. If two references of the entry in the verse take the same run this way, the nearer keeps it and the other takes none.
3. Where none: the span is not read.

**Other forms that fit.** Where another form of the entry spells a run that holds the filed word and has other places than the span (קִרְיַת and קִרְיַת יְעָרִים; רַב and רַב־שָׁקֵה), the line carries it in `other_forms_fit` with its first and last word: a branch, off at rest. Runs of the same form are not listed.

**A line's span.** A UBS line (a meaning on a piece) can hold several references of its meaning. Its span is theirs where they agree.

**The classes of a UBS line**, the first that holds:

1. `SPAN_NOT_READABLE_REFERENCES_DISAGREE`: its references give different spans (or one gives none). No first and last word; the spans are named.
2. `SPAN_NOT_READABLE_NAME_NOT_SPELLED`: no run spells any form, and a form has two or more words. No first and last word.
3. `ONE_WORD_BY_THE_COUNT`: no run spells any form, and every form is one word. The line reads one word, the one UBS's count names, where v1 filed it: first and last word are the line's own place.
4. `LEMMA_SPANS_WORDS_FILED_BESIDE`: the span has two or more places, and the line's own place is not among them (II Samuel 10:6:15).
5. `LEMMA_SPANS_WORDS`: the span has two or more places, the line's own place among them.
6. `ONE_WORD_FILED_BESIDE`: the span is one place, not the line's own.
7. `ONE_WORD`: the span is the line's own place.

## 4. STEP (TAHOT, M4; TBESH, M19)

TAHOT's own key, at the head of each file: «dStrongs: Lexical tags for each element of the Hebrew words, including prefixes and suffixes, with the Root in {curly brackets}. A "+" indicates the same tag also covers the next Hebrew word.» The same mark stands after a number in the column of alternative numbers (column 10, II Samuel 10:6: «H0758_B, H0760+») and once in a meaning variant (II Samuel 21:16, «H3430+»).

- **A row**: a word line of TAHOT, by its file and line. **Its places**: the places whose `tahot.tied` names it. **The next word** of a row: the next word line of the same file, if it has the same reference before `#`.
- **A pick's rows**: the rows tied to the line's place that give it: for kind `r`, a row whose core tag is the pick's entry (as v1 reads it: the number, with its letter, in the first segment of column 5 that holds `{`) and whose English (column 4, bidirectional marks U+200E, U+200F, U+202A to U+202E and U+2066 to U+2069 taken out, spaces gathered to one, ends trimmed) is the pick's words, or, where no row's English is, every row whose core tag is the entry; for kind `v`, the row whose first column, up to `=`, is the variant's own reference (its fourth item, as v1.2 writes every variant); for kind `a`, every row whose column 10 holds the pick's number. A pick no row gives stops the builder.
- **The pick's mark**: kind `r`: a `+` directly after its braced tag; kind `a`: a `+` in the item of column 10 that holds its number (`H0760+`, `H0415_a+`, `(H0025}+`); kind `v`: a `+` directly after its entry in the variant's own tags.
- **The chain** of a marked pick: its row; then, while the last row's pick of the same entry carries the mark, the next word, if the next word's row gives a pick of the same kind and entry, the chain going on through it; and where the next word's row gives no such pick, the next word still ends the chain (Genesis 15:4: כִּי־ «{H3588B}+» covers אִם, whose own tag is H0518B). A `+` after a braced tag that another braced tag follows in the same row's column 5 (Numbers 7:59:17, «{H6301}+/ /{H6301}») covers inside the row and starts no chain.
- **The span of a STEP pick**: the places of its rows; and where the pick stands in a chain (its row marks the chain, or the word before marks it and its row gives the same kind and entry), the places of every row of the chain.

The classes, the first that holds:

1. `SPAN_NOT_READABLE_NEXT_WORD_NOT_PLACED`: the mark points to a next word that no place ties, or there is no next word in the verse. No first and last word.
2. `TAG_COVERS_NEXT_WORD`: the pick's own row carries the mark, and the chain reaches places beyond the pick's rows' places.
3. `TAG_COVERED_FROM_WORD_BEFORE`: the pick's row does not carry the mark, but the chain of the word before reaches it, with places beyond the pick's rows' places.
4. `ROW_SPANS_WORDS`: the pick's rows are tied to two or more places (TAHOT writes as one row what our text writes as two words).
5. `ONE_WORD`.

## 5. MACULA (M3)

MACULA's line at a place prints its words' own `english`, word by word, so its own data cuts it at its words. The span of the MACULA line at a place is every place of every MACULA word the line names. Classes: `MACULA_WORD_SPANS_WORDS` where that is two or more places (a MACULA word our text writes as two, Daniel 1:8 פַּתְבַּג), else `ONE_WORD`. A MACULA word whose dictionary form holds a space (a name MACULA marks across words) still prints its own `english`; the receipt counts them, and they are `ONE_WORD`.

## 6. BDB (M46)

A BDB pick stands at a place because its record names the number of the place's STEP reading and cites the verse (v1's rule). BDB cites a verse, not a word. **Its headword**: the text of the record's first `<bdbheb>` element, tags removed; **its forms**: that text with every part in round brackets taken out, and each part in round brackets, each split into words as UBS's forms are (§3).

- `ONE_WORD`: every form is one word (or none has two words): the line reads the place it stands at.
- Where a form has two or more words: the runs of MACULA's words of the verse that spell a form (§3, both ways) and hold a MACULA word of the line's place. The span is the run with the most places, then the earliest first place. `HEADWORD_SPANS_WORDS` where it has two or more places; `ONE_WORD` where it is the place itself.
- `SPAN_NOT_READABLE_HEADWORD_NOT_SPELLED`: a form has two or more words and no such run spells one. No first and last word.
- `SPAN_NOT_READABLE_NO_HEADWORD`: the record has no `<bdbheb>`, or no letters in it. No first and last word.

## 7. Jastrow

Jastrow's default picks (relay v193) are placed by the letters of one word's dictionary form, one word as written, or one piece of a word (`form`, `placed_by`). The builder stops if any Jastrow headword has two or more words. Every Jastrow line is `ONE_WORD`: it reads the place it stands at.

## 8. What is written

- `spans-v1.jsonl`: one line per default-pick line whose class is not `ONE_WORD`, in the order of the 39 books (English Bible order), then of the places, then STEP, MACULA, UBS, BDB, Jastrow, then piece, then `n`:
  `{"book", "p", "source", "n", "piece", "id", "class", "first_word", "last_word", "places", "filed_in_span", "evidence", "other_forms_fit"}`.
  `source` is `step`, `macula`, `ubs`, `bdb` or `jastrow`; `piece` the UBS piece (MACULA id), else null; `id` UBS's meaning id, STEP's `[kind, entry]`, BDB's `[BDBid, meaning]`, MACULA's ids; `first_word`, `last_word`, `places` null where the span is not read; `filed_in_span` whether the line's own place is in its span. `evidence` is the source's own data: UBS's entry id, lemma, the form that spells the span (`lemma` or `alternate <k>`), each reference with its counted word, the run's MACULA ids and its way; STEP's rows (first column) and the mark; MACULA's ids and their places; BDB's headword and the run.
- `twice-words-v1.jsonl`: the words that print twice without the span. For each line of `spans-v1.jsonl` whose span is read and is more than its own place, each place of the span other than the line's own, with what the same source has there: `NO_LINE_OF_THIS_SOURCE` (another source fills it, so the words print twice: the serving lane's shape), `THE_SAME_LINE_AGAIN` (the same source prints a line with the same id and the same span there too), `ANOTHER_LINE_OF_THIS_SOURCE`. One line per source, place and status, naming the lines, in the same order as above.
- `receipt-v1.json`: the inputs (as placeholders, bytes and sha256), the encoding's evidence, every count named here by source and class and by book, the words that print twice by source, status and book, the examples, the checks.

## 9. Checks, each a hard stop

1. Every input is the bytes its manifest or receipt lists: UBS's JSON and README (UBS's source manifest), MACULA's TSV (its source manifest), TAHOT's four files (STEP's acquisition manifest), the unabridged BDB's CSV (the member of the zip its manifest lists), the numbering's 39 files (the numbering v1.1 receipt), default picks v1's 39 files, v1.1's and v1.2's mends, Jastrow's 39 files (their receipts).
2. Every reference has the shape of §2 (14 digits, book 1 to 39, segment 00, even word, a verse MACULA holds), and the evidence figures are recounted.
3. UBS's placement made again gives v1's `ubs` arrays at every place.
4. Every line of every source is in exactly one class; the classes add up to the lines; every listed span's places are consecutive places of one verse, the first and last word its ends.
5. Every STEP pick has a row; every variant carries its reference; no Jastrow headword has two words.
6. The examples hold: II Samuel 10:6:15 «Aram Zoba» reads 10:6:16 to 10:6:17, filed beside; the lines «Paddan-Aram» and «Kiriath-Arba» are listed with their spans.
7. No file written holds a path of this machine or the name of its user's home folder.

## 10. The second count

`verify-spans-v1.mjs`, by another road. It does not import the builder. It reads every input with its own reader; places UBS's references again with its own code; tries every run of up to eight words and every choice of written or dictionary letters by brute force, not the builder's step-by-step reading; finds STEP's rows by their first column and walks each chain by the word numbers after `#`; reads BDB's headwords with its own parse; makes every line's class and span again, and the words that print twice; and must agree with every line of both lists and every count of the receipt. It writes `verify-receipt-v1.json` with `agree: true`, or exits non-zero.

## Amended

Open notes, made after the builder's first runs and before any ship. The text above stands except where a note here says otherwise.

1. *Amended after the first run, which stopped.* A UBS reference that v1's rule places on a MACULA word no place ties gives no line (§3), so no span is sought for it: the builder stopped looking for the places of a run that held only such a word (II Samuel 7:22, «אֲדֹנָי»). Such a reference is still counted, and it still counts as «another reference of the same entry in this verse» in step 2.
2. *Amended after the second run.* §6 read BDB's headword from the first `<bdbheb>` only. The records of BDB's Biblical Aramaic part write their headword in `<bdbarc>` (BDB9664, «מַלְכוּ»), and some records open their first `<bdbheb>` with a sign and no letter (BDB9440 opens «ᵑ7», the Targum's sign, after its headword «דִּי» in `<bdbarc>`). So 2,207 BDB lines fell in `SPAN_NOT_READABLE_NO_HEADWORD`. The headword is now the text of the record's first `<bdbheb>` or `<bdbarc>` element that holds a letter; everything else in §6 stands.
3. *Amended after the second run.* The serving lane counted «about 340 words in 21 books» under UBS. The second run found more (the receipt gives them). To set them side by side, the receipt also parts UBS's words of status `NO_LINE_OF_THIS_SOURCE` in two: those where a STEP reading line (kind `r`) whose span holds that word also holds another word of the UBS line's span (TAHOT's own reading marks the name across, with `+` or one row), and those where none does, with their books.
4. *Amended after the third run.* §3's first way let one MACULA word give its dictionary letters for the whole of a form of two or more words, because MACULA writes a name's whole dictionary form on each of its words (at II Kings 2:2, בֵּית has the dictionary form «בֵּית אֵל»). So a run of that one word «spelled» «בֵּית־אֵל», and 432 lines carried such a one-word run in `other_forms_fit`; and where nothing else spelled the name, a line would have been called one word on that ground alone. That reads MACULA's label, not the text. Now, in the first way, a word's dictionary letters may stand only for letters inside one word of the form; its written letters may stand for any. A name MACULA marks whole is still read by the second way, where every word of the run must carry it.
5. *Amended after the fifth run.* (a) §3's second way took, from each first word, only the longest run of words that carry the name; the rule's words allow every such run, and now every one is tried. (b) §1 said two neighbouring MACULA words stand in one written word when they have the same places. A MACULA word that no place ties has no places, so it seemed to stand alone and make a break between our words where our text has none: at Jeremiah 39:3 our text writes שַׂרְאֶצֶר as one word (10), MACULA writes שַׂר and אֶצֶר, and the numbering ties only שַׂר. So a break is read only between words that places tie: a word no place ties stands in no word of ours and makes no break, and the break, if any, is read between the tied words on either side of it. In the second way, «the run stands in no more of our words than the form has words» counts the places of its tied words.
6. *Clarified after the sixth run, no line changed.* (a) In §3 step 2, when two references of an entry are equally near the run they both take, the one that comes first in UBS's file keeps it; the builder and the second count did so from the start. No two references are equally near in this build; the one reference that loses its run (Jeremiah 19:6:16, reference 02401900600046) loses it to a nearer one (02401900600038). (b) In step 2, as in step 1, the form that comes first breaks a tie of places and first place. Where two runs still tie (the same places, first place and form), the one that names the run in `evidence` (its words, its way) is the earlier start, then the earlier end; the span is the same either way, and the second count compares the span and the form, not that choice. (c) The second count finds a STEP row's next word by its word number after `#` in the same verse, where the builder takes the next word line of the file; they agree on every line.
7. *Amended after the seventh run, no line changed.* BDB writes some names as one word: BDB1087's headword is «בֵּיתרְֿחוֺב». So its line at II Samuel 10:6:13 is `ONE_WORD` by §6, and so is the line at 10:6:14, where the ledger placed the same record by the same number. Each reads its own word, but under BDB the record prints at both. The receipt now also counts the BDB lines of class `ONE_WORD` whose same record and meaning stand at the word before or after in the verse, by book. No class changes.
