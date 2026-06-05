#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  output: 'data/definitions/definition-workbench-usage-anchor-audit.json',
  report: 'reports/definition-workbench-usage-anchor-audit.md',
};

const options = parseArgs(process.argv.slice(2));
const occurrenceLinks = readJson(options.occurrenceLinks);

if (occurrenceLinks.artifact_type !== 'definition_workbench_usage_occurrence_links') {
  throw new Error(`${options.occurrenceLinks} is not a Definition Workbench usage occurrence-links packet`);
}

const auditRows = buildAuditRows();
const counts = buildCounts(auditRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_anchor_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_anchor_audit.mjs',
  lane_owner: 'Agent 3',
  input_artifact: options.occurrenceLinks,
  policy: 'Bounded Agent 3 audit proving selected usage occurrence links resolve to local work-page anchors while preserving source/license/context and route-ID-only boundaries. It is usage navigation evidence only, not definition authority, route ranking, visible answer selection, accepted text, or publication support.',
  authority_boundary: {
    usage_navigation_only: true,
    anchor_audit_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    reader_facing: false,
    definition_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    accepted_text_output: false,
    publication_claim: false,
  },
  audit_rows: auditRows,
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
console.log(`Definition Workbench usage anchor audit ${artifact.quality.status}; rows ${counts.audit_rows}; anchors ${counts.rows_with_existing_anchor}/${counts.audit_rows}; source refs ${counts.rows_with_matching_source_ref}/${counts.audit_rows}`);

function buildAuditRows() {
  const rows = Array.isArray(occurrenceLinks.occurrence_links) ? occurrenceLinks.occurrence_links : [];
  const pageCache = new Map();
  return rows.map((row) => {
    const parsed = parseAnchor(row.work_anchor_href || '');
    const page = parsed.local_path ? readPage(parsed.local_path, pageCache) : { exists: false, text: '' };
    const anchorExists = page.exists && parsed.fragment ? hasAnchor(page.text, parsed.fragment) : false;
    const sourceRefMatches = page.exists && row.source_ref ? hasSourceRef(page.text, row.source_ref) : false;
    const tokenSurfaceFound = page.exists && row.token_surface ? page.text.includes(row.token_surface) : false;
    const focusSurfaceFound = page.exists && row.focus_surface ? page.text.includes(row.focus_surface) : false;
    return {
      audit_id: `definition-workbench-usage-anchor-audit-${String(row.row_id || row.occurrence_id).replace(/^definition-workbench-usage-occurrence-link-/, '')}`,
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
      work_anchor_href: row.work_anchor_href,
      work_page_path: parsed.local_path,
      work_anchor_fragment: parsed.fragment,
      work_page_exists: page.exists,
      work_anchor_exists: anchorExists,
      source_ref_matches_page_unit: sourceRefMatches,
      token_surface_found_in_page: tokenSurfaceFound,
      focus_surface_found_in_page: focusSurfaceFound,
      phrase_context_snippet: row.context_focus_marked,
      context_has_focus_marker: /\[.+\]/u.test(row.context_focus_marked || ''),
      status: row.status,
      raw_score: Number(row.raw_score || 0),
      usage_frame_label: row.usage_frame_label,
      cluster_id: row.cluster_id,
      related_route_ids: Array.isArray(row.related_route_ids) ? row.related_route_ids : [],
      version_title: row.version_title,
      version_source: row.version_source,
      license: row.license,
      license_url: row.license_url,
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        not_answer_authority: true,
        not_definition_authority: true,
        not_semantic_arbitration: true,
      },
    };
  });
}

