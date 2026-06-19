#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const [key, ...rest] = arg.split('=');
  if (key.startsWith('--')) args.set(key.slice(2), rest.length ? rest.join('=') : 'true');
}

const input = args.get('input');
if (!input) {
  console.error('usage: node scripts/validate_visible_display_slot_manifest.mjs --input=<manifest.json>');
  process.exit(2);
}

const allowedStates = new Set(['approved_gloss', 'N/A', 'hidden', 'blocked_review']);
const approvedRequiredFields = [
  'token_id',
  'source_ref',
  'surface_word',
  'normalized',
  'approved_visible_text',
  'approved_visible_text_hash',
  'approved_by',
  'approval_packet_id',
  'source_gate_packet_id',
  'structure_gate_packet_id',
  'package_truth_packet_id',
  'wording_packet_id',
  'boundary_packet_id',
  'validation_packet_id',
];

function clean(value) {
  return String(value ?? '').trim();
}

function isMissing(value) {
  return value === undefined || value === null || clean(value) === '';
}

function slotRows(manifest) {
  if (Array.isArray(manifest.slots)) return manifest.slots;
  if (manifest.slots && typeof manifest.slots === 'object') {
    return Object.entries(manifest.slots).map(([tokenId, slot]) => ({
      token_id: tokenId,
      ...(slot && typeof slot === 'object' ? slot : {}),
    }));
  }
  return [];
}

const manifestPath = path.resolve(input);
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`visible display manifest parse failed: ${error.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

if (manifest?.schema_version !== 1) errors.push('schema_version must be 1');
if (manifest?.artifact_type && manifest.artifact_type !== 'visible_display_slot_manifest_v1') {
  errors.push('artifact_type must be visible_display_slot_manifest_v1 when present');
}
if (!Array.isArray(manifest?.slots) && !(manifest?.slots && typeof manifest.slots === 'object')) {
  errors.push('slots must be an array or token-id object');
}

const seen = new Set();
const rows = slotRows(manifest);
rows.forEach((slot, index) => {
  const location = `slots[${index}]`;
  if (!slot || typeof slot !== 'object') {
    errors.push(`${location} must be an object`);
    return;
  }

  const tokenId = clean(slot.token_id || slot.surface_token_id || slot.target_token_id);
  const sourceRef = clean(slot.source_ref || manifest.page_ref_or_work_scope || manifest.work_id);
  const key = `${sourceRef}|${tokenId}`;
  if (!tokenId) errors.push(`${location} missing token_id`);
  if (seen.has(key)) errors.push(`${location} duplicates token/source_ref ${key}`);
  if (tokenId) seen.add(key);

  const state = clean(slot.display_state);
  if (!allowedStates.has(state)) errors.push(`${location} display_state must be one of ${[...allowedStates].join(', ')}`);
  if (state === 'TBD') errors.push(`${location} display_state must use N/A, not TBD`);

  const visibleText = clean(slot.approved_visible_text);
  if (state === 'approved_gloss') {
    approvedRequiredFields.forEach((field) => {
      if (isMissing(slot[field])) errors.push(`${location} approved_gloss missing ${field}`);
    });
    if (clean(slot.approved_by) !== 'A13') errors.push(`${location} approved_by must be A13`);
  } else if (visibleText) {
    errors.push(`${location} non-approved state must not carry approved_visible_text`);
  }

  ['candidate', 'likely', 'best_match', 'evidence_only'].forEach((forbidden) => {
    if (state === forbidden) errors.push(`${location} forbidden visible display state ${forbidden}`);
  });

  if (Array.isArray(slot.stale_if_inputs) && !slot.stale_if_inputs.length) {
    warnings.push(`${location} stale_if_inputs is empty`);
  }
});

const result = {
  ok: errors.length === 0,
  manifest_path: manifestPath,
  slot_count: rows.length,
  approved_gloss_count: rows.filter((slot) => clean(slot.display_state) === 'approved_gloss').length,
  placeholder: 'N/A',
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
