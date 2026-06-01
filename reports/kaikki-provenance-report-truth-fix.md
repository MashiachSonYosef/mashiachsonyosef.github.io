# Kaikki Provenance Report Truth Fix

Generated: 2026-06-01

## Finding

The `(kaikki)` samples in lexical build reports come from the existing separated local Kaikki/Wiktionary source layer:

- Manifest layer: `data/lexical/lexicon.json` -> `kaikki-wiktionary-cc-by-sa-gfdl`
- Source file: `data/lexical/source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json`
- Source family: `kaikki`
- License: `CC BY-SA 4.0 / GFDL`

They are not new external imports performed during a lexical build, not OpenScriptures fallback rows, and not stale token-index payload corruption. The defect was report wording: the build-report template still used a pre-Kaikki sentence saying Kaikki/Wiktionary were not used.

## Fix

- Updated `scripts/build_lexical_cache.mjs` so future reports state that the build uses separated local source layers, including any already-imported Kaikki/Wiktionary rows present locally.
- Updated the Kaikki manifest description/status from placeholder wording to active separated-layer wording.
- Updated existing provenance-facing reports so no report simultaneously uses the stale Kaikki exclusion line and shows sampled Kaikki rows.
- Added `scripts/audit_kaikki_report_truth.mjs` to machine-check this exact contradiction.

## Acceptance Audit

Command:

```powershell
node scripts\audit_kaikki_report_truth.mjs
```

Result:

```text
Kaikki report contradiction files: 0
```
