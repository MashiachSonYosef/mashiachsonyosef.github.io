import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const argv = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    argv.set(arg.slice(2), process.argv[i + 1]);
    i += 1;
  }
}

const sourceDir = argv.get('source-dir') || 'data/sources';
const overlayDir = argv.get('overlay-dir') || 'data/overlays';
const lexicalDir = argv.get('lexical-dir') || 'data/lexical';
const errors = [];

const unitIds = new Set();
const anchorIds = new Set();
const sourceByWorkId = new Map();
const unitCountByWorkId = new Map();
const slugByWorkId = new Map();
const unitIdsByWorkId = new Map();

function rel(...parts) {
  return path.join(...parts);
}

function abs(p) {
  return path.resolve(root, p);
}

function exists(p) {
  return fs.existsSync(abs(p));
}

function readText(p) {
  return fs.readFileSync(abs(p), 'utf8');
}

function readFirstLine(p) {
  const text = readText(p);
  const index = text.search(/\r?\n/);
  return index === -1 ? text : text.slice(0, index);
}

function readJson(p) {
  try {
    return JSON.parse(readText(p));
  } catch (error) {
    errors.push(`Invalid JSON in ${p}: ${error.message}`);
    return null;
  }
}

function own(obj, field) {
  return obj && Object.prototype.hasOwnProperty.call(obj, field);
}

