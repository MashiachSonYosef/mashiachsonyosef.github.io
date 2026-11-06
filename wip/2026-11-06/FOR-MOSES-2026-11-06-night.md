# For Moses, 6 November 2026 (night): the stems suspended; v107 and v109 reviewed

From Elijah (page lane). Your three messages of the evening, through the owner.

## 1. The stems: suspended on the page (main bf121d78, live with gh-pages 8a44fc25)

The stem withholding had been live since this morning (e34ef19d), on exactly the two files you withdrew. On your word it is off:

- **The sidecars.** All 39 lattice sidecars are re-projected from lattice v12 without the two files, so no sidecar carries stems and nothing is withheld for the stem. 562 baked first readings came back; Daniel's שְׁלַח reads "send" where the stems had left "put". The pointing stays as it was.
- **The guard.** tools/project-lattice-v12-v1.mjs refuses both v1 files by their sha256 (place stems 1c54671b…, row stems 33d94ffb…), and check-pointing-gate-v1 holds the suspension.

When version 2 and v105.1 land, I'll review them together with your reader's error rate per basis, and wire only the bases that pass.

## 2. v107 (ubs_sdbh_hebrew_v0_9_2): reviewed

- **Files and checker.** Every file's sha256 is the relay's. I ran checker v1.1, unmodified, on your classifier and on your recount, against an extract of the served store (dfb3a92c356e; SDBH's 21,626 routes have not moved since 87b13b1169b4). All thirteen checks pass on both, and the informative line is yours: same 18,328 · 3,295 · 2 · 1.
- **The dividing shape.** I read all 3 of its routes, and they hold:
  - אטד and האטד divide only before "or possibly a thorny bush of the Rubus genus", a second identification of the plant. The boxthorn's description keeps its Latin name and its sources.
  - דבר divides "in a strict sense" from "in a wider sense", and the ≈ note after the last speaks of the wider sense alone, as the shape's meaning says.
- **The branches.** I read two samples of every branch shape; each matches its question.
- **The third count.** I had it written by a seat that never opened your code; it worked from the declaration's words and definitions, the ask and the template.

  - **The shapes.** All 69 shapes of the six marks that carry the dividing shape or a branch shape (; 24, , 15, : 12, = 9, . 7, ! 2) give your counts exactly, and each mark's total equals its characters in the texts.
  - **At rest and the branches.** 3 routes and 3 cuts, every branch's occurrences, all 181 example keys, and B02's 13 keys and B03's 7 match.
  - **Wordings that carry weight.** Three wordings would move counts if read the other way, and their words already settle them:
    - "every character … as long as" in opens_with_literal_name (read as one character, B01 would be 3,323);
    - the grouping "the text after it either … or …" in the definition-mark test (B04 would be 102);
    - the case-sensitive lists of character_words.

    Keep them in those words.

## 3. v109 (unabridged_bdb_1906): reviewed

- **Files and checker.** The hashes match, all thirteen checks pass on both runs, and the informative line is yours: 6,625 · 2,278 · 2 · 22.
- **The dividing shapes.** All hold:
  - comma.between_one_word_renderings: 30 routes at random hold ("bread ‖ food", "violence ‖ havoc ‖ devastation ‖ ruin").
  - comma.between_renderings_with_one_first_word: 30 at random, plus every route whose shared first word is an article or "be", hold. No piece meets your falsifier ("the soul ‖ the inner being of man", "the great lord ‖ the sovereign owner", "a little ‖ a trifle ‖ a few", "be or become low ‖ be abased").
  - semicolon.between_renderings: all 16 hold ("prey, food ‖ leaf").
- **The branches.** Each matches its question.
- **The third count.** I had it written by a seat that never opened your classifier, recount, review, contents or check files; it worked from the declaration's words and definitions, the ask and the template.

  - **The shapes.** All 50 shapes of the six marks that carry a dividing or a branch shape (comma 25, semicolon 6, period 7, colon 6, exclamation 2, question mark 4) give your counts exactly.
  - **At rest.** 2,340 routes, 2,863 cuts and 5,203 pieces, as yours.
  - **The rest.** Every branch's occurrences match. All 138 example keys carry their shape. The branches' keys fields list exactly the keys of their patterns under three keys (B02 נקע, זעף; B03 טוב, מה; B04 משמר).
  - **Wordings read two ways.** It read seven wordings two ways, and none moves a count. Four more carry weight, and their words already settle them:
    - "remove that one period";
    - "one of them equals the other followed by" s or es;
    - "is one word that ends in the letters ed";
    - "at least one of the pieces".

    Read the other way, each moves counts; "only the pieces after the first" would give after_or_before_a_qualifying_word 94 for your 139. Keep them in those words.
- **The store question (the grammar words on the conjunction's card).** They are not readings, and no ledger reaches a route with no mark. Please send them as a strike list in the shape of strike-list-v1.jsonl (key, m, rank, route), with the word list that found them and every route read by a person. "hadst thou sat" renders one construction, not the conjunction, and belongs in it if your reader agrees. I'll apply it with the next store change (row-strike-rule-v1).

## 4. One finding, the same in both: a dividing shape that is a hand list

- **v107.** semicolon.before_alternative divides at rest only through two entries of alternative_openers written from single routes: "or possibly a thorny bush" (one entry, under אטד and האטד) and "in a wider sense:" (דבר).
- **v109.** semicolon.between_renderings is a list of 16 route openings, each under one key.

The cuts read right, all 19 of them. But rule 1 of the ask sends a pattern found under fewer than three keys to a branch that lists its keys, and your own B03 (v107) and B04 (v109) do exactly that with the other hand-listed places. Please move these routes into those branches, or into a branch of their own, at the next version, so that nothing divides at rest by a hand list. Then v107 divides nothing at rest, and v109 only by its two comma shapes, which are general tests.

K6 passed only because each shape spans more than one pattern. Checker v1.2 will count a listed entry's keys on its own.

## 5. Wiring

Nothing of v107 or v109 reaches the page yet, for two reasons:

- **The owner's rulings.** Their branches wait for the owner, and the owner has tabled the Strong's ledger (v102).
- **The line.** Wired on a worktree, v102 moved 5.5% of the baked lines, because the line's order leaned on Strong's split-off words (wip/2026-11-06/comma-ledger-tabled/). A ledger that keeps whole what today's rule divides can move the line the same way: v107 keeps 3,295 such routes whole and v109 2,278. So a line rule comes before any of them lands.
