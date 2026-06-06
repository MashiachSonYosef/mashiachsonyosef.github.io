#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  continuityCrossmatch: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
  sourceFamilyBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
  sourceRidContinuityCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
  exactSubsetCrossmatch: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
  boundaryTriageNavigation:
    'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
  splitClosureCrossmatch: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json',
  handoffIndex: 'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const continuityCrossmatch = readJson(options.continuityCrossmatch);
const sourceFamilyBlockerMatrix = readJson(options.sourceFamilyBlockerMatrix);
const sourceRidContinuityCrossmatch = readJson(options.sourceRidContinuityCrossmatch);
const exactSubsetCrossmatch = readJson(options.exactSubsetCrossmatch);
const boundaryTriageNavigation = readJson(options.boundaryTriageNavigation);
const splitClosureCrossmatch = readJson(options.splitClosureCrossmatch);
const handoffIndex = readJson(options.handoffIndex);

assertArtifact(
  continuityCrossmatch,
  'agent3_old_dictionary_candidate_use_continuity_crossmatch',
  options.continuityCrossmatch,
);
assertArtifact(
  sourceFamilyBlockerMatrix,
  'agent3_old_dictionary_candidate_use_source_family_blocker_matrix',
  options.sourceFamilyBlockerMatrix,
);
assertArtifact(
  sourceRidContinuityCrossmatch,
  'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  options.sourceRidContinuityCrossmatch,
);
assertArtifact(
  exactSubsetCrossmatch,
  'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  options.exactSubsetCrossmatch,
);
assertArtifact(
  boundaryTriageNavigation,
  'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  options.boundaryTriageNavigation,
);
assertArtifact(
  splitClosureCrossmatch,
  'agent3_old_dictionary_candidate_use_split_closure_crossmatch',
  options.splitClosureCrossmatch,
);
assertArtifact(handoffIndex, 'agent3_old_dictionary_candidate_use_handoff_index', options.handoffIndex);

const continuityByQueueId = indexByQueueId(continuityCrossmatch.rows || []);
const sourceRidByQueueId = indexByQueueId(sourceRidContinuityCrossmatch.candidate_rows || []);
const exactSubsetByQueueId = indexByQueueId(exactSubsetCrossmatch.candidate_rows || []);
const triageByQueueId = indexByQueueId(boundaryTriageNavigation.candidate_rows || []);
const closureByQueueId = indexByQueueId(splitClosureCrossmatch.closure_rows || []);
const handoffRoles = (handoffIndex.handoff_entries || []).map((entry) => ({
  role: entry.role,
  artifact_path: entry.artifact_path,
  report_path: entry.report_path,
  validator_script: entry.validator_script,
  status: entry.status,
}));

const rowLineage = [...closureByQueueId.values()]
  .sort((left, right) => partitionRank(left.partition) - partitionRank(right.partition) || right.occurrences - left.occurrences)
  .map((closureRow) => buildLineageRow(closureRow));

const missingContinuity = rowLineage.filter((row) => row.lineage_statuses.continuity !== 'linked');
const missingSourceRid = rowLineage.filter((row) => row.lineage_statuses.source_rid !== 'linked');
const missingExactSubset = rowLineage.filter((row) => row.lineage_statuses.exact_subset !== 'linked');
const missingTriage = rowLineage.filter((row) => row.lineage_statuses.boundary_triage !== 'linked');
const missingSplitClosure = rowLineage.filter((row) => row.lineage_statuses.split_closure !== 'linked');
const queueIdDuplicates = duplicateValues(rowLineage.map((row) => row.queue_id));
const tokenIdDuplicates = duplicateValues(rowLineage.map((row) => row.token_id));
const blockerRows = buildBlockerRows(rowLineage);
const partitionRows = buildPartitionRows(rowLineage);
const sourceFamilySetRows = buildSourceFamilySetRows(rowLineage);
const lineageGapRows = buildLineageGapRows({
  missingContinuity,
  missingSourceRid,
  missingExactSubset,
  missingTriage,
  missingSplitClosure,
  queueIdDuplicates,
  tokenIdDuplicates,
});

