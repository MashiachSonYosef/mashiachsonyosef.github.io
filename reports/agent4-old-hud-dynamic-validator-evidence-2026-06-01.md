# Agent 4 Old-HUD Dynamic Validator Evidence

Generated: 2026-06-01T21:15:45-04:00

## Boundary

- Evidence for `reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.md`.
- Static/simulated validator evidence only; no live browser-click proof.
- No self-acceptance, no public/runtime acceptance, no publication readiness, and no accepted translation text.

## Commands

- `node scripts\audit_route_hud_rollout_watch.mjs`
  - Result: pass.
  - Output: Route HUD rollout watch passed.
  - Evidence: 1360 / 1360 generated pages current-HUD, 0 stale-marker rows, 0 rows missing current markers, 1360 pages with Usage evidence, 0 source-newer-than-page rows.
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`
  - Result: pass.
  - Output: Public HUD route lookup validation passed.
- `node scripts\validate_route_answer_safety.mjs`
  - Result: pass.
  - Output: Route answer safety validation passed.
- `node scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html --page tanakh\exodus\index.html --page halakhah\urim-vetumim-urim\index.html --page halakhah\meirat-einayim-on-shulchan-arukh-choshen-mishpat\index.html --page other\beer-hagolah\index.html --page jewish-thought\kuzari\index.html --page midrash\yefeh-toar-on-bereshit-rabbah\index.html --page targum\targum-jonathan-on-genesis\index.html --page mishnah\mishnah-berakhot\index.html --page chasidut\baal-shem-tov\index.html --page gra\aderet-eliyahu\index.html --page liturgy\siddur-sefard\index.html --page tosefta\brief-commentary-on-yoma\index.html`
  - Result: pass.
  - Output: Route HUD page validation passed for 13 page(s).
- `node scripts\audit_route_hud_click_contract.mjs --page tanakh\genesis\index.html --report reports\agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.md --json reports\agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.json --sample-limit 36`
  - Result: pass.
  - Output: Route HUD click contract prevalidation passed.
  - Evidence: Genesis sample retained answer-eligible source/license rows, sampled maqaf token rows, and 0 forbidden stale page markers.

## Note

`node scripts\audit_old_hud_dynamic_fallback.mjs --include-validators` hit sandbox `EPERM` when the Node VM harness tried to spawn child `node` validators. The dynamic packet was rerun without embedded child validators, then the same validator set above was run directly from the shell.
