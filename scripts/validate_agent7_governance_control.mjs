#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent7-governance-control-health.md';
const issues = [];
const warnings = [];
const checks = [];

const pipeline = readJson('data/control/pipeline_state.json');
const gates = readJson('data/control/gate_registry.json');
const board = readJson('data/control/agent_goal_board.json');
const queue = readJson('data/control/agent6_validation_queue.json');
const registry = readJson('data/control/agent_registry.json');
const pulse = readJsonIfExists('data/control/pulse_state.json');
const agent7Pulse = readJsonIfExists('data/control/agent7_pulse_state.json');
const overnight = readJsonIfExists('data/control/overnight_autonomy_state.json');
const relay = readJsonIfExists('data/control/relay_state.json');

checkPublicationBlocked();
checkGoalBoardStatusLaw();
checkAgent7ValidatorRegistration();
checkSourceScopeBoundary();
checkSourceProvenanceCustodyBoundary();
checkRenderShellSourceScope();
checkRelayStateBoundaries();
checkOldHudBoundary();
checkValidatedOnlyPublicRuntimeBoundary();
checkSopQueueState();
checkQaDocketIndex();
checkAgent5Agent6HandoffIndex();
checkDeuteronomyOwnerRouteBoundary();
checkBroaderPublicRuntimeDriftBoundary();
checkAgent5Routing();
checkWorkerWatchdogBoundary();
checkAgent5CurrentHandoffGuidance();
checkAgent7PulseStateBoundary();
checkPulseCadenceBoundary();
checkRouteInputFreezeBoundary();
checkWorkbenchHandoffAuthority();
checkAgent8Boundary();
checkAgent9Boundary();
checkAgent12Boundary();
checkAgent13OrganizationBoundary();
checkAgentRegistrySops();
writeReport();

if (issues.length) {
  console.error(`Agent 7 governance control failed with ${issues.length} issue(s), ${warnings.length} warning(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 7 governance control passed with ${warnings.length} warning(s). Report: ${reportPath}`);

function checkPublicationBlocked() {
  const label = 'publication blocked_no_render';
  const values = [
    ['pipeline', pipeline.publication_global_status],
    ['gate_registry', gates.publication_global_status],
    ['goal_board', board.publication_global_status],
    ['queue', queue.publication_global_status],
    ['registry', registry.publication_global_status],
  ];
  const bad = values.filter(([, value]) => value !== 'blocked_no_render');
  if (bad.length) {
    fail(label, bad.map(([name, value]) => `${name}=${value || 'missing'}`).join('; '));
  } else {
    pass(label, 'all checked control files preserve blocked_no_render');
  }
}

function checkGoalBoardStatusLaw() {
  const label = 'goal board status law';
  const required = ['active', 'blocked', 'evidence-ready', 'awaiting-Agent-6', 'Agent-6-accepted'];
  const allowed = board.status_model?.allowed_statuses || [];
  for (const status of required) {
    if (!allowed.includes(status)) fail(label, `allowed_statuses missing ${status}`);
  }
  if (allowed.length !== required.length) fail(label, `allowed_statuses has unexpected length ${allowed.length}`);
  if (board.status_model?.qa_acceptance_status !== 'Agent-6-accepted') {
    fail(label, `qa_acceptance_status is ${board.status_model?.qa_acceptance_status || 'missing'}`);
  }
  if (board.status_model?.agent6_docket_required_for_agent6_accepted !== true) {
    fail(label, 'agent6_docket_required_for_agent6_accepted is not true');
  }
  if (board.status_model?.worker_report_terminal_status_allowed !== false) {
    fail(label, 'worker_report_terminal_status_allowed is not false');
  }
  const authorityText = JSON.stringify(board.authority || {}).toLowerCase();
  for (const phrase of [
    'only a dated agent 6 docket',
    'may not suppress agent 6 blockers',
    'may not redefine acceptance criteria',
    'may not narrow agent 6 validation scope',
    'may not convert evidence packets into acceptance claims',
  ]) {
    if (!authorityText.includes(phrase)) fail(label, `authority boundary missing: ${phrase}`);
  }
  const awaitingRule = (board.status_model?.transition_rules || []).find((rule) => rule.from === 'awaiting-Agent-6');
  if (!awaitingRule || !Array.isArray(awaitingRule.to) || !awaitingRule.to.includes('Agent-6-accepted')) {
    fail(label, 'awaiting-Agent-6 transition to Agent-6-accepted missing');
  } else if (JSON.stringify(awaitingRule.allowed_by || []).toLowerCase() !== JSON.stringify(['Agent 6 dated pass/warn/block docket']).toLowerCase()) {
    fail(label, 'Agent-6-accepted transition is not limited to Agent 6 dated docket');
  }
  for (const goal of board.goals || []) {
    if (goal.status === 'Agent-6-accepted') {
      if (goal.qa_relevant !== true) continue;
      const docketText = JSON.stringify(goal).toLowerCase();
      if (!docketText.includes('agent6') || !docketText.includes('docket')) {
        fail(label, `${goal.id || 'unknown goal'} is Agent-6-accepted without Agent 6 docket evidence`);
      }
    }
    if (goal.qa_relevant === true && goal.acceptance_owner && goal.acceptance_owner !== 'Agent 6') {
      fail(label, `${goal.id || 'unknown goal'} qa_relevant acceptance_owner is ${goal.acceptance_owner}`);
    }
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'required statuses and Agent 6-only acceptance transition are preserved');
  }
}

function checkAgent7ValidatorRegistration() {
  const label = 'Agent 7 validator registration';
  const states = [
    ['pipeline_state', pipeline],
    ['gate_registry', gates],
    ['agent_goal_board', board],
    ['pulse_state', pulse],
    ['agent7_pulse_state', agent7Pulse],
    ['overnight_autonomy_state', overnight],
  ];
  const requiredBoundaryPhrases = [
    'goal-board status law',
    'agent 6-only acceptance',
    'corrected source/provenance custody mapping boundary',
    'six modified tracked source files outside the 23-file source docket',
    'validated-only public/runtime default-closed boundary',
    'qa docket index sync',
    'agent 5/6 handoff sync',
    'deuteronomy owner-route boundary',
    'broader public-runtime drift boundary',
    'worker watchdog delivery-proof boundary',
    'agent 5 current handoff guidance',
    'agent 7 pulse state boundary',
    'relay state boundaries',
    'pulse cadence/no-active-worker prompt boundary',
    'workbench handoff authority',
    'agent 8/9 authority boundaries',
    'agent 12 limiter boundary',
    'product/data gate acceptance',
  ];
  for (const [name, state] of states) {
    if (!state) {
      fail(label, `${name} missing`);
      continue;
    }
    const entry = state.agent7_governance_control_validator;
    if (!entry) {
      fail(label, `${name} missing agent7_governance_control_validator`);
      continue;
    }
    if (entry.script !== 'scripts/validate_agent7_governance_control.mjs') {
      fail(label, `${name} validator script is ${entry.script || 'missing'}`);
    }
    const boundary = String(entry.boundary || '').toLowerCase();
    for (const phrase of requiredBoundaryPhrases) {
      if (!boundary.includes(phrase)) fail(label, `${name} validator boundary missing ${phrase}`);
    }
    if (!String(entry.scope_update_reason || '').toLowerCase().includes('live checks')) {
      fail(label, `${name} validator scope_update_reason missing live checks rationale`);
    }
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'registered validator scope matches current governance checks and non-acceptance boundary');
  }
}

function checkSourceScopeBoundary() {
  const label = 'source scope direct-23/audit-23 boundary';
  const boundary = pipeline.current_source_scope_evidence_boundary || gates.current_source_scope_evidence_boundary || {};
  const expectedModifiedTracked = [
    'data/sources/abarbanel-on-guide-for-the-perplexed.json',
    'data/sources/crescas-on-guide-for-the-perplexed.json',
    'data/sources/efodi-on-guide-for-the-perplexed.json',
    'data/sources/narboni-on-guide-for-the-perplexed.json',
    'data/sources/shem-tov-on-guide-for-the-perplexed.json',
    'data/sources/yahel-ohr-on-zohar.json',
  ];
  if (boundary.status !== 'warn_accepted_source_scope_report_truth_direct23_audit23_provenance_blocked') {
    fail(label, `unexpected status ${boundary.status || 'missing'}`);
  }
  if (Number(boundary.direct_untracked_source_files) !== 23) fail(label, 'direct_untracked_source_files is not 23');
  if (Number(boundary.audit_reported_untracked_source_files) !== 23) fail(label, 'audit_reported_untracked_source_files is not 23');
  if (Number(boundary.missing_from_current_audit_files) !== 0) fail(label, 'missing_from_current_audit_files is not 0');
  if (!String(boundary.quarantine || '').includes('all 23')) fail(label, 'all-23 quarantine wording missing');
  const notAccepted = (boundary.not_accepted || []).join(' | ').toLowerCase();
  for (const phrase of ['source/provenance', 'publication', 'page/render', 'accepted translation']) {
    if (!notAccepted.includes(phrase)) fail(label, `not_accepted missing ${phrase}`);
  }
  if (Number(boundary.modified_tracked_source_files_outside_docket_count) !== expectedModifiedTracked.length) {
    fail(label, `modified tracked source file carve-out count is ${boundary.modified_tracked_source_files_outside_docket_count || 'missing'}`);
  }
  const modified = Array.isArray(boundary.modified_tracked_source_files_outside_docket) ? boundary.modified_tracked_source_files_outside_docket : [];
  for (const file of expectedModifiedTracked) {
    if (!modified.includes(file)) fail(label, `modified tracked source carve-out missing ${file}`);
  }
  const modifiedBoundary = String(boundary.modified_tracked_source_files_boundary || '').toLowerCase();
  for (const phrase of ['outside the agent 6 direct-23/audit-23', 'separate custody/drift', 'source/provenance', 'public/runtime']) {
    if (!modifiedBoundary.includes(phrase)) fail(label, `modified tracked source boundary missing ${phrase}`);
  }
  const sourceQueue = (queue.queue || []).find((entry) => entry.request_id === 'agent6-agent1-source-report-contradiction') || {};
  const sourceQueueText = JSON.stringify(sourceQueue).toLowerCase();
  if (!sourceQueueText.includes('six modified tracked source files') || !sourceQueueText.includes('outside this docket')) {
    fail(label, 'Agent 6 source queue item does not preserve six modified tracked source file carve-out');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'direct-23/audit-23 report truth only; provenance, publication, and six modified tracked source files remain outside acceptance');
  }
}

