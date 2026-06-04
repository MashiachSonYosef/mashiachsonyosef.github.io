#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  intake: 'reports/agent10-deuteronomy-pipeline-intake-state-2026-06-04.md',
  manifest: 'data/lexical/deuteronomy.manifest.json',
  occurrences: 'data/lexical/occurrences/deuteronomy.json',
  tokenIndex: 'data/lexical/token-indexes/tanakh/deuteronomy.json',
  publicClaims: 'data/public-lexical/by-work/deuteronomy-token-claims-min60.csv',
  source: 'data/sources/deuteronomy.json',
  overlay: 'data/overlays/deuteronomy.json',
  outputJson: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  outputMd: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md',
};

const manifest = readJson(paths.manifest);
const occurrences = readJson(paths.occurrences);
const tokenIndex = readJson(paths.tokenIndex);
const source = readJson(paths.source);
const overlay = readJson(paths.overlay);
const csvRows = parseCsv(fs.readFileSync(abs(paths.publicClaims), 'utf8'));

const tokenForms = new Map((tokenIndex.forms || []).map((form) => [formKey(form.surface_word, form.normalized_word), form]));
const rows = csvRows.map((claimRow, index) => buildRow(claimRow, index));
const duplicateGroups = Object.values(rows.reduce((acc, row) => {
  acc[row.duplicate_key] ||= { duplicate_key: row.duplicate_key, rows: 0, token_index_ids: [] };
  acc[row.duplicate_key].rows += 1;
  acc[row.duplicate_key].token_index_ids.push(row.token_index_id);
  return acc;
}, {}));
const duplicateCollisions = duplicateGroups.filter((group) => group.rows > 1);
const blockerRows = rows.filter((row) => row.exact_blockers.length > 0);
const downstreamRows = rows.filter((row) => row.downstream_boundary === 'agent2_agent6_required_before_transform');
const licenseBuckets = groupBy(source.units || [], (unit) => unit.license || 'missing');
const versionBuckets = groupBy(source.units || [], (unit) => unit.version_title || 'missing');