function buildCounts(rows) {
  const uniquePages = new Set(rows.map((row) => row.work_page_path).filter(Boolean));
  const routeIds = new Set();
  for (const row of rows) {
    for (const routeId of row.related_route_ids || []) routeIds.add(routeId);
  }
  return {
    audit_rows: rows.length,
    unique_work_pages: uniquePages.size,
    rows_with_source_url: rows.filter((row) => /^https:\/\//.test(row.source_url || '')).length,
    rows_with_local_work_page: rows.filter((row) => row.work_page_path).length,
    rows_with_existing_work_page: rows.filter((row) => row.work_page_exists).length,
    rows_with_anchor_fragment: rows.filter((row) => row.work_anchor_fragment).length,
    rows_with_existing_anchor: rows.filter((row) => row.work_anchor_exists).length,
    rows_with_matching_source_ref: rows.filter((row) => row.source_ref_matches_page_unit).length,
    rows_with_token_surface_in_page: rows.filter((row) => row.token_surface_found_in_page).length,
    rows_with_focus_surface_in_page: rows.filter((row) => row.focus_surface_found_in_page).length,
    rows_with_context: rows.filter((row) => row.phrase_context_snippet).length,
    rows_with_focus_marker: rows.filter((row) => row.context_has_focus_marker).length,
    rows_with_license: rows.filter((row) => row.license && /^https:\/\//.test(row.license_url || '')).length,
    rows_with_version: rows.filter((row) => row.version_title && row.version_source).length,
    rows_with_route_ids: rows.filter((row) => (row.related_route_ids || []).length > 0).length,
    route_ids: routeIds.size,
    supported_rows: rows.filter((row) => row.status === 'supported').length,
    candidate_rows: rows.filter((row) => row.status === 'candidate').length,
    weak_rows: rows.filter((row) => row.status === 'weak').length,
    reader_facing_rows: rows.filter((row) => row.usage_boundary?.reader_facing !== false).length,
    route_payload_field_hits: countForbiddenKeyHits(rows, ['route_payload', 'route_payloads']),
    forbidden_authority_field_hits: countForbiddenKeyHits(rows, [
      'definition',
      'definition_text',
      'meaning',
      'meaning_claim',
      'translation',
      'translation_text',
      'accepted_translation',
      'final_answer',
      'winner',
    ]),
  };
}

function buildChecks(counts) {
  return [
    check('audit_rows_present', counts.audit_rows > 0 ? 'passed' : 'failed', `rows ${counts.audit_rows}`),
    check('source_urls_complete', counts.rows_with_source_url === counts.audit_rows ? 'passed' : 'failed', `${counts.rows_with_source_url}/${counts.audit_rows}`),
    check('work_pages_exist', counts.rows_with_local_work_page === counts.audit_rows && counts.rows_with_existing_work_page === counts.audit_rows ? 'passed' : 'failed', `local/existing ${counts.rows_with_local_work_page}/${counts.rows_with_existing_work_page}/${counts.audit_rows}`),
    check('anchors_resolve', counts.rows_with_anchor_fragment === counts.audit_rows && counts.rows_with_existing_anchor === counts.audit_rows ? 'passed' : 'failed', `fragment/existing ${counts.rows_with_anchor_fragment}/${counts.rows_with_existing_anchor}/${counts.audit_rows}`),
    check('source_refs_match_units', counts.rows_with_matching_source_ref === counts.audit_rows ? 'passed' : 'failed', `${counts.rows_with_matching_source_ref}/${counts.audit_rows}`),
    check('surface_tokens_present_in_pages', counts.rows_with_token_surface_in_page === counts.audit_rows && counts.rows_with_focus_surface_in_page === counts.audit_rows ? 'passed' : 'failed', `token/focus ${counts.rows_with_token_surface_in_page}/${counts.rows_with_focus_surface_in_page}/${counts.audit_rows}`),
    check('context_focus_complete', counts.rows_with_context === counts.audit_rows && counts.rows_with_focus_marker === counts.audit_rows ? 'passed' : 'failed', `context/focus ${counts.rows_with_context}/${counts.rows_with_focus_marker}/${counts.audit_rows}`),
    check('license_version_complete', counts.rows_with_license === counts.audit_rows && counts.rows_with_version === counts.audit_rows ? 'passed' : 'failed', `license/version ${counts.rows_with_license}/${counts.rows_with_version}/${counts.audit_rows}`),
    check('route_ids_only', counts.rows_with_route_ids === counts.audit_rows && counts.route_ids > 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `rows with route IDs ${counts.rows_with_route_ids}; route IDs ${counts.route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('useful_status_counts_visible', counts.supported_rows > 0 && counts.candidate_rows > 0 && counts.weak_rows > 0 ? 'passed' : 'failed', `supported/candidate/weak ${counts.supported_rows}/${counts.candidate_rows}/${counts.weak_rows}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; forbidden authority hits ${counts.forbidden_authority_field_hits}`),
  ];
}

function parseAnchor(href) {
  const [rawPath, rawFragment] = String(href || '').split('#');
  return {
    local_path: rawPath && !/^https?:\/\//.test(rawPath) ? cleanRelativePath(rawPath) : '',
    fragment: rawFragment || '',
  };
}

function readPage(relativePath, cache) {
  if (cache.has(relativePath)) return cache.get(relativePath);
  const fullPath = path.join(root, relativePath);
  const page = fs.existsSync(fullPath)
    ? { exists: true, text: fs.readFileSync(fullPath, 'utf8') }
    : { exists: false, text: '' };
  cache.set(relativePath, page);
  return page;
}

function hasAnchor(text, fragment) {
  const escaped = escapeRegExp(fragment);
  return new RegExp(`\\bid=["']${escaped}["']`, 'u').test(text);
}

function hasSourceRef(text, sourceRef) {
  return text.includes(`data-source-ref="${escapeHtml(sourceRef)}"`);
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

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Anchor Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Lane: Agent 3 usage navigation.',
    '- Audit scope: selected occurrence links only.',
    '- Rows are observed usage only.',
    '- Route linkage is route IDs only.',
    '- Reader-facing rows: 0.',
    '',
    '## Counts',
    '',
    `- Audit rows: ${artifact.counts.audit_rows}`,
    `- Unique work pages: ${artifact.counts.unique_work_pages}`,
    `- Existing local pages: ${artifact.counts.rows_with_existing_work_page}/${artifact.counts.audit_rows}`,
    `- Existing anchors: ${artifact.counts.rows_with_existing_anchor}/${artifact.counts.audit_rows}`,
    `- Source refs matching page units: ${artifact.counts.rows_with_matching_source_ref}/${artifact.counts.audit_rows}`,
    `- Token/focus surfaces present in pages: ${artifact.counts.rows_with_token_surface_in_page}/${artifact.counts.rows_with_focus_surface_in_page}`,
    `- Context/focus rows: ${artifact.counts.rows_with_context}/${artifact.counts.rows_with_focus_marker}`,
    `- License/version rows: ${artifact.counts.rows_with_license}/${artifact.counts.rows_with_version}`,
    `- Supported/candidate/weak rows: ${artifact.counts.supported_rows}/${artifact.counts.candidate_rows}/${artifact.counts.weak_rows}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Forbidden authority field hits: ${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    ...artifact.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
    '',
    '## Sample Rows',
    '',
    '| occurrence | source | local anchor | status | frame | license |',
    '|---|---|---|---|---|---|',
    ...artifact.audit_rows.slice(0, 12).map((row) => [
      row.occurrence_id,
      row.source_ref,
      row.work_anchor_href,
      row.status,
      row.usage_frame_label,
      row.license,
    ].map(mdCell).join(' | ')).map((line) => `| ${line} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
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
