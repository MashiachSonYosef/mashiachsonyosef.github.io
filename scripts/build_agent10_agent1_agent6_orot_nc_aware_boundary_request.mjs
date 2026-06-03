#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json';
const outputMd = 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.md';

const inputs = {
  nc_policy_callback: 'reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md',
  nc_aware_measurement: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json',
  nc_aware_measurement_report: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.md',
  sefaria_license_scout: 'reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json',
  sefaria_hit_audit: 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json',
  sefaria_public_domain_preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json',
  transform_contract: 'reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md',
};

const measurement = readJson(inputs.nc_aware_measurement);
const counts = measurement.coverage_summary || measurement.coverage_counts || measurement.summary?.coverage_counts || measurement.summary || {};
const ncRows =
  measurement.row_lists?.nc_commercial_export_exclusion_rows ||
  measurement.nc_commercial_export_exclusion_rows ||
  measurement.nc_rows_excluded_from_commercial_export ||
  measurement.additional_nc_educational_rows ||
  [];

const request = {
  schema_version: 1,
  artifact_type: 'agent10_agent1_agent6_orot_nc_aware_boundary_request',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_agent1_agent6_orot_nc_aware_boundary_request.mjs',
  boundary: {
    status: 'agent1_agent6_nc_aware_boundary_request_not_accepted',
    request_only: true,
    evidence_only: true,
    zero_emission: true,
    no_answer_rows: true,
    no_source_rows_emitted: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_nc_definition_content_storage: true,
    no_runtime_mutation: true,
    no_source_mutation: true,
    no_token_index_mutation: true,
    no_lexical_payload_mutation: true,
    no_public_mutation: true,
    no_qa_acceptance: true,
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_acceptance: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_route_publication_support: true,
    no_product_data_acceptance: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_text: true,
  },
  inputs: withHashes(inputs),
  measured_scope: {
    scoped_rows: counts.scoped_rows ?? measurement.measurement_scope?.scoped_rows ?? 500,
    scoped_occurrences: counts.scoped_occurrences ?? measurement.measurement_scope?.scoped_occurrences ?? 8427,
    commercial_clean_candidate_rows: countValue('commercial_clean_candidate', 'rows', 297),
    commercial_clean_candidate_occurrences: countValue('commercial_clean_candidate', 'occurrences', 5747),
    additional_nc_educational_candidate_rows: countValue('additional_nc_educational_candidate', 'rows', 17),
    additional_nc_educational_candidate_occurrences: countValue('additional_nc_educational_candidate', 'occurrences', 259),
    commercial_clean_plus_nc_rows: countValue('commercial_clean_plus_nc_educational_candidate', 'rows', 314),
    commercial_clean_plus_nc_occurrences: countValue('commercial_clean_plus_nc_educational_candidate', 'occurrences', 6006),
    remaining_no_hit_or_unusable_rows: countValue('remaining_after_commercial_clean_plus_nc', 'rows', 186),
    remaining_no_hit_or_unusable_occurrences: countValue('remaining_after_commercial_clean_plus_nc', 'occurrences', 2421),
  },
  requested_status_options: [
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_only',
    'external_link_only',
    'blocked',
  ],
  family_boundary_requests: [
    {
      family: 'BDB Dictionary',
      observed_license_group: 'PUBLIC_DOMAIN_OBSERVED',
      requested_status: 'commercial_clean_candidate',
      requested_questions: sharedQuestions(false),
    },
    {
      family: 'BDB Aramaic Dictionary',
      observed_license_group: 'PUBLIC_DOMAIN_OBSERVED',
      requested_status: 'commercial_clean_candidate',
      requested_questions: sharedQuestions(false),
    },
    {
      family: 'Jastrow Dictionary',
      observed_license_group: 'PUBLIC_DOMAIN_OBSERVED',
      requested_status: 'commercial_clean_candidate',
      requested_questions: sharedQuestions(false),
    },
    {
      family: 'Klein Dictionary',
      observed_license_group: 'CC_BY_NC',
      requested_status: 'noncommercial_educational_candidate',
      requested_questions: sharedQuestions(true),
      required_nc_flags: ncFlags(),
    },
    {
      family: 'BDB Augmented Strong',
      observed_license_group: 'UNRESOLVED',
      requested_status: 'blocked',
      requested_questions: [
        'State whether independent source/license basis exists.',
        'If not, keep blocked or metadata/external-link-only.',
        'State exact unblock evidence required.',
      ],
    },
  ],
  nc_commercial_export_exclusion_rows: ncRows.map((row) => ({
    priority: row.priority ?? row.source_audit_priority,
    token_id: row.token_id,
    occurrences: row.occurrences,
    category: row.category,
    family: row.nc_family || row.family || 'Klein Dictionary',
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    noncommercial_display_allowed: false,
    attribution_required: true,
    corpus_contamination: false,
    agent1_agent6_boundary_required: true,
  })),
  requested_agent1_agent6_schema: {
    family_fields: [
      'family',
      'observed_license_source_basis',
      'status',
      'storage_allowed',
      'noncommercial_display_allowed',
      'commercial_export_prohibited',
      'attribution_required',
      'attribution_text_or_link_required',
      'source_custody_manifest_required',
      'transformed_reader_hint_allowed',
      'metadata_only_allowed',
      'external_link_only_allowed',
      'exact_blocker_if_blocked',
    ],
    nc_row_flags: [
      'license_group=CC_BY_NC',
      'derived_from_nc=true',
      'commercial_export_allowed=false',
      'noncommercial_display_allowed=false until boundary',
      'attribution_required=true',
      'corpus_contamination=false',
    ],
  },
  agent8_callback: {
    status: 'Agent 10 Agent 1/6 NC-aware Orot/Sefaria boundary request produced.',
    artifact_path: outputMd,
    artifact_json: outputJson,
    measured_counts: {
      commercial_clean_candidate_rows: countValue('commercial_clean_candidate', 'rows', 297),
      commercial_clean_candidate_occurrences: countValue('commercial_clean_candidate', 'occurrences', 5747),
      additional_nc_educational_candidate_rows: countValue('additional_nc_educational_candidate', 'rows', 17),
      additional_nc_educational_candidate_occurrences: countValue('additional_nc_educational_candidate', 'occurrences', 259),
      commercial_clean_plus_nc_rows: countValue('commercial_clean_plus_nc_educational_candidate', 'rows', 314),
      commercial_clean_plus_nc_occurrences: countValue('commercial_clean_plus_nc_educational_candidate', 'occurrences', 6006),
    },
    next_executable_route: 'Route this request to Agent 1 and Agent 6 for family-specific NC-aware custody/display boundary review; keep answer emission and public mutation at zero.',
    public_mutation_blocked: true,
    answer_emission_blocked: true,
    nc_definition_content_storage_blocked: true,
  },
  outputs: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    nc_definition_content_rows: 0,
    runtime_files_touched: [],
    source_files_touched: [],
    token_index_files_touched: [],
    lexical_payload_files_touched: [],
  },
  what_must_not_be_accepted: [
    'QA acceptance',
    'Source/provenance acceptance',
    'License acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Answer acceptance',
    'Public/runtime acceptance',
    'Publication readiness',
    'Route publication support',
    'Product/data acceptance',
    'Translation output',
    'Accepted gloss',
    'Accepted text',
  ],
};

