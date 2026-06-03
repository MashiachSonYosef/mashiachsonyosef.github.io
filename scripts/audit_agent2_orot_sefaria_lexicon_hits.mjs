#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  queue: 'reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json',
  topN: 500,
  concurrency: 4,
  timeoutMs: 20000,
  baseUrl: 'https://www.sefaria.org/api/words',
  jsonReport: `reports/agent2-orot-sefaria-lexicon-hit-audit-${dateSlug}.json`,
  report: `reports/agent2-orot-sefaria-lexicon-hit-audit-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const queue = readJson(options.queue);
const queueRows = [...(queue.queue_rows || [])]
  .sort((a, b) => Number(a.source_audit_priority || a.priority || 0) - Number(b.source_audit_priority || b.priority || 0))
  .slice(0, options.topN);

const issues = [];
const warnings = [];
if (!queueRows.length) issues.push('No Orot queue rows were available for Sefaria lexicon hit audit.');

const rows = await mapLimit(queueRows, options.concurrency, auditRow);
const lexiconSummary = summarizeLexicons(rows);
const statusCounts = summarizeStatuses(rows);
const totalOccurrences = sum(rows.map((row) => row.occurrences));
const hitOccurrences = sum(rows.filter((row) => row.combined_hit_count > 0).map((row) => row.occurrences));
const hitRows = rows.filter((row) => row.combined_hit_count > 0).length;
const rowsWithRefs = rows.filter((row) => row.refs_present).length;
const rowsWithSourceUrl = rows.filter((row) => row.source_url_present).length;

if (hitRows === 0) issues.push('Sefaria audit returned zero rows with hits.');
if (hitRows > 0 && hitRows < Math.floor(rows.length * 0.25)) warnings.push('Sefaria hit rate is below 25 percent of audited rows.');
if (statusCounts.non_200 > 0) warnings.push(`Sefaria returned non-200 statuses for ${statusCounts.non_200} row query result(s).`);
if (statusCounts.errors > 0) warnings.push(`Sefaria query errors were observed for ${statusCounts.errors} row query result(s).`);

const output = {
  schema_version: 1,
  artifact_type: 'agent2_orot_sefaria_lexicon_hit_audit',
  generated_at: generatedAt,
  generator: 'scripts/audit_agent2_orot_sefaria_lexicon_hits.mjs',
  boundary: {
    status: issues.length ? 'blocked_zero_emission_sefaria_hit_audit' : (warnings.length ? 'warn_zero_emission_sefaria_hit_audit' : 'zero_emission_sefaria_hit_audit'),
    evidence_only: true,
    zero_emission: true,
    metadata_only: true,
    stores_definition_content: false,
    no_answer_rows: true,
    no_answer_candidates_emitted: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_qa_acceptance: true,
    no_publication_readiness: true,
  },
  inputs: {
    queue: options.queue,
    queue_sha256: sha256File(options.queue),
    queue_artifact_type: queue.artifact_type || null,
    queue_gap_rows: queue.queue_rows?.length ?? null,
    top_n: options.topN,
    selected_rows: queueRows.length,
    base_url: options.baseUrl,
    concurrency: options.concurrency,
    timeout_ms: options.timeoutMs,
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    answer_rows: 0,
    route_jsonl_rows: 0,
    public_hud_rows: 0,
    definition_content_rows: 0,
  },
  summary: {
    status: issues.length ? 'blocked_zero_emission_sefaria_hit_audit' : (warnings.length ? 'warn_zero_emission_sefaria_hit_audit' : 'zero_emission_sefaria_hit_audit'),
    audited_rows: rows.length,
    audited_occurrences: totalOccurrences,
    rows_with_any_hit: hitRows,
    occurrences_with_any_hit: hitOccurrences,
    row_hit_rate: rows.length ? round(hitRows / rows.length) : 0,
    occurrence_hit_rate: totalOccurrences ? round(hitOccurrences / totalOccurrences) : 0,
    rows_with_refs: rowsWithRefs,
    rows_with_source_url: rowsWithSourceUrl,
    lexicon_families_seen: lexiconSummary.length,
    answer_rows_emitted: 0,
    accepted_definition_rows_emitted: 0,
    translation_output_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    issues: issues.length,
    warnings: warnings.length,
  },
  source_queue_counts: queue.counts || null,
  status_counts: statusCounts,
  lexicon_summary: lexiconSummary,
  top_hit_rows: rows.filter((row) => row.combined_hit_count > 0).slice(0, 40).map((row) => ({
    token_id: row.token_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    category: row.category,
    combined_hit_count: row.combined_hit_count,
    lexicon_names: row.lexicon_names,
    headwords: row.headwords.slice(0, 8),
    refs_present: row.refs_present,
  })),
  rows,
  transform_blocker_summary: {
    missing_signed_license_custody_boundary: true,
    missing_allowed_morphology_relation_boundary: true,
    missing_candidate_disambiguation_rule: true,
    answer_text_not_stored_by_this_audit: true,
    no_manual_semantic_arbitration_allowed: true,
    next_required_artifacts: [
      'reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md',
      'reports/agent10-agent1-sefaria-lexicon-license-boundary-request-2026-06-03.md',
    ],
  },
  issues,
  warnings,
  what_must_not_be_accepted: [
    'QA acceptance',
    'Validated public/runtime acceptance',
    'Source custody',
    'Source/provenance acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Translation output',
    'Accepted gloss',
    'Accepted translation text',
    'Public HUD mutation',
    'Route JSONL mutation',
    'Publication readiness',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);

console.log(`Sefaria Orot lexicon hit audit complete: ${output.summary.rows_with_any_hit}/${output.summary.audited_rows} rows hit, ${output.summary.occurrences_with_any_hit}/${output.summary.audited_occurrences} occurrences covered.`);
console.log(`Report: ${options.report}`);
if (issues.length) process.exit(1);

async function auditRow(row) {
  const queries = buildQueries(row);
  const queryResults = [];
  for (const query of queries) {
    queryResults.push(await querySefaria(query));
    if (queryResults.at(-1).hit_count > 0) break;
  }
  const entries = queryResults.flatMap((result) => result.entries);
  const lexiconNames = [...new Set(entries.map((entry) => entry.parent_lexicon).filter(Boolean))].sort();
  const headwords = [...new Set(entries.map((entry) => entry.headword).filter(Boolean))].sort();
  const refsCount = sum(entries.map((entry) => entry.refs_count));
  const sourceUrlPresent = entries.some((entry) => entry.parent_lexicon_details?.source_url_present === true);
  return {
    queue_id: row.queue_id,
    source_audit_priority: row.source_audit_priority ?? row.priority ?? null,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id || null,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: Number(row.occurrences || 0),
    category: row.category,
    agent2_lane: row.agent2_lane || null,
    current_route_card_count: row.route_card_count ?? null,
    current_answer_eligible_count: row.answer_eligible_count ?? null,
    current_ambiguity_count: row.ambiguity_count ?? null,
    current_candidate_count: row.candidate_count ?? null,
    current_dominant_failure_reason: row.dominant_failure_reason || null,
    emitted_answer_row_now: false,
    answer_eligible_now: false,
    query_results: queryResults,
    combined_hit_count: entries.length,
    lexicon_names: lexiconNames,
    headwords,
    refs_present: refsCount > 0,
    refs_count: refsCount,
    source_url_present: sourceUrlPresent,
    rough_hit_class: roughHitClass(row, entries),
    answer_transform_status: entries.length ? 'metadata_hit_only_requires_transform_contract_and_license_boundary' : 'no_sefaria_metadata_hit',
  };
}

function buildQueries(row) {
  const values = [];
  for (const value of [row.surface, row.normalized]) {
    const cleaned = String(value || '').trim();
    if (cleaned && !values.includes(cleaned)) values.push(cleaned);
  }
  return values.map((value, index) => ({
    query_kind: index === 0 ? 'surface' : 'normalized',
    query: value,
  }));
}

async function querySefaria(query) {
  const url = `${options.baseUrl}/${encodeURIComponent(query.query)}`;
  const startedAt = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    clearTimeout(timeout);
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    const rawEntries = Array.isArray(json) ? json : [];
    return {
      query_kind: query.query_kind,
      query: query.query,
      url,
      status: response.status,
      elapsed_ms: Date.now() - startedAt,
      response_sha256: createHash('sha256').update(text).digest('hex'),
      hit_count: rawEntries.length,
      entries: rawEntries.map(sanitizeEntry),
    };
  } catch (error) {
    return {
      query_kind: query.query_kind,
      query: query.query,
      url,
      status: null,
      elapsed_ms: Date.now() - startedAt,
      error: error?.name === 'AbortError' ? 'timeout' : String(error?.message || error),
      hit_count: 0,
      entries: [],
    };
  }
}

function sanitizeEntry(entry) {
  const refs = Array.isArray(entry.refs) ? entry.refs.filter((value) => typeof value === 'string') : [];
  const details = entry.parent_lexicon_details || {};
  return {
    headword: stringOrNull(entry.headword),
    parent_lexicon: stringOrNull(entry.parent_lexicon),
    rid: stringOrNull(entry.rid),
    refs_count: refs.length,
    refs_sample: refs.slice(0, 5),
    derivatives_count: Array.isArray(entry.derivatives) ? entry.derivatives.length : 0,
    prev_hw_present: typeof entry.prev_hw === 'string' && entry.prev_hw.length > 0,
    next_hw_present: typeof entry.next_hw === 'string' && entry.next_hw.length > 0,
    notes_field_present: typeof entry.notes === 'string' && entry.notes.length > 0,
    notes_text_omitted: typeof entry.notes === 'string' && entry.notes.length > 0,
    entry_body_field_present: Object.hasOwn(entry, 'content'),
    entry_body_omitted: Object.hasOwn(entry, 'content'),
    parent_lexicon_details: {
      name: stringOrNull(details.name),
      language: stringOrNull(details.language),
      to_language: stringOrNull(details.to_language),
      source: stringOrNull(details.source),
      source_url_present: typeof details.source_url === 'string' && details.source_url.length > 0,
      source_url: typeof details.source_url === 'string' ? details.source_url : null,
      attribution: stringOrNull(details.attribution),
      attribution_url_present: typeof details.attribution_url === 'string' && details.attribution_url.length > 0,
      index_title: stringOrNull(details.index_title),
      version_title: stringOrNull(details.version_title),
      version_lang: stringOrNull(details.version_lang),
      text_categories: Array.isArray(details.text_categories) ? details.text_categories.slice(0, 8) : [],
    },
  };
}

function roughHitClass(row, entries) {
  if (!entries.length) return 'no_hit';
  const normalized = stripHebrewMarks(row.normalized || row.surface || '');
  const surface = stripHebrewMarks(row.surface || row.normalized || '');
  const headwords = entries.map((entry) => stripHebrewMarks(entry.headword || ''));
  if (headwords.some((headword) => headword === normalized || headword === surface)) return 'headword_exact_after_mark_strip';
  if (headwords.some((headword) => normalized.endsWith(headword) || surface.endsWith(headword))) return 'prefix_or_clitic_possible';
  return 'lexicon_metadata_hit_needs_morphology_disambiguation';
}

function summarizeLexicons(auditRows) {
  const byName = new Map();
  for (const row of auditRows) {
    const rowLexicons = new Set();
    for (const result of row.query_results) {
      for (const entry of result.entries) {
        const name = entry.parent_lexicon || 'unknown';
        rowLexicons.add(name);
        const current = byName.get(name) || {
          lexicon: name,
          row_hits: 0,
          occurrence_hits: 0,
          entry_hits: 0,
          rows_with_refs: 0,
          rows_with_source_url: 0,
          languages: new Set(),
          sources: new Set(),
          attributions: new Set(),
          version_titles: new Set(),
        };
        current.entry_hits += 1;
        if (entry.parent_lexicon_details?.language) current.languages.add(entry.parent_lexicon_details.language);
        if (entry.parent_lexicon_details?.source) current.sources.add(entry.parent_lexicon_details.source);
        if (entry.parent_lexicon_details?.attribution) current.attributions.add(entry.parent_lexicon_details.attribution);
        if (entry.parent_lexicon_details?.version_title) current.version_titles.add(entry.parent_lexicon_details.version_title);
        byName.set(name, current);
      }
    }
    for (const name of rowLexicons) {
      const current = byName.get(name);
      current.row_hits += 1;
      current.occurrence_hits += row.occurrences;
      if (row.refs_present) current.rows_with_refs += 1;
      if (row.source_url_present) current.rows_with_source_url += 1;
    }
  }
  return [...byName.values()]
    .map((entry) => ({
      lexicon: entry.lexicon,
      row_hits: entry.row_hits,
      occurrence_hits: entry.occurrence_hits,
      entry_hits: entry.entry_hits,
      rows_with_refs: entry.rows_with_refs,
      rows_with_source_url: entry.rows_with_source_url,
      languages: [...entry.languages].sort(),
      sources: [...entry.sources].sort(),
      attributions: [...entry.attributions].sort(),
      version_titles: [...entry.version_titles].sort(),
    }))
    .sort((a, b) => b.occurrence_hits - a.occurrence_hits || b.row_hits - a.row_hits || a.lexicon.localeCompare(b.lexicon));
}

function summarizeStatuses(auditRows) {
  const counts = { total_query_results: 0, ok_200: 0, non_200: 0, errors: 0 };
  for (const row of auditRows) {
    for (const result of row.query_results) {
      counts.total_query_results += 1;
      if (result.error) counts.errors += 1;
      else if (result.status === 200) counts.ok_200 += 1;
      else counts.non_200 += 1;
    }
  }
  return counts;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 2 Orot Sefaria Lexicon Hit Audit',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only Sefaria lexicon hit audit for Orot top gap rows.',
    '- The audit stores metadata only: lexicon names, headwords, refs, IDs, response hashes, and parent lexicon details.',
    '- It does not store definition content or notes text, and it emits zero answer rows, route JSONL rows, public HUD rows, accepted glosses, or translation output.',
    '- Hits are not answers. They are candidate source-discovery evidence pending transform, morphology, disambiguation, and license/custody gates.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Audited rows / occurrences: ${data.summary.audited_rows} / ${data.summary.audited_occurrences}`,
    `- Rows with any Sefaria hit: ${data.summary.rows_with_any_hit} (${pct(data.summary.row_hit_rate)})`,
    `- Occurrences covered by any hit: ${data.summary.occurrences_with_any_hit} (${pct(data.summary.occurrence_hit_rate)})`,
    `- Rows with refs: ${data.summary.rows_with_refs}`,
    `- Rows with source_url metadata: ${data.summary.rows_with_source_url}`,
    `- Lexicon families seen: ${data.summary.lexicon_families_seen}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Lexicon Families',
    '',
    '| Lexicon | Row Hits | Occurrence Hits | Entry Hits | Rows With Refs | Rows With Source URL | Sources | Versions |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |',
    ...data.lexicon_summary.map((row) => `| ${escapeMd(row.lexicon)} | ${row.row_hits} | ${row.occurrence_hits} | ${row.entry_hits} | ${row.rows_with_refs} | ${row.rows_with_source_url} | ${escapeMd(row.sources.join('; '))} | ${escapeMd(row.version_titles.join('; '))} |`),
    '',
    '## Top Hit Rows',
    '',
    '| Priority | Token | Surface | Normalized | Occurrences | Category | Hit Count | Lexicons | Rough Class |',
    '| ---: | --- | --- | --- | ---: | --- | ---: | --- | --- |',
    ...data.rows.filter((row) => row.combined_hit_count > 0).slice(0, 40).map((row) => `| ${row.source_audit_priority ?? ''} | ${row.token_id} | ${escapeMd(row.surface)} | ${escapeMd(row.normalized)} | ${row.occurrences} | ${escapeMd(row.category)} | ${row.combined_hit_count} | ${escapeMd(row.lexicon_names.join('; '))} | ${row.rough_hit_class} |`),
    '',
    '## Transform Blockers',
    '',
    '- A hit may not become `answer_eligible=true` until Agent 1/6 license and custody posture is clear for the lexicon family.',
    '- A hit may not become `answer_eligible=true` until the pipeline proves exact or allowed morphology relation for the Orot token.',
    '- A hit may not become `answer_eligible=true` until disambiguation rules select a candidate without manual semantic arbitration.',
    '- This audit intentionally stores no answer text; an approved transform must define the exact answer text field and source citation field.',
    '',
    '## Agent 8 Callback',
    '',
    '- Status: zero-emission Sefaria lexicon hit audit produced for Agent 2/Agent 10 chain.',
    `- Artifact path: ${data.outputs.markdown_report}`,
    '- Selected page or blocker: Orot flagship data-fill route; no public page mutation.',
    '- Agent 1/6 needed: yes, for lexicon-family license/custody boundary before answer transform.',
    '- Agent 2 needed: yes, for pipeline transform implementation only after signed gates.',
    '- Agent 4 needed: no, because no public/runtime output changed.',
    '- Agent 7/13 decision needed: only if mission policy changes allow storing/displaying unresolved lexicon text.',
    '- Next recommended executable route: Agent 1/6 license-boundary review plus Agent 2 transform-spec review; still emit zero answer rows until cleared.',
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${warning}`) : ['- None']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--queue') parsed.queue = cleanRelativePath(argv[++index]);
    else if (arg === '--top-n') parsed.topN = Number(argv[++index]);
    else if (arg === '--concurrency') parsed.concurrency = Number(argv[++index]);
    else if (arg === '--timeout-ms') parsed.timeoutMs = Number(argv[++index]);
    else if (arg === '--base-url') parsed.baseUrl = String(argv[++index]).replace(/\/$/, '');
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/audit_agent2_orot_sefaria_lexicon_hits.mjs [--top-n 500]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (Object.hasOwn(parsed, 'topN') && (!Number.isInteger(parsed.topN) || parsed.topN <= 0)) throw new Error('top-n must be a positive integer.');
  if (Object.hasOwn(parsed, 'concurrency') && (!Number.isInteger(parsed.concurrency) || parsed.concurrency <= 0)) throw new Error('concurrency must be a positive integer.');
  return parsed;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sha256File(relativePath) {
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function stripHebrewMarks(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0591-\u05C7]/g, '');
}

function stringOrNull(value) {
  return typeof value === 'string' && value.length ? value : null;
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

function pct(value) {
  return `${Math.round(Number(value || 0) * 1000) / 10}%`;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function escapeMd(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
}
