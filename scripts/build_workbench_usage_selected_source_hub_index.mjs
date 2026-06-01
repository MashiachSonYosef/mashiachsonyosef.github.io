#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceAdjacencyIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-adjacency-index.json',
  output: '.local-cache/workbench-evidence/usage-selected-source-hub-index.json',
  report: 'reports/workbench-usage-selected-source-hub-index.md',
  maxOccurrencesPerHub: 8,
  maxTargetsPerHub: 8,
};

const options = parseArgs(process.argv.slice(2));
const adjacencyIndex = readJson(options.selectedOccurrenceAdjacencyIndex);

if (adjacencyIndex.artifact_type !== 'workbench_usage_selected_occurrence_adjacency_index') {
  throw new Error(`${options.selectedOccurrenceAdjacencyIndex} is not a selected occurrence adjacency index`);
}

const buckets = new Map();
for (const row of adjacencyIndex.adjacency_rows || []) {
  const source = row.source || {};
  const key = source.source_ref || row.occurrence_id || 'unknown-source-ref';
  if (!buckets.has(key)) {
    buckets.set(key, {
      source_hub_id: `selected-source-hub-${stableHash(key)}`,
      source_ref: source.source_ref || null,
      source_href: source.source_href || null,
      source_rows: [],
    });
  }
  buckets.get(key).source_rows.push(row);
}

const source_hub_rows = [...buckets.values()]
  .sort((left, right) => String(left.source_ref || left.source_hub_id).localeCompare(String(right.source_ref || right.source_hub_id)))
  .map((bucket) => summarizeHub(bucket, options));

