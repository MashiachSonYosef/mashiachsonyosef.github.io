#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_WORKS = ['esther', 'ezra', 'nehemiah', 'obadiah', 'malachi'];
const DEFAULT_DIR = 'data/lexical/reader-hints';
const requiredHintFields = [
  'display',
  'match_percent',
  'source',
  'source_family',
  'source_id',
  'source_url',
  'license',
  'license_url',
  'basis',
  'candidate_status',
  'normalized',
  'route_card_id',
  'status',
  'route_score_percent',
  'score_source',
];
const disallowedPrehudDisplays = [
  /^observed usage only$/i,
  /^usage context only/i,
];

function parseArgs(argv) {
  const args = { works: DEFAULT_WORKS, dir: DEFAULT_DIR };
  argv.forEach((arg) => {
    if (arg.startsWith('--works=')) args.works = arg.slice('--works='.length).split(',').map((item) => item.trim()).filter(Boolean);
    else if (arg.startsWith('--dir=')) args.dir = arg.slice('--dir='.length);
  });
  return args;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateWork(work, dir) {
  const relativePath = `${dir}/${work}.json`;
  const payload = readJson(relativePath);
  const errors = [];
  const hints = payload.hints || {};
  if (payload.schema_version !== 2) errors.push('schema_version must be 2');
  if (payload.work_id !== work) errors.push(`work_id must be ${work}`);
  if (payload.publication_status !== 'not_a_translation') errors.push('publication_status must be not_a_translation');
  if (payload.reader_surface_policy?.not_semantic_authority !== true) errors.push('reader_surface_policy.not_semantic_authority must be true');
  if (payload.reader_surface_policy?.not_translation !== true) errors.push('reader_surface_policy.not_translation must be true');
  if (!payload.coverage || !Number.isInteger(payload.coverage.total_token_occurrences)) errors.push('coverage.total_token_occurrences is required');
  if (!payload.coverage || payload.coverage.hint_count !== Object.keys(hints).length) errors.push('coverage.hint_count must equal hints length');

  Object.entries(hints).forEach(([tokenId, hint]) => {
    if (!tokenId.startsWith('tok-')) errors.push(`${tokenId}: token id must start with tok-`);
    requiredHintFields.forEach((field) => {
      if (hint[field] === undefined || hint[field] === null || String(hint[field]).trim() === '') errors.push(`${tokenId}: missing ${field}`);
    });
    const match = Number(hint.match_percent);
    const routeScore = Number(hint.route_score_percent);
    if (!Number.isFinite(match) || match < 0 || match > 100) errors.push(`${tokenId}: invalid match_percent`);
    if (!Number.isFinite(routeScore) || routeScore < 0 || routeScore > 100) errors.push(`${tokenId}: invalid route_score_percent`);
    if (match !== routeScore) errors.push(`${tokenId}: match_percent must equal route_score_percent`);
    if (hint.basis !== 'current_route_candidate') errors.push(`${tokenId}: basis must be current_route_candidate`);
    if (hint.candidate_status !== 'candidate_not_authority') errors.push(`${tokenId}: candidate_status must be candidate_not_authority`);
    if (hint.status !== 'reader_hint_not_translation') errors.push(`${tokenId}: status must be reader_hint_not_translation`);
    if (hint.score_source !== 'route_card_score') errors.push(`${tokenId}: score_source must be route_card_score`);
    if (disallowedPrehudDisplays.some((pattern) => pattern.test(String(hint.display || '').trim()))) {
      errors.push(`${tokenId}: usage-only evidence must stay HUD-only/TBD, not pre-HUD`);
    }
  });

  assert(!errors.length, `${relativePath} failed validation:\n${errors.slice(0, 40).join('\n')}${errors.length > 40 ? `\n... ${errors.length - 40} more` : ''}`);
  return { work, path: relativePath, hints: Object.keys(hints).length, total: payload.coverage.total_token_occurrences };
}

const args = parseArgs(process.argv.slice(2));
const results = args.works.map((work) => validateWork(work, args.dir));
console.log('Reader hint route lookup validation passed.');
results.forEach((result) => console.log(`${result.work}: ${result.hints}/${result.total} hints (${result.path})`));
