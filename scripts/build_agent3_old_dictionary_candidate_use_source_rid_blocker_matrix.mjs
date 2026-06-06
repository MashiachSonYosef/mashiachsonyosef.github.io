#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  rowBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.json',
  sourceRidContinuity:
    'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
  output: 'reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const rowBlockerMatrix = readJson(options.rowBlockerMatrix);
const sourceRidContinuity = readJson(options.sourceRidContinuity);

assertArtifact(rowBlockerMatrix, 'agent3_old_dictionary_candidate_use_row_blocker_matrix', options.rowBlockerMatrix);
assertArtifact(
  sourceRidContinuity,
  'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  options.sourceRidContinuity,
);

const groups = new Map();
for (const row of rowBlockerMatrix.matrix_rows || []) {
  for (const sourceRid of row.source_rids || []) {
    const group = groups.get(sourceRid) || {
      source_rid: sourceRid,
      source_rid_prefix: ridPrefix(sourceRid),
      queue_ids: new Set(),
      token_ids: new Set(),
      lexicon_entry_ids: new Set(),
      surfaces: new Set(),
      normalized_forms: new Set(),
      source_families: new Set(),
      partitions: new Set(),
      triage_groups: new Set(),
      blocker_ids: new Set(),
      occurrence_total: 0,
      reference_count: 0,
      rows_missing_source_citation: 0,
      rows_missing_transform_rule: 0,
      rows_agent6_boundary_required: 0,
      rows_route_recheck_required: 0,
      rows_gate_proof_boundary_chain_missing: 0,
      rows_gate_proof_source_citation_dependency_missing: 0,
    };

    group.queue_ids.add(row.queue_id);
    group.token_ids.add(row.token_id);
    group.lexicon_entry_ids.add(row.lexicon_entry_id);
    group.surfaces.add(row.surface);
    group.normalized_forms.add(row.normalized);
    for (const sourceFamily of row.source_families || []) group.source_families.add(sourceFamily);
    group.partitions.add(row.partition);
    group.triage_groups.add(row.triage_group);
    for (const blockerId of row.current_blocker_ids || []) group.blocker_ids.add(blockerId);
    group.occurrence_total += Number(row.occurrences || 0);
    group.reference_count += 1;
    if (row.source_citation_missing) group.rows_missing_source_citation += 1;
    if (row.transform_rule_missing) group.rows_missing_transform_rule += 1;
    if (row.agent6_boundary_required_before_next_use) group.rows_agent6_boundary_required += 1;
    if (row.route_recheck_required) group.rows_route_recheck_required += 1;
    if (row.gate_proof_boundary_chain_missing) group.rows_gate_proof_boundary_chain_missing += 1;
    if (row.gate_proof_source_citation_dependency_missing) group.rows_gate_proof_source_citation_dependency_missing += 1;
    groups.set(sourceRid, group);
  }
}

const sourceRidRows = [...groups.values()]
  .map((group) => ({
    row_id: `agent3-source-rid-blocker-${group.source_rid}`,
    source_rid: group.source_rid,
    source_rid_prefix: group.source_rid_prefix,
    queue_ids: [...group.queue_ids].sort(),
    queue_id_count: group.queue_ids.size,
    token_ids: [...group.token_ids].sort(),
    token_id_count: group.token_ids.size,
    lexicon_entry_ids: [...group.lexicon_entry_ids].sort(),
    lexicon_entry_id_count: group.lexicon_entry_ids.size,
    surfaces: [...group.surfaces].sort(),
    normalized_forms: [...group.normalized_forms].sort(),
    source_families: [...group.source_families].sort(),
    source_family_count: group.source_families.size,
    partitions: [...group.partitions].sort(),
    triage_groups: [...group.triage_groups].sort(),
    reference_count: group.reference_count,
    occurrence_total: group.occurrence_total,
    rows_missing_source_citation: group.rows_missing_source_citation,
    rows_missing_transform_rule: group.rows_missing_transform_rule,
    rows_agent6_boundary_required: group.rows_agent6_boundary_required,
    rows_route_recheck_required: group.rows_route_recheck_required,
    rows_gate_proof_boundary_chain_missing: group.rows_gate_proof_boundary_chain_missing,
    rows_gate_proof_source_citation_dependency_missing: group.rows_gate_proof_source_citation_dependency_missing,
    current_blocker_ids: [...group.blocker_ids].sort(),
    current_blocker_count: group.blocker_ids.size,
    source_citation_or_url_present: false,
    source_citation_missing: true,
    transform_rule_present: false,
    transform_rule_missing: true,
    evidence_role: 'source_rid_blocker_navigation_only_no_source_or_acceptance_claim',
    dedupe_key: sha256([group.source_rid, [...group.queue_ids].sort().join('|'), [...group.blocker_ids].sort().join('|')].join('|')),
  }))
  .sort((a, b) => a.source_rid.localeCompare(b.source_rid, 'en'));

const sourceRidPrefixes = new Set(sourceRidRows.map((row) => row.source_rid_prefix));
const multiQueueRows = sourceRidRows.filter((row) => row.queue_id_count > 1);
const maxQueueReferencesForRid = Math.max(...sourceRidRows.map((row) => row.queue_id_count));
const maxBlockersForRid = Math.max(...sourceRidRows.map((row) => row.current_blocker_count));

