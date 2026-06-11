import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  artifact: 'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json',
  result: 'reports/agent1-wartime-public-hud-source-row-evidence-validator-result-2026-06-03.json'
};

const EXPECTED_SURFACES = [
  'deuteronomy',
  'exodus',
  'genesis',
  'leviticus',
  'numbers'
].sort((a, b) => a.localeCompare(b));

const REQUIRED_MUST_NOT_ACCEPT = [
  'source/provenance custody',
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
].sort((a, b) => a.localeCompare(b));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
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
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} mismatch`, { actual, expected });
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  for (const key of [
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
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function assertEndpoint(surface, key, endpoint) {
  assert(endpoint?.ok === true, `${surface.work_id} ${key} endpoint must be ok`, endpoint);
  assert(endpoint.status === 200, `${surface.work_id} ${key} endpoint must be HTTP 200`, endpoint);
  assert(endpoint.bytes > 0, `${surface.work_id} ${key} endpoint must have bytes`, endpoint);
  assert(/^[a-f0-9]{64}$/u.test(endpoint.sha256 || ''), `${surface.work_id} ${key} sha256 must be hex`, endpoint);
  assert(endpoint.json_parse_ok === true, `${surface.work_id} ${key} JSON must parse`, endpoint);
}

function main() {
  const startedAt = new Date().toISOString();
  const artifact = readJson(PATHS.artifact);

  assert(artifact.artifact_type === 'agent1_wartime_public_hud_source_row_evidence', 'unexpected artifact type');
  assertBoundary(artifact.boundary);
  sameSet(sorted(artifact.must_not_accept || []), REQUIRED_MUST_NOT_ACCEPT, 'must-not-accept list');

  const surfaces = artifact.surfaces || [];
  assert(surfaces.length === 5, 'expected five candidate surfaces');
  sameSet(sorted(surfaces.map((surface) => surface.work_id)), EXPECTED_SURFACES, 'surface set');

  let endpointCount = 0;
  let endpointOkCount = 0;
  let routeCardCount = 0;
  let sourceRowCount = 0;
  let missingFieldCount = 0;

  for (const surface of surfaces) {
    for (const [key, endpoint] of Object.entries(surface.live_public_hud_json_status || {})) {
      endpointCount += 1;
      if (endpoint.ok) endpointOkCount += 1;
      assertEndpoint(surface, key, endpoint);
    }
    assert(endpointCount > 0, 'endpoint count must advance');
    assert(surface.route_shard?.path === `data/public-hud/${surface.work_id}/route-lookup/shards/${surface.route_shard.shard}.json`, 'route shard path must match shard value', {
      surface: surface.work_id,
      route_shard: surface.route_shard
    });
    assert(surface.route_card_count_extracted === surface.route_shard.card_count, `${surface.work_id} extracted card count must match shard card count`, {
      extracted: surface.route_card_count_extracted,
      shard: surface.route_shard.card_count
    });
    assert(surface.route_card_count_extracted > 0, `${surface.work_id} must have route cards`);
    assert(surface.source_row_count_extracted > 0, `${surface.work_id} must have source rows`);
    assert(surface.missing_source_row_field_count === 0, `${surface.work_id} must have no missing source/license fields`);
    assert(Array.isArray(surface.unique_licenses) && surface.unique_licenses.length > 0, `${surface.work_id} must have licenses`);
    assert(surface.unique_licenses.includes('CC BY-SA 4.0 / GFDL'), `${surface.work_id} must include Kaikki/Wiktextract license row`);
    assert(surface.reader_hints?.not_translation === true, `${surface.work_id} reader hints must be marked not_translation`);
    assert(surface.reader_hints?.not_accepted_gloss === true, `${surface.work_id} reader hints must be marked not_accepted_gloss`);
    assert(surface.reader_hints?.not_definition_truth === true, `${surface.work_id} reader hints must be marked not_definition_truth`);

    routeCardCount += surface.route_card_count_extracted;
    sourceRowCount += surface.source_row_count_extracted;
    missingFieldCount += surface.missing_source_row_field_count;
  }

  assert(endpointCount === artifact.summary.endpoint_count, 'endpoint summary count mismatch', { endpointCount, summary: artifact.summary.endpoint_count });
  assert(endpointOkCount === artifact.summary.endpoint_ok_count, 'endpoint OK summary count mismatch', { endpointOkCount, summary: artifact.summary.endpoint_ok_count });
  assert(routeCardCount === artifact.summary.route_card_count_extracted, 'route-card summary count mismatch', { routeCardCount, summary: artifact.summary.route_card_count_extracted });
  assert(sourceRowCount === artifact.summary.source_row_count_extracted, 'source-row summary count mismatch', { sourceRowCount, summary: artifact.summary.source_row_count_extracted });
  assert(missingFieldCount === artifact.summary.missing_source_row_field_count, 'missing-field summary count mismatch', { missingFieldCount, summary: artifact.summary.missing_source_row_field_count });
  assert(artifact.summary.source_row_count_extracted === (artifact.all_source_rows || []).length, 'all_source_rows length mismatch');
  assert(artifact.summary.missing_source_row_field_count === 0, 'no source/license row fields may be missing');

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_artifact: PATHS.artifact,
    summary: artifact.summary,
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
    details: error.details || null
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
