# Agent 6 Autonomous HUD Provenance QA Docket

Generated: 2026-05-31T14:36:21-04:00

## Purpose

Agent 6 selected a high-risk downstream QA lane without implementation changes: public HUD token integrity, HUD accessibility semantics, and provenance/publication boundary controls.

This docket is not legal advice. It is an engineering acceptance docket for Agent 5 to relay.

## Scratch Evidence

- `.codex-tmp/agent6-word-sample-audit.md`
- `.codex-tmp/agent6-word-sample-audit.json`
- `.codex-tmp/agent6-accessibility-audit.md`
- `.codex-tmp/agent6-accessibility-audit.json`
- `.codex-tmp/agent6-translation-license-profile-audit.md`
- `.codex-tmp/agent6-translation-license-profile-audit.json`
- `.codex-tmp/agent6-source-license-label-audit.md`

Commands run:

```powershell
node scripts\audit_route_hud_word_sample.mjs --report .codex-tmp\agent6-word-sample-audit.md --json .codex-tmp\agent6-word-sample-audit.json
node scripts\audit_route_hud_accessibility.mjs --report .codex-tmp\agent6-accessibility-audit.md --json .codex-tmp\agent6-accessibility-audit.json
node scripts\audit_translation_memory_license_profiles.mjs --report .codex-tmp\agent6-translation-license-profile-audit.md --json .codex-tmp\agent6-translation-license-profile-audit.json
node scripts\validate_translation_memory.mjs
node scripts\audit_source_license_labels.mjs .codex-tmp\agent6-source-license-label-audit.md
node scripts\validate_route_hud_page.mjs jewish-thought\abarbanel-on-guide-for-the-perplexed\index.html
```

Note: the source-license audit command timed out after writing a complete scratch report, so treat the report contents as useful evidence but not as a clean command-pass signal.

## Acceptance Call

Public route inventory remains report-backed, but public HUD release is not Agent 6 accepted.

Future publishable translation text remains conditionally controlled by current translation-memory data, but Agent 5 must not claim publication clearance until the future renderer proves it enforces the same gates.

## Findings

### Blocker: public HUD token identity is not accepted

Owning lane: Agent 4

Evidence:

- Word-sample audit: 627 rows checked across `tanakh/genesis/index.html`, `tanakh/ibn-ezra-on-genesis/index.html`, and `orot/index.html`.
- Result: 21 `split_token_mismatch` errors and 606 warnings.
- Error distribution: 20 split-token errors in `orot/index.html`; 1 split-token error in `tanakh/ibn-ezra-on-genesis/index.html`.
- The mismatches are concentrated around maqaf/hyphen compounds where static markup stripping and runtime text-node tokenization disagree.

Control interpretation:

- This is not polish. If the clicked public HUD unit is not the same unit used for route lookup/evidence, the HUD can attach source evidence or answer authority to the wrong surface boundary.

Acceptance condition:

- Agent 4 must prove one shared tokenizer/normalizer contract across rendered HTML, runtime click wrapping, and route lookup.
- Rerun `audit_route_hud_word_sample.mjs` with zero `error` findings.
- Browser-smoke at least one Genesis maqaf token, one Ibn Ezra hyphen/maqaf sample, and one Orot split-risk sample.

### Blocker: HUD modal semantics do not match behavior

Owning lane: Agent 4

Evidence:

- Accessibility audit found 4 errors and 8 warnings.
- Errors include `modal_dialog_without_focus_trap`, `modal_dialog_without_inert_background`, and page-level `page_modal_without_backdrop_or_inert` for both Genesis and Orot.

Control interpretation:

- The HUD is structured, source-rich workbench content. If it declares `aria-modal=true`, it must behave as a modal. If it is a non-modal inspector, the modal claim must be removed and trigger relationships must be explicit.

Acceptance condition:

- Preferred path: treat HUD as a non-modal inspector, remove `aria-modal=true`, add `aria-haspopup="dialog"`, `aria-controls`, and `aria-expanded`, and add live/status handling for async HUD updates.
- Alternative path: implement a real modal focus trap plus inert/obscured background.
- Rerun accessibility audit with zero `error` findings and perform keyboard smoke.

### Warning: answer-slot authority still has edge warnings

Owning lanes: Agent 3 and Agent 4

Evidence:

- Word-sample audit found 1 `form_reference_answer_text`, 25 `evidence_without_answer`, 10 `no_route_cards`, 87 `non_exact_answer`, and 266 `ambiguous_answer_slot` warnings.
- Current route answer-safety report still supports that evidence-only cards do not become answer authority, so this is not currently a publication blocker.

Control interpretation:

- The warning is about public wording. Usage/evidence/navigation rows must never look like the Definition slot.

Acceptance condition:

- A form-reference row must not populate answer text.
- No-route and evidence-without-answer cases must render as no definition or evidence-only, not as a weak definition.
- Non-exact answers must be visibly candidate/generated, not source-established.

