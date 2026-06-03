#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.json';
const outputMd = 'reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.md';

const inputs = {
  agent6_final_verdict: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json',
  agent6_final_verdict_report: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.md',
  agent1_family_boundary: 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json',
  agent10_boundary_request: 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json',
  agent2_measurement: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json',
  oracle9_nc_policy: 'reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md',
};

const verdict = readJson(inputs.agent6_final_verdict);
const familyBoundary = readJson(inputs.agent1_family_boundary);
const request = readJson(inputs.agent10_boundary_request);
const measurement = readJson(inputs.agent2_measurement);

const scope = request.measured_scope;
const ncRows = request.nc_commercial_export_exclusion_rows;
const families = familyBoundary.family_statuses || familyBoundary.families || familyBoundary.family_boundaries || [];

const spec = {
  schema_version: 1,
  artifact_type: 'agent10_orot_sefaria_nc_aware_zero_emission_transform_spec',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_sefaria_nc_aware_zero_emission_transform_spec.mjs',
  boundary: {
    status: 'zero_emission_transform_spec_only',
    planning_only: true,
    no_answer_rows: true,
    no_source_rows_emitted: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_definition_content_rows: true,
    no_nc_definition_content_storage: true,
    no_runtime_mutation: true,
    no_source_mutation: true,
    no_token_index_mutation: true,
    no_lexical_payload_mutation: true,
    no_public_mutation: true,
    no_agent4_route: true,
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
    scoped_rows: scope.scoped_rows,
    scoped_occurrences: scope.scoped_occurrences,
    commercial_clean_candidate_rows: scope.commercial_clean_candidate_rows,
    commercial_clean_candidate_occurrences: scope.commercial_clean_candidate_occurrences,
    additional_nc_educational_candidate_rows: scope.additional_nc_educational_candidate_rows,
    additional_nc_educational_candidate_occurrences: scope.additional_nc_educational_candidate_occurrences,
    commercial_clean_plus_nc_rows: scope.commercial_clean_plus_nc_rows,
    commercial_clean_plus_nc_occurrences: scope.commercial_clean_plus_nc_occurrences,
    remaining_no_hit_or_unusable_rows: scope.remaining_no_hit_or_unusable_rows,
    remaining_no_hit_or_unusable_occurrences: scope.remaining_no_hit_or_unusable_occurrences,
  },
  allowed_family_statuses: families.map((family) => ({
    family: family.family,
    status: family.status,
    storage_allowed_for_future_non_public_dry_run: family.storage_allowed === true,
    transformed_reader_hint_allowed_for_future_non_public_dry_run: family.transformed_reader_hint_allowed === true,
    noncommercial_display_planning_allowed: family.noncommercial_display_allowed === true,
    commercial_export_prohibited: family.commercial_export_prohibited === true,
    allowed_now_by_this_spec: false,
    agent6_exact_package_review_required_before_emit: true,
  })),
  transform_contract_fields: [
    'token_id',
    'surface',
    'normalized',
    'occurrences',
    'lexicon_family',
    'family_status',
    'candidate_label',
    'candidate_text_placeholder_or_hash',
    'source_ref_or_url',
    'source_version_title',
    'source_license_group',
    'attribution_required',
    'attribution_text_or_link_required',
    'source_custody_manifest_ref',
    'derived_from_nc',
    'commercial_export_allowed',
    'noncommercial_display_planning_allowed',
    'corpus_contamination',
    'answer_eligible',
    'approved_for_public_emit',
    'public_emit_ready',
  ],
  transform_rules: [
    {
      rule_id: 'commercial_clean_public_domain_observed_family_rule',
      applies_to_status: 'commercial_clean_candidate',
      families: ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary'],
      required_flags: {
        derived_from_nc: false,
        commercial_export_allowed_pending_later_export_policy: null,
        attribution_required: false,
        corpus_contamination: false,
        answer_eligible: false,
        approved_for_public_emit: false,
        public_emit_ready: false,
      },
      output_allowed_now: false,
      next_review_required: 'Agent 6 exact transform/dry-run package review before any output mutation.',
    },
    {
      rule_id: 'noncommercial_educational_klein_rule',
      applies_to_status: 'noncommercial_educational_candidate',
      families: ['Klein Dictionary'],
      required_flags: {
        license_group: 'CC_BY_NC',
        derived_from_nc: true,
        commercial_export_allowed: false,
        noncommercial_display_planning_allowed: true,
        attribution_required: true,
        corpus_contamination: false,
        answer_eligible: false,
        approved_for_public_emit: false,
        public_emit_ready: false,
      },
      output_allowed_now: false,
      nc_definition_content_storage_allowed_now: false,
      next_review_required: 'Agent 6 exact transform/dry-run package review before any non-public candidate text storage/display or public path.',
    },
    {
      rule_id: 'blocked_bdb_augmented_strong_rule',
      applies_to_status: 'blocked',
      families: ['BDB Augmented Strong'],
      required_flags: {
        storage_allowed: false,
        transformed_reader_hint_allowed: false,
        metadata_only_allowed: true,
        external_link_only_allowed: true,
      },
      output_allowed_now: false,
      exact_unblock_required: 'Independent license/source basis and Agent 1/6 boundary.',
    },
  ],
  nc_commercial_export_exclusion_rows: ncRows.map((row) => ({
    token_id: row.token_id,
    occurrences: row.occurrences,
    family: row.family,
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    noncommercial_display_planning_allowed: true,
    noncommercial_display_public_or_runtime_authorized: false,
    attribution_required: true,
    corpus_contamination: false,
  })),
  next_zero_emission_dry_run_requirements: {
    must_remain_non_public: true,
    may_use_family_statuses_as_planning_evidence: true,
    must_not_store_definition_content: true,
    must_not_emit_public_hud_or_route_rows: true,
    must_not_set_answer_eligible_true: true,
    must_preserve_nc_flags: true,
    must_preserve_bdb_augmented_strong_block: true,
    must_include_commercial_export_exclusion_manifest: true,
    agent6_review_required_after_dry_run: true,
  },
  outputs: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    runtime_files_touched: [],
    source_files_touched: [],
    token_index_files_touched: [],
    lexical_payload_files_touched: [],
  },
  agent8_callback: {
    status: 'Agent 10 NC-aware zero-emission transform-spec produced.',
    artifact_path: outputMd,
    artifact_json: outputJson,
    scope: 'Top-500 Orot/Sefaria family-status planning boundary only.',
    next_executable_route: 'Agent 2 may prepare one zero-emission non-public dry-run using this spec; no answer emission, public mutation, NC definition-content storage, or Agent 4 route.',
    public_mutation_blocked: true,
    agent4_remains_held: true,
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

writeJson(outputJson, spec);
writeMarkdown(outputMd, spec);
console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);

