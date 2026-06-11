# Agent 13 Orot Candidate Label Policy Decision - 2026-06-04

## Status

Policy decision for Agent 10 release planning only.

This decision does not authorize public/runtime/output mutation, answer eligibility, source/license acceptance, Definition authority, accepted gloss, translation, accepted text, or publication readiness.

## Package Anchor

- Package: `data/build/orot/reader-hint-placeholder-candidates.json`
- Current basis: `127` rows / `4389` occurrences
- Spark `325` route: closed stale/mismatched
- UFM basis: `reports/agent13-orot-ufm-matrix-2026-06-04.json`

## Decision

Agent 10 may prepare a later non-public transform/dry-run planning packet using these labels only:

- `counterpart candidate`
- `project-preferred counterpart candidate`
- `TBD`

This is allowed only for non-public planning and evidence packets. These labels are not definitions, glosses, translations, answers, verified text, top matches, accepted text, or public reader output.

## Scope Approved For Planning

- Prefix/stem contract boundary: `12` rows / `178` occurrences.
- Project-preferred contract boundary: `19` rows / `1024` occurrences.
- Combined reader-hint candidate patch boundary: `31` rows / `1202` occurrences.
- Agent 2 transform safety matrix may be consumed only for the exact `20` row / `1033` occurrence boundary if Agent 10 builds that later packet.

No expansion beyond these reviewed boundaries is approved by this policy decision.

## Label Rules

### `counterpart candidate`

Allowed only when a bounded source-linked candidate exists and the packet preserves:

- source row identifier;
- source/license lane;
- token id;
- occurrence count;
- `answer_eligible=false`;
- `promote_to_answer=false`;
- `approved_for_public_emit=false`;
- `public_emit_ready=false`.

### `project-preferred counterpart candidate`

Allowed only when the selected edge is project-authored or project-preferred and the packet explicitly discloses that the selection is reader convenience only.

Required disclosure string:

`project-preferred counterpart candidate; reader convenience only; competing edges preserved`

The selected project-preferred edge must not be described as truth, definition, accepted gloss, translation, answer, verified text, top match, or accepted text.

### `TBD`

Allowed only as display-integrity separator text for rows with no usable English hint.

Required status:

`display_integrity_tbd_separator`

`TBD` is not a definition, candidate definition, gloss, translation, answer, or source-backed text.

## Project-Preferred Arbitration Conditions

Project-preferred arbitration may proceed for non-public planning only if all of these remain true:

- competing edges remain preserved in the packet;
- competing edges remain reachable in HUD/evidence artifacts before any future public behavior is proposed;
- the selected edge is labeled `project-preferred counterpart candidate`;
- the disclosure string above is carried with the row;
- no highest-score, top-match, verified, answer, definition, or accepted wording is used;
- no row hides Kaikki/Wiktionary, OpenScriptures, project-authored, or other competing source lineage.

If competing edges cannot be preserved and reachable, the row must stay blocked from later public/runtime proposal.

## Source/License Display Conditions

Before any future public behavior is proposed, Agent 10 must preserve or packetize:

- Kaikki/Wiktionary `CC BY-SA 4.0 / GFDL` rows as excluded or external-link-only unless a later license boundary explicitly allows more;
- OpenScriptures `CC BY 4.0` source/license display requirements;
- project-authored / CC0 source rows;
- Agent 1's 13-row missing-linkage map, including all excluded and blocked rows.

This decision does not clear source/license display for public use.

## Required Non-Public Boundary

Any later transform/dry-run packet under this policy must preserve:

- `answer_eligible=false`
- `promote_to_answer=false`
- `approved_for_public_emit=false`
- `public_emit_ready=false`
- `public_hud_rows=0`
- `route_jsonl_rows=0`
- `route_shard_writes=0`
- `definition_content_rows=0`
- `nc_definition_content_rows=0`
- `accepted_text_rows=0`

## Forbidden Labels And States

Forbidden unless a later Agent 6 row/subset boundary explicitly clears the exact package:

- `definition`
- `answer`
- `translation`
- `accepted gloss`
- `verified`
- `top match`
- `accepted text`
- `public display ready`
- `publication ready`

## Next Executable Step

Agent 10 may build the next exact non-public transform/dry-run packet using this policy, the Agent 6 authority verdict, Agent 1's missing-linkage map, Agent 2's 20-row matrix if needed, and the current `127` row / `4389` occurrence package anchor.

That packet must return to Agent 6 before any public/runtime/output mutation.

## Agent 8 Callback

Return to Agent 10:

- Agent 13 approves the labels `counterpart candidate`, `project-preferred counterpart candidate`, and `TBD` only for non-public planning/dry-run use.
- Project-preferred rows must carry the disclosure `project-preferred counterpart candidate; reader convenience only; competing edges preserved`.
- Competing edges must remain preserved and reachable in HUD/evidence artifacts before any future public behavior is proposed.
- `TBD` must use status `display_integrity_tbd_separator` and remain separator text only.
- Agent 10 may build the next exact non-public transform/dry-run packet, but no public/runtime/output mutation is authorized.

## Not Accepted

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.
