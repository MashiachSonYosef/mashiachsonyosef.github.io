# Oracle repo shape snapshot - 2026-06-01

Snapshot taken from `C:\Users\owner\Documents\translations` while the tree was live.

## Head state

- Branch: `main`
- Remote: `origin/main`
- Ahead: `7` commits at last check
- Latest commit: `1825c5105 Add Definition Workbench source-ref buckets`
- Package entry: [`package.json`](../package.json)
- Build script: [`scripts/generate_corpus_reports.mjs`](../scripts/generate_corpus_reports.mjs)

## Size numbers

| Metric | Count |
| --- | ---: |
| Tracked files | 33,468 |
| Tracked text lines, indexed by `git grep --cached -I -c -e '^'` | 57,359,418 |
| Tracked blob bytes from `HEAD` | 21,805,068,642 bytes, about 20.31 GiB |
| Public HTML pages, tracked `*/index.html` | 1,343 |
| Tracked `data/lexical/*.manifest.json` files | 1,337 |
| Tracked lexical chunk JSON files | 3,831 |
| Tracked `scripts/`, `reports/`, and `data/definitions/` files | 8,445 |

## Dirty tree

| Metric | Count |
| --- | ---: |
| Dirty paths total | 2,201 |
| Modified tracked paths | 1,403 |
| Untracked paths | 798 |

Top dirty clusters:

| Count | Status | Link |
| ---: | --- | --- |
| 762 | modified | [`halakhah/`](../halakhah/) |
| 245 | untracked | [`data/`](../data/) |
| 209 | untracked | [`reports/`](./) |
| 117 | untracked | [`halakhah/`](../halakhah/) |
| 102 | modified | [`midrash/`](../midrash/) |
| 84 | modified | [`data/`](../data/) |
| 69 | untracked | [`chasidut/`](../chasidut/) |
| 68 | modified | [`tosefta/`](../tosefta/) |
| 61 | modified | [`mishnah/`](../mishnah/) |
| 55 | untracked | [`other/`](../other/) |

## Line distribution

| Lines | Files | Link |
| ---: | ---: | --- |
| 35,193,480 | 27,967 | [`data/`](../data/) |
| 11,062,317 | 2,931 | [`halakhah/`](../halakhah/) |
| 2,812,810 | 412 | [`midrash/`](../midrash/) |
| 1,586,218 | 101 | [`kabbalah/`](../kabbalah/) |
| 1,519,037 | 119 | [`chasidut/`](../chasidut/) |
| 1,155,988 | 196 | [`tanakh/`](../tanakh/) |
| 911,180 | 95 | [`musar/`](../musar/) |
| 708,107 | 148 | [`targum/`](../targum/) |
| 469,314 | 104 | [`jewish-thought/`](../jewish-thought/) |
| 403,646 | 60 | [`liturgy/`](../liturgy/) |
| 401,953 | 88 | [`gra/`](../gra/) |
| 240,215 | 264 | [`tosefta/`](../tosefta/) |
| 228,703 | 412 | [`mishnah/`](../mishnah/) |
| 225,324 | 46 | [`second-temple/`](../second-temple/) |
| 181,497 | 44 | [`ari/`](../ari/) |
| 75,794 | 221 | [`scripts/`](../scripts/) |
| 63,623 | 9 | [`other/`](../other/) |
| 37,017 | 8 | repository root |
| 30,013 | 207 | [`reports/`](./) |

`data/` and `halakhah/` together account for about 80.7 percent of tracked text lines.

## Byte distribution

| Bytes | Files | Link |
| ---: | ---: | --- |
| 19,533,356,259 | 27,967 | [`data/`](../data/) |
| 1,278,176,380 | 2,931 | [`halakhah/`](../halakhah/) |
| 241,029,986 | 412 | [`midrash/`](../midrash/) |
| 179,611,231 | 119 | [`chasidut/`](../chasidut/) |
| 137,630,079 | 101 | [`kabbalah/`](../kabbalah/) |
| 89,564,569 | 95 | [`musar/`](../musar/) |
| 74,529,129 | 196 | [`tanakh/`](../tanakh/) |
| 58,336,538 | 104 | [`jewish-thought/`](../jewish-thought/) |
| 47,649,961 | 148 | [`targum/`](../targum/) |
| 35,981,676 | 60 | [`liturgy/`](../liturgy/) |

`data/` accounts for about 89.6 percent of tracked bytes.

## Extension weight