const counts = buildCounts(source_hub_rows, adjacencyIndex);
const checks = buildChecks(counts, adjacencyIndex);
const failedCount = checks.filter((check) => check.status !== 'passed').length;

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_source_hub_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_source_hub_index.mjs',
  policy: 'Source-reference hub index for selected usage navigation. It groups observed occurrence rows by source ref with clickable source/work links, marked Hebrew context, adjacency counts, route IDs, and provenance metadata only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_occurrence_adjacency_index: options.selectedOccurrenceAdjacencyIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    reader_facing: false,
    carries_route_payloads: false,
    observed_usage_not_semantic_claim: true,
  },
  quality: {
    status: failedCount === 0 ? 'passed' : 'failed',
    failed_count: failedCount,
    warning_count: 0,
  },
  counts,
  checks,
  source_hub_rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected source hubs ${counts.hubs}; occurrence rows ${counts.occurrence_rows}; target links ${counts.target_links}; route payload hits ${counts.route_payload_field_hits}`);

function summarizeHub(bucket, options) {
  const rows = bucket.source_rows;
  const occurrences = rows
    .slice()
    .sort((left, right) => String(left.occurrence_id).localeCompare(String(right.occurrence_id)))
    .map((row) => summarizeOccurrence(row));
  const targetRows = rows.flatMap((row) => row.target_links || []);
  const sourceRefs = sortedUnique(rows.map((row) => row.source?.source_ref).filter(Boolean));
  const workAnchorHrefs = sortedUnique(rows.map((row) => row.source?.work_anchor_href).filter(Boolean));
  const workTitles = sortedUnique(rows.map((row) => row.source?.work_title).filter(Boolean));
  const workSlugs = sortedUnique(rows.map((row) => row.source?.work_slug).filter(Boolean));
  const usageFrames = sortedUnique(rows.map((row) => row.source?.usage_frame_label).filter(Boolean));
  const clusterIds = sortedUnique(rows.map((row) => row.source?.cluster_id).filter(Boolean));
  const statuses = countBy(rows, (row) => row.source?.status || 'unknown');
  const targetRefs = sortedUnique(targetRows.map((row) => row.target?.source_ref).filter(Boolean));
  const targetWorks = sortedUnique(targetRows.map((row) => row.target?.work_slug).filter(Boolean));
  const targetClusters = sortedUnique(targetRows.map((row) => row.target?.cluster_id).filter(Boolean));
  const targetFrames = sortedUnique(targetRows.map((row) => row.target?.usage_frame_label).filter(Boolean));
  const routeIds = sortedUnique(rows.flatMap((row) => row.shared_route_ids || row.source?.related_route_ids || []));
  const provenanceIds = sortedUnique(rows.map((row) => row.source?.provenance_id).filter(Boolean));
  const targetProvenanceIds = sortedUnique(targetRows.map((row) => row.target?.provenance_id).filter(Boolean));
  const licenses = sortedUnique(rows.map((row) => row.source?.license).filter(Boolean));
  const licenseUrls = sortedUnique(rows.map((row) => row.source?.license_url).filter(Boolean));
  const versionTitles = sortedUnique(rows.map((row) => row.source?.version_title).filter(Boolean));
  const versionSources = sortedUnique(rows.map((row) => row.source?.version_source).filter(Boolean));
  const targetSamples = targetRows
    .slice()
    .sort((left, right) => {
      const score = Number(right.crossmatch_score || 0) - Number(left.crossmatch_score || 0);
      if (score !== 0) return score;
      return String(left.target?.source_ref || '').localeCompare(String(right.target?.source_ref || ''));
    })
    .slice(0, options.maxTargetsPerHub)
    .map((row) => ({
      target_occurrence_id: row.target_occurrence_id,
      link_kind: row.link_kind,
      crossmatch_score: row.crossmatch_score,
      crossmatch_strength: row.crossmatch_strength,
      target_ref: row.target?.source_ref || null,
      target_href: row.target?.source_href || null,
      target_work_anchor_href: row.target?.work_anchor_href || null,
      target_usage_frame_label: row.target?.usage_frame_label || null,
      target_context_focus_marked: row.target?.context_focus_marked || null,
      shared_route_ids: Array.isArray(row.shared_route_ids) ? row.shared_route_ids : [],
    }));

  return {
    source_hub_id: bucket.source_hub_id,
    source_ref: bucket.source_ref,
    source_href: bucket.source_href,
    work_anchor_hrefs: workAnchorHrefs,
    work_titles: workTitles,
    work_slugs: workSlugs,
    usage_frame_labels: usageFrames,
    cluster_ids: clusterIds,
    status_counts: statuses,
    counts: {
      occurrence_rows: rows.length,
      occurrence_samples: Math.min(occurrences.length, options.maxOccurrencesPerHub),
      target_links: sumRows(rows, 'adjacency_counts.target_links'),
      same_frame_links: sumRows(rows, 'adjacency_counts.same_frame_links'),
      bridge_frame_links: sumRows(rows, 'adjacency_counts.bridge_frame_links'),
      strong_links: sumRows(rows, 'adjacency_counts.strong_links'),
      moderate_links: sumRows(rows, 'adjacency_counts.moderate_links'),
      weak_links: sumRows(rows, 'adjacency_counts.weak_links'),
      unique_source_refs: sourceRefs.length,
      unique_work_anchors: workAnchorHrefs.length,
      unique_works: workSlugs.length,
      usage_frames: usageFrames.length,
      source_clusters: clusterIds.length,
      unique_target_refs: targetRefs.length,
      unique_target_works: targetWorks.length,
      unique_target_clusters: targetClusters.length,
      unique_target_frames: targetFrames.length,
      shared_route_ids: routeIds.length,
      provenance_buckets: provenanceIds.length,
      target_provenance_buckets: targetProvenanceIds.length,
      licenses: licenses.length,
      license_urls: licenseUrls.length,
      version_titles: versionTitles.length,
      version_sources: versionSources.length,
    },
    related_route_ids: routeIds,
    provenance: {
      provenance_ids: provenanceIds,
      licenses,
      license_urls: licenseUrls,
      version_titles: versionTitles,
      version_sources: versionSources,
    },
    occurrences: occurrences.slice(0, options.maxOccurrencesPerHub),
    target_samples: targetSamples,
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_source_link: Boolean(bucket.source_href),
      has_work_anchor: workAnchorHrefs.length > 0,
      has_marked_context: occurrences.every((row) => Boolean(row.context_focus_marked)),
      has_provenance: provenanceIds.length > 0 && licenses.length > 0 && licenseUrls.length > 0 && versionSources.length > 0,
      route_ids_only: true,
      target_samples_have_links: targetSamples.every((sample) => sample.target_href && sample.target_work_anchor_href),
      target_samples_have_context: targetSamples.every((sample) => sample.target_context_focus_marked),
    },
  };
}

function summarizeOccurrence(row) {
  const source = row.source || {};
  return {
    occurrence_id: row.occurrence_id,
    source_ref: source.source_ref || null,
    source_href: source.source_href || null,
    work_anchor_href: source.work_anchor_href || null,
    token_surface: source.token_surface || null,
    token_normalized: source.token_normalized || null,
    focus_surface: source.focus_surface || null,
    focus_normalized: source.focus_normalized || null,
    usage_frame_label: source.usage_frame_label || null,
    cluster_id: source.cluster_id || null,
    status: source.status || null,
    raw_score: source.raw_score ?? null,
    context_focus_marked: source.context_focus_marked || null,
    related_route_ids: Array.isArray(source.related_route_ids) ? source.related_route_ids : [],
    provenance_id: source.provenance_id || null,
    version_title: source.version_title || null,
    version_source: source.version_source || null,
    license: source.license || null,
    license_url: source.license_url || null,
  };
}

function buildCounts(rows, adjacencyIndex) {
  const allOccurrences = rows.flatMap((row) => row.occurrences || []);
  const routeIds = sortedUnique(rows.flatMap((row) => row.related_route_ids || []));
  const workAnchors = sortedUnique(rows.flatMap((row) => row.work_anchor_hrefs || []));
  const works = sortedUnique(rows.flatMap((row) => row.work_slugs || []));
  const frames = sortedUnique(rows.flatMap((row) => row.usage_frame_labels || []));
  const clusters = sortedUnique(rows.flatMap((row) => row.cluster_ids || []));
  const provenanceIds = sortedUnique(rows.flatMap((row) => row.provenance?.provenance_ids || []));
  const licenses = sortedUnique(rows.flatMap((row) => row.provenance?.licenses || []));
  const versionSources = sortedUnique(rows.flatMap((row) => row.provenance?.version_sources || []));
  const targetSamples = rows.flatMap((row) => row.target_samples || []);
  return {
    hubs: rows.length,
    occurrence_rows: rows.reduce((sum, row) => sum + Number(row.counts?.occurrence_rows || 0), 0),
    occurrence_samples: allOccurrences.length,
    target_links: rows.reduce((sum, row) => sum + Number(row.counts?.target_links || 0), 0),
    same_frame_links: rows.reduce((sum, row) => sum + Number(row.counts?.same_frame_links || 0), 0),
    bridge_frame_links: rows.reduce((sum, row) => sum + Number(row.counts?.bridge_frame_links || 0), 0),
    strong_links: rows.reduce((sum, row) => sum + Number(row.counts?.strong_links || 0), 0),
    moderate_links: rows.reduce((sum, row) => sum + Number(row.counts?.moderate_links || 0), 0),
    weak_links: rows.reduce((sum, row) => sum + Number(row.counts?.weak_links || 0), 0),
    unique_source_refs: rows.filter((row) => row.source_ref).length,
    unique_work_anchors: workAnchors.length,
    unique_works: works.length,
    usage_frames: frames.length,
    source_clusters: clusters.length,
    unique_route_ids: routeIds.length,
    provenance_buckets: provenanceIds.length,
    licenses: licenses.length,
    version_sources: versionSources.length,
    duplicate_source_ref_hubs: rows.filter((row) => Number(row.counts?.occurrence_rows || 0) > 1).length,
    duplicate_source_ref_occurrence_rows: rows
      .filter((row) => Number(row.counts?.occurrence_rows || 0) > 1)
      .reduce((sum, row) => sum + Number(row.counts?.occurrence_rows || 0), 0),
    rows_with_source_link: rows.filter((row) => row.navigation_flags.has_source_link).length,
    rows_with_work_anchor: rows.filter((row) => row.navigation_flags.has_work_anchor).length,
    rows_with_marked_context: rows.filter((row) => row.navigation_flags.has_marked_context).length,
    rows_with_provenance: rows.filter((row) => row.navigation_flags.has_provenance).length,
    target_samples: targetSamples.length,
    target_samples_with_links: targetSamples.filter((sample) => sample.target_href && sample.target_work_anchor_href).length,
    target_samples_with_context: targetSamples.filter((sample) => sample.target_context_focus_marked).length,
    observed_usage_only_rows: rows.length,
    reader_facing_rows: rows.filter((row) => row.navigation_flags.reader_facing).length,
    route_payload_field_hits: countForbiddenKeys(rows),
    expected_occurrence_rows: Number(adjacencyIndex.counts?.rows || 0),
    expected_target_links: Number(adjacencyIndex.counts?.target_links || 0),
    expected_same_frame_links: Number(adjacencyIndex.counts?.same_frame_links || 0),
    expected_bridge_frame_links: Number(adjacencyIndex.counts?.bridge_frame_links || 0),
    expected_route_ids: Number(adjacencyIndex.counts?.unique_route_ids || 0),
  };
}

function buildChecks(counts) {
  return [
    check('source_hubs_present', counts.hubs > 0, `source hubs ${counts.hubs}`),
    check('occurrence_rows_complete', counts.occurrence_rows === counts.expected_occurrence_rows, `occurrence rows ${counts.occurrence_rows}; expected ${counts.expected_occurrence_rows}`),
    check('target_links_complete', counts.target_links === counts.expected_target_links, `target links ${counts.target_links}; expected ${counts.expected_target_links}`),
    check('link_partition_complete', counts.same_frame_links === counts.expected_same_frame_links && counts.bridge_frame_links === counts.expected_bridge_frame_links, `same/bridge ${counts.same_frame_links}/${counts.bridge_frame_links}; expected ${counts.expected_same_frame_links}/${counts.expected_bridge_frame_links}`),
    check('source_links_complete', counts.rows_with_source_link === counts.hubs, `source links ${counts.rows_with_source_link}; hubs ${counts.hubs}`),
    check('work_anchors_complete', counts.rows_with_work_anchor === counts.hubs, `work anchors ${counts.rows_with_work_anchor}; hubs ${counts.hubs}`),
    check('context_complete', counts.rows_with_marked_context === counts.hubs, `marked context hubs ${counts.rows_with_marked_context}; hubs ${counts.hubs}`),
    check('provenance_complete', counts.rows_with_provenance === counts.hubs, `provenance hubs ${counts.rows_with_provenance}; hubs ${counts.hubs}`),
    check('route_ids_carried_without_payloads', counts.unique_route_ids === counts.expected_route_ids && counts.unique_route_ids > 0, `route IDs ${counts.unique_route_ids}; expected ${counts.expected_route_ids}`),
    check('target_samples_complete', counts.target_samples_with_links === counts.target_samples && counts.target_samples_with_context === counts.target_samples, `target sample links/context ${counts.target_samples_with_links}/${counts.target_samples_with_context}; samples ${counts.target_samples}`),
    check('reader_facing_blocked', counts.reader_facing_rows === 0, `reader-facing rows ${counts.reader_facing_rows}`),
    check('no_route_payload_fields', counts.route_payload_field_hits === 0, `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function sumRows(rows, dottedPath) {
  return rows.reduce((sum, row) => sum + Number(readPath(row, dottedPath) || 0), 0);
}

