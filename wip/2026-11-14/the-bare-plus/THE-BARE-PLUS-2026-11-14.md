# A hidden sign's gap takes no joiner of its own

14 November 2026. Page lane (Elijah). Shipped: main 82da4fbaf8, gh-pages cc869d602f. The owner's call 9 of 13 November, answered on 14 November with «just go with your recommendations its fine»: the bare "+". Keep the gap, drop the joiner beside it.

## What was wrong

Under the signs switch off (the page's default since 3 October), a piece of a reading that is a sign and nothing else («<obj.>», «<the>», STEP's «¿») is not drawn. On 16 October the owner ruled that it keeps its place as a gap: nothing is left out. The joiner beside it stayed, so a line could print a "+" with nothing on one side of it. At Genesis 1:1 the line under וְאֵת read «and +», and under הַשָּׁמַיִם it read «+ heavens» once the article was hidden. The fresh readers counted it (relay v184 §5: "a line that begins with a bare plus sign, its first piece printed empty"). At rest, 15,483 lines of 400,242 printed such a "+".

## The rule

`sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap`. A joiner stands between two pieces that print, and nowhere else.

- «and + <obj.>» draws «and» and its gap.
- «<the> + heavens» draws the gap and «heavens».
- «and + <the> + well-being» draws «and», its gap, « + », «well-being».

The gap keeps its place, and its slot where the line is laid in pieces or in a run's cells.

## The page (zone.html), edits 88, 92 and 94

- **The line's text is what it draws.** `signsOffLine` joins a line's pieces by the rule (`joinDrawn`). A line that holds a gap is read back into its pieces by the gap as well as by its joiners (`piecesOfDrawn`), so `pieceLine` lays it in the same pieces whether or not a joiner stands beside the gap. It draws no separator beside a gap (`.g-pp.at-gap`, hidden). A maqaf run draws no separator beside a cell that is a gap (`.g-sep.at-gap`, hidden). A run's title reads the drawn text. The export asks its record by the line as drawn.
- **A joiner that is not drawn stands in no row (edit 92).** A run's line is let down to fit its column (`fitRunLine`, 23 October) when its children stand in more than one row. A hidden element reads a rectangle whose top is 0. Counted, the hidden joiner made a second row of every run that holds a gap, and every such run was drawn at four fifths of its size. At Amos 1:3, «Gilead» under the object marker's run stood at 8.24px beside its neighbors' 10.56px (`pictures/bare-plus-amos-1-3-the-run-let-down-before-edit-92.png`). The pictures caught this, not the checks, so G3 below now holds it.
- **A run's gap cell keeps its slot (edit 94).** Among a line's pieces a gap holds 0.55em. A run's own cells take `min-width: 0` so a long reading can wrap inside its cell (31 October). That rule is the more particular one, and it held a gap's cell to 0px wide, on the old page as on the new. While the joiner stood beside it, the "+" marked the spot. With the joiner gone, the cell holds its own slot.

## The checks

- **New: `check-sign-gap-joiner-v1`** (RUN: tree).
  - **G1.** Every line at rest that holds a gap, in every work, reads back into its pieces and draws again to the same text. A gap is a piece of its own wherever it stands, so a joiner left out between two pieces that print fails as well. No reading holds a zero-width space of its own: none of the 22,063 lines with a gap does (`tools/gap-inside-a-piece.py`).
  - **G2.** The recordings hold each shape a gap takes: 6,580 run cells that are a gap, 14,916 lines with a gap at an end beside a piece that prints, and 575 with a gap between two pieces that print.
  - **G3.** The joiners no recording holds, read on the page itself. A run is recorded cell by cell, and a laid line by its text. So the check serves the tree itself and opens the shortest works whose recordings hold all three shapes, until runs and laid lines with a gap have both been judged (Habakkuk and Zephaniah today). Once the lines are at rest:
    - every separator shows "+" exactly between two pieces that print, and nothing beside a gap;
    - every gap keeps its slot;
    - every run comes out the same size when the page's own redraw (`__drawAllTies`) fits it again with the hidden joiners in place and with them taken out.
- **`check-line-reads-the-place-v1`** builds the line it expects by the rule. Its now unused `spanJoin` in the page reading goes.
- **`check-line-follows-card-v1`** reads a run of joiners as one, and a joiner at either end as none.
- **`check-block-in-table-v1`** (edit 96, a check's own fault, not this change's). Its wait for the concordance row gave up
  after 8 seconds in silence, and the check then judged the absent row as a wrong one. That happened once, in the
  first suite run after a restart of the machine («row 0 blocks, reads [], the line ["from","Tekoa"]», at a
  word with no gap). Run alone under the same load, it passed twice. Its wait now runs to 20 seconds and says
  whether the row came; B2 and B3 say "the row never came" where it did not.

## What moved, measured against main (044a49ddfc)

- **Lines at rest:** 15,483 of 400,242, each only by the joiner beside the gap, with the credit unchanged (`tools/lines-moved-by-the-gap-rule.py`, `logs/g13-…`):

  | where the gap stands | lines |
  |---|---:|
  | at the start | 12,438 |
  | at the end | 2,478 |
  | between two pieces that print | 567 |

  Nothing else moved. Run cells are recorded alone, so they do not show here; their joiners are G3's.
- **The chain books' cards:** 14,354 words, lifted and at rest; the same links (`logs/g15-…`).

## Proofs

- **Fault harnesses.**
  - `tools/fault-sign-gap-joiner.py`, 7 of 7 as meant (`logs/g09-…`): the sound recordings pass, and each broken recording fails on the line it names. The broken ones are the old page's own recordings, a joiner left out, a joiner on both sides, the gap dropped, no gap between two printed pieces, and one leading joiner.
  - `tools/fault-sign-gap-joiner-page.py`, 6 of 6 as meant (`logs/g11-…`): the page passes G3, and five broken copies of it fail G3. The broken copies are: the fit counting a hidden joiner (edit 92 undone), the gap's cell held to nothing (edit 94 undone), a run drawing its joiner beside a gap, a laid line doing the same, and a run leaving out every joiner.
- **The two edited checks** pass (`logs/g05-…`, `logs/g06-…`).
- **The suite** (`logs/g17-suite.txt`, on the final tree): 152 of 154 pass. Two are red:
  - `check-nothing-unlanded-v1`, which is red until a build ships, as before every ship. It passed once this one shipped (`logs/g20-…`).
  - `check-block-in-table-v1`, the timing fault above. It ran before edit 96, and passes with it.
  The two earlier runs were stopped, one for the fit fix and one by the restart (`logs/g10-…`, `logs/g14-…`). Neither had a red besides these two.
- **The gate** (`logs/g18-…`, `logs/g19-…`): 9,383 lines on 18 pages of 9 books, and 54 cards. 400 lines differ, every one by the joiner beside the gap alone, with the chip unchanged. The cards carry the same pills, with the same one pressed.
- **Lint:** the changed tools carry no finding their live copies lack.

## Pictures

- `pictures/bare-plus-genesis-1-1-before.png`, `…-after.png`: under וְאֵת, «and +» becomes «and», its gap kept.
- `pictures/bare-plus-amos-1-3-before.png`, `…-after.png`: «iron +» becomes «iron». The run אֶת־הַגִּלְעָד went from «Gilead + | +» to «Gilead», with the object marker's cell holding its slot.
