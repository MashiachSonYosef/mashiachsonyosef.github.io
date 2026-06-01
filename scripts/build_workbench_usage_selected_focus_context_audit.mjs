#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  output: '.local-cache/workbench-evidence/usage-selected-focus-context-audit.json',
  report: 'reports/workbench-usage-selected-focus-context-audit.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}

const rows = (selectedCards.cards || []).map(buildRow).sort(compareRows);
const checks = buildChecks(rows);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_focus_context_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_focus_context_audit.mjs',
  policy: 'Audit-only focus/context marker check for selected usage-navigation cards. It verifies Hebrew focus brackets, normalized focus matching, context token counts, and repeated normalized-token occurrences inside snippets; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
  },
  authority_policy: {
    usage_navigation_only: true,
    audit_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts: buildCounts(rows),
  checks,
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected focus context audit rows ${artifact.counts.rows}; marker mismatches ${artifact.counts.focus_marker_mismatch_rows}; repeated focus snippets ${artifact.counts.repeated_focus_context_rows}`);

function buildRow(card) {
  const context = String(card.context_focus_marked || '');
  const focusNormalized = normalizeHebrew(card.focus_normalized || card.token_normalized || '');
  const markedFocuses = extractMarkedFocuses(context);
  const markedFocus = markedFocuses[0] || '';
  const markedFocusNormalized = normalizeHebrew(markedFocus);
  const contextWithoutMarkers = context.replace(/\[/g, '').replace(/\]/g, '');
  const normalizedTokens = tokenizeHebrew(contextWithoutMarkers).map((token) => normalizeHebrew(token)).filter(Boolean);
  const markedTokenIndex = findMarkedTokenIndex(context);
  const normalizedFocusOccurrences = normalizedTokens.filter((token) => token === focusNormalized).length;
  const markedFocusMatches = Boolean(focusNormalized) && markedFocusNormalized === focusNormalized;
  const singleMarker = markedFocuses.length === 1;
  const hasHebrewContext = /[\u0590-\u05ff]/.test(context);
  return {
    occurrence_id: card.occurrence_id,
    source_ref: card.source_ref,
    source_href: card.source_href,
    work_anchor_href: card.work_anchor_href,
    work_title: card.work_title,
    work_slug: card.work_slug,
    status: card.status,
    raw_score: card.raw_score,
    cluster_id: card.cluster_id,
    usage_frame_label: card.usage_frame_label,
    focus_surface: card.focus_surface,
    focus_normalized: card.focus_normalized,
    normalized_focus_key: focusNormalized,
    marked_focus_surface: markedFocus,
    marked_focus_normalized: markedFocusNormalized,
    context_focus_marked: context,
    route_ids: card.route_ids || [],
    license: card.license,
    license_url: card.license_url,
    counts: {
      focus_markers: markedFocuses.length,
      context_tokens: normalizedTokens.length,
      focus_token_index: markedTokenIndex,
      before_focus_tokens: markedTokenIndex >= 0 ? markedTokenIndex : null,
      after_focus_tokens: markedTokenIndex >= 0 ? Math.max(0, normalizedTokens.length - markedTokenIndex - 1) : null,
      normalized_focus_occurrences: normalizedFocusOccurrences,
    },
    focus_context_flags: {
      single_focus_marker: singleMarker,
      marked_focus_matches_normalized: markedFocusMatches,
      repeated_focus_in_context: normalizedFocusOccurrences > 1,
      has_hebrew_context: hasHebrewContext,
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
    },
  };
}

function buildCounts(auditRows) {
  let focusMarkerRows = 0;
  let markerMismatchRows = 0;
  let repeatedFocusRows = 0;
  let missingHebrewRows = 0;
  let totalContextTokens = 0;
  let maxContextTokens = 0;
  let routePayloadFieldHits = 0;
  for (const row of auditRows) {
    if (row.counts.focus_markers === 1) focusMarkerRows += 1;
    if (!row.focus_context_flags.marked_focus_matches_normalized) markerMismatchRows += 1;
    if (row.focus_context_flags.repeated_focus_in_context) repeatedFocusRows += 1;
    if (!row.focus_context_flags.has_hebrew_context) missingHebrewRows += 1;
    totalContextTokens += row.counts.context_tokens;
    maxContextTokens = Math.max(maxContextTokens, row.counts.context_tokens);
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    rows: auditRows.length,
    selected_cards: Number(selectedCards.counts?.cards || 0),
    focus_marker_rows: focusMarkerRows,
    focus_marker_mismatch_rows: markerMismatchRows,
    repeated_focus_context_rows: repeatedFocusRows,
    missing_hebrew_context_rows: missingHebrewRows,
    total_context_tokens: totalContextTokens,
    max_context_tokens: maxContextTokens,
    reader_facing_rows: 0,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(auditRows) {
  const counts = buildCounts(auditRows);
  return [
    check('rows_present', counts.rows > 0 ? 'passed' : 'failed', `rows ${counts.rows}`),
    check('selected_cards_join_complete', counts.rows === counts.selected_cards ? 'passed' : 'failed', `rows ${counts.rows}; selected cards ${counts.selected_cards}`),
    check('single_focus_marker_per_row', counts.focus_marker_rows === counts.rows ? 'passed' : 'failed', `single-marker rows ${counts.focus_marker_rows}/${counts.rows}`),
    check('marked_focus_matches_normalized', counts.focus_marker_mismatch_rows === 0 ? 'passed' : 'failed', `focus marker mismatch rows ${counts.focus_marker_mismatch_rows}`),
    check('hebrew_context_present', counts.missing_hebrew_context_rows === 0 ? 'passed' : 'failed', `missing Hebrew context rows ${counts.missing_hebrew_context_rows}`),
    check('repeated_focus_context_visible', counts.repeated_focus_context_rows > 0 ? 'warning' : 'passed', `rows with repeated normalized focus in context ${counts.repeated_focus_context_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', 'reader-facing rows 0'),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Focus Context Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Selected cards: ${artifact.counts.selected_cards}`,
    `- Single-marker rows: ${artifact.counts.focus_marker_rows}`,
    `- Focus marker mismatch rows: ${artifact.counts.focus_marker_mismatch_rows}`,
    `- Repeated-focus context rows: ${artifact.counts.repeated_focus_context_rows}`,
    `- Missing Hebrew context rows: ${artifact.counts.missing_hebrew_context_rows}`,
    `- Total context tokens: ${artifact.counts.total_context_tokens}`,
    `- Max context tokens: ${artifact.counts.max_context_tokens}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This audit validates focus markers and context snippets for selected usage-navigation cards. It does not rank routes, select visible answers, translate, or make meaning claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Rows',
    '',
    '| source | frame | status | marked focus | normalized focus | token index | focus occurrences | flags | context |',
    '|---|---|---|---|---|---:|---:|---|---|',
    ...artifact.rows.map((row) => `| ${[
      mdLink(row.source_ref, row.source_href),
      row.usage_frame_label || row.cluster_id,
      row.status,
      row.marked_focus_surface,
      row.focus_normalized,
      row.counts.focus_token_index,
      row.counts.normalized_focus_occurrences,
      renderFlags(row),
      row.context_focus_marked,
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function renderFlags(row) {
  const flags = [];
  if (row.focus_context_flags.single_focus_marker) flags.push('single-marker');
  if (row.focus_context_flags.marked_focus_matches_normalized) flags.push('marker-matches');
  if (row.focus_context_flags.repeated_focus_in_context) flags.push('repeated-focus-context');
  return flags.join(', ');
}

function extractMarkedFocuses(context) {
  const matches = [];
  const pattern = /\[([^\]]+)\]/g;
  let match;
  while ((match = pattern.exec(context)) !== null) matches.push(match[1]);
  return matches;
}

function findMarkedTokenIndex(context) {
  const parts = String(context || '').trim().split(/\s+/).filter(Boolean);
  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index].includes('[') && parts[index].includes(']')) return index;
  }
  return -1;
}

function tokenizeHebrew(value) {
  return String(value || '').split(/\s+/).map((token) => token.trim()).filter(Boolean);
}

function normalizeHebrew(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0591-\u05c7]/g, '')
    .replace(/[^\u05d0-\u05ea]/g, '');
}

function compareRows(a, b) {
  return String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function check(id, status, detail) {
  return { id, status, detail };
}

function countForbiddenKeys(value) {
  const forbidden = new Set([
    'definition',
    'definition_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'english',
    'english_text',
    'english_translation',
    'imported_translation',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_links',
  ]);
  let hits = 0;
  walk(value);
  return hits;

  function walk(current) {
    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, item] of Object.entries(current)) {
      if (forbidden.has(key)) hits += 1;
      walk(item);
    }
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-cards=')) parsed.selectedOccurrenceCards = cleanRelativePath(valueAfterEquals(arg));
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
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdLink(label, href) {
  if (!label) return '';
  if (!href) return label;
  return `[${String(label).replace(/\]/g, '\\]')}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
