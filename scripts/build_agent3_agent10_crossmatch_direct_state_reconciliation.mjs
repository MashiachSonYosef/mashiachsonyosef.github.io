#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  agent10DirectStateJson: 'reports/agent10-direct-release-package-goal-state-2026-06-05.json',
  agent10DirectStateMd: 'reports/agent10-direct-release-package-goal-state-2026-06-05.md',
  agent10FreshConsumptionJson: 'reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.json',
  agent10FreshConsumptionMd: 'reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.md',
  agent3InventoryJson: 'reports/agent3-crossmatch-inventory-packet-2026-06-05.json',
  agent3InventoryMd: 'reports/agent3-crossmatch-inventory-packet-2026-06-05.md',
  agent3StateJson: 'reports/agent3-state.json',
  agent3StateMd: 'reports/agent3-state.md',
  outputJson: 'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.json',
  outputMd: 'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.md',
};

const directState = readJson(paths.agent10DirectStateJson);
const freshConsumption = readJson(paths.agent10FreshConsumptionJson);
const inventory = readJson(paths.agent3InventoryJson);
const agent3State = readJson(paths.agent3StateJson);

const directCrossmatchRow = (directState.rows || []).find((row) =>
  /crossmatch inventory/i.test(String(row.agent10_direct_release_package_goal || '')),
);
const freshInventoryRow = (freshConsumption.consumed_outputs || []).find(
  (row) => row.package_workset === 'agent3_crossmatch_inventory_packet',
);
const freshGateProofRow = (freshConsumption.consumed_outputs || []).find(
  (row) => row.package_workset === 'agent4_agent3_crossmatch_inventory_gate_proof',
);

const directCounts = directCrossmatchRow?.counts || {};
const freshCounts = freshInventoryRow?.counts || {};
const inventoryCounts = inventory.counts || {};
const staleDirtyDelta =
  number(directCounts.agent3_dirty_or_uncommitted_files) - number(inventoryCounts.dirty_or_uncommitted_files);
