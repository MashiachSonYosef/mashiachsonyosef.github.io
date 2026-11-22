# RULE — TBESH's lettered entries: the same word or another word (tbesh letters v1), and v203's `t` widened (facts list t v1.1)

21 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. The clauses were written after a census of TBESH's own columns and of the store's STEP letters (kept in this folder's `work/`, not shipped).

## What is asked

The serving lane's letter of 20 November 2026 AD, section 3 and ask A:

> «For each lettered entry of TBESH, can the ledger say whether it is its number's own word in another sense or use (a row of the word should stand there) or another word (it should not)? TBESH's «a Part of» mark is one such sign; you did not read those 102 lines, and they are where «father» would be withheld. With that, `t` lands as a parting that never withholds a word at a place of the same word.»

His measure: of the 16,273 lines of relay v203's landing list that give `t`, 4,380 give fewer letters than STEP's own rows carry in the store for the same numbers; «father» carries H1G alone while STEP tags H1H «(Huram)-abi» and H1I «father of»; 815 lines carry a letter no row of TAHOT or TBESH in the store carries.

Here: (1) every lettered entry of TBESH gets a class, decided only by TBESH's own columns; (2) every line of v203's landing list that gives `t` is measured against the letters STEP's own rows carry in the store; (3) v203's `t` is widened so that no line withholds a letter of the same word.

The owner's doctrine binds every clause. A letter is judged only by what its own source writes, by class, never by this lane reading the English, the gloss or the meaning, never by a hand-picked list. Every case is in the files as a labelled branch. No source's words are changed.

## The source, and what its own header says

TBESH, `<999 footsteps>/ledgers/work/ldmprs/source-cache/stepbible-data-2026-07-14/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt` (STEPBible.org, CC BY 4.0), the bytes the STEP acquisition manifest of that folder names. Its header names its columns in this line (tabs between the names):

> «eStrong#	dStrong	uStrong	Hebrew	Transliteration	Morph	Gloss	Meaning»

and says of the three numbers (each quoted after its column name and tab, without the space that ends each line in the file):

- column 1, eStrong: «These Extended Strong Numbers are mapped to BDB (and thereby to other modern lexicons) by OpenScriptures.org. This adds about 800 words which are found in modern lexicons but were not differentiated by Strong.»
- column 2, dStrong: «These Disambiguated Strong numbers differentiates distinct sub-meaning of words, and distinct indivuduals with the same name - see TinyURL.com/DisambiguatedStrongs. They are designed to be backward compatible with software that uses Strongs numbers.»
- column 3, uStrong: «These Unified Strong numbers link together dStrong numbers that can be regarded as a single word, such as Aramaic & Hebrew versions or different spellings of the same word, and alternate names of the same individual or place.»

and of the Morph (column 6): «Language is A=Aramaic, H=Hebrew, G=Greek and n+Name (which is not language specific).»

So TBESH itself says where a word begins and ends: column 1 numbers the words (Strong's number, with a small letter where BDB parts one Strong's number into several words), column 2's letters part «sub-meaning of words» and «distinct indivuduals with the same name» inside a word, and column 3 links entries «that can be regarded as a single word». The builder holds that each quoted string stands in the file byte for byte.

Column 2 also carries, after the dStrong, TBESH's own word for how the entry stands to the entry its column 3 names. The header does not define them. They are, as written (the census found these ten and no other; the builder stops on any other): `=`, `= a Meaning of`, `= a Name of`, `= a Spelling of`, `= a Part of`, `= in Aramaic of`, `= in Hebrew of`, `= a group of`, `= combination of`, `= a form of`. They are quoted on each line and counted; they do not decide (next section).

## The words used here

- **A line**: each line of the file whose first character is `H` and whose second is a digit; a line break is LF, and a CR before it is not part of the line. Columns are parted at tabs; every line has eight.
- **dStrong**: column 2 up to its first space; **relation**: the rest of column 2 with its spaces at both ends taken off (as relay v203's RULE reads it).
- **A lettered entry**: a line whose dStrong is `H`, digits and one letter (of either case). Its **tag** is `H`, the digits without leading zeros, and the letter as written (as v203 writes `t`; `H2148v` and `H2148V` are two tags). Its **number** is `H` and the digits without leading zeros.
- **Its word**: column 1 as written, its spaces at both ends taken off, compared byte for byte (`H0001`, `H5674a`, `H7178`).
- **Its unit**: the first tag written in column 3 (`H`, digits and an optional letter), made a tag as above. It is what column 3 writes, not followed further.
- **Its words**: its word; and, when its unit is the tag of a lettered entry of its own number, that entry's word too.

## The closed list of signs

Between two lettered entries X and Y of one number, read in this order:

1. **The same word by column 1 (`eStrong`)**: X's word is Y's word. Inside one column-1 number the letters part sub-meanings, uses, names and «distinct indivuduals with the same name» of one word.
2. **The same word by column 3 (`uStrong`)**: X's unit is Y's unit; or X's words and Y's words share one. Column 3 links them as entries «that can be regarded as a single word» (another spelling, a form, the other language, another name, a meaning filed under another column-1 letter).
3. **Another word**: neither. Their column-1 words differ (column 1 makes them two of the words «found in modern lexicons but were not differentiated by Strong»), and column 3 links them by neither road.

Nothing else decides: not the relation's words, not the Morph, not the Hebrew, not the gloss, not the meaning, not any English of ours. Where sign 2 holds, the relation and column 3 of both entries are quoted as the words that decide it.

## The class of an entry

- `SAME_WORD`: every other lettered entry of its number is the same word as it (sign 1 or 2). It is its number's own word in another sense or use. A row of that word should stand at its places.
- `ANOTHER_WORD`: no other lettered entry of its number is the same word as it. It is a word of its own under the number. Rows of the number's other letters should not stand at its places, nor rows of its own at theirs.
- `SAME_WORD_AS_SOME`: its number holds two or more words by these signs. It is the same word as some of its number's letters and another word than the rest. Its line names each, so the parting is read letter by letter.
- `NO_SIGN`: a letter that STEP's rows carry in the store (next section) and TBESH writes no line for. TBESH says nothing of it, either way. It is not a TBESH entry, so it has no line in the entries file; it is listed in the receipt. **For the parting it is treated as the same word**: it is never withheld.

The census found no number with only one lettered entry. The builder stops if one occurs, since the classes above would not name it.

## The entries file

`tbesh-letters-v1.jsonl`: one line per lettered entry, in the file's order, an object with these keys in this order:

`tag`, `number`, `estrong` (column 1 as written), `dstrong` (as written), `relation`, `ustrong` (column 3 as written), `unit`, `hebrew` (column 4 as written), `morph` (column 6 as written), `gloss` (column 7 as written), `class`, `same_word`, `another_word`.

- `same_word`: each other lettered entry of its number that is the same word, in the file's order, as `[tag, sign, words]`: sign `eStrong` with words the shared column 1; or sign `uStrong` with words the two entries' column 2 and column 3 as written, `«X's column 2» «X's column 3» / «Y's column 2» «Y's column 3»` (each column 2 and column 3 joined by ` | `).
- `another_word`: each other lettered entry of its number that is another word, in the file's order, as `[tag, its column 1, its unit]`.

## The letters STEP's rows carry

The store: the page's route store at store_version 88fec6d59737 (`index.json` and its 256 shards), `<scratch>/live-store-1121/`. A row is `[rank, route text, definition text, m id, year, cut, headwords, ., ., closes, facts]`. **STEP's rows** are the rows of M4 (TAHOT) and M19 (TBESH). **The letters STEP's rows carry** for a number are every `t` in slot 10 of every STEP row, gathered by number. This is the serving lane's measure: the gate compares a place's lettered tag with a row's `t`, and STEP's rows carry the letters STEP's own text tags.

**The letters of a number**: its TBESH lettered entries' tags, and the letters STEP's rows carry for it.

## The parting over v203's lines

Relay v203: `<the Tabernacle>/corpus-lane-builds/moses-entry-ledger-v1/wiktionary-v1/facts-slot-wiktionary-v1.tsv` (the landing list) and `entry-ledger-wiktionary-v1.jsonl` (the ledger), the bytes the relay letter `FOR-ELIJAH-v203.md` names.

- **A line that gives `t`**: a landing list line whose `facts_under_entry_ledger` carries `t`. **Its numbers**: its `n`, and the numbers of its `t`.
- **A withheld letter**: for each of its numbers N, each letter STEP's rows carry for N that its `t` does not hold. Its kind, the first that holds:
  1. `NO_LETTER_TAKEN`: its `t` holds no letter of N (N is in its `n` only). TBESH's marks cannot say which of N's words the row is, so this is treated as the same word.
  2. `NO_TBESH_LINE`: TBESH writes no line for the letter (`NO_SIGN`). Treated as the same word.
  3. `SAME_WORD`: the letter is the same word (sign 1 or 2) as a letter of N its `t` holds. Named `by` the first such letter in the `t`'s order, sign 1 before sign 2.
  4. `ANOTHER_WORD`: it is another word than every letter of N its `t` holds.
- **The line's class**, the first that holds: `WITHHOLDS_SAME_WORD` (a withheld letter of kind 3); `WITHHOLDS_WITH_NO_SIGN` (of kind 1 or 2, none of kind 3); `PARTS_ONLY_ANOTHER_WORD` (every withheld letter is of kind 4); `WITHHOLDS_NOTHING` (none withheld).
- **A letter no STEP row carries**: a letter of its `t` that STEP's rows carry for no row (the serving lane's 815).

`t-lines-v1.jsonl`: one line per line that gives `t`, in the landing list's order: `key`, `rank`, `m_id`, `sha16`, `t_v203`, `class`, `withheld` (`[letter, kind, by]`, `by` the letter of the `t` that ties it, or `""`), `letters_no_step_row_carries`, `t_v1_1`.

## The widened `t` (facts list t v1.1)

For a line that gives `t`, `t` v1.1 is its `t` and the **added** letters. For each of its numbers N:

- when its `t` holds a letter of N: every TBESH lettered entry of N that is the same word as a letter of N its `t` holds (reason `SAME_WORD_BY_ESTRONG` or `SAME_WORD_BY_USTRONG`, `by` the first such letter in the `t`'s order, sign 1 before sign 2), and every letter STEP's rows carry for N that TBESH writes no line for (reason `NO_TBESH_LINE`);
- when its `t` holds no letter of N: every letter of N (reason `NO_LETTER_TAKEN`).

TBESH's own letters are added whether or not a STEP row carries them now: they are the source's, and a letter no place carries is never compared. `t` v1.1 is ordered as v203 orders `t`: by the digits as a number, then the letter by code point.

`facts-slot-t-v1.1.tsv`: every line of v203's landing list, in its order, with v203's nine columns (`key`, `rank`, `m_id`, `sha16`, `route_text`, `facts_now`, `facts_under_entry_ledger`, `what_changes`, `class`) untouched but for `t` inside `facts_under_entry_ledger`, which is `t` v1.1 (the object's keys keep their order). Then three columns: `t_v203` (the line's `t` as v203 gave it, `[]` where none), `t_added` (the added letters, in `t`'s order), `t_added_why` (`[letter, reason, by]` for each). A line that gives no `t` keeps its bytes and has `[]` in the three. `what_changes` and `facts_now` stay v203's words: they tell the change from the store v203 read; the three new columns tell the widening.

So no line of v1.1 withholds a letter of kinds 1 to 3. What it still withholds is another word by TBESH's own columns.

## Checks (each stops the build)

1. TBESH is the bytes the STEP acquisition manifest names; each quoted header string above stands in it.
2. The landing list, the ledger and v203's RULE are the bytes the relay letter `FOR-ELIJAH-v203.md` names.
3. The store's `index.json` names store_version 88fec6d59737 and its 256 shards are read.
4. Every line has eight columns; every dStrong is `H`, digits and at most one letter; every relation is one of the ten; every column 1 is `H`, digits and at most one small letter; every column 3 holds a tag; no tag is two lines.
5. No number has only one lettered entry.
6. Every letter of v203's `t` is a lettered entry, and none is one whose relation is `= a Part of` (v203 did not read those).
7. The landing list has the columns named, and 16,273 of its lines give `t` as relay v203 says (a count read from the file, held equal to the letter's figure).
8. Every landing list line is found in the store at its key, rank, m id and sha16 (the first 16 hex of the sha256 of the route text), and none of those rows carries `t` now.
9. After the widening, no line withholds a letter of kind 1, 2 or 3.
10. No file written holds a machine path or the home folder's name.
11. The second count agrees on every line of every file and every count. Two runs give the same bytes.

## Counts

Entries by class; by relation and class; by number of words in their number; pairs of entries by sign (and how many are tied by column 3 only, where column 1 parts them); units that are lines whose own unit is another tag (column 3 is not followed); the `= a Part of` entries by class; the `NO_SIGN` letters. Over v203's lines: lines that give `t`; lines by class; withheld letters by kind; lines that give fewer letters than STEP's rows carry (the serving lane's 4,380, read here on store 88fec6d59737); lines with a letter no STEP row carries; lines gaining letters in v1.1, letters added by reason. «father»: H1G, H1H and H1I, their classes, and every line that gives H1. Counted beside, not clauses: added letters whose Morph language (H or A, the letter before the colon) differs from the letter that ties them; withheld `ANOTHER_WORD` letters whose Hebrew (column 4, spaces at both ends taken off) is written byte for byte as that of a letter of the same number the line's `t` holds.

## The second count

`verify-tbesh-letters-v1.mjs`, not importing the builder. It reads TBESH by scanning bytes for tabs and line breaks (no `split`, no regular expressions for the columns); reads each tag character by character; groups entries by column 1 and by unit in maps and joins the groups, where the builder compares every pair; reads the shards from `ff` down to `00`; reads v203's `t` from the ledger's slot 6, not the landing list, and holds it equal to the landing list's; makes every entries line, every t-lines line, every facts line and every count again by its own code, and holds them equal to the builder's, byte for byte. It writes `verify-receipt-v1.json`, or exits non-zero.

## Not here

Which reading leads at a place is the page's. No row's English is read. Nothing served is changed. `b` stays as v203 gave it, for ask B.

## Amended after the first run, before any ship (21 November 2026 AD)

1. **The same word is read against the letters v203 gave, not against the letters added.** The first run stopped at check 9. At «שדות» M25 rank 8 (`t` H7704B, H7704G, H7704I; TBESH's gloss of H7704B «land: soil»), the widening adds H7704M (its column 2 «H7704M = a Spelling of», its column 3 «H7704B»), and H7704A is then the same word as H7704M by column 1 (both «H7704a»), while TBESH ties H7704A to none of the three letters v203 gave: its column 1 is not theirs and its column 3 names «H2768». The signs are read between two entries, as TBESH writes them for those two; a chain of two ties is not a sign TBESH writes. Following chains would also join words that both columns part: H5674H (column 1 «H5674b») would join H5674A (column 1 «H5674a») through H5674B, whose column 1 is «H5674b» and whose column 3 names «H5674A». So the kind of a withheld letter, the added letters and check 9 are all read against the letters of the line's `t` as v203 gave it. Check 9 reads: after the widening, no letter STEP's rows carry is withheld that is of kind 1, 2 or 3 against v203's `t`. Counted beside, not added: the letters still withheld that are the same word as an added letter only (a second step), by lines and by letters, so the page sees them.

2. **The two counts beside on the Morph are read so.** The first run counted a letter as crossing language whenever the first letters of the two Morphs differed, so a name's mark (`N`) against a Hebrew one (`H`) counted as a language. Now the language letters of a Morph are every capital letter standing before a colon (a Morph can carry two parts, as «H:N-M / H:Adv»), and two counts are given: added letters where one Morph carries `A` and the tying letter's does not, or the other way (Aramaic against Hebrew); and added letters where one carries `N` and the other does not (a name against a common word). Counts only; no clause of the classes, the parting or the widening changes.

3. **Two counts beside are added, for the page's reading of the branches**: the withheld `SAME_WORD` letters by the relation TBESH writes for the withheld letter, and the added letters by the relation TBESH writes for the added letter (`(no TBESH line)` for a `NO_TBESH_LINE` letter). So the page can see how much of the widening comes through «= a Part of» lines, which the serving lane's letter names, and through each other relation. Counts only; the relation still decides nothing.

## Amended in mend round 1, after the verify seat's findings (21 November 2026 AD)

The verify seat recounted every file and count and agreed, but found the answer's account of the `WITHHOLDS_WITH_NO_SIGN` lines false, and found two sentences of this rule too short. No clause of the signs, the classes, the parting or the widening changes in this round: the three data files must come out byte for byte as before, and the builder is rerun to hold that. What changes is that the two short sentences are made whole here (the sentences above stand as written) and that counts are added, so every figure the answer gives is read from the receipt.

4. **Column 1 has two edge classes the sentence in «The source» did not name.** That sentence says column 1 is «Strong's number, with a small letter where BDB parts one Strong's number into several words». Read against the entry's own number, column 1 is of one of three kinds: the entry's own number with a small letter (`H5674a`); the entry's own number bare (`H0001`); another number. Two edge classes follow:
   - **a number whose column 1 holds its bare number beside small-letter values.** The census of this round finds one: H2428, where H2428B «Helech», H2428H «strength: rich» and H2428I «strength: worthy» carry «H2428», and H2428A and H2428G carry «H2428a». Sign 1 compares column 1 byte for byte, so the bare value is a word of its own and its letters are one word: «Helech» is the same word as «strength: rich» by column 1. This is read as written; the letters added through it are counted and named, so the page can turn them off as a branch.
   - **an entry whose column 1 names another number.** One: H7156H «Kartan», column 1 «H7178». Read as written, its word is «H7178», so it is another word than H7156G and H7156I (column 1 «H7156»). The lines that touch it are counted.

   The builder counts lettered entries by the kind of their column 1 and numbers by the kinds they hold, lists both edge classes, and counts the added letters and the lines that pass through them. A column 1 that is none of the three kinds cannot occur (check 4 holds every column 1 to `H`, digits and at most one small letter).

5. **Sign 2's first road can tie two entries through an entry of another number.** «X's unit is Y's unit» holds for pairs whose shared unit is an entry of another number. In one such pair, H3026A «Jegar» (`= in Aramaic of`) and H3026B «(Ramoth)-sahadutha» (`= a Part of`) both name «H7433», so the tie joins two pieces of one compound name, since an «a Part of» line's column 3 names the whole it is part of. Column 3 is read as written and the relation decides nothing, so these pairs stay tied. The builder lists every pair tied by sign 2 only because both units name one entry of another number, with both relations, and counts the added letters tied through such a pair.

6. **Counts added for reading the parting.** (a) Withheld letter places by the line's class and the letter's kind. (b) Lines that hold back a letter with no sign (kind 1 or 2), by the line's class and by whether the line also parts another word; and the lines that hold back only such letters. A line of class `WITHHOLDS_WITH_NO_SIGN` holds back a letter of kind 1 or 2 and none of kind 3. The class says nothing about kind 4, and a line that holds back a no-sign letter beside a letter of kind 3 is of class `WITHHOLDS_SAME_WORD`. (c) Places of no-sign letters by kind, by letter (kind 2) or number (kind 1), and by line class. (d) Every line that holds back a number with no letter taken (kind 1), by key, rank, m id, `n`, `t` and class. (e) The lines of the second step (amendment 1), by key, rank, m id, letter and the added letter that ties it. (f) Added letters by relation and reason. (g) Added letters whose relation is `= in Aramaic of`, by the two Morphs (the added letter's and the tying letter's). (h) The lines whose `t` is widened. On those lines `what_changes` keeps v203's words, which name v203's `t`, not the widened `t` beside it. Counts only.

   The second count makes every one of these by its own code and holds it equal to the builder's.

## Amended in mend round 2, after the second verify seat's findings (21 November 2026 AD)

The verify seat of round 2 made every count again and agreed. It found two sentences of this rule that say more than TBESH's columns or the counts show. This note is added after the builder's last run. The receipt names this file as the builder ran under it: every byte above this section. No clause of the signs, the classes, the parting or the widening changes, and no figure and no output changes.

7. **Two sentences above are read so.** (a) In amendment 5, the words «since an «a Part of» line's column 3 names the whole it is part of» are withdrawn. No count proves them, and TBESH's own glosses for the entries such lines name show it is not always the whole: H1H «(Huram)-abi» names H2438H «Hiram»; H5674G «(Valley of) the Travelers» names H1516O «Valley». The clause of amendment 5 stands: column 3 is read as written, the relation decides nothing, and the pairs stay tied. (b) The last sentence of «The widened `t`», «What it still withholds is another word by TBESH's own columns», is read with amendment 1: another word than the letters of `t` as v203 gave it. At the 4 lines of the second step (amendment 1; count (e) of amendment 6), the letter still held back is the same word as an added letter.
