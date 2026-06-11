#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  lookupDir: 'data/definitions/hud-route-lookup',
  outCsv: 'data/definitions/hud-route-card-sample.csv',
  outReport: 'reports/hud-route-card-csv-report.md',
  limit: 500,
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--lookup-dir') args.lookupDir = argv[++i];
    else if (arg === '--out-csv') args.outCsv = argv[++i];
    else if (arg === '--out-report') args.outReport = argv[++i];
    else if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--full') args.limit = 0;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.limit) || args.limit < 0) {
    throw new Error(`Invalid --limit: ${args.limit}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/export_hud_route_cards_csv.mjs',
    '',
    'Options:',
    '  --lookup-dir data/definitions/hud-route-lookup',
    '  --out-csv data/definitions/hud-route-card-sample.csv',
    '  --out-report reports/hud-route-card-csv-report.md',
    '  --limit 500',
    '  --full',
  ].join('\n');
}

function abs(relPath) {
  return path.join(root, relPath);
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(abs(relPath), 'utf8'));
}

function writeText(relPath, content) {
  fs.mkdirSync(path.dirname(abs(relPath)), { recursive: true });
  fs.writeFileSync(abs(relPath), content, 'utf8');
}

function serializeCellValue(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined && item !== '')
      .map(serializeCellValue)
      .join('; ');
  }
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

function csvCell(value) {
  const text = serializeCellValue(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ''))];
}

function sourceValues(rows, field) {
  return unique(rows.map((row) => row?.[field]).flat().filter(Boolean));
}

function phraseFocus(card) {
  return unique((card.phrase_tokens || [])
    .filter((token) => String(token.role || '').includes('focus'))
    .map((token) => token.surface || token.normalized));
}

function phraseContext(card) {
  return (card.phrase_tokens || [])
    .filter((token) => !String(token.role || '').includes('focus'))
    .map((token) => token.surface || token.normalized);
}

const columns = [
  'lookup_shard',
  'normalized',
  'surface',
  'hebrew',
  'display_section',
  'display_label',
  'route_family',
  'route_type',
  'match_type',
  'language',
  'definition_or_claim',
  'plain_note',
  'phrase_hebrew',
  'phrase_focus',
  'phrase_context',
  'source_ref',
  'work_id',
  'work_title',
  'raw_score',
  'score_handicap',
  'adjusted_score',
  'confidence_percent',
  'answer_score',
  'answer_eligible',
  'answer_role',
  'context_rank_score',
  'part_of_speech',
  'meaning_quality',
  'form_of',
  'morphology',
  'source_row_count',
  'source_names',
  'source_families',
  'source_ids',
  'licenses',
  'license_urls',
  'source_urls',
  'fields_used',
  'source_notes',
  'card_id',
];

function flattenCard(card, shard) {
  const rows = Array.isArray(card.source_rows) ? card.source_rows : [];
  return {
    lookup_shard: shard,
    normalized: card.normalized || '',
    surface: card.surface || '',
    hebrew: card.hebrew || card.surface || '',
    display_section: card.display_section || '',
    display_label: card.display_label || '',
    route_family: card.route_family || '',
    route_type: card.route_type || '',
    match_type: card.match_type || '',
    language: card.language || '',
    definition_or_claim: card.meaning_claim || card.definition || '',
    plain_note: card.plain_note || '',
    phrase_hebrew: card.phrase_hebrew || '',
    phrase_focus: phraseFocus(card),
    phrase_context: phraseContext(card),
    source_ref: card.source_ref || '',
    work_id: card.work_id || '',
    work_title: card.work_title || '',
    raw_score: Number.isFinite(card.raw_score) ? card.raw_score : '',
    score_handicap: Number.isFinite(card.score_handicap) ? card.score_handicap : '',
    adjusted_score: Number.isFinite(card.adjusted_score) ? card.adjusted_score : '',
    confidence_percent: Number.isFinite(card.confidence_percent) ? card.confidence_percent : '',
    answer_score: Number.isFinite(card.answer_score) ? card.answer_score : '',
    answer_eligible: typeof card.answer_eligible === 'boolean' ? card.answer_eligible : '',
    answer_role: card.answer_role || '',
    context_rank_score: Number.isFinite(card.context_rank_score) ? card.context_rank_score : '',
    part_of_speech: card.part_of_speech || '',
    meaning_quality: card.meaning_quality || '',
    form_of: card.form_of || '',
    morphology: card.morphology ? JSON.stringify(card.morphology) : '',
    source_row_count: rows.length,
    source_names: sourceValues(rows, 'source_name'),
    source_families: sourceValues(rows, 'source_family'),
    source_ids: sourceValues(rows, 'source_id'),
    licenses: sourceValues(rows, 'license'),
    license_urls: sourceValues(rows, 'license_url'),
    source_urls: sourceValues(rows, 'source_url'),
    fields_used: sourceValues(rows, 'fields_used'),
    source_notes: sourceValues(rows, 'notes'),
    card_id: card.card_id || '',
  };
}

function increment(map, key) {
  const safeKey = key || '(blank)';
  map.set(safeKey, (map.get(safeKey) || 0) + 1);
}

function renderTopCounts(title, counts, maxRows = 12) {
  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxRows);
  return [
    `### ${title}`,
    '',
    '| Value | Cards |',
    '| --- | ---: |',
    ...rows.map(([value, count]) => `| ${value.replace(/\|/g, '\\|')} | ${count} |`),
    '',
  ].join('\n');
}