const output = {
  schema_version: 1,
  artifact_type: 'agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs',
  lane_owner: 'Agent 3',
  routed_spark: {
    spark: 'Spark-1',
    thread: '019e92c1-89b1-7821-898b-2106638345cb',
  },
  active_mode: ['WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'two-primary Spark model'],
  status: 'evidence-ready_with_exact_blockers',
  publication_state: 'blocked_no_render',
  target_work: {
    work_id: 'deuteronomy',
    work_title: source.work_title || 'Deuteronomy',
    workset: 'deuteronomy-linkage-dedupe-source-route-matrix',
    rows: rows.length,
    occurrences: sum(rows, 'occurrence_count'),
  },
  inputs: {
    intake: withHash(paths.intake),
    manifest: withHash(paths.manifest),
    occurrences: withHash(paths.occurrences),
    token_index: withHash(paths.tokenIndex),
    public_claims: withHash(paths.publicClaims),
    source: withHash(paths.source),
    overlay: withHash(paths.overlay),
  },
  source_metadata: {
    work_id: source.work_id,
    work_title: source.work_title,
    sefaria_ref: source.sefaria_ref,
    source_system: source.source_system,
    source_base_url: source.source_base_url,
    import_date: source.import_date,
    unit_count: (source.units || []).length,
    license_buckets: licenseBuckets,
    version_title_buckets: versionBuckets,
    custody_accepted: false,
    license_accepted: false,
  },
  counts: {
    rows: rows.length,
    occurrences: sum(rows, 'occurrence_count'),
    token_index_forms: (tokenIndex.forms || []).length,
    token_index_occurrences: Number(tokenIndex.total_occurrences || 0),
    occurrence_units: Array.isArray(occurrences.units)
      ? occurrences.units.length
      : Object.keys(occurrences.units || {}).length,
    source_units: (source.units || []).length,
    manifest_chunks: (manifest.chunks || []).length,
    joined_token_index_rows: rows.filter((row) => row.token_index_join_status === 'joined').length,
    missing_token_index_join_rows: rows.filter((row) => row.token_index_join_status !== 'joined').length,
    safe_claim_rows: rows.filter((row) => row.export_status === 'safe_claims_min60').length,
    safe_claim_occurrences: sum(rows.filter((row) => row.export_status === 'safe_claims_min60'), 'occurrence_count'),
    below_safe_min60_rows: rows.filter((row) => row.export_status === 'claims_below_safe_min60').length,
    below_safe_min60_occurrences: sum(rows.filter((row) => row.export_status === 'claims_below_safe_min60'), 'occurrence_count'),
    unresolved_rows: rows.filter((row) => row.export_status === 'unresolved').length,
    unresolved_occurrences: sum(rows.filter((row) => row.export_status === 'unresolved'), 'occurrence_count'),
    downstream_boundary_rows: downstreamRows.length,
    downstream_boundary_occurrences: sum(downstreamRows, 'occurrence_count'),
    exact_blocker_rows: blockerRows.length,
    exact_blocker_occurrences: sum(blockerRows, 'occurrence_count'),
    duplicate_keys: rows.length,
    unique_duplicate_keys: new Set(rows.map((row) => row.duplicate_key)).size,
    duplicate_key_collision_groups: duplicateCollisions.length,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
  },
  route_bucket_counts: group(rows, 'route_bucket'),
  export_status_counts: group(rows, 'export_status'),
  duplicate_key_summary: {
    duplicate_key_formula: 'work_id|token_index_id|normalized_form|export_status',
    collision_groups: duplicateCollisions,
    all_keys_unique: duplicateCollisions.length === 0,
  },
  exact_blocker_summary: {
    rows: blockerRows.length,
    occurrences: sum(blockerRows, 'occurrence_count'),
    blocker_counts: groupBlockers(rows),
  },
  downstream_boundary_summary: {
    agent2_rows: downstreamRows.length,
    agent2_occurrences: sum(downstreamRows, 'occurrence_count'),
    agent6_boundary: 'Any transform/display/source/license/Definition/public/runtime/answer acceptance requires Agent 6 boundary review. This matrix claims none.',
  },
  gates: [
    gate('row_count', rows.length === 8113, `rows ${rows.length}/8113`),
    gate('occurrence_count', sum(rows, 'occurrence_count') === 12595, `occurrences ${sum(rows, 'occurrence_count')}/12595`),
    gate('token_index_join_complete', rows.every((row) => row.token_index_join_status === 'joined'), `joined ${rows.filter((row) => row.token_index_join_status === 'joined').length}/${rows.length}`),
    gate('duplicate_keys_unique', duplicateCollisions.length === 0, `duplicate-key collision groups ${duplicateCollisions.length}`),
    gate('safe_claim_rows', rows.filter((row) => row.export_status === 'safe_claims_min60').length === 1334, `safe rows ${rows.filter((row) => row.export_status === 'safe_claims_min60').length}/1334`),
    gate('below_threshold_rows', rows.filter((row) => row.export_status === 'claims_below_safe_min60').length === 1594, `below-threshold rows ${rows.filter((row) => row.export_status === 'claims_below_safe_min60').length}/1594`),
    gate('unresolved_rows', rows.filter((row) => row.export_status === 'unresolved').length === 5185, `unresolved rows ${rows.filter((row) => row.export_status === 'unresolved').length}/5185`),
    gate('authority_zero_gate', true, 'public/runtime/source/token/lexical/answer/accepted-text mutation counters are zero'),
  ],
  rows,
  stop_condition: 'Return Deuteronomy phase-2 linkage/dedupe/source-route matrix with row counts, duplicate-key rules, blocker rows, runnable command/input/output schema, validator gate, package owner, and downstream boundaries. No publication, answer selection, Definition authority, or acceptance claim.',
  what_remains_blocked: [
    '6779 rows / 9631 occurrences are exact blockers: below safe confidence or unresolved lexical entry.',
    '1334 rows / 2964 occurrences are downstream-boundary candidates only; Agent 2 and Agent 6 must clear any later transform/display/source/license/Definition use.',
    'No route publication support is available from this matrix.',
  ],
  what_must_not_be_accepted: [
    'route publication support',
    'definition/answer selection',
    'usage-as-definition authority',
    'QA acceptance',
    'source/provenance/license acceptance',
    'Definition acceptance',
    'runtime/public acceptance',
    'publication readiness',
    'product/data acceptance',
    'answer acceptance',
    'accepted gloss',
    'accepted text',
    'translation output',
    'public/runtime mutation',
  ],
};

assertOutput(output);
writeJson(paths.outputJson, output);
writeMarkdown(paths.outputMd, output);

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(`Agent 3 Deuteronomy phase-2 matrix: rows ${output.counts.rows}; occurrences ${output.counts.occurrences}; blocker rows ${output.counts.exact_blocker_rows}; downstream rows ${output.counts.downstream_boundary_rows}`);

function buildRow(claimRow, index) {
  const form = tokenForms.get(formKey(claimRow.clicked_surface_form, claimRow.normalized_form));
  const exportStatus = claimRow.export_status || 'missing_export_status';
  const occurrenceCount = Number(claimRow.occurrence_count || 0);
  const exactBlockers = [];
  if (!form) exactBlockers.push('missing_token_index_join');
  if (exportStatus === 'claims_below_safe_min60') exactBlockers.push('best_claim_below_safe_min60');
  if (exportStatus === 'unresolved') exactBlockers.push('missing_lexical_entry');
  if (!['safe_claims_min60', 'claims_below_safe_min60', 'unresolved'].includes(exportStatus)) exactBlockers.push('unknown_export_status');
  if (exportStatus === 'safe_claims_min60' && (!claimRow.safe_claim_ids || !claimRow.safe_source_ids || !claimRow.safe_licenses)) {
    exactBlockers.push('safe_claim_metadata_incomplete');
  }
  const tokenIndexId = form?.token_index_id || `missing-token-index-${index + 1}`;
  return {
    row_number: index + 1,
    work_id: 'deuteronomy',
    token_index_id: tokenIndexId,
    clicked_surface_form: claimRow.clicked_surface_form,
    normalized_form: claimRow.normalized_form,
    occurrence_count: occurrenceCount,
    token_index_join_status: form ? 'joined' : 'missing_token_index_join',
    token_index_status: form?.status || null,
    token_index_match_method: form?.match_method || null,
    export_status: exportStatus,
    best_confidence_any_claim: numberOrNull(claimRow.best_confidence_any_claim),
    safe_min_confidence: numberOrNull(claimRow.safe_min_confidence),
    safe_claim_ids: splitList(claimRow.safe_claim_ids),
    safe_source_names: splitList(claimRow.safe_source_names),
    safe_source_ids: splitList(claimRow.safe_source_ids),
    safe_licenses: splitList(claimRow.safe_licenses),
    route_bucket: routeBucket(exportStatus),
    duplicate_key: `deuteronomy|${tokenIndexId}|${claimRow.normalized_form}|${exportStatus}`,
    duplicate_key_status: 'unique_expected',
    source_route_evidence: {
      source_artifact: paths.publicClaims,
      token_index_artifact: paths.tokenIndex,
      source_metadata_artifact: paths.source,
      evidence_level: 'row_level_claim_status_and_count',
      accepted_source_or_license: false,
    },
    downstream_boundary: exportStatus === 'safe_claims_min60' ? 'agent2_agent6_required_before_transform' : 'blocked_before_agent2_transform',
    exact_blockers: exactBlockers,
    mutation_allowed_here: false,
    public_emit_allowed_here: false,
    answer_eligible_now: false,
    definition_text_stored_now: false,
    accepted_text_now: false,
  };
}

function routeBucket(exportStatus) {
  if (exportStatus === 'safe_claims_min60') return 'agent2_agent6_boundary_candidate';
  if (exportStatus === 'claims_below_safe_min60') return 'confidence_below_safe_min60_blocker';
  if (exportStatus === 'unresolved') return 'missing_lexical_entry_blocker';
  return 'unknown_export_status_blocker';
}

function assertOutput(output) {
  const issues = [];
  if (output.counts.rows !== 8113) issues.push('expected 8113 rows');
  if (output.counts.occurrences !== 12595) issues.push('expected 12595 occurrences');
  if (output.counts.token_index_forms !== 8113) issues.push('expected 8113 token index forms');
  if (output.counts.joined_token_index_rows !== 8113) issues.push('expected complete token-index join');
  if (output.counts.safe_claim_rows !== 1334) issues.push('expected 1334 safe claim rows');
  if (output.counts.below_safe_min60_rows !== 1594) issues.push('expected 1594 below-threshold rows');
  if (output.counts.unresolved_rows !== 5185) issues.push('expected 5185 unresolved rows');
  if (output.counts.exact_blocker_rows !== 6779) issues.push('expected 6779 exact blocker rows');
  if (output.counts.exact_blocker_occurrences !== 9631) issues.push('expected 9631 exact blocker occurrences');
  if (output.counts.downstream_boundary_rows !== 1334) issues.push('expected 1334 downstream rows');
  if (output.counts.downstream_boundary_occurrences !== 2964) issues.push('expected 2964 downstream occurrences');
  if (output.counts.duplicate_key_collision_groups !== 0) issues.push('expected no duplicate-key collisions');
  for (const key of ['public_hud_rows', 'route_jsonl_rows', 'route_shard_writes', 'runtime_files_changed', 'source_files_changed', 'token_index_files_changed', 'lexical_payload_files_changed', 'definition_content_rows', 'nc_definition_content_rows', 'answer_rows', 'accepted_text_rows']) {
    if (output.counts[key] !== 0) issues.push(`expected zero ${key}`);
  }
  for (const row of output.rows) {
    if (row.mutation_allowed_here !== false || row.public_emit_allowed_here !== false || row.answer_eligible_now !== false || row.definition_text_stored_now !== false || row.accepted_text_now !== false) {
      issues.push(`row ${row.row_number} violates zero-authority boundary`);
      break;
    }
  }
  const serialized = JSON.stringify(output);
  for (const forbidden of ['safe_rendering_options', 'accepted_text_value', 'definition_payload']) {
    if (serialized.includes(`"${forbidden}"`)) issues.push(`forbidden payload field copied: ${forbidden}`);
  }
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exit(1);
  }
}

