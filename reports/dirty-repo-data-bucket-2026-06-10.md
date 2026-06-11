# Dirty Repo Data Bucket Receipt

Generated: 2026-06-10

## Scope

- Bucket: data artifacts from the post-render dirty tree
- Candidate paths staged: 458
- Excluded path: `data/lexical/crossmatches/daniel.json`
- Exclusion reason: generated_at-only diff; crossmatch remains HUD evidence/navigation only and is not preHUD display authority
- No deletion cleanup was performed.

## Data Shape

- JSON files: 456
- CSV files: 1
- JSONL files: 1
- Parse failures: 0
- Page surfaces validated from lexical payloads: 26

## Page Validators

`node scripts/validate_route_hud_page.mjs` passed for the 26 page surfaces mapped from changed lexical manifests and occurrence files:

- `other/beer-hagolah/index.html`
- `tosefta/brief-commentary-on-peah/index.html`
- `tosefta/brief-commentary-on-rosh-hashanah/index.html`
- `tosefta/brief-commentary-on-shabbat/index.html`
- `tosefta/brief-commentary-on-shekalim/index.html`
- `tosefta/brief-commentary-on-sheviit/index.html`
- `tosefta/brief-commentary-on-sotah/index.html`
- `tosefta/brief-commentary-on-taanit/index.html`
- `tosefta/brief-commentary-on-terumot/index.html`
- `tosefta/brief-commentary-on-yevamot/index.html`
- `tosefta/brief-commentary-on-yoma/index.html`
- `other/derashat-shabbat-hagadol/index.html`
- `other/derush-al-hatorah/index.html`
- `other/gevurot-hashem/index.html`
- `liturgy/machzor-rosh-hashanah-ashkenaz/index.html`
- `liturgy/machzor-rosh-hashanah-ashkenaz-linear/index.html`
- `liturgy/machzor-yom-kippur-ashkenaz-linear/index.html`
- `other/ner-mitzvah/index.html`
- `other/netivot-olam/index.html`
- `other/netzach-yisrael/index.html`
- `halakhah/pitchei-teshuva-on-shulchan-arukh-even-haezer/index.html`
- `halakhah/rabbi-akiva-eiger-on-shulchan-arukh-even-haezer/index.html`
- `liturgy/selichot-nusach-lita-linear/index.html`
- `liturgy/shabbat-siddur-sefard-linear/index.html`
- `liturgy/siddur-sefard/index.html`
- `halakhah/turei-zahav-on-shulchan-arukh-even-haezer/index.html`

## Data Validators

- `git diff --check -- data` passed with CRLF warnings only.
- `node scripts/validate_public_hud_route_lookup.mjs --skip-release-stamp` passed.
- `node scripts/validate_hud_route_lookup.mjs --fixtures-only` passed.
- `node scripts/validate_hud_route_fixtures.mjs` passed.
- `node scripts/validate_hud_route_store.mjs` passed.
- `node scripts/validate_definition_workbench_sample.mjs` passed.
- `node scripts/validate_gloss_selection_contract.mjs` passed, but its timestamp-only report output is not staged in this bucket.
- `node scripts/validate_translation_memory.mjs` passed.

## Boundary

This is generated data and evidence staging only. It does not grant source/license/legal/Definition/product/answer/accepted-text/public-runtime/release acceptance. Crossmatch evidence stays HUD-inspectable evidence/navigation and does not promote preHUD text.
