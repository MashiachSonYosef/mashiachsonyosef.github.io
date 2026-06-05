#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  occurrenceSupportPacket: 'data/definitions/definition-workbench-usage-occurrence-support-packet.json',
  concordanceNavigationPacket: 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json',
  planningPacket: 'data/definitions/definition-workbench-usage-planning-packet.json',
  output: 'data/definitions/definition-workbench-usage-route-pointer-audit.json',
  report: 'reports/definition-workbench-usage-route-pointer-audit.md',
};

const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
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
]);

const options = parseArgs(process.argv.slice(2));
const routeResolution = readJson(options.routeResolution);
const occurrenceSupportPacket = readJson(options.occurrenceSupportPacket);
const concordanceNavigationPacket = readJson(options.concordanceNavigationPacket);
const planningPacket = readJson(options.planningPacket);

assertArtifact(routeResolution, 'definition_workbench_usage_route_resolution', options.routeResolution);
assertArtifact(occurrenceSupportPacket, 'definition_workbench_usage_occurrence_support_packet', options.occurrenceSupportPacket);
assertArtifact(concordanceNavigationPacket, 'definition_workbench_usage_concordance_navigation_packet', options.concordanceNavigationPacket);
assertArtifact(planningPacket, 'definition_workbench_usage_planning_packet', options.planningPacket);

const routePointerRows = buildRoutePointerRows();
const counts = buildCounts(routePointerRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_route_pointer_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_route_pointer_audit.mjs',
  policy: 'Agent 3 route-pointer audit for Definition Workbench usage navigation. It proves usage/support/navigation rows carry Agent 2 route IDs and resolver artifact paths only; it does not copy Agent 2 route payloads, route metadata, definitions, translations, ranking, visible answers, or publication claims.',
  inputs: {
    route_resolution: options.routeResolution,
    occurrence_support_packet: options.occurrenceSupportPacket,
    concordance_navigation_packet: options.concordanceNavigationPacket,
    planning_packet: options.planningPacket,
  },
  authority_boundary: {
    usage_navigation_only: true,
    observed_usage_only: true,
    route_pointer_only: true,
    route_ids_only: true,
    resolver_paths_only: true,
    agent2_payload_resolution_external: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_agent2_payloads: false,
    copies_route_metadata: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    lexical_authority: false,
    publication_claim: false,
    accepted_text_output: false,
  },
  consumer_rule: {
    row_label: 'route pointer only',
    downstream_action: 'Resolve Agent 2 route payloads outside Agent 3 artifacts.',
    observed_usage_row_label_required: 'observed usage only',
    route_concentration_status: counts.route_pointer_rows === 1 ? 'single_route_pointer_scope' : 'multi_route_pointer_scope',
  },
  route_pointer_rows: routePointerRows,
  counts,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
};

