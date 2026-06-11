# Agent 1 Source Custody Agent 6 Decision Matrix

Generated: 2026-06-04T00:16:02.992Z

Highest permissible claim: source/provenance custody decision-matrix evidence prepared for Agent 6 review.

This is non-mutating evidence for Agent 5/8 relay and Agent 6 docketing. It does not stage, track, commit, merge, edit source files, mutate queue/control state, render, publish, or accept source/provenance custody.

## Summary

- Refresh completed: `2026-06-04T00:16:00.104Z`
- Publication state: `blocked_no_render`
- Agent 6-ready request IDs: 5
- Untracked tracking/exclusion rows: 23
- Modified tracked license-normalization rows: 6
- Blocked direct artifact paths: 248
- Blocked content-reference paths: 183
- Route/HUD content-reference rows: 42
- Reader/workbench content-reference rows: 112
- Public lexical content-reference rows: 29
- Queue mutation performed: false
- Action performed: false

## Relay Gate

- Owner: Agent 5 or Agent 8
- Status: `direct_relay_prompt_ready_no_agent1_mutation`
- Direct relay prompt: `reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md`
- Queue insertion patch operations: 5
- Agent 6 disposition hits: 0
- Agent 5/8 relay-signal hits: 0
- Request IDs:
- `agent6-agent1-source-custody-manifest-remediation-review`
- `agent6-agent1-source-custody-tracking-action-review`
- `agent6-agent1-source-custody-license-normalization-review`
- `agent6-agent1-public-hud-source-row-review`
- `agent6-agent1-orot-fill-source-row-review`

## Agent 6 Decision Gates

- `agent6-agent1-source-custody-manifest-remediation-review`: Issue a dated pass/warn/block verdict on Packet B manifest-remediation evidence only; source/provenance custody and downstream reliance stay blocked unless Agent 6 explicitly narrows them.
- `agent6-agent1-source-custody-tracking-action-review`: Issue a dated track/exclude/return disposition for the 23 untracked source files; Agent 1 does not approve tracking, staging, or custody.
- `agent6-agent1-source-custody-license-normalization-review`: Issue a dated pass/warn/block verdict on six PD to Public Domain license-label normalization rows; Agent 1 does not accept or commit the drift.
- `agent6-agent1-public-hud-source-row-review`: Issue a dated pass/warn/block verdict on public-HUD source-row evidence only, without runtime/publication/source-custody acceptance.
- `agent6-agent1-orot-fill-source-row-review`: Issue a dated pass/warn/block verdict on Orot fill source-row evidence only, without downstream reliance or source-custody acceptance.

## Tracking Or Exclusion Rows

