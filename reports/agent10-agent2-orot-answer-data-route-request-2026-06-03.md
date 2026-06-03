# Agent 10 Request To Agent 2: Orot Answer-Data Route

Status: pipeline-only request artifact.

Addressed to: Agent 2.

Request owner: Agent 10.

Highest permissible claim: this file requests bounded answer-route data needed for a future Orot dry run. It does not claim Definition authority, accepted gloss, accepted translation text, source custody, QA acceptance, public/runtime acceptance, publication readiness, or translation output.

## Objective

Create Agent 2 answer-route data for Orot tokens that currently cannot receive safe reader hints. The intended pipeline result is a later Agent 10 dry run where `final_hint_occurrences > 40073` while denylist and old-HUD scans remain clean.

## Inputs

Use these existing plans as the starting contract:

- `.codex-tmp/hud-deploy-live/reports/agent10-orot-pipeline-answer-data-route-2026-06-03.md`
- `reports/agent2-orot-top-gap-answer-route-plan-2026-06-03.md`

Current Orot facts from Agent 10 sidecar scouting:

- Reader hints: `8729` token IDs / `40073` occurrences.
- Orot total: `17307` unique token IDs / `59806` occurrences.
- Full gap: `8578` no-answer-or-ambiguous token IDs / `19733` occurrences.
- Existing route cards but no answer-eligible card: `4337` tokens / `10340` occurrences.
- Ambiguous answer candidates: `2836` tokens / `7559` occurrences.
- No route cards: `1405` tokens / `1834` occurrences.

## Allowed Pipeline-Only Work

Agent 2 may produce source-backed answer-candidate route data and ambiguity-resolution evidence only. Acceptable work includes:

- Create a bounded JSONL answer-candidate packet for Orot gap tokens.
- Generate separate answer-candidate rows rather than relabeling evidence/form-reference rows.
- Mark `answer_eligible: true` only when the candidate is source-backed, boundary-safe, and compatible with the current route answer contract.
- Use `answer_role: "answer"` or `"reader_answer"` only for candidate answer rows, not for evidence-only rows.
- Emit disambiguation evidence for ambiguous tokens; leave tokens ambiguous when pipeline evidence cannot separate candidates.
- Record blockers for no-route-card tokens where no source-backed route row exists.
- Run local pipeline validation or dry-run measurement needed to report the pass conditions, without mutating public HUD outputs.

## Forbidden Work And Non-Acceptance Boundaries

Do not mutate code, public HUD assets, public route packages, live/runtime output, or old HUD files for this request.

Do not directly edit generated HUD lookup shards as a shortcut. Do not flip existing `phrase_evidence`, `citable_paraphrase_evidence`, strict form-reference, or audit/evidence rows into answers unless a new Agent 2 pipeline-authorized answer-candidate row supports that status.

This request does not authorize Agent 2 to claim Definition authority, accepted gloss, accepted translation text, source custody, QA/public/runtime acceptance, publication readiness, or translation output.

## Expected Outputs

Preferred output names:

- `.local-cache/definition-routes/agent2-orot-answer-route-candidates-2026-06-03.jsonl`
- `reports/agent2-orot-answer-route-candidates-2026-06-03.md`
- `reports/agent2-orot-answer-route-disambiguation-2026-06-03.json`
- `reports/agent2-orot-answer-route-disambiguation-2026-06-03.md`
- `reports/agent2-orot-answer-route-blockers-2026-06-03.md`

Each candidate JSONL row should include token ID, Hebrew surface, normalized key, stable route/claim ID, route type/family, candidate answer text field consumed by the route pipeline, `candidate_status`, `answer_eligible`, `answer_role`, `boundary_safe`, source/license/citation fields, and an evidence note or blocker reason.

## Pass Conditions

After Agent 2 data is available and Agent 10 performs the downstream dry run, the packet is useful only if all of these hold:

- `final_hint_occurrences > 40073`
- Denylist scan total: `0`
- Old-HUD scan total: `0`

Report the measured values and exact artifact paths used for the measurement.

## Routing Back

Route back to Agent 10 when the JSONL/report packet exists, when the measured pass conditions are available, or when a specific blocker prevents producing safe answer-route data.

Route to Agent 4 only after Agent 10 creates a changed Orot package that passes local scans and needs browser proof. Agent 4 is not needed for the Agent 2 data packet itself.

Route to Agent 6 only for QA/non-acceptance boundary review or acceptance questions. Agent 6 is not asked to approve this request artifact, and this file is not a QA acceptance artifact.
