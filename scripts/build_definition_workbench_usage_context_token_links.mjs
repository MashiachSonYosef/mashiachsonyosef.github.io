#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  contextTokenIndex: 'data/definitions/definition-workbench-usage-context-token-index.json',
  output: 'data/definitions/definition-workbench-usage-context-token-links.json',
  report: 'reports/definition-workbench-usage-context-token-links.md',
};

const options = parseArgs(process.argv.slice(2));
const contextTokenIndex = readJson(options.contextTokenIndex);

if (contextTokenIndex.artifact_type !== 'definition_workbench_usage_context_token_index') {
  throw new Error(`${options.contextTokenIndex} is not a Definition Workbench usage context-token index`);
}

const tokenRows = contextTokenIndex.context_token_rows || [];
const occurrenceRows = contextTokenIndex.occurrence_context_rows || [];
const tokenByNormalized = new Map(tokenRows.map((row) => [row.context_normalized, row]));
const contextTokenLinks = buildContextTokenLinks();
const counts = buildCounts(contextTokenLinks);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_context_token_links',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_context_token_links.mjs',
  lane_owner: 'Agent 3',
  policy: 'Selected-scope Definition Workbench usage-navigation context-token link packet. Rows connect Hebrew context-token appearances to occurrence links, source refs, work anchors, route IDs, and provenance/license metadata. It is not a definition source, translation source, route ranking surface, semantic arbiter, public UI acceptance, publication claim, or accepted text source.',
  inputs: {
    context_token_index: options.contextTokenIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    selected_scope_only: true,
    observed_usage_only: true,
    context_token_link_navigation_only: true,
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
  route_concentration: {
    route_ids: contextTokenIndex.route_concentration?.route_ids || [],
    max_route_share_basis_points: counts.max_route_share_basis_points,
    route_concentration_warning: counts.route_concentration_warning,
    semantic_independence_claim_allowed: false,
  },
  context_token_links: contextTokenLinks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage context-token links ${artifact.quality.status}; links ${counts.context_token_link_rows}; context tokens ${counts.context_token_rows}; occurrences ${counts.occurrence_rows}`);

function buildContextTokenLinks() {
  const rows = [];
  for (const occurrence of occurrenceRows) {
    const contextTokens = occurrence.context_tokens || [];
    for (const [index, token] of contextTokens.entries()) {
      const tokenRow = tokenByNormalized.get(token.normalized) || {};
      rows.push({
        context_token_link_id: `definition-workbench-usage-context-token-link-${hash([
          occurrence.occurrence_id,
          index,
          token.normalized,
          token.distance_from_focus,
        ].join('|'))}`,
        context_token_id: tokenRow.context_token_id || null,
        context_normalized: token.normalized,
        context_surface: token.surface,
        context_role: token.role,
        context_link_role: token.focus_marked ? 'focus' : token.is_repeated_focus_token ? 'repeated_focus_context' : 'context',
        focus_marked: token.focus_marked === true,
        is_repeated_focus_token: token.is_repeated_focus_token === true,
        distance_from_focus: token.distance_from_focus,
        cross_frame_context_token: tokenRow.cross_frame_context_token === true,
        context_token_selected_row_share_basis_points: Number(tokenRow.selected_row_share_basis_points || 0),
        occurrence_id: occurrence.occurrence_id,
        context_row_id: occurrence.context_row_id,
        detail_id: occurrence.detail_id,
        row_id: occurrence.row_id,
        token_key: occurrence.token_key,
        token_surface: occurrence.token_surface,
        token_normalized: occurrence.token_normalized,
        focus_surface: occurrence.focus_surface,
        focus_normalized: occurrence.focus_normalized,
        status: occurrence.status,
        raw_score: occurrence.raw_score,
        cluster_id: occurrence.cluster_id,
        usage_frame_label: occurrence.usage_frame_label,
        source_ref: occurrence.source_ref,
        source_href: occurrence.source_href,
        work_title: occurrence.work_title,
        work_slug: occurrence.work_slug,
        work_anchor_href: occurrence.work_anchor_href,
        context_focus_marked: occurrence.context_focus_marked,
        related_route_ids: occurrence.related_route_ids || [],
        route_resolution_status: occurrence.route_resolution_status,
        unresolved_route_ids: occurrence.unresolved_route_ids || [],
        provenance_id: occurrence.provenance_id,
        version_title: occurrence.version_title,
        version_source: occurrence.version_source,
        license: occurrence.license,
        license_url: occurrence.license_url,
        usage_boundary: usageBoundary(),
      });
    }
  }
  return rows;
}

function buildCounts(rows) {
  const statusCounts = countBy(rows, (row) => row.status);
  const contextLinkRoles = countBy(rows, (row) => row.context_link_role);
  const routeIds = unique(rows.flatMap((row) => row.related_route_ids || []));
  const unresolvedRouteIds = unique(rows.flatMap((row) => row.unresolved_route_ids || []));
  return {
    context_token_link_rows: rows.length,
    input_context_token_occurrences: Number(contextTokenIndex.counts?.context_token_occurrences || 0),
    context_token_rows: unique(rows.map((row) => row.context_token_id)).length,
    input_context_token_rows: Number(contextTokenIndex.counts?.context_token_rows || 0),
    occurrence_rows: unique(rows.map((row) => row.occurrence_id)).length,
    input_occurrence_rows: Number(contextTokenIndex.counts?.occurrence_rows || 0),
    focus_marked_link_rows: rows.filter((row) => row.focus_marked).length,
    context_role_link_rows: rows.filter((row) => row.context_role === 'context').length,
    repeated_focus_context_links: rows.filter((row) => row.is_repeated_focus_token).length,
    cross_frame_context_token_links: rows.filter((row) => row.cross_frame_context_token).length,
    status_counts: statusCounts,
    context_link_role_counts: contextLinkRoles,
    source_refs: unique(rows.map((row) => row.source_ref)).length,
    works: unique(rows.map((row) => row.work_slug)).length,
    licenses: unique(rows.map((row) => row.license)).length,
    version_sources: unique(rows.map((row) => row.version_source)).length,
    route_ids: routeIds.length,
    unresolved_route_ids: unresolvedRouteIds.length,
    max_route_share_basis_points: Number(contextTokenIndex.counts?.max_route_share_basis_points || 0),
    route_concentration_warning: Number(contextTokenIndex.counts?.route_concentration_warning || 0),
    rows_with_context_token_id: rows.filter((row) => row.context_token_id).length,
    rows_with_source_link: rows.filter((row) => row.source_ref && row.source_href).length,
    rows_with_work_anchor: rows.filter((row) => row.work_slug && row.work_anchor_href).length,
    rows_with_hebrew_context: rows.filter((row) => row.context_focus_marked && hasHebrew(row.context_focus_marked)).length,
    rows_with_focus_marker: rows.filter((row) => String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')).length,
    rows_with_route_ids: rows.filter((row) => (row.related_route_ids || []).length > 0).length,
    rows_with_license_metadata: rows.filter((row) => row.license && row.license_url).length,
    rows_with_version_metadata: rows.filter((row) => row.version_title && row.version_source).length,
    observed_usage_only_rows: rows.filter((row) => row.usage_boundary?.observed_usage_only === true).length,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('context_token_links_present', counts.context_token_link_rows > 0 ? 'passed' : 'failed', `links ${counts.context_token_link_rows}`),
    check('input_coverage_preserved', counts.context_token_link_rows === counts.focus_marked_link_rows + counts.context_role_link_rows && counts.context_role_link_rows === counts.input_context_token_occurrences && counts.focus_marked_link_rows === counts.input_occurrence_rows && counts.context_token_rows === counts.input_context_token_rows && counts.occurrence_rows === counts.input_occurrence_rows ? 'passed' : 'failed', `links ${counts.context_token_link_rows}/${counts.focus_marked_link_rows + counts.context_role_link_rows}; context ${counts.context_role_link_rows}/${counts.input_context_token_occurrences}; focus ${counts.focus_marked_link_rows}/${counts.input_occurrence_rows}; tokens ${counts.context_token_rows}/${counts.input_context_token_rows}; occurrences ${counts.occurrence_rows}/${counts.input_occurrence_rows}`),
    check('focus_and_context_links_visible', counts.focus_marked_link_rows === counts.occurrence_rows && counts.context_role_link_rows > counts.occurrence_rows ? 'passed' : 'failed', `focus links ${counts.focus_marked_link_rows}/${counts.occurrence_rows}; context links ${counts.context_role_link_rows}`),
    check('metadata_complete', allEqual(counts.context_token_link_rows, [
      counts.rows_with_context_token_id,
      counts.rows_with_source_link,
      counts.rows_with_work_anchor,
      counts.rows_with_hebrew_context,
      counts.rows_with_focus_marker,
      counts.rows_with_route_ids,
      counts.rows_with_license_metadata,
      counts.rows_with_version_metadata,
      counts.observed_usage_only_rows,
    ]) ? 'passed' : 'failed', `link/source/work/context/focus/route/license/version ${counts.context_token_link_rows}/${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}/${counts.rows_with_route_ids}/${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}`),
    check('route_ids_only', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('cross_frame_tokens_visible', counts.cross_frame_context_token_links > 0 ? 'passed' : 'failed', `cross-frame links ${counts.cross_frame_context_token_links}`),
    check('repeated_focus_tokens_visible', counts.repeated_focus_context_links > 0 ? 'warning' : 'passed', `repeated focus links ${counts.repeated_focus_context_links}`),
    check('route_concentration_marked', counts.route_concentration_warning === 1 && counts.max_route_share_basis_points === 10000 ? 'warning' : 'passed', `max share ${counts.max_route_share_basis_points}/10000; warning ${counts.route_concentration_warning}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route-payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const topTokens = tokenRows.slice(0, 25);
  const lines = [
    '# Definition Workbench Usage Context Token Links',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Context-token link rows: ${artifact.counts.context_token_link_rows}`,
    `- Context-token rows / occurrence rows: ${artifact.counts.context_token_rows}/${artifact.counts.occurrence_rows}`,
    `- Focus/context/repeated-focus links: ${artifact.counts.focus_marked_link_rows}/${artifact.counts.context_role_link_rows}/${artifact.counts.repeated_focus_context_links}`,
    `- Cross-frame context-token links: ${artifact.counts.cross_frame_context_token_links}`,
    `- Source refs / works / licenses / version sources: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.licenses}/${artifact.counts.version_sources}`,
    `- Route IDs / unresolved / max route share: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}/${artifact.counts.max_route_share_basis_points}/10000`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Top Context Tokens',
    '',
    '| token | rows | appearances | frames | source refs | works | cross-frame | repeated-focus appearances |',
    '|---|---:|---:|---:|---:|---:|---|---:|',
    ...topTokens.map((row) => `| ${mdCell(row.context_normalized)} | ${row.occurrence_row_count} | ${row.occurrence_count} | ${row.usage_frame_labels.length} | ${row.source_refs.length} | ${row.work_slugs.length} | ${row.cross_frame_context_token} | ${row.repeated_focus_context_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function usageBoundary() {
  return {
    observed_usage_only: true,
    reader_facing: false,
    route_ids_only: true,
    context_token_link_only: true,
    not_answer_authority: true,
    not_definition_authority: true,
    not_semantic_arbitration: true,
  };
}

function countBy(values, getKey) {
  const counts = {};
  for (const value of values) {
    const key = getKey(value) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function hasHebrew(value) {
  return /[\u0590-\u05FF]/.test(String(value || ''));
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function unique(values) {
  return [...new Set((values || []).filter((value) => value !== undefined && value !== null && value !== ''))];
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--context-token-index=')) parsed.contextTokenIndex = cleanRelativePath(valueAfterEquals(arg));
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
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8')));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}