function checkSourceProvenanceCustodyBoundary() {
  const label = 'corrected source/provenance custody mapping boundary';
  const queueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-agent1-source-provenance-custody-packet') || {};
  const closureQueueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-agent1-source-custody-closure-decision-packet') || {};
  const followupQueueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-agent1-source-custody-followup-packets') || {};
  const goal = (board.goals || []).find((entry) => entry.id === 'agent1-source-scope-reconciliation') || {};
  const pulseItem = agent7Pulse?.latest_agent6_dockets?.source_provenance_custody || {};
  const handoff = readJsonIfExists('reports/agent5-agent6-handoff-index.json') || {};
  const handoffRow = (handoff.rows || []).find((row) => row.request_id === 'agent6-agent1-source-provenance-custody-packet') || {};
  const combined = JSON.stringify({ queueItem, closureQueueItem, followupQueueItem, goal, pulseItem, handoffRow }).toLowerCase();

  if (queueItem.status !== 'returned_warn_accepted_corrected_custody_mapping_only_source_provenance_blocked') {
    fail(label, `queue status is ${queueItem.status || 'missing'}`);
  }
  if (queueItem.returned_docket !== 'reports/agent6-agent1-corrected-custody-recheck-verdict-2026-06-02.md') {
    fail(label, `queue returned_docket is ${queueItem.returned_docket || 'missing'}`);
  }
  const goalTracksReturnedCustodyPacket = goal.current_agent6_queue_status === queueItem.status;
  const goalTracksClosureDecisionPacket =
    goal.current_agent6_queue_item === 'agent6-agent1-source-custody-closure-decision-packet'
    && goal.current_agent6_queue_status === closureQueueItem.status
    && String(goal.latest_agent1_custody_packet?.state || '').toLowerCase().includes('warn-accepted')
    && (
      String(goal.latest_agent1_source_custody_decision_packet?.state || '').toLowerCase().includes('queued awaiting agent 6') ||
      String(goal.latest_agent1_source_custody_decision_packet?.state || '').toLowerCase().includes('returned warn-accepted source-custody disposition-control')
    );
  const followupStatus = String(followupQueueItem.status || '');
  const followupGoalState = String(goal.latest_agent1_source_custody_followup_packets?.state || '').toLowerCase();
  const followupBoundary = String(goal.current_boundary || '').toLowerCase();
  const goalTracksFollowupPacket =
    goal.current_agent6_queue_item === 'agent6-agent1-source-custody-followup-packets'
    && goal.current_agent6_queue_status === followupQueueItem.status
    && [
      'queued_awaiting_agent6_source_custody_followup_packets_verdict',
      'returned_warn_accepted_source_custody_followup_disposition_evidence_only_packet_b_blocked_source_provenance_blocked',
    ].includes(followupStatus)
    && followupBoundary.includes('packet a tracking-review candidates')
    && followupBoundary.includes('packet c')
    && followupBoundary.includes('not source/provenance acceptance');
  if (!goalTracksReturnedCustodyPacket && !goalTracksClosureDecisionPacket && !goalTracksFollowupPacket) {
    fail(label, `Agent 1 goal current_agent6_queue_status is ${goal.current_agent6_queue_status || 'missing'}`);
  }
  if (pulseItem.status !== 'warn_accepted_corrected_custody_mapping_only_source_provenance_blocked') {
    fail(label, `Agent 7 pulse custody status is ${pulseItem.status || 'missing'}`);
  }
  const closureText = JSON.stringify({ closureQueueItem, goal }).toLowerCase();
  for (const phrase of [
    '17 untracked source files with lexical manifests',
    '6 untracked source files missing lexical manifests',
    '6 modified tracked source files',
    '242 direct artifact paths',
    '71 content-reference paths',
    '42 route/hud content-reference rows',
    '29 public lexical content-reference rows',
    'zero reader/workbench or translation-memory',
    'source/provenance acceptance remains blocked',
  ]) {
    if (!closureText.includes(phrase)) fail(label, `current source-custody closure phrase missing: ${phrase}`);
  }
  for (const staleCurrentPhrase of [
    '64 blocked content-reference paths',
    '64 content-reference paths',
  ]) {
    if (closureText.includes(staleCurrentPhrase)) {
      fail(label, `current source-custody closure still carries stale narrative: ${staleCurrentPhrase}`);
    }
  }
  if (followupQueueItem.request_id) {
    for (const phrase of [
      'packet a tracking-review candidates',
      '17 tracking-review candidate sources',
      '153 blocked direct',
      '13 blocked content',
      'packet b missing-manifest',
      '6 missing-manifest sources',
      '30 blocked direct',
      '1 blocked content',
      'packet c license-label normalization',
      '1406 scalar diffs',
      '0 non-license diffs',
      '0 non-pd-to-public-domain diffs',
      'source/provenance acceptance',
      'source-file tracking approval',
      'downstream direct artifact acceptance',
      'downstream content-reference acceptance',
      'publication remains blocked_no_render',
    ]) {
      if (!combined.includes(phrase)) fail(label, `source-custody follow-up phrase missing: ${phrase}`);
    }
  }
  for (const phrase of [
    'warn-accepted corrected agent 1 custody/reliance mapping evidence only',
    'source/provenance acceptance remains blocked',
    '23 untracked quarantined sources',
    'six modified tracked source files outside acceptance',
    '29/29 source rows fingerprinted sha-256',
    '0 visible source/license row misses',
    '23/23 untracked and 6/6 modified tracked sources with downstream reliance hits',
    'six untracked missing lexical manifests',
    '242 downstream direct artifact rows',
    '61 downstream content-reference rows',
    'do not claim source/provenance acceptance without a future agent 6 docket',
  ]) {
    if (!combined.includes(phrase)) fail(label, `custody boundary phrase missing: ${phrase}`);
  }
  for (const forbidden of [
    'source/provenance custody acceptance',
    'source publication',
    'page/render acceptance',
    'public/runtime acceptance',
    'publication readiness',
    'future publication support',
    'route publication support',
    'accepted translation text',
    'acceptance of the six modified tracked source files',
    'worker evidence as agent 6 acceptance',
  ]) {
    if (!combined.includes(forbidden)) fail(label, `non-acceptance phrase missing: ${forbidden}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'corrected custody/reliance mapping remains WARN evidence only with source/provenance blocked and follow-up limits preserved');
  }
}

function checkRenderShellSourceScope() {
  const label = 'render_shell source scope';
  const renderShell = (pipeline.stages || []).find((stage) => stage.name === 'render_shell');
  if (!renderShell) {
    fail(label, 'render_shell stage missing');
    return;
  }
  const audit = renderShell.latest_untracked_source_scope_audit || {};
  if (Number(audit.direct_untracked_source_files) !== 23) fail(label, 'render_shell direct count is not 23');
  if (Number(audit.audit_reported_untracked_source_files) !== 23) fail(label, 'render_shell audit count is not 23');
  if (Number(audit.missing_from_current_audit_files) !== 0) fail(label, 'render_shell missing audit count is not 0');
  const expectedModifiedTracked = [
    'data/sources/abarbanel-on-guide-for-the-perplexed.json',
    'data/sources/crescas-on-guide-for-the-perplexed.json',
    'data/sources/efodi-on-guide-for-the-perplexed.json',
    'data/sources/narboni-on-guide-for-the-perplexed.json',
    'data/sources/shem-tov-on-guide-for-the-perplexed.json',
    'data/sources/yahel-ohr-on-zohar.json',
  ];
  if (Number(renderShell.modified_tracked_source_files_outside_docket_count) !== expectedModifiedTracked.length) {
    fail(label, `render_shell modified tracked source file carve-out count is ${renderShell.modified_tracked_source_files_outside_docket_count || 'missing'}`);
  }
  const modified = Array.isArray(renderShell.modified_tracked_source_files_outside_docket) ? renderShell.modified_tracked_source_files_outside_docket : [];
  for (const file of expectedModifiedTracked) {
    if (!modified.includes(file)) fail(label, `render_shell modified tracked source carve-out missing ${file}`);
  }
  if (audit.agent6_docket !== 'reports/agent6-source-scope-23-reconciliation-verdict-2026-06-01.md') {
    fail(label, `render_shell agent6_docket is ${audit.agent6_docket || 'missing'}`);
  }
  const activeText = JSON.stringify({
    state: renderShell.state,
    risk: renderShell.risk,
    latest_untracked_source_scope_audit: renderShell.latest_untracked_source_scope_audit,
    current_source_scope_state: renderShell.current_source_scope_state,
  }).toLowerCase();
  if (/direct[-_ ]?19.*audit[-_ ]?13|direct shell discovery 19|audit\/provided list reports 13/.test(activeText)) {
    fail(label, 'render_shell active fields still contain stale direct-19/audit-13 language');
  }
  if (!String(renderShell.risk || '').toLowerCase().includes('source/provenance custody') || !String(renderShell.risk || '').toLowerCase().includes('blocked')) {
    fail(label, 'render_shell risk does not preserve provenance blocked boundary');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'active render_shell fields use direct-23/audit-23 and preserve provenance block');
  }
}

function checkRelayStateBoundaries() {
  const label = 'relay state boundaries';
  if (!relay) {
    fail(label, 'relay_state.json missing');
    return;
  }
  if (relay.artifact_type !== 'agent5_relay_state') fail(label, `unexpected artifact_type ${relay.artifact_type || 'missing'}`);
  if (relay.publication_global_status !== 'blocked_no_render') fail(label, 'relay publication_global_status is not blocked_no_render');
  const globalBoundaryText = JSON.stringify(relay.current_global_boundaries || {}).toLowerCase();
  for (const phrase of [
    'blocked_no_render',
    'direct-23/audit-23',
    'all 23 untracked source files remain quarantined',
    'source/provenance custody remains blocked',
    'six modified tracked source files remain outside the docket',
    'quarantined_legacy_license_risk',
    'not qa acceptance',
    'product/data gate acceptance',
  ]) {
    if (!globalBoundaryText.includes(phrase)) fail(label, `relay current_global_boundaries missing ${phrase}`);
  }
  const relays = Array.isArray(relay.relays) ? relay.relays : [];
  const sourceRelay = relays.find((item) => item.id === 'agent1-source-render-custody');
  if (!sourceRelay) {
    fail(label, 'agent1-source-render-custody relay missing');
  } else {
    const text = JSON.stringify(sourceRelay).toLowerCase();
    if (sourceRelay.state !== 'obsolete') fail(label, `source relay state is ${sourceRelay.state || 'missing'}, expected obsolete`);
    if (/reconcile (the )?13|13 untracked source|13 files/.test(text)) fail(label, 'source relay still instructs stale lower-count source reconciliation');
    for (const phrase of [
      'direct-23/audit-23',
      'do not prompt agent 1',
      'all 23 untracked source files remain quarantined',
      'six modified tracked source files',
      'source/provenance custody remains blocked',
    ]) {
      if (!text.includes(phrase)) fail(label, `source relay missing current boundary: ${phrase}`);
    }
  }
  const agent2Relay = relays.find((item) => item.id === 'agent2-release-candidate-discipline');
  if (agent2Relay && !String(agent2Relay.current_instruction || '').toLowerCase().includes('not publication readiness')) {
    fail(label, 'Agent 2 relay does not preserve route-not-publication boundary');
  }
  const agent4Relay = relays.find((item) => item.id === 'agent4-reader-workbench-expansion-targets');
  if (agent4Relay) {
    const text = String(agent4Relay.current_instruction || '').toLowerCase();
    for (const phrase of ['bounded reader workbench', 'do not broad-render', 'do not request publication', 'do not count deferred pages']) {
      if (!text.includes(phrase)) fail(label, `Agent 4 Reader Workbench relay missing ${phrase}`);
    }
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'relay state preserves current source, route, and Reader Workbench boundaries');
  }
}

function checkOldHudBoundary() {
  const label = 'old HUD quarantine boundary';
  const text = JSON.stringify({ pipeline, gates, board }).toLowerCase();
  if (!text.includes('quarantined_legacy_license_risk')) fail(label, 'quarantined_legacy_license_risk missing');
  if (!text.includes('static') || !text.includes('dynamic') || !text.includes('kill')) {
    warn(label, 'old-HUD static/dynamic kill-switch wording is not obvious across control state');
  }
  if (/old hud[^"]{0,80}(public use accepted|accepted public use)|old-hud[^"]{0,80}(public use accepted|accepted public use)/.test(text)) {
    fail(label, 'old-HUD public-use acceptance wording found');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'old HUD remains quarantined and dynamic/fallback proof remains bounded');
  }
}

function checkValidatedOnlyPublicRuntimeBoundary() {
  const label = 'validated-only public/runtime boundary';
  for (const [name, surface] of [
    ['pipeline', pipeline.public_surface_license_risk_priority_correction],
    ['gate_registry', gates.public_surface_license_risk_priority_correction],
  ]) {
    if (!surface) {
      fail(label, `${name} public_surface_license_risk_priority_correction missing`);
      continue;
    }
    if (surface.status !== 'active_priority_direction_no_new_acceptance') {
      fail(label, `${name} public surface status is ${surface.status || 'missing'}`);
    }
    const text = JSON.stringify(surface).toLowerCase();
    for (const phrase of [
      'public/runtime surfaces are default closed',
      'exact agent 6 docket',
      'only agent 6-validated artifacts/features',
      'validator success as qa acceptance',
      'worker evidence as public/runtime permission',
      'old hud public fallback',
      'reader workbench broad rollout',
      'definition workbench authority',
      'route publication support',
      'usage-as-definition authority',
      'accepted translation text',
    ]) {
      if (!text.includes(phrase)) fail(label, `${name} public surface boundary missing: ${phrase}`);
    }
  }

  for (const [name, spec] of [
    ['pipeline SPEC-001', pipeline.spec_001_public_runtime_surface_control],
    ['gate_registry SPEC-001', gates.spec_001_public_runtime_surface_control],
  ]) {
    if (!spec) {
      fail(label, `${name} missing`);
      continue;
    }
    if (!String(spec.status || '').includes('specification_control_only')) fail(label, `${name} is not specification-control only`);
    const specText = JSON.stringify(spec).toLowerCase();
    for (const phrase of [
      'does not accept any public/runtime surface',
      'not public/runtime acceptance',
      'old-hud public-use acceptance',
      'publication remains blocked_no_render',
      'old hud remains quarantined_legacy_license_risk',
      'accepted translation text',
      'product/data gate acceptance',
    ]) {
      if (!specText.includes(phrase)) fail(label, `${name} missing warning limit: ${phrase}`);
    }
  }

  for (const [name, spec] of [
    ['pipeline SPEC-003', pipeline.spec_003_hud_runtime_validation],
    ['gate_registry SPEC-003', gates.spec_003_hud_runtime_validation],
  ]) {
    if (!spec) {
      fail(label, `${name} missing`);
      continue;
    }
    if (!String(spec.status || '').includes('specification_control_only')) fail(label, `${name} is not specification-control only`);
    const specText = JSON.stringify(spec).toLowerCase();
    for (const phrase of [
      'no new hud rollout',
      'public/runtime acceptance',
      'old-hud public use',
      'live browser-click proof',
      'reader workbench broad rollout',
      'route publication support',
      'usage-as-definition authority',
      'accepted translation text',
    ]) {
      if (!specText.includes(phrase)) fail(label, `${name} missing HUD/runtime non-acceptance: ${phrase}`);
    }
  }

  const queueById = new Map((queue.queue || []).map((item) => [item.request_id, item]));
  const publicQueueExpectations = [
    ['agent6-spec-001-public-runtime-surface-control', 'returned_warn_accepted_specification_control_only'],
    ['agent6-spec-003-hud-runtime-validation', 'returned_warn_accepted_specification_control_only_after_queue_repair'],
    ['agent6-reader-workbench-broader-rollout-recheck', 'returned_pass_for_eight_included_pages_only'],
    ['agent6-reader-workbench-followup-targets', 'returned_warn_accepted_static_followup_four_pages_only_browser_click_unproven_beer_hagolah_blocked'],
  ];
  for (const [id, status] of publicQueueExpectations) {
    const item = queueById.get(id);
    if (!item) {
      fail(label, `${id} missing from Agent 6 queue`);
      continue;
    }
    if (item.status !== status) fail(label, `${id} status ${item.status || 'missing'}, expected ${status}`);
  }
  const oldHudQueue = queueById.get('agent6-old-hud-quarantine-killswitch-coverage');
  const allowedOldHudStatuses = [
    'returned_warn_accepted_static_evidence_only_dynamic_killswitch_gate_open',
    'queued_agent4_dynamic_fallback_packet_awaiting_agent6',
    'returned_warn_accepted_repo_static_simulated_dynamic_killswitch_evidence_only_deployment_gate_open',
  ];
  if (!oldHudQueue) {
    fail(label, 'agent6-old-hud-quarantine-killswitch-coverage missing from Agent 6 queue');
  } else if (!allowedOldHudStatuses.includes(oldHudQueue.status)) {
    fail(label, `agent6-old-hud-quarantine-killswitch-coverage status ${oldHudQueue.status || 'missing'} is not an allowed old-HUD boundary state`);
  }

  const workbench = queueById.get('agent6-reader-workbench-broader-rollout-recheck');
  const workbenchText = JSON.stringify(workbench || {}).toLowerCase();
  if (!workbenchText.includes('eight included') || !workbenchText.includes('broad rollout') || !workbenchText.includes('deferred')) {
    fail(label, 'Reader Workbench queue item does not preserve eight-page-only / no broad rollout / no deferred boundary');
  }
  const oldHud = oldHudQueue;
  const oldHudText = JSON.stringify(oldHud || {}).toLowerCase();
  if (!oldHudText.includes('quarantined_legacy_license_risk') || !oldHudText.includes('live browser-click proof') || !oldHudText.includes('public/runtime acceptance')) {
    fail(label, 'old-HUD queue item does not preserve quarantine and non-acceptance boundary');
  }
  if (oldHud?.status === 'queued_agent4_dynamic_fallback_packet_awaiting_agent6') {
    for (const phrase of ['dynamic/fallback exposure packet', 'review the agent 4 dynamic/fallback', 'do not infer live browser-click proof']) {
      if (!oldHudText.includes(phrase)) fail(label, `queued old-HUD item missing dynamic/fallback boundary: ${phrase}`);
    }
  } else if (oldHud?.status === 'returned_warn_accepted_repo_static_simulated_dynamic_killswitch_evidence_only_deployment_gate_open') {
    for (const phrase of ['repository-file static plus node vm simulated dynamic/fallback evidence only', 'deployed/cdn/stale-bundle proof', 'old-hud public use']) {
      if (!oldHudText.includes(phrase)) fail(label, `returned dynamic old-HUD item missing warning boundary: ${phrase}`);
    }
  } else if (!oldHudText.includes('static filesystem evidence only') || !oldHudText.includes('full old-hud kill-switch')) {
    fail(label, 'returned old-HUD item does not preserve static-only and dynamic/fallback gate boundary');
  }

  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'validated-only public/runtime boundaries are present across pipeline, gates, and Agent 6 queue');
  }
}

function checkSopQueueState() {
  const label = 'SOP queue returned state';
  const expected = new Map([
    ['agent6-sop-002-sop-verdict', 'returned_warn_accepted_workflow_control_only'],
    ['agent6-agent-sop-and-spec-signoff', 'returned_warn_accepted_preliminary_lane_interface_and_spec_control_only'],
  ]);
  for (const [id, status] of expected) {
    const item = (queue.queue || []).find((entry) => entry.request_id === id);
    if (!item) {
      fail(label, `${id} missing from queue`);
      continue;
    }
    if (item.status !== status) fail(label, `${id} status ${item.status || 'missing'}, expected ${status}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'SOP queue items match Agent 6 returned WARN boundaries');
  }
}

