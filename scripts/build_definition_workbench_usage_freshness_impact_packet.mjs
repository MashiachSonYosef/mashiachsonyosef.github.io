#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  sourceFreshness: '.local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.json',
  concordanceNavigationPacket: 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json',
  occurrenceSupportPacket: 'data/definitions/definition-workbench-usage-occurrence-support-packet.json',
  output: 'data/definitions/definition-workbench-usage-freshness-impact-packet.json',
  report: 'reports/definition-workbench-usage-freshness-impact-packet.md',
  maxReportRows: 80,
};

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
const sourceFreshness = readJson(options.sourceFreshness);
const concordanceNavigationPacket = readJson(options.concordanceNavigationPacket);
const occurrenceSupportPacket = readJson(options.occurrenceSupportPacket);

assertArtifact(sourceFreshness, 'workbench_source_freshness_report', options.sourceFreshness);
assertArtifact(concordanceNavigationPacket, 'definition_workbench_usage_concordance_navigation_packet', options.concordanceNavigationPacket);
assertArtifact(occurrenceSupportPacket, 'definition_workbench_usage_occurrence_support_packet', options.occurrenceSupportPacket);

const usageBySourceSlug = buildUsageBySourceSlug(concordanceNavigationPacket.navigation_rows || []);
const pendingRows = (sourceFreshness.pending_refresh_files || []).map((pending) => buildPendingRow(pending));
pendingRows.sort(comparePendingRows);

