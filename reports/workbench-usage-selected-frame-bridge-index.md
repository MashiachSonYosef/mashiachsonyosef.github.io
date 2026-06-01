# Workbench Usage Selected Frame Bridge Index

Generated: 2026-06-01T08:19:54.589Z

## Summary

- Frame bridge rows: 4
- Edge memberships: 2352
- Same-frame rows: 2
- Bridge-frame rows: 2
- Same-frame edges: 1192
- Bridge-frame edges: 1160
- Source clusters: 2
- Target clusters: 2
- Route IDs: 1
- Provenance buckets: 5
- Sample rows: 32
- Reader-facing rows: 0
- Route payload-like field hits: 0

## Checks

| check | status | detail |
|---|---|---|
| rows_present | passed | rows 4 |
| edge_memberships_complete | passed | memberships 2352; expected 2352 |
| same_frame_edges_complete | passed | same-frame 1192; expected 1192 |
| bridge_edges_complete | passed | bridge 1160; expected 1160 |
| frame_rows_cover_same_and_bridge | passed | same-frame rows 2; bridge rows 2 |
| route_ids_carried_without_payloads | passed | route IDs 1 |
| samples_have_links | passed | sample links 32; samples 32 |
| samples_have_context | passed | sample context 32; samples 32 |
| reader_facing_blocked | passed | reader-facing rows 0 |
| no_route_payload_fields | passed | route payload-like field hits 0 |

## Frame Bridges

| bridge | kind | source frame | target frame | edges | source refs | target refs | route IDs |
|---|---|---|---|---:|---:|---:|---:|
| selected-frame-bridge-3efe7f18 | bridge_frame | first-yield / first-produce frame | opening / first-in-order frame | 580 | 26 | 14 | 1 |
| selected-frame-bridge-ad3c2ec8 | bridge_frame | opening / first-in-order frame | first-yield / first-produce frame | 580 | 14 | 26 | 1 |
| selected-frame-bridge-b0cbbf99 | same_frame | first-yield / first-produce frame | first-yield / first-produce frame | 812 | 26 | 26 | 1 |
| selected-frame-bridge-a38edc71 | same_frame | opening / first-in-order frame | opening / first-in-order frame | 380 | 14 | 14 | 1 |

## Boundary

This frame bridge index summarizes observed usage-frame links only. It is not reader-facing, does not rank routes, and carries no copied route payloads.
