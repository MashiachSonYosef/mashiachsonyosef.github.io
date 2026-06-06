#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  routeOverlay:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.json',
  agent2DirectIntakeContract:
    'reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json',
  agent2DirectIntakeValidation:
    'reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-validation-result-2026-06-06.json',
  agent10SourceCitationWorkset:
    'reports/agent10-agent1-ready-old-dictionary-78-row-source-citation-enrichment-workset-2026-06-06.json',
  agent10PreboundaryPacket:
    'reports/agent10-agent6-ready-old-dictionary-78-row-candidate-use-preboundary-packet-2026-06-06.json',
  agent10Agent6VerdictConsumption:
    'reports/agent10-old-dictionary-78-row-agent6-verdict-consumption-2026-06-06.json',
  agent4A07RouteCorrectionReceipt:
    'reports/agent4-a07-approval-route-correction-receipt-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const routeOverlay = readJson(options.routeOverlay);
const agent2DirectIntakeContract = readJson(options.agent2DirectIntakeContract);
const agent2DirectIntakeValidation = readJson(options.agent2DirectIntakeValidation);
const agent10SourceCitationWorkset = readJson(options.agent10SourceCitationWorkset);
const agent10PreboundaryPacket = readJson(options.agent10PreboundaryPacket);
const agent10Agent6VerdictConsumption = readJson(options.agent10Agent6VerdictConsumption);
const agent4A07RouteCorrectionReceipt = readJson(options.agent4A07RouteCorrectionReceipt);

assertArtifact(
  routeOverlay,
  'agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay',
  options.routeOverlay,
);
assertArtifact(
  agent2DirectIntakeContract,
  'agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract',
  options.agent2DirectIntakeContract,
);
assertArtifact(
  agent2DirectIntakeValidation,
  'agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract_validation_result',
  options.agent2DirectIntakeValidation,
);
assertArtifact(
  agent10SourceCitationWorkset,
  'agent10_agent1_ready_old_dictionary_78_row_source_citation_enrichment_workset',
  options.agent10SourceCitationWorkset,
);
assertArtifact(
  agent10PreboundaryPacket,
  'agent10_agent6_ready_old_dictionary_78_row_candidate_use_preboundary_packet',
  options.agent10PreboundaryPacket,
);
assertArtifact(
  agent10Agent6VerdictConsumption,
  'agent10_old_dictionary_78_row_agent6_verdict_consumption',
  options.agent10Agent6VerdictConsumption,
);
assertArtifact(agent4A07RouteCorrectionReceipt, 'agent4_route_correction_receipt', options.agent4A07RouteCorrectionReceipt);

const directRows = agent2DirectIntakeContract.direct_identifier_rows || [];
const directBySourceRid = new Map(directRows.map((row) => [row.source_rid, row]));
const directByQueueId = new Map(directRows.map((row) => [row.queue_id, row]));
const routeCorrection = agent4A07RouteCorrectionReceipt.route_correction || {};

