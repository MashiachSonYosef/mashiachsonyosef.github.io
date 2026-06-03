#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  lineage: 'reports/agent2-orot-pilot-lineage-candidates-2026-06-03.json',
  jsonReport: `reports/agent1-orot-missing-lexicon-linkage-candidates-${dateSlug}.json`,
  report: `reports/agent1-orot-missing-lexicon-linkage-candidates-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const lineage = readJson(options.lineage);
const evaluations = Array.isArray(lineage.evaluations) ? lineage.evaluations : [];
const missingRows = evaluations.filter((row) => row.lineage_status === 'blocked_missing_lexicon_entry');

const candidates = missingRows.map((row) => {
  const edges = Array.isArray(row.candidate_edges) ? row.candidate_edges.filter((edge) => edge.relation === 'prefix_stem_key') : [];
  const projectEdges = edges.filter((edge) => edge.upstream_route_family === 'project_lexical');
  const bucket = classify(row, edges, projectEdges);
  return {
    status: 'source_linkage_candidate_report_only',
    queue_id: row.queue_id,
    token_id: row.token_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    prefix_class: row.prefix_class,
    prefix_stem_key: row.prefix_stem_key || '',
    missing_field: 'lexicon_entry_id',
    downstream_agent2_status: row.lineage_status,
    source_status: row.source_status,
    source_issue_count: row.source_issue_count || 0,
    linkage_candidate_bucket: bucket,
    candidate_edge_count: edges.length,
    project_preferred_edge_count: projectEdges.length,
    candidate_edges: edges.map((edge) => ({
      relation: edge.relation,
      upstream_claim_id: edge.upstream_claim_id,
      upstream_claim_file: edge.upstream_claim_file,
      upstream_route_family: edge.upstream_route_family,
      upstream_route_type: edge.upstream_route_type,
      upstream_surface: edge.upstream_surface,
      upstream_normalized: edge.upstream_normalized,
      upstream_gloss_sample: edge.upstream_gloss,
      upstream_source_rows: edge.upstream_source_rows || [],
      promote_to_answer: false,
    })),
    mutation_allowed_here: false,
    requires_before_mutation: [
      'Agent 1/source-owner review of linkage candidate bucket',
      'upstream token-index/linkage-rule decision if a candidate is accepted',
      'rerun lexical payload generation for Orot after any approved upstream linkage edit',
      'rerun Agent 2 dry-run reports after payload regeneration',
    ],
    not_claimed: [
      'source custody',
      'source/provenance acceptance',
      'definition authority',
      'usage-as-definition authority',
      'accepted text',
      'publication readiness',
      'public runtime acceptance',
    ],
  };
});

const counts = {
  input_rows: evaluations.length,
  missing_lexicon_linkage_rows: candidates.length,
  missing_lexicon_linkage_occurrences: sum(candidates.map((row) => row.occurrences)),
  bucket_counts: countBy(candidates, (row) => row.linkage_candidate_bucket),
  bucket_occurrences: sumBy(candidates, (row) => row.linkage_candidate_bucket, (row) => row.occurrences),
  mutation_rows_emitted: 0,
  source_rows_emitted: 0,
  lexicon_entry_ids_assigned: 0,
};

const output = {
  schema_version: 1,
  artifact_type: 'agent1_orot_missing_lexicon_linkage_candidates',
  generated_at: generatedAt,
  generator: 'scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs',
  boundary: {
    status: 'evidence_only_candidate_buckets_no_source_mutation',
    pipeline_only: true,
    not_source_custody: true,
    not_source_acceptance: true,
    not_definition_authority: true,
    not_usage_as_definition: true,
    not_qa_acceptance: true,
    not_public_runtime_acceptance: true,
    not_publication_readiness: true,
    not_public_deploy: true,
  },
  inputs: {
    lineage_report: options.lineage,
    selected_lineage_status: 'blocked_missing_lexicon_entry',
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    source_mutation: null,
    lexical_payload_mutation: null,
  },
  counts,
  candidates,
  next_pipeline_route: {
    smallest_safe_unblock: 'Agent 1/source-owner review of candidate buckets; no direct mutation from this packet.',
    if_linkage_rule_is_approved: [
      'apply the approved upstream token-index/linkage rule outside this packet',
      'rerun write_lexical_payloads.mjs for Orot',
      'rerun build_orot_agent2_pilot_lineage_candidates.mjs',
      'rerun build_orot_agent2_prefix_stem_counterpart_candidates.mjs',
    ],
    exact_non_pipeline_blocker: 'No approved source/linkage rule exists here for assigning missing lexicon_entry_id values.',
  },
  what_must_not_be_accepted: [
    'Source custody.',
    'Source/provenance acceptance.',
    'Definition authority.',
    'Usage-as-definition authority.',
    'Accepted translation text.',
    'QA acceptance.',
    'Validated public/runtime acceptance.',
    'Publication readiness.',
    'Any lexicon_entry_id mutation.',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Agent 1 Orot missing lexicon linkage candidate packet complete. Rows: ${counts.missing_lexicon_linkage_rows}; occurrences: ${counts.missing_lexicon_linkage_occurrences}; report: ${options.report}`);

