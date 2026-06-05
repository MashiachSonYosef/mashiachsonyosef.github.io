#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  candidateUsePackage: 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  exactSubsetManifest: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  exactSubsetVerdict: 'reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json',
  exactSubsetConsumption: 'reports/agent10-agent6-old-dictionary-exact-row-subset-manifest-verdict-consumption-2026-06-05.json',
  output: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const candidateUsePackage = readJson(options.candidateUsePackage);
const exactSubsetManifest = readJson(options.exactSubsetManifest);
const exactSubsetVerdict = readJson(options.exactSubsetVerdict);
const exactSubsetConsumption = readJson(options.exactSubsetConsumption);

assertArtifact(candidateUsePackage, 'agent2_old_dictionary_morphology_candidate_use_package', options.candidateUsePackage);
assertArtifact(exactSubsetManifest, 'agent1_old_dictionary_exact_row_subset_manifest', options.exactSubsetManifest);
assertArtifact(
  exactSubsetConsumption,
  'agent10_agent6_old_dictionary_exact_row_subset_manifest_verdict_consumption',
  options.exactSubsetConsumption,
);

const verdictByBucketId = new Map(
  (exactSubsetVerdict.subset_dispositions || []).map((row) => [row.bucket_id, row]),
);
const subsetByTokenId = buildSubsetByTokenId(exactSubsetManifest.subset_manifests || []);
const candidateRows = (candidateUsePackage.rows || []).map((row) => buildCandidateRow(row));
const subsetRows = buildSubsetRows(candidateRows, exactSubsetManifest.subset_manifests || []);
const rowsMatchedToManifest = candidateRows.filter((row) => row.exact_subset_status === 'matched_exact_subset_manifest');
const rowsInNcOverlap = candidateRows.filter((row) =>
  row.classification_lanes.includes('noncommercial_educational_candidate'),
);
const rowsInBlockedOverlap = candidateRows.filter((row) =>
  row.classification_lanes.includes('blocked_or_needs_review'),
);
const rowsInNcAndBlockedOverlap = candidateRows.filter(
  (row) =>
    row.classification_lanes.includes('noncommercial_educational_candidate') &&
    row.classification_lanes.includes('blocked_or_needs_review'),
);
const pureCommercialRows = candidateRows.filter(
  (row) =>
    row.classification_lanes.length === 1 &&
    row.classification_lanes[0] === 'commercial_clean_candidate',
);

