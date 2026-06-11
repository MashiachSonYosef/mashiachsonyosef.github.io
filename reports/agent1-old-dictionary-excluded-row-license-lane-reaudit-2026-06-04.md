# Agent 1 Old Dictionary Excluded Row License-Lane Reaudit - 2026-06-04

Status: `agent1_old_dictionary_excluded_row_license_lane_reaudit_prepared_for_agent6_boundary_only`.
Workset: `old-dictionary-excluded-row-license-lane-reaudit`.

## Counts

- audited rows / occurrences: `500` / `8427`
- public-domain observed rows / occurrences: `297` / `5747`
- blocked-only non-public/unresolved rows / occurrences: `17` / `259`
- next-missed rows / occurrences included as prior source-family evidence: `50` / `1193`

## Reaudit Table

| source/dictionary | prior status | evidence file(s) | proposed lane | row/subset counts | NC flags if applicable | missing evidence | next command | handoff owner | stop condition |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| Jastrow Dictionary | old/excluded rows previously not Agent-1 lane-cleared for candidate text | reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json | commercial_clean_candidate | 210 / 4474 | n/a | none | Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested. | Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary | Stop after source-family / row-subset lane re-audit packet plus validator pass, or exact missing evidence blocker. |
| BDB Dictionary | old/excluded rows previously not Agent-1 lane-cleared for candidate text | reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json | commercial_clean_candidate | 221 / 4418 | n/a | none | Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested. | Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary | Stop after source-family / row-subset lane re-audit packet plus validator pass, or exact missing evidence blocker. |
| BDB Aramaic Dictionary | old/excluded rows previously not Agent-1 lane-cleared for candidate text | reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json | commercial_clean_candidate | 69 / 2048 | n/a | none | Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested. | Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary | Stop after source-family / row-subset lane re-audit packet plus validator pass, or exact missing evidence blocker. |
| Klein Dictionary | old excluded/non-public-domain rows previously treated as blocked or unresolved in some downstream previews | reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json | noncommercial_educational_candidate | 214 / 4444 | yes | Agent 6/public boundary before any display/storage/public/answer/export behavior | Keep NC rows in separate educational lane/export partition; Agent 2 may not consume as commercial-clean. | Agent 1 for NC lane packet; Agent 6 for exact NC row/subset boundary | Stop after source-family / row-subset lane re-audit packet plus validator pass, or exact missing evidence blocker. |
| BDB Augmented Strong | old excluded / present-but-unused dictionary family | reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json | blocked_or_needs_review | 222 / 4435 | n/a | independent source/license/custody basis; source URL or version source; license label and allowed fields; Agent 6 boundary if evidence appears | Return independent source/license/custody evidence before any Agent 2 candidate text consumption. | Agent 1 if evidence appears; otherwise blocked/review | Stop after source-family / row-subset lane re-audit packet plus validator pass, or exact missing evidence blocker. |

## Export Rule

- commercial-clean export excludes NC rows
- NC educational export is separate
- metadata/link-only emits citation/link only
- blocked/review emits no candidate text

## Boundary

No source/license/legal acceptance, Definition authority, public/runtime mutation, accepted gloss/text, NC commercial authorization, or publication readiness.
