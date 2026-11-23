# RULE — spelling bridge v1.2: STEP's «{tag}+» read as STEP's own key says

21 November 2026 AD. Corpus lane (Moses). Written before the builder. Nothing served is changed: this is a list for the serving lane.

## Why

Relay v214 (`../FOR-ELIJAH-v214.md`), section 5, named the fault and held it:

- «STEP writes «{H4648G}+» where one tag goes on over the next Hebrew word. v1's builder takes a brace off each end of a tag only (line 56 of `bridge-v1/build-bridge-v1.mjs`), so 43 pieces at 43 places carry a `tag` like «H4648G}+».»
- «CALL: the mend is bridge v1.2, relay v218, after v217, the last of v210's plan. It sets each such piece's `tag` to the number STEP names, reads the roles again at the 7 places and `main_tags` at the 43, and marks line 68 of the builder (section 7, finding 6).»

And its section 7, finding 6: «Line 68 of the builder changed (it returns the breaks too) without its «v1.1 change» mark; the line that uses it, 131, is marked as change 5.»

v1's line 56 reads a tag as the word's own (its «main» tag) only where it starts with «{» and ends with «}», and takes off one «{» at the start and one «}» at the end. A tag STEP writes «{H4648G}+» ends with «+», so it is not read as the word's own, and only its «{» comes off. Yet the lane's own rule for a main tag, which v1 follows (v192, `moses-read-words-v1/read-words-v1/RULE.md` §1), is «a tag TAHOT writes in braces `{..}`. It is carried without the braces.» STEP writes this tag in braces. v1 did not follow its own rule here, and v1.1 kept v1's fields as v1 wrote them (v1.1's RULE §1), naming the fault in its amendment.

## 1. STEP's key

TAHOT's own key for its tag column stands in each of the four TAHOT files, on the line whose first column is «dStrongs». Its second column holds, byte for byte: «Lexical tags for each element of the Hebrew words, including prefixes and suffixes, with the Root in {curly brackets}. A "+" indicates the same tag also covers the next Hebrew word.» The builder reads that line in each file and stops unless all four hold both sentences byte for byte.

**A tag part**: one part of a row's tag column (column 4, counting from 0), cut at every `/`, the part before its first backslash. Its shape is read with any white space at its ends set aside, as v1 sets it aside (v1 trims it); `tag_as_tahot_writes_it` (§4) keeps it byte for byte. By STEP's key a tag part has one of three shapes, named here in plain words:

- `PLAIN`: «H», then digits, then letters or none. Not in braces: not the word's own tag.
- `BRACED`: «{», then a `PLAIN` tag, then «}». The word's own tag (STEP's «Root»), v1's main tag.
- `BRACED_WITH_PLUS`: a `BRACED` tag, then «+». The word's own tag, and by STEP's key the same tag also covers the next Hebrew word.

The number a tag names is its `PLAIN` tag: the braces and the «+» taken off. Any other shape at a lettered part of a bridge place's rows stops the builder.

## 2. The class the mend reaches

- **The class**: every lettered piece of a bridge place whose tag part is `BRACED_WITH_PLUS`. v1 reads it wrong in its `tag` and does not read it as the word's own. These are the pieces v1.1 named in its receipt (`added_in_v1_1.pieces_whose_tag_is_not_a_plain_tag`).
- **The proof that the class is exactly these**: (a) over every part that holds a Hebrew letter, of every row tied to any of the bridge's lines, pieced or held, the shapes are only the three of §1; (b) the `BRACED_WITH_PLUS` parts there are v1.1's named pieces, piece for piece (book, place, index, v1's `tag`, STEP's tag part), and every place whose rows hold one is a pieced place, so no held line's `main_tags` is touched; (c) v1.2 differs from v1.1 at those places only, and only in the fields of §3, once §4's fields are set aside.
- **The other branches, counted, nothing changed**: `PLAIN` and `BRACED` pieces, which v1 reads right; pieces whose tag part as STEP writes it has white space at an end (v1 trims it, and so does v1.2); parts with no Hebrew letter (breaks), which give no piece and no main tag, counted by the shape of their tag part.
- The receipt also counts the tag parts of every TAHOT row by shape, so the serving lane sees where else STEP writes «+», outside the bridge.

## 3. What is mended, at the class's places only

