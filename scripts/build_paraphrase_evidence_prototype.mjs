import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const defaultPaths = {
  sourceDir: 'data/sources',
  frameSeeds: 'data/paraphrase-evidence/route-frame-seeds.json',
  routeStore: 'data/definitions/hud-route-store-sample.json',
  outputDir: '.local-cache/paraphrase-evidence',
  reportDir: 'reports',
};

const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const allowedSourceLicenses = new Set([
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC0',
  'Public Domain',
  'Public Domain Mark',
]);

const licenseUrls = new Map([
  ['CC-BY-SA', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC-BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC-BY', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC-BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['Public Domain', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ['Public Domain Mark', 'https://creativecommons.org/publicdomain/mark/1.0/'],
]);

const niqqudAndCantillationRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const htmlTagRe = /<[^>]+>/g;
const tokenRe = /[\u0590-\u05FF]+(?:[\u05BE-][\u0590-\u05FF]+)*/gu;
const finalLetters = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

const options = parseArgs(process.argv.slice(2));
const focusNormalized = normalizeHebrew(options.focusNormalized || options.focus);
if (!focusNormalized) {
  throw new Error('Provide --focus or --focus-normalized for the prototype run.');
}

const outputSlug = options.slug || slugForFocus(focusNormalized);
const outputPath = `${defaultPaths.outputDir}/prototype-${outputSlug}.json`;
const reportPath = `${defaultPaths.reportDir}/paraphrase-evidence-prototype-${outputSlug}.md`;

mkdirp(defaultPaths.outputDir);
mkdirp(defaultPaths.reportDir);

const frameSeeds = loadFrameSeeds(options.frameSeeds);
const routeCards = loadRouteCards(options.routeStore, focusNormalized);
const sourceFiles = collectSourceFiles();

const blockedSources = [];
const occurrenceMarkers = [];
const candidateRows = [];
const clusterMap = new Map();

for (const relativePath of sourceFiles) {
  const source = readJson(relativePath);
  const units = Array.isArray(source.units) ? source.units : [];
  for (const unit of units) {
    const license = unit.license || source.license || '';
    if (!isAllowedLicense(license)) {
      blockedSources.push({
        source_file: relativePath,
        work_id: source.work_id || unit.work_id || path.basename(relativePath, '.json'),
        source_ref: unit.source_ref || unit.sefaria_ref || '',
        license,
        reason: 'license rejected by paraphrase prototype gate',
      });
      continue;
    }

    const hebrew = flattenHebrew(unit.hebrew);
    if (!hebrew) continue;

    const tokens = tokenize(hebrew);
    for (const [tokenIndex, token] of tokens.entries()) {
      if (token.normalized !== focusNormalized) continue;
      const occurrence = makeOccurrence({
        source,
        unit,
        relativePath,
        tokens,
        tokenIndex,
        license,
      });
      occurrenceMarkers.push(occurrence);

      const best = scoreBestFrame(occurrence, frameSeeds, routeCards);
      const clusterId = best.frame?.frame_id || 'unclustered';
      occurrence.best_frame_id = best.frame?.frame_id || null;
      occurrence.best_frame_score = best.rawScore;
      occurrence.best_frame_cues = best.matchedCues;
      occurrence.cluster_id = clusterId;

      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, {
          cluster_id: clusterId,
          route_hint: best.frame?.route_hint || 'unclustered',
          route_type: occurrence.route_type,
          occurrence_count: 0,
          source_refs: [],
          work_ids: new Set(),
          matched_cues: new Map(),
          best_raw_score: 0,
          row_ids: [],
        });
      }
      updateCluster(clusterMap.get(clusterId), occurrence, best);

      if (best.rawScore < options.minScore) continue;
      candidateRows.push(makeEvidenceRow({ occurrence, best }));
    }
  }
}

candidateRows.sort(compareEvidenceRows);
const rows = selectEvidenceRows(candidateRows);
for (const cluster of clusterMap.values()) cluster.row_ids = [];
for (const row of rows) {
  const cluster = clusterMap.get(row.cluster_id);
  if (cluster) cluster.row_ids.push(row.evidence_id);
}
occurrenceMarkers.sort((a, b) => b.best_frame_score - a.best_frame_score || a.source_ref.localeCompare(b.source_ref));

