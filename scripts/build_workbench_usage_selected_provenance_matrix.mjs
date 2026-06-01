#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  output: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
  report: 'reports/workbench-usage-selected-provenance-matrix.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}

const provenanceRows = buildRows(selectedCards.cards || []);
const checks = buildChecks(provenanceRows);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_provenance_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_provenance_matrix.mjs',
  policy: 'Audit-only selected provenance matrix. It groups selected occurrence cards by version and license metadata for usage navigation and QA; it does not rank routes, select visible answers, translate, copy route payloads, or assert authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
  },
  authority_policy: {
    usage_navigation_only: true,
    audit_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts: buildCounts(provenanceRows),
  checks,
  provenance_rows: provenanceRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected provenance buckets ${artifact.counts.provenance_buckets}; rows ${artifact.counts.selected_rows}; licenses ${artifact.counts.unique_licenses}; missing/unrecognized license rows ${artifact.counts.missing_or_unrecognized_license_rows}`);

function buildRows(cards) {
  const buckets = new Map();
  for (const card of cards) {
    const key = provenanceKey(card);
    if (!buckets.has(key)) {
      buckets.set(key, {
        provenance_id: `selected-provenance-${hashKey(key)}`,
        license: card.license,
        license_url: card.license_url,
        version_title: card.version_title,
        version_source: card.version_source,
        occurrence_ids: new Set(),
        source_refs: new Set(),
        work_anchors: new Set(),
        works: new Set(),
        categories: new Set(),
        usage_frames: new Set(),
        cluster_ids: new Set(),
        route_ids: new Set(),
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        sample_occurrences: [],
      });
    }
    const bucket = buckets.get(key);
    bucket.occurrence_ids.add(card.occurrence_id);
    bucket.source_refs.add(card.source_ref);
    bucket.work_anchors.add(card.work_anchor_href);
    bucket.works.add(card.work_slug || card.work_title);
    bucket.categories.add(card.category);
    bucket.usage_frames.add(card.usage_frame_label);
    bucket.cluster_ids.add(card.cluster_id);
    for (const routeId of card.route_ids || []) bucket.route_ids.add(routeId);
    if (Object.hasOwn(bucket.status_counts, card.status)) bucket.status_counts[card.status] += 1;
    bucket.sample_occurrences.push(sampleForCard(card));
  }
  return [...buckets.values()].map(finalizeBucket).sort(compareRows);
}

function finalizeBucket(bucket) {
  return {
    provenance_id: bucket.provenance_id,
    license: bucket.license,
    license_url: bucket.license_url,
    version_title: bucket.version_title,
    version_source: bucket.version_source,
    selected_occurrence_rows: bucket.occurrence_ids.size,
    unique_source_refs: bucket.source_refs.size,
    unique_work_anchors: bucket.work_anchors.size,
    unique_works: bucket.works.size,
    categories: [...bucket.categories].filter(Boolean).sort(),
    usage_frames: [...bucket.usage_frames].filter(Boolean).sort(),
    cluster_ids: [...bucket.cluster_ids].filter(Boolean).sort(),
    route_ids: [...bucket.route_ids].sort(),
    status_counts: bucket.status_counts,
    provenance_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      license_metadata_present: hasLicenseMetadata(bucket),
      version_metadata_present: hasVersionMetadata(bucket),
      license_recognized_for_selected_lane: isRecognizedLicense(bucket.license, bucket.license_url),
    },
    sample_occurrences: bucket.sample_occurrences.sort(compareSamples),
  };
}

function sampleForCard(card) {
  return {
    occurrence_id: card.occurrence_id,
    candidate_id: card.candidate_id,
    token_key: card.token_key,
    token_surface: card.token_surface,
    token_normalized: card.token_normalized,
    focus_surface: card.focus_surface,
    focus_normalized: card.focus_normalized,
    source_ref: card.source_ref,
    source_href: card.source_href,
    work_anchor_href: card.work_anchor_href,
    work_id: card.work_id,
    work_title: card.work_title,
    work_slug: card.work_slug,
    category: card.category,
    unit_id: card.unit_id,
    status: card.status,
    raw_score: card.raw_score,
    cluster_id: card.cluster_id,
    usage_frame_label: card.usage_frame_label,
    context_focus_marked: card.context_focus_marked,
    route_ids: card.route_ids || [],
    version_title: card.version_title,
    version_source: card.version_source,
    license: card.license,
    license_url: card.license_url,
    sample_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
    },
  };
}

function buildCounts(rows) {
  const licenses = new Set();
  const licenseUrls = new Set();
  const versionTitles = new Set();
  const versionSources = new Set();
  const routeIds = new Set();
  const works = new Set();
  const frames = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let selectedRows = 0;
  let rowsWithLicenseMetadata = 0;
  let rowsWithVersionMetadata = 0;
  let missingOrUnrecognizedLicenseRows = 0;
  let sampleOccurrences = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    selectedRows += row.selected_occurrence_rows;
    sampleOccurrences += row.sample_occurrences.length;
    if (row.license) licenses.add(row.license);
    if (row.license_url) licenseUrls.add(row.license_url);
    if (row.version_title) versionTitles.add(row.version_title);
    if (row.version_source) versionSources.add(row.version_source);
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    for (const frame of row.usage_frames || []) frames.add(frame);
    for (const sample of row.sample_occurrences || []) {
      if (sample.work_slug || sample.work_title) works.add(sample.work_slug || sample.work_title);
      if (hasLicenseMetadata(sample)) rowsWithLicenseMetadata += 1;
      if (hasVersionMetadata(sample)) rowsWithVersionMetadata += 1;
      if (!isRecognizedLicense(sample.license, sample.license_url)) missingOrUnrecognizedLicenseRows += 1;
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    for (const [status, count] of Object.entries(row.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    if (row.provenance_flags?.reader_facing !== false) readerFacingRows += 1;
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    provenance_buckets: rows.length,
    selected_rows: selectedRows,
    unique_licenses: licenses.size,
    unique_license_urls: licenseUrls.size,
    unique_version_titles: versionTitles.size,
    unique_version_sources: versionSources.size,
    unique_works: works.size,
    usage_frames: frames.size,
    unique_route_ids: routeIds.size,
    status_counts: statusCounts,
    rows_with_license_metadata: rowsWithLicenseMetadata,
    rows_with_version_metadata: rowsWithVersionMetadata,
    missing_or_unrecognized_license_rows: missingOrUnrecognizedLicenseRows,
    sample_occurrences: sampleOccurrences,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  const selectedCardCount = Number(selectedCards.counts?.cards || 0);
  return [
    check('provenance_buckets_present', counts.provenance_buckets > 0 ? 'passed' : 'failed', `provenance buckets ${counts.provenance_buckets}`),
    check('selected_rows_complete', counts.selected_rows === selectedCardCount ? 'passed' : 'failed', `provenance rows ${counts.selected_rows}; selected cards ${selectedCardCount}`),
    check('license_metadata_complete', counts.rows_with_license_metadata === counts.selected_rows ? 'passed' : 'failed', `license metadata rows ${counts.rows_with_license_metadata}; selected rows ${counts.selected_rows}`),
    check('version_metadata_complete', counts.rows_with_version_metadata === counts.selected_rows ? 'passed' : 'failed', `version metadata rows ${counts.rows_with_version_metadata}; selected rows ${counts.selected_rows}`),
    check('recognized_license_rows_complete', counts.missing_or_unrecognized_license_rows === 0 ? 'passed' : 'failed', `missing or unrecognized license rows ${counts.missing_or_unrecognized_license_rows}`),
    check('samples_cover_rows', counts.sample_occurrences === counts.selected_rows ? 'passed' : 'failed', `samples ${counts.sample_occurrences}; selected rows ${counts.selected_rows}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('usage_frames_present', counts.usage_frames > 0 ? 'passed' : 'failed', `usage frames ${counts.usage_frames}`),
    check('status_counts_complete', sumStatusCounts(counts.status_counts) === counts.selected_rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; selected rows ${counts.selected_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Provenance Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Selected rows: ${artifact.counts.selected_rows}`,
    `- Licenses: ${artifact.counts.unique_licenses}`,
    `- License URLs: ${artifact.counts.unique_license_urls}`,
    `- Version titles: ${artifact.counts.unique_version_titles}`,
    `- Version sources: ${artifact.counts.unique_version_sources}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Rows with license metadata: ${artifact.counts.rows_with_license_metadata}`,
    `- Rows with version metadata: ${artifact.counts.rows_with_version_metadata}`,
    `- Missing or unrecognized license rows: ${artifact.counts.missing_or_unrecognized_license_rows}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This matrix is a selected usage provenance audit. It preserves source/version/license metadata and clickable occurrence anchors without ranking routes, selecting visible answers, translating, or asserting authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Provenance Buckets',
    '',
    '| provenance | license | version | source | rows | works | frames | supported | candidate | weak | samples |',
    '|---|---|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.provenance_rows.map((row) => `| ${[
      row.provenance_id,
      `${row.license} (${row.license_url})`,
      row.version_title,
      row.version_source,
      row.selected_occurrence_rows,
      row.unique_works,
      row.usage_frames.length,
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.sample_occurrences.slice(0, 5).map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function provenanceKey(card) {
  return [
    card.license || '',
    card.license_url || '',
    card.version_title || '',
    card.version_source || '',
  ].join('||');
}

function hashKey(key) {
  return crypto.createHash('sha1').update(String(key)).digest('hex').slice(0, 16);
}

function compareRows(a, b) {
  return b.selected_occurrence_rows - a.selected_occurrence_rows
    || String(a.license || '').localeCompare(String(b.license || ''))
    || String(a.version_title || '').localeCompare(String(b.version_title || ''));
}

function compareSamples(a, b) {
  return Number(b.raw_score || 0) - Number(a.raw_score || 0)
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true });
}

function hasLicenseMetadata(row) {
  return Boolean(String(row.license || '').trim() && String(row.license_url || '').trim());
}

function hasVersionMetadata(row) {
  return Boolean(String(row.version_title || '').trim() && String(row.version_source || '').trim());
}

function isRecognizedLicense(license, licenseUrl) {
  const normalizedLicense = String(license || '').toLowerCase();
  const normalizedUrl = String(licenseUrl || '').toLowerCase();
  return normalizedLicense === 'cc-by-sa'
    || normalizedLicense === 'public domain'
    || normalizedLicense === 'cc0'
    || normalizedUrl.includes('/licenses/by-sa/')
    || normalizedUrl.includes('/publicdomain/')
    || normalizedUrl.includes('/publicdomain/zero/');
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function countForbiddenKeys(value) {
  const forbidden = new Set([
    'definition',
    'definition_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'english',
    'english_text',
    'english_translation',
    'imported_translation',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_links',
  ]);
  let hits = 0;
  walk(value);
  return hits;

  function walk(current) {
    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, item] of Object.entries(current)) {
      if (forbidden.has(key)) hits += 1;
      walk(item);
    }
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-cards=')) parsed.selectedOccurrenceCards = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function mdLink(label, href) {
  return `[${String(label || '').replace(/\]/g, '\\]')}](${href})`;
}
