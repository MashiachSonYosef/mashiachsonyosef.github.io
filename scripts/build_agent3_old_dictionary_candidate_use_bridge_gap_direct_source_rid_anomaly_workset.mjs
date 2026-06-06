#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-anomaly-workset-2026-06-06.json';
const outputMd =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-anomaly-workset-2026-06-06.md';

const inputs = {
  direct_source_rid_locator_crossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-locator-crossmatch-2026-06-06.json',
  agent1_public_domain_citation_metadata_custody:
    'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  agent1_commercial_clean_only_metadata_custody:
    'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json',
  agent2_direct_source_citation_prereq_intake_contract:
    'reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json',
};

const locator = readJson(inputs.direct_source_rid_locator_crossmatch);
const agent1PublicDomain = readJson(inputs.agent1_public_domain_citation_metadata_custody);
const agent1Commercial = readJson(inputs.agent1_commercial_clean_only_metadata_custody);
const agent2Direct = readJson(inputs.agent2_direct_source_citation_prereq_intake_contract);

const reviewedRows = (locator.locator_rows || []).map((row) => {
  const publicDomainRow = firstPathRow(agent1PublicDomain, row.agent1_public_domain_exact_locator_paths?.[0]);
  const commercialRow = firstPathRow(agent1Commercial, row.agent1_commercial_exact_locator_paths?.[0]);
  const agent2Row = firstPathRow(agent2Direct, row.agent2_contract_locator_paths?.[0]);
  const publicDomainRidCount = Number(publicDomainRow?.public_domain_rid_count || 0);
  const commercialRidCount = Number(commercialRow?.public_domain_rid_count || 0);
  const publicDomainAllQueueHits = Number(row.agent1_public_domain_all_queue_locator_paths?.length || 0);
  const commercialAllQueueHits = Number(row.agent1_commercial_all_queue_locator_paths?.length || 0);
  const refGapHits = Number(row.agent1_commercial_ref_gap_locator_paths?.length || 0);
  const publicDomainRefsCount = Number(row.agent1_public_domain_refs_count || 0);
  const commercialRefsCount = Number(row.agent1_commercial_refs_count || 0);
  const anomalyFlags = [
    publicDomainAllQueueHits > 1 ? 'duplicate_agent1_public_domain_source_rid_locator' : null,
    commercialAllQueueHits > 1 ? 'duplicate_agent1_commercial_source_rid_locator' : null,
    publicDomainRefsCount === 0 ? 'zero_public_domain_refs_count' : null,
    commercialRefsCount === 0 ? 'zero_commercial_refs_count' : null,
    refGapHits > 0 ? 'commercial_ref_gap_row_present' : null,
    publicDomainRidCount > 1 ? 'multi_public_domain_rid_custody_row' : null,
    commercialRidCount > 1 ? 'multi_commercial_rid_custody_row' : null,
  ].filter(Boolean);
  return {
    review_row_id: `agent3-direct-source-rid-anomaly-review-${digest(`${row.queue_id}|${row.source_rid}`)}`,
    locator_row_id: row.locator_row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    source_rid: row.source_rid,
    source_rid_prefix: row.source_rid_prefix,
    occurrences: Number(row.occurrences || 0),
    selected_for_downstream_review: anomalyFlags.length > 0,
    anomaly_flags: anomalyFlags,
    anomaly_count: anomalyFlags.length,
    agent2_contract_locator_paths: row.agent2_contract_locator_paths || [],
    agent1_public_domain_exact_locator_paths: row.agent1_public_domain_exact_locator_paths || [],
    agent1_public_domain_all_queue_locator_count: publicDomainAllQueueHits,
    agent1_commercial_exact_locator_paths: row.agent1_commercial_exact_locator_paths || [],
    agent1_commercial_all_queue_locator_count: commercialAllQueueHits,
    agent1_commercial_ref_gap_locator_paths: row.agent1_commercial_ref_gap_locator_paths || [],
    agent1_public_domain_rid_count: publicDomainRidCount,
    agent1_commercial_rid_count: commercialRidCount,
    agent1_public_domain_refs_count: publicDomainRefsCount,
    agent1_commercial_refs_count: commercialRefsCount,
    agent2_source_family: agent2Row?.source_family || row.agent2_source_family || null,
    agent2_triage_group: agent2Row?.triage_group || row.agent2_triage_group || null,
    agent2_source_citation_or_url_present: agent2Row?.source_citation_or_url_present === true,
    agent2_transform_rule_still_blocked: agent2Row?.transform_rule_still_blocked === true,
    exact_blockers: exactBlockers(anomalyFlags),
    ordinary_locator_status:
      anomalyFlags.length === 0 ? 'reviewed_no_locator_anomaly_but_direct_source_citation_still_missing' : null,
    approval_route_owner: 'A07',
    evidence_validator_owner: 'A06',
    a06_approval_requested: false,
    source_license_acceptance: false,
    source_provenance_acceptance: false,
    source_citation_supplied_by_agent3: false,
    source_text_read: false,
    definition_authority: false,
    answer_selection: false,
    accepted_text: false,
    next_safe_action:
      anomalyFlags.length > 0
        ? 'Route this source-RID anomaly to Agent 10 intake and Agent 1/Agent 2 row-level enrichment before any transform consideration; approval route remains A07.'
        : 'Keep as reviewed locator evidence only; source_citation_or_url remains missing and transform stays blocked.',
  };
});

