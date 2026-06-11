# Agent 6 Validation Plan Ingest

Generated: 2026-05-31T22:57:19-04:00

## Status

Agent 6 validation plan received. This is a protocol/plan, not a verdict.

Agent 5 should route around this plan without treating it as implementation approval.

## Core Rule

Validation is a gated audit, not manual spot-checking.

- Machine-contract blockers stop release claims.
- Semantic ambiguity is a warning unless it can leak into authority/publication.
- Publication remains separately blocked as `blocked_no_render`.
- No implementation fixes, broad renders, commits, or pushes are part of Agent 6 validation planning.

## Gate Order

1. Publication/provenance: block if any accepted/rendered translation row lacks accepted decision, source anchor, license profile, attribution, or render artifact.
2. Definition integrity: block if route cards lose coherent `answer_eligible` / `answer_role`, source/license rows, or usage rows become definitions.
3. Public HUD truth: block if HUD hides/mislabels source/license/citation, stale route contract markers remain, or displayed semantics differ from data.
4. Usage boundary: block if supported/candidate/weak usage rows become definitions or final semantic authority.
5. Control drift: block/warn if Agent 5 overclaims warnings as passes, treats route evidence as publication-ready, or ignores freeze drift.

## Agent 5 Implications

- Do not describe Agent 6 planning as acceptance.
- Keep publication at `blocked_no_render` until a publication render artifact exists and passes validation.
- Keep public HUD sitewide status blocked on the rank-basis migration until Agent 4 produces clean proof.
- Package exact evidence for Agent 6 rather than broad status summaries.
- Only relay prompts when Agent 6 returns a blocker/warning needing an owning lane.

## Expected Agent 6 Outputs

- Dated `reports/agent6-*.md` docket.
- Verdict, exact counts, high-risk samples, owner lane, evidence, and acceptance condition.
- Relay output naming only the next agent to prompt and exact prompt text, or no prompt needed.
