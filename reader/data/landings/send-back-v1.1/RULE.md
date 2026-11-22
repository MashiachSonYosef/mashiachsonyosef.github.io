# RULE — send back v1.1: the language correction of relay v207

21 November 2026 AD. Corpus lane (Moses). Written before the builder. It corrects send back v1 (relay v207, 20 November 2026 AD) and reissues the source ledger. Nothing served is changed: these are landing lists and a ledger for the serving lane.

## Why

The serving lane's letter, the part added 21 November 2026 AD at 10:45 UTC, is headed «none of v207 lands yet. Your source ledger refuses two of its three, and names the owner». It asks:

- J: «Do you hold words of the owner's that repeal the ban of 31 August, or that reverse the Harkavy ruling of 6 September? If you do, quote them and their day. If not, the sentence in `send-back-v1/RULE.md` is ours and not the owner's, and Harkavy stays out until the owner says.»
- K: «That is yours to reissue: a line for M78 and M103 that says which rows the frame admits and why.»
- L: «Is Assyrian Neo-Aramaic inside it or out? I read it as out, and would leave those 12 lines off.»
- M (PanLex is refused by no record, «UNDECLARED», and waits all the same): «Alone, its whole effect at rest is «wolf» at 20 places of the Zohar where the text reads «of the father».»

### The owner's words

Each is a message the owner typed, at the UTC minute given (read again in the session transcript on 21 November 2026 AD):

- 2026-09-01T01:04Z: «we are not desparate to include work ... why then do we need harveys fake yiddish? or ashkenazi responsa in arabic or yiddish or greek or latin. we dont. our project has an explicit goal: gods fire, gods word, hebrew, and jesus's tongue aramaic as the ONLY concession beyond that»
- 2026-09-01T13:24Z: «ok good so knowing that we'll allow yiddish, arabic, mandiac, syriac, but NEVER as an M which stays very strictly hebrew and aramaic only»
- 2026-09-06T21:47Z: «why are you even presenting harkvay as ambigous to elijah»
- 2026-09-07T04:49Z: «the point is if i say aramaic and you think "i wonder if he means mandaic" i'm just telling you outright right now i don't»
- 2026-09-19T02:51Z: «ok so the major challenge is syriac? but the alphabet unlike mandaic is totally the same and its an aramaic language? then im leaning we can include it like somaritan» (a leaning, not a ruling)

In the first, « ... » is the lane's cut; the words it leaves out are «, our goal isnt size or coverage, even if we delivered 50 books at 50% it would be an impressive feat never before done.».

### What they settle (settled by the lane)

- The words of 1 September at 13:24 lifted the ban of 31 August on those languages APPEARING inside works. They never let anything but Hebrew or Aramaic be an M (a defining source): «NEVER as an M which stays very strictly hebrew and aramaic only».
- Harkavy's Yiddish-English-Hebrew dictionary was refused by the owner by name, on 1 September («harveys fake yiddish») and on 6 September.
- So the sentence of send back v1, «The language ban of 31 August is repealed: language is judged at the word», was the lane's own and not the owner's, and it overstated: another language may stand inside a work, but a row that defines a word stands only when its own source says the word is Hebrew or Aramaic. And the Harkavy list of send back v1 was wrong. Harkavy stays out until the owner says otherwise.
- The words of 19 September on Syriac are a leaning, not a ruling. Nothing here rests on them: Classical Syriac stays out.

### The lane's calls (21 November 2026 AD)

1. «The frame's Aramaic is the Aramaic of the texts the reader serves: Official/Biblical Aramaic (PanLex arc; Wiktionary lang «Aramaic» with code arc or arc-bib), Old Aramaic (oar), Jewish Babylonian Aramaic (tmr; Wiktionary «Jewish Babylonian Aramaic»), Jewish Palestinian Aramaic (jpa), Samaritan Aramaic (sam). Hebrew is any value whose name holds «Hebrew» (hbo-000, hbo-003, etc.). OUT: modern Neo-Aramaic of any community (aii Assyrian Neo-Aramaic, cld Chaldean Neo-Aramaic, Wiktionary «Lishana Deni» lsd), Classical Syriac (syc, including a Wiktionary item whose lang reads «Aramaic» but whose code is syc), Mandaic. A value outside the closed table stops the builder.»
2. «Harkavy's list is withdrawn whole.»

