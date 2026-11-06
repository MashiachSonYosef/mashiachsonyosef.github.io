# The comma ledger for Strong's (v102): wired, measured, tabled (6 November 2026)

Moses's punctuation declaration for Strong's Hebrew Dictionary via Open Scriptures (M9, relay v102) was wired on a worktree, measured, and **tabled by the owner** before anything shipped. Nothing here is live. The page still divides every dictionary by the global rule (sense-split-rule-v3).

## What the owner said

- First ruling: keep the King James lists whole ("too aggressive of splitting ... we hate stripping context"). It rested on my own "e.g." in the question, which the owner read as Strong's own words ("if it says e.g. then i think it would stay married to say"). Strong's writes no "e.g.": its usage field is the King James words separated by commas.
- Then, shown that the lines move: "i still kind of have a bad feeling about king james dictionary im on the fence maybe table it too". So it is tabled, like the King James download. Branches B01 and B02 keep resting, and nothing of v102 reaches the page.

## What was built (wiring.patch, against main d0f77f5f)

- `tools/bake-declared-cuts-v1.mjs`: runs the declaration's classifier over every route of a declared source in the served store and writes `data/declared-cuts-v1.json`, which holds the offsets of the marks each divided route is cut at. It refuses on a sha256 that differs from the relay's, a branch without a ruling, a cut in an unbalanced text, a piece that does not rejoin, or counts that differ from the declaration's. On the served store (dfb3a92c356e) it gave Moses's own figures: 23,646 routes, 1,293 divided at 1,659 cuts, 9 dividing shapes. The file is 117,861 bytes (40 KB gzipped).
- `tools/declared-cut-v1.mjs`: the one answer to "which readings does this route give". A declared source is cut by its file. A route the file does not list is one reading, and a route whose parentheses do not balance is held back whole. Every other source goes through packSplit, then sense-split-rule-v3.
- `zone.html` (the card pool, the record panel's grouping and senses, the lead record's own wording), `gloss-store-v1.mjs` (the reading pool behind every baked line), `gloss-m-v1.mjs` (the license columns), `proper-name-v1.mjs` and `project-lattice-v12-v1.mjs` all ask that one function.

To regenerate: copy `openscriptures_strongs.declaration.json` and `openscriptures_strongs.classifier.mjs` from R2 `corpus-lane-builds/moses-provider-declarations-v1/openscriptures_strongs/v1.1/` to `reader/data/provider-declarations/openscriptures_strongs/`. Then run `node tools/bake-declared-cuts-v1.mjs --m M9 --dir data/provider-declarations/openscriptures_strongs --relay <FOR-ELIJAH-v102.md> --ruling B01=<option> --ruling B02=<option> --ruled "<who, when>"`.

## What it did, measured

- **The card.** Strong's routes give 25,305 readings where they gave 43,323. 15,648 of the 23,646 routes are unchanged. A King James list is one pill, a label stays with its gloss ("properly, to stretch"), and a name stays with its description ("Achijah , the name of nine Israelites"). 35 texts whose brackets do not balance are held back whole; today the page prints parts of 7 of them.
- **The card at Amos 1:3, amar.** One long pill is added ("answer, appoint, avouch, … × verily, × yet"), but every one of its words still stands on its own. Wikisource's Strong's concordance (M14) lists the same King James words one per row (52 under amar). Screenshots: card-today.png, card-whole.png in the session scratchpad, sent to the owner.
- **The line.** The line orders readings by the oldest year among each reading's carriers, then by the best rank among them. Strong's (1890) split-off words lent "1890" to common glosses that a modern source ranks first. With Strong's whole, the order picks other readings:
  - 7,754 of the 142,266 base lines move across the 40 works, as do 2,392 of the 2,563 name leads. Examples: אב "father" → "fruit" (M14's "greenness, fruit" entry now leads), אבל "Abel" → "but", דן "Dan" → "Daniel", אשדוד "Ashdod" → "Ashdod , a place in Palestine".
  - Of the 340,785 baked lines (witnessed columns aside), 51,209 are readings Strong's carries today. Only 2,453 would have no pill left (mostly names Strong's alone split from their description).
- **The witnessed columns.** 345 lines credit Strong's. Under the cut, 321 of them would no longer be Strong's own pills, and 3 would be no one's.

## If it comes back

The line needs its own rule first. The owner was offered keeping the lines as today, with Strong's words still counting, inside their list, toward which reading leads (about 0.7% of lines change). The other option was letting them follow (5.5%). Wikisource's Strong's would need its own declaration (Moses, ask v1.1) before the King James words stop standing alone.
