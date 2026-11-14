# v191-pointer-map

## Verified

FETCHED AND HASHED (into dl-v195/v191/v2/ledgers/all/pointer-entries/). All 16 files the letter lists came down. Each one's size and sha256 match the letter (16 of 16):
- RULE.md f159f653
- build f5cb6902
- verify 254b4c0b
- against-the-draft.mjs 517a3add
- zone-pills-v1.4.changed.jsonl e5596740
- the-458 63c84847
- naming-changes be5c2b7a
- pointer-resolutions be48b3ca
- receipt d904341a
- verify-receipt 734d2b2f
- against-the-draft.jsonl d5ac4eae
- against-the-draft-receipt 7fbcf646
- two-runs 642de911
- run-ship 46bb947e
- make-relay 9add7f24
- commit-message 3bfba130

The letter's own sha256 (bbecea00…) equals relay_sha256 in ship-v191/RECEIPT-ship.json. No .mjs was run. Every read used python3 -I scripts in my own folder.

Two other lists were read only to check how v191 meets them. Both were downloaded by other groups, and their hashes match their letters: v188 landing-fold-strike-v1.jsonl (c1990493…) and v189 call5-maqaf-keys-v1.jsonl (7c1778fe…).

FIGURES RE-DERIVED FROM THE FILES (all hold):
- Changed lines: 682, all with distinct `line` values from 4 to 3012. By class: FORM_OF 465, MIXED 136, USAGE_NOTE 63, JUDGMENT 18. In 0 of 682 does anything outside form_of differ from v1.3, and key order is the same. 3,015 − 682 = 2,333 lines stand.
- Ruled prints: 464 slots on 456 lines, 73,098 places (summed by line; summed by slot it is 74,067).
  - By m: M13 373, M18 50, M25 28, M11 9, M60 4.
  - At every one of the 464, ruled_print.m equals the line's m_id, served is false, and it never stands beside a served resolution of the same slot.
  - By class, slot and fills: exactly as the receipt gives them.
- The 458: re-derived from v1.3 itself, it is the same set of 458 lines at 58,007 places.
  - In the merged map: 153 served at the line's own key (14,995 places), 5 at the key the pointer names (85 places), 299 ruled prints (42,920 places: 204 under fills=resolved, 95 under first_in_the_sources_order; M13 277, M18 21, M60 1), and 1 unresolved (כפו, 7 places, NO_ENTRY_HAS_THE_FORM).
- Own-key resolutions: 173 slots on 172 lines, 16,236 places. By class: FORM_OF 154, MIXED 18, JUDGMENT 1. By the row's m: M25 160, M11 10, M18 3.
- Rows set by v1.4: 191 (own key 173, key the pointer names 10, key followed to 8). 14 follow a pointer, and all 14 carry named_entry.
- Prefix slots: 35 (USAGE_NOTE 30, MIXED 5), 438 places.
- Named rows: all 2,266 stand exactly once in the page's own route store (pt/reader/data/route-store, store_version 4d1357b26ca5) at key, rank, m and text. All 191 sha16 are right. Only 2 new rows carry the names mark: סכות M25 r25 (line 1730) and חירום M18 r6 (line 2725).
- No resolution or ruled print, at any slot or any key, is the text of a FORM_OF line.

THE PAGE'S BAKE, PORTED TO PYTHON:
- On v1.3 the port reproduces the live data/form-of-pills-v1.json exactly: 1,524 resolved, 616 unresolved.
- On v1.4 with ruled prints it gives 1,982 resolved and 158 unresolved, which equals the receipt's form_of_full_count. It finds 0 MIXED collisions and 0 guard hits.

