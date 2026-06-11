#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = cleanRelativePath(process.argv[2] || 'data/definitions/gloss-selection-contract.json');
const reportJsonPath = cleanRelativePath(process.argv[3] || 'reports/gloss-selection-contract-validation.json');
const reportMarkdownPath = cleanRelativePath(process.argv[4] || 'reports/gloss-selection-contract-validation.md');
const manifestPath = 'data/definitions/manifest.json';
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;

const contract = readJson(contractPath);
const manifest = fs.existsSync(path.join(root, manifestPath)) ? readJson(manifestPath) : null;
const issues = [];
const warnings = [];

const requiredSelectionFields = [
  'selected_card_id',
  'selected_definition',
  'answer_eligible',
  'answer_role',
  'source_rows',
  'publication_status',
];
const requiredAssemblyFields = [
  'source_text_hash',
  'selection_ids',
  'assembled_gloss',
  'assembly_mode',
  'publication_status',
];
const sourceRows = Array.isArray(contract.source_rows) ? contract.source_rows : [];

validateContract();
validateManifestRegistration();

const report = {
  schema_version: 1,
  artifact_type: 'gloss_selection_contract_validation',
  generated_at: new Date().toISOString(),
  generator: 'scripts/validate_gloss_selection_contract.mjs',
  status: issues.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
  inputs: {
    contract: contractPath,
    manifest: manifestPath,
  },
  counts: {
    required_selection_fields_present: countPresent(contract.required_selection_fields, requiredSelectionFields),
    required_selection_fields_expected: requiredSelectionFields.length,
    required_assembly_fields_present: countPresent(contract.required_assembly_fields, requiredAssemblyFields),
    required_assembly_fields_expected: requiredAssemblyFields.length,
    allowed_publication_statuses: Array.isArray(contract.allowed_publication_statuses) ? contract.allowed_publication_statuses.length : 0,
    source_rows: sourceRows.length,
    source_rows_with_safe_license: sourceRows.filter((row) => isSafeLicense(row.license)).length,
    manifest_registered: manifest?.public_artifacts?.includes(contractPath) ? 1 : 0,
  },
  boundary: {
    browser_local_first: /browser-local first/i.test(contract.storage_policy || ''),
    json_export_import_only: /JSON export\/import/i.test(contract.storage_policy || ''),
    not_a_translation_only: Array.isArray(contract.allowed_publication_statuses)
      && contract.allowed_publication_statuses.length === 1
      && contract.allowed_publication_statuses[0] === 'not_a_translation',
    preserves_answer_role: hasAll(contract.required_selection_fields, ['answer_eligible', 'answer_role']),
    preserves_source_rows: hasAll(contract.required_selection_fields, ['source_rows']),
    publication_readiness_denied: /publication readiness/i.test((contract.selection_rules || []).join(' ')),
    accepted_translation_denied: /must not be interpreted as accepted translations/i.test(contract.publication_policy || ''),
  },
  issues,
  warnings,
};

writeJson(reportJsonPath, report);
writeMarkdown(reportMarkdownPath, report);

