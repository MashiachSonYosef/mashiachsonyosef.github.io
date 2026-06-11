#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const currentAgent1ThreadId = '019e975d-dc9f-7020-a7c8-885d083a837e';
const outputJson = 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json';
const outputMd = 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.md';
const agent1PacketPath = 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json';
const agent1ContinuationPath = 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-continuation-2026-06-05.json';

const agent1Packet = readJson(agent1PacketPath);
const continuation = readJson(agent1ContinuationPath);
const requiredLanes = [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
];
const requiredAgent1Fields = [
  'source_family',
  'source_name',
  'license_label',
  'license_lane',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'source_url_or_citation',
  'agent6_boundary_required',
  'row_subset_id',
  'evidence_path',
  'corpus_contamination',
];

const sourceFamilies = agent1Packet.source_families || [];
const missingFieldRows = [];
for (const row of sourceFamilies) {
  const missing = requiredAgent1Fields.filter((field) => row[field] === undefined || row[field] === null || row[field] === '');
  if (missing.length) missingFieldRows.push({ row_subset_id: row.row_subset_id || null, missing });
}

const commercialCleanFamilies = sourceFamilies
  .filter((row) => row.license_lane === 'commercial_clean_candidate')
  .map((row) => row.row_subset_id);
const ncFamilies = sourceFamilies
  .filter((row) => row.license_lane === 'noncommercial_educational_candidate')
  .map((row) => row.row_subset_id);
const blockedFamilies = sourceFamilies
  .filter((row) => row.license_lane === 'blocked_or_needs_review')
  .map((row) => row.row_subset_id);
const metadataOnlyFamilies = sourceFamilies
  .filter((row) => row.license_lane === 'metadata_or_link_only')
  .map((row) => row.row_subset_id);

const packet = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_excluded_row_reaudit_consumption_prep',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  current_agent1_thread_id: currentAgent1ThreadId,
  archived_agent1_policy: 'old Agent 1 is archived/do-not-use; consume only this current classified source-lane packet lineage unless superseded by current Agent 1.',
  target: 'old-dictionary-excluded-row-license-lane-reaudit',
  classified_input_status: missingFieldRows.length === 0 ? 'classified_agent1_input_present_but_no_transform_emitted' : 'blocked_missing_required_agent1_fields',
  upstream_artifacts: {
    agent1_classified_packet: agent1PacketPath,
    agent1_continuation: agent1ContinuationPath,
  },
  required_agent1_fields: requiredAgent1Fields,
  required_lanes: requiredLanes,
  observed_counts: {
    audited_rows: agent1Packet.evidence_counts?.audited_rows,
    audited_occurrences: agent1Packet.evidence_counts?.audited_occurrences,
    source_family_count: sourceFamilies.length,
    commercial_clean_candidate_source_families: commercialCleanFamilies.length,
    noncommercial_educational_candidate_source_families: ncFamilies.length,
    metadata_or_link_only_source_families: metadataOnlyFamilies.length,
    blocked_or_needs_review_source_families: blockedFamilies.length,
  },
  lane_partition: {
    commercial_clean_candidate: {
      row_subset_ids: commercialCleanFamilies,
      transform_action_once_classified: 'prepare nonpublic metadata-only definition/lemma/reader-hint transform inputs only after exact Agent 6 row/subset boundary; do not emit candidate text, answer rows, accepted gloss/text, or public/runtime rows.',
    },
    noncommercial_educational_candidate: {
      row_subset_ids: ncFamilies,
      required_flags: {
        derived_from_nc: true,
        commercial_export_allowed: false,
        attribution_required: true,
        corpus_contamination: false,
      },
      transform_action_once_classified: 'keep NC educational lane separate; prepare only noncommercial metadata partition after exact Agent 6 NC boundary; never merge into commercial_clean_candidate and never authorize commercial export.',
    },
    metadata_or_link_only: {
      row_subset_ids: metadataOnlyFamilies,
      transform_action_once_classified: 'metadata/link-only partition only; no definition text, accepted gloss/text, answer rows, or public/runtime mutation.',
    },
    blocked_or_needs_review: {
      row_subset_ids: blockedFamilies,
      transform_action_once_classified: 'no transform; keep blocked until independent source/license/custody basis and required Agent 6 boundary exist.',
    },
  },
  exact_blocker_if_not_classified: missingFieldRows.length
    ? {
        id: 'missing_current_agent1_old_dictionary_excluded_row_required_fields',
        missing_rows: missingFieldRows,
      }
    : {
        id: 'none_for_source_family_lane_classification',
        note: 'Current Agent 1 source-family lane classification is present. Transform remains stopped by row/subset Agent 6 boundary and no candidate-text authority.',
      },
  current_transform_blockers: [
    'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
    'answer_text_not_stored_by_agent1_packet',
    'missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform',
    'blocked_or_needs_review::bdb-augmented-strong_missing_independent_source_license_custody_basis',
    'noncommercial_educational_candidate::klein-dictionary_no_commercial_export_authorization',
  ],
  handoff_owner: 'Agent 2 prepares this consumption contract; Agent 10 release owner consumes handoff; Agent 6 supplies exact row/subset boundary before any candidate-text/package/display behavior.',
  stop_condition: 'Stop at this consumption-prep packet. Do not transform old/new/missed dictionary rows into candidate text, Definition content, answer rows, accepted gloss/text, or public/runtime output until current Agent 1 row/subset fields plus exact Agent 6 boundary authorize the specific nonpublic transform lane.',
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
    nc_commercial_authorization_rows: 0,
  },
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No NC commercial authorization',
  ],
};

