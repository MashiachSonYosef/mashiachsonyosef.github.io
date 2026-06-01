#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceAdjacencyIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-adjacency-index.json',
  output: '.local-cache/workbench-evidence/usage-selected-work-hub-index.json',
  report: 'reports/workbench-usage-selected-work-hub-index.md',
  maxOccurrencesPerWork: 12,
  maxTargetWorksPerWork: 8,
};

const options = parseArgs(process.argv.slice(2));
const adjacencyIndex = readJson(options.selectedOccurrenceAdjacencyIndex);

if (adjacencyIndex.artifact_type !== 'workbench_usage_selected_occurrence_adjacency_index') {
  throw new Error(`${options.selectedOccurrenceAdjacencyIndex} is not a selected occurrence adjacency index`);
}

const buckets = new Map();
for (const row of adjacencyIndex.adjacency_rows || []) {
  const source = row.source || {};
  const key = source.work_slug || source.work_title || 'unknown-work';
  if (!buckets.has(key)) {
    buckets.set(key, {
      work_hub_id: `selected-work-hub-${stableHash(key)}`,
      work_slug: source.work_slug || null,
      work_title: source.work_title || null,
      source_rows: [],
    });
  }
  buckets.get(key).source_rows.push(row);
}

const work_hub_rows = [...buckets.values()]
  .sort((left, right) => String(left.work_slug || left.work_title || left.work_hub_id).localeCompare(String(right.work_slug || right.work_title || right.work_hub_id)))
  .map((bucket) => summarizeHub(bucket, options));

