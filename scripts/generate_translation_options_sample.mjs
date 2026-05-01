import fs from 'node:fs';
import path from 'node:path';

const workId = 'orot';
const selectedRefs = [
  'Orot, Lights from Darkness, Land of Israel 1:1',
  'Orot, Lights from Darkness, Lights of Rebirth 70:5',
];

const sourcePath = path.join('data', 'sources', `${workId}.json`);
const occurrencesPath = path.join('data', 'lexical', 'occurrences', `${workId}.json`);
const manifestPath = path.join('data', 'lexical', `${workId}.manifest.json`);
const chunkDir = path.join('data', 'lexical', `${workId}-chunks`);
const sourceLayerDir = path.join('data', 'lexical', 'source-layers');
const outputPath = path.join('data', 'translation-options', `${workId}-sample.json`);
const reportPath = path.join('reports', 'translation-options-sample-report.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, 'utf8');
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function compactSourceRow(row, fallback = {}) {
  if (!row && !fallback.source_family && !fallback.license) return null;
  return {
    source_name: row?.source_name || fallback.source_name || fallback.source_family || 'Unknown lexical source',
    source_family: row?.source_family || fallback.source_family || 'unknown',
    source_id: row?.source_id || fallback.source_id || '',
    source_url: row?.source_url || fallback.source_url || '',
    license: row?.license || fallback.license || '',
    license_url: row?.license_url || fallback.license_url || '',
    fields_used: row?.fields_used || fallback.fields_used || [],
    notes: row?.notes || fallback.notes || '',
  };
}

function sourceBucket(row) {
  const family = row?.source_family || '';
  const license = row?.license || '';
  if (family === 'wikidata') return 'Wikidata CC0';
  if (family === 'openscriptures') return 'OpenScriptures CC BY 4.0';
  if (family === 'kaikki') return 'Kaikki CC BY-SA/GFDL';
  if (family === 'workspace' || family === 'curated' || /project|workspace/i.test(row?.source_name || '')) {
    if (/abbreviation/i.test(row?.source_name || row?.source_id || '')) return 'project abbreviations';
    if (/grammar|fixed-expression|function/i.test(row?.source_name || row?.source_id || '')) return 'project grammar/function rules';
    if (/technical/i.test(row?.source_name || row?.source_id || '')) return 'project technical terms';
    if (/CC0/i.test(license)) return 'project grammar/abbreviation/technical CC0';
    return 'project grammar/abbreviation/technical local rule';
  }
  if (family === 'curated') return 'project/curated lexical row';
  return family || 'unknown';
}

function rowKey(row) {
  if (!row) return '';
  return [row.source_family, row.source_id, row.license].filter(Boolean).join('|');
}

function renderingObjects(renderings, role, sources, extra = {}) {
  const sourceRows = unique((sources || []).map((row) => rowKey(row))).map((key) => {
    const row = sources.find((candidate) => rowKey(candidate) === key);
    return compactSourceRow(row);
  }).filter(Boolean);
  const originLayers = unique(sourceRows.map(sourceBucket));
  return unique(renderings).map((text) => ({
    text,
    role,
    origin_layers: originLayers,
    source_rows: sourceRows,
    ...extra,
  }));
}

function sourceRowIdsForPossibleEntry(possibleEntry) {
  if (Array.isArray(possibleEntry?.source_row_keys)) return possibleEntry.source_row_keys;
  return [];
}

function fallbackSourceForPossibleEntry(possibleEntry) {
  if (!possibleEntry) return null;
  return compactSourceRow(null, {
    source_name: possibleEntry.source_name,
    source_family: possibleEntry.source_family,
    source_id: possibleEntry.source_id,
    license: possibleEntry.source_family === 'wikidata'
      ? 'CC0'
      : possibleEntry.source_family === 'openscriptures'
        ? 'CC BY 4.0'
        : possibleEntry.source_family === 'kaikki'
          ? 'CC BY-SA 4.0 / GFDL'
          : '',
    source_url: possibleEntry.source_family === 'wikidata' && possibleEntry.source_id
      ? `https://www.wikidata.org/wiki/Lexeme:${possibleEntry.source_id}`
      : '',
  });
}

function sourceLayerRowsForPossibleEntry(entry, possibleEntry) {
  const layerEntry = sourceLayerEntries.get(entry?.entry_id || '');
  const rows = (layerEntry?.entry?.source_rows || []).map(compactSourceRow).filter(Boolean);
  if (!possibleEntry || !rows.length) return [];
  if (possibleEntry.source_family === 'curated') return rows;
  return rows.filter((row) => {
    if (row.source_family !== possibleEntry.source_family) return false;
    if (!possibleEntry.source_id) return true;
    return String(row.source_id || '').includes(possibleEntry.source_id);
  });
}

function lexicalStatus(form, entry) {
  if (!form || form.status !== 'matched' || !entry) return 'unresolved';
  const hasLikely = entry.disambiguation_status === 'likely'
    || (entry.possible_entries || []).some((candidate) => candidate.context_role === 'likely_contextual')
    || /^resolved_/u.test(form.surface_context_status || '');
  if (hasLikely) return 'resolved';
  const hasOptions = (entry.strict_renderings || []).length > 0
    || (form.surface_renderings || []).length > 0
    || (entry.possible_entries || []).some((candidate) => (candidate.strict_renderings || []).length > 0);
  return hasOptions ? 'possible-only' : 'unresolved';
}

function buildLayerEntryIndex() {
  const index = new Map();
  if (!fs.existsSync(sourceLayerDir)) return index;
  for (const fileName of fs.readdirSync(sourceLayerDir)) {
    if (!fileName.endsWith('.json')) continue;
    const filePath = path.join(sourceLayerDir, fileName);
    const layer = readJson(filePath);
    for (const entry of layer.entries || []) {
      if (!entry.entry_id) continue;
      index.set(entry.entry_id, {
        layer_id: layer.layer_id || '',
        source_family: layer.source_family || '',
        layer_license: layer.license || '',
        entry,
      });
    }
  }
  return index;
}

const source = readJson(sourcePath);
const occurrences = readJson(occurrencesPath);
const manifest = readJson(manifestPath);
const sourceLayerEntries = buildLayerEntryIndex();
const chunks = new Map();

function getChunk(tokenIndexId) {
  const chunkId = manifest.token_chunks?.[tokenIndexId];
  if (!chunkId) return null;
  if (!chunks.has(chunkId)) {
    const chunk = readJson(path.join(chunkDir, `${chunkId}.json`));
    chunk.__formByTokenId = new Map(
      Object.values(chunk.token_index?.forms || {}).map((form) => [form.token_index_id, form]),
    );
    chunk.__entryById = new Map(
      Object.values(chunk.lexicon?.entries || {}).map((entry) => [entry.entry_id, entry]),
    );
    chunks.set(chunkId, chunk);
  }
  return chunks.get(chunkId);
}

function getSourceRows(chunk, entry, possibleEntry = null) {
  if (possibleEntry) {
    const candidateIds = sourceRowIdsForPossibleEntry(possibleEntry);
    const candidateRows = candidateIds.map((id) => chunk?.source_rows?.[id]).filter(Boolean);
    if (candidateRows.length) return candidateRows;

    const layerRows = sourceLayerRowsForPossibleEntry(entry, possibleEntry);
    if (layerRows.length) return layerRows;

    const fallback = fallbackSourceForPossibleEntry(possibleEntry);
    return fallback ? [fallback] : [];
  }

  const ids = entry?.source_row_ids || [];
  const rows = ids.map((id) => chunk?.source_rows?.[id]).filter(Boolean);
  if (rows.length) return rows;

  const layerEntry = sourceLayerEntries.get(entry?.entry_id || '');
  if (layerEntry?.entry?.source_rows?.length) return layerEntry.entry.source_rows.map(compactSourceRow).filter(Boolean);

  if (layerEntry) {
    return [compactSourceRow(null, {
      source_name: layerEntry.layer_id,
      source_family: layerEntry.source_family,
      license: layerEntry.layer_license,
    })].filter(Boolean);
  }

  return [];
}

function buildToken(tokenIndexId, position) {
  const chunk = getChunk(tokenIndexId);
  const form = chunk?.__formByTokenId.get(tokenIndexId);
  const entry = form?.lexicon_entry_id ? chunk?.__entryById.get(form.lexicon_entry_id) : null;
  const status = lexicalStatus(form, entry);
  const primarySources = getSourceRows(chunk, entry);
  const options = [];

  if (form?.surface_renderings?.length) {
    options.push(...renderingObjects(form.surface_renderings, 'full-form surface rendering', primarySources, {
      source_entry_id: entry?.entry_id || '',
    }));
  }

  if (entry?.strict_renderings?.length) {
    options.push(...renderingObjects(entry.strict_renderings, entry.disambiguation_status === 'likely' ? 'likely contextual entry' : 'entry strict rendering', primarySources, {
      source_entry_id: entry.entry_id,
    }));
  }

  const possibleEntries = (entry?.possible_entries || []).map((candidate) => {
    const candidateSources = getSourceRows(chunk, entry, candidate);
    const candidateOptions = renderingObjects(candidate.strict_renderings || [], candidate.context_role || 'possible_entry', candidateSources, {
      source_entry_id: entry?.entry_id || '',
      lexical_entry_key: candidate.entry_key || '',
      lemma: candidate.lemma || '',
      relation_label: candidate.relation_label || '',
    });
    options.push(...candidateOptions);
    return {
      entry_key: candidate.entry_key || '',
      lemma: candidate.lemma || '',
      source_name: candidate.source_name || '',
      source_family: candidate.source_family || '',
      source_id: candidate.source_id || '',
      context_role: candidate.context_role || '',
      relation_label: candidate.relation_label || '',
      strict_rendering_options: candidateOptions,
    };
  });

  const breakdownSources = primarySources;
  const breakdown = (form?.breakdown || []).map((part) => ({
    hebrew: part.hebrew || '',
    strict_rendering_options: renderingObjects(part.strict_renderings || [], 'reliable breakdown', breakdownSources, {
      source_entry_id: entry?.entry_id || '',
    }),
  }));

  return {
    position,
    token_index_id: tokenIndexId,
    clicked_surface_form: form?.surface_word || '',
    normalized_form: form?.normalized_word || '',
    lexical_status: status,
    surface_context_status: form?.surface_context_status || '',
    context_note: form?.surface_context_note || entry?.context_note || '',
    strict_rendering_options: uniqueOptionObjects(options),
    breakdown,
    possible_lexical_entries: possibleEntries,
  };
}

function uniqueOptionObjects(options) {
  const seen = new Set();
  return options.filter((option) => {
    const key = JSON.stringify({
      text: option.text,
      role: option.role,
      source: option.source_rows?.map(rowKey),
      lexical_entry_key: option.lexical_entry_key,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function choosePathOption(token) {
  if (token.lexical_status === 'unresolved') {
    return {
      surface: token.clicked_surface_form,
      chosen_rendering: `[${token.clicked_surface_form || 'unresolved'}]`,
      status: 'unresolved',
      uncertain: true,
      source_rows: [],
    };
  }

  const preferred = token.strict_rendering_options.find((option) => /surface|likely|common|fixed|function|abbreviation/u.test(option.role))
    || token.strict_rendering_options[0];

  if (!preferred) {
    return {
      surface: token.clicked_surface_form,
      chosen_rendering: `[${token.clicked_surface_form || 'unresolved'}]`,
      status: token.lexical_status,
      uncertain: true,
      source_rows: [],
    };
  }

  return {
    surface: token.clicked_surface_form,
    chosen_rendering: token.lexical_status === 'possible-only' ? `?${preferred.text}` : preferred.text,
    status: token.lexical_status,
    uncertain: token.lexical_status !== 'resolved',
    source_rows: preferred.source_rows,
  };
}

function buildUnit(unit) {
  const occurrenceUnit = occurrences.units?.[unit.unit_id];
  if (!occurrenceUnit) throw new Error(`No lexical occurrences found for ${unit.source_ref}`);
  const tokenIds = occurrenceUnit.paragraphs.flatMap((paragraph) => paragraph.token_index_ids || []);
  const tokens = tokenIds.map((tokenIndexId, index) => buildToken(tokenIndexId, index + 1));
  const pathTokens = tokens.map(choosePathOption);
  return {
    work: {
      work_id: unit.work_id,
      work_title: unit.work_title,
    },
    ref: unit.source_ref,
    source_ref: unit.source_ref,
    unit_id: unit.unit_id,
    anchor_id: unit.anchor_id,
    hebrew_unit_text: (unit.hebrew || []).join('\n'),
    token_count: tokens.length,
    tokens,
    rendering_path_draft: {
      label: 'Machine-assembled rendering path from lexical options; not a translation.',
      warning: 'This path preserves token order and chooses one available lexical rendering when present. It is not polished English and must not be used as a public translation.',
      text: pathTokens.map((token) => token.chosen_rendering).join(' '),
      tokens: pathTokens,
    },
  };
}

const selectedUnits = selectedRefs.map((ref) => {
  const unit = source.units.find((candidate) => candidate.source_ref === ref);
  if (!unit) throw new Error(`Selected ref not found: ${ref}`);
  return buildUnit(unit);
});

const allTokens = selectedUnits.flatMap((unit) => unit.tokens);
const licenseSet = new Set();
for (const token of allTokens) {
  for (const option of token.strict_rendering_options) {
    for (const row of option.source_rows || []) {
      if (row.license) licenseSet.add(`${row.source_family || row.source_name}: ${row.license}`);
    }
  }
}

const summary = {
  units_processed: selectedUnits.length,
  token_count: allTokens.length,
  resolved: allTokens.filter((token) => token.lexical_status === 'resolved').length,
  possible_only: allTokens.filter((token) => token.lexical_status === 'possible-only').length,
  unresolved: allTokens.filter((token) => token.lexical_status === 'unresolved').length,
  licenses_represented: Array.from(licenseSet).sort(),
};

const exportObject = {
  schema_version: 1,
  export_type: 'translation_options_scaffold',
  generated_at: new Date().toISOString(),
  scope: 'Pilot export for selected Orot units only.',
  constraints: [
    'Not a polished English translation.',
    'No imported copyrighted English translation text.',
    'Rendering options are drawn from existing lexical HUD rows and source/license metadata.',
    'Unresolved tokens are preserved.',
    'The machine-assembled rendering path is non-authoritative and must not be displayed as the public Translation layer.',
  ],
  summary,
  units: selectedUnits,
};

writeJson(outputPath, exportObject);

const unresolvedRows = allTokens
  .filter((token) => token.lexical_status !== 'resolved')
  .map((token) => `| ${token.clicked_surface_form || ''} | ${token.normalized_form || ''} | ${token.lexical_status} | ${token.strict_rendering_options.slice(0, 3).map((option) => option.text).join('; ') || 'N/A'} |`);

const report = [
  '# Translation Options Sample Report',
  '',
  'This is a scaffold for future human translation choices. It is not a translation layer and is not rendered on the public work pages.',
  '',
  '## Summary',
  '',
  `- Units processed: ${summary.units_processed}`,
  `- Tokens processed: ${summary.token_count}`,
  `- Resolved tokens: ${summary.resolved}`,
  `- Possible-only tokens: ${summary.possible_only}`,
  `- Unresolved tokens: ${summary.unresolved}`,
  `- Output JSON: \`${outputPath.replace(/\\/g, '/')}\``,
  '',
  '## Licenses Represented',
  '',
  ...summary.licenses_represented.map((license) => `- ${license}`),
  '',
  '## Units',
  '',
  ...selectedUnits.map((unit) => {
    const counts = {
      resolved: unit.tokens.filter((token) => token.lexical_status === 'resolved').length,
      possibleOnly: unit.tokens.filter((token) => token.lexical_status === 'possible-only').length,
      unresolved: unit.tokens.filter((token) => token.lexical_status === 'unresolved').length,
    };
    return `- ${unit.ref}: ${unit.token_count} tokens; ${counts.resolved} resolved, ${counts.possibleOnly} possible-only, ${counts.unresolved} unresolved`;
  }),
  '',
  '## Unresolved / High-Risk Tokens',
  '',
  '| Surface | Normalized | Status | Available Options |',
  '| --- | --- | --- | --- |',
  ...(unresolvedRows.length ? unresolvedRows : ['| None |  |  |  |']),
  '',
].join('\n');

writeText(reportPath, report);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(JSON.stringify(summary, null, 2));
