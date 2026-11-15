# RULE: the eight audit calls as lists (calls v1, relay v189)

14 November 2026 AD. Corpus lane (Moses). Written before the builder.

## What this is

Relays v181 to v184 were the owner's audit. At its end the corpus lane put eight calls to the owner, each with its recommendation. On 14 November the owner answered every open call: «just go with your recommendations its fine». The serving lane asked for each call as a list the page can land. This build makes those lists. Nothing served is changed by it.

The eight calls and what this build sends for each:

| call | the recommendation the owner took | what this build sends |
|---|---|---|
| 1 | mend the lane's readers of the sources | no list: it comes with the next reissue of the catalog |
| 2 | withhold the 44 rows that are not their source's sentence | 2 rows to withhold; the other 42 named, not withheld (v187 gives their words back) |
| 3 | over a run of several words, STEP's reading of each word leads and the joined reading is a press away | no new list: a page rule; v181's list of 2,177 lines is its check |
| 4 | where STEP spells or parts the word otherwise (853 places), STEP's reading stands | the 853 places, with STEP's words as the line's data |
| 5 | rows under keys that end in a maqaf: move the 357 readings the plain key lacks, drop the rest | 5,760 rows: strike or re-key, each with its re-point target |
| 6 | withhold placeholders and rows that only name the class of word (449 rows) | the 449 rows, and the picks whose own words are a withheld text |
| 7 | meanings of a whole phrase that their own source marks go a press away | the rows the source's own mark lifts, the rows that stay, the rows held |
| 8 | the default toggles as the resting card | no list: the default picks build is it (v180, v180.1) |

## Terms

- **The page's store**: the route store the page serves, read from a copy at store_version 4d1357b26ca5 (`index.json` and `shards/xx.bin`; a shard is gzip JSON, key to rows). A **row** is `[rank, route text, definition text, m, year, cut flag, headwords, ...]`. A row is named by its key, rank, source (`m`) and text, and it **stands** in the store when a row under that key has that rank, that source and that text, character for character.
- **Maqaf**: the Hebrew joining stroke, code point U+05BE. A **maqaf key** is a key whose last character is a maqaf. Its **plain key** is the same key without that last maqaf.
- **Twin**: a row under the plain key whose text is the same, character for character. A **same-source twin** has the same `m` as well.
- **Default picks**: v1 (relay v180) with its v1.1 mend (relay v180.1): at each place the mend lists, its `step` picks replace v1's; the mend's added rows follow v1's rows table, numbered on from its end. The page builds from this.
- **A reference**: one row number in one pick's list of rows. A pick that names two rows makes two references. References are counted for STEP, MACULA, UBS and BDB apart.
- **A pick's own words**: the words a pick prints. STEP: slot 4. MACULA: a piece's slot 2. UBS: a pick's slot 2. BDB: slot 5, the record's highlighted words, which is what the page prints for a BDB pick; slot 3, the point's words, is counted too.
- **A place**: a book and `chapter:verse:word`, as the cards write it.
- **Lifted only**: the row stays served, but it is not at rest on the card: it is a press away. The line names the row the way the name-rows list does: `k`, `rank`, `m`, `sha` (the first 16 hex characters of the sha256 of the text), with the text beside it.

## The list shapes

Rows to act on are written as the strike and withhold lists the page has landed before: `m`, `key`, `rank`, `route`, `action`, `to_key`, `kind`, `why`. A re-key adds `to_key_holds_text`, `to_key_holds` and `to_headwords`. Other fields carry what the line rests on. Lifted-only lists are in the name-rows shape.

## Call 2

The rows are v184's `rows-not-their-sources-sentence-v1.jsonl`, 44 rows.

- A row of classical_hebrew_words (M23): `action` withhold, kind `not_its_sources_sentence`. File `call2-withhold-v1.jsonl`.
- A row of the unabridged BDB (M46): not withheld. It is one of the openings that lost words, and v187 gives them back. Each is named with its v187 status, read by key and rank from v187's `words-back-final-v1.jsonl` (or `in-921-lost-none-v1.jsonl`), whose route must be the row's text. A status of v187 that begins `held_` means v187 keeps that row as it is now, a note with gaps, until the owner rules. File `call2-bdb-openings-not-withheld-v1.jsonl`, `action` none.

