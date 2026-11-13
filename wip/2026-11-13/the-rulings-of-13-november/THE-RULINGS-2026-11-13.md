# The rulings of 13 November, wired — 13 November 2026 AD

Elijah, page lane. The corpus lane (Moses) sent seven relays on 13 November, v172 to v178, and the owner ruled on the eight calls they put: «1-5. agree go ahead» (rulings 1 to 5, relay v176) and «1-3. ok agree» (rulings 6 to 8, relay v177). "The wiring is yours." This file is the record of that wiring, ship by ship. It is added to as each ship lands. Ship E wires the corpus lane's relay v179, a mend of its own that needed no ruling.

| Ship | What | Rulings | State |
|---|---|---|---|
| A | The unabridged BDB's made spaces close at print (v178); the UBS dictionary's "literally ...; hence ..." pairs are one reading again | 3 | **live**: main `2f403ae430`, gh-pages `f9883c9f35`, deployment run 1357, live check run 55 |
| B | The pointer map v1.3: a pointer names its entry, a reading with English of its own prints its own words, an ambiguous pointer takes the source's first entry; a pressed pointer no longer stands bare on the line | 5, 7 | **live**: main `6657800de0`, gh-pages `2c8ae39529`, deployment run 1358, live check run 56 |
| C | The entry gate, with STEP's letters and BDB's own entries, and the names gate, in one ship (both are asked of the word's place before the pointing) | 1, 6, 8 | **live**: main `90eedeb6f3`, gh-pages `2d6f6b90f6`, deployment run 1359, live check run 57 |
| C2 | The stems from the UBS dictionary, the SDBH and Jastrow, with both branches set, and the rows beside the store asked their stem too | 2 | **live**: main `bdf3735238`, gh-pages `c2af4081cf`, deployment run 1360, live check run 58 |
| D | The unabridged BDB's openings of a numbered sense print as a note, not a pill | 4 | **live**: main `bc5f5f9b09`, gh-pages `a4ef9effc8`, deployment run 1361, live check run 59 |
| E | The paseq the edition writes inside a read form prints there (relay v179, the corpus lane's own mend) | none needed | **live**: main `566a8b3585`, gh-pages `3d127480fa`, deployment run 1362, live check run 60 |

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

## 3. Ship C: the card asks the word's place two things before the pointing (live)

The store keys a row by bare letters and several words share a key. The page told them apart by the pointing of each row's headword alone, which withheld a row of the right entry whose dictionary form is pointed otherwise than the verse's, and kept a row of another entry pointed alike or not at all. The owner ruled two gates (rulings 1 and 6 of v172, ruling 8 of v177). They went in as one ship because both are asked of the word's place, share the row's new slot, the projection's leaders and the page's pool.

**The entry.** A row carries the entry its own source files it under; a place carries the entry that stands there (the tag on the word's core piece, TAHOT's). A row whose numbers hold the place's number stands whatever its points; a row with numbers, none of them the place's, is withheld and counted; a row with no number is left to the pointing. Two finer partings: STEP's letters (a row of TAHOT or TBESH none of whose lettered tags is the place's is another entry though the number is the same) and BDB's own entries (a BDB row with no number that names another of BDB's entries than those its numbered rows give the place).

**The name.** At a place that is not a name, a row its own source gives as a name is withheld and counted; at a place that is one, it stands. 7,412 rows and 34,577 places, as the lane listed them.

Both are asked only under "only this pointing", the default, in the order entry, name, pointing, stem. The card says each: «8 of another entry than H1254A, withheld · 1 given as a name by its source, withheld · 26 of 136 pointed otherwise, withheld · 9 of another stem than qal, withheld».

**In the tree.**

