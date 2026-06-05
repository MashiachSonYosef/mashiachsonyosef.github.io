#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  candidateUsePackage: 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  exactSubsetCrossmatch: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
  sourceFamilyBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
  sourceRidContinuityCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
  commercialCleanBoundaryPacket:
    'reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json',
  output: 'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const candidateUsePackage = readJson(options.candidateUsePackage);
const exactSubsetCrossmatch = readJson(options.exactSubsetCrossmatch);
const sourceFamilyBlockerMatrix = readJson(options.sourceFamilyBlockerMatrix);
const sourceRidContinuityCrossmatch = readJson(options.sourceRidContinuityCrossmatch);
const commercialCleanBoundaryPacket = readJson(options.commercialCleanBoundaryPacket);

assertArtifact(candidateUsePackage, 'agent2_old_dictionary_morphology_candidate_use_package', options.candidateUsePackage);
assertArtifact(
  exactSubsetCrossmatch,
  'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  options.exactSubsetCrossmatch,
);
assertArtifact(
  sourceFamilyBlockerMatrix,
  'agent3_old_dictionary_candidate_use_source_family_blocker_matrix',
  options.sourceFamilyBlockerMatrix,
);
assertArtifact(
  sourceRidContinuityCrossmatch,
  'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  options.sourceRidContinuityCrossmatch,
);
assertArtifact(
  commercialCleanBoundaryPacket,
  'agent10_agent6_ready_old_dictionary_commercial_clean_transform_enablement_boundary_packet',
  options.commercialCleanBoundaryPacket,
);

const exactByQueueId = new Map((exactSubsetCrossmatch.candidate_rows || []).map((row) => [row.queue_id, row]));
const ridByQueueId = new Map(
  (sourceRidContinuityCrossmatch.candidate_rows || []).map((row) => [row.queue_id, row]),
);
const familyBlockerByFamily = new Map(
  (sourceFamilyBlockerMatrix.source_family_rows || []).map((row) => [row.source_family, row.blocker_link || null]),
);
const commercialBoundaryByFamily = new Map(
  (commercialCleanBoundaryPacket.commercial_clean_scope?.subsets || []).map((row) => [
    row.source_family,
    {
      row_subset_id: row.row_subset_id || '',
      source_family: row.source_family || '',
      license_lane: row.license_lane || '',
      rows: Number(row.rows || 0),
      occurrences: Number(row.occurrences || 0),
      agent2_transform_allowed_now: Boolean(row.agent2_transform_allowed_now),
      answer_eligible: Boolean(row.answer_eligible),
      public_emit: Boolean(row.public_emit),
    },
  ]),
);

const candidateRows = (candidateUsePackage.rows || []).map((candidate) => buildCandidateRow(candidate));
const pureCommercialRows = candidateRows.filter((row) => row.triage_group === 'commercial_clean_only');
const overlapRows = candidateRows.filter((row) => row.triage_group !== 'commercial_clean_only');
const ncOverlapRows = candidateRows.filter((row) =>
  row.classification_lanes.includes('noncommercial_educational_candidate'),
);
const blockedOverlapRows = candidateRows.filter((row) =>
  row.classification_lanes.includes('blocked_or_needs_review'),
);
const tripleOverlapRows = candidateRows.filter(
  (row) =>
    row.classification_lanes.includes('noncommercial_educational_candidate') &&
    row.classification_lanes.includes('blocked_or_needs_review'),
);

const sourceFamilySetRows = buildSourceFamilySetRows(candidateRows);
const bucketSourceFamilySetRows = buildBucketSourceFamilySetRows(candidateRows);
const triageRows = buildTriageRows(candidateRows);
const pureCommercialRowsWithMetadata = pureCommercialRows.filter((row) => row.agent1_metadata_status === 'present');
const missingExactRows = candidateRows.filter((row) => row.exact_subset_status !== 'matched_exact_subset_manifest');
const missingRidRows = candidateRows.filter((row) => row.source_rid_status !== 'agent1_metadata_row_present');
const missingBoundaryFamilyRows = candidateRows.filter((row) => row.missing_boundary_family_count > 0);

