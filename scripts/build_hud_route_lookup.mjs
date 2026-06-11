#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

const defaults = {
  storeDir: '.local-cache/hud-route-store',
  outDir: '.local-cache/hud-route-lookup',
  publicSample: 'data/definitions/hud-route-lookup-sample.json',
  prefixLength: 3,
  maxSampleCards: 80,
  maxOpenTempStreams: 96,
  estimatedExpansionFactor: 2.75,
  spaceSafetyGb: 1,
  maxLookupCards: 1000000,
  skipSpacePreflight: false,
};

function samplePublicationBoundary(sampleType) {
  return {
    publication_status: 'blocked_no_render',
    validates: [
      `${sampleType}_sample`,
      'route_card_sample_source_license_rows',
    ],
    does_not_clear: [
      'translation_output',
      'source_publication',
      'public_lexical_export_reuse',
      'accepted_definition_authority',
    ],
    answer_eligible_scope: 'hud_answer_slot_only_not_translation_or_publication_readiness',
    sample_scope: 'diagnostic_route_sample_not_publication_readiness',
    warning_status_blocks_publication_claim: true,
    current_route_inputs_reconciled: 'not_checked_by_route_sample_validate_release_stamp_and_drift',
  };
}

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--store-dir') args.storeDir = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
    else if (arg === '--public-sample') args.publicSample = argv[++i];
    else if (arg === '--prefix-length') args.prefixLength = Number(argv[++i]);
    else if (arg === '--max-sample-cards') args.maxSampleCards = Number(argv[++i]);
    else if (arg === '--max-open-temp-streams') args.maxOpenTempStreams = Number(argv[++i]);
    else if (arg === '--estimated-expansion-factor') args.estimatedExpansionFactor = Number(argv[++i]);
    else if (arg === '--space-safety-gb') args.spaceSafetyGb = Number(argv[++i]);
    else if (arg === '--max-lookup-cards') args.maxLookupCards = Number(argv[++i]);
    else if (arg === '--skip-space-preflight') args.skipSpacePreflight = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.prefixLength) || args.prefixLength < 1 || args.prefixLength > 4) {
    throw new Error(`Invalid --prefix-length: ${args.prefixLength}`);
  }
  if (!Number.isFinite(args.maxSampleCards) || args.maxSampleCards < 1) {
    throw new Error(`Invalid --max-sample-cards: ${args.maxSampleCards}`);
  }
  if (!Number.isInteger(args.maxOpenTempStreams) || args.maxOpenTempStreams < 8) {
    throw new Error(`Invalid --max-open-temp-streams: ${args.maxOpenTempStreams}`);
  }
  if (!Number.isFinite(args.estimatedExpansionFactor) || args.estimatedExpansionFactor < 1) {
    throw new Error(`Invalid --estimated-expansion-factor: ${args.estimatedExpansionFactor}`);
  }
  if (!Number.isFinite(args.spaceSafetyGb) || args.spaceSafetyGb < 0) {
    throw new Error(`Invalid --space-safety-gb: ${args.spaceSafetyGb}`);
  }
  if (!Number.isFinite(args.maxLookupCards) || args.maxLookupCards < 1) {
    throw new Error(`Invalid --max-lookup-cards: ${args.maxLookupCards}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/build_hud_route_lookup.mjs',
    '',
    'Options:',
    '  --store-dir .local-cache/hud-route-store',
    '  --out-dir .local-cache/hud-route-lookup',
    '  --public-sample data/definitions/hud-route-lookup-sample.json',
    '  --prefix-length 3',
    '  --max-sample-cards 80',
    '  --max-open-temp-streams 96',
    '  --estimated-expansion-factor 2.75',
    '  --space-safety-gb 1',
    '  --max-lookup-cards 1000000',
    '  --skip-space-preflight',
  ].join('\n');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function bytesToGib(bytes) {
  return Math.round((Number(bytes || 0) / 1024 / 1024 / 1024) * 100) / 100;
}

function availableBytes(dirPath) {
  if (typeof fs.statfsSync !== 'function') return null;
  const stats = fs.statfsSync(dirPath);
  return Number(stats.bavail) * Number(stats.bsize);
}

function storeShardBytes(manifest, storeDir) {
  return (manifest.shards || []).reduce((sum, shard) => {
    const manifestBytes = Number(shard.byte_length || 0);
    if (manifestBytes > 0) return sum + manifestBytes;
    const shardPath = shard.path ? path.join(storeDir, shard.path) : '';
    if (!shardPath || !fs.existsSync(shardPath)) return sum;
    return sum + fs.statSync(shardPath).size;
  }, 0);
}

function preflightLookupBuild({ outDir, storeDir, storeManifest, expansionFactor, safetyGb, maxLookupCards, skip }) {
  if (skip) return null;
  const cardCount = Number(storeManifest.counts?.cards_written || 0);
  const phraseCount = Number(storeManifest.counts?.route_sections?.phrase_evidence || 0);
  if (cardCount > maxLookupCards) {
    throw new Error([
      'HUD route lookup build preflight blocked oversized route set.',
      `Cards requested: ${cardCount}.`,
      `Configured max lookup cards: ${maxLookupCards}.`,
      `Phrase evidence cards: ${phraseCount}.`,
      'Lookup build did not start; no output directory was removed.',
    ].join(' '));
  }
  const freeBytes = availableBytes(path.dirname(outDir));
  if (!Number.isFinite(freeBytes)) return null;
  const inputBytes = storeShardBytes(storeManifest, storeDir);
  const safetyBytes = safetyGb * 1024 * 1024 * 1024;
  const estimatedRequiredBytes = Math.ceil(inputBytes * expansionFactor + safetyBytes);
  const result = {
    input_bytes: inputBytes,
    estimated_required_bytes: estimatedRequiredBytes,
    available_bytes: freeBytes,
    expansion_factor: expansionFactor,
    safety_gb: safetyGb,
    max_lookup_cards: maxLookupCards,
    cards_requested: cardCount,
    phrase_evidence_cards: phraseCount,
  };
  if (freeBytes < estimatedRequiredBytes) {
    throw new Error([
      'Insufficient disk space for HUD route lookup build preflight.',
      `Store shard bytes: ${bytesToGib(inputBytes)} GiB.`,
      `Estimated working space required: ${bytesToGib(estimatedRequiredBytes)} GiB.`,
      `Available space: ${bytesToGib(freeBytes)} GiB.`,
      'Lookup build did not start; no output directory was removed.',
    ].join(' '));
  }
  return result;
}

function codepointKey(value, prefixLength) {
  const chars = [...String(value || '')].slice(0, prefixLength);
  if (!chars.length) return 'empty';
  const isHebrewStart = chars[0].codePointAt(0) >= 0x05d0 && chars[0].codePointAt(0) <= 0x05ea;
  if (!isHebrewStart) return 'other';
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

async function readJsonl(filePath, onRecord) {
  if (!fs.existsSync(filePath)) return 0;
  const stream = fs.createReadStream(filePath, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    count += 1;
    await onRecord(JSON.parse(trimmed));
  }
  return count;
}

class TempShardWriter {
  constructor(tmpDir, prefixLength, maxOpenStreams) {
    this.tmpDir = tmpDir;
    this.prefixLength = prefixLength;
    this.maxOpenStreams = maxOpenStreams;
    this.streams = new Map();
    this.initializedShards = new Set();
    this.lastUsed = new Map();
    this.cardCounts = new Map();
    this.tokenSets = new Map();
    this.sequence = 0;
    this.streamError = null;
  }

  async write(card) {
    if (this.streamError) throw this.streamError;
    const shard = codepointKey(card.normalized, this.prefixLength);
    const stream = await this.openStream(shard);
    const ok = stream.write(`${JSON.stringify(card)}\n`);
    if (!ok) await onceEvent(stream, 'drain');
    this.cardCounts.set(shard, this.cardCounts.get(shard) + 1);
    this.tokenSets.get(shard).add(card.normalized);
    if (this.streamError) throw this.streamError;
  }

  async close() {
    await Promise.all([...this.streams.keys()].map((shard) => this.closeStream(shard)));
    if (this.streamError) throw this.streamError;
  }

  async openStream(shard) {
    if (this.streams.has(shard)) {
      this.lastUsed.set(shard, this.sequence += 1);
      return this.streams.get(shard);
    }
    while (this.streams.size >= this.maxOpenStreams) {
      await this.closeLeastRecentlyUsedStream();
    }
    fs.mkdirSync(this.tmpDir, { recursive: true });
    const stream = fs.createWriteStream(path.join(this.tmpDir, `${shard}.jsonl`), {
      encoding: 'utf8',
      flags: this.initializedShards.has(shard) ? 'a' : 'w',
    });
    stream.on('error', (error) => {
      this.streamError = error;
    });
    this.initializedShards.add(shard);
    this.streams.set(shard, stream);
    this.lastUsed.set(shard, this.sequence += 1);
    if (!this.cardCounts.has(shard)) this.cardCounts.set(shard, 0);
    if (!this.tokenSets.has(shard)) this.tokenSets.set(shard, new Set());
    return stream;
  }

  async closeLeastRecentlyUsedStream() {
    let candidate = null;
    for (const [shard, order] of this.lastUsed.entries()) {
      if (!this.streams.has(shard)) continue;
      if (!candidate || order < candidate.order) candidate = { shard, order };
    }
    if (!candidate) return;
    await this.closeStream(candidate.shard);
  }

  async closeStream(shard) {
    const stream = this.streams.get(shard);
    if (!stream) return;
    this.streams.delete(shard);
    this.lastUsed.delete(shard);
    await new Promise((resolve, reject) => {
      stream.end((error) => (error ? reject(error) : resolve()));
      stream.on('error', reject);
    });
  }
}

function onceEvent(emitter, eventName) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      emitter.off(eventName, onEvent);
      emitter.off('error', onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    emitter.once(eventName, onEvent);
    emitter.once('error', onError);
  });
}

export function rankCard(card) {
  const sectionRank = new Map([
    ['strict_hebrew', 0],
    ['strict_aramaic', 1],
    ['lemma', 2],
    ['morphology', 3],
    ['subphrase_evidence', 4],
    ['biblical_paraphrase_evidence', 5],
    ['citable_paraphrase_evidence', 6],
    ['phrase_evidence', 7],
    ['audit', 8],
  ]);
  const adjustedScore = Number.isFinite(card.adjusted_score)
    ? card.adjusted_score
    : (Number.isFinite(card.answer_score) ? card.answer_score : null);
  const rawScore = Number.isFinite(card.raw_score)
    ? card.raw_score
    : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : null);
  const answerRank = card.answer_eligible === true && card.answer_role === 'answer' ? 0 : 1;
  return [
    answerRank,
    -(adjustedScore ?? -1000),
    -(rawScore ?? -1000),
    sectionRank.get(card.display_section) ?? 9,
    -(Number.isFinite(card.answer_score) ? card.answer_score : 0),
    -(Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0),
    String(card.card_id || ''),
  ];
}

export function compareCards(a, b) {
  const left = rankCard(a);
  const right = rankCard(b);
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] < right[i]) return -1;
    if (left[i] > right[i]) return 1;
  }
  return 0;
}

async function finalizeShard({ tmpPath, outPath, shard }) {
  const routesByNormalized = {};
  await readJsonl(tmpPath, (card) => {
    if (!routesByNormalized[card.normalized]) routesByNormalized[card.normalized] = [];
    routesByNormalized[card.normalized].push(card);
  });
  for (const cards of Object.values(routesByNormalized)) cards.sort(compareCards);
  const tokenCount = Object.keys(routesByNormalized).length;
  const cardCount = Object.values(routesByNormalized).reduce((sum, cards) => sum + cards.length, 0);
  writeJson(outPath, {
    schema_version: 1,
    shard,
    token_count: tokenCount,
    card_count: cardCount,
    routes_by_normalized: routesByNormalized,
  });
  return {
    shard,
    path: path.relative(path.dirname(path.dirname(outPath)), outPath).replace(/\\/g, '/'),
    token_count: tokenCount,
    card_count: cardCount,
    byte_length: fs.statSync(outPath).size,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const storeDir = path.join(root, args.storeDir);
  const outDir = path.join(root, args.outDir);
  const tmpDir = path.join(outDir, '.tmp');
  const shardDir = path.join(outDir, 'shards');
  const storeManifest = readJson(path.join(storeDir, 'manifest.json'));
  const storeSample = readJson(path.join(root, 'data/definitions/hud-route-store-sample.json'));
  const preflight = preflightLookupBuild({
    outDir,
    storeDir,
    storeManifest,
    expansionFactor: args.estimatedExpansionFactor,
    safetyGb: args.spaceSafetyGb,
    maxLookupCards: args.maxLookupCards,
    skip: args.skipSpacePreflight,
  });

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(shardDir, { recursive: true });

  const tempWriter = new TempShardWriter(tmpDir, args.prefixLength, args.maxOpenTempStreams);
  let cardsRead = 0;
  for (const shard of storeManifest.shards || []) {
    cardsRead += await readJsonl(path.join(storeDir, shard.path), (card) => tempWriter.write(card));
  }
  await tempWriter.close();

  const generatedAt = new Date().toISOString();
  const shardInfos = [];
  for (const shard of [...tempWriter.cardCounts.keys()].sort()) {
    shardInfos.push(await finalizeShard({
      tmpPath: path.join(tmpDir, `${shard}.jsonl`),
      outPath: path.join(shardDir, `${shard}.json`),
      shard,
    }));
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const maxShard = shardInfos.reduce((max, shard) => (!max || shard.byte_length > max.byte_length ? shard : max), null);
  const manifest = {
    schema_version: 1,
    generated_at: generatedAt,
    source_store_manifest: `${args.storeDir.replace(/\\/g, '/')}/manifest.json`,
    local_lookup: args.outDir,
    prefix_length: args.prefixLength,
    lookup_strategy: 'Compute the normalized-token prefix, fetch one keyed JSON shard, then read routes_by_normalized[normalized].',
    counts: {
      cards_read: cardsRead,
      cards_written: shardInfos.reduce((sum, shard) => sum + shard.card_count, 0),
      distinct_normalized_tokens: shardInfos.reduce((sum, shard) => sum + shard.token_count, 0),
      shard_count: shardInfos.length,
      max_shard_bytes: maxShard ? maxShard.byte_length : 0,
      max_shard: maxShard ? maxShard.shard : '',
    },
    preflight,
    shards: shardInfos,
  };
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  const publicSample = {
    schema_version: 1,
    generated_at: generatedAt,
    source_store_sample: 'data/definitions/hud-route-store-sample.json',
    local_lookup_manifest: `${args.outDir.replace(/\\/g, '/')}/manifest.json`,
    lookup_strategy: manifest.lookup_strategy,
    publication_boundary: samplePublicationBoundary('hud_route_lookup'),
    prefix_length: args.prefixLength,
    counts: manifest.counts,
    sample_tokens: (storeSample.sample_tokens || []).map((sample) => {
      const shard = codepointKey(sample.normalized, args.prefixLength);
      const cards = (sample.cards || []).slice(0, args.maxSampleCards);
      return {
        token: sample.token,
        normalized: sample.normalized,
        shard,
        shard_path: `shards/${shard}.json`,
        card_count: sample.card_count,
        sample_card_count: cards.length,
        missing_card_reason: sample.missing_card_reason || '',
        cards,
      };
    }),
  };
  writeJson(path.join(root, args.publicSample), publicSample);

  console.log(JSON.stringify({
    generated_at: generatedAt,
    local_lookup: args.outDir,
    public_sample: args.publicSample,
    counts: manifest.counts,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
