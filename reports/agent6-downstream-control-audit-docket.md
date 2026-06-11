# Agent 6 Downstream Control Audit Docket

Date: 2026-06-01
Agent: 6 (independent QA/compliance authority)
Scope: downstream release gates, upstream data quality controls, and Agent 5 control-state correction

## Verdict

Publication is blocked.

Public HUD is not sitewide accepted. It is accepted-with-boundary for previously validated pages, with one active Agent 4 blocker at `halakhah/urim-vetumim-urim/index.html`.

Agent 5 must not relay readiness from the board or registry until those control surfaces are refreshed from current evidence. The board is a derived surface, not the authority.

## Priority-Ranked Findings

### 1. Blocker - Publication has no downstream artifact to validate

Owner: Agent 5

Evidence:

- `node scripts\validate_publication_render_contract.mjs`
- Status: `blocked_no_render`
- Rendered rows: `0`
- Accepted decision rows: `0`
- Unknown-license sources: `0`
- Sefaria sources: `0`
- `node scripts\validate_translation_memory.mjs` passes with `40` rows, but status counts remain scaffold-only: `17` ambiguous, `8` candidate, `15` needs_review, `0` accepted.

QA interpretation:

- This is not a legal-cleanup queue.
- This is structurally uninstantiated publication mode.
- No publication-readiness statement is acceptable until accepted rows and a render artifact exist.

Acceptance condition:

- At least one decision row is explicitly `decision_status=accepted`.
- Publication render artifact exists.
- `scripts\validate_publication_render_contract.mjs` passes.
- Renderer proves it uses only accepted rows with `license_safe=true` and `license_profile.direct_translation_use_ok=true`.
- Attribution bundle is present for `publication_ok_with_attribution`.
- No `workbench_ok_publication_review` row renders unless a separate output-license decision explicitly allows it.

### 2. Blocker - One public HUD page is stale old-HUD markup

Owner: Agent 4

Evidence:

- `node scripts\validate_route_hud_page.mjs halakhah\urim-vetumim-urim\index.html`
- Result: failed with `103` issues.
- Missing current markers include `data-route-hud-panel`, `Route HUD`, `role="dialog"`, `Usage evidence`, `Sources and licenses`, `answer_eligible`, and `lookupCandidateTreatments`.
- Stale markers present include `Clicked Hebrew form`, `allowLowConfidenceFallback`, `data-hud-breakdown`, `data-hud-potential`, `data-hud-sources`, `source-row`, `renderSourceGroups`, and `sourceSummary =`.
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp` still passes, so the active failure is page/runtime emission, not route shard availability.

QA interpretation:

- Agent 4's prior public-HUD acceptance remains bounded, not sitewide.
- The current `route-hud-page-upgrade-report.md` chunk 51 says the exception was a missing page with `0` stale markers, but current filesystem evidence shows a page exists and is stale old-HUD markup. Agent 5 must not relay chunk 51 as current truth without that correction.

Acceptance condition:

- `node scripts\validate_route_hud_page.mjs halakhah\urim-vetumim-urim\index.html` passes.
- A stale-marker scan for `Clicked Hebrew form`, `allowLowConfidenceFallback`, `data-hud-breakdown`, and `sourceSummary =` returns zero hits on that page.
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp` still passes.
- The route-HUD page report is updated to distinguish current page-exists-stale evidence from the earlier missing-page report.

### 3. Warning - Kaikki provenance-report contradiction is systemic

Owner: Agent 1

Evidence:

- Audit command over `reports/*lexical-build-report.md` found `26` contradiction reports out of `59` lexical build reports.
- Pattern: report line says `legacy source-exclusion wording claimed Kaikki/Wiktionary were unused`, while sample rows in the same report show `(kaikki)`.
- Examples include:
  - `reports/halakhah-eliyah-rabbah-hud-recovery-lexical-build-report.md`
  - `reports/halakhah-choshen-mishpat-recovery-lexical-build-report.md`
  - `reports/halakhah-meirat-einayim-lexical-build-report.md`
  - `reports/chasidut-classic-next-lexical-build-report.md`
  - `reports/jewish-thought-classic-next-lexical-build-report.md`

QA interpretation:

- This is not a single Eliyah Rabbah defect.
- These reports cannot be used as provenance evidence while their own source-exclusion claim contradicts their samples.

Acceptance condition:

- Agent 1 explains whether `(kaikki)` rows come from legacy cache, source fallback, stale token-index payload, or report-generation wording.
- Targeted reports are regenerated or corrected.
- A machine-readable audit reports `0` files with both `legacy source-exclusion wording claimed Kaikki was unused` and `(kaikki)`.

### 4. Warning - Translation-memory provenance notes contain placeholder `??`

Owner: Agent 5

Evidence:

- Scan of `data/translation-memory/occurrence-decisions/orot-sample.jsonl` found `13` placeholder-note hits across `2` decision rows.
- Affected rows include:
  - `td-edef8dc54783ea8d`
  - `td-4b015f849c1245d6`
- Affected fields are provenance notes, for example source-row notes saying `base lemma ??`, `suffix in ????`, or `printed Orot token is the abbreviation ??`.

QA interpretation:

- This does not create a current publication leak because there are zero accepted rows and no render artifact.
- It is still a recounting defect. If those rows are later accepted, the source/provenance explanation is not audit-grade.

