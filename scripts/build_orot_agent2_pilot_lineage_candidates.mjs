#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const defaults = {
  agent3Buckets: 'reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json',
  target: 'single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100',
  limit: 100,
  orotManifest: 'data/lexical/orot.manifest.json',
  definitionClaims: [
    '.local-cache/definition-routes/source-layer-definition-claims.jsonl',
    '.local-cache/definition-routes/kaikki-definition-claims.jsonl',
  ],
  jsonReport: 'reports/agent2-orot-pilot-lineage-candidates-2026-06-03.json',
  report: 'reports/agent2-orot-pilot-lineage-candidates-2026-06-03.md',
};

const niqqudRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const finalLetters = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);
const allowedLicenses = new Set([
  'project-authored / CC0',
  'CC0',
  'CC BY 4.0',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY-SA 4.0',
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0 / GFDL',
  'CC BY-SA 4.0/GFDL',
  'Public Domain',
  'Public Domain Mark',
  'N/A - project lexical rule',
  'N/A - project-authored lexical rules',
]);
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const knownDeniedSourceKeys = new Set([
  'curated|lex-aph-h639|source metadata incomplete',
  'curated|lex-mashiach-h4899|source metadata incomplete',
  'curated|lex-ruach-h7307|source metadata incomplete',
  'curated|lex-yhwh-h3068|source metadata incomplete',
]);

const args = parseArgs(process.argv.slice(2));
await main();

function parseArgs(argv) {
  const parsed = {
    ...defaults,
    definitionClaims: [...defaults.definitionClaims],
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--agent3-buckets') parsed.agent3Buckets = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--agent3-buckets=')) parsed.agent3Buckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--target') parsed.target = argv[++i];
    else if (arg.startsWith('--target=')) parsed.target = valueAfterEquals(arg);
    else if (arg === '--limit') parsed.limit = Number(argv[++i]);
    else if (arg.startsWith('--limit=')) parsed.limit = Number(valueAfterEquals(arg));
    else if (arg === '--orot-manifest') parsed.orotManifest = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--orot-manifest=')) parsed.orotManifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--definition-claim') parsed.definitionClaims.push(cleanRelativePath(argv[++i]));
    else if (arg.startsWith('--definition-claim=')) parsed.definitionClaims.push(cleanRelativePath(valueAfterEquals(arg)));
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--json-report=')) parsed.jsonReport = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  parsed.definitionClaims = unique(parsed.definitionClaims);
  if (!Number.isInteger(parsed.limit) || parsed.limit < 1) throw new Error('--limit must be a positive integer');
  return parsed;
}

async function main() {
  if (args.help) {
    console.log(usage());
    return;
  }

  const agent3 = readJson(args.agent3Buckets);
  const rows = selectAgent3Target(agent3).slice(0, args.limit);
  const lexical = loadOrotLexical(args.orotManifest);
  const lookupKeys = new Set();
  for (const row of rows) {
    if (row.normalized) lookupKeys.add(normalizeHebrew(row.normalized));
    if (row.prefix_stem_key) lookupKeys.add(normalizeHebrew(row.prefix_stem_key));
  }
  const claimsByNormalized = await loadAnswerClaims(args.definitionClaims, lookupKeys);
  const evaluations = rows.map((row) => evaluateRow(row, lexical, claimsByNormalized));
  const counts = summarize(evaluations);
  const result = {
    schema_version: 1,
    artifact_type: 'agent2_orot_pilot_lineage_candidates',
    generated_at: generatedAt,
    generator: 'scripts/build_orot_agent2_pilot_lineage_candidates.mjs',
    boundary: {
      status: 'lineage_candidates_only_no_answer_rows',
      not_definition_authority: true,
      not_translation_output: true,
      not_usage_as_definition: true,
      not_qa_acceptance: true,
      not_publication_readiness: true,
      not_source_acceptance: true,
      not_public_deploy: true,
    },
    inputs: {
      agent3_buckets: args.agent3Buckets,
      target: args.target,
      limit: args.limit,
      orot_manifest: args.orotManifest,
      definition_claims: args.definitionClaims,
    },
    outputs: {
      json_report: args.jsonReport,
      markdown_report: args.report,
    },
    counts,
    evaluations,
  };
  writeJson(args.jsonReport, result);
  writeReport(args.report, result);
  console.log(JSON.stringify({
    status: result.boundary.status,
    target_rows: counts.target_rows,
    target_occurrences: counts.target_occurrences,
    exact_single_candidate_rows: counts.exact_single_candidate_rows,
    stem_single_candidate_rows: counts.stem_single_candidate_rows,
    stem_multi_candidate_rows: counts.stem_multi_candidate_rows,
    stem_missing_candidate_rows: counts.stem_missing_candidate_rows,
    project_preferred_stem_candidate_rows: counts.project_preferred_stem_candidate_rows,
    source_clean_rows: counts.source_clean_rows,
    source_blocked_rows: counts.source_blocked_rows,
    report: args.report,
    json_report: args.jsonReport,
  }, null, 2));
}

