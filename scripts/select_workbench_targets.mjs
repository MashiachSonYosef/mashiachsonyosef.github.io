#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const defaults = {
  inventory: '.local-cache/workbench-evidence/token-inventory.json',
  frameSeeds: 'data/workbench-evidence/frame-seeds.json',
  routeJsonl: [
    '.local-cache/definition-routes/source-layer-definition-claims.jsonl',
    '.local-cache/definition-routes/kaikki-definition-claims.jsonl',
    '.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl',
    '.local-cache/definition-routes/source-phrase-evidence.jsonl',
  ],
  output: '.local-cache/workbench-evidence/target-queue.json',
  report: 'reports/workbench-target-queue.md',
  minLength: 2,
  minOccurrences: 25,
  maxTargets: 5000,
  maxStopwordRank: 300,
};

const options = parseArgs(process.argv.slice(2));
const inventory = readJson(options.inventory);
const frameSeeds = readJson(options.frameSeeds, false) || { frames: [] };
const seededTokens = new Set((Array.isArray(frameSeeds.frames) ? frameSeeds.frames : []).map((frame) => frame.token_normalized).filter(Boolean));
const stopwords = new Set((inventory.top_tokens || []).slice(0, options.maxStopwordRank).map((row) => row.token_normalized));
const routeIndex = await buildRouteIndex(options.routeJsonl);

const candidates = [];
await readJsonl(inventory.paths.tokens_jsonl, (row) => {
  const normalized = String(row.token_normalized || '');
  if (!normalized) return;
  const isSeeded = seededTokens.has(normalized);
  const isStopword = stopwords.has(normalized);
  const routeLinks = routeIndex.get(normalized) || null;
  if (!isSeeded) {
    if (normalized.length < options.minLength) return;
    if (Number(row.occurrence_count || 0) < options.minOccurrences) return;
    if (isStopword) return;
  }
  candidates.push({
    token_key: row.token_key,
    token_normalized: normalized,
    occurrence_count: row.occurrence_count,
    work_count: row.work_count,
    target_reason: isSeeded ? 'seeded_frame_available' : routeLinks ? 'definition_route_linked' : chooseReason(row),
    priority_score: scoreTarget(row, { isSeeded, routeLinks }),
    route_links: routeLinks,
    top_surfaces: row.top_surfaces || [],
    top_works: row.top_works || [],
    first_refs: row.first_refs || [],
  });
});

candidates.sort((a, b) => b.priority_score - a.priority_score || b.work_count - a.work_count || a.token_normalized.localeCompare(b.token_normalized));
const targets = candidates.slice(0, options.maxTargets);

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_target_queue',
  generated_at: new Date().toISOString(),
  generator: 'scripts/select_workbench_targets.mjs',
  policy: 'Target queue for Agent 3 workbench graph expansion. This prioritizes marking and organization only; it is not a definition ranking.',
  inputs: {
    inventory: options.inventory,
    frame_seeds: options.frameSeeds,
    min_length: options.minLength,
    min_occurrences: options.minOccurrences,
    max_stopword_rank: options.maxStopwordRank,
  },
  counts: {
    candidate_targets: candidates.length,
    emitted_targets: targets.length,
    seeded_targets: targets.filter((row) => row.target_reason === 'seeded_frame_available').length,
    route_linked_targets: targets.filter((row) => row.route_links).length,
  },
  targets,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--inventory=')) parsed.inventory = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--frame-seeds=')) parsed.frameSeeds = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--route-jsonl=')) parsed.routeJsonl = splitPathList(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--min-length=')) parsed.minLength = Number(arg.split('=')[1]);
    else if (arg.startsWith('--min-occurrences=')) parsed.minOccurrences = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-targets=')) parsed.maxTargets = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-stopword-rank=')) parsed.maxStopwordRank = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['minLength', 'minOccurrences', 'maxTargets', 'maxStopwordRank']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function splitPathList(value) {
  return String(value || '').split(',').map((part) => cleanRelativePath(part.trim())).filter(Boolean);
}

