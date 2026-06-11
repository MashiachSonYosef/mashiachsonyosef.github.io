#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fixturePath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-status-contract-fixtures.json');
const fixture = readJson(fixturePath);
const issues = [];

const allowedMachineStatuses = new Set([
  'missing',
  'proposed_only',
  'single_answer_source_complete',
  'conflicting',
  'low_confidence',
  'unreviewed',
]);
const allowedMachineReviewStatuses = new Set(['unreviewed_machine_sample']);

validateFixtureFile();

if (issues.length) {
  console.error(`Definition Workbench status contract fixture validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Definition Workbench status contract fixtures passed. Fixtures: ${fixture.fixtures.length}.`);

function validateFixtureFile() {
  if (fixture.schema_version !== 1) issues.push('schema_version must be 1');
  if (fixture.artifact_type !== 'definition_workbench_status_contract_fixtures') {
    issues.push('artifact_type must be definition_workbench_status_contract_fixtures');
  }
  if (fixture.expected_machine_complete_label !== 'single_answer_source_complete') {
    issues.push('expected_machine_complete_label must be single_answer_source_complete');
  }
  if (fixture.expected_machine_review_status !== 'unreviewed_machine_sample') {
    issues.push('expected_machine_review_status must be unreviewed_machine_sample');
  }
  if (fixture.reserved_review_status !== 'verified') {
    issues.push('reserved_review_status must be verified');
  }
  if (!Array.isArray(fixture.fixtures) || fixture.fixtures.length === 0) {
    issues.push('fixtures must be a non-empty array');
    return;
  }

  for (const item of fixture.fixtures) validateFixture(item);
}

function validateFixture(item) {
  const id = item?.id || '(missing id)';
  if (!item?.id) issues.push('fixture missing id');
  if (item?.expect !== 'pass' && item?.expect !== 'fail') issues.push(`${id}.expect must be pass or fail`);

  const rowIssues = validateMachineRow(item?.row || {}, id);
  if (item.expect === 'pass' && rowIssues.length) {
    issues.push(`${id} expected pass but failed: ${rowIssues.join('; ')}`);
    return;
  }
  if (item.expect === 'fail') {
    if (!rowIssues.length) {
      issues.push(`${id} expected fail but passed`);
      return;
    }
    if (item.expected_issue && !rowIssues.some((issue) => issue.includes(item.expected_issue))) {
      issues.push(`${id} did not produce expected issue "${item.expected_issue}". Actual: ${rowIssues.join('; ')}`);
    }
  }
}

function validateMachineRow(row, context) {
  const rowIssues = [];
  if (!allowedMachineStatuses.has(row.status)) rowIssues.push(`${context}.status has invalid machine status ${row.status || '(missing)'}`);
  if (row.status === 'verified') rowIssues.push(`${context}.machine status must not be verified`);
  if (!allowedMachineReviewStatuses.has(row.review_status)) {
    rowIssues.push(`${context}.review_status has invalid machine review status ${row.review_status || '(missing)'}`);
  }
  if (row.review_status === 'verified') {
    rowIssues.push(`${context}.review_status=verified is reserved for reviewed lexical authority`);
  }
  for (const countField of [
    'answer_card_count',
    'evidence_only_card_count',
    'route_card_count',
    'distinct_answer_definition_count',
  ]) {
    if (!Number.isInteger(row[countField]) || row[countField] < 0) {
      rowIssues.push(`${context}.${countField} must be a non-negative integer`);
    }
  }
  if (Number.isInteger(row.answer_card_count)
    && Number.isInteger(row.evidence_only_card_count)
    && Number.isInteger(row.route_card_count)
    && row.answer_card_count + row.evidence_only_card_count !== row.route_card_count) {
    rowIssues.push(`${context}.answer/evidence card counts must reconcile with route_card_count`);
  }
  if (row.status === 'single_answer_source_complete') {
    if (row.distinct_answer_definition_count !== 1) {
      rowIssues.push(`${context}.single_answer_source_complete requires one answer definition`);
    }
    if (row.answer_card_count < 1) {
      rowIssues.push(`${context}.single_answer_source_complete requires at least one answer card`);
    }
    if (row.source_license_complete !== true) {
      rowIssues.push(`${context}.single_answer_source_complete requires source_license_complete=true`);
    }
  }
  if (row.multi_answer !== (row.distinct_answer_definition_count > 1)) {
    rowIssues.push(`${context}.multi_answer must match distinct_answer_definition_count > 1`);
  }
  if (row.multi_answer === true && row.status !== 'conflicting') {
    rowIssues.push(`${context}.multi_answer=true must remain a conflicting warning`);
  }
  validatePublicationBoundary(row.publication_boundary, `${context}.publication_boundary`, rowIssues);
  return rowIssues;
}

function validatePublicationBoundary(boundary, context, rowIssues) {
  if (!boundary || typeof boundary !== 'object') {
    rowIssues.push(`${context} must be an object`);
    return;
  }
  if (boundary.boundary_status !== 'blocked_no_render') rowIssues.push(`${context}.boundary_status must be blocked_no_render`);
  for (const key of [
    'reader_facing',
    'ui_assignment',
    'publication_claim',
    'clears_publication_readiness',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'public_lookup_artifact',
  ]) {
    if (boundary[key] !== false) rowIssues.push(`${context}.${key} must be false`);
  }
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