I also assembled v1.4 (each changed line's leading {"line":N, replaced by {). The result is 3,015 lines, 2,667,023 bytes, sha256 79b26cf230214a903e59edf92793e1f728f4ad4942073018bcdd89b30053f433.

## Landing spec

## v191 — pointer map v1.4 and the ruled print: landing spec

### 0. In one line
v1.4 changes no store row and takes no rank. Land it **before** v189 call 5 and v188, on the store the map was made on (4d1357b26ca5, which is the page's store now). Then land call 5 and v188 with the two adjustments in §4.

### 1. Files to land, byte for byte
Put these in `reader/data/pointer-entries/pointer-map-v1.4/` (the lane's own folder name, beside `pointer-entries-v1/`, which stays as the base):

| file | bytes | sha256 | lines |
|---|---|---|---|
| RULE.md | 20,668 | f159f6531c4e…7bf7421 | |
| receipt-v1.4.json | 65,664 | d904341a8876…372929 | |
| verify-receipt-v1.4.json | 5,037 | 734d2b2f5367…83a4d9 | |
| zone-pills-v1.4.changed.jsonl | 846,913 | e5596740120d…a0c435 | 682 |
| the-458-v1.4.jsonl (for the check's tally) | 566,896 | 63c84847…71856 | 458 |

- The `.mjs` files stay on the store. They are never run here.
- `data/pointer-entries/PIN.json` moves to `POINTER_ENTRIES_PIN_V2`, shaped as `MADE_SPACES_PIN_V2` is: `relays: [v175 base (the current entry, unchanged), v191 {letter …FOR-ELIJAH-v191.md sha bbecea00…, rule, receipt, verify_receipt, changes, the_458}]`.
- It also carries `assembled: {lines 3015, bytes 2667023, sha256 79b26cf2…}`, which is the page's own assembly. Ask Moses to confirm it (put-back 3).

### 2. Tools

**New: `tools/pointer-map-v1.mjs`.** One rule in one place, shared by the bake and the check.
- It reads the base with `readPinnedLines` (the v1.3 pin) and the changes with `readPinnedLines` (the v1.4 pin), and replaces each line by its `line` value.
- It refuses when:
  - a `line` is outside 1–3015 or repeats;
  - any field outside `form_of` differs from the base line (today: 0 of 682);
  - a changed line's `form_of` equals the base's (today: 0);
  - the assembled bytes do not hash to the pin's `assembled.sha256`.
- It returns the lines plus `base_sha256`, `changes_sha256` and `assembled_sha256`.

**`tools/bake-form-of-pills-v1.mjs`** (rule id moves to `form-of-pills-rule-v2-…-a-pure-pointer-prints-the-english-the-lanes-map-carries`):
- **Rulings.** Rulings 5 and 7 are still looked up by the **base** sha (9a532fac…), in `rulingOf` at lines 85–86. They are pinned to v1.3 (`data/rulings/rulings-v1/rulings-2026-11-13-v1.json` n=5, `rulings-v2/rulings-2026-11-13-options-v1.json` n=7), and RULE.md v1.4 §0 says that v1.3 stands wherever v1.4 does not name it. The record's `taken_from` cites both relays and all three shas.
- **Resolution order.** Per FORM_OF line, target slot only, as the bake works now:
  1. `form_of.resolved`;
  2. otherwise, with ruling 7 resting FIRST, `several_branch.first_in_the_sources_order.resolved`;
  3. otherwise `form_of.ruled_print`, when `fills` is `resolved`, or when `fills` is `first_in_the_sources_order` and ruling 7 rests FIRST.
- **Refusals.** Refuse a ruled print whose `m` differs from the line's `m_id`, or whose `served` is not false, or whose `rule` is not `pointer-map-v1.4`, or that stands beside a served resolution of the same slot (0 of 464 today).
- **Record shape.**
  - Served: `resolved:{key,text}`, as now.
  - Ruled print: `resolved:{key:null,text,ruled:true}`.
  - The page reads only `.text` (zone.html 3523, 10708, 13733), so zone.html needs only its comment changed (3476–3494).
- **Guard.** Keep the pure-pointer guard, and widen it to ruled prints at any key. Expect 0 hits.
- **Counts.**
  - Add `resolved_by.the_ruled_print`: 299 (204 + 95).
  - Replace `english_the_store_does_not_serve` (316 / 142) with `ruled_prints {resolved 204, first_in_the_sources_order 95}`.
  - Drop the "NOT DONE HERE" comment (lines 44–48). The owner answered call 8 (OWNER-ANSWERS-2026-11-14.md line 14).
- **Expected output:**
  - 3,015 pills: FORM_OF 2,140, MIXED 568, USAGE_NOTE 185, JUDGMENT 58, NOT 64.
  - 2,140 carried under 1,581 keys.
  - **1,982 resolved**: own words 1,329, first entry 354, ruled print 299.
  - **158 unresolved**: NO_ENTRY_UNDER_THE_LETTERS 82, NO_ENTRY_HAS_THE_FORM 37, THE_TARGET_POINTS_ON_TO_SEVERAL_ENTRIES_SHARE_THE_LETTERS 10, SEVERAL_ENTRIES_SHARE_THE_LETTERS 8, SEVERAL_ENTRIES_SHARE_THE_FORM 7, NOT_SERVED 7, THE_TARGET_POINTS_ON_TO_SEVERAL_ENTRIES_SHARE_THE_FORM 4, THE_TARGET_POINTS_ON_AGAIN 2, THE_TARGET_POINTS_ON_TO_NO_ENTRY_UNDER_THE_LETTERS 1, THE_RESOLUTION_IS_ITSELF_A_POINTER 0.

**`tools/check-form-of-v1.mjs`:**
- **F1** (line 72): accept `resolved.ruled` in place of `resolved.key`.
- **F6** (lines 87–110): derive again through the new module, ruled prints included.
- **New F9.** Each ruled print the record prints must be the lane's `ruled_print.text` byte for byte, with `m === m_id` and `served === false`. Its `file.sha256` must be one of the three the receipt names (f1c363… Kaikki Hebrew, 1ed77f… Kaikki Aramaic, 1686a2… UBS). No row of its source (`index.m_sources[m].key`) may carry that text at any of its `looked_at` keys in data/route-store. Rows landed after 4d1357b26ca5 are counted and named, not failed, until v1.4.1 (§4).
- **New F10.** All 2,266 named rows stand in the store at key, rank, m and text, with sha16 matching on the 191 that carry one. A row that call 5 re-keyed is followed through the row-strikes record.
- **New F11.** Press a word whose pointer pill is a ruled print, found from the zones as F0 finds its words (for example line 139, אחת M13 «one», 321 places). F3 to F5 must hold for it.
- **PIPELINE-MANIFEST** line 55: register check-form-of-v1 as the new rule id's guard. It is listed UNGUARDED today.

**Chain books.** Re-bake with `tools/build-chain-book-v2.mjs`. 212 of the moved pills have places in the 12 chained books (177 keys; Zechariah 103, Hosea 96, Amos 88, Micah 79, …). `check-chain-book-v1` K3 holds them.

### 3. What moves on the page
- **Card pills.** 459 FORM_OF pointer pills move, at 58,017 places.
  - **458 gain an English (58,012 places):**
    - 299 ruled prints (42,920 places): 204 by the named entry, 95 by ruling 7's first entry.
    - 159 served rows (15,092 places): 153 at the line's own key, 5 at the key the pointer names, and מבקשים (12 places). מבקשים's v1.3 «bare infinitive …» was held back by the page's guard; it now resolves to «to ask for, request».
  - **1 changes its English:** ללמד (5 places), from «to-infinitive of לָמַד (lamád).» to «to learn, to study».
  - כפו stays unresolved. It was unresolved on the page before, and the page never printed «kaf, kaph».
  - «hajj» never printed on the page either. החג and חגים now gain «holiday (day on which a festival or celebration is observed)».
- **Nothing moves for:**
  - the MIXED, USAGE_NOTE and JUDGMENT changed lines (217 lines);
  - the 35 prefix slots: v1.3's «Lamed …» and «Shin or sin …» never reached the page;
  - the `also` slots: the bake reads only the target, so 7 FORM_OF also-slot ruled prints and the «bare infinitive» changes on lines 416, 417 and 1271 stay off the page;
  - credits: the pill is the pointer's own row.
- **Lines at rest:** none move. 0 strings in all 40 resting-line files equal a moved pointer.
- **A line can move off rest** where a reader presses a moved pill, or where the page prints a key's lead that is a moved pointer:
  - the default lead of the joined keys ביתלחם (13 books; ruled print «Bethlehem (a city in the West Bank, Palestine, believed to be the birthplace of Jesus)») and בנאדם (Daniel, Ezekiel, Jeremiah; «son of man; human being (literally, son of Adam)»);
  - 487 leads under the reader's CC BY-SA order (gloss_orders.licence_by_sa) in 40 zones, Tikkunei Zohar 35 of them.
- **window.__formOf:** resolved goes from 1,524 to 1,982; keys stay 1,581 and pills 3,015.

### 4. Order against the other relays
1. **v191 first.** It is proven on store 4d1357b26ca5. Land it, bake, check (F1, F6, F9–F11), re-bake the chain books, gate, then ship: commit to main, merge main into gh-pages with the message "gh-pages follows main", push gh-pages. Live check: `window.__formOf.resolved === 1982`, and a ruled-print pill prints.
2. **v189 call 5.**
   - It re-keys ל־ rank 3 M13 «To; the first part of a to-infinitive.» (NO_TWIN) to ל. The map names that row at 18 slots: 9 FORM_OF lines at 5,708 places, among them לו, לך, להם and לכם (see `call5-moves-named-rows.tsv`).
   - The call 5 landing must re-point those 18 references to the rank it gives under ל, as it re-points the default picks. The print does not move; F10 follows the re-key.
   - No other named row is struck or moved by v189 or v188.1, and none is retexted by v187.
3. **v188** (skipping its 48 lines), **with v188.1 pinned to it.**
   - It lands same-source rows carrying the identical English at a key of 17 ruled-print slots on 14 lines, 11 of them page-visible lines of the 458 at 848 places (שמרון «Samaria», רב «majority», מאת «hundred, one hundred», …; see `v188-serves-ruled-prints.tsv`).
   - The print does not move, but RULE §9 line 116 no longer holds. F9 names them until Moses's v1.4.1.
4. **v195.** Its rank note lists v191 among lists that take ranks. v191 takes none.

## Depends on

- v175 map v1.3 as pinned in reader/data/pointer-entries (zone-pills-v1.3.jsonl, 9a532facc2b5b9a92402bcfe44ca387180676ad0683957d0760723ca3ab780d1): v1.4 is a set of whole-line replacements onto it
- Rulings 5 (v176) and 7 (v177) as pinned in reader/data/rulings, both bound to v1.3's sha256. The bake must keep looking them up by the base sha.
- Route store 4d1357b26ca5, the page's current store: all 2,266 named rows are proven on it now
- Ordering: v191 before v189 call 5. Call 5 re-keys the row the map names at 18 slots (ל־ 3 M13 to ל), so its landing must re-point them.
- Ordering: v191 before v188 (and v188.1). After v188, 17 ruled-print slots on 14 lines have a same-source served row with the same English, and need Moses's v1.4.1.
- Chain books: re-bake after the form-of re-bake (212 moved pills in the 12 chained books)

## Moves at rest

Lines at rest: nothing moves. Of the strings in all 40 resting-line files, 0 equal any moved pointer, and the default order prints the place's own reading.

What a line can show off rest:
- the line under a word once a reader presses one of the moved pills;
- the default lead of the joined keys ביתלחם (13 books) and בנאדם (3 books), wherever the page prints a key's lead;
- 487 leads under the reader's CC BY-SA order (gloss_orders.licence_by_sa) in 40 zones.

Card pills: 459 FORM_OF pointer pills move, at 58,017 places.
- 458 gain an English:
  - 299 ruled prints, 42,920 places (204 by the named entry at 20,735; 95 by ruling 7's first entry at 22,185);
  - 159 served rows, 15,092 places (153 at the line's own key, 5 at the key the pointer names, and מבקשים, whose v1.3 resolution the page's guard had held back).
- 1 changes its English: ללמד, 5 places.

Record counts: resolved goes from 1,524 to 1,982, unresolved from 616 to 158, and NOT_SERVED from 323 to 7. The 458 carrying an English the store does not serve become 299 ruled prints plus served rows.

Unchanged: MIXED, USAGE_NOTE and JUDGMENT pills (217 changed lines), the 35 prefix slots, the also-slots, and the credits (ruled_print.m equals the line's m_id at all 464).

Chain books: 212 of the moved pills sit in the 12 chained books, so those must be re-baked.

## Put back to the corpus lane

- The v188 interaction. v188's landing list puts a row of the same source, carrying the identical English, at one of the looked_at keys of 17 ruled-print slots on 14 lines: 48, 622, 805, 985, 1392, 1393, 2917, 1643, 2012, 2095, 2140, 2317, 3007, 3009. Eleven of them are page-visible lines of the 458, at 848 places; among them שמרון «Samaria», which is v188's own example, רב «majority» and מאת «hundred, one hundred». Once v188 lands, v1.4's own stop in RULE.md §9 line 116 no longer holds, and by §4 those slots should resolve to the served row. Please send v1.4.1, made on the store after v188 and call 5 land (the page will name that store_version), with only the lines that change. The list is at v53/v191-pointer-map/v188-serves-ruled-prints.tsv. Letter §8 says classes B and C 'belong with the fold work of v188' but does not say which of them v188 itself serves.
- The v189 call 5 interaction. Call 5 re-keys ל־ rank 3 M13 «To; the first part of a to-infinitive.» (class NO_TWIN) to ל, and the map names that row at 18 slots: lines 33, 34, 970, 1280, 1284, 1285, 1295, 1307, 1313, 1314, 1315, 1321, 1333, 2852, 2855, 2856, 2869 and 2870. Nine are FORM_OF lines at 5,708 places, among them לו, לך, להם and לכם. Call 5's re-point lists (v189 §2) cover only the default picks (40,023 references), not the pointer map. Please add the map's 18 references to call 5's re-point list, or carry the move in v1.4.1 once the page has given the row its rank under ל. List: v53/v191-pointer-map/call5-moves-named-rows.tsv.
- The assembled map has no sha256. The letter (§1, line 7) says to land each line by `line`, but gives no sha256 for the whole v1.4 map and does not say whether `line` stays in the lines. The page's assembly drops the leading {"line":N, from each changed line and puts the rest in place of line N, newline-terminated. That gives 3,015 lines, 2,667,023 bytes, sha256 79b26cf230214a903e59edf92793e1f728f4ad4942073018bcdd89b30053f433. Please confirm it, or give yours, so the pin can name the whole map's bytes.
- A ruling record for the ruled print. Rulings 5 and 7 are pinned to v1.3's sha256 only. The ruled print's authority is in RULE.md alone, and RULE.md §0 (line 7) and the letter (line 3) put «print the English your map's file carries for the pointer's entry» in guillemets as the owner's answer. Those are the page lane's own words (FOR-MOSES-2026-11-14-the-owners-answers.md §3). The owner's words were «just go with your recommendations its fine» (OWNER-ANSWERS-2026-11-14.md line 3), answering call 8 «print the English the corpus lane's map carries» (line 14). Please send a ruling file in the shape of the files of v176 and v177. It should carry the owner's exact words and call 8, name the files it rules (the changed-lines file e5596740… and the assembled map), and say that rulings 5 and 7 carry over to v1.4, so the bake reads all three rulings by the same sha.
- The check cannot read the source files. Letter §1 (line 9) says the page's check 'can hold text to file', but the page has none of the three files: Kaikki Hebrew (55.9 MB, f1c363…), Kaikki Aramaic (3.8 MB, 1ed77f…) and UBS (23.1 MB, 1686a2…). They are not in the reader tree, and listing v2/sources/ on the store finds none of them. Please name their store keys, or send an extract: for each of the 464 ruled prints, the Kaikki JSONL line or the UBS entry, byte for byte, with its own sha256.
- Places leave out joined keys. Lines 370 (ביתלחם, «Scriptio continua form of בית לחם.») and 386 (בנאדם) carry places: 0, yet they are the default lead of the joined key in 13 and 3 zones and appear under the CC BY-SA order. Their ruled prints, «Bethlehem (a city in the West Bank, Palestine, believed to be the birthplace of Jesus)» and «son of man; human being (literally, son of Adam)», print wherever that lead prints. The map's place counts leave these uses out.
- A clarification for §6 (line 61). On the page, the test of 3.1 ran on FORM_OF target slots only, and it held back exactly 1 line: מבקשים, line 1398. Lines 416, 417 and 1271 are also-slots the page's bake never reads; 323, 419, 420 and 713 are MIXED and print their own words. So on the page only מבקשים and ללמד move. This is not an error in the map.
- v195 line 29 lists v191 among the lists that land under a key first and take the next free rank. v191 lands no row and takes no rank.
- Spelling: 'licence' in letter §1 (line 9) and RULE.md §5 (line 71) should be 'license' under the project's American-spelling convention.

## Owner questions

- Letters read as another word, on the card only (the line at rest does not move). Should these ruled prints and the new served resolutions be held back by a gate where the place reads another word, or print as ruled? They are: «happiness» on the pointer pill of אשר (M13 «defective spelling of אושר», under ruling 7's first entry, 5,555 places); «witness» at עד (M18 «read עֵד», 1,394 places); «valley» at בן (M18 «see גַּיְא», 1,756 places). v1.4 also resolves two more בן pointers to served rows at every בן card (1,756 places each): «Benjaminite» (M18 rank 75) and «In (a place or time).» (M25 rank 108, for M13's «Form of בְּ־ … as object»). This is Moses's v191 §8, first bullet.
- Readings that print alike (the page lane's ask 4 of 13 November). On 153 pointer pills at 14,995 places, the pill now prints the same English as a row of the same source on the same card; for example M13's pill «mighty, valiant (plural indefinite form of אביר)» stands beside M25's «mighty, valiant» under אבירים. 160 of the 173 rows it resolves to are M25, English Wiktionary's own 'strict source-explicit linked forms' table, which already resolves the same kind of pointer. 18 of those rows are also divided by their ledger, so the card prints them in parts while the pointer pill prints them whole. Should these be one pill or two?
- Should ruling 7 (the source's first entry) also reach a pointer that, once followed, names several entries? This is 28 FORM_OF lines at 9,827 places, which stay unresolved as v1.3 is written.
- Should a prefix target (ש־, ל־, כ־, ב־ written with a maqaf) name the prefix's own entry where the file has one? This is 35 slots at 438 places, all USAGE_NOTE or MIXED, so nothing on the page moves either way today.