function writeMarkdown(file, output) {
  const lines = [
    '# Agent 3 Deuteronomy Linkage/Dedupe/Source-Route Matrix - 2026-06-04',
    '',
    `Status: ${output.status}.`,
    '',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model.',
    '',
    'Owner: Agent 3. Runnable by Spark-1 `019e92c1-89b1-7821-898b-2106638345cb` after contract intake.',
    '',
    'Boundary: no route publication support, no definition/answer selection, no usage-as-definition authority, no QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, and no public/runtime mutation.',
    '',
    '## Inputs',
    '',
    ...Object.values(output.inputs).map((input) => `- \`${input.path}\``),
    '',
    '## Counts',
    '',
    `- Rows: ${output.counts.rows}.`,
    `- Occurrences: ${output.counts.occurrences}.`,
    `- Token-index forms: ${output.counts.token_index_forms}.`,
    `- Token-index occurrences: ${output.counts.token_index_occurrences}.`,
    `- Occurrence units: ${output.counts.occurrence_units}.`,
    `- Source units: ${output.counts.source_units}.`,
    `- Manifest chunks: ${output.counts.manifest_chunks}.`,
    `- Joined token-index rows: ${output.counts.joined_token_index_rows}.`,
    `- Safe-claim rows: ${output.counts.safe_claim_rows} / occurrences ${output.counts.safe_claim_occurrences}.`,
    `- Below-threshold rows: ${output.counts.below_safe_min60_rows} / occurrences ${output.counts.below_safe_min60_occurrences}.`,
    `- Unresolved rows: ${output.counts.unresolved_rows} / occurrences ${output.counts.unresolved_occurrences}.`,
    `- Downstream-boundary rows: ${output.counts.downstream_boundary_rows} / occurrences ${output.counts.downstream_boundary_occurrences}.`,
    `- Exact blocker rows: ${output.counts.exact_blocker_rows} / occurrences ${output.counts.exact_blocker_occurrences}.`,
    `- Duplicate-key collision groups: ${output.counts.duplicate_key_collision_groups}.`,
    '',
    '## Duplicate Key Rule',
    '',
    output.duplicate_key_summary.duplicate_key_formula,
    '',
    '## Route Buckets',
    '',
    ...output.route_bucket_counts.map((bucket) => `- ${bucket.key}: ${bucket.rows} rows / ${bucket.occurrences} occurrences.`),
    '',
    '## Gates',
    '',
    ...output.gates.map((gateRow) => `- ${gateRow.id}: ${gateRow.status}; ${gateRow.detail}.`),
    '',
    '## Stop Condition',
    '',
    output.stop_condition,
    '',
    '## Remaining Blocked',
    '',
    ...output.what_remains_blocked.map((item) => `- ${item}`),
    '',
  ];
  fs.writeFileSync(abs(file), `${lines.join('\n')}\n`);
}

