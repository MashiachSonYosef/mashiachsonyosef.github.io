import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

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
  'Public Domain',
  'Public Domain Mark',
  'N/A - project-authored lexical rules',
]);

const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;

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

function checkLicense(license, context, issues) {
  if (!license || typeof license !== 'string') {
    issues.push(`${context}: missing license`);
    return;
  }
  if (forbiddenLicenseRe.test(license)) {
    issues.push(`${context}: forbidden or unclear license "${license}"`);
    return;
  }
  if (!allowedLicenses.has(license)) {
    issues.push(`${context}: license is not in allow-list: "${license}"`);
  }
}

function validateSourceRows(rows, context, issues) {
  for (const [index, row] of asArray(rows).entries()) {
    const rowContext = `${context}.source_rows[${index}]`;
    checkLicense(row?.license, rowContext, issues);
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license_url']) {
      if (!row?.[field]) issues.push(`${rowContext}: missing ${field}`);
    }
  }
}

function validateMorphologyRules(issues) {
  const data = readJson('data/lexical/morphology-rules.json');
  checkLicense(data.license, 'morphology layer', issues);
  validateSourceRows(data.source_rows, 'morphology layer', issues);
  const ids = new Set();
  for (const [index, rule] of asArray(data.rules).entries()) {
    const context = `morphology.rules[${index}]`;
    for (const field of ['rule_id', 'kind', 'language', 'hebrew', 'plain_label', 'route_role', 'confidence']) {
      if (rule?.[field] === undefined || rule?.[field] === '') issues.push(`${context}: missing ${field}`);
    }
    if (ids.has(rule.rule_id)) issues.push(`${context}: duplicate rule_id ${rule.rule_id}`);
    ids.add(rule.rule_id);
    if (!asArray(rule.meanings).length) issues.push(`${context}: meanings must contain at least one plain meaning`);
    if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 100) {
      issues.push(`${context}: confidence must be 0..100`);
    }
    if (rule.safe_default !== true) issues.push(`${context}: safe_default must be true for public routing`);
  }
}

function validateLexicalLayerLicenses(issues) {
  const manifest = readJson('data/lexical/lexicon.json');
  for (const layer of asArray(manifest.layer_files)) {
    const context = `data/lexical/lexicon.json layer ${layer.layer_id}`;
    checkLicense(layer.license, context, issues);
  }
}

function validateDefinitionArtifacts(issues) {
  const manifest = readJson('data/definitions/manifest.json', false);
  if (manifest) {
    validateSourceRows(manifest.source_rows, 'data/definitions/manifest.json', issues);
    for (const source of asArray(manifest.sources)) {
      checkLicense(source.license, `data/definitions/manifest.json source ${source.source_id || source.layer_id}`, issues);
      if (source.accepted !== true) issues.push(`data/definitions/manifest.json source ${source.source_id || source.layer_id}: source is not accepted`);
    }
  }

  const inventory = readJson('data/definitions/source-license-inventory.json', false);
  if (inventory) {
    for (const source of asArray(inventory.sources)) {
      checkLicense(source.license, `data/definitions/source-license-inventory.json source ${source.source_id}`, issues);
      if (source.accepted !== true) issues.push(`data/definitions/source-license-inventory.json source ${source.source_id}: source is not accepted`);
    }
  }

  const phraseSample = readJson('data/definitions/phrase-evidence-sample.json', false);
  if (phraseSample) {
    for (const [index, row] of asArray(phraseSample.samples).entries()) {
      validateSourceRows(row?.source_rows, `data/definitions/phrase-evidence-sample.json samples[${index}]`, issues);
      if (row?.meaning_claim !== null) {
        issues.push(`data/definitions/phrase-evidence-sample.json samples[${index}]: phrase rows must not claim English meaning`);
      }
    }
  }

  const paraphrasePolicy = readJson('data/definitions/paraphrase-route-policy.json', false);
  if (paraphrasePolicy) {
    checkLicense(paraphrasePolicy.license, 'data/definitions/paraphrase-route-policy.json', issues);
    validateSourceRows(paraphrasePolicy.source_rows, 'data/definitions/paraphrase-route-policy.json', issues);
    const routeTypes = new Set(asArray(paraphrasePolicy.route_families).map((route) => route.route_type));
    for (const required of ['biblical_paraphrase_evidence', 'citable_paraphrase_evidence']) {
      if (!routeTypes.has(required)) {
        issues.push(`data/definitions/paraphrase-route-policy.json: missing route family ${required}`);
      }
    }
  }
}

const issues = [];
validateMorphologyRules(issues);
validateLexicalLayerLicenses(issues);
validateDefinitionArtifacts(issues);

if (issues.length) {
  console.error(`Definition source validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition source validation passed.');
