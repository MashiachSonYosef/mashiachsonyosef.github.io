# The two entry lists, reissued as v1.1

Corpus lane (Moses), 21 November 2026 AD. For the page lane. Relay v212 promised that relay v218 would reissue the lists of relays v203 and v204 with three things settled: «n.fr.aa off the 5 lines of section 3, the entry of the 231 lines, and whether the 102 take `n` H4480». Each is settled here by a rule of BDB's own data that names a class, and each rule was run over every line of both lists, not only over the lines v212 named. The rule is `RULE.md`, written before the builder (its sha256 before the first run is in `rule-sha256-v1.txt`; five notes made after the first run stand at its foot, and none changes a line). Every figure below is read from `counts-v1.1.json`, `changes-v1.1.jsonl`, `decisions-v1.1.jsonl`, `receipt-v1.1.json` or `verify-receipt-v1.1.json` in this folder. Nothing served is changed.

## What changes

| list | lines | changed | by R1 | by R3 | the same bytes as v1 |
|---|---|---|---|---|---|
| v203 (English Wiktionary) | 54,261 | 126 | 24 | 102 | 54,135 |
| v204 (Classical Hebrew Words, Hebrew Wiktionary) | 9,192 | 4 | 3 | 1 | 9,188 |

R2 changes no line. Land v1.1 as you landed v1: v203 said «Land each by key, rank, m_id and sha16», and v204 said «Land each by key and rank, with m_id and text as the check». Every line not named in `changes-v1.1.jsonl` is byte for byte its v1 line, header and order included.

## R1: «forget», and the class it stands for

**The class.** A line gives numbers, and one of its BDB entries has no number of its own: no row of BDB's own that carries that entry alone carries a number, and the lexical index names it with no Strong's number. BDB's own entry then says where it belongs. Where BDB's entry is a pointer (no mark of the kind of word, no senses, and its words send the reader on with «v.» to another entry it names), the entry belongs to its target. Where the target's numbers are none of the line's, the entry comes off the line's `b`.

**What BDB's own data says about n.fr.aa.** Its entry in BDB via Open Scriptures reads, byte for byte, «<w>נָשָׁא</w> <def>forget</def>, v. <w src="n.fu.aa">נָשָׁה</w>.» The index names it «<xref bdb="n.fr.aa"/>», with no number. BDB's own one row of it (under נשא, rank 173, M5) carries no number. Its target n.fu.aa is carried alone by 5 rows of BDB's own under נשה, all H5382, and the index gives it «strong="5382"». The unabridged BDB says the same thing in its own words: its entry BDB5407 reads, with its tags taken out and its spaces folded, «III. [נָשָׁא] forget, see II. נָשָׁה. below», and its Strong link is H5382; its BDB5412, «II. [נָשָׁה] verb forget», is also H5382. Every line that gives n.fr.aa gives H5377 and H5378. Neither is H5382, so n.fr.aa comes off.

**It reaches 27 lines, not 5.** All 27 are R1's branch A (a pointer to another number). The 5 that v212 named (v203 lines 54212, 54213; v204 lines 9182, 9183, 9184, all under נשא) and 22 more of v203, each under a key that spells a form of נשא:

- v203 lines 1820 (נשאנה), 4543 (אשא), 5728 (נשאתן), 7665 (ישאו), 12608 (נושאים), 12617 (נשאתי), 16746 (נשאתם), 18206 (נשוא), 18727 (תשאי), 21048 (תשאנה), 26948 (אישא), 33383 (נושאות), 33778 (נשאה), 34757 (תשאו), 35274 (נשאי), 36360 (נשאת), 39984 (נושא), 40787 (נשאו), 41067 (תשא), 41739 (נשאנו), 48865 (נושאת), 52246 (ישא).

Each line keeps its numbers, H5377 and H5378, and its two other entries, n.fp.aa and n.fq.aa. Its class stays `SEVERAL_ENTRIES`.

**Nothing else is in the class.** On every other line that gives numbers, every entry has a number of its own (60,680 pairs of line and entry in v203, 10,367 in v204). n.fr.aa is the only entry in either list with no number on a line that gives numbers.

## R2: the 231 lines under the keys that spell אֶל with an ending

**The class.** A line's entry is one that BDB writes as a single letter joined to the front of a word (the index marks it with a letter code, as «strong="l"», and never with a number), and the line's key does not begin with that letter. It reaches exactly the 231 lines v212 held: l.aa.ab, BDB's entry headed לְ, under אלי, אליו, אליך, אליהם, אליה, אליכם, אלינו, אליהן, אלייך, אליכן and אליי, 21 lines each. No other line of either list is in the class.

