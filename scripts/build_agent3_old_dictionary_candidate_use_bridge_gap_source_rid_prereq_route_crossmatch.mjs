#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  sourceRidCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.json',
  agent6PrereqMatrix:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json',
  directSourceCitationPrereqMatrix:
    'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const sourceRidCrossmatch = readJson(options.sourceRidCrossmatch);
const agent6PrereqMatrix = readJson(options.agent6PrereqMatrix);
const directSourceCitationPrereqMatrix = readJson(options.directSourceCitationPrereqMatrix);

assertArtifact(
  sourceRidCrossmatch,
  'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch',
  options.sourceRidCrossmatch,
);
assertArtifact(
  agent6PrereqMatrix,
  'agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix',
  options.agent6PrereqMatrix,
);
assertArtifact(
  directSourceCitationPrereqMatrix,
  'agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix',
  options.directSourceCitationPrereqMatrix,
);

const agent6ByRid = new Map((agent6PrereqMatrix.boundary_rows || []).map((row) => [row.source_rid, row]));
const directByRid = new Map((directSourceCitationPrereqMatrix.direct_rows || []).map((row) => [row.source_rid, row]));

const routeRows = (sourceRidCrossmatch.source_rid_rows || [])
  .slice()
  .sort((a, b) => a.source_rid.localeCompare(b.source_rid, 'en'))
  .map((row, index) => {
    const agent6Row = agent6ByRid.get(row.source_rid) || null;
    const directRow = directByRid.get(row.source_rid) || null;
    const prereqRoute = buildPrereqRoute(agent6Row, directRow);
    const prereqRow = agent6Row || directRow;
    return {
      route_row_id: `agent3-bridge-gap-source-rid-prereq-route-${sha256(row.source_rid).slice(0, 12)}`,
      source_rid: row.source_rid,
      source_rid_prefix: row.source_rid_prefix,
      prereq_route: prereqRoute,
      agent6_boundary_prereq_row_present: Boolean(agent6Row),
      direct_source_citation_prereq_row_present: Boolean(directRow),
      prereq_row_id: prereqRow?.row_id || null,
      gap_reference_count: Number(row.gap_reference_count || 0),
      gap_reference_occurrence_membership_total: Number(row.gap_reference_occurrence_membership_total || 0),
      gap_queue_ids: row.gap_queue_ids || [],
      gap_token_ids: row.gap_token_ids || [],
      gap_types: row.gap_types || [],
      source_rid_blocker_row_present: Boolean(row.source_rid_blocker_row_present),
      queue_source_coverage_row_present: Boolean(row.queue_source_coverage_row_present),
      blocker_current_blocker_ids: row.blocker_current_blocker_ids || [],
      blocker_current_blocker_count: Number(row.blocker_current_blocker_count || 0),
      prereq_current_blocker_ids: prereqRow?.current_blocker_ids || [],
      prereq_current_blocker_count: Number(prereqRow?.current_blocker_count || 0),
      source_families_observed: prereqRow?.source_families_observed || row.blocker_source_families || [],
      triage_groups: prereqRow?.triage_groups || row.blocker_triage_groups || [],
      partitions: prereqRow?.partitions || row.blocker_partitions || [],
      reference_count: Number(prereqRow?.reference_count || row.blocker_reference_count || 0),
      occurrence_total: Number(prereqRow?.occurrence_total || row.blocker_occurrence_total || 0),
      source_citation_required: prereqRow?.source_citation_required === true || row.blocker_source_citation_missing === true,
      source_citation_or_url_present: prereqRow?.source_citation_or_url_present === true,
      transform_rule_still_blocked: prereqRow?.transform_rule_still_blocked === true || row.blocker_transform_rule_missing === true,
      agent6_boundary_after_prereq: prereqRow?.agent6_boundary_after_prereq === true || row.blocker_agent6_boundary_required === true,
      route_write_allowed: prereqRow?.route_write_allowed === true,
      candidate_text_allowed: prereqRow?.candidate_text_allowed === true,
      public_mutation_allowed: prereqRow?.public_mutation_allowed === true,
      exact_blocker: buildExactBlocker(prereqRoute),
      coverage_gap_status: row.coverage_gap_status,
      evidence_role: 'bridge_gap_source_rid_prereq_route_crossmatch_navigation_only_no_acceptance_claim',
      next_safe_action: buildNextSafeAction(prereqRoute, row.source_rid),
      mechanical_order: index + 1,
    };
  });

