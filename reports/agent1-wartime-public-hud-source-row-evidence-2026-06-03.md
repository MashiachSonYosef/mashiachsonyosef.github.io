# Agent 1 Wartime Public-HUD Source Row Evidence

Generated: 2026-06-04T00:14:04.125Z

Highest permissible claim: source/provenance blocker evidence prepared.

This packet fetches bounded live public-HUD JSON for candidate public reader surfaces #1-#5 and extracts route-card source/license rows. It is source/provenance evidence only. It is not runtime validation, QA acceptance, public/runtime acceptance, source/provenance custody acceptance, source publication, source-file tracking approval, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, or accepted translation text.

Publication remains `blocked_no_render`.

## Summary

- Surfaces checked: 5
- JSON endpoints checked: 20
- JSON endpoints with HTTP OK: 20
- Route cards extracted: 57
- Source/license rows extracted: 80
- Rows missing required source/license fields: 0
- Unique source labels: `Abudarham. Lisbon, 1489.`, `Ahavat Chesed -- Torat Emet`, `Akeidat Yitzchak, Pressburg 1849`, `Hebrew Wiktionary data via Kaikki/Wiktextract`, `Krakow, 1903`, `OpenScriptures morphHB`
- Unique source IDs: 33
- Unique licenses: `CC BY 4.0`, `CC BY-SA 4.0 / GFDL`, `Public Domain`

## Drift Observation

Current live public-HUD JSON returned `200` for Exodus and Leviticus during this fetch. The older local Agent 10 prep packets for those surfaces recorded public page/manifest `404` at their check time. This packet records only current live JSON source-row evidence; it does not accept runtime behavior or publication state.

## Surface Evidence

### 1. tanakh/deuteronomy/

- Local status evidence: `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`
- Route shard path: `data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`
- Route shard cards reported/extracted: 24 / 24
- Extracted source rows: 35
- Missing source-row required-field rows: 0
- Unique licenses: `CC BY 4.0`, `CC BY-SA 4.0 / GFDL`, `Public Domain`
- Unique source ids: 17
- Reader-hint boundary fields: publication_status=`not_a_translation`, not_translation=`true`, not_accepted_gloss=`true`, not_definition_truth=`true`

Live JSON endpoints:

- manifest: 200; 1760 bytes; sha256 `aebc28764d930619ec0149297e6906db802dd107ba14ee6ef5ffbf2915937e82`; https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/manifest.json
- reader_hints: 200; 1855723 bytes; sha256 `d06d87858dbffef71dfa3abb1c2aca30ff8cdc35f342f0b429a8bd2c7e29f9ab`; https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/reader-hints.json
- route_manifest: 200; 949309 bytes; sha256 `314d38892a1803036b91a21445b7665fdeaaaf726e74983dec088a06c265fc83`; https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/manifest.json
- route_shard: 200; 46681 bytes; sha256 `eb17b64aa510b42ededbb7e38a38f32838a6d3ce2719b3ec600ea1cd8da42b27`; https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json

Sample source rows:

