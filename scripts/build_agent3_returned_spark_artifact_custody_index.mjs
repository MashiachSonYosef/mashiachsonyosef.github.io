#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const paths = {
  activeHandoff: 'reports/agent3-active-workset-handoff-index-2026-06-04.json',
  nextBlocker: 'reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.json',
  driftAudit: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
  frontierObserver: 'reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.json',
  orotReview: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
  deuteronomyMatrix: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  spark3OrotRun: 'reports/spark3-orot-169-row-route-card-candidate-card-dedupe-contract-run-2026-06-04.md',
  spark1DeuteronomyRun: 'reports/spark1-deuteronomy-phase2-linkage-dedupe-source-route-run-2026-06-04.md',
  spark10OrotMatrix: 'reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json',
  spark3BroadReturn: 'reports/spark3-broad-linkage-dedupe-navigation-2026-06-04-report.md',
  sparkStandingQueue: 'data/control/spark_standing_queue.json',
  broadPackage: 'reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.json',
  outputJson: 'reports/agent3-returned-spark-artifact-custody-index-2026-06-04.json',
  outputMarkdown: 'reports/agent3-returned-spark-artifact-custody-index-2026-06-04.md',
};

const activeHandoff = readJson(paths.activeHandoff);
const nextBlocker = readJson(paths.nextBlocker);
const driftAudit = readJson(paths.driftAudit);
const frontierObserver = readJson(paths.frontierObserver);
const orotReview = readJson(paths.orotReview);
const deuteronomyMatrix = readJson(paths.deuteronomyMatrix);
const spark10OrotMatrix = readJson(paths.spark10OrotMatrix);

const orotCounts = orotReview.counts || {};
const deutCounts = deuteronomyMatrix.counts || {};
const spark10Counts = spark10OrotMatrix.summary || {};
const handoffCounts = activeHandoff.schema_counts || {};

