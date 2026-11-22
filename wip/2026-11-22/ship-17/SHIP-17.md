# Ship 17: the spelling bridge's pieces at the other places (relay v214, bridge v1.1)

Page lane, 22 November 2026. Built in the sandbox `S/s11` (branch `ship17` from ship 15 as shipped, `main` b0f147b6b0) by a helper, from the brief `S/s22w/BRIEF.md`; the script that applies it is `S/s22w/apply-17.sh <reader> <log dir>`, which applies on main and on main with ship 16. Not shipped; it goes after ship 16, with its own round, gate and suite.

## What it lands

Ship 11d laid bridge v1 at the 206 places of the class STEP_WRITES_OUR_SPELLING, each piece worded by its form row. The other places with new pieces had no words as STEP writes them, so they were held. Relay v214 gives, on every piece, `english_tahot_as_written`: STEP's part of its Translation column, byte for byte, brackets kept. Every file is the bytes v214's letter names (eleven, each hashed).

- **Laid now:** the places of `use` NEW_PIECES not of that class (THROUGH_ONE_LETTER, SAME_LETTERS), each piece worded by its part as STEP writes it with the end spaces off. Before writing, the tool proves on every laid piece the letter's section 2: the marks off give v1's words.
- **Not laid:** the 42 places whose pieces carry STEP's «}+» tag (bridge v1.2, relay v218, mends it); 17 places that are pairs (the tool lays plain words only); the places beside the lattice's own pieces; the places with no pieces; and, after my reading, call 4's bare places (below).
- **The 206:** STEP's part as written, trimmed, is their form row's words at all 206, byte for byte. At 183 of them the zone keeps the space after the stroke, which the page trims, so nothing shows; they are left as they are.
- No tag is written, as in ship 11d.

## The first build, read line by line

941 places laid (the 206 and 735 new: THROUGH_ONE_LETTER 729, SAME_LETTERS 6), 1,740 pieces in 36 zones; run twice it writes nothing. At rest, 930 of the 941 lines stay exactly as they are: at 724 of the new places STEP's own reading already stands (call 4), and the page prints it before the place's pieces, the same words with the same credit. The card gains the place's reading.

**11 lines move at rest** (`S/s22w/logs/lines-that-move.tsv`, every laid place read on the page before and after):

| place | live | with the bridge | |
|---|---|---|---|
| 2 Kings 9:25 word 4 | «captain» (Strong's concordance list) | «officer + his» | right |
| Isaiah 56:10 word 1 | «behold» (Strong's concordance list) | «watchmen + its» | right; live is wrong |
| Proverbs 27:20 word 2 | «and + it will perish» (STEP's row) | «and + destruction + its» | right |
| Isaiah 27:2 word 4, Job 6:21 word 4 | the same words | the same words | credit only |
| Psalms 44:15, 57:10, 108:4, 149:7 | bare | «not + peoples» / «not + nations» | **wrong**: the word is «among the peoples / nations» |
| Psalms 102:4, Job 18:15 | bare | «like + a hearth», «because + not + [belonging] to + him» | right in sense |

The six bare words are call 4's « | » places, which the house holds bare until the corpus lane says how STEP reads them. The bridge must not lift that hold by another road, so they are held as one more class, found from the record the hold reads (sent back to the helper). With them held, 5 lines move, all right.

## Call 4's bare places held (the build as it goes to the round)

The pin's new entry `held_with_call_4` points at the audit calls' pin: call 4's landing still holds the class «STEP's words hold « | »» and names its list, `call4-steps-reading-stands-v1.jsonl`, which is read only as the bytes both the audit calls' pin and the default picks' pin name (the bake reads the same list). The rule is the bake's own: no piece is laid at a place whose STEP's words hold « | ». **6 places**: Psalms 44:15, 57:10, 102:4, 108:4, 149:7 and Job 18:15. When the corpus lane answers call 4 and that class leaves the landing, the same rule lets them in (the pin is then made again by its script). All 55 places call 4 holds are bridge places; the 46 SAME_LETTERS places with new pieces are among them.

- **Laid:** 935 places (the 206 and THROUGH_ONE_LETTER 729), 1,726 pieces on 36 zones. **Not laid with new pieces:** 65 (42 «}+», 17 pairs, 6 call 4).
- `apply-17.sh` on main b0f147b6b0 and on main with ship 16, twice each: the second run writes nothing; the two trees' outputs are the same bytes but for `PIPELINE.md`, where they already differed.
- `check-spelling-bridge-v1` B1 to B6 (B6 new: the words as written on the zones, by its own reading of the two lists) on a copy re-pinned and with the moving books' lines recorded again; `check-line-reads-the-place-v1`, `check-piece-store-v1`, `check-read-words-v1`, `check-entry-gate-v1`, `check-nothing-hand-typed-v1`, `check-no-import-side-effects-v1`, `check-ledger-declared-v1`: pass. Each changed law failed once on a deliberate fault (the new one: pieces laid by hand at Psalms 44:15 fail B3), each put back byte for byte. The gate's expectation, its own code run on the new pin, owes a line at all 935 and names no place.
- **5 lines move at rest, all right** (`lines-that-move-sandbox.tsv`): 2 Kings 9:25 «captain» → «officer + his» and Isaiah 56:10 «behold» → «watchmen + its» (both were Strong's concordance list), Proverbs 27:20 «and + it will perish» → «and + destruction + its» (was STEP's row); the credit only at Isaiah 27:2 and Job 6:21. Nothing appears at a bare word.

Left as they are, and why: the rule id keeps its words, though «and STEP names our spelling» now names only the 206's class (no house rule moves an id for a widening; `PIPELINE.md` says so, dated); at 724 places STEP's reading stands before the place's pieces (call 4), so the pieces show on the card and not on the line, which is the page's order and not this ship's to change.

The round's scripts: `S/s23w` (from ship 16's, with `apply-17.sh` as the first step).

## On the real tree (S/s13, ship 16 as shipped, 36e111edc2), 11:32 to 12:13 UTC

`apply-17.sh` first (B4 waited for the round, its faults the 5 lines that move), then the round, the form-of record, the lines, the chain books, the door and the switches page: every step exit 0 (`measures/pipeline.log`, `measures/apply.log`).

**Every resting line against live: 5 move, exactly the five read in the sandbox** (`measures/lines-diff-against-live.json`):

| place | live | now |
|---|---|---|
| 2 Kings 9:25 | «captain» (Strong's concordance list) | «officer + his» (the place's pieces) |
| Isaiah 56:10 | «behold» (Strong's concordance list) | «watchmen + its» |
| Proverbs 27:20 | «and + it will perish» (STEP's row) | «and + destruction + its» |
| Isaiah 27:2, Job 6:21 | «delight», «it» (STEP's row) | the same words, credited to the place's pieces |

The gate and the whole suite follow in the same chain.

