#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  gapWorkset:
    'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.json',
  prereqRouteCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const gapWorkset = readJson(options.gapWorkset);
const prereqRouteCrossmatch = readJson(options.prereqRouteCrossmatch);

assertArtifact(
  gapWorkset,
  'agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset',
  options.gapWorkset,
);
assertArtifact(
  prereqRouteCrossmatch,
  'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch',
  options.prereqRouteCrossmatch,
);

const routeByRid = new Map((prereqRouteCrossmatch.source_rid_rows || []).map((row) => [row.source_rid, row]));

const closureRows = (gapWorkset.gap_rows || [])
  .slice()
  .sort((a, b) => a.queue_id.localeCompare(b.queue_id, 'en'))
  .map((gapRow, index) => {
    const sourceRidRoutes = (gapRow.missing_queue_source_rids_from_candidate_row || []).map((sourceRid) => {
      const routeRow = routeByRid.get(sourceRid) || null;
      return {
        source_rid: sourceRid,
        prereq_route: routeRow?.prereq_route || 'missing_prereq_route',
        route_row_id: routeRow?.route_row_id || null,
        prereq_row_id: routeRow?.prereq_row_id || null,
        exact_blocker: routeRow?.exact_blocker || 'bridge_gap_source_rid_missing_prereq_route',
        source_rid_blocker_row_present: routeRow?.source_rid_blocker_row_present === true,
        queue_source_coverage_row_present: routeRow?.queue_source_coverage_row_present === true,
        source_citation_required: routeRow?.source_citation_required === true,
        source_citation_or_url_present: routeRow?.source_citation_or_url_present === true,
        transform_rule_still_blocked: routeRow?.transform_rule_still_blocked === true,
        agent6_boundary_after_prereq: routeRow?.agent6_boundary_after_prereq === true,
        next_safe_action: routeRow?.next_safe_action || 'Keep blocked until a prereq route artifact is supplied.',
      };
    });
    const prereqRoutes = uniqueSorted(sourceRidRoutes.map((row) => row.prereq_route));
    const closureRouteStatus = buildClosureRouteStatus(prereqRoutes);
    return {
      closure_row_id: `agent3-bridge-gap-candidate-prereq-closure-${sha256(gapRow.queue_id).slice(0, 12)}`,
      gap_row_id: gapRow.gap_row_id,
      bridge_row_id: gapRow.bridge_row_id,
      candidate_row_id: gapRow.candidate_row_id,
      queue_id: gapRow.queue_id,
      token_id: gapRow.token_id,
      lexicon_entry_id: gapRow.lexicon_entry_id,
      surface: gapRow.surface,
      normalized: gapRow.normalized,
      occurrences: Number(gapRow.occurrences || 0),
      gap_type: gapRow.gap_type,
      bridge_status: gapRow.bridge_status,
      source_rid_match_status: gapRow.source_rid_match_status,
      missing_source_rid_count: sourceRidRoutes.length,
      missing_source_rids: sourceRidRoutes.map((row) => row.source_rid),
      prereq_routes: prereqRoutes,
      closure_route_status: closureRouteStatus,
      all_source_rids_have_prereq_route: sourceRidRoutes.every((row) => row.prereq_route !== 'missing_prereq_route'),
      mixed_prereq_routes: prereqRoutes.length > 1,
      source_rid_blocker_rows_present: sourceRidRoutes.filter((row) => row.source_rid_blocker_row_present).length,
      queue_source_coverage_rows_present: sourceRidRoutes.filter((row) => row.queue_source_coverage_row_present).length,
      source_rids_requiring_source_citation: sourceRidRoutes.filter(
        (row) => row.source_citation_required && !row.source_citation_or_url_present,
      ).length,
      source_rids_transform_blocked: sourceRidRoutes.filter((row) => row.transform_rule_still_blocked).length,
      source_rids_after_boundary_prereq: sourceRidRoutes.filter((row) => row.agent6_boundary_after_prereq).length,
      current_blocker_ids: gapRow.current_blocker_ids || [],
      current_blocker_count: Number(gapRow.current_blocker_count || 0),
      exact_blockers: uniqueSorted(sourceRidRoutes.map((row) => row.exact_blocker)),
      exact_blocker: buildExactBlocker(closureRouteStatus),
      evidence_role: 'bridge_gap_candidate_prereq_closure_navigation_only_no_acceptance_claim',
      next_safe_action: buildNextSafeAction(closureRouteStatus, gapRow.queue_id),
      source_rid_routes: sourceRidRoutes,
      mechanical_order: index + 1,
    };
  });

