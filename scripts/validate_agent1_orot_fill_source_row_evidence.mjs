#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  artifact: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  result: 'reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json'
};

const EXPECTED_TARGETS = [
  'lex-aph-h639',
  'lex-mashiach-h4899',
  'lex-ruach-h7307',
  'lex-yhwh-h3068'
];

const EXPECTED_INCOMPLETE_ROWS = [
  'curated|lex-aph-h639|source metadata incomplete',
  'curated|lex-mashiach-h4899|source metadata incomplete',
  'curated|lex-ruach-h7307|source metadata incomplete',
  'curated|lex-yhwh-h3068|source metadata incomplete'
];

const EXPECTED_MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function assertCleanRow(row, target) {
  assert(row.complete === true, `${target.entry_id} source-layer row must be complete`, row);
  assert(row.source_family === target.expected_clean_source_family, `${target.entry_id} source-layer row family mismatch`, row);
  assert(String(row.source_id || '').startsWith(target.expected_clean_source_id_prefix), `${target.entry_id} source-layer row id prefix mismatch`, row);
  assert(row.source_url, `${target.entry_id} source-layer row missing source_url`, row);
  assert(row.license, `${target.entry_id} source-layer row missing license`, row);
  assert(row.license_url, `${target.entry_id} source-layer row missing license_url`, row);
}

function main() {
  const startedAt = new Date().toISOString();
  const artifact = readJson(PATHS.artifact);

  assert(artifact.artifact_type === 'agent1_orot_fill_source_row_evidence', 'unexpected artifact type');
  assert(['block', 'pipeline_source_rows_clear'].includes(artifact.status), 'artifact status must be a known source-row evidence state');
  assertBoundary(artifact.boundary);
  sameSet(artifact.must_not_accept, EXPECTED_MUST_NOT_ACCEPT, 'must-not-accept terms');

  const targets = artifact.targets || [];
  sameSet(targets.map((target) => target.entry_id), EXPECTED_TARGETS, 'target IDs');
  assert(artifact.summary.target_count === 4, 'expected four targets');
  assert(artifact.summary.chunk_entry_count === targets.reduce((sum, target) => sum + target.chunk_entry_count, 0), 'chunk entry summary mismatch');
  assert(artifact.summary.token_occurrence_count === targets.reduce((sum, target) => sum + target.token_occurrence_count, 0), 'token occurrence summary mismatch');
  assert(artifact.summary.targets_with_expected_clean_source_layer_row === 4, 'all four targets must have exact clean source-layer rows available');
  assert(artifact.summary.route_lookup_shard_hit_count === 0, 'target IDs/source rows must not be present in route lookup shards');
  assert((artifact.route_lookup_hits || []).length === 0, 'route lookup hits must be empty');

  if (artifact.status === 'block') {
    sameSet(artifact.blocker?.blocking_rows, artifact.targets
      .filter((target) => target.exact_incomplete_curated_row_present)
      .map((target) => target.incomplete_curated_row_id), 'blocking rows');
    assert(artifact.summary.incomplete_curated_rows_attached > 0, 'block state must have remaining incomplete curated rows');
    assert(artifact.blocker?.blocking_rows?.length === artifact.summary.incomplete_curated_rows_attached, 'blocker rows must match remaining incomplete rows');
  } else {
    assert(artifact.summary.incomplete_curated_rows_attached === 0, 'clear state must have zero incomplete curated rows attached');
    assert(artifact.summary.targets_missing_clean_chunk_attachment === 0, 'clear state must have clean chunk attachment for all targets');
    assert(artifact.source_row_disposition?.status === 'pipeline_source_rows_clear', 'clear state must include source-row disposition');
    assert((artifact.source_row_disposition?.remaining_blocking_rows || []).length === 0, 'clear state must have no remaining blocking rows');
    assert(artifact.blocker === null, 'clear state must not carry an active blocker');
  }

  for (const target of targets) {
    assert(target.chunk_entry_count > 0, `${target.entry_id} must be present in Orot chunks`);
    assert(target.token_occurrence_count > 0, `${target.entry_id} must have Orot token occurrences`);
    assert(target.expected_clean_source_layer_row_count > 0, `${target.entry_id} must have clean source-layer rows available`);
    if (artifact.status === 'block') {
      assert(target.status === 'block' || target.status === 'pipeline_source_rows_clear', `${target.entry_id} target status must be known`);
    } else {
      assert(target.status === 'pipeline_source_rows_clear', `${target.entry_id} status must be clear`);
      assert(target.exact_incomplete_curated_row_present === false, `${target.entry_id} incomplete curated row must be absent`);
      assert((target.incomplete_chunk_source_row_ids || []).length === 0, `${target.entry_id} incomplete row list must be empty`);
      assert((target.complete_primary_source_row_ids || []).length + (target.complete_secondary_source_row_ids || []).length > 0, `${target.entry_id} must have complete chunk source rows`);
      assert(target.chunk_clean_attachment_status === 'clean_source_row_attached_no_incomplete_curated_row', `${target.entry_id} unexpected clear attachment status`);
    }
    for (const row of target.expected_clean_source_layer_rows || []) {
      assertCleanRow(row, target);
    }
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_artifact: PATHS.artifact,
    status: artifact.status,
    summary: artifact.summary,
    source_row_disposition: artifact.source_row_disposition || null,
    blocker: artifact.blocker,
    boundary: artifact.boundary
  };
  writeJson(PATHS.result, result);
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
    boundary: {
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