function evaluateRow(row, lexical, claimsByNormalized) {
  const normalized = normalizeHebrew(row.normalized || row.surface || '');
  const stemKey = normalizeHebrew(row.prefix_stem_key || '');
  const exactClaims = answerClaimsFor(claimsByNormalized, normalized);
  const stemClaims = stemKey ? answerClaimsFor(claimsByNormalized, stemKey) : [];
  const projectPreferredStemClaims = stemClaims.filter((claim) => claim.route_family === 'project_lexical');
  const sourceLayerStemClaims = stemClaims.filter((claim) => claim.__file.includes('source-layer-definition-claims'));
  const lex = row.lexicon_entry_id ? lexical.entries.get(row.lexicon_entry_id) : null;
  const sourceRows = lex ? sourceRowsForEntry(lex.entry, lex.sourceRows, { includeSecondary: true }) : [];
  const sourceIssues = sourceRows.flatMap((sourceRow, index) => sourceRowIssues(sourceRow, index));
  const sourceStatus = sourceRows.length && sourceIssues.length === 0 ? 'source_clean_consider' : 'source_blocked';
  const lineageStatus = classifyLineage({
    row,
    lex,
    sourceStatus,
    exactClaims,
    stemClaims,
    projectPreferredStemClaims,
  });
  const candidateEdges = [];
  for (const claim of exactClaims.slice(0, 8)) {
    candidateEdges.push(makeEdge('exact_normalized', row, claim, 'exact upstream answer claim'));
  }
  for (const claim of stemClaims.slice(0, 8)) {
    candidateEdges.push(makeEdge('prefix_stem_key', row, claim, 'stem claim candidate requires lineage contract'));
  }
  return {
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id || '',
    surface: row.surface,
    normalized,
    occurrences: Number(row.occurrences || 0),
    prefix_class: row.prefix_class || '',
    prefix_stem_key: stemKey,
    source_status: sourceStatus,
    source_issue_count: sourceIssues.length,
    source_issues: unique(sourceIssues),
    lexical_disambiguation_status: lex?.entry?.disambiguation_status || '',
    lexical_context_note: lex?.entry?.context_note || '',
    lexical_possible_entry_count: Array.isArray(lex?.entry?.possible_entries) ? lex.entry.possible_entries.length : 0,
    lexical_source_row_count: sourceRows.length,
    lexical_source_row_keys: sourceRows.map(sourceRowKey).slice(0, 12),
    exact_upstream_claim_count: exactClaims.length,
    stem_upstream_claim_count: stemClaims.length,
    source_layer_stem_claim_count: sourceLayerStemClaims.length,
    project_preferred_stem_claim_count: projectPreferredStemClaims.length,
    lineage_status: lineageStatus,
    can_emit_answer_now: false,
    candidate_edges: candidateEdges,
  };
}

function classifyLineage({ row, lex, sourceStatus, exactClaims, stemClaims, projectPreferredStemClaims }) {
  if (!row.lexicon_entry_id) return 'blocked_missing_lexicon_entry';
  if (!lex) return 'blocked_missing_orot_lexicon_entry';
  if (sourceStatus !== 'source_clean_consider') return 'blocked_source_rows';
  if (exactClaims.length === 1) return 'exact_candidate_requires_agent6_review';
  if (exactClaims.length > 1) return 'blocked_ambiguous_exact_claims';
  if (stemClaims.length === 1) return 'stem_single_candidate_requires_lineage_contract';
  if (projectPreferredStemClaims.length === 1) return 'project_preferred_stem_candidate_requires_lineage_contract';
  if (stemClaims.length > 1) return 'blocked_ambiguous_stem_claims';
  return 'blocked_no_upstream_claim';
}

function makeEdge(relation, row, claim, note) {
  return {
    relation,
    promote_to_answer: false,
    blocker: relation === 'exact_normalized' ? 'requires_agent6_review' : 'missing_lineage_contract',
    note,
    source_token_id: row.token_id,
    source_queue_id: row.queue_id,
    source_normalized: row.normalized || '',
    source_prefix_stem_key: row.prefix_stem_key || '',
    upstream_claim_id: claim.claim_id,
    upstream_claim_file: claim.__file,
    upstream_route_family: claim.route_family,
    upstream_route_type: claim.route_type,
    upstream_surface: claim.surface || '',
    upstream_normalized: claim.normalized || '',
    upstream_gloss: definitionText(claim),
    upstream_source_rows: (claim.source_rows || []).map(sourceRowKey),
  };
}

