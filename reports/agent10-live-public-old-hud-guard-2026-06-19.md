# Agent 10 Live Public Old-HUD Guard

Generated: 2026-06-19T07:32:55.166Z

## Boundary

- Evidence only; this is not QA acceptance or validated public/runtime acceptance.
- Scope is live HTTP/static exposure over selected public URLs, runtime assets, and public-HUD data endpoints.
- No source/provenance custody, publication readiness, Definition authority, usage-as-definition authority, or accepted text is claimed.

## Required Report

1. Live URL checked: `https://mashiachsonyosef.github.io` plus selected paths listed below.
2. Old HUD exposure: NO
3. Pages left public: `/`, `/orot/`, `/tanakh/deuteronomy/`, `/tanakh/genesis/`
4. Pages quarantined/checked: `/hud-preview/`, `/hud-preview/routes/`, `/reader-workbench/`, `/sample/`, `/old-hud/`
5. Commit/deploy id: `f53eb38a0f9d92328cdb6108c66e8e95ca40e618`
6. Remaining blocker: None for this bounded static live guard. Browser-click/runtime acceptance remains outside this packet.

## Summary

- Status: warn_live_public_old_hud_guard
- Checks: 36
- Hard old-HUD marker hit checks: 0
- Watch old-HUD marker hit checks: 1
- Issues: 0
- Warnings: 1

## Public Pages

- root: HTTP 200; bytes=731929; hard old markers=none; watch=none; current=none; sha256=`0b9d1ec0ad1423adff0ba171b286b6292ea7caa1883ace370aea8059bb7fd397`
- root old-HUD query negative: HTTP 200; bytes=731929; hard old markers=none; watch=none; current=none; sha256=`0b9d1ec0ad1423adff0ba171b286b6292ea7caa1883ace370aea8059bb7fd397`
- Orot: HTTP 200; bytes=1270874; hard old markers=none; watch=none; current=data-route-hud-panel, reader-workbench.js, data-lexical-config, data/public-hud, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`21004b5adf49c3db92f3515d5c45f24115ff9f99066a656ccca996dffa25d79d`
- Orot old-HUD query negative: HTTP 200; bytes=1270874; hard old markers=none; watch=none; current=data-route-hud-panel, reader-workbench.js, data-lexical-config, data/public-hud, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`21004b5adf49c3db92f3515d5c45f24115ff9f99066a656ccca996dffa25d79d`
- Deuteronomy: HTTP 200; bytes=1305968; hard old markers=none; watch=none; current=data-route-hud-panel, reader-workbench.js, data-lexical-config, data/public-hud, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`42be4ef5111167ff5af5ffbe7cc338dd02b5b885c6c6c9ade0f4bb696ed56618`
- Deuteronomy old-HUD query negative: HTTP 200; bytes=1305968; hard old markers=none; watch=none; current=data-route-hud-panel, reader-workbench.js, data-lexical-config, data/public-hud, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`42be4ef5111167ff5af5ffbe7cc338dd02b5b885c6c6c9ade0f4bb696ed56618`
- Genesis: HTTP 200; bytes=1954572; hard old markers=none; watch=none; current=data-route-hud-panel, reader-workbench.js, data-lexical-config, data/public-hud, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`cd903b941448f4e621273a9ab533af57caf32ecdff6e376336a0cab766dde9d4`
- Genesis old-HUD query negative: HTTP 200; bytes=1954572; hard old markers=none; watch=none; current=data-route-hud-panel, reader-workbench.js, data-lexical-config, data/public-hud, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`cd903b941448f4e621273a9ab533af57caf32ecdff6e376336a0cab766dde9d4`
- /hud-preview/: HTTP 404; bytes=1409; hard old markers=none; watch=none; current=none; sha256=`7593d29f1151328626bcd2b0276e3c4cc9a46b25a903954ae633ce4cd8bccc31`
- /hud-preview/routes/: HTTP 404; bytes=1409; hard old markers=none; watch=none; current=none; sha256=`7593d29f1151328626bcd2b0276e3c4cc9a46b25a903954ae633ce4cd8bccc31`
- /reader-workbench/: HTTP 404; bytes=1409; hard old markers=none; watch=none; current=none; sha256=`7593d29f1151328626bcd2b0276e3c4cc9a46b25a903954ae633ce4cd8bccc31`
- /sample/: HTTP 404; bytes=1409; hard old markers=none; watch=none; current=none; sha256=`7593d29f1151328626bcd2b0276e3c4cc9a46b25a903954ae633ce4cd8bccc31`
- /old-hud/: HTTP 404; bytes=1409; hard old markers=none; watch=none; current=none; sha256=`7593d29f1151328626bcd2b0276e3c4cc9a46b25a903954ae633ce4cd8bccc31`

