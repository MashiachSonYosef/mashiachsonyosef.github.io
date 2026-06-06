#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-locator-crossmatch-2026-06-06.json';
const outputMd =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-locator-crossmatch-2026-06-06.md';

const inputs = {
  direct_source_citation_blocker_workset:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-citation-blocker-workset-2026-06-06.json',
  agent1_public_domain_citation_metadata_custody:
    'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  agent1_commercial_clean_only_metadata_custody:
    'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json',
  agent2_direct_source_citation_prereq_intake_contract:
    'reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json',
};

const timeoutRecord = {
  status: 'process_timeout',
  command:
    'rg -n "P00280|M00032|U00063|E00687|I00126" reports data --glob "*.json" --glob "*.md"',
  requested_timeout_ms: 60000,
  observed_timeout_ms: 402307,
  partial_output_or_artifact:
    'Partial output showed Agent 1 custody and Agent 2 direct-contract locator hits for the 5 source RIDs; broad reports/data search was not complete.',
  next_safe_action:
    'Use named input files only for this locator crossmatch; do not continue broad rg scans over reports/data for these source RIDs.',
};

const workset = readJson(inputs.direct_source_citation_blocker_workset);
const agent1PublicDomain = readJson(inputs.agent1_public_domain_citation_metadata_custody);
const agent1Commercial = readJson(inputs.agent1_commercial_clean_only_metadata_custody);
const agent2Direct = readJson(inputs.agent2_direct_source_citation_prereq_intake_contract);

const rows = (workset.workset_rows || []).map((row, index) => {
  const sourceRid = onlySourceRid(row);
  const rowKey = `${row.queue_id}|${sourceRid}`;
  const publicDomainExact = findRows(
    agent1PublicDomain.public_domain_metadata_rows,
    'public_domain_metadata_rows',
    row.queue_id,
    sourceRid,
  );
  const publicDomainAllQueue = findRows(
    agent1PublicDomain.public_domain_metadata_rows,
    'public_domain_metadata_rows',
    null,
    sourceRid,
  );
  const commercialExact = findRows(
    agent1Commercial.commercial_clean_only_metadata_rows,
    'commercial_clean_only_metadata_rows',
    row.queue_id,
    sourceRid,
  );
  const commercialAllQueue = findRows(
    agent1Commercial.commercial_clean_only_metadata_rows,
    'commercial_clean_only_metadata_rows',
    null,
    sourceRid,
  );
  const refGapExact = findRows(agent1Commercial.ref_gap_rows, 'ref_gap_rows', row.queue_id, sourceRid);
  const agent2Matches = findRows(agent2Direct.direct_identifier_rows, 'direct_identifier_rows', row.queue_id, sourceRid);
  const publicDomainExactRow = publicDomainExact[0]?.row || {};
  const commercialExactRow = commercialExact[0]?.row || {};
  const agent2Row = agent2Matches[0]?.row || {};
  return {
    locator_row_id: `agent3-direct-source-rid-locator-${digest(rowKey)}`,
    order: index + 1,
    workset_row_id: row.workset_row_id,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    source_rid: sourceRid,
    source_rid_prefix: sourceRid.slice(0, 1),
    occurrences: Number(row.occurrences || 0),
    agent2_contract_locator_paths: agent2Matches.map((hit) => hit.path),
    agent1_public_domain_exact_locator_paths: publicDomainExact.map((hit) => hit.path),
    agent1_public_domain_all_queue_locator_paths: publicDomainAllQueue.map((hit) => hit.path),
    agent1_commercial_exact_locator_paths: commercialExact.map((hit) => hit.path),
    agent1_commercial_all_queue_locator_paths: commercialAllQueue.map((hit) => hit.path),
    agent1_commercial_ref_gap_locator_paths: refGapExact.map((hit) => hit.path),
    agent2_source_family: agent2Row.source_family || null,
    agent2_triage_group: agent2Row.triage_group || null,
    agent2_source_citation_or_url_present: agent2Row.source_citation_or_url_present === true,
    agent2_transform_rule_still_blocked: agent2Row.transform_rule_still_blocked === true,
    agent1_public_domain_citation_metadata_present:
      publicDomainExactRow.public_domain_citation_metadata_present === true,
    agent1_commercial_citation_metadata_present:
      commercialExactRow.public_domain_citation_metadata_present === true,
    agent1_public_domain_refs_count: Number(publicDomainExactRow.public_domain_refs_count || 0),
    agent1_commercial_refs_count: Number(commercialExactRow.public_domain_refs_count || 0),
    exact_blocker: 'direct_source_citation_or_url_missing_after_agent2_intake_match',
    locator_status: 'locator_evidence_only_source_citation_still_missing',
    approval_route_owner: 'A07',
    evidence_validator_owner: 'A06',
    a06_approval_requested: false,
    source_license_acceptance: false,
    source_provenance_acceptance: false,
    source_citation_supplied_by_agent3: false,
    source_text_read: false,
    definition_authority: false,
    accepted_text: false,
    next_safe_action:
      'Use locator paths to inspect the row-level custody records; source citation still requires Agent 1/Agent 2 enrichment or exact missing-citation blocker, with approval routed to A07.',
  };
});

