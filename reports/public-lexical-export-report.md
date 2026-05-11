# Public Lexical Export Report

Generated: 2026-05-11T15:31:00.214Z

## Scope

This export contains claim-shaped lexical HUD rows for hardened public workbench pages. It is not a translation export and does not include prose translations.

## Exported Row Counts by Work

| Work | Rows |
| --- | ---: |
| orot | 28253 |
| aggadat-bereshit | 9343 |

## Exported Row Counts by License Bucket

| License bucket | Rows | File |
| --- | ---: | --- |
| Project-authored / CC0 | 430 | data/public-lexical/by-license/project-cc0.jsonl |
| Wikidata CC0 | 7783 | data/public-lexical/by-license/wikidata-cc0.jsonl |
| OpenScriptures CC BY 4.0 | 28358 | data/public-lexical/by-license/openscriptures-cc-by-4.jsonl |
| Kaikki/Wiktionary CC BY-SA/GFDL | 964 | data/public-lexical/by-license/kaikki-wiktionary-cc-by-sa-gfdl.jsonl |

## Skipped / Diagnostic Counts

| Reason | Count |
| --- | ---: |
| missing work files | 0 |
| unmatched | 8278 |
| no lexicon entry | 0 |
| no renderings | 19121 |
| missing source license | 0 |
| exported rows not placed in a by-license file | 61 |

Rows are skipped from the public JSONL export when they have no renderings or when a rendered claim cannot be tied to source/license metadata. Rows with project lexical-rule license labels that are not explicitly CC0 remain in all-claims/by-work output but are not placed in the CC0 by-license file.

## User-Facing Prompt

The AI-assisted workflow prompt is at `prompts/use-lexical-workbench.md`.

## Public Library Navigation

The public library now keeps Talmud / Commentary out of the normal visible category list. Those works remain direct-linkable through an internal archive shelf labeled `Internal archive / not public-featured yet`.

## Integrity Confirmations

- Hebrew source text was not changed by this export task.
- Overlay/export namespaces were not changed by this export task.
- Lexical source/license metadata remains per row.
- Third-party rows were not relabeled as CC0.
- Orot meanings were not changed.
