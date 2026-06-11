# Agent 1 Workbench Public Domain Boundary Map - 2026-06-04

Status: `agent1_workbench_public_domain_boundary_map_prepared_for_agent6_boundary_only`.

target: `workbench-public-domain-boundary-map`.

files:

- input: `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`
- output JSON: `reports/agent1-workbench-public-domain-boundary-map-2026-06-04.json`
- output MD: `reports/agent1-workbench-public-domain-boundary-map-2026-06-04.md`
- build script: `scripts/build_agent1_workbench_public_domain_boundary_map.mjs`
- validator: `scripts/validate_agent1_workbench_public_domain_boundary_map.mjs`
- contract JSON: `reports/agent1-spark1-pipeline-contract-workbench-public-domain-boundary-map-2026-06-04.json`
- contract MD: `reports/agent1-spark1-pipeline-contract-workbench-public-domain-boundary-map-2026-06-04.md`
- contract validator: `scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs`

command:

```powershell
node scripts/build_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs
```

counts:

- declared Public Domain partitions: `307`
- declared Public Domain source rows: `99045`
- sampled top-partition Public Domain partitions: `93`
- sampled top-partition Public Domain source rows: `88100`
- sampled unique works: `797`

missing-field blocker: Agent 6/release boundary treatment, package/export handling rule, and public/runtime/display authorization if any.

handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.

stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

## Public Domain Sampled Partitions

Showing first 20 sampled top partitions; full row list is in the JSON artifact.

| source name | rows | works | version source |
| --- | ---: | ---: | --- |
| `Friedberg Edition` | `7389` | `269` | `https://fjms.genizah.org` |
| `Torat Emet 363` | `3557` | `130` | `http://www.toratemetfreeware.com/index.html?downloads` |
| `Akeidat Yitzchak, Pressburg 1849` | `2999` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH002034858` |
| `Friedberg Edition` | `2941` | `95` | `https://fjms.genizah.org/` |
| `Yismach Moshe, Sighet, 1898` | `2921` | `1` | `https://www.sefaria.org` |
| `Tur Yoreh Deah, Vilna, 1923` | `2739` | `4` | `https://www.nli.org.il/he/books/NNL_ALEPH001935970` |
| `Ohr Hachama, Peremyshl, 1896-1898` | `2383` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH001148825/NLI` |
| `Tur Choshen Mishpat: Vilna, 1923` | `2303` | `4` | `https://www.nli.org.il/he/books/NNL_ALEPH001935970` |
| `Sefat emet, Piotrków, 1905-1908` | `2129` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH001186213` |
| `Tur Orach Chaim, Vilna, 1923` | `2081` | `4` | `https://www.nli.org.il/he/books/NNL_ALEPH001935970` |
| `Torat Emet 357` | `2040` | `66` | `http://www.toratemetfreeware.com/index.html?downloads` |
| `Pri Tzaddik, Lublin, 1901` | `1934` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH001986677` |
| `Shenei Luchot HaBrit, based on Amsterdam, 1698 ed. Part III` | `1858` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH001881900` |
| `Midrash Lekach Tov on Torah, Vilna 1884` | `1822` | `3` | `https://www.nli.org.il/he/books/NNL_ALEPH001922206` |
| `Ashlei Ravrevei: Shulchan Aruch Yoreh Deah, Lemberg, 1888` | `1552` | `5` | `https://www.nli.org.il/he/books/NNL_ALEPH002097765` |
| `Otzar Midrashim, New York, 1915` | `1457` | `2` | `https://www.nli.org.il/he/books/NNL_ALEPH001175329` |
| `Aruch HaShulchan, Vilna 1923-29` | `1445` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH001326511` |
| `Aruch HaShulchan, Choshen Mishpat. Vilna 1923-29` | `1336` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH001326511` |
| `Livorno, 1795` | `1165` | `1` | `https://www.nli.org.il/he/books/NNL_ALEPH990019674420205171/NLI` |
| `ToratEmet` | `1162` | `39` | `http://www.toratemetfreeware.com/online/d_root__035_mshnh_torh_lhrmbm.html` |

## Boundary

Evidence/blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, Public Domain export authorization, or public/runtime mutation.
