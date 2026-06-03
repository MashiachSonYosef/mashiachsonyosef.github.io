#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  pilot: 'reports/agent2-orot-pilot-answer-claims-2026-06-03.json',
  pilotReport: 'reports/agent2-orot-pilot-answer-claims-2026-06-03.md',
  sourceBlockerMap: 'reports/agent1-orot-top100-source-blocker-map-2026-06-03.md',
  agent6Requirements: 'reports/agent6-orot-fill-evidence-requirements-2026-06-03.md',
  liveGuard: `reports/agent10-live-public-old-hud-guard-${dateSlug}-post-orot-zero-safe-pilot-docket.json`,
  jsonReport: `reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-${dateSlug}.json`,
  report: `reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const pilot = readJson(options.pilot);
const liveGuard = readJson(options.liveGuard);
const validationCommands = [
  ['node', ['scripts/validate_agent2_orot_pilot_answer_claims.mjs', options.pilot]],
  ['node', ['scripts/validate_route_hud_page.mjs', '--page', 'orot/index.html', '--page', 'tanakh/deuteronomy/index.html', '--page', 'tanakh/genesis/index.html']],
].map(runCommand);

const issues = [];
const warnings = [];
const counts = pilot.counts || {};
const liveSummary = liveGuard.summary || {};
const routeJsonl = pilot.outputs?.route_claim_jsonl_requested || '.local-cache/definition-routes/orot-agent2-pilot-answer-claims.jsonl';

if (pilot.artifact_type !== 'agent2_orot_pilot_answer_claims_dry_run') issues.push('Pilot artifact type is unexpected.');
if (pilot.boundary?.status !== 'zero_safe_output_blocker') issues.push('Pilot is no longer zero_safe_output_blocker.');
if (pilot.boundary?.dry_run !== true) issues.push('Pilot is not a dry run.');
if (pilot.boundary?.output_written !== false) issues.push('Pilot claims output was written.');
if (counts.emitted_answer_rows !== 0) issues.push('Pilot emitted answer rows.');
if (counts.rows_with_exact_upstream_claim !== 0) issues.push('Pilot found exact upstream definition claims; reroute to audit before treating as zero-safe.');
if (pilot.outputs?.route_claim_jsonl !== null) issues.push('Pilot route_claim_jsonl output must be null.');
if (fs.existsSync(path.join(root, routeJsonl))) issues.push(`Pilot route claim JSONL exists unexpectedly: ${routeJsonl}`);
if (liveSummary.old_hud_exposure !== 'no') issues.push('Live guard does not report old_hud_exposure=no.');
if ((liveSummary.hard_old_marker_hit_checks || 0) !== 0) issues.push('Live guard reports hard old-HUD marker hits.');
if ((liveSummary.issues || 0) !== 0) issues.push('Live guard reports issues.');
if ((liveSummary.warnings || 0) > 0) warnings.push('Live guard is WARN, not PASS; known watch-marker warning remains outside hard old-HUD exposure.');
for (const command of validationCommands) {
  if (command.exit_code !== 0) issues.push(`Validation command failed: ${command.command}`);
}

const blockerRows = (pilot.evaluations || []).slice(0, 25).map((row) => ({
  queue_id: row.queue_id,
  token_id: row.token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  source_status: row.source_status,
  upstream_claim_count: row.upstream_claim_count,
  route_card_count: row.route_card_count,
  route_answer_card_count: row.route_answer_card_count,
  blockers: row.blockers || [],
  next_safe_route: row.source_status === 'source_clean_consider'
    ? 'needs exact upstream definition-route claim rejoin plus morphology/homograph safety before any later answer row'
    : 'needs Agent 1 source/linkage disposition before any later Agent 2 answer-row consideration',
}));

const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent2_ready_orot_zero_safe_pilot_docket',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_orot_zero_safe_pilot_docket.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_agent2_zero_safe_pilot_docket' : 'agent2_zero_safe_pilot_docket_not_accepted',
    evidence_only: true,
    pipeline_only: true,
    review_docket_only: true,
    zero_safe_output_only: true,
    no_agent2_definition_authority: true,
    no_agent6_verdict: true,
    no_qa_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_runtime_asset_mutation: true,
  },
  inputs: {
    pilot: options.pilot,
    pilot_sha256: sha256File(options.pilot),
    pilot_report: options.pilotReport,
    pilot_report_sha256: sha256File(options.pilotReport),
    source_blocker_map: options.sourceBlockerMap,
    source_blocker_map_sha256: sha256File(options.sourceBlockerMap),
    agent6_requirements: options.agent6Requirements,
    agent6_requirements_sha256: sha256File(options.agent6Requirements),
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
    target_agent: 'Agent 2',
    requested_verdict_type: 'pipeline_transform_followup_or_exact_blocker_only',
    review_target: 'Orot top-100 no-arbitration pilot emitted zero answer rows under current pipeline contracts',
    decision_not_requested: [
      'Definition authority',
      'accepted gloss or translation text',
      'source/provenance custody or acceptance',
      'QA acceptance',
      'public/runtime acceptance',
      'publication readiness',
      'public HUD mutation approval',
    ],
    specific_questions: [
      'Can an upstream definition-route claim source be generated by existing pipeline tools for the 87 source-clean rows without manual English definitions?',
      'Can the exact source-claim rejoin, morphology safety, and homograph safety gates be made machine-checkable?',
      'If no safe transform exists, confirm this zero-output blocker as the current Orot fill boundary and route Agent 1 for the 13 source-linkage rows.',
    ],
  },
  summary: {
    status: issues.length ? 'blocked_agent2_zero_safe_pilot_docket' : (warnings.length ? 'warn_agent2_zero_safe_pilot_docket_not_accepted' : 'agent2_zero_safe_pilot_docket_not_accepted'),
    target_rows: counts.target_rows,
    target_occurrences: counts.target_occurrences,
    source_clean_rows: counts.source_clean_rows,
    source_blocked_rows: counts.source_blocked_rows,
    rows_with_exact_upstream_claim: counts.rows_with_exact_upstream_claim,
    route_cards: counts.route_cards,
    route_answer_cards: counts.route_answer_cards,
    route_phrase_evidence_cards: counts.route_phrase_evidence_cards,
    route_citable_evidence_cards: counts.route_citable_evidence_cards,
    route_form_cards: counts.route_form_cards,
    route_lemma_cards: counts.route_lemma_cards,
    emitted_answer_rows: counts.emitted_answer_rows,
    blocked_rows: counts.blocked_rows,
    route_claim_jsonl_requested: routeJsonl,
    route_claim_jsonl_written: pilot.outputs?.route_claim_jsonl !== null,
    route_claim_jsonl_exists: fs.existsSync(path.join(root, routeJsonl)),
    live_old_hud_exposure: liveSummary.old_hud_exposure || 'unknown',
    live_guard_status: liveSummary.status || 'unknown',
    hard_old_marker_hit_checks: liveSummary.hard_old_marker_hit_checks ?? null,
    validation_commands_passed: validationCommands.filter((command) => command.exit_code === 0).length,
    validation_commands_total: validationCommands.length,
    issues: issues.length,
    warnings: warnings.length,
  },
  blocker_counts: pilot.blockers || {},
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
  sample_blocked_rows: blockerRows,
  allowed_next_routes: [
    'Agent 2 may propose a new pipeline-only upstream definition-route claim generator for the 87 source-clean rows, but must emit zero rows unless exact source-claim rejoin, morphology safety, and homograph safety pass.',
    'Agent 1 may review the 13 source-linkage blocked rows using the existing missing-linkage docket before those rows re-enter Agent 2 consideration.',
    'Agent 6 may review this docket only as evidence that the current top-100 pilot safely emitted zero answer rows.',
  ],
  blocked_now: [
    'No Orot answer rows are available from this pilot.',
    'No public Orot reader-hint or public-HUD mutation is allowed from this docket.',
    'No route JSONL/shard write is allowed from this docket.',
    'No Orot HTML or reader-workbench runtime asset edit is allowed from this docket.',
    'No accepted gloss, translation, source custody, Definition authority, usage-as-definition authority, QA acceptance, public/runtime acceptance, or publication readiness claim is allowed from this docket.',
  ],
  issues,
  warnings,
  what_must_not_be_accepted: [
    'Agent 2 Definition authority.',
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
    'Public HUD mutation.',
    'Route JSONL mutation.',
    'Runtime asset mutation.',
    'Publication readiness.',
    'This docket as a fill-producing Orot package.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot zero-safe pilot docket complete (${output.summary.status}). Report: ${options.report}`);
