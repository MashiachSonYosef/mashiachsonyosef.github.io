# Using the Lexical Workbench Export

Use these JSONL files as lexical options for a future human translation workflow, not as finished translations.

Rules:

- Preserve the Hebrew token order from the source unit.
- Treat each row as a lexical claim, not a sentence-level translation.
- Do not invent definitions for unresolved tokens.
- Keep unresolved tokens unresolved or bracketed for human review.
- Preserve source/license attribution for every rendering you use.
- Do not mix CC BY-SA/GFDL rows into CC0-only output.
- Do not relabel third-party data as project-authored or CC0.
- If you use OpenScriptures or Kaikki/Wiktionary rows, keep their attribution and license requirements attached.
- If multiple rows are available, prefer Strict Hebrew or Strict Aramaic rows over Potential, Related, or Caution rows, but do not erase useful alternatives.
- If a row is marked Potential, Related, or Caution, keep that uncertainty visible.
- Use the `confidence` / `%` fields as export assurance, not as a truth score.
- For quick AI workflows, prefer the `*-ai-options-min60.csv` files. They include every token row, but only place renderings into `safe_export_rendering_options` when a public claim is at least 60% confident and is not Related/Caution.
- If a token row has `unresolved` or `no_safe_option_min60`, keep the Hebrew token bracketed or unresolved. Do not backfill it from context.

Suggested AI instruction:

```text
You are helping a human translator inspect Hebrew source text. Use the attached lexical JSONL rows only as token-level lexical options. Do not create a polished translation. Preserve Hebrew token order. For each token, list safe lexical renderings with source/license attribution. Keep unresolved tokens unresolved. Do not invent definitions. Do not combine CC BY-SA/GFDL rows into CC0 output. Mark Potential, Related, and Caution rows as uncertain.
```

The public export manifest is:

`data/public-lexical/manifest.json`

For large workflows, prefer the compact sitewide files:

- `data/public-lexical/sitewide/claim-index.jsonl`
- `data/public-lexical/sitewide/claim-index.csv`
- `data/public-lexical/sitewide/normalized-lookup.json`
- `data/public-lexical/sitewide/work-summary.jsonl`
- `data/public-lexical/sitewide/work-downloads.csv`

For CC0-only workflows, use:

- `data/public-lexical/by-license/cc0-only.csv`
- `data/public-lexical/by-license/project-cc0.csv`
- `data/public-lexical/by-license/wikidata-cc0.csv`

For work-level coverage audits, use token-status CSVs such as:

- `data/public-lexical/by-work/orot-token-status.csv`
- `data/public-lexical/by-work/aggadat-bereshit-token-status.csv`

Token-status CSVs include unresolved rows explicitly as `No lexical entry yet`; do not invent definitions for those rows.

For work-level AI option scaffolds, use:

- `data/public-lexical/by-work/orot-ai-options-min60.csv`
- `data/public-lexical/by-work/aggadat-bereshit-ai-options-min60.csv`

These CSVs are designed to be loss-resistant: every token row remains present, but unsafe or unresolved rows have empty `safe_export_rendering_options` and an explicit status explaining why.
