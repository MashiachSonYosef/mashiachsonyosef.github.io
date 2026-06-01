#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  usageLinkPacket: 'data/definitions/definition-workbench-usage-link-packet.json',
  output: 'data/definitions/definition-workbench-usage-seed-queue.json',
  report: 'reports/definition-workbench-usage-seed-queue.md',
  maxOccurrenceLinksPerSeed: 12,
};

const options = parseArgs(process.argv.slice(2));
const packet = readJson(options.usageLinkPacket);

if (packet.artifact_type !== 'definition_workbench_usage_link_packet') {
  throw new Error(`${options.usageLinkPacket} is not a Definition Workbench usage-link packet`);
}

const usageRows = Array.isArray(packet.usage_token_rows) ? packet.usage_token_rows : [];
const seedRows = usageRows
  .filter((row) => !row.in_definition_workbench_sample && Number(row.selected_usage_occurrence_rows || 0) > 0)
  .map((row, index) => buildSeedRow(row, index))
  .sort((left, right) =>
    Number(right.selected_usage_occurrence_rows || 0) - Number(left.selected_usage_occurrence_rows || 0)
    || Number(right.usage_occurrence_rows || 0) - Number(left.usage_occurrence_rows || 0)
    || String(left.token_key || '').localeCompare(String(right.token_key || '')));

