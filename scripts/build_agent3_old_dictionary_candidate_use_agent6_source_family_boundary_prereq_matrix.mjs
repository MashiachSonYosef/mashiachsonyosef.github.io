#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  worklist:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
  prefixMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-citation-prefix-matrix-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const worklist = readJson(options.worklist);
const prefixMatrix = readJson(options.prefixMatrix);
assertArtifact(
  worklist,
  'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist',
  options.worklist,
);
assertArtifact(
  prefixMatrix,
  'agent3_old_dictionary_candidate_use_source_citation_prefix_matrix',
  options.prefixMatrix,
);

const boundaryRows = (worklist.work_items || [])
  .filter((item) =>
    (item.current_blocker_ids || []).includes(
      'commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary',
    ),
  )
  .map((item) => ({
    row_id: `agent3-agent6-source-family-boundary-prereq-${item.source_rid}`,
    source_rid: item.source_rid,
    source_rid_prefix: item.source_rid_prefix,
    queue_ids: sorted(item.queue_ids),
    queue_id_count: Number(item.queue_id_count || 0),
    token_ids: sorted(item.token_ids),
    token_id_count: Number(item.token_id_count || 0),
    lexicon_entry_ids: sorted(item.lexicon_entry_ids),
    surfaces: sorted(item.surfaces),
    normalized_forms: sorted(item.normalized_forms),
    source_families_observed: sorted(item.source_families),
    source_family_count: Number(item.source_family_count || 0),
    partitions: sorted(item.partitions),
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
    agent6_boundary_type: 'source_family_selection_after_source_citation_prereq',
    agent6_boundary_ready_now: false,
    prereq_blockers: [
      'missing_source_field::source_citation_or_url',
      'missing_transform_output_proposal_matrix_or_exact_transform_rule',
      'commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary',
    ],
    route_write_allowed: false,
    candidate_text_allowed: false,
    public_mutation_allowed: false,
    evidence_role: 'agent6_source_family_boundary_prereq_navigation_only_no_acceptance_claim',
    next_safe_action:
      'After source_citation_or_url and transform proposal prerequisites exist, prepare an exact Agent 6 source-family boundary question for this row; otherwise preserve blockers.',
    dedupe_key: sha256(
      [
        item.source_rid,
        sorted(item.queue_ids).join('|'),
        sorted(item.source_families).join('|'),
        sorted(item.current_blocker_ids).join('|'),
      ].join('|'),
    ),
  }))
  .sort((a, b) => {
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_boundary_order: index + 1 }));

const prefixRows = [...groupByPrefix(boundaryRows).values()]
  .map((group) => ({
    source_rid_prefix: group.source_rid_prefix,
    boundary_source_rid_count: group.source_rids.size,
    queue_id_count: group.queue_ids.size,
    token_id_count: group.token_ids.size,
    reference_total: group.reference_total,
    occurrence_total: group.occurrence_total,
    source_families_observed: sorted(group.source_families),
    triage_groups: sorted(group.triage_groups),
    blocker_ids: sorted(group.blocker_ids),
    evidence_role: 'agent6_source_family_boundary_prefix_summary_navigation_only_no_acceptance_claim',
  }))
  .sort((a, b) => {
    const countDelta = b.boundary_source_rid_count - a.boundary_source_rid_count;
    if (countDelta !== 0) return countDelta;
    return a.source_rid_prefix.localeCompare(b.source_rid_prefix, 'en');
  });

