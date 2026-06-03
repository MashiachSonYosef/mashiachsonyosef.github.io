# Agent 4 Orot Fill Runtime Thresholds - 2026-06-03

## Scope

Agent 4 runtime/browser-proof preparation for the next Orot fill package.

No browser loop was run for this artifact. No public deploy files were edited. This report defines runtime thresholds and required evidence before Agent 4 should run a bounded Orot browser proof.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Current Routing State

Status: `thresholds_prepared_waiting_for_new_orot_package`

Agent 4 should not run a new Orot browser proof until Agent 10 provides a new local Orot package generated after Agent 2 pipeline data.

Wake condition:

- Agent 2 produces pipeline route-claim data or an approved bounded pipeline transform output.
- Agent 10 rebuilds the Orot reader hints/route package from that pipeline output.
- Rebuilt package records `final_hint_occurrences > 40073`.
- Generated package old-HUD scan total is `0`.
- Agent 10 routes the package to Agent 4 with the evidence listed below.

## Runtime Thresholds

Local browser proof thresholds for Orot:

| Metric | Pass | Warn | Block |
|---|---:|---:|---:|
| Initial cache-busted `/orot/` load event, desktop | <= 5 s | > 5 s | > 10 s, timeout, page error, or old-HUD exposure |
| Initial cache-busted `/orot/` load event, mobile viewport | <= 8 s | > 8 s | > 12 s, timeout, page error, or old-HUD exposure |
| Cold first click on sampled packaged token | <= 2 s | > 2 s | > 5 s, route panel failure, page error, or old-HUD exposure |
| Max sampled packaged-token click latency | <= 2.5 s | > 2.5 s | > 5 s, route panel failure, page error, or old-HUD exposure |
| Warm repeat click on already-fetched shard | <= 750 ms | > 750 ms | > 2 s, route panel failure, page error, or old-HUD exposure |

Live browser proof thresholds after any later deployment:

| Metric | Pass | Warn | Block |
|---|---:|---:|---:|
| Initial cache-busted live `/orot/` load event, desktop | <= 6 s | > 6 s | > 12 s, timeout, page error, CDN mismatch, or old-HUD exposure |
| Cold first click on sampled packaged token | <= 3 s | > 3 s | > 6 s, route panel failure, page error, or old-HUD exposure |
| Max sampled packaged-token click latency | <= 3.5 s | > 3.5 s | > 6 s, route panel failure, page error, or old-HUD exposure |

Agent 4 may record slower values as evidence, but any block value must return the package to Agent 10 as a runtime blocker rather than a proof candidate.

## Payload Thresholds

Reader-hints payload:

| Artifact | Pass | Warn | Block |
|---|---:|---:|---:|
| `data/public-hud/orot/reader-hints.json` | <= 8 MiB | > 8 MiB | > 12 MiB, invalid JSON, blocked-row hit, or authority/translation wording |

Route lookup shard thresholds:

| Package | Pass | Warn | Block |
|---|---:|---:|---:|
| top-50 pilot | total route payload <= 10 MiB and max shard <= 1 MiB | total route payload > 10 MiB or max shard > 1 MiB | total route payload > 25 MiB or max shard > 3 MiB |
| top-100 pilot | total route payload <= 20 MiB and max shard <= 1.5 MiB | total route payload > 20 MiB or max shard > 1.5 MiB | total route payload > 50 MiB or max shard > 4 MiB |

Top-100 is not eligible for Agent 4 browser proof until top-50 has package evidence and browser proof on the actual generated package. Full Orot route-shard publication remains blocked unless Agent 10 provides a separate payload design below these thresholds.

Required payload measurements:

- Total bytes for `reader-hints.json`.
- Total route shard bytes.
- Max route shard bytes.
- Shard count.
- Route key count.
- Card count.
- SHA-256 for manifest, reader hints, and every route shard.
- Top-N value and selected token list in the route manifest.

## Required Old-Path Probes

Agent 4 browser proof must probe Orot only, unless Agent 10 explicitly routes a broader package later.

Required local old-path probes:

- `/orot/?cachebust=<stamp>`
- `/orot/?clicked_hebrew_form=%D7%90%D7%95%D7%A8`
- `/orot/?hud=old`
- `/orot/?data-hud-renderings=1`
- `/orot/?sourceSummary=1`
- `/orot/?routeHud=old`
- `/orot/?lexicalHud=old`
- `/hud-preview/routes/?work=orot`
- `/hud-preview/routes/orot/`
- `/data/public-hud/orot/manifest.json?cachebust=<stamp>`
- `/data/public-hud/orot/reader-hints.json?cachebust=<stamp>`
- `/data/public-hud/orot/route-lookup/manifest.json?cachebust=<stamp>`

For each probe, old-HUD marker total must be `0`. A `404` is acceptable for old preview paths only if the response body also has old-HUD marker total `0` and the Orot page remains current-HUD after returning to `/orot/`.

