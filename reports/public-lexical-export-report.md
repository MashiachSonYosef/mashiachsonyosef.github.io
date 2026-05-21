# Public Lexical Export Report

Generated: 2026-05-11T15:31:00.214Z

## Scope

This export contains claim-shaped lexical HUD rows for hardened public workbench pages. It is not a translation export and does not include prose translations.

## Exported Row Counts by Work

| Work | Rows |
| --- | ---: |
| orot | 28273 |
| aggadat-bereshit | 9386 |

## Exported Row Counts by License Bucket

| License bucket | Rows | File |
| --- | ---: | --- |
| Project-authored / CC0 | 471 | data/public-lexical/by-license/project-cc0.jsonl |
| Wikidata CC0 | 7786 | data/public-lexical/by-license/wikidata-cc0.jsonl |
| OpenScriptures CC BY 4.0 | 28353 | data/public-lexical/by-license/openscriptures-cc-by-4.jsonl |
| Kaikki/Wiktionary CC BY-SA/GFDL | 986 | data/public-lexical/by-license/kaikki-wiktionary-cc-by-sa-gfdl.jsonl |
| Combined CC0-only CSV | 8257 | data/public-lexical/by-license/cc0-only.csv |

CSV mirrors are available beside the JSONL files. The CSV files are meant for spreadsheet import or AI-assisted workflows that prefer flat rows.

All claim rows are also available as `data/public-lexical/all-claims.csv`, with deterministic confidence columns attached.

## Token Status CSVs

| Work | Unique token rows | CSV |
| --- | ---: | --- |
| orot | 17307 | data/public-lexical/by-work/orot-token-status.csv |
| aggadat-bereshit | 8840 | data/public-lexical/by-work/aggadat-bereshit-token-status.csv |

Token-status CSVs include unresolved forms explicitly. An unresolved row means `No lexical entry yet`, not a hidden translation or inferred definition.

For AI-assisted workflows, use the `*-ai-options-min60.csv` files. They include every token row, but only expose `safe_export_rendering_options` when a Strict Hebrew or Strict Aramaic public claim is at least 60% confident.

| Work | Unique token rows | AI options CSV |
| --- | ---: | --- |
| orot | 17307 | data/public-lexical/by-work/orot-ai-options-min60.csv |
| aggadat-bereshit | 8840 | data/public-lexical/by-work/aggadat-bereshit-ai-options-min60.csv |

## Compact Per-Work Token Claim CSVs

A compact `*-token-claims-min60.csv` file was generated for every work with a token index. These files avoid duplicating full source rows per work; they include Strict Hebrew / Strict Aramaic claim IDs, rendering options, and compact license columns when the claim clears the confidence threshold, and they point back to the sitewide claim index for full row details.

