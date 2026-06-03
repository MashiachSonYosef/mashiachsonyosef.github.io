#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const defaults = {
  queue: 'reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json',
  agent3Buckets: 'reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json',
  target: 'single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100',
  limit: 100,
  output: '.local-cache/definition-routes/orot-agent2-pilot-answer-claims.jsonl',
  jsonReport: 'reports/agent2-orot-pilot-answer-claims-2026-06-03.json',
  report: 'reports/agent2-orot-pilot-answer-claims-2026-06-03.md',
  orotManifest: 'data/lexical/orot.manifest.json',
  routeLookupDir: 'data/definitions/hud-route-lookup/shards',
  definitionClaims: [
    '.local-cache/definition-routes/source-layer-definition-claims.jsonl',
    '.local-cache/definition-routes/kaikki-definition-claims.jsonl',
  ],
  dryRun: true,
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
const forbiddenTextNeedles = [
  ['translation', ' output'].join(''),
  ['accepted', ' translation'].join(''),
  ['No lexical entry', ' yet.'].join(''),
  ['Clicked Hebrew', ' form'].join(''),
  ['Best actual', ' hit'].join(''),
  ['data-hud', '-renderings'].join(''),
  ['data-selected', '-gloss'].join(''),
];
const forbiddenTextRe = new RegExp(forbiddenTextNeedles.map(escapeRegExp).join('|'), 'i');
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
    if (arg === '--queue') parsed.queue = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--queue=')) parsed.queue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--agent3-buckets') parsed.agent3Buckets = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--agent3-buckets=')) parsed.agent3Buckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--target') parsed.target = argv[++i];
    else if (arg.startsWith('--target=')) parsed.target = valueAfterEquals(arg);
    else if (arg === '--limit') parsed.limit = Number(argv[++i]);
    else if (arg.startsWith('--limit=')) parsed.limit = Number(valueAfterEquals(arg));
    else if (arg === '--output') parsed.output = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--json-report=')) parsed.jsonReport = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--orot-manifest') parsed.orotManifest = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--orot-manifest=')) parsed.orotManifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--route-lookup-dir') parsed.routeLookupDir = cleanRelativePath(argv[++i]);
    else if (arg.startsWith('--route-lookup-dir=')) parsed.routeLookupDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--definition-claim') parsed.definitionClaims.push(cleanRelativePath(argv[++i]));
    else if (arg.startsWith('--definition-claim=')) parsed.definitionClaims.push(cleanRelativePath(valueAfterEquals(arg)));
    else if (arg === '--write-output') parsed.dryRun = false;
    else if (arg === '--dry-run') parsed.dryRun = true;
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

  const queue = readJson(args.queue);
  const agent3 = readJson(args.agent3Buckets);
  const subset = selectAgent3Target(agent3).slice(0, args.limit);
  const queueById = indexQueue(queue);
  const lexical = loadOrotLexical(args.orotManifest);
  const normalizedTargets = new Set(subset.map((row) => row.normalized).filter(Boolean));
  const upstreamByNormalized = await loadUpstreamClaims(args.definitionClaims, normalizedTargets);
  const evaluations = [];
  const emittedRows = [];
  const counts = {
    target_rows: subset.length,
    target_occurrences: sum(subset.map((row) => Number(row.occurrences || 0))),
    source_clean_rows: 0,
    source_blocked_rows: 0,
    rows_with_exact_upstream_claim: 0,
    rows_with_route_cards: 0,
    route_cards: 0,
    route_answer_cards: 0,
    route_phrase_evidence_cards: 0,
    route_citable_evidence_cards: 0,
    route_form_cards: 0,
    route_lemma_cards: 0,
    emitted_answer_rows: 0,
    blocked_rows: 0,
  };
  const blockerCounts = {};

  for (const targetRow of subset) {
    const row = {
      ...targetRow,
      queue_row: queueById.get(targetRow.queue_id) || null,
    };
    const evaluation = evaluateRow(row, lexical, upstreamByNormalized);
    evaluations.push(evaluation);
    if (evaluation.source_status === 'source_clean_consider') counts.source_clean_rows += 1;
    else counts.source_blocked_rows += 1;
    if (evaluation.upstream_claim_count > 0) counts.rows_with_exact_upstream_claim += 1;
    if (evaluation.route_card_count > 0) counts.rows_with_route_cards += 1;
    counts.route_cards += evaluation.route_card_count;
    counts.route_answer_cards += evaluation.route_answer_card_count;
    counts.route_phrase_evidence_cards += evaluation.route_type_counts.phrase_evidence || 0;
    counts.route_citable_evidence_cards += evaluation.route_type_counts.citable_paraphrase_evidence || 0;
    counts.route_form_cards += evaluation.route_type_counts.form || 0;
    counts.route_lemma_cards += evaluation.route_type_counts.lemma || 0;
    if (evaluation.emit_row) emittedRows.push(evaluation.emit_row);
    else counts.blocked_rows += 1;
    for (const blocker of evaluation.blockers) increment(blockerCounts, blocker);
  }

  counts.emitted_answer_rows = emittedRows.length;
  const outputWritten = emittedRows.length > 0 && !args.dryRun;
  if (outputWritten) writeJsonl(args.output, emittedRows);
  else if (emittedRows.length === 0 && fs.existsSync(path.join(root, args.output))) {
    fs.rmSync(path.join(root, args.output), { force: true });
  }

  const result = {
    schema_version: 1,
    artifact_type: 'agent2_orot_pilot_answer_claims_dry_run',
    generated_at: generatedAt,
    generator: 'scripts/build_orot_agent2_pilot_answer_claims.mjs',
    boundary: {
      status: emittedRows.length ? 'pipeline_candidate_rows_available_not_accepted' : 'zero_safe_output_blocker',
      dry_run: args.dryRun,
      output_written: outputWritten,
      not_definition_authority: true,
      not_translation_output: true,
      not_usage_as_definition: true,
      not_qa_acceptance: true,
      not_publication_readiness: true,
      not_source_acceptance: true,
      not_public_deploy: true,
    },
    inputs: {
      queue: args.queue,
      agent3_buckets: args.agent3Buckets,
      target: args.target,
      limit: args.limit,
      orot_manifest: args.orotManifest,
      route_lookup_dir: args.routeLookupDir,
      definition_claims: args.definitionClaims,
    },
    outputs: {
      json_report: args.jsonReport,
      markdown_report: args.report,
      route_claim_jsonl: outputWritten ? args.output : null,
      route_claim_jsonl_requested: args.output,
    },
    counts,
    blockers: Object.fromEntries(Object.entries(blockerCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    target_summary: {
      name: args.target,
      pilot_rows: subset.length,
      pilot_occurrences: counts.target_occurrences,
    },
    emitted_claims: emittedRows.map((row) => ({
      claim_id: row.claim_id,
      surface: row.surface,
      normalized: row.normalized,
      upstream_definition_claim_id: row.upstream_definition_claim_id,
      answer_score: row.answer_score,
    })),
    evaluations,
  };

  writeJson(args.jsonReport, result);
  writeReport(args.report, result);
  console.log(JSON.stringify({
    status: result.boundary.status,
    emitted_answer_rows: counts.emitted_answer_rows,
    blocked_rows: counts.blocked_rows,
    json_report: args.jsonReport,
    report: args.report,
    output_written: outputWritten,
    route_claim_jsonl: outputWritten ? args.output : null,
    top_blockers: Object.entries(result.blockers).slice(0, 8),
  }, null, 2));
}

function evaluateRow(row, lexical, upstreamByNormalized) {
  const routeCards = loadRouteCards(row.normalized);
  const routeTypeCounts = {};
  for (const card of routeCards) increment(routeTypeCounts, card.route_type || 'missing');
  const upstreamClaims = (upstreamByNormalized.get(row.normalized) || [])
    .filter((claim) => isSafeAnswerClaim(claim))
    .sort(compareClaims);
  const lex = row.lexicon_entry_id ? lexical.entries.get(row.lexicon_entry_id) : null;
  const primarySourceRows = lex ? sourceRowsForEntry(lex.entry, lex.sourceRows, { includeSecondary: false }) : [];
  const sourceRows = lex ? sourceRowsForEntry(lex.entry, lex.sourceRows, { includeSecondary: true }) : [];
  const sourceIssues = sourceRows.flatMap((sourceRow, index) => sourceRowIssues(sourceRow, index));
  const blockers = [];
  if (!row.lexicon_entry_id) blockers.push('missing_lexicon_entry_id');
  if (!lex) blockers.push('missing_orot_lexicon_entry');
  if (!sourceRows.length) blockers.push('missing_orot_source_rows');
  for (const issue of unique(sourceIssues)) blockers.push(issue);
  if (upstreamClaims.length === 0) blockers.push('missing_exact_upstream_definition_claim');
  if (upstreamClaims.length > 1) blockers.push('ambiguous_exact_upstream_definition_claims');
  if (routeCards.every((card) => card.answer_eligible !== true)) blockers.push('current_route_cards_are_non_answer');
  if (routeCards.some((card) => ['phrase_evidence', 'citable_paraphrase_evidence', 'form'].includes(card.route_type))) {
    blockers.push('existing_cards_are_evidence_or_form_reference');
  }
  const selected = upstreamClaims.length === 1 ? upstreamClaims[0] : null;
  if (selected && !sourceRowsIntersect(selected.source_rows, sourceRows)) blockers.push('upstream_source_not_attached_to_orot_entry');
  if (selected && !homographSafetyProven(lex?.entry, selected)) blockers.push('homograph_safety_not_proven');
  if (selected && !prefixSafetyProven(row, selected)) blockers.push('prefix_or_article_safety_not_proven');
  if (selected && forbiddenTextRe.test(definitionText(selected))) blockers.push('forbidden_definition_text_marker');

  const sourceStatus = sourceRows.length && !sourceIssues.length ? 'source_clean_consider' : 'source_blocked';
  const canEmit = blockers.length === 0 && selected;
  return {
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id || '',
    surface: row.surface,
    normalized: row.normalized,
    occurrences: Number(row.occurrences || 0),
    prefix_class: row.prefix_class || '',
    prefix_stem_key: row.prefix_stem_key || '',
    route_card_count: routeCards.length,
    route_answer_card_count: routeCards.filter((card) => card.answer_eligible === true && card.answer_role === 'answer').length,
    route_type_counts: routeTypeCounts,
    upstream_claim_count: upstreamClaims.length,
    upstream_claim_ids: upstreamClaims.slice(0, 8).map((claim) => claim.claim_id),
    lexical_disambiguation_status: lex?.entry?.disambiguation_status || '',
    lexical_context_note: lex?.entry?.context_note || '',
    lexical_possible_entry_count: Array.isArray(lex?.entry?.possible_entries) ? lex.entry.possible_entries.length : 0,
    lexical_primary_source_row_count: primarySourceRows.length,
    lexical_secondary_source_row_count: Math.max(0, sourceRows.length - primarySourceRows.length),
    lexical_source_row_count: sourceRows.length,
    lexical_source_row_keys: sourceRows.map(sourceRowKey).slice(0, 12),
    source_status: sourceStatus,
    blockers: unique(blockers),
    emit_row: canEmit ? makePilotClaim(row, selected, lex.entry, sourceRows) : null,
  };
}

function makePilotClaim(row, upstream, lexicalEntry, sourceRows) {
  const claimId = stableId('def-orot-agent2-pilot', [
    row.queue_id,
    row.token_id,
    row.surface,
    row.normalized,
    upstream.claim_id,
  ]);
  const rawScore = finiteNumber(upstream.answer_score) ?? finiteNumber(upstream.confidence) ?? 100;
  const scoreHandicap = 20;
  const adjustedScore = Math.max(0, Math.min(100, rawScore - scoreHandicap));
  return {
    evidence_id: claimId,
    route_id: claimId,
    route_family: 'citable_paraphrase_evidence',
    route_type: 'citable_paraphrase_evidence',
    language: upstream.language || 'Hebrew',
    focus_surface: row.surface,
    focus_normalized: row.normalized,
    match_type: 'orot exact upstream definition claim plus source-linked pilot token',
    raw_score: rawScore,
    score_handicap: scoreHandicap,
    adjusted_score: adjustedScore,
    answer_score: adjustedScore,
    candidate_status: 'accepted',
    meaning_quality: 'paraphrase_evidence',
    answer_eligible: true,
    answer_role: 'answer',
    boundary_sensitive: false,
    boundary_safe: true,
    part_of_speech: upstream.part_of_speech || '',
    meanings: Array.isArray(upstream.meanings) ? upstream.meanings : [definitionText(upstream)].filter(Boolean),
    definition: definitionText(upstream),
    phrase_hebrew: row.surface,
    phrase_tokens: [{
      surface: row.surface,
      normalized: row.normalized,
      role: 'focus-token',
    }],
    source_ref: '',
    sefaria_ref: '',
    work_id: 'orot',
    work_title: 'Orot',
    unit_id: row.token_id || row.queue_id || '',
    source_definition_surface: upstream.surface || '',
    source_definition_normalized: upstream.normalized || '',
    source_definition_lookup_key: upstream.normalized || upstream.surface || '',
    source_rows: upstream.source_rows,
    agent2_boundary: {
      status: 'local_route_candidate_only',
      not_definition_authority: true,
      not_translation_output: true,
      not_usage_as_definition: true,
      not_qa_acceptance: true,
      not_publication_readiness: true,
      not_source_acceptance: true,
    },
    source_queue_id: row.queue_id,
    source_token_id: row.token_id,
    source_lookup_relation: 'exact_normalized',
    source_candidate_claim_id: upstream.claim_id,
    agent3_target_name: args.target,
    agent3_prefix_class: row.prefix_class || '',
    agent3_prefix_stem_key: row.prefix_stem_key || '',
    upstream_definition_claim_id: upstream.claim_id,
    upstream_definition_claim_file: upstream.__file || '',
    morphology_safety_basis: 'exact_normalized_upstream_claim_only_no_prefix_stripping',
    homograph_safety_basis: `lexical disambiguation ${lexicalEntry?.disambiguation_status || 'missing'} with attached source rows ${sourceRows.map(sourceRowKey).join(', ')}`,
  };
}

function selectAgent3Target(agent3) {
  const target = agent3?.recommended_highest_roi_subset;
  if (!target || target.name !== args.target) {
    throw new Error(`Agent 3 target ${args.target} not found in ${args.agent3Buckets}`);
  }
  if (!Array.isArray(target.subset)) throw new Error('Agent 3 target subset is missing');
  return target.subset;
}

function indexQueue(queue) {
  const rows = queue?.queue || queue?.rows || queue?.items || queue?.gaps || [];
  const map = new Map();
  if (Array.isArray(rows)) {
    for (const row of rows) {
      const id = row.queue_id || row.id || row.gap_id;
      if (id) map.set(id, row);
    }
  }
  return map;
}

function loadOrotLexical(manifestPath) {
  const manifest = readJson(manifestPath);
  const entries = new Map();
  const tokenForms = new Map();
  for (const chunk of manifest.chunks || []) {
    const chunkUrl = chunk.url || chunk.path || (typeof chunk === 'string' ? chunk : '');
    if (!chunkUrl) continue;
    const chunkPath = path.join('data/lexical', chunkUrl);
    if (!fs.existsSync(path.join(root, chunkPath))) continue;
    const data = readJson(chunkPath);
    for (const form of data.token_index?.forms || []) {
      if (form.token_index_id) tokenForms.set(form.token_index_id, form);
    }
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
  return { entries, tokenForms };
}

async function loadUpstreamClaims(files, normalizedTargets) {
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
      const normalized = normalizeHebrew(claim.normalized || claim.surface || '');
      if (!normalizedTargets.has(normalized)) continue;
      if (!map.has(normalized)) map.set(normalized, []);
      map.get(normalized).push({ ...claim, normalized, __file: file });
    }
  }
  return map;
}