**What decides.** Each of the 231 reads one record of English Wiktionary, he:3181, the entry for ל־ (63 lines of M11, 168 of M25), and the ledger joined that record's own head, לְ־, to the index's לְ (entry gau, l.aa.ab). The row is a sense of ל־ by its own source. The store holds it under these keys, and this build reads it there; no file here shows why the record's senses stand at these spellings. The checker found that English Wiktionary's own rows, as Kaikki gives them, list אֵלָיו as a form of record 3181. BDB's own rows under the 11 keys give these rows no other entry: under 10 of the keys BDB keeps no row at all, and under אליה its rows are two other words, «fat tail» אַלְיָה (a.dn.ab, H451) and Elijah אֵלִיָּה (a.dl.an, H452).

**The lane's call: they land as given, with l.aa.ab.** v212's hold on them is lifted. A row's entry is the entry of its own record; the key it stands under is the place's matter, and the gate compares the two. BDB parts לְ from the word at these places. So when a reader presses them open, the gate withholds them as another entry's, and that is BDB's own parting.

- They rest shut on the thirty-nine books, so at rest nothing shows (0 places).
- Pressed open, or on the whole-key gather, 168 of their rows are withheld at 1,502 places (31,542 place-and-row pairs, 8 keys). At 1,484 of those places, places of H413, the entry gathered is a.di.aa; at 12 places of H410 it is a.dl.ab, at 5 places of H452 it is a.dl.an, and at 1 place of H194 it is a.by.aa. The other 63 lines are withheld nowhere. With the core pieces' keys too: 1,517 places, 53,550 pairs.
- They carry no number, so they gather nothing and cause no flip of BDB's rows.

**Two other ways, named and not taken.** (1) To give them a.di.aa, the entry of the key's own word. That takes the entry from the key, not from the row's own record, and it would let ל־'s senses stand at the places of אֶל. (2) To give them no entry. That drops BDB's parting, and they would be left at every place.

## R3: the 102 lines that give מִן's entry and no number

**The class.** A line gives `b` and no `n`. Where BDB's own rows that carry the line's entry alone all carry one and the same single number, the line takes that number. A row that names two entries is not read for numbers.

**What BDB's own data says about m.cl.aa.** Its entry opens, byte for byte, «<entry id="m.cl.aa" type="root"><w>מִן־</w>, and <w>מִ</w>, before <w>יְ</w>, <pos>prep</pos>.». 19 rows of BDB's own carry it alone, all under מן, and every one carries H4480. The index names it twice: «<xref bdb="m.cl.aa" strong="4480" aug="a" twot="1212"/>» (its head מִן־) and «<xref bdb="m.cl.aa" strong="m" twot="1212"/>» (its head מִ). The lines came by that second one. The unabridged BDB's entry BDB4709, «מִןֿ and מִּ», links H4480.

**It reaches 696 lines and changes 103:**

