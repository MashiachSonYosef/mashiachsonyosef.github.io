# Agent 3 row-level return contract — write-capability blocker

## target
- `agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract`
- Workset rows: `3`
- Workset occurrences: `42`
- Source-RID rows: `3`

## validation status before block
- `node scripts\validate_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract.mjs` passed
- `node scripts\validate_agent3_usage_state.mjs` passed (205/205 evidence; 104/104 validators)

## command set prepared (exact)
- `node scripts\build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract.mjs`
- `node scripts\validate_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract.mjs`
- `node scripts\build_agent3_usage_state.mjs`
- `node scripts\validate_agent3_usage_state.mjs`

## blocker
- `git add` fails with: `fatal: Unable to create 'C:/Users/owner/Documents/translations/.git/index.lock': Permission denied`
- `.git\index` write probe is denied with `icacls` showing inherited DENY entries for unresolved SIDs.
- `.git\index` is not writable: `Set-Acl` and `icacls /inheritance:d /grant:r "owner-machine\\owner:(F)"` return access denied.

## intended artifact set for next cycle
- `scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract.mjs`
- `scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract.mjs`
- `scripts/build_agent3_usage_state.mjs`
- `reports/agent3-state.json`
- `reports/agent3-state.md`
- `reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.json`
- `reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.md`

## stop condition
- Exact same package pending; block remains until `.git` write permission on `.git\index` is restored.
- Next safe action after unlock: run `git add ...` (7 files), `git diff --cached`, `git commit -m "Add Agent 3 direct source-RID row-level return contract"`.