function loadRouteCards(normalized) {
  const shardPath = path.join(args.routeLookupDir, `${shardFileKey(normalized)}.json`);
  const fullPath = path.join(root, shardPath);
  if (!fs.existsSync(fullPath)) return [];
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const cards = data.routes_by_normalized?.[normalized] || data[normalized] || [];
  return Array.isArray(cards) ? cards : [];
}

function sourceRowsForEntry(entry, sourceRowsById, options = {}) {
  const includeSecondary = options.includeSecondary === true;
  const ids = [
    ...(Array.isArray(entry.source_row_ids) ? entry.source_row_ids : []),
    ...(includeSecondary && Array.isArray(entry.secondary_source_row_ids) ? entry.secondary_source_row_ids : []),
  ];
  const seen = new Set();
  const rows = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (sourceRowsById[id]) rows.push(sourceRowsById[id]);
  }
  return rows;
}

function sourceRowsIntersect(leftRows = [], rightRows = []) {
  const right = new Set(rightRows.map(sourceRowKey));
  return leftRows.some((row) => right.has(sourceRowKey(row)));
}

function homographSafetyProven(entry, upstream) {
  if (!entry) return false;
  if (entry.disambiguation_status !== 'likely') return false;
  const possible = Array.isArray(entry.possible_entries) ? entry.possible_entries : [];
  const likely = possible.filter((candidate) => candidate.context_role === 'likely_contextual');
  if (likely.length !== 1) return false;
  return upstream.source_rows?.some((row) => {
    const key = `${row.source_family}:${row.source_id}`;
    return likely.some((candidate) => `${candidate.source_family}:${candidate.source_id}` === key);
  });
}

