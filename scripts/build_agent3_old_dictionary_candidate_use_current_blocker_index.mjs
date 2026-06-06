#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  gateProofCoverage:
    'reports/agent3-old-dictionary-candidate-use-gate-proof-coverage-crossmatch-2026-06-06.json',
  sourceCitationDependency:
    'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
  boundaryChain: 'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.json',
  routeRecheck: 'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.json',
  agent10ZeroTextPackagePlanning:
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  agent10ZeroTextConsumption:
    'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json',
  agent10TransformBlockerConsumption:
    'reports/agent10-old-dictionary-78-row-agent2-transform-output-blocker-consumption-2026-06-06.json',
  agent2TransformMissingPipelineBlocker:
    'reports/agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json',
  agent6PreboundaryVerdict:
    'reports/agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.json',
  agent6ZeroTextVerdict:
    'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-current-blocker-index-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-current-blocker-index-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));

const gateProofCoverage = readJson(options.gateProofCoverage);
const sourceCitationDependency = readJson(options.sourceCitationDependency);
const boundaryChain = readJson(options.boundaryChain);
const routeRecheck = readJson(options.routeRecheck);
const agent10ZeroTextPackagePlanning = readJson(options.agent10ZeroTextPackagePlanning);
const agent10ZeroTextConsumption = readJson(options.agent10ZeroTextConsumption);
const agent10TransformBlockerConsumption = readJson(options.agent10TransformBlockerConsumption);
const agent2TransformMissingPipelineBlocker = readJson(options.agent2TransformMissingPipelineBlocker);
const agent6PreboundaryVerdict = readJson(options.agent6PreboundaryVerdict);
const agent6ZeroTextVerdict = readJson(options.agent6ZeroTextVerdict);

assertArtifact(gateProofCoverage, 'agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch', options.gateProofCoverage);
assertArtifact(
  sourceCitationDependency,
  'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch',
  options.sourceCitationDependency,
);
assertArtifact(boundaryChain, 'agent3_old_dictionary_candidate_use_boundary_chain_crossmatch', options.boundaryChain);
assertArtifact(routeRecheck, 'agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch', options.routeRecheck);
assertArtifact(
  agent10ZeroTextPackagePlanning,
  'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  options.agent10ZeroTextPackagePlanning,
);
assertArtifact(
  agent10ZeroTextConsumption,
  'agent10_old_dictionary_78_row_zero_text_package_planning_consumption',
  options.agent10ZeroTextConsumption,
);
assertArtifact(
  agent10TransformBlockerConsumption,
  'agent10_old_dictionary_78_row_agent2_transform_output_blocker_consumption',
  options.agent10TransformBlockerConsumption,
);
assertArtifact(
  agent2TransformMissingPipelineBlocker,
  'agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker',
  options.agent2TransformMissingPipelineBlocker,
);
assertArtifact(agent6PreboundaryVerdict, 'agent6_old_dictionary_78_row_candidate_use_preboundary_verdict', options.agent6PreboundaryVerdict);
assertArtifact(
  agent6ZeroTextVerdict,
  'agent6_old_dictionary_78_row_zero_text_candidate_use_package_verdict',
  options.agent6ZeroTextVerdict,
);

const rows = Number(agent10ZeroTextPackagePlanning.counts?.rows || 0);
const occurrences = Number(agent10ZeroTextPackagePlanning.counts?.occurrences || 0);
const sourceLane = agent10ZeroTextPackagePlanning.source_license_lane || 'commercial_clean_candidate';
const relationClass = agent10ZeroTextPackagePlanning.package_rows?.[0]?.relation_class || 'exact_after_mark_strip';
const morphologyStatus =
  agent10ZeroTextPackagePlanning.package_rows?.[0]?.morphology_relation_status ||
  'agent2_morphology_relation_approved_for_nonpublic_planning';
const sourceDependencyCounts = sourceCitationDependency.counts || {};
const transformConsumptionBlockers = new Set(agent10TransformBlockerConsumption.exact_blockers || []);
const agent2Blockers = new Set(agent2TransformMissingPipelineBlocker.exact_blockers || []);
const zeroTextPreservedBlockers = new Set(agent6ZeroTextVerdict.preserved_blockers || []);