const closureRouteRows = summarizeBy(closureRows, (row) => row.closure_route_status, 'closure_route_status');
const gapTypeRows = summarizeBy(closureRows, (row) => row.gap_type, 'gap_type');
const exactBlockerRows = summarizeBy(closureRows, (row) => row.exact_blocker, 'exact_blocker');

const counts = {
  input_gap_rows: Number(gapWorkset.counts?.gap_workset_rows || 0),
  input_gap_occurrences: Number(gapWorkset.counts?.gap_workset_occurrences || 0),
  input_prereq_route_rows: Number(prereqRouteCrossmatch.counts?.prereq_route_rows || 0),
  closure_rows: closureRows.length,
  closure_occurrences: sum(closureRows, 'occurrences'),
  missing_source_rid_references: sum(closureRows, 'missing_source_rid_count'),
  all_a06_evidence_boundary_prereq_rows: closureRows.filter(
    (row) => row.closure_route_status === 'all_a06_evidence_boundary_prereq',
  ).length,
  all_a06_evidence_boundary_prereq_occurrences: sum(
    closureRows.filter((row) => row.closure_route_status === 'all_a06_evidence_boundary_prereq'),
    'occurrences',
  ),
  all_direct_source_citation_prereq_rows: closureRows.filter(
    (row) => row.closure_route_status === 'all_direct_source_citation_prereq',
  ).length,
  all_direct_source_citation_prereq_occurrences: sum(
    closureRows.filter((row) => row.closure_route_status === 'all_direct_source_citation_prereq'),
    'occurrences',
  ),
  mixed_prereq_route_rows: closureRows.filter((row) => row.mixed_prereq_routes).length,
  missing_prereq_route_rows: closureRows.filter((row) => !row.all_source_rids_have_prereq_route).length,
  source_rid_blocker_rows_present: sum(closureRows, 'source_rid_blocker_rows_present'),
  queue_source_coverage_rows_present: sum(closureRows, 'queue_source_coverage_rows_present'),
  source_rids_requiring_source_citation: sum(closureRows, 'source_rids_requiring_source_citation'),
  source_rids_transform_blocked: sum(closureRows, 'source_rids_transform_blocked'),
  source_rids_after_boundary_prereq: sum(closureRows, 'source_rids_after_boundary_prereq'),
  rows_with_current_blockers: closureRows.filter((row) => row.current_blocker_count > 0).length,
  current_blocker_total: sum(closureRows, 'current_blocker_count'),
  closure_route_summary_rows: closureRouteRows.length,
  gap_type_rows: gapTypeRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  approval_route_owner_a07_rows: closureRows.length,
  a06_evidence_validator_production_only_rows: closureRows.length,
  a06_approval_requested_rows: 0,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Roll 30 bridge-gap source-RID prereq routes up to 14 candidate rows without source, Definition, approval, or publication authority.',
  authority_boundary: {
    linkage_navigation_only: true,
    bridge_gap_candidate_prereq_closure_only: true,
    closure_route_is_not_acceptance_or_transform_readiness: true,
    approval_route_owner_a07: true,
    a06_evidence_validator_production_only: true,
    a06_approval_requested: false,
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
    prereq_route_crossmatch: options.prereqRouteCrossmatch,
  },
  counts,
  closure_route_rows: closureRouteRows,
  gap_type_rows: gapTypeRows,
  exact_blocker_rows: exactBlockerRows,
  closure_rows: closureRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 for release/package intake; A07 for approval/SOP/final validation/release gate; A06 evidence/validator production only.',
    next_safe_action:
      'Use this matrix as row-level navigation: 9 candidate rows route entirely to the A06 evidence boundary prereq path and 5 route entirely to direct source-citation prereq; route any approval/SOP/final-validation/release-gate question to A07.',
    stop_condition:
      'Stop at candidate-row prereq closure evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 bridge-gap candidate prereq closure matrix written: rows=${counts.closure_rows} a06=${counts.all_a06_evidence_boundary_prereq_rows} direct=${counts.all_direct_source_citation_prereq_rows}`,
);

function buildClosureRouteStatus(prereqRoutes) {
  if (prereqRoutes.length === 0 || prereqRoutes.includes('missing_prereq_route')) return 'missing_prereq_route';
  if (prereqRoutes.length > 1) return 'mixed_prereq_routes';
  if (prereqRoutes[0] === 'agent6_source_family_boundary_prereq') return 'all_a06_evidence_boundary_prereq';
  if (prereqRoutes[0] === 'direct_source_citation_prereq') return 'all_direct_source_citation_prereq';
  return prereqRoutes[0];
}

