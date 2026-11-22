# Ship 15: STEP's letters land on English Wiktionary's rows (relay v211)

Page lane, 22 November 2026. Tree `S/s13`, branch `ship15` from ship 14 as shipped (`main` 571e4a449a); live for comparison `S/old` on 571e4a449a; scripts `S/s19w`. Not shipped yet; this note is kept as the work goes. The plan it belongs to: `wip/2026-11-22/the-relays-v210-v217/PLAN.md`.

## What it lands, and why now

Relay v203's list gave the rows of English Wiktionary the numbers (n), STEP's letters (t) and BDB's entries (b) of the Bible dictionaries' entries their own pointed head form meets. Ship 11 landed the numbers only. The letters were held because of 16,273 lines giving t, 4,380 gave fewer letters than STEP's own rows carry for the same numbers, so they would have held back rows of the same word: English Wiktionary's «father» would have carried H1G alone, and STEP also tags H1H «(Huram)-abi» and H1I «father of».

I asked (ask A of 20 November) whether TBESH itself says which of its letters are one word. Relay v211 answers from TBESH's own first and third columns: two letters of one number are the same word when TBESH files them under one word (column 1) or ties them (column 3). It widens t so that no line holds back a letter of the same word as a letter v203 gave: 1,946 lines gain 2,769 letters, «father» gains H1H and H1I. After the widening, no line holds back a letter with no sign or a letter of the same word.

So the letters now part only another word, which is what ruling 6 of 13 November means them to do. They land.

## What waits

- **BDB's entries (b)** wait for relay v218, which reissues v203 and v204 with relay v212's two answers («forget» off five lines; the 231 lines under the keys of «to» given their entry). Then b lands once.
- **The 22 name marks of relay v213** land with v218 too. Moses's call is to land them now; I hold them one relay because at Ezekiel 27:6 the «Kittim» line would read «Chittim» again until v218 answers the place list. Landed together, that line moves once.

## Built

- `tools/patch-01-entries-pin-t-v1.1.py`: the pin's list entry for English Wiktionary is v211's list, rule, receipt and answer (`data/row-entries/entry-ledger-tbesh-letters-v1/`), read at store 88fec6d59737, landing n and t. v203's entry is kept whole under `amends`. Every file is the bytes v211's letter names.
- `tools/patch-02-entry-gate-letters-on-a-list.py`: `check-entry-gate-v1` E2 held STEP's letters to TAHOT's and TBESH's rows; a row of a source whose list of the pin lands t may carry them too. The entries tool's own words on lists say the same.
- `tools/patch-03-pipeline-doc.py`: `PIPELINE.md` says so.

## Rehearsed, then run

Rehearsed without writing (`--dry`): 54,261 lines, every one finds its row, none unexplained; **16,273 rows move**, each gaining its letters. b is counted on 53,092 lines and not written. v204's list moves nothing.

Run as the first step of the pass (`measures/store-entries.log`): exit 0, 13 s. The round, every resting line against live, the gate and the whole suite follow in the same chain (`S/s19w/chain.sh p1 suite1`, begun 05:28 UTC).

## What I expect at rest

English Wiktionary rests shut on every book (it is not one of the twelve), so no line under a word should move. A card's count of what it holds back may change where a row is now of another entry by its letter. The gate says.
