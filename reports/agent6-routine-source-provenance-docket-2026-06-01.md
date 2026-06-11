# Agent 6 Routine Source/Provenance Docket

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Pulse mode: 4-hour validation pulse
Scope: source/provenance audit scope for current untracked `data/sources/*.json`

## Verdict

Status: block for source/provenance acceptance and any future publication path.

Status: warning for current public/workbench display, unless a rendered public page lacks visible, non-misleading source/license/attribution rows.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `data/control/agent6_validation_queue.json`
- `reports/untracked-source-scope-audit.md`
- `reports/untracked-source-scope-audit.json`
- `scripts/audit_untracked_source_scope.mjs`
- `reports/agent6-routine-untracked-source-scope-audit-2026-06-01.md`
- `reports/agent6-routine-untracked-source-scope-audit-2026-06-01.json`

## Checks Run

```text
git ls-files --others --exclude-standard -- data/sources/*.json
node scripts\audit_untracked_source_scope.mjs --report reports\agent6-routine-untracked-source-scope-audit-2026-06-01.md --json reports\agent6-routine-untracked-source-scope-audit-2026-06-01.json
```

Direct shell `git ls-files` confirmed 13 current untracked source JSON files. The Agent 6 audit script produced matching counts, although the script's internal Node child-process git discovery hit EPERM and reused the existing JSON fallback. Because direct shell git output and generated audit counts match, Agent 6 accepts the 13-file count as current for this docket.

## Counts

- Current untracked source files: 13.
- CC-BY units outside tracked audit scope: 72,419.
- Public Domain units outside tracked audit scope: 10,727.
- Rendered public pages among these files: 7.
- Rendered pages with visible source/license rows: 7.
- Rendered public pages missing visible source/license rows: 0.
- Unrendered or missing public pages among these files: 6.

## Current Untracked Source Files

- `data/sources/beer-hagolah.json`
- `data/sources/derashat-shabbat-hagadol.json`
- `data/sources/derush-al-hatorah.json`
- `data/sources/gevurot-hashem.json`
- `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json`
- `data/sources/machzor-rosh-hashanah-ashkenaz.json`
- `data/sources/machzor-yom-kippur-ashkenaz-linear.json`
- `data/sources/ner-mitzvah.json`
- `data/sources/netivot-olam.json`
- `data/sources/netzach-yisrael.json`
- `data/sources/selichot-nusach-lita-linear.json`
- `data/sources/shabbat-siddur-sefard-linear.json`
- `data/sources/siddur-sefard.json`

## Findings

### Blocker: source/provenance scope is outside tracked audit control

Owner: Agent 1.

Severity: blocker for source/provenance acceptance and future publication path.

Evidence:

- Direct git output shows 13 untracked `data/sources/*.json` files.
- Matching Agent 6 audit output shows 72,419 CC-BY units and 10,727 Public Domain units outside tracked source-audit scope.
- Every row is marked `quarantined_until_source_file_is_tracked_and_source_audit_passes`.

Acceptance condition:

- Agent 1 must either track these source JSON files with source/license audit coverage or explicitly quarantine them from source/provenance acceptance and future publication paths.
- Agent 1 must rerun the untracked source scope audit and produce a report with 0 untracked source JSON files, or a clear quarantine manifest naming every excluded file and downstream artifact.
- Agent 5 must stop carrying older 10-file, 11-file, or 12-file counts as current.

### Warning: current public/workbench display is bounded but not source-accepted

Owner: Agent 1 and Agent 4.

Severity: warning for current public/workbench display.

Evidence:

- 7 of the 13 source files currently have rendered public pages.
- All 7 rendered pages show visible source/license rows in the generated audit.
- The 6 CC-BY or mixed-license liturgy files have overlays but no public pages in this audit, so no public display label failure is currently proven.

Acceptance condition:

- Any future rendered page from these 13 files must show visible, non-misleading source/license/attribution rows.
- Any CC-BY public display must preserve attribution labels.
- Any publication path using these files remains blocked until row-level publication provenance and license handling are validated by Agent 6.

## Not Accepted

- Source/provenance acceptance.
- Publication readiness.
- Legal-cleanup-only status.
- Any future publication path using these source files.
- Any board state that treats old 10-file, 11-file, or 12-file counts as current.

## Required Relay

```text
Agent 5, Agent 6 refreshed the source/provenance docket. Current live source scope is 13 untracked data/sources JSON files, confirmed by direct git ls-files and matching Agent 6 audit output. Counts: 72,419 CC-BY units and 10,727 Public Domain units outside tracked audit scope. This is a BLOCKER for source/provenance acceptance and any future publication path, but only a WARNING for current public/workbench display because the 7 rendered pages in the audit have visible source/license rows and the 6 CC-BY/mixed liturgy files are not rendered as public pages in this audit. Stop carrying old 10/11/12-file counts. Agent 1 owns acceptance: track these files under source/license audit or explicitly quarantine every file and downstream artifact, then rerun the audit.
```
