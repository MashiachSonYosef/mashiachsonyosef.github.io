# RULE — row entries v1.1: TAHOT's lines with the Hebrew verse beside the English one

14 November 2026 AD. Corpus lane (Moses). Written before the builders, so a second count can be made from these words alone.

## Why

The serving lane's letter of 13 November (section 3.5) found places where the gate withholds TAHOT's own reading at a place where TAHOT itself reads it. A seat traced the largest part of it to one gap in the row entries ledger v1. TAHOT writes some lines with the Hebrew verse beside the English one, as `Dan.4.16(4.13)#09=L`. The catalog builder's reader does not read such a line, and v1 replayed that reader, so v1 never counted the tags at those places. A served TAHOT row stands for every place where TAHOT reads its letters with its words. At these places its entries were gathered without the place, so the gate found the place's entry missing from the row.

## What v1.1 is

v1's rule (`row-entries-v1/RULE.md`), every clause as written there, read on the same input bytes as v1, with the one amendment below. Every term of v1's rule keeps its meaning here.

## The amendment

To v1's clause "The entry each catalog row names", M4:

- **Amended (v1.1).** The TAHOT replay also reads every line the catalog builder's reader does not read because its reference writes the Hebrew verse beside the English one (`Book.chapter.verse(chapter.verse)#NN=`). The Hebrew verse is set aside, as the default picks ledger sets it aside: the bracket and what it holds are taken out of the reference, and the line is given to the same reader (`parseTahotRecord`) and the same cutter (`tahotAlignedSpans`). Its spans join the spans of the same key, `d` and `r`, and their tags are counted as every other place's tags are. A line with no Hebrew to read gives nothing. Any other line the reader does not read gives nothing. The receipt counts each kind.
- A row's entries stay distinct, in the order first met, now over all the lines read, in file order.
- The check that the replay gives back the catalog stays on the reader's own lines. A catalog row's first place is the first place among the lines the reader reads, so a row's first cited place stays the same, and the check stays exact: every catalog row of TAHOT must be given back at the place its citation names. The receipt counts and lists every catalog row whose first place would move if the new lines were counted for it, that is, where a line with the Hebrew verse beside comes first in file order.

Nothing else in v1's rule is changed. MACULA and the other fourteen sources are read exactly as in v1.

## What changes in the ledger

The ledger v1.1 has the same keys, in the same order, with the same rows, ranks, sources, hashes and roads as v1. A row changes only where the spans of its catalog rows stand on a line with the Hebrew verse beside. The builder takes v1's ledger as an input and holds this, line by line: only TAHOT rows may differ; a changed row keeps every v1 entry with at least its v1 places and every v1 number; every other line is byte for byte v1's.

Terms for a changed row:

- **gains places**: one of its entries now counts more places than in v1;
- **gains a tag**: it holds a tag that is not among its v1 entries;
- **gains a number**: it holds a number that is not among its v1 numbers.

The changed rows list (`changed-rows-v1.1.tsv`) gives every changed row: key, rank, m_id, hash, road, the places gained, each tag gained with its places, each number gained, and the places (TAHOT's reference, with the Hebrew verse) where a gained tag stands.

## The facts slot

The page does not read the ledger at a place. It reads slot 10 of each served row, the facts, which the serving lane wrote from the ledger (`index.json`, `row_entries`): `n`, the row's numbers (the ledger's slot 6); `t`, for a row of TAHOT or TBESH, its entries that carry STEP's letter, each written `H`, the digits with their leading zeros taken off, and the letter, distinct, in the order of the entries; no `t` where there is none. Other facts (`b`, `name`, `opens`) are not touched here.

So v1.1 changes nothing on the page until the facts slot is written again from it. The second builder writes the facts slot replacement list (`facts-slot-v1.1.tsv`): every served row whose `n` or `t` under v1.1 differs from its facts now, with its key, rank, m_id, route text, its facts now and its facts under v1.1 (the same object with `n` and `t` taken from v1.1). **Amended after the first run, before any ship.** A `t` that holds the same letters in another order differs too, because the entries' order is first met over all the lines read; such a row is listed and marked "t order only". The first run found such rows, so this clause was added then. The gate does not read the order. It is read against the served store copy of store_version 4d1357b26ca5. A row of the list must be found there at its key and rank, with its m_id and its text's hash. If not, nothing is written. The builder also holds that the facts now are exactly what v1 gives by the derivation above, on every TAHOT row of the store, so the list carries v1.1's change and nothing else.

## The places

Terms:

