# Orot HUD Live QC Report

Generated: 2026-04-30T13:53:29.099Z

## Scope

- Pass type: report-only live QC after the Orot technical-term layer
- New lexical entries added: no
- New source imports: no
- HUD behavior changed: no
- Hebrew source, anchors, overlays, and exports changed: no

## Page And Data Size

| File / area | Size |
|---|---:|
| `orot/index.html` | 2,551,465 bytes |
| largest Orot lexical chunk, `orot-014.json` | 1,808,247 bytes |
| `data/lexical/source-layers/openscriptures-cc-by-4.json` | 33,801,569 bytes |
| `data/lexical/source-layers/wikidata-cc0.json` | 6,375,014 bytes |
| `data/lexical/source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json` | 1,248,955 bytes |
| `data/lexical/source-layers/project-abbreviations.json` | 20,395 bytes |
| `data/lexical/source-layers/project-orot-technical-terms.json` | 19,872 bytes |
| `data/lexical/source-layers/project-overrides.json` | 2,714 bytes |

No file is at or above GitHub's 50 MB warning threshold.

## HUD Behavior Checks

- Clicked Hebrew form remains first in the HUD payload.
- Strict renderings remain short for checked canaries.
- Breakdown appears for reliable prefix/expression/technical-term parses and remains empty for fixed particles where no breakdown is needed.
- Other possible entries remain secondary/collapsed.
- Sources/licenses remain collapsed by default.
- Root/transliteration fields are not foregrounded in the visible HUD payload.

## License Separation

| Layer | Label |
|---|---|
| `project-overrides` | workspace / N/A - project-authored lexical rules |
| `project-abbreviations` | workspace / N/A - project-authored lexical rules |
| `project-orot-technical-terms` | workspace / project-authored / CC0 |
| `wikidata-cc0` | wikidata / CC0 |
| `openscriptures-cc-by-4` | openscriptures / CC BY 4.0 |
| `kaikki-wiktionary-cc-by-sa-gfdl` | kaikki / CC BY-SA 4.0 / GFDL |

No combined lexical payload is globally labeled CC0; each chunk carries source rows per rendered entry/source claim.

## Canary Results

| Token | Status | Context | Strict renderings | Source/license |
|---|---|---|---|---|
| לָאֻמָּה | matched | resolved_prefix_base | to the nation; for the nation; belonging to the nation; of the nation | Wikidata Lexeme / CC0 |
| בְּתוֹר | matched | resolved_fixed_expression | as; in the capacity of; in the role of | Workspace fixed-expression rule / N/A - project lexical rule |
| שֶׁל | matched | resolved_particle | of; belonging to | Workspace grammar rule / N/A - project lexical rule |
| ע״י | matched | resolved_abbreviation | by; through; by means of | Project-authored abbreviation table / N/A - project-authored lexical rule |
| האלהית | matched | resolved_project_technical_term | the divine; the godly | Project Orot technical term table / project-authored / CC0 |
| האידיאה | matched | resolved_project_technical_term | the idea | Project Orot technical term table / project-authored / CC0 |

## Remaining Unmatched Summary

- Total unique Orot surface forms: 17,307
- Matched: 14,533
- Unmatched: 2,774
- Largest remaining bucket: inflected noun, 1,457 unique forms / 1,836 occurrences

Remaining misses are mostly real vocabulary or inflected known vocabulary needing better morphology/source work. The next meaningful buckets are:

- Inflected noun and adjective forms.
- Prefix/function forms such as `ברוח`, `לרוח`, `שהן`, `ממה`.
- Abbreviations and quote artifacts such as `כ״א`, `ישראל"`, `ד׳"`, `בד׳`, `לד׳`.
- Aramaic/rabbinic or Kook-register forms such as `דמשיחא`, `החוצפא`, `זוהמא`, `עקבתא`.
- Acceptable unresolved leftovers where automatic matching would be unsafe without more context.

The regenerated top-100 unmatched report is in `reports/orot-unmatched-token-frequency-report.md`.

## Validation

- `scripts\validate_lexical_dom.ps1`: passed
- `scripts\validate_sources.ps1`: passed
- Generated JS syntax check: passed
- `git diff --check`: passed
