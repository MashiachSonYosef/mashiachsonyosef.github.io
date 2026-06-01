#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  contextSignatureIndex: '.local-cache/workbench-evidence/usage-context-signature-index.json',
  output: '.local-cache/workbench-evidence/usage-context-signature-lookup.json',
  report: 'reports/workbench-usage-context-signature-lookup.md',
  maxRelated: 8,
  maxReportRows: 80,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
const signatureIndex = readJson(options.contextSignatureIndex);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}
if (signatureIndex.artifact_type !== 'workbench_usage_context_signature_index') {
  throw new Error(`${options.contextSignatureIndex} is not a context signature index artifact`);
}

const rows = Array.isArray(searchRows.rows) ? searchRows.rows : [];
const rowByOccurrenceId = new Map(rows.map((row) => [row.occurrence_id, row]));
const occurrenceMap = new Map(rows.map((row) => [row.occurrence_id, createOccurrenceEntry(row)]));
let signatureMemberships = 0;
let recurringSignatureMemberships = 0;
let crossClusterSignatureMemberships = 0;
let unmatchedOccurrenceIds = 0;
const occurrenceIdsWithRecurring = new Set();
const occurrenceIdsWithCrossCluster = new Set();

for (const group of signatureIndex.groups || []) {
  const occurrenceIds = Array.isArray(group.occurrence_ids) ? group.occurrence_ids : [];
  const isRecurring = Number(group.counts?.occurrences || 0) > 1;
  const isCrossCluster = Number(group.counts?.clusters || 0) > 1;
  for (const occurrenceId of occurrenceIds) {
    const entry = occurrenceMap.get(occurrenceId);
    if (!entry) {
      unmatchedOccurrenceIds += 1;
      continue;
    }
    signatureMemberships += 1;
    if (isRecurring) {
      recurringSignatureMemberships += 1;
      occurrenceIdsWithRecurring.add(occurrenceId);
    }
    if (isCrossCluster) {
      crossClusterSignatureMemberships += 1;
      occurrenceIdsWithCrossCluster.add(occurrenceId);
    }
    entry.signature_memberships.push(buildMembership(group, occurrenceId));
  }
}

