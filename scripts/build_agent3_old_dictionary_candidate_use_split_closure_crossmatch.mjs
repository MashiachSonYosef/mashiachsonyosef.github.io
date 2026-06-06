#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  boundaryTriageNavigation:
    'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
  pureCommercialWorkset:
    'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json',
  overlapWorkset: 'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const boundaryTriageNavigation = readJson(options.boundaryTriageNavigation);
const pureCommercialWorkset = readJson(options.pureCommercialWorkset);
const overlapWorkset = readJson(options.overlapWorkset);

assertArtifact(
  boundaryTriageNavigation,
  'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  options.boundaryTriageNavigation,
);
assertArtifact(
  pureCommercialWorkset,
  'agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset',
  options.pureCommercialWorkset,
);
assertArtifact(
  overlapWorkset,
  'agent3_old_dictionary_overlap_candidate_use_boundary_workset',
  options.overlapWorkset,
);

const triageRows = boundaryTriageNavigation.candidate_rows || [];
const pureRows = (pureCommercialWorkset.workset_rows || []).map((row) => buildClosureRow(row, 'pure_commercial_workset'));
const overlapRows = (overlapWorkset.workset_rows || []).map((row) => buildClosureRow(row, 'overlap_workset'));
const closureRows = [...pureRows, ...overlapRows].sort(
  (left, right) => partitionRank(left.partition) - partitionRank(right.partition) || right.occurrences - left.occurrences,
);
const triageByQueueId = new Map(triageRows.map((row) => [row.queue_id, row]));
const closureByQueueId = new Map(closureRows.map((row) => [row.queue_id, row]));
const missingFromClosure = triageRows.filter((row) => !closureByQueueId.has(row.queue_id));
const extraInClosure = closureRows.filter((row) => !triageByQueueId.has(row.queue_id));
const duplicateClosureQueueIds = duplicateValues(closureRows.map((row) => row.queue_id));
const duplicateClosureTokenIds = duplicateValues(closureRows.map((row) => row.token_id));
const pureQueueIds = new Set(pureRows.map((row) => row.queue_id));
const overlapQueueIds = new Set(overlapRows.map((row) => row.queue_id));
const crossPartitionDuplicateQueueIds = [...pureQueueIds].filter((queueId) => overlapQueueIds.has(queueId)).sort();
const pureTokenIds = new Set(pureRows.map((row) => row.token_id));
const overlapTokenIds = new Set(overlapRows.map((row) => row.token_id));
const crossPartitionDuplicateTokenIds = [...pureTokenIds].filter((tokenId) => overlapTokenIds.has(tokenId)).sort();
const pureSourceRids = new Set(pureRows.flatMap((row) => row.source_rids));
const overlapSourceRids = new Set(overlapRows.flatMap((row) => row.source_rids));
const sharedSourceRids = [...pureSourceRids].filter((rid) => overlapSourceRids.has(rid)).sort();

const partitionRows = buildPartitionRows(pureRows, overlapRows);
const blockerRows = buildBlockerRows(closureRows);
const triageGroupRows = buildTriageGroupRows(closureRows);
const sourceFamilySetRows = buildSourceFamilySetRows(closureRows);

