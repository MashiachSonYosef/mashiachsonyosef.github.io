# RULE, amended — default picks v1.2: the word numbering v1.1, re-points, and every case carried

14 November 2026 AD. Corpus lane (Moses). An amendment to `default-picks-v1/RULE.md` and to `default-picks-v1.1/RULE-AMENDMENT.md`. Written before the mender. It answers the serving lane's default-picks questions 1 to 6 of 14 November as data. Everything in those two rules stands unless this one says otherwise.

## Why

- **The word numbering.** v1 and v1.1 read the word numbering v1. The word numbering v1.1 ties a TAHOT line at 266 places that v1 left with none. So 267 places had no STEP pick, and 266 of them should. That was my fault, found by the second look at question 5.
- **Rows a page never looks up.** A STEP reading at a word written with a maqaf has a key that ends in a maqaf. The page never looks such a key up. The audit's call 5 (relay v189) strikes or re-keys those rows and names, for each, the row the picks should name instead. And 2,325 STEP readings name no row at all, though a row under the plain key prints their words (question 1).
- **Every case in the ledger.** v1 joined two picks of a place that have the same entry and words into one, and said nothing (question 2). A joined pick is now carried as a branch, not dropped. A cell of meaning variants can hold two variants parted by a broken bar, and v1 read only the first. STEP also writes a small-letter written form beside some ketiv and qere places, in its spelling column; v1 did not read it.

## Terms

- **A place**: a word place of the word numbering, `book` and `p` as v1 writes them.
- **v1.1**: v1's book files with `default-picks-v1.1/step-mend-v1.1.jsonl` applied and `rows-added-v1.1.jsonl` appended to the rows table.
- **A row**: `[key, rank, m id, sha16]`, the first 16 hexadecimal digits of the sha256 of the row's words, as v1's rows table writes it. A row **stands** when the page store `4d1357b26ca5` holds, under that key, a row of that rank and m id whose words have that sha16.
- **The plain key**: a key with its closing maqaf taken off.
- **A branch**: a labelled case carried beside the resting picks. `rests` says whether it is on at rest. Every branch here is off at rest; turning one on is the owner's.

## What the mender reads

1. **STEP's picks at every place, made again** as v1.1 makes them (TBESH by its second column), with four changes and no others:
   - the place's TAHOT lines are those the word numbering **v1.1** ties to it (`tahot.tied`), not v1;
   - a cell of meaning variants is parted at a semicolon **or a broken bar** (U+00A6) before a letter and `=`; each part is a variant, read as v1 reads one;
   - a variant pick carries two more items after its letter and Hebrew: **its TAHOT word number** (the digits after `#` in the first column of the line it stands on, as a number) and **that line's reference** (the first column up to `=`). So a variant is `[letter, Hebrew, word number, reference]`;
   - picks of one place with the same entry and words are still one pick, but each pick that joins another is written to the **merged branch** with `merged_into`, the number of the pick it joined. Nothing is dropped.