if (issues.length) process.exit(1);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--pilot') parsed.pilot = cleanRelativePath(argv[++index]);
    else if (arg === '--pilot-report') parsed.pilotReport = cleanRelativePath(argv[++index]);
    else if (arg === '--source-blocker-map') parsed.sourceBlockerMap = cleanRelativePath(argv[++index]);
    else if (arg === '--agent6-requirements') parsed.agent6Requirements = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(reportPath, data) {
  const lines = [
    '# Agent 10 Agent 2-Ready Orot Zero-Safe Pilot Docket',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    `Status: \`${data.summary.status}\``,
    '',
    'This is an evidence-only release-owner docket around the Agent 2 Orot top-100 dry run. It records that the current pipeline safely emitted zero answer rows. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source custody, publication readiness, Definition authority, usage-as-definition authority, accepted text, translation output, or public deploy approval.',
    '',
    '## Inputs',
    '',
    `- Pilot JSON: \`${data.inputs.pilot}\``,
    `- Pilot report: \`${data.inputs.pilot_report}\``,
    `- Source blocker map: \`${data.inputs.source_blocker_map}\``,
    `- Agent 6 requirements: \`${data.inputs.agent6_requirements}\``,
    `- Live old-HUD guard: \`${data.inputs.live_old_hud_guard}\``,
    '',
    '## Summary',
    '',
    `- Target rows / occurrences: ${data.summary.target_rows} / ${data.summary.target_occurrences}`,
    `- Source-clean rows: ${data.summary.source_clean_rows}`,
    `- Source-blocked rows: ${data.summary.source_blocked_rows}`,
    `- Rows with exact upstream definition claim: ${data.summary.rows_with_exact_upstream_claim}`,
    `- Route cards inspected: ${data.summary.route_cards}`,
    `- Route answer cards: ${data.summary.route_answer_cards}`,
    `- Emitted answer rows: ${data.summary.emitted_answer_rows}`,
    `- Blocked rows: ${data.summary.blocked_rows}`,
    `- Route JSONL written: ${data.summary.route_claim_jsonl_written}`,
    `- Route JSONL exists: ${data.summary.route_claim_jsonl_exists}`,
    `- Live old HUD exposure: ${data.summary.live_old_hud_exposure}`,
    `- Hard old-HUD marker hits: ${data.summary.hard_old_marker_hit_checks}`,
    `- Validation commands passed / total: ${data.summary.validation_commands_passed} / ${data.summary.validation_commands_total}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Blocker Counts',
    '',
    ...Object.entries(data.blocker_counts).map(([name, count]) => `- ${name}: ${count}`),
    '',
    '## Validation Evidence',
    '',
    ...data.validation_evidence.commands.map((command) => `- \`${command.command}\`: exit=${command.exit_code}`),
    '',
    '## Sample Blocked Rows',
    '',
    '| priority | token | surface | occ. | source | upstream claims | route cards | blockers |',
    '|---:|---|---|---:|---|---:|---:|---|',
    ...data.sample_blocked_rows.map((row, index) => `| ${index + 1} | \`${row.token_id}\` | ${row.surface} | ${row.occurrences} | ${row.source_status} | ${row.upstream_claim_count} | ${row.route_card_count} | ${(row.blockers || []).join(', ')} |`),
    '',
    '## Allowed Next Routes',
    '',
    ...data.allowed_next_routes.map((entry) => `- ${entry}`),
    '',
    '## Blocked Now',
    '',
    ...data.blocked_now.map((entry) => `- ${entry}`),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((entry) => `- ${entry}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((entry) => `- ${entry}`) : ['- None']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((entry) => `- ${entry}`),
    '',
  ];
  writeText(reportPath, lines.join('\n'));
}

function runCommand([command, args]) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  return {
    command: [command, ...args].join(' '),
    exit_code: result.status ?? 1,
    stdout_tail: tail(result.stdout || ''),
    stderr_tail: tail(result.stderr || ''),
  };
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, text) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), text);
}

function sha256File(relativePath) {
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function cleanRelativePath(value) {
  if (!value || path.isAbsolute(value) || value.includes('..')) throw new Error(`Unsafe path: ${value}`);
  return value.replaceAll('\\', '/');
}

function tail(text) {
  return text.split(/\r?\n/).filter(Boolean).slice(-8).join('\n');
}
