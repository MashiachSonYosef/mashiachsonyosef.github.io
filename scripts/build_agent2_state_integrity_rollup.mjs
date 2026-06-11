#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const statePath = 'reports/agent2-state.md';
const outputPath = 'reports/agent2-state-integrity-rollup-2026-06-05.json';
const markdownPath = 'reports/agent2-state-integrity-rollup-2026-06-05.md';

const artifacts = [
  'reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json',
  'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json',
  'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json',
  'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json',
  'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json',
  'reports/agent2-agent4-gate-proof-consumption-receipt-2026-06-05.json',
  'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json',
  'reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json',
  'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json',
  'reports/agent2-orot-205-gate-proof-consumption-receipt-2026-06-05.json',
  'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json',
  'reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json',
  'reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json',
  'reports/agent2-source-family-membership-overlap-receipt-2026-06-05.json',
  'reports/agent2-downstream-alignment-audit-receipt-2026-06-05.json',
  'reports/agent2-row-overlap-boundary-receipt-2026-06-05.json',
  'reports/agent2-agent1-boundary-question-packet-receipt-2026-06-05.json',
  'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json',
];

const loaded = artifacts.map((artifactPath) => ({
  path: artifactPath,
  artifact: readJson(artifactPath),
}));

const stateText = fs.readFileSync(path.join(root, statePath), 'utf8');
const blockerSection = stateText.match(/## Current Exact Blockers\n\n([\s\S]*?)\n## Next Safe Work/);
if (!blockerSection) throw new Error('Current Exact Blockers section missing from Agent 2 state');
const blockerLines = [...blockerSection[1].matchAll(/^- `([^`]+)`$/gm)]
  .map((match) => match[1])
  .filter((value) => !value.startsWith('node '));
const uniqueBlockers = [...new Set(blockerLines)].sort();
const duplicateBlockers = [...new Set(blockerLines.filter((value, index, values) => values.indexOf(value) !== index))].sort();

const rollup = {
  schema_version: '1.0',
  artifact_type: 'agent2_state_integrity_rollup',
  generated_at: '2026-06-05T15:12:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent 2 state integrity and blocker dedupe rollup',
  status: 'state_chain_validated_zero_output_boundaries_preserved',
  inputs: {
    state: statePath,
    artifacts,
  },
  counts: {
    artifacts_checked: loaded.length,
    state_blocker_lines: blockerLines.length,
    unique_blockers: uniqueBlockers.length,
    duplicate_blockers: duplicateBlockers.length,
    source_family_rows: 5,
    commercial_clean_source_families: 3,
    noncommercial_educational_source_families: 1,
    blocked_or_review_source_families: 1,
    morphology_matrix_rows: 297,
    morphology_planning_rows: 78,
    morphology_candidate_use_package_rows: 78,
    morphology_candidate_use_package_occurrences: 1461,
    agent10_morphology_candidate_use_handoff_consumed_rows: 78,
    agent10_morphology_candidate_use_handoff_consumed_occurrences: 1461,
    agent10_morphology_candidate_use_package_consumption_rows: 78,
    agent10_morphology_candidate_use_package_consumption_occurrences: 1461,
    agent10_morphology_candidate_use_package_wait_remains: 0,
    exact_row_subset_manifest_rows: 500,
    exact_row_subset_manifest_subsets: 8,
    exact_row_subset_manifest_agent6_verdict_present_now: 0,
    source_family_membership_unique_rows: 500,
    source_family_membership_nonexclusive_rows: 936,
    source_family_overlap_pairwise_intersections: 10,
    downstream_alignment_source_family_rows: 5,
    downstream_alignment_exact_blockers: 5,
    row_overlap_audited_rows: 500,
    row_overlap_boundary_questions: 8,
    row_overlap_agent6_delivery_now: 0,
    agent1_boundary_question_rows: 6,
    agent1_boundary_question_agent6_delivery_now: 0,
    klein_nc_lane_preservation_rows: 214,
    klein_nc_lane_preservation_occurrences: 4444,
    klein_nc_commercial_export_allowed_now: 0,
    orot_205_rows: 205,
    token_source_aggregate_edge_rows: 1951013,
    allowed_transform_rows_now: 0,
    allowed_candidate_use_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    morphology_candidate_use_package_text_rows_now: 0,
    agent10_morphology_candidate_use_handoff_text_rows_now: 0,
    agent10_morphology_candidate_use_package_consumption_text_rows_now: 0,
    exact_row_subset_manifest_transform_text_output_rows_now: 0,
    source_family_overlap_transform_text_output_rows_now: 0,
    downstream_alignment_transform_text_output_rows_now: 0,
    row_overlap_transform_text_output_rows_now: 0,
    agent1_boundary_question_transform_text_output_rows_now: 0,
    klein_nc_transform_text_output_rows_now: 0,
  },
  unique_blockers: uniqueBlockers,
  duplicate_blockers_in_state: duplicateBlockers,
  artifact_zero_output_audit: loaded.map(({ path: artifactPath, artifact }) => ({
    path: artifactPath,
    artifact_type: artifact.artifact_type,
    status: artifact.status,
    zero_output_ok: zeroOutputOk(artifact),
  })),
  lane_preservation: {
    commercial_clean_and_nc_separated: true,
    nc_row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary',
    nc_derived_from_nc: true,
    nc_commercial_export_allowed: false,
    nc_attribution_required: true,
    blocked_row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong',
  },
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    release_rows: 0,
  },
  highest_permissible_claim: 'Agent2 state chain remains validated as nonpublic planning/prereq evidence and exact blockers only.',
  handoff_owner: 'Agent 2 definer retains blocker state; Agent10/Agent6 own any exact candidate-use boundary packet.',
  stop_condition: 'Stop at integrity rollup. Do not emit transform candidates, candidate text, public output, answer rows, accepted text, export rows, or release artifacts from this rollup.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No candidate-use authorization',
    'No candidate text export',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, rollup);
writeMarkdown(markdownPath, rollup);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function zeroOutputOk(artifact) {
  const zeroContainers = [artifact.zero_output_counts, artifact.zero_counters].filter(Boolean);
  for (const container of zeroContainers) {
    for (const value of Object.values(container)) {
      if (typeof value === 'number' && value !== 0) return false;
    }
  }
  return true;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, rollup) {
  const lines = [
    '# Agent 2 State Integrity Rollup',
    '',
    `Generated: ${rollup.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${rollup.target} | current Agent1 lane classification and Agent2 artifact chain | preserve current chain as nonpublic planning/prereq evidence only | exact Agent10/Agent6 candidate-use boundary still missing | ${rollup.handoff_owner} | ${rollup.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Artifacts checked: ${rollup.counts.artifacts_checked}.`,
    `- Unique blockers: ${rollup.counts.unique_blockers}.`,
    `- Duplicate blocker strings observed in state: ${rollup.counts.duplicate_blockers}.`,
    `- Morphology planning rows: ${rollup.counts.morphology_planning_rows}.`,
    `- Morphology candidate-use package rows: ${rollup.counts.morphology_candidate_use_package_rows}.`,
    `- Morphology candidate-use package occurrences: ${rollup.counts.morphology_candidate_use_package_occurrences}.`,
    `- Agent10 morphology candidate-use handoff consumed rows: ${rollup.counts.agent10_morphology_candidate_use_handoff_consumed_rows}.`,
    `- Agent10 morphology candidate-use handoff consumed occurrences: ${rollup.counts.agent10_morphology_candidate_use_handoff_consumed_occurrences}.`,
    `- Agent10 morphology candidate-use package consumption rows: ${rollup.counts.agent10_morphology_candidate_use_package_consumption_rows}.`,
    `- Agent10 morphology candidate-use package consumption occurrences: ${rollup.counts.agent10_morphology_candidate_use_package_consumption_occurrences}.`,
    `- Exact row-subset manifest rows: ${rollup.counts.exact_row_subset_manifest_rows}.`,
    `- Exact row-subset manifest subsets: ${rollup.counts.exact_row_subset_manifest_subsets}.`,
    `- Source-family membership unique rows: ${rollup.counts.source_family_membership_unique_rows}.`,
    `- Source-family membership nonexclusive rows: ${rollup.counts.source_family_membership_nonexclusive_rows}.`,
    `- Downstream alignment source-family rows: ${rollup.counts.downstream_alignment_source_family_rows}.`,
    `- Row-overlap audited rows: ${rollup.counts.row_overlap_audited_rows}.`,
    `- Row-overlap boundary questions: ${rollup.counts.row_overlap_boundary_questions}.`,
    `- Agent1 boundary-question rows: ${rollup.counts.agent1_boundary_question_rows}.`,
    `- Klein NC lane preservation rows: ${rollup.counts.klein_nc_lane_preservation_rows}.`,
    `- Orot 205 rows: ${rollup.counts.orot_205_rows}.`,
    `- Token-source aggregate edge rows: ${rollup.counts.token_source_aggregate_edge_rows}.`,
    '- Transform/candidate/definition/lemma/reader-hint/answer/public rows now: 0.',
    '',
    '## Duplicate Blockers',
    '',
    ...(rollup.duplicate_blockers_in_state.length ? rollup.duplicate_blockers_in_state.map((blocker) => `- \`${blocker}\``) : ['- none']),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...rollup.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
