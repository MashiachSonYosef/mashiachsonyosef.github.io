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
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--store-dir') args.storeDir = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
    else if (arg === '--public-sample') args.publicSample = argv[++i];
    else if (arg === '--prefix-length') args.prefixLength = Number(argv[++i]);
    else if (arg === '--max-sample-cards') args.maxSampleCards = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.prefixLength) || args.prefixLength < 1 || args.prefixLength > 4) {
    throw new Error(`Invalid --prefix-length: ${args.prefixLength}`);
  }
  if (!Number.isFinite(args.maxSampleCards) || args.maxSampleCards < 1) {
    throw new Error(`Invalid --max-sample-cards: ${args.maxSampleCards}`);
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
  ].join('\n');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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
    onRecord(JSON.parse(trimmed));
  }
  return count;
}

class TempShardWriter {
  constructor(tmpDir, prefixLength) {
    this.tmpDir = tmpDir;
    this.prefixLength = prefixLength;
    this.streams = new Map();
    this.cardCounts = new Map();
    this.tokenSets = new Map();
  }

  write(card) {
    const shard = codepointKey(card.normalized, this.prefixLength);
    if (!this.streams.has(shard)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
      this.streams.set(shard, fs.createWriteStream(path.join(this.tmpDir, `${shard}.jsonl`), { encoding: 'utf8' }));
      this.cardCounts.set(shard, 0);
      this.tokenSets.set(shard, new Set());
    }
    this.streams.get(shard).write(`${JSON.stringify(card)}\n`);
    this.cardCounts.set(shard, this.cardCounts.get(shard) + 1);
    this.tokenSets.get(shard).add(card.normalized);
  }

  async close() {
    await Promise.all([...this.streams.values()].map((stream) => new Promise((resolve, reject) => {
      stream.end(resolve);
      stream.on('error', reject);
    })));
  }
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

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(shardDir, { recursive: true });

  const tempWriter = new TempShardWriter(tmpDir, args.prefixLength);
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
    shards: shardInfos,
  };
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  const publicSample = {
    schema_version: 1,
    generated_at: generatedAt,
    source_store_sample: 'data/definitions/hud-route-store-sample.json',
    local_lookup_manifest: `${args.outDir.replace(/\\/g, '/')}/manifest.json`,
    lookup_strategy: manifest.lookup_strategy,
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
