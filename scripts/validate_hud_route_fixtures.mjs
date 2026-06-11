#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'data', 'definitions', 'hud-route-contract.json');
const fixturePath = path.join(root, 'data', 'definitions', 'hud-route-fixtures.json');

const allowedLicensePatterns = [
  /^CC0$/i,
  /^CC BY 4\.0$/i,
  /^CC-BY$/i,
  /^CC-BY 4\.0$/i,
  /^CC BY-SA 4\.0$/i,
  /^CC-BY-SA$/i,
  /^CC-BY-SA 4\.0$/i,
  /^CC BY-SA 4\.0 \/ GFDL$/i,
  /^CC BY-SA 4\.0\/GFDL$/i,
  /^CC BY-SA 4\.0 \/ GFDL$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^project-authored \/ CC0$/i,
];

const allowedAnswerRoles = new Set(['answer', 'evidence', 'form_reference', 'audit']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fail(issues) {
  if (!issues.length) {
    console.log('HUD route fixture validation passed.');
    return;
  }
  console.error(`HUD route fixture validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

function safeLicense(row) {
  const license = String(row?.license || '').trim();
  return allowedLicensePatterns.some((pattern) => pattern.test(license));
}

function containsForbiddenText(value) {
  return /\bPotential\b|potential option|low confidence/i.test(String(value || ''));
}

function validateAnswerBoundary(card, token, label) {
  if (typeof card.answer_eligible !== 'boolean') {
    issues.push(`${token}: ${label} missing boolean answer_eligible`);
  }
  if (!allowedAnswerRoles.has(card.answer_role)) {
    issues.push(`${token}: ${label} has invalid answer_role ${card.answer_role || '(missing)'}`);
  }
  if (card.answer_eligible === true && card.answer_role !== 'answer') {
    issues.push(`${token}: ${label} answer_eligible=true must use answer_role=answer`);
  }
  if (card.answer_role === 'answer' && card.answer_eligible !== true) {
    issues.push(`${token}: ${label} answer_role=answer must be answer_eligible=true`);
  }
  if (card.route_type === 'phrase_evidence') {
    if (card.answer_eligible !== false) issues.push(`${token}: ${label} phrase evidence must be answer_eligible=false`);
    if (card.answer_role !== 'evidence') issues.push(`${token}: ${label} phrase evidence must use answer_role=evidence`);
  }
  if (card.meaning_quality === 'form_reference') {
    if (card.answer_eligible !== false) issues.push(`${token}: ${label} form-reference card must be answer_eligible=false`);
    if (!['form_reference', 'evidence'].includes(card.answer_role)) {
      issues.push(`${token}: ${label} form-reference card must not use answer_role=${card.answer_role || '(missing)'}`);
    }
  }
}

function walkStrings(value, visit) {
  if (typeof value === 'string') {
    visit(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => walkStrings(item, visit));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => walkStrings(item, visit));
  }
}

const issues = [];
const contract = readJson(contractPath);
const fixture = readJson(fixturePath);

if (!contract.rendering_rules?.supports_unbounded_cards) {
  issues.push('contract must support unbounded cards for long-form HUD sections');
}
if (!contract.rendering_rules?.supports_compact_card_grids) {
  issues.push('contract must support compact card grids');
}
if (contract.rendering_rules?.supports_horizontal_card_lanes) {
  issues.push('contract should not require horizontal card lanes');
}

const sectionIds = new Set((contract.route_sections || []).map((section) => section.section_id));
for (const required of ['answer', 'strict_hebrew', 'strict_aramaic', 'lemma', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence', 'phrase_evidence', 'source_license', 'audit']) {
  if (!sectionIds.has(required)) issues.push(`contract missing route section: ${required}`);
}

walkStrings(contract, (text) => {
  if (containsForbiddenText(text)) issues.push(`contract contains forbidden UI label: ${text}`);
});
walkStrings(fixture, (text) => {
  if (containsForbiddenText(text)) issues.push(`fixture contains forbidden UI label: ${text}`);
});

if (!Array.isArray(fixture.samples) || !fixture.samples.length) {
  issues.push('fixture must contain sample HUD route views');
}

for (const sample of fixture.samples || []) {
  const token = sample.token || 'unknown token';
  if (!Array.isArray(sample.route_sections)) {
    issues.push(`${token}: route_sections must be an array`);
    continue;
  }
  const sampleSectionIds = new Set(sample.route_sections.map((section) => section.section_id));
  for (const required of ['strict_hebrew', 'strict_aramaic', 'lemma', 'phrase_evidence']) {
    if (!sampleSectionIds.has(required)) issues.push(`${token}: missing sample section ${required}`);
  }
  if (!Array.isArray(sample.audit_checks) || sample.audit_checks.length < 3) {
    issues.push(`${token}: missing tiny audit checks`);
  }
  if (!Array.isArray(sample.source_license_groups)) {
    issues.push(`${token}: missing source_license_groups`);
  }
  if (sample.answer_card) {
    if (sample.answer_card.display_role !== 'answer') issues.push(`${token}: answer card must have display_role answer`);
    if (sample.answer_card.answer_eligible !== true) issues.push(`${token}: answer card must be answer_eligible=true`);
    if (sample.answer_card.answer_role !== 'answer') issues.push(`${token}: answer card must use answer_role answer`);
    if (!sample.answer_card.definition) issues.push(`${token}: answer card must carry a plain definition/gloss`);
    if (!Array.isArray(sample.answer_card.source_rows) || !sample.answer_card.source_rows.length) {
      issues.push(`${token}: answer card missing source_rows`);
    }
  }

  const cards = [
    sample.answer_card,
    ...sample.route_sections.flatMap((section) => section.cards || []),
    ...(sample.audit_traces || []),
  ].filter(Boolean);
  for (const card of cards) {
    const label = card.card_id || card.display_label || card.route_type || 'card';
    validateAnswerBoundary(card, token, label);
    if (card.route_type !== 'phrase_evidence' && card.display_role !== 'audit' && card.route_type !== 'shape') {
      if (!card.definition) issues.push(`${token}: ${label} missing definition text`);
    }
    if (card.route_type === 'phrase_evidence' && card.meaning_claim !== undefined && card.meaning_claim !== null) {
      issues.push(`${token}: phrase evidence card must not force a meaning_claim`);
    }
    if (['biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(card.route_type)) {
      if (card.score_handicap !== 20) issues.push(`${token}: ${label} paraphrase score_handicap must be 20`);
      if (!Number.isFinite(card.raw_score) || card.raw_score < 0 || card.raw_score > 100) {
        issues.push(`${token}: ${label} paraphrase raw_score must be 0..100`);
      }
      if (Number.isFinite(card.raw_score) && card.adjusted_score !== card.raw_score - 20) {
        issues.push(`${token}: ${label} paraphrase adjusted_score must equal raw_score - 20`);
      }
    }
    if (card.display_role !== 'audit' && card.route_type !== 'shape') {
      if (!Array.isArray(card.source_rows) || !card.source_rows.length) {
        issues.push(`${token}: ${label} missing source rows`);
      }
    }
    for (const row of card.source_rows || []) {
      if (!safeLicense(row)) {
        issues.push(`${token}: unsafe or unclear license in card ${label}: ${row.license || 'missing'}`);
      }
    }
  }
  for (const row of sample.source_license_groups || []) {
    if (!safeLicense(row)) {
      issues.push(`${token}: unsafe or unclear license in source_license_groups: ${row.license || 'missing'}`);
    }
  }
}

fail(issues);
