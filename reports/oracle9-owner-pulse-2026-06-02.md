# Oracle 9 Owner Pulse - 2026-06-02

Status: outside-owner surveillance memo only.  
Authority: no QA acceptance, no publication clearance, no routing authority, no SOP authority, no legal authority, no accepted translation text.

## Current State

Plain English first: the team is producing useful control and reception paperwork, but the public website is still not fulfilling the current intended runtime order.

- Public site is still serving the May 30 GitHub Pages artifact. Evidence: live [root](https://mashiachsonyosef.github.io/), live [HUD preview](https://mashiachsonyosef.github.io/hud-preview/), live [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/), and live [Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/) all returned `Last-Modified: Sat, 30 May 2026`.
- HUD preview remains split: raw GitHub is quarantined, live Pages is stale. Evidence: raw [hud-preview/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/index.html) versus live [hud-preview](https://mashiachsonyosef.github.io/hud-preview/).
- Deuteronomy remains a separate delivery blocker. Evidence: `reports/agent6-live-deuteronomy-delivery-blocker-verdict-2026-06-02.md`, `reports/agent6-owner-route-decision-request-2026-06-02.md`, and live [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/).
- Publication remains globally blocked. Evidence: `data/control/agent6_validation_queue.json`, `data/control/pipeline_state.json`, `data/control/agent7_pulse_state.json`, and `reports/agent6-validation-queue-health.md`.
- The local repo is not deploy-clean. Evidence from this pulse: branch `main`, local HEAD `0086adfb8c5e3b65bc37931fac7b905071b89058`, `origin/main` `2a7b6c054c038b27d39b5b244cfb7ec7114bfcd6`, divergence `1 behind / 67 ahead`, and `2190` dirty paths.

## Methodology

- Probed 10 public URLs with no-cache headers: root, HUD preview, HUD route preview, Deuteronomy, Genesis, and 5 Reader Workbench runtime/data dependencies.
- Queried GitHub Pages API through the local Git credential for Pages source/build state.
- Checked local git branch, HEAD, `origin/main`, divergence, dirty-path count, and selected dirty files.
- Checked current control JSON for Agent 6 queue state, pipeline state, and Agent 7 pulse state.
- Read newest relevant reports from Agent 6, Agent 7, Agent 5, Agent 11, and prior Oracle 9 packets.
- Recomputed public-ish tracked size from `origin/main` excluding `data/`, `reports/`, `scripts/`, hidden temp/cache, and workflow folders.

## Scope/Sections Reviewed

- Public Pages URLs: [root](https://mashiachsonyosef.github.io/), [HUD preview](https://mashiachsonyosef.github.io/hud-preview/), [HUD routes](https://mashiachsonyosef.github.io/hud-preview/routes/), [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/), [Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/).
- Missing live dependencies: [reader-workbench.js](https://mashiachsonyosef.github.io/assets/js/reader-workbench.js), [reader-workbench.css](https://mashiachsonyosef.github.io/assets/css/reader-workbench.css), [Deuteronomy manifest](https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json), [Deuteronomy occurrences](https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json), [route lookup manifest](https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json).
- Local reports: `reports/agent6-validation-queue-health.md`, `reports/agent6-owner-route-decision-request-2026-06-02.md`, `reports/agent6-live-deuteronomy-delivery-blocker-verdict-2026-06-02.md`, `reports/agent11-public-surface-reception-risk-register-2026-06-02.md`, `reports/agent11-reception-boundary-validation-2026-06-02.md`, `reports/agent5-control-readiness.md`, `reports/agent7-governance-control-health.md`.
- Control files: `data/control/agent6_validation_queue.json`, `data/control/pipeline_state.json`, `data/control/agent7_pulse_state.json`.

## Material Changes Since Last Pulse

- Agent 11 has become more useful as a reception boundary layer. Evidence: `reports/agent11-reception-boundary-validation-2026-06-02.md` passed with `18` files checked, `16` required Agent 11 files, `2/2` optional Oracle files present, `0` issues, `0` warnings.
- Agent 11 accepted the split public-surface wording. Evidence: `reports/agent11-public-surface-reception-risk-register-2026-06-02.md` and `reports/agent11-oracle9-public-surface-followup-intake-2026-06-02.md`.
- Agent 6 queue intake hygiene is clean but not publication clearance. Evidence: `reports/agent6-validation-queue-health.md` passed with `0` issues and `0` warnings; current `data/control/agent6_validation_queue.json` now contains `20` queue items and `publication_global_status: blocked_no_render`.
- Agent 5 control readiness passed, but with 3 warnings. Evidence: `reports/agent5-control-readiness.md` warns on route release gate, workbench handoff authority drift, and stale HUD contract tooling.
- Agent 7 governance control health passed, but with 1 warning. Evidence: `reports/agent7-governance-control-health.md` warns that legacy handoff-index authority must not override the current public handoff index.
- Local repo drift increased from the earlier Deuteronomy blocker reports. Evidence: current divergence is `1 behind / 67 ahead`, while `reports/agent6-owner-route-decision-request-2026-06-02.md` recorded `1 behind / 53 ahead`.

## Evidence Links

| question | current evidence |
|---|---|
| Is HUD preview hidden live? | No. Live [hud-preview](https://mashiachsonyosef.github.io/hud-preview/) is `HUD Sampler`, no `data-public-runtime-quarantine`; raw [hud-preview/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/index.html) is quarantined. |
| Is route preview hidden live? | No live proof. Live [hud-preview/routes](https://mashiachsonyosef.github.io/hud-preview/routes/) is HTTP 404; raw [hud-preview/routes/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/routes/index.html) is quarantined. |
| Is Deuteronomy delivered? | No. Live [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/) has `Clicked Hebrew form=true`, `lexical-hud=true`, `Route HUD=false`, `reader-workbench.js=false`, `data-hud-runtime-contract=false`. |
| Are runtime dependencies live? | No. The 5 checked Reader Workbench runtime/data dependencies all returned HTTP 404. |
| What is Pages doing? | Pages is legacy source `main:/`; latest build for `2a7b6c0` remains `building` with `updated_at: 2026-06-02T00:47:28Z`. |
| Is repo clean enough for blind deploy? | No. Current checkout is `1 behind / 67 ahead` with `2190` dirty paths. |
| Is the public artifact likely too large? | Public-ish `origin/main` files counted here: `5073` files, `2158.33 MiB`; HTML alone: `1343` files, `1766.53 MiB`. GitHub Docs state Pages sites may be no larger than `1 GB` and deployments timeout after `10 minutes`: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). |

## Product/Fulfillment Read

The team is fulfilling control, boundary, and reception paperwork. It is not yet fulfilling the public product order.

Numbers:

- `20` current Agent 6 queue items in `data/control/agent6_validation_queue.json`.
- `0` public Reader Workbench dependencies live out of the 5 checked required Deuteronomy dependencies.
- `2` separate live-surface lines now required by Agent 11: `repo hidden, public artifact stale` and `live Deuteronomy delivery route blocked; owner route required`.
- `1` live public artifact source problem: GitHub Pages is still serving the May 30 artifact while raw GitHub is at the quarantine commit.
- `2190` dirty paths in the local checkout, which makes direct broad deployment unsafe without owner-approved route selection.

## Risks/Blockers

- Public reception risk: readers still see old HUD behavior at [HUD preview](https://mashiachsonyosef.github.io/hud-preview/) and old-HUD Deuteronomy at [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/).
- Deployment route risk: direct push from current local `main` is not bounded; Agent 6 already framed owner route selection as required in `reports/agent6-owner-route-decision-request-2026-06-02.md`.
- Hosting shape risk: even a cleaned public-ish site is over `2 GiB`, while GitHub Pages published sites are documented at `1 GB` limit and `10 minute` deployment timeout. Evidence: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) plus local `origin/main` size computation.
- Authority drift risk: reports are increasingly good at saying what they are not, but the live site can still make the user believe product delivery happened when it did not.
- Definition reception risk: Agent 11 is correctly preserving `route evidence, not accepted definition`; no public wording should claim settled meaning for `goy`, `yehudi`, `yisrael`, `am/amim`, `tzion`, `berit`, `mashiach`, `ivri`, `ger`, `nochri`, or `zar`.

## Plain-English Translation

The agents are getting better at paperwork and boundaries. The website is still old.

The most important distinction is:

- Repo/raw GitHub says the HUD preview is hidden.
- The public website still shows the old HUD preview.
- Deuteronomy is a different blocker: it needs a chosen delivery route before it can be swapped live.
- GitHub Pages is probably the wrong publication shape for the full current artifact because the public-ish site is more than twice the documented Pages size limit.

## Suggestions To Agent 7

- Stop treating additional proof-loop reports as progress on live delivery unless they change owner route, live URLs, or dependency status.
- Ask the owner for one delivery route, matching Agent 6's options in `reports/agent6-owner-route-decision-request-2026-06-02.md`.
- Separate the site problem into three lanes: HUD preview stale artifact, Deuteronomy P0 delivery, and broader Genesis/public-runtime drift.
- Treat GitHub Pages legacy branch deploy as suspect until the site is either reduced below the documented Pages limits or moved to a selected-artifact deployment/host.
- Keep Agent 11's reception lines visible to the user: `repo hidden, public artifact stale`, `live Deuteronomy delivery route blocked; owner route required`, `publication remains blocked_no_render`.

## Decision Needed From User

Choose the publication route before asking for more live proof.

Recommended owner decision:

1. Authorize a selected-artifact deployment path for the bounded Deuteronomy P0 set first.
2. Do not deploy the dirty divergent `main`.
3. Decide whether the full source workbench should stay on GitHub Pages after the live artifact is reshaped below `1 GB`, or move to a host built for multi-GB static corpus pages.

This memo does not approve any route. It only says which decision is now blocking fulfillment.
