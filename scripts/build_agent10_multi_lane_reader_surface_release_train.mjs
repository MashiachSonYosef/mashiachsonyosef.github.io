#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  baseUrl: 'https://mashiachsonyosef.github.io',
  agent1Docket: 'reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.json',
  agent6Docket: 'reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.json',
  liveGuard: 'reports/agent10-live-public-old-hud-guard-2026-06-03-post-orot-missing-linkage-agent1-docket.json',
  jsonReport: `reports/agent10-multi-lane-reader-surface-release-train-${dateSlug}.json`,
  report: `reports/agent10-multi-lane-reader-surface-release-train-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const agent1Docket = readJson(options.agent1Docket);
const agent6Docket = readJson(options.agent6Docket);
const liveGuard = readJson(options.liveGuard);
const liveSummary = liveGuard.summary || {};
const issues = [];
const warnings = [];

const hardOldHudMarkers = [
  'Clicked Hebrew form',
  'Best actual hit',
  'Full source and license rows',
  'Rank details',
  'No lexical entry yet.',
  'Potential options',
  'Show potential options',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'data-hud-renderings',
  'data-hud-potential',
  'data-hud-related',
  'data-hud-sources',
  'lexical-fields',
  'clicked_hebrew_form',
  'routeHudInlineGlossMode',
];

const currentHudMarkers = [
  'data-route-hud-panel',
  'reader-workbench.js',
  'data/public-hud',
];

const activeWorkIds = ['orot', 'leviticus', 'numbers', 'ruth'];
const protectedWorkIds = ['deuteronomy', 'genesis', 'exodus'];
const liveChecks = [];
for (const workId of [...activeWorkIds, ...protectedWorkIds]) {
  liveChecks.push(await liveLaneCheck(workId));
}

const validationCommands = [
  ['node', ['scripts/validate_agent10_orot_missing_linkage_agent1_docket.mjs', options.agent1Docket]],
  ['node', ['scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs', options.agent6Docket]],
  ['node', ['scripts/validate_route_hud_page.mjs', '--page', 'orot/index.html', '--page', 'tanakh/genesis/index.html', '--page', 'tanakh/exodus/index.html', '--page', 'tanakh/leviticus/index.html', '--page', 'tanakh/numbers/index.html', '--page', 'tanakh/deuteronomy/index.html', '--page', 'tanakh/ruth/index.html']],
].map(runCommand);

if (liveSummary.old_hud_exposure !== 'no') issues.push('Base live old-HUD guard does not report old_hud_exposure=no.');
if ((liveSummary.hard_old_marker_hit_checks || 0) !== 0) issues.push('Base live old-HUD guard has hard old-HUD marker hits.');
if ((liveSummary.issues || 0) !== 0) issues.push('Base live old-HUD guard reports issues.');
if ((liveSummary.warnings || 0) > 0) warnings.push('Base live guard is WARN, not PASS; known watch-marker warning remains outside hard old-HUD exposure.');
for (const check of liveChecks) {
  if (check.page_status !== 200) issues.push(`${check.work_id} live page did not return 200.`);
  if (check.page_hard_old_marker_hits.length) issues.push(`${check.work_id} live page has hard old-HUD markers: ${check.page_hard_old_marker_hits.join(', ')}`);
  if (!check.current_hud_markers.includes('data-route-hud-panel')) issues.push(`${check.work_id} live page lacks data-route-hud-panel marker.`);
  if (check.manifest_status !== 200) issues.push(`${check.work_id} public HUD manifest did not return 200.`);
  if (check.reader_hints_status !== 200) issues.push(`${check.work_id} reader hints did not return 200.`);
  if (check.route_lookup_manifest_status !== 200) issues.push(`${check.work_id} route lookup manifest did not return 200.`);
}
for (const command of validationCommands) {
  if (command.exit_code !== 0) issues.push(`Validation command failed: ${command.command}`);
}

const lanes = [
  {
    lane_id: 'orot_flagship_data_fill',
    work_id: 'orot',
    route: '/orot/',
    lane_type: 'flagship_data_fill',
    current_state: 'candidate_patch_and_agent6_agent1_dockets_ready_not_accepted',
    current_evidence: [
      options.agent6Docket,
      options.agent1Docket,
      'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json',
      'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json',
    ],
    prepared_rows: agent6Docket.summary?.candidate_patch_rows || 0,
    prepared_occurrences: agent6Docket.summary?.candidate_patch_occurrences || 0,
    missing_linkage_rows: agent1Docket.summary?.review_rows || 0,
    next_packet: 'Agent 6 evidence disposition for 31-row candidate patch plus Agent 1 row-level missing-linkage disposition for 13 rows',
    stop_condition: 'Stop before public mutation unless Agent 6/Agent 1/Agent 13 return non-blocking scoped decisions.',
  },
  {
    lane_id: 'leviticus_agent6_runtime_review',
    work_id: 'leviticus',
    route: '/tanakh/leviticus/',
    lane_type: 'warm_runtime_review',
    current_state: 'live_current_hud_package_and_agent4_proof_exist_no_agent6_verdict',
    current_evidence: [
      'reports/agent10-candidate-page-4-shipment-prep-2026-06-02.md',
      'reports/agent4-leviticus-live-browser-click-proof-2026-06-02.md',
    ],
    next_packet: 'Agent 6 review docket for exact Leviticus #4 runtime surface using fresh lane-specific old-HUD guard and existing Agent 4 proof',
    stop_condition: 'Stop on any old-HUD hit, missing Agent 4 proof evidence, live/local source-of-truth conflict, or Agent 6 blocker.',
  },
  {
    lane_id: 'numbers_agent6_runtime_review',
    work_id: 'numbers',
    route: '/tanakh/numbers/',
    lane_type: 'warm_runtime_review',
    current_state: 'live_current_hud_package_and_agent4_proof_exist_no_agent6_verdict',
    current_evidence: [
      'reports/agent10-candidate-page-5-shipment-prep-2026-06-02.md',
      'reports/agent4-numbers-live-browser-click-proof-2026-06-02.md',
    ],
    next_packet: 'Agent 6 review docket for exact Numbers #5 runtime surface using fresh lane-specific old-HUD guard and existing Agent 4 proof',
    stop_condition: 'Stop on any old-HUD hit, missing Agent 4 proof evidence, live/local source-of-truth conflict, or Agent 6 blocker.',
  },
  {
    lane_id: 'ruth_agent4_browser_proof',
    work_id: 'ruth',
    route: '/tanakh/ruth/',
    lane_type: 'proof_needed',
    current_state: 'live_current_hud_package_exists_no_agent4_browser_proof_found',
    current_evidence: [
      'reports/agent10-candidate-page-6-shipment-prep-2026-06-02.md',
    ],
    next_packet: 'Bounded Ruth live browser-click proof before any Agent 6 review docket',
    stop_condition: 'Stop on old-HUD hit, failed HUD open, missing route cards/source rows, poisoned storage resurrection, or cadence decision requirement.',
  },
  {
    lane_id: 'baseline_preserve',
    work_id: 'deuteronomy_genesis_exodus',
    route: 'protected_baselines',
    lane_type: 'preserve_only',
    current_state: 'protected_warn_boundaries_or_existing_prepared_surface; no new proof loop unless drift appears',
    current_evidence: [
      'reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md',
      'reports/agent6-genesis-live-browser-proof-verdict-2026-06-02.md',
      'reports/agent10-candidate-page-3-shipment-prep-2026-06-02.md',
    ],
    next_packet: 'Monitor drift and old-HUD exposure only; do not consume proof cycles unless hashes/runtime change.',
    stop_condition: 'Wake Agent 4/6 only on runtime drift, old-HUD exposure, or manager/mission change.',
  },
];

const output = {
  schema_version: 1,
  artifact_type: 'agent10_multi_lane_reader_surface_release_train',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_multi_lane_reader_surface_release_train.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_release_train_packet' : 'multi_lane_release_train_evidence_only',
    evidence_only: true,
    pipeline_only: true,
    blocked_no_render: true,
    no_queue_acceptance: true,
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
    no_broad_render: true,
  },
  inputs: {
    agent1_missing_linkage_docket: options.agent1Docket,
    agent1_missing_linkage_docket_sha256: sha256File(options.agent1Docket),
    agent6_reader_hint_candidate_patch_docket: options.agent6Docket,
    agent6_reader_hint_candidate_patch_docket_sha256: sha256File(options.agent6Docket),
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
  sidecar_agents: [
    { id: '019e8cf0-1743-7250-8040-303a62ccb324', role: 'Orot continuation planner', result: 'recommended Agent 6 disposition, Agent 1 row disposition, and Agent 2 zero-or-safe dry-run transform packets' },
    { id: '019e8cf0-40bf-79e2-955e-6c2c18e8a322', role: 'release train organizer', result: 'recommended Orot flagship, protected Deuteronomy/Genesis, warm Numbers lane, and bounded role handoffs' },
    { id: '019e8cf0-02c4-7bf3-b5bd-b6693c30cae9', role: 'next-surface scout', result: 'recommended Leviticus, Numbers, and Ruth as highest-ROI actionable lanes' },
    { id: '019e8cf0-2be4-7241-b9e3-62ad28808821', role: 'runtime guard planner', result: 'recommended two-ring guard and lane-specific old-HUD checks before any gated claim' },
  ],
  roles: {
    agent1: 'source/provenance/license evidence and missing-linkage blocker maps; no custody acceptance',
    agent2: 'pipeline-generated route/definition data and zero-or-safe dry-run transforms; no manual definitions',
    agent4: 'browser/runtime proof against exact packages; no QA acceptance',
    agent6: 'sole scoped QA/compliance pass/warn/block docket authority',
    agent7: 'execution manager and cadence/staffing controller; not QA authority',
    agent10: 'release owner for packages, guards, deploy proof, and old-HUD exposure=0',
    agent12: 'budget/scope limiter and top-N guard',
    agent13: 'mission/semantic policy authority for label/arbitration decisions',
  },
  summary: {
    status: issues.length ? 'blocked_release_train_packet' : (warnings.length ? 'warn_multi_lane_release_train_evidence_only' : 'multi_lane_release_train_evidence_only'),
    active_lanes: 4,
    protected_lanes: 3,
    orot_candidate_patch_rows: agent6Docket.summary?.candidate_patch_rows || 0,
    orot_candidate_patch_occurrences: agent6Docket.summary?.candidate_patch_occurrences || 0,
    orot_missing_linkage_rows: agent1Docket.summary?.review_rows || 0,
    orot_missing_linkage_occurrences: agent1Docket.summary?.review_occurrences || 0,
    live_lanes_checked: liveChecks.length,
    live_page_200_count: liveChecks.filter((check) => check.page_status === 200).length,
    live_page_hard_old_marker_hits: sum(liveChecks.map((check) => check.page_hard_old_marker_hits.length)),
    live_data_endpoint_200_count: sum(liveChecks.map((check) => [check.manifest_status, check.reader_hints_status, check.route_lookup_manifest_status].filter((status) => status === 200).length)),
    base_live_old_hud_exposure: liveSummary.old_hud_exposure || 'unknown',
    base_hard_old_marker_hit_checks: liveSummary.hard_old_marker_hit_checks ?? null,
    validation_commands_passed: validationCommands.filter((command) => command.exit_code === 0).length,
    validation_commands_total: validationCommands.length,
    issues: issues.length,
    warnings: warnings.length,
  },
  lanes,
  live_lane_checks: liveChecks,
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
  recurring_guard_strategy: {
    local_pages: [
      'orot/index.html',
      'tanakh/genesis/index.html',
      'tanakh/exodus/index.html',
      'tanakh/leviticus/index.html',
      'tanakh/numbers/index.html',
      'tanakh/deuteronomy/index.html',
      'tanakh/ruth/index.html',
    ],
    live_paths_extra_not_in_base_guard: [
      '/tanakh/exodus/',
      '/tanakh/leviticus/',
      '/tanakh/numbers/',
      '/tanakh/ruth/',
    ],
    stop_conditions: [
      'any validator exits nonzero',
      'any hard old-HUD marker appears',
      'base live guard old_hud_exposure is not no',
      'hard old marker hit checks are nonzero',
      'a current-HUD lane lacks data-route-hud-panel',
      'quarantine paths return 200',
      'route lookup or answer safety fails',
      'payload/runtime thresholds fail',
      'Agent 6 returns BLOCK',
    ],
  },
  allowed_next_packets: [
    'Orot Agent 6 evidence disposition packet for the 31-row candidate patch.',
    'Orot Agent 1 row-level missing-linkage disposition packet for 13 rows.',
    'Orot Agent 2 zero-or-safe fill-producing dry-run transform packet.',
    'Leviticus Agent 6 runtime review docket with existing Agent 4 proof plus fresh lane-specific guard.',
    'Numbers Agent 6 runtime review docket with existing Agent 4 proof plus fresh lane-specific guard.',
    'Ruth bounded Agent 4 live browser-click proof before any Agent 6 review.',
  ],
  blocked_now: [
    'No broad render.',
    'No public HUD mutation from this packet.',
    'No route JSONL/shard mutation from this packet.',
    'No source/token-index/lexical payload mutation from this packet.',
    'No Orot/Leviticus/Numbers/Ruth runtime asset or HTML edit from this packet.',
    'No acceptance claim by Agent 10, Agent 1, Agent 2, Agent 4, Agent 7, Agent 12, or sidecar agents.',
  ],
  issues,
  warnings,
  what_must_not_be_accepted: [
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
    'Broad rollout.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Multi-lane reader surface release train packet complete (${output.summary.status}). Report: ${options.report}`);