function checkQaDocketIndex() {
  const label = 'QA docket index sync';
  const docketIndex = readJsonIfExists('data/control/qa_docket_index.json');
  if (!docketIndex) {
    fail(label, 'missing data/control/qa_docket_index.json');
    return;
  }
  if (docketIndex.artifact_type !== 'agent5_qa_docket_index') fail(label, `unexpected artifact_type ${docketIndex.artifact_type || 'missing'}`);
  if (docketIndex.qa_authority !== 'Agent 6') fail(label, `qa_authority is ${docketIndex.qa_authority || 'missing'}`);
  if (docketIndex.publication_global_status !== 'blocked_no_render') fail(label, 'publication_global_status is not blocked_no_render');
  if (Number(docketIndex.source_queue_version || 0) !== Number(queue.version || 0)) {
    fail(label, `source_queue_version ${docketIndex.source_queue_version || 'missing'} does not match queue version ${queue.version || 'missing'}`);
  }
  const dockets = Array.isArray(docketIndex.dockets) ? docketIndex.dockets : [];
  const byId = new Map(dockets.map((docket) => [docket.id, docket]));
  for (const item of queue.queue || []) {
    const docket = byId.get(item.request_id);
    if (!docket) {
      fail(label, `${item.request_id} missing from docket index`);
      continue;
    }
    if (docket.status !== item.status) fail(label, `${item.request_id} docket status ${docket.status || 'missing'} does not match queue ${item.status || 'missing'}`);
  }
  for (const docket of dockets) {
    if (!(queue.queue || []).find((item) => item.request_id === docket.id)) fail(label, `${docket.id || 'unknown'} exists in docket index but not queue`);
  }
  const text = JSON.stringify(docketIndex).toLowerCase();
  if (/queued_sop_002|queued_eight_document/.test(text)) {
    fail(label, 'docket index contains stale SOP queue wording');
  }
  if (/direct-19\/audit-13|direct_19_audit_13|direct-55\/audit-13/.test(text) && !/supersedes stale direct-55\/audit-13.*direct-19\/audit-13|stale direct-55\/audit-13 and direct-19\/audit-13 blocker states are superseded/.test(text)) {
    fail(label, 'docket index contains stale source-count wording outside superseded-history boundary');
  }
  if (!text.includes('agent6-spec-003-hud-runtime-validation') || !text.includes('agent6-old-hud-quarantine-killswitch-coverage')) {
    fail(label, 'docket index is missing current SPEC-003 or old-HUD queue coverage');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'QA docket index mirrors Agent 6 validation queue and preserves current boundaries');
  }
}