const counts = {
  candidate_use_rows: candidateRows.length,
  candidate_use_occurrences: sum(candidateRows, (row) => row.occurrences),
  exact_subset_manifest_rows: Number(exactSubsetManifest.manifest_counts?.subset_count || 0),
  exact_subset_manifest_total_rows: Number(exactSubsetManifest.manifest_counts?.audited_rows || 0),
  exact_subset_manifest_total_occurrences: Number(exactSubsetManifest.manifest_counts?.audited_occurrences || 0),
  candidate_rows_matched_to_manifest: rowsMatchedToManifest.length,
  candidate_rows_missing_manifest_subset: candidateRows.length - rowsMatchedToManifest.length,
  candidate_subset_rows_with_candidates: subsetRows.filter((row) => row.candidate_rows > 0).length,
  candidate_subset_rows_without_candidates: subsetRows.filter((row) => row.candidate_rows === 0).length,
  candidate_rows_commercial_clean_only: pureCommercialRows.length,
  candidate_occurrences_commercial_clean_only: sum(pureCommercialRows, (row) => row.occurrences),
  candidate_rows_with_nc_overlap: rowsInNcOverlap.length,
  candidate_occurrences_with_nc_overlap: sum(rowsInNcOverlap, (row) => row.occurrences),
  candidate_rows_with_blocked_overlap: rowsInBlockedOverlap.length,
  candidate_occurrences_with_blocked_overlap: sum(rowsInBlockedOverlap, (row) => row.occurrences),
  candidate_rows_with_nc_and_blocked_overlap: rowsInNcAndBlockedOverlap.length,
  candidate_occurrences_with_nc_and_blocked_overlap: sum(rowsInNcAndBlockedOverlap, (row) => row.occurrences),
  unique_queue_ids: new Set(candidateRows.map((row) => row.queue_id)).size,
  duplicate_queue_ids: duplicateValues(candidateRows.map((row) => row.queue_id)).length,
  unique_token_ids: new Set(candidateRows.map((row) => row.token_id)).size,
  duplicate_token_ids: duplicateValues(candidateRows.map((row) => row.token_id)).length,
  agent6_verdict_subset_rows: Number(exactSubsetVerdict.independent_recount?.subset_manifests || 0),
  agent6_verdict_rows_sum: Number(exactSubsetVerdict.independent_recount?.rows_sum || 0),
  agent6_verdict_occurrences_sum: Number(exactSubsetVerdict.independent_recount?.occurrences_sum || 0),
  agent10_consumption_subset_rows: Number(exactSubsetConsumption.independent_recount?.subset_manifests || 0),
  agent10_consumption_rows_sum: Number(exactSubsetConsumption.independent_recount?.rows_sum || 0),
  agent10_consumption_occurrences_sum: Number(exactSubsetConsumption.independent_recount?.occurrences_sum || 0),
  candidate_text_rows: Number(candidateUsePackage.counts?.candidate_text_rows || 0),
  definition_content_rows: Number(candidateUsePackage.counts?.definition_content_rows || 0),
  lemma_content_rows: Number(candidateUsePackage.counts?.lemma_content_rows || 0),
  reader_hint_content_rows: Number(candidateUsePackage.counts?.reader_hint_content_rows || 0),
  answer_rows: Number(candidateUsePackage.counts?.answer_rows || 0),
  answer_eligible_rows: Number(candidateUsePackage.counts?.answer_eligible_rows || 0),
  route_jsonl_rows: Number(candidateUsePackage.counts?.route_jsonl_rows || 0),
  route_shard_writes: Number(candidateUsePackage.counts?.route_shard_writes || 0),
  public_runtime_mutation: Number(candidateUsePackage.counts?.public_runtime_mutation || 0),
  source_text_rows: 0,
  accepted_text_rows: 0,
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_exact_subset_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'exact row-subset crossmatch for old-dictionary candidate-use planning rows',
  inputs: {
    candidate_use_package: options.candidateUsePackage,
    exact_subset_manifest: options.exactSubsetManifest,
    exact_subset_verdict: options.exactSubsetVerdict,
    exact_subset_consumption: options.exactSubsetConsumption,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    exact_subset_membership_only: true,
    candidate_use_planning_evidence_only: true,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    lemma_content_storage: false,
    reader_hint_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    answer_eligibility: false,
    route_ranking: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  counts,
  subset_rows: subsetRows,
  candidate_rows: candidateRows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    agent6_exact_subset_disposition: exactSubsetVerdict.disposition || '',
    exact_blockers_preserved: exactSubsetVerdict.warnings || [],
    stop_condition:
      'Use this exact-subset crossmatch as membership/navigation evidence only. Do not transform, emit candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this matrix.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 exact-subset crossmatch candidate_rows=${counts.candidate_use_rows} matched=${counts.candidate_rows_matched_to_manifest} pure_clean=${counts.candidate_rows_commercial_clean_only} nc_overlap=${counts.candidate_rows_with_nc_overlap} blocked_overlap=${counts.candidate_rows_with_blocked_overlap}`,
);

function buildCandidateRow(row) {
  const subset = subsetByTokenId.get(row.token_id) || null;
  return {
    row_id: `agent3-candidate-use-exact-subset-${row.queue_id}`,
    queue_id: row.queue_id || '',
    token_id: row.token_id || '',
    lexicon_entry_id: row.lexicon_entry_id || null,
    occurrences: Number(row.occurrences || 0),
    license_lane: row.license_lane || '',
    exact_subset_status: subset ? 'matched_exact_subset_manifest' : 'missing_exact_subset_manifest',
    row_subset_id: subset?.row_subset_id || null,
    bucket_id: subset?.bucket_id || null,
    classification_lanes: subset?.classification_lanes || [],
    exact_blocker: subset?.exact_blocker || null,
    agent6_subset_disposition: subset?.agent6_disposition || null,
    evidence_role: 'exact_subset_membership_navigation_only',
    downstream_transform_status:
      'blocked_pending_exact_agent1_agent6_boundary_fields_no_text_or_route_output',
    dedupe_key: sha256([row.queue_id || '', row.token_id || '', subset?.row_subset_id || 'missing'].join('|')),
  };
}

function buildSubsetRows(candidateRows, subsetManifests) {
  return subsetManifests.map((subset) => {
    const bucketId = bucketIdFromSubsetId(subset.row_subset_id || '');
    const verdict = verdictByBucketId.get(bucketId) || null;
    const rows = candidateRows.filter((row) => row.row_subset_id === subset.row_subset_id);
    return {
      row_id: `agent3-candidate-use-exact-subset-${bucketId}`,
      row_subset_id: subset.row_subset_id || '',
      bucket_id: bucketId,
      classification_lanes: subset.classification_lanes || [],
      manifest_rows: Number((subset.token_ids || []).length),
      manifest_occurrences: Number(subset.occurrences || 0),
      candidate_rows: rows.length,
      candidate_occurrences: sum(rows, (row) => row.occurrences),
      agent6_disposition: verdict?.disposition || '',
      blocker_preserved: verdict?.blocker_preserved || subset.exact_blocker || '',
      queue_id_sample: rows.slice(0, 12).map((row) => row.queue_id),
      token_id_sample: rows.slice(0, 12).map((row) => row.token_id),
      status:
        rows.length > 0
          ? 'exact_blocker_subset_boundary_preserved_for_candidate_rows'
          : 'audit_only_no_candidate_rows_in_subset',
      dedupe_key: sha256([subset.row_subset_id || '', rows.length, sum(rows, (row) => row.occurrences)].join('|')),
    };
  });
}

function buildSubsetByTokenId(subsetManifests) {
  const map = new Map();
  for (const subset of subsetManifests) {
    const rowSubsetId = subset.row_subset_id || '';
    const bucketId = bucketIdFromSubsetId(rowSubsetId);
    const verdict = verdictByBucketId.get(bucketId) || null;
    for (const tokenId of subset.token_ids || []) {
      map.set(tokenId, {
        row_subset_id: rowSubsetId,
        bucket_id: bucketId,
        classification_lanes: subset.classification_lanes || [],
        exact_blocker: subset.exact_blocker || verdict?.blocker_preserved || '',
        agent6_disposition: verdict?.disposition || '',
      });
    }
  }
  return map;
}

function bucketIdFromSubsetId(rowSubsetId) {
  return rowSubsetId
    .replace(/^old-dictionary-excluded-row-license-lane-reaudit::row-subset::/, '')
    .replaceAll('-', '_')
    .replace('commercial_clean_plus_nc_plus_blocked_review', 'commercial_clean_plus_noncommercial_educational_plus_blocked_review')
    .replace('commercial_clean_plus_nc', 'commercial_clean_plus_noncommercial_educational')
    .replace('metadata_or_link_only', 'metadata_or_link_only');
}

function countForbiddenPayloadKeys(value) {
  const forbidden = new Set([
    'surface',
    'normalized',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'candidate_text',
    'definition_text',
    'source_text',
    'accepted_text',
    'display_text',
    'route_payload',
    'public_domain_headwords',
  ]);
  let count = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) count += 1;
  });
  return count;
}