- A row's facts ride in a new slot (10): `n` its numbers, `t` its lettered STEP tags, `b` BDB's own entries, `name`. `tools/apply-row-entries-v1.mjs` writes the first three from the lane's ledger (25 MB, kept on the lane's store; `reader/data/row-entries/` names it by size and sha256 and keeps its rule and receipt). `tools/apply-name-rows-v1.mjs` writes the mark from the lists in `reader/data/names/`. Set beside the store before, 377,313 of 652,954 rows gain the slot and no other slot of any row differs (`logs/c-l66-…`).
- The place's half rides on the word, written by the projection: `tg` (304,261 places) and `np` (34,577).
- `tools/entry-gate-v1.mjs` and `tools/names-gate-v1.mjs` are the gates; the page carries the same functions under the same names. `tools/place-leaders-v1.mjs` names a kind of place (its tags, and whether it is a name), and the projection bakes the leaders of each kind beside the surface's own (64,051 kinds of place over 62,077 surfaces).
- Two new checks, `check-entry-gate-v1` (thirteen laws) and `check-names-gate-v1` (eight), share one reading of a card (`tools/gated-card-v1.mjs`). Five existing checks learned the gates: check-pointing-gate, check-pointing-grade, check-masorah-toggle, check-names-pill, check-source-switch.
- The made spaces' tool no longer takes a row's closes for its last slot, and its index keeps a second sha256 (the rows as they stood when a run found them as read). The check holds that the flag follows the two, which closes gap H of Ship A.

**What the wider run found that Genesis had not** (the gates were first proven on Genesis alone, then on all 39 books in a development copy):

- *STEP's letters are sometimes small.* TAHOT's tags carry a small letter at 22 places where STEP ran past its capitals for one name (H5838x, H2148v, H4918y). The lane's rule calls small letters MACULA's. The ruling says "letter for letter", so a small letter is read as STEP's on both sides; four TAHOT rows carry one.
- *A word in a cell one card joins.* The checks pressed Ecclesiastes 1:2's first word and Daniel 1:2's ninth and read a card that was not the word's: the page joins such a word to its neighbors and opens the cell's card (at Daniel 1:2 the card of the word for "vessels" holds one reading, «housewares», which is the cell's). The checks now ask the page whether a word stands in such a cell and press the next.
- *A divided verb.* check-pointing-gate's first verb with a record of another stem left became a divided word (Amos 1:2's first), whose card opens on its division. Its law G2 now takes a word its place does not divide; G5 holds the whole form of a divided one.
- *The pointing grade's count.* check-pointing-grade counted what the pointing withholds without the place's gates, and held that no pill pointed otherwise survives. It counts after the gates now, and holds that such a pill survives only where the place keeps a row of its own entry.

**STEP's letters, measured on every book** (`logs/c-l78-…`, `tools/steps-letters-measured.mjs`). The lane measured the letter on the fourteen verb cards of Genesis 1 "and on nothing else": two pills. It is wired as ruled, and this is what it does on the thirty-nine books.

| | |
|---|---|
| word places with a tag | 303,262 |
| places whose every core tag carries a letter | 139,741 |
| places where the letter withholds a row the number keeps | **75,998** (450,215 rows, place by place) |
| … a capital up to F on both sides (as H1254A beside H1254B) | 10,003 |
| … a later letter on one side or both | 65,995 |
| TAHOT: a row of it withheld by letter / every row it has of the place's number | 68,588 places / 2,187 |
| TBESH: the same | 29,362 places / **18,964** |
| places that are one undivided word standing alone | 99,018 |
| … of which the letter alone takes a pill off the card | 26,794 (181,862 pills, place by place) |

What the later letters part: one word's senses (at "man", H376G, TAHOT's «anyone» is H376I's and «husband of» H376H's), God from gods (H430G, H430J), the bearers of one name (the Pharaohs), a name's compounds (at "king", TBESH's «Milcom»; at Egypt, «(Sea of) Egypt»; at "his son", «Beno»). The Name is the largest case: 5,698 places tagged H3068G, where TBESH's two rows are H3068H «The Lord» and H3068I «(Jerusalem of) the Lord». «The Lord» stays on the card from other sources' rows. TBESH is left bare at so many places because the store serves its later entries and not its first: of the 294 numbers under which its served rows name an entry lettered H or later, 166 have no served row lettered G (`logs/c-l87-…`).

Because a row withheld by letter is its number's own, the card's note named the wrong thing: «34 of another entry than H376» at a place of H376I. The card now names the place's entry as the place is asked, with the letter where a row is asked by letter (edit 67; `entrySaid` in the module and on the page, held by E6, E9 and E11).

