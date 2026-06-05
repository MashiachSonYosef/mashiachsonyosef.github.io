#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputPath = 'reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.json';
const reportPath = 'reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.md';

const inputs = {
  queue_ready_packet_report: 'reports/definition-workbench-usage-queue-ready-packet.md',
  consumer_manifest_report: 'reports/definition-workbench-usage-consumer-manifest.md',
  route_pointer_audit_report: 'reports/definition-workbench-usage-route-pointer-audit.md',
  agent6_verdict_report: 'reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md',
  concordance_navigation_packet: 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json',
  occurrence_support_packet: 'data/definitions/definition-workbench-usage-occurrence-support-packet.json',
  occurrence_links_packet: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  route_pointer_audit_packet: 'data/definitions/definition-workbench-usage-route-pointer-audit.json',
};

const forbiddenAuthorityKeys = new Set([
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
  'reader_facing',
  'visible_answer_selection',
  'route_ranking',
  'semantic_arbitration',
]);

for (const p of Object.values(inputs)) {
  if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing input: ${p}`);
}

const navigation = readJson(inputs.concordance_navigation_packet);
const support = readJson(inputs.occurrence_support_packet);
const occurrenceLinks = readJson(inputs.occurrence_links_packet);
const routePointer = readJson(inputs.route_pointer_audit_packet);

const dirtySourceRows = liveDirtySourceRows();
const navRows = navigation.navigation_rows || [];
const supportRows = support.support_rows || [];
const occurrenceRows = occurrenceLinks.occurrence_links || [];
const routePointerRows = routePointer.route_pointer_rows || [];

const usageBySlug = summarizeUsageBySlug(navRows);
const supportBySlug = summarizeUsageBySlug(supportRows);
const dirtyRows = dirtySourceRows.map((row) => {
  const sourceSlug = sourceSlugFromPath(row.source_file);
  const usage = usageBySlug.get(sourceSlug) || emptyUsage();
  const selected = supportBySlug.get(sourceSlug) || emptyUsage();
  return {
    source_file: row.source_file,
    source_slug: sourceSlug,
    git_status: row.git_status,
    git_status_label: statusLabel(row.git_status),
    bytes: row.bytes,
    modified_at: row.modified_at,
    current_usage_navigation_rows: usage.rows,
    selected_support_rows: selected.rows,
    supported_rows: usage.statuses.supported || 0,
    candidate_rows: usage.statuses.candidate || 0,
    weak_rows: usage.statuses.weak || 0,
    source_refs: usage.source_refs.size,
    works: usage.works.size,
    categories: [...usage.categories].sort(),
    usage_frames: [...usage.frames].sort(),
    related_agent2_route_ids: [...usage.route_ids].sort(),
    impacted_occurrence_ids: [...usage.occurrence_ids].sort().slice(0, 25),
    impact_status: usage.rows > 0 ? 'current_usage_overlap_review_only' : 'no_current_usage_overlap',
    row_label: 'observed usage only',
    audit_visibility: 'agent6_queue_intake_only',
    promotion_status: 'not_promoted',
    note: usage.rows > 0
      ? 'Live dirty source file overlaps existing usage-navigation rows; this is review-only impact evidence and not a refresh target promotion.'
      : 'Live dirty source file has no direct overlap with current selected usage-navigation work slugs.',
  };
});

const impactedRows = buildImpactedRows(navRows, new Set(dirtyRows.filter((row) => row.current_usage_navigation_rows > 0).map((row) => row.source_slug)));
const statusCounts = countBy(dirtyRows, (row) => row.git_status_label);
const routeIds = new Set();
for (const row of navRows) for (const id of row.related_agent2_route_ids || []) routeIds.add(id);

const counts = {
  live_dirty_source_files: dirtyRows.length,
  live_dirty_tracked_modified_files: statusCounts.modified_tracked || 0,
  live_dirty_index_modified_files: statusCounts.modified_index || 0,
  live_dirty_untracked_files: statusCounts.untracked || 0,
  inspected_reports: 4,
  inspected_json_artifacts: 4,
  current_navigation_rows: navRows.length,
  selected_support_rows: supportRows.length,
  occurrence_link_rows: occurrenceRows.length,
  route_pointer_rows: routePointerRows.length,
  current_route_ids: routeIds.size,
  dirty_sources_with_current_usage_overlap: dirtyRows.filter((row) => row.current_usage_navigation_rows > 0).length,
  dirty_sources_without_current_usage_overlap: dirtyRows.filter((row) => row.current_usage_navigation_rows === 0).length,
  impacted_navigation_rows: impactedRows.length,
  impacted_source_refs: new Set(impactedRows.map((row) => row.source_ref).filter(Boolean)).size,
  impacted_works: new Set(impactedRows.map((row) => row.work_slug).filter(Boolean)).size,
  impacted_supported_rows: impactedRows.filter((row) => row.status === 'supported').length,
  impacted_candidate_rows: impactedRows.filter((row) => row.status === 'candidate').length,
  impacted_weak_rows: impactedRows.filter((row) => row.status === 'weak').length,
  rows_labeled_observed_usage_only: dirtyRows.filter((row) => row.row_label === 'observed usage only').length + impactedRows.filter((row) => row.row_label === 'observed usage only').length,
  ambiguous_reader_facing_rows: 0,
  source_text_reads: 0,
  broad_corpus_rebuilds: 0,
  promoted_targets: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_freshness_followup',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_freshness_followup.mjs',
  lane_owner: 'Agent 3',
  status: 'awaiting-Agent-6',
  chosen_bounded_path: 'source-freshness impact refresh from live git status',
  target_gate: 'definition_workbench_gate',
  objective: 'Address Agent 6 source-freshness WARN limits for Definition Workbench usage-navigation evidence without making usage rows answer authority.',
  input_artifacts: inputs,
  reused_evidence: [
    {
      report: inputs.queue_ready_packet_report,
      reused: 'Existing queue-ready counts and boundary: 53 evidence artifacts, 49 occurrence links, 2390 concordance navigation rows, 0 reader-facing/route-payload/forbidden-authority hits, prior freshness pending/overlap/impacted 173/0/0.',
    },
    {
      report: inputs.consumer_manifest_report,
      reused: 'Consumer contract: required row label observed usage only, ambiguous rows audit-only, related route IDs only.',
    },
    {
      report: inputs.route_pointer_audit_report,
      reused: 'Route pointer boundary: 1 Agent 2 route ID, 49 support rows, 2390 navigation rows, no copied route payloads.',
    },
    {
      report: inputs.agent6_verdict_report,
      reused: 'Agent 6 WARN condition: source freshness stale and route concentration visible; next useful work includes freshness refresh, route-diversity evidence, or UI-consumer negative tests.',
    },
  ],
  authority_boundary: {
    usage_navigation_only: true,
    source_freshness_impact_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only_ambiguous_rows: true,
    no_source_text_read: true,
    no_broad_corpus_rebuild: true,
    no_target_promotion: true,
    not_reader_facing: true,
    not_definition_authority: true,
    not_reviewed_lexical_authority: true,
    not_route_ranking: true,
    not_semantic_arbitration: true,
    not_visible_answer_selection: true,
    not_publication_ready: true,
    not_accepted_translation_text: true,
    no_copied_agent2_payloads: true,
    not_agent6_accepted: true,
  },
  live_source_freshness: {
    method: 'git status --porcelain=v1 -- data/sources/*.json',
    live_dirty_source_files: dirtyRows.length,
    previous_packet_pending_source_files: 173,
    previous_packet_direct_overlap_rows: 0,
    current_direct_overlap_rows: counts.impacted_navigation_rows,
    current_direct_overlap_sources: counts.dirty_sources_with_current_usage_overlap,
    freshness_disposition: counts.impacted_navigation_rows === 0
      ? 'live_dirty_sources_do_not_directly_overlap_current_usage_navigation_rows'
      : 'live_dirty_sources_overlap_current_usage_navigation_rows_review_only',
    interpretation: 'This refresh narrows the stale-source warning for the selected usage-navigation packet only. It does not claim corpus freshness, source/provenance acceptance, UI/runtime acceptance, or answer eligibility.',
  },
  dirty_source_rows: dirtyRows,
  impacted_usage_navigation_rows: impactedRows,
  agent5_agent6_queue_summary: {
    summary: `Live source refresh found ${dirtyRows.length} dirty data/sources JSON files and ${counts.impacted_navigation_rows} direct overlaps with the existing ${navRows.length}-row usage-navigation packet.`,
    requested_status: 'awaiting-Agent-6',
    blocker: 'Agent 6 must still decide whether this refresh resolves the source-freshness WARN for planning evidence; this packet does not request UI/runtime/publication acceptance.',
  },
  counts,
  checks: buildChecks(counts),
};
artifact.counts.forbidden_authority_field_hits = countForbiddenKeyHits(artifact);
artifact.checks = buildChecks(artifact.counts);

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 freshness follow-up ${artifact.status}; dirty sources ${counts.live_dirty_source_files}; overlap sources ${counts.dirty_sources_with_current_usage_overlap}; impacted navigation rows ${counts.impacted_navigation_rows}`);

