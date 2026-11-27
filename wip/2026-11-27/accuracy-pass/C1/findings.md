# Helper C1: STEP's TAHOT (pieces and rows), STEP's TBESH, MACULA, each as it serves itself

Pass 5 of the week plan, three of the twelve. Measured on the frozen tree (main at ea6e1ad08e), 27 November 2026. Nothing was fixed, shipped or written outside this folder.

**The question:** does every reading we print from each of these say what the source itself says, in the form the source's own marks ask for?

**The short answer.** The words are the sources' words. Every one of the 139,204 served rows of the three sources is in its source (all but 29 byte for byte; the 29 are named below), and the pieces under 304,463 of the 304,484 words that carry STEP's pieces are TAHOT's translation column part for part: gloss, order, brackets, spacing. What is not the sources' own is what stands around the words: which readings the card offers at rest, whose name and year a reading carries, and a handful of places where a mark was taken off or printed as another source's mark.

## Summary table

| # | Source | Finding | Count | Class | Seen on the page |
|---|---|---|---|---|---|
| T1 | TAHOT | The page's signs rule (off by default) counts STEP's square bracket as a sign to switch off; STEP says bracketed words «are best included in a translation» | 20,048 of 91,301 served rows not offered at rest (19,193 for the square bracket alone); 3 lines lose a bracketed word | overrides | yes, 19 cards |
| B1 | TBESH | Most of TBESH's glosses stand on the card under another dictionary's name, because the store keeps one row for the same words under one source | 6,688 of 9,804 glosses (6,540 under a source open at rest, 148 only under a source that rests shut) | overrides (credit) | yes, 40 cards: TBESH named on none; no pill at all on 7 |
| M1 | MACULA | The same fold: MACULA's English under another name | 6,796 of 51,985 pairs (251 only under a shut source) | overrides (credit) | by machine |
| T2 | TAHOT | The same fold: STEP's rendering under another name | 5,580 of 76,234 whole-word renderings (85 only under a shut source) | overrides (credit) | by machine |
| M3 | MACULA | A rendering MACULA gives at one place stands on every card of the form | 30,062 served rows are one-place renderings; 4,397 of them of forms that stand at 50 places or more | candidate «applied badly» (the place is held, not used) | yes, 1 card |
| M2 | MACULA | A reading that holds « ~ » is not offered at rest; the source gives no account of the sign | 1,862 of 45,095 served rows; 2 more rows caught by Strong's pattern «X » | fired on a mark no one declared for this source | yes, 13 cards |
| T5 | TAHOT | STEP's tag for the word is not carried where our text spells the word otherwise | 1,091 words (136 of them with no entry at all for the gate) | the source's binding held and not used | by machine |
| Y | all three | A row carries a year that is not its source's, and the card prints it: «STEP … · wording 1890» | 587 rows: TAHOT 167, TBESH 236, MACULA 184 | overrides (year) | yes, 14 cards |
| B5 | TBESH | TBESH's row for the very tag STEP gives a place is withheld as «given as a name», where the place is not on the list of name places | 576 places by machine (285 are «Hosts») | overrides (verified on 1 card, suspected for 575) | yes, 1 card |
| T6 | TAHOT | The sign rule is uneven: a piece of two bracketed signs prints; a sign-only word prints or does not by its maqaf; the lone «!» prints where the lone «¿» hides | 336 places; 598 against 6,593 lines; 708 lines | fired unevenly | yes |
| T3 | TAHOT | At the Aramaic ending TAHOT writes its English against its own order; the pieces follow it, so the noun's letters carry «<the>» and the ending carries the noun | 140 places; at 62 of them STEP's own noun is withheld from the root's readings (23 rows carry the ending's tag) | the source against its own rule; the 23 rows are ours | yes, 5 cards |
| B2 | TBESH | A slash that means «or» prints as the joiner « + », which is TAHOT's sign | 7 rows, 19 places at least | fired with nothing to decide | yes, 3 cards |
| T4 | TAHOT | STEP's brackets are taken off at read forms of several words | 13 of the 28 places | overrides | yes, 3 cards |
| B4 | TBESH | Grave accents print as written; neither the source nor the ledger says what they are | 14 rows | a mark with no explanation | yes, 3 cards |
| T7 | TAHOT | The source's own slips print as written | 5 places found | not ours | yes, 4 cards |
| C | all three | Credit as the source asks: MACULA's required wording and link are not on the card; STEP asks for a link to www.STEPBible.org; the record of dictionary kinds says MACULA has no self-description | 3 sources | credit | yes |

Classes are the principle's: **overrides** a source's own answer; **fired with nothing to decide**; **reconciles** a real conflict (none found here).