const blockerRows = [
  blocker({
    blocker_id: 'missing_source_field::source_citation_or_url',
    blocker_class: 'source_citation_dependency',
    affected_rows: Number(sourceDependencyCounts.source_citation_missing_rows || 0),
    affected_occurrences: occurrences,
    current_owner: 'Agent 1 / Agent 2 source-citation enrichment before Agent 10 can assemble transform-output packet',
    source_artifacts: [options.sourceCitationDependency, options.agent2TransformMissingPipelineBlocker, options.agent10TransformBlockerConsumption],
    observed_in_sources: transformConsumptionBlockers.has('missing_source_field::source_citation_or_url') &&
      agent2Blockers.has('missing_source_field::source_citation_or_url'),
    next_safe_action: 'Supply row-level source_citation_or_url for the exact 78-row packet or preserve the exact blocker.',
  }),
  blocker({
    blocker_id: 'missing_transform_output_proposal_matrix_or_exact_transform_rule',
    blocker_class: 'transform_rule_dependency',
    affected_rows: rows,
    affected_occurrences: occurrences,
    current_owner: 'Agent 2 transform-output proposal lane',
    source_artifacts: [options.agent2TransformMissingPipelineBlocker, options.agent10TransformBlockerConsumption],
    observed_in_sources: transformConsumptionBlockers.has('missing_transform_output_proposal_matrix_or_exact_transform_rule') &&
      agent2Blockers.has('missing_transform_output_proposal_matrix_or_exact_transform_rule'),
    next_safe_action: 'Author an exact transform-output proposal rule or return the same missing-pipeline blocker.',
  }),
  blocker({
    blocker_id: 'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
    blocker_class: 'proposed_text_rule_dependency',
    affected_rows: rows,
    affected_occurrences: occurrences,
    current_owner: 'Agent 2 transform-output proposal lane',
    source_artifacts: [options.agent2TransformMissingPipelineBlocker, options.agent10TransformBlockerConsumption],
    observed_in_sources: transformConsumptionBlockers.has(
      'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
    ) && agent2Blockers.has(
      'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
    ),
    next_safe_action: 'Provide an exact proposal-only transform rule for text fields, or keep text output blocked.',
  }),
  blocker({
    blocker_id: 'next_transform_output_or_candidate_text_boundary_not_supplied',
    blocker_class: 'agent6_boundary_dependency',
    affected_rows: rows,
    affected_occurrences: occurrences,
    current_owner: 'Agent 10 prepares new Agent 6 boundary only after transform/source prerequisites exist',
    source_artifacts: [options.agent10ZeroTextConsumption, options.agent6ZeroTextVerdict, options.agent10TransformBlockerConsumption],
    observed_in_sources: agent10ZeroTextConsumption.exact_blocker === 'next_transform_output_or_candidate_text_boundary_not_supplied' &&
      transformConsumptionBlockers.has('next_transform_output_or_candidate_text_boundary_not_supplied'),
    next_safe_action: 'Do not request transform-output acceptance until prerequisites are supplied or a narrowed Agent 6 question is prepared.',
  }),
  blocker({
    blocker_id: 'candidate_text_blocked',
    blocker_class: 'zero_text_boundary_preserved',
    affected_rows: rows,
    affected_occurrences: occurrences,
    current_owner: 'Agent 10 / Agent 6 boundary lane',
    source_artifacts: [options.agent6ZeroTextVerdict, options.agent10ZeroTextPackagePlanning],
    observed_in_sources: zeroTextPreservedBlockers.has('candidate_text_blocked'),
    next_safe_action: 'Keep zero-text package planning as non-public planning evidence until a new exact boundary exists.',
  }),
  blocker({
    blocker_id: 'missing_agent4_gate_proof_for_boundary_chain_crossmatch',
    blocker_class: 'gate_proof_navigation_dependency',
    affected_rows: Number(boundaryChain.counts?.row_crossmatch_rows || 0),
    affected_occurrences: Number(boundaryChain.counts?.row_crossmatch_occurrences || 0),
    current_owner: 'Agent 4 or release owner if this row must be queue-visible',
    source_artifacts: [options.gateProofCoverage, options.boundaryChain],
    observed_in_sources: hasCoverageBlocker('boundary_chain_crossmatch'),
    next_safe_action: 'Produce a scoped gate proof for boundary-chain crossmatch or keep it as exact missing-proof blocker.',
  }),
  blocker({
    blocker_id: 'missing_agent4_gate_proof_for_source_citation_dependency_crossmatch',
    blocker_class: 'gate_proof_navigation_dependency',
    affected_rows: Number(sourceDependencyCounts.row_dependency_rows || 0),
    affected_occurrences: Number(sourceDependencyCounts.row_dependency_occurrences || 0),
    current_owner: 'Agent 4 or release owner if this row must be queue-visible',
    source_artifacts: [options.gateProofCoverage, options.sourceCitationDependency],
    observed_in_sources: hasCoverageBlocker('source_citation_dependency_crossmatch'),
    next_safe_action: 'Produce a scoped gate proof for source-citation dependency crossmatch or keep it as exact missing-proof blocker.',
  }),
  blocker({
    blocker_id: 'recheck_required_current_registry_contradicts_older_route_blocker',
    blocker_class: 'agent1_route_recheck_navigation',
    affected_rows: Number(routeRecheck.counts?.source_citation_missing_rows || 0),
    affected_occurrences: Number(routeRecheck.counts?.row_dependency_occurrences || 0),
    current_owner: 'Agent 10 / Agent 5 routing coordination; Agent 1 source-citation lane',
    source_artifacts: [options.routeRecheck, options.sourceCitationDependency],
    observed_in_sources: Number(routeRecheck.counts?.route_recheck_required_rows || 0) === 1,
    next_safe_action: 'Recheck Agent 1 route with current registry; Agent 3 does not deliver route or source citation.',
  }),
];

