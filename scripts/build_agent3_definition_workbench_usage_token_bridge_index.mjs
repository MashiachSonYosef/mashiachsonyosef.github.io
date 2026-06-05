import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT = 'data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-token-bridge-index.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-token-bridge-index.md';
const REPORT_ROWS = 180;

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function bridgeKind(row) {
  const kinds = [];
  if (row.focus_appearances > 0) kinds.push('focus_token');
  if (row.work_count > 1) kinds.push('cross_work');
  if ((row.categories || []).length > 1) kinds.push('cross_category');
  if ((row.licenses || []).length > 1) kinds.push('cross_license');
  if ((row.cluster_ids || []).length > 1) kinds.push('cross_cluster');
  if (row.total_appearances >= 100) kinds.push('high_recurrence');
  return kinds;
}

function scoreBridge(row, kinds) {
  return (
    row.total_appearances +
    row.occurrence_row_count * 2 +
    row.work_count * 5 +
    (row.categories || []).length * 20 +
    (row.licenses || []).length * 10 +
    (row.cluster_ids || []).length * 15 +
    (row.focus_appearances > 0 ? 1000 : 0) +
    (kinds.includes('cross_category') ? 200 : 0) +
    (kinds.includes('cross_work') ? 150 : 0)
  );
}

const matrix = readJson(INPUT);
if (matrix.artifact_type !== 'agent3_definition_workbench_usage_concordance_token_matrix') {
  throw new Error(`${INPUT} must be agent3_definition_workbench_usage_concordance_token_matrix`);
}

const tokenRows = matrix.token_rows || [];
const bridgeRows = tokenRows
  .map((row) => {
    const kinds = bridgeKind(row);
    return {
      bridge_id: `usage-token-bridge-${row.token_normalized}`,
      token_key: row.token_key,
      token_normalized: row.token_normalized,
      surface_samples: row.surface_samples || [],
      bridge_kinds: kinds,
      bridge_score: scoreBridge(row, kinds),
      total_appearances: row.total_appearances,
      occurrence_row_count: row.occurrence_row_count,
      focus_appearances: row.focus_appearances,
      context_appearances: row.context_appearances,
      repeated_focus_context_appearances: row.repeated_focus_context_appearances,
      work_count: row.work_count,
      source_ref_count: row.source_ref_count,
      categories: row.categories || [],
      status_counts: row.status_counts || {},
      licenses: row.licenses || [],
      version_source_count: row.version_source_count,
      route_ids: row.route_ids || [],
      cluster_ids: row.cluster_ids || [],
      usage_frame_labels: row.usage_frame_labels || [],
      sample_occurrences: (row.sample_occurrences || []).map((sample) => ({
        occurrence_id: sample.occurrence_id,
        source_ref: sample.source_ref,
        source_url: sample.source_url,
        local_work_anchor: sample.local_work_anchor,
        work_id: sample.work_id,
        status: sample.status,
        usage_frame_label: sample.usage_frame_label,
        cluster_id: sample.cluster_id,
        role: sample.role,
        distance_from_focus: sample.distance_from_focus,
        related_agent2_route_ids: sample.related_agent2_route_ids || [],
        license: sample.license,
        license_url: sample.license_url,
        version_title: sample.version_title,
        version_source: sample.version_source,
        row_label: 'observed usage only',
      })),
      row_label: 'observed usage only',
      reader_facing: false,
      not_definition_authority: true,
    };
  })
  .filter((row) => row.bridge_kinds.length > 0)
  .sort((a, b) => b.bridge_score - a.bridge_score || b.total_appearances - a.total_appearances || a.token_key.localeCompare(b.token_key));

const bridgeKindCounts = new Map();
for (const row of bridgeRows) {
  for (const kind of row.bridge_kinds) bridgeKindCounts.set(kind, (bridgeKindCounts.get(kind) || 0) + 1);
}

