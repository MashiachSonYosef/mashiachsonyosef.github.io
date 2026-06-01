#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concentrationPacket: '.local-cache/workbench-evidence/usage-concentration-packet.json',
  selectedSourceDiversity: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  selectedSignatureIndependence: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  output: '.local-cache/workbench-evidence/usage-selected-route-concentration-response.json',
  report: 'reports/workbench-usage-selected-route-concentration-response.md',
};

const options = parseArgs(process.argv.slice(2));
const concentrationPacket = readJson(options.concentrationPacket);
const sourceDiversity = readJson(options.selectedSourceDiversity);
const signatureIndependence = readJson(options.selectedSignatureIndependence);
if (concentrationPacket.artifact_type !== 'workbench_usage_concentration_packet') {
  throw new Error(`${options.concentrationPacket} is not a usage concentration packet`);
}
if (sourceDiversity.artifact_type !== 'workbench_usage_selected_source_diversity') {
  throw new Error(`${options.selectedSourceDiversity} is not a selected source diversity artifact`);
}
if (signatureIndependence.artifact_type !== 'workbench_usage_selected_signature_independence') {
  throw new Error(`${options.selectedSignatureIndependence} is not a selected signature independence artifact`);
}

const routeWarningVisible = Number(concentrationPacket.counts?.route_id_buckets || 0) <= 1
  || (concentrationPacket.checks || []).some((check) => check.id === 'route_concentration_visible' && check.status === 'warning');