const counts = {
  blocker_rows: blockerRows.length,
  observed_blocker_rows: blockerRows.filter((row) => row.observed_in_sources).length,
  unobserved_blocker_rows: blockerRows.filter((row) => !row.observed_in_sources).length,
  affected_candidate_use_rows: rows,
  affected_candidate_use_occurrences: occurrences,
  source_citation_missing_rows: Number(sourceDependencyCounts.source_citation_missing_rows || 0),
  transform_rule_missing_rows: Number(sourceDependencyCounts.transform_rule_missing_rows || 0),
  gate_proof_missing_rows: Number(gateProofCoverage.counts?.missing_gate_proof_rows || 0),
  route_recheck_required_rows: Number(routeRecheck.counts?.route_recheck_required_rows || 0),
  agent6_zero_text_preserved_blockers: zeroTextPreservedBlockers.size,
  source_rid_references: Number(sourceDependencyCounts.source_rid_references || 0),
  unique_source_rids: Number(sourceDependencyCounts.unique_source_rids || 0),
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_rows: 0,
  answer_eligible_rows: 0,
  route_jsonl_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  export_rows: 0,
  release_actions: 0,
  source_acceptance_claims: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_current_blocker_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_current_blocker_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_current_package_blocker_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    current_blocker_index_only: true,
    no_new_acceptance_or_release_claim: true,
    qa_acceptance: false,
    source_provenance_acceptance: false,
    source_license_acceptance: false,
    source_legal_acceptance: false,
    source_citation_supplied_by_agent3: false,
    transform_authority: false,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    lemma_content_storage: false,
    reader_hint_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    answer_eligibility: false,
    route_ranking: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  package_scope: {
    rows,
    occurrences,
    source_license_lane: sourceLane,
    relation_class: relationClass,
    morphology_relation_status: morphologyStatus,
    exact_scope_only: true,
  },
  inputs: {
    gate_proof_coverage: options.gateProofCoverage,
    source_citation_dependency: options.sourceCitationDependency,
    boundary_chain: options.boundaryChain,
    route_recheck: options.routeRecheck,
    agent10_zero_text_package_planning: options.agent10ZeroTextPackagePlanning,
    agent10_zero_text_consumption: options.agent10ZeroTextConsumption,
    agent10_transform_blocker_consumption: options.agent10TransformBlockerConsumption,
    agent2_transform_missing_pipeline_blocker: options.agent2TransformMissingPipelineBlocker,
    agent6_preboundary_verdict: options.agent6PreboundaryVerdict,
    agent6_zero_text_verdict: options.agent6ZeroTextVerdict,
  },
  counts,
  blocker_rows: blockerRows,
  downstream_handoff: {
    owner: 'Agent 10 release/package intake; Agent 6 only through exact boundary packet',
    next_safe_action:
      'Resolve source_citation_or_url and exact transform-output rule first, or preserve this blocker index as current package-navigation evidence.',
    no_acceptance_claim: true,
    no_publication_claim: true,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(
  `Agent 3 current blocker index rows=${counts.blocker_rows} observed=${counts.observed_blocker_rows} affected=${counts.affected_candidate_use_rows}/${counts.affected_candidate_use_occurrences}`,
);

function blocker({
  blocker_id,
  blocker_class,
  affected_rows,
  affected_occurrences,
  current_owner,
  source_artifacts,
  observed_in_sources,
  next_safe_action,
}) {
  return {
    row_id: `agent3-current-blocker-${slug(blocker_id)}`,
    blocker_id,
    blocker_class,
    affected_rows,
    affected_occurrences,
    source_artifacts,
    observed_in_sources: Boolean(observed_in_sources),
    current_owner,
    next_safe_action,
    evidence_role: 'current_blocker_navigation_only_no_acceptance_claim',
    dedupe_key: sha256([blocker_id, blocker_class, affected_rows, affected_occurrences, source_artifacts.join('|')].join('|')),
  };
}

function hasCoverageBlocker(role) {
  return (gateProofCoverage.coverage_rows || []).some(
    (row) => row.role === role && row.gate_proof_status === 'missing_gate_proof_row' && row.exact_blocker,
  );
}

function writeReport(reportPath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Current Blocker Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this index does not supply source citations, transform rules, candidate text, definitions, answer eligibility, route writes, or acceptance.',
    '- It links current blockers to exact source artifacts for Agent 10 / Agent 6 package planning.',
    '',
    '## Counts',
    '',
    `- Blocker rows / observed in source artifacts: ${artifact.counts.blocker_rows}/${artifact.counts.observed_blocker_rows}`,
    `- Affected package rows / occurrences: ${artifact.counts.affected_candidate_use_rows}/${artifact.counts.affected_candidate_use_occurrences}`,
    `- Source citation missing / transform rule missing: ${artifact.counts.source_citation_missing_rows}/${artifact.counts.transform_rule_missing_rows}`,
    `- Missing gate-proof rows / route recheck required: ${artifact.counts.gate_proof_missing_rows}/${artifact.counts.route_recheck_required_rows}`,
    `- Source RID refs / unique RIDs: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}`,
    `- Candidate text / answer eligible / route writes / public mutation / release actions: ${artifact.counts.candidate_text_rows}/${artifact.counts.answer_eligible_rows}/${artifact.counts.route_shard_writes}/${artifact.counts.public_runtime_mutation}/${artifact.counts.release_actions}`,
    '',
    '## Blocker Rows',
    '',
    '| blocker | class | rows | occurrences | owner | observed |',
    '| --- | --- | ---: | ---: | --- | --- |',
    ...artifact.blocker_rows.map((row) =>
      [
        row.blocker_id,
        row.blocker_class,
        row.affected_rows,
        row.affected_occurrences,
        row.current_owner,
        row.observed_in_sources ? 'yes' : 'no',
      ].join(' | '),
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.owner}`,
    `- Next safe action: ${artifact.downstream_handoff.next_safe_action}`,
    '- Stop condition: current blocker index emitted; no broad discovery, route delivery, text output, or acceptance action taken.',
  ];
  writeText(reportPath, lines.join('\n') + '\n');
}

function assertArtifact(artifact, expectedType, artifactPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${artifactPath} artifact_type mismatch; expected ${expectedType}`);
  }
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_current_blocker_index.mjs [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, content) {
  const target = path.resolve(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function slug(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96);
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
