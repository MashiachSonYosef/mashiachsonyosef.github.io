#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  agent3_state_json: 'reports/agent3-state.json',
  agent3_state_md: 'reports/agent3-state.md',
  work_category_index_json: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json',
  work_category_index_md: 'reports/agent3-definition-workbench-usage-collision-work-category-index-reshit.md',
  occurrence_locator_json:
    'data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json',
  occurrence_locator_md: 'reports/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.md',
  provenance_locator_json:
    'data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json',
  provenance_locator_md: 'reports/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.md',
  deuteronomy_continuity_package_json:
    'reports/agent3-deuteronomy-phase2-agent6-receipt-continuity-package-2026-06-04.json',
  agent1_orot_linkage_candidates_json: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json',
  agent1_orot_linkage_candidates_md: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.md',
};

const outputJson = 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json';
const outputMd = 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.md';

const state = readJson(inputs.agent3_state_json);
const index = readJson(inputs.work_category_index_json);
const occurrence = readJson(inputs.occurrence_locator_json);
const provenance = readJson(inputs.provenance_locator_json);
const deuteronomy = readJson(inputs.deuteronomy_continuity_package_json);
const agent1Orot = readJson(inputs.agent1_orot_linkage_candidates_json);
const stateMetrics = { ...(state.counts || {}), ...(state.current_metrics || {}) };

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_linkage_navigation_frontier_checkpoint',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'evidence_ready_frontier_checkpoint',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  agent3_usage_state: {
    status: state.worker_state,
    qa_acceptance_state: state.qa_acceptance_state,
    manager: state.manager,
    acceptance_owner: state.acceptance_owner,
    goal_board_status: state.goal_board_status,
    control_queue_mutated: state.handoff_state?.control_queue_mutated,
    submitted_to_agent6: state.handoff_state?.submitted_to_agent6,
    counts: pick(stateMetrics, [
      'usage_concordance_rows',
      'usage_supported_rows',
      'usage_candidate_rows',
      'usage_weak_rows',
      'audit_only_ambiguous_rows',
      'selected_usage_rows',
      'selected_source_refs',
      'selected_works',
      'route_ids',
      'occurrence_link_rows',
      'occurrence_link_rows_with_complete_metadata',
      'occurrence_link_reader_facing_rows',
      'occurrence_link_route_payload_field_hits',
      'occurrence_link_forbidden_authority_field_hits',
      'smoke_steps',
      'smoke_failed_steps',
      'freshness_impact_pending_refresh_files',
    ]),
    authority_boundary: state.authority_boundary,
  },
  reshit_work_category_index: {
    status: index.status,
    focus_token: index.focus_token || index.focus?.token || 'reshit',
    counts: {
      source_occurrence_rows: index.counts?.source_occurrence_rows,
      category_index_rows: index.counts?.category_index_rows,
      work_index_rows: index.counts?.work_index_rows,
      category_license_index_rows: index.counts?.category_license_index_rows,
      occurrence_queue_links: index.counts?.occurrence_queue_links,
      complete_metadata_rows: index.counts?.rows_with_complete_metadata,
      route_id_rows: index.counts?.route_id_rows,
      reader_facing_rows: index.counts?.reader_facing_rows,
      route_payload_field_hits: index.counts?.route_payload_field_hits,
      forbidden_authority_field_hits: index.counts?.forbidden_authority_field_hits,
    },
  },
  reshit_occurrence_locator: {
    status: occurrence.status,
    counts: pick(occurrence.counts, [
      'unique_locator_rows',
      'source_grouped_occurrence_rows',
      'duplicate_grouped_occurrence_rows',
      'rows_with_source_url',
      'rows_with_local_work_anchor',
      'rows_with_phrase_context_snippet',
      'rows_with_work_id',
      'rows_with_route_ids',
      'distinct_route_ids',
      'reader_facing_rows',
      'route_payload_field_hits',
      'forbidden_authority_field_hits',
      'source_text_reads',
      'broad_target_expansion',
      'queue_mutations',
      'submitted_to_agent6',
    ]),
  },
  reshit_provenance_locator: {
    status: provenance.status,
    counts: pick(provenance.counts, [
      'source_locator_rows',
      'license_index_rows',
      'public_domain_occurrence_rows',
      'cc_by_sa_occurrence_rows',
      'version_source_index_rows',
      'license_version_index_rows',
      'rows_with_license_url',
      'rows_with_version_title',
      'rows_with_version_source',
      'rows_with_source_url',
      'rows_with_local_work_anchor',
      'rows_with_phrase_context_snippet',
      'rows_with_route_ids',
      'distinct_route_ids',
      'reader_facing_rows',
      'route_payload_field_hits',
      'forbidden_authority_field_hits',
      'source_text_reads',
      'broad_target_expansion',
      'queue_mutations',
      'submitted_to_agent6',
    ]),
  },
  deuteronomy_continuity_observed: {
    artifact_json: inputs.deuteronomy_continuity_package_json,
    status: deuteronomy.status,
    exact_blocker_rows_still_blocked: deuteronomy.package_summary?.exact_blocker_rows_still_blocked,
    exact_blocker_occurrences_still_blocked: deuteronomy.package_summary?.exact_blocker_occurrences_still_blocked,
    reviewed_planning_rows: deuteronomy.package_summary?.reviewed_planning_rows,
    reviewed_planning_occurrences: deuteronomy.package_summary?.reviewed_planning_occurrences,
    next_executable_route_from_agent3: deuteronomy.package_summary?.next_executable_route_from_agent3,
  },
  external_lane_observed_only: {
    agent1_orot_missing_linkage_candidates: {
      artifact_json: inputs.agent1_orot_linkage_candidates_json,
      artifact_md: inputs.agent1_orot_linkage_candidates_md,
      owner: 'Agent 1',
      status: agent1Orot.boundary?.status,
      committed_by_agent3: false,
      row_payload_copied_here: false,
      counts: pick(agent1Orot.counts, [
        'input_rows',
        'missing_lexicon_linkage_rows',
        'missing_lexicon_linkage_occurrences',
        'mutation_rows_emitted',
        'source_rows_emitted',
        'lexicon_entry_ids_assigned',
      ]),
      bucket_counts: agent1Orot.counts?.bucket_counts || {},
      bucket_occurrences: agent1Orot.counts?.bucket_occurrences || {},
    },
  },
  validation_commands: [
    'node scripts/validate_agent3_usage_state.mjs',
    'node scripts/validate_agent3_definition_workbench_usage_collision_work_category_index.mjs',
    'node scripts/validate_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs',
    'node scripts/validate_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs',
    'node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json',
    'node scripts/validate_agent3_linkage_navigation_frontier_checkpoint.mjs',
  ],
  package_summary: {
    agent3_state_refreshed: true,
    reshit_locator_refresh_validated: true,
    deuteronomy_has_no_new_agent3_route: true,
    external_orot_linkage_packet_observed: true,
    next_agent3_action: 'wait_for_new_return_or_exact_workset; package only changed linkage/navigation evidence',
  },
  what_remains_blocked: [
    'Agent 3 usage/navigation state remains not Agent-6-accepted.',
    'Reshit route evidence remains concentrated on one route ID and is usage navigation only, not independent semantic authority.',
    'Agent 1 Orot missing-linkage candidates are external-lane evidence only and no lexicon_entry_id mutation is authorized here.',
    'Deuteronomy Agent 3 exact blockers remain blocked unless a later exact workset changes them.',
  ],
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'semantic arbitration',
    'route ranking',
    'visible answer selection',
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
    'lexicon_entry_id mutation',
  ],
};

