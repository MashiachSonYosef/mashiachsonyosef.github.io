#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(name);
  if (index === -1 || index + 1 >= args.length) return '';
  return args[index + 1];
}

const sourceDir = path.join(root, getArg('--source-dir') || 'data/sources');
const overlayDir = path.join(root, getArg('--overlay-dir') || 'data/overlays');
const onlyWorkIdsPath = getArg('--only-work-ids-path');
const writeFullSite = !args.includes('--no-full-site');
const writePerWork = !args.includes('--no-per-work');

const headers = [
  'work_id',
  'work_title',
  'source_ref',
  'anchor_id',
  'translation',
  'translator_notes',
  'done_status',
  'updated_at'
];

function readText(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text;
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function exportText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value
      .filter(item => item != null && String(item).trim())
      .map(item => String(item).trim())
      .join('; ');
  }
  return String(value).trim();
}

function csvCell(value) {
  return `"${exportText(value).replace(/"/g, '""')}"`;
}

function markdownCell(value) {
  return exportText(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function getOverlayUnit(overlay, unitId) {
  if (!overlay || !overlay.units) return {};
  return overlay.units[unitId] || {};
}

function getRowsForSource(source) {
  const overlayPath = path.join(overlayDir, `${source.work_id}.json`);
  const overlay = fs.existsSync(overlayPath) ? readJson(overlayPath) : { units: {} };
  return (source.units || []).map(unit => {
    const overlayUnit = getOverlayUnit(overlay, unit.unit_id);
    const translation = exportText(overlayUnit.strict_translation);
    const translatorNotes = exportText(overlayUnit.clean_translation);
    return {
      work_id: source.work_id,
      work_title: source.work_title,
      source_ref: unit.source_ref,
      anchor_id: unit.anchor_id,
      translation,
      translator_notes: translatorNotes,
      done_status: translation ? 'done' : 'not_done',
      updated_at: exportText(overlayUnit.updated_at)
    };
  });
}

function renderCsv(rows) {
  return [
    headers.map(csvCell).join(','),
    ...rows.map(row => headers.map(header => csvCell(row[header])).join(','))
  ].join('\n') + '\n';
}

function renderMarkdown(rows) {
  return [
    '| work_id | work_title | source_ref | anchor_id | translation | translator_notes | done_status | updated_at |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map(row => `| ${headers.map(header => markdownCell(row[header])).join(' | ')} |`)
  ].join('\n') + '\n';
}

function writeExports(exportDir, rows) {
  writeText(path.join(exportDir, 'overlay-export.csv'), renderCsv(rows));
  writeText(path.join(exportDir, 'overlay-export.json'), JSON.stringify(rows, null, 2) + '\n');
  writeText(path.join(exportDir, 'overlay-export.md'), renderMarkdown(rows));
}

function writeFullSiteExports(rows, sources) {
  writeText(path.join(root, 'overlay-export.csv'), renderCsv(rows));
  writeText(path.join(root, 'overlay-export.md'), renderMarkdown(rows));

  const manifest = {
    schema_version: 2,
    kind: 'overlay_export_manifest',
    generated_at: new Date().toISOString(),
    row_count: rows.length,
    note: 'The full-site JSON export is split by work to avoid a single oversized repository file. Use the per-work overlay-export.json paths listed here, or use the full-site CSV/Markdown exports at the repository root.',
    full_site_exports: {
      csv: 'overlay-export.csv',
      markdown: 'overlay-export.md'
    },
    per_work_json: sources.map(source => ({
      work_id: source.work_id,
      work_title: source.work_title,
      path: `${source.work_slug}/overlay-export.json`,
      unit_count: (source.units || []).length
    }))
  };

  writeText(path.join(root, 'overlay-export.json'), JSON.stringify(manifest, null, 2) + '\n');
}

const onlyWorkIds = new Set();
if (onlyWorkIdsPath) {
  for (const line of readText(path.join(root, onlyWorkIdsPath)).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) onlyWorkIds.add(trimmed);
  }
}

const sources = fs.readdirSync(sourceDir)
  .filter(file => file.endsWith('.json'))
  .map(file => readJson(path.join(sourceDir, file)))
  .sort((a, b) => String(a.work_title || '').localeCompare(String(b.work_title || ''), 'en'));

let fullSiteRows = [];
let perWorkCount = 0;

for (const source of sources) {
  const rows = getRowsForSource(source);
  fullSiteRows = fullSiteRows.concat(rows);
  if (writePerWork && (onlyWorkIds.size === 0 || onlyWorkIds.has(source.work_id))) {
    writeExports(path.join(root, source.work_slug), rows);
    perWorkCount += 1;
  }
}

if (writeFullSite) {
  writeFullSiteExports(fullSiteRows, sources);
}

console.log(JSON.stringify({
  sources: sources.length,
  full_site_rows: fullSiteRows.length,
  per_work_exports_written: perWorkCount,
  full_site_written: writeFullSite
}, null, 2));
