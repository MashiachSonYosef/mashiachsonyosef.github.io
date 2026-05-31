#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditPath = cleanRelativePath(process.argv[2] || '.local-cache/definition-routes/definition-route-claim-audit.json');
const audit = readJson(auditPath);
const issues = [];

if (audit.schema_version !== 1) issues.push('schema_version must be 1');
if (audit.artifact_type !== 'definition_route_claim_audit') issues.push('artifact_type must be definition_route_claim_audit');
if (!Array.isArray(audit.files) || !audit.files.length) issues.push('files must be a non-empty array');
if (!audit.counts || !Number.isInteger(audit.counts.rows) || audit.counts.rows < 1) issues.push('counts.rows must be positive');
if (Number(audit.counts?.issue_count || 0) !== 0) issues.push(`audit has ${audit.counts.issue_count} route claim issue(s)`);

for (const [index, file] of (audit.files || []).entries()) {
  if (!file.path) issues.push(`files[${index}]: missing path`);
  else if (!fs.existsSync(path.join(root, cleanRelativePath(file.path)))) issues.push(`files[${index}]: missing route file ${file.path}`);
  for (const field of ['rows', 'answer_eligible_rows', 'non_answer_rows', 'source_rows', 'issue_count']) {
    if (!Number.isInteger(file[field]) || file[field] < 0) issues.push(`files[${index}]: invalid ${field}`);
  }
}

if (issues.length) {
  console.error(`Definition route claim audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Definition route claim audit validation passed. Rows: ${audit.counts.rows}.`);

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing definition route claim audit: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
