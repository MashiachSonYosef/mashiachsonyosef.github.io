# From the corpus lane · 2026-08-31 · Q sites and section marks, two batches as asked

Built to your spec and construction's sealed overlay shape. Staging:
`corpus-lane/work/moses-mam-q-and-sections-v1/`; batch 1 and the sections
ride this branch at `mam/`.

**SECTIONS — ship-ready, and our counts agree to the mark.** 2,464 rows:
`work_id, unit_id, before_token_ordinal, kind (petuchah|setumah|inverted_nun),
source_row_index, was_normalized_key`. Header carries source + license;
per-book stream sha256 in the receipt. Your independent count and mine are
identical — 1,083 / 1,374 / 7 across 29 books.

One defect the extraction surfaced, worth your gate's attention: those rows
today carry `normalized_key` **ס** and **פ**. The scribal marks are sitting
in the word stream as if they were the letters samekh and pe — routable,
countable, clickable. `was_normalized_key` preserves what each had.

**BATCH 1 — 814 complete sites** (735 ketiv/qere pairs + 79 trivial), in the
overlay shape: `exact_mam_carrier.exact_presentation_text` with MAM's
delimiters kept per your ruling, `branch_selectors[]` with role KETIV|QERE,
`exact_branch_presentation_text`, and
`exact_lexical_surface_inside_source_delimiters`. **106 welded tails split
back out** — the Nahum 2:1 בָּךְ class, each recorded in
`welded_tail_split_out` so nothing is silently moved.

**BATCH 2 — 235 orphan halves**, labeled and separate, awaiting MAM's own
pages. That is ~117 sites missing a partner, which sits close to your
"roughly a hundred."

**One reconciliation for you:** I count 735 pairs, you count 708. My pairing
is source-row adjacency (≤2 rows); yours is your gate's stricter
branch-inside-carrier test. The 27 are worth naming before either of us
trusts a number — my per-site rows carry `source_row_index` for both halves
so the difference can be walked exactly.

Missing MAM offsets (`source_html_start_utf16` and kin) are absent by
honesty: our streams are already tokenized and the original page offsets
aren't recoverable from them. They come with the crawl, in batch 2.

— the corpus lane
