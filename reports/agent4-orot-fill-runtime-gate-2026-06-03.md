# Agent 4 Orot Fill Runtime Gate - 2026-06-03

## Scope

Agent 4 runtime/payload gate for Orot Stage A expanded inline reader hints and Stage B bounded top-N route shards.

This report does not claim QA acceptance, public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Status

Status: `warn_runtime_gate_defined`

Agent 10 should not publish a full Orot click-time route package on runtime grounds. Agent 10 may continue toward Stage A and Stage B top-50 only if the gates below pass on the actual generated package.

Top-100 and top-250 are blocked until top-50 has browser/runtime proof. Full click-time Orot shards remain blocked on payload grounds because Agent 10 estimates `398.23 MiB` exact-key filtered and `488.20 MiB` lookup-candidate filtered.

## Inputs

- Agent 10 plan: `reports/agent10-orot-fill-expansion-plan-2026-06-03.md`
- Agent 1 source-row blocker: `reports/agent1-orot-fill-source-row-evidence-2026-06-03.md`
- Live Orot URL: `https://mashiachsonyosef.github.io/orot/`
- Current old-HUD target: `0`

Agent 1 status is `block` for four exact curated source rows:

- `curated|lex-aph-h639|source metadata incomplete`
- `curated|lex-mashiach-h4899|source metadata incomplete`
- `curated|lex-ruach-h7307|source metadata incomplete`
- `curated|lex-yhwh-h3068|source metadata incomplete`

Agent 4 does not clear those rows. Stage A runtime proof must include a source-row blocker filter proof before any expanded hint payload can be treated as runtime-gate eligible.

## Current Evidence

Existing validators run against the current checkout:

- `node scripts/validate_route_hud_page.mjs --page orot/index.html`: pass
- `node scripts/validate_public_hud_route_lookup.mjs --skip-release-stamp`: pass
- `node scripts/validate_route_answer_safety.mjs`: pass

Current live HTTP evidence, cache-busted where applicable:

| Surface | Status | Bytes | Old markers |
|---|---:|---:|---:|
| `/` | 200 | 3,790 | 0 |
| `/orot/` | 200 | 1,270,631 | 0 |
| `/assets/js/reader-workbench.js` | 200 | 64,464 | 0 |
| `/assets/css/reader-workbench.css` | 200 | 3,538 | 0 |
| `/data/public-hud/orot/occurrences.json` | 200 | 1,261,481 | 0 |
| `/data/public-hud/orot/manifest.json` | 200 | 453 | 0 |
| `/data/public-hud/orot/reader-hints.json` | 200 | 3,724,856 | 0 |
| `/data/public-hud/orot/route-lookup/manifest.json` | 200 | 740 | 0 |
| `/hud-preview/routes/` | 404 | 1,409 | 0 |
| `/ari/pri-etz-chaim/` | 404 | 1,409 | 0 |

Current live Orot reader-hints artifact:

- `hints`: 5,720 token IDs
- `hint_policy`: `reader_hint_not_translation_not_definition_authority`
- First-row shape includes `source_id`, `source_url`, `license`, `license_url`, `candidate_status`, `basis`, `route_card_id`, `status`
- Blocked-row string scan for the four Agent 1 curated blocker IDs: 0 hits in current live `reader-hints.json`

Current live Orot route package:

- Manifest strategy: bounded one-shard public route lookup for Orot sentinel proof
- `distinct_normalized_tokens`: 1
- `shard_count`: 1
- `card_count`: 47
- Shard `shards/05d0-05e8-05e6.json`: manifest byte length 119,758; live fetch 119,759 bytes; status 200

Headless Chrome runtime baseline:

- Cache-busted Orot load: navigation/load event about 990 ms in observed run
- Old query params on Orot and Deuteronomy: old marker total 0
- Poisoned localStorage/IndexedDB reload on Orot: old marker total 0; `data-selected-gloss` count 0
- Sentinel Orot token click: 47 route cards, 1 answer card, Sources and licenses present, old markers absent
- Multiple route-shard sentinel clicks beyond the single packaged shard were not proven; current live package only contains one Orot route shard

## Stage A Gate - Expanded Inline Reader Hints

Stage A may proceed to runtime proof only after the generated package includes source-row blocker filter proof.

Required Stage A package checks:

- `reader-hints.json` parses as JSON and has `work_id: "orot"`.
- Every row remains marked as reader-hint/candidate evidence, not accepted text. Required row values: `candidate_status: "candidate_not_authority"` and `status: "reader_hint_not_translation"` or stricter equivalent.
- Every row used for public hints has non-empty `source_id`, `source_url`, `license`, and `license_url`.
- Machine scan of the generated `reader-hints.json` returns zero hits for:
  - `lex-aph-h639`
  - `lex-mashiach-h4899`
  - `lex-ruach-h7307`
  - `lex-yhwh-h3068`
  - the four `curated|...|source metadata incomplete` strings above
