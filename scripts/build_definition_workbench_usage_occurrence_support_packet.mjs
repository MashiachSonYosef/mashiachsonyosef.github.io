#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  planningPacket: 'data/definitions/definition-workbench-usage-planning-packet.json',
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  anchorAudit: 'data/definitions/definition-workbench-usage-anchor-audit.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  consumerManifest: 'data/definitions/definition-workbench-usage-consumer-manifest.json',
  output: 'data/definitions/definition-workbench-usage-occurrence-support-packet.json',
  report: 'reports/definition-workbench-usage-occurrence-support-packet.md',
};
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenAuthorityKeys = [
  'definition',
  'definition_text',
  'source_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_metadata',
];

const options = parseArgs(process.argv.slice(2));
const planningPacket = readJson(options.planningPacket);
const occurrenceLinks = readJson(options.occurrenceLinks);
const anchorAudit = readJson(options.anchorAudit);
const routeResolution = readJson(options.routeResolution);
const consumerManifest = readJson(options.consumerManifest);

assertArtifact(planningPacket, 'definition_workbench_usage_planning_packet', options.planningPacket);
assertArtifact(occurrenceLinks, 'definition_workbench_usage_occurrence_links', options.occurrenceLinks);
assertArtifact(anchorAudit, 'definition_workbench_usage_anchor_audit', options.anchorAudit);
assertArtifact(routeResolution, 'definition_workbench_usage_route_resolution', options.routeResolution);
assertArtifact(consumerManifest, 'definition_workbench_usage_consumer_manifest', options.consumerManifest);

const occurrenceById = new Map((occurrenceLinks.occurrence_links || []).map((row) => [row.occurrence_id, row]));
const routeRowsByOccurrenceId = groupBy(routeResolution.occurrence_route_rows || [], (row) => row.occurrence_id);
const planningRows = buildPlanningRows();
const supportRows = buildSupportRows();
const counts = buildCounts(planningRows, supportRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_occurrence_support_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_occurrence_support_packet.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    planning_packet: options.planningPacket,
    occurrence_links: options.occurrenceLinks,
    anchor_audit: options.anchorAudit,
    route_resolution: options.routeResolution,
    consumer_manifest: options.consumerManifest,
  },
  policy: 'Bounded occurrence-link support packet for Definition Workbench planning. Rows are usage-navigation links only: source ref, source URL, local work anchor, Hebrew context, token/focus surfaces, usage frame, status, raw score, provenance/license, and related Agent 2 route IDs. The packet does not copy route payloads, rank routes, select answers, emit definitions, make usage rows reader-facing, or claim publication readiness.',
  authority_boundary: {
    usage_navigation_only: true,
    occurrence_links_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    planning_support_only: true,
    reader_facing: false,
    lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_route_payloads: false,
    accepted_text_output: false,
    publication_claim: false,
    agent6_accepted: false,
  },
  planning_context: {
    current_sample_rows: Number(planningPacket.counts?.current_sample_rows || 0),
    current_sample_rows_with_usage_links: Number(planningPacket.counts?.current_sample_rows_with_usage_links || 0),
    usage_tokens_absent_from_current_sample: Number(planningPacket.counts?.current_sample_usage_tokens_not_in_sample || 0),
    route_concentration_warning_visible: Number(planningPacket.counts?.route_concentration_warning_visible || 0),
    audit_only_ambiguous_rows_available: Number(planningPacket.counts?.audit_only_ambiguous_rows || 0),
    current_planning_gap_label: 'observed usage only',
  },
  consumer_manifest_boundary: {
    required_row_label: consumerManifest.consumer_contract?.required_row_label || 'observed usage only',
    ambiguous_rows_policy: consumerManifest.consumer_contract?.ambiguous_rows_policy || 'audit-only',
    route_payload_rule: consumerManifest.consumer_contract?.downstream_route_payload_rule || 'route IDs only',
    reviewed_lexical_authority: consumerManifest.authority_policy?.reviewed_lexical_authority === true,
    publication_readiness: consumerManifest.authority_policy?.publication_readiness === true,
  },
  planning_rows: planningRows,
  support_rows: supportRows,
  counts,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
};