**Where the only served row printing the place's own reading is another place's: 364 places** (`logs/c-l84-…`, `tools/the-places-own-row-and-the-letter.mjs`). At 208,993 of the 209,357 places where a TAHOT row prints the place's own reading under the word's key (as the page matches a reading: the printed form, letter case aside), the gate keeps that row. At 276 it is withheld by its letter and at 88 by its number, and by the ledger the gate is right each time: «gad», two places of H1410I, is the only TAHOT row under its key, and «Gad» stands at 53 places of H1410G with no served row of its own. Until this ship the page took «gad» for it. The reading still leads the card as the place's own. Whether the store should serve the missing rows is the lane's to say; nothing on the page papers over it.

**What a reader sees, measured against the build before** (the round run whole):

- Lines at rest: **1 of 400,242** reads otherwise (`logs/c-l67-…`). The line under a word is the place's own reading wherever the place has one, so the gates act on the card. The one: Isaiah 56:10's first word, with no tag and no reading of its place, read «Zepho»; the SDBH's row of that name is withheld there and Strong's «Tsepho» stands first among the rows left. Both are the name; Strong's was not read for names.
- The leader under "only this pointing", which is the line of a reader who chooses "oldest first" (`logs/c-l89-…`, `tools/leaders-before-and-after.mjs`): **another reading at 92,344 of 302,281 places**; 351 places lose theirs and go bare under that order (every row under the word's letters is another entry's: the second half of Kiriath-jearim, tagged as the town, where «forest» led); 19 gain one. The first by places are what the gate is for: the object marker «mark» → «self» (6,478), "for" «burning» → «since» (4,225), "over" «Most High» → «over» (3,467), "all" «(be able to, can) abide» → «properly, the whole» (2,826), "the king" «consult» → «the/ king» (1,037). Two to know: the Name «The Lord» → «Jehovah», Strong's own first word (5,698 places; «The Lord» led on a row TBESH files under H3068H, which the letter withholds at H3068G), and "God of" «God» → «angels», the first word of Strong's list (451; "God" itself read «judges» before and still does).
- "He created" at Genesis 1:1: 71 pills where there were 78. «Bara», «field», «he ate», «to fatten» are gone and «he has created» is on it (`logs/c-l83-…`).
- The twelve chain books, card by card (`logs/c-l72-…`): of 14,354 cards at rest 8,084 hold the links they held; 1,793 only lose, 1,098 only gain, 3,379 do both. **67,343 links gone, 50,461 come** (431,006 to 414,124). Lifted, every card holds exactly what it held (728,474).
- Search index: every count the same (`logs/c-l71-…`).
- Weight: zones with sidecars 58.7 MB (were 56.2), store shards 16.1 MB (were 15.1).

**Broken on purpose, nineteen ways** (`logs/c-l82-gates-checks-go-red.txt`, `tools/gates-checks-go-red-v1.sh`, `tools/gates-tamper-v1.py`). Each fault is put into one file of the tree, the check that should catch it is run, and the file is put back byte for byte. All three checks are green again at the end.

| | The fault | The check says |
|---|---|---|
| A | a row is filed under another number than its ledger line gives | E2, E5, E8 red |
| B | a row loses its facts | E3, E4, E5 red |
| C | a row's STEP tag carries another letter | E5, E8 red |
| D | a word carries another tag than the lattice's | E7's second half and E8 red, and every law that presses a card (the page draws no word of the book) |
| E | a leader a kind of place holds is another text | E8, E13 red |
| F | a surface loses its leaders at a kind of place | E13 red |
| G | the page's pool keeps the rows of another entry | E9, both E11s, E13 red |
| H | the page's numberOf writes a number another way | E6, E9, E10, both E11s, E13 red |
| I | the page reads the surface's own leaders at every place | E6's second half, E13 red |
| J | the ledger's receipt is other bytes than its pin names | E1 to E5 red |
| S | the card names the place's entry by its number alone where a row is asked by letter | E9 and the letter's E11 red |
| K | a listed row loses its mark | N3, N4 red |
| L | a row no line lists is marked a name | N3, N4 red |
| M | a listed place loses its mark | N5 red, and N7 and N8 (the page draws no word of the book) |
| N | a place no line lists is marked a name place | N5 red, and N7 and N8 |
| O | the page's pool keeps the rows given as a name | N7 red |
| P | the page's nameWithheld is turned about | N6, N7 red |
| Q | the list of name places is other bytes than its pin names | N1 to N5 red |
| R | the index says a source's rows are not the rows its list was read from, while they are (gap H of Ship A) | M4 red |

