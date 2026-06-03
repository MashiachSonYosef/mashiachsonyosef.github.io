#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md';
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const issues = [];

for (const phrase of [
  'Oracle 9 Agent 10 NC Orot Honeypot Policy Callback',
  'not legal clearance',
  'noncommercial_educational_candidate',
  'commercial_clean_candidate',
  'metadata_only',
  'external_link_only',
  'blocked',
  'license_group=CC_BY_NC',
  'derived_from_nc=true',
  'commercial_export_allowed=false',
  'corpus_contamination=false',
  'commercial-clean rows and occurrences',
  'additional NC educational rows and occurrences',
  'do not widen the current 20-row Agent 2 allowed package',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(report.includes(phrase), `missing required phrase: ${phrase}`);
}

for (const forbidden of [
  'license acceptance is granted',
  'QA accepted',
  'public mutation authorized',
  'answer eligibility authorized',
  'definition authority granted',
  'publication ready',
]) {
  expect(!report.includes(forbidden), `forbidden acceptance phrase found: ${forbidden}`);
}

if (issues.length) {
  console.error(`Oracle 9 Agent 10 NC Orot policy callback validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Oracle 9 Agent 10 NC Orot policy callback validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
