# Workbench Usage Selected Collision Provenance Audit

Generated: 2026-06-01T07:08:11.004Z

## Summary

- Collision buckets: 16
- Collision occurrence rows: 38
- Duplicate source-ref buckets: 8
- Duplicate source-ref rows: 19
- Duplicate work-anchor buckets: 8
- Duplicate work-anchor rows: 19
- Cross-frame collision buckets: 4
- Cross-frame collision rows: 14
- Cross-provenance collision buckets: 0
- Cross-license collision buckets: 0
- Provenance buckets: 4
- Frame/provenance buckets: 7
- Licenses: 1
- License URLs: 1
- Version titles: 4
- Version sources: 3
- Route IDs: 1
- Status counts: supported 14, candidate 18, weak 6
- Missing provenance rows: 0
- Missing frame/provenance rows: 0
- Sample occurrences: 38
- Reader-facing rows: 0
- Route payload-like field hits: 0

## Policy

This audit joins duplicate selected occurrence buckets to provenance and frame/provenance metadata for QA concentration review. It preserves observed usage links, Hebrew snippets, route IDs, raw score/status, version, and license fields only; it does not rank routes, select visible answers, translate, or assert authority.

## Checks

| check | status | detail |
|---|---|---|
| collision_rows_present | passed | collision buckets 16 |
| collision_counts_match | passed | joined 16/38; collision audit 16/38 |
| source_ref_collision_counts_match | passed | joined 8/19; collision audit 8/19 |
| work_anchor_collision_counts_match | passed | joined 8/19; collision audit 8/19 |
| cross_frame_collisions_preserved | warning | joined 4; collision audit 4 |
| samples_cover_collisions | passed | samples 38; collision rows 38 |
| provenance_present_for_each_sample | passed | missing provenance rows 0 |
| frame_provenance_present_for_each_sample | passed | missing frame/provenance rows 0 |
| license_metadata_complete | passed | licenses 1; license URLs 1 |
| version_metadata_complete | passed | version titles 4; version sources 3 |
| route_ids_present | passed | route IDs 1 |
| reader_facing_zero | passed | reader-facing rows 0 |
| route_payload_absent | passed | route payload-like field hits 0 |

## Collision Provenance Buckets

| kind | key | rows | frames | provenance buckets | licenses | supported | candidate | weak | samples |
|---|---|---:|---|---:|---:|---:|---:|---:|---|
| source_ref | Rashi on Genesis 1:1:2 | 5 | first-yield / first-produce frame<br>opening / first-in-order frame | 1 | 1 | 3 | 2 | 0 | [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) |
| source_ref | Ibn Ezra on Deuteronomy 33:27:3 | 2 | opening / first-in-order frame | 1 | 1 | 0 | 2 | 0 | [Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3)<br>[Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3) |
| source_ref | Ibn Ezra on Exodus 22:28:1 | 2 | first-yield / first-produce frame | 1 | 1 | 0 | 1 | 1 | [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1)<br>[Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) |
| source_ref | Ibn Ezra on Genesis 1:1:1 | 2 | opening / first-in-order frame | 1 | 1 | 0 | 1 | 1 | [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1)<br>[Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) |
| source_ref | Ibn Ezra on Genesis 49:3:1 | 2 | first-yield / first-produce frame | 1 | 1 | 2 | 0 | 0 | [Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1)<br>[Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1) |
| source_ref | Ibn Ezra on Genesis, Introduction:22 | 2 | opening / first-in-order frame | 1 | 1 | 2 | 0 | 0 | [Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22)<br>[Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) |
| source_ref | Ibn Ezra on Numbers 24:20:1 | 2 | opening / first-in-order frame | 1 | 1 | 0 | 2 | 0 | [Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1)<br>[Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1) |
| source_ref | Rashi on Numbers 15:20:1 | 2 | first-yield / first-produce frame<br>opening / first-in-order frame | 1 | 1 | 0 | 1 | 1 | [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1)<br>[Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) |
| work_anchor | tanakh/rashi-on-genesis/index.html#rashi-on-genesis-1-1-2 | 5 | first-yield / first-produce frame<br>opening / first-in-order frame | 1 | 1 | 3 | 2 | 0 | [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) |
| work_anchor | tanakh/ibn-ezra-on-deuteronomy/index.html#ibn-ezra-on-deuteronomy-33-27-3 | 2 | opening / first-in-order frame | 1 | 1 | 0 | 2 | 0 | [Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3)<br>[Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3) |
| work_anchor | tanakh/ibn-ezra-on-exodus/index.html#ibn-ezra-on-exodus-22-28-1 | 2 | first-yield / first-produce frame | 1 | 1 | 0 | 1 | 1 | [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1)<br>[Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) |
| work_anchor | tanakh/ibn-ezra-on-genesis/index.html#ibn-ezra-on-genesis-default-default-1-1-1 | 2 | opening / first-in-order frame | 1 | 1 | 0 | 1 | 1 | [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1)<br>[Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) |
| work_anchor | tanakh/ibn-ezra-on-genesis/index.html#ibn-ezra-on-genesis-default-default-49-3-1 | 2 | first-yield / first-produce frame | 1 | 1 | 2 | 0 | 0 | [Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1)<br>[Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1) |
| work_anchor | tanakh/ibn-ezra-on-genesis/index.html#ibn-ezra-on-genesis-introduction-introduction-22 | 2 | opening / first-in-order frame | 1 | 1 | 2 | 0 | 0 | [Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22)<br>[Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) |
| work_anchor | tanakh/ibn-ezra-on-numbers/index.html#ibn-ezra-on-numbers-24-20-1 | 2 | opening / first-in-order frame | 1 | 1 | 0 | 2 | 0 | [Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1)<br>[Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1) |
| work_anchor | tanakh/rashi-on-numbers/index.html#rashi-on-numbers-15-20-1 | 2 | first-yield / first-produce frame<br>opening / first-in-order frame | 1 | 1 | 0 | 1 | 1 | [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1)<br>[Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) |