function readPath(value, dottedPath) {
  return dottedPath.split('.').reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), value);
}

function countBy(values, mapper) {
  const counts = {};
  for (const value of values) {
    const key = mapper(value);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
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

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) hits += 1;
      walk(child);
    }
  }
}

function check(id, passed, detail) {
  return { id, status: passed ? 'passed' : 'failed', detail };
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => String(left).localeCompare(String(right)));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Source Hub Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Source hubs: ${artifact.counts.hubs}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Target links: ${artifact.counts.target_links}`,
    `- Same-frame links: ${artifact.counts.same_frame_links}`,
    `- Bridge-frame links: ${artifact.counts.bridge_frame_links}`,
    `- Source refs: ${artifact.counts.unique_source_refs}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Licenses: ${artifact.counts.licenses}`,
    `- Version sources: ${artifact.counts.version_sources}`,
    `- Duplicate source-ref hubs: ${artifact.counts.duplicate_source_ref_hubs}`,
    `- Duplicate source-ref occurrence rows: ${artifact.counts.duplicate_source_ref_occurrence_rows}`,
    `- Hubs with links/context/provenance: ${artifact.counts.rows_with_source_link}/${artifact.counts.rows_with_marked_context}/${artifact.counts.rows_with_provenance}`,
    `- Target samples with links/context: ${artifact.counts.target_samples_with_links}/${artifact.counts.target_samples_with_context}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${mdCell(row.id)} | ${mdCell(row.status)} | ${mdCell(row.detail)} |`),
    '',
    '## Source Hubs',
    '',
    '| source | frames | occurrences | target links | same-frame | bridge | route IDs | licenses |',
    '|---|---|---:|---:|---:|---:|---:|---:|',
    ...artifact.source_hub_rows.map((row) => `| ${mdCell(mdLink(row.source_ref, row.source_href))} | ${mdCell(row.usage_frame_labels.join('<br>'))} | ${row.counts.occurrence_rows} | ${row.counts.target_links} | ${row.counts.same_frame_links} | ${row.counts.bridge_frame_links} | ${row.counts.shared_route_ids} | ${row.counts.licenses} |`),
    '',
    '## Boundary',
    '',
    'This source hub index is an audit/navigation layer over selected observed usage. It groups links and context for lookup; it does not rank routes, select visible answers, translate, or assert semantic conclusions.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-adjacency-index=')) parsed.selectedOccurrenceAdjacencyIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-occurrences-per-hub=')) parsed.maxOccurrencesPerHub = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-targets-per-hub=')) parsed.maxTargetsPerHub = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${label || href}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
