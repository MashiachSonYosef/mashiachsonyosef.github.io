#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { compareCards } from './build_hud_route_lookup.mjs';

const issues = [];
const root = process.cwd();
const niqqudAndCantillationRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const finalLetters = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);

function assert(condition, message) {
  if (!condition) issues.push(message);
}

const answerCard = {
  card_id: 'answer-low-score',
  normalized: 'x',
  display_section: 'lemma',
  answer_eligible: true,
  answer_role: 'answer',
  answer_score: 42,
  adjusted_score: 42,
  raw_score: 62,
  confidence_percent: 62,
};

const evidenceCard = {
  card_id: 'evidence-high-score',
  normalized: 'x',
  display_section: 'citable_paraphrase_evidence',
  answer_eligible: false,
  answer_role: 'evidence',
  answer_score: null,
  adjusted_score: 99,
  raw_score: 100,
  confidence_percent: 100,
};

const sorted = [evidenceCard, answerCard].sort(compareCards);
assert(sorted[0].card_id === answerCard.card_id, 'answer-eligible card must outrank higher-scoring evidence in lookup sort');
assert(!Number.isFinite(evidenceCard.answer_score), 'evidence card must not carry answer_score');

const formReferenceCard = {
  card_id: 'form-reference',
  normalized: 'x',
  display_section: 'strict_hebrew',
  route_type: 'form',
  answer_eligible: false,
  answer_role: 'form_reference',
  answer_score: null,
  definition: 'form of \u05d3\u05d1\u05e8',
};

assert(formReferenceCard.answer_eligible === false, 'form reference card must not be answer_eligible');
assert(/^form of\b/.test(formReferenceCard.definition), 'form reference card must display "form of [lemma]"');

const boundaryFixturePath = path.join(root, 'data', 'definitions', 'citable-boundary-regression-fixtures.json');
if (!fs.existsSync(boundaryFixturePath)) {
  issues.push('missing citable boundary regression fixture');
} else {
  const fixture = JSON.parse(fs.readFileSync(boundaryFixturePath, 'utf8'));
  const hasBatYamBlocker = (fixture.cases || []).some((testCase) => (
    testCase.expected_match === false
    && /בת[\s\u05BE-]?ים/u.test(String(testCase.claim_surface || ''))
    && /בתים/u.test(String(testCase.source_surface || ''))
  ));
  assert(hasBatYamBlocker, 'boundary fixture must include bat-yam/mermaid vs batim/houses must-not-match case');
  for (const [index, testCase] of (fixture.cases || []).entries()) {
    const claimKey = lookupKeyForClaim(testCase.claim_surface, testCase.claim_normalized || testCase.claim_surface);
    const tokenKey = lookupKeyForSurface(testCase.source_surface);
    const matched = claimKey === tokenKey;
    if (matched !== testCase.expected_match) {
      issues.push(`${testCase.label || `boundary case ${index}`}: expected_match=${testCase.expected_match}, got ${matched}, claim_key=${claimKey}, token_key=${tokenKey}`);
    }
  }
}

if (issues.length) {
  console.error(`Route answer safety validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Route answer safety validation passed.');

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4')
    .replace(/\u2010|\u2011|\u2012|\u2013|\u2014/g, '-');
}

function normalizeFinalLetters(value) {
  return Array.from(value, (ch) => finalLetters.get(ch) || ch).join('');
}

function normalizeHebrew(value) {
  const normalized = normalizeHebrewPunctuation(value)
    .replace(niqqudAndCantillationRe, '')
    .replace(/[^\u0590-\u05FF-]/gu, '');
  return normalizeFinalLetters(normalized);
}

function hasWordBoundary(value) {
  return /[\s\u05BE-]/u.test(normalizeHebrewPunctuation(value));
}

function normalizeHebrewBoundaryKey(value) {
  const normalized = normalizeHebrewPunctuation(value)
    .replace(niqqudAndCantillationRe, '')
    .replace(/\u05BE/gu, '-')
    .replace(/[\s-]+/gu, '-')
    .replace(/[^\u0590-\u05FF-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalizeFinalLetters(normalized);
}

function lookupKeyForSurface(value) {
  return hasWordBoundary(value) ? normalizeHebrewBoundaryKey(value) : normalizeHebrew(value);
}

function lookupKeyForClaim(surface, normalized) {
  return hasWordBoundary(surface) ? normalizeHebrewBoundaryKey(surface) : normalizeHebrew(normalized || surface);
}