const counts = {
  candidate_use_rows: candidateRows.length,
  candidate_use_occurrences: sum(candidateRows, (row) => row.occurrences),
  candidate_rows_matched_to_exact_subset: candidateRows.length - missingExactRows.length,
  candidate_rows_missing_exact_subset: missingExactRows.length,
  candidate_rows_with_agent1_rid_metadata: pureNumber(
    sourceRidContinuityCrossmatch.counts?.rows_with_agent1_citation_metadata,
  ),
  candidate_rows_missing_agent1_rid_metadata: pureNumber(
    sourceRidContinuityCrossmatch.counts?.rows_missing_agent1_citation_metadata,
  ),
  source_rid_references: pureNumber(sourceRidContinuityCrossmatch.counts?.source_rid_references),
  unique_source_rids: pureNumber(sourceRidContinuityCrossmatch.counts?.unique_source_rids),
  source_family_set_rows: sourceFamilySetRows.length,
  bucket_source_family_set_rows: bucketSourceFamilySetRows.length,
  triage_rows: triageRows.length,
  pure_commercial_clean_rows: pureCommercialRows.length,
  pure_commercial_clean_occurrences: sum(pureCommercialRows, (row) => row.occurrences),
  pure_commercial_clean_rows_with_agent1_rid_metadata: pureCommercialRowsWithMetadata.length,
  pure_commercial_clean_source_rid_references: sum(pureCommercialRows, (row) => row.source_rid_count),
  pure_commercial_clean_unique_source_rids: new Set(pureCommercialRows.flatMap((row) => row.source_rids)).size,
  overlap_rows: overlapRows.length,
  overlap_occurrences: sum(overlapRows, (row) => row.occurrences),
  nc_overlap_rows: ncOverlapRows.length,
  nc_overlap_occurrences: sum(ncOverlapRows, (row) => row.occurrences),
  blocked_overlap_rows: blockedOverlapRows.length,
  blocked_overlap_occurrences: sum(blockedOverlapRows, (row) => row.occurrences),
  triple_overlap_rows: tripleOverlapRows.length,
  triple_overlap_occurrences: sum(tripleOverlapRows, (row) => row.occurrences),
  rows_with_missing_family_boundary_links: missingBoundaryFamilyRows.length,
  rows_missing_source_rid_metadata: missingRidRows.length,
  unique_queue_ids: new Set(candidateRows.map((row) => row.queue_id)).size,
  duplicate_queue_ids: duplicateValues(candidateRows.map((row) => row.queue_id)).length,
  unique_token_ids: new Set(candidateRows.map((row) => row.token_id)).size,
  duplicate_token_ids: duplicateValues(candidateRows.map((row) => row.token_id)).length,
  agent10_commercial_clean_source_family_subsets: pureNumber(
    commercialCleanBoundaryPacket.commercial_clean_scope?.source_family_count,
  ),
  agent10_commercial_clean_source_family_hit_rows: pureNumber(
    commercialCleanBoundaryPacket.commercial_clean_scope?.row_count,
  ),
  agent10_commercial_clean_source_family_hit_occurrences: pureNumber(
    commercialCleanBoundaryPacket.commercial_clean_scope?.occurrence_count,
  ),
  agent2_may_author_nonpublic_transform_candidate_package:
    commercialCleanBoundaryPacket.allowed_if_warn_accepted?.agent2_may_author_nonpublic_transform_candidate_package ===
    true
      ? 1
      : 0,
  exact_agent6_boundary_required:
    commercialCleanBoundaryPacket.allowed_if_warn_accepted?.exact_agent6_row_subset_boundary_required_for_any_later_transform_authoring ===
    true
      ? 1
      : 0,
  approved_morphology_relation_required:
    commercialCleanBoundaryPacket.allowed_if_warn_accepted?.approved_morphology_relation_required_for_any_later_transform_authoring ===
    true
      ? 1
      : 0,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_rows: 0,
  answer_eligible_rows: 0,
  route_jsonl_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_boundary_triage_navigation.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'candidate-use boundary triage navigation joining exact-subset membership, source-family blockers, and source-RID continuity',
  inputs: {
    candidate_use_package: options.candidateUsePackage,
    exact_subset_crossmatch: options.exactSubsetCrossmatch,
    source_family_blocker_matrix: options.sourceFamilyBlockerMatrix,
    source_rid_continuity_crossmatch: options.sourceRidContinuityCrossmatch,
    commercial_clean_boundary_packet: options.commercialCleanBoundaryPacket,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    boundary_triage_only: true,
    candidate_use_planning_evidence_only: true,
    exact_subset_membership_only: true,
    source_rid_identifier_continuity_only: true,
    source_family_blocker_navigation_only: true,
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
  triage_rows: triageRows,
  source_family_set_rows: sourceFamilySetRows,
  bucket_source_family_set_rows: bucketSourceFamilySetRows,
  candidate_rows: candidateRows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_blockers_preserved: [
      'commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation',
      'commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary',
      'commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary',
      'triple_overlap_missing_agent6_source_family_selection_boundary',
    ],
    stop_condition:
      'Use this matrix as linkage/navigation triage only. It separates pure commercial-clean candidate-use rows from NC/blocked overlap rows, but it does not authorize transform, route publication, source/license acceptance, answer eligibility, definition text, accepted text, public/runtime mutation, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 boundary triage navigation candidate_rows=${counts.candidate_use_rows} pure_clean=${counts.pure_commercial_clean_rows} overlap=${counts.overlap_rows} bucket_family_sets=${counts.bucket_source_family_set_rows}`,
);

function buildCandidateRow(candidate) {
  const exact = exactByQueueId.get(candidate.queue_id);
  const rid = ridByQueueId.get(candidate.queue_id);
  if (!exact) throw new Error(`Missing exact-subset row for ${candidate.queue_id}`);
  if (!rid) throw new Error(`Missing source-RID row for ${candidate.queue_id}`);

  const classificationLanes = exact.classification_lanes || [];
  const sourceFamilies = rid.source_families || candidate.source_family || [];
  const familyBoundaryLinks = sourceFamilies.map((family) => ({
    source_family: family,
    source_family_blocker_link: familyBlockerByFamily.get(family) || null,
    agent10_boundary_subset: commercialBoundaryByFamily.get(family) || null,
  }));
  const missingBoundaryFamilyCount = familyBoundaryLinks.filter(
    (row) => !row.source_family_blocker_link || !row.agent10_boundary_subset,
  ).length;
  const triageGroup = buildTriageGroup(classificationLanes);
  return {
    row_id: `agent3-candidate-use-boundary-triage-${candidate.queue_id}`,
    queue_id: candidate.queue_id || '',
    token_id: candidate.token_id || '',
    lexicon_entry_id: candidate.lexicon_entry_id || null,
    occurrences: Number(candidate.occurrences || 0),
    license_lane: candidate.license_lane || '',
    exact_subset_status: exact.exact_subset_status || '',
    row_subset_id: exact.row_subset_id || null,
    bucket_id: exact.bucket_id || null,
    classification_lanes: classificationLanes,
    exact_blocker: exact.exact_blocker || null,
    source_families: sourceFamilies,
    source_family_set_key: sourceFamilies.join(' | '),
    source_family_boundary_links: familyBoundaryLinks,
    missing_boundary_family_count: missingBoundaryFamilyCount,
    source_rids: rid.source_rids || [],
    source_rid_count: Number(rid.source_rid_count || 0),
    unique_source_rid_count: Number(rid.unique_source_rid_count || 0),
    source_rid_prefixes: rid.source_rid_prefixes || [],
    source_rid_status: rid.citation_metadata_status || '',
    agent1_metadata_status: rid.citation_metadata_status === 'agent1_metadata_row_present' ? 'present' : 'missing',
    all_source_rids_in_agent1_metadata: Boolean(rid.all_source_rids_in_agent1_metadata),
    triage_group: triageGroup,
    triage_status: buildTriageStatus(triageGroup),
    evidence_role:
      'candidate_use_boundary_navigation_only_exact_subset_source_family_source_rid_join_no_text_payload',
    downstream_transform_status: buildDownstreamStatus(triageGroup),
    dedupe_key: sha256(
      [
        candidate.queue_id || '',
        candidate.token_id || '',
        exact.row_subset_id || '',
        sourceFamilies.join('|'),
        (rid.source_rids || []).join('|'),
      ].join('||'),
    ),
  };
}

function buildTriageGroup(classificationLanes) {
  const hasNc = classificationLanes.includes('noncommercial_educational_candidate');
  const hasBlocked = classificationLanes.includes('blocked_or_needs_review');
  if (hasNc && hasBlocked) return 'commercial_clean_nc_blocked_overlap';
  if (hasNc) return 'commercial_clean_nc_overlap';
  if (hasBlocked) return 'commercial_clean_blocked_overlap';
  return 'commercial_clean_only';
}

function buildTriageStatus(triageGroup) {
  if (triageGroup === 'commercial_clean_only') {
    return 'commercial_clean_only_boundary_candidate_not_transform_authority';
  }
  if (triageGroup === 'commercial_clean_nc_overlap') {
    return 'nc_overlap_requires_agent6_source_family_selection_boundary';
  }
  if (triageGroup === 'commercial_clean_blocked_overlap') {
    return 'blocked_review_overlap_requires_agent6_source_family_selection_boundary';
  }
  return 'nc_and_blocked_overlap_requires_agent6_source_family_selection_boundary';
}

function buildDownstreamStatus(triageGroup) {
  if (triageGroup === 'commercial_clean_only') {
    return 'not_transform_ready_missing_agent6_candidate_use_boundary_and_morphology_relation';
  }
  return 'not_transform_ready_overlap_requires_agent6_source_family_selection_boundary_no_text_or_route_output';
}

function buildTriageRows(candidateRows) {
  const rowsByGroup = groupBy(candidateRows, (row) => row.triage_group);
  const order = [
    'commercial_clean_only',
    'commercial_clean_nc_overlap',
    'commercial_clean_blocked_overlap',
    'commercial_clean_nc_blocked_overlap',
  ];
  return order.map((group) => {
    const rows = rowsByGroup.get(group) || [];
    return {
      row_id: `agent3-candidate-use-boundary-triage-group-${group}`,
      triage_group: group,
      candidate_rows: rows.length,
      candidate_occurrences: sum(rows, (row) => row.occurrences),
      source_family_set_count: new Set(rows.map((row) => row.source_family_set_key)).size,
      source_rid_references: sum(rows, (row) => row.source_rid_count),
      unique_source_rids: new Set(rows.flatMap((row) => row.source_rids)).size,
      blocker_status: buildTriageStatus(group),
      queue_id_sample: rows.slice(0, 12).map((row) => row.queue_id),
      token_id_sample: rows.slice(0, 12).map((row) => row.token_id),
      dedupe_key: sha256([group, rows.length, sum(rows, (row) => row.occurrences)].join('|')),
    };
  });
}

function buildSourceFamilySetRows(candidateRows) {
  const grouped = groupBy(candidateRows, (row) => row.source_family_set_key);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceFamilySetKey, rows]) => ({
      row_id: `agent3-candidate-use-boundary-source-family-set-${sha256(sourceFamilySetKey).slice(0, 12)}`,
      source_family_set: sourceFamilySetKey.split(' | ').filter(Boolean),
      candidate_rows: rows.length,
      candidate_occurrences: sum(rows, (row) => row.occurrences),
      commercial_clean_only_rows: rows.filter((row) => row.triage_group === 'commercial_clean_only').length,
      overlap_rows: rows.filter((row) => row.triage_group !== 'commercial_clean_only').length,
      source_rid_references: sum(rows, (row) => row.source_rid_count),
      unique_source_rids: new Set(rows.flatMap((row) => row.source_rids)).size,
      queue_id_sample: rows.slice(0, 12).map((row) => row.queue_id),
      token_id_sample: rows.slice(0, 12).map((row) => row.token_id),
      status: 'source_family_set_navigation_only_boundary_required_before_transform',
      dedupe_key: sha256([sourceFamilySetKey, rows.length, sum(rows, (row) => row.occurrences)].join('|')),
    }));
}