| Work | Token rows | Safe token rows | CSV |
| --- | ---: | ---: | --- |
| abarbanel-on-guide-for-the-perplexed | 18288 | 2617 | data/public-lexical/by-work/abarbanel-on-guide-for-the-perplexed-token-claims-min60.csv |
| abudarham | 27125 | 3093 | data/public-lexical/by-work/abudarham-token-claims-min60.csv |
| aderet-eliyahu | 3711 | 752 | data/public-lexical/by-work/aderet-eliyahu-token-claims-min60.csv |
| aggadat-bereshit | 8840 | 1458 | data/public-lexical/by-work/aggadat-bereshit-token-claims-min60.csv |
| ahavat-chesed | 12409 | 1748 | data/public-lexical/by-work/ahavat-chesed-token-claims-min60.csv |
| akeidat-yitzchak | 91170 | 7805 | data/public-lexical/by-work/akeidat-yitzchak-token-claims-min60.csv |
| alphabet-of-ben-sira | 4510 | 758 | data/public-lexical/by-work/alphabet-of-ben-sira-token-claims-min60.csv |
| amos | 1437 | 241 | data/public-lexical/by-work/amos-token-claims-min60.csv |
| aramaic-targum-to-ecclesiastes | 2895 | 173 | data/public-lexical/by-work/aramaic-targum-to-ecclesiastes-token-claims-min60.csv |
| aramaic-targum-to-esther | 3063 | 139 | data/public-lexical/by-work/aramaic-targum-to-esther-token-claims-min60.csv |
| aramaic-targum-to-job | 5396 | 203 | data/public-lexical/by-work/aramaic-targum-to-job-token-claims-min60.csv |
| aramaic-targum-to-lamentations | 1797 | 85 | data/public-lexical/by-work/aramaic-targum-to-lamentations-token-claims-min60.csv |
| aramaic-targum-to-proverbs | 4150 | 150 | data/public-lexical/by-work/aramaic-targum-to-proverbs-token-claims-min60.csv |
| aramaic-targum-to-psalms | 9776 | 367 | data/public-lexical/by-work/aramaic-targum-to-psalms-token-claims-min60.csv |
| aramaic-targum-to-ruth | 1183 | 84 | data/public-lexical/by-work/aramaic-targum-to-ruth-token-claims-min60.csv |
| aramaic-targum-to-song-of-songs | 2723 | 137 | data/public-lexical/by-work/aramaic-targum-to-song-of-songs-token-claims-min60.csv |
| arukh-hashulchan | 129023 | 7345 | data/public-lexical/by-work/arukh-hashulchan-token-claims-min60.csv |
| arukh-hashulchan-heatid | 21455 | 1985 | data/public-lexical/by-work/arukh-hashulchan-heatid-token-claims-min60.csv |
| asarah-perakim-leramchal | 1799 | 326 | data/public-lexical/by-work/asarah-perakim-leramchal-token-claims-min60.csv |
| avodat-hakodesh | 9349 | 1160 | data/public-lexical/by-work/avodat-hakodesh-token-claims-min60.csv |
| avodat-yisrael | 27524 | 3274 | data/public-lexical/by-work/avodat-yisrael-token-claims-min60.csv |
| avot-derabbi-natan | 7948 | 1278 | data/public-lexical/by-work/avot-derabbi-natan-token-claims-min60.csv |
| azharot-of-solomon-ibn-gabirol | 2031 | 333 | data/public-lexical/by-work/azharot-of-solomon-ibn-gabirol-token-claims-min60.csv |
| baalei-hanefesh | 8247 | 1036 | data/public-lexical/by-work/baalei-hanefesh-token-claims-min60.csv |
| bechinat-olam | 4556 | 783 | data/public-lexical/by-work/bechinat-olam-token-claims-min60.csv |
| beit-aharon | 25863 | 3390 | data/public-lexical/by-work/beit-aharon-token-claims-min60.csv |
| beit-elohim | 29766 | 3696 | data/public-lexical/by-work/beit-elohim-token-claims-min60.csv |
| beit-yosef | 124127 | 5967 | data/public-lexical/by-work/beit-yosef-token-claims-min60.csv |
| ben-ish-hai | 28204 | 3335 | data/public-lexical/by-work/ben-ish-hai-token-claims-min60.csv |
| ben-sira | 5302 | 966 | data/public-lexical/by-work/ben-sira-token-claims-min60.csv |
| beur-eser-sefirot | 1405 | 365 | data/public-lexical/by-work/beur-eser-sefirot-token-claims-min60.csv |
| beur-hagra-on-jerusalem-talmud-bikkurim | 2487 | 371 | data/public-lexical/by-work/beur-hagra-on-jerusalem-talmud-bikkurim-token-claims-min60.csv |
| beur-hagra-on-jerusalem-talmud-challah | 3544 | 458 | data/public-lexical/by-work/beur-hagra-on-jerusalem-talmud-challah-token-claims-min60.csv |
| beur-hagra-on-shulchan-arukh-choshen-mishpat | 1106 | 175 | data/public-lexical/by-work/beur-hagra-on-shulchan-arukh-choshen-mishpat-token-claims-min60.csv |
| beur-hagra-on-shulchan-arukh-even-haezer | 2159 | 289 | data/public-lexical/by-work/beur-hagra-on-shulchan-arukh-even-haezer-token-claims-min60.csv |
| beur-hagra-on-shulchan-arukh-orach-chayim | 12656 | 1191 | data/public-lexical/by-work/beur-hagra-on-shulchan-arukh-orach-chayim-token-claims-min60.csv |
| beur-hagra-on-shulchan-arukh-yoreh-deah | 25673 | 1908 | data/public-lexical/by-work/beur-hagra-on-shulchan-arukh-yoreh-deah-token-claims-min60.csv |
| beur-hagra-on-sifra-detzniuta | 10860 | 1368 | data/public-lexical/by-work/beur-hagra-on-sifra-detzniuta-token-claims-min60.csv |
| beur-haradal-on-pirkei-derabbi-eliezer | 41996 | 4136 | data/public-lexical/by-work/beur-haradal-on-pirkei-derabbi-eliezer-token-claims-min60.csv |
| beur-hareem-on-midrash-lekach-tov | 13211 | 1772 | data/public-lexical/by-work/beur-hareem-on-midrash-lekach-tov-token-claims-min60.csv |
| binat-adam | 16884 | 1465 | data/public-lexical/by-work/binat-adam-token-claims-min60.csv |
| biur-halacha | 37783 | 2950 | data/public-lexical/by-work/biur-halacha-token-claims-min60.csv |
| bnei-yissaschar | 43992 | 3784 | data/public-lexical/by-work/bnei-yissaschar-token-claims-min60.csv |
| book-of-jubilees | 6786 | 1091 | data/public-lexical/by-work/book-of-jubilees-token-claims-min60.csv |
| book-of-judith | 2919 | 552 | data/public-lexical/by-work/book-of-judith-token-claims-min60.csv |
| book-of-tobit | 1798 | 385 | data/public-lexical/by-work/book-of-tobit-token-claims-min60.csv |
| chafetz-chaim | 6988 | 1299 | data/public-lexical/by-work/chafetz-chaim-token-claims-min60.csv |
| chafetz-chaim-on-sifra | 29588 | 2926 | data/public-lexical/by-work/chafetz-chaim-on-sifra-token-claims-min60.csv |
| chayyei-adam | 31497 | 2851 | data/public-lexical/by-work/chayyei-adam-token-claims-min60.csv |
| chesed-leavraham | 22564 | 3020 | data/public-lexical/by-work/chesed-leavraham-token-claims-min60.csv |
| chokhmat-adam | 31659 | 2602 | data/public-lexical/by-work/chokhmat-adam-token-claims-min60.csv |
| crescas-on-guide-for-the-perplexed | 2767 | 545 | data/public-lexical/by-work/crescas-on-guide-for-the-perplexed-token-claims-min60.csv |
| daniel | 4269 | 499 | data/public-lexical/by-work/daniel-token-claims-min60.csv |
| darkhei-moshe | 27364 | 2247 | data/public-lexical/by-work/darkhei-moshe-token-claims-min60.csv |
| darkhei-yesharim | 3316 | 630 | data/public-lexical/by-work/darkhei-yesharim-token-claims-min60.csv |
| degel-machaneh-ephraim | 21055 | 2794 | data/public-lexical/by-work/degel-machaneh-ephraim-token-claims-min60.csv |
| derech-etz-chayim-ramchal | 2409 | 528 | data/public-lexical/by-work/derech-etz-chayim-ramchal-token-claims-min60.csv |
| derekh-hashem | 7432 | 1283 | data/public-lexical/by-work/derekh-hashem-token-claims-min60.csv |
| deuteronomy | 8113 | 1334 | data/public-lexical/by-work/deuteronomy-token-claims-min60.csv |
| divrei-emet | 13953 | 2037 | data/public-lexical/by-work/divrei-emet-token-claims-min60.csv |
| drisha | 62857 | 3807 | data/public-lexical/by-work/drisha-token-claims-min60.csv |
| duties-of-the-heart | 7383 | 1340 | data/public-lexical/by-work/duties-of-the-heart-token-claims-min60.csv |
| ecclesiastes | 2047 | 442 | data/public-lexical/by-work/ecclesiastes-token-claims-min60.csv |
| efodi-on-guide-for-the-perplexed | 2110 | 416 | data/public-lexical/by-work/efodi-on-guide-for-the-perplexed-token-claims-min60.csv |
| eight-chapters | 3852 | 651 | data/public-lexical/by-work/eight-chapters-token-claims-min60.csv |
| eikhah-rabbah | 8321 | 1184 | data/public-lexical/by-work/eikhah-rabbah-token-claims-min60.csv |
| ein-yaakov | 70278 | 6868 | data/public-lexical/by-work/ein-yaakov-token-claims-min60.csv |
| essay-on-fundamentals | 1867 | 400 | data/public-lexical/by-work/essay-on-fundamentals-token-claims-min60.csv |
| esther | 1962 | 311 | data/public-lexical/by-work/esther-token-claims-min60.csv |
| etz-yosef-on-bamidbar-rabbah | 3554 | 724 | data/public-lexical/by-work/etz-yosef-on-bamidbar-rabbah-token-claims-min60.csv |
| etz-yosef-on-bereishit-rabbah | 7900 | 1269 | data/public-lexical/by-work/etz-yosef-on-bereishit-rabbah-token-claims-min60.csv |
| etz-yosef-on-devarim-rabbah | 1541 | 338 | data/public-lexical/by-work/etz-yosef-on-devarim-rabbah-token-claims-min60.csv |
| etz-yosef-on-eichah-rabbah | 6435 | 1037 | data/public-lexical/by-work/etz-yosef-on-eichah-rabbah-token-claims-min60.csv |
| etz-yosef-on-esther-rabbah | 2889 | 515 | data/public-lexical/by-work/etz-yosef-on-esther-rabbah-token-claims-min60.csv |
| etz-yosef-on-kohelet-rabbah | 13312 | 1802 | data/public-lexical/by-work/etz-yosef-on-kohelet-rabbah-token-claims-min60.csv |
| etz-yosef-on-ruth-rabbah | 1387 | 322 | data/public-lexical/by-work/etz-yosef-on-ruth-rabbah-token-claims-min60.csv |
| etz-yosef-on-shemot-rabbah | 6882 | 1211 | data/public-lexical/by-work/etz-yosef-on-shemot-rabbah-token-claims-min60.csv |
| etz-yosef-on-shir-hashirim-rabbah | 20691 | 2652 | data/public-lexical/by-work/etz-yosef-on-shir-hashirim-rabbah-token-claims-min60.csv |
| etz-yosef-on-vayikra-rabbah | 7738 | 1246 | data/public-lexical/by-work/etz-yosef-on-vayikra-rabbah-token-claims-min60.csv |
| exodus | 8879 | 1289 | data/public-lexical/by-work/exodus-token-claims-min60.csv |
| ezekiel | 10759 | 1748 | data/public-lexical/by-work/ezekiel-token-claims-min60.csv |
| ezra | 2665 | 305 | data/public-lexical/by-work/ezra-token-claims-min60.csv |
| genesis | 11363 | 1625 | data/public-lexical/by-work/genesis-token-claims-min60.csv |
| gra-on-pirkei-avot | 419 | 86 | data/public-lexical/by-work/gra-on-pirkei-avot-token-claims-min60.csv |
| gras-nuschah-on-avot-drabbi-natan | 387 | 94 | data/public-lexical/by-work/gras-nuschah-on-avot-drabbi-natan-token-claims-min60.csv |
| gras-nuschah-on-tractate-derekh-eretz-rabbah | 121 | 29 | data/public-lexical/by-work/gras-nuschah-on-tractate-derekh-eretz-rabbah-token-claims-min60.csv |
| gras-nuschah-on-tractate-derekh-eretz-zuta | 24 | 9 | data/public-lexical/by-work/gras-nuschah-on-tractate-derekh-eretz-zuta-token-claims-min60.csv |
| gras-nuschah-on-tractate-kallah | 36 | 12 | data/public-lexical/by-work/gras-nuschah-on-tractate-kallah-token-claims-min60.csv |
| gras-nuschah-on-tractate-semachot | 110 | 27 | data/public-lexical/by-work/gras-nuschah-on-tractate-semachot-token-claims-min60.csv |
| gras-nuschah-on-tractate-soferim | 236 | 66 | data/public-lexical/by-work/gras-nuschah-on-tractate-soferim-token-claims-min60.csv |
| habakkuk | 578 | 115 | data/public-lexical/by-work/habakkuk-token-claims-min60.csv |
| haemunot-vehadeot | 9840 | 1572 | data/public-lexical/by-work/haemunot-vehadeot-token-claims-min60.csv |
| haggai | 406 | 87 | data/public-lexical/by-work/haggai-token-claims-min60.csv |
| hagra-on-sefer-yetzirah-gra-version | 2250 | 410 | data/public-lexical/by-work/hagra-on-sefer-yetzirah-gra-version-token-claims-min60.csv |
| hosea | 1828 | 327 | data/public-lexical/by-work/hosea-token-claims-min60.csv |
| i-chronicles | 6945 | 928 | data/public-lexical/by-work/i-chronicles-token-claims-min60.csv |
| i-kings | 7590 | 1151 | data/public-lexical/by-work/i-kings-token-claims-min60.csv |
| i-samuel | 7707 | 1220 | data/public-lexical/by-work/i-samuel-token-claims-min60.csv |
| ibn-ezra-on-deuteronomy | 6269 | 1087 | data/public-lexical/by-work/ibn-ezra-on-deuteronomy-token-claims-min60.csv |
| ibn-ezra-on-exodus | 12802 | 1927 | data/public-lexical/by-work/ibn-ezra-on-exodus-token-claims-min60.csv |
| ibn-ezra-on-genesis | 8896 | 1449 | data/public-lexical/by-work/ibn-ezra-on-genesis-token-claims-min60.csv |
| ibn-ezra-on-leviticus | 5811 | 963 | data/public-lexical/by-work/ibn-ezra-on-leviticus-token-claims-min60.csv |
| ibn-ezra-on-numbers | 5377 | 925 | data/public-lexical/by-work/ibn-ezra-on-numbers-token-claims-min60.csv |
| ibn-ezra-on-zechariah | 2593 | 579 | data/public-lexical/by-work/ibn-ezra-on-zechariah-token-claims-min60.csv |
| iggeret-hagra | 1069 | 241 | data/public-lexical/by-work/iggeret-hagra-token-claims-min60.csv |
| iggeret-haramban | 365 | 95 | data/public-lexical/by-work/iggeret-haramban-token-claims-min60.csv |
| ii-chronicles | 8092 | 1337 | data/public-lexical/by-work/ii-chronicles-token-claims-min60.csv |
| ii-kings | 6901 | 1057 | data/public-lexical/by-work/ii-kings-token-claims-min60.csv |
| ii-samuel | 6700 | 1025 | data/public-lexical/by-work/ii-samuel-token-claims-min60.csv |
| imrei-binah | 16589 | 2031 | data/public-lexical/by-work/imrei-binah-token-claims-min60.csv |
| isaiah | 11650 | 1893 | data/public-lexical/by-work/isaiah-token-claims-min60.csv |
| jeremiah | 12098 | 1882 | data/public-lexical/by-work/jeremiah-token-claims-min60.csv |
| jerusalem-talmud-taanit | 2188 | 359 | data/public-lexical/by-work/jerusalem-talmud-taanit-token-claims-min60.csv |
| job | 5899 | 757 | data/public-lexical/by-work/job-token-claims-min60.csv |
| joel | 776 | 170 | data/public-lexical/by-work/joel-token-claims-min60.csv |
| jonah | 525 | 103 | data/public-lexical/by-work/jonah-token-claims-min60.csv |
| joshua | 5856 | 988 | data/public-lexical/by-work/joshua-token-claims-min60.csv |
| judges | 6131 | 982 | data/public-lexical/by-work/judges-token-claims-min60.csv |
| kad-hakemach | 27555 | 3488 | data/public-lexical/by-work/kad-hakemach-token-claims-min60.csv |
| kalach-pitchei-chokhmah | 9569 | 1579 | data/public-lexical/by-work/kalach-pitchei-chokhmah-token-claims-min60.csv |
| ketem-paz-on-zohar | 57156 | 5026 | data/public-lexical/by-work/ketem-paz-on-zohar-token-claims-min60.csv |
| keter-malkhut | 2394 | 494 | data/public-lexical/by-work/keter-malkhut-token-claims-min60.csv |
| kinnot-for-tisha-bav-ashkenaz | 8346 | 1081 | data/public-lexical/by-work/kinnot-for-tisha-bav-ashkenaz-token-claims-min60.csv |
| kitzur-shulchan-arukh | 28587 | 3456 | data/public-lexical/by-work/kitzur-shulchan-arukh-token-claims-min60.csv |
| kohelet-rabbah | 2205 | 428 | data/public-lexical/by-work/kohelet-rabbah-token-claims-min60.csv |
| kol-hator | 4308 | 843 | data/public-lexical/by-work/kol-hator-token-claims-min60.csv |
| kuzari | 15998 | 2566 | data/public-lexical/by-work/kuzari-token-claims-min60.csv |
| lamentations | 1264 | 222 | data/public-lexical/by-work/lamentations-token-claims-min60.csv |
| lekha-dodi | 119 | 30 | data/public-lexical/by-work/lekha-dodi-token-claims-min60.csv |
| letter-from-ramban-to-his-son | 883 | 227 | data/public-lexical/by-work/letter-from-ramban-to-his-son-token-claims-min60.csv |
| letter-of-aristeas | 4299 | 745 | data/public-lexical/by-work/letter-of-aristeas-token-claims-min60.csv |
| letter-to-the-ten-lost-tribes-of-israel | 2106 | 469 | data/public-lexical/by-work/letter-to-the-ten-lost-tribes-of-israel-token-claims-min60.csv |
| leviticus | 6089 | 822 | data/public-lexical/by-work/leviticus-token-claims-min60.csv |
| maalot-hamiddot | 15700 | 2103 | data/public-lexical/by-work/maalot-hamiddot-token-claims-min60.csv |
| maamar-hador | 1965 | 485 | data/public-lexical/by-work/maamar-hador-token-claims-min60.csv |
| maamar-torat-habayit | 6863 | 1210 | data/public-lexical/by-work/maamar-torat-habayit-token-claims-min60.csv |
| maaneh-lashon-chabad | 3971 | 637 | data/public-lexical/by-work/maaneh-lashon-chabad-token-claims-min60.csv |
| maaseh-rav | 2700 | 454 | data/public-lexical/by-work/maaseh-rav-token-claims-min60.csv |
| maaseh-rokeach-on-mishnah | 15665 | 2000 | data/public-lexical/by-work/maaseh-rokeach-on-mishnah-token-claims-min60.csv |
| maavar-yabbok | 41276 | 5320 | data/public-lexical/by-work/maavar-yabbok-token-claims-min60.csv |
| maggid-devarav-leyaakov | 11428 | 1861 | data/public-lexical/by-work/maggid-devarav-leyaakov-token-claims-min60.csv |
| maggid-meisharim | 20513 | 1822 | data/public-lexical/by-work/maggid-meisharim-token-claims-min60.csv |
| maharzu-hakatzar-on-bereshit-rabbah | 198 | 60 | data/public-lexical/by-work/maharzu-hakatzar-on-bereshit-rabbah-token-claims-min60.csv |
| malachi | 676 | 146 | data/public-lexical/by-work/malachi-token-claims-min60.csv |
| maor-vashemesh | 37461 | 4162 | data/public-lexical/by-work/maor-vashemesh-token-claims-min60.csv |
| marbeh-lesaper-on-pesach-haggadah | 12833 | 1680 | data/public-lexical/by-work/marbeh-lesaper-on-pesach-haggadah-token-claims-min60.csv |
| marpeh-lanefesh | 5271 | 951 | data/public-lexical/by-work/marpeh-lanefesh-token-claims-min60.csv |
| matnot-kehunah-on-bamidbar-rabbah | 1378 | 305 | data/public-lexical/by-work/matnot-kehunah-on-bamidbar-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-bereshit-rabbah | 3705 | 664 | data/public-lexical/by-work/matnot-kehunah-on-bereshit-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-devarim-rabbah | 454 | 112 | data/public-lexical/by-work/matnot-kehunah-on-devarim-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-eichah-rabbah | 2981 | 517 | data/public-lexical/by-work/matnot-kehunah-on-eichah-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-esther-rabbah | 558 | 131 | data/public-lexical/by-work/matnot-kehunah-on-esther-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-kohelet-rabbah | 7005 | 1096 | data/public-lexical/by-work/matnot-kehunah-on-kohelet-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-ruth-rabbah | 594 | 144 | data/public-lexical/by-work/matnot-kehunah-on-ruth-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-shemot-rabbah | 1632 | 347 | data/public-lexical/by-work/matnot-kehunah-on-shemot-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-shir-hashirim-rabbah | 7681 | 1134 | data/public-lexical/by-work/matnot-kehunah-on-shir-hashirim-rabbah-token-claims-min60.csv |
| matnot-kehunah-on-vayikra-rabbah | 2518 | 441 | data/public-lexical/by-work/matnot-kehunah-on-vayikra-rabbah-token-claims-min60.csv |
| megalleh-amukkot-on-parashat-vaetchanan | 15768 | 1971 | data/public-lexical/by-work/megalleh-amukkot-on-parashat-vaetchanan-token-claims-min60.csv |
| megillat-taanit | 2491 | 426 | data/public-lexical/by-work/megillat-taanit-token-claims-min60.csv |
| menorat-hamaor | 44414 | 4320 | data/public-lexical/by-work/menorat-hamaor-token-claims-min60.csv |
| meor-einayim | 21489 | 2898 | data/public-lexical/by-work/meor-einayim-token-claims-min60.csv |
| mesillat-yesharim | 9603 | 1603 | data/public-lexical/by-work/mesillat-yesharim-token-claims-min60.csv |
| micah | 1144 | 207 | data/public-lexical/by-work/micah-token-claims-min60.csv |
| midbar-shur | 19798 | 2979 | data/public-lexical/by-work/midbar-shur-token-claims-min60.csv |
| midrash-aggadah | 20618 | 2642 | data/public-lexical/by-work/midrash-aggadah-token-claims-min60.csv |
| midrash-bechiddush-on-pesach-haggadah | 8662 | 1371 | data/public-lexical/by-work/midrash-bechiddush-on-pesach-haggadah-token-claims-min60.csv |
| midrash-haittamari | 23927 | 3091 | data/public-lexical/by-work/midrash-haittamari-token-claims-min60.csv |
| midrash-lekach-tov | 41646 | 4214 | data/public-lexical/by-work/midrash-lekach-tov-token-claims-min60.csv |
| midrash-lekach-tov-on-ecclesiastes | 421 | 125 | data/public-lexical/by-work/midrash-lekach-tov-on-ecclesiastes-token-claims-min60.csv |
| midrash-lekach-tov-on-esther | 1030 | 231 | data/public-lexical/by-work/midrash-lekach-tov-on-esther-token-claims-min60.csv |
| midrash-lekach-tov-on-lamentations | 757 | 184 | data/public-lexical/by-work/midrash-lekach-tov-on-lamentations-token-claims-min60.csv |
| midrash-lekach-tov-on-ruth | 759 | 204 | data/public-lexical/by-work/midrash-lekach-tov-on-ruth-token-claims-min60.csv |
| midrash-lekach-tov-on-song-of-songs | 787 | 205 | data/public-lexical/by-work/midrash-lekach-tov-on-song-of-songs-token-claims-min60.csv |
| midrash-pinchas | 8709 | 1387 | data/public-lexical/by-work/midrash-pinchas-token-claims-min60.csv |
| midrash-sekhel-tov | 38876 | 3664 | data/public-lexical/by-work/midrash-sekhel-tov-token-claims-min60.csv |
| midrash-shmuel | 7023 | 1134 | data/public-lexical/by-work/midrash-shmuel-token-claims-min60.csv |
| midrash-shmuel-on-avot | 28325 | 3620 | data/public-lexical/by-work/midrash-shmuel-on-avot-token-claims-min60.csv |
| midrash-tanchuma | 37138 | 4614 | data/public-lexical/by-work/midrash-tanchuma-token-claims-min60.csv |
| midrash-tanchuma-buber | 26484 | 3098 | data/public-lexical/by-work/midrash-tanchuma-buber-token-claims-min60.csv |
| midrash-tannaim-on-deuteronomy | 2712 | 530 | data/public-lexical/by-work/midrash-tannaim-on-deuteronomy-token-claims-min60.csv |
| midrash-tehillim | 20099 | 2617 | data/public-lexical/by-work/midrash-tehillim-token-claims-min60.csv |
| midrash-yelamdenu-selections-from-yalkut-talmud-torah | 523 | 117 | data/public-lexical/by-work/midrash-yelamdenu-selections-from-yalkut-talmud-torah-token-claims-min60.csv |
| mikdash-melekh-on-zohar | 42974 | 3860 | data/public-lexical/by-work/mikdash-melekh-on-zohar-token-claims-min60.csv |
| minchat-kenaot | 23023 | 2946 | data/public-lexical/by-work/minchat-kenaot-token-claims-min60.csv |
| mishnah-arakhin | 1052 | 186 | data/public-lexical/by-work/mishnah-arakhin-token-claims-min60.csv |
| mishnah-avodah-zarah | 1041 | 187 | data/public-lexical/by-work/mishnah-avodah-zarah-token-claims-min60.csv |
| mishnah-bava-batra | 1619 | 263 | data/public-lexical/by-work/mishnah-bava-batra-token-claims-min60.csv |
| mishnah-bava-kamma | 1488 | 248 | data/public-lexical/by-work/mishnah-bava-kamma-token-claims-min60.csv |
| mishnah-bava-metzia | 1752 | 264 | data/public-lexical/by-work/mishnah-bava-metzia-token-claims-min60.csv |
| mishnah-beitzah | 725 | 141 | data/public-lexical/by-work/mishnah-beitzah-token-claims-min60.csv |
| mishnah-bekhorot | 1437 | 233 | data/public-lexical/by-work/mishnah-bekhorot-token-claims-min60.csv |
| mishnah-berakhot | 972 | 231 | data/public-lexical/by-work/mishnah-berakhot-token-claims-min60.csv |
| mishnah-bikkurim | 700 | 144 | data/public-lexical/by-work/mishnah-bikkurim-token-claims-min60.csv |
| mishnah-chagigah | 473 | 94 | data/public-lexical/by-work/mishnah-chagigah-token-claims-min60.csv |
| mishnah-challah | 632 | 109 | data/public-lexical/by-work/mishnah-challah-token-claims-min60.csv |
| mishnah-chullin | 1499 | 249 | data/public-lexical/by-work/mishnah-chullin-token-claims-min60.csv |
| mishnah-demai | 749 | 137 | data/public-lexical/by-work/mishnah-demai-token-claims-min60.csv |
| mishnah-eduyot | 1529 | 273 | data/public-lexical/by-work/mishnah-eduyot-token-claims-min60.csv |
| mishnah-eruvin | 1360 | 247 | data/public-lexical/by-work/mishnah-eruvin-token-claims-min60.csv |
| mishnah-gittin | 1360 | 243 | data/public-lexical/by-work/mishnah-gittin-token-claims-min60.csv |
| mishnah-horayot | 403 | 91 | data/public-lexical/by-work/mishnah-horayot-token-claims-min60.csv |
| mishnah-kelim | 3054 | 378 | data/public-lexical/by-work/mishnah-kelim-token-claims-min60.csv |
| mishnah-keritot | 943 | 180 | data/public-lexical/by-work/mishnah-keritot-token-claims-min60.csv |
| mishnah-ketubot | 1698 | 269 | data/public-lexical/by-work/mishnah-ketubot-token-claims-min60.csv |
| mishnah-kiddushin | 905 | 173 | data/public-lexical/by-work/mishnah-kiddushin-token-claims-min60.csv |
| mishnah-kilayim | 1071 | 186 | data/public-lexical/by-work/mishnah-kilayim-token-claims-min60.csv |
| mishnah-kinnim | 363 | 74 | data/public-lexical/by-work/mishnah-kinnim-token-claims-min60.csv |
| mishnah-maaser-sheni | 961 | 188 | data/public-lexical/by-work/mishnah-maaser-sheni-token-claims-min60.csv |
| mishnah-maasrot | 747 | 129 | data/public-lexical/by-work/mishnah-maasrot-token-claims-min60.csv |
| mishnah-makhshirin | 844 | 159 | data/public-lexical/by-work/mishnah-makhshirin-token-claims-min60.csv |
| mishnah-makkot | 969 | 196 | data/public-lexical/by-work/mishnah-makkot-token-claims-min60.csv |
| mishnah-megillah | 704 | 130 | data/public-lexical/by-work/mishnah-megillah-token-claims-min60.csv |
| mishnah-meilah | 674 | 107 | data/public-lexical/by-work/mishnah-meilah-token-claims-min60.csv |
| mishnah-menachot | 1766 | 288 | data/public-lexical/by-work/mishnah-menachot-token-claims-min60.csv |
| mishnah-middot | 994 | 198 | data/public-lexical/by-work/mishnah-middot-token-claims-min60.csv |
| mishnah-mikvaot | 1185 | 227 | data/public-lexical/by-work/mishnah-mikvaot-token-claims-min60.csv |
| mishnah-moed-katan | 440 | 75 | data/public-lexical/by-work/mishnah-moed-katan-token-claims-min60.csv |
| mishnah-nazir | 1032 | 190 | data/public-lexical/by-work/mishnah-nazir-token-claims-min60.csv |
| mishnah-nedarim | 1562 | 258 | data/public-lexical/by-work/mishnah-nedarim-token-claims-min60.csv |
| mishnah-negaim | 1685 | 286 | data/public-lexical/by-work/mishnah-negaim-token-claims-min60.csv |
| mishnah-niddah | 1229 | 210 | data/public-lexical/by-work/mishnah-niddah-token-claims-min60.csv |
| mishnah-oholot | 1672 | 285 | data/public-lexical/by-work/mishnah-oholot-token-claims-min60.csv |
| mishnah-orlah | 469 | 76 | data/public-lexical/by-work/mishnah-orlah-token-claims-min60.csv |
| mishnah-parah | 1484 | 244 | data/public-lexical/by-work/mishnah-parah-token-claims-min60.csv |
| mishnah-peah | 1057 | 208 | data/public-lexical/by-work/mishnah-peah-token-claims-min60.csv |
| mishnah-pesachim | 1653 | 302 | data/public-lexical/by-work/mishnah-pesachim-token-claims-min60.csv |
| mishnah-rosh-hashanah | 806 | 162 | data/public-lexical/by-work/mishnah-rosh-hashanah-token-claims-min60.csv |
| mishnah-sanhedrin | 1953 | 361 | data/public-lexical/by-work/mishnah-sanhedrin-token-claims-min60.csv |
| mishnah-shabbat | 2239 | 333 | data/public-lexical/by-work/mishnah-shabbat-token-claims-min60.csv |
| mishnah-shekalim | 1129 | 191 | data/public-lexical/by-work/mishnah-shekalim-token-claims-min60.csv |
| mishnah-sheviit | 1379 | 214 | data/public-lexical/by-work/mishnah-sheviit-token-claims-min60.csv |
| mishnah-shevuot | 1010 | 173 | data/public-lexical/by-work/mishnah-shevuot-token-claims-min60.csv |
| mishnah-sotah | 1795 | 353 | data/public-lexical/by-work/mishnah-sotah-token-claims-min60.csv |
| mishnah-sukkah | 1015 | 198 | data/public-lexical/by-work/mishnah-sukkah-token-claims-min60.csv |
| mishnah-taanit | 886 | 195 | data/public-lexical/by-work/mishnah-taanit-token-claims-min60.csv |
| mishnah-tahorot | 1266 | 197 | data/public-lexical/by-work/mishnah-tahorot-token-claims-min60.csv |
| mishnah-tamid | 1078 | 222 | data/public-lexical/by-work/mishnah-tamid-token-claims-min60.csv |
| mishnah-temurah | 761 | 138 | data/public-lexical/by-work/mishnah-temurah-token-claims-min60.csv |
| mishnah-terumot | 1266 | 211 | data/public-lexical/by-work/mishnah-terumot-token-claims-min60.csv |
| mishnah-tevul-yom | 493 | 87 | data/public-lexical/by-work/mishnah-tevul-yom-token-claims-min60.csv |
| mishnah-yadayim | 705 | 143 | data/public-lexical/by-work/mishnah-yadayim-token-claims-min60.csv |
| mishnah-yevamot | 1718 | 310 | data/public-lexical/by-work/mishnah-yevamot-token-claims-min60.csv |
| mishnah-yoma | 1341 | 270 | data/public-lexical/by-work/mishnah-yoma-token-claims-min60.csv |
| mishnah-zavim | 627 | 117 | data/public-lexical/by-work/mishnah-zavim-token-claims-min60.csv |
| mishnah-zevachim | 1568 | 285 | data/public-lexical/by-work/mishnah-zevachim-token-claims-min60.csv |
| mishnat-derabbi-eliezer-on-eichah-rabbah | 407 | 97 | data/public-lexical/by-work/mishnat-derabbi-eliezer-on-eichah-rabbah-token-claims-min60.csv |
| mishnat-derabbi-eliezer-on-ruth-rabbah | 46 | 13 | data/public-lexical/by-work/mishnat-derabbi-eliezer-on-ruth-rabbah-token-claims-min60.csv |
| mishnat-rabbi-eliezer | 12809 | 1908 | data/public-lexical/by-work/mishnat-rabbi-eliezer-token-claims-min60.csv |
| mitpachat-sefarim | 3139 | 563 | data/public-lexical/by-work/mitpachat-sefarim-token-claims-min60.csv |
| mivchar-hapeninim | 3756 | 631 | data/public-lexical/by-work/mivchar-hapeninim-token-claims-min60.csv |
| moreh-nevukhei-hazeman | 35370 | 4548 | data/public-lexical/by-work/moreh-nevukhei-hazeman-token-claims-min60.csv |
| musar-avikha | 567 | 148 | data/public-lexical/by-work/musar-avikha-token-claims-min60.csv |
| naftali-seva-ratzon-on-pesach-haggadah | 6511 | 927 | data/public-lexical/by-work/naftali-seva-ratzon-on-pesach-haggadah-token-claims-min60.csv |
| nahum | 503 | 83 | data/public-lexical/by-work/nahum-token-claims-min60.csv |
| narboni-on-guide-for-the-perplexed | 14869 | 2135 | data/public-lexical/by-work/narboni-on-guide-for-the-perplexed-token-claims-min60.csv |
| nefesh-hachayim | 4430 | 813 | data/public-lexical/by-work/nefesh-hachayim-token-claims-min60.csv |
| nehemiah | 3818 | 619 | data/public-lexical/by-work/nehemiah-token-claims-min60.csv |
| nineteen-letters | 7959 | 1610 | data/public-lexical/by-work/nineteen-letters-token-claims-min60.csv |
| nishmat-chayyim | 27764 | 3187 | data/public-lexical/by-work/nishmat-chayyim-token-claims-min60.csv |
| noam-elimelekh | 24792 | 3413 | data/public-lexical/by-work/noam-elimelekh-token-claims-min60.csv |
| notes-and-corrections-on-midrash-aggadah | 12167 | 1647 | data/public-lexical/by-work/notes-and-corrections-on-midrash-aggadah-token-claims-min60.csv |
| notes-and-corrections-on-midrash-lekach-tov | 19908 | 2263 | data/public-lexical/by-work/notes-and-corrections-on-midrash-lekach-tov-token-claims-min60.csv |
| notes-and-corrections-on-midrash-lekach-tov-on-esther | 1178 | 212 | data/public-lexical/by-work/notes-and-corrections-on-midrash-lekach-tov-on-esther-token-claims-min60.csv |
| numbers | 8225 | 1178 | data/public-lexical/by-work/numbers-token-claims-min60.csv |
| obadiah | 237 | 37 | data/public-lexical/by-work/obadiah-token-claims-min60.csv |
| ohev-yisrael | 24208 | 3114 | data/public-lexical/by-work/ohev-yisrael-token-claims-min60.csv |
| ohr-hachammah-on-zohar | 102152 | 6954 | data/public-lexical/by-work/ohr-hachammah-on-zohar-token-claims-min60.csv |
| ohr-hameir | 29885 | 3689 | data/public-lexical/by-work/ohr-hameir-token-claims-min60.csv |
| ohr-hashem | 7563 | 1202 | data/public-lexical/by-work/ohr-hashem-token-claims-min60.csv |
| orchot-chaim-lharosh | 1492 | 302 | data/public-lexical/by-work/orchot-chaim-lharosh-token-claims-min60.csv |
| orchot-tzadikim | 16587 | 2590 | data/public-lexical/by-work/orchot-tzadikim-token-claims-min60.csv |
| orot | 17307 | 4754 | data/public-lexical/by-work/orot-token-claims-min60.csv |
| orot-ha-kodesh | 18735 | 3199 | data/public-lexical/by-work/orot-ha-kodesh-token-claims-min60.csv |
| orot-ha-torah | 807 | 223 | data/public-lexical/by-work/orot-ha-torah-token-claims-min60.csv |
| otzar-midrashim | 56400 | 5773 | data/public-lexical/by-work/otzar-midrashim-token-claims-min60.csv |
| par-echad-on-pirkei-derabbi-eliezer | 5738 | 948 | data/public-lexical/by-work/par-echad-on-pirkei-derabbi-eliezer-token-claims-min60.csv |
| pardes-rimmonim | 38362 | 3971 | data/public-lexical/by-work/pardes-rimmonim-token-claims-min60.csv |
| pat-lechem | 9964 | 1653 | data/public-lexical/by-work/pat-lechem-token-claims-min60.csv |
| pele-yoetz | 27333 | 3259 | data/public-lexical/by-work/pele-yoetz-token-claims-min60.csv |
| peri-etz-hadar | 1947 | 413 | data/public-lexical/by-work/peri-etz-hadar-token-claims-min60.csv |
| peri-haaretz | 12763 | 2012 | data/public-lexical/by-work/peri-haaretz-token-claims-min60.csv |
| peri-tzadik | 57464 | 5169 | data/public-lexical/by-work/peri-tzadik-token-claims-min60.csv |
| perush-maharzu-on-bamidbar-rabbah | 3476 | 698 | data/public-lexical/by-work/perush-maharzu-on-bamidbar-rabbah-token-claims-min60.csv |
| perush-maharzu-on-bereshit-rabbah | 6701 | 1195 | data/public-lexical/by-work/perush-maharzu-on-bereshit-rabbah-token-claims-min60.csv |
| perush-maharzu-on-devarim-rabbah | 1369 | 321 | data/public-lexical/by-work/perush-maharzu-on-devarim-rabbah-token-claims-min60.csv |
| perush-maharzu-on-eichah-rabbah | 3692 | 711 | data/public-lexical/by-work/perush-maharzu-on-eichah-rabbah-token-claims-min60.csv |
| perush-maharzu-on-esther-rabbah | 755 | 169 | data/public-lexical/by-work/perush-maharzu-on-esther-rabbah-token-claims-min60.csv |
| perush-maharzu-on-kohelet-rabbah | 6700 | 1184 | data/public-lexical/by-work/perush-maharzu-on-kohelet-rabbah-token-claims-min60.csv |
| perush-maharzu-on-ruth-rabbah | 883 | 229 | data/public-lexical/by-work/perush-maharzu-on-ruth-rabbah-token-claims-min60.csv |
| perush-maharzu-on-shemot-rabbah | 5256 | 1010 | data/public-lexical/by-work/perush-maharzu-on-shemot-rabbah-token-claims-min60.csv |
| perush-maharzu-on-shir-hashirim-rabbah | 9196 | 1533 | data/public-lexical/by-work/perush-maharzu-on-shir-hashirim-rabbah-token-claims-min60.csv |
| perush-maharzu-on-vayikra-rabbah | 4678 | 897 | data/public-lexical/by-work/perush-maharzu-on-vayikra-rabbah-token-claims-min60.csv |
| pesach-haggadah | 2537 | 532 | data/public-lexical/by-work/pesach-haggadah-token-claims-min60.csv |
| pesikta-derav-kahana | 13970 | 1712 | data/public-lexical/by-work/pesikta-derav-kahana-token-claims-min60.csv |
| pesikta-rabbati | 3103 | 621 | data/public-lexical/by-work/pesikta-rabbati-token-claims-min60.csv |
| pirkei-avot | 2110 | 449 | data/public-lexical/by-work/pirkei-avot-token-claims-min60.csv |
| pirkei-derabbi-eliezer | 11509 | 1824 | data/public-lexical/by-work/pirkei-derabbi-eliezer-token-claims-min60.csv |
| pri-etz-chaim | 9512 | 1467 | data/public-lexical/by-work/pri-etz-chaim-token-claims-min60.csv |
| pri-yitzhak-on-sefer-yetzirah-gra-version | 3472 | 664 | data/public-lexical/by-work/pri-yitzhak-on-sefer-yetzirah-gra-version-token-claims-min60.csv |
| prisha | 53491 | 3829 | data/public-lexical/by-work/prisha-token-claims-min60.csv |
| proverbs | 4705 | 701 | data/public-lexical/by-work/proverbs-token-claims-min60.csv |
| psalms | 12462 | 1934 | data/public-lexical/by-work/psalms-token-claims-min60.csv |
| raavad-on-sefer-yetzirah | 10831 | 1714 | data/public-lexical/by-work/raavad-on-sefer-yetzirah-token-claims-min60.csv |
| raavad-on-sifra | 23139 | 2287 | data/public-lexical/by-work/raavad-on-sifra-token-claims-min60.csv |
| ramban-on-sefer-yetzirah | 1288 | 312 | data/public-lexical/by-work/ramban-on-sefer-yetzirah-token-claims-min60.csv |
| rasag-on-sefer-yetzirah | 2831 | 527 | data/public-lexical/by-work/rasag-on-sefer-yetzirah-token-claims-min60.csv |
| rashi-on-bereshit-rabbah | 2795 | 522 | data/public-lexical/by-work/rashi-on-bereshit-rabbah-token-claims-min60.csv |
| rashi-on-deuteronomy | 10519 | 1734 | data/public-lexical/by-work/rashi-on-deuteronomy-token-claims-min60.csv |
| rashi-on-genesis | 14570 | 2123 | data/public-lexical/by-work/rashi-on-genesis-token-claims-min60.csv |
| rashi-on-leviticus | 9523 | 1438 | data/public-lexical/by-work/rashi-on-leviticus-token-claims-min60.csv |
| rashi-on-numbers | 10778 | 1694 | data/public-lexical/by-work/rashi-on-numbers-token-claims-min60.csv |
| recanati-on-the-torah | 34727 | 3852 | data/public-lexical/by-work/recanati-on-the-torah-token-claims-min60.csv |
| ruth | 999 | 196 | data/public-lexical/by-work/ruth-token-claims-min60.csv |
| ruth-rabbah | 1529 | 342 | data/public-lexical/by-work/ruth-rabbah-token-claims-min60.csv |
| seder-maamadot | 9071 | 1865 | data/public-lexical/by-work/seder-maamadot-token-claims-min60.csv |
| seder-olam-rabbah | 268 | 64 | data/public-lexical/by-work/seder-olam-rabbah-token-claims-min60.csv |
| seder-olam-zutta | 976 | 145 | data/public-lexical/by-work/seder-olam-zutta-token-claims-min60.csv |
| sefat-emet | 39347 | 4659 | data/public-lexical/by-work/sefat-emet-token-claims-min60.csv |
| sefer-etz-chaim | 974 | 263 | data/public-lexical/by-work/sefer-etz-chaim-token-claims-min60.csv |
| sefer-haikkarim | 3708 | 754 | data/public-lexical/by-work/sefer-haikkarim-token-claims-min60.csv |
| sefer-hakanah | 23172 | 2743 | data/public-lexical/by-work/sefer-hakanah-token-claims-min60.csv |
| sefer-hamiddot | 8446 | 1404 | data/public-lexical/by-work/sefer-hamiddot-token-claims-min60.csv |
| sefer-hamitzvot | 11562 | 1585 | data/public-lexical/by-work/sefer-hamitzvot-token-claims-min60.csv |
| sefer-hamitzvot-of-rasag | 1653 | 234 | data/public-lexical/by-work/sefer-hamitzvot-of-rasag-token-claims-min60.csv |
| sefer-hayashar | 7955 | 1355 | data/public-lexical/by-work/sefer-hayashar-token-claims-min60.csv |
| sefer-hayashar-midrash | 11610 | 1593 | data/public-lexical/by-work/sefer-hayashar-midrash-token-claims-min60.csv |
| sefer-mitzvot-gadol | 9213 | 1214 | data/public-lexical/by-work/sefer-mitzvot-gadol-token-claims-min60.csv |
| sefer-mitzvot-katan | 20355 | 1853 | data/public-lexical/by-work/sefer-mitzvot-katan-token-claims-min60.csv |
| sefer-yereim | 28314 | 2488 | data/public-lexical/by-work/sefer-yereim-token-claims-min60.csv |
| sefer-yetzirah | 770 | 149 | data/public-lexical/by-work/sefer-yetzirah-token-claims-min60.csv |
| sefer-yetzirah-gra-version | 743 | 153 | data/public-lexical/by-work/sefer-yetzirah-gra-version-token-claims-min60.csv |
| selichot-edot-hamizrach | 2446 | 449 | data/public-lexical/by-work/selichot-edot-hamizrach-token-claims-min60.csv |
| selichot-nusach-ashkenaz-lita | 14172 | 1949 | data/public-lexical/by-work/selichot-nusach-ashkenaz-lita-token-claims-min60.csv |
| selichot-nusach-polin | 12186 | 1733 | data/public-lexical/by-work/selichot-nusach-polin-token-claims-min60.csv |
| shaar-hagemul-of-the-ramban | 6616 | 1152 | data/public-lexical/by-work/shaar-hagemul-of-the-ramban-token-claims-min60.csv |
| shaar-hagilgulim | 13104 | 1816 | data/public-lexical/by-work/shaar-hagilgulim-token-claims-min60.csv |
| shaar-hahakdamot | 9189 | 1314 | data/public-lexical/by-work/shaar-hahakdamot-token-claims-min60.csv |
| shaar-hakavanot | 10910 | 1530 | data/public-lexical/by-work/shaar-hakavanot-token-claims-min60.csv |
| shaar-hamitzvot | 11959 | 1529 | data/public-lexical/by-work/shaar-hamitzvot-token-claims-min60.csv |
| shaar-hapesukim | 16032 | 2102 | data/public-lexical/by-work/shaar-hapesukim-token-claims-min60.csv |
| shaar-maamarei-rashbi | 19780 | 2189 | data/public-lexical/by-work/shaar-maamarei-rashbi-token-claims-min60.csv |
| shaar-maamarei-razal | 5388 | 907 | data/public-lexical/by-work/shaar-maamarei-razal-token-claims-min60.csv |
| shaar-ruach-hakodesh | 2004 | 369 | data/public-lexical/by-work/shaar-ruach-hakodesh-token-claims-min60.csv |
| shaarei-kedusha | 1732 | 382 | data/public-lexical/by-work/shaarei-kedusha-token-claims-min60.csv |
| shaarei-orah | 13803 | 2029 | data/public-lexical/by-work/shaarei-orah-token-claims-min60.csv |
| shaarei-teshuvah | 11123 | 1840 | data/public-lexical/by-work/shaarei-teshuvah-token-claims-min60.csv |
| shalom-aleichem | 17 | 7 | data/public-lexical/by-work/shalom-aleichem-token-claims-min60.csv |
| shekel-hakodesh | 3741 | 526 | data/public-lexical/by-work/shekel-hakodesh-token-claims-min60.csv |
| shenei-luchot-haberit | 80350 | 6601 | data/public-lexical/by-work/shenei-luchot-haberit-token-claims-min60.csv |
| shevet-musar | 35711 | 4015 | data/public-lexical/by-work/shevet-musar-token-claims-min60.csv |
| shir-hashirim-rabbah | 2477 | 513 | data/public-lexical/by-work/shir-hashirim-rabbah-token-claims-min60.csv |
| shivchei-habesht | 10821 | 1419 | data/public-lexical/by-work/shivchei-habesht-token-claims-min60.csv |
| siddur-edot-hamizrach | 30949 | 4971 | data/public-lexical/by-work/siddur-edot-hamizrach-token-claims-min60.csv |
| sifrei-aggadah-on-esther | 6654 | 1009 | data/public-lexical/by-work/sifrei-aggadah-on-esther-token-claims-min60.csv |
| sifrei-bamidbar | 9816 | 1507 | data/public-lexical/by-work/sifrei-bamidbar-token-claims-min60.csv |
| sifrei-devarim | 13236 | 1884 | data/public-lexical/by-work/sifrei-devarim-token-claims-min60.csv |
| sod-yesharim | 32976 | 3735 | data/public-lexical/by-work/sod-yesharim-token-claims-min60.csv |
| song-of-songs | 984 | 160 | data/public-lexical/by-work/song-of-songs-token-claims-min60.csv |
| tanna-debei-eliyahu-rabbah | 11930 | 1888 | data/public-lexical/by-work/tanna-debei-eliyahu-rabbah-token-claims-min60.csv |
| tanna-debei-eliyahu-zuta | 8411 | 1372 | data/public-lexical/by-work/tanna-debei-eliyahu-zuta-token-claims-min60.csv |
| targum-jerusalem | 6925 | 306 | data/public-lexical/by-work/targum-jerusalem-token-claims-min60.csv |
| targum-jonathan-on-amos | 1292 | 71 | data/public-lexical/by-work/targum-jonathan-on-amos-token-claims-min60.csv |
| targum-jonathan-on-deuteronomy | 7193 | 253 | data/public-lexical/by-work/targum-jonathan-on-deuteronomy-token-claims-min60.csv |
| targum-jonathan-on-exodus | 7344 | 262 | data/public-lexical/by-work/targum-jonathan-on-exodus-token-claims-min60.csv |
| targum-jonathan-on-ezekiel | 6858 | 277 | data/public-lexical/by-work/targum-jonathan-on-ezekiel-token-claims-min60.csv |
| targum-jonathan-on-genesis | 9226 | 340 | data/public-lexical/by-work/targum-jonathan-on-genesis-token-claims-min60.csv |
| targum-jonathan-on-habakkuk | 682 | 47 | data/public-lexical/by-work/targum-jonathan-on-habakkuk-token-claims-min60.csv |
| targum-jonathan-on-haggai | 334 | 30 | data/public-lexical/by-work/targum-jonathan-on-haggai-token-claims-min60.csv |
| targum-jonathan-on-hosea | 1853 | 96 | data/public-lexical/by-work/targum-jonathan-on-hosea-token-claims-min60.csv |
| targum-jonathan-on-i-kings | 4364 | 209 | data/public-lexical/by-work/targum-jonathan-on-i-kings-token-claims-min60.csv |
| targum-jonathan-on-i-samuel | 4633 | 213 | data/public-lexical/by-work/targum-jonathan-on-i-samuel-token-claims-min60.csv |
| targum-jonathan-on-ii-kings | 3969 | 160 | data/public-lexical/by-work/targum-jonathan-on-ii-kings-token-claims-min60.csv |
| targum-jonathan-on-ii-samuel | 4076 | 193 | data/public-lexical/by-work/targum-jonathan-on-ii-samuel-token-claims-min60.csv |
| targum-jonathan-on-isaiah | 8974 | 328 | data/public-lexical/by-work/targum-jonathan-on-isaiah-token-claims-min60.csv |
| targum-jonathan-on-jeremiah | 7553 | 309 | data/public-lexical/by-work/targum-jonathan-on-jeremiah-token-claims-min60.csv |
| targum-jonathan-on-joel | 741 | 46 | data/public-lexical/by-work/targum-jonathan-on-joel-token-claims-min60.csv |
| targum-jonathan-on-jonah | 448 | 36 | data/public-lexical/by-work/targum-jonathan-on-jonah-token-claims-min60.csv |
| targum-jonathan-on-joshua | 3388 | 157 | data/public-lexical/by-work/targum-jonathan-on-joshua-token-claims-min60.csv |
| targum-jonathan-on-judges | 3822 | 166 | data/public-lexical/by-work/targum-jonathan-on-judges-token-claims-min60.csv |
| targum-jonathan-on-leviticus | 4671 | 180 | data/public-lexical/by-work/targum-jonathan-on-leviticus-token-claims-min60.csv |
| targum-jonathan-on-malachi | 616 | 61 | data/public-lexical/by-work/targum-jonathan-on-malachi-token-claims-min60.csv |
| targum-jonathan-on-micah | 1145 | 65 | data/public-lexical/by-work/targum-jonathan-on-micah-token-claims-min60.csv |
| targum-jonathan-on-nahum | 593 | 47 | data/public-lexical/by-work/targum-jonathan-on-nahum-token-claims-min60.csv |
| targum-jonathan-on-numbers | 6860 | 260 | data/public-lexical/by-work/targum-jonathan-on-numbers-token-claims-min60.csv |
| targum-jonathan-on-obadiah | 241 | 21 | data/public-lexical/by-work/targum-jonathan-on-obadiah-token-claims-min60.csv |
| targum-jonathan-on-zechariah | 1729 | 100 | data/public-lexical/by-work/targum-jonathan-on-zechariah-token-claims-min60.csv |
| targum-jonathan-on-zephaniah | 588 | 42 | data/public-lexical/by-work/targum-jonathan-on-zephaniah-token-claims-min60.csv |
| targum-of-i-chronicles | 5263 | 229 | data/public-lexical/by-work/targum-of-i-chronicles-token-claims-min60.csv |
| targum-of-ii-chronicles | 5431 | 231 | data/public-lexical/by-work/targum-of-ii-chronicles-token-claims-min60.csv |
| the-beginning-of-wisdom | 1103 | 264 | data/public-lexical/by-work/the-beginning-of-wisdom-token-claims-min60.csv |
| the-book-of-maccabees-i | 4157 | 704 | data/public-lexical/by-work/the-book-of-maccabees-i-token-claims-min60.csv |
| the-book-of-maccabees-ii | 3951 | 704 | data/public-lexical/by-work/the-book-of-maccabees-ii-token-claims-min60.csv |
| the-book-of-susanna | 555 | 122 | data/public-lexical/by-work/the-book-of-susanna-token-claims-min60.csv |
| the-testaments-of-the-twelve-patriarchs | 5702 | 814 | data/public-lexical/by-work/the-testaments-of-the-twelve-patriarchs-token-claims-min60.csv |
| the-wars-of-god | 17999 | 2378 | data/public-lexical/by-work/the-wars-of-god-token-claims-min60.csv |
| the-wars-of-the-lord | 13374 | 1896 | data/public-lexical/by-work/the-wars-of-the-lord-token-claims-min60.csv |
| the-wisdom-of-solomon | 3279 | 713 | data/public-lexical/by-work/the-wisdom-of-solomon-token-claims-min60.csv |
| tiferet-shlomo | 34078 | 4007 | data/public-lexical/by-work/tiferet-shlomo-token-claims-min60.csv |
| tomer-devorah | 3900 | 761 | data/public-lexical/by-work/tomer-devorah-token-claims-min60.csv |
| torat-haolah | 12512 | 1878 | data/public-lexical/by-work/torat-haolah-token-claims-min60.csv |
| tosefta-arakhin | 1460 | 259 | data/public-lexical/by-work/tosefta-arakhin-token-claims-min60.csv |
| tosefta-avodah-zarah | 2058 | 303 | data/public-lexical/by-work/tosefta-avodah-zarah-token-claims-min60.csv |
| tosefta-bava-batra | 2257 | 355 | data/public-lexical/by-work/tosefta-bava-batra-token-claims-min60.csv |
| tosefta-bava-kamma | 3049 | 423 | data/public-lexical/by-work/tosefta-bava-kamma-token-claims-min60.csv |
| tosefta-bava-metzia | 3039 | 414 | data/public-lexical/by-work/tosefta-bava-metzia-token-claims-min60.csv |
| tosefta-beitzah | 1276 | 200 | data/public-lexical/by-work/tosefta-beitzah-token-claims-min60.csv |
| tosefta-bekhorot | 1596 | 255 | data/public-lexical/by-work/tosefta-bekhorot-token-claims-min60.csv |
| tosefta-berakhot | 2308 | 427 | data/public-lexical/by-work/tosefta-berakhot-token-claims-min60.csv |
| tosefta-bikkurim | 504 | 99 | data/public-lexical/by-work/tosefta-bikkurim-token-claims-min60.csv |
| tosefta-chagigah | 1219 | 259 | data/public-lexical/by-work/tosefta-chagigah-token-claims-min60.csv |
| tosefta-challah | 529 | 106 | data/public-lexical/by-work/tosefta-challah-token-claims-min60.csv |
| tosefta-chullin | 2001 | 308 | data/public-lexical/by-work/tosefta-chullin-token-claims-min60.csv |
| tosefta-demai | 1840 | 297 | data/public-lexical/by-work/tosefta-demai-token-claims-min60.csv |
| tosefta-eduyot | 992 | 173 | data/public-lexical/by-work/tosefta-eduyot-token-claims-min60.csv |
| tosefta-eruvin | 1978 | 352 | data/public-lexical/by-work/tosefta-eruvin-token-claims-min60.csv |
| tosefta-gittin | 1412 | 236 | data/public-lexical/by-work/tosefta-gittin-token-claims-min60.csv |
| tosefta-horayot | 638 | 147 | data/public-lexical/by-work/tosefta-horayot-token-claims-min60.csv |
| tosefta-kelim-batra | 1309 | 197 | data/public-lexical/by-work/tosefta-kelim-batra-token-claims-min60.csv |
| tosefta-kelim-kamma | 1541 | 249 | data/public-lexical/by-work/tosefta-kelim-kamma-token-claims-min60.csv |
| tosefta-kelim-metzia | 1904 | 259 | data/public-lexical/by-work/tosefta-kelim-metzia-token-claims-min60.csv |
| tosefta-keritot | 995 | 197 | data/public-lexical/by-work/tosefta-keritot-token-claims-min60.csv |
| tosefta-ketubot | 2106 | 315 | data/public-lexical/by-work/tosefta-ketubot-token-claims-min60.csv |
| tosefta-kiddushin | 1307 | 244 | data/public-lexical/by-work/tosefta-kiddushin-token-claims-min60.csv |
| tosefta-kilayim | 1200 | 184 | data/public-lexical/by-work/tosefta-kilayim-token-claims-min60.csv |
| tosefta-maaser-sheni | 1471 | 266 | data/public-lexical/by-work/tosefta-maaser-sheni-token-claims-min60.csv |
| tosefta-maasrot | 921 | 146 | data/public-lexical/by-work/tosefta-maasrot-token-claims-min60.csv |
| tosefta-makhshirin | 649 | 129 | data/public-lexical/by-work/tosefta-makhshirin-token-claims-min60.csv |
| tosefta-makkot | 1056 | 191 | data/public-lexical/by-work/tosefta-makkot-token-claims-min60.csv |
| tosefta-megillah | 1254 | 216 | data/public-lexical/by-work/tosefta-megillah-token-claims-min60.csv |
| tosefta-meilah | 791 | 131 | data/public-lexical/by-work/tosefta-meilah-token-claims-min60.csv |
| tosefta-menachot | 2750 | 399 | data/public-lexical/by-work/tosefta-menachot-token-claims-min60.csv |
| tosefta-mikvaot | 1449 | 255 | data/public-lexical/by-work/tosefta-mikvaot-token-claims-min60.csv |
| tosefta-moed-katan | 545 | 104 | data/public-lexical/by-work/tosefta-moed-katan-token-claims-min60.csv |
| tosefta-nazir | 1138 | 182 | data/public-lexical/by-work/tosefta-nazir-token-claims-min60.csv |
| tosefta-nedarim | 1172 | 205 | data/public-lexical/by-work/tosefta-nedarim-token-claims-min60.csv |
| tosefta-negaim | 1896 | 304 | data/public-lexical/by-work/tosefta-negaim-token-claims-min60.csv |
| tosefta-niddah | 1797 | 286 | data/public-lexical/by-work/tosefta-niddah-token-claims-min60.csv |
| tosefta-oholot | 2397 | 372 | data/public-lexical/by-work/tosefta-oholot-token-claims-min60.csv |
| tosefta-oktsin | 606 | 90 | data/public-lexical/by-work/tosefta-oktsin-token-claims-min60.csv |
| tosefta-orlah | 171 | 34 | data/public-lexical/by-work/tosefta-orlah-token-claims-min60.csv |
| tosefta-parah | 1764 | 268 | data/public-lexical/by-work/tosefta-parah-token-claims-min60.csv |
| tosefta-peah | 1283 | 238 | data/public-lexical/by-work/tosefta-peah-token-claims-min60.csv |
| tosefta-pesachim | 2306 | 341 | data/public-lexical/by-work/tosefta-pesachim-token-claims-min60.csv |
| tosefta-rosh-hashanah | 907 | 179 | data/public-lexical/by-work/tosefta-rosh-hashanah-token-claims-min60.csv |
| tosefta-sanhedrin | 3148 | 541 | data/public-lexical/by-work/tosefta-sanhedrin-token-claims-min60.csv |
| tosefta-shabbat | 3820 | 499 | data/public-lexical/by-work/tosefta-shabbat-token-claims-min60.csv |
| tosefta-shekalim | 1145 | 205 | data/public-lexical/by-work/tosefta-shekalim-token-claims-min60.csv |
| tosefta-sheviit | 1868 | 244 | data/public-lexical/by-work/tosefta-sheviit-token-claims-min60.csv |
| tosefta-shevuot | 1158 | 215 | data/public-lexical/by-work/tosefta-shevuot-token-claims-min60.csv |
| tosefta-sotah | 4083 | 681 | data/public-lexical/by-work/tosefta-sotah-token-claims-min60.csv |
| tosefta-sukkah | 1490 | 270 | data/public-lexical/by-work/tosefta-sukkah-token-claims-min60.csv |
| tosefta-taanit | 1177 | 222 | data/public-lexical/by-work/tosefta-taanit-token-claims-min60.csv |
| tosefta-tahorot | 1812 | 254 | data/public-lexical/by-work/tosefta-tahorot-token-claims-min60.csv |
| tosefta-temurah | 950 | 175 | data/public-lexical/by-work/tosefta-temurah-token-claims-min60.csv |
| tosefta-terumot | 2325 | 319 | data/public-lexical/by-work/tosefta-terumot-token-claims-min60.csv |
| tosefta-tevul-yom | 451 | 86 | data/public-lexical/by-work/tosefta-tevul-yom-token-claims-min60.csv |
| tosefta-yadayim | 656 | 144 | data/public-lexical/by-work/tosefta-yadayim-token-claims-min60.csv |
| tosefta-yevamot | 2107 | 315 | data/public-lexical/by-work/tosefta-yevamot-token-claims-min60.csv |
| tosefta-yoma | 1929 | 362 | data/public-lexical/by-work/tosefta-yoma-token-claims-min60.csv |
| tosefta-zavim | 810 | 156 | data/public-lexical/by-work/tosefta-zavim-token-claims-min60.csv |
| tosefta-zevachim | 2243 | 379 | data/public-lexical/by-work/tosefta-zevachim-token-claims-min60.csv |
| tov-halevanon | 4624 | 874 | data/public-lexical/by-work/tov-halevanon-token-claims-min60.csv |
| tractate-derekh-eretz-rabbah | 2293 | 441 | data/public-lexical/by-work/tractate-derekh-eretz-rabbah-token-claims-min60.csv |
| tractate-derekh-eretz-zuta | 770 | 206 | data/public-lexical/by-work/tractate-derekh-eretz-zuta-token-claims-min60.csv |
| tractate-kallah | 1086 | 237 | data/public-lexical/by-work/tractate-kallah-token-claims-min60.csv |
| tractate-semachot | 272 | 66 | data/public-lexical/by-work/tractate-semachot-token-claims-min60.csv |
| tractate-soferim | 4288 | 760 | data/public-lexical/by-work/tractate-soferim-token-claims-min60.csv |
| treatise-on-logic | 2273 | 453 | data/public-lexical/by-work/treatise-on-logic-token-claims-min60.csv |
| tzavaat-harivash | 3662 | 742 | data/public-lexical/by-work/tzavaat-harivash-token-claims-min60.csv |
| tzidkat-hatzadik | 15864 | 2140 | data/public-lexical/by-work/tzidkat-hatzadik-token-claims-min60.csv |
| yaarot-devash-i | 28924 | 3477 | data/public-lexical/by-work/yaarot-devash-i-token-claims-min60.csv |
| yaarot-devash-ii | 26795 | 3061 | data/public-lexical/by-work/yaarot-devash-ii-token-claims-min60.csv |
| yahel-ohr-on-zohar | 4871 | 838 | data/public-lexical/by-work/yahel-ohr-on-zohar-token-claims-min60.csv |
| yakar-mipaz | 3892 | 713 | data/public-lexical/by-work/yakar-mipaz-token-claims-min60.csv |
| yedei-moshe-on-bereshit-rabbah | 2172 | 466 | data/public-lexical/by-work/yedei-moshe-on-bereshit-rabbah-token-claims-min60.csv |
| yedei-moshe-on-devarim-rabbah | 357 | 118 | data/public-lexical/by-work/yedei-moshe-on-devarim-rabbah-token-claims-min60.csv |
| yedei-moshe-on-kohelet-rabbah | 1854 | 396 | data/public-lexical/by-work/yedei-moshe-on-kohelet-rabbah-token-claims-min60.csv |
| yedei-moshe-on-shemot-rabbah | 1947 | 434 | data/public-lexical/by-work/yedei-moshe-on-shemot-rabbah-token-claims-min60.csv |
| yedei-moshe-on-shir-hashirim-rabbah | 3038 | 574 | data/public-lexical/by-work/yedei-moshe-on-shir-hashirim-rabbah-token-claims-min60.csv |
| yedei-moshe-on-vayikra-rabbah | 346 | 85 | data/public-lexical/by-work/yedei-moshe-on-vayikra-rabbah-token-claims-min60.csv |
| yefeh-anaf-on-eichah-rabbah | 3783 | 743 | data/public-lexical/by-work/yefeh-anaf-on-eichah-rabbah-token-claims-min60.csv |
| yefeh-anaf-on-esther-rabbah | 1231 | 277 | data/public-lexical/by-work/yefeh-anaf-on-esther-rabbah-token-claims-min60.csv |
| yefeh-anaf-on-ruth-rabbah | 1292 | 299 | data/public-lexical/by-work/yefeh-anaf-on-ruth-rabbah-token-claims-min60.csv |
| yefeh-kol-on-shir-hashirim-rabbah | 13612 | 2125 | data/public-lexical/by-work/yefeh-kol-on-shir-hashirim-rabbah-token-claims-min60.csv |
| yefeh-toar-on-bamidbar-rabbah | 646 | 167 | data/public-lexical/by-work/yefeh-toar-on-bamidbar-rabbah-token-claims-min60.csv |
| yefeh-toar-on-bereshit-rabbah | 6072 | 1143 | data/public-lexical/by-work/yefeh-toar-on-bereshit-rabbah-token-claims-min60.csv |
| yefeh-toar-on-devarim-rabbah | 263 | 70 | data/public-lexical/by-work/yefeh-toar-on-devarim-rabbah-token-claims-min60.csv |
| yefeh-toar-on-shemot-rabbah | 4774 | 951 | data/public-lexical/by-work/yefeh-toar-on-shemot-rabbah-token-claims-min60.csv |
| yefeh-toar-on-vayikra-rabbah | 2548 | 543 | data/public-lexical/by-work/yefeh-toar-on-vayikra-rabbah-token-claims-min60.csv |
| yesod-hayirah | 2802 | 432 | data/public-lexical/by-work/yesod-hayirah-token-claims-min60.csv |
| yesod-veshoresh-haavodah | 24417 | 2758 | data/public-lexical/by-work/yesod-veshoresh-haavodah-token-claims-min60.csv |
| yismach-moshe | 51130 | 4944 | data/public-lexical/by-work/yismach-moshe-token-claims-min60.csv |
| zechariah | 2181 | 421 | data/public-lexical/by-work/zechariah-token-claims-min60.csv |
| zephaniah | 618 | 113 | data/public-lexical/by-work/zephaniah-token-claims-min60.csv |
| zera-kodesh | 29424 | 3677 | data/public-lexical/by-work/zera-kodesh-token-claims-min60.csv |
| zohar-chadash | 35902 | 3249 | data/public-lexical/by-work/zohar-chadash-token-claims-min60.csv |