function prefixSafetyProven(row, upstream) {
  if (!row.prefix_class) return true;
  const upstreamNormalized = normalizeHebrew(upstream.normalized || upstream.surface || '');
  return upstreamNormalized === normalizeHebrew(row.normalized || row.surface || '');
}

function isSafeAnswerClaim(claim) {
  return claim?.answer_eligible === true
    && claim?.answer_role === 'answer'
    && claim?.route_type !== 'form'
    && claim?.meaning_quality !== 'form_reference'
    && Boolean(definitionText(claim))
    && !forbiddenTextRe.test(definitionText(claim))
    && Array.isArray(claim.source_rows)
    && claim.source_rows.length > 0
    && claim.source_rows.every((row, index) => sourceRowIssues(row, index).length === 0);
}

function sourceRowIssues(row, index) {
  const issues = [];
  if (!row) {
    issues.push(`source_rows[${index}].missing`);
    return issues;
  }
  const sourceKey = sourceRowKey(row);
  if (knownDeniedSourceKeys.has(sourceKey)) issues.push('known_incomplete_curated_source_row');
  const license = String(row.license || '');
  for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
    if (!row[field]) issues.push(`source_rows[${index}].missing_${field}`);
  }
  if (!license || forbiddenLicenseRe.test(license) || !allowedLicenses.has(license)) {
    issues.push(`source_rows[${index}].unsafe_license`);
  }
  if (/source metadata incomplete/i.test(`${row.notes || ''} ${row.source_id || ''}`)) {
    issues.push('source_metadata_incomplete');
  }
  return issues;
}

