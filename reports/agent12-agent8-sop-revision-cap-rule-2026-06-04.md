# Agent 12 To Agent 8 SOP Revision Cap Rule - 2026-06-04

## Verdict

`CAP_GOVERNANCE_CHURN_KEEP_PRODUCTION_MOVING`

Use SOP revision only when SOP text blocks or misdescribes current controlled production. Otherwise keep Agents 1-4/10 producing pipeline data and route concrete blockers to the right lane.

## Operating Rule

| SOP issue | production impact | current controlled practice | revision needed? | exact boundary | owner | stop condition |
| --- | --- | --- | --- | --- | --- | --- |
| `blocked_no_render` | Real release gate. | Treat as publication/render blocker until exact render/public route clears. | No, unless SOP text says render is not a gate. | No publication readiness or public release claim. | Agent 6/7 as gate/publication control. | Stop after gate packet or exact render blocker. |
| 86 untracked source files | Source/provenance warning and possible release blocker. | Route to Agent 1 source/custody pipeline with exact audit scope. | Only if SOP audit-scope text is stale or blocks current audit. | No source/provenance acceptance from count alone. | Agent 1, Agent 6 if boundary needed. | Stop after custody packet or scoped SOP text blocker. |
| Multi-answer warnings | Definition/route ambiguity. | Route to Agent 2/3 pipeline work for transform/linkage/navigation evidence. | No, unless SOP misroutes ambiguity into governance. | No Definition authority or accepted answer. | Agent 2/3. | Stop after evidence packet or exact transform/linkage blocker. |
| Orot NC/Klein WARN-ACCEPTED | Row-scoped noncommercial educational planning only. | Preserve NC lane flags and commercial-export exclusion. | No, unless SOP flattens NC to blocked or public-safe. | No public/runtime display or NC definition-content storage from WARN. | Agent 1/6/10. | Stop after row-scoped packet or Agent 6 boundary blocker. |
| 500-row Definition Workbench WARN-ACCEPTED | Non-authoritative route-shape / reader-planning evidence. | Use for planning/route shape only. | No, unless SOP calls it reviewed definition authority. | No accepted gloss, answer, or publication readiness. | Agent 2/6. | Stop after route-shape artifact or exact Agent 6 blocker. |

## Cap Rule

Agent 8 should cap SOP/governance prompts when the ask is only to harmonize wording, restate boundaries, or re-approve already controlled practice. Route instead to production lanes when there is a named artifact, row set, validator, package, or blocker.

## Revision Trigger

Open a scoped SOP revision only when all are true:

1. Current SOP text is stale or contradictory.
2. The stale text blocks a production lane or misdescribes an active boundary.
3. The proposed revision has exact boundary text.
4. The owner and stop condition are named.
5. Agent 6 review is preserved when the revision affects QA/compliance boundaries.

## Boundary

Agent 12 advisory cap posture only. No QA/source/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no publication readiness, and no governance churn.
