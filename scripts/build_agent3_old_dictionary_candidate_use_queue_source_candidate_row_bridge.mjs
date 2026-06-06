#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  rowBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.json',
  queueSourceBoundaryBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const rowBlockerMatrix = readJson(options.rowBlockerMatrix);
const queueSourceBoundaryBlockerMatrix = readJson(options.queueSourceBoundaryBlockerMatrix);

assertArtifact(
  rowBlockerMatrix,
  'agent3_old_dictionary_candidate_use_row_blocker_matrix',
  options.rowBlockerMatrix,
);
assertArtifact(
  queueSourceBoundaryBlockerMatrix,
  'agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix',
  options.queueSourceBoundaryBlockerMatrix,
);

const queueSourceRowsByQueueId = groupBy(
  queueSourceBoundaryBlockerMatrix.blocker_matrix_rows || [],
  (row) => row.queue_id,
);

const candidateRows = (rowBlockerMatrix.matrix_rows || []).slice().sort((a, b) => {
  const queueDelta = a.queue_id.localeCompare(b.queue_id, 'en');
  if (queueDelta !== 0) return queueDelta;
  return a.row_id.localeCompare(b.row_id, 'en');
});

const bridgeRows = candidateRows.map((row, index) => {
  const linkedRows = (queueSourceRowsByQueueId.get(row.queue_id) || []).slice().sort((a, b) => {
    const sourceDelta = a.source_rid.localeCompare(b.source_rid, 'en');
    if (sourceDelta !== 0) return sourceDelta;
    return a.queue_source_pair_key.localeCompare(b.queue_source_pair_key, 'en');
  });
  const rowSourceRids = uniqueSorted(row.source_rids || []);
  const linkedSourceRids = uniqueSorted(linkedRows.map((entry) => entry.source_rid));
  const missingLinkedSourceRids = rowSourceRids.filter((sourceRid) => !linkedSourceRids.includes(sourceRid));
  const extraLinkedSourceRids = linkedSourceRids.filter((sourceRid) => !rowSourceRids.includes(sourceRid));
  const bridgeStatus = linkedRows.length ? 'queue_source_subchain_linked' : 'outside_queue_source_subchain';
  const sourceRidMatchStatus = buildSourceRidMatchStatus({
    linkedRows,
    missingLinkedSourceRids,
    extraLinkedSourceRids,
  });

  return {
    bridge_row_id: `agent3-candidate-row-bridge-${sha256(row.queue_id).slice(0, 12)}`,
    candidate_row_id: row.row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: Number(row.occurrences || 0),
    source_license_lane: row.source_license_lane,
    relation_class: row.relation_class,
    morphology_relation_status: row.morphology_relation_status,
    partition: row.partition,
    triage_group: row.triage_group,
    row_source_rids: rowSourceRids,
    row_source_rid_count: rowSourceRids.length,
    queue_source_subchain_linked: linkedRows.length > 0,
    queue_source_blocker_rows: linkedRows.length,
    queue_source_pair_keys: linkedRows.map((entry) => entry.queue_source_pair_key),
    queue_source_dedupe_key_ids: linkedRows.map((entry) => entry.dedupe_key_id),
    queue_source_source_rids: linkedSourceRids,
    queue_source_unique_source_rids: linkedSourceRids.length,
    queue_source_reference_total: sum(linkedRows, 'reference_count'),
    queue_source_occurrence_membership_total: sum(linkedRows, 'occurrence_total'),
    queue_source_partition_ids: uniqueSorted(linkedRows.map((entry) => entry.partition_id)),
    queue_source_blocker_signatures: uniqueSorted(linkedRows.map((entry) => entry.blocker_signature)),
    queue_source_exact_blockers: uniqueSorted(linkedRows.map((entry) => entry.exact_blocker)),
    source_rid_match_status: sourceRidMatchStatus,
    missing_queue_source_rids_from_candidate_row: missingLinkedSourceRids,
    extra_queue_source_rids_not_in_candidate_row: extraLinkedSourceRids,
    source_rid_overlap_diagnostic_rows: linkedRows.filter((entry) => entry.source_rid_overlap_diagnostic).length,
    batch_id_overlap_diagnostic_rows: linkedRows.filter((entry) => entry.batch_id_overlap_diagnostic).length,
    current_blocker_ids: row.current_blocker_ids || [],
    current_blocker_count: Number(row.current_blocker_count || 0),
    bridge_status: bridgeStatus,
    exact_blocker:
      bridgeStatus === 'queue_source_subchain_linked'
        ? 'covered_by_queue_source_boundary_blocker_subchain_missing_source_citation_transform_and_agent6_boundary'
        : 'outside_queue_source_subchain_current_row_blockers_only',
    evidence_role: 'candidate_row_to_queue_source_blocker_bridge_navigation_only_no_acceptance_claim',
    next_safe_action:
      bridgeStatus === 'queue_source_subchain_linked'
        ? 'Use queue/source blocker rows as navigation evidence only; keep candidate row blocked until source citation, transform prerequisites, and Agent 6 boundary packet exist.'
        : 'Keep row on the candidate-use row blocker path; current inputs do not place this row inside the queue/source blocker subchain.',
    mechanical_order: index + 1,
  };
});

