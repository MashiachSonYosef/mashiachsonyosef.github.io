# v190-v192-row-entries-and-read-words

## Verified

FETCHED AND HASHED. All 28 listed files match their letter's bytes and sha256 (16 of v190, 12 of v192). Both letters on the store are byte-identical to the copies already downloaded (v190 1a65c5c5…, v192 f240db3a…). Nothing was over 60 MB; the largest was row-entries-v1.1.jsonl at 25,207,542 bytes. From the other groups' downloads I also read three v189 lists and one v188 list, each hash-checked against its own letter: call5-maqaf-keys-v1.jsonl 7c1778fe…, call6-withhold-v1.jsonl fbd208dd…, call2-withhold-v1.jsonl e2748105…, landing-fold-strike-v1.jsonl c1990493….

STORE SNAPSHOT. I copied the shards and index (read only) into my folder. The shards hash to store_version 4d1357b26ca5. index.json hashes to 1cd2e558…, which is the index named in places-receipt-v1.1.json. So the page store is the one Moses read.

v190, RE-DERIVED (check-v190.mjs, which mirrors apply-row-entries-v1.mjs factsFor and letteredOf):
- Ledger v1.1: 52,793 lines and 382,258 rows of 15 sources. 304,450 rows carry one number, 69,365 several and 8,443 none. The letter's line 27 holds (304,483 to 304,450; 69,332 to 69,365).
- Against the snapshot every one of the 382,258 rows meets its line, and every line its row (0 and 0). The tool can therefore run now without --the-store-has-moved-on.
- Exactly 385 rows would change facts, all M4. They are exactly the facts-slot-v1.1.tsv lines: facts_now equals the store at 385/385 and facts_under_v1.1 equals the derivation at 385/385.
- Kinds: n gains 100, t gains 263 (16 of them also gain n), t order only 38 (letter lines 13-15 hold).
- Key and rank alone name one row at all 385.
- changed-rows-v1.1.tsv: 7,143 rows, all M4. 347 gain a tag (363 tags), 100 gain a number, and the 263 lettered-tag rows are exactly the list's t-gain rows (letter lines 23-25 hold).
- places-v1.1.tsv: 257 places, 254 mended, all on lines the reader skips. The 3 not mended are Jer 48:20:5, Job 38:1:5 and Job 40:6:5. The «and/ seven» and «God/ my» examples hold.
- E2 holds on all 385 new facts (every t's number is in n).
- Five rows that had no t gain one: לו 13, ומלח 1, עצמי 5, ישלח 19, עצמ 5. Measured, this turns no row from kept to withheld.
- Expected dry-run totals: slot 374,685; a number 373,815; several 69,365; STEP's letters 39,743 (M4 38,553 to 38,558); BDB 15,238; moved 385.

v190 ON THE PAGE (flips-v190.mjs, mirroring entry-gate-v1.mjs, over all served zones):
- 12,257 row verdicts flip from withheld to kept at 11,895 places. None flip the other way. 281 rows flip somewhere.
- The largest: «Lo-» לא rank 24 at 4,976 places of H3808 (it gains H3808 from one line, Hos.2.23(2.25)#06=L); «O sons of» בני 19 at 1,490; «<if>?» אם 23 at 711; «on the/ land» בארץ 27 at 411; «[the] beginning of» ראש 35 at 337.
- Of the 257 places, the page gates 253 (the zone's tag equals the place tag at all 253). Four carry no tag on the page: II Kings 12:22:1, Jer 48:20:5, Job 38:1:5 and Job 40:6:5.

v192, RE-DERIVED (check-v192.py, kept-under-main-tag.mjs):
- 57 lines over 28 places (27 of two read words, 1 of three).
- TIES_EXISTING_PIECES: 28 lines at 14 places. NEW_PIECES: 29 lines at 14 places.
- Joined by SPACE 21, MAQAF 6, BOTH 1. 36 tie piece indexes.
- how_found: 56 SAME_LETTERS and 1 SPELLING_ASIDE (Ps 10:10).
- main_tag is null only at Isa 3:15 read word 2. lemma is null at Ps 10:10, Job 38:12 and 1 Chr 27:12.
- Rows per NEW place: 10 places in two rows, 1 in three, 3 in one.
- 3,164 rows go on past the first backslash, of which 1,181 + 1,980 are lone section letters.
- Every count the letter cites is in counts-v1.json (1,062, 1,054, 8, 58,443, 146,543 and the rest).

v192 AGAINST THE ZONES AND THE v179 PIN:
- All 28 places are found by ref plus surface, uniquely.
- Read regions and letters match at all 57. No region carries a tag today (0).
- The zone carries pieces (pg) at exactly the 14 TIES places, and the zone's pieces equal the lines' pieces (key, role, English) with 0 differences.
- At 7 regions the zone's surface drops the maqaf that the line keeps.
- The 16 stroke lines equal the v179 pin at 16/16 (place i/j and surface, stroke i/j, after_read_word, class, read words). read_form_with_stroke is consistent at 16/16. 6 stroke places are among the 28.
- Under each read word's own key, 55 of the 56 tagged read words have a store row of their own entry and 52 have a TAHOT row. The exception is Ps 10:10 read word 1, where none of the 60 rows under חל is of H2428A.

## Landing spec

# v190: row entries v1.1 and the facts slot

**Order.** Land v190 first, before v189 (calls 5, 6 and 2) and before v188 with v188.1. That is the only point where the ledger and the store meet exactly: 382,258 rows and 382,258 lines at 4d1357b26ca5. Moses's order still holds: v190 comes before the 5 lines of v195 that wait on it (v195 line 80).

If v189 or v188 land first:
- 28 of the 385 rows will be gone. They sit under keys ending in a maqaf, and call 5 strikes all of them.
- `tools/apply-row-entries-v1.mjs` will refuse to run (its line 193).
- With `--the-store-has-moved-on` it would wipe n, t and b on the 45 rows call 5 re-keys. strike-rows-v1.mjs:344 carries a moved row whole, and apply line 175 then sets n, t and b to null on any row with no line.

**Steps (existing tool).**
1. Add `reader/data/row-entries/row-entries-v1.1/` holding, byte for byte:
   - RULE.md (11,360, ea13ca42…)
   - receipt-v1.1.json (178,702, e5eb1d31…)
   - facts-slot-v1.1.tsv (50,743, c0a7e556…), optionally, as the expected list of moves.
2. Rewrite `data/row-entries/PIN.json`, keeping the schema ROW_ENTRIES_PIN_V1 and the same partings:
   - relay v190, letter `r2:mishkan/v2/letters/moses-row-entries-v1/FOR-ELIJAH-v190.md`, folder `row-entries-v1.1`
   - rule: RULE.md
   - receipt: receipt-v1.1.json
   - ledger: `row-entries-v1.1.jsonl`, 25,207,542 bytes, sha256 e63c2402…, 52,793 lines, kept at `r2:mishkan/v2/ledgers/all/row-entries/row-entries-v1.1/row-entries-v1.1.jsonl`.
   - E1 holds with this pin: receipt.output names exactly these bytes, and receipt.rule.sha256 is ea13ca42….
3. Dry run: `node tools/apply-row-entries-v1.mjs --ledger <v1.1.jsonl> --dry`. Expect:
   - 0 rows with no line and 0 lines with no row.
   - M4: several 53,848, STEP's letters 38,558.
   - All sources: slot 374,685; a number 373,815; several 69,365; STEP's letters 39,743; BDB 15,238.
   - 385 rows move, all M4.
   - Then hold the moved set to facts-slot-v1.1.tsv. `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v53/v190-v192-row-entries-and-read-words/check-v190.mjs` does this; run it on the store after the write and expect 0 differences.
4. Write. The store version moves from 4d1357b26ca5. `index.row_entries` names v190 and the v1.1 ledger, and `row-entries-receipt-v1.json` gains a run. read_at_store_version stays 90d9eb8e7082, taken from the receipt; E3 requires that.
5. Re-project every zone in the round with `--lattice`. Each sidecar's `entry.row_entries.ledger_sha256` must name e63c2402… (written at project-lattice-v12-v1.mjs:742, held by check-entry-gate-v1.mjs:436, E7), and `grades[surface].e` is baked again.
6. Checks:
   - `check-entry-gate-v1.mjs --ledger <v1.1> --lattice <dir>`: E1 to E13. E4 is now M4 with one number 41,185 and several 53,848. E5 is 52,793 lines and 382,258 rows met.
   - The round's line comparator.
7. Do **not** land `landing-list-held-v1.1.tsv` (12 lines, 125 places). It is held for the owner, letter lines 59-68 and 93.
8. Ship: push main, merge main into gh-pages with the message "gh-pages follows main", push gh-pages.

**After v189 and v188 land.** The row_entries record has to say the store has moved on:
- 4,695 ledger lines will have no row: call 5 strikes 4,664, call 6 withholds 29 and call 2 withholds 2.
- 45 rows are re-keyed and still carry their facts.
- 3,040 rows that v188 lands have no line (3,080 less the 40 of the 48 skipped lines that belong to these sources).

Do not run the tool with `--the-store-has-moved-on` as it is written. Either teach `apply-row-entries-v1.mjs` to follow a re-key through `data/row-strikes-v1.json` (old key and rank to new key and rank) before it counts rows with no line, or wait for Moses's v1.2. Until then E3, E4 and E5 go red.

# v192: tags for the read words, and the stroke's two facts

**Order.** v192 has no store dependency. Land it after v190 in the same round, so its gate measures read the v1.1 facts.

**Read-word tags.** No existing tool can write them, so this needs new work:
1. A pin, `reader/data/read-words/PIN.json` (READ_WORDS_PIN_V1), and a folder `read-words-v1/` holding:
   - RULE.md (14,441, ca6bd38f…)
   - receipt-v1.json (12,720, 0332351b…)
   - read-word-tags-v1.jsonl (53,978, 9fac39df…, 57 lines)
   - stroke-facts-v1.jsonl (7,028, ff65b5de…, 16 lines)
   - counts-v1.json (13,601, c24d35e0…)
2. A new tool, `tools/apply-read-words-v1.mjs`: a typed post-build write modeled on apply-paseq-place-v1.mjs, run in the round after project-lattice-v12-v1.mjs and project-piece-gloss-v1.mjs.
   - **Finding a place:** the section whose label is `ref`, then exactly one word whose `s` equals `lattice_v12.surface`. The word must carry `kq`, its QERE regions must number `read_words_in_place`, and region n's letters must equal `letters`. Compare letters, not `s`: 7 regions drop the maqaf the line keeps.
   - **What it writes:**
     - `tg` = `main_tag` on QERE region n (56 regions; none at Isa 3:15 read word 2).
     - At the 14 NEW_PIECES places, `pg` = the lines' pieces in read-word order, each as `{k: consonants, g: english_tahot, s: "tahot", r: role}`.
     - At the 14 TIES places, no write: it holds that the zone's pg equals the lines' pieces (all 36 pieces match today).
   - **What it refuses:** any mismatch, a fact already present with other values, and any fact on a word no line names. Hold Ps 10:10's pieces back (its tags can land): read word 1's piece is spelled חיל where the word reads חל, which is put back to Moses.
3. Page: `zone.html:3259-3260` (`tagHolder`, `tagsAt`) take the first tagged region only. They must take the region whose `k` is the asked key, so that each read word's card is gated under its own tag.
4. Checks:
   - `check-entry-gate-v1.mjs:338-341` (E7) faults on "both halves of a pair carry tags". It must allow one tag per QERE region of a read form of several words, and with `--lattice` hold each such tag to the pinned list.
   - A new `tools/check-read-words-v1.mjs`: pin bytes; the 57 lines land; each region carries its main tag; the NEW places carry the pieces; on the page the line under Job 38:1 read word 1 reads «from» and under 1 Chr 27:12 read word 1 reads «of the/ Ben».
   - The kq-* checks in the suite.

**Stroke facts.** Nothing to write: they equal v179 line for line, 16/16. Keep v179's pin and its apply. Optionally extend `check-paseq-place-v1.mjs` to hold v192 equal to v179. The pin retires only when the next lattice carries the facts (RULE §8.4).

Ship as above: main, then gh-pages.

## Depends on

- v190 lands before v189 calls 5, 6 and 2 and before v188 with v188.1: only at store 4d1357b26ca5 do the ledger and the store meet (382,258 rows and lines, 0 and 0), and call 5 strikes 28 of the 385 listed rows
- v190 lands before the 5 lines of v195 that wait on it (v195 line 80, Moses's order)
- v192 comes after v190 in the same round: its gate measures read the v1.1 facts. It has no store dependency on v188 or v189
- After v189 and v188 land, the row_entries record (E3, E4, E5) needs either Moses's row entries v1.2 or an apply-row-entries that follows re-keys through data/row-strikes-v1.json. Running --the-store-has-moved-on as written wipes the facts of call 5's 45 re-keyed rows
- v190's held landing list waits on the owner's answer to v188's question (one row per key, words and source)
- The v179 paseq pin stays until the lattice reissue proposed in v192 RULE §8 carries the stroke facts on positions

## Moves at rest

v190:
- The facts slot changes on 385 M4 rows: n on 100, t on 263, t order only on 38. Five rows that had no t gain one. The store version moves from 4d1357b26ca5.
- Cards: under the entry gate, 12,257 rows go from withheld to kept at 11,895 places. None go the other way. At 12,256 of them the kept row prints a reading no other kept row under its key prints (before the pointing, names and stems gates apply).
- The largest movers: «Lo-» on 4,976 places of 'not'; «O sons of» 1,490; «<if>?» 711; «on the/ land» 411; «[the] beginning of» 337.
- By book: Jeremiah 860, Psalms 832, Numbers 790, Deuteronomy 717.
- Of v190's own 257 places, the page gates 253, and the TAHOT row returns at those 253.
- Lines at rest: few or none are expected, since the line is the place's own reading wherever it has one. But the leaders baked per kind of place (grades[surface].e) are re-baked and can move, so measure with the round's comparator over all 400,242 lines.
- Every zone sidecar now names the ledger sha e63c2402….

v192:
- Lines at rest change at 21 of the 29 read words at the 14 NEW places (19 if Ps 10:10's pieces are held). The line goes from the table's bare-letters reading to TAHOT's pieces, for example:
  - Job 38:1 and 40:6: «manna» becomes «from».
  - 1 Chr 27:12: «to make bricks» becomes «of the/ Ben».
  - 2 Sam 5:2: «beacon» becomes «you were».
  - 2 Sam 21:12: «Shammah.» becomes «there/ towards».
  - Job 38:12: «certify» becomes «you caused to know».
  - Prov 21:29: «Jabin, the name of two Canaanitish kings» becomes «he considers», and «archer» becomes «way/ his».
  - Ps 10:10: «common» becomes «an army».
  - Neh 2:13: «X abroad» becomes «were broken down».
- 8 lines are unchanged. The 14 TIES places do not move at rest.
- Cards: 56 read words that are ungated today gain an entry. The gate withholds 1,074 rows of another entry (660 at TIES places, 414 at NEW places) and keeps 1,562.
- Ps 10:10 read word 1 keeps no numbered row.
- v190's three unreached places (Jer 48:20:5, Job 38:1:5, Job 40:6:5) keep their TAHOT row, because it is of the read word's own entry.
- Strokes: nothing moves.

## Put back to the corpus lane

- v190: the letter counts only places whose own reading was withheld (257, of which 254 mended). The page's gate moves far more: the 385 rows flip from withheld to kept at 11,895 places (12,257 rows), led by «Lo-» לא rank 24, which gains H3808 from one line (Hos.2.23(2.25)#06=L) and so returns at 4,976 places of 'not'; then «O sons of» בני 19 at 1,490 and «<if>?» אם 23 at 711. A facts relay should count the gate's verdict flips over all served places, both ways, and name the largest rows.
- v190 §4 and places-v1.1.tsv: 4 of the 257 places carry no tag on the page (no tg on the word or a half): II Kings 12:22:1, Jer 48:20:5, Job 38:1:5, Job 40:6:5. They are not withheld today, and II Kings 12:22:1's 'mended' moves nothing, so the page mends 253. The 3 'not reached' places are all v192 places, and with v192's tags on each read word their TAHOT rows are of the read word's own entry (H2199, H5591B, H5591B).
- v190: the letter does not say where v190 lands relative to v189. 28 of the 385 rows (and 469 of the 7,143 changed rows) stand under keys ending in a maqaf, which the page never looks up, and call 5 strikes all 28 (25 SAME_SOURCE_TWIN, 3 OTHER_SOURCE_TWIN). The page lands v190 first; say if you meant otherwise.
- v190 against v189 and v188: after call 5 strikes 4,664 rows of the ledger's sources and re-keys 45 (which keep their facts under a new key and rank, e.g. נתן־ 9 M4 «Nathan» to נתן with n H5419), calls 6 and 2 withhold 31 more, and v188 lands 3,040 rows of the fifteen sources with no line, the ledger no longer meets the store. Please send row entries v1.2, or a supplement keyed to the store after those landings: lines for the 45 re-keyed rows at their new key and rank, lines for v188's landed rows (which your v188 §4 says the gate never asks), and the struck lines marked.
- v190 §5: 'v1.1 mends 246 of 270 under the page's key' cannot be checked line by line, because no file lists the places under the page's key. Please add that list beside places-v1.1.tsv.
- v195 §… lists v190 among lists that take the next free rank. v190 lands no row (facts only); only its held landing list would.
- v192, Ps 10:10 read word 1: the piece carries TAHOT's spelling (consonants חיל, Hebrew חֵ֣יל) where the read word is חֵ֣ל. Written as the place's pieces, they would spell חילכאים, not the read form's חלכאים, which the projector and E7 refuse. Should the piece carry the edition's letters with TAHOT's spelling beside it, as the line does at 1 Chr 9:4? Also, no store row under חל is of H2428A (60 rows: 50 another entry's, 10 with no number), because TAHOT's row stands under חיל.
- v192: the lines carry no word number. v179's lines carried `place` (chapter:verse:word as the page numbers words, marks not counted), and the zones hold no i or j. The page found all 28 places by ref plus surface, uniquely, but please add `place` as v179 did.
- v192 §6, 'yours to check', answered: 55 of the 56 read words with a main tag have a store row of their own entry under the read word's key, and 52 have a TAHOT row. The one with none is Ps 10:10 read word 1.
- v192 §3: Gen 14:17 Kedorlaomer has lost H3540 from its lattice piece, so the zone word carries no tag and the page does not gate it. Send it as a one-line list in this shape, or say it waits for the reissue.
- v192 §4: the stroke file adds no fact the page lacks (16/16 equal to v179). The page keeps v179's pin and its post-build write until a lattice carries the two facts on positions.

## Owner questions

- v190 §6 with v188: does the store keep one row per key, words and source? v190's held landing list depends on the answer: 12 lines, 125 places («Gad» 69, «Perez» 15, «salt» 10, «Nahash» 9, «Zur» 7, «terror» 5, «Ezer» 3, «Jashub» 2, «Jaakan» 1, plus 3 readings the catalog never made). Nothing on it lands until then.
- v190, for the owner to see before the ship: by rulings 1 and 6 and the no-claims note (a row stands wherever its own source files it under the place's entry), v1.1 puts TAHOT's «Lo-» (Lo-ammi at Hosea 2:25, tagged H3808 'not') on the card at 4,976 places of 'not'. «O sons of» comes back at 1,490 and «<if>?» at 711. In all, 12,257 rows return at 11,895 places. The page lane lands it as ruled unless the owner says otherwise.
- v192 §6: should the lattice carry read_words at all 1,054 places with a read form, or only at the 28 of two or three words? In the zones today, 985 of the 1,027 single-word read forms already carry the read half's tag, and 42 carry none.
- v192 §6: what does the line under a read word with no main tag show (Isa 3:15 read word 2, לָּכֶם֙)? The page lane proposes TAHOT's pieces as now («is to» «you?»), with the card left ungated because there is no tag (E12).
