#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const csvPath = cleanRelativePath(process.argv[2] || 'data/definitions/hud-route-card-sample.csv');
const reportPath = cleanRelativePath(process.argv[3] || 'reports/hud-route-card-csv-report.md');
const manifestPath = 'data/definitions/manifest.json';
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;

const csvText = fs.readFileSync(path.join(root, csvPath), 'utf8').replace(/^\uFEFF/, '');
const rows = parseCsv(csvText).filter((row) => row.some((cell) => cell !== ''));
const header = rows[0] || [];
const records = rows.slice(1);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const manifest = readJson(manifestPath);
const issues = [];
const warnings = [];

const requiredColumns = [
  'lookup_shard',
  'normalized',
  'display_section',
  'route_type',
  'definition_or_claim',
  'raw_score',
  'adjusted_score',
  'answer_eligible',
  'answer_role',
  'source_row_count',
  'licenses',
  'license_urls',
  'source_urls',
  'fields_used',
  'card_id',
];
const index = Object.fromEntries(header.map((column, i) => [column, i]));

validateHeader();
validateRows();
validateReport();
validateManifest();

if (issues.length) {
  console.error(`HUD route card CSV validation failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`HUD route card CSV validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('HUD route card CSV validation passed.');
}
console.log(`Rows: ${records.length}; columns: ${header.length}; answer rows: ${records.filter((row) => cell(row, 'answer_eligible') === 'true').length}.`);

function validateHeader() {
  for (const column of requiredColumns) {
    if (!(column in index)) issues.push(`missing column ${column}`);
  }
  if (header.length < requiredColumns.length) issues.push('header has too few columns');
}

function validateRows() {
  if (records.length !== 500) issues.push(`expected 500 sample rows, found ${records.length}`);
  const seenCardIds = new Set();
  for (const [rowIndex, row] of records.entries()) {
    const label = `row ${rowIndex + 2}`;
    if (row.length !== header.length) issues.push(`${label} has ${row.length} cells, expected ${header.length}`);
    for (const column of ['lookup_shard', 'normalized', 'display_section', 'route_type', 'card_id']) {
      if (!cell(row, column)) issues.push(`${label} missing ${column}`);
    }
    const cardId = cell(row, 'card_id');
    if (seenCardIds.has(cardId)) issues.push(`${label} duplicate card_id ${cardId}`);
    seenCardIds.add(cardId);

    const answerEligible = cell(row, 'answer_eligible');
    const answerRole = cell(row, 'answer_role');
    if (!['true', 'false'].includes(answerEligible)) issues.push(`${label} answer_eligible must be true or false`);
    if (!['answer', 'evidence', 'form_reference', 'audit'].includes(answerRole)) {
      issues.push(`${label} answer_role must be answer, evidence, form_reference, or audit`);
    }
    if (answerEligible === 'true' && answerRole !== 'answer') {
      issues.push(`${label} answer_eligible=true requires answer_role=answer`);
    }
    if (answerRole === 'answer' && answerEligible !== 'true') {
      issues.push(`${label} answer_role=answer requires answer_eligible=true`);
    }

    const sourceRowCount = Number(cell(row, 'source_row_count'));
    if (!Number.isInteger(sourceRowCount) || sourceRowCount < 1) {
      issues.push(`${label} source_row_count must be a positive integer`);
    }
    if (!cell(row, 'licenses') || !cell(row, 'license_urls') || !cell(row, 'source_urls')) {
      issues.push(`${label} must preserve source/license/source URL cells`);
    }
    if (hasForbiddenLicense(cell(row, 'licenses'))) {
      issues.push(`${label} has forbidden or unclear license label: ${cell(row, 'licenses')}`);
    }
    if (/\baccepted_translation\b|\bpublication_ready\b|\bpublication readiness\b/i.test(cell(row, 'definition_or_claim'))) {
      issues.push(`${label} definition_or_claim contains publication/translation status language`);
    }
  }
}

function validateReport() {
  if (!report.includes('QA mirror only')) issues.push('report must declare QA mirror boundary');
  if (!report.includes('answer_eligible') || !report.includes('answer_role')) {
    issues.push('report must list answer_eligible and answer_role columns');
  }
  if (!report.includes('does not create accepted translation text or publication readiness')) {
    issues.push('report must deny accepted translation text and publication readiness');
  }
}

function validateManifest() {
  if (!Array.isArray(manifest.public_artifacts) || !manifest.public_artifacts.includes(csvPath)) {
    issues.push(`manifest.public_artifacts must include ${csvPath}`);
  }
}

function cell(row, column) {
  return row[index[column]] || '';
}

function hasForbiddenLicense(value) {
  return forbiddenLicenseRe.test(String(value || ''));
}

function parseCsv(text) {
  const parsed = [];
  let row = [];
  let cellText = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cellText += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cellText += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cellText);
      cellText = '';
    } else if (char === '\n') {
      row.push(cellText.replace(/\r$/, ''));
      parsed.push(row);
      row = [];
      cellText = '';
    } else {
      cellText += char;
    }
  }
  if (cellText || row.length) {
    row.push(cellText);
    parsed.push(row);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