- path: `data/sources/beer-hagolah.json`; work_id: `beer-hagolah`; git: `??`; units: 529; direct paths: 9; content refs: 66; sha256: `9881c54718226060113740e4d4aab3eab21fd3e2fac2b585fb217b550b91c72d`
- path: `data/sources/brief-commentary-on-peah.json`; work_id: `brief-commentary-on-peah`; git: `??`; units: 158; direct paths: 9; content refs: 1; sha256: `1af1e9603e9e323a3099c6b70889e7314fdca688a96dc6a95a260a702d05eb94`
- path: `data/sources/brief-commentary-on-rosh-hashanah.json`; work_id: `brief-commentary-on-rosh-hashanah`; git: `??`; units: 85; direct paths: 9; content refs: 1; sha256: `b8806e7336d171dbf549dc169f0ace291db1fff154be36964e55d61ecb133b45`
- path: `data/sources/brief-commentary-on-shabbat.json`; work_id: `brief-commentary-on-shabbat`; git: `??`; units: 493; direct paths: 9; content refs: 1; sha256: `8c3060b470bf4ae94d7e6178b998f9b330f84538a3eceaaf087b34d50102f5bc`
- path: `data/sources/brief-commentary-on-shekalim.json`; work_id: `brief-commentary-on-shekalim`; git: `??`; units: 114; direct paths: 9; content refs: 1; sha256: `e784b0b29bff24c18946934f0bcce2a7f64850a358cca95c3ca861f1b5577318`
- path: `data/sources/brief-commentary-on-sheviit.json`; work_id: `brief-commentary-on-sheviit`; git: `??`; units: 337; direct paths: 9; content refs: 1; sha256: `fb78a31ea357bc80e0a546206e235637dc0933692a80406fb95b538fcaddec78`
- path: `data/sources/brief-commentary-on-sotah.json`; work_id: `brief-commentary-on-sotah`; git: `??`; units: 158; direct paths: 9; content refs: 1; sha256: `a6461cf38a737d54a2c4f640dcb3ae590e940548dd7bdcc237480874dec2067b`
- path: `data/sources/brief-commentary-on-taanit.json`; work_id: `brief-commentary-on-taanit`; git: `??`; units: 66; direct paths: 9; content refs: 1; sha256: `5d4b422f59abe6e12bc932087e1a2883d8bbb8a40834c2797133fed9bf65a24e`
- path: `data/sources/brief-commentary-on-terumot.json`; work_id: `brief-commentary-on-terumot`; git: `??`; units: 486; direct paths: 9; content refs: 1; sha256: `5ccc6e20706fc7c86cd1acf287df6debf0236dfd5596e487caca1cfd426ff34b`
- path: `data/sources/brief-commentary-on-yevamot.json`; work_id: `brief-commentary-on-yevamot`; git: `??`; units: 228; direct paths: 9; content refs: 1; sha256: `d4d78559104b1708807deb72652255983c8b3e825afa5174b603ba3fb077af32`
- path: `data/sources/brief-commentary-on-yoma.json`; work_id: `brief-commentary-on-yoma`; git: `??`; units: 139; direct paths: 9; content refs: 1; sha256: `22399db08adc121f9c6ee708e0c81805e5619b07d0258900a970d4eaf4525ede`
- path: `data/sources/derashat-shabbat-hagadol.json`; work_id: `derashat-shabbat-hagadol`; git: `??`; units: 271; direct paths: 9; content refs: 1; sha256: `7f895054932fbfe4a3fd5430461e398147358dce1ce4599be5ee9975a2e76718`
- path: `data/sources/derush-al-hatorah.json`; work_id: `derush-al-hatorah`; git: `??`; units: 257; direct paths: 9; content refs: 1; sha256: `f83bf3ce344b6826b1e656f5a0c2e016f6c78748d4b962338b0f40f60b313578`
- path: `data/sources/gevurot-hashem.json`; work_id: `gevurot-hashem`; git: `??`; units: 1863; direct paths: 9; content refs: 1; sha256: `ea9f29388ba534301687acc44db6d5168b82158dd01ed9d60bf62ae30301b091`
- path: `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json`; work_id: `machzor-rosh-hashanah-ashkenaz-linear`; git: `??`; units: 14761; direct paths: 6; content refs: 1; sha256: `d3bcc78936f0a60a08636c339e6afe98cfb4e11c1547937b5d5de0a38b8d795e`
- path: `data/sources/machzor-rosh-hashanah-ashkenaz.json`; work_id: `machzor-rosh-hashanah-ashkenaz`; git: `??`; units: 1488; direct paths: 6; content refs: 1; sha256: `f9306daf66b3f3269102f7ad2533ad21230601dd1459fafb40bd7f9af34e902c`
- path: `data/sources/machzor-yom-kippur-ashkenaz-linear.json`; work_id: `machzor-yom-kippur-ashkenaz-linear`; git: `??`; units: 17895; direct paths: 6; content refs: 1; sha256: `97e0e25174fac4fe77ae1b49f432a8c4726f14ef5d2509c454a913138f13d0e2`
- path: `data/sources/ner-mitzvah.json`; work_id: `ner-mitzvah`; git: `??`; units: 90; direct paths: 9; content refs: 33; sha256: `8895f8b325b628e6589290e0d16b1f83849223574f0683b5db89b5aae84797ee`
- path: `data/sources/netivot-olam.json`; work_id: `netivot-olam`; git: `??`; units: 1248; direct paths: 9; content refs: 1; sha256: `a972f1c1bd6c7f3c6fc72629a4d9fc9e584372109af950eb60d40de1553936b3`
- path: `data/sources/netzach-yisrael.json`; work_id: `netzach-yisrael`; git: `??`; units: 970; direct paths: 9; content refs: 1; sha256: `b885e9748cacc4a57da233db8f78ffb42945f4fd88e3ae7d02cd654a7f8aca9b`
- path: `data/sources/selichot-nusach-lita-linear.json`; work_id: `selichot-nusach-lita-linear`; git: `??`; units: 22257; direct paths: 6; content refs: 1; sha256: `e590013a338f7655a6455fd3ecbcceeadb7229eeb3a5f2f39622b4d5fa378a81`
- path: `data/sources/shabbat-siddur-sefard-linear.json`; work_id: `shabbat-siddur-sefard-linear`; git: `??`; units: 14718; direct paths: 6; content refs: 1; sha256: `e659d4e0c256180a9f3e8c2b71873f96bb4e414c5f4ecb064e0fff814f7492e1`
- path: `data/sources/siddur-sefard.json`; work_id: `siddur-sefard`; git: `??`; units: 6799; direct paths: 6; content refs: 1; sha256: `0de0a5c658e91fe4369bb1b90703cf07452c8856e106611c476211e604865c74`

