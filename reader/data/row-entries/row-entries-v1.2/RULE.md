# RULE — row entries v1.2: the ledger keyed to the page's store as served now

20 November 2026 AD. Corpus lane (Moses). Written before the builders, so a second count can be made from these words alone.

## Why

The ledger v1.1 was read on the store of 12 November (store_version 90d9eb8e7082). The page's store has moved since: call 5 of relay v189 struck 5,403 rows and moved 357 to another key, relay v188 landed 4,201 rows, and relay v187's words back gave 740 rows new words. The page follows these rows through its row-strikes record, but the rows v188 landed have no line in v1.1, so they carry no facts and the page's gates cannot judge them (the serving lane's addendum of 15 November, ask 9). v1.2 is the ledger read again on the store as served now, so every served row of the fifteen sources has its line where it stands.

## What v1.2 is

v1.1's rule (`row-entries-v1.1/RULE.md`, which is v1's rule with v1.1's one amendment), every clause as written there, read on the inputs below, with the amendments below. Every term of v1's and v1.1's rules keeps its meaning here.

## What is read

- The page's route store as served now: `index.json` and its 256 shards, store_version **54416ff5785b**.
- The page's row-strikes record, `reader/data/row-strikes-v1.json`, as read from fireandhail.com on 20 November 2026 AD.
- The same catalog (v86), the same card sidecar, the same providers' files and the same catalog builder's code as v1 and v1.1, each named in the receipt by its sha256.
- The ledger v1.1, for the comparison.
- The landing list behind relay v188 (`moses-fold-strike-landing-v1/landing-v1/landing-fold-strike-v1.jsonl`) and the words back behind relay v187 (`moses-made-spaces-v2/words-back-v1/words-back-final-v1.jsonl`), for two checks only.

## The amendments

1. **Keyed to the store as served now.** The ledger has one line per key of store 54416ff5785b that holds a row of the fifteen sources, in the store's order, each with that key's rows of the fifteen sources in the key's order, as v1's clause "The line" says. It holds only rows the store serves.