const returnedArtifacts = [
  returnedArtifact({
    id: 'spark3_orot_169_row_contract_run',
    runner: 'Spark-3',
    path: paths.spark3OrotRun,
    role: 'Orot 169-row route-card/candidate-card dedupe contract run return.',
    consumedBy: [paths.orotReview, 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md'],
    rows: orotCounts.rows,
    occurrences: orotCounts.occurrences,
    blockerRows: orotCounts.exact_blocker_rows,
    blockerOccurrences: orotCounts.exact_blocker_occurrences,
    disposition: 'consumed_by_agent3_orot_dedupe_review',
  }),
  returnedArtifact({
    id: 'spark1_deuteronomy_phase2_contract_run',
    runner: 'Spark-1',
    path: paths.spark1DeuteronomyRun,
    role: 'Deuteronomy phase-2 linkage/dedupe/source-route contract run return.',
    consumedBy: [paths.deuteronomyMatrix, 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md'],
    rows: deutCounts.rows,
    occurrences: deutCounts.occurrences,
    blockerRows: deutCounts.exact_blocker_rows,
    blockerOccurrences: deutCounts.exact_blocker_occurrences,
    disposition: 'consumed_by_agent3_deuteronomy_phase2_matrix',
  }),
  returnedArtifact({
    id: 'spark10_orot_169_row_source_route_matrix',
    runner: 'Spark-10',
    path: paths.spark10OrotMatrix,
    role: 'Orot local route-card source-route matrix used as row-count input for Agent 3 dedupe review.',
    consumedBy: [paths.orotReview, paths.broadPackage],
    rows: spark10Counts.rows,
    occurrences: spark10Counts.occurrences,
    blockerRows: spark10Counts.missing_from_placeholder_package_rows,
    blockerOccurrences: spark10Counts.missing_from_placeholder_package_occurrences,
    disposition: 'consumed_as_orot_count_source_not_package_authority',
  }),
  returnedArtifact({
    id: 'spark3_broad_linkage_dedupe_navigation_return',
    runner: 'Spark-3',
    path: paths.spark3BroadReturn,
    role: 'Broad Spark-3 linkage/dedupe/navigation return with no next queued item.',
    consumedBy: [paths.broadPackage, paths.activeHandoff],
    rows: null,
    occurrences: null,
    blockerRows: 0,
    blockerOccurrences: 0,
    disposition: 'consumed_as_prior_return_no_new_workset',
  }),
];

const unconsumedReturnedArtifacts = returnedArtifacts.filter((entry) => entry.consume_status !== 'consumed').length;

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_returned_spark_artifact_custody_index',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: unconsumedReturnedArtifacts ? 'blocked_unconsumed_returned_artifacts' : 'evidence_ready_returned_spark_custody_index',
  target: 'Returned Spark and downstream linkage artifacts for active Orot and Deuteronomy worksets.',
  files: {
    input_files: [
      paths.activeHandoff,
      paths.nextBlocker,
      paths.driftAudit,
      paths.frontierObserver,
      paths.orotReview,
      paths.deuteronomyMatrix,
      paths.spark3OrotRun,
      paths.spark1DeuteronomyRun,
      paths.spark10OrotMatrix,
      paths.spark3BroadReturn,
      paths.sparkStandingQueue,
    ],
    output_json: paths.outputJson,
    output_markdown: paths.outputMarkdown,
  },
  exact_command_or_script_to_write_or_run: 'node scripts/build_agent3_returned_spark_artifact_custody_index.mjs',
  schema_counts: {
    returned_artifacts_indexed: returnedArtifacts.length,
    returned_artifacts_consumed: returnedArtifacts.length - unconsumedReturnedArtifacts,
    unconsumed_returned_artifacts: unconsumedReturnedArtifacts,
    active_worksets_indexed: Number(handoffCounts.worksets_indexed || 0),
    total_rows: Number(handoffCounts.total_rows || 0),
    total_occurrences: Number(handoffCounts.total_occurrences || 0),
    matched_rows: Number(handoffCounts.matched_rows || 0),
    matched_occurrences: Number(handoffCounts.matched_occurrences || 0),
    blocker_rows: Number(handoffCounts.blocker_rows || 0),
    blocker_occurrences: Number(handoffCounts.blocker_occurrences || 0),
    changed_artifacts_found: Number(handoffCounts.changed_artifacts_found || 0),
    exact_new_worksets_found: Number(handoffCounts.exact_new_worksets_found || 0),
    new_matrix_rows: Number(handoffCounts.new_matrix_rows || 0),
    new_matrix_occurrences: Number(handoffCounts.new_matrix_occurrences || 0),
    route_publication_support_rows: 0,
    definition_authority_rows: 0,
    usage_as_definition_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutations: 0,
  },
  returned_artifacts: returnedArtifacts,
  active_workset_handoff: {
    artifact: paths.activeHandoff,
    status: activeHandoff.status,
    rows: Number(handoffCounts.total_rows || 0),
    occurrences: Number(handoffCounts.total_occurrences || 0),
    blocker_rows: Number(handoffCounts.blocker_rows || 0),
    blocker_occurrences: Number(handoffCounts.blocker_occurrences || 0),
    handoff_owner: 'Agent 10 for release/package intake planning; Agent 6 only through release-owner boundary packet.',
  },
  current_blocker: {
    artifact: paths.nextBlocker,
    blocker: nextBlocker.blocker || activeHandoff.current_blocker?.blocker,
    changed_artifacts_found: Number(nextBlocker.schema_counts?.changed_artifacts_found ?? handoffCounts.changed_artifacts_found ?? 0),
    exact_new_worksets_found: Number(nextBlocker.schema_counts?.exact_new_worksets_found ?? handoffCounts.exact_new_worksets_found ?? 0),
    wake_condition: nextBlocker.wake_condition || activeHandoff.current_blocker?.wake_condition,
  },
  drift_audit: {
    artifact: paths.driftAudit,
    status: driftAudit.status,
    audited_files: Number(driftAudit.counts?.audited_files || 0),
    status_only_files: Number(driftAudit.counts?.status_only_files || 0),
    substantive_changed_files: Number(driftAudit.counts?.substantive_changed_files || 0),
  },
  frontier_observer: {
    artifact: paths.frontierObserver,
    status: frontierObserver.status,
    source_license_custody_rows_observed: Number(frontierObserver.counts?.source_license_custody_rows_observed || 0),
    external_row_payloads_copied_into_agent3: Number(frontierObserver.counts?.external_row_payloads_copied_into_agent3 || 0),
  },
  validator: 'node scripts/validate_agent3_returned_spark_artifact_custody_index.mjs',
  missing_field_blocker: {
    blocker: unconsumedReturnedArtifacts ? 'unconsumed_returned_artifact' : 'missing_changed_artifact_or_exact_workset',
    missing_fields: unconsumedReturnedArtifacts
      ? ['consumer_packet_for_each_returned_artifact']
      : [
          'changed_artifact_path_or_exact_workset_id',
          'target_rows_and_occurrences_for_new_matrix',
          'route_card_or_source_route_input_set',
          'output_path_and_schema_for_new_matrix',
          'validator_or_gate_for_new_matrix',
          'handoff_trigger_for_agent10_release_package_intake',
          'stop_condition_for_new_matrix_run',
        ],
  },
  handoff_owner: 'Agent 10 for release/package intake planning; Agent 6 only by exact boundary packet prepared through release owner.',
  stop_condition: 'Stop after returned-artifact custody index proves current Spark returns are consumed and no new matrix workset is present.',
  boundary: {
    source_license_acceptance: false,
    qa_acceptance: false,
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_selection: false,
    route_publication_support: false,
    public_runtime_acceptance: false,
    publication_readiness: false,
    product_data_acceptance: false,
    accepted_gloss_text: false,
    public_runtime_mutation: false,
  },
};

writeJson(paths.outputJson, artifact);
writeMarkdown(paths.outputMarkdown, artifact);

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMarkdown}`);
console.log(`Agent 3 returned Spark custody index: returns ${artifact.schema_counts.returned_artifacts_indexed}; consumed ${artifact.schema_counts.returned_artifacts_consumed}; new worksets ${artifact.schema_counts.exact_new_worksets_found}`);

function returnedArtifact({ id, runner, path: artifactPath, role, consumedBy, rows, occurrences, blockerRows, blockerOccurrences, disposition }) {
  const missingConsumers = consumedBy.filter((consumerPath) => !exists(consumerPath));
  return {
    id,
    runner,
    returned_artifact: artifactPath,
    returned_artifact_sha256: sha256File(artifactPath),
    returned_artifact_bytes: statSize(artifactPath),
    role,
    consumed_by: consumedBy,
    consume_status: missingConsumers.length ? 'missing_consumer_blocker' : 'consumed',
    missing_consumers: missingConsumers,
    rows: rows == null ? null : Number(rows),
    occurrences: occurrences == null ? null : Number(occurrences),
    blocker_rows: Number(blockerRows || 0),
    blocker_occurrences: Number(blockerOccurrences || 0),
    disposition,
  };
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Returned Spark Artifact Custody Index - 2026-06-04',
    '',
    `- Status: \`${data.status}\``,
    `- Target: ${data.target}`,
    `- Returned artifacts indexed: ${data.schema_counts.returned_artifacts_indexed}`,
    `- Returned artifacts consumed: ${data.schema_counts.returned_artifacts_consumed}`,
    `- Unconsumed returned artifacts: ${data.schema_counts.unconsumed_returned_artifacts}`,
    `- Active worksets: ${data.schema_counts.active_worksets_indexed}`,
    `- Rows / occurrences: ${data.schema_counts.total_rows} / ${data.schema_counts.total_occurrences}`,
    `- Blocker rows / occurrences: ${data.schema_counts.blocker_rows} / ${data.schema_counts.blocker_occurrences}`,
    `- Exact new worksets found: ${data.schema_counts.exact_new_worksets_found}`,
    '',
    '## Returned Artifact Custody',
    '',
    '| Returned artifact | Runner | Rows | Occurrences | Blocker rows | Status | Disposition |',
    '| --- | --- | ---: | ---: | ---: | --- | --- |',
    ...data.returned_artifacts.map((entry) => [
      `| \`${entry.returned_artifact}\``,
      entry.runner,
      formatNullable(entry.rows),
      formatNullable(entry.occurrences),
      String(entry.blocker_rows),
      `\`${entry.consume_status}\``,
      entry.disposition,
      '|',
    ].join(' | ')),
    '',
    '## Current Blocker',
    '',
    `- Blocker: \`${data.current_blocker.blocker}\``,
    `- Changed artifacts found: ${data.current_blocker.changed_artifacts_found}`,
    `- Exact new worksets found: ${data.current_blocker.exact_new_worksets_found}`,
    `- Wake condition: ${data.current_blocker.wake_condition}`,
    '',
    '## Validation',
    '',
    `- Build: \`${data.exact_command_or_script_to_write_or_run}\``,
    `- Validator: \`${data.validator}\``,
    '',
    '## Boundary',
    '',
    'This is Agent 3 linkage/dedupe/navigation custody evidence only. It does not create QA acceptance, source/license acceptance, Definition authority, usage-as-definition authority, answer selection, route publication support, public/runtime acceptance, publication readiness, product/data acceptance, accepted gloss/text, or public/runtime mutation.',
  ];
  writeText(filePath, `${lines.join('\n')}\n`);
}

function formatNullable(value) {
  return value == null ? 'n/a' : String(value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  writeText(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  const absolutePath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, text);
}

function exists(filePath) {
  return fs.existsSync(path.join(root, filePath));
}

function statSize(filePath) {
  return fs.statSync(path.join(root, filePath)).size;
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, filePath))).digest('hex');
}
