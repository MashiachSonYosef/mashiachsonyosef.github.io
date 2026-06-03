#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent10-agent1-ready-orot-dry-run-source-license-display-review-request-2026-06-03.json';
const outputMd = 'reports/agent10-agent1-ready-orot-dry-run-source-license-display-review-request-2026-06-03.md';

const patchPath = 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json';
const patchMdPath = 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.md';
const dryRunPath = 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.json';
const dryRunMdPath = 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.md';
const agent13PolicyPath = 'reports/agent13-orot-reader-hint-candidate-label-policy-decision-2026-06-03.md';
const agent6VerdictPath = 'reports/agent6-orot-reader-hint-candidate-patch-verdict-2026-06-03.md';
const agent6VerdictJsonPath = 'reports/agent6-orot-reader-hint-candidate-patch-verdict-2026-06-03.json';
const agent8DryRunDeliveryPath = 'reports/agent8-agent2-orot-zero-safe-dry-run-delivery-proof-2026-06-03.md';
const callbackBlockerPath = 'reports/agent10-agent8-direct-callback-delivery-blocker-orot-sefaria-matrix-2026-06-03.md';

const patch = readJson(patchPath);
const dryRun = readJson(dryRunPath);
const rows = patch.candidate_patch_rows || [];

const rowReviewRequests = rows.map(toRowReviewRequest);
const sourceRowRequests = buildSourceRowRequests(rows);
const sourceFamilyRequests = buildSourceFamilyRequests(sourceRowRequests);
const labelCounts = countBy(rowReviewRequests, (row) => row.candidate_label);
const sourceContractCounts = countBy(rowReviewRequests, (row) => row.source_contract);
const selectedRouteFamilyCounts = countBy(rowReviewRequests, (row) => row.selected.route_family);
const selectedSourceBucketCounts = countSelectedSourceBuckets(rowReviewRequests);

const selectedSourceRowAppearances = rows.reduce((sum, row) => sum + (row.candidate_counterpart?.selected_source_rows || []).length, 0);
const competingSourceRowAppearances = rows.reduce((sum, row) => {
  return sum + (row.competing_edges || []).reduce((edgeSum, edge) => edgeSum + (edge.upstream_source_rows || []).length, 0);
}, 0);
const selectedOccurrenceTotal = rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);

