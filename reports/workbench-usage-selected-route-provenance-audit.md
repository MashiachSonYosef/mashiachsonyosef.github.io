# Workbench Usage Selected Route Provenance Audit

Generated: 2026-06-01T06:34:56.275Z

## Summary

- Route rows: 1
- Selected route links: 49
- Provenance buckets: 5
- Works: 20
- Usage frames: 2
- Status counts: supported 11, candidate 26, weak 12
- Unresolved route rows: 0
- Missing provenance rows: 0
- Route payload copied rows: 0
- Sample occurrences: 49
- Reader-facing rows: 0
- Route payload-like field hits: 0

## Policy

This audit joins selected occurrence rows to route IDs and provenance buckets. It keeps route identity and observed usage links only; it does not copy route payloads, rank routes, select visible answers, translate, or assert authority.

## Checks

| check | status | detail |
|---|---|---|
| route_rows_present | passed | route rows 1 |
| selected_route_links_complete | passed | route links 49; selected cards with route IDs 49 |
| route_resolution_rows_match | passed | route IDs 1; route buckets 1 |
| provenance_present_for_each_sample | passed | missing provenance rows 0 |
| provenance_bucket_coverage | passed | route/provenance buckets 5; provenance matrix buckets 5 |
| route_ids_resolved | passed | unresolved route rows 0 |
| route_payload_not_copied | passed | route payload copied rows 0 |
| samples_cover_route_links | passed | samples 49; route links 49 |
| status_counts_complete | passed | status rows 49; route links 49 |
| reader_facing_zero | passed | reader-facing rows 0 |
| route_payload_absent | passed | route payload-like field hits 0 |

## Route Rows

| route ID | route type | rows | provenance buckets | works | frames | supported | candidate | weak | samples |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| def-kaikki-lemma-e4f94cd5131316a8 | lemma | 49 | 5 | 20 | 2 | 11 | 26 | 12 | [II Chronicles 31:5](https://www.sefaria.org/II_Chronicles_31:5)<br>[Rashi on Deuteronomy 26:13:5](https://www.sefaria.org/Rashi_on_Deuteronomy_26:13:5)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Jeremiah 2:3](https://www.sefaria.org/Jeremiah_2:3)<br>[Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1)<br>[Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1)<br>[Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) |
