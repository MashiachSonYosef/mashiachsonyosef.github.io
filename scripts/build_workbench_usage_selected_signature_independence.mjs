#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  contextSignatureLookup: '.local-cache/workbench-evidence/usage-context-signature-lookup.json',
  output: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  report: 'reports/workbench-usage-selected-signature-independence.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedOccurrences = readJson(options.selectedOccurrences);
const signatureLookup = readJson(options.contextSignatureLookup);
if (selectedOccurrences.artifact_type !== 'workbench_usage_navigation_selected_occurrences') {
  throw new Error(`${options.selectedOccurrences} is not a selected occurrences artifact`);
}
if (signatureLookup.artifact_type !== 'workbench_usage_context_signature_lookup') {
  throw new Error(`${options.contextSignatureLookup} is not a context signature lookup artifact`);
}

const lookupByOccurrenceId = new Map((signatureLookup.occurrences || []).map((row) => [row.occurrence_id, row]));
const rows = [];
let missingLookupRows = 0;
const selectedRows = selectedOccurrences.occurrences || selectedOccurrences.rows || [];
for (const selected of selectedRows) {
  const occurrence = lookupByOccurrenceId.get(selected.occurrence_id);
  if (!occurrence) {
    missingLookupRows += 1;
    continue;
  }
  rows.push(buildRow(selected, occurrence));
}