## Call 4

The places are every place of the word numbering v1 whose TAHOT tie is one of the three open layers: `open-q11`, `open-q1`, `open-q14`. For each place:

- `prints_now`: what v181 says the place prints now. The class of v181's `lines-not-steps-reading-v1.jsonl` at that place; else `UNDER_NO_LINE` if it is in v181's `words-under-no-line-v1.jsonl`; else `UNDER_A_LINE_OVER_SEVERAL_WORDS` if a line of v181's `lines-over-several-words-v1.jsonl` covers it; else `STEPS_READING_NOW`.
- `steps_words`: STEP's reading of the place, from the same v181 list. For a place under a line over several words, it is STEP's reading of that word in the line's own list of STEP's readings, and `steps_words_from` says so.
- `piece_store_lacks_the_place`: true if the place is in the given list of places of the default picks that the served piece store lacks (the A5 list, read as given).
- `action`: `steps_words_are_the_line` where STEP's words are given: the page prints `steps_words` as the line at the place. `none` where the place prints STEP's reading now. The lane did not check the page's wiring at those places.

## Call 5

The rows are every row of the page's store under a maqaf key. Each takes one class:

- `SAME_SOURCE_TWIN`: the plain key holds a same-source twin. `action` strike. `repoint_picks_to` names that twin as `[plain key, rank, m]`; where there are two or more, the one of lowest rank. (Amended: the target now carries the sha as well, `[plain key, rank, m, sha]`; see the last section.)
- `OTHER_SOURCE_TWIN`: the plain key holds a twin only from another source. `action` strike, as the owner ruled: the recommendation was to move the readings the plain key lacks and drop the rest. `repoint_picks_to` names the twin of lowest rank. Each line also carries `branch_if_this_sources_credit_is_kept`: a re-key to the plain key instead. The page's row-strike rule, since its version 4, folds a re-key only into the same source's row, so such a re-key would land as a row of its own. This branch is not the resting option; it waits for the owner.
- `NO_TWIN`: the plain key holds no row with this text. `action` re-key to the plain key; `to_key_holds_text` false, `to_key_holds` empty, `to_headwords` the row's headwords with an end maqaf taken off. Picks that name the row re-point to it once the page lands it and gives it a rank, so `repoint_picks_to` is null and `repoint_when` says so.

Every line counts the default-pick references to its row. The default picks are also counted per class.

v188's landing list flags lines whose words stand now under the same key with a maqaf. The build counts the `NO_TWIN` rows whose plain key and text are a line of v188's list: if call 5 lands first, v188's own rule skips those lines.

## Call 6

The rows are v184's kinds `ONLY_THE_CLASS_OF_WORD` and `PLACEHOLDER_OF_ITS_SOURCE`. `action` withhold. Each line says whether the row is on the names gate's list (`name-rows-v1.jsonl`, by `k`, `rank`, `m`, `sha`) and counts its default-pick references.

A default pick of MACULA, UBS or BDB whose own words are, character for character, the text of a call-6 row the pick names: withholding the row does not take those words off the card, because the pick prints them itself. Each such pick is one line of `call6-picks-words-withheld-too-v1.jsonl`, with its place, its source, the pick's position (the piece and the pick's number), its words and the withheld rows it names; `action` suppress_the_picks_words. For BDB both slot 5 and slot 3 are tested, and the line says which.

## Call 7

v184 counted two kinds: Strong's rows that open with Strong's own sign X, × or + (16,091), and rows of UBS and SDBH that open with «literally:» or hold « > » (3,655). v184's call put 19,746 rows a press away. That over-counted: the UBS dictionary marks for itself which meanings belong to a phrase of several words.

