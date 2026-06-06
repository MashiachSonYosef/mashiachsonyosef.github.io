#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  rowLineageMatrix: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
  agent10PreboundaryMatrix: 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  agent10ZeroTextPlanning:
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  agent6PreboundaryVerdict: 'reports/agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.json',
  agent6ZeroTextVerdict:
    'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  agent10VerdictConsumption: 'reports/agent10-old-dictionary-78-row-agent6-verdict-consumption-2026-06-06.json',
  agent10ZeroTextConsumption:
    'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json',
  agent10TransformBlockerConsumption:
    'reports/agent10-old-dictionary-78-row-agent2-transform-output-blocker-consumption-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const rowLineageMatrix = readJson(options.rowLineageMatrix);
const agent10PreboundaryMatrix = readJson(options.agent10PreboundaryMatrix);
const agent10ZeroTextPlanning = readJson(options.agent10ZeroTextPlanning);
const agent6PreboundaryVerdict = readJson(options.agent6PreboundaryVerdict);
const agent6ZeroTextVerdict = readJson(options.agent6ZeroTextVerdict);
const agent10VerdictConsumption = readJson(options.agent10VerdictConsumption);
const agent10ZeroTextConsumption = readJson(options.agent10ZeroTextConsumption);
const agent10TransformBlockerConsumption = readJson(options.agent10TransformBlockerConsumption);

