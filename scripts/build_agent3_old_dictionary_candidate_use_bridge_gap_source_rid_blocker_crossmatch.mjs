#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  gapWorkset:
    'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.json',
  sourceRidBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.json',
  sourceRidDedupeCoverageCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const gapWorkset = readJson(options.gapWorkset);
const sourceRidBlockerMatrix = readJson(options.sourceRidBlockerMatrix);
const sourceRidDedupeCoverageCrossmatch = readJson(options.sourceRidDedupeCoverageCrossmatch);

assertArtifact(
  gapWorkset,
  'agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset',
  options.gapWorkset,
);
assertArtifact(
  sourceRidBlockerMatrix,
  'agent3_old_dictionary_candidate_use_source_rid_blocker_matrix',
  options.sourceRidBlockerMatrix,
);
assertArtifact(
  sourceRidDedupeCoverageCrossmatch,
  'agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch',
  options.sourceRidDedupeCoverageCrossmatch,
);

const blockerByRid = new Map((sourceRidBlockerMatrix.source_rid_rows || []).map((row) => [row.source_rid, row]));
const coverageByRid = new Map((sourceRidDedupeCoverageCrossmatch.coverage_rows || []).map((row) => [row.source_rid, row]));
const gapRefsByRid = new Map();

for (const row of gapWorkset.gap_rows || []) {
  for (const sourceRid of row.missing_queue_source_rids_from_candidate_row || []) {
    if (!gapRefsByRid.has(sourceRid)) gapRefsByRid.set(sourceRid, []);
    gapRefsByRid.get(sourceRid).push({
      gap_row_id: row.gap_row_id,
      queue_id: row.queue_id,
      token_id: row.token_id,
      occurrences: Number(row.occurrences || 0),
      gap_type: row.gap_type,
      bridge_status: row.bridge_status,
      source_rid_match_status: row.source_rid_match_status,
      current_blocker_ids: row.current_blocker_ids || [],
      exact_blocker: row.exact_blocker,
    });
  }
}

const sourceRidRows = [...gapRefsByRid.entries()]
  .sort(([a], [b]) => a.localeCompare(b, 'en'))
  .map(([sourceRid, refs], index) => {
    const blocker = blockerByRid.get(sourceRid) || null;
    const coverage = coverageByRid.get(sourceRid) || null;
    const coverageStatus = buildCoverageStatus(blocker, coverage);
    return {
      crossmatch_row_id: `agent3-bridge-gap-source-rid-crossmatch-${sha256(sourceRid).slice(0, 12)}`,
      source_rid: sourceRid,
      source_rid_prefix: blocker?.source_rid_prefix || prefixOf(sourceRid),
      gap_reference_count: refs.length,
      gap_reference_occurrence_membership_total: sum(refs, 'occurrences'),
      gap_queue_ids: uniqueSorted(refs.map((ref) => ref.queue_id)),
      gap_token_ids: uniqueSorted(refs.map((ref) => ref.token_id)),
      gap_types: uniqueSorted(refs.map((ref) => ref.gap_type)),
      gap_exact_blockers: uniqueSorted(refs.map((ref) => ref.exact_blocker)),
      source_rid_blocker_row_present: Boolean(blocker),
      source_rid_blocker_row_id: blocker?.row_id || null,
      blocker_reference_count: Number(blocker?.reference_count || 0),
      blocker_occurrence_total: Number(blocker?.occurrence_total || 0),
      blocker_queue_ids: blocker?.queue_ids || [],
      blocker_token_ids: blocker?.token_ids || [],
      blocker_source_families: blocker?.source_families || [],
      blocker_partitions: blocker?.partitions || [],
      blocker_triage_groups: blocker?.triage_groups || [],
      blocker_current_blocker_ids: blocker?.current_blocker_ids || [],
      blocker_current_blocker_count: Number(blocker?.current_blocker_count || 0),
      blocker_source_citation_missing: blocker?.source_citation_missing === true,
      blocker_transform_rule_missing: blocker?.transform_rule_missing === true,
      blocker_agent6_boundary_required: Number(blocker?.rows_agent6_boundary_required || 0) > 0,
      queue_source_coverage_row_present: Boolean(coverage),
      queue_source_coverage_row_id: coverage?.coverage_row_id || null,
      queue_source_coverage_status: coverage?.coverage_status || null,
      queue_source_pair_keys: coverage?.queue_source_pair_keys || [],
      queue_source_dedupe_key_ids: coverage?.dedupe_key_ids || [],
      queue_source_coverage_occurrence_membership_total: Number(
        coverage?.queue_source_occurrence_membership_total || 0,
      ),
      queue_source_coverage_exact_blocker: coverage?.exact_blocker || null,
      coverage_gap_status: coverageStatus,
      exact_blocker: buildExactBlocker(blocker, coverage),
      evidence_role: 'bridge_gap_source_rid_blocker_crossmatch_navigation_only_no_acceptance_claim',
      next_safe_action: buildNextSafeAction(blocker, coverage, sourceRid),
      gap_references: refs,
      mechanical_order: index + 1,
    };
  });