const counts = {
  boundary_rows: boundaryRows.length,
  prefix_rows: prefixRows.length,
  source_rid_references: boundaryRows.reduce((total, row) => total + row.reference_count, 0),
  occurrence_total: boundaryRows.reduce((total, row) => total + row.occurrence_total, 0),
  unique_source_rids: new Set(boundaryRows.map((row) => row.source_rid)).size,
  unique_source_rid_prefixes: new Set(boundaryRows.map((row) => row.source_rid_prefix)).size,
  unique_queue_ids: new Set(boundaryRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(boundaryRows.flatMap((row) => row.token_ids)).size,
  unique_lexicon_entry_ids: new Set(boundaryRows.flatMap((row) => row.lexicon_entry_ids)).size,
  source_family_count: new Set(boundaryRows.flatMap((row) => row.source_families_observed)).size,
  source_family_observed_counts: countMembership(boundaryRows, 'source_families_observed'),
  prefix_boundary_counts: Object.fromEntries(
    prefixRows.map((row) => [row.source_rid_prefix, row.boundary_source_rid_count]),
  ),
  source_citation_required_rows: boundaryRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: boundaryRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: boundaryRows.filter((row) => row.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: boundaryRows.filter((row) => row.agent6_boundary_after_prereq).length,
  agent6_boundary_ready_now_rows: boundaryRows.filter((row) => row.agent6_boundary_ready_now).length,
  worklist_rows: Number(worklist.counts?.worklist_rows || 0),
  prefix_matrix_rows: Number(prefixMatrix.counts?.prefix_family_rows || 0),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_agent6_source_family_boundary_prereq_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    agent6_boundary_prereq_matrix_only: true,
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
    source_citation_prefix_matrix: options.prefixMatrix,
  },
  counts,
  prefix_rows: prefixRows,
  boundary_rows: boundaryRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 release/package intake prepares exact Agent 6 boundary only after Agent 1/Agent 2 source-citation and transform prerequisites exist',
    stop_condition:
      'Agent 6 boundary-prereq matrix emitted; no source text read, source-family selection made, source citation supplied, transform text generated, route write, public mutation, or acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 Agent6 source-family boundary prereq rows=${counts.boundary_rows} prefixes=${counts.prefix_rows} occurrences=${counts.occurrence_total}`,
);

function groupByPrefix(rows) {
  const groups = new Map();
  for (const row of rows) {
    const group =
      groups.get(row.source_rid_prefix) ||
      {
        source_rid_prefix: row.source_rid_prefix,
        source_rids: new Set(),
        queue_ids: new Set(),
        token_ids: new Set(),
        reference_total: 0,
        occurrence_total: 0,
        source_families: new Set(),
        triage_groups: new Set(),
        blocker_ids: new Set(),
      };
    group.source_rids.add(row.source_rid);
    for (const queueId of row.queue_ids || []) group.queue_ids.add(queueId);
    for (const tokenId of row.token_ids || []) group.token_ids.add(tokenId);
    group.reference_total += Number(row.reference_count || 0);
    group.occurrence_total += Number(row.occurrence_total || 0);
    for (const sourceFamily of row.source_families_observed || []) group.source_families.add(sourceFamily);
    for (const triageGroup of row.triage_groups || []) group.triage_groups.add(triageGroup);
    for (const blockerId of row.current_blocker_ids || []) group.blocker_ids.add(blockerId);
    groups.set(row.source_rid_prefix, group);
  }
  return groups;
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.boundary_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Agent 6 Source-Family Boundary Prereq Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; observed source-family labels are not source-family selection, source acceptance, or Agent 6 acceptance.',
    '- Rows remain blocked until source citation and transform prerequisites exist; this packet does not make them boundary-ready.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Boundary rows / prefix rows / source-RID refs: ${c.boundary_rows}/${c.prefix_rows}/${c.source_rid_references}`,
    `- Unique source RIDs / prefixes / queue IDs / token IDs: ${c.unique_source_rids}/${c.unique_source_rid_prefixes}/${c.unique_queue_ids}/${c.unique_token_ids}`,
    `- Occurrence total / observed source families: ${c.occurrence_total}/${c.source_family_count}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / boundary-ready now: ${c.source_citation_required_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.agent6_boundary_ready_now_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Prefix Boundary Counts',
    '',
    ...Object.entries(c.prefix_boundary_counts).map(([prefix, count]) => `- ${prefix}: ${count}`),
    '',
    '## Sample Boundary Rows',
    '',
    '| order | source_rid | prefix | source_family | queue_ids | occurrences | boundary_ready_now |',
    '| ---: | --- | --- | --- | ---: | ---: | --- |',
    ...sampleRows.map((row) =>
      [
        row.mechanical_boundary_order,
        row.source_rid,
        row.source_rid_prefix,
        row.source_families_observed.join(', '),
        row.queue_id_count,
        row.occurrence_total,
        String(row.agent6_boundary_ready_now),
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix.mjs [--worklist=PATH] [--prefix-matrix=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--worklist=')) parsed.worklist = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--prefix-matrix=')) parsed.prefixMatrix = cleanRelativePath(valueAfterEquals(arg));
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
