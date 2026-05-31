#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const defaults = {
  manifest: '.local-cache/definition-routes/definition-route-manifest.json',
  routeJsonl: [],
  output: '.local-cache/definition-routes/definition-route-claim-audit.json',
  report: 'reports/definition-route-claim-audit.md',
  maxIssues: 100,
};

const allowedLicenses = new Set([
  'project-authored / CC0',
  'CC0',
  'CC BY 4.0',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY-SA 4.0',
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0 / GFDL',
  'CC BY-SA 4.0/GFDL',
  'Public Domain',
  'Public Domain Mark',
  'N/A - project lexical rule',
  'N/A - project-authored lexical rules',
]);
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;

const options = parseArgs(process.argv.slice(2));
const routePaths = resolveRoutePaths();
const audit = {
  schema_version: 1,
  artifact_type: 'definition_route_claim_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/audit_definition_route_claims.mjs',
  policy: 'Audits generated local route-claim JSONL files for source/license rows and answer-eligibility safety. It does not create definitions, change route ranking, or publish lookup artifacts.',
  inputs: {
    manifest: options.manifest,
    route_jsonl: routePaths,
    max_issues: options.maxIssues,
  },
  counts: {
    files: 0,
    rows: 0,
    answer_eligible_rows: 0,
    non_answer_rows: 0,
    source_rows: 0,
    issue_count: 0,
  },
  route_families: {},
  route_types: {},
  answer_roles: {},
  licenses: {},
  source_families: {},
  files: [],
  issues: [],
};

for (const routePath of routePaths) {
  await auditRouteFile(routePath);
}