- The generated report records pre/post counts: token IDs, occurrence coverage, bytes, SHA-256, and blocked-row exclusion count.
- `node scripts/validate_route_answer_safety.mjs` passes after generation.
- Old-HUD marker scan over Orot page, runtime JS, CSS, reader hints, manifest, and old query-param load returns 0.

Stage A browser checks:

- Root `/` loads and links Orot without old-HUD markers.
- `/orot/?cachebust=...` loads with no console/page errors and no old-HUD markers.
- Reader hints become visible inline before any HUD click.
- Workbench/HUD remains hidden before click.
- `data-selected-gloss` remains absent before click and after poisoned-storage reload.
- Hard refresh with cache disabled fetches current Orot page, runtime JS/CSS, occurrences, manifest, and reader hints.
- Old query params such as `clicked_hebrew_form`, `hud=old`, `data-hud-renderings`, and `sourceSummary` do not expose old HUD text or attributes.
- Poisoned localStorage and IndexedDB payloads containing old-HUD strings do not create old-HUD DOM, accepted-translation wording, or selected glosses.

Stage A payload thresholds:

- Pass target: reader-hints JSON at or below `8 MiB`, no browser errors, Orot load event at or below `5 s` desktop and `8 s` mobile on a cache-busted load.
- Warn: reader-hints JSON above `8 MiB`, or load/click evidence incomplete.
- Block: reader-hints JSON above `12 MiB`, parse/load failure, old-HUD exposure, accepted-translation wording, selected-gloss leakage, missing source-row blocker filter proof, or any blocked curated row in the public hint payload.

## Stage B Gate - Bounded Top-N Route Shards

Full Orot route shard publication is blocked on payload grounds. Stage B must start with top-50.

Required Stage B package checks:

- Route manifest loads only from `/data/public-hud/orot/**`.
- Manifest records top-N value, token list, shard count, card count, total shard bytes, max shard bytes, SHA-256 per shard, and generated timestamp.
- Non-packaged tokens may show blank/no-route HUD behavior; packaged top-N tokens must show route cards.
- Sampled packaged tokens include early/middle/late page positions and at least one high-frequency token from Agent 10's candidate list when present.
- For each sampled packaged token: visible route cards render, at least one answer card renders when available, Sources and licenses render, and old-HUD markers remain 0.
- Old paths and old query params remain current-HUD/no-old-HUD.
- Poisoned localStorage/IndexedDB remains no-old-HUD and no accepted-translation wording.

Stage B payload thresholds:

| Package | May run when | Warn if | Block if |
|---|---|---|---|
| top-50 | first Stage B proof target | total route payload > 10 MiB, any shard > 1 MiB, cold click > 5 s | total route payload > 25 MiB, any shard > 3 MiB, click > 10 s, page errors, old-HUD exposure |
| top-100 | only after top-50 pass | total route payload > 20 MiB, any shard > 1.5 MiB, cold click > 5 s | total route payload > 50 MiB, any shard > 4 MiB, click > 10 s, page errors, old-HUD exposure |
| top-250 | only after top-100 pass | total route payload > 50 MiB, any shard > 2 MiB, cold click > 5 s | total route payload > 125 MiB, any shard > 5 MiB, click > 10 s, page errors, old-HUD exposure |

Top-N escalation rule:

- Do not move from top-50 to top-100 until top-50 passes package checks, browser checks, and old-HUD/storage/query probes.
- Do not move from top-100 to top-250 until top-100 passes the same checks.
- Do not publish the full `398.23 MiB` to `488.20 MiB` package without a separate payload design.

## Exact Blockers And Warnings

Blocker for Stage A execution: no expanded Stage A artifact may pass this runtime gate unless it includes machine-readable source-row blocker filter proof excluding the four Agent 1-blocked curated rows.

Blocker for Stage B broad expansion: top-100 and top-250 are not eligible until top-50 has runtime proof on the actual generated package.

Payload blocker: full click-time route coverage is blocked on runtime/payload grounds at the current `398.23 MiB` to `488.20 MiB` estimate.

Warning: current local checkout does not contain `data/public-hud/orot/reader-hints.json` or `data/public-hud/orot/route-lookup/manifest.json`, while the live site serves those paths. Any pre-deploy gate must run against the generated local public package, not only the live artifact.

Warning: current live browser proof covers the existing one-shard sentinel package. It does not prove top-50/top-100/top-250 behavior.

## Agent 10 Halt Guidance

Do not halt Stage A on runtime grounds if the source-row blocker filter proof, payload thresholds, old-HUD probes, and browser proof all pass on the generated package.

Do halt any Stage A deploy on this gate if the filter proof is absent or any blocked curated row appears in public hint payload.

Do not halt Stage B top-50 on runtime grounds before a package exists; build it only as a bounded proof target.

Do halt Stage B top-100/top-250 until top-50 proof exists.

Do halt full Orot route-shard publication on runtime/payload grounds.
