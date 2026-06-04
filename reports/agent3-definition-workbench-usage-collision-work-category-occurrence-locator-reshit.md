# Agent 3 Collision Work/Category Occurrence Locator

Generated: 2026-06-04T11:17:27.471Z

Status: evidence-ready; awaiting Agent 6. This is occurrence-link navigation only and not Definition authority.

## Scope

This packet deduplicates the current work/category grouped occurrence samples into concrete source/local anchor rows. It supports QA navigation from category/work buckets to source refs, local work anchors, snippets, license/version metadata, and route IDs.

## Counts

- Unique locator rows / grouped occurrence rows: 96/106
- Duplicate grouped occurrence rows: 10
- Source URLs / local anchors / snippets: 96/96/96
- Work IDs / work titles / categories: 96/96/96
- License rows / version rows: 96/96
- Route-ID rows / distinct route IDs: 96/1
- Category / work / category-license buckets: 8/24/8
- Rows with category / work / category-license bucket links: 58/96/58
- Locator membership links / queue links: 212/200
- Distinct source refs / works / categories / licenses / version sources: 49/24/8/2/22
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0
- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: 0/0/0/0

## Locator Preview

| occurrence_id | source_ref | work_id | category | local_anchor |
|---|---|---|---|---|
| usage-occ-049ce3067673c257 | Aderet Eliyahu, Genesis 1:1:2 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-2` |
| usage-occ-3cbc7f70d9d0e742 | Aderet Eliyahu, Genesis 1:1:2 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-2` |
| usage-occ-785c7c721f915cfe | Aderet Eliyahu, Genesis 1:1:2 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-2` |
| usage-occ-f93c9627d8a7a28b | Aderet Eliyahu, Genesis 1:1:2 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-2` |
| usage-occ-4676da48bc763232 | Aderet Eliyahu, Genesis 1:1:9 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-9` |
| usage-occ-91655a9ff39a2846 | Aderet Eliyahu, Genesis 1:1:9 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-9` |
| usage-occ-c5662ec9e693771c | Aderet Eliyahu, Genesis 1:1:9 | aderet-eliyahu | gra | `gra/aderet-eliyahu/index.html#aderet-eliyahu-genesis-genesis-1-1-9` |
| usage-occ-ca48d5766f897e51 | Akeidat Yitzchak 1:1:13 | akeidat-yitzchak | jewish-thought | `jewish-thought/akeidat-yitzchak/index.html#akeidat-yitzchak-default-default-1-1-13` |
| usage-occ-daec0e274ec65079 | Akeidat Yitzchak 102:1:15 | akeidat-yitzchak | jewish-thought | `jewish-thought/akeidat-yitzchak/index.html#akeidat-yitzchak-default-default-102-1-15` |
| usage-occ-fea6de2bf8e17919 | Akeidat Yitzchak 82:1:9 | akeidat-yitzchak | jewish-thought | `jewish-thought/akeidat-yitzchak/index.html#akeidat-yitzchak-default-default-82-1-9` |
| usage-occ-663f2fdb801e428b | Beit Yosef, Yoreh De'ah 61:31:1 | beit-yosef | halakhah | `halakhah/beit-yosef/index.html#beit-yosef-yoreh-deah-yoreh-deah-61-31-1` |
| usage-occ-7dc3cc797bfcf401 | Beit Yosef, Yoreh De'ah 61:31:1 | beit-yosef | halakhah | `halakhah/beit-yosef/index.html#beit-yosef-yoreh-deah-yoreh-deah-61-31-1` |

## Checks

| check | status | detail |
|---|---|---|
| locator_rows_present | passed | unique/source 96/106 |
| clickable_occurrence_links_complete | passed | source-url/local-anchor 96/96 |
| context_and_source_refs_complete | passed | source-ref/context 96/96 |
| metadata_complete | passed | work/title/category/license/version 96/96/96/96/96 |
| route_ids_only_visible | passed | route rows/distinct 96/1 |
| observed_usage_labels_complete | passed | observed 96/96 |
| bucket_context_visible | passed | category/work/category-license rows 58/96/58; buckets 8/24/8; links 212 |
| source_work_license_diversity_visible | passed | source/work/category/license 49/24/8/2 |
| no_reader_payload_authority_hits | passed | reader/payload/forbidden 0/0/0 |
| no_source_broad_queue_side_effects | passed | source/broad/queue/submitted 0/0/0/0 |

## Agent 5/6 Queue Intake Summary

This locator exposes 96 observed-usage occurrence rows with complete source URLs, local work anchors, snippets, license/version metadata, and route-ID pointers. It preserves 8 category buckets, 24 work buckets, 8 category-license buckets, and 200 queue links without copying Agent 2 route payloads.

## Boundary

Agent 3 output remains observed usage/navigation evidence only. This locator is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.