- v203: 660 lines reached. 102 take H4480 (R3-A): ממנו 9, ממכם 8, ממכן 8, and 7 each under ממני, ממנה, ממך, מכן, מכם, מהן, מהם, מאתנו, מאיתנו, הימנו, הימנה. Their class goes from `BDB_ENTRY_ONLY` to `ONE_ENTRY`, v203's own word for one number. The other 558 take none. 556 give l.aa.ab (463) or b.ab.aa (92) or e.ac.aa (1), entries whose rows of BDB's own carry no number (R3-B). The last 2 give e.ab.aa, which no row of BDB's own carries alone (R3-C).
- v204: 36 lines reached. One more takes a number: **line 8127**, key ש, rank 37, M23, «which, that, who», gives v.ab.aa, BDB's entry headed שֶׁ. The 7 rows of BDB's own that carry v.ab.aa alone, all under ש, all carry H7945, so the line takes H7945. Its class stays `ONE_ENTRY`. Note: the unabridged edition links its own entry for שֶׁ (BDB8356) to three numbers, H834, H4100 and H7945. The rule reads BDB's own rows, and the witness only stands beside them. The served store's own rows say what the witness says: BDB's 4 rows of the unabridged edition (M46) under ש are headed שֶׁ, and each carries H834, H4100 and H7945. They carry no `b`, so they name no entry. R3 reads a number only from rows that name the entry alone, because only such a row says whose its number is; a row that names no entry cannot say which of its numbers is שֶׁ's. So this call rests on the 7 rows of the Open Scriptures edition (M5) alone, and it is the lane's call. The other 35 lines give the letters' own entries or the joined letters, which BDB's rows give no number (18, R3-B) or do not carry alone (17, R3-C).
- The 14 lines under הימנו and הימנה are of מִ־'s record, as the 231 are of ל־'s. Their key does not begin with מ, but m.cl.aa is not R2's class, because the index gives it a number. v204 already gives H4480 under the same two keys (lines 3633, 3634, 8481, 8482).
- Also named, not taken: the unabridged edition links its own entry for לְ (BDB4264) to H9005. No row of that edition names an entry, and the rows that carry l.aa.ab (11 of BDB's own, under ל) carry no number. So l.aa.ab takes none.

## The effect, read from bdb-b-flips-v1's own records

First, the records were worked again with v1 landed whole, and they give back `bdb-b-flips-v1/counts-v1.json` exactly. Then they were worked with v1.1 landed. The figures are flips of BDB's own rows that carry `b` and no number, with the place asking its word's own key (reading A):

| gather | v1 landed whole | as v212 said it lands | v1.1 |
|---|---|---|---|
| whole key (taken) | 3,927 left → withheld, 2 withheld → left | 3,927 and 0 | 3,927 and 0 |
| | (3,929 at 2,217 places, 115 rows, 39 keys) | (2,215 places, 114 rows, 38 keys) | (2,215 places, 114 rows, 38 keys) |
| open at rest | 0 | 0 | 0 |
| pressed open | 3,907 and 2 | 3,907 and 0 | 3,907 and 0 (2,204 places, 103 rows, 34 keys) |

- **What goes away:** only the «forget» flips, all of one row (נשא rank 173). On the whole key: 1 Samuel 22:2, record 10, and Isaiah 24:2, record 14. With the core pieces' keys: also 1 Kings 8:31, record 6. The same under pressed open. That is 10 (flip, reading) cells in all. «forget» stays withheld there, as today.
- **Nothing new comes.** BDB's own rows carry n.fr.aa alone on one row only, «forget» under נשא, so taking it off the 22 other lines moves no verdict of BDB's rows. R2 adds no number. R3's lines gain a number, but no row of BDB's own with `b` and no number stands under their keys, and no record of either file does. These two checks leave one row uncovered. bdb-b-flips-v1's records hold only rows that end up withheld, so a list row that was left and has no record could not trip the builder's stop. One such row stands under an R3 key: v204 line 8128, key ש, rank 51, M29, `b` v.aa.aa u.aa.aa v.ab.aa and no number. BDB's own rows close it without a zone. Under ש, the rows that carry `b` and a number are BDB's 7 rows of v.ab.aa (M5) and, in v1.1, line 8127; each carries `b` v.ab.aa alone and H7945 alone. So at any place that asks ש, the entries gathered there are none or v.ab.aa alone, with v1 landed or v1.1. Line 8128 carries v.ab.aa, and the gate withholds a row only where the entries gathered hold none of the row's own, so it leaves line 8128 wherever it is judged. The checker came to the same end by reading the gate's rule. No such row stands under the other 14 keys of R3's lines. It rests shut on the thirty-nine books, so at rest nothing changes.
- With the core pieces' keys (reading B): 7,771 left → withheld at 3,836 places (137 rows, 47 keys), 0 the other way; pressed open 7,751 at 3,825.
- **The lists' own rows that carry `b` and no number.** As v212 said they land: 103 rows withheld at 2,372 places (19,464 pairs, 14 keys). Under v1.1: 271 rows at 3,874 places (51,006 pairs, 22 keys); pressed open, 50,997 pairs at 3,873 places. The difference is the 168 rows of R2's lines. They rest shut, so at rest nothing shows.
- **Not counted:** how the 103 lines of R3 are now judged by their number, place by place. bdb-b-flips-v1's records do not hold their places, because those rows were never withheld or flipped. They rest shut on the thirty-nine books.

## The lane's calls

1. **R1:** the class is an entry with no number of its own on a line that gives numbers, and BDB's own pointer decides it. A pointer entry's number is its target's, read from BDB's own rows and the index. The unabridged edition is a witness, and the builder stops if the witness names one of the line's numbers.
2. **R2:** a row's entry is the entry of its own record. The 231 land as given, with l.aa.ab.
3. **R3:** «the number BDB's own rows give that entry» is read only from BDB's rows that name that entry alone.
4. **The class column:** a changed v203 line takes v203's own class word for its new facts. A v204 line keeps its class.
5. **The ledgers** (`entry-ledger-wiktionary-v1.jsonl`, `entry-ledger-v1.jsonl`) are not reissued. `changes-v1.1.jsonl` names, for each changed line, its ledger row and what the list now sets aside (for v204, the branch «inl», n.fr.aa).

Nothing here waits on the owner. Landing the lists is the page lane's step, as with v203 and v204.

## How it was made, and checked

- `build-lists-v1.1.mjs` reads the two lists, their two ledgers (for evidence only), the store 88fec6d59737, BDB via Open Scriptures, the lexical index and its manifest, the unabridged BDB, and bdb-b-flips-v1's flips, list rows and counts. Each input is taken by its argument. The two lists and their two ledgers are checked against the sha256 that relays v203 and v204 name, bdb-b-flips-v1's flips, list rows and counts against relay v212's, the store's index against RULE.md's, and BDB via Open Scriptures and the lexical index against the sha256 their manifest names. The store's shards, the manifest itself and the unabridged BDB are only recorded in `receipt-v1.1.json`, not checked: the unabridged BDB's manifest names the zip it came in, not the file itself, and no relay names the sha256 of the shards or of the manifest. Before changing anything it holds that each list's own formula gives back every v1 line's facts, `what_changes` and class. It also holds that every line meets exactly one store row that carries its numbers.
- The builder ran twice, and all 6 outputs are the same bytes (`two-runs-v1.txt`).
- `verify-lists-v1.1.mjs` counts again by another road, without the builder's code. It has its own parsers, reads the shards from ff down to 00, and finds BDB's entries by string search. It decides R1's pointer number by the unabridged witness as well as by the store. It writes both lists again by editing the v1 cells as strings, and it builds each gathered set again from its givers. It agrees: both lists byte for byte, 130 changed lines line for line, 954 decision lines, every branch count, 36 effect cells, and the 10 flips that go away (`verify-receipt-v1.1.json`, `agree: true`).

Files: `RULE.md`, `rule-sha256-v1.txt`, `build-lists-v1.1.mjs`, `facts-slot-wiktionary-v1.1.tsv`, `facts-slot-v1.1.tsv`, `changes-v1.1.jsonl` (one line per changed line, with the v1 and v1.1 cells and the BDB data that decides it), `decisions-v1.1.jsonl` (one line per line a rule reaches, changed or not), `counts-v1.1.json`, `receipt-v1.1.json`, `two-runs-v1.txt`, `verify-lists-v1.1.mjs`, `verify-receipt-v1.1.json`, and this answer. The `work/` folder (the probes, the second run, the logs) is not for shipping.

## Mended after the checker's reading, 22 November 2026 AD

A checker seat recounted every figure by its own code and agrees; its verdict is HELD. Its findings are all minor, and none changes a line of either list or a figure. These are mended in the words above: the grammar word in R1's test for a pointer is now «a mark of the kind of word»; the claim that the record's own table writes these spellings, which no file here shows, is taken out of R2, and what the checker found in the source stands in its place; the 4 rows of the unabridged edition under ש are named in R3, with why R3 does not read them; and the one row that R3's checks do not cover is named under «Nothing new comes». The 4 rows are read from the served store by the maker of relay v218, which holds the sentences above against the store and these files.

This one is recorded here. RULE.md §3 takes an entry's own numbers from rows that give one number or several; the builder also takes them from rows where some give a number and some do not. The checker counted it both ways, and 0 pairs of line and entry come out differently. RULE.md is not amended for it, nor for the grammar word it keeps above its notes for a one-letter word joined at the front, because the build's receipt names RULE.md's bytes.

And this one was in the build's report only, which is not shipped: it called the places of R2's lines, by number and entry gathered, rows. They are places, as R2 above says.

And these after the review of relay v218, the same day. The quotes above given byte for byte are now copied by code from BDB via Open Scriptures, as the changes file holds them: the typed copies had points in another order, and a plain space where BDB has a no-break space. BDB5407 is quoted with its spaces folded as well as its tags taken out, and now says so. How the builder checks its inputs is said input by input: it does not check the unabridged BDB. Line 8128 is shown unchanged from BDB's own rows, under «Nothing new comes»; the rows under ש are read from the served store by the maker of relay v218. The landing is quoted from v203 and v204.
