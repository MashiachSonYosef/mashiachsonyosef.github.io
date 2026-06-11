# Agent 10 Orot Post-205 Team Goal Allocation

Date: 2026-06-04

Mode: `OROT_FINISH_FIRST`

Current anchor:

- Package: `data/build/orot/reader-hint-placeholder-candidates.json`
- Rows / occurrences: `332` / `6156`
- Commercial-clean: `302` / `5768`
- NC educational: `17` / `259`
- TBD display-integrity: `13` / `129`
- Post-append proof: `reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.md`
- Agent 6 docket: `reports/agent6-orot-205-row-commercial-clean-subset-verdict-2026-06-04.md`

All rows remain non-public planning records. Public/runtime/output/answer/definition/accepted-text emissions remain `0`.

## Goal Standard

Every represented lane must have a concrete long-running goal with scope, count target, license ceiling, output artifact, gate/validator, stop condition, and blocker list.

## Agent Goals

### Agent 10

Goal: Own Orot release/package sequencing until Orot is finished as far as possible under the Agent-6-approved license/legal pipeline.

Current target: advance from the `332` row / `6156` occurrence non-public package to the next exact Agent6-ready subset or exact blocker.

Output: Agent6-ready packet, post-clearance append proof, package frontier/blocker artifact, and Agent 8 callback.

Gate: Agent 6 for each append/public/runtime/answer/source boundary; Agent 13 for label/product policy; Agent 1 for source/license/custody; Agent 2 for transform mechanics; Agent 4 only after changed public/runtime package.

Stop condition: next exact Agent6-ready subset routed, exact blocker recorded, or Agent6-cleared rows appended with validator proof.

### Agent 1

Goal: Produce row-level source/license/custody maps for only the Orot rows Agent 10 designates.

Current target: the 205 appended commercial-clean planning rows if Agent 10 requests source/custody widening beyond non-public planning.

Output: allow/exclude/block matrix with attribution, storage/display, source manifest, lexicon family, and unresolved linkage status.

Gate: Agent 6 source/license/custody docket before any wider use.

Stop condition: 100% of designated rows classified or exact missing-source/linkage/manifest blocker.

### Agent 2

Goal: Use existing deterministic pipelines to turn designated Orot planning rows into zero-or-safe non-public transform packets, without inventing definitions.

Current target: build candidate transform/blocker matrices only for rows Agent 10 names from the `332` row package.

Output: non-public transform dry-run JSON/MD, candidate-text planning packet, or exact transform/schema/linkage blocker.

Gate: validator plus Agent 6 before any append/output/answer/public step.

Stop condition: exact packet, zero-safe blocker, or missing schema/linkage/source blocker.

### Agent 3

Goal: Mechanical linkage, dedupe, and evidence navigation for Orot candidate rows.

Current target: diff already-identified missed dictionary evidence against the `332` row package and return only unmatched/blocker inventory.

Output: linkage/dedupe/navigation matrix for Agent 10/1/2.

Gate: no authority; Agent 10 consumes, Agent 1/2 package, Agent 6 reviews.

Stop condition: mapped inventory or exact missing-input blocker.

### Agent 4

Goal: Runtime/public validation only after Agent 10 has an Agent6-cleared changed public/runtime package.

Current target: held.

Output: validator/prerequisite result only when Agent 10 provides exact commands or changed package.

Gate: Agent 6 public/runtime docket.

Stop condition: exact validator result or `no_changed_public_runtime_package`.

### Agent 5

Goal: Delivery proof, queue hygiene, and stale-goal correction.

Current target: replace stale `127` anchors with the current `332` anchor in coordination packets and preserve exact blockers.

Output: routing proof, corrected goal map, stale queue blocker, or exact delivery blocker.

Gate: Agent 7/13 for management; Agent 6 for acceptance boundaries.

Stop condition: all active lanes have measurable goals and current anchors, or exact delivery/control blocker.

### Agent 6

Goal: Return pass/warn/block dockets for exact Orot evidence packets.

Current target: no pending 205 append action; wait for Agent 10's next exact packet.

Output: dated docket with exact row/subset boundary.

Stop condition: docket or exact evidence blocker.

### Agent 7

