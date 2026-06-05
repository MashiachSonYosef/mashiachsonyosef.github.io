#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  concordanceManifest: 'data/workbench-evidence/usage-concordance-manifest.json',
  occurrenceSupportPacket: 'data/definitions/definition-workbench-usage-occurrence-support-packet.json',
  output: 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json',
  report: 'reports/definition-workbench-usage-concordance-navigation-packet.md',
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
  'route_links',
];

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
const concordanceManifest = readJson(options.concordanceManifest);
const occurrenceSupportPacket = readJson(options.occurrenceSupportPacket);

assertArtifact(concordance, 'workbench_usage_navigation_concordance', options.concordance);
assertArtifact(concordanceManifest, 'workbench_usage_navigation_concordance_manifest', options.concordanceManifest);
assertArtifact(occurrenceSupportPacket, 'definition_workbench_usage_occurrence_support_packet', options.occurrenceSupportPacket);

const selectedOccurrenceIds = new Set((occurrenceSupportPacket.support_rows || []).map((row) => row.occurrence_id));
const navigationRows = buildNavigationRows();
const counts = buildCounts(navigationRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_concordance_navigation_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_concordance_navigation_packet.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    concordance: options.concordance,
    concordance_manifest: options.concordanceManifest,
    occurrence_support_packet: options.occurrenceSupportPacket,
  },
  policy: 'Full current usage-concordance navigation packet for Definition Workbench planning. It republishes existing usage-navigation rows as observed usage only with source/work/context/version/license metadata and related Agent 2 route IDs only. It does not expand targets, rescan corpus files, copy Agent 2 route payloads, rank routes, select visible answers, emit definitions, or claim publication readiness.',
  authority_boundary: {
    usage_navigation_only: true,
    concordance_navigation_only: true,
    full_concordance_snapshot: true,
    observed_usage_only: true,
    route_ids_only: true,
    derived_from_existing_concordance: true,
    broad_target_expansion: false,
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
  audit_policy: {
    emitted_statuses: ['supported', 'candidate', 'weak'],
    ambiguous_rows_policy: 'audit_only_not_emitted',
    audit_only_ambiguous_rows_available: Number(concordance.counts?.audit_only_counts?.ambiguous || 0),
    audit_only_blocked_rows_available: Number(concordance.counts?.audit_only_counts?.blocked || 0),
  },
  navigation_rows: navigationRows,
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
console.log(`Definition Workbench usage concordance navigation ${artifact.quality.status}; rows ${artifact.counts.navigation_rows}; selected ${artifact.counts.selected_support_rows}; reader-facing ${artifact.counts.reader_facing_rows}`);

function buildNavigationRows() {
  return (concordance.rows || []).map((row, index) => {
    const source = row.source || {};
    const ids = row.ids || {};
    const token = row.token || {};
    const usageFrame = row.usage_frame || {};
    const status = row.status || {};
    const occurrenceLinks = row.occurrence_links || {};
    const workAnchor = occurrenceLinks.work_anchor || {};
    const phrase = row.phrase || {};
    const phraseTokens = buildPhraseTokens(phrase.phrase_tokens || []);
    const relatedRouteIds = Array.isArray(row.agent2_route_ids) ? [...new Set(row.agent2_route_ids.filter(Boolean))].sort() : [];
    return {
      navigation_row_id: `definition-workbench-usage-concordance-navigation-${String(index + 1).padStart(4, '0')}`,
      occurrence_id: ids.occurrence_id,
      candidate_id: ids.candidate_id,
      token_key: ids.token_key,
      token_surface: token.token_surface,
      token_normalized: token.token_normalized,
      focus_surface: token.focus_surface,
      focus_normalized: token.focus_normalized,
      phrase_hebrew: phrase.phrase_hebrew || phraseTokens.map((item) => item.surface).join(' '),
      phrase_context_snippet: buildContextSnippet(phraseTokens),
      phrase_tokens: phraseTokens,
      source_ref: source.source_ref,
      source_url: source.source_url,
      local_work_anchor: workAnchor.href,
      local_work_page_anchor: workAnchor.href,
      work_id: source.work_id,
      work_title: source.work_title,
      work_slug: source.work_slug,
      category: firstPathSegment(source.work_slug),
      unit_id: source.unit_id || workAnchor.unit_id,
      usage_frame_label: usageFrame.frame_label,
      cluster_id: usageFrame.cluster_id || ids.cluster_id,
      status: status.candidate_status,
      raw_score: Number(status.raw_score || 0),
      row_label: 'observed usage only',
      route_link_state: row.route_link_state,
      related_agent2_route_ids: relatedRouteIds,
      selected_support_occurrence: selectedOccurrenceIds.has(ids.occurrence_id),
      selected_support_row: selectedOccurrenceIds.has(ids.occurrence_id),
      version_title: source.version_title,
      version_source: source.version_source,
      license: source.license,
      license_url: source.license_url,
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
  });
}

function buildPhraseTokens(tokens) {
  return tokens.map((token) => {
    const focusMarked = Number(token.distance_from_focus) === 0 || token.role === 'focus-token';
    return {
      surface: token.surface,
      normalized: token.normalized,
      role: focusMarked ? 'focus' : 'context',
      focus_marked: focusMarked,
      distance_from_focus: Number(token.distance_from_focus || 0),
    };
  });
}

function buildContextSnippet(tokens) {
  return tokens.map((token) => token.focus_marked ? `[${token.surface}]` : token.surface).join(' ');
}

function buildCounts(rows) {
  const sourceRefs = new Set();
  const works = new Set();
  const categories = new Set();
  const routeIds = new Set();
  const licenses = new Set();
  const licenseUrls = new Set();
  const versionSources = new Set();
  const clusters = new Set();
  const usageFrames = new Set();
  for (const row of rows) {
    if (row.source_ref) sourceRefs.add(row.source_ref);
    if (row.work_slug) works.add(row.work_slug);
    if (row.category) categories.add(row.category);
    if (row.license) licenses.add(row.license);
    if (row.license_url) licenseUrls.add(row.license_url);
    if (row.version_source) versionSources.add(row.version_source);
    if (row.cluster_id) clusters.add(row.cluster_id);
    if (row.usage_frame_label) usageFrames.add(row.usage_frame_label);
    for (const routeId of row.related_agent2_route_ids || []) routeIds.add(routeId);
  }
  const statusCounts = countValues(rows.map((row) => row.status || '(missing)'));
  const licenseCounts = countValues(rows.map((row) => row.license || '(missing)'));
  const categoryCounts = countValues(rows.map((row) => row.category || '(missing)'));
  return {
    navigation_rows: rows.length,
    concordance_rows: Number(concordance.counts?.rows || 0),
    concordance_manifest_rows: Number(concordanceManifest.counts?.rows || 0),
    selected_support_rows: rows.filter((row) => row.selected_support_row === true).length,
    occurrence_support_rows: Number(occurrenceSupportPacket.counts?.support_rows || 0),
    supported_rows: Number(statusCounts.supported || 0),
    candidate_rows: Number(statusCounts.candidate || 0),
    weak_rows: Number(statusCounts.weak || 0),
    source_refs: sourceRefs.size,
    works: works.size,
    categories: categories.size,
    clusters: clusters.size,
    usage_frames: usageFrames.size,
    route_ids: routeIds.size,
    licenses: licenses.size,
    license_urls: licenseUrls.size,
    version_sources: versionSources.size,
    status_counts: statusCounts,
    license_counts: licenseCounts,
    category_counts: categoryCounts,
    rows_with_occurrence_id: rows.filter((row) => row.occurrence_id).length,
    rows_with_token_key: rows.filter((row) => row.token_key).length,
    rows_with_token_surface: rows.filter((row) => row.token_surface && row.token_normalized).length,
    rows_with_focus_surface: rows.filter((row) => row.focus_surface && row.focus_normalized).length,
    rows_with_phrase_hebrew: rows.filter((row) => row.phrase_hebrew).length,
    rows_with_context_snippet: rows.filter((row) => row.phrase_context_snippet).length,
    rows_with_focus_marker: rows.filter((row) => /\[.+\]/u.test(row.phrase_context_snippet || '')).length,
    rows_with_phrase_tokens: rows.filter((row) => Array.isArray(row.phrase_tokens) && row.phrase_tokens.length > 0).length,
    rows_with_single_focus_token: rows.filter((row) => (row.phrase_tokens || []).filter((token) => token.focus_marked === true).length === 1).length,
    rows_with_source_ref: rows.filter((row) => row.source_ref).length,
    rows_with_source_url: rows.filter((row) => /^https:\/\//.test(row.source_url || '')).length,
    rows_with_local_work_anchor: rows.filter((row) => row.local_work_anchor && row.local_work_page_anchor).length,
    rows_with_work_metadata: rows.filter((row) => row.work_id && row.work_title && row.work_slug && row.unit_id).length,
    rows_with_usage_frame: rows.filter((row) => row.cluster_id && row.usage_frame_label).length,
    rows_with_status_score: rows.filter((row) => ['supported', 'candidate', 'weak'].includes(row.status) && Number.isInteger(row.raw_score) && row.raw_score >= 0 && row.raw_score <= 100).length,
    rows_with_route_ids: rows.filter((row) => (row.related_agent2_route_ids || []).length > 0).length,
    rows_with_route_linked_observed_usage: rows.filter((row) => row.route_link_state === 'route_linked_observed_usage').length,
    rows_with_version_metadata: rows.filter((row) => row.version_title && row.version_source).length,
    rows_with_license_metadata: rows.filter((row) => row.license && /^https:\/\//.test(row.license_url || '')).length,
    rows_with_forbidden_license: rows.filter((row) => hasForbiddenLicense(row.license)).length,
    rows_with_observed_usage_label: rows.filter((row) => row.row_label === 'observed usage only').length,
    audit_only_ambiguous_rows_available: Number(concordance.counts?.audit_only_counts?.ambiguous || 0),
    audit_only_ambiguous_rows_emitted: 0,
    reader_facing_rows: rows.filter((row) => row.usage_boundary?.reader_facing !== false).length,
    route_payload_field_hits: countForbiddenKeyHits({ navigation_rows: rows }, ['route_payload', 'route_payloads', 'route_metadata', 'route_links']),
    forbidden_authority_field_hits: 0,
    queue_mutations: 0,
    submitted_to_agent6: 0,
  };
}

function buildChecks(counts) {
  return [
    check('source_concordance_loaded', counts.navigation_rows > 0 && counts.navigation_rows === counts.concordance_rows && counts.navigation_rows === counts.concordance_manifest_rows ? 'passed' : 'failed', `navigation/concordance/manifest rows ${counts.navigation_rows}/${counts.concordance_rows}/${counts.concordance_manifest_rows}`),
    check('selected_support_rows_marked', counts.selected_support_rows === counts.occurrence_support_rows && counts.selected_support_rows > 0 ? 'passed' : 'failed', `selected support rows ${counts.selected_support_rows}/${counts.occurrence_support_rows}`),
    check('status_counts_nonzero', counts.supported_rows > 0 && counts.candidate_rows > 0 && counts.weak_rows > 0 && counts.supported_rows + counts.candidate_rows + counts.weak_rows === counts.navigation_rows ? 'passed' : 'failed', `supported/candidate/weak ${counts.supported_rows}/${counts.candidate_rows}/${counts.weak_rows}`),
    check('navigation_keys_complete', allEqual(counts.navigation_rows, [
      counts.rows_with_occurrence_id,
      counts.rows_with_token_key,
      counts.rows_with_token_surface,
      counts.rows_with_focus_surface,
    ]) ? 'passed' : 'failed', `occurrence/token/surface/focus ${counts.rows_with_occurrence_id}/${counts.rows_with_token_key}/${counts.rows_with_token_surface}/${counts.rows_with_focus_surface}`),
    check('phrase_context_complete', allEqual(counts.navigation_rows, [
      counts.rows_with_phrase_hebrew,
      counts.rows_with_context_snippet,
      counts.rows_with_focus_marker,
      counts.rows_with_phrase_tokens,
      counts.rows_with_single_focus_token,
    ]) ? 'passed' : 'failed', `phrase/context/focus/tokens/single-focus ${counts.rows_with_phrase_hebrew}/${counts.rows_with_context_snippet}/${counts.rows_with_focus_marker}/${counts.rows_with_phrase_tokens}/${counts.rows_with_single_focus_token}`),
    check('source_work_links_complete', allEqual(counts.navigation_rows, [
      counts.rows_with_source_ref,
      counts.rows_with_source_url,
      counts.rows_with_local_work_anchor,
      counts.rows_with_work_metadata,
    ]) ? 'passed' : 'failed', `source/sourceURL/workAnchor/workMeta ${counts.rows_with_source_ref}/${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}/${counts.rows_with_work_metadata}`),
    check('status_route_linkage_complete', allEqual(counts.navigation_rows, [
      counts.rows_with_usage_frame,
      counts.rows_with_status_score,
      counts.rows_with_route_ids,
      counts.rows_with_route_linked_observed_usage,
    ]) && counts.route_ids > 0 ? 'passed' : 'failed', `usageFrame/statusScore/routeIds/routeLinked ${counts.rows_with_usage_frame}/${counts.rows_with_status_score}/${counts.rows_with_route_ids}/${counts.rows_with_route_linked_observed_usage}; route IDs ${counts.route_ids}`),
    check('provenance_license_complete', counts.rows_with_version_metadata === counts.navigation_rows && counts.rows_with_license_metadata === counts.navigation_rows && counts.rows_with_forbidden_license === 0 && counts.licenses > 1 && counts.version_sources > 1 ? 'passed' : 'failed', `version/license/forbidden/licenseKinds/versionSources ${counts.rows_with_version_metadata}/${counts.rows_with_license_metadata}/${counts.rows_with_forbidden_license}/${counts.licenses}/${counts.version_sources}`),
    check('audit_only_ambiguity_preserved', counts.audit_only_ambiguous_rows_available > 0 && counts.audit_only_ambiguous_rows_emitted === 0 ? 'passed' : 'failed', `available/emitted ${counts.audit_only_ambiguous_rows_available}/${counts.audit_only_ambiguous_rows_emitted}`),
    check('usage_only_boundary', counts.rows_with_observed_usage_label === counts.navigation_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.rows_with_observed_usage_label}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
    check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `queue mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, packet) {
  const lines = [
    '# Definition Workbench Usage Concordance Navigation Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Lane: Agent 3 usage navigation.',
    '- Source: existing usage concordance only.',
    '- Target expansion: none.',
    '- Row label: observed usage only.',
    '- Related Agent 2 linkage: route IDs only.',
    '- Ambiguous rows: audit-only, not emitted here.',
    '- Reader-facing rows: 0.',
    '',
    '## Counts',
    '',
    `- Navigation rows: ${packet.counts.navigation_rows}`,
    `- Selected support rows marked: ${packet.counts.selected_support_rows}/${packet.counts.occurrence_support_rows}`,
    `- Supported / candidate / weak: ${packet.counts.supported_rows}/${packet.counts.candidate_rows}/${packet.counts.weak_rows}`,
    `- Source refs / works / categories: ${packet.counts.source_refs}/${packet.counts.works}/${packet.counts.categories}`,
    `- Clusters / usage frames / route IDs: ${packet.counts.clusters}/${packet.counts.usage_frames}/${packet.counts.route_ids}`,
    `- Licenses / license URLs / version sources: ${packet.counts.licenses}/${packet.counts.license_urls}/${packet.counts.version_sources}`,
    `- Audit-only ambiguous rows available/emitted: ${packet.counts.audit_only_ambiguous_rows_available}/${packet.counts.audit_only_ambiguous_rows_emitted}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${packet.counts.reader_facing_rows}/${packet.counts.route_payload_field_hits}/${packet.counts.forbidden_authority_field_hits}`,
    '',
    '## License Counts',
    '',
    ...Object.entries(packet.counts.license_counts).map(([license, count]) => `- ${license}: ${count}`),
    '',
    '## Category Counts',
    '',
    ...Object.entries(packet.counts.category_counts).map(([category, count]) => `- ${category}: ${count}`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...packet.checks.map((row) => `| ${mdCell(row.id)} | ${row.status} | ${mdCell(row.detail)} |`),
    '',
    'This packet is a usage-navigation/concordance layer. It does not emit definition authority fields, does not rank routes, does not select visible answers, and does not make ambiguous rows reader-facing.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function countValues(values) {
  const map = new Map();
  for (const value of values) map.set(value, (map.get(value) || 0) + 1);
  return Object.fromEntries([...map.entries()].sort((left, right) => Number(right[1]) - Number(left[1]) || String(left[0]).localeCompare(String(right[0]))));
}

function firstPathSegment(value) {
  return String(value || '').split('/')[0] || null;
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function check(id, status, detail) {
  return { id, status, detail };
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
    if (arg.startsWith('--concordance=')) parsed.concordance = valueAfterEquals(arg);
    else if (arg.startsWith('--concordance-manifest=')) parsed.concordanceManifest = valueAfterEquals(arg);
    else if (arg.startsWith('--occurrence-support-packet=')) parsed.occurrenceSupportPacket = valueAfterEquals(arg);
    else if (arg.startsWith('--output=')) parsed.output = valueAfterEquals(arg);
    else if (arg.startsWith('--report=')) parsed.report = valueAfterEquals(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
}