- **a place**: a word of the thirty-nine books, as word numbering v1 numbers it, with the TAHOT lines tied to it;
- **its reading**: a tied line's translation column, cleaned as the catalog builder cleans text (`cleanText`), the whole word. A line with the Hebrew verse beside is read by its columns all the same;
- **its key**: TAHOT's own key for the whole word, the letters of the tied line's Hebrew word folded as the catalog builder folds them (`placementFold(tahotSurface(...))`). The page's key, the lattice v12 form key, is counted beside it;
- **its tag**: the tag of the word's first core piece in the lattice v12 positions files, as the page reads it; where the lattice has none, TAHOT's own tag of the core piece (in braces).

**Matching is by exact text only.** A served TAHOT row matches a place when it stands under the place's key and its route text is the place's reading byte for byte. Letter case is not set aside: the store keeps «gad» and «Gad» apart, as two texts, and none of TAHOT's cards stands on a route spelled in another case.

**The gate, as wired** (rulings 1 and 6 of 13 November, as the serving lane wired them): N is `H` and the digits of the place's tag. A row with numbers, none of them N, is withheld by its number. Otherwise, a row of TAHOT or TBESH that carries letters (`t`), at a place whose tag carries a letter, is withheld by its letter when none of its letters is the place's tag, compared as `H`, digits without leading zeros, and letter. Otherwise it is kept.

- **withheld place**: a place where at least one served TAHOT row matches and every matching row is withheld;
- **mended**: withheld with the facts now, and kept with the facts under v1.1.

Counted beside, for the serving lane's own finding (which matched with letter case set aside, as the page did until 13 November): the withheld places with case set aside, under both keys, and the places both keys agree on.

## The landing list (held)

The places withheld with case set aside, under TAHOT's key, where no served TAHOT row prints the place's reading exactly. One line per key and reading: whether the catalog holds TAHOT's row with that exact reading (and its citation), the places and their tags, the served rows that print the reading exactly under another source, and the TAHOT row of another case the page matched. Each place is also marked when its line is one the catalog builder's reader does not read, and when the store's own card sidecar stood TAHOT's card for that route at a rank the struck ranks record names as struck with M8.

Every line is marked **held**. It lands only if the owner rules that the store keeps one row per key, words and source (the same question as v188's fold-strike landing). This list changes nothing.

**Amended after the first run, before any ship.** Counted beside it (these are counts for the letter, not clauses of the lists): in the served store copy, every pair of a key and a route text, how many rows each stands on, how many of the pairs on two or more rows are of two or more sources, how many hold a piece (cut flag 1), and how many hold a TAHOT row beside another source's row. And in the store's own card sidecar, every TAHOT card: whether its words are the route text it stands on, byte for byte, and where not, whether they are with letter case set aside.

## The second road

A separate verify script, not importing either builder. It reads the four TAHOT files by their columns, without the catalog builder's reader or cutter, and cuts each line with the Hebrew verse beside into spans by its own code. It joins each span straight to the served TAHOT rows of the 12 November store by key and text, without the catalog, and reads each row's v1 entries from v1's ledger. From that it recounts: the rows that gain places, the rows that gain a tag (each tag with its places), the rows that gain a number. It then reads every TAHOT line as a place of its own (not through the word numbering), takes the place's tag from TAHOT's own braces (not from the lattice), folds the key with its own code, and recounts the withheld places by exact text with the facts now and with the facts now joined to its own gained numbers and tags. Its receipt says `agree: true` only when the gained tags, the gained numbers, the facts list and the mended places are the builders' own, row for row and place for place.

**Amended after the first run, before any ship.** Twenty TAHOT rows reach the catalog through the record of strikes, because the store moved them to another key (v1's road, step 3). Joining by key and text alone, the second count first missed three of the changed rows for that reason (7,140 against the builder's 7,143). It now joins such a row at the key it stood under, read from the record of strikes (a re-key's `key`, a restore's former key), as v1's rule says, and reads that record as a fifth input. It still does not read the catalog.

## The checks (each one stops the build)

1. v1.1's catalog checks are v1's checks: every TAHOT row and every MACULA row of the catalog given back exactly, the evidence road of store v2.2 met, no catalog row whose entry is not read.
2. v1.1 equals v1 outside the changed TAHOT rows, byte for byte, and a changed row only gains.
3. The derivation of the facts holds on every TAHOT row of store 4d1357b26ca5.
4. Every row of the facts list is found at its key and rank with its m_id and text.
5. No file written holds a machine path or the home folder's name.
6. The second count agrees.
7. Two runs give the same bytes.

## Marked after the check

**Amended after the check, 14 November 2026 AD, before any ship.** A second seat checked this build. Two notes above were added after the first run but were not marked as amendments: the "t order only" clause of The facts slot and the "Counted beside it" paragraph of The landing list. They are marked now. No clause changed, so the ledger, the changed rows list, the facts list, the places and the landing list keep their bytes; the receipts change only where they name this file's bytes and sha256.

## Not here

The store is not changed. The landing list does not land. Rows of other sources, other facts and the other ledgers are not touched.