---

## 1. STEP's TAHOT

### 1.1 Its bytes

Four tab-separated files of STEPBible-Data at commit b86d26cdb1f51729e73b5b4eb7f7ccadc5dfba39, folder «Translators Amalgamated OT+NT», fetched from the public repository; their sha256 are the ones the corpus lane's receipts name (`data/spelling-bridge/bridge-v1.2/receipt-v1.2.json`, inputs):

- TAHOT Gen-Deu e9b8546e…, Jos-Est 195fee1d…, Job-Sng 84e118a9…, Isa-Mal f3ded203….
- 305,652 word rows. Each row: reference «Eng (Heb) Ref & Type» (`Gen.31.55(32.1)#01=L`: English verse, Hebrew verse where it differs, word number, text type), Hebrew, Transliteration, Translation, dStrongs, Grammar, Meaning Variants, Spelling Variants, Root dStrong+Instance, Alternative Strongs+Instance, Conjoin word, Expanded Strong tags.
- A row is keyed by its reference. Text types: L 303,861, Q(K) 1,013, Q(k) 310, X 152 (words added from the Greek), R 27 (restored), the rest variants.
- What it says of itself: «Translators Amalgamated Hebrew OT tagged with disambiguated Strongs extended for BDB including tags for prefixes & suffixes, with ETCBC morphology»; «This data is based on the exact Leningrad codex»; «Data created by www.STEPBible.org based on work at Tyndale House Cambridge (CC BY 4.0)». The license lines: «Download the data and reformat it for your application, without changing the data»; «(You MAY make changes yourself, but you should include a note of changes that can be viewed by those who use your new data)»; «Refer others to github.com/STEPBible as the source of the data». The repository's README: «Credit it to "STEP Bible" linked to www.STEPBible.org». No year is stated anywhere.
- Its own key to its marks (file head, FIELD DESCRIPTIONS):
  - «Forward slash ( / ) separates the translation to mirror the prefixes, root and suffixes in Hebrew. This means the order of English words follows the order within the Hebrew word.»
  - «Words in <angle brackets> are in the Hebrew but are best not included in a translation. Words in [square brackets] aren't in the Hebrew but are implied and are best included in a translation.»
  - «Lexical tags for each element of the Hebrew words, including prefixes and suffixes, with the Root in {curly brackets}. A "+" indicates the same tag also covers the next Hebrew word.»

### 1.2 The pieces (the line under 304,494 words), against TAHOT, by machine

Every word of the 39 books (305,431 entries that are not marks) was paired with TAHOT's row for the same place: by Hebrew verse and letters, then by chapter where the verses are numbered otherwise (Exodus 20, Deuteronomy 5), then in book order. 305,361 entries pair one to one; 55 stand on two TAHOT rows (names TAHOT writes as two words); 15 have no row (our text and the Leningrad text differ in words). TAHOT rows no word took: 152 X, 27 R, 23 others.

Of the 304,484 words whose pieces are all credited to TAHOT:

| Check | Equal | Not equal |
|---|---|---|
| pieces joined at the slash = the Translation column, byte for byte | 304,463 | 21 |
| each piece's letters = the Hebrew column part by part | 304,257 | 16 cut otherwise (read forms of several words), 208 + 4 where our text spells the word otherwise |
| grades (prefix, core, suffix) follow the root in curly brackets | 304,463 | 5 (words with two roots: both are core, as TAHOT writes) |
| the word's tag = the root tag | 304,260 | 5 (two roots; trailing spaces in the source) |

The 21: 4 differ by a trimmed space (spelling-bridge places), 8 by a dropped empty part between two read words (no text lost), 9 at read forms where words changed (finding T4; the list of all 13 is `data/read-form-places-brackets.tsv`).

The line as recorded at rest (`data/resting-lines/`), 304,494 lines credited `PIECE:TAHOT`: 297,879 are the Translation column as the page's own print rule gives it with the signs off; 6,593 are empty (finding T6); 7 lost brackets (T4); 3 drop the link part «-» of a maqaf inside a read form (no text lost); 12 stand at unpaired places.

The joiner: TAHOT's 162,877 slashes on these words print as 148,607 « + »; the 14,270 others stand beside a hidden sign, where the page's rule drops the joiner. So the « + » joins are TAHOT's slashes and no others.

The card's own lines «here STEP reads …» and «here MACULA reads …» (`data/default-picks/<book>.bin`): STEP's reading equals the Translation column at 305,356 places of 305,361 (5 carry none); see 3.4 for MACULA's.

Files: `pieces-differ-tahot.tsv.gz` (every word that is not in the clean classes, with its class), `line-vs-tahot.tsv.gz`, `pieces-counts.json`.