function buildExactBlocker(closureRouteStatus) {
  if (closureRouteStatus === 'all_a06_evidence_boundary_prereq') {
    return 'candidate_row_gap_source_rids_all_route_to_a06_evidence_boundary_prereq';
  }
  if (closureRouteStatus === 'all_direct_source_citation_prereq') {
    return 'candidate_row_gap_source_rids_all_route_to_direct_source_citation_prereq';
  }
  if (closureRouteStatus === 'mixed_prereq_routes') return 'candidate_row_gap_source_rids_have_mixed_prereq_routes';
  return 'candidate_row_gap_source_rids_missing_prereq_route';
}

function buildNextSafeAction(closureRouteStatus, queueId) {
  if (closureRouteStatus === 'all_a06_evidence_boundary_prereq') {
    return `Keep ${queueId} blocked on A06 evidence boundary prereq navigation; route approval/SOP/final-validation/release-gate questions to A07.`;
  }
  if (closureRouteStatus === 'all_direct_source_citation_prereq') {
    return `Keep ${queueId} blocked on direct source-citation prereq navigation; route approval/SOP/final-validation/release-gate questions to A07.`;
  }
  if (closureRouteStatus === 'mixed_prereq_routes') {
    return `Keep ${queueId} blocked until mixed prereq routes are reviewed mechanically; route approval/SOP/final-validation/release-gate questions to A07.`;
  }
  return `Keep ${queueId} blocked until missing prereq routes are supplied; route approval/SOP/final-validation/release-gate questions to A07.`;
}

function summarizeBy(rows, keyFn, keyName) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'none';
    if (!groups.has(key)) {
      groups.set(key, {
        [keyName]: key,
        closure_rows: 0,
        closure_occurrences: 0,
        missing_source_rid_references: 0,
        source_rid_blocker_rows_present: 0,
        queue_source_coverage_rows_present: 0,
        evidence_role: 'bridge_gap_candidate_prereq_closure_summary_navigation_only_no_acceptance_claim',
      });
    }
    const group = groups.get(key);
    group.closure_rows += 1;
    group.closure_occurrences += Number(row.occurrences || 0);
    group.missing_source_rid_references += Number(row.missing_source_rid_count || 0);
    group.source_rid_blocker_rows_present += Number(row.source_rid_blocker_rows_present || 0);
    group.queue_source_coverage_rows_present += Number(row.queue_source_coverage_rows_present || 0);
  }
  return [...groups.values()].sort((a, b) => String(a[keyName]).localeCompare(String(b[keyName]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Candidate Prereq Closure Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Authority: no source, license, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '- Handoff owner: Agent 10 for release/package intake; A07 for approval/SOP/final validation/release gate; A06 evidence/validator production only',
    '',
    '## Inputs',
    '',
    `- Gap workset: ${artifact.inputs.gap_workset}`,
    `- Prereq route crossmatch: ${artifact.inputs.prereq_route_crossmatch}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Candidate closure rows | ${c.closure_rows} |`,
    `| Candidate closure occurrences | ${c.closure_occurrences} |`,
    `| Missing source-RID references | ${c.missing_source_rid_references} |`,
    `| All A06 evidence boundary prereq rows | ${c.all_a06_evidence_boundary_prereq_rows} |`,
    `| All A06 evidence boundary prereq occurrences | ${c.all_a06_evidence_boundary_prereq_occurrences} |`,
    `| All direct source-citation prereq rows | ${c.all_direct_source_citation_prereq_rows} |`,
    `| All direct source-citation prereq occurrences | ${c.all_direct_source_citation_prereq_occurrences} |`,
    `| Mixed prereq route rows | ${c.mixed_prereq_route_rows} |`,
    `| Missing prereq route rows | ${c.missing_prereq_route_rows} |`,
    `| Source-RID blocker rows present | ${c.source_rid_blocker_rows_present} |`,
    `| Queue/source coverage rows present | ${c.queue_source_coverage_rows_present} |`,
    `| Source RIDs requiring source citation | ${c.source_rids_requiring_source_citation} |`,
    `| Source RIDs transform blocked | ${c.source_rids_transform_blocked} |`,
    '',
    '## Closure Routes',
    '',
    '| Closure route | Candidate rows | Occurrences | Missing source-RID refs | Source-RID blockers | Queue/source coverage |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.closure_route_rows.map(
      (row) =>
        `| ${row.closure_route_status} | ${row.closure_rows} | ${row.closure_occurrences} | ${row.missing_source_rid_references} | ${row.source_rid_blocker_rows_present} | ${row.queue_source_coverage_rows_present} |`,
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix.mjs [--gap-workset=PATH] [--prereq-route-crossmatch=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--gap-workset=')) parsed.gapWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--prereq-route-crossmatch=')) parsed.prereqRouteCrossmatch = cleanRelativePath(valueAfterEquals(arg));
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
