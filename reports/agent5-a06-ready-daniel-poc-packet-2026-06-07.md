# Agent 5 A06-Ready Daniel POC Packet

Generated: 2026-06-07

Return shape: `A05_A06_PACKET_READY | packet path or inline packet | A06 needed yes/no | exact blocker | stop condition`

## Packet Status

`A05_A06_PACKET_READY | reports/agent5-a06-ready-daniel-poc-packet-2026-06-07.md | A06 needed: no, not until a concrete Daniel row/tag/translation-cleaning blocker is named | exact blocker: no_concrete_a06_row_tag_blocker_currently_named; A10 browser proof remains pending/blocked by file-url browser policy per handoff | stop condition: hold for A10/A14/owner concrete row/tag blocker or A10 browser/proof contract update; do not publish, stage, clean repo, touch Orot, rerun A01-A04, or invent HUD behavior`

## Target

Daniel POC.

Target page:

- `tanakh/daniel/index.html`

## A10 Contract Path

- `reports/agent10-daniel-book-page-poc-spec-handoff-to-a05-2026-06-07.md`

## Files

Implementation/proof files named by A10:

- `tanakh/daniel/index.html`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `scripts/build_daniel_reader_pipeline_page.mjs`
- `scripts/validate_hebrew_workbench_public_surface.mjs`
- `data/lexical/crossmatches/daniel.json`
- `data/definitions/hud-route-lookup-daniel/manifest.json`
- `reports/daniel-reader-pipeline-page-report.json`

Source/runtime inputs:

- `data/sources/daniel.json`
- `data/lexical/daniel.manifest.json`
- `data/lexical/occurrences/daniel.json`
- `data/lexical/token-indexes/tanakh/daniel.json`
- `data/definitions/hud-route-lookup/manifest.json`

## Current Observed Proof State

A05 read the A10 handoff and, before the A14 correction arrived, ran:

```powershell
node scripts/build_daniel_reader_pipeline_page.mjs
```

Builder result:

```json
{
  "ok": true,
  "output": "tanakh/daniel/index.html",
  "report": "reports/daniel-reader-pipeline-page-report.json",
  "token_rows": 5456
}
```

Current `reports/daniel-reader-pipeline-page-report.json` facts:

- `source_units`: `357`
- `source_chapters`: `12`
- `token_rows`: `5456`
- `occurrence_total_reported`: `5456`
- `selected_prehud_rows`: `0`
- `tbd_fallback_rows`: `5456`
- `prehud_row_mode`: `one_token_per_row`
- `render_runtime`: `shared_reader_workbench`
- route lookup scope: `0` shards and `0` bytes for Daniel scoped public route lookup
- Hebrew crossmatch index: `2941` normalized keys, scoped to Daniel

No A05 validator/diff/browser step was run after the A14 correction.

## Exact Commands If A06 Must Run Any

No A06 translation-cleaning/tagging command is currently needed.

A06 should run no command from this packet unless A10, A14, A07, owner, or A06's queue names a concrete Daniel row/tag/translation-cleaning blocker.

If a future A06 row/tag blocker is named, the task packet must include:

- exact Daniel row/unit/token identifiers;
- source file(s);
- tag/check fields required;
- exact command/script to run or write;
- output artifact path;
- schema/count requirements;
- validator/proof command;
- stop condition.

A10's mechanical render commands remain contract/proof context, not current A06 work:

```powershell
node scripts/build_daniel_reader_pipeline_page.mjs
node scripts/validate_hebrew_workbench_public_surface.mjs
git diff --check -- tanakh/daniel/index.html assets/js/reader-workbench.js assets/css/reader-workbench.css scripts/build_daniel_reader_pipeline_page.mjs scripts/validate_hebrew_workbench_public_surface.mjs data/lexical/crossmatches/daniel.json data/definitions/hud-route-lookup-daniel/manifest.json reports/daniel-reader-pipeline-page-report.json
```

## Tag / Check Fields Required For Future A06 Work

If A06 is activated for Daniel cleaning/tagging/evidence, the packet must name row-scoped fields:

- `work_id`
- `source_ref`
- `unit_id` or `anchor_id`
- `token_index_id`
- `surface_word`
- `normalized_word`
- `row_state`
- `tag_needed`
- `expected_tag_value`
- `source_evidence_path`
- `definition_route_state`
- `tbd_display_state`
- `blocker`

Allowed row states:

- `tbd_display_only`
- `needs_translation_cleaning`
- `needs_tagging`
- `needs_source_evidence`
- `blocked_missing_input`

Forbidden row states:

- `accepted_definition`
- `accepted_gloss`
- `answer_text`
- `source_license_accepted`
- `publication_ready`

## Expected Outputs For Future A06 Work

If concrete A06 work is needed, expected output should be one dated A06 artifact under `reports/` plus optional JSON:

- row/tag evidence matrix;
- counts by `row_state`;
- exact blockers;
- validator/proof result;
- next handoff owner.

Minimum receipt shape:

`target | files used | rows checked | tags checked | outputs | validator | exact blocker | next handoff | stop condition`

## Validator / Proof Path

Current proof path:

- `reports/daniel-reader-pipeline-page-report.json`

A10 validator command from handoff:

```powershell
node scripts/validate_hebrew_workbench_public_surface.mjs
```

Browser proof state from A10 handoff:

- `browser_proof_blocked_by_browser_url_policy_for_file_url`

Current A10 next safe action if browser proof is required:

- use approved local HTTP/static page route or owner-visible browser path;
- do not bypass browser policy with raw CDP, alternate browser surfaces, or indirect execution.

## Blocker Shape

Use this exact blocker shape if A06 cannot proceed:

`missing_a06_task_field | target | missing_field | required_owner | files_available | next_safe_action | stop_condition`

Current blocker:

`missing_a06_task_field | Daniel POC | concrete row/tag/translation-cleaning blocker not named | A10/A14/owner/A07 | A10 handoff and Daniel report available | hold A06 work until blocker names row/tag fields and expected output | no A06 execution from this packet`

## Stop Condition

Stop now because no A06 row/tag/translation-cleaning work is currently needed.

Resume only when one of these arrives:

- A10 names a concrete Daniel missing data/tag blocker;
- A14/owner sends exact A06 task fields;
- A07 requests a boundary-gated implementation/live-state packet;
- A10 returns browser/proof update that requires A06 row/tag evidence.

## A07 Gate Boundary

A07 gates implementation/live state later.

This packet does not authorize:

- publication;
- release;
- public runtime action;
- Definition acceptance;
- source/license/legal acceptance;
- product acceptance;
- answer/accepted-text acceptance;
- Orot mutation;
- repo cleanup;
- staging.

## Boundary

Packaging only. No broad coordination, no repo cleanup, no staging, no publish, no Orot touch, no A01/A02/A03/A04 rerun, no HUD invention, and no acceptance claims.