function renderCsv(rows) {
  return [
    columns.map(csvCell).join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')),
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const manifestPath = path.join(args.lookupDir, 'manifest.json').replace(/\\/g, '/');
  const manifest = readJson(manifestPath);
  const rows = [];
  const counts = {
    sections: new Map(),
    routeTypes: new Map(),
    answerEligible: new Map(),
    answerRoles: new Map(),
    sourceFamilies: new Map(),
    licenses: new Map(),
  };
  let cardsSeen = 0;

  for (const shardInfo of manifest.shards || []) {
    const shardRel = path.join(args.lookupDir, shardInfo.path).replace(/\\/g, '/');
    const shard = readJson(shardRel);
    for (const [normalized, cards] of Object.entries(shard.routes_by_normalized || {})) {
      for (const card of cards || []) {
        cardsSeen += 1;
        increment(counts.sections, card.display_section);
        increment(counts.routeTypes, card.route_type);
        increment(counts.answerEligible, typeof card.answer_eligible === 'boolean' ? String(card.answer_eligible) : '(missing)');
        increment(counts.answerRoles, card.answer_role);
        for (const family of sourceValues(card.source_rows || [], 'source_family')) increment(counts.sourceFamilies, family);
        for (const license of sourceValues(card.source_rows || [], 'license')) increment(counts.licenses, license);
        if (!card.normalized) card.normalized = normalized;
        if (!args.limit || rows.length < args.limit) rows.push(flattenCard(card, shardInfo.shard || shard.shard || ''));
      }
    }
  }

  writeText(args.outCsv, `\uFEFF${renderCsv(rows)}`);
  const report = [
    '# HUD Route Card CSV Report',
    '',
    'This CSV is a human-readable mirror of the route-card lookup contract. It is intentionally route-card shaped, not the old public lexical claim export.',
    '',
    'Boundary: QA mirror only. It preserves `answer_eligible`, `answer_role`, and source/license rows from the HUD route lookup; it does not create accepted translation text or publication readiness.',
    '',
    '## Files',
    '',
    `- CSV: \`${args.outCsv}\``,
    `- Lookup manifest: \`${manifestPath}\``,
    '- Encoding: UTF-8 with BOM for spreadsheet compatibility.',
    '',
    '## Counts',
    '',
    `- Cards in lookup: ${cardsSeen}`,
    `- CSV rows written: ${rows.length}${args.limit ? ` of limit ${args.limit}` : ' (full export)'}`,
    `- Distinct normalized tokens: ${manifest.counts?.distinct_normalized_tokens ?? 'N/A'}`,
    `- Shards: ${manifest.counts?.shard_count ?? manifest.shards?.length ?? 'N/A'}`,
    `- Max shard bytes: ${manifest.counts?.max_shard_bytes ?? 'N/A'}`,
    '',
    '## Columns',
    '',
    columns.map((column) => `- \`${column}\``).join('\n'),
    '',
    renderTopCounts('Sections', counts.sections),
    renderTopCounts('Route Types', counts.routeTypes),
    renderTopCounts('Answer Eligible', counts.answerEligible),
    renderTopCounts('Answer Roles', counts.answerRoles),
    renderTopCounts('Source Families', counts.sourceFamilies),
    renderTopCounts('Licenses', counts.licenses),
    '## Regenerate',
    '',
    '```powershell',
    'node scripts\\export_hud_route_cards_csv.mjs',
    '```',
    '',
    'For a full local export, use `--full --out-csv .local-cache/hud-route-card-index.csv` so the large CSV does not become a tracked site artifact by accident.',
    '',
  ].join('\n');
  writeText(args.outReport, report);

  console.log(JSON.stringify({
    lookup_manifest: manifestPath,
    out_csv: args.outCsv,
    out_report: args.outReport,
    cards_seen: cardsSeen,
    rows_written: rows.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
