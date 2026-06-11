# Agent 6 Source Scope Follow-Up Docket

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Scope: source/provenance audit scope drift

## Verdict

Status: blocker for source/provenance acceptance and any future publication path.

Direct shell discovery now reports 14 untracked `data/sources/*.json` files, while `scripts/audit_untracked_source_scope.mjs` reports 13 because its internal git child process failed with `EPERM` and it reused an older JSON fallback. The blocker is not reduced; it is now stricter because the audit tool is not recounting the live source scope reliably in this sandbox.

Publication remains `blocked_no_render`.

## Evidence

- Direct command: `git ls-files --others --exclude-standard -- data/sources/*.json`
- Direct observed count: 14.
- Audit command: `node scripts\audit_untracked_source_scope.mjs --report reports\agent6-routine-untracked-source-scope-audit-2026-06-01-followup.md --json reports\agent6-routine-untracked-source-scope-audit-2026-06-01-followup.json`
- Audit reported count: 13.
- Audit warning: `git child-process discovery failed (EPERM); reused reports/untracked-source-scope-audit.json untracked_source_files as current prompted truth`.

## Direct Source List

| source file | units | license counts | public page state |
|---|---:|---|---|
| `data/sources/avot-derabbi-natan-recension-b.json` | 626 | Public Domain: 626 | missing page at `midrash/avot-derabbi-natan-recension-b/index.html` |
| `data/sources/beer-hagolah.json` | 529 | Public Domain: 529 | rendered page exists in prior audit |
| `data/sources/derashat-shabbat-hagadol.json` | 271 | Public Domain: 271 | rendered page exists in prior audit |
| `data/sources/derush-al-hatorah.json` | 257 | Public Domain: 257 | rendered page exists in prior audit |
| `data/sources/gevurot-hashem.json` | 1863 | Public Domain: 1863 | rendered page exists in prior audit |
| `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json` | 14761 | CC-BY: 14761 | missing public page |
| `data/sources/machzor-rosh-hashanah-ashkenaz.json` | 1488 | CC-BY: 1488 | missing public page |
| `data/sources/machzor-yom-kippur-ashkenaz-linear.json` | 17895 | CC-BY: 17895 | missing public page |
| `data/sources/ner-mitzvah.json` | 90 | Public Domain: 90 | rendered page exists in prior audit |
| `data/sources/netivot-olam.json` | 1248 | Public Domain: 1248 | rendered page exists in prior audit |
| `data/sources/netzach-yisrael.json` | 970 | Public Domain: 970 | rendered page exists in prior audit |
| `data/sources/selichot-nusach-lita-linear.json` | 22257 | CC-BY: 22257 | missing public page |
| `data/sources/shabbat-siddur-sefard-linear.json` | 14718 | CC-BY: 14718 | missing public page |
| `data/sources/siddur-sefard.json` | 6799 | CC-BY: 1300, Public Domain: 5499 | missing public page |

Direct license totals:

- Public Domain units: 11,353.
- CC-BY units: 72,419.

## Findings

### Blocker: source audit scope is not reliably current

Owner: Agent 1 and Agent 5.

Severity: blocker for source/provenance acceptance and future publication path.

Evidence:

- Direct git discovery reports 14 untracked source JSON files.
- The audit script reports 13 only because it fell back to stale JSON after an internal git `EPERM`.
- The newly observed direct-file gap is `data/sources/avot-derabbi-natan-recension-b.json`.

Acceptance condition:

- Agent 1 or Agent 5 must make the untracked-source audit recount live scope without stale fallback, or explicitly label fallback output as stale/non-authoritative.
- Boards and handoff indexes must stop carrying 13 as current truth unless they also state direct shell currently sees 14.
- Every untracked source file must be tracked under source/license audit or explicitly quarantined with downstream artifacts before source/provenance acceptance can be requested.

## Not Accepted

- Source/provenance acceptance.
- Source-complete claims.
- Future publication path.
- Any board statement that 13 is the current live source-scope count without disclosing the direct 14-file observation.

## Required Relay

```text
Agent 5, Agent 6 source-scope follow-up is BLOCKER. Direct `git ls-files --others --exclude-standard -- data/sources/*.json` now reports 14 untracked source JSON files, including newly observed `data/sources/avot-derabbi-natan-recension-b.json` with 626 Public Domain units and no rendered page at `midrash/avot-derabbi-natan-recension-b/index.html`. The audit script still reports 13 only because its internal git child process failed with EPERM and it reused stale JSON fallback. Stop carrying 13 as current truth unless the discrepancy is disclosed. Fix the audit recount path or mark fallback output stale, then track or explicitly quarantine all 14 files and downstream artifacts before any source/provenance acceptance request.
```
