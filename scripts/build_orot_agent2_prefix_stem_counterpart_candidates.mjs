#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  lineage: 'reports/agent2-orot-pilot-lineage-candidates-2026-06-03.json',
  jsonReport: `reports/agent2-orot-prefix-stem-counterpart-candidates-${dateSlug}.json`,
  report: `reports/agent2-orot-prefix-stem-counterpart-candidates-${dateSlug}.md`,
  status: 'stem_single_candidate_requires_lineage_contract',
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const lineage = readJson(options.lineage);
const evaluations = Array.isArray(lineage.evaluations) ? lineage.evaluations : [];

const candidates = [];
const blocked = [];

for (const row of evaluations) {
  const cleanSource = row.source_status === 'source_clean_consider' && Number(row.source_issue_count || 0) === 0;
  const singleStemContract = row.lineage_status === options.status;
  const edges = Array.isArray(row.candidate_edges) ? row.candidate_edges : [];
  const usableEdges = edges.filter((edge) => edge.relation === 'prefix_stem_key' && edge.upstream_claim_id);
  if (cleanSource && singleStemContract && usableEdges.length === 1) {
    const edge = usableEdges[0];
    candidates.push({
      status: 'counterpart_candidate_report_only',
      queue_id: row.queue_id,
      token_id: row.token_id,
      lexicon_entry_id: row.lexicon_entry_id,
      surface: row.surface,
      normalized: row.normalized,
      occurrences: row.occurrences,
      prefix_class: row.prefix_class,
      prefix_stem_key: row.prefix_stem_key,
      source_status: row.source_status,
      lexical_disambiguation_status: row.lexical_disambiguation_status,
      lexical_possible_entry_count: row.lexical_possible_entry_count,
      lexical_source_row_keys: row.lexical_source_row_keys || [],
      upstream: {
        relation: edge.relation,
        claim_id: edge.upstream_claim_id,
        claim_file: edge.upstream_claim_file,
        route_family: edge.upstream_route_family,
        route_type: edge.upstream_route_type,
        surface: edge.upstream_surface,
        normalized: edge.upstream_normalized,
        counterpart_candidate_display: edge.upstream_gloss,
        source_rows: edge.upstream_source_rows || [],
      },
      match_percent: null,
      match_percent_status: 'not_available_in_lineage_candidate_input',
      public_emit_ready: false,
      answer_eligible: false,
      promote_to_answer: false,
      requires_before_emit: [
        'lineage contract approval for prefix-stem counterpart display',
        'Agent 6 review of report-only candidate set',
        'separate pipeline transform if public reader hints are to be changed',
      ],
      not_claimed: [
        'definition authority',
        'usage-as-definition authority',
        'accepted translation text',
        'public/runtime acceptance',
        'source/provenance custody',
      ],
    });
    continue;
  }

  blocked.push({
    queue_id: row.queue_id,
    token_id: row.token_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    source_status: row.source_status,
    lineage_status: row.lineage_status,
    source_issue_count: row.source_issue_count || 0,
    candidate_edge_count: usableEdges.length,
    blocker: blockerFor(row, usableEdges),
  });
}

const counts = {
  input_rows: evaluations.length,
  input_occurrences: sum(evaluations.map((row) => row.occurrences)),
  candidate_rows: candidates.length,
  candidate_occurrences: sum(candidates.map((row) => row.occurrences)),
  blocked_rows: blocked.length,
  blocked_occurrences: sum(blocked.map((row) => row.occurrences)),
  answer_rows_emitted: 0,
  public_hud_rows_emitted: 0,
  match_percent_available_rows: candidates.filter((row) => row.match_percent !== null).length,
  blocker_counts: countBy(blocked, (row) => row.blocker),
  blocker_occurrences: sumBy(blocked, (row) => row.blocker, (row) => row.occurrences),
};