const prereqRouteRows = summarizeBy(routeRows, (row) => row.prereq_route, 'prereq_route');
const prefixRows = summarizeBy(routeRows, (row) => row.source_rid_prefix, 'source_rid_prefix');
const exactBlockerRows = summarizeBy(routeRows, (row) => row.exact_blocker, 'exact_blocker');

const counts = {
  input_source_rid_crossmatch_rows: Number(sourceRidCrossmatch.counts?.crossmatch_source_rid_rows || 0),
  input_gap_source_rid_references: Number(sourceRidCrossmatch.counts?.source_rid_reference_rows || 0),
  input_agent6_boundary_prereq_rows: Number(agent6PrereqMatrix.counts?.boundary_rows || 0),
  input_direct_source_citation_prereq_rows: Number(directSourceCitationPrereqMatrix.counts?.direct_rows || 0),
  prereq_route_rows: routeRows.length,
  source_rid_reference_rows: sum(routeRows, 'gap_reference_count'),
  source_rid_reference_occurrence_membership_total: sum(routeRows, 'gap_reference_occurrence_membership_total'),
  agent6_boundary_prereq_rows: routeRows.filter((row) => row.prereq_route === 'agent6_source_family_boundary_prereq').length,
  agent6_boundary_prereq_occurrences: sum(
    routeRows.filter((row) => row.prereq_route === 'agent6_source_family_boundary_prereq'),
    'occurrence_total',
  ),
  direct_source_citation_prereq_rows: routeRows.filter((row) => row.prereq_route === 'direct_source_citation_prereq').length,
  direct_source_citation_prereq_occurrences: sum(
    routeRows.filter((row) => row.prereq_route === 'direct_source_citation_prereq'),
    'occurrence_total',
  ),
  rows_in_both_prereq_paths: routeRows.filter(
    (row) => row.agent6_boundary_prereq_row_present && row.direct_source_citation_prereq_row_present,
  ).length,
  rows_missing_prereq_path: routeRows.filter(
    (row) => !row.agent6_boundary_prereq_row_present && !row.direct_source_citation_prereq_row_present,
  ).length,
  source_rid_blocker_rows_present: routeRows.filter((row) => row.source_rid_blocker_row_present).length,
  queue_source_coverage_rows_present: routeRows.filter((row) => row.queue_source_coverage_row_present).length,
  prereq_route_summary_rows: prereqRouteRows.length,
  prefix_rows: prefixRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  unique_gap_queue_ids: new Set(routeRows.flatMap((row) => row.gap_queue_ids)).size,
  unique_gap_token_ids: new Set(routeRows.flatMap((row) => row.gap_token_ids)).size,
  reference_total: sum(routeRows, 'reference_count'),
  occurrence_total: sum(routeRows, 'occurrence_total'),
  prereq_current_blocker_total: sum(routeRows, 'prereq_current_blocker_count'),
  blocker_current_blocker_total: sum(routeRows, 'blocker_current_blocker_count'),
  rows_missing_source_citation: routeRows.filter((row) => row.source_citation_required && !row.source_citation_or_url_present).length,
  rows_missing_transform_rule: routeRows.filter((row) => row.transform_rule_still_blocked).length,
  rows_agent6_boundary_after_prereq: routeRows.filter((row) => row.agent6_boundary_after_prereq).length,
  route_write_allowed_rows: routeRows.filter((row) => row.route_write_allowed).length,
  candidate_text_allowed_rows: routeRows.filter((row) => row.candidate_text_allowed).length,
  public_mutation_allowed_rows: routeRows.filter((row) => row.public_mutation_allowed).length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Route 30 bridge-gap source RIDs to existing A06 evidence boundary or direct source-citation prereq paths without source, Definition, approval, or publication authority.',
  authority_boundary: {
    linkage_navigation_only: true,
    bridge_gap_source_rid_prereq_route_crossmatch_only: true,
    prereq_route_is_not_acceptance_or_transform_readiness: true,
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
    source_rid_crossmatch: options.sourceRidCrossmatch,
    agent6_prereq_matrix: options.agent6PrereqMatrix,
    direct_source_citation_prereq_matrix: options.directSourceCitationPrereqMatrix,
  },
  counts,
  prereq_route_rows: prereqRouteRows,
  prefix_rows: prefixRows,
  exact_blocker_rows: exactBlockerRows,
  source_rid_rows: routeRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 for release/package intake; A07 for approval/SOP/final validation/release gate; A06 evidence/validator production only.',
    next_safe_action:
      'Use this route crossmatch to keep 25 gap source RIDs on the A06 evidence source-family boundary prereq path and 5 on the direct source-citation prereq path; route any approval/SOP/final-validation/release-gate question to A07, and do not convert either path into source acceptance, transform readiness, or queue/source coverage.',
    stop_condition:
      'Stop at prereq-route crossmatch evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 bridge-gap source-RID prereq route crossmatch written: rows=${counts.prereq_route_rows} agent6=${counts.agent6_boundary_prereq_rows} direct=${counts.direct_source_citation_prereq_rows}`,
);