const crossmatchRows = (routeOverlay.overlay_rows || [])
  .slice()
  .sort((a, b) => a.mechanical_order - b.mechanical_order || a.queue_id.localeCompare(b.queue_id, 'en'))
  .map((row, index) => {
    const sourceRids = (row.source_rid_links || []).map((link) => link.source_rid);
    const directMatches = sourceRids
      .map((sourceRid) => directBySourceRid.get(sourceRid) || null)
      .filter(Boolean);
    const queueDirectMatch = directByQueueId.get(row.queue_id) || null;
    const isDirectWorkset = row.downstream_workset === 'direct_source_citation_prereq_workset';
    const isA06Workset = row.downstream_workset === 'a06_evidence_boundary_prereq_workset';
    const directContractMatchStatus = isDirectWorkset
      ? directMatches.length === sourceRids.length && queueDirectMatch !== null
        ? 'matched_agent2_direct_source_citation_prereq_contract'
        : 'missing_agent2_direct_source_citation_prereq_contract_match'
      : 'not_direct_source_citation_workset';
    const broadPreboundaryContextPresent =
      agent10PreboundaryPacket.boundary_counts?.rows === 78 &&
      agent10Agent6VerdictConsumption.agent6_verdict_consumed?.rows === 78;
    const rowLevelOverlayConsumedByPreboundary =
      (agent10PreboundaryPacket.agent1_4_inputs_consumed || []).some(
        (entry) => entry.lane === 'Agent 3' && entry.input === options.routeOverlay,
      ) ||
      (agent10Agent6VerdictConsumption.agent1_4_inputs_consumed || []).some(
        (entry) => entry.lane === 'Agent 3' && entry.input === options.routeOverlay,
      );
    const exactBlocker = buildExactBlocker({
      isDirectWorkset,
      directContractMatchStatus,
      rowLevelOverlayConsumedByPreboundary,
    });
    return {
      crossmatch_row_id: `agent3-bridge-gap-downstream-intake-coverage-${sha256(row.queue_id).slice(0, 12)}`,
      overlay_row_id: row.overlay_row_id,
      candidate_row_id: row.candidate_row_id,
      queue_id: row.queue_id,
      token_id: row.token_id,
      lexicon_entry_id: row.lexicon_entry_id,
      surface: row.surface,
      normalized: row.normalized,
      occurrences: Number(row.occurrences || 0),
      downstream_workset: row.downstream_workset,
      source_rids: sourceRids,
      source_rid_link_count: sourceRids.length,
      direct_contract_match_status: directContractMatchStatus,
      direct_contract_row_ids: directMatches.map((match) => match.source_rid),
      direct_contract_queue_match: queueDirectMatch !== null,
      direct_contract_validation_result: agent2DirectIntakeValidation.result || null,
      direct_contract_source_citation_or_url_present: directMatches.some(
        (match) => match.source_citation_or_url_present === true,
      ),
      direct_contract_transform_rule_still_blocked: directMatches.every(
        (match) => match.transform_rule_still_blocked === true,
      ),
      agent10_source_citation_broad_workset_present:
        agent10SourceCitationWorkset.workset?.rows === 78 &&
        agent10SourceCitationWorkset.workset?.missing_field_to_supply === 'source_citation_or_url',
      agent10_source_citation_broad_workset_rows: Number(agent10SourceCitationWorkset.workset?.rows || 0),
      agent10_source_citation_row_level_overlay_consumed: false,
      agent10_preboundary_broad_context_present: broadPreboundaryContextPresent,
      agent10_preboundary_row_level_overlay_consumed: rowLevelOverlayConsumedByPreboundary,
      agent10_preboundary_agent3_input_null:
        (agent10PreboundaryPacket.agent1_4_inputs_consumed || []).some(
          (entry) => entry.lane === 'Agent 3' && entry.input === null,
        ) &&
        (agent10Agent6VerdictConsumption.agent1_4_inputs_consumed || []).some(
          (entry) => entry.lane === 'Agent 3' && entry.input === null,
        ),
      agent10_agent6_verdict_consumed_no_transform_authorized:
        agent10Agent6VerdictConsumption.release_package_decision?.transform_output_authorized === false,
      a07_route_correction_present:
        routeCorrection.approval_sop_final_validation_release_gate === 'A07' &&
        routeCorrection.evidence_validators_repo_cleaning_production === 'A06',
      approval_route_owner: 'A07',
      evidence_validator_owner: 'A06',
      a06_approval_requested: false,
      a06_evidence_ready_until_a07_approves:
        routeCorrection.a06_output_status === 'evidence_ready_until_A07_approves',
      do_not_ask_a06_for_approval: routeCorrection.do_not_ask_a06_for_approval === true,
      source_citation_required: row.source_rid_links.every((link) => link.source_citation_required === true),
      source_citation_or_url_present: row.source_rid_links.some((link) => link.source_citation_or_url_present === true),
      transform_rule_still_blocked: row.source_rid_links.every((link) => link.transform_rule_still_blocked === true),
      exact_blocker: exactBlocker,
      status: 'blocked_navigation_evidence_only',
      evidence_role: 'downstream_intake_coverage_crossmatch_navigation_only_no_acceptance_claim',
      next_safe_action: buildNextSafeAction({ isDirectWorkset, isA06Workset, exactBlocker, queueId: row.queue_id }),
      route_write_allowed: false,
      candidate_text_allowed: false,
      answer_selection_allowed: false,
      public_mutation_allowed: false,
      acceptance_claimed: false,
      mechanical_order: index + 1,
    };
  });

