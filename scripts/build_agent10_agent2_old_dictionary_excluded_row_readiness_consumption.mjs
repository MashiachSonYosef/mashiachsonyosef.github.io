#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json';
const outputMd = 'reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.md';
const readinessPath = 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json';
const prepPath = 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json';

const readiness = readJson(readinessPath);
const prep = readJson(prepPath);

const packet = {
  schema_version: 1,
  artifact_type: 'agent10_agent2_old_dictionary_excluded_row_readiness_consumption',
  generated_at: new Date().toISOString(),
  active_mode: readiness.active_mode,
  package_workset: 'agent2_old_dictionary_excluded_row_transform_readiness',
  release_owner: 'Agent 10',
  status: 'release_owner_consumed_nonpublic_readiness_no_agent6_route_ready',
  inputs_consumed: [
    readinessPath,
    'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.md',
    prepPath,
    'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.md',
    readiness.inputs.agent1_classified_packet,
    prep.upstream_artifacts.agent1_continuation,
    'scripts/build_agent2_old_dictionary_excluded_row_transform_readiness_matrix.mjs',
    'scripts/validate_agent2_old_dictionary_excluded_row_transform_readiness_matrix.mjs',
    'scripts/build_agent2_old_dictionary_excluded_row_reaudit_consumption_prep.mjs',
    'scripts/validate_agent2_old_dictionary_excluded_row_reaudit_consumption_prep.mjs',
  ],
  counts: {
    source_family_rows: readiness.matrix_counts.source_family_rows,
    commercial_clean_candidate_source_families: readiness.matrix_counts.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: readiness.matrix_counts.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: readiness.matrix_counts.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: readiness.matrix_counts.blocked_or_needs_review_source_families,
    allowed_transform_rows_now: readiness.matrix_counts.allowed_transform_rows_now,
    definition_candidate_rows_now: readiness.matrix_counts.definition_candidate_rows_now,
    lemma_candidate_rows_now: readiness.matrix_counts.lemma_candidate_rows_now,
    reader_hint_candidate_rows_now: readiness.matrix_counts.reader_hint_candidate_rows_now,
    candidate_text_rows_now: readiness.matrix_counts.candidate_text_rows_now,
    answer_eligible_rows_now: readiness.matrix_counts.answer_eligible_rows_now,
    public_emit_rows_now: readiness.matrix_counts.public_emit_rows_now,
  },
  lane_split: {
    current_agent1_thread_id: readiness.current_agent1_thread_id,
    commercial_clean_and_nc_separated: true,
    nc_row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary',
    nc_derived_from_nc: true,
    nc_commercial_export_allowed: false,
    nc_attribution_required: true,
    blocked_row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong',
    unclassified_rows_consumed_as_candidate_text: 0,
    metadata_or_link_only_rows_consumed_as_candidate_text: 0,
  },
  validator_results: [
    {
      command: `node scripts/validate_agent2_old_dictionary_excluded_row_reaudit_consumption_prep.mjs ${prepPath}`,
      result: 'passed',
    },
    {
      command: `node scripts/validate_agent2_old_dictionary_excluded_row_transform_readiness_matrix.mjs ${readinessPath}`,
      result: 'passed',
    },
  ],
  exact_blockers: readiness.exact_blockers,
  agent6_boundary_question: null,
  agent6_boundary_reason: 'No Agent 6 route is opened by this release-owner consumption packet because the Agent 2 readiness matrix emits zero candidate text/package/display/public/answer rows. Agent 6 routing requires a future exact row/subset package proposing specific candidate-use behavior.',
  next_handoff: {
    agent2: 'Wait for exact Agent 6 row/subset boundary plus approved morphology relation before any commercial-clean nonpublic definition/lemma/reader-hint input rows; preserve NC and blocked lanes separately.',
    agent10: 'Open no release action and no Agent 6 route from this readiness-only intake; consume as blocker/readiness evidence.',
    agent6: 'Needed only if a future exact row/subset candidate-use package is prepared.',
  },
  zero_counters: readiness.zero_output_counts,
  highest_permissible_claim: 'Agent 10 consumed the Agent 2 old-dictionary excluded-row transform-readiness matrix as nonpublic readiness/blocker evidence. No Definition, answer, public/runtime, accepted-text, candidate-text export, or release action is authorized.',
  stop_condition: 'Stop at release-owner intake of readiness evidence. Do not route to Agent 6, publish, mutate runtime, store Definition content, export candidate text, or mark answer eligibility until a future exact row/subset candidate-use packet exists.',
  forbidden_claims: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'candidate text export',
    'commercial export permission',
    'NC commercial authorization',
    'release action',
  ],
};

assertPacket(packet);
writeJson(outputJson, packet);
writeMd(outputMd, packet);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertPacket(packet) {
  if (packet.counts.source_family_rows !== 5) throw new Error('source family count mismatch');
  if (packet.counts.commercial_clean_candidate_source_families !== 3) throw new Error('commercial clean count mismatch');
  if (packet.counts.noncommercial_educational_candidate_source_families !== 1) throw new Error('NC count mismatch');
  if (packet.counts.blocked_or_needs_review_source_families !== 1) throw new Error('blocked count mismatch');
  if (packet.counts.allowed_transform_rows_now !== 0) throw new Error('allowed transform count must be 0');
  if (packet.lane_split.nc_commercial_export_allowed !== false) throw new Error('NC commercial export must be false');
  for (const value of Object.values(packet.zero_counters)) {
    if (value !== 0) throw new Error('zero counter mismatch');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 10 Agent 2 Old Dictionary Excluded-Row Readiness Consumption - 2026-06-05',
    '',
    `Status: ${value.status}.`,
    '',
    '## Counts',
    '',
    `- Source-family rows: ${value.counts.source_family_rows}.`,
    `- Commercial-clean / NC / metadata-link / blocked source families: ${value.counts.commercial_clean_candidate_source_families} / ${value.counts.noncommercial_educational_candidate_source_families} / ${value.counts.metadata_or_link_only_source_families} / ${value.counts.blocked_or_needs_review_source_families}.`,
    '- Allowed transform, Definition, lemma, reader-hint, candidate-text, answer, public, and accepted-text rows now: 0.',
    '',
    '## Exact Blockers',
    '',
    ...value.exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Agent 6 Route',
    '',
    value.agent6_boundary_reason,
    '',
    '## Next Handoff',
    '',
    `- Agent 2: ${value.next_handoff.agent2}`,
    `- Agent 10: ${value.next_handoff.agent10}`,
    `- Agent 6: ${value.next_handoff.agent6}`,
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
    '## Highest Permissible Claim',
    '',
    value.highest_permissible_claim,
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
