#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const inputPath = process.argv[2] || '.local-cache/definition-routes/source-citable-morphology-review-evidence.jsonl';
const reportPath = process.argv[3] || 'reports/morphology-review-quality-audit.md';

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedEntries(map, limit = 40) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function roleParts(row, role) {
  return asArray(row.morphology_breakdown).filter((part) => part?.role === role);
}

function textOfMeanings(part) {
  return asArray(part?.meanings).join('; ');
}

function hasDuplicatePrefix(prefixes) {
  const seen = new Set();
  for (const prefix of prefixes) {
    const key = prefix.normalized || prefix.surface || '';
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function classifyRisks(row) {
  const risks = [];
  const breakdown = asArray(row.morphology_breakdown);
  const prefixes = roleParts(row, 'prefix');
  const main = roleParts(row, 'main word')[0];
  const endings = roleParts(row, 'ending');
  const mainText = textOfMeanings(main);

  if (!breakdown.length) risks.push('missing_breakdown');
  if (row.candidate_status !== 'proposed') risks.push('not_review_only');
  if (prefixes.length > 1) risks.push('stacked_prefixes');
  if (hasDuplicatePrefix(prefixes)) risks.push('duplicate_prefix');
  if (endings.length && String(main?.normalized || '').length <= 2) risks.push('short_base_with_suffix');
  if (prefixes.length && /direct-object marker|object marker/i.test(mainText)) risks.push('object_marker_base_with_prefix');
  if (/\b[A-Z][a-z]+,\s*(biblical|place|person|name|gem|king|town|city)\b/.test(mainText) || /;\s*[A-Z][a-z]+(?:$|;)/.test(mainText)) {
    risks.push('proper_name_like_base');
  }
  if (/\(;|;\s*(he|it|shall|are \(|any other form)\b/i.test(mainText) || /\([^)]*$/.test(mainText)) {
    risks.push('fragmentary_base_gloss');
  }
  if (String(row.definition || '').length > 180) risks.push('long_combined_definition');
  return risks;
}

async function readJsonl(relativePath, onRow) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing morphology review JSONL: ${relativePath}`);
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let rows = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    rows += 1;
    onRow(JSON.parse(trimmed), rows);
  }
  return rows;
}

const stats = {
  rows_read: 0,
  morphology_rows: 0,
  proposed_morphology_rows: 0,
  risky_morphology_rows: 0,
  clean_morphology_rows: 0,
  distinct_morphology_focus_tokens: 0,
};
const riskCounts = new Map();
const workCounts = new Map();
const statusCounts = new Map();
const licenseCounts = new Map();
const focusTokens = new Set();
const samples = [];

stats.rows_read = await readJsonl(inputPath, (row) => {
  const isMorphology = row.source_definition_route_family === 'project_morphology' || Array.isArray(row.morphology_breakdown);
  if (!isMorphology) return;

  stats.morphology_rows += 1;
  if (row.candidate_status === 'proposed') stats.proposed_morphology_rows += 1;
  count(statusCounts, row.candidate_status || '(missing)');
  count(workCounts, row.work_id || '(missing)');
  if (row.focus_normalized) focusTokens.add(row.focus_normalized);
  for (const sourceRow of asArray(row.source_rows)) count(licenseCounts, sourceRow?.license || '(missing)');

  const risks = classifyRisks(row);
  if (risks.length) {
    stats.risky_morphology_rows += 1;
    for (const risk of risks) count(riskCounts, risk);
    if (samples.length < 40) {
      const main = roleParts(row, 'main word')[0] || {};
      samples.push({
        evidence_id: row.evidence_id || '',
        focus_surface: row.focus_surface || '',
        focus_normalized: row.focus_normalized || '',
        work_id: row.work_id || '',
        source_ref: row.source_ref || '',
        candidate_status: row.candidate_status || '',
        raw_score: row.raw_score,
        adjusted_score: row.adjusted_score,
        main_surface: main.surface || '',
        main_normalized: main.normalized || '',
        roles: asArray(row.morphology_breakdown).map((part) => part?.role || '').filter(Boolean).join(' + '),
        risks,
      });
    }
  } else {
    stats.clean_morphology_rows += 1;
  }
});

stats.distinct_morphology_focus_tokens = focusTokens.size;

const report = [
  '# Morphology Review Quality Audit',
  '',
  'Generated from the local morphology-review citable evidence JSONL.',
  '',
  '## Scope',
  '',
  `- Input: ${inputPath}`,
  '- This report inspects proposed prefix/suffix morphology routes only.',
  '- It does not promote morphology rows to accepted status.',
  '- Sample rows identify evidence IDs and source refs only; full definitions remain in the local cache for review.',
  '',
  '## Counts',
  '',
  `- Rows read: ${stats.rows_read}`,
  `- Morphology rows: ${stats.morphology_rows}`,
  `- Proposed morphology rows: ${stats.proposed_morphology_rows}`,
  `- Risk-flagged morphology rows: ${stats.risky_morphology_rows}`,
  `- Clean morphology rows: ${stats.clean_morphology_rows}`,
  `- Distinct morphology focus tokens: ${stats.distinct_morphology_focus_tokens}`,
  '',
  '## Candidate Statuses',
  '',
  ...sortedEntries(statusCounts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Risk Flags',
  '',
  ...sortedEntries(riskCounts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Source Licenses',
  '',
  ...sortedEntries(licenseCounts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Works',
  '',
  ...sortedEntries(workCounts, 20).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Sample Risk Rows',
  '',
  ...samples.map((row) => `- ${row.evidence_id} | ${row.focus_surface} | ${row.work_id} | ${row.source_ref} | ${row.roles} | base=${row.main_surface}/${row.main_normalized} | risks=${row.risks.join(',')}`),
  '',
].join('\n');

fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report, 'utf8');

console.log(`Morphology review quality audit complete. Risk rows: ${stats.risky_morphology_rows}. Report: ${reportPath}`);