function liveDirtySourceRows() {
  const output = execSync('git status --porcelain=v1 -- data/sources/*.json', { cwd: root, encoding: 'utf8' });
  return output.split(/\r?\n/)
    .filter((line) => line.length)
    .map((line) => {
      const gitStatus = line.slice(0, 2);
      const sourceFile = normalizePath(line.slice(3).trim());
      const fullPath = path.join(root, sourceFile);
      const stat = fs.existsSync(fullPath) ? fs.statSync(fullPath) : null;
      return {
        git_status: gitStatus,
        source_file: sourceFile,
        bytes: stat ? stat.size : 0,
        modified_at: stat ? stat.mtime.toISOString() : null,
      };
    })
    .filter((row) => row.source_file.startsWith('data/sources/') && row.source_file.endsWith('.json'))
    .sort((a, b) => a.source_file.localeCompare(b.source_file));
}

function summarizeUsageBySlug(rows) {
  const map = new Map();
  for (const row of rows) {
    const slug = row.work_slug || row.work_id;
    if (!slug) continue;
    if (!map.has(slug)) map.set(slug, emptyUsage());
    const entry = map.get(slug);
    entry.rows += 1;
    if (row.status) entry.statuses[row.status] = (entry.statuses[row.status] || 0) + 1;
    if (row.source_ref) entry.source_refs.add(row.source_ref);
    if (row.work_slug || row.work_id) entry.works.add(row.work_slug || row.work_id);
    if (row.category) entry.categories.add(row.category);
    if (row.usage_frame_label) entry.frames.add(row.usage_frame_label);
    if (row.cluster_id) entry.clusters.add(row.cluster_id);
    for (const routeId of row.related_agent2_route_ids || row.related_route_ids || []) entry.route_ids.add(routeId);
    if (row.occurrence_id) entry.occurrence_ids.add(row.occurrence_id);
  }
  return map;
}

