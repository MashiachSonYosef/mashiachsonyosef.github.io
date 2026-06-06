#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  bridge:
    'reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const bridge = readJson(options.bridge);

assertArtifact(
  bridge,
  'agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge',
  options.bridge,
);

const gapRows = (bridge.bridge_rows || [])
  .filter(
    (row) =>
      !row.queue_source_subchain_linked ||
      (row.missing_queue_source_rids_from_candidate_row || []).length ||
      (row.extra_queue_source_rids_not_in_candidate_row || []).length,
  )
  .sort((a, b) => {
    const statusDelta = buildGapType(a).localeCompare(buildGapType(b), 'en');
    if (statusDelta !== 0) return statusDelta;
    return a.queue_id.localeCompare(b.queue_id, 'en');
  })
  .map((row, index) => {
    const gapType = buildGapType(row);
    const gapReasonIds = buildGapReasonIds(row);
    return {
      gap_row_id: `agent3-queue-source-bridge-gap-${sha256(`${row.queue_id}:${gapType}`).slice(0, 12)}`,
      bridge_row_id: row.bridge_row_id,
      candidate_row_id: row.candidate_row_id,
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
      gap_type: gapType,
      gap_reason_ids: gapReasonIds,
      row_source_rids: row.row_source_rids || [],
      missing_queue_source_rids_from_candidate_row: row.missing_queue_source_rids_from_candidate_row || [],
      extra_queue_source_rids_not_in_candidate_row: row.extra_queue_source_rids_not_in_candidate_row || [],
      queue_source_subchain_linked: Boolean(row.queue_source_subchain_linked),
      queue_source_blocker_rows: Number(row.queue_source_blocker_rows || 0),
      queue_source_pair_keys: row.queue_source_pair_keys || [],
      queue_source_source_rids: row.queue_source_source_rids || [],
      queue_source_reference_total: Number(row.queue_source_reference_total || 0),
      queue_source_occurrence_membership_total: Number(row.queue_source_occurrence_membership_total || 0),
      bridge_status: row.bridge_status,
      source_rid_match_status: row.source_rid_match_status,
      current_blocker_ids: row.current_blocker_ids || [],
      current_blocker_count: Number(row.current_blocker_count || 0),
      exact_blocker: buildExactBlocker(row),
      evidence_role: 'queue_source_bridge_gap_workset_navigation_only_no_acceptance_claim',
      handoff_owner: 'Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner.',
      next_safe_action: buildNextSafeAction(row),
      mechanical_order: index + 1,
    };
  });

const gapTypeRows = summarizeBy(gapRows, (row) => row.gap_type, 'gap_type');
const sourceRidStatusRows = summarizeBy(gapRows, (row) => row.source_rid_match_status, 'source_rid_match_status');
const exactBlockerRows = summarizeBy(gapRows, (row) => row.exact_blocker, 'exact_blocker');

const outsideRows = gapRows.filter((row) => row.gap_type === 'outside_queue_source_subchain');
const linkedMissingRows = gapRows.filter((row) => row.gap_type === 'linked_row_missing_candidate_source_rid');
const linkedExtraRows = gapRows.filter((row) => row.gap_type === 'linked_row_extra_queue_source_source_rid');

