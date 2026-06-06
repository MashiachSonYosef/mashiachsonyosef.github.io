#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  closureMatrix:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.json',
  directPrereqMatrix:
    'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json',
  a06PrereqMatrix:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const closureMatrix = readJson(options.closureMatrix);
const directPrereqMatrix = readJson(options.directPrereqMatrix);
const a06PrereqMatrix = readJson(options.a06PrereqMatrix);

assertArtifact(
  closureMatrix,
  'agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix',
  options.closureMatrix,
);
assertArtifact(
  directPrereqMatrix,
  'agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix',
  options.directPrereqMatrix,
);
assertArtifact(
  a06PrereqMatrix,
  'agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix',
  options.a06PrereqMatrix,
);

const directByRid = new Map((directPrereqMatrix.direct_rows || []).map((row) => [row.source_rid, row]));
const a06ByRid = new Map((a06PrereqMatrix.boundary_rows || []).map((row) => [row.source_rid, row]));

const overlayRows = (closureMatrix.closure_rows || [])
  .slice()
  .sort((a, b) => a.mechanical_order - b.mechanical_order || a.queue_id.localeCompare(b.queue_id, 'en'))
  .map((row, index) => {
    const sourceRidLinks = (row.source_rid_routes || []).map((route) => {
      const directDetail = directByRid.get(route.source_rid) || null;
      const a06Detail = a06ByRid.get(route.source_rid) || null;
      const detail = directDetail || a06Detail || null;
      const overlayRoute = directDetail
        ? 'direct_source_citation_prereq'
        : a06Detail
          ? 'a06_evidence_boundary_prereq'
          : 'missing_prereq_detail';
      return {
        source_rid: route.source_rid,
        source_rid_prefix: detail?.source_rid_prefix || route.source_rid.replace(/[0-9]+$/u, ''),
        overlay_route: overlayRoute,
        prereq_route: route.prereq_route,
        prereq_route_row_id: route.route_row_id,
        prereq_detail_row_id: detail?.row_id || null,
        prereq_detail_present: detail !== null,
        source_families_observed: detail?.source_families_observed || [],
        queue_ids: detail?.queue_ids || [row.queue_id],
        token_ids: detail?.token_ids || [row.token_id],
        reference_count: Number(detail?.reference_count || 1),
        occurrence_total: Number(detail?.occurrence_total || row.occurrences || 0),
        source_citation_required: route.source_citation_required === true,
        source_citation_or_url_present: route.source_citation_or_url_present === true,
        transform_rule_still_blocked: route.transform_rule_still_blocked === true,
        source_rid_blocker_row_present: route.source_rid_blocker_row_present === true,
        queue_source_coverage_row_present: route.queue_source_coverage_row_present === true,
        a06_evidence_boundary_after_prereq: route.agent6_boundary_after_prereq === true,
        a06_approval_requested: false,
        a07_approval_route_owner: true,
        route_write_allowed: false,
        candidate_text_allowed: false,
        public_mutation_allowed: false,
        exact_blocker: route.exact_blocker,
        next_safe_action: buildSourceRidNextAction(overlayRoute, route.source_rid),
      };
    });
    const downstreamWorkset = buildDownstreamWorkset(row.closure_route_status);
    return {
      overlay_row_id: `agent3-bridge-gap-a07-a06-route-overlay-${sha256(row.queue_id).slice(0, 12)}`,
      closure_row_id: row.closure_row_id,
      candidate_row_id: row.candidate_row_id,
      queue_id: row.queue_id,
      token_id: row.token_id,
      lexicon_entry_id: row.lexicon_entry_id,
      surface: row.surface,
      normalized: row.normalized,
      occurrences: Number(row.occurrences || 0),
      closure_route_status: row.closure_route_status,
      downstream_workset: downstreamWorkset,
      approval_route_owner: 'A07',
      approval_route_scope: ['approval', 'sop', 'final_validation', 'release_gate'],
      evidence_validator_owner: 'A06',
      a06_role: 'evidence_validators_repo_cleaning_production_only_not_approval',
      a06_approval_requested: false,
      a06_outputs_are_evidence_ready_until_a07_approves: true,
      do_not_ask_a06_for_approval: true,
      handoff_owner: 'Agent 10 release/package intake',
      existing_validated_words_preserved: true,
      redo_only_changed_or_flagged_rows: true,
      source_rid_link_count: sourceRidLinks.length,
      direct_source_citation_prereq_link_count: sourceRidLinks.filter(
        (link) => link.overlay_route === 'direct_source_citation_prereq',
      ).length,
      a06_evidence_boundary_prereq_link_count: sourceRidLinks.filter(
        (link) => link.overlay_route === 'a06_evidence_boundary_prereq',
      ).length,
      missing_prereq_detail_link_count: sourceRidLinks.filter(
        (link) => link.overlay_route === 'missing_prereq_detail',
      ).length,
      current_blocker_ids: row.current_blocker_ids || [],
      current_blocker_count: Number(row.current_blocker_count || 0),
      exact_blocker: buildExactBlocker(downstreamWorkset),
      status: 'blocked_navigation_evidence_only',
      evidence_role: 'a07_a06_route_overlay_linkage_navigation_only_no_acceptance_claim',
      source_rid_links: sourceRidLinks,
      next_safe_action: buildRowNextSafeAction(downstreamWorkset, row.queue_id),
      no_acceptance_claims: true,
      no_definition_authority: true,
      no_answer_selection: true,
      no_publication_or_runtime_claim: true,
      mechanical_order: index + 1,
    };
  });

