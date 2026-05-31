#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const defaults = {
  sourceDir: 'data/sources',
  frameSeeds: 'data/workbench-evidence/frame-seeds.json',
  routeFiles: [
    'data/definitions/hud-route-store-sample.json',
    'data/definitions/hud-route-lookup-sample.json',
  ],
  routeJsonlFiles: [
    '.local-cache/definition-routes/source-layer-definition-claims.jsonl',
    '.local-cache/definition-routes/kaikki-definition-claims.jsonl',
    '.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl',
    '.local-cache/definition-routes/source-phrase-evidence.jsonl',
  ],
  outputDir: '.local-cache/workbench-evidence/full',
  reportDir: 'reports',
  window: 8,
  includeUntracked: false,
  includePrefixFamily: false,
  emitAmbiguousCandidates: true,
  autoContextClusters: true,
  minAutoClusterSize: 3,
  allowFullCorpus: false,
  maxSourceFiles: 5,
  maxBlocked: 250,
};

const options = parseArgs(process.argv.slice(2));
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const allowedSourceLicenses = new Set([
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0',
  'CC BY-SA 4.0 / GFDL',
  'CC BY-SA 4.0/GFDL',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC0',
  'Public Domain',
  'Public Domain Mark',
  'project-authored / CC0',
]);

