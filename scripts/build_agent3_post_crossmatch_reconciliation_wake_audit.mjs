#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  sparkStandingQueueJson: 'data/control/spark_standing_queue.json',
  agent10DirectStateJson: 'reports/agent10-direct-release-package-goal-state-2026-06-05.json',
  agent10DirectStateMd: 'reports/agent10-direct-release-package-goal-state-2026-06-05.md',
  agent10FreshConsumptionJson: 'reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.json',
  agent10FreshConsumptionMd: 'reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.md',
  agent3InventoryJson: 'reports/agent3-crossmatch-inventory-packet-2026-06-05.json',
  agent3InventoryMd: 'reports/agent3-crossmatch-inventory-packet-2026-06-05.md',
  crossmatchReconciliationJson:
    'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.json',
  crossmatchReconciliationMd:
    'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.md',
  postContinuityAuditJson:
    'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json',
  postContinuityAuditMd:
    'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.md',
  postMatrixConsumptionJson:
    'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json',
  postMatrixConsumptionMd:
    'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.md',
  outputJson: 'reports/agent3-post-crossmatch-reconciliation-wake-audit-2026-06-05.json',
  outputMd: 'reports/agent3-post-crossmatch-reconciliation-wake-audit-2026-06-05.md',
};

const queue = readJson(paths.sparkStandingQueueJson);
const directState = readJson(paths.agent10DirectStateJson);
const freshConsumption = readJson(paths.agent10FreshConsumptionJson);
const inventory = readJson(paths.agent3InventoryJson);
const crossmatchReconciliation = readJson(paths.crossmatchReconciliationJson);
const postContinuityAudit = readJson(paths.postContinuityAuditJson);
const postMatrixConsumption = readJson(paths.postMatrixConsumptionJson);

