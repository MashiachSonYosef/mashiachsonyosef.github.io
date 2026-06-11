# Agent 6 Source Audit Scope Docket

Generated: 2026-06-01T01:02:47-04:00
Agent: Agent 6, independent QA/compliance authority

## Verdict

Warning for current public/workbench state. Blocker for source/provenance acceptance and any future publication path that depends on these sources.

Agent 5 correctly updated the board from `reports/agent6-validation-cycle-2026-06-01.md`, but the current workspace has moved again. The validation report counted 8 untracked source files. Current git state shows 10 untracked `data/sources/*.json` files, including two additional CC-BY linear Machzor files.

## Findings

### Blocker: Tracked source audit scope is no longer complete

Owner: Agent 5 for board/control drift, then Agent 1 for source/provenance correction

Evidence:

- `reports/source-license-label-audit.md` explicitly audits tracked `data/sources/*.json` files only.
- Current `git ls-files --others --exclude-standard -- data/sources/*.json` returns 10 untracked source JSON files.
- Agent 5 control files now preserve the older Agent 6 validation-cycle count of 8 untracked files.
- The current untracked set includes two additional CC-BY source files not in Agent 5's preserved list: `machzor-rosh-hashanah-ashkenaz-linear.json` and `machzor-yom-kippur-ashkenaz-linear.json`.

Current untracked source files:

- `beer-hagolah.json`
- `derashat-shabbat-hagadol.json`
- `derush-al-hatorah.json`
- `gevurot-hashem.json`
- `machzor-rosh-hashanah-ashkenaz-linear.json`
- `machzor-rosh-hashanah-ashkenaz.json`
- `machzor-yom-kippur-ashkenaz-linear.json`
- `ner-mitzvah.json`
- `netivot-olam.json`
- `netzach-yisrael.json`

Current untracked license-unit counts from source JSON objects:

- Public Domain: 5228
- CC-BY: 34144
- Total: 39372

Acceptance condition:

Agent 5 must update control surfaces to 10 untracked source files and 34144 CC-BY units, not 8 and 1488. Agent 1 must either bring these files into the tracked audit surface or quarantine their downstream overlays/pages from provenance acceptance until the tracked source-license audit explicitly covers them.

### Warning: CC-BY overlay artifacts exist before source audit closure

Owner: Agent 1

Evidence:

- `data/overlays/machzor-rosh-hashanah-ashkenaz-linear.json` exists.
- `data/overlays/machzor-rosh-hashanah-ashkenaz.json` exists.
- `data/overlays/machzor-yom-kippur-ashkenaz-linear.json` exists.
- The corresponding source JSON files are untracked and outside the tracked source-license report.
- No public `index.html` exists yet for the three checked Machzor slugs, so this is not a confirmed public-page leak.

Acceptance condition:

Before any render/page/HUD acceptance for these Machzor works, the source files must be inside the tracked audit scope or explicitly quarantined, and CC-BY attribution requirements must be verified in the public page source/license rows.

### Pass With Boundary: Existing public pages for Public Domain untracked sources have visible source/license rows

Owner: Agent 4 for public page display, Agent 1 for source tracking

Evidence:

- Existing public pages were found for `other/beer-hagolah`, `other/derashat-shabbat-hagadol`, `other/derush-al-hatorah`, `other/gevurot-hashem`, `other/ner-mitzvah`, `other/netivot-olam`, and `other/netzach-yisrael`.
- Sampled pages such as `other/beer-hagolah/index.html` and `other/netivot-olam/index.html` include visible source/license notes and footer source tables.
- This does not clear the tracking problem: source files can be displayed correctly and still be outside the tracked audit surface.

Acceptance condition:

Public display can remain warning-level if labels stay visible and non-misleading, but source/provenance acceptance remains blocked until the audit scope includes the source files or they are removed/quarantined from source-dependent gates.

## Corrected Priority Order

1. Agent 5 updates the board again: source-audit scope is 10 untracked files, not 8; CC-BY units are 34144, not 1488.
2. Agent 1 reconciles source/provenance scope: track, audit, or quarantine the 10 untracked source JSON files and their overlays/pages.
3. Publication remains `blocked_no_render`; do not treat this source issue as publication cleanup.
4. Agent 4 remains monitor-only unless a public page is rendered for the CC-BY Machzor files without adequate attribution/source rows.

## Relay Prompt

```text
Agent 5, Agent 6 accepts the HUD/publication correction, but the source-audit scope count is already stale against current workspace state. `git ls-files --others --exclude-standard -- data/sources/*.json` now shows 10 untracked source JSON files, not 8. Add `machzor-rosh-hashanah-ashkenaz-linear.json` and `machzor-yom-kippur-ashkenaz-linear.json` to the warning. Current untracked source-license counts are Public Domain 5228 and CC-BY 34144. Update `pipeline_state.json`, `gate_registry.json`, and priority handoffs accordingly. Treat this as a blocker for source/provenance acceptance and any future publication path, but only warning-level for current public/workbench state unless a rendered public page lacks visible source/license/attribution rows.
```

## Agent 1 Relay Prompt

```text
Agent 1, Agent 6 found that current source/provenance scope is outside audit control: 10 untracked `data/sources/*.json` files exist, including CC-BY Machzor sources `machzor-rosh-hashanah-ashkenaz-linear.json`, `machzor-rosh-hashanah-ashkenaz.json`, and `machzor-yom-kippur-ashkenaz-linear.json`. Reconcile these by either bringing them into the tracked source-license audit surface or quarantining their overlays/pages from provenance acceptance. Do not broaden renders. Return exact tracked/untracked file list, license-unit counts, and whether any public page/HUD artifact exists for each.
```

