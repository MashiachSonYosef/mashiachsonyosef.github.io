import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbiddenTextRe = /\bPotential\b|potential option|copyright unclear|all rights reserved|Non-?Commercial|\bNC\b/i;
const requiredRouteTypes = new Set([
  'biblical_paraphrase_evidence',
  'citable_paraphrase_evidence',
]);

function readJson(relativePath, required = true) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    if (required) throw new Error(`Missing required file: ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function fail(issues) {
  if (!issues.length) {
    console.log('Definition output validation passed.');
    return;
  }
  console.error(`Definition output validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

function checkNoForbiddenText(value, context, issues) {
  if (forbiddenTextRe.test(String(value ?? ''))) {
    issues.push(`${context}: contains forbidden or vague text "${String(value).slice(0, 120)}"`);
  }
}

function validateSourceRows(rows, context, issues) {
  if (!asArray(rows).length) {
    issues.push(`${context}: missing source rows`);
    return;
  }
  for (const [index, row] of asArray(rows).entries()) {
    const rowContext = `${context}.source_rows[${index}]`;
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
      if (!row?.[field]) issues.push(`${rowContext}: missing ${field}`);
      checkNoForbiddenText(row?.[field], `${rowContext}.${field}`, issues);
    }
  }
}

function validateManifest(issues) {
  const manifest = readJson('data/definitions/manifest.json');
  checkNoForbiddenText(JSON.stringify(manifest), 'data/definitions/manifest.json', issues);
  const priority = new Set(asArray(manifest.route_policy?.answer_priority));
  for (const routeType of requiredRouteTypes) {
    if (!priority.has(routeType)) issues.push(`manifest route_policy.answer_priority: missing ${routeType}`);
  }
  for (const artifact of [
    'data/definitions/paraphrase-route-policy.json',
    'data/definitions/definition-route-sample.json',
    'data/definitions/phrase-evidence-sample.json',
  ]) {
    if (!asArray(manifest.public_artifacts).includes(artifact)) {
      issues.push(`manifest public_artifacts: missing ${artifact}`);
    }
  }
}

function validateDefinitionSamples(issues) {
  const samples = readJson('data/definitions/definition-route-sample.json');
  for (const [index, sample] of asArray(samples.samples).entries()) {
    const context = `definition-route-sample.samples[${index}]`;
    if (sample.winner) {
      validateSourceRows(sample.winner.source_rows, `${context}.winner`, issues);
      if (sample.winner.route_type === 'lemma' && /Deuteronomy/i.test(sample.winner.gloss || '')) {
        issues.push(`${context}.winner: Deuteronomy lemma should not win a clicked-form sample`);
      }
      if (sample.winner.route_type === 'maqaf_compound') {
        issues.push(`${context}.winner: maqaf compound must not be invented without a source-backed whole-compound route`);
      }
    }
    for (const [routeIndex, route] of asArray(sample.supporting_routes).entries()) {
      validateSourceRows(route.source_rows, `${context}.supporting_routes[${routeIndex}]`, issues);
    }
    for (const [traceIndex, trace] of asArray(sample.audit_traces).entries()) {
      validateSourceRows(trace.source_rows, `${context}.audit_traces[${traceIndex}]`, issues);
    }
    checkNoForbiddenText(JSON.stringify(sample), context, issues);
  }
}

function validatePhraseSamples(issues) {
  const phraseSample = readJson('data/definitions/phrase-evidence-sample.json', false);
  if (!phraseSample) return;
  for (const [index, row] of asArray(phraseSample.samples).entries()) {
    const context = `phrase-evidence-sample.samples[${index}]`;
    validateSourceRows(row.source_rows, context, issues);
    if (row.meaning_claim !== null) {
      issues.push(`${context}: phrase evidence must not claim an English meaning`);
    }
    if (!row.focus_surface || !row.focus_normalized || !row.phrase_hebrew) {
      issues.push(`${context}: missing focus/phrase fields`);
    }
    if (!['phrase_evidence', 'subphrase_evidence'].includes(row.route_type)) {
      issues.push(`${context}: unexpected route_type ${row.route_type}`);
    }
    checkNoForbiddenText(JSON.stringify(row), context, issues);
  }
}

function validateParaphrasePolicy(issues) {
  const policy = readJson('data/definitions/paraphrase-route-policy.json');
  const routeTypes = new Set(asArray(policy.route_families).map((route) => route.route_type));
  for (const routeType of requiredRouteTypes) {
    if (!routeTypes.has(routeType)) issues.push(`paraphrase-route-policy route_families: missing ${routeType}`);
  }
  validateSourceRows(policy.source_rows, 'paraphrase-route-policy', issues);
  checkNoForbiddenText(JSON.stringify(policy), 'paraphrase-route-policy', issues);
}

const issues = [];
validateManifest(issues);
validateDefinitionSamples(issues);
validatePhraseSamples(issues);
validateParaphrasePolicy(issues);
fail(issues);