assertPacket(packet, agent1Packet, continuation);
writeJson(outputJson, packet);
writeMd(outputMd, packet);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertPacket(packet, agent1Packet, continuation) {
  if (agent1Packet.artifact_type !== 'agent1_old_dictionary_excluded_row_license_lane_reaudit') throw new Error('Agent 1 packet artifact_type mismatch');
  if (continuation.artifact_type !== 'agent1_old_dictionary_excluded_row_license_lane_reaudit_continuation') throw new Error('Agent 1 continuation artifact_type mismatch');
  if (packet.observed_counts.audited_rows !== 500) throw new Error('audited row count mismatch');
  if (packet.observed_counts.commercial_clean_candidate_source_families !== 3) throw new Error('commercial-clean source family count mismatch');
  if (packet.observed_counts.noncommercial_educational_candidate_source_families !== 1) throw new Error('NC source family count mismatch');
  if (packet.observed_counts.blocked_or_needs_review_source_families !== 1) throw new Error('blocked source family count mismatch');
  for (const lane of requiredLanes) {
    if (!(lane in packet.lane_partition)) throw new Error(`missing lane partition: ${lane}`);
  }
  const klein = sourceFamilies.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  if (!klein || klein.license_lane !== 'noncommercial_educational_candidate') throw new Error('Klein must remain NC lane');
  if (klein.derived_from_nc !== true || klein.commercial_export_allowed !== false || klein.attribution_required !== true || klein.corpus_contamination !== false) {
    throw new Error('Klein NC flags mismatch');
  }
  for (const value of Object.values(packet.zero_output_counts)) {
    if (value !== 0) throw new Error('zero_output_counts must remain 0');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, packet) {
  const lines = [
    '# Agent 2 Old Dictionary Excluded-Row Reaudit Consumption Prep - 2026-06-05',
    '',
    'target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition',
    '',
    `## Target: ${packet.target}`,
    '',
    '## Required Agent 1 Fields',
    '',
    ...packet.required_agent1_fields.map((field) => `- \`${field}\``),
    '',
    '## Transform Action Once Classified',
    '',
    '- `commercial_clean_candidate`: prepare nonpublic metadata-only transform inputs only after exact Agent 6 row/subset boundary; no candidate text or public/answer rows.',
    '- `noncommercial_educational_candidate`: preserve NC educational lane with `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`; never merge into commercial-clean.',
    '- `metadata_or_link_only`: metadata/link-only partition; no definition text or accepted gloss/text.',
    '- `blocked_or_needs_review`: no transform until missing source/license/custody basis and Agent 6 boundary exist.',
    '',
    '## Exact Blocker If Not Classified',
    '',
    `- ${packet.exact_blocker_if_not_classified.id}`,
    '',
    '## Current Transform Blockers',
    '',
    ...packet.current_transform_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Handoff Owner',
    '',
    packet.handoff_owner,
    '',
    '## Stop Condition',
    '',
    packet.stop_condition,
    '',
    '## Zero Output',
    '',
    '- Definition/lemma/reader-hint/candidate-text/answer/public/runtime/accepted-text rows: `0`.',
    '',
    '## Boundary',
    '',
    packet.non_acceptance_boundary.join('; '),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