const counts = buildCounts(pendingRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_freshness_impact_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_freshness_impact_packet.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    source_freshness: options.sourceFreshness,
    concordance_navigation_packet: options.concordanceNavigationPacket,
    occurrence_support_packet: options.occurrenceSupportPacket,
  },
  policy: 'Freshness-impact packet for Definition Workbench usage navigation. It compares current stale source inventory to existing usage-navigation work IDs only. It does not read source text, scan tokens, expand targets, promote refresh runs, rank routes, select answers, emit definitions, translate, or claim broad corpus freshness.',
  authority_boundary: {
    usage_navigation_only: true,
    freshness_impact_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    source_text_read: false,
    broad_target_expansion: false,
    promotes_targets: false,
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
  coverage_interpretation: {
    source_freshness_status: sourceFreshness.status || null,
    current_usage_rows_directly_overlapping_pending_sources: counts.impacted_navigation_rows,
    selected_support_rows_directly_overlapping_pending_sources: counts.impacted_selected_support_rows,
    current_concordance_direct_overlap_with_pending_sources: counts.impacted_navigation_rows > 0,
    broad_corpus_freshness_claim_allowed: false,
    target_refresh_promoted: false,
    note: 'Zero overlap means the current usage-navigation rows do not directly reference the pending modified source-file slugs. It does not make the corpus exhaustive or current.',
  },
  pending_source_rows: pendingRows,
  impacted_usage_rows: buildImpactedUsageRows(),
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
console.log(`Definition Workbench usage freshness impact ${artifact.quality.status}; pending ${artifact.counts.pending_refresh_files}; impacted usage rows ${artifact.counts.impacted_navigation_rows}; promoted ${artifact.counts.promoted_run_targets}`);

function buildUsageBySourceSlug(rows) {
  const map = new Map();
  for (const row of rows) {
    const sourceSlug = sourceSlugFromWork(row.work_id, row.work_slug);
    if (!sourceSlug) continue;
    if (!map.has(sourceSlug)) {
      map.set(sourceSlug, {
        rows: 0,
        selected_support_rows: 0,
        supported: 0,
        candidate: 0,
        weak: 0,
        source_refs: new Set(),
        works: new Set(),
        categories: new Set(),
        clusters: new Set(),
        route_ids: new Set(),
        occurrence_ids: [],
      });
    }
    const entry = map.get(sourceSlug);
    entry.rows += 1;
    if (row.selected_support_occurrence || row.selected_support_row) entry.selected_support_rows += 1;
    if (Object.hasOwn(entry, row.status)) entry[row.status] += 1;
    if (row.source_ref) entry.source_refs.add(row.source_ref);
    if (row.work_slug) entry.works.add(row.work_slug);
    if (row.category) entry.categories.add(row.category);
    if (row.cluster_id) entry.clusters.add(row.cluster_id);
    for (const routeId of row.related_agent2_route_ids || []) entry.route_ids.add(routeId);
    if (row.occurrence_id) entry.occurrence_ids.push(row.occurrence_id);
  }
  return map;
}

function buildPendingRow(pending) {
  const sourceFile = String(pending.source_file || '');
  const sourceSlug = sourceFile.replace(/^data\/sources\//, '').replace(/\.json$/, '');
  const usage = usageBySourceSlug.get(sourceSlug) || null;
  const currentUsageRows = usage?.rows || 0;
  return {
    source_file: sourceFile,
    source_slug: sourceSlug,
    category_hint: categoryHint(sourceSlug),
    modified_at: pending.modified_at || null,
    created_at: pending.created_at || null,
    bytes: Number(pending.bytes || 0),
    impact_status: currentUsageRows > 0 ? 'current_usage_overlap_refresh_review' : 'no_current_usage_overlap',
    promotion_status: 'not_promoted',
    current_usage_rows: currentUsageRows,
    selected_support_rows: usage?.selected_support_rows || 0,
    supported_rows: usage?.supported || 0,
    candidate_rows: usage?.candidate || 0,
    weak_rows: usage?.weak || 0,
    source_refs: usage ? usage.source_refs.size : 0,
    works: usage ? usage.works.size : 0,
    categories: usage ? [...usage.categories].sort() : [],
    clusters: usage ? [...usage.clusters].sort() : [],
    route_ids: usage ? [...usage.route_ids].sort() : [],
    impacted_occurrence_ids: usage ? usage.occurrence_ids.slice(0, 25).sort() : [],
    reason: currentUsageRows > 0
      ? 'Pending source file overlaps current usage-navigation rows; review before claiming current coverage. No refresh target is promoted here.'
      : 'Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact.',
  };
}

function buildImpactedUsageRows() {
  const impactedSourceSlugs = new Set(pendingRows.filter((row) => row.current_usage_rows > 0).map((row) => row.source_slug));
  if (!impactedSourceSlugs.size) return [];
  return (concordanceNavigationPacket.navigation_rows || [])
    .filter((row) => impactedSourceSlugs.has(sourceSlugFromWork(row.work_id, row.work_slug)))
    .map((row) => ({
      occurrence_id: row.occurrence_id,
      token_key: row.token_key,
      source_ref: row.source_ref,
      work_id: row.work_id,
      work_slug: row.work_slug,
      status: row.status,
      raw_score: row.raw_score,
      usage_frame_label: row.usage_frame_label,
      cluster_id: row.cluster_id,
      related_agent2_route_ids: row.related_agent2_route_ids || [],
      row_label: 'observed usage only',
      source_url: row.source_url,
      local_work_anchor: row.local_work_anchor || row.local_work_page_anchor,
      license: row.license,
      license_url: row.license_url,
      version_title: row.version_title,
      version_source: row.version_source,
      reader_facing: false,
      not_definition_authority: true,
    }));
}

function buildCounts(rows) {
  const impacted = rows.filter((row) => row.current_usage_rows > 0);
  const allRouteIds = new Set();
  const allClusters = new Set();
  for (const row of impacted) {
    for (const routeId of row.route_ids || []) allRouteIds.add(routeId);
    for (const cluster of row.clusters || []) allClusters.add(cluster);
  }
  return {
    source_freshness_status_stale: sourceFreshness.status === 'stale' ? 1 : 0,
    pending_refresh_files: rows.length,
    source_freshness_pending_files: Number(sourceFreshness.current_inventory?.files_modified_after_artifact || 0),
    pending_with_current_usage_overlap: impacted.length,
    pending_without_current_usage_overlap: rows.filter((row) => row.current_usage_rows === 0).length,
    impacted_navigation_rows: sum(impacted.map((row) => row.current_usage_rows)),
    impacted_selected_support_rows: sum(impacted.map((row) => row.selected_support_rows)),
    impacted_supported_rows: sum(impacted.map((row) => row.supported_rows)),
    impacted_candidate_rows: sum(impacted.map((row) => row.candidate_rows)),
    impacted_weak_rows: sum(impacted.map((row) => row.weak_rows)),
    impacted_route_ids: allRouteIds.size,
    impacted_clusters: allClusters.size,
    current_navigation_rows: Number(concordanceNavigationPacket.counts?.navigation_rows || 0),
    current_selected_support_rows: Number(occurrenceSupportPacket.counts?.support_rows || 0),
    current_navigation_rows_with_source_url: Number(concordanceNavigationPacket.counts?.rows_with_source_url || 0),
    current_navigation_rows_with_local_work_anchor: Number(concordanceNavigationPacket.counts?.rows_with_local_work_anchor || 0),
    current_navigation_rows_with_license_metadata: Number(concordanceNavigationPacket.counts?.rows_with_license_metadata || 0),
    current_navigation_rows_with_version_metadata: Number(concordanceNavigationPacket.counts?.rows_with_version_metadata || 0),
    review_only_not_promoted: rows.filter((row) => row.promotion_status === 'not_promoted').length,
    promoted_run_targets: rows.filter((row) => row.promotion_status !== 'not_promoted').length,
    source_text_read: 0,
    broad_target_expansion: 0,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
    queue_mutations: 0,
    submitted_to_agent6: 0,
  };
}

function buildChecks(counts) {
  return [
    check('source_freshness_stale_visible', counts.source_freshness_status_stale === 1 && counts.pending_refresh_files > 0 ? 'passed' : 'failed', `status ${sourceFreshness.status}; pending ${counts.pending_refresh_files}`),
    check('pending_rows_match_source_freshness', counts.pending_refresh_files === counts.source_freshness_pending_files ? 'passed' : 'failed', `rows ${counts.pending_refresh_files}; freshness ${counts.source_freshness_pending_files}`),
    check('current_usage_direct_overlap_classified', counts.pending_with_current_usage_overlap + counts.pending_without_current_usage_overlap === counts.pending_refresh_files ? 'passed' : 'failed', `overlap/no-overlap/pending ${counts.pending_with_current_usage_overlap}/${counts.pending_without_current_usage_overlap}/${counts.pending_refresh_files}`),
    check('no_current_usage_overlap', counts.impacted_navigation_rows === 0 && counts.impacted_selected_support_rows === 0 && counts.impacted_route_ids === 0 ? 'passed' : 'warning', `impacted navigation/selected/routeIds ${counts.impacted_navigation_rows}/${counts.impacted_selected_support_rows}/${counts.impacted_route_ids}`),
    check('current_navigation_metadata_preserved', counts.current_navigation_rows > 0 && counts.current_navigation_rows_with_source_url === counts.current_navigation_rows && counts.current_navigation_rows_with_local_work_anchor === counts.current_navigation_rows && counts.current_navigation_rows_with_license_metadata === counts.current_navigation_rows && counts.current_navigation_rows_with_version_metadata === counts.current_navigation_rows ? 'passed' : 'failed', `rows/source/anchor/license/version ${counts.current_navigation_rows}/${counts.current_navigation_rows_with_source_url}/${counts.current_navigation_rows_with_local_work_anchor}/${counts.current_navigation_rows_with_license_metadata}/${counts.current_navigation_rows_with_version_metadata}`),
    check('no_targets_promoted', counts.review_only_not_promoted === counts.pending_refresh_files && counts.promoted_run_targets === 0 && counts.broad_target_expansion === 0 ? 'passed' : 'failed', `review-only/promoted/broad ${counts.review_only_not_promoted}/${counts.promoted_run_targets}/${counts.broad_target_expansion}`),
    check('usage_only_boundary', counts.source_text_read === 0 && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `sourceText/reader/payload/forbidden ${counts.source_text_read}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
    check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `queue mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, packet) {
  const lines = [
    '# Definition Workbench Usage Freshness Impact Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Lane: Agent 3 usage navigation.',
    '- Source: existing freshness report and existing usage-navigation packet only.',
    '- Source text read: 0.',
    '- Target expansion: none.',
    '- Promoted run targets: 0.',
    '- Reader-facing rows: 0.',
    '- Definition authority: false.',
    '',
    '## Counts',
    '',
    `- Source freshness status: ${sourceFreshness.status}`,
    `- Pending refresh files: ${packet.counts.pending_refresh_files}`,
    `- Pending files with current usage overlap: ${packet.counts.pending_with_current_usage_overlap}`,
    `- Pending files without current usage overlap: ${packet.counts.pending_without_current_usage_overlap}`,
    `- Impacted navigation rows: ${packet.counts.impacted_navigation_rows}`,
    `- Impacted selected support rows: ${packet.counts.impacted_selected_support_rows}`,
    `- Impacted supported / candidate / weak rows: ${packet.counts.impacted_supported_rows}/${packet.counts.impacted_candidate_rows}/${packet.counts.impacted_weak_rows}`,
    `- Current navigation rows: ${packet.counts.current_navigation_rows}`,
    `- Current selected support rows: ${packet.counts.current_selected_support_rows}`,
    `- Review-only / promoted targets: ${packet.counts.review_only_not_promoted}/${packet.counts.promoted_run_targets}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${packet.counts.reader_facing_rows}/${packet.counts.route_payload_field_hits}/${packet.counts.forbidden_authority_field_hits}`,
    '',
    '## Interpretation',
    '',
    packet.coverage_interpretation.note,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...packet.checks.map((row) => `| ${mdCell(row.id)} | ${row.status} | ${mdCell(row.detail)} |`),
    '',
    '## Pending Source Rows',
    '',
    '| impact | source file | category hint | current usage rows | selected support rows | supported | candidate | weak | route ids | reason |',
    '|---|---|---|---:|---:|---:|---:|---:|---|---|',
    ...packet.pending_source_rows.slice(0, options.maxReportRows).map((row) => `| ${[
      row.impact_status,
      row.source_file,
      row.category_hint,
      row.current_usage_rows,
      row.selected_support_rows,
      row.supported_rows,
      row.candidate_rows,
      row.weak_rows,
      row.route_ids.join(', '),
      row.reason,
    ].map(mdCell).join(' | ')} |`),
    '',
    'This packet narrows the stale-source warning for current usage rows only. It does not clear broad corpus freshness, source/provenance acceptance, definition authority, public UI acceptance, or publication readiness.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function comparePendingRows(a, b) {
  return b.current_usage_rows - a.current_usage_rows
    || String(a.impact_status).localeCompare(String(b.impact_status))
    || String(b.modified_at || '').localeCompare(String(a.modified_at || ''))
    || String(a.source_file).localeCompare(String(b.source_file));
}

function sourceSlugFromWork(workId, workSlug) {
  if (workId) return String(workId);
  const slug = String(workSlug || '');
  return slug.includes('/') ? slug.split('/').pop() : slug || null;
}

function categoryHint(sourceSlug) {
  const value = String(sourceSlug || '');
  if (/zohar|etz-chaim|kavanot|gilgulim|rashbi|pesukim|ari|yahel-ohr/i.test(value)) return 'kabbalah';
  if (/shulchan-arukh|mishneh-torah|halakh|taz|shakh|eiger|pitchei|netivot|ketzot|urim/i.test(value)) return 'halakhah';
  if (/mishnah|boaz|tosefta|brief-commentary/i.test(value)) return 'mishnah-tosefta';
  if (/maharal|guide-for-the-perplexed|moreh|emunot|ikarim|akeidat/i.test(value)) return 'jewish-thought';
  if (/machzor|selichot|siddur|prayer/i.test(value)) return 'liturgy';
  if (/luchot|kav-hayashar|musar/i.test(value)) return 'musar';
  if (/toldot|kedushat|moharan|besht|chasid/i.test(value)) return 'chasidut';
  return 'unknown';
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

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function assertArtifact(value, artifactType, relativePath) {
  if (value.artifact_type !== artifactType) {
    throw new Error(`${relativePath} must be ${artifactType}`);
  }
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
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
    if (arg.startsWith('--source-freshness=')) parsed.sourceFreshness = valueAfterEquals(arg);
    else if (arg.startsWith('--concordance-navigation-packet=')) parsed.concordanceNavigationPacket = valueAfterEquals(arg);
    else if (arg.startsWith('--occurrence-support-packet=')) parsed.occurrenceSupportPacket = valueAfterEquals(arg);
    else if (arg.startsWith('--output=')) parsed.output = valueAfterEquals(arg);
    else if (arg.startsWith('--report=')) parsed.report = valueAfterEquals(arg);
    else if (arg.startsWith('--max-report-rows=')) parsed.maxReportRows = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['sourceFreshness', 'concordanceNavigationPacket', 'occurrenceSupportPacket', 'output', 'report']) {
    parsed[key] = cleanRelativePath(parsed[key]);
  }
  if (!Number.isInteger(parsed.maxReportRows) || parsed.maxReportRows < 0) {
    throw new Error('--max-report-rows must be a non-negative integer');
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}
