#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  definitionWorkbenchSample: 'data/definitions/definition-workbench-sample.json',
  usageLookupIndex: '.local-cache/workbench-evidence/usage-lookup-index.json',
  selectedOccurrenceNavigationIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json',
  routeLinkCheck: '.local-cache/workbench-evidence/usage-route-link-check.json',
  selectedRouteConcentrationResponse: '.local-cache/workbench-evidence/usage-selected-route-concentration-response.json',
  output: 'data/definitions/definition-workbench-usage-link-packet.json',
  report: 'reports/definition-workbench-usage-link-packet.md',
  maxSamplesPerUsageToken: 12,
};

const options = parseArgs(process.argv.slice(2));
const sample = readJson(options.definitionWorkbenchSample);
const usageLookup = readJson(options.usageLookupIndex);
const selectedNavigation = readJson(options.selectedOccurrenceNavigationIndex);
const routeLinkCheck = readJson(options.routeLinkCheck);
const routeConcentrationResponse = readJsonIfExists(options.selectedRouteConcentrationResponse);

if (sample.artifact_type !== 'definition_workbench_sample') {
  throw new Error(`${options.definitionWorkbenchSample} is not a Definition Workbench sample`);
}
if (usageLookup.artifact_type !== 'workbench_usage_navigation_lookup_index') {
  throw new Error(`${options.usageLookupIndex} is not a usage lookup index`);
}
if (selectedNavigation.artifact_type !== 'workbench_usage_selected_occurrence_navigation_index') {
  throw new Error(`${options.selectedOccurrenceNavigationIndex} is not a selected occurrence navigation index`);
}
if (routeLinkCheck.artifact_type !== 'workbench_usage_route_link_check') {
  throw new Error(`${options.routeLinkCheck} is not a usage route-link check`);
}

const sampleRows = Array.isArray(sample.rows) ? sample.rows : [];
const usageTokenRows = Array.isArray(usageLookup.token_keys) ? usageLookup.token_keys : [];
const selectedRows = Array.isArray(selectedNavigation.navigation_rows) ? selectedNavigation.navigation_rows : [];
const sampleByTokenKey = new Map(sampleRows.map((row, index) => [row.token_key, { row, index }]));
const sampleByNormalized = new Map(sampleRows.map((row, index) => [row.normalized_form, { row, index }]));
const selectedRowsByToken = groupBy(selectedRows, (row) => row.token_key || `he:${row.token_normalized || row.focus_normalized || ''}`);
const usageByTokenKey = new Map(usageTokenRows.map((row) => [row.token_key, row]));
const usageByNormalized = new Map(usageTokenRows.map((row) => [row.token_normalized || row.focus_normalized, row]));

