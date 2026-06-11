# Agent 10 A14 Cleanup Stage Manifest

- status: `exact_stage_manifest_for_a14_review`
- head: `f4eee67e4`
- generated_at: `2026-06-11T02:41:03.287Z`
- current status lines: `465`
- boundary: evidence/stage planning only; no staging, commit, push, deploy, cleanup acceptance, source/license/legal acceptance, Definition authority, answer acceptance, accepted text, publication readiness, or public-runtime acceptance.

## Bucket Summary

| bucket | count | staging note |
| --- | ---: | --- |
| `scripts` | `1` | review render behavior first |
| `pages_or_dirs` | `7` | page/root/library surfaces; validate Route HUD and links |
| `lexical_chunks_manifests` | `10` | five imported-work lexical packages |
| `occurrences` | `5` | five imported-work occurrence rosters |
| `token_indexes` | `5` | five imported-work token indexes |
| `coverage_json` | `188` | ranker coverage outputs |
| `unresolved_csv` | `188` | TBD/unresolved queue outputs |
| `data_reports_core` | `2` | coverage report and bad-match audit |
| `search_core` | `4` | search manifests/indexes |
| `normalized_forms` | `48` | normalized-form search manifest/chunks |
| `root_or_other` | `4` | root stats/overlay/token index generated files |
| `reports` | `3` | evidence reports only |

## Stage Rules

- Do not use git add -A.
- Review scripts/render_site.ps1 separately before staging generated data.
- Stage page/root/library surfaces separately from lexical/search generated data.
- Keep reports as evidence only; no acceptance claims.
- No deploy/public-runtime/release action from this manifest.

## Full Path Lists

### scripts

- ` M` `scripts/render_site.ps1`

### pages_or_dirs

- `??` `chasidut/bepardes-hachasidut-vehakabbalah/`
- ` M` `index.html`
- `??` `kabbalah/ohr-penimi-on-talmud-eser-hasefirot/`
- `??` `kabbalah/shuvi-shuvi-hashulamit/`
- ` M` `library/index.html`
- `??` `mishnah/a-new-israeli-commentary-on-pirkei-avot/`
- `??` `other/amudei-yerushalayim-on-jerusalem-talmud-nedarim/`

### lexical_chunks_manifests

- `??` `data/lexical/a-new-israeli-commentary-on-pirkei-avot-chunks/`
- `??` `data/lexical/a-new-israeli-commentary-on-pirkei-avot.manifest.json`
- `??` `data/lexical/amudei-yerushalayim-on-jerusalem-talmud-nedarim-chunks/`
- `??` `data/lexical/amudei-yerushalayim-on-jerusalem-talmud-nedarim.manifest.json`
- `??` `data/lexical/bepardes-hachasidut-vehakabbalah-chunks/`
- `??` `data/lexical/bepardes-hachasidut-vehakabbalah.manifest.json`
- `??` `data/lexical/ohr-penimi-on-talmud-eser-hasefirot-chunks/`
- `??` `data/lexical/ohr-penimi-on-talmud-eser-hasefirot.manifest.json`
- `??` `data/lexical/shuvi-shuvi-hashulamit-chunks/`
- `??` `data/lexical/shuvi-shuvi-hashulamit.manifest.json`

### occurrences

- `??` `data/lexical/occurrences/a-new-israeli-commentary-on-pirkei-avot.json`
- `??` `data/lexical/occurrences/amudei-yerushalayim-on-jerusalem-talmud-nedarim.json`
- `??` `data/lexical/occurrences/bepardes-hachasidut-vehakabbalah.json`
- `??` `data/lexical/occurrences/ohr-penimi-on-talmud-eser-hasefirot.json`
- `??` `data/lexical/occurrences/shuvi-shuvi-hashulamit.json`

### token_indexes

- `??` `data/lexical/token-indexes/chasidut/bepardes-hachasidut-vehakabbalah.json`
- `??` `data/lexical/token-indexes/kabbalah/ohr-penimi-on-talmud-eser-hasefirot.json`
- `??` `data/lexical/token-indexes/kabbalah/shuvi-shuvi-hashulamit.json`
- `??` `data/lexical/token-indexes/mishnah/a-new-israeli-commentary-on-pirkei-avot.json`
- `??` `data/lexical/token-indexes/other/amudei-yerushalayim-on-jerusalem-talmud-nedarim.json`