## License Normalization Rows

- path: `data/sources/abarbanel-on-guide-for-the-perplexed.json`; work_id: `abarbanel-on-guide-for-the-perplexed`; git: ` M`; units: 633; scalar diffs: 633; direct paths: 10; content refs: 38; sha256: `73939739bb57fa2a4489d1bc0b0c74a28554ab88e72c3cdd3e46ef6147e51367`
- path: `data/sources/crescas-on-guide-for-the-perplexed.json`; work_id: `crescas-on-guide-for-the-perplexed`; git: ` M`; units: 70; scalar diffs: 70; direct paths: 10; content refs: 6; sha256: `f32f33e23d45ab2ea80fa49d993d3d6666058efb2e5c3d4a4fb84848430e8111`
- path: `data/sources/efodi-on-guide-for-the-perplexed.json`; work_id: `efodi-on-guide-for-the-perplexed`; git: ` M`; units: 151; scalar diffs: 151; direct paths: 10; content refs: 6; sha256: `eb452071af982edf481051c33747954091fb36edd35192fdc04dc15d860527b1`
- path: `data/sources/narboni-on-guide-for-the-perplexed.json`; work_id: `narboni-on-guide-for-the-perplexed`; git: ` M`; units: 182; scalar diffs: 182; direct paths: 10; content refs: 6; sha256: `1e9e0136c4ace1283abb02f8a2e9a268bd251f79c8e7c5cd7b7c5f940a60bdf6`
- path: `data/sources/shem-tov-on-guide-for-the-perplexed.json`; work_id: `shem-tov-on-guide-for-the-perplexed`; git: ` M`; units: 132; scalar diffs: 132; direct paths: 9; content refs: 1; sha256: `697b761f7b7c1a0304bfd264bde845060b3872ffe491da7556b65bfae8b4a6f6`
- path: `data/sources/yahel-ohr-on-zohar.json`; work_id: `yahel-ohr-on-zohar`; git: ` M`; units: 238; scalar diffs: 238; direct paths: 10; content refs: 6; sha256: `88b20debbd384a7e4ebb898625f7e34a5dbbf4a7f19d83a6fe91a1064dd8c02e`

## Current Blockers

- source_provenance_custody_unaccepted
- untracked_source_tracking_or_exclusion_pending
- modified_tracked_license_normalization_pending
- agent1_request_ids_absent_from_agent6_agent5_control_surfaces
- agent6_disposition_absent_for_current_request_ids
- publication_blocked_no_render

## Evidence Artifacts

- `reports/agent1-source-custody-refresh-result.json`
- `reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json`
- `reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json`
- `reports/agent1-source-custody-current-blocker-packet-2026-06-03.json`
- `reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json`
- `reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json`
- `reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json`
- `reports/agent1-downstream-quarantine-manifest.json`

## Must Not Accept

- source/provenance custody
- source/provenance acceptance
- source publication
- source-file tracking approval
- source-file staging, commit, or merge
- downstream direct artifact acceptance
- downstream content-reference acceptance
- QA acceptance
- public/runtime acceptance
- publication readiness
- route publication support
- Definition authority
- product/data acceptance
- usage-as-definition authority
- translation output
- accepted translation text

## Agent 8 Callback

- status: Agent 6 decision matrix prepared; awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only
- artifact: `reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.md`
- machine artifact: `reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.json`
- blockers: source_provenance_custody_unaccepted; untracked_source_tracking_or_exclusion_pending; modified_tracked_license_normalization_pending; agent1_request_ids_absent_from_agent6_agent5_control_surfaces; agent6_disposition_absent_for_current_request_ids; publication_blocked_no_render
- next action needed: Agent 5/Agent 8 relay using `reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md`, then Agent 6 pass/warn/block disposition for the five request IDs
- continue condition: continue Agent 1 source/provenance evidence maintenance without staging, commit, queue mutation, render, publication, runtime validation, or custody acceptance
