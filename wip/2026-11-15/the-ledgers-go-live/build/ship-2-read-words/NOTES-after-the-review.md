# Ship 2 (v192): the independent reviewer's two findings, worked (15 November, afternoon)

Tree: scratch `b4c`, branch `ledgers-build-ship2`. Now at 9ea59d5940, on top of the builder's b9da2703b7. Scratch, scripts and logs: `v64/ship2/fix/` (logs in `fix/logs/`). Port 8933 was mine for a server of the tree, with the shipped page and the commit's page answered from copies. It is stopped now. Port 8934 was not used.

The state the work ran on: the 15 zones and sidecars of the shipped main (46bbbf7d50), taken from git into the tree. Then the apply (`--stamp 2026-11-15`) and `emit-zone-store-v1`. The 15 applied zones are byte for byte the builder's rehearsal table (`fin/sha-after-apply.txt`) and the reviewer's `z-after` copies.

## Finding 1, II Samuel 8:3: fixed, 9ea59d5940

### Reproduced

On the page, `fix/logs/probe-ii-samuel-8-3-commit.out`:
- The written form «(בנהר)», with the commit's page over the applied zones: `__cardEntry "H5104G"`. Its readings ask H5104G and withhold 2, «2 of another entry than H5104G, withheld».
- The shipped page over the applied zones does the same. Its tagHolder takes the first tagged region, which is read word 1.
- Over the shipped zones, both pages ask nothing.

In the store, under בנהר: 3 rows. Two are M4 «at/ [the] river of» and «in the/ river», with n [H5104, H9003] and t [H5104H], so the gate calls them «other». The third is of the read word's own entry.

The data side, `fix/dump-places.mjs` over all 28 places on the applied zones: II Samuel 8:3 is the only place where a written region's key equals a read word's key. The written half there is one region, and it carries no tag.

### The fix (zone.html)

`tagsAt`, the open form's tags, never answers with a read word of a read form of several words. `readWordOfSeveral` is now declared before it. `coreTagsAt` is untouched.

Function level, `fix/tagfns.mjs`:
- Shipped page against the mended page, over the 15 shipped zones: 0 differences in 418,602 asks.
- Commit's page against the mended page, over every zone on disk (48 zones, 761,169 asks): 56 differences.
  - All 56 are tagsAt, at the 56 tagged read words' keys. coreTagsAt shows 0 differences.
  - Only one of those keys is a key a card stands open on: II Samuel 8:3's written form. A read word of several never stands open.

### The new law (check-read-words-v1 R8)

R8: the written form of every listed place is asked only what the written half carries.
- The card is asked the written half's own tags: none where it carries none or is written as several words.
- Each block of it that is a written word withholds exactly what the gate says under that word's own tags.

