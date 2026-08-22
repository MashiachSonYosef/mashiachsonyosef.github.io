# The Tabernacle

A Hebrew reader on a sealed chain. Every reading printed under a word traces to
the record that carries it, and every record to the licence it was released
under. No English is forced: a word offers every reading its sources attest, one
at a time, and the reader chooses.

Live site: https://mashiachsonyosef.github.io/

## What is published

- **Genesis** — 1,533 sections, 17,805 words, with 612 commentary units from 81 works — 181 on the word it opens by quoting · 323 on the section, nothing places them closer · 108 named, with no text in the record
- **I Kings** — 817 sections, 11,368 words, with 817 commentary units from 1 work — 817 on the section by coordinate
- **Ruth** — 85 sections, 1,132 words, with 85 commentary units from 1 work — 85 on the section by coordinate
- **Aramaic Targum to Ruth** — 85 sections, 2,139 words, with 85 commentary units from 1 work — 85 on the section by coordinate
- **Targum Jonathan on I Kings** — 817 sections, 13,651 words, with 817 commentary units from 1 work — 817 on the section by coordinate

Commentary is not a separate book. It is carried by the book it comments on and
opens where it attaches — at the word, or across the whole section, depending on
what the chain records for it.

## What is in here

- `index.html` — the front door. Built by `tools/build-front-door-v1.mjs`; do not edit.
- `genesis-book-reader-v4/zone.html` — the reader. One page serves every book.
- `genesis-book-reader-v4/data/zones/` — the books and their commentary, as built zones.
- `genesis-book-reader-v4/data/route-store/` — the readings, keyed by exact form.
- `genesis-book-reader-v4/tools/` — every build step and every check.
- `genesis-book-reader-v4/PIPELINE-MANIFEST.md` — generated: every rule the code
  declares and which check guards it, and every published file and what builds it.

## Building and checking

```
./build.sh <mirror> <bridge.csv.gz> <serves> <YYYY-MM-DD>
tools/run-all-checks.sh
```

The build runs from sealed inputs and is re-runnable: the same inputs give the
same bytes. The checks run against the rendered page rather than the source, and
end by printing what they do not cover.

## Two lanes

The corpus lane acquires, verifies and seals the text, the definition records
and the identity ledgers. Nothing in this repository reaches past what that lane
has sealed. The synthesis lane — this repository — builds the reader from those
artifacts and may not add a character to them.

## Licensing

There is no single licence. Every work carries its own, computed from its own
records and named on the page it is read from and in anything exported from it.
Nothing inherits a licence from the book it sits in.

Served from the `gh-pages` branch.
