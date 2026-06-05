#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  rowOverlapMatrix: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json',
  rowOverlapVerdict: 'reports/agent6-old-dictionary-row-overlap-linkage-matrix-verdict-2026-06-05.json',
  candidateUsePackage: 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  candidateUseVerdict: 'reports/agent6-old-dictionary-candidate-use-package-boundary-verdict-2026-06-05.json',
  transformBlocker: 'reports/agent2-old-dictionary-transform-reaudit-boundary-blocker-2026-06-05.json',
  agent10Refresh: 'reports/agent10-direct-release-package-intake-refresh-2026-06-05q.json',
  output: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const rowOverlapMatrix = readJson(options.rowOverlapMatrix);
const rowOverlapVerdict = readJson(options.rowOverlapVerdict);
const candidateUsePackage = readJson(options.candidateUsePackage);
const candidateUseVerdict = readJson(options.candidateUseVerdict);
const transformBlocker = readJson(options.transformBlocker);
const agent10Refresh = readJson(options.agent10Refresh);

assertArtifact(rowOverlapMatrix, 'agent3_old_dictionary_row_overlap_linkage_matrix', options.rowOverlapMatrix);
assertArtifact(rowOverlapVerdict, 'agent6_old_dictionary_row_overlap_linkage_matrix_verdict', options.rowOverlapVerdict);
assertArtifact(candidateUsePackage, 'agent2_old_dictionary_morphology_candidate_use_package', options.candidateUsePackage);
assertArtifact(
  candidateUseVerdict,
  'agent6_old_dictionary_candidate_use_package_boundary_verdict',
  options.candidateUseVerdict,
);
assertArtifact(transformBlocker, 'agent2_old_dictionary_transform_reaudit_boundary_blocker', options.transformBlocker);
assertArtifact(agent10Refresh, 'agent10_direct_release_package_intake_refresh', options.agent10Refresh);

const rowOverlapSampleIndex = buildRowOverlapSampleIndex(rowOverlapMatrix.rows || []);
const blockerBySourceFamily = new Map(
  (transformBlocker.exact_blockers_by_row_subset || [])
    .filter((row) => row.source_family)
    .map((row) => [row.source_family, compactTransformBlocker(row)]),
);
const rows = (candidateUsePackage.rows || []).map((row) => buildRow(row));
const duplicateQueueIds = duplicateValues(rows.map((row) => row.queue_id));
const duplicateTokenIds = duplicateValues(rows.map((row) => row.token_id));
const linkedRows = rows.filter((row) => row.row_overlap_sample_status === 'sample_linked_to_row_overlap_bucket');
const sourceFamiliesObserved = unique(rows.flatMap((row) => row.source_families));
const allBlockerLinks = rows.flatMap((row) => row.source_family_blocker_links);
const blockerFamiliesObserved = unique(allBlockerLinks.map((row) => row.source_family));
const queueStatusCounts = countBy(rows, (row) => row.row_overlap_sample_status);

