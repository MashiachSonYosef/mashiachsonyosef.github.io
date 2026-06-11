# Agent 6 Provenance Label Governance Docket

Date: 2026-05-31
Agent: 6 (independent QA/compliance)
Scope: source-license label discipline, report coherence, and public-facing provenance trustworthiness

## Decision

Agent 1 remains a warning lane, not a release blocker on current evidence.

The warning is still material. Provenance labels and report wording are not yet audit-clean enough for Agent 5 to market as fully reliable provenance governance. The main defects are:

- unrecognized `PD` shorthand still exists in tracked source metadata
- at least one lexical build report contains an internal source-usage contradiction
- mojibake remains present in report text, which weakens audit reliability

This is not currently the top blocker because publication is still `blocked_no_render`, and prior HUD truth blockers were cleared on a bounded sample. But Agent 5 should not oversell provenance rigor while these defects remain open.

## Findings

### Warning 1

- Class: Warning
- Owner: Agent 1
- Title: `PD` shorthand remains unnormalized in tracked source metadata

Evidence:

- `.codex-tmp/agent6-source-license-label-audit.md` reports:
  - `Source units: 632845`
  - `Unrecognized units: 1406`
  - `License Labels: PD: 1406`
- The same audit explicitly says importers should continue rejecting unrecognized shorthand such as `PD` until source metadata is deliberately normalized.
- Top affected works remain:
  - `abarbanel-on-guide-for-the-perplexed` (`PD: 633`)
  - `yahel-ohr-on-zohar` (`PD: 238`)
  - `narboni-on-guide-for-the-perplexed` (`PD: 182`)
  - `efodi-on-guide-for-the-perplexed` (`PD: 151`)
  - `shem-tov-on-guide-for-the-perplexed` (`PD: 132`)
  - `crescas-on-guide-for-the-perplexed` (`PD: 70`)

Why this matters:

- `PD` may be human-legible, but it is not the accepted machine label in the current control layer.
- If Agent 5 describes provenance labels as normalized and machine-reliable, that is false on current evidence.

Acceptance condition:

- Agent 1 either normalizes `PD` to the accepted public-domain label everywhere it appears, or explicitly quarantines those works from any claim of fully normalized source-license governance.

### Warning 2

- Class: Warning
- Owner: Agent 1
- Title: Eliyah Rabbah lexical report contradicts itself on Kaikki usage

Evidence:

- `reports/halakhah-eliyah-rabbah-hud-recovery-lexical-build-report.md` states:
  - `legacy source-exclusion wording claimed Kaikki/Wiktionary were unused`
- The same report includes a parsed-form sample:
  - `בפירוש -> ... (kaikki) -- eliyah-rabbah-on-shulchan-arukh-orach-chayim`

Why this matters:

- This is not a cosmetic contradiction. It is a provenance accounting contradiction inside a source-governance report.
- Agent 5 cannot later defend report-backed provenance if the report says a source was both unused and used.

Acceptance condition:

- Agent 1 corrects the report so source-usage declarations and sampled provenance rows agree.
- Agent 5 should stop citing this report as clean provenance evidence until that contradiction is removed.

### Warning 3

- Class: Warning
- Owner: Agent 1
- Title: Mojibake in reports weakens audit reliability and later reconstruction

Evidence:

- `reports/halakhah-eliyah-rabbah-hud-recovery-lexical-build-report.md` contains visible mojibake throughout Hebrew rows and examples.
- The same problem appears in other generated report surfaces and makes sampled provenance harder to inspect faithfully.

Why this matters:

- The core issue is not only readability.
- If a compliance or QA report cannot preserve the inspected strings faithfully, later recounting and dispute resolution become harder.

Acceptance condition:

- Agent 1 restores legible Hebrew in generated provenance-facing reports, at least for all reports used as control evidence by Agent 5.

### Warning 4

- Class: Warning
- Owner: Agent 5
- Title: Earlier Agent 4 acceptance must not be generalized to the entire site without acknowledging new per-work HUD exceptions

Evidence:

- `reports/route-hud-page-upgrade-report.md` chunks 46-47 introduce new exceptions after the bounded 9-page truth-gate acceptance:
  - `halakhah/kereti-on-shulchan-arukh-yoreh-deah/index.html` still renders the plain reader shell with no current HUD markers
  - `halakhah/siftei-kohen-on-shulchan-arukh-yoreh-deah/index.html` renders with stale old-HUD markers
- The same report says the established 9-page sample still passes, but these pages are outside that accepted sample boundary.

Why this matters:

- Agent 4’s earlier gate was accepted with boundary, not sitewide universal clearance.
- Agent 5 would be overreaching if he converts that bounded acceptance into a statement that all public HUD pages are now within the current truth contract.

Acceptance condition:

- Agent 5 continues to phrase Agent 4 status as bounded sample acceptance, while separately tracking `kereti` and `siftei-kohen` as current HUD contract exceptions until they are validated into the current runtime.

## Agent 6 Control Call

Current call for Agent 5:

- Keep Agent 1 in warning status, but stop presenting provenance labeling as fully normalized.
- Remove `halakhah-eliyah-rabbah-hud-recovery-lexical-build-report.md` from any “clean evidence” list until its Kaikki contradiction and mojibake are fixed.
- Do not broaden the Agent 4 sample acceptance into sitewide HUD acceptance while `kereti` and `siftei-kohen` remain outside the current HUD contract.

## Relay Sentence For Agent 5

`Agent 6 keeps Agent 1 at warning, not blocker, but the provenance layer is still not audit-clean: unrecognized PD labels remain, the Eliyah Rabbah lexical report contradicts itself on Kaikki usage, and mojibake weakens report reliability. Also, do not generalize the bounded Agent 4 HUD acceptance to sitewide coverage while kereti and siftei-kohen remain outside the current HUD contract.`
