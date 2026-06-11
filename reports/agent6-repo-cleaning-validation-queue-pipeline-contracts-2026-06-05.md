# Agent 6 Repo Cleaning, Validation, and Queue Pipeline Contracts - 2026-06-05

## Disposition

CONTRACT-AUTHORED / NOT IMPLEMENTED.

These are reusable Agent 6 pipeline contracts for later durable implementation and bounded repetitive execution. They do not stage, delete, revert, clean, publish, activate control state, accept queued work, or clear any QA/product/source/runtime gate.

## Effective Boundary

Agent 6 may:

- classify dirty repo state;
- validate repo-dirt classification artifacts through dated Agent 6 dockets when QA/compliance relevant;
- validate queued Agent 6 items through normal dated docket flow;
- propose non-destructive batches and exact blockers.

Agent 6 may not:

- run `git add -A`;
- run `git reset --hard`;
- blindly delete files;
- authorize destructive cleanup from classification alone;
- treat Agent 6 validation as Agent 7 approval/publication/activation where Agent 7 approval is required;
- create product/source/license/legal/runtime/publication/answer acceptance beyond exact dated Agent 6 docket boundaries.

## Contract Table

| pipeline | target scope | inputs | command/script | output artifact/schema | validator/docket rule | queued-item handling | Agent 7 handoff | blocker | stop condition |
|---|---|---|---|---|---|---|---|---|---|
| repo-cleaning classification pipeline | full working tree dirt, grouped by tracked deletion, tracked modification, tracked addition, untracked file, path family, and cleanup risk | `git status --porcelain=v1 -z --untracked-files=all`; `git rev-parse --show-toplevel`; `git branch --show-current`; `git rev-parse --short HEAD`; optional prior classification docket | proposed durable script: `node scripts/classify_agent6_repo_dirt.mjs --output reports/agent6-repo-dirt-classification-support-YYYY-MM-DD.json --markdown reports/agent6-repo-dirt-classification-support-YYYY-MM-DD.md`; current manual fallback is the Node status parser used in `reports/agent6-repo-dirt-classification-support-2026-06-05.md` | Markdown docket plus JSON summary. Required JSON keys: `artifact`, `date`, `agent`, `disposition`, `scope`, `repo`, `counts`, `path_family_counts`, `deletion_classification`, `proposed_batches`, `exact_blockers`, `must_not_be_accepted`, `stop_condition` | Validator must prove counts reconcile to status snapshot, artifact parses, no destructive action is claimed, no acceptance words exceed classification boundary. Agent 6 docket may validate classification as QA support only. | Queue is not changed. If dirty tree blocks a queued item, add an exact blocker reference in the classification docket and leave queued item pending. | Required if classification would change control state, release priority, staffing, publication path, durable law, or activation wording. | Missing or unreadable git status; status parser cannot reconcile counts; requested cleanup lacks classification; public/runtime/source/control dirt is too broad to batch safely; destructive action requested without owner approval. | Classification artifact exists with counts, category labels, proposed non-destructive batches, exact blockers, handoff owners, and no destructive action taken. |
| repo-validation pipeline | validation of repo-dirt classification and proposed cleanup/staging batches before any cleanup action | latest classification Markdown/JSON; selected proposed batch; `git status --porcelain=v1 -z --untracked-files=all`; optional file existence sample; optional queue-health report | proposed durable script: `node scripts/validate_agent6_repo_dirt_classification.mjs reports/agent6-repo-dirt-classification-support-YYYY-MM-DD.json`; optional batch validator: `node scripts/validate_agent6_repo_dirt_batch.mjs --classification <json> --batch <batch-id>` | Validation receipt plus dated Agent 6 docket. Required fields: `repo_scope`, `files_classified`, `category_counts`, `queued_items_also_validated`, `proposed_non_destructive_batch`, `exact_blocker`, `agent7_approval_publication_need`, `handoff_owner`, `stop_condition` | If QA/compliance relevant, Agent 6 must issue a dated docket. Docket may only validate the classification/batch boundary, not product/runtime/source/license acceptance. JSON parse and count reconciliation are minimum checks. | If same safe pass also checks queue health, keep it as separate section: queue health only, no queued item acceptance unless a separate item-specific verdict section is included. | Required for any control-state publication, durable-law update, strategy/staffing change, publication-path change, release activation, or cleanup/staging plan that affects public/runtime/source/control surfaces. | Classification artifact missing; current git status materially changed without refresh; batch contains mixed owners/lane families; batch includes public/runtime/source/control files without owner packet; deleted files appear in cleanup batch without exact replacement/quarantine proof. | Validation docket exists; batch is either warned/cleared for non-destructive staging proposal only, or blocked with exact owner and missing evidence. |
| queued-item validation pipeline | Agent 6 queue items requiring pass/warn/block or exact blocker | `data/control/agent6_validation_queue.json`; `reports/agent6-validation-workhorse-operating-protocol-2026-06-01.md`; item evidence artifacts; item validators; prior Agent 6 dockets for same scope | existing queue intake validator: `node scripts/validate_agent6_validation_queue.mjs`; proposed item runner: `node scripts/select_agent6_queue_item.mjs --risk-order --max-items 1`; proposed evidence checker: `node scripts/validate_agent6_queue_item_evidence.mjs --request-id <id>` | Dated Agent 6 item verdict docket. Required fields: `request_id`, `gate`, `scope`, `evidence_reviewed`, `validators_run`, `disposition`, `row_or_subset_boundary`, `warnings`, `blockers`, `affected_agents`, `affected_gates`, `what_must_not_be_accepted`, `agent8_callback_if_routed`, `stop_condition` | Queue health pass is not item acceptance. Item remains pending until dated Agent 6 verdict exists. A verdict must preserve claimed boundary or narrow it; it must not widen product/data/source/runtime/publication acceptance by implication. | Select highest-risk pending item first unless owner/user/Agent 7 provides exact priority. Do not merge unrelated queued items in one verdict unless boundaries are trivially identical and separately enumerated. | Required if verdict requires control-state publication, law promotion, strategy/staffing change, public/runtime activation, publication path movement, or durable queue-state update beyond recording returned docket. | Evidence artifact missing; validator missing or failing; requested claim exceeds artifact; item asks for publication while `blocked_no_render`; source/license/provenance claim lacks row/source linkage; usage rows can become definition authority; public/runtime proof lacks route/click/source/license evidence. | One dated Agent 6 verdict or exact blocker exists for selected item; queue/control updates are left to Agent 5/7 unless exact owner/user authorization says otherwise. |

