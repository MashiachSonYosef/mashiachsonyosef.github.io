# Ship 14: mends that wait on no one

Page lane, 21 November 2026, after ship 10b went live (`main` c1ed776b65). Tree `S/s13`, branch `ship14`; live for comparison `S/old` on c1ed776b65; scripts `S/s18w`.

Not shipped yet. This note is kept as the work goes.

## What it is meant to carry

- The readers' page faults of 10 November that were never proven (task 77, and the card's move on a phone from task 130), proven again on today's page first, then mended where they still stand.
- The corpus lane's source ledger named at its v2 address in `data/source-corpus-v1.json` (told to Moses on 21 November; `tools/patch-01-source-ledger-v2-address.py`, written and not yet applied).

Not in it unless time allows: task 150 (the door's typed counts) and task 151 (the read words' pieces laid first in the round).

## Task 131 is closed: it no longer reproduces

The fault (filed 15 November): a pointer pill pressed on a split word printed the pointer map's form on the line, and the section laid again printed the row's raw text instead.

Read again on c1ed776b65 at the place it was found, Amos 1:1 «before» (`tools/pointer-relay-2.mjs`, `measures/task-131-pointer-pill-relaid.txt`):

- At rest the pointer pill is not on the card: its dictionary rests shut since the twelve (ship 9).
- With the shut dictionaries opened (`&kinds=open`), the pill «face (plural construct state form of …)» pressed on the core piece prints «face» on the line; with the joined words switched out and back the line still reads «face». The same under UBS.

So nothing to mend. `check-ruled-equals-first-paint-v1`, the check that first met it, is clean in ship 10b's suite.

## The readers' faults, proven again

Three read-only helpers, one per reader's report of the page script, each told to decide in a browser and to answer «gone» as readily as «still present» (`tools/readers-again-brief.md`). Their reports land in `readers-again/`.
