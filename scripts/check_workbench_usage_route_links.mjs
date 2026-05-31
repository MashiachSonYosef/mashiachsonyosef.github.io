#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-route-link-check.json',
  report: 'reports/workbench-usage-route-link-check.md',
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
const routeSourceCache = new Map();
const issues = [];
const routeIdCounts = new Map();
const routeSourceCounts = new Map();
const counts = {
  rows: 0,
  route_linked_rows: 0,
  observed_only_rows: 0,
  route_links: 0,
  route_links_resolved: 0,
  route_links_unresolved: 0,
  route_source_missing: 0,
  route_source_unsafe: 0,
  route_source_unreadable: 0,
  route_id_missing: 0,
  route_metadata_mismatch: 0,
};

if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

for (const row of concordance.rows || []) {
  counts.rows += 1;
  const routeLinks = Array.isArray(row.route_links) ? row.route_links : [];
  if (routeLinks.length) counts.route_linked_rows += 1;
  else counts.observed_only_rows += 1;
  validateRouteState(row, routeLinks);
  for (const link of routeLinks) validateRouteLink(row, link);
}

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_route_link_check',
  generated_at: new Date().toISOString(),
  generator: 'scripts/check_workbench_usage_route_links.mjs',
  policy: 'Route-link integrity check for usage-navigation rows. It validates that related Agent 2 route IDs resolve to local route artifacts; it does not print route content, rank routes, or select visible answers.',
  inputs: {
    concordance: options.concordance,
  },
  counts: {
    ...counts,
    unique_route_ids: routeIdCounts.size,
    unique_route_sources: routeSourceCounts.size,
  },
  quality: {
    status: issues.length ? 'failed' : 'passed',
    issue_count: issues.length,
  },
  route_sources: topEntries(routeSourceCounts, 50),
  route_ids: topEntries(routeIdCounts, 50),
  issues,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage route link check ${artifact.quality.status}; rows ${counts.rows}; links ${counts.route_links}; unresolved ${counts.route_links_unresolved}; metadata mismatches ${counts.route_metadata_mismatch}`);
if (issues.length) process.exitCode = 2;

function validateRouteState(row, routeLinks) {
  const expectedState = routeLinks.length ? 'route_linked_observed_usage' : 'observed_usage_only';
  if (row.route_link_state !== expectedState) {
    addIssue(row, null, 'route_state_mismatch', `route_link_state expected ${expectedState}`);
  }
  const expectedLabel = routeLinks.length ? 'route-linked observed usage' : 'observed usage only';
  if (row.navigation_label !== expectedLabel) {
    addIssue(row, null, 'route_label_mismatch', `navigation_label expected ${expectedLabel}`);
  }
  if (!Array.isArray(row.agent2_route_ids) || row.agent2_route_ids.length !== routeLinks.length) {
    addIssue(row, null, 'route_id_list_mismatch', 'agent2_route_ids must match route_links length');
  }
}

function validateRouteLink(row, link) {
  counts.route_links += 1;
  const routeId = String(link?.route_id || '');
  const routeSource = cleanRelativePath(link?.route_source || '');
  if (!routeId) {
    counts.route_id_missing += 1;
    counts.route_links_unresolved += 1;
    addIssue(row, link, 'route_id_missing', 'route_link.route_id is missing');
    return;
  }
  increment(routeIdCounts, routeId);
  if (!routeSource) {
    counts.route_source_missing += 1;
    counts.route_links_unresolved += 1;
    addIssue(row, link, 'route_source_missing', 'route_link.route_source is missing');
    return;
  }
  increment(routeSourceCounts, routeSource);

  const source = getRouteSource(routeSource);
  if (source.status !== 'ok') {
    counts.route_links_unresolved += 1;
    counts[source.status] += 1;
    addIssue(row, link, source.status, source.message);
    return;
  }

  const records = source.routes.get(routeId) || [];
  if (!records.length) {
    counts.route_links_unresolved += 1;
    addIssue(row, link, 'route_id_unresolved', `route_id not found in ${routeSource}`);
    return;
  }

  const matchingRecord = records.find((record) => routeMetadataMatches(link, record)) || records[0];
  const mismatches = metadataMismatches(link, matchingRecord);
  if (mismatches.length) {
    counts.route_metadata_mismatch += 1;
    addIssue(row, link, 'route_metadata_mismatch', mismatches.join('; '));
  }
  counts.route_links_resolved += 1;
}

function getRouteSource(routeSource) {
  if (routeSourceCache.has(routeSource)) return routeSourceCache.get(routeSource);
  const absoluteFile = path.resolve(root, routeSource);
  if (!absoluteFile.startsWith(root + path.sep)) {
    const result = { status: 'route_source_unsafe', message: `route source escapes workspace: ${routeSource}` };
    routeSourceCache.set(routeSource, result);
    return result;
  }
  if (!fs.existsSync(absoluteFile)) {
    const result = { status: 'route_source_missing', message: `route source missing: ${routeSource}` };
    routeSourceCache.set(routeSource, result);
    return result;
  }
  try {
    const data = JSON.parse(fs.readFileSync(absoluteFile, 'utf8'));
    const routes = new Map();
    collectRoutes(data, routes);
    const result = { status: 'ok', routes };
    routeSourceCache.set(routeSource, result);
    return result;
  } catch (error) {
    const result = { status: 'route_source_unreadable', message: `route source unreadable: ${routeSource}: ${error.message}` };
    routeSourceCache.set(routeSource, result);
    return result;
  }
}

function collectRoutes(value, routes) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRoutes(item, routes));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const id = value.route_id || value.card_id || value.claim_id || value.evidence_id || null;
  if (typeof id === 'string' && id.trim()) {
    if (!routes.has(id)) routes.set(id, []);
    routes.get(id).push({
      route_id: id,
      normalized: value.normalized || null,
      surface: value.surface || null,
      route_family: value.route_family || null,
      route_type: value.route_type || null,
      display_section: value.display_section || null,
      raw_score: value.raw_score ?? value.confidence_percent ?? value.confidence ?? null,
    });
  }

  for (const item of Object.values(value)) collectRoutes(item, routes);
}

function routeMetadataMatches(link, record) {
  return metadataMismatches(link, record).length === 0;
}

function metadataMismatches(link, record) {
  const mismatches = [];
  for (const field of ['normalized', 'surface', 'route_family', 'route_type', 'display_section']) {
    const linkValue = link?.[field];
    const recordValue = record?.[field];
    if (linkValue !== undefined && linkValue !== null && recordValue !== undefined && recordValue !== null && String(linkValue) !== String(recordValue)) {
      mismatches.push(`${field} ${String(linkValue)} != ${String(recordValue)}`);
    }
  }
  if (link?.raw_score !== undefined && link?.raw_score !== null && record?.raw_score !== undefined && record?.raw_score !== null) {
    if (Number(link.raw_score) !== Number(record.raw_score)) {
      mismatches.push(`raw_score ${link.raw_score} != ${record.raw_score}`);
    }
  }
  return mismatches;
}

function addIssue(row, link, code, message) {
  issues.push({
    code,
    message,
    candidate_id: row?.ids?.candidate_id || null,
    occurrence_id: row?.ids?.occurrence_id || null,
    source_ref: row?.source?.source_ref || null,
    route_id: link?.route_id || null,
    route_source: link?.route_source || null,
  });
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Route Link Check',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Rows checked: ${artifact.counts.rows}`,
    `- Route-linked rows: ${artifact.counts.route_linked_rows}`,
    `- Observed-only rows: ${artifact.counts.observed_only_rows}`,
    `- Route links: ${artifact.counts.route_links}`,
    `- Resolved route links: ${artifact.counts.route_links_resolved}`,
    `- Unresolved route links: ${artifact.counts.route_links_unresolved}`,
    `- Metadata mismatches: ${artifact.counts.route_metadata_mismatch}`,
    `- Unique route IDs: ${artifact.counts.unique_route_ids}`,
    `- Unique route sources: ${artifact.counts.unique_route_sources}`,
    '',
    '## Policy',
    '',
    'This is a route-link integrity audit for usage-navigation rows. It validates local route ID linkage only; it does not print route content, rank routes, select visible answers, or make lexical claims.',
    '',
    '## Route Sources',
    '',
    '| route source | links |',
    '|---|---:|',
    ...artifact.route_sources.map((entry) => `| ${mdCell(entry.key)} | ${entry.count} |`),
    '',
    '## Route IDs',
    '',
    '| route id | links |',
    '|---|---:|',
    ...artifact.route_ids.map((entry) => `| ${mdCell(entry.key)} | ${entry.count} |`),
    '',
    '## Issues',
    '',
  ];
  if (!artifact.issues.length) {
    lines.push('No route-link integrity issues found.');
  } else {
    lines.push('| code | route id | candidate | source | message |');
    lines.push('|---|---|---|---|---|');
    for (const issue of artifact.issues.slice(0, 200)) {
      lines.push(`| ${mdCell(issue.code)} | ${mdCell(issue.route_id)} | ${mdCell(issue.candidate_id)} | ${mdCell(issue.route_source)} | ${mdCell(issue.message)} |`);
    }
  }
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
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

function topEntries(map, limit = 20) {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
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