const prefixRows = summarizeBy(sourceRidRows, (row) => row.source_rid_prefix, 'source_rid_prefix');
const coverageStatusRows = summarizeBy(sourceRidRows, (row) => row.coverage_gap_status, 'coverage_gap_status');
const exactBlockerRows = summarizeBy(sourceRidRows, (row) => row.exact_blocker, 'exact_blocker');

const counts = {
  input_gap_workset_rows: Number(gapWorkset.counts?.gap_workset_rows || 0),
  input_gap_workset_occurrences: Number(gapWorkset.counts?.gap_workset_occurrences || 0),
  input_gap_source_rid_references: Number(
    gapWorkset.counts?.candidate_source_rid_references_requiring_linkage_review || 0,
  ),
  input_source_rid_blocker_rows: Number(sourceRidBlockerMatrix.counts?.source_rid_rows || 0),
  input_source_rid_dedupe_coverage_rows: Number(sourceRidDedupeCoverageCrossmatch.counts?.coverage_rows || 0),
  crossmatch_source_rid_rows: sourceRidRows.length,
  source_rid_reference_rows: sum(sourceRidRows, 'gap_reference_count'),
  source_rid_reference_occurrence_membership_total: sum(
    sourceRidRows,
    'gap_reference_occurrence_membership_total',
  ),
  source_rids_with_blocker_row: sourceRidRows.filter((row) => row.source_rid_blocker_row_present).length,
  source_rids_missing_blocker_row: sourceRidRows.filter((row) => !row.source_rid_blocker_row_present).length,
  source_rids_with_queue_source_coverage: sourceRidRows.filter((row) => row.queue_source_coverage_row_present).length,
  source_rids_missing_queue_source_coverage: sourceRidRows.filter((row) => !row.queue_source_coverage_row_present).length,
  source_rids_blocker_present_coverage_missing: sourceRidRows.filter(
    (row) => row.source_rid_blocker_row_present && !row.queue_source_coverage_row_present,
  ).length,
  source_rids_blocker_and_coverage_present: sourceRidRows.filter(
    (row) => row.source_rid_blocker_row_present && row.queue_source_coverage_row_present,
  ).length,
  unique_gap_queue_ids: new Set(sourceRidRows.flatMap((row) => row.gap_queue_ids)).size,
  unique_gap_token_ids: new Set(sourceRidRows.flatMap((row) => row.gap_token_ids)).size,
  prefix_rows: prefixRows.length,
  coverage_status_rows: coverageStatusRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  blocker_reference_total: sum(sourceRidRows, 'blocker_reference_count'),
  blocker_occurrence_total: sum(sourceRidRows, 'blocker_occurrence_total'),
  blocker_current_blocker_total: sum(sourceRidRows, 'blocker_current_blocker_count'),
  rows_missing_source_citation: sourceRidRows.filter((row) => row.blocker_source_citation_missing).length,
  rows_missing_transform_rule: sourceRidRows.filter((row) => row.blocker_transform_rule_missing).length,
  rows_agent6_boundary_required: sourceRidRows.filter((row) => row.blocker_agent6_boundary_required).length,
  queue_source_pair_keys_present: sum(sourceRidRows, (row) => row.queue_source_pair_keys.length),
  queue_source_coverage_occurrence_membership_total: sum(
    sourceRidRows,
    'queue_source_coverage_occurrence_membership_total',
  ),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Crossmatch bridge-gap source RIDs against source-RID blocker and queue/source coverage artifacts without source, Definition, or publication authority.',
  authority_boundary: {
    linkage_navigation_only: true,
    bridge_gap_source_rid_crossmatch_only: true,
    source_rid_blocker_presence_is_not_source_acceptance: true,
    queue_source_coverage_absence_is_mechanical_only: true,
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
    gap_workset: options.gapWorkset,
    source_rid_blocker_matrix: options.sourceRidBlockerMatrix,
    source_rid_dedupe_coverage_crossmatch: options.sourceRidDedupeCoverageCrossmatch,
  },
  counts,
  prefix_rows: prefixRows,
  coverage_status_rows: coverageStatusRows,
  exact_blocker_rows: exactBlockerRows,
  source_rid_rows: sourceRidRows,
  downstream_handoff: {
    handoff_owner: 'Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner.',
    next_safe_action:
      'Use this crossmatch to route all 30 gap source RIDs as known source-RID blocker rows that are absent from queue/source dedupe coverage; do not treat blocker presence as source acceptance or transform readiness.',
    stop_condition:
      'Stop at source-RID blocker/coverage crossmatch evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 bridge-gap source-RID blocker crossmatch written: source_rids=${counts.crossmatch_source_rid_rows} blocker_present=${counts.source_rids_with_blocker_row} coverage_missing=${counts.source_rids_missing_queue_source_coverage}`,
);

function buildCoverageStatus(blocker, coverage) {
  if (blocker && coverage) return 'source_rid_blocker_and_queue_source_coverage_present';
  if (blocker && !coverage) return 'source_rid_blocker_present_queue_source_coverage_missing';
  if (!blocker && coverage) return 'source_rid_blocker_missing_queue_source_coverage_present';
  return 'source_rid_missing_from_blocker_and_queue_source_coverage';
}

function buildExactBlocker(blocker, coverage) {
  if (blocker && !coverage) {
    return 'gap_source_rid_has_blocker_row_but_is_absent_from_queue_source_dedupe_coverage';
  }
  if (!blocker && !coverage) return 'gap_source_rid_missing_from_blocker_and_queue_source_coverage';
  if (!blocker && coverage) return 'gap_source_rid_missing_blocker_row_but_has_queue_source_coverage';
  return 'gap_source_rid_has_blocker_and_queue_source_coverage_rows';
}

function buildNextSafeAction(blocker, coverage, sourceRid) {
  if (blocker && !coverage) {
    return `Keep ${sourceRid} blocked as a known source-RID blocker row; require exact queue/source inclusion inputs before any queue/source coverage or transform review.`;
  }
  if (!blocker && !coverage) {
    return `Record ${sourceRid} as missing from source-RID blocker and queue/source coverage inputs before any downstream use.`;
  }
  if (!blocker && coverage) {
    return `Review ${sourceRid} for blocker-row mismatch before any downstream use.`;
  }
  return `Keep ${sourceRid} blocked until source citation, transform prerequisites, and boundary packet exist.`;
}

function summarizeBy(rows, keyFn, keyName) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'none';
    if (!groups.has(key)) {
      groups.set(key, {
        [keyName]: key,
        source_rid_rows: 0,
        source_rid_reference_rows: 0,
        source_rid_reference_occurrence_membership_total: 0,
        source_rids_with_blocker_row: 0,
        source_rids_with_queue_source_coverage: 0,
        evidence_role: 'bridge_gap_source_rid_blocker_crossmatch_summary_navigation_only_no_acceptance_claim',
      });
    }
    const group = groups.get(key);
    group.source_rid_rows += 1;
    group.source_rid_reference_rows += Number(row.gap_reference_count || 0);
    group.source_rid_reference_occurrence_membership_total += Number(
      row.gap_reference_occurrence_membership_total || 0,
    );
    if (row.source_rid_blocker_row_present) group.source_rids_with_blocker_row += 1;
    if (row.queue_source_coverage_row_present) group.source_rids_with_queue_source_coverage += 1;
  }
  return [...groups.values()].sort((a, b) => String(a[keyName]).localeCompare(String(b[keyName]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Source-RID Blocker Crossmatch',
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
    `- Gap workset: ${artifact.inputs.gap_workset}`,
    `- Source-RID blocker matrix: ${artifact.inputs.source_rid_blocker_matrix}`,
    `- Source-RID dedupe coverage crossmatch: ${artifact.inputs.source_rid_dedupe_coverage_crossmatch}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Gap source RIDs crossmatched | ${c.crossmatch_source_rid_rows} |`,
    `| Gap source-RID references | ${c.source_rid_reference_rows} |`,
    `| Source-RID reference occurrence memberships | ${c.source_rid_reference_occurrence_membership_total} |`,
    `| Source RIDs with blocker row | ${c.source_rids_with_blocker_row} |`,
    `| Source RIDs missing blocker row | ${c.source_rids_missing_blocker_row} |`,
    `| Source RIDs with queue/source coverage | ${c.source_rids_with_queue_source_coverage} |`,
    `| Source RIDs missing queue/source coverage | ${c.source_rids_missing_queue_source_coverage} |`,
    `| Blocker present, coverage missing | ${c.source_rids_blocker_present_coverage_missing} |`,
    `| Unique gap queue IDs | ${c.unique_gap_queue_ids} |`,
    `| Unique gap token IDs | ${c.unique_gap_token_ids} |`,
    `| Prefix rows | ${c.prefix_rows} |`,
    `| Blocker current blocker total | ${c.blocker_current_blocker_total} |`,
    `| Rows missing source citation | ${c.rows_missing_source_citation} |`,
    `| Rows missing transform rule | ${c.rows_missing_transform_rule} |`,
    `| Rows requiring Agent 6 boundary | ${c.rows_agent6_boundary_required} |`,
    '',
    '## Coverage Status',
    '',
    '| Coverage status | Source RIDs | Source-RID refs | Occurrence memberships | With blocker | With queue/source coverage |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.coverage_status_rows.map(
      (row) =>
        `| ${row.coverage_gap_status} | ${row.source_rid_rows} | ${row.source_rid_reference_rows} | ${row.source_rid_reference_occurrence_membership_total} | ${row.source_rids_with_blocker_row} | ${row.source_rids_with_queue_source_coverage} |`,
    ),
    '',
    '## Prefix Rows',
    '',
    '| Prefix | Source RIDs | Source-RID refs | Occurrence memberships |',
    '| --- | ---: | ---: | ---: |',
    ...artifact.prefix_rows.map(
      (row) =>
        `| ${row.source_rid_prefix} | ${row.source_rid_rows} | ${row.source_rid_reference_rows} | ${row.source_rid_reference_occurrence_membership_total} |`,
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

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))].sort((a, b) =>
    String(a).localeCompare(String(b), 'en'),
  );
}

function prefixOf(sourceRid) {
  return sourceRid.match(/^[A-Z]+/)?.[0] || '';
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch.mjs [--gap-workset=PATH] [--source-rid-blocker-matrix=PATH] [--source-rid-dedupe-coverage-crossmatch=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--gap-workset=')) parsed.gapWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-rid-blocker-matrix=')) {
      parsed.sourceRidBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--source-rid-dedupe-coverage-crossmatch=')) {
      parsed.sourceRidDedupeCoverageCrossmatch = cleanRelativePath(valueAfterEquals(arg));
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
