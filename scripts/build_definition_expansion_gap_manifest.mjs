#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();

const defaults = {
  coverageDir: 'data/reports/coverage',
  unresolvedDir: 'data/lexical/unresolved',
  routeLookupDir: 'data/definitions/hud-route-lookup',
  sourceLicenseInventory: 'data/definitions/source-license-inventory.json',
  outJson: 'data/definitions/definition-expansion-gap-manifest.json',
  outCsv: 'data/definitions/definition-expansion-gap-manifest.csv',
  report: 'reports/definition-expansion-gap-manifest-2026-06-11.md',
  limit: 5000,
  topWorksPerRow: 5,
  topSurfacesPerRow: 5,
  ncReportLimit: 50,
  fullCsv: false,
};

const options = parseArgs(process.argv.slice(2));

const sourceInventory = readJsonIfExists(options.sourceLicenseInventory, { sources: [] });
const acceptedSourceFamilies = new Set(
  (sourceInventory.sources || [])
    .filter((source) => source.accepted === true && source.public_use === true)
    .map((source) => source.source_family)
);
const shardCache = new Map();

const coverageByWork = loadCoverage();
const aggregate = await loadUnresolved();
const topRows = [...aggregate.values()]
  .sort((a, b) => b.occurrence_count - a.occurrence_count || b.work_count - a.work_count || a.normalized.localeCompare(b.normalized))
  .slice(0, options.limit)
  .map(enrichRow);

const familyTotals = summarizeByFamily(aggregate);
const candidateMatrix = buildCandidateMatrix();

const manifest = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  inputs: {
    coverage_dir: options.coverageDir,
    unresolved_dir: options.unresolvedDir,
    input_mode: options.fullCsv ? 'full_unresolved_csv' : 'coverage_top_unresolved',
    route_lookup_dir: options.routeLookupDir,
    source_license_inventory: options.sourceLicenseInventory,
  },
  boundary: {
    purpose: 'definition expansion planning and source-candidate routing',
    does_not_clear: [
      'source_license_legal_acceptance',
      'Definition_authority',
      'accepted_gloss_or_answer_text',
      'public_runtime_release',
      'prehud_display_promotion',
    ],
    prehud_policy: 'Rows are fail-closed. Crossmatch, lemma-only, morphology-only, usage-only, NC, and unknown-license evidence remain HUD/evidence-only until a canonical display gate clears a safe selected route-backed definition.',
  },
  counts: {
    works_with_coverage: coverageByWork.size,
    unresolved_unique_rows: aggregate.size,
    manifest_rows: topRows.length,
    total_unresolved_occurrences_in_manifest_source: sum([...aggregate.values()], 'occurrence_count'),
    rows_with_any_route: topRows.filter((row) => row.hud_inspectable).length,
    rows_without_route: topRows.filter((row) => row.route_status === 'no_route').length,
    rows_with_answer_candidate: topRows.filter((row) => row.route_status === 'answer_route_candidate_needs_gate').length,
    rows_prehud_allowed: topRows.filter((row) => row.prehud_allowed).length,
    nc_evidence_reports_found: candidateMatrix.nc_evidence_reports.length,
  },
  family_totals: familyTotals,
  dictionary_source_candidates: candidateMatrix,
  rows: topRows,
};

writeJson(options.outJson, manifest);
writeCsv(options.outCsv, topRows);
writeReport(options.report, manifest);

