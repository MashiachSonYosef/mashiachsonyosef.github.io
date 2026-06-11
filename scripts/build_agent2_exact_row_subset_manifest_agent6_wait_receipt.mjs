#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json';
const manifestValidationPath = 'reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json';
const boundaryPacketPath = 'reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json';
const deliveryProofPath = 'reports/agent10-agent6-old-dictionary-exact-row-subset-manifest-delivery-proof-2026-06-05.json';
const outputPath = 'reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.md';

const manifest = readJson(manifestPath);
const manifestValidation = readJson(manifestValidationPath);
const boundaryPacket = readJson(boundaryPacketPath);
const deliveryProof = readJson(deliveryProofPath);

assertInputs(manifest, manifestValidation, boundaryPacket, deliveryProof);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_exact_row_subset_manifest_agent6_wait_receipt',
  generated_at: '2026-06-05T23:59:59.500Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary exact row-subset manifest Agent6 wait receipt',
  status: 'agent1_exact_row_subset_manifest_consumed_as_nonpublic_lane_planning_evidence_waiting_agent6_verdict',
  inputs: {
    agent1_manifest: manifestPath,
    agent1_manifest_validation: manifestValidationPath,
    agent10_agent6_boundary_packet: boundaryPacketPath,
    agent10_agent6_delivery_proof: deliveryProofPath,
    missing_agent6_verdict: 'reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json',
  },
  manifest_counts: {
    subset_count: manifest.manifest_counts.subset_count,
    audited_rows: manifest.manifest_counts.audited_rows,
    audited_occurrences: manifest.manifest_counts.audited_occurrences,
    manifest_token_id_count: manifest.manifest_counts.manifest_token_id_count,
    unique_manifest_token_id_count: manifest.manifest_counts.unique_manifest_token_id_count,
    duplicate_token_id_count: manifest.manifest_counts.duplicate_token_id_count,
    total_rows_represented: manifest.manifest_counts.total_rows_represented,
    total_occurrences_represented: manifest.manifest_counts.total_occurrences_represented,
  },
  lane_bucket_counts: {
    commercial_clean_only_rows: manifest.manifest_counts.commercial_clean_only_rows,
    commercial_clean_plus_nc_rows: manifest.manifest_counts.commercial_clean_plus_nc_rows,
    commercial_clean_plus_blocked_rows: manifest.manifest_counts.commercial_clean_plus_blocked_rows,
    triple_overlap_rows: manifest.manifest_counts.triple_overlap_rows,
    nc_only_rows: manifest.manifest_counts.nc_only_rows,
    metadata_or_link_only_rows: manifest.manifest_counts.metadata_or_link_only_rows,
    blocked_review_only_rows: manifest.manifest_counts.blocked_review_only_rows,
    no_source_hit_rows: manifest.manifest_counts.no_source_hit_rows,
  },
  subset_summaries: manifest.subset_manifests.map((subset) => ({
    bucket_id: subset.bucket_id,
    row_subset_id: subset.row_subset_id,
    classification_lanes: subset.classification_lanes,
    row_count: subset.row_count,
    occurrence_count: subset.occurrence_count,
    token_ids_sha256: subset.token_ids_sha256,
    exact_blocker: subset.exact_blocker,
  })),
  delivery_state: {
    delivered_to_agent6: true,
    delivery_submission_id: deliveryProof.delivery.submission_id,
    agent6_target: deliveryProof.delivery.agent6_target,
    requested_boundary: deliveryProof.review_scope.requested_boundary,
    agent6_verdict_present_now: false,
  },
  zero_output_counts: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    candidate_text_export_rows: 0,
    definition_content_rows_now: 0,
    lemma_content_rows_now: 0,
    reader_hint_content_rows_now: 0,
    answer_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    public_runtime_mutation: 0,
    route_jsonl_rows_now: 0,
    route_shard_writes: 0,
    accepted_text_rows_now: 0,
    source_license_legal_acceptance: 0,
    commercial_export_authorization: 0,
    release_actions: 0,
  },
  exact_blocker: 'missing_agent6_old_dictionary_exact_row_subset_manifest_boundary_verdict_before_agent2_transform_candidate_text_definition_lemma_reader_hint_answer_public_runtime_route_export_or_release_use',
  handoff_owner: 'Agent 10/Agent 6 for exact row-subset manifest verdict; Agent 2 remains no-output until verdict exists.',
  stop_condition: 'Stop at Agent2 wait receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No answer eligibility',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate text export',
    'No definition/lemma/reader-hint content storage',
    'No commercial export authorization',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(manifest, manifestValidation, boundaryPacket, deliveryProof) {
  if (manifest.artifact_type !== 'agent1_old_dictionary_exact_row_subset_manifest') throw new Error('Agent1 manifest artifact_type mismatch');
  if (manifest.status !== 'exact_row_subset_manifest_recorded_zero_output_no_acceptance') throw new Error('Agent1 manifest status mismatch');
  if (manifest.manifest_counts.subset_count !== 8) throw new Error('subset count mismatch');
  if (manifest.manifest_counts.audited_rows !== 500) throw new Error('audited rows mismatch');
  if (manifest.manifest_counts.audited_occurrences !== 8427) throw new Error('audited occurrences mismatch');
  if (manifest.manifest_counts.allowed_transform_rows_now !== 0) throw new Error('manifest transform rows must be 0');
  if (manifest.manifest_counts.candidate_text_rows_now !== 0) throw new Error('manifest candidate text rows must be 0');
  if (manifestValidation.ok !== true) throw new Error('manifest validation result must be ok');
  if (boundaryPacket.artifact_type !== 'agent10_agent6_ready_old_dictionary_exact_row_subset_manifest_boundary_packet') throw new Error('boundary packet artifact_type mismatch');
  if (boundaryPacket.manifest_counts.audited_rows !== manifest.manifest_counts.audited_rows) throw new Error('boundary packet rows mismatch');
  if (boundaryPacket.requested_carry_forward.agent2_transform_allowed_now !== false) throw new Error('boundary packet transform must be blocked');
  if (deliveryProof.artifact_type !== 'agent10_agent6_old_dictionary_exact_row_subset_manifest_delivery_proof') throw new Error('delivery proof artifact_type mismatch');
  if (deliveryProof.review_scope.rows !== manifest.manifest_counts.audited_rows) throw new Error('delivery proof rows mismatch');
  if (deliveryProof.zero_counters.agent2_transform_rows !== 0) throw new Error('delivery proof transform rows must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Exact Row-Subset Manifest Agent6 Wait Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | rows | occurrences | subsets | exact blocker | stop condition |',
    '| --- | ---: | ---: | ---: | --- | --- |',
    `| ${value.target} | ${value.manifest_counts.audited_rows} | ${value.manifest_counts.audited_occurrences} | ${value.manifest_counts.subset_count} | \`${value.exact_blocker}\` | ${value.stop_condition} |`,
    '',
    '## Lane Buckets',
    '',
    `- Commercial clean only rows: ${value.lane_bucket_counts.commercial_clean_only_rows}.`,
    `- Commercial clean plus NC rows: ${value.lane_bucket_counts.commercial_clean_plus_nc_rows}.`,
    `- Commercial clean plus blocked rows: ${value.lane_bucket_counts.commercial_clean_plus_blocked_rows}.`,
    `- Triple overlap rows: ${value.lane_bucket_counts.triple_overlap_rows}.`,
    `- NC only rows: ${value.lane_bucket_counts.nc_only_rows}.`,
    `- Metadata/link-only rows: ${value.lane_bucket_counts.metadata_or_link_only_rows}.`,
    `- Blocked-review only rows: ${value.lane_bucket_counts.blocked_review_only_rows}.`,
    `- No source hit rows: ${value.lane_bucket_counts.no_source_hit_rows}.`,
    '',
    '## Delivery State',
    '',
    `- Delivered to Agent6: \`${value.delivery_state.delivered_to_agent6}\`.`,
    `- Agent6 verdict present now: \`${value.delivery_state.agent6_verdict_present_now}\`.`,
    `- Handoff owner: ${value.handoff_owner}`,
    '',
    '## Zero Output',
    '',
    '- Transform/candidate/export/definition/lemma/reader-hint/answer/public/route/runtime/accepted/commercial-export/release rows: 0.',
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