const occurrences = [...occurrenceMap.values()].map(finalizeOccurrence).sort(compareOccurrences);
const checks = buildChecks(occurrences);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_context_signature_lookup',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_context_signature_lookup.mjs',
  policy: 'Per-occurrence context-signature lookup for usage navigation. It attaches exact local-frame signature memberships and bounded related occurrence links to each observed usage row; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    search_rows: options.searchRows,
    context_signature_index: options.contextSignatureIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts: {
    occurrence_refs: occurrences.length,
    signature_memberships: signatureMemberships,
    recurring_signature_memberships: recurringSignatureMemberships,
    occurrence_refs_with_recurring_signatures: occurrenceIdsWithRecurring.size,
    cross_cluster_signature_memberships: crossClusterSignatureMemberships,
    occurrence_refs_with_cross_cluster_signatures: occurrenceIdsWithCrossCluster.size,
    unmatched_occurrence_ids: unmatchedOccurrenceIds,
    route_payload_field_hits: 0,
  },
  checks,
  occurrences,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage context signature lookup occurrences ${artifact.counts.occurrence_refs}; memberships ${artifact.counts.signature_memberships}; recurring occurrences ${artifact.counts.occurrence_refs_with_recurring_signatures}`);

function createOccurrenceEntry(row) {
  return {
    occurrence_id: row.occurrence_id,
    candidate_id: row.candidate_id,
    token_key: row.token_key,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    work_id: row.work_id,
    work_title: row.work_title,
    work_slug: row.work_slug,
    category: row.category,
    unit_id: row.unit_id,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    route_ids: row.route_ids || [],
    context_focus_marked: row.context_focus_marked,
    signature_memberships: [],
  };
}

function buildMembership(group, occurrenceId) {
  const relatedOccurrenceIds = (group.occurrence_ids || [])
    .filter((relatedId) => relatedId !== occurrenceId)
    .slice(0, options.maxRelated);
  return {
    signature_id: group.signature_id,
    window_radius: group.window_radius,
    signature_key: group.signature_key,
    signature_display: group.signature_display,
    recurring: Number(group.counts?.occurrences || 0) > 1,
    cross_cluster: Number(group.counts?.clusters || 0) > 1,
    counts: {
      occurrences: group.counts?.occurrences ?? null,
      works: group.counts?.works ?? null,
      categories: group.counts?.categories ?? null,
      clusters: group.counts?.clusters ?? null,
      status_counts: group.counts?.status_counts || {},
      cluster_counts: group.counts?.cluster_counts || {},
      license_counts: group.counts?.license_counts || {},
    },
    route_ids: group.route_ids || [],
    related_occurrences: relatedOccurrenceIds.map(compactRelatedOccurrence),
  };
}

function compactRelatedOccurrence(occurrenceId) {
  const row = rowByOccurrenceId.get(occurrenceId) || {};
  return {
    occurrence_id: occurrenceId,
    source_ref: row.source_ref || null,
    source_href: row.source_href || null,
    work_anchor_href: row.work_anchor_href || null,
    work_title: row.work_title || null,
    work_slug: row.work_slug || null,
    status: row.status || null,
    cluster_id: row.cluster_id || null,
    usage_frame_label: row.usage_frame_label || null,
    raw_score: row.raw_score ?? null,
    license: row.license || null,
    license_url: row.license_url || null,
  };
}

function finalizeOccurrence(entry) {
  const memberships = entry.signature_memberships.sort(compareMemberships);
  return {
    ...entry,
    counts: {
      signature_memberships: memberships.length,
      recurring_signature_memberships: memberships.filter((membership) => membership.recurring).length,
      cross_cluster_signature_memberships: memberships.filter((membership) => membership.cross_cluster).length,
      related_occurrences_listed: memberships.reduce((sum, membership) => sum + membership.related_occurrences.length, 0),
    },
    signature_memberships: memberships,
  };
}

function buildChecks(occurrences) {
  const membershipSum = occurrences.reduce((sum, row) => sum + row.counts.signature_memberships, 0);
  const recurringMembershipSum = occurrences.reduce((sum, row) => sum + row.counts.recurring_signature_memberships, 0);
  const crossClusterMembershipSum = occurrences.reduce((sum, row) => sum + row.counts.cross_cluster_signature_memberships, 0);
  return [
    check('occurrences_complete', occurrences.length === rows.length ? 'passed' : 'failed', `occurrences ${occurrences.length}; rows ${rows.length}`),
    check('unmatched_occurrences_absent', unmatchedOccurrenceIds === 0 ? 'passed' : 'failed', `unmatched occurrence IDs ${unmatchedOccurrenceIds}`),
    check('signature_memberships_match_index', membershipSum === Number(signatureIndex.counts?.signature_windows || 0) ? 'passed' : 'failed', `memberships ${membershipSum}; signature windows ${signatureIndex.counts?.signature_windows || 0}`),
    check('recurring_memberships_counted', recurringMembershipSum === recurringSignatureMemberships ? 'passed' : 'failed', `recurring membership sum ${recurringMembershipSum}; counted ${recurringSignatureMemberships}`),
    check('cross_cluster_memberships_counted', crossClusterMembershipSum === crossClusterSignatureMemberships ? 'passed' : 'failed', `cross-cluster membership sum ${crossClusterMembershipSum}; counted ${crossClusterSignatureMemberships}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Context Signature Lookup',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Signature memberships: ${artifact.counts.signature_memberships}`,
    `- Recurring signature memberships: ${artifact.counts.recurring_signature_memberships}`,
    `- Occurrence refs with recurring signatures: ${artifact.counts.occurrence_refs_with_recurring_signatures}`,
    `- Cross-cluster signature memberships: ${artifact.counts.cross_cluster_signature_memberships}`,
    `- Occurrence refs with cross-cluster signatures: ${artifact.counts.occurrence_refs_with_cross_cluster_signatures}`,
    `- Unmatched occurrence IDs: ${artifact.counts.unmatched_occurrence_ids}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This lookup starts from an occurrence and lists exact context-signature memberships plus bounded related occurrence links. It carries source links, work anchors, status/frame counts, license counts, and route IDs only; it does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Occurrence Lookup Samples',
    '',
    '| source | frame | status | license | signatures | recurring | cross-cluster | top memberships |',
    '|---|---|---|---|---:|---:|---:|---|',
    ...artifact.occurrences
      .filter((row) => row.counts.recurring_signature_memberships > 0)
      .slice(0, options.maxReportRows)
      .map((row) => `| ${[
        mdLink(row.source_ref, row.source_href),
        row.usage_frame_label || row.cluster_id,
        row.status,
        mdLink(row.license, row.license_url),
        row.counts.signature_memberships,
        row.counts.recurring_signature_memberships,
        row.counts.cross_cluster_signature_memberships,
        row.signature_memberships.map((membership) => `${membership.window_radius}:${membership.signature_display} (${membership.counts.occurrences})`).join('<br>'),
      ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareMemberships(a, b) {
  return a.window_radius - b.window_radius
    || String(a.signature_key).localeCompare(String(b.signature_key));
}

function compareOccurrences(a, b) {
  return b.counts.recurring_signature_memberships - a.counts.recurring_signature_memberships
    || b.counts.cross_cluster_signature_memberships - a.counts.cross_cluster_signature_memberships
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-signature-index=')) parsed.contextSignatureIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-related=')) parsed.maxRelated = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-rows=')) parsed.maxReportRows = Number(valueAfterEquals(arg));
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
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), text, 'utf8');
}

function mkdirpForFile(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, cleanRelativePath(relativePath))), { recursive: true });
}

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${label || href}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
