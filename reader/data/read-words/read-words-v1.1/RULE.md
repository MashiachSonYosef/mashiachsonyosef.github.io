# RULE — read words v1.1: the word place on every line, the edition's letters at Psalms 10:10, and Kedorlaomer's lost tag

20 November 2026 AD. Corpus lane (Moses). Written before the mender. It amends `../read-words-v1/RULE.md` (v192) in three points and changes nothing else in it. Nothing served is changed.

It answers the serving lane's letter of 14 November 2026 AD ("the eleven relays reviewed", its section on v192) and ask 8 of its letter of 15 November (put-back 35):

- «Psalms 10:10 read word 1. The piece carries TAHOT's spelling חיל where the read word is חל, so the pieces would spell חילכאים, not חלכאים. Carry the edition's letters with TAHOT's spelling beside them, as at I Chronicles 9:4.»
- «the lines carry no word number. Please add `place` as v179 did.»
- «Genesis 14:17, Kedorlaomer, has lost H3540 from its lattice piece. Send a one-line list in this shape, or say it waits for the reissue.»

## 1. Terms

All terms are v192's (`../read-words-v1/RULE.md` §1), and:

- **The word numbering**: word numbering v1.1, one file per book, `moses-word-numbering-v1/build-v1.1/numbering-v1.1/<book>.jsonl`. Default picks v1.2 reads v1.1, so this list reads it too. Word numbering v1 (`moses-word-numbering-v1/build/numbering-v1/<book>.jsonl`), which v179 read, is read beside it only to say where the two give a place another number.
- **A place's word place**: the `address` of the word numbering line whose `book`, `ref` and `s` are the book, the reference and the lattice surface of the place, with its one full stop written as a colon (`10:10.5` is written `10:10:5`). This is how v179 wrote `place`. Exactly one numbering line must match; none or two stops the mender.
- **A row that goes on after its first backslash**: a TAHOT row whose Hebrew column holds a letter after its first backslash, other than a lone section letter (פ or ס). v192 counted them (`counts-v1.json`, `tahot.of_them_word_letters`, and `rows_that_go_on_after_the_first_backslash`): there are 3.

## 2. The three changes

1. **`place` on every line.** Each line of v192's `read-word-tags-v1.jsonl` gains `place`, the word place of its place (§1), written right after `ref`. Every read word of one place carries the same `place`; the read word is told apart by `n`, as in v192. Nothing else on the line moves.
2. **The edition's letters, TAHOT's spelling beside.** Every piece of every line gains `hebrew_tahot`, TAHOT's Hebrew for the piece, as v192 carried it in `hebrew`. On a line whose `how_found` is `SAME_LETTERS`, `hebrew` stays as v192 wrote it. On a line whose `how_found` is `SPELLING_ASIDE`, the read word's letters are not TAHOT's, so the piece carries the edition's: its `hebrew` is the read word as the edition writes it, with a maqaf at its end taken off (as I Chronicles 9:4's piece carries no maqaf), and its `consonants` are that word's letters. Such a read word must have exactly one piece; more than one stops the mender, since the edition's letters could then not be cut along TAHOT's pieces without a rule for where. `tahot_spelling` on the line stays TAHOT's, and the `note` says what was done.
3. **The tag a lattice piece lost.** For each row that goes on after its first backslash and that is not a row a line of v192's list reads (`tahot_rows`): one line in `lost-tags-v1.1.jsonl`, in the shape of v192's tie lines, naming the lattice piece and what to set on it. The row's word is found through the word numbering's tie (`tahot.tied`, the file and the line of the row); the lattice position by its book, reference and surface, which must be v192's `lattice_v12` for that row. The piece is set to carry TAHOT's main tag, TAHOT's English (cleaned as v192 §3 cleans it) and `source` `TAHOT+MACULA`, the value the lattice writes where both sources give a piece. Its Hebrew, letters, role, MACULA English and MACULA class stay the lattice's. TAHOT's tag column writes a mark after the backslash; the mark is named in `marks_after` and not set on the piece, since the edition writes no maqaf inside the word. A row where the lattice already carries the main tag, where the lattice position has other than one piece, or where the piece's letters are not the row's letters taken on both sides of the backslash, stops the mender.

## 3. Checks, each a hard stop

1. The TAHOT file the mender reads and TBESH are the bytes and sha256 the STEP manifest lists.
2. Every line of v192's list is carried, in its order, with every field it had, changed only as §2 says.
3. Every place has exactly one word place, and every read word of a place has the same.
4. The rows that go on after their first backslash are v192's 3, and each is either read by a line of v192's list or gets a line in `lost-tags-v1.1.jsonl`.
5. A second count by another road agrees (`verify-read-words-v1.1.mjs`): it finds the word places by walking the numbering files on its own, reads TAHOT's four files again for rows that go on after the first backslash, and recounts every line.
6. No file the mender writes holds a path of this machine or the home folder's name.
