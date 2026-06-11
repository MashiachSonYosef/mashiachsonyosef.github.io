# Agent 6 QA Escalation Brief

Generated: 2026-05-31T13:34:27-04:00

## Purpose

Agent 6 is the independent QA authority above Agent 5. This brief tells Agent 6 what Agent 5 currently believes is verified, what is only report-backed, and what needs direct QA before release claims.

Compliance-specific QA docket:

- `reports/agent6-compliance-qa-docket.md`

Role-based QA/display gate model:

- `reports/agent5-role-based-qa-gate-model.md`

## Agent 5 Current Read

Verified by lightweight report checks:

- Agent 2 route release candidate is now report-backed: `hud-route-rc-2026-05-31T16-55-29-957Z`.
- Public route lookup reconciles at 539,661 cards and 7,990 shards.
- HUD route release gate reports `Status: pass` with no issues or warnings.
- Agent 3 usage-navigation direction is observed adopted: 2,390 concordance links checked, 0 bad URLs, 0 unresolved route links.
- Agent 3 usage artifact states it does not emit definition authority and keeps ambiguous rows audit-only.

Not yet QA-accepted:

- Compliance/provenance acceptance for public reader HUD and future translation publication boundaries.
- Role-based QA/display gate acceptance: which low-confidence evidence may show in workbench, which evidence may become authority, and which evidence must remain hidden/review-only.
- HUD click integrity for maqaf/hyphen/prefix/suffix edge cases.
- Current route-HUD page strict validation coverage: current inventory reports 1,239 route-HUD pages, while latest full strict validator count in the report is 1,235.
- HUD accessibility semantics: current pages still declare `aria-modal="true"` without a confirmed focus trap or inert/background behavior.
- Visual/manual confirmation that Agent 3 usage links open the intended target context and that definitions resolve there through Agent 2 rather than copied payloads.

## Current Blocker Owner

Agent 4 remains the main implementation bottleneck.

Reason:

- Agent 2 appears to have followed release-candidate discipline.
- Agent 3 appears to have followed usage-navigation discipline.
- Agent 4 still owns whether those data contracts display truthfully: token identity, definition slot authority, usage lane rendering, and HUD semantics.

## Suggested Agent 6 QA Samples

- Genesis route HUD: click a maqaf compound and verify the clicked surface, normalized key, route card, source/license rows, and definition slot.
- Orot route HUD: click a hyphen/maqaf-like token from a previously failing split-token sample and verify whole-occurrence identity.
- Usage navigation: open one `workbench-usage-concordance.md` link, verify the target page anchor lands in the correct context, then verify the local HUD resolves definition through Agent 2 route data.
- Answer authority: verify that Agent 3 usage rows display as usage/navigation, not as the Definition slot.
- Accessibility: verify whether the HUD is non-modal inspector or true modal. If it is true modal, Tab/Shift+Tab must be contained and background interaction prevented. If non-modal, `aria-modal` should be removed and trigger relationships added.
- Compliance: verify one CC BY row, one publication-review row, one Agent 3 Sefaria/local-anchor usage link, and one public HUD source/license display.
- QA gates: verify that supported/candidate/weak evidence can display as labeled workbench evidence without becoming Definition authority, while ambiguous/blocked evidence remains hidden or audit-only.

## QA Questions For Agent 6

```text
Agent 6, please QA Agent 5's current board. Are Agent 2 route release and Agent 3 usage navigation acceptable as report-backed passes, or do they need direct manual samples? For Agent 4, check one Genesis maqaf token, one Orot hyphen/maqaf split-risk token, one Agent 3 usage link, and HUD modal/non-modal semantics. Return blocker/warning/polish findings with owning lane.
```

Compliance prompt:

```text
Agent 6, treat legal/provenance/compliance risk as a release blocker for publication and as a blocker/warning split for public reader HUD depending on labeling. Review `reports/agent6-compliance-qa-docket.md`, `reports/agent5-license-publication-control-plan.md`, `reports/agent5-translation-attribution-manifest-report.md`, and `data/translation-memory/attribution-manifest.json`. Confirm whether third-party/Sefaria/CC BY/CC BY-SA/GFDL/unknown-license evidence can leak into accepted translation text or public HUD without adequate source/license labels. Return blocker/warning/polish findings with owning lane and acceptance condition.
```

Role-gate prompt:

```text
Agent 6, review `reports/agent5-role-based-qa-gate-model.md`. Confirm whether the proposed gate split is acceptable: workbench display may show labeled supported/candidate/weak evidence without 100% QA, but Definition authority requires answer eligibility and publication requires accepted decision plus compliance gates. Identify any blocker/warning/polish changes before Agent 5 asks Agents 1-4 to implement hidden QA scores or gate fields.
```

## Agent 5 Control Call

- Continue Agent 2 only in freeze-maintenance mode.
- Continue Agent 3 only in usage-navigation mode.
- Keep Agent 4 as active bottleneck until Agent 6 accepts click integrity and HUD lane semantics.
- Keep compliance/provenance as a release blocker for future publication until Agent 6 accepts the boundary.
- Do not make marketing-polish claims until Agent 6 accepts the HUD.
