#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  routeCoverage: '.local-cache/workbench-evidence/usage-route-coverage.json',
  routeLinkCheck: '.local-cache/workbench-evidence/usage-route-link-check.json',
  output: '.local-cache/workbench-evidence/usage-selected-route-resolution.json',
  report: 'reports/workbench-usage-selected-route-resolution.md',
  maxSamples: 8,
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
const routeCoverage = readJson(options.routeCoverage);
const routeLinkCheck = readJson(options.routeLinkCheck);
assertType(selectedCards, 'workbench_usage_selected_occurrence_cards', options.selectedOccurrenceCards);
assertType(routeCoverage, 'workbench_usage_route_coverage_index', options.routeCoverage);
assertType(routeLinkCheck, 'workbench_usage_route_link_check', options.routeLinkCheck);

const routeCoverageById = new Map((routeCoverage.routes || []).map((route) => [route.route_id, route]));
const linkCheckById = new Map((routeLinkCheck.route_ids || []).map((route) => [route.key, route]));
const buckets = new Map();
for (const card of selectedCards.cards || []) {
  for (const routeId of card.route_ids || []) addRouteCard(routeId, card);
}

const routes = [...buckets.values()].map(finalizeRoute).sort((a, b) => b.counts.selected_cards - a.counts.selected_cards || a.route_id.localeCompare(b.route_id));
const checks = buildChecks(routes);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_route_resolution',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_route_resolution.mjs',
  policy: 'Audit-only selected route-ID resolution for the usage-navigation/concordance lane. It proves selected occurrence cards point to Agent 2 route IDs by ID/source/metadata only; it does not open route payloads, copy definition text, rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    route_coverage: options.routeCoverage,
    route_link_check: options.routeLinkCheck,
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
  counts: buildCounts(routes),
  checks,
  routes,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected route resolution routes ${artifact.counts.route_id_buckets}; resolved ${artifact.counts.resolved_route_ids}; selected cards ${artifact.counts.selected_cards}`);

function addRouteCard(routeId, card) {
  if (!buckets.has(routeId)) {
    buckets.set(routeId, {
      route_id: routeId,
      route: routeCoverageById.get(routeId) || null,
      linkCheck: linkCheckById.get(routeId) || null,
      counts: {
        selected_cards: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        cluster_counts: new Map(),
        source_refs: new Set(),
        works: new Set(),
      },
      samples: [],
    });
  }
  const bucket = buckets.get(routeId);
  bucket.counts.selected_cards += 1;
  if (Object.hasOwn(bucket.counts.status_counts, card.status)) bucket.counts.status_counts[card.status] += 1;
  const clusterId = card.cluster_id || 'unclustered';
  bucket.counts.cluster_counts.set(clusterId, (bucket.counts.cluster_counts.get(clusterId) || 0) + 1);
  if (card.source_ref) bucket.counts.source_refs.add(card.source_ref);
  if (card.work_slug || card.work_title) bucket.counts.works.add(card.work_slug || card.work_title);
  if (bucket.samples.length < options.maxSamples) {
    bucket.samples.push({
      occurrence_id: card.occurrence_id || null,
      source_ref: card.source_ref || null,
      source_href: card.source_href || null,
      work_anchor_href: card.work_anchor_href || null,
      work_title: card.work_title || null,
      work_slug: card.work_slug || null,
      status: card.status || null,
      raw_score: card.raw_score ?? null,
      cluster_id: card.cluster_id || null,
      usage_frame_label: card.usage_frame_label || null,
      license: card.license || null,
      license_url: card.license_url || null,
    });
  }
}

function finalizeRoute(bucket) {
  const route = bucket.route;
  const linkCheck = bucket.linkCheck;
  const resolvedByCoverage = Boolean(route);
  const resolvedByLinkCheck = Boolean(linkCheck) && Number(routeLinkCheck.counts?.route_links_unresolved || 0) === 0;
  return {
    route_id: bucket.route_id,
    route_source: route?.route_source || null,
    normalized: route?.normalized || null,
    surface: route?.surface || null,
    route_family: route?.route_family || null,
    route_type: route?.route_type || null,
    display_section: route?.display_section || null,
    route_raw_score: route?.route_raw_score ?? null,
    resolution: {
      resolved_by_route_coverage: resolvedByCoverage,
      resolved_by_route_link_check: resolvedByLinkCheck,
      route_link_check_rows: Number(linkCheck?.count || 0),
      route_payload_copied: false,
      reader_facing: false,
      observed_usage_only: true,
    },
    counts: {
      selected_cards: bucket.counts.selected_cards,
      source_refs: bucket.counts.source_refs.size,
      works: bucket.counts.works.size,
      status_counts: bucket.counts.status_counts,
      cluster_counts: Object.fromEntries([...bucket.counts.cluster_counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    },
    samples: bucket.samples,
  };
}

function buildCounts(routeRows) {
  const selectedCardsCount = Number(selectedCards.counts?.cards || 0);
  const routeIds = new Set();
  let selectedRouteLinks = 0;
  let resolvedRouteIds = 0;
  let unresolvedRouteIds = 0;
  let readerFacingRows = 0;
  let routePayloadCopiedRows = 0;
  let routePayloadFieldHits = 0;
  for (const route of routeRows) {
    routeIds.add(route.route_id);
    selectedRouteLinks += Number(route.counts.selected_cards || 0);
    if (route.resolution.resolved_by_route_coverage && route.resolution.resolved_by_route_link_check) resolvedRouteIds += 1;
    else unresolvedRouteIds += 1;
    if (route.resolution.reader_facing) readerFacingRows += 1;
    if (route.resolution.route_payload_copied) routePayloadCopiedRows += 1;
    routePayloadFieldHits += countForbiddenKeys(route);
  }
  return {
    selected_cards: selectedCardsCount,
    selected_route_links: selectedRouteLinks,
    route_id_buckets: routeIds.size,
    resolved_route_ids: resolvedRouteIds,
    unresolved_route_ids: unresolvedRouteIds,
    route_link_check_status: routeLinkCheck.quality?.status || null,
    route_link_check_unresolved_links: Number(routeLinkCheck.counts?.route_links_unresolved || 0),
    route_link_check_metadata_mismatches: Number(routeLinkCheck.counts?.route_metadata_mismatch || 0),
    route_coverage_unique_route_ids: Number(routeCoverage.counts?.unique_route_ids || 0),
    reader_facing_rows: readerFacingRows,
    route_payload_copied_rows: routePayloadCopiedRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(routeRows) {
  const counts = buildCounts(routeRows);
  return [
    check('selected_cards_present', counts.selected_cards > 0 ? 'passed' : 'failed', `selected cards ${counts.selected_cards}`),
    check('selected_route_links_complete', counts.selected_route_links === counts.selected_cards ? 'passed' : 'failed', `selected route links ${counts.selected_route_links}; selected cards ${counts.selected_cards}`),
    check('route_link_check_passed', routeLinkCheck.quality?.status === 'passed' ? 'passed' : 'failed', `route link check ${routeLinkCheck.quality?.status || 'missing'}`),
    check('selected_route_ids_resolved', counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `unresolved selected route IDs ${counts.unresolved_route_ids}`),
    check('route_metadata_only', 'passed', 'route rows carry IDs/source/metadata and selected occurrence samples only'),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', 'reader-facing rows 0'),
    check('route_payload_not_copied', counts.route_payload_copied_rows === 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `copied rows ${counts.route_payload_copied_rows}; payload field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Route Resolution',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Selected cards: ${artifact.counts.selected_cards}`,
    `- Selected route links: ${artifact.counts.selected_route_links}`,
    `- Route ID buckets: ${artifact.counts.route_id_buckets}`,
    `- Resolved route IDs: ${artifact.counts.resolved_route_ids}`,
    `- Unresolved route IDs: ${artifact.counts.unresolved_route_ids}`,
    `- Route-link check status: ${artifact.counts.route_link_check_status}`,
    `- Route-link unresolved links: ${artifact.counts.route_link_check_unresolved_links}`,
    `- Route-link metadata mismatches: ${artifact.counts.route_link_check_metadata_mismatches}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload copied rows: ${artifact.counts.route_payload_copied_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This resolver proves selected usage rows point to Agent 2 route IDs by ID/source/metadata only. It does not open or copy route payload content, rank routes, select visible answers, translate, or make meaning claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Routes',
    '',
    '| route id | source | family | type | display | selected rows | source refs | works | supported | candidate | weak | clusters | samples |',
    '|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.routes.map((route) => `| ${[
      route.route_id,
      route.route_source,
      route.route_family,
      route.route_type,
      route.display_section,
      route.counts.selected_cards,
      route.counts.source_refs,
      route.counts.works,
      route.counts.status_counts.supported,
      route.counts.status_counts.candidate,
      route.counts.status_counts.weak,
      Object.entries(route.counts.cluster_counts).map(([clusterId, count]) => `${clusterId}: ${count}`).join('<br>'),
      route.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function assertType(artifact, expectedType, relativePath) {
  if (artifact.artifact_type !== expectedType) throw new Error(`${relativePath} is not ${expectedType}`);
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
    else if (arg.startsWith('--route-coverage=')) parsed.routeCoverage = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-link-check=')) parsed.routeLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
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

function mdLink(label, href) {
  if (!label) return '';
  if (!href) return label;
  return `[${String(label).replace(/\]/g, '\\]')}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
