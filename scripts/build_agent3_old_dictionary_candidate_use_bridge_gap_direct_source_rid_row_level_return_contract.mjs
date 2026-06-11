#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.json';
const outputMd =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.md';

const inputs = {
  downstream_gap_crossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.json',
};

const agent10ReturnFields = [
  'queue_id',
  'source_rid',
  'owner_action_kind',
  'row_level_consumption_artifact_or_exact_nonconsumption_blocker',
  'consumed_agent3_gap_artifact',
  'downstream_owner_next_step',
  'approval_route_owner',
];

const agent1Agent2BaseReturnFields = [
  'queue_id',
  'source_rid',
  'source_citation_or_url_or_exact_missing_source_citation_blocker',
  'owner_action_resolution_or_exact_blocker',
  'transform_blocked_until_prereqs_clear',
  'no_source_license_acceptance_claim',
  'no_definition_or_answer_claim',
  'approval_route_owner',
];

const actionSpecificFieldByKind = {
  queue_scope_dedupe_required: 'queue_scope_dedupe_resolution_or_exact_duplicate_blocker',
  source_citation_ref_gap_resolution_required: 'ref_gap_source_citation_resolution_or_exact_missing_citation_blocker',
  exact_rid_scope_required: 'exact_rid_scope_resolution_or_exact_scope_blocker',
};

const downstreamGap = readJson(inputs.downstream_gap_crossmatch);

const contractRows = (downstreamGap.downstream_gap_rows || []).map((row) => {
  const actionSpecificField = actionSpecificFieldByKind[row.owner_action_kind];
  if (!actionSpecificField) throw new Error(`Unsupported owner action kind: ${row.owner_action_kind}`);
  const agent1Agent2ReturnFields = [...agent1Agent2BaseReturnFields, actionSpecificField];
  return {
    contract_row_id: `agent3-direct-source-rid-row-level-return-${digest(`${row.queue_id}|${row.source_rid}`)}`,
    downstream_gap_row_id: row.gap_row_id,
    owner_action_row_id: row.owner_action_row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    source_rid: row.source_rid,
    source_rid_prefix: row.source_rid_prefix,
    occurrences: Number(row.occurrences || 0),
    owner_action_kind: row.owner_action_kind,
    exact_gap_blocker: row.exact_gap_blocker,
    exact_owner_action_blocker: row.exact_owner_action_blocker,
    downstream_exact_blocker: row.downstream_exact_blocker,
    agent10_return_owner: 'Agent 10',
    agent1_agent2_return_owner: 'Agent 1 / Agent 2',
    approval_route_owner: 'A07',
    evidence_validator_owner: 'A06',
    a06_approval_requested: false,
    agent10_return_fields: agent10ReturnFields,
    agent10_return_field_count: agent10ReturnFields.length,
    agent1_agent2_return_fields: agent1Agent2ReturnFields,
    agent1_agent2_return_field_count: agent1Agent2ReturnFields.length,
    action_specific_return_field: actionSpecificField,
    row_level_downstream_gap: row.row_level_downstream_gap === true,
    agent10_broad_context_present: row.agent10_source_citation_broad_workset_present === true,
    agent10_row_level_consumed: row.agent10_source_citation_row_level_overlay_consumed === true,
    source_citation_or_url_present: false,
    transform_rule_still_blocked: row.agent2_transform_rule_still_blocked === true && row.downstream_transform_rule_still_blocked === true,
    contract_status: 'exact_row_level_return_contract_navigation_only_no_acceptance_claim',
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
      'Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners.',
  };
});

