#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  zeroTextPackage:
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  preboundaryMatrix: 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  rowLineage: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
  sourceCitationDependency:
    'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
  currentBlockerIndex:
    'reports/agent3-old-dictionary-candidate-use-current-blocker-index-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));

const zeroTextPackage = readJson(options.zeroTextPackage);
const preboundaryMatrix = readJson(options.preboundaryMatrix);
const rowLineage = readJson(options.rowLineage);
const sourceCitationDependency = readJson(options.sourceCitationDependency);
const currentBlockerIndex = readJson(options.currentBlockerIndex);

assertArtifact(
  zeroTextPackage,
  'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  options.zeroTextPackage,
);
assertArtifact(preboundaryMatrix, 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix', options.preboundaryMatrix);
assertArtifact(rowLineage, 'agent3_old_dictionary_candidate_use_row_lineage_matrix', options.rowLineage);
assertArtifact(
  sourceCitationDependency,
  'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch',
  options.sourceCitationDependency,
);
assertArtifact(currentBlockerIndex, 'agent3_old_dictionary_candidate_use_current_blocker_index', options.currentBlockerIndex);

const packageRows = zeroTextPackage.package_rows || [];
const preboundaryByQueue = indexBy(preboundaryMatrix.rows || [], 'queue_id');
const lineageByQueue = indexBy(rowLineage.row_lineage || [], 'queue_id');
const dependencyByQueue = indexBy(sourceCitationDependency.row_dependency_rows || [], 'queue_id');
const packageBlockers = (currentBlockerIndex.blocker_rows || []).map((row) => row.blocker_id);

const rowBlockerMatrix = packageRows.map((packageRow) => {
  const queueId = packageRow.queue_id;
  const preboundary = preboundaryByQueue.get(queueId) || {};
  const lineage = lineageByQueue.get(queueId) || {};
  const dependency = dependencyByQueue.get(queueId) || {};
  const rowBlockers = [
    ...packageBlockers,
    dependency.exact_lineage_blocker,
    dependency.agent1_route_blocker,
  ].filter(Boolean);
  const uniqueBlockers = [...new Set(rowBlockers)];

  return {
    row_id: `agent3-row-blocker-${queueId}`,
    queue_id: queueId,
    token_id: packageRow.token_id || preboundary.token_id || lineage.token_id || dependency.token_id || '',
    lexicon_entry_id:
      packageRow.lexicon_entry_id || preboundary.lexicon_entry_id || lineage.lexicon_entry_id || dependency.lexicon_entry_id || '',
    surface: preboundary.surface || '',
    normalized: preboundary.normalized || '',
    occurrences: Number(packageRow.occurrences || preboundary.occurrences || lineage.occurrences || dependency.occurrences || 0),
    source_license_lane:
      packageRow.source_license_lane || preboundary.license_lane || lineage.license_lane || dependency.source_license_lane || '',
    relation_class: packageRow.relation_class || preboundary.preview_relation_class || '',
    morphology_relation_status: packageRow.morphology_relation_status || preboundary.morphology_relation_status || '',
    partition: lineage.partition || dependency.partition || '',
    triage_group: lineage.triage_group || dependency.triage_group || '',
    source_families: unique([...(dependency.source_families || []), ...(preboundary.source_family_hits || [])]),
    source_rids: unique([...(dependency.source_rids || []), ...(preboundary.public_domain_rids || [])]),
    source_rid_count: unique([...(dependency.source_rids || []), ...(preboundary.public_domain_rids || [])]).length,
    public_domain_headword_count: (preboundary.public_domain_headwords || []).length,
    package_row_linked: Boolean(packageRow.queue_id),
    preboundary_row_linked: Boolean(preboundary.queue_id),
    lineage_row_linked: Boolean(lineage.queue_id),
    dependency_row_linked: Boolean(dependency.queue_id),
    source_citation_or_url_present: false,
    source_citation_missing: true,
    transform_rule_present: false,
    transform_rule_missing: true,
    route_recheck_required: true,
    gate_proof_boundary_chain_missing: true,
    gate_proof_source_citation_dependency_missing: true,
    agent6_boundary_required_before_next_use: true,
    candidate_text_rows_now: Number(packageRow.candidate_text_rows_now || preboundary.candidate_text_rows_now || 0),
    definition_candidate_rows_now: Number(packageRow.definition_candidate_rows_now || preboundary.definition_candidate_rows_now || 0),
    lemma_candidate_rows_now: Number(packageRow.lemma_candidate_rows_now || preboundary.lemma_candidate_rows_now || 0),
    reader_hint_candidate_rows_now: Number(packageRow.reader_hint_candidate_rows_now || preboundary.reader_hint_candidate_rows_now || 0),
    answer_eligible_rows_now: Number(packageRow.answer_eligible_rows_now || preboundary.answer_eligible_rows_now || 0),
    public_emit_rows_now: Number(packageRow.public_emit_rows_now || preboundary.public_emit_rows_now || 0),
    route_writes: Number(packageRow.route_writes || preboundary.route_writes || 0),
    accepted_text_rows: Number(packageRow.accepted_text_rows || preboundary.accepted_text_rows || 0),
    export_rows: Number(packageRow.export_rows || 0),
    release_actions: Number(packageRow.release_actions || 0),
    current_blocker_ids: uniqueBlockers,
    current_blocker_count: uniqueBlockers.length,
    lineage_statuses: lineage.lineage_statuses || {},
    downstream_transform_status:
      lineage.downstream_transform_status || 'not_transform_ready_missing_source_citation_or_url_and_transform_rule',
    evidence_role: 'row_blocker_navigation_only_no_text_or_acceptance_claim',
    dedupe_key: sha256([queueId, packageRow.token_id, packageRow.lexicon_entry_id, uniqueBlockers.join('|')].join('|')),
  };
});

const sourceRidSet = new Set();
for (const row of rowBlockerMatrix) {
  for (const rid of row.source_rids) sourceRidSet.add(rid);
}

const counts = {
  row_blocker_matrix_rows: rowBlockerMatrix.length,
  row_blocker_matrix_occurrences: sum(rowBlockerMatrix, 'occurrences'),
  unique_queue_ids: new Set(rowBlockerMatrix.map((row) => row.queue_id)).size,
  unique_token_ids: new Set(rowBlockerMatrix.map((row) => row.token_id)).size,
  package_rows_linked: rowBlockerMatrix.filter((row) => row.package_row_linked).length,
  preboundary_rows_linked: rowBlockerMatrix.filter((row) => row.preboundary_row_linked).length,
  lineage_rows_linked: rowBlockerMatrix.filter((row) => row.lineage_row_linked).length,
  dependency_rows_linked: rowBlockerMatrix.filter((row) => row.dependency_row_linked).length,
  rows_missing_preboundary: rowBlockerMatrix.filter((row) => !row.preboundary_row_linked).length,
  rows_missing_lineage: rowBlockerMatrix.filter((row) => !row.lineage_row_linked).length,
  rows_missing_dependency: rowBlockerMatrix.filter((row) => !row.dependency_row_linked).length,
  source_rid_references: rowBlockerMatrix.reduce((total, row) => total + row.source_rid_count, 0),
  unique_source_rids: sourceRidSet.size,
  rows_with_source_rids: rowBlockerMatrix.filter((row) => row.source_rid_count > 0).length,
  blocker_links: rowBlockerMatrix.reduce((total, row) => total + row.current_blocker_count, 0),
  rows_with_current_blockers: rowBlockerMatrix.filter((row) => row.current_blocker_count > 0).length,
  rows_missing_source_citation: rowBlockerMatrix.filter((row) => row.source_citation_missing).length,
  rows_missing_transform_rule: rowBlockerMatrix.filter((row) => row.transform_rule_missing).length,
  rows_route_recheck_required: rowBlockerMatrix.filter((row) => row.route_recheck_required).length,
  rows_gate_proof_boundary_chain_missing: rowBlockerMatrix.filter((row) => row.gate_proof_boundary_chain_missing).length,
  rows_gate_proof_source_citation_dependency_missing: rowBlockerMatrix.filter(
    (row) => row.gate_proof_source_citation_dependency_missing,
  ).length,
  agent6_boundary_required_rows: rowBlockerMatrix.filter((row) => row.agent6_boundary_required_before_next_use).length,
  pure_partition_rows: rowBlockerMatrix.filter((row) => row.partition === 'pure_commercial_workset').length,
  overlap_partition_rows: rowBlockerMatrix.filter((row) => row.partition === 'overlap_workset').length,
  candidate_text_rows: sum(rowBlockerMatrix, 'candidate_text_rows_now'),
  definition_content_rows: sum(rowBlockerMatrix, 'definition_candidate_rows_now'),
  lemma_content_rows: sum(rowBlockerMatrix, 'lemma_candidate_rows_now'),
  reader_hint_content_rows: sum(rowBlockerMatrix, 'reader_hint_candidate_rows_now'),
  answer_rows: 0,
  answer_eligible_rows: sum(rowBlockerMatrix, 'answer_eligible_rows_now'),
  route_jsonl_rows: 0,
  route_shard_writes: sum(rowBlockerMatrix, 'route_writes'),
  source_text_rows: 0,
  accepted_text_rows: sum(rowBlockerMatrix, 'accepted_text_rows'),
  public_runtime_mutation: 0,
  export_rows: sum(rowBlockerMatrix, 'export_rows'),
  release_actions: sum(rowBlockerMatrix, 'release_actions'),
  source_acceptance_claims: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_row_blocker_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_row_blocker_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_row_blocker_navigation_matrix',
  authority_boundary: {
    linkage_navigation_only: true,
    row_blocker_matrix_only: true,
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
  inputs: {
    zero_text_package: options.zeroTextPackage,
    preboundary_matrix: options.preboundaryMatrix,
    row_lineage: options.rowLineage,
    source_citation_dependency: options.sourceCitationDependency,
    current_blocker_index: options.currentBlockerIndex,
  },
  counts,
  matrix_rows: rowBlockerMatrix,
  downstream_handoff: {
    owner: 'Agent 10 release/package intake; Agent 6 only through exact boundary packet',
    no_acceptance_claim: true,
    no_publication_claim: true,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(
  `Agent 3 row blocker matrix rows=${counts.row_blocker_matrix_rows} blockers=${counts.blocker_links} affected=${counts.row_blocker_matrix_occurrences}`,
);

function writeReport(reportPath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Row Blocker Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this matrix links rows to current blockers and does not supply source citations, transform rules, proposed text, definitions, answer eligibility, route writes, or acceptance.',
    '',
    '## Counts',
    '',
    `- Matrix rows / occurrences: ${artifact.counts.row_blocker_matrix_rows}/${artifact.counts.row_blocker_matrix_occurrences}`,
    `- Package / preboundary / lineage / dependency rows linked: ${artifact.counts.package_rows_linked}/${artifact.counts.preboundary_rows_linked}/${artifact.counts.lineage_rows_linked}/${artifact.counts.dependency_rows_linked}`,
    `- Source RID refs / unique RIDs / rows with RIDs: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.rows_with_source_rids}`,
    `- Blocker links / rows with blockers: ${artifact.counts.blocker_links}/${artifact.counts.rows_with_current_blockers}`,
    `- Missing source citation / transform rule / Agent 6 boundary rows: ${artifact.counts.rows_missing_source_citation}/${artifact.counts.rows_missing_transform_rule}/${artifact.counts.agent6_boundary_required_rows}`,
    `- Gate-proof boundary-chain / source-citation-dependency missing rows: ${artifact.counts.rows_gate_proof_boundary_chain_missing}/${artifact.counts.rows_gate_proof_source_citation_dependency_missing}`,
    `- Pure / overlap partition rows: ${artifact.counts.pure_partition_rows}/${artifact.counts.overlap_partition_rows}`,
    `- Candidate text / answer eligible / route writes / public mutation / release actions: ${artifact.counts.candidate_text_rows}/${artifact.counts.answer_eligible_rows}/${artifact.counts.route_shard_writes}/${artifact.counts.public_runtime_mutation}/${artifact.counts.release_actions}`,
    '',
    '## Sample Rows',
    '',
    '| queue_id | token_id | occurrences | partition | source_rids | blocker_count |',
    '| --- | --- | ---: | --- | ---: | ---: |',
    ...artifact.matrix_rows
      .slice(0, 10)
      .map((row) =>
        [row.queue_id, row.token_id, row.occurrences, row.partition || '-', row.source_rid_count, row.current_blocker_count].join(
          ' | ',
        ),
      ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.owner}`,
    '- Stop condition: 78-row blocker matrix emitted; no broad discovery, text output, route delivery, or acceptance action taken.',
  ];
  writeText(reportPath, lines.join('\n') + '\n');
}

function assertArtifact(artifact, expectedType, artifactPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${artifactPath} artifact_type mismatch; expected ${expectedType}`);
  }
}

function indexBy(rows, key) {
  return new Map(rows.map((row) => [row[key], row]));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_row_blocker_matrix.mjs [--output=PATH] [--report=PATH]',
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

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