if (issues.length) {
  console.error(`Gloss selection contract validation failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Gloss selection contract validation ${report.status}. Source rows: ${report.counts.source_rows}; manifest registered: ${report.counts.manifest_registered}.`);

function validateContract() {
  if (contract.schema_version !== 1) issues.push('schema_version must be 1');
  if (contract.contract_id !== 'gloss-selection-contract') issues.push('contract_id must be gloss-selection-contract');
  if (!/local-only study selections/i.test(contract.purpose || '')) {
    issues.push('purpose must identify local-only study selections');
  }
  if (!/without creating translation-memory rows or publication output/i.test(contract.purpose || '')) {
    issues.push('purpose must block translation-memory rows and publication output');
  }
  if (!/Browser-local first/i.test(contract.storage_policy || '')) {
    issues.push('storage_policy must be browser-local first');
  }
  if (!/publication_status=not_a_translation/i.test(contract.publication_policy || '')) {
    issues.push('publication_policy must require publication_status=not_a_translation');
  }
  if (!/must not be interpreted as accepted translations/i.test(contract.publication_policy || '')) {
    issues.push('publication_policy must deny accepted translation status');
  }
  for (const field of requiredSelectionFields) {
    if (!contract.required_selection_fields?.includes(field)) issues.push(`required_selection_fields missing ${field}`);
  }
  for (const field of requiredAssemblyFields) {
    if (!contract.required_assembly_fields?.includes(field)) issues.push(`required_assembly_fields missing ${field}`);
  }
  if (!Array.isArray(contract.allowed_publication_statuses) || contract.allowed_publication_statuses.length !== 1 || contract.allowed_publication_statuses[0] !== 'not_a_translation') {
    issues.push('allowed_publication_statuses must contain only not_a_translation');
  }
  const rules = (contract.selection_rules || []).join(' ');
  if (!/answer_eligible means eligible for the HUD answer slot, not accepted definition authority or publication readiness/i.test(rules)) {
    issues.push('selection_rules must block answer_eligible as accepted authority/publication readiness');
  }
  if (!/Source\/license rows from selected cards must be retained in exports/i.test(rules)) {
    issues.push('selection_rules must retain source/license rows in exports');
  }
  if (!Array.isArray(contract.source_rows) || !contract.source_rows.length) {
    issues.push('source_rows must be non-empty');
  }
  for (const [index, row] of sourceRows.entries()) validateSourceRow(row, `source_rows[${index}]`);
}

function validateManifestRegistration() {
  if (!manifest) {
    warnings.push('manifest not present; public artifact registration not checked');
    return;
  }
  if (!Array.isArray(manifest.public_artifacts) || !manifest.public_artifacts.includes(contractPath)) {
    issues.push(`manifest.public_artifacts must include ${contractPath}`);
  }
}

function validateSourceRow(row, label) {
  for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url', 'fields_used', 'notes']) {
    if (!row?.[field]) issues.push(`${label}.${field} is required`);
  }
  if (!isSafeLicense(row.license)) issues.push(`${label}.license is forbidden or unclear: ${row.license || '(missing)'}`);
  if (!/^https:\/\//.test(row.license_url || '')) issues.push(`${label}.license_url must be https`);
}

function hasAll(values, required) {
  const set = new Set(Array.isArray(values) ? values : []);
  return required.every((value) => set.has(value));
}

function countPresent(values, required) {
  const set = new Set(Array.isArray(values) ? values : []);
  return required.filter((value) => set.has(value)).length;
}

function isSafeLicense(value) {
  return Boolean(String(value || '').trim()) && !forbiddenLicenseRe.test(String(value || ''));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, artifact) {
  const lines = [
    '# Gloss Selection Contract Validation',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Result',
    '',
    `- Status: ${artifact.status}`,
    `- Required selection fields: ${artifact.counts.required_selection_fields_present}/${artifact.counts.required_selection_fields_expected}`,
    `- Required assembly fields: ${artifact.counts.required_assembly_fields_present}/${artifact.counts.required_assembly_fields_expected}`,
    `- Allowed publication statuses: ${artifact.counts.allowed_publication_statuses}`,
    `- Source rows: ${artifact.counts.source_rows}`,
    `- Source rows with safe licenses: ${artifact.counts.source_rows_with_safe_license}/${artifact.counts.source_rows}`,
    `- Manifest registered: ${artifact.counts.manifest_registered}`,
    '',
    '## Boundary',
    '',
    `- Browser-local first: ${artifact.boundary.browser_local_first}`,
    `- JSON export/import only: ${artifact.boundary.json_export_import_only}`,
    `- Publication status limited to not_a_translation: ${artifact.boundary.not_a_translation_only}`,
    `- Answer role preserved: ${artifact.boundary.preserves_answer_role}`,
    `- Source rows preserved: ${artifact.boundary.preserves_source_rows}`,
    `- Publication readiness denied: ${artifact.boundary.publication_readiness_denied}`,
    `- Accepted translation denied: ${artifact.boundary.accepted_translation_denied}`,
    '',
    '## Issues',
    '',
    ...(artifact.issues.length ? artifact.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(artifact.warnings.length ? artifact.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
  ];
  writeText(relativePath, lines.join('\n'));
}

function writeText(relativePath, value) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, value, 'utf8');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
