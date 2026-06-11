# Agent 10 Agent 2 Ready Broad Workbench Token Inventory 5000 Workset - 2026-06-04

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE` / two-primary Spark model.

## Purpose

This exact Agent 2 future-workset packet converts the blocker `missing_broad_definition_reader_hint_workset_and_commands` into a bounded command-backed queue item.

## Workset

- Workset id: `broad-workbench-token-inventory-5000`
- Target: broad Definition Workbench token inventory expansion from tracked `data/sources` for the top `5000` normalized Hebrew/Aramaic tokens
- Expected output: `.local-cache/workbench-evidence/token-inventory-5000.json`
- Output schema: `workbench_token_inventory`
- Expected rows: `5000`
- Actual validated token occurrences from current tracked-source run: `75290880`

## Exact Command

```powershell
node scripts/build_workbench_token_inventory.mjs --summary-limit=5000 --output=.local-cache/workbench-evidence/token-inventory-5000.json --tokens-jsonl=.local-cache/workbench-evidence/token-inventory-5000.tokens.jsonl --blocked-jsonl=.local-cache/workbench-evidence/token-inventory-5000.blocked.jsonl --report=reports/workbench-token-inventory-5000.md
```

Validator:

```powershell
node scripts/validate_workbench_token_inventory.mjs .local-cache/workbench-evidence/token-inventory-5000.json
```

Agent 2 intake validator:

```powershell
node scripts/validate_agent2_future_workset_intake_packet.mjs reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json
```

## Boundary

This queue item is non-public inventory mechanics only. It does not authorize candidate text consumption/export, answer eligibility, definition-content storage, source/license/legal acceptance, public/runtime behavior, route-shard writes, accepted text, commercial export, NC public display, NC commercial use, publication support, or release action.

Stop after output plus validator pass, or exact missing input/output/schema/validator/count blocker, while preserving zero authority/public/answer emissions.