const counts = {
  row_lineage_rows: rowLineage.length,
  row_lineage_occurrences: sum(rowLineage, (row) => row.occurrences),
  continuity_rows_linked: rowLineage.length - missingContinuity.length,
  source_rid_rows_linked: rowLineage.length - missingSourceRid.length,
  exact_subset_rows_linked: rowLineage.length - missingExactSubset.length,
  boundary_triage_rows_linked: rowLineage.length - missingTriage.length,
  split_closure_rows_linked: rowLineage.length - missingSplitClosure.length,
  rows_missing_continuity: missingContinuity.length,
  rows_missing_source_rid: missingSourceRid.length,
  rows_missing_exact_subset: missingExactSubset.length,
  rows_missing_boundary_triage: missingTriage.length,
  rows_missing_split_closure: missingSplitClosure.length,
  unique_queue_ids: new Set(rowLineage.map((row) => row.queue_id)).size,
  duplicate_queue_ids: queueIdDuplicates.length,
  unique_token_ids: new Set(rowLineage.map((row) => row.token_id)).size,
  duplicate_token_ids: tokenIdDuplicates.length,
  pure_workset_rows: rowLineage.filter((row) => row.partition === 'pure_commercial_workset').length,
  pure_workset_occurrences: sum(
    rowLineage.filter((row) => row.partition === 'pure_commercial_workset'),
    (row) => row.occurrences,
  ),
  overlap_workset_rows: rowLineage.filter((row) => row.partition === 'overlap_workset').length,
  overlap_workset_occurrences: sum(
    rowLineage.filter((row) => row.partition === 'overlap_workset'),
    (row) => row.occurrences,
  ),
  blocker_rows: blockerRows.length,
  partition_rows: partitionRows.length,
  source_family_set_rows: sourceFamilySetRows.length,
  lineage_gap_rows: lineageGapRows.length,
  rows_with_source_family_links: rowLineage.filter((row) => row.source_family_boundary_link_count > 0).length,
  source_family_membership_rows: sum(rowLineage, (row) => row.source_families.length),
  source_family_set_count: new Set(rowLineage.map((row) => row.source_family_set_key)).size,
  source_rid_references: sum(rowLineage, (row) => row.source_rid_count),
  unique_source_rids: new Set(rowLineage.flatMap((row) => row.source_rids)).size,
  source_rid_prefix_count: new Set(rowLineage.flatMap((row) => row.source_rid_prefixes)).size,
  rows_with_agent1_rid_metadata: rowLineage.filter((row) => row.agent1_metadata_status === 'present').length,
  rows_with_all_source_rids_in_agent1_metadata: rowLineage.filter(
    (row) => row.all_source_rids_in_agent1_metadata === true,
  ).length,
  handoff_artifact_roles: handoffRoles.length,
  handoff_roles_available: handoffRoles.filter((entry) => entry.status === 'evidence-ready').length,
  agent2_queue_pointer_rows: rowLineage.filter((row) => row.agent2_queue_pointer_status === 'present').length,
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
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_row_lineage_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_row_lineage_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'row-level lineage matrix for the 78 old-dictionary candidate-use rows across continuity, source-family, source-RID, exact-subset, triage, split-closure, and handoff packets',
  inputs: {
    continuity_crossmatch: options.continuityCrossmatch,
    source_family_blocker_matrix: options.sourceFamilyBlockerMatrix,
    source_rid_continuity_crossmatch: options.sourceRidContinuityCrossmatch,
    exact_subset_crossmatch: options.exactSubsetCrossmatch,
    boundary_triage_navigation: options.boundaryTriageNavigation,
    split_closure_crossmatch: options.splitClosureCrossmatch,
    handoff_index: options.handoffIndex,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    row_lineage_only: true,
    candidate_use_planning_evidence_only: true,
    source_rid_identifier_continuity_only: true,
    source_family_blocker_navigation_only: true,
    agent2_queue_pointer_only: true,
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
  lineage_gap_rows: lineageGapRows,
  partition_rows: partitionRows,
  blocker_rows: blockerRows,
  source_family_set_rows: sourceFamilySetRows,
  handoff_roles: handoffRoles,
  row_lineage: rowLineage,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_blocker_summary:
      'No lineage row is transform-ready. Pure rows need Agent 6 candidate-use boundary and morphology relation; overlap rows need Agent 6 source-family selection boundary.',
    stop_condition:
      'Use this row lineage matrix only to navigate candidate-use planning rows and exact blockers. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 row lineage rows=${counts.row_lineage_rows} linked=${counts.continuity_rows_linked}/${counts.source_rid_rows_linked}/${counts.exact_subset_rows_linked}/${counts.boundary_triage_rows_linked}/${counts.split_closure_rows_linked} gaps=${counts.lineage_gap_rows}`,
);

function buildLineageRow(closureRow) {
  const continuityRow = continuityByQueueId.get(closureRow.queue_id) || null;
  const sourceRidRow = sourceRidByQueueId.get(closureRow.queue_id) || null;
  const exactSubsetRow = exactSubsetByQueueId.get(closureRow.queue_id) || null;
  const triageRow = triageByQueueId.get(closureRow.queue_id) || null;
  const sourceFamilyLinks = continuityRow?.source_family_blocker_links || triageRow?.source_family_boundary_links || [];

  return {
    row_id: `agent3-candidate-use-row-lineage-${closureRow.queue_id}`,
    queue_id: closureRow.queue_id || '',
    agent2_queue_pointer_status: closureRow.queue_id ? 'present' : 'missing',
    token_id: closureRow.token_id || '',
    lexicon_entry_id: closureRow.lexicon_entry_id || null,
    occurrences: Number(closureRow.occurrences || 0),
    partition: closureRow.partition || '',
    triage_group: closureRow.triage_group || '',
    license_lane: closureRow.license_lane || '',
    row_subset_id: closureRow.row_subset_id || '',
    bucket_id: closureRow.bucket_id || '',
    classification_lanes: closureRow.classification_lanes || [],
    exact_blocker: closureRow.exact_blocker || '',
    source_families: closureRow.source_families || [],
    source_family_set_key: closureRow.source_family_set_key || '',
    source_family_boundary_link_count: sourceFamilyLinks.length,
    source_family_boundary_links: sourceFamilyLinks.map((link) => ({
      row_subset_id: link.row_subset_id || '',
      source_family: link.source_family || '',
      license_lane: link.license_lane || '',
      missing_before_transform: link.missing_before_transform || [],
      handoff_owner: link.handoff_owner || '',
    })),
    source_rids: sourceRidRow?.source_rids || closureRow.source_rids || [],
    source_rid_count: Number(sourceRidRow?.source_rid_count || closureRow.source_rid_count || 0),
    unique_source_rid_count: Number(sourceRidRow?.unique_source_rid_count || closureRow.unique_source_rid_count || 0),
    source_rid_prefixes: sourceRidRow?.source_rid_prefixes || closureRow.source_rid_prefixes || [],
    agent1_metadata_status: closureRow.agent1_metadata_status || sourceRidRow?.citation_metadata_status || '',
    all_source_rids_in_agent1_metadata: Boolean(
      closureRow.all_source_rids_in_agent1_metadata || sourceRidRow?.all_source_rids_in_agent1_metadata,
    ),
    lineage_artifacts: {
      continuity_row_id: continuityRow?.row_id || null,
      source_rid_row_id: sourceRidRow?.row_id || null,
      exact_subset_row_id: exactSubsetRow?.row_id || null,
      boundary_triage_row_id: triageRow?.row_id || null,
      split_closure_row_id: closureRow.row_id || null,
    },
    lineage_statuses: {
      continuity: continuityRow ? 'linked' : 'missing',
      source_rid: sourceRidRow ? 'linked' : 'missing',
      exact_subset: exactSubsetRow ? 'linked' : 'missing',
      boundary_triage: triageRow ? 'linked' : 'missing',
      split_closure: closureRow ? 'linked' : 'missing',
    },
    handoff_roles_available: handoffRoles.length,
    evidence_role: 'row_lineage_navigation_only_no_transform_or_definition_authority',
    downstream_transform_status:
      closureRow.downstream_transform_status || 'not_transform_ready_missing_exact_boundary_no_text_or_route_output',
    row_status: 'lineage_complete_non_authoritative_planning_evidence',
    dedupe_key: sha256([closureRow.queue_id || '', closureRow.token_id || '', closureRow.partition || ''].join('|')),
  };
}

function buildLineageGapRows(gaps) {
  const specs = [
    ['missing_continuity', gaps.missingContinuity],
    ['missing_source_rid', gaps.missingSourceRid],
    ['missing_exact_subset', gaps.missingExactSubset],
    ['missing_boundary_triage', gaps.missingTriage],
    ['missing_split_closure', gaps.missingSplitClosure],
    ['duplicate_queue_ids', gaps.queueIdDuplicates],
    ['duplicate_token_ids', gaps.tokenIdDuplicates],
  ];
  return specs
    .filter(([, rows]) => rows.length > 0)
    .map(([gapType, rows]) => ({
      row_id: `agent3-candidate-use-row-lineage-gap-${gapType}`,
      gap_type: gapType,
      affected_rows: rows.length,
      queue_id_sample: rows.slice(0, 12).map((row) => (typeof row === 'string' ? row : row.queue_id)),
      status: 'lineage_gap_exact_blocker',
      dedupe_key: sha256([gapType, rows.length].join('|')),
    }));
}

function buildPartitionRows(rows) {
  const grouped = groupBy(rows, (row) => row.partition);
  return [...grouped.entries()]
    .sort(([left], [right]) => partitionRank(left) - partitionRank(right))
    .map(([partition, partitionRows]) => ({
      row_id: `agent3-candidate-use-row-lineage-partition-${partition}`,
      partition,
      candidate_rows: partitionRows.length,
      candidate_occurrences: sum(partitionRows, (row) => row.occurrences),
      source_rid_references: sum(partitionRows, (row) => row.source_rid_count),
      unique_source_rids: new Set(partitionRows.flatMap((row) => row.source_rids)).size,
      source_family_set_count: new Set(partitionRows.map((row) => row.source_family_set_key)).size,
      exact_blocker_count: new Set(partitionRows.map((row) => row.exact_blocker)).size,
      status: partition === 'pure_commercial_workset'
        ? 'agent6_candidate_use_boundary_required'
        : 'agent6_source_family_selection_boundary_required',
      dedupe_key: sha256([partition, partitionRows.length, sum(partitionRows, (row) => row.occurrences)].join('|')),
    }));
}

function buildBlockerRows(rows) {
  const grouped = groupBy(rows, (row) => row.exact_blocker);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([exactBlocker, blockerRows]) => ({
      row_id: `agent3-candidate-use-row-lineage-blocker-${sha256(exactBlocker).slice(0, 12)}`,
      exact_blocker: exactBlocker,
      candidate_rows: blockerRows.length,
      candidate_occurrences: sum(blockerRows, (row) => row.occurrences),
      partitions: [...new Set(blockerRows.map((row) => row.partition))].sort(),
      triage_groups: [...new Set(blockerRows.map((row) => row.triage_group))].sort(),
      source_family_set_count: new Set(blockerRows.map((row) => row.source_family_set_key)).size,
      source_rid_references: sum(blockerRows, (row) => row.source_rid_count),
      unique_source_rids: new Set(blockerRows.flatMap((row) => row.source_rids)).size,
      status: 'exact_blocker_distribution_navigation_only_no_transform_authority',
      dedupe_key: sha256([exactBlocker, blockerRows.length, sum(blockerRows, (row) => row.occurrences)].join('|')),
    }));
}

