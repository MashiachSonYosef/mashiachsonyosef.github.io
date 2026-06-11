# Agent 5 Route HUD Click Contract Prevalidation

Generated: 2026-06-02T00:28:15.569Z

Verdict: pass_static_prevalidation_browser_click_unproven

This is a static prevalidation artifact for Agent 6. It does not claim browser click proof; the in-app browser blocked direct file URL navigation for this page.

## Scope

- Page: kabbalah/ketem-paz-on-zohar/index.html
- Runtime: assets/js/reader-workbench.js
- Occurrence artifact: data/lexical/occurrences/ketem-paz-on-zohar.json
- Lexical manifest: data/lexical/ketem-paz-on-zohar.manifest.json
- Route lookup manifest: data/definitions/hud-route-lookup/manifest.json

## Contract Counts

- Static units: 2101
- Occurrence units: 2101
- Occurrence token placements: 518900
- Unique token ids: 57156
- Loaded lexical chunks: 58
- Token rows resolved: 57156
- Maqaf token rows: 0
- Paragraph count mismatches: 3
- Paragraph split-token alignments: 3
- Paragraph alignment failures: 0
- Runtime required markers missing: 0
- Page required markers missing: 0
- Forbidden stale page markers: 0

## Route Lookup Sample

- Sampled token rows: 19
- Samples with route cards: 14
- Samples with answer-eligible route cards: 9
- Samples with answer-eligible source/license rows: 9
- Samples with missing lookup shards: 4
- Missing lookup shards are coverage metrics for no-route/generated candidates, not warnings by themselves.

| reason | token id | surface codepoints | normalized codepoints | cards | answer eligible | answer source rows |
|---|---:|---:|---:|---:|---:|---:|
| opening_sequence | tok-8911dcfabc3d | U+05D4 U+05E1 U+05DB U+05DE U+05EA | U+05D4 U+05E1 U+05DB U+05DE U+05EA | 25 | 0 | 0 |
| opening_sequence | tok-5ff3defbec89 | U+05D4 U+05E8 U+05D1 U+05E0 U+05D9 U+05DD | U+05D4 U+05E8 U+05D1 U+05E0 U+05D9 U+05DE | 51 | 1 | 1 |
| opening_sequence | tok-c2f120f37c5a | U+05D4 U+05DE U+05D5 U+05D1 U+05D4 U+05E7 U+05D9 U+05DD | U+05D4 U+05DE U+05D5 U+05D1 U+05D4 U+05E7 U+05D9 U+05DE | 8 | 0 | 0 |
| opening_sequence | tok-afe49a1f92b0 | U+05DE U+05D0 U+05D9 U+05E8 U+05D9 U+05DD | U+05DE U+05D0 U+05D9 U+05E8 U+05D9 U+05DE | 73 | 2 | 2 |
| opening_sequence | tok-b7fe0e6b10a7 | U+05DB U+05D1 U+05E8 U+05E7 U+05D9 U+05DD | U+05DB U+05D1 U+05E8 U+05E7 U+05D9 U+05DE | 33 | 3 | 3 |
| opening_sequence | tok-e5c2cec40da1 | U+05D1 U+05D9 | U+05D1 U+05D9 | 50 | 1 | 1 |
| opening_sequence | tok-9dac1f0c9356 | U+05D3 U+05D9 U+05E0 U+05D0 | U+05D3 U+05D9 U+05E0 U+05D0 | 5 | 0 | 0 |
| opening_sequence | tok-b1c5468f4275 | U+05E8 U+05D1 U+05D0 | U+05E8 U+05D1 U+05D0 | 5 | 0 | 0 |
| opening_sequence | tok-251cca1ac761 | U+05D3 U+05E7 U+05F4 U+05E7 | U+05D3 U+05E7 U+05F4 U+05E7 | 0 | 0 | 0 |
| opening_sequence | tok-4b7204f92bcb | U+05DC U+05D9 U+05D5 U+05D5 U+05E8 U+05E0 U+05D5 | U+05DC U+05D9 U+05D5 U+05D5 U+05E8 U+05E0 U+05D5 | 0 | 0 | 0 |
| opening_sequence | tok-d9c2b88fc5c9 | U+05D9 U+05E2 U+05F4 U+05D0 | U+05D9 U+05E2 U+05F4 U+05D0 | 0 | 0 | 0 |
| opening_sequence | tok-9705e9ae0ae2 | U+05D4 U+05DB U+05D5 U+05EA U+05D1 | U+05D4 U+05DB U+05D5 U+05EA U+05D1 | 30 | 1 | 1 |
| opening_sequence | tok-eedb87e72a19 | U+05E9 U+05DD | U+05E9 U+05DE | 50 | 5 | 5 |
| opening_sequence | tok-1bc2bd9353ab | U+05DE U+05E9 U+05DE U+05F4 U+05E2 U+05D5 U+05DF | U+05DE U+05E9 U+05DE U+05F4 U+05E2 U+05D5 U+05E0 | 0 | 0 | 0 |
| opening_sequence | tok-e7c1e4a63803 | U+05DE U+05E9 U+05DE U+05DF | U+05DE U+05E9 U+05DE U+05E0 | 67 | 3 | 3 |
| suffix_candidate | tok-b2f4ec1cf67e | U+05D2 U+05D5 U+05D1 U+05E8 U+05D9 U+05D4 | U+05D2 U+05D5 U+05D1 U+05E8 U+05D9 U+05D4 | 11 | 0 | 0 |
| suffix_candidate | tok-6aa5cb7b3b6a | U+05D7 U+05D9 U+05DC U+05D9 U+05D4 | U+05D7 U+05D9 U+05DC U+05D9 U+05D4 | 65 | 1 | 1 |
| suffix_candidate | tok-0af75d712c95 | U+05D3 U+05D4 U+05D0 U+05D9 | U+05D3 U+05D4 U+05D0 U+05D9 | 51 | 1 | 1 |

## Issues

- none

## Warnings

- paragraph count mismatches resolved by split-token alignment: 3

## Agent 6 Boundary

- Needs Agent 6 signoff before this can be treated as validation evidence.
- Does not accept publication, source/provenance scope, Reader Workbench expansion, or live browser click reachability.
- Publication remains blocked_no_render.