assertArtifact(rowLineageMatrix, 'agent3_old_dictionary_candidate_use_row_lineage_matrix', options.rowLineageMatrix);
assertArtifact(
  agent10PreboundaryMatrix,
  'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix',
  options.agent10PreboundaryMatrix,
);
assertArtifact(
  agent10ZeroTextPlanning,
  'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  options.agent10ZeroTextPlanning,
);
assertArtifact(
  agent6PreboundaryVerdict,
  'agent6_old_dictionary_78_row_candidate_use_preboundary_verdict',
  options.agent6PreboundaryVerdict,
);
assertArtifact(
  agent6ZeroTextVerdict,
  'agent6_old_dictionary_78_row_zero_text_candidate_use_package_verdict',
  options.agent6ZeroTextVerdict,
);
assertArtifact(
  agent10VerdictConsumption,
  'agent10_old_dictionary_78_row_agent6_verdict_consumption',
  options.agent10VerdictConsumption,
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

const lineageRows = rowLineageMatrix.row_lineage || [];
const preboundaryRows = agent10PreboundaryMatrix.rows || [];
const zeroTextRows = agent10ZeroTextPlanning.package_rows || [];
const preboundaryByQueueId = indexByQueueId(preboundaryRows);
const zeroTextByQueueId = indexByQueueId(zeroTextRows);
const lineageByQueueId = indexByQueueId(lineageRows);
const preboundaryMissing = lineageRows.filter((row) => !preboundaryByQueueId.has(row.queue_id));
const zeroTextMissing = lineageRows.filter((row) => !zeroTextByQueueId.has(row.queue_id));
const preboundaryExtra = preboundaryRows.filter((row) => !lineageByQueueId.has(row.queue_id));
const zeroTextExtra = zeroTextRows.filter((row) => !lineageByQueueId.has(row.queue_id));

const preboundaryCounterFields = [
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'route_writes',
  'accepted_text_rows',
];
const zeroTextCounterFields = [
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'route_writes',
  'accepted_text_rows',
  'export_rows',
  'release_actions',
];

const rowCrossmatch = lineageRows
  .slice()
  .sort((left, right) => partitionRank(left.partition) - partitionRank(right.partition) || right.occurrences - left.occurrences)
  .map((lineageRow) => buildRowCrossmatch(lineageRow));

const boundaryStepRows = buildBoundaryStepRows();
const blockerRows = buildBlockerRows(rowCrossmatch);
const currentTransformBlockerRows = (agent10TransformBlockerConsumption.exact_blockers || []).map((blocker, index) => ({
  row_id: `agent3-boundary-chain-current-transform-blocker-${index + 1}`,
  exact_blocker: blocker,
  source_artifact: options.agent10TransformBlockerConsumption,
  status: 'observed_current_transform_blocker_no_agent3_acceptance',
  dedupe_key: sha256([blocker, index].join('|')),
}));

const counts = {
  row_crossmatch_rows: rowCrossmatch.length,
  row_crossmatch_occurrences: sum(rowCrossmatch, (row) => row.occurrences),
  lineage_rows: lineageRows.length,
  preboundary_matrix_rows: preboundaryRows.length,
  zero_text_package_rows: zeroTextRows.length,
  preboundary_rows_matched: rowCrossmatch.filter((row) => row.preboundary_matrix_link_status === 'linked').length,
  zero_text_rows_matched: rowCrossmatch.filter((row) => row.zero_text_package_link_status === 'linked').length,
  missing_preboundary_rows: preboundaryMissing.length,
  missing_zero_text_rows: zeroTextMissing.length,
  extra_preboundary_rows: preboundaryExtra.length,
  extra_zero_text_rows: zeroTextExtra.length,
  token_mismatch_rows: rowCrossmatch.filter((row) => row.token_id_consistency !== 'matched').length,
  occurrence_mismatch_rows: rowCrossmatch.filter((row) => row.occurrence_consistency !== 'matched').length,
  pure_workset_rows: rowCrossmatch.filter((row) => row.partition === 'pure_commercial_workset').length,
  pure_workset_occurrences: sum(
    rowCrossmatch.filter((row) => row.partition === 'pure_commercial_workset'),
    (row) => row.occurrences,
  ),
  overlap_workset_rows: rowCrossmatch.filter((row) => row.partition === 'overlap_workset').length,
  overlap_workset_occurrences: sum(
    rowCrossmatch.filter((row) => row.partition === 'overlap_workset'),
    (row) => row.occurrences,
  ),
  blocker_rows: blockerRows.length,
  boundary_step_rows: boundaryStepRows.length,
  current_transform_blocker_rows: currentTransformBlockerRows.length,
  preboundary_review_pointer_rows_in_source: preboundaryRows.filter((row) => hasReviewPointerFields(row)).length,
  copied_review_pointer_payload_fields: 0,
  preboundary_row_zero_counter_violations: rowCounterViolations(preboundaryRows, preboundaryCounterFields).length,
  zero_text_row_zero_counter_violations: rowCounterViolations(zeroTextRows, zeroTextCounterFields).length,
  agent6_preboundary_recount_rows: Number(agent6PreboundaryVerdict.recounted_scope?.rows || 0),
  agent6_preboundary_recount_occurrences: Number(agent6PreboundaryVerdict.recounted_scope?.occurrences || 0),
  agent6_zero_text_recount_rows: Number(agent6ZeroTextVerdict.recounted_scope?.rows || 0),
  agent6_zero_text_recount_occurrences: Number(agent6ZeroTextVerdict.recounted_scope?.occurrences || 0),
  agent10_transform_blocker_rows: Number(agent10TransformBlockerConsumption.agent2_return_consumed?.rows || 0),
  agent10_transform_blocker_occurrences: Number(agent10TransformBlockerConsumption.agent2_return_consumed?.occurrences || 0),
  source_rid_references: sum(rowCrossmatch, (row) => row.source_rid_count),
  unique_source_rids: new Set(rowCrossmatch.flatMap((row) => row.source_rids)).size,
  transform_ready_rows: 0,
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
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_boundary_chain_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_boundary_chain_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'crossmatch Agent 3 candidate-use row lineage against Agent 10/Agent 6 preboundary, zero-text planning, and current transform blocker artifacts',
  inputs: {
    row_lineage_matrix: options.rowLineageMatrix,
    agent10_preboundary_matrix: options.agent10PreboundaryMatrix,
    agent10_zero_text_planning: options.agent10ZeroTextPlanning,
    agent6_preboundary_verdict: options.agent6PreboundaryVerdict,
    agent6_zero_text_verdict: options.agent6ZeroTextVerdict,
    agent10_verdict_consumption: options.agent10VerdictConsumption,
    agent10_zero_text_consumption: options.agent10ZeroTextConsumption,
    agent10_transform_blocker_consumption: options.agent10TransformBlockerConsumption,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    boundary_chain_crossmatch_only: true,
    candidate_use_planning_evidence_only: true,
    source_rid_identifier_continuity_only: true,
    external_boundary_status_observation_only: true,
    agent3_acceptance_authority: false,
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
    source_license_acceptance: false,
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  counts,
  boundary_step_rows: boundaryStepRows,
  blocker_rows: blockerRows,
  current_transform_blocker_rows: currentTransformBlockerRows,
  row_crossmatch: rowCrossmatch,
  downstream_handoff: {
    package_owner: 'Agent 10',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_current_blocker: agent10TransformBlockerConsumption.exact_current_blocker || '',
    stop_condition:
      'Use this boundary-chain crossmatch only to navigate Agent 3 row lineage against Agent 10/Agent 6 non-public planning artifacts and current blockers. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, export, publication readiness, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 boundary chain crossmatch rows=${counts.row_crossmatch_rows} preboundary=${counts.preboundary_rows_matched} zero_text=${counts.zero_text_rows_matched} blockers=${counts.current_transform_blocker_rows}`,
);

function buildRowCrossmatch(lineageRow) {
  const preboundaryRow = preboundaryByQueueId.get(lineageRow.queue_id) || null;
  const zeroTextRow = zeroTextByQueueId.get(lineageRow.queue_id) || null;
  const preboundaryOccurrences = Number(preboundaryRow?.occurrences || 0);
  const zeroTextOccurrences = Number(zeroTextRow?.occurrences || 0);
  return {
    row_id: `agent3-boundary-chain-crossmatch-${lineageRow.queue_id}`,
    queue_id: lineageRow.queue_id,
    token_id: lineageRow.token_id,
    lexicon_entry_id: lineageRow.lexicon_entry_id,
    occurrences: Number(lineageRow.occurrences || 0),
    partition: lineageRow.partition,
    triage_group: lineageRow.triage_group,
    row_subset_id: lineageRow.row_subset_id,
    exact_blocker: lineageRow.exact_blocker,
    source_families: lineageRow.source_families,
    source_rids: lineageRow.source_rids,
    source_rid_count: Number(lineageRow.source_rid_count || 0),
    agent3_lineage_row_id: lineageRow.row_id,
    preboundary_matrix_link_status: preboundaryRow ? 'linked' : 'missing',
    zero_text_package_link_status: zeroTextRow ? 'linked' : 'missing',
    token_id_consistency:
      preboundaryRow?.token_id === lineageRow.token_id && zeroTextRow?.token_id === lineageRow.token_id ? 'matched' : 'mismatched',
    occurrence_consistency:
      preboundaryOccurrences === lineageRow.occurrences && zeroTextOccurrences === lineageRow.occurrences
        ? 'matched'
        : 'mismatched',
    preboundary_zero_counters_status: rowHasZeroCounters(preboundaryRow, preboundaryCounterFields) ? 'all_zero' : 'nonzero_or_missing',
    zero_text_zero_counters_status: rowHasZeroCounters(zeroTextRow, zeroTextCounterFields) ? 'all_zero' : 'nonzero_or_missing',
    preboundary_review_pointer_payload_not_copied: true,
    external_boundary_status: 'observed_nonpublic_planning_chain_no_agent3_acceptance',
    current_transform_blocker: agent10TransformBlockerConsumption.exact_current_blocker || '',
    evidence_role: 'boundary_chain_row_crossmatch_navigation_only_no_transform_or_definition_authority',
    dedupe_key: sha256([lineageRow.queue_id, lineageRow.token_id, lineageRow.partition].join('|')),
  };
}

function buildBoundaryStepRows() {
  return [
    {
      row_id: 'agent3-boundary-chain-step-agent10-preboundary-matrix',
      source_artifact: options.agent10PreboundaryMatrix,
      artifact_type: agent10PreboundaryMatrix.artifact_type,
      observed_status: agent10PreboundaryMatrix.status,
      rows: Number(agent10PreboundaryMatrix.counts?.rows || 0),
      occurrences: Number(agent10PreboundaryMatrix.counts?.occurrences || 0),
      zero_text_or_output_counters_nonzero: sumNamedCounters(agent10PreboundaryMatrix.counts || {}, [
        'candidate_text_rows_now',
        'definition_candidate_rows_now',
        'lemma_candidate_rows_now',
        'reader_hint_candidate_rows_now',
        'answer_eligible_rows_now',
        'public_emit_rows_now',
        'route_writes',
        'accepted_text_rows',
        'release_actions',
      ]),
      evidence_role: 'external_boundary_step_observed_only',
      dedupe_key: sha256(options.agent10PreboundaryMatrix),
    },
    {
      row_id: 'agent3-boundary-chain-step-agent6-preboundary-verdict',
      source_artifact: options.agent6PreboundaryVerdict,
      artifact_type: agent6PreboundaryVerdict.artifact_type,
      observed_status: agent6PreboundaryVerdict.disposition,
      rows: Number(agent6PreboundaryVerdict.recounted_scope?.rows || 0),
      occurrences: Number(agent6PreboundaryVerdict.recounted_scope?.occurrences || 0),
      zero_text_or_output_counters_nonzero: sumNamedCounters(agent6PreboundaryVerdict.recounted_scope || {}, [
        'candidate_text_rows',
        'definition_candidate_rows',
        'lemma_candidate_rows',
        'reader_hint_candidate_rows',
        'answer_eligible_rows',
        'public_emit_rows',
        'route_writes',
        'accepted_text_rows',
        'public_runtime_mutation',
        'release_actions',
      ]),
      evidence_role: 'external_boundary_step_observed_only_not_agent3_acceptance',
      dedupe_key: sha256(options.agent6PreboundaryVerdict),
    },
    {
      row_id: 'agent3-boundary-chain-step-agent10-zero-text-planning',
      source_artifact: options.agent10ZeroTextPlanning,
      artifact_type: agent10ZeroTextPlanning.artifact_type,
      observed_status: agent10ZeroTextPlanning.status,
      rows: Number(agent10ZeroTextPlanning.counts?.rows || 0),
      occurrences: Number(agent10ZeroTextPlanning.counts?.occurrences || 0),
      zero_text_or_output_counters_nonzero: sumNamedCounters(agent10ZeroTextPlanning.counts || {}, [
        'candidate_text_rows_now',
        'definition_candidate_rows_now',
        'lemma_candidate_rows_now',
        'reader_hint_candidate_rows_now',
        'answer_eligible_rows_now',
        'public_emit_rows_now',
        'route_writes',
        'accepted_text_rows',
        'public_runtime_mutation',
        'export_rows',
        'release_actions',
      ]),
      evidence_role: 'external_boundary_step_observed_only',
      dedupe_key: sha256(options.agent10ZeroTextPlanning),
    },
    {
      row_id: 'agent3-boundary-chain-step-agent6-zero-text-verdict',
      source_artifact: options.agent6ZeroTextVerdict,
      artifact_type: agent6ZeroTextVerdict.artifact_type,
      observed_status: agent6ZeroTextVerdict.disposition,
      rows: Number(agent6ZeroTextVerdict.recounted_scope?.rows || 0),
      occurrences: Number(agent6ZeroTextVerdict.recounted_scope?.occurrences || 0),
      zero_text_or_output_counters_nonzero: sumNamedCounters(agent6ZeroTextVerdict.recounted_scope || {}, [
        'candidate_text_rows',
        'definition_candidate_rows',
        'lemma_candidate_rows',
        'reader_hint_candidate_rows',
        'answer_eligible_rows',
        'public_emit_rows',
        'route_writes',
        'accepted_text_rows',
        'public_runtime_mutation',
        'export_rows',
        'release_actions',
      ]),
      evidence_role: 'external_boundary_step_observed_only_not_agent3_acceptance',
      dedupe_key: sha256(options.agent6ZeroTextVerdict),
    },
    {
      row_id: 'agent3-boundary-chain-step-agent10-transform-blocker',
      source_artifact: options.agent10TransformBlockerConsumption,
      artifact_type: agent10TransformBlockerConsumption.artifact_type,
      observed_status: agent10TransformBlockerConsumption.status,
      rows: Number(agent10TransformBlockerConsumption.agent2_return_consumed?.rows || 0),
      occurrences: Number(agent10TransformBlockerConsumption.agent2_return_consumed?.occurrences || 0),
      zero_text_or_output_counters_nonzero: sumNamedCounters(agent10TransformBlockerConsumption.agent2_return_consumed || {}, [
        'candidate_text_rows',
        'definition_lemma_reader_hint_rows',
        'answer_eligible_rows',
        'public_emit_rows',
        'route_writes',
        'accepted_text_rows',
        'export_rows',
        'release_actions',
      ]),
      evidence_role: 'current_transform_blocker_observed_only',
      dedupe_key: sha256(options.agent10TransformBlockerConsumption),
    },
  ];
}

function buildBlockerRows(rows) {
  const grouped = groupBy(rows, (row) => row.exact_blocker);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([exactBlocker, blockerRows]) => ({
      row_id: `agent3-boundary-chain-blocker-${sha256(exactBlocker).slice(0, 12)}`,
      exact_blocker: exactBlocker,
      candidate_rows: blockerRows.length,
      candidate_occurrences: sum(blockerRows, (row) => row.occurrences),
      partitions: [...new Set(blockerRows.map((row) => row.partition))].sort(),
      status: 'lineage_blocker_distribution_observed_only_no_transform_authority',
      dedupe_key: sha256([exactBlocker, blockerRows.length, sum(blockerRows, (row) => row.occurrences)].join('|')),
    }));
}

function writeMarkdown(outputPath, artifact) {
  const rows = [
    '# Agent 3 Old-Dictionary Candidate-Use Boundary Chain Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: crossmatch/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, export, publication readiness, or release action.',
    '',
    '## Counts',
    '',
    `- Row crossmatch rows / occurrences: ${artifact.counts.row_crossmatch_rows}/${artifact.counts.row_crossmatch_occurrences}`,
    `- Agent 3 lineage / Agent 10 preboundary / zero-text rows: ${artifact.counts.lineage_rows}/${artifact.counts.preboundary_matrix_rows}/${artifact.counts.zero_text_package_rows}`,
    `- Matched preboundary / zero-text rows: ${artifact.counts.preboundary_rows_matched}/${artifact.counts.zero_text_rows_matched}`,
    `- Missing preboundary / zero-text rows: ${artifact.counts.missing_preboundary_rows}/${artifact.counts.missing_zero_text_rows}`,
    `- Extra preboundary / zero-text rows: ${artifact.counts.extra_preboundary_rows}/${artifact.counts.extra_zero_text_rows}`,
    `- Token / occurrence mismatch rows: ${artifact.counts.token_mismatch_rows}/${artifact.counts.occurrence_mismatch_rows}`,
    `- Pure + overlap closure: ${artifact.counts.pure_workset_rows} + ${artifact.counts.overlap_workset_rows} = ${artifact.counts.row_crossmatch_rows}; occurrences ${artifact.counts.pure_workset_occurrences} + ${artifact.counts.overlap_workset_occurrences} = ${artifact.counts.row_crossmatch_occurrences}`,
    `- Review pointer rows detected in preboundary source / copied payload fields: ${artifact.counts.preboundary_review_pointer_rows_in_source}/${artifact.counts.copied_review_pointer_payload_fields}`,
    `- Preboundary / zero-text row zero-counter violations: ${artifact.counts.preboundary_row_zero_counter_violations}/${artifact.counts.zero_text_row_zero_counter_violations}`,
    `- Current transform blockers / exact blocker groups: ${artifact.counts.current_transform_blocker_rows}/${artifact.counts.blocker_rows}`,
    `- Transform-ready / forbidden payload / acceptance claims: ${artifact.counts.transform_ready_rows}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Current Blocker',
    '',
    `- ${artifact.downstream_handoff.exact_current_blocker}`,
    '',
    '## Chain Steps',
    '',
    '| step | rows | occurrences | nonzero output counters | role |',
    '|---|---:|---:|---:|---|',
    ...artifact.boundary_step_rows.map(
      (row) =>
        `| ${mdCell(row.source_artifact)} | ${row.rows} | ${row.occurrences} | ${row.zero_text_or_output_counters_nonzero} | ${mdCell(row.evidence_role)} |`,
    ),
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];

  fs.writeFileSync(path.resolve(root, outputPath), `${rows.join('\n')}\n`);
}

function hasReviewPointerFields(row) {
  return Boolean(row?.surface || row?.normalized || row?.public_domain_headwords || row?.public_domain_rids);
}

function rowCounterViolations(rows, fields) {
  return rows.filter((row) => !rowHasZeroCounters(row, fields));
}

function rowHasZeroCounters(row, fields) {
  if (!row) return false;
  return fields.every((field) => Number(row[field] || 0) === 0);
}

function sumNamedCounters(value, fields) {
  return fields.reduce((total, field) => total + Number(value[field] || 0), 0);
}

function countForbiddenPayloadKeys(value) {
  let hits = 0;
  walk(value, (key, child, parentKey) => {
    if (parentKey === 'authority_boundary') return;
    if (
      [
        'surface',
        'normalized',
        'token_surface',
        'token_normalized',
        'focus_surface',
        'focus_normalized',
        'candidate_text',
        'definition_text',
        'source_text',
        'accepted_text',
        'display_text',
        'route_payload',
        'public_domain_headwords',
        'public_domain_rids',
      ].includes(key)
    ) {
      hits += 1;
    }
  });
  return hits;
}

function walk(value, callback, parentKey = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback, parentKey);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child, parentKey);
    walk(child, callback, key);
  }
}

function indexByQueueId(rows) {
  return new Map(rows.map((row) => [row.queue_id, row]));
}

function groupBy(rows, keyFn) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return grouped;
}

function partitionRank(partition) {
  return partition === 'pure_commercial_workset' ? 0 : partition === 'overlap_workset' ? 1 : 99;
}

function sum(rows, valueFn) {
  return rows.reduce((total, row) => total + Number(valueFn(row) || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assertArtifact(value, artifactType, filePath) {
  if (value.artifact_type !== artifactType) {
    throw new Error(`${filePath} artifact_type mismatch: expected ${artifactType}; got ${value.artifact_type || 'missing'}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function writeJson(outputPath, value) {
  fs.writeFileSync(path.resolve(root, outputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function mdCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1 ? '' : arg.slice(index + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--row-lineage-matrix=')) parsed.rowLineageMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent10-preboundary-matrix=')) {
      parsed.agent10PreboundaryMatrix = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-zero-text-planning=')) {
      parsed.agent10ZeroTextPlanning = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent6-preboundary-verdict=')) {
      parsed.agent6PreboundaryVerdict = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent6-zero-text-verdict=')) {
      parsed.agent6ZeroTextVerdict = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-verdict-consumption=')) {
      parsed.agent10VerdictConsumption = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-zero-text-consumption=')) {
      parsed.agent10ZeroTextConsumption = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-transform-blocker-consumption=')) {
      parsed.agent10TransformBlockerConsumption = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}