2. **A retexted row is followed to the words it had.** To v1's road, step 3 ("By the record of strikes"): the record also names a row's old words. Where steps 1 and 2 find none, a `retext` action whose key, rank and m_id are the row's, and whose new words (`to_text`) are the row's text, names the words the row had before (the action's `route`). Steps 1 and 2 are made again in the row's own cell with those words in place of the row's text. So a retexted row reaches the catalog rows its old words reached, and its line carries the hash of its new words. Re-keys and restores are followed as v1 says.

3. **A landed row is read like every row.** No clause changes for it: a landed row's entries come from its own catalog cards, reached by the road of v1 (by its text, then its definition, then the record), as every row's do. Checked beside: for every landed row of the fifteen sources, the catalog row its landing list line names (its `evidence_support_id`, in the row's own cell) must be among the catalog rows its road reaches. A landed row whose source is not one of the fifteen has no line, as no row of its source has.

4. **The rows that went are carried, marked.** Every row of v1.1 that the record says a round since took off the store (a strike or a withholding) is written in `struck-lines-v1.2.jsonl`: v1.1's row whole, its key, and the action, list and round that took it. Those lines are not in the ledger, because no served row stands for them. A round "since" is a round of the record that ran after 12 November 2026 AD, the day v1.1's store was read. The builder holds that these are exactly the rounds the page's own index names as followed since v1.1 (`row_entries.followed.rounds_since`).

5. **The hold to v1.1 is replaced by a full comparison.** v1.1's builder held itself to v1 line by line. v1.2 cannot, because the store moved. Instead every row of v1.1 is followed through the rounds since, in their order, by its key, rank, m_id and hash: a strike or withholding takes it off; a re-key moves it to the action's `to_key` and `to_rank`; a retext gives it the hash of `to_text`; a landing adds a row v1.1 never had. Then every served row of the fifteen sources must be met by exactly one row so followed or landed, and every row so followed must be met by a served row. A row neither explains stops the build. The comparison list (`comparison-v1.1-v1.2.tsv`) gives every row that is not kept as it was:
   - **kept, line differs**: the same key, rank, m_id and hash, but another line (none is expected; any one is listed);
   - **re-keyed**: its key and rank in v1.1 and now;
   - **retexted**: its hash in v1.1 and now;
   - **landed**: a row v1.1 never had;
   - **struck** or **withheld**: the round and list that took it.
   For a re-keyed or retexted row it also says whether its entries and numbers are v1.1's. The rows kept as they were are counted, not listed.

6. **A small letter.** v1's clause "Numbers" said: «A letter after the digits (STEP's capital letters, MACULA's small ones) stays in the entry and is not in the number». That was wrong about whose small letters they are. Reworded: a letter after the digits stays in the entry and is not in the number, whatever its case. STEP writes its letters as capitals, but STEP's own data also carries a small letter at a few places (TAHOT at 22 places, TBESH in 10 entries). MACULA gives letters of its own, word by word. STEP's and MACULA's letters are two separate schemes and are not compared here. No row changes by this rewording.

Nothing else in v1's and v1.1's rules is changed. The checks that the replays give back the catalog, the evidence road of store v2.2, the classes and the line's shape stay as they are.

## The facts slot

The page does not read the ledger at a place. It reads slot 10 of each served row, the facts, which its tool writes from the ledger. As the page's own index says it (`index.json`, `row_entries.what`):

- `n`: the row's numbers (the ledger's slot 6), where it has any;
- `t`: for a row of TAHOT (M4) or TBESH (M19), its entries that carry STEP's letter, each written `H`, the digits with their leading zeros taken off, and the letter, distinct, in the order of the entries, where there are any;
- `b`: for a row of BDB via Open Scriptures (M5), its entries, where it has any;
- and a row whose same-source twin under a key ending in a maqaf was struck carries, after its own, the entries of that twin's line that it lacked. The page names each such pair (`row_entries.followed.entries_given_to_a_twin`). The twin's line is read from `struck-lines-v1.2.jsonl`. The builder also counts the twins by a plain reading of the clause (the same source and the same text, under the key without its maqaf) and gives that count beside the page's.

Other facts (`name`, `opens`, `collocations`, `picked_at`) are not touched here.

The facts list (`facts-slot-v1.2.tsv`), in the shape of v190's: every served row whose `n`, `t` or `b` under v1.2 differ from slot 10 as served now, with its key, rank, m_id, route text, the facts now, the facts under v1.2 (the same object with `n`, `t` and `b` taken from v1.2), what changes, and how the row came (kept, landed, re-keyed or retexted). A `t` or `b` of the same entries in another order differs too and is marked "order only". The builder holds that on every row v1.2 keeps as v1.1 had it, the facts now are exactly what this derivation gives, so the list carries v1.2's change and nothing else. The landed rows are counted by source: listed, given no facts by their own line (their source names no number, or the road does not reach them), and not of the fifteen sources.

## The gate's flips

The serving lane asked for the gate's flips over all served places, both ways. Terms:

- **a served place**: a word of the thirty-nine books, as the lattice v12 positions files hold it (`c0` is `ON`);
- **its key**: the key of the lattice's form reading of the word (the `megacompspan` part read as `form`, else the first part), as v1.1's places read the page's key;
- **its tag**: the tag of the word's first core piece in the lattice; a place with no tag is not judged by the gate.

**The gate, as wired**, as v1.1 wrote it: N is `H` and the digits of the place's tag. A row with numbers, none of them N, is withheld by its number. Otherwise, a row of TAHOT or TBESH that carries letters (`t`), at a place whose tag carries a letter, is withheld by its letter when none of its letters is the place's tag. Otherwise it is kept. The gate reads `n` and `t` only.

For every row of the facts list and every served place under its key: the gate with the facts now, and with the facts under v1.2. A **flip** is a pair of a place and a row where the two differ: **kept now, withheld under v1.2**, or **withheld now, kept under v1.2**. The list `gate-flips-v1.2.tsv` gives every row with a flip, both counts, and the reasons; the receipt gives the totals both ways, the distinct places, and the rows with the most places.

**Amended after the first run, before any ship.** The page also judges the rows of a word's pieces. So the flips are counted a second way, **with the pieces**: at the same places, each piece of the word (the lattice's `pieces`) whose letters (`consonants`) are another key than the word's is judged too, under that key, against that piece's own tag. The first run counted the word's key alone, and its count of v1.1's own list fell short of the serving lane's («Lo-» at 3,236 places, not 4,976). Counted with the pieces, the three rows the serving lane named come out exactly as it counted them: «Lo-» 4,976, «O sons of» 1,490, «<if>?» 711. So the count with the pieces is the page's, and it is the one given first; the count at the word's key alone stays beside it. `gate-flips-v1.2.tsv` carries both, and the receipt gives both.

