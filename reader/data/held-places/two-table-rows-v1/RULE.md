# RULE — two table rows, and words written alike (v1)

22 November 2026 AD. Corpus lane (Moses). Written before the builder. It answers the page lane's letter of 22 November 2026 AD on two lines of relay v210's own-language list v1.1. Nothing served is changed, nothing is struck from the store, and nothing is downloaded: this is a reading of sources the lane already holds, a rule, and its measures.

## 1. The ask

The page lane's letter, `<the Tabernacle>/corpus-lane-builds/moses-elijah-asks-2026-11-21/inputs-r3/2026-11-22/FOR-MOSES-2026-11-22-ship-15-live-two-lines-of-v210.md`, asks (its words):

«Are these two rows right as English Wiktionary's own words, and only wrong at the Targum's places (two words written alike), or is the item itself wrong? If the rows stand, I will need a way to keep a row off a place where the text's word is another word written alike, and that may be the same question as the Zohar's prefix split. If they do not, strike them, and I take your strike list as always.»

The two rows are lines of `<the Tabernacle>/corpus-lane-builds/moses-send-back-v1/send-back-v1.1/landing-own-language-v1.1.jsonl`:

| row | the letter's words for it |
|---|---|
| M78, key נגידא, route «necromancy» | «under the key נגידא (English Wiktionary's item: lang «Jewish Babylonian Aramaic», code arc, line 38968 of its file)» |
| M78, key מרוא, route «zaatar» | «under the key מרוא (lang «Aramaic», code arc, line 222759)» |

The places the letter names, each with the letter's words:

| row | place | the letter's words |
|---|---|---|
| נגידא | Targum Jonathan on Judges 2:18 | «Targum Jonathan on Judges 2:18 («all the days of the leader»)» |
| נגידא | Targum Jonathan on Judges 2:19 | «and 2:19 («when the leader died»)» |
| נגידא | Aramaic Targum to Ruth 1:6 | «the Aramaic Targum to Ruth 1:6 and 4:21» |
| נגידא | Aramaic Targum to Ruth 4:21 | «the Aramaic Targum to Ruth 1:6 and 4:21» |
| מרוא | Targum Jonathan on Isaiah 28:20 | «Targum Jonathan on Isaiah 28:20 and on Nahum 3:14» |
| מרוא | Targum Jonathan on Nahum 3:14 | «Targum Jonathan on Isaiah 28:20 and on Nahum 3:14» |

And the places the page lane read as right and named by verse (a cross-check only; the rule never reads them):

| place | the page lane's words, and where |
|---|---|
| Targum Jonathan on Malachi 3:1 | «the Lord whom you seek» at Malachi 3:1 (the letter) |
| Targum Jonathan on I Kings 7:26 | «hand» as a measure at 1 Kings 7:26 (the letter) |
| Targum Jonathan on Isaiah 28:17 | «plummet» (Isaiah 28:17) (`ship-16/SHIP-16.md` beside the letter) |
| Aramaic Targum to Song of Songs 4:11 | Song of Songs 4:11 (`ship-16/SHIP-16.md` beside the letter) |

## 2. Sources (read only)

- **The row's own source**: English Wiktionary as kaikki writes it, `<999 footsteps>/ledgers/work/ldmprs/source-cache/kaikki-english-hebrew-translations-2026-07-14/kaikki.org-dictionary-English.jsonl.gz` (streamed). Its sha256 must be the one `send-back-v1.1/receipt-v1.1.json` names.
- **English Wiktionary's own Aramaic entries**: `<999 footsteps>/ledgers/work/ldmprs/source-cache/kaikki-aramaic-2026-07-14/kaikki.org-dictionary-Aramaic-words.jsonl` (its sha256 must be the one its `source-manifest-v1.json` names). Every record of it is lang «Aramaic», code arc. The lane holds no kaikki file of Wiktionary's Jewish Babylonian Aramaic entries, so for those that entry cannot be read here; that is said, never guessed.
- **Jastrow**: `<999 footsteps>/ledgers/work/ldmprs/source-cache/sefaria-dump-2026-07-14/jastrow-dictionary-entries.jsonl` (Sefaria's dump of «Jastrow Dictionary», London, Luzac, 1903; one entry a line; its sha256 must be the one `jastrow-extraction-manifest.json` names).
- **The texts at the places**: the lane's built editions, `<the Tabernacle>/corpus-lane-builds/moses-edition-door-v1/built/<work folder>/<edition>.tokens.csv.gz` with its `.units.csv.gz` and `.json`, picked through `<the Tabernacle>/corpus-lane-builds/moses-edition-door-v1/out/serve-set-v12-built.csv`.
- **The landing list v1.1** and its receipt (above); the list's sha256 must be the one `receipt-v1.1.json` names among its outputs.
- **For the PanLex comparison**: `send-back-v1.1/ANSWERS.md` section M, and the same landing list's M24 line under the key דאבא.

## 3. How letters and points are read (every clause, written before the build)

- **Letters.** Take the text in Unicode NFD and keep only the 27 letters U+05D0 to U+05EA. Final forms (ך ם ן ף ץ) are kept as written. Two words are «written alike» when their letters are equal.
- **Points.** Take the text in NFD. Map holam for vav (U+05BA) to holam (U+05B9) and qamats qatan (U+05C7) to qamats (U+05B8). Keep the letters, the vowel signs U+05B0 to U+05B9 and U+05BB, dagesh (U+05BC), and the shin and sin dots (U+05C1, U+05C2). Drop everything else: accents (U+0591 to U+05AF), meteg (U+05BD), maqaf, rafe, paseq, sof pasuq, the upper and lower dots, punctuation, digits, Latin, the geresh and gershayim. Then put the result in NFD again, which orders the marks the same way every time. Two forms «carry the same points» when the results are equal.
- **A form has points** when, so read, it holds at least one vowel sign (U+05B0 to U+05B9 or U+05BB). Dagesh or a shin dot alone is not points.
- **Abbreviations.** A Jastrow headword or alternative headword holding a geresh (׳), gershayim (״) or apostrophe is an abbreviation and is not read as a spelling.
- **Numbering.** A Roman numeral (I to X) after a Jastrow headword is Jastrow's own numbering of words written alike. A superscript number (², ³, …) after a headword is the dump's own key for its records, not Jastrow's; it is dropped before any comparison and reported as the dump's.
- **Jastrow's text.** An entry's text is each sense's `definition` with its markup taken out (every `<…>` removed, white space run together). Quotes of Jastrow in the outputs give this text, and beside it the raw `definition` exactly as the dump writes it.

## 4. Question 1: is the row right as its own source's translation?

- The line names the item: `line:L#sense:S#translation:T` (or `#entry#translation:T`). The builder reads line L of the English file again and takes that item. **The row stands as its source's own translation** when the item is there, its `lang` and `code` are the line's, and its `word` is one of the line's `headwords`. The English entry's word and the sense's gloss are quoted as the source writes them.
- Beside it, the builder shows what the other sources the lane holds say of the same letters: Wiktionary's own Aramaic records (word, part of speech, etymology number, canonical forms, glosses), and Jastrow's entries (section 5), and which of them carry the row's own points.
- **A row is wrong in its source** only when its own source does not hold it as the line says. Such a row goes on the strike list with the source's own words (what the line names and what the source reads there) as the reason. A spelling that another dictionary lacks, or lists as more than one word, is no reason to strike (CALL: the row is judged by its own source alone).

## 5. Words written alike: when a source marks a spelling as two or more words

### 5a. Jastrow

- **The entries of a spelling**: every entry whose `headword`, or one of whose `alt_headwords`, has the spelling's letters (abbreviations not read).
- Jastrow joins two entries into one word in two ways, each in its own words:
  - **J1, a pointer.** An entry that cites no text (every link in its senses names Jastrow: its `data-ref` begins «Jastrow, ») and whose text says «v.» points to the words it names after its last «v.»: each Hebrew word written there, with the Roman numeral after it if one is written («v. preced.» names the entry before it, `prev_hw`; «v. next w.» the entry after it, `next_hw`). A named word is found among Jastrow's entries by equal points (its numeral, if written, must be the entry's); an abbreviation names nothing. The pointer and every entry it names are one word.
  - **J2, «same».** An entry whose `language_reference`, its markup taken out, reads «same» (Jastrow's «ch. same»: the Aramaic of the word just named) is one word with the entry that link names.
- Joining is carried through: two pointers that name the same word are one word with it. An entry named this way that does not have the spelling's letters (for example נָגוֹדָא, named by «leader, v. נָגוֹדָא.») stands **beside** that word: its citations count for that word (section 6), and its forms do not count among the spelling's forms.
- **The spelling's Jastrow words** are the groups so formed among the spelling's entries. **Jastrow marks the spelling as two or more words** when there are two or more. Jastrow's own Roman numerals on the spelling's entries are counted and reported beside it.
- The **forms of a Jastrow word** are the headwords and alternative headwords, with the spelling's letters, of its entries (numbering dropped).

### 5b. English Wiktionary's own Aramaic entries

- **The records of a spelling**: every record whose `word` has the spelling's letters.
- **Wiktionary marks the spelling as two or more words** when its records carry two or more distinct `etymology_number` values (Wiktionary's own «Etymology 1, 2, …»). Records with no number are one word together. Two parts of speech under one etymology are one word.
- The **forms of a Wiktionary word** are its records' forms tagged «canonical», and the record's `word` when it has points.

A spelling is **marked** when Jastrow marks it or Wiktionary marks it. A source that marks it is a **marking source** for it.

## 6. Zones without a reading of the place, their places, and Jastrow's citations

- **The zones** are those where the page has no reading of the place, only of the spelling: the Targum (the page lane's commentary zones) and the Zohar. The lane's served works for them are, from `serve-set-v12-built.csv` with `serve_state` SERVE: every work whose id begins `targum/` or `tanakh/onkelos-`, `tanakh/targum-neofiti`, and `kabbalah/zohar`, `kabbalah/tikkunei-zohar`, `kabbalah/zohar-chadash`.
- **One edition a work**: its WHOLE_STREAM edition with the most rows (the lowest O-ED number on a tie); a work with no whole stream, its edition with the most rows. The receipt says, for each work, whether its other whole editions carry the same `normalized_token_stream_sha256`.
- **A place** is one token of that edition whose `normalized_key` is the row's key: named by work, edition, `unit_id` (from the unit map: the unit whose `start_row` ≤ the token's row < `start_row` + `rows`, rows counted from 1 after the header) and row. **Its form** is the token's `hebrew`, read as in section 3.
- **Jastrow's citations of a place.** In each sense of an entry, a link whose `data-ref` names a Targum work and a verse, `<work> <chapter>:<verse>` or `<work> <chapter>:<verse>-<verse>`, cites those verses; the link's text is Jastrow's printed reference and is quoted. A link followed by «sq.» (and not «sqq.») cites the next verse as well (Jastrow's «sq.», and the following). The cited verse is the lane's unit `<slug>-<chapter>-<verse>`, the slug being the work's name in small letters with commas dropped and spaces made hyphens; for «Targum Jerusalem, <Book>» the unit is `targum-jerusalem-<book>-<book>-<chapter>-<verse>`, as the lane's unit map writes it. A cited verse whose unit is not in the unit map names no place of ours (counted). The Zohar is cited by none.
- **A citation names the place's word**:
  - (a) when the citing entry is one of the spelling's entries, or (b) stands beside one of its Jastrow words (5a): it names that Jastrow word;
  - (c) when the citing entry is neither, but the sense that holds the citation writes the spelling's letters as a word: it names that entry, a word that is not among the spelling's Jastrow words. (c) is reported; it neither holds nor frees a row.

## 7. The rule

**The class.** A row that names a spelling and no place (every row of the translation tables), at a place in a zone of section 6, where its spelling is marked (section 5).

**What the rule does.** In the class, the row is **held at that place** (the place stays bare of it), unless the place itself ties to the row's own word:

- **L1, the text's own points.** The place's form has points and carries the same points as one of the row's `headwords`; and in at least one marking source that form is a form of exactly one word, and in no marking source of two or more; and in no marking source do the row's headwords fall in two or more words.
- **L2, Jastrow's own citation.** Jastrow is a marking source; the citations of (a) and (b) at the place name one Jastrow word and no other; the row's headwords carry the points of a form of that word and of no other Jastrow word of the spelling; and if Wiktionary marks the spelling too, the row's headwords fall in at most one of its words.

Otherwise the row is held there, with the reason written: the place has no points; the row's headwords have none; the points differ; the points are a form of two or more words; Jastrow cites the verse under another of the spelling's words; or nothing at the place says which word it is.

**What it leaves alone.** A row whose spelling no source marks is not touched by this rule anywhere. Places in the books, where the page reads the place, are not touched. A held row is **not struck**: it stays in the store, right for its own word, and stands wherever this rule frees it or a reading of the place names it.

**CALL (the lane, 22 November 2026 AD).** The lane never ties a row to a dictionary's word by reading their English for likeness. It ties them only by the points both write, or by the dictionary's own citation of the very verse. Where neither ties them, the row is held, and the place stays bare.

## 8. PanLex's «wolf», kept apart

The same builder reads PanLex's line under the key דאבא (M24, «wolf») through section 5 and reports what it finds. That row is held by the page lane for another reason: at the Zohar's «of the father» the text's word is a joined word at the front, ד «of» with אבא «father», and the page's prefix split decides it. That class is a question of where the word begins in the text. This rule's class is a question of which dictionary word a whole spelling is. The two are counted apart, and neither rule holds or frees a row of the other's class.

## 9. Measures (each read from a file and written to the receipt)

1. Rows: the M78 and M103 lines of the list, landed and held, and their keys.
2. Keys marked by Jastrow, by Wiktionary, by either; keys with Jastrow's own Roman numerals; for landed rows and for the two held rows apart.
3. The places, in the Targum and in the Zohar, of every landed row (row-places and distinct places): of rows whose spelling is marked and of rows whose spelling is not.
4. The Targum places at which Jastrow's own citation names the place's word: by (a) or (b), and by (c); for marked and for unmarked spellings; and among marked ones, whether the word named carries the row's points.
5. For the class: places held, freed by L1, freed by L2, and the held ones by reason; in the Targum and in the Zohar apart.
6. The two rows: each place and its outcome; each place the letter names, with Jastrow's citation there, quoted.
7. The cross-check places: what the rule does to every landed row whose key stands at them.
8. The strike list (rows wrong in their own source).

## 10. Checks, each a hard stop

1. Every input's sha256 is the one its record names (section 2); every file read is recorded by bytes and sha256.
2. The list holds the M78 and M103 lines; each of the letter's two rows is found exactly once by m, key and route, and its source line is the one the letter names.
3. Every one of these rows' items is read again. One that does not hold the line's `lang`, `code` and a `word` among its `headwords` is not a stop: it goes on the strike list (section 4). The two rows of the ask must be read.
4. Every quote of the letter or of `SHIP-16.md` written here stands in that file byte for byte, and every place named in section 1 is a place of its row's key (or, for the cross-check, a unit) in the edition read.
5. Every Jastrow text quoted is its entry's definition with markup taken out, and every raw definition quoted stands in the entry's line.
6. No file written holds a path of this machine, the home folder's name, or an e-mail address.
7. Two runs into two folders give the same bytes.

## 11. Outputs

- `two-rows-v1.json`: the two rows, questions 1 and 2, with every source's own words.
- `marked-keys-v1.jsonl`: one line a key of the M78 and M103 rows, with its Jastrow words and Wiktionary words and why it is or is not marked.
- `places-v1.jsonl`: one line a row and place, in the Targum and the Zohar, with the place's form, Jastrow's citations there, and the rule's outcome.
- `strike-list-v1.json`: the rows wrong in their own source, each with the source's own words.
- `receipt-v1.json`: inputs, measures, checks, outputs.
- `ANSWER.md`, written after the builder from the receipt, in plain words.

## Amended

**Amended 1, after the builder's first trial run (into a scratch folder, before the two runs): a pointer that names a shared form names nothing.** In section 5a, J1: a word named after «v.» that is the form of two or more of Jastrow's entries names none of them, since Jastrow's words there do not say which. The first trial joined נְגִיד (נְגִידָא I) and נְגִיד ² (נְגִידָא II) into one word through such a pointer, and so counted two words where Jastrow numbers three.

**Amended 2, after the second trial run: dagesh is not compared.** In section 3, dagesh (U+05BC) is dropped with the other marks, so two forms carry the same points when their vowels and shin or sin dots are the same. The second trial held «sword» (סַיְפָּא, as Wiktionary writes it) at 20 Targum places that write סַיְפָא, the same vowels without the dagesh. Sources write dagesh differently. Two of a dictionary's words that differ only by a dagesh now share one form, so neither of them ties a row by points: the place is held, which is the safe side.

**Amended 3, after the second trial run: the order of a held place's reason.** The reason is written in this order: the row's headwords have no points; then what Jastrow's citation of the verse says (under one of the spelling's words while the row's points are a form of none of Jastrow's words; under another of the spelling's words; under two or more; under one while the row's points are a form of two or more; under the row's word while Wiktionary's own entries give the row's points to two or more words); then the place's points (none; not the row's; the row's headwords fall in two or more words; the points are a form of two or more words); else nothing at the place says which word it is. The order changes no outcome, only which reason is written.

**Amended 4, after the second trial run: kind (c) is a quote, not a naming.** In section 6, a citation of kind (c) (another headword whose sense writes the spelling) turned out, at the 11 places where it stood alone, to be Jastrow quoting the verse's words under another word (for example מָרֵי inside the phrase quoted under זְנוּתָא at Targ. Job XXXVI, 14), or noting another reading; no field tells these apart. So (c) is reported as «quoted under another headword», and only (a) and (b) are counted as Jastrow's citation naming the place's word.

**Amended 5, after the first pair of runs (their outputs are replaced by the pair run after this note): a second cross-check, by the page lane's own words, and one measure split.** Measure 4's «named word is another» is split into: the named word is another word whose points the row does not carry; the row's points are a form of no Jastrow word; the row's headwords have no points. The letter names its right places at the Targum by English words too: «honey», «bed» in «the bedroom», «plummet», «the Lord whom you seek», «hand» as a measure. The builder also reports, for each, every landed row whose `route` is that word (honey, bed, plummet, Lord, hand) and what the rule does at its Targum places. It is a cross-check only: the rule never reads a route.

**Amended 6, before the last pair of runs: a second count by another road.** `verify-two-table-rows-v1.mjs`, which does not import the builder, recounts from the raw files the rows and keys, the two items at their source lines, Wiktionary's Aramaic marks on the landed keys, Jastrow's own Roman numerals on them, the two keys' places in every whole Targum edition the lane built, and Jastrow's citations of the six asked verses, and compares each with the builder's outputs. It writes `verify-receipt-v1.json` and stops on any difference.

**Amended 7, 22 November 2026 AD, the lane's call: hold only on evidence (v2).** The lane's message of 22 November changes the default. The owner's standing words it quotes, as the lane's record `send-back-v1.1/verify-r1/work/owner-words-r1.json` holds them: at 2026-09-19T02:54Z «my goal at this point isnt to tweeze out definitions we dont like, its to exclude entire sources or alphabets» and at 2026-09-19T03:10Z «currently we are pro more with toggleability». So in v2 a row on a marked spelling is held at a place **only where the sources' own data says the place's word is another word written alike**; where nothing says either way, it stands. The rule as built in v1 (held unless freed) stays in the ledger as the labelled branch WIDE_HOLD, off at rest. The v1 builder and its outputs are kept as they are; v2 is `build-two-table-rows-v2.mjs` with its own outputs.

*The row's word.* The Jastrow word the row is, **R**, is told:
- by its points, when exactly one of the spelling's Jastrow words carries the row's points; or
- otherwise by its own entry word, when the row's own source's English entry word (the line's `route`) stands as a whole word in the text of exactly one of the candidate Jastrow words. The candidates are the words that carry the row's points, or all the spelling's words if none does.

The second way reads the two sources' own English, letter for letter. It is never a likeness. Every place whose class rests on it carries the branch flag TIE_BY_ENTRY_WORD, and the receipt counts the classes with that branch on and off. Without it, R is not told.

*Jastrow's corpus marks.* They are read from Jastrow's own «List of Abbreviations», as the lane's Sefaria dump holds it (`dump_small.tar.gz`, member `./dump/sefaria/texts.bson`, the text «Jastrow», «London, Luzac, 1903», node «List of Abbreviations»). `extract-jastrow-abbreviations-v1.mjs` writes it to `jastrow-abbreviations-v1.json`; the archive must be the bytes its acquisition manifest names.
- A linked reference in an entry is marked by the longest abbreviation of the list that its printed words (the link's text) open with.
- A reference that opens with none («Ib.», «ib.», a bare number) continues the mark of the reference before it in the same entry.
- A mark is the Targum's when its own meaning in the list begins «Targum». In the list these are «Targ. = Targum.», «Targ. O. = Targum Onkelos.», «Targ. Y. = Targum Y’rushalmi (or Jonathan).» and «Targ. II = Targum Sheni (to Esther).».
- «Y.» is «Y’rushalmi (Palestinean Talmud)» and is not the Targum's.
- No line of the list names the Zohar, so Jastrow attests no word in the Zohar.
- The dump's link (`data-ref`) only finds where a printed reference stands. The receipt counts the references whose mark and link disagree on being the Targum's.

*The classes.* Every row and place gets one:
- **UNMARKED**: the spelling is not marked (section 5).
- **HELD_BY_CITATION**: Jastrow's (a) or (b) citations of the very verse name only words other than R; or, R not told, they name only words that do not carry the row's points while some word does.
- **FREED_BY_CITATION**: L2 as written.
- **HELD_BY_POINTS**: the place's points are not the row's, and in a marking source they are a form of one or more words of which none is the row's (R, or, R not told, none carrying the row's points). This needs the row to have points or R to be told.
- **FREED_BY_POINTS**: L1 as written.
- **HELD_BY_CORPUS**: R is told; Jastrow cites R, but never in the place's corpus; and Jastrow cites another of the spelling's words in that corpus.
- **STANDS_NO_EVIDENCE**: a marked spelling where nothing says either way. It carries the branch flag WIDE_HOLD.

The order is: the verse's citation first, then the place's points, then the corpus, then no evidence. A place where the citation and the points disagree takes the citation, and the receipt counts such places.

*At rest (the lane's call).* Held: HELD_BY_CITATION, HELD_BY_POINTS and HELD_BY_CORPUS. Standing: STANDS_NO_EVIDENCE, FREED_BY_POINTS, FREED_BY_CITATION and UNMARKED. The WIDE_HOLD branch is off at rest, and TIE_BY_ENTRY_WORD is on, as the lane's call, to be confirmed. The extractor and the v2 builder each run twice to the same bytes.

**Amended 8, after the v2 trial run: one more count, no class changed.** The receipt also counts the places whose class rests on a points tie made only through an alternative headword. «fat tail» is one: its points אֲלִיתָא are an alternative headword of Jastrow's entry אַלִּיתָא, «fig-tree», and not of its fat-tail entry אַלְיְתָא. Each place says whether its points tie came through an alternative headword only. `verify-two-table-rows-v2.mjs`, which does not import the builder, recounts the two asked rows' classes from the raw files.

**Amended 9, 22 November 2026 AD, the lane's resting call (v3).** The lane's message, after reading v2's misfires («fat tail» tied to the fig-tree entry, «midsummer», «Lord» at 2 Kings 5:13, «preach»), sets the resting state:
- TIE_BY_ENTRY_WORD is accepted as the lane's call. Wiktionary's own entry word standing verbatim in exactly one candidate's own Jastrow gloss is the two sources' own words, not ours. It stays labelled.
- **Held at rest:** HELD_BY_CITATION, by any tie; and HELD_BY_CORPUS, only where the row's word is told by its entry word.
- **Branches, off at rest, each labelled:** HELD_BY_POINTS (BRANCH_HELD_BY_POINTS); HELD_BY_CORPUS where the row's word is told by its points (BRANCH_HELD_BY_CORPUS_POINTS_TIE); and WIDE_HOLD.
- **Everything else stands.**

*How v3 reads it.* Each place's three kinds of evidence are read apart, each as in Amended 7: the verse's citation (frees, holds, or says nothing); the place's points (frees, holds, or says nothing); and the corpus (holds, with the tie it rests on, or says nothing). The order stays the same as before. Then:
1. A citation that frees makes the place stand; one that holds holds it.
2. Otherwise, points that free make it stand.
3. Otherwise, a corpus hold on an entry-word tie holds it, whether or not the points would also hold.
4. Otherwise it stands. A place that stands carries every off-at-rest hold that applies to it as a branch flag, and WIDE_HOLD where nothing said anything. A branch flag is written only where that branch, turned on, would hold the place by the same order, so a place freed by a citation or by its points carries none.

*Resting classes.* HELD_BY_CITATION, HELD_BY_CORPUS_ENTRY_WORD, FREED_BY_CITATION, FREED_BY_POINTS, STANDS_BRANCH_HELD_BY_POINTS (it may also carry the corpus points-tie flag), STANDS_BRANCH_HELD_BY_CORPUS_POINTS_TIE, STANDS_NO_EVIDENCE (WIDE_HOLD), UNMARKED.

*Checks and lists.*
- The v3 builder rebuilds each place's v2 class from the same evidence and must find it equal to `places-v2.jsonl`.
- It lists every row and place whose state at rest differs between v2's resting set and v3's, with both classes (`moves-v3.jsonl`). v3's held set lies inside v2's, so every move is from held to standing.
- It says, for each misfire the lane named, which branch now holds it and whether it stands (`misfires-v3.json`). The named misfires are «fat tail» (key אליתא), «midsummer» (קיטא), «Lord» (מרי) at 2 Kings 5:13, and «preach» (כרז).
- The v2 builder, its outputs and `receipt-v2.json` are kept as they are. That receipt pins RULE.md as it stood before this note.

**Amended 10, 22 November 2026 AD, the lane's final resting call (v3.1).** The lane's message reads v3. Switching the points branch off released at least 88 right holds («sour grapes» 69, «yoke» 17, «hackberry» 2) to fix about 10 misfires («midsummer» 8, «Lord» 1, «preach» 1). Bare is better than wrong. So:
- **Held at rest:** HELD_BY_CITATION, HELD_BY_POINTS, and HELD_BY_CORPUS where the row's word is told by its entry word.
- **A branch, off at rest:** HELD_BY_CORPUS where the row's word is told by its points (BRANCH_HELD_BY_CORPUS_POINTS_TIE: the «fat tail» 4, 3 of them real fat-tail places); and WIDE_HOLD.
- **Everything else stands.**

*How v3.1 reads it.* It keeps Amended 7's order: the verse's citation (frees or holds), then the place's points (frees or holds), then the corpus. A corpus hold on an entry-word tie holds. A corpus hold on a points tie stands, flagged BRANCH_HELD_BY_CORPUS_POINTS_TIE. A place where nothing says anything stands, flagged WIDE_HOLD.

*Resting classes.* HELD_BY_CITATION, HELD_BY_POINTS, HELD_BY_CORPUS_ENTRY_WORD, FREED_BY_CITATION, FREED_BY_POINTS, STANDS_BRANCH_HELD_BY_CORPUS_POINTS_TIE, STANDS_NO_EVIDENCE (WIDE_HOLD), UNMARKED.

*Checks and lists.*
- The v3.1 builder rebuilds each place's v2 class and v3 resting class from the evidence, and must find them equal to `places-v2.jsonl` and `places-v3.jsonl`.
- It lists every row and place that moves from v2's resting set and from v3's (`moves-v3.1.jsonl`, each line saying which).
- It names, with their places, the points-class holds that remain known misfires (`known-misfires-v3.1.json`). These are the ones the lane named: «midsummer» (קיטא), «Lord» (מרי) at 2 Kings 5:13, «preach» (כרז). Beside them it names the «fat tail» (key אליתא) corpus branch.
- For every other row the points class holds, it writes what the points and the dictionaries' own entries show (`points-class-v3.1.json`): the row's points and the words they are a form of; the row's word where it is told (by its points or its entry word); the place's points and the words they are a form of; and each of those words' headwords and Jastrow's own text, quoted. No English is matched or judged. The rows the lane named as right («sour grapes» (בסרא), «yoke» (כדנא), «hackberry» (מישא)) are tagged as the lane's reading. The rest («sword» (סיפא), «smith» (קיני), «thyme» (חשא), «marble» (שישא)) are tagged as described only.

**Amended 11, 22 November 2026 AD, after the verify seat on v3.1 (`verify-r1-v3.1/`): two clauses of the entry-word tie, written out, and the seat's mends.** No figure of v3.1 changes.
- *The text a candidate word is read in.* With TIE_BY_ENTRY_WORD (Amended 7), a candidate word's text is two things together: the text of its own entries, and the text of every entry Jastrow joins beside it. An entry is joined beside by a «v.» pointer (J1) or by «same» (J2): for example the Hebrew entry beside an Aramaic one. The builders have read it so since v2, but Amended 7 did not say it.
- *Letter case.* The match ignores letter case.
- *What the clauses decide.* The seat found that these clauses decide 3 places, and the v3.1 receipt counts them (`entry_word_tie_clauses`). The joined-beside text decides all 3: «marble» (שישא) at 1 Kings 4:3 is held; «stubble» (קשא) at Onkelos Exodus 15 and at the Targum of Psalms 83:14 stands. Letter case decides none.
- *The lane accepts both clauses* as part of the declared tie.
- *Forms in `points-class-v3.1.json`.* Each printed form is now listed as stored, with its code points, its count of places, and the rule's points form. Two forms of «hackberry» (מישא) look the same: they differ only in the order of their marks, qamats and shin dot. The receipt names them.
- *ANSWER.md is now written by `make-answer-v3.1.mjs` from the files.* Each place's text is the edition's tokens around it, exactly as the edition stores them, joined by one space. The seat's word mends are made there:
  - Jastrow's «ib. 57ᵃ top» (Gittin 57a) for נְגִידָא III is added. It is not a link in the dump, so it is not in the counts.
  - The «preach» sentence is corrected.
  - «smith»'s printed forms are given as stored.
  - The letter's own words «plenty or water» are quoted.
- *Two runs.* `two-runs-v3.1.mjs` runs the builder and the answer maker twice each.

usage: `node build-two-table-rows-v1.mjs <the Tabernacle folder> <999 footsteps folder> <this RULE.md> <out folder>`; `node two-runs-v1.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>`; then `node verify-two-table-rows-v1.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>`. For v2: `node two-runs-v2.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>` (which runs `extract-jastrow-abbreviations-v1.mjs <999 footsteps folder> <out file>` and `build-two-table-rows-v2.mjs`, each twice), then `node verify-two-table-rows-v2.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>`. For v3: `node two-runs-v3.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>` (it runs `build-two-table-rows-v3.mjs` twice; the builder reads `jastrow-abbreviations-v1.json` and `places-v2.jsonl` beside this RULE), then `node verify-two-table-rows-v3.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>`. For v3.1: `node two-runs-v3.1.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>`. It runs `build-two-table-rows-v3.1.mjs` twice (the builder reads `jastrow-abbreviations-v1.json`, `places-v2.jsonl` and `places-v3.jsonl` beside this RULE), then `verify-two-table-rows-v3.1.mjs <the Tabernacle folder> <999 footsteps folder> <this folder>` once, then `make-answer-v3.1.mjs <the Tabernacle folder> <999 footsteps folder> <this folder> <out file>` twice.