const counts = {
  input_bridge_rows: Number(bridge.counts?.candidate_bridge_rows || 0),
  input_bridge_occurrences: Number(bridge.counts?.candidate_bridge_occurrences || 0),
  input_linked_candidate_rows: Number(bridge.counts?.queue_source_subchain_linked_candidate_rows || 0),
  input_outside_candidate_rows: Number(bridge.counts?.outside_queue_source_subchain_candidate_rows || 0),
  gap_workset_rows: gapRows.length,
  gap_workset_occurrences: sum(gapRows, 'occurrences'),
  outside_queue_source_subchain_rows: outsideRows.length,
  outside_queue_source_subchain_occurrences: sum(outsideRows, 'occurrences'),
  linked_rows_missing_candidate_source_rid: linkedMissingRows.length,
  linked_rows_missing_candidate_source_rid_occurrences: sum(linkedMissingRows, 'occurrences'),
  linked_rows_extra_queue_source_source_rid: linkedExtraRows.length,
  linked_rows_extra_queue_source_source_rid_occurrences: sum(linkedExtraRows, 'occurrences'),
  gap_type_rows: gapTypeRows.length,
  source_rid_match_status_rows: sourceRidStatusRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  candidate_source_rid_references_requiring_linkage_review: gapRows.reduce(
    (total, row) => total + row.missing_queue_source_rids_from_candidate_row.length,
    0,
  ),
  outside_candidate_source_rid_references_not_in_subchain: outsideRows.reduce(
    (total, row) => total + row.missing_queue_source_rids_from_candidate_row.length,
    0,
  ),
  linked_candidate_source_rid_references_not_in_subchain: linkedMissingRows.reduce(
    (total, row) => total + row.missing_queue_source_rids_from_candidate_row.length,
    0,
  ),
  extra_queue_source_rid_references_not_in_candidate_row: gapRows.reduce(
    (total, row) => total + row.extra_queue_source_rids_not_in_candidate_row.length,
    0,
  ),
  queue_source_blocker_rows_carried_forward: sum(gapRows, 'queue_source_blocker_rows'),
  queue_source_pair_keys_carried_forward: gapRows.reduce((total, row) => total + row.queue_source_pair_keys.length, 0),
  queue_source_unique_source_rids_carried_forward: new Set(gapRows.flatMap((row) => row.queue_source_source_rids)).size,
  queue_source_reference_total_carried_forward: sum(gapRows, 'queue_source_reference_total'),
  queue_source_occurrence_membership_total_carried_forward: sum(gapRows, 'queue_source_occurrence_membership_total'),
  current_blocker_total: sum(gapRows, 'current_blocker_count'),
  rows_with_current_blockers: gapRows.filter((row) => row.current_blocker_count > 0).length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Extract unresolved candidate-row to queue/source bridge gaps for bounded Agent 10 package intake without source, Definition, or publication authority.',
  authority_boundary: {
    linkage_navigation_only: true,
    bridge_gap_workset_only: true,
    gap_rows_are_not_transform_ready: true,
    source_rid_set_comparison_is_mechanical_only: true,
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
    queue_source_candidate_row_bridge: options.bridge,
  },
  counts,
  gap_type_rows: gapTypeRows,
  source_rid_match_status_rows: sourceRidStatusRows,
  exact_blocker_rows: exactBlockerRows,
  gap_rows: gapRows,
  downstream_handoff: {
    handoff_owner: 'Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner.',
    next_safe_action:
      'Use this workset to decide whether exact queue/source inclusion inputs exist for the 13 outside rows and whether source RID E00687 should be added to the linked queue/source row; keep every row blocked until source citation, transform, and boundary prerequisites are supplied by their owners.',
    stop_condition:
      'Stop at bridge-gap navigation evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 queue/source bridge gap workset written: rows=${counts.gap_workset_rows} outside=${counts.outside_queue_source_subchain_rows} linked_missing=${counts.linked_rows_missing_candidate_source_rid}`,
);

function buildGapType(row) {
  if (!row.queue_source_subchain_linked) return 'outside_queue_source_subchain';
  if ((row.missing_queue_source_rids_from_candidate_row || []).length) return 'linked_row_missing_candidate_source_rid';
  return 'linked_row_extra_queue_source_source_rid';
}

function buildGapReasonIds(row) {
  const reasons = [];
  if (!row.queue_source_subchain_linked) reasons.push('candidate_queue_id_absent_from_queue_source_subchain');
  if ((row.missing_queue_source_rids_from_candidate_row || []).length) {
    reasons.push('candidate_source_rids_missing_from_queue_source_subchain');
  }
  if ((row.extra_queue_source_rids_not_in_candidate_row || []).length) {
    reasons.push('queue_source_subchain_source_rids_not_in_candidate_row');
  }
  return reasons;
}

function buildExactBlocker(row) {
  if (!row.queue_source_subchain_linked) {
    return 'candidate_queue_id_outside_queue_source_subchain_current_row_blockers_only';
  }
  if ((row.missing_queue_source_rids_from_candidate_row || []).length) {
    return 'linked_candidate_row_missing_source_rid_from_queue_source_subchain';
  }
  return 'linked_queue_source_subchain_has_extra_source_rid_not_in_candidate_row';
}

function buildNextSafeAction(row) {
  if (!row.queue_source_subchain_linked) {
    return 'If Agent 10 needs this row, require exact queue/source inclusion inputs or keep it blocked on the candidate-use row blocker path; do not infer source, transform, or Definition readiness from this gap row.';
  }
  if ((row.missing_queue_source_rids_from_candidate_row || []).length) {
    return `Review whether candidate source RID(s) ${row.missing_queue_source_rids_from_candidate_row.join(', ')} should join the queue/source subchain; keep row blocked until source citation, transform prerequisites, and Agent 6 boundary packet exist.`;
  }
  return 'Review extra queue/source source-RID membership mechanically; keep row blocked until source citation, transform prerequisites, and Agent 6 boundary packet exist.';
}

function summarizeBy(rows, keyFn, keyName) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'none';
    if (!groups.has(key)) {
      groups.set(key, {
        [keyName]: key,
        gap_rows: 0,
        gap_occurrences: 0,
        candidate_source_rid_references_requiring_linkage_review: 0,
        queue_source_blocker_rows: 0,
        evidence_role: 'queue_source_bridge_gap_summary_navigation_only_no_acceptance_claim',
      });
    }
    const group = groups.get(key);
    group.gap_rows += 1;
    group.gap_occurrences += Number(row.occurrences || 0);
    group.candidate_source_rid_references_requiring_linkage_review += (
      row.missing_queue_source_rids_from_candidate_row || []
    ).length;
    group.queue_source_blocker_rows += Number(row.queue_source_blocker_rows || 0);
  }
  return [...groups.values()].sort((a, b) => String(a[keyName]).localeCompare(String(b[keyName]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Queue/Source Bridge Gap Workset',
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
    '## Input',
    '',
    `- Queue/source candidate-row bridge: ${artifact.inputs.queue_source_candidate_row_bridge}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Gap workset rows | ${c.gap_workset_rows} |`,
    `| Gap workset occurrences | ${c.gap_workset_occurrences} |`,
    `| Outside queue/source subchain rows | ${c.outside_queue_source_subchain_rows} |`,
    `| Outside queue/source subchain occurrences | ${c.outside_queue_source_subchain_occurrences} |`,
    `| Linked rows missing candidate source RID | ${c.linked_rows_missing_candidate_source_rid} |`,
    `| Linked missing-source-RID occurrences | ${c.linked_rows_missing_candidate_source_rid_occurrences} |`,
    `| Candidate source-RID references requiring linkage review | ${c.candidate_source_rid_references_requiring_linkage_review} |`,
    `| Outside candidate source-RID references not in subchain | ${c.outside_candidate_source_rid_references_not_in_subchain} |`,
    `| Linked candidate source-RID references not in subchain | ${c.linked_candidate_source_rid_references_not_in_subchain} |`,
    `| Queue/source blocker rows carried forward | ${c.queue_source_blocker_rows_carried_forward} |`,
    `| Current blocker total carried forward | ${c.current_blocker_total} |`,
    '',
    '## Gap Types',
    '',
    '| Gap type | Rows | Occurrences | Source-RID refs needing review | Queue/source blocker rows |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...artifact.gap_type_rows.map(
      (row) =>
        `| ${row.gap_type} | ${row.gap_rows} | ${row.gap_occurrences} | ${row.candidate_source_rid_references_requiring_linkage_review} | ${row.queue_source_blocker_rows} |`,
    ),
    '',
    '## Exact Blockers',
    '',
    '| Exact blocker | Rows | Occurrences |',
    '| --- | ---: | ---: |',
    ...artifact.exact_blocker_rows.map(
      (row) => `| ${row.exact_blocker} | ${row.gap_rows} | ${row.gap_occurrences} |`,
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

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset.mjs [--bridge=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--bridge=')) parsed.bridge = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
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
