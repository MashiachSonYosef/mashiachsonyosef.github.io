#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  prefixContract: 'reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json',
  projectPreferredContract: 'reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json',
  missingLinkage: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json',
  liveGuard: 'reports/agent10-live-public-old-hud-guard-2026-06-03.json',
  jsonReport: `reports/agent2-orot-counterpart-hint-patch-preview-${dateSlug}.json`,
  report: `reports/agent2-orot-counterpart-hint-patch-preview-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const prefix = readJson(options.prefixContract);
const project = readJson(options.projectPreferredContract);
const missingLinkage = readJson(options.missingLinkage);
const liveGuard = readJson(options.liveGuard);

const prefixRows = (prefix.candidates || []).map((row) => toPreviewRow({
  sourceContract: 'OROT_PREFIX_STEM_COUNTERPART_DISPLAY_V1',
  sourceContractPath: options.prefixContract,
  contractStatus: prefix.boundary?.status || '',
  selectionBasis: 'single_prefix_stem_edge',
  row,
  selectedEdge: {
    upstream_claim_id: row.upstream_claim_id,
    upstream_claim_file: row.upstream_claim_file,
    upstream_route_family: row.upstream_route_family,
    upstream_route_type: row.upstream_route_type,
    upstream_surface: row.upstream_surface,
    upstream_normalized: row.upstream_normalized,
    counterpart_candidate_display: row.counterpart_candidate_display,
    upstream_source_rows: row.source_rows || [],
  },
  competingEdges: [],
}));

const projectRows = (project.candidates || []).map((row) => toPreviewRow({
  sourceContract: 'OROT_PROJECT_PREFERRED_MULTI_STEM_COUNTERPART_DISPLAY_V1',
  sourceContractPath: options.projectPreferredContract,
  contractStatus: project.boundary?.status || '',
  selectionBasis: 'project_lexical_preference_among_competing_stem_edges',
  row,
  selectedEdge: row.selected_project_edge || {},
  competingEdges: row.competing_edges || [],
}));

const previewRows = [...prefixRows, ...projectRows];
const issues = [];
const warnings = [];

if (prefix.summary?.candidate_rows !== 12) issues.push('Prefix/stem source contract candidate count drifted from expected 12.');
if (project.summary?.candidate_rows !== 19) issues.push('Project-preferred source contract candidate count drifted from expected 19.');
if (prefixRows.length !== 12) issues.push(`Prefix/stem preview row count drifted from expected 12 to ${prefixRows.length}.`);
if (projectRows.length !== 19) issues.push(`Project-preferred preview row count drifted from expected 19 to ${projectRows.length}.`);
if (previewRows.length !== 31) issues.push(`Combined preview row count drifted from expected 31 to ${previewRows.length}.`);
if (sum(prefixRows.map((row) => row.occurrences)) !== 178) issues.push('Prefix/stem preview occurrences drifted from expected 178.');
if (sum(projectRows.map((row) => row.occurrences)) !== 1024) issues.push('Project-preferred preview occurrences drifted from expected 1024.');
if (liveGuard.summary?.old_hud_exposure !== 'no') issues.push('Live guard does not currently report old_hud_exposure=no.');
if ((liveGuard.summary?.hard_old_marker_hit_checks || 0) !== 0) issues.push('Live guard found hard old-HUD marker hits.');
if ((liveGuard.summary?.warnings || 0) > 0) warnings.push('Live guard is WARN, not PASS; watch markers remain outside hard old-HUD exposure.');
if (new Set(previewRows.map((row) => row.token_id)).size !== previewRows.length) issues.push('Preview rows contain duplicate token ids.');
if (previewRows.some((row) => !row.reader_hint_candidate.display)) issues.push('One or more preview rows is missing display text.');

const output = {
  schema_version: 1,
  artifact_type: 'agent2_orot_counterpart_hint_patch_preview',
  generated_at: generatedAt,
  generator: 'scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs',
  commit_basis: {
    local_head: git('rev-parse HEAD'),
    origin_main: git('rev-parse origin/main'),
  },
  boundary: {
    status: issues.length ? 'blocked_preview_packet' : 'candidate_patch_preview_not_approved',
    pipeline_only: true,
    report_only: true,
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
    no_approved_reader_hint_patch: true,
  },
  inputs: {
    prefix_contract: options.prefixContract,
    project_preferred_contract: options.projectPreferredContract,
    missing_linkage_candidates: options.missingLinkage,
    live_old_hud_guard: options.liveGuard,
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    candidate_patch_file: null,
    public_hud_output: null,
    route_jsonl: null,
  },
  summary: {
    status: issues.length ? 'blocked_preview_packet' : (warnings.length ? 'warn_candidate_patch_preview_not_approved' : 'candidate_patch_preview_not_approved'),
    candidate_preview_rows: previewRows.length,
    candidate_preview_occurrences: sum(previewRows.map((row) => row.occurrences)),
    prefix_contract_rows: prefixRows.length,
    prefix_contract_occurrences: sum(prefixRows.map((row) => row.occurrences)),
    project_preferred_rows: projectRows.length,
    project_preferred_occurrences: sum(projectRows.map((row) => row.occurrences)),
    approved_patch_rows: 0,
    answer_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    match_percent_available_rows: 0,
    missing_linkage_rows_outside_preview: missingLinkage.counts?.missing_lexicon_linkage_rows || 0,
    missing_linkage_occurrences_outside_preview: missingLinkage.counts?.missing_lexicon_linkage_occurrences || 0,
    live_old_hud_exposure: liveGuard.summary?.old_hud_exposure || 'unknown',
    live_guard_status: liveGuard.summary?.status || 'unknown',
    issues: issues.length,
    warnings: warnings.length,
  },
  issues,
  warnings,
  preview_policy: {
    intended_use: 'review-only candidate reader-hint patch preview for Orot counterpart display',
    may_become_public_only_after: [
      'Agent 6 review of source contract packets and this preview',
      'Agent 13 approval of candidate-label policy',
      'separate transform run that emits an approved candidate patch',
      'separate public HUD artifact mutation review',
      'live old-HUD guard after any public artifact mutation',
      'Agent 4 browser-click proof if runtime/public behavior changes',
    ],
    prohibited_now: [
      'writing data/public-hud/orot/reader-hints.json',
      'writing route lookup shards',
      'answer_eligible=true',
      'promote_to_answer=true',
      'accepted gloss or translation text',
      'source custody or source acceptance',
      'definition authority or usage-as-definition authority',
    ],
  },
  preview_rows: previewRows,
  blocked_outside_preview: {
    missing_linkage: {
      rows: missingLinkage.counts?.missing_lexicon_linkage_rows || 0,
      occurrences: missingLinkage.counts?.missing_lexicon_linkage_occurrences || 0,
      bucket_counts: missingLinkage.counts?.bucket_counts || {},
      bucket_occurrences: missingLinkage.counts?.bucket_occurrences || {},
    },
    prefix_contract_excluded: prefix.blocked_groups || [],
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
    'Accepted translation text.',
    'Public HUD mutation.',
    'Publication readiness.',
    'This preview as an approved reader-hint patch.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot counterpart hint patch preview complete (${output.summary.status}). Rows: ${output.summary.candidate_preview_rows}; occurrences: ${output.summary.candidate_preview_occurrences}; report: ${options.report}`);
