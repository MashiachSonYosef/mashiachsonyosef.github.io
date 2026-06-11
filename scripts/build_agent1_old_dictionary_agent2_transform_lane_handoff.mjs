#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json';
const outputJsonPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json';
const outputMdPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-agent2-transform-lane-handoff-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const reaudit = readJson(inputPath);
const families = reaudit.source_families || [];
const transformRows = families.map((family) => {
  const transformLane =
    family.license_lane === 'commercial_clean_candidate'
      ? 'agent2_transform_candidate_after_agent6_boundary'
      : family.license_lane === 'noncommercial_educational_candidate'
        ? 'agent2_nc_educational_hold_separate'
        : family.license_lane === 'metadata_or_link_only'
          ? 'agent2_metadata_link_only_hold'
          : 'agent2_blocked_or_review_hold';
  return {
    row_subset_id: family.row_subset_id,
    source_family: family.source_family,
    license_lane: family.license_lane,
    transform_lane: transformLane,
    evidence_path: family.evidence_path,
    rows: family.evidence.rows,
    occurrences: family.evidence.occurrences,
    derived_from_nc: family.derived_from_nc,
    commercial_export_allowed: family.commercial_export_allowed,
    attribution_required: family.attribution_required,
    corpus_contamination: family.corpus_contamination,
    agent6_boundary_required: true,
    agent2_transform_allowed_now: false,
    answer_eligible: false,
    public_emit: false,
    missing_evidence: family.missing_evidence || [],
    handoff_owner: family.license_lane === 'commercial_clean_candidate' ? 'Agent 10 release owner then Agent 6 boundary' : family.handoff_owner
  };
});

const transformCounts = transformRows.reduce((acc, row) => {
  acc[row.transform_lane] ||= { source_family_count: 0, rows: 0, occurrences: 0 };
  acc[row.transform_lane].source_family_count += 1;
  acc[row.transform_lane].rows += row.rows || 0;
  acc[row.transform_lane].occurrences += row.occurrences || 0;
  return acc;
}, {});

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_agent2_transform_lane_handoff',
  generated_at: '2026-06-05T01:36:00.000Z',
  generator: 'scripts/build_agent1_old_dictionary_agent2_transform_lane_handoff.mjs',
  status: 'agent1_old_dictionary_agent2_transform_lane_handoff_ready_for_agent10_agent2_planning_only',
  input: inputPath,
  target: 'old-dictionary-agent2-transform-lane-handoff',
  counts: {
    source_family_count: transformRows.length,
    audited_rows: reaudit.evidence_counts.audited_rows,
    audited_occurrences: reaudit.evidence_counts.audited_occurrences,
    commercial_clean_source_families: reaudit.lane_source_family_counts.commercial_clean_candidate,
    noncommercial_educational_source_families: reaudit.lane_source_family_counts.noncommercial_educational_candidate,
    metadata_or_link_only_source_families: reaudit.lane_source_family_counts.metadata_or_link_only,
    blocked_or_needs_review_source_families: reaudit.lane_source_family_counts.blocked_or_needs_review,
    agent2_transform_allowed_now_rows: 0
  },
  transform_counts: transformCounts,
  transform_rows: transformRows,
  exact_missing_field_blockers: reaudit.exact_missing_field_blockers || [],
  handoff: {
    agent2_rule: 'Agent 2 may transform only row/subsets with Agent 1 lane evidence and applicable Agent 6/release boundary; no row is transform-authorized by this packet alone.',
    commercial_clean_rule: 'Commercial-clean rows remain separate from NC educational rows.',
    nc_rule: 'NC educational rows remain separate, noncommercial, answer-ineligible, public_emit=false, and commercial_export_allowed=false.',
    blocked_rule: 'Blocked/review rows emit no candidate text.',
    handoff_owner: 'Agent 10 release/package intake before any Agent 2 transform use'
  },
  non_acceptance_boundary: reaudit.non_acceptance_boundary || {
    no_source_license_acceptance: true,
    no_qa_acceptance: true,
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
    source_family_count: artifact.counts.source_family_count,
    audited_rows: artifact.counts.audited_rows,
    audited_occurrences: artifact.counts.audited_occurrences,
    agent2_transform_allowed_now_rows: 0
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_old_dictionary_agent2_transform_lane_handoff.mjs'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  output_schema: {
    required_top_level_fields: ['schema_version', 'artifact_type', 'status', 'counts', 'transform_counts', 'transform_rows', 'exact_missing_field_blockers', 'handoff', 'non_acceptance_boundary'],
    required_row_fields: ['row_subset_id', 'source_family', 'license_lane', 'transform_lane', 'evidence_path', 'derived_from_nc', 'commercial_export_allowed', 'attribution_required', 'corpus_contamination', 'agent2_transform_allowed_now']
  },
  validator: {
    command: 'node scripts/validate_agent1_old_dictionary_agent2_transform_lane_handoff.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_old_dictionary_agent2_transform_lane_handoff_contract.mjs'
  },
  spark1_stop_condition: 'Return validated Agent 2 transform-lane handoff and contract result, or exact missing input/schema/validator blocker.',
  non_acceptance_boundary: artifact.non_acceptance_boundary
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

writeFile(outputMdPath, `# Agent 1 Old Dictionary Agent 2 Transform-Lane Handoff - 2026-06-04

Status: \`${artifact.status}\`.

## Counts

- source families: \`${artifact.counts.source_family_count}\`
- audited rows / occurrences: \`${artifact.counts.audited_rows}\` / \`${artifact.counts.audited_occurrences}\`
- commercial-clean source families: \`${artifact.counts.commercial_clean_source_families}\`
- NC educational source families: \`${artifact.counts.noncommercial_educational_source_families}\`
- metadata/link-only source families: \`${artifact.counts.metadata_or_link_only_source_families}\`
- blocked/review source families: \`${artifact.counts.blocked_or_needs_review_source_families}\`
- Agent 2 transform-authorized rows now: \`0\`

## Handoff

Agent 2 may transform only row/subsets with Agent 1 lane evidence and applicable Agent 6/release boundary. This packet authorizes no candidate text by itself.

Boundary: no source/license/legal acceptance, no QA acceptance, no public/runtime mutation, no accepted gloss/text, no NC commercial authorization.
`);

writeFile(contractMdPath, `# Spark-1 Contract: Old Dictionary Agent 2 Transform-Lane Handoff - 2026-06-04

target: \`${artifact.target}\`

command:

\`\`\`powershell
node scripts/build_agent1_old_dictionary_agent2_transform_lane_handoff.mjs
node scripts/validate_agent1_old_dictionary_agent2_transform_lane_handoff.mjs
node scripts/validate_agent1_spark1_old_dictionary_agent2_transform_lane_handoff_contract.mjs
\`\`\`

Boundary: no source/license/legal acceptance, no QA acceptance, no public/runtime mutation, no accepted gloss/text.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  source_family_count: artifact.counts.source_family_count,
  audited_rows: artifact.counts.audited_rows,
  audited_occurrences: artifact.counts.audited_occurrences
}, null, 2));