if (issues.length) process.exit(1);

async function liveLaneCheck(workId) {
  const routePath = workId === 'orot' ? '/orot/' : `/tanakh/${workId}/`;
  const page = await fetchText(`${options.baseUrl}${routePath}?agent10_train=${Date.now()}`);
  const manifest = await fetchJson(`${options.baseUrl}/data/public-hud/${workId}/manifest.json?agent10_train=${Date.now()}`);
  const hints = await fetchJson(`${options.baseUrl}/data/public-hud/${workId}/reader-hints.json?agent10_train=${Date.now()}`);
  const routeLookup = await fetchJson(`${options.baseUrl}/data/public-hud/${workId}/route-lookup/manifest.json?agent10_train=${Date.now()}`);
  return {
    work_id: workId,
    route_path: routePath,
    page_status: page.status,
    page_bytes: page.bytes,
    page_sha256: page.sha256,
    page_hard_old_marker_hits: hardOldHudMarkers.filter((marker) => page.text.includes(marker)),
    current_hud_markers: currentHudMarkers.filter((marker) => page.text.includes(marker)),
    manifest_status: manifest.status,
    reader_hints_status: hints.status,
    route_lookup_manifest_status: routeLookup.status,
    hint_count: hints.json?.coverage?.hint_count ?? objectSize(hints.json?.hints),
    route_key_count: routeLookup.json?.counts?.public_route_key_count ?? null,
    shard_count: routeLookup.json?.counts?.shard_count ?? null,
    card_count: routeLookup.json?.counts?.card_count ?? null,
    total_shard_bytes: routeLookup.json?.counts?.total_shard_bytes ?? null,
    max_shard_bytes: routeLookup.json?.counts?.max_shard_bytes ?? null,
  };
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const text = await response.text();
  return {
    status: response.status,
    text,
    bytes: Buffer.byteLength(text),
    sha256: createHash('sha256').update(text).digest('hex'),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return {
    status: response.status,
    bytes: Buffer.byteLength(text),
    sha256: createHash('sha256').update(text).digest('hex'),
    json,
  };
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') parsed.baseUrl = argv[++index].replace(/\/$/, '');
    else if (arg === '--agent1-docket') parsed.agent1Docket = cleanRelativePath(argv[++index]);
    else if (arg === '--agent6-docket') parsed.agent6Docket = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent10_multi_lane_reader_surface_release_train.mjs [--live-guard path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Multi-Lane Reader Surface Release Train',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only release-train packet for coordinating Orot plus several warm public reader-surface lanes.',
    '- This packet does not render, mutate public HUD data, mutate route JSONL, edit runtime assets, accept QA/source/definition/publication state, or claim publication readiness.',
    '- The train remains blocked_no_render until exact lane packages are separately validated.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Active lanes: ${data.summary.active_lanes}`,
    `- Protected lanes: ${data.summary.protected_lanes}`,
    `- Orot candidate patch rows / occurrences: ${data.summary.orot_candidate_patch_rows} / ${data.summary.orot_candidate_patch_occurrences}`,
    `- Orot missing-linkage rows / occurrences: ${data.summary.orot_missing_linkage_rows} / ${data.summary.orot_missing_linkage_occurrences}`,
    `- Live lanes checked: ${data.summary.live_lanes_checked}`,
    `- Live page 200 count: ${data.summary.live_page_200_count}`,
    `- Live page hard old-HUD marker hits: ${data.summary.live_page_hard_old_marker_hits}`,
    `- Live data endpoint 200 count: ${data.summary.live_data_endpoint_200_count}`,
    `- Base live old HUD exposure: ${data.summary.base_live_old_hud_exposure}`,
    `- Base hard old marker hit checks: ${data.summary.base_hard_old_marker_hit_checks}`,
    `- Validation commands passed / total: ${data.summary.validation_commands_passed} / ${data.summary.validation_commands_total}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Active Lanes',
    '',
    ...data.lanes.map(laneLine),
    '',
    '## Live Lane Checks',
    '',
    ...data.live_lane_checks.map(liveLine),
    '',
    '## Sidecar Agents',
    '',
    ...data.sidecar_agents.map((agent) => `- ${agent.role} (${agent.id}): ${agent.result}`),
    '',
    '## Validation Evidence',
    '',
    ...data.validation_evidence.commands.map((command) => `- ${command.command}: exit=${command.exit_code}`),
    '',
    '## Allowed Next Packets',
    '',
    ...data.allowed_next_packets.map((item) => `- ${item}`),
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

function laneLine(lane) {
  return `- ${lane.lane_id}: ${lane.current_state}; next=${lane.next_packet}`;
}

function liveLine(row) {
  return `- ${row.work_id}: page=${row.page_status}; hard_old_hits=${row.page_hard_old_marker_hits.length}; hints=${row.hint_count}; route_keys=${row.route_key_count}; shards=${row.shard_count}; cards=${row.card_count}; max_shard_bytes=${row.max_shard_bytes}`;
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

function objectSize(value) {
  return value && typeof value === 'object' ? Object.keys(value).length : null;
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}
