# RULE — the two entry lists reissued as v1.1 (relay v218)

Corpus lane (Moses), 21 November 2026 AD. Written before the builder, so a second count can be made from these words alone. Nothing served is changed: these are lists for the serving lane.

## 1. What is asked

Relay v212 (ask B) promised that relay v218 would reissue the two entry lists of relays v203 and v204 with three things decided:

> «Relay v218 reissues v203 and v204: n.fr.aa off the 5 lines of section 3, the entry of the 231 lines, and whether the 102 take `n` H4480.» (FOR-ELIJAH-v212.md, section 4)

Each is decided here by a rule written per dictionary that names a class of BDB's own data (its entry ids, heads, pointer marks and the numbers its own rows carry). Every rule is applied to every line of both lists, not only to the lines v212 named. Every case is a labelled branch, the lines a rule does not change among them. No row's English is read to decide anything; the English stands in the files only as the lines carry it.

## 2. Inputs (each taken as a command-line argument; none is changed)

1. **v203's list**: `<the Tabernacle>/corpus-lane-builds/moses-entry-ledger-v1/wiktionary-v1/facts-slot-wiktionary-v1.tsv`, sha256 4cb9e9ce6b30331e04eecbdd35ff945c302ceafa354f4a4b7deeecaef0cbd99e (as relay v203 names it).
2. **v204's list**: `<the Tabernacle>/corpus-lane-builds/moses-entry-ledger-v1/classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv`, sha256 5bc044bad2003f468592933fb5cf9c5f0ccbc54a608973ce4b466c351a6f1aeb (as relay v204 names it).
3. **v203's ledger**: `.../wiktionary-v1/entry-ledger-wiktionary-v1.jsonl`, sha256 4248ae7ccf2107a65a5c50edb4e5e02983ca0d7746dc4605b3ddc9973a88debe. Read only for evidence: the record each decided line reads and the index entry it met.
4. **v204's ledger**: `.../classical-and-hebrew-wiktionary-v1/entry-ledger-v1.jsonl`, sha256 8860881deed2e6fae761bdc0bb72dc4ea64c90374ae89c28fab6f29369daffa4. Read only for evidence, as 3.
5. **The store as served**, store_version 88fec6d59737: `<scratch>/live-store-1121/` (`index.json`, sha256 18e43f3a142f3e83c285f670aa7fcaebb39cb682bb3d70ca1b6cf6197dc8bafe, and its 256 shards), the store bdb-b-flips-v1 read. A row is `[rank, route text, definition text, m id, year, cut, headwords, ., ., closes, facts]`; slot 10, the facts, may be absent.
6. **BDB via Open Scriptures**, the file the store's M5 rows come from: `<999 footsteps>/ledgers/work/ldmprs/source-cache/openscriptures-hebrewlexicon-2026-07-14/BrownDriverBriggs.xml`.
7. **The lexical index**, the Open Scriptures index of BDB's entries, from which both lists took their `b`: `.../openscriptures-hebrewlexicon-2026-07-14/LexicalIndex.xml`.
8. **Their acquisition manifest**: `.../openscriptures-hebrewlexicon-2026-07-14/acquisition-manifest.json`. Files 6 and 7 must be the bytes it names.
9. **The unabridged BDB**, the file the store's M46 rows come from: `<999 footsteps>/ledgers/work/ldmprs/source-cache/unabridged-bdb-2026-07-14/unabridged-BDB-Hebrew-lexicon.csv` (columns `BDBid`, `StrongNumber`, `content`). Its manifest names the zip it came in, not this file; its sha256 is recorded in the receipt. Read as a second witness (§4).
10. **bdb-b-flips-v1's flips**: `.../moses-entry-ledger-v1/bdb-b-flips-v1/flips-v1.jsonl`, sha256 67089ef897ed342fdf35dbe86d9a12241525ff1cc9128e1907fe1066f46d39a8 (as relay v212 names it).
11. **bdb-b-flips-v1's list rows**: `.../bdb-b-flips-v1/list-b-only-v1.jsonl.gz`, sha256 44bc6315705eba0b2a86d88a5d45806ef695c389e2d31677d540f487e5635ab1.
12. **bdb-b-flips-v1's counts**: `.../bdb-b-flips-v1/counts-v1.json`, sha256 26e943d41f51b284df9ff638137079ebb457728c168753e3533a93f85a8caf69.