const selectedRows = reviewedRows.filter((row) => row.selected_for_downstream_review);
const counts = {
  input_locator_rows: reviewedRows.length,
  selected_anomaly_rows: selectedRows.length,
  non_anomaly_reviewed_rows: reviewedRows.length - selectedRows.length,
  selected_anomaly_occurrences: sum(selectedRows, 'occurrences'),
  reviewed_occurrences: sum(reviewedRows, 'occurrences'),
  unique_reviewed_source_rids: new Set(reviewedRows.map((row) => row.source_rid)).size,
  unique_anomaly_source_rids: new Set(selectedRows.map((row) => row.source_rid)).size,
  duplicate_public_domain_locator_rows: reviewedRows.filter(
    (row) => row.agent1_public_domain_all_queue_locator_count > 1,
  ).length,
  duplicate_commercial_locator_rows: reviewedRows.filter((row) => row.agent1_commercial_all_queue_locator_count > 1)
    .length,
  zero_public_domain_refs_rows: reviewedRows.filter((row) => row.agent1_public_domain_refs_count === 0).length,
  zero_commercial_refs_rows: reviewedRows.filter((row) => row.agent1_commercial_refs_count === 0).length,
  commercial_ref_gap_rows: reviewedRows.filter((row) => row.agent1_commercial_ref_gap_locator_paths.length > 0)
    .length,
  multi_public_domain_rid_rows: reviewedRows.filter((row) => row.agent1_public_domain_rid_count > 1).length,
  multi_commercial_rid_rows: reviewedRows.filter((row) => row.agent1_commercial_rid_count > 1).length,
  agent2_source_citation_or_url_present_rows: reviewedRows.filter((row) => row.agent2_source_citation_or_url_present)
    .length,
  agent2_transform_rule_still_blocked_rows: reviewedRows.filter((row) => row.agent2_transform_rule_still_blocked)
    .length,
  inherited_process_timeout_records: Number(locator.process_timeout_records?.length || 0),
  new_broad_search_commands_run: 0,
  a07_approval_route_rows: reviewedRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: reviewedRows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: reviewedRows.filter((row) => row.a06_approval_requested).length,
  source_license_acceptance_claims: reviewedRows.filter((row) => row.source_license_acceptance).length,
  source_provenance_acceptance_claims: reviewedRows.filter((row) => row.source_provenance_acceptance).length,
  source_citation_supplied_by_agent3_rows: reviewedRows.filter((row) => row.source_citation_supplied_by_agent3)
    .length,
  source_text_rows: reviewedRows.filter((row) => row.source_text_read).length,
  definition_authority_rows: reviewedRows.filter((row) => row.definition_authority).length,
  answer_selection_rows: reviewedRows.filter((row) => row.answer_selection).length,
  accepted_text_rows: reviewedRows.filter((row) => row.accepted_text).length,
  publication_or_release_claims: 0,
  acceptance_claims: 0,
  forbidden_payload_field_hits: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_anomaly_workset',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_anomaly_workset.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Classify all five direct source-RID locator rows and select bounded anomaly rows for downstream dedupe/navigation review.',
  authority_boundary: {
    linkage_navigation_only: true,
    source_rid_anomaly_workset_only: true,
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
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  inputs,
  inherited_process_timeout_records: locator.process_timeout_records || [],
  counts,
  reviewed_locator_rows: reviewedRows,
  selected_anomaly_rows: selectedRows,
  exact_blocker_summary: summarizeBlockers(selectedRows),
  handoff: {
    owner: 'Agent 10 for package intake; Agent 1/Agent 2 for source-citation enrichment and row-scope clarification; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use selected anomaly rows to resolve source-RID duplication, zero-ref/ref-gap, and multi-RID custody-row navigation before any transform or release consideration.',
    stop_condition:
      'Stop at anomaly workset evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

assertNoForbiddenPayload(artifact);
writeJson(outputJson, artifact);
writeMarkdown(outputMd, artifact);
console.log(
  `Agent 3 direct source-RID anomaly workset written: reviewed=${counts.input_locator_rows} selected=${counts.selected_anomaly_rows}`,
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Direct Source-RID Anomaly Workset',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Approval route: A07 owns approval, SOP, final validation, and release gate',
    '- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request',
    '- Authority: anomaly/navigation evidence only; no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '',
    '## Inputs',
    '',
    ...Object.entries(data.inputs).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Reviewed locator rows | ${data.counts.input_locator_rows} |`,
    `| Selected anomaly rows | ${data.counts.selected_anomaly_rows} |`,
    `| Non-anomaly reviewed rows | ${data.counts.non_anomaly_reviewed_rows} |`,
    `| Selected anomaly occurrences | ${data.counts.selected_anomaly_occurrences} |`,
    `| Unique anomaly source RIDs | ${data.counts.unique_anomaly_source_rids} |`,
    `| Duplicate public-domain locator rows | ${data.counts.duplicate_public_domain_locator_rows} |`,
    `| Duplicate commercial locator rows | ${data.counts.duplicate_commercial_locator_rows} |`,
    `| Zero public-domain refs rows | ${data.counts.zero_public_domain_refs_rows} |`,
    `| Zero commercial refs rows | ${data.counts.zero_commercial_refs_rows} |`,
    `| Commercial ref-gap rows | ${data.counts.commercial_ref_gap_rows} |`,
    `| Multi public-domain RID rows | ${data.counts.multi_public_domain_rid_rows} |`,
    `| Multi commercial RID rows | ${data.counts.multi_commercial_rid_rows} |`,
    `| Agent 2 source-citation present rows | ${data.counts.agent2_source_citation_or_url_present_rows} |`,
    `| Agent 2 transform-blocked rows | ${data.counts.agent2_transform_rule_still_blocked_rows} |`,
    `| Inherited process-timeout records | ${data.counts.inherited_process_timeout_records} |`,
    `| New broad search commands run | ${data.counts.new_broad_search_commands_run} |`,
    `| A07 approval-route rows | ${data.counts.a07_approval_route_rows} |`,
    `| A06 evidence-owner rows | ${data.counts.a06_evidence_owner_rows} |`,
    `| Acceptance claims | ${data.counts.acceptance_claims} |`,
    '',
    '## Selected Anomaly Rows',
    '',
    '| source RID | queue_id | occurrences | flags | exact blockers | next safe action |',
    '| --- | --- | ---: | --- | --- | --- |',
    ...data.selected_anomaly_rows.map((row) =>
      [
        row.source_rid,
        row.queue_id,
        row.occurrences,
        row.anomaly_flags.join('; '),
        row.exact_blockers.join('; '),
        row.next_safe_action,
      ]
        .map(mdCell)
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |'),
    ),
    '',
    '## Reviewed Non-Anomaly Rows',
    '',
    '| source RID | queue_id | occurrences | status |',
    '| --- | --- | ---: | --- |',
    ...data.reviewed_locator_rows
      .filter((row) => !row.selected_for_downstream_review)
      .map((row) =>
        [row.source_rid, row.queue_id, row.occurrences, row.ordinary_locator_status]
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

function firstPathRow(data, locatorPath) {
  if (!locatorPath) return null;
  const match = /^([A-Za-z0-9_]+)\[(\d+)\]$/.exec(locatorPath);
  if (!match) throw new Error(`Unsupported locator path: ${locatorPath}`);
  const [, key, indexText] = match;
  const rows = data[key];
  if (!Array.isArray(rows)) throw new Error(`Missing locator collection: ${key}`);
  return rows[Number(indexText)] || null;
}

function exactBlockers(flags) {
  const blockers = [];
  if (
    flags.includes('duplicate_agent1_public_domain_source_rid_locator') ||
    flags.includes('duplicate_agent1_commercial_source_rid_locator')
  ) {
    blockers.push('source_rid_duplicate_locator_requires_queue_scope_dedupe');
  }
  if (
    flags.includes('zero_public_domain_refs_count') ||
    flags.includes('zero_commercial_refs_count') ||
    flags.includes('commercial_ref_gap_row_present')
  ) {
    blockers.push('source_rid_zero_ref_gap_blocks_direct_source_citation_enrichment');
  }
  if (flags.includes('multi_public_domain_rid_custody_row') || flags.includes('multi_commercial_rid_custody_row')) {
    blockers.push('source_rid_multi_rid_custody_row_requires_exact_rid_scope');
  }
  return blockers;
}

function summarizeBlockers(rows) {
  const summary = new Map();
  for (const row of rows) {
    for (const blocker of row.exact_blockers) {
      const current = summary.get(blocker) || { exact_blocker: blocker, rows: 0, source_rids: [], occurrences: 0 };
      current.rows += 1;
      current.source_rids.push(row.source_rid);
      current.occurrences += Number(row.occurrences || 0);
      summary.set(blocker, current);
    }
  }
  return Array.from(summary.values()).map((row) => ({
    ...row,
    source_rids: Array.from(new Set(row.source_rids)).sort(),
    evidence_role: 'source_rid_anomaly_navigation_only_no_acceptance_claim',
  }));
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
  if (hits.length) throw new Error(`Forbidden payload keys found in anomaly artifact: ${hits.join(', ')}`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}
