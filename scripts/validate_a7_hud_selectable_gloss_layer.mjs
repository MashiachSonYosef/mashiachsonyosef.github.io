#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const input = process.argv[2] || 'data/public-hud/ruth/hud-selectable-glosses.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function fail(message, details = {}) {
  console.error(JSON.stringify({ result: 'fail', message, ...details }, null, 2));
  process.exit(1);
}

function firstShardName(value, prefixLength) {
  return Array.from(String(value || ''))
    .slice(0, prefixLength)
    .map((char) => char.codePointAt(0).toString(16).padStart(4, '0'))
    .join('-');
}

function routeCardsForNormalized(manifest, shardMap, cache, normalized) {
  const shard = firstShardName(normalized, manifest.prefix_length || 3);
  const shardPath = shardMap.get(shard);
  if (!shardPath) return [];
  if (!cache.has(shardPath)) {
    cache.set(shardPath, readJson(path.join('data/definitions/hud-route-lookup', shardPath)));
  }
  const shardJson = cache.get(shardPath);
  const bucket = shardJson.routes_by_normalized?.[normalized] || shardJson[normalized] || [];
  if (Array.isArray(bucket)) return bucket;
  return bucket.cards || bucket.routes || [];
}

function cardText(card) {
  return String(card?.definition || card?.display || card?.gloss || card?.answer || '').replace(/\s+/g, ' ').trim();
}

function hasSourceId(card, sourceId) {
  return Array.isArray(card?.source_rows)
    && card.source_rows.some((row) => String(row.source_id || '').toLowerCase() === String(sourceId || '').toLowerCase());
}

const layer = readJson(input);
if (layer.artifact_type !== 'a7_hud_selectable_gloss_layer_v1') {
  fail('unexpected artifact_type', { artifact_type: layer.artifact_type });
}
if (layer.work_id !== 'ruth') fail('unexpected work_id', { work_id: layer.work_id });
if (layer.implementation_state !== 'flip_ready_candidate') {
  fail('layer must remain a candidate until validator pass is receipted', { implementation_state: layer.implementation_state });
}

const approval = readJson(layer.book_page_dependency?.approval_packet_id || '');
if (approval.work_id !== layer.work_id) fail('A13 approval work_id mismatch', { approval_work_id: approval.work_id });
if (approval.source_id !== 'H5869') fail('unexpected A13 source_id', { source_id: approval.source_id });
if (approval.approved_visible_text !== 'eye') fail('unexpected A13 visible text', { approved_visible_text: approval.approved_visible_text });

const expectedTokens = new Set(approval.exact_token_scope || []);
if (expectedTokens.size !== 4) fail('unexpected A13 token scope size', { size: expectedTokens.size });
if (!Array.isArray(layer.rows) || layer.rows.length !== expectedTokens.size) {
  fail('layer row count does not match A13 token scope', { rows: layer.rows?.length, expected: expectedTokens.size });
}

const visibleManifest = readJson(layer.book_page_dependency?.visible_slot_manifest || '');
if (visibleManifest.approval_state !== layer.book_page_dependency.required_visible_manifest_state) {
  fail('visible manifest is not held for A7 join', {
    approval_state: visibleManifest.approval_state,
    required: layer.book_page_dependency.required_visible_manifest_state,
  });
}
if (visibleManifest.fallback_display_state !== 'N/A') {
  fail('visible manifest fallback is not N/A', { fallback_display_state: visibleManifest.fallback_display_state });
}
if (Array.isArray(visibleManifest.slots) && visibleManifest.slots.length !== 0) {
  fail('visible manifest already has live slots; expected N/A hold before flip', { slot_count: visibleManifest.slots.length });
}

const lookupManifest = readJson('data/definitions/hud-route-lookup/manifest.json');
const shardMap = new Map((lookupManifest.shards || []).map((entry) => [entry.shard, entry.path]));
const shardCache = new Map();
const seen = new Set();
const checked = [];

for (const row of layer.rows) {
  if (!expectedTokens.has(row.token_id)) fail('row token not in A13 approval scope', { token_id: row.token_id });
  if (seen.has(row.token_id)) fail('duplicate row token', { token_id: row.token_id });
  seen.add(row.token_id);
  if (row.a13_visible_text !== approval.approved_visible_text) {
    fail('row visible text does not match A13 approval', { token_id: row.token_id, a13_visible_text: row.a13_visible_text });
  }
  if (row.hud_selectable_gloss !== row.a13_visible_text) {
    fail('HUD selectable gloss does not match A13 visible text', {
      token_id: row.token_id,
      hud_selectable_gloss: row.hud_selectable_gloss,
      a13_visible_text: row.a13_visible_text,
    });
  }
  const cards = routeCardsForNormalized(lookupManifest, shardMap, shardCache, row.normalized);
  const selected = cards.find((card) => card.card_id === row.selected_gloss_card_id);
  if (!selected) fail('selected gloss card missing from HUD lookup', { token_id: row.token_id, card_id: row.selected_gloss_card_id });
  if (selected.answer_eligible !== true || selected.answer_role !== 'answer') {
    fail('selected gloss card is not an existing selectable answer card', {
      token_id: row.token_id,
      card_id: selected.card_id,
      answer_eligible: selected.answer_eligible,
      answer_role: selected.answer_role,
    });
  }
  if (!hasSourceId(selected, row.source_id)) {
    fail('selected gloss card source_id mismatch', { token_id: row.token_id, card_id: selected.card_id, source_id: row.source_id });
  }
  if (!cardText(selected).toLowerCase().includes(row.hud_selectable_gloss.toLowerCase())) {
    fail('selected gloss card text does not include short gloss', {
      token_id: row.token_id,
      card_id: selected.card_id,
      gloss: row.hud_selectable_gloss,
    });
  }
  const cited = cards.find((card) => card.card_id === row.cited_hud_evidence_card_id);
  if (!cited) fail('cited HUD evidence card missing from HUD lookup', { token_id: row.token_id, card_id: row.cited_hud_evidence_card_id });
  if (cited.route_family !== 'citable_paraphrase_evidence' || cited.answer_eligible !== false || cited.answer_role !== 'evidence') {
    fail('cited HUD evidence card is not preserved as evidence-only citable paraphrase', {
      token_id: row.token_id,
      card_id: cited.card_id,
      route_family: cited.route_family,
      answer_eligible: cited.answer_eligible,
      answer_role: cited.answer_role,
    });
  }
  if (!hasSourceId(cited, row.source_id)) {
    fail('cited HUD evidence source_id mismatch', { token_id: row.token_id, card_id: cited.card_id, source_id: row.source_id });
  }
  checked.push({
    token_id: row.token_id,
    normalized: row.normalized,
    selected_gloss_card_id: selected.card_id,
    cited_hud_evidence_card_id: cited.card_id,
    status: 'flip_ready_candidate',
  });
}

console.log(JSON.stringify({
  result: 'pass',
  artifact: input,
  work_id: layer.work_id,
  rows_checked: checked.length,
  a13_approval: layer.book_page_dependency.approval_packet_id,
  visible_manifest_state: visibleManifest.approval_state,
  fallback_display_state: visibleManifest.fallback_display_state,
  selected_gloss: 'eye',
  checked,
  boundary: {
    book_page_flip_performed: false,
    hud_frame_mutation: false,
    route_scoring_mutation: false,
    source_license_legal_acceptance: false,
    publication_release_acceptance: false,
  },
}, null, 2));
