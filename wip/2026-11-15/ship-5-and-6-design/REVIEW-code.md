# Review of the ships 5 and 6 design, by the code as it is

I tried to break the design against the code. Two things fail outright: decision 3's mend of the witnessed columns changes nothing, and the new law D21 would stop the round at its defaults step. Eleven more need fixing before the build, and six are notes. Most of the mechanisms and the counts the design rests on held up.

How I worked:
- I read `S/ship` at main add346d851; its tree is clean.
- I wrote nothing into `S/ship` or any other tree. I ran no git command that writes, no round, no bake and no browser.
- My scripts are light node and python scripts, run under `nice -n 19` with capped heaps. They and their outputs are in `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-code/`. Each figure below names the script (r1–r15b) that counted it.
- `S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`.

## Blocking

### B1. Decision 3 (the witnessed columns) changes nothing, and the design's own G2 stays red

**Evidence**
- `bake-witnessed-order-v1.mjs:113` takes `readings[0]` of the row the lane shipped. The row is found by `store.rowOfText` (`:84`).
- On the ship's store, 2,477 witnessed entries lead with a reading that opens with Strong's sign: entry-and-lists 2,475, same-place 1, entry 1 (r6).
- At every one of them, the row prints that one signed rendering and nothing else.
  - Rows that also hold a plain reading: 0.
  - Keys whose pool holds a plain reading: all 2,477.
  - Examples: Amos אזן row «+ advertise» gives readings ["+ advertise"]; ארץ «X common»; אשר «X after».

**What follows**
- `readings.find((t) => !opensWithStrongSign(t)) ?? readings[0]` returns the same signed reading at all 2,477.
- The receipt's count of "stepped past a signed first reading" will be 0, not the 2,453 the design expects.
- G4 passes today and after the build only because no row has a plain reading to take. It guards nothing.
- G2 covers `gloss_orders.*`, so it fails after the build at those same 2,477 entries.

**What the design must say instead**
- The witnessed bake refuses, with a typed reason, an entry whose row prints only renderings carrying Strong's sign («a rendering carrying its source's sign leads no line while the signs switch rests off»).
- The key then leaves the column, and the line under the witnessed order reads the base table under rule v8. `applyGlossOrder` lays a column only over the column's own keys (`zone.html:14529-14550`).
- G4 becomes: no witnessed entry opens with the sign where the key's pool holds a plain reading.
- The receipt counts the refusals: 2,477 on today's store. `check-witnessed-order-v1`'s rebuild refuses the same entries.

### B2. D21, as a law over the records, stops the round at its defaults step

**Evidence**
- The round's defaults step (`round-v1.sh:165-206`) runs `check-default-picks-v1.mjs --node` (`:195`) right after the bake. It exits on any FAIL ("the default picks do not hold").
- The records are read again only later, in the lines step.
- In this first pass the records are the previous round's. Each was read with the old index and says so: amos's `read_off.files["data/default-picks/index.json"]` is 013fa911…. They draw no stands.
- D21 ("at each stands place the record draws STEP's words … under M4") is therefore red there at 432 places.

**What the design must say instead**
- D21 judges only records whose `read_off.files` names the sha256 of the index being checked, and counts the rest. Or it is made a page law.
- D5 must be amended as well (`check-default-picks-v1.mjs:895-935`). It already reads records "read with the default sources laid", and its `STEP_WORDS` will now hold the stands, the 6 pairs among them.

## Should fix

### S1. Under signs «as printed», the line moves but the card's order does not

