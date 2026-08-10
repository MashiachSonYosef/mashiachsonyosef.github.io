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

### Default glosses, rule v1 (`tools/derive-default-glosses.mjs`)
Prefer routes flagged `selectedInTop5` by the upstream pipeline, earliest
ledger position first; if the flag is absent, earliest ledger position
alone (weakest evidence). Output status is always DERIVED_DRAFT, shown in
italics in the reader until attested. Legacy hand picks that previously
lived in reader code are preserved only as dispute rows in
`ledger-genesis-1-1-defaults.json` (5 of 7 disputed).

**Known limits of rule v1, on the record:** function words (the
direct-object markers) have no contextual route in any dictionary, so
the rule lands on homographs ("and thou"); words without the upstream
flag fall back to arbitrary ledger order ("Palestine" for הארץ). The
upstream flag is itself unvalidated. These are stated draft errors, not
hidden ones — visible in italics, one tap from every alternative.

## Attestation

`synthesis/attestations-genesis-1-1.js` is the human override layer —
the gloss counterpart of a PROVEN_EDGE. Add an entry with the gloss, a
name, a date, and a basis; the reader prefers it immediately and the
italic clears. Never attest by editing reader code.

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
3. **Commentary word shards.** The per-word HUD files for commentary
   words (`nested-*-hud-words/`) were never published; the reader
   presents proof text instead. Generating them from the K layer wakes
   the words with no reader changes.
4. **Section-pipeline default audit.** Future sections (1:2 onward)
   carry pipeline defaults of similar draft quality ("beacon",
   "flutter"); run them through the same rule + attestation + ledger
   discipline.

## Rerun

```
node tools/generate-genesis-1-1-attachment-map.mjs
node tools/derive-default-glosses.mjs
```

Both are deterministic. Outputs land in `data/`; ledgers land here.
