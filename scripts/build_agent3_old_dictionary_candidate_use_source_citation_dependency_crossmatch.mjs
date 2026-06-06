#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  rowLineageMatrix: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
  boundaryChainCrossmatch: 'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.json',
  agent10SourceCitationWorkset:
    'reports/agent10-agent1-ready-old-dictionary-78-row-source-citation-enrichment-workset-2026-06-06.json',
  agent10SourceCitationRouteBlocker:
    'reports/agent10-agent1-old-dictionary-78-row-source-citation-enrichment-live-route-blocker-2026-06-06.json',
  agent2SourceCitationDependencyCheck:
    'reports/agent2-old-dictionary-78-row-source-citation-dependency-check-2026-06-06.json',
  agent2SourceCitationDependencyValidation:
    'reports/agent2-old-dictionary-78-row-source-citation-dependency-check-validation-result-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const rowLineageMatrix = readJson(options.rowLineageMatrix);
const boundaryChainCrossmatch = readJson(options.boundaryChainCrossmatch);
const agent10SourceCitationWorkset = readJson(options.agent10SourceCitationWorkset);
const agent10SourceCitationRouteBlocker = readJson(options.agent10SourceCitationRouteBlocker);
const agent2SourceCitationDependencyCheck = readJson(options.agent2SourceCitationDependencyCheck);
const agent2SourceCitationDependencyValidation = readJson(options.agent2SourceCitationDependencyValidation);

assertArtifact(rowLineageMatrix, 'agent3_old_dictionary_candidate_use_row_lineage_matrix', options.rowLineageMatrix);
assertArtifact(
  boundaryChainCrossmatch,
  'agent3_old_dictionary_candidate_use_boundary_chain_crossmatch',
  options.boundaryChainCrossmatch,
);
assertArtifact(
  agent10SourceCitationWorkset,
  'agent10_agent1_ready_old_dictionary_78_row_source_citation_enrichment_workset',
  options.agent10SourceCitationWorkset,
);
assertArtifact(
  agent10SourceCitationRouteBlocker,
  'agent10_agent1_old_dictionary_78_row_source_citation_enrichment_live_route_blocker',
  options.agent10SourceCitationRouteBlocker,
);
assertArtifact(
  agent2SourceCitationDependencyCheck,
  'agent2_old_dictionary_78_row_source_citation_dependency_check',
  options.agent2SourceCitationDependencyCheck,
);
assertArtifact(
  agent2SourceCitationDependencyValidation,
  'agent2_old_dictionary_78_row_source_citation_dependency_check_validation_result',
  options.agent2SourceCitationDependencyValidation,
);

const lineageRows = rowLineageMatrix.row_lineage || [];
const boundaryRows = boundaryChainCrossmatch.row_crossmatch || [];
const boundaryByQueueId = new Map(boundaryRows.map((row) => [row.queue_id, row]));
const workset = agent10SourceCitationWorkset.workset || {};
const dependencyStatus = agent2SourceCitationDependencyCheck.dependency_status || {};
const dependencyCounts = agent2SourceCitationDependencyCheck.lane_counts_rows_consumed || {};
const validationCounts = agent2SourceCitationDependencyValidation.validated_counts || {};
const exactBlockers = unique([
  ...(agent2SourceCitationDependencyCheck.exact_blockers || []),
  ...(agent2SourceCitationDependencyValidation.validated_blockers || []),
]);

const rowDependencyRows = lineageRows
  .slice()
  .sort((left, right) => partitionRank(left.partition) - partitionRank(right.partition) || right.occurrences - left.occurrences)
  .map((lineageRow) => buildRowDependency(lineageRow));
const sourceFamilyRows = buildSourceFamilyRows(rowDependencyRows);
const sourceRidPrefixRows = buildSourceRidPrefixRows(rowDependencyRows);
const blockerRows = exactBlockers.map((blocker, index) => ({
  row_id: `agent3-source-citation-dependency-blocker-${index + 1}`,
  exact_blocker: blocker,
  affected_rows: rowDependencyRows.length,
  affected_occurrences: sum(rowDependencyRows, (row) => row.occurrences),
  status: 'observed_external_dependency_blocker_no_agent3_acceptance',
  dedupe_key: sha256([blocker, index].join('|')),
}));