**The problem**
- Rule v8 is baked into the table, the sidecar leaders and every column. None of these has a signs position.
- The design's `signLast` returns 0 under «printed».
- So under «printed», wherever rule v8 moves the line (on the ship's records, 1,885 lines plus 6 bracketed), the card's first pill is the signed reading while the line prints the plain one.

**Where it shows**
- The chain books are read with signs «printed» (`card-readings-v1.mjs:107-109`).
- The live repaint under a switched-off source takes the pool's first reading (`zone.html:14760`, `:14786`). Under «printed» that is the signed reading where the bake leads plain.

**What the design must say instead.** The lead's call says "while the signs switch rests off". The design must choose one of:
- (a) The rule holds in every position. `signLast` sorts Strong's sign last under «printed» too, and «printed» then only governs drawing and offering.
- (b) A baked «printed» column (the old leader where it differs), laid by the page as the license columns are.

### S2. hg, the line under «look up by: the headword», is outside rule v8

**Evidence**
- 257 words on 105 headword keys have an hg that opens with the sign (r2, r3). All are whole lists of the Open Scriptures Strong's, e.g. «× break, companion, keep company with, …».
- The line reads hg under that switch (`zone.html:13655-13656`), which is live (`:4411-4418`).
- hg is the top card of the lattice's own sorted stack (`project-lattice-v12-v1.mjs:678`, `:698`). It does not go through `readingPool`.

**What follows.** Neither rule v8 nor the `firstUnder` change reaches it, and G2's list omits it.

**What the design must say instead.** The design applies the rule to the reader positions o.m and o.x, so it should treat hg the same way: take the first card of the sorted stack whose text does not open with the sign. Or name hg as excluded and say why. Either way, add hg to G2.

### S3. G2 must name the gates of each column it covers

**Evidence**
- After rule v8, 46 license-column leaders still open with the sign: licence_by_sa 45, licence_by 1 (r7).
- In each, the license class holds no plain reading although the key's pool does. Example: Amos ישאג, by-sa «X mightily»; the pool's first plain reading is «roar».
- Line and card agree there. The page sorts the license class before the sign (`zone.html:8656`), and `licenceColumns` takes the class's first reading (`gloss-m-v1.mjs:229`).

**What the design must say instead.** G2 as worded is red at these 46. Spell out each column's pool:
- for a license column, the class's own readings;
- for `gloss_m.alt`, the pool with the leader's carriers left out;
- for o.c, the groups the citing cards carry.

### S4. The kinds count under «open» is not given the place

**Evidence**
- The design passes `placeOfW` only to `shutAway`.
- `kindsShown` still asks `restsOff(row)` with no place, in two sites: `poolFor` (`zone.html:8494`) and the pair's welded card (`:10024`).
- With the switch open, at a `picked_at` place, a UBS collocation pill that stands at rest is counted as «N shut at rest, shown · hide» (`kindsSwitchFor`, `:3826-3830`).

**What the design must say instead**
- Pass the place at both sites.
- K4 should also test the switch open.

### S5. `placeOfW` and `picked_at` need one spelled-out key

**Evidence**
- The design writes `placeOfW` as `${BOOK} ${label}:${k}` and points to "the table dfltPlaceSaid builds".
- But `dfltPlaceSaid` returns `${zone.work} ${at}` (`zone.html:6174`), the title, «I Samuel 6:10:15». `BOOK` is the slug, «i-samuel» (`:2752`).
- The word that `poolFor` holds (`askedWord`, `:3427-3430`) carries no word reference and no number.
- `picked_at`'s "<book>" is never defined.

**What the design must say instead**
- The derive tool writes `` `${ledger file slug} ${p}` ``, labeled as the bake labels places, marks not counted (`bake-default-picks-v1.mjs:593`).
- The page builds `` `${BOOK} ${DFLT_PLACES[WORD_N.get(openPlaceWord) - 1]}` `` for the open word and for its pieces' keys.
- The place is null for a run's card and for `opts.word` (the live line and the exporter).

### S6. A12's 7e clause is red after the build as written

**Evidence (r10)**
- Of call 7e's 5,222 lines, 5,134 name a row of the design's set.
- 88 name rows outside it: 33 UBS name rows and 55 rows that are also a plain meaning.
- Those rows get no `picked_at`, so «each 7e place is in its row's picked_at» fails at 88.
- 7b splits as the design says: 1,251 in the set, 7 name rows, 3 plain-meaning rows.

**What the design must say instead.** Hold the clause only for 7e lines that name a set row; name the other 88 by class.

### S7. Gate class (a) (stands) must follow the source pressed

**Evidence**
- `defaultAtWord` (`zone.html:6085-6108`) prints the pressed source's own line where it has one. It prints STEP's words only under STEP, or where STEP is the second source and the first has no line.
- The gate compares under MACULA, UBS and BDB pressed (`check-same-product-v1.mjs:107`).

**What the design must say instead.** Class (a), «STEP's words whatever the old line was», holds only in the default state. Under a pressed source it is owed only where that source has no line at the place and its second is STEP.

### S8. Gate class (b) does not owe decision 2's hidden pills

**Evidence**
- Widening `SOURCE_SIGN[0]` (`zone.html:3510`) also widens `hasSourceSign`.
- Under «off» the page then hides every «(+) archer»-shaped pill on every card that holds one (`:11562`), not only where it led the line. The design's own figure is 81 readings at up to 7,739 places.
- Class (b) on S2 owes only "the old line's signed reading".

**What the design must say instead.** Class (b) on S2 also owes the loss under «off» of any pill opening with the bracketed sign.

### S9. The gate refuses the two new `--expect` files until it is taught them

**Evidence**
- The gate refuses any `--expect` file whose rule_id is neither the default-picks rule nor the kinds rule (`check-same-product-v1.mjs:103-112`).
- `data/audit-calls/PIN.json` has no rule_id today.
- `data/form-of-pills-v1.json` is form-of-pills-rule-v2, which this build does not change. The fold's rule id lives only in the page.

**What the design must say instead.** The gate learns both rule ids, and the fold's rule id is recorded somewhere the gate can read it.

### S10. Question 12's reach is about five times the figure carried

**Evidence**
- On the ship's store at rest, the fold as stated reaches 805 resolved pointer pills at 664 keys asked by the 39 books, 56,455 word-key asks, before the place gates (r11). Over all keys it is 806 at 665 (r5).
- The design carries the lane's 153 at 14,995 places.
- No resting line prints a folded pointer (r5), so «Lines: 0» holds at rest.
- But the sidecar's o.l is the pointer's own text at 24 surfaces, and the table's line is at 1 key (r5). Where a position makes the line read it, the card would find no pill to open on after the fold.

**What the design must say instead**
- F12 and gate class (e) are stated as rules, not tied to 153.
- The merged pill keeps the pointer's reading key as an alias, so the card still opens on the line.

### S11. Rule ids move without their guards

**Evidence**
- Four checks name zone-gloss-rule-v7 in their GUARDS line:
  - `check-antiquity-tier-v1:3`
  - `check-gloss-whole-v1:5`
  - `check-ledger-divisions-v1:4`
  - `check-page-agrees-with-store-v1:15`
- `zone.html:8023` and `PIPELINE-MANIFEST.md:182` name it too.
- Without edits, `pipeline-manifest-v1` prints v8 as UNGUARDED (`:187-204`) and keeps v7 as a live rule.

**What the design must say instead.** Name these files in commit 6, and do the same for the witnessed rule v2, strike-rows v7 and the follower v2.

## Notes

- **N1.** W4 and W5 pass on today's tree, since nothing has been retexted yet. «Every law fails today» does not hold for them.
- **N2.** The derive tool should read the ledger's picks through the row-strikes follower, as every facts tool does (`round-v1.sh:59-66`). Today it changes nothing: the ship-4 strike rounds re-key or strike no M18 row; they only land 106.
- **N3.** Scope and search for the UBS entry:
  - The UBS entry falls under the kinds record's scope, the 39 books. Decision 1's sign rule runs everywhere. The design should say so.
  - The search drops the 2,649 rows everywhere (`bake-search-index-v1.mjs:133-136`, `:237`), while the cards keep them at rest at the question-10 places. Say which of the two the search follows.
- **N4.** Ship 6's commits (2–4) come before ship 5's, and both touch `check-audit-calls-v1` (A9 against A10–A12) and `check-default-picks-v1` (D2 against D3/D21). To drop ship 6 cleanly, as §0 allows, put its commits last.
- **N5.** `data/route-store/index.json` has no "facts receipts" key. Each facts tool writes its own (`row_entries`, `name_rows`, `sense_openings`). Name the UBS tool's key.
- **N6.** The design left the commentary sidecars unmeasured. 21 sidecars hold 719 table keys whose line opens with the sign, and 627 words under their units read those keys (r15b). That is an upper bound on the commentary lines rule v8 moves.

## Held when I tried to break it

- **Call 4's counts reproduce exactly.** A rerun of the designer's `call4-on-ship-records-v1` gives the same output: 353 unchanged / 26 credit only / 402 replaced / 3 appear / 1 in a run, so 432 lines move. The only stands place where the line is the place's own pieces is Lamentations 4:3:10, a pair the design treats (r1).
- **The signed-lines census reproduces:** 1,885 lines plus 6 bracketed; Tikkunei Zohar 309 keys, none left signed.
- **Call 3 reproduces on the ship's records (r9):** 2,158 run lines; 2,153 fall over 4,353 words; 5 are held over 10 words, the ones named.
- **A11 can hold (r14):** all 2,158 run lines are v181 lines, the 5 held runs carry v181's own text and credit, and 19 v181 lines already read word by word.
- **The halves change** reaches only II Samuel 6:10:16 among all 1,015 places where STEP's words may print (r13).
- **The UBS join** reaches all 21,732 M18 rows (r4). The set leads none of the 788 single-word resting lines credited to M18 (r12).
- **The v187 seam census** reproduces 11: 8 done, 3 settled (r8).
- **Every leader that goes through `readingPool` moves with no other edit,** as the design says: the table and its deltas, `gloss_m` alt, the license columns, `leadersAt`, `rowLeader`, and the cites. The page's sort order agrees with the class-first license columns, and `firstUnder`'s (signed, rank, at) agrees with the card under «m» and «x».
- **The `--receipt-only` pass converges.** The index reads the records only for whether a line stands over a word, and calls 3 and 7 change that nowhere the index looks.
- **The gate's S2 excuse** at `check-same-product-v1.mjs:495` is as the design says, so its tightening is needed.
- **The design's fix at `bake-default-picks-v1.mjs:469`** is right: it prints the raw `found[0][1]` where `:447` prints `routePrinted(found[0])`.
- **The page line numbers** the design cites match add346d851.

## Scripts and outputs

Everything is in `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-code/`. Each output sits beside its script.

| file | what it counts |
|---|---|
| r1-piece-credit-stands.mjs | stands places whose ship line is credited to the place pieces (.out.jsonl) |
| r2-other-leaders-signed.mjs | signed hg words, witnessed columns, table, columns, alt and sidecar leaders on the ship's zones |
| r3-signed-leaders-by-shape.mjs | signed leaders split into single renderings and whole lists |
| r4-ubs-join-coverage.mjs | how many M18 rows the UBS route file reaches |
| r5-pointer-fold-lines.mjs | question 12's fold over all keys, and folded pointers on lines |
| r6-witnessed-signed.mjs | witnessed rows whose every reading is signed |
| r7-licence-columns-signed.mjs | license-column leaders still signed after rule v8 |
| r8-m1b-seams-rerun.out.json | rerun of the v187 reader's m1b-seams.mjs on words-back-final-v1.jsonl |
| r9-runs-fall.mjs | run lines that fall or are held under call 3's rule |
| r10-7e-against-set.mjs | 7b and 7e against the UBS set |
| r11-pointer-fold-asked.mjs | question 12's fold on keys the 39 books ask |
| r12-ubs-set-lines.mjs | resting lines only the UBS set prints |
| r13-halves-step-words.mjs | how far the halves change reaches |
| r14-v181-against-records.mjs | v181's run lines against the ship's records |
| r15b-commentary-signed-words.py | signed table keys and the words reading them in the commentary sidecars |
| rerun-call4-on-ship-records-v1.out.json, rerun-signed-lines-on-ship-v1.out.json | the designer's two scripts rerun; outputs identical |