artifact.counts.forbidden_authority_field_hits = countForbiddenKeyHits(artifact, forbiddenAuthorityKeys);
artifact.checks = buildChecks(artifact.counts);
artifact.quality.failed_count = artifact.checks.filter((check) => check.status === 'failed').length;
artifact.quality.warning_count = artifact.checks.filter((check) => check.status === 'warning').length;
artifact.quality.status = artifact.quality.failed_count ? 'failed' : artifact.quality.warning_count ? 'pass_with_warnings' : 'passed';

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage occurrence support packet ${artifact.quality.status}; rows ${artifact.counts.support_rows}; route IDs ${artifact.counts.route_ids}; reader-facing ${artifact.counts.reader_facing_rows}`);

function buildPlanningRows() {
  return (planningPacket.planning_rows || []).map((row) => ({
    planning_row_id: row.planning_row_id,
    token_key: row.token_key,
    normalized_form: row.normalized_form,
    current_sample_link_status: row.current_sample_link_status,
    next_planning_action: row.next_planning_action,
    usage_occurrence_rows: Number(row.usage_occurrence_rows || 0),
    selected_usage_occurrence_rows: Number(row.selected_usage_occurrence_rows || 0),
    selected_occurrence_link_count: Number(row.selected_occurrence_link_count || 0),
    source_ref_count: Number(row.source_ref_count || 0),
    work_count: Number(row.work_count || 0),
    related_agent2_route_ids: Array.isArray(row.route_ids) ? row.route_ids : [],
    usage_frames: row.usage_frames || {},
    audit_only_ambiguous_rows: Number(row.audit_only_ambiguous_rows || 0),
    route_concentration_warning_visible: row.route_concentration_warning_visible === true,
    row_label: 'observed usage only',
    planning_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
      not_publication_support: true,
    },
  }));
}

function buildSupportRows() {
  return (anchorAudit.audit_rows || []).map((auditRow, index) => {
    const occurrenceRow = occurrenceById.get(auditRow.occurrence_id) || {};
    const routeRows = routeRowsByOccurrenceId.get(auditRow.occurrence_id) || [];
    const relatedRouteIds = unique([
      ...(Array.isArray(auditRow.related_route_ids) ? auditRow.related_route_ids : []),
      ...(Array.isArray(occurrenceRow.related_route_ids) ? occurrenceRow.related_route_ids : []),
      ...routeRows.map((row) => row.route_id).filter(Boolean),
    ]);
    return {
      support_row_id: `definition-workbench-usage-occurrence-support-${String(index + 1).padStart(3, '0')}`,
      occurrence_id: auditRow.occurrence_id,
      source_ref: auditRow.source_ref,
      source_url: auditRow.source_url,
      local_work_page_anchor: auditRow.work_anchor_href,
      local_work_page_path: auditRow.work_page_path,
      local_work_anchor_fragment: auditRow.work_anchor_fragment,
      work_title: occurrenceRow.work_title || null,
      work_slug: occurrenceRow.work_slug || null,
      token_key: auditRow.token_key,
      token_surface: auditRow.token_surface,
      token_normalized: auditRow.token_normalized,
      focus_surface: auditRow.focus_surface,
      focus_normalized: auditRow.focus_normalized,
      phrase_context_snippet: auditRow.phrase_context_snippet,
      usage_frame_label: auditRow.usage_frame_label,
      status: auditRow.status,
      raw_score: Number(auditRow.raw_score || 0),
      cluster_id: auditRow.cluster_id,
      row_label: 'observed usage only',
      related_agent2_route_ids: relatedRouteIds,
      route_link_state: routeRows.every((row) => row.resolution_status === 'resolved') ? 'resolved_route_ids_only' : 'unresolved_route_id_check_required',
      provenance_id: occurrenceRow.provenance_id || null,
      version_title: auditRow.version_title,
      version_source: auditRow.version_source,
      license: auditRow.license,
      license_url: auditRow.license_url,
      local_anchor_audit: {
        work_page_exists: auditRow.work_page_exists === true,
        work_anchor_exists: auditRow.work_anchor_exists === true,
        source_ref_matches_page_unit: auditRow.source_ref_matches_page_unit === true,
        token_surface_found_in_page: auditRow.token_surface_found_in_page === true,
        focus_surface_found_in_page: auditRow.focus_surface_found_in_page === true,
        context_has_focus_marker: auditRow.context_has_focus_marker === true,
      },
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        route_payload_copied: false,
        not_definition_authority: true,
        not_semantic_arbitration: true,
        not_route_ranking: true,
        not_visible_answer_selection: true,
        not_publication_support: true,
        not_accepted_text: true,
      },
    };
  }).sort(compareSupportRows);
}

function buildCounts(rows, supportRows) {
  const routeIds = new Set();
  const sourceRefs = new Set();
  const works = new Set();
  const licenses = new Set();
  const versionSources = new Set();
  const usageFrames = new Set();
  for (const row of supportRows) {
    for (const routeId of row.related_agent2_route_ids || []) routeIds.add(routeId);
    if (row.source_ref) sourceRefs.add(row.source_ref);
    if (row.work_slug) works.add(row.work_slug);
    if (row.license) licenses.add(row.license);
    if (row.version_source) versionSources.add(row.version_source);
    if (row.usage_frame_label) usageFrames.add(row.usage_frame_label);
  }
  return {
    planning_rows: rows.length,
    planning_rows_with_observed_usage_label: rows.filter((row) => row.row_label === 'observed usage only').length,
    planning_rows_absent_from_current_sample: rows.filter((row) => row.current_sample_link_status === 'absent_from_current_definition_workbench_sample').length,
    support_rows: supportRows.length,
    supported_rows: supportRows.filter((row) => row.status === 'supported').length,
    candidate_rows: supportRows.filter((row) => row.status === 'candidate').length,
    weak_rows: supportRows.filter((row) => row.status === 'weak').length,
    source_refs: sourceRefs.size,
    works: works.size,
    licenses: licenses.size,
    version_sources: versionSources.size,
    usage_frames: usageFrames.size,
    route_ids: routeIds.size,
    rows_with_source_ref: supportRows.filter((row) => row.source_ref).length,
    rows_with_source_url: supportRows.filter((row) => /^https:\/\//.test(row.source_url || '')).length,
    rows_with_local_work_anchor: supportRows.filter((row) => row.local_work_page_anchor).length,
    rows_with_work_title: supportRows.filter((row) => row.work_title).length,
    rows_with_token_surface: supportRows.filter((row) => row.token_surface && row.token_normalized).length,
    rows_with_focus_surface: supportRows.filter((row) => row.focus_surface && row.focus_normalized).length,
    rows_with_context_snippet: supportRows.filter((row) => row.phrase_context_snippet).length,
    rows_with_focus_marker: supportRows.filter((row) => /\[.+\]/u.test(row.phrase_context_snippet || '')).length,
    rows_with_usage_frame: supportRows.filter((row) => row.usage_frame_label).length,
    rows_with_status_score: supportRows.filter((row) => ['supported', 'candidate', 'weak'].includes(row.status) && Number.isInteger(row.raw_score)).length,
    rows_with_route_ids: supportRows.filter((row) => (row.related_agent2_route_ids || []).length > 0).length,
    rows_with_resolved_route_id_linkage: supportRows.filter((row) => row.route_link_state === 'resolved_route_ids_only').length,
    rows_with_version_metadata: supportRows.filter((row) => row.version_title && row.version_source).length,
    rows_with_license_metadata: supportRows.filter((row) => row.license && /^https:\/\//.test(row.license_url || '')).length,
    rows_with_forbidden_license: supportRows.filter((row) => hasForbiddenLicense(row.license)).length,
    rows_with_existing_work_page: supportRows.filter((row) => row.local_anchor_audit?.work_page_exists === true).length,
    rows_with_existing_work_anchor: supportRows.filter((row) => row.local_anchor_audit?.work_anchor_exists === true).length,
    rows_with_matching_source_ref: supportRows.filter((row) => row.local_anchor_audit?.source_ref_matches_page_unit === true).length,
    rows_with_token_surface_in_page: supportRows.filter((row) => row.local_anchor_audit?.token_surface_found_in_page === true).length,
    rows_with_focus_surface_in_page: supportRows.filter((row) => row.local_anchor_audit?.focus_surface_found_in_page === true).length,
    rows_with_observed_usage_label: supportRows.filter((row) => row.row_label === 'observed usage only').length,
    audit_only_ambiguous_rows_available: Number(planningPacket.counts?.audit_only_ambiguous_rows || occurrenceLinks.audit_only_summary?.ambiguous_rows_available_in_concordance || 0),
    audit_only_ambiguous_rows_emitted: 0,
    current_sample_rows: Number(planningPacket.counts?.current_sample_rows || 0),
    current_sample_rows_with_usage_links: Number(planningPacket.counts?.current_sample_rows_with_usage_links || 0),
    usage_tokens_absent_from_current_sample: Number(planningPacket.counts?.current_sample_usage_tokens_not_in_sample || 0),
    route_concentration_warning_visible: Number(planningPacket.counts?.route_concentration_warning_visible || 0),
    consumer_manifest_reviewed_lexical_authority_true: consumerManifest.authority_policy?.reviewed_lexical_authority === true ? 1 : 0,
    consumer_manifest_publication_readiness_true: consumerManifest.authority_policy?.publication_readiness === true ? 1 : 0,
    reader_facing_rows: supportRows.filter((row) => row.usage_boundary?.reader_facing !== false).length,
    route_payload_field_hits: countForbiddenKeyHits({ supportRows }, ['route_payload', 'route_payloads', 'route_metadata']),
    forbidden_authority_field_hits: 0,
    queue_mutations: 0,
    submitted_to_agent6: 0,
  };
}

function buildChecks(counts) {
  return [
    check('planning_context_present', counts.planning_rows > 0 && counts.planning_rows_with_observed_usage_label === counts.planning_rows ? 'passed' : 'failed', `planning rows ${counts.planning_rows}; labeled ${counts.planning_rows_with_observed_usage_label}`),
    check('current_sample_gap_visible', counts.current_sample_rows > 0 && counts.current_sample_rows_with_usage_links === 0 && counts.usage_tokens_absent_from_current_sample > 0 ? 'warning' : 'failed', `current sample links ${counts.current_sample_rows_with_usage_links}/${counts.current_sample_rows}; absent tokens ${counts.usage_tokens_absent_from_current_sample}`),
    check('occurrence_support_rows_present', counts.support_rows > 0 && counts.supported_rows + counts.candidate_rows + counts.weak_rows === counts.support_rows ? 'passed' : 'failed', `rows ${counts.support_rows}; supported/candidate/weak ${counts.supported_rows}/${counts.candidate_rows}/${counts.weak_rows}`),
    check('clickable_links_complete', allEqual(counts.support_rows, [
      counts.rows_with_source_ref,
      counts.rows_with_source_url,
      counts.rows_with_local_work_anchor,
    ]) ? 'passed' : 'failed', `source/sourceURL/localAnchor ${counts.rows_with_source_ref}/${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}`),
    check('token_context_complete', allEqual(counts.support_rows, [
      counts.rows_with_token_surface,
      counts.rows_with_focus_surface,
      counts.rows_with_context_snippet,
      counts.rows_with_focus_marker,
      counts.rows_with_usage_frame,
      counts.rows_with_status_score,
    ]) ? 'passed' : 'failed', `token/focus/context/focusMarker/frame/statusScore ${counts.rows_with_token_surface}/${counts.rows_with_focus_surface}/${counts.rows_with_context_snippet}/${counts.rows_with_focus_marker}/${counts.rows_with_usage_frame}/${counts.rows_with_status_score}`),
    check('provenance_license_complete', allEqual(counts.support_rows, [
      counts.rows_with_work_title,
      counts.rows_with_version_metadata,
      counts.rows_with_license_metadata,
    ]) && counts.rows_with_forbidden_license === 0 ? 'passed' : 'failed', `work/version/license/forbidden ${counts.rows_with_work_title}/${counts.rows_with_version_metadata}/${counts.rows_with_license_metadata}/${counts.rows_with_forbidden_license}`),
    check('local_anchor_audit_complete', allEqual(counts.support_rows, [
      counts.rows_with_existing_work_page,
      counts.rows_with_existing_work_anchor,
      counts.rows_with_matching_source_ref,
      counts.rows_with_token_surface_in_page,
      counts.rows_with_focus_surface_in_page,
    ]) ? 'passed' : 'failed', `page/anchor/sourceRef/token/focus ${counts.rows_with_existing_work_page}/${counts.rows_with_existing_work_anchor}/${counts.rows_with_matching_source_ref}/${counts.rows_with_token_surface_in_page}/${counts.rows_with_focus_surface_in_page}`),
    check('route_ids_only_linkage', counts.route_ids > 0 && counts.rows_with_route_ids === counts.support_rows && counts.rows_with_resolved_route_id_linkage === counts.support_rows && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; rows ${counts.rows_with_route_ids}; resolved rows ${counts.rows_with_resolved_route_id_linkage}; payload hits ${counts.route_payload_field_hits}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows_available > 0 && counts.audit_only_ambiguous_rows_emitted === 0 ? 'passed' : 'failed', `available ${counts.audit_only_ambiguous_rows_available}; emitted ${counts.audit_only_ambiguous_rows_emitted}`),
    check('consumer_manifest_boundary_preserved', counts.consumer_manifest_reviewed_lexical_authority_true === 0 && counts.consumer_manifest_publication_readiness_true === 0 ? 'passed' : 'failed', `reviewed lexical authority true ${counts.consumer_manifest_reviewed_lexical_authority_true}; publication readiness true ${counts.consumer_manifest_publication_readiness_true}`),
    check('usage_only_boundary', counts.rows_with_observed_usage_label === counts.support_rows && counts.reader_facing_rows === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed ${counts.rows_with_observed_usage_label}; reader-facing ${counts.reader_facing_rows}; forbidden ${counts.forbidden_authority_field_hits}`),
    check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `queue mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, packet) {
  const lines = [
    '# Definition Workbench Usage Occurrence Support Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Lane: Agent 3 usage navigation.',
    '- Target: Definition Workbench planning support only.',
    '- Row label: observed usage only.',
    '- Related Agent 2 linkage: route IDs only.',
    '- Ambiguous rows: audit-only, not emitted here.',
    '- Reader-facing rows: 0.',
    '- Publication claims: 0.',
    '',
    '## Counts',
    '',
    `- Planning rows: ${packet.counts.planning_rows}`,
    `- Support rows: ${packet.counts.support_rows}`,
    `- Supported / candidate / weak: ${packet.counts.supported_rows}/${packet.counts.candidate_rows}/${packet.counts.weak_rows}`,
    `- Source refs / works / licenses / version sources: ${packet.counts.source_refs}/${packet.counts.works}/${packet.counts.licenses}/${packet.counts.version_sources}`,
    `- Route IDs: ${packet.counts.route_ids}`,
    `- Local anchors verified: ${packet.counts.rows_with_existing_work_anchor}/${packet.counts.support_rows}`,
    `- Token/focus surfaces found in page: ${packet.counts.rows_with_token_surface_in_page}/${packet.counts.rows_with_focus_surface_in_page}`,
    `- Current sample usage links: ${packet.counts.current_sample_rows_with_usage_links}/${packet.counts.current_sample_rows}`,
    `- Usage tokens absent from current sample: ${packet.counts.usage_tokens_absent_from_current_sample}`,
    `- Audit-only ambiguous rows available/emitted: ${packet.counts.audit_only_ambiguous_rows_available}/${packet.counts.audit_only_ambiguous_rows_emitted}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${packet.counts.reader_facing_rows}/${packet.counts.route_payload_field_hits}/${packet.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...packet.checks.map((row) => `| ${mdCell(row.id)} | ${row.status} | ${mdCell(row.detail)} |`),
    '',
    '## Source Artifacts',
    '',
    ...Object.entries(packet.source_artifacts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    'This packet makes occurrence links easier for Agent 5/Agent 6 to inspect. It does not change Definition Workbench ranking, does not assign UI authority, and does not convert usage evidence into definitions.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareSupportRows(left, right) {
  return String(left.token_key || '').localeCompare(String(right.token_key || ''))
    || String(left.status || '').localeCompare(String(right.status || ''))
    || Number(right.raw_score || 0) - Number(left.raw_score || 0)
    || String(left.source_ref || '').localeCompare(String(right.source_ref || ''), undefined, { numeric: true });
}

function check(id, status, detail) {
  return { id, status, detail };
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function groupBy(values, keyFn) {
  const grouped = new Map();
  for (const value of values) {
    const key = keyFn(value);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  return grouped;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
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

function hasForbiddenLicense(value) {
  return forbiddenLicenseRe.test(String(value || ''));
}

function assertArtifact(value, artifactType, relativePath) {
  if (value.artifact_type !== artifactType) {
    throw new Error(`${relativePath} must be ${artifactType}`);
  }
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8')));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const outputPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, value, 'utf8');
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--planning-packet=')) parsed.planningPacket = valueAfterEquals(arg);
    else if (arg.startsWith('--occurrence-links=')) parsed.occurrenceLinks = valueAfterEquals(arg);
    else if (arg.startsWith('--anchor-audit=')) parsed.anchorAudit = valueAfterEquals(arg);
    else if (arg.startsWith('--route-resolution=')) parsed.routeResolution = valueAfterEquals(arg);
    else if (arg.startsWith('--consumer-manifest=')) parsed.consumerManifest = valueAfterEquals(arg);
    else if (arg.startsWith('--output=')) parsed.output = valueAfterEquals(arg);
    else if (arg.startsWith('--report=')) parsed.report = valueAfterEquals(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
}
