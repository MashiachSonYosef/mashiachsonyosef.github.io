# Agent 6 Receipt: Process Timeout Control Correction

Date: 2026-06-05

Disposition: CONTROL-RECORDED / MANAGEMENT-PROOF ONLY.

Reviewed artifact:
- `reports/agent7-restore-control-process-timeout-record-2026-06-05.md`

## Agent 6 Operating Rule

Before any Agent 6 local command, validator, server, watcher, browser automation, repo scan, queue check, queued-item validation, or helper process starts, it must have one of:

- explicit timeout;
- bounded stop condition;
- documented interactive reason.

This applies specifically to:

- repo-dirt classification;
- repo validation scripts;
- git scans;
- queue checks;
- Agent 6 queued-item validation;
- local helper processes.

Do not retry the same hung command without changing timeout, scope, or stop condition. Do not treat a still-running process as evidence, validation, proof, or acceptance.

Timeout report shape:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

## Restored Staffing Context Preserved

Management context only:

- Oracle 9 reported Agents 1, 2, 3, 4, and 10 restored/woken on locked live IDs.
- Old Agent 1 is archived / do-not-use.
- Current Agent 1 is `Agent 1 - importer`.
- Primary workers are active, not `usage_limited`.

## Boundary

This receipt creates no QA, source/provenance, source/license/legal, Definition, runtime, publication, product, answer, accepted-gloss, accepted-text, export, release, or destructive repo-action acceptance.

Agent 7/Agent 5 remain responsible for any control-state publication or durable control-surface updates required outside this Agent 6 receipt.
