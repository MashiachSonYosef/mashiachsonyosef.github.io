# An outside reader's findings, checked (12 November 2026)

Between 11 and 12 November the owner had an outside reader go through the live site: Genesis 1 word by word, the verb cards of the chapter pill by pill, and the chain book of Obadiah against the page and the export. The owner sent five messages with the reader's reports and two questions of the owner's own. The machine this lane works on was restarted several times in those two days, and none of the five was answered until the evening of the 12th.

This note sets each finding beside the served data. The reader's reports are in `the-readers-reports/` as they were pasted. The probes, logs and dumps named are beside this file. Nothing here re-judges the reader's own reading of the Hebrew.

## 1. What is asked, and the short answers

| The finding | Real? | Whose |
|---|---|---|
| Monday to Thursday on the four joined days (Genesis 1:8, 13, 19, 23) | yes | the owner's ruling; the rule is the page's |
| The plain list under each chapter reads other words than the reader above it | yes | the page lane's; mended (section 7) |
| "[which] bears seed" for the hif'il and for the qal | no | STEP's own words at both places |
| The create card offers "cut down" and "make (fat)" | yes | mostly the corpus lane's; one hole is the page's |
| The stem is not named on the card | yes | the page lane's, small |
| "from +" and then nothing at 1:7; `<obj.>` printed once in 26 | not a fault | the owner's ruling on source signs |
| Did we record where Strong says he is guessing | no | the corpus lane's to declare, the page's to print |
| The chain book of Obadiah is not the card, link for link | yes | the page lane's; mended (section 8) |
| Fewer than half the pills on the verb cards are right for the word in its stem | the count stands | section 6 |

## 2. Monday to Thursday

`tools/probes/span-key.mjs`, `tools/probes/span-places.mjs` (`logs/a1-span-places.log`, `dumps/span-places.tsv`, `dumps/span-keys-by-places.tsv`).