- card `def-kaikki-form-0e404a2f52bfe8c9`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-9a8f74330bd7ee1e; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-972bed0df4a94304`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-b2d6e8a23425b59d; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-d2b4fa26f69a99ec`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-eb80d299fef29a31; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-05276e63cd0e4f5a`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-4f851ea054e6acaa; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-24c07e9725633bd3`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-9125f0f3a5b757c6; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-281421531f08f22b`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-5dae8c6a37b3383f; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `citable-para-1226473bfa7fde9e`: OpenScriptures morphHB / H430; license `CC BY 4.0`; license URL https://creativecommons.org/licenses/by/4.0/; fields used Biblical Hebrew surface form to Strong lemma mapping
- card `citable-para-1226473bfa7fde9e`: Akeidat Yitzchak, Pressburg 1849 / source-version-14bd52324e606c08; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license

### 2. tanakh/genesis/

- Local status evidence: `reports/agent6-genesis-live-browser-proof-verdict-2026-06-02.md`
- Route shard path: `data/public-hud/genesis/route-lookup/shards/05e8-05d0-05e9.json`
- Route shard cards reported/extracted: 15 / 15
- Extracted source rows: 20
- Missing source-row required-field rows: 0
- Unique licenses: `CC BY-SA 4.0 / GFDL`, `Public Domain`
- Unique source ids: 9
- Reader-hint boundary fields: publication_status=`not_a_translation`, not_translation=`true`, not_accepted_gloss=`true`, not_definition_truth=`true`

Live JSON endpoints:

- manifest: 200; 851 bytes; sha256 `d18ecc1534bfaf4070dfbbdd99d9c7c88d9ec68d7944c851a3fddbf22ae04f65`; https://mashiachsonyosef.github.io/data/public-hud/genesis/manifest.json
- reader_hints: 200; 2626255 bytes; sha256 `3d98604e16c09bb76365ba261282104aec95f38af3744e80b74f0289b6677058`; https://mashiachsonyosef.github.io/data/public-hud/genesis/reader-hints.json
- route_manifest: 200; 1231230 bytes; sha256 `f086d2481dcdf8ad31236806bb1b90387b2ac4dacf40afc5f1db2ae3774b2e0f`; https://mashiachsonyosef.github.io/data/public-hud/genesis/route-lookup/manifest.json
- route_shard: 200; 25086 bytes; sha256 `254348f3635e98ff64d275d12b42157262f966d26b219dc626551b8bcb55b559`; https://mashiachsonyosef.github.io/data/public-hud/genesis/route-lookup/shards/05e8-05d0-05e9.json

Sample source rows:

- card `def-kaikki-lemma-0cc2b153b7c7c9cc`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-30abdb40163fa2c0; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `def-kaikki-lemma-199b9d7fe444823f`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-31724142651a5b69; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-04b1cbd8cf5e6ae6`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-30abdb40163fa2c0; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-04b1cbd8cf5e6ae6`: Abudarham. Lisbon, 1489. / source-version-03b64afe2cc6056e; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license
- card `def-kaikki-form-430289b5b1a2cc27`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-31724142651a5b69; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `citable-para-09ef37456c882ea4`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-31724142651a5b69; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma glosses
- card `citable-para-09ef37456c882ea4`: Abudarham. Lisbon, 1489. / source-version-03b64afe2cc6056e; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license
- card `citable-para-0ce16c6049f38217`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-31724142651a5b69; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma glosses

### 3. tanakh/exodus/

- Local status evidence: `reports/agent10-candidate-page-3-shipment-prep-2026-06-02.md`
- Route shard path: `data/public-hud/exodus/route-lookup/shards/05e9-05de-05d5.json`
- Route shard cards reported/extracted: 6 / 6
- Extracted source rows: 6
- Missing source-row required-field rows: 0
- Unique licenses: `CC BY-SA 4.0 / GFDL`
- Unique source ids: 4
- Reader-hint boundary fields: publication_status=`not_a_translation`, not_translation=`true`, not_accepted_gloss=`true`, not_definition_truth=`true`

Live JSON endpoints:

- manifest: 200; 868 bytes; sha256 `f43e6e2f004ce961a9d9e2e550c75a213574e6661d522da807cd5a5c17a8b7b6`; https://mashiachsonyosef.github.io/data/public-hud/exodus/manifest.json
- reader_hints: 200; 4841837 bytes; sha256 `d081503b8350bacd9e47ff45acd412c4ced3d27ee76b61ade2ba9cbaa30efaae`; https://mashiachsonyosef.github.io/data/public-hud/exodus/reader-hints.json
- route_manifest: 200; 1878771 bytes; sha256 `c44fc753033b7fb7d6f19a45e292abe2335618a2196e0159c7c26c76fa2fc882`; https://mashiachsonyosef.github.io/data/public-hud/exodus/route-lookup/manifest.json
- route_shard: 200; 7712 bytes; sha256 `28e8089e896001deea90d3c1481ac30a2753503127692b34fc7f86e672ead6ac`; https://mashiachsonyosef.github.io/data/public-hud/exodus/route-lookup/shards/05e9-05de-05d5.json

Sample source rows:

- card `def-kaikki-form-aa1553c49a286d11`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-57e57c9ab8e8dc8c; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-b63ba183b2fbbd1f`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-ca720b26a5716a2d; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-cca6dccbef482b08`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-3531f3b3cacdf618; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-09343ecec6229923`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-ab52306714b7a944; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-77f74fb27cc4c2c6`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-ca720b26a5716a2d; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-form-8f3c0eabc0fe6ab2`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-57e57c9ab8e8dc8c; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer

### 4. tanakh/leviticus/

- Local status evidence: `reports/agent10-candidate-page-4-shipment-prep-2026-06-02.md`
- Route shard path: `data/public-hud/leviticus/route-lookup/shards/05d0.json`
- Route shard cards reported/extracted: 3 / 3
- Extracted source rows: 5
- Missing source-row required-field rows: 0
- Unique licenses: `CC BY-SA 4.0 / GFDL`, `Public Domain`
- Unique source ids: 2
- Reader-hint boundary fields: publication_status=`not_a_translation`, not_translation=`true`, not_accepted_gloss=`true`, not_definition_truth=`true`

Live JSON endpoints:

- manifest: 200; 854 bytes; sha256 `ade0507e281588537dc65cc602d551fc187fe57a4d2c8bb77e353138c56ea718`; https://mashiachsonyosef.github.io/data/public-hud/leviticus/manifest.json
- reader_hints: 200; 3210963 bytes; sha256 `bfc3b88acc6494a33138ac48a2ab43662ea6e0fe85583d992478af262eee08b8`; https://mashiachsonyosef.github.io/data/public-hud/leviticus/reader-hints.json
- route_manifest: 200; 1241654 bytes; sha256 `682c17da9d14c12611cf88c8c2da02420f9e83665e6a55f379a718ad55dddea1`; https://mashiachsonyosef.github.io/data/public-hud/leviticus/route-lookup/manifest.json
- route_shard: 200; 6499 bytes; sha256 `b6b3b9f7d83edc39a0ee940aec28cd824ab853a7afb71816dcb15322b53688ad`; https://mashiachsonyosef.github.io/data/public-hud/leviticus/route-lookup/shards/05d0.json

