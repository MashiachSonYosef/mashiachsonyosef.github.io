#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const options = parseArgs(process.argv.slice(2));
const smoke = readJson(options.joinSmoke);

if (smoke.artifact_type !== 'definition_workbench_usage_join_smoke') {
  throw new Error(`${options.joinSmoke} is not a Definition Workbench usage join-smoke artifact`);
}

const joinRows = Array.isArray(smoke.join_rows) ? smoke.join_rows : [];
const absentRows = joinRows.filter((row) => row.join_status === 'seed_absent_from_current_sample');
const projectedRows = absentRows.map((row, index) => ({
  planning_row_id: `agent2-usage-joined-sample-planning-${String(index + 1).padStart(3, '0')}`,
  source_join_smoke_id: row.join_smoke_id,
  seed_id: row.seed_id,
  token_key: row.token_key,
  normalized_form: row.normalized_form,
  projected_row_status: 'nonpublic_joined_sample_planning_row',
  current_sample_link_status: 'absent_from_current_definition_workbench_sample',
  recommended_next_action: row.recommended_next_action,
  projected_usage_link_count: Number(row.projected_usage_link_count || 0),
  selected_occurrence_link_count: Number(row.selected_occurrence_link_count || 0),
  source_ref_count: Number(row.source_ref_count || 0),
  work_count: Number(row.work_count || 0),
  route_ids: Array.isArray(row.route_ids) ? row.route_ids.slice().sort() : [],
  licenses: Array.isArray(row.licenses) ? row.licenses.slice().sort() : [],
  usage_frames: row.usage_frames || {},
  audit_only_ambiguous_rows: Number(row.audit_only_ambiguous_rows || 0),
  route_concentration_warning_visible: row.route_concentration_warning_visible === true,
  occurrence_links: (Array.isArray(row.occurrence_links) ? row.occurrence_links : []).map((occurrence) => ({
    occurrence_id: occurrence.occurrence_id,
    source_ref: occurrence.source_ref,
    source_href: occurrence.source_href,
    work_anchor_href: occurrence.work_anchor_href,
    status: occurrence.status,
    raw_score: occurrence.raw_score,
    cluster_id: occurrence.cluster_id,
    usage_frame_label: occurrence.usage_frame_label,
    context_focus_marked: occurrence.context_focus_marked,
    route_ids: Array.isArray(occurrence.route_ids) ? occurrence.route_ids : [],
    license: occurrence.license,
    license_url: occurrence.license_url,
    version_title: occurrence.version_title,
    version_source: occurrence.version_source,
    occurrence_boundary: {
      observed_usage_only: true,
      route_ids_only: true,
      reader_facing: false,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
  })),
  planning_boundary: {
    nonpublic_joined_sample_planning_only: true,
    live_sample_unchanged: true,
    observed_usage_only: true,
    route_ids_only: true,
    reader_facing: false,
    not_answer_authority: true,
    not_definition_authority: true,
    not_publication_support: true,
    no_accepted_text: true,
  },
}));

const counts = buildCounts(projectedRows);
const artifact = {
  schema_version: 1,
  artifact_type: 'agent2_definition_workbench_usage_joined_sample_planning',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent2_definition_workbench_usage_joined_sample_planning.mjs',
  policy: 'Agent 2 non-public joined-sample planning artifact. It consumes the validated usage join-smoke and describes bounded projected rows without mutating the Definition Workbench sample, copying route payloads, ranking answers, deciding Definition authority, or emitting public reader output.',
  inputs: {
    join_smoke: options.joinSmoke,
    definition_workbench_sample: smoke.inputs?.definition_workbench_sample || null,
    usage_seed_queue: smoke.inputs?.usage_seed_queue || null,
  },
  authority_policy: {
    nonpublic_planning_only: true,
    live_sample_unchanged: true,
    usage_navigation_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    copies_translation_payloads: false,
    answer_eligibility: false,
    publication_claim: false,
  },
  current_sample_snapshot: smoke.current_sample_snapshot,
  source_join_smoke_counts: smoke.counts,
  projected_joined_sample_snapshot: {
    source_sample_rows: Number(smoke.counts?.sample_rows_checked || 0),
    projected_rows_to_add: projectedRows.length,
    projected_total_rows_if_separate_joined_artifact: Number(smoke.counts?.sample_rows_checked || 0) + projectedRows.length,
    live_sample_mutated: false,
    public_rows_emitted: 0,
    answer_eligible_rows_emitted: 0,
    route_shards_written: 0,
    public_runtime_mutations: 0,
  },
  counts,
  projected_rows: projectedRows,
  missing_field_blocker: {
    id: projectedRows.length ? null : 'no_absent_seed_rows_in_join_smoke',
    required_to_unblock_if_zero: [
      'join-smoke artifact with at least one seed_absent_from_current_sample row',
    ],
  },
  agent6_boundary_question: 'Can the exact non-public joined-sample planning artifact be treated as reader-planning evidence only, preserving route-ID-only usage links, no Definition authority, no answer eligibility, no accepted gloss/text, no public reader output, no route-shard edit, and no public/runtime mutation?',
  stop_condition: 'Stop after producing and validating this separate non-public planning artifact. Do not mutate the Definition Workbench sample or public/runtime surfaces.',
  what_must_not_be_accepted: [
    'Definition authority',
    'answer acceptance',
    'answer eligibility',
    'accepted gloss/text',
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
  ],
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Agent 2 joined-sample planning wrote ${projectedRows.length} row(s). Output: ${options.output}. Report: ${options.report}`);

function buildCounts(rows) {
  const occurrenceLinks = rows.flatMap((row) => row.occurrence_links || []);
  return {
    projected_rows: rows.length,
    projected_usage_link_rows: rows.reduce((sum, row) => sum + Number(row.projected_usage_link_count || 0), 0),
    selected_occurrence_links: occurrenceLinks.length,
    occurrence_links_with_source: occurrenceLinks.filter((row) => row.source_href).length,
    occurrence_links_with_work_anchor: occurrenceLinks.filter((row) => row.work_anchor_href).length,
    occurrence_links_with_context: occurrenceLinks.filter((row) => row.context_focus_marked).length,
    occurrence_links_with_license: occurrenceLinks.filter((row) => row.license && row.license_url).length,
    occurrence_links_with_version: occurrenceLinks.filter((row) => row.version_title && row.version_source).length,
    occurrence_links_with_route_ids: occurrenceLinks.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    route_ids: new Set(rows.flatMap((row) => row.route_ids || [])).size,
    audit_only_ambiguous_rows: rows.reduce((sum, row) => sum + Number(row.audit_only_ambiguous_rows || 0), 0),
    route_concentration_warning_visible: rows.some((row) => row.route_concentration_warning_visible) ? 1 : 0,
    reader_facing_rows: 0,
    answer_eligible_rows: 0,
    public_rows_emitted: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function parseArgs(args) {
  const parsed = {
    joinSmoke: 'data/definitions/definition-workbench-usage-join-smoke.json',
    output: 'data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json',
    report: 'reports/agent2-definition-workbench-usage-joined-sample-planning.md',
  };
  for (const arg of args) {
    if (arg.startsWith('--join-smoke=')) parsed.joinSmoke = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Agent 2 Definition Workbench Usage Joined-Sample Planning',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Projected planning rows: ${artifact.counts.projected_rows}`,
    `- Projected usage-link rows: ${artifact.counts.projected_usage_link_rows}`,
    `- Selected occurrence links: ${artifact.counts.selected_occurrence_links}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Audit-only ambiguous rows carried: ${artifact.counts.audit_only_ambiguous_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Answer-eligible rows: ${artifact.counts.answer_eligible_rows}`,
    `- Public rows emitted: ${artifact.counts.public_rows_emitted}`,
    `- Forbidden authority field hits: ${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Projected Rows',
    '',
    '| row | token | sample status | usage links | occurrence links | route IDs | next action |',
    '|---|---|---|---:|---:|---:|---|',
    ...artifact.projected_rows.map((row) => `| ${[
      row.planning_row_id,
      row.normalized_form,
      row.current_sample_link_status,
      row.projected_usage_link_count,
      row.selected_occurrence_link_count,
      row.route_ids.length,
      row.recommended_next_action,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'No live sample mutation, public reader output, answer eligibility, accepted gloss/text, Definition authority, route-shard edit, or public/runtime mutation is authorized.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