function compareClaims(a, b) {
  return (finiteNumber(b.answer_score) ?? finiteNumber(b.confidence) ?? 0)
    - (finiteNumber(a.answer_score) ?? finiteNumber(a.confidence) ?? 0)
    || String(a.claim_id || '').localeCompare(String(b.claim_id || ''));
}

function writeReport(relativePath, data) {
  const topBlockers = Object.entries(data.blockers).slice(0, 12);
  const lines = [
    '# Agent 2 Orot Pilot Answer Claims Dry Run',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    `Status: \`${data.boundary.status}\``,
    '',
    'This artifact is a pipeline dry run only. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source custody, publication readiness, Definition authority, usage-as-definition authority, accepted text, translation output, or public deploy approval.',
    '',
    '## Inputs',
    '',
    `- Queue: \`${data.inputs.queue}\``,
    `- Agent 3 buckets: \`${data.inputs.agent3_buckets}\``,
    `- Target: \`${data.inputs.target}\``,
    `- Limit: \`${data.inputs.limit}\``,
    `- Orot manifest: \`${data.inputs.orot_manifest}\``,
    `- Route lookup dir: \`${data.inputs.route_lookup_dir}\``,
    ...data.inputs.definition_claims.map((file) => `- Definition claims: \`${file}\``),
    '',
    '## Counts',
    '',
    `- Target rows: ${data.counts.target_rows}`,
    `- Target occurrences: ${data.counts.target_occurrences}`,
    `- Source-clean rows for consideration: ${data.counts.source_clean_rows}`,
    `- Source-blocked rows: ${data.counts.source_blocked_rows}`,
    `- Rows with exact upstream definition claim: ${data.counts.rows_with_exact_upstream_claim}`,
    `- Route cards inspected: ${data.counts.route_cards}`,
    `- Route answer cards: ${data.counts.route_answer_cards}`,
    `- Phrase evidence cards: ${data.counts.route_phrase_evidence_cards}`,
    `- Citable evidence cards: ${data.counts.route_citable_evidence_cards}`,
    `- Form cards: ${data.counts.route_form_cards}`,
    `- Lemma cards: ${data.counts.route_lemma_cards}`,
    `- Emitted answer rows: ${data.counts.emitted_answer_rows}`,
    '',
    '## Top Blockers',
    '',
    ...(topBlockers.length ? topBlockers.map(([key, count]) => `- ${key}: ${count}`) : ['None.']),
    '',
    '## Decision',
    '',
    data.counts.emitted_answer_rows
      ? `The dry run found ${data.counts.emitted_answer_rows} candidate answer row(s). They remain local route candidates only and must pass route-claim audit before Agent 10 consumes them.`
      : 'No pilot JSONL was emitted. The top-100 target is source-clean enough for consideration in most rows, but the current generated definition-route claim files do not contain exact upstream answer claims for the target tokens. Existing route cards remain evidence/form-reference cards and are not promoted.',
    '',
    '## Sample Evaluations',
    '',
    '| priority | token | normalized | occ. | source | upstream claims | route cards | blockers |',
    '|---:|---|---|---:|---|---:|---:|---|',
    ...data.evaluations.slice(0, 25).map((row, index) => [
      index + 1,
      mdCell(row.surface),
      mdCell(row.normalized),
      row.occurrences,
      row.source_status,
      row.upstream_claim_count,
      row.route_card_count,
      mdCell(row.blockers.join(', ')),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')),
    '',
    '## Next Safe Step',
    '',
    'Generate or authorize an upstream definition-route claim source for the source-clean Orot rows, then rerun this script. The transform should continue to emit zero rows unless exact upstream definition-claim rejoin, source linkage, morphology/prefix safety, and homograph safety all pass.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(relativePath, rows) {
  writeText(relativePath, rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(value) {
  return String(value).split('=').slice(1).join('=');
}

function normalizeHebrew(value) {
  return [...String(value || '').normalize('NFC').replace(niqqudRe, '')]
    .map((char) => finalLetters.get(char) || char)
    .join('');
}

function shardFileKey(value) {
  return [...String(value || '')]
    .map((char) => char.codePointAt(0).toString(16).padStart(4, '0'))
    .join('-') || 'empty';
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

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
}

function finiteNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function increment(map, key) {
  map[key] = (map[key] || 0) + 1;
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function usage() {
  return [
    'Usage:',
    '  node scripts/build_orot_agent2_pilot_answer_claims.mjs --dry-run',
    '',
    'Options:',
    '  --queue <path>',
    '  --agent3-buckets <path>',
    '  --target <name>',
    '  --limit <n>',
    '  --output <jsonl path>',
    '  --json-report <path>',
    '  --report <path>',
    '  --write-output    write JSONL only when at least one row passes all gates',
  ].join('\n');
}
