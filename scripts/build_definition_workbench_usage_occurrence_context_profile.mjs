#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceDetailIndex: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  contextTokenLinks: 'data/definitions/definition-workbench-usage-context-token-links.json',
  contextTokenOccurrenceIndex: 'data/definitions/definition-workbench-usage-context-token-occurrence-index.json',
  output: 'data/definitions/definition-workbench-usage-occurrence-context-profile.json',
  report: 'reports/definition-workbench-usage-occurrence-context-profile.md',
};
const forbiddenAuthorityKeys = [
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
];

const options = parseArgs(process.argv.slice(2));
const occurrenceDetailIndex = readJson(options.occurrenceDetailIndex);
const contextTokenLinks = readJson(options.contextTokenLinks);
const contextTokenOccurrenceIndex = readJson(options.contextTokenOccurrenceIndex);

assertArtifact(occurrenceDetailIndex, 'definition_workbench_usage_occurrence_detail_index', options.occurrenceDetailIndex);
assertArtifact(contextTokenLinks, 'definition_workbench_usage_context_token_links', options.contextTokenLinks);
assertArtifact(contextTokenOccurrenceIndex, 'definition_workbench_usage_context_token_occurrence_index', options.contextTokenOccurrenceIndex);

const detailRows = occurrenceDetailIndex.occurrence_details || [];
const linkRows = contextTokenLinks.context_token_links || [];
const reverseRows = contextTokenOccurrenceIndex.context_token_occurrence_rows || [];
const reverseByNormalized = new Map(reverseRows.map((row) => [row.context_normalized, row]));
const linksByOccurrence = groupBy(linkRows, (row) => row.occurrence_id);
const profiles = detailRows.map((detail) => buildProfile(detail, linksByOccurrence.get(detail.occurrence_id) || []));
const counts = buildCounts(profiles);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_occurrence_context_profile',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_occurrence_context_profile.mjs',
  policy: 'Selected-scope Agent 3 occurrence-to-context-token profile for Definition Workbench usage navigation. It joins selected occurrence detail rows to context-token link rows and reverse-index IDs so consumers can navigate occurrence pages and context-token chips without treating usage evidence as definition authority.',
  inputs: {
    occurrence_detail_index: options.occurrenceDetailIndex,
    context_token_links: options.contextTokenLinks,
    context_token_occurrence_index: options.contextTokenOccurrenceIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    selected_scope_only: true,
    occurrence_context_profile_only: true,
    route_ids_only: true,
    source_license_required: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    reviewed_lexical_authority: false,
    accepted_translation_output: false,
    publication_readiness: false,
    publication_claim: false,
  },
  usage_contract: {
    row_label: 'observed usage only',
    safe_consumer_role: 'occurrence-centric context-token navigation with reverse-index link IDs',
    route_payload_rule: 'related_route_ids only; resolve Agent 2 route payloads outside Agent 3 artifacts',
    ambiguous_policy: 'ambiguous rows remain audit-only and are not emitted here',
    not_authority: [
      'not a definition source',
      'not a visible answer selector',
      'not route ranking',
      'not semantic arbitration',
      'not publication support',
      'not accepted translation text',
    ],
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  occurrence_context_profiles: profiles,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage occurrence context profile ${artifact.quality.status}; profiles ${counts.profile_rows}; links ${counts.context_token_link_rows}; reverse links ${counts.rows_with_reverse_index_ids}`);

function buildProfile(detail, links) {
  const sortedLinks = [...links].sort((left, right) => {
    const distance = Number(left.distance_from_focus || 0) - Number(right.distance_from_focus || 0);
    if (distance !== 0) return distance;
    return String(left.context_token_link_id).localeCompare(String(right.context_token_link_id));
  });
  const reverseIds = unique(sortedLinks.map((link) => reverseByNormalized.get(link.context_normalized)?.context_token_occurrence_index_id).filter(Boolean));
  const contextTokens = sortedLinks.map((link) => {
    const reverse = reverseByNormalized.get(link.context_normalized);
    return {
      context_token_link_id: link.context_token_link_id,
      context_token_id: link.context_token_id,
      context_token_occurrence_index_id: reverse?.context_token_occurrence_index_id || null,
      context_surface: link.context_surface,
      context_normalized: link.context_normalized,
      context_link_role: link.context_link_role,
      focus_marked: link.focus_marked === true,
      is_repeated_focus_token: link.is_repeated_focus_token === true,
      distance_from_focus: Number(link.distance_from_focus || 0),
      cross_frame_context_token: link.cross_frame_context_token === true,
      selected_row_share_basis_points: Number(link.context_token_selected_row_share_basis_points || 0),
    };
  });
  const relatedRouteIds = unique([...(detail.related_route_ids || []), ...sortedLinks.flatMap((link) => link.related_route_ids || [])]);
  return {
    occurrence_context_profile_id: `definition-workbench-usage-occurrence-context-profile-${hash(detail.occurrence_id)}`,
    occurrence_id: detail.occurrence_id,
    detail_id: detail.detail_id,
    row_id: detail.row_id,
    token_key: detail.token_key,
    token_surface: detail.token_surface,
    token_normalized: detail.token_normalized,
    focus_surface: detail.focus_surface,
    focus_normalized: detail.focus_normalized,
    usage_label: 'observed usage only',
    navigation_label: 'occurrence context-token profile',
    status: detail.status,
    raw_score: Number(detail.raw_score || 0),
    cluster_id: detail.cluster_id,
    usage_frame_label: detail.usage_frame_label,
    source_ref: detail.source_ref,
    source_href: detail.source_href,
    work_title: detail.work_title,
    work_slug: detail.work_slug,
    work_anchor_href: detail.work_anchor_href,
    context_focus_marked: detail.context_focus_marked,
    related_route_ids: relatedRouteIds,
    route_resolution_status: detail.route_resolution_status,
    unresolved_route_ids: detail.unresolved_route_ids || [],
    source_ref_bucket_key: detail.source_ref_bucket_key,
    source_cluster_key: detail.source_cluster_key,
    work_bucket_key: detail.work_bucket_key,
    work_frame_key: detail.work_frame_key,
    provenance_key: detail.provenance_key,
    provenance_frame_key: detail.provenance_frame_key,
    provenance_id: detail.provenance_id,
    version_title: detail.version_title,
    version_source: detail.version_source,
    license: detail.license,
    license_url: detail.license_url,
    context_token_profile: {
      context_token_link_ids: sortedLinks.map((link) => link.context_token_link_id),
      context_token_occurrence_index_ids: reverseIds,
      context_token_count: sortedLinks.length,
      unique_context_normalized_count: unique(sortedLinks.map((link) => link.context_normalized)).length,
      focus_link_count: sortedLinks.filter((link) => link.focus_marked === true).length,
      context_link_count: sortedLinks.filter((link) => link.focus_marked !== true).length,
      repeated_focus_context_link_count: sortedLinks.filter((link) => link.is_repeated_focus_token === true).length,
      cross_frame_context_link_count: sortedLinks.filter((link) => link.cross_frame_context_token === true).length,
      before_focus_count: sortedLinks.filter((link) => Number(link.distance_from_focus || 0) < 0).length,
      at_focus_count: sortedLinks.filter((link) => Number(link.distance_from_focus || 0) === 0).length,
      after_focus_count: sortedLinks.filter((link) => Number(link.distance_from_focus || 0) > 0).length,
    },
    context_tokens: contextTokens,
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      occurrence_context_profile_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
  };
}

function buildCounts(rows) {
  const contextTokenCount = sum(rows.map((row) => row.context_token_profile.context_token_count));
  const focusCount = sum(rows.map((row) => row.context_token_profile.focus_link_count));
  const contextCount = sum(rows.map((row) => row.context_token_profile.context_link_count));
  const routeIds = unique(rows.flatMap((row) => row.related_route_ids || []));
  return {
    profile_rows: rows.length,
    input_occurrence_detail_rows: detailRows.length,
    context_token_link_rows: contextTokenCount,
    input_context_token_link_rows: linkRows.length,
    reverse_index_rows: reverseRows.length,
    input_reverse_index_rows: Number(contextTokenOccurrenceIndex.counts?.context_token_occurrence_rows || 0),
    unique_context_tokens: unique(rows.flatMap((row) => row.context_tokens.map((token) => token.context_normalized))).length,
    rows_with_context_tokens: rows.filter((row) => row.context_token_profile.context_token_count > 0).length,
    rows_with_reverse_index_ids: rows.filter((row) => row.context_token_profile.context_token_occurrence_index_ids.length > 0).length,
    rows_with_complete_reverse_index_mapping: rows.filter((row) => row.context_tokens.every((token) => token.context_token_occurrence_index_id)).length,
    focus_link_rows: focusCount,
    input_focus_link_rows: Number(contextTokenLinks.counts?.focus_marked_link_rows || 0),
    context_link_rows: contextCount,
    input_context_link_rows: Number(contextTokenLinks.counts?.context_role_link_rows || 0),
    repeated_focus_context_link_rows: sum(rows.map((row) => row.context_token_profile.repeated_focus_context_link_count)),
    cross_frame_context_link_rows: sum(rows.map((row) => row.context_token_profile.cross_frame_context_link_count)),
    rows_with_cross_frame_context_links: rows.filter((row) => row.context_token_profile.cross_frame_context_link_count > 0).length,
    rows_with_repeated_focus_context_links: rows.filter((row) => row.context_token_profile.repeated_focus_context_link_count > 0).length,
    rows_with_before_focus_tokens: rows.filter((row) => row.context_token_profile.before_focus_count > 0).length,
    rows_with_after_focus_tokens: rows.filter((row) => row.context_token_profile.after_focus_count > 0).length,
    status_counts: countBy(rows, (row) => row.status),
    cluster_counts: countBy(rows, (row) => row.cluster_id),
    source_refs: unique(rows.map((row) => row.source_ref)).length,
    works: unique(rows.map((row) => row.work_slug)).length,
    licenses: unique(rows.map((row) => row.license)).length,
    version_sources: unique(rows.map((row) => row.version_source)).length,
    route_ids: routeIds.length,
    unresolved_route_ids: unique(rows.flatMap((row) => row.unresolved_route_ids || [])).length,
    max_route_share_basis_points: routeIds.length === 1 && rows.length > 0 ? 10000 : 0,
    route_concentration_warning: routeIds.length === 1 && rows.length > 0 ? 1 : 0,
    rows_with_source_link: rows.filter((row) => Boolean(row.source_href)).length,
    rows_with_work_anchor: rows.filter((row) => Boolean(row.work_anchor_href)).length,
    rows_with_hebrew_context: rows.filter((row) => Boolean(row.context_focus_marked)).length,
    rows_with_focus_marker: rows.filter((row) => String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')).length,
    rows_with_route_ids: rows.filter((row) => (row.related_route_ids || []).length > 0).length,
    rows_with_license_metadata: rows.filter((row) => Boolean(row.license && row.license_url)).length,
    rows_with_version_metadata: rows.filter((row) => Boolean(row.version_title && row.version_source)).length,
    observed_usage_only_rows: rows.filter((row) => row.usage_label === 'observed usage only' && row.usage_boundary?.observed_usage_only === true).length,
    reader_facing_rows: rows.filter((row) => row.usage_boundary?.reader_facing === true).length,
    route_payload_field_hits: countForbiddenKeys(rows, ['route_payload', 'route_payloads', 'route_metadata']),
    forbidden_authority_field_hits: countForbiddenKeys(rows, forbiddenAuthorityKeys),
  };
}

function buildChecks(counts) {
  return [
    check('profile_rows_present', counts.profile_rows === counts.input_occurrence_detail_rows && counts.profile_rows > 0 ? 'passed' : 'failed', `profiles/input ${counts.profile_rows}/${counts.input_occurrence_detail_rows}`),
    check('context_links_preserved', counts.context_token_link_rows === counts.input_context_token_link_rows && counts.context_token_link_rows === counts.focus_link_rows + counts.context_link_rows ? 'passed' : 'failed', `links/input/focus/context ${counts.context_token_link_rows}/${counts.input_context_token_link_rows}/${counts.focus_link_rows}/${counts.context_link_rows}`),
    check('reverse_index_linked', counts.rows_with_reverse_index_ids === counts.profile_rows && counts.rows_with_complete_reverse_index_mapping === counts.profile_rows && counts.reverse_index_rows === counts.input_reverse_index_rows ? 'passed' : 'failed', `rows with reverse IDs ${counts.rows_with_reverse_index_ids}/${counts.profile_rows}; complete ${counts.rows_with_complete_reverse_index_mapping}/${counts.profile_rows}; reverse rows ${counts.reverse_index_rows}/${counts.input_reverse_index_rows}`),
    check('focus_and_context_visible', counts.focus_link_rows === counts.input_focus_link_rows && counts.context_link_rows === counts.input_context_link_rows && counts.rows_with_before_focus_tokens > 0 && counts.rows_with_after_focus_tokens === counts.profile_rows ? 'passed' : 'failed', `focus/context ${counts.focus_link_rows}/${counts.context_link_rows}; before/after ${counts.rows_with_before_focus_tokens}/${counts.rows_with_after_focus_tokens}`),
    check('cross_frame_visible', counts.cross_frame_context_link_rows > 0 && counts.rows_with_cross_frame_context_links > 0 ? 'warning' : 'failed', `cross-frame links/rows ${counts.cross_frame_context_link_rows}/${counts.rows_with_cross_frame_context_links}`),
    check('route_ids_only', counts.route_ids > 0 && counts.unresolved_route_ids === 0 && counts.route_concentration_warning === 1 ? 'warning' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}; concentration ${counts.route_concentration_warning}`),
    check('metadata_complete', allEqual(counts.profile_rows, [
      counts.rows_with_source_link,
      counts.rows_with_work_anchor,
      counts.rows_with_hebrew_context,
      counts.rows_with_focus_marker,
      counts.rows_with_route_ids,
      counts.rows_with_license_metadata,
      counts.rows_with_version_metadata,
      counts.observed_usage_only_rows,
    ]) ? 'passed' : 'failed', `rows/source/work/context/focus/route/license/version/observed ${counts.profile_rows}/${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}/${counts.rows_with_route_ids}/${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}/${counts.observed_usage_only_rows}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route-payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Occurrence Context Profile',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Profile rows: ${artifact.counts.profile_rows}`,
    `- Context-token links: ${artifact.counts.context_token_link_rows}`,
    `- Unique context tokens: ${artifact.counts.unique_context_tokens}`,
    `- Focus/context links: ${artifact.counts.focus_link_rows}/${artifact.counts.context_link_rows}`,
    `- Repeated-focus/cross-frame links: ${artifact.counts.repeated_focus_context_link_rows}/${artifact.counts.cross_frame_context_link_rows}`,
    `- Rows with reverse-index IDs: ${artifact.counts.rows_with_reverse_index_ids}/${artifact.counts.profile_rows}`,
    `- Source refs / works / licenses / version sources: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.licenses}/${artifact.counts.version_sources}`,
    `- Route IDs / unresolved / concentration warning: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}/${artifact.counts.route_concentration_warning}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Boundary',
    '',
    'This artifact is selected-scope occurrence context navigation only. It links occurrence rows to context-token link IDs and reverse-index IDs. It does not define a token, rank routes, select visible answers, copy Agent 2 payloads, accept UI rendering, or support publication/accepted translation text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function assertArtifact(artifact, artifactType, relativePath) {
  if (artifact.artifact_type !== artifactType) {
    throw new Error(`${relativePath} is not ${artifactType}`);
  }
}

function countForbiddenKeys(value, keys) {
  const keySet = new Set(keys);
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
      if (keySet.has(key)) hits += 1;
      walk(child);
    }
  }
}

function groupBy(values, keyFn) {
  const map = new Map();
  for (const value of values) {
    const key = keyFn(value);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(value);
  }
  return map;
}

function countBy(values, keyFn) {
  const counts = {};
  for (const value of values) {
    const key = keyFn(value) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))];
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolutePath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function cleanRelativePath(value) {
  const normalized = String(value).replace(/\\/g, '/');
  if (normalized.includes('..')) throw new Error(`Refusing path with parent traversal: ${value}`);
  return normalized;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function parseArgs(args) {
  const options = { ...defaults };
  for (const arg of args) {
    if (!arg.startsWith('--')) continue;
    const [key, ...rest] = arg.slice(2).split('=');
    const value = rest.join('=');
    if (!value) continue;
    if (key === 'occurrence-detail-index') options.occurrenceDetailIndex = cleanRelativePath(value);
    else if (key === 'context-token-links') options.contextTokenLinks = cleanRelativePath(value);
    else if (key === 'context-token-occurrence-index') options.contextTokenOccurrenceIndex = cleanRelativePath(value);
    else if (key === 'output') options.output = cleanRelativePath(value);
    else if (key === 'report') options.report = cleanRelativePath(value);
  }
  return options;
}
