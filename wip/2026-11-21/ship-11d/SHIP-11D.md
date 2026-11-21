# Ship 11d: the spelling bridge's pieces at 206 places (21 November 2026)

Ship 11c left three lines reading a neighbor's wording, and said 59 more places of the same class read so on live. This ship mends the class with the corpus lane's own list (relay v202, the spelling bridge), through a mechanism the page already has. No ruling is needed and no page code changes.

## What was wrong, in one paragraph

At 1,173 places our text spells a word otherwise than the Leningrad text STEP and MACULA follow. Lattice v12 reads the two under their own spelling, so it gives such a place no reading and, at most of them, no pieces. Everywhere else the line under a word is **the place's own reading**: the place's pieces (`pg` on the zone word), each with the English its source wrote for this very place (`zone.html`, `placeLine`). At these places there were none, so the line was whatever row led under the key. When STEP's rows landed under our spelling in ship 11c, several rows of one entry and one pointing stood under one key, and the first by rank led at every place of that spelling.

## What the bridge gives, and what I checked before building

`bridge-places-v1.jsonl`: 1,173 lines, one per place, each with a class. At 1,035 it gives STEP's pieces cut onto our letters.

- **The pieces' English has STEP's brackets taken off.** «the place of head» for STEP's «[the] place of head». 0 of the 1,936 pieces carry a bracket. The lattice's own pieces are the same (0 of 20,526 in 1 Samuel). But a zone's pieces come from the lane's piece-gloss column, which keeps STEP's writing: 1,664 of 1 Samuel's 13,161 pieced words carry a square bracket and 1,473 an angle one. The brackets matter on the page: they mark the words STEP supplies, and the signs switch reads them.
- **For one class the words as STEP writes them are in the same relay.** The 236 `STEP_WRITES_OUR_SPELLING` places are exactly the places the form rows are named for (220 landed, 16 listed as not landed). At every one of the 236, exactly one form row names the place, its words cut at the stroke count the same as the bridge's pieces, and each part is the piece's English with the brackets aside (`measures/before-the-build.txt`). 22 parts carry a square bracket and 17 an angle one.
- **So the laid class is `STEP_WRITES_OUR_SPELLING` with `NEW_PIECES`: 206 places.** The other 30 of the class have pieces of the lattice's own, and the lane says nothing replaces them.
- All 206 are plain words, each found by its verse, its number among the verse's words and the lattice's surface, under the list's key. None carries pieces today. 42 are joined to a neighbor by a stroke; 4 are name places.
- **No tag is written.** The list gives each piece its tag, and the place's entry would be its core piece's. But a zone's tag is the lattice's: `check-entry-gate-v1` holds every tagged word to the lattice's core tags, and the sidecar bakes the leaders for each kind of place at projection. Writing tags means teaching the projector and that check the bridge, which is a ship of its own. Without it nothing is inconsistent: at 191 of the 206 the core piece's number is already among the entries the place is asked (MACULA's lemma), 14 are asked none, and at the one other (Jeremiah 17:24, «on the/ it») the row still stands by its own number.

## Not laid, and why (the pin says each)

| class | places | why |
|---|---|---|
| `THROUGH_ONE_LETTER`, new pieces | 748 | The words as STEP writes them are not on hand: the list's English has the brackets off and no row in this tree is named for these places. At 731 STEP's reading stands already (call 4). **Asked of the corpus lane.** |
| `SAME_LETTERS`, new pieces | 46 | The same. |
| beside the lattice's pieces | 35 | The lattice's own pieces stand. |
| no pieces in the list | 138 | Held by the lane, each with its reason. |

## What is built

- `data/spelling-bridge/PIN.json` and `bridge-v1/`: the list, its rule and receipt, and the nine form rows not landed, byte for byte. The landed form rows are read where ship 11c pinned them (`data/landings/bridge-form-rows-v1/`), as the same bytes. The pin names the classes laid and not laid with the list's counts, and six readings by name.
- `tools/spelling-bridge-v1.mjs`: the one reading of the list. `tools/apply-spelling-bridge-v1.mjs`: proves everything above again, then writes `pg` on each laid word, each piece `{ k: our letters, g: STEP's words for it as cut at the stroke, s: tahot, r: its role }`, the word's last field, with a record on the zone and the write typed. Run twice it writes nothing. It refuses a laid place that carries other pieces.
- `tools/round-v1.sh`: the zones step ends with it, after the read words. `PIPELINE.md` says so.
- `tools/check-spelling-bridge-v1.mjs`, five laws: B1 the pin, the receipt, the recount, each laid place proven against its form row; B2 each laid place carries exactly the list's pieces; B3 nothing else is written (each zone's record recounts; the 794 new-piece places the pin does not lay carry none); B4 the record of the lines at rest reads each laid place's pieces, credited to them; B5 on the page, the lines of every laid place in the books of the named readings, and the card of each named place standing on the same reading.