artifact.counts.forbidden_authority_field_hits = countForbiddenKeyHits(artifact);
artifact.counts.route_metadata_field_hits = countExactKeyHits(artifact, 'route_metadata');
artifact.checks = buildChecks(artifact.counts);
artifact.quality.failed_count = artifact.checks.filter((check) => check.status === 'failed').length;
artifact.quality.warning_count = artifact.checks.filter((check) => check.status === 'warning').length;
artifact.quality.status = artifact.quality.failed_count ? 'failed' : artifact.quality.warning_count ? 'pass_with_warnings' : 'passed';

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage route-pointer audit ${artifact.quality.status}; routes ${artifact.counts.route_pointer_rows}; support ${artifact.counts.support_rows_with_pointer}/${artifact.counts.support_rows}; navigation ${artifact.counts.navigation_rows_with_pointer}/${artifact.counts.navigation_rows}`);

function buildRoutePointerRows() {
  const routeRows = asArray(routeResolution.occurrence_route_rows);
  const supportRows = asArray(occurrenceSupportPacket.support_rows);
  const navigationRows = asArray(concordanceNavigationPacket.navigation_rows);
  const planningRows = asArray(planningPacket.planning_rows);
  const routeById = new Map(asArray(routeResolution.routes).map((route) => [route.route_id, route]));
  const routeIds = unique([
    ...asArray(routeResolution.routes).map((route) => route.route_id),
    ...routeRows.map((row) => row.route_id),
    ...supportRows.flatMap((row) => asArray(row.related_agent2_route_ids)),
    ...navigationRows.flatMap((row) => asArray(row.related_agent2_route_ids)),
    ...planningRows.flatMap((row) => rowRouteIds(row)),
  ]);

  return routeIds.map((routeId) => {
    const route = routeById.get(routeId) || {};
    const selectedRouteRows = routeRows.filter((row) => row.route_id === routeId);
    const selectedSupportRows = supportRows.filter((row) => asArray(row.related_agent2_route_ids).includes(routeId));
    const selectedNavigationRows = navigationRows.filter((row) => asArray(row.related_agent2_route_ids).includes(routeId));
    const selectedPlanningRows = planningRows.filter((row) => rowRouteIds(row).includes(routeId));
    return {
      route_pointer_id: `usage-route-pointer-${hash(routeId)}`,
      route_id: routeId,
      route_source_path: route.route_source || firstNonEmpty(selectedRouteRows.map((row) => row.route_source)),
      route_resolution_artifact: options.routeResolution,
      resolution_status: route.resolution_status || firstNonEmpty(selectedRouteRows.map((row) => row.resolution_status)) || 'unresolved',
      occurrence_route_rows: selectedRouteRows.length,
      support_rows: selectedSupportRows.length,
      navigation_rows: selectedNavigationRows.length,
      selected_navigation_rows: selectedNavigationRows.filter((row) => row.selected_support_row === true || row.selected_support_occurrence === true).length,
      planning_rows: selectedPlanningRows.length,
      selected_source_refs: unique(selectedSupportRows.map((row) => row.source_ref)).length,
      selected_works: unique(selectedSupportRows.map((row) => row.work_slug || row.work_title)).length,
      selected_usage_frames: unique(selectedSupportRows.map((row) => row.usage_frame_label)).length,
      concordance_source_refs: unique(selectedNavigationRows.map((row) => row.source_ref)).length,
      concordance_works: unique(selectedNavigationRows.map((row) => row.work_slug || row.work_title)).length,
      concordance_categories: unique(selectedNavigationRows.map((row) => row.category)).length,
      selected_status_counts: statusCounts(selectedSupportRows),
      concordance_status_counts: statusCounts(selectedNavigationRows),
      row_label: 'route pointer only',
      route_payload_copied: false,
      agent2_payload_copied: false,
      route_metadata_copied: false,
      consumer_action: 'resolve_agent2_route_payloads_outside_agent3',
    };
  });
}

function buildCounts(rows) {
  const supportRows = asArray(occurrenceSupportPacket.support_rows);
  const navigationRows = asArray(concordanceNavigationPacket.navigation_rows);
  const planningRows = asArray(planningPacket.planning_rows);
  const routeRows = asArray(routeResolution.occurrence_route_rows);
  return {
    route_pointer_rows: rows.length,
    route_ids: unique(rows.map((row) => row.route_id)).length,
    resolved_route_ids: rows.filter((row) => row.resolution_status === 'resolved').length,
    unresolved_route_ids: rows.filter((row) => row.resolution_status !== 'resolved').length,
    route_source_paths: unique(rows.map((row) => row.route_source_path)).length,
    existing_route_source_paths: rows.filter((row) => row.route_source_path && fs.existsSync(path.join(root, cleanRelativePath(row.route_source_path)))).length,
    occurrence_route_rows: routeRows.length,
    occurrence_route_rows_with_pointer: routeRows.filter((row) => rows.some((pointer) => pointer.route_id === row.route_id)).length,
    support_rows: supportRows.length,
    support_rows_with_pointer: supportRows.filter((row) => asArray(row.related_agent2_route_ids).some((routeId) => rows.some((pointer) => pointer.route_id === routeId))).length,
    support_rows_with_resolved_route_ids: Number(occurrenceSupportPacket.counts?.rows_with_resolved_route_id_linkage || 0),
    navigation_rows: navigationRows.length,
    navigation_rows_with_pointer: navigationRows.filter((row) => asArray(row.related_agent2_route_ids).some((routeId) => rows.some((pointer) => pointer.route_id === routeId))).length,
    selected_navigation_rows: Number(concordanceNavigationPacket.counts?.selected_support_rows || 0),
    planning_rows: planningRows.length,
    planning_rows_with_pointer: planningRows.filter((row) => rowRouteIds(row).some((routeId) => rows.some((pointer) => pointer.route_id === routeId))).length,
    selected_source_refs: sum(rows.map((row) => row.selected_source_refs)),
    selected_works: sum(rows.map((row) => row.selected_works)),
    selected_usage_frames: sum(rows.map((row) => row.selected_usage_frames)),
    concordance_source_refs: Number(concordanceNavigationPacket.counts?.source_refs || 0),
    concordance_works: Number(concordanceNavigationPacket.counts?.works || 0),
    concordance_categories: Number(concordanceNavigationPacket.counts?.categories || 0),
    supported_rows: Number(occurrenceSupportPacket.counts?.supported_rows || 0),
    candidate_rows: Number(occurrenceSupportPacket.counts?.candidate_rows || 0),
    weak_rows: Number(occurrenceSupportPacket.counts?.weak_rows || 0),
    navigation_supported_rows: Number(concordanceNavigationPacket.counts?.supported_rows || 0),
    navigation_candidate_rows: Number(concordanceNavigationPacket.counts?.candidate_rows || 0),
    navigation_weak_rows: Number(concordanceNavigationPacket.counts?.weak_rows || 0),
    audit_only_ambiguous_rows_available: Number(occurrenceSupportPacket.counts?.audit_only_ambiguous_rows_available || 0),
    audit_only_ambiguous_rows_emitted: Number(occurrenceSupportPacket.counts?.audit_only_ambiguous_rows_emitted || 0),
    route_payload_copied_rows: rows.filter((row) => row.route_payload_copied !== false).length,
    agent2_payload_copied_rows: rows.filter((row) => row.agent2_payload_copied !== false).length,
    route_metadata_copied_rows: rows.filter((row) => row.route_metadata_copied !== false).length,
    semantic_arbitration_rows: 0,
    answer_authority_rows: 0,
    route_ranking_rows: 0,
    visible_answer_selection_rows: 0,
    reader_facing_rows: Number(routeResolution.counts?.reader_facing_rows || 0)
      + Number(occurrenceSupportPacket.counts?.reader_facing_rows || 0)
      + Number(concordanceNavigationPacket.counts?.reader_facing_rows || 0)
      + Number(planningPacket.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(routeResolution.counts?.route_payload_field_hits || 0)
      + Number(occurrenceSupportPacket.counts?.route_payload_field_hits || 0)
      + Number(concordanceNavigationPacket.counts?.route_payload_field_hits || 0)
      + Number(planningPacket.counts?.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(routeResolution.counts?.forbidden_authority_field_hits || 0)
      + Number(occurrenceSupportPacket.counts?.forbidden_authority_field_hits || 0)
      + Number(concordanceNavigationPacket.counts?.forbidden_authority_field_hits || 0)
      + Number(planningPacket.counts?.forbidden_authority_field_hits || 0),
    route_metadata_field_hits: 0,
    queue_mutations: 0,
    submitted_to_agent6: 0,
  };
}

function buildChecks(counts) {
  return [
    check('route_pointers_present', counts.route_pointer_rows > 0 && counts.route_ids === counts.route_pointer_rows ? 'passed' : 'failed', `pointers/routes ${counts.route_pointer_rows}/${counts.route_ids}`),
    check('single_route_scope_visible', counts.route_pointer_rows === 1 ? 'warning' : 'passed', `route pointers ${counts.route_pointer_rows}`),
    check('route_ids_resolved', counts.resolved_route_ids === counts.route_ids && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `resolved/unresolved ${counts.resolved_route_ids}/${counts.unresolved_route_ids}`),
    check('route_sources_exist', counts.existing_route_source_paths === counts.route_source_paths ? 'passed' : 'failed', `source paths ${counts.existing_route_source_paths}/${counts.route_source_paths}`),
    check('occurrence_rows_linked', counts.occurrence_route_rows_with_pointer === counts.occurrence_route_rows && counts.occurrence_route_rows > 0 ? 'passed' : 'failed', `${counts.occurrence_route_rows_with_pointer}/${counts.occurrence_route_rows}`),
    check('support_rows_linked', counts.support_rows_with_pointer === counts.support_rows && counts.support_rows_with_resolved_route_ids === counts.support_rows ? 'passed' : 'failed', `support ${counts.support_rows_with_pointer}/${counts.support_rows}; resolved ${counts.support_rows_with_resolved_route_ids}`),
    check('navigation_rows_linked', counts.navigation_rows_with_pointer === counts.navigation_rows && counts.navigation_rows > counts.support_rows ? 'passed' : 'failed', `${counts.navigation_rows_with_pointer}/${counts.navigation_rows}`),
    check('planning_rows_linked', counts.planning_rows_with_pointer === counts.planning_rows && counts.planning_rows > 0 ? 'passed' : 'failed', `${counts.planning_rows_with_pointer}/${counts.planning_rows}`),
    check('selected_context_visible', counts.selected_source_refs > 0 && counts.selected_works > 0 && counts.selected_usage_frames > 0 && counts.concordance_source_refs > 0 && counts.concordance_works > 0 ? 'passed' : 'failed', `selected refs/works/frames ${counts.selected_source_refs}/${counts.selected_works}/${counts.selected_usage_frames}; concordance refs/works ${counts.concordance_source_refs}/${counts.concordance_works}`),
    check('status_counts_cover_support', counts.supported_rows + counts.candidate_rows + counts.weak_rows === counts.support_rows ? 'passed' : 'failed', `support status ${counts.supported_rows}/${counts.candidate_rows}/${counts.weak_rows}; rows ${counts.support_rows}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows_available > 0 && counts.audit_only_ambiguous_rows_emitted === 0 ? 'passed' : 'failed', `ambiguous ${counts.audit_only_ambiguous_rows_available}/${counts.audit_only_ambiguous_rows_emitted}`),
    check('route_payloads_not_copied', counts.route_payload_copied_rows === 0 && counts.agent2_payload_copied_rows === 0 && counts.route_metadata_copied_rows === 0 && counts.route_metadata_field_hits === 0 ? 'passed' : 'failed', `copied route/agent2/metadata rows ${counts.route_payload_copied_rows}/${counts.agent2_payload_copied_rows}/${counts.route_metadata_copied_rows}; metadata fields ${counts.route_metadata_field_hits}`),
    check('usage_only_boundary', counts.semantic_arbitration_rows === 0 && counts.answer_authority_rows === 0 && counts.route_ranking_rows === 0 && counts.visible_answer_selection_rows === 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `semantic/answer/rank/visible/reader ${counts.semantic_arbitration_rows}/${counts.answer_authority_rows}/${counts.route_ranking_rows}/${counts.visible_answer_selection_rows}/${counts.reader_facing_rows}`),
    check('forbidden_authority_absent', counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `route payload/forbidden ${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
    check('no_queue_mutation', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `${counts.queue_mutations}/${counts.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, packet) {
  const lines = [
    '# Definition Workbench Usage Route Pointer Audit',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    packet.policy,
    '',
    'This packet is route-pointer-only. It intentionally carries route IDs and resolver paths, not Agent 2 route payloads, route metadata, definitions, translations, ranking decisions, visible answer selection, or publication claims.',
    '',
    '## Counts',
    '',
    `- Route pointer rows / route IDs / resolved / unresolved: ${packet.counts.route_pointer_rows}/${packet.counts.route_ids}/${packet.counts.resolved_route_ids}/${packet.counts.unresolved_route_ids}`,
    `- Occurrence route rows linked: ${packet.counts.occurrence_route_rows_with_pointer}/${packet.counts.occurrence_route_rows}`,
    `- Support rows linked / resolved: ${packet.counts.support_rows_with_pointer}/${packet.counts.support_rows_with_resolved_route_ids}/${packet.counts.support_rows}`,
    `- Navigation rows linked / selected: ${packet.counts.navigation_rows_with_pointer}/${packet.counts.selected_navigation_rows}/${packet.counts.navigation_rows}`,
    `- Planning rows linked: ${packet.counts.planning_rows_with_pointer}/${packet.counts.planning_rows}`,
    `- Selected refs / works / frames: ${packet.counts.selected_source_refs}/${packet.counts.selected_works}/${packet.counts.selected_usage_frames}`,
    `- Concordance refs / works / categories: ${packet.counts.concordance_source_refs}/${packet.counts.concordance_works}/${packet.counts.concordance_categories}`,
    `- Support supported / candidate / weak: ${packet.counts.supported_rows}/${packet.counts.candidate_rows}/${packet.counts.weak_rows}`,
    `- Ambiguous audit-only available / emitted: ${packet.counts.audit_only_ambiguous_rows_available}/${packet.counts.audit_only_ambiguous_rows_emitted}`,
    `- Copied route / Agent 2 / metadata rows: ${packet.counts.route_payload_copied_rows}/${packet.counts.agent2_payload_copied_rows}/${packet.counts.route_metadata_copied_rows}`,
    `- Reader-facing / route-payload / forbidden-authority / metadata-field hits: ${packet.counts.reader_facing_rows}/${packet.counts.route_payload_field_hits}/${packet.counts.forbidden_authority_field_hits}/${packet.counts.route_metadata_field_hits}`,
    '',
    '## Route Pointers',
    '',
    '| route_id | source | resolution | occurrence rows | support rows | navigation rows | planning rows | consumer action |',
    '|---|---|---|---:|---:|---:|---:|---|',
    ...packet.route_pointer_rows.map((row) => `| ${mdCell(row.route_id)} | ${mdCell(row.route_source_path)} | ${row.resolution_status} | ${row.occurrence_route_rows} | ${row.support_rows} | ${row.navigation_rows} | ${row.planning_rows} | ${mdCell(row.consumer_action)} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...packet.checks.map((row) => `| ${mdCell(row.id)} | ${row.status} | ${mdCell(row.detail)} |`),
    '',
    'This is an Agent 3 pointer audit only. Downstream consumers must resolve any Agent 2 route payload outside Agent 3 artifacts and preserve observed-usage-only labels.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function countForbiddenKeyHits(value) {
  let hits = 0;
  walk(value, (key) => {
    if (forbiddenAuthorityKeys.has(key)) hits += 1;
  });
  return hits;
}

function countExactKeyHits(value, expectedKey) {
  let hits = 0;
  walk(value, (key) => {
    if (key === expectedKey) hits += 1;
  });
  return hits;
}

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    visit(key);
    walk(child, visit);
  }
}

function statusCounts(rows) {
  const counts = {};
  for (const row of rows) counts[row.status || 'unknown'] = (counts[row.status || 'unknown'] || 0) + 1;
  return counts;
}

function rowRouteIds(row) {
  return unique([...asArray(row.related_agent2_route_ids), ...asArray(row.route_ids)]);
}

function firstNonEmpty(values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || null;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))];
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function assertArtifact(packet, artifactType, relativePath) {
  if (packet.artifact_type !== artifactType) throw new Error(`${relativePath} must be ${artifactType}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, value);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--route-resolution=')) parsed.routeResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--occurrence-support-packet=')) parsed.occurrenceSupportPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--concordance-navigation-packet=')) parsed.concordanceNavigationPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--planning-packet=')) parsed.planningPacket = cleanRelativePath(valueAfterEquals(arg));
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
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