Old-HUD marker family to scan in DOM text, DOM attributes, fetched HTML/JSON/JS/CSS, console output, and error output:

- `data-hud-renderings`
- `data-selected-gloss`
- `sourceSummary`
- `clicked_hebrew_form`
- `old HUD`
- `accepted translation`
- `Accepted translation`
- `translation output`

## Hard-Refresh Behavior

The browser proof must include both cache-busted navigation and an explicit hard-refresh style reload.

Required behavior:

- Start a local static server rooted at the generated package directory supplied by Agent 10.
- Open `/orot/?cachebust=<stamp>` with browser network cache disabled.
- Record successful fetches for the Orot HTML, runtime JS, CSS, occurrences, manifest, reader hints, route lookup manifest, and clicked route shards.
- Perform an explicit page reload with cache disabled after the first successful click.
- Re-click at least one already-proven packaged token after reload.
- Confirm route cards still render, source/license details still render, old-HUD markers remain `0`, and selected gloss leakage remains `0`.

Failure to record the reload step is a warning if all other cache-disabled evidence exists. Any old-HUD marker after reload is a blocker.

## Poisoned Query And Storage Probes

Poisoned query probes must include the old-path query strings listed above and must also include at least one combined query:

- `/orot/?clicked_hebrew_form=old&hud=old&data-hud-renderings=1&sourceSummary=1`

Poisoned storage probes must be run before a reload of `/orot/?cachebust=<stamp>`.

Required localStorage poison keys:

- `clicked_hebrew_form`
- `data-hud-renderings`
- `sourceSummary`
- `reader-workbench-v1`
- `route-hud-cache`
- `lexical-hud-state`

Required poison values must include old-HUD strings and accepted-translation strings. IndexedDB poison may be used when the harness already supports it; if omitted, Agent 4 must record that IndexedDB poisoning was not part of the proof.

Pass conditions:

- Old-HUD marker total remains `0`.
- `data-selected-gloss` count remains `0` before any intentional click and after poisoned-storage reload.
- Workbench/HUD does not display accepted-translation wording.
- Packaged-token click still resolves from `/data/public-hud/orot/route-lookup/**`, not from poisoned storage.

## Browser Proof Sample Set

Minimum local Orot sample after Agent 10 supplies a package:

- One before-click page-state probe.
- Four packaged token clicks:
  - earliest packaged occurrence on the page,
  - middle packaged occurrence,
  - latest packaged occurrence,
  - highest-frequency selected token in the package.
- One no-route or non-packaged token click if Agent 10 includes one as a negative-control selector.
- One hard-refresh reclick.
- One poisoned-query load.
- One poisoned-storage reload.

For every packaged click, record:

- token surface and normalized form,
- source ref or unit id,
- route-card count,
- answer-card count if present,
- source/license detail count,
- manifest URL requested,
- shard URL requested,
- click latency in ms,
- console error count,
- runtime exception count,
- old-HUD marker count.

## Evidence Required From Agent 10 Before Agent 4 Runs Browser Proof

Agent 10 must provide a bounded local package path and a package proof packet. Minimum required evidence:

- Local package root path, expected Orot URL path, and exact command used to serve it.
- Package proof markdown and JSON paths.
- Generated `orot/index.html` SHA-256.
- Generated `data/public-hud/orot/manifest.json` SHA-256.
- Generated `data/public-hud/orot/reader-hints.json` SHA-256 and byte size.
- Generated route lookup manifest SHA-256 and byte size.
- Per-shard SHA-256, byte sizes, route key counts, and card counts.
- Top-N selection policy and selected token list.
- Pre/post hint counts, including `final_hint_occurrences`, with proof that it is greater than `40073`.
- Machine old-HUD scan result over Orot HTML, runtime JS, CSS, reader hints, occurrences, manifest, route manifest, and route shards, with total `0`.
- Blocked-row scan over public hint and route payloads for known source-blocked rows, with total `0` or documented exclusion.
- Exact validator commands and outputs for route HUD/page safety run against the generated package.
- Statement that the package was generated from Agent 2 pipeline data, not manual definitions or accepted text.
- Non-acceptance boundary text matching this report.

Without these inputs, Agent 4 should return `blocked_waiting_for_agent10_package_evidence` and should not run browser loops.

## Agent 10 Routing Guidance

Route to Agent 4 only after the wake condition is satisfied. The first eligible proof target should be Orot top-50 or a smaller bounded pilot. Top-100 requires prior top-50 evidence. Do not route full Orot route coverage unless payload design keeps total route payload and max shard bytes below the block thresholds above.

Agent 4 output after a future proof may say only:

- browser/runtime evidence collected for the sampled Orot package,
- pass/warn/block against this Agent 4 runtime threshold artifact,
- old-HUD marker counts observed,
- payload and latency measurements observed.

Agent 4 output must not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.