function readJson(relativePath, required = true) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    if (required) throw new Error(`Missing file: ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

async function readJsonl(relativePath, onRow) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(root, relativePath), 'utf8'),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    onRow(JSON.parse(trimmed));
  }
}

async function buildRouteIndex(relativePaths) {
  const index = new Map();
  for (const relativePath of relativePaths || []) {
    const fullPath = path.join(root, relativePath);
    if (!fs.existsSync(fullPath)) continue;
    await readJsonl(relativePath, (row) => {
      const normalized = String(row.normalized || row.focus_normalized || row.containing_token_normalized || '');
      if (!normalized) return;
      const routeType = String(row.route_type || row.source_definition_route_type || 'unknown');
      const routeFamily = String(row.route_family || row.source_definition_route_family || 'unknown');
      const score = Number(row.raw_score ?? row.answer_score ?? row.confidence ?? row.evidence_strength ?? 0);
      const id = String(row.claim_id || row.evidence_id || row.card_id || '').trim();
      const summary = index.get(normalized) || {
        route_count: 0,
        best_route_score: 0,
        route_types: new Set(),
        route_families: new Set(),
        sample_route_ids: [],
      };
      summary.route_count += 1;
      summary.best_route_score = Math.max(summary.best_route_score, Number.isFinite(score) ? score : 0);
      summary.route_types.add(routeType);
      summary.route_families.add(routeFamily);
      if (id && summary.sample_route_ids.length < 12) summary.sample_route_ids.push(id);
      index.set(normalized, summary);
    });
  }
  for (const [normalized, summary] of index.entries()) {
    index.set(normalized, {
      normalized,
      route_count: summary.route_count,
      best_route_score: summary.best_route_score,
      route_types: [...summary.route_types].sort(),
      route_families: [...summary.route_families].sort(),
      sample_route_ids: summary.sample_route_ids,
    });
  }
  return index;
}

function scoreTarget(row, { isSeeded, routeLinks }) {
  const occurrenceCount = Number(row.occurrence_count || 1);
  const occurrenceScore = Math.log10(occurrenceCount + 1) * 16;
  const workScore = Math.log10(Number(row.work_count || 1) + 1) * 35;
  const seededBonus = isSeeded ? 1000 : 0;
  const routeBonus = routeLinks ? 180 + Math.min(80, routeLinks.route_count * 2) + Math.min(50, routeLinks.best_route_score / 2) : 0;
  const shortFormPenalty = String(row.token_normalized || '').length <= 2 ? 40 : 0;
  const highVolumePenalty = occurrenceCount > 50000 ? Math.log10((occurrenceCount / 50000) + 1) * 50 : 0;
  return Math.round(seededBonus + routeBonus + occurrenceScore + workScore - shortFormPenalty - highVolumePenalty);
}

function chooseReason(row) {
  if (Number(row.work_count || 0) >= 500) return 'high_cross_corpus_recurrence';
  if (Number(row.occurrence_count || 0) >= 1000) return 'high_occurrence_recurrence';
  return 'manageable_recurrence';
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Target Queue',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    `- Candidate targets: ${artifact.counts.candidate_targets}`,
    `- Emitted targets: ${artifact.counts.emitted_targets}`,
    `- Seeded targets: ${artifact.counts.seeded_targets}`,
    `- Route-linked targets: ${artifact.counts.route_linked_targets}`,
    '',
    '## Top Targets',
    '',
    ...artifact.targets.slice(0, 40).map((row) => (
      `- ${row.token_normalized}: priority ${row.priority_score}, ${row.occurrence_count} occurrence(s), ${row.work_count} work(s), ${row.target_reason}`
    )),
    '',
    '## Boundary',
    '',
    'This queue selects future marking/indexing targets. It does not rank definitions or choose HUD answers.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