D, M and N write the fault into a zone's own bytes, and the page does not draw a book whose zone it cannot take. On the first run the two checks went red at the law that reads the zone and then ended on an uncaught timeout, waiting a minute for a word. `tools/gated-card-v1.mjs`, which both share, says of itself "a fault is said in words"; it now keeps that (edit 68), and the three were tried again (`logs/c-l94-…`): each law that presses a card says «the page drew no word of amos within a minute» and the check ends on its own count. The tree's changed and new files were fingerprinted before and after those three and are the same (`logs/c-l94-tree-before-and-after.txt`).

**The machine restarted in the middle of the first run of these.** The run was on fault C, which had altered one shard of the store, and the restart killed it before it put the shard back. The kept copy was put back by hand and found to be the same bytes as the development copy's shard; no other file of the tree had been written since the run began. The whole run was then made again from the start, and `tools/ship-c-proofs.sh` writes a line as each stage ends so that a run cut short says where it stopped (`logs/c-l80-proofs-progress.txt`).

**Suite, gate, lint.** 148 of 149 checks pass before the push (`logs/c-l80-suite-ship-c.txt`); the one red is the check that the tree is pushed, green after it (`logs/c-l91-…`). The suite ran whole twice. The first run found the pipeline's manifest stale (a check's comment names the entry gate's rule, so the manifest credits that check too). The second followed the note's mend (edit 67): the lines and the chain books record the page they were read from, so both were read again off the mended page, the same 400,242 lines and the same links on every card (`logs/c-l85-…`, and `logs/c-l67-…` and `logs/c-l72-…` made again and the same byte for byte). The same-product gate against the build before (`logs/c-l81-gate-ship-c.txt`): 9,383 sampled lines the same on 18 pages; 36 of 54 first cards differ (18 cards, each read on two chapter pages), and every differing pill is accounted for with the gates' own modules (`tools/gate-cards-ship-c.mjs`, `logs/c-l81-gate-ship-c-classified.txt`): 294 gone whose every row is another entry's, 12 gone as a name's at a place that is not a name, 722 come on a row of the place's own entry that its source points otherwise, 12 one reading written in another row's letters. None is unaccounted for and no card opens on another reading. After edit 68 the two gate checks were run again and pass, with the four checks that read the tools' own sources (`logs/c-l95-…`). Lint: the seventeen changed and new tools carry no finding their copies on the build before do not, and the page carries the 175 it carried (`logs/c-l86-…`).

**Shipped.** main `90eedeb6f3`, gh-pages `2d6f6b90f6`, deployment run 1359, live check run 57 (`logs/c-l90-ship-c.txt`, `logs/c-l92-poll-ship-c.txt`). The commit message is `logs/c-commit-message-90eedeb6.txt`.

**Put to the owner with this ship.** The letter's measure: it is live as ruled, and the owner can say if the later letters should stay together. The leader under "oldest first" at the Name («Jehovah») and at "God of" («angels»). And, still open from Ship B, whether to print the English the lane's file carries for 458 pointers at 58,007 places.

**Put to the lane.** `wip/2026-11-13/FOR-MOSES-2026-11-13-the-rulings-of-13-november-wired.md`: seven things to look at, the first three in weight being STEP's own words on its letters, TBESH's first entries that the store does not serve, and the 364 places where TAHOT's own row is not served.

## 4. Ship C2: three more dictionaries name their stems, and a row beside the store is asked its stem too (live)

**What came.** Relay v173: the binyan ledger's file 2 extended to the UBS dictionary (M18), the SDBH via HiperBiblia (M17) and Jastrow (M12, M39, M49), 31,487 lines, one for each of their rows on a verb's letters (`row-stems-extension-v1.jsonl`, 6,976,834 bytes, sha256 `a51b8cd2…`). It carries two branches for the owner: `the_ubs_edition` (an SDBH line takes the stems of the UBS edition's meanings of the same entry that give the same gloss) and `the_base_stem` (a Jastrow reading before an entry's first heading takes its base stem). Ruling 2 of relay v176 sets both. Under the settings 19,007 rows gain stems (M12 8,201, M17 3,117, M18 6,004, M39 223, M49 1,462), 6,357 by a branch.

