#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const inventoryPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/token-inventory.json');
const inventory = readJson(inventoryPath);
const issues = [];

if (inventory.schema_version !== 1) issues.push('schema_version must be 1');
if (inventory.artifact_type !== 'workbench_token_inventory') issues.push('artifact_type must be workbench_token_inventory');
if (!inventory.paths?.tokens_jsonl) issues.push('paths.tokens_jsonl is required');
if (!inventory.paths?.blocked_jsonl) issues.push('paths.blocked_jsonl is required');
if (!Number.isInteger(inventory.counts?.distinct_normalized_tokens)) issues.push('counts.distinct_normalized_tokens is required');

let tokenRows = 0;
let totalTokens = 0;
await readJsonl(inventory.paths?.tokens_jsonl, (row, lineNumber) => {
  tokenRows += 1;
  const context = `tokens line ${lineNumber}`;
  for (const field of ['token_key', 'token_normalized', 'occurrence_count', 'work_count']) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') issues.push(`${context}: missing ${field}`);
  }
  if (!String(row.token_key || '').startsWith('he:')) issues.push(`${context}: token_key must use he: prefix`);
  if (!Number.isInteger(row.occurrence_count) || row.occurrence_count < 1) issues.push(`${context}: invalid occurrence_count`);
  if (!Number.isInteger(row.work_count) || row.work_count < 1) issues.push(`${context}: invalid work_count`);
  totalTokens += Number(row.occurrence_count || 0);
});

let blockedRows = 0;
await readJsonl(inventory.paths?.blocked_jsonl, (row, lineNumber) => {
  blockedRows += 1;
  const context = `blocked line ${lineNumber}`;
  for (const field of ['blocked_id', 'source_file', 'work_id', 'work_title', 'license', 'reason']) {
    if (row?.[field] === undefined || row?.[field] === null) issues.push(`${context}: missing ${field}`);
  }
});

if (inventory.counts?.distinct_normalized_tokens !== tokenRows) {
  issues.push(`distinct token count mismatch: manifest ${inventory.counts?.distinct_normalized_tokens}, JSONL ${tokenRows}`);
}
if (inventory.counts?.total_tokens !== totalTokens) {
  issues.push(`total token count mismatch: manifest ${inventory.counts?.total_tokens}, JSONL ${totalTokens}`);
}
if (inventory.counts?.blocked_units < blockedRows) {
  issues.push('blocked JSONL rows cannot exceed blocked_units count');
}

if (issues.length) {
  console.error(`Workbench token inventory validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench token inventory validation passed. Distinct tokens: ${tokenRows}. Total tokens: ${totalTokens}. Blocked sample rows: ${blockedRows}.`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

async function readJsonl(relativePath, onRow) {
  if (!relativePath) return;
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(root, cleanRelativePath(relativePath)), 'utf8'),
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;
    let row;
    try {
      row = JSON.parse(trimmed);
    } catch (error) {
      issues.push(`${relativePath} line ${lineNumber}: invalid JSON ${error.message}`);
      continue;
    }
    onRow(row, lineNumber);
  }
}