function buildPrereqRoute(agent6Row, directRow) {
  if (agent6Row && directRow) return 'ambiguous_multiple_prereq_paths';
  if (agent6Row) return 'agent6_source_family_boundary_prereq';
  if (directRow) return 'direct_source_citation_prereq';
  return 'missing_prereq_route';
}

function buildExactBlocker(prereqRoute) {
  if (prereqRoute === 'agent6_source_family_boundary_prereq') {
    return 'bridge_gap_source_rid_routes_to_agent6_source_family_boundary_prereq';
  }
  if (prereqRoute === 'direct_source_citation_prereq') {
    return 'bridge_gap_source_rid_routes_to_direct_source_citation_prereq';
  }
  if (prereqRoute === 'ambiguous_multiple_prereq_paths') {
    return 'bridge_gap_source_rid_has_multiple_prereq_paths_needs_manual_review';
  }
  return 'bridge_gap_source_rid_missing_prereq_route';
}

function buildNextSafeAction(prereqRoute, sourceRid) {
  if (prereqRoute === 'agent6_source_family_boundary_prereq') {
    return `Keep ${sourceRid} blocked on the A06 evidence source-family boundary prereq path; route approval/SOP/final-validation/release-gate questions to A07 and do not use it as queue/source coverage or source-family selection acceptance.`;
  }
  if (prereqRoute === 'direct_source_citation_prereq') {
    return `Keep ${sourceRid} blocked on the direct source-citation prereq path; route approval/SOP/final-validation/release-gate questions to A07 and do not use it as queue/source coverage or source citation acceptance.`;
  }
  if (prereqRoute === 'ambiguous_multiple_prereq_paths') {
    return `Keep ${sourceRid} blocked until the duplicate prereq path is resolved mechanically.`;
  }
  return `Keep ${sourceRid} blocked until a prereq route artifact is supplied.`;
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
        occurrence_total: 0,
        unique_gap_queue_ids: new Set(),
        unique_gap_token_ids: new Set(),
        source_rids_with_blocker_row: 0,
        source_rids_with_queue_source_coverage: 0,
        evidence_role: 'bridge_gap_source_rid_prereq_route_summary_navigation_only_no_acceptance_claim',
      });
    }
    const group = groups.get(key);
    group.source_rid_rows += 1;
    group.source_rid_reference_rows += Number(row.gap_reference_count || 0);
    group.occurrence_total += Number(row.occurrence_total || 0);
    for (const queueId of row.gap_queue_ids || []) group.unique_gap_queue_ids.add(queueId);
    for (const tokenId of row.gap_token_ids || []) group.unique_gap_token_ids.add(tokenId);
    if (row.source_rid_blocker_row_present) group.source_rids_with_blocker_row += 1;
    if (row.queue_source_coverage_row_present) group.source_rids_with_queue_source_coverage += 1;
  }
  return [...groups.values()]
    .map((row) => ({
      ...row,
      unique_gap_queue_ids: row.unique_gap_queue_ids.size,
      unique_gap_token_ids: row.unique_gap_token_ids.size,
    }))
    .sort((a, b) => String(a[keyName]).localeCompare(String(b[keyName]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Source-RID Prereq Route Crossmatch',
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
    `- Source-RID blocker crossmatch: ${artifact.inputs.source_rid_crossmatch}`,
    `- A06 evidence prereq matrix: ${artifact.inputs.agent6_prereq_matrix}`,
    `- Direct source-citation prereq matrix: ${artifact.inputs.direct_source_citation_prereq_matrix}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Prereq route rows | ${c.prereq_route_rows} |`,
    `| Source-RID references | ${c.source_rid_reference_rows} |`,
    `| Source-RID occurrence memberships | ${c.source_rid_reference_occurrence_membership_total} |`,
    `| A06 evidence boundary prereq rows | ${c.agent6_boundary_prereq_rows} |`,
    `| A06 evidence boundary prereq occurrences | ${c.agent6_boundary_prereq_occurrences} |`,
    `| Direct source-citation prereq rows | ${c.direct_source_citation_prereq_rows} |`,
    `| Direct source-citation prereq occurrences | ${c.direct_source_citation_prereq_occurrences} |`,
    `| Rows in both prereq paths | ${c.rows_in_both_prereq_paths} |`,
    `| Rows missing prereq path | ${c.rows_missing_prereq_path} |`,
    `| Source-RID blocker rows present | ${c.source_rid_blocker_rows_present} |`,
    `| Queue/source coverage rows present | ${c.queue_source_coverage_rows_present} |`,
    `| Rows missing source citation | ${c.rows_missing_source_citation} |`,
    `| Rows missing transform rule | ${c.rows_missing_transform_rule} |`,
    `| Rows after A06 evidence boundary prereq | ${c.rows_agent6_boundary_after_prereq} |`,
    '',
    '## Prereq Routes',
    '',
    '| Route | Source RIDs | References | Occurrences | Queues | Tokens |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.prereq_route_rows.map(
      (row) =>
        `| ${row.prereq_route} | ${row.source_rid_rows} | ${row.source_rid_reference_rows} | ${row.occurrence_total} | ${row.unique_gap_queue_ids} | ${row.unique_gap_token_ids} |`,
    ),
    '',
    '## Exact Blockers',
    '',
    '| Exact blocker | Source RIDs | References | Occurrences |',
    '| --- | ---: | ---: | ---: |',
    ...artifact.exact_blocker_rows.map(
      (row) =>
        `| ${row.exact_blocker} | ${row.source_rid_rows} | ${row.source_rid_reference_rows} | ${row.occurrence_total} |`,
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch.mjs [--source-rid-crossmatch=PATH] [--agent6-prereq-matrix=PATH] [--direct-source-citation-prereq-matrix=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--source-rid-crossmatch=')) parsed.sourceRidCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent6-prereq-matrix=')) parsed.agent6PrereqMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--direct-source-citation-prereq-matrix=')) parsed.directSourceCitationPrereqMatrix = cleanRelativePath(valueAfterEquals(arg));
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