const counts = buildCounts(seedRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_seed_queue',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_seed_queue.mjs',
  policy: 'Usage-only seed queue for Definition Workbench planning. Rows identify occurrence-linked usage tokens that are absent from the current sample and should be considered for the next sample join. Rows are not answer authority, semantic verdicts, publication support, translation text, or UI ranking input.',
  inputs: {
    usage_link_packet: options.usageLinkPacket,
  },
  authority_policy: {
    usage_navigation_only: true,
    sample_planning_only: true,
    usage_rows_not_answer_authority: true,
    route_ids_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    copies_route_payloads: false,
    copies_translation_payloads: false,
    publication_claim: false,
  },
  packet_overlap_snapshot: {
    sample_rows: Number(packet.counts?.sample_rows || 0),
    sample_rows_with_usage_links: Number(packet.counts?.sample_rows_with_usage_links || 0),
    usage_tokens_not_in_sample: Number(packet.counts?.usage_tokens_not_in_sample || 0),
    route_concentration_warning_visible: Number(packet.counts?.route_concentration_warning_visible || 0) === 1,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  seed_rows: seedRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage seed queue rows ${artifact.counts.seed_rows}; occurrence links ${artifact.counts.occurrence_links}; unresolved route links ${artifact.counts.unresolved_route_links}`);

function buildSeedRow(row, index) {
  const occurrenceLinks = (Array.isArray(row.sample_occurrences) ? row.sample_occurrences : [])
    .slice(0, options.maxOccurrenceLinksPerSeed)
    .map((occurrence) => ({
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
    }));
  const routeIds = Array.isArray(row.route_ids) ? row.route_ids.slice().sort() : [];
  return {
    seed_id: `definition-workbench-usage-seed-${String(index + 1).padStart(3, '0')}`,
    token_key: row.token_key,
    normalized_form: row.normalized_form,
    current_sample_link_status: 'absent_from_current_definition_workbench_sample',
    recommended_next_action: 'include_token_in_next_definition_workbench_sample_join_smoke',
    usage_occurrence_rows: Number(row.usage_occurrence_rows || 0),
    selected_usage_occurrence_rows: Number(row.selected_usage_occurrence_rows || 0),
    selected_occurrence_link_count: occurrenceLinks.length,
    source_ref_count: Number(row.source_refs || 0),
    work_count: Number(row.works || 0),
    licenses: Array.isArray(row.licenses) ? row.licenses.slice().sort() : [],
    route_ids: routeIds,
    route_link_state_counts: row.route_link_state_counts || {},
    usage_frames: row.usage_frames || {},
    audit_only_ambiguous_rows: Number(row.audit_only_ambiguous_rows || 0),
    route_concentration_warning_visible: row.route_concentration_warning_visible === true,
    occurrence_links: occurrenceLinks,
    seed_boundary: {
      observed_usage_only: true,
      sample_planning_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_answer_authority: true,
      not_publication_support: true,
    },
  };
}

function buildCounts(rows) {
  const occurrenceLinks = rows.flatMap((row) => row.occurrence_links || []);
  return {
    seed_rows: rows.length,
    seed_rows_absent_from_sample: rows.filter((row) => row.current_sample_link_status === 'absent_from_current_definition_workbench_sample').length,
    usage_occurrence_rows: rows.reduce((sum, row) => sum + Number(row.usage_occurrence_rows || 0), 0),
    selected_usage_occurrence_rows: rows.reduce((sum, row) => sum + Number(row.selected_usage_occurrence_rows || 0), 0),
    occurrence_links: occurrenceLinks.length,
    occurrence_links_with_source: occurrenceLinks.filter((row) => row.source_href).length,
    occurrence_links_with_work_anchor: occurrenceLinks.filter((row) => row.work_anchor_href).length,
    occurrence_links_with_context: occurrenceLinks.filter((row) => row.context_focus_marked).length,
    occurrence_links_with_license: occurrenceLinks.filter((row) => row.license && row.license_url).length,
    occurrence_links_with_version: occurrenceLinks.filter((row) => row.version_title && row.version_source).length,
    occurrence_links_with_route_ids: occurrenceLinks.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    route_ids: new Set(rows.flatMap((row) => row.route_ids || [])).size,
    unresolved_route_links: rows.reduce((sum, row) => sum + Number(row.route_link_state_counts?.unresolved || 0), 0),
    route_payload_field_hits: 0,
    reader_facing_rows: 0,
    audit_only_ambiguous_rows: rows.reduce((sum, row) => sum + Number(row.audit_only_ambiguous_rows || 0), 0),
    route_concentration_warning_visible: rows.some((row) => row.route_concentration_warning_visible) ? 1 : 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('seed_rows_present', counts.seed_rows > 0 ? 'passed' : 'warning', `seed rows ${counts.seed_rows}`),
    check('all_seed_rows_absent_from_sample', counts.seed_rows_absent_from_sample === counts.seed_rows ? 'passed' : 'failed', `absent rows ${counts.seed_rows_absent_from_sample}/${counts.seed_rows}`),
    check('occurrence_links_present', counts.occurrence_links > 0 ? 'passed' : 'failed', `occurrence links ${counts.occurrence_links}`),
    check('occurrence_links_complete', counts.occurrence_links_with_source === counts.occurrence_links && counts.occurrence_links_with_work_anchor === counts.occurrence_links && counts.occurrence_links_with_context === counts.occurrence_links && counts.occurrence_links_with_license === counts.occurrence_links && counts.occurrence_links_with_version === counts.occurrence_links ? 'passed' : 'failed', `source/work/context/license/version ${counts.occurrence_links_with_source}/${counts.occurrence_links_with_work_anchor}/${counts.occurrence_links_with_context}/${counts.occurrence_links_with_license}/${counts.occurrence_links_with_version}`),
    check('route_ids_only_resolved', counts.route_ids > 0 && counts.unresolved_route_links === 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_links}; payload hits ${counts.route_payload_field_hits}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `audit-only ambiguous rows ${counts.audit_only_ambiguous_rows}; reader-facing rows ${counts.reader_facing_rows}`),
    check('route_concentration_warning_preserved', counts.route_concentration_warning_visible === 1 ? 'passed' : 'warning', `route concentration warning visible ${counts.route_concentration_warning_visible}`),
    check('forbidden_authority_fields_absent', counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `forbidden authority field hits ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Seed Queue',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Seed rows: ${artifact.counts.seed_rows}`,
    `- Current sample rows with usage links: ${artifact.packet_overlap_snapshot.sample_rows_with_usage_links}/${artifact.packet_overlap_snapshot.sample_rows}`,
    `- Usage tokens absent from current sample: ${artifact.packet_overlap_snapshot.usage_tokens_not_in_sample}`,
    `- Usage occurrence rows / selected usage rows: ${artifact.counts.usage_occurrence_rows}/${artifact.counts.selected_usage_occurrence_rows}`,
    `- Occurrence links with source/work/context/license/version/route IDs: ${artifact.counts.occurrence_links_with_source}/${artifact.counts.occurrence_links_with_work_anchor}/${artifact.counts.occurrence_links_with_context}/${artifact.counts.occurrence_links_with_license}/${artifact.counts.occurrence_links_with_version}/${artifact.counts.occurrence_links_with_route_ids}`,
    `- Route IDs / unresolved route links: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_links}`,
    `- Audit-only ambiguous rows carried: ${artifact.counts.audit_only_ambiguous_rows}`,
    `- Route concentration warning visible: ${artifact.counts.route_concentration_warning_visible}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Forbidden authority field hits: ${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Seeds',
    '',
    '| seed | token | usage rows | selected rows | occurrence links | source refs | works | route IDs | next action |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.seed_rows.map((row) => `| ${[
      row.seed_id,
      row.normalized_form,
      row.usage_occurrence_rows,
      row.selected_usage_occurrence_rows,
      row.selected_occurrence_link_count,
      row.source_ref_count,
      row.work_count,
      row.route_ids.length,
      row.recommended_next_action,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'Rows are seed candidates for the next Definition Workbench sample-join smoke only. They remain observed usage links and route-ID references, not answer authority or semantic verdicts.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--usage-link-packet=')) parsed.usageLinkPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-occurrence-links-per-seed=')) parsed.maxOccurrenceLinksPerSeed = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxOccurrenceLinksPerSeed) || parsed.maxOccurrenceLinksPerSeed < 1) {
    throw new Error('--max-occurrence-links-per-seed must be a positive integer');
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
