# From the website lane · 2026-08-28 · titles-as-C0: the measured baseline, and one defect found on the way

For Oholiab's fold-in, following the architectural correction the owner
relayed from Bezalel (a title is not Y metadata attached to C0 — it IS C0;
Y's payload shrinks to the optional commonly_force_read_as overlay, keyed
to the Hebrew C0, null lawful). The website lane's side of that correction
costs nothing: the reader already gives any C0 word the full HUD, and the
claim-label law already governs the overlay's display. What follows is the
measured state of the corpus, so the fold-in starts from numbers.

## How much of the library's titling is ALREADY C0

Measured against the verified rebuilt body (4,646/4,646 vs the July
manifest), by extracting every work's opening words
(global_work_word_index ≤ 14) and comparing them to the bridge's work ids:

- **Ben-Yehuda shelf (pby), 2,933 works: 2,919 (99.5%) of the ids are the
  work's own opening words, whole and in order** — matched token-for-token
  against normalized_hebrew, byte-exact after K folding. These titles need
  no new C0 rows at all: the title IS rows 1..k of the work, and a Y node
  for them is pointers plus the optional English overlay. The trailing
  number on each id matches no word and is catalog residue, excluded by
  the match rather than by anyone's judgment.
- 11 more matched everything my 14-word capture window held (their ids run
  20–23 Hebrew tokens — the long editorial ציונים essays); a wider window
  would almost certainly close them.
- **11 works' first unit is already `title-N`** — title rows as C0 exist
  in the chain today; the mechanism is not new, only not yet uniform.
- 258 works carry heading-shaped units somewhere inside (10,155 shaar,
  5,750 introduction, 105 title, plus prefaces and petichot).
- The remainder — the ~1,100 Latin-id works (tanakh, mishnah, tosefta,
  talmud …) — are the true fold-in: their Hebrew titles (ערכין and kin)
  are editorial, not incipit, and need either new C0 rows or pointers the
  corpus side mints. No transliteration can ever stand in: the store keys
  real Hebrew only.

## One defect, found by the measurement — 6 rows, exact ids

Three consecutive Brenner essays open with the letter ש missing from their
first word: the text carries מ + דה where the title (and the fourth,
intact essay of the same series, c0 176434578) reads משדה — "from the
field of literature." Not a split artifact: מ+דה cannot recompose to משדה.

- pby/brenner/…-17857 · c0 180908581–180908582 (מ · דה)
- pby/brenner/…-17858 · c0 180909265–180909266 (מ · דה)
- pby/brenner/…-17859 · c0 180909939–180909940 (מ · דה)

Same series, consecutive ids — reads as one systematic capture defect at
ingestion for those three works. Flagged for whichever lane owns the
source stream; the website lane's gates would refuse nothing here (the
rows are lawful text), so this is a correctness find, not a hold.

Openings data (all 3,986 works) sits beside the body as
work-openings.json; the corpus lane is welcome to it as verification
material for the fold-in.

— the website lane
