#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  selectedSourceDiversity: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  selectedSignatureIndependence: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  selectedRouteConcentrationResponse: '.local-cache/workbench-evidence/usage-selected-route-concentration-response.json',
  output: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  report: 'reports/workbench-usage-selected-occurrence-cards.md',
  maxSignatureSamples: 2,
  maxRelatedPerSignature: 3,
};

const options = parseArgs(process.argv.slice(2));
const selectedOccurrences = readJson(options.selectedOccurrences);
const sourceDiversity = readJson(options.selectedSourceDiversity);
const signatureIndependence = readJson(options.selectedSignatureIndependence);
const routeConcentrationResponse = readJson(options.selectedRouteConcentrationResponse);

assertType(selectedOccurrences, 'workbench_usage_navigation_selected_occurrences', options.selectedOccurrences);
assertType(sourceDiversity, 'workbench_usage_selected_source_diversity', options.selectedSourceDiversity);
assertType(signatureIndependence, 'workbench_usage_selected_signature_independence', options.selectedSignatureIndependence);
assertType(routeConcentrationResponse, 'workbench_usage_selected_route_concentration_response', options.selectedRouteConcentrationResponse);

const sourceDiversityById = indexByOccurrenceId(sourceDiversity.rows || []);
const signatureById = indexByOccurrenceId(signatureIndependence.rows || []);
const routeConcentrationById = indexByOccurrenceId(routeConcentrationResponse.rows || []);
const cards = (selectedOccurrences.rows || []).map(buildCard).sort(compareCards);
const checks = buildChecks();
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_occurrence_cards',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_occurrence_cards.mjs',
  policy: 'Audit-only selected occurrence inspection cards for the usage-navigation/concordance lane. Cards preserve clickable occurrence links, Hebrew context, token metadata, source/version/license metadata, route IDs, and QA flags; they do not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    selected_occurrences: options.selectedOccurrences,
    selected_source_diversity: options.selectedSourceDiversity,
    selected_signature_independence: options.selectedSignatureIndependence,
    selected_route_concentration_response: options.selectedRouteConcentrationResponse,
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
  counts: buildCounts(cards),
  checks,
  cards,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected occurrence cards ${artifact.counts.cards}; context ${artifact.counts.cards_with_context}; related signatures ${artifact.counts.cards_with_related_signatures}`);

function buildCard(row) {
  const occurrenceId = row.occurrence_id;
  const sourceRow = sourceDiversityById.get(occurrenceId);
  const signatureRow = signatureById.get(occurrenceId);
  const routeRow = routeConcentrationById.get(occurrenceId);
  const context = row.context_focus_marked || sourceRow?.context_focus_marked || signatureRow?.context_focus_marked || '';
  const routeWarningVisible = routeRow?.route_concentration_flags?.route_concentration_warning_visible === true
    || Number(routeConcentrationResponse.counts?.route_concentration_warning_visible || 0) === 1;
  const sourceFlags = sourceRow?.source_diversity_flags || {};
  const signatureFlags = signatureRow?.independence_flags || {};
  const signatureSamples = summarizeSignatures(signatureRow);

  return {
    occurrence_id: occurrenceId,
    candidate_id: row.candidate_id || sourceRow?.candidate_id || signatureRow?.candidate_id || null,
    token_key: row.token_key || sourceRow?.token_key || signatureRow?.token_key || null,
    token_surface: row.token_surface || null,
    token_normalized: row.token_normalized || null,
    focus_surface: row.focus_surface || sourceRow?.focus_surface || signatureRow?.focus_surface || null,
    focus_normalized: row.focus_normalized || sourceRow?.focus_normalized || signatureRow?.focus_normalized || null,
    source_ref: row.source_ref || sourceRow?.source_ref || signatureRow?.source_ref || routeRow?.source_ref || null,
    source_href: row.source_href || sourceRow?.source_href || signatureRow?.source_href || routeRow?.source_href || null,
    work_anchor_href: row.work_anchor_href || sourceRow?.work_anchor_href || signatureRow?.work_anchor_href || routeRow?.work_anchor_href || null,
    work_id: row.work_id || sourceRow?.work_id || null,
    work_title: row.work_title || sourceRow?.work_title || signatureRow?.work_title || routeRow?.work_title || null,
    work_slug: row.work_slug || sourceRow?.work_slug || signatureRow?.work_slug || routeRow?.work_slug || null,
    category: sourceRow?.category || categoryFromSlug(row.work_slug || sourceRow?.work_slug || signatureRow?.work_slug || routeRow?.work_slug),
    unit_id: row.unit_id || sourceRow?.unit_id || null,
    status: row.status || sourceRow?.status || signatureRow?.status || routeRow?.status || null,
    raw_score: row.raw_score ?? sourceRow?.raw_score ?? signatureRow?.raw_score ?? routeRow?.raw_score ?? null,
    navigation_label: row.navigation_label || null,
    route_link_state: row.route_link_state || null,
    cluster_id: row.cluster_id || sourceRow?.cluster_id || signatureRow?.cluster_id || routeRow?.cluster_id || null,
    usage_frame_label: row.usage_frame_label || sourceRow?.usage_frame_label || signatureRow?.usage_frame_label || routeRow?.usage_frame_label || null,
    phrase_context_hebrew: context,
    context_focus_marked: context,
    context_has_focus_marker: context.includes('[') && context.includes(']'),
    version_title: row.version_title || sourceRow?.version_title || null,
    version_source: row.version_source || sourceRow?.version_source || null,
    license: row.license || sourceRow?.license || signatureRow?.license || routeRow?.license || null,
    license_url: row.license_url || sourceRow?.license_url || signatureRow?.license_url || routeRow?.license_url || null,
    route_ids: Array.isArray(row.route_ids) ? row.route_ids : [],
    slice_ids: Array.isArray(row.slice_ids) ? row.slice_ids : [],
    source_diversity_flags: {
      duplicate_source_ref: sourceFlags.duplicate_source_ref === true,
      duplicate_work_anchor: sourceFlags.duplicate_work_anchor === true,
      observed_usage_only: true,
      reader_facing: false,
    },
    signature_independence_flags: {
      has_recurring_signature: signatureFlags.has_recurring_signature === true,
      has_cross_cluster_signature: signatureFlags.has_cross_cluster_signature === true,
      observed_usage_only: true,
      reader_facing: false,
    },
    route_concentration_flags: {
      route_concentration_warning_visible: routeWarningVisible,
      observed_usage_only: true,
      reader_facing: false,
    },
    card_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      has_hebrew_focus: hasHebrew(row.focus_normalized || sourceRow?.focus_normalized || signatureRow?.focus_normalized || ''),
      has_hebrew_context: hasHebrew(context),
      has_mojibake_in_token_or_context: hasMojibake([
        row.token_key,
        row.token_surface,
        row.token_normalized,
        row.focus_surface,
        row.focus_normalized,
        context,
      ].join(' ')),
    },
    signature_summary: {
      signature_memberships: Number(signatureRow?.counts?.signature_memberships || 0),
      recurring_signature_memberships: Number(signatureRow?.counts?.recurring_signature_memberships || 0),
      cross_cluster_signature_memberships: Number(signatureRow?.counts?.cross_cluster_signature_memberships || 0),
      related_occurrences_listed: signatureSamples.reduce((sum, sample) => sum + sample.related_occurrences.length, 0),
    },
    signature_samples: signatureSamples,
  };
}

function summarizeSignatures(signatureRow) {
  if (!signatureRow) return [];
  const signatures = [
    ...(signatureRow.recurring_signatures || []).map((signature) => ({ ...signature, signature_kind: 'recurring' })),
    ...(signatureRow.cross_cluster_signatures || []).map((signature) => ({ ...signature, signature_kind: 'cross_cluster' })),
  ];
  const seen = new Set();
  const samples = [];
  for (const signature of signatures) {
    const signatureId = signature.signature_id || `${signature.signature_kind}:${signature.signature_display}`;
    if (seen.has(signatureId)) continue;
    seen.add(signatureId);
    samples.push({
      signature_id: signature.signature_id || null,
      signature_kind: signature.signature_kind,
      window_radius: signature.window_radius ?? null,
      signature_display: signature.signature_display || null,
      occurrences: Number(signature.occurrences || 0),
      clusters: Number(signature.clusters || 0),
      route_ids: Array.isArray(signature.route_ids) ? signature.route_ids : [],
      related_occurrences: (signature.related_occurrences || []).slice(0, options.maxRelatedPerSignature).map((related) => ({
        occurrence_id: related.occurrence_id || null,
        source_ref: related.source_ref || null,
        source_href: related.source_href || null,
        work_anchor_href: related.work_anchor_href || null,
        work_title: related.work_title || null,
        work_slug: related.work_slug || null,
        status: related.status || null,
        raw_score: related.raw_score ?? null,
        cluster_id: related.cluster_id || null,
        usage_frame_label: related.usage_frame_label || null,
        license: related.license || null,
        license_url: related.license_url || null,
      })),
    });
    if (samples.length >= options.maxSignatureSamples) break;
  }
  return samples;
}

function buildCounts(rows) {
  const sourceRefs = new Set();
  const workAnchors = new Set();
  const works = new Set();
  const clusters = new Set();
  const routeIds = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let cardsWithContext = 0;
  let cardsWithFocusMarker = 0;
  let cardsWithRouteIds = 0;
  let duplicateSourceRefRows = 0;
  let duplicateWorkAnchorRows = 0;
  let cardsWithRecurring = 0;
  let cardsWithCrossCluster = 0;
  let cardsWithRelatedSignatures = 0;
  let signatureSamples = 0;
  let relatedOccurrenceSamples = 0;
  let routeWarningRows = 0;
  let mojibakeRows = 0;
  let hebrewFocusRows = 0;
  let hebrewContextRows = 0;
  for (const row of rows) {
    if (row.source_ref) sourceRefs.add(row.source_ref);
    if (row.work_anchor_href) workAnchors.add(row.work_anchor_href);
    if (row.work_slug || row.work_id || row.work_title) works.add(row.work_slug || row.work_id || row.work_title);
    if (row.cluster_id) clusters.add(row.cluster_id);
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    if (row.context_focus_marked) cardsWithContext += 1;
    if (row.context_has_focus_marker) cardsWithFocusMarker += 1;
    if ((row.route_ids || []).length) cardsWithRouteIds += 1;
    if (row.source_diversity_flags.duplicate_source_ref) duplicateSourceRefRows += 1;
    if (row.source_diversity_flags.duplicate_work_anchor) duplicateWorkAnchorRows += 1;
    if (row.signature_independence_flags.has_recurring_signature) cardsWithRecurring += 1;
    if (row.signature_independence_flags.has_cross_cluster_signature) cardsWithCrossCluster += 1;
    if (row.signature_samples.length) cardsWithRelatedSignatures += 1;
    signatureSamples += row.signature_samples.length;
    relatedOccurrenceSamples += row.signature_summary.related_occurrences_listed;
    if (row.route_concentration_flags.route_concentration_warning_visible) routeWarningRows += 1;
    if (row.card_flags.has_mojibake_in_token_or_context) mojibakeRows += 1;
    if (row.card_flags.has_hebrew_focus) hebrewFocusRows += 1;
    if (row.card_flags.has_hebrew_context) hebrewContextRows += 1;
  }
  return {
    cards: rows.length,
    selected_occurrence_refs: Number(selectedOccurrences.counts?.occurrence_refs || 0),
    unique_source_refs: sourceRefs.size,
    unique_work_anchors: workAnchors.size,
    unique_works: works.size,
    clusters: clusters.size,
    route_ids: routeIds.size,
    status_counts: statusCounts,
    cards_with_context: cardsWithContext,
    cards_with_focus_marker: cardsWithFocusMarker,
    cards_with_route_ids: cardsWithRouteIds,
    duplicate_source_ref_rows: duplicateSourceRefRows,
    duplicate_work_anchor_rows: duplicateWorkAnchorRows,
    cards_with_recurring_signatures: cardsWithRecurring,
    cards_with_cross_cluster_signatures: cardsWithCrossCluster,
    cards_with_related_signatures: cardsWithRelatedSignatures,
    signature_samples: signatureSamples,
    related_occurrence_samples: relatedOccurrenceSamples,
    route_concentration_warning_rows: routeWarningRows,
    route_concentration_warning_visible: Number(routeConcentrationResponse.counts?.route_concentration_warning_visible || 0),
    hebrew_focus_rows: hebrewFocusRows,
    hebrew_context_rows: hebrewContextRows,
    mojibake_token_or_context_rows: mojibakeRows,
    reader_facing_rows: 0,
    route_payload_field_hits: countForbiddenKeys(rows),
  };
}

function buildChecks() {
  const counts = buildCounts(cards);
  const selectedCount = Number(selectedOccurrences.counts?.occurrence_refs || 0);
  return [
    check('cards_present', cards.length > 0 ? 'passed' : 'failed', `cards ${cards.length}`),
    check('selected_join_complete', cards.length === selectedCount ? 'passed' : 'failed', `cards ${cards.length}; selected occurrences ${selectedCount}`),
    check('source_diversity_join_complete', cards.length === Number(sourceDiversity.counts?.selected_occurrence_refs || 0) ? 'passed' : 'failed', `source diversity rows ${sourceDiversity.counts?.selected_occurrence_refs || 0}`),
    check('signature_independence_join_complete', cards.length === Number(signatureIndependence.counts?.selected_occurrence_refs || 0) ? 'passed' : 'failed', `signature rows ${signatureIndependence.counts?.selected_occurrence_refs || 0}`),
    check('route_concentration_join_complete', cards.length === Number(routeConcentrationResponse.counts?.selected_occurrence_refs || 0) ? 'passed' : 'failed', `route concentration rows ${routeConcentrationResponse.counts?.selected_occurrence_refs || 0}`),
    check('context_focus_markers_present', counts.cards_with_focus_marker === cards.length ? 'passed' : 'failed', `focus markers ${counts.cards_with_focus_marker}/${cards.length}`),
    check('hebrew_focus_present', counts.hebrew_focus_rows === cards.length ? 'passed' : 'failed', `Hebrew focus rows ${counts.hebrew_focus_rows}/${cards.length}`),
    check('mojibake_absent_in_token_context', counts.mojibake_token_or_context_rows === 0 ? 'passed' : 'failed', `mojibake token/context rows ${counts.mojibake_token_or_context_rows}`),
    check('route_concentration_warning_visible', counts.route_concentration_warning_visible === 1 ? 'warning' : 'passed', `route warning visible ${counts.route_concentration_warning_visible}; affected cards ${counts.route_concentration_warning_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', 'reader-facing rows 0'),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Occurrence Cards',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Cards: ${artifact.counts.cards}`,
    `- Source refs: ${artifact.counts.unique_source_refs}`,
    `- Work anchors: ${artifact.counts.unique_work_anchors}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Cards with context: ${artifact.counts.cards_with_context}`,
    `- Cards with focus marker: ${artifact.counts.cards_with_focus_marker}`,
    `- Duplicate source-ref rows: ${artifact.counts.duplicate_source_ref_rows}`,
    `- Recurring signature rows: ${artifact.counts.cards_with_recurring_signatures}`,
    `- Cross-cluster signature rows: ${artifact.counts.cards_with_cross_cluster_signatures}`,
    `- Cards with related signatures: ${artifact.counts.cards_with_related_signatures}`,
    `- Related occurrence samples: ${artifact.counts.related_occurrence_samples}`,
    `- Route concentration warning visible: ${artifact.counts.route_concentration_warning_visible}`,
    `- Mojibake token/context rows: ${artifact.counts.mojibake_token_or_context_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'These cards are audit-only usage-navigation rows. They preserve links, Hebrew context, source/version/license metadata, route IDs, and QA flags. They do not rank routes, select visible answers, translate, or make meaning claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Cards',
    '',
    '| source | local anchor | focus | normalized | frame | status | score | flags | route ids | license | context | related signatures |',
    '|---|---|---|---|---|---|---:|---|---|---|---|---|',
    ...artifact.cards.map((card) => `| ${[
      mdLink(card.source_ref, card.source_href),
      mdLink(card.unit_id || card.source_ref, card.work_anchor_href),
      card.focus_surface,
      card.focus_normalized,
      card.usage_frame_label || card.cluster_id,
      card.status,
      card.raw_score,
      renderFlags(card),
      card.route_ids.join(', '),
      mdLink(card.license, card.license_url),
      card.context_focus_marked,
      renderSignatureSamples(card.signature_samples),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function renderFlags(card) {
  const flags = [];
  if (card.source_diversity_flags.duplicate_source_ref) flags.push('duplicate-source');
  if (card.signature_independence_flags.has_recurring_signature) flags.push('recurring-signature');
  if (card.signature_independence_flags.has_cross_cluster_signature) flags.push('cross-cluster-signature');
  if (card.route_concentration_flags.route_concentration_warning_visible) flags.push('route-concentration-warning');
  return flags.join(', ') || 'observed-usage-only';
}

function renderSignatureSamples(samples) {
  return samples.map((sample) => {
    const related = sample.related_occurrences.map((occurrence) => mdLink(occurrence.source_ref, occurrence.source_href)).join('; ');
    return `${sample.signature_kind}: ${sample.signature_display || sample.signature_id || '(signature)'}${related ? ` -> ${related}` : ''}`;
  }).join('<br>');
}

function indexByOccurrenceId(rows) {
  return new Map(rows.filter((row) => row.occurrence_id).map((row) => [row.occurrence_id, row]));
}

function compareCards(a, b) {
  return String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.work_slug || '').localeCompare(String(b.work_slug || ''))
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function check(id, status, detail) {
  return { id, status, detail };
}

function assertType(artifact, expectedType, relativePath) {
  if (artifact.artifact_type !== expectedType) throw new Error(`${relativePath} is not ${expectedType}`);
}

function categoryFromSlug(slug) {
  return String(slug || '').split('/').filter(Boolean)[0] || 'unknown';
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasMojibake(value) {
  return /[\u00d7\u00d6\ufffd]/.test(String(value || ''));
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
    if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-source-diversity=')) parsed.selectedSourceDiversity = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-signature-independence=')) parsed.selectedSignatureIndependence = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-concentration-response=')) parsed.selectedRouteConcentrationResponse = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-signature-samples=')) parsed.maxSignatureSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else if (arg.startsWith('--max-related-per-signature=')) parsed.maxRelatedPerSignature = Math.max(0, Number(valueAfterEquals(arg)) || 0);
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
