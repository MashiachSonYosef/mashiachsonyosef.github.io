# Workbench Usage Selected Collision Audit

Generated: 2026-06-01T06:00:59.739Z

## Summary

- Collision buckets: 16
- Collision occurrence rows: 38
- Duplicate source-ref buckets: 8
- Duplicate source-ref rows: 19
- Duplicate work-anchor buckets: 8
- Duplicate work-anchor rows: 19
- Cross-frame collision buckets: 4
- Cross-frame collision rows: 14
- Sample occurrences: 38
- Reader-facing rows: 0
- Route payload-like field hits: 0

## Policy

This audit makes duplicate selected source/work-anchor buckets explicit for QA. It preserves links, snippets, route IDs, scores, and license metadata only; it does not rank routes, select visible answers, translate, or assert authority.

## Checks

| check | status | detail |
|---|---|---|
| collision_buckets_present | passed | collision buckets 16 |
| source_ref_collision_counts_match | passed | audit 8/19; source diversity 8/19 |
| work_anchor_collision_counts_match | passed | audit 8/19; source diversity 8/19 |
| cross_frame_collisions_visible | warning | cross-frame collision buckets 4; rows 14 |
| samples_cover_collisions | passed | samples 38; collision rows 38 |
| reader_facing_zero | passed | reader-facing rows 0 |
| route_payload_absent | passed | route payload-like field hits 0 |

## Collision Buckets

| kind | key | rows | frames | supported | candidate | weak | score avg | samples |
|---|---|---:|---|---:|---:|---:|---:|---|
| source_ref | Rashi on Genesis 1:1:2 | 5 | first-yield / first-produce frame<br>opening / first-in-order frame | 3 | 2 | 0 | 88.8 | [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) |
| source_ref | Ibn Ezra on Deuteronomy 33:27:3 | 2 | opening / first-in-order frame | 0 | 2 | 0 | 73 | [Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3)<br>[Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3) |
| source_ref | Ibn Ezra on Exodus 22:28:1 | 2 | first-yield / first-produce frame | 0 | 1 | 1 | 71 | [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1)<br>[Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) |
| source_ref | Ibn Ezra on Genesis 1:1:1 | 2 | opening / first-in-order frame | 0 | 1 | 1 | 68 | [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1)<br>[Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) |
| source_ref | Ibn Ezra on Genesis 49:3:1 | 2 | first-yield / first-produce frame | 2 | 0 | 0 | 94 | [Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1)<br>[Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1) |
| source_ref | Ibn Ezra on Genesis, Introduction:22 | 2 | opening / first-in-order frame | 2 | 0 | 0 | 94 | [Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22)<br>[Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) |
| source_ref | Ibn Ezra on Numbers 24:20:1 | 2 | opening / first-in-order frame | 0 | 2 | 0 | 72 | [Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1)<br>[Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1) |
| source_ref | Rashi on Numbers 15:20:1 | 2 | first-yield / first-produce frame<br>opening / first-in-order frame | 0 | 1 | 1 | 75.5 | [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1)<br>[Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) |
| work_anchor | tanakh/rashi-on-genesis/index.html#rashi-on-genesis-1-1-2 | 5 | first-yield / first-produce frame<br>opening / first-in-order frame | 3 | 2 | 0 | 88.8 | [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2)<br>[Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) |
| work_anchor | tanakh/ibn-ezra-on-deuteronomy/index.html#ibn-ezra-on-deuteronomy-33-27-3 | 2 | opening / first-in-order frame | 0 | 2 | 0 | 73 | [Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3)<br>[Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3) |
| work_anchor | tanakh/ibn-ezra-on-exodus/index.html#ibn-ezra-on-exodus-22-28-1 | 2 | first-yield / first-produce frame | 0 | 1 | 1 | 71 | [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1)<br>[Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) |
| work_anchor | tanakh/ibn-ezra-on-genesis/index.html#ibn-ezra-on-genesis-default-default-1-1-1 | 2 | opening / first-in-order frame | 0 | 1 | 1 | 68 | [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1)<br>[Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) |
| work_anchor | tanakh/ibn-ezra-on-genesis/index.html#ibn-ezra-on-genesis-default-default-49-3-1 | 2 | first-yield / first-produce frame | 2 | 0 | 0 | 94 | [Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1)<br>[Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1) |
| work_anchor | tanakh/ibn-ezra-on-genesis/index.html#ibn-ezra-on-genesis-introduction-introduction-22 | 2 | opening / first-in-order frame | 2 | 0 | 0 | 94 | [Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22)<br>[Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) |
| work_anchor | tanakh/ibn-ezra-on-numbers/index.html#ibn-ezra-on-numbers-24-20-1 | 2 | opening / first-in-order frame | 0 | 2 | 0 | 72 | [Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1)<br>[Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1) |
| work_anchor | tanakh/rashi-on-numbers/index.html#rashi-on-numbers-15-20-1 | 2 | first-yield / first-produce frame<br>opening / first-in-order frame | 0 | 1 | 1 | 75.5 | [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1)<br>[Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) |