function checkAgent5Agent6HandoffIndex() {
  const label = 'Agent 5/6 handoff index sync';
  const handoff = readJsonIfExists('reports/agent5-agent6-handoff-index.json');
  if (!handoff) {
    fail(label, 'missing reports/agent5-agent6-handoff-index.json');
    return;
  }
  if (handoff.artifact_type !== 'agent5_agent6_handoff_index') fail(label, `unexpected artifact_type ${handoff.artifact_type || 'missing'}`);
  if (handoff.publication_global_status !== 'blocked_no_render') fail(label, 'handoff publication status is not blocked_no_render');
  const rows = Array.isArray(handoff.rows) ? handoff.rows : [];
  const byId = new Map(rows.map((row) => [row.request_id, row]));
  for (const item of queue.queue || []) {
    const row = byId.get(item.request_id);
    if (!row) {
      fail(label, `${item.request_id} missing from handoff index`);
      continue;
    }
    if (row.status !== item.status) fail(label, `${item.request_id} handoff status ${row.status || 'missing'} does not match queue ${item.status || 'missing'}`);
  }
  for (const row of rows) {
    if (!(queue.queue || []).find((item) => item.request_id === row.request_id)) fail(label, `${row.request_id || 'unknown'} exists in handoff but not queue`);
  }
  const handoffText = JSON.stringify(handoff).toLowerCase();
  if (/queued_sop_002|queued_eight_document|direct-19\/audit-13 blocker|without a new agent 6 docket|failed_input_freeze/.test(handoffText)) {
    fail(label, 'handoff index contains stale queued SOP/source/route wording');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 5/6 handoff index mirrors validation queue statuses and stale queue wording is absent');
  }
}

