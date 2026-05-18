import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const exportRoot = 'data/public-lexical';
const existingManifestPath = path.join(root, exportRoot, 'manifest.json');
const generatedAt = process.env.PUBLIC_LEXICAL_GENERATED_AT
  || (fs.existsSync(existingManifestPath) ? JSON.parse(fs.readFileSync(existingManifestPath, 'utf8')).generated_at : '')
  || new Date().toISOString();

const workSpecs = [
  {
    work_id: 'orot',
    label: 'Orot',
    token_index: 'data/lexical/token-indexes/orot.json',
    manifest: 'data/lexical/orot.manifest.json',
  },
  {
    work_id: 'aggadat-bereshit',
    label: 'Aggadat Bereshit',
    token_index: 'data/lexical/token-indexes/midrash/aggadat-bereshit.json',
    manifest: 'data/lexical/aggadat-bereshit.manifest.json',
  },
];

const licenseFiles = {
  projectCc0: 'data/public-lexical/by-license/project-cc0.jsonl',
  wikidataCc0: 'data/public-lexical/by-license/wikidata-cc0.jsonl',
  openscripturesCcBy4: 'data/public-lexical/by-license/openscriptures-cc-by-4.jsonl',
  kaikkiWiktionaryCcBySaGfdl: 'data/public-lexical/by-license/kaikki-wiktionary-cc-by-sa-gfdl.jsonl',
};
const safeAiMinConfidence = 60;
const unsafeAiStatuses = new Set(['Related', 'Caution', 'Unresolved']);
const strictAiStatuses = new Set(['Strict Hebrew', 'Strict Aramaic']);

function abs(rel) {
  return path.join(root, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeText(rel, text) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      fs.writeFileSync(temp, text, 'utf8');
      fs.renameSync(temp, file);
      return;
    } catch (error) {
      lastError = error;
      try {
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      } catch {
        // Ignore cleanup failures and retry the write.
      }
    }
  }
  throw lastError;
}

function writeJson(rel, value) {
  writeText(rel, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(rel, rows) {
  const text = rows.map((row) => JSON.stringify(row)).join('\n');
  writeText(rel, text ? `${text}\n` : '');
}

function flattenCsvValue(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map((item) => flattenCsvValue(item)).filter(Boolean).join(' | ');
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.renderings)) {
      return `${value.hebrew || ''}${value.hebrew ? ' = ' : ''}${value.renderings.join(' / ')}`;
    }
    if (Array.isArray(value.strict_renderings)) {
      return `${value.hebrew || ''}${value.hebrew ? ' = ' : ''}${value.strict_renderings.join(' / ')}`;
    }
    return JSON.stringify(value);
  }
  return `${value}`;
}