- At Genesis 1:8 the corpus lane's span store (v2.1, 23 October) joins words 9 and 10 under the key of their letters. Its first row is English Wiktionary's entry for the modern weekday (`Monday`, a NAME row); its second is NorthEuraLex's (`MONDAY`). The place's own source reads "a day" and "second".
- The page's rule (zone.html, "THE SPAN STORE'S LINE (I2)") gives a joined run the span store's first row as its line. The check that a place's own reading outranks a whole-form reading stands one branch lower and is never reached where the span store has a row.
- **How far it reaches.** The span store joins words at 2,845 places in 39 books, under 462 keys. At 2,835 of them every joined word has its own place reading, and the span store's row leads over it. (My first count, 2,769, was wrong: the probe counted a verse's words with its scribal marks, and the store counts them without; where a bar or a section mark stood earlier in the verse it read the wrong words. The owner was told 2,769 and then the correction.) The leading row is English Wiktionary's at 1,248 places, Wikidata's at 710, the SDBH's at 428, STEP's Brief Lexicon's at 234.
- **The join is by bare letters.** `tools/probes/span-pointing.mjs` (`logs/a4-span-pointing.log`, `dumps/span-pointing.tsv`) sets the leading row's own pointed headword beside the words as the text points them, word by word, with the pointing grade's own function: the same at 1,787 places, no pointed headword at 230, pointed otherwise at 828. Some of the 828 are another word: "son of David" at Ecclesiastes 1:1, Proverbs 1:1 and twice in 2 Samuel 13:1 reads «A (male) cousin.», the modern word on the same letters; "with Israel" reads «the Jewish people; Jewry» at 14 places. Most are the same words spelled another way (the Name with a holam, 243; a headword with its prefix set apart; a construct before a maqaf), so the grade as it stands cannot be the gate. That is the corpus lane's to declare (`../FOR-MOSES-2026-11-12-an-outside-readers-findings-the-corpus-lanes-share.md`, ask 1).
- **What leads now**, most places first: «the Jewish people» for the sons of Israel (529 places, with and without the maqaf; the place reads "[the] people of" + "Israel"), «Epithet of the God of Israel: the Lord of Hosts» (243), «therefore» (154), «human, common name of Homo sapiens, unique extant species of the genus Homo» for son of man (99; the place reads "O son of" + "humankind"), «feminine of …» as a reading of the number twelve (29), «housewares» for the vessels of the house (12), «the Jewish people; Jewry» at 14 places where the place reads "with" + "Israel" (the key is the bare letters, so the preposition joins as the noun does), «Ben-Hur» where the place reads "[the] son of" + "Hur" (7), «then and there, immediately, on the spot» for "on the place" (7).
- Where it is right, it is a name the place's source divides: «Bethel» for "Beth-" + "-el" (45), «Bethlehem» (26), «Ben-Hadad» (21).
- **Said before.** 16 October's status, to the owner: "Genesis 1:8 reads Monday on the line, the store's first row (Wiktionary's NAME row); the lane's order decides." Nothing followed. Exodus 1:1's «the Jewish people» has been the owner's open call since.
- **The call.** On a joined run, does the place's own reading lead where every word has one, as it leads on a single word, with the dictionary's phrase kept on the card? The page lane recommends yes. It moves the line at those 2,835 places; at the other 10 a joined word has no place reading and the span store's row stays.

## 3. The readings under the words

`tools/probes/signs-off-places.mjs` (`logs/a2-signs-off-genesis-1.log`, `logs/a3-signs-off-every-book.log`), `tools/probes/verse-words.mjs`.

- Genesis 1 has 434 words and every one has a place reading on every piece. The reader's "405 word for word, 29 with a bracketed piece left blank" is exact: at 29 words a piece that is a source sign and nothing else is left undrawn beside a piece that prints.
- That is the owner's ruling, not a fault: signs rest off (3 October, "preselect it off for now"), and a hidden sign keeps its place as a gap (16 October, "leave it like that: and + + well-being, rather than leave stuff out"). The source's bytes stand whole on the card and in every export.
- `<obj.>` prints once in the chapter (1:1, word 4) because there it is the source's whole reading for a word standing alone, and a sign that is the whole reading stands. At the other 25 places the object marker is joined to the next word or carries a prefix or a suffix, another piece carries the reading, and the sign is the gap.
- "from +" and then nothing (1:7, word 14): TAHOT's pieces are `[were] from` and `<above>`. `<above>` is a sign-only piece by the rule, so it is the gap. Over every served book 14,191 words have a sign-only piece undrawn; at 4,066 the undrawn piece is the word's own core, and 3,844 of those are `<obj.>`. `<above>` is undrawn at this one place in the library.
- "[which] bears seed" at 1:11, 1:12 (hif'il) and 1:29 (qal) is TAHOT's reading at each place, byte for byte. The reader says so too ("STEP's wording, not yours").

## 4. The create card, and the stem

`tools/probes/card-pills.mjs` (`dumps/cards-genesis-1-verbs.json`, `shots/genesis-1-1-2.png`).

- The card at Genesis 1:1, word 2, holds 79 pills, the reader's 79 in the reader's order. It says "33 of 136 pointed otherwise, withheld · 6 of another stem, withheld".
- The six withheld are rows whose own source says another stem: BDB's "cut down" and "cut out" (piel), "be created" (niphal), "to make yourself fat" (hiphil), and TAHOT's and MACULA's readings at piel places.
- "cut down" still stands on the card, credited to Strong's two editions, whose rows say no stem. The gate is asked row by row: a row whose stem no source says stays. So a reading BDB files under the piel is withheld from BDB and kept from Strong's. This is the one hole that is the page's: the reading's stem is said, by another source. In the fourteen cards read it is the only pill of its kind.
- "make (fat)", "dispatch", "select", "feed", "choose" are Strong's renderings, listed together for every stem, with no stem said by any source for those words.
- The stem is not named on the card. The page knows it (the lattice sidecar's stems for the pointed form, from TAHOT and MACULA: qal here) and uses it for the gate without saying it.

## 5. Where Strong says he is guessing

`tools/probes/dictionary-key.mjs`, `tools/probes/strong-hedges.mjs` (`logs/b1-strong-hedges.log`, `dumps/strong-hedges-m9.tsv`).

- **Kept.** The served dictionary store holds each entry of the Open Scriptures edition whole, the provider's XML, clause by clause. The object marker's entry (H853) reads, in its clause of where the word comes from, "apparent contracted from 226 in the demonstrative sense of entity" (the provider's own spelling of Strong's abbreviation). The Hebrew Wikisource edition's definition text opens with the same clause.
- **Not recorded.** No record, flag or ledger marks a hedge as a hedge.
- **Not shown, for one edition.** The card prints a row's definition text. For the Open Scriptures edition that is the meaning alone; the clause of where the word comes from stays in the dictionary store and is printed nowhere. For the Wikisource edition the clause is in the definition text and prints with it.
- **How many.** Of the 8,543 entries served, Strong hedges where the word comes from in 830 (probably 410, apparently 153, uncertain 147, perhaps 131, unknown 6, doubtful 5, apparent 3, possibly 2, supposed 2, obscure 1) and in what it means in 177 (probably 90, perhaps 61, apparently 16, unknown 10). 962 entries hedge in one or the other. The words counted are listed in the probe, as whole words.
- **To record it:** a declared ledger from the corpus lane, one line per entry and clause, the hedge as the source's own bytes; then the page can say on the card, beside a reading of his, that he marks the derivation as uncertain, in his words.

## 6. The verb cards, pill by pill

`tools/probes/verb-cards-asks.mjs`, `tools/probes/verb-cards-cross.py` (`logs/d1-genesis-1-verb-cards.log`, `logs/d2-verb-cards-cross.log`, `dumps/verb-cards-cross.tsv`).

The reader's fourteen cards hold 291 pills on the served build, card for card, in the reader's order (four pills differ only in how the page prints a form-of note). The reader's calls: 132 right, 75 another word, 55 the same entry in another stem, 13 a broken piece, 9 one pill bundling stems, 7 unsure. Set beside what each pill stands on:

| Who carries the pill | right | another stem | another word | broken | bundled | unsure |
|---|---|---|---|---|---|---|
| Strong's (two editions) | 45 | 38 | 24 | 2 | 9 | 3 |
| the modern and many-language sources | 29 | 1 | 31 | | | |
| TAHOT and MACULA, read at their places | 41 | | 3 | | | |
| the SDBH and the UBS dictionary | 10 | 7 | | 6 | | 2 |
| the dictionaries beside the store (Jastrow) | | 5 | 12 | | | 2 |
| BDB (two editions) | 2 | 1 | 3 | 4 | | |
| other lexicons of Biblical Hebrew | 5 | 3 | 2 | 1 | | |

- **Another stem (55).** 54 have no stem said by any source for the reading. The gate withheld everything a declaration lets it withhold, but for the one hole of section 4.
- **Another word (75).** 71 have no stem said; 42 stand on rows headed by bare letters only, which the pointing filter reads as silence, not contradiction (Peru under "be fruitful").
- **What the card is.** It holds every reading a source gives for these letters as pointed here. It removes only what a source's own declaration lets it remove: a row headed by another pointing, a row whose source says another stem. It was not built to hold only what is right for this word at this place, and the reader's count measures how far it is from that.
- **What would bring it down to the word.** Each row tied to the dictionary entry it belongs to, and each place to its entry (TAHOT gives one at every place), so that a row of another entry is withheld and counted as a row of another stem is. That is the corpus lane's to declare. It is the same thing the letter of 10 November asks from the other side (`../../2026-11-10/FOR-MOSES-2026-11-10-the-pointing-filter-withholds-a-words-own-entry.md`): there the filter withholds a word's own entry, here it keeps another word's.
- **Stems for more sources.** The SDBH, the UBS dictionary and Jastrow head their senses by stem; the binyan ledger covers BDB, TAHOT and MACULA. 12 of the 55 are theirs.

## 7. The plain list under a chapter

**The fault.** Every chapter has an address of its own, and under the reader each carries a plain list of the chapter's readings, for a search engine and for a reader with no script (the door calls it the porch). The door built it from the zone's baked table, oldest witness first. Until 6 November that was also what the reader drew. That day the resting line became the reading of the place's own source, then the pointing's leader, and the list went on printing the table.

**Proven on the live build.** `tools/probes/list-vs-line.mjs` reads the list off a chapter's own address and the lines the reader draws on the same page (`logs/f1-list-vs-line-genesis-1-the-live-build.log`). Genesis 1: the list holds 434 readings and the reader draws 430 lines; the same reading stands in the same place at 205; in none of the 31 verses is the list the line throughout. Verse 1 in the list: "in + beginning · create · judges · sign · the + heavens · and + <obj.> · the + earth". On the line: "in + beginning · he created · God · <obj.> · the + heavens · and + (a gap) · the + earth". Verse 8's "and he called" was, in the list, a line about the third book of the Old Testament.

**Why the check passed.** `check-chapter-pages-v2` P3 held the list to the zone's baked table, which is what the door printed, and in a browser asked that three of one verse's readings be found somewhere on that verse's lines. It held the page to its builder's rule, not to the reader.

**The mend: the list is a recording.** A second copy of the page's rule in a builder would drift from the first, and two copies drifting is the fault. So there is no second copy.

- `tools/edits/37-every-section-built-on-request.mjs`: the page offers its own section builder (`window.__materialise`), the function the whole work's export already uses, so a tool can have every section built with nothing scrolled.
- `tools/new/resting-lines-v1.mjs`: the one reading of "a line": under a section's Hebrew, every reading element that is drawn and stands in no other, in the page's order; under a word standing alone, its line; under words one card joins, the run's one line, or each word's part where the run reads word by word; the text with the license chip taken off, as the page's export reads it; the credit what the chip itself names.
- `tools/new/bake-resting-lines-v1.mjs`: opens each served work as a first visit opens it, reads the lines it drew, and keeps one record per work in `data/resting-lines/`. A record names the page it was read off and every file that page asked for, each by its sha256.
- `tools/edits/38-the-plain-list-is-the-readers-own-lines.mjs`: the door prints the record line by line and refuses a record that names another page or a file that has moved (`chapter-page-rule-v3`).
- `tools/edits/39-the-round-reads-the-lines-before-the-door.mjs`: the round reads the lines before it builds the door.

**What was read** (`logs/e1-bake-resting-lines-every-work.log`): 40 works, 453,713 words, 400,242 lines. The 39 books: 305,431 words, 302,959 lines, 2,177 of them one line over more than one word, 247 words under no line. The Tikkunei Zohar, in progress: 148,282 words, 97,283 lines. Two of its lines ("middle", twice) are carried by two sources of one label, so the chip names no one source; they are credited by the label in the chip's own words.

**The same page, the new build** (`logs/f1-list-vs-line-genesis-1-the-new-build.log`): 430 of 430 the same, 31 of 31 verses.

**The door refuses** (`tools/probes/door-refuses-stale-lines.sh`, `logs/f3-door-refuses-stale-lines.log`): with `zone.html` one byte longer than when the lines were read, with one data file one byte longer, and with one work's record taken away, the door exits 1 and says which; with everything back it builds.

**The check.** `tools/new/check-chapter-pages-v3.mjs` replaces v2 (`logs/f2-check-chapter-pages-v3.log`): the list is the record on every chapter page (398,550 readings on 1,224 pages, text and credit); the record is of this tree (1,290 file fingerprints taken again); and in a browser, on one chapter of every book, at the chapter's own address, the list is the line (1,007 verses, 13,489 lines), the line is the record, and the browser's own rendering of those lines holds the same characters.

**Read again** (`logs/f4-bake-verify-every-work-read-again.log`): `bake-resting-lines-v1.mjs --verify` opens every work a second time and sets what it reads beside the record kept: 40 records the same, 0 not.

**The check goes red** (`tools/probes/check-goes-red.sh`, `logs/f5-check-goes-red-two-ways.log`), two ways, each undone byte for byte afterwards.

- One reading changed by hand in the list of genesis/1, the record and the reader untouched: P3 fails and names it ("reading 1 is "in + the beginning" in the list and "in + beginning" on the line").
- One reading changed by hand in Obadiah's kept record, and the door built again from it. The door cannot refuse this, since the record still names the page and the files as they stand, and it builds. The check fails at L1 and L2, where the page is read again: the list's "[the] vision of (changed by hand)" is not the line the reader draws.

**The suite and the gate** (`logs/g1-suite-the-plain-list-tree.log`, `logs/g2-gate.log`): 145 of 146, the one red being `check-nothing-unlanded-v1`, which holds the site to this tree's build and passed once the commit was pushed. The same product: 9,403 lines on 18 pages and 54 first cards are the same on the live build and the new one. The reader's lines and cards did not move; what moved is the list under them.

**Shipped** (`logs/commit-message-acebd64e.txt`, `logs/g3-deployment-poll.log`): `main` acebd64ec7, `gh-pages` 50f4fcd73f. Pages deployment run 1353 succeeded at 00:27 UTC on 13 November, and the live check (run 51) passed on that commit.

**Owed, and paid on 13 November.** One comment in `zone.html` still named the check's old version (`check-chapter-pages-v2`). It was corrected with the chain's round (section 8), and every work's lines were read again for it: the same 400,242 lines.

## 8. The chain book and the card

`tools/probes/chain-vs-card.mjs`, `tools/probes/chain-only.mjs` (`logs/c1-…at-rest.log`, `logs/c2-…lifted.log`, `logs/c3-chain-only-….log`, `shots/obadiah-1-1-10.png`).

**Reproduced.** Obadiah 1:1 to 1:6 on the served build, switches at rest: 74 words, 1,915 pills, 3,729 links in the chain for the same words, as the reader counts. 1,755 pills are a link on the same word (the reader: 1,744) and 160 are not (the reader: 171); 62 of the linked name another source than the chain does, the reader's 62.

**The causes.**

- **The dictionaries beside the store (81 pills).** The card shows Jastrow's and the Samaritan dictionaries' rows as rows like the store's. The chain builder reads the route store alone.
- **The spelling (at least 51).** The chain hashes a reading as the store holds it ("yonder.", "of/ Edom"); the card prints it with the closing stop off and the "/" pieces joined by " + ". The chain's own recipe says "as the card prints it".
- **The capital (5).** Two rows that differ by a capital are one reading. Which spelling prints is the first row's, and the first row at rest is not the first row with every switch lifted.
- **A word the sources divide.** The card opens on the rung the line reads. For such a word that is the division, and its one pill is the place's own reading. The chain holds the pool of the whole form and no reading of the place.
- **The credited source (62).** Where Jastrow carries a reading the store also carries, the card credits the older; and at rest the card credits the oldest of the rows the pointing keeps.

**Why the check passed.** `check-chain-book-v1` K3 recomputes each link with the store reader's own pool function, the one the builder calls, and never opens a card. Its header says a check that hashes the way the builder hashes proves only that one function agrees with itself; for the pool it did exactly that.

**With every switch lifted** (the pointing at "keep", every source on, signs printed) the same 74 cards print 3,440 pills; 3,092 are links, 348 are not (202 a dictionary beside the store, 100 the spelling), and 637 links have no pill, most of them on the whole-form rung of a divided word, which the card does not open on.

**The mend: the chain is a recording of the cards** (13 November). As with the list, a second copy of the page's rule in a builder is what drifted, so there is no second copy.

- `tools/new/card-readings-v1.mjs` is the one reading of a card. A word is pressed as a reader presses it, and the card the page opens is read when its readings have arrived: its rows of buttons with the one pressed, the lines it prints above its pills, and every pill with the year and the source its title says and the sources behind it. Twice, each a visit of its own: at rest, as a first visit finds the page; and with every switch that withholds a reading lifted (the pointing kept whatever a source points, signs printed, every source on). Three things are held in the reading itself: the card's own head must name the word that was pressed; after the walk the lines under the words must be the lines before it, and no word may be ruled; and what the page fetches late is waited for before any card is read.
- `tools/new/build-chain-book-v2.mjs` replaces v1. It fingerprints what was read and writes each book's file, its page and the index. A file names the page and every file the page asked for, each by its sha256; one that is still of the tree is kept; the index is not written over one that is not; `--verify` reads again and fails on a difference.
- `tools/new/check-chain-book-v2.mjs` replaces v1 and opens the cards (below).
- `tools/edits/40-the-chain-is-read-off-the-cards.mjs`: the round reads the chain where the page is whole, after the records and the lines; the search index gets a step of its own; and the comment owed from section 7 is corrected.

**What a link is now.** Under a word, the pills its card prints when the word is pressed, in the card's order, each with the source its title names. Only the word is pressed: a division or a block the card offers and does not open on is named in the file (its button is fingerprinted) and its readings are a press away. The file and its page say so, and count them.

**What was read** (`logs/i5-chain-every-book-read-again.log`, `logs/i10-chain-totals.log`): 12 books, 14,354 words, 25 of them written one way and read another. At rest 435,246 links on 14,341 cards, and 13 cards print none. Lifted, 734,374. 27,865 lines above the pills. 28,758 buttons a press away, on 9,304 cards. 14.8 MB of files and 5.0 MB of pages, where the old chain was 21 MB.

**The reader's audit, repeated on the new chain** (`tools/probes/chain-as-the-reader-audited.mjs`, `logs/i9-the-readers-audit-on-the-new-chain.log`). Obadiah 1:1 to 1:6, 74 words. At rest: 1,915 pills, all 1,915 a link under their word, at the same place in the list, credited to the source the chain names; 1,915 links, none without its pill. Lifted: 3,440 of 3,440, none left over. On the old chain: 1,755 of 1,915, 62 of them credited otherwise, and 1,974 links no pill printed.

**The check** (`logs/i6-check-chain-book-v2.log`, 6 minutes). Offline, on every word of every book: the shape and the corpus fingerprints against the zones; each file is of this tree (6,465 file fingerprints taken again); each hangs together; its counts are what a walk finds; its page prints its first links in order; the index's sha256 of each file is the file's. In a browser, on the middle chapter of every book (2,838 words): every word pressed, its card hashed there, and it is the card the chain holds, at rest (89,878 pills) and lifted (151,245). And by a second road at rest: the pool the page itself says it offered is, pill for pill, what the chain holds (89,263 readings).

**What the check caught in my own first build** (`logs/i4-check-chain-book-v2.log`). The check starts in the middle of a book, and the first word it pressed had no line from the suggested source where the chain had one: 24 cards, the first of each chapter in each state. The page fetches the suggested source's file for a book only when the first card of a visit opens, and opens that card again when the file is here. So my builder, reading from the top, had recorded each book's first word without that line. The reader now opens one card and waits for the file by name before it reads any. Read again after that, all twelve books come out the same bytes (`logs/i8-chain-verify-every-book-read-again.log`).

**The check goes red** (`tools/probes/chain-check-goes-red.sh`, `logs/i11-chain-check-goes-red-three-ways.log`), three ways, on a copy of one book's chain, each put back. Two links swapped by hand, past the window the book's page prints, in a list a card prints only at rest: the file still hangs together and its page is the page, and C1 names the pill (the second road fails too). The same in a list printed only lifted: C2. A data file the cards were read off made one byte longer: K3 says the file is not of this tree, and the builder refuses to write the index.

**The suite and the gate** (`logs/k1-suite-the-chain-tree.log`, `logs/k3-gate.log`): 145 of 146, the one red being `check-nothing-unlanded-v1` until the push. After the suite the check was set to read with two browsers at once (3 minutes 25 seconds; it had taken 6 minutes 45 inside the suite) and one key that withholds nothing was taken out of the lifted state; the chain check, the checks that read the tools, two books read again and the tamper tests were run again on the result (`logs/k2-check-chain-book-v2-two-browsers.log`). The same product: 9,403 lines on 18 pages and 54 first cards are the same on the live build and the new one.

**Shipped** (`logs/commit-message-0d84ed08.txt`, `logs/k5-deployment-poll.log`): `main` 0d84ed0859, `gh-pages` 91b0987432. Pages deployment run 1354 succeeded at 02:37 UTC on 13 November, and the live check (run 52) passed on that commit.

**Not built, and measured.** The divisions and blocks a press away could be recorded the same way. On Obadiah's first six verses, pressing every one costs about twice the reading time for 3.4 times the pills (`dumps/h3-card-walk-obadiah-6-rest-rungs.json`).

**A reading can print in two spellings.** One reading prints in the spelling of the first row the switches keep, so 22 of Obadiah's 8,073 resting pills differ by a capital from the same pill with the switches lifted ("Promise", "promise"). The chain holds each state as it prints.

**Two pills of one card can print one text** (12 in the twelve books). A reading the corpus lane's map classes as a pointer prints the target entry's English, and two that point one way print alike. Behind it is a larger fault that is not the chain's: section 9.

## 9. A pill that points to another entry prints that entry's English in place of its own

Found while recording the cards; measured in `logs/j1-form-of-map.log` (`tools/probes/form-of-map.py`, `tools/probes/form-of-key.py`, `tools/probes/card-of-word.mjs`). The corpus lane's map of pointer readings (`data/form-of-pills-v1.json`, relay v85) resolves 2,236 readings to "the target's first English under the same source", and the pill prints that English with the relation and the target in brackets.

- 712 of them are a pointer and nothing else, which is the owner's "twelve (feminine of ...)".
- 1,115 say more after the target, and 409 have English of their own first. Their own words are not on the pill.
- The target is found by its letters alone. "plural indefinite form of חֹמֶר (chómer)" prints «Someone who leads a donkey or donkeys.», the entry of חַמָּר.
- Hosea 4:14, word 12: English Wiktionary's "they (the third-person masculine plural personal pronoun, masculine plural of הוא)" prints «Used as a copula: is. (masculine plural of הוא)», and so does its "are (...)". Other sources' "they" still stands on the card.

The classes and the resolution are the corpus lane's: `wip/2026-11-13/FOR-MOSES-2026-11-13-a-pointer-pill-prints-another-entrys-english.md`. What a reading with English of its own should print is the owner's call. Nothing on the page was changed for it.