- each piece of the class: `tag` becomes the number STEP names (§1), as v1 gives every `BRACED` tag.
- each piece of the class's places: `role`, read by v1's rule for roles, unchanged (v192 §3, row by row, as v1's RULE says), with the class's piece read as the word's own, as STEP's braces say. v192's words: «a piece whose tag TAHOT writes in braces is `core`; a piece before the row's first core is `prefix`; after its last core, `suffix`; between two cores, `between_cores`. Where a row has no tag in braces, its first lettered piece is `core` and the rest `suffix`.»
- each line of the class's places: `main_tags`, by v1's rule (the `tag` of every piece read as the word's own, in order), now with the class's pieces.
- the two fields v1's builder makes from `main_tags` and from nothing else, mended with it: `main_glosses_tbesh` (one entry per main tag, with TBESH's gloss) and `store` (`numbers`, the main tags' numbers once each; `under_key_ours` and `under_key_sources`, counted again in the same store copy v1 read, store_version 54416ff5785b). The lane's call: a line whose `main_tags` changed while these two did not would break v1's own definition of them.

Nothing else is changed. Every other field of every line stays v1.1's, byte for byte, and the lines stay in v1.1's order.

## 4. What is added: the «+» as STEP writes it

On every piece, right after `tag`:

- `tag_as_tahot_writes_it`: the piece's tag part, byte for byte, braces, «+» and any white space kept.
- `tag_also_covers_the_next_hebrew_word`: true where its shape is `BRACED_WITH_PLUS`, false otherwise.
- `the_next_hebrew_word_it_covers`: null where that is false. Where it is true: the next part, in STEP's order, that holds a Hebrew letter: first the later parts of the same row (a row's Hebrew can hold a part with no letter, as a space, between two lettered parts), then the rows after it in its own TAHOT file, in file order. It is named by `row` (that row's first column), `part` (counted from 0), `hebrew_tahot` (its Hebrew before any backslash, byte for byte), `tag_as_tahot_writes_it` (its tag part, byte for byte), `names_the_same_number` (true where its tag part names the same number), and `piece_of_this_place` (the `index` of this place's piece whose row and part these are, or null where it is none of this place's pieces).

Each piece of the class falls in one branch, counted in the receipt: `IN_THIS_PLACE_FROM_ITS_NEXT_ROW`, `IN_THIS_PLACE_FROM_THE_SAME_ROW`, `NOT_IN_THIS_PLACE`.

## 5. The list: `bridge-places-v1.2.jsonl`

One line per bridge place, the 1,173 lines of v1.1 in v1.1's order: v1.1's line with the mends of §3 at the class's places and the fields of §4 on every piece.

## 6. The changes: `changes-v1.2.jsonl`

One line per place of the class, in file order: `book`, `ref`, `place`, `class`, `use`, `pieces_of_the_class` (each `index`, `tag_as_tahot_writes_it`, and its branch of §4), and `changes`: every field that differs from v1.1, each `{field, v1_1, v1_2}`, the field named by its path (as `pieces.1.tag`, `main_tags`, `store.numbers`). The builder makes both values from its two readings, v1's kept beside v1.2's; it does not make them by comparing the files.

## 7. The proof asked: set back, v1.2 is v1.1

Take §4's fields off every piece of v1.2 and set every field that `changes-v1.2.jsonl` names back to its `v1_1` value: the file is `../bridge-v1.1/bridge-places-v1.1.jsonl`, byte for byte (its sha256). On that file v1.1's own check 9 runs again: v1.1's added fields off, it is v1's file byte for byte. And the section v1.1 added to its receipt (`added_in_v1_1`), made again from the set-back lines, is v1.1's receipt section byte for byte.

## 8. The receipt: `receipt-v1.2.json`

It keeps v1.1's receipt shape, made from v1.2's lines, and adds `added_in_v1_2`, each count with its axis named:

- tag parts by shape: over every TAHOT row; over the rows tied to the bridge's lines, lettered and letterless; over the pieces.
- the class: pieces and places, by v1's class and `use`; by the branch of §4; whether the next word's tag names the same number.
- what moved: places and pieces whose `role` moved, each with v1.1's roles and v1.2's; places whose `main_tags`, `main_glosses_tbesh`, `store.numbers`, `store.under_key_ours` or `store.under_key_sources` changed, each named.
- pieces whose tag part has white space at an end (nothing changed).
- after the mend: pieces whose `tag` is not «H», digits and letters (must be none), and pieces whose `tag` is not the number their `tag_as_tahot_writes_it` names (must be none).
- the figures of v1.1's receipt `counts` that read `store`, as v1.1 gave them and as v1.2 gives them.
- examples, by rule: the first place in file order of each branch of §4, whole.

## 9. The builder: `build-bridge-v1.2.mjs`

A copy of `../bridge-v1.1/build-bridge-v1.1.mjs` with these changes and no other, each marked `v1.2 change` in the code:

1. The usage takes one input more: v1.1's folder (`bridge-v1.1`).
2. A tag part is read by §1: its shape, whether it is the word's own, its number, its «+». STEP's key line is read and held (check 13). v1's reading is kept beside it, for §6 and §7.
3. Each piece carries the fields of §4; each row's place in its file is kept, so the next Hebrew word can be found.
4. `main_tags`, `main_glosses_tbesh` and `store` are made from v1.2's reading; v1.1's are kept beside them.
5. The class is proved (checks 14 to 16) and `changes-v1.2.jsonl` is made.
6. Check 9 is as §7 says; check 10 runs under v1.2's reading.
7. It writes `bridge-places-v1.2.jsonl`, `changes-v1.2.jsonl` and `receipt-v1.2.json` only; the receipt adds §8 as `added_in_v1_2`. The lines at the head of the file name v1.2.
8. The line of v1.1's builder that returns a row's breaks with its pieces (its line 68), changed in v1.1 without its mark, carries the mark `v1.1 change 5`; adding the mark is this change.

## 10. Checks, each a hard stop

1. to 5., 7., 8., 10., 11., 12.: v1.1's checks, as v1.1 wrote them; check 10 holds under v1.2's reading (the form rows made again are v1's two files byte for byte).
9. As §7.
13. Each of the four TAHOT files holds STEP's key line for its tag column, with both sentences of §1, byte for byte.
14. Every lettered part of every row tied to a bridge line has one of the three shapes of §1.
15. The class is v1.1's named pieces, piece for piece; every place whose rows hold a `BRACED_WITH_PLUS` part is a pieced place; every piece of the class finds its next Hebrew word.
16. v1.2 and v1.1, read as objects, §4's fields set aside, differ in exactly the fields `changes-v1.2.jsonl` names, and only at the class's places.
17. After the mend every piece's `tag` is «H», digits and letters, and is the number its `tag_as_tahot_writes_it` names.

## 11. The second count: `verify-bridge-v1.2.mjs`

By another road, not importing the builder: it reads v1.2, v1.1, v1.2's changes and receipt, TAHOT's four files and the store copy. It finds STEP's key by the sentence itself, not by the line's first column; finds each row by its first column; reads every tag part by a walk over its characters, not by a pattern; reads the roles by its own walk; finds the next Hebrew word by its own index of the rows; compares v1.2 with v1.1 field by field, key order included; sets the changes back and compares bytes with v1.1's file; counts `store` again for the lines whose `store.numbers` changed, from the store copy's shards; and recounts every count of §8 and compares it with the receipt. It writes `verify-receipt-v1.2.json`.

## 12. The answer: `ANSWER-v1.2.md`

In plain words, written by a script in `work/` from the files this strand wrote, every figure read from them.

## Amended before the builder's first run, while it was being written

§8's first line is made exact. Made from v1.2's lines, two fields of v1.1's receipt section would misname what they hold: `lines_equal_to_v1_without_the_added_fields` would give the sha256 of lines that are not v1's, and `form_rows_made_again_equal_v1` is written as a constant. So the receipt's `added_in_v1_1` is made from the set-back lines of §7, and must be v1.1's receipt section byte for byte (a part of check 9); v1.1's receipt `counts`, made from the set-back lines, must be v1.1's too. The figures of v1.1's receipt that read a piece's `tag` or `role` or a line's `store` are given again, made from v1.2's lines, in `added_in_v1_2.v1_1_figures_as_v1_2_gives_them`: v1.1's `examples`, its `pieces_whose_tag_is_not_a_plain_tag`, and the store figures of its `counts`. The receipt's own `counts` are v1.2's.

## Amended after the builder's first runs, before the two runs of record and before any ship

The builder's first run stopped at check 16 and wrote nothing: the changes named the right fields in another order than the line's own (pieces before `main_tags`). The changes now name their fields in the line's own key order (§6 is unchanged in what they name). The second count (§11) reads two inputs more than §11 names: v1.1's receipt, to hold the class to v1.1's named pieces and to hold `added_in_v1_1` and v1.1's `counts`; and TBESH, to make each line's `main_glosses_tbesh` again. Its first run read TAHOT's interlinear lines (first column «#_Translation» and the like) as rows; it now takes as a row only a line whose first column holds «#» after the verse, not at its start.