const counts = {
  input_downstream_gap_rows: Number(downstreamGap.counts?.row_level_downstream_gap_rows || 0),
  contract_rows: contractRows.length,
  contract_occurrences: sum(contractRows, 'occurrences'),
  unique_source_rids: new Set(contractRows.map((row) => row.source_rid)).size,
  agent10_return_contract_rows: contractRows.filter((row) => row.agent10_return_owner === 'Agent 10').length,
  agent1_agent2_return_contract_rows: contractRows.filter((row) => row.agent1_agent2_return_owner === 'Agent 1 / Agent 2')
    .length,
  queue_scope_dedupe_contract_rows: contractRows.filter((row) => row.owner_action_kind === 'queue_scope_dedupe_required')
    .length,
  ref_gap_contract_rows: contractRows.filter((row) => row.owner_action_kind === 'source_citation_ref_gap_resolution_required')
    .length,
  exact_rid_scope_contract_rows: contractRows.filter((row) => row.owner_action_kind === 'exact_rid_scope_required')
    .length,
  agent10_return_field_cells: contractRows.reduce((total, row) => total + Number(row.agent10_return_field_count || 0), 0),
  agent1_agent2_return_field_cells: contractRows.reduce(
    (total, row) => total + Number(row.agent1_agent2_return_field_count || 0),
    0,
  ),
  action_specific_return_field_cells: contractRows.filter((row) => Boolean(row.action_specific_return_field)).length,
  row_level_downstream_gap_rows: contractRows.filter((row) => row.row_level_downstream_gap).length,
  agent10_broad_context_rows: contractRows.filter((row) => row.agent10_broad_context_present).length,
  agent10_row_level_consumed_rows: contractRows.filter((row) => row.agent10_row_level_consumed).length,
  source_citation_or_url_present_rows: contractRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: contractRows.filter((row) => row.transform_rule_still_blocked).length,
  a07_approval_route_rows: contractRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: contractRows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: contractRows.filter((row) => row.a06_approval_requested).length,
  source_license_acceptance_claims: contractRows.filter((row) => row.source_license_acceptance).length,
  source_provenance_acceptance_claims: contractRows.filter((row) => row.source_provenance_acceptance).length,
  source_citation_supplied_by_agent3_rows: contractRows.filter((row) => row.source_citation_supplied_by_agent3).length,
  source_text_rows: contractRows.filter((row) => row.source_text_read).length,
  definition_authority_rows: contractRows.filter((row) => row.definition_authority).length,
  answer_selection_rows: contractRows.filter((row) => row.answer_selection).length,
  route_publication_support_rows: contractRows.filter((row) => row.route_publication_support).length,
  accepted_text_rows: contractRows.filter((row) => row.accepted_text).length,
  release_actions: contractRows.filter((row) => row.release_action).length,
  publication_or_release_claims: 0,
  acceptance_claims: 0,
  forbidden_payload_field_hits: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Define exact row-level return fields for the three direct source-RID downstream gap rows without granting acceptance authority.',
  authority_boundary: {
    linkage_navigation_only: true,
    row_level_return_contract_only: true,
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
  contract_rows: contractRows,
  handoff: {
    owner:
      'Agent 10 for row-level package intake return; Agent 1/Agent 2 for source-citation, dedupe, ref-gap, and exact-RID-scope returns; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use these contract rows as the exact required return shape for clearing the downstream gap; no row is transform-ready from this packet.',
    stop_condition:
      'Stop at row-level return contract evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

assertNoForbiddenPayload(artifact);
writeJson(outputJson, artifact);
writeMarkdown(outputMd, artifact);
console.log(
  `Agent 3 direct source-RID row-level return contract written: rows=${counts.contract_rows} fields=${counts.agent10_return_field_cells + counts.agent1_agent2_return_field_cells}`,
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Direct Source-RID Row-Level Return Contract',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Approval route: A07 owns approval, SOP, final validation, and release gate',
    '- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request',
    '- Authority: row-level return contract evidence only; no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '',
    '## Inputs',
    '',
    ...Object.entries(data.inputs).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Contract rows | ${data.counts.contract_rows} |`,
    `| Contract occurrences | ${data.counts.contract_occurrences} |`,
    `| Unique source RIDs | ${data.counts.unique_source_rids} |`,
    `| Agent 10 return contract rows | ${data.counts.agent10_return_contract_rows} |`,
    `| Agent 1/Agent 2 return contract rows | ${data.counts.agent1_agent2_return_contract_rows} |`,
    `| Agent 10 return field cells | ${data.counts.agent10_return_field_cells} |`,
    `| Agent 1/Agent 2 return field cells | ${data.counts.agent1_agent2_return_field_cells} |`,
    `| Action-specific return field cells | ${data.counts.action_specific_return_field_cells} |`,
    `| Row-level downstream gap rows | ${data.counts.row_level_downstream_gap_rows} |`,
    `| Source-citation present rows | ${data.counts.source_citation_or_url_present_rows} |`,
    `| Transform-blocked rows | ${data.counts.transform_rule_still_blocked_rows} |`,
    `| A07 approval-route rows | ${data.counts.a07_approval_route_rows} |`,
    `| A06 evidence-owner rows | ${data.counts.a06_evidence_owner_rows} |`,
    `| Acceptance claims | ${data.counts.acceptance_claims} |`,
    '',
    '## Contract Rows',
    '',
    '| source RID | queue_id | action kind | Agent 10 fields | Agent 1/2 fields | action-specific field | next safe action |',
    '| --- | --- | --- | ---: | ---: | --- | --- |',
    ...data.contract_rows.map((row) =>
      [
        row.source_rid,
        row.queue_id,
        row.owner_action_kind,
        row.agent10_return_field_count,
        row.agent1_agent2_return_field_count,
        row.action_specific_return_field,
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
  if (hits.length) throw new Error(`Forbidden payload keys found in row-level return contract: ${hits.join(', ')}`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}
