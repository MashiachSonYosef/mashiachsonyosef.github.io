#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  facetIndex: 'data/definitions/definition-workbench-usage-facet-index.json',
  contextTokenIndex: 'data/definitions/definition-workbench-usage-context-token-index.json',
  contextTokenLinks: 'data/definitions/definition-workbench-usage-context-token-links.json',
  contextTokenOccurrenceIndex: 'data/definitions/definition-workbench-usage-context-token-occurrence-index.json',
  occurrenceContextProfile: 'data/definitions/definition-workbench-usage-occurrence-context-profile.json',
  routeDiversityProbe: 'data/definitions/definition-workbench-usage-route-diversity-probe.json',
  planningPacket: 'data/definitions/definition-workbench-usage-planning-packet.json',
  output: 'data/definitions/definition-workbench-usage-route-concentration-guardrail.json',
  report: 'reports/definition-workbench-usage-route-concentration-guardrail.md',
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
const packets = {
  facetIndex: readJson(options.facetIndex),
  contextTokenIndex: readJson(options.contextTokenIndex),
  contextTokenLinks: readJson(options.contextTokenLinks),
  contextTokenOccurrenceIndex: readJson(options.contextTokenOccurrenceIndex),
  occurrenceContextProfile: readJson(options.occurrenceContextProfile),
  routeDiversityProbe: readJson(options.routeDiversityProbe),
  planningPacket: readJson(options.planningPacket),
};

assertArtifact(packets.facetIndex, 'definition_workbench_usage_facet_index', options.facetIndex);
assertArtifact(packets.contextTokenIndex, 'definition_workbench_usage_context_token_index', options.contextTokenIndex);
assertArtifact(packets.contextTokenLinks, 'definition_workbench_usage_context_token_links', options.contextTokenLinks);
assertArtifact(packets.contextTokenOccurrenceIndex, 'definition_workbench_usage_context_token_occurrence_index', options.contextTokenOccurrenceIndex);
assertArtifact(packets.occurrenceContextProfile, 'definition_workbench_usage_occurrence_context_profile', options.occurrenceContextProfile);
assertArtifact(packets.routeDiversityProbe, 'definition_workbench_usage_route_diversity_probe', options.routeDiversityProbe);
assertArtifact(packets.planningPacket, 'definition_workbench_usage_planning_packet', options.planningPacket);

const guardrailRows = buildGuardrailRows();
const counts = buildCounts(guardrailRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_route_concentration_guardrail',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_route_concentration_guardrail.mjs',
  policy: 'Selected-scope Agent 3 route-concentration guardrail for Definition Workbench usage-navigation artifacts. It gathers route concentration signals so downstream consumers cannot mistake repeated usage rows for independent route diversity, route ranking, answer selection, public UI acceptance, publication support, or accepted text.',
  inputs: {
    facet_index: options.facetIndex,
    context_token_index: options.contextTokenIndex,
    context_token_links: options.contextTokenLinks,
    context_token_occurrence_index: options.contextTokenOccurrenceIndex,
    occurrence_context_profile: options.occurrenceContextProfile,
    route_diversity_probe: options.routeDiversityProbe,
    planning_packet: options.planningPacket,
  },
  authority_boundary: {
    usage_navigation_only: true,
    selected_scope_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    route_concentration_guardrail_only: true,
    source_license_required: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_agent2_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    semantic_independence_claim: false,
    lexical_authority: false,
    publication_claim: false,
    accepted_text_output: false,
  },
  guardrail_interpretation: {
    status: counts.guardrail_surfaces_with_concentration_warning === counts.guardrail_surfaces
      ? 'single_route_concentration_guardrail_required'
      : 'route_concentration_review_required',
    selected_scope_only: true,
    route_concentration_visible: counts.guardrail_surfaces_with_concentration_warning > 0,
    all_guardrail_surfaces_single_route: counts.guardrail_surfaces_with_single_route === counts.guardrail_surfaces,
    all_guardrail_surfaces_max_share_10000: counts.guardrail_surfaces_with_max_share_10000 === counts.guardrail_surfaces,
    semantic_independence_claim_allowed: false,
    usage_rows_may_be_used_as_authority: false,
    downstream_rule: 'Display or ranking consumers must preserve observed usage only labels and must resolve Agent 2 route payloads outside Agent 3 artifacts.',
  },
  guardrail_rows: guardrailRows,
  counts,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
};

