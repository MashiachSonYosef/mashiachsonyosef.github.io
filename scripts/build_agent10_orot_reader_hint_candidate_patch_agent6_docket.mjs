#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  candidatePatch: 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json',
  preview: 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json',
  prefixContract: 'reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json',
  projectPreferredContract: 'reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json',
  liveGuard: 'reports/agent10-live-public-old-hud-guard-2026-06-03-post-orot-reader-hint-candidate-patch.json',
  jsonReport: `reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-${dateSlug}.json`,
  report: `reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const candidatePatch = readJson(options.candidatePatch);
const preview = readJson(options.preview);
const prefixContract = readJson(options.prefixContract);
const projectPreferredContract = readJson(options.projectPreferredContract);
const liveGuard = readJson(options.liveGuard);

const validationCommands = [
  ['node', ['scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs', options.candidatePatch]],
  ['node', ['scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs', options.preview]],
  ['node', ['scripts/validate_agent10_orot_prefix_stem_contract_packet.mjs', options.prefixContract]],
  ['node', ['scripts/validate_agent10_orot_project_preferred_contract_packet.mjs', options.projectPreferredContract]],
  ['node', ['scripts/validate_route_hud_page.mjs', '--page', 'orot/index.html', '--page', 'tanakh/deuteronomy/index.html', '--page', 'tanakh/genesis/index.html']],
].map(runCommand);

const issues = [];
const warnings = [];
const summary = candidatePatch.summary || {};
const liveSummary = liveGuard.summary || {};

if (candidatePatch.artifact_type !== 'agent2_orot_reader_hint_candidate_patch') issues.push('Candidate patch artifact type is unexpected.');
if (candidatePatch.boundary?.no_public_hud_mutation !== true) issues.push('Candidate patch does not preserve no_public_hud_mutation=true.');
if (candidatePatch.boundary?.no_approved_reader_hint_patch !== true) issues.push('Candidate patch does not preserve no_approved_reader_hint_patch=true.');
if (candidatePatch.inputs?.preview !== options.preview) issues.push('Candidate patch preview input path does not match docket preview path.');
if (candidatePatch.inputs?.preview_sha256 !== sha256File(options.preview)) issues.push('Candidate patch preview sha256 does not match current preview artifact.');
if (summary.candidate_patch_rows !== 31) issues.push('Candidate patch row count drifted from expected 31.');
if (summary.candidate_patch_occurrences !== 1202) issues.push('Candidate patch occurrence count drifted from expected 1202.');
if (summary.approved_rows !== 0) issues.push('Candidate patch approved rows must be 0.');
if (summary.public_emit_ready_rows !== 0) issues.push('Candidate patch public emit ready rows must be 0.');
if (summary.answer_eligible_rows !== 0) issues.push('Candidate patch answer eligible rows must be 0.');
if (summary.public_hud_rows_emitted !== 0) issues.push('Candidate patch public HUD rows emitted must be 0.');
if (summary.route_jsonl_rows_emitted !== 0) issues.push('Candidate patch route JSONL rows emitted must be 0.');
if (liveSummary.old_hud_exposure !== 'no') issues.push('Live guard does not report old_hud_exposure=no.');
if ((liveSummary.hard_old_marker_hit_checks || 0) !== 0) issues.push('Live guard has hard old-HUD marker hits.');
if ((liveSummary.issues || 0) !== 0) issues.push('Live guard reports issues.');
if ((liveSummary.warnings || 0) > 0) warnings.push('Live guard is WARN, not PASS; known watch-marker warning remains outside hard old-HUD exposure.');
for (const command of validationCommands) {
  if (command.exit_code !== 0) issues.push(`Validation command failed: ${command.command}`);
}

const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent6_ready_orot_reader_hint_candidate_patch_docket',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_agent6_review_docket' : 'agent6_ready_review_docket_not_accepted',
    evidence_only: true,
    pipeline_only: true,
    review_docket_only: true,
    no_agent6_verdict: true,
    no_qa_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_match_percent_authority: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_runtime_asset_mutation: true,
    no_approved_reader_hint_patch: true,
  },
  inputs: {
    candidate_patch: options.candidatePatch,
    candidate_patch_sha256: sha256File(options.candidatePatch),
    preview: options.preview,
    preview_sha256: sha256File(options.preview),
    prefix_contract: options.prefixContract,
    prefix_contract_sha256: sha256File(options.prefixContract),
    project_preferred_contract: options.projectPreferredContract,
    project_preferred_contract_sha256: sha256File(options.projectPreferredContract),
    live_old_hud_guard: options.liveGuard,
    live_old_hud_guard_sha256: sha256File(options.liveGuard),
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    public_hud_output: null,
    route_jsonl: null,
    runtime_files_touched: [],
    source_files_touched: [],
  },
  review_request: {
    target_agent: 'Agent 6',
    requested_verdict_type: 'pass_warn_block_on_evidence_packet_only',
    review_target: 'Orot non-public reader-hint candidate patch evidence sufficiency',
    decision_not_requested: [
      'QA acceptance',
      'source/provenance custody or acceptance',
      'Definition authority',
      'usage-as-definition authority',
      'accepted gloss or translation text',
      'public runtime acceptance',
      'publication readiness',
      'public HUD mutation approval',
    ],
    specific_questions: [
      'Do the two upstream Orot contract packets provide sufficient evidence for the 31-row candidate patch review boundary?',
      'Does the candidate patch preserve preview-only derivation, row bijection, selected source rows, competing edges, and non-acceptance flags?',
      'Is the packet sufficient for Agent 13 candidate-label policy review before any public mutation?',
      'What exact blocker remains before a later approved public reader-hint transform may be attempted?',
    ],
  },
  summary: {
    status: issues.length ? 'blocked_agent6_review_docket' : (warnings.length ? 'warn_agent6_ready_review_docket_not_accepted' : 'agent6_ready_review_docket_not_accepted'),
    candidate_patch_rows: summary.candidate_patch_rows,
    candidate_patch_occurrences: summary.candidate_patch_occurrences,
    prefix_contract_rows: summary.prefix_contract_rows,
    project_preferred_rows: summary.project_preferred_rows,
    competing_edge_rows: summary.competing_edge_rows,
    competing_edges_total: summary.competing_edges_total,
    approved_rows: summary.approved_rows,
    public_emit_ready_rows: summary.public_emit_ready_rows,
    answer_eligible_rows: summary.answer_eligible_rows,
    promote_to_answer_rows: summary.promote_to_answer_rows,
    public_hud_rows_emitted: summary.public_hud_rows_emitted,
    route_jsonl_rows_emitted: summary.route_jsonl_rows_emitted,
    match_percent_available_rows: summary.match_percent_available_rows,
    match_percent_missing_rows: summary.match_percent_missing_rows,
    missing_linkage_rows_outside_patch: summary.missing_linkage_rows_outside_patch,
    missing_linkage_occurrences_outside_patch: summary.missing_linkage_occurrences_outside_patch,
    live_old_hud_exposure: liveSummary.old_hud_exposure || 'unknown',
    live_guard_status: liveSummary.status || 'unknown',
    hard_old_marker_hit_checks: liveSummary.hard_old_marker_hit_checks ?? null,
    validation_commands_passed: validationCommands.filter((command) => command.exit_code === 0).length,
    validation_commands_total: validationCommands.length,
    issues: issues.length,
    warnings: warnings.length,
  },
  validation_evidence: {
    commands: validationCommands,
    candidate_patch_preview_bijection: {
      preview_input: candidatePatch.inputs?.preview || null,
      preview_sha256_declared: candidatePatch.inputs?.preview_sha256 || null,
      preview_sha256_actual: sha256File(options.preview),
      token_rows: summary.candidate_patch_rows,
      derivation_validator: 'scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs',
    },
    live_old_hud_guard: {
      artifact: options.liveGuard,
      commit_or_deploy_id: liveGuard.commit_or_deploy_id || null,
      status: liveSummary.status || null,
      old_hud_exposure: liveSummary.old_hud_exposure || null,
      hard_old_marker_hit_checks: liveSummary.hard_old_marker_hit_checks ?? null,
      watch_old_marker_hit_checks: liveSummary.watch_old_marker_hit_checks ?? null,
      warnings: liveSummary.warnings ?? null,
      issues: liveSummary.issues ?? null,
    },
  },
  upstream_packet_summaries: {
    prefix_contract: prefixContract.summary || {},
    project_preferred_contract: projectPreferredContract.summary || {},
    preview: preview.summary || {},
    candidate_patch: candidatePatch.summary || {},
  },
  allowed_next_routes: [
    'Agent 6 pass/warn/block review of this review docket only.',
    'Agent 13 candidate-label policy decision if Agent 6 does not block evidence sufficiency.',
    'Agent 1 review of remaining missing-linkage rows before expanding beyond the 31-row candidate patch.',
  ],
  blocked_now: [
    'No public Orot reader-hint mutation is allowed from this docket.',
    'No data/public-hud/orot/reader-hints.json write is allowed from this docket.',
    'No route JSONL/shard write is allowed from this docket.',
    'No Orot HTML or reader-workbench runtime asset edit is allowed from this docket.',
    'No accepted gloss, translation, source custody, Definition authority, usage-as-definition authority, or publication readiness claim is allowed from this docket.',
  ],
  issues,
  warnings,
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
    'This docket as an approved reader-hint patch.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot Agent 6 reader-hint candidate patch docket complete (${output.summary.status}). Report: ${options.report}`);
