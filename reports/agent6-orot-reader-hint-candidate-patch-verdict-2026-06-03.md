# Agent 6 Orot Reader-Hint Candidate Patch Verdict - 2026-06-03

## Verdict

Disposition: WARN-ACCEPTED for non-public evidence sufficiency only.

The 31-row Orot reader-hint candidate patch is sufficient for Agent 13 candidate-label policy review. It is not sufficient for public Orot mutation, answer eligibility, route-shard mutation, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted gloss, translation output, or accepted text.

Public mutation remains BLOCKED until a later approved dry-run package exists with row-level source/license display evidence, old-HUD exposure still `0`, and a separate Agent 6 docket for that exact package.

## Scope Reviewed

- Target: non-public Orot reader-hint candidate patch only.
- Rows / occurrences: `31 / 1202`.
- Prefix/stem rows / occurrences: `12 / 178`.
- Project-preferred rows / occurrences: `19 / 1024`.
- Competing-edge rows / total competing edges: `19 / 46`.
- Approved rows: `0`.
- Public emit ready rows: `0`.
- Answer eligible rows: `0`.
- Promote-to-answer rows: `0`.
- Public HUD rows emitted: `0`.
- Route JSONL rows emitted: `0`.
- Match percent available rows: `0`.
- Match percent missing rows: `31`.
- Missing-linkage rows outside patch: `13 / 129` occurrences.

## Evidence Reviewed

- `reports/agent12-agent8-smart-routing-consult-2026-06-03.md`
- `reports/agent13-orot-1-2-4-sequencing-decision-2026-06-03.md`
- `reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.md`
- `reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.json`
- `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.md`
- `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json`
- `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.md`
- `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json`
- `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.md`
- `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json`
- `reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.md`
- `reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json`
- `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.md`
- `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.json`

## Validation Evidence

All targeted validators passed:

- `node scripts\validate_agent2_orot_reader_hint_candidate_patch.mjs reports\agent2-orot-reader-hint-candidate-patch-2026-06-03.json`
- `node scripts\validate_agent2_orot_counterpart_hint_patch_preview.mjs reports\agent2-orot-counterpart-hint-patch-preview-2026-06-03.json`
- `node scripts\validate_agent10_orot_prefix_stem_contract_packet.mjs reports\agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json`
- `node scripts\validate_agent10_orot_project_preferred_contract_packet.mjs reports\agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json`
- `node scripts\validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports\agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.json`

## Source / Family Recount

Machine inspection of the reviewed patch family found these source family counts across selected/competing source rows:

- `kaikki`: `112`
- `openscriptures`: `44`
- `workspace`: `40`
- `wikidata`: `3`

Route family counts:

- `wiktionary_definition`: `112`
- `project_lexical`: `38`
- `openscriptures_definition`: `4`

No `Jastrow`, `BDB`, `BDB Aramaic`, `Sefaria`, or `sefaria` strings were found in the reviewed 31-row patch family and its two contract packets.

## Rationale

The evidence is sufficient for non-public policy review because the packet is zero-emission and preserves the critical distinctions:

- Candidate labels are explicitly non-authoritative reader convenience labels.
- Rows are split into two named contracts: `OROT_PREFIX_STEM_COUNTERPART_DISPLAY_V1` and `OROT_PROJECT_PREFERRED_MULTI_STEM_COUNTERPART_DISPLAY_V1`.
- Project-preferred rows preserve competing edges instead of hiding them.
- Match percent is unavailable on all 31 rows and is not presented as authority.
- No row is approved, public-emittable, answer-eligible, or promotable to answer.
- No public HUD, route JSONL, runtime, source, token-index, lexical payload, or Orot HTML mutation was emitted.
- Live old-HUD guard evidence says old HUD exposure is `no` with hard marker hits `0`, but it remains WARN rather than clean runtime PASS.

## Agent 13 Policy Review

Agent 13 candidate-label policy review may proceed.

Permitted Agent 13 policy question:

May these exact non-public candidate labels be used as pre-HUD reader convenience labels only, with clear non-authority language, no match percent authority, project-preferred disclosure where applicable, and competing edges preserved in the HUD/evidence layer?

Agent 13 may not treat this Agent 6 verdict as approval for public mutation, answer eligibility, accepted glosses, translations, or Definition authority.

## Agent 1 Custody / License Review

Agent 1 custody/license review is not required before Agent 13 candidate-label policy review.

Agent 1 custody/license review is required before any public Orot mutation or answer-eligibility change that displays, stores, or promotes candidate text from source-derived rows.

Exact bounded Agent 1 question:

For the 31-row Orot reader-hint candidate patch only, verify whether the listed source rows and labels are sufficient for public reader-hint display with reachable HUD/evidence source/license rows, and identify any row that must be excluded or relabeled. Limit the review to source families present in this packet: Kaikki/Wiktionary `CC BY-SA 4.0 / GFDL`, OpenScriptures `CC BY 4.0`, Wikidata `CC0`, workspace/project-authored `CC0`, and workspace grammar-particle rows marked `N/A - project lexical rule`. Do not recrawl broad sources, do not approve source custody globally, and do not assign lexicon entries.

## Jastrow / BDB / BDB Aramaic Boundary

No Jastrow, BDB, BDB Aramaic, or Sefaria-family row is present in the reviewed 31-row patch family.

However, family-specific storage/display boundary remains required before answer eligibility or public mutation for any future Jastrow, BDB, or BDB Aramaic row.

Exact future Agent 1 question if those families appear:

For each future Orot row whose selected or competing source family is Jastrow, BDB, BDB Aramaic, or otherwise Sefaria-derived, provide row-level custody/display treatment only: source family, source id, source URL or local locator, license, license URL if available, whether candidate text may be stored in public reader-hint data, whether display must be citation-only or excerpt-limited, required attribution row, and whether the row must be excluded until license/source posture is clearer. Do not perform a broad Sefaria recrawl.

Until that row-level answer exists, those families cannot become `answer_eligible=true`, public reader hints, accepted glosses, route publication support, or Definition authority.

## Agent 2 Zero-Or-Safe Dry-Run

Agent 2 may run a zero-or-safe dry-run over the reviewed boundary only.

Exact limits:

- Scope is capped at these `31` rows / `1202` occurrences.
- Output must be non-public and report/cache-only.
- `answer_eligible` must remain `false`.
- `promote_to_answer` must remain `false`.
- `approved_for_public_emit` must remain `false` unless a later Agent 13 policy decision and a later Agent 6 docket explicitly allow a changed package.
- No `data/public-hud/orot/reader-hints.json` write.
- No route JSONL or route-shard write.
- No Orot HTML or runtime asset edit.
- No source, token-index, or lexical payload mutation.
- Candidate labels must preserve `counterpart candidate` or `project-preferred counterpart candidate` language.
- Project-preferred rows must preserve selected edge and competing edges.
- Match percent must remain hidden/null unless a separate pipeline source supplies it and Agent 6 reviews that contract.
- If any Jastrow/BDB/BDB Aramaic/Sefaria-family row appears, the dry-run must emit zero public-ready rows for that family and report a blocker.

## Remaining Blockers Before Public Mutation

- Agent 13 must decide the candidate-label policy.
- Agent 1 must perform the bounded row-level source/license display review before public Orot mutation.
- Agent 2 must produce a changed dry-run package within the limits above.
- Old-HUD exposure must remain `0` after any changed dry-run/public-package preparation.
- Agent 4 Orot browser/runtime proof remains premature until a changed public/runtime package exists.
- A separate Agent 6 docket is required before any public Orot mutation or public/runtime acceptance.

## Not Accepted

- Broad QA acceptance.
- Source/provenance acceptance.
- License acceptance.
- Source custody.
- Definition authority.
- Usage-as-definition authority.
- Answer acceptance.
- `answer_eligible=true` authorization.
- Public/runtime acceptance.
- Public Orot mutation.
- Publication readiness.
- Route publication support.
- Product/data acceptance.
- Translation output.
- Accepted gloss.
- Accepted text.
- Public HUD mutation.
- Route JSONL mutation.
- Runtime asset mutation.

## Agent 8 Callback

- Disposition: WARN-ACCEPTED for non-public 31-row Orot reader-hint candidate patch evidence sufficiency only.
- Docket path: `reports/agent6-orot-reader-hint-candidate-patch-verdict-2026-06-03.md`
- Machine docket path: `reports/agent6-orot-reader-hint-candidate-patch-verdict-2026-06-03.json`
- Agent 13 candidate-label policy review may proceed: yes.
- Agent 1 required now: not before Agent 13 policy review; required before public mutation under the exact bounded source/license display question above.
- Agent 2 may proceed: yes, zero-or-safe non-public dry-run over the 31-row boundary only.
- Next executable route: Agent 13 policy review, then bounded Agent 1 source/license display review if policy does not block; Agent 2 dry-run may run only under the zero-or-safe limits.
- Hold: no public Orot mutation, no answer eligibility, no route-shard edit, no broad Agent 1 recrawl, no Agent 4 Orot runtime proof until a changed package exists.
