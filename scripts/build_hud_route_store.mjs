#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const HEBREW_MARKS_RE = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;
const FINAL_LETTERS = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);

const defaults = {
  localDir: '.local-cache/definition-routes',
  outDir: '.local-cache/hud-route-store',
  publicSample: 'data/definitions/hud-route-store-sample.json',
  maxSampleCards: 80,
  sampleTokens: ['\u05d3\u05b0\u05bc\u05d1\u05b8\u05e8\u05b4\u05d9\u05dd', '\u05d5\u05bc\u05d1\u05b4\u05d3\u05b0\u05d1\u05b8\u05e8\u05b6\u05d9\u05da\u05b8', '\u05d3\u05dc\u05d0', '\u05d1\u05e8\u05d0\u05e9\u05d9\u05ea', '\u05e8\u05d0\u05e9\u05d9\u05ea', '\u05d1\u05df\u05be\u05d3\u05d5\u05d3'],
};

function parseArgs(argv) {
  const args = { ...defaults, sampleTokens: [...defaults.sampleTokens] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--local-dir') args.localDir = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
    else if (arg === '--public-sample') args.publicSample = argv[++i];
    else if (arg === '--sample-token') args.sampleTokens.push(argv[++i]);
    else if (arg === '--max-sample-cards') args.maxSampleCards = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isFinite(args.maxSampleCards) || args.maxSampleCards < 1) {
    throw new Error(`Invalid --max-sample-cards: ${args.maxSampleCards}`);
  }
  args.sampleTokens = [...new Set(args.sampleTokens.filter(Boolean))];
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/build_hud_route_store.mjs',
    '',
    'Options:',
    '  --local-dir .local-cache/definition-routes',
    '  --out-dir .local-cache/hud-route-store',
    '  --public-sample data/definitions/hud-route-store-sample.json',
    '  --sample-token <token>',
    '  --max-sample-cards 80',
  ].join('\n');
}

function normalizeHebrewKey(value) {
  return [...String(value || '').normalize('NFC').replace(HEBREW_MARKS_RE, '')]
    .map((char) => FINAL_LETTERS.get(char) || char)
    .join('');
}