const bridgeStatusRows = summarizeBy(bridgeRows, (row) => row.bridge_status, 'bridge_status');
const sourceRidMatchRows = summarizeBy(bridgeRows, (row) => row.source_rid_match_status, 'source_rid_match_status');
const exactBlockerRows = summarizeBy(bridgeRows, (row) => row.exact_blocker, 'exact_blocker');

const linkedRows = bridgeRows.filter((row) => row.queue_source_subchain_linked);
const outsideRows = bridgeRows.filter((row) => !row.queue_source_subchain_linked);
const queueSourceQueueIds = new Set((queueSourceBoundaryBlockerMatrix.blocker_matrix_rows || []).map((row) => row.queue_id));
const candidateQueueIds = new Set(bridgeRows.map((row) => row.queue_id));

const counts = {
  input_candidate_rows: Number(rowBlockerMatrix.counts?.row_blocker_matrix_rows || 0),
  input_candidate_occurrences: Number(rowBlockerMatrix.counts?.row_blocker_matrix_occurrences || 0),
  input_queue_source_blocker_rows: Number(queueSourceBoundaryBlockerMatrix.counts?.blocker_matrix_rows || 0),
  input_queue_source_unique_queue_ids: Number(queueSourceBoundaryBlockerMatrix.counts?.unique_queue_ids || 0),
  candidate_bridge_rows: bridgeRows.length,
  candidate_bridge_occurrences: sum(bridgeRows, 'occurrences'),
  queue_source_subchain_linked_candidate_rows: linkedRows.length,
  queue_source_subchain_linked_candidate_occurrences: sum(linkedRows, 'occurrences'),
  outside_queue_source_subchain_candidate_rows: outsideRows.length,
  outside_queue_source_subchain_candidate_occurrences: sum(outsideRows, 'occurrences'),
  queue_source_blocker_rows_linked: sum(bridgeRows, 'queue_source_blocker_rows'),
  queue_source_pair_keys_linked: sum(bridgeRows, (row) => row.queue_source_pair_keys.length),
  queue_source_pair_keys_linked_unique: new Set(bridgeRows.flatMap((row) => row.queue_source_pair_keys)).size,
  queue_source_unique_source_rids_linked: new Set(bridgeRows.flatMap((row) => row.queue_source_source_rids)).size,
  queue_source_reference_total_linked: sum(bridgeRows, 'queue_source_reference_total'),
  queue_source_occurrence_membership_total_linked: sum(bridgeRows, 'queue_source_occurrence_membership_total'),
  bridge_status_rows: bridgeStatusRows.length,
  source_rid_match_status_rows: sourceRidMatchRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  source_rid_exact_match_rows: bridgeRows.filter((row) => row.source_rid_match_status === 'exact_source_rid_set_match').length,
  source_rid_missing_from_queue_source_rows: bridgeRows.filter(
    (row) => row.source_rid_match_status === 'candidate_source_rids_missing_from_queue_source_subchain',
  ).length,
  source_rid_extra_in_queue_source_rows: bridgeRows.filter(
    (row) => row.source_rid_match_status === 'queue_source_subchain_has_extra_source_rids',
  ).length,
  source_rid_missing_and_extra_rows: bridgeRows.filter(
    (row) => row.source_rid_match_status === 'source_rid_set_missing_and_extra',
  ).length,
  source_rid_outside_subchain_rows: bridgeRows.filter((row) => row.source_rid_match_status === 'outside_queue_source_subchain').length,
  missing_queue_source_rid_references_from_candidate_rows: bridgeRows.reduce(
    (total, row) => total + row.missing_queue_source_rids_from_candidate_row.length,
    0,
  ),
  extra_queue_source_rid_references_not_in_candidate_rows: bridgeRows.reduce(
    (total, row) => total + row.extra_queue_source_rids_not_in_candidate_row.length,
    0,
  ),
  source_rid_overlap_diagnostic_bridge_rows: bridgeRows.filter((row) => row.source_rid_overlap_diagnostic_rows > 0).length,
  batch_id_overlap_diagnostic_bridge_rows: bridgeRows.filter((row) => row.batch_id_overlap_diagnostic_rows > 0).length,
  source_rid_overlap_diagnostic_link_rows: sum(bridgeRows, 'source_rid_overlap_diagnostic_rows'),
  batch_id_overlap_diagnostic_link_rows: sum(bridgeRows, 'batch_id_overlap_diagnostic_rows'),
  candidate_queue_ids_missing_queue_source_subchain: [...candidateQueueIds].filter((queueId) => !queueSourceQueueIds.has(queueId)).length,
  queue_source_queue_ids_missing_candidate_row: [...queueSourceQueueIds].filter((queueId) => !candidateQueueIds.has(queueId)).length,
  duplicate_candidate_queue_ids: bridgeRows.length - new Set(bridgeRows.map((row) => row.queue_id)).size,
  source_family_selection_claims: 0,
  source_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Bridge 78 old-dictionary candidate-use row blockers to 363 queue/source boundary blocker rows without source, Definition, or publication authority.',
  authority_boundary: {
    linkage_navigation_only: true,
    candidate_row_bridge_only: true,
    queue_source_pair_key_is_dedupe_basis: true,
    source_rid_set_comparison_is_mechanical_only: true,
    observed_source_families_are_not_selection_or_acceptance: true,
    no_new_acceptance_or_release_claim: true,
    qa_acceptance: false,
    agent6_acceptance: false,
    source_family_selection: false,
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
    row_blocker_matrix: options.rowBlockerMatrix,
    queue_source_boundary_blocker_matrix: options.queueSourceBoundaryBlockerMatrix,
  },
  counts,
  bridge_status_rows: bridgeStatusRows,
  source_rid_match_status_rows: sourceRidMatchRows,
  exact_blocker_rows: exactBlockerRows,
  bridge_rows: bridgeRows,
  downstream_handoff: {
    handoff_owner: 'Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner.',
    next_safe_action:
      'Use this as non-authoritative navigation from candidate rows to queue/source blockers; keep linked and unlinked rows blocked until source citation, transform, and boundary prerequisites are supplied by their owners.',
    stop_condition:
      'Stop at row-to-queue/source linkage evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 candidate-row queue/source bridge written: rows=${counts.candidate_bridge_rows} linked=${counts.queue_source_subchain_linked_candidate_rows} outside=${counts.outside_queue_source_subchain_candidate_rows}`,
);

function buildSourceRidMatchStatus({ linkedRows, missingLinkedSourceRids, extraLinkedSourceRids }) {
  if (!linkedRows.length) return 'outside_queue_source_subchain';
  if (missingLinkedSourceRids.length && extraLinkedSourceRids.length) return 'source_rid_set_missing_and_extra';
  if (missingLinkedSourceRids.length) return 'candidate_source_rids_missing_from_queue_source_subchain';
  if (extraLinkedSourceRids.length) return 'queue_source_subchain_has_extra_source_rids';
  return 'exact_source_rid_set_match';
}

function summarizeBy(rows, keyFn, keyName) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'none';
    if (!groups.has(key)) {
      groups.set(key, {
        [keyName]: key,
        candidate_rows: 0,
        candidate_occurrences: 0,
        queue_source_blocker_rows: 0,
        queue_source_unique_source_rids: new Set(),
        queue_source_reference_total: 0,
        queue_source_occurrence_membership_total: 0,
        evidence_role: 'candidate_row_bridge_summary_navigation_only_no_acceptance_claim',
      });
    }
    const group = groups.get(key);
    group.candidate_rows += 1;
    group.candidate_occurrences += Number(row.occurrences || 0);
    group.queue_source_blocker_rows += Number(row.queue_source_blocker_rows || 0);
    group.queue_source_reference_total += Number(row.queue_source_reference_total || 0);
    group.queue_source_occurrence_membership_total += Number(row.queue_source_occurrence_membership_total || 0);
    for (const sourceRid of row.queue_source_source_rids || []) group.queue_source_unique_source_rids.add(sourceRid);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      queue_source_unique_source_rids: group.queue_source_unique_source_rids.size,
    }))
    .sort((a, b) => String(a[keyName]).localeCompare(String(b[keyName]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Queue/Source Candidate-Row Bridge',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Authority: no source, license, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '- Handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner',
    '',
    '## Inputs',
    '',
    `- Row blocker matrix: ${artifact.inputs.row_blocker_matrix}`,
    `- Queue/source boundary blocker matrix: ${artifact.inputs.queue_source_boundary_blocker_matrix}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Candidate rows checked | ${c.candidate_bridge_rows} |`,
    `| Candidate occurrences checked | ${c.candidate_bridge_occurrences} |`,
    `| Queue/source blocker rows inspected | ${c.input_queue_source_blocker_rows} |`,
    `| Candidate rows linked to queue/source subchain | ${c.queue_source_subchain_linked_candidate_rows} |`,
    `| Linked candidate occurrences | ${c.queue_source_subchain_linked_candidate_occurrences} |`,
    `| Candidate rows outside queue/source subchain | ${c.outside_queue_source_subchain_candidate_rows} |`,
    `| Outside candidate occurrences | ${c.outside_queue_source_subchain_candidate_occurrences} |`,
    `| Linked queue/source blocker rows | ${c.queue_source_blocker_rows_linked} |`,
    `| Linked queue/source pair keys, unique | ${c.queue_source_pair_keys_linked_unique} |`,
    `| Linked queue/source unique source RIDs | ${c.queue_source_unique_source_rids_linked} |`,
    `| Source-RID exact candidate/subchain matches | ${c.source_rid_exact_match_rows} |`,
    `| Covered rows with candidate source RID missing from subchain | ${c.source_rid_missing_from_queue_source_rows} |`,
    `| Rows outside subchain source-RID comparison | ${c.source_rid_outside_subchain_rows} |`,
    `| Candidate queue IDs missing queue/source subchain | ${c.candidate_queue_ids_missing_queue_source_subchain} |`,
    `| Queue/source queue IDs missing candidate row | ${c.queue_source_queue_ids_missing_candidate_row} |`,
    '',
    '## Bridge Status Rows',
    '',
    '| Status | Candidate rows | Candidate occurrences | Queue/source blocker rows | Source RIDs |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...artifact.bridge_status_rows.map(
      (row) =>
        `| ${row.bridge_status} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.queue_source_blocker_rows} | ${row.queue_source_unique_source_rids} |`,
    ),
    '',
    '## Source-RID Match Rows',
    '',
    '| Source-RID status | Candidate rows | Candidate occurrences | Queue/source blocker rows |',
    '| --- | ---: | ---: | ---: |',
    ...artifact.source_rid_match_status_rows.map(
      (row) =>
        `| ${row.source_rid_match_status} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.queue_source_blocker_rows} |`,
    ),
    '',
    '## Exact Blockers',
    '',
    '| Exact blocker | Candidate rows | Candidate occurrences |',
    '| --- | ---: | ---: |',
    ...artifact.exact_blocker_rows.map(
      (row) => `| ${row.exact_blocker} | ${row.candidate_rows} | ${row.candidate_occurrences} |`,
    ),
    '',
    '## Handoff',
    '',
    `- Next safe action: ${artifact.downstream_handoff.next_safe_action}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

function groupBy(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))].sort(compareStrings);
}

function sum(rows, fieldOrFn) {
  if (typeof fieldOrFn === 'function') {
    return rows.reduce((total, row) => total + Number(fieldOrFn(row) || 0), 0);
  }
  return rows.reduce((total, row) => total + Number(row[fieldOrFn] || 0), 0);
}

function sha256(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

function assertArtifact(artifact, expectedType, relativePath) {
  if (artifact.artifact_type !== expectedType) {
    throw new Error(`${relativePath} artifact_type mismatch: expected ${expectedType}, got ${artifact.artifact_type}`);
  }
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge.mjs [--row-blocker-matrix=PATH] [--queue-source-boundary-blocker-matrix=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--row-blocker-matrix=')) parsed.rowBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--queue-source-boundary-blocker-matrix=')) {
      parsed.queueSourceBoundaryBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.resolve(root, relativePath), value, 'utf8');
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}

function compareStrings(a, b) {
  return String(a).localeCompare(String(b), 'en');
}