- **Strong's rows**: lifted only, by Strong's own sign. `call7a-strongs-sign-a-press-away-v1.jsonl`.
- **UBS rows** (M18): each row is reached through the catalog's own UBS route file, `ubs-sdbh-hebrew-definition-routes-v1.csv.gz`, where `normalized_key` is the row's key and `r_route_text` is the row's text, to its meanings (`lex_id`). A meaning is the meaning of a phrase **by the source's own mark** when, in the provider's file `UBSHebrewDic-v0.9.2-en.JSON` (entry, then `BaseForms`, then `LEXMeanings`), its `LEXCollocations` holds at least one phrase. A row is `PHRASE` if one of its meanings is so marked, else `ONE_WORD_SENSE`. A row the route file does not reach is a hard stop.
  - `PHRASE`: lifted only. `call7b-ubs-phrases-a-press-away-v1.jsonl`, with the meanings and their collocations. A row whose collocations are each one written word (no space and no maqaf in it, as בְּיָד) is flagged `the_sources_phrase_is_one_written_word`, with the letters written before the key's letters, where the word's letters end with the key's.
  - `ONE_WORD_SENSE`: stays at rest. The source marks no phrase for its meaning. `call7c-ubs-one-word-senses-at-rest-v1.jsonl`.
  - The places where a UBS default pick names a `PHRASE` row: `call7e-ubs-phrase-rows-named-by-a-ubs-pick-v1.jsonl`, one line per place, pick and row. A phrase row may stay at rest at such a place; whether it does is the page's wiring.
- **SDBH rows** (M17): held as they are. The SDBH's own mark of a phrase was not read. `call7d-sdbh-held-v1.jsonl`, `action` hold.

## Calls 1, 3 and 8

No list. Call 1 is a mend of the lane's own readers, issued with the next reissue of the catalog. Call 3 is a rule of the page: on a run of several words STEP's reading of each word rests and the joined reading is a press away; v181's `lines-over-several-words-v1.jsonl` (2,177 lines, each with STEP's reading of each word) is its check. Call 8 is the default picks build, v180 and its v1.1 mend.

## Checks the builder makes, each a hard stop