const report = {
  schema_version: 1,
  artifact_type: 'agent10_agent1_ready_orot_dry_run_source_license_display_review_request',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_agent1_orot_dry_run_source_license_display_review_request.mjs',
  boundary: {
    status: 'agent1_row_level_source_license_display_review_request_not_accepted',
    evidence_only: true,
    request_only: true,
    row_level_review_request_only: true,
    exact_dry_run_boundary_only: true,
    no_license_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_answer_acceptance: true,
    no_answer_rows: true,
    no_answer_candidates_emitted: true,
    no_answer_eligibility_change: true,
    no_source_rows_emitted: true,
    no_lexicon_entry_id_assignment: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_runtime_mutation: true,
    no_source_mutation: true,
    no_publication_readiness: true,
    no_qa_acceptance: true,
  },
  inputs: buildInputs(),
  outputs: {
    json_report: outputJson,
    markdown_report: outputMd,
    answer_rows: 0,
    answer_candidate_rows: 0,
    source_rows: 0,
    lexicon_entry_id_assignments: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    runtime_files_touched: [],
    source_files_touched: [],
    token_index_files_touched: [],
    lexical_payload_files_touched: [],
  },
  summary: {
    status: 'agent1_row_level_source_license_display_review_request_not_accepted',
    target_work: 'orot',
    target_route: 'orot/',
    candidate_rows: rows.length,
    candidate_occurrences: selectedOccurrenceTotal,
    prefix_stem_rows: labelCounts['counterpart candidate'] || 0,
    project_preferred_rows: labelCounts['project-preferred counterpart candidate'] || 0,
    selected_source_row_appearances: selectedSourceRowAppearances,
    competing_source_row_appearances: competingSourceRowAppearances,
    unique_source_rows_for_review: sourceRowRequests.length,
    source_family_requests: sourceFamilyRequests.length,
    source_contract_counts: sourceContractCounts,
    selected_route_family_counts: selectedRouteFamilyCounts,
    selected_source_bucket_counts: selectedSourceBucketCounts,
    blockers_inside_dry_run: dryRun.zero_or_safe_result?.blocker_count ?? null,
    answer_rows_emitted: 0,
    answer_candidate_rows_emitted: 0,
    source_rows_emitted: 0,
    lexicon_entry_ids_assigned: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    runtime_files_touched: 0,
    source_files_touched: 0,
    issues: 0,
    warnings: 1,
  },
  requested_agent1_review_schema: {
    target_agent: 'Agent 1',
    required_status_values: [
      'cleared_for_non_authoritative_candidate_display_and_storage',
      'cleared_for_metadata_only',
      'cleared_for_external_link_or_citation_only',
      'blocked_license_or_attribution_gap',
      'blocked_source_custody_gap',
      'blocked_text_display_gap',
      'blocked_project_rule_custody_gap',
    ],
    required_row_fields: [
      'token_id',
      'surface',
      'normalized',
      'occurrences',
      'candidate_label',
      'candidate_display_preview',
      'selected_source_rows',
      'competing_source_rows',
      'agent1_status',
      'storage_allowed',
      'display_allowed',
      'metadata_only_allowed',
      'external_link_only_allowed',
      'required_attribution',
      'source_manifest_requirement',
      'exact_blocker_if_blocked',
    ],
    required_source_row_fields: [
      'source_row',
      'source_bucket',
      'observed_license',
      'roles',
      'token_ids',
      'agent1_status',
      'required_attribution',
      'source_manifest_requirement',
      'exact_blocker_if_blocked',
    ],
  },
  source_family_requests: sourceFamilyRequests,
  row_review_requests: rowReviewRequests,
  source_row_review_requests: sourceRowRequests,
  sequencing: {
    current_bottleneck: 'Agent 1 bounded row-level source/license display review for the exact 31-row dry-run package.',
    route_now: 'Route this packet to Agent 1 through Agent 8 or the active manager channel.',
    agent2_after_agent1: 'Agent 2 may only produce a new zero-or-safe candidate package over rows cleared by Agent 1 and later Agent 6/13 boundaries.',
    agent6_after_agent1: 'Agent 6 should review Agent 1 row-level source/license display posture before any public mutation or answer-eligibility change.',
    agent4_boundary: 'Agent 4 remains frozen until Agent 10 has a changed public/runtime candidate package.',
  },
  agent8_callback: {
    status: 'Agent 1-ready Orot 31-row dry-run source/license display review request produced.',
    artifact_path: outputMd,
    artifact_json: outputJson,
    current_bottleneck: 'Agent 1 row-level source/license display posture for exact Agent 2 dry-run rows.',
    next_executable_route: 'Route this packet to Agent 1 for bounded row-level source/license display review; hold Agent 4 and public mutation until Agent 1 and Agent 6 return.',
    agent1_needed: true,
    agent2_needed_now: false,
    agent4_needed_now: false,
    agent6_needed_after_agent1: true,
    agent7_or_13_decision_needed_now: false,
    direct_callback_delivery: {
      status: 'Agent 8 direct callback delivery unavailable; callback requires relay.',
      target_thread_id: '019e83a3-314c-7c43-9ec9-d56315813437',
      callback_text: [
        '<codex_delegation>',
        '  <source_thread_id>019e85ac-94ff-7a00-8aef-3dffdbe3c657</source_thread_id>',
        '  <input>## Agent 8 Callback',
        '',
        `Status: Agent 1-ready Orot 31-row dry-run source/license display review request produced.`,
        `Artifact path: ${outputMd}`,
        `Artifact JSON: ${outputJson}`,
        'Current bottleneck: Agent 1 row-level source/license display posture for exact Agent 2 dry-run rows.',
        'Next executable route: Route this packet to Agent 1 for bounded row-level source/license display review; hold Agent 4 and public mutation until Agent 1 and Agent 6 return.',
        'Stop condition: Stop after Agent 1 returns row-level statuses or an exact blocker for the 31-row dry-run package.',
        'Highest permissible claim: Agent 10 Agent 1-ready row-level review request produced; no acceptance claims.',
        'What must not be accepted: no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.</input>',
        '</codex_delegation>',
      ].join('\n'),
    },
  },
  warnings: [
    {
      code: 'direct_agent8_callback_delivery_unavailable',
      message: 'Agent 8 direct callback delivery unavailable; callback requires relay.',
      blocker_path: callbackBlockerPath,
    },
  ],
  what_must_not_be_accepted: [
    'QA acceptance',
    'Source/provenance acceptance',
    'License acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Answer acceptance',
    'Public/runtime acceptance',
    'Publication readiness',
    'Route publication support',
    'Product/data acceptance',
    'Translation output',
    'Accepted gloss',
    'Accepted text',
    'Public HUD mutation',
    'Route JSONL mutation',
    'Orot HTML/runtime mutation',
  ],
};

