# Agent 5 Route HUD Click Contract Prevalidation

Generated: 2026-06-02T00:27:43.973Z

Verdict: pass_static_prevalidation_browser_click_unproven

This is a static prevalidation artifact for Agent 6. It does not claim browser click proof; the in-app browser blocked direct file URL navigation for this page.

## Scope

- Page: halakhah/abudarham/index.html
- Runtime: assets/js/reader-workbench.js
- Occurrence artifact: data/lexical/occurrences/abudarham.json
- Lexical manifest: data/lexical/abudarham.manifest.json
- Route lookup manifest: data/definitions/hud-route-lookup/manifest.json

## Contract Counts

- Static units: 1768
- Occurrence units: 1768
- Occurrence token placements: 179852
- Unique token ids: 27125
- Loaded lexical chunks: 28
- Token rows resolved: 27125
- Maqaf token rows: 0
- Paragraph count mismatches: 3
- Paragraph split-token alignments: 3
- Paragraph alignment failures: 0
- Runtime required markers missing: 0
- Page required markers missing: 0
- Forbidden stale page markers: 0

## Route Lookup Sample

- Sampled token rows: 20
- Samples with route cards: 18
- Samples with answer-eligible route cards: 16
- Samples with answer-eligible source/license rows: 16
- Samples with missing lookup shards: 2
- Missing lookup shards are coverage metrics for no-route/generated candidates, not warnings by themselves.

| reason | token id | surface codepoints | normalized codepoints | cards | answer eligible | answer source rows |
|---|---:|---:|---:|---:|---:|---:|
| opening_sequence | tok-9cf5328aafc8 | U+05D1 U+05E2 U+05D6 U+05E8 | U+05D1 U+05E2 U+05D6 U+05E8 | 53 | 3 | 3 |
| opening_sequence | tok-f158f891d9a0 | U+05D0 U+05DC U+05D4 U+05D9 | U+05D0 U+05DC U+05D4 U+05D9 | 103 | 3 | 3 |
| opening_sequence | tok-adb650bff2c0 | U+05E7 U+05D3 U+05DD | U+05E7 U+05D3 U+05DE | 53 | 3 | 3 |
| opening_sequence | tok-6ff68b8d5d07 | U+05E9 U+05D5 U+05DB U+05DF | U+05E9 U+05D5 U+05DB U+05E0 | 77 | 1 | 1 |
| opening_sequence | tok-38c9b476adbf | U+05DE U+05E2 U+05D5 U+05E0 U+05D4 | U+05DE U+05E2 U+05D5 U+05E0 U+05D4 | 107 | 3 | 3 |
| opening_sequence | tok-ce420ba99386 | U+05D0 U+05D7 U+05DC | U+05D0 U+05D7 U+05DC | 15 | 0 | 0 |
| opening_sequence | tok-1be73a52a629 | U+05DC U+05E4 U+05E8 U+05E9 | U+05DC U+05E4 U+05E8 U+05E9 | 100 | 5 | 5 |
| opening_sequence | tok-79ebb2c7b3b3 | U+05EA U+05E4 U+05DC U+05D5 U+05EA | U+05EA U+05E4 U+05DC U+05D5 U+05EA | 65 | 1 | 1 |
| opening_sequence | tok-b336eeea3a00 | U+05DB U+05DC | U+05DB U+05DC | 47 | 2 | 2 |
| opening_sequence | tok-758607ece238 | U+05D4 U+05E9 U+05E0 U+05D4 | U+05D4 U+05E9 U+05E0 U+05D4 | 108 | 3 | 3 |
| opening_sequence | tok-6d31344af373 | U+05D0 U+05DE U+05F3 | U+05D0 U+05DE U+05F3 | 0 | 0 | 0 |
| opening_sequence | tok-05b70a57e952 | U+05D3 U+05D5 U+05D3 | U+05D3 U+05D5 U+05D3 | 50 | 4 | 4 |
| opening_sequence | tok-5f49edaeb45f | U+05D1 U+05F4 U+05E8 | U+05D1 U+05F4 U+05E8 | 1 | 1 | 1 |
| opening_sequence | tok-d5e31525ea0e | U+05D9 U+05D5 U+05E1 U+05E3 | U+05D9 U+05D5 U+05E1 U+05E4 | 48 | 1 | 1 |
| opening_sequence | tok-9adeed679c7d | U+05E1 U+05F4 U+05D8 | U+05E1 U+05F4 U+05D8 | 0 | 0 | 0 |
| suffix_candidate | tok-5b774a71f10e | U+05D1 U+05DF | U+05D1 U+05E0 | 51 | 3 | 3 |
| suffix_candidate | tok-e21f585b82ce | U+05D1 U+05E8 U+05D5 U+05DA | U+05D1 U+05E8 U+05D5 U+05DB | 58 | 4 | 4 |
| suffix_candidate | tok-3e87d0fb03df | U+05D0 U+05DC U+05E7 U+05D9 | U+05D0 U+05DC U+05E7 U+05D9 | 7 | 0 | 0 |

## Issues

- none

## Warnings

- paragraph count mismatches resolved by split-token alignment: 3

## Agent 6 Boundary

- Needs Agent 6 signoff before this can be treated as validation evidence.
- Does not accept publication, source/provenance scope, Reader Workbench expansion, or live browser click reachability.
- Publication remains blocked_no_render.