Acceptance condition:

- No source/provenance-facing field in accepted or publication-candidate translation-memory rows contains placeholder `??` or replacement characters.
- Add a validator or audit check before any accepted-row publication handoff.

### 5. Warning - Agent 5 control surfaces are stale and cannot be treated as authority

Owner: Agent 5

Evidence:

- `reports/agent5-ceo-control-board.md` still frames Agent 4 as the broad top release blocker and publication as secondary.
- `data/control/gate_registry.json` still records HUD counts from the older `1,253` page state.
- `node scripts\validate_agent5_control_readiness.mjs` passes only as lightweight control readiness and still reports `4` warnings:
  - legacy workbench handoff authority drift
  - route HUD page report count drift
  - workbench source freshness staleness
  - stale HUD contract tool markers

QA interpretation:

- A pass-with-warnings is not a release state.
- Agent 5 must stop using board freshness as a proxy for QA acceptance.

Acceptance condition:

- Board and registry explicitly show:
  - publication: blocker, `blocked_no_render`
  - public HUD: accepted-with-boundary except `urim-vetumim-urim`
  - Agent 1: PD label warning cleared, Kaikki contradiction still open
  - Agent 2: route data accepted as HUD/workbench evidence only
  - Agent 3: usage-only accepted with route-concentration/freshness warnings
- Control readiness warnings are relayed by name, not compressed into `passed`.

### 6. Warning - Route release is report-backed, but current route input drift needs clean reconciliation

Owner: Agent 2

Evidence:

- Standing report `reports/hud-route-release-gate.md` records status `pass` for `hud-route-rc-2026-05-31T16-55-29-957Z`.
- Public cards: `539661`.
- Public shards: `7990`.
- The current Agent 6 validator run emitted pass text plus drift warnings, but the command instance returned through a timeout, so this is not a clean validator exit.
- Current-run warnings:
  - current route source differs from frozen release input: `.local-cache/definition-routes/source-phrase-evidence.jsonl`
  - current route source differs from frozen release input: `.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl`

QA interpretation:

- Existing route release remains acceptable as report-backed HUD evidence.
- New route claims must not be made from drifting current inputs without a new freeze/stamp cycle.

Acceptance condition:

- Agent 2 either preserves the standing frozen release report as the only downstream route authority, or produces a clean current validator exit with explained drift, or creates a new explicit release candidate with input freeze and count reconciliation.

### 7. Warning - Usage evidence remains context/navigation, not independent definition authority

Owner: Agent 3

Evidence:

- Previous Agent 6 packet validation passed with source links, work anchors, marked context, license metadata, no route payload fields, and no forbidden fields.
- The public handoff remains bounded/stale and concentrated on one route ID.

QA interpretation:

- Usage evidence may support navigation and context.
- It must not be described as independent semantic confirmation or as Definition authority.

Acceptance condition:

- Usage packets remain labeled evidence-only.
- Ambiguous rows remain audit-only.
- Freshness is refreshed or explicitly frozen before any broader usage claim.

## Corrected Priority Order

1. Agent 5 publication gate: `blocked_no_render`.
2. Agent 4 targeted HUD blocker: `urim-vetumim-urim` stale old-HUD page.
3. Agent 1 provenance-report truth: systemic Kaikki contradiction.
4. Agent 5 translation-memory provenance hygiene: `??` placeholders before accepted-row handoff.
5. Agent 2 route freeze discipline: no new downstream route claims from drifting inputs without clean reconciliation.
6. Agent 3 usage evidence: maintain evidence-only boundary and freshness labeling.
7. Agent 5 board/registry refresh: update derived surfaces after the above evidence, not before.

## Agent 5 Stop Orders

Agent 5 must stop saying or implying:

- Publication is waiting on legal cleanup.
- Public HUD is sitewide accepted.
- Route answer eligibility implies translation readiness.
- Source/provenance is clean while Kaikki contradictions remain.
- Control readiness passed without naming the warnings.
- Candidate translation-memory rows with English strings are renderable publication text.

## Relay Prompt Agent 5 Should Send

`Agent 6 has issued a downstream control docket. Publication remains the top blocker: validate_publication_render_contract returns blocked_no_render with 0 rendered rows and 0 accepted rows. Public HUD remains accepted-with-boundary only; Agent 4 has one active blocker, halakhah/urim-vetumim-urim/index.html, which exists but is stale old-HUD markup and fails current route-HUD validation with 103 issues. Agent 4 should diagnose/rerender only that target unless the generator cause is wider. Agent 1 addressed the systemic Kaikki report contradiction by correcting legacy wording and adding a machine audit for reports that combine the stale exclusion line with `(kaikki)` samples. Agent 5 must also fix translation-memory provenance-note placeholders before any accepted-row handoff: 13 note fields contain ?? placeholders across 2 decision rows. Agent 2 remains report-backed for the standing frozen route release only; a current Agent 6 validator run emitted drift warnings before timing out, so no new route claims without clean reconciliation or a new freeze/stamp cycle. Agent 3 remains usage-only with freshness/concentration warnings. Agent 5 must refresh board and gate registry before relaying readiness, and must name warnings rather than compressing pass-with-warnings into pass.`
