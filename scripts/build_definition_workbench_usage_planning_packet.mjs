#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const defaults = {
  plan: 'data/control/definition_workbench_plan.json',
  usageOccurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  usageRouteResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  usageSampleGapAudit: 'data/definitions/definition-workbench-usage-sample-gap-audit.json',
  usageConsumerManifest: 'data/definitions/definition-workbench-usage-consumer-manifest.json',
  usageQueueReadyPacket: 'data/definitions/definition-workbench-usage-queue-ready-packet.json',
  output: 'data/definitions/definition-workbench-usage-planning-packet.json',
  report: 'reports/definition-workbench-usage-planning-packet.md',
};

const options = parseArgs(process.argv.slice(2));
const plan = readJson(options.plan);
const occurrenceLinks = readJson(options.usageOccurrenceLinks);
const routeResolution = readJson(options.usageRouteResolution);
const sampleGapAudit = readJson(options.usageSampleGapAudit);
const consumerManifest = readJson(options.usageConsumerManifest);
const queueReadyPacket = readJson(options.usageQueueReadyPacket);

assertArtifact(plan, 'definition_workbench_plan', options.plan);
assertArtifact(occurrenceLinks, 'definition_workbench_usage_occurrence_links', options.usageOccurrenceLinks);
assertArtifact(routeResolution, 'definition_workbench_usage_route_resolution', options.usageRouteResolution);
assertArtifact(sampleGapAudit, 'definition_workbench_usage_sample_gap_audit', options.usageSampleGapAudit);
assertArtifact(consumerManifest, 'definition_workbench_usage_consumer_manifest', options.usageConsumerManifest);
assertArtifact(queueReadyPacket, 'definition_workbench_usage_queue_ready_packet', options.usageQueueReadyPacket);

const sourceArtifacts = {
  plan: options.plan,
  occurrence_links: options.usageOccurrenceLinks,
  route_resolution: options.usageRouteResolution,
  sample_gap_audit: options.usageSampleGapAudit,
  consumer_manifest: options.usageConsumerManifest,
  queue_ready_packet: options.usageQueueReadyPacket,
};

