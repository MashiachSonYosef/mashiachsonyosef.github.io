# Workbench Usage Crossmatch Bridge Index

Generated: 2026-05-31T23:50:41.387Z

## Summary

- Occurrence refs: 49
- Directed edges: 2352
- Same-frame edges: 1192
- Bridge edges: 1160
- Bridge buckets: 2
- Bridge strengths: strong 14, moderate 1146, weak 0
- Route payload-like field hits: 0

## Policy

This packet separates same-frame links from cross-frame links. A bridge is a navigation relation only, not a merged meaning or definition.

## Checks

| check | status | detail |
|---|---|---|
| crossmatch_links_present | passed | directed edges 2352 |
| edge_partition_complete | passed | same-frame 1192; bridge 1160; total 2352 |
| bridges_not_merges | passed | bridge rows are labeled as usage-frame navigation only |
| route_payload_absent | passed | route IDs are copied as IDs only; route payload field hits 0 |

## Bridge Buckets

| source frame | target frame | edges | strong | moderate | weak | policy |
|---|---|---:|---:|---:|---:|---|
| first-yield / first-produce frame | opening / first-in-order frame | 580 | 7 | 573 | 0 | usage-frame bridge only; do not treat as a merged meaning |
| opening / first-in-order frame | first-yield / first-produce frame | 580 | 7 | 573 | 0 | usage-frame bridge only; do not treat as a merged meaning |

## Bridge Samples

| score | strength | source | source frame | target | target frame | relationships |
|---:|---|---|---|---|---|---|
| 75 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Genesis 10:10](https://www.sefaria.org/Genesis_10:10) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 72 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Ibn Ezra on Deuteronomy 21:17:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_21:17:3) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
| 72 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
| 72 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Ibn Ezra on Genesis 10:21:2](https://www.sefaria.org/Ibn_Ezra_on_Genesis_10:21:2) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
| 72 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Rashi on Deuteronomy 18:4:2](https://www.sefaria.org/Rashi_on_Deuteronomy_18:4:2) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
| 72 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
| 70 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_license, shared_slice |
| 70 | moderate | [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | [Job 40:19](https://www.sefaria.org/Job_40:19) | opening / first-in-order frame | same_focus_normalized, same_token_key, shared_route_id, same_license, shared_slice |
| 75 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Exodus 23:19](https://www.sefaria.org/Exodus_23:19) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 75 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Exodus 34:26](https://www.sefaria.org/Exodus_34:26) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 75 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Ezekiel 48:14](https://www.sefaria.org/Ezekiel_48:14) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 75 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Numbers 15:20](https://www.sefaria.org/Numbers_15:20) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 75 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Psalms 78:51](https://www.sefaria.org/Psalms_78:51) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 75 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Psalms 105:36](https://www.sefaria.org/Psalms_105:36) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, same_license, shared_slice |
| 72 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
| 72 | moderate | [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | [Ibn Ezra on Exodus 23:19:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_23:19:1) | first-yield / first-produce frame | same_focus_normalized, same_token_key, shared_route_id, same_status, shared_slice |