function buildBucketSourceFamilySetRows(candidateRows) {
  const grouped = groupBy(candidateRows, (row) => `${row.bucket_id || 'missing'}||${row.source_family_set_key}`);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, rows]) => {
      const [bucketId, sourceFamilySetKey] = key.split('||');
      return {
        row_id: `agent3-candidate-use-boundary-bucket-family-set-${sha256(key).slice(0, 12)}`,
        bucket_id: bucketId,
        source_family_set: sourceFamilySetKey.split(' | ').filter(Boolean),
        candidate_rows: rows.length,
        candidate_occurrences: sum(rows, (row) => row.occurrences),
        source_rid_references: sum(rows, (row) => row.source_rid_count),
        unique_source_rids: new Set(rows.flatMap((row) => row.source_rids)).size,
        exact_blocker: rows[0]?.exact_blocker || null,
        triage_groups: [...new Set(rows.map((row) => row.triage_group))],
        queue_id_sample: rows.slice(0, 12).map((row) => row.queue_id),
        token_id_sample: rows.slice(0, 12).map((row) => row.token_id),
        status: 'bucket_to_source_family_set_navigation_only_boundary_required_before_transform',
        dedupe_key: sha256([key, rows.length, sum(rows, (row) => row.occurrences)].join('|')),
      };
    });
}

