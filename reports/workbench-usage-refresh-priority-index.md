# Workbench Usage Refresh Priority Index

Generated: 2026-06-01T00:41:14.328Z

## Summary

- Pending refresh files: 80
- Known-usage refresh candidates: 0
- Review-only not promoted: 80
- Promoted run targets: 0
- Blocked broad refresh files: 80
- Source freshness status: stale
- Search rows inspected: 2390
- Search works inspected: 271
- Route payload-like field hits: 0

## Policy

This is a control artifact only. It classifies stale source inventory against existing usage search rows, but it does not read source text, scan tokens, generate evidence, promote broad targets, or make definition claims.

## Checks

| check | status | detail |
|---|---|---|
| pending_rows_match_source_freshness | passed | rows 80; freshness pending 80 |
| no_targets_promoted | passed | promoted rows 0; promoted count 0 |
| all_rows_have_source_paths | passed | source path rows 80; rows 80 |
| all_rows_have_review_reasons | passed | reason rows 80; rows 80 |
| route_payload_absent | passed | route IDs are copied as IDs only; route payload field hits 0 |

## Pending Refresh Rows

| status | source file | category hint | current usage rows | supported | candidate | weak | clusters | route ids | reason |
|---|---|---|---:|---:|---:|---:|---|---|---|
| review_only_not_promoted | data/sources/urim-vetumim-urim.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/pitchei-teshuva-on-shulchan-arukh-choshen-mishpat.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/meirat-einayim-on-shulchan-arukh-choshen-mishpat.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/shem-tov-on-guide-for-the-perplexed.json | jewish-thought | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/yahel-ohr-on-zohar.json | kabbalah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/crescas-on-guide-for-the-perplexed.json | jewish-thought | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/efodi-on-guide-for-the-perplexed.json | jewish-thought | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/narboni-on-guide-for-the-perplexed.json | jewish-thought | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/abarbanel-on-guide-for-the-perplexed.json | jewish-thought | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/ketzot-hachoshen-on-shulchan-arukh-choshen-mishpat.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/haggahot-imrei-barukh-on-shulchan-arukh-choshen-mishpat.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/yad-avraham-on-shulchan-arukh-yoreh-deah.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/turei-zahav-on-shulchan-arukh-yoreh-deah.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/siftei-kohen-on-shulchan-arukh-yoreh-deah.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/kereti-on-shulchan-arukh-yoreh-deah.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/rabbi-akiva-eiger-on-shulchan-arukh-orach-chayim.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/netiv-chayim-on-shulchan-arukh-orach-chayim.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/machatzit-hashekel-on-orach-chayim.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/levushei-serad-on-shulchan-arukh-orach-chayim.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/eliyah-rabbah-on-shulchan-arukh-orach-chayim.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/turei-zahav-on-shulchan-arukh-even-haezer.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/rabbi-akiva-eiger-on-shulchan-arukh-even-haezer.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/pitchei-teshuva-on-shulchan-arukh-even-haezer.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/ezer-mikodesh-on-shulchan-arukh-even-haezer.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/beit-meir-on-shulchan-arukh-even-haezer.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/perush-kadmon-on-sefer-chasidim.json | chasidut | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/brit-olam-on-sefer-chasidim.json | chasidut | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/publishers-haggahot-on-sefer-haparnas.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/haggahot-rabbeinu-peretz-on-sefer-mitzvot-katan.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/haggahot-of-radal-on-sefer-haparnas.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/haggahot-chadashot-on-sefer-mitzvot-katan.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/toafot-reem.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/megillat-esther-on-sefer-hamitzvot.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/marganita-tava-on-sefer-hamitzvot.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/lev-sameach.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/hasagot-haramban-on-sefer-hamitzvot.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/maamar-mezakeh-harabim.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/kav-hayashar.json | musar | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/yisrael-kedoshim.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/takanat-hashavin.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/sichat-shedim.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/sichat-malakhei-hasharet.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/resisei-layla.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/poked-akarim.json | kabbalah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/machshavot-charutz.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/likkutei-maamarim.json | kabbalah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/kometz-haminchah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/et-haochel.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/dover-tzedek.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/divrei-soferim.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/divrei-chalomot.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/yesod-mora-vesod-hatorah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/sefer-yesodei-hatorah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/sefer-hahiggayon.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/netzach-yisrael.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/netivot-olam.json | halakhah | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/ner-mitzvah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/gevurot-hashem.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/drashot-maharal.json | jewish-thought | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/derush-chiddushei-halevanah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/derush-al-hatorah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/derashat-shabbat-hagadol.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/beer-hagolah.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/yosher-divrei-emet.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/toldot-yaakov-yosef.json | chasidut | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/sippurei-maasiyot.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/mekor-mayim-chayim-on-baal-shem-tov.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/likutei-moharan.json | chasidut | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/keter-shem-tov.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/kedushat-levi.json | chasidut | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/baal-shem-tov.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/arvei-nachal.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/agra-dekala.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/torat-habayit-hakatzar.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/torat-habayit-haaroch.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/shibbolei-haleket.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/shev-shmateta.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
| review_only_not_promoted | data/sources/peri-megadim-on-orach-chayim.json | unknown | 0 | 0 | 0 | 0 |  |  | Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact. |