**What was wired** (edits 69 to 73, three new tools, one pin):

- `data/stems-extension/`: the pin (the file of lines stays on the lane's store and is named by size and sha256) and the lane's rule and receipt byte for byte.
- `tools/stems-extension-v1.mjs` reads the lines only as the pinned bytes, and the settings from the lane's pin of the ruling: a branch set to its option takes that option's verdict, NONE leaves the line, anything else is refused.
- Edit 69, the projection (`--row-stems-extension`): each row's stems go into the sidecar under the same id as file 2's, a row both files name is refused, and each sidecar records the file, the ruling, the settings and how many rows it gave stems. Edit 70, the round (`--stems-extension`, required with `--lattice`).
- Edit 71, the page: the rows beside the store (Jastrow's) are asked their stem where they join the card, after their own pointing. Until now only the store's rows were asked.
- `tools/rows-beside-the-store-v1.mjs` says once which rows beside the store a card takes and what it asks them; edit 72 has `check-pointing-gate-v1` count them with the store's. Edit 73, PIPELINE.md.
- `tools/check-stems-extension-v1.mjs`, eight laws (B1 to B8): the pin and the ruling; the lines as pinned and counted as the lane's receipt counts them; every line finds exactly one row (15,139 of the store, 16,348 beside it); every book's sidecar names the extension and holds exactly each line's stems (39 books, 350,636 rows given stems book by book); four laws pressed on cards (Amos 1:1, Amos 2:7, Daniel 2:19, Amos 3:6).

**Measured before wiring** (`logs/c2-m01-…`): 73,630 word places are asked their stem; at 7,141 the extension withholds a row the earlier gates leave (counted place by place: M18 56,947 rows at 5,371 places, M17 10,552 at 3,918, M12 32,014 at 4,243, M49 6,070 at 1,998, M39 568 at 91). The commonest pairs: hiphil against qal 41,497, piel against qal 14,903, niphal against qal 14,155. Eleven of Jastrow's stem names are in no family and no place carries them (61 rows): told to the lane.

**Measured against the live build** (Ship C):

- Lines at rest: 1 of 400,242 (`logs/c2-m15-…`). 2 Kings 18:17's last word, the Fuller's Field: «fuller» led on the SDBH's early rank; the UBS edition files «fuller» under the piel participle, the place is qal, so the SDBH's row is withheld and Strong's «trample» comes first. «fuller» and «Fuller's Field» stay on the card.
- The leader under "only" (`logs/c2-m06-…`): another at 23 of 302,300 places, none gained or lost; nine are the piel of "uncover" («open» → «uncover»).
- The chain books (`logs/c2-m14-…`): at rest 366 cards lose links and none gains, 414,124 → 408,861; lifted, every card the same (728,474).
- The search index: every count the same (`logs/c2-m16-…`).
- Weight: zones with sidecars 58.7 MB → 64.2 MB. The sidecar names a row by source, rank and whole route text; source and rank alone do not tell rows apart (144,587 rows share both with another row of their key, `logs/c2-m17-…`). A short fingerprint of the text would take Genesis's stems from 405 KB to about 100 KB: a cleanup of its own, next.
- The outside reader's fourteen verb cards (`logs/c2-m19-…`, `logs/c2-m21-…`): of the 12 pills the reader called "the same entry, another stem" that one of these three carries, 11 are gone; «to cut down» stands because Wiktionary gives it too and names no stem. 2 "another word" and 2 "unsure" gone; none of the 132 "right" gone. 18 pills gone across the cards, none come. "He created": 71 → 58 pills, «25 of another stem than qal, withheld» where it said 9. This agrees with the lane's own measure in v173 (12, 2, 2, 0), but for the one pill a source naming no stem also carries.

**Broken on purpose** (`logs/c2-m13-…`), each file put back byte for byte, the check green again at the end, the tree's fingerprint the same before and after:

| | What was broken | The check |
|---|---|---|
| A | the extension's receipt is other bytes than its pin names | B1, B2, B4 red |
| B | the pinned rulings are other bytes | B1, B2, B4 red; the card laws find no word to press |
| C | in Amos's sidecar, a row of the extension carries another stem than its line | B4 red, and the card laws in that book |
| D | in Amos's sidecar, a row of the extension loses its stems | B4 red, and the card laws in that book |
| E | in Amos's sidecar, a row no line names is given stems | B4 red, and the card laws in that book |
| F | Amos's sidecar says a branch rests at NONE | B4 red |
| G | Amos's sidecar counts one row more than it gave stems | B4 red, and the card laws in that book |
| H | the page does not ask the rows beside the store their stem | B5, B7, B8 red |
| I | the file of lines handed to the check is other bytes | B2 red |

**Suite, gate, lint.** 149 of 150 checks pass before the push (`logs/c2-m11-…`); the one red is the check that the tree is pushed, green after (`logs/c2-m23-…`). The gate (`logs/c2-m12-…`): 9,383 sampled lines the same on 18 pages; 4 of 54 first cards differ (Job's second word and Ruth's third, each on two pages), and every differing pill is accounted for with the extension's own stems (`logs/c2-m12-gate-classified.txt`): four of Jastrow's piel readings of "it was" and two of the UBS dictionary's niphal readings of "to judge" are gone, none comes. Lint: the five changed tools carry no new finding; the page 175 = 175 (`logs/c2-m20-…`).

**Shipped.** main `bdf3735238`, gh-pages `c2af4081cf`, deployment run 1360, live check run 58 (`logs/c2-m22-…`, `logs/c2-m24-…`). The commit message is `logs/c2-commit-message-bdf37352.txt`. A container restart came after the proofs and before the ship; nothing was mid-change (the break tests had all been put back), and the servers were started again.

## 5. Ship D: the openings of a numbered sense print as notes (live)

**What came.** Relay v174: the corpus lane's list of the served rows of the unabridged BDB (M46) that are only the words opening a numbered sense of an entry, 2,008 rows under 896 keys, each with its entry and its point (`pieces-v1/numbered-sense-openings-v1.jsonl`, sha256 `a6593ffe…`). Ruling 4 of relay v176 («1-5. agree go ahead»): such a row prints as a note beside the sense's readings, not as a pill.

**What was wired** (edits 74 to 79, 82 and 83, three new tools, one pin):

- `data/sense-openings/`: the pin and the lane's list, rule and receipt byte for byte.
- `tools/apply-sense-openings-v1.mjs` marks each listed row in its facts (`opens`: «BDB1300 1.»), reading the ruling from the lane's pin of it and refusing any print but the ruled one. All 2,008 lines find exactly one row among M46's 8,915; store `43acd0b3d9a3` → `4d1357b26ca5`, 650,946 of 652,954 rows the same in every slot, the 2,008 differing in their facts alone (`logs/d-n20-…`).
- Edit 74, the store's reader: `senseOpened`; a marked row gives no reading. Edit 75, the page: the same function; the pool takes the kept marked rows out as notes and prints them in one line under the record of the reading held (the readings' band where the card holds none). Edit 76: the search index's bake and two checks read the page's functions through `tools/page-reading-v1.mjs`; the witnessed bake refuses a note by name. Edit 77: the gated-card harness reads the notes. Edit 78: PIPELINE.md. Edit 79: the page's `factsOf` moved above the gates that ask it (the lint's one new finding), and `check-entry-gate-v1` lifts it by its own text.
- `tools/check-sense-openings-v1.mjs`, nine laws (O1 to O9), green on its first full run and again after edit 79 (`logs/d-n11-…`). Edits 82 and 83 teach two older checks the new fact (below).

