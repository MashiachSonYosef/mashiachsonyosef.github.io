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

Suggested AI instruction:

```text
You are helping a human translator inspect Hebrew source text. Use the attached lexical JSONL rows only as token-level lexical options. Do not create a polished translation. Preserve Hebrew token order. For each token, list safe lexical renderings with source/license attribution. Keep unresolved tokens unresolved. Do not invent definitions. Do not combine CC BY-SA/GFDL rows into CC0 output. Mark Potential, Related, and Caution rows as uncertain.
```

The public export manifest is:

`data/public-lexical/manifest.json`
