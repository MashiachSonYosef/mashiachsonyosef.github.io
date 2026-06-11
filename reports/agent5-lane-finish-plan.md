# Agent 5 Lane Finish Plan

Generated: 2026-05-31T11:08:11-04:00

## Control Diagnosis

Agent 2 and Agent 3 have different failure modes.

Agent 2 is likely doing the right technical work, but he can fail by never finishing. The route-data lane currently has moving inputs, separate local/public artifacts, and no single release-candidate stamp that says the audited claims, route store, public lookup shards, and rendered HUD are all from the same generation.

Agent 3 is attempting an impossible task if the mission is "derive definitions from usage graphs." It becomes possible if the mission is narrowed to "produce licensed, observed usage commentary and source-frame clusters that can sit beside definitions without becoming definitions."

The current HUD problem follows from mixing these lanes. Definition routes need answer eligibility. Workbench usage rows need a separate evidence lane. If Agent 3 data is forced into the definition lane, the reader sees `undefined` or, worse, a false definition.

## Agent 2 Finish Line

Agent 2 is finished for this release only when all four of these are true:

- Local route claims are frozen for a release candidate and pass `reports/definition-route-claim-audit.md` with 0 issues.
- The HUD route store and public `data/definitions/hud-route-lookup/*` are regenerated from that same frozen input set.
- The public lookup manifest count is reconciled with the audited local claim count, or the delta is explicitly explained in a release note.
- Rendered pages are validated against the public lookup generation, not merely against an older local/sample store.

Why he may never finish without control:

- Every added route family changes the answer surface and invalidates the previous public lookup.
- A clean local audit does not prove public shard freshness.
- Public lookup generation, rendered page validation, and source/license audit are currently separate success stories, not one release stamp.
- Stale validators and preview tools still encode older HUD language, so passing the wrong validator can create false confidence.

Agent 2 release-candidate procedure:

1. Freeze route inputs: no new route families, no new source imports, no schema changes.
2. Write a route release stamp with input files, row counts, generated timestamps, and public manifest counts.
3. Regenerate local HUD route store and public lookup shards from the frozen inputs.
4. Run route claim audit and a public lookup freshness check that compares the public manifest against the release stamp.
5. Hand Agent 4 one manifest URL and one card schema. No parallel "maybe current" lookup path.

Relay for Agent 2:

```text
Convert the route-data lane from improvement mode to release-candidate mode. Freeze route inputs, regenerate the HUD route store and public `data/definitions/hud-route-lookup/*` from that frozen set, then write a route release stamp with input files, row counts, timestamps, and public manifest counts. A clean local audit is not enough unless the public lookup manifest is reconciled to the same generation. Do not add a new route family until this stamp exists.
```

## Agent 3 Finish Line

Agent 3 is finished for this release only when all three of these are true:

- The broad target queue is stopped or gated by `reports/workbench-candidate-artifact-audit.md`.
- Only known-useful or seeded smoke targets are promoted to handoff.
- A public handoff index exposes selected handoff packages with counts, statuses, source/license rows, and validation status.

What Agent 3 should not do:

- Do not try to make broad usage graphs into dictionary definitions.
- Do not push `ambiguous` rows into the reader HUD as if they were definitions.
- Do not continue target families after 0 supported + 0 candidate + 0 weak.

What Agent 3 should do:

- Treat `workbench_usage_commentary` as observed usage evidence only.
- Keep `not_a_definition: true` and `observed_usage_only: true`.
- Promote only rows with `supported`, `candidate`, or useful `weak` status unless a separate ambiguity-review UI is being built.
- Produce compact handoff packages by target, not one enormous global dump.
- Make `data/workbench-evidence/handoff-index.json` reflect selected handoff packages. The current public index has 0 manifests while `.local-cache/workbench-evidence/handoff/*` contains many local manifests.

Relay for Agent 3:

```text
Reframe the workbench lane as usage evidence, not definition discovery. Stop broad target expansion. Promote only known-useful or seeded smoke targets into validated handoff packages. The next useful deliverable is a public handoff index with selected manifests, counts, statuses, and validation state; do not try to make `ambiguous` rows reader-facing.
```

## HUD Integration Rule

Agent 4 should render Agent 3 data in a separate `Usage evidence` lane, never in the `Definition` slot.

Required behavior:

- `answer_eligible` must be false for all direct workbench usage commentary.
- The visible text should come from `usage_note`, `frame_label`, `candidate_status`, `raw_score`, `phrase_hebrew`, `source_ref`, and `source_rows`.
- If linked route definitions exist, show them as "related definition routes considered", not as the workbench row's own definition.
- If no linked route exists, show "observed usage only" instead of `undefined`.
- `ambiguous` rows should be hidden by default or placed behind an audit disclosure, not mixed into primary HUD content.

Relay for Agent 4:

```text
Add a null-safe `Usage evidence` HUD lane for Agent 3 handoff rows. Do not render workbench rows in the Definition slot and do not read a missing `definition` field. Workbench rows should display `usage_note`, `frame_label`, status, score, source ref, phrase Hebrew, and source/license rows. If no linked route definition exists, say "observed usage only" rather than `undefined`.
```

## 24-Hour Control Plan

Immediate control:

- Agent 2 moves from route improvement to release-candidate stamping.
- Agent 3 moves from broad graph expansion to selected public handoff packaging.
- Agent 4 owns HUD null-safety and a separate usage-evidence lane.
- Agent 5 tracks whether the three outputs converge into one reader-facing contract.

Release gates:

- Gate 1: rendered route HUD shell passed across current source pages.
- Gate 2: public definition lookup manifest is fresh against the Agent 2 release stamp.
- Gate 3: split-token/morphology guard passes representative Tanakh base and commentary pages.
- Gate 4: workbench handoff index is public, validated, and rendered only as usage evidence.
- Gate 5: stale validators/preview tools are retired, fixed, or marked non-authoritative.

Decision:

The product should not wait for Agent 3 to solve broad meaning inference. Ship the definition HUD with clean route data, then add Agent 3 as a disciplined usage-evidence layer. That keeps the reader experience useful while preventing `undefined` or false-definition leakage.
