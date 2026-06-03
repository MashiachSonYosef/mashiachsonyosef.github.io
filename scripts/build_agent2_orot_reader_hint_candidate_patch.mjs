#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  preview: 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json',
  jsonReport: `reports/agent2-orot-reader-hint-candidate-patch-${dateSlug}.json`,
  report: `reports/agent2-orot-reader-hint-candidate-patch-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const preview = readJson(options.preview);
const previewSha256 = sha256File(options.preview);
const previewRows = preview.preview_rows || [];
const candidateRows = previewRows.map(toCandidateRow);
const issues = [];
const warnings = [];

if (preview.artifact_type !== 'agent2_orot_counterpart_hint_patch_preview') issues.push('Input preview artifact type is not the expected Orot counterpart hint preview.');
if (preview.boundary?.no_public_hud_mutation !== true) issues.push('Input preview does not preserve no_public_hud_mutation=true.');
if (preview.boundary?.no_approved_reader_hint_patch !== true) issues.push('Input preview does not preserve no_approved_reader_hint_patch=true.');
if (preview.summary?.candidate_preview_rows !== 31) issues.push('Input preview row count drifted from expected 31.');
if (preview.summary?.candidate_preview_occurrences !== 1202) issues.push('Input preview occurrence count drifted from expected 1202.');
if (preview.summary?.live_old_hud_exposure !== 'no') issues.push('Input preview does not preserve live_old_hud_exposure=no.');
if (preview.summary?.issues !== 0) issues.push('Input preview reports issues.');
if ((preview.summary?.warnings || 0) > 0) warnings.push('Input preview is WARN, not PASS; current live guard remains no-exposure with watch-marker warning.');
if (candidateRows.length !== 31) issues.push(`Candidate patch row count drifted from expected 31 to ${candidateRows.length}.`);
if (sum(candidateRows.map((row) => row.occurrences)) !== 1202) issues.push('Candidate patch occurrence count drifted from expected 1202.');
if (new Set(candidateRows.map((row) => row.target_token_id)).size !== candidateRows.length) issues.push('Candidate patch contains duplicate target token ids.');
if (candidateRows.some((row) => !row.candidate_counterpart?.display)) issues.push('One or more candidate patch rows is missing candidate counterpart display.');
if (candidateRows.some((row) => row.candidate_counterpart?.match_percent !== null)) issues.push('Candidate patch unexpectedly contains match percent values.');
if (candidateRows.some((row) => row.approved_for_public_emit || row.answer_eligible || row.promote_to_answer || row.would_modify_public_hud)) issues.push('One or more candidate rows is incorrectly marked public/answer/mutation ready.');

const output = {
  schema_version: 1,
  artifact_type: 'agent2_orot_reader_hint_candidate_patch',
  generated_at: generatedAt,
  generator: 'scripts/build_agent2_orot_reader_hint_candidate_patch.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_candidate_patch_packet' : 'candidate_patch_not_approved',
    pipeline_only: true,
    review_artifact_only: true,
    source_preview_only: true,
    no_agent6_verdict: true,
    no_qa_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_match_percent_authority: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_runtime_asset_mutation: true,
    no_approved_reader_hint_patch: true,
  },
  inputs: {
    preview: options.preview,
    preview_sha256: previewSha256,
    prefix_contract: preview.inputs?.prefix_contract || null,
    project_preferred_contract: preview.inputs?.project_preferred_contract || null,
    missing_linkage_candidates: preview.inputs?.missing_linkage_candidates || null,
    live_old_hud_guard: preview.inputs?.live_old_hud_guard || null,
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    public_hud_output: null,
    route_jsonl: null,
    runtime_files_touched: [],
    source_files_touched: [],
  },
  patch_contract: {
    target_work: 'orot',
    target_route: 'orot/',
    future_public_hint_path_if_approved_later: 'data/public-hud/orot/reader-hints.json',
    operation_if_approved_later: 'upsert candidate reader counterpart hints by token id',
    current_operation: 'write review-only candidate patch artifact under reports/',
    public_mutation_allowed_now: false,
  },
  summary: {
    status: issues.length ? 'blocked_candidate_patch_packet' : (warnings.length ? 'warn_candidate_patch_not_approved' : 'candidate_patch_not_approved'),
    candidate_patch_rows: candidateRows.length,
    candidate_patch_occurrences: sum(candidateRows.map((row) => row.occurrences)),
    prefix_contract_rows: candidateRows.filter((row) => row.source_contract === 'OROT_PREFIX_STEM_COUNTERPART_DISPLAY_V1').length,
    project_preferred_rows: candidateRows.filter((row) => row.source_contract === 'OROT_PROJECT_PREFERRED_MULTI_STEM_COUNTERPART_DISPLAY_V1').length,
    approved_rows: 0,
    public_emit_ready_rows: 0,
    answer_eligible_rows: 0,
    promote_to_answer_rows: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    match_percent_available_rows: 0,
    match_percent_missing_rows: candidateRows.length,
    competing_edge_rows: candidateRows.filter((row) => row.competing_edge_count > 0).length,
    competing_edges_total: sum(candidateRows.map((row) => row.competing_edge_count)),
    missing_linkage_rows_outside_patch: preview.summary?.missing_linkage_rows_outside_preview || 0,
    missing_linkage_occurrences_outside_patch: preview.summary?.missing_linkage_occurrences_outside_preview || 0,
    live_old_hud_exposure: preview.summary?.live_old_hud_exposure || 'unknown',
    live_guard_status: preview.summary?.live_guard_status || 'unknown',
    issues: issues.length,
    warnings: warnings.length,
  },
  issues,
  warnings,
  candidate_patch_policy: {
    intended_use: 'machine-reviewable, non-public candidate patch shape for eventual Orot inline reader counterpart hints',
    row_meaning: 'current best available pipeline candidate only; not a translation, accepted gloss, or semantic authority',
    may_become_public_only_after: [
      'Agent 6 review of the source contract packets, preview, candidate patch artifact, and validator output',
      'Agent 13 approval of candidate label policy for reader convenience display',
      'separate public HUD artifact transform with approved rows explicitly selected',
      'fresh live old-HUD guard after any public HUD mutation',
      'Agent 4 browser-click proof if Orot runtime/public behavior changes',
    ],
    prohibited_now: [
      'writing data/public-hud/orot/reader-hints.json',
      'writing route lookup shards',
      'editing orot/index.html',
      'editing reader-workbench runtime assets',
      'answer_eligible=true',
      'promote_to_answer=true',
      'accepted gloss or translation text',
      'source custody or source acceptance',
      'definition authority or usage-as-definition authority',
    ],
  },
  candidate_patch_rows: candidateRows,
  blocked_outside_patch: {
    missing_linkage_rows: preview.summary?.missing_linkage_rows_outside_preview || 0,
    missing_linkage_occurrences: preview.summary?.missing_linkage_occurrences_outside_preview || 0,
    note: 'Rows outside this packet still require pipeline linkage/source evidence before reader-hint patch preparation.',
  },
  what_must_not_be_accepted: [
    'Agent 6 acceptance.',
    'QA acceptance.',
    'Validated public/runtime acceptance.',
    'Source custody.',
    'Source/provenance acceptance.',
    'Definition authority.',
    'Usage-as-definition authority.',
    'Translation output.',
    'Accepted gloss.',
    'Accepted translation text.',
    'Match percent authority.',
    'Public HUD mutation.',
    'Route JSONL mutation.',
    'Runtime asset mutation.',
    'Publication readiness.',
    'This artifact as an approved reader-hint patch.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot reader-hint candidate patch complete (${output.summary.status}). Rows: ${output.summary.candidate_patch_rows}; occurrences: ${output.summary.candidate_patch_occurrences}; report: ${options.report}`);
