# Public Lexical Export Report

Generated: 2026-05-11T15:31:00.214Z

## Scope

This export contains claim-shaped lexical HUD rows for hardened public workbench pages. It is not a translation export and does not include prose translations.

## Exported Row Counts by Work

| Work | Rows |
| --- | ---: |
| orot | 28255 |
| aggadat-bereshit | 9386 |

## Exported Row Counts by License Bucket

| License bucket | Rows | File |
| --- | ---: | --- |
| Project-authored / CC0 | 471 | data/public-lexical/by-license/project-cc0.jsonl |
| Wikidata CC0 | 7783 | data/public-lexical/by-license/wikidata-cc0.jsonl |
| OpenScriptures CC BY 4.0 | 28358 | data/public-lexical/by-license/openscriptures-cc-by-4.jsonl |
| Kaikki/Wiktionary CC BY-SA/GFDL | 966 | data/public-lexical/by-license/kaikki-wiktionary-cc-by-sa-gfdl.jsonl |
| Combined CC0-only CSV | 8254 | data/public-lexical/by-license/cc0-only.csv |

CSV mirrors are available beside the JSONL files. The CSV files are meant for spreadsheet import or AI-assisted workflows that prefer flat rows.

All claim rows are also available as `data/public-lexical/all-claims.csv`, with deterministic confidence columns attached.

## Token Status CSVs

| Work | Unique token rows | CSV |
| --- | ---: | --- |
| orot | 17307 | data/public-lexical/by-work/orot-token-status.csv |
| aggadat-bereshit | 8840 | data/public-lexical/by-work/aggadat-bereshit-token-status.csv |

Token-status CSVs include unresolved forms explicitly. An unresolved row means `No lexical entry yet`, not a hidden translation or inferred definition.

For AI-assisted workflows, use the `*-ai-options-min60.csv` files. They include every token row, but only expose `safe_export_rendering_options` when a public claim is at least 60% confident and is not Related/Caution.

| Work | Unique token rows | AI options CSV |
| --- | ---: | --- |
| orot | 17307 | data/public-lexical/by-work/orot-ai-options-min60.csv |
| aggadat-bereshit | 8840 | data/public-lexical/by-work/aggadat-bereshit-ai-options-min60.csv |

## Skipped / Diagnostic Counts

| Reason | Count |
| --- | ---: |
| missing work files | 0 |
| unmatched | 8252 |
| no lexicon entry | 0 |
| no renderings | 19118 |
| missing source license | 0 |
| exported rows not placed in a by-license file | 63 |

Rows are skipped from the public JSONL export when they have no renderings or when a rendered claim cannot be tied to source/license metadata. Rows with project lexical-rule license labels that are not explicitly CC0 remain in all-claims/by-work output but are not placed in the CC0 by-license file.

## Sitewide Compact Claim Index

| File | Rows / terms | Purpose |
| --- | ---: | --- |
| data/public-lexical/sitewide/claim-index.jsonl | 9120 | Deduplicated claim-shaped lexical rows across all imported works |
| data/public-lexical/sitewide/claim-index.csv | 9120 | CSV mirror of the compact claim index |
| data/public-lexical/sitewide/normalized-lookup.json | 19235 | Normalized Hebrew form to claim ID lookup |
| data/public-lexical/sitewide/work-summary.jsonl | 363 | Per-work compact-export coverage summary |
| data/public-lexical/sitewide/work-summary.csv | 363 | CSV mirror of per-work compact-export coverage summary |
| data/public-lexical/sitewide/work-downloads.csv | 363 | Per-work download index for lexical manifests, token indexes, and public export files |

The compact sitewide files are intended for AI/tool import. They preserve source/license metadata per claim and avoid repeating the same source-backed lexical row for every work-token occurrence.

### Sitewide Compact Diagnostics

| Item | Count |
| --- | ---: |
| manifests scanned | 363 |
| chunks scanned | 1935 |
| candidate rows without renderings | 396013 |
| candidate rows without source/license | 0 |

## User-Facing Prompt

The AI-assisted workflow prompt is at `prompts/use-lexical-workbench.md`.

## Public Library Navigation

The root page now opens directly as the Full Library instead of a splash/featured shelf. Lexical export downloads are linked from the root page, library page, and About / License page.

The public library keeps Talmud / Commentary out of the normal visible category list. Those works remain direct-linkable through an internal archive shelf labeled `Internal archive / not public-featured yet`.

## Integrity Confirmations

- Hebrew source text was not changed by this export task.
- Overlay/export namespaces were not changed by this export task.
- Lexical source/license metadata remains per row.
- Third-party rows were not relabeled as CC0.
- Orot meanings were not changed.