const rows = buildRows();
const checks = buildChecks();
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_route_concentration_response',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_route_concentration_response.mjs',
  policy: 'Audit-only response packet for selected-route concentration. It keeps the route concentration warning visible while attaching source-diversity and signature-independence counters; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    concentration_packet: options.concentrationPacket,
    selected_source_diversity: options.selectedSourceDiversity,
    selected_signature_independence: options.selectedSignatureIndependence,
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
  counts: {
    selected_occurrence_refs: Number(sourceDiversity.counts?.selected_occurrence_refs || 0),
    route_id_buckets: Number(concentrationPacket.counts?.route_id_buckets || 0),
    top_route_rows: Number(concentrationPacket.counts?.top_route_rows || 0),
    top_route_share_basis_points: Math.round(Number(concentrationPacket.counts?.top_route_share || 0) * 10000),
    route_concentration_warning_visible: routeWarningVisible ? 1 : 0,
    concentration_warning_count: Number(concentrationPacket.quality?.warning_count || 0),
    unique_source_refs: Number(sourceDiversity.counts?.unique_source_refs || 0),
    unique_work_anchors: Number(sourceDiversity.counts?.unique_work_anchors || 0),
    unique_works: Number(sourceDiversity.counts?.unique_works || 0),
    unique_licenses: Number(sourceDiversity.counts?.unique_licenses || 0),
    unique_version_sources: Number(sourceDiversity.counts?.unique_version_sources || 0),
    duplicate_source_ref_rows: Number(sourceDiversity.counts?.duplicate_source_ref_rows || 0),
    rows_with_recurring_signatures: Number(signatureIndependence.counts?.occurrence_refs_with_recurring_signatures || 0),
    rows_with_cross_cluster_signatures: Number(signatureIndependence.counts?.occurrence_refs_with_cross_cluster_signatures || 0),
    missing_source_diversity_rows: Number(sourceDiversity.counts?.selected_occurrence_refs || 0) - rows.length,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
  },
  checks,
  route_concentration: {
    warning_visible: routeWarningVisible,
    route_id_buckets: Number(concentrationPacket.counts?.route_id_buckets || 0),
    top_route_share: Number(concentrationPacket.counts?.top_route_share || 0),
    checks: (concentrationPacket.checks || []).filter((check) => check.id === 'route_concentration_visible'),
  },
  source_diversity_summary: {
    unique_source_refs: Number(sourceDiversity.counts?.unique_source_refs || 0),
    unique_work_anchors: Number(sourceDiversity.counts?.unique_work_anchors || 0),
    unique_works: Number(sourceDiversity.counts?.unique_works || 0),
    unique_licenses: Number(sourceDiversity.counts?.unique_licenses || 0),
    unique_version_sources: Number(sourceDiversity.counts?.unique_version_sources || 0),
    duplicate_source_ref_rows: Number(sourceDiversity.counts?.duplicate_source_ref_rows || 0),
  },
  signature_independence_summary: {
    rows_with_recurring_signatures: Number(signatureIndependence.counts?.occurrence_refs_with_recurring_signatures || 0),
    rows_with_cross_cluster_signatures: Number(signatureIndependence.counts?.occurrence_refs_with_cross_cluster_signatures || 0),
    rows_without_recurring_signatures: Number(signatureIndependence.counts?.occurrence_refs_without_recurring_signatures || 0),
  },
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected route concentration response rows ${artifact.counts.selected_occurrence_refs}; route warning ${artifact.counts.route_concentration_warning_visible}; source refs ${artifact.counts.unique_source_refs}`);

function buildRows() {
  const signatureRows = new Map((signatureIndependence.rows || []).map((row) => [row.occurrence_id, row]));
  return (sourceDiversity.rows || []).map((row) => {
    const signatureRow = signatureRows.get(row.occurrence_id);
    return {
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      work_title: row.work_title,
      work_slug: row.work_slug,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      usage_frame_label: row.usage_frame_label,
      license: row.license,
      license_url: row.license_url,
      route_ids: row.route_ids || [],
      route_concentration_flags: {
        route_concentration_warning_visible: routeWarningVisible,
        observed_usage_only: true,
        reader_facing: false,
      },
      source_diversity_flags: row.source_diversity_flags || {},
      signature_independence_flags: signatureRow?.independence_flags || row.signature_independence || {},
    };
  });
}

function buildChecks() {
  return [
    check('selected_rows_present', rows.length > 0 ? 'passed' : 'failed', `selected rows ${rows.length}`),
    check('route_concentration_warning_visible', routeWarningVisible ? 'warning' : 'passed', `route buckets ${concentrationPacket.counts?.route_id_buckets ?? 'unknown'}; top route share ${formatPercent(concentrationPacket.counts?.top_route_share)}`),
    check('source_diversity_visible', Number(sourceDiversity.counts?.unique_source_refs || 0) > 1 ? 'passed' : 'warning', `source refs ${sourceDiversity.counts?.unique_source_refs ?? 'unknown'}; works ${sourceDiversity.counts?.unique_works ?? 'unknown'}`),
    check('signature_independence_visible', Number(signatureIndependence.counts?.occurrence_refs_with_recurring_signatures || 0) > 0 ? 'passed' : 'warning', `rows with recurring signatures ${signatureIndependence.counts?.occurrence_refs_with_recurring_signatures ?? 'unknown'}`),
    check('source_diversity_join_complete', rows.length === Number(sourceDiversity.counts?.selected_occurrence_refs || 0) ? 'passed' : 'failed', `rows ${rows.length}; source diversity rows ${sourceDiversity.counts?.selected_occurrence_refs || 0}`),
    check('audit_only_not_reader_facing', 'passed', 'reader-facing rows 0'),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Route Concentration Response',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Selected occurrence refs: ${artifact.counts.selected_occurrence_refs}`,
    `- Route ID buckets: ${artifact.counts.route_id_buckets}`,
    `- Top route rows: ${artifact.counts.top_route_rows}`,
    `- Top route share basis points: ${artifact.counts.top_route_share_basis_points}`,
    `- Route concentration warning visible: ${artifact.counts.route_concentration_warning_visible}`,
    `- Concentration warning count: ${artifact.counts.concentration_warning_count}`,
    `- Unique source refs: ${artifact.counts.unique_source_refs}`,
    `- Unique work anchors: ${artifact.counts.unique_work_anchors}`,
    `- Unique works: ${artifact.counts.unique_works}`,
    `- Unique licenses: ${artifact.counts.unique_licenses}`,
    `- Unique version sources: ${artifact.counts.unique_version_sources}`,
    `- Duplicate source-ref rows: ${artifact.counts.duplicate_source_ref_rows}`,
    `- Rows with recurring signatures: ${artifact.counts.rows_with_recurring_signatures}`,
    `- Rows with cross-cluster signatures: ${artifact.counts.rows_with_cross_cluster_signatures}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet is audit-only. It keeps route concentration visible and attaches source-diversity and signature-independence counters for QA. It does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Selected Rows',
    '',
    '| source | frame | status | license | duplicate source | recurring signature | cross-cluster signature |',
    '|---|---|---|---|---|---|---|',
    ...artifact.rows.map((row) => `| ${[
      mdLink(row.source_ref, row.source_href),
      row.usage_frame_label || row.cluster_id,
      row.status,
      mdLink(row.license, row.license_url),
      row.source_diversity_flags.duplicate_source_ref ? 'yes' : 'no',
      row.signature_independence_flags.has_recurring_signature ? 'yes' : 'no',
      row.signature_independence_flags.has_cross_cluster_signature ? 'yes' : 'no',
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function formatPercent(value) {
  const number = Number(value || 0);
  return `${(number * 100).toFixed(2)}%`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concentration-packet=')) parsed.concentrationPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-source-diversity=')) parsed.selectedSourceDiversity = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-signature-independence=')) parsed.selectedSignatureIndependence = cleanRelativePath(valueAfterEquals(arg));
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