Sample source rows:

- card `def-kaikki-lemma-1b9a10f074e6dc75`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-cac9403a1c547fed; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-01c411ad9faecf0c`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-cac9403a1c547fed; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-01c411ad9faecf0c`: Abudarham. Lisbon, 1489. / source-version-03b64afe2cc6056e; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license
- card `citable-para-06d235f377065c8c`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-cac9403a1c547fed; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-06d235f377065c8c`: Abudarham. Lisbon, 1489. / source-version-03b64afe2cc6056e; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license

### 5. tanakh/numbers/

- Local status evidence: `reports/agent10-candidate-page-5-shipment-prep-2026-06-02.md`
- Route shard path: `data/public-hud/numbers/route-lookup/shards/05d9-05d4-05d5.json`
- Route shard cards reported/extracted: 9 / 9
- Extracted source rows: 14
- Missing source-row required-field rows: 0
- Unique licenses: `CC BY-SA 4.0 / GFDL`, `Public Domain`
- Unique source ids: 6
- Reader-hint boundary fields: publication_status=`not_a_translation`, not_translation=`true`, not_accepted_gloss=`true`, not_definition_truth=`true`

Live JSON endpoints:

- manifest: 200; 875 bytes; sha256 `f72ac5071657cc29f7b9b4a1e4cf72f1a662a46b9474e2873c8e6f67059e0722`; https://mashiachsonyosef.github.io/data/public-hud/numbers/manifest.json
- reader_hints: 200; 4306604 bytes; sha256 `a8f5437c0def9fe1ac3c942617a4d979c576fe722e302733a83615a6879465b5`; https://mashiachsonyosef.github.io/data/public-hud/numbers/reader-hints.json
- route_manifest: 200; 1658045 bytes; sha256 `04bf9304abec72cc37b009668e1e9919a3cc8d0d22fa605c488cdd2f1187079b`; https://mashiachsonyosef.github.io/data/public-hud/numbers/route-lookup/manifest.json
- route_shard: 200; 19927 bytes; sha256 `f50d12feecee91c963f08827b7ffeebacc92dc9633ee6e5a4744efb92f51361b`; https://mashiachsonyosef.github.io/data/public-hud/numbers/route-lookup/shards/05d9-05d4-05d5.json

Sample source rows:

- card `def-kaikki-lemma-7b6eb91538ace7af`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-cf2a00992763304e; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-02a9c356a19d1809`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-cf2a00992763304e; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-02a9c356a19d1809`: Abudarham. Lisbon, 1489. / source-version-03b64afe2cc6056e; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license
- card `citable-para-156b9a4cad443ac0`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-cf2a00992763304e; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-156b9a4cad443ac0`: Abudarham. Lisbon, 1489. / source-version-03b64afe2cc6056e; license `Public Domain`; license URL https://creativecommons.org/publicdomain/mark/1.0/; fields used hebrew, source_ref, version_title, version_source, license
- card `def-kaikki-form-2123feb62fd540e6`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-53dc19eb20d42c02; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used forms, form tags, lemma pointer
- card `def-kaikki-lemma-2b1b3ea22690b392`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-bb6f19fb3e92899d; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples
- card `citable-para-009064b3de29fb15`: Hebrew Wiktionary data via Kaikki/Wiktextract / kaikki-bb6f19fb3e92899d; license `CC BY-SA 4.0 / GFDL`; license URL https://en.wiktionary.org/wiki/Wiktionary:Copyrights; fields used word, part of speech, glosses, forms/tags without examples


## Needed Agent 6 Decision

Agent 6 can use this packet as bounded source/provenance-sensitive evidence for the public-reader slice. The rows show public-HUD route-card source/license metadata is present in current live JSON, but Agent 1 does not accept custody, source publication, route publication support, public/runtime acceptance, or any product/data gate.

## Agent 8 Callback

- status: bounded live public-HUD source-row evidence produced; evidence-ready / awaiting-Agent-6 only
- artifact: `reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.md`
- machine artifact: `reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json`
- blockers: source/provenance custody remains unresolved; extracted third-party Kaikki/Wiktextract source/license rows are evidence rows only; current live JSON drift from older Exodus/Leviticus 404 prep reports requires Agent 6/Agent 7 interpretation before any runtime or publication claim
- next action needed: Agent 6 review if source/provenance-sensitive route-card rows should be docketed for the active public-reader slice; otherwise continue Agent 1 probing next candidate-source blocker
- continue condition: continue without render, staging, commit, publication, runtime validation, or custody acceptance

## Must Not Accept

- source/provenance custody
- source publication
- source-file tracking approval
- QA acceptance
- public/runtime acceptance
- publication readiness
- route publication support
- Definition authority
- product/data acceptance
- usage-as-definition authority
- translation output
- accepted translation text