const directCrossmatchRows = crossmatchRows.filter(
  (row) => row.downstream_workset === 'direct_source_citation_prereq_workset',
);
const a06CrossmatchRows = crossmatchRows.filter(
  (row) => row.downstream_workset === 'a06_evidence_boundary_prereq_workset',
);
const exactBlockerRows = summarizeBy(crossmatchRows, (row) => row.exact_blocker, 'exact_blocker');
const downstreamWorksetRows = summarizeBy(crossmatchRows, (row) => row.downstream_workset, 'downstream_workset');

const counts = {
  input_overlay_rows: Number(routeOverlay.counts?.overlay_rows || 0),
  input_overlay_occurrences: Number(routeOverlay.counts?.overlay_occurrences || 0),
  input_overlay_source_rid_links: Number(routeOverlay.counts?.source_rid_route_links || 0),
  agent2_direct_contract_rows: Number(agent2DirectIntakeContract.lane_counts_rows_consumed?.direct_rows || 0),
  agent2_direct_contract_validation_passed: agent2DirectIntakeValidation.result === 'passed' ? 1 : 0,
  agent10_source_citation_workset_rows: Number(agent10SourceCitationWorkset.workset?.rows || 0),
  agent10_preboundary_rows: Number(agent10PreboundaryPacket.boundary_counts?.rows || 0),
  agent10_agent6_verdict_rows: Number(agent10Agent6VerdictConsumption.agent6_verdict_consumed?.rows || 0),
  crossmatch_rows: crossmatchRows.length,
  crossmatch_occurrences: sum(crossmatchRows, 'occurrences'),
  source_rid_links: sum(crossmatchRows, 'source_rid_link_count'),
  direct_overlay_rows: directCrossmatchRows.length,
  direct_overlay_occurrences: sum(directCrossmatchRows, 'occurrences'),
  direct_overlay_rows_matched_agent2_contract: directCrossmatchRows.filter(
    (row) => row.direct_contract_match_status === 'matched_agent2_direct_source_citation_prereq_contract',
  ).length,
  direct_overlay_rows_missing_agent2_contract_match: directCrossmatchRows.filter(
    (row) => row.direct_contract_match_status !== 'matched_agent2_direct_source_citation_prereq_contract',
  ).length,
  direct_overlay_source_rid_links: sum(directCrossmatchRows, 'source_rid_link_count'),
  direct_overlay_source_citation_missing_rows: directCrossmatchRows.filter(
    (row) => row.source_citation_or_url_present === false,
  ).length,
  direct_overlay_transform_blocked_rows: directCrossmatchRows.filter((row) => row.transform_rule_still_blocked).length,
  a06_overlay_rows: a06CrossmatchRows.length,
  a06_overlay_occurrences: sum(a06CrossmatchRows, 'occurrences'),
  a06_overlay_source_rid_links: sum(a06CrossmatchRows, 'source_rid_link_count'),
  a06_overlay_row_level_downstream_consumed_rows: a06CrossmatchRows.filter(
    (row) => row.agent10_preboundary_row_level_overlay_consumed,
  ).length,
  a06_overlay_row_level_downstream_missing_rows: a06CrossmatchRows.filter(
    (row) => !row.agent10_preboundary_row_level_overlay_consumed,
  ).length,
  broad_agent10_source_citation_workset_context_rows: crossmatchRows.filter(
    (row) => row.agent10_source_citation_broad_workset_present,
  ).length,
  broad_agent10_preboundary_context_rows: crossmatchRows.filter((row) => row.agent10_preboundary_broad_context_present)
    .length,
  row_level_agent10_source_citation_overlay_consumed_rows: crossmatchRows.filter(
    (row) => row.agent10_source_citation_row_level_overlay_consumed,
  ).length,
  row_level_agent10_preboundary_overlay_consumed_rows: crossmatchRows.filter(
    (row) => row.agent10_preboundary_row_level_overlay_consumed,
  ).length,
  agent10_preboundary_agent3_input_null_rows: crossmatchRows.filter((row) => row.agent10_preboundary_agent3_input_null)
    .length,
  agent10_agent6_verdict_no_transform_authorized_rows: crossmatchRows.filter(
    (row) => row.agent10_agent6_verdict_consumed_no_transform_authorized,
  ).length,
  a07_route_correction_present_rows: crossmatchRows.filter((row) => row.a07_route_correction_present).length,
  a07_approval_route_rows: crossmatchRows.filter((row) => row.approval_route_owner === 'A07').length,
  a06_evidence_owner_rows: crossmatchRows.filter((row) => row.evidence_validator_owner === 'A06').length,
  a06_approval_requested_rows: crossmatchRows.filter((row) => row.a06_approval_requested === true).length,
  a06_evidence_ready_until_a07_rows: crossmatchRows.filter((row) => row.a06_evidence_ready_until_a07_approves).length,
  do_not_ask_a06_for_approval_rows: crossmatchRows.filter((row) => row.do_not_ask_a06_for_approval).length,
  exact_blocker_rows: exactBlockerRows.length,
  downstream_workset_summary_rows: downstreamWorksetRows.length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch',
  generated_at: new Date().toISOString(),
  generator:
    'scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Crossmatch the 14 bridge-gap route-overlay rows against current Agent 2, Agent 10, and Agent 4 downstream intake artifacts without acceptance claims.',
  authority_boundary: {
    linkage_navigation_only: true,
    downstream_intake_coverage_only: true,
    approval_sop_final_validation_release_gate_owner_a07: true,
    evidence_validators_repo_cleaning_production_owner_a06: true,
    a06_outputs_evidence_ready_until_a07_approves: true,
    do_not_ask_a06_for_approval: true,
    no_row_level_agent10_overlay_consumption_claim: true,
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
    route_overlay: options.routeOverlay,
    agent2_direct_intake_contract: options.agent2DirectIntakeContract,
    agent2_direct_intake_validation: options.agent2DirectIntakeValidation,
    agent10_source_citation_workset: options.agent10SourceCitationWorkset,
    agent10_preboundary_packet: options.agent10PreboundaryPacket,
    agent10_agent6_verdict_consumption: options.agent10Agent6VerdictConsumption,
    agent4_a07_route_correction_receipt: options.agent4A07RouteCorrectionReceipt,
  },
  counts,
  downstream_workset_rows: downstreamWorksetRows,
  exact_blocker_rows: exactBlockerRows,
  crossmatch_rows: crossmatchRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 for package intake; Agent 1/Agent 2 for direct source-citation prerequisites; A07 for approval; A06 evidence/validator production only.',
    next_safe_action:
      'Use this crossmatch to route the 5 direct rows through the existing Agent 2 direct source-citation intake contract and preserve exact blockers for the 9 A06-boundary rows until row-level downstream consumption or changed prerequisites exist.',
    stop_condition:
      'Stop at downstream intake coverage evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.',
  },
};

