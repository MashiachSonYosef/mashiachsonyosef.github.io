#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generatorScript = 'scripts/validate_route_publication_boundary.mjs';
const defaults = {
  manifest: 'data/definitions/hud-route-lookup/manifest.json',
  fixture: 'data/definitions/route-publication-boundary-fixtures.json',
  output: 'reports/route-publication-boundary-audit.json',
  report: 'reports/route-publication-boundary-audit.md',
  maxIssues: 100,
  maxWarnings: 25,
  fixturesOnly: false,
  help: false,
};

const publicationReadinessFields = [
  'accepted_translation',
  'accepted_translation_ready',
  'accepted_translation_status',
  'publication_ready',
  'publication_role',
  'publication_status',
  'render_ready',
  'translation_ready',
  'translation_status',
];

const hudAllowedLicensePatterns = [
  /^project-authored \/ CC0$/i,
  /^CC0$/i,
  /^CC BY 4\.0$/i,
  /^CC-BY(?: 4\.0)?$/i,
  /^CC BY-SA 4\.0$/i,
  /^CC-BY-SA(?: 4\.0)?$/i,
  /^CC BY-SA 4\.0 \/ GFDL$/i,
  /^CC BY-SA 4\.0\/GFDL$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^N\/A - project lexical rule$/i,
  /^N\/A - project-authored lexical rules$/i,
];
const translationOutputSafeLicensePatterns = [
  /^project-authored \/ CC0$/i,
  /^CC0$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^N\/A - project lexical rule$/i,
  /^N\/A - project-authored lexical rules$/i,
];
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;

const options = parseArgs(process.argv.slice(2));
let fixtureCaseCount = 0;
fixtureCaseCount = runFixtureSelfTest(options.fixture);
if (options.fixturesOnly) {
  console.log(`Route publication boundary fixture self-test passed. Cases: ${fixtureCaseCount}.`);
  process.exit(0);
}
const manifest = readJson(options.manifest);
const audit = createAudit(manifest);

for (const shard of manifest.shards || []) {
  audit.counts.shards += 1;
  auditShard(shard);
}

writeJson(options.output, audit);
writeReport(options.report, audit);

if (audit.counts.issue_count > 0) {
  console.error(`Route publication boundary validation failed with ${audit.counts.issue_count} issue(s).`);
  console.error(`Wrote ${options.output}`);
  console.error(`Wrote ${options.report}`);
  process.exit(1);
}

console.log(`Route publication boundary validation passed. Cards: ${audit.counts.cards}. Answer-eligible: ${audit.counts.answer_eligible_cards}. Translation-output unsafe cards flagged: ${audit.counts.translation_output_unsafe_cards}.`);
console.log(`Fixture self-test passed. Cases: ${fixtureCaseCount}.`);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);

function createAudit(manifestData = {}) {
  const includeInputFileSummaries = manifestData.include_input_file_summaries !== false;
  return {
    schema_version: 1,
    artifact_type: 'route_publication_boundary_audit',
    generated_at: new Date().toISOString(),
    generator: generatorScript,
    policy: [
      'HUD route answer eligibility may select a definition card inside the lexical HUD.',
      'It is not publication readiness for accepted translation output.',
      'Route cards must keep source/license rows; translation-output safety is flagged separately from HUD route safety.',
    ].join(' '),
    inputs: {
      manifest: options.manifest,
      manifest_file: includeInputFileSummaries ? fileSummary(options.manifest) : null,
      fixture: options.fixture,
      fixture_cases: fixtureCaseCount,
      fixture_file: includeInputFileSummaries ? fileSummary(options.fixture) : null,
      generator_file: includeInputFileSummaries ? fileSummary(generatorScript) : null,
      public_lookup: manifestData.public_lookup || 'data/definitions/hud-route-lookup',
      max_issues: options.maxIssues,
      max_warnings: options.maxWarnings,
    },
    counts: {
      shards: 0,
      tokens: 0,
      cards: 0,
      answer_eligible_cards: 0,
      answer_eligible_cards_with_source_rows: 0,
      source_rows: 0,
      hud_safe_source_rows: 0,
      hud_unsafe_source_rows: 0,
      translation_output_safe_source_rows: 0,
      translation_output_unsafe_source_rows: 0,
      translation_output_unsafe_cards: 0,
      answer_eligible_translation_output_unsafe_cards: 0,
      route_cards_with_publication_fields: 0,
      issue_count: 0,
      warning_count: 0,
    },
    licenses: {},
    unsafe_translation_output_licenses: {},
    answer_eligible_unsafe_translation_output_licenses: {},
    route_families: {},
    route_types: {},
    issues: [],
    warnings: [],
  };
}