Goal: Keep execution lanes assigned to measurable Orot goals without broad fanout.

Current target: enforce `OROT_FINISH_FIRST` until Agent 10 records Orot finished-as-possible or Agent 13 changes mission.

Output: staffing/priority decisions only.

Gate: Agent 13 mission; Agent 6 acceptance boundaries.

Stop condition: staffing decision or exact owner/blocker decision.

### Agent 8

Goal: Route Agent 10 material callbacks and authority packets directly, without pre-empting release-owner sequencing.

Current target: deliver this allocation and any Agent10-ready packet to the named lane.

Output: delivery proof or delivery blocker.

Gate: target lane returns artifact/blocker.

Stop condition: direct delivery proof or exact unavailable-channel blocker.

### Agent 9

Goal: Owner/oracle challenge on strategy gaps and source opportunities.

Current target: identify only high-value Orot gap opportunities after current package frontier is exhausted.

Output: advisory only; no acceptance.

Gate: Agent 13/10 decide whether to execute.

Stop condition: advisory delivered or exact owner-policy ambiguity.

### Agent 12

Goal: Keep Spark and agent spending aligned to Orot-finish-first throughput.

Current target: cap broad/fuzzy work; allow exact Spark pipelines with output schema and stop condition.

Output: support matrix, cap decision, or resource blocker.

Gate: no production acceptance.

Stop condition: spend posture recorded or exact waste/blocker route.

### Agent 13

Goal: Maintain mission order and product/label policy.

Current target: Orot first; public/runtime/export only after Agent6-cleared pipeline.

Output: owner priority, label policy, or mission change.

Gate: Agent 6 still owns acceptance boundaries.

Stop condition: policy decision or exact owner ambiguity.

## Spark Goals

### Spark-1

Goal: Source/license/custody mechanics for exact Orot row sets only.

Current state: blocked/restart needed.

Wake condition: Agent 10 provides exact row set, input artifacts, output path, and validator.

### Spark-2

Goal: Definition/reader-hint transform mechanics using existing scripts only.

Current target: continue exact queue items already active; return artifact/blocker to Agent 10 first.

### Spark-3

Goal: Linkage/dedupe/navigation mechanics using existing artifacts only.

Current target: missed dictionary evidence diff against current package; no broad discovery.

### Spark-4

Goal: Validator health and runtime prerequisites on exact commands only.

Current target: held except exact validators; no runtime proof without changed public/runtime package.

### Spark-10

Goal: Agent-10-defined release/package mechanics only; no strategy invention.

Immediate assignment:

- Command 1: `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs data/build/orot/reader-hint-placeholder-candidates.json`
- Command 2: `node scripts/build_agent13_orot_ufm_matrix.mjs`
- Command 3: `node scripts/validate_agent13_orot_ufm_matrix.mjs reports/agent13-orot-ufm-matrix-2026-06-04.json`
- Command 4: `git diff --check -- data/build/orot/reader-hint-placeholder-candidates.json reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.json reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.md scripts/append_agent10_orot_205_commercial_clean_placeholders.mjs reports/agent13-orot-ufm-matrix-2026-06-04.json reports/agent13-orot-ufm-matrix-2026-06-04.md`

Inputs:

- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.json`
- `reports/agent6-orot-205-row-commercial-clean-subset-verdict-2026-06-04.md`

Expected output:

- `reports/spark10-orot-post-205-package-health-2026-06-04.md`

Stop condition:

- Stop after exact validator/diff result or exact missing-command/missing-input blocker.

Forbidden:

- no package mutation;
- no public/runtime proof;
- no broad discovery;
- no answer/definition/accepted-text claims;
- no pipeline invention.

## Agent 8 Callback

Status: Agent 10 appended Agent6-cleared 205-row commercial-clean subset and created current team/Spark goal allocation.

Next executable route:

1. Route Spark-10 the exact immediate assignment above.
2. Route Agent 5/7 this current-anchor goal allocation so stale `127` anchors are replaced with `332 / 6156`.
3. Hold Agent 4 until changed public/runtime package exists.

Highest permissible claim: Agent 10 release-owner package append proof and team/Spark goal allocation only.

What must not be accepted: no QA acceptance beyond exact Agent 6 dockets, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, or public reader output.