**Measured against the live build** (C2):

- Lines at rest: 2 of 400,242 (`logs/d-n22-…`): Sharezer at Jeremiah 39:13 and Zechariah 7:2, «son of Sennach.» → the UBS dictionary's «man; ◄ son of Sennacherib, king of Assyria, ► who, together …».
- The leader under "oldest first" (`logs/d-n23-…`): another at 43 of 302,300 places, 39 of them with a reading of their own; none gained or lost. BDB's openings led for names whichever bearer the place is; the next row in age leads now, at a few another bearer as before (Mattaniah H4983H, Nethaniah); at Rimmon (H5884) a row that is not a name's, «a small explosive bomb …» (put to the owner).
- The witnessed columns (`logs/d-n19-…`): 1,935 + 731 + 1,365 shipped readings refused as notes; those lines fall back to the default line.
- The chain books (`logs/d-n24-…`): at rest 2,388 of 14,354 cards lose links, 5,027 in all, and none gains; one opens on another reading (Zechariah 7:2); lifted, 3,008 cards lose 7,337 links.
- The search index (`logs/d-n18-…`): route pills 745,559 → 743,519, English 158,594 → 157,138, pairs 487,588 → 485,730; all else the same.
- Weight: zones with sidecars 64,165,998 → 64,020,156 bytes; shards 16,119,734 → 16,139,723.

