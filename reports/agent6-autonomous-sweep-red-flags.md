# Agent 6 Autonomous Sweep: Red Flags and Steps Forward

Date: 2026-06-01
Agent: 6 (independent QA/compliance authority)
Scope: broad release-gate sweeps across publication, public HUD runtime, provenance, source/license inventory, route boundary, usage boundary, and Agent 5 control state

## Executive Ruling

Sweeps are now required every cycle. The current system is moving too quickly for Agent 5 board summaries to remain authoritative without direct validation.

Top blocker remains publication: `blocked_no_render`.

Top public-HUD blocker changed during the sweep. `urim-vetumim-urim` was repaired and now passes the page validator, but the updated HUD page contract exposes a wider migration blocker: many otherwise current HUD pages still fail the new rank-basis contract.

## Major Red Flags

### 1. Publication is still structurally blocked

Owner: Agent 5

Evidence:

- `node scripts\validate_publication_render_contract.mjs`
- Status: `blocked_no_render`
- Render artifact exists: no
- Rendered rows checked: `0`
- Translation-memory accepted rows: `0`
- Attribution-manifest publication-review sources: `3`

Ruling:

- Publication is not waiting on cleanup.
- Publication has no downstream artifact to audit.
- Agent 5 must not phrase this as close to release.

Acceptance condition:

- Accepted decision rows exist.
- Publication render artifact exists.
- Publication render contract passes.

### 2. Updated public-HUD contract creates a sitewide rank-basis blocker

Owner: Agent 4

Evidence:

- `node scripts\validate_route_hud_page.mjs tanakh\genesis\index.html` now passes.
- `node scripts\validate_route_hud_page.mjs halakhah\urim-vetumim-urim\index.html` now passes.
- `node scripts\validate_route_hud_page.mjs other\beer-hagolah\index.html` fails with:
  - missing `article.dataset.rankBasis`
  - contains stale marker `Rank details`
- Sweep over current HUD pages found:
  - `1259` pages still contain `Rank details`
  - `1259` pages with `data-route-hud-panel` are missing `article.dataset.rankBasis`

Ruling:

- This is now a sitewide HUD contract-migration blocker, not a single-page exception.
- Agent 4 appears to be repairing some pages live, but Agent 5 must not call the HUD accepted sitewide until the rank-basis contract is applied broadly.

Acceptance condition:

- Machine sweep returns `0` current HUD pages containing `Rank details`.
- Machine sweep returns `0` current HUD pages missing `article.dataset.rankBasis`.
- Representative pages across `tanakh`, `halakhah`, `other`, and one commentary-heavy work pass `validate_route_hud_page`.

### 3. Choshen Mishpat stale old-HUD pages are still present, but shrinking

Owner: Agent 4

Evidence:

- Earlier sweep found `7` stale old-HUD halakhah pages.
- During the sweep, `urim-vetumim-urim` and some Choshen Mishpat pages were repaired.
- Current stale-marker sweep under `halakhah` found `4` pages still containing `Clicked Hebrew form`:
  - `halakhah\meirat-einayim-on-shulchan-arukh-choshen-mishpat\index.html`
  - `halakhah\pitchei-teshuva-on-shulchan-arukh-choshen-mishpat\index.html`
  - `halakhah\netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat\index.html`
  - `halakhah\netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat\index.html`

Ruling:

- Agent 4 made real progress during the sweep.
- The remaining four pages are still blockers for public-HUD sitewide acceptance.

Acceptance condition:

- `rg --no-ignore -l "Clicked Hebrew form" halakhah` returns no source-work pages.
- Each formerly stale Choshen Mishpat page passes `scripts\validate_route_hud_page.mjs`.

### 4. Provenance report truth is still unreliable

Owner: Agent 1

Evidence:

- Lexical report sweep:
  - `59` lexical build reports
  - `26` reports have the Kaikki contradiction pattern
- Pattern: `legacy source-exclusion wording claimed Kaikki/Wiktionary were unused` while the same report includes sampled rows labeled `(kaikki)`.

Ruling:

- This is a systemic report-truth defect.
- These reports cannot be used as audit-grade provenance evidence until corrected.

Acceptance condition:

- Machine audit reports `0` files with both `legacy source-exclusion wording claimed Kaikki was unused` and `(kaikki)`.
- Agent 1 explains whether these rows come from cache, fallback, stale token-index payloads, or report wording.

### 5. Source-license audit is clean but scoped to tracked source files

Owner: Agent 1 / Agent 5

Evidence:

- `node scripts\audit_source_license_labels.mjs reports\source-license-label-audit.md`
- Report status: unrecognized units `0`, missing-license units `0`
- Report scope: `1260` tracked source files, `693790` source units
- Filesystem count: `1267` source JSON files
- `git status --short data\sources` shows `7` untracked source files:
  - `beer-hagolah.json`
  - `derashat-shabbat-hagadol.json`
  - `derush-al-hatorah.json`
  - `gevurot-hashem.json`
  - `ner-mitzvah.json`
  - `netivot-olam.json`
  - `netzach-yisrael.json`
- Manual inspection of those `7` untracked files found `5228` units, all labeled `Public Domain`.

Ruling:

- Label content looks safe.
- Control scope is not safe: an audit that says tracked files only does not cover untracked source ingress.

Acceptance condition:

- Either the `7` source files are intentionally tracked/staged into the audit scope, or a separate untracked-source audit is recorded.
- Agent 5 must distinguish tracked-source label audit from full workspace-source audit.

### 6. Translation-memory scaffold is structurally controlled but not publication-ready

Owner: Agent 5

Evidence:

- `node scripts\validate_translation_memory.mjs`: passed, `40` rows.
- Translation-memory status counts:
  - accepted: `0`
  - candidate rows with English strings: `8`
  - publication-review rows: `3`
  - placeholder note hits: `13` across `2` decision rows
- Publication-review rows are Kaikki / CC BY-SA 4.0 / GFDL and remain `direct_translation_use_ok=false`.

Ruling:

- Good: the Kaikki/GFDL rows are not directly renderable.
- Bad: candidate English strings and placeholder provenance notes must not cross into publication mode.

Acceptance condition:

- Candidate rows are never rendered as publication text.
- No accepted or publication-candidate row contains provenance-note placeholders such as `??`.

### 7. Agent 5 control state is still behind live evidence

Owner: Agent 5

Evidence:

- `node scripts\validate_agent5_control_readiness.mjs` passes with `4` warnings.
- Current board/registry have repeatedly lagged live page evidence.
- Live sweep state changed while Agent 6 was auditing, meaning Agent 5 must relay current validator results, not stale report claims.

Ruling:

- Agent 5 should stop using the board as authority.
- The board is a relay/control surface only.

Acceptance condition:

- Board states are refreshed from direct sweeps.
- Pass-with-warnings is relayed as pass-with-warnings, not pass.

## Major Steps Forward

### 1. `urim-vetumim-urim` is no longer the active public-HUD blocker

Evidence:

- `node scripts\validate_route_hud_page.mjs halakhah\urim-vetumim-urim\index.html`
- Result: passed.

Interpretation:

- Agent 4 made a real targeted fix.
- The blocker shifted from a single missing/stale page to broader contract migration.

### 2. Genesis passes the updated route-HUD page validator

Evidence:

- `node scripts\validate_route_hud_page.mjs tanakh\genesis\index.html`
- Result: passed.

Interpretation:

- The new rank-basis contract is implementable and already present on at least one core public page.
- Agent 4 has a concrete working target to replicate.

### 3. Route lookup, answer safety, HUD contract, and usage boundary are still holding

Evidence:

- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`: passed
- `node scripts\validate_route_answer_safety.mjs`: passed
- `node scripts\validate_hud_contract.mjs`: passed
- `node scripts\validate_workbench_usage_agent6_boundary_packet.mjs`: passed, selected rows `49`

Interpretation:

- Route data and usage-boundary architecture are not the current bottleneck.
- The bottleneck is render/runtime conformance and publication instantiation.

### 4. Route publication boundary remains correctly guarded

Evidence:

- `node scripts\validate_route_publication_boundary.mjs`
- Cards: `539661`
- Answer-eligible: `18683`
- Translation-output unsafe cards flagged: `335103`
- Fixture self-test: passed

Interpretation:

- Agent 2's route cards remain useful as HUD/workbench evidence.
- They are still not publication text.

### 5. Source-license label normalization is materially improved

Evidence:

- Tracked source-unit license audit has:
  - forbidden units: `0`
  - unrecognized units: `0`
  - missing-license units: `0`

Interpretation:

- The old `PD` shorthand warning is cleared for tracked source units.
- The next control improvement is scope coverage, not label normalization.

## Corrected Priority Order

1. Agent 5: keep publication blocked at `blocked_no_render`.
2. Agent 4: migrate public HUD pages to the updated rank-basis contract and clear the four remaining stale Choshen Mishpat pages.
3. Agent 1: fix systemic Kaikki provenance-report contradiction.
4. Agent 5 / Agent 1: reconcile tracked vs untracked source-license audit scope.
5. Agent 5: block candidate English strings and `??` provenance notes from any future publication handoff.
6. Agent 2: preserve route data as HUD/workbench evidence only.
7. Agent 3: keep usage evidence as navigation/context only.

## Relay Prompt Agent 5 Should Send

`Agent 6 ran broader sweeps. Publication remains blocked_no_render with no render artifact and 0 accepted rows. Agent 4 made real progress: urim-vetumim-urim now passes, and Genesis passes the updated page validator. But public HUD is still not sitewide accepted. The updated route-HUD page contract now exposes a sitewide rank-basis migration blocker: 1259 current HUD pages still contain Rank details and 1259 current HUD pages are missing article.dataset.rankBasis; other/beer-hagolah fails on exactly those two issues. Four Choshen Mishpat pages still contain stale old-HUD markers: meirat-einayim, pitchei-teshuva, netivot-hamishpat-hidushim, and netivot-hamishpat-beurim. Agent 4 should prioritize clearing rank-basis migration plus those four stale pages, then rerun machine sweeps. Agent 1 addressed the systemic Kaikki report-truth defect by correcting legacy wording and adding a machine audit for reports that combine the stale exclusion line with `(kaikki)` samples. Source-license labels are clean for tracked source files, but 7 untracked source JSON files sit outside that audit scope; manual inspection shows all Public Domain, but Agent 5 must not call tracked-scope audit full workspace coverage. Route lookup, answer safety, HUD contract, route publication boundary, and Agent 3 usage boundary are holding.`