## Current Calibration Snapshot

The repo-cleaning classification pipeline is calibrated against `reports/agent6-repo-dirt-classification-support-2026-06-05.md` and `.json`.

Observed counts:

- Dirty records: `17239`
- Tracked deletions: `12231`
- Tracked modified records: `1490`
- Tracked added records: `22`
- Untracked records: `3496`
- `data/public-hud` dirty records: `11937`
- `reports` dirty records: `2777`
- site-page dirty records: `1541`
- `scripts` dirty records: `442`
- `data/control` untracked records: `16`

Observed queue-health baseline:

- Queue artifact: `data/control/agent6_validation_queue.json`
- Queue version observed: `67`
- Queue items observed: `37`
- Pending/queued-like items observed: `6`
- Queue validator command: `node scripts/validate_agent6_validation_queue.mjs`
- Queue validator result observed: passed with `0` warnings

These calibration counts are snapshot values only. Any future execution must refresh live counts before writing owner-facing acceptance or blocker language.

## Required Pipeline Implementation Backlog

The contracts above reference proposed durable scripts that do not become available merely by being named here. Implementation should be separately packeted before repetitive lower-intelligence execution.

Required scripts:

- `scripts/classify_agent6_repo_dirt.mjs`
- `scripts/validate_agent6_repo_dirt_classification.mjs`
- `scripts/validate_agent6_repo_dirt_batch.mjs`
- `scripts/select_agent6_queue_item.mjs`
- `scripts/validate_agent6_queue_item_evidence.mjs`

Minimum implementation requirement:

- scripts must be read-only except explicit output artifacts;
- scripts must refuse destructive git commands;
- scripts must emit machine-readable JSON;
- scripts must preserve `must_not_be_accepted`;
- scripts must fail closed on missing evidence;
- scripts must not update queue/control state unless a separate Agent 7/5 publication path authorizes it.

## Exact Blockers

1. Durable churn is blocked until the proposed scripts or equivalent exact commands exist and are validated.
2. Repo cleanup is blocked from destructive execution until each file family is classified and owner/release-lane approval exists.
3. Public/runtime cleanup is blocked by `11937` `data/public-hud` dirty/deleted records until Agent 10/release-owner changed-input proof explains replacement, quarantine, or accidental loss.
4. Control-state cleanup is blocked by `16` untracked `data/control` files until Agent 5/7 publish, reject, or mark them local-only.
5. Queue-item acceptance remains blocked per item until a dated Agent 6 verdict names the exact item, evidence, boundary, disposition, and non-acceptance limits.

## Agent 7 Approval / Publication Need

Agent 7 approval/publication remains required for:

- control-state activation;
- strategy or staffing changes;
- durable law/SOP publication;
- publication-path or release activation;
- durable queue-state recording beyond an Agent 6 docket artifact.

Agent 6 dockets may support those actions, but they do not substitute for Agent 7 publication where the pipeline requires Agent 7.

## Stop Condition

The three reusable contracts are authored with target scope, inputs, command/script, output artifact/schema, validator/docket rule, queued-item handling, Agent 7 handoff, blockers, and stop conditions. No implementation, staging, deletion, cleanup, queue-state update, control-state activation, product acceptance, source/license/legal acceptance, public/runtime acceptance, Definition authority, answer eligibility, publication readiness, accepted text, commercial export authorization, NC commercial authorization, or release action is created by this artifact.