writeJson(options.output, artifact);
writeText(options.report, renderReport(artifact));

console.log(
  `Agent 3 bridge-gap downstream intake coverage crossmatch written: rows=${counts.crossmatch_rows} directMatched=${counts.direct_overlay_rows_matched_agent2_contract} a06Missing=${counts.a06_overlay_row_level_downstream_missing_rows}`,
);

function buildExactBlocker({ isDirectWorkset, directContractMatchStatus, rowLevelOverlayConsumedByPreboundary }) {
  if (isDirectWorkset && directContractMatchStatus === 'matched_agent2_direct_source_citation_prereq_contract') {
    return 'direct_source_citation_prereq_matched_but_source_citation_or_url_missing';
  }
  if (isDirectWorkset) return 'direct_source_citation_prereq_missing_agent2_contract_match';
  if (!rowLevelOverlayConsumedByPreboundary) {
    return 'a06_evidence_boundary_overlay_not_row_level_consumed_downstream_prereqs_missing';
  }
  return 'a06_evidence_boundary_overlay_consumed_but_still_blocked_no_approval';
}

function buildNextSafeAction({ isDirectWorkset, isA06Workset, exactBlocker, queueId }) {
  if (isDirectWorkset) {
    return `${queueId}: direct row is present in Agent 2 direct source-citation intake, but source_citation_or_url and transform prerequisites remain missing; preserve ${exactBlocker}.`;
  }
  if (isA06Workset) {
    return `${queueId}: A06-boundary overlay row has broad Agent 10 context only, not row-level downstream overlay consumption; preserve ${exactBlocker} and route approval questions to A07.`;
  }
  return `${queueId}: preserve ${exactBlocker} until an exact downstream intake row exists.`;
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
      direct_contract_matched_rows: 0,
      a06_row_level_downstream_missing_rows: 0,
      evidence_role: 'downstream_intake_coverage_crossmatch_summary_navigation_only_no_acceptance_claim',
    };
    existing.rows += 1;
    existing.occurrences += Number(row.occurrences || 0);
    existing.source_rid_links += Number(row.source_rid_link_count || 0);
    existing.direct_contract_matched_rows +=
      row.direct_contract_match_status === 'matched_agent2_direct_source_citation_prereq_contract' ? 1 : 0;
    existing.a06_row_level_downstream_missing_rows +=
      row.downstream_workset === 'a06_evidence_boundary_prereq_workset' &&
      !row.agent10_preboundary_row_level_overlay_consumed
        ? 1
        : 0;
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.rows - a.rows || String(a[label]).localeCompare(String(b[label]), 'en'));
}

