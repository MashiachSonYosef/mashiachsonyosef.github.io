#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const configs = {
  numbers: {
    title: 'Numbers',
    page: 'tanakh/numbers/',
    route: '/tanakh/numbers/',
    laneId: 'numbers_agent6_runtime_review',
    candidateNumber: 5,
    candidatePrep: 'reports/agent10-candidate-page-5-shipment-prep-2026-06-02.md',
    agent4Proof: 'reports/agent4-numbers-live-browser-click-proof-2026-06-02.json',
    agent4ProofReport: 'reports/agent4-numbers-live-browser-click-proof-2026-06-02.md',
    agent4Screenshot: 'reports/agent4-numbers-live-browser-click-proof-2026-06-02.png',
    agent4ArtifactType: 'agent4_numbers_live_browser_click_proof',
    expected: {
      required_checks_total: 10,
      hint_count: 5204,
      route_key_count: 2577,
      shard_count: 1429,
      card_count: 7054,
      max_shard_bytes: 61167,
      clicked_route_cards: 21,
      clicked_answer_cards: 2,
      clicked_source_rows: 3,
    },
  },
  ruth: {
    title: 'Ruth',
    page: 'tanakh/ruth/',
    route: '/tanakh/ruth/',
    laneId: 'ruth_agent4_browser_proof',
    candidateNumber: 6,
    candidatePrep: 'reports/agent10-candidate-page-6-shipment-prep-2026-06-02.md',
    agent4Proof: 'reports/agent4-ruth-live-browser-click-proof-2026-06-03.json',
    agent4ProofReport: 'reports/agent4-ruth-live-browser-click-proof-2026-06-03.md',
    agent4Screenshot: 'reports/agent4-ruth-live-browser-click-proof-2026-06-03.png',
    agent4ArtifactType: 'agent4_live_ruth_browser_runtime_evidence',
    expected: {
      required_checks_total: 7,
      hint_count: 676,
      route_key_count: 567,
      shard_count: 405,
      card_count: 1599,
      max_shard_bytes: 23873,
      clicked_route_cards: 8,
      clicked_answer_cards: 2,
      clicked_source_rows: 3,
    },
  },
};

const parsed = parseArgs(process.argv.slice(2));
const workId = parsed.workId || 'numbers';
const config = configs[workId];
if (!config) throw new Error(`Unsupported work id: ${workId}`);

const options = {
  releaseTrain: 'reports/agent10-multi-lane-reader-surface-release-train-2026-06-03.json',
  liveGuard: `reports/agent10-live-public-old-hud-guard-${dateSlug}-post-orot-zero-safe-pilot-docket.json`,
  jsonReport: `reports/agent10-agent6-ready-${workId}-runtime-review-docket-${dateSlug}.json`,
  report: `reports/agent10-agent6-ready-${workId}-runtime-review-docket-${dateSlug}.md`,
  ...config,
  ...parsed,
};

const generatedAt = new Date().toISOString();
const releaseTrain = readJson(options.releaseTrain);
const agent4Proof = readJson(options.agent4Proof);
const liveGuard = readJson(options.liveGuard);
const liveLane = (releaseTrain.live_lane_checks || []).find((row) => row.work_id === workId) || {};
const lane = (releaseTrain.lanes || []).find((row) => row.lane_id === options.laneId) || {};
const proofChecks = agent4Proof.checks || agent4Proof.summary?.checks || {};
const liveSummary = liveGuard.summary || {};
const validationCommands = [
  ['node', ['scripts/validate_agent10_multi_lane_reader_surface_release_train.mjs', options.releaseTrain]],
  ['node', ['scripts/validate_route_hud_page.mjs', '--page', 'tanakh/leviticus/index.html', '--page', 'tanakh/numbers/index.html', '--page', 'tanakh/ruth/index.html']],
].map(runCommand);

const issues = [];
const warnings = [];
const expected = options.expected;

if (releaseTrain.artifact_type !== 'agent10_multi_lane_reader_surface_release_train') issues.push('Release train artifact type is unexpected.');
if (releaseTrain.boundary?.no_public_runtime_acceptance !== true) issues.push('Release train boundary does not preserve no_public_runtime_acceptance=true.');
if (lane.current_state !== 'live_current_hud_package_and_agent4_proof_exist_no_agent6_verdict') {
  if (workId === 'ruth' && lane.current_state === 'live_current_hud_package_exists_no_agent4_browser_proof_found') {
    warnings.push('Release-train Ruth lane still says browser proof is missing; this docket supplies that proof and should supersede the stale lane state for review input only.');
  } else {
    issues.push(`${options.title} lane current_state is not the expected no-Agent-6-verdict state.`);
  }
}
if (liveLane.page_status !== 200) issues.push(`${options.title} live page does not report 200 in release train.`);
if ((liveLane.page_hard_old_marker_hits || []).length !== 0) issues.push(`${options.title} live lane reports hard old-HUD marker hits.`);
if (liveLane.manifest_status !== 200 || liveLane.reader_hints_status !== 200 || liveLane.route_lookup_manifest_status !== 200) issues.push(`${options.title} public-HUD dependencies are not all 200.`);
for (const [key, value] of Object.entries(expected)) {
  if (key.startsWith('clicked_') || key === 'required_checks_total') continue;
  if (liveLane[key] !== value) issues.push(`${options.title} ${key} drifted from expected ${value}.`);
}

