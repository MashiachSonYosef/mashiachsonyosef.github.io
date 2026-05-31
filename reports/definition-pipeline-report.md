# Definition Pipeline Report

Generated: 2026-05-31T02:02:35.750Z

## Scope

- Definitions/HUD routing are treated as rebuildable project-owned internals.
- Hebrew source imports remain inputs unless an explicit integration pass rewrites shared artifacts.
- Examples and quotation translations from Wiktionary/Kaikki are excluded to avoid importing source-text translations or fair-use quotations.
- Sefaria phrase/subphrase extraction is not treated as globally safe; every version must pass license checks before use.

## Accepted Sources

- Project-authored conservative morphology rules: project-authored / CC0 (local:project-morphology-rules)
- Project-authored paraphrase route policy: project-authored / CC0 (local:project-paraphrase-route-policy)
- Project-authored HUD route card contract: project-authored / CC0 (local:project-hud-route-contract)
- Hebrew Wiktionary data via Kaikki/Wiktextract: CC BY-SA 4.0 / GFDL (https://kaikki.org/dictionary/Hebrew/index.html)
- Wikidata Lexeme: CC0 (https://www.wikidata.org/wiki/Wikidata:Lexicographical_data)
- OpenScriptures HebrewLexicon: CC BY 4.0 (https://github.com/openscriptures/HebrewLexicon)

## Generated Artifacts

- data/definitions/manifest.json
- data/definitions/source-license-inventory.json
- data/definitions/morphology-rules.json
- data/definitions/hud-route-contract.json
- data/definitions/hud-route-fixtures.json
- data/definitions/hud-route-store-sample.json
- data/definitions/hud-route-lookup-sample.json
- data/definitions/hud-route-lookup/manifest.json
- data/definitions/definition-route-sample.json
- .local-cache/definition-routes/kaikki-definition-claims.jsonl
- .local-cache/definition-routes/kaikki-definition-claims.csv
- .local-cache/definition-routes/source-layer-definition-claims.jsonl

## Counts

- Morphology rules: 29
- Morphology claims: 29
- Kaikki entries read: 17077
- Kaikki lemma claims: 17033
- Kaikki form claims: 121426
- Existing source-layer claims: 4477
- Sample tokens: 8

## Next Safe Lane

- Add a phrase/subphrase index from already-imported Hebrew source texts, keeping Hebrew citation text separate from English definition claims.
- Add Sefaria phrase candidates only version-by-version after rejecting NC, unclear, or unverified versions.
- Wire HUD to consume the route fixture/lookup samples first, then promote the local lookup shards to chunked public artifacts when the live renderer is ready for on-demand loading.
## Phrase Evidence

- Generated: 2026-05-31T02:09:20.554Z
- Tracked source files scanned: 2
- Allowed units scanned: 2897
- Rejected units skipped: 0
- Token occurrences counted: 36712
- Phrase evidence rows emitted: 40396
- Distinct normalized tokens counted: 12843
- Max rows per normalized token: 80
- Public sample: data/definitions/phrase-evidence-sample.json
- Local cache: .local-cache/definition-routes/source-phrase-evidence.jsonl
- License rule: every phrase row keeps its own source/version/license metadata; skipped licenses are counted but not emitted.