On a sandbox copy of the zones: 206 places laid on 28 zones, 451 pieces; a second run writes nothing; B1 to B3 pass.

## A correction to what I wrote at 02:35

In ship 11c's record I wrote that this mend would carry the form rows' places as «the row naming its verse» (the sidecar's `names_this_verse`). Reading the page showed the plainer road. The reader's line at a place is the place's pieces before it is any row's lead, and a zone word carries them as `pg`. The read words of relay v192 were laid the same way on 15 November (`tools/apply-read-words-v1.mjs`). So nothing new is taught to the page or the sidecar: the 206 places gain what every other place has.

## The gate learns the expectation (`tools/patch-gate-bridge.py`)

Five of the 206 places stand on pages the gate samples (Job 1:4 and 1:21, Ruth 3:14, Lamentations 3:39, Nehemiah 1:1). `check-same-product-v1` takes `--expect data/spelling-bridge/PIN.json`, told by the pin's rule id: at a place the pin lays, found on the new build's zone as the tool finds it, a line that differs on the same word is owed where the new line is the place's own pieces as the page draws them with the signs at rest, credited to the pieces. Under a switch where the place's reading does not lead, the line is the old line and nothing is owed. No place is named in the gate.

## On the real tree: the round, and every resting line against live (21 November, 03:21 UTC)

Run as `tools/pipeline-11d.sh` on branch `ship11d` from ship 11c as shipped (f88c4df6e1); live for the comparison is ship 11c. The round, the form-of record, the lines, the chain books, the door and the switches page ended clean (`pipeline.log`). The round's zones step laid 206 places, 451 pieces.

**206 entries move in 40 works, and they are exactly the 206 places** (`lines-diff-against-live.json`). Nothing else moves.

- **118 keep their words and change their credit**, from STEP's row or STEP's fill to the place's own pieces.
- **88 change their words** (`every-line-whose-words-move.txt`; every one read). 52 read another of STEP's own rows before, 33 Strong's concordance list (Hebrew Wikisource), 2 MACULA's, 1 Strong's dictionary (Open Scriptures). Each reads STEP's own words for the place now.

The three known lines of ship 11c:

| place | ship 11c | now |
|---|---|---|
| Daniel 4:21 | «O lord + my» | «lord + my» |
| 1 Samuel 26:7 | «[is the] place of head + his» | «[the] place of head + his» |
| 1 Samuel 26:16 | «[is the] place of head + his» | «[was the] place of head + his» |

Some of the others, as a reader meets them:

- The plurals the Leningrad text spells out and ours does not: Leviticus 9:22 and 16:21 «hands + his» (was «hand + his»); Deuteronomy 7:9 and 8:2 «commandments + his»; 2 Samuel 13:34 «eyes + his»; Ezekiel 18:21 «sins + his»; Lamentations 3:39 «sins + his».
- Strong's list gave way to the place: Numbers 12:3 «[was] humble» (was «poor»); Job 1:21 «I came out» (was «appear»); 1 Kings 21:21 «[am] about to bring» (was «abide»); Isaiah 30:5 «he will be ashamed» (was «(make to) be abhorred (had in abomination, loathsome, odious)»); Psalm 148:2 «hosts + his» (was «assemble»); Genesis 49:11 «robe + his» (was «clothes»).
- Genesis 13:3 «tent + his» (was «tent + towards»), the line ship 11 named.
- Nehemiah 1:1 «Kislev» (was «Chisleu»).
- Job 40:17 «thighs + its» (was «dread of + him»): another entry's row led there.

STEP's own marks print as they do at every other place: «righteousness<es> + his» (Ezekiel 18:24), as 1,783 lines on live already do.

`check-spelling-bridge-v1` B1 to B4 pass on the tree: 206 lines are their place's pieces, the six named readings among them.

## The round run twice found a fault of order, and it was mine (03:55 UTC)

Before the gate I ran the round's zones step a second time over the built tree, to prove a tool that had just joined the round gives the same bytes. It did not: four files differed (Genesis's zone and its lattice sidecar, Ezekiel's and Nehemiah's zones).

