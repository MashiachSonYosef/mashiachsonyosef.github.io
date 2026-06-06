#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  exclusionInventory:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-exclusion-inventory-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const exclusionInventory = readJson(options.exclusionInventory);
assertArtifact(
  exclusionInventory,
  'agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory',
  options.exclusionInventory,
);

const worksetRows = (exclusionInventory.exclusion_rows || [])
  .filter((row) => !row.covered_by_agent6_prereq_packet)
  .map((row) => {
    const sourceFamilySignature = signature(row.source_families_observed);
    const triageSignature = signature(row.triage_groups);
    const partitionSignature = signature(row.partitions);
    return {
      row_id: `agent3-unpacketized-source-family-selection-${row.source_rid}`,
      source_rid: row.source_rid,
      source_rid_prefix: row.source_rid_prefix,
      queue_ids: sorted(row.queue_ids),
      queue_id_count: Number(row.queue_id_count || 0),
      token_ids: sorted(row.token_ids),
      token_id_count: Number(row.token_id_count || 0),
      lexicon_entry_ids: sorted(row.lexicon_entry_ids),
      lexicon_entry_id_count: Number(row.lexicon_entry_id_count || 0),
      surfaces: sorted(row.surfaces),
      normalized_forms: sorted(row.normalized_forms),
      source_families_observed: sorted(row.source_families_observed),
      source_family_signature: sourceFamilySignature,
      source_family_count: Number(row.source_family_count || 0),
      partitions: sorted(row.partitions),
      partition_signature: partitionSignature,
      triage_groups: sorted(row.triage_groups),
      triage_signature: triageSignature,
      mechanical_impact_bucket: row.mechanical_impact_bucket,
      reference_count: Number(row.reference_count || 0),
      occurrence_total: Number(row.occurrence_total || 0),
      current_blocker_ids: sorted(row.current_blocker_ids),
      current_blocker_count: Number(row.current_blocker_count || 0),
      source_family_selection_boundary_blockers: sorted(row.source_family_selection_boundary_blockers),
      source_citation_required: row.source_citation_required === true,
      source_citation_or_url_present: false,
      transform_rule_still_blocked: row.transform_rule_still_blocked === true,
      agent6_boundary_after_prereq: row.agent6_boundary_after_prereq === true,
      source_family_boundary_packet_exists: false,
      route_write_allowed: false,
      candidate_text_allowed: false,
      public_mutation_allowed: false,
      exact_blocker: 'source_family_selection_boundary_not_yet_packetized_for_agent6_prereq',
      evidence_role: 'unpacketized_source_family_selection_workset_navigation_only_no_selection_or_acceptance_claim',
      next_safe_action:
        'Keep this as an exact blocker until Agent 10 scopes a future Agent 6 boundary packet after source citation and transform prerequisites exist.',
      dedupe_key: sha256(
        [
          row.source_rid,
          sourceFamilySignature,
          triageSignature,
          partitionSignature,
          sorted(row.queue_ids).join('|'),
          sorted(row.current_blocker_ids).join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    const familyDelta = a.source_family_signature.localeCompare(b.source_family_signature, 'en');
    if (familyDelta !== 0) return familyDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_workset_order: index + 1 }));

const sourceFamilySignatureRows = summarizeGroup(
  worksetRows,
  (row) => row.source_family_signature,
  'source_family_signature',
  'unpacketized_source_family_selection_source_family_signature_navigation_only_no_selection_or_acceptance_claim',
);
const triageSignatureRows = summarizeGroup(
  worksetRows,
  (row) => row.triage_signature,
  'triage_signature',
  'unpacketized_source_family_selection_triage_signature_navigation_only_no_selection_or_acceptance_claim',
);
const impactBucketRows = summarizeGroup(
  worksetRows,
  (row) => row.mechanical_impact_bucket,
  'mechanical_impact_bucket',
  'unpacketized_source_family_selection_impact_bucket_navigation_only_no_selection_or_acceptance_claim',
);
const prefixRows = summarizeGroup(
  worksetRows,
  (row) => row.source_rid_prefix,
  'source_rid_prefix',
  'unpacketized_source_family_selection_prefix_navigation_only_no_selection_or_acceptance_claim',
);
const partitionSignatureRows = summarizeGroup(
  worksetRows,
  (row) => row.partition_signature,
  'partition_signature',
  'unpacketized_source_family_selection_partition_navigation_only_no_selection_or_acceptance_claim',
);

const counts = {
  input_exclusion_rows: Number(exclusionInventory.counts?.excluded_rows || 0),
  input_agent6_prereq_covered_rows: Number(exclusionInventory.counts?.agent6_prereq_covered_rows || 0),
  workset_rows: worksetRows.length,
  source_rid_references: sum(worksetRows, 'reference_count'),
  occurrence_total: sum(worksetRows, 'occurrence_total'),
  unique_source_rids: new Set(worksetRows.map((row) => row.source_rid)).size,
  unique_source_rid_prefixes: new Set(worksetRows.map((row) => row.source_rid_prefix)).size,
  unique_queue_ids: new Set(worksetRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(worksetRows.flatMap((row) => row.token_ids)).size,
  unique_lexicon_entry_ids: new Set(worksetRows.flatMap((row) => row.lexicon_entry_ids)).size,
  source_family_signature_rows: sourceFamilySignatureRows.length,
  triage_signature_rows: triageSignatureRows.length,
  impact_bucket_rows: impactBucketRows.length,
  prefix_rows: prefixRows.length,
  partition_signature_rows: partitionSignatureRows.length,
  source_family_membership_counts: countMembership(worksetRows, 'source_families_observed'),
  source_family_signature_counts: countField(worksetRows, 'source_family_signature'),
  triage_group_membership_counts: countMembership(worksetRows, 'triage_groups'),
  triage_signature_counts: countField(worksetRows, 'triage_signature'),
  impact_bucket_counts: countField(worksetRows, 'mechanical_impact_bucket'),
  partition_signature_counts: countField(worksetRows, 'partition_signature'),
  source_citation_required_rows: worksetRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: worksetRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: worksetRows.filter((row) => row.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: worksetRows.filter((row) => row.agent6_boundary_after_prereq).length,
  source_family_boundary_packet_exists_rows: worksetRows.filter((row) => row.source_family_boundary_packet_exists).length,
  source_family_selection_boundary_blocker_rows: worksetRows.filter(
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
  artifact_type: 'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_unpacketized_source_family_selection_workset_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    unpacketized_workset_only: true,
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
    source_family_selection_exclusion_inventory: options.exclusionInventory,
  },
  counts,
  source_family_signature_rows: sourceFamilySignatureRows,
  triage_signature_rows: triageSignatureRows,
  impact_bucket_rows: impactBucketRows,
  prefix_rows: prefixRows,
  partition_signature_rows: partitionSignatureRows,
  workset_rows: worksetRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this as the exact unpacketized blocker workset; Agent 6 only after an exact boundary packet exists and prerequisites are present',
    stop_condition:
      'Unpacketized source-family-selection workset emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 unpacketized source-family-selection workset passed: rows=${counts.workset_rows} signatures=${counts.source_family_signature_rows} occurrences=${counts.occurrence_total}`,
);

function summarizeGroup(rows, keyFn, fieldName, evidenceRole) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'missing';
    const group =
      groups.get(key) ||
      {
        [fieldName]: key,
        rows: [],
      };
    group.rows.push(row);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({
      [fieldName]: group[fieldName],
      row_count: group.rows.length,
      reference_total: sum(group.rows, 'reference_count'),
      occurrence_total: sum(group.rows, 'occurrence_total'),
      unique_prefixes: new Set(group.rows.map((row) => row.source_rid_prefix)).size,
      unique_queue_ids: new Set(group.rows.flatMap((row) => row.queue_ids)).size,
      unique_token_ids: new Set(group.rows.flatMap((row) => row.token_ids)).size,
      source_families_observed: sorted(group.rows.flatMap((row) => row.source_families_observed)),
      triage_groups: sorted(group.rows.flatMap((row) => row.triage_groups)),
      impact_buckets: sorted(group.rows.map((row) => row.mechanical_impact_bucket)),
      exact_blockers: sorted(group.rows.map((row) => row.exact_blocker)),
      evidence_role: evidenceRole,
    }))
    .sort((a, b) => b.row_count - a.row_count || String(a[fieldName]).localeCompare(String(b[fieldName]), 'en'));
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.workset_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Unpacketized Source-Family Selection Workset',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; observed source-family signatures are grouping keys, not source-family selection, source acceptance, source-license acceptance, or Agent 6 acceptance.',
    '- Rows remain blocked until source citation, transform prerequisites, and exact boundary packets exist.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Input excluded / Agent 6 covered / workset rows: ${c.input_exclusion_rows}/${c.input_agent6_prereq_covered_rows}/${c.workset_rows}`,
    `- Source-RID refs / occurrences / unique source RIDs: ${c.source_rid_references}/${c.occurrence_total}/${c.unique_source_rids}`,
    `- Prefixes / queue IDs / token IDs / lexicon entries: ${c.unique_source_rid_prefixes}/${c.unique_queue_ids}/${c.unique_token_ids}/${c.unique_lexicon_entry_ids}`,
    `- Source-family signatures / triage signatures / impact buckets / partition signatures: ${c.source_family_signature_rows}/${c.triage_signature_rows}/${c.impact_bucket_rows}/${c.partition_signature_rows}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / boundary packet exists / source-family-selection blockers: ${c.source_citation_required_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_boundary_packet_exists_rows}/${c.source_family_selection_boundary_blocker_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Source-Family Signatures',
    '',
    ...artifact.source_family_signature_rows.map(
      (row) => `- ${row.source_family_signature}: ${row.row_count} rows, ${row.occurrence_total} occurrences`,
    ),
    '',
    '## Impact Buckets',
    '',
    ...artifact.impact_bucket_rows.map(
      (row) => `- ${row.mechanical_impact_bucket}: ${row.row_count} rows, ${row.occurrence_total} occurrences`,
    ),
    '',
    '## Sample Workset Rows',
    '',
    '| order | source_rid | source_family_signature | prefix | queue_ids | refs | occurrences | exact_blocker |',
    '| ---: | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.mechanical_workset_order} | ${row.source_rid} | ${row.source_family_signature} | ${row.source_rid_prefix} | ${row.queue_id_count} | ${row.reference_count} | ${row.occurrence_total} | ${row.exact_blocker}`,
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function signature(values) {
  return sorted(values).join(' + ');
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

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset.mjs [--exclusion-inventory=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--exclusion-inventory=')) parsed.exclusionInventory = cleanRelativePath(valueAfterEquals(arg));
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
