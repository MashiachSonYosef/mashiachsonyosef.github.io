#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const options = parseArgs(process.argv.slice(2));
const allowedStatuses = new Set(['missing', 'proposed_only', 'single_answer_source_complete', 'conflicting', 'low_confidence', 'unreviewed']);
const allowedReviewStatuses = new Set(['unreviewed_machine_sample']);

const inventory = readJson(options.inventory);
const lookupManifest = readJson(options.lookupManifest);
const prefixLength = lookupManifest.prefix_length || 3;
const topTokens = Array.isArray(inventory.top_tokens) ? inventory.top_tokens.slice(0, options.limit) : [];
const shardCache = new Map();
const rows = [];
const statusCounts = new Map();
const reviewStatusCounts = new Map();

for (const token of topTokens) {
  const normalized = token.token_normalized || '';
  const cards = lookupCards(normalized);
  const answerCards = cards.filter((card) => card?.answer_eligible === true && card?.answer_role === 'answer');
  const evidenceCards = cards.filter((card) => !(card?.answer_eligible === true && card?.answer_role === 'answer'));
  const answerDefinitionHashes = new Set(answerCards.map((card) => hashText(card.definition || '')));
  const maxConfidence = maxNumber(cards.map((card) => card.confidence_percent));
  const sourceLicenseComplete = cards.length > 0 && cards.every(hasCompleteSourceRows);
  const status = classifyStatus({
    cards,
    answerCards,
    evidenceCards,
    answerDefinitionHashes,
    maxConfidence,
    sourceLicenseComplete,
  });
  increment(statusCounts, status);
  const reviewStatus = classifyReviewStatus();
  increment(reviewStatusCounts, reviewStatus);
  rows.push({
    token_key: token.token_key || `he:${normalized}`,
    normalized_form: normalized,
    top_surfaces: Array.isArray(token.top_surfaces) ? token.top_surfaces : [],
    occurrence_count: token.occurrence_count || 0,
    work_count: token.work_count || 0,
    route_card_count: cards.length,
    answer_card_count: answerCards.length,
    evidence_only_card_count: evidenceCards.length,
    distinct_answer_definition_count: answerDefinitionHashes.size,
    multi_answer: answerDefinitionHashes.size > 1,
    max_confidence_percent: maxConfidence,
    source_license_complete: sourceLicenseComplete,
    source_families: countValues(cards.flatMap((card) => (card.source_rows || []).map((row) => row.source_family || '(missing)'))),
    route_families: countValues(cards.map((card) => card.route_family || '(missing)')),
    answer_card_ids: answerCards.slice(0, options.maxAnswerIds).map((card) => card.card_id || ''),
    usage_link_count: null,
    usage_link_status: 'not_joined_in_sample',
    status,
    status_basis: statusBasis(status),
    review_status: reviewStatus,
    review_status_basis: reviewStatusBasis(reviewStatus),
  });
}

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_sample',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_sample.mjs',
  status: 'sample_contract_not_full_index',
  status_axis: 'machine_route_shape_status_not_review_authority',
  review_status_axis: 'lexical_authority_review_status',
  review_policy: 'This machine builder never emits review_status=verified. Verified is reserved for future reviewed lexical authority outside this sample contract.',
  answer_role_policy: 'Answer cards are counted only when answer_eligible=true and answer_role=answer. All other route cards remain evidence-only counts in this sample.',
  source_license_policy: 'Source/license completeness is checked against route card source_rows. This sample emits only completeness flags, source-family aggregates, route-family aggregates, and card IDs.',
  multi_answer_policy: 'multi_answer=true when more than one distinct answer definition hash exists. These rows retain conflicting status as a warning, not a hidden winner.',
  boundary: 'Definition Workbench sample only. It publishes no source excerpts, no definition text, no translation text, and no publication readiness.',
  publication_boundary: buildPublicationBoundary(),
  inputs: {
    token_inventory: options.inventory,
    lookup_manifest: options.lookupManifest,
    token_limit: options.limit,
    route_lookup_distinct_normalized_tokens: lookupManifest.counts?.distinct_normalized_tokens || null,
    route_lookup_cards: lookupManifest.counts?.cards_written || null,
  },
  counts: {
    rows: rows.length,
    status_counts: Object.fromEntries([...statusCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    review_status_counts: Object.fromEntries([...reviewStatusCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    multi_answer_rows: rows.filter((row) => row.multi_answer).length,
    rows_with_route_cards: rows.filter((row) => row.route_card_count > 0).length,
    rows_without_route_cards: rows.filter((row) => row.route_card_count === 0).length,
    rows_with_complete_source_license: rows.filter((row) => row.source_license_complete).length,
  },
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Definition Workbench sample wrote ${rows.length} row(s). Output: ${options.output}. Report: ${options.report}`);

function parseArgs(args) {
  const parsed = {
    inventory: '.local-cache/workbench-evidence/token-inventory.json',
    lookupManifest: 'data/definitions/hud-route-lookup/manifest.json',
    output: 'data/definitions/definition-workbench-sample.json',
    report: 'reports/definition-workbench-sample-report.md',
    limit: 200,
    maxAnswerIds: 8,
  };
  for (const arg of args) {
    if (arg.startsWith('--inventory=')) parsed.inventory = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--lookup-manifest=')) parsed.lookupManifest = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--limit=')) parsed.limit = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-answer-ids=')) parsed.maxAnswerIds = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.limit) || parsed.limit < 1) throw new Error('--limit must be a positive integer');
  if (!Number.isInteger(parsed.maxAnswerIds) || parsed.maxAnswerIds < 0) throw new Error('--max-answer-ids must be a non-negative integer');
  return parsed;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function lookupCards(normalized) {
  if (!normalized) return [];
  const shard = shardFor(normalized);
  const shardData = readShard(shard);
  const cards = shardData?.routes_by_normalized?.[normalized];
  return Array.isArray(cards) ? cards : [];
}

function shardFor(normalized) {
  return Array.from(normalized)
    .slice(0, prefixLength)
    .map((ch) => ch.codePointAt(0).toString(16).padStart(4, '0'))
    .join('-');
}

function readShard(shard) {
  if (shardCache.has(shard)) return shardCache.get(shard);
  const relativePath = `data/definitions/hud-route-lookup/shards/${shard}.json`;
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    shardCache.set(shard, null);
    return null;
  }
  const data = readJson(relativePath);
  shardCache.set(shard, data);
  return data;
}

function hasCompleteSourceRows(card) {
  if (!Array.isArray(card?.source_rows) || card.source_rows.length === 0) return false;
  return card.source_rows.every((row) => (
    row?.source_name &&
    row?.source_family &&
    row?.source_id &&
    row?.source_url &&
    row?.license &&
    row?.license_url
  ));
}

function classifyStatus({ cards, answerCards, answerDefinitionHashes, maxConfidence, sourceLicenseComplete }) {
  if (cards.length === 0) return 'missing';
  if (answerCards.length === 0) return 'proposed_only';
  if (answerDefinitionHashes.size > 1) return 'conflicting';
  if (!sourceLicenseComplete || maxConfidence === null || maxConfidence < 80) return 'low_confidence';
  return 'single_answer_source_complete';
}

function classifyReviewStatus() {
  return 'unreviewed_machine_sample';
}

function statusBasis(status) {
  const labels = {
    missing: 'no route cards found for this normalized token in the public lookup sample',
    proposed_only: 'route/evidence cards exist but no answer-eligible card exists',
    single_answer_source_complete: 'one answer definition hash and complete source/license rows in this sample; machine shape only, not reviewed lexical authority',
    conflicting: 'multiple distinct answer definition hashes exist',
    low_confidence: 'answer cards exist but confidence or source/license completeness is not strong enough for single_answer_source_complete',
    unreviewed: 'reserved for future manual review state',
  };
  if (!allowedStatuses.has(status)) throw new Error(`Invalid status ${status}`);
  return labels[status];
}

function reviewStatusBasis(reviewStatus) {
  const labels = {
    unreviewed_machine_sample: 'machine-generated sample row; not reviewed lexical authority and not publication readiness',
  };
  if (!allowedReviewStatuses.has(reviewStatus)) throw new Error(`Invalid review status ${reviewStatus}`);
  return labels[reviewStatus];
}

function buildPublicationBoundary() {
  return {
    boundary_status: 'blocked_no_render',
    sample_only: true,
    reader_facing: false,
    ui_assignment: false,
    publication_claim: false,
    clears_publication_readiness: false,
    reviewed_lexical_authority: false,
    accepted_translation_output: false,
    source_publication: false,
    public_lookup_artifact: false,
    does_not_clear: [
      'ui_assignment',
      'reviewed_lexical_authority',
      'accepted_translation',
      'source_publication',
      'public_lookup_publication',
      'publication_readiness',
    ],
  };
}

function hashText(value) {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex');
}

function maxNumber(values) {
  const numbers = values.filter((value) => Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : null;
}

function countValues(values) {
  const counts = new Map();
  for (const value of values) increment(counts, value || '(missing)');
  return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function writeReport(relativePath, artifact) {
  const topRows = artifact.rows.slice(0, 30).map((row) => (
    `- ${row.status} | ${row.normalized_form} | occurrences ${row.occurrence_count} | answers ${row.answer_card_count} | cards ${row.route_card_count} | conflicts ${row.distinct_answer_definition_count}`
  ));
  const lines = [
    '# Definition Workbench Sample Report',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    '- Sample contract only; not a full Definitions Workbench index.',
    '- Publishes token counts and route/card IDs only, not source excerpts or definition text.',
    '- `usage_link_count` is intentionally null until Agent 3 occurrence linkage is joined.',
    '',
    '## Counts',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Rows with route cards: ${artifact.counts.rows_with_route_cards}`,
    `- Rows without route cards: ${artifact.counts.rows_without_route_cards}`,
    `- Multi-answer rows: ${artifact.counts.multi_answer_rows}`,
    `- Rows with complete source/license rows: ${artifact.counts.rows_with_complete_source_license}`,
    '',
    '## Status Counts',
    '',
    ...Object.entries(artifact.counts.status_counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Review Status Counts',
    '',
    ...Object.entries(artifact.counts.review_status_counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Review Boundary',
    '',
    '- `status` is machine route-shape status, not reviewed definition authority.',
    '- `review_status=verified` is reserved for future reviewed lexical authority and is not emitted by this sample builder.',
    '- Answer cards require `answer_eligible=true` and `answer_role=answer`; other route cards remain evidence-only counts.',
    '- `multi_answer=true` rows remain `conflicting` warnings and are not collapsed into a hidden winner.',
    '',
    '## Publication Boundary',
    '',
    `- Boundary status: ${artifact.publication_boundary.boundary_status}`,
    `- Sample only: ${artifact.publication_boundary.sample_only}`,
    `- Reader-facing: ${artifact.publication_boundary.reader_facing}`,
    `- UI assignment: ${artifact.publication_boundary.ui_assignment}`,
    `- Publication claim: ${artifact.publication_boundary.publication_claim}`,
    `- Clears publication readiness: ${artifact.publication_boundary.clears_publication_readiness}`,
    `- Reviewed lexical authority: ${artifact.publication_boundary.reviewed_lexical_authority}`,
    `- Accepted translation output: ${artifact.publication_boundary.accepted_translation_output}`,
    `- Source publication: ${artifact.publication_boundary.source_publication}`,
    `- Public lookup artifact: ${artifact.publication_boundary.public_lookup_artifact}`,
    `- Does not clear: ${artifact.publication_boundary.does_not_clear.join(', ')}`,
    '',
    '## Top Sample Rows',
    '',
    ...topRows,
    '',
    '## Boundary',
    '',
    artifact.boundary,
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
