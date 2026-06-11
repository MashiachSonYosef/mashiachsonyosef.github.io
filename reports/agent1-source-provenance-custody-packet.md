# Agent 1 Source/Provenance Custody Packet

Generated: 2026-06-04T00:11:30.765Z

## Boundary

- Agent 1 status: evidence-ready / awaiting-Agent-6.
- Publication state: blocked_no_render.
- Source/provenance acceptance: not claimed.
- Public/runtime/page/render/route/definition/product-gate acceptance: not claimed.

## Calibration Input

- Direct untracked source count: 23
- Modified tracked source count: 6
- Recount command: `git ls-files --others --exclude-standard -- data/sources/*.json`
- This packet advances beyond direct-count truth by mapping disposition and downstream reliance.

## Summary Findings

- Source rows covered: 29
- Source rows with SHA-256 fingerprints: 29/29
- Untracked quarantined sources with public pages present: 23/23
- Untracked quarantined sources with overlay JSON present: 23/23
- Untracked quarantined sources with lexical manifests present: 23/23
- Untracked quarantined sources with route/HUD, workbench, or translation-memory hits: 23/23
- Untracked quarantined sources missing visible source/license rows in public pages: 0/23
- Untracked quarantined sources missing lexical manifests: 0/23
- Six modified tracked sources are license-label-only by parsed JSON diff audit: yes
- Modified tracked sources with public pages present: 6/6
- Modified tracked sources with route/HUD, workbench, or translation-memory hits: 6/6
- Modified tracked sources missing visible source/license rows in public pages: 0/6
- Modified tracked sources missing lexical manifests: 0/6

## Machine-Checked Exception Summary

### Missing Visible Source/License Rows

- None detected by page scan.

### Missing Lexical Manifests

- None detected.

### Route/HUD, Workbench, Or Translation-Memory Reliance

- Untracked quarantined sources with route/workbench/translation-memory hits: 23
- Modified tracked sources with route/workbench/translation-memory hits: 6

## Quarantined Untracked Source Dispositions

| Source file | Units | Licenses | Disposition | Downstream reliance evidence |
| --- | ---: | --- | --- | --- |
| `data/sources/beer-hagolah.json` | 529 | Public Domain: 529 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 7; workbench 55; translation-memory 0 |
| `data/sources/brief-commentary-on-peah.json` | 158 | CC-BY: 158 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-rosh-hashanah.json` | 85 | CC-BY: 85 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-shabbat.json` | 493 | CC-BY: 493 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-shekalim.json` | 114 | CC-BY: 114 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-sheviit.json` | 337 | CC-BY: 337 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-sotah.json` | 158 | CC-BY: 158 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-taanit.json` | 66 | CC-BY: 66 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-terumot.json` | 486 | CC-BY: 486 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-yevamot.json` | 228 | CC-BY: 228 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/brief-commentary-on-yoma.json` | 139 | CC-BY: 139 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/derashat-shabbat-hagadol.json` | 271 | Public Domain: 271 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/derush-al-hatorah.json` | 257 | Public Domain: 257 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/gevurot-hashem.json` | 1863 | Public Domain: 1863 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json` | 14761 | CC-BY: 14761 | quarantine | overlay yes; page yes; visible license yes; overlay exports no; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/machzor-rosh-hashanah-ashkenaz.json` | 1488 | CC-BY: 1488 | quarantine | overlay yes; page yes; visible license yes; overlay exports no; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/machzor-yom-kippur-ashkenaz-linear.json` | 17895 | CC-BY: 17895 | quarantine | overlay yes; page yes; visible license yes; overlay exports no; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/ner-mitzvah.json` | 90 | Public Domain: 90 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 8; workbench 25; translation-memory 0 |
| `data/sources/netivot-olam.json` | 1248 | Public Domain: 1248 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/netzach-yisrael.json` | 970 | Public Domain: 970 | quarantine | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/selichot-nusach-lita-linear.json` | 22257 | CC-BY: 22257 | quarantine | overlay yes; page yes; visible license yes; overlay exports no; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/shabbat-siddur-sefard-linear.json` | 14718 | CC-BY: 14718 | quarantine | overlay yes; page yes; visible license yes; overlay exports no; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/siddur-sefard.json` | 6799 | CC-BY: 1300; Public Domain: 5499 | quarantine | overlay yes; page yes; visible license yes; overlay exports no; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |

## Modified Tracked Source Drift