const output = {
  schema_version: 1,
  artifact_type: 'agent2_orot_prefix_stem_counterpart_candidates',
  generated_at: generatedAt,
  generator: 'scripts/build_orot_agent2_prefix_stem_counterpart_candidates.mjs',
  boundary: {
    status: 'report_only_no_answer_rows_no_public_hud_output',
    pipeline_only: true,
    not_definition_authority: true,
    not_translation_output: true,
    not_usage_as_definition: true,
    not_qa_acceptance: true,
    not_public_runtime_acceptance: true,
    not_publication_readiness: true,
    not_source_acceptance: true,
    not_public_deploy: true,
  },
  inputs: {
    lineage_report: options.lineage,
    selected_lineage_status: options.status,
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    route_jsonl: null,
    public_hud_output: null,
  },
  counts,
  candidates,
  blocked,
  next_pipeline_route: {
    smallest_safe_unblock: 'Define and review a prefix-stem counterpart-display lineage contract before any public reader-hint mutation.',
    suggested_followup_artifact: `reports/agent6-orot-prefix-stem-counterpart-contract-review-${dateSlug}.md`,
    target_rows_if_contract_approved: candidates.length,
    target_occurrences_if_contract_approved: counts.candidate_occurrences,
    still_blocked_after_contract: 'project-preferred, ambiguous, no-upstream-claim, and source-blocked rows remain outside this pass.',
  },
  what_must_not_be_accepted: [
    'Definition authority.',
    'Usage-as-definition authority.',
    'Accepted translation text.',
    'QA acceptance.',
    'Validated public/runtime acceptance.',
    'Source/provenance custody or acceptance.',
    'Publication readiness.',
    'Public HUD data mutation.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot prefix/stem counterpart candidate report complete. Candidates: ${counts.candidate_rows}; occurrences: ${counts.candidate_occurrences}; report: ${options.report}`);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--lineage') parsed.lineage = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--status') parsed.status = argv[++index];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_orot_agent2_prefix_stem_counterpart_candidates.mjs [--lineage path] [--json-report path] [--report path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function blockerFor(row, usableEdges) {
  if (row.source_status !== 'source_clean_consider' || Number(row.source_issue_count || 0) > 0) return 'blocked_source_linkage_or_source_issue';
  if (row.lineage_status === 'project_preferred_stem_candidate_requires_lineage_contract') return 'blocked_requires_project_preferred_lineage_contract';
  if (row.lineage_status === 'blocked_ambiguous_stem_claims') return 'blocked_ambiguous_stem_claims';
  if (row.lineage_status === 'blocked_no_upstream_claim') return 'blocked_no_upstream_claim';
  if (row.lineage_status === 'blocked_missing_lexicon_entry') return 'blocked_missing_lexicon_entry';
  if (row.lineage_status !== options.status) return `blocked_unselected_lineage_status:${row.lineage_status || 'missing'}`;
  if (usableEdges.length !== 1) return `blocked_expected_one_candidate_edge_found_${usableEdges.length}`;
  return 'blocked_unclassified';
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 2 Orot Prefix/Stem Counterpart Candidates',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Report only: no answer rows, no route JSONL, and no public HUD output were emitted.',
    '- Candidate text is a counterpart-display candidate, not a translation, accepted gloss, Definition authority, or usage-as-definition authority.',
    '- Match percent is not available in the lineage-candidate input and is not inferred here.',
    '- No QA acceptance, public/runtime acceptance, source custody, or publication readiness is claimed.',
    '',
    '## Summary',
    '',
    `- Input lineage report: \`${data.inputs.lineage_report}\``,
    `- Selected lineage status: \`${data.inputs.selected_lineage_status}\``,
    `- Candidate rows: ${data.counts.candidate_rows}`,
    `- Candidate occurrences: ${data.counts.candidate_occurrences}`,
    `- Blocked rows: ${data.counts.blocked_rows}`,
    `- Blocked occurrences: ${data.counts.blocked_occurrences}`,
    `- Answer rows emitted: ${data.counts.answer_rows_emitted}`,
    `- Public HUD rows emitted: ${data.counts.public_hud_rows_emitted}`,
    `- Match percent available rows: ${data.counts.match_percent_available_rows}`,
    '',
    '## Candidate Rows',
    '',
    ...(data.candidates.length ? data.candidates.map(candidateLine) : ['- none']),
    '',
    '## Blocker Counts',
    '',
    ...Object.entries(data.counts.blocker_counts).map(([key, value]) => `- ${key}: ${value} rows / ${data.counts.blocker_occurrences[key] || 0} occurrences`),
    '',
    '## Next Pipeline Route',
    '',
    `- Smallest safe unblock: ${data.next_pipeline_route.smallest_safe_unblock}`,
    `- Suggested follow-up artifact: \`${data.next_pipeline_route.suggested_followup_artifact}\``,
    `- Target if contract approved: ${data.next_pipeline_route.target_rows_if_contract_approved} rows / ${data.next_pipeline_route.target_occurrences_if_contract_approved} occurrences`,
    `- Still blocked after contract: ${data.next_pipeline_route.still_blocked_after_contract}`,
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
  const sourceRows = row.upstream.source_rows.join('; ') || 'none';
  return `- ${row.queue_id}: ${row.surface} -> stem ${row.prefix_stem_key}; occurrences=${row.occurrences}; upstream=${row.upstream.claim_id}; candidate="${row.upstream.counterpart_candidate_display}"; match_percent=not_available; source_rows=${sourceRows}`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
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
