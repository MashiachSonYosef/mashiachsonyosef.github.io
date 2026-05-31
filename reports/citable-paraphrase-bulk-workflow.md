# Citable Paraphrase Bulk Workflow

## Purpose

This lane builds definition-backed usage evidence without touching the live HUD or source imports. It joins accepted lexical definition rows to licensed non-biblical Hebrew source rows, emits citable paraphrase candidates, and leaves final winner selection/rendering to the HUD ranking worker.

## Local-Only Batch Command

Use local-only mode for large overnight runs:

```powershell
node scripts\build_citable_paraphrase_evidence.mjs --local-only --max-total-rows=200000 --max-per-token=40
```

Local-only mode writes the JSONL, CSV, token index, and sample under `.local-cache/definition-routes/`. It does not patch `data/definitions/manifest.json`, `reports/definition-pipeline-report.md`, or the public sample file.

## Morphology Review Mode

Prefix/suffix parsing is opt-in and conservative:

```powershell
node scripts\build_citable_paraphrase_evidence.mjs --local-only --include-morphology --max-total-rows=200000 --max-per-token=40
```

Morphology-derived rows default to `candidate_status=proposed`, even when exact citable rows are accepted. This keeps sketchy prefix/suffix parses out of the live HUD until a review pass promotes them deliberately.

Obvious-risk morphology rows are skipped by default. Use `--include-risky-morphology` only for a diagnostic sweep that should be paired with:

```powershell
node scripts\audit_morphology_review_quality.mjs
```

## Validation Command

Audit the local batch before promoting any public artifact:

```powershell
node scripts\audit_citable_paraphrase_evidence.mjs .local-cache\definition-routes\source-citable-paraphrase-evidence.jsonl .local-cache\definition-routes\source-citable-paraphrase-evidence-audit.md
node scripts\validate_paraphrase_evidence.mjs
```

The audit checks route type, accepted/proposed/rejected status, license safety, non-biblical lane separation, focus-token marking, and the required score rule: `adjusted_score = raw_score - 20`.

## Promotion Rule

Promote only after a local batch has zero audit issues. Public promotion should be a separate coherent commit so the live HUD worker can review the route volume and rendering impact independently.
