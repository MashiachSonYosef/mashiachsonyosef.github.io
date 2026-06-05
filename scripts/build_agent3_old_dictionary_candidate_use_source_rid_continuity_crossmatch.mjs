#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  candidateUsePackage: 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  continuityCrossmatch: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
  ridNamespaceInventory: 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-2026-06-05.json',
  citationMetadataCustody: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  citationMetadataVerdict:
    'reports/agent6-old-dictionary-public-domain-citation-metadata-custody-boundary-verdict-2026-06-05.json',
  output: 'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const candidateUsePackage = readJson(options.candidateUsePackage);
const continuityCrossmatch = readJson(options.continuityCrossmatch);
const ridNamespaceInventory = readJson(options.ridNamespaceInventory);
const citationMetadataCustody = readJson(options.citationMetadataCustody);
const citationMetadataVerdict = readJson(options.citationMetadataVerdict);

assertArtifact(candidateUsePackage, 'agent2_old_dictionary_morphology_candidate_use_package', options.candidateUsePackage);
assertArtifact(
  continuityCrossmatch,
  'agent3_old_dictionary_candidate_use_continuity_crossmatch',
  options.continuityCrossmatch,
);
assertArtifact(
  ridNamespaceInventory,
  'agent1_old_dictionary_public_domain_rid_namespace_inventory',
  options.ridNamespaceInventory,
);
assertArtifact(
  citationMetadataCustody,
  'agent1_old_dictionary_public_domain_citation_metadata_custody',
  options.citationMetadataCustody,
);

const metadataByTokenId = new Map(
  (citationMetadataCustody.public_domain_metadata_rows || []).map((row) => [row.token_id, row]),
);
const namespaceByPrefix = new Map(
  (ridNamespaceInventory.rid_namespace_rows || []).map((row) => [row.rid_prefix, row]),
);
const continuityByTokenId = new Map((continuityCrossmatch.rows || []).map((row) => [row.token_id, row]));

const candidateRows = (candidateUsePackage.rows || []).map((row) => buildCandidateRow(row));
const sourceRidRefs = candidateRows.flatMap((row) => row.source_rids);
const uniqueSourceRids = unique(sourceRidRefs);
const candidatePrefixes = unique(sourceRidRefs.map(ridPrefix));
const namespacePrefixes = unique((ridNamespaceInventory.rid_namespace_rows || []).map((row) => row.rid_prefix));
const prefixRows = candidatePrefixes.map((prefix) => buildPrefixRow(prefix));
const rowsWithCitationMetadata = candidateRows.filter((row) => row.citation_metadata_status === 'agent1_metadata_row_present');
const rowsWithAllSourceRidsInMetadata = candidateRows.filter((row) => row.missing_source_rids_in_agent1_metadata.length === 0);
const prefixesMissingNamespace = candidatePrefixes.filter((prefix) => !namespaceByPrefix.has(prefix));
const namespacePrefixesUnusedByCandidatePackage = namespacePrefixes.filter((prefix) => !candidatePrefixes.includes(prefix));