function checkDeuteronomyOwnerRouteBoundary() {
  const label = 'Deuteronomy owner-route boundary';
  const queueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-live-deuteronomy-old-hud-public-runtime-blocker') || {};
  const handoff = readJsonIfExists('reports/agent5-agent6-handoff-index.json') || {};
  const pulseItem = agent7Pulse?.latest_agent6_dockets?.live_deuteronomy_old_hud || {};
  const requiredRoutes = [
    'clean deploy branch/worktree',
    'selected-artifact deployment',
    'reconcile/deploy divergent main',
  ];
  const queueText = JSON.stringify(queueItem).toLowerCase();
  const handoffText = JSON.stringify(handoff).toLowerCase();
  const pulseText = JSON.stringify(pulseItem).toLowerCase();
  const combined = `${queueText}\n${handoffText}\n${pulseText}`;
  const postSwapSourceOfTruthOpen =
    String(queueItem.status || '').includes('live_deuteronomy_static_http_current_hud') ||
    String(queueItem.status || '').includes('exact_live_deuteronomy_current_hud_runtime') ||
    String(queueItem.status || '').includes('exact_live_deuteronomy_fullscreen_current_hud_runtime') ||
    String(queueItem.status || '').includes('deuteronomy_changed_hash_runtime_click_acceptance') ||
    String(queueItem.status || '').includes('source_of_truth_open') ||
    String(pulseItem.status || '').includes('live_deuteronomy_static_http_current_hud') ||
    String(pulseItem.status || '').includes('exact_live_deuteronomy_current_hud_runtime') ||
    String(pulseItem.status || '').includes('exact_live_deuteronomy_fullscreen_current_hud_runtime') ||
    String(pulseItem.status || '').includes('deuteronomy_changed_hash_runtime_click_acceptance') ||
    [
      'agent5_prepare_deuteronomy_deployment_source_of_truth_packet_agent4_browser_click_safe_checkpoint_only',
      'await_agent6_deuteronomy_source_of_truth_browser_runtime_verdict_keep_genesis_hud_preview_separate',
      'shift_public_runtime_attention_to_genesis_hud_preview_drift_quarantine_stop_deuteronomy_loops',
      'agent5_queue_deuteronomy_changed_artifact_source_of_truth_delta_agent4_current_hash_browser_click_safe_checkpoint',
      'stop_deuteronomy_proof_loop_unless_new_hash_drift_or_agent6_cdn_request',
    ].includes(String(pulseItem.required_next_action || ''));

  const allowedQueueStatuses = new Set([
    'returned_blocker_live_deuteronomy_old_hud_public_runtime_owner_route_required',
    'queued_post_remediation_deuteronomy_live_evidence_for_agent6_review_blocker_not_accepted',
    'returned_warn_accepted_live_deuteronomy_static_http_current_hud_old_markers_absent_browser_click_and_source_of_truth_open',
    'returned_warn_accepted_deuteronomy_static_http_current_hud_broader_public_runtime_treatment_separate_open',
    'returned_warn_accepted_option_a_preparation_live_deuteronomy_static_http_current_hud_source_of_truth_open',
    'returned_warn_accepted_exact_live_deuteronomy_current_hud_runtime_source_of_truth_and_browser_click_proof_only',
    'returned_warn_accepted_exact_deuteronomy_current_hud_runtime_broader_genesis_hud_preview_open',
    'returned_warn_accepted_exact_live_deuteronomy_fullscreen_current_hud_runtime_only_765a98a_boundary',
  ]);
  if (!allowedQueueStatuses.has(queueItem.status)) {
    fail(label, `queue status is ${queueItem.status || 'missing'}`);
  }

  const claimedBoundary = String(queueItem.claimed_boundary || '').toLowerCase();
  const returnedBoundary = String(queueItem.returned_boundary || '').toLowerCase();
  const exactDeuteronomyStatus =
    String(queueItem.status || '').includes('exact_live_deuteronomy_current_hud_runtime') ||
    String(queueItem.status || '').includes('exact_live_deuteronomy_fullscreen_current_hud_runtime');
  if (exactDeuteronomyStatus) {
    for (const [fieldName, fieldText] of [
      ['claimed_boundary', claimedBoundary],
      ['returned_boundary', returnedBoundary],
    ]) {
      if (
        !fieldText.includes('exact live deuteronomy current-hud runtime surface') &&
        !fieldText.includes('exact live deuteronomy fullscreen current-hud runtime only')
      ) {
        fail(label, `${fieldName} does not preserve exact Deuteronomy current-HUD runtime boundary`);
      }
      if (fieldText.includes('exact live non-public exposure reduction only') || fieldText.includes('genesis product posture')) {
        fail(label, `${fieldName} is contaminated with Genesis /hud-preview non-public exposure boundary`);
      }
    }
  }

  if (postSwapSourceOfTruthOpen) {
    const allowedReturnedDockets = new Set([
      'reports/agent6-live-deuteronomy-post-swap-runtime-recheck-2026-06-02.md',
      'reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md',
      'reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md',
    ]);
    if (!allowedReturnedDockets.has(queueItem.returned_docket)) {
      fail(label, `queue returned_docket is ${queueItem.returned_docket || 'missing'}`);
    }
    if (queueItem.returned_docket === 'reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md') {
      const deuteronomyBoundaryText = JSON.stringify({
        returned_verdict: queueItem.returned_verdict,
        claimed_boundary: queueItem.claimed_boundary,
        returned_boundary: queueItem.returned_boundary,
      }).toLowerCase();
      for (const phrase of [
        'warn-accepted for exact live deuteronomy current-hud runtime surface only',
        'exact live deuteronomy current-hud runtime surface only',
        'validated primary public reader surface for this exact route',
        'not genesis acceptance',
        'not /hud-preview acceptance',
      ]) {
        if (!deuteronomyBoundaryText.includes(phrase)) fail(label, `Deuteronomy returned boundary missing exact-runtime phrase: ${phrase}`);
      }
      for (const forbidden of [
        'exact live non-public exposure reduction',
        'github pages 404 content',
        'genesis product posture remains',
        'a 404 is non-public exposure evidence',
      ]) {
        if (deuteronomyBoundaryText.includes(forbidden)) {
          fail(label, `Deuteronomy returned boundary contains broader 404 boundary phrase: ${forbidden}`);
        }
      }
    }
    if (queueItem.returned_docket === 'reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md') {
      const fullscreenBoundaryText = JSON.stringify({
        returned_verdict: queueItem.returned_verdict,
        claimed_boundary: queueItem.claimed_boundary,
        returned_boundary: queueItem.returned_boundary,
        next_agent5_action: queueItem.next_agent5_action,
        next_agent6_action: queueItem.next_agent6_action,
      }).toLowerCase();
      for (const phrase of [
        'warn-accepted exact live deuteronomy fullscreen current-hud runtime only',
        '765a98a8920d6dcdd897f71abe3cf218f8abc19a',
        'bounded lightweight artifact set',
        'tanakh/deuteronomy/index.html',
        'assets/js/reader-workbench.js',
        'assets/css/reader-workbench.css',
        'data/public-hud/deuteronomy/**',
        'old-hud marker exposure is not observed',
        'click-to-hud',
        'source/license',
        'route shard',
        'hard refresh',
        'query negative',
        'localstorage/indexeddb',
        'primary public reader surface for this exact route only',
        'clean cdn stale-bundle closure is not accepted',
        'not clean pass',
        'not broad public/runtime acceptance',
        'not genesis current-hud acceptance',
        'not /hud-preview public-use acceptance',
        'genesis and /hud-preview remain separate',
        'publication remains blocked_no_render',
      ]) {
        if (!fullscreenBoundaryText.includes(phrase)) fail(label, `Deuteronomy fullscreen boundary missing phrase: ${phrase}`);
      }
      for (const forbidden of [
        'blocker reopened deuteronomy runtime click acceptance',
        'before changed live deuteronomy can be called agent 6 runtime accepted',
        'clean pass for deuteronomy',
        'broad public/runtime acceptance granted',
        'genesis current-hud acceptance granted',
        '/hud-preview public-use acceptance granted',
        'source/provenance custody accepted',
        'product/data gate acceptance granted',
        'accepted translation text granted',
      ]) {
        if (fullscreenBoundaryText.includes(forbidden)) {
          fail(label, `Deuteronomy fullscreen boundary still carries superseded blocker wording: ${forbidden}`);
        }
      }
    }
    const allowedPulseStatuses = new Set([
      'returned_warn_accepted_live_deuteronomy_static_http_current_hud_old_markers_absent_browser_click_and_source_of_truth_open',
      'warn_accepted_live_deuteronomy_static_http_current_hud_old_markers_absent_browser_click_and_source_of_truth_open',
      'returned_warn_accepted_exact_live_deuteronomy_current_hud_runtime_source_of_truth_and_browser_click_proof_only',
      'warn_accepted_exact_live_deuteronomy_current_hud_runtime_source_of_truth_and_browser_click_proof_only',
      'returned_warn_accepted_exact_live_deuteronomy_fullscreen_current_hud_runtime_only_765a98a_boundary',
    ]);
    if (!allowedPulseStatuses.has(pulseItem.status)) {
      fail(label, `Agent 7 pulse Deuteronomy status is ${pulseItem.status || 'missing'}`);
    }
    const allowedPostSwapActions = new Set([
      'agent5_prepare_deuteronomy_deployment_source_of_truth_packet_agent4_browser_click_safe_checkpoint_only',
      'await_agent6_deuteronomy_source_of_truth_browser_runtime_verdict_keep_genesis_hud_preview_separate',
      'shift_public_runtime_attention_to_genesis_hud_preview_drift_quarantine_stop_deuteronomy_loops',
      'agent5_queue_deuteronomy_changed_artifact_source_of_truth_delta_agent4_current_hash_browser_click_safe_checkpoint',
      'stop_deuteronomy_proof_loop_unless_new_hash_drift_or_agent6_cdn_request',
    ]);
    if (!allowedPostSwapActions.has(pulseItem.required_next_action)) {
      fail(label, `Agent 7 pulse required_next_action is ${pulseItem.required_next_action || 'missing'}`);
    }
    const boundaryPhraseGroups = [
      ['live deuteronomy static http post-swap evidence', 'exact live deuteronomy current-hud runtime surface'],
      ['current hud', 'current-hud'],
      ['data/public-hud/deuteronomy', 'sparse pages artifact'],
      ['source-of-truth'],
      ['browser-click', 'live click'],
      ['fullscreen current-hud runtime', 'exact live deuteronomy fullscreen'],
      ['clean cdn stale-bundle closure is not accepted', 'cdn stale-bundle closure is not accepted'],
      ['genesis'],
      ['/hud-preview'],
      ['publication remains blocked_no_render'],
    ];
    for (const phrases of boundaryPhraseGroups) {
      const found = phrases.some((phrase) => combined.includes(phrase));
      const phrase = phrases.join(' or ');
      if (!found) fail(label, `post-swap boundary phrase missing: ${phrase}`);
    }
    if (
      !combined.includes('old hard markers absent') &&
      !combined.includes('old hard markers are absent') &&
      !combined.includes('old markers absent') &&
      !combined.includes('old-hud live blocker is cleared') &&
      !combined.includes('old-hud markers')
    ) {
      fail(label, 'post-swap boundary phrase missing: old hard markers absent');
    }
  } else {
    if (queueItem.returned_docket !== 'reports/agent6-owner-route-decision-request-2026-06-02.md') {
      fail(label, `queue returned_docket is ${queueItem.returned_docket || 'missing'}`);
    }
    if (pulseItem.status !== 'blocker_active_owner_route_decision_required') {
      fail(label, `Agent 7 pulse Deuteronomy status is ${pulseItem.status || 'missing'}`);
    }
    const allowedRequiredNextActions = new Set([
      'owner_must_choose_exactly_one_route_before_agent5_deploy_swap_evidence',
      'agent5_prepare_option_a_clean_origin_main_deploy_branch_or_exact_delivery_blocker',
    ]);
    if (!allowedRequiredNextActions.has(pulseItem.required_next_action)) {
      fail(label, `Agent 7 pulse required_next_action is ${pulseItem.required_next_action || 'missing'}`);
    }
    if (pulseItem.required_next_action === 'agent5_prepare_option_a_clean_origin_main_deploy_branch_or_exact_delivery_blocker') {
      if (!pulseItem.agent7_selected_owner_route?.artifact?.includes('agent7-deuteronomy-p0-owner-route-selection-2026-06-02.md')) {
        fail(label, 'Agent 7 selected Option A route artifact missing from pulse state');
      }
      for (const phrase of [
        'option a',
        'clean deploy branch/worktree from current origin/main',
        'exact delivery blocker',
        'no deployment execution',
      ]) {
        if (!combined.includes(phrase)) fail(label, `selected owner-route phrase missing: ${phrase}`);
      }
    }
    for (const route of requiredRoutes) {
      if (!combined.includes(route)) fail(label, `owner route option missing: ${route}`);
    }
    for (const phrase of [
      'owner must choose exactly one',
      'do not produce another no-drift proof loop',
      'do not pull agent 4 until post-swap',
      'do not interrupt agents 1-3',
      'genesis and /hud-preview remain separate blockers',
      '/hud-preview',
      'publication remains blocked_no_render',
    ]) {
      if (!combined.includes(phrase)) fail(label, `boundary phrase missing: ${phrase}`);
    }
  }
  if (!postSwapSourceOfTruthOpen && pulseItem.required_next_action === 'agent5_prepare_option_a_clean_origin_main_deploy_branch_or_exact_delivery_blocker') {
    if (!pulseItem.agent7_selected_owner_route?.artifact?.includes('agent7-deuteronomy-p0-owner-route-selection-2026-06-02.md')) {
      fail(label, 'Agent 7 selected Option A route artifact missing from pulse state');
    }
    for (const phrase of [
      'option a',
      'clean deploy branch/worktree from current origin/main',
      'exact delivery blocker',
      'no deployment execution',
    ]) {
      if (!combined.includes(phrase)) fail(label, `selected owner-route phrase missing: ${phrase}`);
    }
  }
  for (const forbidden of [
    'live deuteronomy public-runtime clearance',
    'public/runtime acceptance',
    'source/provenance custody',
    'accepted translation text',
  ]) {
    if (!combined.includes(forbidden)) fail(label, `non-acceptance phrase missing: ${forbidden}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, postSwapSourceOfTruthOpen
      ? 'Deuteronomy exact fullscreen current-HUD WARN boundary is preserved across queue, handoff, and Agent 7 pulse state'
      : 'Deuteronomy P0 remains blocked/not accepted across queue, handoff, and Agent 7 pulse state; owner-route and post-remediation evidence states preserve Agent 6 review boundary');
  }
}

function checkBroaderPublicRuntimeDriftBoundary() {
  const label = 'broader public-runtime drift boundary';
  const queueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-broader-public-runtime-drift-intake') || {};
  const handoff = readJsonIfExists('reports/agent5-agent6-handoff-index.json') || {};
  const handoffRow = (handoff.rows || []).find((row) => row.request_id === 'agent6-broader-public-runtime-drift-intake') || {};
  const pulseItem = agent7Pulse?.latest_agent6_dockets?.broader_public_runtime_drift || {};
  const combined = JSON.stringify({ queueItem, handoffRow, pulseItem, nextControlAction: handoff.next_control_action }).toLowerCase();

  const nonPublicWarnStatus = 'returned_warn_accepted_exact_live_nonpublic_exposure_reduction_genesis_hud_preview_product_posture_source_of_truth_open';
  const olderBroaderBlockerStatus = 'returned_blocker_preserved_broader_public_runtime_drift_warn_accepted_local_hud_preview_quarantine_only';
  const isNonPublicWarn = queueItem.status === nonPublicWarnStatus;
  if (![olderBroaderBlockerStatus, nonPublicWarnStatus].includes(queueItem.status)) {
    fail(label, `queue status is ${queueItem.status || 'missing'}`);
  }
  const allowedDockets = new Set([
    'reports/agent6-hud-preview-pages-stale-after-quarantine-recheck-2026-06-02.md',
    'reports/agent6-broader-public-runtime-live-nonpublic-recheck-2026-06-02.md',
  ]);
  if (!allowedDockets.has(queueItem.returned_docket)) {
    fail(label, `queue returned_docket is ${queueItem.returned_docket || 'missing'}`);
  }
  const allowedPulseStatuses = new Set([
    'blocker_preserved_hud_preview_pages_stale_after_repo_local_quarantine_attempt',
    nonPublicWarnStatus,
  ]);
  if (!allowedPulseStatuses.has(pulseItem.status)) {
    fail(label, `Agent 7 pulse broader drift status is ${pulseItem.status || 'missing'}`);
  }
  const requiredPhraseGroups = isNonPublicWarn
    ? [
        ['exact live non-public exposure reduction'],
        ['github pages 404 content', 'return 404'],
        ['no searched old-hud', 'no searched hud/source markers'],
        ['not product readiness'],
        ['product posture'],
      ]
    : [
        ['post-remediation live evidence'],
        ['exact pages/deployment blocker'],
        ['no further static pre-remediation proof cycle'],
        ['data-public-runtime-quarantine'],
        ['local/raw quarantine evidence does not clear the live public surface'],
      ];
  for (const phrases of requiredPhraseGroups) {
    if (!phrases.some((phrase) => combined.includes(phrase))) {
      fail(label, `boundary phrase missing: ${phrases.join(' or ')}`);
    }
  }
  if (
    !combined.includes('do not mark /hud-preview resolved from local/raw repo evidence') &&
    !combined.includes('/hud-preview requires quarantine/non-public live proof') &&
    !combined.includes('/hud-preview is intentional quarantine/non-public posture requiring post-remediation live proof') &&
    !combined.includes('requires post-remediation live proof or exact pages/deployment blocker')
  ) {
    fail(label, 'boundary phrase missing: do not mark /hud-preview resolved from local/raw repo evidence');
  }
  if (
    !combined.includes('deuteronomy p0 remains first') &&
    !combined.includes('deuteronomy exact live current-hud runtime') &&
    !combined.includes('deuteronomy proof loops stop')
  ) {
    fail(label, 'boundary phrase missing: Deuteronomy priority transition');
  }
  if (
    !combined.includes('broader /hud-preview and genesis drift stay separate') &&
    !combined.includes('broader genesis and /hud-preview drift stay separate') &&
    !combined.includes('separate genesis and /hud-preview drift/quarantine treatment') &&
    !combined.includes('genesis and /hud-preview public-runtime drift remain separate') &&
    !combined.includes('keep both out of deuteronomy acceptance')
  ) {
    fail(label, 'boundary phrase missing: broader Genesis and /hud-preview drift stay separate');
  }
  for (const forbidden of [
    'live genesis public/runtime clearance',
    'live /hud-preview/ public/runtime clearance',
    'deployment/cdn/cache closure',
    'source/provenance custody',
    'publication readiness',
    'accepted translation text',
  ]) {
    if (!combined.includes(forbidden)) fail(label, `non-acceptance phrase missing: ${forbidden}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'broader Genesis and /hud-preview drift remain separate blockers requiring post-remediation live proof or exact Pages/deployment blocker');
  }
}

