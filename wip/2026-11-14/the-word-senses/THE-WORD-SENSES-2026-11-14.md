# Jastrow's word senses: held back at rest, shown as word senses on a press

14 November 2026. Page lane (Elijah). The corpus lane's relay v185.1, carrying the owner's ruling of 13 November on Jastrow's brackets. The «gold frames» label rides in the same update.

## What was wrong

Some of Jastrow's entries open a sense with a short note in square brackets on the word's sense. Under יָדִיד Jastrow's entry reads «[pointed out,] chosen, beloved; chosen spot.» The served overlay serves each such note as a reading of its own, so «pointed out» stood on the card as a pill beside the definitions. Under the trial's line B, which put Jastrow first, it even ranked first.

## The owner's ruling, 13 November 2026 (relayed in v185.1)

> seems like the correct definition would be to strip the brackets and add their meaning. then maybe toggle it so it could be like "toggle on word senses" and the actual R pill showing something like "word sense, not definition: pointed out"

> and in the D+M card we would leave it bracketed if that makes sense

> with a legend maybe saying brackets mean sense, not definition

> ok i relayed your whole message to elijah sounds right, wherher the toggles on or off leave that to elijah. you just work on the backend

## The rule

`word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off`

- **The rows** are the corpus lane's WORD_SENSE branch: 2,974 rows under 1,559 keys (M12 2,656, M39 255, M49 33, M65 15, M75 11, M106 4). Every one of them was found in the served overlay by its key, rank and source id, with the same route and definition.
- **At rest the switch is off.** The owner left the resting position to this lane. Off, because the owner's own words are "toggle on word senses", and a note on a word's sense is not a definition.
- **Off:** such a row is held back from the card. The card's line of what it withheld says how many: «2 word senses, not definitions, held back — show». The «show» is a press.
- **On:** such a row prints as a pill of its own, «word sense, not definition: » and its route, beside the definitions. It never folds into a definition's pill. The card says «2 word senses shown — hide».
- The gate is asked last, after the source switches, the pointing and the stem. A row one of those withholds is counted there, so the count is exactly what «show» brings.
- **The D+M card is unchanged.** It shows Jastrow's definition as served, brackets and all, as the owner asked.
- **No line moves.** The line under the words is the store's; the dictionaries beside it never lead one.
- The switch also stands on the rail (?rail=all) and the switches page as «word senses: held back / shown». The reset pill puts it back to held back.
- The search index takes no word sense as a reading, as it takes no opening of a numbered sense, because a card at rest shows none.

## Not yet: the legend

The owner's legend, «brackets mean sense, not definition», is in the lane's `legends-v1.json`. But it holds on only 2,479 of the 4,814 Jastrow rows whose definition holds a bracket. On 550 the bracket is an aside, which the lane lists and is putting to the owner. On 1,785 the lane could not match the bracket to a sense. The rows where it holds are counted but not listed, so the page cannot yet put the legend only where it is true. A letter asks the corpus lane for the list (`FOR-MOSES-2026-11-14-word-senses-wired.md`).

## The files

- `reader/data/word-senses/jastrow-word-senses-v1/`: the lane's folder, byte for byte (RULE.md, the list, its receipt, the legend, the aside cards), and `PIN.json` naming each file's bytes and sha256 as the relay gives them.
- `reader/tools/bake-word-senses-v1.mjs`: the list carried to the page, `reader/data/word-senses/jastrow-v1.json` (53,827 bytes: each row by key, rank and source id). It refuses a file that is not its pinned bytes, a line it cannot read, a row listed twice, and a word sense the served overlay does not hold as the list says. The round runs it before the search index.
- `reader/zone.html`: the switch (`fh.senses`, ?senses=), the rows marked as they come from the overlay, the gate in the pool, the pill's print, the card's count and press, the rail's switch, the reset.
- `reader/tools/bake-search-index-v1.mjs`: no word sense enters the index.
- `reader/tools/check-word-senses-v1.mjs`, new (RUN: tree):
  - W1: the record is the bake of the pinned list against the served overlay.
  - W2: on a first visit the switch rests off.
  - W3: on cards found from the record and the zones, smallest works first: off, no pill prints a word sense; the card says how many it holds back; its press shows them, each on Jastrow's records alone, every other pill in its place; pressed again, the card is as it was.
  - W4: the reset puts the switch back where it rests.

## What moved

MEASURES.

## Proofs

- **The new check** passes (Obadiah 1:3, 4 held back, «word sense, not definition: who will?»; Obadiah 1:8, 1 held back, «… retentive»).
- **Fault harness:** with the gate taken out, W3 fails (69 cards print a word sense with the switch off); with the switch resting on, W2 fails, and W3 and W4 with it.
- **Lint:** the page script, the bake and the check carry no finding; the search index's bake none its live copy lacks.

SUITE. GATE.

## Pictures

PICTURES.