const counts = {
  candidate_use_rows: candidateRows.length,
  candidate_use_occurrences: sum(candidateRows, (row) => row.occurrences),
  unique_queue_ids: new Set(candidateRows.map((row) => row.queue_id)).size,
  unique_token_ids: new Set(candidateRows.map((row) => row.token_id)).size,
  duplicate_queue_ids: duplicateValues(candidateRows.map((row) => row.queue_id)).length,
  duplicate_token_ids: duplicateValues(candidateRows.map((row) => row.token_id)).length,
  source_rid_references: sourceRidRefs.length,
  unique_source_rids: uniqueSourceRids.length,
  source_rid_prefix_rows: prefixRows.length,
  rid_namespace_inventory_prefix_rows: namespacePrefixes.length,
  rid_namespace_inventory_unique_rids: Number(ridNamespaceInventory.inventory_counts?.unique_rid_count || 0),
  rows_with_agent1_citation_metadata: rowsWithCitationMetadata.length,
  rows_missing_agent1_citation_metadata: candidateRows.length - rowsWithCitationMetadata.length,
  rows_with_all_source_rids_in_agent1_metadata: rowsWithAllSourceRidsInMetadata.length,
  rows_with_missing_source_rids_in_agent1_metadata: candidateRows.length - rowsWithAllSourceRidsInMetadata.length,
  source_rid_prefixes_missing_namespace: prefixesMissingNamespace.length,
  namespace_prefixes_unused_by_candidate_package: namespacePrefixesUnusedByCandidatePackage.length,
  row_overlap_sample_linked_rows: candidateRows.filter(
    (row) => row.row_overlap_sample_status === 'sample_linked_to_row_overlap_bucket',
  ).length,
  row_overlap_sample_unlinked_rows: candidateRows.filter(
    (row) => row.row_overlap_sample_status !== 'sample_linked_to_row_overlap_bucket',
  ).length,
  agent6_verdict_loaded: citationMetadataVerdict.disposition ? 1 : 0,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'source-RID continuity crossmatch for old-dictionary candidate-use planning rows',
  inputs: {
    candidate_use_package: options.candidateUsePackage,
    continuity_crossmatch: options.continuityCrossmatch,
    rid_namespace_inventory: options.ridNamespaceInventory,
    citation_metadata_custody: options.citationMetadataCustody,
    citation_metadata_verdict: options.citationMetadataVerdict,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    source_rid_identifier_only: true,
    citation_metadata_presence_only: true,
    candidate_use_planning_evidence_only: true,
    source_text_read: false,
    source_ref_text_export: false,
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
  source_rid_prefix_rows: prefixRows,
  namespace_prefixes_unused_by_candidate_package: namespacePrefixesUnusedByCandidatePackage,
  candidate_rows: candidateRows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    agent6_citation_metadata_disposition: citationMetadataVerdict.disposition || '',
    exact_blockers_preserved: citationMetadataVerdict.exact_blockers_preserved || [],
    stop_condition:
      'Use this source-RID crossmatch as identifier/provenance navigation only. Do not emit source refs, source text, candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this matrix.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 source-RID continuity crossmatch candidate_rows=${counts.candidate_use_rows} rid_refs=${counts.source_rid_references} unique_rids=${counts.unique_source_rids} prefixes=${counts.source_rid_prefix_rows} metadata_rows=${counts.rows_with_agent1_citation_metadata}`,
);

function buildCandidateRow(row) {
  const metadata = metadataByTokenId.get(row.token_id) || null;
  const metadataRids = new Set(metadata?.public_domain_rids || []);
  const continuity = continuityByTokenId.get(row.token_id) || null;
  const sourceRids = row.source_rids || [];
  return {
    row_id: `agent3-candidate-use-source-rid-${row.queue_id}`,
    queue_id: row.queue_id || '',
    token_id: row.token_id || '',
    lexicon_entry_id: row.lexicon_entry_id || null,
    occurrences: Number(row.occurrences || 0),
    source_families: row.source_family || [],
    source_rids: sourceRids,
    source_rid_count: sourceRids.length,
    unique_source_rid_count: new Set(sourceRids).size,
    source_rid_prefixes: unique(sourceRids.map(ridPrefix)),
    citation_metadata_status: metadata ? 'agent1_metadata_row_present' : 'missing_agent1_metadata_row',
    agent1_metadata_public_domain_rid_count: Number(metadata?.public_domain_rid_count || 0),
    agent1_metadata_public_domain_refs_count: Number(metadata?.public_domain_refs_count || 0),
    all_source_rids_in_agent1_metadata: sourceRids.every((sourceRid) => metadataRids.has(sourceRid)),
    missing_source_rids_in_agent1_metadata: sourceRids.filter((sourceRid) => !metadataRids.has(sourceRid)),
    row_overlap_sample_status: continuity?.row_overlap_sample_status || 'missing_agent3_continuity_row',
    row_overlap_sample_bucket: continuity?.row_overlap_sample_bucket || null,
    evidence_role: 'source_rid_identifier_continuity_navigation_only',
    downstream_transform_status:
      'blocked_pending_exact_agent1_agent6_boundary_fields_no_text_or_route_output',
    dedupe_key: sha256([row.queue_id || '', row.token_id || '', sourceRids.join('+')].join('|')),
  };
}

function buildPrefixRow(prefix) {
  const rows = candidateRows.filter((row) => row.source_rid_prefixes.includes(prefix));
  const sourceRids = rows.flatMap((row) => row.source_rids.filter((sourceRid) => ridPrefix(sourceRid) === prefix));
  const namespaceRow = namespaceByPrefix.get(prefix) || null;
  return {
    row_id: `agent3-candidate-use-source-rid-prefix-${prefix}`,
    rid_prefix: prefix,
    namespace_row_present: namespaceRow !== null,
    namespace_license_lane: namespaceRow?.license_lane || null,
    candidate_rows: rows.length,
    candidate_occurrences: sum(rows, (row) => row.occurrences),
    source_rid_references: sourceRids.length,
    unique_source_rids: new Set(sourceRids).size,
    namespace_row_count: Number(namespaceRow?.row_count || 0),
    namespace_rid_occurrence_count: Number(namespaceRow?.rid_occurrence_count || 0),
    namespace_unique_rid_count: Number(namespaceRow?.unique_rid_count || 0),
    namespace_prefix_not_source_family_proof: namespaceRow?.prefix_not_source_family_proof === true,
    queue_id_sample: rows.slice(0, 10).map((row) => row.queue_id),
    token_id_sample: rows.slice(0, 10).map((row) => row.token_id),
    status: namespaceRow
      ? 'source_rid_prefix_namespace_linked_navigation_only'
      : 'exact_blocker_missing_source_rid_prefix_namespace_row',
    dedupe_key: sha256([prefix, rows.length, sourceRids.length].join('|')),
  };
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
    'source_ref_text',
    'accepted_text',
    'display_text',
    'route_payload',
    'public_domain_headwords',
    'public_domain_refs_sample',
  ]);
  let count = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) count += 1;
  });
  return count;
}

