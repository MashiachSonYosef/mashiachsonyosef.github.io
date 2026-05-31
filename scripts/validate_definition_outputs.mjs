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
    'data/definitions/paraphrase-evidence-contract.json',
    'data/definitions/paraphrase-evidence-sample.json',
    'data/definitions/citable-paraphrase-evidence-sample.json',
    'data/definitions/hud-route-contract.json',
    'data/definitions/hud-route-fixtures.json',
    'data/definitions/hud-route-store-sample.json',
    'data/definitions/hud-route-lookup-sample.json',
    'data/definitions/hud-route-lookup/manifest.json',
    'data/definitions/definition-route-sample.json',
    'data/definitions/phrase-evidence-sample.json',
  ]) {
    if (!asArray(manifest.public_artifacts).includes(artifact)) {
      issues.push(`manifest public_artifacts: missing ${artifact}`);
    }
  }
}

function validateHudRouteArtifacts(issues) {
  const contract = readJson('data/definitions/hud-route-contract.json');
  const fixtures = readJson('data/definitions/hud-route-fixtures.json');
  const contractSections = new Set(asArray(contract.route_sections).map((section) => section.section_id));
  for (const required of [
    'answer',
    'strict_hebrew',
    'strict_aramaic',
    'lemma',
    'subphrase_evidence',
    'biblical_paraphrase_evidence',
    'citable_paraphrase_evidence',
    'phrase_evidence',
    'source_license',
    'audit',
  ]) {
    if (!contractSections.has(required)) issues.push(`hud-route-contract route_sections: missing ${required}`);
  }
  if (contract.rendering_rules?.source_license_expanded_by_default !== true) {
    issues.push('hud-route-contract: source/license rows must be expanded by default');
  }
  if (contract.rendering_rules?.supports_unbounded_cards !== true) {
    issues.push('hud-route-contract: must support unbounded route cards');
  }
  checkNoForbiddenText(JSON.stringify(contract), 'hud-route-contract', issues);
  checkNoForbiddenText(JSON.stringify(fixtures), 'hud-route-fixtures', issues);
  for (const [sampleIndex, sample] of asArray(fixtures.samples).entries()) {
    const context = `hud-route-fixtures.samples[${sampleIndex}]`;
    if (!asArray(sample.route_sections).length) issues.push(`${context}: missing route_sections`);
    if (!asArray(sample.audit_checks).length) issues.push(`${context}: missing audit_checks`);
    if (sample.answer_card) validateSourceRows(sample.answer_card.source_rows, `${context}.answer_card`, issues);
    for (const [groupIndex, group] of asArray(sample.source_license_groups).entries()) {
      validateSourceRows([group], `${context}.source_license_groups[${groupIndex}]`, issues);
    }
  }
}

function validateDefinitionSamples(issues) {
  const samples = readJson('data/definitions/definition-route-sample.json');
  for (const [index, sample] of asArray(samples.samples).entries()) {
    const context = `definition-route-sample.samples[${index}]`;
    if (sample.winner) {
      validateSourceRows(sample.winner.source_rows, `${context}.winner`, issues);
      if (sample.winner.answer_eligible !== true || sample.winner.answer_role !== 'answer') {
        issues.push(`${context}.winner: winner must be answer_eligible with answer_role=answer`);
      }
      if (sample.winner.route_type === 'lemma' && /Deuteronomy/i.test(sample.winner.gloss || '')) {
        issues.push(`${context}.winner: Deuteronomy lemma should not win a clicked-form sample`);
      }
      if (sample.winner.route_type === 'maqaf_compound') {
        issues.push(`${context}.winner: maqaf compound must not be invented without a source-backed whole-compound route`);
      }
    }
    for (const [routeIndex, route] of asArray(sample.supporting_routes).entries()) {
      validateSourceRows(route.source_rows, `${context}.supporting_routes[${routeIndex}]`, issues);
      if (route.answer_eligible !== true && Number.isFinite(route.answer_score)) {
        issues.push(`${context}.supporting_routes[${routeIndex}]: non-answer route must not carry answer_score`);
      }
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

function validateCitableParaphraseSamples(issues) {
  const sample = readJson('data/definitions/citable-paraphrase-evidence-sample.json', false);
  if (!sample) return;
  for (const [index, row] of asArray(sample.samples).entries()) {
    const context = `citable-paraphrase-evidence-sample.samples[${index}]`;
    validateSourceRows(row.source_rows, context, issues);
    if (row.route_type !== 'citable_paraphrase_evidence') {
      issues.push(`${context}: unexpected route_type ${row.route_type}`);
    }
    if (!['proposed', 'accepted', 'rejected'].includes(row.candidate_status)) {
      issues.push(`${context}: invalid candidate_status ${row.candidate_status}`);
    }
    if (!Number.isFinite(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) {
      issues.push(`${context}: raw_score must be 0..100`);
    }
    if (row.score_handicap !== 20) issues.push(`${context}: score_handicap must be 20`);
    if (Number.isFinite(row.raw_score) && row.adjusted_score !== row.raw_score - 20) {
      issues.push(`${context}: adjusted_score must equal raw_score - 20`);
    }
    if (!asArray(row.phrase_tokens).some((token) => token?.role === 'focus-token')) {
      issues.push(`${context}: phrase_tokens must include a focus-token`);
    }
    if (!row.source_definition_claim_id) {
      issues.push(`${context}: missing source_definition_claim_id`);
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

function validateParaphraseEvidenceContract(issues) {
  const contract = readJson('data/definitions/paraphrase-evidence-contract.json');
  const sample = readJson('data/definitions/paraphrase-evidence-sample.json');
  const routeTypes = new Set(asArray(contract.route_types));
  for (const routeType of requiredRouteTypes) {
    if (!routeTypes.has(routeType)) issues.push(`paraphrase-evidence-contract route_types: missing ${routeType}`);
  }
  if (contract.scoring?.required_score_handicap !== 20) {
    issues.push('paraphrase-evidence-contract scoring.required_score_handicap must be 20');
  }
  if (contract.hud_consumption_rule && !/accepted/.test(contract.hud_consumption_rule)) {
    issues.push('paraphrase-evidence-contract must state that only accepted rows are consumed');
  }
  validateSourceRows(contract.source_rows, 'paraphrase-evidence-contract', issues);
  if (!Array.isArray(sample.samples)) issues.push('paraphrase-evidence-sample.samples must be an array');
  checkNoForbiddenText(JSON.stringify(contract), 'paraphrase-evidence-contract', issues);
  checkNoForbiddenText(JSON.stringify(sample), 'paraphrase-evidence-sample', issues);
}

const issues = [];
validateManifest(issues);
validateDefinitionSamples(issues);
validatePhraseSamples(issues);
validateCitableParaphraseSamples(issues);
validateParaphrasePolicy(issues);
validateParaphraseEvidenceContract(issues);
validateHudRouteArtifacts(issues);
fail(issues);
