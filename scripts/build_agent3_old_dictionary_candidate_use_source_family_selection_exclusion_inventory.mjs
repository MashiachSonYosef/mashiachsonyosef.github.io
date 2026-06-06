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
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-exclusion-inventory-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-exclusion-inventory-2026-06-06.md',
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

const agent6PrereqSourceRids = new Set((agent6BoundaryPrereq.boundary_rows || []).map((row) => row.source_rid));
const allWorkItems = worklist.work_items || [];
const excludedItems = allWorkItems.filter((item) => hasSourceFamilySelectionBoundary(item));
const directItems = allWorkItems.filter((item) => !hasSourceFamilySelectionBoundary(item));

const exclusionRows = excludedItems
  .map((item) => {
    const coveredByAgent6Prereq = agent6PrereqSourceRids.has(item.source_rid);
    const classification = coveredByAgent6Prereq
      ? 'covered_by_agent6_source_family_boundary_prereq_packet'
      : 'source_family_selection_boundary_not_in_agent6_prereq_packet';
    return {
      row_id: `agent3-source-family-selection-exclusion-${item.source_rid}`,
      source_rid: item.source_rid,
      source_rid_prefix: item.source_rid_prefix,
      classification,
      covered_by_agent6_prereq_packet: coveredByAgent6Prereq,
      exact_blocker: coveredByAgent6Prereq
        ? 'source_citation_and_transform_prereqs_missing_before_agent6_boundary_packet'
        : 'source_family_selection_boundary_not_yet_packetized_for_agent6_prereq',
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
      source_family_selection_boundary_blockers: sorted(
        (item.current_blocker_ids || []).filter((blockerId) => blockerId.includes('source_family_selection_boundary')),
      ),
      source_citation_required: item.source_citation_required === true,
      source_citation_or_url_present: false,
      transform_rule_still_blocked: item.transform_rule_still_blocked === true,
      agent6_boundary_after_prereq: item.agent6_boundary_after_prereq === true,
      route_write_allowed: false,
      candidate_text_allowed: false,
      public_mutation_allowed: false,
      evidence_role: 'source_family_selection_exclusion_inventory_navigation_only_no_selection_or_acceptance_claim',
      next_safe_action: coveredByAgent6Prereq
        ? 'Preserve this row under the existing Agent 6 boundary-prereq packet until source citation and transform prerequisites exist.'
        : 'Preserve this row as an exact source-family-selection blocker; do not promote it until a future Agent 3/Agent 10 packet scopes an exact Agent 6 boundary question.',
      dedupe_key: sha256(
        [
          item.source_rid,
          classification,
          sorted(item.queue_ids).join('|'),
          sorted(item.source_families).join('|'),
          sorted(item.current_blocker_ids).join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    if (a.covered_by_agent6_prereq_packet !== b.covered_by_agent6_prereq_packet) {
      return a.covered_by_agent6_prereq_packet ? -1 : 1;
    }
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_exclusion_order: index + 1 }));

const classificationRows = [...groupBy(exclusionRows, 'classification').values()]
  .map((group) => ({
    classification: group.key,
    row_count: group.rows.length,
    reference_total: sum(group.rows, 'reference_count'),
    occurrence_total: sum(group.rows, 'occurrence_total'),
    unique_queue_ids: new Set(group.rows.flatMap((row) => row.queue_ids)).size,
    unique_token_ids: new Set(group.rows.flatMap((row) => row.token_ids)).size,
    source_families_observed: sorted(group.rows.flatMap((row) => row.source_families_observed)),
    triage_groups: sorted(group.rows.flatMap((row) => row.triage_groups)),
    exact_blockers: sorted(group.rows.map((row) => row.exact_blocker)),
    evidence_role: 'source_family_selection_exclusion_classification_navigation_only_no_selection_or_acceptance_claim',
  }))
  .sort((a, b) => b.row_count - a.row_count || a.classification.localeCompare(b.classification, 'en'));

const prefixRows = [...groupBy(exclusionRows, 'source_rid_prefix').values()]
  .map((group) => ({
    source_rid_prefix: group.key,
    row_count: group.rows.length,
    agent6_prereq_covered_rows: group.rows.filter((row) => row.covered_by_agent6_prereq_packet).length,
    not_in_agent6_prereq_rows: group.rows.filter((row) => !row.covered_by_agent6_prereq_packet).length,
    reference_total: sum(group.rows, 'reference_count'),
    occurrence_total: sum(group.rows, 'occurrence_total'),
    source_families_observed: sorted(group.rows.flatMap((row) => row.source_families_observed)),
    triage_groups: sorted(group.rows.flatMap((row) => row.triage_groups)),
    evidence_role: 'source_family_selection_exclusion_prefix_navigation_only_no_selection_or_acceptance_claim',
  }))
  .sort((a, b) => b.row_count - a.row_count || a.source_rid_prefix.localeCompare(b.source_rid_prefix, 'en'));

const counts = {
  worklist_rows: allWorkItems.length,
  excluded_rows: exclusionRows.length,
  direct_non_excluded_rows: directItems.length,
  agent6_prereq_covered_rows: exclusionRows.filter((row) => row.covered_by_agent6_prereq_packet).length,
  source_family_selection_not_in_agent6_prereq_rows: exclusionRows.filter(
    (row) => !row.covered_by_agent6_prereq_packet,
  ).length,
  source_rid_references: sum(exclusionRows, 'reference_count'),
  occurrence_total: sum(exclusionRows, 'occurrence_total'),
  unique_source_rids: new Set(exclusionRows.map((row) => row.source_rid)).size,
  unique_source_rid_prefixes: new Set(exclusionRows.map((row) => row.source_rid_prefix)).size,
  unique_queue_ids: new Set(exclusionRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(exclusionRows.flatMap((row) => row.token_ids)).size,
  unique_lexicon_entry_ids: new Set(exclusionRows.flatMap((row) => row.lexicon_entry_ids)).size,
  classification_rows: classificationRows.length,
  prefix_rows: prefixRows.length,
  source_family_counts: countMembership(exclusionRows, 'source_families_observed'),
  triage_group_counts: countMembership(exclusionRows, 'triage_groups'),
  mechanical_impact_bucket_counts: countField(exclusionRows, 'mechanical_impact_bucket'),
  source_citation_required_rows: exclusionRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: exclusionRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: exclusionRows.filter((row) => row.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: exclusionRows.filter((row) => row.agent6_boundary_after_prereq).length,
  source_family_selection_boundary_blocker_rows: exclusionRows.filter(
    (row) => row.source_family_selection_boundary_blockers.length > 0,
  ).length,
  source_family_selection_claims: 0,
  source_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
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
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_family_selection_exclusion_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    exclusion_inventory_only: true,
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
  classification_rows: classificationRows,
  prefix_rows: prefixRows,
  exclusion_rows: exclusionRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can consume this as exact blocker navigation; Agent 6 only after an exact boundary packet exists and prerequisites are present',
    stop_condition:
      'Source-family-selection exclusion inventory emitted; direct source-citation rows separated; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-family-selection exclusion inventory passed: rows=${counts.excluded_rows} covered=${counts.agent6_prereq_covered_rows} unpacketized=${counts.source_family_selection_not_in_agent6_prereq_rows}`,
);

function hasSourceFamilySelectionBoundary(item) {
  return (item.current_blocker_ids || []).some((blockerId) => blockerId.includes('source_family_selection_boundary'));
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.exclusion_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Family Selection Exclusion Inventory',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; observed source-family labels are not source-family selection, source acceptance, source-license acceptance, or Agent 6 acceptance.',
    '- Rows remain blocked until source citation, transform prerequisites, and exact boundary packets exist.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Worklist rows / excluded rows / direct non-excluded rows: ${c.worklist_rows}/${c.excluded_rows}/${c.direct_non_excluded_rows}`,
    `- Agent 6 prereq covered / not in Agent 6 prereq / source-RID refs: ${c.agent6_prereq_covered_rows}/${c.source_family_selection_not_in_agent6_prereq_rows}/${c.source_rid_references}`,
    `- Unique source RIDs / prefixes / queue IDs / token IDs: ${c.unique_source_rids}/${c.unique_source_rid_prefixes}/${c.unique_queue_ids}/${c.unique_token_ids}`,
    `- Occurrence total / classification rows / prefix rows: ${c.occurrence_total}/${c.classification_rows}/${c.prefix_rows}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / source-family-selection blockers: ${c.source_citation_required_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_selection_boundary_blocker_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Classification Counts',
    '',
    ...artifact.classification_rows.map(
      (row) => `- ${row.classification}: ${row.row_count} rows, ${row.occurrence_total} occurrences`,
    ),
    '',
    '## Source Family Counts',
    '',
    ...Object.entries(c.source_family_counts).map(([family, count]) => `- ${family}: ${count}`),
    '',
    '## Sample Exclusion Rows',
    '',
    '| order | source_rid | classification | prefix | queue_ids | refs | occurrences | exact_blocker |',
    '| ---: | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.mechanical_exclusion_order} | ${row.source_rid} | ${row.classification} | ${row.source_rid_prefix} | ${row.queue_id_count} | ${row.reference_count} | ${row.occurrence_total} | ${row.exact_blocker}`,
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function assertArtifact(artifact, expectedType, inputPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${inputPath} is not ${expectedType}`);
  }
}

function countField(rows, field) {
  const counts = {};
  for (const row of rows) {
    const value = row[field] || 'missing';
    counts[value] = (counts[value] || 0) + 1;
  }
  return sortObject(counts);
}

function countMembership(rows, field) {
  const counts = {};
  for (const row of rows) {
    for (const value of row[field] || []) counts[value] = (counts[value] || 0) + 1;
  }
  return sortObject(counts);
}

function groupBy(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field] || 'missing';
    const group = groups.get(key) || { key, rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  }
  return groups;
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory.mjs [--worklist=PATH] [--agent6-boundary-prereq=PATH] [--output=PATH] [--report=PATH]',
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function sorted(values) {
  return [...new Set(values || [])].sort((a, b) => String(a).localeCompare(String(b), 'en'));
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