function summarize(evaluations) {
  const counts = {
    target_rows: evaluations.length,
    target_occurrences: sum(evaluations.map((row) => row.occurrences)),
    source_clean_rows: 0,
    source_blocked_rows: 0,
    exact_single_candidate_rows: 0,
    exact_multi_candidate_rows: 0,
    exact_missing_candidate_rows: 0,
    stem_single_candidate_rows: 0,
    stem_multi_candidate_rows: 0,
    stem_missing_candidate_rows: 0,
    project_preferred_stem_candidate_rows: 0,
    source_layer_stem_candidate_rows: 0,
    current_answer_emit_ready_rows: 0,
    lineage_status_counts: {},
    lineage_status_occurrences: {},
  };
  for (const row of evaluations) {
    if (row.source_status === 'source_clean_consider') counts.source_clean_rows += 1;
    else counts.source_blocked_rows += 1;
    if (row.exact_upstream_claim_count === 0) counts.exact_missing_candidate_rows += 1;
    else if (row.exact_upstream_claim_count === 1) counts.exact_single_candidate_rows += 1;
    else counts.exact_multi_candidate_rows += 1;
    if (row.stem_upstream_claim_count === 0) counts.stem_missing_candidate_rows += 1;
    else if (row.stem_upstream_claim_count === 1) counts.stem_single_candidate_rows += 1;
    else counts.stem_multi_candidate_rows += 1;
    if (row.project_preferred_stem_claim_count === 1) counts.project_preferred_stem_candidate_rows += 1;
    if (row.source_layer_stem_claim_count > 0) counts.source_layer_stem_candidate_rows += 1;
    if (row.can_emit_answer_now) counts.current_answer_emit_ready_rows += 1;
    increment(counts.lineage_status_counts, row.lineage_status, 1);
    increment(counts.lineage_status_occurrences, row.lineage_status, row.occurrences);
  }
  return counts;
}

function selectAgent3Target(agent3) {
  const target = agent3?.recommended_highest_roi_subset;
  if (!target || target.name !== args.target) throw new Error(`Missing Agent 3 target ${args.target}`);
  if (!Array.isArray(target.subset)) throw new Error('Agent 3 target subset is missing');
  return target.subset;
}

async function loadAnswerClaims(files, lookupKeys) {
  const map = new Map();
  for (const file of files) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    const rl = readline.createInterface({
      input: fs.createReadStream(fullPath, 'utf8'),
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const claim = JSON.parse(trimmed);
      if (claim.answer_eligible !== true || claim.answer_role !== 'answer') continue;
      if (claim.route_type === 'form' || claim.meaning_quality === 'form_reference') continue;
      const normalized = normalizeHebrew(claim.normalized || claim.surface || '');
      if (!lookupKeys.has(normalized)) continue;
      if (!Array.isArray(claim.source_rows) || claim.source_rows.length === 0) continue;
      const sourceIssues = claim.source_rows.flatMap((row, index) => sourceRowIssues(row, index));
      if (sourceIssues.length) continue;
      if (!map.has(normalized)) map.set(normalized, []);
      map.get(normalized).push({ ...claim, normalized, __file: file });
    }
  }
  for (const bucket of map.values()) bucket.sort(compareClaims);
  return map;
}

function loadOrotLexical(manifestPath) {
  const manifest = readJson(manifestPath);
  const entries = new Map();
  for (const chunk of manifest.chunks || []) {
    const chunkUrl = chunk.url || chunk.path || (typeof chunk === 'string' ? chunk : '');
    if (!chunkUrl) continue;
    const chunkPath = path.join('data/lexical', chunkUrl);
    if (!fs.existsSync(path.join(root, chunkPath))) continue;
    const data = readJson(chunkPath);
    const sourceRows = data.source_rows || {};
    for (const entry of data.lexicon?.entries || []) {
      if (!entry.entry_id) continue;
      entries.set(entry.entry_id, {
        entry,
        chunk: chunkPath,
        sourceRows,
      });
    }
  }
  return { entries };
}

function sourceRowsForEntry(entry, sourceRowsById, options = {}) {
  const ids = [
    ...(Array.isArray(entry.source_row_ids) ? entry.source_row_ids : []),
    ...(options.includeSecondary && Array.isArray(entry.secondary_source_row_ids) ? entry.secondary_source_row_ids : []),
  ];
  const rows = [];
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (sourceRowsById[id]) rows.push(sourceRowsById[id]);
  }
  return rows;
}

function answerClaimsFor(map, key) {
  return map.get(normalizeHebrew(key)) || [];
}

