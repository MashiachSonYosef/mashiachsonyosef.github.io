# RULE — spelling bridge v1.1: each piece's English as STEP writes it, brackets kept

21 November 2026 AD. Corpus lane (Moses). Written before the builder. Nothing served is changed: this is a list for the serving lane.

## Why

The serving lane's letter of 20 November, as added on 21 November:

- at 02:40 UTC it found: «Your pieces' English has STEP's brackets off.» and «none of the 1,936 pieces carries a bracket, and the lattice's own pieces are the same.»
- at 02:40 UTC, ask D: «The pieces' English as STEP writes it» «brackets kept, for the 794 other places with new pieces (`THROUGH_ONE_LETTER` 748, `SAME_LETTERS` 46). No row in my tree is named for those places, so I hold them.»
- at 06:15 UTC: «Asks D and E above stand as written. The 794 other places with new pieces carry none yet.»
- at 11:25 UTC, item P: «What these places need is their own pieces, which is ask D of this morning: the words as STEP writes them for the bridge's 794 places.»

Bridge v1 (`../bridge-v1/`) took each piece's English from TAHOT's English column, cut at the stroke `/`, and then took the brackets off by the rule the lattice's own pieces follow (v192's RULE §3, «the walk's rule»: `<`, `>`, `[` and `]` taken out, runs of spaces closed to one, the ends trimmed). That is the function `clean` on line 49 of `build-bridge-v1.mjs`, used on line 54. So no piece of v1 carries a bracket, and no piece of the lattice does either.

## 1. What stays

Every field of every line of `../bridge-v1/bridge-places-v1.jsonl` stays as v1 wrote it, in the same order, and every line stays in the same order. v1's RULE (`../bridge-v1/RULE.md`) stands for all of them; its terms are used here as it defines them. Taking the fields added in §3 off a line of v1.1 gives v1's line, byte for byte. v1's form rows (`form-rows-v1.jsonl`, `form-rows-not-landed-v1.jsonl`) are made again by the same code and must be v1's bytes; they are not written again, since they already carry STEP's English column whole (`route`).

## 2. Terms