function ridPrefix(sourceRid) {
  return (String(sourceRid || '').match(/^[A-Z]+/) || [''])[0];
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

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function sum(values, callback) {
  return values.reduce((total, value) => total + Number(callback(value) || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function writeMarkdown(relativePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-RID Continuity Crossmatch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${options.output}\``,
    `- Status: \`${data.status}\``,
    `- Candidate rows / occurrences: ${data.counts.candidate_use_rows} / ${data.counts.candidate_use_occurrences}`,
    `- Source RID references / unique RIDs: ${data.counts.source_rid_references} / ${data.counts.unique_source_rids}`,
    `- Candidate RID prefixes / namespace prefixes: ${data.counts.source_rid_prefix_rows} / ${data.counts.rid_namespace_inventory_prefix_rows}`,
    `- Rows with Agent 1 citation metadata / all RIDs in metadata: ${data.counts.rows_with_agent1_citation_metadata} / ${data.counts.rows_with_all_source_rids_in_agent1_metadata}`,
    `- Prefixes missing namespace / namespace prefixes unused: ${data.counts.source_rid_prefixes_missing_namespace} / ${data.counts.namespace_prefixes_unused_by_candidate_package}`,
    '',
    '## Source RID Prefixes',
    '',
    '| prefix | candidate rows | RID refs | unique RIDs | namespace row | status |',
    '|---|---:|---:|---:|---|---|',
    ...data.source_rid_prefix_rows.map(
      (row) =>
        `| ${mdCell(row.rid_prefix)} | ${row.candidate_rows} | ${row.source_rid_references} | ${row.unique_source_rids} | ${row.namespace_row_present} | ${mdCell(row.status)} |`,
    ),
    '',
    '## Boundary',
    '',
    '- Source-RID identifier/provenance navigation only.',
    '- RID prefixes are metadata and are not source-family proof, definition text, or answer authority.',
    '- This matrix intentionally omits headwords, source-reference text, candidate text, definitions, lemma content, reader hints, accepted text, answer rows, route writes, public/runtime changes, commercial export, and release actions.',
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
    else if (arg.startsWith('--continuity-crossmatch=')) parsed.continuityCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--rid-namespace-inventory=')) parsed.ridNamespaceInventory = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--citation-metadata-custody=')) parsed.citationMetadataCustody = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--citation-metadata-verdict=')) parsed.citationMetadataVerdict = cleanRelativePath(valueAfterEquals(arg));
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
