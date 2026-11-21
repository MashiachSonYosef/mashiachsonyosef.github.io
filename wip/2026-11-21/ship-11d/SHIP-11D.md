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