const queueAgent3 = (queue.direct_agent_goal_proof || []).find((row) => row.production_lane === 'Agent 3') || null;
const directCrossmatchRow = (directState.rows || []).find((row) =>
  /crossmatch inventory/i.test(String(row.agent10_direct_release_package_goal || '')),
) || null;
const directDeuteronomyRow = (directState.rows || []).find((row) =>
  /Deuteronomy\/linkage continuation/i.test(String(row.agent10_direct_release_package_goal || '')),
) || null;
const freshInventoryRow = (freshConsumption.consumed_outputs || []).find(
  (row) => row.package_workset === 'agent3_crossmatch_inventory_packet',
) || null;
const queueText = `${queueAgent3?.direct_active_goal || ''} ${queueAgent3?.current_artifact_or_exact_blocker || ''} ${queueAgent3?.stop_condition || ''}`;
const directCrossmatchBlockers = String(directCrossmatchRow?.exact_blocker || '')
  .split(';')
  .map((entry) => entry.trim())
  .filter(Boolean);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_post_crossmatch_reconciliation_wake_audit',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  lane_owner: 'Agent 3',
  package_owner: 'Agent 3',
  status: 'post_crossmatch_reconciliation_no_new_agent3_workset',
  publication_state: 'blocked_no_render',
  target:
    'Audit the Agent 3 lane after crossmatch direct-state reconciliation and preserve the exact current wake condition without editing control or release-owner state.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run:
    'node scripts/build_agent3_post_crossmatch_reconciliation_wake_audit.mjs',
  queue_readback: {
    path: paths.sparkStandingQueueJson,
    generated_at: queue.generated_at || null,
    status: queue.status || null,
    agent3_row_present: Boolean(queueAgent3),
    agent3_direct_active_goal: queueAgent3?.direct_active_goal || null,
    agent3_current_artifact_or_exact_blocker: queueAgent3?.current_artifact_or_exact_blocker || null,
    stale_deuteronomy_contract_gap_language_observed: /Deuteronomy phase-2 contract missing exact fields/i.test(
      queueText,
    ),
  },
  agent10_direct_state_readback: {
    path: paths.agent10DirectStateJson,
    generated_at: directState.generated_at,
    crossmatch_row: directCrossmatchRow
      ? {
          goal: directCrossmatchRow.agent10_direct_release_package_goal,
          local_artifact_or_exact_blocker: directCrossmatchRow.local_artifact_or_exact_blocker,
          counts: directCrossmatchRow.counts || {},
          exact_blockers: directCrossmatchBlockers,
        }
      : null,
    deuteronomy_row: directDeuteronomyRow
      ? {
          goal: directDeuteronomyRow.agent10_direct_release_package_goal,
          local_artifact_or_exact_blocker: directDeuteronomyRow.local_artifact_or_exact_blocker,
          counts: directDeuteronomyRow.counts || {},
          exact_blocker: directDeuteronomyRow.exact_blocker || null,
        }
      : null,
  },
  current_clean_crossmatch_evidence: {
    fresh_consumption_path: paths.agent10FreshConsumptionJson,
    fresh_consumption_counts: freshInventoryRow?.counts || {},
    fresh_consumption_exact_blocker: freshInventoryRow?.exact_blocker || null,
    inventory_path: paths.agent3InventoryJson,
    inventory_counts: inventory.counts || {},
    inventory_blocker: inventory.blocker || {},
    reconciliation_path: paths.crossmatchReconciliationJson,
    reconciliation_status: crossmatchReconciliation.status,
    reconciliation_remaining_blocker: crossmatchReconciliation.remaining_blocker || {},
  },
  continuity_and_release_intake: {
    post_continuity_audit_path: paths.postContinuityAuditJson,
    post_continuity_status: postContinuityAudit.status,
    latest_agent3_package_spark10_registered:
      Number(postContinuityAudit.schema_counts?.latest_agent3_package_spark10_registered || 0),
    direct_queue_agent3_runnable_items:
      Number(postContinuityAudit.schema_counts?.direct_queue_agent3_runnable_items || 0),
    post_matrix_consumption_path: paths.postMatrixConsumptionJson,
    post_matrix_status: postMatrixConsumption.status,
    spark10_agent3_continuity_registered_rows:
      Number(postMatrixConsumption.schema_counts?.spark10_agent3_continuity_registered_rows || 0),
    direct_agent3_executable_worksets:
      Number(postMatrixConsumption.schema_counts?.direct_agent3_executable_worksets || 0),
    post_matrix_remaining_blocker: postMatrixConsumption.remaining_blocker || {},
  },
  schema_counts: {
    queue_agent3_rows: queueAgent3 ? 1 : 0,
    queue_stale_deuteronomy_contract_gap_rows: /Deuteronomy phase-2 contract missing exact fields/i.test(queueText)
      ? 1
      : 0,
    agent10_direct_crossmatch_rows: directCrossmatchRow ? 1 : 0,
    agent10_direct_crossmatch_dirty_or_uncommitted_files: number(
      directCrossmatchRow?.counts?.agent3_dirty_or_uncommitted_files,
    ),
    agent10_direct_crossmatch_exact_blockers: directCrossmatchBlockers.length,
    agent10_fresh_crossmatch_dirty_or_uncommitted_files: number(freshInventoryRow?.counts?.dirty_or_uncommitted_files),
    agent10_fresh_crossmatch_truthy_authority_claims: number(
      freshInventoryRow?.counts?.forbidden_truthy_authority_claims,
    ),
    current_inventory_dirty_or_uncommitted_files: number(inventory.counts?.dirty_or_uncommitted_files),
    current_inventory_truthy_authority_claims: number(inventory.counts?.forbidden_truthy_authority_claims),
    stale_direct_dirty_count_delta: number(crossmatchReconciliation.schema_counts?.stale_dirty_count_delta),
    top_level_agent10_direct_state_crossmatch_stale_rows:
      crossmatchReconciliation.remaining_blocker?.blocker ===
      'top_level_agent10_direct_state_crossmatch_row_stale_until_agent10_refreshes_summary'
        ? 1
        : 0,
    latest_agent3_package_spark10_registered: number(
      postContinuityAudit.schema_counts?.latest_agent3_package_spark10_registered,
    ),
    direct_queue_agent3_runnable_items: number(postContinuityAudit.schema_counts?.direct_queue_agent3_runnable_items),
    spark10_agent3_continuity_registered_rows: number(
      postMatrixConsumption.schema_counts?.spark10_agent3_continuity_registered_rows,
    ),
    direct_agent3_executable_worksets: number(
      postMatrixConsumption.schema_counts?.direct_agent3_executable_worksets,
    ),
    direct_deuteronomy_executable_worksets: number(
      directDeuteronomyRow?.counts?.direct_agent3_executable_worksets,
    ),
    no_new_agent3_workset_blockers: 2,
    control_edits: 0,
    agent6_boundary_packets_opened: 0,
    route_publication_support_rows: 0,
    definition_authority_rows: 0,
    usage_as_definition_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutations: 0,
    public_reader_output_rows: 0,
  },
  reviewed_inputs: manifest(Object.entries(paths).filter(([key]) => !key.startsWith('output'))),
  volatile_reviewed_input_roles: [
    'sparkStandingQueueJson',
    'agent10DirectStateJson',
    'agent10DirectStateMd',
    'agent10FreshConsumptionJson',
    'agent10FreshConsumptionMd',
  ],
  remaining_blockers: [
    {
      blocker: 'top_level_agent10_direct_state_crossmatch_row_stale_until_agent10_refreshes_summary',
      owner: 'Agent 10 / release-owner summary refresh',
      evidence: paths.crossmatchReconciliationJson,
    },
    {
      blocker: 'no_exact_changed_executable_agent3_workset',
      owner: 'Agent 10 / Agent 7 / queue owner supplies exact changed workset',
      evidence: paths.postMatrixConsumptionJson,
    },
  ],
  wake_condition:
    'Wake Agent 3 only with a changed Agent 3 artifact path or exact executable workset naming target rows/occurrences, route/card/source inputs, output path/schema, validator/gate, handoff owner, and stop condition.',
  handoff_owner:
    'Agent 10 for release/package intake and stale summary refresh if desired; Agent 6 only by exact boundary packet prepared through release owner; Agent 3 remains evidence-only until exact changed workset.',
  stop_condition:
    'Stop after recording that crossmatch inventory is clean, stale top-level summaries remain external to Agent 3, latest continuity registration is consumed, and no executable Agent 3 workset exists.',
  boundary: {
    source_license_acceptance: false,
    source_provenance_acceptance: false,
    qa_acceptance: false,
    definition_authority: false,
    usage_as_definition_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    answer_selection: false,
    route_publication_support: false,
    public_runtime_acceptance: false,
    publication_readiness: false,
    product_data_acceptance: false,
    package_export_authorization: false,
    accepted_gloss_text: false,
    accepted_text: false,
    translation_output: false,
    public_reader_output: false,
    public_runtime_mutation: false,
    control_state_mutation: false,
  },
  validators: [
    'node scripts/validate_agent3_post_crossmatch_reconciliation_wake_audit.mjs',
    'node scripts/validate_agent3_agent10_crossmatch_direct_state_reconciliation.mjs',
    'node scripts/validate_agent3_agent10_post_matrix_registration_consumption_package.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 post-crossmatch wake audit: stale direct ${artifact.schema_counts.agent10_direct_crossmatch_dirty_or_uncommitted_files}; current dirty ${artifact.schema_counts.current_inventory_dirty_or_uncommitted_files}; executable worksets ${artifact.schema_counts.direct_agent3_executable_worksets}`,
);

