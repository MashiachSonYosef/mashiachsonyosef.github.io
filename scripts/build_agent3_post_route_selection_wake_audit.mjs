#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  matrix: 'reports/agent3-orot-route-selection-crossmatch-matrix-2026-06-05.json',
  goalBoard: 'data/control/agent_goal_board.json',
  standingQueue: 'data/control/spark_standing_queue.json',
  postCrossmatchWakeAudit: 'reports/agent3-post-crossmatch-reconciliation-wake-audit-2026-06-05.json',
  output: 'reports/agent3-post-route-selection-wake-audit-2026-06-05.json',
  report: 'reports/agent3-post-route-selection-wake-audit-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const matrix = readJson(options.matrix);
const goalBoard = readJson(options.goalBoard);
const standingQueue = readJson(options.standingQueue);
const postCrossmatchWakeAudit = readJson(options.postCrossmatchWakeAudit);

if (matrix.artifact_type !== 'agent3_orot_route_selection_crossmatch_matrix') {
  throw new Error(`${options.matrix} is not an Agent 3 route-selection crossmatch matrix`);
}
if (postCrossmatchWakeAudit.artifact_type !== 'agent3_post_crossmatch_reconciliation_wake_audit') {
  throw new Error(`${options.postCrossmatchWakeAudit} is not a post-crossmatch wake audit`);
}

const agent3Goal = (goalBoard.goals || []).find((goal) => goal.id === 'agent3-definition-occurrence-links') || {};
const standingAgent3 = (standingQueue.direct_agent_goal_proof || []).find((row) => row.production_lane === 'Agent 3') || {};
const headCommit = git(['rev-parse', '--short=9', 'HEAD']);
const matrixCommit = git(['log', '-1', '--format=%h', '--', options.matrix]);

const worksetsConsidered = [
  {
    workset_id: 'orot_route_selection_crossmatch_matrix',
    status: 'consumed_current_cycle',
    artifact: options.matrix,
    commit: matrixCommit || headCommit,
    rows: Number(matrix.counts?.token_index_rows || 0),
    occurrences: Number(matrix.counts?.occurrence_links || 0),
    candidate_mismatch_rows: Number(matrix.counts?.candidate_selection_mismatch_rows || 0),
    token_index_linkage_gap_rows: Number(matrix.counts?.candidate_token_index_linkage_gap_rows || 0),
    exact_blocker_rows: Number(matrix.counts?.exact_blocker_rows || 0),
    executable_agent3_workset: false,
    reason: 'Current cycle already produced and committed the evidence-only Orot route-selection crossmatch matrix.',
  },
  {
    workset_id: 'definition_workbench_usage_concordance_token_matrix',
    status: agent3Goal.latest_agent3_usage_concordance_token_matrix?.state || 'unknown',
    artifact: agent3Goal.latest_agent3_usage_concordance_token_matrix?.packet_json || null,
    queue_item: agent3Goal.latest_agent3_usage_concordance_token_matrix?.queue_item || null,
    executable_agent3_workset: false,
    reason: 'Current goal-board state is awaiting Agent 6 verdict, not a changed Agent 3 build target.',
  },
  {
    workset_id: 'standing_queue_deuteronomy_phase2_contract_gap',
    status: 'stale_non_executable_control_text',
    artifact: standingAgent3.current_artifact_or_exact_blocker || null,
    executable_agent3_workset: false,
    reason:
      'Standing queue still names a Deuteronomy phase-2 missing-contract gap, but the post-crossmatch audit observed zero direct executable Agent 3 worksets and one stale queue row.',
  },
];

const exactBlockers = [
  {
    blocker_id: 'no_new_exact_changed_agent3_workset_after_route_selection_matrix',
    owner: 'Agent 7/Agent 10 to supply changed workset; Agent 3 to execute when supplied',
    detail:
      'After consuming the Agent 12 route-selection workset, no second exact changed Agent 3 workset is present in the checked control surfaces.',
  },
  {
    blocker_id: 'standing_queue_deuteronomy_phase2_contract_gap_stale',
    owner: 'Agent 7/Agent 5 control refresh or Agent 10 release package owner',
    detail:
      'data/control/spark_standing_queue.json still carries older Deuteronomy phase-2 missing-contract language that current Agent 3 post-crossmatch audit already classified as stale/non-executable.',
  },
  {
    blocker_id: 'usage_concordance_token_matrix_awaiting_agent6',
    owner: 'Agent 6',
    detail:
      'Definition Workbench usage concordance/token matrix is awaiting Agent 6 verdict and does not require Agent 3 rerun unless Agent 6 returns a changed evidence requirement.',
  },
];