const linkedSampleRows = buildSampleRows();
const usageRows = buildUsageRows();
const counts = buildCounts(linkedSampleRows, usageRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_link_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_link_packet.mjs',
  policy: 'Bounded Agent 3 packet joining Definition Workbench planning rows to usage-navigation occurrence rows by token key or normalized form. It carries usage links, source/license/context metadata, and route IDs only; it does not publish source excerpts as definitions, copy route payloads, rank definitions, select visible answers, translate, or make publication claims.',
  definition_sample_contract: {
    status_axis: sample.status_axis || 'machine_route_shape_status_not_review_authority',
    review_status_axis: sample.review_status_axis || 'lexical_authority_review_status',
    review_policy: sample.review_policy || 'Machine rows are not reviewed lexical authority.',
    answer_role_policy: sample.answer_role_policy || 'Answer-role policy was not present on the input sample.',
    source_license_policy: sample.source_license_policy || 'Source/license policy was not present on the input sample.',
    multi_answer_policy: sample.multi_answer_policy || 'Multi-answer policy was not present on the input sample.',
  },
  inputs: {
    definition_workbench_sample: options.definitionWorkbenchSample,
    usage_lookup_index: options.usageLookupIndex,
    selected_occurrence_navigation_index: options.selectedOccurrenceNavigationIndex,
    route_link_check: options.routeLinkCheck,
    selected_route_concentration_response: fs.existsSync(path.join(root, options.selectedRouteConcentrationResponse)) ? options.selectedRouteConcentrationResponse : null,
  },
  authority_policy: {
    usage_navigation_only: true,
    usage_rows_not_definition_authority: true,
    review_status_not_definition_authority: true,
    route_ids_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    copies_route_payloads: false,
    copies_translation_payloads: false,
    publication_claim: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  current_overlap: {
    status: counts.sample_rows_with_usage_links > 0 ? 'current_sample_has_usage_links' : 'no_current_sample_overlap',
    note: 'The current 200-row Definition Workbench sample does not include the current selected Agent 3 usage token if sample_rows_with_usage_links is 0. This is a planning gap, not a usage evidence failure.',
  },
  sample_rows: linkedSampleRows,
  usage_token_rows: usageRows,
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
console.log(`Definition Workbench usage-link packet sample rows ${artifact.counts.sample_rows}; linked ${artifact.counts.sample_rows_with_usage_links}; usage tokens ${artifact.counts.usage_token_rows}; selected occurrence samples ${artifact.counts.selected_usage_occurrence_rows}`);

function buildSampleRows() {
  return sampleRows.map((row, index) => {
    const usageToken = usageByTokenKey.get(row.token_key) || usageByNormalized.get(row.normalized_form);
    const tokenKey = usageToken?.token_key || row.token_key;
    const selectedForToken = usageToken ? selectedRowsByToken.get(tokenKey) || [] : [];
    const routeIds = new Set(selectedForToken.flatMap((usageRow) => usageRow.related_route_ids || []));
    const routeOverlap = new Set((row.answer_card_ids || []).filter((routeId) => routeIds.has(routeId)));
    return {
      sample_row_id: `definition-workbench-sample-${String(index + 1).padStart(3, '0')}`,
      sample_row_index: index,
      token_key: row.token_key,
      normalized_form: row.normalized_form,
      status: row.status,
      status_basis: row.status_basis,
      review_status: row.review_status,
      review_status_basis: row.review_status_basis,
      occurrence_count: row.occurrence_count,
      work_count: row.work_count,
      route_card_count: row.route_card_count,
      answer_card_count: row.answer_card_count,
      evidence_only_card_count: row.evidence_only_card_count,
      multi_answer: row.multi_answer,
      source_license_complete: row.source_license_complete,
      route_answer_card_ids: Array.isArray(row.answer_card_ids) ? row.answer_card_ids : [],
      usage_link_count: usageToken?.counts?.rows || 0,
      selected_usage_link_count: selectedForToken.length,
      usage_route_ids: [...routeIds].sort(),
      route_id_overlap_count: routeOverlap.size,
      link_status: usageToken ? 'linked_current_usage_scope' : 'no_current_usage_scope_overlap',
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        not_definition_authority: true,
      },
    };
  });
}

function buildUsageRows() {
  return usageTokenRows.map((usageRow) => {
    const tokenKey = usageRow.token_key;
    const normalized = usageRow.token_normalized || usageRow.focus_normalized;
    const sampleMatch = sampleByTokenKey.get(tokenKey) || sampleByNormalized.get(normalized);
    const selectedForToken = selectedRowsByToken.get(tokenKey) || [];
    const routeIds = new Set(selectedForToken.flatMap((row) => row.related_route_ids || []));
    const sourceRefs = new Set(selectedForToken.map((row) => row.source_ref).filter(Boolean));
    const works = new Set(selectedForToken.map((row) => row.work_slug).filter(Boolean));
    const licenses = new Set(selectedForToken.map((row) => row.license).filter(Boolean));
    const usageFrames = countValues(selectedForToken.map((row) => row.usage_frame_label || row.cluster_id || 'unlabeled'));
    return {
      token_key: tokenKey,
      normalized_form: normalized,
      in_definition_workbench_sample: Boolean(sampleMatch),
      sample_row_id: sampleMatch ? `definition-workbench-sample-${String(sampleMatch.index + 1).padStart(3, '0')}` : null,
      sample_status: sampleMatch?.row?.status || null,
      sample_review_status: sampleMatch?.row?.review_status || null,
      usage_occurrence_rows: Number(usageRow.counts?.rows || 0),
      selected_usage_occurrence_rows: selectedForToken.length,
      status_counts: usageRow.counts?.status_counts || {},
      route_link_state_counts: usageRow.counts?.route_link_state_counts || {},
      route_ids: [...routeIds].sort(),
      source_refs: sourceRefs.size,
      works: works.size,
      licenses: [...licenses].sort(),
      usage_frames: usageFrames,
      audit_only_ambiguous_rows: Number(usageLookup.counts?.audit_only_counts?.ambiguous || 0),
      route_concentration_warning_visible: Number(routeConcentrationResponse?.counts?.route_concentration_warning_visible || 0) === 1,
      sample_occurrences: selectedForToken.slice().sort(compareUsageRows).slice(0, options.maxSamplesPerUsageToken).map(sampleOccurrence),
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        not_definition_authority: true,
      },
    };
  }).sort((left, right) => Number(right.selected_usage_occurrence_rows || 0) - Number(left.selected_usage_occurrence_rows || 0) || String(left.token_key || '').localeCompare(String(right.token_key || '')));
}

