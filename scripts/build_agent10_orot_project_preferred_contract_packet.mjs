#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  lineage: 'reports/agent2-orot-pilot-lineage-candidates-2026-06-03.json',
  liveGuard: 'reports/agent10-live-public-old-hud-guard-2026-06-03.json',
  jsonReport: `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-${dateSlug}.json`,
  report: `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const lineage = readJson(options.lineage);
const liveGuard = readJson(options.liveGuard);
const rows = (lineage.evaluations || []).filter((row) => row.lineage_status === 'project_preferred_stem_candidate_requires_lineage_contract');

const candidates = rows.map((row) => {
  const edges = (row.candidate_edges || []).filter((edge) => edge.relation === 'prefix_stem_key');
  const projectEdges = edges.filter((edge) => edge.upstream_route_family === 'project_lexical');
  const selected = projectEdges[0] || null;
  return {
    status: selected && projectEdges.length === 1 && edges.length > 1 ? 'project_preferred_contract_review_candidate' : 'blocked_project_preferred_contract_shape_drift',
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    prefix_class: row.prefix_class,
    prefix_stem_key: row.prefix_stem_key,
    source_status: row.source_status,
    source_issue_count: row.source_issue_count || 0,
    lexical_disambiguation_status: row.lexical_disambiguation_status,
    lexical_possible_entry_count: row.lexical_possible_entry_count,
    lexical_source_row_keys: row.lexical_source_row_keys || [],
    edge_count: edges.length,
    selected_project_edge: selected ? compactEdge(selected) : null,
    competing_edges: edges.filter((edge) => edge !== selected).map(compactEdge),
    competing_edge_count: edges.length - (selected ? 1 : 0),
    project_edge_count: projectEdges.length,
    match_percent: null,
    match_percent_status: 'not_available_in_lineage_candidate_input',
    public_emit_ready: false,
    answer_eligible: false,
    promote_to_answer: false,
    arbitration_required: true,
    release_contract_status: 'review_candidate_not_approved',
    requires_before_emit: [
      'Agent 6 review of whether project_lexical preference may select among multiple stem claims for reader counterpart candidates',
      'Agent 13 product/semantic policy decision that selected project edge may be shown as candidate evidence, not truth',
      'separate dry-run transform that emits candidate reader-hint patch only',
      'separate live old-HUD guard after any public artifact mutation',
    ],
    not_claimed: [
      'definition authority',
      'usage-as-definition authority',
      'accepted translation text',
      'public/runtime acceptance',
      'source/provenance custody',
      'publication readiness',
    ],
  };
});

const issues = [];
const warnings = [];
if (candidates.length !== 19) issues.push(`Expected 19 project-preferred rows; found ${candidates.length}.`);
if (sum(candidates.map((row) => row.occurrences)) !== 1024) issues.push(`Expected 1024 project-preferred occurrences; found ${sum(candidates.map((row) => row.occurrences))}.`);
if (candidates.some((row) => row.status !== 'project_preferred_contract_review_candidate')) {
  issues.push('One or more candidate rows drifted from the expected single selected project edge plus competing edges shape.');
}
if (liveGuard.summary?.old_hud_exposure !== 'no') issues.push('Live guard does not currently report old_hud_exposure=no.');
if ((liveGuard.summary?.hard_old_marker_hit_checks || 0) !== 0) issues.push('Live guard found hard old-HUD marker hits.');
if ((liveGuard.summary?.warnings || 0) > 0) warnings.push('Live guard is WARN, not PASS; watch markers remain outside hard old-HUD exposure.');

const edgeDistribution = countBy(candidates, (row) => String(row.edge_count));
const edgeOccurrenceDistribution = sumBy(candidates, (row) => String(row.edge_count), (row) => row.occurrences);
const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent6_ready_orot_project_preferred_contract_packet',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_orot_project_preferred_contract_packet.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_contract_packet' : 'agent6_ready_project_preferred_contract_packet_not_approved',
    evidence_only: true,
    no_agent6_verdict: true,
    no_qa_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_public_hud_mutation: true,
  },
  inputs: {
    lineage_report: options.lineage,
    live_old_hud_guard: options.liveGuard,
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    route_jsonl: null,
    public_hud_output: null,
  },
  proposed_contract: {
    name: 'OROT_PROJECT_PREFERRED_MULTI_STEM_COUNTERPART_DISPLAY_V1',
    decision_needed_from: ['Agent 6', 'Agent 13'],
    review_target: '19 clean-source rows where one project_lexical edge is present among multiple prefix-stem upstream claims',
    target_rows: candidates.length,
    target_occurrences: sum(candidates.map((row) => row.occurrences)),
    contract_question: 'May existing project_lexical preference select one counterpart candidate for reader convenience when multiple non-project stem claims also exist?',
    display_scope_if_later_approved: [
      'pre-HUD reader counterpart candidate for these exact Orot token rows only',
      'candidate label must disclose project-preferred arbitration',
      'all competing edges must remain reachable in HUD/evidence artifacts',
      'match percent must remain hidden or explicitly unavailable until a pipeline source supplies it',
      'selected text remains candidate evidence, not accepted gloss, definition, or translation',
    ],
    prohibited_under_this_contract: [
      'answer_eligible=true',
      'promote_to_answer=true',
      'public HUD mutation from this packet',
      'single-edge V1 rows already covered by prior packet',
      'ambiguous rows without a single project edge',
      'missing-linkage rows',
      'no-upstream-claim rows',
      'using highest score as truth',
      'accepted translation text',
    ],
    required_before_any_public_hint_mutation: [
      'Agent 6 review of this packet',
      'Agent 13 decision on project-preferred arbitration as reader convenience only',
      'separate dry-run transform that emits candidate reader-hint patch only',
      'separate diff proving no answer/public-HUD mutation occurred before approval',
      'separate live old-HUD guard after any public artifact mutation',
      'Agent 4 browser-click proof if runtime/public behavior changes',
    ],
  },
  summary: {
    status: issues.length ? 'blocked_contract_packet' : (warnings.length ? 'warn_agent6_ready_project_preferred_contract_packet_not_approved' : 'agent6_ready_project_preferred_contract_packet_not_approved'),
    candidate_rows: candidates.length,
    candidate_occurrences: sum(candidates.map((row) => row.occurrences)),
    selected_project_edges: sum(candidates.map((row) => row.project_edge_count)),
    competing_edges: sum(candidates.map((row) => row.competing_edge_count)),
    total_edges: sum(candidates.map((row) => row.edge_count)),
    edge_count_distribution: edgeDistribution,
    edge_occurrence_distribution: edgeOccurrenceDistribution,
    answer_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    match_percent_available_rows: 0,
    live_old_hud_exposure: liveGuard.summary?.old_hud_exposure || 'unknown',
    live_guard_status: liveGuard.summary?.status || 'unknown',
    issues: issues.length,
    warnings: warnings.length,
  },
  issues,
  warnings,
  candidates,
  next_executable_routes: [
    {
      route: 'Agent 6 review',
      target: options.report,
      purpose: 'pass/warn/block the project-preferred arbitration contract boundary only',
    },
    {
      route: 'Agent 13 decision',
      target: 'project-preferred candidate-label policy',
      purpose: 'decide whether project_lexical preference may select a pre-HUD counterpart candidate while remaining non-authoritative',
    },
  ],
  what_must_not_be_accepted: [
    'Agent 6 acceptance.',
    'QA acceptance.',
    'Validated public/runtime acceptance.',
    'Source custody.',
    'Source/provenance acceptance.',
    'Definition authority.',
    'Usage-as-definition authority.',
    'Translation output.',
    'Accepted translation text.',
    'Public HUD mutation.',
    'Publication readiness.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot project-preferred contract packet complete (${output.summary.status}). Report: ${options.report}`);