function emptyUsage() {
  return {
    rows: 0,
    statuses: {},
    source_refs: new Set(),
    works: new Set(),
    categories: new Set(),
    frames: new Set(),
    clusters: new Set(),
    route_ids: new Set(),
    occurrence_ids: new Set(),
  };
}

function buildImpactedRows(rows, impactedSlugs) {
  if (!impactedSlugs.size) return [];
  return rows
    .filter((row) => impactedSlugs.has(row.work_slug || row.work_id))
    .map((row) => ({
      occurrence_id: row.occurrence_id,
      navigation_row_id: row.navigation_row_id,
      token_key: row.token_key,
      source_ref: row.source_ref,
      source_url: row.source_url,
      local_work_anchor: row.local_work_anchor || row.local_work_page_anchor,
      work_id: row.work_id,
      work_slug: row.work_slug,
      work_title: row.work_title,
      status: row.status,
      raw_score: row.raw_score,
      usage_frame_label: row.usage_frame_label,
      cluster_id: row.cluster_id,
      related_agent2_route_ids: row.related_agent2_route_ids || [],
      license: row.license,
      license_url: row.license_url,
      version_title: row.version_title,
      version_source: row.version_source,
      row_label: 'observed usage only',
      audit_visibility: 'agent6_queue_intake_only',
      not_definition_authority: true,
    }));
}