## Runtime Assets

- /assets/js/reader-workbench.js: HTTP 200; bytes=92208; hard old markers=none; watch=sourceSummary, data-selected-gloss; current=data-route-hud-panel, data-lexical-token, data-lexical-config, hud_route_lookup_manifest_url, reader_hint_url, source-footnotes, answer_eligible, answer_role; sha256=`5b55d6196ce842cf94956a35c05e028d7d46b07149a636d4b77f87c347bec7a6`
- /assets/css/reader-workbench.css: HTTP 200; bytes=11357; hard old markers=none; watch=none; current=none; sha256=`09dff9eef0368cc68746ca24a88264546bab179c21567cd60c88a07cfc938351`

## Public-HUD Data

- orot/manifest.json: HTTP 200; bytes=898; hard old markers=none; watch=none; current=none; sha256=`473fec8819011b972f4daadef339aa3ed7e2a3af7991daa6c9270d86ce173650`
- orot/occurrences.json: HTTP 200; bytes=1261481; hard old markers=none; watch=none; current=none; sha256=`fde072caaf14165a207ae3f75886f23c72b68a94591acf92f249d818fc96a631`
- orot/reader-hints.json: HTTP 200; bytes=7689051; hard old markers=none; watch=none; current=answer_eligible; sha256=`7df20a59edf6f987c2c032a902a635c0a4f227a96292fe7a7a674e61398d4ad0` counts={"occurrence_token_count":59806,"unique_token_id_count":17307,"existing_hint_count":8722,"added_hint_count":7,"final_hint_count":8759,"existing_hint_occurrences":39998,"added_hint_occurrences":75,"final_hint_occurrences":40461,"pending_review_placeholder_rows":30,"pending_review_placeholder_occurrences":388,"nc_pending_review_placeholder_rows":17,"nc_pending_review_placeholder_occurrences":259}
- orot/route-lookup/manifest.json: HTTP 200; bytes=3213694; hard old markers=none; watch=none; current=data/public-hud; sha256=`3b271cb83e3515c348d32448f6cd625e264c2b66f4b3cb32595fc902b6080cab` counts={"selected_token_count":8729,"selected_lookup_candidate_count":16355,"preserved_existing_route_key_count":0,"preserved_existing_card_count":0,"selected_existing_route_key_count":0,"distinct_normalized_tokens":9494,"public_route_key_count":9494,"shard_count":3184,"card_count":23506,"total_shard_bytes":49259581,"max_shard_bytes":150072,"truncated_key_count":12976}
- orot/route-lookup/shards/05d0.json: HTTP 200; bytes=6499; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`b6b3b9f7d83edc39a0ee940aec28cd824ab853a7afb71816dcb15322b53688ad`
- orot/route-lookup/shards/05db-05dc-05be.json: HTTP 200; bytes=1175; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`af2942716d0dad8ebe1cc0f5672c0cf72470fc646365889e1a007ce9c00e129c`
- orot/route-lookup/shards/05ea-05ea-05e4.json: HTTP 200; bytes=10286; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`2c5fe3626bc86dbeac914c346170856a5ff485f746241a6b2e0ecc673122d159`
- deuteronomy/manifest.json: HTTP 200; bytes=1760; hard old markers=none; watch=none; current=none; sha256=`aebc28764d930619ec0149297e6906db802dd107ba14ee6ef5ffbf2915937e82`
- deuteronomy/occurrences.json: HTTP 200; bytes=665725; hard old markers=none; watch=none; current=none; sha256=`aefea5117a1ecf4049d6276ea14dd7790df135dee494a9d280c634477d32b4d5`
- deuteronomy/reader-hints.json: HTTP 200; bytes=2424490; hard old markers=none; watch=none; current=answer_eligible; sha256=`40a42ab4aa3ac9629117d531f160a73612ab43c9e1a684a8cb99c65ebb787036`
- deuteronomy/route-lookup/manifest.json: HTTP 200; bytes=949309; hard old markers=none; watch=none; current=data/public-hud; sha256=`314d38892a1803036b91a21445b7665fdeaaaf726e74983dec088a06c265fc83` counts={"selected_token_count":2621,"selected_lookup_candidate_count":1848,"preserved_existing_route_key_count":0,"preserved_existing_card_count":0,"selected_existing_route_key_count":0,"distinct_normalized_tokens":1426,"public_route_key_count":1426,"shard_count":973,"card_count":4133,"total_shard_bytes":8387801,"max_shard_bytes":68645,"truncated_key_count":4180}
- deuteronomy/route-lookup/shards/05d0.json: HTTP 200; bytes=6499; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`b6b3b9f7d83edc39a0ee940aec28cd824ab853a7afb71816dcb15322b53688ad`
- deuteronomy/route-lookup/shards/05d9-05e8-05d4.json: HTTP 200; bytes=5174; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`b71f32cd3ee393cae1b86855db12242acb06584310ac41da56077e6da1ff2f78`
- deuteronomy/route-lookup/shards/other.json: HTTP 200; bytes=1243; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`3494d8d8816b86ac2bb5fc6c56db1bbe3f5bdf1dc952c1dee674ee81bc2f11dd`
- genesis/manifest.json: HTTP 200; bytes=851; hard old markers=none; watch=none; current=none; sha256=`d18ecc1534bfaf4070dfbbdd99d9c7c88d9ec68d7944c851a3fddbf22ae04f65`
- genesis/occurrences.json: HTTP 200; bytes=578039; hard old markers=none; watch=none; current=none; sha256=`6b9ea974f6daae62dd91a0d38f4395f52f2804c7783d851a3a72016907ef3951`
- genesis/reader-hints.json: HTTP 200; bytes=3465606; hard old markers=none; watch=none; current=answer_eligible; sha256=`897027e07211edf3263bfc0d6ec29166e702692d1d1e40805259dae37e4820f4`
- genesis/route-lookup/manifest.json: HTTP 200; bytes=1231230; hard old markers=none; watch=none; current=data/public-hud; sha256=`f086d2481dcdf8ad31236806bb1b90387b2ac4dacf40afc5f1db2ae3774b2e0f` counts={"selected_token_count":3544,"selected_lookup_candidate_count":1890,"preserved_existing_route_key_count":0,"preserved_existing_card_count":0,"selected_existing_route_key_count":0,"distinct_normalized_tokens":1599,"public_route_key_count":1599,"shard_count":1092,"card_count":4660,"total_shard_bytes":9321764,"max_shard_bytes":71062,"truncated_key_count":5465}
- genesis/route-lookup/shards/05d0-05d1.json: HTTP 200; bytes=3690; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`6dd47e157db31908f2c417ba6db1553da59d91fa6d172466284e6ce476358483`
- genesis/route-lookup/shards/05d9-05e9-05d9.json: HTTP 200; bytes=5909; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`05c624057c8819e641be175a2de58cf2780f3d0228ca4a4f6a59c3acfb25c8fa`
- genesis/route-lookup/shards/other.json: HTTP 200; bytes=1243; hard old markers=none; watch=none; current=answer_eligible, answer_role; sha256=`3494d8d8816b86ac2bb5fc6c56db1bbe3f5bdf1dc952c1dee674ee81bc2f11dd`

## Issues

- none

## Warnings

- runtime_asset /assets/js/reader-workbench.js contains watch marker(s): sourceSummary, data-selected-gloss

## What Must Not Be Accepted

- QA acceptance.
- Validated public/runtime acceptance.
- Publication readiness.
- Source/provenance custody or acceptance.
- Definition authority.
- Usage-as-definition authority.
- Accepted translation text.
- CDN/cache closure beyond the cache-busted HTTP checks in this packet.
