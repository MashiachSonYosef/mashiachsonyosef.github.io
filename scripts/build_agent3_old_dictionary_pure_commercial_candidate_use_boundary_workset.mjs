#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  boundaryTriageNavigation:
    'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
  exactSubsetCrossmatch: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
  sourceRidContinuityCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
  output: 'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const boundaryTriageNavigation = readJson(options.boundaryTriageNavigation);
const exactSubsetCrossmatch = readJson(options.exactSubsetCrossmatch);
const sourceRidContinuityCrossmatch = readJson(options.sourceRidContinuityCrossmatch);

assertArtifact(
  boundaryTriageNavigation,
  'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  options.boundaryTriageNavigation,
);
assertArtifact(
  exactSubsetCrossmatch,
  'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  options.exactSubsetCrossmatch,
);
assertArtifact(
  sourceRidContinuityCrossmatch,
  'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  options.sourceRidContinuityCrossmatch,
);

const exactByQueueId = new Map((exactSubsetCrossmatch.candidate_rows || []).map((row) => [row.queue_id, row]));
const ridByQueueId = new Map((sourceRidContinuityCrossmatch.candidate_rows || []).map((row) => [row.queue_id, row]));
const worksetRows = (boundaryTriageNavigation.candidate_rows || [])
  .filter((row) => row.triage_group === 'commercial_clean_only')
  .map((row) => buildWorksetRow(row))
  .sort((left, right) => right.occurrences - left.occurrences || left.queue_id.localeCompare(right.queue_id));

const blockerRows = buildBlockerRows(worksetRows);
const sourceFamilyRows = buildSourceFamilyRows(worksetRows);
const sourceRidPrefixRows = buildSourceRidPrefixRows(worksetRows);
const queueIds = worksetRows.map((row) => row.queue_id);
const tokenIds = worksetRows.map((row) => row.token_id);
const sourceRids = worksetRows.flatMap((row) => row.source_rids);
const uniqueSourceRids = [...new Set(sourceRids)].sort();