if (agent4Proof.artifact_type !== options.agent4ArtifactType) issues.push('Agent 4 proof artifact type is unexpected.');
if (!String(agent4Proof.status || agent4Proof.summary?.status || '').startsWith('warn_')) issues.push('Agent 4 proof status should remain warn evidence.');
if (agent4Proof.evidence_only !== true && agent4Proof.boundary?.evidence_only !== true) issues.push('Agent 4 proof must be evidence_only.');
if (agent4Proof.no_self_acceptance !== true && agent4Proof.boundary?.no_self_acceptance !== true) issues.push('Agent 4 proof must not self-accept.');
for (const [name, passed] of Object.entries(proofChecks)) {
  if (passed !== true) issues.push(`Agent 4 proof check failed or missing: ${name}`);
}
if ((agent4Proof.issues || []).length !== 0) issues.push('Agent 4 proof reports issues.');
if ((agent4Proof.warnings || []).length > 0) warnings.push('Agent 4 proof is WARN because runtime script URL is not visibly versioned/cache-busted.');
if (agent4Proof.fullscreen_measurement?.hudOpen !== true) issues.push('Agent 4 fullscreen HUD did not open.');
if (agent4Proof.fullscreen_measurement?.fullscreenWidth !== true || agent4Proof.fullscreen_measurement?.fullscreenHeight !== true) issues.push('Agent 4 fullscreen measurement is not fullscreen.');
if ((agent4Proof.fullscreen_measurement?.oldMarkerHits || []).length !== 0) issues.push('Agent 4 fullscreen measurement has old-HUD marker hits.');
if ((agent4Proof.click_to_hud?.old_marker_hits || []).length !== 0) issues.push('Agent 4 click-to-HUD proof has old-HUD marker hits.');
if ((agent4Proof.query_string_negative?.click?.old_marker_hits || []).length !== 0) issues.push('Agent 4 old-HUD query proof has old-HUD marker hits.');
if ((agent4Proof.localStorage_indexedDB_negative?.click?.old_marker_hits || []).length !== 0) issues.push('Agent 4 poisoned storage proof has old-HUD marker hits.');
if ((agent4Proof.static_http?.old_marker_hits || []).length !== 0) issues.push('Agent 4 page static probe has old-HUD marker hits.');
if ((agent4Proof.runtime_static_probe?.old_marker_hits || []).length !== 0) issues.push('Agent 4 runtime static probe has old-HUD marker hits.');
if ((agent4Proof.route_shard_static_probe?.old_marker_hits || []).length !== 0) issues.push('Agent 4 route shard static probe has old-HUD marker hits.');
if (!fs.existsSync(path.join(root, options.agent4Screenshot))) issues.push('Agent 4 screenshot is missing.');
else if (typeof agent4Proof.screenshot === 'object' && agent4Proof.screenshot?.sha256 && agent4Proof.screenshot.sha256 !== sha256File(options.agent4Screenshot)) issues.push('Agent 4 screenshot sha256 mismatch.');

if (liveSummary.old_hud_exposure !== 'no') issues.push('Fresh live guard does not report old_hud_exposure=no.');
if ((liveSummary.hard_old_marker_hit_checks || 0) !== 0) issues.push('Fresh live guard reports hard old-HUD marker hits.');
if ((liveSummary.issues || 0) !== 0) issues.push('Fresh live guard reports issues.');
if ((liveSummary.warnings || 0) > 0) warnings.push('Fresh live guard is WARN, not PASS; known watch-marker warning remains outside hard old-HUD exposure.');
for (const command of validationCommands) {
  if (command.exit_code !== 0) issues.push(`Validation command failed: ${command.command}`);
}