function sampleOccurrence(row) {
  return {
    occurrence_id: row.occurrence_id,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    context_focus_marked: row.context_focus_marked,
    route_ids: Array.isArray(row.related_route_ids) ? row.related_route_ids : [],
    license: row.license,
    license_url: row.license_url,
    version_title: row.version_title,
    version_source: row.version_source,
    occurrence_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_definition_authority: true,
    },
  };
}

function buildCounts(sampleRows, usageRows) {
  const routeIds = new Set(usageRows.flatMap((row) => row.route_ids || []));
  const selectedSamples = usageRows.flatMap((row) => row.sample_occurrences || []);
  return {
    sample_rows: sampleRows.length,
    sample_rows_with_usage_links: sampleRows.filter((row) => row.usage_link_count > 0).length,
    sample_rows_without_usage_links: sampleRows.filter((row) => row.usage_link_count === 0).length,
    sample_rows_with_selected_usage_links: sampleRows.filter((row) => row.selected_usage_link_count > 0).length,
    sample_rows_with_complete_source_license: sampleRows.filter((row) => row.source_license_complete === true).length,
    multi_answer_sample_rows: sampleRows.filter((row) => row.multi_answer === true).length,
    sample_status_counts: countValues(sampleRows.map((row) => row.status || '(missing)')),
    sample_review_status_counts: countValues(sampleRows.map((row) => row.review_status || '(missing)')),
    sample_review_verified_rows: sampleRows.filter((row) => row.review_status === 'verified' || row.status === 'verified').length,
    usage_token_rows: usageRows.length,
    usage_tokens_in_sample: usageRows.filter((row) => row.in_definition_workbench_sample).length,
    usage_tokens_not_in_sample: usageRows.filter((row) => !row.in_definition_workbench_sample).length,
    usage_occurrence_rows: usageRows.reduce((sum, row) => sum + Number(row.usage_occurrence_rows || 0), 0),
    selected_usage_occurrence_rows: usageRows.reduce((sum, row) => sum + Number(row.selected_usage_occurrence_rows || 0), 0),
    selected_sample_occurrences: selectedSamples.length,
    selected_sample_occurrences_with_source_link: selectedSamples.filter((row) => row.source_href).length,
    selected_sample_occurrences_with_work_anchor: selectedSamples.filter((row) => row.work_anchor_href).length,
    selected_sample_occurrences_with_context: selectedSamples.filter((row) => row.context_focus_marked).length,
    selected_sample_occurrences_with_license: selectedSamples.filter((row) => row.license && row.license_url).length,
    selected_sample_occurrences_with_route_ids: selectedSamples.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    audit_only_ambiguous_rows: Number(usageLookup.counts?.audit_only_counts?.ambiguous || 0),
    route_ids: routeIds.size,
    route_links_resolved: Number(routeLinkCheck.counts?.route_links_resolved || 0),
    route_links_unresolved: Number(routeLinkCheck.counts?.route_links_unresolved || 0),
    route_concentration_warning_visible: Number(routeConcentrationResponse?.counts?.route_concentration_warning_visible || 0) === 1 ? 1 : 0,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('sample_rows_present', counts.sample_rows > 0 ? 'passed' : 'failed', `sample rows ${counts.sample_rows}`),
    check('usage_tokens_present', counts.usage_token_rows > 0 ? 'passed' : 'failed', `usage token rows ${counts.usage_token_rows}`),
    check('sample_overlap_visible', counts.sample_rows_with_usage_links > 0 ? 'passed' : 'warning', `sample rows with usage links ${counts.sample_rows_with_usage_links}; usage tokens not in sample ${counts.usage_tokens_not_in_sample}`),
    check('sample_source_license_complete', counts.sample_rows_with_complete_source_license === counts.sample_rows ? 'passed' : 'failed', `complete source/license sample rows ${counts.sample_rows_with_complete_source_license}/${counts.sample_rows}`),
    check('sample_review_status_not_verified', counts.sample_review_verified_rows === 0 ? 'passed' : 'failed', `machine verified status rows ${counts.sample_review_verified_rows}`),
    check('multi_answer_warning_preserved', counts.multi_answer_sample_rows > 0 && Number(counts.sample_status_counts?.conflicting || 0) === counts.multi_answer_sample_rows ? 'passed' : 'failed', `multi-answer rows ${counts.multi_answer_sample_rows}; conflicting rows ${Number(counts.sample_status_counts?.conflicting || 0)}`),
    check('selected_usage_occurrences_present', counts.selected_usage_occurrence_rows > 0 ? 'passed' : 'failed', `selected usage occurrence rows ${counts.selected_usage_occurrence_rows}`),
    check('selected_occurrence_links_complete', counts.selected_sample_occurrences > 0 && counts.selected_sample_occurrences_with_source_link === counts.selected_sample_occurrences && counts.selected_sample_occurrences_with_work_anchor === counts.selected_sample_occurrences ? 'passed' : 'failed', `source/work links ${counts.selected_sample_occurrences_with_source_link}/${counts.selected_sample_occurrences_with_work_anchor}; samples ${counts.selected_sample_occurrences}`),
    check('selected_occurrence_context_license_complete', counts.selected_sample_occurrences_with_context === counts.selected_sample_occurrences && counts.selected_sample_occurrences_with_license === counts.selected_sample_occurrences ? 'passed' : 'failed', `context/license ${counts.selected_sample_occurrences_with_context}/${counts.selected_sample_occurrences_with_license}; samples ${counts.selected_sample_occurrences}`),
    check('route_ids_resolve_without_payloads', counts.route_ids > 0 && counts.route_links_unresolved === 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.route_links_unresolved}; payload hits ${counts.route_payload_field_hits}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `audit-only ambiguous rows ${counts.audit_only_ambiguous_rows}; reader-facing rows ${counts.reader_facing_rows}`),
    check('route_concentration_warning_preserved', counts.route_concentration_warning_visible === 1 ? 'passed' : 'warning', `route concentration warning visible ${counts.route_concentration_warning_visible}`),
    check('forbidden_authority_fields_absent', counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `forbidden authority field hits ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Link Packet',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Definition Workbench sample rows: ${artifact.counts.sample_rows}`,
    `- Sample rows with current usage links: ${artifact.counts.sample_rows_with_usage_links}`,
    `- Sample rows without current usage links: ${artifact.counts.sample_rows_without_usage_links}`,
    `- Sample rows with complete source/license flags: ${artifact.counts.sample_rows_with_complete_source_license}`,
    `- Multi-answer sample rows: ${artifact.counts.multi_answer_sample_rows}`,
    `- Machine verified sample/review rows: ${artifact.counts.sample_review_verified_rows}`,
    `- Usage token rows: ${artifact.counts.usage_token_rows}`,
    `- Usage tokens in sample / not in sample: ${artifact.counts.usage_tokens_in_sample}/${artifact.counts.usage_tokens_not_in_sample}`,
    `- Usage occurrence rows / selected occurrence rows: ${artifact.counts.usage_occurrence_rows}/${artifact.counts.selected_usage_occurrence_rows}`,
    `- Selected occurrence samples with source/work/context/license/route IDs: ${artifact.counts.selected_sample_occurrences_with_source_link}/${artifact.counts.selected_sample_occurrences_with_work_anchor}/${artifact.counts.selected_sample_occurrences_with_context}/${artifact.counts.selected_sample_occurrences_with_license}/${artifact.counts.selected_sample_occurrences_with_route_ids}`,
    `- Route IDs / unresolved route links: ${artifact.counts.route_ids}/${artifact.counts.route_links_unresolved}`,
    `- Audit-only ambiguous rows: ${artifact.counts.audit_only_ambiguous_rows}`,
    `- Route concentration warning visible: ${artifact.counts.route_concentration_warning_visible}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    `- Forbidden authority field hits: ${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Sample Status Counts',
    '',
    ...Object.entries(artifact.counts.sample_status_counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Sample Review Status Counts',
    '',
    ...Object.entries(artifact.counts.sample_review_status_counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Usage Tokens',
    '',
    '| token | in sample | usage rows | selected rows | source refs | works | route IDs | route concentration |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...artifact.usage_token_rows.map((row) => `| ${[
      row.normalized_form || row.token_key,
      row.in_definition_workbench_sample ? 'yes' : 'no',
      row.usage_occurrence_rows,
      row.selected_usage_occurrence_rows,
      row.source_refs,
      row.works,
      row.route_ids.length,
      row.route_concentration_warning_visible ? 'warning visible' : 'not flagged',
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Sample Link Status',
    '',
    '| status | rows |',
    '|---|---:|',
    `| linked_current_usage_scope | ${artifact.counts.sample_rows_with_usage_links} |`,
    `| no_current_usage_scope_overlap | ${artifact.counts.sample_rows_without_usage_links} |`,
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    artifact.definition_sample_contract.review_policy,
    '',
    'Current gap: if sample rows with current usage links is 0, the selected Agent 3 usage token is not part of the current 200-row Definition Workbench sample. This packet should guide the next sample/join step; it is not evidence of broad usage coverage.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareUsageRows(left, right) {
  return Number(right.raw_score || 0) - Number(left.raw_score || 0)
    || String(left.source_ref || '').localeCompare(String(right.source_ref || ''), undefined, { numeric: true });
}

function countValues(values) {
  const map = new Map();
  for (const value of values) map.set(value, (map.get(value) || 0) + 1);
  return Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))));
}

function groupBy(values, keyFn) {
  const grouped = new Map();
  for (const value of values) {
    const key = keyFn(value);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  return grouped;
}

function countForbiddenKeys(value) {
  const forbidden = new Set([
    'definition',
    'definition_text',
    'source_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'accepted_translation',
    'publication_status',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_links',
  ]);
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

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--definition-workbench-sample=')) parsed.definitionWorkbenchSample = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-lookup-index=')) parsed.usageLookupIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrence-navigation-index=')) parsed.selectedOccurrenceNavigationIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-link-check=')) parsed.routeLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-concentration-response=')) parsed.selectedRouteConcentrationResponse = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-usage-token=')) parsed.maxSamplesPerUsageToken = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? JSON.parse(fs.readFileSync(fullPath, 'utf8')) : null;
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