### coverage_json

- `??` `data/reports/coverage/a-new-israeli-commentary-on-pirkei-avot.json`
- `??` `data/reports/coverage/against-apion.json`
- `??` `data/reports/coverage/agra-dekala.json`
- `??` `data/reports/coverage/amudei-yerushalayim-on-jerusalem-talmud-nedarim.json`
- `??` `data/reports/coverage/arvei-nachal.json`
- `??` `data/reports/coverage/avot-derabbi-natan-recension-b.json`
- `??` `data/reports/coverage/baal-shem-tov.json`
- `??` `data/reports/coverage/bartenura-on-pirkei-avot.json`
- `??` `data/reports/coverage/beit-meir-on-shulchan-arukh-even-haezer.json`
- `??` `data/reports/coverage/beit-shmuel.json`
- `??` `data/reports/coverage/bepardes-hachasidut-vehakabbalah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-arakhin.json`
- `??` `data/reports/coverage/boaz-on-mishnah-bava-metzia.json`
- `??` `data/reports/coverage/boaz-on-mishnah-beitzah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-bekhorot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-berakhot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-bikkurim.json`
- `??` `data/reports/coverage/boaz-on-mishnah-chullin.json`
- `??` `data/reports/coverage/boaz-on-mishnah-demai.json`
- `??` `data/reports/coverage/boaz-on-mishnah-eduyot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-eruvin.json`
- `??` `data/reports/coverage/boaz-on-mishnah-gittin.json`
- `??` `data/reports/coverage/boaz-on-mishnah-kelim.json`
- `??` `data/reports/coverage/boaz-on-mishnah-keritot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-kiddushin.json`
- `??` `data/reports/coverage/boaz-on-mishnah-kilayim.json`
- `??` `data/reports/coverage/boaz-on-mishnah-kinnim.json`
- `??` `data/reports/coverage/boaz-on-mishnah-maaser-sheni.json`
- `??` `data/reports/coverage/boaz-on-mishnah-makkot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-megillah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-meilah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-middot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-mikvaot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-moed-katan.json`
- `??` `data/reports/coverage/boaz-on-mishnah-negaim.json`
- `??` `data/reports/coverage/boaz-on-mishnah-niddah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-oholot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-orlah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-parah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-peah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-pesachim.json`
- `??` `data/reports/coverage/boaz-on-mishnah-rosh-hashanah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-shabbat.json`
- `??` `data/reports/coverage/boaz-on-mishnah-sheviit.json`
- `??` `data/reports/coverage/boaz-on-mishnah-taanit.json`
- `??` `data/reports/coverage/boaz-on-mishnah-tahorot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-tamid.json`
- `??` `data/reports/coverage/boaz-on-mishnah-temurah.json`
- `??` `data/reports/coverage/boaz-on-mishnah-terumot.json`
- `??` `data/reports/coverage/boaz-on-mishnah-yoma.json`
- `??` `data/reports/coverage/boaz-on-mishnah-zevachim.json`
- `??` `data/reports/coverage/boaz-on-pirkei-avot.json`
- `??` `data/reports/coverage/brief-commentary-on-bava-batra.json`
- `??` `data/reports/coverage/brief-commentary-on-bava-kamma.json`
- `??` `data/reports/coverage/brief-commentary-on-bava-metzia.json`
- `??` `data/reports/coverage/brief-commentary-on-beitzah.json`
- `??` `data/reports/coverage/brief-commentary-on-berakhot.json`
- `??` `data/reports/coverage/brief-commentary-on-bikkurim.json`
- `??` `data/reports/coverage/brief-commentary-on-chagigah.json`
- `??` `data/reports/coverage/brief-commentary-on-challah.json`
- `??` `data/reports/coverage/brief-commentary-on-demai.json`
- `??` `data/reports/coverage/brief-commentary-on-eruvin.json`
- `??` `data/reports/coverage/brief-commentary-on-gittin.json`
- `??` `data/reports/coverage/brief-commentary-on-ketubot.json`
- `??` `data/reports/coverage/brief-commentary-on-kilayim.json`
- `??` `data/reports/coverage/brief-commentary-on-maaser-sheni.json`
- `??` `data/reports/coverage/brief-commentary-on-maasrot.json`
- `??` `data/reports/coverage/brief-commentary-on-megillah.json`
- `??` `data/reports/coverage/brief-commentary-on-moed-katan.json`
- `??` `data/reports/coverage/brief-commentary-on-nazir.json`
- `??` `data/reports/coverage/brief-commentary-on-nedarim.json`
- `??` `data/reports/coverage/brief-commentary-on-orlah.json`
- `??` `data/reports/coverage/brief-commentary-on-peah.json`
- `??` `data/reports/coverage/brief-commentary-on-rosh-hashanah.json`
- `??` `data/reports/coverage/brief-commentary-on-shabbat.json`
- `??` `data/reports/coverage/brief-commentary-on-shekalim.json`
- `??` `data/reports/coverage/brief-commentary-on-sheviit.json`
- `??` `data/reports/coverage/brief-commentary-on-sotah.json`
- `??` `data/reports/coverage/brief-commentary-on-taanit.json`
- `??` `data/reports/coverage/brief-commentary-on-terumot.json`
- `??` `data/reports/coverage/brief-commentary-on-yevamot.json`
- `??` `data/reports/coverage/brief-commentary-on-yoma.json`
- `??` `data/reports/coverage/brit-moshe.json`
- `??` `data/reports/coverage/brit-olam-on-sefer-chasidim.json`
- `??` `data/reports/coverage/chelkat-mechokek.json`
- `??` `data/reports/coverage/derush-chiddushei-halevanah.json`
- `??` `data/reports/coverage/divrei-chalomot.json`
- `??` `data/reports/coverage/divrei-soferim.json`
- `??` `data/reports/coverage/dover-tzedek.json`
- `??` `data/reports/coverage/drashot-maharal.json`
- `??` `data/reports/coverage/eliyah-rabbah-on-shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/et-haochel.json`
- `??` `data/reports/coverage/ezer-mikodesh-on-shulchan-arukh-even-haezer.json`
- `??` `data/reports/coverage/geder-olam.json`
- `??` `data/reports/coverage/gevurat-anashim.json`
- `??` `data/reports/coverage/haamek-sheilah-on-sheiltot-drav-achai-gaon.json`
- `??` `data/reports/coverage/haggahot-chadashot-on-sefer-mitzvot-katan.json`
- `??` `data/reports/coverage/haggahot-imrei-barukh-on-shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/haggahot-of-radal-on-sefer-haparnas.json`
- `??` `data/reports/coverage/haggahot-rabbeinu-peretz-on-sefer-mitzvot-katan.json`
- `??` `data/reports/coverage/halakhot-gedolot.json`
- `??` `data/reports/coverage/hasagot-haramban-on-sefer-hamitzvot.json`
- `??` `data/reports/coverage/kav-hayashar.json`
- `??` `data/reports/coverage/kedushat-levi.json`
- `??` `data/reports/coverage/kereti-on-shulchan-arukh-yoreh-deah.json`
- `??` `data/reports/coverage/keter-shem-tov.json`
- `??` `data/reports/coverage/ketzot-hachoshen-on-shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/kol-bo.json`
- `??` `data/reports/coverage/kometz-haminchah.json`
- `??` `data/reports/coverage/lenevukhei-hatekufah.json`
- `??` `data/reports/coverage/lev-sameach.json`
- `??` `data/reports/coverage/levushei-serad-on-shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/likkutei-hapardes.json`
- `??` `data/reports/coverage/likkutei-maamarim.json`
- `??` `data/reports/coverage/likutei-moharan.json`
- `??` `data/reports/coverage/lishkat-hasofer.json`
- `??` `data/reports/coverage/maamar-mezakeh-harabim.json`
- `??` `data/reports/coverage/maaseh-rokeach-on-sales.json`
- `??` `data/reports/coverage/machatzit-hashekel-on-orach-chayim.json`
- `??` `data/reports/coverage/machshavot-charutz.json`
- `??` `data/reports/coverage/machzor-vitry.json`
- `??` `data/reports/coverage/marganita-tava-on-sefer-hamitzvot.json`
- `??` `data/reports/coverage/megillat-esther-on-sefer-hamitzvot.json`
- `??` `data/reports/coverage/meirat-einayim-on-shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/mekor-mayim-chayim-on-baal-shem-tov.json`
- `??` `data/reports/coverage/migdal-oz-on-mishneh-torah-sabbath.json`
- `??` `data/reports/coverage/minchat-chinukh.json`
- `??` `data/reports/coverage/moreh-beetzba.json`
- `??` `data/reports/coverage/netiv-chayim-on-shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/netiv-chesed-on-ahavat-chesed.json`
- `??` `data/reports/coverage/netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/ohr-neerav.json`
- `??` `data/reports/coverage/ohr-penimi-on-talmud-eser-hasefirot.json`
- `??` `data/reports/coverage/peri-megadim-on-orach-chayim.json`
- `??` `data/reports/coverage/perush-kadmon-on-sefer-chasidim.json`
- `??` `data/reports/coverage/pitchei-teshuva-on-shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/pitchei-teshuva-on-shulchan-arukh-even-haezer.json`
- `??` `data/reports/coverage/pitchei-teshuva-on-shulchan-arukh-yoreh-deah.json`
- `??` `data/reports/coverage/poked-akarim.json`
- `??` `data/reports/coverage/publishers-haggahot-on-sefer-haparnas.json`
- `??` `data/reports/coverage/rabbi-akiva-eiger-on-shulchan-arukh-even-haezer.json`
- `??` `data/reports/coverage/rabbi-akiva-eiger-on-shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/resisei-layla.json`
- `??` `data/reports/coverage/seder-hayom.json`
- `??` `data/reports/coverage/seder-troyes.json`
- `??` `data/reports/coverage/sefer-hahiggayon.json`
- `??` `data/reports/coverage/sefer-haitim.json`
- `??` `data/reports/coverage/sefer-hamelitzah.json`
- `??` `data/reports/coverage/sefer-haorah.json`
- `??` `data/reports/coverage/sefer-haterumah.json`
- `??` `data/reports/coverage/sefer-yesodei-hatorah.json`
- `??` `data/reports/coverage/sela-hamachlakot-on-baalei-hanefesh.json`
- `??` `data/reports/coverage/shaar-hamayim-haaroch.json`
- `??` `data/reports/coverage/sheiltot-drav-achai-gaon.json`
- `??` `data/reports/coverage/shem-tov-on-guide-for-the-perplexed.json`
- `??` `data/reports/coverage/shev-shmateta.json`
- `??` `data/reports/coverage/shibbolei-haleket.json`
- `??` `data/reports/coverage/shulchan-arukh-choshen-mishpat.json`
- `??` `data/reports/coverage/shulchan-arukh-even-haezer.json`
- `??` `data/reports/coverage/shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/shulchan-arukh-yoreh-deah.json`
- `??` `data/reports/coverage/shulchan-shel-arba.json`
- `??` `data/reports/coverage/shuvi-shuvi-hashulamit.json`
- `??` `data/reports/coverage/sichat-malakhei-hasharet.json`
- `??` `data/reports/coverage/sichat-shedim.json`
- `??` `data/reports/coverage/sichot-avodat-levi.json`
- `??` `data/reports/coverage/siftei-kohen-on-shulchan-arukh-yoreh-deah.json`
- `??` `data/reports/coverage/simlah-chadashah.json`
- `??` `data/reports/coverage/sippurei-maasiyot.json`
- `??` `data/reports/coverage/takanat-hashavin.json`
- `??` `data/reports/coverage/the-sabbath-epistle.json`
- `??` `data/reports/coverage/the-war-of-the-jews.json`
- `??` `data/reports/coverage/toafot-reem.json`
- `??` `data/reports/coverage/toldot-yaakov-yosef.json`
- `??` `data/reports/coverage/torat-habayit-haaroch.json`
- `??` `data/reports/coverage/torat-habayit-hakatzar.json`
- `??` `data/reports/coverage/turei-zahav-on-shulchan-arukh-even-haezer.json`
- `??` `data/reports/coverage/turei-zahav-on-shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/turei-zahav-on-shulchan-arukh-yoreh-deah.json`
- `??` `data/reports/coverage/urim-vetumim-urim.json`
- `??` `data/reports/coverage/words-of-peace-and-truth.json`
- `??` `data/reports/coverage/yad-avraham-on-shulchan-arukh-yoreh-deah.json`
- `??` `data/reports/coverage/yad-ephraim-on-shulchan-arukh-orach-chayim.json`
- `??` `data/reports/coverage/yesod-mora-vesod-hatorah.json`
- `??` `data/reports/coverage/yisrael-kedoshim.json`
- `??` `data/reports/coverage/yosher-divrei-emet.json`
- `??` `data/reports/coverage/zohar-harakia.json`

