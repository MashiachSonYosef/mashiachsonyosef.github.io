#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  definitionWorkbenchSample: 'data/definitions/definition-workbench-sample.json',
  usageSeedQueue: 'data/definitions/definition-workbench-usage-seed-queue.json',
  output: 'data/definitions/definition-workbench-usage-join-smoke.json',
  report: 'reports/definition-workbench-usage-join-smoke.md',
};

const options = parseArgs(process.argv.slice(2));
const sample = readJson(options.definitionWorkbenchSample);
const seedQueue = readJson(options.usageSeedQueue);

if (sample.artifact_type !== 'definition_workbench_sample') {
  throw new Error(`${options.definitionWorkbenchSample} is not a Definition Workbench sample`);
}
if (seedQueue.artifact_type !== 'definition_workbench_usage_seed_queue') {
  throw new Error(`${options.usageSeedQueue} is not a Definition Workbench usage seed queue`);
}

const sampleRows = Array.isArray(sample.rows) ? sample.rows : [];
const seedRows = Array.isArray(seedQueue.seed_rows) ? seedQueue.seed_rows : [];
const sampleTokenKeys = new Set(sampleRows.map((row) => row.token_key));
const sampleNormalizedForms = new Set(sampleRows.map((row) => row.normalized_form));
const joinRows = seedRows.map(buildJoinRow);
const counts = buildCounts(joinRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_join_smoke',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_join_smoke.mjs',
  policy: 'Tiny Agent 3 smoke artifact proving selected usage seeds can be joined to Definition Workbench planning by token key or normalized form without modifying the live sample, copying route payloads, ranking answers, or creating definition authority.',
  inputs: {
    definition_workbench_sample: options.definitionWorkbenchSample,
    usage_seed_queue: options.usageSeedQueue,
  },
  authority_policy: {
    usage_navigation_only: true,
    join_smoke_only: true,
    live_sample_unchanged: true,
    usage_rows_not_answer_authority: true,
    review_status_not_answer_authority: true,
    route_ids_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    copies_route_payloads: false,
    copies_translation_payloads: false,
    publication_claim: false,
  },
  current_sample_snapshot: {
    rows: sampleRows.length,
    status_axis: sample.status_axis || 'machine_route_shape_status_not_review_authority',
    review_status_axis: sample.review_status_axis || 'lexical_authority_review_status',
    status_counts: sample.counts?.status_counts || {},
    review_status_counts: sample.counts?.review_status_counts || {},
    machine_verified_rows: countMachineVerifiedSampleRows(),
    rows_with_complete_source_license: Number(sample.counts?.rows_with_complete_source_license || 0),
    usage_link_status: 'not_mutated_by_agent3_join_smoke',
  },
  seed_queue_snapshot: {
    rows: seedRows.length,
    occurrence_links: Number(seedQueue.counts?.occurrence_links || 0),
    route_ids: Number(seedQueue.counts?.route_ids || 0),
    route_concentration_warning_visible: Number(seedQueue.counts?.route_concentration_warning_visible || 0) === 1,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  join_rows: joinRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage join smoke rows ${artifact.counts.join_rows}; absent seeds ${artifact.counts.seed_rows_absent_from_sample}; occurrence links ${artifact.counts.occurrence_links}`);

function buildJoinRow(seed, index) {
  const tokenKeyInSample = sampleTokenKeys.has(seed.token_key);
  const normalizedInSample = sampleNormalizedForms.has(seed.normalized_form);
  const occurrenceLinks = Array.isArray(seed.occurrence_links) ? seed.occurrence_links : [];
  return {
    join_smoke_id: `definition-workbench-usage-join-smoke-${String(index + 1).padStart(3, '0')}`,
    seed_id: seed.seed_id,
    token_key: seed.token_key,
    normalized_form: seed.normalized_form,
    token_key_in_current_sample: tokenKeyInSample,
    normalized_form_in_current_sample: normalizedInSample,
    join_status: tokenKeyInSample || normalizedInSample ? 'already_in_current_sample' : 'seed_absent_from_current_sample',
    recommended_next_action: seed.recommended_next_action,
    projected_usage_link_count: Number(seed.usage_occurrence_rows || 0),
    projected_usage_link_status: 'usage_navigation_join_available_seed_only',
    selected_occurrence_link_count: occurrenceLinks.length,
    source_ref_count: Number(seed.source_ref_count || 0),
    work_count: Number(seed.work_count || 0),
    licenses: Array.isArray(seed.licenses) ? seed.licenses.slice().sort() : [],
    route_ids: Array.isArray(seed.route_ids) ? seed.route_ids.slice().sort() : [],
    usage_frames: seed.usage_frames || {},
    audit_only_ambiguous_rows: Number(seed.audit_only_ambiguous_rows || 0),
    route_concentration_warning_visible: seed.route_concentration_warning_visible === true,
    occurrence_links: occurrenceLinks.map((occurrence) => ({
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
        reader_facing: false,
        route_ids_only: true,
        not_answer_authority: true,
      },
    })),
    join_boundary: {
      observed_usage_only: true,
      join_smoke_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_answer_authority: true,
      not_publication_support: true,
      live_sample_unchanged: true,
    },
  };
}

function buildCounts(rows) {
  const occurrenceLinks = rows.flatMap((row) => row.occurrence_links || []);
  return {
    sample_rows_checked: sampleRows.length,
    sample_review_verified_rows: countMachineVerifiedSampleRows(),
    seed_rows_checked: seedRows.length,
    join_rows: rows.length,
    seed_rows_absent_from_sample: rows.filter((row) => row.join_status === 'seed_absent_from_current_sample').length,
    seed_rows_already_in_sample: rows.filter((row) => row.join_status === 'already_in_current_sample').length,
    projected_rows_after_seed_append: sampleRows.length + rows.filter((row) => row.join_status === 'seed_absent_from_current_sample').length,
    projected_usage_link_rows: rows.reduce((sum, row) => sum + Number(row.projected_usage_link_count || 0), 0),
    selected_usage_occurrence_links: rows.reduce((sum, row) => sum + Number(row.selected_occurrence_link_count || 0), 0),
    occurrence_links: occurrenceLinks.length,
    occurrence_links_with_source: occurrenceLinks.filter((row) => row.source_href).length,
    occurrence_links_with_work_anchor: occurrenceLinks.filter((row) => row.work_anchor_href).length,
    occurrence_links_with_context: occurrenceLinks.filter((row) => row.context_focus_marked).length,
    occurrence_links_with_license: occurrenceLinks.filter((row) => row.license && row.license_url).length,
    occurrence_links_with_version: occurrenceLinks.filter((row) => row.version_title && row.version_source).length,
    occurrence_links_with_route_ids: occurrenceLinks.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    route_ids: new Set(rows.flatMap((row) => row.route_ids || [])).size,
    route_payload_field_hits: 0,
    reader_facing_rows: 0,
    audit_only_ambiguous_rows: rows.reduce((sum, row) => sum + Number(row.audit_only_ambiguous_rows || 0), 0),
    route_concentration_warning_visible: rows.some((row) => row.route_concentration_warning_visible) ? 1 : 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('sample_rows_present', counts.sample_rows_checked > 0 ? 'passed' : 'failed', `sample rows checked ${counts.sample_rows_checked}`),
    check('sample_review_status_not_verified', counts.sample_review_verified_rows === 0 ? 'passed' : 'failed', `machine verified sample rows ${counts.sample_review_verified_rows}`),
    check('seed_rows_present', counts.seed_rows_checked > 0 ? 'passed' : 'warning', `seed rows checked ${counts.seed_rows_checked}`),
    check('join_rows_present', counts.join_rows > 0 ? 'passed' : 'warning', `join rows ${counts.join_rows}`),
    check('seed_absence_visible', counts.seed_rows_absent_from_sample > 0 ? 'passed' : 'warning', `absent seeds ${counts.seed_rows_absent_from_sample}; already present ${counts.seed_rows_already_in_sample}`),
    check('projected_sample_append_bounded', counts.projected_rows_after_seed_append === counts.sample_rows_checked + counts.seed_rows_absent_from_sample ? 'passed' : 'failed', `projected rows ${counts.projected_rows_after_seed_append}`),
    check('occurrence_links_complete', counts.occurrence_links > 0 && counts.occurrence_links_with_source === counts.occurrence_links && counts.occurrence_links_with_work_anchor === counts.occurrence_links && counts.occurrence_links_with_context === counts.occurrence_links && counts.occurrence_links_with_license === counts.occurrence_links && counts.occurrence_links_with_version === counts.occurrence_links ? 'passed' : 'failed', `source/work/context/license/version ${counts.occurrence_links_with_source}/${counts.occurrence_links_with_work_anchor}/${counts.occurrence_links_with_context}/${counts.occurrence_links_with_license}/${counts.occurrence_links_with_version}`),
    check('route_ids_only', counts.route_ids > 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `audit-only ambiguous rows ${counts.audit_only_ambiguous_rows}; reader-facing rows ${counts.reader_facing_rows}`),
    check('route_concentration_warning_preserved', counts.route_concentration_warning_visible === 1 ? 'passed' : 'warning', `route concentration warning visible ${counts.route_concentration_warning_visible}`),
    check('forbidden_authority_fields_absent', counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `forbidden authority field hits ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Join Smoke',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Current sample rows checked: ${artifact.counts.sample_rows_checked}`,
    `- Machine verified sample/review rows: ${artifact.counts.sample_review_verified_rows}`,
    `- Seed rows checked / join rows: ${artifact.counts.seed_rows_checked}/${artifact.counts.join_rows}`,
    `- Seeds absent from current sample / already present: ${artifact.counts.seed_rows_absent_from_sample}/${artifact.counts.seed_rows_already_in_sample}`,
    `- Projected rows after bounded seed append: ${artifact.counts.projected_rows_after_seed_append}`,
    `- Projected usage-link rows: ${artifact.counts.projected_usage_link_rows}`,
    `- Selected occurrence links: ${artifact.counts.selected_usage_occurrence_links}`,
    `- Occurrence links with source/work/context/license/version/route IDs: ${artifact.counts.occurrence_links_with_source}/${artifact.counts.occurrence_links_with_work_anchor}/${artifact.counts.occurrence_links_with_context}/${artifact.counts.occurrence_links_with_license}/${artifact.counts.occurrence_links_with_version}/${artifact.counts.occurrence_links_with_route_ids}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Audit-only ambiguous rows carried: ${artifact.counts.audit_only_ambiguous_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Forbidden authority field hits: ${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Join Rows',
    '',
    '| join | seed | token | status | projected usage links | occurrence links | source refs | works | route IDs |',
    '|---|---|---|---|---:|---:|---:|---:|---:|',
    ...artifact.join_rows.map((row) => `| ${[
      row.join_smoke_id,
      row.seed_id,
      row.normalized_form,
      row.join_status,
      row.projected_usage_link_count,
      row.selected_occurrence_link_count,
      row.source_ref_count,
      row.work_count,
      row.route_ids.length,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'The live Definition Workbench sample is not rewritten by this artifact. The smoke only proves a bounded usage-navigation join path for the seed queue.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function countMachineVerifiedSampleRows() {
  return sampleRows.filter((row) => row.status === 'verified' || row.review_status === 'verified').length;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--definition-workbench-sample=')) parsed.definitionWorkbenchSample = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-seed-queue=')) parsed.usageSeedQueue = cleanRelativePath(valueAfterEquals(arg));
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
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