function writeMarkdown(filePath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Boundary Triage Navigation',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: linkage/navigation triage only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.',
    '',
    '## Inputs',
    '',
    `- Candidate-use package: \`${artifact.inputs.candidate_use_package}\``,
    `- Exact-subset crossmatch: \`${artifact.inputs.exact_subset_crossmatch}\``,
    `- Source-family blocker matrix: \`${artifact.inputs.source_family_blocker_matrix}\``,
    `- Source-RID continuity crossmatch: \`${artifact.inputs.source_rid_continuity_crossmatch}\``,
    `- Commercial-clean boundary packet: \`${artifact.inputs.commercial_clean_boundary_packet}\``,
    '',
    '## Counts',
    '',
    `- Candidate rows / occurrences: ${artifact.counts.candidate_use_rows}/${artifact.counts.candidate_use_occurrences}`,
    `- Pure commercial-clean rows / occurrences: ${artifact.counts.pure_commercial_clean_rows}/${artifact.counts.pure_commercial_clean_occurrences}`,
    `- Overlap rows / occurrences: ${artifact.counts.overlap_rows}/${artifact.counts.overlap_occurrences}`,
    `- NC overlap rows / occurrences: ${artifact.counts.nc_overlap_rows}/${artifact.counts.nc_overlap_occurrences}`,
    `- Blocked-review overlap rows / occurrences: ${artifact.counts.blocked_overlap_rows}/${artifact.counts.blocked_overlap_occurrences}`,
    `- Triple-overlap rows / occurrences: ${artifact.counts.triple_overlap_rows}/${artifact.counts.triple_overlap_occurrences}`,
    `- Source family sets / bucket-family-set rows: ${artifact.counts.source_family_set_rows}/${artifact.counts.bucket_source_family_set_rows}`,
    `- Source-RID refs / unique RIDs: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}`,
    `- Pure commercial-clean source-RID refs / unique RIDs: ${artifact.counts.pure_commercial_clean_source_rid_references}/${artifact.counts.pure_commercial_clean_unique_source_rids}`,
    `- Missing exact subset / missing Agent 1 RID metadata / missing boundary family links: ${artifact.counts.candidate_rows_missing_exact_subset}/${artifact.counts.rows_missing_source_rid_metadata}/${artifact.counts.rows_with_missing_family_boundary_links}`,
    `- Forbidden payload / acceptance claims: ${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Triage Rows',
    '',
    '| triage_group | rows | occurrences | source_family_sets | source_rid_refs | unique_source_rids | blocker_status |',
    '|---|---:|---:|---:|---:|---:|---|',
    ...artifact.triage_rows.map(
      (row) =>
        `| ${row.triage_group} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.source_family_set_count} | ${row.source_rid_references} | ${row.unique_source_rids} | ${row.blocker_status} |`,
    ),
    '',
    '## Source Family Sets',
    '',
    '| source_family_set | rows | occurrences | commercial_clean_only | overlap_rows | source_rid_refs | unique_source_rids |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...artifact.source_family_set_rows.map(
      (row) =>
        `| ${row.source_family_set.join(' + ')} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.commercial_clean_only_rows} | ${row.overlap_rows} | ${row.source_rid_references} | ${row.unique_source_rids} |`,
    ),
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];
  fs.writeFileSync(path.resolve(root, filePath), `${lines.join('\n')}\n`);
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
  let hits = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) hits += 1;
  });
  return hits;
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

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = map.get(key) || [];
    bucket.push(row);
    map.set(key, bucket);
  }
  return map;
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function sum(rows, selector) {
  return rows.reduce((total, row) => total + Number(selector(row) || 0), 0);
}

function pureNumber(value) {
  return Number(value || 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assertArtifact(artifact, expectedType, filePath) {
  if (artifact.artifact_type !== expectedType) {
    throw new Error(`${filePath} artifact_type=${artifact.artifact_type}; expected ${expectedType}`);
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(path.resolve(root, filePath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--candidate-use-package') parsed.candidateUsePackage = cleanRelativePath(value);
    else if (key === '--exact-subset-crossmatch') parsed.exactSubsetCrossmatch = cleanRelativePath(value);
    else if (key === '--source-family-blocker-matrix') parsed.sourceFamilyBlockerMatrix = cleanRelativePath(value);
    else if (key === '--source-rid-continuity-crossmatch') parsed.sourceRidContinuityCrossmatch = cleanRelativePath(value);
    else if (key === '--commercial-clean-boundary-packet') parsed.commercialCleanBoundaryPacket = cleanRelativePath(value);
    else if (key === '--output') parsed.output = cleanRelativePath(value);
    else if (key === '--report') parsed.report = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