if (issues.length) process.exit(1);

function toCandidateRow(row) {
  const candidate = row.reader_hint_candidate || {};
  return {
    patch_status: 'candidate_patch_row_not_approved',
    target_work: 'orot',
    target_route: 'orot/',
    target_token_id: row.token_id,
    target_lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    prefix_class: row.prefix_class,
    prefix_stem_key: row.prefix_stem_key,
    source_contract: row.source_contract,
    source_contract_path: row.source_contract_path,
    source_contract_status: row.source_contract_status,
    selection_basis: row.selection_basis,
    candidate_counterpart: {
      display: candidate.display || '',
      label: candidate.label || '',
      label_status: 'candidate_not_approved',
      match_percent: null,
      match_percent_status: candidate.match_percent_status || 'not_available_in_contract_inputs',
      selected_claim_id: candidate.selected_claim_id || '',
      selected_claim_file: candidate.selected_claim_file || '',
      selected_route_family: candidate.selected_route_family || '',
      selected_route_type: candidate.selected_route_type || '',
      selected_surface: candidate.selected_surface || '',
      selected_normalized: candidate.selected_normalized || '',
      selected_source_rows: candidate.selected_source_rows || [],
    },
    competing_edges: (row.competing_edges || []).map((edge) => ({
      upstream_claim_id: edge.upstream_claim_id || '',
      upstream_claim_file: edge.upstream_claim_file || '',
      relation: edge.relation || '',
      upstream_route_family: edge.upstream_route_family || '',
      upstream_route_type: edge.upstream_route_type || '',
      upstream_surface: edge.upstream_surface || '',
      upstream_normalized: edge.upstream_normalized || '',
      counterpart_candidate_display: edge.counterpart_candidate_display || '',
      upstream_source_rows: edge.upstream_source_rows || [],
      promote_to_answer: false,
    })),
    competing_edge_count: row.competing_edge_count || 0,
    approved_for_public_emit: false,
    public_emit_ready: false,
    answer_eligible: false,
    promote_to_answer: false,
    would_modify_public_hud: false,
    would_write_if_approved_later: {
      path: 'data/public-hud/orot/reader-hints.json',
      operation: 'upsert',
      key: row.token_id,
      allowed_now: false,
    },
    not_claimed: [
      'definition authority',
      'usage-as-definition authority',
      'accepted gloss',
      'accepted translation text',
      'match percent authority',
      'public/runtime acceptance',
      'source/provenance custody',
      'publication readiness',
    ],
  };
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--preview') parsed.preview = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent2_orot_reader_hint_candidate_patch.mjs [--preview path] [--json-report path] [--report path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 2 Orot Reader-Hint Candidate Patch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Pipeline-only review artifact; no public HUD data, route JSONL, runtime asset, source file, or Orot HTML mutation was emitted.',
    '- Candidate counterpart text is reader convenience only, not accepted gloss, translation, Definition authority, usage-as-definition authority, or match-percent authority.',
    '- This is not Agent 6 acceptance, QA acceptance, public/runtime acceptance, source custody, source/provenance acceptance, or publication readiness.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Candidate patch rows: ${data.summary.candidate_patch_rows}`,
    `- Candidate patch occurrences: ${data.summary.candidate_patch_occurrences}`,
    `- Prefix/stem rows: ${data.summary.prefix_contract_rows}`,
    `- Project-preferred rows: ${data.summary.project_preferred_rows}`,
    `- Approved rows: ${data.summary.approved_rows}`,
    `- Public emit ready rows: ${data.summary.public_emit_ready_rows}`,
    `- Answer eligible rows: ${data.summary.answer_eligible_rows}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    `- Match percent available rows: ${data.summary.match_percent_available_rows}`,
    `- Match percent missing rows: ${data.summary.match_percent_missing_rows}`,
    `- Competing edge rows: ${data.summary.competing_edge_rows}`,
    `- Competing edges total: ${data.summary.competing_edges_total}`,
    `- Missing-linkage rows outside patch: ${data.summary.missing_linkage_rows_outside_patch}`,
    `- Missing-linkage occurrences outside patch: ${data.summary.missing_linkage_occurrences_outside_patch}`,
    `- Live old HUD exposure: ${data.summary.live_old_hud_exposure}`,
    `- Live guard status: ${data.summary.live_guard_status}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Outputs',
    '',
    `- JSON report: ${data.outputs.json_report}`,
    `- Markdown report: ${data.outputs.markdown_report}`,
    `- Public HUD output: ${data.outputs.public_hud_output}`,
    `- Route JSONL: ${data.outputs.route_jsonl}`,
    `- Runtime files touched: ${data.outputs.runtime_files_touched.length}`,
    `- Source files touched: ${data.outputs.source_files_touched.length}`,
    '',
    '## Candidate Patch Policy',
    '',
    `- Intended use: ${data.candidate_patch_policy.intended_use}`,
    `- Row meaning: ${data.candidate_patch_policy.row_meaning}`,
    '',
    'May become public only after:',
    '',
    ...data.candidate_patch_policy.may_become_public_only_after.map((item) => `- ${item}`),
    '',
    'Prohibited now:',
    '',
    ...data.candidate_patch_policy.prohibited_now.map((item) => `- ${item}`),
    '',
    '## Candidate Rows',
    '',
    ...data.candidate_patch_rows.map(candidateLine),
    '',
    '## Blocked Outside Patch',
    '',
    `- Missing-linkage rows / occurrences: ${data.blocked_outside_patch.missing_linkage_rows} / ${data.blocked_outside_patch.missing_linkage_occurrences}`,
    `- Note: ${data.blocked_outside_patch.note}`,
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${warning}`) : ['- None']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function candidateLine(row) {
  return `- ${row.target_token_id}: ${row.surface} -> ${row.prefix_stem_key}; occurrences=${row.occurrences}; label="${row.candidate_counterpart.label}"; candidate="${row.candidate_counterpart.display}"; approved=false; public_emit_ready=false; match_percent=null`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function sha256File(relativePath) {
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function cleanRelativePath(value) {
  if (!value) throw new Error('Missing path argument');
  const normalized = value.replace(/\\/g, '/');
  if (path.isAbsolute(normalized) || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}
