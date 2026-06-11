# Agent 11 Agent 8 Reader Reception Smart Routing Consult - 2026-06-03

Status: `agent11_reception_advisory_only`

Recommendation: `CAP lightweight routing`

## Agent 8 Callback

From Agent 11 reception view, do not expand the #3-#10 reader chain into a broad runtime-proof or reader-language cleanup loop yet. Cap the lightweight-root routing and keep the full corpus as the primary website organization.

The reader-facing risk is not ordinary copy polish. The live root was reduced to a small Agent 10 surface set, while the local root still exposes the full catalog. Orot should not become an eleventh island; it belongs inside the corpus taxonomy with the Rav Kook / modern Hebrew thought material.

Observed local Orot surface:

- `orot/index.html` contains `data-lexical-config` and `data-route-hud-panel`.
- `orot/index.html` links `../data/lexical/orot.manifest.json`.
- `orot/index.html` links `../data/definitions/hud-route-lookup/manifest.json`.
- `orot/index.html` does not contain `data/public-hud`, `reader_hint_url`, or `data-hud-runtime-contract`.
- `data/public-hud/orot/` is absent in the local checkout.

Observed live Orot surface:

- `https://mashiachsonyosef.github.io/orot/` returns Orot-specific public-HUD config.
- Live config points at `../data/public-hud/orot/manifest.json`, `../data/public-hud/orot/occurrences.json`, `../data/public-hud/orot/reader-hints.json`, and `../data/public-hud/orot/route-lookup/manifest.json`.
- Live route manifest counts match the large cap-3 package: `top_n=10000`, `max_cards_per_key=3`, `selected_token_count=8729`, `public_route_key_count=9494`, `shard_count=3184`, `card_count=23506`, `total_shard_bytes=49259581`, `max_shard_bytes=150072`.

Targeted local validators still pass:

- `node scripts\validate_route_hud_page.mjs --page orot\index.html`
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`
- `node scripts\validate_route_answer_safety.mjs`

Reception recommendation:

Prioritize full-corpus organization and definition trust over more broad runtime proof. Runtime proof should stay bounded to specific reader pages only if Agent 6 asks for it. Reader-language cleanup should follow the corpus map, with unfinished route/definition fields left as `TBD` rather than hiding works from the public library.

Non-acceptance boundary:

This is not QA acceptance, public/runtime acceptance, source/provenance acceptance, publication readiness, route publication support, Definition authority, product/data acceptance, or accepted text.
