# Agent 10 Orot Stage A Reader Hints Proof - 2026-06-03

## Scope

Release-owner proof for Orot Stage A: expand pre-click inline reader hints using pipeline-generated route data only.

This packet does not claim QA acceptance, validated runtime acceptance, source/provenance custody acceptance, publication readiness, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

## Pipeline Command Added

Added pipeline command:

```powershell
node scripts\build_public_hud_reader_hints.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --report reports\agent10-orot-stage-a-reader-hints-proof-2026-06-03.json
```

The command preserves existing public hints, adds only source-clean lookup-candidate route answers, and writes a machine-readable denylist proof report.

## Public Artifact Changed

- `data/public-hud/orot/reader-hints.json`

No Orot HTML, route shard, source custody, or definition source file was changed in this Stage A packet.

## Coverage Result

| Metric | Before | Added | After |
|---|---:|---:|---:|
| hinted token IDs | 5,720 | 3,002 | 8,722 |
| hinted occurrences | 33,151 | 6,847 | 39,998 |

Orot total remains:

- token occurrences: 59,806
- unique token IDs: 17,307

## Payload Result

- output bytes: 6,049,122
- output SHA-256: `96df95b7f5db162e44a7bc8fafcfda0c137e82d1110c261154a7975219529a83`
- Agent 4 Stage A pass target: at or below 8 MiB
- Result: below threshold

## Source-Row Denylist Proof

Agent 1 blocked these exact curated rows:

- `lex-aph-h639`
- `lex-mashiach-h4899`
- `lex-ruach-h7307`
- `lex-yhwh-h3068`

Generated public `reader-hints.json` scan:

- denied lexicon entry string hits: 0
- denied `curated|...|source metadata incomplete` string hits: 0
- selected route card dependency hits: 0
- newly skipped denied-token candidates: 13 token IDs / 115 occurrences

The build report also records 6 already-live existing public hint token IDs whose lexical token rows map to the denied entries. Those existing hints were preserved rather than reclassified; their public hint rows do not contain the denied strings. Agent 10 does not treat this as Agent 1 source custody acceptance.

Machine report:

- `reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json`

## Static Validation

Passed:

- `node --check scripts\build_public_hud_reader_hints.mjs`
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`
- `node C:\Users\owner\Documents\translations\scripts\validate_route_answer_safety.mjs`
- Orot public reader-hint structural check: 8,722 rows, missing required row fields 0, accepted-status mismatches 0
- Orot route lookup package check: 1 shard, 47 route cards, no missing public shard path
- Blocked-row scan over `data/public-hud/orot/reader-hints.json`: 0 hits
- Old-HUD marker scan over Orot page, Orot public-HUD data, shared runtime JS, and CSS: 0 hits

Not used as acceptance:

- `validate_public_hud_route_lookup.mjs --skip-release-stamp` expects the old `data/definitions/hud-route-lookup-sample.json` layout and is not the right validator for the sparse Orot public-HUD package.

## Headless Chrome Proof

Local artifact served from `http://127.0.0.1:60445`.

Root:

- old-HUD markers: 0

Orot normal load:

- token buttons: 59,774
- rendered inline hint nodes: 39,980
- selected gloss nodes: 0
- old-HUD markers: 0
- new sample hint observed: `60% world:`

Orot old-query load:

- query: `?hud=old&clicked_hebrew_form=1&data-hud-renderings=1&sourceSummary=1`
- token buttons: 59,774
- rendered inline hint nodes: 39,980
- selected gloss nodes: 0
- old-HUD markers: 0

## Remaining Boundaries

- Click-time Orot route HUD coverage remains the single sentinel shard from the prior Orot flagship packet.
- Stage B top-50 route shards are the next bounded path.
- Top-100/top-250 route shards remain blocked until top-50 passes runtime proof.
- Full Orot click-time route-shard publication remains blocked on payload grounds.
- The four Agent 1 curated source rows remain source-row blockers for any new batch depending on them.

## Highest Claim

Orot Stage A public reader hints are generated locally from pipeline route data with source-row denylist proof and old-HUD exposure 0 in bounded static/headless checks.

## Not Accepted

- QA acceptance
- Validated public/runtime acceptance
- Publication readiness
- Source/provenance custody acceptance
- Source publication
- Source-file tracking approval
- CDN/cache closure
- Broad rollout
- Product/data acceptance
- Route publication support
- Definition authority
- Usage-as-definition authority
- Translation output
- Accepted translation text