## 3. Words

- **A line** is one line of a list after its header, named by its list (v203 or v204) and its line number in the file, the header being line 1 (as relay v212 numbers them). Its **facts** are the JSON of its column `facts_under_entry_ledger` (v203) or `facts_under_entry_ledger_v1` (v204); its `n`, `t` and `b` are the arrays there, or empty.
- **BDB's two editions** are the store sources whose `index.json` `m_sources` label holds «Brown-Driver-Briggs». There must be exactly two (M5, Open Scriptures; M46, the unabridged). **BDB's own rows** are the store rows of those two m ids. Only rows that carry `b` name one of BDB's entries.
- **An entry** is an id of BDB via Open Scriptures (`n.fr.aa`), as the lists, the index and M5's rows write it.
- **The numbers BDB's own rows give an entry** E: read from every row of BDB's own whose `b` is exactly `[E]` (a row that names two or more entries does not say which number is whose, so it is not read). Then:
  - **one number** where every such row carries `n` holding exactly one value, the same in all;
  - **no number** where such rows exist and none carries `n`;
  - **several numbers** where they carry two or more values in all;
  - **mixed** where some carry `n` and some do not;
  - **no row** where no row of BDB's own carries E alone.
- **The index's numbers for an entry** E: for every `<xref>` of the lexical index whose `bdb` is E, its `strong` where it is digits, written `H` and the digits without leading zeros. A `strong` of letters only is a **prefix's code** (b, c, d, i, k, l, m, s), not a number. An `<xref>` with no `strong` gives nothing.
- **An entry's own numbers** are the numbers BDB's own rows give it (one or several) together with the index's numbers for it. An entry **has no number of its own** where both are empty.
- **A pointer entry** (BDB via Open Scriptures): an `<entry>` whose content, its `<status>` set aside, holds no `<pos>` and no `<sense>`, and whose text (its tags taken out) holds «v.» followed by a space, and which holds a `<w>` with a `src` attribute. Its **targets** are the `src` values, in order. Such an entry sends the reader on: «v.» is BDB's own «see». (Census before this rule: 11,845 entries; 2,097 hold a `<w src>` and no `<pos>` and no `<sense>`; 2,071 of those hold «v.».)
- **A prefix's entry**: an entry for which the lexical index has at least one `<xref>` with a prefix's code, and every `<xref>` naming it gives a prefix's code or no `strong` (never digits). **Its letter** is the first letter of its head in BDB via Open Scriptures (the first `<w>` of its `<entry>`), finals folded.
- **A key's first letter**: the first character of the line's key, finals folded (ך to כ, ם to מ, ן to נ, ף to פ, ץ to צ).

## 4. The three rules

They are applied in this order to every line of both lists. A line may be reached by more than one; it is changed by at most one (the builder holds it).

### R1. An entry with no number of its own, on a line that gives numbers

**Class:** a pair of a line and an entry, where the line gives `n` and the entry is one of its `b` and has no number of its own (§3). BDB's own entry then says where the entry belongs, in four branches:

- **R1-A, POINTER_TO_ANOTHER_NUMBER (changes).** The entry is a pointer entry; the own numbers of its targets, taken together, are not empty, and none of them is one of the line's `n`. BDB sends the reader from this entry to another whose number is not the line's: the entry is not the entry of the line's numbers. **It comes off the line's `b`.** The line's `n` and `t` are not touched.
- **R1-B, POINTER_TO_THE_LINES_NUMBER (stays).** A pointer entry one of whose targets' own numbers is one of the line's `n`.
- **R1-C, POINTER_TO_NO_NUMBER (stays).** A pointer entry whose targets have no number of their own.
- **R1-D, NOT_A_POINTER (stays).** An entry with no number of its own that is not a pointer entry: BDB's data sends it nowhere, so nothing says it is not the line's.

Not reached, and counted (pairs): an entry with a number of its own on a line that gives `n`.

