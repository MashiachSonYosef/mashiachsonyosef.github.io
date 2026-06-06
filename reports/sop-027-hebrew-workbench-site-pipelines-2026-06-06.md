# SOP-027 Hebrew Workbench Site Pipelines

Status: draft executable pipeline record.

Boundary: reader/site pipeline only. No Definition acceptance, source/license/legal acceptance, translation acceptance, or release claim beyond the exact published artifact.

## 1. Render a TBD page

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
source work selected | load source units plus lexical occurrence roster | generated work `index.html` | one visible row per occurrence token | 10 minutes | mark render blocked with missing roster/source path | renderer
no approved pre-HUD selection | display `TBD` in gloss and match columns | work page | unresolved rows do not invent glosses | immediate | keep row TBD | renderer
reader-hint/selection file exists | fill pre-HUD from selection layer only | work page | selected rows cite source number and match percent | 10 minutes | keep selected row TBD and log bad selection | renderer

## 2. Fix the splash header

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
owner changes splash wording | edit only root `index.html` | root page | visible copy matches owner wording | 10 minutes | revert to last owner-approved splash wording | publisher
plain-language rule active | remove explanatory hero copy | root page | only title, corpus chart, downloads remain | immediate | block extra copy | publisher
root links change | edit `data/site/hebrew-workbench-catalog.json` then run `node scripts/build_hebrew_workbench_index.mjs` | root page | corpus cards expand to work links; no corpus tile links straight to a work | 10 minutes | restore last valid catalog | publisher

## 3. Organize corpus of TBD Hebrew

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
new corpus/work enters site queue | assign one of 11 corpus buckets | root chart plus work path | work has stable corpus path | 10 minutes | place in `other` until owner classifies | catalog owner
work not approved for live route | keep source data but omit live link | root page | no unapproved work link appears | immediate | remove homepage link | publisher
featured list changes | add or remove only the work row under `featured` in the catalog | catalog plus root page | featured points to existing work paths only; it creates no duplicate work artifact | 10 minutes | remove featured row until path is valid | publisher

## 4. Organize a book page

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
book page render starts | group rows by source unit and chapter | book `index.html` | small section tracker, unit heading, source line, token rows exist | 10 minutes | render first blocked unit report | renderer
mobile/desktop layout check | verify rows wrap without hiding text | browser proof or static check | Hebrew, gloss, match remain visible | 10 minutes | simplify columns to one-column mobile | renderer
reader needs less page chrome | provide section tracker hide/show button | book `index.html` | section tracker can be collapsed without changing source rows | immediate | shrink tracker links | renderer

## 5. Organize the HUD popup

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
Hebrew token clicked | open full-screen HUD | work page | HUD appears above page, not inline below rows | 5 seconds | show lookup failure in HUD | renderer
Hebrew token renders | style token as a visible button/link target | work page | Hebrew token has visible click affordance and opens HUD | immediate | strengthen token border/underline | renderer
evidence exists | show source/license details inside HUD | work page | evidence visible without changing pre-HUD | 5 seconds | show no details | renderer
public HUD text changes | keep labels in plain workbench language | work page | labels use gloss/source/details/use gloss, not route jargon | immediate | block wording until rewritten plainly | renderer

## 6. Organize the percent matcher

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
selection layer provides match percent | display integer percent beside gloss | work page | percent matches selection/evidence source | immediate | display `TBD` | matcher owner
candidate evidence is only HUD evidence | do not prefill match percent | work page | pre-HUD remains `TBD` | immediate | keep evidence in HUD only | matcher owner

## 7. Organize the gloss layer

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
approved reader selection exists | show plain English gloss in pre-HUD | work page | full gloss wraps; no cutoff | immediate | keep `TBD` | gloss owner
lemma-only/raw candidate exists | keep it inside HUD | work page | no lemma-only pre-HUD claim | immediate | mark as HUD evidence only | gloss owner

## 8. Organize the publisher

trigger | action | output artifact | success condition | timeout | fallback | owner
---|---|---|---|---|---|---
live surface changes | update Pages workflow sparse checkout and artifact copy list | `.github/workflows/deploy-lightweight-pages.yml` | deployed artifact contains intended root, work page, downloads only | 10 minutes | workflow fails closed | publisher
push completes | check Actions build/deploy result once | GitHub Actions run | latest workflow conclusion is success | 10 minutes | read failed step and patch exact blocker | publisher
site verification requested | one-shot fetch root/work/download URLs | verification note/report | root copy, work page, and downloads match pushed artifact | 2 minutes | report exact stale/failing URL | publisher
