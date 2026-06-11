#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = getArg('--output') || 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json';
const outputMd = getArg('--report') || 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.md';

const inputs = {
  agent1_reaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  agent1_export_partitions: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
  agent6_verdict: 'reports/agent6-old-dictionary-license-lane-planning-verdict-2026-06-04.md',
  agent10_consumption: 'reports/agent10-agent6-old-dictionary-license-lane-verdict-consumption-2026-06-04.json',
  current_handoff_bundle: 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
};

for (const input of Object.values(inputs)) requirePath(input);

const reaudit = readJson(inputs.agent1_reaudit);
const partitions = readJson(inputs.agent1_export_partitions);
const consumption = readJson(inputs.agent10_consumption);
const bundle = readJson(inputs.current_handoff_bundle);

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_lane_planning_intake',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: 'old_dictionary_lane_planning_evidence_intaked_nonpublic_only',
  inputs,
  disposition: consumption.disposition,
  accepted_scope: consumption.accepted_scope,
  planning_counts: consumption.primary_planning_counts,
  source_family_lane_planning_evidence: consumption.source_family_lane_planning_evidence,
  supplemental_partition_planning_counts: consumption.supplemental_partition_planning_counts,
  agent1_evidence_status: {
    reaudit_artifact_type: reaudit.artifact_type,
    reaudit_status: reaudit.status,
    reaudit_workset: reaudit.workset,
    export_partition_artifact_type: partitions.artifact_type,
    export_partition_status: partitions.status,
    export_partition_workset: partitions.workset,
  },
  blocker_update: {
    prior_blocker_replaced: 'source_lane_assignment_missing_before_agent1_reaudit',
    replacement_status: consumption.blocker_effect?.missing_agent1_old_dictionary_excluded_row_license_lane_assignment,
    remaining_exact_blocker: 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    candidate_text_consumption_allowed_now: false,
    candidate_text_export_allowed_now: false,
    definition_content_storage_allowed_now: false,
    answer_eligible_now: false,
    public_emit_allowed_now: false,
    commercial_export_allowed_now: false,
    nc_public_display_allowed_now: false,
    nc_commercial_authorization_now: false,
  },
  next_agent2_pipeline_effect: {
    may_use_as_nonpublic_planning_context: true,
    may_generate_candidate_text_rows: false,
    may_generate_lane_partition_planning_rows: true,
    may_rerun_orot_missed_dictionary_candidate_pipeline_without_changed_linkage: false,
    required_next_input_for_candidate_generation: [
      'changed source-family/linkage/dictionary evidence for the 168 Orot unmatched rows',
      'row/subset package proposing candidate text consumption or export',
      'exact Agent 6 boundary for that row/subset package before any text/storage/public/answer use',
    ],
  },
  current_handoff_context: {
    bundle: inputs.current_handoff_bundle,
    runnable_pipelines: bundle.current_counts?.runnable_pipelines,
    validator_only_checks: bundle.current_counts?.validator_only_checks,
    orot_missed_dictionary_unmatched: bundle.current_counts?.orot_missed_dictionary_unmatched,
  },
  zero_output_counts: {
    candidate_rows_emitted: 0,
    candidate_occurrences_emitted: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    source_rows_emitted: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_edits: 0,
    source_edits: 0,
    token_index_edits: 0,
    lexical_payload_edits: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0,
  },
  what_must_not_be_accepted: [
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
    'candidate text consumption/export',
    'commercial export permission',
    'NC commercial authorization',
  ],
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertArtifact(value) {
  if (value.disposition !== 'WARN-ACCEPTED') throw new Error('expected Agent 6 WARN-ACCEPTED disposition');
  if (value.accepted_scope !== 'nonpublic_old_dictionary_source_family_license_lane_and_lane_partition_planning_evidence_only') {
    throw new Error('unexpected accepted scope');
  }
  if (value.planning_counts?.audited_rows !== 500 || value.planning_counts?.audited_occurrences !== 8427) {
    throw new Error('primary planning counts mismatch');
  }
  if (value.planning_counts?.next_missed_rows !== 50 || value.planning_counts?.next_missed_occurrences !== 1193) {
    throw new Error('next missed counts mismatch');
  }
  const lanes = value.source_family_lane_planning_evidence || {};
  if (lanes['Jastrow Dictionary']?.license_lane !== 'commercial_clean_candidate') throw new Error('Jastrow lane mismatch');
  if (lanes['BDB Dictionary']?.license_lane !== 'commercial_clean_candidate') throw new Error('BDB lane mismatch');
  if (lanes['BDB Aramaic Dictionary']?.license_lane !== 'commercial_clean_candidate') throw new Error('BDB Aramaic lane mismatch');
  if (lanes['Klein Dictionary']?.license_lane !== 'noncommercial_educational_candidate') throw new Error('Klein lane mismatch');
  if (lanes['Klein Dictionary']?.derived_from_nc !== true) throw new Error('Klein NC flag missing');
  if (lanes['Klein Dictionary']?.commercial_export_allowed !== false) throw new Error('Klein commercial_export_allowed must be false');
  if (lanes['BDB Augmented Strong']?.license_lane !== 'blocked_or_needs_review') throw new Error('BDB Augmented Strong lane mismatch');
  if (value.supplemental_partition_planning_counts?.commercial_clean_candidate?.rows !== 500) throw new Error('commercial partition count mismatch');
  if (value.supplemental_partition_planning_counts?.noncommercial_educational_candidate?.rows !== 214) throw new Error('NC partition count mismatch');
  if (value.current_handoff_context?.orot_missed_dictionary_unmatched !== 168) throw new Error('Orot unmatched count mismatch');
  for (const [key, count] of Object.entries(value.zero_output_counts)) {
    if (count !== 0) throw new Error(`zero_output_counts.${key} must be 0`);
  }
}

