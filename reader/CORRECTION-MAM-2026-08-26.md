# Correction on the record · 2026-08-26 · what this site once did to MAM's text

This is a correction record, kept under the same law as every ruling here:
a dispute or an error is recorded with its date and its basis, never
silently resolved. It concerns the one error class this project treats as
gravest — not being wrong *about* the text, but misrepresenting the text
itself while its source's name stood near it.

## The source

The Hebrew scripture this site served came from **Miqra According to the
Masorah (MAM)** via Hebrew Wikisource, under **CC BY-SA 4.0** — a license
whose obligations include attribution and an indication of changes. MAM is
a living edition with editors who make deliberate, careful decisions about
exactly the features this site damaged. This record is, among other
things, the public indication-of-changes the license asks for, made
retroactively and plainly.

## What was displayed, and when

Until the withdrawal of 2026-08-22, this site served Hebrew works whose
ingest had swallowed MAM's editorial apparatus as if it were scripture:

- **Ketiv/qere carriers printed as raw markup.** MAM writes each pair with
  care — the ketiv unpointed in parentheses, the qere pointed in
  brackets. The ingest carried MAM's own `mam-kq-q` / `mam-kq-k` markup
  through as visible text, split across word blocks, glossed as if the
  fragments were words.
- **Apparatus printed as text.** Parashah marks, setuma markers, and
  MAM's marginal notes (readings of Sephardic, Ashkenazic and Yemenite
  books) printed inline as if the source wrote them as verse text.
- **Words split mid-form** where markup boundaries cut them.

The full census — 616 occurrences by c0 id across the affected works —
is in `data/corpus-defect-manifest-2026-08-22.json`, and the discovery
record is `CORPUS-DEFECT-2026-08-22-markup-in-the-text.md`. None of this
was MAM's error. It was this pipeline's, and MAM's name was on the page
while it stood.

## What stands now

- The affected works were **withdrawn** on 2026-08-22. Their addresses
  say so publicly and serve nothing.
- The pair law was declared and is guarded:
  `kq-rule-v1-both-halves-as-written` — both halves of every pair
  printed exactly as MAM writes them, brackets, order and all; a
  selector changes what a card is about and never what the line says
  (`PRINT_EXACT_MAM_CARRIER__SELECTORS_CHANGE_DEFINITIONAL_FOCUS_ONLY`).
- The text gate (`tools/check-corpus-clean-v1.mjs`) classifies raw
  markup, apparatus-as-text and mid-word splits, and fails any build
  that carries one. The presentation check
  (`tools/check-kq-presentation-v1.mjs`) renders every source-marked
  site in the real reader and holds each carrier byte-identical to
  MAM's own text before anything may serve.
- **Nothing MAM-derived serves today**, and nothing will until a
  re-ingested corpus passes these gates whole.

## Why this record exists

An error that is caught, corrected and gated cannot recur, but it
happened, and the source it touched is maintained by people. This page
is the site saying so where they could read it: the text displayed then
was not MAM as MAM writes it; the fault was ours; the law that makes it
unrepeatable is named above and runs on every build.