**Broken on purpose** (`logs/d-n14-…`), each file put back byte for byte, the check green again at the end, the tree's fingerprint the same before and after:

| | What was broken | The check |
|---|---|---|
| A | the list of openings is other bytes than its pin names | O1 to O5 red |
| B | the pinned rulings are other bytes | O1, O3, O4 red |
| C | a listed row of the store loses its mark | O3, O4 red |
| D | a row of the ruled source that no line names is given a mark | O3 to O6 red |
| E | a marked row names another point than its line gives | O3, O5 red |
| F | the index's record counts one row more than is marked | O4 red |
| G | the index's record cites the ruling with another print | O4 red |
| H | Amos's sidecar gives a surface a note's words as its leader | O6 red |
| I | the page's readingsOfRow reads a marked row as any other | O5 red |
| J | the page's pool keeps the marked rows among its rows and takes no notes | O7, O8 red |
| K | the page takes its notes from every row of the key, whatever its switches withhold | O7, O8 red |
| L | the page puts no notes line with the record | O7, O8 red |
| M | the store's reader reads a marked row as any other | O5 red |

**Suite, gate, lint.** 148 of 151 checks pass on the first run (`logs/d-n12-…`). Two had not been taught the new fact: `check-entry-gate-v1`'s E2 (a closed list of the facts a row may carry) and `check-made-spaces-v1`'s M6 (a second road to the readings of the 132 marked rows that also carry a closed space). Edits 82 and 83 teach them, and both pass every law (`logs/d-n26-…`, `logs/d-n27-…`); the regenerated manifest names M6's check among the rule's guards. The third red is the check that the tree is pushed, green after (`logs/d-n29-…`). The gate (`logs/d-n13-…`, accounted in `logs/d-n28-…`): 9,383 sampled lines the same; 16 of 54 first cards differ, 34 pills gone, each one a row that is a note now, and the cards print 34 notes; none comes, none opens on another reading. Lint (`logs/d-n25-…`): 10 changed tools, no finding their live copies lack; the page 175.

**Shipped.** main `bc5f5f9b09`, gh-pages `a4ef9effc8` (deployment run 1361 and live check run 59, both green, `logs/d-n30-…`). The commit message is `logs/d-commit-message-bc5f5f9b.txt`.

## 6. Ship E: the paseq stands in the read form (relay v179, the lane's own mend; live)

**What came.** Relay v179: at 16 places written one way and read another, the edition writes a paseq inside the read form (11 close it, 5 stand between its two read words); the lane's restore v5 stood each after the whole place, and lattice v12 serves that order. The lane's list (`paseq-v1/paseq-in-the-read-form-v1.jsonl`, sha256 `c9be98b7…`) keys each to the lattice and the word place and gives the place as the edition prints it (`prints`) and the verse with the stroke in place (`stream_line_in_place`). Its second count found the same 16 from the streams alone; the Leningrad Codex sets the stroke after the same read word at all 16.

**What was wired** (edits 80 and 81, two new tools, one pin; built first in a worktree of the live build, then on main after ruling 4):