function renderReport(artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Bridge-Gap Downstream Intake Coverage Crossmatch',
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
    `- Route overlay: ${artifact.inputs.route_overlay}`,
    `- Agent 2 direct intake contract: ${artifact.inputs.agent2_direct_intake_contract}`,
    `- Agent 2 direct intake validation: ${artifact.inputs.agent2_direct_intake_validation}`,
    `- Agent 10 source-citation workset: ${artifact.inputs.agent10_source_citation_workset}`,
    `- Agent 10 preboundary packet: ${artifact.inputs.agent10_preboundary_packet}`,
    `- Agent 10 Agent 6 verdict consumption: ${artifact.inputs.agent10_agent6_verdict_consumption}`,
    `- Agent 4 A07 route correction receipt: ${artifact.inputs.agent4_a07_route_correction_receipt}`,
    '',
    '## Counts',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Crossmatch rows | ${c.crossmatch_rows} |`,
    `| Crossmatch occurrences | ${c.crossmatch_occurrences} |`,
    `| Source-RID links | ${c.source_rid_links} |`,
    `| Direct overlay rows | ${c.direct_overlay_rows} |`,
    `| Direct rows matched to Agent 2 contract | ${c.direct_overlay_rows_matched_agent2_contract} |`,
    `| Direct rows missing Agent 2 contract match | ${c.direct_overlay_rows_missing_agent2_contract_match} |`,
    `| Direct source-citation missing rows | ${c.direct_overlay_source_citation_missing_rows} |`,
    `| A06 overlay rows | ${c.a06_overlay_rows} |`,
    `| A06 row-level downstream consumed rows | ${c.a06_overlay_row_level_downstream_consumed_rows} |`,
    `| A06 row-level downstream missing rows | ${c.a06_overlay_row_level_downstream_missing_rows} |`,
    `| Broad Agent 10 source-citation context rows | ${c.broad_agent10_source_citation_workset_context_rows} |`,
    `| Broad Agent 10 preboundary context rows | ${c.broad_agent10_preboundary_context_rows} |`,
    `| A07 route-correction present rows | ${c.a07_route_correction_present_rows} |`,
    `| A06 approval-requested rows | ${c.a06_approval_requested_rows} |`,
    `| Acceptance claims | ${c.acceptance_claims} |`,
    '',
    '## Workset Coverage',
    '',
    '| Workset | Rows | Occurrences | Source-RID links | Direct matches | A06 row-level missing |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.downstream_workset_rows.map(
      (row) =>
        `| ${row.downstream_workset} | ${row.rows} | ${row.occurrences} | ${row.source_rid_links} | ${row.direct_contract_matched_rows} | ${row.a06_row_level_downstream_missing_rows} |`,
    ),
    '',
    '## Exact Blockers',
    '',
    '| Blocker | Rows | Occurrences | Source-RID links |',
    '| --- | ---: | ---: | ---: |',
    ...artifact.exact_blocker_rows.map(
      (row) => `| ${row.exact_blocker} | ${row.rows} | ${row.occurrences} | ${row.source_rid_links} |`,
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch.mjs [--route-overlay=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--route-overlay=')) parsed.routeOverlay = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--agent2-direct-intake-contract=')) parsed.agent2DirectIntakeContract = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--agent2-direct-intake-validation=')) parsed.agent2DirectIntakeValidation = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--agent10-source-citation-workset=')) parsed.agent10SourceCitationWorkset = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--agent10-preboundary-packet=')) parsed.agent10PreboundaryPacket = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--agent10-agent6-verdict-consumption=')) parsed.agent10Agent6VerdictConsumption = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else if (arg.startsWith('--agent4-a07-route-correction-receipt=')) parsed.agent4A07RouteCorrectionReceipt = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
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

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
