# HUD Route Card CSV Report

This CSV is a human-readable mirror of the route-card lookup contract. It is intentionally route-card shaped, not the old public lexical claim export.

Boundary: QA mirror only. It preserves `answer_eligible`, `answer_role`, and source/license rows from the HUD route lookup; it does not create accepted translation text or publication readiness.

## Files

- CSV: `data/definitions/hud-route-card-sample.csv`
- Lookup manifest: `data/definitions/hud-route-lookup/manifest.json`
- Encoding: UTF-8 with BOM for spreadsheet compatibility.

## Counts

- Cards in lookup: 539661
- CSV rows written: 500 of limit 500
- Distinct normalized tokens: 175216
- Shards: 7990
- Max shard bytes: 2838224

## Columns

- `lookup_shard`
- `normalized`
- `surface`
- `hebrew`
- `display_section`
- `display_label`
- `route_family`
- `route_type`
- `match_type`
- `language`
- `definition_or_claim`
- `plain_note`
- `phrase_hebrew`
- `phrase_focus`
- `phrase_context`
- `source_ref`
- `work_id`
- `work_title`
- `raw_score`
- `score_handicap`
- `adjusted_score`
- `confidence_percent`
- `answer_score`
- `answer_eligible`
- `answer_role`
- `context_rank_score`
- `part_of_speech`
- `meaning_quality`
- `form_of`
- `morphology`
- `source_row_count`
- `source_names`
- `source_families`
- `source_ids`
- `licenses`
- `license_urls`
- `source_urls`
- `fields_used`
- `source_notes`
- `card_id`

### Sections

| Value | Cards |
| --- | ---: |
| citable_paraphrase_evidence | 200000 |
| phrase_evidence | 200000 |
| strict_hebrew | 118176 |
| lemma | 21485 |

### Route Types

| Value | Cards |
| --- | ---: |
| citable_paraphrase_evidence | 200000 |
| phrase_evidence | 199982 |
| form | 118176 |
| lemma | 21485 |
| subphrase_evidence | 18 |

### Answer Eligible

| Value | Cards |
| --- | ---: |
| false | 520978 |
| true | 18683 |

### Answer Roles

| Value | Cards |
| --- | ---: |
| evidence | 402802 |
| form_reference | 118176 |
| answer | 18683 |

### Source Families

| Value | Cards |
| --- | ---: |
| hebrew_source_text | 400000 |
| kaikki | 294549 |
| openscriptures | 40554 |
| wikidata | 29596 |
| workspace | 1033 |

### Licenses

| Value | Cards |
| --- | ---: |
| Public Domain | 400000 |
| CC BY-SA 4.0 / GFDL | 294549 |
| CC BY 4.0 | 40554 |
| CC0 | 29596 |
| project-authored / CC0 | 1029 |
| N/A - project lexical rule | 4 |

## Regenerate

```powershell
node scripts\export_hud_route_cards_csv.mjs
```

For a full local export, use `--full --out-csv .local-cache/hud-route-card-index.csv` so the large CSV does not become a tracked site artifact by accident.
