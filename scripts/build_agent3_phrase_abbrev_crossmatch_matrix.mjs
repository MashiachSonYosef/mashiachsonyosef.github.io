#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT_PACKET = 'reports/agent3-a14-phrase-abbrev-adoption-packet-2026-06-11.json';
const SOURCE_LAYER = 'data/lexical/source-layers/project-abbreviations.json';
const OUT_JSON = 'reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.json';
const OUT_MD = 'reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.md';
const MAX_SAMPLES = 12;

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'definition',
  'definition_text',
  'meaning',
  'translation',
  'accepted_translation',
  'answer',
  'answer_eligible',
  'winner',
  'route_payload',
  'route_payloads',
  'public_emit',
  'prehud_allowed',
]);

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function collectFiles(dir, predicate, out = []) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return out;
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) collectFiles(rel, predicate, out);
    else if (predicate(rel)) out.push(rel);
  }
  return out;
}

function tokenIndexPathFor(workId) {
  const suffix = `/${workId}.json`;
  return collectFiles('data/lexical/token-indexes', (rel) => rel.endsWith(suffix))[0] || null;
}

function chunkPathsFor(workId) {
  const manifestPath = `data/lexical/${workId}.manifest.json`;
  if (!fs.existsSync(path.join(ROOT, manifestPath))) return [];
  const manifest = readJson(manifestPath);
  return (manifest.chunks || [])
    .map((chunk) => `data/lexical/${chunk.url}`)
    .filter((relPath) => fs.existsSync(path.join(ROOT, relPath)));
}

function add(set, value) {
  if (value !== undefined && value !== null && String(value).trim() !== '') set.add(String(value));
}

function entryPatternType(entry) {
  const expansion = String(entry.expansion || '');
  if (expansion.includes(' / ')) return 'phrase_abbreviation';
  if ((entry.breakdown || []).length > 1) return 'phrase_abbreviation';
  return 'abbreviation_reference';
}

function collectCandidateForms(entry) {
  const values = new Set();
  add(values, entry.hebrew_word);
  for (const form of entry.surface_forms || []) add(values, form);
  for (const possible of entry.possible_entries || []) {
    add(values, possible.lemma);
    add(values, possible.match_key);
  }
  return values;
}

function buildWorkEvidence(workId, forms, globalCandidateForms) {
  const formLookup = new Map();
  const sampleLookup = new Map();

  for (const form of forms) {
    const keys = new Set();
    if (globalCandidateForms.has(form.surface_word)) keys.add(form.surface_word);
    if (globalCandidateForms.has(form.normalized_word)) keys.add(form.normalized_word);
    if (!keys.size) continue;
    const item = {
      form_key: `${form.surface_word || ''}\u0000${form.normalized_word || ''}\u0000${form.lexicon_entry_id || ''}`,
      occurrence_count: Number(form.occurrence_count || 0),
    };
    for (const key of keys) {
      if (!formLookup.has(key)) formLookup.set(key, []);
      formLookup.get(key).push(item);
    }
  }

  for (const chunkPath of chunkPathsFor(workId)) {
    const chunk = readJson(chunkPath);
    const chunkForms = chunk.token_index?.forms || [];
    for (const token of chunkForms) {
      const surface = token.surface_word || '';
      const normalized = token.normalized_word || '';
      const keys = new Set();
      if (globalCandidateForms.has(surface)) keys.add(surface);
      if (globalCandidateForms.has(normalized)) keys.add(normalized);
      if (!keys.size) continue;
      const tokenId = token.token_index_id;
      if (!tokenId) continue;
      const sample = {
        token_index_id: tokenId,
        surface_word: surface,
        normalized_word: normalized,
        chunk_id: chunk.chunk_id || path.basename(chunkPath, '.json'),
        page_anchor: `#${tokenId}`,
      };
      for (const key of keys) {
        if (!sampleLookup.has(key)) sampleLookup.set(key, []);
        const list = sampleLookup.get(key);
        if (list.length < MAX_SAMPLES && !list.some((existing) => existing.token_index_id === tokenId)) list.push(sample);
      }
    }
  }

  return { formLookup, sampleLookup };
}