const counts = {
  row_dependency_rows: rowDependencyRows.length,
  row_dependency_occurrences: sum(rowDependencyRows, (row) => row.occurrences),
  boundary_chain_rows_linked: rowDependencyRows.filter((row) => row.boundary_chain_link_status === 'linked').length,
  boundary_chain_rows_missing: rowDependencyRows.filter((row) => row.boundary_chain_link_status !== 'linked').length,
  agent10_workset_rows: Number(workset.rows || 0),
  agent10_workset_occurrences: Number(workset.occurrences || 0),
  agent2_dependency_rows: Number(dependencyCounts.rows || 0),
  agent2_dependency_occurrences: Number(dependencyCounts.occurrences || 0),
  agent2_validation_rows: Number(validationCounts.rows || 0),
  agent2_validation_occurrences: Number(validationCounts.occurrences || 0),
  row_count_mismatch: Number(workset.rows || 0) === rowDependencyRows.length &&
    Number(dependencyCounts.rows || 0) === rowDependencyRows.length &&
    Number(validationCounts.rows || 0) === rowDependencyRows.length
    ? 0
    : 1,
  occurrence_count_mismatch: Number(workset.occurrences || 0) === sum(rowDependencyRows, (row) => row.occurrences) &&
    Number(dependencyCounts.occurrences || 0) === sum(rowDependencyRows, (row) => row.occurrences) &&
    Number(validationCounts.occurrences || 0) === sum(rowDependencyRows, (row) => row.occurrences)
    ? 0
    : 1,
  source_citation_supplied_rows: dependencyStatus.source_citation_or_url_supplied_now === true ? rowDependencyRows.length : 0,
  source_citation_missing_rows: dependencyStatus.source_citation_or_url_supplied_now === true ? 0 : rowDependencyRows.length,
  transform_rule_supplied_rows: dependencyStatus.transform_rule_supplied_now === true ? rowDependencyRows.length : 0,
  transform_rule_missing_rows: dependencyStatus.transform_rule_supplied_now === true ? 0 : rowDependencyRows.length,
  source_family_rows: sourceFamilyRows.length,
  source_family_memberships: sum(rowDependencyRows, (row) => row.source_families.length),
  source_rid_references: sum(rowDependencyRows, (row) => row.source_rid_count),
  unique_source_rids: new Set(rowDependencyRows.flatMap((row) => row.source_rids)).size,
  source_rid_prefix_rows: sourceRidPrefixRows.length,
  exact_blocker_rows: blockerRows.length,
  stale_agent1_route_blocker_rows: dependencyStatus.agent10_agent1_route_blocker ? 1 : 0,
  transform_ready_rows: 0,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'crossmatch Agent 3 row/source-RID lineage against the Agent 10 source-citation workset and Agent 2 source-citation dependency blockers for the old-dictionary 78-row lane',
  inputs: {
    row_lineage_matrix: options.rowLineageMatrix,
    boundary_chain_crossmatch: options.boundaryChainCrossmatch,
    agent10_source_citation_workset: options.agent10SourceCitationWorkset,
    agent10_source_citation_route_blocker: options.agent10SourceCitationRouteBlocker,
    agent2_source_citation_dependency_check: options.agent2SourceCitationDependencyCheck,
    agent2_source_citation_dependency_validation: options.agent2SourceCitationDependencyValidation,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    source_citation_dependency_crossmatch_only: true,
    source_rid_identifier_continuity_only: true,
    external_dependency_status_observation_only: true,
    source_citation_supplied_by_agent3: false,
    source_provenance_acceptance: false,
    source_license_acceptance: false,
    source_legal_acceptance: false,
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
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  counts,
  dependency_summary: {
    missing_field_to_supply: workset.missing_field_to_supply || '',
    agent10_workset_status: dependencyStatus.agent10_agent1_workset_status || agent10SourceCitationWorkset.status || '',
    agent1_route_blocker: dependencyStatus.agent10_agent1_route_blocker || agent10SourceCitationRouteBlocker.exact_blocker || '',
    route_attempt_result: agent10SourceCitationRouteBlocker.live_route_attempt?.result || '',
    agent2_transform_matrix_still_blocked: Boolean(dependencyStatus.agent2_transform_matrix_still_blocked),
    remaining_agent2_blocker: dependencyStatus.remaining_agent2_blocker || '',
    source_citation_or_url_supplied_now: Boolean(dependencyStatus.source_citation_or_url_supplied_now),
    transform_rule_supplied_now: Boolean(dependencyStatus.transform_rule_supplied_now),
  },
  blocker_rows: blockerRows,
  source_family_rows: sourceFamilyRows,
  source_rid_prefix_rows: sourceRidPrefixRows,
  row_dependency_rows: rowDependencyRows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_citation_owner: 'Agent 1',
    coordination_owner_for_stale_route: 'Agent 5 / coordination',
    transform_owner_after_exact_dependency: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_current_blocker:
      'missing_source_citation_or_url_for_78_row_subset_and_missing_transform_output_proposal_matrix_or_exact_transform_rule',
    stop_condition:
      'Use this source-citation dependency crossmatch only to navigate Agent 3 row/source-RID linkage against Agent 10/Agent 2 dependency blockers. It does not supply source citations, transform rules, candidate text, definition or lemma content, answer eligibility, route writes, source/license/legal acceptance, QA acceptance, public/runtime mutation, accepted text, export, publication readiness, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 source citation dependency rows=${counts.row_dependency_rows} missing_citation=${counts.source_citation_missing_rows} blockers=${counts.exact_blocker_rows}`,
);

function buildRowDependency(lineageRow) {
  const boundaryRow = boundaryByQueueId.get(lineageRow.queue_id) || null;
  return {
    row_id: `agent3-source-citation-dependency-${lineageRow.queue_id}`,
    queue_id: lineageRow.queue_id,
    token_id: lineageRow.token_id,
    lexicon_entry_id: lineageRow.lexicon_entry_id,
    occurrences: Number(lineageRow.occurrences || 0),
    partition: lineageRow.partition,
    triage_group: lineageRow.triage_group,
    source_license_lane: lineageRow.license_lane,
    source_families: lineageRow.source_families,
    source_rids: lineageRow.source_rids,
    source_rid_count: Number(lineageRow.source_rid_count || 0),
    source_rid_prefixes: lineageRow.source_rid_prefixes,
    exact_lineage_blocker: lineageRow.exact_blocker,
    boundary_chain_link_status: boundaryRow ? 'linked' : 'missing',
    dependency_status: 'source_citation_or_url_missing_and_transform_rule_missing_observed_only',
    agent1_route_blocker: dependencyStatus.agent10_agent1_route_blocker || '',
    source_citation_supplied_by_agent3: false,
    source_acceptance_claimed_by_agent3: false,
    agent6_boundary_required: true,
    evidence_role: 'source_citation_dependency_navigation_only_no_source_or_transform_authority',
    dedupe_key: sha256([lineageRow.queue_id, lineageRow.token_id, lineageRow.partition].join('|')),
  };
}

function buildSourceFamilyRows(rows) {
  const grouped = groupByMany(rows, (row) => row.source_families);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceFamily, familyRows]) => ({
      row_id: `agent3-source-citation-dependency-family-${slug(sourceFamily)}`,
      source_family: sourceFamily,
      candidate_rows: familyRows.length,
      candidate_occurrences: sum(familyRows, (row) => row.occurrences),
      source_rid_references: sum(familyRows, (row) => sourceRidsForFamily(row, sourceFamily).length),
      unique_source_rids: new Set(familyRows.flatMap((row) => sourceRidsForFamily(row, sourceFamily))).size,
      status: 'source_family_dependency_navigation_only_missing_row_level_citation_or_exact_blocker',
      dedupe_key: sha256([sourceFamily, familyRows.length].join('|')),
    }));
}

