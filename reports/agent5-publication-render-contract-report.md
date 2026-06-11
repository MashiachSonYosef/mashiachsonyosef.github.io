# Agent 5 Publication Render Contract Report

Generated: 2026-06-06T07:52:34.622Z

## Summary

- Status: blocked_no_render
- Render artifact exists: no
- Rendered translation rows checked: 0
- Translation-memory accepted rows: 0
- Attribution-manifest unknown-license sources: 0
- Attribution-manifest Sefaria sources: 0
- Attribution-manifest publication-review sources: 3

## Enforced Publication Rules

- Every rendered row must point to a translation-memory `decision_id`.
- Every rendered row must carry `decision_status=accepted`.
- The source decision row must also be `decision_status=accepted`.
- Every rendered row and source decision row must carry `license_safe=true`.
- Every rendered row must include `license_profile.direct_translation_use_ok=true`.
- Every rendered row must match at least one manifest source for each rendered/source decision source row.
- Attribution-required rows must have an attribution bundle.
- `workbench_ok_publication_review` rows require an explicit output-license decision.

## Issues

- None.

## Warnings

- No publication render artifact found at data/translation-memory/publication-render-output.json; publication release remains blocked until a renderer output is validated.

## Control Interpretation

- This validator is the publication renderer gate requested by Agent 6.
- A clean attribution manifest alone is not sufficient for publication release.
- If no publication render artifact exists, publication remains blocked rather than implicitly cleared.