### 1.3 The rows (M4, 91,301), against TAHOT, by machine

| Class | Rows |
|---|---|
| a whole Translation column under the letters of its Hebrew column | 66,040 |
| a run of word parts cut at the slash, under the letters of those parts | 25,077 |
| a whole Translation column filed under our spelling of the word | 159 |
| the same but for white space closed up (Zephaniah 2:9 «and/ [the] rest ofK:», «and/ burned») | 2 |
| the Aramaic ending: the noun's English moved onto the noun's letters, carrying the ending's tag H9010 | 23 |

341 rows carry a print slot of «no pill» (the owner's rulings on B01 to B04). File: `rows-differ-stepbible_tahot_aligned_translation.tsv.gz` (the 25 rows).

### 1.4 Findings

**T1. The square bracket is switched off as a sign, against the source's own words. Class: overrides.**
- The source: «Words in [square brackets] aren't in the Hebrew but are implied and are best included in a translation.»
- The page: `zone.html` line 3684 lists the square bracket among the source signs (`SOURCE_SIGN = [STRONG_SIGN, /¿/, /<[^>]*>/, /\[[^\]]*\]/, / ~ /]`), line 3687 counts a bracketed piece as a sign alone, and line 12858 offers no pill whose text holds a sign while the signs switch is off, which is how the page opens (the owner, 3 October: «preselect it off for now»).
- Count, by the page's own patterns over every served row: 25,114 M4 rows are not offered at rest; 20,048 of them hold a square bracket and 19,193 hold nothing else (4,752 an angle bracket alone, 792 both, 377 the inverted question mark). On the line, 3 bracketed pieces are hidden: Genesis 40:6 word 7 («and/ [were]/ they» prints «and + they»), Isaiah 29:13 word 16 («[of]/ me» prints «me»), Daniel 2:26 word 8.
- On the page: of the sampled M4 rows that hold a bracket and are not the place's own line, 19 of 19 had no pill (Genesis 15:9 word 7 «[is] a goat», 2 Chronicles 2:13 word 32 «skillful [people]», Exodus 22:9 word 6 «donkey[s]»); each card says «N readings carrying a source's own sign switched off».
- The ledger's rulings B01 and B02 («a row that renders nothing a translator could print has no pill») also print no pill for rows that are a square bracket alone («[are]», «[of]»), which by the source's key are words a translator would print.
- Proposed mend, by rule: read each source's signs from its own ledger. For TAHOT the square bracket is no sign to switch off (it stays printed, as on the line); the angle bracket and «¿» stay. Take the square bracket out of `SOURCE_SIGN` and `signOnly` for rows and pieces of TAHOT, and let B01 keep its ruling only for rows of angle brackets alone.

**T2, B1, M1. The fold: a reading stands under one source's name. Class: overrides (credit).**
- The store keeps one row for the same words under one key and credits it to one source (`tools/apply-source-years-v1.mjs` line 30: «one row per key, text and source» is «road A's rebuild»; `data/source-years-v1/HELD.json`: «the fold stands a shared sense under one source's name»). The page lane knows the fold; these are its sizes for the three sources, measured against the sources' own bytes.
- TAHOT, 76,234 distinct whole-word renderings: 66,044 under its own name; 5,495 only under another source open at rest (MACULA 3,234, the SDBH 1,226, Strong's 1,079, BDB 728); 85 only under a source that rests shut; 3,290 not served under their key; 1,320 keys not in the store. (At its own place a rendering still stands as the piece.)
- Files: `fold-credit-<key>.tsv` for each source.
- Proposed mend: the rebuild the lane already names (one row per key, text and source); until then, a credits list per row.

**Y. A row carries another source's year, and the card prints it. Class: overrides (year).**
- `source-year-rule-v1`: «an older witness's year already on it stands». So a row of STEP's carries 1890 where Strong's has the same words.
- Count: M4 115 rows with 1890, 19 with 2023, 33 with 2026; M19 122, 68, 46; M3 184 with 1890.
- On the page: Deuteronomy 1:12 word 4, pill «a burden», title «1890 · STEP Bible Translators Amalgamated Hebrew OT aligned component translation», record «… · wording 1890 CC BY 4.0»; the same at Esther 5:14 word 11, Nehemiah 2:7 word 5, Proverbs 20:25 word 7. Deuteronomy 18:4 word 6: «MACULA … · wording 1890». Amos 7:10 word 11: «2023 · STEP Bible Translators Brief Lexicon».
- It also orders: a row dated 1890 enters the oldest tier of «oldest first».
- Proposed mend: the year slot of a row is its own source's year; the older witness is a second credit.

**T5. STEP's tag is not carried where our text spells the word otherwise. Class: the source's binding, held and not used.**
- At 1,091 words TAHOT's row for the place names a root tag and the word carries none: 671 carry only the entries of MACULA's lemma (`te`), 195 carry STEP's pieces by the spelling bridge and still no tag, 136 give the entry gate nothing. The bridge's rule says «No tag is written».
- The line at these words: 790 by an M4 row, 220 by STEP's pieces, 50 by MACULA's pieces, the rest by others.
- File: `places-step-tags-a-word-we-do-not-carry.tsv.gz`.
- Proposed mend: the spelling bridge, which already names the TAHOT row of each place, lays that row's root tag as the word's tag.

**T6. The sign rule is uneven. Class: fired unevenly.**
- A piece that is one bracketed sign is hidden (13,519 angle, 747 «¿»); a piece of two bracketed signs is printed at 336 places («<in> <the>/ it» prints «<in> <the> + it», Genesis 3:3 word 13), because `signOnly` matches one bracket group.
- A word whose every piece is a sign prints the sign where it stands free («<obj.>», 598 lines) and nothing where a maqaf ties it to the next word (6,593 lines: «<obj.>» 6,473, «<to>» 60, «<if>» 35, «<on>» 15, «<thus>» 9). Those 6,593 words have a line that is one zero-width space.
- The lone «¿» is hidden; the lone «!» (TAHOT's sign for the emphatic ending, tags H9012 and H9013) prints as « + !» on 708 lines («you should die + !»).
- Proposed mend: one rule for a piece made only of the source's signs, whatever their number; the owner to rule «!» with «¿»; and one answer for the sign-only word.

**T3. The Aramaic ending. Class: the source against its own rule; 23 rows ours.**
- TAHOT's key: the English follows the order within the Hebrew word. At 140 rows of the Aramaic ending (tag H9010) it does not: «אֱלָהָ/א» is «<the>/ God» (698 other rows keep the order: «king/ the»). File: `data/aramaic-ending-english-order.tsv`.
- The pieces follow TAHOT part for part, so the noun's letters read «<the>» and the letter א reads the noun. The line is right («God»). On the card, Daniel 2:8 word 9: pressed on א, the pill «time» stands pressed and credited to STEP's pieces; pressed on the root, STEP's piece is «<the>».
- The store moved the noun's English onto the noun's letters, and 23 of those rows carry `n: ["H9010"]`, the ending's tag. At 62 of the 140 places the only row for STEP's noun is such a row (or its Hebrew twin's number) and is withheld as another entry: Daniel 2:20 word 10, root עלמ, tag H5957: the card offers «ancient» and «forever» and not STEP's «antiquity»; Daniel 2:20 word 15: «might» and «power» (MACULA's), not STEP's.
- Proposed mend, by rule: where a part tagged H9010 holds the noun's English and an earlier part holds the article sign, the two English parts change places (the corpus lane's audit already lists the 140 rows); the 23 rows take the root's tag.

**T4. Brackets taken off at read forms. Class: overrides.**
- The corpus lane's read-words list (`data/read-words/read-words-v1.1/read-word-tags-v1.1.jsonl`, field `english_tahot`) gives TAHOT's English without its brackets, and `tools/apply-read-words-v1.mjs` lays it.
- 13 of the 28 places: Exodus 4:2 word 4 («what/ /[is] this?» prints «what + is this?»), 2 Samuel 5:2, 8:3, 21:12 word 22 («there/ <towards>» prints «there + towards»: a word STEP marks as best left out prints as plain), 2 Kings 18:27, Isaiah 3:15, 36:12, Jeremiah 14:14, Ezekiel 8:6, 42:9, Psalms 10:10, Nehemiah 2:13, 1 Chronicles 27:12.
- Proposed mend: the list carries each part as STEP writes it, brackets kept, as bridge v1.1 does.

**T7. The source's own slips, printed as written. Not ours.**
- Zephaniah 2:9 word 26: «and + [the] rest ofK:». Ezekiel 36:23 word 5: «that + has been] profaned». Isaiah 7:23 word 15: «and + <into> the> + bush[es]». Leviticus 11:40 word 1: «and + [who + [-ever] eats». Psalms 123:4 word 8: «opressors».
- Proposed: send them to STEP (the file asks for corrections); no hand edit.

### 1.5 How TAHOT binds a reading to a place, and what we use

| What the source gives | Used? |
|---|---|
| the reference (verse and word number) | used: the pieces and the line are the place's own |
| the Hebrew column with its slashes (the division of the word) | used: 304,257 words part for part |
| the root in curly brackets, the dStrong with its letter | used: the word's tag, the entry gate with STEP's letters; **not carried at 1,091 words (T5)** |
| the «+» on a tag (the next word is the same entry) | held: both words carry the tag (785 rows); the card opened on a pair shows both halves |
| the Grammar column | held for stems; not read here |
| Meaning Variants, Alternative Strongs | used: the card's «here STEP reads … · 2 «…»» |
| the text type (Q, K, X, R) | used: the line follows the Qere, as STEP does |
| the place of a rendering, for the rows (M4) | **not used for pills**: a rendering of one place is offered at every place of the same letters and entry |

### 1.6 On the page: 128 cards in 39 books

`cards-stepbible_tahot_aligned_translation.tsv`.
- Pieces, 68 cards over 22 mark classes: 53 say what the source says; 5 belong to another word part (T3); 3 changed the sense (T4); 7 unreadable (T7).
- Rows, 60 cards over 15 classes: every pill shown says what the source says; 19 rows not offered at rest (T1); 6 carry a year not STEP's (Y); 3 no pill by ruling.
- Credit on the card: «STEP Bible Translators Amalgamated Hebrew OT aligned component translation», «CC BY 4.0» (right), «License terms» linked to the README at the pinned commit. The label is this project's. STEP's README asks «Credit it to "STEP Bible" linked to www.STEPBible.org»; that link is not on the card.

---

## 2. STEP's TBESH

### 2.1 Its bytes

One tab-separated file, «TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt», same commit, sha256 464dccad… (the receipts' value). 11,682 entry lines. Columns: eStrong#, dStrong (with its relation: «= a Part of», «= in Aramaic of»), uStrong, Hebrew, Transliteration, Morph, Gloss, Meaning. An entry is keyed by its dStrong. Of the Gloss: «These were created by Tyndale scholars». Of the Meaning: «They are for guidance only. Permission should be gained from Online Bible before these are applied in any project» (not served: clean). Of the numbers: «These Disambiguated Strong numbers differentiates distinct sub-meaning of words, and distinct indivuduals with the same name». The file head names no mark of the Gloss column.

### 2.2 The rows (M19, 2,808), by machine

2,805 are the Gloss of a line whose Hebrew column holds these letters (the column may hold two spellings with a comma; each is a headword); 3 the same with white space closed. 0 differ. Every row carries the numbers of its own lines. `rows-differ-stepbible_tbesh_gloss.tsv.gz` is empty but for its header.

### 2.3 Findings

**B1. Most of TBESH is on the card under another name. Class: overrides (credit).**
- 9,804 distinct pairs of letters and Gloss: 2,808 under TBESH's name; 6,540 only under another source open at rest (the SDBH 2,703, MACULA 1,819, BDB 1,752, Strong's 1,237, TAHOT 136); 148 only under a source that rests shut; 42 not under their key; 266 keys not in the store.
- On the page, 40 cards (`cards-stepbible_tbesh_gloss.tsv`, the sample «glosses with no row under TBESH's name»): the pill stood on 33 and TBESH was named on none (Daniel 7:21 word 6, «war»: «M17 M9 PIECE:MACULA PIECE:TAHOT»; Genesis 44:19 word 8, «father»: the SDBH and MACULA's piece). Of the 22 glosses filed only under a shut source, 7 had no pill at rest: Joel 4:13 word 10 «wine press» (with the shut dictionaries opened it appears, credited to Hebrew Wiktionary), 2 Kings 5:2 word 7 «maiden», 2 Samuel 20:10 word 16 «to repeat», Isaiah 30:6 word 7 «lion», 1 Kings 19:4 word 9 «broom», Daniel 8:5 word 5 «male goat», Jeremiah 51:27 word 18 «official».
- So TBESH's switch moves little, and another dictionary's switch takes TBESH's glosses with it.

**B5. TBESH's row for the place's own tag, withheld as a name. Class: overrides (verified on one card, suspected for the rest).**
- Joshua 12:7 word 18, הֶחָלָק, STEP's tag H2510, the line «Halak». TBESH's H2510 is «(Mount) Halak», Morph N:N--L. The card withholds it («5 given as a name by their source») and offers «flattery», «smooth», «flattering words». The word is not on the list of name places.
- By machine: 576 words whose STEP tag TBESH files as a name (Morph beginning N:) stand at places not marked as names: «Hosts» H6635B 285, «south» H5045H 68, «Red (Sea)» 24, «Shephelah» 20, «plain» 19. TAHOT's own Grammar column calls these common nouns, so two columns of STEP differ. File: `places-tbesh-name-tag-not-a-name-place.tsv.gz`.
- Proposed mend: a row of the place's own lettered tag stands whatever the names gate says of it (the entry gate's own rule: «a row of its own entry stands»).

**B2. A slash that means «or» prints as TAHOT's joiner. Class: fired with nothing to decide.**
- `printedForm` (`tools/gloss-store-v1.mjs` line 86) joins the sides of every slash with « + », for every source. The joiner is TAHOT's (parts of one Hebrew word).
- The ledger keeps 7 TBESH rows whole because their endings share a word. They print «to break up + open» (2 Chronicles 32:1 word 16), «to be + bear firstborn» (Deuteronomy 21:16 word 12), «to wall up + off» (Lamentations 3:7 word 1), and so «to cut down + off», «to pass on + over + away», «to draw (up + out)», «to gather + tend figs». 19 places at least.
- Proposed mend: the joiner prints only for sources whose ledger declares the slash as a join of word parts (TAHOT); elsewhere a kept slash prints as written.

**B4. Grave accents.** 14 served rows print «`second`», «`brother`», «`men`» (1 Chronicles 6:13 word 4, 7:34 word 3, Nehemiah 11:8). The ledger: «the source says nothing of the sign». A mark with a declared shape and no meaning; for the owner.

**Under T1's rule:** 6 TBESH rows with a square bracket («to make: [do]», «[Ben]jaminite», «Second [Quarter]») are not offered at rest. TAHOT's key does not bind TBESH, and TBESH has none, so a rule made for another file's sign fires here.

### 2.4 Marks

`marks-stepbible_tbesh_gloss.tsv`. The colon (590 in the source, 580 served): the owner ruled «divides» (a pill for the head, a pill for the sense). The sense is bound to a place by STEP's lettered tag, and the page uses it: Genesis 11:6 word 6, tag H8193K, prints «lip» and «language» and withholds the rows of other letters. That holds the source's own account of its numbers.

### 2.5 How TBESH binds a reading to a place

| What the source gives | Used? |
|---|---|
| the dStrong number and its letter | used: the entry gate, by number and by letter |
| the Hebrew column (several spellings) | used as the key |
| the relation («a Part of», «in Aramaic of») and the uStrong | used in part (relay v211 widens the letters by TBESH's columns); not read here |
| the Morph column (a name) | used to mark the row a name; **at 576 places it meets a place not marked a name (B5)** |
| the Meaning column | not served, as the source asks |

### 2.6 On the page: 105 cards in 32 books

65 rows over 14 mark classes: 52 say what the source says (colon and slash rows as the owner ruled); 3 changed the sense (B2); 3 not offered at rest; 4 carry a year not TBESH's; 2 no pill by ruling; 1 withheld from its own entry (B5). 40 glosses with no row of their own: see B1.
Credit on the card: «STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column», «CC BY 4.0» (right), terms linked to the README. No year stated by the source; the card prints «no source year» except on the 236 rows of finding Y.

---

## 3. MACULA

### 3.1 Its bytes

`WLC/tsv/macula-hebrew.tsv` of Clear-Bible/macula-hebrew at commit 47db250bd55d, 84,382,719 bytes, sha256 965cb059… (the value `data/names/names-v2/receipt-v2.json` names). 475,911 rows, one per morph, 32 columns: xml:id, ref (`GEN 1:1!1`), class, text, transliteration, after, strongnumberx, stronglemma, sensenumber, greek, greekstrong, gloss, english, mandarin, stem, morph, lang, lemma, pos, person, gender, number, state, type, lexdomain, contextualdomain, coredomain, sdbh, extends, frame, subjref, participantref. A row is keyed by its xml:id. We serve the `english` column under the letters of `text`.

What it says of itself (the repository's README.md, LICENSE.md, sources/Cherith/README.md, read for this pass):
- «MACULA Hebrew Linguistic Datasets © 2022-2024 by Biblica, Inc is licensed under CC BY 4.0»; «English and Mandarin glosses taken from Cherith's glosses»; «Cherith Glosses for the Hebrew Old Testament, by Andi Wu, Copyright (C) 2022 by Cherith Analytics».
- The attribution the license requires: «You must attribute the work as follows: "MACULA Hebrew Linguistic Datasets, available at https://github.com/Clear-Bible/macula-hebrew/"».
- Of the glosses: «glosses that show the meaning of each word in the whole WLC … in its specific context … compiled by consutling all the major translations in English and Chinese and selecting the most common term in each case. It is therefore a "majority gloss" where alternative meanings are not included.»
- No page read names the tilde, the round brackets or the letter X.

### 3.2 The rows (M3, 45,095), by machine

45,094 are the `english` cell of a row whose `text` has these letters; 1 the same with a double space closed. 0 differ. 45,092 carry the number of their cited row. `rows-differ-macula_hebrew_cherith_surface_english_2022.tsv.gz` is empty but for its header.

### 3.3 Findings

**M3. A rendering of one place on every card of the form. Class: candidate «applied badly».**
- MACULA binds each English to one place (its xml:id) and says the gloss shows the word «in its specific context». The page uses the place for the line and for «here MACULA reads»; the pills are every rendering of the same letters and number.
- Of the 45,095 served rows, 30,062 are given at one place only, and 4,397 of those are of forms that stand at 50 places or more: בני «colt» (the form stands 2,579 times), אם «don't» (1,067), נפש «being» (703).
- On the page: Micah 3:3 word 12, כַּאֲשֶׁר «just as», offers MACULA's «(happy)», which is its English for the relative word at Psalm 10:6 and nowhere else.
- The same is true of TAHOT's rows, which are renderings at places (not counted here).
- Proposed, for the owner: where a source binds a rendering to places, the card may hold a one-place rendering of another place back a press away, as it does a sign; the lattice already knows the places.

**M2. The tilde is switched off as a sign with no account from the source. Class: fired on a mark no one declared for this source.**
- The page's fifth sign pattern, `/ ~ /`, withholds 1,862 M3 rows at rest («bring ~ back», «provoke ~ toanger»); 13 of 13 sampled had no pill. A tilde glued to a word is no match and prints bare: «~south» (Daniel 11:25 word 6), «apart~», «~days».
- Strong's pattern («X » at the head) matches 2 MACULA rows, «X and» and «X also»: they sort last and are not offered at rest. The pattern was declared for Strong's mark.
- Proposed mend: sign patterns per source, from each ledger; MACULA's ledger declares the tilde as a gap in one phrase, and the owner rules whether such a phrase rests shut.

**M1 and Y:** see T2 and Y above. 51,985 pairs: 45,096 under MACULA's name, 6,545 only under another open source (the SDBH 3,340, Strong's 2,685 and 257, BDB 2,030), 251 only under a shut one. 184 rows print «wording 1890».

**C. Credit as the source asks.**
- The card: «MACULA exact Hebrew morph surfaces with Cherith English definitions · wording 2022 CC BY 4.0», one link, to the Creative Commons deed. The license, the year and the holder of the English are right. The wording the license requires and the link to the repository are not on the card.
- `data/dictionary-kinds-v1.json` says of MACULA «No self-description in any record read». The source describes itself in the three pages quoted above; the record can quote them.

### 3.4 MACULA at its own places, by machine

- The 55 lines MACULA leads (53 by its pieces, 2 by a row): 54 are its `english` cells at that word; 1 could not be paired singly (Judges 20:13, a word read and not written). File: `data/macula-led-lines.tsv`.
- The card's «here MACULA reads»: equal to its `english` cells joined by a space at 296,030 places; 8,921 where neither gives English; 12 differences and 466 unpaired, all where the two texts number verses otherwise (my pairing, not the page). File: `default-picks-vs-sources.tsv.gz`.

### 3.5 How MACULA binds a reading to a place

| What the source gives | Used? |
|---|---|
| xml:id and ref (the place) | used for the line and the pick; **not for the pills (M3)** |
| the morph division (one row a morph) | used: its pieces where it leads; shown beside STEP's |
| strongnumberx | used: the row's number, the entry gate (without STEP's letter) |
| lemma | used: the entry where STEP gives no tag (`te`) |
| class, type (a proper noun) | used: the names lists |
| sensenumber, sdbh, domains | held; not read (the default picks' rule says why for sdbh) |
| gloss (the second English column) | not served |

### 3.6 On the page: 63 cards in 34 books

51 rows over 12 classes, 10 lines MACULA leads, 2 places for the two rulings. 62 say what the source says; 1 belongs to another place (M3); 13 not offered at rest (M2); 4 carry a year not MACULA's. The owner's three rulings hold on the page: «thumbs/big toes of» prints «thumbs» and «big toes of» (Judges 1:7 word 6); «Ben (1128)» prints «Ben»; the sums of numbers print no pill.

---

## What I checked and found clean

- **Bytes.** The five STEP files and the MACULA file fetched for this pass have the sha256 the corpus lane's receipts name.
- **TAHOT's pieces.** 304,463 of 304,484 words byte for byte; letters part for part at 304,257; grades at 304,463; tag at 304,260.
- **The line.** 297,879 of 304,494 lines are the Translation column under the page's own print rule; the joiner stands exactly at TAHOT's slashes.
- **Rows.** 91,276 of 91,301 M4 rows, 2,808 of 2,808 M19 rows and 45,095 of 45,095 M3 rows are their source's bytes (white space aside on 6).
- **The picks.** «here STEP reads» at 305,356 places and «here MACULA reads» at 296,030 are the sources' own at the place.
- **Marks.** Every mark in the served rows of the three sources has a declared shape in its ledger; none is undeclared. The marks that occur only in the sources (TBESH's «[¶]» and «&», MACULA's «1,000») are not served. Tables: `marks-<key>.tsv`.
- **The owner's rulings** on the three ledgers print as ruled: 341 TAHOT rows and 6 TBESH rows with no pill, the colon and slash cuts of TBESH, MACULA's three.
- **TBESH's Meaning column**, which asks for permission, is not served.
- **STEP's letters.** The entry gate uses the dStrong letter to choose TBESH's sense row at a place.
- **The «+» tag.** Both words of a name TAHOT writes as two carry the tag; the halves on the line are TAHOT's own.
- **Licenses.** CC BY 4.0 on all three cards, as each source states.

## What I could not check, and why

- **The signs switch in its other positions** («printed», «below»): every card was read as a first visit, signs off. Whether «printed» brings back each of the 25,114 rows was not read.
- **Whole-word rows on the card.** The card opens on the finest division and the root; the 66,040 whole-word M4 rows show under the whole-word division, which I pressed on no card.
- **The span store's records** (198 of TBESH's, and TAHOT's pairs): not audited against the sources.
- **MACULA's gloss folder** (`sources/Cherith/glosses`): not fetched, so whether Cherith explains the tilde there is open.
- **Whether a note of our changes to STEP's data is published**, as its license asks for changed data (the 13 places of T4, the 23 moved rows of T3): I did not read the site's notes pages.
- **The names gate and the 124 words another source leads** belong to other passes. Seen in passing and left to them: 2 Samuel 7:22 word 5 אֱלֹהִים reads «judges» (Strong's); 2 Samuel 15:21 word 12, a written word not read, reads «mother»; Psalms 68:27 word 4 אֲדֹנָי reads «Yahweh» from an M4 row.
- **B5 beyond one card:** the 576 places are a machine count of the condition, not of the card's verdict.
- **One-place renderings of TAHOT's rows** (the twin of M3) were not counted.
- **Card states:** the 296 sampled cards were read at rest; only 3 places were read again with the shut dictionaries opened.

## Files in this folder

- Rows against the sources: `rows-differ-stepbible_tahot_aligned_translation.tsv.gz`, `rows-differ-stepbible_tbesh_gloss.tsv.gz`, `rows-differ-macula_hebrew_cherith_surface_english_2022.tsv.gz`; every row's verdict in `data/m4-row-verdicts.jsonl.gz`, `data/m19-row-verdicts.jsonl`, `data/m3-row-verdicts.jsonl.gz`.
- Pieces and lines: `pieces-differ-tahot.tsv.gz`, `line-vs-tahot.tsv.gz`, `pieces-counts.json`, `data/aramaic-ending-english-order.tsv`, `data/read-form-places-brackets.tsv`, `data/tahot-plus-tag-places.tsv`, `data/macula-led-lines.tsv`, `default-picks-vs-sources.tsv.gz`; the pairing of every word with its TAHOT row in `data/aligned.jsonl.gz`.
- Marks: `marks-stepbible_tahot_aligned_translation.tsv`, `marks-stepbible_tbesh_gloss.tsv`, `marks-macula_hebrew_cherith_surface_english_2022.tsv`; raw counts in `data/marks-census.json`.
- Cards: `cards-stepbible_tahot_aligned_translation.tsv` (128), `cards-stepbible_tbesh_gloss.tsv` (105), `cards-macula_hebrew_cherith_surface_english_2022.tsv` (63); what the page showed in `data/cards-all.json`, `data/cards-fold.json`, `data/cards-last-rest.json`, `data/cards-last-open.json`, `data/cards-test.json`, `data/cards-test2.json`.
- The fold: `fold-credit-stepbible_tahot_aligned_translation.tsv`, `fold-credit-stepbible_tbesh_gloss.tsv`, `fold-credit-macula_hebrew_cherith_surface_english_2022.tsv`.
- Places: `places-step-tags-a-word-we-do-not-carry.tsv.gz` (T5), `places-tbesh-name-tag-not-a-name-place.tsv.gz` (B5).
- `scripts/`, `logs/`, and `sources.tsv` (where each source file was fetched from, its size and sha256; the four TAHOT files and the MACULA table were deleted after the pass, and the derived files are kept compressed).
