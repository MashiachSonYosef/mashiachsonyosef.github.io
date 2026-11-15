# The removals question, one card: «Peru» at Genesis 1:22, "be fruitful"

15 November 2026. One lens of several (read only). The structured answer handed to the lead carries every item; this file keeps the tables, the readouts and the quotations behind them. Scratch (scripts and their outputs): `scratchpad/v66/peru/`.

Trees read: the live site `scratchpad/old` (main 857a3dc0fb, store 4d1357b26ca5); today's ship `scratchpad/rt` (store 869e4ee14c3a, read as files only, no tool of it run); the relays `scratchpad/dl-v178`, `scratchpad/dl-v195`. One headless run against the live reference server `http://127.0.0.1:8914/reader/zone.html?b=genesis`, which serves store 4d1357b26ca5 (`card.mjs`, dump `card-live.json`, picture `card-live-rest.png`): two visits, at rest and with the pointing at "keep".

## 1. The place

Genesis 1:22, word 5: פְּר֣וּ, key פרו, section index 21 of the Genesis zone. TAHOT's tag on its core piece is H6509; its stem is qal; it is not on the list of name places (no line of `reader/data/names/names-v1/place-names-v1.jsonl` names Genesis 1:22). The line under it reads «be fruitful» (TAHOT at this place, CC BY 4.0).

## 2. The 23 rows, and what the live card does with each

The card at rest (pointing "only this pointing", the default) prints 19 pills and says: «1 given as a name by its source, withheld · 2 of 25 pointed otherwise, withheld». The 25 are the 23 store rows and the two rows of the piece store that carry the place's own readings (TAHOT «be fruitful», MACULA «fruitful»).

| # | rank, source | the row | on the live card |
|---|---|---|---|
| 1 | 1, M4 TAHOT | «be fruitful» (headword פְּר֣וּ, H6509) | pill 1, pressed; the line |
| 2 | 2, M4 | «they will be fruitful» (פָר֥וּ, H6509) | pill 8. Withheld by the pointing until 13 November; stands since as a row of the place's own entry |
| 3 | 3, M4 | «they were fruitful» (פָּר֧וּ, H6509) | pill 9. The same |
| 4 to 8 | 4, M14 Strong's via Wikisource | «bear», «bring forth (fruit)», «(be, cause to be, make) fruitful», «grow», «increase» (H6509, no pointed headword) | pills 2 to 6 |
| 9 | 5, M13 English Wiktionary (Kaikki) | «Pro-: forming adjectives relating to support.» | pill 10, printing «Pro-» only (the label-off print step, Kaikki B05) |
| 10 | 6, M13 | «Third-person plural past (suffix conjugation) of פָּרָה (pará)» | pill 11, printing «to bear fruit, be fruitful (Third-person plural past (suffix conjugation) of פָּרָה)» (the pointer map) |
| 11 | 7, M13 | «Masculine plural imperative of פָּרָה (pará)» | pill 12, the same way |
| 12 | 8, M13 | «singular form of פָּר (par) with third-person masculine singular personal pronoun as possessor: his bull» | pill 13, printing «his bull» only (label off) |
| 13 | 9, M13 | «Peru (a country in South America)», facts `{"name":1}` | **withheld by the names gate**, counted in the card's note, since 13 November (main 90eedeb6f3) |
| 14 | 10, M25 Kaikki strict forms | «to bear fruit, be fruitful» (headword פָּרוּ) | **withheld by the pointing** ("pointed otherwise"), since the default became "only" (main 05d4fd0f88, 6 November) |
| 15 | 11, M25 | «to procreate, multiply, increase» (headword פָּרוּ) | **withheld by the pointing**, the same |
| 16 | 12, M32 OmegaWiki | «Peru» | pill 14 (with row 22 behind it) |
| 17 | 13, M1 ConceptNet | «pro» | pill 15 |
| 18 | 14, M3 MACULA | «fruitful» (פְּר֣וּ, H6509) | pill 7 |
| 19 | 15, M32 | «Republic of Peru» | pill 16 |
| 20 | 16, M21 PanLex 2024 | «Tarica» | pill 17 |
| 21 | 17, M42 PanLex 2025 | «country in South America» | pill 18 |
| 22 | 18, M1 | «peru» | no pill of its own: one reading, one pill, case folded; it stands behind pill 14, and the record says ConceptNet «reads it “peru”» |
| 23 | 19, M32 | «A country in South America, with capital Lima.» | pill 19, its closing stop not drawn |

