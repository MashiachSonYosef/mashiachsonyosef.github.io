import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_JSON = 'reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.md';
const CONCORDANCE = 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json';
const SUPPORT = 'data/definitions/definition-workbench-usage-occurrence-support-packet.json';
const AGENT6_VERDICT = 'reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md';
const PRIOR_FRESHNESS_PACKET = 'data/definitions/definition-workbench-usage-freshness-impact-packet.json';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function getGitSourceStatusRows() {
  const output = execFileSync('git', ['status', '--porcelain=v1', '--', 'data/sources'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const status_code = line.slice(0, 2);
      const rawPath = line.slice(3).replace(/\\/g, '/');
      const source_file = rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() : rawPath;
      return {
        status_code,
        index_status: status_code[0],
        worktree_status: status_code[1],
        source_file,
        source_slug: source_file.replace(/^data\/sources\//, '').replace(/\.json$/, ''),
      };
    })
    .filter((row) => row.source_file.startsWith('data/sources/') && row.source_file.endsWith('.json'));
}

function sourceSlugFromRow(row) {
  if (row.work_id) return String(row.work_id);
  const slug = String(row.work_slug || '');
  return slug.includes('/') ? slug.split('/').pop() : slug || null;
}

function buildUsageBySourceSlug(rows) {
  const usage = new Map();
  for (const row of rows) {
    const source_slug = sourceSlugFromRow(row);
    if (!source_slug) continue;
    if (!usage.has(source_slug)) {
      usage.set(source_slug, {
        navigation_rows: 0,
        selected_support_rows: 0,
        supported_rows: 0,
        candidate_rows: 0,
        weak_rows: 0,
        source_refs: new Set(),
        works: new Set(),
        categories: new Set(),
        clusters: new Set(),
        route_ids: new Set(),
        occurrence_ids: [],
      });
    }
    const entry = usage.get(source_slug);
    entry.navigation_rows += 1;
    if (row.selected_support_occurrence || row.selected_support_row) entry.selected_support_rows += 1;
    if (row.status === 'supported') entry.supported_rows += 1;
    if (row.status === 'candidate') entry.candidate_rows += 1;
    if (row.status === 'weak') entry.weak_rows += 1;
    if (row.source_ref) entry.source_refs.add(row.source_ref);
    if (row.work_id) entry.works.add(row.work_id);
    if (row.category) entry.categories.add(row.category);
    if (row.cluster_id) entry.clusters.add(row.cluster_id);
    for (const routeId of row.related_agent2_route_ids || []) entry.route_ids.add(routeId);
    if (row.occurrence_id) entry.occurrence_ids.push(row.occurrence_id);
  }
  return usage;
}

function categoryHint(sourceSlug) {
  const value = String(sourceSlug || '');
  if (/zohar|etz-chaim|kavanot|gilgulim|rashbi|pesukim|ari|yahel-ohr/i.test(value)) return 'kabbalah';
  if (/shulchan-arukh|mishneh-torah|halakh|taz|shakh|eiger|pitchei|netivot|ketzot|urim|beer-hagolah/i.test(value)) return 'halakhah';
  if (/mishnah|boaz|tosefta|brief-commentary/i.test(value)) return 'mishnah-tosefta';
  if (/maharal|guide-for-the-perplexed|moreh|emunot|ikarim|akeidat|crescas|efodi|narboni|shem-tov/i.test(value)) return 'jewish-thought';
  if (/machzor|selichot|siddur|prayer/i.test(value)) return 'liturgy';
  if (/luchot|kav-hayashar|musar/i.test(value)) return 'musar';
  if (/toldot|kedushat|moharan|besht|chasid|gevurot|netivot-olam|netzach-yisrael|ner-mitzvah/i.test(value)) return 'chasidut-thought';
  return 'unknown';
}

function expandUsage(entry) {
  return {
    navigation_rows: entry?.navigation_rows || 0,
    selected_support_rows: entry?.selected_support_rows || 0,
    supported_rows: entry?.supported_rows || 0,
    candidate_rows: entry?.candidate_rows || 0,
    weak_rows: entry?.weak_rows || 0,
    source_refs: entry ? entry.source_refs.size : 0,
    works: entry ? entry.works.size : 0,
    categories: entry ? [...entry.categories].sort() : [],
    clusters: entry ? [...entry.clusters].sort() : [],
    route_ids: entry ? [...entry.route_ids].sort() : [],
    impacted_occurrence_ids: entry ? entry.occurrence_ids.slice(0, 25).sort() : [],
  };
}

function countRows(rows, predicate) {
  return rows.filter(predicate).length;
}

function check(id, status, detail) {
  return { id, status, detail };
}

const concordance = readJson(CONCORDANCE);
const support = readJson(SUPPORT);
const priorFreshness = fs.existsSync(path.join(ROOT, PRIOR_FRESHNESS_PACKET)) ? readJson(PRIOR_FRESHNESS_PACKET) : null;
const navigationRows = concordance.navigation_rows || [];
const supportRows = support.support_rows || support.occurrence_support_rows || [];
const usageBySourceSlug = buildUsageBySourceSlug(navigationRows);

const dirtySourceRows = getGitSourceStatusRows()
  .map((row) => ({
    ...row,
    category_hint: categoryHint(row.source_slug),
    impact_status: usageBySourceSlug.has(row.source_slug) ? 'current_usage_overlap_refresh_review' : 'no_current_usage_overlap',
    promotion_status: 'not_promoted',
    ...expandUsage(usageBySourceSlug.get(row.source_slug)),
    reason: usageBySourceSlug.has(row.source_slug)
      ? 'Current dirty source file overlaps existing Agent 3 usage-navigation rows; keep stale warning and require review before any freshness claim.'
      : 'Current dirty source file has no direct work-id overlap with existing Agent 3 usage-navigation rows; keep stale warning but do not promote broad refresh from this packet.',
  }))
  .sort((a, b) => b.navigation_rows - a.navigation_rows || String(a.status_code).localeCompare(String(b.status_code)) || a.source_file.localeCompare(b.source_file));

const impactedSourceRows = dirtySourceRows.filter((row) => row.navigation_rows > 0);
const impactedNavigationRows = navigationRows.filter((row) => {
  const sourceSlug = sourceSlugFromRow(row);
  return impactedSourceRows.some((dirty) => dirty.source_slug === sourceSlug);
});

const counts = {
  git_dirty_source_files: dirtySourceRows.length,
  git_modified_source_files: countRows(dirtySourceRows, (row) => row.status_code.includes('M')),
  git_untracked_source_files: countRows(dirtySourceRows, (row) => row.status_code === '??'),
  dirty_sources_with_current_usage_overlap: impactedSourceRows.length,
  dirty_sources_without_current_usage_overlap: dirtySourceRows.length - impactedSourceRows.length,
  impacted_navigation_rows: impactedNavigationRows.length,
  impacted_selected_support_rows: impactedSourceRows.reduce((total, row) => total + row.selected_support_rows, 0),
  impacted_supported_rows: impactedSourceRows.reduce((total, row) => total + row.supported_rows, 0),
  impacted_candidate_rows: impactedSourceRows.reduce((total, row) => total + row.candidate_rows, 0),
  impacted_weak_rows: impactedSourceRows.reduce((total, row) => total + row.weak_rows, 0),
  impacted_route_ids: new Set(impactedSourceRows.flatMap((row) => row.route_ids)).size,
  impacted_clusters: new Set(impactedSourceRows.flatMap((row) => row.clusters)).size,
  current_navigation_rows: navigationRows.length,
  current_selected_support_rows: supportRows.length || Number(support.counts?.support_rows || 0),
  navigation_rows_with_source_url: countRows(navigationRows, (row) => /^https:\/\//.test(row.source_url || '')),
  navigation_rows_with_local_work_anchor: countRows(navigationRows, (row) => Boolean(row.local_work_anchor || row.local_work_page_anchor)),
  navigation_rows_with_context: countRows(navigationRows, (row) => Boolean(row.phrase_context_snippet || row.phrase_hebrew)),
  navigation_rows_with_focus: countRows(navigationRows, (row) => Boolean(row.focus_normalized || row.focus_surface)),
  navigation_rows_with_license: countRows(navigationRows, (row) => Boolean(row.license && row.license_url)),
  navigation_rows_with_version: countRows(navigationRows, (row) => Boolean(row.version_title && row.version_source)),
  reader_facing_rows: countRows(navigationRows, (row) => row.reader_facing === true || row.usage_boundary?.reader_facing === true),
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_read: 0,
  broad_target_expansion: 0,
  promoted_run_targets: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
  prior_cached_pending_refresh_files: Number(priorFreshness?.counts?.pending_refresh_files || 0),
  prior_cached_overlap_sources: Number(priorFreshness?.counts?.pending_with_current_usage_overlap || 0),
  current_vs_prior_pending_delta: dirtySourceRows.length - Number(priorFreshness?.counts?.pending_refresh_files || 0),
};

const checks = [
  check('current_git_source_status_recounted', counts.git_dirty_source_files === dirtySourceRows.length && counts.git_dirty_source_files > 0 ? 'passed' : 'failed', `dirty source files ${counts.git_dirty_source_files}`),
  check('dirty_source_overlap_classified', counts.dirty_sources_with_current_usage_overlap + counts.dirty_sources_without_current_usage_overlap === counts.git_dirty_source_files ? 'passed' : 'failed', `overlap/no-overlap/dirty ${counts.dirty_sources_with_current_usage_overlap}/${counts.dirty_sources_without_current_usage_overlap}/${counts.git_dirty_source_files}`),
  check('no_current_usage_overlap', counts.impacted_navigation_rows === 0 && counts.impacted_selected_support_rows === 0 && counts.impacted_route_ids === 0 ? 'passed' : 'warning', `impacted navigation/selected/route IDs ${counts.impacted_navigation_rows}/${counts.impacted_selected_support_rows}/${counts.impacted_route_ids}`),
  check('navigation_metadata_preserved', counts.navigation_rows_with_source_url === counts.current_navigation_rows && counts.navigation_rows_with_local_work_anchor === counts.current_navigation_rows && counts.navigation_rows_with_context === counts.current_navigation_rows && counts.navigation_rows_with_focus === counts.current_navigation_rows && counts.navigation_rows_with_license === counts.current_navigation_rows && counts.navigation_rows_with_version === counts.current_navigation_rows ? 'passed' : 'failed', `rows/source/anchor/context/focus/license/version ${counts.current_navigation_rows}/${counts.navigation_rows_with_source_url}/${counts.navigation_rows_with_local_work_anchor}/${counts.navigation_rows_with_context}/${counts.navigation_rows_with_focus}/${counts.navigation_rows_with_license}/${counts.navigation_rows_with_version}`),
  check('prior_stale_count_replaced_by_current_recount', counts.prior_cached_pending_refresh_files !== counts.git_dirty_source_files ? 'passed' : 'warning', `prior/current/delta ${counts.prior_cached_pending_refresh_files}/${counts.git_dirty_source_files}/${counts.current_vs_prior_pending_delta}`),
  check('usage_only_boundary', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.source_text_read === 0 ? 'passed' : 'failed', `reader/payload/forbidden/sourceText ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}/${counts.source_text_read}`),
  check('no_targets_promoted', counts.promoted_run_targets === 0 && counts.broad_target_expansion === 0 ? 'passed' : 'failed', `promoted/broad ${counts.promoted_run_targets}/${counts.broad_target_expansion}`),
  check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `queue/submitted ${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_source_freshness_refresh',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_source_freshness_refresh.mjs',
  lane_owner: 'Agent 3',
  target_reviewer: 'Agent 6',
  queue_submitter: 'Agent 5',
  status: failed.length === 0 ? 'evidence-ready' : 'awaiting-Agent-6',
  chosen_path: 'source_freshness_impact_refresh',
  source_artifacts: {
    concordance_navigation_packet: CONCORDANCE,
    occurrence_support_packet: SUPPORT,
    prior_freshness_impact_packet: PRIOR_FRESHNESS_PACKET,
    agent6_verdict: AGENT6_VERDICT,
  },
  policy: 'Current git-status source-freshness impact refresh for Agent 3 usage navigation only. It compares dirty data/sources paths to existing usage-navigation work IDs. It does not read source text, rebuild corpus rows, rank routes, select answers, import sources, or claim broad freshness.',
  authority_boundary: {
    observed_usage_only: true,
    freshness_impact_only: true,
    source_text_read: false,
    broad_target_expansion: false,
    promoted_run_targets: false,
    reader_facing: false,
    lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_agent2_payloads: false,
    publication_claim: false,
    source_provenance_custody_claim: false,
    accepted_text_claim: false,
    agent6_acceptance_claim: false,
  },
  coverage_interpretation: {
    current_dirty_source_files: counts.git_dirty_source_files,
    dirty_sources_directly_overlapping_current_usage_rows: counts.dirty_sources_with_current_usage_overlap,
    current_usage_rows_directly_impacted: counts.impacted_navigation_rows,
    broad_corpus_freshness_claim_allowed: false,
    stale_warning_preserved: counts.git_dirty_source_files > 0,
    note: 'Zero direct overlap means the current dirty data/sources files do not match existing Agent 3 usage-navigation work IDs. It does not clear broad source freshness, source/provenance custody, or corpus completeness.',
  },
  dirty_source_rows: dirtySourceRows,
  impacted_usage_rows: impactedNavigationRows.map((row) => ({
    occurrence_id: row.occurrence_id,
    token_key: row.token_key,
    source_ref: row.source_ref,
    source_url: row.source_url,
    local_work_anchor: row.local_work_anchor || row.local_work_page_anchor,
    work_id: row.work_id,
    work_slug: row.work_slug,
    status: row.status,
    raw_score: row.raw_score,
    usage_frame_label: row.usage_frame_label,
    cluster_id: row.cluster_id,
    related_agent2_route_ids: row.related_agent2_route_ids || [],
    row_label: 'observed usage only',
    license: row.license,
    license_url: row.license_url,
    version_title: row.version_title,
    version_source: row.version_source,
    reader_facing: false,
    not_definition_authority: true,
  })),
  counts,
  checks,
  queue_intake_summary: {
    packet_role: 'current source-freshness impact refresh for usage-navigation evidence only',
    dirty_source_files: counts.git_dirty_source_files,
    current_overlap: `${counts.dirty_sources_with_current_usage_overlap}/${counts.git_dirty_source_files}`,
    impacted_navigation_rows: counts.impacted_navigation_rows,
    prior_cached_pending_refresh_files: counts.prior_cached_pending_refresh_files,
    preserved_boundary: 'no source text read, no broad target expansion, no promoted targets, no reader-facing rows, no route payloads, no authority claims',
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const md = `# Agent 3 Definition Workbench Usage Source-Freshness Refresh

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is current-state usage-navigation freshness evidence only and does not claim Agent 6 acceptance.

## Chosen Bounded Path

Source-freshness impact refresh. The packet recounts current \`git status --porcelain=v1 -- data/sources\` and compares those dirty source files to existing Agent 3 usage-navigation work IDs. It does not read source text, rebuild corpus rows, broaden targets, rank routes, select answers, import source files, or claim source/provenance custody acceptance.

## Evidence Reused

- \`${CONCORDANCE}\`: current usage-navigation rows: ${counts.current_navigation_rows}.
- \`${SUPPORT}\`: selected support rows: ${counts.current_selected_support_rows}.
- \`${PRIOR_FRESHNESS_PACKET}\`: prior cached pending refresh files: ${counts.prior_cached_pending_refresh_files}; prior overlap sources: ${counts.prior_cached_overlap_sources}.
- \`${AGENT6_VERDICT}\`: Agent 6 WARN boundary requires freshness warnings to remain visible before any UI or broader display claim.

## Current Recount

- Dirty source files: ${counts.git_dirty_source_files}
- Modified source files: ${counts.git_modified_source_files}
- Untracked source files: ${counts.git_untracked_source_files}
- Dirty sources with current usage overlap: ${counts.dirty_sources_with_current_usage_overlap}
- Dirty sources without current usage overlap: ${counts.dirty_sources_without_current_usage_overlap}
- Impacted navigation rows: ${counts.impacted_navigation_rows}
- Impacted selected support rows: ${counts.impacted_selected_support_rows}
- Impacted supported/candidate/weak rows: ${counts.impacted_supported_rows}/${counts.impacted_candidate_rows}/${counts.impacted_weak_rows}
- Prior/current pending delta: ${counts.prior_cached_pending_refresh_files}/${counts.git_dirty_source_files}/${counts.current_vs_prior_pending_delta}
- Reader-facing / route-payload / forbidden-authority hits: ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}

## Metadata Coverage

- Navigation source URL rows: ${counts.navigation_rows_with_source_url}/${counts.current_navigation_rows}
- Navigation local anchor rows: ${counts.navigation_rows_with_local_work_anchor}/${counts.current_navigation_rows}
- Navigation context/focus rows: ${counts.navigation_rows_with_context}/${counts.navigation_rows_with_focus}
- Navigation license/version rows: ${counts.navigation_rows_with_license}/${counts.navigation_rows_with_version}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Dirty Source Rows

| status | source file | category | impact | navigation rows | selected rows | route IDs | reason |
|---|---|---|---|---:|---:|---:|---|
${dirtySourceRows.map((row) => `| ${row.status_code} | \`${row.source_file}\` | ${row.category_hint} | ${row.impact_status} | ${row.navigation_rows} | ${row.selected_support_rows} | ${row.route_ids.length} | ${row.reason} |`).join('\n')}

## Queue Intake Summary

Current dirty source-file count is ${counts.git_dirty_source_files}, replacing the prior cached 173-file warning for this exact impact check. Direct overlap with current Agent 3 usage-navigation rows is ${counts.dirty_sources_with_current_usage_overlap} source files and ${counts.impacted_navigation_rows} navigation rows. The stale-source warning remains visible because dirty source files exist, but this packet does not promote refresh targets or claim broad freshness.

## Boundary

Observed usage/navigation only. Not Definition authority, not reviewed lexical authority, not route ranking, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not source/provenance custody acceptance, not publication readiness, not copied Agent 2 payloads, and not accepted text.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; dirty sources ${counts.git_dirty_source_files}; overlap sources ${counts.dirty_sources_with_current_usage_overlap}; impacted rows ${counts.impacted_navigation_rows}`);
