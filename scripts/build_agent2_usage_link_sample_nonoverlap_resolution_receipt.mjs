#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-usage-link-sample-nonoverlap-resolution-receipt-2026-06-05.json';
const outputMd = 'reports/agent2-usage-link-sample-nonoverlap-resolution-receipt-2026-06-05.md';
const joinedPath = 'data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json';
const joinSmokePath = 'data/definitions/definition-workbench-usage-join-smoke.json';
const samplePath = 'data/definitions/definition-workbench-sample.json';

const joined = readJson(joinedPath);
const smoke = readJson(joinSmokePath);
const sample = readJson(samplePath);

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_usage_link_sample_nonoverlap_resolution_receipt',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Definition Workbench usage-link current-sample non-overlap risk',
  status: 'nonoverlap_resolved_as_separate_nonpublic_joined_sample_planning_row_no_live_sample_mutation',
  resolved_risk: 'usage-link packet has no overlap with current 200-row sample',
  validated_artifacts: {
    definition_workbench_sample: samplePath,
    usage_join_smoke: joinSmokePath,
    agent2_joined_sample_planning: joinedPath,
  },
  validator_commands: [
    'node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample.json',
    'node scripts/validate_definition_workbench_usage_join_smoke.mjs data/definitions/definition-workbench-usage-join-smoke.json',
    'node scripts/validate_agent2_definition_workbench_usage_joined_sample_planning.mjs data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json',
    'node scripts/validate_agent2_usage_link_sample_nonoverlap_resolution_receipt.mjs reports/agent2-usage-link-sample-nonoverlap-resolution-receipt-2026-06-05.json',
  ],
  current_sample_snapshot: {
    sample_rows: joined.current_sample_snapshot?.rows,
    review_status: joined.current_sample_snapshot?.review_status_counts,
    usage_link_status: joined.current_sample_snapshot?.usage_link_status,
    live_sample_mutated: joined.projected_joined_sample_snapshot?.live_sample_mutated,
  },
  nonoverlap_resolution: {
    join_rows: smoke.counts?.join_rows,
    seed_rows_absent_from_sample: smoke.counts?.seed_rows_absent_from_sample,
    projected_rows_to_add: joined.projected_joined_sample_snapshot?.projected_rows_to_add,
    projected_total_rows_if_separate_joined_artifact: joined.projected_joined_sample_snapshot?.projected_total_rows_if_separate_joined_artifact,
    projected_planning_rows: joined.counts?.projected_rows,
    projected_usage_link_rows: joined.counts?.projected_usage_link_rows,
    selected_occurrence_links: joined.counts?.selected_occurrence_links,
    route_ids: joined.counts?.route_ids,
    audit_only_ambiguous_rows: joined.counts?.audit_only_ambiguous_rows,
    resolved_by: 'separate Agent 2 nonpublic joined-sample planning artifact, not by mutating the current Definition Workbench sample',
  },
  zero_output_counts: {
    live_sample_mutations: 0,
    reader_facing_rows: joined.counts?.reader_facing_rows,
    answer_eligible_rows: joined.counts?.answer_eligible_rows,
    public_rows_emitted: joined.counts?.public_rows_emitted,
    route_shards_written: joined.projected_joined_sample_snapshot?.route_shards_written,
    public_runtime_mutations: joined.projected_joined_sample_snapshot?.public_runtime_mutations,
    route_payload_field_hits: joined.counts?.route_payload_field_hits,
    forbidden_authority_field_hits: joined.counts?.forbidden_authority_field_hits,
    definition_authority_rows: 0,
    accepted_gloss_text_rows: 0,
  },
  authority_boundary: joined.authority_policy,
  remaining_blockers_not_resolved_by_this_receipt: [
    'Agent 6 definition authority boundary remains unaccepted',
    'old-dictionary commercial-clean families still need exact Agent 6 row/subset boundary plus approved morphology relation',
    'Klein remains noncommercial_educational_candidate with no commercial export authorization',
    'BDB Augmented Strong remains blocked pending independent source/license/custody basis',
  ],
  handoff_owner: 'Agent 2 owns this nonpublic usage-link/sample reconciliation receipt; Agent 10/Agent 6 only consume a future exact candidate-use packet if one is prepared.',
  stop_condition: 'Stop at nonpublic joined-sample planning evidence. Do not mutate the live Definition Workbench sample, copy route payloads, rank answers, decide Definition authority, emit public reader output, or mark answer eligibility.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No answer eligibility',
    'No accepted gloss/text',
    'No public reader output',
    'No route-shard edit',
    'No public/runtime mutation',
  ],
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertArtifact(value) {
  if (joined.artifact_type !== 'agent2_definition_workbench_usage_joined_sample_planning') throw new Error('joined planning artifact_type mismatch');
  if (smoke.artifact_type !== 'definition_workbench_usage_join_smoke') throw new Error('join smoke artifact_type mismatch');
  if (!Array.isArray(sample) && sample.artifact_type !== 'definition_workbench_sample') {
    throw new Error('sample artifact shape mismatch');
  }
  if (value.current_sample_snapshot.sample_rows !== 200) throw new Error('sample row count mismatch');
  if (value.nonoverlap_resolution.projected_planning_rows !== 1) throw new Error('expected one projected planning row');
  if (value.nonoverlap_resolution.selected_occurrence_links !== 12) throw new Error('expected 12 selected occurrence links');
  for (const count of Object.values(value.zero_output_counts)) {
    if (count !== 0) throw new Error('zero output counter mismatch');
  }
  for (const key of ['nonpublic_planning_only', 'live_sample_unchanged', 'usage_navigation_only', 'observed_usage_only', 'route_ids_only']) {
    if (value.authority_boundary[key] !== true) throw new Error(`authority boundary ${key} must be true`);
  }
  for (const key of ['reader_facing', 'answer_eligibility', 'publication_claim', 'copies_route_payloads', 'copies_definition_payloads']) {
    if (value.authority_boundary[key] !== false) throw new Error(`authority boundary ${key} must be false`);
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
    '# Agent 2 Usage-Link Sample Non-Overlap Resolution Receipt - 2026-06-05',
    '',
    `Status: ${value.status}.`,
    '',
    '## Resolved Risk',
    '',
    `- \`${value.resolved_risk}\` is resolved as a separate nonpublic joined-sample planning row, not as live sample mutation.`,
    '',
    '## Counts',
    '',
    `- Current sample rows: ${value.current_sample_snapshot.sample_rows}.`,
    `- Join rows / absent seed rows: ${value.nonoverlap_resolution.join_rows} / ${value.nonoverlap_resolution.seed_rows_absent_from_sample}.`,
    `- Projected planning rows: ${value.nonoverlap_resolution.projected_planning_rows}.`,
    `- Projected usage-link rows: ${value.nonoverlap_resolution.projected_usage_link_rows}.`,
    `- Selected occurrence links: ${value.nonoverlap_resolution.selected_occurrence_links}.`,
    `- Route IDs: ${value.nonoverlap_resolution.route_ids}.`,
    `- Audit-only ambiguous rows carried: ${value.nonoverlap_resolution.audit_only_ambiguous_rows}.`,
    '',
    '## Zero Output',
    '',
    '- Live sample mutations, reader-facing rows, answer-eligible rows, public rows, route-shard writes, public/runtime mutations, route payload copies, forbidden authority fields, Definition authority rows, and accepted gloss/text rows: 0.',
    '',
    '## Remaining Blockers',
    '',
    ...value.remaining_blockers_not_resolved_by_this_receipt.map((blocker) => `- ${blocker}`),
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