function present(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function asArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function listJsonFiles(dir) {
  const dirPath = abs(dir);
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => rel(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function testExportFiles(exportDir, expectedRows, label) {
  const csvPath = rel(exportDir, 'overlay-export.csv');
  const jsonPath = rel(exportDir, 'overlay-export.json');
  const mdPath = rel(exportDir, 'overlay-export.md');
  const expectedCsvHeader = '"work_id","work_title","source_ref","anchor_id","translation","translator_notes","done_status","updated_at"';
  const expectedMarkdownHeader = '| work_id | work_title | source_ref | anchor_id | translation | translator_notes | done_status | updated_at |';

  for (const filePath of [csvPath, jsonPath, mdPath]) {
    if (!exists(filePath)) {
      errors.push(`Missing overlay export for ${label}: ${filePath}`);
      return;
    }
  }

  if (readFirstLine(csvPath) !== expectedCsvHeader) {
    errors.push(`Unexpected CSV overlay export header for ${label}`);
  }
  if (readFirstLine(mdPath) !== expectedMarkdownHeader) {
    errors.push(`Unexpected Markdown overlay export header for ${label}`);
  }

  for (const filePath of [csvPath, jsonPath, mdPath]) {
    const text = readText(filePath);
    for (const placeholder of ['[Awaiting translation]', '[Awaiting notes]', 'Translation pending']) {
      if (text.includes(placeholder)) {
        errors.push(`Overlay export contains placeholder text in ${label}: ${placeholder}`);
      }
    }
  }

  const parsedRows = readJson(jsonPath);
  if (!parsedRows) return;

  if (!Array.isArray(parsedRows) && parsedRows.kind === 'overlay_export_manifest') {
    if (label !== 'full-site') {
      errors.push(`Per-work overlay JSON must contain rows, not a manifest: ${label}`);
      return;
    }
    if (!own(parsedRows, 'row_count')) {
      errors.push('Full-site overlay manifest missing row_count');
    } else if (Number(parsedRows.row_count) !== expectedRows) {
      errors.push(`Overlay JSON manifest row count mismatch for ${label}: expected ${expectedRows}, found ${parsedRows.row_count}`);
    }
    for (const field of ['schema_version', 'full_site_exports', 'per_work_json']) {
      if (!own(parsedRows, field)) {
        errors.push(`Full-site overlay manifest missing ${field}`);
      }
    }
    for (const entry of asArray(parsedRows.per_work_json)) {
      for (const field of ['work_id', 'path', 'unit_count']) {
        if (!own(entry, field)) {
          errors.push(`Full-site overlay manifest entry missing ${field}`);
        }
      }
      if (own(entry, 'path') && !exists(String(entry.path))) {
        errors.push(`Full-site overlay manifest references missing per-work JSON: ${entry.path}`);
      }
      if (own(entry, 'work_id') && unitCountByWorkId.has(String(entry.work_id))) {
        const expectedWorkRows = unitCountByWorkId.get(String(entry.work_id));
        if (Number(entry.unit_count) !== expectedWorkRows) {
          errors.push(`Full-site overlay manifest unit_count mismatch for ${entry.work_id}: expected ${expectedWorkRows}, found ${entry.unit_count}`);
        }
      }
    }
    return;
  }

  const rows = asArray(parsedRows);
  if (rows.length !== expectedRows) {
    errors.push(`Overlay JSON row count mismatch for ${label}: expected ${expectedRows}, found ${rows.length}`);
  }

  const requiredFields = ['work_id', 'work_title', 'source_ref', 'anchor_id', 'translation', 'translator_notes', 'done_status', 'updated_at'];
  for (const row of rows) {
    for (const field of requiredFields) {
      if (!own(row, field)) {
        errors.push(`Overlay export row missing ${field} in ${label}`);
      }
    }
    for (const forbiddenField of ['hebrew', 'english', 'status']) {
      if (own(row, forbiddenField)) {
        errors.push(`Overlay export row contains forbidden field ${forbiddenField} in ${label}`);
      }
    }
    const translation = row.translation === null || row.translation === undefined ? '' : String(row.translation).trim();
    const expectedDoneStatus = translation ? 'done' : 'not_done';
    if (row.done_status !== expectedDoneStatus) {
      errors.push(`Overlay export done_status mismatch for ${label} / ${row.anchor_id}`);
    }
  }
}

for (const sourcePath of listJsonFiles(sourceDir)) {
  const source = readJson(sourcePath);
  if (!source) continue;

  const overlayPath = rel(overlayDir, `${source.work_id}.json`);
  sourceByWorkId.set(String(source.work_id), source);
  unitCountByWorkId.set(String(source.work_id), asArray(source.units).length);
  slugByWorkId.set(String(source.work_id), String(source.work_slug));
  const workUnitIds = new Set();

  for (const field of ['work_id', 'work_title', 'work_slug', 'sefaria_ref', 'source_system', 'import_date', 'work_type']) {
    if (!present(source[field])) {
      errors.push(`Missing work field ${field} in ${path.basename(sourcePath)}`);
    }
  }

  if (source.work_type === 'commentary') {
    for (const field of ['base_work_id', 'base_work_title', 'display_label']) {
      if (!present(source[field])) {
        errors.push(`Commentary work missing ${field} in ${source.work_id}`);
      }
    }
  } else if (source.work_type !== 'primary_text' && source.work_type !== 'base_text') {
    errors.push(`Unexpected work_type '${source.work_type}' in ${source.work_id}`);
  }

  if (!exists(overlayPath)) {
    errors.push(`Missing overlay file for ${source.work_id}`);
  }
  if (!Array.isArray(source.outline) || source.outline.length === 0) {
    errors.push(`Missing outline in ${source.work_id}`);
  }

  for (const unit of asArray(source.units)) {
    for (const field of ['unit_id', 'anchor_id', 'source_ref', 'license', 'version_title', 'import_date', 'group_title', 'section_title']) {
      if (!present(unit[field])) {
        errors.push(`Missing ${field} in ${unit.unit_id}`);
      }
    }

    if (!Array.isArray(unit.hebrew) || unit.hebrew.length === 0) {
      errors.push(`Missing Hebrew in ${unit.unit_id}`);
    }
    for (const paragraph of asArray(unit.hebrew)) {
      if (!paragraph || !String(paragraph).trim()) {
        errors.push(`Blank Hebrew paragraph in ${unit.unit_id}`);
      }
    }

    for (const forbiddenField of ['translation', 'english', 'strict_translation', 'clean_translation']) {
      if (own(unit, forbiddenField)) {
        errors.push(`Source unit contains English/translation field: ${unit.unit_id}`);
      }
    }

    if (unitIds.has(unit.unit_id)) {
      errors.push(`Duplicate unit_id: ${unit.unit_id}`);
    } else {
      unitIds.add(unit.unit_id);
    }
    workUnitIds.add(String(unit.unit_id));

    if (anchorIds.has(unit.anchor_id)) {
      errors.push(`Duplicate anchor_id: ${unit.anchor_id}`);
    } else {
      anchorIds.add(unit.anchor_id);
    }
  }
  unitIdsByWorkId.set(String(source.work_id), workUnitIds);

  const workPagePath = rel(source.work_slug, 'index.html');
  if (exists(workPagePath)) {
    const workPage = readText(workPagePath);
    for (const badUi of ['progress-panel', 'progress-meter', 'progress-controls', 'filter-button', 'data-filter=', 'data-next-not-done', 'data-complete=', 'Next not done', '% complete']) {
      if (workPage.includes(badUi)) {
        errors.push(`Generated work page contains removed progress UI '${badUi}' for ${source.work_id}`);
      }
    }
    if (!workPage.includes('License')) {
      errors.push(`Generated work page missing required text 'License' for ${source.work_id}`);
    }
    for (const badOverlayText of ['<span class="overlay-label">Translation</span>', '<span class="overlay-label">Translator&rsquo;s Notes</span>', 'English overlay license']) {
      if (workPage.includes(badOverlayText)) {
        errors.push(`Generated work page contains removed overlay UI '${badOverlayText}' for ${source.work_id}`);
      }
    }
    if (source.work_type === 'commentary') {
      const encodedDisplayLabel = String(source.display_label)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
      if (!workPage.includes(encodedDisplayLabel)) {
        errors.push(`Generated commentary page missing display label '${source.display_label}' for ${source.work_id}`);
      }
      for (const commentaryText of ['Base Text', 'Commentary']) {
        if (!workPage.includes(commentaryText)) {
          errors.push(`Generated commentary page missing paired panel text '${commentaryText}' for ${source.work_id}`);
        }
      }
      const hasBasePairStatus = workPage.includes('[Base text not imported or not linked yet]')
        || workPage.includes('Base text is imported. Exact paired ref linking is not implemented yet.')
        || workPage.includes('Matched base passages appear beside commentary rows when refs align.')
        || workPage.includes('paired-text-grid');
      if (!hasBasePairStatus) {
        errors.push(`Generated commentary page missing base text paired status for ${source.work_id}`);
      }
    }
    if (!workPage.includes('Hebrew version:') && !workPage.includes('Hebrew Version')) {
      errors.push(`Generated work page missing Hebrew version metadata for ${source.work_id}`);
    }
    for (const badText of ['TranslatorÃ¢', 'Translation pending', 'Notes / Pressure Words', '[Awaiting translation]', '[Awaiting notes]']) {
      if (workPage.includes(badText)) {
        errors.push(`Generated work page contains disallowed text '${badText}' for ${source.work_id}`);
      }
    }
  } else {
    errors.push(`Missing generated work page for ${source.work_id}: ${workPagePath}`);
  }
}

if (exists('index.html')) {
  const homePage = readText('index.html');
  for (const badUi of ['progress-controls', 'filter-button', 'data-work-filter', 'data-work-complete', 'Progress:', 'Not done']) {
    if (homePage.includes(badUi)) {
      errors.push(`Homepage contains removed progress UI '${badUi}'`);
    }
  }
  for (const requiredText of ['Hebrew Source Workbench', 'lexical HUD support']) {
    if (!homePage.includes(requiredText)) {
      errors.push(`Homepage missing required text '${requiredText}'`);
    }
  }
  if (homePage.includes('TranslatorÃ¢')) {
    errors.push('Homepage contains raw encoding bug text: TranslatorÃ¢');
  }
} else {
  errors.push('Missing homepage index.html');
}

if (exists(rel('about', 'index.html'))) {
  const aboutPage = readText(rel('about', 'index.html'));
  for (const requiredText of [
    'Hebrew source texts retain their original source/version licenses',
    'Lexical rows retain per-source licensing',
    'No copyrighted English translations are imported',
    'not an official edition',
  ]) {
    if (!aboutPage.includes(requiredText)) {
      errors.push(`About / License page missing required text '${requiredText}'`);
    }
  }
} else {
  errors.push('Missing About / License page: about/index.html');
}

const lexiconEntryIds = new Set();
const lexiconPath = rel(lexicalDir, 'lexicon.json');
if (exists(lexiconPath)) {
  const lexicon = readJson(lexiconPath);
  if (lexicon) {
    let lexiconEntries = asArray(lexicon.entries);
    if (lexiconEntries.length === 0 && own(lexicon, 'layer_files')) {
      for (const layer of asArray(lexicon.layer_files)) {
        if (!layer.path) {
          errors.push(`Lexicon layer missing path: ${layer.layer_id}`);
          continue;
        }
        const layerPath = rel(lexicalDir, String(layer.path));
        if (!exists(layerPath)) {
          errors.push(`Missing lexical source layer file: ${layerPath}`);
          continue;
        }
        const layerJson = readJson(layerPath);
        if (!layerJson) continue;
        for (const field of ['schema_version', 'layer_id', 'source_family', 'license', 'entries']) {
          if (!own(layerJson, field)) {
            errors.push(`Lexical source layer missing ${field}: ${layerPath}`);
          }
        }
        lexiconEntries = lexiconEntries.concat(asArray(layerJson.entries));
      }
    }
    for (const entry of lexiconEntries) {
      for (const field of ['entry_id', 'hebrew_word', 'transliteration', 'strict_renderings', 'root', 'root_transliteration', 'root_meaning', 'source_rows']) {
        if (!own(entry, field)) {
          errors.push(`Lexicon entry missing property ${field}: ${entry.entry_id}`);
        }
      }
      if (!entry.entry_id || !entry.hebrew_word) {
        errors.push(`Lexicon entry missing required identity fields: ${entry.entry_id}`);
      }
      if (!entry.source_rows || asArray(entry.source_rows).length === 0) {
        errors.push(`Lexicon entry missing source rows: ${entry.entry_id}`);
      }
      lexiconEntryIds.add(String(entry.entry_id));
      for (const row of asArray(entry.source_rows)) {
        for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url', 'fields_used', 'notes']) {
          if (!present(row[field])) {
            errors.push(`Lexical source row missing ${field} for ${entry.entry_id}`);
          }
        }
        if (row.source_family === 'wiktionary' || row.source_family === 'kaikki') {
          if (row.source_name !== 'Wiktionary via Kaikki') {
            errors.push(`Kaikki/Wiktionary row has unexpected source_name for ${entry.entry_id}: ${row.source_name}`);
          }
          if (row.license !== 'CC BY-SA 4.0 / GFDL') {
            errors.push(`Kaikki/Wiktionary row has unexpected license for ${entry.entry_id}: ${row.license}`);
          }
          if (!row.source_url || !String(row.source_url).includes('kaikki.org/dictionary/Hebrew')) {
            errors.push(`Kaikki/Wiktionary row missing Kaikki source URL for ${entry.entry_id}`);
          }
        }
      }
    }
  }
}

const tokenIndexIds = new Set();
const tokenIndexPath = rel(lexicalDir, 'token-index.json');
if (exists(tokenIndexPath)) {
  const tokenIndex = readJson(tokenIndexPath);
  if (tokenIndex) {
    const indexPaths = [];
    if (own(tokenIndex, 'forms') && asArray(tokenIndex.forms).length > 0) {
      indexPaths.push(null);
    } else if (own(tokenIndex, 'work_indexes')) {
      for (const indexFile of asArray(tokenIndex.work_indexes)) {
        if (!indexFile.path) {
          errors.push(`Token index manifest work index missing path: ${indexFile.work_id}`);
          continue;
        }
        const indexPath = rel(lexicalDir, String(indexFile.path));
        if (!exists(indexPath)) {
          errors.push(`Missing per-work token index: ${indexPath}`);
          continue;
        }
        indexPaths.push(indexPath);
      }
    }

    const checkTokenRows = (rows, indexPath) => {
      for (const row of asArray(rows)) {
        for (const field of ['token_index_id', 'surface_word', 'normalized_word', 'status', 'occurrence_count']) {
          if (!present(row[field])) {
            errors.push(`Token index row missing ${field}: ${row.token_index_id}`);
          }
        }
        tokenIndexIds.add(String(row.token_index_id));
        if (row.status === 'matched' && !lexiconEntryIds.has(String(row.lexicon_entry_id))) {
          errors.push(`Matched token index row references missing lexicon_entry_id ${row.lexicon_entry_id}: ${row.token_index_id}`);
        }
      }
    };

    if (indexPaths.length === 1 && indexPaths[0] === null) {
      checkTokenRows(tokenIndex.forms, tokenIndexPath);
    } else {
      for (const indexPath of indexPaths) {
        const workTokenIndex = readJson(indexPath);
        if (!workTokenIndex) continue;
        for (const field of ['schema_version', 'work_id', 'work_title', 'work_slug', 'forms']) {
          if (!own(workTokenIndex, field)) {
            errors.push(`Per-work token index missing ${field}: ${indexPath}`);
          }
        }
        checkTokenRows(workTokenIndex.forms, indexPath);
      }
    }
  }
} else {
  errors.push(`Missing lexical token index: ${tokenIndexPath}`);
}

const occurrenceDir = rel(lexicalDir, 'occurrences');
const lexicalFiles = exists(occurrenceDir) ? listJsonFiles(occurrenceDir) : [];
if (lexicalFiles.length !== sourceByWorkId.size) {
  errors.push(`Lexical HUD occurrence scope should cover every imported work. Expected ${sourceByWorkId.size}, found ${lexicalFiles.length}`);
}

const lexicalWorkIds = new Set();
for (const lexicalFile of lexicalFiles) {
  const lexical = readJson(lexicalFile);
  if (!lexical) continue;
  for (const field of ['schema_version', 'work_id', 'work_title', 'work_slug', 'total_occurrences', 'units']) {
    if (!present(lexical[field])) {
      errors.push(`Lexical occurrence file missing ${field}: ${path.basename(lexicalFile)}`);
    }
  }
  if (!sourceByWorkId.has(String(lexical.work_id))) {
    errors.push(`Lexical occurrence file references unknown work_id: ${lexical.work_id}`);
    continue;
  }
  lexicalWorkIds.add(String(lexical.work_id));
  const workUnitIds = unitIdsByWorkId.get(String(lexical.work_id));
  const occurrenceCount = lexical.units ? Object.keys(lexical.units).length : 0;
  const expectedUnitCount = unitCountByWorkId.get(String(lexical.work_id));
  if (occurrenceCount !== expectedUnitCount) {
    errors.push(`Lexical occurrence count mismatch for ${lexical.work_id}: expected ${expectedUnitCount}, found ${occurrenceCount}`);
  }

  const manifestPath = rel(lexicalDir, `${lexical.work_id}.manifest.json`);
  if (!exists(manifestPath)) {
    errors.push(`Missing external lexical payload manifest for ${lexical.work_id}: ${manifestPath}`);
  } else {
    const manifest = readJson(manifestPath);
    if (manifest) {
      const chunks = asArray(manifest.chunks);
      if (chunks.length < 1) {
        errors.push(`Lexical payload should have at least one external chunk for ${lexical.work_id}`);
      }
      if (lexical.work_id === 'orot' && chunks.length < 2) {
        errors.push('Orot lexical payload should be split into multiple external chunks');
      }
      for (const chunk of chunks) {
        const chunkPath = rel(lexicalDir, String(chunk.url));
        if (!exists(chunkPath)) {
          errors.push(`Missing external lexical payload chunk for ${lexical.work_id}: ${chunkPath}`);
          continue;
        }
        const chunkJson = readJson(chunkPath);
        if (!chunkJson) continue;
        for (const field of ['schema_version', 'chunk_id', 'token_index', 'lexicon', 'source_rows']) {
          if (!own(chunkJson, field)) {
            errors.push(`Lexical chunk missing ${field} for ${lexical.work_id}: ${chunkPath}`);
          }
        }
      }
    }
  }

  for (const [unitName, unitOccurrence] of Object.entries(lexical.units || {})) {
    if (!workUnitIds || !workUnitIds.has(String(unitOccurrence.unit_id))) {
      errors.push(`Lexical occurrence references missing source unit: ${unitOccurrence.unit_id}`);
      continue;
    }
    for (const field of ['unit_id', 'anchor_id', 'source_ref', 'paragraphs']) {
      if (!present(unitOccurrence[field])) {
        errors.push(`Lexical unit occurrence missing ${field}: ${unitName}`);
      }
    }
    for (const paragraph of asArray(unitOccurrence.paragraphs)) {
      if (own(paragraph, 'tokens')) {
        errors.push(`Lexical paragraph still contains verbose token objects: ${unitOccurrence.unit_id}`);
      }
      if (!own(paragraph, 'token_index_ids')) {
        errors.push(`Lexical paragraph missing token_index_ids: ${unitOccurrence.unit_id}`);
        continue;
      }
      for (const tokenIndexId of asArray(paragraph.token_index_ids)) {
        if (!tokenIndexIds.has(String(tokenIndexId))) {
          errors.push(`Lexical paragraph references missing token_index_id ${tokenIndexId}: ${unitOccurrence.unit_id}`);
        }
      }
    }
  }

  const lexicalPagePath = rel(lexical.work_slug, 'index.html');
  if (exists(lexicalPagePath)) {
    const lexicalPage = readText(lexicalPagePath);
    for (const requiredText of ['data-lexical-occurrences', 'data-lexical-config', 'data-lexical-slot', 'data-lexical-hud', 'data-hud-word', 'Breakdown', 'Potential options', 'Related options', 'Sources / licenses', 'No lexical entry yet.']) {
      if (!lexicalPage.includes(requiredText)) {
        errors.push(`Lexical target page missing required text '${requiredText}' for ${lexical.work_id}`);
      }
    }
    if (!lexicalPage.includes('Show more') && !lexicalPage.includes('Show potential options')) {
      errors.push(`Lexical target page missing option expansion text for ${lexical.work_id}`);
    }
    if (!lexicalPage.includes('allowLowConfidenceFallback') && !lexicalPage.includes('Show related options')) {
      errors.push(`Lexical target page missing secondary expansion text for ${lexical.work_id}`);
    }
    if (!lexicalPage.includes('Strict Hebrew') && !lexicalPage.includes('Strict renderings')) {
      errors.push(`Lexical target page missing strict-rendering label for ${lexical.work_id}`);
    }
    if (!lexicalPage.includes('Potential options')) {
      errors.push(`Lexical target page missing potential-options label for ${lexical.work_id}`);
    }
    for (const embeddedPayloadMarker of ['data-lexical-token-index>', 'data-lexical-lexicon>']) {
      if (lexicalPage.includes(embeddedPayloadMarker)) {
        errors.push(`Lexical target page still embeds full lexical payload marker '${embeddedPayloadMarker}' for ${lexical.work_id}`);
      }
    }
    if (lexical.work_id === 'orot' && !lexicalPage.includes('<span class="hud-badge">Lexical layer active</span>')) {
      errors.push('Orot page missing visible HUD coverage indicators');
    }
    if (lexicalPage.includes('data-lexical-json')) {
      errors.push(`Lexical target page contains stale per-occurrence lexical JSON for ${lexical.work_id}`);
    }
    for (const badText of ['Genesis 1:1 Lexical HUD', 'lexical/genesis-1-1', 'machine_draft_translation', 'TranslatorÃ¢']) {
      if (lexicalPage.includes(badText)) {
        errors.push(`Lexical proof target page contains disallowed text '${badText}'`);
      }
    }
  } else {
    errors.push(`Missing lexical proof target page: ${lexicalPagePath}`);
  }
}

for (const workId of sourceByWorkId.keys()) {
  if (!lexicalWorkIds.has(String(workId))) {
    errors.push(`Missing lexical occurrence file for imported work: ${workId}`);
  }
}

for (const workId of sourceByWorkId.keys()) {
  testExportFiles(slugByWorkId.get(workId), unitCountByWorkId.get(workId), workId);
}

testExportFiles('.', unitIds.size, 'full-site');

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(`Validation passed. ${unitIds.size} source units checked.`);