const directExactBlockers = String(directCrossmatchRow?.exact_blocker || '')
  .split(';')
  .map((entry) => entry.trim())
  .filter(Boolean);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_agent10_crossmatch_direct_state_reconciliation',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  lane_owner: 'Agent 3',
  package_owner: 'Agent 3',
  status: 'agent10_direct_state_crossmatch_row_stale_current_inventory_clean',
  publication_state: 'blocked_no_render',
  target:
    'Reconcile Agent 10 top-level direct-goal crossmatch summary counts against the later Agent 10 fresh-output consumption packet and the committed Agent 3 crossmatch inventory packet.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run:
    'node scripts/build_agent3_agent10_crossmatch_direct_state_reconciliation.mjs',
  direct_state_row: {
    path: paths.agent10DirectStateJson,
    generated_at: directState.generated_at,
    goal: directCrossmatchRow?.agent10_direct_release_package_goal || null,
    local_artifact_or_exact_blocker: directCrossmatchRow?.local_artifact_or_exact_blocker || null,
    counts: directCounts,
    exact_blockers: directExactBlockers,
    stop_condition: directCrossmatchRow?.stop_condition || null,
  },
  fresh_consumption_row: {
    path: paths.agent10FreshConsumptionJson,
    generated_at: freshConsumption.generated_at,
    package_workset: freshInventoryRow?.package_workset || null,
    counts: freshCounts,
    exact_blocker: freshInventoryRow?.exact_blocker || null,
    validator_result: freshInventoryRow?.validator_result || null,
    next_handoff: freshInventoryRow?.next_handoff || null,
  },
  stale_gate_proof_reference: {
    package_workset: freshGateProofRow?.package_workset || null,
    exact_blocker: freshGateProofRow?.exact_blocker || null,
    counts: freshGateProofRow?.counts || {},
    next_handoff: freshGateProofRow?.next_handoff || null,
  },
  current_agent3_inventory: {
    path: paths.agent3InventoryJson,
    generated_at: inventory.generated_at,
    artifact_type: inventory.artifact_type,
    blocker: inventory.blocker || {},
    counts: inventoryCounts,
  },
  agent3_state_reference: {
    path: paths.agent3StateJson,
    generated_at: agent3State.generated_at,
    quality_status: agent3State.quality?.status || null,
    crossmatch_inventory_files: number(agent3State.counts?.crossmatch_inventory_files),
    crossmatch_inventory_dirty_uncommitted: number(agent3State.counts?.crossmatch_inventory_dirty_uncommitted),
    forbidden_authority_hits: number(agent3State.counts?.forbidden_authority_hits),
  },
  reconciliation: {
    direct_state_row_status: staleDirtyDelta > 0 ? 'stale_count_row_observed' : 'no_stale_count_observed',
    current_inventory_status:
      number(inventoryCounts.dirty_or_uncommitted_files) === 0 && inventory.blocker?.status === 'none'
        ? 'clean_inventory_baseline_observed'
        : 'inventory_needs_review',
    fresh_consumption_status:
      number(freshCounts.dirty_or_uncommitted_files) === 0 && freshInventoryRow?.exact_blocker === 'none_for_clean_inventory_baseline'
        ? 'agent10_fresh_consumption_already_records_clean_inventory'
        : 'fresh_consumption_needs_review',
    stale_direct_blockers_preserved_as_top_level_summary_drift: directExactBlockers,
    control_edit_authorized: false,
    release_or_boundary_route_authorized: false,
    recommended_handoff:
      'Agent 10 may refresh its top-level direct-goal summary row if desired; Agent 3 provides only this reconciliation evidence and no release/package authority.',
  },
  schema_counts: {
    direct_state_rows_matching_crossmatch: directCrossmatchRow ? 1 : 0,
    direct_state_agent3_files_in_inventory: number(directCounts.agent3_files_in_inventory),
    direct_state_agent3_dirty_or_uncommitted_files: number(directCounts.agent3_dirty_or_uncommitted_files),
    direct_state_agent3_reader_facing_rows: number(directCounts.agent3_reader_facing_rows),
    direct_state_agent3_route_payload_field_hits: number(directCounts.agent3_route_payload_field_hits),
    direct_state_agent3_forbidden_authority_field_hits: number(directCounts.agent3_forbidden_authority_field_hits),
    direct_state_exact_blockers: directExactBlockers.length,
    fresh_consumption_agent3_files_in_inventory: number(freshCounts.files_in_inventory),
    fresh_consumption_agent3_dirty_or_uncommitted_files: number(freshCounts.dirty_or_uncommitted_files),
    fresh_consumption_agent3_untracked_files: number(freshCounts.untracked_files),
    fresh_consumption_agent3_reader_facing_rows: number(freshCounts.reader_facing_rows),
    fresh_consumption_agent3_route_payload_field_hits: number(freshCounts.route_payload_field_hits),
    fresh_consumption_agent3_forbidden_authority_field_hits: number(freshCounts.forbidden_authority_field_hits),
    fresh_consumption_agent3_truthy_authority_claims: number(freshCounts.forbidden_truthy_authority_claims),
    current_inventory_files_in_inventory: number(inventoryCounts.files_in_inventory),
    current_inventory_dirty_or_uncommitted_files: number(inventoryCounts.dirty_or_uncommitted_files),
    current_inventory_untracked_files: number(inventoryCounts.untracked_files),
    current_inventory_reader_facing_rows: number(inventoryCounts.reader_facing_rows),
    current_inventory_route_payload_field_hits: number(inventoryCounts.route_payload_field_hits),
    current_inventory_forbidden_authority_field_hits: number(inventoryCounts.forbidden_authority_field_hits),
    current_inventory_truthy_authority_claims: number(inventoryCounts.forbidden_truthy_authority_claims),
    stale_dirty_count_delta: staleDirtyDelta,
    current_inventory_blocker_count: inventory.blocker?.status === 'none' ? 0 : 1,
    agent4_stale_gate_proof_blockers: freshGateProofRow?.exact_blocker ? 1 : 0,
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
  remaining_blocker: {
    blocker: 'top_level_agent10_direct_state_crossmatch_row_stale_until_agent10_refreshes_summary',
    wake_condition:
      'Agent 3 has no changed executable crossmatch workset here; wake Agent 3 only with a changed artifact path or exact workset with rows/occurrences, inputs, output schema/path, validator/gate, handoff owner, and stop condition.',
    missing_fields_for_new_agent3_workset: [
      'changed_agent3_artifact_path_or_exact_workset_id',
      'target_rows_and_occurrences_for_new_agent3_matrix',
      'route_card_or_source_route_input_set',
      'output_path_and_schema_for_new_agent3_matrix',
      'validator_or_gate_for_new_agent3_matrix',
      'handoff_trigger_for_agent10_release_package_intake',
      'stop_condition_for_new_agent3_run',
    ],
  },
  handoff_owner:
    'Agent 10 for top-level summary refresh if desired; Agent 3 remains evidence-only and held until exact changed workset.',
  stop_condition:
    'Stop after recording that Agent 10 fresh consumption and current Agent 3 inventory show a clean crossmatch inventory baseline despite the stale top-level direct-goal summary row.',
  evidence_scope: {
    usage_navigation_only: true,
    occurrence_navigation_only: true,
    route_ids_only: true,
    control_reconciliation_only: true,
  },
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
    'node scripts/validate_agent3_agent10_crossmatch_direct_state_reconciliation.mjs',
    'node scripts/validate_agent3_crossmatch_inventory_packet.mjs reports/agent3-crossmatch-inventory-packet-2026-06-05.json',
    'node scripts/validate_agent3_usage_state.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 / Agent10 crossmatch reconciliation: direct dirty ${artifact.schema_counts.direct_state_agent3_dirty_or_uncommitted_files}; current dirty ${artifact.schema_counts.current_inventory_dirty_or_uncommitted_files}; stale delta ${artifact.schema_counts.stale_dirty_count_delta}`,
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
  return `# Agent 3 / Agent 10 Crossmatch Direct-State Reconciliation - 2026-06-05

## Status

- Artifact: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Target: ${value.target}

## Reconciliation

- Agent 10 direct-state crossmatch row dirty/uncommitted count: \`${c.direct_state_agent3_dirty_or_uncommitted_files}\`
- Agent 10 fresh-output consumed Agent 3 inventory dirty/uncommitted count: \`${c.fresh_consumption_agent3_dirty_or_uncommitted_files}\`
- Current Agent 3 inventory dirty/uncommitted count: \`${c.current_inventory_dirty_or_uncommitted_files}\`
- Stale dirty-count delta: \`${c.stale_dirty_count_delta}\`
- Current inventory blocker count: \`${c.current_inventory_blocker_count}\`
- Control edits: \`${c.control_edits}\`

## Counts

| Measure | Count |
| --- | ---: |
| Direct-state Agent 3 files | ${c.direct_state_agent3_files_in_inventory} |
| Direct-state dirty/uncommitted | ${c.direct_state_agent3_dirty_or_uncommitted_files} |
| Fresh-consumption Agent 3 files | ${c.fresh_consumption_agent3_files_in_inventory} |
| Fresh-consumption dirty/uncommitted | ${c.fresh_consumption_agent3_dirty_or_uncommitted_files} |
| Current inventory files | ${c.current_inventory_files_in_inventory} |
| Current inventory dirty/uncommitted | ${c.current_inventory_dirty_or_uncommitted_files} |
| Current inventory truthy-authority claims | ${c.current_inventory_truthy_authority_claims} |
| Agent 6 boundary packets opened | ${c.agent6_boundary_packets_opened} |
| Route publication / Definition / answer / accepted-text rows | ${c.route_publication_support_rows} / ${c.definition_authority_rows} / ${c.answer_rows} / ${c.accepted_text_rows} |

## Exact Blocker

- Blocker: \`${value.remaining_blocker.blocker}\`
- Wake condition: ${value.remaining_blocker.wake_condition}
- Handoff owner: ${value.handoff_owner}
- Stop condition: ${value.stop_condition}

## Boundary

This packet is non-public control reconciliation and crossmatch/navigation evidence only. It does not authorize source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, route ranking, answer selection, route publication support, public/runtime mutation, publication readiness, product/data acceptance, translation output, accepted gloss/text, public reader output, or control-state mutation.

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
