# Agent 10 A14 Cleanup Stage Command Packet

- status: `pathspec_staging_commands_for_a14_review`
- head: `f4eee67e4`
- generated_at: `2026-06-11T02:47:03.209Z`
- source status count before packet: `470`
- boundary: evidence/stage planning only; A10 did not stage, commit, push, deploy, clean, or claim acceptance.

## Commands

Run from `C:\Users\owner\Documents\translations`. Review after each bucket.

- scripts: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/scripts.txt` (1 paths)
- pages_or_dirs: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/pages_or_dirs.txt` (7 paths)
- lexical_chunks_manifests: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/lexical_chunks_manifests.txt` (10 paths)
- occurrences: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/occurrences.txt` (5 paths)
- token_indexes: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/token_indexes.txt` (5 paths)
- coverage_json: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/coverage_json.txt` (188 paths)
- unresolved_csv: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/unresolved_csv.txt` (188 paths)
- data_reports_core: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/data_reports_core.txt` (2 paths)
- search_core: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/search_core.txt` (4 paths)
- normalized_forms: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/normalized_forms.txt` (48 paths)
- root_or_other: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/root_or_other.txt` (4 paths)
- reports: `git add --pathspec-from-file=reports/agent10-a14-stage-pathspecs-2026-06-10/reports.txt` (8 paths)

## Self-Inclusion Correction

The `reports` pathspec now includes this command packet and the `reports/agent10-a14-stage-pathspecs-2026-06-10/` directory, so A14 can stage the full handoff evidence if desired.

## Safety Rules

- Run from repo root only: C:\Users\owner\Documents\translations.
- Review scripts/render_site.ps1 diff before staging generated data.
- Do not use git add -A.
- Do not commit/push/deploy from this packet without owner/A14 approval.
- After each bucket, run git diff --cached --name-status to verify staged scope.
- If any command stages unrelated files, unstage that bucket and stop.

## Post-Stage Validators

- `node scripts\validate_route_hud_page.mjs --page chasidut/bepardes-hachasidut-vehakabbalah/index.html kabbalah/ohr-penimi-on-talmud-eser-hasefirot/index.html kabbalah/shuvi-shuvi-hashulamit/index.html mishnah/a-new-israeli-commentary-on-pirkei-avot/index.html other/amudei-yerushalayim-on-jerusalem-talmud-nedarim/index.html rav-kook/orot-ha-kodesh/index.html tanakh/daniel/index.html`
- `node scripts\validate_reader_hints_from_route_lookup.mjs`
- `custom coverage/unresolved/normalized-form shape check from reports/agent10-tbd-ranker-clean-repo-generation-check-2026-06-10.json`
- `git diff --cached --check`

## Pathspec Files

- `reports/agent10-a14-stage-pathspecs-2026-06-10/scripts.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/pages_or_dirs.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/lexical_chunks_manifests.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/occurrences.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/token_indexes.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/coverage_json.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/unresolved_csv.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/data_reports_core.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/search_core.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/normalized_forms.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/root_or_other.txt`
- `reports/agent10-a14-stage-pathspecs-2026-06-10/reports.txt`