const counts = {
  candidate_use_rows: rows.length,
  candidate_use_occurrences: sum(rows, (row) => row.occurrences),
  agent2_package_rows: Number(candidateUsePackage.counts?.package_rows || 0),
  agent2_package_occurrences: Number(candidateUsePackage.counts?.package_occurrences || 0),
  agent6_verdict_package_rows: Number(candidateUseVerdict.recounted_scope?.package_rows || 0),
  agent6_verdict_package_occurrences: Number(candidateUseVerdict.recounted_scope?.package_occurrences || 0),
  unique_queue_ids: new Set(rows.map((row) => row.queue_id)).size,
  duplicate_queue_ids: duplicateQueueIds.length,
  unique_token_ids: new Set(rows.map((row) => row.token_id)).size,
  duplicate_token_ids: duplicateTokenIds.length,
  source_family_values_observed: sourceFamiliesObserved.length,
  source_family_blocker_families: blockerFamiliesObserved.length,
  rows_with_source_family_blocker_links: rows.filter((row) => row.source_family_blocker_links.length > 0).length,
  source_family_blocker_links: allBlockerLinks.length,
  row_overlap_sample_index_tokens: rowOverlapSampleIndex.size,
  row_overlap_sample_linked_rows: linkedRows.length,
  row_overlap_sample_unlinked_rows: rows.length - linkedRows.length,
  row_overlap_sample_linked_occurrences: sum(linkedRows, (row) => row.occurrences),
  row_overlap_sample_unlinked_occurrences: sum(
    rows.filter((row) => row.row_overlap_sample_status !== 'sample_linked_to_row_overlap_bucket'),
    (row) => row.occurrences,
  ),
  row_overlap_sample_status_values: Object.keys(queueStatusCounts).length,
  transform_blocker_rows: Number(transformBlocker.exact_blockers_by_row_subset?.length || 0),
  commercial_clean_candidate_rows: rows.filter((row) => row.license_lane === 'commercial_clean_candidate').length,
  noncommercial_educational_candidate_rows: rows.filter((row) => row.license_lane === 'noncommercial_educational_candidate').length,
  exact_after_mark_strip_rows: rows.filter((row) => row.morphology_relation_basis === 'exact_after_mark_strip').length,
  agent2_morphology_relation_approved_rows: rows.filter(
    (row) =>
      row.agent2_morphology_relation_status ===
      'agent2_morphology_relation_approved_for_nonpublic_planning',
  ).length,
  morphology_blocked_rows_excluded: Number(candidateUsePackage.counts?.morphology_blocked_rows_excluded || 0),
  agent10_current_exact_blockers: agent10Refresh.current_exact_blocker ? 1 : 0,
  candidate_text_rows: Number(candidateUsePackage.counts?.candidate_text_rows || 0),
  definition_content_rows: Number(candidateUsePackage.counts?.definition_content_rows || 0),
  lemma_content_rows: Number(candidateUsePackage.counts?.lemma_content_rows || 0),
  reader_hint_content_rows: Number(candidateUsePackage.counts?.reader_hint_content_rows || 0),
  answer_rows: Number(candidateUsePackage.counts?.answer_rows || 0),
  answer_eligible_rows: Number(candidateUsePackage.counts?.answer_eligible_rows || 0),
  public_emit_rows: Number(candidateUsePackage.counts?.public_emit_rows || 0),
  route_jsonl_rows: Number(candidateUsePackage.counts?.route_jsonl_rows || 0),
  route_shard_writes: Number(candidateUsePackage.counts?.route_shard_writes || 0),
  public_runtime_mutation: Number(candidateUsePackage.counts?.public_runtime_mutation || 0),
  release_actions: Number(agent10Refresh.global_zero_counters?.release_actions || 0),
  source_text_rows: 0,
  accepted_text_rows: Number(agent10Refresh.global_zero_counters?.accepted_text_rows || 0),
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_continuity_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_continuity_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old-dictionary candidate-use continuity crossmatch from Agent 2 package to Agent 3 row-overlap sample index',
  inputs: {
    row_overlap_matrix: options.rowOverlapMatrix,
    row_overlap_verdict: options.rowOverlapVerdict,
    candidate_use_package: options.candidateUsePackage,
    candidate_use_verdict: options.candidateUseVerdict,
    transform_blocker: options.transformBlocker,
    agent10_refresh: options.agent10Refresh,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    candidate_use_planning_evidence_only: true,
    route_ids_only: false,
    source_family_pointer_only: true,
    source_rid_pointer_only: true,
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
  queue_status_counts: queueStatusCounts,
  duplicate_queue_ids: duplicateQueueIds,
  duplicate_token_ids: duplicateTokenIds,
  source_families_observed: sourceFamiliesObserved,
  source_family_blocker_families_observed: blockerFamiliesObserved,
  rows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    transform_owner_after_exact_boundary: 'Agent 2',
    source_lane_owner_for_missing_boundary_fields: 'Agent 1',
    qa_boundary_owner_if_needed: 'Agent 6',
    agent6_candidate_use_disposition: candidateUseVerdict.disposition || '',
    agent10_current_exact_blocker: agent10Refresh.current_exact_blocker || {},
    next_required_boundary:
      candidateUseVerdict.next_required_boundary ||
      agent10Refresh.current_exact_blocker?.agent6_boundary_need_now ||
      '',
    stop_condition:
      'Use this as nonpublic linkage/navigation evidence only. Do not emit candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this crossmatch.',
  },
  non_acceptance_boundary: unique([
    ...(candidateUseVerdict.not_accepted || []),
    ...(agent10Refresh.what_must_not_be_accepted || []),
  ]),
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 old-dictionary candidate-use continuity crossmatch rows=${counts.candidate_use_rows} occurrences=${counts.candidate_use_occurrences} sample_linked=${counts.row_overlap_sample_linked_rows} sample_unlinked=${counts.row_overlap_sample_unlinked_rows} blocker_rows=${counts.rows_with_source_family_blocker_links}`,
);

function buildRow(candidateRow) {
  const sampleMatch = rowOverlapSampleIndex.get(candidateRow.token_id) || null;
  const sourceFamilies = candidateRow.source_family || [];
  const sourceFamilyBlockerLinks = sourceFamilies
    .map((sourceFamily) => blockerBySourceFamily.get(sourceFamily))
    .filter(Boolean);
  return {
    row_id: `agent3-candidate-use-continuity-${candidateRow.queue_id}`,
    queue_id: candidateRow.queue_id || '',
    token_id: candidateRow.token_id || '',
    lexicon_entry_id: candidateRow.lexicon_entry_id || null,
    occurrences: Number(candidateRow.occurrences || 0),
    source_families: sourceFamilies,
    source_rid_count: Number(candidateRow.source_rids?.length || 0),
    source_rid_sample: (candidateRow.source_rids || []).slice(0, 5),
    license_lane: candidateRow.license_lane || '',
    morphology_relation_basis: candidateRow.morphology_relation_basis || '',
    agent2_morphology_relation_status: candidateRow.agent2_morphology_relation_status || '',
    candidate_use_scope: candidateRow.candidate_use_scope || '',
    row_overlap_sample_status: sampleMatch
      ? 'sample_linked_to_row_overlap_bucket'
      : 'not_in_row_overlap_sample_index',
    row_overlap_sample_bucket: sampleMatch?.row_overlap_bucket || null,
    row_overlap_sample_row_subset_id: sampleMatch?.row_subset_id || null,
    row_overlap_sample_bucket_status: sampleMatch?.status || null,
    row_overlap_sample_exact_blocker: sampleMatch?.exact_blocker || null,
    source_family_blocker_links: sourceFamilyBlockerLinks,
    downstream_transform_status:
      'blocked_pending_exact_agent1_agent6_boundary_fields_no_text_or_route_output',
    evidence_role: 'candidate_use_continuity_navigation_only',
    dedupe_key: sha256(
      [
        candidateRow.queue_id || '',
        candidateRow.token_id || '',
        candidateRow.lexicon_entry_id || '',
        String(candidateRow.occurrences || 0),
        sourceFamilies.join('+'),
      ].join('|'),
    ),
  };
}

function buildRowOverlapSampleIndex(matrixRows) {
  const index = new Map();
  for (const matrixRow of matrixRows) {
    for (const tokenId of matrixRow.sample_token_ids || []) {
      if (!tokenId) continue;
      index.set(tokenId, {
        row_overlap_bucket: matrixRow.row_overlap_bucket,
        row_subset_id: matrixRow.row_subset_id,
        status: matrixRow.status,
        exact_blocker: matrixRow.exact_blocker,
      });
    }
  }
  return index;
}

function compactTransformBlocker(row) {
  return {
    row_subset_id: row.row_subset_id || '',
    source_family: row.source_family || '',
    license_lane: row.license_lane || '',
    missing_before_transform: row.missing_before_transform || [],
    handoff_owner: row.handoff_owner || '',
  };
}

function writeMarkdown(relativePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Continuity Crossmatch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${options.output}\``,
    `- Status: \`${data.status}\``,
    `- Rows / occurrences: ${data.counts.candidate_use_rows} / ${data.counts.candidate_use_occurrences}`,
    `- Row-overlap sample linked / unlinked: ${data.counts.row_overlap_sample_linked_rows} / ${data.counts.row_overlap_sample_unlinked_rows}`,
    `- Source-family blocker link rows / links: ${data.counts.rows_with_source_family_blocker_links} / ${data.counts.source_family_blocker_links}`,
    `- Duplicate queue IDs / token IDs: ${data.counts.duplicate_queue_ids} / ${data.counts.duplicate_token_ids}`,
    `- Agent 10 current blocker present: ${data.counts.agent10_current_exact_blockers}`,
    '',
    '## Inputs Inspected',
    '',
    ...Object.entries(data.inputs).map(([key, value]) => `- ${key}: \`${value}\``),
    '',
    '## Boundary',
    '',
    '- This packet is linkage/navigation evidence only.',
    '- It carries queue IDs, token IDs, lexicon entry IDs, source-family labels, source RID counts/samples, row-overlap sample links, and blocker pointers.',
    '- It does not carry candidate text, source text, definition content, lemma content, reader hints, accepted text, answer eligibility, route writes, public/runtime changes, commercial export, or release action.',
    '',
    '## Counts',
    '',
    '| field | value |',
    '|---|---:|',
    ...Object.entries(data.counts).map(([key, value]) => `| ${mdCell(key)} | ${mdCell(value)} |`),
    '',
    '## Sample Rows',
    '',
    '| queue_id | token_id | occurrences | families | row-overlap sample status | blocker links |',
    '|---|---|---:|---|---|---:|',
    ...data.rows
      .slice(0, 20)
      .map(
        (row) =>
          `| ${mdCell(row.queue_id)} | ${mdCell(row.token_id)} | ${row.occurrences} | ${mdCell(row.source_families.join(', '))} | ${mdCell(row.row_overlap_sample_status)} | ${row.source_family_blocker_links.length} |`,
      ),
    '',
    '## Stop Condition',
    '',
    data.downstream_handoff.stop_condition,
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
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
  let count = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) count += 1;
  });
  return count;
}

function assertArtifact(value, expected, filePath) {
  if (value.artifact_type !== expected) {
    throw new Error(`${filePath} artifact_type ${value.artifact_type || 'missing'} !== ${expected}`);
  }
}

function countBy(values, callback) {
  const counts = {};
  for (const value of values) {
    const key = callback(value);
    counts[key] = Number(counts[key] || 0) + 1;
  }
  return counts;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function sum(values, callback) {
  return values.reduce((total, value) => total + Number(callback(value) || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
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

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--row-overlap-matrix=')) parsed.rowOverlapMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--row-overlap-verdict=')) parsed.rowOverlapVerdict = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--candidate-use-package=')) parsed.candidateUsePackage = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--candidate-use-verdict=')) parsed.candidateUseVerdict = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--transform-blocker=')) parsed.transformBlocker = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent10-refresh=')) parsed.agent10Refresh = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