const counts = {
  boundary_triage_candidate_rows: Number(boundaryTriageNavigation.counts?.candidate_use_rows || 0),
  boundary_triage_candidate_occurrences: Number(boundaryTriageNavigation.counts?.candidate_use_occurrences || 0),
  workset_rows: worksetRows.length,
  workset_occurrences: sum(worksetRows, (row) => row.occurrences),
  unique_queue_ids: new Set(queueIds).size,
  duplicate_queue_ids: duplicateValues(queueIds).length,
  unique_token_ids: new Set(tokenIds).size,
  duplicate_token_ids: duplicateValues(tokenIds).length,
  source_family_rows: sourceFamilyRows.length,
  source_family_set_rows: new Set(worksetRows.map((row) => row.source_family_set_key)).size,
  source_rid_references: sourceRids.length,
  unique_source_rids: uniqueSourceRids.length,
  source_rid_prefix_rows: sourceRidPrefixRows.length,
  rows_with_agent1_rid_metadata: worksetRows.filter((row) => row.agent1_metadata_status === 'present').length,
  rows_missing_agent1_rid_metadata: worksetRows.filter((row) => row.agent1_metadata_status !== 'present').length,
  rows_with_all_source_rids_in_agent1_metadata: worksetRows.filter(
    (row) => row.all_source_rids_in_agent1_metadata === true,
  ).length,
  rows_missing_exact_subset: worksetRows.filter((row) => row.exact_subset_status !== 'matched_exact_subset_manifest')
    .length,
  blocker_rows: blockerRows.length,
  rows_with_missing_family_boundary_links: worksetRows.filter((row) => row.missing_boundary_family_count > 0).length,
  agent6_boundary_required_rows: worksetRows.length,
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
  artifact_type: 'agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'pure commercial-clean candidate-use boundary workset extracted from old-dictionary boundary triage navigation',
  inputs: {
    boundary_triage_navigation: options.boundaryTriageNavigation,
    exact_subset_crossmatch: options.exactSubsetCrossmatch,
    source_rid_continuity_crossmatch: options.sourceRidContinuityCrossmatch,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    boundary_workset_only: true,
    candidate_use_planning_evidence_only: true,
    pure_commercial_clean_membership_only: true,
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
  blocker_rows: blockerRows,
  source_family_rows: sourceFamilyRows,
  source_rid_prefix_rows: sourceRidPrefixRows,
  workset_rows: worksetRows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_blockers_preserved: blockerRows.map((row) => row.exact_blocker),
    stop_condition:
      'Use this five-row workset as exact linkage/navigation evidence for boundary review only. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 pure commercial workset rows=${counts.workset_rows} occurrences=${counts.workset_occurrences} rids=${counts.unique_source_rids}`,
);

function buildWorksetRow(row) {
  const exact = exactByQueueId.get(row.queue_id);
  const rid = ridByQueueId.get(row.queue_id);
  if (!exact) throw new Error(`Missing exact subset row for ${row.queue_id}`);
  if (!rid) throw new Error(`Missing source-RID row for ${row.queue_id}`);
  return {
    row_id: `agent3-pure-commercial-candidate-use-boundary-${row.queue_id}`,
    queue_id: row.queue_id || '',
    token_id: row.token_id || '',
    lexicon_entry_id: row.lexicon_entry_id || null,
    occurrences: Number(row.occurrences || 0),
    triage_group: row.triage_group || '',
    triage_status: row.triage_status || '',
    license_lane: row.license_lane || '',
    exact_subset_status: row.exact_subset_status || '',
    row_subset_id: row.row_subset_id || '',
    bucket_id: row.bucket_id || '',
    classification_lanes: row.classification_lanes || [],
    exact_blocker: row.exact_blocker || exact.exact_blocker || '',
    source_families: row.source_families || [],
    source_family_set_key: row.source_family_set_key || '',
    source_family_boundary_links: row.source_family_boundary_links || [],
    missing_boundary_family_count: Number(row.missing_boundary_family_count || 0),
    source_rids: row.source_rids || [],
    source_rid_count: Number(row.source_rid_count || 0),
    unique_source_rid_count: Number(row.unique_source_rid_count || 0),
    source_rid_prefixes: row.source_rid_prefixes || [],
    source_rid_status: row.source_rid_status || rid.citation_metadata_status || '',
    agent1_metadata_status: row.agent1_metadata_status || '',
    all_source_rids_in_agent1_metadata: Boolean(row.all_source_rids_in_agent1_metadata),
    workset_role: 'agent6_boundary_candidate_exact_navigation_row_not_transform_authority',
    downstream_transform_status:
      'not_transform_ready_missing_agent6_candidate_use_boundary_and_morphology_relation',
    dedupe_key: sha256(
      [
        row.queue_id || '',
        row.token_id || '',
        row.row_subset_id || '',
        (row.source_rids || []).join('|'),
        'pure-commercial-boundary-workset',
      ].join('||'),
    ),
  };
}

function buildBlockerRows(rows) {
  const grouped = groupBy(rows, (row) => row.exact_blocker);
  return [...grouped.entries()].map(([exactBlocker, blockerRows]) => ({
    row_id: `agent3-pure-commercial-candidate-use-blocker-${sha256(exactBlocker).slice(0, 12)}`,
    exact_blocker: exactBlocker,
    workset_rows: blockerRows.length,
    workset_occurrences: sum(blockerRows, (row) => row.occurrences),
    queue_id_sample: blockerRows.map((row) => row.queue_id),
    token_id_sample: blockerRows.map((row) => row.token_id),
    handoff_owner: 'Agent 10 for package intake; Agent 6 for boundary review if routed',
    status: 'exact_blocker_preserved_no_transform_authority',
    dedupe_key: sha256([exactBlocker, blockerRows.length, sum(blockerRows, (row) => row.occurrences)].join('|')),
  }));
}

function buildSourceFamilyRows(rows) {
  const grouped = groupBy(rows.flatMap((row) => row.source_families.map((family) => ({ family, row }))), (entry) => entry.family);
  return [...grouped.entries()].map(([sourceFamily, entries]) => {
    const rowsForFamily = entries.map((entry) => entry.row);
    return {
      row_id: `agent3-pure-commercial-candidate-use-source-family-${slug(sourceFamily)}`,
      source_family: sourceFamily,
      workset_rows: rowsForFamily.length,
      workset_occurrences: sum(rowsForFamily, (row) => row.occurrences),
      source_rid_references: sum(rowsForFamily, (row) => row.source_rid_count),
      unique_source_rids: new Set(rowsForFamily.flatMap((row) => row.source_rids)).size,
      queue_id_sample: rowsForFamily.map((row) => row.queue_id),
      token_id_sample: rowsForFamily.map((row) => row.token_id),
      status: 'source_family_navigation_only_boundary_required_before_transform',
      dedupe_key: sha256([sourceFamily, rowsForFamily.length, sum(rowsForFamily, (row) => row.occurrences)].join('|')),
    };
  });
}

function buildSourceRidPrefixRows(rows) {
  const grouped = groupBy(
    rows.flatMap((row) => row.source_rids.map((rid) => ({ prefix: ridPrefix(rid), rid, row }))),
    (entry) => entry.prefix,
  );
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([prefix, entries]) => {
      const rowsForPrefix = [...new Map(entries.map((entry) => [entry.row.queue_id, entry.row])).values()];
      return {
        row_id: `agent3-pure-commercial-candidate-use-source-rid-prefix-${slug(prefix)}`,
        source_rid_prefix: prefix,
        workset_rows: rowsForPrefix.length,
        workset_occurrences: sum(rowsForPrefix, (row) => row.occurrences),
        source_rid_references: entries.length,
        unique_source_rids: new Set(entries.map((entry) => entry.rid)).size,
        queue_id_sample: rowsForPrefix.map((row) => row.queue_id),
        token_id_sample: rowsForPrefix.map((row) => row.token_id),
        status: 'source_rid_prefix_navigation_only_no_source_text_read',
        dedupe_key: sha256([prefix, entries.length, rowsForPrefix.length].join('|')),
      };
    });
}

