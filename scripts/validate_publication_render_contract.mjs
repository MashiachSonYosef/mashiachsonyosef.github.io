#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  index: 'data/translation-memory/translation-memory-index.json',
  manifest: 'data/translation-memory/attribution-manifest.json',
  render: 'data/translation-memory/publication-render-output.json',
  report: 'reports/agent5-publication-render-contract-report.md',
  requireRender: false,
};

const options = parseArgs(process.argv.slice(2));
const issues = [];
const warnings = [];

const memoryIndex = readJson(options.index);
const manifest = readJson(options.manifest);
const decisions = loadDecisionRows(memoryIndex);
const decisionById = new Map(decisions.map((row) => [row.decision_id, row]));
const manifestSourceByKey = new Map((manifest.sources || []).map((source) => [sourceKey(source), source]));
const renderExists = fs.existsSync(path.join(root, options.render));

let renderArtifact = null;
let renderRows = [];

if (!renderExists) {
  const message = `No publication render artifact found at ${options.render}`;
  if (options.requireRender) issues.push(message);
  else warnings.push(`${message}; publication release remains blocked until a renderer output is validated.`);
} else {
  renderArtifact = loadRenderArtifact(options.render);
  renderRows = extractRenderRows(renderArtifact);
  validateRenderArtifact(renderArtifact, renderRows);
}

const decisionStatusCounts = countBy(decisions, (row) => row.decision_status || 'missing');
const unknownLicenseSources = (manifest.sources || []).filter((source) => isUnknownLicense(source.license));
const sefariaSources = (manifest.sources || []).filter((source) => isSefariaSource(source));
const publicationReviewSources = (manifest.sources || []).filter((source) => source.share_alike_required || source.copyleft_review_required);

const status = issues.length ? 'fail' : renderExists ? 'pass' : 'blocked_no_render';
writeReport({
  status,
  renderExists,
  renderRows,
  decisionStatusCounts,
  unknownLicenseSources,
  sefariaSources,
  publicationReviewSources,
});