1. The store copy's rows add up to its index count, and its store_version is 4d1357b26ca5.
2. Every row of every list stands in the store at its key and rank with its source and text. Every re-point target stands in the store.
3. Call 5: every maqaf key's plain key is served; the rows and keys are v182's (5,760 rows, 2,550 keys, from v182's `rows-by-shape-v1.jsonl`), and the `NO_TWIN` rows are v182's 357.
4. Call 2: 44 rows, 2 withheld and 42 named; every M46 row is in v187's lists with the row's text as its route.
5. Call 6: 449 rows. Call 7: the kinds add up to v184's counts; every UBS row is reached by the route file.
6. The row-strikes record given is rule version 5, and it says a re-key folds only into the same source's row since version 4.
7. No file written holds a path of this machine (a drive letter and `Users`) or the home folder's name.

## The second count

`verify-calls-v1.mjs` recounts by other roads and imports nothing from the builder:

- Call 5: the store is read one shard at a time in two passes, never whole; the classes, re-point targets and counts are made again and compared line by line.
- The default-pick references are counted again with one counter per row number.
- Call 6's picks list is made text first: every MACULA, UBS and BDB pick whose words are a call-6 text, then whether it names such a row.
- Call 7's UBS split is made from the provider's file alone, by text: a row's meanings are those whose English short definition or a gloss is the row's text, preferring meanings of an entry whose letters are the row's key; the route file is not read.

It writes `verify-receipt-v1.json` with `agree` true, or stops.

## What is written

In this folder: the lists named above, `counts-v1.json` (every figure), `receipt-v1.json` (each input named by a placeholder and its sha256, each output's lines, bytes and sha256), and the verifier's `verify-receipt-v1.json`.

## Amended after the first run (14 November 2026 AD)

The first run showed three things this rule had not settled. The amendments below were made before the runs that the receipts and `ship-v189/two-runs-v1.txt` record.

1. **BDB's printed words are slot 5 only.** The serving lane's letter of 14 November (default-picks questions, point 4) says the page prints slot 5 of a BDB pick, the record's highlighted words, with the sense's number. In the first run no BDB pick had a withheld text in slot 5, and 230 had one in slot 3, the point's words («verb» 199, «adverb» 30, «conjunction» 1). So `call6-picks-words-withheld-too-v1.jsonl` tests slot 5 for BDB, and holding a BDB pick there is a hard stop that would make the relay say so. The slot-3 matches go to their own file, `call6-bdb-point-words-not-printed-v1.jsonl`, `action` none, as data: they matter only if the point's words are ever printed.
2. **A pick whose words are a withheld text but which names no withheld row is listed too.** The same letter says that where no row prints a pick's words, the ledger's words print. The first run found 2 UBS picks whose words are «NO DATA YET» and which name no call-6 row. They are lines of `call6-picks-words-withheld-too-v1.jsonl` with `withheld_rows_it_names` empty and `rows_it_names` giving the rows they name.
3. **Call 7's one-written-word flag says what the word is, row by row** (`one_written_word_is`): the key's letters with a letter written before them, as בְּיָד under יד; the key's own letters; or another written form of the word, or another word. The letters written before are counted.

## Amended after the first run of the second count (14 November 2026 AD)

The second count's text road first matched the provider's text as it stands, and 108 of the 3,463 UBS rows were not reached. The rows' texts are the provider's text with the source's own markup read the catalog's way: a link `{L:flesh<SDBH:...>}` is its word «flesh», an author's mark `{A:ABD}` is «ABD», a note's call `{N:002}` is no word, a direction mark (code points U+200E and U+200F) is no character, a space before «...» closes up, a run of spaces is one, and an opening «= » is set aside. A second try with only the first and the last two of these still left 7 rows unreached; with all of them, none. The second count now reads the provider's text this way. It still does not read the catalog's route file. Every figure of the builder stands as it was.

## Amended after a second seat checked the build (14 November 2026 AD)

A second seat checked these lists against the store and found that a key and a rank do not name one row. In the store, many rows share a key and a rank, and often a source as well: under אאסף at rank 2, Strong's holds 17 rows. This rule had said a row is named by its key, rank, source and text, but the lists also offered key and rank as enough, and call 5's re-point target was only `[plain key, rank, m]`. The error was mine. It also found 4 places of call 4 that print STEP's reading now, drawn otherwise. These amendments were made before the runs that the receipts and `ship-v189/two-runs-v1.txt` record.

1. **One row per line.** Every line of the row lists (call 2's two lists, call 5, call 6's withhold list, call 7a to 7d) must name exactly one row of the store by its key, rank, source and text. A line that names none, or more than one, is a hard stop. For each of those lists, the counts give the lines whose key, rank and source also hold a row that is not on the same list, and the lines whose key and rank hold such a row. Those lines cannot be landed by key and rank, or by key, rank and source.
2. **Call 5's re-point target carries the sha.** `repoint_picks_to` is now `[plain key, rank, m, sha]`, where `sha` is the first 16 hex characters of the sha256 of the line's text, which is the target's text too. This is the shape of the default picks' rows table. A target whose four parts name more than one row is a hard stop. The counts give the lines whose target's key, rank and source alone name more than one row. The counts also give, for the `OTHER_SOURCE_TWIN` lines, the STEP references by the source of the row they re-point to: this is where those picks would go, and it is what the credit branch is about.
3. **Call 4: places drawn otherwise.** v181's class `STEPS_READING_HERE / DRAWN_DIFFERENTLY` is a place that prints STEP's reading now, credited to the TAHOT pieces, but drawn with its pieces joined by «+» where STEP draws it otherwise. Such a place keeps `action` steps_words_are_the_line, so the line is drawn as STEP draws it, and its `why` says so. The counts give the places the piece store lacks by what they print now. The places that print STEP's reading now are those of `STEPS_READING_NOW` and those of this class.
4. **Call 7: a phrase row that also has a meaning with no phrase.** A row stays `PHRASE` if one of its meanings is marked, as the rule says. Where the route file also ties the row's key and text to a meaning with no phrase, the line carries `also_a_meaning_with_no_phrase` with those meanings, and the counts name the rows.
5. **The second count** recounts each of these: the one-row check and the shared-key counts, the four-part targets and the targets whose key, rank and source name more than one row, the references by the target's source, call 4's places by what they print now, and the call-7 rows that also have a meaning with no phrase, by its own text road.