const clusters = Array.from(clusterMap.values()).map((cluster) => ({
  ...cluster,
  work_ids: Array.from(cluster.work_ids).sort(),
  matched_cues: Array.from(cluster.matched_cues.entries())
    .map(([cue, count]) => ({ cue, count }))
    .sort((a, b) => b.count - a.count || a.cue.localeCompare(b.cue)),
  source_refs: cluster.source_refs.slice(0, options.maxClusterRefs),
})).sort((a, b) => b.best_raw_score - a.best_raw_score || b.occurrence_count - a.occurrence_count);

const output = {
  schema_version: 1,
  generated_at: generatedAt,
  generator: 'scripts/build_paraphrase_evidence_prototype.mjs',
  prototype_policy: 'Paraphrase rows are project-authored route-fit evidence over licensed Hebrew/Aramaic source text. They do not import English translations and do not force definitions.',
  focus: {
    token_surface: options.focus || null,
    token_normalized: focusNormalized,
  },
  scoring_policy: {
    raw_score: '0-100 route-fit score from source-context cues and definition-route alignment.',
    handicap: options.handicap,
    adjusted_score: 'raw_score - handicap; the HUD owner decides final aggregation.',
    min_score_emitted: options.minScore,
  },
  inputs: {
    source_files_scanned: sourceFiles.length,
    route_store: options.routeStore,
    frame_seeds: options.frameSeeds,
    include_untracked: options.includeUntracked,
  },
  route_cards_considered: routeCards.map(summarizeRouteCard),
  counts: {
    occurrence_markers: occurrenceMarkers.length,
    candidate_rows: candidateRows.length,
    evidence_rows: rows.length,
    clusters: clusters.length,
    blocked_source_units: blockedSources.length,
  },
  clusters,
  occurrence_markers: occurrenceMarkers,
  rows,
  blocked_sources: blockedSources.slice(0, options.maxBlocked),
};

writeJson(outputPath, output);
writeReport(reportPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);

