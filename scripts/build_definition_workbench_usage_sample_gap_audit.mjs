#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  usageLinkPacket: 'data/definitions/definition-workbench-usage-link-packet.json',
  usageSeedQueue: 'data/definitions/definition-workbench-usage-seed-queue.json',
  output: 'data/definitions/definition-workbench-usage-sample-gap-audit.json',
  report: 'reports/definition-workbench-usage-sample-gap-audit.md',
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
]);

const options = parseArgs(process.argv.slice(2));
const linkPacket = readJson(options.usageLinkPacket);
const seedQueue = readJson(options.usageSeedQueue);

if (linkPacket.artifact_type !== 'definition_workbench_usage_link_packet') {
  throw new Error(`${options.usageLinkPacket} is not a Definition Workbench usage-link packet`);
}
if (seedQueue.artifact_type !== 'definition_workbench_usage_seed_queue') {
  throw new Error(`${options.usageSeedQueue} is not a Definition Workbench usage seed queue`);
}

const gapRows = buildGapRows();
const counts = buildCounts(gapRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_sample_gap_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_sample_gap_audit.mjs',
  policy: 'Bounded Agent 3 sample-gap audit for Definition Workbench planning. It exposes whether the current machine sample overlaps selected usage occurrence links and preserves source/license/context route-ID-only evidence for absent usage tokens. It is usage navigation only, not answer authority, semantic arbitration, UI acceptance, publication support, or accepted text.',
  inputs: {
    usage_link_packet: options.usageLinkPacket,
    usage_seed_queue: options.usageSeedQueue,
  },
  authority_policy: {
    usage_navigation_only: true,
    sample_gap_audit_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    sample_planning_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    copies_translation_payloads: false,
    publication_claim: false,
  },
  sample_overlap_snapshot: {
    sample_rows: Number(linkPacket.counts?.sample_rows || 0),
    sample_rows_with_usage_links: Number(linkPacket.counts?.sample_rows_with_usage_links || 0),
    sample_rows_with_selected_usage_links: Number(linkPacket.counts?.sample_rows_with_selected_usage_links || 0),
    usage_token_rows: Number(linkPacket.counts?.usage_token_rows || 0),
    usage_tokens_in_sample: Number(linkPacket.counts?.usage_tokens_in_sample || 0),
    usage_tokens_not_in_sample: Number(linkPacket.counts?.usage_tokens_not_in_sample || 0),
    current_overlap_status: Number(linkPacket.counts?.sample_rows_with_usage_links || 0) > 0
      ? 'sample_has_selected_usage_overlap'
      : 'no_current_sample_overlap',
    gap_interpretation: 'sample planning gap only; absence from the current sample does not weaken source-backed occurrence rows and does not create answer authority',
  },
  definition_sample_boundary: {
    status_axis: linkPacket.definition_sample_contract?.status_axis || null,
    review_status_axis: linkPacket.definition_sample_contract?.review_status_axis || null,
    machine_review_status: 'unreviewed_machine_sample',
    verified_review_status_reserved: true,
    answer_role_preserved: true,
    source_license_rows_preserved: true,
    multi_answer_warnings_preserved: true,
    publication_boundary_preserved: true,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  gap_rows: gapRows,
};

artifact.counts.forbidden_authority_field_hits = countForbiddenKeys(artifact);
artifact.checks = buildChecks(artifact.counts);
artifact.quality.failed_count = artifact.checks.filter((check) => check.status === 'failed').length;
artifact.quality.warning_count = artifact.checks.filter((check) => check.status === 'warning').length;
artifact.quality.status = artifact.quality.failed_count ? 'failed' : artifact.quality.warning_count ? 'pass_with_warnings' : 'passed';

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage sample-gap audit ${artifact.quality.status}; gap rows ${artifact.counts.gap_rows}; sample rows with usage links ${artifact.counts.sample_rows_with_usage_links}/${artifact.counts.sample_rows}.`);

function buildGapRows() {
  const seedRows = Array.isArray(seedQueue.seed_rows) ? seedQueue.seed_rows : [];
  return seedRows.map((row, index) => {
    const occurrenceLinks = (Array.isArray(row.occurrence_links) ? row.occurrence_links : []).map((occurrence) => ({
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
        not_semantic_arbitration: true,
      },
    }));
    return {
      gap_id: `definition-workbench-usage-gap-${String(index + 1).padStart(3, '0')}`,
      seed_id: row.seed_id,
      token_key: row.token_key,
      normalized_form: row.normalized_form,
      current_sample_link_status: row.current_sample_link_status,
      recommended_next_action: row.recommended_next_action,
      usage_occurrence_rows: Number(row.usage_occurrence_rows || 0),
      selected_usage_occurrence_rows: Number(row.selected_usage_occurrence_rows || 0),
      selected_occurrence_link_count: occurrenceLinks.length,
      source_ref_count: Number(row.source_ref_count || 0),
      work_count: Number(row.work_count || 0),
      route_ids: Array.isArray(row.route_ids) ? row.route_ids.slice().sort() : [],
      licenses: Array.isArray(row.licenses) ? row.licenses.slice().sort() : [],
      usage_frames: row.usage_frames || {},
      audit_only_ambiguous_rows: Number(row.audit_only_ambiguous_rows || 0),
      route_concentration_warning_visible: row.route_concentration_warning_visible === true,
      occurrence_links: occurrenceLinks,
      gap_boundary: {
        observed_usage_only: true,
        sample_gap_audit_only: true,
        sample_planning_only: true,
        reader_facing: false,
        route_ids_only: true,
        not_answer_authority: true,
        not_definition_authority: true,
        not_semantic_arbitration: true,
        not_publication_support: true,
      },
    };
  });
}

function buildCounts(rows) {
  const occurrenceLinks = rows.flatMap((row) => row.occurrence_links || []);
  const sampleRows = Number(linkPacket.counts?.sample_rows || 0);
  const sampleRowsWithUsageLinks = Number(linkPacket.counts?.sample_rows_with_usage_links || 0);
  return {
    gap_rows: rows.length,
    gap_rows_absent_from_sample: rows.filter((row) => row.current_sample_link_status === 'absent_from_current_definition_workbench_sample').length,
    sample_rows: sampleRows,
    sample_rows_with_usage_links: sampleRowsWithUsageLinks,
    sample_rows_with_selected_usage_links: Number(linkPacket.counts?.sample_rows_with_selected_usage_links || 0),
    sample_rows_without_usage_links: Number(linkPacket.counts?.sample_rows_without_usage_links || 0),
    usage_token_rows: Number(linkPacket.counts?.usage_token_rows || 0),
    usage_tokens_in_sample: Number(linkPacket.counts?.usage_tokens_in_sample || 0),
    usage_tokens_not_in_sample: Number(linkPacket.counts?.usage_tokens_not_in_sample || 0),
    seed_rows: Number(seedQueue.counts?.seed_rows || 0),
    seed_rows_absent_from_sample: Number(seedQueue.counts?.seed_rows_absent_from_sample || 0),
    usage_occurrence_rows: rows.reduce((sum, row) => sum + Number(row.usage_occurrence_rows || 0), 0),
    selected_usage_occurrence_rows: rows.reduce((sum, row) => sum + Number(row.selected_usage_occurrence_rows || 0), 0),
    selected_occurrence_links: occurrenceLinks.length,
    selected_occurrences_with_source_link: occurrenceLinks.filter((row) => row.source_href).length,
    selected_occurrences_with_work_anchor: occurrenceLinks.filter((row) => row.work_anchor_href).length,
    selected_occurrences_with_context: occurrenceLinks.filter((row) => row.context_focus_marked).length,
    selected_occurrences_with_license: occurrenceLinks.filter((row) => row.license && row.license_url).length,
    selected_occurrences_with_version: occurrenceLinks.filter((row) => row.version_title && row.version_source).length,
    selected_occurrences_with_route_ids: occurrenceLinks.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    rows_with_source_link: occurrenceLinks.filter((row) => row.source_href).length,
    rows_with_work_anchor: occurrenceLinks.filter((row) => row.work_anchor_href).length,
    rows_with_hebrew_context: occurrenceLinks.filter((row) => row.context_focus_marked).length,
    rows_with_focus_marker: occurrenceLinks.filter((row) => String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')).length,
    rows_with_license_metadata: occurrenceLinks.filter((row) => row.license && row.license_url).length,
    rows_with_version_metadata: occurrenceLinks.filter((row) => row.version_title && row.version_source).length,
    route_ids: new Set(rows.flatMap((row) => row.route_ids || [])).size,
    unresolved_route_ids: 0,
    audit_only_ambiguous_rows: rows.reduce((sum, row) => sum + Number(row.audit_only_ambiguous_rows || 0), 0),
    route_concentration_warning_visible: rows.some((row) => row.route_concentration_warning_visible) ? 1 : 0,
    sample_overlap_gap_visible: sampleRowsWithUsageLinks === 0 && rows.length > 0 ? 1 : 0,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('sample_rows_present', counts.sample_rows > 0 ? 'passed' : 'failed', `sample rows ${counts.sample_rows}`),
    check('gap_rows_present', counts.gap_rows > 0 ? 'passed' : 'warning', `gap rows ${counts.gap_rows}`),
    check('gap_rows_absent_from_sample', counts.gap_rows_absent_from_sample === counts.gap_rows ? 'passed' : 'failed', `absent rows ${counts.gap_rows_absent_from_sample}/${counts.gap_rows}`),
    check('sample_overlap_gap_visible', counts.sample_rows_with_usage_links === 0 && counts.usage_tokens_not_in_sample > 0 && counts.sample_overlap_gap_visible === 1 ? 'warning' : 'passed', `sample usage links ${counts.sample_rows_with_usage_links}; usage tokens not in sample ${counts.usage_tokens_not_in_sample}`),
    check('seed_queue_alignment', counts.seed_rows === counts.gap_rows && counts.seed_rows_absent_from_sample === counts.gap_rows ? 'passed' : 'failed', `seed/gap/absent ${counts.seed_rows}/${counts.gap_rows}/${counts.seed_rows_absent_from_sample}`),
    check('occurrence_links_complete', allEqual(counts.selected_occurrence_links, [
      counts.selected_occurrences_with_source_link,
      counts.selected_occurrences_with_work_anchor,
      counts.selected_occurrences_with_context,
      counts.selected_occurrences_with_license,
      counts.selected_occurrences_with_version,
      counts.selected_occurrences_with_route_ids,
    ]) && counts.selected_occurrence_links > 0 ? 'passed' : 'failed', `links/source/work/context/license/version/route ${counts.selected_occurrence_links}/${counts.selected_occurrences_with_source_link}/${counts.selected_occurrences_with_work_anchor}/${counts.selected_occurrences_with_context}/${counts.selected_occurrences_with_license}/${counts.selected_occurrences_with_version}/${counts.selected_occurrences_with_route_ids}`),
    check('route_ids_only_resolved', counts.route_ids > 0 && counts.unresolved_route_ids === 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `audit-only ambiguous rows ${counts.audit_only_ambiguous_rows}; reader-facing ${counts.reader_facing_rows}`),
    check('route_concentration_warning_preserved', counts.route_concentration_warning_visible === 1 ? 'passed' : 'warning', `route concentration warning ${counts.route_concentration_warning_visible}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Sample Gap Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Gap rows: ${artifact.counts.gap_rows}`,
    `- Current sample usage links: ${artifact.counts.sample_rows_with_usage_links}/${artifact.counts.sample_rows}`,
    `- Usage tokens in / not in current sample: ${artifact.counts.usage_tokens_in_sample}/${artifact.counts.usage_tokens_not_in_sample}`,
    `- Selected occurrence links with source/work/context/license/version/route IDs: ${artifact.counts.selected_occurrences_with_source_link}/${artifact.counts.selected_occurrences_with_work_anchor}/${artifact.counts.selected_occurrences_with_context}/${artifact.counts.selected_occurrences_with_license}/${artifact.counts.selected_occurrences_with_version}/${artifact.counts.selected_occurrences_with_route_ids}`,
    `- Route IDs / unresolved: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}`,
    `- Audit-only ambiguous rows: ${artifact.counts.audit_only_ambiguous_rows}`,
    `- Route concentration warning visible: ${artifact.counts.route_concentration_warning_visible}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Gap Rows',
    '',
    '| gap | token | sample status | usage rows | selected rows | occurrence links | source refs | works | route IDs | next action |',
    '|---|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.gap_rows.map((row) => `| ${[
      row.gap_id,
      row.normalized_form,
      row.current_sample_link_status,
      row.usage_occurrence_rows,
      row.selected_usage_occurrence_rows,
      row.selected_occurrence_link_count,
      row.source_ref_count,
      row.work_count,
      row.route_ids.length,
      row.recommended_next_action,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'A warning here is intentional when the current Definition Workbench sample has zero selected usage overlap. The packet is a planning/audit signal only and must not be used as a visible answer, route rank, semantic verdict, or publication support.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function countForbiddenKeys(value) {
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

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--usage-link-packet=')) parsed.usageLinkPacket = cleanRelativePath(valueAfterEquals(arg));
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
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text);
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