function checkAgent5Routing() {
  const label = 'Agent 5 routing suppression';
  const goal = (board.goals || []).find((entry) => entry.id === 'agent5-goal-management-and-qa-packet-flow');
  if (!goal) {
    fail(label, 'Agent 5 goal missing');
    return;
  }
  const next = String(goal.next_agent5_action || '');
  const stalePositiveInstruction = /(^|[^a-z])(queue spec-001|requeue sop-002|re-sign sop-002|requeue.*sop-010)/i.test(next)
    && !/do not requeue/i.test(next);
  if (stalePositiveInstruction) {
    fail(label, `Agent 5 next action contains stale requeue language: ${next}`);
  }
  if (!/do not requeue/i.test(next) || !/active workers/i.test(next)) {
    warn(label, 'Agent 5 next action does not explicitly preserve no-requeue / active-worker boundary');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 5 goal suppresses stale requeueing and active-worker interruption');
  }
}

function checkWorkerWatchdogBoundary() {
  const label = 'worker watchdog delivery-proof boundary';
  const forbiddenPrimary = new Set(['idle_no_goal', 'stale_goal', 'delivery_blocked']);
  const allowedSecondaryFields = ['worker_state_detail', 'delivery_state', 'stale_reason', 'goal_recovery_status', 'next_agent5_action'];
  const sop001 = readTextIfExists('reports/sop-001-goal-operating-model.md').toLowerCase();
  const sop014 = readTextIfExists('reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md').toLowerCase();
  const handoff = readTextIfExists('reports/agent5-pipeline-priority-handoff.md').toLowerCase();
  const notes = readTextIfExists('reports/agent5-control-notes.md').toLowerCase();
  const combinedText = `${sop001}\n${sop014}\n${handoff}\n${notes}`;

  for (const status of board.status_model?.allowed_statuses || []) {
    if (forbiddenPrimary.has(status)) fail(label, `forbidden primary status present in allowed_statuses: ${status}`);
  }
  for (const goal of board.goals || []) {
    if (forbiddenPrimary.has(goal.status)) fail(label, `${goal.id || 'unknown goal'} uses forbidden primary status ${goal.status}`);
  }
  for (const field of allowedSecondaryFields) {
    if (!combinedText.includes(field.toLowerCase())) fail(label, `secondary detail field not documented: ${field}`);
  }
  for (const phrase of [
    'prepared prompt without delivery proof is not a seeded goal',
    'do not return `dont_notify` while a p0 idle/no-goal',
    'suppress prompts to active workers unless',
    'delivery-blocked conditions in secondary fields',
    'primary goal-board `status` values remain only',
  ]) {
    if (!combinedText.includes(phrase)) fail(label, `worker-watchdog law phrase missing: ${phrase}`);
  }
  const queueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-sop-001-014-worker-watchdog-change-control') || {};
  const queueText = JSON.stringify(queueItem).toLowerCase();
  for (const phrase of [
    'prepared prompt without delivery proof',
    'dont_notify',
    'active workers remain uninterrupted',
    'idle_no_goal, stale_goal, and delivery_blocked are secondary detail fields only',
  ]) {
    if (!queueText.includes(phrase)) fail(label, `Agent 6 watchdog queue boundary missing: ${phrase}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'worker watchdog preserves secondary-only no-goal/stale/delivery-blocked fields, delivery proof, no-DONT_NOTIFY, and active-worker suppression');
  }
}

function checkAgent5CurrentHandoffGuidance() {
  const label = 'Agent 5 current handoff guidance';
  const handoff = readTextIfExists('reports/agent5-pipeline-priority-handoff.md');
  const notes = readTextIfExists('reports/agent5-control-notes.md');
  if (!handoff) fail(label, 'missing reports/agent5-pipeline-priority-handoff.md');
  if (!notes) fail(label, 'missing reports/agent5-control-notes.md');

  const currentNotes = notes.split(/^## Agent 6 Queue\/Agent9\/Old-HUD Static Receipts/m)[0] || notes.slice(0, 4000);
  const handoffText = handoff.toLowerCase();
  const currentNotesText = currentNotes.toLowerCase();

  if (!currentNotesText.includes('current notes boundary') || !currentNotesText.includes('lower historical sections preserve prior decisions and superseded states for audit context only')) {
    fail(label, 'control notes current header does not quarantine lower historical sections as non-current guidance');
  }
  for (const stalePhrase of ['direct-55/audit-13', 'direct-19/audit-13', 'direct-13/audit-13', 'proof-loop', 'old-hud']) {
    if (!currentNotesText.includes(stalePhrase)) fail(label, `control notes history boundary missing stale marker ${stalePhrase}`);
  }

  for (const [name, text] of [
    ['pipeline handoff', handoffText],
    ['control notes current header', currentNotesText],
  ]) {
    for (const phrase of [
      'direct-23/audit-23',
      'source/provenance',
      'blocked',
      'all 23',
      'six modified tracked',
    ]) {
      if (!text.includes(phrase)) fail(label, `${name} missing current source boundary phrase: ${phrase}`);
    }
  }
  if (!currentNotesText.includes('old agent 1 source relay obsolete')) {
    fail(label, 'control notes current header does not mark old Agent 1 source relay obsolete');
  }
  if (!currentNotesText.includes('do not prompt agent 1 just to repeat the 23-file count')) {
    fail(label, 'control notes current header does not preserve no-repeat-count prompt rule');
  }
  if (/reconcile (the )?13 untracked|13 untracked source json/.test(currentNotesText)) {
    fail(label, 'control notes current header contains stale 13-file source instruction');
  }
  if (/direct-19\/audit-13 block|standing direct-19|latest agent 6 docketed source blocker remains/.test(handoffText)) {
    fail(label, 'pipeline handoff contains stale direct-19 blocker as active current truth');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 5 current handoff/control-note headers preserve current source and relay boundaries');
  }
}

function checkAgent7PulseStateBoundary() {
  const label = 'Agent 7 pulse state boundary';
  if (!agent7Pulse) {
    fail(label, 'missing data/control/agent7_pulse_state.json');
    return;
  }
  if (!['agent7_ceo_pulse_state', 'agent7_manager_pulse_state'].includes(agent7Pulse.artifact_type)) fail(label, `unexpected artifact_type ${agent7Pulse.artifact_type || 'missing'}`);
  if (agent7Pulse.publication_global_status !== 'blocked_no_render') fail(label, 'publication_global_status is not blocked_no_render');
  const boundary = agent7Pulse.current_global_boundaries || {};
  const text = JSON.stringify(boundary).toLowerCase();
  for (const phrase of [
    'blocked_no_render',
    'quarantined_legacy_license_risk',
    'direct-23/audit-23',
    'all 23 untracked source files quarantined',
    'source/provenance custody blocked',
    'six modified tracked source files outside docket',
    'agent 6 dockets only',
    'not qa acceptance',
    'product/data gate acceptance',
    'no prompts to active workers',
  ]) {
    if (!text.includes(phrase)) fail(label, `current_global_boundaries missing ${phrase}`);
  }
  const policy = String(agent7Pulse.direct_agent_1_4_policy || '').toLowerCase();
  const preservesLegacyAgent5Routing = policy.includes('routes agents 1-4 through agent 5') && policy.includes('stale routine work is handled by agent 5');
  const preservesAgent13Routing = policy.includes('agent 10 manages agents 1, 2, and 4') && policy.includes('conditional wake-only') && policy.includes('no prompts to active workers');
  const preservesWartimeOverride = policy.includes('wartime user override')
    && policy.includes('agents 1, 2, and 4')
    && policy.includes('direct_bounded_worker_prompt_delivery')
    && policy.includes('no prompts to active workers')
    && policy.includes('no acceptance');
  if (!preservesLegacyAgent5Routing && !preservesAgent13Routing && !preservesWartimeOverride) {
    fail(label, 'direct_agent_1_4_policy does not preserve legacy Agent 5 routing, Agent 13/10 conditional wake-only routing, or the explicit wartime user override boundary');
  }
  const sentinel = agent7Pulse.latest_agent6_dockets?.live_deuteronomy_old_hud?.sentinel_encoding_control?.sentinel || {};
  if (sentinel.token_id !== 'tok-21613e763fe6') {
    fail(label, `Deuteronomy sentinel token_id is ${sentinel.token_id || 'missing'}`);
  }
  const surfaceCodepoints = codepoints(sentinel.surface_word);
  const normalizedCodepoints = codepoints(sentinel.normalized_word);
  if (surfaceCodepoints !== '05d0 05b5 05a3 05dc 05bc 05b6 05d4') {
    fail(label, `Deuteronomy sentinel surface_word codepoints ${surfaceCodepoints || 'missing'} do not match expected UTF-8 Hebrew identity`);
  }
  if (normalizedCodepoints !== '05d0 05dc 05d4') {
    fail(label, `Deuteronomy sentinel normalized_word codepoints ${normalizedCodepoints || 'missing'} do not match expected UTF-8 Hebrew identity`);
  }
  if (sentinel.surface_word_codepoints !== '05d0 05b5 05a3 05dc 05bc 05b6 05d4') {
    fail(label, `Deuteronomy sentinel expected surface codepoints field is ${sentinel.surface_word_codepoints || 'missing'}`);
  }
  if (sentinel.normalized_word_codepoints !== '05d0 05dc 05d4') {
    fail(label, `Deuteronomy sentinel expected normalized codepoints field is ${sentinel.normalized_word_codepoints || 'missing'}`);
  }
  if (surfaceCodepoints !== sentinel.surface_word_codepoints) {
    fail(label, `Deuteronomy sentinel surface_word codepoints ${surfaceCodepoints || 'missing'} do not match field ${sentinel.surface_word_codepoints || 'missing'}`);
  }
  if (normalizedCodepoints !== sentinel.normalized_word_codepoints) {
    fail(label, `Deuteronomy sentinel normalized_word codepoints ${normalizedCodepoints || 'missing'} do not match field ${sentinel.normalized_word_codepoints || 'missing'}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 7 pulse state preserves global blocker, routing boundaries, and Deuteronomy sentinel encoding mirror');
  }
}

function checkPulseCadenceBoundary() {
  const label = 'pulse cadence boundary';
  const pulseStates = [
    ['pulse_state', pulse],
    ['agent7_pulse_state', agent7Pulse],
  ];
  for (const [name, state] of pulseStates) {
    if (!state) {
      fail(label, `${name} missing`);
      continue;
    }
    const text = JSON.stringify(state).toLowerCase();
    if (/resume_10_minute_triage_ticks|resume 10 minute triage ticks|then_resume_10_minute/.test(text)) {
      fail(label, `${name} contains active-looking 10-minute triage restart language`);
    }
    const preservesLegacyAgent5Cadence = text.includes('30-minute') || text.includes('30_minute');
    const preservesAgent13Cadence = text.includes('agent13') || (text.includes('agent 13') && text.includes('agent 10') && text.includes('agent12'));
    const hasManagerCadence = text.includes('agent7_manager_pulse_minutes') || text.includes('every 4 hours') || text.includes('240');
    if (!preservesLegacyAgent5Cadence && !(preservesAgent13Cadence && hasManagerCadence)) {
      fail(label, `${name} does not preserve legacy Agent 5 cadence or Agent 13 organization cadence`);
    }
    if (!text.includes('no prompts to active workers') && !text.includes('no_prompt_to_active_workers')) {
      fail(label, `${name} does not preserve no-prompt-to-active-workers boundary`);
    }
    if (text.includes('10 minutes') && !text.includes('full project recompute every 10 minutes')) {
      fail(label, `${name} contains unbounded 10-minute language`);
    }
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'pulse state suppresses short-prompt churn and preserves either legacy Agent 5 cadence or Agent 13 organization cadence');
  }
}