function getArg(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? cleanRelativePath(found.slice(prefix.length)) : null;
}

function requirePath(relativePath) {
  if (!fs.existsSync(path.join(root, cleanRelativePath(relativePath)))) throw new Error(`missing path ${relativePath}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(file)), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, cleanRelativePath(file)), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, value) {
  const rows = Object.entries(value.source_family_lane_planning_evidence)
    .map(([name, row]) => `- ${name}: \`${row.license_lane}\`, ${row.rows} rows / ${row.occurrences} occurrences`)
    .join('\n');
  const partitionRows = Object.entries(value.supplemental_partition_planning_counts)
    .map(([lane, row]) => `- \`${lane}\`: ${row.source_family_count} source families, ${row.rows} rows / ${row.occurrences} occurrences`)
    .join('\n');
  const lines = [
    '# Agent 2 Old-Dictionary Lane Planning Intake',
    '',
    'Date: 2026-06-04',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    '',
    '## Status',
    '',
    `Status: \`${value.status}\``,
    `Disposition consumed: \`${value.disposition}\` for \`${value.accepted_scope}\`.`,
    '',
    'This is an Agent 2 non-public planning-intake artifact. It does not emit candidate text, definition content, answers, public rows, route JSONL, route shards, or runtime/source/token-index/lexical edits.',
    '',
    '## Inputs',
    '',
    ...Object.entries(value.inputs).map(([key, input]) => `- ${key}: \`${input}\``),
    '',
    '## Primary Planning Counts',
    '',
    `- Audited rows / occurrences: ${value.planning_counts.audited_rows} / ${value.planning_counts.audited_occurrences}`,
    `- Public-domain-observed rows / occurrences: ${value.planning_counts.public_domain_observed_rows} / ${value.planning_counts.public_domain_observed_occurrences}`,
    `- Blocked-only / unresolved rows / occurrences: ${value.planning_counts.blocked_only_non_public_domain_or_unresolved_rows} / ${value.planning_counts.blocked_only_non_public_domain_or_unresolved_occurrences}`,
    `- No-Sefaria-hit rows / occurrences: ${value.planning_counts.no_sefaria_hit_rows} / ${value.planning_counts.no_sefaria_hit_occurrences}`,
    `- Next missed rows / occurrences: ${value.planning_counts.next_missed_rows} / ${value.planning_counts.next_missed_occurrences}`,
    '',
    '## Source-Family Lane Planning Evidence',
    '',
    rows,
    '',
    '## Supplemental Lane Partitions',
    '',
    partitionRows,
    '',
    '## Blocker Update',
    '',
    `- Replaced stale blocker: \`${value.blocker_update.stale_blocker_replaced}\``,
    `- Replacement status: \`${value.blocker_update.replacement_status}\``,
    `- Remaining exact blocker: \`${value.blocker_update.remaining_exact_blocker}\``,
    '',
    'Candidate text consumption/export/storage remains blocked. A changed row/subset package and exact Agent 6 boundary are required before any definition/reader-hint text, answer eligibility, public emit, route write, commercial export, or NC public/commercial use.',
    '',
    '## Zero Counters',
    '',
    ...Object.entries(value.zero_output_counts).map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Non-Acceptance Boundary',
    '',
    `No ${value.what_must_not_be_accepted.join(', no ')} is claimed.`,
    '',
  ];
  fs.writeFileSync(path.join(root, cleanRelativePath(file)), `${lines.join('\n')}`);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