- `data/paseq-place/`: the pin and the lane's list, rule and receipt byte for byte.
- `tools/apply-paseq-place-v1.mjs` writes two facts on the 12 zones: on the place `kq.stroke` (the glyph, copied from the mark's own `s`, and the read word it follows); on the mark `in_read_form`. It first holds each line to its zone and draws each place as the page draws it: 16 of 16 equal `prints`. Typed on each zone as a post-build write; expires with the zones built from the lane's next lattice. The round's three zone tools carry the facts through (shown on Job).
- Edit 80, the page: one rule (`strokeIn`) says where the stroke stands. The line draws an empty span there and the stylesheet draws the glyph in it with the marks shown, so every reader of the place's text still reads its carrier; the mark's own block never shows, and a press on the stroke opens the paseq's card. The export writes the stroke in the place's Hebrew (`carrierWithStroke`) and nothing at the mark's own position. Edit 81, PIPELINE.md.
- `tools/check-paseq-place-v1.mjs`, six laws (P1 to P6): the pin; the zones' facts, records and typing, and no fact elsewhere; with the marks off each place prints its carrier alone; with the marks on each prints as the list's `prints`; a press on the stroke opens the paseq's card; the export of each listed verse equals the list's `stream_line_in_place`, character for character.

**Measured against the live build** (ruling 4), the round run from the stamps on:

- Lines at rest: all 400,242 the same (`logs/e-p17-…`).
- The chain books: all 14,354 cards the same, at rest and lifted (`logs/e-p18-…`); they hold none of the 16 places.
- The store and the search index: every file the same; no count moved. The gate's receipt and the shelf's record pin the 12 zones' new bytes; the ledger index names the new tool.
- Weight: the 12 zones 8,939,934 → 8,948,028 bytes.

**Broken on purpose** (`logs/e-p21-…`), each file put back byte for byte, the tree's fingerprint the same before and after (`20fa720351124933`); where a zone was changed it was pinned again, so the page reads it:

| | What was broken | The check |
|---|---|---|
| A | the pin names another sha256 for the list | P1, P2 red |
| B | at Job 38:1 the place loses its stroke | P2 to P6 red |
| C | at Job 38:1 the stroke follows read word 2 | P2, P4, P6 red |
| D | a paseq of Job outside the list says it prints in a read form | P2 red |
| E | the stylesheet draws the stroke whether the marks are shown or not | P3 red |
| F | the mark's own block shows again with the marks | P4 red |
| G | the page draws the stroke after the next read word | P3 to P6 red |
| H | a press on the stroke opens nothing of the mark's | P5 red |
| I | the stroke's span holds its glyph as text | P3, P4 red |
| J | the export writes the mark at its own position too | P6 red |
| K | the export writes the place without its stroke | P6 red |

On the first run (`logs/e-p16-…`) G stopped the check: at a place of one read word the page drew no stroke, the check pressed the stroke it did not find, and it ended in an error that named no law. The check now says "the page drew no stroke to press" as a finding of P5, and a place it cannot read is a finding of its own, so one bad place does not stop the rest. All eleven were run again against it, and all eleven were caught.

**Suite, gate, lint.** 150 of 152 checks pass on the first run (`logs/e-p14-…`). `check-nothing-hand-typed-v1` found two glyphs typed into the new tool's string literals (the paseq it compared a mark to, the maqaf it tested a join by); the Write tool had decoded the escapes I wrote. Neither was needed, and both are gone; the check passes (`logs/e-p19-…`), and the tool still holds all 16 lines to their zones. The other red is the check that the tree is pushed, green after (`logs/e-p22-…`). The gate (`logs/e-p15-…`): 9,383 sampled lines and the 54 first cards, all the same. Lint: the two new tools clean after two small mends; the page 175.

**Also found** (`logs/e-p02-…`): the 28 read forms of two or more words carry no tag on any read word; at 14 the place has no pieces either, and the line under each read word is the table's line for its bare letters («manna» for מִ֥ן at Job 38:1 and 40:6, «to make bricks + jaminites» at 1 Chronicles 27:12, «beacon» at 2 Samuel 5:2, «Shammah.» at 2 Samuel 21:12). Put to the lane.

**Shipped.** main `566a8b3585`, gh-pages `3d127480fa` (deployment run 1362 and live check run 60, both green, `logs/e-p23-…`). The commit message is `logs/e-commit-message-566a8b35.txt`.