const counts = {
  triage_candidate_rows: Number(boundaryTriageNavigation.counts?.candidate_use_rows || 0),
  triage_candidate_occurrences: Number(boundaryTriageNavigation.counts?.candidate_use_occurrences || 0),
  closure_rows: closureRows.length,
  closure_occurrences: sum(closureRows, (row) => row.occurrences),
  pure_workset_rows: pureRows.length,
  pure_workset_occurrences: sum(pureRows, (row) => row.occurrences),
  overlap_workset_rows: overlapRows.length,
  overlap_workset_occurrences: sum(overlapRows, (row) => row.occurrences),
  partition_rows: partitionRows.length,
  blocker_rows: blockerRows.length,
  triage_group_rows: triageGroupRows.length,
  source_family_set_rows: sourceFamilySetRows.length,
  closure_unique_queue_ids: new Set(closureRows.map((row) => row.queue_id)).size,
  closure_duplicate_queue_ids: duplicateClosureQueueIds.length,
  closure_unique_token_ids: new Set(closureRows.map((row) => row.token_id)).size,
  closure_duplicate_token_ids: duplicateClosureTokenIds.length,
  missing_from_closure_rows: missingFromClosure.length,
  extra_in_closure_rows: extraInClosure.length,
  cross_partition_duplicate_queue_ids: crossPartitionDuplicateQueueIds.length,
  cross_partition_duplicate_token_ids: crossPartitionDuplicateTokenIds.length,
  source_rid_references: sum(closureRows, (row) => row.source_rid_count),
  unique_source_rids: new Set(closureRows.flatMap((row) => row.source_rids)).size,
  pure_unique_source_rids: pureSourceRids.size,
  overlap_unique_source_rids: overlapSourceRids.size,
  cross_partition_shared_source_rids: sharedSourceRids.length,
  rows_with_agent1_rid_metadata: closureRows.filter((row) => row.agent1_metadata_status === 'present').length,
  rows_missing_agent1_rid_metadata: closureRows.filter((row) => row.agent1_metadata_status !== 'present').length,
  rows_with_all_source_rids_in_agent1_metadata: closureRows.filter(
    (row) => row.all_source_rids_in_agent1_metadata === true,
  ).length,
  rows_missing_exact_subset: closureRows.filter((row) => row.exact_subset_status !== 'matched_exact_subset_manifest')
    .length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_split_closure_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'split closure crossmatch proving pure-commercial and overlap candidate-use worksets partition the 78-row old-dictionary triage packet',
  inputs: {
    boundary_triage_navigation: options.boundaryTriageNavigation,
    pure_commercial_workset: options.pureCommercialWorkset,
    overlap_workset: options.overlapWorkset,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    split_closure_only: true,
    candidate_use_planning_evidence_only: true,
    partition_membership_only: true,
    source_rid_identifier_continuity_only: true,
    source_family_blocker_navigation_only: true,
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
  partition_rows: partitionRows,
  blocker_rows: blockerRows,
  triage_group_rows: triageGroupRows,
  source_family_set_rows: sourceFamilySetRows,
  shared_source_rid_rows: sharedSourceRids.map((rid) => ({
    row_id: `agent3-candidate-use-split-shared-source-rid-${slug(rid)}`,
    source_rid: rid,
    status: 'source_rid_identifier_shared_across_partitions_navigation_only',
  })),
  closure_rows: closureRows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_blockers_preserved: blockerRows.map((row) => row.exact_blocker),
    stop_condition:
      'Use this closure crossmatch only to confirm split coverage and blocker distribution for Agent 10/Agent 6 review. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 split closure rows=${counts.closure_rows} missing=${counts.missing_from_closure_rows} duplicate_queue_ids=${counts.closure_duplicate_queue_ids}`,
);

function buildClosureRow(row, partition) {
  return {
    row_id: `agent3-candidate-use-split-closure-${partition}-${row.queue_id}`,
    partition,
    queue_id: row.queue_id || '',
    token_id: row.token_id || '',
    lexicon_entry_id: row.lexicon_entry_id || null,
    occurrences: Number(row.occurrences || 0),
    triage_group: row.triage_group || '',
    license_lane: row.license_lane || '',
    exact_subset_status: row.exact_subset_status || '',
    row_subset_id: row.row_subset_id || '',
    bucket_id: row.bucket_id || '',
    classification_lanes: row.classification_lanes || [],
    exact_blocker: row.exact_blocker || '',
    source_families: row.source_families || [],
    source_family_set_key: row.source_family_set_key || '',
    source_rids: row.source_rids || [],
    source_rid_count: Number(row.source_rid_count || 0),
    unique_source_rid_count: Number(row.unique_source_rid_count || 0),
    source_rid_prefixes: row.source_rid_prefixes || [],
    agent1_metadata_status: row.agent1_metadata_status || '',
    all_source_rids_in_agent1_metadata: Boolean(row.all_source_rids_in_agent1_metadata),
    closure_role: 'split_partition_membership_navigation_only_no_transform_authority',
    downstream_transform_status: row.downstream_transform_status || 'not_transform_ready_no_text_or_route_output',
    dedupe_key: sha256([partition, row.queue_id || '', row.token_id || '', row.row_subset_id || ''].join('|')),
  };
}

function buildPartitionRows(pureRows, overlapRows) {
  return [
    buildPartitionRow('pure_commercial_workset', pureRows, 'agent6_candidate_use_boundary_required'),
    buildPartitionRow('overlap_workset', overlapRows, 'agent6_source_family_selection_boundary_required'),
  ];
}

function buildPartitionRow(partition, rows, status) {
  return {
    row_id: `agent3-candidate-use-split-partition-${partition}`,
    partition,
    candidate_rows: rows.length,
    candidate_occurrences: sum(rows, (row) => row.occurrences),
    source_rid_references: sum(rows, (row) => row.source_rid_count),
    unique_source_rids: new Set(rows.flatMap((row) => row.source_rids)).size,
    source_family_set_count: new Set(rows.map((row) => row.source_family_set_key)).size,
    exact_blocker_count: new Set(rows.map((row) => row.exact_blocker)).size,
    status,
    queue_id_sample: rows.slice(0, 12).map((row) => row.queue_id),
    token_id_sample: rows.slice(0, 12).map((row) => row.token_id),
    dedupe_key: sha256([partition, rows.length, sum(rows, (row) => row.occurrences)].join('|')),
  };
}

function buildBlockerRows(rows) {
  const grouped = groupBy(rows, (row) => row.exact_blocker);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([exactBlocker, blockerRows]) => ({
      row_id: `agent3-candidate-use-split-blocker-${sha256(exactBlocker).slice(0, 12)}`,
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

function buildTriageGroupRows(rows) {
  const grouped = groupBy(rows, (row) => row.triage_group);
  return [...grouped.entries()]
    .sort(([left], [right]) => triageRank(left) - triageRank(right))
    .map(([triageGroup, triageRows]) => ({
      row_id: `agent3-candidate-use-split-triage-${triageGroup}`,
      triage_group: triageGroup,
      candidate_rows: triageRows.length,
      candidate_occurrences: sum(triageRows, (row) => row.occurrences),
      partitions: [...new Set(triageRows.map((row) => row.partition))].sort(),
      source_family_set_count: new Set(triageRows.map((row) => row.source_family_set_key)).size,
      source_rid_references: sum(triageRows, (row) => row.source_rid_count),
      unique_source_rids: new Set(triageRows.flatMap((row) => row.source_rids)).size,
      exact_blockers: [...new Set(triageRows.map((row) => row.exact_blocker))].sort(),
      status: 'triage_group_partition_navigation_only',
      dedupe_key: sha256([triageGroup, triageRows.length, sum(triageRows, (row) => row.occurrences)].join('|')),
    }));
}

function buildSourceFamilySetRows(rows) {
  const grouped = groupBy(rows, (row) => row.source_family_set_key);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceFamilySetKey, familyRows]) => ({
      row_id: `agent3-candidate-use-split-source-family-set-${sha256(sourceFamilySetKey).slice(0, 12)}`,
      source_family_set: sourceFamilySetKey.split(' | ').filter(Boolean),
      candidate_rows: familyRows.length,
      candidate_occurrences: sum(familyRows, (row) => row.occurrences),
      partitions: [...new Set(familyRows.map((row) => row.partition))].sort(),
      triage_groups: [...new Set(familyRows.map((row) => row.triage_group))].sort(),
      source_rid_references: sum(familyRows, (row) => row.source_rid_count),
      unique_source_rids: new Set(familyRows.flatMap((row) => row.source_rids)).size,
      status: 'source_family_set_partition_navigation_only',
      dedupe_key: sha256([sourceFamilySetKey, familyRows.length, sum(familyRows, (row) => row.occurrences)].join('|')),
    }));
}

function writeMarkdown(filePath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Split Closure Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: split closure/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.',
    '',
    '## Inputs',
    '',
    `- Boundary triage navigation: \`${artifact.inputs.boundary_triage_navigation}\``,
    `- Pure commercial workset: \`${artifact.inputs.pure_commercial_workset}\``,
    `- Overlap workset: \`${artifact.inputs.overlap_workset}\``,
    '',
    '## Counts',
    '',
    `- Triage rows / closure rows: ${artifact.counts.triage_candidate_rows}/${artifact.counts.closure_rows}`,
    `- Triage occurrences / closure occurrences: ${artifact.counts.triage_candidate_occurrences}/${artifact.counts.closure_occurrences}`,
    `- Pure rows / overlap rows: ${artifact.counts.pure_workset_rows}/${artifact.counts.overlap_workset_rows}`,
    `- Missing / extra / duplicate queue IDs / cross-partition duplicate queue IDs: ${artifact.counts.missing_from_closure_rows}/${artifact.counts.extra_in_closure_rows}/${artifact.counts.closure_duplicate_queue_ids}/${artifact.counts.cross_partition_duplicate_queue_ids}`,
    `- Source-RID refs / unique / shared across partitions: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.cross_partition_shared_source_rids}`,
    `- Rows with Agent 1 RID metadata / missing RID metadata: ${artifact.counts.rows_with_agent1_rid_metadata}/${artifact.counts.rows_missing_agent1_rid_metadata}`,
    `- Transform-ready rows / forbidden payload / acceptance claims: ${artifact.counts.transform_ready_rows}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Partitions',
    '',
    '| partition | rows | occurrences | source_rid_refs | unique_source_rids | source_family_sets | blockers | status |',
    '|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.partition_rows.map(
      (row) =>
        `| ${row.partition} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.source_rid_references} | ${row.unique_source_rids} | ${row.source_family_set_count} | ${row.exact_blocker_count} | ${row.status} |`,
    ),
    '',
    '## Blockers',
    '',
    '| exact_blocker | rows | occurrences | partitions | triage_groups | status |',
    '|---|---:|---:|---|---|---|',
    ...artifact.blocker_rows.map(
      (row) =>
        `| ${row.exact_blocker} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.partitions.join(', ')} | ${row.triage_groups.join(', ')} | ${row.status} |`,
    ),
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];
  fs.writeFileSync(path.resolve(root, filePath), `${lines.join('\n')}\n`);
}

function partitionRank(partition) {
  return { pure_commercial_workset: 1, overlap_workset: 2 }[partition] || 99;
}

function triageRank(triageGroup) {
  return {
    commercial_clean_only: 1,
    commercial_clean_nc_overlap: 2,
    commercial_clean_blocked_overlap: 3,
    commercial_clean_nc_blocked_overlap: 4,
  }[triageGroup] || 99;
}

function countForbiddenPayloadKeys(value) {
  const forbidden = new Set([
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
  ]);
  let hits = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) hits += 1;
  });
  return hits;
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = map.get(key) || [];
    bucket.push(row);
    map.set(key, bucket);
  }
  return map;
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function sum(rows, selector) {
  return rows.reduce((total, row) => total + Number(selector(row) || 0), 0);
}

function slug(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assertArtifact(artifact, expectedType, filePath) {
  if (artifact.artifact_type !== expectedType) {
    throw new Error(`${filePath} artifact_type=${artifact.artifact_type}; expected ${expectedType}`);
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(path.resolve(root, filePath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--boundary-triage-navigation') parsed.boundaryTriageNavigation = cleanRelativePath(value);
    else if (key === '--pure-commercial-workset') parsed.pureCommercialWorkset = cleanRelativePath(value);
    else if (key === '--overlap-workset') parsed.overlapWorkset = cleanRelativePath(value);
    else if (key === '--output') parsed.output = cleanRelativePath(value);
    else if (key === '--report') parsed.report = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
