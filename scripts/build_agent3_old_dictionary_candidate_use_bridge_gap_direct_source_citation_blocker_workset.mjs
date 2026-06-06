#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  downstreamCoverageCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-citation-blocker-workset-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-citation-blocker-workset-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const downstreamCoverageCrossmatch = readJson(options.downstreamCoverageCrossmatch);
assertArtifact(
  downstreamCoverageCrossmatch,
  'agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch',
  options.downstreamCoverageCrossmatch,
);

const worksetRows = (downstreamCoverageCrossmatch.crossmatch_rows || [])
  .filter((row) => row.downstream_workset === 'direct_source_citation_prereq_workset')
  .sort((a, b) => a.mechanical_order - b.mechanical_order || a.queue_id.localeCompare(b.queue_id, 'en'))
  .map((row, index) => ({
    workset_row_id: `agent3-direct-source-citation-blocker-${sha256(row.queue_id).slice(0, 12)}`,
    coverage_crossmatch_row_id: row.crossmatch_row_id,
    overlay_row_id: row.overlay_row_id,
    candidate_row_id: row.candidate_row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: Number(row.occurrences || 0),
    source_rids: row.source_rids || [],
    source_rid_count: Number(row.source_rid_link_count || 0),
    agent2_direct_contract_match_status: row.direct_contract_match_status,
    agent2_direct_contract_queue_match: row.direct_contract_queue_match === true,
    agent2_direct_contract_validation_result: row.direct_contract_validation_result,
    source_citation_required: row.source_citation_required === true,
    source_citation_or_url_present: row.source_citation_or_url_present === true,
    direct_contract_source_citation_or_url_present: row.direct_contract_source_citation_or_url_present === true,
    transform_rule_still_blocked: row.transform_rule_still_blocked === true,
    direct_contract_transform_rule_still_blocked: row.direct_contract_transform_rule_still_blocked === true,
    broad_agent10_source_citation_context_present: row.agent10_source_citation_broad_workset_present === true,
    broad_agent10_source_citation_workset_rows: Number(row.agent10_source_citation_broad_workset_rows || 0),
    broad_agent10_preboundary_context_present: row.agent10_preboundary_broad_context_present === true,
    row_level_agent10_source_citation_overlay_consumed: row.agent10_source_citation_row_level_overlay_consumed === true,
    row_level_agent10_preboundary_overlay_consumed: row.agent10_preboundary_row_level_overlay_consumed === true,
    required_agent1_source_citation_return:
      'source_citation_or_url_or_exact_missing_source_citation_blocker_for_this_queue_id_source_rid_pair',
    required_downstream_fields: [
      'queue_id',
      'token_id',
      'lexicon_entry_id',
      'source_rid',
      'source_rid_prefix',
      'source_family',
      'source_license_lane',
      'source_citation_or_url',
      'citation_basis',
      'source_acceptance_claimed',
      'agent6_boundary_required',
    ],
    approval_route_owner: 'A07',
    evidence_validator_owner: 'A06',
    a06_approval_requested: false,
    a06_evidence_ready_until_a07_approves: row.a06_evidence_ready_until_a07_approves === true,
    do_not_ask_a06_for_approval: row.do_not_ask_a06_for_approval === true,
    exact_blocker: 'direct_source_citation_or_url_missing_after_agent2_intake_match',
    carried_forward_blocker: row.exact_blocker,
    status: 'blocked_navigation_evidence_only',
    evidence_role: 'direct_source_citation_blocker_workset_navigation_only_no_acceptance_claim',
    next_safe_action: `${row.queue_id}: Agent 2 direct intake row is matched, but source_citation_or_url is still missing; Agent 1/Agent 2 can supply exact source-citation evidence or preserve this blocker. A07 owns approval/SOP/final-validation/release gate.`,
    route_write_allowed: false,
    candidate_text_allowed: false,
    answer_selection_allowed: false,
    public_mutation_allowed: false,
    acceptance_claimed: false,
    mechanical_order: index + 1,
  }));