if (issues.length) process.exit(1);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--candidate-patch') parsed.candidatePatch = cleanRelativePath(argv[++index]);
    else if (arg === '--preview') parsed.preview = cleanRelativePath(argv[++index]);
    else if (arg === '--prefix-contract') parsed.prefixContract = cleanRelativePath(argv[++index]);
    else if (arg === '--project-preferred-contract') parsed.projectPreferredContract = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs [--candidate-patch path] [--live-guard path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Agent-6-Ready Orot Reader-Hint Candidate Patch Docket',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only Agent 6 review docket for the non-public Orot reader-hint candidate patch.',
    '- This does not claim an Agent 6 verdict, QA acceptance, source custody, source/provenance acceptance, Definition authority, usage-as-definition authority, public/runtime acceptance, publication readiness, public HUD mutation, route JSONL mutation, accepted gloss, or accepted translation text.',
    '- Candidate counterpart text remains a review-only reader convenience candidate.',
    '',
    '## Review Request',
    '',
    `- Target agent: ${data.review_request.target_agent}`,
    `- Requested verdict type: ${data.review_request.requested_verdict_type}`,
    `- Review target: ${data.review_request.review_target}`,
    '',
    'Specific questions:',
    '',
    ...data.review_request.specific_questions.map((item) => `- ${item}`),
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Candidate patch rows / occurrences: ${data.summary.candidate_patch_rows} / ${data.summary.candidate_patch_occurrences}`,
    `- Prefix/stem rows: ${data.summary.prefix_contract_rows}`,
    `- Project-preferred rows: ${data.summary.project_preferred_rows}`,
    `- Competing edge rows / total edges: ${data.summary.competing_edge_rows} / ${data.summary.competing_edges_total}`,
    `- Approved rows: ${data.summary.approved_rows}`,
    `- Public emit ready rows: ${data.summary.public_emit_ready_rows}`,
    `- Answer eligible rows: ${data.summary.answer_eligible_rows}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    `- Match percent available / missing rows: ${data.summary.match_percent_available_rows} / ${data.summary.match_percent_missing_rows}`,
    `- Missing-linkage rows / occurrences outside patch: ${data.summary.missing_linkage_rows_outside_patch} / ${data.summary.missing_linkage_occurrences_outside_patch}`,
    `- Live old HUD exposure: ${data.summary.live_old_hud_exposure}`,
    `- Live guard status: ${data.summary.live_guard_status}`,
    `- Hard old marker hits: ${data.summary.hard_old_marker_hit_checks}`,
    `- Validation commands passed / total: ${data.summary.validation_commands_passed} / ${data.summary.validation_commands_total}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Inputs',
    '',
    ...Object.entries(data.inputs).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Validation Evidence',
    '',
    ...data.validation_evidence.commands.map((command) => `- ${command.command}: exit=${command.exit_code}`),
    '',
    '## Live Old-HUD Guard',
    '',
    `- Artifact: ${data.validation_evidence.live_old_hud_guard.artifact}`,
    `- Commit/deploy id: ${data.validation_evidence.live_old_hud_guard.commit_or_deploy_id}`,
    `- Status: ${data.validation_evidence.live_old_hud_guard.status}`,
    `- Old HUD exposure: ${data.validation_evidence.live_old_hud_guard.old_hud_exposure}`,
    `- Hard marker hits: ${data.validation_evidence.live_old_hud_guard.hard_old_marker_hit_checks}`,
    `- Watch marker hits: ${data.validation_evidence.live_old_hud_guard.watch_old_marker_hit_checks}`,
    '',
    '## Allowed Next Routes',
    '',
    ...data.allowed_next_routes.map((item) => `- ${item}`),
    '',
    '## Blocked Now',
    '',
    ...data.blocked_now.map((item) => `- ${item}`),
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

function runCommand([command, args]) {
  const executable = command === 'node' ? process.execPath : command;
  const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8' });
  return {
    command: [command, ...args].join(' '),
    exit_code: result.status,
    error: result.error ? result.error.message : null,
    stdout_tail: tail(result.stdout || ''),
    stderr_tail: tail(result.stderr || ''),
  };
}

function tail(text) {
  const normalized = text.trim();
  if (!normalized) return '';
  return normalized.split(/\r?\n/).slice(-8).join('\n');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sha256File(relativePath) {
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function cleanRelativePath(value) {
  if (!value) throw new Error('Missing path argument');
  const normalized = value.replace(/\\/g, '/');
  if (path.isAbsolute(normalized) || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}