function classify(row, edges, projectEdges) {
  if (!edges.length) return 'no_current_stem_source_candidate_found';
  if (edges.length === 1) return 'single_stem_candidate_found_current_pipeline';
  if (projectEdges.length === 1) return 'project_preferred_function_word_stem_candidate_exists';
  return 'multi_stem_no_project_preferred_candidate';
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--lineage') parsed.lineage = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs [--lineage path] [--json-report path] [--report path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 1 Orot Missing Lexicon Linkage Candidates',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only candidate buckets for Orot rows missing `lexicon_entry_id`.',
    '- No token-index, lexical payload, source row, or public HUD mutation was emitted.',
    '- This packet does not claim source custody, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted text, QA acceptance, public/runtime acceptance, or publication readiness.',
    '',
    '## Summary',
    '',
    `- Input lineage report: \`${data.inputs.lineage_report}\``,
    `- Missing linkage rows: ${data.counts.missing_lexicon_linkage_rows}`,
    `- Missing linkage occurrences: ${data.counts.missing_lexicon_linkage_occurrences}`,
    `- Mutation rows emitted: ${data.counts.mutation_rows_emitted}`,
    `- Source rows emitted: ${data.counts.source_rows_emitted}`,
    `- Lexicon entry ids assigned: ${data.counts.lexicon_entry_ids_assigned}`,
    '',
    '## Buckets',
    '',
    ...Object.entries(data.counts.bucket_counts).map(([key, value]) => `- ${key}: ${value} rows / ${data.counts.bucket_occurrences[key] || 0} occurrences`),
    '',
    '## Candidate Rows',
    '',
    ...data.candidates.map(candidateLine),
    '',
    '## Next Pipeline Route',
    '',
    `- Smallest safe unblock: ${data.next_pipeline_route.smallest_safe_unblock}`,
    `- Exact non-pipeline blocker: ${data.next_pipeline_route.exact_non_pipeline_blocker}`,
    '- If a linkage rule is approved:',
    ...data.next_pipeline_route.if_linkage_rule_is_approved.map((step) => `  - ${step}`),
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
  const edgeSummary = row.candidate_edges.length
    ? row.candidate_edges.map((edge) => `${edge.upstream_claim_id}:${edge.upstream_surface}`).join('; ')
    : 'none';
  return `- ${row.queue_id}: ${row.surface}; occurrences=${row.occurrences}; bucket=${row.linkage_candidate_bucket}; prefix_class=${row.prefix_class}; stem=${row.prefix_stem_key || 'none'}; edges=${edgeSummary}`;
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
