# Agent 6 Validation Cycle

Generated: 2026-06-01T03:45:41.300Z
Agent: Agent 6, independent QA/compliance authority

## Verdict

- Publication gate: blocker - No publication render artifact and zero accepted rendered rows.
- Definition integrity gate: warning - Definition data is coherent, but multi-answer authority warnings remain.
- Public HUD truth gate: pass - Public HUD page contract coverage passed.
- Provenance/source-license gate: warning - 8 untracked source files remain outside tracked audit scope.
- Usage boundary gate: pass - Agent 3 usage layer remains non-authoritative.
- Agent 5 control gate: warning - 0 Agent 5 readiness issues, 4 warnings.

## Validator Results

| gate | validator | status | exit |
|---|---|---:|---:|
| publication | Publication render contract | pass | 0 |
| definition | Definition sources | pass | 0 |
| definition | Definition outputs | warning | 1 |
| definition | HUD route release stamp | pass | 0 |
| definition | HUD route release gate | pass | 0 |
| definition | HUD route lookup | pass | 0 |
| definition | Public HUD route lookup | pass | 0 |
| definition | Route answer safety | pass | 0 |
| definition | Route publication boundary | pass | 0 |
| usage | Agent 6 usage boundary packet | pass | 0 |
| usage | Usage concordance | pass | 0 |
| control | Agent 5 control readiness | pass | 0 |
| provenance | Source license labels | warning | 1 |
| provenance | Translation memory | pass | 0 |
| provenance | Translation memory license profiles | pass | 0 |

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

- Current HUD pages: 1281
- Pages with article.dataset.rankBasis: 1281
- Pages missing article.dataset.rankBasis: 0
- Pages containing Rank details: 0
- Pages containing Clicked Hebrew form: 0
- Representative failures: 0

## Publication/Provenance Counts

- Publication status: blocked_no_render
- Rendered rows: 0
- Accepted decision rows: 0
- Unknown-license manifest sources: 0
- Sefaria manifest sources: 0
- Route cards unsafe for accepted translation-output support: 335103
- Answer-eligible route cards unsafe for accepted translation-output support: 17737
- Untracked source files: 8
- Untracked source units: 6716
- Untracked source license counts: Public Domain: 5228, CC-BY: 1488
- Untracked source names: beer-hagolah.json, derashat-shabbat-hagadol.json, derush-al-hatorah.json, gevurot-hashem.json, machzor-rosh-hashanah-ashkenaz.json, ner-mitzvah.json, netivot-olam.json, netzach-yisrael.json
- Source-license audit note: Tracked source list supplied by reports/agent6-validation-cycle-tracked-sources.txt.

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
- None

## Relay

Owner: Agent 5

```text
Agent 5, Agent 6 validation cycle keeps publication blocked_no_render. Do not describe publication as waiting on cleanup or ready pending legal review. Acceptance condition remains: a real publication render artifact exists, every rendered row points to an accepted decision row, license_profile.direct_translation_use_ok=true, manifest source match exists, attribution bundle is present where required, and workbench_ok_publication_review rows are excluded unless an explicit output-license decision exists.
```

## Boundary

This cycle validates existing artifacts and writes Agent 6 reports only. It does not implement fixes, regenerate broad site renders, publish translation output, commit, or push.