writeJson(outputJson, report);
writeMarkdown(outputMd, report);

console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);

function toRowReviewRequest(row) {
  const counterpart = row.candidate_counterpart || {};
  const selectedRows = counterpart.selected_source_rows || [];
  const competingEdges = row.competing_edges || [];
  const selectedSources = selectedRows.map(parseSourceRow);
  const competingSourceRows = competingEdges.flatMap((edge) => edge.upstream_source_rows || []);
  return {
    token_id: row.target_token_id,
    lexicon_entry_id: row.target_lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    candidate_label: counterpart.label,
    label_status: counterpart.label_status,
    match_percent: counterpart.match_percent,
    match_percent_status: counterpart.match_percent_status,
    candidate_display_preview: counterpart.display,
    selection_basis: row.selection_basis,
    source_contract: row.source_contract,
    source_contract_path: row.source_contract_path,
    source_contract_status: row.source_contract_status,
    selected: {
      claim_id: counterpart.selected_claim_id,
      claim_file: counterpart.selected_claim_file,
      route_family: counterpart.selected_route_family,
      route_type: counterpart.selected_route_type,
      selected_surface: counterpart.selected_surface,
      selected_normalized: counterpart.selected_normalized,
      source_rows: selectedRows,
      source_buckets: [...new Set(selectedSources.map((source) => source.source_bucket))],
      observed_licenses: [...new Set(selectedSources.map((source) => source.observed_license))],
    },
    competing_edges: competingEdges.map((edge) => ({
      upstream_claim_id: edge.upstream_claim_id,
      upstream_claim_file: edge.upstream_claim_file,
      relation: edge.relation,
      upstream_route_family: edge.upstream_route_family,
      upstream_route_type: edge.upstream_route_type,
      upstream_surface: edge.upstream_surface,
      upstream_normalized: edge.upstream_normalized,
      counterpart_candidate_display_preview: edge.counterpart_candidate_display,
      upstream_source_rows: edge.upstream_source_rows || [],
      promote_to_answer: edge.promote_to_answer === true,
    })),
    requested_agent1_review: {
      question: 'State whether this non-authoritative candidate display and its selected source rows may be stored/displayed later, metadata-only, external-link-only, or blocked; include attribution and manifest requirements.',
      row_review_required_before_public_mutation: true,
      source_license_display_review_required: true,
      competing_edge_custody_review_required: competingSourceRows.length > 0,
      mutation_allowed_here: false,
      public_emit_allowed_here: false,
      answer_eligibility_allowed_here: false,
      source_custody_accepted_here: false,
      license_accepted_here: false,
    },
    future_write_if_later_approved: {
      path: row.would_write_if_approved_later?.path || null,
      operation: row.would_write_if_approved_later?.operation || null,
      key: row.would_write_if_approved_later?.key || null,
      allowed_now: false,
    },
  };
}