if (issues.length) process.exit(1);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--lineage') parsed.lineage = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent10_orot_project_preferred_contract_packet.mjs [--lineage path] [--live-guard path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function compactEdge(edge) {
  return {
    relation: edge.relation,
    upstream_claim_id: edge.upstream_claim_id,
    upstream_claim_file: edge.upstream_claim_file,
    upstream_route_family: edge.upstream_route_family,
    upstream_route_type: edge.upstream_route_type,
    upstream_surface: edge.upstream_surface,
    upstream_normalized: edge.upstream_normalized,
    counterpart_candidate_display: edge.upstream_gloss,
    upstream_source_rows: edge.upstream_source_rows || [],
    promote_to_answer: false,
  };
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Agent-6-Ready Orot Project-Preferred Contract Packet',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only contract packet prepared for Agent 6 review.',
    '- This is not an Agent 6 verdict, QA acceptance, source custody, Definition authority, usage-as-definition authority, public/runtime acceptance, publication readiness, public HUD mutation, or accepted text.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Candidate rows: ${data.summary.candidate_rows}`,
    `- Candidate occurrences: ${data.summary.candidate_occurrences}`,
    `- Selected project edges: ${data.summary.selected_project_edges}`,
    `- Competing edges: ${data.summary.competing_edges}`,
    `- Total edges: ${data.summary.total_edges}`,
    `- Edge-count distribution: ${JSON.stringify(data.summary.edge_count_distribution)}`,
    `- Edge occurrence distribution: ${JSON.stringify(data.summary.edge_occurrence_distribution)}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Match percent available rows: ${data.summary.match_percent_available_rows}`,
    `- Live old HUD exposure from guard: ${data.summary.live_old_hud_exposure}`,
    `- Live guard status: ${data.summary.live_guard_status}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Proposed Contract',
    '',
    `- Name: \`${data.proposed_contract.name}\``,
    `- Decision needed from: ${data.proposed_contract.decision_needed_from.join(', ')}`,
    `- Review target: ${data.proposed_contract.review_target}`,
    `- Contract question: ${data.proposed_contract.contract_question}`,
    `- Target rows / occurrences: ${data.proposed_contract.target_rows} / ${data.proposed_contract.target_occurrences}`,
    '',
    'Allowed only if later approved:',
    '',
    ...data.proposed_contract.display_scope_if_later_approved.map((item) => `- ${item}`),
    '',
    'Prohibited under this contract:',
    '',
    ...data.proposed_contract.prohibited_under_this_contract.map((item) => `- ${item}`),
    '',
    'Required before any public hint mutation:',
    '',
    ...data.proposed_contract.required_before_any_public_hint_mutation.map((item) => `- ${item}`),
    '',
    '## Candidate Rows',
    '',
    ...data.candidates.map(candidateLine),
    '',
    '## Next Executable Routes',
    '',
    ...data.next_executable_routes.map((row) => `- ${row.route}: \`${row.target}\` - ${row.purpose}`),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n'));
}

function candidateLine(row) {
  return `- ${row.queue_id}: ${row.surface} -> ${row.prefix_stem_key}; occurrences=${row.occurrences}; selected=${row.selected_project_edge?.upstream_claim_id || 'none'}; competing_edges=${row.competing_edge_count}; candidate="${row.selected_project_edge?.counterpart_candidate_display || ''}"; status=${row.release_contract_status}`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

function countBy(rows, keyFn) {
  const out = {};
  for (const row of rows) {
    const key = keyFn(row);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function sumBy(rows, keyFn, valueFn) {
  const out = {};
  for (const row of rows) {
    const key = keyFn(row);
    out[key] = (out[key] || 0) + Number(valueFn(row) || 0);
  }
  return out;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) {
    throw new Error(`Unsafe relative path: ${value}`);
  }
  return normalized;
}
