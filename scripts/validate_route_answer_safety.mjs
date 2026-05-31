#!/usr/bin/env node
import { compareCards } from './build_hud_route_lookup.mjs';

const issues = [];

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

if (issues.length) {
  console.error(`Route answer safety validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Route answer safety validation passed.');
