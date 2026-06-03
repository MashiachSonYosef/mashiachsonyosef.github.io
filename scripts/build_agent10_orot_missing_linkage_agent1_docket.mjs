#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  missingLinkage: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json',
  candidatePatchDocket: 'reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.json',
  liveGuard: 'reports/agent10-live-public-old-hud-guard-2026-06-03-post-orot-reader-hint-candidate-patch.json',
  jsonReport: `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-${dateSlug}.json`,
  report: `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const missingLinkage = readJson(options.missingLinkage);
const candidatePatchDocket = readJson(options.candidatePatchDocket);
const liveGuard = readJson(options.liveGuard);
const rows = missingLinkage.candidates || [];
const validationCommands = [
  ['node', ['scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs', options.missingLinkage]],
  ['node', ['scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs', options.candidatePatchDocket]],
  ['node', ['scripts/validate_route_hud_page.mjs', '--page', 'orot/index.html', '--page', 'tanakh/deuteronomy/index.html', '--page', 'tanakh/genesis/index.html']],
].map(runCommand);

const issues = [];
const warnings = [];
const counts = missingLinkage.counts || {};
const liveSummary = liveGuard.summary || {};
const bucketCounts = counts.bucket_counts || {};
const bucketOccurrences = counts.bucket_occurrences || {};

if (missingLinkage.artifact_type !== 'agent1_orot_missing_lexicon_linkage_candidates') issues.push('Missing-linkage artifact type is unexpected.');
if (missingLinkage.boundary?.not_source_custody !== true) issues.push('Missing-linkage artifact does not preserve not_source_custody=true.');
if (missingLinkage.boundary?.not_source_acceptance !== true) issues.push('Missing-linkage artifact does not preserve not_source_acceptance=true.');
if (counts.missing_lexicon_linkage_rows !== 13) issues.push('Missing-linkage row count drifted from expected 13.');
if (counts.missing_lexicon_linkage_occurrences !== 129) issues.push('Missing-linkage occurrence count drifted from expected 129.');
if (counts.mutation_rows_emitted !== 0) issues.push('Missing-linkage packet emitted mutation rows.');
if (counts.source_rows_emitted !== 0) issues.push('Missing-linkage packet emitted source rows.');
if (counts.lexicon_entry_ids_assigned !== 0) issues.push('Missing-linkage packet assigned lexicon entry ids.');
if (candidatePatchDocket.summary?.missing_linkage_rows_outside_patch !== 13) issues.push('Candidate patch docket no longer agrees on 13 missing-linkage rows outside patch.');
if (liveSummary.old_hud_exposure !== 'no') issues.push('Live guard does not report old_hud_exposure=no.');
if ((liveSummary.hard_old_marker_hit_checks || 0) !== 0) issues.push('Live guard reports hard old-HUD marker hits.');
if ((liveSummary.issues || 0) !== 0) issues.push('Live guard reports issues.');
if ((liveSummary.warnings || 0) > 0) warnings.push('Live guard is WARN, not PASS; known watch-marker warning remains outside hard old-HUD exposure.');
for (const command of validationCommands) {
  if (command.exit_code !== 0) issues.push(`Validation command failed: ${command.command}`);
}

const reviewRows = rows.map((row) => ({
  review_status: 'agent1_source_linkage_review_needed',
  queue_id: row.queue_id,
  token_id: row.token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  prefix_class: row.prefix_class,
  prefix_stem_key: row.prefix_stem_key,
  linkage_candidate_bucket: row.linkage_candidate_bucket,
  candidate_edge_count: row.candidate_edge_count,
  project_preferred_edge_count: row.project_preferred_edge_count,
  candidate_edges: row.candidate_edges || [],
  requested_agent1_review: reviewAsk(row),
  mutation_allowed_here: false,
  lexicon_entry_id_assignment_allowed_here: false,
  source_custody_claimed: false,
  source_acceptance_claimed: false,
  definition_authority_claimed: false,
  public_hud_mutation_allowed: false,
}));

const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent1_ready_orot_missing_linkage_review_docket',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_orot_missing_linkage_agent1_docket.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_agent1_review_docket' : 'agent1_ready_missing_linkage_review_docket_not_accepted',
    evidence_only: true,
    pipeline_only: true,
    review_docket_only: true,
    no_agent1_source_custody: true,
    no_source_acceptance: true,
    no_source_mutation: true,
    no_lexicon_entry_id_assignment: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_text: true,
    no_qa_acceptance: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
  },
  inputs: {
    missing_linkage: options.missingLinkage,
    missing_linkage_sha256: sha256File(options.missingLinkage),
    candidate_patch_docket: options.candidatePatchDocket,
    candidate_patch_docket_sha256: sha256File(options.candidatePatchDocket),
    live_old_hud_guard: options.liveGuard,
    live_old_hud_guard_sha256: sha256File(options.liveGuard),
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    source_mutation: null,
    lexical_payload_mutation: null,
    token_index_mutation: null,
    public_hud_output: null,
    route_jsonl: null,
    runtime_files_touched: [],
    source_files_touched: [],
  },
  review_request: {
    target_agent: 'Agent 1',
    requested_verdict_type: 'source_linkage_review_or_exact_blocker_only',
    review_target: '13 Orot rows outside the 31-row reader-hint candidate patch because lexicon_entry_id is missing',
    decision_not_requested: [
      'source/provenance custody acceptance',
      'Definition authority',
      'accepted gloss or translation text',
      'QA acceptance',
      'public/runtime acceptance',
      'publication readiness',
      'any mutation to token index, lexical payloads, source files, public HUD, route JSONL, or runtime assets',
    ],
    specific_questions: [
      'Which rows, if any, have enough existing pipeline source/linkage evidence to propose a later linkage rule?',
      'Which rows are exact blockers because no current stem source candidate exists?',
      'Which rows require Agent 13 semantic/arbitration policy before linkage can be proposed?',
      'What exact source/provenance evidence would be required before any future lexicon_entry_id assignment packet?',
    ],
  },
  summary: {
    status: issues.length ? 'blocked_agent1_review_docket' : (warnings.length ? 'warn_agent1_ready_missing_linkage_review_docket_not_accepted' : 'agent1_ready_missing_linkage_review_docket_not_accepted'),
    review_rows: rows.length,
    review_occurrences: counts.missing_lexicon_linkage_occurrences,
    no_current_stem_source_candidate_rows: bucketCounts.no_current_stem_source_candidate_found || 0,
    no_current_stem_source_candidate_occurrences: bucketOccurrences.no_current_stem_source_candidate_found || 0,
    single_stem_candidate_rows: bucketCounts.single_stem_candidate_found_current_pipeline || 0,
    single_stem_candidate_occurrences: bucketOccurrences.single_stem_candidate_found_current_pipeline || 0,
    project_preferred_candidate_rows: bucketCounts.project_preferred_function_word_stem_candidate_exists || 0,
    project_preferred_candidate_occurrences: bucketOccurrences.project_preferred_function_word_stem_candidate_exists || 0,
    multi_stem_no_project_preferred_rows: bucketCounts.multi_stem_no_project_preferred_candidate || 0,
    multi_stem_no_project_preferred_occurrences: bucketOccurrences.multi_stem_no_project_preferred_candidate || 0,
    candidate_edges_total: sum(rows.map((row) => row.candidate_edge_count)),
    project_preferred_edges_total: sum(rows.map((row) => row.project_preferred_edge_count)),
    mutation_rows_emitted: counts.mutation_rows_emitted,
    source_rows_emitted: counts.source_rows_emitted,
    lexicon_entry_ids_assigned: counts.lexicon_entry_ids_assigned,
    candidate_patch_rows_currently_prepared: candidatePatchDocket.summary?.candidate_patch_rows || 0,
    candidate_patch_occurrences_currently_prepared: candidatePatchDocket.summary?.candidate_patch_occurrences || 0,
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
  review_rows: reviewRows,
  allowed_next_routes: [
    'Agent 1 review of this docket with source/linkage recommendation or exact blocker per row.',
    'If Agent 1 returns non-blocking evidence, build a later linkage-rule proposal packet without mutating source/token-index files.',
    'If Agent 1 blocks rows, keep them outside Orot reader-hint candidate patch expansion.',
  ],
  blocked_now: [
    'No lexicon_entry_id assignment is allowed from this docket.',
    'No token-index, lexical payload, source file, public HUD, route JSONL, Orot HTML, or runtime asset mutation is allowed from this docket.',
    'No accepted gloss, translation, source custody, Definition authority, usage-as-definition authority, QA acceptance, public/runtime acceptance, or publication readiness claim is allowed from this docket.',
  ],
  issues,
  warnings,
  what_must_not_be_accepted: [
    'Agent 1 source custody acceptance.',
    'Source/provenance acceptance.',
    'Definition authority.',
    'Usage-as-definition authority.',
    'Translation output.',
    'Accepted gloss.',
    'Accepted translation text.',
    'QA acceptance.',
    'Validated public/runtime acceptance.',
    'Publication readiness.',
    'Any lexicon_entry_id assignment.',
    'Any token-index mutation.',
    'Any lexical payload mutation.',
    'Any public HUD mutation.',
    'Any route JSONL mutation.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot Agent 1 missing-linkage review docket complete (${output.summary.status}). Rows: ${output.summary.review_rows}; report: ${options.report}`);