const planningRows = buildPlanningRows();
const occurrenceRows = buildOccurrenceRows();
const planningHandoffSummary = buildPlanningHandoffSummary(planningRows, occurrenceRows);
const counts = buildCounts(planningRows, occurrenceRows, planningHandoffSummary);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_planning_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_planning_packet.mjs',
  lane_owner: 'Agent 3',
  gate: 'definition_workbench_gate',
  source_artifacts: sourceArtifacts,
  policy: 'Bounded Agent 3 planning-lane packet joining selected usage occurrence links to the Definition Workbench gate. Rows are observed usage/navigation only, carry source/license/context metadata, link to Agent 2 routes by ID only, and do not rank routes, choose visible answers, copy route payloads, emit accepted text, or claim publication readiness.',
  authority_boundary: {
    usage_navigation_only: true,
    occurrence_links_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    planning_packet_only: true,
    reader_facing: false,
    lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_result_selection: false,
    copied_route_payloads: false,
    accepted_text_output: false,
    publication_claim: false,
  },
  planning_gate_boundary: {
    target_gate: 'definition_workbench_gate',
    product_direction: plan.product_goal || null,
    current_plan_status: plan.status || null,
    current_sample_overlap_status: sampleGapAudit.sample_overlap_snapshot?.current_overlap_status || null,
    current_sample_rows: Number(sampleGapAudit.counts?.sample_rows || 0),
    current_sample_rows_with_usage_links: Number(sampleGapAudit.counts?.sample_rows_with_usage_links || 0),
    agent6_boundary_status: 'accepted-with-boundary-warning-only-if-submitted-and-reviewed',
    agent3_queue_mutation: false,
    agent3_submission_to_agent6: false,
    intended_submitter: queueReadyPacket.submission_boundary?.intended_submitter || 'Agent 5',
  },
  usage_status_policy: {
    supported_candidate_weak_are_usage_navigation_statuses: true,
    status_is_not_review_authority: true,
    ambiguous_rows_policy: 'audit_only_not_reader_facing',
    current_sample_gap_policy: sampleGapAudit.sample_overlap_snapshot?.gap_interpretation || null,
  },
  planning_handoff_summary: planningHandoffSummary,
  planning_rows: planningRows,
  occurrence_navigation_links: occurrenceRows,
  counts,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage planning packet ${artifact.quality.status}; planning rows ${counts.planning_rows}; occurrence links ${counts.occurrence_link_rows}; reader-facing ${counts.reader_facing_rows}`);

function buildPlanningRows() {
  const gapRows = Array.isArray(sampleGapAudit.gap_rows) ? sampleGapAudit.gap_rows : [];
  return gapRows.map((row) => ({
    planning_row_id: row.gap_id,
    seed_id: row.seed_id,
    token_key: row.token_key,
    normalized_form: row.normalized_form,
    current_sample_link_status: row.current_sample_link_status,
    next_planning_action: row.recommended_next_action,
    usage_occurrence_rows: Number(row.usage_occurrence_rows || 0),
    selected_usage_occurrence_rows: Number(row.selected_usage_occurrence_rows || 0),
    selected_occurrence_link_count: Number(row.selected_occurrence_link_count || 0),
    source_ref_count: Number(row.source_ref_count || 0),
    work_count: Number(row.work_count || 0),
    route_ids: Array.isArray(row.route_ids) ? row.route_ids : [],
    licenses: Array.isArray(row.licenses) ? row.licenses : [],
    usage_frames: row.usage_frames || {},
    audit_only_ambiguous_rows: Number(row.audit_only_ambiguous_rows || 0),
    route_concentration_warning_visible: row.route_concentration_warning_visible === true,
    sample_overlap_gap_visible: true,
    row_label: 'observed usage only',
    row_boundary: {
      reader_facing: false,
      route_ids_only: true,
      lexical_authority: false,
      semantic_arbitration: false,
      publication_claim: false,
    },
  }));
}

function buildOccurrenceRows() {
  const rows = Array.isArray(occurrenceLinks.occurrence_links) ? occurrenceLinks.occurrence_links : [];
  return rows.map((row) => ({
    row_id: row.row_id,
    occurrence_id: row.occurrence_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    row_label: 'observed usage only',
    source_ref: row.source_ref,
    source_url: row.source_href,
    work_page_anchor: row.work_anchor_href,
    work_title: row.work_title,
    work_slug: row.work_slug,
    phrase_context_snippet: row.context_focus_marked,
    usage_frame_label: row.usage_frame_label,
    status: row.status,
    raw_score: Number(row.raw_score || 0),
    cluster_id: row.cluster_id,
    related_route_ids: Array.isArray(row.related_route_ids) ? row.related_route_ids : [],
    provenance_id: row.provenance_id,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    row_boundary: {
      reader_facing: false,
      route_ids_only: true,
      lexical_authority: false,
      semantic_arbitration: false,
      route_ranking: false,
      visible_result_selection: false,
      publication_claim: false,
    },
  }));
}

function buildPlanningHandoffSummary(planningRows, occurrenceRows) {
  const routeIds = Array.from(new Set(occurrenceRows.flatMap((row) => row.related_route_ids || []))).sort();
  const routeRows = Array.isArray(routeResolution.occurrence_route_rows) ? routeResolution.occurrence_route_rows : [];
  const resolvedRouteIds = new Set();
  const unresolvedRouteIds = new Set();
  for (const row of routeRows) {
    const rowRouteIds = [
      ...arrayOrEmpty(row.related_route_ids),
      ...arrayOrEmpty(row.route_ids),
      row.route_id,
    ].filter(Boolean);
    for (const routeId of rowRouteIds) {
      if (row.route_resolved === false || row.resolved === false || row.resolution_status === 'unresolved') {
        unresolvedRouteIds.add(routeId);
      } else {
        resolvedRouteIds.add(routeId);
      }
    }
  }
  if (!routeRows.length) {
    for (const routeId of routeIds) resolvedRouteIds.add(routeId);
  }

  const statusCounts = countBy(occurrenceRows, (row) => row.status || 'missing');
  const tokenKeys = Array.from(new Set(planningRows.map((row) => row.token_key).filter(Boolean))).sort();
  const occurrenceTokenKeys = Array.from(new Set(occurrenceRows.map((row) => row.token_key).filter(Boolean))).sort();
  const sourceRefs = Array.from(new Set(occurrenceRows.map((row) => row.source_ref).filter(Boolean))).sort();
  const workSlugs = Array.from(new Set(occurrenceRows.map((row) => row.work_slug).filter(Boolean))).sort();
  const licenses = Array.from(new Set(occurrenceRows.map((row) => row.license).filter(Boolean))).sort();
  const versionSources = Array.from(new Set(occurrenceRows.map((row) => row.version_source).filter(Boolean))).sort();
  const usageFrames = countBy(occurrenceRows, (row) => row.usage_frame_label || 'missing');

  return {
    packet_role: 'usage_occurrence_link_support_for_definition_workbench_planning',
    consumer_boundary: {
      intended_consumer: 'Agent 5 planning handoff and Agent 6 QA review',
      hud_or_ranking_owner: false,
      route_data_owner: false,
      source_import_owner: false,
      queue_mutation_owner: false,
    },
    allowed_planning_use: [
      'inspect occurrence links by token key',
      'prioritize future Definition Workbench sample joins',
      'verify source/license/context completeness for selected usage rows',
      'route reviewers back to Agent 2 cards by ID only',
    ],
    forbidden_planning_use: [
      'definition authority',
      'semantic arbitration',
      'route ranking',
      'visible result selection',
      'publication support',
      'accepted text output',
      'copying Agent 2 route payloads',
    ],
    row_visibility: {
      selected_rows_label: 'observed usage only',
      ambiguous_rows_label: 'audit only',
      reader_facing_rows: 0,
    },
    selected_scope: {
      selected_token_keys: tokenKeys,
      occurrence_token_keys: occurrenceTokenKeys,
      planning_rows: planningRows.length,
      occurrence_links: occurrenceRows.length,
      source_refs: sourceRefs.length,
      works: workSlugs.length,
      usage_frames: usageFrames,
      statuses: {
        supported: Number(statusCounts.supported || 0),
        candidate: Number(statusCounts.candidate || 0),
        weak: Number(statusCounts.weak || 0),
      },
    },
    route_linkage: {
      linkage_mode: 'route_ids_only',
      route_ids: routeIds,
      resolved_route_ids: Array.from(resolvedRouteIds).sort(),
      unresolved_route_ids: Array.from(unresolvedRouteIds).sort(),
      route_payloads_copied: false,
      linked_artifact_owner: 'Agent 2',
    },
    provenance_snapshot: {
      licenses,
      version_source_count: versionSources.length,
      source_refs: sourceRefs,
      works: workSlugs,
      all_rows_have_source_license_context: occurrenceRows.every((row) => (
        row.source_ref
        && row.source_url
        && row.work_page_anchor
        && row.phrase_context_snippet
        && row.license
        && row.license_url
        && row.version_title
        && row.version_source
      )),
    },
    sample_join_status: {
      current_sample_rows: Number(sampleGapAudit.counts?.sample_rows || 0),
      current_sample_rows_with_usage_links: Number(sampleGapAudit.counts?.sample_rows_with_usage_links || 0),
      usage_tokens_not_in_current_sample: Number(sampleGapAudit.counts?.usage_tokens_not_in_sample || 0),
      recommended_next_action: planningRows[0]?.next_planning_action || null,
    },
    qa_boundary_references: [
      'reports/agent6-usage-navigation-boundary-verdict-2026-06-01.md',
      'reports/agent6-usage-route-concentration-docket.md',
    ],
    warning_summary: {
      route_concentration_warning_visible: routeIds.length === 1,
      current_sample_gap_visible: Number(sampleGapAudit.counts?.sample_rows_with_usage_links || 0) === 0,
      broad_coverage_claim_allowed: false,
      semantic_independence_claim_allowed: false,
    },
    review_state: {
      agent3_queue_mutation: false,
      agent3_submission_to_agent6: false,
      intended_submitter: queueReadyPacket.submission_boundary?.intended_submitter || 'Agent 5',
    },
  };
}

function buildCounts(planningRows, occurrenceRows, planningHandoffSummary) {
  const routeIds = new Set();
  for (const row of occurrenceRows) {
    for (const routeId of row.related_route_ids || []) routeIds.add(routeId);
  }
  return {
    planning_rows: planningRows.length,
    planning_rows_absent_from_current_sample: planningRows.filter((row) => row.current_sample_link_status === 'absent_from_current_definition_workbench_sample').length,
    occurrence_link_rows: occurrenceRows.length,
    occurrence_rows_with_source_ref: occurrenceRows.filter((row) => row.source_ref).length,
    occurrence_rows_with_source_url: occurrenceRows.filter((row) => row.source_url).length,
    occurrence_rows_with_work_page_anchor: occurrenceRows.filter((row) => row.work_page_anchor).length,
    occurrence_rows_with_context_snippet: occurrenceRows.filter((row) => row.phrase_context_snippet).length,
    occurrence_rows_with_focus_marker: occurrenceRows.filter((row) => /\[.+\]/u.test(row.phrase_context_snippet || '')).length,
    occurrence_rows_with_license: occurrenceRows.filter((row) => row.license && row.license_url).length,
    occurrence_rows_with_version: occurrenceRows.filter((row) => row.version_title && row.version_source).length,
    occurrence_rows_with_route_ids: occurrenceRows.filter((row) => (row.related_route_ids || []).length > 0).length,
    planning_rows_with_forbidden_license: planningRows.filter((row) => (row.licenses || []).some((license) => hasForbiddenLicense(license))).length,
    occurrence_rows_with_forbidden_license: occurrenceRows.filter((row) => hasForbiddenLicense(row.license)).length,
    forbidden_license_rows: planningRows.filter((row) => (row.licenses || []).some((license) => hasForbiddenLicense(license))).length
      + occurrenceRows.filter((row) => hasForbiddenLicense(row.license)).length,
    route_ids: routeIds.size,
    current_sample_rows: Number(sampleGapAudit.counts?.sample_rows || 0),
    current_sample_rows_with_usage_links: Number(sampleGapAudit.counts?.sample_rows_with_usage_links || 0),
    current_sample_usage_tokens_not_in_sample: Number(sampleGapAudit.counts?.usage_tokens_not_in_sample || 0),
    audit_only_ambiguous_rows: Number(sampleGapAudit.counts?.audit_only_ambiguous_rows || occurrenceLinks.audit_only_summary?.ambiguous_rows_available_in_concordance || 0),
    route_concentration_warning_visible: Number(sampleGapAudit.counts?.route_concentration_warning_visible || 0),
    reader_facing_rows: occurrenceRows.filter((row) => row.row_boundary?.reader_facing !== false).length,
    route_payload_field_hits: countForbiddenKeyHits(artifactSafeObject({ planningRows, occurrenceRows }), ['route_payload', 'route_payloads']),
    forbidden_authority_field_hits: countForbiddenKeyHits(artifactSafeObject({ planningRows, occurrenceRows }), [
      'meaning',
      'meaning_claim',
      'translation',
      'translation_text',
      'accepted_translation',
      'final_answer',
      'winner',
    ]),
    queue_mutations: 0,
    submitted_to_agent6: 0,
    planning_summary_token_keys: planningHandoffSummary.selected_scope.selected_token_keys.length,
    planning_summary_occurrence_token_keys: planningHandoffSummary.selected_scope.occurrence_token_keys.length,
    planning_summary_supported_rows: planningHandoffSummary.selected_scope.statuses.supported,
    planning_summary_candidate_rows: planningHandoffSummary.selected_scope.statuses.candidate,
    planning_summary_weak_rows: planningHandoffSummary.selected_scope.statuses.weak,
    planning_summary_resolved_route_ids: planningHandoffSummary.route_linkage.resolved_route_ids.length,
    planning_summary_unresolved_route_ids: planningHandoffSummary.route_linkage.unresolved_route_ids.length,
    planning_summary_source_refs: planningHandoffSummary.selected_scope.source_refs,
    planning_summary_works: planningHandoffSummary.selected_scope.works,
    planning_summary_forbidden_use_items: planningHandoffSummary.forbidden_planning_use.length,
    planning_summary_qa_boundary_references: planningHandoffSummary.qa_boundary_references.length,
  };
}

function buildChecks(counts) {
  return [
    check('planning_rows_present', counts.planning_rows > 0 ? 'passed' : 'failed', `planning rows ${counts.planning_rows}`),
    check('current_sample_gap_visible', counts.current_sample_rows > 0 && counts.current_sample_rows_with_usage_links === 0 && counts.current_sample_usage_tokens_not_in_sample > 0 ? 'warning' : 'failed', `sample links ${counts.current_sample_rows_with_usage_links}/${counts.current_sample_rows}; absent tokens ${counts.current_sample_usage_tokens_not_in_sample}`),
    check('occurrence_links_present', counts.occurrence_link_rows > 0 ? 'passed' : 'failed', `occurrence links ${counts.occurrence_link_rows}`),
    check('source_work_context_complete', counts.occurrence_rows_with_source_ref === counts.occurrence_link_rows && counts.occurrence_rows_with_source_url === counts.occurrence_link_rows && counts.occurrence_rows_with_work_page_anchor === counts.occurrence_link_rows && counts.occurrence_rows_with_context_snippet === counts.occurrence_link_rows && counts.occurrence_rows_with_focus_marker === counts.occurrence_link_rows ? 'passed' : 'failed', `source/url/work/context/focus ${counts.occurrence_rows_with_source_ref}/${counts.occurrence_rows_with_source_url}/${counts.occurrence_rows_with_work_page_anchor}/${counts.occurrence_rows_with_context_snippet}/${counts.occurrence_rows_with_focus_marker}`),
    check('license_version_complete', counts.occurrence_rows_with_license === counts.occurrence_link_rows && counts.occurrence_rows_with_version === counts.occurrence_link_rows ? 'passed' : 'failed', `license/version ${counts.occurrence_rows_with_license}/${counts.occurrence_rows_with_version}`),
    check('license_boundary_safe', counts.forbidden_license_rows === 0 ? 'passed' : 'failed', `forbidden license rows ${counts.forbidden_license_rows}; planning ${counts.planning_rows_with_forbidden_license}; occurrence ${counts.occurrence_rows_with_forbidden_license}`),
    check('route_ids_only_linkage', counts.occurrence_rows_with_route_ids === counts.occurrence_link_rows && counts.route_ids > 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `rows with route IDs ${counts.occurrence_rows_with_route_ids}; route IDs ${counts.route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('route_concentration_warning_visible', counts.route_concentration_warning_visible === 1 ? 'warning' : 'failed', `route concentration warning ${counts.route_concentration_warning_visible}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `audit-only ambiguous rows ${counts.audit_only_ambiguous_rows}; reader-facing ${counts.reader_facing_rows}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; forbidden authority hits ${counts.forbidden_authority_field_hits}`),
    check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `queue mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
    check('planning_handoff_summary_complete', counts.planning_summary_token_keys > 0 && counts.planning_summary_occurrence_token_keys > 0 && counts.planning_summary_source_refs > 0 && counts.planning_summary_works > 0 && counts.planning_summary_forbidden_use_items >= 7 && counts.planning_summary_qa_boundary_references >= 2 ? 'passed' : 'failed', `tokens ${counts.planning_summary_token_keys}/${counts.planning_summary_occurrence_token_keys}; source refs ${counts.planning_summary_source_refs}; works ${counts.planning_summary_works}; forbidden uses ${counts.planning_summary_forbidden_use_items}; QA refs ${counts.planning_summary_qa_boundary_references}`),
    check('planning_status_counts_reconcile', counts.planning_summary_supported_rows + counts.planning_summary_candidate_rows + counts.planning_summary_weak_rows === counts.occurrence_link_rows ? 'passed' : 'failed', `supported/candidate/weak ${counts.planning_summary_supported_rows}/${counts.planning_summary_candidate_rows}/${counts.planning_summary_weak_rows}; occurrence links ${counts.occurrence_link_rows}`),
    check('planning_route_resolution_visible', counts.planning_summary_resolved_route_ids === counts.route_ids && counts.planning_summary_unresolved_route_ids === 0 ? 'passed' : 'failed', `resolved/unresolved route IDs ${counts.planning_summary_resolved_route_ids}/${counts.planning_summary_unresolved_route_ids}`),
  ];
}