if (issues.length) process.exit(1);

function toPreviewRow({ sourceContract, sourceContractPath, contractStatus, selectionBasis, row, selectedEdge, competingEdges }) {
  return {
    preview_status: 'candidate_hint_patch_preview_not_approved',
    source_contract: sourceContract,
    source_contract_path: sourceContractPath,
    source_contract_status: contractStatus,
    selection_basis: selectionBasis,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    prefix_class: row.prefix_class,
    prefix_stem_key: row.prefix_stem_key,
    reader_hint_candidate: {
      display: selectedEdge.counterpart_candidate_display || '',
      label: selectionBasis === 'project_lexical_preference_among_competing_stem_edges'
        ? 'project-preferred counterpart candidate'
        : 'counterpart candidate',
      label_status: 'candidate_not_approved',
      match_percent: null,
      match_percent_status: 'not_available_in_contract_inputs',
      selected_claim_id: selectedEdge.upstream_claim_id || '',
      selected_claim_file: selectedEdge.upstream_claim_file || '',
      selected_route_family: selectedEdge.upstream_route_family || '',
      selected_route_type: selectedEdge.upstream_route_type || '',
      selected_surface: selectedEdge.upstream_surface || '',
      selected_normalized: selectedEdge.upstream_normalized || '',
      selected_source_rows: selectedEdge.upstream_source_rows || [],
    },
    competing_edges: competingEdges.map((edge) => ({
      upstream_claim_id: edge.upstream_claim_id,
      upstream_claim_file: edge.upstream_claim_file,
      relation: edge.relation,
      upstream_route_family: edge.upstream_route_family,
      upstream_route_type: edge.upstream_route_type,
      upstream_surface: edge.upstream_surface,
      upstream_normalized: edge.upstream_normalized,
      counterpart_candidate_display: edge.counterpart_candidate_display,
      upstream_source_rows: edge.upstream_source_rows || [],
      promote_to_answer: false,
    })),
    competing_edge_count: competingEdges.length,
    public_emit_ready: false,
    approved_for_patch: false,
    answer_eligible: false,
    promote_to_answer: false,
    would_modify_public_hud: false,
    not_claimed: [
      'definition authority',
      'usage-as-definition authority',
      'accepted translation text',
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
    if (arg === '--prefix-contract') parsed.prefixContract = cleanRelativePath(argv[++index]);
    else if (arg === '--project-preferred-contract') parsed.projectPreferredContract = cleanRelativePath(argv[++index]);
    else if (arg === '--missing-linkage') parsed.missingLinkage = cleanRelativePath(argv[++index]);
    else if (arg === '--live-guard') parsed.liveGuard = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs [--prefix-contract path] [--project-preferred-contract path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 2 Orot Counterpart Hint Patch Preview',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Pipeline-only report preview; no public HUD data, route JSONL, approved patch file, answer row, or source mutation was emitted.',
    '- Preview text is candidate reader convenience only, not accepted gloss, translation, Definition authority, or usage-as-definition authority.',
    '- This is not Agent 6 acceptance, public/runtime acceptance, source custody, or publication readiness.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Candidate preview rows: ${data.summary.candidate_preview_rows}`,
    `- Candidate preview occurrences: ${data.summary.candidate_preview_occurrences}`,
    `- Prefix/stem contract rows / occurrences: ${data.summary.prefix_contract_rows} / ${data.summary.prefix_contract_occurrences}`,
    `- Project-preferred rows / occurrences: ${data.summary.project_preferred_rows} / ${data.summary.project_preferred_occurrences}`,
    `- Approved patch rows: ${data.summary.approved_patch_rows}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    `- Match percent available rows: ${data.summary.match_percent_available_rows}`,
    `- Missing-linkage rows outside preview: ${data.summary.missing_linkage_rows_outside_preview}`,
    `- Missing-linkage occurrences outside preview: ${data.summary.missing_linkage_occurrences_outside_preview}`,
    `- Live old HUD exposure: ${data.summary.live_old_hud_exposure}`,
    `- Live guard status: ${data.summary.live_guard_status}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Preview Policy',
    '',
    `- Intended use: ${data.preview_policy.intended_use}`,
    '',
    'May become public only after:',
    '',
    ...data.preview_policy.may_become_public_only_after.map((item) => `- ${item}`),
    '',
    'Prohibited now:',
    '',
    ...data.preview_policy.prohibited_now.map((item) => `- ${item}`),
    '',
    '## Preview Rows',
    '',
    ...data.preview_rows.map(previewLine),
    '',
    '## Blocked Outside Preview',
    '',
    `- Missing-linkage rows / occurrences: ${data.blocked_outside_preview.missing_linkage.rows} / ${data.blocked_outside_preview.missing_linkage.occurrences}`,
    ...Object.entries(data.blocked_outside_preview.missing_linkage.bucket_counts).map(([key, rows]) => `- ${key}: ${rows} rows / ${data.blocked_outside_preview.missing_linkage.bucket_occurrences[key] || 0} occurrences`),
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

function previewLine(row) {
  return `- ${row.queue_id}: ${row.surface} -> ${row.prefix_stem_key}; occurrences=${row.occurrences}; contract=${row.source_contract}; selected=${row.reader_hint_candidate.selected_claim_id}; candidate="${row.reader_hint_candidate.display}"; approved=false; public_emit_ready=false`;
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
