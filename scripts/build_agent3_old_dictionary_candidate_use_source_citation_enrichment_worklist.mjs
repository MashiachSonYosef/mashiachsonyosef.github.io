#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  sourceRidBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const sourceRidBlockerMatrix = readJson(options.sourceRidBlockerMatrix);

assertArtifact(
  sourceRidBlockerMatrix,
  'agent3_old_dictionary_candidate_use_source_rid_blocker_matrix',
  options.sourceRidBlockerMatrix,
);

const workItems = (sourceRidBlockerMatrix.source_rid_rows || [])
  .map((row) => {
    const mechanicalImpactScore =
      Number(row.queue_id_count || 0) * 100000 +
      Number(row.reference_count || 0) * 10000 +
      Number(row.occurrence_total || 0) * 10 +
      Number(row.current_blocker_count || 0);
    const partitionSet = new Set(row.partitions || []);
    const triageSet = new Set(row.triage_groups || []);
    const sourceFamilySet = new Set(row.source_families || []);
    const sourceCitationRequired = row.source_citation_missing === true;
    const transformRuleStillBlocked = row.transform_rule_missing === true;
    const agent6BoundaryAfterPrereq =
      Number(row.rows_agent6_boundary_required || 0) > 0 ||
      (row.current_blocker_ids || []).includes(
        'commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary',
      );

    return {
      work_item_id: `agent3-source-citation-enrichment-${row.source_rid}`,
      source_rid: row.source_rid,
      source_rid_prefix: row.source_rid_prefix,
      mechanical_resolution_order_score: mechanicalImpactScore,
      mechanical_impact_bucket: impactBucket(row, mechanicalImpactScore),
      queue_ids: sorted(row.queue_ids),
      queue_id_count: Number(row.queue_id_count || 0),
      token_ids: sorted(row.token_ids),
      token_id_count: Number(row.token_id_count || 0),
      lexicon_entry_ids: sorted(row.lexicon_entry_ids),
      surfaces: sorted(row.surfaces),
      normalized_forms: sorted(row.normalized_forms),
      source_families: sorted([...sourceFamilySet]),
      source_family_count: sourceFamilySet.size,
      partitions: sorted([...partitionSet]),
      partition_count: partitionSet.size,
      triage_groups: sorted([...triageSet]),
      reference_count: Number(row.reference_count || 0),
      occurrence_total: Number(row.occurrence_total || 0),
      current_blocker_ids: sorted(row.current_blocker_ids),
      current_blocker_count: Number(row.current_blocker_count || 0),
      source_citation_required: sourceCitationRequired,
      source_citation_or_url_present: false,
      transform_rule_still_blocked: transformRuleStillBlocked,
      agent6_boundary_after_prereq: agent6BoundaryAfterPrereq,
      route_write_allowed: false,
      candidate_text_allowed: false,
      public_mutation_allowed: false,
      handoff_owner: ownerFor(partitionSet, triageSet),
      next_safe_action:
        'Supply row-level source_citation_or_url for this source RID, or preserve the exact missing-source blocker.',
      evidence_role: 'source_citation_enrichment_navigation_only_no_source_or_acceptance_claim',
      dedupe_key: sha256(
        [
          row.source_rid,
          sorted(row.queue_ids).join('|'),
          sorted(row.source_families).join('|'),
          sorted(row.partitions).join('|'),
          sorted(row.current_blocker_ids).join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const scoreDelta = b.mechanical_resolution_order_score - a.mechanical_resolution_order_score;
    if (scoreDelta !== 0) return scoreDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((item, index) => ({
    ...item,
    mechanical_resolution_order: index + 1,
  }));

const sourceRidPrefixes = new Set(workItems.map((item) => item.source_rid_prefix));
const partitionCounts = countMembership(workItems, 'partitions');
const triageGroupCounts = countMembership(workItems, 'triage_groups');
const sourceFamilyCounts = countMembership(workItems, 'source_families');
const bucketCounts = countField(workItems, 'mechanical_impact_bucket');
const handoffOwnerCounts = countField(workItems, 'handoff_owner');

const counts = {
  worklist_rows: workItems.length,
  source_rid_references: workItems.reduce((total, item) => total + item.reference_count, 0),
  unique_source_rids: new Set(workItems.map((item) => item.source_rid)).size,
  source_rid_prefix_rows: sourceRidPrefixes.size,
  unique_queue_ids: new Set(workItems.flatMap((item) => item.queue_ids)).size,
  unique_token_ids: new Set(workItems.flatMap((item) => item.token_ids)).size,
  unique_lexicon_entry_ids: new Set(workItems.flatMap((item) => item.lexicon_entry_ids)).size,
  multi_queue_work_items: workItems.filter((item) => item.queue_id_count > 1).length,
  cross_partition_work_items: workItems.filter((item) => item.partition_count > 1).length,
  source_citation_required_rows: workItems.filter((item) => item.source_citation_required).length,
  transform_rule_still_blocked_rows: workItems.filter((item) => item.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: workItems.filter((item) => item.agent6_boundary_after_prereq).length,
  max_queue_refs_per_source_rid: Math.max(0, ...workItems.map((item) => item.queue_id_count)),
  max_reference_count_per_source_rid: Math.max(0, ...workItems.map((item) => item.reference_count)),
  max_occurrences_per_source_rid: Math.max(0, ...workItems.map((item) => item.occurrence_total)),
  blocker_links: workItems.reduce((total, item) => total + item.current_blocker_count, 0),
  source_rid_blocker_matrix_rows: Number(sourceRidBlockerMatrix.counts?.source_rid_rows || 0),
  source_rid_blocker_matrix_references: Number(sourceRidBlockerMatrix.counts?.source_rid_references || 0),
  partition_counts: partitionCounts,
  triage_group_counts: triageGroupCounts,
  source_family_counts: sourceFamilyCounts,
  mechanical_impact_bucket_counts: bucketCounts,
  handoff_owner_counts: handoffOwnerCounts,
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
  export_rows: 0,
  release_actions: 0,
  source_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_citation_enrichment_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    source_citation_enrichment_worklist_only: true,
    source_rids_are_identifiers_not_source_text: true,
    mechanical_resolution_order_is_not_route_ranking: true,
    no_new_acceptance_or_release_claim: true,
    qa_acceptance: false,
    source_provenance_acceptance: false,
    source_license_acceptance: false,
    source_legal_acceptance: false,
    source_citation_supplied_by_agent3: false,
    transform_authority: false,
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
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  inputs: {
    source_rid_blocker_matrix: options.sourceRidBlockerMatrix,
  },
  counts,
  work_items: workItems,
  downstream_handoff: {
    handoff_owner:
      'Agent 1/Agent 2 source-citation enrichment; Agent 10 release/package intake; Agent 6 only after exact boundary packet',
    stop_condition:
      'Source-citation enrichment worklist emitted; no source text read, source citation supplied, transform text generated, route write, public mutation, or acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-citation enrichment worklist rows=${counts.worklist_rows} refs=${counts.source_rid_references} multi=${counts.multi_queue_work_items}`,
);

function impactBucket(row, score) {
  if (Number(row.queue_id_count || 0) > 1) return 'shared_source_rid_multi_queue';
  if (Number(row.reference_count || 0) > 1) return 'repeated_source_rid_reference';
  if (Number(row.occurrence_total || 0) >= 20) return 'single_queue_high_occurrence';
  return score > 0 ? 'single_queue_standard' : 'unscored';
}

function ownerFor(partitionSet, triageSet) {
  if (triageSet.has('commercial_clean_nc_overlap')) {
    return 'Agent 1/Agent 2 source-citation enrichment plus Agent 6 source-family boundary after prerequisites';
  }
  if (partitionSet.has('pure_workset')) return 'Agent 1/Agent 2 source-citation enrichment before Agent 10 transform intake';
  return 'Agent 1/Agent 2 source-citation enrichment before Agent 10 package intake';
}

function countMembership(rows, field) {
  const counts = {};
  for (const row of rows) {
    for (const value of row[field] || []) counts[value] = (counts[value] || 0) + 1;
  }
  return sortObject(counts);
}

function countField(rows, field) {
  const counts = {};
  for (const row of rows) counts[row[field]] = (counts[row[field]] || 0) + 1;
  return sortObject(counts);
}

function sortObject(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function sorted(values) {
  return [...new Set(values || [])].sort((a, b) => String(a).localeCompare(String(b), 'en'));
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.work_items.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Citation Enrichment Worklist',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; source RIDs are identifiers, not source text, citation acceptance, or Definition authority.',
    '- Mechanical resolution order is for source-citation enrichment planning only; it is not route ranking or answer selection.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Worklist rows / source-RID refs / prefixes: ${c.worklist_rows}/${c.source_rid_references}/${c.source_rid_prefix_rows}`,
    `- Unique source RIDs / queue IDs / token IDs: ${c.unique_source_rids}/${c.unique_queue_ids}/${c.unique_token_ids}`,
    `- Multi-queue / cross-partition work items: ${c.multi_queue_work_items}/${c.cross_partition_work_items}`,
    `- Source citation required / transform still blocked / Agent 6 boundary after prereq: ${c.source_citation_required_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}`,
    `- Blocker links / max queue refs / max references / max occurrences: ${c.blocker_links}/${c.max_queue_refs_per_source_rid}/${c.max_reference_count_per_source_rid}/${c.max_occurrences_per_source_rid}`,
    `- Candidate text / answer eligible / route writes / source text / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Mechanical Impact Buckets',
    '',
    ...Object.entries(c.mechanical_impact_bucket_counts).map(([bucket, count]) => `- ${bucket}: ${count}`),
    '',
    '## Sample Work Items',
    '',
    '| order | source_rid | bucket | queue_ids | refs | occurrences | blockers | owner |',
    '| ---: | --- | --- | ---: | ---: | ---: | ---: | --- |',
    ...sampleRows.map((row) =>
      [
        row.mechanical_resolution_order,
        row.source_rid,
        row.mechanical_impact_bucket,
        row.queue_id_count,
        row.reference_count,
        row.occurrence_total,
        row.current_blocker_count,
        row.handoff_owner,
      ].join(' | '),
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.resolve(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function assertArtifact(artifact, expectedType, artifactPath) {
  if (artifact.artifact_type !== expectedType) {
    throw new Error(`${artifactPath} expected ${expectedType}, got ${artifact.artifact_type || 'missing'}`);
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist.mjs [--source-rid-blocker-matrix=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--source-rid-blocker-matrix=')) {
      parsed.sourceRidBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}