function writeMarkdown(relativePath, data) {
  const lines = [];
  lines.push('# Agent 10 Orot/Sefaria NC-Aware Zero-Emission Transform Spec');
  lines.push('');
  lines.push(`Generated: ${data.generated_at}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('This is a zero-emission transform specification only. It does not emit answer rows, source rows, public HUD rows, route JSONL rows, definition-content rows, NC definition-content rows, runtime edits, source edits, token-index edits, lexical-payload edits, or public mutations.');
  lines.push('');
  lines.push('It does not accept QA, source/provenance, license posture, Definition authority, usage-as-definition authority, answer eligibility, public/runtime behavior, publication readiness, route publication support, product/data status, translation output, accepted gloss, or accepted text.');
  lines.push('');
  lines.push('## Measured Scope');
  lines.push('');
  lines.push(`- Scoped rows / occurrences: \`${data.measured_scope.scoped_rows}\` / \`${data.measured_scope.scoped_occurrences}\`.`);
  lines.push(`- Commercial-clean candidates: \`${data.measured_scope.commercial_clean_candidate_rows}\` rows / \`${data.measured_scope.commercial_clean_candidate_occurrences}\` occurrences.`);
  lines.push(`- Additional NC educational candidates: \`${data.measured_scope.additional_nc_educational_candidate_rows}\` rows / \`${data.measured_scope.additional_nc_educational_candidate_occurrences}\` occurrences.`);
  lines.push(`- Commercial-clean + NC candidates: \`${data.measured_scope.commercial_clean_plus_nc_rows}\` rows / \`${data.measured_scope.commercial_clean_plus_nc_occurrences}\` occurrences.`);
  lines.push(`- Remaining no-hit/unusable: \`${data.measured_scope.remaining_no_hit_or_unusable_rows}\` rows / \`${data.measured_scope.remaining_no_hit_or_unusable_occurrences}\` occurrences.`);
  lines.push('');
  lines.push('## Family Statuses');
  lines.push('');
  lines.push('| Family | Status | Commercial Export Prohibited | Allowed Now |');
  lines.push('| --- | --- | ---: | ---: |');
  for (const family of data.allowed_family_statuses) {
    lines.push(`| ${family.family} | ${family.status} | ${family.commercial_export_prohibited} | ${family.allowed_now_by_this_spec} |`);
  }
  lines.push('');
  lines.push('## Transform Contract Fields');
  lines.push('');
  for (const field of data.transform_contract_fields) lines.push(`- \`${field}\``);
  lines.push('');
  lines.push('## Transform Rules');
  lines.push('');
  for (const rule of data.transform_rules) {
    lines.push(`- \`${rule.rule_id}\`: applies to \`${rule.applies_to_status}\`; output allowed now: \`${rule.output_allowed_now}\`.`);
  }
  lines.push('');
  lines.push('## NC Commercial Export Exclusion');
  lines.push('');
  lines.push(`Rows: \`${data.nc_commercial_export_exclusion_rows.length}\`; occurrences: \`${data.nc_commercial_export_exclusion_rows.reduce((sum, row) => sum + row.occurrences, 0)}\`.`);
  lines.push('');
  lines.push('Required NC flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`.');
  lines.push('');
  lines.push('## Next Dry-Run Requirements');
  lines.push('');
  for (const [key, value] of Object.entries(data.next_zero_emission_dry_run_requirements)) {
    lines.push(`- \`${key}\`: \`${value}\``);
  }
  lines.push('');
  lines.push('## Agent 8 Callback');
  lines.push('');
  lines.push(`- Status: ${data.agent8_callback.status}`);
  lines.push(`- Artifact path: \`${data.agent8_callback.artifact_path}\``);
  lines.push(`- Artifact JSON: \`${data.agent8_callback.artifact_json}\``);
  lines.push(`- Scope: ${data.agent8_callback.scope}`);
  lines.push(`- Next executable route: ${data.agent8_callback.next_executable_route}`);
  lines.push(`- Public mutation blocked: \`${data.agent8_callback.public_mutation_blocked}\``);
  lines.push(`- Agent 4 remains held: \`${data.agent8_callback.agent4_remains_held}\``);
  lines.push('');
  lines.push('## Outputs');
  lines.push('');
  lines.push('- Answer rows: `0`.');
  lines.push('- Source rows: `0`.');
  lines.push('- Public HUD rows: `0`.');
  lines.push('- Route JSONL rows: `0`.');
  lines.push('- Definition-content rows: `0`.');
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