| Source file | Units | Current licenses | HEAD licenses | Drift | Downstream reliance evidence |
| --- | ---: | --- | --- | --- | --- |
| `data/sources/abarbanel-on-guide-for-the-perplexed.json` | 633 | Public Domain: 633 | PD: 633 | unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 32; translation-memory 0 |
| `data/sources/crescas-on-guide-for-the-perplexed.json` | 70 | Public Domain: 70 | PD: 70 | unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/efodi-on-guide-for-the-perplexed.json` | 151 | Public Domain: 151 | PD: 151 | unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/narboni-on-guide-for-the-perplexed.json` | 182 | Public Domain: 182 | PD: 182 | unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/shem-tov-on-guide-for-the-perplexed.json` | 132 | Public Domain: 132 | PD: 132 | unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |
| `data/sources/yahel-ohr-on-zohar.json` | 238 | Public Domain: 238 | PD: 238 | unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit | overlay yes; page yes; visible license yes; overlay exports yes; lexical manifest yes; occurrence yes; token index yes; route/HUD 1; workbench 0; translation-memory 0 |

## Exposure Hit Details

### beer-hagolah
- route_cards_or_hud_surfaces:
  - `data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json`
  - `data/definitions/agent3-definition-workbench-usage-focus-navigation-shards-reshit.json`
  - `data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json`
  - `data/definitions/agent3-definition-workbench-usage-license-provenance-matrix.json`
  - `data/definitions/agent3-definition-workbench-usage-token-bridge-index.json`
  - `data/definitions/definition-workbench-usage-concordance-navigation-packet.json`
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- reader_workbench_artifacts:
  - `data/workbench-evidence/003e376e4afb3bbb-candidate-evidence.json`
  - `data/workbench-evidence/003e376e4afb3bbb-occurrence-graph.json`
  - `data/workbench-evidence/003e376e4afb3bbb/candidate-evidence.jsonl`
  - `data/workbench-evidence/003e376e4afb3bbb/clusters.json`
  - `data/workbench-evidence/003e376e4afb3bbb/occurrence-graph.jsonl`
  - `data/workbench-evidence/389b77a1dfe744be-candidate-evidence.json`
  - `data/workbench-evidence/389b77a1dfe744be-occurrence-graph.json`
  - `data/workbench-evidence/389b77a1dfe744be/candidate-evidence.jsonl`
  - `data/workbench-evidence/389b77a1dfe744be/clusters.json`
  - `data/workbench-evidence/389b77a1dfe744be/occurrence-graph.jsonl`
  - `data/workbench-evidence/39048793fdbb3d13-candidate-evidence.json`
  - `data/workbench-evidence/39048793fdbb3d13-occurrence-graph.json`
  - `data/workbench-evidence/39048793fdbb3d13/candidate-evidence.jsonl`
  - `data/workbench-evidence/39048793fdbb3d13/clusters.json`
  - `data/workbench-evidence/39048793fdbb3d13/occurrence-graph.jsonl`
  - `data/workbench-evidence/43f68615baae6677-candidate-evidence.json`
  - `data/workbench-evidence/43f68615baae6677-occurrence-graph.json`
  - `data/workbench-evidence/43f68615baae6677/candidate-evidence.jsonl`
  - `data/workbench-evidence/43f68615baae6677/clusters.json`
  - `data/workbench-evidence/43f68615baae6677/occurrence-graph.jsonl`
  - `data/workbench-evidence/a5b899bb9aa2ae24-candidate-evidence.json`
  - `data/workbench-evidence/a5b899bb9aa2ae24-occurrence-graph.json`
  - `data/workbench-evidence/a5b899bb9aa2ae24/candidate-evidence.jsonl`
  - `data/workbench-evidence/a5b899bb9aa2ae24/clusters.json`
  - `data/workbench-evidence/a5b899bb9aa2ae24/occurrence-graph.jsonl`
  - `data/workbench-evidence/b237aef569c408ba-candidate-evidence.json`
  - `data/workbench-evidence/b237aef569c408ba-occurrence-graph.json`
  - `data/workbench-evidence/b237aef569c408ba/candidate-evidence.jsonl`
  - `data/workbench-evidence/b237aef569c408ba/clusters.json`
  - `data/workbench-evidence/b237aef569c408ba/occurrence-graph.jsonl`
  - ... 25 more
- public_lexical_exports:
  - `data/public-lexical/sitewide/work-downloads.csv`
  - `data/public-lexical/sitewide/work-downloads.jsonl`
  - `data/public-lexical/sitewide/work-summary.csv`
  - `data/public-lexical/sitewide/work-summary.jsonl`

### brief-commentary-on-peah
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-rosh-hashanah
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-shabbat
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-shekalim
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-sheviit
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-sotah
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-taanit
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-terumot
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-yevamot
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### brief-commentary-on-yoma
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### derashat-shabbat-hagadol
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### derush-al-hatorah
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### gevurot-hashem
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### machzor-rosh-hashanah-ashkenaz-linear
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### machzor-rosh-hashanah-ashkenaz
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### machzor-yom-kippur-ashkenaz-linear
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### ner-mitzvah
- route_cards_or_hud_surfaces:
  - `data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json`
  - `data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json`
  - `data/definitions/agent3-definition-workbench-usage-focus-navigation-shards-reshit.json`
  - `data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json`
  - `data/definitions/agent3-definition-workbench-usage-token-bridge-consumer-addendum.json`
  - `data/definitions/agent3-definition-workbench-usage-token-bridge-index.json`
  - `data/definitions/definition-workbench-usage-concordance-navigation-packet.json`
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- reader_workbench_artifacts:
  - `data/workbench-evidence/003e376e4afb3bbb-candidate-evidence.json`
  - `data/workbench-evidence/003e376e4afb3bbb-occurrence-graph.json`
  - `data/workbench-evidence/003e376e4afb3bbb/candidate-evidence.jsonl`
  - `data/workbench-evidence/003e376e4afb3bbb/occurrence-graph.jsonl`
  - `data/workbench-evidence/389b77a1dfe744be-candidate-evidence.json`
  - `data/workbench-evidence/389b77a1dfe744be-occurrence-graph.json`
  - `data/workbench-evidence/389b77a1dfe744be/candidate-evidence.jsonl`
  - `data/workbench-evidence/389b77a1dfe744be/occurrence-graph.jsonl`
  - `data/workbench-evidence/39048793fdbb3d13-candidate-evidence.json`
  - `data/workbench-evidence/39048793fdbb3d13-occurrence-graph.json`
  - `data/workbench-evidence/39048793fdbb3d13/candidate-evidence.jsonl`
  - `data/workbench-evidence/39048793fdbb3d13/occurrence-graph.jsonl`
  - `data/workbench-evidence/43f68615baae6677-candidate-evidence.json`
  - `data/workbench-evidence/43f68615baae6677-occurrence-graph.json`
  - `data/workbench-evidence/43f68615baae6677/candidate-evidence.jsonl`
  - `data/workbench-evidence/43f68615baae6677/occurrence-graph.jsonl`
  - `data/workbench-evidence/e7e1f491088f984c-candidate-evidence.json`
  - `data/workbench-evidence/e7e1f491088f984c-occurrence-graph.json`
  - `data/workbench-evidence/e7e1f491088f984c/candidate-evidence.jsonl`
  - `data/workbench-evidence/e7e1f491088f984c/occurrence-graph.jsonl`
  - `data/workbench-evidence/reshit-candidate-evidence.json`
  - `data/workbench-evidence/reshit-occurrence-graph.json`
  - `data/workbench-evidence/reshit/candidate-evidence.jsonl`
  - `data/workbench-evidence/reshit/occurrence-graph.jsonl`
  - `data/workbench-evidence/usage-concordance.json`

### netivot-olam
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### netzach-yisrael
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### selichot-nusach-lita-linear
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### shabbat-siddur-sefard-linear
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### siddur-sefard
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### abarbanel-on-guide-for-the-perplexed
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- reader_workbench_artifacts:
  - `data/workbench-evidence/003e376e4afb3bbb-candidate-evidence.json`
  - `data/workbench-evidence/003e376e4afb3bbb-occurrence-graph.json`
  - `data/workbench-evidence/003e376e4afb3bbb/blocked-rows.jsonl`
  - `data/workbench-evidence/389b77a1dfe744be-candidate-evidence.json`
  - `data/workbench-evidence/389b77a1dfe744be-occurrence-graph.json`
  - `data/workbench-evidence/389b77a1dfe744be/blocked-rows.jsonl`
  - `data/workbench-evidence/39048793fdbb3d13-candidate-evidence.json`
  - `data/workbench-evidence/39048793fdbb3d13-occurrence-graph.json`
  - `data/workbench-evidence/39048793fdbb3d13/blocked-rows.jsonl`
  - `data/workbench-evidence/43f68615baae6677-candidate-evidence.json`
  - `data/workbench-evidence/43f68615baae6677-occurrence-graph.json`
  - `data/workbench-evidence/43f68615baae6677/blocked-rows.jsonl`
  - `data/workbench-evidence/a5b899bb9aa2ae24-candidate-evidence.json`
  - `data/workbench-evidence/a5b899bb9aa2ae24-occurrence-graph.json`
  - `data/workbench-evidence/a5b899bb9aa2ae24/blocked-rows.jsonl`
  - `data/workbench-evidence/b237aef569c408ba-candidate-evidence.json`
  - `data/workbench-evidence/b237aef569c408ba-occurrence-graph.json`
  - `data/workbench-evidence/b237aef569c408ba/blocked-rows.jsonl`
  - `data/workbench-evidence/b9e16c5bad5db2d7-candidate-evidence.json`
  - `data/workbench-evidence/b9e16c5bad5db2d7-occurrence-graph.json`
  - `data/workbench-evidence/b9e16c5bad5db2d7/blocked-rows.jsonl`
  - `data/workbench-evidence/e7e1f491088f984c-candidate-evidence.json`
  - `data/workbench-evidence/e7e1f491088f984c-occurrence-graph.json`
  - `data/workbench-evidence/e7e1f491088f984c/blocked-rows.jsonl`
  - `data/workbench-evidence/f96f23955d2ad136-candidate-evidence.json`
  - `data/workbench-evidence/f96f23955d2ad136-occurrence-graph.json`
  - `data/workbench-evidence/f96f23955d2ad136/blocked-rows.jsonl`
  - `data/workbench-evidence/reshit-candidate-evidence.json`
  - `data/workbench-evidence/reshit-occurrence-graph.json`
  - `data/workbench-evidence/reshit/blocked-rows.jsonl`
  - ... 2 more
- public_lexical_exports:
  - `data/public-lexical/by-work/abarbanel-on-guide-for-the-perplexed-token-claims-min60.csv`
  - `data/public-lexical/sitewide/work-downloads.csv`
  - `data/public-lexical/sitewide/work-downloads.jsonl`
  - `data/public-lexical/sitewide/work-summary.csv`
  - `data/public-lexical/sitewide/work-summary.jsonl`

### crescas-on-guide-for-the-perplexed
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- public_lexical_exports:
  - `data/public-lexical/by-work/crescas-on-guide-for-the-perplexed-token-claims-min60.csv`
  - `data/public-lexical/sitewide/work-downloads.csv`
  - `data/public-lexical/sitewide/work-downloads.jsonl`
  - `data/public-lexical/sitewide/work-summary.csv`
  - `data/public-lexical/sitewide/work-summary.jsonl`

### efodi-on-guide-for-the-perplexed
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- public_lexical_exports:
  - `data/public-lexical/by-work/efodi-on-guide-for-the-perplexed-token-claims-min60.csv`
  - `data/public-lexical/sitewide/work-downloads.csv`
  - `data/public-lexical/sitewide/work-downloads.jsonl`
  - `data/public-lexical/sitewide/work-summary.csv`
  - `data/public-lexical/sitewide/work-summary.jsonl`

### narboni-on-guide-for-the-perplexed
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- public_lexical_exports:
  - `data/public-lexical/by-work/narboni-on-guide-for-the-perplexed-token-claims-min60.csv`
  - `data/public-lexical/sitewide/work-downloads.csv`
  - `data/public-lexical/sitewide/work-downloads.jsonl`
  - `data/public-lexical/sitewide/work-summary.csv`
  - `data/public-lexical/sitewide/work-summary.jsonl`

### shem-tov-on-guide-for-the-perplexed
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`

### yahel-ohr-on-zohar
- route_cards_or_hud_surfaces:
  - `data/definitions/definition-workbench-usage-freshness-impact-packet.json`
- public_lexical_exports:
  - `data/public-lexical/by-work/yahel-ohr-on-zohar-token-claims-min60.csv`
  - `data/public-lexical/sitewide/work-downloads.csv`
  - `data/public-lexical/sitewide/work-downloads.jsonl`
  - `data/public-lexical/sitewide/work-summary.csv`
  - `data/public-lexical/sitewide/work-summary.jsonl`

## What Changed Since Last Agent 6 Ruling

- Direct-23/audit-23 count truth was already WARN-accepted as report truth only.
- This packet adds custody disposition and downstream reliance evidence for all 23 untracked sources.
- This packet adds the six modified tracked source files outside the prior docket and identifies their drift as unit license label normalization from `PD` to `Public Domain`, pending Agent 6 review.

## What Must Not Be Accepted

- source/provenance acceptance
- publication readiness
- future publication support
- public/runtime acceptance
- Definition authority
- route publication support
- product/data gate acceptance
- accepted translation text
- page/render acceptance
- acceptance of the six modified tracked source files
