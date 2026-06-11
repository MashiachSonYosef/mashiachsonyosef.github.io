# Oracle 9 Owner Pulse - Public Surface Surveillance

Generated for heartbeat `oracler-9-owner-pulse` at `2026-06-03T10:39:17.315Z`; evidence refreshed through the public probe reporting `Last-Modified: Wed, 03 Jun 2026 10:45:11 GMT` on the live root.

Boundary: outside-owner surveillance only. This memo does not claim QA acceptance, publication readiness, routing authority, SOP authority, product authority, legal authority, or definition authority.

## Current State

Plain English: the public website is not the old stale HUD story in the checked places. The live root at [https://mashiachsonyosef.github.io/](https://mashiachsonyosef.github.io/) returned HTTP `200`, showed `11` work cards, carried current Route HUD markers, and did not show the checked old-HUD sampler markers.

The public surface is now bigger than the accepted surface. All `11/11` checked work pages returned HTTP `200`, and all `22/22` checked top-level plus route-lookup public-HUD manifests returned HTTP `200`; but `reports/agent6-validation-queue-health.md` still reports publication global status `blocked_no_render`, and newer Agent 10 dockets for Leviticus and Numbers are explicitly not Agent 6 acceptance.

The old HUD is not exposed at the checked legacy paths. [https://mashiachsonyosef.github.io/hud-preview/](https://mashiachsonyosef.github.io/hud-preview/) and [https://mashiachsonyosef.github.io/hud-preview/routes/](https://mashiachsonyosef.github.io/hud-preview/routes/) returned HTTP `404`, as did checked old dependency paths under `data/lexical` and `data/definitions/hud-route-lookup`.

The repo/control state is materially noisy. Local `main` is `67` commits behind and `131` commits ahead of `origin/main`; local HEAD is `7a6ea5eddfc03a83dc0450e282b297fddf77ad32`; live remote `origin/main` is `309d94f9e873ae3dfb4d1e62aace3f367a92ed4d`; dirty path count was `2727`.

## Methodology

- Compared this pulse against `reports/oracle9-owner-pulse-2026-06-03-0410Z.md`.
- Probed `41` unique public URLs: root, `11` work pages, shared assets, `22` public-HUD manifests, and `5` negative legacy paths.
- Checked current local git state with `git rev-parse`, `git ls-remote`, `git rev-list --left-right --count origin/main...HEAD`, and `git status --short`.
- Reviewed current control and queue reports: `reports/agent6-validation-queue-health.md`, `reports/agent7-governance-control-health.md`, `reports/agent5-control-readiness.md`, `reports/route-hud-rollout-watch.md`, `reports/agent4-state.md`, and current Agent 10/Agent 6 runtime/Orot dockets.
- No control files, source files, public pages, route data, lexical data, queues, dockets, or SOP law were changed by this inspection.

## Scope/Sections Reviewed

- Public root: [https://mashiachsonyosef.github.io/](https://mashiachsonyosef.github.io/).
- Public work pages: [Orot](https://mashiachsonyosef.github.io/orot/), [Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/), [Exodus](https://mashiachsonyosef.github.io/tanakh/exodus/), [Leviticus](https://mashiachsonyosef.github.io/tanakh/leviticus/), [Numbers](https://mashiachsonyosef.github.io/tanakh/numbers/), [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/), [Ruth](https://mashiachsonyosef.github.io/tanakh/ruth/), [Jonah](https://mashiachsonyosef.github.io/tanakh/jonah/), [Amos](https://mashiachsonyosef.github.io/tanakh/amos/), [Zechariah](https://mashiachsonyosef.github.io/tanakh/zechariah/), and [Zephaniah](https://mashiachsonyosef.github.io/tanakh/zephaniah/).
- Public assets: [reader-workbench.js](https://mashiachsonyosef.github.io/assets/js/reader-workbench.js) and [reader-workbench.css](https://mashiachsonyosef.github.io/assets/css/reader-workbench.css).
- Public data families: `data/public-hud/<work>/manifest.json` and `data/public-hud/<work>/route-lookup/manifest.json` for all `11` work cards.
- Negative legacy paths: [hud-preview](https://mashiachsonyosef.github.io/hud-preview/), [hud-preview/routes](https://mashiachsonyosef.github.io/hud-preview/routes/), [old Deuteronomy lexical manifest](https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json), [old Deuteronomy occurrences](https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json), and [old route lookup manifest](https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json).
- Local reports: `reports/agent7-orot-public-burden-and-11-card-owner-line-2026-06-03.md`, `reports/agent10-live-public-old-hud-guard-2026-06-03-post-numbers-runtime-docket.md`, `reports/agent10-multi-lane-reader-surface-release-train-2026-06-03.md`, `reports/agent10-agent6-ready-leviticus-runtime-review-docket-2026-06-03.md`, `reports/agent10-agent6-ready-numbers-runtime-review-docket-2026-06-03.md`, `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`, and `reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-03.md`.

## Material Changes Since Last Pulse

- Live root freshness changed from `Last-Modified: Wed, 03 Jun 2026 03:49:11 GMT` in `reports/oracle9-owner-pulse-2026-06-03-0410Z.md` to `Last-Modified: Wed, 03 Jun 2026 10:45:11 GMT` in the current public probe.
- Live remote changed from `origin/main` `21826ab06cf5dbe9f85cc347e8dc77fb8f8dfa90` in the prior pulse to `309d94f9e873ae3dfb4d1e62aace3f367a92ed4d`.
- Local HEAD changed from `28dfb9ee...` in the prior pulse to `7a6ea5eddfc03a83dc0450e282b297fddf77ad32`.
- Repo divergence widened from `21` behind / `119` ahead to `67` behind / `131` ahead; dirty paths widened from `2611` to `2727`.
- Orot top-level manifest wording is no longer the stale narrow wording called out in the prior pulse: [Orot manifest](https://mashiachsonyosef.github.io/data/public-hud/orot/manifest.json) now reports `route_scope: sentinel_chunk_plus_reader_hints_plus_bounded_top10000_cap3_route_lookup`.
- Orot route package increased from the prior pulse counts of `8716` selected tokens, `9490` public route keys, `3182` shards, `23496` route cards, and `49245496` shard bytes to `8729` selected tokens, `9494` public route keys, `3184` shards, `23506` route cards, and `49259581` shard bytes.
- Agent 7 has already created a replacement owner line in `reports/agent7-orot-public-burden-and-11-card-owner-line-2026-06-03.md`; that line is directionally right but should now separate public freshness from acceptance state.
- Agent 6 has a new exact Exodus WARN acceptance in `reports/agent6-exodus-candidate-page-3-verdict-2026-06-03.md`; Leviticus and Numbers have Agent 10 Agent6-ready dockets, but those dockets explicitly are not acceptance.
- Orot fill remains blocked for review intake by `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`; the Agent 2 zero-safe pilot in `reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-03.md` emitted `0` answer rows.

## Evidence Links

| Fact | Evidence path/link | True now | Reception implication | What must not be accepted |
| --- | --- | --- | --- | --- |
| Public root is fresh and current-HUD, not stale old HUD, in checked probe. | [root](https://mashiachsonyosef.github.io/) | HTTP `200`; `Last-Modified: Wed, 03 Jun 2026 10:45:11 GMT`; `11` cards; current markers present; old sampler markers absent. | Owner line should retire `public artifact stale` as the lead claim. | Do not convert freshness into QA, publication, or content acceptance. |
| Checked public pages are all reachable. | The `11` public work page URLs listed above. | `11/11` pages returned HTTP `200`; each checked page had current Route HUD markers and no hard old-HUD marker hit. | A normal viewer can see a live product-shaped reader surface. | Do not say all live pages are Agent 6 accepted. |
| Public route package burden is large. | `data/public-hud/<work>/route-lookup/manifest.json` across all `11` works. | Aggregate: `32576` selected tokens, `23585` public route keys, `11883` shards, `62837` route cards, `124287766` shard bytes. | Public site is not merely a tiny placeholder; reception risk is scale plus ambiguity. | Do not call route volume semantic truth or accepted translation text. |
| Orot is the largest visible burden. | [Orot route manifest](https://mashiachsonyosef.github.io/data/public-hud/orot/route-lookup/manifest.json) and `reports/agent7-orot-public-burden-and-11-card-owner-line-2026-06-03.md`. | `8729` selected tokens, `9494` public route keys, `3184` shards, `23506` route cards, `49259581` shard bytes, `0` denied lexicon entries. | Orot should be handled as a separate public reception burden, not buried under the ten-surface cadence. | Do not accept Orot fill, Orot answers, or Orot definition readiness. |
| Old HUD preview/dependency paths are absent in checked locations. | [hud-preview](https://mashiachsonyosef.github.io/hud-preview/), [hud-preview/routes](https://mashiachsonyosef.github.io/hud-preview/routes/), checked old `data/lexical` and `data/definitions` URLs. | `5/5` negative legacy URLs returned HTTP `404`. | The old-HUD exposure concern should be downgraded to guarded monitoring, not the main stale artifact headline. | Do not claim global absence for every possible old path without a complete crawler. |
| Publication remains blocked. | `reports/agent6-validation-queue-health.md`. | Status passed, `36` items, `0` issues, `0` warnings, publication global status `blocked_no_render`. | Governance still says do not treat live public as cleared publication. | Do not let live/public replace Agent 6 gatekeeping. |
| Local repo is not synchronized with live public. | Git commands: `git rev-list --left-right --count origin/main...HEAD`, `git ls-remote origin refs/heads/main`, `git status --short`. | `67` behind / `131` ahead; dirty paths `2727`; local HEAD `7a6ea5e`; live remote `309d94f`. | Agents can be seeing different truths unless each claim names its evidence surface. | Do not summarize repo state without saying local, origin, or public. |
| Leviticus and Numbers are ready-for-Agent6, not accepted. | `reports/agent10-agent6-ready-leviticus-runtime-review-docket-2026-06-03.md`; `reports/agent10-agent6-ready-numbers-runtime-review-docket-2026-06-03.md`. | Both dockets report live/current evidence and explicit `not accepted` boundaries. | Owner language should split visible surface from accepted surface. | Do not label them pass, accepted, or publication-ready. |
| Orot answer fulfillment is blocked. | `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`; `reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-03.md`. | Remaining Orot gap: `8578` tokens / `19733` occurrences; pilot emitted `0` answer rows. | Orot is public as route evidence, not fulfilled as accepted answer delivery. | Do not create manual definitions or flip evidence rows into answer rows. |

## Product/Fulfillment Read

If the order was "do not show the old HUD when the owner opens the site," the checked public surface is materially improved: root is current, `11` cards are visible, old HUD preview paths are `404`, and hard old-HUD markers were `0` in the current guard reports.

If the order was "deliver accepted reader surfaces," fulfillment is only partial. Exodus has a new exact Agent 6 WARN acceptance report, while Deuteronomy and Genesis remain exact WARN-bound surfaces per current owner-line reports. Leviticus and Numbers are queued as Agent6-ready evidence, not accepted. Orot is public and large, but the evidence pipeline currently emits `0` accepted answer rows.

If the order was "make a calm system the user can trust without decoding agents," fulfillment is weak. The public site is refreshed, but the local repo is `67` behind / `131` ahead with `2727` dirty paths, publication is still `blocked_no_render`, and multiple agents are producing evidence packets that need one owner-facing accepted-vs-visible scoreboard.

## Risks/Blockers

- Public-reception overclaim risk: a viewer sees an `11`-card live reader, but Agent 6 acceptance is narrower than the visible public surface.
- Orot scale risk: Orot alone exposes `23506` route cards and `49259581` shard bytes while Orot answer fill remains blocked.
- Control drift risk: local HEAD, origin/main, and live public must be named separately because they are not the same surface.
- Acceptance drift risk: Leviticus/Numbers dockets and Orot packets are easy to misread as acceptance unless every summary says `not accepted`.
- Old-HUD residual risk: checked hard markers are `0`, but `reports/agent10-live-public-old-hud-guard-2026-06-03-post-numbers-runtime-docket.md` still records `1` watch-marker hit in the shared runtime asset; treat this as monitor-only unless a browser/runtime review says otherwise.

## Plain-English Translation

The website is not stale in the way it was. It is live, refreshed, and bigger.

The problem has moved: the public product surface is ahead of the accepted-control story. The right owner sentence is no longer "repo hidden, public artifact stale." It is "public site current, old HUD checked absent, visible surface wider than accepted surface, publication still blocked."

The team is fulfilling the visibility/order-delivery side better than before. It is not yet fulfilling the clean acceptance/definition/answer-delivery side, especially for Orot.

## Suggestions To Agent 7

- Use a split owner line: `Public site refreshed at 10:45Z with 11-card current Route HUD; checked old-HUD paths are 404; publication remains blocked_no_render; visible public surface is wider than Agent 6 accepted surface.`
- Keep Orot as its own public burden line: `Orot is live as a large route-evidence surface, but Orot answer fill is blocked and the zero-safe pilot emitted 0 answer rows.`
- Ask Agent 6 for a one-table accepted-vs-visible scoreboard covering all `11` public work cards.
- Keep Leviticus and Numbers language as `Agent6-ready dockets, not accepted`.
- Do not let any agent reuse `public artifact stale` as the current lead unless a new public probe contradicts the `10:45Z` evidence.

## Decision Needed From User

- Decide whether the public owner line should prioritize "the old HUD problem is fixed in checked paths" or "visible product is ahead of acceptance." Both are true, but they steer Agent 7 differently.
- Decide whether Orot should remain publicly visible as route evidence while Agent 6 waits for a minimum fill evidence packet, or whether Agent 7 should prepare a reduction/hide option for owner review.
- Decide whether Oracle 9 should keep sending daily owner pulses only on material drift, with Agent 7 receiving suggestions but not acting as Oracle 9 manager.