### unresolved_csv

- `??` `data/lexical/unresolved/a-new-israeli-commentary-on-pirkei-avot.csv`
- `??` `data/lexical/unresolved/against-apion.csv`
- `??` `data/lexical/unresolved/agra-dekala.csv`
- `??` `data/lexical/unresolved/amudei-yerushalayim-on-jerusalem-talmud-nedarim.csv`
- `??` `data/lexical/unresolved/arvei-nachal.csv`
- `??` `data/lexical/unresolved/avot-derabbi-natan-recension-b.csv`
- `??` `data/lexical/unresolved/baal-shem-tov.csv`
- `??` `data/lexical/unresolved/bartenura-on-pirkei-avot.csv`
- `??` `data/lexical/unresolved/beit-meir-on-shulchan-arukh-even-haezer.csv`
- `??` `data/lexical/unresolved/beit-shmuel.csv`
- `??` `data/lexical/unresolved/bepardes-hachasidut-vehakabbalah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-arakhin.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-bava-metzia.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-beitzah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-bekhorot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-berakhot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-bikkurim.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-chullin.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-demai.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-eduyot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-eruvin.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-gittin.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-kelim.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-keritot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-kiddushin.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-kilayim.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-kinnim.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-maaser-sheni.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-makkot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-megillah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-meilah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-middot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-mikvaot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-moed-katan.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-negaim.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-niddah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-oholot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-orlah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-parah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-peah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-pesachim.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-rosh-hashanah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-shabbat.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-sheviit.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-taanit.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-tahorot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-tamid.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-temurah.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-terumot.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-yoma.csv`
- `??` `data/lexical/unresolved/boaz-on-mishnah-zevachim.csv`
- `??` `data/lexical/unresolved/boaz-on-pirkei-avot.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-bava-batra.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-bava-kamma.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-bava-metzia.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-beitzah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-berakhot.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-bikkurim.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-chagigah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-challah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-demai.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-eruvin.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-gittin.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-ketubot.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-kilayim.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-maaser-sheni.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-maasrot.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-megillah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-moed-katan.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-nazir.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-nedarim.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-orlah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-peah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-rosh-hashanah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-shabbat.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-shekalim.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-sheviit.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-sotah.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-taanit.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-terumot.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-yevamot.csv`
- `??` `data/lexical/unresolved/brief-commentary-on-yoma.csv`
- `??` `data/lexical/unresolved/brit-moshe.csv`
- `??` `data/lexical/unresolved/brit-olam-on-sefer-chasidim.csv`
- `??` `data/lexical/unresolved/chelkat-mechokek.csv`
- `??` `data/lexical/unresolved/derush-chiddushei-halevanah.csv`
- `??` `data/lexical/unresolved/divrei-chalomot.csv`
- `??` `data/lexical/unresolved/divrei-soferim.csv`
- `??` `data/lexical/unresolved/dover-tzedek.csv`
- `??` `data/lexical/unresolved/drashot-maharal.csv`
- `??` `data/lexical/unresolved/eliyah-rabbah-on-shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/et-haochel.csv`
- `??` `data/lexical/unresolved/ezer-mikodesh-on-shulchan-arukh-even-haezer.csv`
- `??` `data/lexical/unresolved/geder-olam.csv`
- `??` `data/lexical/unresolved/gevurat-anashim.csv`
- `??` `data/lexical/unresolved/haamek-sheilah-on-sheiltot-drav-achai-gaon.csv`
- `??` `data/lexical/unresolved/haggahot-chadashot-on-sefer-mitzvot-katan.csv`
- `??` `data/lexical/unresolved/haggahot-imrei-barukh-on-shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/haggahot-of-radal-on-sefer-haparnas.csv`
- `??` `data/lexical/unresolved/haggahot-rabbeinu-peretz-on-sefer-mitzvot-katan.csv`
- `??` `data/lexical/unresolved/halakhot-gedolot.csv`
- `??` `data/lexical/unresolved/hasagot-haramban-on-sefer-hamitzvot.csv`
- `??` `data/lexical/unresolved/kav-hayashar.csv`
- `??` `data/lexical/unresolved/kedushat-levi.csv`
- `??` `data/lexical/unresolved/kereti-on-shulchan-arukh-yoreh-deah.csv`
- `??` `data/lexical/unresolved/keter-shem-tov.csv`
- `??` `data/lexical/unresolved/ketzot-hachoshen-on-shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/kol-bo.csv`
- `??` `data/lexical/unresolved/kometz-haminchah.csv`
- `??` `data/lexical/unresolved/lenevukhei-hatekufah.csv`
- `??` `data/lexical/unresolved/lev-sameach.csv`
- `??` `data/lexical/unresolved/levushei-serad-on-shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/likkutei-hapardes.csv`
- `??` `data/lexical/unresolved/likkutei-maamarim.csv`
- `??` `data/lexical/unresolved/likutei-moharan.csv`
- `??` `data/lexical/unresolved/lishkat-hasofer.csv`
- `??` `data/lexical/unresolved/maamar-mezakeh-harabim.csv`
- `??` `data/lexical/unresolved/maaseh-rokeach-on-sales.csv`
- `??` `data/lexical/unresolved/machatzit-hashekel-on-orach-chayim.csv`
- `??` `data/lexical/unresolved/machshavot-charutz.csv`
- `??` `data/lexical/unresolved/machzor-vitry.csv`
- `??` `data/lexical/unresolved/marganita-tava-on-sefer-hamitzvot.csv`
- `??` `data/lexical/unresolved/megillat-esther-on-sefer-hamitzvot.csv`
- `??` `data/lexical/unresolved/meirat-einayim-on-shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/mekor-mayim-chayim-on-baal-shem-tov.csv`
- `??` `data/lexical/unresolved/migdal-oz-on-mishneh-torah-sabbath.csv`
- `??` `data/lexical/unresolved/minchat-chinukh.csv`
- `??` `data/lexical/unresolved/moreh-beetzba.csv`
- `??` `data/lexical/unresolved/netiv-chayim-on-shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/netiv-chesed-on-ahavat-chesed.csv`
- `??` `data/lexical/unresolved/netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/ohr-neerav.csv`
- `??` `data/lexical/unresolved/ohr-penimi-on-talmud-eser-hasefirot.csv`
- `??` `data/lexical/unresolved/peri-megadim-on-orach-chayim.csv`
- `??` `data/lexical/unresolved/perush-kadmon-on-sefer-chasidim.csv`
- `??` `data/lexical/unresolved/pitchei-teshuva-on-shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/pitchei-teshuva-on-shulchan-arukh-even-haezer.csv`
- `??` `data/lexical/unresolved/pitchei-teshuva-on-shulchan-arukh-yoreh-deah.csv`
- `??` `data/lexical/unresolved/poked-akarim.csv`
- `??` `data/lexical/unresolved/publishers-haggahot-on-sefer-haparnas.csv`
- `??` `data/lexical/unresolved/rabbi-akiva-eiger-on-shulchan-arukh-even-haezer.csv`
- `??` `data/lexical/unresolved/rabbi-akiva-eiger-on-shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/resisei-layla.csv`
- `??` `data/lexical/unresolved/seder-hayom.csv`
- `??` `data/lexical/unresolved/seder-troyes.csv`
- `??` `data/lexical/unresolved/sefer-hahiggayon.csv`
- `??` `data/lexical/unresolved/sefer-haitim.csv`
- `??` `data/lexical/unresolved/sefer-hamelitzah.csv`
- `??` `data/lexical/unresolved/sefer-haorah.csv`
- `??` `data/lexical/unresolved/sefer-haterumah.csv`
- `??` `data/lexical/unresolved/sefer-yesodei-hatorah.csv`
- `??` `data/lexical/unresolved/sela-hamachlakot-on-baalei-hanefesh.csv`
- `??` `data/lexical/unresolved/shaar-hamayim-haaroch.csv`
- `??` `data/lexical/unresolved/sheiltot-drav-achai-gaon.csv`
- `??` `data/lexical/unresolved/shem-tov-on-guide-for-the-perplexed.csv`
- `??` `data/lexical/unresolved/shev-shmateta.csv`
- `??` `data/lexical/unresolved/shibbolei-haleket.csv`
- `??` `data/lexical/unresolved/shulchan-arukh-choshen-mishpat.csv`
- `??` `data/lexical/unresolved/shulchan-arukh-even-haezer.csv`
- `??` `data/lexical/unresolved/shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/shulchan-arukh-yoreh-deah.csv`
- `??` `data/lexical/unresolved/shulchan-shel-arba.csv`
- `??` `data/lexical/unresolved/shuvi-shuvi-hashulamit.csv`
- `??` `data/lexical/unresolved/sichat-malakhei-hasharet.csv`
- `??` `data/lexical/unresolved/sichat-shedim.csv`
- `??` `data/lexical/unresolved/sichot-avodat-levi.csv`
- `??` `data/lexical/unresolved/siftei-kohen-on-shulchan-arukh-yoreh-deah.csv`
- `??` `data/lexical/unresolved/simlah-chadashah.csv`
- `??` `data/lexical/unresolved/sippurei-maasiyot.csv`
- `??` `data/lexical/unresolved/takanat-hashavin.csv`
- `??` `data/lexical/unresolved/the-sabbath-epistle.csv`
- `??` `data/lexical/unresolved/the-war-of-the-jews.csv`
- `??` `data/lexical/unresolved/toafot-reem.csv`
- `??` `data/lexical/unresolved/toldot-yaakov-yosef.csv`
- `??` `data/lexical/unresolved/torat-habayit-haaroch.csv`
- `??` `data/lexical/unresolved/torat-habayit-hakatzar.csv`
- `??` `data/lexical/unresolved/turei-zahav-on-shulchan-arukh-even-haezer.csv`
- `??` `data/lexical/unresolved/turei-zahav-on-shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/turei-zahav-on-shulchan-arukh-yoreh-deah.csv`
- `??` `data/lexical/unresolved/urim-vetumim-urim.csv`
- `??` `data/lexical/unresolved/words-of-peace-and-truth.csv`
- `??` `data/lexical/unresolved/yad-avraham-on-shulchan-arukh-yoreh-deah.csv`
- `??` `data/lexical/unresolved/yad-ephraim-on-shulchan-arukh-orach-chayim.csv`
- `??` `data/lexical/unresolved/yesod-mora-vesod-hatorah.csv`
- `??` `data/lexical/unresolved/yisrael-kedoshim.csv`
- `??` `data/lexical/unresolved/yosher-divrei-emet.csv`
- `??` `data/lexical/unresolved/zohar-harakia.csv`