const counts = {
  source_rid_rows: sourceRidRows.length,
  source_rid_references: sourceRidRows.reduce((total, row) => total + row.reference_count, 0),
  unique_source_rids: sourceRidRows.length,
  source_rid_prefix_rows: sourceRidPrefixes.size,
  unique_queue_ids: new Set(sourceRidRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(sourceRidRows.flatMap((row) => row.token_ids)).size,
  source_rids_multi_queue: multiQueueRows.length,
  max_queue_references_for_source_rid: maxQueueReferencesForRid,
  blocker_links: sourceRidRows.reduce((total, row) => total + row.current_blocker_count, 0),
  max_blockers_for_source_rid: maxBlockersForRid,
  rows_missing_source_citation: sourceRidRows.filter((row) => row.source_citation_missing).length,
  rows_missing_transform_rule: sourceRidRows.filter((row) => row.transform_rule_missing).length,
  rows_agent6_boundary_required: sourceRidRows.filter((row) => row.rows_agent6_boundary_required > 0).length,
  rows_route_recheck_required: sourceRidRows.filter((row) => row.rows_route_recheck_required > 0).length,
  rows_gate_proof_boundary_chain_missing: sourceRidRows.filter(
    (row) => row.rows_gate_proof_boundary_chain_missing > 0,
  ).length,
  rows_gate_proof_source_citation_dependency_missing: sourceRidRows.filter(
    (row) => row.rows_gate_proof_source_citation_dependency_missing > 0,
  ).length,
  row_blocker_matrix_rows: Number(rowBlockerMatrix.counts?.row_blocker_matrix_rows || 0),
  row_blocker_matrix_occurrences: Number(rowBlockerMatrix.counts?.row_blocker_matrix_occurrences || 0),
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
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_source_rid_blocker_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_rid_blocker_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_rid_blocker_navigation_matrix',
  authority_boundary: {
    linkage_navigation_only: true,
    source_rid_blocker_matrix_only: true,
    source_rids_are_identifiers_not_source_text: true,
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
    row_blocker_matrix: options.rowBlockerMatrix,
    source_rid_continuity: options.sourceRidContinuity,
  },
  counts,
  source_rid_rows: sourceRidRows,
  downstream_handoff: {
    owner: 'Agent 1/Agent 2 source-citation enrichment; Agent 10 release/package intake',
    no_acceptance_claim: true,
    no_publication_claim: true,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(
  `Agent 3 source RID blocker matrix rows=${counts.source_rid_rows} refs=${counts.source_rid_references} multi=${counts.source_rids_multi_queue}`,
);

function writeReport(reportPath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-RID Blocker Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; source RIDs are identifiers, not source text, citation acceptance, or Definition authority.',
    '- This matrix links each source RID to affected queue IDs and current blockers for source-citation enrichment planning.',
    '',
    '## Counts',
    '',
    `- Source RID rows / references / prefixes: ${artifact.counts.source_rid_rows}/${artifact.counts.source_rid_references}/${artifact.counts.source_rid_prefix_rows}`,
    `- Unique queue IDs / token IDs: ${artifact.counts.unique_queue_ids}/${artifact.counts.unique_token_ids}`,
    `- Multi-queue source RIDs / max queue refs per RID: ${artifact.counts.source_rids_multi_queue}/${artifact.counts.max_queue_references_for_source_rid}`,
    `- Blocker links / max blockers per RID: ${artifact.counts.blocker_links}/${artifact.counts.max_blockers_for_source_rid}`,
    `- Missing citation / transform rule / Agent 6 boundary rows: ${artifact.counts.rows_missing_source_citation}/${artifact.counts.rows_missing_transform_rule}/${artifact.counts.rows_agent6_boundary_required}`,
    `- Gate-proof boundary-chain / source-citation-dependency missing rows: ${artifact.counts.rows_gate_proof_boundary_chain_missing}/${artifact.counts.rows_gate_proof_source_citation_dependency_missing}`,
    `- Candidate text / answer eligible / route writes / public mutation / release actions: ${artifact.counts.candidate_text_rows}/${artifact.counts.answer_eligible_rows}/${artifact.counts.route_shard_writes}/${artifact.counts.public_runtime_mutation}/${artifact.counts.release_actions}`,
    '',
    '## Sample Source RIDs',
    '',
    '| source_rid | prefix | queue_ids | references | blockers |',
    '| --- | --- | ---: | ---: | ---: |',
    ...artifact.source_rid_rows
      .slice(0, 12)
      .map((row) =>
        [
          row.source_rid,
          row.source_rid_prefix,
          row.queue_id_count,
          row.reference_count,
          row.current_blocker_count,
        ].join(' | '),
      ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.owner}`,
    '- Stop condition: source-RID blocker matrix emitted; no broad discovery, source text read, text output, route delivery, or acceptance action taken.',
  ];
  writeText(reportPath, lines.join('\n') + '\n');
}

function ridPrefix(sourceRid) {
  const match = String(sourceRid).match(/^[A-Za-z]+/);
  return match ? match[0] : 'UNKNOWN';
}

function assertArtifact(artifact, expectedType, artifactPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${artifactPath} artifact_type mismatch; expected ${expectedType}`);
  }
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_rid_blocker_matrix.mjs [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, content) {
  const target = path.resolve(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
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

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
