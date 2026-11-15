# RULE, amended — default picks v1.1: STEP's dictionary is read by the number TAHOT names

13 November 2026 AD. Corpus lane (Moses). An amendment to `default-picks-v1/RULE.md`, and a mend of a fault in default picks v1 (relay v180). The audit of lines and pills (relay v181) found it.

## The fault

Default picks v1 worded STEP's second and third picks at a place (a meaning variant's entry, an alternative number) through STEP's dictionary TBESH, and found a TBESH line by its **first** column. TAHOT names an entry by the number in TBESH's **second** column (`H1254A`, `H7225G`). The first column is another numbering: it writes the letter small (`H1254a`), and it gives one number to several meanings (`H7225` for both `H7225G` and `H7225H`). So in v1:

- an alternative number that carries a letter found no TBESH line: the pick has no words and no rows;
- a meaning variant whose entry carries a letter found no rows;
- a number written without a letter found the first TBESH line of that first-column number, which is the right line only where the second column says the same.

STEP's reading at each place (the pick of kind `r`), and every pick of MACULA, UBS and BDB, do not pass through TBESH and are not touched.

The second count of v1 read TBESH the same way, so it agreed. That is the weakness of a second count by the same hand, and the reason the owner asked for an audit.

## The mend

TBESH is read by its second column: a line's number is the `H`, digits and letter that open that column. A number TAHOT writes without a letter, that no second column holds (`H0376`, where TBESH has `H0376G`, `H0376H`, `H0376I`), is the entry itself among the lines whose first column is that number: the one line whose second column says `=` and nothing more (`H0376G =`; the others say `= a Meaning of`, `= a Name of` and the like). Where there is no such line, or more than one, the pick has no words and the receipt counts the number. Everything else in `default-picks-v1/RULE.md` stands. (The sentence on a number without a letter was added after the mender's first run, which left 729 such picks without words.)

## What is issued

The book files and the rows table of v1 stay as they are; this amendment is issued as what changes, to spare the disk:

- `step-mend-v1.1.jsonl`: one line for each place whose `step` picks change, `{"book", "p", "step"}`, the whole new `step` array of the place in v1's shape. A place not listed keeps its v1 line whole. Every listed place keeps its `macula`, `ubs` and `bdb`.
- `rows-added-v1.1.jsonl`: the served rows the mended picks name that v1's table does not hold, in v1's row shape. They are numbered on from the end of v1's table: the first line here is row number 152,423 (v1's table has 152,423 lines, numbered from 0), unless the receipt says another count.
- `receipt-v1.1.json`.

Default picks v1.1 is v1 with each listed place's `step` replaced and the added rows appended to the table.

## Checks the mender makes, each a hard stop

1. at every place, the pick of kind `r` is v1's, byte for byte, and so are the place's picks of MACULA, UBS and BDB (they are read from v1 and not rebuilt);
2. every place whose `step` picks do not change equals v1's line; every place that changes differs only in picks of kind `v` or `a`;
3. every row a mended pick names stands in the served store under its key with the TBESH gloss of the pick's entry;
4. the picks of each listed place are numbered 1 to n.

## The second count

`verify-default-picks-v1.1.mjs` reads TBESH with its own reading of the second column, applies the mend to v1, and holds every pick of kind `a` at every place to the gloss of its number, and every row a pick of kind `v` or `a` names to that gloss; it must also find the receipt's counts.
