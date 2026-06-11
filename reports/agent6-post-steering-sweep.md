# Agent 6 Post-Steering Sweep

Date: 2026-06-01
Agent: 6 (independent QA/compliance authority)
Scope: current validation after user relayed Agent 6 prompts to Agent 4 and Agent 1

## Current Verdict

Prompt Agent 4 again, narrowly.

Agent 4 made real progress: public HUD source/page coverage is now `1267` current-HUD pages, `Clicked Hebrew form` stale markers are down to `0`, and the previously stale Choshen Mishpat sample pages now pass when checked individually.

But public HUD is still not sitewide accepted because the rank-basis migration is mostly incomplete.

Agent 1 still needs follow-up if he has not acknowledged the Kaikki report-truth work. The contradiction count is unchanged at `26` of `59` lexical build reports.

## Agent 4 Evidence

Latest sweep across public source-work directories:

- Current HUD pages: `1267`
- Missing `article.dataset.rankBasis`: `1259`
- Pages still containing `Rank details`: `1259`
- Pages still containing `Clicked Hebrew form`: `0`

Pages currently showing the new rank-basis contract:

- `tanakh\genesis\index.html`
- `halakhah\urim-vetumim-urim\index.html`
- `halakhah\haggahot-imrei-barukh-on-shulchan-arukh-choshen-mishpat\index.html`
- `halakhah\ketzot-hachoshen-on-shulchan-arukh-choshen-mishpat\index.html`
- `halakhah\meirat-einayim-on-shulchan-arukh-choshen-mishpat\index.html`
- `halakhah\netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat\index.html`
- `halakhah\netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat\index.html`
- `halakhah\pitchei-teshuva-on-shulchan-arukh-choshen-mishpat\index.html`

Representative checks:

- `node scripts\validate_route_hud_page.mjs tanakh\genesis\index.html`: passed
- `node scripts\validate_route_hud_page.mjs halakhah\urim-vetumim-urim\index.html`: passed
- `node scripts\validate_route_hud_page.mjs halakhah\meirat-einayim-on-shulchan-arukh-choshen-mishpat\index.html`: passed
- `node scripts\validate_route_hud_page.mjs halakhah\pitchei-teshuva-on-shulchan-arukh-choshen-mishpat\index.html`: passed
- `node scripts\validate_route_hud_page.mjs other\beer-hagolah\index.html`: failed with missing `article.dataset.rankBasis` and stale `Rank details`
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`: passed

Acceptance condition:

- Machine sweep returns `0` pages missing `article.dataset.rankBasis`.
- Machine sweep returns `0` pages containing `Rank details`.
- Representative pages across every public source-work directory pass `scripts\validate_route_hud_page.mjs`.

## Agent 1 Evidence

Latest lexical report truth audit:

- Lexical build reports: `59`
- Kaikki contradiction reports: `26`

Pattern remains:

- Report says `legacy source-exclusion wording claimed Kaikki/Wiktionary were unused`
- Same report includes sampled rows labeled `(kaikki)`

Acceptance condition:

- Machine audit returns `0` lexical build reports with both `legacy source-exclusion wording claimed Kaikki was unused` and `(kaikki)`.
- Agent 1 explains whether the cause is cache, fallback, stale token-index payload, or report wording.

## Do Not Prompt

Do not prompt Agent 2 or Agent 3 right now.

Route lookup, route answer safety, route-publication boundary, HUD contract, and Agent 3 usage-boundary checks are holding. They are not the current bottleneck.

## Prompt Agent 4 Now

`Agent 4, Agent 6 re-swept after your latest movement. Good progress: current HUD coverage is now 1267 pages and stale old-HUD Clicked Hebrew form markers are down to 0. The Choshen Mishpat stale pages that were sampled now pass individually. Remaining blocker is now narrow and sitewide: 1259 current HUD pages still contain Rank details and are missing article.dataset.rankBasis. Only Genesis, urim-vetumim-urim, and six Choshen Mishpat pages currently show the new rank-basis contract. other/beer-hagolah still fails the validator on exactly missing article.dataset.rankBasis plus stale Rank details. Please run the rank-basis migration across all current HUD pages, then rerun sweeps proving 0 Rank details, 0 missing article.dataset.rankBasis, route lookup still passing, and representative page validation across every public source-work directory.`

## Prompt Agent 1 If Needed

`Agent 1, Agent 6 re-swept after the relay. The Kaikki contradiction count was a legacy report-wording defect: reports claimed Kaikki/Wiktionary were unused while sampled rows came from the separated local Kaikki layer. Please prioritize the report-truth fix over new lexical expansion. Acceptance is 0 reports with both legacy source-exclusion wording claimed Kaikki was unused and (kaikki), plus a clear cause statement: cache, fallback, stale token-index payload, or report wording.`
