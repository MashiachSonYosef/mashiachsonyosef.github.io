# Agent 10 Agent-6-Ready Orot Reader-Hint Candidate Patch Docket

Generated: 2026-06-03T09:58:10.645Z

## Boundary

- Evidence-only Agent 6 review docket for the non-public Orot reader-hint candidate patch.
- This does not claim an Agent 6 verdict, QA acceptance, source custody, source/provenance acceptance, Definition authority, usage-as-definition authority, public/runtime acceptance, publication readiness, public HUD mutation, route JSONL mutation, accepted gloss, or accepted translation text.
- Candidate counterpart text remains a review-only reader convenience candidate.

## Review Request

- Target agent: Agent 6
- Requested verdict type: pass_warn_block_on_evidence_packet_only
- Review target: Orot non-public reader-hint candidate patch evidence sufficiency

Specific questions:

- Do the two upstream Orot contract packets provide sufficient evidence for the 31-row candidate patch review boundary?
- Does the candidate patch preserve preview-only derivation, row bijection, selected source rows, competing edges, and non-acceptance flags?
- Is the packet sufficient for Agent 13 candidate-label policy review before any public mutation?
- What exact blocker remains before a later approved public reader-hint transform may be attempted?

## Summary

- Status: warn_agent6_ready_review_docket_not_accepted
- Candidate patch rows / occurrences: 31 / 1202
- Prefix/stem rows: 12
- Project-preferred rows: 19
- Competing edge rows / total edges: 19 / 46
- Approved rows: 0
- Public emit ready rows: 0
- Answer eligible rows: 0
- Public HUD rows emitted: 0
- Route JSONL rows emitted: 0
- Match percent available / missing rows: 0 / 31
- Missing-linkage rows / occurrences outside patch: 13 / 129
- Live old HUD exposure: no
- Live guard status: warn_live_public_old_hud_guard
- Hard old marker hits: 0
- Validation commands passed / total: 5 / 5
- Issues: 0
- Warnings: 1

## Inputs

- candidate_patch: reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json
- candidate_patch_sha256: 06c8fb307852ad533ab029d563ef54e0a49512e202052756b39d66a49978929c
- preview: reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json
- preview_sha256: bf8d9b614463341f2ac8057b19f051ccc2bb3c5a0af84262677e6948b1fd3d2a
- prefix_contract: reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json
- prefix_contract_sha256: e3bfb5ebf3c74f37f1d5c624f856575595235a5038be68ac50e45cde3a4ffb7c
- project_preferred_contract: reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json
- project_preferred_contract_sha256: 6cf1d4a19af089a0f27af6e8277e10b47261b92e7359f06a9378161d8272d2c9
- live_old_hud_guard: reports/agent10-live-public-old-hud-guard-2026-06-03-post-orot-reader-hint-candidate-patch.json
- live_old_hud_guard_sha256: d5523c45c8c5bc070927088b894c33bbd8d963df7668732f5fbea23a287eda40

## Validation Evidence

- node scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json: exit=0
- node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json: exit=0
- node scripts/validate_agent10_orot_prefix_stem_contract_packet.mjs reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json: exit=0
- node scripts/validate_agent10_orot_project_preferred_contract_packet.mjs reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json: exit=0
- node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html: exit=0

## Live Old-HUD Guard

- Artifact: reports/agent10-live-public-old-hud-guard-2026-06-03-post-orot-reader-hint-candidate-patch.json
- Commit/deploy id: 5384567ceb62eca0587fd71df094dccde7678425
- Status: warn_live_public_old_hud_guard
- Old HUD exposure: no
- Hard marker hits: 0
- Watch marker hits: 1

## Allowed Next Routes

- Agent 6 pass/warn/block review of this review docket only.
- Agent 13 candidate-label policy decision if Agent 6 does not block evidence sufficiency.
- Agent 1 review of remaining missing-linkage rows before expanding beyond the 31-row candidate patch.

## Blocked Now

- No public Orot reader-hint mutation is allowed from this docket.
- No data/public-hud/orot/reader-hints.json write is allowed from this docket.
- No route JSONL/shard write is allowed from this docket.
- No Orot HTML or reader-workbench runtime asset edit is allowed from this docket.
- No accepted gloss, translation, source custody, Definition authority, usage-as-definition authority, or publication readiness claim is allowed from this docket.

## Issues

- None

## Warnings

- Live guard is WARN, not PASS; known watch-marker warning remains outside hard old-HUD exposure.

## What Must Not Be Accepted

- Agent 6 acceptance.
- QA acceptance.
- Validated public/runtime acceptance.
- Source custody.
- Source/provenance acceptance.
- Definition authority.
- Usage-as-definition authority.
- Translation output.
- Accepted gloss.
- Accepted translation text.
- Match percent authority.
- Public HUD mutation.
- Route JSONL mutation.
- Runtime asset mutation.
- Publication readiness.
- This docket as an approved reader-hint patch.

