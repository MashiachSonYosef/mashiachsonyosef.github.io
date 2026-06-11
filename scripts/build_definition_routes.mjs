import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const paths = {
  morphologyRules: 'data/lexical/morphology-rules.json',
  lexicalManifest: 'data/lexical/lexicon.json',
  kaikkiRaw: 'data/lexical/.cache/kaikki.org-dictionary-Hebrew.jsonl',
  definitionsDir: 'data/definitions',
  localDir: '.local-cache/definition-routes',
};

const niqqudRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const hebrewLetterRe = /[\u05D0-\u05EA]/u;
const unsafeHebrewSurfaceRe = /[A-Za-z0-9+\\\/?;:\[\]{}<>_=*|@#$%^&~]/u;
const allowedLemmaSurfaceRe = /^[\u0590-\u05FF\s.'"(),.-]+$/u;
const allowedFormSurfaceRe = /^[\u0590-\u05FF.'"-]+$/u;
const finalLetters = new Map([
  ['ך', 'כ'],
  ['ם', 'מ'],
  ['ן', 'נ'],
  ['ף', 'פ'],
  ['ץ', 'צ'],
]);

const allowedDefinitionSources = [
  {
    source_id: 'project-morphology-rules',
    source_name: 'Project-authored conservative morphology rules',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source_url: 'local:project-morphology-rules',
    accepted: true,
    public_use: true,
    notes: 'Project-authored closed grammar and token-shape metadata. No external dictionary text imported.',
  },
  {
    source_id: 'project-paraphrase-route-policy',
    source_name: 'Project-authored paraphrase route policy',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source_url: 'local:project-paraphrase-route-policy',
    accepted: true,
    public_use: true,
    notes: 'Project-authored route metadata for biblical and citable paraphrase evidence. No source-text translation imported.',
  },
  {
    source_id: 'project-paraphrase-evidence-contract',
    source_name: 'Project-authored paraphrase evidence ingest contract',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source_url: 'local:project-paraphrase-evidence-contract',
    accepted: true,
    public_use: true,
    notes: 'Project-authored coordination contract for paraphrase evidence ingest. No external dictionary text or English translation is imported.',
  },
  {
    source_id: 'project-hud-route-contract',
    source_name: 'Project-authored HUD route card contract',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source_url: 'local:project-hud-route-contract',
    accepted: true,
    public_use: true,
    notes: 'Project-authored UI contract for displaying route cards, source/license rows, and audit traces. No external dictionary text imported.',
  },
  {
    source_id: 'kaikki-hebrew-enwiktionary',
    source_name: 'Hebrew Wiktionary data via Kaikki/Wiktextract',
    source_family: 'kaikki',
    license: 'CC BY-SA 4.0 / GFDL',
    license_url: 'https://en.wiktionary.org/wiki/Wiktionary:Copyrights',
    source_url: 'https://kaikki.org/dictionary/Hebrew/index.html',
    accepted: true,
    public_use: true,
    notes: 'Uses Hebrew entries from English Wiktionary through Kaikki. Examples and quotation translations are intentionally excluded.',
  },
  {
    source_id: 'wikidata-lexeme',
    source_name: 'Wikidata Lexeme',
    source_family: 'wikidata',
    license: 'CC0',
    license_url: 'https://www.wikidata.org/wiki/Wikidata:Licensing',
    source_url: 'https://www.wikidata.org/wiki/Wikidata:Lexicographical_data',
    accepted: true,
    public_use: true,
    notes: 'Structured lexeme data and gloss labels remain CC0 source rows.',
  },
  {
    source_id: 'openscriptures-hebrewlexicon',
    source_name: 'OpenScriptures HebrewLexicon',
    source_family: 'openscriptures',
    license: 'CC BY 4.0',
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    source_url: 'https://github.com/openscriptures/HebrewLexicon',
    accepted: true,
    public_use: true,
    notes: 'OpenScriptures files state CC BY 4.0; public-domain underlying dictionary text remains separated by source row.',
  },
];

function mkdirp(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4')
    .replace(/\u2010|\u2011|\u2012|\u2013|\u2014/g, '-');
}

function normalizeHebrew(value) {
  let normalized = normalizeHebrewPunctuation(value).normalize('NFC').replace(niqqudRe, '');
  normalized = Array.from(normalized, (ch) => finalLetters.get(ch) || ch).join('');
  return normalized;
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
}

function sourceRow(sourceId, extra = {}) {
  const source = allowedDefinitionSources.find((candidate) => candidate.source_id === sourceId);
  if (!source) throw new Error(`Unknown source id ${sourceId}`);
  return {
    source_name: source.source_name,
    source_family: source.source_family,
    source_id: extra.source_id || source.source_id,
    source_url: extra.source_url || source.source_url,
    license: source.license,
    license_url: source.license_url,
    fields_used: extra.fields_used || [],
    notes: extra.notes || source.notes,
  };
}

function makeMorphologyClaims(morphology) {
  const claims = [];
  for (const rule of morphology.rules || []) {
    const answerEligible = rule.kind !== 'shape';
    claims.push({
      claim_id: stableId('def-morph', [rule.rule_id, rule.hebrew, rule.meanings]),
      route_family: 'project_morphology',
      route_type: rule.kind,
      language: rule.language,
      surface: rule.hebrew,
      normalized: normalizeHebrew(rule.normalized || rule.hebrew),
      match_type: rule.route_role,
      confidence: rule.confidence,
      answer_eligible: answerEligible,
      answer_role: answerEligible ? 'answer' : 'audit',
      meanings: rule.meanings,
      gloss: rule.meanings.join('; '),
      morphology: {
        rule_id: rule.rule_id,
        plain_label: rule.plain_label,
        route_role: rule.route_role,
        safe_default: rule.safe_default,
      },
      source_rows: [sourceRow('project-morphology-rules', {
        fields_used: ['closed-class grammar rule', 'token-shape rule', 'plain UI label'],
      })],
    });
  }
  return claims;
}

function bumpStat(stats, key) {
  if (!stats) return;
  stats[key] = (stats[key] || 0) + 1;
}

function isHebrewLemmaSurface(value) {
  const text = normalizeHebrewPunctuation(value).trim();
  return Boolean(text)
    && hebrewLetterRe.test(text)
    && !unsafeHebrewSurfaceRe.test(text)
    && allowedLemmaSurfaceRe.test(text);
}

function isHebrewFormSurface(value) {
  const text = normalizeHebrewPunctuation(value).trim();
  return Boolean(text)
    && hebrewLetterRe.test(text)
    && !unsafeHebrewSurfaceRe.test(text)
    && allowedFormSurfaceRe.test(text);
}

function collectGlosses(entry) {
  const glosses = [];
  for (const sense of entry.senses || []) {
    for (const gloss of sense.glosses || []) {
      const cleaned = cleanText(gloss);
      if (cleaned && !glosses.includes(cleaned)) glosses.push(cleaned);
    }
  }
  return glosses;
}

function isFormReferenceGloss(value) {
  return /^(plural|singular|dual|construct|definite|indefinite|feminine|masculine|form of|alternative form of|defective spelling of|misspelling of)\b/i.test(String(value || ''));
}

function classifyMeanings(meanings) {
  const values = (meanings || []).map(cleanText).filter(Boolean);
  if (!values.length) return { meaning_quality: 'empty', answer_eligible: false, answer_score_adjustment: -40 };
  if (values.every(isFormReferenceGloss)) {
    return { meaning_quality: 'form_reference', answer_eligible: false, answer_score_adjustment: -26 };
  }
  return { meaning_quality: 'definition', answer_eligible: true, answer_score_adjustment: 6 };
}

function compactTags(tags) {
  return Array.from(new Set((tags || []).map(cleanText).filter(Boolean))).slice(0, 12);
}

function makeKaikkiDefinitionClaim(entry, lineNumber, stats = null) {
  const word = cleanText(entry.word);
  const glosses = collectGlosses(entry);
  if (!word || !isHebrewLemmaSurface(word)) {
    bumpStat(stats, 'skipped_malformed_lemma_surface');
    return null;
  }
  if (!glosses.length) return null;
  const senseIds = [];
  for (const sense of entry.senses || []) {
    if (sense.id) senseIds.push(sense.id);
  }
  const sourceId = stableId('kaikki', [word, entry.pos, senseIds.slice(0, 8), glosses.slice(0, 8)]);
  const meaningRank = classifyMeanings(glosses);
  return {
    claim_id: stableId('def-kaikki-lemma', [word, entry.pos, glosses, lineNumber]),
    route_family: 'wiktionary_definition',
    route_type: 'lemma',
    language: entry.lang || 'Hebrew',
    lang_code: entry.lang_code || 'he',
    surface: word,
    normalized: normalizeHebrew(word),
    match_type: 'lemma',
    confidence: 94,
    answer_score: meaningRank.answer_eligible ? Math.max(0, Math.min(100, 94 + meaningRank.answer_score_adjustment)) : null,
    source_order: lineNumber,
    meaning_quality: meaningRank.meaning_quality,
    answer_eligible: meaningRank.answer_eligible,
    answer_role: meaningRank.answer_eligible ? 'answer' : 'evidence',
    part_of_speech: entry.pos || '',
    transliteration: cleanText((entry.head_templates || [])[0]?.args?.tr || ''),
    meanings: glosses,
    gloss: glosses.join('; '),
    forms_count: Array.isArray(entry.forms) ? entry.forms.length : 0,
    source_rows: [sourceRow('kaikki-hebrew-enwiktionary', {
      source_id: sourceId,
      fields_used: ['word', 'part of speech', 'glosses', 'forms/tags without examples'],
      notes: `Kaikki Hebrew JSONL line ${lineNumber}. Examples and quotation translations excluded.`,
    })],
  };
}

function makeKaikkiFormClaims(entry, lemmaClaim, lineNumber, stats = null) {
  if (!lemmaClaim || !Array.isArray(entry.forms)) return [];
  const claims = [];
  const seen = new Set();
  for (const form of entry.forms) {
    const tags = compactTags(form.tags);
    if (!tags.length || tags.includes('romanization') || tags.includes('table-tags') || tags.includes('inflection-template')) continue;
    const surface = cleanText(form.form);
    if (!surface) continue;
    if (!isHebrewFormSurface(surface)) {
      bumpStat(stats, 'skipped_malformed_form_surface');
      continue;
    }
    const normalized = normalizeHebrew(surface);
    if (!normalized || normalized === lemmaClaim.normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    const formGloss = `form of ${lemmaClaim.surface}`;
    claims.push({
      claim_id: stableId('def-kaikki-form', [lemmaClaim.claim_id, normalized, tags]),
      route_family: 'wiktionary_definition',
      route_type: 'form',
      language: entry.lang || 'Hebrew',
      lang_code: entry.lang_code || 'he',
      surface,
      normalized,
      match_type: 'inflected_form',
      confidence: 84,
      answer_score: null,
      source_order: lineNumber,
      meaning_quality: 'form_reference',
      answer_eligible: false,
      answer_role: 'form_reference',
      part_of_speech: entry.pos || '',
      meanings: [formGloss],
      gloss: formGloss,
      inherited_meanings: lemmaClaim.meanings,
      inherited_gloss: lemmaClaim.gloss,
      form_of: {
        lemma: lemmaClaim.surface,
        normalized_lemma: lemmaClaim.normalized,
        tags,
      },
      source_rows: [sourceRow('kaikki-hebrew-enwiktionary', {
        source_id: lemmaClaim.source_rows[0].source_id,
        fields_used: ['forms', 'form tags', 'lemma pointer'],
        notes: `Kaikki Hebrew JSONL line ${lineNumber}. Form route points back to the licensed lemma row; inherited lemma gloss is evidence only.`,
      })],
    });
    if (claims.length >= 80) break;
  }
  return claims;
}

async function buildKaikkiClaims() {
  const rawPath = path.join(root, paths.kaikkiRaw);
  if (!fs.existsSync(rawPath)) {
    return { stats: { available: false }, samples: [], byNormalized: new Map() };
  }

  const outputPath = path.join(root, paths.localDir, 'kaikki-definition-claims.jsonl');
  const csvPath = path.join(root, paths.localDir, 'kaikki-definition-claims.csv');
  const out = fs.createWriteStream(outputPath, { encoding: 'utf8' });
  const csv = fs.createWriteStream(csvPath, { encoding: 'utf8' });
  csv.write('claim_id,route_type,surface,normalized,part_of_speech,confidence,gloss,source_id,license\n');

  const byNormalized = new Map();
  const samples = [];
  const stats = {
    available: true,
    raw_path: paths.kaikkiRaw,
    local_jsonl_path: path.relative(root, outputPath).replace(/\\/g, '/'),
    local_csv_path: path.relative(root, csvPath).replace(/\\/g, '/'),
    entries_read: 0,
    lemma_claims: 0,
    form_claims: 0,
    skipped_no_gloss: 0,
    skipped_malformed_lemma_surface: 0,
    skipped_malformed_form_surface: 0,
  };

  const rl = readline.createInterface({
    input: fs.createReadStream(rawPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    stats.entries_read += 1;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      stats.skipped_no_gloss += 1;
      continue;
    }
    if (entry.lang_code !== 'he' && entry.lang !== 'Hebrew') continue;
    const skippedMalformedLemmaBefore = stats.skipped_malformed_lemma_surface;
    const lemmaClaim = makeKaikkiDefinitionClaim(entry, stats.entries_read, stats);
    if (!lemmaClaim) {
      if (stats.skipped_malformed_lemma_surface === skippedMalformedLemmaBefore) {
        stats.skipped_no_gloss += 1;
      }
      continue;
    }
    const claims = [lemmaClaim, ...makeKaikkiFormClaims(entry, lemmaClaim, stats.entries_read, stats)];
    stats.lemma_claims += 1;
    stats.form_claims += claims.length - 1;
    for (const claim of claims) {
      out.write(`${JSON.stringify(claim)}\n`);
      csv.write([
        claim.claim_id,
        claim.route_type,
        claim.surface,
        claim.normalized,
        claim.part_of_speech || '',
        claim.confidence,
        (claim.gloss || '').replaceAll('"', '""'),
        claim.source_rows[0].source_id,
        claim.source_rows[0].license,
      ].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',') + '\n');
      if (!byNormalized.has(claim.normalized)) byNormalized.set(claim.normalized, []);
      const bucket = byNormalized.get(claim.normalized);
      if (bucket.length < 12) bucket.push(claim);
      if (samples.length < 40 && ['דברים', 'דבריכ', 'דלא', 'בראשית', 'ראשית', 'כלב', 'שמר', 'בנדוד'].includes(claim.normalized)) {
        samples.push(claim);
      }
    }
  }

  await Promise.all([
    new Promise((resolve) => out.end(resolve)),
    new Promise((resolve) => csv.end(resolve)),
  ]);

  stats.total_claims = stats.lemma_claims + stats.form_claims;
  return { stats, samples, byNormalized };
}

function buildLayerClaims() {
  const manifest = readJson(paths.lexicalManifest);
  const claims = [];
  const layerStats = [];
  for (const layer of manifest.layer_files || []) {
    if (!layer.path || layer.source_family === 'kaikki') continue;
    const fullPath = path.join(root, 'data/lexical', layer.path);
    if (!fs.existsSync(fullPath)) continue;
    const data = readJson(path.join('data/lexical', layer.path));
    let count = 0;
    let order = 0;
    for (const entry of data.entries || []) {
      order += 1;
      const surface = cleanText(entry.hebrew_word);
      const meanings = (entry.strict_renderings || []).map(cleanText).filter(Boolean);
      if (!surface || !meanings.length) continue;
      const sourceRows = (entry.source_rows || []).filter((row) => row?.license);
      if (!sourceRows.length) continue;
      const meaningRank = classifyMeanings(meanings);
      claims.push({
        claim_id: stableId('def-layer', [layer.layer_id, entry.entry_id, surface, meanings]),
        route_family: layer.source_family === 'workspace' ? 'project_lexical' : `${layer.source_family}_definition`,
        route_type: 'lemma',
        language: 'Hebrew/Aramaic',
        surface,
        normalized: normalizeHebrew(surface),
        match_type: 'lemma',
        confidence: layer.source_family === 'workspace' ? 95 : 90,
        answer_score: meaningRank.answer_eligible ? Math.max(0, Math.min(100, (layer.source_family === 'workspace' ? 95 : 90) + meaningRank.answer_score_adjustment)) : null,
        source_order: order,
        meaning_quality: meaningRank.meaning_quality,
        answer_eligible: meaningRank.answer_eligible,
        answer_role: meaningRank.answer_eligible ? 'answer' : 'evidence',
        part_of_speech: '',
        meanings,
        gloss: meanings.join('; '),
        source_entry_id: entry.entry_id,
        source_layer_id: layer.layer_id,
        source_rows: sourceRows,
      });
      count += 1;
    }
    layerStats.push({
      layer_id: layer.layer_id,
      source_family: layer.source_family,
      license: layer.license,
      entries: data.entries?.length || 0,
      definition_claims: count,
    });
  }

  const outputPath = path.join(root, paths.localDir, 'source-layer-definition-claims.jsonl');
  const out = fs.createWriteStream(outputPath, { encoding: 'utf8' });
  for (const claim of claims) out.write(`${JSON.stringify(claim)}\n`);
  out.end();

  return {
    stats: {
      local_jsonl_path: path.relative(root, outputPath).replace(/\\/g, '/'),
      total_claims: claims.length,
      layers: layerStats,
    },
    claims,
  };
}

function routeDisplaySection(route) {
  const routeType = route?.route_type || '';
  const routeFamily = route?.route_family || '';
  const language = String(route?.language || '').toLowerCase();
  if (routeType === 'shape') return 'audit';
  if (routeType === 'morphology_parse') return 'morphology';
  if (routeType === 'subphrase_evidence') return 'subphrase_evidence';
  if (routeType === 'biblical_paraphrase_evidence' || routeFamily === 'biblical_paraphrase_evidence') return 'biblical_paraphrase_evidence';
  if (routeType === 'citable_paraphrase_evidence' || routeFamily === 'citable_paraphrase_evidence') return 'citable_paraphrase_evidence';
  if (routeType === 'phrase_evidence') return 'phrase_evidence';
  if (routeType === 'form' && language.includes('aramaic')) return 'strict_aramaic';
  if (routeType === 'form') return 'strict_hebrew';
  if (routeType === 'lemma') return 'lemma';
  return 'audit';
}

function routeScoreHandicap(route) {
  return ['lemma', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence']
    .includes(routeDisplaySection(route)) ? 20 : 0;
}

function routeRank(route) {
  const sectionRank = new Map([
    ['strict_hebrew', 0],
    ['strict_aramaic', 1],
    ['morphology', 2],
    ['lemma', 3],
    ['subphrase_evidence', 4],
    ['biblical_paraphrase_evidence', 5],
    ['citable_paraphrase_evidence', 6],
    ['phrase_evidence', 7],
    ['audit', 8],
  ]);
  const rawScore = Number.isFinite(route?.answer_score)
    ? route.answer_score
    : (Number.isFinite(route?.confidence) ? route.confidence : null);
  const adjustedScore = rawScore === null ? null : rawScore - routeScoreHandicap(route);
  return [
    -(adjustedScore ?? -1000),
    -(rawScore ?? -1000),
    sectionRank.get(routeDisplaySection(route)) ?? 9,
    -(Number.isFinite(route?.context_rank_score) ? route.context_rank_score : 0),
    Number(route?.source_order ?? Number.MAX_SAFE_INTEGER),
    String(route?.claim_id || ''),
  ];
}

function compareRoutes(a, b) {
  const left = routeRank(a);
  const right = routeRank(b);
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] < right[i]) return -1;
    if (left[i] > right[i]) return 1;
  }
  return 0;
}

function compactClaimForSample(claim) {
  if (!claim) return null;
  return {
    claim_id: claim.claim_id,
    route_family: claim.route_family,
    route_type: claim.route_type,
    language: claim.language,
    surface: claim.surface,
    normalized: claim.normalized,
    match_type: claim.match_type,
    confidence: claim.confidence,
    answer_score: claim.answer_eligible === true ? claim.answer_score : null,
    context_rank_score: claim.context_rank_score,
    source_order: claim.source_order,
    meaning_quality: claim.meaning_quality,
    answer_eligible: claim.answer_eligible === true,
    answer_role: claim.answer_role || (claim.answer_eligible === true ? 'answer' : 'evidence'),
    part_of_speech: claim.part_of_speech || '',
    meanings: claim.meanings || [],
    gloss: claim.gloss || '',
    form_of: claim.form_of,
    morphology: claim.morphology,
    source_rows: claim.source_rows,
  };
}

function routeWithContextScore(route, clickedToken = '') {
  const clicked = normalizeHebrewPunctuation(clickedToken).normalize('NFC');
  const routeSurface = normalizeHebrewPunctuation(route.surface).normalize('NFC');
  const clickedLetters = normalizeHebrew(clickedToken);
  const routeLetters = normalizeHebrew(route.surface);
  let contextBonus = 0;
  if (clicked && routeSurface === clicked) contextBonus += 18;
  else if (clickedLetters && routeLetters === clickedLetters) contextBonus += 3;
  if (route.route_type === 'form' && clicked && routeSurface === clicked) contextBonus += 4;
  if (route.part_of_speech === 'name' && clicked && routeSurface !== clicked) contextBonus -= 6;
  return {
    ...route,
    context_rank_score: Math.max(0, Math.min(100, Number(route.answer_score ?? route.confidence ?? 0) + contextBonus)),
  };
}

function makeAnswerEnvelope(routes, shapeRoutes = [], clickedToken = '') {
  const contextRoutes = routes.map((route) => routeWithContextScore(route, clickedToken));
  const eligible = contextRoutes.filter((route) => route.answer_eligible === true).sort(compareRoutes);
  const winner = eligible[0] || null;
  const supporting = contextRoutes
    .filter((route) => !winner || route.claim_id !== winner.claim_id)
    .sort(compareRoutes)
    .slice(0, 12);
  return {
    winner: compactClaimForSample(winner),
    supporting_routes: supporting.map(compactClaimForSample),
    audit_traces: shapeRoutes.map(compactClaimForSample),
  };
}

function bestRouteForNormalized(normalized, sourceLayerByNormalized, kaikkiByNormalized, clickedToken = '') {
  const routes = [
    ...(sourceLayerByNormalized.get(normalized) || []),
    ...(kaikkiByNormalized.get(normalized) || []),
  ].slice(0, 20);
  return makeAnswerEnvelope(routes, [], clickedToken).winner;
}

function morphologyRuleClaimsByRole(morphologyClaims, routeRole) {
  return morphologyClaims.filter((claim) => claim.morphology?.route_role === routeRole);
}

function enumeratePrefixSplits(normalizedToken, prefixClaims, maxDepth = 3) {
  const results = [{ prefixes: [], rest: normalizedToken }];
  function visit(rest, prefixes) {
    if (prefixes.length >= maxDepth) return;
    for (const claim of prefixClaims) {
      const key = normalizeHebrew(claim.normalized || claim.surface);
      if (!key || !rest.startsWith(key) || rest.length <= key.length + 1) continue;
      const next = rest.slice(key.length);
      const nextPrefixes = [...prefixes, claim];
      results.push({ prefixes: nextPrefixes, rest: next });
      visit(next, nextPrefixes);
    }
  }
  visit(normalizedToken, []);
  return results;
}

function splitSuffix(rest, suffixClaims) {
  const sorted = [...suffixClaims].sort((a, b) => normalizeHebrew(b.normalized || b.surface).length - normalizeHebrew(a.normalized || a.surface).length);
  for (const claim of sorted) {
    const key = normalizeHebrew(claim.normalized || claim.surface);
    if (key && rest.endsWith(key) && rest.length > key.length + 1) {
      return {
        suffix: claim,
        base: rest.slice(0, -key.length),
      };
    }
  }
  return { suffix: null, base: rest };
}

function makeMorphologyParseClaim(token, directRoutes, sourceLayerByNormalized, kaikkiByNormalized, morphologyClaims) {
  const normalizedToken = normalizeHebrew(token);
  const prefixClaims = morphologyRuleClaimsByRole(morphologyClaims, 'prefix');
  const suffixClaims = morphologyRuleClaimsByRole(morphologyClaims, 'suffix');
  const candidates = [];
  const directWinner = makeAnswerEnvelope(directRoutes, [], token).winner;
  for (const split of enumeratePrefixSplits(normalizedToken, prefixClaims)) {
    const suffixOptions = [splitSuffix(split.rest, suffixClaims), { suffix: null, base: split.rest }];
    for (const option of suffixOptions) {
      const { suffix, base } = option;
      if (!split.prefixes.length && !suffix) continue;
      if (directWinner && !suffix) continue;
      if (!base || base.length < 2) continue;
      const baseWinner = bestRouteForNormalized(base, sourceLayerByNormalized, kaikkiByNormalized, base);
      if (!baseWinner?.gloss) continue;
      candidates.push({
        prefixes: split.prefixes,
        suffix,
        base,
        baseWinner,
        score: (suffix ? 40 : 0) + (base.length * 8) - (split.prefixes.length * 3) + Number(baseWinner.context_rank_score || baseWinner.answer_score || baseWinner.confidence || 0),
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates[0];
  if (!selected) return null;
  const { prefixes, suffix, baseWinner } = selected;

  const prefixMeanings = prefixes.map((claim) => claim.meanings?.[0]).filter(Boolean);
  const suffixMeanings = suffix?.meanings || [];
  const meanings = [
    ...prefixMeanings,
    baseWinner.gloss,
    ...suffixMeanings,
  ];
  const breakdown = [
    ...prefixes.map((claim) => ({
      role: 'prefix',
      surface: claim.surface,
      meanings: claim.meanings,
      source: claim.source_rows?.[0]?.source_name || '',
    })),
    {
      role: 'main word',
      surface: baseWinner.surface,
      meanings: baseWinner.meanings,
      source: baseWinner.source_rows?.[0]?.source_name || '',
    },
    ...(suffix ? [{
      role: 'ending',
      surface: suffix.surface,
      meanings: suffix.meanings,
      source: suffix.source_rows?.[0]?.source_name || '',
    }] : []),
  ];

  const confidence = Math.min(96, Math.max(82, Number(baseWinner.confidence || 84) + 2));
  return {
    claim_id: stableId('def-morph-parse', [token, prefixes.map((claim) => claim.claim_id), baseWinner.claim_id, suffix?.claim_id]),
    route_family: 'project_morphology',
    route_type: 'morphology_parse',
    language: prefixes.some((claim) => claim.language === 'Aramaic') || suffix?.language === 'Aramaic' ? 'Aramaic/Hebrew' : 'Hebrew',
    surface: token,
    normalized: normalizedToken,
    match_type: prefixes.length && suffix ? 'prefix_base_suffix' : prefixes.length ? 'prefix_base' : 'base_suffix',
    confidence,
    answer_score: confidence + 4,
    meaning_quality: 'definition',
    answer_eligible: true,
    answer_role: 'answer',
    meanings,
    gloss: meanings.join(' + '),
    breakdown,
    source_rows: [
      ...prefixes.flatMap((claim) => claim.source_rows || []),
      ...(baseWinner.source_rows || []),
      ...(suffix?.source_rows || []),
    ],
  };
}

function makeMaqafCompoundClaim(token, partRoutes, maqafClaim) {
  return null;
  if (!partRoutes.length || partRoutes.some((part) => !part.winner?.gloss)) return null;
  const meanings = partRoutes.map((part) => part.winner.gloss);
  const confidence = Math.min(94, Math.max(86, ...partRoutes.map((part) => Number(part.winner.confidence || 86))) - 2);
  return {
    claim_id: stableId('def-maqaf-compound', [token, partRoutes.map((part) => part.winner.claim_id)]),
    route_family: 'project_morphology',
    route_type: 'maqaf_compound',
    language: 'Hebrew/Aramaic',
    surface: token,
    normalized: normalizeHebrew(token),
    match_type: 'maqaf_parts',
    confidence,
    answer_score: confidence + 4,
    meaning_quality: 'definition',
    answer_eligible: true,
    answer_role: 'answer',
    meanings,
    gloss: meanings.join(' + '),
    breakdown: partRoutes.map((part) => ({
      role: 'joined word part',
      surface: part.part,
      meanings: part.winner.meanings,
      source: part.winner.source_rows?.[0]?.source_name || '',
    })),
    source_rows: [
      ...(maqafClaim?.source_rows || []),
      ...partRoutes.flatMap((part) => part.winner.source_rows || []),
    ],
  };
}

function makeSampleRoutes({ morphologyClaims, sourceLayerClaims, kaikkiSamples, kaikkiByNormalized }) {
  const sampleTokens = ['דְּבָרִים', 'בן־דוד', 'וּבִדְבָרֶיךָ', 'דלא', 'בראשית', 'ראשית', 'כלב', 'שמר'];
  const sourceLayerByNormalized = new Map();
  for (const claim of sourceLayerClaims) {
    if (!sourceLayerByNormalized.has(claim.normalized)) sourceLayerByNormalized.set(claim.normalized, []);
    const bucket = sourceLayerByNormalized.get(claim.normalized);
    if (bucket.length < 12) bucket.push(claim);
  }

  const morphologyByNormalized = new Map();
  for (const claim of morphologyClaims) {
    if (!morphologyByNormalized.has(claim.normalized)) morphologyByNormalized.set(claim.normalized, []);
    morphologyByNormalized.get(claim.normalized).push(claim);
  }

  return sampleTokens.map((token) => {
    const normalized = normalizeHebrew(token.replace(/\u05BE/g, ''));
    const maqafParts = token.includes('\u05BE') ? token.split('\u05BE') : [];
    const routes = [
      ...(sourceLayerByNormalized.get(normalized) || []),
      ...(kaikkiByNormalized.get(normalized) || []),
    ].slice(0, 16);
    const shapeRoutes = [];
    if (token !== normalizeHebrew(token)) {
      shapeRoutes.push(...(morphologyByNormalized.get('') || []));
    }
    if (maqafParts.length) {
      shapeRoutes.push(...morphologyClaims.filter((claim) => claim.morphology?.rule_id === 'shape-maqaf'));
    }
    const partRoutes = maqafParts.map((part) => ({
      part,
      normalized: normalizeHebrew(part),
      ...makeAnswerEnvelope([
        ...(sourceLayerByNormalized.get(normalizeHebrew(part)) || []),
        ...(kaikkiByNormalized.get(normalizeHebrew(part)) || []),
      ].slice(0, 16), [], part),
    }));
    const morphologyParse = makeMorphologyParseClaim(token, routes, sourceLayerByNormalized, kaikkiByNormalized, morphologyClaims);
    const maqafCompound = makeMaqafCompoundClaim(
      token,
      partRoutes,
      morphologyClaims.find((claim) => claim.morphology?.rule_id === 'shape-maqaf')
    );
    const expandedRoutes = [
      ...routes,
      ...(morphologyParse ? [morphologyParse] : []),
      ...(maqafCompound ? [maqafCompound] : []),
    ];
    const answer = makeAnswerEnvelope(expandedRoutes, shapeRoutes, token);
    return {
      token,
      normalized,
      answer_route_policy: 'strict source match first; morphology can explain pieces; lemma/form evidence stays secondary unless no strict route exists',
      winner: answer.winner,
      supporting_routes: answer.supporting_routes,
      audit_traces: answer.audit_traces,
      routes: expandedRoutes.map(compactClaimForSample),
      shape_routes: shapeRoutes,
      maqaf_parts: partRoutes,
    };
  });
}

function writeReport({ morphology, morphologyClaims, kaikkiStats, sourceLayerStats, sampleRoutes }) {
  const report = [
    '# Definition Pipeline Report',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Scope',
    '',
    '- Definitions/HUD routing are treated as rebuildable project-owned internals.',
    '- Definition importers own license-safe route rows and raw match scores; final HUD/ranking owns display, winner selection, and live renderer changes.',
    '- Hebrew source imports remain inputs unless an explicit integration pass rewrites shared artifacts.',
    '- Examples and quotation translations from Wiktionary/Kaikki are excluded to avoid importing source-text translations or fair-use quotations.',
    '- Sefaria phrase/subphrase extraction is not treated as globally safe; every version must pass license checks before use.',
    '',
    '## Accepted Sources',
    '',
    ...allowedDefinitionSources.map((source) => `- ${source.source_name}: ${source.license} (${source.source_url})`),
    '',
    '## Generated Artifacts',
    '',
    '- data/definitions/manifest.json',
    '- data/definitions/source-license-inventory.json',
    '- data/definitions/morphology-rules.json',
    '- data/definitions/paraphrase-evidence-contract.json',
    '- data/definitions/paraphrase-evidence-sample.json',
    ...(fs.existsSync(path.join(root, 'data/definitions/citable-paraphrase-evidence-sample.json')) ? ['- data/definitions/citable-paraphrase-evidence-sample.json'] : []),
    '- data/definitions/hud-route-contract.json',
    '- data/definitions/hud-route-fixtures.json',
    '- data/definitions/hud-route-store-sample.json',
    ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-lookup-sample.json')) ? ['- data/definitions/hud-route-lookup-sample.json'] : []),
    ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-lookup/manifest.json')) ? ['- data/definitions/hud-route-lookup/manifest.json'] : []),
    ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-release-stamp.json')) ? ['- data/definitions/hud-route-release-stamp.json'] : []),
    '- data/definitions/definition-route-sample.json',
    `- ${kaikkiStats.local_jsonl_path || '.local-cache/definition-routes/kaikki-definition-claims.jsonl'}`,
    `- ${kaikkiStats.local_csv_path || '.local-cache/definition-routes/kaikki-definition-claims.csv'}`,
    `- ${sourceLayerStats.local_jsonl_path}`,
    ...(fs.existsSync(path.join(root, paths.localDir, 'source-citable-paraphrase-evidence.jsonl')) ? ['- .local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl'] : []),
    '',
    '## Counts',
    '',
    `- Morphology rules: ${morphology.rules.length}`,
    `- Morphology claims: ${morphologyClaims.length}`,
    `- Kaikki entries read: ${kaikkiStats.entries_read || 0}`,
    `- Kaikki lemma claims: ${kaikkiStats.lemma_claims || 0}`,
    `- Kaikki form claims: ${kaikkiStats.form_claims || 0}`,
    `- Kaikki malformed lemma surfaces skipped: ${kaikkiStats.skipped_malformed_lemma_surface || 0}`,
    `- Kaikki malformed form surfaces skipped: ${kaikkiStats.skipped_malformed_form_surface || 0}`,
    `- Existing source-layer claims: ${sourceLayerStats.total_claims}`,
    `- Sample tokens: ${sampleRoutes.length}`,
    '',
    '## Next Safe Lane',
    '',
    '- Add a phrase/subphrase index from already-imported Hebrew source texts, keeping Hebrew citation text separate from English definition claims.',
    '- Add Sefaria phrase candidates only version-by-version after rejecting NC, unclear, or unverified versions.',
    '- Wire HUD to consume the route fixture/lookup samples first, then promote the local lookup shards to chunked public artifacts when the live renderer is ready for on-demand loading.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(root, 'reports/definition-pipeline-report.md'), report, 'utf8');
}

async function main() {
  mkdirp(paths.definitionsDir);
  mkdirp(paths.localDir);

  const morphology = readJson(paths.morphologyRules);
  const morphologyClaims = makeMorphologyClaims(morphology);
  const sourceLayers = buildLayerClaims();
  const kaikki = await buildKaikkiClaims();
  const previousManifest = readJsonIfExists('data/definitions/manifest.json');
  const sampleRoutes = makeSampleRoutes({
    morphologyClaims,
    sourceLayerClaims: sourceLayers.claims,
    kaikkiSamples: kaikki.samples,
    kaikkiByNormalized: kaikki.byNormalized,
  });

  const manifest = {
    schema_version: 1,
    title: 'Definition route manifest',
    generated_at: generatedAt,
    license_policy: 'Definition claims remain source-layered. Third-party rows retain their own licenses and are not relabeled as CC0.',
    route_policy: {
      answer_priority: [
        'strict_source_match',
        'morphology_explained_strict_match',
        'lemma_or_form_match',
        'subphrase_evidence',
        'biblical_paraphrase_evidence',
        'citable_paraphrase_evidence',
      ],
      hud_copy_rules: [
        'Show the winning route as the answer.',
        'Show other real routes as evidence.',
        'Show failed routes only as tiny audit traces.',
        'Never make a failed or weak route visually equal to the answer.',
        'Avoid vague maybe-labels; every visible row must name the actual route family.',
        'Keep source and license rows reachable as compact footnotes.',
        'Use compact card grids when a route family has many real matches.',
      ],
    },
    sources: allowedDefinitionSources,
    local_cache: {
      directory: paths.localDir,
      files: [
        'kaikki-definition-claims.jsonl',
        'kaikki-definition-claims.csv',
        'source-layer-definition-claims.jsonl',
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-phrase-evidence.jsonl')) ? ['source-phrase-evidence.jsonl'] : []),
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-phrase-evidence.csv')) ? ['source-phrase-evidence.csv'] : []),
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-phrase-token-index.json')) ? ['source-phrase-token-index.json'] : []),
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-biblical-paraphrase-evidence.jsonl')) ? ['source-biblical-paraphrase-evidence.jsonl'] : []),
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-citable-paraphrase-evidence.jsonl')) ? ['source-citable-paraphrase-evidence.jsonl'] : []),
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-citable-paraphrase-evidence.csv')) ? ['source-citable-paraphrase-evidence.csv'] : []),
        ...(fs.existsSync(path.join(root, paths.localDir, 'source-citable-paraphrase-token-index.json')) ? ['source-citable-paraphrase-token-index.json'] : []),
        'definition-route-manifest.json',
      ],
    },
    public_artifacts: [
    'data/definitions/morphology-rules.json',
    'data/definitions/paraphrase-route-policy.json',
    'data/definitions/paraphrase-evidence-contract.json',
    'data/definitions/paraphrase-evidence-sample.json',
    ...(fs.existsSync(path.join(root, 'data/definitions/citable-paraphrase-evidence-sample.json')) ? ['data/definitions/citable-paraphrase-evidence-sample.json'] : []),
    ...(fs.existsSync(path.join(root, 'data/definitions/citable-boundary-regression-fixtures.json')) ? ['data/definitions/citable-boundary-regression-fixtures.json'] : []),
    'data/definitions/hud-route-contract.json',
      ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-fixtures.json')) ? ['data/definitions/hud-route-fixtures.json'] : []),
      ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-store-sample.json')) ? ['data/definitions/hud-route-store-sample.json'] : []),
      ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-lookup-sample.json')) ? ['data/definitions/hud-route-lookup-sample.json'] : []),
      ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-lookup/manifest.json')) ? ['data/definitions/hud-route-lookup/manifest.json'] : []),
      ...(fs.existsSync(path.join(root, 'data/definitions/hud-route-release-stamp.json')) ? ['data/definitions/hud-route-release-stamp.json'] : []),
      'data/definitions/source-license-inventory.json',
      'data/definitions/definition-route-sample.json',
      ...(fs.existsSync(path.join(root, 'data/definitions/phrase-evidence-sample.json')) ? ['data/definitions/phrase-evidence-sample.json'] : []),
    ],
    counts: {
      morphology_rules: morphology.rules.length,
      morphology_claims: morphologyClaims.length,
      kaikki_entries_read: kaikki.stats.entries_read || 0,
      kaikki_lemma_claims: kaikki.stats.lemma_claims || 0,
      kaikki_form_claims: kaikki.stats.form_claims || 0,
      kaikki_skipped_malformed_lemma_surfaces: kaikki.stats.skipped_malformed_lemma_surface || 0,
      kaikki_skipped_malformed_form_surfaces: kaikki.stats.skipped_malformed_form_surface || 0,
      source_layer_claims: sourceLayers.stats.total_claims,
    },
    source_rows: allowedDefinitionSources.map((source) => sourceRow(source.source_id, {
      fields_used: ['source policy', 'license metadata', 'definition route provenance'],
    })),
  };
  if (previousManifest?.phrase_evidence) manifest.phrase_evidence = previousManifest.phrase_evidence;
  if (previousManifest?.citable_paraphrase_evidence) manifest.citable_paraphrase_evidence = previousManifest.citable_paraphrase_evidence;

  writeJson('data/definitions/manifest.json', manifest);
  writeJson('data/definitions/source-license-inventory.json', {
    schema_version: 1,
    generated_at: generatedAt,
    policy: 'Only accepted license-safe sources are listed here. NC, unclear, all-rights-reserved, and unverified sources are excluded.',
    sources: allowedDefinitionSources,
  });
  writeJson('data/definitions/morphology-rules.json', morphology);
  writeJson('data/definitions/definition-route-sample.json', {
    schema_version: 1,
    generated_at: generatedAt,
    samples: sampleRoutes,
  });
  writeJson(path.join(paths.localDir, 'definition-route-manifest.json'), manifest);
  writeReport({
    morphology,
    morphologyClaims,
    kaikkiStats: kaikki.stats,
    sourceLayerStats: sourceLayers.stats,
    sampleRoutes,
  });

  console.log(JSON.stringify({
    generated_at: generatedAt,
    counts: manifest.counts,
    local_cache: paths.localDir,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
