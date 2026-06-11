# Agent 10 Assistant Orot Stage A Preflight

Generated: 2026-06-02T22:27:00-04:00
Agent lane: Agent 10 assistant / auxiliary Orot fill support
Workspace: `C:\Users\owner\Documents\translations`

## Status

Evidence-ready staged-preflight update, blocked for shipment/publication use until the reader-hint export command is surfaced or added with a reproducible dry-run denylist proof.

This packet does not claim QA acceptance, source/provenance custody, source/provenance acceptance, source publication, source-file tracking approval, public/runtime acceptance, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Inputs Checked

- `reports/agent10-orot-fill-expansion-plan-2026-06-03.md`
- `reports/agent2-orot-definition-fill-plan-2026-06-03.md`
- `reports/agent1-orot-fill-source-row-evidence-2026-06-03.md`
- `.codex-tmp/hud-deploy-live/data/public-hud/orot/reader-hints.json`
- `.codex-tmp/hud-deploy-live/data/public-hud/orot/occurrences.json`
- `.codex-tmp/hud-deploy-live/data/public-hud/orot/manifest.json`
- `origin/main:data/public-hud/orot/**`
- `scripts/`

## Source-Of-Truth Split

- Local working-tree path `data/public-hud/orot` is missing.
- `origin/main` contains the bounded Orot package:
  - `data/public-hud/orot/chunks/orot-001.json`
  - `data/public-hud/orot/manifest.json`
  - `data/public-hud/orot/occurrences.json`
  - `data/public-hud/orot/reader-hints.json`
  - `data/public-hud/orot/route-lookup/manifest.json`
  - `data/public-hud/orot/route-lookup/shards/05d0-05e8-05e6.json`
- `.codex-tmp/hud-deploy-live/data/public-hud/orot` contains a staged/live-deploy-copy Orot package with the same bounded file shape.

Interpretation: Agent 10 assistant must not treat the local working tree as the Orot public-HUD source of truth. Stage A evidence below is from `.codex-tmp/hud-deploy-live`, not from a committed local `data/public-hud/orot` directory.

## Staged Reader-Hint Evidence

Parsed file: `.codex-tmp/hud-deploy-live/data/public-hud/orot/reader-hints.json`.

- `generated_at`: `2026-06-03T02:14:42.545Z`
- `hint_policy`: `reader_hint_not_translation_not_definition_authority`
- `basis`: `existing_public_hints_plus_source_clean_lookup_candidate_current_route_answer_candidate`
- occurrence token count: `59,806`
- unique token ID count: `17,307`
- existing hint count: `5,720`
- added hint count: `3,002`
- final hint count: `8,722`
- existing hint occurrences: `33,151`
- added hint occurrences: `6,847`
- final hint occurrences: `39,998`

Status/basis scan of staged hints:

- `reader_hint_not_translation`: `8,722`
- `current_route_candidate`: `5,720`
- `lookup_candidate_current_route_answer_candidate`: `3,002`

Interpretation: this is a partial Stage A-style expansion over the current 5,720 public reader hints, but it is below Agent 10/Agent 2's previously measured lookup-candidate ceiling of `10,704` token IDs / `45,687` occurrences. It is staged reader-hint evidence only, not accepted text or runtime acceptance.

## Agent 1 Denylist Scan

Agent 1 blocker rows from `reports/agent1-orot-fill-source-row-evidence-2026-06-03.md`:

- `curated|lex-aph-h639|source metadata incomplete`
- `curated|lex-mashiach-h4899|source metadata incomplete`
- `curated|lex-ruach-h7307|source metadata incomplete`
- `curated|lex-yhwh-h3068|source metadata incomplete`

Targeted scan result for `.codex-tmp/hud-deploy-live/data/public-hud/orot`:

- `lex-aph-h639`: `0`
- `lex-mashiach-h4899`: `0`
- `lex-ruach-h7307`: `0`
- `lex-yhwh-h3068`: `0`
- `curated|lex-aph-h639`: `0`
- `curated|lex-mashiach-h4899`: `0`
- `curated|lex-ruach-h7307`: `0`
- `curated|lex-yhwh-h3068`: `0`

Interpretation: the staged Orot public-HUD package currently has zero direct string hits for the four Agent 1-blocked IDs/row prefixes. This supports a denylist-clean staged package claim only. It does not clear Agent 1 source/provenance custody, does not approve source mapping, and does not prove the export can be reproduced.

## Reproducibility Blocker

Script inventory command:

```powershell
rg --files scripts | rg "(reader|hint|public_hud|hud|route_lookup|route-answer|answer_safety)"
```

Relevant scripts found are validators/builders for route lookup, route store, route release, route HUD page validation, and route-HUD audits. No committed reader-hint export command was identified in `scripts/` that can regenerate Orot Stage A hints with:

- lookup-candidate behavior,
- Agent 1 denylist filtering,
- before/after counts,
- `blocked_source_row_hits = 0`,
- dry-run output proof,
- and no publication write.

Exact blocker: Stage A cannot move from staged evidence to Agent 10 shipment/publication prep until the existing reader-hint export command is surfaced or a bounded dry-run/proof command is added.

## Safe Next Command Shape

The next command should be dry-run/proof only, not publication:

```powershell
node scripts/<reader-hint-export>.mjs `
  --work-id orot `
  --strategy lookup-candidate `
  --lexical-manifest data/lexical/orot.manifest.json `
  --occurrences data/lexical/occurrences/orot.json `
  --chunks-dir data/lexical/orot-chunks `
  --route-lookup data/definitions/hud-route-lookup/manifest.json `
  --deny-source-row lex-aph-h639 `
  --deny-source-row lex-mashiach-h4899 `
  --deny-source-row lex-ruach-h7307 `
  --deny-source-row lex-yhwh-h3068 `
  --dry-run `
  --proof reports/agent10-orot-stage-a-reader-hint-denylist-proof-2026-06-03.json
```

Proceed condition for Agent 10 planning only:

- `blocked_source_row_hits = 0`
- all output hints remain `reader_hint_not_translation`
- all added hints remain candidate/readability evidence only
- count deltas are recorded
- residual gaps are recorded
- Agent 4/Agent 6 review boundaries remain unaccepted

## Not Accepted

- QA acceptance
- source/provenance custody
- source/provenance acceptance
- source publication
- source-file tracking approval
- public/runtime acceptance
- publication readiness
- route publication support
- Definition authority
- product/data acceptance
- usage-as-definition authority
- translation output
- accepted gloss
- accepted translation text
- CDN/cache closure
- broad rollout

## Agent 8 Callback

- status: Orot Stage A staged reader-hint evidence inspected; denylist scan clean; reproducibility blocker identified
- artifact: `reports/agent10-assistant-orot-stage-a-preflight-2026-06-02-2227.md`
- blockers: local `data/public-hud/orot` missing; no committed reader-hint export/proof command found; staged package is below the full lookup-candidate ceiling and cannot be treated as shipment/publication evidence
- next action needed: Agent 10/Agent 2 surface or add the exact dry-run reader-hint export command with Agent 1 denylist proof; Agent 4/Agent 6 review remains separate if runtime/QA relevance is pursued
- continue condition: continue bounded Agent 10 assistant preflight only; do not accept source/provenance, QA, public/runtime, route-publication, Definition, product/data, usage-as-definition, translation, or publication claims
