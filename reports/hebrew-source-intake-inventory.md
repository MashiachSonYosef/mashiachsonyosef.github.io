# Hebrew Source Intake Inventory

Date: 2026-05-09

## Latest Importable Lane: Base Midrash / Aggadah / Halakhah

Imported because each work resolved to Hebrew Sefaria source units with `Public Domain` metadata. No English translations were imported or generated. Lexical HUD data uses existing separated source layers only; unresolved tokens remain unresolved.

| Work | Units | License | Version | Source URL | Lexical coverage | Token occurrences | Largest chunk | Page |
|---|---:|---|---|---|---:|---:|---:|---|
| Aggadat Bereshit | 222 | Public Domain | Krakow, 1903 | https://www.nli.org.il/he/books/NNL_ALEPH001779928/NLI | 22/8840 | 45613 | 0.23 MB | midrash/aggadat-bereshit/index.html |
| Midrash Lekach Tov on Ecclesiastes | 2 | Public Domain | Tobia ben Elieser's Commentar zu Koheleth, Berlin 1904 | https://www.nli.org.il/he/books/NNL_ALEPH001050629 | 9/421 | 676 | 0.10 MB | midrash/midrash-lekach-tov-on-ecclesiastes/index.html |
| Midrash Lekach Tov on Esther | 10 | Public Domain | Sifre DeAgadeta, Vilna 1886 | https://www.nli.org.il/he/books/NNL_ALEPH001838260 | 8/1030 | 2494 | 0.23 MB | midrash/midrash-lekach-tov-on-esther/index.html |
| Midrash Lekach Tov on Lamentations | 7 | Public Domain | The Commentary of R. Tobia ben Elieser on Echah. London, 1908 | https://www.nli.org.il/he/books/NNL_ALEPH001922225 | 6/757 | 1342 | 0.17 MB | midrash/midrash-lekach-tov-on-lamentations/index.html |
| Midrash Lekach Tov on Ruth | 12 | Public Domain | Perush Lekach Tov. Pesikta Zutrata on Ruth, Mainz 1887 | https://www.nli.org.il/he/books/NNL_ALEPH001922255 | 8/759 | 1378 | 0.18 MB | midrash/midrash-lekach-tov-on-ruth/index.html |
| Midrash Lekach Tov on Song of Songs | 3 | Public Domain | The Commentary of R. Tobia ben Elieser on Canticles. London, 1908 | https://www.nli.org.il/he/books/NNL_ALEPH001922234 | 6/787 | 1308 | 0.18 MB | midrash/midrash-lekach-tov-on-song-of-songs/index.html |
| Midrash Shmuel | 207 | Public Domain | Krakow, 1893 | https://www.nli.org.il/he/books/NNL_ALEPH001987598/NLI | 21/7023 | 29186 | 0.23 MB | midrash/midrash-shmuel/index.html |
| Midrash Tannaim on Deuteronomy | 235 | Public Domain | Berlin, 1908 | https://www.nli.org.il/he/books/NNL_ALEPH001738025/NLI | 12/2712 | 8511 | 0.23 MB | midrash/midrash-tannaim-on-deuteronomy/index.html |
| Midrash Yelamdenu, Selections from Yalkut Talmud Torah | 6 | Public Domain | Yalkut Talmud Torah. Cincinnati, 1940 | https://www.nli.org.il/en/books/NNL_ALEPH001264247/NLI | 8/523 | 751 | 0.13 MB | midrash/midrash-yelamdenu-selections-from-yalkut-talmud-torah/index.html |
| Mishnat Rabbi Eliezer | 589 | Public Domain | New York, 1934 | https://www.nli.org.il/he/books/NNL_ALEPH001987876/NLI | 16/12809 | 54534 | 0.23 MB | midrash/mishnat-rabbi-eliezer/index.html |
| Otzar Midrashim | 5064 | Public Domain | Otzar Midrashim, New York, 1915 | https://www.nli.org.il/he/books/NNL_ALEPH001175329 | 74/56400 | 436434 | 0.23 MB | midrash/otzar-midrashim/index.html |
| Sefer HaYashar (midrash) | 308 | Public Domain | Sefer HaYashar, Livorno 1870 | https://he.wikisource.org/wiki/%D7%A1%D7%A4%D7%A8_%D7%94%D7%99%D7%A9%D7%A8_-_%D7%9E%D7%A7%D7%A8%D7%90_%D7%95%D7%90%D7%92%D7%93%D7%94 | 4/11610 | 88214 | 0.22 MB | midrash/sefer-hayashar-midrash/index.html |
| Sifrei Aggadah on Esther | 197 | Public Domain | Vilna, 1886 | https://www.nli.org.il/he/books/NNL_ALEPH001838260/NLI | 25/6654 | 23585 | 0.23 MB | midrash/sifrei-aggadah-on-esther/index.html |
| Tanna DeBei Eliyahu Zuta | 98 | Public Domain | Tanna deBei Eliyahu Zuta | http://www.daat.ac.il | 41/8411 | 28440 | 0.23 MB | midrash/tanna-debei-eliyahu-zuta/index.html |

## Latest Batch Totals

- New works imported: 14
- New source units: 6960
- New token occurrences: 722466
- New work-surface rows: 118736
- New matched surface rows: 260
- Largest new lexical chunk: tanna-debei-eliyahu-zuta-chunks/tanna-debei-eliyahu-zuta-003.json at 0.23 MB
- Empty overlay stubs were added only because validation requires one overlay file per work; no translation content was added.
- Blank overlay export rows were generated for the new works and full-site overlay export; no Hebrew source body or English translation content was added.
- Otzar Midrashim had a mechanical duplicate generated anchor for one repeated Sefaria node; importer now suffixes later duplicate IDs with the sequence number to keep anchors unique without changing Hebrew text.

## Skipped / Deferred From Probe

- Commentary-heavy Sefaria candidates from the Midrash probe were deferred to a separate commentary lane so base-text imports could validate cleanly first.
- `Ein Yaakov (Glick Edition)` was not imported in this lane because the version title indicates a translated edition and requires separate review despite probe metadata.
- `Ruth Rabbah (Lerner)` was not imported in this lane because the modern 1971 edition metadata needs separate review.
- Otzar subrefs that the Sefaria API failed to fetch were skipped by the importer; only fetched Public Domain Hebrew units were retained.

## Previous Lanes

- Tanakh completion lane: 35 remaining books imported from `Miqra according to the Masorah` with `CC-BY-SA` metadata.
- Torah Midrash / Aggadah lane: Midrash Tanchuma Buber, Midrash Aggadah, Seder Olam Rabbah, and Midrash Sekhel Tov imported with `Public Domain` metadata.
