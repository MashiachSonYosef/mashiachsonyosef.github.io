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
- **The pill is purple**, not blue. The owner, 14 November: «maybe instead of in blue it should be in purple, purple is usually our comments but it could be arguable that the licenses comments are the same?». Blue is a reading, a source's word for the word; a word sense is the source's note on the word, which is a comment. It is the regular purple, bold when pressed. It keeps the page's own face, because the reading face is the blue's alone (THE READINGS WEAR A STEADIER FACE, 2 October).
- **The count is what «show» brings.** The gate is asked last, after the source switches, the pointing and the stem, so a row one of those withholds is counted there. It counts word senses as the card prints them, one pill each, however many of Jastrow's rows print the same sense. At Obadiah 1:3 four rows print two senses. Counted by rows, the card had said «4 word senses … held back» and its press brought 2 pills; W3 now asks that the two numbers agree.
- **A word sense the reader pressed is held back too.** Pressing a purple pill puts the word sense on the line under the word, as any pill does. When the switch goes back off, the page forgets the word senses the reader pressed, and only those. It then lays the sections again, as the reset pill does, so the line reads what it read before the press. The page's precedence says a reading the reader pressed outranks every switch, but this rule's promise is that a word sense prints only while its switch is on. Before the fix, the card held the word sense back while the line under the word went on printing it (found by this lane's probe at Obadiah 1:3). The card closes when that happens, as it does under every switch that lays the sections again.
- **The D+M card is unchanged.** It shows Jastrow's definition as served, brackets and all, as the owner asked.
- **No line moves.** The line under the words is the store's; the dictionaries beside it never lead one.
- The switch also stands on the rail (?rail=all) and on the switches page (/toggles/, built again from the rail: 14 switches) as «word senses: held back / shown». The reset pill puts it back to held back.
- The search index takes no word sense as a reading, as it takes no opening of a numbered sense, because a card at rest shows none.

## The legend, in purple, where it is true

The owner, 14 November: «i dont really see your legend that signifies its a sense, should it say that in purple somewhere if we are stripping the brackets / or is a sense not a comment?».

A word sense is the source's comment on the word, so it is purple. Two things now say so:

- **The pill.** It strips the brackets and says «word sense, not definition: » before the words, in purple.
- **The record card.** The card keeps Jastrow's brackets, as the owner asked, and the owner's legend, «brackets mean sense, not definition», stands in purple under the record, but only where it is true.

The corpus lane's legend file holds that it is not true of every bracket: on 550 cards a bracket is an aside, and 1,785 rows it could not match. The rows where it holds are counted but not listed. So the page shows it where the lane's own lists prove it: the record shows exactly one bracket, the lane lists that bracket's words as a word sense under the same key, source and definition field, and no row with that definition field is on the aside list. That is 3,328 of the 4,814 Jastrow rows whose definition holds a bracket (`tools/count-legend.py`). The bake carries them in the record (`legend`), and the page asks it of the row whose wording prints.

Most of Jastrow's bracketed entries never print on a card at all: the overlay serves each one behind a bare row of the same reading and source (4,021 of 4,814), and the card prints the earliest row. So the legend shows where a bracketed entry is the record a card prints: 580 of the 3,328 rows. W6 finds them, for example Malachi 3:22, word 12, «rule»: «… [circle, drawing, engraving,] law, rule, custom …», with the legend under it, and asks that the other records pressed show none.

The letter to the corpus lane still asks for the list of the 2,479 cards where the legend holds by its own count.

## The files

- `reader/data/word-senses/jastrow-word-senses-v1/`: the lane's folder, byte for byte (RULE.md, the list, its receipt, the legend, the aside cards), and `PIN.json` naming each file's bytes and sha256 as the relay gives them.
- `reader/tools/bake-word-senses-v1.mjs`: the list carried to the page, `reader/data/word-senses/jastrow-v1.json` (53,827 bytes: each row by key, rank and source id). It refuses a file that is not its pinned bytes, a line it cannot read, a row listed twice, and a word sense the served overlay does not hold as the list says. The round runs it before the search index.
- `reader/zone.html`: the switch (`fh.senses`, ?senses=), the rows marked as they come from the overlay, the gate in the pool and its count, the pill's print and its purple, the card's count and press, the rail's switch, the reset, and the forgetting of a word sense pressed (`forgetSensePicks`).
- `toggles/index.html` and `toggles/shots/row-senses.png`: the switches page, built again.
- `reader/tools/bake-search-index-v1.mjs`: no word sense enters the index.
- `reader/tools/check-word-senses-v1.mjs`, new (RUN: tree):
  - W1: the record is the bake of the pinned list against the served overlay.
  - W2: on a first visit the switch rests off.
  - W3: on cards found from the record and the zones, smallest works first: off, no pill prints a word sense; the card says how many it holds back; its press shows them, each on Jastrow's records alone, every other pill in its place; pressed again, the card is as it was.
  - W3 also asks that every word sense shown says so on its pill and wears the page's purple, that no other pill does, and that the count on the card is the number of pills its press brings.
  - W4: the reset puts the switch back where it rests.
  - W5: a word sense pressed prints on the line; with the switch turned off, the line reads what it read before the press, and a reading pressed on the word beside it stays where it was. The last half found a live fault of its own (`../the-core-block-ruling/`).

## What moved

MEASURES.

## Proofs

- **The new check** passes (`logs/q10-…`): Obadiah 1:3, 2 held back, 2 pills, «word sense, not definition: who will?»; Obadiah 1:8, 1 held back, «… retentive»; W5 at Obadiah 1:3, words 11 and 10.
- **Fault harness:**
  - With the gate taken out, W3 fails: 69 cards print a word sense with the switch off.
  - With the switch resting on, W2 fails, and W3 and W4 with it.
  - With the pill painted blue again, W3 fails: «… wears rgb(35, 85, 138), not the page's purple rgb(100, 36, 96)» (`logs/q02-…`).
  - Counting rows, W3 fails: «the press said 4 held back and showed 2» (`logs/q09-…`).
  - Before the forgetting, the probe showed the line printing the word sense with the switch off (`logs/q00-…`).
- **Lint:** the page script, the bake and the check carry no finding; the search index's bake none its live copy lacks.

SUITE. GATE.

## Pictures

PICTURES.
