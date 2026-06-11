#!/usr/bin/env node
import fs from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const classificationPath =
  args.classification || args._[0] || 'reports/agent6-repo-dirt-classification-support-2026-06-05.json';
const batchId = String(args.batch || args._[1] || '').toUpperCase();

if (!batchId) fail('missing --batch <A-F>');

const artifact = readJson(classificationPath);
const batch = (artifact.proposed_batches || []).find((row) => String(row.id).toUpperCase() === batchId);
if (!batch) fail(`batch ${batchId} not found in ${classificationPath}`);

const issues = [];
const warnings = [];
validateArtifactBoundary();
validateBatchBoundary();

if (issues.length > 0) {
  console.error(`Agent6 repo-dirt batch validation failed for batch ${batchId}.`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Agent6 repo-dirt batch validation passed for batch ${batchId}: ${batch.name}. ` +
    `Warnings: ${warnings.length}. Boundary: non-destructive proposal only.`
);
for (const warning of warnings) console.warn(`Warning: ${warning}`);

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function readJson(targetPath) {
  try {
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${targetPath}: ${error.message}`);
  }
}

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function validateArtifactBoundary() {
  if (artifact.agent !== 'Agent 6') issues.push('artifact.agent must be Agent 6');
  if (artifact.scope !== 'non_destructive_repo_dirt_classification_only') {
    issues.push('artifact scope must remain non_destructive_repo_dirt_classification_only');
  }
  if (artifact.stop_condition !== 'classification_artifact_exists_no_destructive_action_taken') {
    issues.push('stop_condition must preserve no destructive action');
  }
  const mustNot = new Set(artifact.must_not_be_accepted || []);
  for (const forbidden of ['staging', 'deletion', 'revert', 'cleanup_complete', 'release_action']) {
    if (!mustNot.has(forbidden)) issues.push(`missing must_not_be_accepted boundary: ${forbidden}`);
  }
}

function validateBatchBoundary() {
  if (batchId === 'F' && !args.ownerApproval) {
    issues.push('batch F temp/noise deletion candidate requires explicit --ownerApproval and still does not delete files');
  }
  if (batchId === 'E') {
    warnings.push('batch E includes public/runtime surface and requires Agent 10 changed-input release packet');
  }
  if (batchId === 'D') {
    warnings.push('batch D includes control state and requires Agent 5/7 publication or local-only rejection proof');
  }
  if (batchId === 'C') {
    warnings.push('batch C scripts require matching report packet and deleted-script holdout review');
  }
  if (batchId === 'B') {
    warnings.push('batch B reports must exclude deleted reports and raw logs unless explicitly wanted');
  }
  if (batchId === 'A') {
    warnings.push('batch A is checkpoint-only and does not clean the repo');
  }
}