function checkRouteInputFreezeBoundary() {
  const label = 'route input-freeze boundary';
  const route = pipeline.agent7_route_release_input_freeze_drift_correction || gates.agent7_route_release_input_freeze_drift_correction || {};
  const agent2 = (board.goals || []).find((entry) => entry.id === 'agent2-definition-status-semantics') || {};
  const driftReport = readTextIfExists('reports/hud-route-input-freeze-drift.md');
  const releaseGate = readTextIfExists('reports/hud-route-release-gate.md');

  if (!String(route.status || '').includes('pass_with_warnings') || !String(route.status || '').includes('not_publication_support')) {
    fail(label, `route control status is ${route.status || 'missing'}`);
  }
  if (!String(route.summary || '').toLowerCase().includes('not publication support')) {
    fail(label, 'route control summary does not preserve not-publication-support boundary');
  }
  if (!String(agent2.route_release_gate_status || '').includes('pass_with_warnings')) {
    fail(label, `Agent 2 route_release_gate_status is ${agent2.route_release_gate_status || 'missing'}`);
  }
  const agent2ActiveText = JSON.stringify({
    known_risks: agent2.known_risks,
    current_boundary: agent2.current_boundary,
    route_release_gate_status: agent2.route_release_gate_status,
  }).toLowerCase();
  if (/route gate failed|gate is failed|failed_input_freeze_drift/.test(agent2ActiveText)) {
    fail(label, 'Agent 2 active goal still says route gate failed instead of pass_with_warnings drift');
  }
  if (!driftReport || !driftReport.includes('Status: drift')) fail(label, 'route input-freeze drift report missing Status: drift');
  if (!releaseGate || !releaseGate.includes('Status: pass_with_warnings')) fail(label, 'route release gate missing Status: pass_with_warnings');
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'route gate is pass_with_warnings while clean release/publication support remains blocked');
  }
}

function checkWorkbenchHandoffAuthority() {
  const label = 'workbench handoff authority';
  const current = readJsonIfExists('data/workbench-evidence/public-handoff-index.json');
  const legacy = readJsonIfExists('data/workbench-evidence/handoff-index.json');
  if (!current) {
    fail(label, 'missing public-handoff-index.json');
    return;
  }
  if (current.artifact_type !== 'workbench_public_handoff_index') fail(label, `unexpected current handoff artifact_type ${current.artifact_type || 'missing'}`);
  if (Number(current.counts?.selected_targets || 0) <= 0) fail(label, 'current public handoff has no selected targets');
  if (current.reader_facing_policy?.ambiguous_rows_reader_facing !== false) fail(label, 'ambiguous rows are not explicitly non-reader-facing');
  if (current.consumer_contract?.visible_answer_authority !== false) fail(label, 'visible answer authority is not explicitly false');
  if (legacy && Number(legacy.counts?.manifests || 0) === 0) {
    warn(label, 'legacy handoff-index.json still has 0 manifests; public-handoff-index.json must remain current authority');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'public handoff index is current authority and does not grant visible answer authority');
  }
}

