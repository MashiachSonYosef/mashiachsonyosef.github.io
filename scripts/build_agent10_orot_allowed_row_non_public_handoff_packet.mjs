#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-allowed-row-non-public-handoff-packet-2026-06-03.json';
const outputMd = 'reports/agent10-orot-allowed-row-non-public-handoff-packet-2026-06-03.md';

const inputs = {
  allowed_package: 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json',
  allowed_package_report: 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.md',
  allowed_package_verdict: 'reports/agent6-orot-allowed-row-reader-hint-package-verdict-2026-06-03.json',
  allowed_package_verdict_report: 'reports/agent6-orot-allowed-row-reader-hint-package-verdict-2026-06-03.md',
  source_license_review: 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json',
  source_license_review_report: 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.md',
  original_dry_run: 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.json',
  original_patch: 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json',
  agent13_policy: 'reports/agent13-orot-reader-hint-candidate-label-policy-decision-2026-06-03.md',
  nc_policy_callback: 'reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md',
};

const allowedPackage = readJson(inputs.allowed_package);
const verdict = readJson(inputs.allowed_package_verdict);
const sourceReview = readJson(inputs.source_license_review);

const includedRows = allowedPackage.included_rows || allowedPackage.includedRows || allowedPackage.package_rows || [];
const excludedRows = allowedPackage.excluded_rows || allowedPackage.excludedRows || [];
if (!includedRows.length && Array.isArray(allowedPackage.rows)) {
  for (const row of allowedPackage.rows) {
    if (row.package_status === 'included' || row.included === true) includedRows.push(row);
    else if (row.package_status === 'excluded' || row.excluded === true) excludedRows.push(row);
  }
}

const packageSummary = allowedPackage.summary || {};
const dryRunScope = allowedPackage.dry_run_scope || {};
const includedCount = packageSummary.included_rows ?? dryRunScope.included_rows ?? includedRows.length;
const includedOccurrences = packageSummary.included_occurrences ?? dryRunScope.included_occurrences ?? sumOccurrences(includedRows);
const excludedCount = packageSummary.excluded_rows ?? dryRunScope.excluded_rows ?? excludedRows.length;
const excludedOccurrences = packageSummary.excluded_occurrences ?? dryRunScope.excluded_occurrences ?? sumOccurrences(excludedRows);

const packageRows = includedRows.map((row) => ({
  token_id: row.token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  label: row.candidate_label || row.label,
  label_status: row.label_status,
  selected_route_family: row.selected?.route_family || row.selected_route_family,
  selected_source_rows: row.selected?.source_rows || row.selected_source_rows || [],
  match_percent: row.match_percent ?? null,
  match_percent_status: row.match_percent_status || 'not_available_in_contract_inputs',
  answer_eligible: false,
  promote_to_answer: false,
  approved_for_public_emit: false,
  public_emit_ready: false,
  public_mutation_allowed_here: false,
  runtime_mutation_allowed_here: false,
}));

const excludedPackageRows = excludedRows.map((row) => ({
  token_id: row.token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  status: row.status || row.agent1_status || row.exclusion_status,
  selected_source_rows: row.selected?.source_rows || row.selected_source_rows || [],
  exclusion_reason: row.reason || row.exclusion_reason || row.exact_blocker_if_display_or_storage || 'excluded under Agent 1/6 boundary',
  public_mutation_allowed_here: false,
  candidate_text_storage_display_allowed_here: false,
}));

