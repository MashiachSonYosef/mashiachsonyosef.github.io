#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  worklist:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
  agent6BoundaryPrereq:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const worklist = readJson(options.worklist);
const agent6BoundaryPrereq = readJson(options.agent6BoundaryPrereq);
assertArtifact(
  worklist,
  'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist',
  options.worklist,
);
assertArtifact(
  agent6BoundaryPrereq,
  'agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix',
  options.agent6BoundaryPrereq,
);

const excludedSourceRids = new Set((agent6BoundaryPrereq.boundary_rows || []).map((row) => row.source_rid));
const sourceFamilySelectionBlockedSourceRids = new Set(
  (worklist.work_items || [])
    .filter((item) => (item.current_blocker_ids || []).some((blockerId) => blockerId.includes('source_family_selection_boundary')))
    .map((item) => item.source_rid),
);
const directRows = (worklist.work_items || [])
  .filter((item) => !sourceFamilySelectionBlockedSourceRids.has(item.source_rid))
  .map((item) => {
    const sourceFamilySelectionBlockers = (item.current_blocker_ids || []).filter((blockerId) =>
      blockerId.includes('source_family_selection_boundary'),
    );
    return {
      row_id: `agent3-direct-source-citation-prereq-${item.source_rid}`,
      source_rid: item.source_rid,
      source_rid_prefix: item.source_rid_prefix,
      queue_ids: sorted(item.queue_ids),
      queue_id_count: Number(item.queue_id_count || 0),
      token_ids: sorted(item.token_ids),
      token_id_count: Number(item.token_id_count || 0),
      lexicon_entry_ids: sorted(item.lexicon_entry_ids),
      lexicon_entry_id_count: (item.lexicon_entry_ids || []).length,
      surfaces: sorted(item.surfaces),
      normalized_forms: sorted(item.normalized_forms),
      source_families_observed: sorted(item.source_families),
      source_family_count: Number(item.source_family_count || 0),
      partitions: sorted(item.partitions),
      partition_count: Number(item.partition_count || 0),
      triage_groups: sorted(item.triage_groups),
      mechanical_impact_bucket: item.mechanical_impact_bucket,
      reference_count: Number(item.reference_count || 0),
      occurrence_total: Number(item.occurrence_total || 0),
      current_blocker_ids: sorted(item.current_blocker_ids),
      current_blocker_count: Number(item.current_blocker_count || 0),
      source_citation_required: item.source_citation_required === true,
      source_citation_or_url_present: false,
      transform_rule_still_blocked: item.transform_rule_still_blocked === true,
      agent6_boundary_after_prereq: item.agent6_boundary_after_prereq === true,
      source_family_selection_boundary_blockers: sorted(sourceFamilySelectionBlockers),
      source_family_selection_boundary_blocker_count: sourceFamilySelectionBlockers.length,
      direct_source_citation_prereq_now: true,
      route_write_allowed: false,
      candidate_text_allowed: false,
      public_mutation_allowed: false,
      evidence_role: 'direct_source_citation_prereq_navigation_only_no_source_or_acceptance_claim',
      next_safe_action:
        'Agent 1/Agent 2 can enrich source_citation_or_url for this identifier; transform output and any later Agent 6 boundary remain blocked until prerequisites exist.',
      dedupe_key: sha256(
        [
          item.source_rid,
          sorted(item.queue_ids).join('|'),
          sorted(item.source_families).join('|'),
          sorted(item.current_blocker_ids).join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const queueDelta = b.queue_id_count - a.queue_id_count;
    if (queueDelta !== 0) return queueDelta;
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_direct_order: index + 1 }));

const prefixRows = [...groupBy(directRows, 'source_rid_prefix').values()]
  .map((group) => ({
    source_rid_prefix: group.key,
    direct_source_rid_count: group.rows.length,
    queue_id_count: new Set(group.rows.flatMap((row) => row.queue_ids)).size,
    token_id_count: new Set(group.rows.flatMap((row) => row.token_ids)).size,
    reference_total: group.rows.reduce((total, row) => total + row.reference_count, 0),
    occurrence_total: group.rows.reduce((total, row) => total + row.occurrence_total, 0),
    source_families_observed: sorted(group.rows.flatMap((row) => row.source_families_observed)),
    triage_groups: sorted(group.rows.flatMap((row) => row.triage_groups)),
    blocker_ids: sorted(group.rows.flatMap((row) => row.current_blocker_ids)),
    evidence_role: 'direct_source_citation_prefix_summary_navigation_only_no_source_or_acceptance_claim',
  }))
  .sort((a, b) => {
    const countDelta = b.direct_source_rid_count - a.direct_source_rid_count;
    if (countDelta !== 0) return countDelta;
    return a.source_rid_prefix.localeCompare(b.source_rid_prefix, 'en');
  });

const sourceFamilyRows = [...groupByMembership(directRows, 'source_families_observed').values()]
  .map((group) => ({
    source_family: group.key,
    direct_source_rid_count: group.sourceRids.size,
    queue_id_count: group.queueIds.size,
    token_id_count: group.tokenIds.size,
    reference_total: group.referenceTotal,
    occurrence_total: group.occurrenceTotal,
    prefix_count: group.prefixes.size,
    prefixes: sorted(group.prefixes),
    triage_groups: sorted(group.triageGroups),
    evidence_role: 'direct_source_citation_source_family_summary_navigation_only_no_source_or_acceptance_claim',
  }))
  .sort((a, b) => {
    const countDelta = b.direct_source_rid_count - a.direct_source_rid_count;
    if (countDelta !== 0) return countDelta;
    return a.source_family.localeCompare(b.source_family, 'en');
  });

const counts = {
  direct_rows: directRows.length,
  excluded_agent6_source_family_boundary_rows: excludedSourceRids.size,
  excluded_source_family_selection_boundary_rows: sourceFamilySelectionBlockedSourceRids.size,
  worklist_rows: Number(worklist.counts?.worklist_rows || 0),
  source_rid_references: directRows.reduce((total, row) => total + row.reference_count, 0),
  occurrence_total: directRows.reduce((total, row) => total + row.occurrence_total, 0),
  unique_source_rids: new Set(directRows.map((row) => row.source_rid)).size,
  unique_source_rid_prefixes: new Set(directRows.map((row) => row.source_rid_prefix)).size,
  unique_queue_ids: new Set(directRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(directRows.flatMap((row) => row.token_ids)).size,
  unique_lexicon_entry_ids: new Set(directRows.flatMap((row) => row.lexicon_entry_ids)).size,
  prefix_rows: prefixRows.length,
  source_family_rows: sourceFamilyRows.length,
  source_family_memberships: directRows.reduce((total, row) => total + row.source_family_count, 0),
  source_family_counts: countMembership(directRows, 'source_families_observed'),
  triage_group_counts: countMembership(directRows, 'triage_groups'),
  mechanical_impact_bucket_counts: countField(directRows, 'mechanical_impact_bucket'),
  source_citation_required_rows: directRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: directRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: directRows.filter((row) => row.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: directRows.filter((row) => row.agent6_boundary_after_prereq).length,
  source_family_selection_boundary_blocker_rows: directRows.filter(
    (row) => row.source_family_selection_boundary_blocker_count > 0,
  ).length,
  direct_source_citation_prereq_rows: directRows.filter((row) => row.direct_source_citation_prereq_now).length,
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
  source_family_selection_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_direct_source_citation_prereq_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    direct_source_citation_prereq_matrix_only: true,
    excludes_agent6_source_family_boundary_subset: true,
    excludes_all_source_family_selection_boundary_blockers: true,
    observed_source_families_are_not_selection_or_acceptance: true,
    no_new_acceptance_or_release_claim: true,
    qa_acceptance: false,
    agent6_acceptance: false,
    source_family_selection: false,
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
    source_citation_enrichment_worklist: options.worklist,
    agent6_source_family_boundary_prereq_matrix: options.agent6BoundaryPrereq,
  },
  counts,
  prefix_rows: prefixRows,
  source_family_rows: sourceFamilyRows,
  direct_rows: directRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 1/Agent 2 source-citation enrichment; Agent 10 release/package intake after enrichment; Agent 6 remains later boundary owner where exact boundary packet is prepared',
    stop_condition:
      'Direct source-citation prerequisite matrix emitted; Agent 6 source-family boundary subset excluded; no source text read, source citation supplied, transform text generated, route write, public mutation, or acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 direct source-citation prereq rows=${counts.direct_rows} excluded=${counts.excluded_agent6_source_family_boundary_rows} occurrences=${counts.occurrence_total}`,
);

function groupBy(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field];
    const group = groups.get(key) || { key, rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  }
  return groups;
}

function groupByMembership(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    for (const key of row[field] || []) {
      const group =
        groups.get(key) ||
        {
          key,
          sourceRids: new Set(),
          queueIds: new Set(),
          tokenIds: new Set(),
          prefixes: new Set(),
          triageGroups: new Set(),
          referenceTotal: 0,
          occurrenceTotal: 0,
        };
      group.sourceRids.add(row.source_rid);
      for (const queueId of row.queue_ids || []) group.queueIds.add(queueId);
      for (const tokenId of row.token_ids || []) group.tokenIds.add(tokenId);
      group.prefixes.add(row.source_rid_prefix);
      for (const triageGroup of row.triage_groups || []) group.triageGroups.add(triageGroup);
      group.referenceTotal += Number(row.reference_count || 0);
      group.occurrenceTotal += Number(row.occurrence_total || 0);
      groups.set(key, group);
    }
  }
  return groups;
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.direct_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Direct Source-Citation Prereq Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this matrix excludes every row carrying a source-family-selection boundary blocker.',
    '- Rows still require source_citation_or_url and transform prerequisites; observed source-family labels are not source-family selection or source acceptance.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Direct rows / excluded source-family-selection rows / prior Agent 6 prereq rows / source-RID refs: ${c.direct_rows}/${c.excluded_source_family_selection_boundary_rows}/${c.excluded_agent6_source_family_boundary_rows}/${c.source_rid_references}`,
    `- Unique source RIDs / prefixes / queue IDs / token IDs: ${c.unique_source_rids}/${c.unique_source_rid_prefixes}/${c.unique_queue_ids}/${c.unique_token_ids}`,
    `- Occurrence total / source-family memberships / source-family rows: ${c.occurrence_total}/${c.source_family_memberships}/${c.source_family_rows}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / source-family-selection blocker rows: ${c.source_citation_required_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_selection_boundary_blocker_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Source Family Counts',
    '',
    ...Object.entries(c.source_family_counts).map(([family, count]) => `- ${family}: ${count}`),
    '',
    '## Sample Direct Rows',
    '',
    '| order | source_rid | prefix | source_families | queue_ids | refs | occurrences |',
    '| ---: | --- | --- | --- | ---: | ---: | ---: |',
    ...sampleRows.map((row) =>
      [
        row.mechanical_direct_order,
        row.source_rid,
        row.source_rid_prefix,
        row.source_families_observed.join(', '),
        row.queue_id_count,
        row.reference_count,
        row.occurrence_total,
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

function countMembership(rows, field) {
  const counts = {};
  for (const row of rows) {
    for (const value of row[field] || []) counts[value] = (counts[value] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function countField(rows, field) {
  const counts = {};
  for (const row of rows) counts[row[field]] = (counts[row[field]] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function sorted(values) {
  return [...new Set(values || [])].sort((a, b) => String(a).localeCompare(String(b), 'en'));
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix.mjs [--worklist=PATH] [--agent6-boundary-prereq=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--worklist=')) parsed.worklist = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent6-boundary-prereq=')) parsed.agent6BoundaryPrereq = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
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