function checkAgent8Boundary() {
  const label = 'Agent 8 pressure boundary';
  const entry = findAgent(registry, 'Agent 8');
  const goal = (board.goals || []).find((candidate) => candidate.id === 'agent8-throughput-pressure-monitor') || {};
  const charter = readTextIfExists('reports/agent8-prompter-initial-charter-2026-06-01.md');
  const modelVerdict = readTextIfExists('reports/agent6-agent8-direct-worker-routing-sop-boundary-verdict-2026-06-02.md');
  const exactVerdict = readTextIfExists('reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md');
  const activationGuardrail = readTextIfExists('reports/agent6-agent8-direct-routing-activation-guardrail-2026-06-02.md');
  const exactText = readTextIfExists('reports/agent7-sop-agent8-direct-bounded-worker-prompt-delivery-exact-text-2026-06-02.md');
  const lawPublication = readTextIfExists('reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md');
  const exactQueueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-sop-agent8-direct-bounded-worker-prompt-delivery-exact-text') || {};
  if (!entry) {
    fail(label, 'Agent 8 missing from registry');
    return;
  }
  const combined = JSON.stringify({ entry, goal, charter, modelVerdict, exactVerdict, activationGuardrail, exactText, lawPublication, exactQueueItem }).toLowerCase();
  for (const forbidden of ['mark work accepted', 'claim publication readiness', 'narrow agent 6 validation scope']) {
    if (!combined.includes(forbidden)) fail(label, `missing forbidden boundary: ${forbidden}`);
  }
  const currentBoundary = String(goal.current_boundary || '').toLowerCase();
  if (!currentBoundary.includes('agent 7 published') || !currentBoundary.includes('direct_bounded_worker_prompt_delivery') || !currentBoundary.includes('delivery proof')) {
    fail(label, 'goal boundary does not preserve Agent 7-published direct_bounded_worker_prompt_delivery with delivery proof');
  }
  for (const phrase of [
    'direct_bounded_worker_prompt_delivery',
    'warn-accepted for exact sop text as workflow-routing law only',
    'agent_7_published_agent_6_signed_warn_boundary',
    'reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md',
    'reports/agent6-agent8-direct-routing-activation-guardrail-2026-06-02.md',
    'mandatory delivery proof',
    'no active-worker interruption without explicit',
    'agent 5 remains queue/control-state hygiene owner',
    'agent 8 cannot create acceptance',
    'agent 12 remains advisory only',
    'agent6_required cannot be downconverted',
    'p0 deuteronomy public-runtime remediation or exact deploy-trigger blocker remains first',
  ]) {
    if (!combined.includes(phrase)) fail(label, `Agent 8 direct-delivery boundary missing: ${phrase}`);
  }
  if (/direct 19 vs audit 13|direct-19\/audit-13|direct_19_vs_audit_13/.test(charter.toLowerCase())) {
    fail(label, 'Agent 8 charter still carries stale direct-19/audit-13 source blocker wording');
  }
  if (!charter.includes('direct-23/audit-23') || !charter.toLowerCase().includes('all 23 untracked source files remain quarantined')) {
    fail(label, 'Agent 8 charter does not preserve current direct-23/audit-23 quarantine boundary');
  }
  for (const phrase of [
    'deuteronomy owner-route blocker',
    'no-drift proof loop',
    'agent 4 pre-swap',
    'agents 1-3 interruption',
    '/hud-preview',
    'prepared prompt without delivery proof',
    'active workers remain uninterrupted',
  ]) {
    if (!combined.includes(phrase)) fail(label, `Agent 8 boundary missing current pressure constraint: ${phrase}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 8 direct_bounded_worker_prompt_delivery is Agent 7-published WARN workflow-routing law with delivery proof, no-active-worker-interruption, Agent 5 hygiene, Agent 12 advisory, P0, and acceptance boundaries preserved');
  }
}

function checkAgent9Boundary() {
  const label = 'Agent 9 oracle boundary';
  const entry = findAgent(registry, 'Agent 9');
  const goal = (board.goals || []).find((candidate) => candidate.id === 'agent9-oracler-chainlink') || {};
  const charter = readTextIfExists('reports/agent9-oracler-chainlink-charter-2026-06-01.md');
  if (!entry) {
    fail(label, 'Agent 9 missing from registry');
    return;
  }
  if (entry.target_id !== 'external_not_registered' || entry.idle_prompt_allowed !== false) {
    fail(label, 'Agent 9 registry does not preserve external/no-idle-prompt boundary');
  }
  const combined = JSON.stringify({ entry, goal, charter }).toLowerCase();
  for (const forbidden of ['route agents 1-4', 'seed goals', 'claim qa acceptance', 'claim publication readiness']) {
    if (!combined.includes(forbidden)) fail(label, `missing forbidden boundary: ${forbidden}`);
  }
  if (!combined.includes('outside') || !combined.includes('oracle')) {
    fail(label, 'Agent 9 boundary does not clearly mark outside/oracle role');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 9 remains external oracle input with no routing or acceptance authority');
  }
}

function checkAgent12Boundary() {
  const label = 'Agent 12 limiter boundary';
  const entry = findAgent(registry, 'Agent 12');
  const sop = readTextIfExists('reports/sop-017-agent12-limiter-token-conservation.md');
  const advisoryRealignment = readTextIfExists('reports/agent7-agent8-agent12-advisory-realignment-2026-06-02.md');
  const exactText = readTextIfExists('reports/agent7-sop-agent8-direct-bounded-worker-prompt-delivery-exact-text-2026-06-02.md');
  const pulseItem = agent7Pulse?.emergency_token_conservation || {};
  const queueItem = (queue.queue || []).find((item) => item.request_id === 'agent6-sop-017-agent12-limiter-token-conservation') || {};
  const agent8Goal = (board.goals || []).find((candidate) => candidate.id === 'agent8-throughput-pressure-monitor') || {};
  if (!entry) {
    fail(label, 'Agent 12 missing from registry');
    return;
  }
  const combined = JSON.stringify({ entry, pulseItem, queueItem, agent8Goal, sop, advisoryRealignment, exactText }).toLowerCase();
  for (const phrase of [
    'sop_warn_accepted_by_agent_6',
    'agent_6_signed_boundary',
    'agent_7_published_agent_6_signed_boundary',
    'reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md',
    'warn-accepted for emergency cost/scope-control workflow governance only',
    'not a clean pass',
    'agent6_required',
    'may not be converted into rejected_waste, status_only, or silence',
    'cost scarcity does not clear blockers',
    'sample validation is triage evidence only',
    'publication remains blocked_no_render',
    'agent 12 is outside-project advisory waste-check support',
    'agent 12 does not control agent 8',
    'cap means suggested shrinkage',
    'clear',
    'route_agent6',
    'duplicate_or_churn',
    'escalate',
  ]) {
    if (!combined.includes(phrase)) fail(label, `Agent 12 boundary missing: ${phrase}`);
  }
  for (const forbiddenBoundary of [
    'agent 12 as qa authority',
    'agent 12 as product acceptance authority',
    'agent 12 as publication authority',
    'limiter approval as agent 6 acceptance',
    'cost-driven silence as blocker clearance',
    'sample validation as broad runtime acceptance',
    'narrowing agent 6 authority',
    'source/provenance custody acceptance',
    'accepted translation text',
    'agent 12 advice as execution control',
  ]) {
    if (!combined.includes(forbiddenBoundary)) fail(label, `Agent 12 blocked use missing: ${forbiddenBoundary}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 12 remains advisory waste-check only, with Agent 6 authority and blocker boundaries preserved');
  }
}

function checkAgent13OrganizationBoundary() {
  const label = 'Agent 13 organization boundary';
  const org = readJsonIfExists('data/control/agent13_organization_state.json');
  if (!org) {
    fail(label, 'missing data/control/agent13_organization_state.json');
    return;
  }
  if (org.publication_global_status !== 'blocked_no_render') fail(label, 'organization publication_global_status is not blocked_no_render');
  const boardAuthority = board.authority || {};
  if (boardAuthority.mission_strategy_owner !== 'Agent 13') fail(label, `mission_strategy_owner is ${boardAuthority.mission_strategy_owner || 'missing'}`);
  if (boardAuthority.execution_owner !== 'Agent 7') fail(label, `execution_owner is ${boardAuthority.execution_owner || 'missing'}`);
  if (boardAuthority.release_owner !== 'Agent 10') fail(label, `release_owner is ${boardAuthority.release_owner || 'missing'}`);
  if (boardAuthority.budget_owner !== 'Agent 12') fail(label, `budget_owner is ${boardAuthority.budget_owner || 'missing'}`);

  const text = JSON.stringify({ org, registry, pulse, agent7Pulse, board: board.organization_state || {} }).toLowerCase();
  for (const phrase of [
    'agent 13',
    'ceo',
    'mission selection',
    'priority changes',
    'resource allocation',
    'freeze decisions',
    'wake decisions',
    'sleep',
    'agent 7',
    'manager',
    'execution',
    'staffing',
    'blockers',
    'shipment preparation',
    'wake/sleep enforcement',
    'agent 10',
    'release owner',
    'goal_mode_continuous',
    'agent 12',
    'budget owner',
    'green',
    'yellow',
    'red',
    'no governance essays',
    'validated_public_reader_surfaces',
    'blocked_no_render',
  ]) {
    if (!text.includes(phrase)) fail(label, `organization boundary missing ${phrase}`);
  }

  const active = org.agent_states?.ACTIVE || [];
  const conditional = org.agent_states?.CONDITIONAL || [];
  const wartimeActive = org.agent_states?.WARTIME_ACTIVE_LONG_RUNNING || [];
  const rationed = org.agent_states?.RATIONED || [];
  if (!active.includes('Agent 10')) fail(label, 'Agent 10 is not the sole ACTIVE release owner in organization state');
  const wartimeOverride = org.wartime_user_override_2026_06_02 || board.wartime_user_override_2026_06_02 || {};
  const wartimeOverrideActive = wartimeOverride.status === 'active_long_running_worker_lanes_delivered'
    && Array.isArray(wartimeOverride.activated_agents)
    && ['Agent 1', 'Agent 2', 'Agent 4'].every((agent) => wartimeOverride.activated_agents.includes(agent))
    && String(wartimeOverride.highest_permissible_claim || '').includes('wartime_long_running_worker_lanes_delivered')
    && JSON.stringify(wartimeOverride.what_must_not_be_accepted || []).toLowerCase().includes('qa acceptance')
    && JSON.stringify(wartimeOverride.what_must_not_be_accepted || []).toLowerCase().includes('accepted translation text');
  for (const agent of ['Agent 1', 'Agent 2', 'Agent 4']) {
    const registryEntry = findAgent(registry, agent) || {};
    if (wartimeOverrideActive) {
      if (!active.includes(agent) || !wartimeActive.includes(agent)) {
        fail(label, `${agent} missing from ACTIVE/WARTIME_ACTIVE_LONG_RUNNING organization state under wartime override`);
      }
      if (registryEntry.manager !== 'Agent 7' || registryEntry.release_owner !== 'Agent 10' || registryEntry.organization_state !== 'WARTIME_ACTIVE_LONG_RUNNING') {
        fail(label, `${agent} registry does not preserve Agent 7 wartime manager plus Agent 10 release owner boundary`);
      }
    } else {
      if (!conditional.includes(agent)) fail(label, `${agent} missing from CONDITIONAL organization state`);
      if (registryEntry.manager !== 'Agent 10' || registryEntry.organization_state !== 'CONDITIONAL') {
        fail(label, `${agent} registry does not route through Agent 10 as conditional lane`);
      }
    }
  }
  for (const agent of ['Agent 5', 'Agent 6', 'Agent 7', 'Agent 8', 'Agent 9', 'Agent 12']) {
    if (!rationed.includes(agent)) fail(label, `${agent} missing from RATIONED organization state`);
  }
  const a13 = findAgent(registry, 'Agent 13') || {};
  if (a13.pulse_role !== 'none_scheduled_wake_conditions_only' || a13.idle_prompt_allowed !== false) {
    fail(label, 'Agent 13 registry does not preserve sleep/no-scheduled-pulse posture');
  }
  const a10Goal = (board.goals || []).find((goal) => goal.id === 'agent10-it-operations-monitoring') || {};
  if (a10Goal.organization_state !== 'ACTIVE' || !String(a10Goal.current_assigned_goal || '').toLowerCase().includes('target 10')) {
    fail(label, 'Agent 10 goal does not preserve ACTIVE release-owner mission target 10');
  }
  if (!text.includes('no qa acceptance') || !text.includes('source/provenance') || !text.includes('public/runtime') || !text.includes('accepted translation text')) {
    fail(label, 'organization boundary does not preserve non-acceptance language');
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 13 organization sets CEO/manager/release/budget owners, wake states, cadence, and non-acceptance boundaries');
  }
}

function findAgent(registry, agentName) {
  return (registry.agents || []).find((candidate) => candidate.agent === agentName || candidate.id === agentName || candidate.name === agentName);
}

function checkAgentRegistrySops() {
  const label = 'agent registry lane SOP mappings';
  const expected = new Map([
    ['Agent 1', 'SOP-010'],
    ['Agent 2', 'SOP-011'],
    ['Agent 3', 'SOP-012'],
    ['Agent 4', 'SOP-013'],
    ['Agent 5', 'SOP-014'],
    ['Agent 6', 'SOP-015'],
    ['Agent 7', 'SOP-016'],
  ]);
  for (const [agent, sop] of expected) {
    const entry = (registry.agents || []).find((candidate) => candidate.id === agent || candidate.name === agent || candidate.agent === agent);
    if (!entry) {
      fail(label, `${agent} missing`);
      continue;
    }
    const mapped = entry.lane_sop || entry.sop || entry.role_sop;
    if (!matchesSop(mapped, sop)) fail(label, `${agent} lane_sop ${mapped || 'missing'}, expected ${sop}`);
  }
  if (!issues.some((issue) => issue.startsWith(label))) {
    pass(label, 'Agent 1-7 lane SOP mappings are aligned');
  }
}

function matchesSop(value, sop) {
  const normalized = String(value || '').toLowerCase();
  return normalized === sop.toLowerCase() || normalized.includes(sop.toLowerCase());
}

function readJson(file) {
  const full = path.join(root, file);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function readJsonIfExists(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function readTextIfExists(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf8');
}

function codepoints(value) {
  return Array.from(String(value || '')).map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join(' ');
}

function pass(check, detail) {
  checks.push({ status: 'pass', check, detail });
}

function warn(check, detail) {
  warnings.push(`${check}: ${detail}`);
  checks.push({ status: 'warn', check, detail });
}

function fail(check, detail) {
  issues.push(`${check}: ${detail}`);
  checks.push({ status: 'fail', check, detail });
}

function writeReport() {
  const lines = [];
  lines.push('# Agent 7 Governance Control Health');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Status: ${issues.length ? 'failed' : 'passed'}`);
  lines.push(`- Issues: ${issues.length}`);
  lines.push(`- Warnings: ${warnings.length}`);
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  lines.push('| status | check | detail |');
  lines.push('|---|---|---|');
  for (const check of checks) {
    lines.push(`| ${check.status} | ${escapePipes(check.check)} | ${escapePipes(check.detail)} |`);
  }
  lines.push('');
  lines.push('## Interpretation');
  lines.push('');
  lines.push('- This is a governance/control validator only.');
  lines.push('- It does not create QA acceptance, publication readiness, source/provenance custody, runtime acceptance, product/data gate acceptance, or accepted translation text.');
  lines.push('- Agent 6 dockets remain the authority for pass/warn/block dispositions.');
  fs.writeFileSync(path.join(root, reportPath), `${lines.join('\n')}\n`);
}
function escapePipes(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