function assertArtifact(value, expected, filePath) {
  if (value.artifact_type !== expected) {
    throw new Error(`${filePath} artifact_type ${value.artifact_type || 'missing'} !== ${expected}`);
  }
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function sum(values, callback) {
  return values.reduce((total, value) => total + Number(callback(value) || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function writeMarkdown(relativePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Exact-Subset Crossmatch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${options.output}\``,
    `- Status: \`${data.status}\``,
    `- Candidate rows / occurrences: ${data.counts.candidate_use_rows} / ${data.counts.candidate_use_occurrences}`,
    `- Matched to exact subset manifest: ${data.counts.candidate_rows_matched_to_manifest}`,
    `- Commercial-clean only rows: ${data.counts.candidate_rows_commercial_clean_only}`,
    `- Rows with NC overlap / blocked overlap / both: ${data.counts.candidate_rows_with_nc_overlap} / ${data.counts.candidate_rows_with_blocked_overlap} / ${data.counts.candidate_rows_with_nc_and_blocked_overlap}`,
    '',
    '## Exact Subsets',
    '',
    '| subset | lanes | manifest rows | candidate rows | candidate occurrences | status |',
    '|---|---|---:|---:|---:|---|',
    ...data.subset_rows.map(
      (row) =>
        `| ${mdCell(row.bucket_id)} | ${mdCell(row.classification_lanes.join(', '))} | ${row.manifest_rows} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${mdCell(row.status)} |`,
    ),
    '',
    '## Boundary',
    '',
    '- Exact subset membership/navigation evidence only.',
    '- Overlap counts are warnings for downstream boundary routing, not transform permission.',
    '- This matrix does not emit source text, candidate text, definitions, lemma content, reader hints, accepted text, answer rows, route writes, public/runtime changes, commercial export, or release actions.',
    '',
    '## Stop Condition',
    '',
    data.downstream_handoff.stop_condition,
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--candidate-use-package=')) parsed.candidateUsePackage = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--exact-subset-manifest=')) parsed.exactSubsetManifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--exact-subset-verdict=')) parsed.exactSubsetVerdict = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--exact-subset-consumption=')) parsed.exactSubsetConsumption = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