audit.counts.issue_count = audit.issues.length;
writeJson(options.output, audit);
writeReport(options.report, audit);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Route claim rows ${audit.counts.rows}; issues ${audit.counts.issue_count}`);
if (audit.counts.issue_count > 0) process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-jsonl=')) parsed.routeJsonl.push(...splitPathList(valueAfterEquals(arg)));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-issues=')) parsed.maxIssues = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxIssues) || parsed.maxIssues < 0) throw new Error('--max-issues must be a non-negative integer');
  return parsed;
}

function resolveRoutePaths() {
  if (options.routeJsonl.length) return unique(options.routeJsonl).filter(fileExists);
  const manifest = readJson(options.manifest, false);
  const localDir = manifest?.local_cache?.directory || path.dirname(options.manifest);
  const files = Array.isArray(manifest?.local_cache?.files) ? manifest.local_cache.files : [];
  return unique(files
    .filter((file) => file.endsWith('.jsonl'))
    .map((file) => cleanRelativePath(`${localDir}/${file}`)))
    .filter(fileExists);
}

async function auditRouteFile(relativePath) {
  const fileSummary = {
    path: relativePath,
    rows: 0,
    answer_eligible_rows: 0,
    non_answer_rows: 0,
    source_rows: 0,
    issue_count: 0,
  };
  audit.counts.files += 1;
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(root, relativePath), 'utf8'),
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
      addIssue(fileSummary, relativePath, lineNumber, 'invalid_json', error.message);
      continue;
    }
    audit.counts.rows += 1;
    fileSummary.rows += 1;
    increment(audit.route_families, row.route_family || 'missing');
    increment(audit.route_types, row.route_type || 'missing');
    increment(audit.answer_roles, row.answer_role || 'missing');
    validateAnswerSafety(row, fileSummary, relativePath, lineNumber);
    validateSourceRows(row, fileSummary, relativePath, lineNumber);
  }
  audit.files.push(fileSummary);
}

function validateAnswerSafety(row, fileSummary, relativePath, lineNumber) {
  const answerEligible = row.answer_eligible === true;
  if (answerEligible) {
    audit.counts.answer_eligible_rows += 1;
    fileSummary.answer_eligible_rows += 1;
  } else {
    audit.counts.non_answer_rows += 1;
    fileSummary.non_answer_rows += 1;
  }
  if (row.answer_role === 'answer' && !answerEligible) {
    addIssue(fileSummary, relativePath, lineNumber, 'answer_role_without_eligibility', claimId(row));
  }
  if (!answerEligible && Number.isFinite(row.answer_score)) {
    addIssue(fileSummary, relativePath, lineNumber, 'non_eligible_answer_score', claimId(row));
  }
  if (row.route_type === 'form' && answerEligible) {
    addIssue(fileSummary, relativePath, lineNumber, 'form_route_answer_eligible', claimId(row));
  }
  if (row.meaning_quality === 'form_reference' && answerEligible) {
    addIssue(fileSummary, relativePath, lineNumber, 'form_reference_answer_eligible', claimId(row));
  }
}

function validateSourceRows(row, fileSummary, relativePath, lineNumber) {
  const rows = Array.isArray(row.source_rows) ? row.source_rows : [];
  if (!rows.length) {
    addIssue(fileSummary, relativePath, lineNumber, 'missing_source_rows', claimId(row));
    return;
  }
  audit.counts.source_rows += rows.length;
  fileSummary.source_rows += rows.length;
  for (const [index, sourceRow] of rows.entries()) {
    const license = String(sourceRow?.license || '');
    increment(audit.licenses, license || 'missing');
    increment(audit.source_families, sourceRow?.source_family || 'missing');
    if (!license) {
      addIssue(fileSummary, relativePath, lineNumber, `source_rows[${index}].missing_license`, claimId(row));
    } else if (forbiddenLicenseRe.test(license) || !allowedLicenses.has(license)) {
      addIssue(fileSummary, relativePath, lineNumber, `source_rows[${index}].unsafe_license`, `${claimId(row)} license=${license}`);
    }
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license_url']) {
      if (!sourceRow?.[field]) addIssue(fileSummary, relativePath, lineNumber, `source_rows[${index}].missing_${field}`, claimId(row));
    }
  }
}

function addIssue(fileSummary, relativePath, lineNumber, code, detail) {
  fileSummary.issue_count += 1;
  if (audit.issues.length >= options.maxIssues) return;
  audit.issues.push({
    file: relativePath,
    line: lineNumber,
    code,
    detail: String(detail || '').slice(0, 240),
  });
}

function readJson(relativePath, required = true) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    if (required) throw new Error(`Missing JSON file: ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, data) {
  const lines = [
    '# Definition Route Claim Audit',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Scope',
    '',
    `- Files: ${data.counts.files}`,
    `- Rows: ${data.counts.rows}`,
    `- Answer-eligible rows: ${data.counts.answer_eligible_rows}`,
    `- Non-answer rows: ${data.counts.non_answer_rows}`,
    `- Source rows: ${data.counts.source_rows}`,
    `- Issues: ${data.counts.issue_count}`,
    '',
    '## Files',
    '',
    '| file | rows | answer eligible | non-answer | source rows | issues |',
    '|---|---:|---:|---:|---:|---:|',
    ...data.files.map((file) => `| ${mdCell(file.path)} | ${file.rows} | ${file.answer_eligible_rows} | ${file.non_answer_rows} | ${file.source_rows} | ${file.issue_count} |`),
    '',
    '## Route Families',
    '',
    ...topCounts(data.route_families, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Licenses',
    '',
    ...topCounts(data.licenses, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue.file}:${issue.line} ${issue.code} ${issue.detail}`) : ['None.']),
    '',
    '## Boundary',
    '',
    'This audit reads generated local route claim files only. It does not author definitions, modify route ranking, publish HUD lookup artifacts, or alter source texts.',
    '',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function topCounts(object, limit) {
  return Object.entries(object || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function claimId(row) {
  return row.claim_id || row.evidence_id || row.card_id || row.route_id || '';
}

function increment(object, key) {
  const safeKey = String(key || '').trim();
  if (!safeKey) return;
  object[safeKey] = (object[safeKey] || 0) + 1;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function splitPathList(value) {
  return String(value || '').split(',').map((part) => cleanRelativePath(part.trim())).filter(Boolean);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function unique(values) {
  return [...new Set(values)];
}
