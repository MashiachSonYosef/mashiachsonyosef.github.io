#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-owner-action-crossmatch-2026-06-06.json';
const outputMd =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-owner-action-crossmatch-2026-06-06.md';

const inputs = {
  direct_source_rid_anomaly_workset:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-anomaly-workset-2026-06-06.json',
};

const anomaly = readJson(inputs.direct_source_rid_anomaly_workset);
const requiredDownstreamFields = [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'source_rid',
  'source_rid_prefix',
  'anomaly_flags',
  'exact_blockers',
  'agent1_locator_path',
  'agent2_locator_path',
  'source_citation_or_url_or_exact_missing_citation_blocker',
  'transform_blocked_until_prereqs_clear',
  'approval_route_owner',
];

const actionRows = (anomaly.selected_anomaly_rows || []).map((row, index) => {
  const action = classifyAction(row);
  return {
    action_row_id: `agent3-direct-source-rid-owner-action-${digest(`${row.queue_id}|${row.source_rid}`)}`,
    order: index + 1,
    anomaly_review_row_id: row.review_row_id,
    locator_row_id: row.locator_row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    source_rid: row.source_rid,
    source_rid_prefix: row.source_rid_prefix,
    occurrences: Number(row.occurrences || 0),
    anomaly_flags: row.anomaly_flags || [],
    exact_blockers: row.exact_blockers || [],
    owner_action_kind: action.kind,
    package_intake_owner: 'Agent 10',
    row_resolution_owner: action.rowOwner,
    approval_route_owner: 'A07',
    evidence_validator_owner: 'A06',
    a06_approval_requested: false,
    agent1_required: true,
    agent2_required: true,
    agent10_required: true,
    a07_required: true,
    a06_evidence_only: true,
    agent2_contract_locator_paths: row.agent2_contract_locator_paths || [],
    agent1_public_domain_locator_paths: row.agent1_public_domain_exact_locator_paths || [],
    agent1_commercial_locator_paths: row.agent1_commercial_exact_locator_paths || [],
    required_downstream_fields: requiredDownstreamFields,
    required_downstream_field_count: requiredDownstreamFields.length,
    required_owner_return_shape: action.returnShape,
    exact_missing_field_blocker: action.exactMissingFieldBlocker,
    source_citation_or_url_present: row.agent2_source_citation_or_url_present === true,
    transform_rule_still_blocked: row.agent2_transform_rule_still_blocked === true,
    source_license_acceptance: false,
    source_provenance_acceptance: false,
    source_citation_supplied_by_agent3: false,
    source_text_read: false,
    definition_authority: false,
    answer_selection: false,
    route_publication_support: false,
    accepted_text: false,
    release_action: false,
    owner_action_status: 'exact_owner_action_blocker_navigation_only_no_acceptance_claim',
    next_safe_action: action.nextSafeAction,
  };
});

