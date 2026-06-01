#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedCollisionAudit: '.local-cache/workbench-evidence/usage-selected-collision-audit.json',
  selectedProvenanceMatrix: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
  selectedFrameProvenanceMatrix: '.local-cache/workbench-evidence/usage-selected-frame-provenance-matrix.json',
  output: '.local-cache/workbench-evidence/usage-selected-collision-provenance-audit.json',
  report: 'reports/workbench-usage-selected-collision-provenance-audit.md',
};

const options = parseArgs(process.argv.slice(2));
const collisionAudit = readJson(options.selectedCollisionAudit);
const provenanceMatrix = readJson(options.selectedProvenanceMatrix);
const frameProvenanceMatrix = readJson(options.selectedFrameProvenanceMatrix);
if (collisionAudit.artifact_type !== 'workbench_usage_selected_collision_audit') {
  throw new Error(`${options.selectedCollisionAudit} is not a selected collision audit artifact`);
}
if (provenanceMatrix.artifact_type !== 'workbench_usage_selected_provenance_matrix') {
  throw new Error(`${options.selectedProvenanceMatrix} is not a selected provenance matrix artifact`);
}
if (frameProvenanceMatrix.artifact_type !== 'workbench_usage_selected_frame_provenance_matrix') {
  throw new Error(`${options.selectedFrameProvenanceMatrix} is not a selected frame/provenance matrix artifact`);
}

