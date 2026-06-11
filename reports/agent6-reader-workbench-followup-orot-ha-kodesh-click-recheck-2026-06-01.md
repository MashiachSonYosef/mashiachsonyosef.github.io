# Agent 5 Route HUD Click Contract Prevalidation

Generated: 2026-06-02T00:28:28.328Z

Verdict: pass_static_prevalidation_browser_click_unproven

This is a static prevalidation artifact for Agent 6. It does not claim browser click proof; the in-app browser blocked direct file URL navigation for this page.

## Scope

- Page: rav-kook/orot-ha-kodesh/index.html
- Runtime: assets/js/reader-workbench.js
- Occurrence artifact: data/lexical/occurrences/orot-ha-kodesh.json
- Lexical manifest: data/lexical/orot-ha-kodesh.manifest.json
- Route lookup manifest: data/definitions/hud-route-lookup/manifest.json

## Contract Counts

- Static units: 458
- Occurrence units: 458
- Occurrence token placements: 75959
- Unique token ids: 18735
- Loaded lexical chunks: 19
- Token rows resolved: 18735
- Maqaf token rows: 0
- Paragraph count mismatches: 3
- Paragraph split-token alignments: 3
- Paragraph alignment failures: 0
- Runtime required markers missing: 0
- Page required markers missing: 0
- Forbidden stale page markers: 0

## Route Lookup Sample

- Sampled token rows: 14
- Samples with route cards: 14
- Samples with answer-eligible route cards: 11
- Samples with answer-eligible source/license rows: 11
- Samples with missing lookup shards: 1
- Missing lookup shards are coverage metrics for no-route/generated candidates, not warnings by themselves.

| reason | token id | surface codepoints | normalized codepoints | cards | answer eligible | answer source rows |
|---|---:|---:|---:|---:|---:|---:|
| opening_sequence | tok-edbbd8219606 | U+05D7 U+05DB U+05DE U+05EA | U+05D7 U+05DB U+05DE U+05EA | 46 | 0 | 0 |
| opening_sequence | tok-0a4164638b4d | U+05D4 U+05E7 U+05D5 U+05D3 U+05E9 | U+05D4 U+05E7 U+05D5 U+05D3 U+05E9 | 59 | 2 | 2 |
| opening_sequence | tok-ec8a51ca8f35 | U+05D4 U+05E4 U+05D5 U+05E2 U+05DC U+05EA | U+05D4 U+05E4 U+05D5 U+05E2 U+05DC U+05EA | 22 | 1 | 1 |
| opening_sequence | tok-dc037b47d069 | U+05D4 U+05D9 U+05D0 | U+05D4 U+05D9 U+05D0 | 47 | 2 | 2 |
| opening_sequence | tok-14657a881595 | U+05E0 U+05E2 U+05DC U+05D4 | U+05E0 U+05E2 U+05DC U+05D4 | 44 | 5 | 5 |
| opening_sequence | tok-b7d73b6d22b4 | U+05DE U+05DB U+05DC | U+05DE U+05DB U+05DC | 47 | 2 | 2 |
| opening_sequence | tok-0d7e9ea8c643 | U+05D7 U+05DB U+05DE U+05D4 | U+05D7 U+05DB U+05DE U+05D4 | 99 | 3 | 3 |
| opening_sequence | tok-0cba4f18cd7d | U+05D1 U+05D6 U+05D4 | U+05D1 U+05D6 U+05D4 | 55 | 3 | 3 |
| opening_sequence | tok-defce470db3e | U+05E9 U+05D4 U+05D9 U+05D0 | U+05E9 U+05D4 U+05D9 U+05D0 | 52 | 2 | 2 |
| opening_sequence | tok-c69f59ffd894 | U+05DE U+05D4 U+05E4 U+05DB U+05EA | U+05DE U+05D4 U+05E4 U+05DB U+05EA | 3 | 0 | 0 |
| opening_sequence | tok-b147bc5ebe5a | U+05D0 U+05EA | U+05D0 U+05EA | 51 | 5 | 5 |
| opening_sequence | tok-197bd7fe8e50 | U+05D4 U+05E8 U+05E6 U+05D5 U+05DF | U+05D4 U+05E8 U+05E6 U+05D5 U+05E0 | 92 | 1 | 1 |
| opening_sequence | tok-28cc7a027771 | U+05D5 U+05D4 U+05EA U+05DB U+05D5 U+05E0 U+05D4 | U+05D5 U+05D4 U+05EA U+05DB U+05D5 U+05E0 U+05D4 | 68 | 1 | 1 |
| opening_sequence | tok-191991d24612 | U+05D4 U+05E0 U+05E4 U+05E9 U+05D9 U+05EA | U+05D4 U+05E0 U+05E4 U+05E9 U+05D9 U+05EA | 14 | 0 | 0 |

## Issues

- none

## Warnings

- paragraph count mismatches resolved by split-token alignment: 3

## Agent 6 Boundary

- Needs Agent 6 signoff before this can be treated as validation evidence.
- Does not accept publication, source/provenance scope, Reader Workbench expansion, or live browser click reachability.
- Publication remains blocked_no_render.