Counted beside, the same way, for the serving lane's figure of v1.1 (12,257 rows at 11,895 places, «Lo-» at 4,976): the flips of v1.1's own facts list (`facts-slot-v1.1.tsv`), the facts of v1 against the facts of v1.1, over the places served now, both ways. Rows of that list the store no longer serves are counted apart.

## The list behind «246 of 270»

Relay v190 said «Under the page's key by exact text, v1.1 mends 246 of 270», and no file listed those places. A third builder lists them: v1.1's places (`build-facts-and-places-v1.1.mjs`, "The places"), read again on the same inputs (store 4d1357b26ca5, word numbering v1, lattice v12, the four TAHOT files, v1 and v1.1 of the ledger), under the page's key, by exact text. It writes every place where every served TAHOT row printing the place's reading is withheld now, with the gate now and under v1.1, and whether it is mended. It must give 270 places and 246 mended, and under TAHOT's own key 257 and 254, as v190 said; otherwise nothing is written.

## The second road

A separate verify script, not importing any builder. It reads the catalog and the providers' files by other handles than the builder (v1's second count, written again), joins every served row of the fifteen sources to the catalog by sorted keys, with the same steps 1 to 3 and the retext clause, and checks each ledger line's road, entries and numbers (for TAHOT and MACULA, that the cited place's tags stand among the row's entries and its numbers are its entries' digits). It then makes each list again by another road and holds it line for line against the builder's:

- the comparison, walked backward: every served row not in v1.1 must be made by an action since (a re-key or a retext names its row of v1.1, a landing adds it), and every row of v1.1 not served must be taken by an action since;
- the facts list, from the ledger by its own derivation;
- the flips, counted from a tally of the places by what the gate judges at each (the keys and tags), not place by place;
- the 246 of 270: every listed place checked against store 4d1357b26ca5 and both ledgers, and the counts.

It writes `verify-receipt-v1.2.json` and exits non-zero unless every list agrees.

## The checks (each one stops the build)

1. The catalog checks of v1.1: every TAHOT and MACULA catalog row given back, the evidence road of store v2.2 met, no catalog row whose entry is not read.
2. Every served row of the fifteen sources is met by its line and every line by its row.
3. The comparison explains every row of v1.1 and every row of v1.2.
4. Every landed row of the fifteen sources reaches the catalog row its landing list names.
5. The facts now are what v1.2 gives on every row kept as it was.
6. The list behind «246 of 270» gives v190's four figures.
7. No file written holds a machine path or the home folder's name.
8. The second count agrees on every list.
9. Two runs give the same bytes.

## Not here

The store is not changed. The names gate's mark (`name`) for the landed rows comes from the names ledger, not from this one. Rows of other sources, other facts and the other ledgers are not touched.
