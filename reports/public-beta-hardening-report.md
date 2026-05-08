# Public Beta Hardening Report

Date: 2026-05-08

## Scope

- Flagship `orot/index.html` was not modified.
- Non-Orot work pages received generic wrapping/layout hardening so long Hebrew, source links, TOC labels, and lexical rows do not force horizontal overflow.
- A plain About / License page was added at `about/index.html`.

## About / License Page

The public page now states:

- Hebrew source texts retain their original source/version licenses.
- Lexical rows retain per-source licensing.
- No copyrighted English translations are imported into the source layer.
- The site is a Hebrew source-text workbench, not an official edition or translation publication.

## Link Check

- HTML files checked: 62
- Local links checked: 126
- Fragment anchors checked: 154,821
- Broken local links/fragments: 0

## Large File Check

Largest files found:

- `data/lexical/.cache/kaikki.org-dictionary-Hebrew.jsonl` — 46.45 MB
- `data/lexical/source-layers/openscriptures-cc-by-4.json` — 32.24 MB
- `midrash/midrash-lekach-tov/index.html` — 21.24 MB

No files at or above 50 MB were found.

## Validation

- `scripts\validate_sources.ps1`: passed; 36,598 source units checked.
- `scripts\validate_lexical_dom.ps1`: passed; Orot and school HUD canaries passed.
- Generated JS syntax check: passed; 59 HTML scripts checked.
- `git diff --check`: passed.

## Remaining Notes

- The Kaikki cache is below the 50 MB warning threshold but close enough that future enrichment should continue using chunking/externalization rather than embedding larger payloads.
- `reports/rivlin-poems-license-inventory.md` remains untracked intentionally.
