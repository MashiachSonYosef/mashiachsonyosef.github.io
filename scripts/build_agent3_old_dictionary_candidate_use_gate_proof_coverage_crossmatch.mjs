#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  output: 'reports/agent3-old-dictionary-candidate-use-gate-proof-coverage-crossmatch-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-gate-proof-coverage-crossmatch-2026-06-06.md',
  agent4HandoffIndexGateProof:
    'reports/agent4-agent3-candidate-use-handoff-index-gate-proof-2026-06-06.json',
  agent4OverlapGateProof:
    'reports/agent4-agent3-overlap-candidate-use-boundary-workset-gate-proof-2026-06-06.json',
  agent4SplitClosureGateProof:
    'reports/agent4-agent3-split-closure-crossmatch-gate-proof-2026-06-06.json',
  agent4RowLineageGateProof:
    'reports/agent4-agent3-row-lineage-matrix-gate-proof-2026-06-06.json',
  agent4Agent1RouteRecheckGateProof:
    'reports/agent4-agent3-agent1-route-recheck-crossmatch-gate-proof-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));

const agent3Rows = [
  {
    role: 'row_overlap_source_manifest_navigation',
    path: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json',
    type: 'agent3_old_dictionary_row_overlap_linkage_matrix',
  },
  {
    role: 'candidate_use_continuity_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
    type: 'agent3_old_dictionary_candidate_use_continuity_crossmatch',
  },
  {
    role: 'source_family_blocker_matrix',
    path: 'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
    type: 'agent3_old_dictionary_candidate_use_source_family_blocker_matrix',
  },
  {
    role: 'source_rid_continuity_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
    type: 'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  },
  {
    role: 'exact_subset_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
    type: 'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  },
  {
    role: 'boundary_triage_navigation',
    path: 'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
    type: 'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  },
  {
    role: 'pure_commercial_boundary_workset',
    path: 'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json',
    type: 'agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset',
  },
  {
    role: 'overlap_boundary_workset',
    path: 'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json',
    type: 'agent3_old_dictionary_overlap_candidate_use_boundary_workset',
    directGateProofOption: 'agent4OverlapGateProof',
    directGateProofType: 'agent4_agent3_overlap_candidate_use_boundary_workset_gate_proof',
  },
  {
    role: 'split_closure_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json',
    type: 'agent3_old_dictionary_candidate_use_split_closure_crossmatch',
    directGateProofOption: 'agent4SplitClosureGateProof',
    directGateProofType: 'agent4_agent3_split_closure_crossmatch_gate_proof',
  },
  {
    role: 'handoff_index',
    path: 'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json',
    type: 'agent3_old_dictionary_candidate_use_handoff_index',
    directGateProofOption: 'agent4HandoffIndexGateProof',
    directGateProofType: 'agent4_agent3_candidate_use_handoff_index_gate_proof',
  },
  {
    role: 'row_lineage_matrix',
    path: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
    type: 'agent3_old_dictionary_candidate_use_row_lineage_matrix',
    directGateProofOption: 'agent4RowLineageGateProof',
    directGateProofType: 'agent4_agent3_row_lineage_matrix_gate_proof',
  },
  {
    role: 'boundary_chain_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.json',
    type: 'agent3_old_dictionary_candidate_use_boundary_chain_crossmatch',
  },
  {
    role: 'source_citation_dependency_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
    type: 'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch',
  },
  {
    role: 'agent1_route_recheck_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.json',
    type: 'agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch',
    directGateProofOption: 'agent4Agent1RouteRecheckGateProof',
    directGateProofType: 'agent4_agent3_agent1_route_recheck_crossmatch_gate_proof',
  },
];

const handoffGateProof = readJson(options.agent4HandoffIndexGateProof);
assertArtifact(
  handoffGateProof,
  'agent4_agent3_candidate_use_handoff_index_gate_proof',
  options.agent4HandoffIndexGateProof,
);
const handoffIndex = readJson('reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json');
assertArtifact(handoffIndex, 'agent3_old_dictionary_candidate_use_handoff_index', handoffIndex.path);

const aggregateRoles = new Set((handoffIndex.handoff_entries || []).map((entry) => entry.role).filter(Boolean));
const directGateProofs = new Map();
for (const row of agent3Rows) {
  if (!row.directGateProofOption) continue;
  const proofPath = options[row.directGateProofOption];
  const proof = readJson(proofPath);
  assertArtifact(proof, row.directGateProofType, proofPath);
  directGateProofs.set(row.role, { path: proofPath, proof });
}

const coverageRows = agent3Rows.map((row) => {
  const artifact = readJson(row.path);
  assertArtifact(artifact, row.type, row.path);
  const direct = directGateProofs.get(row.role) || null;
  const aggregateCovered = aggregateRoles.has(row.role);
  const hasDirect = Boolean(direct);
  const gateProofStatus =
    hasDirect && aggregateCovered
      ? 'direct_and_aggregate_gate_proof_present'
      : hasDirect
        ? 'direct_gate_proof_present'
        : aggregateCovered
          ? 'aggregate_handoff_gate_proof_present_only'
          : 'missing_gate_proof_row';
  const countDigest = digestCounts(artifact.counts || {});
  const directGateProofCounts = digestCounts(direct?.proof?.counts || {});
  const blocker =
    gateProofStatus === 'missing_gate_proof_row'
      ? `missing_agent4_gate_proof_for_${row.role}`
      : '';
  return {
    row_id: `agent3-gate-proof-coverage-${row.role}`,
    role: row.role,
    agent3_artifact_path: row.path,
    agent3_artifact_type: artifact.artifact_type,
    agent3_status: artifact.status || '',
    agent3_row_count: countDigest.row_count,
    agent3_occurrence_count: countDigest.occurrence_count,
    agent3_source_rid_references: countDigest.source_rid_references,
    agent3_unique_source_rids: countDigest.unique_source_rids,
    agent3_transform_ready_rows: countDigest.transform_ready_rows,
    direct_gate_proof_path: direct?.path || '',
    direct_gate_proof_artifact_type: direct?.proof?.artifact_type || '',
    aggregate_handoff_gate_proof_path: aggregateCovered ? options.agent4HandoffIndexGateProof : '',
    gate_proof_status: gateProofStatus,
    direct_gate_proof_authority_counter_sum: authorityCounterSum(direct?.proof?.counts || {}),
    agent3_authority_counter_sum: authorityCounterSum(artifact.counts || {}),
    direct_gate_proof_row_count: directGateProofCounts.row_count,
    direct_gate_proof_occurrence_count: directGateProofCounts.occurrence_count,
    exact_blocker: blocker,
    evidence_role: 'gate_proof_coverage_navigation_only_no_acceptance_claim',
    dedupe_key: sha256([row.role, row.path, direct?.path || '', aggregateCovered ? options.agent4HandoffIndexGateProof : ''].join('|')),
  };
});

const counts = {
  coverage_rows: coverageRows.length,
  agent3_artifacts_checked: coverageRows.length,
  direct_gate_proof_rows: coverageRows.filter((row) => row.direct_gate_proof_path).length,
  aggregate_handoff_gate_proof_rows: coverageRows.filter((row) => row.aggregate_handoff_gate_proof_path).length,
  rows_with_any_gate_proof: coverageRows.filter(
    (row) => row.direct_gate_proof_path || row.aggregate_handoff_gate_proof_path,
  ).length,
  direct_and_aggregate_gate_proof_rows: coverageRows.filter(
    (row) => row.gate_proof_status === 'direct_and_aggregate_gate_proof_present',
  ).length,
  aggregate_only_gate_proof_rows: coverageRows.filter(
    (row) => row.gate_proof_status === 'aggregate_handoff_gate_proof_present_only',
  ).length,
  direct_only_gate_proof_rows: coverageRows.filter(
    (row) => row.gate_proof_status === 'direct_gate_proof_present',
  ).length,
  missing_gate_proof_rows: coverageRows.filter((row) => row.gate_proof_status === 'missing_gate_proof_row').length,
  exact_blocker_rows: coverageRows.filter((row) => row.exact_blocker).length,
  candidate_use_rows: Number(handoffIndex.counts?.candidate_use_rows || 0),
  candidate_use_occurrences: Number(handoffIndex.counts?.candidate_use_occurrences || 0),
  source_rid_references: Number(handoffIndex.counts?.source_rid_references || 0),
  unique_source_rids: Number(handoffIndex.counts?.unique_source_rids || 0),
  source_citation_missing_rows: Number(
    readJson('reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json').counts
      ?.source_citation_missing_rows || 0,
  ),
  transform_rule_missing_rows: Number(
    readJson('reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json').counts
      ?.transform_rule_missing_rows || 0,
  ),
  route_recheck_required_rows: Number(
    readJson('reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.json').counts
      ?.route_recheck_required_rows || 0,
  ),
  direct_gate_proof_authority_issue_rows: coverageRows.filter(
    (row) => row.direct_gate_proof_authority_counter_sum > 0,
  ).length,
  agent3_authority_issue_rows: coverageRows.filter((row) => row.agent3_authority_counter_sum > 0).length,
  transform_ready_rows: coverageRows.reduce((sum, row) => sum + row.agent3_transform_ready_rows, 0),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_gate_proof_coverage_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    gate_proof_coverage_crossmatch_only: true,
    downstream_proof_presence_observation_only: true,
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
  inputs: {
    agent3_artifacts: agent3Rows.map((row) => row.path),
    agent4_direct_gate_proofs: [...directGateProofs.values()].map((entry) => entry.path),
    agent4_handoff_index_gate_proof: options.agent4HandoffIndexGateProof,
  },
  counts,
  coverage_rows: coverageRows,
  exact_blockers: coverageRows
    .filter((row) => row.exact_blocker)
    .map((row) => ({
      role: row.role,
      agent3_artifact_path: row.agent3_artifact_path,
      exact_blocker: row.exact_blocker,
      next_safe_action: 'Agent 4 or release owner can produce a scoped gate proof if this row must be queue-visible.',
    })),
  downstream_handoff: {
    owner: 'Agent 10 release/package intake; Agent 6 only through explicit boundary packet',
    no_acceptance_claim: true,
    no_publication_claim: true,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(
  `Agent 3 gate-proof coverage rows=${counts.coverage_rows} any_gate=${counts.rows_with_any_gate_proof} missing=${counts.missing_gate_proof_rows}`,
);

function digestCounts(counts) {
  return {
    row_count: pickFirstNumber(counts, [
      'row_lineage_rows',
      'candidate_use_rows',
      'workset_rows',
      'closure_rows',
      'row_crossmatch_rows',
      'row_dependency_rows',
      'route_recheck_rows',
      'source_family_rows',
      'source_rid_rows',
      'candidate_rows',
      'handoff_entries',
      'bucket_rows',
    ]),
    occurrence_count: pickFirstNumber(counts, [
      'row_lineage_occurrences',
      'candidate_use_occurrences',
      'workset_occurrences',
      'closure_occurrences',
      'row_crossmatch_occurrences',
      'row_dependency_occurrences',
      'agent10_workset_occurrences',
      'source_family_membership_occurrences',
    ]),
    source_rid_references: Number(counts.source_rid_references || 0),
    unique_source_rids: Number(counts.unique_source_rids || 0),
    transform_ready_rows: Number(counts.transform_ready_rows || 0),
  };
}

function authorityCounterSum(counts) {
  return [
    'candidate_text_rows',
    'definition_content_rows',
    'lemma_content_rows',
    'reader_hint_content_rows',
    'answer_rows',
    'answer_eligible_rows',
    'route_jsonl_rows',
    'route_shard_writes',
    'source_text_rows',
    'accepted_text_rows',
    'public_runtime_mutation',
    'export_rows',
    'release_actions',
    'source_acceptance_claims',
    'route_payload_field_hits',
    'forbidden_payload_field_hits',
    'acceptance_claims',
  ].reduce((sum, key) => sum + Number(counts[key] || 0), 0);
}

function pickFirstNumber(counts, keys) {
  for (const key of keys) {
    if (Number.isFinite(Number(counts[key])) && Number(counts[key]) > 0) return Number(counts[key]);
  }
  return 0;
}

function assertArtifact(artifact, expectedType, artifactPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${artifactPath} artifact_type mismatch; expected ${expectedType}`);
  }
}

function writeReport(reportPath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Gate-Proof Coverage Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this packet observes downstream proof presence and exact missing proof rows.',
    '- No QA, source/license/legal, Definition, answer, runtime, publication, accepted-text, or route-ranking acceptance is claimed.',
    '',
    '## Counts',
    '',
    `- Coverage rows / Agent 3 artifacts checked: ${artifact.counts.coverage_rows}/${artifact.counts.agent3_artifacts_checked}`,
    `- Direct / aggregate / any gate proof rows: ${artifact.counts.direct_gate_proof_rows}/${artifact.counts.aggregate_handoff_gate_proof_rows}/${artifact.counts.rows_with_any_gate_proof}`,
    `- Direct+aggregate / aggregate-only / direct-only rows: ${artifact.counts.direct_and_aggregate_gate_proof_rows}/${artifact.counts.aggregate_only_gate_proof_rows}/${artifact.counts.direct_only_gate_proof_rows}`,
    `- Missing gate-proof / exact blocker rows: ${artifact.counts.missing_gate_proof_rows}/${artifact.counts.exact_blocker_rows}`,
    `- Candidate-use rows / occurrences: ${artifact.counts.candidate_use_rows}/${artifact.counts.candidate_use_occurrences}`,
    `- Source RID refs / unique RIDs: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}`,
    `- Source citation missing / transform rule missing / route recheck required: ${artifact.counts.source_citation_missing_rows}/${artifact.counts.transform_rule_missing_rows}/${artifact.counts.route_recheck_required_rows}`,
    `- Direct gate-proof authority issues / Agent 3 authority issues / transform-ready rows: ${artifact.counts.direct_gate_proof_authority_issue_rows}/${artifact.counts.agent3_authority_issue_rows}/${artifact.counts.transform_ready_rows}`,
    '',
    '## Coverage Rows',
    '',
    '| role | gate proof status | Agent 3 rows | occurrences | direct proof | aggregate proof | blocker |',
    '| --- | --- | ---: | ---: | --- | --- | --- |',
    ...artifact.coverage_rows.map((row) =>
      [
        row.role,
        row.gate_proof_status,
        row.agent3_row_count,
        row.agent3_occurrence_count,
        row.direct_gate_proof_path || '-',
        row.aggregate_handoff_gate_proof_path || '-',
        row.exact_blocker || '-',
      ].join(' | '),
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.owner}`,
    '- Stop condition: coverage matrix emitted with exact missing gate-proof rows; no broad discovery or acceptance action taken.',
  ];
  writeText(reportPath, lines.join('\n') + '\n');
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        `Usage: node scripts/build_agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch.mjs [--output=PATH] [--report=PATH]`,
      );
      process.exit(0);
    }
    if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent4-handoff-index-gate-proof=')) {
      parsed.agent4HandoffIndexGateProof = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent4-overlap-gate-proof=')) {
      parsed.agent4OverlapGateProof = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent4-split-closure-gate-proof=')) {
      parsed.agent4SplitClosureGateProof = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent4-row-lineage-gate-proof=')) {
      parsed.agent4RowLineageGateProof = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent4-agent1-route-recheck-gate-proof=')) {
      parsed.agent4Agent1RouteRecheckGateProof = cleanRelativePath(valueAfterEquals(arg));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
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

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
