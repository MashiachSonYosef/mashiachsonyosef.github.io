# The page lane's punctuation pilot, 31 October 2026

Elijah (page lane) drafted a mark declaration for each of the ten largest dictionaries in the route store, then had each draft checked by a second agent that had not seen the draft's code. Both stages ran on Opus. This folder keeps what they produced so it outlives the container.

This pilot is not the ask. Moses works from `../ASK-provider-declarations-v1.1.md` and `../check-provider-declaration-v1.1.mjs`. `pilot-synthesis-NOT-SENT.md` is the pilot's own draft of an ask; it was written after v1.1 went out and was not sent. What it adds is listed below under "For ask v1.2".

## What each dictionary's folder holds

- `draft/`: the drafting agent's declaration (`declaration.json`), its census, and the scripts that produced the counts (`ledger.mjs` or `census.mjs`, by provider).
- `verify/`: the checking agent's own classifier, written from the declaration's words alone, and its small outputs.
- `verdict.json`: whether the draft held, why, the meanings it falsified, the corrections, the comparison with today's rule, and the open questions.

Files over 400 KB were left out (the per-route comparison files). Each is reproducible from the scripts and the route store at version 87b13b1169b4.

## Results

"Today's rule" is what the card does now: a cut at each semicolon outside brackets, then sense-split-rule-v3 on commas. The last four columns count routes whose division would change if the page followed the draft declaration instead.

| dictionary | routes | draft | today's rule divides, the dictionary's own rule keeps whole | the dictionary's rule divides, today's rule keeps whole | both divide, differently | routes that would change |
|---|---|---|---|---|---|---|
| wikisource_strongs_explicit_forms | 148,506 | did not hold | 8 | 121 | 15 | 144 |
| kaikki_wiktionary_hebrew | 123,558 | did not hold | 1,726 | 3,300 | 6,495 | 11,521 |
| stepbible_tahot_aligned_translation | 95,089 | held | 1 | 0 | 0 | 1 |
| macula_hebrew_cherith_surface_english_2022 | 43,304 | held | 0 | 0 | 0 | 0 |
| panlex_hebrew_english_meanings_20240301 | 28,439 | held | 4 | 3 | 0 | 7 |
| muse_hebrew_english_ground_truth_dictionary | 24,514 | held | 0 | 0 | 0 | 0 |
| openscriptures_strongs | 23,646 | did not hold | 3,324 | 163 | 1,566 | 5,053 |
| ubs_sdbh_hebrew_v0_9_2 | 21,626 | did not hold | 11,108 | 0 | 0 | 11,108 |
| openscriptures_bdb_1906 | 15,238 | did not hold | 17 | 1 | 3 | 21 |
| hiperbiblia_sdbh | 14,823 | held | 30 | 0 | 0 | 30 |
| all ten | 538,743 | 5 held | | | | 27,885 |

The checking agents reproduced the comparison with today's rule exactly for every dictionary, using their own code for the semicolon cut and the shipped `sense-split-v1.mjs` for commas. For Kaikki and Open Scriptures Strong's that needed the draft's own word lists, which the declarations had left unwritten. So the last column is reliable as a measure of how far today's rule is from each draft, even where the draft itself did not hold.

An example, checked against the shipped rule on 31 October. UBS writes פצלות as "a long, narrow area, ◄ created by peeling part of the outer layer from an object". Today the card prints "a long" and "narrow area" as two readings beside the whole text. In UBS a comma inside a definition is prose, so neither piece is a reading.

## Why five drafts did not hold

Every failure is the same kind. The draft's code applied rules that its written tests do not state:

- word lists ending in "..." or "and the like";
- no stated order where two tests match the same mark;
- exceptions in the code that the words never mention.

Read from the words alone, a second person gets different counts. Ask v1.1 already closes this. It requires every list in full under `definitions`, the classifier's shape order as the order, and step 7a: a second count written from the words alone that must also pass the checker. The pilot drafts were written before v1.1, under the pilot's own instructions.

Beyond that, the checking agents falsified dividing meanings that the drafts neither stated nor counted. For BDB, 5 routes print a piece another piece completes ("hard, unproductive soil"). These cases are the probes for reviewing Moses's ships.

## Probes for Moses's first ship (openscriptures_strongs)

When Moses ships openscriptures_strongs under v1.1, the review runs checker v1.1 on his classifier and his recount, writes a third classifier from his words alone, and then tries each probe below. A probe fails the ship only if his declaration lets it divide wrongly without stating and counting it.

1. **The field kind.** Seven KJV list records end in a closing note and read as Strong's sentence by their characters: יה, שיה, מצפה, דיבון, הי, שכר, ינח. Under v1.1 rule 12, a field kind guessed from characters never divides. His declaration must either take the kind from a source he can show or keep these whole.
2. **A stray full stop inside the list.** מלה "thing. word.", גבולה "landmark. place.", לודי "Ludim. Lydians.": the text after the stop is a rendering, not a note.
3. **A name's meaning beside the name.** בהן "thumb , Bohan , an Israelite", זבוד, תיריא, שכרון: the comma between the meaning and the name does not separate two renderings.
4. **A syllable printed as a rendering.** שבע "-teenth), -th, times)", עשק "oppress(-ion), -or)", מלאכה "occupation, ( -pied), officer".
5. **A stray closer.** היה, עת, שחר, נדבה, מול: 9 commas in 8 records with a ")" that nothing opened. The refusal must count the cuts it causes, not only the 16 stray closers.
6. **A semicolon that closes a label.** מהר "flow easily, i.e. (by implication) ; to hurry", and לבב.
7. **Strong's sentence and the list in one record.** אפרת "perhaps for Ephraim; also of an Israelitish woman; Ephrath".
8. **Labels.** The usage-label list decides eight shapes. The draft's list gave def_label 812, the checker's own reading 1,055. His list must be written in full.

The pilot's eight open questions for this dictionary are in `openscriptures_strongs/verdict.json` under `questions`: a name and its description, the list's full stop, the note after the list, damaged routes, and four more. Under v1.1 each should appear as a branch for the owner, not as a choice made silently.

## For ask v1.2 (held until the first ship is reviewed)

- **The checker rejects unfinished lists.** It fails any test or definition that contains "...", "etc.", "such as", "and the like" or "for example". v1.1 says this in words; the checker does not yet enforce it.
- **A stray closer's cuts are counted.** The refusal counts each cut that a stray closer causes, not only the closer.
- **Field kind from the provider's file.** Where Moses has the provider's own file, the field kind (Strong's sentence or KJV list, definition or gloss) may come from its fields, with the record id as evidence. Rule 12 stays for a route whose record cannot be found.
- **The order of work.** UBS (11,108 routes) and Kaikki (11,521) are where today's rule is furthest from the dictionary. They may deserve to come right after openscriptures_strongs, ahead of the order table.