function writeMarkdown(filePath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Pure Commercial Candidate-Use Boundary Workset',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: five-row linkage/navigation workset only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.',
    '',
    '## Inputs',
    '',
    `- Boundary triage navigation: \`${artifact.inputs.boundary_triage_navigation}\``,
    `- Exact-subset crossmatch: \`${artifact.inputs.exact_subset_crossmatch}\``,
    `- Source-RID continuity crossmatch: \`${artifact.inputs.source_rid_continuity_crossmatch}\``,
    '',
    '## Counts',
    '',
    `- Workset rows / occurrences: ${artifact.counts.workset_rows}/${artifact.counts.workset_occurrences}`,
    `- Source-family rows / source-family sets: ${artifact.counts.source_family_rows}/${artifact.counts.source_family_set_rows}`,
    `- Source-RID refs / unique / prefixes: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.source_rid_prefix_rows}`,
    `- Rows with Agent 1 RID metadata / missing RID metadata: ${artifact.counts.rows_with_agent1_rid_metadata}/${artifact.counts.rows_missing_agent1_rid_metadata}`,
    `- Rows missing exact subset / missing family boundary links: ${artifact.counts.rows_missing_exact_subset}/${artifact.counts.rows_with_missing_family_boundary_links}`,
    `- Transform-ready rows / forbidden payload / acceptance claims: ${artifact.counts.transform_ready_rows}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Blockers',
    '',
    '| exact_blocker | rows | occurrences | status |',
    '|---|---:|---:|---|',
    ...artifact.blocker_rows.map(
      (row) => `| ${row.exact_blocker} | ${row.workset_rows} | ${row.workset_occurrences} | ${row.status} |`,
    ),
    '',
    '## Workset Rows',
    '',
    '| queue_id | token_id | occurrences | source_families | source_rid_count | source_rid_prefixes | downstream_status |',
    '|---|---|---:|---|---:|---|---|',
    ...artifact.workset_rows.map(
      (row) =>
        `| ${row.queue_id} | ${row.token_id} | ${row.occurrences} | ${row.source_families.join(' + ')} | ${row.source_rid_count} | ${row.source_rid_prefixes.join(', ')} | ${row.downstream_transform_status} |`,
    ),
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];
  fs.writeFileSync(path.resolve(root, filePath), `${lines.join('\n')}\n`);
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

function ridPrefix(rid) {
  return String(rid || '').replace(/[0-9].*$/, '') || 'unknown';
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
    else if (key === '--exact-subset-crossmatch') parsed.exactSubsetCrossmatch = cleanRelativePath(value);
    else if (key === '--source-rid-continuity-crossmatch') parsed.sourceRidContinuityCrossmatch = cleanRelativePath(value);
    else if (key === '--output') parsed.output = cleanRelativePath(value);
    else if (key === '--report') parsed.report = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