if (issues.length) {
  console.error(`Publication render contract validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status,
  rendered_rows: renderRows.length,
  accepted_decision_rows: decisionStatusCounts.accepted || 0,
  unknown_license_sources: unknownLicenseSources.length,
  sefaria_sources: sefariaSources.length,
  report: options.report,
}, null, 2));

function validateRenderArtifact(artifact, rows) {
  if (!Array.isArray(rows)) {
    issues.push('publication render artifact must contain an array of rendered translation rows');
    return;
  }
  if (!rows.length) warnings.push('publication render artifact has 0 rendered rows; publication output is empty.');

  const seenDecisionIds = new Set();
  for (const [index, row] of rows.entries()) {
    validateRenderedRow(row, `rendered_rows[${index}]`, artifact, seenDecisionIds);
  }
}

function validateRenderedRow(row, context, artifact, seenDecisionIds) {
  if (!row || typeof row !== 'object') {
    issues.push(`${context}: row must be an object`);
    return;
  }
  if (!row.decision_id) {
    issues.push(`${context}: missing decision_id`);
    return;
  }
  if (seenDecisionIds.has(row.decision_id)) issues.push(`${context}: duplicate rendered decision_id ${row.decision_id}`);
  seenDecisionIds.add(row.decision_id);

  const decision = decisionById.get(row.decision_id);
  if (!decision) {
    issues.push(`${context}: decision_id ${row.decision_id} is not present in translation memory index`);
    return;
  }

  if (row.decision_status !== 'accepted') issues.push(`${context}: rendered row decision_status must be accepted`);
  if (decision.decision_status !== 'accepted') issues.push(`${context}: source decision row is ${decision.decision_status}, not accepted`);
  if (row.license_safe !== true) issues.push(`${context}: rendered row license_safe must be true`);
  if (decision.license_safe !== true) issues.push(`${context}: source decision row license_safe must be true`);
  validateRenderedLicenseProfile(row.license_profile, `${context}.license_profile`);
  if (decision.license_profile?.direct_translation_use_ok !== true) {
    issues.push(`${context}: source decision license_profile.direct_translation_use_ok must be true`);
  }

  const renderedText = String(row.rendered_text || row.english_rendering || '').trim();
  if (!renderedText) issues.push(`${context}: rendered_text or english_rendering is required`);
  if (renderedText && decision.english_rendering && renderedText !== decision.english_rendering) {
    issues.push(`${context}: rendered text must match accepted decision english_rendering`);
  }

  const sourceRows = Array.isArray(row.source_rows) && row.source_rows.length ? row.source_rows : decision.source_rows;
  if (!Array.isArray(sourceRows) || !sourceRows.length) {
    issues.push(`${context}: source_rows must be present on rendered row or source decision`);
  } else {
    for (const [sourceIndex, source] of sourceRows.entries()) {
      if (!manifestSourceByKey.has(sourceKey(source))) {
        issues.push(`${context}.source_rows[${sourceIndex}]: no matching attribution manifest source`);
      }
    }
  }

  const requiresAttribution = row.license_profile?.attribution_required === true
    || decision.license_profile?.attribution_required === true
    || sourceRows.some((source) => manifestSourceByKey.get(sourceKey(source))?.attribution_required === true);
  if (requiresAttribution && !hasAttributionBundle(row, artifact)) {
    issues.push(`${context}: attribution bundle is required for one or more sources`);
  }

  const publicationClass = row.license_profile?.publication_class || decision.license_profile?.publication_class;
  if (publicationClass === 'workbench_ok_publication_review' && !hasOutputLicenseDecision(row, artifact)) {
    issues.push(`${context}: workbench_ok_publication_review row requires explicit output-license decision`);
  }
}

function validateRenderedLicenseProfile(profile, context) {
  if (!profile || typeof profile !== 'object') {
    issues.push(`${context}: rendered row must include license_profile`);
    return;
  }
  if (profile.direct_translation_use_ok !== true) {
    issues.push(`${context}: direct_translation_use_ok must be true`);
  }
  if (profile.publication_class === 'workbench_ok_publication_review' && !profile.output_license_decision_id) {
    warnings.push(`${context}: publication_class remains workbench_ok_publication_review; explicit output-license decision must be attached`);
  }
}

function hasAttributionBundle(row, artifact) {
  if (isNonEmptyObject(row.attribution_bundle) || isNonEmptyArray(row.attribution_bundle)) return true;
  if (isNonEmptyObject(artifact?.attribution_bundle) || isNonEmptyArray(artifact?.attribution_bundle)) return true;
  return false;
}

function hasOutputLicenseDecision(row, artifact) {
  if (row.output_license_decision?.approved === true) return true;
  const decisionsById = artifact?.output_license_decisions || {};
  const decision = decisionsById[row.decision_id] || decisionsById[row.license_profile?.output_license_decision_id];
  return decision?.approved === true;
}

function loadDecisionRows(index) {
  const rows = [];
  for (const file of index.decision_files || []) {
    const fullPath = path.join(root, cleanRelativePath(file.path || ''));
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).filter(Boolean)) {
      rows.push(JSON.parse(line));
    }
  }
  return rows;
}

function loadRenderArtifact(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  const text = fs.readFileSync(fullPath, 'utf8').trim();
  if (!text) return [];
  if (text.startsWith('{') || text.startsWith('[')) return JSON.parse(text);
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function extractRenderRows(artifact) {
  if (Array.isArray(artifact)) return artifact;
  if (!artifact || typeof artifact !== 'object') return [];
  for (const key of ['rendered_rows', 'translation_rows', 'translations', 'rows']) {
    if (Array.isArray(artifact[key])) return artifact[key];
  }
  return [];
}

function writeReport(summary) {
  const lines = [
    '# Agent 5 Publication Render Contract Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Status: ${summary.status}`,
    `- Render artifact exists: ${summary.renderExists ? 'yes' : 'no'}`,
    `- Rendered translation rows checked: ${summary.renderRows.length}`,
    `- Translation-memory accepted rows: ${summary.decisionStatusCounts.accepted || 0}`,
    `- Attribution-manifest unknown-license sources: ${summary.unknownLicenseSources.length}`,
    `- Attribution-manifest Sefaria sources: ${summary.sefariaSources.length}`,
    `- Attribution-manifest publication-review sources: ${summary.publicationReviewSources.length}`,
    '',
    '## Enforced Publication Rules',
    '',
    '- Every rendered row must point to a translation-memory `decision_id`.',
    '- Every rendered row must carry `decision_status=accepted`.',
    '- The source decision row must also be `decision_status=accepted`.',
    '- Every rendered row and source decision row must carry `license_safe=true`.',
    '- Every rendered row must include `license_profile.direct_translation_use_ok=true`.',
    '- Every rendered row must match at least one manifest source for each rendered/source decision source row.',
    '- Attribution-required rows must have an attribution bundle.',
    '- `workbench_ok_publication_review` rows require an explicit output-license decision.',
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${issue}`) : ['- None.']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ['- None.']),
    '',
    '## Control Interpretation',
    '',
    '- This validator is the publication renderer gate requested by Agent 6.',
    '- A clean attribution manifest alone is not sufficient for publication release.',
    '- If no publication render artifact exists, publication remains blocked rather than implicitly cleared.',
    '',
  ];
  const fullPath = path.join(root, cleanRelativePath(options.report));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function countBy(rows, selector) {
  const counts = {};
  for (const row of rows) counts[selector(row)] = (counts[selector(row)] || 0) + 1;
  return counts;
}

function sourceKey(source) {
  return [
    source?.source_family || '',
    source?.source_id || '',
    source?.source_url || '',
    source?.license || '',
  ].join('|');
}

function isUnknownLicense(license) {
  return /\bunknown\b|\bunverified\b|copyright unclear|permission only|all rights reserved/i.test(String(license || ''));
}

function isSefariaSource(source) {
  return /sefaria/i.test([
    source?.source_name,
    source?.source_family,
    source?.source_id,
    source?.source_url,
  ].filter(Boolean).join(' '));
}

function isNonEmptyObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--index') parsed.index = cleanRelativePath(args[++index]);
    else if (arg === '--manifest') parsed.manifest = cleanRelativePath(args[++index]);
    else if (arg === '--render') parsed.render = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--require-render') parsed.requireRender = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_publication_render_contract.mjs [--render path/to/render.json]',
      '',
      'Options:',
      '  --index data/translation-memory/translation-memory-index.json',
      '  --manifest data/translation-memory/attribution-manifest.json',
      '  --render data/translation-memory/publication-render-output.json',
      '  --report reports/agent5-publication-render-contract-report.md',
      '  --require-render',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
