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

### What came back (two of three, 21 November, about 22:00 UTC)

The reports as handed back, with every probe: `readers-again/a/REPORT.md` (the first reader's part of the page) and `readers-again/c/REPORT.md` (the third's). The second reader's part is still being read.

| finding | what a reader meets | on live today |
|---|---|---|
| first reader 1 | a ruling on the written half of a pair is lost at any repaint; a ruling on a plain word spelled like it takes the pair's line | still present (Daniel 2:43) |
| first reader 9 | a ruled written form's chip comes out empty after a repaint | still present |
| first reader 4 | a pair's line and chip ignore the source switches | still present (Ruth: 6 of 12 pairs still name STEP TAHOT with its chip off) |
| first reader 5 | the pointing gate reads the last card's word | the live line is right now; an exported verse is still gated by the last card (Amos 4:10) |
| first reader 6 | run files fetched and thrown away at rest | two of three still asked before the page draws (76 KB on Genesis) |
| first reader 7 | a resting-off default stamped though its source's file failed | still present |
| first reader 10 | a still press on the card's head parks the card | still present |
| first reader 11 | a network fault said as «No book is published on this page yet» | still present; four loaders keep one failure for the whole visit |
| third reader 3 | reset redraws the panel of switches without its dictionary strip | gone; the scribes' marks button is lost after a redraw, behind `&rail=all` |
| third reader 4 | the box on a «whole source» line does nothing | still present, at rest |
| third reader 9 | the panel's line counts ledger ids | still present: «13 dictionaries · 1 off» on a fresh load with every chip on |
| both readers | «only this pointing» lit on a work with no lattice | gone |
| third reader 15 | the search asks for the letters as typed | still present, in a changed shape |
| third reader 6 | a relay leaves an empty bar row and loses an opened commentary | still present, behind `&commentary=on` |
| third reader 13 | two registries never pruned | still present; nothing a reader sees |
| task 130 (1) | a card moves when a second pill is pressed on a phone | still present, and larger: 80px at Obadiah 1:1 word 1 |

### How the mends are being built

Four builders, each in its own light copy of the page (`tools/mk-shadow.sh`: its own `zone.html`, its own `tools/`, the rest by symlink, its own port), so the ship tree stays as shipped until I apply what I have read. Each hands back a patch of exact replacements, a browser check that is red on live and green on its copy, and a report (`tools/builders-brief.md`).

- **pairs:** first reader 1, 9 and 4.
- **load:** first reader 5 (the export), 6, 7, 10 and 11.
- **rail:** third reader 4, 9, 15, 13, 6 and 3.
- **place:** the card that moves (task 130).

I read every patch before it goes on the tree, then the round, the gate and the whole suite as on every ship.

### The second reader's part (back at about 22:25 UTC; `readers-again/b/REPORT.md`)

| finding | what a reader meets | on live today |
|---|---|---|
| second reader 2 | a reading chosen through its witness line is remembered under a key that never matches | still present, at rest (Ruth 1:2 word 3 reopens on another pill) |
| second reader 4 | a failed dictionary shard is asked again with no pause | still present in the concordance: about 1,500 requests in five seconds from one press |
| second reader 8 | the label names TAHOT over MACULA's pieces | gone (0 of the 55 words) |
| second reader 9 | the card's redraw keeps the previous block's withheld notes | still present, behind `&rail=all` |
| second reader 10 | a pick on the maqaf-joined inner block of a spaced run | the line half still present at rest (Genesis 35:7); the other half gone |
| second reader 11 | only the first head word bold on a run's card | only with joined words as written |
| second reader 12 | a let-down run line keeps its small size | the code is unchanged; its visible form could not be produced |
| second reader 13 | a bare run line keeps its title | only with joined words as written |

A fifth builder, **cards**, has second reader 2, 4, 9, 10, 11, 12 and 13.

Seen in passing by that helper and not examined: with every source switched off, the Genesis 12:8 cell still reads «Bethel» with a license chip. Filed to look at after this ship.