const downstreamWorksetRows = summarizeBy(overlayRows, (row) => row.downstream_workset, 'downstream_workset');
const prefixRows = summarizePrefixes(overlayRows);
const exactBlockerRows = summarizeBy(overlayRows, (row) => row.exact_blocker, 'exact_blocker');

const allLinks = overlayRows.flatMap((row) => row.source_rid_links);
const counts = {
  input_closure_rows: Number(closureMatrix.counts?.closure_rows || 0),
  input_direct_prereq_rows: Number(directPrereqMatrix.counts?.direct_rows || 0),
  input_a06_prereq_rows: Number(a06PrereqMatrix.counts?.boundary_rows || 0),
  overlay_rows: overlayRows.length,
  overlay_occurrences: sum(overlayRows, 'occurrences'),
  source_rid_route_links: allLinks.length,
  unique_source_rids: unique(allLinks.map((link) => link.source_rid)).length,
  direct_source_citation_workset_rows: overlayRows.filter(
    (row) => row.downstream_workset === 'direct_source_citation_prereq_workset',
  ).length,
  direct_source_citation_workset_occurrences: sum(
    overlayRows.filter((row) => row.downstream_workset === 'direct_source_citation_prereq_workset'),
    'occurrences',
  ),
  a06_evidence_boundary_workset_rows: overlayRows.filter(
    (row) => row.downstream_workset === 'a06_evidence_boundary_prereq_workset',
  ).length,
  a06_evidence_boundary_workset_occurrences: sum(
    overlayRows.filter((row) => row.downstream_workset === 'a06_evidence_boundary_prereq_workset'),
    'occurrences',
  ),
  mixed_or_missing_workset_rows: overlayRows.filter(
    (row) => row.downstream_workset === 'mixed_or_missing_prereq_detail_workset',
  ).length,
  direct_source_citation_prereq_links: allLinks.filter(
    (link) => link.overlay_route === 'direct_source_citation_prereq',
  ).length,
  a06_evidence_boundary_prereq_links: allLinks.filter(
    (link) => link.overlay_route === 'a06_evidence_boundary_prereq',
  ).length,
  missing_prereq_detail_links: allLinks.filter((link) => link.overlay_route === 'missing_prereq_detail').length,
  source_rid_links_with_prereq_detail: allLinks.filter((link) => link.prereq_detail_present).length,
  source_rid_links_missing_prereq_detail: allLinks.filter((link) => !link.prereq_detail_present).length,
  source_citation_required_links: allLinks.filter((link) => link.source_citation_required).length,
  source_citation_or_url_present_links: allLinks.filter((link) => link.source_citation_or_url_present).length,
  transform_rule_still_blocked_links: allLinks.filter((link) => link.transform_rule_still_blocked).length,
  source_rid_blocker_links_present: allLinks.filter((link) => link.source_rid_blocker_row_present).length,
  queue_source_coverage_links_present: allLinks.filter((link) => link.queue_source_coverage_row_present).length,
  a07_approval_route_rows: overlayRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_validator_only_rows: overlayRows.filter(
    (row) => row.a06_role === 'evidence_validators_repo_cleaning_production_only_not_approval',
  ).length,
  a06_approval_requested_rows: overlayRows.filter((row) => row.a06_approval_requested === true).length,
  a06_outputs_evidence_ready_until_a07_rows: overlayRows.filter(
    (row) => row.a06_outputs_are_evidence_ready_until_a07_approves === true,
  ).length,
  do_not_ask_a06_for_approval_rows: overlayRows.filter((row) => row.do_not_ask_a06_for_approval === true).length,
  existing_validated_words_preserved_rows: overlayRows.filter((row) => row.existing_validated_words_preserved).length,
  redo_only_changed_or_flagged_rows: overlayRows.filter((row) => row.redo_only_changed_or_flagged_rows).length,
  rows_with_current_blockers: overlayRows.filter((row) => row.current_blocker_count > 0).length,
  current_blocker_total: sum(overlayRows, 'current_blocker_count'),
  downstream_workset_summary_rows: downstreamWorksetRows.length,
  prefix_rows: prefixRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  source_family_selection_claims: 0,
  source_acceptance_claims: 0,
  source_license_acceptance_claims: 0,
  source_legal_acceptance_claims: 0,
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
  publication_or_release_claims: 0,
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Overlay A07 approval routing and A06 evidence-only routing on the 14 old-dictionary bridge-gap candidate rows without authority claims.',
  authority_boundary: {
    linkage_navigation_only: true,
    route_overlay_only: true,
    approval_sop_final_validation_release_gate_owner_a07: true,
    evidence_validators_repo_cleaning_production_owner_a06: true,
    a06_outputs_evidence_ready_until_a07_approves: true,
    do_not_ask_a06_for_approval: true,
    existing_validated_words_preserved: true,
    redo_only_changed_or_flagged_rows: true,
    a06_approval_requested: false,
    qa_acceptance: false,
    agent6_acceptance: false,
    agent7_acceptance: false,
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
    closure_matrix: options.closureMatrix,
    direct_prereq_matrix: options.directPrereqMatrix,
    a06_prereq_matrix: options.a06PrereqMatrix,
  },
  counts,
  downstream_workset_rows: downstreamWorksetRows,
  prefix_rows: prefixRows,
  exact_blocker_rows: exactBlockerRows,
  overlay_rows: overlayRows,
  downstream_handoff: {
    handoff_owner: 'Agent 10 for release/package intake; A07 for approval; A06 for evidence/validator production only.',
    next_safe_action:
      'Use overlay rows as navigation: 5 rows route to direct source-citation prereq work and 9 rows route to A06 evidence-boundary prereq work; route approval/SOP/final-validation/release-gate questions only to A07.',
    stop_condition:
      'Stop at route overlay evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 bridge-gap A07/A06 route overlay written: rows=${counts.overlay_rows} direct=${counts.direct_source_citation_workset_rows} a06=${counts.a06_evidence_boundary_workset_rows}`,
);

function buildDownstreamWorkset(closureRouteStatus) {
  if (closureRouteStatus === 'all_direct_source_citation_prereq') return 'direct_source_citation_prereq_workset';
  if (closureRouteStatus === 'all_a06_evidence_boundary_prereq') return 'a06_evidence_boundary_prereq_workset';
  return 'mixed_or_missing_prereq_detail_workset';
}

function buildExactBlocker(downstreamWorkset) {
  if (downstreamWorkset === 'direct_source_citation_prereq_workset') {
    return 'a07_route_overlay_direct_source_citation_prereq_still_blocked';
  }
  if (downstreamWorkset === 'a06_evidence_boundary_prereq_workset') {
    return 'a07_route_overlay_a06_evidence_boundary_prereq_still_blocked_no_a06_approval';
  }
  return 'a07_route_overlay_mixed_or_missing_prereq_detail_blocker';
}

function buildRowNextSafeAction(downstreamWorkset, queueId) {
  if (downstreamWorkset === 'direct_source_citation_prereq_workset') {
    return `${queueId}: keep blocked on direct source-citation prereq; Agent 10 intake can route source-citation work to the proper production owner, while approval/SOP/final-validation/release-gate questions go to A07.`;
  }
  if (downstreamWorkset === 'a06_evidence_boundary_prereq_workset') {
    return `${queueId}: keep blocked on A06 evidence-boundary prereq only; do not ask A06 for approval, and route approval/SOP/final-validation/release-gate questions to A07.`;
  }
  return `${queueId}: keep blocked until mixed or missing prereq detail is resolved; route approval/SOP/final-validation/release-gate questions to A07.`;
}

function buildSourceRidNextAction(overlayRoute, sourceRid) {
  if (overlayRoute === 'direct_source_citation_prereq') {
    return `${sourceRid}: direct source-citation prereq remains missing; no source text or transform output supplied by Agent 3.`;
  }
  if (overlayRoute === 'a06_evidence_boundary_prereq') {
    return `${sourceRid}: A06 evidence-boundary prereq remains evidence-only; A07 owns any approval/SOP/final-validation/release-gate question.`;
  }
  return `${sourceRid}: missing prereq detail; preserve blocker until an exact detail row exists.`;
}

function summarizeBy(rows, keyFn, label) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'missing';
    const existing = map.get(key) || {
      [label]: key,
      overlay_rows: 0,
      occurrences: 0,
      source_rid_links: 0,
      direct_source_citation_prereq_links: 0,
      a06_evidence_boundary_prereq_links: 0,
      missing_prereq_detail_links: 0,
      current_blocker_total: 0,
      evidence_role: 'a07_a06_route_overlay_summary_navigation_only_no_acceptance_claim',
    };
    existing.overlay_rows += 1;
    existing.occurrences += Number(row.occurrences || 0);
    existing.source_rid_links += Number(row.source_rid_link_count || 0);
    existing.direct_source_citation_prereq_links += Number(row.direct_source_citation_prereq_link_count || 0);
    existing.a06_evidence_boundary_prereq_links += Number(row.a06_evidence_boundary_prereq_link_count || 0);
    existing.missing_prereq_detail_links += Number(row.missing_prereq_detail_link_count || 0);
    existing.current_blocker_total += Number(row.current_blocker_count || 0);
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.overlay_rows - a.overlay_rows || String(a[label]).localeCompare(String(b[label]), 'en'));
}