artifact.counts.forbidden_authority_field_hits = countForbiddenKeyHits(artifact);
artifact.checks = buildChecks(artifact.counts);
artifact.quality.failed_count = artifact.checks.filter((check) => check.status === 'failed').length;
artifact.quality.warning_count = artifact.checks.filter((check) => check.status === 'warning').length;
artifact.quality.status = artifact.quality.failed_count ? 'failed' : artifact.quality.warning_count ? 'pass_with_warnings' : 'passed';

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage route-concentration guardrail ${artifact.quality.status}; surfaces ${artifact.counts.guardrail_surfaces}; concentration ${artifact.counts.guardrail_surfaces_with_concentration_warning}; semantic allowed ${artifact.counts.semantic_independence_allowed_rows}`);

function buildGuardrailRows() {
  return [
    surfaceRow({
      surfaceId: 'facet_index',
      artifactPath: options.facetIndex,
      packet: packets.facetIndex,
      occurrenceRows: packets.facetIndex.counts?.occurrence_rows,
      evidenceRows: packets.facetIndex.counts?.facets_total,
      evidenceLabel: 'facet rows',
      concentrationWarning: packets.facetIndex.counts?.route_concentration_warning,
      maxShare: packets.facetIndex.counts?.max_route_share_basis_points,
      routeIds: packets.facetIndex.counts?.route_ids,
      unresolvedRouteIds: packets.facetIndex.counts?.unresolved_route_ids,
      readerFacingRows: packets.facetIndex.counts?.reader_facing_rows,
      routePayloadHits: packets.facetIndex.counts?.route_payload_field_hits,
      forbiddenHits: packets.facetIndex.counts?.forbidden_authority_field_hits,
      detail: 'Facet filters inherit the selected-row single-route concentration warning.',
    }),
    surfaceRow({
      surfaceId: 'context_token_index',
      artifactPath: options.contextTokenIndex,
      packet: packets.contextTokenIndex,
      occurrenceRows: packets.contextTokenIndex.counts?.occurrence_rows,
      evidenceRows: packets.contextTokenIndex.counts?.context_token_rows,
      evidenceLabel: 'context-token rows',
      concentrationWarning: packets.contextTokenIndex.counts?.route_concentration_warning,
      maxShare: packets.contextTokenIndex.counts?.max_route_share_basis_points,
      routeIds: packets.contextTokenIndex.counts?.route_ids,
      unresolvedRouteIds: packets.contextTokenIndex.counts?.unresolved_route_ids,
      readerFacingRows: packets.contextTokenIndex.counts?.reader_facing_rows,
      routePayloadHits: packets.contextTokenIndex.counts?.route_payload_field_hits,
      forbiddenHits: packets.contextTokenIndex.counts?.forbidden_authority_field_hits,
      detail: 'Context-token co-occurrence is navigational and does not create route diversity.',
    }),
    surfaceRow({
      surfaceId: 'context_token_links',
      artifactPath: options.contextTokenLinks,
      packet: packets.contextTokenLinks,
      occurrenceRows: packets.contextTokenLinks.counts?.occurrence_rows,
      evidenceRows: packets.contextTokenLinks.counts?.context_token_link_rows,
      evidenceLabel: 'context-token link rows',
      concentrationWarning: packets.contextTokenLinks.counts?.route_concentration_warning,
      maxShare: packets.contextTokenLinks.counts?.max_route_share_basis_points,
      routeIds: packets.contextTokenLinks.counts?.route_ids,
      unresolvedRouteIds: packets.contextTokenLinks.counts?.unresolved_route_ids,
      readerFacingRows: packets.contextTokenLinks.counts?.reader_facing_rows,
      routePayloadHits: packets.contextTokenLinks.counts?.route_payload_field_hits,
      forbiddenHits: packets.contextTokenLinks.counts?.forbidden_authority_field_hits,
      detail: 'Per-appearance context links preserve route IDs only and cannot rank routes.',
    }),
    surfaceRow({
      surfaceId: 'context_token_occurrence_index',
      artifactPath: options.contextTokenOccurrenceIndex,
      packet: packets.contextTokenOccurrenceIndex,
      occurrenceRows: packets.contextTokenOccurrenceIndex.counts?.occurrence_rows,
      evidenceRows: packets.contextTokenOccurrenceIndex.counts?.context_token_occurrence_rows,
      evidenceLabel: 'reverse context-token rows',
      concentrationWarning: packets.contextTokenOccurrenceIndex.counts?.route_concentration_warning,
      maxShare: packets.contextTokenOccurrenceIndex.counts?.max_route_share_basis_points,
      routeIds: packets.contextTokenOccurrenceIndex.counts?.route_ids,
      unresolvedRouteIds: packets.contextTokenOccurrenceIndex.counts?.unresolved_route_ids,
      readerFacingRows: packets.contextTokenOccurrenceIndex.counts?.reader_facing_rows,
      routePayloadHits: packets.contextTokenOccurrenceIndex.counts?.route_payload_field_hits,
      forbiddenHits: packets.contextTokenOccurrenceIndex.counts?.forbidden_authority_field_hits,
      detail: 'Reverse context-token lookup is a navigation aid, not independent support.',
    }),
    surfaceRow({
      surfaceId: 'occurrence_context_profile',
      artifactPath: options.occurrenceContextProfile,
      packet: packets.occurrenceContextProfile,
      occurrenceRows: packets.occurrenceContextProfile.counts?.profile_rows,
      evidenceRows: packets.occurrenceContextProfile.counts?.context_token_link_rows,
      evidenceLabel: 'profile context-link rows',
      concentrationWarning: packets.occurrenceContextProfile.counts?.route_concentration_warning,
      maxShare: packets.occurrenceContextProfile.counts?.max_route_share_basis_points,
      routeIds: packets.occurrenceContextProfile.counts?.route_ids,
      unresolvedRouteIds: packets.occurrenceContextProfile.counts?.unresolved_route_ids,
      readerFacingRows: packets.occurrenceContextProfile.counts?.reader_facing_rows,
      routePayloadHits: packets.occurrenceContextProfile.counts?.route_payload_field_hits,
      forbiddenHits: packets.occurrenceContextProfile.counts?.forbidden_authority_field_hits,
      detail: 'Occurrence profiles make context inspectable while retaining the one-route warning.',
    }),
    surfaceRow({
      surfaceId: 'route_diversity_probe',
      artifactPath: options.routeDiversityProbe,
      packet: packets.routeDiversityProbe,
      occurrenceRows: packets.routeDiversityProbe.counts?.occurrence_rows,
      evidenceRows: packets.routeDiversityProbe.counts?.route_probe_rows,
      evidenceLabel: 'route probe rows',
      concentrationWarning: packets.routeDiversityProbe.counts?.route_concentration_warning,
      maxShare: packets.routeDiversityProbe.counts?.max_route_share_basis_points,
      routeIds: packets.routeDiversityProbe.counts?.route_ids,
      unresolvedRouteIds: packets.routeDiversityProbe.counts?.unresolved_route_ids,
      semanticAllowed: packets.routeDiversityProbe.counts?.semantic_independence_claim_allowed,
      readerFacingRows: packets.routeDiversityProbe.counts?.reader_facing_rows,
      routePayloadHits: packets.routeDiversityProbe.counts?.route_payload_field_hits,
      forbiddenHits: packets.routeDiversityProbe.counts?.forbidden_authority_field_hits,
      detail: 'The route-diversity probe is the direct single-route concentration control.',
    }),
    surfaceRow({
      surfaceId: 'planning_packet',
      artifactPath: options.planningPacket,
      packet: packets.planningPacket,
      occurrenceRows: packets.planningPacket.counts?.occurrence_link_rows,
      evidenceRows: packets.planningPacket.counts?.planning_rows,
      evidenceLabel: 'planning rows',
      concentrationWarning: packets.planningPacket.counts?.route_concentration_warning_visible,
      maxShare: 10000,
      routeIds: packets.planningPacket.counts?.route_ids,
      unresolvedRouteIds: packets.planningPacket.counts?.planning_summary_unresolved_route_ids,
      semanticAllowed: packets.planningPacket.counts?.planning_summary_semantic_independence_claim_allowed,
      readerFacingRows: packets.planningPacket.counts?.reader_facing_rows,
      routePayloadHits: packets.planningPacket.counts?.route_payload_field_hits,
      forbiddenHits: packets.planningPacket.counts?.forbidden_authority_field_hits,
      detail: 'The planning packet may hand off the warning but cannot convert it into answer authority.',
    }),
  ];
}

function surfaceRow({
  surfaceId,
  artifactPath,
  packet,
  occurrenceRows,
  evidenceRows,
  evidenceLabel,
  concentrationWarning,
  maxShare,
  routeIds,
  unresolvedRouteIds,
  semanticAllowed = 0,
  readerFacingRows,
  routePayloadHits,
  forbiddenHits,
  detail,
}) {
  const normalizedRouteIds = Number(routeIds || 0);
  const normalizedMaxShare = Number(maxShare || 0);
  const concentration = Number(concentrationWarning || 0) === 1 || (normalizedRouteIds === 1 && normalizedMaxShare === 10000);
  return {
    surface_id: surfaceId,
    artifact_path: artifactPath,
    artifact_type: packet.artifact_type,
    quality_status: packet.quality?.status || null,
    occurrence_rows: Number(occurrenceRows || 0),
    evidence_rows: Number(evidenceRows || 0),
    evidence_label: evidenceLabel,
    route_ids: normalizedRouteIds,
    unresolved_route_ids: Number(unresolvedRouteIds || 0),
    max_route_share_basis_points: normalizedMaxShare,
    route_concentration_warning: concentration,
    semantic_independence_claim_allowed: Number(semanticAllowed || 0) === 1,
    answer_authority_allowed: false,
    route_ranking_allowed: false,
    visible_answer_selection_allowed: false,
    reader_facing_rows: Number(readerFacingRows || 0),
    route_payload_field_hits: Number(routePayloadHits || 0),
    forbidden_authority_field_hits: Number(forbiddenHits || 0),
    row_label_required: 'observed usage only',
    consumer_action: concentration ? 'preserve_route_concentration_warning' : 'review_route_diversity_before_consumption',
    detail,
  };
}

function buildCounts(rows) {
  return {
    guardrail_surfaces: rows.length,
    guardrail_surfaces_with_single_route: rows.filter((row) => row.route_ids === 1).length,
    guardrail_surfaces_with_max_share_10000: rows.filter((row) => row.max_route_share_basis_points === 10000).length,
    guardrail_surfaces_with_concentration_warning: rows.filter((row) => row.route_concentration_warning === true).length,
    semantic_independence_allowed_rows: rows.filter((row) => row.semantic_independence_claim_allowed === true).length,
    answer_authority_allowed_rows: rows.filter((row) => row.answer_authority_allowed === true).length,
    route_ranking_allowed_rows: rows.filter((row) => row.route_ranking_allowed === true).length,
    visible_answer_selection_allowed_rows: rows.filter((row) => row.visible_answer_selection_allowed === true).length,
    route_payload_field_hits: sum(rows.map((row) => row.route_payload_field_hits)),
    forbidden_authority_field_hits: sum(rows.map((row) => row.forbidden_authority_field_hits)),
    reader_facing_rows: sum(rows.map((row) => row.reader_facing_rows)),
    unresolved_route_ids: sum(rows.map((row) => row.unresolved_route_ids)),
    occurrence_rows_min: Math.min(...rows.map((row) => row.occurrence_rows)),
    occurrence_rows_max: Math.max(...rows.map((row) => row.occurrence_rows)),
    source_artifacts: rows.length,
    source_artifacts_passed_or_warning: rows.filter((row) => ['passed', 'pass_with_warnings'].includes(row.quality_status)).length,
  };
}

function buildChecks(counts) {
  return [
    check('guardrail_surfaces_present', counts.guardrail_surfaces === 7 ? 'passed' : 'failed', `surfaces ${counts.guardrail_surfaces}`),
    check('all_surfaces_single_route', counts.guardrail_surfaces_with_single_route === counts.guardrail_surfaces ? 'warning' : 'failed', `single route ${counts.guardrail_surfaces_with_single_route}/${counts.guardrail_surfaces}`),
    check('all_surfaces_max_share_visible', counts.guardrail_surfaces_with_max_share_10000 === counts.guardrail_surfaces ? 'warning' : 'failed', `max share ${counts.guardrail_surfaces_with_max_share_10000}/${counts.guardrail_surfaces}`),
    check('all_surfaces_warn_on_concentration', counts.guardrail_surfaces_with_concentration_warning === counts.guardrail_surfaces ? 'warning' : 'failed', `warning ${counts.guardrail_surfaces_with_concentration_warning}/${counts.guardrail_surfaces}`),
    check('semantic_independence_blocked', counts.semantic_independence_allowed_rows === 0 && counts.answer_authority_allowed_rows === 0 && counts.route_ranking_allowed_rows === 0 && counts.visible_answer_selection_allowed_rows === 0 ? 'passed' : 'failed', `semantic/answer/rank/visible ${counts.semantic_independence_allowed_rows}/${counts.answer_authority_allowed_rows}/${counts.route_ranking_allowed_rows}/${counts.visible_answer_selection_allowed_rows}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `reader/payload/forbidden/unresolved ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}/${counts.unresolved_route_ids}`),
    check('source_artifacts_ok', counts.source_artifacts_passed_or_warning === counts.source_artifacts ? 'passed' : 'failed', `${counts.source_artifacts_passed_or_warning}/${counts.source_artifacts}`),
  ];
}

