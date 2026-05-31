# Phrase And Subphrase Bulk Workflow

## Purpose

This lane emits Hebrew usage context only. A phrase row proves that a token appears in a licensed source window. A subphrase row proves that one part of a maqaf-linked token appears inside a licensed source window. Neither row imports an English translation or asserts that the phrase defines the token.

## Local-Only Batch Command

Use local-only mode for exploratory or overnight runs:

```powershell
node scripts\build_phrase_evidence.mjs --local-only --max-total-rows=200000 --max-per-token=250
```

Local-only mode writes the phrase JSONL, CSV, token index, and sample under `.local-cache/definition-routes/`. It does not patch `data/definitions/manifest.json`, `reports/definition-pipeline-report.md`, or the public sample file.

## Safety Rules

- Tracked sources are used by default through `git ls-files`.
- Untracked sources are included only when `--include-untracked` is passed deliberately.
- If tracked source discovery fails, the script stops instead of silently sweeping untracked files.
- Licenses marked NC, unclear, all-rights-reserved, unknown, unverified, or permission-only are rejected.

## HUD Handoff

Phrase and subphrase rows are evidence cards, not answer cards. The HUD/ranking lane can use them below strict/lemma routes, but the rows must stay visually separate from definition claims unless another accepted route supplies the English definition.