const counts = {
  source_token_rows: tokenRows.length,
  bridge_rows: bridgeRows.length,
  focus_bridge_rows: bridgeRows.filter((row) => row.bridge_kinds.includes('focus_token')).length,
  cross_work_bridge_rows: bridgeRows.filter((row) => row.bridge_kinds.includes('cross_work')).length,
  cross_category_bridge_rows: bridgeRows.filter((row) => row.bridge_kinds.includes('cross_category')).length,
  cross_license_bridge_rows: bridgeRows.filter((row) => row.bridge_kinds.includes('cross_license')).length,
  cross_cluster_bridge_rows: bridgeRows.filter((row) => row.bridge_kinds.includes('cross_cluster')).length,
  high_recurrence_bridge_rows: bridgeRows.filter((row) => row.bridge_kinds.includes('high_recurrence')).length,
  bridge_appearances: sum(bridgeRows.map((row) => row.total_appearances)),
  bridge_occurrence_rows_total: sum(bridgeRows.map((row) => row.occurrence_row_count)),
  bridge_rows_with_samples: bridgeRows.filter((row) => row.sample_occurrences.length > 0).length,
  bridge_rows_with_license_metadata: bridgeRows.filter((row) => row.licenses.length > 0 && row.sample_occurrences.every((sample) => sample.license && sample.license_url)).length,
  bridge_rows_with_version_metadata: bridgeRows.filter((row) => row.version_source_count > 0 && row.sample_occurrences.every((sample) => sample.version_title && sample.version_source)).length,
  bridge_rows_with_route_ids: bridgeRows.filter((row) => row.route_ids.length > 0 && row.sample_occurrences.every((sample) => (sample.related_agent2_route_ids || []).length > 0)).length,
  observed_usage_only_rows: bridgeRows.filter((row) => row.row_label === 'observed usage only' && row.not_definition_authority === true).length,
  reader_facing_rows: bridgeRows.filter((row) => row.reader_facing === true).length,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_read: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const checks = [
  check('source_token_rows_present', counts.source_token_rows > 0 ? 'passed' : 'failed', `source token rows ${counts.source_token_rows}`),
  check('bridge_rows_present', counts.bridge_rows > 0 && counts.bridge_rows <= counts.source_token_rows ? 'passed' : 'failed', `bridge/source ${counts.bridge_rows}/${counts.source_token_rows}`),
  check('bridge_kinds_visible', counts.cross_work_bridge_rows > 0 && counts.cross_category_bridge_rows > 0 && counts.high_recurrence_bridge_rows > 0 ? 'passed' : 'failed', `cross-work/cross-category/high ${counts.cross_work_bridge_rows}/${counts.cross_category_bridge_rows}/${counts.high_recurrence_bridge_rows}`),
  check('sample_metadata_complete', counts.bridge_rows_with_samples === counts.bridge_rows && counts.bridge_rows_with_license_metadata === counts.bridge_rows && counts.bridge_rows_with_version_metadata === counts.bridge_rows && counts.bridge_rows_with_route_ids === counts.bridge_rows ? 'passed' : 'failed', `samples/license/version/routes ${counts.bridge_rows_with_samples}/${counts.bridge_rows_with_license_metadata}/${counts.bridge_rows_with_version_metadata}/${counts.bridge_rows_with_route_ids}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === counts.bridge_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('route_concentration_preserved', Object.keys(matrix.route_counts || {}).length === 1 ? 'warning' : 'passed', `route IDs ${Object.keys(matrix.route_counts || {}).length}`),
  check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_token_bridge_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_token_bridge_index.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  source_artifacts: {
    concordance_token_matrix: INPUT,
  },
  policy: 'Agent 3 token bridge index over existing concordance token matrix rows only. It surfaces cross-work, cross-category, cross-license, cross-cluster, focus, and high-recurrence navigation bridges. It does not read source text, import sources, expand targets, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.',
  authority_boundary: {
    observed_usage_only: true,
    token_bridge_navigation_only: true,
    route_ids_only: true,
    source_text_read: false,
    broad_target_expansion: false,
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
  bridge_kind_counts: Object.fromEntries([...bridgeKindCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  checks,
  bridge_rows: bridgeRows,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const reportRows = bridgeRows.slice(0, REPORT_ROWS);
const md = `# Agent 3 Definition Workbench Usage Token Bridge Index

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is usage-navigation bridge evidence only and does not claim Agent 6 acceptance.

## Scope

This packet derives token bridge rows from the existing concordance token matrix. It highlights normalized Hebrew tokens that bridge works, categories, licenses, clusters, or high recurrence. It does not read source text, import sources, expand targets, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Counts

- Source token rows: ${counts.source_token_rows}
- Bridge rows: ${counts.bridge_rows}
- Focus / cross-work / cross-category bridge rows: ${counts.focus_bridge_rows}/${counts.cross_work_bridge_rows}/${counts.cross_category_bridge_rows}
- Cross-license / cross-cluster / high-recurrence bridge rows: ${counts.cross_license_bridge_rows}/${counts.cross_cluster_bridge_rows}/${counts.high_recurrence_bridge_rows}
- Bridge appearances / occurrence-row total: ${counts.bridge_appearances}/${counts.bridge_occurrence_rows_total}
- Bridge rows with sample/license/version/route metadata: ${counts.bridge_rows_with_samples}/${counts.bridge_rows_with_license_metadata}/${counts.bridge_rows_with_version_metadata}/${counts.bridge_rows_with_route_ids}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Bridge Rows

| token | bridge kinds | score | appearances | occurrence rows | works | categories | licenses | statuses |
|---|---|---:|---:|---:|---:|---|---|---|
${reportRows.map((row) => `| ${mdCell(row.token_normalized)} | ${mdCell(row.bridge_kinds.join(', '))} | ${row.bridge_score} | ${row.total_appearances} | ${row.occurrence_row_count} | ${row.work_count} | ${mdCell(row.categories.join(', '))} | ${mdCell(row.licenses.join(', '))} | ${mdCell(Object.entries(row.status_counts).map(([status, count]) => `${status}:${count}`).join(', '))} |`).join('\n')}

## Boundary

Observed usage/navigation only. Bridge rows are cross-reference metadata, not Definition authority, not reviewed lexical authority, not route ranking, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not source/provenance custody acceptance, not publication readiness, not copied Agent 2 payloads, and not accepted text.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; bridge rows ${counts.bridge_rows}; source token rows ${counts.source_token_rows}`);