const prefixRows = summarizePrefixes(worksetRows);
const exactBlockerRows = summarizeBy(worksetRows, (row) => row.exact_blocker, 'exact_blocker');
const sourceRidLinks = worksetRows.flatMap((row) => row.source_rids);
const counts = {
  input_crossmatch_rows: Number(downstreamCoverageCrossmatch.counts?.crossmatch_rows || 0),
  input_direct_overlay_rows: Number(downstreamCoverageCrossmatch.counts?.direct_overlay_rows || 0),
  input_direct_overlay_source_rid_links: Number(downstreamCoverageCrossmatch.counts?.direct_overlay_source_rid_links || 0),
  workset_rows: worksetRows.length,
  workset_occurrences: sum(worksetRows, 'occurrences'),
  source_rid_links: sourceRidLinks.length,
  unique_source_rids: unique(sourceRidLinks).length,
  unique_queue_ids: unique(worksetRows.map((row) => row.queue_id)).length,
  unique_token_ids: unique(worksetRows.map((row) => row.token_id)).length,
  unique_lexicon_entry_ids: unique(worksetRows.map((row) => row.lexicon_entry_id)).length,
  agent2_direct_contract_matched_rows: worksetRows.filter(
    (row) => row.agent2_direct_contract_match_status === 'matched_agent2_direct_source_citation_prereq_contract',
  ).length,
  agent2_direct_contract_queue_matched_rows: worksetRows.filter((row) => row.agent2_direct_contract_queue_match).length,
  agent2_direct_contract_validation_passed_rows: worksetRows.filter(
    (row) => row.agent2_direct_contract_validation_result === 'passed',
  ).length,
  source_citation_required_rows: worksetRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: worksetRows.filter((row) => row.source_citation_or_url_present).length,
  direct_contract_source_citation_or_url_present_rows: worksetRows.filter(
    (row) => row.direct_contract_source_citation_or_url_present,
  ).length,
  transform_rule_still_blocked_rows: worksetRows.filter((row) => row.transform_rule_still_blocked).length,
  direct_contract_transform_rule_still_blocked_rows: worksetRows.filter(
    (row) => row.direct_contract_transform_rule_still_blocked,
  ).length,
  broad_agent10_source_citation_context_rows: worksetRows.filter(
    (row) => row.broad_agent10_source_citation_context_present,
  ).length,
  broad_agent10_preboundary_context_rows: worksetRows.filter((row) => row.broad_agent10_preboundary_context_present)
    .length,
  row_level_agent10_source_citation_overlay_consumed_rows: worksetRows.filter(
    (row) => row.row_level_agent10_source_citation_overlay_consumed,
  ).length,
  row_level_agent10_preboundary_overlay_consumed_rows: worksetRows.filter(
    (row) => row.row_level_agent10_preboundary_overlay_consumed,
  ).length,
  a07_approval_route_rows: worksetRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: worksetRows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: worksetRows.filter((row) => row.a06_approval_requested === true).length,
  a06_evidence_ready_until_a07_rows: worksetRows.filter((row) => row.a06_evidence_ready_until_a07_approves).length,
  do_not_ask_a06_for_approval_rows: worksetRows.filter((row) => row.do_not_ask_a06_for_approval).length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Extract the 5 bridge-gap direct-source-citation rows matched to Agent 2 intake but still missing source_citation_or_url.',
  authority_boundary: {
    linkage_navigation_only: true,
    direct_source_citation_blocker_workset_only: true,
    approval_sop_final_validation_release_gate_owner_a07: true,
    evidence_validators_repo_cleaning_production_owner_a06: true,
    a06_outputs_evidence_ready_until_a07_approves: true,
    do_not_ask_a06_for_approval: true,
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
    downstream_coverage_crossmatch: options.downstreamCoverageCrossmatch,
  },
  counts,
  prefix_rows: prefixRows,
  exact_blocker_rows: exactBlockerRows,
  workset_rows: worksetRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 for package intake; Agent 1/Agent 2 for row-level source-citation enrichment; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use this workset as the exact 5-row / 5-source-RID direct source-citation blocker list; each row is matched to Agent 2 intake but still lacks source_citation_or_url and transform prerequisites.',
    stop_condition:
      'Stop at direct source-citation blocker workset evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 direct source-citation blocker workset written: rows=${counts.workset_rows} sourceRids=${counts.source_rid_links}`,
);