function writeReport(relativePath, packet) {
  const lines = [
    '# Definition Workbench Usage Route Concentration Guardrail',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${packet.quality.status}`,
    `- Guardrail surfaces: ${packet.counts.guardrail_surfaces}`,
    `- Single-route surfaces: ${packet.counts.guardrail_surfaces_with_single_route}/${packet.counts.guardrail_surfaces}`,
    `- Max-share 10000 surfaces: ${packet.counts.guardrail_surfaces_with_max_share_10000}/${packet.counts.guardrail_surfaces}`,
    `- Concentration-warning surfaces: ${packet.counts.guardrail_surfaces_with_concentration_warning}/${packet.counts.guardrail_surfaces}`,
    `- Semantic/answer/ranking/visible-answer allowed rows: ${packet.counts.semantic_independence_allowed_rows}/${packet.counts.answer_authority_allowed_rows}/${packet.counts.route_ranking_allowed_rows}/${packet.counts.visible_answer_selection_allowed_rows}`,
    `- Reader-facing / route-payload / forbidden-authority / unresolved hits: ${packet.counts.reader_facing_rows}/${packet.counts.route_payload_field_hits}/${packet.counts.forbidden_authority_field_hits}/${packet.counts.unresolved_route_ids}`,
    '',
    '## Interpretation',
    '',
    `- Status: ${packet.guardrail_interpretation.status}`,
    `- Downstream rule: ${packet.guardrail_interpretation.downstream_rule}`,
    '',
    '## Guardrail Rows',
    '',
    '| surface | status | occurrences | evidence rows | route ids | max share | concentration | semantic allowed | consumer action |',
    '|---|---|---:|---:|---:|---:|---|---|---|',
    ...packet.guardrail_rows.map((row) => `| ${mdCell(row.surface_id)} | ${row.quality_status} | ${row.occurrence_rows} | ${row.evidence_rows} | ${row.route_ids} | ${row.max_route_share_basis_points}/10000 | ${row.route_concentration_warning} | ${row.semantic_independence_claim_allowed} | ${mdCell(row.consumer_action)} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...packet.checks.map((row) => `| ${mdCell(row.id)} | ${row.status} | ${mdCell(row.detail)} |`),
    '',
    '## Boundary',
    '',
    'This guardrail is usage-navigation QA data only. It carries route IDs and concentration warnings, but it does not rank routes, choose answers, copy Agent 2 payloads, authorize UI display, support publication, or provide accepted text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function countForbiddenKeyHits(value) {
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
      if (forbiddenAuthorityKeys.has(key)) hits += 1;
      walk(child);
    }
  }
}

function assertArtifact(packet, artifactType, relativePath) {
  if (packet.artifact_type !== artifactType) {
    throw new Error(`${relativePath} is not ${artifactType}`);
  }
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--facet-index=')) parsed.facetIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-token-index=')) parsed.contextTokenIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-token-links=')) parsed.contextTokenLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-token-occurrence-index=')) parsed.contextTokenOccurrenceIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--occurrence-context-profile=')) parsed.occurrenceContextProfile = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-diversity-probe=')) parsed.routeDiversityProbe = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--planning-packet=')) parsed.planningPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