With the pointing at "keep" the card holds 23 pills and no note: «Peru (a country in South America)» is back (pill 14 there), and so are M25's «to bear fruit», «to procreate», «multiply» as pills of their own, with «be fruitful» and «increase» gaining M25 as a carrier.

A 24th row once stood under the key: ConceptNet's «peru (n)» (rank 20, M1). On 6 November its filing tag came off and it folded into row 22 (row-strike-rule-v3, the round of 17:01 UTC; kept whole in `reader/data/row-strikes-v1.json`, the hole typed in `struck-ranks-v1.json.gz` as `[20, "M1"]`). The owner, of ConceptNet's tags: «why not just fix it» (`wip/2026-11-06/FOR-MOSES-2026-11-06-print-step.md` line 7). The tag was written by this corpus's own script from the path ConceptNet files the word under.

## 3. 12 November and now

| | 12 November | live now |
|---|---|---|
| pills | 18 | 19 |
| the card's note | «4 of 25 pointed otherwise, withheld» | «1 given as a name by its source, withheld · 2 of 25 pointed otherwise, withheld» |

- Left: «Peru (a country in South America)» (the reader's call: another word).
- Came: «they will be fruitful», «they were fruitful» (not graded by the reader).
- Both by one ship, 13 November: «The card asks the word's place two things before the pointing: its entry, and whether it is a name» (main 90eedeb6f3, 12:31 UTC, gh-pages 2d6f6b90f6, live check 57). The entry gate keeps a row of the place's own entry whatever its points (rows 2 and 3); the names gate withholds row 13. The second ship of that day (bdf3735238, the stems) moves nothing here.
- The other eight pills the reader called another word on 12 November all still print: «Pro-», «his bull», «Peru», «pro», «Republic of Peru», «Tarica», «country in South America», «A country in South America, with capital Lima».

## 4. The names gate

**The rule** (`reader/tools/names-gate-v1.mjs`; `reader/zone.html` lines 3133 to 3148 and 7204 to 7209): under "only this pointing", at a place that is not a name, a row whose facts carry `name` never enters the pool, and the card counts it. At a name place the row stands. Under "keep" or "the letters only" the gate is not asked.

**The owner's words.** 13 November 2026: «1-3. ok agree», to three options the corpus lane put, the third as: «Names. Hide a dictionary's names, such as «Bara», where the word on the page is not a name.» Recorded in `reader/data/rulings/rulings-v2/rulings-2026-11-13-options-v1.json` (lines 5 and 16 to 17; ruling 8, relay v177), which is the corpus lane's file, pinned byte for byte; the page lane quotes the same words (`wip/2026-11-13/the-rulings-of-13-november/THE-RULINGS-2026-11-13.md` line 3). The example shown was «Bara». The ruling file's own list of what it does on the reader's cards names «Peru (a country in South America)» at Genesis 1:22:5.

**Who marks a name, by what field** (`reader/data/names/names-v1/RULE.md` lines 21 to 26):

- Classical Hebrew Words (M23): the record's part of speech, with stops, square brackets and spaces off and in lower case, begins `prn`, `pln`, `propn` or `prpn`, or is `prm`.
- English Wiktionary as Kaikki gives it, and Aramaic Wiktionary: the source line's `pos` is `name`.
- The SDBH via HiperBiblia (M17): the record's `part_of_speech` is `name`.
- The UBS dictionary (M18): `name` among the `PartsOfSpeech` of the base form that holds the meaning.
- Wikidata's Hebrew lexemes: `lexical_category_id` is `Q147276`.
- A place: TAHOT's grammar for the core piece begins `Np`, or a MACULA word there has the type `proper`. A gentilic is not a name.

7,412 rows carry the mark: the UBS dictionary 4,335, English Wiktionary 1,590, Classical Hebrew Words 868, the SDBH 449, Aramaic Wiktionary 92, Wikidata 78. 34,577 of 305,431 word places are names.

**Why Wiktionary's «Peru (a country in South America)» carries it.** `name-rows-v1.jsonl` line 7405: `{"k":"פרו","rank":9,"m":"M13","sha":"71e7548969626bf3","entries":["Hebrew line 5709"]}`. Line 5709 of Kaikki's Hebrew file is the entry the row comes from, and its `pos` is `name` (the lane's builder: `name: p === 'name'`). The mark belongs to the entry, so every sense of a Wiktionary proper-noun entry carries it.

**Why the others do not.** Two different answers, a day apart.

- When the gate shipped, they had not been read. RULE.md line 28: «Every other source of the store is not read for a name, and neither is the Jastrow overlay; their names stand. (Amended before any ship: the first wording said those sources mark no name, which was not checked for each of them.)» The letter v177, line 12: «The other sources are not read for a name, so their names stand: among them ConceptNet, PanLex, OmegaWiki, MUSE, Hebrew Wiktionary, Wikipedia's titles and Jastrow.» And line 14: «On the reader's cards the gate withholds «Bara» and «Peru (a country in South America)». The reader's other names on those cards come from sources not read for a name, so they stand.»
- Read since (the letter v194 of 14 November, section 3): «OmegaWiki does by its own part of speech "name" at only 13 of 387 rows; the rest are names by a class list I chose, and OmegaWiki gives "noun" to countries too, 93 rows.» «These sources mark none, in 8 source files: ConceptNet, whose InstanceOf means "a kind of", PanLex, MUSE, the Wikipedia titles, Lexibank and Kethoneth.» «At Genesis 1:22:5 OmegaWiki's «Peru» and «Republic of Peru» are names only by my class list, not by OmegaWiki's own mark; ConceptNet's «peru» and PanLex's «Tarica» stay.» The lane's evidence file gives OmegaWiki's own data for the two rows as `"name:  | class state"`: no part of speech, and the class "state" (`dl-v195/v194-answers/.../answers-v1/evidence-v1.json`, examples/peru).
- So: ConceptNet and PanLex have no such field (by the corpus lane's reading; the providers' files are not on this machine). OmegaWiki does say something of these rows, the class "state", and does not say "name"; reading "state" as a name would be the lane's class list. The third OmegaWiki row, «A country in South America, with capital Lima.», is the definition of that meaning in OmegaWiki's own structure, and the store carries no mark that tells a definition from a word (the lane's declaration v126.1: the route store carries neither the defined-meaning id nor the expression id).
- The page lane's recommendation on names v2 (owner question 26 of 14 November): «only the source's own name mark makes a reading a name, not a class list Moses chose». It went ahead as recommended on the owner's word of 15 November («just push the ledgers we did live bro i cant check everyone before we push stuff»). Names v2 is not built.

**What the gate is asked of, measured** (`reach.py`, `reach.txt`; my own count on whole-word cards, before the pointing and the stem, cards of joined words not modeled: an upper bound). After the entry gate's own withholding, a name row is withheld at up to 35,029 word places that are not names, 72,313 row and place pairs: English Wiktionary 35,218, Classical Hebrew Words 18,432, the UBS dictionary 11,468, Wikidata 4,984, Aramaic Wiktionary 1,779, the SDBH 432. The rows at the most places: Wiktionary's «a male given name» (5,754), «Asher (the eighth son of Jacob, …» and Classical Hebrew's «Asher (pr.n.)» (4,807, the word "which"), Wiktionary's «God, the God of Israel.» and «El, the chief deity in Canaanite religion» and Wikidata's «ancient Near Eastern deity» (4,285, the letters אל).

**Where the two "name" marks are not one question** (`el.py`). Of the 4,285 places of אל that are not names, 158 are the word God itself (H0410G 142, H0410K 14, H0410J 2; Daniel 11:36:10 «[the] God of», Genesis 14:20:2 «God»). There Wiktionary's «God, the God of Israel.» is withheld as a name, because Wiktionary files El as a proper noun and TAHOT and MACULA do not call the word there one. «God» still prints from other sources' rows. The page lane's own measure of the converse is `wip/2026-11-14/the-names-gate-both-ways/THE-NAMES-GATE-BOTH-WAYS-2026-11-14.md` (Rimmon: the converse would act at 16,319 name places and could not reach the row that raised it; kept one way, put back to the owner).

**Wiktionary's 1,590 name rows, by what their text says** (a rough sort of mine by words in the text, not a rule): 440 say a given name, a surname or a first name; 356 name a place in their own words (a country, a city, a river); 794 are other things: months, gods, people of the Bible, spellings («defective spelling of דקאר»), and senses filed under a proper-noun entry («gold in general» under Ophir).

**In today's ship** (`rt/reader/zone.html` lines 3552 to 3557 and 7711 to 7726): the gate also withholds a pointer pill whose resolved row is a name row (`formOfIsAName`; 34 pointers by the count in `rt/reader/data/form-of-pills-v1.json`). It is the page lane's own addition from its review of 14 November; I found no question put to the owner for it. It moves nothing on this card: the two pointers here resolve to «to bear fruit, be fruitful».

**Lifting it.** The pointing switch («the pointing»: keep, only this pointing, the letters only). It is not on a book page today: the rail draws two rows (sources, source suggested) and folds every other switch away unless the address carries `?rail=all` (`zone.html` lines 14190 to 14194; in the headless run the fold's `hidden` is true and the row is not visible). /toggles/ describes the switch and links to `?rail=all`. A choice is kept on the device.

## 5. The queued lists

No list of the eleven relays names any of the 23 rows (`queued.py`, `queued-place.py`: every .jsonl, .tsv, .json, .md and .txt under `dl-v195`, by the key as an exact field, by the rows' texts, and by the place).

- v189 calls 2, 5, 6 and 7 (all eleven list files), v188 and v188.1, v187, v185.2, v191, v192, v193, v195: no line.
- v190 (row entries v1.1) holds the key's line, 9 rows with H6509, byte for byte the line of v1; the key is not in its changed rows.
- v194: the key is in no list. Its evidence file carries the Peru example quoted above, and its names addendum (26 rows) has none of this key.
- The rows under the key are the same bytes in the live tree and in today's ship (`shard-live.txt`, `shard-rt.txt`).

## 6. The others a reader would call "not this word"

- «Pro-» (Wiktionary): prints. Its headword is bare letters, so the pointing is silent; it has no number, so the entry gate is silent; its entry is not a proper noun. The words that say what it is, «forming adjectives relating to support», are taken off the pill by the label-off step and stand only in the record («this reading is a piece cut out of the record above»).
- «his bull» (Wiktionary): prints. The same silence. The label that says it is a form of פָּר is off the pill.
- «pro» (ConceptNet): prints. No field of the row says anything.
- «Tarica» (PanLex 2024): prints. No field.
- Label off is Kaikki's branch B05, answered `label_off` on 7 November «under the owner's rulings of 6 November (the filing marks around a name or a word come off)» (`wip/2026-11-07/FOR-MOSES-2026-11-07-checker-v1.2.md` line 20; `reader/data/ledger-branch-answers-v1.json`). The record writes "by the owner, 2026-11-07"; what I found is the page lane carrying the ruling of 6 November to a branch that was held at rest that day. I found no words of the owner on B05 itself.
- The corpus lane's builder met Kaikki's other parts of speech as it read (`receipt-v1.json`, marks_met: «kaikki pos prefix» 27, «kaikki pos noun» 69,247, «kaikki pos verb» 83,604) and used only `name`. Whether «Pro-» is one of the 27 I could not read: the provider's file is not on this machine.

## 7. The two right readings the pointing withholds

Rows 14 and 15 are Wiktionary's own senses of this verb, «to bear fruit, be fruitful» and «to procreate, multiply, increase». Kaikki's strict-forms table files them under the form פָּרוּ (the past, "they were fruitful"); the word here is the imperative פְּרוּ. They carry no number, so the entry gate cannot keep them, and the pointing withholds them. «be fruitful» and «increase» still print from other sources; «to bear fruit», «to procreate» and «multiply» are on no pill at rest. The owner on the default, 6 November: «1 seems like it» (asked whether "only this pointing" becomes the default; `wip/2026-10-15/STATUS-2026-10-16.md` line 896), and of bara: «therefore should stand, meaning bara cant be cut down» (`wip/2026-11-06/ASK-binyan-ledger-v1.md` line 9).

## 8. Not covered

- The providers' own files (Kaikki, OmegaWiki, PanLex, ConceptNet) are not on this machine. What each says of a row is taken from the corpus lane's rule, receipts and letters.
- The public site was not fetched (no network). The card was read on the reference server, which serves the store of main 857a3dc0fb.
- The reach figures are a count on whole-word cards, not a walk of every card.
- The owner's words are quoted as the two lanes recorded them. I found no transcript of the conversations.
