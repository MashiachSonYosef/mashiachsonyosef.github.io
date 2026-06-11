#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const inputs = {
  agent1_reaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  agent1_export_partitions: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
  agent1_agent2_handoff: 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  agent6_verdict: 'reports/agent6-old-dictionary-license-lane-planning-verdict-2026-06-04.md',
  agent10_verdict_consumption: 'reports/agent10-agent6-old-dictionary-license-lane-verdict-consumption-2026-06-04.json',
  agent10_transform_boundary_packet: 'reports/agent10-agent6-ready-old-dictionary-lane-partition-transform-planning-boundary-packet-2026-06-04.json'
};

const outputJsonPath = 'reports/agent1-old-dictionary-planning-boundary-state-2026-06-04.json';
const outputMdPath = 'reports/agent1-old-dictionary-planning-boundary-state-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-planning-boundary-state-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-planning-boundary-state-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const reaudit = readJson(inputs.agent1_reaudit);
const partitions = readJson(inputs.agent1_export_partitions);
const handoff = readJson(inputs.agent1_agent2_handoff);
const verdictText = readText(inputs.agent6_verdict);
const consumption = readJson(inputs.agent10_verdict_consumption);
const transformBoundary = readJson(inputs.agent10_transform_boundary_packet);

const requiredVerdictPhrases = [
  'WARN-ACCEPTED for non-public old-dictionary source-family/license-lane planning evidence',
  'does not authorize candidate text consumption',
  'No Agent 2 candidate text consumption may use this family',
  'NC/Klein rows must not be mixed into commercial-clean output'
];

for (const phrase of requiredVerdictPhrases) {
  if (!verdictText.includes(phrase)) {
    throw new Error(`Agent 6 verdict missing required phrase: ${phrase}`);
  }
}

const sourceFamilies = Object.entries(consumption.source_family_lane_planning_evidence).map(([sourceFamily, evidence]) => {
  const handoffRow = handoff.transform_rows.find((row) => row.source_family === sourceFamily);
  return {
    row_subset_id: handoffRow?.row_subset_id || `old-dictionary-planning-boundary-state::${sourceFamily}`,
    source_family: sourceFamily,
    license_lane: evidence.license_lane,
    rows: evidence.rows,
    occurrences: evidence.occurrences,
    planning_evidence_allowed: true,
    planning_evidence_scope: 'nonpublic_source_family_license_lane_planning_evidence_only',
    candidate_text_consumption_allowed: false,
    candidate_text_export_allowed: false,
    definition_content_storage_allowed: false,
    answer_eligible: false,
    public_emit: false,
    route_shard_write_allowed: false,
    commercial_export_allowed: evidence.commercial_export_allowed === true ? false : Boolean(evidence.commercial_export_allowed),
    derived_from_nc: Boolean(evidence.derived_from_nc),
    attribution_required: Boolean(evidence.attribution_required),
    owner_use_attestation: evidence.owner_use_attestation || null,
    corpus_contamination: evidence.corpus_contamination === true ? true : false,
    missing_evidence: evidence.missing_evidence || [],
    evidence_paths: [
      inputs.agent1_reaudit,
      inputs.agent1_export_partitions,
      inputs.agent1_agent2_handoff,
      inputs.agent6_verdict,
      inputs.agent10_verdict_consumption
    ]
  };
});

