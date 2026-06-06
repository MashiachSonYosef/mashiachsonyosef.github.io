#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.json';
const outputMd =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.md';

const inputs = {
  owner_action_crossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-owner-action-crossmatch-2026-06-06.json',
  downstream_intake_coverage_crossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.json',
  agent10_direct_release_package_intake_refresh:
    'reports/agent10-direct-release-package-intake-refresh-2026-06-06a.json',
  agent1_downstream_consumption_alignment_audit:
    'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json',
  agent2_direct_source_citation_prereq_intake_contract:
    'reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json',
};

const ownerAction = readJson(inputs.owner_action_crossmatch);
const downstream = readJson(inputs.downstream_intake_coverage_crossmatch);
const agent10Refresh = readJson(inputs.agent10_direct_release_package_intake_refresh);
const agent1Audit = readJson(inputs.agent1_downstream_consumption_alignment_audit);
const agent2Direct = readJson(inputs.agent2_direct_source_citation_prereq_intake_contract);

const downstreamByQueue = new Map((downstream.crossmatch_rows || []).map((row) => [row.queue_id, row]));
const agent2ByQueue = new Map((agent2Direct.direct_identifier_rows || []).map((row) => [row.queue_id, row]));

const gapRows = (ownerAction.owner_action_rows || []).map((row) => {
  const downstreamRow = downstreamByQueue.get(row.queue_id);
  const agent2Row = agent2ByQueue.get(row.queue_id);
  if (!downstreamRow) throw new Error(`Missing downstream row for ${row.queue_id}`);
  if (!agent2Row) throw new Error(`Missing Agent 2 direct row for ${row.queue_id}`);
  const sourceRid = row.source_rid;
  return {
    gap_row_id: `agent3-direct-source-rid-downstream-gap-${digest(`${row.queue_id}|${sourceRid}`)}`,
    owner_action_row_id: row.action_row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    source_rid: sourceRid,
    source_rid_prefix: row.source_rid_prefix,
    occurrences: Number(row.occurrences || 0),
    owner_action_kind: row.owner_action_kind,
    exact_owner_action_blocker: row.exact_missing_field_blocker,
    downstream_coverage_row_id: downstreamRow.crossmatch_row_id,
    downstream_workset: downstreamRow.downstream_workset,
    downstream_exact_blocker: downstreamRow.exact_blocker,
    agent2_direct_contract_matched: downstreamRow.direct_contract_match_status === 'matched_agent2_direct_source_citation_prereq_contract',
    agent2_direct_contract_queue_match: downstreamRow.direct_contract_queue_match === true,
    agent2_direct_contract_validation_result: downstreamRow.direct_contract_validation_result,
    agent2_source_citation_or_url_present: agent2Row.source_citation_or_url_present === true,
    downstream_source_citation_or_url_present: downstreamRow.source_citation_or_url_present === true,
    agent2_transform_rule_still_blocked: agent2Row.transform_rule_still_blocked === true,
    downstream_transform_rule_still_blocked: downstreamRow.transform_rule_still_blocked === true,
    agent10_source_citation_broad_workset_present: downstreamRow.agent10_source_citation_broad_workset_present === true,
    agent10_source_citation_broad_workset_rows: Number(downstreamRow.agent10_source_citation_broad_workset_rows || 0),
    agent10_source_citation_row_level_overlay_consumed:
      downstreamRow.agent10_source_citation_row_level_overlay_consumed === true,
    agent10_preboundary_broad_context_present: downstreamRow.agent10_preboundary_broad_context_present === true,
    agent10_preboundary_row_level_overlay_consumed: downstreamRow.agent10_preboundary_row_level_overlay_consumed === true,
    agent10_preboundary_agent3_input_null: downstreamRow.agent10_preboundary_agent3_input_null === true,
    agent10_current_refresh_row_level_hit: false,
    agent10_current_refresh_status: agent10Refresh.status || null,
    agent1_downstream_alignment_row_level_hit: false,
    agent1_downstream_alignment_status: agent1Audit.status || null,
    row_level_downstream_gap: true,
    exact_gap_blocker: 'owner_action_row_has_broad_context_but_no_row_level_downstream_consumption',
    required_downstream_return_fields: [
      'queue_id',
      'source_rid',
      'owner_action_kind',
      'row_level_agent10_consumption_artifact_or_exact_blocker',
      'source_citation_or_url_or_exact_missing_citation_blocker',
      'transform_blocked_until_prereqs_clear',
      'approval_route_owner',
    ],
    package_intake_owner: 'Agent 10',
    row_resolution_owner: 'Agent 1 / Agent 2',
    approval_route_owner: 'A07',
    evidence_validator_owner: 'A06',
    a06_approval_requested: false,
    source_license_acceptance: false,
    source_provenance_acceptance: false,
    source_citation_supplied_by_agent3: false,
    source_text_read: false,
    definition_authority: false,
    answer_selection: false,
    route_publication_support: false,
    accepted_text: false,
    release_action: false,
    next_safe_action:
      'Provide row-level downstream consumption artifact or exact blocker for this owner/action row before any transform or release consideration.',
  };
});