const provenanceByOccurrenceId = buildProvenanceLookup(provenanceMatrix.provenance_rows || []);
const frameProvenanceByOccurrenceId = buildFrameProvenanceLookup(frameProvenanceMatrix.matrix_rows || []);
const collisionRows = (collisionAudit.collision_rows || []).map(buildCollisionProvenanceRow).sort(compareRows);
const checks = buildChecks(collisionRows);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_collision_provenance_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_collision_provenance_audit.mjs',
  policy: 'Audit-only selected collision/provenance audit. It joins duplicate selected source/work-anchor collision buckets to provenance and frame/provenance buckets for QA concentration review; it does not rank routes, select visible answers, translate, copy route payloads, or assert authority.',
  inputs: {
    selected_collision_audit: options.selectedCollisionAudit,
    selected_provenance_matrix: options.selectedProvenanceMatrix,
    selected_frame_provenance_matrix: options.selectedFrameProvenanceMatrix,
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
  counts: buildCounts(collisionRows),
  checks,
  collision_provenance_rows: collisionRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected collision/provenance audit buckets ${artifact.counts.collision_buckets}; rows ${artifact.counts.collision_occurrence_rows}; provenance buckets ${artifact.counts.provenance_buckets}`);

function buildCollisionProvenanceRow(row) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const provenanceIds = new Set();
  const frameProvenanceBucketIds = new Set();
  const licenses = new Set();
  const licenseUrls = new Set();
  const versionTitles = new Set();
  const versionSources = new Set();
  const routeIds = new Set();
  const frames = new Set(row.usage_frames || []);
  const clusters = new Set(row.cluster_ids || []);
  let missingProvenanceRows = 0;
  let missingFrameProvenanceRows = 0;
  const samples = (row.sample_occurrences || []).map((sample) => {
    const provenance = provenanceByOccurrenceId.get(sample.occurrence_id);
    const frameProvenance = frameProvenanceByOccurrenceId.get(sample.occurrence_id);
    if (!provenance) missingProvenanceRows += 1;
    if (!frameProvenance) missingFrameProvenanceRows += 1;
    if (provenance?.provenance_id) provenanceIds.add(provenance.provenance_id);
    if (frameProvenance?.bucket_id) frameProvenanceBucketIds.add(frameProvenance.bucket_id);
    if (provenance?.license || sample.license) licenses.add(provenance?.license || sample.license);
    if (provenance?.license_url || sample.license_url) licenseUrls.add(provenance?.license_url || sample.license_url);
    if (provenance?.version_title) versionTitles.add(provenance.version_title);
    if (provenance?.version_source) versionSources.add(provenance.version_source);
    if (Object.hasOwn(statusCounts, sample.status)) statusCounts[sample.status] += 1;
    for (const routeId of sample.route_ids || []) routeIds.add(routeId);
    if (sample.usage_frame_label) frames.add(sample.usage_frame_label);
    if (sample.cluster_id) clusters.add(sample.cluster_id);
    return {
      occurrence_id: sample.occurrence_id,
      provenance_id: provenance?.provenance_id || null,
      frame_provenance_bucket_id: frameProvenance?.bucket_id || null,
      token_key: provenance?.token_key || null,
      token_surface: provenance?.token_surface || null,
      token_normalized: provenance?.token_normalized || null,
      focus_surface: provenance?.focus_surface || null,
      focus_normalized: provenance?.focus_normalized || null,
      source_ref: sample.source_ref,
      source_href: sample.source_href,
      work_anchor_href: sample.work_anchor_href,
      work_title: sample.work_title,
      work_slug: sample.work_slug,
      status: sample.status,
      raw_score: sample.raw_score,
      cluster_id: sample.cluster_id,
      usage_frame_label: sample.usage_frame_label,
      context_focus_marked: sample.context_focus_marked,
      route_ids: sample.route_ids || [],
      license: provenance?.license || sample.license,
      license_url: provenance?.license_url || sample.license_url,
      version_title: provenance?.version_title || null,
      version_source: provenance?.version_source || null,
      sample_flags: {
        observed_usage_only: true,
        reader_facing: false,
        audit_only: true,
        has_provenance: Boolean(provenance),
        has_frame_provenance_bucket: Boolean(frameProvenance),
      },
    };
  }).sort(compareSamples);
  return {
    collision_id: row.collision_id,
    collision_kind: row.collision_kind,
    collision_key: row.collision_key,
    selected_occurrence_rows: row.selected_occurrence_rows,
    unique_source_refs: row.unique_source_refs,
    unique_work_anchors: row.unique_work_anchors,
    unique_works: row.unique_works,
    usage_frames: [...frames].sort(),
    cluster_ids: [...clusters].sort(),
    provenance_ids: [...provenanceIds].sort(),
    frame_provenance_bucket_ids: [...frameProvenanceBucketIds].sort(),
    route_ids: [...routeIds].sort(),
    license_keys: [...licenses].sort(),
    license_urls: [...licenseUrls].sort(),
    version_titles: [...versionTitles].sort(),
    version_sources: [...versionSources].sort(),
    status_counts: statusCounts,
    raw_score_summary: row.raw_score_summary,
    collision_provenance_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      duplicate_selected_bucket: true,
      cross_frame_collision: row.collision_flags?.cross_frame_collision === true,
      repeated_source_ref: row.collision_kind === 'source_ref',
      repeated_work_anchor: row.collision_kind === 'work_anchor',
      cross_provenance_collision: provenanceIds.size > 1,
      cross_license_collision: licenses.size > 1 || licenseUrls.size > 1,
      missing_provenance_rows: missingProvenanceRows,
      missing_frame_provenance_rows: missingFrameProvenanceRows,
    },
    sample_occurrences: samples,
  };
}

function buildProvenanceLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    for (const sample of row.sample_occurrences || []) {
      lookup.set(sample.occurrence_id, {
        provenance_id: row.provenance_id,
        license: row.license,
        license_url: row.license_url,
        version_title: row.version_title,
        version_source: row.version_source,
        token_key: sample.token_key,
        token_surface: sample.token_surface,
        token_normalized: sample.token_normalized,
        focus_surface: sample.focus_surface,
        focus_normalized: sample.focus_normalized,
      });
    }
  }
  return lookup;
}

function buildFrameProvenanceLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    for (const sample of row.sample_occurrences || []) {
      lookup.set(sample.occurrence_id, {
        bucket_id: row.bucket_id,
        frame_id: row.frame_id,
        provenance_id: row.provenance_id,
      });
    }
  }
  return lookup;
}

function buildCounts(rows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const provenanceIds = new Set();
  const frameProvenanceBucketIds = new Set();
  const licenses = new Set();
  const licenseUrls = new Set();
  const versionTitles = new Set();
  const versionSources = new Set();
  const routeIds = new Set();
  let collisionOccurrenceRows = 0;
  let sourceBuckets = 0;
  let sourceRows = 0;
  let anchorBuckets = 0;
  let anchorRows = 0;
  let crossFrameBuckets = 0;
  let crossFrameRows = 0;
  let crossProvenanceBuckets = 0;
  let crossLicenseBuckets = 0;
  let missingProvenanceRows = 0;
  let missingFrameProvenanceRows = 0;
  let sampleRows = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    collisionOccurrenceRows += row.selected_occurrence_rows;
    sampleRows += row.sample_occurrences.length;
    if (row.collision_kind === 'source_ref') {
      sourceBuckets += 1;
      sourceRows += row.selected_occurrence_rows;
    }
    if (row.collision_kind === 'work_anchor') {
      anchorBuckets += 1;
      anchorRows += row.selected_occurrence_rows;
    }
    if (row.collision_provenance_flags.cross_frame_collision) {
      crossFrameBuckets += 1;
      crossFrameRows += row.selected_occurrence_rows;
    }
    if (row.collision_provenance_flags.cross_provenance_collision) crossProvenanceBuckets += 1;
    if (row.collision_provenance_flags.cross_license_collision) crossLicenseBuckets += 1;
    missingProvenanceRows += row.collision_provenance_flags.missing_provenance_rows;
    missingFrameProvenanceRows += row.collision_provenance_flags.missing_frame_provenance_rows;
    if (row.collision_provenance_flags.reader_facing !== false) readerFacingRows += 1;
    for (const [status, count] of Object.entries(row.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    for (const provenanceId of row.provenance_ids || []) provenanceIds.add(provenanceId);
    for (const bucketId of row.frame_provenance_bucket_ids || []) frameProvenanceBucketIds.add(bucketId);
    for (const license of row.license_keys || []) licenses.add(license);
    for (const licenseUrl of row.license_urls || []) licenseUrls.add(licenseUrl);
    for (const versionTitle of row.version_titles || []) versionTitles.add(versionTitle);
    for (const versionSource of row.version_sources || []) versionSources.add(versionSource);
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    for (const sample of row.sample_occurrences || []) {
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    collision_buckets: rows.length,
    collision_occurrence_rows: collisionOccurrenceRows,
    duplicate_source_ref_buckets: sourceBuckets,
    duplicate_source_ref_rows: sourceRows,
    duplicate_work_anchor_buckets: anchorBuckets,
    duplicate_work_anchor_rows: anchorRows,
    cross_frame_collision_buckets: crossFrameBuckets,
    cross_frame_collision_rows: crossFrameRows,
    cross_provenance_collision_buckets: crossProvenanceBuckets,
    cross_license_collision_buckets: crossLicenseBuckets,
    provenance_buckets: provenanceIds.size,
    frame_provenance_buckets: frameProvenanceBucketIds.size,
    unique_licenses: licenses.size,
    unique_license_urls: licenseUrls.size,
    unique_version_titles: versionTitles.size,
    unique_version_sources: versionSources.size,
    unique_route_ids: routeIds.size,
    status_counts: statusCounts,
    missing_provenance_rows: missingProvenanceRows,
    missing_frame_provenance_rows: missingFrameProvenanceRows,
    sample_occurrences: sampleRows,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('collision_rows_present', counts.collision_buckets > 0 ? 'passed' : 'failed', `collision buckets ${counts.collision_buckets}`),
    check('collision_counts_match', counts.collision_buckets === Number(collisionAudit.counts?.collision_buckets || 0) && counts.collision_occurrence_rows === Number(collisionAudit.counts?.collision_occurrence_rows || 0) ? 'passed' : 'failed', `joined ${counts.collision_buckets}/${counts.collision_occurrence_rows}; collision audit ${collisionAudit.counts?.collision_buckets}/${collisionAudit.counts?.collision_occurrence_rows}`),
    check('source_ref_collision_counts_match', counts.duplicate_source_ref_buckets === Number(collisionAudit.counts?.duplicate_source_ref_buckets || 0) && counts.duplicate_source_ref_rows === Number(collisionAudit.counts?.duplicate_source_ref_rows || 0) ? 'passed' : 'failed', `joined ${counts.duplicate_source_ref_buckets}/${counts.duplicate_source_ref_rows}; collision audit ${collisionAudit.counts?.duplicate_source_ref_buckets}/${collisionAudit.counts?.duplicate_source_ref_rows}`),
    check('work_anchor_collision_counts_match', counts.duplicate_work_anchor_buckets === Number(collisionAudit.counts?.duplicate_work_anchor_buckets || 0) && counts.duplicate_work_anchor_rows === Number(collisionAudit.counts?.duplicate_work_anchor_rows || 0) ? 'passed' : 'failed', `joined ${counts.duplicate_work_anchor_buckets}/${counts.duplicate_work_anchor_rows}; collision audit ${collisionAudit.counts?.duplicate_work_anchor_buckets}/${collisionAudit.counts?.duplicate_work_anchor_rows}`),
    check('cross_frame_collisions_preserved', counts.cross_frame_collision_buckets === Number(collisionAudit.counts?.cross_frame_collision_buckets || 0) ? 'warning' : 'failed', `joined ${counts.cross_frame_collision_buckets}; collision audit ${collisionAudit.counts?.cross_frame_collision_buckets}`),
    check('samples_cover_collisions', counts.sample_occurrences === counts.collision_occurrence_rows ? 'passed' : 'failed', `samples ${counts.sample_occurrences}; collision rows ${counts.collision_occurrence_rows}`),
    check('provenance_present_for_each_sample', counts.missing_provenance_rows === 0 ? 'passed' : 'failed', `missing provenance rows ${counts.missing_provenance_rows}`),
    check('frame_provenance_present_for_each_sample', counts.missing_frame_provenance_rows === 0 ? 'passed' : 'failed', `missing frame/provenance rows ${counts.missing_frame_provenance_rows}`),
    check('license_metadata_complete', counts.unique_licenses > 0 && counts.unique_license_urls > 0 ? 'passed' : 'failed', `licenses ${counts.unique_licenses}; license URLs ${counts.unique_license_urls}`),
    check('version_metadata_complete', counts.unique_version_titles > 0 && counts.unique_version_sources > 0 ? 'passed' : 'failed', `version titles ${counts.unique_version_titles}; version sources ${counts.unique_version_sources}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Collision Provenance Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Collision buckets: ${artifact.counts.collision_buckets}`,
    `- Collision occurrence rows: ${artifact.counts.collision_occurrence_rows}`,
    `- Duplicate source-ref buckets: ${artifact.counts.duplicate_source_ref_buckets}`,
    `- Duplicate source-ref rows: ${artifact.counts.duplicate_source_ref_rows}`,
    `- Duplicate work-anchor buckets: ${artifact.counts.duplicate_work_anchor_buckets}`,
    `- Duplicate work-anchor rows: ${artifact.counts.duplicate_work_anchor_rows}`,
    `- Cross-frame collision buckets: ${artifact.counts.cross_frame_collision_buckets}`,
    `- Cross-frame collision rows: ${artifact.counts.cross_frame_collision_rows}`,
    `- Cross-provenance collision buckets: ${artifact.counts.cross_provenance_collision_buckets}`,
    `- Cross-license collision buckets: ${artifact.counts.cross_license_collision_buckets}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Frame/provenance buckets: ${artifact.counts.frame_provenance_buckets}`,
    `- Licenses: ${artifact.counts.unique_licenses}`,
    `- License URLs: ${artifact.counts.unique_license_urls}`,
    `- Version titles: ${artifact.counts.unique_version_titles}`,
    `- Version sources: ${artifact.counts.unique_version_sources}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Missing provenance rows: ${artifact.counts.missing_provenance_rows}`,
    `- Missing frame/provenance rows: ${artifact.counts.missing_frame_provenance_rows}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This audit joins duplicate selected occurrence buckets to provenance and frame/provenance metadata for QA concentration review. It preserves observed usage links, Hebrew snippets, route IDs, raw score/status, version, and license fields only; it does not rank routes, select visible answers, translate, or assert authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Collision Provenance Buckets',
    '',
    '| kind | key | rows | frames | provenance buckets | licenses | supported | candidate | weak | samples |',
    '|---|---|---:|---|---:|---:|---:|---:|---:|---|',
    ...artifact.collision_provenance_rows.map((row) => `| ${[
      row.collision_kind,
      row.collision_key,
      row.selected_occurrence_rows,
      row.usage_frames.join('<br>'),
      row.provenance_ids.length,
      row.license_keys.length,
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.sample_occurrences.slice(0, 5).map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareRows(a, b) {
  return String(a.collision_kind || '').localeCompare(String(b.collision_kind || ''))
    || b.selected_occurrence_rows - a.selected_occurrence_rows
    || String(a.collision_key || '').localeCompare(String(b.collision_key || ''), undefined, { numeric: true });
}

function compareSamples(a, b) {
  return Number(b.raw_score || 0) - Number(a.raw_score || 0)
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
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
    if (arg.startsWith('--selected-collision-audit=')) parsed.selectedCollisionAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-provenance-matrix=')) parsed.selectedProvenanceMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-frame-provenance-matrix=')) parsed.selectedFrameProvenanceMatrix = cleanRelativePath(valueAfterEquals(arg));
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