## Skipped / Diagnostic Counts

| Reason | Count |
| --- | ---: |
| missing work files | 0 |
| unmatched | 8236 |
| no lexicon entry | 3 |
| no renderings | 19117 |
| missing source license | 0 |
| exported rows not placed in a by-license file | 63 |

Rows are skipped from the public JSONL export when they have no renderings or when a rendered claim cannot be tied to source/license metadata. Rows with project lexical-rule license labels that are not explicitly CC0 remain in all-claims/by-work output but are not placed in the CC0 by-license file.

## Sitewide Compact Claim Index

| File | Rows / terms | Purpose |
| --- | ---: | --- |
| data/public-lexical/sitewide/claim-index.jsonl | 9193 | Deduplicated claim-shaped lexical rows across all imported works |
| data/public-lexical/sitewide/claim-index.csv | 9193 | CSV mirror of the compact claim index |
| data/public-lexical/sitewide/normalized-lookup.json | 19235 | Normalized Hebrew form to claim ID lookup |
| data/public-lexical/sitewide/work-summary.jsonl | 496 | Per-work compact-export coverage summary |
| data/public-lexical/sitewide/work-summary.csv | 496 | CSV mirror of per-work compact-export coverage summary |
| data/public-lexical/sitewide/work-downloads.csv | 496 | Per-work download index for lexical manifests, token indexes, and public export files |

The compact sitewide files are intended for AI/tool import. They preserve source/license metadata per claim and avoid repeating the same source-backed lexical row for every work-token occurrence.

### Sitewide Compact Diagnostics

| Item | Count |
| --- | ---: |
| manifests scanned | 496 |
| chunks scanned | 4701 |
| candidate rows without renderings | 884283 |
| candidate rows without source/license | 0 |

## User-Facing Prompt

The AI-assisted workflow prompt is at `prompts/use-lexical-workbench.md`.

## Public Library Navigation

The root page now opens directly as the Full Library instead of a splash/featured shelf. Lexical export downloads are linked from the root page, library page, and About / License page.

The public library keeps Talmud / Commentary out of the normal visible category list. Those works remain direct-linkable through an internal archive shelf labeled `Internal archive / not public-featured yet`.

## Integrity Confirmations

- Hebrew source text was not changed by this export task.
- Overlay/export namespaces were not changed by this export task.
- Lexical source/license metadata remains per row.
- Third-party rows were not relabeled as CC0.
- Orot meanings were not changed.