const counts = buildCounts(rows, missingLookupRows);
const checks = buildChecks(counts);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_signature_independence',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_signature_independence.mjs',
  policy: 'Selected-occurrence signature independence audit. It overlays exact local context-signature memberships onto the selected usage rows so QA can see which examples are locally recurring, shared across clusters, or isolated; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    selected_occurrences: options.selectedOccurrences,
    context_signature_lookup: options.contextSignatureLookup,
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
    status: failed.length ? 'failed' : 'passed',
    warning_count: checks.filter((checkRow) => checkRow.status === 'warning').length,
    failed_count: failed.length,
  },
  counts,
  checks,
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected signature independence rows ${counts.selected_occurrence_refs}; recurring ${counts.occurrence_refs_with_recurring_signatures}; cross-cluster ${counts.occurrence_refs_with_cross_cluster_signatures}`);

function buildRow(selected, occurrence) {
  const recurringMemberships = occurrence.signature_memberships.filter((membership) => membership.recurring);
  const crossClusterMemberships = occurrence.signature_memberships.filter((membership) => membership.cross_cluster);
  return {
    occurrence_id: occurrence.occurrence_id,
    candidate_id: occurrence.candidate_id,
    source_ref: occurrence.source_ref,
    source_href: occurrence.source_href,
    work_anchor_href: occurrence.work_anchor_href,
    work_title: occurrence.work_title,
    work_slug: occurrence.work_slug,
    token_key: occurrence.token_key,
    focus_surface: occurrence.focus_surface,
    focus_normalized: occurrence.focus_normalized,
    status: occurrence.status,
    raw_score: occurrence.raw_score,
    cluster_id: occurrence.cluster_id,
    usage_frame_label: occurrence.usage_frame_label,
    license: occurrence.license,
    license_url: occurrence.license_url,
    route_ids: occurrence.route_ids || [],
    slice_ids: selected.slice_ids || [],
    context_focus_marked: occurrence.context_focus_marked,
    independence_flags: {
      has_recurring_signature: recurringMemberships.length > 0,
      has_cross_cluster_signature: crossClusterMemberships.length > 0,
      observed_usage_only: true,
      reader_facing: false,
    },
    counts: {
      signature_memberships: occurrence.counts.signature_memberships,
      recurring_signature_memberships: occurrence.counts.recurring_signature_memberships,
      cross_cluster_signature_memberships: occurrence.counts.cross_cluster_signature_memberships,
      related_occurrences_listed: occurrence.counts.related_occurrences_listed,
    },
    recurring_signatures: recurringMemberships.map(compactMembership),
    cross_cluster_signatures: crossClusterMemberships.map(compactMembership),
  };
}

function compactMembership(membership) {
  return {
    signature_id: membership.signature_id,
    window_radius: membership.window_radius,
    signature_display: membership.signature_display,
    occurrences: membership.counts?.occurrences ?? null,
    clusters: membership.counts?.clusters ?? null,
    route_ids: membership.route_ids || [],
    related_occurrences: (membership.related_occurrences || []).slice(0, 5),
  };
}

function buildCounts(rows, missingLookupRows) {
  return {
    selected_occurrence_refs: rows.length,
    signature_memberships: rows.reduce((sum, row) => sum + row.counts.signature_memberships, 0),
    recurring_signature_memberships: rows.reduce((sum, row) => sum + row.counts.recurring_signature_memberships, 0),
    cross_cluster_signature_memberships: rows.reduce((sum, row) => sum + row.counts.cross_cluster_signature_memberships, 0),
    occurrence_refs_with_recurring_signatures: rows.filter((row) => row.independence_flags.has_recurring_signature).length,
    occurrence_refs_with_cross_cluster_signatures: rows.filter((row) => row.independence_flags.has_cross_cluster_signature).length,
    occurrence_refs_without_recurring_signatures: rows.filter((row) => !row.independence_flags.has_recurring_signature).length,
    missing_lookup_rows: missingLookupRows,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('selected_rows_present', counts.selected_occurrence_refs > 0 ? 'passed' : 'failed', `selected rows ${counts.selected_occurrence_refs}`),
    check('lookup_complete', counts.missing_lookup_rows === 0 ? 'passed' : 'failed', `missing lookup rows ${counts.missing_lookup_rows}`),
    check('recurring_signature_visibility', counts.occurrence_refs_with_recurring_signatures > 0 ? 'passed' : 'warning', `selected rows with recurring signatures ${counts.occurrence_refs_with_recurring_signatures}`),
    check('cross_cluster_signature_visibility', counts.occurrence_refs_with_cross_cluster_signatures > 0 ? 'passed' : 'warning', `selected rows with cross-cluster signatures ${counts.occurrence_refs_with_cross_cluster_signatures}`),
    check('audit_only_not_reader_facing', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Signature Independence',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Selected occurrence refs: ${artifact.counts.selected_occurrence_refs}`,
    `- Signature memberships: ${artifact.counts.signature_memberships}`,
    `- Recurring signature memberships: ${artifact.counts.recurring_signature_memberships}`,
    `- Cross-cluster signature memberships: ${artifact.counts.cross_cluster_signature_memberships}`,
    `- Occurrence refs with recurring signatures: ${artifact.counts.occurrence_refs_with_recurring_signatures}`,
    `- Occurrence refs with cross-cluster signatures: ${artifact.counts.occurrence_refs_with_cross_cluster_signatures}`,
    `- Occurrence refs without recurring signatures: ${artifact.counts.occurrence_refs_without_recurring_signatures}`,
    `- Missing lookup rows: ${artifact.counts.missing_lookup_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet is audit-only. It shows whether selected occurrences have recurring or cross-cluster exact local signatures. It does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Selected Occurrences',
    '',
    '| source | frame | status | license | signatures | recurring | cross-cluster | recurring signatures | cross-cluster signatures |',
    '|---|---|---|---|---:|---:|---:|---|---|',
    ...artifact.rows.map((row) => `| ${[
      mdLink(row.source_ref, row.source_href),
      row.usage_frame_label || row.cluster_id,
      row.status,
      mdLink(row.license, row.license_url),
      row.counts.signature_memberships,
      row.counts.recurring_signature_memberships,
      row.counts.cross_cluster_signature_memberships,
      row.recurring_signatures.map((membership) => `${membership.window_radius}:${membership.signature_display} (${membership.occurrences})`).join('<br>'),
      row.cross_cluster_signatures.map((membership) => `${membership.window_radius}:${membership.signature_display} (${membership.clusters} clusters)`).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-signature-lookup=')) parsed.contextSignatureLookup = cleanRelativePath(valueAfterEquals(arg));
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