const wakeConditions = [
  {
    wake_id: 'route_selection_transform_workset',
    required_fields:
      'target rows, input matrix path, selected route/card IDs, expected transform owner, output schema, validator/gate, stop condition',
    owner: 'Agent 10 package intake; Agent 2 transform lane',
  },
  {
    wake_id: 'agent6_changed_evidence_requirement',
    required_fields: 'Agent 6 dated docket with exact Agent 3 evidence delta requested',
    owner: 'Agent 6',
  },
  {
    wake_id: 'changed_orot_route_selection_inputs',
    required_fields:
      'changed token-index, occurrence, reader-hint, or route-shard input path plus hash/mtime and target rows affected',
    owner: 'Agent 10 or Agent 7 to route changed input; Agent 3 to rerun matrix',
  },
  {
    wake_id: 'new_agent3_matrix_workset',
    required_fields: 'target | files | command/script | output artifact | schema/counts | validator | handoff owner | stop condition',
    owner: 'Agent 7/Agent 10',
  },
];

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_post_route_selection_wake_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_post_route_selection_wake_audit.mjs',
  lane_owner: 'Agent 3',
  status: 'exact_blocker_wake_condition',
  commit_context: {
    head_commit: headCommit,
    route_selection_matrix_commit: matrixCommit || headCommit,
  },
  inputs: {
    matrix: options.matrix,
    goal_board: options.goalBoard,
    standing_queue: options.standingQueue,
    post_crossmatch_wake_audit: options.postCrossmatchWakeAudit,
  },
  authority_boundary: {
    navigation_evidence_only: true,
    blocker_wake_condition_only: true,
    usage_as_definition_authority: false,
    definition_authority: false,
    route_publication_support: false,
    answer_selection: false,
    route_ranking: false,
    semantic_arbitration: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
  },
  schema_counts: {
    route_selection_rows: Number(matrix.counts?.token_index_rows || 0),
    route_selection_occurrence_links: Number(matrix.counts?.occurrence_links || 0),
    route_selection_candidate_mismatches: Number(matrix.counts?.candidate_selection_mismatch_rows || 0),
    route_selection_token_index_linkage_gaps: Number(matrix.counts?.candidate_token_index_linkage_gap_rows || 0),
    route_selection_exact_blockers: Number(matrix.counts?.exact_blocker_rows || 0),
    post_crossmatch_direct_executable_worksets: Number(
      postCrossmatchWakeAudit.schema_counts?.direct_agent3_executable_worksets || 0,
    ),
    post_crossmatch_stale_queue_rows: Number(
      postCrossmatchWakeAudit.schema_counts?.queue_stale_deuteronomy_contract_gap_rows || 0,
    ),
    current_direct_executable_worksets: 0,
    worksets_considered: worksetsConsidered.length,
    exact_blockers: exactBlockers.length,
    wake_conditions: wakeConditions.length,
    queue_mutations: 0,
    submitted_to_agent6: 0,
    acceptance_claims: 0,
    public_runtime_mutations: 0,
  },
  worksets_considered: worksetsConsidered,
  exact_blockers: exactBlockers,
  wake_conditions: wakeConditions,
  handoff: {
    release_package_owner: 'Agent 10',
    qa_boundary_owner: 'Agent 6 only when a dated docket is required',
    next_step:
      'Sleep this Agent 3 sublane until one wake condition supplies exact changed inputs; do not broaden discovery or rerun stale Deuteronomy contract text.',
  },
};

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 post-route-selection wake audit blockers=${artifact.schema_counts.exact_blockers} wake_conditions=${artifact.schema_counts.wake_conditions} executable=${artifact.schema_counts.current_direct_executable_worksets}`,
);

function writeMarkdown(outputPath, artifact) {
  const lines = [
    '# Agent 3 Post-Route-Selection Wake Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    'Status: exact_blocker_wake_condition. The Orot route-selection matrix was produced; no second exact changed Agent 3 workset is currently executable.',
    '',
    '## Counts',
    '',
    '| metric | count |',
    '|---|---:|',
    ...Object.entries(artifact.schema_counts).map(([key, value]) => `| ${key} | ${value} |`),
    '',
    '## Worksets Considered',
    '',
    '| workset | status | artifact | executable | reason |',
    '|---|---|---|---|---|',
    ...artifact.worksets_considered.map((row) =>
      `| ${escapeCell(row.workset_id)} | ${escapeCell(row.status)} | ${escapeCell(row.artifact || '')} | ${row.executable_agent3_workset} | ${escapeCell(row.reason)} |`,
    ),
    '',
    '## Exact Blockers',
    '',
    '| blocker | owner | detail |',
    '|---|---|---|',
    ...artifact.exact_blockers.map((row) => `| ${escapeCell(row.blocker_id)} | ${escapeCell(row.owner)} | ${escapeCell(row.detail)} |`),
    '',
    '## Wake Conditions',
    '',
    '| wake condition | owner | required fields |',
    '|---|---|---|',
    ...artifact.wake_conditions.map((row) => `| ${escapeCell(row.wake_id)} | ${escapeCell(row.owner)} | ${escapeCell(row.required_fields)} |`),
    '',
    '## Boundary',
    '',
    'Navigation/blocker evidence only. No QA/source/license/Definition/runtime/publication/product/answer acceptance, no route publication support, no usage-as-definition authority, and no accepted gloss/text.',
  ];
  fs.writeFileSync(abs(outputPath), `${lines.join('\n')}\n`);
}

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

function writeJson(outputPath, value) {
  fs.mkdirSync(path.dirname(abs(outputPath)), { recursive: true });
  fs.writeFileSync(abs(outputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(abs(filePath), 'utf8'));
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function abs(filePath) {
  return path.resolve(root, filePath);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    const normalizedKey = key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (normalizedKey in parsed) parsed[normalizedKey] = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
