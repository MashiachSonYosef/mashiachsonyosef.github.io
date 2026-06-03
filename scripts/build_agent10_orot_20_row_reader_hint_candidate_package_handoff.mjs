#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-20-row-reader-hint-candidate-package-handoff-2026-06-03.json';
const outputMd = 'reports/agent10-orot-20-row-reader-hint-candidate-package-handoff-2026-06-03.md';

const inputs = {
  agent2_allowed_package: 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json',
  agent2_allowed_package_report: 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.md',
  agent6_allowed_package_verdict: 'reports/agent6-orot-allowed-row-reader-hint-package-verdict-2026-06-03.json',
  agent6_allowed_package_verdict_report: 'reports/agent6-orot-allowed-row-reader-hint-package-verdict-2026-06-03.md',
  agent10_prior_handoff: 'reports/agent10-orot-allowed-row-non-public-handoff-packet-2026-06-03.json',
};

const agent2Package = readJson(inputs.agent2_allowed_package);
const agent6Verdict = readJson(inputs.agent6_allowed_package_verdict);
const priorHandoff = readJson(inputs.agent10_prior_handoff);

const includedRows = agent2Package.package_rows || priorHandoff.included_package_rows || [];
const excludedRows = agent2Package.excluded_rows || priorHandoff.excluded_rows || [];