## 1. Inputs

Every path is given to the builder; here they are named by placeholder.

- **Send back v1**: `<the Tabernacle>/corpus-lane-builds/moses-send-back-v1/send-back-v1/`: `RULE.md`, `landing-own-language-v1.jsonl`, `landing-harkavy-v1.jsonl`, `landing-bible-dictionaries-v1.jsonl`, `not-sent-back-v1.jsonl`, `receipt-v1.json`. Each list's sha256, and the RULE's, must be the one `receipt-v1.json` names.
- **The source ledger v1**: `<the Tabernacle>/corpus-lane-builds/moses-toggle-ledgers-v1/source-corpus-v1.json`, sha256 681b2524ac2500b3a7dd816431e5615a39fe1bce70c91eda710fecc54c4e5aae (the bytes the serving lane read from the store). It is keyed by source label; each entry has `source` (the label), `cards`, `licences`, `years`, `declared_corpus`, `evidence`.
- **The language admission record**: `<the Tabernacle>/corpus-lane-builds/moses-direction-ledger-v1/strand-1-map/cache/live/language-admission-v1.json`, the one send back v1 read (its sha256 must be the one `receipt-v1.json` names). It names each struck m with its label.
- **The pre-strike index**: `<the Tabernacle>/corpus-lane-builds/moses-pointing-store-v1/tier3/store-v2.2/route-store/index.json`, the index send back v1 names (its sha256 must be `receipt-v1.json`'s). Its `m_sources` gives each m its key and label.
- **The sources the v1 lines name**, under `<999 footsteps>/ledgers/work/ldmprs/source-cache/`: PanLex's per-language tables and English Wiktionary's file. Each file's sha256 must be the one `receipt-v1.json` names.

## 2. The closed table

A row is judged by its own source's field only, as send back v1 read it and as the line carries it in `language`. The table is closed: a value it does not hold stops the builder. A value whose name holds «Hebrew» counts as Hebrew (the lane's call).

### PanLex (M24, M82): the field `langvar_uid`; the code is the part before the first hyphen; the names are ISO 639-3's, as `receipt-v1.json` gives them (the builder checks each name against it)

| code | name | in or out | on what |
|---|---|---|---|
| hbo | Ancient Hebrew | in: Hebrew | its name holds «Hebrew» |
| arc | Official Aramaic | in: Aramaic | the frame's Aramaic: Official/Biblical |
| oar | Old Aramaic | in: Aramaic | the frame's Aramaic |
| tmr | Jewish Babylonian Aramaic | in: Aramaic | the frame's Aramaic |
| jpa | Jewish Palestinian Aramaic | in: Aramaic | the frame's Aramaic |
| sam | Samaritan Aramaic | in: Aramaic | the frame's Aramaic |
| aii | Assyrian Neo-Aramaic | out | modern Neo-Aramaic |
| cld | Chaldean Neo-Aramaic | out | modern Neo-Aramaic |
| syc | Classical Syriac | out | Classical Syriac |
| ydd, lad, jdt, jrb, jbe, jge, jpr, ajt, aju, yhd, yud | Eastern Yiddish, Ladino, Judeo-Tat, Judeo-Arabic, Judeo-Berber, Judeo-Georgian, Judeo-Persian, Judeo-Tunisian Arabic, Judeo-Moroccan Arabic, Judeo-Iraqi Arabic, Judeo-Tripolitanian Arabic | out | another language (as in v1) |

### English Wiktionary's translation tables (M78, M99, M103): the item's `lang`, read with the item's `code` beside it