const counts = {
  input_reviewed_locator_rows: Number(anomaly.counts?.input_locator_rows || 0),
  input_selected_anomaly_rows: Number(anomaly.counts?.selected_anomaly_rows || 0),
  owner_action_rows: actionRows.length,
  owner_action_occurrences: sum(actionRows, 'occurrences'),
  unique_source_rids: new Set(actionRows.map((row) => row.source_rid)).size,
  duplicate_locator_action_rows: actionRows.filter((row) => row.owner_action_kind === 'queue_scope_dedupe_required')
    .length,
  zero_ref_ref_gap_action_rows: actionRows.filter(
    (row) => row.owner_action_kind === 'source_citation_ref_gap_resolution_required',
  ).length,
  multi_rid_scope_action_rows: actionRows.filter((row) => row.owner_action_kind === 'exact_rid_scope_required')
    .length,
  agent10_package_intake_rows: actionRows.filter((row) => row.package_intake_owner === 'Agent 10').length,
  agent1_required_rows: actionRows.filter((row) => row.agent1_required).length,
  agent2_required_rows: actionRows.filter((row) => row.agent2_required).length,
  a07_required_rows: actionRows.filter((row) => row.a07_required).length,
  a06_evidence_only_rows: actionRows.filter((row) => row.a06_evidence_only).length,
  required_downstream_field_cells: actionRows.reduce(
    (total, row) => total + Number(row.required_downstream_field_count || 0),
    0,
  ),
  source_citation_or_url_present_rows: actionRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: actionRows.filter((row) => row.transform_rule_still_blocked).length,
  inherited_process_timeout_records: Number(anomaly.inherited_process_timeout_records?.length || 0),
  new_broad_search_commands_run: 0,
  a07_approval_route_rows: actionRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: actionRows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: actionRows.filter((row) => row.a06_approval_requested).length,
  source_license_acceptance_claims: actionRows.filter((row) => row.source_license_acceptance).length,
  source_provenance_acceptance_claims: actionRows.filter((row) => row.source_provenance_acceptance).length,
  source_citation_supplied_by_agent3_rows: actionRows.filter((row) => row.source_citation_supplied_by_agent3)
    .length,
  source_text_rows: actionRows.filter((row) => row.source_text_read).length,
  definition_authority_rows: actionRows.filter((row) => row.definition_authority).length,
  answer_selection_rows: actionRows.filter((row) => row.answer_selection).length,
  route_publication_support_rows: actionRows.filter((row) => row.route_publication_support).length,
  accepted_text_rows: actionRows.filter((row) => row.accepted_text).length,
  release_actions: actionRows.filter((row) => row.release_action).length,
  publication_or_release_claims: 0,
  acceptance_claims: 0,
  forbidden_payload_field_hits: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_owner_action_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_owner_action_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Convert selected direct source-RID anomaly rows into exact owner/action blockers for downstream package intake and source-citation enrichment.',
  authority_boundary: {
    linkage_navigation_only: true,
    owner_action_crossmatch_only: true,
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
  inherited_process_timeout_records: anomaly.inherited_process_timeout_records || [],
  counts,
  owner_action_rows: actionRows,
  handoff: {
    owner:
      'Agent 10 for package intake; Agent 1/Agent 2 for exact row resolution and source-citation enrichment; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use these owner/action rows as exact blockers for downstream work; do not transform, publish, or treat any row as source/license/Definition accepted.',
    stop_condition:
      'Stop at owner/action crossmatch evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

assertNoForbiddenPayload(artifact);
writeJson(outputJson, artifact);
writeMarkdown(outputMd, artifact);
console.log(
  `Agent 3 direct source-RID owner/action crossmatch written: rows=${counts.owner_action_rows} occurrences=${counts.owner_action_occurrences}`,
);

function classifyAction(row) {
  const flags = new Set(row.anomaly_flags || []);
  if (flags.has('duplicate_agent1_public_domain_source_rid_locator') || flags.has('duplicate_agent1_commercial_source_rid_locator')) {
    return {
      kind: 'queue_scope_dedupe_required',
      rowOwner: 'Agent 1 / Agent 2',
      returnShape:
        'queue_id + source_rid + duplicate_locator_paths + selected_queue_scope_or_exact_duplicate_blocker',
      exactMissingFieldBlocker: 'missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator',
      nextSafeAction:
        'Resolve duplicate source-RID locator scope for this queue/source pair before source-citation enrichment or transform consideration.',
    };
  }
  if (
    flags.has('zero_public_domain_refs_count') ||
    flags.has('zero_commercial_refs_count') ||
    flags.has('commercial_ref_gap_row_present')
  ) {
    return {
      kind: 'source_citation_ref_gap_resolution_required',
      rowOwner: 'Agent 1 / Agent 2',
      returnShape: 'queue_id + source_rid + ref_gap_locator_path + source_citation_or_exact_missing_citation_blocker',
      exactMissingFieldBlocker: 'missing_source_citation_resolution_for_zero_ref_gap_source_rid',
      nextSafeAction:
        'Resolve zero-ref/ref-gap source-citation status for this queue/source pair before transform consideration.',
    };
  }
  if (flags.has('multi_public_domain_rid_custody_row') || flags.has('multi_commercial_rid_custody_row')) {
    return {
      kind: 'exact_rid_scope_required',
      rowOwner: 'Agent 1 / Agent 2',
      returnShape: 'queue_id + source_rid + multi_rid_locator_path + exact_rid_scope_or_exact_blocker',
      exactMissingFieldBlocker: 'missing_exact_rid_scope_for_multi_rid_custody_row',
      nextSafeAction:
        'Resolve exact source-RID scope within the multi-RID custody row before source-citation enrichment or transform consideration.',
    };
  }
  throw new Error(`No owner/action classification for ${row.source_rid}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Direct Source-RID Owner/Action Crossmatch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Approval route: A07 owns approval, SOP, final validation, and release gate',
    '- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request',
    '- Authority: owner/action blocker evidence only; no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim',
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
    `| Queue-scope dedupe rows | ${data.counts.duplicate_locator_action_rows} |`,
    `| Zero-ref/ref-gap rows | ${data.counts.zero_ref_ref_gap_action_rows} |`,
    `| Exact RID-scope rows | ${data.counts.multi_rid_scope_action_rows} |`,
    `| Agent 10 package-intake rows | ${data.counts.agent10_package_intake_rows} |`,
    `| Agent 1 required rows | ${data.counts.agent1_required_rows} |`,
    `| Agent 2 required rows | ${data.counts.agent2_required_rows} |`,
    `| Required downstream field cells | ${data.counts.required_downstream_field_cells} |`,
    `| Source-citation present rows | ${data.counts.source_citation_or_url_present_rows} |`,
    `| Transform-blocked rows | ${data.counts.transform_rule_still_blocked_rows} |`,
    `| Inherited process-timeout records | ${data.counts.inherited_process_timeout_records} |`,
    `| New broad search commands run | ${data.counts.new_broad_search_commands_run} |`,
    `| A07 approval-route rows | ${data.counts.a07_approval_route_rows} |`,
    `| A06 evidence-owner rows | ${data.counts.a06_evidence_owner_rows} |`,
    `| Acceptance claims | ${data.counts.acceptance_claims} |`,
    '',
    '## Owner/Action Rows',
    '',
    '| source RID | queue_id | occurrences | action kind | row owner | exact missing-field blocker | next safe action |',
    '| --- | --- | ---: | --- | --- | --- | --- |',
    ...data.owner_action_rows.map((row) =>
      [
        row.source_rid,
        row.queue_id,
        row.occurrences,
        row.owner_action_kind,
        row.row_resolution_owner,
        row.exact_missing_field_blocker,
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
  if (hits.length) throw new Error(`Forbidden payload keys found in owner/action artifact: ${hits.join(', ')}`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}