function runFixtureSelfTest(relativePath) {
  const fixture = readJson(relativePath);
  const issues = [];
  if (fixture.schema_version !== 1) issues.push('fixture schema_version must be 1');
  if (fixture.artifact_type !== 'route_publication_boundary_fixtures') {
    issues.push(`fixture artifact_type must be route_publication_boundary_fixtures, got ${fixture.artifact_type || 'missing'}`);
  }
  for (const [index, testCase] of (fixture.cases || []).entries()) {
    const target = createAudit({ public_lookup: 'fixture', include_input_file_summaries: false });
    auditCard(testCase.card, `fixture:${testCase.label || index}`, target);
    for (const [countName, expectedValue] of Object.entries(testCase.expected_counts || {})) {
      const actualValue = Number(target.counts[countName] || 0);
      if (actualValue !== expectedValue) {
        issues.push(`${testCase.label || `case ${index}`}: expected counts.${countName}=${expectedValue}, got ${actualValue}`);
      }
    }
    for (const [mapName, expectedValues] of Object.entries(testCase.expected_map_counts || {})) {
      const actualValues = target[mapName] || {};
      for (const [key, expectedValue] of Object.entries(expectedValues || {})) {
        const actualValue = Number(actualValues[key] || 0);
        if (actualValue !== expectedValue) {
          issues.push(`${testCase.label || `case ${index}`}: expected ${mapName}.${key}=${expectedValue}, got ${actualValue}`);
        }
      }
    }
    assertFixtureSubstrings(issues, testCase, 'expected_issue_substrings', target.issues, index);
    assertFixtureSubstrings(issues, testCase, 'expected_warning_substrings', target.warnings, index);
  }
  if (issues.length) {
    console.error(`Route publication boundary fixture self-test failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  return (fixture.cases || []).length;
}

function assertFixtureSubstrings(issues, testCase, fieldName, rows, index) {
  for (const expected of testCase[fieldName] || []) {
    const needle = String(expected);
    const found = rows.some((row) => `${row.context || ''} ${row.detail || ''}`.includes(needle));
    if (!found) {
      issues.push(`${testCase.label || `case ${index}`}: missing ${fieldName} match: ${needle}`);
    }
  }
}

function auditShard(shardEntry) {
  const lookupRoot = cleanRelativePath(manifest.public_lookup || 'data/definitions/hud-route-lookup');
  const shardPath = cleanRelativePath(`${lookupRoot}/${shardEntry.path}`);
  const shard = readJson(shardPath);
  const byToken = shard.routes_by_normalized || {};
  for (const [normalized, cards] of Object.entries(byToken)) {
    audit.counts.tokens += 1;
    if (!Array.isArray(cards)) {
      addIssue(`${shardPath}:${normalized}`, 'routes_by_normalized value is not an array');
      continue;
    }
    for (const [index, card] of cards.entries()) {
      auditCard(card, `${shardPath}:${normalized}[${index}]`);
    }
  }
}

function auditCard(card, context, target = audit) {
  target.counts.cards += 1;
  increment(target.route_families, card?.route_family || 'missing');
  increment(target.route_types, card?.route_type || 'missing');

  const publicationFields = publicationReadinessFields.filter((field) => Object.hasOwn(card || {}, field));
  if (publicationFields.length) {
    target.counts.route_cards_with_publication_fields += 1;
    addIssue(context, `route card carries publication-readiness field(s): ${publicationFields.join(', ')}`, target);
  }

  const sourceRows = Array.isArray(card?.source_rows) ? card.source_rows : [];
  if (card?.answer_eligible === true) {
    target.counts.answer_eligible_cards += 1;
    if (card.answer_role !== 'answer') addIssue(context, 'answer_eligible card must use answer_role=answer', target);
    if (!sourceRows.length) addIssue(context, 'answer_eligible card missing source_rows', target);
    else target.counts.answer_eligible_cards_with_source_rows += 1;
  }

  let cardHasTranslationUnsafeRow = false;
  for (const [rowIndex, row] of sourceRows.entries()) {
    target.counts.source_rows += 1;
    const license = String(row?.license || '').trim();
    increment(target.licenses, license || 'missing');
    if (!hudSafe(row)) {
      target.counts.hud_unsafe_source_rows += 1;
      addIssue(`${context}.source_rows[${rowIndex}]`, `unsafe HUD source license profile: ${license || 'missing'}`, target);
    } else {
      target.counts.hud_safe_source_rows += 1;
    }
    if (translationOutputSafe(row)) {
      target.counts.translation_output_safe_source_rows += 1;
    } else {
      target.counts.translation_output_unsafe_source_rows += 1;
      cardHasTranslationUnsafeRow = true;
      increment(target.unsafe_translation_output_licenses, license || 'missing');
      if (card?.answer_eligible === true) {
        increment(target.answer_eligible_unsafe_translation_output_licenses, license || 'missing');
      }
    }
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
      if (!row?.[field]) addIssue(`${context}.source_rows[${rowIndex}]`, `missing ${field}`, target);
    }
    if (!Array.isArray(row?.fields_used) || !row.fields_used.length) {
      addIssue(`${context}.source_rows[${rowIndex}]`, 'missing fields_used', target);
    }
    if (!row?.notes) addIssue(`${context}.source_rows[${rowIndex}]`, 'missing notes', target);
  }

  if (cardHasTranslationUnsafeRow) {
    target.counts.translation_output_unsafe_cards += 1;
    if (card?.answer_eligible === true) target.counts.answer_eligible_translation_output_unsafe_cards += 1;
    addWarning(context, 'card is HUD-route usable but not automatically safe as accepted translation-output support without downstream license handling', target);
  }
}

function hudSafe(row) {
  const license = String(row?.license || '').trim();
  if (!license || forbiddenLicenseRe.test(license)) return false;
  return hudAllowedLicensePatterns.some((pattern) => pattern.test(license));
}

function translationOutputSafe(row) {
  const license = String(row?.license || '').trim();
  if (!license || forbiddenLicenseRe.test(license)) return false;
  return translationOutputSafeLicensePatterns.some((pattern) => pattern.test(license));
}

function addIssue(context, detail, target = audit) {
  target.counts.issue_count += 1;
  if (target.issues.length >= options.maxIssues) return;
  target.issues.push({ context, detail: String(detail).slice(0, 300) });
}

function addWarning(context, detail, target = audit) {
  target.counts.warning_count += 1;
  if (target.warnings.length >= options.maxWarnings) return;
  target.warnings.push({ context, detail: String(detail).slice(0, 300) });
}

function increment(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Route Publication Boundary Audit',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- `answer_eligible` means the route card can be considered for the HUD answer slot.',
    '- `answer_eligible` is not accepted translation-output readiness.',
    '- Publication readiness must come from a later renderer/translation gate, not from this route lookup.',
    '',
    '## Counts',
    '',
    `- Shards scanned: ${data.counts.shards}`,
    `- Tokens scanned: ${data.counts.tokens}`,
    `- Cards scanned: ${data.counts.cards}`,
    `- Answer-eligible cards: ${data.counts.answer_eligible_cards}`,
    `- Answer-eligible cards with source rows: ${data.counts.answer_eligible_cards_with_source_rows}`,
    `- Source rows checked: ${data.counts.source_rows}`,
    `- HUD-unsafe source rows: ${data.counts.hud_unsafe_source_rows}`,
    `- Translation-output unsafe source rows flagged: ${data.counts.translation_output_unsafe_source_rows}`,
    `- Translation-output unsafe cards flagged: ${data.counts.translation_output_unsafe_cards}`,
    `- Answer-eligible translation-output unsafe cards flagged: ${data.counts.answer_eligible_translation_output_unsafe_cards}`,
    `- Cards with publication-readiness fields: ${data.counts.route_cards_with_publication_fields}`,
    `- Issues: ${data.counts.issue_count}`,
    `- Warnings: ${data.counts.warning_count}`,
    `- Manifest SHA-256: \`${data.inputs.manifest_file?.sha256 || 'missing'}\``,
    `- Validator SHA-256: \`${data.inputs.generator_file?.sha256 || 'missing'}\``,
    `- Fixture cases checked: ${data.inputs.fixture_cases}`,
    `- Fixture bytes: ${data.inputs.fixture_file?.byte_length || 0}`,
    `- Fixture SHA-256: \`${data.inputs.fixture_file?.sha256 || 'missing'}\``,
    '',
    '## Unsafe For Accepted Translation Output',
    '',
    'These rows may still be valid HUD route evidence, but they are not automatically safe as accepted translation-output support without downstream attribution/license handling.',
    '',
    ...topCounts(data.unsafe_translation_output_licenses, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Unsafe For Accepted Translation Output',
    '',
    'These are answer-slot candidates whose source rows remain HUD-safe but require downstream attribution/license handling before use as accepted translation-output support.',
    '',
    ...topCounts(data.answer_eligible_unsafe_translation_output_licenses, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Route Families',
    '',
    ...topCounts(data.route_families, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue.context}: ${issue.detail}`) : ['None.']),
    '',
    '## Warning Contexts',
    '',
    data.warnings.length
      ? `Stored in ${options.output} with a capped sample of ${data.warnings.length} warning context(s).`
      : 'None.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function topCounts(object, limit) {
  return Object.entries(object || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--fixture=')) parsed.fixture = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-issues=')) parsed.maxIssues = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-warnings=')) parsed.maxWarnings = Number(valueAfterEquals(arg));
    else if (arg === '--fixtures-only') parsed.fixturesOnly = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_route_publication_boundary.mjs',
      '',
      'Options:',
      '  --manifest=data/definitions/hud-route-lookup/manifest.json',
      '  --fixture=data/definitions/route-publication-boundary-fixtures.json',
      '  --output=reports/route-publication-boundary-audit.json',
      '  --report=reports/route-publication-boundary-audit.md',
      '  --max-issues=100',
      '  --max-warnings=25',
      '  --fixtures-only',
      '  --help',
    ].join('\n'));
    process.exit(0);
  }
  for (const key of ['maxIssues', 'maxWarnings']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) throw new Error(`--${key} must be a non-negative integer`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function fileSummary(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  const bytes = fs.readFileSync(fullPath);
  return {
    path: cleanRelativePath(relativePath),
    byte_length: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