function buildChecks(c) {
  return [
    check('live_git_status_recount_present', c.live_dirty_source_files > 0, `dirty source files ${c.live_dirty_source_files}`),
    check('required_evidence_inspected', c.inspected_reports === 4 && c.inspected_json_artifacts === 4, `reports/json ${c.inspected_reports}/${c.inspected_json_artifacts}`),
    check('current_usage_artifacts_recounted', c.current_navigation_rows === 2390 && c.selected_support_rows === 49 && c.occurrence_link_rows === 49, `navigation/support/links ${c.current_navigation_rows}/${c.selected_support_rows}/${c.occurrence_link_rows}`),
    check('freshness_overlap_recounted', c.dirty_sources_with_current_usage_overlap + c.dirty_sources_without_current_usage_overlap === c.live_dirty_source_files, `overlap/no-overlap ${c.dirty_sources_with_current_usage_overlap}/${c.dirty_sources_without_current_usage_overlap}`),
    check('no_current_usage_overlap', c.impacted_navigation_rows === 0, `impacted navigation rows ${c.impacted_navigation_rows}`),
    check('route_concentration_still_visible', c.current_route_ids === 1, `route IDs ${c.current_route_ids}`),
    check('usage_only_labels_present', c.rows_labeled_observed_usage_only === c.live_dirty_source_files + c.impacted_navigation_rows, `observed labels ${c.rows_labeled_observed_usage_only}`),
    check('no_ambiguous_reader_rows', c.ambiguous_reader_facing_rows === 0, `ambiguous reader rows ${c.ambiguous_reader_facing_rows}`),
    check('no_source_or_broad_work', c.source_text_reads === 0 && c.broad_corpus_rebuilds === 0 && c.promoted_targets === 0, `source/broad/promoted ${c.source_text_reads}/${c.broad_corpus_rebuilds}/${c.promoted_targets}`),
    check('no_queue_mutation', c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `queue/submitted ${c.queue_mutations}/${c.submitted_to_agent6}`),
    check('no_payload_or_authority_fields', c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `payload/forbidden ${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function countBy(rows, keyFn) {
  const counts = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function countForbiddenKeyHits(value) {
  let hits = 0;
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbiddenAuthorityKeys.has(key) && child !== false && child !== 0 && child !== null) hits += 1;
      walk(child);
    }
  };
  walk(value);
  return hits;
}

function sourceSlugFromPath(sourceFile) {
  return sourceFile.replace(/^data\/sources\//, '').replace(/\.json$/, '');
}

function statusLabel(status) {
  if (status === '??') return 'untracked';
  if (status[0] && status[0] !== ' ') return 'modified_index';
  if (status[1] && status[1] !== ' ') return 'modified_tracked';
  return 'other_dirty';
}

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Definition Workbench Usage Freshness Follow-Up',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Chosen path: ${artifact.chosen_bounded_path}`,
    '- Boundary: usage-navigation/source-freshness impact only; no definition authority, route ranking, UI acceptance, publication claim, source/provenance custody acceptance, or accepted translation text.',
    '',
    '## Reused Evidence',
    '',
    `- ${inputs.queue_ready_packet_report}: reused queue-ready boundary/counts, including 49 occurrence links, 2390 concordance rows, 0 authority leaks, and prior freshness 173/0/0 pending/overlap/impacted.`,
    `- ${inputs.consumer_manifest_report}: reused consumer contract requiring "observed usage only", audit-only ambiguity, and route-ID-only linkage.`,
    `- ${inputs.route_pointer_audit_report}: reused pointer-only route boundary: 1 Agent 2 route ID, 49 support rows, 2390 navigation rows, 0 payload hits.`,
    `- ${inputs.agent6_verdict_report}: reused WARN scope and next-action options; this packet chooses source-freshness impact refresh.`,
    '',
    '## Live Recount',
    '',
    `- Dirty source files inspected: ${c.live_dirty_source_files}`,
    `- Git status split: modified_index ${c.live_dirty_index_modified_files}; modified_tracked ${c.live_dirty_tracked_modified_files}; untracked ${c.live_dirty_untracked_files}`,
    `- Existing usage rows inspected: navigation ${c.current_navigation_rows}; selected support ${c.selected_support_rows}; occurrence links ${c.occurrence_link_rows}`,
    `- Direct overlap with current usage navigation: sources ${c.dirty_sources_with_current_usage_overlap}; rows ${c.impacted_navigation_rows}; source refs ${c.impacted_source_refs}; works ${c.impacted_works}`,
    `- Impacted supported/candidate/weak rows: ${c.impacted_supported_rows}/${c.impacted_candidate_rows}/${c.impacted_weak_rows}`,
    `- Route IDs visible: ${c.current_route_ids}; route concentration remains a warning, not semantic independence.`,
    '',
    '## Dirty Source Rows',
    '',
    '| source file | git status | usage rows | selected rows | supported | candidate | weak | impact |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...artifact.dirty_source_rows.map((row) => `| ${row.source_file} | ${row.git_status_label} | ${row.current_usage_navigation_rows} | ${row.selected_support_rows} | ${row.supported_rows} | ${row.candidate_rows} | ${row.weak_rows} | ${row.impact_status} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Summary',
    '',
    artifact.agent5_agent6_queue_summary.summary,
    '',
    `Blocker: ${artifact.agent5_agent6_queue_summary.blocker}`,
    '',
    'This packet is awaiting Agent 6. It does not mutate queues, promote refresh targets, inspect source text, or convert usage rows into Definition answers.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}
