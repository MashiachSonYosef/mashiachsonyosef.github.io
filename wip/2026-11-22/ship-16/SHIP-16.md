# Ship 16: the translation tables return under the source ledger v1.1 (relay v210)

Page lane, 22 November 2026. Built in the sandbox `S/s12` (branch `ship16` from ship 14 as shipped, `main` 571e4a449a) by a helper, from the brief `S/s20w/BRIEF.md`; the one script that applies it is `S/s20w/apply-16.sh <reader> <moment prefix> <log dir>`. Not shipped. It goes on top of ship 15, with its own round, gate and suite. The plan it belongs to: `wip/2026-11-22/the-relays-v210-v217/PLAN.md`.

## What it lands, and what it does not

Relay v210 corrects relay v207, which ship 12 had cut to PanLex, the translation tables and Harkavy, and held.

- **Lands:** the translation tables' rows the source ledger v1.1 admits row by row, by English Wiktionary's own language field: in the own-language list v1.1 the lines of M78 (114) and M103 (12), 126 lines. Every one counts as Aramaic (Aramaic arc 86, Jewish Babylonian Aramaic arc 23 and tmr 15, Aramaic arc-bib 1, Jewish Palestinian Aramaic jpa 1). M78 and M103 are re-admitted to the store's index for those rows alone.
- **Held, with their reason:** PanLex's lines of the same list (M24 3,329, M82 615). The ledger admits them row by row too, but at rest on the Tikkunei Zohar 20 of them print «wolf» where the Zohar reads «of the father», which waits on the Zohar's prefix split. They stay struck; each line is recorded as not landed, held with its source, with that reason.
- **Out:** Harkavy (withdrawn whole by v210, refused by the owner on 1 and 6 September); the Bible dictionaries list (waits on the owner). Neither is pinned.

## Built (the helper's tools, `S/s20w/tools/`)

- `pin-add-send-back-v1.1.py`: the landings pin takes the v1.1 list (kept gzipped), its rule and receipt, every file the bytes v210's letter names, with `held_sources` naming M24 and M82 and the one reason.
- `make-readmission-record-v1.1.py`: the re-admission record returns M78 and M103 and holds PanLex. 47 sources stay struck: PanLex 2 (held), Harkavy 12, the Bible dictionaries 19 (as ship 12's record has them), and 14 no relay names.
- Patches, each exact replacements: 16-01 the new clause in `derive-landings-v1` (a line of a held source goes to the not-landed list with its own kind and the pin's reason, and nothing of it lands); 16-02 `check-landings-v1` G5 accepts that kind only where the pin holds that source with that reason, every line of it is held and none lands; 16-03 the re-admission tool and its check R1 count held sources; 16-04 the source record emitted from the ledger v1.1 (refusing any other bytes), and `check-source-corpus-v1` L2 taught BY_ROW (a BY_ROW witness's served rows stand only where `admitted_rows` names them); 16-05 the kinds (the translation tables' key joins its family, a word list, shut at rest; the version moves to 2026-11-22a); 16-06 the ledgers' manifest (the translation tables' key excluded); 16-07 PIPELINE.md.
- `store-steps-16.sh` (from ship 11c's, on the round's environment) and `rehearse-landings-16.sh`.

## The build's run on the sandbox

- Store: 88fec6d59737, 653,227 rows, 122,542 keys → a41bfa5c8287, 653,353 rows, 122,601 keys. The store steps after the landing moved nothing (each tool once more, dry: nothing left to write).
- The index: 146 → 148 sources.
- Landed: 126 rows under 120 keys, 59 keys new; 125 into the hole the strike left, none found its hole taken, 1 had no rank.
- Not landed: 3,944, every one held with its source (M24 3,329, M82 615); none printed by its own source.
- The source record: 121 witnesses cited, 0 refused, 2 judged row by row (M78 114 rows served, 114 named; M103 12 and 12).
- The strike tool, dry: 148 → 148 sources, 0 rows struck.
- From a clean main and from the sandbox as given, the same tree (the tools ship 12 had already patched are skipped by their marks).

## Checks on the sandbox

| check | result |
|---|---|
| check-readmission-v1 | R1 to R4 ok |
| check-landings-v1 | G1 to G5 ok; a deliberate test (the pin's reason for M82 altered) failed G5, then was undone |
| check-language-admitted-v1 (it reads the strike tool) | ok |
| check-source-corpus-v1 | L1 to L3 ok; a deliberate test (an M78 row `admitted_rows` does not name, put in a shard) failed L2, then the shard was restored |
| check-ledger-declared, check-no-import-side-effects, check-nothing-hand-typed, check-scope-derived | ok |
| check-lane-state-v1 | S2 and S3 fail until the round's records step writes the lane state; written as the round writes it, all 13 pass |
| check-dictionary-kinds-v1 | K1, K2, K4 (its browser law, on a free port), K6 ok; K3 and K5 fail until the round stamps the zones, sidecars and resting lines under the new kinds version |

## What I caught on reading it, and sent back

The page's «language» shelf (and its mirror in `gloss-m-v1`) knows ARAMAIC and BIBLICAL; any other value shelves as «Hebrew in general». So the translation tables, all of whose rows are Aramaic, would have been shelved under «Hebrew in general» with a «+ Aramaic» tag. The mend, derived and not typed: the source record writes what a BY_ROW witness's admitted lines count as, and a BY_ROW witness whose lines all count as Aramaic shelves as Aramaic. The era orders already treat BY_ROW as not the Bible's, the same as ARAMAIC, and stay as they are.

## What moves, to read after the round

A read-only probe (`S/s20w/logs/probe-unrested-lines.json`) found 22 keys whose lines the returning rows can change: on the Tikkunei Zohar 3 keys at 34 places («throne» 33, «bed» 1, as ship 12's trial 2 found), and on the Targum sidecars 19 keys bare today that gain a translation-table reading at about 19 places («honey», «bed», «hand», «threshing floor», «co-wife», «plummet», «zaatar», «necromancy»). Ship 12's comparison did not count the Targum lines. Each is to be read after the round, before shipping.