- **TAHOT's English column**: column 3 of a TAHOT row, counting from 0 (v192 §1). STEP's own heading for it is read from each TAHOT file, from the line whose first column is «Eng (Heb) Ref & Type»; the four files must give the same heading, and that heading names the column in the list.
- **A part** of a row's English column: the column cut at every `/`, kept byte for byte, with every space STEP writes (as the space after a stroke) and every mark. Parts are numbered from 0. v1's check 2 already holds that a row's Hebrew, English and tag columns cut to the same number of parts.
- **A piece's part**: the part of the English column of the piece's row whose number is the number of the Hebrew part the piece was cut from. A Hebrew part with no letter is a break and gives no piece (v1, as v192); its English part is counted (§5) but carried on no piece.
- **The marks taken off** (v1's rule, every clause written here): (1) take out every `[`, `]`, `<` and `>`, and nothing else; (2) close every run of white space to one space; (3) take white space off both ends. Nothing else is changed: «¿», «!», «?», «.», «-», «'» and any other mark STEP writes stay, as they stayed in v1.

## 3. What is added: `bridge-places-v1.1.jsonl`

One line per bridge place, the 1,173 lines of v1 in v1's order. Each line is v1's line with three fields more:

- on each piece, right after `english_tahot`:
  - `english_tahot_as_written`: the piece's part, byte for byte, as STEP writes it in its English column: square brackets, angle brackets, every other mark, and the space STEP writes after the stroke, all kept. A part cannot hold a stroke, since the column is cut at the stroke; the strokes are kept in the next field.
  - `english_tahot_as_written_from`: the column it comes from, named: `row` (the row's first column), `column` (3), `column_heading` (STEP's heading, §2), `part` (the part's number in that row's column, from 0).
- on each line, right after `tags_as_tahot_writes_them`: `translation_columns_as_tahot_writes_them`, each of the place's rows' English column whole, strokes kept, byte for byte, in the order of `tahot_rows` (an empty list where the place has no row). This stands on every line, with pieces or not, so the held places show STEP's words too.

## 4. The proof asked: marks off gives v1's English

For every piece, the marks taken off (§2) its `english_tahot_as_written` must give v1's `english_tahot` for that piece, as v1's file holds it. Every piece where it does not is listed in the receipt with its place, its row, its part, both words and why. The receipt also counts, over all pieces: those whose part holds a square bracket, an angle bracket, both; those where only the spaces at the ends differ; those that are v1's words byte for byte; and every other mark the parts hold, by the mark, kept in v1 and in v1.1 alike.

## 5. Counts and the reconciliation

The receipt counts, each with its axis named:

- places and pieces by v1's class; places by class and `use`; places by class and number of TAHOT rows.
- the serving lane's 794 read as the places of `use` `NEW_PIECES` whose class is not `STEP_WRITES_OUR_SPELLING` (it lays those 206 from the form rows): counted by class, against its 748 and 46.
- the difference from v1's class counts, by place: every place of class `SAME_LETTERS` or `STEP_WRITES_OUR_SPELLING` whose `use` is `BESIDE_THE_LATTICES_PIECES` is named (book, place, rows), since the lattice already gives those places pieces and the serving lane lays none there.
- the pieces at the 794, and how many of them carry a square or an angle bracket in STEP's writing.
- the English parts of breaks at the pieced places' rows (letterless Hebrew parts): how many, and how many hold any letter of English, so that no word of STEP's is left off a place by dropping breaks.
- for item P: the places of v208's third list (`untagged-places-v1.jsonl`, where TAHOT tags no core piece in the lattice), matched to bridge places by book, `i`, `j` and surface: counted by v1's class and `use`, the places of that list that are no bridge place, and how many of the 794 stand in it.

## 6. Examples, chosen by rule

The receipt carries, whole, the pieces of: 1 Samuel 26:7 word 15 (named in the ask); and, of the 794, in file order: the first place of class `THROUGH_ONE_LETTER` whose pieces hold a square bracket in STEP's writing; the first of that class whose pieces hold an angle bracket; and the first place of class `SAME_LETTERS` with `use` `NEW_PIECES` whose pieces hold any bracket, or the first such place if none does.

## 7. The builder: `build-bridge-v1.1.mjs`

A copy of `build-bridge-v1.mjs` with these changes and no other, each marked `v1.1 change` in the code:

1. The usage takes two inputs more: v1's folder (`bridge-v1`) and v208's `untagged-places-v1.jsonl`.
2. A row's pieces keep their part's number and their part as written; the place keeps its rows' English columns whole; STEP's heading for column 3 is read from the four TAHOT files.
3. The pieces and the lines carry the fields of §3.
4. The form rows are made as before and held equal, byte for byte, to v1's two form-row files; they are not written.
5. It writes `bridge-places-v1.1.jsonl` and `receipt-v1.1.json` only. The receipt adds §4, §5 and §6.

## 8. Checks, each a hard stop

1. to 5. and 7.: v1's checks, as v1 wrote them.
8. The four TAHOT files give one heading for column 3.
9. Taking the three added fields off every line of v1.1 gives v1's line byte for byte, and the whole file then is v1's file byte for byte (its sha256).
10. The form rows made again are v1's two files byte for byte.
11. Each piece's part, cut at the stroke, holds no stroke; the parts of a row joined again with `/` give its English column.
12. Every line of v208's third list names one place (book, `i`, `j`) once; where that place is a bridge place, the surfaces agree.

## 9. The second count: `verify-bridge-v1.1.mjs`

By another road, not importing the builder: it reads v1.1 and v1 as parsed objects and compares every field of every line and piece, key order included, with the added fields set aside; it finds each row in TAHOT by its first column (not by its line), cuts the English and Hebrew columns itself, walks the lettered parts of the place's rows in order against the pieces, and checks each piece's part, row and part number byte for byte and each line's whole columns; it takes the marks off character by character and compares with v1's own file; and it recounts every count of §5 and §6 and compares them with the receipt. It writes `verify-receipt-v1.1.json`.

## Amended after the builder's first run, before any ship

The first run stopped nowhere, and its examples showed a fault of v1's that this reissue must not mend (§1) but must name. STEP's tag column writes «{H4648G}+» where one tag goes on over the next Hebrew word (TAHOT's own words: «A "+" indicates the same tag also covers the next Hebrew word»). v1's builder takes a brace off each end of a tag only (`build-bridge-v1.mjs`, line 56), so the piece's `tag` reads «H4648G}+» and the piece is not read as a main tag. So the receipt adds, as change 6 of §7 (marked `v1.1 change 6` in the code): every piece whose `tag` is not «H», digits and letters only, with its book, place, class, `use`, index, role, v1's `tag`, the tag as STEP writes it (the piece's part of the tag column before any backslash), and the number it names (the «H», digits and letters at its start); counted by class, `use` and role, and how many stand at the 794. The mend belongs to the bridge's next reissue; until then the page reads the number named.
