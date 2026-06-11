# Agent 6 Relay Packet for Agent 1

Generated: 2026-06-01T01:13:00-04:00
Agent: Agent 6, independent QA/compliance authority

## Priority

Source/provenance scope is outside audit control. This is a blocker for source/provenance acceptance and any future publication path using these source files. It is warning-level for current public/workbench display unless a public page lacks visible source/license/attribution rows.

## Required Agent 1 Task

Reconcile current untracked source files by either bringing them into the tracked source-license audit surface or quarantining their downstream overlays/pages from provenance acceptance.

Do not broaden renders. Do not regenerate unrelated lexical or page artifacts. Do not claim source/provenance acceptance until the tracked audit report covers the files or the files are explicitly quarantined.

## Current Evidence

Current untracked source files from `git ls-files --others --exclude-standard -- data/sources/*.json`:

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

Current untracked license-unit counts:

- Public Domain: 5228
- CC-BY: 34144
- Total: 39372

Known CC-BY untracked files:

- `machzor-rosh-hashanah-ashkenaz-linear.json`
- `machzor-rosh-hashanah-ashkenaz.json`
- `machzor-yom-kippur-ashkenaz-linear.json`

Known downstream artifact boundary:

- Public pages exist for the Public Domain `other/*` sources: `beer-hagolah`, `derashat-shabbat-hagadol`, `derush-al-hatorah`, `gevurot-hashem`, `ner-mitzvah`, `netivot-olam`, and `netzach-yisrael`.
- No public `index.html` was found for the three checked Machzor slugs at the time of Agent 6 review.
- Overlay files exist for the three CC-BY Machzor works, so render/publication acceptance must remain blocked until source tracking and attribution are proven.

## Acceptance Conditions

Agent 1 must return:

1. Exact tracked/untracked file list after correction.
2. License-unit counts by license after correction.
3. For each of the 10 files: source tracked status, overlay existence, public page existence, and whether source/license rows are present if a public page exists.
4. A clear statement that CC-BY Machzor sources are either inside tracked audit scope or quarantined from downstream provenance/publication acceptance.
5. No broad renders, no unrelated source rewrites, and no source/provenance acceptance claim unless the tracked audit covers the relevant files.

## Exact Relay Text

```text
Agent 1, Agent 6 found that current source/provenance scope is outside audit control. Use `reports/agent6-agent1-source-scope-relay-packet-2026-06-01.md` as the source of truth. Current state shows 10 untracked `data/sources/*.json` files and untracked license counts of Public Domain 5228, CC-BY 34144. Reconcile these by either bringing them into the tracked source-license audit surface or quarantining their overlays/pages from provenance acceptance. Do not broaden renders. Return exact tracked/untracked file list, license-unit counts, and for each file whether an overlay and public page exist and whether visible source/license rows are present.
```