function parseArgs(args) {
  const parsed = {
    focus: '',
    focusNormalized: '',
    slug: '',
    includeUntracked: false,
    sourceFiles: [],
    frameSeeds: defaultPaths.frameSeeds,
    routeStore: defaultPaths.routeStore,
    window: 6,
    minScore: 70,
    maxRows: 80,
    maxRowsPerUnit: 2,
    maxClusterRefs: 25,
    maxBlocked: 100,
    handicap: 20,
    pinSourceRefs: [],
  };

  for (const arg of args) {
    if (arg === '--include-untracked') parsed.includeUntracked = true;
    else if (arg.startsWith('--focus=')) parsed.focus = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--focus-normalized=')) parsed.focusNormalized = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--slug=')) parsed.slug = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--source-file=')) parsed.sourceFiles.push(arg.split('=').slice(1).join('=').replace(/\\/g, '/'));
    else if (arg.startsWith('--frame-seeds=')) parsed.frameSeeds = arg.split('=').slice(1).join('=').replace(/\\/g, '/');
    else if (arg.startsWith('--route-store=')) parsed.routeStore = arg.split('=').slice(1).join('=').replace(/\\/g, '/');
    else if (arg.startsWith('--window=')) parsed.window = Number(arg.split('=')[1]);
    else if (arg.startsWith('--min-score=')) parsed.minScore = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-rows=')) parsed.maxRows = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-rows-per-unit=')) parsed.maxRowsPerUnit = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-cluster-refs=')) parsed.maxClusterRefs = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-blocked=')) parsed.maxBlocked = Number(arg.split('=')[1]);
    else if (arg.startsWith('--handicap=')) parsed.handicap = Number(arg.split('=')[1]);
    else if (arg.startsWith('--pin-source-ref=')) parsed.pinSourceRefs.push(arg.split('=').slice(1).join('='));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  for (const key of ['window', 'minScore', 'maxRows', 'maxRowsPerUnit', 'maxClusterRefs', 'maxBlocked', 'handicap']) {
    if (!Number.isFinite(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative number`);
    }
  }
  return parsed;
}

function mkdirp(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
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

function isAllowedLicense(license) {
  if (!license || typeof license !== 'string') return false;
  if (forbiddenLicenseRe.test(license)) return false;
  return allowedSourceLicenses.has(license);
}

function collectSourceFiles() {
  if (options.sourceFiles.length) {
    return options.sourceFiles.map((file) => {
      if (!file.startsWith(`${defaultPaths.sourceDir}/`) || !file.endsWith('.json')) {
        throw new Error(`--source-file must point to JSON under ${defaultPaths.sourceDir}: ${file}`);
      }
      if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing source file: ${file}`);
      return file;
    }).sort();
  }

  if (options.includeUntracked) {
    return fs.readdirSync(path.join(root, defaultPaths.sourceDir))
      .filter((name) => name.endsWith('.json'))
      .map((name) => `${defaultPaths.sourceDir}/${name}`)
      .sort();
  }

  try {
    return execFileSync('git', ['ls-files', '--', `${defaultPaths.sourceDir}/*.json`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split(/\r?\n/).filter(Boolean).sort();
  } catch {
    return fs.readdirSync(path.join(root, defaultPaths.sourceDir))
      .filter((name) => name.endsWith('.json'))
      .map((name) => `${defaultPaths.sourceDir}/${name}`)
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
    tokens.push({
      surface,
      normalized,
      offset: match.index || 0,
    });
  }
  return tokens;
}

function loadFrameSeeds(relativePath) {
  const data = readJson(relativePath);
  return (Array.isArray(data.frames) ? data.frames : [])
    .map((frame) => ({
      ...frame,
      token_normalized: normalizeHebrew(frame.token_normalized),
      context_cues: (Array.isArray(frame.context_cues) ? frame.context_cues : []).map((cue) => ({
        cue: normalizeHebrew(cue.cue),
        weight: Number(cue.weight || 0),
      })).filter((cue) => cue.cue && cue.weight > 0),
      route_selectors: Array.isArray(frame.route_selectors) ? frame.route_selectors.map((value) => String(value).toLowerCase()) : [],
    }))
    .filter((frame) => frame.token_normalized === focusNormalized);
}

function loadRouteCards(relativePath, normalized) {
  const data = readJson(relativePath, false);
  if (!data) return [];
  const cards = [];
  if (Array.isArray(data.sample_tokens)) {
    for (const sample of data.sample_tokens) {
      if (normalizeHebrew(sample.normalized) === normalized) {
        cards.push(...(Array.isArray(sample.cards) ? sample.cards : []));
      }
    }
  }
  if (data.routes_by_normalized && Array.isArray(data.routes_by_normalized[normalized])) {
    cards.push(...data.routes_by_normalized[normalized]);
  }
  return dedupeBy(cards, (card) => card.card_id || card.claim_id || JSON.stringify(card));
}

function dedupeBy(items, getKey) {
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

function makeOccurrence({ source, unit, relativePath, tokens, tokenIndex, license }) {
  const start = Math.max(0, tokenIndex - options.window);
  const end = Math.min(tokens.length, tokenIndex + options.window + 1);
  const phraseTokens = tokens.slice(start, end).map((token, index) => ({
    surface: token.surface,
    normalized: token.normalized,
    role: start + index === tokenIndex ? 'focus-token' : 'context',
    distance_from_focus: start + index - tokenIndex,
  }));
  const focus = tokens[tokenIndex];
  const workId = source.work_id || unit.work_id || path.basename(relativePath, '.json');
  const routeType = String(source.work_slug || '').startsWith('tanakh/')
    ? 'biblical_paraphrase_evidence'
    : 'citable_paraphrase_evidence';

  return {
    occurrence_id: stableId('para-occ', [
      workId,
      unit.unit_id || unit.source_ref || unit.sefaria_ref || '',
      tokenIndex,
      focus.surface,
      options.window,
    ]),
    route_type: routeType,
    token_surface: focus.surface,
    token_normalized: focus.normalized,
    focus_surface: focus.surface,
    focus_normalized: focus.normalized,
    phrase_hebrew: phraseTokens.map((token) => token.surface).join(' '),
    phrase_tokens: phraseTokens,
    source_ref: unit.source_ref || unit.sefaria_ref || '',
    sefaria_ref: unit.sefaria_ref || unit.source_ref || '',
    work_id: workId,
    work_title: source.work_title || unit.work_title || workId,
    work_slug: source.work_slug || '',
    source_file: relativePath,
    unit_id: unit.unit_id || '',
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
    source_id: stableId('source-version', [
      workId,
      unit.version_title || '',
      unit.version_source || '',
      license,
    ]),
    source_url: unit.source_url || source.source_base_url || unit.version_source || '',
    version_title: unit.version_title || '',
    version_source: unit.version_source || '',
    license,
    license_url: licenseUrls.get(license) || '',
    fields_used: ['hebrew', 'source_ref', 'version_title', 'version_source', 'license'],
    notes: 'Source citation and provenance only. The paraphrase route fit is project-authored and is not an imported translation.',
  };
}

function scoreBestFrame(occurrence, frames, cards) {
  let best = {
    frame: null,
    rawScore: 0,
    matchedCues: [],
    routeCard: pickFallbackRoute(cards),
    routeAlignmentScore: 0,
  };
  for (const frame of frames) {
    const matchedCues = matchFrameCues(occurrence, frame);
    const routeCard = pickRouteForFrame(frame, cards);
    const routeAlignmentScore = routeCard ? scoreRouteAlignment(frame, routeCard) : 0;
    if (!matchedCues.length) continue;
    const cueScore = matchedCues.reduce((sum, cue) => sum + cue.weight, 0);
    const densityBonus = Math.min(10, matchedCues.length * 3);
    const sourceBonus = occurrence.route_type === 'biblical_paraphrase_evidence' ? 4 : 2;
    const rawScore = Math.min(99, Math.round(44 + cueScore + densityBonus + routeAlignmentScore + sourceBonus));
    if (rawScore > best.rawScore) {
      best = { frame, rawScore, matchedCues, routeCard, routeAlignmentScore };
    }
  }
  return best;
}

function matchFrameCues(occurrence, frame) {
  const matches = [];
  for (const cue of frame.context_cues) {
    const phraseToken = occurrence.phrase_tokens.find((token) => (
      token.role !== 'focus-token' && hebrewCueMatches(token.normalized, cue.cue)
    ));
    if (!phraseToken) continue;
    matches.push({
      cue: cue.cue,
      matched_token_surface: phraseToken.surface,
      matched_token_normalized: phraseToken.normalized,
      distance_from_focus: phraseToken.distance_from_focus,
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

function pickRouteForFrame(frame, cards) {
  const scored = cards.map((card) => ({
    card,
    score: scoreRouteAlignment(frame, card),
  })).filter((item) => item.score > 0);
  scored.sort((a, b) => b.score - a.score || Number(b.card.answer_score || 0) - Number(a.card.answer_score || 0));
  return scored[0]?.card || pickFallbackRoute(cards);
}

function pickFallbackRoute(cards) {
  return cards.slice().sort((a, b) => Number(b.answer_score || 0) - Number(a.answer_score || 0))[0] || null;
}

function scoreRouteAlignment(frame, card) {
  const text = [
    card.definition,
    card.gloss,
    card.plain_note,
    ...(Array.isArray(card.meanings) ? card.meanings : []),
  ].join(' ').toLowerCase();
  let score = 0;
  for (const selector of frame.route_selectors) {
    if (selector && text.includes(selector)) score += 3;
  }
  return Math.min(9, score);
}

function updateCluster(cluster, occurrence, best) {
  cluster.occurrence_count += 1;
  cluster.work_ids.add(occurrence.work_id);
  cluster.best_raw_score = Math.max(cluster.best_raw_score, best.rawScore);
  if (cluster.source_refs.length < options.maxClusterRefs) cluster.source_refs.push(occurrence.source_ref);
  for (const cue of best.matchedCues) {
    cluster.matched_cues.set(cue.cue, (cluster.matched_cues.get(cue.cue) || 0) + 1);
  }
}

function makeEvidenceRow({ occurrence, best }) {
  const routeCard = best.routeCard;
  const adjustedScore = Math.max(0, best.rawScore - options.handicap);
  const row = {
    evidence_id: stableId('para', [
      occurrence.occurrence_id,
      best.frame?.frame_id || '',
      routeCard?.card_id || routeCard?.claim_id || '',
      best.rawScore,
    ]),
    route_family: 'source_paraphrase_evidence',
    route_type: occurrence.route_type,
    display_section: occurrence.route_type,
    language: 'Hebrew/Aramaic',
    match_type: 'source-frame paraphrase route fit',
    token_surface: occurrence.token_surface,
    token_normalized: occurrence.token_normalized,
    focus_surface: occurrence.focus_surface,
    focus_normalized: occurrence.focus_normalized,
    route_card_id: routeCard?.card_id || routeCard?.claim_id || null,
    route_definition_from_definition_layer: routeCard?.definition || routeCard?.gloss || null,
    route_hint: best.frame?.route_hint || null,
    cluster_id: best.frame?.frame_id || 'unclustered',
    raw_score: best.rawScore,
    handicap: options.handicap,
    adjusted_score: adjustedScore,
    confidence_percent: best.rawScore,
    meaning_claim: null,
    phrase_hebrew: occurrence.phrase_hebrew,
    phrase_tokens: occurrence.phrase_tokens,
    matched_frame_cues: best.matchedCues,
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
    definition_route_source_rows: Array.isArray(routeCard?.source_rows) ? routeCard.source_rows : [],
    notes: makeNotes(best),
  };
  return row;
}

function compareEvidenceRows(a, b) {
  return b.raw_score - a.raw_score
    || b.adjusted_score - a.adjusted_score
    || a.source_ref.localeCompare(b.source_ref)
    || a.evidence_id.localeCompare(b.evidence_id);
}

function selectEvidenceRows(candidates) {
  const selected = [];
  const selectedIds = new Set();
  const perUnitCounts = new Map();
  const pinnedRefs = new Set(options.pinSourceRefs.map((ref) => ref.toLowerCase()));

  for (const row of candidates) {
    if (!pinnedRefs.has(String(row.source_ref).toLowerCase())) continue;
    selected.push(row);
    selectedIds.add(row.evidence_id);
    perUnitCounts.set(row.unit_id, (perUnitCounts.get(row.unit_id) || 0) + 1);
  }

  for (const row of candidates) {
    if (selected.length >= options.maxRows) break;
    if (selectedIds.has(row.evidence_id)) continue;
    const unitCount = perUnitCounts.get(row.unit_id) || 0;
    if (unitCount >= options.maxRowsPerUnit) continue;
    selected.push(row);
    selectedIds.add(row.evidence_id);
    perUnitCounts.set(row.unit_id, unitCount + 1);
  }

  return selected.sort(compareEvidenceRows);
}

function makeNotes(best) {
  const cueList = best.matchedCues.map((cue) => cue.cue).join(', ');
  const frameId = best.frame?.frame_id || 'unclustered';
  return `Project-authored paraphrase route-fit note. The surrounding Hebrew/Aramaic tokens match frame ${frameId}${cueList ? ` through cues: ${cueList}` : ''}. The source row supplies citation and license provenance only; this row is not an imported translation and does not force a definition.`;
}

function summarizeRouteCard(card) {
  return {
    route_card_id: card.card_id || card.claim_id || null,
    route_family: card.route_family || null,
    route_type: card.route_type || null,
    display_section: card.display_section || null,
    normalized: card.normalized || null,
    surface: card.surface || null,
    definition: card.definition || card.gloss || null,
    answer_score: card.answer_score ?? null,
    confidence_percent: card.confidence_percent ?? card.confidence ?? null,
    source_rows: Array.isArray(card.source_rows) ? card.source_rows : [],
  };
}

function writeReport(relativePath, output) {
  const lines = [
    '# Paraphrase Evidence Prototype Report',
    '',
    `Generated: ${output.generated_at}`,
    '',
    '## Scope',
    '',
    `- Focus normalized token: ${output.focus.token_normalized}`,
    `- Source files scanned: ${output.inputs.source_files_scanned}`,
    `- Include untracked sources: ${output.inputs.include_untracked}`,
    `- Occurrence markers: ${output.counts.occurrence_markers}`,
    `- Candidate rows before cap: ${output.counts.candidate_rows}`,
    `- Evidence rows emitted: ${output.counts.evidence_rows}`,
    `- Clusters: ${output.counts.clusters}`,
    `- Blocked source units: ${output.counts.blocked_source_units}`,
    '',
    '## Scoring',
    '',
    `- Handicap: ${output.scoring_policy.handicap}`,
    `- Minimum emitted raw score: ${output.scoring_policy.min_score_emitted}`,
    '- Adjusted score is raw score minus handicap; the HUD owner still owns final aggregation.',
    '',
    '## Top Clusters',
    '',
    ...output.clusters.slice(0, 10).map((cluster) => (
      `- ${cluster.cluster_id}: ${cluster.occurrence_count} occurrence(s), best raw ${cluster.best_raw_score}, cues ${cluster.matched_cues.map((cue) => `${cue.cue}:${cue.count}`).join(', ') || 'none'}`
    )),
    '',
    '## Top Rows',
    '',
    ...output.rows.slice(0, 20).map((row) => (
      `- ${row.source_ref} | ${row.work_title} | raw ${row.raw_score} adjusted ${row.adjusted_score} | ${row.cluster_id}`
    )),
    '',
    '## Policy Note',
    '',
    'Rows are source-backed and license-backed, but the paraphrase route-fit note is project-authored. The source text is never treated as an English translation or as an AI citation.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