const handoff = {
  schema_version: 1,
  artifact_type: 'agent10_orot_allowed_row_non_public_handoff_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_allowed_row_non_public_handoff_packet.mjs',
  boundary: {
    status: 'non_public_handoff_packet_only',
    evidence_only: true,
    planning_only: true,
    exact_allowed_row_boundary_only: true,
    no_public_mutation: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_answer_rows: true,
    no_source_rows_emitted: true,
    no_runtime_mutation: true,
    no_source_mutation: true,
    no_token_index_mutation: true,
    no_lexical_payload_mutation: true,
    no_answer_eligibility_change: true,
    no_qa_acceptance: true,
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_acceptance: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_route_publication_support: true,
    no_product_data_acceptance: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_text: true,
  },
  inputs: withHashes(inputs),
  summary: {
    status: 'non_public_handoff_packet_only',
    disposition_basis: verdict.disposition || verdict.summary?.disposition || 'warn_accepted',
    included_rows: includedCount,
    included_occurrences: includedOccurrences,
    excluded_rows: excludedCount,
    excluded_occurrences: excludedOccurrences,
    original_rows: (sourceReview.summary?.candidate_rows || 31),
    original_occurrences: (sourceReview.summary?.candidate_occurrences || 1202),
    public_mutation_allowed: false,
    agent4_ready: false,
    next_non_public_step_allowed: true,
    next_public_step_allowed: false,
    nc_policy_recorded_for_future_matrix: fs.existsSync(path.join(root, inputs.nc_policy_callback)),
  },
  included_package_rows: packageRows,
  excluded_rows: excludedPackageRows,
  release_owner_next_gates: [
    {
      gate: 'non_public_handoff_review',
      owner: 'Agent 10 / Agent 8 chain',
      status: 'ready_with_this_packet',
      requirement: 'Confirm whether to prepare a later changed candidate package from these 20 rows only.',
    },
    {
      gate: 'agent13_or_user_public_mutation_decision',
      owner: 'Agent 13 / user',
      status: 'required_before_public_mutation',
      requirement: 'Explicitly authorize any public Orot mutation or expansion beyond non-public evidence packets.',
    },
    {
      gate: 'agent6_changed_package_review',
      owner: 'Agent 6',
      status: 'required_if_a_changed_public_or_runtime_package_is_created',
      requirement: 'Review exact changed package before Agent 4/browser proof or public mutation.',
    },
    {
      gate: 'agent4_runtime_proof',
      owner: 'Agent 4',
      status: 'held',
      requirement: 'Wake only after an exact changed public/runtime package exists.',
    },
  ],
  future_nc_lane: {
    status: 'recorded_for_future_measurement_only',
    policy_callback: inputs.nc_policy_callback,
    next_allowed_action: 'Build bounded NC-aware Orot/Sefaria family matrix update and coverage measurement request for Agent 1/6.',
    current_package_impact: 'none',
    no_nc_definition_content_storage: true,
    no_license_acceptance: true,
    no_public_mutation: true,
  },
  agent8_callback: {
    status: 'Agent 10 non-public Orot allowed-row handoff packet produced.',
    artifact_path: outputMd,
    artifact_json: outputJson,
    included_rows: includedCount,
    included_occurrences: includedOccurrences,
    excluded_rows: excludedCount,
    excluded_occurrences: excludedOccurrences,
    next_executable_route: 'Use this packet to decide whether to authorize a later changed non-public candidate package for the 20 included rows only; public mutation and Agent 4 remain blocked until a changed public/runtime package is authorized and reviewed.',
    public_mutation_blocked: true,
    agent4_remains_held: true,
    nc_lane_next: 'Separate future bounded NC-aware matrix/coverage request; do not mix into this 20-row package.',
  },
  outputs: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    runtime_files_touched: [],
    source_files_touched: [],
    token_index_files_touched: [],
    lexical_payload_files_touched: [],
  },
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
  ],
};

writeJson(outputJson, handoff);
writeMarkdown(outputMd, handoff);
console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);