function buildSourceRidPrefixRows(rows) {
  const grouped = groupByMany(rows, (row) => row.source_rid_prefixes);
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([prefix, prefixRows]) => ({
      row_id: `agent3-source-citation-dependency-rid-prefix-${slug(prefix)}`,
      source_rid_prefix: prefix,
      candidate_rows: prefixRows.length,
      candidate_occurrences: sum(prefixRows, (row) => row.occurrences),
      source_rid_references: sum(prefixRows, (row) => row.source_rids.filter((rid) => rid.startsWith(prefix)).length),
      unique_source_rids: new Set(prefixRows.flatMap((row) => row.source_rids.filter((rid) => rid.startsWith(prefix)))).size,
      status: 'source_rid_prefix_dependency_navigation_only_missing_row_level_citation_or_exact_blocker',
      dedupe_key: sha256([prefix, prefixRows.length].join('|')),
    }));
}

function sourceRidsForFamily(row, sourceFamily) {
  if (sourceFamily.includes('BDB Aramaic')) return row.source_rids.filter((rid) => rid.startsWith('BDBA'));
  if (sourceFamily.includes('BDB')) return row.source_rids.filter((rid) => rid.startsWith('BDB') && !rid.startsWith('BDBA'));
  if (sourceFamily.includes('Jastrow')) return row.source_rids.filter((rid) => !rid.startsWith('BDB'));
  return [];
}