fs.writeFileSync(resolve(outputJson), `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(resolve(outputMd), renderMarkdown(artifact));

console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);
console.log(
  `Agent 3 frontier checkpoint: usage rows ${artifact.agent3_usage_state.counts.usage_concordance_rows}; reshit locators ${artifact.reshit_occurrence_locator.counts.unique_locator_rows}; external Orot linkage rows ${artifact.external_lane_observed_only.agent1_orot_missing_linkage_candidates.counts.missing_lexicon_linkage_rows}`,
);

function renderMarkdown(artifact) {
  const state = artifact.agent3_usage_state.counts;
  const occurrence = artifact.reshit_occurrence_locator.counts;
  const provenance = artifact.reshit_provenance_locator.counts;
  const orot = artifact.external_lane_observed_only.agent1_orot_missing_linkage_candidates;
  const deut = artifact.deuteronomy_continuity_observed;
  return [
    '# Agent 3 Linkage Navigation Frontier Checkpoint - 2026-06-04',
    '',
    `Status: \`${artifact.status}\`.`,
    '',
    `Publication state: \`${artifact.publication_state}\`.`,
    '',
    'Boundary: Agent 3 usage/linkage/navigation checkpoint only. This package is not Definition authority, semantic arbitration, route ranking, answer selection, source/provenance acceptance, or public/runtime/publication support.',
    '',
    '## Agent 3 Usage State',
    '',
    `- Worker / QA state: \`${artifact.agent3_usage_state.status}\` / \`${artifact.agent3_usage_state.qa_acceptance_state}\`.`,
    `- Manager / acceptance owner: \`${artifact.agent3_usage_state.manager}\` / \`${artifact.agent3_usage_state.acceptance_owner}\`.`,
    `- Usage rows supported/candidate/weak: \`${state.usage_supported_rows}\` / \`${state.usage_candidate_rows}\` / \`${state.usage_weak_rows}\`.`,
    `- Selected rows/source refs/works: \`${state.selected_usage_rows}\` / \`${state.selected_source_refs}\` / \`${state.selected_works}\`.`,
    `- Reader-facing / route-payload / forbidden-authority hits: \`${state.occurrence_link_reader_facing_rows}\` / \`${state.occurrence_link_route_payload_field_hits}\` / \`${state.occurrence_link_forbidden_authority_field_hits}\`.`,
    `- Smoke failures: \`${state.smoke_failed_steps}\`.`,
    '',
    '## Reshit Navigation Refresh',
    '',
    `- Work/category source occurrence rows: \`${artifact.reshit_work_category_index.counts.source_occurrence_rows}\`.`,
    `- Occurrence locator rows / grouped rows: \`${occurrence.unique_locator_rows}\` / \`${occurrence.source_grouped_occurrence_rows}\`.`,
    `- Occurrence locator anchors/snippets: \`${occurrence.rows_with_local_work_anchor}\` / \`${occurrence.rows_with_phrase_context_snippet}\`.`,
    `- Provenance rows / license buckets / version sources: \`${provenance.source_locator_rows}\` / \`${provenance.license_index_rows}\` / \`${provenance.version_source_index_rows}\`.`,
    `- Reader-facing / route-payload / forbidden-authority hits: \`${occurrence.reader_facing_rows}\` / \`${occurrence.route_payload_field_hits}\` / \`${occurrence.forbidden_authority_field_hits}\`.`,
    '',
    '## Deuteronomy Continuity',
    '',
    `- Continuity package status: \`${deut.status}\`.`,
    `- Exact blocker rows / occurrences still blocked: \`${deut.exact_blocker_rows_still_blocked}\` / \`${deut.exact_blocker_occurrences_still_blocked}\`.`,
    `- Reviewed planning rows / occurrences: \`${deut.reviewed_planning_rows}\` / \`${deut.reviewed_planning_occurrences}\`.`,
    `- Next Agent 3 route: \`${deut.next_executable_route_from_agent3}\`.`,
    '',
    '## External Lane Observed Only',
    '',
    `- Agent 1 Orot missing linkage rows / occurrences: \`${orot.counts.missing_lexicon_linkage_rows}\` / \`${orot.counts.missing_lexicon_linkage_occurrences}\`.`,
    `- Agent 1 mutation/source/assigned rows: \`${orot.counts.mutation_rows_emitted}\` / \`${orot.counts.source_rows_emitted}\` / \`${orot.counts.lexicon_entry_ids_assigned}\`.`,
    `- Agent 3 copied row payload here: \`${orot.row_payload_copied_here}\`.`,
    `- Agent 3 committed Agent 1 packet here: \`${orot.committed_by_agent3}\`.`,
    '',
    '## Reviewed Inputs',
    '',
    ...artifact.reviewed_inputs.map((input) => `- \`${input.role}\`: \`${input.path}\` (${input.sha256}).`),
    '',
    '## Validation Commands',
    '',
    ...artifact.validation_commands.map((command) => `- \`${command}\``),
    '',
    '## Remaining Blocked',
    '',
    ...artifact.what_remains_blocked.map((item) => `- ${item}`),
    '',
    '## Not Accepted',
    '',
    ...artifact.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

function manifest(sourceInputs) {
  return Object.entries(sourceInputs).map(([role, inputPath]) => ({
    role,
    path: inputPath,
    sha256: sha256(inputPath),
    owner: role.startsWith('agent1_') ? 'Agent 1' : 'Agent 3',
  }));
}

function pick(source, keys) {
  const result = {};
  for (const key of keys) result[key] = source?.[key];
  return result;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(resolve(file), 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(file))).digest('hex');
}

function resolve(file) {
  return path.join(root, file);
}
