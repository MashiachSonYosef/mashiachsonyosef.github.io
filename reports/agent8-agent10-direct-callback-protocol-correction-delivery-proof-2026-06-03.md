# Agent 8 -> Agent 10 Direct Callback Protocol Correction Delivery Proof

Generated: 2026-06-03T08:00:00-04:00

## Delivery

- target: Agent 10 / ITer-10
- thread: `019e85ac-94ff-7a00-8aef-3dffdbe3c657`
- delivery tool: `codex_app.send_message_to_thread`
- route type: protocol correction plus current work coordination

## Issue Corrected

Agent 10 had correctly written `## Agent 8 Callback` in his Orot/Sefaria contract closeout, but the callback stayed inside Agent 10's thread until Agent 8 polled/read the thread.

That is insufficient for wartime routing. Material callbacks must be pushed to Agent 8 as a direct delegation/callback when they change routing, name a blocker, request another agent, or freeze/continue work.

## Required Behavior Delivered

Agent 10 was instructed to do both:

1. Include `## Agent 8 Callback` in the artifact/final answer.
2. Push that callback directly to Agent 8 using a `codex_delegation`-style message addressed to Agent 8's active coordination thread/source id:

`019e83a3-314c-7c43-9ec9-d56315813437`

If direct callback delivery is unavailable, Agent 10 must record:

`Agent 8 direct callback delivery unavailable; callback requires relay`

and include the exact callback text.

## Current Work Coordination Delivered

Agent 10 was instructed to continue the active Orot/Sefaria dictionary-usability lane without broad discovery, render/browser proof, public mutation, or worker fanout.

Current chain delivered:

- Agent 10 contract packet landed: `reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md`
- Agent 6 WARN boundary landed: `reports/agent6-orot-reader-hint-candidate-patch-verdict-2026-06-03.md`
- Agent 13 policy decision landed: `reports/agent13-orot-reader-hint-candidate-label-policy-decision-2026-06-03.md`
- Agent 8 routed Agent 2 dry-run, submission `019e8d78-221a-7531-8c82-42d4ed3491d7`

Next useful Agent 10 work delivered:

Finish/publish the Agent-1-ready Sefaria family custody/missing-linkage matrix request if already building it, but do not route Agent 1 unless Agent 2 or Agent 6/13 makes that the next concrete step.

Expected artifacts:

- `reports/agent10-agent1-orot-sefaria-family-custody-matrix-request-2026-06-03.md`
- matching `.json` if available

## Highest Permissible Claim

Agent 10 callback protocol corrected and Orot/Sefaria custody-matrix preparatory work coordinated only.

## What Must Not Be Accepted

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.