const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent6_ready_runtime_review_docket',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_runtime_review_docket.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
    live_guard_commit_or_deploy_id: liveGuard.commit_or_deploy_id || null,
    agent4_observable_origin_main: agent4Proof.source_of_truth?.observable_origin_main || null,
  },
  boundary: {
    status: issues.length ? `blocked_${workId}_runtime_review_docket` : `agent6_ready_${workId}_runtime_review_docket_not_accepted`,
    evidence_only: true,
    pipeline_only: true,
    review_docket_only: true,
    exact_surface_only: true,
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
    no_deploy_or_cache_closure: true,
    no_broad_rollout: true,
  },
  inputs: {
    release_train: options.releaseTrain,
    release_train_sha256: sha256File(options.releaseTrain),
    candidate_prep: options.candidatePrep,
    candidate_prep_sha256: sha256File(options.candidatePrep),
    agent4_proof: options.agent4Proof,
    agent4_proof_sha256: sha256File(options.agent4Proof),
    agent4_proof_report: options.agent4ProofReport,
    agent4_proof_report_sha256: sha256File(options.agent4ProofReport),
    agent4_screenshot: options.agent4Screenshot,
    agent4_screenshot_sha256: sha256File(options.agent4Screenshot),
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
    requested_verdict_type: `pass_warn_block_on_${workId}_runtime_evidence_only`,
    review_target: `${options.title} exact public reader surface runtime evidence for candidate surface #${options.candidateNumber}`,
    decision_not_requested: [
      'QA acceptance by Agent 10',
      'validated public/runtime acceptance by Agent 10 or Agent 4',
      'source/provenance custody or acceptance',
      'Definition authority',
      'usage-as-definition authority',
      'accepted gloss or translation text',
      'publication readiness',
      'deployment/CDN/cache closure',
      'broad rollout',
    ],
    specific_questions: [
      `Does the existing Agent 4 ${options.title} browser proof satisfy the exact-surface runtime evidence boundary for Agent 6 review?`,
      'Does the current release-train live lane evidence preserve page 200, public-HUD dependencies 200, and hard old-HUD marker hits 0?',
      `What exact blocker remains before ${options.title} may be counted as a validated public reader surface under an Agent 6 boundary?`,
    ],
  },
  summary: {
    status: issues.length ? `blocked_${workId}_runtime_review_docket` : (warnings.length ? `warn_agent6_ready_${workId}_runtime_review_docket_not_accepted` : `agent6_ready_${workId}_runtime_review_docket_not_accepted`),
    page: options.page,
    work_id: workId,
    live_page_status: liveLane.page_status,
    live_page_hard_old_marker_hits: (liveLane.page_hard_old_marker_hits || []).length,
    manifest_status: liveLane.manifest_status,
    reader_hints_status: liveLane.reader_hints_status,
    route_lookup_manifest_status: liveLane.route_lookup_manifest_status,
    hint_count: liveLane.hint_count,
    route_key_count: liveLane.route_key_count,
    shard_count: liveLane.shard_count,
    card_count: liveLane.card_count,
    max_shard_bytes: liveLane.max_shard_bytes,
    agent4_status: agent4Proof.status || agent4Proof.summary?.status || null,
    agent4_required_checks_passed: Object.values(proofChecks).filter(Boolean).length,
    agent4_required_checks_total: Object.keys(proofChecks).length,
    agent4_hud_open: agent4Proof.fullscreen_measurement?.hudOpen === true,
    agent4_fullscreen_width: agent4Proof.fullscreen_measurement?.fullscreenWidth === true,
    agent4_fullscreen_height: agent4Proof.fullscreen_measurement?.fullscreenHeight === true,
    agent4_route_cards_clicked: agent4Proof.click_to_hud?.route_cards ?? null,
    agent4_answer_cards_clicked: agent4Proof.click_to_hud?.answer_cards ?? null,
    agent4_source_rows_clicked: agent4Proof.click_to_hud?.source_footnote_rows ?? null,
    agent4_old_marker_hits: countAgent4OldHits(agent4Proof),
    fresh_live_old_hud_exposure: liveSummary.old_hud_exposure || 'unknown',
    fresh_hard_old_marker_hit_checks: liveSummary.hard_old_marker_hit_checks ?? null,
    validation_commands_passed: validationCommands.filter((command) => command.exit_code === 0).length,
    validation_commands_total: validationCommands.length,
    issues: issues.length,
    warnings: warnings.length,
  },
  validation_evidence: {
    commands: validationCommands,
    release_train_lane: liveLane,
    agent4_browser_proof: {
      artifact: options.agent4Proof,
      report: options.agent4ProofReport,
      screenshot: options.agent4Screenshot,
      status: agent4Proof.status,
      checks: proofChecks,
      screenshot_sha256: agent4Proof.screenshot?.sha256 || null,
      fullscreen_measurement: agent4Proof.fullscreen_measurement || null,
      click_to_hud_summary: agent4Proof.click_to_hud ? {
        hud_open: agent4Proof.click_to_hud.hud_open,
        route_cards: agent4Proof.click_to_hud.route_cards,
        answer_cards: agent4Proof.click_to_hud.answer_cards,
        source_rows: agent4Proof.click_to_hud.source_footnote_rows,
        sources_visible: agent4Proof.click_to_hud.sources_and_licenses_visible,
        old_marker_hits: agent4Proof.click_to_hud.old_marker_hits || [],
      } : null,
      source_of_truth: agent4Proof.source_of_truth || null,
      warnings: agent4Proof.warnings || [],
      issues: agent4Proof.issues || [],
    },
    fresh_live_old_hud_guard: {
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
  allowed_next_routes: [
    `Agent 6 may issue a scoped pass/warn/block verdict for this exact ${options.title} runtime evidence packet.`,
    `If Agent 6 accepts with WARN, Agent 7 may sync the exact signed boundary only; Agent 10 should then prepare the next warm runtime lane or Ruth browser proof.`,
    'If Agent 6 blocks, Agent 10 should address only the exact runtime/evidence blocker without broad render or source mutation.',
  ],
  blocked_now: [
    `Do not count ${options.title} as a validated public reader surface from this Agent 10 docket alone.`,
    `Do not mutate public HUD data, route JSONL/shards, ${options.title} HTML, runtime JS/CSS, source files, or lexical payloads from this docket.`,
    'Do not claim source custody, Definition authority, accepted gloss, accepted translation text, publication readiness, deploy/cache closure, broad runtime acceptance, or QA acceptance.',
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
    'Deployment/CDN/cache closure.',
    'Publication readiness.',
    'Public HUD mutation.',
    'Route JSONL mutation.',
    'Runtime asset mutation.',
    'Broad rollout.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`${options.title} runtime review docket complete (${output.summary.status}). Report: ${options.report}`);
if (issues.length) process.exit(1);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--work-id') parsed.workId = argv[++index];
    else if (arg === '--release-train') parsed.releaseTrain = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(reportPath, data) {
  const lines = [
    `# Agent 10 Agent 6-Ready ${options.title} Runtime Review Docket`,
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    `Status: \`${data.summary.status}\``,
    '',
    `This is an evidence-only release-owner docket for the exact ${options.title} public reader surface. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source custody, publication readiness, deployment/cache closure, Definition authority, usage-as-definition authority, accepted text, translation output, or broad rollout approval.`,
    '',
    '## Candidate',
    '',
    `- Page: \`${data.summary.page}\``,
    `- Work ID: \`${data.summary.work_id}\``,
    `- Live page status: ${data.summary.live_page_status}`,
    `- Live hard old-HUD marker hits: ${data.summary.live_page_hard_old_marker_hits}`,
    `- Manifest / reader hints / route lookup: ${data.summary.manifest_status} / ${data.summary.reader_hints_status} / ${data.summary.route_lookup_manifest_status}`,
    `- Hints / route keys / shards / cards: ${data.summary.hint_count} / ${data.summary.route_key_count} / ${data.summary.shard_count} / ${data.summary.card_count}`,
    `- Max shard bytes: ${data.summary.max_shard_bytes}`,
    '',
    '## Agent 4 Browser Proof',
    '',
    `- Proof status: \`${data.summary.agent4_status}\``,
    `- Required checks passed / total: ${data.summary.agent4_required_checks_passed} / ${data.summary.agent4_required_checks_total}`,
    `- HUD open: ${data.summary.agent4_hud_open}`,
    `- Fullscreen width / height: ${data.summary.agent4_fullscreen_width} / ${data.summary.agent4_fullscreen_height}`,
    `- Route cards / answer cards / source rows after click: ${data.summary.agent4_route_cards_clicked} / ${data.summary.agent4_answer_cards_clicked} / ${data.summary.agent4_source_rows_clicked}`,
    `- Agent 4 old-marker hits: ${data.summary.agent4_old_marker_hits}`,
    `- Screenshot: \`${data.inputs.agent4_screenshot}\``,
    '',
    '## Fresh Old-HUD Guard',
    '',
    `- Guard artifact: \`${data.inputs.live_old_hud_guard}\``,
    `- Old HUD exposure: ${data.summary.fresh_live_old_hud_exposure}`,
    `- Hard marker hit checks: ${data.summary.fresh_hard_old_marker_hit_checks}`,
    '',
    '## Validation Evidence',
    '',
    ...data.validation_evidence.commands.map((command) => `- \`${command.command}\`: exit=${command.exit_code}`),
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

function countAgent4OldHits(proof) {
  return [
    ...(proof.fullscreen_measurement?.oldMarkerHits || []),
    ...(proof.click_to_hud?.old_marker_hits || []),
    ...(proof.query_string_negative?.click?.old_marker_hits || []),
    ...(proof.localStorage_indexedDB_negative?.click?.old_marker_hits || []),
    ...(proof.static_http?.old_marker_hits || []),
    ...(proof.runtime_static_probe?.old_marker_hits || []),
    ...(proof.route_shard_static_probe?.old_marker_hits || []),
  ].length;
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
