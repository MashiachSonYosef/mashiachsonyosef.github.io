# The rulings of 13 November, wired — 13 November 2026 AD

Elijah, page lane. The corpus lane (Moses) sent seven relays on 13 November, v172 to v178, and the owner ruled on the eight calls they put: «1-5. agree go ahead» (rulings 1 to 5, relay v176) and «1-3. ok agree» (rulings 6 to 8, relay v177). "The wiring is yours." This file is the record of that wiring, ship by ship. It is added to as each ship lands.

| Ship | What | Rulings | State |
|---|---|---|---|
| A | The unabridged BDB's made spaces close at print (v178); the UBS dictionary's "literally ...; hence ..." pairs are one reading again | 3 | **live**: main `2f403ae430`, gh-pages `f9883c9f35`, deployment run 1357, live check run 55 |
| B | The pointer map v1.3: a pointer names its entry, a reading with English of its own prints its own words, an ambiguous pointer takes the source's first entry; a pressed pointer no longer stands bare on the line | 5, 7 | **live**: main `6657800de0`, gh-pages `2c8ae39529`, deployment run 1358, live check run 56 |
| C | The entry gate, with STEP's letters and BDB's own entries, and the names gate, in one ship (both are asked of the word's place before the pointing); the stems from three more sources follow as their own ship | 1, 6, 8; then 2 | proven in a development copy on all 39 books; in the build tree, in its round (section 3) |
| D | The unabridged BDB's openings of a numbered sense print as a note, not a pill | 4 | not begun |

## 1. Ship A: two changes to the store's slots, no text touched

Of 652,954 rows set side by side with the live store's, 649,530 are the same in every slot, 137 gain the closes slot and 3,287 change the slot that says where they divide (`logs/a-l23-store-rows-compared.txt`, `tools/store-rows-compared.mjs`).

**The unabridged BDB (v178).** 137 served texts hold 186 spaces our own build put where a tag stood; every one closes. A row prints «staff, rod, shaft.» where it printed «staff, rod, shaft .». The lists now come relay by relay: `reader/data/made-spaces/` holds one folder per relay as the lane keeps it (`made-spaces-v1` of v168, `made-spaces-v2` of v178) under one pin, and each list is read with the receipt of its own relay. A source has one list.

**A space that must never close.** The same relay names 750 texts of the unabridged BDB where our build took whole Hebrew words out of the opening of a sense, each leaving one space («often named with , and then»). That space is BDB's words, not a made space. `tools/apply-made-spaces-v1.mjs` refuses a list that would close one, and the check holds that none does. 85 texts stand in both files, and no close falls on such a space.

**When are a source's rows the rows its list was read from?** The tool refuses a count that disagrees with the lane's only while they are. That used to mean "the store is the version the list was read from", which stopped being true as soon as a second rule moved the store. It now also holds when every move since is this rule's own, or when the source's rows hold exactly the keys and texts they held when an earlier run found them so (the index records a sha256 of them, per source). So the lane's counts stay held across the ledger answered anew below, and are only said, not judged, once a row of that source is struck or landed.

**The UBS dictionary's branch B01 (ruling 3).** «literally: to dig (an area); hence: = action by which humans carefully examine an area ...» was two pills since 6 November, and an outside reader read the halves as breakage. The answer is now "whole", with what it replaces written beside it in `reader/data/ledger-branch-answers-v1.json`. 3,288 dividing marks came off 3,287 rows (one row took two steps: «literally: to enlarge one's lips; hence: to open one's mouth wide; hence: ...»). 3,286 rows that were two readings are one, and one row still divides, at its "alternatively" («literally: daughters of song; hence, possibly: ...; alternatively ...»). The marks taken off stood at `;` 3,258 times, `=` 16, `:` 12, `,` twice.

**What moved, measured against the live build** (the round run whole, 40 works, 453,713 words):

- Lines under the words: 3 of 400,242 read otherwise, all in the Tikkunei Zohar (59a word 470, 70a word 408, 140a word 3: «literally: what is torn apart» is the whole pair now). None moved by a closed space (`logs/a-l32-…`).
- Search index: 3,288 fewer route pills (748,847 to 745,559) over the same 646,344 rows (`logs/a-l33-…`).
- Chain books (twelve): 435,246 links at rest to 431,006; 734,372 lifted to 728,474; 232,600 distinct readings to 229,531; words, cards and every other count the same (`logs/a-l34-…`).

**Held by** `tools/check-made-spaces-v1.mjs`, rewritten for the relays, laws M1 to M10 (`logs/a-l30-…`). The lane's own counts are the store's for all three listed sources; for the unabridged BDB, 137 rows close and 52 still print a space before a comma, the lane's 52 (most of them the spaces that stand for words taken out). 16 words were pressed in a browser and 1,717 pills read.

**The check made to fail on purpose, eight ways** (`tools/made-spaces-tamper-v2.py`, `tools/made-spaces-check-goes-red-v2.sh`, `logs/a-l31-…`), each file put back byte for byte:

| | What was broken | The check |
|---|---|---|
| A | a Strong's row that should carry its closes carries no slot | red |
| B | a row's first close moved one place on | red |
| C | the page's own function keeps the space | red |
| D | a list of the first relay names another place than the lane wrote | red |
| E | an unabridged BDB row loses its slot | red |
| F | the second relay's list closes a space that stands for words taken out | red |
| G | the index's sha256 of the unabridged BDB's rows altered | red |
| H | the index says Strong's rows are no longer the rows the list was read from, while they are | **not red**: the lane's counts are said and not judged |

H is a real gap and is left open here, written down: with another rule's move in the store's history, a wrongly false flag looks exactly like an honest store that has moved on. The next change to the tool (it is touched again for the entry gate's slot) records the fingerprint the rows had when read, so the check can hold that the flag follows the two fingerprints.

**Suite and gate.** 146 of 147 checks pass before the push, the one red being the check that the tree is pushed (`logs/a-l35-…`); after the push it passes. The same-product gate against the live build: 9,403 sampled lines the same on 18 pages; 6 of 54 first cards differ, and every differing pill is accounted for by `tools/gate-cards-ship-a.py` (`logs/a-l39-…`): 26 pairs of the UBS dictionary that stood as two pills stand as one (Amos 1 and 5, Zephaniah 1 and 2: three each on the word "who"; Job 1 and 22: seven each on "a man"), no other pill came or went, and the pill each card opens on is the same.

## 2. Ship B: the pointer map v1.3 (live)

Some readings of the store are not English but a pointer to another entry in the source's own words («Masculine singular imperative of הָלַךְ (halách).»). The card prints the English of the entry pointed to, with the pointer beside it. Until this ship the entry was found by the pointer's bare letters, so that pointer printed «traveler, nomad, wayfarer» and a form of the preposition "to" printed «god».

**In the tree.**

- `reader/data/pointer-entries/` (the lane's map `zone-pills-v1.3.jsonl`, its rule and its receipt, byte for byte, under a pin) and `reader/data/rulings/` (the owner's rulings as the lane pinned them, two files, with the owner's own words). Two small modules read them: `tools/pinned-v1.mjs` (a file another lane wrote is read only as the bytes its pin names) and `tools/rulings-v1.mjs` (a tool that applies a ruling reads it from the pin and cites it; it does not carry the ruling in its code).
- `tools/bake-form-of-pills-v1.mjs`, rewritten to read the pinned map under the pinned rulings. 3,015 readings read: 2,140 pure pointers carried under 1,581 keys, **1,524 resolved** (1,215 by the pointer's own words, 309 by the source's first entry under ruling 7) and 616 not; 568 readings with English of their own are not carried at all and so print as themselves (ruling 5); 243 wait on the owner's branch; 64 are no pointer.

**What a reader sees**, reading by reading against the map served before (the 2,708 readings both maps carry; `logs/b-l45-…`):

| | readings | places |
|---|---|---|
| pure pointers that keep the English they printed | 1,336 | 109,951 |
| print another English, the right entry's («god …» became «to, towards, into») | 177 | 15,439 |
| printed their own text, print an English now | 11 | 1,390 |
| a reading with English of its own stops printing another entry's English and prints its own words | 391 | 88,821 |
| the same kind, with no resolution before either | 177 | 58,052 |
| pure pointers that printed an English and print their own text now | 332 | 43,862 |
| pure pointers that print their own text as before | 284 | 28,549 |

The 332 are the cost of the ship. Their English was found by letters alone, and it was not always wrong: «plural construct state form of בֵּן (ben)» printed «A direct male descendant.» For 294 of them the entry has an English that the lane carries in its file and the store serves no row with (160 named by the pointer; 134 the source's first of several under ruling 7); 36 point at a form no entry has, and 2 at a target that itself points on to several.

**The question this puts to the owner.** 458 pure pointers (at 58,007 places) name an entry whose English the lane carries and the store serves no row with. The rulings as pinned print English only where the store serves a row with it, so those pills print the pointer's own text. My recommendation is to print the English the lane carries; it is the owner's to say, and Moses's rule to restate if so.

**One resolution is itself a pure pointer** and is not printed as English (the lane's file resolves מבקשים to «bare infinitive … of ביקש», 12 places). For Moses.

**A page fault found by the check, and fixed.** The page finds a reading's entry in the map by its text. The pill hands in its row's text as written; a ruled line hands in the reading as it prints, where a "/" of the source's is " + ". The two were compared as written, so a pointer whose text holds a "/" resolved on its pill and, once that pill was pressed, stood on the line bare: Amos 1:1, first word, pill «to speak (say words) (Feminine singular imperative of דיבר)», line «Feminine singular imperative of דיבר + דִּבֵּר (dibér)». 58 of the 1,524 resolved pointers hold a "/" (127 of 2,268 under the map before, so it was live). The entry is now found by the text as it prints, on both sides.

**The check, `tools/check-form-of-v1.mjs`.** It found its word by "a cell whose lead is a resolved pointer". Under the new map there is none, and there was never a pure one: the 40 plain words whose lead was a "pointer" under the old map were all readings with English of their own. Laws F3 to F5 are restated where the pointer is: on its pill, and on the line once the pill is pressed. Three laws are new: F6 derives the record again from the pinned file under the pinned rulings; F7 presses cards and holds that a reading with English of its own stands as its own words and carries no pointer; F8 holds F3 to F5 again on a second word found on purpose, whose pointer's text holds a "/". The first word the check came to happened to carry such a pointer, which is how the fault showed, and a fault is not held by luck (`logs/b-l56-…`).

**The check made to fail on purpose, nine ways** (`tools/form-of-tamper-v1.py`, `tools/form-of-check-goes-red-v1.sh`, `logs/b-l57-…`), each file put back byte for byte:

| | What was broken | The check |
|---|---|---|
| A | the lane's map is other bytes of the same size | F6 red (and F7, with nothing to press) |
| B | the pinned rulings are other bytes | F6 red |
| C | a resolved pointer has another English in the record | F6 red |
| D | a pure pointer is left out of the record | F6 red |
| E | a pointer is resolved where the file and the rulings leave it unresolved | F6 red |
| F | the 568 readings with English of their own are carried as pointers | F6 and F7 red |
| G | the page finds a pointer's entry by its text as written (the fault itself) | **F8 red, F3 to F5 green**: only the word chosen for it holds the fault |
| H | the page prints the English without the pointer beside it | F3, F4, F5, F8 red |
| I | the pill does not carry the pointer's own text | F3 and F8 red |

(I did not apply on the first run: its text stood twice in the page. It was run again alone, `logs/b-l57-…-i.txt`.)

**What moved at rest: nothing** (the round run whole, 40 works). Of 400,242 lines under the words, none reads otherwise than on the build before (`logs/b-l44-…`): no line rests on a pure pointer. The twelve chain books hold the same links, 431,006 at rest and 728,474 lifted; distinct readings 229,531 to 229,538; the 12 links that printed what another link of the same card printed are gone (`logs/b-l51-…`).

**Suite and gate.** 146 of 147 before the push, the one red being the check that the tree is pushed (`logs/b-l50-…`); it passes after (`logs/b-l59-…`). F8 was added after the suite ran; the check was run again with the five checks that read the tools' own sources. The same-product gate against the build before: 9,403 sampled lines the same on 18 pages; 14 of 54 first cards differ, and each of the 24 differing pills is one pointer under the two maps (`tools/gate-cards-ship-b.mjs`, `logs/b-l55-…`): 2 print another English, 2 are readings with English of their own printing their own words («Rabshakeh (intensive of …)» became «surely. (Prop. intensive of ….)»), 20 are pure pointers printing their own text (14 whose entry's English the store does not serve, 6 where several entries share the letters or the form and the first's English is not served). No other pill came or went.

Main `6657800de0`, gh-pages `2c8ae39529`, deployment run 1358, live check run 56.

## 3. Ship C: the entry gate, in a development copy

The design, proven on real cards before any of it goes into the build tree:

- **The row's half** rides on the row: a new slot 10, an object of facts (`n` its Strong's numbers, `t` its lettered STEP tags, `b` BDB's own entries), written by a new tool from the lane's row entries ledger (382,258 rows of fifteen sources; every line met its row and every row its line, though the store has moved on since the ledger was read). The ledger is 25 MB and stays on the lane's store, named in the tree by its size and sha256.
- **The place's half** rides on the word: `tg`, the tag of the word's core piece as the lattice writes it (20,583 of Genesis's 20,612 words).
- **The gate** is a small module (`entry-gate-v1.mjs`) and the page carries the same functions under the same names. It runs before the pointing: a row of another entry is withheld and counted; a row of the place's entry stands whatever its headword's points; a row with no number goes to the pointing as before. The two partings of ruling 6 are in it.
- **The line** follows: the leaders under "only" are baked again per entry where the gate moves them (3,442 surface-and-entry pairs in Genesis).

What the cards say (Genesis, development copy):

    1:1 created (H1254A)   8 of another entry than H1254, withheld · 26 of 136 pointed otherwise, withheld · 9 of another stem than qal, withheld
    1:1 the object marker  73 of another entry than H853, withheld · 9 of 149 pointed otherwise, withheld
    1:4 good (H2895)       161 of another entry than H2895, withheld · 3 of 281 pointed otherwise, withheld · 1 of another stem than qal, withheld

«field» is off the card of "he created", «to fatten» (the other verb of the same number, by STEP's letter) is off it, and «he has created», a row of the right entry that the pointing used to withhold, is on it. The line under the object marker reads «self» where it read «plowshare».

A check with thirteen laws is written (`check-entry-gate-v1`): the pins, every row's facts, the lane's own counts source by source, the ledger line by line where it is on the machine, the page's functions against the module's for every key under every entry asked (7,220 keys, 251,205 verdicts in Genesis), every word's tags against the lattice's own position, the baked leaders, and six laws pressed on cards. All pass in the development copy.

Still owed before it ships: the other 38 books projected, the checks that read the sidecar's leaders taught about the entry's own, the made-spaces tool taught that a row can be longer than its slot (and the gap H above closed), the documents, the round, the suite, the gate.
