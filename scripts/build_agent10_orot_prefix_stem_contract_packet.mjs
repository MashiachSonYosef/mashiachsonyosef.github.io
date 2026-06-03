#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  counterpartCandidates: 'reports/agent2-orot-prefix-stem-counterpart-candidates-2026-06-03.json',
  missingLinkage: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json',
  liveGuard: 'reports/agent10-live-public-old-hud-guard-2026-06-03.json',
  jsonReport: `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-${dateSlug}.json`,
  report: `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const counterpart = readJson(options.counterpartCandidates);
const missingLinkage = readJson(options.missingLinkage);
const liveGuard = readJson(options.liveGuard);

const candidates = (counterpart.candidates || []).map((row) => ({
  queue_id: row.queue_id,
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  prefix_class: row.prefix_class,
  prefix_stem_key: row.prefix_stem_key,
  upstream_claim_id: row.upstream?.claim_id || '',
  upstream_claim_file: row.upstream?.claim_file || '',
  upstream_route_family: row.upstream?.route_family || '',
  upstream_route_type: row.upstream?.route_type || '',
  upstream_surface: row.upstream?.surface || '',
  upstream_normalized: row.upstream?.normalized || '',
  counterpart_candidate_display: row.upstream?.counterpart_candidate_display || '',
  source_rows: row.upstream?.source_rows || [],
  match_percent: row.match_percent,
  match_percent_status: row.match_percent_status,
  release_contract_status: 'review_candidate_not_approved',
}));

const blockedGroups = Object.entries(counterpart.counts?.blocker_counts || {}).map(([blocker, rows]) => ({
  blocker,
  rows,
  occurrences: counterpart.counts?.blocker_occurrences?.[blocker] || 0,
  contract_position: blockedPosition(blocker),
}));

const issues = [];
const warnings = [];

if (counterpart.counts?.candidate_rows !== 12) issues.push('Counterpart candidate row count drifted from expected 12.');
if (counterpart.counts?.candidate_occurrences !== 178) issues.push('Counterpart candidate occurrences drifted from expected 178.');
if (counterpart.counts?.answer_rows_emitted !== 0 || counterpart.counts?.public_hud_rows_emitted !== 0) {
  issues.push('Counterpart candidate report emitted answer/public HUD rows.');
}
if (missingLinkage.counts?.missing_lexicon_linkage_rows !== 13) issues.push('Missing-linkage row count drifted from expected 13.');
if (missingLinkage.counts?.lexicon_entry_ids_assigned !== 0) issues.push('Missing-linkage packet assigned lexicon entry ids.');
if (liveGuard.summary?.old_hud_exposure !== 'no') issues.push('Live guard does not prove old_hud_exposure=no for its bounded scope.');
if ((liveGuard.summary?.hard_old_marker_hit_checks || 0) !== 0) issues.push('Live guard found hard old-HUD marker hits.');
if ((liveGuard.summary?.warnings || 0) > 0) warnings.push('Live guard is WARN, not PASS; inspect watch markers before runtime acceptance.');
if (counterpart.counts?.match_percent_available_rows !== 0) warnings.push('Match-percent availability changed; this contract must be revisited before public display.');

const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent6_ready_orot_prefix_stem_contract_packet',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_orot_prefix_stem_contract_packet.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_contract_packet' : 'agent6_ready_contract_packet_not_approved',
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
    counterpart_candidates: options.counterpartCandidates,
    missing_linkage_candidates: options.missingLinkage,
    live_old_hud_guard: options.liveGuard,
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
  },
  proposed_contract: {
    name: 'OROT_PREFIX_STEM_COUNTERPART_DISPLAY_V1',
    decision_needed_from: ['Agent 6', 'Agent 13'],
    review_target: '12 source-clean single prefix/stem candidate rows only',
    target_rows: candidates.length,
    target_occurrences: sum(candidates.map((row) => row.occurrences)),
    display_scope_if_later_approved: [
      'pre-HUD reader counterpart candidate for the same Orot token rows only',
      'lineage label must remain candidate/evidence, not accepted gloss or translation',
      'match percent must remain hidden or explicitly unavailable until a pipeline source supplies it',
      'HUD remains the evidence layer and must keep source/license/citation rows',
    ],
    prohibited_under_this_contract: [
      'answer_eligible=true',
      'promote_to_answer=true',
      'public HUD mutation from this packet',
      'project-preferred multi-claim rows',
      'ambiguous stem rows',
      'missing-linkage rows',
      'no-upstream-claim rows',
      'using highest score as truth',
      'accepted translation text',
    ],
    required_before_any_public_hint_mutation: [
      'Agent 6 review of this packet',
      'Agent 13 product/semantic authority decision for candidate-label policy',
      'separate dry-run transform that emits candidate reader-hint patch only',
      'separate live old-HUD guard after any public artifact mutation',
      'Agent 4 browser-click proof if runtime/public behavior changes',
    ],
  },
  summary: {
    status: issues.length ? 'blocked_contract_packet' : (warnings.length ? 'warn_agent6_ready_contract_packet_not_approved' : 'agent6_ready_contract_packet_not_approved'),
    candidate_rows: candidates.length,
    candidate_occurrences: sum(candidates.map((row) => row.occurrences)),
    answer_rows_emitted: counterpart.counts?.answer_rows_emitted || 0,
    public_hud_rows_emitted: counterpart.counts?.public_hud_rows_emitted || 0,
    match_percent_available_rows: counterpart.counts?.match_percent_available_rows || 0,
    blocked_rows_outside_contract: counterpart.counts?.blocked_rows || 0,
    blocked_occurrences_outside_contract: counterpart.counts?.blocked_occurrences || 0,
    missing_linkage_rows: missingLinkage.counts?.missing_lexicon_linkage_rows || 0,
    live_old_hud_exposure: liveGuard.summary?.old_hud_exposure || 'unknown',
    live_guard_status: liveGuard.summary?.status || 'unknown',
    issues: issues.length,
    warnings: warnings.length,
  },
  issues,
  warnings,
  candidates,
  blocked_groups: blockedGroups,
  missing_linkage_summary: {
    rows: missingLinkage.counts?.missing_lexicon_linkage_rows || 0,
    occurrences: missingLinkage.counts?.missing_lexicon_linkage_occurrences || 0,
    bucket_counts: missingLinkage.counts?.bucket_counts || {},
    bucket_occurrences: missingLinkage.counts?.bucket_occurrences || {},
    next_route: missingLinkage.next_pipeline_route || null,
  },
  live_guard_summary: liveGuard.summary || null,
  next_executable_routes: [
    {
      route: 'Agent 6 review',
      target: options.report,
      purpose: 'pass/warn/block the prefix-stem counterpart display contract boundary only',
    },
    {
      route: 'Agent 13 decision',
      target: 'candidate-label policy',
      purpose: 'decide whether counterpart candidates may be shown pre-HUD as reader convenience, explicitly not accepted definitions',
    },
    {
      route: 'Agent 1 source/linkage review',
      target: options.missingLinkage,
      purpose: 'review 13 missing lexicon-linkage candidates before any upstream linkage mutation',
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
console.log(`Orot prefix/stem contract packet complete (${output.summary.status}). Report: ${options.report}`);
if (issues.length) process.exit(1);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--counterpart-candidates') parsed.counterpartCandidates = cleanRelativePath(argv[++index]);
    else if (arg === '--missing-linkage') parsed.missingLinkage = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent10_orot_prefix_stem_contract_packet.mjs [--counterpart-candidates path] [--missing-linkage path] [--live-guard path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function blockedPosition(blocker) {
  if (blocker === 'blocked_requires_project_preferred_lineage_contract') return 'excluded_from_v1_requires_separate_project_preferred_contract';
  if (blocker === 'blocked_source_linkage_or_source_issue') return 'excluded_from_v1_requires_agent1_linkage_review';
  if (blocker === 'blocked_ambiguous_stem_claims') return 'excluded_from_v1_requires_disambiguation_or_semantic_authority';
  if (blocker === 'blocked_no_upstream_claim') return 'excluded_from_v1_requires_pipeline_source_claim';
  return 'excluded_from_v1';
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Agent-6-Ready Orot Prefix/Stem Contract Packet',
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
    `- Candidate rows in V1 contract: ${data.summary.candidate_rows}`,
    `- Candidate occurrences in V1 contract: ${data.summary.candidate_occurrences}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Match percent available rows: ${data.summary.match_percent_available_rows}`,
    `- Blocked outside this V1 contract: ${data.summary.blocked_rows_outside_contract} rows / ${data.summary.blocked_occurrences_outside_contract} occurrences`,
    `- Missing-linkage rows: ${data.summary.missing_linkage_rows}`,
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
    '## Blocked Outside V1',
    '',
    ...data.blocked_groups.map((row) => `- ${row.blocker}: ${row.rows} rows / ${row.occurrences} occurrences; ${row.contract_position}`),
    '',
    '## Missing Linkage Summary',
    '',
    `- Rows / occurrences: ${data.missing_linkage_summary.rows} / ${data.missing_linkage_summary.occurrences}`,
    ...Object.entries(data.missing_linkage_summary.bucket_counts).map(([key, rows]) => `- ${key}: ${rows} rows / ${data.missing_linkage_summary.bucket_occurrences[key] || 0} occurrences`),
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
  return `- ${row.queue_id}: ${row.surface} -> ${row.prefix_stem_key}; occurrences=${row.occurrences}; upstream=${row.upstream_claim_id}; candidate="${row.counterpart_candidate_display}"; match_percent=${row.match_percent_status}; status=${row.release_contract_status}`;
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