function evidenceForCandidateForms(workEvidence, candidateForms, limit = MAX_SAMPLES) {
  const seenForms = new Set();
  const seenSamples = new Set();
  const samples = [];
  let occurrenceCount = 0;

  for (const candidate of candidateForms) {
    for (const form of workEvidence.formLookup.get(candidate) || []) {
      if (seenForms.has(form.form_key)) continue;
      seenForms.add(form.form_key);
      occurrenceCount += form.occurrence_count;
    }
    for (const sample of workEvidence.sampleLookup.get(candidate) || []) {
      if (samples.length >= limit) break;
      if (seenSamples.has(sample.token_index_id)) continue;
      seenSamples.add(sample.token_index_id);
      samples.push(sample);
    }
    if (samples.length >= limit) break;
  }

  return { occurrenceCount, samples };
}

function scanForbiddenAuthorityKeys(value, hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    for (const item of value) scanForbiddenAuthorityKeys(item, hits);
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key) && isTruthyAuthorityValue(child)) hits.push(key);
    scanForbiddenAuthorityKeys(child, hits);
  }
  return hits;
}

function isTruthyAuthorityValue(value) {
  if (value === false || value === null || value === undefined || value === 0 || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function renderReport(artifact) {
  const rows = [
    '# Agent3 A14 Phrase Abbrev Pattern Crossmatch Matrix - 2026-06-11',
    '',
    `Status: \`${artifact.status}\`.`,
    '',
    'Boundary: evidence/navigation only. No source/license/legal/Definition/answer/accepted-text/public-runtime/release acceptance. No preHUD authority.',
    '',
    '## Counts',
    '',
    '| metric | value |',
    '|---|---:|',
    `| target works | ${artifact.counts.target_work_count} |`,
    `| source entries | ${artifact.counts.source_entry_count} |`,
    `| matrix rows | ${artifact.counts.matrix_rows} |`,
    `| rows with occurrence evidence | ${artifact.counts.rows_with_occurrence_evidence} |`,
    `| total occurrence count | ${artifact.counts.total_occurrence_count} |`,
    `| rows with token samples | ${artifact.counts.rows_with_token_samples} |`,
    `| missing token index works | ${artifact.counts.missing_token_index_works} |`,
    '',
    '## Top Rows',
    '',
    '| pattern_id | surface | works | occurrences | blocker |',
    '|---|---|---:|---:|---|',
  ];
  for (const row of artifact.matrix_rows.slice(0, 40)) {
    rows.push(`| ${row.pattern_id} | ${row.surface} | ${row.work_ids.length} | ${row.occurrence_count} | ${row.blocker_class} |`);
  }
  rows.push('', '## Stop Condition', '', artifact.stop_condition, '');
  return rows.join('\n');
}

const packet = readJson(INPUT_PACKET);
const sourceLayer = readJson(SOURCE_LAYER);
const targetWorkIds = packet.target_work_ids || [];
const entries = sourceLayer.entries || [];
const entryCandidates = entries.map((entry) => ({
  entry,
  candidateForms: collectCandidateForms(entry),
}));
const globalCandidateForms = new Set();
for (const { candidateForms } of entryCandidates) {
  for (const candidate of candidateForms) globalCandidateForms.add(candidate);
}

const workIndexes = new Map();
const missingWorkIndexes = [];
for (const workId of targetWorkIds) {
  const indexPath = tokenIndexPathFor(workId);
  if (!indexPath) {
    missingWorkIndexes.push(workId);
    continue;
  }
  const index = readJson(indexPath);
  workIndexes.set(workId, {
    path: indexPath,
    forms: index.forms || [],
  });
}

const workEvidence = new Map();
for (const [workId, workIndex] of workIndexes) {
  workEvidence.set(workId, buildWorkEvidence(workId, workIndex.forms, globalCandidateForms));
}

const matrixRows = [];
for (const { entry, candidateForms } of entryCandidates) {
  const surface = entry.hebrew_word || [...candidateForms][0] || entry.entry_id;
  const normalized = (entry.possible_entries || [])[0]?.match_key || surface;
  const rowWorkIds = [];
  const sampleTokenIds = [];
  let occurrenceCount = 0;

  for (const [workId, evidence] of workEvidence) {
    const { occurrenceCount: workOccurrenceCount, samples } = evidenceForCandidateForms(evidence, candidateForms, MAX_SAMPLES - sampleTokenIds.length);
    if (workOccurrenceCount > 0) {
      rowWorkIds.push(workId);
      occurrenceCount += workOccurrenceCount;
      for (const sample of samples) sampleTokenIds.push({ work_id: workId, ...sample });
    }
  }

  const possible = entry.possible_entries || [];
  const sourceRows = entry.source_rows || [];
  const row = {
    pattern_id: entry.entry_id,
    surface,
    normalized,
    pattern_type: entryPatternType(entry),
    possible_expansion_or_base: entry.expansion || '',
    work_ids: rowWorkIds,
    occurrence_count: occurrenceCount,
    sample_occurrence_ids: sampleTokenIds.map((sample) => sample.token_index_id),
    sample_source_refs: [],
    sample_page_anchors: sampleTokenIds.map((sample) => `${sample.work_id}:${sample.page_anchor}`),
    sample_token_indices: sampleTokenIds,
    existing_source_layer_hit: true,
    source_layer_id: sourceLayer.layer_id,
    source_row_keys: possible.flatMap((item) => item.source_row_keys || []),
    route_or_lexical_ids_if_any: possible.map((item) => item.entry_key || item.source_id).filter(Boolean),
    evidence_only_reason: 'project-authored abbreviation evidence; navigation/crossmatch only; no preHUD or Definition authority',
    blocker_class: occurrenceCount > 0 ? 'none' : 'no_occurrences_in_bounded_workset',
    next_owner: occurrenceCount > 0 ? 'A3_to_A10_package_intake_or_A2_after_A1_A6_if_transform_needed' : 'A3_or_A14_target_selection',
    stop_condition: occurrenceCount > 0 ? 'row is occurrence-linked evidence only' : 'select broader workset or leave as no-occurrence evidence row',
    source_family: sourceLayer.source_family,
    license: sourceLayer.license,
    source_urls: sourceRows.map((row) => row.source_url).filter(Boolean),
    display_eligible: false,
    prehud_allowed: false,
    reader_facing: false,
    not_definition_authority: true,
  };
  matrixRows.push(row);
}

matrixRows.sort((a, b) => b.occurrence_count - a.occurrence_count || a.pattern_id.localeCompare(b.pattern_id));

const rowsWithOccurrenceEvidence = matrixRows.filter((row) => row.occurrence_count > 0).length;
const rowsWithTokenSamples = matrixRows.filter((row) => row.sample_token_indices.length > 0).length;
const totalOccurrenceCount = matrixRows.reduce((sum, row) => sum + row.occurrence_count, 0);
const forbiddenAuthorityFieldHits = scanForbiddenAuthorityKeys({ matrix_rows: matrixRows }).length;

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_a14_phrase_abbrev_pattern_crossmatch_matrix',
  generated_at: new Date().toISOString(),
  status: missingWorkIndexes.length ? 'exact_blocker_missing_target_work_index' : 'evidence_matrix_ready',
  lane: 'A3 crossmatch/linkage/navigation evidence',
  source_artifacts: {
    adoption_packet: INPUT_PACKET,
    project_abbreviations: SOURCE_LAYER,
    target_token_indexes: Object.fromEntries([...workIndexes.entries()].map(([workId, value]) => [workId, value.path])),
  },
  authority_boundary: {
    evidence_navigation_only: true,
    occurrence_navigation_only: true,
    project_authored_source_layer_only: true,
    definition_authority: false,
    accepted_gloss_or_text: false,
    answer_eligibility: false,
    source_license_legal_acceptance: false,
    public_runtime_release_action: false,
    route_mutation: false,
    prehud_authority: false,
  },
  counts: {
    target_work_count: targetWorkIds.length,
    source_entry_count: entries.length,
    matrix_rows: matrixRows.length,
    rows_with_occurrence_evidence: rowsWithOccurrenceEvidence,
    rows_without_occurrence_evidence: matrixRows.length - rowsWithOccurrenceEvidence,
    total_occurrence_count: totalOccurrenceCount,
    rows_with_token_samples: rowsWithTokenSamples,
    missing_token_index_works: missingWorkIndexes.length,
    forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  },
  missing_token_index_works: missingWorkIndexes,
  matrix_rows: matrixRows,
  blocker_shape: 'a3_phrase_abbrev_matrix_blocker | missing_input | work_id | row_field | validator | next_owner | stop_condition',
  stop_condition: 'Matrix validates as evidence/navigation only, or exact missing input/work/field blocker is returned.',
};

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, renderReport(artifact));

console.log(
  `A3 phrase/abbrev matrix ${artifact.status}; rows ${artifact.counts.matrix_rows}; ` +
  `linked ${artifact.counts.rows_with_occurrence_evidence}; occurrences ${artifact.counts.total_occurrence_count}`
);