function buildSourceRowRequests(inputRows) {
  const bySource = new Map();
  for (const row of inputRows) {
    for (const sourceRow of row.candidate_counterpart?.selected_source_rows || []) {
      addSourceRole(bySource, sourceRow, 'selected', row);
    }
    for (const edge of row.competing_edges || []) {
      for (const sourceRow of edge.upstream_source_rows || []) {
        addSourceRole(bySource, sourceRow, 'competing', row);
      }
    }
  }
  return [...bySource.values()]
    .map((entry) => ({
      source_row: entry.source_row,
      ...parseSourceRow(entry.source_row),
      roles: [...entry.roles].sort(),
      token_ids: [...entry.token_ids].sort(),
      surfaces: [...entry.surfaces].sort(),
      selected_occurrence_weight: entry.selected_occurrence_weight,
      requested_agent1_status: defaultRequestedStatus(entry.source_row),
      requested_review: 'Confirm source custody, storage/display allowance, attribution requirement, source-manifest requirement, and exact blocker if not displayable.',
      mutation_allowed_here: false,
      public_emit_allowed_here: false,
      answer_eligibility_allowed_here: false,
    }))
    .sort((a, b) => a.source_row.localeCompare(b.source_row));
}

function addSourceRole(map, sourceRow, role, row) {
  if (!map.has(sourceRow)) {
    map.set(sourceRow, {
      source_row: sourceRow,
      roles: new Set(),
      token_ids: new Set(),
      surfaces: new Set(),
      selected_occurrence_weight: 0,
    });
  }
  const entry = map.get(sourceRow);
  entry.roles.add(role);
  entry.token_ids.add(row.target_token_id);
  entry.surfaces.add(row.surface);
  if (role === 'selected') entry.selected_occurrence_weight += Number(row.occurrences || 0);
}

function buildSourceFamilyRequests(sourceRows) {
  const byBucket = new Map();
  for (const row of sourceRows) {
    const key = `${row.source_bucket}|${row.observed_license}`;
    if (!byBucket.has(key)) {
      byBucket.set(key, {
        source_bucket: row.source_bucket,
        source_family: row.source_family,
        observed_license: row.observed_license,
        requested_default_status: defaultRequestedStatus(row.source_row),
        unique_source_rows: 0,
        selected_source_rows: 0,
        competing_source_rows: 0,
        selected_occurrence_weight: 0,
        token_ids: new Set(),
        request: familyRequestText(row.source_bucket),
      });
    }
    const entry = byBucket.get(key);
    entry.unique_source_rows += 1;
    if (row.roles.includes('selected')) entry.selected_source_rows += 1;
    if (row.roles.includes('competing')) entry.competing_source_rows += 1;
    entry.selected_occurrence_weight += row.selected_occurrence_weight || 0;
    for (const tokenId of row.token_ids || []) entry.token_ids.add(tokenId);
  }
  return [...byBucket.values()]
    .map((entry) => ({
      ...entry,
      token_count: entry.token_ids.size,
      token_ids: [...entry.token_ids].sort(),
      answer_rows_allowed_now: false,
      public_hud_rows_allowed_now: false,
      route_jsonl_rows_allowed_now: false,
    }))
    .sort((a, b) => a.source_bucket.localeCompare(b.source_bucket));
}

function parseSourceRow(sourceRow) {
  const [source_family = '', source_id = '', observed_license = ''] = String(sourceRow).split('|');
  let source_bucket = source_family;
  if (source_family === 'kaikki') source_bucket = 'kaikki_wiktionary';
  if (source_family === 'openscriptures') source_bucket = 'openscriptures';
  if (source_family === 'workspace' && source_id.startsWith('project-function-word:')) source_bucket = 'workspace_project_function_word';
  if (source_family === 'workspace' && source_id.startsWith('grammar-particle:')) source_bucket = 'workspace_project_grammar_particle';
  return { source_family, source_id, observed_license, source_bucket };
}

function defaultRequestedStatus(sourceRow) {
  const source = parseSourceRow(sourceRow);
  if (source.source_bucket === 'kaikki_wiktionary') return 'needs_agent1_license_attribution_display_review';
  if (source.source_bucket === 'openscriptures') return 'needs_agent1_cc_by_attribution_display_review';
  if (source.source_bucket === 'workspace_project_function_word') return 'needs_agent1_project_authored_cc0_custody_review';
  if (source.source_bucket === 'workspace_project_grammar_particle') return 'needs_agent1_project_rule_custody_review';
  return 'needs_agent1_source_license_display_review';
}