### data_reports_core

- ` M` `data/reports/audit/bad_matches.csv`
- ` M` `data/reports/corpus-coverage-pipeline-report.md`

### search_core

- ` M` `data/search/english-gloss-index.jsonl`
- ` M` `data/search/lemma-form-index.jsonl`
- ` M` `data/search/manifest.json`
- ` M` `data/search/source-text/manifest.json`

### normalized_forms

- ` M` `data/search/normalized-forms/manifest.json`
- ` M` `data/search/normalized-forms/normalized-forms-000.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-001.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-002.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-003.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-004.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-005.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-006.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-007.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-008.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-009.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-010.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-011.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-012.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-013.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-014.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-015.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-016.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-017.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-018.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-019.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-020.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-021.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-022.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-023.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-024.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-025.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-026.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-027.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-028.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-029.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-030.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-031.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-032.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-033.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-034.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-035.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-036.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-037.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-038.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-039.jsonl`
- ` M` `data/search/normalized-forms/normalized-forms-040.jsonl`
- `??` `data/search/normalized-forms/normalized-forms-041.jsonl`
- `??` `data/search/normalized-forms/normalized-forms-042.jsonl`
- `??` `data/search/normalized-forms/normalized-forms-043.jsonl`
- `??` `data/search/normalized-forms/normalized-forms-044.jsonl`
- `??` `data/search/normalized-forms/normalized-forms-045.jsonl`
- `??` `data/search/normalized-forms/normalized-forms-046.jsonl`

### root_or_other

- ` M` `data/lexical/token-index.json`
- `M ` `corpus_stats.json`
- ` M` `overlay-export.json`
- ` M` `stats/index.html`

### reports

- `??` `reports/a09-new-library-targeted-lexical-build-2026-06-10.md`
- `??` `reports/agent10-tbd-ranker-clean-repo-generation-check-2026-06-10.json`
- `??` `reports/agent10-tbd-ranker-clean-repo-generation-check-2026-06-10.md`
