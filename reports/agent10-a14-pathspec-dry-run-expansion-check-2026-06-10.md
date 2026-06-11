# Agent 10 A14 Pathspec Dry Run Expansion Check

- status: `dry_run_completed_no_index_changes_claimed`
- head: `f4eee67e4`
- generated_at: `2026-06-11T02:49:55.238Z`
- boundary: dry-run evidence only; A10 did not stage, commit, push, deploy, clean, or claim acceptance.

## Summary

| bucket | pathspec lines | dry-run output lines | exit | stderr lines | note |
| --- | ---: | ---: | ---: | ---: | --- |
| `scripts` | `1` | `0` | `128` | `6` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `pages_or_dirs` | `7` | `0` | `128` | `6` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `lexical_chunks_manifests` | `10` | `0` | `128` | `6` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `occurrences` | `5` | `0` | `128` | `6` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `token_indexes` | `5` | `0` | `128` | `6` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `coverage_json` | `188` | `0` | `0` | `0` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `unresolved_csv` | `188` | `0` | `0` | `0` | directory/path expansion differs from pathspec line count; inspect sample/details |
| `data_reports_core` | `2` | `2` | `0` | `0` | one-to-one file path expansion |
| `search_core` | `4` | `4` | `0` | `0` | one-to-one file path expansion |
| `normalized_forms` | `48` | `48` | `0` | `0` | one-to-one file path expansion |
| `root_or_other` | `4` | `4` | `0` | `0` | one-to-one file path expansion |
| `reports` | `8` | `19` | `0` | `0` | directory/path expansion differs from pathspec line count; inspect sample/details |

## Details

### scripts

- pathspec_count: `1`
- dry_run_line_count: `0`
- exit_status: `128`
- stderr_line_count: `6`
- sample_stderr:
  - `fatal: Unable to create 'C:/Users/owner/Documents/translations/.git/index.lock': File exists.`
  - `Another git process seems to be running in this repository, e.g.`
  - `an editor opened by 'git commit'. Please make sure all processes`
  - `are terminated then try again. If it still fails, a git process`
  - `may have crashed in this repository earlier:`
  - `remove the file manually to continue.`

### pages_or_dirs

- pathspec_count: `7`
- dry_run_line_count: `0`
- exit_status: `128`
- stderr_line_count: `6`
- sample_stderr:
  - `fatal: Unable to create 'C:/Users/owner/Documents/translations/.git/index.lock': File exists.`
  - `Another git process seems to be running in this repository, e.g.`
  - `an editor opened by 'git commit'. Please make sure all processes`
  - `are terminated then try again. If it still fails, a git process`
  - `may have crashed in this repository earlier:`
  - `remove the file manually to continue.`

### lexical_chunks_manifests

- pathspec_count: `10`
- dry_run_line_count: `0`
- exit_status: `128`
- stderr_line_count: `6`
- sample_stderr:
  - `fatal: Unable to create 'C:/Users/owner/Documents/translations/.git/index.lock': File exists.`
  - `Another git process seems to be running in this repository, e.g.`
  - `an editor opened by 'git commit'. Please make sure all processes`
  - `are terminated then try again. If it still fails, a git process`
  - `may have crashed in this repository earlier:`
  - `remove the file manually to continue.`

### occurrences

- pathspec_count: `5`
- dry_run_line_count: `0`
- exit_status: `128`
- stderr_line_count: `6`
- sample_stderr:
  - `fatal: Unable to create 'C:/Users/owner/Documents/translations/.git/index.lock': File exists.`
  - `Another git process seems to be running in this repository, e.g.`
  - `an editor opened by 'git commit'. Please make sure all processes`
  - `are terminated then try again. If it still fails, a git process`
  - `may have crashed in this repository earlier:`
  - `remove the file manually to continue.`

### token_indexes

- pathspec_count: `5`
- dry_run_line_count: `0`
- exit_status: `128`
- stderr_line_count: `6`
- sample_stderr:
  - `fatal: Unable to create 'C:/Users/owner/Documents/translations/.git/index.lock': File exists.`
  - `Another git process seems to be running in this repository, e.g.`
  - `an editor opened by 'git commit'. Please make sure all processes`
  - `are terminated then try again. If it still fails, a git process`
  - `may have crashed in this repository earlier:`
  - `remove the file manually to continue.`

### coverage_json

- pathspec_count: `188`
- dry_run_line_count: `0`
- exit_status: `0`
- stderr_line_count: `0`

### unresolved_csv

- pathspec_count: `188`
- dry_run_line_count: `0`
- exit_status: `0`
- stderr_line_count: `0`

### data_reports_core

- pathspec_count: `2`
- dry_run_line_count: `2`
- exit_status: `0`
- stderr_line_count: `0`
- sample_stdout:
  - `add 'data/reports/audit/bad_matches.csv'`
  - `add 'data/reports/corpus-coverage-pipeline-report.md'`

### search_core

- pathspec_count: `4`
- dry_run_line_count: `4`
- exit_status: `0`
- stderr_line_count: `0`
- sample_stdout:
  - `add 'data/search/english-gloss-index.jsonl'`
  - `add 'data/search/lemma-form-index.jsonl'`
  - `add 'data/search/manifest.json'`
  - `add 'data/search/source-text/manifest.json'`

### normalized_forms

- pathspec_count: `48`
- dry_run_line_count: `48`
- exit_status: `0`
- stderr_line_count: `0`
- sample_stdout:
  - `add 'data/search/normalized-forms/manifest.json'`
  - `add 'data/search/normalized-forms/normalized-forms-000.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-001.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-002.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-003.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-004.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-005.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-006.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-007.jsonl'`
  - `add 'data/search/normalized-forms/normalized-forms-008.jsonl'`

### root_or_other

- pathspec_count: `4`
- dry_run_line_count: `4`
- exit_status: `0`
- stderr_line_count: `0`
- sample_stdout:
  - `add 'corpus_stats.json'`
  - `add 'data/lexical/token-index.json'`
  - `add 'overlay-export.json'`
  - `add 'stats/index.html'`

### reports

- pathspec_count: `8`
- dry_run_line_count: `19`
- exit_status: `0`
- stderr_line_count: `0`
- sample_stdout:
  - `add 'reports/a09-new-library-targeted-lexical-build-2026-06-10.md'`
  - `add 'reports/agent10-a14-cleanup-stage-command-packet-2026-06-10.json'`
  - `add 'reports/agent10-a14-cleanup-stage-command-packet-2026-06-10.md'`
  - `add 'reports/agent10-a14-cleanup-stage-manifest-2026-06-10.json'`
  - `add 'reports/agent10-a14-cleanup-stage-manifest-2026-06-10.md'`
  - `add 'reports/agent10-a14-stage-pathspecs-2026-06-10/coverage_json.txt'`
  - `add 'reports/agent10-a14-stage-pathspecs-2026-06-10/data_reports_core.txt'`
  - `add 'reports/agent10-a14-stage-pathspecs-2026-06-10/lexical_chunks_manifests.txt'`
  - `add 'reports/agent10-a14-stage-pathspecs-2026-06-10/normalized_forms.txt'`
  - `add 'reports/agent10-a14-stage-pathspecs-2026-06-10/occurrences.txt'`
