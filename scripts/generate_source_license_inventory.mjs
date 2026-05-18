import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2] || 'data/sources';
const outputPath = process.argv[3] || 'reports/source-license-inventory.md';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function licenseFacts(license) {
  const text = String(license || 'unknown').trim();
  const lower = text.toLowerCase();
  const shareAlike = lower.includes('by-sa');
  const attribution = lower.includes('cc-by') || lower.includes('cc by') || shareAlike;
  const commercial = !(lower.includes('nc') || lower.includes('noncommercial') || lower.includes('all rights') || lower === 'unknown');
  if (lower === 'public domain' || lower === 'pd' || lower === 'cc0') {
    return {
      commercial: commercial ? 'yes' : 'review',
      share_alike: 'no',
      attribution: 'none required by license; source/version retained',
    };
  }
  return {
    commercial: commercial ? 'yes' : 'review',
    share_alike: shareAlike ? 'yes' : 'no',
    attribution: attribution ? 'required' : 'review source/version metadata',
  };
}

function sourceKey(unit) {
  return [
    unit.version_title || '',
    unit.version_source || '',
    unit.license || '',
    unit.digitization || '',
  ].join('\u001f');
}

const rows = [];
for (const fileName of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).sort()) {
  const source = readJson(path.join(sourceDir, fileName));
  const groups = new Map();
  for (const unit of source.units || []) {
    const key = sourceKey(unit);
    if (!groups.has(key)) {
      groups.set(key, {
        work_title: source.work_title || source.work_id || path.basename(fileName, '.json'),
        units: 0,
        version_title: unit.version_title || '',
        version_source: unit.version_source || '',
        license: unit.license || '',
        digitization: unit.digitization || '',
      });
    }
    groups.get(key).units += 1;
  }
  if (groups.size === 0) {
    rows.push({
      work_title: source.work_title || source.work_id || path.basename(fileName, '.json'),
      units: 0,
      version_title: '',
      version_source: '',
      license: '',
      digitization: '',
    });
  } else {
    rows.push(...groups.values());
  }
}

rows.sort((a, b) => a.work_title.localeCompare(b.work_title) || a.version_title.localeCompare(b.version_title));

const lines = [];
lines.push('# Source License Inventory', '');
lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`, '');
lines.push('| Work | Units | Hebrew version title (source URL) | License | Commercial reuse allowed | Share-alike | Attribution requirements |');
lines.push('|---|---:|---|---|---|---|---|');
for (const row of rows) {
  const facts = licenseFacts(row.license);
  const sourceLabel = row.version_source
    ? `${row.version_title || 'unknown'} (${row.version_source})`
    : (row.version_title || row.digitization || 'unknown');
  lines.push(`| ${mdCell(row.work_title)} | ${row.units} | ${mdCell(sourceLabel)} | ${mdCell(row.license || 'unknown')} | ${facts.commercial} | ${facts.share_alike} | ${facts.attribution} |`);
}

writeText(outputPath, `${lines.join('\n')}\n`);
console.log(JSON.stringify({
  output: outputPath,
  source_files: fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).length,
  rows: rows.length,
}, null, 2));