Red and green runs (logs under `fix/logs/`):
- Commit's page over the applied zones: R8 red, 2 faults, both at II Samuel 8:3 (the card asked H5104G; its block withholds 2). R1 to R7 green.
- Shipped page over the applied zones (the builder's «page reverted» state, rerun): R7 red (55), R8 red (the same 2).
- Page mutated so no word written one way and read another is asked an entry: R8 red, 8 faults. They fall at the 4 places whose written half carries the lattice's tags: Deuteronomy 33:2, Jeremiah 6:29, I Chronicles 9:4 and Psalms 55:16. Page put back from the commit.
- Mended page: R1 to R8 green.
  - R8: 28 written forms (4 tagged, 24 not), 38 written-word blocks (11 with no row under their key), 17 rows withheld under the written words' own tags.
  - R7 as before: 56 read words on 28 cards; 1,073 rows withheld, 1,563 stand.

Probe after the fix: the written form's card asks nothing and withholds 0. The read form's blocks are unchanged: בנהר H5104G withholds 2, פרת H6578 withholds 28.

Lint: the check has no finding before or after. The page holds at 4 · 175 · 9 · 1 · 2.

## Finding 2, Psalms 10:10: real, left for the lead

### Reproduced

- **The line.** At rest it reads «common + broken», credited M9 M14, before and after the ship.
- **The card.** On the read form's card, the block חל asks H2428A, withholds 50 of 60, and opens on «surrounding». Block כאים asks H3512B, withholds 1 (M3 «helpless»), and opens on «broken».
- **Before the ship** (shipped page, shipped zones): both blocks ask nothing, and חל opens on «common».
- **The withheld rows.** Every row that reads «common» carries n H2455 and is called «other» under H2428A: M17, M9, M14 «common»; M5 «commonness»; M46 «profaneness | commonness». The 10 rows kept carry no facts.

### Why the line is ungated

The sidecar grades no read word of several, so `latticeStore.grades[word.s]` is absent. With the pieces held, the line falls back to the zone's table reading under the key. The entry is never asked.

### Why it is left

Plan 4.2 rules this state: the tags land, the pieces are held until put-back 35, and the line count is «19 with Psalms 10:10 held». Any remedy changes the plan's figures. That decision belongs to the lead or the owner.

Measured options:

| Option | Tags | Rows withheld | Rows that stand | Other effects |
|---|---|---|---|---|
| (a) Hold both tags with the pieces | 54 | 1,073 − 51 = 1,022 | 1,563 − 4 = 1,559 | The pin entry must hold tags as well. The apply's dry-run line, R3, R5 and ship2-steps.sh change from 56 to 54. |
| (b) Ship as planned | 56 | 1,073 | 1,563 | Tell the owner. |
| (c) Hold only read word 1's tag | 55 | 1,023 | 1,563 | Read word 2's line «broken» is of its own entry, so it does not disagree. |

## The builder's proofs, rerun on 9ea59d5940

- **Pins.** 5 of 5 byte for byte the relay's. sha256 and bytes are as the pin, the letter and plan 4.2 give them.
- **Apply.**
  - Dry: 57 lines, 28 places on 15 zones, 56 tags; 13 places to lay (41 pieces); 14 tied (36 pieces); Psalms 10:10 held; strokes 16 of 16.
  - Real: 15 zones, the rehearsal's bytes.
  - Again with the same stamp, then with 2026-11-16: «nothing to write», same bytes.
- **Projection.** The round's zone tools on II Samuel, from the commit's zone: zone 981eed81acaa and sidecar c2ad54367eb8, byte for byte 46bbbf7d50's. The other 14 books were not rerun: no zone tool reads zone.html, and 9ea59d5940 touches only zone.html and the check.
- **Before lines.** The old page over the shipped zones, for II Samuel and Psalms: each section equals the shipped record. The 15 records the comparison reads as shipped (`fin/lines-shipped/`) are 46bbbf7d50's bytes.
- **After lines.** The mended page, 15 books.
  - All 15 records' sections equal the builder's `fin/lines-after/`. Only `read_off` differs.
  - Word by word against the shipped records: 230,597 entries, 13 moved, all at listed NEW places, 0 elsewhere.
  - At the NEW places, 21 of 29 read words change by the list's pieces and 19 on the page. TIES places: 0 of 14 move. The plan's examples hold.
- **check-entry-gate-v1** (ledger v1.1, ledger-was, lattice; served narrowed to the 15 books, then put back): E1 to E14 green, output line for line the builder's. E7 counts 208,875 places and 56 read words.
- **Single checks**, all green:

| Check | Result |
|---|---|
| check-paseq-place-v1 | P1 to P6 |
| check-kq-carried-v1 | 122 ok |
| check-kq-graded-v1 | 3 ok |
| check-kq-declared-weld-v1 | 11 ok |
| check-disk-gloss-is-the-line-v1 | 15 of 15 books |
| check-default-picks-v1 --node --ledger picks v1.2 | 10 ok, line for line the builder's |
| check-nothing-hand-typed-v1 | 6 ok |
| check-ledger-declared-v1 | 3 ok |
| check-no-import-side-effects-v1 | 2 ok |

  check-kq-presentation-v1 skipped (no bundle here), as before.
- **The two reds the builder called older than this ship. Both confirmed.**
  - check-kq-lead-follows-switch-v1 on Deuteronomy: 124 ok, 1 FAIL K1 «2,2,2,2,2,2,3». The verdict lines are the same on the shipped page over the shipped zones.
  - check-line-reads-the-place-v1 P3 on II Samuel and Exodus: 6 ok, 1 FAIL each. The verdict lines are the same, character for character, on the shipped page over the shipped zones. The other 13 books were not rerun.
- **The round's step, as round-v1.sh writes it:** exit 0. Tags: 0 to write, 56 already. Pieces: 0 to lay, 13 already, 14 tied, 1 held. `bash -n` passes.
- **fin/ship2-steps.sh** on the shipped main's zones:
  - Dry: the plan's figures.
  - `--real`: 15 of 15 the rehearsal's bytes.
  - Again: «nothing to write».
- **merge-tree.** 9ea59d5940 onto 46bbbf7d50 (base ec1c8a6764) is clean: tree 37f833f784, which holds both of this commit's files.

## Left in place

The tree is clean at 9ea59d5940. Every generated path the proofs wrote has been put back to the commit:
- the 30 zone files;
- data/zone-store-v1.json;
- the 15 resting-line records;
- data/serve-gate-receipt-v1.json (narrowed three times).

The lint copies are in `v29/lint/tools/ship2-review/` and `v29/lint/tools/ship2-review-head/`. The scratch page copies and line records have been removed.