const counts = {
  workset_rows: rows.length,
  workset_occurrences: sum(rows, 'occurrences'),
  unique_source_rids: new Set(rows.map((row) => row.source_rid)).size,
  agent2_contract_rows_matched: rows.filter((row) => row.agent2_contract_locator_paths.length === 1).length,
  agent1_public_domain_exact_rows_matched: rows.filter(
    (row) => row.agent1_public_domain_exact_locator_paths.length === 1,
  ).length,
  agent1_public_domain_all_queue_locator_hits: sumArrayLengths(rows, 'agent1_public_domain_all_queue_locator_paths'),
  agent1_commercial_exact_rows_matched: rows.filter((row) => row.agent1_commercial_exact_locator_paths.length === 1)
    .length,
  agent1_commercial_all_queue_locator_hits: sumArrayLengths(rows, 'agent1_commercial_all_queue_locator_paths'),
  agent1_commercial_ref_gap_rows_matched: rows.filter((row) => row.agent1_commercial_ref_gap_locator_paths.length > 0)
    .length,
  agent1_public_domain_citation_metadata_present_rows: rows.filter(
    (row) => row.agent1_public_domain_citation_metadata_present,
  ).length,
  agent1_commercial_citation_metadata_present_rows: rows.filter(
    (row) => row.agent1_commercial_citation_metadata_present,
  ).length,
  agent2_source_citation_or_url_present_rows: rows.filter((row) => row.agent2_source_citation_or_url_present).length,
  agent2_transform_rule_still_blocked_rows: rows.filter((row) => row.agent2_transform_rule_still_blocked).length,
  zero_ref_count_rows: rows.filter(
    (row) => row.agent1_public_domain_refs_count === 0 || row.agent1_commercial_refs_count === 0,
  ).length,
  process_timeout_records: 1,
  a07_approval_route_rows: rows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: rows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: rows.filter((row) => row.a06_approval_requested).length,
  source_license_acceptance_claims: rows.filter((row) => row.source_license_acceptance).length,
  source_provenance_acceptance_claims: rows.filter((row) => row.source_provenance_acceptance).length,
  source_citation_supplied_by_agent3_rows: rows.filter((row) => row.source_citation_supplied_by_agent3).length,
  source_text_rows: rows.filter((row) => row.source_text_read).length,
  definition_authority_rows: rows.filter((row) => row.definition_authority).length,
  accepted_text_rows: rows.filter((row) => row.accepted_text).length,
  publication_or_release_claims: 0,
  acceptance_claims: 0,
  forbidden_payload_field_hits: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_locator_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_locator_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Crossmatch the 5 direct-source blocker source RIDs against named Agent 1 custody artifacts and Agent 2 direct contract locator paths.',
  authority_boundary: {
    linkage_navigation_only: true,
    source_rid_locator_crossmatch_only: true,
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
  process_timeout_records: [timeoutRecord],
  counts,
  locator_rows: rows,
  exact_blockers: [
    {
      exact_blocker: 'source_rid_locator_found_but_source_citation_or_url_still_missing',
      rows: counts.workset_rows,
      source_rids: counts.unique_source_rids,
      evidence_role: 'locator_navigation_only_no_acceptance_claim',
    },
  ],
  handoff: {
    owner: 'Agent 10 for package intake; Agent 1/Agent 2 for row-level source-citation enrichment; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use locator paths as named row-entry pointers only; each row still requires source_citation_or_url or exact missing-citation blocker before any transform/release consideration.',
    stop_condition:
      'Stop at source-RID locator crossmatch evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

assertNoForbiddenPayload(artifact);
writeJson(outputJson, artifact);
writeMarkdown(outputMd, artifact);
console.log(
  `Agent 3 direct source-RID locator crossmatch written: rows=${counts.workset_rows} sourceRids=${counts.unique_source_rids}`,
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Direct Source-RID Locator Crossmatch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    '- Status: evidence-ready',
    '- Lane: Agent 3 linkage/dedupe/navigation only',
    '- Approval route: A07 owns approval, SOP, final validation, and release gate',
    '- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request',
    '- Authority: locator evidence only; no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim',
    '',
    '## Process Timeout Boundary',
    '',
    `- process_timeout | command=${mdInline(timeoutRecord.command)} | timeout=${timeoutRecord.requested_timeout_ms}ms requested / ${timeoutRecord.observed_timeout_ms}ms observed | partial_output_or_artifact=${timeoutRecord.partial_output_or_artifact} | next_safe_action=${timeoutRecord.next_safe_action}`,
    '',
    '## Inputs',
    '',
    ...Object.entries(data.inputs).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Workset rows | ${data.counts.workset_rows} |`,
    `| Workset occurrences | ${data.counts.workset_occurrences} |`,
    `| Unique source RIDs | ${data.counts.unique_source_rids} |`,
    `| Agent 2 contract rows matched | ${data.counts.agent2_contract_rows_matched} |`,
    `| Agent 1 public-domain exact rows matched | ${data.counts.agent1_public_domain_exact_rows_matched} |`,
    `| Agent 1 commercial exact rows matched | ${data.counts.agent1_commercial_exact_rows_matched} |`,
    `| Agent 1 commercial ref-gap rows matched | ${data.counts.agent1_commercial_ref_gap_rows_matched} |`,
    `| Agent 2 source-citation present rows | ${data.counts.agent2_source_citation_or_url_present_rows} |`,
    `| Agent 2 transform-blocked rows | ${data.counts.agent2_transform_rule_still_blocked_rows} |`,
    `| Process timeout records | ${data.counts.process_timeout_records} |`,
    `| A07 approval-route rows | ${data.counts.a07_approval_route_rows} |`,
    `| A06 evidence-owner rows | ${data.counts.a06_evidence_owner_rows} |`,
    `| Acceptance claims | ${data.counts.acceptance_claims} |`,
    '',
    '## Locator Rows',
    '',
    '| order | queue_id | source RID | occurrences | Agent 2 path | Agent 1 PD path | Agent 1 commercial path | exact blocker |',
    '| ---: | --- | --- | ---: | --- | --- | --- | --- |',
    ...data.locator_rows.map((row) =>
      [
        row.order,
        row.queue_id,
        row.source_rid,
        row.occurrences,
        row.agent2_contract_locator_paths.join('; '),
        row.agent1_public_domain_exact_locator_paths.join('; '),
        row.agent1_commercial_exact_locator_paths.join('; '),
        row.exact_blocker,
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
  fs.writeFileSync(path.join(root, filePath), `${lines.join('\n')}`);
}

function onlySourceRid(row) {
  if (!Array.isArray(row.source_rids) || row.source_rids.length !== 1) {
    throw new Error(`Expected exactly one source RID for ${row.queue_id}`);
  }
  return row.source_rids[0];
}

function findRows(rows, rowKey, queueId, sourceRid) {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row, index) => {
    const rids = Array.isArray(row.public_domain_rids)
      ? row.public_domain_rids
      : typeof row.source_rid === 'string'
        ? [row.source_rid]
        : [];
    const queueMatches = queueId === null || row.queue_id === queueId;
    return queueMatches && rids.includes(sourceRid)
      ? [
          {
            path: `${rowKey}[${index}]`,
            row,
          },
        ]
      : [];
  });
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function sumArrayLengths(rows, field) {
  return rows.reduce((total, row) => total + (Array.isArray(row[field]) ? row[field].length : 0), 0);
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
  if (hits.length) {
    throw new Error(`Forbidden payload keys found in locator artifact: ${hits.join(', ')}`);
  }
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function mdInline(value) {
  return `\`${String(value ?? '').replace(/`/g, "'")}\``;
}
