# RULE — the entry each English Wiktionary row belongs to (entry ledger v1, English Wiktionary)

20 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. The clauses were written after a census of the three Bible dictionaries' own marks and of what each Wiktionary row offers to a join (kept in this lane's scratch, not shipped).

## What is asked

The serving lane's plan of 16 November 2026 AD, which the owner agreed: «Every row gets the entry it belongs to, chosen by the word as the text points it.» Part 1: «The entry ledger. Row -> entry, with its evidence, in the shape of row-entries v1.1, for the sources that carry none.» English Wiktionary first.

Here: every served row of English Wiktionary's Hebrew and Aramaic entries, the eight m ids M11, M13, M25, M50, M69 (Hebrew) and M60, M72, M177 (Aramaic). Each row gets the entries of the Bible dictionaries it belongs to, as the page's gate reads them in slot 10 of a store row: `n` (Strong's numbers), `t` (STEP's lettered entries), `b` (BDB's entry ids), each written as the row entries ledger v1.2 writes them.

The owner's doctrine binds every clause below. A row is judged only by its own source's marks and the other sources' own marks, by category («we need to think in terms of each dictionary as a category»), never by this lane reading the English, never by a row list. Every case goes in the ledger as a labelled branch, negatives too. Where a row could be two entries, both are listed. Where none, the ledger says none and why. No source's words are changed.

## The words used here

- **The store**: the page's route store at store_version 54416ff5785b (`index.json` and its 256 shards). A row is `[rank, route text, definition text, m id, year, cut, headwords, ., ., closes, facts]`; slot 10, the facts, may be absent.
- **sha16**: the first 16 hex of the sha256 of the row's route text (slot 1) in UTF-8, as in row entries v1 and dictionary marks v1.
- **The row side**: dictionary marks v1 (relay v199): `english-wiktionary-row-marks-v1.jsonl` (one line per served row of the eight m ids, named by `k`, `rank`, `m`, `sha16`, with its `reads`) and `english-wiktionary-entries-v1.jsonl` (one line per Kaikki record the rows read, named `entry`, with its `word`, `pos` and `head_forms`). A **read** is `[file, line, sense id, form number]`; file `he` is `kaikki.org-dictionary-Hebrew.jsonl`, `arc` is `kaikki.org-dictionary-Aramaic-words.jsonl`.
- **A record**: one line of a Kaikki file, named `he:<line>` or `arc:<line>`. **A sense**: one item of its `senses`, named by its `id`.
- **The row's language**: `he` when its reads are of the Hebrew file, `arc` when of the Aramaic file (the eight m ids keep to one file each).
- **The three dictionaries**: Strong's, TBESH and the lexical index (next section). **A candidate**: one entry of one of them, named by the dictionary and the entry's own id.

## The three dictionaries, and why these

Each is a Bible dictionary in the source cache that writes, for each of its entries, its own pointed head, its own part-of-speech mark, its own language mark and its own number.

1. **Strong's**, `openscriptures-hebrewlexicon-2026-07-14/HebrewStrong.xml` (the file the store's M9 rows come from). Each `<entry id="H…">`: its head is the text of its first `<w>` element; that element's `pos` attribute (Strong's own codes, such as `v`, `n-m`, `n-pr-loc`; a value of two or more codes is parted at spaces) and its `xml:lang` attribute (`heb`, `arc`, or `x-pn` for a proper name). Its number is its id. It gives `n`.
2. **TBESH**, `stepbible-data-2026-07-14/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt` (the file the store's M19 rows come from). It extends Strong's to every BDB entry and marks Aramaic apart. Each line whose first column begins with `H` and a digit; columns parted at tabs: 1 eStrong, 2 dStrong and relation, 3 uStrong, 4 Hebrew, 5 transliteration, 6 Morph, 7 gloss, 8 meaning. The **dStrong** is column 2 up to its first space; the **relation** is the rest of column 2 with its spaces at both ends taken off (`=`, `= a Meaning of`, `= in Aramaic of`, and so on). The Hebrew column is parted at commas; each part, its spaces at both ends taken off, is a head of the line. The Morph is TBESH's own «Language:Type-Gender-Extra». The number is `H` and the dStrong's digits without leading zeros; where a letter follows the digits (of either case), the line's `t` is `H`, those digits and the letter, as row entries v1.1 writes `t`. It gives `n` and `t`.
   - **Not read**: a line whose relation begins `= a Part of`. TBESH marks such a line as a part of another entry's name (Abi- in Abiel, Beth- in Beth-togarmah), not a word on its own.
3. **The lexical index**, `openscriptures-hebrewlexicon-2026-07-14/LexicalIndex.xml`, the Open Scriptures index of BDB's entries (the file the store's M33 rows come from). Each `<entry id>` inside `<part xml:lang="heb">` or `<part xml:lang="arc">`: its head is the text of its first `<w>`; its part of speech is the text of its first `<pos>` (the Open Scriptures morphology codes: `V`, `N`, `Np`, `A`, `D`, `R`, `T`, `Pp` and the rest; an entry with no `<pos>` has none); its `<xref>` names the BDB entry (`bdb`, the id the store's BDB rows carry in `b`) and Strong's number (`strong`). It gives `b`, and `n` where `strong` is digits (a `strong` of letters only is a prefix's code, not a number, as row entries v1 says).
   - BDB's own file, `BrownDriverBriggs.xml`, is read to hold that every `bdb` the index names is an entry there. BDB's own entries are not joined directly: they mark the part of speech in prose abbreviations (over 120 spellings, and 3,148 entries with none), and 2,595 of them are root headings with no pointing; the index gives each BDB entry one pointed head and one coded part of speech.

Not read here: the other Bible dictionaries of the store that name entries by Strong's numbers (UHAL, the SDBH, UBS, BibleTools, Strong's via Wikisource, the unabridged BDB). Each can be added later as a further category by the same clauses.

## Language

A candidate's language agrees with the row's when:

- Strong's: `heb` with `he`; `arc` with `arc`; `x-pn` with both.
- TBESH: each Morph part's language letter: `H` with `he`, `A` with `arc`, `N` (names; TBESH: «n+Name (which is not language specific)») with both, and a part with no language letter (`Prefix`, `Suffix`, `Punct.`, the pronoun suffixes `Ps1c` to `Sp3f`) with both. A line whose parts carry both `H` and `A` agrees with both.
- The lexical index: part `heb` with `he`, part `arc` with `arc`.

## Kinds of word: the declared table

The row's kind of word is its record's `pos` as Wiktionary writes it (twenty values in these files): `verb`, `noun`, `adj`, `num`, `name`, `adv`, `prep`, `conj`, `intj`, `pron`, `det`, `particle`, `article`, `prefix`, `suffix`, `character`, `phrase`, `prep_phrase`, `contraction`, `symbol`.

`pos-agreement-v1.json`, beside this rule and written with it, declares for each value of each dictionary the Wiktionary values that agree with it. A candidate's kind agrees when the record's `pos` is among them, for any of its Strong's codes or any of its TBESH Morph parts. The table, in short:

| Kind | Wiktionary | Strong's | TBESH type | lexical index |
|---|---|---|---|---|
| verbs | verb | v | V | V |
| nouns, adjectives and numerals, one kind | noun, adj, num | n, n-m, n-f, a, a-m, a-f | N, A (under H or A) | N, A, Ao |
| gentilics | noun, adj, name | a-gent | a name part whose Extra holds G | Ag, Ng |
| names | name | n-pr, n-pr-m, n-pr-f, n-pr-loc | every part under N (a title, Extra T, also noun) | Np |
| adverbs | adv | adv | Adv | D |
| prepositions | prep | prep | Prep | R (and R C) |
| conjunctions | conj | conj | Conj, Cond | C, C? (and R C) |
| interjections | intj | inj | Intj | Tj |
| pronouns | pron | p, pron, x | PerP, IndP | Pp, Pf, Pi |
| demonstratives | pron, det | d | DemP | P, Pd |
| interrogatives | pron, adv (TBESH also particle) | i | Intg | Pi (pron), Ti (particle, adv) |
| relatives | pron, conj, prep, particle | r | RelP | Pr |
| particles | particle, adv, conj, prep, intj | prt | Part | T |
| negatives | particle, adv | np | Neg | |
| pointing particles | particle, intj, adv | dp | | Tm |
| the object mark | particle, prep | | | To |
| the article | article | | | Td |
| prefixes, suffixes | prefix; suffix | | Prefix; Suffix and Ps1c to Sp3f | |
| no kind | character, phrase, prep_phrase, contraction, symbol | | Punct. | an entry with no pos |

Why these pairs, by what each value names:

- **Verbs stand apart from every other kind.** That is the case of Genesis 1:22: פָּרָה is a verb (H6509, «bear fruit») and a noun (H6510, «heifer»), pointed alike; the kind parts them.
- **Names stand apart from common words.** אָדָם is H120 (`n-m`, «man») and H121 (`n-pr-m`, Adam).
- **Nouns, adjectives and numerals are one kind here.** The Bible dictionaries file a word used both ways under the adjective (זָקֵן «old», used for «elder», is Strong's `a`, TBESH `H:A`, the index `A`) where Wiktionary files it as a noun, and they write numerals as nouns or adjectives (Strong's: אֶחָד `a`, שְׁנַיִם `n`, מֵאָה `n-f`). The two sides part these words otherwise, so the join does not part them.
- **The small words follow what each dictionary's value names.** The Bible dictionaries' «particle» (Strong's `prt`, TBESH `Part`, the index `T`) is their one mark for small words that Wiktionary parts into adverbs, conjunctions, prepositions and interjections (אִם, אַף, אֵת). A negative is an adverb or a particle in Wiktionary (לֹא adv, אֵין particle). An interrogative is a pronoun or an adverb (מִי pron, אֵיךְ adv). A relative is a pronoun, a conjunction or a preposition (אֲשֶׁר conj, שֶׁל prep).

The builder stops on any dictionary value or Wiktionary `pos` not in the table.

## The pointing: every normalisation clause

The **key** of a string, used to compare a Wiktionary form with a dictionary head:

1. Every character is read in order. Kept: the letters U+05D0 to U+05EA (the 27 letters, the final ones among them), and the points U+05B0 to U+05BC (the vowel points, holam haser for vav U+05BA, qubuts U+05BB, and dagesh or mapiq U+05BC), the shin dot U+05C1, the sin dot U+05C2 and qamats qatan U+05C7.
2. Folded: a final letter to its other form (U+05DA to U+05DB, U+05DD to U+05DE, U+05DF to U+05E0, U+05E3 to U+05E4, U+05E5 to U+05E6); qamats qatan U+05C7 to qamats U+05B8; holam haser for vav U+05BA to holam U+05B9.
3. Dropped: everything else. That is the cantillation accents U+0591 to U+05AF, meteg U+05BD, maqaf U+05BE, rafe U+05BF, paseq U+05C0, sof pasuq U+05C3, the upper and lower dots U+05C4 and U+05C5, nun hafukha U+05C6, the ligatures U+05F0 to U+05F2, geresh U+05F3 and gershayim U+05F4, spaces, the combining grapheme joiner U+034F, the direction and joiner marks, and every punctuation mark or symbol (a full stop, a bullet, a slash, square brackets: the bracket goes and what it holds stays).
4. Each kept letter, with the kept points after it up to the next letter, is a **cluster**; points before the first letter join the first cluster. In each cluster the points are put in code point order (so shin with qamats and shin dot is one key whichever point is written first). The key is the clusters in order.

So the key keeps the letters, the vowels, the dagesh and the shin and sin dots, and nothing else. Two forms join only when their keys are equal.

Also:

- **The letters** of a string: its kept letters only, finals folded (the key with no points). Used by the root road and by the list of forms with the same letters and other pointing.
- **Pointed**: a string is pointed when it holds a point of clause 1 (U+05B0 to U+05BC, U+05C1, U+05C2 or U+05C7), as dictionary marks v1 says.
- **Usable**: a form is usable when it holds at least one letter U+05D0 to U+05EA and no letter or digit of another script (a character of Unicode category L or N outside U+0590 to U+05FF). So «רָקַד .» is usable (its full stop is dropped) and «אָח m» is not (its «m» is a Latin letter).
- Hebrew presentation forms (U+FB1D to U+FB4F) are not decomposed. None occurs in the census; the builder counts them in every form it keys and stops if one occurs.

## What a Wiktionary entry offers

- **The unit.** A read whose sense names another word in its `form_of` or `alt_of` (Wiktionary's own «form of» and «alternative form of») is joined as that sense, named `<record>#<sense id>`, with its **sense kind** `form-of` (it has `form_of`) or `alt-of` (`alt_of` only). Every other read is joined as its record, named `<record>`, sense kind `plain`. A row's units are its reads' units, distinct, in the order of its reads.
- **The head forms**: the record's `head_forms` as dictionary marks v1's table gives them (the forms Kaikki tags `canonical`, distinct, in order). Where it gives none, the record's `word` is the one head form.
- **The named words** (form-of and alt-of units): each item's `word` of the sense's `form_of`, then of its `alt_of`, as written.
- **The kind**: the record's `pos`, as v199's table gives it.
- **The roots** (verbs only): the root names the record gives, read from the Kaikki record: the `name` of each of the record's `categories`, then of each sense's `categories` in sense order, that reads «Hebrew terms belonging to the root X» or «Aramaic terms belonging to the root X» (X is the root); then each `etymology_templates` item named `he-rootbox` (each argument named by a number, in number order, is a root); then each named `he-root` (its arguments named by numbers, in number order, joined, are one root). A root is its letters; roots are distinct by letters, in the order met.

## The roads

1. **head**: not for a form-of unit. Each head form that is usable and pointed; its candidates are the dictionary entries of agreeing language whose key (any head of a TBESH line) is the form's key.
2. **lemma**: form-of and alt-of units only. Each named word that is usable and pointed; candidates as in road 1.
3. **root**: units whose kind is `verb`, only when roads 1 and 2 gave no candidate of agreeing kind. Each root; its candidates are the entries of agreeing language whose kind agrees with `verb` and whose head's letters are the root's letters.

The roads are tried in this order. The first road that gives a candidate of agreeing kind **stands**, and its candidates of agreeing kind are **taken**. A candidate is listed once per unit, with the first form or root that met it, in the order met (Strong's, then TBESH, then the lexical index, each in file order, within each form in order).

Listed and not taken, so every case is in the ledger:

- `not_taken`: the candidates of the roads tried whose kind does not agree (each with why: `KIND_DIFFERS`).
- `same_letters_other_pointing` (units with no road standing): the entries of agreeing language and kind whose head's letters are the letters of a usable form tried on road 1 or 2, but whose key is not that form's key.

## Why a unit has no entry

When no road stands, its **reason**, the first that holds:

1. `KIND_IN_NO_DICTIONARY`: its kind agrees with no value of any of the three dictionaries.
2. `KIND_DIFFERS`: a road found entries with its pointing, of other kinds only.
3. `ROOT_HAS_NO_VERB_ENTRY`: a verb whose root is named, with no verb entry of those letters.
4. `NO_SAME_POINTING`: a usable pointed form was tried and no entry of its language has its key.
5. `NOT_POINTED`: the usable forms carry no point (Wiktionary gives the head unpointed).
6. `FORM_HOLDS_OTHER_TEXT`: no form tried is usable.

A verb whose record names no root, for reasons 2, 4, 5 and 6, has `_NO_ROOT_NAMED` added (`NO_SAME_POINTING_NO_ROOT_NAMED`): the root road could not be tried.

## A row

- `n`: the numbers of the taken candidates of all its units, distinct, in ascending order of the digits.
- `t`: the `t` of its taken TBESH candidates, distinct, by digits and then letter.
- `b`: the `b` of its taken lexical index candidates, distinct, in code point order.
- **The class**:
  - `ONE_ENTRY`: one number.
  - `SEVERAL_ENTRIES`: two or more numbers.
  - `BDB_ENTRY_ONLY`: no number, and one or more BDB ids (the index names a BDB entry whose `strong` is a prefix's code or absent).
  - `NO_ENTRY_<reason>`: none. Where its units give several reasons, the first in this order stands: `KIND_DIFFERS`, `KIND_DIFFERS_NO_ROOT_NAMED`, `ROOT_HAS_NO_VERB_ENTRY`, `NO_SAME_POINTING`, `NO_SAME_POINTING_NO_ROOT_NAMED`, `NOT_POINTED`, `NOT_POINTED_NO_ROOT_NAMED`, `FORM_HOLDS_OTHER_TEXT`, `FORM_HOLDS_OTHER_TEXT_NO_ROOT_NAMED`, `KIND_IN_NO_DICTIONARY`. A row with no reads (dictionary marks v1 does not reach it) is `NO_ENTRY_NOT_REACHED`.
- **The branches** (`SEVERAL_ENTRIES` only): one branch per number, in the order of `n`, each with the taken candidates that name it (`strong:H166`, `tbesh:H0166`, `lexidx:abc`). **What parts them**: each of these marks that two branches both carry with other values: `wiktionary entry` (the unit), `road`, `pointing` (the candidate head's key), `strong pos`, `strong language`, `tbesh morph`, `tbesh relation`, `lexical index pos`, `lexical index part`. Where none does, the list is empty: nothing in their own marks parts them, and both stand.

## The line

**`entry-ledger-wiktionary-v1.jsonl`**: one line per key of the store holding a row of the eight m ids, in the store's order (shards `00` to `ff`, keys in each shard's order), `{"k": K, "rows": [...]}`, the key's rows of the eight m ids in the key's order. A row is an array of nine slots:

1. `rank`, as the store holds it;
2. `m`, its m id;
3. `sha16`;
4. its class;
5. `n`;
6. `t`;
7. `b`;
8. **the evidence**: for each unit, `[unit, kind, road or reason, taken]`, where `taken` is, for each taken candidate, `[dictionary, entry id, the head as the dictionary writes it, its part-of-speech mark as written, the Wiktionary form or root that met it]`;
9. **the branches**: `[]`, or for `SEVERAL_ENTRIES` `[what parts them, [[number, [candidate, ...]], ...]]`.

Where the store holds one row twice (the same key, rank, m id and text), the ledger lists it twice, as row entries v1 does.

**`wiktionary-units-v1.jsonl`**: one line per unit, in the order the ledger first meets it, with its whole evidence: `unit`, `word`, `kind`, `language`, `sense_kind`, `head_forms` (not for form-of units), `named` (form-of and alt-of units), `roots` (verbs), `tried` (each form or root tried: `[road, as written, usable, pointed]`), `road`, `reason`, `taken`, `not_taken`, `same_letters_other_pointing`, `n`, `t`, `b`. A candidate there is `{dict, id, head, pos, language, road, met_by}`, with TBESH's `relation`, and its `n`, `t` and `b`.

## The facts slot

The page reads slot 10. `facts-slot-wiktionary-v1.tsv`, in the shape of v190's and v197's lists, with the row's hash added because rows cut from one record share a rank: every served row of the eight m ids whose `n`, `t` or `b` under this ledger differ from slot 10 now. Columns: `key`, `rank`, `m_id`, `sha16`, `route_text`, `facts_now` (slot 10 as served, `{}` where absent), `facts_under_entry_ledger` (the same object with `n`, `t` and `b` set from the ledger where it gives any, its keys in code point order as the store writes them), `what_changes`, `class`. Other facts (`name` and the rest) are not touched. The builder holds that no row of the eight m ids carries `n`, `t` or `b` now; if one did, the list would compare it.

## Counts

Per m id and over all: rows; `ONE_ENTRY`, `SEVERAL_ENTRIES`, `BDB_ENTRY_ONLY`, and `NO_ENTRY` with each reason; rows with `n`, with `t`, with `b`. Rows by the roads that stood. Rows by which dictionaries were taken. Units by road and reason. Units where the dictionaries taken give different numbers. Rows whose several entries nothing in their marks parts. Candidates taken whose key was met only through a fold of clause 2 or the order of clause 4. Under the key פרו, every row with its class, entries and evidence (Genesis 1:22).

## Checks (each stops the build)

1. The row marks and the entries table are the bytes dictionary marks v1's receipt names, read on the same store_version.
2. The two Kaikki files are the bytes v199's receipt names; Strong's, the lexical index and BDB are the bytes their acquisition manifest names; TBESH is the bytes the STEP manifest names.
3. Every served row of the eight m ids is met by one line of the row marks (key, rank, m id, sha16), and every line by one served row.
4. Every read's sense is in its record; v199's `pos` and `head_forms` of each record are the Kaikki record's `pos` and its canonical forms.
5. Every dictionary value and every Wiktionary `pos` met is in the declared table.
6. Every `bdb` the lexical index names is an entry id of BDB's file.
7. No presentation form in a keyed form.
8. No row of the eight m ids carries `n`, `t` or `b` in slot 10 now; no route text in the facts list holds a tab or a line break.
9. No file written holds a machine path or the home folder's name.
10. The second count agrees on every line of both files, every line of the facts list, and every count.
11. Two runs give the same bytes.

## The second count

`verify-entry-ledger-wiktionary-v1.mjs`, not importing the builder. It reads the shards from `ff` down to `00`; reads Strong's, TBESH and the index by its own scanners (string search, not the builder's patterns); reads each Kaikki record by byte offsets; takes the head forms and kinds from the Kaikki records themselves, not from v199's table; writes each key as a letter with a count of each kept point (not a sorted string); joins by sorted arrays and binary search, not by hash maps; and makes every unit, row, branch and facts line again by its own code. It must agree with the builder line for line and count for count, or it exits non-zero. It writes `verify-receipt-v1.json`.

## Not here

Part 2 of the plan, choosing at a place among a row's entries by the text's own pointing, is the page's. No row's English is read. Nothing served is changed.

## Amended after the first run, before any ship (20 November 2026 AD)

1. **What parts the branches**: `dictionary` (which of the three dictionaries names the branch) is added to the marks, after `road`. The first run found branches that each only one dictionary names (M60's אֲדָר, Aramaic «March»: TBESH's name line H143 and the index's Aramaic entry H144). With no mark shared by both, it called them parted by nothing, when it is the dictionaries that part them.
2. **The count of joins met only through a fold or the order** is given apart by what each needed: the order of the points (clause 4), a fold (clause 2), or both. A count only; no clause of the join changes.
3. **The root road is a branch, off at rest.** The lane's call of 20 November 2026 AD, on the owner's standing lesson: an entry with the same letters is another word, and a root is not a word. Landed whole, the first list would have given «to splint, to set» (תקבענה, M25 rank 7) H6906 by its root, and the gate would then keep it at Malachi 3:8, where קָבַע is «rob». The page cannot tell the roads apart in the facts list without joining the ledger. So:
   - **A row's `n`, `t` and `b`** (slots 5 to 7) are the values of the entries taken by the `head` and `lemma` roads only. The values of the entries taken by the `root` road that the head and lemma roads do not give are the row's **root-only** `n`, `t` and `b`.
   - **The class** counts the head and lemma values only: `ONE_ENTRY`, `SEVERAL_ENTRIES` and `BDB_ENTRY_ONLY` as before. A row with none of those and some root-only value is `ROOT_BRANCH_ONLY`. Otherwise `NO_ENTRY_<reason>` as before.
   - **The branches** (slot 9) are listed when the row has two or more numbers in all, its head and lemma numbers and its root-only numbers together, or any root-only number. Each branch is `[number, [candidate, ...], label]`; the label is the roads that reached that number, in the order `head`, `lemma`, `root`, joined by `+`. A root-only number's label is `root`. What parts them is read over all the listed branches, as before. Otherwise slot 9 is `[]`.
   - **The landing list**, `facts-slot-wiktionary-v1.tsv`, carries only the rows with a head or lemma value, and only those values. A row whose only entries come by the root road is not in it.
   - **The root branch list**, `facts-slot-root-branch-wiktionary-v1.tsv`, carries every row with a root-only value: the same columns, and `road` (always `root`). Its `facts_now` is slot 10 as served. Its `facts_under_entry_ledger` is the facts with the branch on: the facts now, with `n`, `t` and `b` the head and lemma values and the root-only values together, in the ledger's orders, keys in code point order. Its `what_changes` is what the branch adds over the landing list. It is off at rest: the page lands it only if the owner turns the branch on.
   - The evidence (slot 8) and the units file are as before: every unit still names its road, and a unit whose road is `root` still lists what it took.
   - The second count follows the same split by its own road.
