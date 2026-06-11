# Agent 6 Validation Cycle

Generated: 2026-06-04T05:34:29.855Z
Agent: Agent 6, independent QA/compliance authority

## Verdict

- Publication gate: blocker - No publication render artifact and zero accepted rendered rows.
- Definition integrity gate: warning - Definition data is coherent, but multi-answer authority warnings remain.
- Public HUD truth gate: pass - Public HUD page contract coverage passed.
- Provenance/source-license gate: warning - 86 untracked source files remain outside tracked audit scope.
- Usage boundary gate: pass - Agent 3 usage layer remains non-authoritative.
- Agent 5 control gate: warning - 0 Agent 5 readiness issues, 3 warnings.

## Validator Results

| gate | validator | status | exit |
|---|---|---:|---:|
| publication | Publication render contract | not_run | null |
| definition | Definition sources | not_run | null |
| definition | Definition outputs | not_run | null |
| definition | HUD route release stamp | not_run | null |
| definition | HUD route release gate | not_run | null |
| definition | HUD route lookup | not_run | null |
| definition | Public HUD route lookup | not_run | null |
| definition | Route answer safety | not_run | null |
| definition | Route publication boundary | not_run | null |
| usage | Agent 6 usage boundary packet | not_run | null |
| usage | Usage concordance | not_run | null |
| control | Agent 5 control readiness | not_run | null |
| provenance | Source license labels | not_run | null |
| provenance | Translation memory | not_run | null |
| provenance | Translation memory license profiles | not_run | null |

## Definition Integrity Counts

- Cards scanned: 539661
- Answer-eligible cards: 18683
- Non-answer cards: 520978
- Source rows checked: 832792
- Definition machine-contract issue count: 0
- Usage/evidence cards: 400000
- Usage/evidence-to-definition leaks: 0
- Publication-readiness field leaks: 0
- Multi-answer tokens: 1901
- Multi-answer tokens with distinct definitions: 1864

## Public HUD Counts

- Current HUD pages: 1360
- Pages with article.dataset.rankBasis: 1360
- Pages missing article.dataset.rankBasis: 0
- Pages containing Rank details: 0
- Pages containing Clicked Hebrew form: 0
- Representative failures: 10

## Publication/Provenance Counts

- Publication status: blocked_no_render
- Rendered rows: 0
- Accepted decision rows: 0
- Unknown-license manifest sources: 0
- Sefaria manifest sources: 0
- Route cards unsafe for accepted translation-output support: 335103
- Answer-eligible route cards unsafe for accepted translation-output support: 17737
- Untracked source files: 86
- Untracked source units: unknown
- Untracked source license counts: none
- Untracked source names: not enumerated
- Source-license audit note: Untracked source file count is inferred from current data/sources file count minus the tracked-file count reported by audit_source_license_labels.mjs. This Node report generator does not spawn git in sandboxed runs.

## High-Risk Samples

Multi-answer samples:
- א־: 7 answer cards, 7 distinct definitions
- א־פ־ה: 2 answer cards, 2 distinct definitions
- אב: 3 answer cards, 3 distinct definitions
- אבא: 2 answer cards, 2 distinct definitions

Changed-since-release inputs:
- source-phrase-evidence.jsonl: frozen 355922433 bytes; current 24658367052 bytes
- source-citable-paraphrase-evidence.jsonl: frozen 493745179 bytes; current 566201208 bytes

Representative HUD failures:
- tanakh/genesis/index.html: unexpected data-hud marker: data-hud-runtime-contract
- tanakh/exodus/index.html: unexpected data-hud marker: data-hud-runtime-contract
- halakhah/urim-vetumim-urim/index.html: unexpected data-hud marker: data-hud-runtime-contract
- halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html: unexpected data-hud marker: data-hud-runtime-contract
- jewish-thought/kuzari/index.html: unexpected data-hud marker: data-hud-runtime-contract
- midrash/yefeh-toar-on-bereshit-rabbah/index.html: unexpected data-hud marker: data-hud-runtime-contract
- targum/targum-jonathan-on-genesis/index.html: unexpected data-hud marker: data-hud-runtime-contract
- mishnah/mishnah-berakhot/index.html: unexpected data-hud marker: data-hud-runtime-contract
- chasidut/baal-shem-tov/index.html: unexpected data-hud marker: data-hud-runtime-contract
- gra/aderet-eliyahu/index.html: unexpected data-hud marker: data-hud-runtime-contract

## Relay

Owner: Agent 5

```text
Agent 5, Agent 6 validation cycle keeps publication blocked_no_render. Do not describe publication as waiting on cleanup or ready pending legal review. Acceptance condition remains: a real publication render artifact exists, every rendered row points to an accepted decision row, license_profile.direct_translation_use_ok=true, manifest source match exists, attribution bundle is present where required, and workbench_ok_publication_review rows are excluded unless an explicit output-license decision exists.
```

## Boundary

This cycle validates existing artifacts and writes Agent 6 reports only. It does not implement fixes, regenerate broad site renders, publish translation output, commit, or push.
