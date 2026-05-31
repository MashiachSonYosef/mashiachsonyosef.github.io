# Definition Pipeline Report

Generated: 2026-05-31T16:55:04.720Z

## Scope

- Definitions/HUD routing are treated as rebuildable project-owned internals.
- Definition importers own license-safe route rows and raw match scores; final HUD/ranking owns display, winner selection, and live renderer changes.
- Hebrew source imports remain inputs unless an explicit integration pass rewrites shared artifacts.
- Examples and quotation translations from Wiktionary/Kaikki are excluded to avoid importing source-text translations or fair-use quotations.
- Sefaria phrase/subphrase extraction is not treated as globally safe; every version must pass license checks before use.

## Accepted Sources

- Project-authored conservative morphology rules: project-authored / CC0 (local:project-morphology-rules)
- Project-authored paraphrase route policy: project-authored / CC0 (local:project-paraphrase-route-policy)
- Project-authored paraphrase evidence ingest contract: project-authored / CC0 (local:project-paraphrase-evidence-contract)
- Project-authored HUD route card contract: project-authored / CC0 (local:project-hud-route-contract)
- Hebrew Wiktionary data via Kaikki/Wiktextract: CC BY-SA 4.0 / GFDL (https://kaikki.org/dictionary/Hebrew/index.html)
- Wikidata Lexeme: CC0 (https://www.wikidata.org/wiki/Wikidata:Lexicographical_data)
- OpenScriptures HebrewLexicon: CC BY 4.0 (https://github.com/openscriptures/HebrewLexicon)

## Generated Artifacts

- data/definitions/manifest.json
- data/definitions/source-license-inventory.json
- data/definitions/morphology-rules.json
- data/definitions/paraphrase-evidence-contract.json
- data/definitions/paraphrase-evidence-sample.json
- data/definitions/citable-paraphrase-evidence-sample.json
- data/definitions/hud-route-contract.json
- data/definitions/hud-route-fixtures.json
- data/definitions/hud-route-store-sample.json
- data/definitions/hud-route-lookup-sample.json
- data/definitions/hud-route-lookup/manifest.json
- data/definitions/hud-route-release-stamp.json
- data/definitions/definition-route-sample.json
- .local-cache/definition-routes/kaikki-definition-claims.jsonl
- .local-cache/definition-routes/kaikki-definition-claims.csv
- .local-cache/definition-routes/source-layer-definition-claims.jsonl
- .local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl

## Counts

- Morphology rules: 29
- Morphology claims: 29
- Kaikki entries read: 17077
- Kaikki lemma claims: 17008
- Kaikki form claims: 118176
- Kaikki malformed lemma surfaces skipped: 59
- Kaikki malformed form surfaces skipped: 5719
- Existing source-layer claims: 4477
- Sample tokens: 8

## Next Safe Lane

- Add a phrase/subphrase index from already-imported Hebrew source texts, keeping Hebrew citation text separate from English definition claims.
- Add Sefaria phrase candidates only version-by-version after rejecting NC, unclear, or unverified versions.
- Wire HUD to consume the route fixture/lookup samples first, then promote the local lookup shards to chunked public artifacts when the live renderer is ready for on-demand loading.