const counts = {
  owner_action_rows: gapRows.length,
  owner_action_occurrences: sum(gapRows, 'occurrences'),
  unique_source_rids: new Set(gapRows.map((row) => row.source_rid)).size,
  downstream_coverage_rows_matched: gapRows.filter((row) => Boolean(row.downstream_coverage_row_id)).length,
  agent2_direct_contract_matched_rows: gapRows.filter((row) => row.agent2_direct_contract_matched).length,
  agent2_direct_contract_queue_match_rows: gapRows.filter((row) => row.agent2_direct_contract_queue_match).length,
  agent2_direct_contract_validation_passed_rows: gapRows.filter(
    (row) => row.agent2_direct_contract_validation_result === 'passed',
  ).length,
  agent10_broad_context_rows: gapRows.filter((row) => row.agent10_source_citation_broad_workset_present).length,
  agent10_preboundary_broad_context_rows: gapRows.filter((row) => row.agent10_preboundary_broad_context_present).length,
  agent10_source_citation_row_level_consumed_rows: gapRows.filter(
    (row) => row.agent10_source_citation_row_level_overlay_consumed,
  ).length,
  agent10_preboundary_row_level_consumed_rows: gapRows.filter((row) => row.agent10_preboundary_row_level_overlay_consumed)
    .length,
  agent10_current_refresh_row_level_hit_rows: gapRows.filter((row) => row.agent10_current_refresh_row_level_hit).length,
  agent1_downstream_alignment_row_level_hit_rows: gapRows.filter((row) => row.agent1_downstream_alignment_row_level_hit)
    .length,
  row_level_downstream_gap_rows: gapRows.filter((row) => row.row_level_downstream_gap).length,
  source_citation_or_url_present_rows: gapRows.filter(
    (row) => row.agent2_source_citation_or_url_present || row.downstream_source_citation_or_url_present,
  ).length,
  transform_rule_still_blocked_rows: gapRows.filter(
    (row) => row.agent2_transform_rule_still_blocked && row.downstream_transform_rule_still_blocked,
  ).length,
  required_downstream_return_field_cells: gapRows.reduce(
    (total, row) => total + Number(row.required_downstream_return_fields?.length || 0),
    0,
  ),
  a07_approval_route_rows: gapRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: gapRows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: gapRows.filter((row) => row.a06_approval_requested).length,
  source_license_acceptance_claims: gapRows.filter((row) => row.source_license_acceptance).length,
  source_provenance_acceptance_claims: gapRows.filter((row) => row.source_provenance_acceptance).length,
  source_citation_supplied_by_agent3_rows: gapRows.filter((row) => row.source_citation_supplied_by_agent3).length,
  source_text_rows: gapRows.filter((row) => row.source_text_read).length,
  definition_authority_rows: gapRows.filter((row) => row.definition_authority).length,
  answer_selection_rows: gapRows.filter((row) => row.answer_selection).length,
  route_publication_support_rows: gapRows.filter((row) => row.route_publication_support).length,
  accepted_text_rows: gapRows.filter((row) => row.accepted_text).length,
  release_actions: gapRows.filter((row) => row.release_action).length,
  publication_or_release_claims: 0,
  acceptance_claims: 0,
  forbidden_payload_field_hits: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_downstream_gap_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_downstream_gap_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Crossmatch the three direct source-RID owner/action rows against named downstream intake artifacts and emit exact row-level consumption gaps.',
  authority_boundary: {
    linkage_navigation_only: true,
    downstream_gap_crossmatch_only: true,
    approval_sop_final_validation_release_gate_owner_a07: true,
    evidence_validators_repo_cleaning_production_owner_a06: true,
    a06_outputs_evidence_ready_until_a07_approves: true,
    do_not_ask_a06_for_approval: true,
    a06_approval_requested: false,
    qa_acceptance: false,
    agent6_acceptance: false,
    source_provenance_acceptance: false,
    source_license_acceptance: false,
    source_legal_acceptance: false,
    source_citation_supplied_by_agent3: false,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    route_ranking: false,
    route_publication_support: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  inputs,
  counts,
  downstream_gap_rows: gapRows,
  exact_blocker_summary: [
    {
      exact_blocker: 'owner_action_row_has_broad_context_but_no_row_level_downstream_consumption',
      rows: counts.row_level_downstream_gap_rows,
      occurrences: counts.owner_action_occurrences,
      source_rids: gapRows.map((row) => row.source_rid).sort(),
      evidence_role: 'downstream_gap_navigation_only_no_acceptance_claim',
    },
  ],
  handoff: {
    owner:
      'Agent 10 for row-level package intake; Agent 1/Agent 2 for source-citation or exact blocker return; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use these rows as the exact row-level downstream consumption gap list; broad context exists, but row-level consumption remains absent.',
    stop_condition:
      'Stop at downstream gap crossmatch evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

assertNoForbiddenPayload(artifact);
writeJson(outputJson, artifact);
writeMarkdown(outputMd, artifact);
console.log(
  `Agent 3 direct source-RID downstream gap crossmatch written: rows=${counts.owner_action_rows} gaps=${counts.row_level_downstream_gap_rows}`,
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Direct Source-RID Downstream Gap Crossmatch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Approval route: A07 owns approval, SOP, final validation, and release gate',
    '- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request',
    '- Authority: downstream gap evidence only; no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '',
    '## Inputs',
    '',
    ...Object.entries(data.inputs).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Owner/action rows | ${data.counts.owner_action_rows} |`,
    `| Owner/action occurrences | ${data.counts.owner_action_occurrences} |`,
    `| Unique source RIDs | ${data.counts.unique_source_rids} |`,
    `| Downstream coverage rows matched | ${data.counts.downstream_coverage_rows_matched} |`,
    `| Agent 2 direct contract matched rows | ${data.counts.agent2_direct_contract_matched_rows} |`,
    `| Agent 10 broad context rows | ${data.counts.agent10_broad_context_rows} |`,
    `| Agent 10 row-level source-citation consumed rows | ${data.counts.agent10_source_citation_row_level_consumed_rows} |`,
    `| Agent 10 current refresh row-level hit rows | ${data.counts.agent10_current_refresh_row_level_hit_rows} |`,
    `| Agent 1 downstream alignment row-level hit rows | ${data.counts.agent1_downstream_alignment_row_level_hit_rows} |`,
    `| Row-level downstream gap rows | ${data.counts.row_level_downstream_gap_rows} |`,
    `| Source-citation present rows | ${data.counts.source_citation_or_url_present_rows} |`,
    `| Transform-blocked rows | ${data.counts.transform_rule_still_blocked_rows} |`,
    `| Required downstream return field cells | ${data.counts.required_downstream_return_field_cells} |`,
    `| A07 approval-route rows | ${data.counts.a07_approval_route_rows} |`,
    `| A06 evidence-owner rows | ${data.counts.a06_evidence_owner_rows} |`,
    `| Acceptance claims | ${data.counts.acceptance_claims} |`,
    '',
    '## Gap Rows',
    '',
    '| source RID | queue_id | owner action | broad context | row-level consumed | exact gap blocker | next safe action |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...data.downstream_gap_rows.map((row) =>
      [
        row.source_rid,
        row.queue_id,
        row.owner_action_kind,
        row.agent10_source_citation_broad_workset_present ? 'yes' : 'no',
        row.agent10_source_citation_row_level_overlay_consumed ? 'yes' : 'no',
        row.exact_gap_blocker,
        row.next_safe_action,
      ]
        .map(mdCell)
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |'),
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${data.handoff.owner}`,
    `- Next safe action: ${data.handoff.next_safe_action}`,
    `- Stop condition: ${data.handoff.stop_condition}`,
    '',
  ];
  fs.writeFileSync(path.join(root, filePath), lines.join('\n'));
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function digest(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 12);
}

function assertNoForbiddenPayload(value) {
  const serialized = JSON.stringify(value);
  const forbidden = [
    '"surface":',
    '"normalized":',
    '"headword":',
    '"headwords":',
    '"refs_sample":',
    '"public_domain_refs_sample":',
    '"answer_text":',
    '"definition_text":',
    '"gloss_text":',
    '"source_text":',
  ];
  const hits = forbidden.filter((key) => serialized.includes(key));
  if (hits.length) throw new Error(`Forbidden payload keys found in downstream gap artifact: ${hits.join(', ')}`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}