function writeMarkdown(relativePath, data) {
  const lines = [];
  lines.push('# Agent 10 Orot Allowed-Row Non-Public Handoff Packet');
  lines.push('');
  lines.push(`Generated: ${data.generated_at}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('This is a non-public release-owner handoff/planning packet only. It does not mutate public Orot assets, route shards, runtime files, source files, token indexes, or lexical payloads.');
  lines.push('');
  lines.push('It does not accept QA, source/provenance, license posture, Definition authority, usage-as-definition authority, answer eligibility, public/runtime behavior, publication readiness, route publication support, product/data status, translation output, accepted gloss, or accepted text.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Disposition basis: \`${data.summary.disposition_basis}\`.`);
  lines.push(`- Included rows / occurrences: \`${data.summary.included_rows}\` / \`${data.summary.included_occurrences}\`.`);
  lines.push(`- Excluded rows / occurrences: \`${data.summary.excluded_rows}\` / \`${data.summary.excluded_occurrences}\`.`);
  lines.push(`- Original rows / occurrences: \`${data.summary.original_rows}\` / \`${data.summary.original_occurrences}\`.`);
  lines.push(`- Public mutation allowed: \`${data.summary.public_mutation_allowed}\`.`);
  lines.push(`- Agent 4 ready: \`${data.summary.agent4_ready}\`.`);
  lines.push(`- Next non-public step allowed: \`${data.summary.next_non_public_step_allowed}\`.`);
  lines.push(`- NC policy recorded for future matrix: \`${data.summary.nc_policy_recorded_for_future_matrix}\`.`);
  lines.push('');
  lines.push('## Included Rows');
  lines.push('');
  lines.push('| Token | Surface | Occurrences | Label | Source Rows |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const row of data.included_package_rows) {
    lines.push(`| ${row.token_id} | ${row.surface} | ${row.occurrences} | ${row.label} | ${row.selected_source_rows.join('<br>')} |`);
  }
  lines.push('');
  lines.push('## Excluded Rows');
  lines.push('');
  lines.push('| Token | Surface | Occurrences | Status | Reason |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const row of data.excluded_rows) {
    lines.push(`| ${row.token_id} | ${row.surface} | ${row.occurrences} | ${row.status} | ${row.exclusion_reason} |`);
  }
  lines.push('');
  lines.push('## Next Gates');
  lines.push('');
  for (const gate of data.release_owner_next_gates) {
    lines.push(`- \`${gate.gate}\`: ${gate.status}. ${gate.requirement}`);
  }
  lines.push('');
  lines.push('## Future NC Lane');
  lines.push('');
  lines.push(`- Status: \`${data.future_nc_lane.status}\`.`);
  lines.push(`- Policy callback: \`${data.future_nc_lane.policy_callback}\`.`);
  lines.push(`- Next allowed action: ${data.future_nc_lane.next_allowed_action}`);
  lines.push(`- Current package impact: ${data.future_nc_lane.current_package_impact}.`);
  lines.push('');
  lines.push('## Agent 8 Callback');
  lines.push('');
  lines.push(`- Status: ${data.agent8_callback.status}`);
  lines.push(`- Artifact path: \`${data.agent8_callback.artifact_path}\``);
  lines.push(`- Artifact JSON: \`${data.agent8_callback.artifact_json}\``);
  lines.push(`- Included rows / occurrences: \`${data.agent8_callback.included_rows}\` / \`${data.agent8_callback.included_occurrences}\``);
  lines.push(`- Excluded rows / occurrences: \`${data.agent8_callback.excluded_rows}\` / \`${data.agent8_callback.excluded_occurrences}\``);
  lines.push(`- Next executable route: ${data.agent8_callback.next_executable_route}`);
  lines.push(`- Public mutation blocked: \`${data.agent8_callback.public_mutation_blocked}\``);
  lines.push(`- Agent 4 remains held: \`${data.agent8_callback.agent4_remains_held}\``);
  lines.push(`- NC lane next: ${data.agent8_callback.nc_lane_next}`);
  lines.push('');
  lines.push('## Outputs');
  lines.push('');
  lines.push('- Answer rows: `0`.');
  lines.push('- Source rows: `0`.');
  lines.push('- Public HUD rows: `0`.');
  lines.push('- Route JSONL rows: `0`.');
  lines.push('- Runtime/source/token-index/lexical-payload files touched: `0`.');
  lines.push('');
  lines.push('## What Must Not Be Accepted');
  lines.push('');
  for (const item of data.what_must_not_be_accepted) lines.push(`- ${item}`);
  lines.push('');
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function withHashes(inputMap) {
  const result = {};
  for (const [key, relativePath] of Object.entries(inputMap)) {
    result[key] = relativePath;
    result[`${key}_sha256`] = sha256(relativePath);
  }
  return result;
}

function sumOccurrences(rows) {
  return rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
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