const counts = {
  source_family_count: sourceFamilies.length,
  audited_rows: consumption.primary_planning_counts.audited_rows,
  audited_occurrences: consumption.primary_planning_counts.audited_occurrences,
  commercial_clean_source_families: partitions.partitions.commercial_clean_candidate.source_family_count,
  noncommercial_educational_source_families: partitions.partitions.noncommercial_educational_candidate.source_family_count,
  metadata_or_link_only_source_families: partitions.partitions.metadata_or_link_only.source_family_count,
  blocked_or_needs_review_source_families: partitions.partitions.blocked_or_needs_review.source_family_count,
  planning_evidence_allowed_source_families: sourceFamilies.filter((row) => row.planning_evidence_allowed).length,
  candidate_text_consumption_allowed_rows: 0,
  candidate_text_export_allowed_rows: 0,
  answer_eligible_rows: 0,
  public_emit_rows: 0
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_planning_boundary_state',
  generated_at: '2026-06-05T01:46:00.000Z',
  generator: 'scripts/build_agent1_old_dictionary_planning_boundary_state.mjs',
  status: 'agent1_old_dictionary_planning_boundary_state_prepared_for_agent10_agent2_nonpublic_planning_only',
  target: 'old-dictionary-planning-boundary-state',
  inputs,
  agent6_verdict: {
    path: inputs.agent6_verdict,
    disposition: consumption.disposition,
    accepted_scope: consumption.accepted_scope,
    blocker_effect: consumption.blocker_effect
  },
  counts,
  source_family_boundary_rows: sourceFamilies,
  next_allowed_action: {
    agent10: 'Carry old-dictionary lane evidence as non-public planning context only; prepare a new exact Agent 6 packet for any candidate-text/export/storage/answer/public/runtime use.',
    agent2: 'May consume the lane assignment as planning context only; candidate text generation/export remains blocked.',
    agent6: 'Only route through Agent 10 with a new exact row/subset boundary question if downstream use changes.'
  },
  exact_blockers: [
    'candidate_text_consumption_requires_new_exact_agent6_boundary',
    'candidate_text_export_requires_new_exact_agent6_boundary',
    'definition_content_storage_requires_new_exact_agent6_boundary',
    'BDB Augmented Strong remains blocked_or_needs_review pending independent source/license/custody evidence',
    'Klein remains separate noncommercial_educational_candidate and is not commercial-clean'
  ],
  zero_output_counts: consumption.zero_output_counts,
  non_acceptance_boundary: {
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_qa_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_public_runtime_mutation: true
  }
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  generated_at: artifact.generated_at,
  package_owner: 'Agent 1',
  target: {
    workset: artifact.target,
    source_family_count: counts.source_family_count,
    audited_rows: counts.audited_rows,
    audited_occurrences: counts.audited_occurrences,
    planning_evidence_allowed_source_families: counts.planning_evidence_allowed_source_families,
    candidate_text_consumption_allowed_rows: 0
  },
  inputs: Object.values(inputs),
  command_or_script: {
    build: 'node scripts/build_agent1_old_dictionary_planning_boundary_state.mjs'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  output_schema: {
    required_top_level_fields: ['schema_version', 'artifact_type', 'status', 'target', 'inputs', 'agent6_verdict', 'counts', 'source_family_boundary_rows', 'exact_blockers', 'zero_output_counts', 'non_acceptance_boundary'],
    required_row_fields: ['row_subset_id', 'source_family', 'license_lane', 'planning_evidence_allowed', 'candidate_text_consumption_allowed', 'candidate_text_export_allowed', 'answer_eligible', 'public_emit', 'commercial_export_allowed', 'derived_from_nc', 'attribution_required', 'corpus_contamination']
  },
  validator: {
    command: 'node scripts/validate_agent1_old_dictionary_planning_boundary_state.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_old_dictionary_planning_boundary_state_contract.mjs'
  },
  spark1_stop_condition: 'Return validated planning-boundary state packet and contract result, or exact missing input/schema/validator blocker.',
  non_acceptance_boundary: artifact.non_acceptance_boundary
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

const rowLines = sourceFamilies.map((row) => `| ${row.source_family} | ${row.license_lane} | ${row.rows} / ${row.occurrences} | ${row.planning_evidence_allowed} | ${row.candidate_text_consumption_allowed} | ${row.public_emit} | ${row.missing_evidence.length ? row.missing_evidence.join('; ') : 'none'} |`).join('\n');

writeFile(outputMdPath, `# Agent 1 Old Dictionary Planning Boundary State - 2026-06-04

Status: \`${artifact.status}\`.

## Counts

- source families: \`${counts.source_family_count}\`
- audited rows / occurrences: \`${counts.audited_rows}\` / \`${counts.audited_occurrences}\`
- planning-evidence source families: \`${counts.planning_evidence_allowed_source_families}\`
- candidate text consumption rows now: \`0\`
- candidate text export rows now: \`0\`
- public emit rows now: \`0\`

## Source Families

| source family | lane | rows / occurrences | planning evidence | candidate text | public emit | missing evidence |
| --- | --- | ---: | --- | --- | --- | --- |
${rowLines}

## Boundary

Agent 6 WARN-ACCEPTED this lane evidence as non-public planning evidence only. Candidate text consumption/export, definition-content storage, answer eligibility, public/runtime behavior, route-shard writes, source/license/legal acceptance, publication readiness, and accepted text remain blocked unless Agent 10 routes a new exact Agent 6 boundary packet.
`);

writeFile(contractMdPath, `# Spark-1 Contract: Old Dictionary Planning Boundary State - 2026-06-04

target: \`${artifact.target}\`

command:

\`\`\`powershell
node scripts/build_agent1_old_dictionary_planning_boundary_state.mjs
node scripts/validate_agent1_old_dictionary_planning_boundary_state.mjs
node scripts/validate_agent1_spark1_old_dictionary_planning_boundary_state_contract.mjs
\`\`\`

Spark-1 stop condition: validated planning-boundary state packet and contract result, or exact missing input/schema/validator blocker.

Boundary: planning evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, answer acceptance, accepted gloss/text, candidate text export, or public/runtime mutation.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  source_family_count: counts.source_family_count,
  audited_rows: counts.audited_rows,
  audited_occurrences: counts.audited_occurrences,
  candidate_text_consumption_allowed_rows: 0
}, null, 2));