function manifest(entries) {
  return entries.map(([role, inputPath]) => {
    const absolute = resolve(inputPath);
    return {
      role,
      path: inputPath,
      exists: fs.existsSync(absolute),
      bytes: fs.existsSync(absolute) ? fs.statSync(absolute).size : 0,
      sha256: fs.existsSync(absolute) ? sha256(inputPath) : null,
    };
  });
}

function renderMarkdown(value) {
  const c = value.schema_counts;
  return `# Agent 3 Post-Crossmatch Reconciliation Wake Audit - 2026-06-05

## Status

- Artifact: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Target: ${value.target}

## Findings

- Queue Agent 3 stale Deuteronomy contract-gap rows: \`${c.queue_stale_deuteronomy_contract_gap_rows}\`
- Agent10 direct-state crossmatch dirty/uncommitted count: \`${c.agent10_direct_crossmatch_dirty_or_uncommitted_files}\`
- Agent10 fresh consumption crossmatch dirty/uncommitted count: \`${c.agent10_fresh_crossmatch_dirty_or_uncommitted_files}\`
- Current Agent3 inventory dirty/uncommitted count: \`${c.current_inventory_dirty_or_uncommitted_files}\`
- Latest Agent3 package registered in release-intake matrix: \`${Boolean(c.latest_agent3_package_spark10_registered)}\`
- Direct Agent3 executable worksets: \`${c.direct_agent3_executable_worksets}\`
- Agent6 boundary packets opened: \`${c.agent6_boundary_packets_opened}\`

## Counts

| Measure | Count |
| --- | ---: |
| Stale direct dirty-count delta | ${c.stale_direct_dirty_count_delta} |
| Top-level Agent10 crossmatch stale rows | ${c.top_level_agent10_direct_state_crossmatch_stale_rows} |
| Spark10 Agent3 continuity registered rows | ${c.spark10_agent3_continuity_registered_rows} |
| Direct queue Agent3 runnable items | ${c.direct_queue_agent3_runnable_items} |
| No-new-workset blockers | ${c.no_new_agent3_workset_blockers} |
| Control edits | ${c.control_edits} |
| Route publication / Definition / answer / accepted-text rows | ${c.route_publication_support_rows} / ${c.definition_authority_rows} / ${c.answer_rows} / ${c.accepted_text_rows} |

## Remaining Blockers

${value.remaining_blockers.map((blocker) => `- \`${blocker.blocker}\` (${blocker.owner}); evidence \`${blocker.evidence}\``).join('\n')}

## Wake Condition

${value.wake_condition}

## Boundary

This packet is non-public linkage/navigation wake evidence only. It does not authorize source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, route ranking, answer selection, route publication support, public/runtime mutation, publication readiness, product/data acceptance, translation output, accepted gloss/text, public reader output, or control-state mutation.

## Validation

${value.validators.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolute = resolve(relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}