| Files | Bytes | Extension |
| ---: | ---: | --- |
| 27,055 | 17,335,270,617 | `.json` |
| 3,331 | 1,987,398,340 | `.csv` |
| 1,343 | 1,852,509,212 | `.html` |
| 53 | 521,841,928 | `.jsonl` |
| 1,441 | 104,240,757 | `.md` |
| 212 | 3,542,507 | `.mjs` |
| 9 | 244,693 | `.ps1` |

## Largest tracked files

| Bytes | Link |
| ---: | --- |
| 67,358,262 | [`data/lexical/occurrences/beit-yosef.json`](../data/lexical/occurrences/beit-yosef.json) |
| 62,224,943 | [`data/lexical/occurrences/arukh-hashulchan.json`](../data/lexical/occurrences/arukh-hashulchan.json) |
| 61,164,124 | [`data/sources/arukh-hashulchan.json`](../data/sources/arukh-hashulchan.json) |
| 54,671,887 | [`halakhah/beit-yosef/index.html`](../halakhah/beit-yosef/index.html) |
| 54,593,555 | [`halakhah/arukh-hashulchan/index.html`](../halakhah/arukh-hashulchan/index.html) |
| 49,513,193 | [`data/sources/beit-yosef.json`](../data/sources/beit-yosef.json) |
| 49,262,865 | [`data/reports/audit/bad_matches.csv`](../data/reports/audit/bad_matches.csv) |
| 46,452,800 | [`data/sources/ohr-hachammah-on-zohar.json`](../data/sources/ohr-hachammah-on-zohar.json) |
| 45,767,848 | [`data/lexical/token-indexes/halakhah/arukh-hashulchan.json`](../data/lexical/token-indexes/halakhah/arukh-hashulchan.json) |
| 42,933,366 | [`data/lexical/token-indexes/halakhah/beit-yosef.json`](../data/lexical/token-indexes/halakhah/beit-yosef.json) |

## Operational landmarks

Definition Workbench:

- Latest source-ref bucket builder: [`scripts/build_definition_workbench_usage_source_ref_buckets.mjs`](../scripts/build_definition_workbench_usage_source_ref_buckets.mjs)
- Latest source-ref buckets: [`data/definitions/definition-workbench-usage-source-ref-buckets.json`](../data/definitions/definition-workbench-usage-source-ref-buckets.json)
- Crossmatch neighbors: [`data/definitions/definition-workbench-usage-crossmatch-neighbors.json`](../data/definitions/definition-workbench-usage-crossmatch-neighbors.json)
- Route resolution: [`data/definitions/definition-workbench-usage-route-resolution.json`](../data/definitions/definition-workbench-usage-route-resolution.json)
- Occurrence links: [`data/definitions/definition-workbench-usage-occurrence-links.json`](../data/definitions/definition-workbench-usage-occurrence-links.json)

HUD route and public surface:

- Route contract: [`data/definitions/hud-route-contract.json`](../data/definitions/hud-route-contract.json)
- Route fixtures: [`data/definitions/hud-route-fixtures.json`](../data/definitions/hud-route-fixtures.json)
- Lookup manifest: [`data/definitions/hud-route-lookup/manifest.json`](../data/definitions/hud-route-lookup/manifest.json)
- Release gate validation: [`reports/hud-route-release-gate-validation.md`](hud-route-release-gate-validation.md)
- Publication boundary coherence: [`reports/route-publication-boundary-coherence.md`](route-publication-boundary-coherence.md)

Control and audit pulse:

- Agent 5 control notes: [`reports/agent5-control-notes.md`](agent5-control-notes.md)
- Pipeline priority handoff: [`reports/agent5-pipeline-priority-handoff.md`](agent5-pipeline-priority-handoff.md)
- Validation queue health: [`reports/agent6-validation-queue-health.md`](agent6-validation-queue-health.md)
- Source scope recheck audit: [`reports/agent6-source-scope-recheck-audit-2026-06-01.md`](agent6-source-scope-recheck-audit-2026-06-01.md)
- Rollout watch: [`reports/route-hud-rollout-watch.md`](route-hud-rollout-watch.md)

## Shape read

This is not a normal small static site. It is a large generated corpus plus a public HTML surface, with `data/` as the real mass and `halakhah/` as the largest rendered publication lane. The operational center has shifted toward Definition Workbench, HUD route publication gates, source provenance, and validation packets.

The next useful control shape is a stable dashboard that records these same counts on every run, separates tracked/indexed counts from untracked generated spill, and links every drift cluster to the owning script, input contract, output packet, and validation report.
