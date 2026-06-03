# Agent 10 Orot Pipeline Answer Data Route - 2026-06-03

Status: exact pipeline route/blocker recorded.

Highest permissible claim: Agent 10 identified the pipeline data needed to fill Orot further. This is not QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted translation text, or translation output.

## Current Evidence

Input artifacts:

- `reports/agent10-orot-reader-hint-gap-queue-2026-06-03.json`
- `reports/agent10-orot-top-gap-route-audit-2026-06-03.json`
- `reports/agent10-orot-answer-contract-failure-audit-2026-06-03.json`

Current Orot Stage F coverage:

- Occurrence token count: `59806`
- Unique token id count: `17307`
- Final hint count: `8729`
- Final hint occurrences: `40073`
- Occurrence coverage: `67%`
- Remaining no-answer-or-ambiguous occurrences: `19733`
- Missing-source count: `0`

Top-gap audit:

- Top gap tokens audited: `25`
- No route cards: `1`
- Route cards exist but no answer-eligible cards: `18`
- Ambiguous answer candidates: `6`
- Missing token rows: `0`

Answer-contract failure audit:

- Tokens audited: `18`
- Route cards audited: `443`
- `explicit_answer_eligible_false`: `338`
- `section_not_answer_production`: `105`
- Dominant answer roles: `evidence` (`431`), `form_reference` (`12`)

## Existing Pipeline Behavior

The current reader-hints builder has no safe override flag for no-answer or ambiguous tokens. It selects a reader hint only when `selectRouteAnswer()` returns a non-ambiguous answer card.

- `.codex-tmp/hud-deploy-live/scripts/build_public_hud_reader_hints.mjs`

The current public route package builder cannot reduce the reader-hint gap by itself. It packages tokens already present in `reader-hints.json`.

- `.codex-tmp/hud-deploy-live/scripts/build_public_hud_route_package.mjs`

The source-side citable paraphrase builder currently emits citable rows as evidence, not reader answers:

- `scripts/build_citable_paraphrase_evidence.mjs`
- Row fields observed in script: `answer_eligible: false`, `answer_role: 'evidence'`

The HUD route-store builder only promotes paraphrase rows to answer cards when the row is already accepted by the pipeline contract:

- `scripts/build_hud_route_store.mjs`
- Required conditions include `candidate_status === 'accepted'`, `answer_eligible === true`, `boundary_safe !== false`, and answer role not being evidence/audit/form-reference.

Therefore the safe route is not a deployment flag. The safe route is new Agent 2 pipeline answer-candidate data or disambiguation data that passes the existing route-claim safety contract.

## Agent 2 Required Output

Agent 2 should produce one bounded answer-candidate packet for the top Orot gap tokens.

Preferred artifact shape:

- JSONL route rows under a local/cache or report-owned path, not direct public deploy.
- Each row must include:
  - stable route/claim id
  - Hebrew surface and normalized key
  - route family/type that the HUD route-store can consume
  - renderable definition/gloss/meaning claim as candidate evidence
  - `answer_eligible: true` only when Agent 2 can justify the row under the pipeline contract
  - `answer_role: "answer"` only for candidate answer rows
  - public source/license/citation rows
  - non-authority status/copy preserving reader-hint boundary

Forbidden shortcut:

- Do not flip existing `phrase_evidence` or `citable_paraphrase_evidence` evidence rows from `answer_eligible: false` to `true` without a new Agent 2 answer-candidate packet or contract-authorized generation path.

## Validation Route After Agent 2 Data Exists

Source-root validation:

```powershell
node scripts\audit_definition_route_claims.mjs --route-jsonl=<agent2-answer-candidate-jsonl> --output=reports\agent10-orot-agent2-answer-candidate-claim-audit-2026-06-03.json --report=reports\agent10-orot-agent2-answer-candidate-claim-audit-2026-06-03.md
node scripts\validate_definition_route_claim_audit.mjs reports\agent10-orot-agent2-answer-candidate-claim-audit-2026-06-03.json
```

Route-store rebuild, only after the claim audit passes:

```powershell
node scripts\build_hud_route_store.mjs
```

Deploy-worktree dry run, only after route-store/lookup data is rebuilt or otherwise made available to the public HUD package builder:

```powershell
node scripts\build_public_hud_reader_hints.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --source-clearance-report C:\Users\owner\Documents\translations\reports\agent1-orot-fill-source-row-evidence-2026-06-03.json --dry-run --report reports\agent10-orot-next-reader-hints-dry-run-2026-06-03.json
```

Pass condition for the dry run:

- `final_hint_occurrences > 40073`
- denylist output scan total remains `0`
- old-HUD marker output scan total remains `0`
- missing-source count remains `0`

Only then should Agent 10 rebuild the public Orot package and wake Agent 4 for browser proof.

## Agent Routing

Agent 1/source: not needed now. Current missing-source count is `0`.

Agent 2/definition-answer: needed now. Must create answer-candidate or ambiguity-resolution pipeline data.

Agent 4/browser proof: not needed until a new Orot package exists and passes local scans.

Agent 6/QA: needed only for acceptance review, not for this routing artifact.

Agent 7/13: needed only if Agent 2 says ambiguity resolution requires semantic authority or mission-level policy.

## Agent 8 Callback

Status: `orot_pipeline_answer_data_route_recorded`.

Artifact path: `reports/agent10-orot-pipeline-answer-data-route-2026-06-03.md`.

Selected page or blocker: Orot fill-in blocker is Agent 2 answer-candidate/disambiguation data; no deployment or source blocker currently identified.

Agent 1 needed: no.

Agent 2 needed: yes.

Agent 4 needed: no, not until package changes.

Agent 7/13 decision needed: only if Agent 2 escalates semantic ambiguity.