function writeReport(relativePath, packet) {
  const lines = [
    '# Definition Workbench Usage Planning Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Lane: Agent 3 usage navigation.',
    '- Gate: Definition Workbench planning only.',
    '- Rows are labeled observed usage only.',
    '- Route linkage is route IDs only; no Agent 2 payloads are copied.',
    '- Ambiguous rows remain audit-only.',
    '- Reader-facing rows: 0.',
    '- Queue mutations: 0.',
    '',
    '## Counts',
    '',
    `- Planning rows: ${packet.counts.planning_rows}`,
    `- Occurrence links: ${packet.counts.occurrence_link_rows}`,
    `- Current sample usage links: ${packet.counts.current_sample_rows_with_usage_links}/${packet.counts.current_sample_rows}`,
    `- Usage tokens absent from current sample: ${packet.counts.current_sample_usage_tokens_not_in_sample}`,
    `- Route IDs: ${packet.counts.route_ids}`,
    `- Supported/candidate/weak occurrence links: ${packet.counts.planning_summary_supported_rows}/${packet.counts.planning_summary_candidate_rows}/${packet.counts.planning_summary_weak_rows}`,
    `- Audit-only ambiguous rows: ${packet.counts.audit_only_ambiguous_rows}`,
    `- Forbidden license rows: ${packet.counts.forbidden_license_rows}`,
    `- Forbidden authority field hits: ${packet.counts.forbidden_authority_field_hits}`,
    `- QA boundary references: ${packet.counts.planning_summary_qa_boundary_references}`,
    '',
    '## Planning Handoff Summary',
    '',
    `- Packet role: ${packet.planning_handoff_summary.packet_role}`,
    `- Intended consumer: ${packet.planning_handoff_summary.consumer_boundary.intended_consumer}`,
    `- Selected row label: ${packet.planning_handoff_summary.row_visibility.selected_rows_label}`,
    `- Ambiguous row label: ${packet.planning_handoff_summary.row_visibility.ambiguous_rows_label}`,
    `- Route linkage: ${packet.planning_handoff_summary.route_linkage.linkage_mode}`,
    `- Route IDs resolved/unresolved: ${packet.counts.planning_summary_resolved_route_ids}/${packet.counts.planning_summary_unresolved_route_ids}`,
    `- Broad coverage claim allowed: ${packet.planning_handoff_summary.warning_summary.broad_coverage_claim_allowed}`,
    `- Semantic independence claim allowed: ${packet.planning_handoff_summary.warning_summary.semantic_independence_claim_allowed}`,
    '',
    '## Checks',
    '',
    ...packet.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
    '',
    '## Source Artifacts',
    '',
    ...Object.entries(packet.source_artifacts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## QA Boundary References',
    '',
    ...packet.planning_handoff_summary.qa_boundary_references.map((value) => `- ${value}`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function countForbiddenKeyHits(value, keys) {
  const forbidden = new Set(keys);
  let hits = 0;
  walk(value);
  return hits;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) hits += 1;
      walk(child);
    }
  }
}

function artifactSafeObject(value) {
  return JSON.parse(JSON.stringify(value));
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function countBy(rows, fn) {
  const counts = {};
  for (const row of rows) {
    const key = fn(row);
    counts[key] = Number(counts[key] || 0) + 1;
  }
  return counts;
}

function hasForbiddenLicense(value) {
  return forbiddenLicenseRe.test(String(value || ''));
}

function assertArtifact(value, artifactType, relativePath) {
  if (value.artifact_type !== artifactType) {
    throw new Error(`${relativePath} must be ${artifactType}`);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const outputPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, value);
}

function cleanRelativePath(value) {
  return value.replace(/^--[^=]+=*/, '').replace(/\\/g, '/');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, ...rawValue] = arg.slice(2).split('=');
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    parsed[key] = rawValue.join('=') || 'true';
  }
  return parsed;
}