2. **MACULA and UBS** are read from v1, not rebuilt. The mender stops if the word numbering v1.1 ties any place to other MACULA words than v1.
3. **BDB** places a citation by the STEP entry numbers of the places of its verse (v1's rule). The mender places every citation twice, once by v1's ties and once by v1.1's. The first must give v1's `bdb` arrays at every place, byte for byte, or it stops. Where the second differs, the place is written to `bdb-mend-v1.2.jsonl`.
4. **Re-points of question 1**: the 2,325 STEP readings that name no row and can name a row under the plain key (the lane's list of 14 November, `repoint-list-v1.jsonl`) name that row. The pick's entry and words must be the list's, and the row must stand.
5. **Re-points of call 5** (relay v189, `call5-maqaf-keys-v1.jsonl`): wherever a pick names a row of that list, it names instead the row the line gives in `repoint_picks_to` (classes `SAME_SOURCE_TWIN` and `OTHER_SOURCE_TWIN`). A pick that then names one row twice names it once, in first place. A row of class `NO_TWIN` stays named: it stands until the page re-keys it, and the pick is listed as waiting for its new rank. The mender must find v189's own counts of references before it re-points: 23,888, 16,013 and 122.
6. **The credit branch**: each re-point to another source's row carries v189's `branch_if_this_sources_credit_is_kept` and the picks it touches, in `call5-repoints-v1.2.jsonl`. Off at rest: the owner ruled the strike.
7. **The small-letter written forms**: on a TAHOT line whose type has a small `k` in its brackets (`Q(k)`), the spelling column's part that opens with `K=` is STEP's written form. Each is written to the **small-letter branch** at the line's places, with its word number and reference, and whether the place is a ketiv and qere place of the word numbering v1.1 and whether STEP has a `K` pick there. Off at rest. A small letter means no change in meaning, so it is a form, never a pick.

## STEP readings that still name no row

Each is listed in `picks-waiting-v1.2.jsonl` with one status. The line under STEP's default prints the ledger's words there, credited to STEP, whatever the status. The status says where a row will print them on the card. The first that holds:

*Amended after the mender's first run.* The first run took an unread line before call 5 and v188. It gave 5,716 picks to the landing, where the lane's second look gave 5,170. The second look was right: at most of the difference, STEP's words do have a catalog row, made from another place where the line is read, and call 5 or v188 brings that row to the key. Landing STEP's own row there as well would print the words twice. So the order is now: call 5, then v188, then the unread-line landing. Each pick a place tied first by the numbering v1.1 gives is marked `tied_first_by_numbering_v1_1`, in this list and in both branches.

1. `NO_KEY`: the reading has no key to look up (a mark alone).
2. `WAITS_FOR_CALL5_REKEY`: call 5 re-keys STEP's own row with these words from the key with a maqaf to the plain key (`NO_TWIN`). It names that row.
3. `WAITS_FOR_V188`: relay v188 lands these words under the plain key or the reading's own key. It names v188's line: key, rank, m id and source. Where the reading's own TAHOT line is one the catalog skips, the line says so.
4. `UNREAD_LINE_LANDING`: the reading's TAHOT line is one the catalog's reader skips (a Hebrew verse beside the English one, or no Hebrew to read), and neither call 5 nor v188 brings its words to the key. It names the line of `step-unread-landing-v1.2.jsonl` that would print it.
5. `NO_LANDING`: none of these. The ledger's words print, credited to STEP, and no card row prints them.

## The unread-line landing

`step-unread-landing-v1.2.jsonl`: one line per plain key and words with status `UNREAD_LINE_LANDING`, in the shape of the landing lists the page has landed (`m, key, rank, rank_from, route, action, to_key, kind, why, source, headwords, definition, year, record_loc, record_file, rid, item`), plus `places_n`, `places`, `entries`, `tahot_lines`, `land_now_or_wait` and `v188_lands_the_same_words` (empty since the amendment above, kept so the page can see it checked).

- `m` is M4, `source` STEP's TAHOT, `route` and `definition` the reading's words, `year` as v188 writes an M4 line's year, `rid` null: no catalog row exists.
- **The rank** is the next free rank under the key: one more than the highest of the ranks the page store serves under it, the ranks struck-ranks-v1 holds under it, the ranks v188 lands under it, and the ranks given before it in this list, lines taken in the order of key and then words.
- `land_now_or_wait`: the page may land the line now, or wait for the catalog reissue (the audit's call 1), which reads these lines and would make the same row. Not both.
- No line's words may stand under its key in the page store now.

## Question 6: the entry gate

`entry-gate-picks-v1.2.jsonl` carries the lane's classed list of the 2,291 STEP reading picks that name a row the entry gate withholds at their place (`a6-picks-withheld-row-v1.tsv`), one line each, with what the bake does: classes C1 and C4, another named row stays and the bake skips the withheld row at that place; C5, C6 and C3, the ledger's words print, credited to STEP. Each line also says whether row entries v1.1 (relay v190) would let the withheld row through at that place: its numbers then include the number of the place's entry. The pick must stand in v1.2 at that place with the list's entry and words.

*Amended after the second seat's check, 14 November 2026 AD.* The first list above was true of v1.1 but not of v1.2. Call 5 re-points rows, and at 77 lines the pick no longer names the withheld row at all. And call 5 makes new cases the list never held. So:

- **How the gate reads a row.** The gate is row entries' own rule. At a place whose entry has number N: a row whose numbers hold N is let through; a row with numbers, none of them N, is withheld; a row with no line in row entries, or a line with no number, is let through. A row's numbers are the **last item** of its row entries row. The mender's first run read the first list of words after the fourth item instead, which for the rows of M5 (Open Scriptures' BDB), M46 (the unabridged BDB) and M23 (the classical Hebrew word list) is their own ids, not their numbers. No output changed, but the stop "row entries v1 would let a withheld row through" was not truly tested for those rows. It is now.
- **Each line is held to v1.2.** The pick is found by its entry and its words. If v1.2's pick still names a withheld row, the line is **active** and keeps its bake. If it names none, because call 5 re-pointed the withheld row, the line is **stale**: it carries `rows_now` (the pick's rows in v1.2), `call5_moved_it_to` (call 5's target for each withheld row), and `let_through_by`, which row entries lets the new row through ("row entries v1", or "row entries v1.1 only"). Its bake is "none: call 5 re-points this pick to a row the gate lets through". Where only row entries v1.1 lets the new row through, the line also carries `until_row_entries_v1_1_lands`: "print the ledger's words, credited to STEP", since the gate the page runs now withholds it. The mender stops if a stale line's withheld row is not a call-5 row, or if neither row entries lets the new row through.
- **Check 8.** At every active skip line (C1, C4), a named row other than the withheld one is still let through by row entries v1. At every active print line (C5, C6, C3), no other named row is. The mender stops otherwise.
- The receipt counts the active and the stale lines apart, and counts how many lines row entries v1.1 lets through among the active lines and among all.

## The entry gate after the re-points

`entry-gate-after-call5-v1.2.jsonl`: the STEP reading picks that are not on the entry-gate list, whose rows in v1.1 the gate let through at their place (by row entries v1) or who named no row in v1.1 (question 1's re-points), and whose rows in v1.2 the gate withholds there, every one, because a re-point gave them another row. One line each: `book`, `p`, `n`, `entry`, `words`, `cause` ("call 5" or "question 1"), `place_number` (the number the gate looks for), `v1_1_rows`, `v1_1_row_numbers_by_row_entries_v1`, `v1_2_rows`, `v1_2_row_numbers_by_row_entries_v1` (each new row's numbers, or null where row entries has no line), `row_entries_v1_1_lets_through`, and `bake`: "print the ledger's words, credited to STEP". The mender stops if a call-5 line has no row of call 5 among its v1.1 rows, or if a line is on the entry-gate list. Only places whose ties did not change are looked at: the others had no pick in v1.1.

## The small-letter branch, two more counts

Of the ketiv and qere places with a small-letter form and no K pick, tied in v1 too, the receipt counts apart those that also have a capital-K line tied (`of_them_tied_by_numbering_v1_too_with_a_capital_K_line`) and those that have only small-k lines.

## Call 5's row counts

The receipt also carries v189's own count of call 5's rows by class (`v189_rows_by_class`), read from `counts-v1.json`, so the relay can set the picks' share beside v189's whole.

## The given inputs

The re-point list, the entry-gate list and seven of the eight files the answers take from the lane's investigations are copied into `inputs/` beside the mender, byte for byte, so the steps re-run from the strand. The receipts name them there. The eighth, A3a's `variant-letters-v3.json`, is not copied: it writes the paths of the machine it was made on, and nothing in this strand may hold one (check 5). It stays a given input, named by its sha256.

## What is issued

- `step-mend-v1.2.jsonl`: `{"book", "p", "step"}`, the whole new `step` array of each place whose array differs from v1.1. A place not listed keeps v1.1's.
- `bdb-mend-v1.2.jsonl`: `{"book", "p", "bdb"}`, the same for BDB, where the word numbering v1.1 changes it.
- `rows-added-v1.2.jsonl`: rows the mended picks name that v1.1's table does not hold, numbered on from its end (the first is row 152,648, counting from 0, unless the receipt says another).
- the branches: `branch-merged-picks-v1.2.jsonl`, `branch-small-letter-written-v1.2.jsonl`; and `call5-repoints-v1.2.jsonl` with the credit branch;
- `picks-waiting-v1.2.jsonl`, `step-unread-landing-v1.2.jsonl`, `entry-gate-picks-v1.2.jsonl`, `entry-gate-after-call5-v1.2.jsonl`;
- `receipt-v1.2.json`, every count named here, and each input by a placeholder and its sha256.

Default picks v1.2 is v1.1 with each listed place's `step` and `bdb` replaced and the added rows appended.

## Checks the mender makes, each a hard stop

1. At every place whose TAHOT ties are the same in both numberings, STEP's picks made again equal v1.1's, once the four changes above are taken out (the variant's two new items, the broken-bar variants, the re-points). MACULA, UBS and BDB by v1's ties are v1's.
2. Every row any pick of v1.2 names stands in the page store, by all four parts.
3. The references to call 5's rows before re-pointing are v189's counts; every re-point target stands.
4. Every re-point of question 1 finds its pick with the list's entry and words, naming no row before.
5. No file written holds a path of this machine or the name of its user's home folder.
6. The picks of every listed place are numbered 1 to n.
7. Every landing line's words stand under no row of its key now, and no two lines share a key and rank.
8. (Added after the second seat's check.) Every line of the entry-gate list finds its pick in v1.2 by entry and words; no withheld row is let through by row entries v1; an active skip line keeps another row the gate lets through, and an active print line keeps none; a stale line's withheld rows are call 5's rows, and a row entries lets its new row through. Every line of the list after the re-points has a re-pointed row and is not on the entry-gate list.

## The second count

`verify-default-picks-v1.2.mjs`, by another road. It uses no code of the catalog builder or of the mender. It reads TAHOT's lines, the two word numberings, v1, v1.1, v1.2, call 5's list, the lane's re-point list, v188's lines, the struck ranks and the page store, each with its own reader. It recounts: the places whose ties differ; every pick candidate at every changed place (picks plus merged branch lines must equal the readings, variants and alternatives the tied lines hold); every variant's word number; every row any pick names, held to the store; every re-point, by class, against the lists; the small-letter forms; the waiting picks by status; the landing ranks; and question 6's change under row entries v1.1. After the second seat's check it also recounts, from v1.1, v1.2, both row entries files and the entry-gate list: the active and the stale lines, which row entries lets a stale line's new row through, row entries v1.1's lines among the active, and every pick of the list after the re-points, line for line. It must find the receipt's counts, and writes `verify-receipt-v1.2.json` with `agree`.