**The second witness.** For every entry R1-A takes off, and for each of its targets, the unabridged BDB is read for the same entry: the unabridged entry of the same part (Open Scriptures ids beginning `x` are Aramaic, the rest Hebrew; the unabridged writes «BIBLICAL ARAMAIC» or «BIBLICAL HEBREW» in its navigation line) whose head is the same and whose number mark is the same. Its **head** is the text of the first `<bdbheb>` of its first `<p>`; its **number mark** is a Roman numeral and a full stop standing before that head (as «III.»), or none. Open Scriptures' number mark is the `mod` attribute of the `<entry>`, or none. Heads are compared by their pointed key: the letters U+05D0 to U+05EA (finals folded) and the points U+05B0 to U+05BC, U+05C1, U+05C2 (U+05C7 read as U+05B8, U+05BA as U+05B9), each letter's points in code point order; everything else taken out. The witness's `StrongNumber` (cut at `_`, `H0` and empty read as none) is recorded beside the change. It does not decide, but the builder stops where an R1-A entry's witness is found and names one of the line's numbers.

### R2. A prefix's entry at a key that does not begin with its letter

**Class:** a line whose `b` holds a prefix's entry (§3) and whose key's first letter is not that entry's letter. BDB writes such an entry as a letter joined to the front of a word; the key's spelling does not begin with it.

**What decides.** The entry was given because the line's own record is that prefix's record (the ledger's evidence names the record and the index entry its head met). BDB's own rows under the line's key are read, in both editions: they carry the entries of the key's own words, and the gate gathers those at the key's places. They do not say what a row of another record is. So:

- **R2-A, LANDS_AS_GIVEN (stays).** The line keeps the entry its own record's head meets. BDB parts the prefix's entry from the entries of the key's own words, and the gate withholds the row wherever the key's places gather another entry: that is BDB's own parting, and it is what the gate is for. The hold of relay v212 (section 4) on these lines is lifted: they land as given.

For every line of the class, the builder records BDB's own rows under its key (each row's m id, rank, entries, numbers and headwords), and the evidence of its own record from the ledger.

