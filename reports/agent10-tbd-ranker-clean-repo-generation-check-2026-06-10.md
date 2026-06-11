# Agent 10 TBD Ranker Clean Repo Generation Check

- status: `generated_ranker_outputs_validated_with_stage_scope_blockers`
- head checked: `f4eee67e4` (`Quarantine final cleanup residuals`)
- generated_at: `2026-06-11T02:09:18.456Z`
- boundary: evidence/staging guidance only; no staging, commit, push, deploy, cleanup acceptance, source/license/legal acceptance, Definition authority, answer acceptance, accepted text, publication readiness, or public-runtime acceptance.

## Verdict

The TBD/unresolved ranker did update from the cleaned repo after rerunning `node scripts/generate_corpus_reports.mjs` under a bounded monitor. The final generated set is internally valid and includes restored normalized-form search output.

Do not stage the whole tree blindly. Stage as a scoped generated-output batch only after A14 review because the generated run also touched root/library/site assets, search indexes, token indexes, and five new imported-work page/data surfaces.

## Validated Outputs

| output lane | count/result | evidence |
| --- | ---: | --- |
| per-work coverage JSON | `1352` | all parsed, required numeric fields present, bad coverage files `0` |
| per-work unresolved CSV | `1352` | all expected headers present, bad CSV files `0` |
| coverage/unresolved pairing | `1352/1352` | missing coverage `0`, missing unresolved CSV `0` |
| normalized-form search manifest | present | `data/search/normalized-forms/manifest.json` |
| normalized-form rows/chunks | `791407` rows / `47` chunks | no missing chunk paths |
| corpus stats | `1352` works / `69414928` Hebrew tokens | `corpus_stats.json` |
| lexical coverage | `56.76%` | `corpus_stats.json` |
| unresolved tokens | `30016219` | `corpus_stats.json` |

## Validators Run

| command | result |
| --- | --- |
| custom Node parse/shape check over `data/reports/coverage` + `data/lexical/unresolved` + `data/search/normalized-forms/manifest.json` | passed |
| `node scripts\validate_route_hud_page.mjs --page chasidut/bepardes-hachasidut-vehakabbalah/index.html kabbalah/ohr-penimi-on-talmud-eser-hasefirot/index.html kabbalah/shuvi-shuvi-hashulamit/index.html mishnah/a-new-israeli-commentary-on-pirkei-avot/index.html other/amudei-yerushalayim-on-jerusalem-talmud-nedarim/index.html rav-kook/orot-ha-kodesh/index.html tanakh/daniel/index.html` | passed for `7` pages |
| `node scripts\validate_reader_hints_from_route_lookup.mjs` | passed: Esther `975/2654`, Ezra `1107/3538`, Nehemiah `1848/4822`, Obadiah `118/249`, Malachi `354/789` |
| `git diff --check -- corpus_stats.json data\lexical data\reports data\search stats\index.html reports\a09-new-library-targeted-lexical-build-2026-06-10.md` | passed with CRLF warnings only |

## Current Dirt Buckets Before This Report

| bucket | count | examples |
| --- | ---: | --- |
| modified root/site/stat files | `4` | `corpus_stats.json`, `data/lexical/token-index.json`, `overlay-export.json`, `stats/index.html` |
| modified data report core | `2` | `data/reports/audit/bad_matches.csv`, `data/reports/corpus-coverage-pipeline-report.md` |
| modified search core | `4` | `data/search/english-gloss-index.jsonl`, `data/search/lemma-form-index.jsonl`, `data/search/manifest.json`, `data/search/source-text/manifest.json` |
| modified normalized-form search outputs | `48` | manifest plus `47` chunks |
| page/library surfaces | `7` | `index.html`, `library/index.html`, five new work page directories |
| render helper | `1` | `scripts/render_site.ps1` |
| new lexical chunks/manifests | `10` | five imported works |
| new occurrences | `5` | five imported works |
| new token indexes | `5` | five imported works |
| new unresolved CSVs | `188` | includes five new imports plus previously untracked generated coverage set |
| new coverage JSONs | `188` | includes five new imports plus previously untracked generated coverage set |
| other report | `1` | `reports/a09-new-library-targeted-lexical-build-2026-06-10.md` |