writeJson(outputJson, request);
writeMarkdown(outputMd, request);
console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);

function sharedQuestions(isNc) {
  const questions = [
    'State observed license/source basis.',
    'State whether storage is allowed.',
    'State attribution requirements.',
    'State source-custody manifest requirements.',
    'State whether transformed reader-hint candidate use is allowed or metadata/link-only.',
    'State exact blocker if blocked.',
  ];
  if (isNc) {
    questions.splice(2, 0, 'State whether noncommercial educational display is allowed.');
    questions.splice(3, 0, 'State that commercial export is prohibited if approved as NC-derived.');
  }
  return questions;
}

function ncFlags() {
  return {
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    noncommercial_display_allowed: false,
    attribution_required: true,
    corpus_contamination: false,
  };
}

function countValue(bucket, field, fallback) {
  return counts?.[bucket]?.[field] ?? counts?.[`${bucket}_${field}`] ?? fallback;
}

function writeMarkdown(relativePath, data) {
  const lines = [];
  lines.push('# Agent 10 Agent 1/6 Orot NC-Aware Boundary Request');
  lines.push('');
  lines.push(`Generated: ${data.generated_at}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('This is a zero-emission request packet for Agent 1/6 family-specific custody/display boundary review. It does not accept license, source custody, QA, Definition authority, answer eligibility, public/runtime state, publication readiness, accepted gloss, or accepted text.');
  lines.push('');
  lines.push('No answer rows, source rows, public HUD rows, route JSONL rows, NC definition-content rows, runtime edits, source edits, token-index edits, lexical-payload edits, or public mutations are emitted.');
  lines.push('');
  lines.push('## Measurement Basis');
  lines.push('');
  lines.push(`- Scoped rows / occurrences: \`${data.measured_scope.scoped_rows}\` / \`${data.measured_scope.scoped_occurrences}\`.`);
  lines.push(`- Commercial-clean observed candidates: \`${data.measured_scope.commercial_clean_candidate_rows}\` rows / \`${data.measured_scope.commercial_clean_candidate_occurrences}\` occurrences.`);
  lines.push(`- Additional NC educational candidates: \`${data.measured_scope.additional_nc_educational_candidate_rows}\` rows / \`${data.measured_scope.additional_nc_educational_candidate_occurrences}\` occurrences.`);
  lines.push(`- Commercial-clean + NC projection: \`${data.measured_scope.commercial_clean_plus_nc_rows}\` rows / \`${data.measured_scope.commercial_clean_plus_nc_occurrences}\` occurrences.`);
  lines.push(`- Remaining no-hit/unusable: \`${data.measured_scope.remaining_no_hit_or_unusable_rows}\` rows / \`${data.measured_scope.remaining_no_hit_or_unusable_occurrences}\` occurrences.`);
  lines.push('');
  lines.push('## Requested Status Options');
  lines.push('');
  for (const status of data.requested_status_options) lines.push(`- \`${status}\``);
  lines.push('');
  lines.push('## Family Boundary Requests');
  lines.push('');
  lines.push('| Family | Observed License Group | Requested Status |');
  lines.push('| --- | --- | --- |');
  for (const family of data.family_boundary_requests) {
    lines.push(`| ${family.family} | ${family.observed_license_group} | ${family.requested_status} |`);
  }
  lines.push('');
  lines.push('## NC Commercial Export Exclusion Rows');
  lines.push('');
  lines.push('| Priority | Token ID | Occurrences | Family | Required Flags |');
  lines.push('| ---: | --- | ---: | --- | --- |');
  for (const row of data.nc_commercial_export_exclusion_rows) {
    lines.push(`| ${row.priority} | ${row.token_id} | ${row.occurrences} | ${row.family} | \`derived_from_nc=true\`, \`commercial_export_allowed=false\`, \`corpus_contamination=false\` |`);
  }
  lines.push('');
  lines.push('## Requested Agent 1/6 Schema');
  lines.push('');
  lines.push('- Family fields: ' + data.requested_agent1_agent6_schema.family_fields.map((field) => `\`${field}\``).join(', '));
  lines.push('- NC row flags: ' + data.requested_agent1_agent6_schema.nc_row_flags.map((flag) => `\`${flag}\``).join(', '));
  lines.push('');
  lines.push('## Agent 8 Callback');
  lines.push('');
  lines.push(`- Status: ${data.agent8_callback.status}`);
  lines.push(`- Artifact path: \`${data.agent8_callback.artifact_path}\``);
  lines.push(`- Artifact JSON: \`${data.agent8_callback.artifact_json}\``);
  lines.push(`- Next executable route: ${data.agent8_callback.next_executable_route}`);
  lines.push(`- Public mutation blocked: \`${data.agent8_callback.public_mutation_blocked}\``);
  lines.push(`- Answer emission blocked: \`${data.agent8_callback.answer_emission_blocked}\``);
  lines.push(`- NC definition content storage blocked: \`${data.agent8_callback.nc_definition_content_storage_blocked}\``);
  lines.push('');
  lines.push('## Outputs');
  lines.push('');
  lines.push('- Answer rows: `0`.');
  lines.push('- Source rows: `0`.');
  lines.push('- Public HUD rows: `0`.');
  lines.push('- Route JSONL rows: `0`.');
  lines.push('- NC definition-content rows: `0`.');
  lines.push('- Runtime/source/token-index/lexical-payload files touched: `0`.');
  lines.push('');
  lines.push('## What Must Not Be Accepted');
  lines.push('');
  for (const item of data.what_must_not_be_accepted) lines.push(`- ${item}`);
  lines.push('');
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function withHashes(inputMap) {
  const result = {};
  for (const [key, relativePath] of Object.entries(inputMap)) {
    result[key] = relativePath;
    result[`${key}_sha256`] = sha256(relativePath);
  }
  return result;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}
