import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return fallback;
}

const sourceDir = readArg('--source-dir', 'data/sources');
const outPath = readArg('--out', 'data/catalog/source-catalog.json');

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function pick(source, key, fallback = null) {
  return Object.prototype.hasOwnProperty.call(source, key) ? source[key] : fallback;
}

const summaries = [];
let totalUnits = 0;

for (const filePath of listJsonFiles(sourceDir)) {
  const source = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const unitCount = Array.isArray(source.units) ? source.units.length : Number(source.unit_count || 0);
  totalUnits += unitCount;
  summaries.push({
    work_id: pick(source, 'work_id', path.basename(filePath, '.json')),
    work_title: pick(source, 'work_title', path.basename(filePath, '.json')),
    work_slug: pick(source, 'work_slug', path.basename(filePath, '.json')),
    sefaria_ref: pick(source, 'sefaria_ref'),
    work_type: pick(source, 'work_type', 'primary_text'),
    base_work_id: pick(source, 'base_work_id'),
    base_work_title: pick(source, 'base_work_title'),
    base_ref_pattern: pick(source, 'base_ref_pattern'),
    display_label: pick(source, 'display_label'),
    source_system: pick(source, 'source_system'),
    source_base_url: pick(source, 'source_base_url'),
    import_date: pick(source, 'import_date'),
    unit_count: unitCount,
  });
}

summaries.sort((a, b) => String(a.work_title).localeCompare(String(b.work_title)));

const catalog = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source_dir: sourceDir.replaceAll('\\', '/'),
  source_count: summaries.length,
  total_units: totalUnits,
  sources: summaries,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(catalog)}\n`, 'utf8');
console.log(`Wrote ${outPath} with ${summaries.length} sources and ${totalUnits} units.`);
