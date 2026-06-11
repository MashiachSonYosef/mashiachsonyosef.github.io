# Agent 1 Workbench CC-BY-SA Share-Alike Boundary Map - 2026-06-04

Status: `agent1_workbench_cc_by_sa_share_alike_boundary_map_prepared_for_agent6_boundary_only`.

## Task Shape

target: `workbench-cc-by-sa-share-alike-boundary-map`.

files:

- input: `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`
- output JSON: `reports/agent1-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.json`
- output MD: `reports/agent1-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.md`
- build script: `scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs`
- validator: `scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs`
- contract JSON: `reports/agent1-spark1-pipeline-contract-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.json`
- contract MD: `reports/agent1-spark1-pipeline-contract-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.md`
- contract validator: `scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs`

exact command/script to run:

```powershell
node scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs
node scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs
```

schema/counts:

- declared CC-BY-SA partitions: `37`
- declared CC-BY-SA source rows: `5581`
- sampled top-partition CC-BY-SA partitions: `5`
- sampled top-partition CC-BY-SA source rows: `4436`
- sampled unique works: `40`

validator: `node scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs`.

missing-field blocker: Agent 6/legal share-alike boundary treatment, attribution display/export rule, commercial export authorization if any, and public/runtime/display authorization if any.

handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.

stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

## CC-BY-SA Top Partitions

| source name | rows | works | version source |
| --- | ---: | ---: | --- |
| `Arukh HaShulchan, Orach Chayim -- Wikisource` | `2452` | `1` | `http://he.wikisource.org/wiki/%D7%A2%D7%A8%D7%95%D7%9A_%D7%94%D7%A9%D7%95%D7%9C%D7%97%D7%9F_%D7%90%D7%95%D7%A8%D7%97_%D7%97%D7%99%D7%99%D7%9D_%D7%90` |
| `Arukh HaShulchan, Yoreh De'ah -- Wikisource` | `834` | `1` | `https://he.wikisource.org/wiki/%D7%A2%D7%A8%D7%95%D7%9A_%D7%94%D7%A9%D7%95%D7%9C%D7%97%D7%9F` |
| `Miqra according to the Masorah` | `578` | `36` | `https://he.wikisource.org/wiki/%D7%9E%D7%A9%D7%AA%D7%9E%D7%A9:Dovi/%D7%9E%D7%A7%D7%A8%D7%90_%D7%A2%D7%9C_%D7%A4%D7%99_%D7%94%D7%9E%D7%A1%D7%95%D7%A8%D7%94` |
| `Maaseh Rokeach, Amsterdam 1740` | `321` | `1` | `https://he.wikisource.org/wiki/%D7%9E%D7%A2%D7%A9%D7%94_%D7%A8%D7%95%D7%A7%D7%97_%D7%A2%D7%9C_%D7%94%D7%9E%D7%A9%D7%A0%D7%94` |
| `ויקיטקסט` | `251` | `1` | `https://he.wikisource.org/wiki/%D7%9E%D7%9C%D7%97%D7%9E%D7%95%D7%AA_%D7%94%27_(%D7%99%D7%97%D7%99%D7%90_%D7%A7%D7%90%D7%A4%D7%97)` |

## Boundary

Evidence/blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC-BY-SA commercial export authorization, or public/runtime mutation.