function summarizePrefixes(rows) {
  const map = new Map();
  for (const link of rows.flatMap((row) => row.source_rid_links)) {
    const key = link.source_rid_prefix || 'missing';
    const existing = map.get(key) || {
      source_rid_prefix: key,
      source_rid_links: 0,
      source_rids: [],
      direct_source_citation_prereq_links: 0,
      a06_evidence_boundary_prereq_links: 0,
      missing_prereq_detail_links: 0,
      occurrence_total: 0,
      evidence_role: 'a07_a06_route_overlay_prefix_summary_navigation_only_no_acceptance_claim',
    };
    existing.source_rid_links += 1;
    existing.source_rids.push(link.source_rid);
    existing.direct_source_citation_prereq_links += link.overlay_route === 'direct_source_citation_prereq' ? 1 : 0;
    existing.a06_evidence_boundary_prereq_links += link.overlay_route === 'a06_evidence_boundary_prereq' ? 1 : 0;
    existing.missing_prereq_detail_links += link.overlay_route === 'missing_prereq_detail' ? 1 : 0;
    existing.occurrence_total += Number(link.occurrence_total || 0);
    map.set(key, existing);
  }
  return [...map.values()]
    .map((row) => ({ ...row, source_rids: unique(row.source_rids) }))
    .sort((a, b) => b.source_rid_links - a.source_rid_links || a.source_rid_prefix.localeCompare(b.source_rid_prefix, 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap A07/A06 Route Overlay',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Approval route: A07 owns approval, SOP, final validation, and release gate',
    '- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request',
    '- Authority: no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '',
    '## Inputs',
    '',
    `- Closure matrix: ${artifact.inputs.closure_matrix}`,
    `- Direct prereq matrix: ${artifact.inputs.direct_prereq_matrix}`,
    `- A06 prereq matrix: ${artifact.inputs.a06_prereq_matrix}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Overlay rows | ${c.overlay_rows} |`,
    `| Overlay occurrences | ${c.overlay_occurrences} |`,
    `| Source-RID route links | ${c.source_rid_route_links} |`,
    `| Unique source RIDs | ${c.unique_source_rids} |`,
    `| Direct source-citation workset rows | ${c.direct_source_citation_workset_rows} |`,
    `| Direct source-citation workset occurrences | ${c.direct_source_citation_workset_occurrences} |`,
    `| A06 evidence-boundary workset rows | ${c.a06_evidence_boundary_workset_rows} |`,
    `| A06 evidence-boundary workset occurrences | ${c.a06_evidence_boundary_workset_occurrences} |`,
    `| Missing prereq detail links | ${c.missing_prereq_detail_links} |`,
    `| A07 approval-route rows | ${c.a07_approval_route_rows} |`,
    `| A06 evidence-only rows | ${c.a06_evidence_validator_only_rows} |`,
    `| A06 approval-requested rows | ${c.a06_approval_requested_rows} |`,
    `| Source-citation required links | ${c.source_citation_required_links} |`,
    `| Source-citation present links | ${c.source_citation_or_url_present_links} |`,
    `| Transform-blocked links | ${c.transform_rule_still_blocked_links} |`,
    `| Current blocker total | ${c.current_blocker_total} |`,
    '',
    '## Downstream Worksets',
    '',
    '| Workset | Rows | Occurrences | Source-RID links | Direct links | A06 links | Missing links |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.downstream_workset_rows.map(
      (row) =>
        `| ${row.downstream_workset} | ${row.overlay_rows} | ${row.occurrences} | ${row.source_rid_links} | ${row.direct_source_citation_prereq_links} | ${row.a06_evidence_boundary_prereq_links} | ${row.missing_prereq_detail_links} |`,
    ),
    '',
    '## Sample Rows',
    '',
    '| order | queue_id | token_id | route | owner | source RIDs | occurrences |',
    '| ---: | --- | --- | --- | --- | --- | ---: |',
    ...artifact.overlay_rows
      .slice(0, 14)
      .map(
        (row) =>
          `| ${row.mechanical_order} | ${row.queue_id} | ${row.token_id} | ${row.downstream_workset} | ${row.approval_route_owner}/${row.evidence_validator_owner} | ${row.source_rid_links.map((link) => link.source_rid).join(', ')} | ${row.occurrences} |`,
      ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Next safe action: ${artifact.downstream_handoff.next_safe_action}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

function assertArtifact(artifact, type, relativePath) {
  if (artifact.artifact_type !== type) {
    throw new Error(`${relativePath} is not ${type}`);
  }
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay.mjs [--closure-matrix=PATH] [--direct-prereq-matrix=PATH] [--a06-prereq-matrix=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--closure-matrix=')) parsed.closureMatrix = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--direct-prereq-matrix=')) parsed.directPrereqMatrix = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--a06-prereq-matrix=')) parsed.a06PrereqMatrix = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.resolve(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(path.resolve(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.resolve(root, relativePath), value);
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined))].sort((a, b) =>
    String(a).localeCompare(String(b), 'en'),
  );
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
