#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  index: 'data/translation-memory/translation-memory-index.json',
  report: 'reports/agent5-translation-license-profile-audit.md',
  json: 'reports/agent5-translation-license-profile-audit.json',
};

const options = parseArgs(process.argv.slice(2));
const index = readJson(options.index);
const rows = loadRows(index);
const summary = summarize(rows);

writeJson(options.json, {
  generated_at: new Date().toISOString(),
  index: cleanRelativePath(options.index),
  summary,
  samples: samples(rows),
});
writeReport(options.report, summary, rows);

console.log(JSON.stringify({
  rows: rows.length,
  publication_classes: summary.by_publication_class,
  report: cleanRelativePath(options.report),
}, null, 2));

function loadRows(memoryIndex) {
  const output = [];
  for (const file of memoryIndex.decision_files || []) {
    const filePath = cleanRelativePath(file.path || '');
    const fullPath = path.join(root, filePath);
    if (!fs.existsSync(fullPath)) continue;
    for (const [lineIndex, line] of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).filter(Boolean).entries()) {
      const row = JSON.parse(line);
      output.push({ ...row, _file: filePath, _line: lineIndex + 1 });
    }
  }
  return output;
}

function summarize(rows) {
  const byPublicationClass = {};
  const byLicense = {};
  const byDirectUse = { direct_translation_use_ok: 0, review_required: 0 };
  const acceptedBlocked = [];
  for (const row of rows) {
    const profile = row.license_profile || {};
    const publicationClass = profile.publication_class || 'missing';
    byPublicationClass[publicationClass] = (byPublicationClass[publicationClass] || 0) + 1;
    if (profile.direct_translation_use_ok) byDirectUse.direct_translation_use_ok += 1;
    else byDirectUse.review_required += 1;
    for (const license of profile.licenses || ['missing']) {
      byLicense[license] = (byLicense[license] || 0) + 1;
    }
    if (row.decision_status === 'accepted' && profile.direct_translation_use_ok !== true) {
      acceptedBlocked.push({
        decision_id: row.decision_id,
        surface_text: row.surface_text,
        publication_class: publicationClass,
        licenses: profile.licenses || [],
      });
    }
  }
  return {
    rows: rows.length,
    by_publication_class: byPublicationClass,
    by_license: byLicense,
    by_direct_use: byDirectUse,
    accepted_blocked: acceptedBlocked,
  };
}

function samples(rows) {
  const byClass = {};
  for (const row of rows) {
    const publicationClass = row.license_profile?.publication_class || 'missing';
    if (byClass[publicationClass]) continue;
    byClass[publicationClass] = {
      decision_id: row.decision_id,
      surface_text: row.surface_text,
      decision_status: row.decision_status,
      rendering: row.english_rendering || row.literal_gloss || '',
      licenses: row.license_profile?.licenses || [],
      notes: row.license_profile?.notes || '',
    };
  }
  return byClass;
}

function writeReport(filePath, summary, rows) {
  const classLines = Object.entries(summary.by_publication_class)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `- ${key}: ${count}`);
  const licenseLines = Object.entries(summary.by_license)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `- ${key}: ${count}`);
  const reviewRows = rows.filter((row) => row.license_profile?.direct_translation_use_ok !== true);
  const lines = [
    '# Agent 5 Translation License Profile Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Scope',
    '',
    `- Index: ${cleanRelativePath(options.index)}`,
    `- Rows: ${summary.rows}`,
    '- This is a translation-memory license profile audit, not legal advice.',
    '',
    '## Publication Classes',
    '',
    ...classLines,
    '',
    '## License Counts',
    '',
    ...licenseLines,
    '',
    '## Direct Translation Use',
    '',
    `- direct_translation_use_ok: ${summary.by_direct_use.direct_translation_use_ok}`,
    `- review_required: ${summary.by_direct_use.review_required}`,
    '',
    '## Review-Required Samples',
    '',
    ...(reviewRows.length ? reviewRows.slice(0, 20).map(reviewLine) : ['- None.']),
    '',
    '## Control Interpretation',
    '',
    '- `license_safe=true` is sufficient for workbench display only.',
    '- Future translation publication should filter on `license_profile.direct_translation_use_ok=true` unless an explicit output-license decision exists.',
    '- CC BY-SA/GFDL evidence can remain visible in the workbench, but it should not silently become accepted translation text.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), `${lines.join('\n')}\n`, 'utf8');
}

function reviewLine(row) {
  const licenses = (row.license_profile?.licenses || []).join(', ') || 'missing license';
  return `- ${row.decision_id} / ${row.surface_text} / ${row.decision_status}: ${row.license_profile?.publication_class || 'missing'} (${licenses})`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--index') parsed.index = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/audit_translation_memory_license_profiles.mjs',
      '',
      'Options:',
      '  --index data/translation-memory/translation-memory-index.json',
      '  --report reports/agent5-translation-license-profile-audit.md',
      '  --json reports/agent5-translation-license-profile-audit.json',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