function sourceRowIssues(row, index) {
  const issues = [];
  if (!row) {
    issues.push(`source_rows[${index}].missing`);
    return issues;
  }
  if (knownDeniedSourceKeys.has(sourceRowKey(row))) issues.push('known_incomplete_curated_source_row');
  for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
    if (!row[field]) issues.push(`source_rows[${index}].missing_${field}`);
  }
  const license = String(row.license || '');
  if (!license || forbiddenLicenseRe.test(license) || !allowedLicenses.has(license)) {
    issues.push(`source_rows[${index}].unsafe_license`);
  }
  if (/source metadata incomplete/i.test(`${row.notes || ''} ${row.source_id || ''}`)) {
    issues.push('source_metadata_incomplete');
  }
  return issues;
}

function writeReport(relativePath, data) {
  const statusRows = Object.entries(data.counts.lineage_status_counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const topCandidateRows = data.evaluations
    .filter((row) => [
      'stem_single_candidate_requires_lineage_contract',
      'project_preferred_stem_candidate_requires_lineage_contract',
      'exact_candidate_requires_agent6_review',
    ].includes(row.lineage_status))
    .slice(0, 25);
  const lines = [
    '# Agent 2 Orot Pilot Lineage Candidates',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    'This is a lineage-candidate artifact only. It does not emit answer rows, does not choose definitions, does not alter HUD/public files, and does not claim QA acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.',
    '',
    '## Inputs',
    '',
    `- Agent 3 buckets: \`${data.inputs.agent3_buckets}\``,
    `- Target: \`${data.inputs.target}\``,
    `- Limit: \`${data.inputs.limit}\``,
    `- Orot manifest: \`${data.inputs.orot_manifest}\``,
    ...data.inputs.definition_claims.map((file) => `- Definition claims: \`${file}\``),
    '',
    '## Counts',
    '',
    `- Target rows: ${data.counts.target_rows}`,
    `- Target occurrences: ${data.counts.target_occurrences}`,
    `- Source-clean rows: ${data.counts.source_clean_rows}`,
    `- Source-blocked rows: ${data.counts.source_blocked_rows}`,
    `- Exact single-candidate rows: ${data.counts.exact_single_candidate_rows}`,
    `- Stem single-candidate rows: ${data.counts.stem_single_candidate_rows}`,
    `- Stem multi-candidate rows: ${data.counts.stem_multi_candidate_rows}`,
    `- Stem missing-candidate rows: ${data.counts.stem_missing_candidate_rows}`,
    `- Project-preferred stem candidate rows: ${data.counts.project_preferred_stem_candidate_rows}`,
    `- Current answer emit-ready rows: ${data.counts.current_answer_emit_ready_rows}`,
    '',
    '## Lineage Status',
    '',
    '| status | rows | occurrences |',
    '|---|---:|---:|',
    ...statusRows.map(([status, count]) => `| ${status} | ${count} | ${data.counts.lineage_status_occurrences[status] || 0} |`),
    '',
    '## Top Candidate Rows',
    '',
    '| token | stem | occ. | status | stem claims | project claims |',
    '|---|---|---:|---|---:|---:|',
    ...topCandidateRows.map((row) => `| ${mdCell(row.surface)} | ${mdCell(row.prefix_stem_key)} | ${row.occurrences} | ${row.lineage_status} | ${row.stem_upstream_claim_count} | ${row.project_preferred_stem_claim_count} |`),
    '',
    '## Decision',
    '',
    'No row is answer-emission ready. The useful next contract is a non-semantic lineage rule that can carry `lookup_relation` plus selected `claim_id` or `card_id` from the queue into the answer-claim transform. Until that exists, stem candidates remain candidates only.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON input: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function compareClaims(a, b) {
  return (finiteNumber(b.answer_score) ?? finiteNumber(b.confidence) ?? 0)
    - (finiteNumber(a.answer_score) ?? finiteNumber(a.confidence) ?? 0)
    || String(a.claim_id || '').localeCompare(String(b.claim_id || ''));
}

function sourceRowKey(row) {
  return `${row?.source_family || ''}|${row?.source_id || ''}|${row?.license || ''}`;
}

function definitionText(row) {
  if (row?.definition) return String(row.definition);
  if (row?.gloss) return String(row.gloss);
  if (Array.isArray(row?.meanings)) return row.meanings.filter(Boolean).join('; ');
  return '';
}

function normalizeHebrew(value) {
  return [...String(value || '').normalize('NFC').replace(niqqudRe, '')]
    .map((char) => finalLetters.get(char) || char)
    .join('');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(value) {
  return String(value).split('=').slice(1).join('=');
}

function finiteNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function increment(object, key, amount = 1) {
  object[key] = (object[key] || 0) + amount;
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function usage() {
  return [
    'Usage:',
    '  node scripts/build_orot_agent2_pilot_lineage_candidates.mjs',
    '',
    'Options:',
    '  --agent3-buckets <path>',
    '  --target <name>',
    '  --limit <n>',
    '  --orot-manifest <path>',
    '  --definition-claim <jsonl>',
    '  --json-report <path>',
    '  --report <path>',
  ].join('\n');
}