const handoff = {
  schema_version: 1,
  artifact_type: 'agent10_orot_20_row_reader_hint_candidate_package_handoff',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_20_row_reader_hint_candidate_package_handoff.mjs',
  boundary: {
    status: 'non_public_candidate_package_handoff_only',
    exact_20_row_boundary_only: true,
    planning_handoff_only: true,
    no_public_orot_asset_mutation: true,
    no_route_shard_edits: true,
    no_public_hud_output: true,
    no_route_jsonl_writes: true,
    no_orot_html_runtime_edits: true,
    no_source_mutation: true,
    no_token_index_mutation: true,
    no_lexical_payload_mutation: true,
    no_answer_eligibility: true,
    no_accepted_text: true,
    no_render_browser_public_validation: true,
    no_agent4_runtime_proof: true,
    no_top_n_expansion: true,
    no_nc_expansion_in_this_package: true,
    no_changed_public_runtime_package_claim: true,
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
  },
  inputs: withHashes(inputs),
  summary: {
    disposition_basis: agent6Verdict.disposition || 'warn_accepted',
    included_rows: includedRows.length,
    included_occurrences: sumOccurrences(includedRows),
    excluded_rows: excludedRows.length,
    excluded_occurrences: sumOccurrences(excludedRows),
    public_mutation_blocked: true,
    agent4_remains_held: true,
    changed_public_runtime_package_exists: false,
    next_route: 'Hold as non-public candidate package handoff/planning evidence. Any later public mutation requires explicit authorization, exact changed package, Agent 6 review, then Agent 4 runtime proof.',
  },
  included_rows: includedRows.map((row) => ({
    token_id: row.token_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    label: row.label || row.candidate_label,
    label_status: row.label_status,
    selected_route_family: row.selected_route_family,
    selected_source_rows: row.selected_source_rows || [],
    answer_eligible: false,
    promote_to_answer: false,
    approved_for_public_emit: false,
    public_emit_ready: false,
    public_mutation_allowed_here: false,
  })),
  excluded_rows: excludedRows.map((row) => ({
    token_id: row.token_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    exclusion_status: row.status || row.agent1_status || row.row_package_status,
    selected_source_rows: row.selected_source_rows || [],
    blocker: row.exclusion_reason || row.exact_blocker_if_display_or_storage || 'excluded under Agent 1/6 boundary',
    candidate_text_storage_display_allowed_here: false,
    public_mutation_allowed_here: false,
  })),
  required_blockers_preserved: [
    'Public mutation remains blocked.',
    '10 Kaikki/Wiktionary rows remain external-link/citation-only.',
    '1 workspace grammar-particle row remains metadata-only.',
    'No changed public/runtime package exists for Agent 4.',
    'Agent 4 remains held.',
  ],
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
  agent8_callback: {
    status: 'Agent 10 Orot 20-row reader-hint candidate package handoff produced.',
    artifact_path: outputMd,
    artifact_json: outputJson,
    included_rows: includedRows.length,
    included_occurrences: sumOccurrences(includedRows),
    excluded_rows: excludedRows.length,
    excluded_occurrences: sumOccurrences(excludedRows),
    next_route: 'Stop at non-public handoff/planning packet unless user/Agent 13 authorizes an exact changed public/runtime package path.',
    public_mutation_blocked: true,
    agent4_remains_held: true,
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
  lines.push('# Agent 10 Orot 20-Row Reader-Hint Candidate Package Handoff');
  lines.push('');
  lines.push(`Generated: ${data.generated_at}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('This is a non-public candidate package handoff/planning packet only. It does not mutate public Orot assets, route shards, public HUD files, route JSONL, Orot HTML/runtime, source files, token indexes, or lexical payloads.');
  lines.push('');
  lines.push('It does not authorize answer eligibility, accepted text, render/browser/public validation, Agent 4 runtime proof, top-N expansion, NC expansion, public/runtime acceptance, publication readiness, or route publication support.');
  lines.push('');
  lines.push('## Recount');
  lines.push('');
  lines.push(`- Included allowed rows / occurrences: \`${data.summary.included_rows}\` / \`${data.summary.included_occurrences}\`.`);
  lines.push(`- Excluded rows / occurrences: \`${data.summary.excluded_rows}\` / \`${data.summary.excluded_occurrences}\`.`);
  lines.push(`- Public mutation blocked: \`${data.summary.public_mutation_blocked}\`.`);
  lines.push(`- Agent 4 remains held: \`${data.summary.agent4_remains_held}\`.`);
  lines.push(`- Changed public/runtime package exists: \`${data.summary.changed_public_runtime_package_exists}\`.`);
  lines.push('');
  lines.push('## Evidence References');
  lines.push('');
  lines.push(`- Agent 2 allowed-row package: \`${data.inputs.agent2_allowed_package}\`.`);
  lines.push(`- Agent 6 allowed-row package verdict: \`${data.inputs.agent6_allowed_package_verdict}\`.`);
  lines.push(`- Prior Agent 10 handoff: \`${data.inputs.agent10_prior_handoff}\`.`);
  lines.push('');
  lines.push('## Included Rows');
  lines.push('');
  lines.push('| Token | Surface | Occurrences | Label | Selected Source Rows |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const row of data.included_rows) {
    lines.push(`| ${row.token_id} | ${row.surface} | ${row.occurrences} | ${row.label} | ${row.selected_source_rows.join('<br>')} |`);
  }
  lines.push('');
  lines.push('## Excluded Blockers');
  lines.push('');
  lines.push('| Token | Surface | Occurrences | Status | Blocker |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const row of data.excluded_rows) {
    lines.push(`| ${row.token_id} | ${row.surface} | ${row.occurrences} | ${row.exclusion_status} | ${row.blocker} |`);
  }
  lines.push('');
  lines.push('## Required Blockers Preserved');
  lines.push('');
  for (const blocker of data.required_blockers_preserved) lines.push(`- ${blocker}`);
  lines.push('');
  lines.push('## Agent 8 Callback');
  lines.push('');
  lines.push(`- Status: ${data.agent8_callback.status}`);
  lines.push(`- Artifact path: \`${data.agent8_callback.artifact_path}\``);
  lines.push(`- Artifact JSON: \`${data.agent8_callback.artifact_json}\``);
  lines.push(`- Included rows / occurrences: \`${data.agent8_callback.included_rows}\` / \`${data.agent8_callback.included_occurrences}\``);
  lines.push(`- Excluded rows / occurrences: \`${data.agent8_callback.excluded_rows}\` / \`${data.agent8_callback.excluded_occurrences}\``);
  lines.push(`- Next route: ${data.agent8_callback.next_route}`);
  lines.push(`- Public mutation blocked: \`${data.agent8_callback.public_mutation_blocked}\``);
  lines.push(`- Agent 4 remains held: \`${data.agent8_callback.agent4_remains_held}\``);
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