const counts = buildCounts(work_hub_rows, adjacencyIndex);
const checks = buildChecks(counts, adjacencyIndex);
const failedCount = checks.filter((check) => check.status !== 'passed').length;

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_work_hub_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_work_hub_index.mjs',
  policy: 'Work-level hub index for selected usage navigation. It groups observed occurrence rows by work with source refs, marked Hebrew context samples, adjacency counts, route IDs, and provenance metadata only; it does not rank routes, select visible answers, translate, or make meaning claims.',
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
  work_hub_rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected work hubs ${counts.hubs}; occurrence rows ${counts.occurrence_rows}; target links ${counts.target_links}; route payload hits ${counts.route_payload_field_hits}`);

function summarizeHub(bucket, options) {
  const rows = bucket.source_rows;
  const targetRows = rows.flatMap((row) => row.target_links || []);
  const sourceRefs = sortedUnique(rows.map((row) => row.source?.source_ref).filter(Boolean));
  const sourceHrefs = sortedUnique(rows.map((row) => row.source?.source_href).filter(Boolean));
  const workAnchorHrefs = sortedUnique(rows.map((row) => row.source?.work_anchor_href).filter(Boolean));
  const usageFrames = sortedUnique(rows.map((row) => row.source?.usage_frame_label).filter(Boolean));
  const clusterIds = sortedUnique(rows.map((row) => row.source?.cluster_id).filter(Boolean));
  const statuses = countBy(rows, (row) => row.source?.status || 'unknown');
  const routeIds = sortedUnique(rows.flatMap((row) => row.shared_route_ids || row.source?.related_route_ids || []));
  const provenanceIds = sortedUnique(rows.map((row) => row.source?.provenance_id).filter(Boolean));
  const licenses = sortedUnique(rows.map((row) => row.source?.license).filter(Boolean));
  const licenseUrls = sortedUnique(rows.map((row) => row.source?.license_url).filter(Boolean));
  const versionTitles = sortedUnique(rows.map((row) => row.source?.version_title).filter(Boolean));
  const versionSources = sortedUnique(rows.map((row) => row.source?.version_source).filter(Boolean));
  const targetWorks = [...groupTargetsByWork(targetRows).values()]
    .sort((left, right) => {
      const count = right.counts.target_links - left.counts.target_links;
      if (count !== 0) return count;
      return String(left.work_slug || left.work_title).localeCompare(String(right.work_slug || right.work_title));
    })
    .slice(0, options.maxTargetWorksPerWork);

  const occurrences = rows
    .slice()
    .sort((left, right) => String(left.source?.source_ref || '').localeCompare(String(right.source?.source_ref || '')))
    .slice(0, options.maxOccurrencesPerWork)
    .map((row) => ({
      occurrence_id: row.occurrence_id,
      source_ref: row.source?.source_ref || null,
      source_href: row.source?.source_href || null,
      work_anchor_href: row.source?.work_anchor_href || null,
      token_surface: row.source?.token_surface || null,
      token_normalized: row.source?.token_normalized || null,
      focus_surface: row.source?.focus_surface || null,
      focus_normalized: row.source?.focus_normalized || null,
      usage_frame_label: row.source?.usage_frame_label || null,
      cluster_id: row.source?.cluster_id || null,
      status: row.source?.status || null,
      raw_score: row.source?.raw_score ?? null,
      context_focus_marked: row.source?.context_focus_marked || null,
      related_route_ids: Array.isArray(row.source?.related_route_ids) ? row.source.related_route_ids : [],
      provenance_id: row.source?.provenance_id || null,
      version_title: row.source?.version_title || null,
      version_source: row.source?.version_source || null,
      license: row.source?.license || null,
      license_url: row.source?.license_url || null,
    }));

  return {
    work_hub_id: bucket.work_hub_id,
    work_slug: bucket.work_slug,
    work_title: bucket.work_title,
    source_refs: sourceRefs,
    source_hrefs: sourceHrefs,
    work_anchor_hrefs: workAnchorHrefs,
    usage_frame_labels: usageFrames,
    cluster_ids: clusterIds,
    status_counts: statuses,
    counts: {
      occurrence_rows: rows.length,
      occurrence_samples: occurrences.length,
      source_refs: sourceRefs.length,
      source_hrefs: sourceHrefs.length,
      work_anchors: workAnchorHrefs.length,
      target_links: sumRows(rows, 'adjacency_counts.target_links'),
      same_frame_links: sumRows(rows, 'adjacency_counts.same_frame_links'),
      bridge_frame_links: sumRows(rows, 'adjacency_counts.bridge_frame_links'),
      strong_links: sumRows(rows, 'adjacency_counts.strong_links'),
      moderate_links: sumRows(rows, 'adjacency_counts.moderate_links'),
      weak_links: sumRows(rows, 'adjacency_counts.weak_links'),
      usage_frames: usageFrames.length,
      source_clusters: clusterIds.length,
      shared_route_ids: routeIds.length,
      provenance_buckets: provenanceIds.length,
      licenses: licenses.length,
      license_urls: licenseUrls.length,
      version_titles: versionTitles.length,
      version_sources: versionSources.length,
      target_work_samples: targetWorks.length,
    },
    related_route_ids: routeIds,
    provenance: {
      provenance_ids: provenanceIds,
      licenses,
      license_urls: licenseUrls,
      version_titles: versionTitles,
      version_sources: versionSources,
    },
    occurrences,
    target_work_samples: targetWorks,
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_source_refs: sourceRefs.length > 0,
      has_source_links: sourceHrefs.length === sourceRefs.length,
      has_work_anchors: workAnchorHrefs.length === sourceRefs.length,
      has_marked_context: occurrences.every((row) => Boolean(row.context_focus_marked)),
      has_provenance: provenanceIds.length > 0 && licenses.length > 0 && licenseUrls.length > 0 && versionSources.length > 0,
      route_ids_only: true,
      target_work_samples_have_links: targetWorks.every((row) => row.sample_target_href && row.sample_target_work_anchor_href),
      target_work_samples_have_context: targetWorks.every((row) => row.sample_target_context_focus_marked),
    },
  };
}

function groupTargetsByWork(targetRows) {
  const buckets = new Map();
  for (const row of targetRows) {
    const target = row.target || {};
    const key = target.work_slug || target.work_title || 'unknown-target-work';
    if (!buckets.has(key)) {
      buckets.set(key, {
        work_slug: target.work_slug || null,
        work_title: target.work_title || null,
        counts: {
          target_links: 0,
          same_frame_links: 0,
          bridge_frame_links: 0,
          strong_links: 0,
          moderate_links: 0,
          weak_links: 0,
          target_refs: 0,
        },
        target_refs_seen: new Set(),
        sample_target_ref: null,
        sample_target_href: null,
        sample_target_work_anchor_href: null,
        sample_target_context_focus_marked: null,
      });
    }
    const bucket = buckets.get(key);
    bucket.counts.target_links += 1;
    if (row.link_kind === 'same_frame') bucket.counts.same_frame_links += 1;
    if (row.link_kind === 'bridge_frame') bucket.counts.bridge_frame_links += 1;
    if (row.crossmatch_strength === 'strong') bucket.counts.strong_links += 1;
    if (row.crossmatch_strength === 'moderate') bucket.counts.moderate_links += 1;
    if (row.crossmatch_strength === 'weak') bucket.counts.weak_links += 1;
    if (target.source_ref) bucket.target_refs_seen.add(target.source_ref);
    if (!bucket.sample_target_ref) {
      bucket.sample_target_ref = target.source_ref || null;
      bucket.sample_target_href = target.source_href || null;
      bucket.sample_target_work_anchor_href = target.work_anchor_href || null;
      bucket.sample_target_context_focus_marked = target.context_focus_marked || null;
    }
  }
  for (const bucket of buckets.values()) {
    bucket.counts.target_refs = bucket.target_refs_seen.size;
    delete bucket.target_refs_seen;
  }
  return buckets;
}

function buildCounts(rows, adjacencyIndex) {
  const allOccurrences = rows.flatMap((row) => row.occurrences || []);
  const sourceRefs = sortedUnique(rows.flatMap((row) => row.source_refs || []));
  const workAnchors = sortedUnique(rows.flatMap((row) => row.work_anchor_hrefs || []));
  const frames = sortedUnique(rows.flatMap((row) => row.usage_frame_labels || []));
  const clusters = sortedUnique(rows.flatMap((row) => row.cluster_ids || []));
  const routeIds = sortedUnique(rows.flatMap((row) => row.related_route_ids || []));
  const provenanceIds = sortedUnique(rows.flatMap((row) => row.provenance?.provenance_ids || []));
  const licenses = sortedUnique(rows.flatMap((row) => row.provenance?.licenses || []));
  const versionSources = sortedUnique(rows.flatMap((row) => row.provenance?.version_sources || []));
  const targetWorkSamples = rows.flatMap((row) => row.target_work_samples || []);
  return {
    hubs: rows.length,
    occurrence_rows: rows.reduce((sum, row) => sum + Number(row.counts?.occurrence_rows || 0), 0),
    occurrence_samples: allOccurrences.length,
    source_refs: sourceRefs.length,
    work_anchors: workAnchors.length,
    target_links: rows.reduce((sum, row) => sum + Number(row.counts?.target_links || 0), 0),
    same_frame_links: rows.reduce((sum, row) => sum + Number(row.counts?.same_frame_links || 0), 0),
    bridge_frame_links: rows.reduce((sum, row) => sum + Number(row.counts?.bridge_frame_links || 0), 0),
    strong_links: rows.reduce((sum, row) => sum + Number(row.counts?.strong_links || 0), 0),
    moderate_links: rows.reduce((sum, row) => sum + Number(row.counts?.moderate_links || 0), 0),
    weak_links: rows.reduce((sum, row) => sum + Number(row.counts?.weak_links || 0), 0),
    usage_frames: frames.length,
    source_clusters: clusters.length,
    unique_route_ids: routeIds.length,
    provenance_buckets: provenanceIds.length,
    licenses: licenses.length,
    version_sources: versionSources.length,
    rows_with_source_refs: rows.filter((row) => row.navigation_flags.has_source_refs).length,
    rows_with_source_links: rows.filter((row) => row.navigation_flags.has_source_links).length,
    rows_with_work_anchors: rows.filter((row) => row.navigation_flags.has_work_anchors).length,
    rows_with_marked_context: rows.filter((row) => row.navigation_flags.has_marked_context).length,
    rows_with_provenance: rows.filter((row) => row.navigation_flags.has_provenance).length,
    target_work_samples: targetWorkSamples.length,
    target_work_samples_with_links: targetWorkSamples.filter((row) => row.sample_target_href && row.sample_target_work_anchor_href).length,
    target_work_samples_with_context: targetWorkSamples.filter((row) => row.sample_target_context_focus_marked).length,
    observed_usage_only_rows: rows.length,
    reader_facing_rows: rows.filter((row) => row.navigation_flags.reader_facing).length,
    route_payload_field_hits: countForbiddenKeys(rows),
    expected_occurrence_rows: Number(adjacencyIndex.counts?.rows || 0),
    expected_source_refs: Number(adjacencyIndex.counts?.unique_source_refs || 0),
    expected_works: Number(adjacencyIndex.counts?.unique_works || 0),
    expected_target_links: Number(adjacencyIndex.counts?.target_links || 0),
    expected_same_frame_links: Number(adjacencyIndex.counts?.same_frame_links || 0),
    expected_bridge_frame_links: Number(adjacencyIndex.counts?.bridge_frame_links || 0),
    expected_route_ids: Number(adjacencyIndex.counts?.unique_route_ids || 0),
  };
}

function buildChecks(counts) {
  return [
    check('work_hubs_present', counts.hubs > 0, `work hubs ${counts.hubs}`),
    check('work_hubs_match_expected', counts.hubs === counts.expected_works, `work hubs ${counts.hubs}; expected ${counts.expected_works}`),
    check('occurrence_rows_complete', counts.occurrence_rows === counts.expected_occurrence_rows, `occurrence rows ${counts.occurrence_rows}; expected ${counts.expected_occurrence_rows}`),
    check('source_refs_complete', counts.source_refs === counts.expected_source_refs, `source refs ${counts.source_refs}; expected ${counts.expected_source_refs}`),
    check('target_links_complete', counts.target_links === counts.expected_target_links, `target links ${counts.target_links}; expected ${counts.expected_target_links}`),
    check('link_partition_complete', counts.same_frame_links === counts.expected_same_frame_links && counts.bridge_frame_links === counts.expected_bridge_frame_links, `same/bridge ${counts.same_frame_links}/${counts.bridge_frame_links}; expected ${counts.expected_same_frame_links}/${counts.expected_bridge_frame_links}`),
    check('strength_partition_complete', counts.strong_links + counts.moderate_links + counts.weak_links === counts.target_links, `strong/moderate/weak ${counts.strong_links}/${counts.moderate_links}/${counts.weak_links}; target links ${counts.target_links}`),
    check('source_refs_and_links_complete', counts.rows_with_source_refs === counts.hubs && counts.rows_with_source_links === counts.hubs, `source refs/links ${counts.rows_with_source_refs}/${counts.rows_with_source_links}; hubs ${counts.hubs}`),
    check('work_anchors_complete', counts.rows_with_work_anchors === counts.hubs, `work anchor rows ${counts.rows_with_work_anchors}; hubs ${counts.hubs}`),
    check('context_complete', counts.rows_with_marked_context === counts.hubs, `marked context rows ${counts.rows_with_marked_context}; hubs ${counts.hubs}`),
    check('provenance_complete', counts.rows_with_provenance === counts.hubs, `provenance rows ${counts.rows_with_provenance}; hubs ${counts.hubs}`),
    check('route_ids_carried_without_payloads', counts.unique_route_ids === counts.expected_route_ids && counts.unique_route_ids > 0, `route IDs ${counts.unique_route_ids}; expected ${counts.expected_route_ids}`),
    check('target_work_samples_complete', counts.target_work_samples_with_links === counts.target_work_samples && counts.target_work_samples_with_context === counts.target_work_samples, `target work sample links/context ${counts.target_work_samples_with_links}/${counts.target_work_samples_with_context}; samples ${counts.target_work_samples}`),
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
    '# Workbench Usage Selected Work Hub Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Work hubs: ${artifact.counts.hubs}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Source refs: ${artifact.counts.source_refs}`,
    `- Target links: ${artifact.counts.target_links}`,
    `- Same-frame links: ${artifact.counts.same_frame_links}`,
    `- Bridge-frame links: ${artifact.counts.bridge_frame_links}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Licenses: ${artifact.counts.licenses}`,
    `- Version sources: ${artifact.counts.version_sources}`,
    `- Work hubs with source links/context/provenance: ${artifact.counts.rows_with_source_links}/${artifact.counts.rows_with_marked_context}/${artifact.counts.rows_with_provenance}`,
    `- Target work samples with links/context: ${artifact.counts.target_work_samples_with_links}/${artifact.counts.target_work_samples_with_context}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${mdCell(row.id)} | ${mdCell(row.status)} | ${mdCell(row.detail)} |`),
    '',
    '## Work Hubs',
    '',
    '| work | frames | occurrences | source refs | target links | same-frame | bridge | route IDs |',
    '|---|---|---:|---:|---:|---:|---:|---:|',
    ...artifact.work_hub_rows.map((row) => `| ${mdCell(row.work_title || row.work_slug)} | ${mdCell(row.usage_frame_labels.join('<br>'))} | ${row.counts.occurrence_rows} | ${row.counts.source_refs} | ${row.counts.target_links} | ${row.counts.same_frame_links} | ${row.counts.bridge_frame_links} | ${row.counts.shared_route_ids} |`),
    '',
    '## Boundary',
    '',
    'This work hub index is an audit/navigation layer over selected observed usage. It groups occurrences and links by work for lookup; it does not rank routes, select visible answers, translate, or assert semantic conclusions.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-adjacency-index=')) parsed.selectedOccurrenceAdjacencyIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-occurrences-per-work=')) parsed.maxOccurrencesPerWork = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-target-works-per-work=')) parsed.maxTargetWorksPerWork = Number(valueAfterEquals(arg));
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

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