function mkdirp(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeJson(filePath, value) {
  mkdirp(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sourceKey(row) {
  return `${row?.source_family || ''}|${row?.source_id || ''}|${row?.license || ''}`;
}

function compactSourceRow(row) {
  return {
    source_name: row?.source_name || '',
    source_family: row?.source_family || '',
    source_id: row?.source_id || '',
    source_url: row?.source_url || '',
    license: row?.license || '',
    license_url: row?.license_url || '',
    fields_used: Array.isArray(row?.fields_used) ? row.fields_used : [],
    notes: row?.notes || '',
  };
}

function definitionText(claim) {
  if (claim?.gloss) return String(claim.gloss);
  const meanings = Array.isArray(claim?.meanings) ? claim.meanings.filter(Boolean) : [];
  return meanings.join('; ');
}

function displaySection(claim) {
  const routeType = claim?.route_type || '';
  const routeFamily = claim?.route_family || '';
  const language = String(claim?.language || '').toLowerCase();
  if (routeType === 'shape') return 'audit';
  if (routeType === 'biblical_paraphrase_evidence' || routeFamily === 'biblical_paraphrase_evidence') return 'biblical_paraphrase_evidence';
  if (routeType === 'citable_paraphrase_evidence' || routeFamily === 'citable_paraphrase_evidence') return 'citable_paraphrase_evidence';
  if (routeType === 'subphrase_evidence') return 'subphrase_evidence';
  if (routeType === 'phrase_evidence') return 'phrase_evidence';
  if (routeType === 'morphology_parse') return 'morphology';
  if (routeType === 'form' && language.includes('aramaic')) return 'strict_aramaic';
  if (routeType === 'form') return 'strict_hebrew';
  if (routeType === 'lemma') return 'lemma';
  return 'audit';
}

function labelForCard(card) {
  if (card.route_type === 'morphology_parse') return `Morphology explained ${card.language || 'strict'} match`;
  if (card.route_type === 'shape') return 'Token shape check';
  if (card.route_type === 'form') return `${card.language || 'Source'} form match`;
  if (card.route_type === 'lemma') return `${card.language || 'Source'} lemma match`;
  if (card.route_type === 'phrase_evidence') return 'Licensed phrase use';
  if (card.route_type === 'subphrase_evidence') return 'Subphrase evidence';
  if (card.route_type === 'biblical_paraphrase_evidence' || card.route_family === 'biblical_paraphrase_evidence') return 'Biblical definition/paraphrase match';
  if (card.route_type === 'citable_paraphrase_evidence' || card.route_family === 'citable_paraphrase_evidence') return 'Citable definition/paraphrase match';
  return `${card.route_family || 'Source'} ${card.route_type || 'route'}`.replace(/_/g, ' ').trim();
}

function noteForCard(card) {
  if (card.route_type === 'phrase_evidence') return 'Usage context only; this row does not force a meaning.';
  if (card.route_type === 'biblical_paraphrase_evidence') return 'Source-backed biblical paraphrase route; displayed percent is the route match percent.';
  if (card.route_type === 'citable_paraphrase_evidence') return 'Source-backed citable paraphrase route; displayed percent is the route match percent.';
  if (card.route_type === 'shape') return 'Shape check only; this does not define the whole token.';
  if (card.meaning_quality === 'form_reference') return 'Form-reference route; useful evidence, not a stronger definition than a sourced direct meaning.';
  if (card.form_of?.lemma) return `Points back to lemma ${card.form_of.lemma}.`;
  if (card.route_type === 'morphology_parse') return 'Parsed word parts are shown so the user can see what was matched.';
  return '';
}

function routeScoreHandicap(displaySection) {
  if (['lemma', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(displaySection)) {
    return 20;
  }
  return 0;
}

function finiteNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function isInheritedFormReference(value) {
  return value?.route_type === 'form' && (value?.meaning_quality === 'form_reference' || Boolean(value?.form_of?.lemma));
}

function answerRoleFor(value, answerEligible) {
  if (isInheritedFormReference(value)) return 'form_reference';
  const role = String(value?.answer_role || '').trim();
  if (answerEligible && (!role || role === 'definition')) return 'answer';
  if (role) return role;
  return answerEligible ? 'answer' : 'evidence';
}

function addRouteScoreFields(card, explicitRaw = null, explicitHandicap = null, explicitAdjusted = null) {
  const rawScore = finiteNumber(explicitRaw)
    ?? finiteNumber(card.answer_score)
    ?? finiteNumber(card.confidence_percent);
  const scoreHandicap = finiteNumber(explicitHandicap) ?? routeScoreHandicap(card.display_section);
  const adjustedScore = finiteNumber(explicitAdjusted)
    ?? (rawScore === null ? null : rawScore - scoreHandicap);
  return {
    ...card,
    raw_score: rawScore,
    score_handicap: scoreHandicap,
    adjusted_score: adjustedScore,
  };
}

function shardKey(normalized) {
  const first = [...String(normalized || '')][0];
  if (!first) return 'empty';
  const code = first.codePointAt(0);
  if (code >= 0x05d0 && code <= 0x05ea) return code.toString(16).padStart(4, '0');
  return 'other';
}

function claimToCard(claim) {
  const normalized = claim?.normalized || normalizeHebrewKey(claim?.surface || '');
  const explicitRole = String(claim?.answer_role || '').trim();
  const answerEligible = claim?.answer_eligible === true
    && !isInheritedFormReference(claim)
    && !['evidence', 'audit', 'form_reference'].includes(explicitRole);
  const answerRole = answerRoleFor(claim, answerEligible);
  const card = {
    card_id: claim?.claim_id || '',
    normalized,
    surface: claim?.surface || '',
    route_family: claim?.route_family || '',
    route_type: claim?.route_type || '',
    display_section: '',
    display_label: '',
    language: claim?.language || '',
    match_type: claim?.match_type || '',
    confidence_percent: Number.isFinite(claim?.confidence) ? claim.confidence : null,
    answer_eligible: answerEligible,
    answer_role: answerRole,
    answer_score: answerEligible && Number.isFinite(claim?.answer_score) ? claim.answer_score : null,
    context_rank_score: Number.isFinite(claim?.context_rank_score) ? claim.context_rank_score : null,
    definition: definitionText(claim),
    plain_note: '',
    part_of_speech: claim?.part_of_speech || '',
    meaning_quality: claim?.meaning_quality || '',
    form_of: claim?.form_of || null,
    morphology: claim?.morphology || null,
    source_rows: (claim?.source_rows || []).map(compactSourceRow),
  };
  card.display_section = displaySection(card);
  card.display_label = labelForCard(card);
  card.plain_note = noteForCard(card);
  return addRouteScoreFields(card);
}

function phraseToCard(row) {
  const normalized = row?.focus_normalized || row?.containing_token_normalized || normalizeHebrewKey(row?.focus_surface || '');
  const card = {
    card_id: row?.evidence_id || '',
    normalized,
    surface: row?.focus_surface || '',
    route_family: row?.route_family || 'source_phrase_evidence',
    route_type: row?.route_type || 'phrase_evidence',
    display_section: 'phrase_evidence',
    display_label: 'Licensed phrase use',
    language: row?.language || 'Hebrew/Aramaic',
    match_type: row?.match_type || 'licensed phrase occurrence',
    confidence_percent: Number.isFinite(row?.evidence_strength) ? row.evidence_strength : null,
    answer_eligible: false,
    answer_role: 'evidence',
    answer_score: null,
    context_rank_score: null,
    definition: 'Usage context only; no meaning is forced by this phrase row.',
    plain_note: '',
    phrase_hebrew: row?.phrase_hebrew || '',
    phrase_tokens: Array.isArray(row?.phrase_tokens) ? row.phrase_tokens : [],
    source_ref: row?.source_ref || row?.sefaria_ref || '',
    work_id: row?.work_id || '',
    work_title: row?.work_title || '',
    meaning_claim: row?.meaning_claim ?? null,
    source_rows: (row?.source_rows || []).map(compactSourceRow),
  };
  return addRouteScoreFields(card);
}

function paraphraseToCard(row) {
  const routeType = row?.route_type || '';
  const displaySectionId = displaySection({
    route_type: routeType,
    route_family: row?.route_family || routeType,
  });
  const rawScore = Number.isFinite(row?.raw_score) ? row.raw_score : row?.confidence;
  const scoreHandicap = Number.isFinite(row?.score_handicap) ? row.score_handicap : 20;
  const adjustedScore = Number.isFinite(row?.adjusted_score) ? row.adjusted_score : rawScore - scoreHandicap;
  const boundarySafe = row?.boundary_safe !== false;
  const explicitRole = String(row?.answer_role || '').trim();
  const answerEligible = row?.candidate_status === 'accepted'
    && row?.answer_eligible === true
    && boundarySafe
    && !['evidence', 'audit', 'form_reference'].includes(explicitRole);
  const card = {
    card_id: row?.evidence_id || row?.route_id || '',
    normalized: row?.focus_normalized || normalizeHebrewKey(row?.focus_surface || ''),
    surface: row?.focus_surface || '',
    route_family: row?.route_family || routeType,
    route_type: routeType,
    display_section: displaySectionId,
    display_label: '',
    language: row?.language || 'Hebrew',
    match_type: row?.match_type || 'source-backed paraphrase',
    confidence_percent: Number.isFinite(rawScore) ? rawScore : null,
    answer_eligible: answerEligible,
    answer_role: answerRoleFor(row, answerEligible),
    answer_score: answerEligible && Number.isFinite(adjustedScore) ? adjustedScore : null,
    context_rank_score: Number.isFinite(row?.context_rank_score) ? row.context_rank_score : null,
    definition: row?.definition || row?.route_definition || row?.paraphrase || '',
    plain_note: '',
    part_of_speech: row?.part_of_speech || '',
    meaning_quality: row?.meaning_quality || 'paraphrase_evidence',
    form_of: row?.form_of || null,
    morphology: null,
    phrase_hebrew: row?.phrase_hebrew || row?.source_text_hebrew || row?.source_segment_hebrew || '',
    phrase_tokens: Array.isArray(row?.phrase_tokens) ? row.phrase_tokens : [],
    source_ref: row?.source_ref || row?.sefaria_ref || '',
    work_id: row?.work_id || '',
    work_title: row?.work_title || '',
    route_id: row?.route_id || '',
    cluster_id: row?.cluster_id || '',
    source_definition_surface: row?.source_definition_surface || '',
    source_definition_normalized: row?.source_definition_normalized || '',
    source_definition_lookup_key: row?.source_definition_lookup_key || '',
    boundary_sensitive: row?.boundary_sensitive === true,
    boundary_safe: boundarySafe,
    candidate_status: row?.candidate_status || '',
    source_rows: (row?.source_rows || []).map(compactSourceRow),
  };
  card.display_label = labelForCard(card);
  card.plain_note = noteForCard(card);
  return addRouteScoreFields(card, rawScore, scoreHandicap, adjustedScore);
}

const paraphraseInputFiles = [
  'source-biblical-paraphrase-evidence.jsonl',
  'source-citable-paraphrase-evidence.jsonl',
  'source-paraphrase-evidence.jsonl',
];

async function readJsonl(filePath, onRecord) {
  if (!fs.existsSync(filePath)) return 0;
  const stream = fs.createReadStream(filePath, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    count += 1;
    onRecord(JSON.parse(trimmed));
  }
  return count;
}

class ShardWriter {
  constructor(outDir) {
    this.outDir = outDir;
    this.shardsDir = path.join(outDir, 'shards');
    this.streams = new Map();
    this.counts = new Map();
  }

  write(card) {
    const key = shardKey(card.normalized);
    if (!this.streams.has(key)) {
      fs.mkdirSync(this.shardsDir, { recursive: true });
      this.streams.set(key, fs.createWriteStream(path.join(this.shardsDir, `${key}.jsonl`), { encoding: 'utf8' }));
      this.counts.set(key, 0);
    }
    this.streams.get(key).write(`${JSON.stringify(card)}\n`);
    this.counts.set(key, this.counts.get(key) + 1);
  }

  async close() {
    await Promise.all([...this.streams.values()].map((stream) => new Promise((resolve, reject) => {
      stream.end(resolve);
      stream.on('error', reject);
    })));
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const localDir = path.join(root, args.localDir);
  const outDir = path.join(root, args.outDir);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const sampleKeys = new Set(args.sampleTokens.map(normalizeHebrewKey));
  const sampleCards = new Map([...sampleKeys].map((key) => [key, []]));
  const normalizedTokens = new Set();
  const sourceRows = new Map();
  const routeCounts = new Map();
  const writer = new ShardWriter(outDir);
  const stats = {
    definition_claims_read: 0,
    phrase_rows_read: 0,
    paraphrase_rows_read: 0,
    accepted_paraphrase_rows_read: 0,
    answer_eligible_cards: 0,
    evidence_only_cards: 0,
    form_reference_cards: 0,
    boundary_blocked_cards: 0,
    cards_written: 0,
  };

  const collect = (card) => {
    if (!card.normalized) return;
    normalizedTokens.add(card.normalized);
    routeCounts.set(card.display_section, (routeCounts.get(card.display_section) || 0) + 1);
    if (card.answer_eligible === true && card.answer_role === 'answer') stats.answer_eligible_cards += 1;
    else stats.evidence_only_cards += 1;
    if (card.answer_role === 'form_reference') stats.form_reference_cards += 1;
    if (card.boundary_safe === false) stats.boundary_blocked_cards += 1;
    for (const row of card.source_rows || []) sourceRows.set(sourceKey(row), row);
    writer.write(card);
    stats.cards_written += 1;
    if (sampleCards.has(card.normalized) && sampleCards.get(card.normalized).length < args.maxSampleCards) {
      sampleCards.get(card.normalized).push(card);
    }
  };

  for (const fileName of ['kaikki-definition-claims.jsonl', 'source-layer-definition-claims.jsonl']) {
    stats.definition_claims_read += await readJsonl(path.join(localDir, fileName), (claim) => collect(claimToCard(claim)));
  }
  stats.phrase_rows_read += await readJsonl(path.join(localDir, 'source-phrase-evidence.jsonl'), (row) => collect(phraseToCard(row)));
  const seenParaphraseRows = new Set();
  for (const fileName of paraphraseInputFiles) {
    stats.paraphrase_rows_read += await readJsonl(path.join(localDir, fileName), (row) => {
      if (row?.candidate_status !== 'accepted') return;
      const rowId = row?.evidence_id || row?.route_id || JSON.stringify([row?.route_type, row?.focus_normalized, row?.source_ref]);
      if (seenParaphraseRows.has(rowId)) return;
      seenParaphraseRows.add(rowId);
      stats.accepted_paraphrase_rows_read += 1;
      collect(paraphraseToCard(row));
    });
  }
  await writer.close();

  const generatedAt = new Date().toISOString();
  const shardFiles = [...writer.counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([shard, count]) => ({ shard, path: `shards/${shard}.jsonl`, card_count: count }));
  const manifest = {
    schema_version: 1,
    generated_at: generatedAt,
    source_cache: args.localDir,
    local_store: args.outDir,
    shard_strategy: 'first normalized character codepoint; non-Hebrew keys use other',
    counts: {
      ...stats,
      distinct_normalized_tokens: normalizedTokens.size,
      distinct_source_rows: sourceRows.size,
      shard_count: shardFiles.length,
      route_sections: Object.fromEntries([...routeCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
    },
    shards: shardFiles,
  };
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  const publicSample = {
    schema_version: 1,
    generated_at: generatedAt,
    source_manifest: `${args.outDir.replace(/\\/g, '/')}/manifest.json`,
    route_store_policy: 'Large HUD route store stays local until the live renderer is ready for chunked on-demand loading.',
    sample_tokens: args.sampleTokens.map((token) => {
      const normalized = normalizeHebrewKey(token);
      const cards = sampleCards.get(normalized) || [];
      return {
        token,
        normalized,
        card_count: cards.length,
        missing_card_reason: cards.length ? '' : 'No direct definition/phrase card in the local route store; runtime morphology fixtures may still resolve this token.',
        cards,
      };
    }),
  };
  writeJson(path.join(root, args.publicSample), publicSample);

  console.log(JSON.stringify({
    generated_at: generatedAt,
    local_store: args.outDir,
    public_sample: args.publicSample,
    counts: manifest.counts,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