function parseCsv(text) {
  const rows = [];
  const records = [];
  let row = [];
  let value = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(value);
      value = '';
      if (row.some((cell) => cell.length > 0)) records.push(row);
      row = [];
    } else {
      value += char;
    }
  }
  if (value.length || row.length) {
    row.push(value);
    if (row.some((cell) => cell.length > 0)) records.push(row);
  }
  const headers = records.shift() || [];
  for (const record of records) {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = record[index] ?? '';
    });
    rows.push(object);
  }
  return rows;
}

function group(rows, key) {
  return Object.values(rows.reduce((acc, row) => {
    const groupKey = row[key] || 'none';
    acc[groupKey] ||= { key: groupKey, rows: 0, occurrences: 0 };
    acc[groupKey].rows += 1;
    acc[groupKey].occurrences += Number(row.occurrence_count || 0);
    return acc;
  }, {}));
}

function groupBlockers(rows) {
  const out = {};
  for (const row of rows) {
    for (const blocker of row.exact_blockers) {
      out[blocker] ||= { rows: 0, occurrences: 0 };
      out[blocker].rows += 1;
      out[blocker].occurrences += Number(row.occurrence_count || 0);
    }
  }
  return out;
}

function groupBy(rows, keyFn) {
  return Object.values(rows.reduce((acc, row) => {
    const key = keyFn(row);
    acc[key] ||= { key, rows: 0 };
    acc[key].rows += 1;
    return acc;
  }, {}));
}

function gate(id, passed, detail) {
  return { id, status: passed ? 'passed' : 'failed', detail };
}

function splitList(value) {
  return String(value || '').split(/[|;]/).map((item) => item.trim()).filter(Boolean);
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formKey(surface, normalized) {
  return `${surface || ''}\u0000${normalized || ''}`;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function withHash(file) {
  return { path: file, sha256: sha(file) };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(abs(file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
}

function abs(file) {
  return path.join(root, file);
}
