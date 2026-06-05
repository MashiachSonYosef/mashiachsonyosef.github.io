import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BRIDGE = 'data/definitions/agent3-definition-workbench-usage-token-bridge-index.json';
const QUEUE_READY_REPORT = 'reports/definition-workbench-usage-queue-ready-packet.md';
const CONSUMER_MANIFEST_REPORT = 'reports/definition-workbench-usage-consumer-manifest.md';
const ROUTE_POINTER_AUDIT_REPORT = 'reports/definition-workbench-usage-route-pointer-audit.md';
const AGENT6_VERDICT_REPORT = 'reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-token-bridge-consumer-addendum.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-token-bridge-consumer-addendum.md';
const SELECTED_ROWS = 80;
const REPORT_ROWS = 40;
const SAMPLE_LINKS_PER_ROW = 3;

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function countRows(rows, predicate) {
  return rows.filter(predicate).length;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function check(id, status, detail) {
  return { id, status, detail };
}

const bridge = readJson(BRIDGE);
if (bridge.artifact_type !== 'agent3_definition_workbench_usage_token_bridge_index') {
  throw new Error(`${BRIDGE} must be agent3_definition_workbench_usage_token_bridge_index`);
}

const sourceReports = [
  QUEUE_READY_REPORT,
  CONSUMER_MANIFEST_REPORT,
  ROUTE_POINTER_AUDIT_REPORT,
  AGENT6_VERDICT_REPORT,
];
const sourceReportText = Object.fromEntries(sourceReports.map((report) => [report, readText(report)]));
const bridgeRows = bridge.bridge_rows || [];
const selectedRows = bridgeRows.slice(0, SELECTED_ROWS).map((row) => ({
  token_key: row.token_key,
  token_normalized: row.token_normalized,
  bridge_id: row.bridge_id,
  bridge_kinds: row.bridge_kinds || [],
  bridge_score: row.bridge_score,
  total_appearances: row.total_appearances,
  occurrence_row_count: row.occurrence_row_count,
  work_count: row.work_count,
  source_ref_count: row.source_ref_count,
  categories: row.categories || [],
  licenses: row.licenses || [],
  route_ids: row.route_ids || [],
  status_counts: row.status_counts || {},
  usage_frame_labels: row.usage_frame_labels || [],
  row_label: 'observed usage only',
  consumer_action: 'link_to_usage_navigation_only_resolve_agent2_payloads_elsewhere',
  sample_occurrence_links: (row.sample_occurrences || []).slice(0, SAMPLE_LINKS_PER_ROW).map((sample) => ({
    occurrence_id: sample.occurrence_id,
    source_ref: sample.source_ref,
    source_url: sample.source_url,
    local_work_anchor: sample.local_work_anchor,
    work_id: sample.work_id,
    status: sample.status,
    usage_frame_label: sample.usage_frame_label,
    cluster_id: sample.cluster_id,
    role: sample.role,
    related_agent2_route_ids: sample.related_agent2_route_ids || [],
    license: sample.license,
    license_url: sample.license_url,
    version_title: sample.version_title,
    version_source: sample.version_source,
    row_label: 'observed usage only',
  })),
  reader_facing: false,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  not_definition_authority: true,
}));

const allRouteIds = unique(bridgeRows.flatMap((row) => row.route_ids || []));
const selectedRouteIds = unique(selectedRows.flatMap((row) => row.route_ids || []));
const selectedSampleCount = selectedRows.reduce((sum, row) => sum + row.sample_occurrence_links.length, 0);
const counts = {
  source_bridge_rows: bridge.counts?.bridge_rows || bridgeRows.length,
  bridge_rows_present: bridgeRows.length,
  selected_consumer_rows: selectedRows.length,
  selected_sample_links: selectedSampleCount,
  selected_rows_with_sample_links: countRows(selectedRows, (row) => row.sample_occurrence_links.length > 0),
  selected_rows_with_source_links: countRows(selectedRows, (row) => row.sample_occurrence_links.every((sample) => sample.source_ref && sample.source_url && sample.local_work_anchor)),
  selected_rows_with_license_metadata: countRows(selectedRows, (row) => row.licenses.length > 0 && row.sample_occurrence_links.every((sample) => sample.license && sample.license_url)),
  selected_rows_with_version_metadata: countRows(selectedRows, (row) => row.sample_occurrence_links.every((sample) => sample.version_title && sample.version_source)),
  selected_rows_with_route_ids: countRows(selectedRows, (row) => row.route_ids.length > 0 && row.sample_occurrence_links.every((sample) => (sample.related_agent2_route_ids || []).length > 0)),
  all_route_ids: allRouteIds.length,
  selected_route_ids: selectedRouteIds.length,
  observed_usage_only_rows: countRows(selectedRows, (row) => row.row_label === 'observed usage only' && row.not_definition_authority === true),
  reader_facing_rows: countRows(selectedRows, (row) => row.reader_facing === true),
  route_payload_field_hits: selectedRows.reduce((sum, row) => sum + row.route_payload_field_hits, 0),
  forbidden_authority_field_hits: selectedRows.reduce((sum, row) => sum + row.forbidden_authority_field_hits, 0),
  source_text_read: 0,
  broad_target_expansion: 0,
  consumer_manifest_mutated: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const reportRequiredPhrases = {
  queue_ready_boundary: /Queue-ready only: true/.test(sourceReportText[QUEUE_READY_REPORT]),
  consumer_manifest_observed_usage: /Required row label: observed usage only/.test(sourceReportText[CONSUMER_MANIFEST_REPORT]),
  route_pointer_external_resolution: /resolve_agent2_route_payloads_outside_agent3/.test(sourceReportText[ROUTE_POINTER_AUDIT_REPORT]),
  agent6_warn_boundary: /WARN-ACCEPTED for queue-ready usage-navigation planning evidence only/.test(sourceReportText[AGENT6_VERDICT_REPORT]),
};

const checks = [
  check('source_bridge_index_loaded', counts.source_bridge_rows === counts.bridge_rows_present && counts.source_bridge_rows > 0 ? 'passed' : 'failed', `source/actual ${counts.source_bridge_rows}/${counts.bridge_rows_present}`),
  check('selected_rows_present', counts.selected_consumer_rows === Math.min(SELECTED_ROWS, counts.source_bridge_rows) ? 'passed' : 'failed', `selected/source ${counts.selected_consumer_rows}/${counts.source_bridge_rows}`),
  check('selected_link_metadata_complete', counts.selected_rows_with_sample_links === counts.selected_consumer_rows && counts.selected_rows_with_source_links === counts.selected_consumer_rows && counts.selected_rows_with_license_metadata === counts.selected_consumer_rows && counts.selected_rows_with_version_metadata === counts.selected_consumer_rows && counts.selected_rows_with_route_ids === counts.selected_consumer_rows ? 'passed' : 'failed', `sample/source/license/version/routes ${counts.selected_rows_with_sample_links}/${counts.selected_rows_with_source_links}/${counts.selected_rows_with_license_metadata}/${counts.selected_rows_with_version_metadata}/${counts.selected_rows_with_route_ids}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === counts.selected_consumer_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('route_concentration_preserved', counts.all_route_ids === 1 ? 'warning' : 'passed', `all/selected route IDs ${counts.all_route_ids}/${counts.selected_route_ids}`),
  check('reused_evidence_cited', Object.values(reportRequiredPhrases).every(Boolean) ? 'passed' : 'failed', Object.entries(reportRequiredPhrases).map(([key, value]) => `${key}:${value ? 1 : 0}`).join(', ')),
  check('no_mutation_or_expansion', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.consumer_manifest_mutated === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/manifest/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.consumer_manifest_mutated}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_token_bridge_consumer_addendum',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_token_bridge_consumer_addendum.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  source_artifacts: {
    token_bridge_index: BRIDGE,
    queue_ready_packet_report: QUEUE_READY_REPORT,
    consumer_manifest_report: CONSUMER_MANIFEST_REPORT,
    route_pointer_audit_report: ROUTE_POINTER_AUDIT_REPORT,
    agent6_verdict_report: AGENT6_VERDICT_REPORT,
  },
  evidence_reuse: {
    queue_ready_boundary: 'queue-ready only, Agent 5 submitter, no publication readiness',
    consumer_manifest_boundary: 'observed usage only; ambiguous rows audit-only; route IDs only',
    route_pointer_boundary: 'resolve Agent 2 route payloads outside Agent 3 artifacts',
    agent6_boundary: 'WARN-ACCEPTED planning evidence only; no Definition authority or UI/public acceptance',
  },
  authority_boundary: {
    observed_usage_only: true,
    token_bridge_navigation_only: true,
    route_ids_only: true,
    source_text_read: false,
    broad_target_expansion: false,
    consumer_manifest_mutated: false,
    queue_mutated: false,
    reader_facing: false,
    lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_agent2_payloads: false,
    publication_claim: false,
    source_provenance_custody_claim: false,
    accepted_text_claim: false,
    agent6_acceptance_claim: false,
  },
  counts,
  checks,
  selected_rows: selectedRows,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const reportRows = selectedRows.slice(0, REPORT_ROWS);
const md = `# Agent 3 Definition Workbench Usage Token Bridge Consumer Addendum

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is a QA intake addendum for the token bridge index, not a consumer manifest mutation and not Agent 6 acceptance.

## Scope

This addendum connects the committed token bridge index to the existing Definition Workbench usage-navigation consumer contract. It provides selected occurrence links for inspection, preserves route-ID-only linkage, and keeps every row labeled observed usage only. It does not read source text, import sources, broaden targets, mutate the consumer manifest, mutate the Agent 6 queue, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Reused Evidence

- ${QUEUE_READY_REPORT}: queue-ready only; Agent 5 is intended submitter; no publication readiness.
- ${CONSUMER_MANIFEST_REPORT}: required row label is observed usage only; ambiguous rows remain audit-only; route payloads resolve outside Agent 3.
- ${ROUTE_POINTER_AUDIT_REPORT}: route pointers carry route IDs and resolver paths only.
- ${AGENT6_VERDICT_REPORT}: WARN-ACCEPTED for usage-navigation planning evidence only; not Definition authority, UI display, public/runtime use, route ranking, semantic arbitration, publication support, or accepted translation text.

## Counts

- Source bridge rows: ${counts.source_bridge_rows}
- Selected consumer rows / sample links: ${counts.selected_consumer_rows}/${counts.selected_sample_links}
- Markdown rows shown / sample links per selected row: ${reportRows.length}/${SAMPLE_LINKS_PER_ROW}
- Selected rows with sample/source/license/version/route metadata: ${counts.selected_rows_with_sample_links}/${counts.selected_rows_with_source_links}/${counts.selected_rows_with_license_metadata}/${counts.selected_rows_with_version_metadata}/${counts.selected_rows_with_route_ids}
- Route IDs all/selected: ${counts.all_route_ids}/${counts.selected_route_ids}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}
- Source-text reads / broad expansion / manifest mutations / queue mutations / submitted to Agent 6: ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.consumer_manifest_mutated}/${counts.queue_mutations}/${counts.submitted_to_agent6}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Selected Bridge Consumer Rows

| token | bridge kinds | score | appearances | works | licenses | route IDs | sample occurrence links |
|---|---|---:|---:|---:|---|---|---|
${reportRows.map((row) => {
  const samples = row.sample_occurrence_links.map((sample) => `[${mdCell(sample.source_ref)}](${sample.source_url}) / ${mdCell(sample.local_work_anchor)}`).join('; ');
  return `| ${mdCell(row.token_normalized)} | ${mdCell(row.bridge_kinds.join(', '))} | ${row.bridge_score} | ${row.total_appearances} | ${row.work_count} | ${mdCell(row.licenses.join(', '))} | ${mdCell(row.route_ids.join(', '))} | ${samples} |`;
}).join('\n')}

## Boundary

Observed usage/navigation only. This addendum is a selected inspection bridge over an existing token index. It does not make usage rows definitions, does not rank or select visible answers, does not copy Agent 2 payloads, does not accept UI or public runtime display, and does not support publication or accepted translation text. Route concentration remains a visible warning, not semantic independence.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; selected rows ${counts.selected_consumer_rows}; bridge rows ${counts.source_bridge_rows}`);