function buildSourceFamilySetRows(rows) {
  const grouped = groupBy(rows, (row) => row.source_family_set_key);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceFamilySetKey, setRows]) => ({
      row_id: `agent3-candidate-use-row-lineage-source-family-set-${slug(sourceFamilySetKey)}`,
      source_family_set: setRows[0]?.source_families || [],
      candidate_rows: setRows.length,
      candidate_occurrences: sum(setRows, (row) => row.occurrences),
      partitions: [...new Set(setRows.map((row) => row.partition))].sort(),
      triage_groups: [...new Set(setRows.map((row) => row.triage_group))].sort(),
      exact_blockers: [...new Set(setRows.map((row) => row.exact_blocker))].sort(),
      source_rid_references: sum(setRows, (row) => row.source_rid_count),
      unique_source_rids: new Set(setRows.flatMap((row) => row.source_rids)).size,
      status: 'source_family_set_navigation_only_exact_boundary_required',
      dedupe_key: sha256([sourceFamilySetKey, setRows.length, sum(setRows, (row) => row.occurrences)].join('|')),
    }));
}

function writeMarkdown(outputPath, artifact) {
  const rows = [
    '# Agent 3 Old-Dictionary Candidate-Use Row Lineage Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: row lineage/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.',
    '',
    '## Counts',
    '',
    `- Row lineage rows / occurrences: ${artifact.counts.row_lineage_rows}/${artifact.counts.row_lineage_occurrences}`,
    `- Linked continuity/source-RID/exact-subset/triage/split rows: ${artifact.counts.continuity_rows_linked}/${artifact.counts.source_rid_rows_linked}/${artifact.counts.exact_subset_rows_linked}/${artifact.counts.boundary_triage_rows_linked}/${artifact.counts.split_closure_rows_linked}`,
    `- Missing lineage rows continuity/source-RID/exact-subset/triage/split: ${artifact.counts.rows_missing_continuity}/${artifact.counts.rows_missing_source_rid}/${artifact.counts.rows_missing_exact_subset}/${artifact.counts.rows_missing_boundary_triage}/${artifact.counts.rows_missing_split_closure}`,
    `- Pure + overlap closure: ${artifact.counts.pure_workset_rows} + ${artifact.counts.overlap_workset_rows} = ${artifact.counts.row_lineage_rows}; occurrences ${artifact.counts.pure_workset_occurrences} + ${artifact.counts.overlap_workset_occurrences} = ${artifact.counts.row_lineage_occurrences}`,
    `- Duplicate queue/token IDs: ${artifact.counts.duplicate_queue_ids}/${artifact.counts.duplicate_token_ids}`,
    `- Source RID refs / unique / prefixes: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.source_rid_prefix_count}`,
    `- Blocker rows / source-family sets / lineage gaps: ${artifact.counts.blocker_rows}/${artifact.counts.source_family_set_rows}/${artifact.counts.lineage_gap_rows}`,
    `- Agent 2 queue pointer rows / handoff roles: ${artifact.counts.agent2_queue_pointer_rows}/${artifact.counts.handoff_artifact_roles}`,
    `- Transform-ready / forbidden payload / acceptance claims: ${artifact.counts.transform_ready_rows}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Blockers',
    '',
    '| exact blocker | rows | occurrences | partitions |',
    '|---|---:|---:|---|',
    ...artifact.blocker_rows.map(
      (row) =>
        `| ${mdCell(row.exact_blocker)} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${mdCell(
          row.partitions.join(', '),
        )} |`,
    ),
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];

  fs.writeFileSync(path.resolve(root, outputPath), `${rows.join('\n')}\n`);
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

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()]
    .filter(([value, count]) => value && count > 1)
    .map(([value]) => value)
    .sort();
}

function partitionRank(partition) {
  return partition === 'pure_commercial_workset' ? 0 : partition === 'overlap_workset' ? 1 : 99;
}

function sum(rows, valueFn) {
  return rows.reduce((total, row) => total + Number(valueFn(row) || 0), 0);
}

function slug(value) {
  return String(value || 'missing')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
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
    if (arg.startsWith('--continuity-crossmatch=')) parsed.continuityCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-family-blocker-matrix=')) {
      parsed.sourceFamilyBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--source-rid-continuity-crossmatch=')) {
      parsed.sourceRidContinuityCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--exact-subset-crossmatch=')) {
      parsed.exactSubsetCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--boundary-triage-navigation=')) {
      parsed.boundaryTriageNavigation = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--split-closure-crossmatch=')) {
      parsed.splitClosureCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--handoff-index=')) parsed.handoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}
