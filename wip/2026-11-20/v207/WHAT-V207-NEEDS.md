# What relay v207 needs before it can land (measured 20 November 2026 AD, 22:45 UTC)

Page lane (Elijah). Measured while ship 11's suite ran; nothing is built yet. v207 is the corpus lane's answer on the rows our own label struck on 31 August and 1 September: three landing lists, 22,630 lines.

## The lists (hashes matched to the letter)

| list | lines | keys | rank named | rank null | sources |
|---|---|---|---|---|---|
| `landing-own-language-v1.jsonl` | 4,090 | 1,009 | 3,968 | 122 | PanLex M24 3,341 and M82 615; the translation tables M78 122 and M103 12 |
| `landing-bible-dictionaries-v1.jsonl` | 18,164 | 6,121 | 15,795 | 2,369 | Davidson 12,487 (17 m ids), ETCBC M8 4,246, STEP's expanded Strong M51 1,431 |
| `landing-harkavy-v1.jsonl` | 376 | 269 | 343 | 33 | Harkavy (12 m ids) |

`facts` is null on every line, and `year` is «S_NO_SOURCE_YEAR» on every line.

## What the landings of ship 11c do not cover

1. **None of these sources is admitted in the store today.** The store's index holds 146 sources; all 34 m ids of v207 are among the 49 the language admission struck (`data/language-admission-v1.json`, `index.language_admission.struck_m_ids`). `derive-landings-v1` refuses a line whose source the store does not admit. So the ship starts with a re-admission: each source's entry back in `index.m_sources` (key, label, license posture and pointer), and the admission record saying on what ground it returns. The entries as they stood are in git: the index of commit bb165bf71 holds 186 sources, M8, M26, M51, M88 and M107 among them (M24 left one round earlier, so its entry is in an earlier commit).
2. **The admission rule changes its ground.** Rule v1 judged a source by our own label («names no language: silence is not a declaration»; «declares itself non-Hebrew»). v207 judges each row by what its own source says: Davidson, ETCBC and STEP's expanded Strong whole, by their own titles; PanLex and the translation tables row by row, by the row's own language field (4,090 of 14,146 return; 10,052 stay out as Yiddish, Ladino and others); Harkavy by column. That is a second version of the rule, with the record keeping both rounds. Six tools read `struck_m_ids` (the route delta, the dictionary store's bake, the search index's bake, three checks).
3. **A named rank means something else here.** In v201 a named rank is «after my own source's rows at that rank». In v207 it is «the hole the strike left», empty now at 20,106 lines; where a list landed before this one has taken the hole, the line lands as a null rank (the lane's own words). `derive-landings-v1` needs that reading per list.
4. **Four lines come off a key that ends in a maqaf** (the list already names the plain key), and 9 rows are held by the lane.
5. **The kinds.** PanLex and the translation tables are filed (word lists: they rest shut on the 39 books); Davidson is filed with the Bible dictionaries. ETCBC, STEP's expanded Strong and Harkavy have no family yet: 6,053 lines. As planned and told to the owner: ETCBC and STEP's expanded Strong with the Bible dictionaries, Harkavy with the general dictionaries.
6. **Whether they rest open.** A Bible dictionary filed so would rest open on the 39 books and can change resting lines: Davidson alone is 12,487 rows. That is the part to measure line by line before the ship, and the owner's serve state where it moves much.
7. **ETCBC's 340 descriptions in angle brackets** («<town>») come back as ETCBC writes them; whether the signs switch reads the brackets is a page question.
8. **The made spaces, the ledgers' divisions, the names lists and the entry ledgers** were all read on a store without these rows. None of these sources has a division ledger, a made-spaces list or a line in the entry ledgers, so their rows print whole and carry no entry until the lane reads them.

Order, as told to the corpus lane: ship 11 (names and entries), ship 11c (the landings that need no ruling), then this.
