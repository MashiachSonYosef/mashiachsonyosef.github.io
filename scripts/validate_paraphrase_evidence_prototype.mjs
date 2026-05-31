import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || '.local-cache/paraphrase-evidence/prototype-reshit.json';
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenCitationRe = /\bAI says\b|\bChatGPT\b|\bLLM\b|\bI think\b|\bprobably\b|\bmaybe\b/i;
const allowedRouteTypes = new Set(['biblical_paraphrase_evidence', 'citable_paraphrase_evidence']);

const issues = [];
const artifact = readJson(artifactPath);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (!artifact.focus?.token_normalized) issues.push('focus.token_normalized is required');
if (!Array.isArray(artifact.occurrence_markers)) issues.push('occurrence_markers must be an array');
if (!Array.isArray(artifact.rows)) issues.push('rows must be an array');

for (const [index, row] of (artifact.rows || []).entries()) {
  const context = `rows[${index}]`;
  for (const field of [
    'evidence_id',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'route_type',
    'phrase_hebrew',
    'source_ref',
    'work_id',
    'work_title',
    'source_url',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'notes',
  ]) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
  if (!allowedRouteTypes.has(row.route_type)) issues.push(`${context}: invalid route_type ${row.route_type}`);
  if (row.meaning_claim !== null) issues.push(`${context}: meaning_claim must be null`);
  if (!Array.isArray(row.phrase_tokens) || !row.phrase_tokens.some((token) => token.role === 'focus-token')) {
    issues.push(`${context}: phrase_tokens must include a focus-token`);
  }
  if (!Array.isArray(row.source_rows) || !row.source_rows.length) issues.push(`${context}: source_rows are required`);
  if (forbiddenLicenseRe.test(String(row.license))) issues.push(`${context}: forbidden license text`);
  if (forbiddenCitationRe.test(String(row.notes))) issues.push(`${context}: notes contain forbidden citation/probability language`);
  if (Number(row.adjusted_score) !== Math.max(0, Number(row.raw_score) - Number(row.handicap))) {
    issues.push(`${context}: adjusted_score must equal raw_score - handicap`);
  }
  for (const [sourceIndex, sourceRow] of (row.source_rows || []).entries()) {
    const rowContext = `${context}.source_rows[${sourceIndex}]`;
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'version_title', 'version_source', 'license', 'license_url']) {
      if (!sourceRow[field]) issues.push(`${rowContext}: missing ${field}`);
    }
    if (forbiddenLicenseRe.test(String(sourceRow.license))) issues.push(`${rowContext}: forbidden license text`);
  }
}

if (issues.length) {
  console.error(`Paraphrase evidence prototype validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Paraphrase evidence prototype validation passed: ${artifactPath}`);

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing artifact: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}