function familyRequestText(sourceBucket) {
  const requests = {
    kaikki_wiktionary: 'Review whether CC BY-SA 4.0 / GFDL Kaikki/Wiktionary-derived candidate text may be stored/displayed as non-authoritative reader-hint candidate text, and state attribution/share-alike/manifest requirements.',
    openscriptures: 'Review whether CC BY 4.0 OpenScriptures-derived candidate text may be stored/displayed as non-authoritative reader-hint candidate text, and state attribution/manifest requirements.',
    workspace_project_function_word: 'Review whether project-authored CC0 function-word rows have sufficient custody/manifest evidence for later non-authoritative candidate display.',
    workspace_project_grammar_particle: 'Review whether workspace grammar-particle lexical rule rows have sufficient project custody/manifest evidence for later non-authoritative candidate display.',
  };
  return requests[sourceBucket] || 'Review source/license/display posture for this source family.';
}

function countSelectedSourceBuckets(inputRows) {
  const counts = {};
  for (const row of inputRows) {
    for (const bucket of row.selected.source_buckets || []) counts[bucket] = (counts[bucket] || 0) + 1;
  }
  return counts;
}

function countBy(items, fn) {
  const counts = {};
  for (const item of items) {
    const key = fn(item) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function buildInputs() {
  const inputs = {
    candidate_patch: patchPath,
    candidate_patch_sha256: sha256(patchPath),
    candidate_patch_report: patchMdPath,
    candidate_patch_report_sha256: sha256(patchMdPath),
    dry_run: dryRunPath,
    dry_run_sha256: sha256(dryRunPath),
    dry_run_report: dryRunMdPath,
    dry_run_report_sha256: sha256(dryRunMdPath),
    agent13_policy_decision: agent13PolicyPath,
    agent13_policy_decision_sha256: sha256(agent13PolicyPath),
    agent6_warn_boundary: agent6VerdictPath,
    agent6_warn_boundary_sha256: sha256(agent6VerdictPath),
    agent6_warn_boundary_json: agent6VerdictJsonPath,
    agent6_warn_boundary_json_sha256: sha256(agent6VerdictJsonPath),
  };
  for (const optionalPath of [agent8DryRunDeliveryPath, callbackBlockerPath]) {
    if (fs.existsSync(path.join(root, optionalPath))) {
      const key = path.basename(optionalPath, path.extname(optionalPath)).replaceAll('-', '_');
      inputs[key] = optionalPath;
      inputs[`${key}_sha256`] = sha256(optionalPath);
    }
  }
  return inputs;
}

function writeMarkdown(relativePath, data) {
  const lines = [];
  lines.push('# Agent 10 Agent 1-Ready Orot Dry-Run Source/License Display Review Request');
  lines.push('');
  lines.push(`Generated: ${data.generated_at}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('- Evidence-only request packet for Agent 1 row-level source/license/display review.');
  lines.push('- Scope is exactly the 31-row Agent 2 Orot reader-hint dry-run package.');
  lines.push('- This packet does not accept license, source custody, source provenance, definitions, answers, QA, public/runtime state, or publication readiness.');
  lines.push('- It emits zero answer rows, source rows, public HUD rows, route JSONL rows, source mutations, runtime mutations, token-index mutations, and lexical payload mutations.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Status: ${data.summary.status}`);
  lines.push(`- Candidate rows / occurrences: ${data.summary.candidate_rows} / ${data.summary.candidate_occurrences}`);
  lines.push(`- Prefix/stem rows: ${data.summary.prefix_stem_rows}`);
  lines.push(`- Project-preferred rows: ${data.summary.project_preferred_rows}`);
  lines.push(`- Selected source-row appearances: ${data.summary.selected_source_row_appearances}`);
  lines.push(`- Competing source-row appearances: ${data.summary.competing_source_row_appearances}`);
  lines.push(`- Unique source rows for Agent 1 review: ${data.summary.unique_source_rows_for_review}`);
  lines.push(`- Source-family request groups: ${data.summary.source_family_requests}`);
  lines.push(`- Dry-run blockers: ${data.summary.blockers_inside_dry_run}`);
  lines.push(`- Answer rows emitted: ${data.summary.answer_rows_emitted}`);
  lines.push(`- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`);
  lines.push(`- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`);
  lines.push(`- Runtime files touched: ${data.summary.runtime_files_touched}`);
  lines.push(`- Source files touched: ${data.summary.source_files_touched}`);
  lines.push('');
  lines.push('## Source Family Requests');
  lines.push('');
  lines.push('| Source Bucket | Observed License | Unique Source Rows | Selected Rows | Competing Rows | Selected Occurrence Weight | Requested Status |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | --- |');
  for (const row of data.source_family_requests) {
    lines.push(`| ${row.source_bucket} | ${row.observed_license} | ${row.unique_source_rows} | ${row.selected_source_rows} | ${row.competing_source_rows} | ${row.selected_occurrence_weight} | ${row.requested_default_status} |`);
  }
  lines.push('');
  lines.push('## Requested Agent 1 Schema');
  lines.push('');
  lines.push('- Status values: ' + data.requested_agent1_review_schema.required_status_values.map((value) => `\`${value}\``).join(', '));
  lines.push('- Row fields: ' + data.requested_agent1_review_schema.required_row_fields.map((value) => `\`${value}\``).join(', '));
  lines.push('- Source-row fields: ' + data.requested_agent1_review_schema.required_source_row_fields.map((value) => `\`${value}\``).join(', '));
  lines.push('');
  lines.push('## Row Review Boundary');
  lines.push('');
  lines.push('| Token | Surface | Occurrences | Label | Selected Source Buckets | Selected Source Rows | Competing Source Rows |');
  lines.push('| --- | --- | ---: | --- | --- | ---: | ---: |');
  for (const row of data.row_review_requests) {
    const selectedRows = row.selected.source_rows.length;
    const competingRows = row.competing_edges.reduce((sum, edge) => sum + edge.upstream_source_rows.length, 0);
    lines.push(`| ${row.token_id} | ${row.surface} | ${row.occurrences} | ${row.candidate_label} | ${row.selected.source_buckets.join(', ')} | ${selectedRows} | ${competingRows} |`);
  }
  lines.push('');
  lines.push('## Agent 8 Callback');
  lines.push('');
  lines.push(`- Status: ${data.agent8_callback.status}`);
  lines.push(`- Artifact path: ${data.agent8_callback.artifact_path}`);
  lines.push(`- Artifact JSON: ${data.agent8_callback.artifact_json}`);
  lines.push(`- Current bottleneck: ${data.agent8_callback.current_bottleneck}`);
  lines.push(`- Next executable route: ${data.agent8_callback.next_executable_route}`);
  lines.push(`- Agent 1 needed: ${data.agent8_callback.agent1_needed}`);
  lines.push(`- Agent 2 needed now: ${data.agent8_callback.agent2_needed_now}`);
  lines.push(`- Agent 4 needed now: ${data.agent8_callback.agent4_needed_now}`);
  lines.push(`- Agent 6 needed after Agent 1: ${data.agent8_callback.agent6_needed_after_agent1}`);
  lines.push(`- Agent 7/13 decision needed now: ${data.agent8_callback.agent7_or_13_decision_needed_now}`);
  lines.push(`- Direct callback delivery: ${data.agent8_callback.direct_callback_delivery.status}`);
  lines.push('');
  lines.push('## Direct Callback Relay Text');
  lines.push('');
  lines.push('```xml');
  lines.push(data.agent8_callback.direct_callback_delivery.callback_text);
  lines.push('```');
  lines.push('');
  lines.push('## Sequencing');
  lines.push('');
  lines.push(`- Current bottleneck: ${data.sequencing.current_bottleneck}`);
  lines.push(`- Route now: ${data.sequencing.route_now}`);
  lines.push(`- Agent 2 after Agent 1: ${data.sequencing.agent2_after_agent1}`);
  lines.push(`- Agent 6 after Agent 1: ${data.sequencing.agent6_after_agent1}`);
  lines.push(`- Agent 4 boundary: ${data.sequencing.agent4_boundary}`);
  lines.push('');
  lines.push('## Warnings');
  lines.push('');
  for (const warning of data.warnings) lines.push(`- ${warning.code}: ${warning.message}`);
  lines.push('');
  lines.push('## What Must Not Be Accepted');
  lines.push('');
  for (const item of data.what_must_not_be_accepted) lines.push(`- ${item}`);
  lines.push('');
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}
