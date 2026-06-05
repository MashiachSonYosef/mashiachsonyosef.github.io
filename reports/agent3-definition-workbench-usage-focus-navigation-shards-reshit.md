# Agent 3 Definition Workbench Usage Focus Navigation Shards

Generated: 2026-06-02T12:16:06.338Z

Status: evidence-ready; awaiting Agent 6 review. This is a compact navigation-shard index for `ראשית`, not Agent 6 acceptance.

## Scope

This packet derives frame/category/license/status/work shards from the existing focus-token drilldown and frame summary. It stores occurrence IDs and source/work/license samples for search/navigation only. It does not read source text, import sources, broaden targets, mutate queues, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Counts

- Source drilldown rows / frame-summary rows / source rows: 2390/2390/2390
- Shard rows: 450
- Frame-category / frame-license / frame-status / category-license / work-frame shards: 28/8/6/29/379
- Complete metadata / route rows: 2390/2390
- Observed usage / reader-facing / route-payload / forbidden-authority rows: 2390/0/0/0
- Route IDs: 1
- Source-text reads / broad expansion / queue mutations / submitted to Agent 6: 0/0/0/0

## Checks

| check | status | detail |
|---|---|---|
| source_inputs_loaded | passed | drilldown/frame/source 2390/2390/2390 |
| shards_present | passed | total/frameCategory/frameLicense/frameStatus/categoryLicense/workFrame 450/28/8/6/29/379 |
| metadata_complete | passed | metadata/routes 2390/2390/2390 |
| usage_only_boundary | passed | observed/reader/payload/forbidden 2390/0/0/0 |
| route_concentration_preserved | warning | route IDs 1 |
| no_broad_or_queue_side_effects | passed | sourceText/broad/queue/submitted 0/0/0/0 |

## Top Shards

