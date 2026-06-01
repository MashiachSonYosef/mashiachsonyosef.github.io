#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  handoff: '.local-cache/workbench-evidence/usage-navigation-handoff-index.json',
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  selectedOccurrenceLookup: '.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json',
  routeLinkCheck: '.local-cache/workbench-evidence/usage-route-link-check.json',
  auditReview: '.local-cache/workbench-evidence/usage-audit-only-review.json',
  smokeValidation: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  output: '.local-cache/workbench-evidence/usage-agent6-boundary-packet.json',
  report: 'reports/workbench-usage-agent6-boundary-packet.md',
};

const forbiddenFieldNames = new Set([
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
]);
const routePayloadFieldNames = new Set([
  'route_payload',
  'route_content',
  'route_text',
  'route_body',
  'route_definition',
  'route_definition_text',
]);

const options = parseArgs(process.argv.slice(2));
const handoff = readJson(options.handoff);
const selectedOccurrences = readJson(options.selectedOccurrences);
const selectedOccurrenceLookup = readJson(options.selectedOccurrenceLookup);
const routeLinkCheck = readJson(options.routeLinkCheck);
const auditReview = readJson(options.auditReview);
const smokeValidation = readJson(options.smokeValidation);
const rows = Array.isArray(selectedOccurrences.rows) ? selectedOccurrences.rows : [];
const forbiddenHits = collectForbiddenFieldHits(selectedOccurrences);
const routePayloadHits = collectFieldHits(selectedOccurrences, routePayloadFieldNames);
const selectedAuditStatusRows = rows.filter((row) => row.status === 'ambiguous' || row.status === 'blocked');
const checks = buildChecks();

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_agent6_boundary_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_agent6_boundary_packet.mjs',
  policy: 'QA boundary packet for Agent 6 over selected usage-navigation artifacts. It checks links, context, provenance, audit-only ambiguous handling, and Agent 2 route-ID resolution only; it does not rank routes, select visible answers, or make semantic claims.',
  inputs: {
    handoff: options.handoff,
    selected_occurrences: options.selectedOccurrences,
    selected_occurrence_lookup: options.selectedOccurrenceLookup,
    route_link_check: options.routeLinkCheck,
    audit_review: options.auditReview,
    smoke_validation: options.smokeValidation,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_ids_only: true,
    copies_route_payloads: false,
  },
  counts: {
    selected_occurrence_rows: rows.length,
    rows_with_source_href: rows.filter((row) => row.source_href).length,
    rows_with_work_anchor_href: rows.filter((row) => row.work_anchor_href).length,
    rows_with_context_focus_marked: rows.filter((row) => row.context_focus_marked).length,
    rows_with_route_ids: rows.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    rows_with_license: rows.filter((row) => row.license).length,
    rows_with_license_url: rows.filter((row) => row.license_url).length,
    selected_audit_status_rows: selectedAuditStatusRows.length,
    selected_occurrence_lookup_work_buckets: selectedOccurrenceLookup.counts?.work_buckets ?? null,
    selected_occurrence_lookup_cluster_buckets: selectedOccurrenceLookup.counts?.cluster_buckets ?? null,
    selected_occurrence_lookup_status_buckets: selectedOccurrenceLookup.counts?.status_buckets ?? null,
    selected_qa_package_items: handoff.validation?.selected_qa_package_items ?? null,
    selected_source_hub_status: handoff.validation?.selected_source_hub_index_status ?? null,
    selected_source_hub_rows: handoff.validation?.selected_source_hub_rows ?? null,
    selected_source_hub_occurrence_rows: handoff.validation?.selected_source_hub_occurrence_rows ?? null,
    selected_source_hub_target_links: handoff.validation?.selected_source_hub_target_links ?? null,
    selected_source_hub_reader_facing_rows: handoff.validation?.selected_source_hub_reader_facing_rows ?? null,
    selected_source_hub_route_payload_field_hits: handoff.validation?.selected_source_hub_route_payload_field_hits ?? null,
    selected_work_hub_status: handoff.validation?.selected_work_hub_index_status ?? null,
    selected_work_hub_rows: handoff.validation?.selected_work_hub_rows ?? null,
    selected_work_hub_occurrence_rows: handoff.validation?.selected_work_hub_occurrence_rows ?? null,
    selected_work_hub_target_links: handoff.validation?.selected_work_hub_target_links ?? null,
    selected_work_hub_reader_facing_rows: handoff.validation?.selected_work_hub_reader_facing_rows ?? null,
    selected_work_hub_route_payload_field_hits: handoff.validation?.selected_work_hub_route_payload_field_hits ?? null,
    selected_occurrence_adjacency_target_links: handoff.validation?.selected_occurrence_adjacency_target_links ?? null,
    route_links_resolved: routeLinkCheck.counts?.route_links_resolved ?? null,
    route_links_unresolved: routeLinkCheck.counts?.route_links_unresolved ?? null,
    route_payload_field_hits: routePayloadHits.length,
    forbidden_field_hits: forbiddenHits.length,
    audit_only_rows: auditReview.counts?.rows ?? null,
    audit_only_ambiguous_rows: auditReview.counts?.status_counts?.ambiguous ?? null,
    audit_only_blocked_rows: auditReview.counts?.status_counts?.blocked ?? null,
    smoke_steps: smokeValidation.counts?.steps ?? null,
    smoke_failed_steps: smokeValidation.counts?.failed_steps ?? null,
  },
  route_boundary: {
    route_ids_resolve: routeLinkCheck.quality?.status === 'passed' && Number(routeLinkCheck.counts?.route_links_unresolved || 0) === 0,
    unique_route_ids: routeLinkCheck.counts?.unique_route_ids ?? null,
    route_sources: routeLinkCheck.route_sources || [],
    route_payload_field_hits: routePayloadHits,
  },
  graph_boundary: {
    selected_qa_package_items: handoff.validation?.selected_qa_package_items ?? null,
    source_hub_present: handoff.validation?.selected_source_hub_index_status === 'present',
    work_hub_present: handoff.validation?.selected_work_hub_index_status === 'present',
    source_hub_complete: handoff.validation?.selected_source_hub_index_status === 'present'
      && Number(handoff.validation?.selected_source_hub_occurrence_rows || 0) === rows.length
      && Number(handoff.validation?.selected_source_hub_target_links || 0) === Number(handoff.validation?.selected_occurrence_adjacency_target_links || 0)
      && Number(handoff.validation?.selected_source_hub_reader_facing_rows || 0) === 0
      && Number(handoff.validation?.selected_source_hub_route_payload_field_hits || 0) === 0,
    work_hub_complete: handoff.validation?.selected_work_hub_index_status === 'present'
      && Number(handoff.validation?.selected_work_hub_occurrence_rows || 0) === rows.length
      && Number(handoff.validation?.selected_work_hub_target_links || 0) === Number(handoff.validation?.selected_occurrence_adjacency_target_links || 0)
      && Number(handoff.validation?.selected_work_hub_reader_facing_rows || 0) === 0
      && Number(handoff.validation?.selected_work_hub_route_payload_field_hits || 0) === 0,
    source_hub_reader_facing_rows: handoff.validation?.selected_source_hub_reader_facing_rows ?? null,
    work_hub_reader_facing_rows: handoff.validation?.selected_work_hub_reader_facing_rows ?? null,
  },
  audit_boundary: {
    audit_review_reader_facing: auditReview.reader_facing_policy?.reader_facing ?? null,
    selected_audit_status_rows: selectedAuditStatusRows.map((row) => ({
      occurrence_id: row.occurrence_id || null,
      status: row.status || null,
      source_ref: row.source_ref || null,
    })),
  },
  forbidden_field_hits: forbiddenHits,
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage Agent 6 boundary checks ${checks.filter((check) => check.status === 'passed').length}/${checks.length} passed`);

function buildChecks() {
  const rowCount = rows.length;
  return [
    check('selected_occurrences_present', rowCount > 0, `selected rows ${rowCount}`),
    check('source_links_present', rowCount > 0 && rows.every((row) => row.source_href), `rows with source links ${rows.filter((row) => row.source_href).length}/${rowCount}`),
    check('work_anchors_present', rowCount > 0 && rows.every((row) => row.work_anchor_href), `rows with work anchors ${rows.filter((row) => row.work_anchor_href).length}/${rowCount}`),
    check('context_present', rowCount > 0 && rows.every((row) => row.context_focus_marked), `rows with marked context ${rows.filter((row) => row.context_focus_marked).length}/${rowCount}`),
    check('provenance_present', rowCount > 0 && rows.every((row) => row.license && row.license_url), `rows with license metadata ${rows.filter((row) => row.license && row.license_url).length}/${rowCount}`),
    check('route_ids_only', rows.every((row) => Array.isArray(row.route_ids)) && routePayloadHits.length === 0, `route payload field hits ${routePayloadHits.length}`),
    check('route_ids_resolve', routeLinkCheck.quality?.status === 'passed' && Number(routeLinkCheck.counts?.route_links_unresolved || 0) === 0, `resolved ${routeLinkCheck.counts?.route_links_resolved}; unresolved ${routeLinkCheck.counts?.route_links_unresolved}`),
    check('ambiguous_rows_audit_only', auditReview.reader_facing_policy?.reader_facing === false && selectedAuditStatusRows.length === 0, `audit rows ${auditReview.counts?.rows}; selected audit-status rows ${selectedAuditStatusRows.length}`),
    check('handoff_not_authoritative', handoff.consumer_boundary?.ranks_routes === false && handoff.consumer_boundary?.selects_visible_result === false, 'handoff does not rank routes or select visible results'),
    check('selected_qa_package_current', Number(handoff.validation?.selected_qa_package_items || 0) >= 24, `selected QA package items ${handoff.validation?.selected_qa_package_items}`),
    check('source_hub_handoff_complete', handoff.validation?.selected_source_hub_index_status === 'present' && Number(handoff.validation?.selected_source_hub_occurrence_rows || 0) === rowCount && Number(handoff.validation?.selected_source_hub_route_payload_field_hits || 0) === 0, `source hub ${handoff.validation?.selected_source_hub_index_status}; rows ${handoff.validation?.selected_source_hub_occurrence_rows}; payload hits ${handoff.validation?.selected_source_hub_route_payload_field_hits}`),
    check('work_hub_handoff_complete', handoff.validation?.selected_work_hub_index_status === 'present' && Number(handoff.validation?.selected_work_hub_occurrence_rows || 0) === rowCount && Number(handoff.validation?.selected_work_hub_route_payload_field_hits || 0) === 0, `work hub ${handoff.validation?.selected_work_hub_index_status}; rows ${handoff.validation?.selected_work_hub_occurrence_rows}; payload hits ${handoff.validation?.selected_work_hub_route_payload_field_hits}`),
    check('source_work_hubs_not_reader_facing', Number(handoff.validation?.selected_source_hub_reader_facing_rows || 0) === 0 && Number(handoff.validation?.selected_work_hub_reader_facing_rows || 0) === 0, `source/work reader-facing rows ${handoff.validation?.selected_source_hub_reader_facing_rows}/${handoff.validation?.selected_work_hub_reader_facing_rows}`),
    check('smoke_passed', Number(smokeValidation.counts?.failed_steps || 0) === 0, `smoke steps ${smokeValidation.counts?.steps}; failed ${smokeValidation.counts?.failed_steps}`),
    check('no_forbidden_fields', forbiddenHits.length === 0, `forbidden field hits ${forbiddenHits.length}`),
  ];
}

function check(id, passed, detail) {
  return {
    id,
    status: passed ? 'passed' : 'failed',
    detail,
  };
}

function collectForbiddenFieldHits(value) {
  return collectFieldHits(value, forbiddenFieldNames);
}

function collectFieldHits(value, fieldNames, pathParts = []) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectFieldHits(item, fieldNames, [...pathParts, String(index)]));
  }
  if (!value || typeof value !== 'object') return [];
  const hits = [];
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (fieldNames.has(key)) hits.push(itemPath);
    hits.push(...collectFieldHits(item, fieldNames, [...pathParts, key]));
  }
  return hits;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--handoff=')) parsed.handoff = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrence-lookup=')) parsed.selectedOccurrenceLookup = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-link-check=')) parsed.routeLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--audit-review=')) parsed.auditReview = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--smoke-validation=')) parsed.smokeValidation = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Agent 6 Boundary Packet',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Selected occurrence rows: ${artifact.counts.selected_occurrence_rows}`,
    `- Rows with source links: ${artifact.counts.rows_with_source_href}`,
    `- Rows with work anchors: ${artifact.counts.rows_with_work_anchor_href}`,
    `- Rows with marked context: ${artifact.counts.rows_with_context_focus_marked}`,
    `- Rows with route IDs: ${artifact.counts.rows_with_route_ids}`,
    `- Rows with license metadata: ${artifact.counts.rows_with_license}/${artifact.counts.rows_with_license_url}`,
    `- Selected QA package items: ${artifact.counts.selected_qa_package_items}`,
    `- Source hub: ${artifact.counts.selected_source_hub_status}, rows ${artifact.counts.selected_source_hub_occurrence_rows}, target links ${artifact.counts.selected_source_hub_target_links}, reader-facing ${artifact.counts.selected_source_hub_reader_facing_rows}, payload hits ${artifact.counts.selected_source_hub_route_payload_field_hits}`,
    `- Work hub: ${artifact.counts.selected_work_hub_status}, rows ${artifact.counts.selected_work_hub_occurrence_rows}, target links ${artifact.counts.selected_work_hub_target_links}, reader-facing ${artifact.counts.selected_work_hub_reader_facing_rows}, payload hits ${artifact.counts.selected_work_hub_route_payload_field_hits}`,
    `- Route links resolved/unresolved: ${artifact.counts.route_links_resolved}/${artifact.counts.route_links_unresolved}`,
    `- Route payload field hits: ${artifact.counts.route_payload_field_hits}`,
    `- Forbidden field hits: ${artifact.counts.forbidden_field_hits}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_ambiguous_rows}, blocked ${artifact.counts.audit_only_blocked_rows}, reader-facing ${artifact.audit_boundary.audit_review_reader_facing ? 'yes' : 'no'}`,
    `- Smoke validation: steps ${artifact.counts.smoke_steps}, failed ${artifact.counts.smoke_failed_steps}`,
    '',
    '## Policy',
    '',
    'This packet verifies selected usage rows are source links, work anchors, marked context, provenance, and Agent 2 route IDs only. It carries no route ranking or visible-answer authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((check) => `| ${[check.id, check.status, check.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Route Boundary',
    '',
    `- Route IDs resolve: ${artifact.route_boundary.route_ids_resolve ? 'yes' : 'no'}`,
    `- Unique route IDs: ${artifact.route_boundary.unique_route_ids}`,
    `- Route sources: ${artifact.route_boundary.route_sources.map((source) => `${source.key} (${source.count})`).join(', ')}`,
    '',
    '## Graph Boundary',
    '',
    `- Source hub present/complete: ${artifact.graph_boundary.source_hub_present ? 'yes' : 'no'}/${artifact.graph_boundary.source_hub_complete ? 'yes' : 'no'}`,
    `- Work hub present/complete: ${artifact.graph_boundary.work_hub_present ? 'yes' : 'no'}/${artifact.graph_boundary.work_hub_complete ? 'yes' : 'no'}`,
    `- Source/work hub reader-facing rows: ${artifact.graph_boundary.source_hub_reader_facing_rows}/${artifact.graph_boundary.work_hub_reader_facing_rows}`,
    '',
    '## Audit Boundary',
    '',
    `- Ambiguous rows reader-facing: ${artifact.audit_boundary.audit_review_reader_facing ? 'yes' : 'no'}`,
    `- Selected rows with audit-only status: ${artifact.audit_boundary.selected_audit_status_rows.length}`,
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
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