console.log(JSON.stringify({
  unresolved_unique_rows: manifest.counts.unresolved_unique_rows,
  manifest_rows: manifest.counts.manifest_rows,
  rows_with_any_route: manifest.counts.rows_with_any_route,
  rows_without_route: manifest.counts.rows_without_route,
  rows_with_answer_candidate: manifest.counts.rows_with_answer_candidate,
  rows_prehud_allowed: manifest.counts.rows_prehud_allowed,
  nc_evidence_reports_found: manifest.counts.nc_evidence_reports_found,
  out_json: options.outJson,
  out_csv: options.outCsv,
  report: options.report,
}, null, 2));

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--coverage-dir') parsed.coverageDir = cleanRelativePath(args[++index]);
    else if (arg === '--unresolved-dir') parsed.unresolvedDir = cleanRelativePath(args[++index]);
    else if (arg === '--route-lookup-dir') parsed.routeLookupDir = cleanRelativePath(args[++index]);
    else if (arg === '--source-license-inventory') parsed.sourceLicenseInventory = cleanRelativePath(args[++index]);
    else if (arg === '--out-json') parsed.outJson = cleanRelativePath(args[++index]);
    else if (arg === '--out-csv') parsed.outCsv = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--limit') parsed.limit = Number(args[++index]);
    else if (arg === '--full-csv') parsed.fullCsv = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage: node scripts/build_definition_expansion_gap_manifest.mjs [options]',
      '',
      'Options:',
      '  --coverage-dir data/reports/coverage',
      '  --unresolved-dir data/lexical/unresolved',
      '  --route-lookup-dir data/definitions/hud-route-lookup',
      '  --source-license-inventory data/definitions/source-license-inventory.json',
      '  --out-json data/definitions/definition-expansion-gap-manifest.json',
      '  --out-csv data/definitions/definition-expansion-gap-manifest.csv',
      '  --report reports/definition-expansion-gap-manifest-2026-06-11.md',
      '  --limit 5000',
      '  --full-csv',
    ].join('\n'));
    process.exit(0);
  }
  if (!Number.isInteger(parsed.limit) || parsed.limit < 1) throw new Error('--limit must be a positive integer');
  return parsed;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) throw new Error(`Invalid path: ${value}`);
  if (path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function loadCoverage() {
  const dir = path.join(root, options.coverageDir);
  const map = new Map();
  for (const file of fs.readdirSync(dir).filter((entry) => entry.endsWith('.json')).sort()) {
    const coverage = readJson(path.join(options.coverageDir, file));
    map.set(coverage.work_id, {
      work_id: coverage.work_id,
      work_title: coverage.work_title || '',
      category: coverage.category || inferFamily(coverage.work_id),
      source_units: coverage.source_units || 0,
      total_tokens: coverage.total_tokens || 0,
      unresolved_tokens: coverage.unresolved_tokens || 0,
      lexical_coverage_percent: coverage.lexical_coverage_percent ?? null,
      top_unresolved_by_frequency: coverage.top_unresolved_by_frequency || [],
    });
  }
  return map;
}

async function loadUnresolved() {
  if (!options.fullCsv) return loadCoverageTopUnresolved();
  const dir = path.join(root, options.unresolvedDir);
  const map = new Map();
  for (const file of fs.readdirSync(dir).filter((entry) => entry.endsWith('.csv')).sort()) {
    await readCsv(path.join(options.unresolvedDir, file), (row) => {
      const normalized = row.normalized_word || '';
      if (!normalized) return;
      const workId = row.work_id || file.replace(/\.csv$/, '');
      const occurrenceCount = Number(row.occurrence_count || 0);
      if (!map.has(normalized)) {
        map.set(normalized, {
          normalized,
          occurrence_count: 0,
          work_counts: new Map(),
          surface_counts: new Map(),
          example_refs: new Set(),
        });
      }
      const entry = map.get(normalized);
      entry.occurrence_count += occurrenceCount;
      entry.work_counts.set(workId, (entry.work_counts.get(workId) || 0) + occurrenceCount);
      if (row.surface_word) entry.surface_counts.set(row.surface_word, (entry.surface_counts.get(row.surface_word) || 0) + occurrenceCount);
      for (const ref of String(row.example_refs || '').split(';').map((value) => value.trim()).filter(Boolean).slice(0, 5)) {
        if (entry.example_refs.size < 8) entry.example_refs.add(ref);
      }
    });
  }
  for (const entry of map.values()) {
    entry.work_count = entry.work_counts.size;
  }
  return map;
}

function loadCoverageTopUnresolved() {
  const map = new Map();
  for (const [workId, coverage] of coverageByWork.entries()) {
    for (const row of coverage.top_unresolved_by_frequency || []) {
      const normalized = row.normalized_word || '';
      if (!normalized) continue;
      const occurrenceCount = Number(row.count || 0);
      if (!map.has(normalized)) {
        map.set(normalized, {
          normalized,
          occurrence_count: 0,
          work_counts: new Map(),
          surface_counts: new Map(),
          example_refs: new Set(),
        });
      }
      const entry = map.get(normalized);
      entry.occurrence_count += occurrenceCount;
      entry.work_counts.set(workId, (entry.work_counts.get(workId) || 0) + occurrenceCount);
      if (row.surface_word) entry.surface_counts.set(row.surface_word, (entry.surface_counts.get(row.surface_word) || 0) + occurrenceCount);
      for (const ref of row.example_refs || []) {
        if (entry.example_refs.size < 8) entry.example_refs.add(ref);
      }
    }
  }
  for (const entry of map.values()) entry.work_count = entry.work_counts.size;
  return map;
}

function enrichRow(entry) {
  const topWorks = sortedMap(entry.work_counts, options.topWorksPerRow).map(([work_id, count]) => {
    const meta = coverageByWork.get(work_id) || {};
    return {
      work_id,
      work_title: meta.work_title || '',
      family: classifyFamily(work_id, meta.category),
      count,
    };
  });
  const topSurfaces = sortedMap(entry.surface_counts, options.topSurfacesPerRow).map(([surface, count]) => ({ surface, count }));
  const families = [...new Set(topWorks.map((work) => work.family))].sort();
  const cards = routeCardsFor(entry.normalized);
  const routeSummary = summarizeRoutes(cards);
  const candidate = chooseCandidateLane(entry.normalized, families, routeSummary);
  return {
    normalized: entry.normalized,
    surface: topSurfaces[0]?.surface || entry.normalized,
    occurrence_count: entry.occurrence_count,
    work_count: entry.work_count,
    families,
    current_match: 'unresolved_lexical_row',
    route_status: routeSummary.route_status,
    candidate_route_count: routeSummary.card_count,
    match_families: routeSummary.route_families,
    match_types: routeSummary.route_types,
    source_families: routeSummary.source_families,
    license_lane: routeSummary.license_lane || candidate.license_lane,
    candidate_source: candidate.candidate_source,
    display_eligible: routeSummary.display_eligible,
    hud_inspectable: routeSummary.card_count > 0,
    prehud_allowed: false,
    blocker: candidate.blocker,
    top_works: topWorks,
    top_surfaces: topSurfaces,
    example_refs: [...entry.example_refs],
  };
}

function routeCardsFor(normalized) {
  const shardName = codepointKey(normalized, 3);
  const shardPath = path.join(root, options.routeLookupDir, 'shards', `${shardName}.json`);
  if (!fs.existsSync(shardPath)) return [];
  if (!shardCache.has(shardPath)) shardCache.set(shardPath, JSON.parse(fs.readFileSync(shardPath, 'utf8')));
  return shardCache.get(shardPath).routes_by_normalized?.[normalized] || [];
}

function summarizeRoutes(cards) {
  const routeFamilies = new Map();
  const routeTypes = new Map();
  const sourceFamilies = new Map();
  let answerEligible = 0;
  let acceptedPublicSourceRows = 0;
  let sourceRows = 0;
  for (const card of cards) {
    count(routeFamilies, card.route_family || '(missing)');
    count(routeTypes, card.route_type || '(missing)');
    if (card.answer_eligible) answerEligible += 1;
    for (const source of card.source_rows || []) {
      sourceRows += 1;
      const family = source.source_family || '(missing)';
      count(sourceFamilies, family);
      if (acceptedSourceFamilies.has(family)) acceptedPublicSourceRows += 1;
    }
  }
  const sourceClear = sourceRows > 0 && acceptedPublicSourceRows === sourceRows;
  const evidenceOnly = cards.some((card) => ['phrase_evidence', 'subphrase_evidence', 'citable_paraphrase_evidence'].includes(card.route_type));
  const displayEligible = answerEligible > 0 && sourceClear && !evidenceOnly;
  return {
    card_count: cards.length,
    answer_eligible: answerEligible,
    display_eligible: displayEligible,
    route_status: cards.length === 0
      ? 'no_route'
      : displayEligible
        ? 'answer_route_candidate_needs_gate'
        : 'hud_evidence_only_or_source_review',
    route_families: sortedKeys(routeFamilies),
    route_types: sortedKeys(routeTypes),
    source_families: sortedKeys(sourceFamilies),
    license_lane: cards.length === 0
      ? ''
      : sourceClear
        ? 'accepted_public_route_source_present'
        : 'route_source_license_review_needed',
  };
}

function chooseCandidateLane(normalized, families, routeSummary) {
  if (routeSummary.card_count > 0) {
    return {
      candidate_source: 'review_existing_hud_route_before_dictionary_import',
      license_lane: routeSummary.license_lane,
      blocker: routeSummary.display_eligible
        ? 'canonical_display_gate_required_before_prehud'
        : 'hud_evidence_or_source_review_only',
    };
  }
  if (families.includes('targum_aramaic')) {
    return {
      candidate_source: 'missing_commercial_clean_aramic_targum_dictionary',
      license_lane: 'source_needed_license_unverified',
      blocker: 'no_route_and_no_accepted_aramaic_dictionary_source',
    };
  }
  if (hasAbbreviationShape(normalized) && families.includes('kabbalah')) {
    return {
      candidate_source: 'project_authored_kabbalah_abbreviation_table',
      license_lane: 'project_authored_or_source_needed',
      blocker: 'abbreviation_expansion_needed_with_source_license_row',
    };
  }
  if (hasAbbreviationShape(normalized)) {
    return {
      candidate_source: 'project_authored_rabbinic_abbreviation_table',
      license_lane: 'project_authored_or_source_needed',
      blocker: 'abbreviation_expansion_needed_with_source_license_row',
    };
  }
  if (families.includes('kabbalah')) {
    return {
      candidate_source: 'kabbalah_technical_term_table_or_commercial_clean_dictionary',
      license_lane: 'source_needed_license_unverified',
      blocker: 'technical_term_source_needed',
    };
  }
  return {
    candidate_source: 'commercial_clean_dictionary_search',
    license_lane: 'source_needed_license_unverified',
    blocker: 'no_route_for_high_frequency_unresolved_form',
  };
}

function summarizeByFamily(map) {
  const families = new Map();
  for (const entry of map.values()) {
    const familyCounts = new Map();
    for (const [workId, countValue] of entry.work_counts.entries()) {
      const meta = coverageByWork.get(workId) || {};
      count(familyCounts, classifyFamily(workId, meta.category), countValue);
    }
    const topFamily = sortedMap(familyCounts, 1)[0]?.[0] || 'unknown';
    if (!families.has(topFamily)) families.set(topFamily, { family: topFamily, distinct_forms: 0, occurrence_count: 0 });
    const row = families.get(topFamily);
    row.distinct_forms += 1;
    row.occurrence_count += entry.occurrence_count;
  }
  return [...families.values()].sort((a, b) => b.occurrence_count - a.occurrence_count || a.family.localeCompare(b.family));
}

function buildCandidateMatrix() {
  const acceptedSources = (sourceInventory.sources || []).map((source) => ({
    source_id: source.source_id,
    source_name: source.source_name,
    source_family: source.source_family,
    license: source.license,
    public_use: source.public_use === true,
    accepted: source.accepted === true,
  }));
  const ncReports = scanNcReports();
  return {
    accepted_public_sources: acceptedSources,
    target_lanes: [
      {
        lane_id: 'aramaic_targum_dictionary',
        priority: 1,
        target_families: ['targum_aramaic'],
        license_lane: 'source_needed_license_unverified',
        display_policy: 'blocked_until_source_license_and_route_gate_clear',
        blocker: 'missing_commercial_clean_aramaic_dictionary_source',
      },
      {
        lane_id: 'kabbalah_abbreviation_and_technical_terms',
        priority: 2,
        target_families: ['kabbalah'],
        license_lane: 'project_authored_or_source_needed',
        display_policy: 'allowed_only_after source row and canonical display gate',
        blocker: 'abbreviation_or_technical_term_expansion_needed',
      },
      {
        lane_id: 'rabbinic_halakhah_abbreviations',
        priority: 3,
        target_families: ['halakhah', 'mishnah', 'tosefta', 'midrash'],
        license_lane: 'project_authored_or_source_needed',
        display_policy: 'allowed_only_after source row and canonical display gate',
        blocker: 'rabbinic_abbreviation_expansion_needed',
      },
      {
        lane_id: 'nc_klein_old_dictionary',
        priority: 99,
        target_families: ['all'],
        license_lane: 'noncommercial_evidence_only',
        display_policy: 'zero_public_output_until_explicit_license_boundary_clearance',
        blocker: 'nc_noncommercial_not_public_prehud_or_export_authority',
      },
    ],
    nc_evidence_reports: ncReports,
  };
}

function scanNcReports() {
  const reportsDir = path.join(root, 'reports');
  if (!fs.existsSync(reportsDir)) return [];
  const matches = [];
  for (const file of fs.readdirSync(reportsDir).filter((entry) => entry.endsWith('.md')).sort()) {
    const relative = path.join('reports', file).replace(/\\/g, '/');
    const text = fs.readFileSync(path.join(root, relative), 'utf8');
    const lower = text.toLowerCase();
    if (!lower.includes('noncommercial') && !lower.includes('klein') && !/\bnc\b/i.test(text)) continue;
    const line = text.split(/\r?\n/).find((value) => /noncommercial|klein|\bNC\b/i.test(value)) || '';
    matches.push({ path: relative, first_matching_line: line.slice(0, 220) });
    if (matches.length >= options.ncReportLimit) break;
  }
  return matches;
}

async function readCsv(relativePath, onRow) {
  const fullPath = path.join(root, relativePath);
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let header = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const values = parseCsvLine(line);
    if (!header) {
      header = values;
      continue;
    }
    const row = {};
    for (let index = 0; index < header.length; index += 1) row[header[index]] = values[index] || '';
    onRow(row);
  }
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCsv(relativePath, rows) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const header = [
    'normalized',
    'surface',
    'occurrence_count',
    'work_count',
    'families',
    'current_match',
    'route_status',
    'candidate_route_count',
    'match_families',
    'candidate_source',
    'license_lane',
    'display_eligible',
    'hud_inspectable',
    'prehud_allowed',
    'blocker',
    'top_works',
  ];
  const lines = [
    header.join(','),
    ...rows.map((row) => header.map((key) => csvEscape(formatCsvField(row[key], key))).join(',')),
  ];
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function writeReport(relativePath, manifest) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const topFamilies = manifest.family_totals.slice(0, 12);
  const topRows = manifest.rows.slice(0, 80);
  const report = [
    '# Definition Expansion Gap Manifest',
    '',
    `Generated: ${manifest.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Planning evidence only. No source/license/legal acceptance, Definition authority, answer text, accepted gloss, preHUD promotion, publication, release, or public-runtime clearance.',
    '- NC / NonCommercial / Klein evidence remains evidence-only and zero-output until explicitly cleared by the source/license boundary lane.',
    '- Rows are fail-closed: `prehud_allowed=false` unless a later canonical display gate clears a safe selected route-backed definition.',
    '',
    '## Counts',
    '',
    `- Works with coverage: ${manifest.counts.works_with_coverage}`,
    `- Distinct unresolved normalized rows scanned: ${manifest.counts.unresolved_unique_rows}`,
    `- Manifest rows written: ${manifest.counts.manifest_rows}`,
    `- Rows with any HUD route: ${manifest.counts.rows_with_any_route}`,
    `- Rows without route: ${manifest.counts.rows_without_route}`,
    `- Rows with answer-route candidate needing gate: ${manifest.counts.rows_with_answer_candidate}`,
    `- Rows preHUD allowed: ${manifest.counts.rows_prehud_allowed}`,
    `- NC/Klein/NonCommercial evidence reports found: ${manifest.counts.nc_evidence_reports_found}`,
    '',
    '## Top Families By Unresolved Occurrences',
    '',
    ...topFamilies.map((row) => `- ${row.family}: ${row.occurrence_count} occurrences / ${row.distinct_forms} forms`),
    '',
    '## Candidate Lanes',
    '',
    ...manifest.dictionary_source_candidates.target_lanes.map((lane) => `- priority ${lane.priority}: ${lane.lane_id} | ${lane.license_lane} | ${lane.blocker}`),
    '',
    '## Top Gap Rows',
    '',
    ...topRows.map((row) => `- ${row.normalized} | ${row.occurrence_count} occ | ${row.families.join('+')} | ${row.route_status} | ${row.candidate_source} | ${row.blocker}`),
    '',
  ].join('\n');
  fs.writeFileSync(fullPath, report, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readJsonIfExists(relativePath, fallback) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return fallback;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function codepointKey(value, prefixLength) {
  const chars = [...String(value || '')].slice(0, prefixLength);
  if (!chars.length) return 'empty';
  const first = chars[0].codePointAt(0);
  if (first < 0x05d0 || first > 0x05ea) return 'other';
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

function classifyFamily(workId, category) {
  const id = workId || '';
  const cat = String(category || '').toLowerCase();
  if (cat.includes('targum') || id.startsWith('aramaic-targum') || id.startsWith('targum-')) return 'targum_aramaic';
  if (cat.includes('kabbalah') || id.includes('zohar') || id.includes('sefirot') || id.includes('kabbalah')) return 'kabbalah';
  if (cat.includes('halakhah') || id.includes('shulchan-arukh') || id.includes('mishneh-torah')) return 'halakhah';
  if (cat.includes('mishnah')) return 'mishnah';
  if (cat.includes('tosefta')) return 'tosefta';
  if (cat.includes('midrash')) return 'midrash';
  if (cat.includes('tanakh')) return 'tanakh';
  if (cat.includes('chasidut')) return 'chasidut';
  if (cat.includes('liturgy')) return 'liturgy';
  if (cat.includes('musar')) return 'musar';
  return inferFamily(id);
}

function inferFamily(workId) {
  const id = workId || '';
  if (id.startsWith('aramaic-targum') || id.startsWith('targum-')) return 'targum_aramaic';
  if (id.includes('zohar') || id.includes('sefirot')) return 'kabbalah';
  if (id.includes('shulchan-arukh') || id.includes('mishneh-torah')) return 'halakhah';
  return 'unknown';
}

function hasAbbreviationShape(value) {
  return /["׳״]/.test(String(value || '')) || /^[א-ת]{1,4}$/.test(String(value || ''));
}

function sortedMap(map, limit = Infinity) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit);
}

function sortedKeys(map) {
  return sortedMap(map).map(([key]) => key);
}

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function formatCsvField(value, key) {
  if (key === 'top_works') return (value || []).map((work) => `${work.work_id}:${work.count}`).join('; ');
  if (Array.isArray(value)) return value.join('; ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return value ?? '';
}
