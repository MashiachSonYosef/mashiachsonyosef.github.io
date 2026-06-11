# Agent 6 Definition Integrity Gate

Date: 2026-06-01
Agent: 6, independent QA/compliance authority
Scope: Agent 2 route/word-definition output at machine-contract level with stratified semantic QA

## Verdict

Status: warn

Agent 2's current public route/word-definition release candidate is acceptable as a definition-integrity data artifact with warnings. I found zero hard machine-contract blockers in the public lookup shards: answer roles are coherent, source/license rows survive, usage/evidence rows do not become definition authority, and route cards do not carry publication-readiness fields.

This is not publication readiness. Publication remains `blocked_no_render`.

The warning status is driven by three non-regen risks:

- The route/HUD output validator still fails one display-contract rule: `hud-route-contract: source/license rows must be expanded by default`.
- The current local route input cache has drifted after the stamped public release for two large evidence files.
- `answer_eligible` is not the same as a single accepted definition: 1,901 normalized tokens have multiple answer-eligible cards, including 1,864 with distinct answer definitions.

## Machine Evidence

Validators run:

- `node scripts\validate_definition_sources.mjs`: passed.
- `node scripts\validate_definition_outputs.mjs`: failed with 1 issue, `hud-route-contract: source/license rows must be expanded by default`.
- `node scripts\validate_hud_route_release_stamp.mjs`: passed for `hud-route-rc-2026-05-31T16-55-29-957Z`.
- `node scripts\validate_hud_route_lookup.mjs`: passed.
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`: passed.
- `node scripts\validate_route_answer_safety.mjs`: passed.
- `node scripts\validate_workbench_usage_agent6_boundary_packet.mjs`: passed, 11 checks and 49 selected rows.
- `node scripts\validate_workbench_usage_concordance.mjs`: passed, 2,390 rows.
- `reports/route-publication-boundary-audit.md`: 0 issues, 335,103 warnings for cards unsafe as accepted translation-output support.

Full public lookup shard sweep:

- Shards scanned: 7,990.
- Normalized tokens scanned: 175,216.
- Route cards scanned: 539,661.
- Answer-eligible cards: 18,683.
- Non-answer cards: 520,978.
- Source rows checked: 832,792.
- Cards with source rows: 539,661.
- Cards missing source rows: 0.
- Missing or invalid `answer_eligible`: 0.
- Missing `answer_role`: 0.
- `answer_eligible=true` without `answer_role=answer`: 0.
- `answer_role=answer` without `answer_eligible=true`: 0.
- Non-answer cards carrying `answer_score`: 0.
- Source rows missing required source/license fields: 0.
- Source rows with unknown/unallowed license labels: 0.
- Usage/evidence rows becoming definition authority: 0.
- Candidate/weak/ambiguous rows becoming definition authority: 0.
- Route cards carrying publication-readiness fields: 0.
- Route cards carrying publication-readiness language: 0.

Route-family counts:

- `wiktionary_definition`: 135,184.
- `source_phrase_evidence`: 200,000.
- `citable_paraphrase_evidence`: 200,000.
- `project_lexical`: 175.
- `openscriptures_definition`: 3,531.
- `wikidata_definition`: 771.

Source/license profile:

- `kaikki`: 294,549 source rows, all labeled `CC BY-SA 4.0 / GFDL`.
- `hebrew_source_text`: 400,000 source rows, all labeled `Public Domain`.
- `openscriptures`: 88,226 source rows, all labeled `CC BY 4.0`.
- `wikidata`: 48,984 source rows, all labeled `CC0`.
- `workspace`: 1,033 source rows, mostly `project-authored / CC0`.

## High-Risk Samples

Blocker sample failures: none.

Answer-eligible sample:

- `def-kaikki-lemma-1b9a10f074e6dc75`, normalized `א`, `wiktionary_definition`, `answer_eligible=true`, `answer_role=answer`, source family `kaikki`, license `CC BY-SA 4.0 / GFDL`.

Conflicting/multi-answer samples:

- Normalized `א־`: 7 answer-eligible cards, 7 distinct definitions.
- Normalized `א־פ־ה`: 2 answer-eligible cards, definitions include character/disposition and baking.
- Normalized `אב`: 3 answer-eligible cards, definitions include month, father, and growth/spreading sense.
- Normalized `אבא`: 2 answer-eligible cards, project lexical `Abba` and Kaikki `father`.

Kaikki/provenance-warning sample:

- 14,206 answer-eligible cards use `kaikki` source rows. This is HUD-safe only because source name, source ID, source URL, license, and license URL survive. It is not publication-safe without downstream license handling.

Changed-since-release samples:

- `.local-cache/definition-routes/source-phrase-evidence.jsonl`: frozen release bytes 355,922,433; current bytes 24,658,367,052.
- `.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl`: frozen release bytes 493,745,179; current bytes 566,201,208.

Usage/evidence samples:

- `source_phrase_evidence` cards: 200,000 public cards, all `answer_eligible=false`, `answer_role=evidence`, `definition="Usage context only; no meaning is forced by this phrase row."`
- `citable_paraphrase_evidence` cards: 200,000 public cards, all `answer_eligible=false`, `answer_role=evidence`.

Ambiguous/candidate/weak sample result:

- Public route cards exposed no `candidate`, `weak`, `ambiguous`, `blocked`, or `needs_review` status that became definition authority.
- Agent 3 usage concordance still has supported/candidate/weak rows, but validators preserve those as usage evidence, not final answer authority.

## Blocker Counts

Agent 2 route-card data blockers: 0.

Public lookup definition-authority blockers: 0.

Source/license survivability blockers: 0.

Usage-to-definition leakage blockers: 0.

Publication-readiness leakage blockers inside route cards: 0.

Display/handoff contract blocker outside Agent 2 route data: 1.

- `hud-route-contract.rendering_rules.source_license_expanded_by_default` is false while `scripts\validate_definition_outputs.mjs` requires it to be true.

Release-input drift warnings: 2.

Semantic authority wording warnings: 1,901 multi-answer normalized tokens; 1,864 have distinct answer definitions.

Translation-output warnings from publication-boundary audit: 335,103 route cards unsafe for accepted translation-output support; 17,737 are answer-eligible cards with unsafe-for-publication source rows. These are not Definition Integrity blockers, but must remain excluded from publication claims.

## Ownership

Agent 2:

- No required regeneration or route-data fix for the current public release candidate.
- Must not claim the current local route input cache is the released input set unless he regenerates, freezes, stamps, and reruns the gate.

Agent 5:

- Required handoff cleanup: say `answer_eligible` means "eligible for the HUD answer slot", not "accepted definition", "unique semantic answer", or "publication-ready translation support".
- Carry the 1,901 multi-answer warning in control notes so downstream UI/report wording does not overstate certainty.
- Carry the two changed-since-release inputs as release-discipline warnings.

Agent 4:

- If the public HUD displays source/license details collapsed by default, it remains at odds with the stricter definition-output validator. Either render them expanded by default or get Agent 6 approval to change the validator/contract. Do not hide source/license behind wording that makes provenance optional.

Agent 3:

- No correction required from this gate. Usage rows remain usage-navigation/concordance, not definitions.

## Acceptance Condition

Definition Integrity Gate can move from `warn` to `pass` when all are true:

- `node scripts\validate_definition_outputs.mjs` passes, or Agent 6 explicitly accepts a revised source/license display contract.
- Agent 5 handoff wording explicitly states that `answer_eligible` is HUD-route eligibility, not accepted/unique definition authority and not publication readiness.
- Agent 5 records that the current public release is tied to the frozen stamp, while current local route input drift requires a new freeze/stamp before any next release claim.