| type | parts | rows | source refs | works | licenses | route IDs |
|---|---|---:|---:|---:|---:|---|
| frame_license | opening / first-in-order frame / Public Domain | 1220 | 908 | 160 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_license | first-yield / first-produce frame / Public Domain | 1044 | 741 | 174 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | chasidut / Public Domain | 810 | 555 | 22 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_status | opening / first-in-order frame / candidate | 785 | 599 | 127 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_status | first-yield / first-produce frame / candidate | 566 | 439 | 136 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / chasidut | 507 | 387 | 21 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | halakhah / Public Domain | 410 | 293 | 98 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_status | opening / first-in-order frame / weak | 388 | 332 | 111 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / halakhah | 341 | 245 | 79 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | kabbalah / Public Domain | 329 | 207 | 16 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_status | first-yield / first-produce frame / weak | 312 | 247 | 106 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / chasidut | 303 | 210 | 19 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | midrash / Public Domain | 284 | 214 | 43 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_status | first-yield / first-produce frame / supported | 241 | 199 | 92 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / kabbalah | 235 | 156 | 17 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | musar / Public Domain | 201 | 138 | 12 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / midrash | 173 | 135 | 31 | 3 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / midrash | 135 | 110 | 37 | 3 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / musar | 129 | 99 | 13 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | sefat-emet / opening / first-in-order frame | 126 | 89 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / halakhah | 119 | 97 | 51 | 4 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / kabbalah | 109 | 74 | 11 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | jewish-thought / Public Domain | 106 | 77 | 10 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | shenei-luchot-haberit / opening / first-in-order frame | 99 | 72 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_status | opening / first-in-order frame / supported | 98 | 76 | 44 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | peri-tzadik / opening / first-in-order frame | 86 | 71 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / jewish-thought | 77 | 56 | 10 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / musar | 75 | 46 | 8 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ohr-hachammah-on-zohar / opening / first-in-order frame | 66 | 41 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | sefat-emet / first-yield / first-produce frame | 62 | 41 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_license | first-yield / first-produce frame / CC-BY-SA | 54 | 46 | 23 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | shenei-luchot-haberit / first-yield / first-produce frame | 54 | 27 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ohr-hachammah-on-zohar / first-yield / first-produce frame | 51 | 30 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | peri-tzadik / first-yield / first-produce frame | 41 | 33 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | gra / Public Domain | 37 | 19 | 7 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | tanakh / Public Domain | 35 | 24 | 9 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | mikdash-melekh-on-zohar / opening / first-in-order frame | 35 | 25 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | sod-yesharim / first-yield / first-produce frame | 35 | 20 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | zera-kodesh / opening / first-in-order frame | 35 | 27 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | akeidat-yitzchak / opening / first-in-order frame | 33 | 28 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ohev-yisrael / first-yield / first-produce frame | 32 | 21 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ketem-paz-on-zohar / opening / first-in-order frame | 31 | 17 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | tiferet-shlomo / opening / first-in-order frame | 31 | 19 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / jewish-thought | 30 | 25 | 7 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | pardes-rimmonim / opening / first-in-order frame | 30 | 18 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / tanakh | 29 | 26 | 16 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | yismach-moshe / opening / first-in-order frame | 29 | 18 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ohr-hameir / opening / first-in-order frame | 28 | 23 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | beit-aharon / opening / first-in-order frame | 27 | 22 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | kiryat-sefer-on-mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary / first-yield / first-produce frame | 27 | 15 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | zera-kodesh / first-yield / first-produce frame | 27 | 18 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | arukh-hashulchan-heatid / first-yield / first-produce frame | 26 | 16 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | beit-aharon / first-yield / first-produce frame | 25 | 21 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | midrash-lekach-tov / first-yield / first-produce frame | 25 | 19 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | arukh-hashulchan / first-yield / first-produce frame | 24 | 18 | 1 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | maor-vashemesh / opening / first-in-order frame | 24 | 17 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | recanati-on-the-torah / first-yield / first-produce frame | 24 | 16 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / gra | 23 | 13 | 6 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_license | opening / first-in-order frame / CC-BY-SA | 23 | 23 | 15 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | yismach-moshe / first-yield / first-produce frame | 23 | 13 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_license | opening / first-in-order frame / CC-BY | 22 | 18 | 3 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | meor-einayim / opening / first-in-order frame | 22 | 13 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | moreh-nevukhei-hazeman / opening / first-in-order frame | 22 | 14 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ohev-yisrael / opening / first-in-order frame | 22 | 19 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | zohar-chadash / opening / first-in-order frame | 21 | 13 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | halakhah / CC-BY-SA | 20 | 15 | 3 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / tanakh | 20 | 14 | 9 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | halakhah / CC-BY | 18 | 12 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | bnei-yissaschar / opening / first-in-order frame | 18 | 18 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | otzar-midrashim / first-yield / first-produce frame | 17 | 11 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | midrash / CC-BY | 16 | 15 | 2 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / gra | 16 | 9 | 5 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | akeidat-yitzchak / first-yield / first-produce frame | 16 | 13 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | kabbalah / CC-BY-SA | 15 | 13 | 2 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | rav-kook / Public Domain | 15 | 7 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | chafetz-chaim-on-sifra / first-yield / first-produce frame | 15 | 9 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | minchat-chinukh / first-yield / first-produce frame | 15 | 11 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | the-sabbath-epistle / opening / first-in-order frame | 15 | 11 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | tanakh / CC-BY-SA | 14 | 14 | 11 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | beit-yosef / first-yield / first-produce frame | 14 | 12 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ben-ish-hai / first-yield / first-produce frame | 14 | 6 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | midrash-lekach-tov / opening / first-in-order frame | 14 | 9 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | midrash-tanchuma-buber / first-yield / first-produce frame | 14 | 11 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | sefer-yereim / first-yield / first-produce frame | 14 | 12 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | avodat-yisrael / first-yield / first-produce frame | 13 | 8 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | otzar-midrashim / opening / first-in-order frame | 13 | 12 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | raavad-on-sifra / first-yield / first-produce frame | 13 | 9 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | recanati-on-the-torah / opening / first-in-order frame | 13 | 8 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | halakhah / CC0 | 12 | 9 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / liturgy | 12 | 11 | 7 | 3 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_license | first-yield / first-produce frame / CC-BY | 12 | 12 | 3 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | kessef-mishneh-on-mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary / first-yield / first-produce frame | 12 | 6 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | midrash-tanchuma / first-yield / first-produce frame | 12 | 11 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | liturgy / Public Domain | 11 | 10 | 3 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | aderet-eliyahu / opening / first-in-order frame | 11 | 5 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | maggid-devarav-leyaakov / opening / first-in-order frame | 11 | 10 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | peri-haaretz / opening / first-in-order frame | 11 | 8 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | avodat-yisrael / opening / first-in-order frame | 10 | 9 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ein-yaakov / opening / first-in-order frame | 10 | 10 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | even-haazel-on-mishneh-torah-daily-offerings-and-additional-offerings / first-yield / first-produce frame | 10 | 4 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ketem-paz-on-zohar / first-yield / first-produce frame | 10 | 8 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | kiryat-sefer-on-mishneh-torah-heave-offerings / first-yield / first-produce frame | 10 | 8 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | megalleh-amukkot-on-parashat-vaetchanan / opening / first-in-order frame | 10 | 9 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary / first-yield / first-produce frame | 10 | 7 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | pele-yoetz / first-yield / first-produce frame | 10 | 10 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | zohar-harakia / first-yield / first-produce frame | 10 | 6 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | ari / Public Domain | 9 | 9 | 4 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | tosefta / Public Domain | 9 | 7 | 7 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / rav-kook | 9 | 6 | 2 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_license | first-yield / first-produce frame / CC0 | 9 | 7 | 2 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | kessef-mishneh-on-mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary / opening / first-in-order frame | 9 | 7 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| category_license | midrash / CC-BY-SA | 8 | 6 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / rav-kook | 8 | 5 | 2 | 2 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | first-yield / first-produce frame / tosefta | 8 | 7 | 7 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| frame_category | opening / first-in-order frame / liturgy | 8 | 8 | 4 | 3 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | beit-yosef / opening / first-in-order frame | 8 | 6 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | ben-ish-hai / opening / first-in-order frame | 8 | 4 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | beur-haradal-on-pirkei-derabbi-eliezer / opening / first-in-order frame | 8 | 8 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | beur-hareem-on-midrash-lekach-tov / first-yield / first-produce frame | 8 | 6 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |
| work_frame | degel-machaneh-ephraim / opening / first-in-order frame | 8 | 7 | 1 | 1 | def-kaikki-lemma-e4f94cd5131316a8 |

## Boundary

Observed usage/navigation only. Shards are search facets over existing occurrence rows; they do not claim semantic confirmation, Definition authority, route ranking, visible answer selection, publication support, source/provenance custody, or accepted text. Route concentration remains a visible warning.