### Warning: `PD` shorthand is not defensible provenance labeling

Owning lane: Agent 1

Evidence:

- Source-license label audit checked 1,244 tracked source files and 632,845 source units.
- It found 631,439 allowed units, 0 forbidden units, 0 missing-license units, and 1,406 unrecognized units.
- All unrecognized units are labeled `PD`.
- Top affected works: `abarbanel-on-guide-for-the-perplexed` with 633 units, `yahel-ohr-on-zohar` with 238, `narboni-on-guide-for-the-perplexed` with 182, `efodi-on-guide-for-the-perplexed` with 151, `shem-tov-on-guide-for-the-perplexed` with 132, and `crescas-on-guide-for-the-perplexed` with 70.
- Representative public page `jewish-thought/abarbanel-on-guide-for-the-perplexed/index.html` validates as a route HUD page, but visibly displays `License: PD`.

Control interpretation:

- `PD` may be intended as public-domain shorthand, but it is not precise enough for publication/provenance defense. Public reader labels should not require an unstated project convention to interpret license status.

Acceptance condition:

- Normalize `PD` to an explicit project-approved label such as `Public Domain`, `Public Domain Mark`, or `CC0`, with source URL and edition basis preserved.
- If the project cannot prove the public-domain status, relabel as review-required and block direct publication use.
- Rerun source-license label audit with zero unrecognized units.

### Warning: Eliyah Rabbah provenance report has an internal contradiction

Owning lane: Agent 1

Evidence:

- `reports/halakhah-eliyah-rabbah-hud-recovery-lexical-build-report.md` says `legacy source-exclusion wording claimed Kaikki/Wiktionary were unused`.
- The same report lists a newly resolved parsed-form sample ending with `(kaikki)`.
- The report contains mojibake in visible Hebrew sample rows, which prevents clean downstream review.

Control interpretation:

- The issue may be a stale label, an inherited cache source, or a real source-use contradiction. Until reconciled, this report should not be used as provenance evidence for release claims.

Acceptance condition:

- Agent 1 must regenerate or amend the report with legible UTF-8 Hebrew and a consistent source-use summary.
- If Kaikki was used, label it and route the row through CC BY-SA/GFDL review.
- If Kaikki was not used, explain and remove the incorrect source label.

### Accepted With Condition: translation-memory publication gate data is currently coherent

Owning lane: Agent 5

Evidence:

- `validate_translation_memory.mjs` passed with 40 rows.
- License-profile audit found 21 `publication_ok`, 16 `publication_ok_with_attribution`, and 3 `workbench_ok_publication_review` rows.
- `accepted_blocked` is empty.
- The 3 CC BY-SA/GFDL rows remain `needs_review`, not accepted publication text.

Control interpretation:

- Current data does not show third-party/CC BY-SA/GFDL material leaking into accepted translation text.
- This accepts the data profile only. It does not accept a future publication renderer.

Acceptance condition:

- Future translation renderer must require `decision_status=accepted`, `license_profile.direct_translation_use_ok=true`, source anchors, and attribution manifest linkage.
- Future renderer must reject `workbench_ok_publication_review` rows unless Agent 5 records an explicit output-license decision.

### Accepted With Boundary: public route card inventory is report-backed

Owning lanes: Agent 2 and Agent 4

Evidence:

- `reports/public-hud-route-card-scan.md` reports 175,216 tokens checked, 539,661 cards checked, 832,792 source rows checked, and issue count 0.
- `reports/route-hud-page-upgrade-report.md` reports 1,251 source records, 1,251 generated pages, 1,251 route-HUD pages, and 1,251 pages with `Usage evidence`.
- Localhost smoke in the current report shows Genesis and Beer Hagolah HUD source/license display without `undefined` or console errors.

Control interpretation:

- Inventory/source-row spread is accepted as report-backed.
- This does not override token-identity and accessibility blockers.

Acceptance condition:

- Keep Agent 2 in freeze-maintenance mode.
- Agent 4 must clear behavioral HUD blockers before Agent 5 claims public HUD release acceptance.

## Relay For Agent 5

Tell Agent 4:

- Public HUD is blocked on token identity and modal/non-modal semantics.
- Do not patch generated pages directly; patch shared render/runtime source and rerun scratch audits to zero errors.

Tell Agent 1:

- Normalize or quarantine all `PD` source-unit labels.
- Reconcile the Eliyah Rabbah Kaikki contradiction and regenerate legible provenance evidence.

Tell Agent 3:

- Usage/navigation remains acceptable only while it avoids Definition authority.
- Pay special attention to form-reference, no-route, evidence-only, and non-exact answer warnings.

Tell Agent 5:

- Current posture should be: route inventory report-backed, translation-memory gate data coherent, public HUD behavior QA-blocked, provenance labels carrying warnings.
- Do not describe public HUD as QA accepted until Agent 6 sees zero token-identity errors and zero modal-semantics errors.