## Stage/Review Guidance

1. Treat this as a coherent generated-output candidate, not random dirt.
2. Do not stage with `git add -A`.
3. Preserve the A10/Orot HUD and preHUD display-gate contract. The reader-hint validator still passes and the new five page surfaces pass the Route HUD validator.
4. Review `scripts/render_site.ps1` separately before staging because it changes targeted render behavior for `targetWorkIds`, `SkipSitePages`, and overlay export gating.
5. Review root/library/index changes separately from lexical/search data because they affect visible navigation.
6. Stage the five imported-work page/data surfaces as a scoped package only if A14 confirms they are intended to move from generated dirt into tracked corpus coverage.

## Addendum: Stage Buckets And New Work Proof

Additional checks after the final rerun:

| check | result |
| --- | --- |
| current dirty count after this A10 report | `465` status lines |
| active generator process | none found |
| `scripts/render_site.ps1` syntax parse | passed |
| root/library links for five new work pages | present in both `index.html` and `library/index.html` |
| representative encoding check | real Hebrew codepoints present and mojibake markers `0` in source, token index, chunk, and page for `bepardes-hachasidut-vehakabbalah` |

Five new work page/data surface counts:

| work | source units | lexical chunks | chunk token sum | total occurrences | matched/unmatched unique forms |
| --- | ---: | ---: | ---: | ---: | ---: |
| `a-new-israeli-commentary-on-pirkei-avot` | `1564` | `27` | `26130` | `112097` | `7712/18418` |
| `amudei-yerushalayim-on-jerusalem-talmud-nedarim` | `18` | `2` | `1779` | `3856` | `619/1160` |
| `bepardes-hachasidut-vehakabbalah` | `1031` | `24` | `23056` | `84636` | `7789/15267` |
| `ohr-penimi-on-talmud-eser-hasefirot` | `1655` | `22` | `21170` | `427463` | `6201/14969` |
| `shuvi-shuvi-hashulamit` | `123` | `7` | `6322` | `19258` | `2653/3669` |

Recommended A14 review/stage buckets:

| bucket | purpose | minimum review gate |
| --- | --- | --- |
| render-helper delta | targeted render behavior | review `scripts/render_site.ps1` diff and keep syntax parse proof |
| five imported-work page/data surfaces | new visible/source-clickable work surfaces | Route HUD page validator plus root/library link check |
| lexical/search/ranker generated data | clean-repo TBD/unresolved ranker update | coverage/unresolved pair check, normalized-form chunk check, corpus stats summary |
| root/library/stats/overlay generated surfaces | navigation/report surface carry | root/library link check and stats/report parse |
| A10/A09 reports | staging evidence only | JSON parse where applicable; no acceptance claims |

## Process Notes

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

- `rg -n "TBD|rank|reader-hint|reader hint|display gate|routeRenderings|form-reference|morphology" scripts assets reports -g "*.mjs" -g "*.js" -g "*.md"` | `30000 ms` | timed out with partial memory/search output | narrowed to known generator/validator scripts.
- `node scripts\build_reader_hints_from_route_lookup.mjs` | `120000 ms` | timed out after generated-at-only reader-hint diffs and a temporary report; not used as acceptance evidence | restored only A10 proof side effects and used committed reader-hint validator instead.
- A combined `git status`/process monitor command | `70000 ms` | timed out while generator output was growing | narrowed to process-specific and output-shape checks.
- An A10 duplicate generator launch was detected and stopped (`pid 8292`, `pid 18324`) to prevent concurrent writes. A single rerun (`pid 37380`) completed and restored `data/search/normalized-forms/manifest.json`.

## Stop Condition

A14 can now review/stage this as a scoped generated-output package if desired. A10 should not perform staging, commit, push, deploy, or cleanup acceptance from this evidence.