function summarizePrefixes(rows) {
  const map = new Map();
  for (const row of rows) {
    for (const sourceRid of row.source_rids) {
      const prefix = sourceRid.replace(/[0-9]+$/u, '') || 'missing';
      const existing = map.get(prefix) || {
        source_rid_prefix: prefix,
        source_rid_links: 0,
        source_rids: [],
        queue_ids: [],
        occurrences: 0,
        evidence_role: 'direct_source_citation_blocker_prefix_summary_navigation_only_no_acceptance_claim',
      };
      existing.source_rid_links += 1;
      existing.source_rids.push(sourceRid);
      existing.queue_ids.push(row.queue_id);
      existing.occurrences += Number(row.occurrences || 0);
      map.set(prefix, existing);
    }
  }
  return [...map.values()]
    .map((row) => ({
      ...row,
      source_rids: unique(row.source_rids),
      queue_ids: unique(row.queue_ids),
      queue_count: unique(row.queue_ids).length,
    }))
    .sort((a, b) => b.source_rid_links - a.source_rid_links || a.source_rid_prefix.localeCompare(b.source_rid_prefix, 'en'));
}

function summarizeBy(rows, keyFn, label) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'missing';
    const existing = map.get(key) || {
      [label]: key,
      rows: 0,
      occurrences: 0,
      source_rid_links: 0,
      evidence_role: 'direct_source_citation_blocker_summary_navigation_only_no_acceptance_claim',
    };
    existing.rows += 1;
    existing.occurrences += Number(row.occurrences || 0);
    existing.source_rid_links += Number(row.source_rid_count || 0);
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.rows - a.rows || String(a[label]).localeCompare(String(b[label]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Direct Source-Citation Blocker Workset',
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
    `- Downstream coverage crossmatch: ${artifact.inputs.downstream_coverage_crossmatch}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Workset rows | ${c.workset_rows} |`,
    `| Workset occurrences | ${c.workset_occurrences} |`,
    `| Source-RID links | ${c.source_rid_links} |`,
    `| Unique source RIDs | ${c.unique_source_rids} |`,
    `| Agent 2 direct contract matched rows | ${c.agent2_direct_contract_matched_rows} |`,
    `| Agent 2 direct contract validation-passed rows | ${c.agent2_direct_contract_validation_passed_rows} |`,
    `| Source-citation required rows | ${c.source_citation_required_rows} |`,
    `| Source-citation present rows | ${c.source_citation_or_url_present_rows} |`,
    `| Transform-blocked rows | ${c.transform_rule_still_blocked_rows} |`,
    `| Broad Agent 10 source-citation context rows | ${c.broad_agent10_source_citation_context_rows} |`,
    `| Row-level Agent 10 source-citation consumed rows | ${c.row_level_agent10_source_citation_overlay_consumed_rows} |`,
    `| A07 approval-route rows | ${c.a07_approval_route_rows} |`,
    `| A06 evidence-owner rows | ${c.a06_evidence_owner_rows} |`,
    `| A06 approval-requested rows | ${c.a06_approval_requested_rows} |`,
    `| Acceptance claims | ${c.acceptance_claims} |`,
    '',
    '## Workset Rows',
    '',
    '| order | queue_id | token_id | source RIDs | occurrences | exact blocker |',
    '| ---: | --- | --- | --- | ---: | --- |',
    ...artifact.workset_rows.map(
      (row) =>
        `| ${row.mechanical_order} | ${row.queue_id} | ${row.token_id} | ${row.source_rids.join(', ')} | ${row.occurrences} | ${row.exact_blocker} |`,
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
  if (artifact.artifact_type !== type) throw new Error(`${relativePath} is not ${type}`);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset.mjs [--downstream-coverage-crossmatch=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--downstream-coverage-crossmatch=')) {
      parsed.downstreamCoverageCrossmatch = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    } else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
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
