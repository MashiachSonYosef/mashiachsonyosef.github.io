# The fold, measured (v142 item 4; Moses's take of 7 November, items 3 and 5) · 7 November 2026

> **Correction, later on 7 November.** The lead moves below use the lattice's year per source, read off its single-source cards. Moses's source table (v150) shows those are harvest and revision dates on 112 of 146 sources, not the year the English was written; and Davidson's 1855 is a library catalog date, not printed in the copy (the owner's call). So the figures for leads that move to an older witness, and the count that moves to Davidson, stand on unbacked years. The counts of witnesses the store dropped do not depend on years and stand.

The served store keeps one row per key and text with one M (the corpus lane's compact packages: one row per exact K+R, `primary_m_id`), so a wording two dictionaries share stands under one of them. What the fold kept and what it lost, measured on the 39 books' lattice v12 cards (text, sources, earliest_year; corpus-lane-builds, moses-ledgers/lattice-v12) against the served store 3d8c4ef86c01 read by the page's own reader (tools/gloss-store-v1.mjs readingPool: readings under the ledgers, carriers, oldest year). Scripts beside this file; the figures in measure-fold-v2.json.

## What the row's year slot holds (census-by-source-v1.json)

Every row carries a year in slot [4]: `primary_source_year_or_no_source_year` from the package. 290,581 rows carry a year, 362,304 none. **6,390 rows carry another source's year than their own**: ConceptNet rows at 1890 (493), 1906 (264), 1903 (148: Jastrow's year, a source the store never held as rows), 2022, 2023; MACULA rows at 1890 (184); SDBH rows at 1890 (65). The fold kept the oldest witness's YEAR in the row and the primary's NAME on it. So under "oldest first" the reading already sorts by its oldest witness, but the pill credits the primary (the page's chip says "wording 1890 · edition 2019": the wording year is a dropped witness's).

The store's own source table knows a year for 11 of 146 sources; 135 carry S_NO_SOURCE_YEAR, Davidson (M97, 85 rows on 44 keys) among them, though its label says 1855 and the lattice gives it 1855.

## The fold against the lattice's cards

| | |
|---|---|
| lattice cards over the 39 books (per book) | 2,944,515 on 42,099 distinct keys |
| cards whose text is a reading of the store's pool for the key | 2,158,870 (785,645 are texts the pool does not hold: cards built over the corpus lane's rows before the strikes, or cut otherwise) |
| cards with a witness the store does not carry for the text | 485,694 · 1,357,792 witnesses |
| cards with an OLDER witness the store dropped (its year older than the pool's) | 130,669 |
| the oldest-first lead moves under the fold alone | 1,616 keys (11,946 book-and-key pairs; 61,282 words of the 39 books read at those keys) |
| …under the fold and the lattice's years for the carriers the store knows no year for | 2,269 keys (13,993 pairs; 65,179 words) |
| cards Davidson witnesses and the store does not carry under M97 | 594 (nearly every lead that moves under the fold moves to a Davidson reading at 1855: אבד «perish» → «to stray», אדני «lord» → «the Lord», אין «nothing» → «not», איש «person» → «a husband») |

## The two roads

- **Road A, the next store keeps one row per key, text and source.** Over the Bible's keys the fold dropped at most 136,237 (key, text, source) rows (an upper bound by source label; the store has 652,885 rows); the page then credits the oldest witness by name and a switch takes exactly that source's row away. The commentary zones and the Tikkunei Zohar, which have no lattice, are covered too.
- **Road B, the sidecar carries each card's dropped witnesses and earliest year.** 5.97 MB gzipped over the 39 sidecars (29 MB today), the Bible books only.

Either road moves the line as above, since an older witness moves a reading up. Davidson's year alone (M97's 85 rows at 1855) is a store change on the corpus lane's side; the leads that move to Davidson above are the fold's, where Davidson witnessed a text another source's row carries.

## Not measured here

The lattice's own year per source (lattice_years in the JSON) is read off its single-source cards; the corpus lane's table is the authority.