const licenseUrls = new Map([
  ['CC-BY-SA', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC-BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC BY-SA 4.0 / GFDL', 'https://en.wiktionary.org/wiki/Wiktionary:Copyrights'],
  ['CC BY-SA 4.0/GFDL', 'https://en.wiktionary.org/wiki/Wiktionary:Copyrights'],
  ['CC-BY', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC-BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['Public Domain', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ['Public Domain Mark', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ['project-authored / CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
]);

const niqqudAndCantillationRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const htmlTagRe = /<[^>]+>/g;
const tokenRe = /[\u0590-\u05FF]+(?:[\u05BE-][\u0590-\u05FF]+)*/gu;
const commonPrefixRe = /^[בכלמוהש]{1,2}/u;
const finalLetters = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);

const focusNormalized = normalizeHebrew(options.focusNormalized || options.focus);
if (!focusNormalized) throw new Error('Provide --focus or --focus-normalized.');

const slug = options.slug || slugForFocus(focusNormalized);
const graphPath = `${options.outputDir}/${slug}-occurrence-graph.json`;
const candidatesPath = `${options.outputDir}/${slug}-candidate-evidence.json`;
const reportPath = `${options.reportDir}/workbench-usage-graph-${slug}.md`;

mkdirpForFile(graphPath);
mkdirpForFile(candidatesPath);
mkdirpForFile(reportPath);

const frameSeeds = loadFrameSeeds(options.frameSeeds);
const routeLinks = await loadRouteLinks(focusNormalized);
const sourceFiles = collectSourceFiles();

const occurrenceMarkers = [];
const candidateRows = [];
const blockedRows = [];
const clusters = new Map();
const tokenSurfaces = new Map();
const works = new Map();
const sourceLicenseCounts = new Map();
const matchBasisCounts = new Map();

for (const relativePath of sourceFiles) {
  const source = readJson(relativePath);
  const units = Array.isArray(source.units) ? source.units : [];
  for (const unit of units) {
    const license = unit.license || source.license || '';
    if (!isAllowedLicense(license)) {
      if (blockedRows.length < options.maxBlocked) {
        blockedRows.push(makeBlockedRow(source, unit, relativePath, license, 'unsafe_or_missing_license'));
      }
      continue;
    }

    const hebrew = flattenHebrew(unit.hebrew);
    if (!hebrew) continue;
    const tokens = tokenize(hebrew);
    for (const [tokenIndex, token] of tokens.entries()) {
      const focusMatch = getFocusMatch(token.normalized);
      if (!focusMatch) continue;

      increment(tokenSurfaces, token.normalized);
      increment(works, source.work_id || unit.work_id || path.basename(relativePath, '.json'));
      increment(sourceLicenseCounts, license);
      increment(matchBasisCounts, focusMatch.match_basis);

      const occurrence = makeOccurrence({
        source,
        unit,
        relativePath,
        tokens,
        tokenIndex,
        license,
        focusMatch,
      });
      const frameFit = scoreFrames(occurrence, frameSeeds, routeLinks);
      occurrence.cluster_id = frameFit.cluster_id;
      occurrence.raw_source_fit_score = frameFit.raw_score;
      occurrence.matched_frame_cues = frameFit.matched_cues;
      occurrence.ambiguity_flag = frameFit.status === 'ambiguous';
      occurrence.route_links = frameFit.route_links.map(compactRouteLink);
      occurrence._frame_fit = frameFit;
      occurrenceMarkers.push(occurrence);
    }
  }
}

if (options.autoContextClusters && frameSeeds.length === 0) {
  applyAutoContextClusters(occurrenceMarkers);
}

for (const occurrence of occurrenceMarkers) {
  const frameFit = occurrence._frame_fit;
  delete occurrence._frame_fit;
  updateCluster(frameFit, occurrence);
  if (options.emitAmbiguousCandidates || frameFit.raw_score > 0) {
    candidateRows.push(makeCandidateRow(occurrence, frameFit));
  }
}

occurrenceMarkers.sort(compareOccurrenceMarkers);
candidateRows.sort(compareCandidateRows);

const clusterList = Array.from(clusters.values()).map((cluster) => ({
  ...cluster,
  work_ids: Array.from(cluster.work_ids).sort(),
  source_refs: Array.from(cluster.source_refs).sort().slice(0, 80),
  matched_cues: Array.from(cluster.matched_cues.entries())
    .map(([cue, count]) => ({ cue, count }))
    .sort((a, b) => b.count - a.count || a.cue.localeCompare(b.cue)),
})).sort((a, b) => b.occurrence_count - a.occurrence_count || a.cluster_id.localeCompare(b.cluster_id));

const graphArtifact = {
  schema_version: 1,
  artifact_type: 'workbench_occurrence_graph',
  generated_at: generatedAt,
  generator: 'scripts/build_workbench_usage_graph.mjs',
  policy: 'Exhaustive observed usage graph. It marks source occurrences and does not make definition claims.',
  focus: {
    token_normalized: focusNormalized,
    token_key: tokenKey(focusNormalized),
  },
  inputs: {
    source_files_scanned: sourceFiles.length,
    frame_seeds: options.frameSeeds,
    route_files: options.routeFiles,
    route_jsonl_files: options.routeJsonlFiles,
    include_untracked: options.includeUntracked,
    include_prefix_family: options.includePrefixFamily,
    auto_context_clusters: options.autoContextClusters,
    min_auto_cluster_size: options.minAutoClusterSize,
    allow_full_corpus: options.allowFullCorpus,
    max_source_files: options.maxSourceFiles,
    window: options.window,
  },
  counts: {
    occurrence_markers: occurrenceMarkers.length,
    clusters: clusterList.length,
    blocked_rows_recorded: blockedRows.length,
    route_links_available: routeLinks.length,
    distinct_token_surfaces: tokenSurfaces.size,
    distinct_works: works.size,
  },
  distributions: {
    token_surfaces: mapToCountObjects(tokenSurfaces, 'token_normalized'),
    works: mapToCountObjects(works, 'work_id'),
    licenses: mapToCountObjects(sourceLicenseCounts, 'license'),
    match_basis: mapToCountObjects(matchBasisCounts, 'match_basis'),
  },
  clusters: clusterList,
  occurrence_markers: occurrenceMarkers,
  blocked_rows: blockedRows,
};

const candidateArtifact = {
  schema_version: 1,
  artifact_type: 'workbench_candidate_evidence',
  generated_at: generatedAt,
  generator: 'scripts/build_workbench_usage_graph.mjs',
  policy: 'Candidate rows are derived from the occurrence graph. They are source-frame usage commentary, not final HUD answers and not licensed definition claims unless linked to a separate licensed route.',
  focus: graphArtifact.focus,
  graph_ref: graphPath,
  counts: {
    candidate_rows: candidateRows.length,
    supported: candidateRows.filter((row) => row.candidate_status === 'supported').length,
    candidate: candidateRows.filter((row) => row.candidate_status === 'candidate').length,
    weak: candidateRows.filter((row) => row.candidate_status === 'weak').length,
    ambiguous: candidateRows.filter((row) => row.candidate_status === 'ambiguous').length,
    blocked_rows_recorded: blockedRows.length,
  },
  route_links_available: routeLinks.map(compactRouteLink),
  candidate_rows: candidateRows,
  blocked_rows: blockedRows,
};

writeJson(graphPath, graphArtifact);
writeJson(candidatesPath, candidateArtifact);
writeReport(reportPath, graphArtifact, candidateArtifact);

console.log(`Wrote ${graphPath}`);
console.log(`Wrote ${candidatesPath}`);
console.log(`Wrote ${reportPath}`);

function parseArgs(args) {
  const parsed = {
    ...defaults,
    routeFiles: [...defaults.routeFiles],
    routeJsonlFiles: [...defaults.routeJsonlFiles],
    sourceFiles: [],
    focus: '',
    focusNormalized: '',
    slug: '',
  };
  for (const arg of args) {
    if (arg === '--include-untracked') parsed.includeUntracked = true;
    else if (arg === '--include-prefix-family') parsed.includePrefixFamily = true;
    else if (arg === '--no-prefix-family') parsed.includePrefixFamily = false;
    else if (arg === '--no-ambiguous-candidates') parsed.emitAmbiguousCandidates = false;
    else if (arg === '--no-auto-context-clusters') parsed.autoContextClusters = false;
    else if (arg === '--allow-full-corpus') parsed.allowFullCorpus = true;
    else if (arg.startsWith('--focus=')) parsed.focus = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--focus-normalized=')) parsed.focusNormalized = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--slug=')) parsed.slug = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--source-file=')) parsed.sourceFiles.push(cleanRelativePath(arg.split('=').slice(1).join('=')));
    else if (arg.startsWith('--frame-seeds=')) parsed.frameSeeds = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--route-file=')) parsed.routeFiles.push(cleanRelativePath(arg.split('=').slice(1).join('=')));
    else if (arg.startsWith('--route-jsonl=')) parsed.routeJsonlFiles.push(cleanRelativePath(arg.split('=').slice(1).join('=')));
    else if (arg.startsWith('--output-dir=')) parsed.outputDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report-dir=')) parsed.reportDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--window=')) parsed.window = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-blocked=')) parsed.maxBlocked = Number(arg.split('=')[1]);
    else if (arg.startsWith('--min-auto-cluster-size=')) parsed.minAutoClusterSize = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-source-files=')) parsed.maxSourceFiles = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['window', 'maxBlocked', 'minAutoClusterSize', 'maxSourceFiles']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  parsed.routeFiles = [...new Set(parsed.routeFiles.map(cleanRelativePath))];
  parsed.routeJsonlFiles = [...new Set(parsed.routeJsonlFiles.map(cleanRelativePath))];
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function mkdirpForFile(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
}

function readJson(relativePath, required = true) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    if (required) throw new Error(`Missing required file: ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
}

function slugForFocus(normalized) {
  if (normalized === normalizeHebrew('ראשית')) return 'reshit';
  return stableId('focus', normalized).replace(/^focus-/, '');
}

function cleanHebrewText(value) {
  return String(value ?? '')
    .replace(htmlTagRe, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4')
    .replace(/\u2010|\u2011|\u2012|\u2013|\u2014/g, '-');
}

function normalizeHebrew(value) {
  let normalized = normalizeHebrewPunctuation(value)
    .replace(niqqudAndCantillationRe, '')
    .replace(/[^\u0590-\u05FF-]/gu, '');
  normalized = Array.from(normalized, (ch) => finalLetters.get(ch) || ch).join('');
  return normalized;
}

function tokenKey(normalized) {
  return `he:${normalized}`;
}

function isAllowedLicense(license) {
  if (!license || typeof license !== 'string') return false;
  if (forbiddenLicenseRe.test(license)) return false;
  return allowedSourceLicenses.has(license);
}

function collectSourceFiles() {
  if (options.sourceFiles.length) {
    if (options.sourceFiles.length > options.maxSourceFiles) {
      throw new Error(`Refusing broad source scope: got ${options.sourceFiles.length} --source-file value(s), max is ${options.maxSourceFiles}.`);
    }
    return options.sourceFiles.map(cleanRelativePath).map((file) => {
      if (!file.startsWith(`${options.sourceDir}/`) || !file.endsWith('.json')) {
        throw new Error(`--source-file must point to a JSON file under ${options.sourceDir}: ${file}`);
      }
      if (!fs.existsSync(path.join(root, file))) throw new Error(`--source-file does not exist: ${file}`);
      return file;
    }).sort();
  }

  if (!options.allowFullCorpus) {
    throw new Error('Refusing full-corpus graph build without --allow-full-corpus. For smoke runs pass 1-5 explicit --source-file values.');
  }

  if (options.includeUntracked) {
    return fs.readdirSync(path.join(root, options.sourceDir))
      .filter((name) => name.endsWith('.json'))
      .map((name) => `${options.sourceDir}/${name}`)
      .sort();
  }

  try {
    return execFileSync('git', ['ls-files', '--', `${options.sourceDir}/*.json`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split(/\r?\n/).filter(Boolean).sort();
  } catch {
    return fs.readdirSync(path.join(root, options.sourceDir))
      .filter((name) => name.endsWith('.json'))
      .map((name) => `${options.sourceDir}/${name}`)
      .sort();
  }
}

function flattenHebrew(value) {
  if (Array.isArray(value)) return value.map(flattenHebrew).filter(Boolean).join(' ');
  return cleanHebrewText(value);
}

function tokenize(text) {
  const tokens = [];
  for (const match of text.matchAll(tokenRe)) {
    const surface = match[0];
    const normalized = normalizeHebrew(surface);
    if (!normalized) continue;
    tokens.push({ surface, normalized, offset: match.index || 0 });
  }
  return tokens;
}

function getFocusMatch(tokenNormalized) {
  if (tokenNormalized === focusNormalized) {
    return {
      match_basis: 'normalized_exact',
      token_key: tokenKey(focusNormalized),
      morphology_family_keys: [tokenKey(focusNormalized)],
      ambiguity_flag: false,
      morphology_links: [],
    };
  }

  if (!options.includePrefixFamily) return null;
  if (!tokenNormalized.endsWith(focusNormalized)) return null;
  const prefix = tokenNormalized.slice(0, -focusNormalized.length);
  if (!prefix || !commonPrefixRe.test(prefix)) return null;
  if (prefix.length > 2) return null;
  return {
    match_basis: 'prefix_family_candidate',
    token_key: tokenKey(focusNormalized),
    morphology_family_keys: [tokenKey(focusNormalized), tokenKey(tokenNormalized)],
    ambiguity_flag: true,
    morphology_links: [
      {
        link_type: 'prefix_family_candidate',
        prefix_normalized: prefix,
        base_normalized: focusNormalized,
        owner: 'agent2_morphology',
        status: 'candidate_requires_morphology_review',
      },
    ],
  };
}

function loadFrameSeeds(relativePath) {
  const data = readJson(relativePath);
  return (Array.isArray(data.frames) ? data.frames : [])
    .map((frame) => ({
      ...frame,
      token_normalized: normalizeHebrew(frame.token_normalized),
      context_cues: (Array.isArray(frame.context_cues) ? frame.context_cues : [])
        .map((cue) => ({
          cue: normalizeHebrew(cue.cue),
          weight: Number(cue.weight || 0),
        }))
        .filter((cue) => cue.cue && cue.weight > 0),
      route_selectors: Array.isArray(frame.route_selectors)
        ? frame.route_selectors.map((selector) => String(selector).toLowerCase())
        : [],
    }))
    .filter((frame) => frame.token_normalized === focusNormalized);
}

async function loadRouteLinks(normalized) {
  const links = [];
  for (const routeFile of options.routeFiles) {
    const data = readJson(routeFile, false);
    if (!data) continue;
    links.push(...extractRouteCards(data, routeFile, normalized));
  }
  for (const routeJsonl of options.routeJsonlFiles) {
    links.push(...await extractRouteJsonl(routeJsonl, normalized));
  }
  return uniqueBy(links, (link) => link.route_id);
}

function extractRouteCards(data, routeFile, normalized) {
  const links = [];
  if (Array.isArray(data.sample_tokens)) {
    for (const sample of data.sample_tokens) {
      if (normalizeHebrew(sample.normalized) !== normalized) continue;
      for (const card of Array.isArray(sample.cards) ? sample.cards : []) {
        links.push(makeRouteLink(card, routeFile));
      }
    }
  }
  if (data.routes_by_normalized && Array.isArray(data.routes_by_normalized[normalized])) {
    for (const card of data.routes_by_normalized[normalized]) links.push(makeRouteLink(card, routeFile));
  }
  return links.filter(Boolean);
}

async function extractRouteJsonl(relativePath, normalized) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return [];
  const links = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;
    let row;
    try {
      row = JSON.parse(trimmed);
    } catch {
      continue;
    }
    const rowNormalized = normalizeHebrew(row.normalized || row.focus_normalized || row.normalized_lemma || row.lemma || row.word || '');
    if (rowNormalized !== normalized) continue;
    links.push(makeRouteLink(row, `${relativePath}:${lineNumber}`));
  }
  return links.filter(Boolean);
}

function makeRouteLink(row, routeSource) {
  if (!row) return null;
  const routeId = row.card_id || row.claim_id || row.evidence_id || stableId('route', [routeSource, row.normalized, row.definition || row.gloss]);
  return {
    route_id: routeId,
    route_source: routeSource,
    route_family: row.route_family || '',
    route_type: row.route_type || '',
    display_section: row.display_section || '',
    normalized: normalizeHebrew(row.normalized || row.focus_normalized || ''),
    surface: row.surface || row.focus_surface || '',
    definition_text: cleanPlainText(row.definition || row.gloss || (Array.isArray(row.meanings) ? row.meanings.join('; ') : '')),
    answer_score: Number.isFinite(row.answer_score) ? row.answer_score : null,
    raw_score: Number.isFinite(row.raw_score) ? row.raw_score : null,
    source_rows: Array.isArray(row.source_rows) ? row.source_rows.map(compactSourceRow) : [],
  };
}

function compactRouteLink(route) {
  return {
    route_id: route.route_id,
    route_source: route.route_source,
    route_family: route.route_family,
    route_type: route.route_type,
    display_section: route.display_section,
    normalized: route.normalized,
    surface: route.surface,
    answer_score: route.answer_score,
    raw_score: route.raw_score,
    source_row_count: Array.isArray(route.source_rows) ? route.source_rows.length : 0,
  };
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function makeOccurrence({ source, unit, relativePath, tokens, tokenIndex, license, focusMatch }) {
  const start = Math.max(0, tokenIndex - options.window);
  const end = Math.min(tokens.length, tokenIndex + options.window + 1);
  const phraseTokens = tokens.slice(start, end).map((token, index) => ({
    surface: token.surface,
    normalized: token.normalized,
    role: start + index === tokenIndex ? 'focus-token' : 'context',
    distance_from_focus: start + index - tokenIndex,
  }));
  const token = tokens[tokenIndex];
  const workId = source.work_id || unit.work_id || path.basename(relativePath, '.json');
  const sourceRef = unit.source_ref || unit.sefaria_ref || '';
  return {
    occurrence_id: stableId('usage-occ', [workId, unit.unit_id || sourceRef, tokenIndex, token.surface, options.window, focusMatch.match_basis]),
    token_key: focusMatch.token_key,
    token_surface: token.surface,
    token_normalized: token.normalized,
    focus_surface: token.surface,
    focus_normalized: focusNormalized,
    match_basis: focusMatch.match_basis,
    morphology_family_keys: focusMatch.morphology_family_keys,
    morphology_links: focusMatch.morphology_links,
    phrase_window: {
      window_tokens_each_side: options.window,
      phrase_hebrew: phraseTokens.map((phraseToken) => phraseToken.surface).join(' '),
      phrase_tokens: phraseTokens,
    },
    source_ref: sourceRef,
    sefaria_ref: unit.sefaria_ref || sourceRef,
    work_id: workId,
    work_title: source.work_title || unit.work_title || workId,
    work_slug: source.work_slug || '',
    unit_id: unit.unit_id || '',
    source_file: relativePath,
    source_url: unit.source_url || source.source_base_url || unit.version_source || '',
    version_title: unit.version_title || '',
    version_source: unit.version_source || '',
    license,
    license_url: licenseUrls.get(license) || '',
    source_rows: [makeSourceRow({ source, unit, relativePath, license })],
  };
}

function makeSourceRow({ source, unit, relativePath, license }) {
  const workId = source.work_id || unit.work_id || path.basename(relativePath, '.json');
  return {
    source_name: unit.version_title || source.work_title || workId,
    source_family: 'hebrew_source_text',
    source_id: stableId('source-version', [workId, unit.version_title || '', unit.version_source || '', license]),
    source_url: unit.source_url || source.source_base_url || unit.version_source || '',
    version_title: unit.version_title || '',
    version_source: unit.version_source || '',
    license,
    license_url: licenseUrls.get(license) || '',
    fields_used: ['hebrew', 'source_ref', 'version_title', 'version_source', 'license'],
    notes: 'Source citation and provenance only. Workbench usage commentary is project-authored and is not an imported translation.',
  };
}

function compactSourceRow(row) {
  return {
    source_name: row?.source_name || '',
    source_family: row?.source_family || '',
    source_id: row?.source_id || '',
    source_url: row?.source_url || '',
    version_title: row?.version_title || '',
    version_source: row?.version_source || '',
    license: row?.license || '',
    license_url: row?.license_url || licenseUrls.get(row?.license || '') || '',
    fields_used: Array.isArray(row?.fields_used) ? row.fields_used : [],
    notes: row?.notes || '',
  };
}

function makeBlockedRow(source, unit, relativePath, license, reason) {
  const workId = source.work_id || unit.work_id || path.basename(relativePath, '.json');
  return {
    blocked_id: stableId('usage-blocked', [relativePath, unit.unit_id || unit.source_ref || unit.sefaria_ref || '', license, reason]),
    reason,
    source_file: relativePath,
    source_ref: unit.source_ref || unit.sefaria_ref || '',
    work_id: workId,
    work_title: source.work_title || unit.work_title || workId,
    license: license || '',
    note: 'Blocked before source text quotation or usage commentary because provenance/license gate failed.',
  };
}

function scoreFrames(occurrence, frames, routes) {
  let best = {
    cluster_id: 'unclustered',
    frame_label: '',
    raw_score: 0,
    matched_cues: [],
    route_links: [],
    status: 'ambiguous',
  };
  for (const frame of frames) {
    const matchedCues = matchFrameCues(occurrence, frame);
    const routeMatches = rankRoutesForFrame(frame, routes);
    const cueScore = matchedCues.reduce((sum, cue) => sum + cue.weight, 0);
    const densityBonus = Math.min(12, matchedCues.length * 3);
    const routeBonus = routeMatches.length ? Math.min(8, routeMatches[0].route_alignment_score) : 0;
    const rawScore = matchedCues.length ? Math.min(99, Math.round(42 + cueScore + densityBonus + routeBonus)) : 0;
    if (rawScore > best.raw_score) {
      best = {
        cluster_id: frame.frame_id,
        frame_label: frame.frame_label || frame.route_hint || frame.frame_id,
        raw_score: rawScore,
        matched_cues: matchedCues,
        route_links: routeMatches.slice(0, 6),
        status: statusForScore(rawScore),
      };
    }
  }
  return best;
}

function matchFrameCues(occurrence, frame) {
  const matches = [];
  for (const cue of frame.context_cues) {
    const token = occurrence.phrase_window.phrase_tokens.find((phraseToken) => (
      phraseToken.role !== 'focus-token' && hebrewCueMatches(phraseToken.normalized, cue.cue)
    ));
    if (!token) continue;
    matches.push({
      cue: cue.cue,
      matched_token_surface: token.surface,
      matched_token_normalized: token.normalized,
      distance_from_focus: token.distance_from_focus,
      weight: cue.weight,
    });
  }
  return matches.sort((a, b) => Math.abs(a.distance_from_focus) - Math.abs(b.distance_from_focus));
}

function hebrewCueMatches(token, cue) {
  if (!token || !cue) return false;
  if (token === cue) return true;
  if (cue.length >= 3 && token.includes(cue)) return true;
  if (token.length >= 3 && cue.includes(token)) return true;
  return false;
}

function rankRoutesForFrame(frame, routes) {
  return routes.map((route) => ({
    ...route,
    route_alignment_score: scoreRouteAlignment(frame, route),
  })).filter((route) => route.route_alignment_score > 0)
    .sort((a, b) => b.route_alignment_score - a.route_alignment_score || String(a.route_id).localeCompare(String(b.route_id)));
}

function scoreRouteAlignment(frame, route) {
  const text = String(route.definition_text || '').toLowerCase();
  let score = 0;
  for (const selector of frame.route_selectors || []) {
    if (selector && text.includes(selector)) score += 3;
  }
  return Math.min(12, score);
}

function statusForScore(score) {
  if (score >= 90) return 'supported';
  if (score >= 70) return 'candidate';
  if (score > 0) return 'weak';
  return 'ambiguous';
}

function applyAutoContextClusters(occurrences) {
  const signaturesByOccurrence = new Map();
  const signatureCounts = new Map();
  for (const occurrence of occurrences) {
    if (occurrence._frame_fit?.raw_score > 0) continue;
    const signature = makeAutoContextSignature(occurrence);
    if (!signature) continue;
    signaturesByOccurrence.set(occurrence.occurrence_id, signature);
    increment(signatureCounts, signature.key);
  }

  for (const occurrence of occurrences) {
    if (occurrence._frame_fit?.raw_score > 0) continue;
    const signature = signaturesByOccurrence.get(occurrence.occurrence_id);
    if (!signature) continue;
    const signatureCount = signatureCounts.get(signature.key) || 0;
    if (signatureCount < options.minAutoClusterSize) continue;
    const frameFit = {
      cluster_id: `auto-context-${stableId('ctx', [focusNormalized, signature.key]).replace(/^ctx-/, '')}`,
      frame_label: 'auto context signature',
      raw_score: 0,
      matched_cues: signature.cues.map((cue) => ({
        cue: cue.normalized,
        matched_token_surface: cue.surface,
        matched_token_normalized: cue.normalized,
        distance_from_focus: cue.distance_from_focus,
        weight: 0,
        cue_type: 'auto_context',
      })),
      route_links: [],
      status: 'ambiguous',
      auto_context_signature: {
        key: signature.key,
        signature_count: signatureCount,
        cues: signature.cues,
      },
    };
    occurrence.cluster_id = frameFit.cluster_id;
    occurrence.raw_source_fit_score = frameFit.raw_score;
    occurrence.matched_frame_cues = frameFit.matched_cues;
    occurrence.ambiguity_flag = true;
    occurrence.route_links = [];
    occurrence.auto_context_signature = frameFit.auto_context_signature;
    occurrence._frame_fit = frameFit;
  }
}

function makeAutoContextSignature(occurrence) {
  const cues = occurrence.phrase_window?.phrase_tokens
    ?.filter((token) => token.role !== 'focus-token' && isAutoContextCue(token.normalized))
    ?.sort((a, b) => Math.abs(a.distance_from_focus) - Math.abs(b.distance_from_focus)
      || a.normalized.localeCompare(b.normalized))
    ?.slice(0, 3)
    ?.map((token) => ({
      surface: token.surface,
      normalized: token.normalized,
      distance_from_focus: token.distance_from_focus,
    })) || [];
  if (cues.length < 2) return null;
  const key = cues.slice(0, 2).map((cue) => cue.normalized).sort().join('+');
  return { key, cues };
}

function isAutoContextCue(normalized) {
  if (!normalized || normalized === focusNormalized) return false;
  if (normalized.length < 3) return false;
  if (/^[\u05d1\u05db\u05dc\u05de\u05d5\u05d4\u05e9]+$/u.test(normalized)) return false;
  return true;
}

function updateCluster(frameFit, occurrence) {
  if (!clusters.has(frameFit.cluster_id)) {
    clusters.set(frameFit.cluster_id, {
      cluster_id: frameFit.cluster_id,
      frame_label: frameFit.frame_label,
      occurrence_count: 0,
      supported_count: 0,
      candidate_count: 0,
      weak_count: 0,
      ambiguous_count: 0,
      best_raw_score: 0,
      work_ids: new Set(),
      source_refs: new Set(),
      matched_cues: new Map(),
    });
  }
  const cluster = clusters.get(frameFit.cluster_id);
  cluster.occurrence_count += 1;
  cluster.best_raw_score = Math.max(cluster.best_raw_score, frameFit.raw_score);
  cluster.work_ids.add(occurrence.work_id);
  cluster.source_refs.add(occurrence.source_ref);
  if (frameFit.status === 'supported') cluster.supported_count += 1;
  else if (frameFit.status === 'candidate') cluster.candidate_count += 1;
  else if (frameFit.status === 'weak') cluster.weak_count += 1;
  else cluster.ambiguous_count += 1;
  for (const cue of frameFit.matched_cues) increment(cluster.matched_cues, cue.cue);
}

function makeCandidateRow(occurrence, frameFit) {
  return {
    candidate_id: stableId('usage-candidate', [occurrence.occurrence_id, frameFit.cluster_id, frameFit.raw_score]),
    occurrence_id: occurrence.occurrence_id,
    token_key: occurrence.token_key,
    token_surface: occurrence.token_surface,
    token_normalized: occurrence.token_normalized,
    focus_surface: occurrence.focus_surface,
    focus_normalized: occurrence.focus_normalized,
    route_type: 'workbench_usage_commentary',
    candidate_status: frameFit.status,
    not_a_definition: true,
    observed_usage_only: true,
    cluster_id: frameFit.cluster_id,
    frame_label: frameFit.frame_label || 'unclustered',
    raw_score: frameFit.raw_score,
    score_components: {
      matched_cues: frameFit.matched_cues,
      route_links_considered: frameFit.route_links.map(compactRouteLink),
      match_basis: occurrence.match_basis,
      auto_context_signature: frameFit.auto_context_signature || null,
    },
    route_links: frameFit.route_links.map(compactRouteLink),
    evidence_basis: makeEvidenceBasis(frameFit),
    usage_note: makeUsageNote(frameFit),
    phrase_hebrew: occurrence.phrase_window.phrase_hebrew,
    phrase_tokens: occurrence.phrase_window.phrase_tokens,
    source_ref: occurrence.source_ref,
    sefaria_ref: occurrence.sefaria_ref,
    work_id: occurrence.work_id,
    work_title: occurrence.work_title,
    work_slug: occurrence.work_slug,
    unit_id: occurrence.unit_id,
    source_url: occurrence.source_url,
    version_title: occurrence.version_title,
    version_source: occurrence.version_source,
    license: occurrence.license,
    license_url: occurrence.license_url,
    source_rows: occurrence.source_rows,
  };
}

function makeEvidenceBasis(frameFit) {
  if (frameFit.auto_context_signature) {
    return [
      `auto context cluster from recurrent nearby Hebrew tokens: ${frameFit.auto_context_signature.cues.map((cue) => cue.normalized).join(', ')}`,
    ];
  }
  if (!frameFit.matched_cues.length) return ['No seeded frame cue matched inside the phrase window.'];
  return frameFit.matched_cues.map((cue) => (
    `focus phrase window contains cue ${cue.cue} at distance ${cue.distance_from_focus}`
  ));
}

function makeUsageNote(frameFit) {
  if (frameFit.auto_context_signature) {
    const cues = frameFit.auto_context_signature.cues.map((cue) => cue.normalized).join(', ');
    return `Observed usage marker grouped into ${frameFit.cluster_id} by recurrent neighboring Hebrew tokens ${cues}. This is not a definition and not an imported translation.`;
  }
  if (!frameFit.matched_cues.length) {
    return 'Observed usage marker only. No seeded usage frame matched in the phrase window.';
  }
  const cues = frameFit.matched_cues.map((cue) => cue.cue).join(', ');
  return `Project-authored source-frame commentary: this occurrence matches ${frameFit.cluster_id} through cues ${cues}. This is not a definition and not an imported translation.`;
}

function cleanPlainText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function mapToCountObjects(map, keyName) {
  return Array.from(map.entries())
    .map(([key, count]) => ({ [keyName]: key, count }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function compareOccurrenceMarkers(a, b) {
  return a.work_id.localeCompare(b.work_id)
    || a.source_ref.localeCompare(b.source_ref)
    || a.occurrence_id.localeCompare(b.occurrence_id);
}

function compareCandidateRows(a, b) {
  return b.raw_score - a.raw_score
    || a.candidate_status.localeCompare(b.candidate_status)
    || a.source_ref.localeCompare(b.source_ref)
    || a.candidate_id.localeCompare(b.candidate_id);
}

function writeReport(relativePath, graph, candidates) {
  const lines = [
    '# Workbench Usage Graph Report',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Scope',
    '',
    `- Focus token key: ${graph.focus.token_key}`,
    `- Source files scanned: ${graph.inputs.source_files_scanned}`,
    `- Include untracked sources: ${graph.inputs.include_untracked}`,
    `- Prefix-family candidates included: ${graph.inputs.include_prefix_family}`,
    `- Occurrence markers: ${graph.counts.occurrence_markers}`,
    `- Candidate rows: ${candidates.counts.candidate_rows}`,
    `- Route links available: ${graph.counts.route_links_available}`,
    `- Distinct works: ${graph.counts.distinct_works}`,
    '',
    '## Candidate Status',
    '',
    `- Supported: ${candidates.counts.supported}`,
    `- Candidate: ${candidates.counts.candidate}`,
    `- Weak: ${candidates.counts.weak}`,
    `- Ambiguous: ${candidates.counts.ambiguous}`,
    '',
    '## Top Clusters',
    '',
    ...graph.clusters.slice(0, 12).map((cluster) => (
      `- ${cluster.cluster_id}: ${cluster.occurrence_count} occurrence(s), best raw ${cluster.best_raw_score}, supported ${cluster.supported_count}, candidate ${cluster.candidate_count}, weak ${cluster.weak_count}, ambiguous ${cluster.ambiguous_count}`
    )),
    '',
    '## Top Candidate Rows',
    '',
    ...candidates.candidate_rows.slice(0, 20).map((row) => (
      `- ${row.source_ref} | ${row.work_title} | ${row.candidate_status} | raw ${row.raw_score} | ${row.cluster_id}`
    )),
    '',
    '## Boundary',
    '',
    'This artifact is graph-first and candidate-second. It does not choose the visible HUD answer, does not own final ranking, and does not publish source-frame commentary as a licensed definition claim.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