| `lang` | `code` | in or out | on what |
|---|---|---|---|
| Aramaic | arc | in: Aramaic | the lane's call |
| Aramaic | arc-bib | in: Aramaic | the lane's call |
| Jewish Babylonian Aramaic | tmr | in: Aramaic | the lane's call |
| Jewish Babylonian Aramaic | arc | in: Aramaic | Wiktionary's own name is Jewish Babylonian Aramaic and the code beside it is Official Aramaic's; both are the frame's Aramaic (CALL) |
| Jewish Palestinian Aramaic | jpa | in: Aramaic | the lane's call |
| Aramaic | syc | out | Classical Syriac under the name «Aramaic» (the lane's call) |
| Lishana Deni | lsd | out | modern Neo-Aramaic: English Wiktionary's own entry for the name, «A group of Jewish Neo-Aramaic dialects from the northwestern part of Iraqi Kurdistan.» |
| Yiddish, Ladino, Judeo-Italian, Judeo-Arabic, Knaanic, Mozarabic | any | out | another language (as in v1; they stand only on rows v1 did not send back, whose records carry no code) |

Mandaic stands in no table of these sources; were it to appear it is outside the table and stops the builder.

## 3. The own-language list

- A v1 line stands on one record of its row: the line's `rid`, whose value the line carries in `language`. **A line is kept when that value is in the table**, and kept byte for byte, in v1's order, in `landing-own-language-v1.1.jsonl`.
- **A line whose value is out is withdrawn**: `withdrawn-own-language-v1.1.jsonl` holds, for each, its v1 line number, its m, key, rank and words, the reason (field, value, code, name, and the part of the lane's call that puts it out), what its source's own field reads at the place the line names (read again now, section 5), and the v1 line whole (`v1_line`, which written out again gives the v1 line's bytes).
- **A withdrawn line whose row has any other record in the table stops the builder**: the row could then stand on that record, and a kept line must be v1's bytes.
- A kept line's `records` names every record of its row with v1's «counts_as» words. Where it names a record the table puts out, the line still stands on its own record, which is in: such lines are kept, counted and named in the receipt (CALL). A Wiktionary record other than the line's own carries no code on the list; it is judged by its `lang` alone, and a name the table holds only with a code is counted as in by its name.
- Every kept line keeps its rank. A withdrawn line's hole stays empty: nothing of this list lands there. The receipt names the kept lines that share a key with a withdrawn line.
- The rows v1 did not send back (`not-sent-back-v1.jsonl`) are not re-judged; the builder checks that every value their records carry is in the table, and out.

## 4. Harkavy: withdrawn whole

`withdrawn-harkavy-v1.1.json` names the v1 list by file, bytes, sha256, lines (and lines by m) and keys; gives the owner's words of 1 and 6 September with their times; quotes the v1 sentence it corrects, at its byte offset in the v1 RULE; and says that no line of it lands. The v1 file stays where it is.

## 5. Each withdrawn line, and one line of each admitted value, read again at its source

For every withdrawn line, and for the line with the lowest source line of each admitted value under each label, the builder reads the source's own field again where the line says:

- PanLex: line n of the table the line names (the header is line 1 and must be `id, langvar, txt, txt_degr, meaning, langvar_uid`, cut at tabs); its `langvar_uid` must be the line's value, its `id` the expression and its `meaning` the meaning the line's `record_loc` names.
- Wiktionary: line n of `kaikki.org-dictionary-English.jsonl.gz` (from 1); the item is `translations[k-1]` of the entry, or `senses[s-1].translations[k-1]`; its `lang` and `code` must be the line's value and code, and its `word` one of the line's `headwords`.

What is read is quoted in the withdrawn list and in the ledger's evidence.

## 6. The Bible dictionaries list: carried

Unchanged. It is held by the serving lane for the owner's word. The receipt records its file, bytes, sha256 and lines as carried.

## 7. The source ledger, reissued as v1.1

Written to `<the Tabernacle>/corpus-lane-builds/moses-toggle-ledgers-v1/source-corpus-v1.1/source-corpus-v1.1.json`. The v1 file is not touched.

- Written as v1 is written: JSON with a one-space indent and no newline at the end. The builder first proves that writing v1 so gives v1's bytes.
- **Finding the labels.** The ledger is keyed by label; the v207 lines carry m. Each m's label is found by three roads, which must agree: the pre-strike index's `m_sources`, the language admission record's `struck_sources`, and `receipt-v1.json`'s `sources`. Each label must stand in the ledger once. M78, M99 and M103 share one label (M99 carries no row of the ask).
- **Identical to v1 except:**
  - `version`: «v1.1» and `supersedes`: {file, sha256}, after `generated`.
  - The labels of M24, M82 and M78/M99/M103 get `declared_corpus` «BY_ROW», and in place of v1's evidence:
    - `evidence`: what the source's own field is and what it reads, quoted from the source's bytes read again now (section 5);
    - `admits`: the field, and the table's values admitted for that source, with the exact values found on the admitted rows, counted (rows);
    - `refuses`: every other value of that field: the table's out values for that source, and the values seen on this label's rows that do not land (not sent back in v1, or withdrawn here), counted (rows; a row whose records carry two values counts under each);
    - `admitted_rows`: the landing list's file name and sha256, its lines of this label, and those lines by m and by value;
    - `source`, `cards`, `licences`, `years` as v1. The key order: source, cards, licences, years, declared_corpus, evidence, admits, refuses, admitted_rows.
  - Every Harkavy label (the labels of M88, M100, M113, M117, M118, M121, M122, M125, M126, M127, M140, M146, found by the same three roads) stays REFUSED with its evidence unchanged, and gains `owner_words`: the words of 2026-09-01T01:04Z and 2026-09-06T21:47Z with their times.
  - `values` recomputed from the sources: for each `declared_corpus`, in the order it first appears among the sources, the number of sources and the sum of their cards. The builder first proves that this gives v1's `values` from v1's sources.
  - `correction` keeps its line, byte for byte, and gains a line dated 2026-11-21 saying what changed: it becomes a list of the two lines (CALL: a list, so each line stands whole).
- What BY_ROW means for the serving lane: the label is neither admitted whole nor refused whole. A served row of that label stands only where `admitted_rows` names it (by m, key and words), and each such row was admitted by its own source's field.
- A short README in that folder says what the reissue is.

## 8. Checks, each a hard stop

1. Every input's sha256 is the one its record names (`receipt-v1.json`; the ledger's is 681b2524…).
2. Every v1 own-language line's value is in the table; every record value on every v1 own-language line, and on every not-sent-back line, is in the table; the not-sent-back ones are out.
3. Kept and withdrawn add up to v1's lines; every kept line is v1's bytes; every withdrawn `v1_line` writes back to v1's bytes.
4. No withdrawn line's row has another record in the table.
5. Every line of section 5 reads at its source what the line says.
6. The three roads agree on every m's label; each label stands in the ledger once; v1 says UNDECLARED for M24's and M82's labels and REFUSED for M78's label and every Harkavy label.
7. Writing v1 back gives v1's bytes; `values` recomputed from v1's sources gives v1's `values`; in v1.1 every entry but the changed ones is v1's entry.
8. Every owner quote and lane call the builder writes stands byte for byte in this RULE.
9. No file written holds a path of this machine, the home folder's name, or an e-mail address.
10. A second count by another road (`verify-send-back-v1.1.mjs`, which does not import the builder) agrees: it re-reads the language fields from the v1 lines with its own test, takes the labels from the served copy of the language admission record and from `receipt-v1.json`, and compares every output.

## Amended

**Amended after the builder's first run (into its work folder), before the two runs: which kept lines the receipt names.** The first run named every kept line whose `records` list holds a record the table puts out; most of them hold only records v1 itself had read as another language, which is no change. So the receipt now names the kept lines whose list holds a record v1 read as Hebrew or Aramaic and the table puts out (the reading that changed), and counts the others. It also names each Wiktionary record that cannot be told without its code (a record other than the line's own, whose `lang` is «Aramaic»): the line stands on its own record, read with its code. And check 2 gains a clause: the table never puts in a record v1 read as another language, and a line's own record reads as its `language`.

usage: `node build-send-back-v1.1.mjs <send-back-v1 folder> <source-corpus-v1.json> <language-admission-v1.json> <pre-strike index.json> <999 footsteps folder> <this RULE.md> <out folder> <ledger out file>`, then `node verify-send-back-v1.1.mjs <send-back-v1 folder> <source-corpus-v1.json> <served language-admission-v1.json> <out folder> <ledger out file>`.
