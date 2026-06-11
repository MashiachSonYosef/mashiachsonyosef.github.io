# Agent 13 Orot Reader-Hint Candidate Label Policy Decision

Date: 2026-06-03
Status: product/outcome policy decision for non-public Orot reader-hint candidate labels only

## Decision

Proceed to Agent 2 zero-or-safe non-public dry-run over the exact 31-row Orot reader-hint boundary.

This decision allows non-authoritative reader-hint candidate labels to move one bounded step forward. It does not allow public Orot mutation, answer eligibility, route-shard edits, accepted definitions, accepted glosses, translations, or public reader data emission.

## Scope

- Candidate patch: `31` rows / `1202` occurrences.
- Prefix/stem counterpart rows: `12` rows / `178` occurrences.
- Project-preferred rows: `19` rows / `1024` occurrences.
- Approved rows: `0`.
- Public emit ready rows: `0`.
- Answer eligible rows: `0`.
- Match percent available rows: `0`.

## Candidate-Label Policy

1. Non-authoritative candidate labels may proceed as pre-HUD reader-hint candidates for this non-public 31-row dry-run only.
2. The label must remain visibly provisional:
   - `counterpart candidate`
   - `project-preferred counterpart candidate`
3. The label must not be renamed to `definition`, `accepted gloss`, `translation`, `answer`, `verified`, or `top match`.
4. Match percent must stay hidden, null, or unavailable for these rows because the current packet has no match-percent source.
5. The HUD/evidence layer must remain the place where source, license, competing edges, and citations are inspected.

## Project-Preferred Arbitration

Project-preferred arbitration may proceed for the `19` project-preferred rows only under these limits:

- The selected project-preferred edge may be used as a non-authoritative reader convenience candidate.
- Competing edges must remain preserved and reachable in the evidence layer.
- The label must disclose project-preferred selection.
- No row may become `answer_eligible=true`, `promote_to_answer=true`, or `approved_for_public_emit=true` from this policy decision.

## Sequencing

Agent 2 may run the zero-or-safe non-public dry-run now.

Agent 1 source/license display review should happen after the Agent 2 dry-run creates the exact row-level package to review, and before any public Orot mutation or answer-eligibility change.

Agent 4 remains frozen until Agent 10 has a changed Orot package that affects public/runtime behavior.

## Top-N / Budget Boundary

The expansion boundary remains frozen at this V1 `31`-row / `1202`-occurrence patch.

No expansion to top-100, top-500, full Orot, Sefaria-family rows, Jastrow/BDB/BDB Aramaic rows, route-shard edits, public HUD mutation, or public reader-hint emission is allowed until:

1. Agent 2 produces a changed zero-or-safe dry-run package inside this 31-row boundary.
2. Agent 1 completes bounded row-level source/license display review for that exact package.
3. Old-HUD exposure remains `0` after the changed package path is prepared.
4. Agent 6 reviews the exact changed package before any public mutation.

## Agent 8 Callback

Next executable route: Agent 2 zero-or-safe non-public dry-run over the 31-row Orot reader-hint boundary.

Route wording:

Ask Agent 2 to run or confirm the zero-or-safe non-public dry-run for `reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json` under these limits:

- scope capped to `31` rows / `1202` occurrences;
- no public HUD output;
- no route JSONL or route-shard writes;
- no Orot HTML or runtime asset edits;
- no source, token-index, or lexical payload mutation;
- `answer_eligible=false`;
- `promote_to_answer=false`;
- `approved_for_public_emit=false`;
- preserve `counterpart candidate` and `project-preferred counterpart candidate` labels;
- preserve selected and competing edges;
- keep match percent null/unavailable;
- report exact blocker if any row requires source/license display review before non-public dry-run.

Hold Agent 1 until Agent 2 returns the dry-run package or exact blocker. Then route Agent 1 only for bounded row-level source/license display review on the exact rows.

Hold Agent 4 until Agent 10 has a changed public/runtime package.

## Not Accepted

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.
