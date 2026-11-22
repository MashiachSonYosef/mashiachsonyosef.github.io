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

## The five patches, read and put together (21 November, 22:30 to 23:40 UTC)

Each builder's report is kept whole in `builders/<name>/REPORT.md` with its patch and its check. I read every page diff before it went anywhere.

| builder | findings | replacements in the page | laws (red on live, green mended) |
|---|---|---|---|
| rail | third reader 3, 4, 6, 9, 13, 15 | 15 | 6 |
| pairs | first reader 1, 4, 9 (and 1's sibling at Deuteronomy 33:2) | 11 | 4 |
| place | the card that moves (task 130) | 3 | 1 |
| load | first reader 5, 6, 7, 10, 11 | 16 | 6 |
| cards | second reader 2, 4, 9, 10 (by half), 11, 12, 13 | 11 | 7 |

- **Stacked in that order** on an integration copy first. Every replacement was found exactly once on top of the others, so no two patches touch the same text. The stacked page holds no Hebrew letter and no non-ASCII character the shipped page lacks. All 24 laws hold on the full stack (`measures/full-stack/`).
- **On the ship tree** the same five patches give the integration copy's page byte for byte (`zone.html` 6875eafc24174f3e).
- **One repository law is amended with a mend:** `check-dictionary-kinds-v1` K4 held the panel's count line to the ledger ids off, which is the very line the third reader's finding 9 reports. It now counts the chips a reader sees off (`builders/rail/patch-check-kinds.py`).
- **The five checks are the repository's now** (`tools/adopt-checks.py`): `tools/check-readers-faults-rail-v1.mjs`, `-pairs-`, `-place-`, `-load-`, `-cards-`. Each serves the tree itself, or reads another build with `--base` or `SERVE_BASE`. All 24 laws hold on the ship tree (`measures/adopted-on-the-ship-tree/`).
- **Found by the pre-flight:** `check-scope-derived-v1` forbids a check naming a work by a zone's path or by a slug of the plan, and the load check did both (Genesis; Amos's bin). The check now asks the served run indexes for the first book both list (`tools/patch-02-load-check-derives-its-works.py`). I did not loosen the law.
- **The source ledger's v2 address** is in `data/source-corpus-v1.json`: one line changes, the address; the hash and every count are the same.

What a reader will notice at rest: the panel's line no longer says «1 off» with every chip on; a card opens at its word and stays there when a pill is pressed; a book page asks for two files fewer before it draws. No line under a word and no card's readings are meant to change; the gate says whether that is so.

Left for the owner or for later, from the builders' worries:

- A pair whose reading's carriers and its alternate's are all switched off goes bare, unmarked (pairs).
- Finding 7's mend repairs nobody already stamped; that needs the record of defaults' version moved (load).
- The second reader's finding 10 is half closed: a division pressed with nothing picked still leaves the line word by word (cards).
- A dictionary opened from «Shut at rest» and then switched off is counted by neither of the panel's lines (rail).

## The round, the gate and the suite

- **The round** (23:38 to 00:19 UTC, `measures/pipeline-first-pass.log`): every step exit 0 on page `6875eafc24174f3e`.
- **Every resting line against live** (`measures/lines-diff-against-live.json`): 0 entries move. Nothing at rest moves, as meant.

### The gate's first run went red, and the fault was the gate's (00:19 to 00:30 UTC)

S2 held: 54 cards, none differing. S1 failed with **0 lines differing between the builds** and 8 lines called «not as owed», all under UBS pressed: Amos 5 «Bethel», Nehemiah 7 «Pahath-moab» and «Bethlehem». Each is a unit's one line, which live has printed since ship 10b and this tree prints the same.

Why: ship 10b taught the gate the unit's one line as a *move* (ship 13 printed the words apart). Now both builds print it, nothing moves, and such a word fell through to the older law, which holds a reading across words the source does not read whole to the line as it rests. Neither build prints that line there.

The mend (`tools/patch-03-gate-spans-stand-on-both-builds.py`, the gate alone): where both builds print the same line at a word of a unit the source's own data gives, and the new build prints it at every word of the unit under the source's credit, the line stands as owed and is counted. The gate is running again.

### The suite did not start, and why

The scripts for this ship were made by copying ship 10b's through a filter, which left them without the mark that lets them run. The two lanes of the suite are started by name, so neither started and the wait behind them never ended; I found it two hours later when the wait's own limit ran out. Nothing was lost but the time. The mark is set, and the suite starts when the gate is clean.

### The gate's second run is clean (02:22 to 02:34 UTC, `measures/gate-second-run.log`)

S1 and S2 hold. 30,945 lines compared on 18 pages under every switch both builds carry: 0 differ, 0 moved. 26 lines stand as a unit's one line on both builds, counted by the mended law. 54 cards compared, none differing.

The whole suite began at 02:34 UTC, both lanes running this time.