if (issues.length) process.exit(1);

function reviewAsk(row) {
  if (row.linkage_candidate_bucket === 'no_current_stem_source_candidate_found') {
    return 'Report exact blocker or name the pipeline source lookup needed; no linkage rule candidate is present in current evidence.';
  }
  if (row.linkage_candidate_bucket === 'single_stem_candidate_found_current_pipeline') {
    return 'Review whether the single existing prefix-stem source candidate is sufficient evidence for a later linkage-rule proposal; do not assign lexicon_entry_id here.';
  }
  if (row.linkage_candidate_bucket === 'project_preferred_function_word_stem_candidate_exists') {
    return 'Review source/linkage evidence and identify whether Agent 13 project-preferred policy is needed before any later linkage-rule proposal.';
  }
  return 'Report ambiguity blocker or required arbitration evidence; no linkage-rule proposal should proceed from this docket.';
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--missing-linkage') parsed.missingLinkage = cleanRelativePath(argv[++index]);
    else if (arg === '--candidate-patch-docket') parsed.candidatePatchDocket = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent10_orot_missing_linkage_agent1_docket.mjs [--missing-linkage path] [--candidate-patch-docket path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Agent-1-Ready Orot Missing-Linkage Review Docket',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only Agent 1 review docket for Orot rows missing `lexicon_entry_id`.',
    '- This does not claim source custody, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted text, QA acceptance, public/runtime acceptance, publication readiness, public HUD mutation, route JSONL mutation, token-index mutation, lexical payload mutation, or any lexicon entry assignment.',
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
    `- Review rows / occurrences: ${data.summary.review_rows} / ${data.summary.review_occurrences}`,
    `- No-current-stem-source rows / occurrences: ${data.summary.no_current_stem_source_candidate_rows} / ${data.summary.no_current_stem_source_candidate_occurrences}`,
    `- Single-stem candidate rows / occurrences: ${data.summary.single_stem_candidate_rows} / ${data.summary.single_stem_candidate_occurrences}`,
    `- Project-preferred candidate rows / occurrences: ${data.summary.project_preferred_candidate_rows} / ${data.summary.project_preferred_candidate_occurrences}`,
    `- Multi-stem no-project-preferred rows / occurrences: ${data.summary.multi_stem_no_project_preferred_rows} / ${data.summary.multi_stem_no_project_preferred_occurrences}`,
    `- Candidate edges total: ${data.summary.candidate_edges_total}`,
    `- Project-preferred edges total: ${data.summary.project_preferred_edges_total}`,
    `- Mutation rows emitted: ${data.summary.mutation_rows_emitted}`,
    `- Source rows emitted: ${data.summary.source_rows_emitted}`,
    `- Lexicon entry ids assigned: ${data.summary.lexicon_entry_ids_assigned}`,
    `- Candidate patch currently prepared: ${data.summary.candidate_patch_rows_currently_prepared} rows / ${data.summary.candidate_patch_occurrences_currently_prepared} occurrences`,
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
    '## Review Rows',
    '',
    ...data.review_rows.map(reviewLine),
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

function reviewLine(row) {
  return `- ${row.token_id}: ${row.surface}; occurrences=${row.occurrences}; bucket=${row.linkage_candidate_bucket}; candidate_edges=${row.candidate_edge_count}; project_edges=${row.project_preferred_edge_count}; mutation_allowed=false; ask=${row.requested_agent1_review}`;
}

function runCommand([command, args]) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  return {
    command: [command, ...args].join(' '),
    exit_code: result.status,
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
  const normalized = String(value || '').replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}