**Cause.** I had put the bridge's step last in the zones step, after the lattice projection, where the read words are laid. But two tools earlier in that step read a place's pieces:

- the line read again (`regloss-zone`, through `tools/proper-name-v1.mjs`) takes a name's lead from the piece of STEP's that is the word's core;
- the lattice projection takes the name's lead under «only» and the stems a card can ask.

So on the first round the pieces arrived after both had run, and the name places among the 206 waited for a second round: Genesis 49:10's «Shiloh» gained its name's lead only then (188 keys lead with their name, 187 before; the sidecar's count 499 to 500).

**Mend** (`tools/patch-bridge-first-in-the-round.py`). The bridge's step is first in the zones step, and the round's header and PIPELINE.md say why. The tool no longer moves the pieces to be the word's last field (that was only needed when it ran last), and B2 no longer holds it.

**Pass 2** (`tools/pass2.sh`), running now: the zones put back as ship 11c shipped them, the whole pipeline once, then the zones and stamps steps again, with the same bytes owed in every zone file. The lines above are pass 1's and are read again from pass 2.

**The read words have the same order.** `apply-read-words-v1` lays its 13 places' pieces after the projection too. Every zone already carries them, so a round today gives the same bytes; a zone built from nothing would need two rounds for a name among them. Not this ship's: filed.

## Pass 2 (03:39 to 04:29 UTC): one round from ship 11c's zones, and the same bytes on a second

`pass2.log`. The zones were put back as ship 11c shipped them (none differing from HEAD), and the pipeline ran whole with the bridge first in the zones step: 206 places laid, 451 pieces; every step clean. Then the zones and stamps steps ran again: **the same bytes in all 147 zone files.** So one round on a tree without the pieces reaches the state a second round keeps.

The resting lines against live are pass 1's, entry for entry: 206 entries move, the 206 places, 88 changing their words (`every-line-whose-words-move.txt` and `lines-diff-against-live.json` are pass 2's files). What the name's lead changed at Genesis 49:10 is in the sidecar and the zone's table, and moves no resting line: «Shiloh» reads «Shiloh» by the place's pieces either way.

## The gate (04:30 to 04:41 UTC): passed, with the bridge's expectation

`gate-pipe2.log`, `gate-diff-pipe2.txt`. Live (ship 11c) against the tree, 18 pages of 9 books, the four standing expectations and `--expect data/spelling-bridge/PIN.json`:

- S1 and S2 ok. **0 lines differ; 11 lines moved as owed, every one told as a bridge line**; 54 cards compared, none differing.
- The eleven are the five laid places the sample reaches, under the switches it reads: Job 1:4 «sisters + their» and Ruth 3:14 «feet + his» (the credit alone, to the place's pieces), Job 1:21 «appear» to «I came out», Lamentations 3:39 «sin + his» to «sins + his», Nehemiah 1:1 «Chisleu» to «Kislev».

## The suite found my new check's card law wrong, not the page (05:45 to 05:52 UTC)

`check-spelling-bridge-v1` B5 failed in the suite at all six named places: «the card stands on «bolster», and the line reads «[the] place of head + his»». The line half of the law held at every laid place of the five books it opens (49 lines). The card half was an assumption of mine that I had never run: that the card of such a place stands on the line's whole reading, one pill pressed, STEP's row behind it.

**What the page does, and has done since 14 November** (core-block-rule-v1, the owner): a card of a place the line reads in pieces opens on the place's own division with its core block pressed. The place's reading is said whole above the pills («here STEP reads …», under the pieces' credit), and the pills are the block's own, the dictionaries'. The pill pressed is the line's own piece for the block where a pill of the block reads it, and the block's first where none does (`lineFirst || pool[0]` in the page). I read the cards at the six places (`tools/cards-at-named.mjs`):

| place | said above the pills | pressed on the core block |
|---|---|---|
| Daniel 4:21 | «lord + my» | «lord», the line's piece |
| Leviticus 9:22 | «hands + his» | «hands», the line's piece |
| Genesis 13:3 | «tent + his» | «tent», the line's piece |
| Deuteronomy 7:9 | «commandments + his» | «commandments», the line's piece (MACULA's row) |
| 1 Samuel 26:7 | «[the] place of head + his» | «bolster», the block's first: its three pills are Strong's list's «bolster», «head», «pillow» |
| 1 Samuel 26:16 | «[was the] place of head + his» | «bolster», the same |

So at 1 Samuel 26:7 the card says STEP's reading of the place above the pills and stands on Strong's «bolster» for the block, because no dictionary reads the block as STEP's piece does. That is the page's rule at every place of the thirty-nine books where the dictionaries do not hold the piece's wording (the owner's rule of 20 September: a piece pressed alone is the dictionaries'); it is not the bridge's. Nothing in the page or the zones changes.

**Mend** (`tools/patch-b5-card-law.py`). B5's card law is the page's rule: the card opens on the place's own division with its core block pressed; it says the place's reading above its pills as the line prints it, under the pieces' credit; and it presses the line's own piece where a pill of the block reads it, the block's first where none does. The check says which of the two each card is. Run alone on the tree it passes, B1 to B5; its verdict in the suite is cleared and its lane runs it again.

Lesson kept: a law I have not run is a guess. B5 was written while the tree was still building and went into the suite unrun.

## The suite (04:41 to 06:06 UTC) and the ship (06:08 UTC)

`suite/verdicts.tsv`. 197 checks, **195 clean**.

- The two that are not were known before this ship: `check-reading-rows-v1` R1 (the small phone's rows, red on live too) and `check-nothing-unlanded-v1`, which holds the tree against what is pushed. Run again after the push it passes.
- Two more were red at first pass and were this ship's own:
  - `check-spelling-bridge-v1` B5, the card law (above). Mended; clean on its second run in its lane.
  - `check-manifest-prints-unguarded-v1` L5: the mended check names the core block rule, so a fresh manifest credits that rule to it and the committed one was stale. The manifest was emitted again (189 rules declared, 177 named by a check, 12 unguarded) and the check is clean.
- The checks that read the tools or the manifest and had run before the mend were run again (`suite/after-the-mend.log`): eight, all clean.

**Shipped** (`commit-as-shipped.txt`): `main` 340cff8e3bcf1b816a4101925878e2ac3fa88231, one commit on f88c4df6e1 (978 files; `zone.html` untouched). `gh-pages` a7eee946878c06d720c738b7df0a52687924f2c7, «gh-pages follows main». Pages run 1380: success (06:09:36 UTC).
