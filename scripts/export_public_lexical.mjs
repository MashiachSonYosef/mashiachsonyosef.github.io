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

function abs(rel) {
  return path.join(root, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeText(rel, text) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf8');
}

function writeJson(rel, value) {
  writeText(rel, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(rel, rows) {
  const text = rows.map((row) => JSON.stringify(row)).join('\n');
  writeText(rel, text ? `${text}\n` : '');
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

function makeClaim({ work, token, status, hebrewForm, renderings, breakdown, candidate, sourceRow }) {
  return {
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
    confidence: null,
    confidence_note: 'HUD confidence is computed in-browser from token/context evidence; it is not persisted in this static export.',
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
    confidence: null,
    confidence_note: 'HUD confidence is computed in-browser from token/context evidence; it is not persisted in this static export.',
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
  row.claim_id = stableId('claim', [
    row.status,
    row.hebrew_lemma_or_form,
    row.strict_renderings.join('|'),
    row.source_name,
    row.source_id,
    row.license,
  ].join('\u001f'));
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

  return { work, tokenIndex, entryById, sourceRowsByKey };
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

  const { work, tokenIndex, entryById, sourceRowsByKey } = loadWorkExportContext(spec);
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

  return { spec, work, rows, skipped };
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

writeJsonl('data/public-lexical/all-claims.jsonl', allRows);

for (const result of workResults) {
  if (!result.rows.length && result.skipped.missing_work_files) continue;
  writeJsonl(`data/public-lexical/by-work/${result.spec.work_id}.jsonl`, result.rows);
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

  return {
    claims,
    lookup_terms: lookup.size,
    work_rows: workRows,
    diagnostics,
  };
}

const sitewideCompact = buildSitewideCompactExport();

const manifest = {
  schema_version: 1,
  generated_at: generatedAt,
  title: 'Public lexical HUD claim export',
  scope: 'Claim-shaped lexical options derived from existing HUD rows. These are lexical options, not translations.',
  prompt: 'prompts/use-lexical-workbench.md',
  reports: ['reports/public-lexical-export-report.md'],
  files: [
    { path: 'data/public-lexical/all-claims.jsonl', row_count: allRows.length, bytes: fileSize('data/public-lexical/all-claims.jsonl') },
    ...workResults
      .filter((result) => result.rows.length || !result.skipped.missing_work_files)
      .map((result) => ({
        path: `data/public-lexical/by-work/${result.spec.work_id}.jsonl`,
        work_id: result.spec.work_id,
        row_count: result.rows.length,
        bytes: fileSize(`data/public-lexical/by-work/${result.spec.work_id}.jsonl`),
      })),
    ...Object.entries(licenseFiles).map(([bucket, rel]) => ({
      path: rel,
      license_bucket: bucket,
      row_count: byLicenseRows[bucket].length,
      bytes: fileSize(rel),
    })),
    { path: 'data/public-lexical/sitewide/claim-index.jsonl', row_count: sitewideCompact.claims.length, bytes: fileSize('data/public-lexical/sitewide/claim-index.jsonl') },
    { path: 'data/public-lexical/sitewide/normalized-lookup.json', row_count: sitewideCompact.lookup_terms, bytes: fileSize('data/public-lexical/sitewide/normalized-lookup.json') },
    { path: 'data/public-lexical/sitewide/work-summary.jsonl', row_count: sitewideCompact.work_rows.length, bytes: fileSize('data/public-lexical/sitewide/work-summary.jsonl') },
  ],
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
  `| data/public-lexical/sitewide/normalized-lookup.json | ${sitewideCompact.lookup_terms} | Normalized Hebrew form to claim ID lookup |`,
  `| data/public-lexical/sitewide/work-summary.jsonl | ${sitewideCompact.work_rows.length} | Per-work compact-export coverage summary |`,
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
  'The public library now keeps Talmud / Commentary out of the normal visible category list. Those works remain direct-linkable through an internal archive shelf labeled `Internal archive / not public-featured yet`.',
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
}, null, 2));
