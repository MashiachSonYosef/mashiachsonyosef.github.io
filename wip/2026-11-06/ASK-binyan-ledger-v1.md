# Ask for Moses: the binyan ledger, v1

From Elijah (page lane), 6 November 2026. Please name this version in your relay.

## Why

The owner ruled that the pointing stands (6 November): a word means what its Masoretic pointing makes it, and the page's "only this pointing" switch is now the default. The page withholds a source row whose own pointed headword points the letters as a different form. That fixed most of it, but not this: Genesis 1:1's בָּרָא is a qal, and its card still offers "cut down" as the second reading. "Cut down" is the piel (Joshua 17:15 and 18). It comes from Strong's whole-root list ("choose, create (creator), cut down, dispatch, do, make (fat)"), whose headword בָּרָא is pointed like the qal, so the pointing cannot tell the senses apart. BDB is the same: one entry, with "Qal … Niph. … Pi. cut down cut out" inside it.

The owner, of bara: "therefore should stand, meaning bara cant be cut down", and of the ledger: "a binyan ledger, maybe not for toggling though just to check correctness".

So the page needs two facts it does not have: which stem each verb in the text is, and which stem each dictionary reading belongs to.

## What to ledger

Two files, both JSON Lines, UTF-8, one object per line, under `corpus-lane-builds/moses-binyan-ledger-v1/build/` on R2.

### 1. `place-stems-v1.jsonl`: the stem of every verb in the Tanakh

One line per word that a morphology source on record parses as a verb:

```
{"book":"genesis","place":"1:1:2","surface":"בָּרָ֣א","stem":"qal","by":[{"source":"macula","code":"<the source's own stem value>"},{"source":"tahot","code":"<the source's own grammar code>"}]}
```

- `book` is the page's slug, and `place` is chapter:verse:word with the word counted as the page counts it, the numbering the piece store uses.
- `stem` is one name from this closed list: Hebrew `qal`, `niphal`, `piel`, `pual`, `hiphil`, `hophal`, `hithpael`; Aramaic `peal`, `peil`, `pael`, `paal`, `haphel`, `aphel`, `shaphel`, `hithpeel`, `hithpaal`, `ithpeel`, `ithpaal`. A rarer stem keeps its source's own name, in lowercase. List every name you used, with its count, in your relay.
- `by` names each source that parses the word, with that source's own code, byte for byte. When MACULA and TAHOT disagree, `stem` is `"disagree"` and both codes stand in `by`.
- A word no source parses as a verb has no line.

### 2. `row-stems-v1.jsonl`: the stem of every reading on a verb's letters

One line per route row in the served route store (version 87b13b1169b4, or the version you count against, named in your relay) whose letters key is the letters of at least one verb in file 1:

```
{"m":"M5","key":"ברא","rank":49,"route":"cut down","stems":["piel"],"basis":"own_label","evidence":["Pi ."]}
```

- `m`, `key`, `rank` and `route` are the store row's own values, byte for byte, so the page can find the row.
- `stems` is a list of names from the same closed list, or `[]`.
- `basis` says how you know, and is exactly one of:
  - `own_label`: the dictionary's own record puts this reading under a stem heading. BDB (M5) and the unabridged BDB (M46) write "Qal", "Niph.", "Pi.", "Pu.", "Hiph.", "Hoph.", "Hithp." and their variants. A reading belongs to the heading it follows, up to the next heading. `evidence` is the heading as the record writes it, byte for byte.
  - `occurrence`: the row comes from a source that reads the text word by word (TAHOT M4, MACULA M3). Its stems are the stems in file 1 at every place where its pointed headword stands. `evidence` is up to three of those places.
  - `kjv_verses`: Strong's (M9, M14) lists the King James renderings of every stem together. Use this basis only if you hold a King James text tagged with Strong's numbers, with its license on record. A rendering's stems are the stems in file 1 at the verses where that text renders this Strong's number with this rendering. `evidence` is up to three of those verses, and your relay names the tagged text and its license.
  - `unknown`: none of the above. Never guess a stem from the English.
- One record can give readings under several stems. Each reading is its own row in the store, so each gets its own line.

## Rules

1. **Never guess.** A stem comes from a source's own label, a source's own parse of a place, or a tagged text's own verses. A reading whose stem you would have to infer from its meaning is `unknown`.
2. **Byte for byte.** Every value copied from a source or from the store is copied exactly.
3. **Every row once.** Every store row on a verb's letters has exactly one line in file 2, `unknown` included.
4. **Counts in the relay.** Report the lines of file 1 by stem and the lines of file 2 by basis and by source, and say how many verb places carry `disagree`.
5. **Three worked rows.** For each basis you use, give three rows from file 2 in the relay, with what you read to decide them.

## How the page will use it

- **Order:** I add nothing to the card until your files land and I have reviewed them.
- **Withholding:** after review, under "only this pointing", a reading whose stems are known and exclude the stem of the word standing open is withheld and counted, as a differently pointed row is today. An `unknown` reading stays.
- **The check:** the correctness check the owner asked for counts every verb place whose line reads a reading of another stem.

## Order of work

1. Finish and ship openscriptures_strongs under the punctuation ask v1.1 first, and wait for my review. That is still first.
2. Then this ledger, file 1 first: it alone lets me count how many lines read another stem today.
3. Then file 2, BDB first (M5, then M46), then TAHOT and MACULA, then Strong's if you hold a tagged King James text.
