# Agent 12 To Agent 13: Orot 1/2/4 Support Matrix

Date: 2026-06-03
Status: executive support advisory only

## Boundary

This is an Agent 12 limiter/support packet for Agent 13, Agent 10, and the Agent 1/2/4 wartime lanes. It is not a command, worker-routing authority, QA acceptance, source/provenance acceptance, license clearance, public/runtime acceptance, publication readiness, Definition authority, usage-as-definition authority, product/data acceptance, answer-row acceptance, or accepted translation text.

## Current State

Agent 13's 1/2/4 involvement is already live under the wartime override and Agent 10 release-owner lane. Current artifacts show the Orot definition-fill path has moved beyond discovery:

- Agent 10 license-safe transform contract: `reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md`
- Agent 2 Sefaria hit audit: `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.md`
- Agent 2 public-domain-observed preview: `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.md`
- Agent 10 prefix/stem Agent-6-ready contract: `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.md`
- Agent 10 project-preferred Agent-6-ready contract: `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.md`
- Agent 1 missing linkage candidates: `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json`
- Agent 4 runtime gate: `reports/agent4-orot-fill-runtime-gate-2026-06-03.md`
- Agent 12 budget boundary: `reports/agent12-orot-fill-budget-boundary-2026-06-03.md`

## Lane Matrix

| Lane | Useful Next Work | Cap |
| --- | --- | --- |
| Agent 1 | Review only the source/license/linkage blockers that currently gate Orot fill: Sefaria family custody posture, 13 missing lexicon-linkage candidates, and any Agent 6-requested source rows. | Do not ask Agent 1 for broad source custody recrawls, source tracking, staging, manifest mutation, or license clearance claims. |
| Agent 2 | Continue deterministic zero-or-safe transform/dry-run work: public-domain-observed candidate preview, prefix/stem candidate contracts, and candidate patch dry runs that emit no public output before approval. | Do not ask Agent 2 for broad imports, answer-row emission, semantic arbitration, direct route-shard edits, or `answer_eligible=true` before Agent 1/6 and Agent 13 gates are satisfied. |
| Agent 4 | Hold runtime proof capacity for changed packages only: local/live browser proof, click behavior, old-HUD exposure, payload thresholds, and runtime gate checks after Agent 10 has a candidate package. | Do not spend Agent 4 on Orot browser/render proof while the current work is still contract/spec/Agent-6-review only. |

## Required Decision/Review Gates

Agent 6-required:

- Review `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.md`.
- Review `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.md`.
- Define whether any Sefaria family can move beyond metadata/planning into storage/display.

Agent 13-required:

- Decide candidate-label policy for pre-HUD reader convenience labels that remain non-authoritative.
- Decide whether project-preferred lexical arbitration may select one candidate when competing non-project edges exist.
- Decide any top-N expansion above the Agent 12 budget boundary.

Agent 10-required:

- Keep Agent 1/2/4 work sequenced through contract gates.
- Run only bounded dry-run pilots until `final_hint_occurrences > 40073` and old-HUD scans remain `0`.
- Route changed public/runtime packages to Agent 4 only after a candidate package exists.

## Limiter Recommendation

CLEAR: Agent 13 involving Agents 1, 2, and 4 for this Orot fill path, because each lane now has concrete bounded artifacts.

CAP: Do not send separate exploratory prompts to all three workers unless a current artifact is missing. Current evidence suggests the efficient path is Agent 10 sequencing from existing artifacts, not new broad worker discovery.

ROUTE_AGENT6_REQUIRED: The two Agent 10 contract packets and the Sefaria family custody/display boundary must go through Agent 6 before answer eligibility, reader-facing text, or public package mutation.

CAP Agent 4 spend: Agent 4 should be reserved for runtime proof after Agent 10 has a changed candidate package, not while the lane is still at contract review.

## One-Line Operating Rule

Use Agents 1, 2, and 4 as a sequence, not a swarm: Agent 1 clears source/license/linkage blockers, Agent 2 emits only zero-or-safe candidate transforms, Agent 6/13 decide the contract boundary, Agent 10 packages a bounded pilot, and Agent 4 proves runtime behavior only after package change.

## Not Accepted

- QA acceptance
- Source/provenance acceptance
- License clearance
- Public/runtime acceptance
- Publication readiness
- Route publication support
- Definition authority
- Usage-as-definition authority
- Product/data acceptance
- Answer-row acceptance
- Translation output
- Accepted translation text