function csvEscape(value) {
  const text = flattenCsvValue(value).replace(/\r?\n/g, ' ').trim();
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function writeCsv(rel, rows, columns) {
  const lines = [
    columns.map((column) => csvEscape(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(column.value(row))).join(',')),
  ];
  writeText(rel, `${lines.join('\n')}\n`);
}

function unique(values) {
  return [...new Set((values || []).filter((value) => value !== null && value !== undefined && `${value}`.trim()))];
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 16)}`;
}

function canonicalRenderings(values) {
  return unique(values).map((value) => `${value}`.trim()).filter(Boolean);
}

function normalizeBreakdown(breakdown) {
  return (breakdown || [])
    .map((part) => ({
      hebrew: part.hebrew || '',
      renderings: canonicalRenderings(part.strict_renderings || part.renderings || []),
    }))
    .filter((part) => part.hebrew || part.renderings.length);
}

function licenseAttribution(license, sourceName) {
  const value = `${license || ''}`.toLowerCase();
  if (value.includes('cc by-sa') || value.includes('gfdl')) {
    return 'Attribution and share-alike/copyleft requirements may apply; keep this layer separate from CC0 output.';
  }
  if (value.includes('cc by')) {
    return 'Attribution required; retain source name, source id, source URL, and license.';
  }
  if (value.includes('cc0')) {
    return 'No attribution required by license; source retained for provenance.';
  }
  if (sourceName) {
    return 'Retain source metadata; this row is not part of a CC0-only export lane.';
  }
  return '';
}

function sourceBaseKey(row) {
  return `${row.source_family || ''}|${row.source_id || ''}`;
}

function getSourceRows(keys, sourceRowsByKey) {
  const rows = [];
  const seen = new Set();
  for (const rawKey of keys || []) {
    if (!rawKey) continue;
    const key = `${rawKey}`;
    const direct = sourceRowsByKey.get(key);
    if (direct && !seen.has(direct.__source_key)) {
      rows.push(direct);
      seen.add(direct.__source_key);
      continue;
    }
    for (const [candidateKey, row] of sourceRowsByKey) {
      const base = sourceBaseKey(row);
      if (
        candidateKey === key ||
        candidateKey.startsWith(`${key}|`) ||
        key.startsWith(`${candidateKey}|`) ||
        base === key ||
        key.startsWith(`${base}|`)
      ) {
        if (!seen.has(row.__source_key)) {
          rows.push(row);
          seen.add(row.__source_key);
        }
      }
    }
  }
  return rows;
}

function isAramaicCandidate(candidate, sourceRows) {
  const haystack = [
    candidate.source_family,
    candidate.source_name,
    candidate.source_id,
    candidate.relation_label,
    candidate.context_note,
    ...sourceRows.map((row) => `${row.source_name || ''} ${row.source_id || ''} ${row.notes || ''}`),
  ].join(' ').toLowerCase();
  return haystack.includes('aramaic') || haystack.includes('zohar') || haystack.includes('targum');
}

function claimStatusForCandidate(candidate, sourceRows) {
  const role = `${candidate.context_role || ''}`;
  const relation = `${candidate.relation_label || ''}`.toLowerCase();
  if (role === 'likely_contextual') {
    return isAramaicCandidate(candidate, sourceRows) ? 'Strict Aramaic' : 'Strict Hebrew';
  }
  if (role === 'related' || relation.includes('related') || relation.includes('cognate') || relation.includes('root-field')) {
    return 'Related';
  }
  if (relation.includes('caution') || relation.includes('noisy') || relation.includes('homograph')) {
    return 'Caution';
  }
  return 'Potential';
}

function sourceRowsForCandidate(entry, candidate, sourceRowsByKey) {
  const keys = [
    ...(candidate.source_row_keys || []),
    ...(candidate.source_row_ids || []),
    `${candidate.source_family || ''}|${candidate.source_id || ''}`,
  ].filter(Boolean);
  let rows = getSourceRows(keys, sourceRowsByKey);
  if (!rows.length && entry.source_row_ids) {
    rows = getSourceRows(entry.source_row_ids, sourceRowsByKey).filter((row) => {
      return row.source_family === candidate.source_family && row.source_id === candidate.source_id;
    });
  }
  return rows;
}

function sourceRowsForTokenSurface(entry, token, sourceRowsByKey) {
  const tokenRenderings = new Set(canonicalRenderings(token.surface_renderings || []));
  const likely = (entry.possible_entries || []).filter((candidate) => {
    const renderings = canonicalRenderings(candidate.strict_renderings || []);
    return candidate.context_role === 'likely_contextual' && renderings.some((value) => tokenRenderings.has(value));
  });
  const rows = [];
  const seen = new Set();
  for (const candidate of likely) {
    for (const row of sourceRowsForCandidate(entry, candidate, sourceRowsByKey)) {
      if (!seen.has(row.__source_key)) {
        rows.push(row);
        seen.add(row.__source_key);
      }
    }
  }
  if (rows.length) return rows;
  return getSourceRows(entry.source_row_ids || [], sourceRowsByKey);
}

function claimIdForClaim(row) {
  return stableId('claim', [
    row.status,
    row.hebrew_lemma_or_form,
    (row.strict_renderings || []).join('|'),
    row.source_name,
    row.source_id,
    row.license,
  ].join('\u001f'));
}

function sourceHasUsableLicense(row) {
  return Boolean(row && row.source_name && row.source_id && row.license);
}

function classifyLicenseFile(row) {
  const family = `${row.source_family || ''}`.toLowerCase();
  const sourceName = `${row.source_name || ''}`.toLowerCase();
  const license = `${row.license || ''}`.toLowerCase();
  if (family === 'wikidata' || sourceName.includes('wikidata')) return 'wikidataCc0';
  if (family === 'openscriptures' || sourceName.includes('openscriptures')) return 'openscripturesCcBy4';
  if (family === 'kaikki' || sourceName.includes('kaikki') || sourceName.includes('wiktionary')) return 'kaikkiWiktionaryCcBySaGfdl';
  if (license.includes('project-authored') && license.includes('cc0')) return 'projectCc0';
  return '';
}

function confidenceForClaim({ status, token, candidate, sourceRow, surfaceClaim = false }) {
  if (status === 'Unresolved') return 0;
  const matchMethod = `${token?.match_method || ''}`;
  const sourceFamily = `${sourceRow?.source_family || ''}`.toLowerCase();
  const sourceName = `${sourceRow?.source_name || ''}`.toLowerCase();
  const relation = `${candidate?.relation_label || ''}`.toLowerCase();
  const role = `${candidate?.context_role || ''}`;

  let score = 60;
  if (status === 'Strict Hebrew' || status === 'Strict Aramaic') score = 88;
  if (status === 'Potential') score = 62;
  if (status === 'Related') score = 48;
  if (status === 'Caution') score = 35;

  if (matchMethod.startsWith('project_') || sourceFamily === 'workspace') score += 7;
  if (matchMethod === 'fixed_expression') score += 8;
  if (matchMethod === 'project_function_word' || matchMethod === 'project_abbreviation' || matchMethod === 'project_midrash_formula' || matchMethod === 'project_aramaic_grammar') score += 5;
  if (matchMethod === 'project_technical') score += 4;
  if (matchMethod.includes('prefix') || matchMethod.includes('affix')) score -= 4;
  if (sourceFamily === 'openscriptures' || sourceName.includes('openscriptures')) score += 3;
  if (sourceFamily === 'wikidata' || sourceName.includes('wikidata')) score += 1;
  if (sourceFamily === 'kaikki' || sourceName.includes('kaikki') || sourceName.includes('wiktionary')) score -= 10;
  if (role === 'likely_contextual') score += 4;
  if (surfaceClaim) score += 3;
  if (relation.includes('homograph') || relation.includes('noisy') || relation.includes('caution')) score -= 15;

  if (status === 'Potential') score = Math.min(score, 74);
  if (status === 'Related') score = Math.min(score, 59);
  if (status === 'Caution') score = Math.min(score, 49);
  return Math.max(0, Math.min(99, Math.round(score)));
}

function confidenceNote(row) {
  if (row.status === 'Unresolved') return '0%: no lexical entry yet.';
  return `${row.confidence}% deterministic export assurance from HUD status, match method, source layer, context role, and homograph/noise guards.`;
}

function isSafeAiOption(row) {
  return row.confidence >= safeAiMinConfidence && strictAiStatuses.has(row.status);
}

function makeClaim({ work, token, status, hebrewForm, renderings, breakdown, candidate, sourceRow }) {
  const row = {
    schema_version: 1,
    generated_at: generatedAt,
    work_id: work.work_id,
    work_title: work.work_title || work.label,
    ref_examples: token.example_refs || token.examples || token.refs || [],
    occurrence_count: token.occurrence_count || 0,
    clicked_surface_form: token.surface_word || '',
    normalized_form: token.normalized_word || '',
    hebrew_lemma_or_form: hebrewForm || token.surface_word || '',
    transliteration: candidate?.transliteration || token.surface_transliteration || '',
    status,
    confidence: 0,
    confidence_note: '',
    strict_renderings: canonicalRenderings(renderings),
    breakdown: normalizeBreakdown(breakdown),
    source_name: sourceRow.source_name || '',
    source_id: sourceRow.source_id || '',
    source_url: sourceRow.source_url || '',
    license: sourceRow.license || '',
    license_url: sourceRow.license_url || '',
    attribution_requirements: licenseAttribution(sourceRow.license, sourceRow.source_name),
    notes: unique([candidate?.relation_label, candidate?.context_note, sourceRow.notes]).join(' '),
    not_a_translation: true,
  };
  row.confidence = confidenceForClaim({ status, token, candidate, sourceRow, surfaceClaim: Boolean(breakdown?.length) });
  row.confidence_note = confidenceNote(row);
  return row;
}

function makeCompactClaim({ status, normalizedForms, hebrewForm, renderings, candidate, sourceRow }) {
  const row = {
    schema_version: 1,
    generated_at: generatedAt,
    claim_id: '',
    normalized_forms: unique(normalizedForms),
    hebrew_lemma_or_form: hebrewForm || '',
    transliteration: candidate?.transliteration || '',
    status,
    confidence: 0,
    confidence_note: '',
    strict_renderings: canonicalRenderings(renderings),
    source_name: sourceRow.source_name || '',
    source_id: sourceRow.source_id || '',
    source_url: sourceRow.source_url || '',
    license: sourceRow.license || '',
    license_url: sourceRow.license_url || '',
    attribution_requirements: licenseAttribution(sourceRow.license, sourceRow.source_name),
    notes: unique([candidate?.relation_label, candidate?.context_note, sourceRow.notes]).join(' '),
    not_a_translation: true,
  };
  row.confidence = confidenceForClaim({ status, token: null, candidate, sourceRow });
  row.confidence_note = confidenceNote(row);
  row.claim_id = claimIdForClaim(row);
  return row;
}

function loadWorkExportContext(spec) {
  const tokenIndex = readJson(spec.token_index);
  const manifest = readJson(spec.manifest);
  const work = {
    work_id: tokenIndex.work_id || spec.work_id,
    work_title: tokenIndex.work_title || spec.label,
    label: spec.label,
  };

  const entryById = new Map();
  const sourceRowsByKey = new Map();

  for (const chunkInfo of manifest.chunks || []) {
    const chunkPath = path.join('data/lexical', chunkInfo.url);
    const chunk = readJson(chunkPath);
    for (const [key, value] of Object.entries(chunk.source_rows || {})) {
      sourceRowsByKey.set(key, { ...value, __source_key: key });
    }
    for (const entry of chunk.lexicon?.entries || []) {
      entryById.set(entry.entry_id, entry);
    }
  }

  return { work, tokenIndex, manifest, entryById, sourceRowsByKey };
}

function makeTokenStatusRows({ spec, work, tokenIndex, manifest, rows }) {
  const rowsByTokenKey = new Map();
  for (const row of rows) {
    const key = `${row.clicked_surface_form || ''}\u001f${row.normalized_form || ''}`;
    if (!rowsByTokenKey.has(key)) rowsByTokenKey.set(key, []);
    rowsByTokenKey.get(key).push(row);
  }

  return (tokenIndex.forms || []).map((token) => {
    const key = `${token.surface_word || ''}\u001f${token.normalized_word || ''}`;
    const claimRows = rowsByTokenKey.get(key) || [];
    const strictRows = claimRows.filter((row) => row.status === 'Strict Hebrew' || row.status === 'Strict Aramaic');
    const bestRows = strictRows.length ? strictRows : claimRows;
    const safeRows = claimRows.filter(isSafeAiOption);
    const safeBestRows = safeRows.length
      ? (safeRows.filter((row) => row.status === 'Strict Hebrew' || row.status === 'Strict Aramaic').length
        ? safeRows.filter((row) => row.status === 'Strict Hebrew' || row.status === 'Strict Aramaic')
        : safeRows)
      : [];
    const exportedRenderings = unique(bestRows.flatMap((row) => row.strict_renderings || []));
    const safeRenderings = unique(safeBestRows.flatMap((row) => row.strict_renderings || []));
    const bestConfidence = claimRows.length ? Math.max(...claimRows.map((row) => row.confidence || 0)) : 0;
    const safeMaxConfidence = safeRows.length ? Math.max(...safeRows.map((row) => row.confidence || 0)) : 0;
    const exportStatus = claimRows.length
      ? (strictRows.length ? 'source_backed_strict_options' : 'source_backed_non_strict_options')
      : (token.status === 'matched' ? 'matched_no_public_claim_exported' : 'unresolved');
    const safeExportStatus = safeRows.length
      ? `safe_options_min${safeAiMinConfidence}`
      : (claimRows.length
        ? `no_safe_option_min${safeAiMinConfidence}`
        : (token.status === 'matched' ? 'matched_no_public_claim_exported' : 'unresolved'));
    const note = claimRows.length
      ? (safeRows.length
        ? `Use safe_export_* columns for >=${safeAiMinConfidence}% AI workflow options; this is not a translation.`
        : `Matched rows exist, but none meet the >=${safeAiMinConfidence}% safe AI export threshold. Do not infer a definition.`)
      : (token.status === 'matched'
        ? 'Token is matched internally, but no public source-backed rendering row was exported.'
        : 'No lexical entry yet.');

    return {
      schema_version: 1,
      generated_at: generatedAt,
      work_id: work.work_id || spec.work_id,
      work_title: work.work_title || work.label || spec.label,
      token_index_id: token.token_index_id || '',
      chunk_id: manifest.token_chunks?.[token.token_index_id] || '',
      clicked_surface_form: token.surface_word || '',
      normalized_form: token.normalized_word || '',
      lexical_status: token.status || '',
      match_method: token.match_method || '',
      occurrence_count: token.occurrence_count || 0,
      lexicon_entry_id: token.lexicon_entry_id || '',
      surface_renderings: canonicalRenderings(token.surface_renderings || []),
      exported_statuses: unique(claimRows.map((row) => row.status)),
      exported_rendering_options: exportedRenderings,
      exported_source_names: unique(bestRows.map((row) => row.source_name)),
      exported_source_ids: unique(bestRows.map((row) => row.source_id)),
      exported_licenses: unique(bestRows.map((row) => row.license)),
      exported_claim_count: claimRows.length,
      best_confidence: bestConfidence,
      safe_min_confidence: safeAiMinConfidence,
      safe_max_confidence: safeMaxConfidence,
      safe_export_status: safeExportStatus,
      safe_export_statuses: unique(safeRows.map((row) => row.status)),
      safe_export_rendering_options: safeRenderings,
      safe_source_names: unique(safeBestRows.map((row) => row.source_name)),
      safe_source_ids: unique(safeBestRows.map((row) => row.source_id)),
      safe_licenses: unique(safeBestRows.map((row) => row.license)),
      export_status: exportStatus,
      notes: note,
      not_a_translation: true,
    };
  });
}

function exportWork(spec) {
  if (!fs.existsSync(abs(spec.token_index)) || !fs.existsSync(abs(spec.manifest))) {
    return {
      spec,
      rows: [],
      skipped: {
        missing_work_files: 1,
        unmatched: 0,
        no_lexicon_entry: 0,
        no_renderings: 0,
        missing_source_license: 0,
      },
    };
  }

  const { work, tokenIndex, manifest, entryById, sourceRowsByKey } = loadWorkExportContext(spec);
  const rows = [];
  const skipped = {
    missing_work_files: 0,
    unmatched: 0,
    no_lexicon_entry: 0,
    no_renderings: 0,
    missing_source_license: 0,
  };
  const seen = new Set();

  function addClaim(claim) {
    if (!claim.strict_renderings.length) {
      skipped.no_renderings += 1;
      return;
    }
    if (!claim.source_name || !claim.source_id || !claim.license) {
      skipped.missing_source_license += 1;
      return;
    }
    const key = [
      claim.work_id,
      claim.clicked_surface_form,
      claim.normalized_form,
      claim.hebrew_lemma_or_form,
      claim.status,
      claim.strict_renderings.join('/'),
      claim.source_name,
      claim.source_id,
      claim.license,
    ].join('\u001f');
    if (!seen.has(key)) {
      rows.push(claim);
      seen.add(key);
    }
  }

  for (const token of tokenIndex.forms || []) {
    if (token.status !== 'matched' || !token.lexicon_entry_id) {
      skipped.unmatched += 1;
      continue;
    }
    const entry = entryById.get(token.lexicon_entry_id);
    if (!entry) {
      skipped.no_lexicon_entry += 1;
      continue;
    }

    const surfaceRenderings = canonicalRenderings(token.surface_renderings || []);
    if (surfaceRenderings.length) {
      const surfaceSources = sourceRowsForTokenSurface(entry, token, sourceRowsByKey);
      for (const sourceRow of surfaceSources) {
        if (!sourceHasUsableLicense(sourceRow)) {
          skipped.missing_source_license += 1;
          continue;
        }
        addClaim(makeClaim({
          work,
          token,
          status: isAramaicCandidate({}, [sourceRow]) ? 'Strict Aramaic' : 'Strict Hebrew',
          hebrewForm: entry.hebrew_word || token.normalized_word,
          renderings: surfaceRenderings,
          breakdown: token.breakdown || [],
          candidate: null,
          sourceRow,
        }));
      }
    }

    let emittedCandidate = false;
    for (const candidate of entry.possible_entries || []) {
      const renderings = canonicalRenderings(candidate.strict_renderings || []);
      if (!renderings.length) {
        skipped.no_renderings += 1;
        continue;
      }
      const sourceRows = sourceRowsForCandidate(entry, candidate, sourceRowsByKey);
      if (!sourceRows.length) {
        skipped.missing_source_license += 1;
        continue;
      }
      for (const sourceRow of sourceRows) {
        if (!sourceHasUsableLicense(sourceRow)) {
          skipped.missing_source_license += 1;
          continue;
        }
        addClaim(makeClaim({
          work,
          token,
          status: claimStatusForCandidate(candidate, sourceRows),
          hebrewForm: candidate.lemma || candidate.match_key || entry.hebrew_word,
          renderings,
          breakdown: [],
          candidate,
          sourceRow,
        }));
        emittedCandidate = true;
      }
    }

    if (!surfaceRenderings.length && !emittedCandidate) {
      skipped.no_renderings += 1;
    }
  }

  const tokenStatusRows = makeTokenStatusRows({ spec, work, tokenIndex, manifest, rows });
  return { spec, work, rows, tokenStatusRows, skipped };
}

function countBy(rows, getter) {
  const counts = new Map();
  for (const row of rows) {
    const key = getter(row) || 'Unclassified';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.fromEntries([...counts].sort((a, b) => a[0].localeCompare(b[0])));
}

function fileSize(rel) {
  const file = abs(rel);
  if (!fs.existsSync(file)) return 0;
  return fs.statSync(file).size;
}

const workResults = workSpecs.map(exportWork);
const allRows = workResults.flatMap((result) => result.rows);

const claimCsvColumns = [
  { header: 'work_id', value: (row) => row.work_id },
  { header: 'work_title', value: (row) => row.work_title },
  { header: 'clicked_surface_form', value: (row) => row.clicked_surface_form },
  { header: 'normalized_form', value: (row) => row.normalized_form },
  { header: 'hebrew_lemma_or_form', value: (row) => row.hebrew_lemma_or_form },
  { header: 'transliteration', value: (row) => row.transliteration },
  { header: 'status', value: (row) => row.status },
  { header: 'confidence', value: (row) => row.confidence },
  { header: 'confidence_note', value: (row) => row.confidence_note },
  { header: 'strict_renderings', value: (row) => row.strict_renderings },
  { header: 'breakdown', value: (row) => row.breakdown },
  { header: 'source_name', value: (row) => row.source_name },
  { header: 'source_id', value: (row) => row.source_id },
  { header: 'source_url', value: (row) => row.source_url },
  { header: 'license', value: (row) => row.license },
  { header: 'license_url', value: (row) => row.license_url },
  { header: 'attribution_requirements', value: (row) => row.attribution_requirements },
  { header: 'occurrence_count', value: (row) => row.occurrence_count },
  { header: 'ref_examples', value: (row) => row.ref_examples },
  { header: 'notes', value: (row) => row.notes },
  { header: 'not_a_translation', value: (row) => row.not_a_translation },
];

const tokenStatusCsvColumns = [
  { header: 'work_id', value: (row) => row.work_id },
  { header: 'work_title', value: (row) => row.work_title },
  { header: 'token_index_id', value: (row) => row.token_index_id },
  { header: 'chunk_id', value: (row) => row.chunk_id },
  { header: 'clicked_surface_form', value: (row) => row.clicked_surface_form },
  { header: 'normalized_form', value: (row) => row.normalized_form },
  { header: 'lexical_status', value: (row) => row.lexical_status },
  { header: 'match_method', value: (row) => row.match_method },
  { header: 'occurrence_count', value: (row) => row.occurrence_count },
  { header: 'lexicon_entry_id', value: (row) => row.lexicon_entry_id },
  { header: 'surface_renderings', value: (row) => row.surface_renderings },
  { header: 'exported_statuses', value: (row) => row.exported_statuses },
  { header: 'exported_rendering_options', value: (row) => row.exported_rendering_options },
  { header: 'exported_source_names', value: (row) => row.exported_source_names },
  { header: 'exported_source_ids', value: (row) => row.exported_source_ids },
  { header: 'exported_licenses', value: (row) => row.exported_licenses },
  { header: 'exported_claim_count', value: (row) => row.exported_claim_count },
  { header: 'best_confidence', value: (row) => row.best_confidence },
  { header: 'safe_min_confidence', value: (row) => row.safe_min_confidence },
  { header: 'safe_max_confidence', value: (row) => row.safe_max_confidence },
  { header: 'safe_export_status', value: (row) => row.safe_export_status },
  { header: 'safe_export_statuses', value: (row) => row.safe_export_statuses },
  { header: 'safe_export_rendering_options', value: (row) => row.safe_export_rendering_options },
  { header: 'safe_source_names', value: (row) => row.safe_source_names },
  { header: 'safe_source_ids', value: (row) => row.safe_source_ids },
  { header: 'safe_licenses', value: (row) => row.safe_licenses },
  { header: 'export_status', value: (row) => row.export_status },
  { header: 'notes', value: (row) => row.notes },
  { header: 'not_a_translation', value: (row) => row.not_a_translation },
];

const aiOptionsCsvColumns = [
  { header: 'work_id', value: (row) => row.work_id },
  { header: 'work_title', value: (row) => row.work_title },
  { header: 'token_index_id', value: (row) => row.token_index_id },
  { header: 'chunk_id', value: (row) => row.chunk_id },
  { header: 'clicked_surface_form', value: (row) => row.clicked_surface_form },
  { header: 'normalized_form', value: (row) => row.normalized_form },
  { header: 'lexical_status', value: (row) => row.lexical_status },
  { header: 'match_method', value: (row) => row.match_method },
  { header: 'occurrence_count', value: (row) => row.occurrence_count },
  { header: 'safe_min_confidence', value: (row) => row.safe_min_confidence },
  { header: 'safe_max_confidence', value: (row) => row.safe_max_confidence },
  { header: 'safe_export_status', value: (row) => row.safe_export_status },
  { header: 'safe_export_statuses', value: (row) => row.safe_export_statuses },
  { header: 'safe_export_rendering_options', value: (row) => row.safe_export_rendering_options },
  { header: 'safe_source_names', value: (row) => row.safe_source_names },
  { header: 'safe_source_ids', value: (row) => row.safe_source_ids },
  { header: 'safe_licenses', value: (row) => row.safe_licenses },
  { header: 'best_confidence_any_public_claim', value: (row) => row.best_confidence },
  { header: 'all_exported_statuses', value: (row) => row.exported_statuses },
  { header: 'all_exported_rendering_options', value: (row) => row.exported_rendering_options },
  { header: 'all_exported_licenses', value: (row) => row.exported_licenses },
  { header: 'notes', value: (row) => row.notes },
  { header: 'not_a_translation', value: (row) => row.not_a_translation },
];

writeJsonl('data/public-lexical/all-claims.jsonl', allRows);
writeCsv('data/public-lexical/all-claims.csv', allRows, claimCsvColumns);

for (const result of workResults) {
  if (!result.rows.length && result.skipped.missing_work_files) continue;
  writeJsonl(`data/public-lexical/by-work/${result.spec.work_id}.jsonl`, result.rows);
  writeCsv(`data/public-lexical/by-work/${result.spec.work_id}.csv`, result.rows, claimCsvColumns);
}

const byLicenseRows = {
  projectCc0: [],
  wikidataCc0: [],
  openscripturesCcBy4: [],
  kaikkiWiktionaryCcBySaGfdl: [],
};
let notPlacedByLicense = 0;
for (const row of allRows) {
  const bucket = classifyLicenseFile(row);
  if (bucket) {
    byLicenseRows[bucket].push(row);
  } else {
    notPlacedByLicense += 1;
  }
}
for (const [bucket, rel] of Object.entries(licenseFiles)) {
  writeJsonl(rel, byLicenseRows[bucket]);
  writeCsv(rel.replace(/\.jsonl$/, '.csv'), byLicenseRows[bucket], claimCsvColumns);
}

const cc0OnlyRows = [...byLicenseRows.projectCc0, ...byLicenseRows.wikidataCc0];
writeCsv('data/public-lexical/by-license/cc0-only.csv', cc0OnlyRows, claimCsvColumns);

for (const result of workResults) {
  if (result.tokenStatusRows?.length) {
    writeCsv(`data/public-lexical/by-work/${result.spec.work_id}-token-status.csv`, result.tokenStatusRows, tokenStatusCsvColumns);
    writeCsv(`data/public-lexical/by-work/${result.spec.work_id}-ai-options-min${safeAiMinConfidence}.csv`, result.tokenStatusRows, aiOptionsCsvColumns);
  }
}

function listManifestFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listManifestFiles(rel));
    } else if (entry.isFile() && entry.name.endsWith('.manifest.json')) {
      files.push(rel);
    }
  }
  return files;
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsonFiles(rel));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(rel);
    }
  }
  return files;
}

function repoRel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function buildAllWorkSpecs() {
  const tokenIndexesByWork = new Map();
  for (const tokenIndexPath of listJsonFiles(abs('data/lexical/token-indexes'))) {
    try {
      const tokenIndex = JSON.parse(fs.readFileSync(tokenIndexPath, 'utf8'));
      if (tokenIndex.work_id && !tokenIndexesByWork.has(tokenIndex.work_id)) {
        tokenIndexesByWork.set(tokenIndex.work_id, {
          path: repoRel(tokenIndexPath),
          label: tokenIndex.work_title || tokenIndex.work_id,
        });
      }
    } catch {
      // Validation scripts catch malformed JSON; skip bad index files here.
    }
  }

  const specs = [];
  for (const manifestPath of listManifestFiles(abs('data/lexical'))) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.work_id) continue;
      const tokenIndex = tokenIndexesByWork.get(manifest.work_id);
      if (!tokenIndex) continue;
      specs.push({
        work_id: manifest.work_id,
        label: tokenIndex.label,
        token_index: tokenIndex.path,
        manifest: repoRel(manifestPath),
      });
    } catch {
      // Keep scanning other manifests.
    }
  }
  return specs.sort((a, b) => a.work_id.localeCompare(b.work_id));
}

function buildWorkDownloadIndex() {
  const tokenIndexesByWork = new Map();
  for (const tokenIndexPath of listJsonFiles(abs('data/lexical/token-indexes'))) {
    try {
      const tokenIndex = JSON.parse(fs.readFileSync(tokenIndexPath, 'utf8'));
      if (tokenIndex.work_id && !tokenIndexesByWork.has(tokenIndex.work_id)) {
        tokenIndexesByWork.set(tokenIndex.work_id, repoRel(tokenIndexPath));
      }
    } catch {
      // Keep the public download index best-effort; validation scripts catch malformed JSON elsewhere.
    }
  }

  const rows = [];
  for (const manifestPath of listManifestFiles(abs('data/lexical'))) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.work_id) continue;
      const workId = manifest.work_id;
      rows.push({
        work_id: workId,
        lexical_manifest: repoRel(manifestPath),
        token_index: tokenIndexesByWork.get(workId) || '',
        public_claims_jsonl: fs.existsSync(abs(`data/public-lexical/by-work/${workId}.jsonl`)) ? `data/public-lexical/by-work/${workId}.jsonl` : '',
        public_claims_csv: fs.existsSync(abs(`data/public-lexical/by-work/${workId}.csv`)) ? `data/public-lexical/by-work/${workId}.csv` : '',
        token_status_csv: fs.existsSync(abs(`data/public-lexical/by-work/${workId}-token-status.csv`)) ? `data/public-lexical/by-work/${workId}-token-status.csv` : '',
        ai_options_min60_csv: fs.existsSync(abs(`data/public-lexical/by-work/${workId}-ai-options-min${safeAiMinConfidence}.csv`)) ? `data/public-lexical/by-work/${workId}-ai-options-min${safeAiMinConfidence}.csv` : '',
        compact_token_claims_min60_csv: fs.existsSync(abs(`data/public-lexical/by-work/${workId}-token-claims-min${safeAiMinConfidence}.csv`)) ? `data/public-lexical/by-work/${workId}-token-claims-min${safeAiMinConfidence}.csv` : '',
        sitewide_claim_index_csv: 'data/public-lexical/sitewide/claim-index.csv',
        sitewide_normalized_lookup: 'data/public-lexical/sitewide/normalized-lookup.json',
      });
    } catch {
      // Keep scanning the rest of the corpus.
    }
  }
  return rows.sort((a, b) => a.work_id.localeCompare(b.work_id));
}

function buildSitewideCompactExport() {
  const claimById = new Map();
  const lookup = new Map();
  const workSummary = [];
  const diagnostics = {
    manifests: 0,
    chunks: 0,
    candidates_without_renderings: 0,
    candidates_without_source_license: 0,
  };

  for (const manifestPath of listManifestFiles(abs('data/lexical'))) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.work_id || !Array.isArray(manifest.chunks)) continue;
    diagnostics.manifests += 1;
    let workClaimCount = 0;
    const workClaimIds = new Set();

    for (const chunkInfo of manifest.chunks) {
      diagnostics.chunks += 1;
      const chunk = readJson(path.join('data/lexical', chunkInfo.url));
      const sourceRowsByKey = new Map();
      for (const [key, value] of Object.entries(chunk.source_rows || {})) {
        sourceRowsByKey.set(key, { ...value, __source_key: key });
      }

      for (const entry of chunk.lexicon?.entries || []) {
        for (const candidate of entry.possible_entries || []) {
          const renderings = canonicalRenderings(candidate.strict_renderings || []);
          if (!renderings.length) {
            diagnostics.candidates_without_renderings += 1;
            continue;
          }
          const sourceRows = sourceRowsForCandidate(entry, candidate, sourceRowsByKey);
          if (!sourceRows.length) {
            diagnostics.candidates_without_source_license += 1;
            continue;
          }
          const normalizedForms = unique([
            candidate.match_key,
            entry.hebrew_word,
            candidate.lemma,
          ]);
          for (const sourceRow of sourceRows) {
            if (!sourceHasUsableLicense(sourceRow)) {
              diagnostics.candidates_without_source_license += 1;
              continue;
            }
            const claim = makeCompactClaim({
              status: claimStatusForCandidate(candidate, sourceRows),
              normalizedForms,
              hebrewForm: candidate.lemma || candidate.match_key || entry.hebrew_word,
              renderings,
              candidate,
              sourceRow,
            });
            if (!claimById.has(claim.claim_id)) {
              claimById.set(claim.claim_id, claim);
            }
            workClaimIds.add(claim.claim_id);
            workClaimCount += 1;
            for (const normalized of claim.normalized_forms) {
              if (!normalized) continue;
              if (!lookup.has(normalized)) lookup.set(normalized, new Set());
              lookup.get(normalized).add(claim.claim_id);
            }
          }
        }
      }
    }

    workSummary.push({
      work_id: manifest.work_id,
      chunks: manifest.chunks.length,
      candidate_claim_links: workClaimCount,
      unique_claims: workClaimIds.size,
    });
  }

  const claims = [...claimById.values()].sort((a, b) => a.claim_id.localeCompare(b.claim_id));
  const lookupObject = Object.fromEntries(
    [...lookup.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([normalized, ids]) => [normalized, [...ids].sort()])
  );
  const workRows = workSummary.sort((a, b) => a.work_id.localeCompare(b.work_id));

  writeJsonl('data/public-lexical/sitewide/claim-index.jsonl', claims);
  writeJson('data/public-lexical/sitewide/normalized-lookup.json', lookupObject);
  writeJsonl('data/public-lexical/sitewide/work-summary.jsonl', workRows);
  writeCsv('data/public-lexical/sitewide/claim-index.csv', claims, claimCsvColumns);
  writeCsv('data/public-lexical/sitewide/work-summary.csv', workRows, [
    { header: 'work_id', value: (row) => row.work_id },
    { header: 'chunks', value: (row) => row.chunks },
    { header: 'candidate_claim_links', value: (row) => row.candidate_claim_links },
    { header: 'unique_claims', value: (row) => row.unique_claims },
  ]);

  return {
    claims,
    lookup: lookupObject,
    lookup_terms: lookup.size,
    work_rows: workRows,
    diagnostics,
  };
}

function writePerWorkTokenClaimCsvs(sitewideCompact) {
  const rowsByWork = [];
  const minConfidence = safeAiMinConfidence;
  const columns = [
    { header: 'clicked_surface_form', value: (row) => row.clicked_surface_form },
    { header: 'normalized_form', value: (row) => row.normalized_form },
    { header: 'occurrence_count', value: (row) => row.occurrence_count },
    { header: 'best_confidence_any_claim', value: (row) => row.best_confidence_any_claim },
    { header: 'safe_min_confidence', value: (row) => row.safe_min_confidence },
    { header: 'safe_claim_ids', value: (row) => row.safe_claim_ids },
    { header: 'safe_rendering_options', value: (row) => row.safe_rendering_options },
    { header: 'safe_source_names', value: (row) => row.safe_source_names },
    { header: 'safe_source_ids', value: (row) => row.safe_source_ids },
    { header: 'safe_licenses', value: (row) => row.safe_licenses },
    { header: 'export_status', value: (row) => row.export_status },
    { header: 'notes', value: (row) => row.notes },
  ];

  for (const spec of buildAllWorkSpecs()) {
    const { work, tokenIndex, entryById, sourceRowsByKey } = loadWorkExportContext(spec);
    const workId = work.work_id || spec.work_id;
    const rows = tokenIndex.forms.map((token) => {
      const claims = [];
      const entry = token.status === 'matched' && token.lexicon_entry_id
        ? entryById.get(token.lexicon_entry_id)
        : null;
      if (entry) {
        const surfaceRenderings = canonicalRenderings(token.surface_renderings || []);
        if (surfaceRenderings.length) {
          for (const sourceRow of sourceRowsForTokenSurface(entry, token, sourceRowsByKey)) {
            if (!sourceHasUsableLicense(sourceRow)) continue;
            claims.push(makeClaim({
              work,
              token,
              status: isAramaicCandidate({}, [sourceRow]) ? 'Strict Aramaic' : 'Strict Hebrew',
              hebrewForm: entry.hebrew_word || token.normalized_word,
              renderings: surfaceRenderings,
              breakdown: token.breakdown || [],
              candidate: null,
              sourceRow,
            }));
          }
        }
        for (const candidate of entry.possible_entries || []) {
          const renderings = canonicalRenderings(candidate.strict_renderings || []);
          if (!renderings.length) continue;
          const sourceRows = sourceRowsForCandidate(entry, candidate, sourceRowsByKey);
          for (const sourceRow of sourceRows) {
            if (!sourceHasUsableLicense(sourceRow)) continue;
            claims.push(makeClaim({
              work,
              token,
              status: claimStatusForCandidate(candidate, sourceRows),
              hebrewForm: candidate.lemma || candidate.match_key || entry.hebrew_word,
              renderings,
              breakdown: [],
              candidate,
              sourceRow,
            }));
          }
        }
      }

      const seenClaims = new Set();
      const dedupedClaims = [];
      for (const claim of claims) {
        const id = claimIdForClaim(claim);
        if (!seenClaims.has(id)) {
          dedupedClaims.push({ ...claim, claim_id: id });
          seenClaims.add(id);
        }
      }
      const safeClaims = dedupedClaims.filter(isSafeAiOption);
      const bestConfidence = claims.length ? Math.max(...claims.map((claim) => claim.confidence || 0)) : 0;
      const safeStatus = safeClaims.length
        ? `safe_claims_min${minConfidence}`
        : (dedupedClaims.length ? `claims_below_safe_min${minConfidence}` : 'unresolved');
      const notes = safeClaims.length
        ? ''
        : (dedupedClaims.length ? `No strict claim >=${minConfidence}%.` : 'No lexical entry yet.');

      return {
        work_id: workId,
        work_title: work.work_title || tokenIndex.work_title || workId,
        token_index_id: token.token_index_id || '',
        clicked_surface_form: token.surface_word || '',
        normalized_form: token.normalized_word || '',
        occurrence_count: token.occurrence_count || 0,
        lexical_status: token.status || '',
        match_method: token.match_method || '',
        lexicon_entry_id: token.lexicon_entry_id || '',
        safe_min_confidence: minConfidence,
        safe_claim_ids: safeClaims.map((claim) => claim.claim_id),
        safe_statuses: unique(safeClaims.map((claim) => claim.status)),
        safe_rendering_options: unique(safeClaims.flatMap((claim) => claim.strict_renderings || [])),
        safe_source_names: unique(safeClaims.map((claim) => claim.source_name)),
        safe_source_ids: unique(safeClaims.map((claim) => claim.source_id)),
        safe_licenses: unique(safeClaims.map((claim) => claim.license)),
        best_confidence_any_claim: bestConfidence,
        export_status: safeStatus,
        notes,
        not_a_translation: true,
      };
    });

    const rel = `data/public-lexical/by-work/${workId}-token-claims-min${minConfidence}.csv`;
    writeCsv(rel, rows, columns);
    rowsByWork.push({
      work_id: workId,
      token_rows: rows.length,
      safe_token_rows: rows.filter((row) => row.safe_claim_ids.length).length,
      path: rel,
      bytes: fileSize(rel),
    });
  }

  return rowsByWork.sort((a, b) => a.work_id.localeCompare(b.work_id));
}

const sitewideCompact = buildSitewideCompactExport();
const perWorkCompactTokenCsvs = writePerWorkTokenClaimCsvs(sitewideCompact);
const workDownloadRows = buildWorkDownloadIndex();
const workDownloadColumns = [
  { header: 'work_id', value: (row) => row.work_id },
  { header: 'lexical_manifest', value: (row) => row.lexical_manifest },
  { header: 'token_index', value: (row) => row.token_index },
  { header: 'public_claims_jsonl', value: (row) => row.public_claims_jsonl },
  { header: 'public_claims_csv', value: (row) => row.public_claims_csv },
  { header: 'token_status_csv', value: (row) => row.token_status_csv },
  { header: 'ai_options_min60_csv', value: (row) => row.ai_options_min60_csv },
  { header: 'compact_token_claims_min60_csv', value: (row) => row.compact_token_claims_min60_csv },
  { header: 'sitewide_claim_index_csv', value: (row) => row.sitewide_claim_index_csv },
  { header: 'sitewide_normalized_lookup', value: (row) => row.sitewide_normalized_lookup },
];
writeJsonl('data/public-lexical/sitewide/work-downloads.jsonl', workDownloadRows);
writeCsv('data/public-lexical/sitewide/work-downloads.csv', workDownloadRows, workDownloadColumns);

const manifest = {
  schema_version: 1,
  generated_at: generatedAt,
  title: 'Public lexical HUD claim export',
  scope: 'Claim-shaped lexical options derived from existing HUD rows. These are lexical options, not translations.',
  prompt: 'prompts/use-lexical-workbench.md',
  reports: ['reports/public-lexical-export-report.md'],
  files: [
    { path: 'data/public-lexical/all-claims.jsonl', row_count: allRows.length, bytes: fileSize('data/public-lexical/all-claims.jsonl') },
    { path: 'data/public-lexical/all-claims.csv', row_count: allRows.length, bytes: fileSize('data/public-lexical/all-claims.csv') },
    ...workResults
      .filter((result) => result.rows.length || !result.skipped.missing_work_files)
      .map((result) => ({
        path: `data/public-lexical/by-work/${result.spec.work_id}.jsonl`,
        work_id: result.spec.work_id,
        row_count: result.rows.length,
        bytes: fileSize(`data/public-lexical/by-work/${result.spec.work_id}.jsonl`),
      })),
    ...workResults
      .filter((result) => result.rows.length || !result.skipped.missing_work_files)
      .map((result) => ({
        path: `data/public-lexical/by-work/${result.spec.work_id}.csv`,
        work_id: result.spec.work_id,
        row_count: result.rows.length,
        bytes: fileSize(`data/public-lexical/by-work/${result.spec.work_id}.csv`),
      })),
    ...Object.entries(licenseFiles).map(([bucket, rel]) => ({
      path: rel,
      license_bucket: bucket,
      row_count: byLicenseRows[bucket].length,
      bytes: fileSize(rel),
    })),
    ...Object.entries(licenseFiles).map(([bucket, rel]) => ({
      path: rel.replace(/\.jsonl$/, '.csv'),
      license_bucket: bucket,
      row_count: byLicenseRows[bucket].length,
      bytes: fileSize(rel.replace(/\.jsonl$/, '.csv')),
    })),
    { path: 'data/public-lexical/by-license/cc0-only.csv', license_bucket: 'cc0Only', row_count: cc0OnlyRows.length, bytes: fileSize('data/public-lexical/by-license/cc0-only.csv') },
    ...workResults
      .filter((result) => result.tokenStatusRows?.length)
      .map((result) => ({
        path: `data/public-lexical/by-work/${result.spec.work_id}-token-status.csv`,
        work_id: result.spec.work_id,
        row_count: result.tokenStatusRows.length,
        bytes: fileSize(`data/public-lexical/by-work/${result.spec.work_id}-token-status.csv`),
      })),
    ...workResults
      .filter((result) => result.tokenStatusRows?.length)
      .map((result) => ({
        path: `data/public-lexical/by-work/${result.spec.work_id}-ai-options-min${safeAiMinConfidence}.csv`,
        work_id: result.spec.work_id,
        row_count: result.tokenStatusRows.length,
        safe_min_confidence: safeAiMinConfidence,
        bytes: fileSize(`data/public-lexical/by-work/${result.spec.work_id}-ai-options-min${safeAiMinConfidence}.csv`),
      })),
    ...perWorkCompactTokenCsvs.map((row) => ({
      path: row.path,
      work_id: row.work_id,
      row_count: row.token_rows,
      safe_token_rows: row.safe_token_rows,
      safe_min_confidence: safeAiMinConfidence,
      bytes: row.bytes,
    })),
    { path: 'data/public-lexical/sitewide/claim-index.jsonl', row_count: sitewideCompact.claims.length, bytes: fileSize('data/public-lexical/sitewide/claim-index.jsonl') },
    { path: 'data/public-lexical/sitewide/claim-index.csv', row_count: sitewideCompact.claims.length, bytes: fileSize('data/public-lexical/sitewide/claim-index.csv') },
    { path: 'data/public-lexical/sitewide/normalized-lookup.json', row_count: sitewideCompact.lookup_terms, bytes: fileSize('data/public-lexical/sitewide/normalized-lookup.json') },
    { path: 'data/public-lexical/sitewide/work-summary.jsonl', row_count: sitewideCompact.work_rows.length, bytes: fileSize('data/public-lexical/sitewide/work-summary.jsonl') },
    { path: 'data/public-lexical/sitewide/work-summary.csv', row_count: sitewideCompact.work_rows.length, bytes: fileSize('data/public-lexical/sitewide/work-summary.csv') },
    { path: 'data/public-lexical/sitewide/work-downloads.jsonl', row_count: workDownloadRows.length, bytes: fileSize('data/public-lexical/sitewide/work-downloads.jsonl') },
    { path: 'data/public-lexical/sitewide/work-downloads.csv', row_count: workDownloadRows.length, bytes: fileSize('data/public-lexical/sitewide/work-downloads.csv') },
  ],
  ai_export_policy: {
    safe_min_confidence: safeAiMinConfidence,
    note: 'AI options CSVs include token rows. Safe export columns include only Strict Hebrew / Strict Aramaic claims at or above the confidence threshold. Compact per-work token-claim CSVs are available for every work and point back to deduplicated source/license claims.',
  },
  license_policy: {
    note: 'Rows retain their own source/license metadata. Do not combine CC BY-SA/GFDL rows into CC0-only downstream output.',
    projectCc0: 'Project-authored rows explicitly labeled project-authored / CC0.',
    wikidataCc0: 'Wikidata Lexeme rows labeled CC0.',
    openscripturesCcBy4: 'OpenScriptures rows labeled CC BY 4.0.',
    kaikkiWiktionaryCcBySaGfdl: 'Kaikki/Wiktionary rows labeled CC BY-SA 4.0 / GFDL.',
  },
};
writeJson('data/public-lexical/manifest.json', manifest);

const skippedTotals = workResults.reduce((acc, result) => {
  for (const [key, value] of Object.entries(result.skipped)) {
    acc[key] = (acc[key] || 0) + value;
  }
  return acc;
}, {});

const workCounts = Object.fromEntries(workResults.map((result) => [result.spec.work_id, result.rows.length]));
const licenseCounts = Object.fromEntries(Object.entries(byLicenseRows).map(([bucket, rows]) => [bucket, rows.length]));

const reportLines = [
  '# Public Lexical Export Report',
  '',
  `Generated: ${generatedAt}`,
  '',
  '## Scope',
  '',
  'This export contains claim-shaped lexical HUD rows for hardened public workbench pages. It is not a translation export and does not include prose translations.',
  '',
  '## Exported Row Counts by Work',
  '',
  '| Work | Rows |',
  '| --- | ---: |',
  ...Object.entries(workCounts).map(([workId, count]) => `| ${workId} | ${count} |`),
  '',
  '## Exported Row Counts by License Bucket',
  '',
  '| License bucket | Rows | File |',
  '| --- | ---: | --- |',
  `| Project-authored / CC0 | ${licenseCounts.projectCc0} | data/public-lexical/by-license/project-cc0.jsonl |`,
  `| Wikidata CC0 | ${licenseCounts.wikidataCc0} | data/public-lexical/by-license/wikidata-cc0.jsonl |`,
  `| OpenScriptures CC BY 4.0 | ${licenseCounts.openscripturesCcBy4} | data/public-lexical/by-license/openscriptures-cc-by-4.jsonl |`,
  `| Kaikki/Wiktionary CC BY-SA/GFDL | ${licenseCounts.kaikkiWiktionaryCcBySaGfdl} | data/public-lexical/by-license/kaikki-wiktionary-cc-by-sa-gfdl.jsonl |`,
  `| Combined CC0-only CSV | ${cc0OnlyRows.length} | data/public-lexical/by-license/cc0-only.csv |`,
  '',
  'CSV mirrors are available beside the JSONL files. The CSV files are meant for spreadsheet import or AI-assisted workflows that prefer flat rows.',
  '',
  `All claim rows are also available as \`data/public-lexical/all-claims.csv\`, with deterministic confidence columns attached.`,
  '',
  '## Token Status CSVs',
  '',
  '| Work | Unique token rows | CSV |',
  '| --- | ---: | --- |',
  ...workResults
    .filter((result) => result.tokenStatusRows?.length)
    .map((result) => `| ${result.spec.work_id} | ${result.tokenStatusRows.length} | data/public-lexical/by-work/${result.spec.work_id}-token-status.csv |`),
  '',
  'Token-status CSVs include unresolved forms explicitly. An unresolved row means `No lexical entry yet`, not a hidden translation or inferred definition.',
  '',
  `For AI-assisted workflows, use the \`*-ai-options-min${safeAiMinConfidence}.csv\` files. They include every token row, but only expose \`safe_export_rendering_options\` when a Strict Hebrew or Strict Aramaic public claim is at least ${safeAiMinConfidence}% confident.`,
  '',
  '| Work | Unique token rows | AI options CSV |',
  '| --- | ---: | --- |',
  ...workResults
    .filter((result) => result.tokenStatusRows?.length)
    .map((result) => `| ${result.spec.work_id} | ${result.tokenStatusRows.length} | data/public-lexical/by-work/${result.spec.work_id}-ai-options-min${safeAiMinConfidence}.csv |`),
  '',
  '## Compact Per-Work Token Claim CSVs',
  '',
  `A compact \`*-token-claims-min${safeAiMinConfidence}.csv\` file was generated for every work with a token index. These files avoid duplicating full source rows per work; they include Strict Hebrew / Strict Aramaic claim IDs, rendering options, and compact license columns when the claim clears the confidence threshold, and they point back to the sitewide claim index for full row details.`,
  '',
  '| Work | Token rows | Safe token rows | CSV |',
  '| --- | ---: | ---: | --- |',
  ...perWorkCompactTokenCsvs.map((row) => `| ${row.work_id} | ${row.token_rows} | ${row.safe_token_rows} | ${row.path} |`),
  '',
  '## Skipped / Diagnostic Counts',
  '',
  '| Reason | Count |',
  '| --- | ---: |',
  ...Object.entries(skippedTotals).map(([reason, count]) => `| ${reason.replaceAll('_', ' ')} | ${count} |`),
  `| exported rows not placed in a by-license file | ${notPlacedByLicense} |`,
  '',
  'Rows are skipped from the public JSONL export when they have no renderings or when a rendered claim cannot be tied to source/license metadata. Rows with project lexical-rule license labels that are not explicitly CC0 remain in all-claims/by-work output but are not placed in the CC0 by-license file.',
  '',
  '## Sitewide Compact Claim Index',
  '',
  '| File | Rows / terms | Purpose |',
  '| --- | ---: | --- |',
  `| data/public-lexical/sitewide/claim-index.jsonl | ${sitewideCompact.claims.length} | Deduplicated claim-shaped lexical rows across all imported works |`,
  `| data/public-lexical/sitewide/claim-index.csv | ${sitewideCompact.claims.length} | CSV mirror of the compact claim index |`,
  `| data/public-lexical/sitewide/normalized-lookup.json | ${sitewideCompact.lookup_terms} | Normalized Hebrew form to claim ID lookup |`,
  `| data/public-lexical/sitewide/work-summary.jsonl | ${sitewideCompact.work_rows.length} | Per-work compact-export coverage summary |`,
  `| data/public-lexical/sitewide/work-summary.csv | ${sitewideCompact.work_rows.length} | CSV mirror of per-work compact-export coverage summary |`,
  `| data/public-lexical/sitewide/work-downloads.csv | ${workDownloadRows.length} | Per-work download index for lexical manifests, token indexes, and public export files |`,
  '',
  'The compact sitewide files are intended for AI/tool import. They preserve source/license metadata per claim and avoid repeating the same source-backed lexical row for every work-token occurrence.',
  '',
  '### Sitewide Compact Diagnostics',
  '',
  '| Item | Count |',
  '| --- | ---: |',
  `| manifests scanned | ${sitewideCompact.diagnostics.manifests} |`,
  `| chunks scanned | ${sitewideCompact.diagnostics.chunks} |`,
  `| candidate rows without renderings | ${sitewideCompact.diagnostics.candidates_without_renderings} |`,
  `| candidate rows without source/license | ${sitewideCompact.diagnostics.candidates_without_source_license} |`,
  '',
  '## User-Facing Prompt',
  '',
  'The AI-assisted workflow prompt is at `prompts/use-lexical-workbench.md`.',
  '',
  '## Public Library Navigation',
  '',
  'The root page now opens directly as the Full Library instead of a splash/featured shelf. Lexical export downloads are linked from the root page, library page, and About / License page.',
  '',
  'The public library keeps Talmud / Commentary out of the normal visible category list. Those works remain direct-linkable through an internal archive shelf labeled `Internal archive / not public-featured yet`.',
  '',
  '## Integrity Confirmations',
  '',
  '- Hebrew source text was not changed by this export task.',
  '- Overlay/export namespaces were not changed by this export task.',
  '- Lexical source/license metadata remains per row.',
  '- Third-party rows were not relabeled as CC0.',
  '- Orot meanings were not changed.',
];
writeText('reports/public-lexical-export-report.md', `${reportLines.join('\n')}\n`);

console.log(JSON.stringify({
  generated_at: generatedAt,
  all_rows: allRows.length,
  by_work: workCounts,
  by_license: licenseCounts,
  skipped: skippedTotals,
  not_placed_by_license: notPlacedByLicense,
  sitewide_compact: {
    claims: sitewideCompact.claims.length,
    lookup_terms: sitewideCompact.lookup_terms,
    works: sitewideCompact.work_rows.length,
    diagnostics: sitewideCompact.diagnostics,
  },
  per_work_compact_token_csvs: {
    works: perWorkCompactTokenCsvs.length,
    token_rows: perWorkCompactTokenCsvs.reduce((sum, row) => sum + row.token_rows, 0),
    safe_token_rows: perWorkCompactTokenCsvs.reduce((sum, row) => sum + row.safe_token_rows, 0),
  },
}, null, 2));