function writeMarkdown(outputPath, artifact) {
  const rows = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Citation Dependency Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: linkage/dependency navigation only; no source citation supplied, source/license/legal acceptance, transform output, definition authority, accepted text, public/runtime mutation, export, publication readiness, or release action.',
    '',
    '## Counts',
    '',
    `- Row dependency rows / occurrences: ${artifact.counts.row_dependency_rows}/${artifact.counts.row_dependency_occurrences}`,
    `- Agent 10 workset / Agent 2 dependency / validation rows: ${artifact.counts.agent10_workset_rows}/${artifact.counts.agent2_dependency_rows}/${artifact.counts.agent2_validation_rows}`,
    `- Source citation supplied / missing rows: ${artifact.counts.source_citation_supplied_rows}/${artifact.counts.source_citation_missing_rows}`,
    `- Transform rule supplied / missing rows: ${artifact.counts.transform_rule_supplied_rows}/${artifact.counts.transform_rule_missing_rows}`,
    `- Source families / memberships / RID refs / unique RIDs / prefixes: ${artifact.counts.source_family_rows}/${artifact.counts.source_family_memberships}/${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.source_rid_prefix_rows}`,
    `- Exact blocker rows / stale Agent 1 route blocker rows: ${artifact.counts.exact_blocker_rows}/${artifact.counts.stale_agent1_route_blocker_rows}`,
    `- Row / occurrence mismatches: ${artifact.counts.row_count_mismatch}/${artifact.counts.occurrence_count_mismatch}`,
    `- Source acceptance claims / transform-ready / forbidden payload / acceptance claims: ${artifact.counts.source_acceptance_claims}/${artifact.counts.transform_ready_rows || 0}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Dependency Summary',
    '',
    `- Missing field: \`${artifact.dependency_summary.missing_field_to_supply}\``,
    `- Agent 1 route blocker: \`${artifact.dependency_summary.agent1_route_blocker}\``,
    `- Route attempt result: ${artifact.dependency_summary.route_attempt_result}`,
    `- Remaining Agent 2 blocker: \`${artifact.dependency_summary.remaining_agent2_blocker}\``,
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];

  fs.writeFileSync(path.resolve(root, outputPath), `${rows.join('\n')}\n`);
}

function countForbiddenPayloadKeys(value) {
  let hits = 0;
  walk(value, (key, child, parentKey) => {
    if (parentKey === 'authority_boundary') return;
    if (
      [
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
        'public_domain_rids',
        'source_headwords',
      ].includes(key)
    ) {
      hits += 1;
    }
  });
  return hits;
}

function walk(value, callback, parentKey = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback, parentKey);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child, parentKey);
    walk(child, callback, key);
  }
}

function groupByMany(rows, keyFn) {
  const grouped = new Map();
  for (const row of rows) {
    for (const key of keyFn(row)) {
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    }
  }
  return grouped;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function partitionRank(partition) {
  return partition === 'pure_commercial_workset' ? 0 : partition === 'overlap_workset' ? 1 : 99;
}

function sum(rows, valueFn) {
  return rows.reduce((total, row) => total + Number(valueFn(row) || 0), 0);
}

function slug(value) {
  return String(value || 'missing')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assertArtifact(value, artifactType, filePath) {
  if (value.artifact_type !== artifactType) {
    throw new Error(`${filePath} artifact_type mismatch: expected ${artifactType}; got ${value.artifact_type || 'missing'}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function writeJson(outputPath, value) {
  fs.writeFileSync(path.resolve(root, outputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1 ? '' : arg.slice(index + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--row-lineage-matrix=')) parsed.rowLineageMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--boundary-chain-crossmatch=')) {
      parsed.boundaryChainCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-source-citation-workset=')) {
      parsed.agent10SourceCitationWorkset = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-source-citation-route-blocker=')) {
      parsed.agent10SourceCitationRouteBlocker = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent2-source-citation-dependency-check=')) {
      parsed.agent2SourceCitationDependencyCheck = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent2-source-citation-dependency-validation=')) {
      parsed.agent2SourceCitationDependencyValidation = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}
