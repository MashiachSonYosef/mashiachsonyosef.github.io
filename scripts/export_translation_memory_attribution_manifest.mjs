#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  index: 'data/translation-memory/translation-memory-index.json',
  output: 'data/translation-memory/attribution-manifest.json',
  report: 'reports/agent5-translation-attribution-manifest-report.md',
};

const options = parseArgs(process.argv.slice(2));
const index = readJson(options.index);
const rows = loadRows(index);
const manifest = buildManifest(rows);

writeJson(options.output, manifest);
writeReport(options.report, manifest);

console.log(JSON.stringify({
  rows: rows.length,
  sources: manifest.counts.sources,
  attribution_required_sources: manifest.counts.attribution_required_sources,
  publication_review_sources: manifest.counts.publication_review_sources,
  output: cleanRelativePath(options.output),
}, null, 2));

function loadRows(memoryIndex) {
  const output = [];
  for (const file of memoryIndex.decision_files || []) {
    const fullPath = path.join(root, cleanRelativePath(file.path || ''));
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).filter(Boolean)) {
      output.push(JSON.parse(line));
    }
  }
  return output;
}

function buildManifest(rows) {
  const sourceMap = new Map();
  for (const row of rows) {
    for (const source of row.source_rows || []) {
      const key = sourceKey(source);
      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          source_name: source.source_name || '',
          source_family: source.source_family || '',
          source_id: source.source_id || '',
          source_url: source.source_url || '',
          license: source.license || '',
          license_url: source.license_url || '',
          fields_used: new Set(),
          decision_rows: new Set(),
          publication_classes: new Set(),
          sample_surfaces: [],
        });
      }
      const entry = sourceMap.get(key);
      for (const field of source.fields_used || []) entry.fields_used.add(field);
      entry.decision_rows.add(row.decision_id);
      entry.publication_classes.add(row.license_profile?.publication_class || 'missing');
      if (entry.sample_surfaces.length < 8) entry.sample_surfaces.push(row.surface_text);
    }
  }
  const sources = [...sourceMap.values()].map((entry) => {
    const licenseProfile = classifyLicense(entry.license);
    return {
      source_name: entry.source_name,
      source_family: entry.source_family,
      source_id: entry.source_id,
      source_url: entry.source_url,
      license: entry.license,
      license_url: entry.license_url,
      attribution_required: licenseProfile.attribution_required,
      share_alike_required: licenseProfile.share_alike_required,
      copyleft_review_required: licenseProfile.copyleft_review_required,
      fields_used: [...entry.fields_used].sort(),
      decision_row_count: entry.decision_rows.size,
      publication_classes: [...entry.publication_classes].sort(),
      sample_surfaces: entry.sample_surfaces,
    };
  }).sort((a, b) => b.decision_row_count - a.decision_row_count || a.source_family.localeCompare(b.source_family));
  const unknownLicenseSources = sources.filter((source) => isUnknownLicense(source.license));
  const sefariaSources = sources.filter((source) => isSefariaSource(source));

  return {
    schema_version: 1,
    artifact_type: 'translation_memory_attribution_manifest',
    generated_at: new Date().toISOString(),
    source_index: cleanRelativePath(options.index),
    policy: 'Attribution/provenance manifest for future translation mode. This is not a publication license decision.',
    counts: {
      decision_rows: rows.length,
      accepted_decision_rows: rows.filter((row) => row.decision_status === 'accepted').length,
      sources: sources.length,
      attribution_required_sources: sources.filter((source) => source.attribution_required).length,
      publication_review_sources: sources.filter((source) => source.share_alike_required || source.copyleft_review_required).length,
      unknown_license_sources: unknownLicenseSources.length,
      sefaria_sources: sefariaSources.length,
    },
    sources,
  };
}

function sourceKey(source) {
  return [
    source.source_family || '',
    source.source_id || '',
    source.source_url || '',
    source.license || '',
  ].join('|');
}

function classifyLicense(license) {
  const text = String(license || '').toLowerCase();
  if (/cc0|public domain|project-authored|project lexical rule|n\/a - project/.test(text)) {
    return { attribution_required: false, share_alike_required: false, copyleft_review_required: false };
  }
  if (/cc by-sa|gfdl/.test(text)) {
    return { attribution_required: true, share_alike_required: /cc by-sa/.test(text), copyleft_review_required: /gfdl/.test(text) };
  }
  if (/cc by\b/.test(text)) {
    return { attribution_required: true, share_alike_required: false, copyleft_review_required: false };
  }
  return { attribution_required: true, share_alike_required: false, copyleft_review_required: true };
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

function writeReport(filePath, manifest) {
  const lines = [
    '# Agent 5 Translation Attribution Manifest Report',
    '',
    `Generated: ${manifest.generated_at}`,
    '',
    '## Summary',
    '',
    `- Decision rows: ${manifest.counts.decision_rows}`,
    `- Accepted decision rows: ${manifest.counts.accepted_decision_rows}`,
    `- Sources: ${manifest.counts.sources}`,
    `- Attribution-required sources: ${manifest.counts.attribution_required_sources}`,
    `- Publication-review sources: ${manifest.counts.publication_review_sources}`,
    `- Unknown-license sources: ${manifest.counts.unknown_license_sources}`,
    `- Sefaria sources: ${manifest.counts.sefaria_sources}`,
    '',
    '## Sources',
    '',
    ...manifest.sources.map(sourceLine),
    '',
    '## Control Interpretation',
    '',
    '- This manifest gives future translation mode a single attribution/provenance feed.',
    '- It does not make share-alike/GFDL rows publication-ready; it only makes their obligations explicit.',
    '- The translation renderer should pair accepted rows with this manifest before public release.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), `${lines.join('\n')}\n`, 'utf8');
}

function sourceLine(source) {
  const flags = [
    source.attribution_required ? 'attribution' : 'no-attribution-burden',
    source.share_alike_required ? 'share-alike' : '',
    source.copyleft_review_required ? 'copyleft-review' : '',
  ].filter(Boolean).join(', ');
  return `- ${source.source_family}/${source.source_id}: ${source.license}; rows ${source.decision_row_count}; ${flags}; ${source.source_url}`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--index') parsed.index = cleanRelativePath(args[++index]);
    else if (arg === '--output') parsed.output = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/export_translation_memory_attribution_manifest.mjs',
      '',
      'Options:',
      '  --index data/translation-memory/translation-memory-index.json',
      '  --output data/translation-memory/attribution-manifest.json',
      '  --report reports/agent5-translation-attribution-manifest-report.md',
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
