# Agent 1 Source Scope Recount Recheck

Generated: 2026-06-01

## Verdict Boundary

- Agent 1 status: evidence-ready / awaiting-Agent-6.
- Publication state: blocked_no_render.
- Source/provenance acceptance: not claimed.
- Page/render acceptance: not claimed.
- Future publication-path support: not claimed.

## Recount Result

- Direct live list: `reports/untracked-source-files-direct.txt`
- Audit JSON: `reports/untracked-source-scope-audit.json`
- Audit report: `reports/untracked-source-scope-audit.md`
- Direct untracked `data/sources/*.json`: 23
- Audited untracked `data/sources/*.json`: 23
- Missing in audit: 0
- Extra in audit: 0
- License-unit counts:
  - CC-BY: 74,683
  - Public Domain: 10,727

The previous 19-vs-13 / "six missing brief-commentary files" premise is stale. Current live discovery shows the stale 13-file direct list omitted 10 interrupted Tosefta Brief Commentary source files.

## Current Untracked Source Files

### Older Quarantine Set

All rows below remain quarantined until tracked and accepted by source/provenance QA. Audit rows record overlay/page evidence where present.

| Source file | Units / license | Overlay | Public page | Visible source/license rows |
| --- | --- | --- | --- | --- |
| `data/sources/beer-hagolah.json` | Public Domain: 529 | yes | yes | yes |
| `data/sources/derashat-shabbat-hagadol.json` | Public Domain: 271 | yes | yes | yes |
| `data/sources/derush-al-hatorah.json` | Public Domain: 257 | yes | yes | yes |
| `data/sources/gevurot-hashem.json` | Public Domain: 1,863 | yes | yes | yes |
| `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json` | CC-BY: 14,761 | yes | yes | yes |
| `data/sources/machzor-rosh-hashanah-ashkenaz.json` | CC-BY: 1,488 | yes | yes | yes |
| `data/sources/machzor-yom-kippur-ashkenaz-linear.json` | CC-BY: 17,895 | yes | yes | yes |
| `data/sources/ner-mitzvah.json` | Public Domain: 90 | yes | yes | yes |
| `data/sources/netivot-olam.json` | Public Domain: 1,248 | yes | yes | yes |
| `data/sources/netzach-yisrael.json` | Public Domain: 970 | yes | yes | yes |
| `data/sources/selichot-nusach-lita-linear.json` | CC-BY: 22,257 | yes | yes | yes |
| `data/sources/shabbat-siddur-sefard-linear.json` | CC-BY: 14,718 | yes | yes | yes |
| `data/sources/siddur-sefard.json` | CC-BY: 1,300; Public Domain: 5,499 | yes | yes | yes |

### Interrupted Tosefta Brief Commentary Set

These 10 files were introduced by the interrupted final Tosefta Brief Commentary import lane. They are not accepted as source/provenance-clean until the full source/overlay/page/lexical validation lane is completed or they are explicitly quarantined/excluded.

| Source file | Units / license | Overlay | Public page | Visible source/license rows |
| --- | --- | --- | --- | --- |
| `data/sources/brief-commentary-on-peah.json` | CC-BY: 158 | yes | yes | yes |
| `data/sources/brief-commentary-on-rosh-hashanah.json` | CC-BY: 85 | yes | yes | yes |
| `data/sources/brief-commentary-on-shabbat.json` | CC-BY: 493 | yes | yes | yes |
| `data/sources/brief-commentary-on-shekalim.json` | CC-BY: 114 | yes | yes | yes |
| `data/sources/brief-commentary-on-sheviit.json` | CC-BY: 337 | yes | yes | yes |
| `data/sources/brief-commentary-on-sotah.json` | CC-BY: 158 | yes | yes | yes |
| `data/sources/brief-commentary-on-taanit.json` | CC-BY: 66 | yes | yes | yes |
| `data/sources/brief-commentary-on-terumot.json` | CC-BY: 486 | yes | missing | no |
| `data/sources/brief-commentary-on-yevamot.json` | CC-BY: 228 | yes | missing | no |
| `data/sources/brief-commentary-on-yoma.json` | CC-BY: 139 | yes | missing | no |

## Quarantine Statement

Every untracked source file above is marked in the refreshed audit as:

`quarantined_until_source_file_is_tracked_and_source_audit_passes`

This packet is evidence for Agent 6 review only. It does not authorize publication, render broadening, source/provenance acceptance, or downstream reliance.
