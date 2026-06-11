# Agent 2 Definition Workbench Expansion Ceiling Blocker

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Task shape: `target | files | command/script written or run | output artifact | candidate/unmatched/no-hint counts | validator | missing-field blocker | Spark-1 handoff | stop condition`

## Target

Definition Workbench expansion beyond the validated 1000-row sample.

## Files

Current exact input:

- `.local-cache/workbench-evidence/token-inventory.json`
- `data/definitions/hud-route-lookup/manifest.json`
- `data/definitions/hud-route-lookup/shards/*`

Current pipeline:

- `scripts/build_definition_workbench_sample.mjs`
- `scripts/validate_definition_workbench_sample.mjs`

Current validated ceiling output:

- `data/definitions/definition-workbench-sample-1000.json`
- `reports/definition-workbench-sample-1000-report.md`
- `reports/agent2-definition-workbench-1000-sample-pipeline-package-2026-06-04.md`
- `reports/agent2-definition-workbench-1000-sample-pipeline-package-2026-06-04.json`

## Command / Script Run

Inventory ceiling check:

```powershell
node -e "const fs=require('fs'); const inv=JSON.parse(fs.readFileSync('.local-cache/workbench-evidence/token-inventory.json','utf8')); const top=Array.isArray(inv.top_tokens)?inv.top_tokens.length:null; console.log(JSON.stringify({top_tokens:top, keys:Object.keys(inv).slice(0,20)},null,2))"
```

Result:

```json
{
  "top_tokens": 1000,
  "keys": [
    "schema_version",
    "artifact_type",
    "generated_at",
    "generator",
    "policy",
    "inputs",
    "counts",
    "paths",
    "license_counts",
    "top_tokens",
    "blocked_rows_sample"
  ]
}
```

The current builder samples from `inventory.top_tokens`. Because the authoritative current inventory has exactly 1000 rows, a larger sample would not produce additional rows without a refreshed inventory input.

## Output Artifact

This blocker:

- `reports/agent2-definition-workbench-expansion-ceiling-blocker-2026-06-04.md`
- `reports/agent2-definition-workbench-expansion-ceiling-blocker-2026-06-04.json`

No 2000-row sample artifact was produced because the current input does not contain 2000 top-token rows.

## Candidate / Unmatched / No-Hint Counts

Current validated 1000-row ceiling:

- Rows: 1000.
- Rows with route cards: 996.
- Rows without route cards / no-hint repair targets: 4.
- Rows with complete source/license rows: 996.
- Multi-answer rows: 293.
- Status counts: `conflicting` 293, `missing` 4, `proposed_only` 361, `single_answer_source_complete` 342.
- Review status counts: `unreviewed_machine_sample` 1000.
- Answer eligibility emitted: 0.
- Public reader output emitted: 0.
- Route shard writes: 0.
- Public/runtime mutations: 0.

Expansion beyond current ceiling:

- Additional rows available from current inventory: 0.
- Next target rows available without refreshed inventory: 0.

## Validator

Current ceiling validator:

```powershell
node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-1000.json
```

Result:

```text
Definition Workbench sample validation passed. Rows: 1000.
```

## Missing-Field Blocker

`missing_larger_token_inventory_workset`

Required to unblock expansion beyond 1000 rows:

- refreshed `.local-cache/workbench-evidence/token-inventory.json` or a new named inventory path with more than 1000 `top_tokens`;
- exact build command using the refreshed inventory, for example `--inventory=<path> --limit=2000 --output=<path> --report=<path>`;
- output path;
- validator command;
- Agent 6 boundary question for the larger exact row count;
- stop condition.

This is an input/workset ceiling blocker, not a Definition authority blocker.

## Spark-1 Handoff

Do not route Spark-1 to rerun a 2000-row Definition Workbench sample on the unchanged current inventory.

Spark-1 handoff is allowed only after a refreshed or larger token inventory is supplied with an exact command, output path, validator, and Agent 6 boundary question.

## Agent 6 Boundary

No Agent 6 acceptance is requested here.

If a larger refreshed inventory workset is produced, the boundary question must remain limited to non-authoritative route-shape / reader-planning evidence only and preserve:

- `review_status=unreviewed_machine_sample`;
- no `review_status=verified`;
- no Definition authority;
- no answer eligibility;
- no accepted gloss/text;
- no public reader output;
- no route-shard edit;
- no public/runtime mutation.

## Stop Condition

Stop after recording the exact input ceiling blocker for expansion beyond 1000 rows. Continue only when a larger inventory workset or another exact definition/lemma/reader-hint target is supplied.

## Non-Acceptance Boundary

No Definition authority, answer acceptance, answer eligibility, accepted gloss/text, QA acceptance, source/provenance acceptance, license acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, public reader output, route-shard edit, or public/runtime mutation is claimed.
