# The synthesis lane

The Tabernacle has three lanes of work, named after its builders.

**Bezalel's lane — A, the licensed Hebrew.** The source text itself:
editions, capture, per-section N license records. Every materialized
section carries its own record (1:1 is Wikisource Miqra, CC BY-SA 4.0,
attribution required; 1:2 is tanach.us Ta'amei Hamikra, Public Domain).

**Oholiab's lane — K, the licensed English.** The definitional layer:
normalized keys, dictionary routes, definitions and their M source
records (Jastrow 1903, BDB 1906, Strong's, Wiktionary/dbnary), each with
license posture and exact-entry pointers.

**The synthesis lane — this one.** Everything that binds the two without
hand work: rules, generators, ledgers, and validation. Its law:

1. **No picks live in code.** Every default the reader shows is either
   ATTESTED (a human assertion recorded in data with a name, a date, and
   a basis) or DERIVED (the output of a declared, rerunnable rule, marked
   as draft). Attested outranks derived. Disputes are recorded, never
   silently resolved.
2. **Rules are declared before their outputs are accepted.** A rule that
   gets tuned until its outputs look right is a hand pick wearing a lab
   coat.
3. **Known limits are written down.** A rule that cannot decide says so,
   instead of deciding badly in silence.

## Current rules

### Attachment map generation (`tools/generate-genesis-1-1-attachment-map.mjs`)
Matches each commentary segment's opening quotation (dibbur hamatchil)
against the verse's normalized word sequence; up to two non-quotation
lead words may be skipped. Word-matched segments become
VISUAL_SUGGESTION_ONLY claims; human-validated claims are carried
byte-for-byte; unmatched segments remain verse-level witnesses. Nothing
is promoted by machine.

### Commentary word shards, rule v1 — exact-form corpus link (`tools/generate-rashi-word-shards.mjs`)
Generates the 64 per-word HUD shards for Rashi on Genesis 1:1:1
(`data/nested-rashi-hud-words/`) from the repository's own licensed
lexical corpus (`data/lexical/`, main branch). Exact normalized-form
matching only — the work slice (rashi-on-genesis chunk lexicons) first,
the global source layers when the slice has nothing displayable. Corpus
order is preserved (its likely-contextual record leads), every M record
carries the corpus's license row, unresolvable licenses are skipped on
the ledger, and source years are never invented (all routes sit in the
lastuary tier until year evidence exists). 48 of 64 words wake; 16 hold
with their reason recorded. Ledger:
`synthesis/ledger-rashi-1-1-1-word-shards.json`.

**Known limits of shard rule v1, on the record:** no clitic stripping or
stemming, so forms the corpus left unmatched stay held; form-matched
homographs can lead a default (rule v2's own recorded limit); Strong's
renderings arrive comma-split, so fragments like "properly" surface as
routes; Ramban and Onkelos are absent from the lexical corpus entirely.
Upstream repairs belong to the K lane, not reader code.

### Default glosses, rule v2 — antiquity primacy (`tools/derive-default-glosses.mjs`)
**Rule attested by Kyle, 2026-08-10** — the first rule-level attestation
in the project. Sort a word's routes by the oldest source year attesting
them; sources after 1940, or without a recorded year, form the last tier
("lastuary"); ties break by ledger position. The pool is built exactly
the way the reader builds selectable pills, so the derived default
always matches a real route. The same ordering governs the pill row
(selected route first, then antiquity), the >10-pill filterable panel,
and the D card's source-record stack (oldest record first).

Output status remains DERIVED_DRAFT (italic) until per-word attestation.
Rule v1 (upstream_top5) is archived; its picks live in the ledger rows.

**Known limits of rule v2, on the record:** function words still land on
homographs ("you", "and thou") because no dictionary carries a
contextual route for the object-markers; and a word whose bundle lacks
pre-1903 links inherits its oldest source's first sense (הארץ →
Jastrow's "Palestine" — also a K-lane linking gap worth upstream
repair). Fix for both remains targum-alignment disambiguation.

## Overrides

`synthesis/attestations-genesis-1-1.js` is the project's backend
override layer. When a different default is wanted than the rule
derives, it is recorded there in data — unsigned, no justification
required. The rule is the public explanation; overrides are ordinary
backend choices, and the ledger keeps their history. What the lane never
permits is the old failure mode: a pick hiding in reader code.
Provenance (derived vs overridden) rides as backend data attributes and
audit fields only; the visible UI presents defaults plainly and does not
explain itself.

## Roadmap, in priority order

1. **Targum-alignment disambiguation.** Onkelos renders Genesis 1:1
   word-for-word (יָת for both markers, אַרְעָא for הארץ). Aligning the
   targum's words to the verse's words resolves exactly the cases rule
   v1 cannot: function words and homograph pollution. This upgrades
   derived defaults from ledger-order guesses to context-bearing picks.
2. **Suggestion promotion validator.** A tool that verifies each
   generated dibbur-hamatchil anchor (exact headword rendering against
   the verse's C0 spans) and promotes verified claims to PROVEN_EDGE
   with a recorded proof basis — correctness without verse-by-verse hand
   work.
3. **Commentary word shards — shipped for Rashi 1:1:1** (rule v1 above).
   Remaining: a declared clitic-stripping retry rule for the 16 held
   forms, and corpus coverage for Ramban and Onkelos (a K-lane
   acquisition, not a reader change).
4. **Section-pipeline default audit.** Future sections (1:2 onward)
   carry pipeline defaults of similar draft quality ("beacon",
   "flutter"); run them through the same rule + attestation + ledger
   discipline.

## Rerun

```
node tools/generate-genesis-1-1-attachment-map.mjs
node tools/derive-default-glosses.mjs
node tools/generate-rashi-word-shards.mjs   # needs tools/corpus-cache/ from main
node tools/test-word-shards.mjs             # local proof against :8321
```

All are deterministic. Outputs land in `data/`; ledgers land here.
