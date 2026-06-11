# Agent 2 Weekly Definition / Reader-Hint Pipeline Authoring Status

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE / HYBRID
Source orders:

- `reports/oracle9-weekly-goal-mode-lexicon-expansion-order-2026-06-04.md`
- `reports/oracle9-emergency-agent-run-mode-if-sparks-down-2026-06-04.md`
- `reports/oracle9-token-limit-useful-pipeline-output-rule-2026-06-04.md`

## Minimum Handoff

`target | files/manifests | candidate rows/counts/unmatched/no-hint counts | next command/script | missing fields | Spark-2 or Agent handoff | Agent 6 boundary | stop condition`

## Target

Orot missed safe-dictionary reader-hint candidate builder/validator.

This is priority 1 from Oracle 9 weekly goal mode. Deuteronomy reader-hint, larger Definition Workbench expansion, and unmatched/no-hint coverage remain next pipeline targets only after exact inputs/schema/validator are supplied.

## Files / Manifests

Contracts:

- `reports/agent2-spark2-pipeline-contract-orot-missed-dictionary-reader-hints-2026-06-04.md`
- `reports/agent2-spark2-pipeline-contract-orot-missed-dictionary-reader-hints-2026-06-04.json`
- `reports/agent2-spark2-orot-missed-dictionary-reader-hint-pipeline-contract-2026-06-04.md`
- `reports/agent2-spark2-orot-missed-dictionary-reader-hint-pipeline-contract-2026-06-04.json`

Authored pipeline scripts:

- `scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`
- `scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`

Current run artifacts:

- `reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json`
- `reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md`

Key inputs:

- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `data/public-hud/orot/reader-hints.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json`
- `reports/oracle9-weekly-goal-mode-lexicon-expansion-order-2026-06-04.md`

## Counts / Rows Found

Current Agent 2 run:

- Candidate rows produced: 0.
- Candidate occurrences produced: 0.
- Commercial-clean candidate rows: 0.
- Noncommercial educational candidate rows: 0.
- Metadata-link-only rows: 0.
- Blocked rows: 0.
- Unmatched rows from current deterministic rule: 168.
- Remaining allowed dictionary rows after used-token exclusion: 0.
- Excluded existing public/packaged/prior-candidate token ids: 332.
- Answer-eligible rows: 0.
- Public HUD rows emitted: 0.
- Route JSONL rows emitted: 0.
- Route shard writes: 0.

Prior missed-dictionary evidence preserved:

- `reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json`
- Prior candidate rows: 50.
- Prior candidate occurrences: 1193.
- Current Agent 2 zero-row result means those deterministic candidates are now already public, packaged, or prior-candidate-consumed by the current input set.

## Next Command

Spark-2 or Agent 2 can now run the Agent2-owned pipeline directly:

```powershell
node scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs --limit=50 --output=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json --report=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md
node scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json
```

Validation result:

```text
Agent 2 Orot missed-dictionary reader-hint candidate validation passed for reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json. Rows: 0; occurrences: 0.
```

Contract JSON parse result:

```text
updated contract JSON parse passed
```

## Missing Fields

No builder/validator authorship blocker remains for the Orot missed safe-dictionary reader-hint candidate pipeline.

Current exact blocker to additional rows:

- `no_new_candidate_rows_on_current_inputs`: all deterministic candidates from the current Orot missed-dictionary input set are already public, packaged, or prior-candidate-consumed.

Missing for next weekly pipeline targets:

- Deuteronomy reader-hint pipeline requires exact input manifest, output schema, validator/gate, license flags, and Agent 6 boundary question.
- Larger Definition Workbench expansion beyond 500 rows requires exact workset command, output path, validator, and row/status contract.
- Unmatched/no-hint coverage by work/book requires exact work/book manifest, no-hint measurement definition, output schema, and validator.

## Handoff Owner

- Agent 2 owns definition/lemma/reader-hint pipeline authoring.
- Spark-2 may run this Orot pipeline mechanically now that the Agent2-owned builder and validator exist.
- Agent 10 is the first release-train consumer for whether this zero-candidate closure and prior 50 / 1193 evidence are useful.
- Agent 6 is required only if a concrete non-zero row/subset packet is routed for boundary review.

## Agent 6 Boundary

No Agent 6 acceptance is requested by this status artifact.

If a future run emits rows, the boundary question is: can the exact generated row/subset packet be treated as non-public reader-hint candidate evidence only, with zero answer eligibility, zero accepted gloss/text, zero Definition authority, zero public HUD output, zero route JSONL/shard writes, and preserved row-scoped source/license labels?

Agent 2 does not answer that question.

## Stop Condition

This packet stops after authoring the runnable Orot builder/validator, producing one current run artifact, validating it, and recording the zero-candidate closure on current inputs.

Do not proceed to Deuteronomy, larger workbench expansion, or unmatched/no-hint coverage until exact inputs/schema/validator are supplied.

## Non-Acceptance Boundary

No Definition authority, answer eligibility, answer acceptance, accepted gloss/text, QA acceptance, source/provenance acceptance, license acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, public reader output, route-shard edit, or public/runtime mutation is claimed.