Two other ways are named, not taken (the lane's call, §6): to give these lines the entry of the key's own word (the key is not the row's own record), or to give them no entry (that drops BDB's parting).

Not reached, and counted (lines): a prefix's entry at a key that begins with its letter.

### R3. An entry and no number

**Class:** a line that gives `b` and no `n` (after R1). For each entry of its `b`, the numbers BDB's own rows give it (§3):

- **R3-A, TAKES_BDBS_ONE_NUMBER (changes).** Every entry of the line has one number by BDB's own rows. The line takes those numbers as `n` (distinct, in ascending order of their digits). Its `b` and `t` are not touched.
- Otherwise the line takes no number, and its branch is named by the first entry, in the line's order, that has not one number:
  - **R3-B, BDB_ROWS_GIVE_NO_NUMBER (stays)**: BDB's own rows carry the entry alone, and none of them carries a number;
  - **R3-C, NO_BDB_ROW_CARRIES_IT_ALONE (stays)**;
  - **R3-D, SEVERAL_NUMBERS (stays)**;
  - **R3-E, MIXED (stays)**.

Beside each R3 line the builder records the index's numbers and prefix codes for its entries, the store rows of BDB's own that give the number (key and rank), and the unabridged witness (as in R1) of each entry.

M46's rows carry no `b`, so they name no entry; the unabridged edition's rows and Strong links are recorded as witness only.

## 5. The lines written

- **`facts-slot-wiktionary-v1.1.tsv`** and **`facts-slot-v1.1.tsv`**: every line byte for byte as in v1, header and order and the final line break included, except the lines a rule changes. A changed line keeps its key, rank, m id, sha16 (v203), route text and facts now; its facts, its `what_changes` and its class are written again by the list's own builder's formula, which the builder first holds on every v1 line (it must give back each v1 line's three cells exactly):
  - v203: the facts are the facts now with `n`, `t` and `b` set where not empty, their keys in code point order; `what_changes` is `n gains …; t gains …; b gains …` for the values not in the facts now, each part only where it has values; the class is v203's word for the facts: `ONE_ENTRY` (one number), `SEVERAL_ENTRIES` (two or more), `BDB_ENTRY_ONLY` (no number and some entry).
  - v204: the facts are the facts now, then `n` and then `b` set where not empty (deleted where empty); `what_changes` is, for `n` then `b`, `X loses …` and `X gains …` against the facts now (or `X order only`); the class is kept, and the builder stops if a change would leave a `SEVERAL_ENTRIES` line with fewer than two entries or a `ONE_ENTRY` line with none.
  - A line whose facts would come to equal its facts now would leave the list; the builder stops on that, for no rule here is written to empty a line.
- **`changes-v1.1.jsonl`**: one line per changed line, in list and line order: list, line, key, rank, m id, sha16 of the route text, the route text, the v1 cells (facts, `what_changes`, class) and the v1.1 cells, the rule and branch, and the BDB data that decides it (BDB's own entry text and marks, the index's `<xref>`s, the store rows that give the numbers, the unabridged witness), with the ledger's evidence for the line.
- **`decisions-v1.1.jsonl`**: one line per (line, rule) a rule's class reaches, changed or not, with the branch and its data.
- **`counts-v1.1.json`**: every count, each naming its axis (lines, pairs of line and entry, keys, rows, places, flips), by rule, branch and list; the classes not reached; and the effect (§7).
- **`receipt-v1.1.json`**: the inputs by sha256, the builder's sha256, the outputs' sha256 and bytes.
- **`two-runs-v1.txt`**: the sha256 of each output from two runs; they must be byte-identical.
- **`verify-lists-v1.1.mjs`** and **`verify-receipt-v1.1.json`**: the second count (§9).
- **`ANSWER-LISTS-v1.1.md`**: the answer in plain words for the page lane.

Any output over 20 MB is gzipped.

## 6. The lane's calls written into this rule

- **CALL 1 (R1).** The class is the entry with no number of its own on a line that gives numbers, and BDB's own pointer decides it. A pointer entry's number is its target's, read from BDB's own rows and the index; the unabridged edition is a witness.
- **CALL 2 (R2).** A row's entry is the entry of its own record. The key a row stands under is the place's matter, and the gate compares the two. So the 231 land as given.
- **CALL 3 (R3).** «The number BDB's own rows give that entry» is read from BDB's rows that name that entry alone. A row that names two entries is not read for numbers.
- **CALL 4 (the class column).** A changed v203 line takes v203's own class word for its new facts (an R3 line goes from `BDB_ENTRY_ONLY` to `ONE_ENTRY`); a v204 line keeps its class. The changes file names every such change.
- **CALL 5 (the ledgers).** The two ledgers (`entry-ledger-wiktionary-v1.jsonl`, `entry-ledger-v1.jsonl`) are not reissued; they are evidence. The changes file says what in them the lists now set aside.

## 7. The effect, where bdb-b-flips-v1's files let it be said

Nothing is run of the page's. The effect is read from bdb-b-flips-v1's own records, which hold, for every flip and every list row it counted, the place, the key, the row's `b`, the gathered sets before and after, and the list lines that caused it.

Two variants of the lists are worked: **v212's landing** (v1, with n.fr.aa taken off the 5 lines named in relay v212 section 3, and the 231 lines of its section 4 giving no `b`), and **v1.1**. For each record and each gather reading (`whole`, `open_at_rest`, `pressed_open`), the gathered set after the variant lands is the record's own set after v1 landed, with each entry a variant takes off a line removed where no line under the record's key, in that variant, still gives that entry with `n` holding one of the place's numbers. Nothing is added: new gathering comes only from R3's lines (they gain `n`), and the builder holds that no record of either file stands under the key of an R3 line, and that no row of BDB's own that carries `b` and no `n` stands under such a key, so R3 makes no flip and changes no verdict of a b-only row. The builder also holds that no row of BDB's own that carries `n` gives an entry a variant takes off, and that a variant takes an entry off every line under a key that gives it or off none, so whether a row rests open or shut never changes what is removed.

- **BDB's own b-only rows (the flips)**, `flips-v1.jsonl`: the row's `b` is unchanged; its verdict after the variant is the gate's on the new gathered set, as bdb-b-flips-v1/RULE.md §3 writes it: withheld where the gathered set is not empty and holds none of the row's `b`, else left. Its verdict before is the record's.
- **The lists' own rows that carry `b` and no `n`**, `list-b-only-v1.jsonl.gz`: a record is kept where its line still gives `b` and no `n`, with the same `b`, in the variant; its verdict is worked again on the new gathered set the same way.
- **Counted**: for reading A (the word's own key) and reading B (the core pieces' keys too), under each gather reading: flips (place form, key, row), places, rows and keys, both ways, as v1 counted them; then as relay v212 said they land (n.fr.aa off the 5 lines named in its section 3, the 231 held); then under v1.1. The same three for the lists' own rows. Each figure is read from the records, never from the relay's text.
- **Not counted**: how the 102 rows of R3 are judged by their new number at each place. That needs the zones' places, which bdb-b-flips-v1's records hold only where a b-only row was withheld or flipped; the 102 were neither. They rest shut on the thirty-nine books.

## 8. Hard stops (`must`)

The builder stops, writing nothing, where: an input is missing or is not the bytes named in §2; the store is not 88fec6d59737; the labels do not name exactly two BDB editions; a list's header is not v1's; a v1 line's three cells are not given back by its list's own formula; a list line meets no store row, or more than one, by key, rank, m id and the hash of its route text, or its row's `n` is not the line's; an entry of a line is not an entry of BDB via Open Scriptures; a line is changed by two rules; R1-A would take every entry off a line; an R1-A entry's witness names one of the line's numbers; a change would leave a line equal to its facts now; a v204 class would no longer hold; an R3 line's key holds a row of BDB's own with `b` and no `n`; a bdb-b-flips record is not under a key and place the store and the lists explain; an output holds a machine path or the home folder's name.

## 9. The second count

`verify-lists-v1.1.mjs`, not importing the builder. It reads the lists by its own parser, the store's shards from `ff` down to `00`, BDB via Open Scriptures by string search for each entry it needs, the index by its own scan, and the unabridged BDB. It decides R1 by its own road: the pointer's number from the unabridged edition's witness of the target (its `StrongNumber`) as well as from the store's rows, and both must give the same branch. It decides R2 and R3 again, writes both v1.1 lists again by editing the v1 lines' cells as strings (not by the builder's object formula), works the effect again from bdb-b-flips-v1's records, and must reach the same bytes for both lists, the same changes line for line, the same decisions and the same counts, or it exits non-zero. It writes `verify-receipt-v1.1.json`.

## 10. Not here

The ledgers are not reissued. The store and the zones are not changed. No page code is run. The root branch list of v203 and the held list of v204 are not touched.

## Amended after the first run, 21 November 2026 AD, before any figure was sent

Every word above is unchanged; the rule's sha256 before the builder first ran is in `rule-sha256-v1.txt`. None of these notes changes a line of either list.

1. **Amended: the census in §3.** The figures in §3's definition of a pointer entry («11,845 entries; 2,097 …; 2,071 …») came from a probe made before the rule, which read a `<w src>` only where the `<w>` held no tag inside it, and «v.» at a word edge before any white space. The builder reads them as §3's words say: 11,845 entries; 2,449 hold a `<w>` with `src`; 2,169 of those hold no `<pos>` and no `<sense>`; 2,070 of those are pointer entries (`counts-v1.1.json`, `bdb_census`).
2. **Amended: «v.» in §3.** The builder reads «v.» followed by a space only where no Latin letter stands just before the «v» (so «Lev. » is not read as «v. »). The only entry the pointer test decides (R1 reaches one entry, n.fr.aa) is a pointer either way.
3. **Amended: the lines of BDB's file.** BDB via Open Scriptures ends some of its lines with a carriage return before the line break. Where an output quotes an entry's first line, it is the line up to its line break with the carriage return left out; the entry's text is read with every carriage return, tab and line break as a space (§3 says «its tags taken out»; white space is read as one space).
4. **Amended: a count added to §7.** Beside the three variants, the effect of R2's lines alone under v1.1 is counted: their rows withheld (pairs, places, rows, keys, lines), and the places by their numbers and the entries gathered there. It is read from `list-b-only-v1.jsonl.gz` as §7 reads it.
5. **Found, not amended: R3 reaches one line of v204.** v204 line 8127 (key ש, rank 37, M23) gives b v.ab.aa (BDB's entry headed שֶׁ) and no number; BDB's own rows that carry v.ab.aa alone all carry H7945, so R3-A gives it H7945. The rule's words reach it as they reach the 102 lines of v203.
