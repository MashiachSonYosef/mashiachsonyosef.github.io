#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  citationCustody: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  refGapManifest: 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json',
  sourceFamilyMembership: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_public_domain_rid_namespace_inventory.mjs',
  validatorResult: 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-validation-result-2026-06-05.json'
};

const forbiddenFields = ['surface', 'normalized', 'definition', 'gloss', 'answer', 'candidate_text', 'definition_text'];
const publicFamilies = ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary'];

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ridPrefix(rid) {
  const match = String(rid).match(/^[A-Za-z]+/);
  return match ? match[0] : 'no_alpha_prefix';
}

const preview = readJson(paths.preview);
const citationCustody = readJson(paths.citationCustody);
const refGap = readJson(paths.refGapManifest);
const sourceMembership = readJson(paths.sourceFamilyMembership);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert(citationCustody.citation_coverage_counts?.public_domain_rid_total === 1276, 'citation custody RID total mismatch');
assert(refGap.gap_counts?.rows_without_ref_samples_or_ref_count === 93, 'ref gap row count mismatch');
assert(sourceMembership.source_family_manifests?.length === 5, 'source family membership count mismatch');

const publicRows = (preview.rows || []).filter((row) => (row.public_domain_lexicons || []).length > 0);
const prefixMap = new Map();

for (const row of publicRows) {
  for (const rid of row.public_domain_rids || []) {
    const prefix = ridPrefix(rid);
    if (!prefixMap.has(prefix)) {
      prefixMap.set(prefix, {
        rid_prefix: prefix,
        rid_occurrence_count: 0,
        row_token_ids: new Set(),
        unique_rids: new Set(),
        source_family_counts: Object.fromEntries(publicFamilies.map((family) => [family, 0]))
      });
    }
    const entry = prefixMap.get(prefix);
    entry.rid_occurrence_count += 1;
    entry.row_token_ids.add(row.token_id);
    entry.unique_rids.add(rid);
    for (const family of publicFamilies) {
      if ((row.public_domain_lexicons || []).includes(family)) {
        entry.source_family_counts[family] += 1;
      }
    }
  }
}

const namespaceRows = [...prefixMap.values()]
  .sort((left, right) => {
    if (right.rid_occurrence_count !== left.rid_occurrence_count) return right.rid_occurrence_count - left.rid_occurrence_count;
    return left.rid_prefix.localeCompare(right.rid_prefix);
  })
  .map((entry) => {
    const tokenIds = [...entry.row_token_ids];
    const uniqueRids = [...entry.unique_rids].sort();
    return {
      rid_prefix: entry.rid_prefix,
      license_lane: 'commercial_clean_candidate',
      row_count: tokenIds.length,
      rid_occurrence_count: entry.rid_occurrence_count,
      unique_rid_count: uniqueRids.length,
      token_ids: tokenIds,
      token_ids_sha256: sha256(tokenIds.join('\n')),
      unique_rids: uniqueRids,
      unique_rids_sha256: sha256(uniqueRids.join('\n')),
      source_family_counts: entry.source_family_counts,
      prefix_not_source_family_proof: true,
      candidate_text_rows_now: 0,
      agent6_delivery_now: 0
    };
  });

const allRidOccurrences = [];
for (const row of publicRows) {
  for (const rid of row.public_domain_rids || []) {
    allRidOccurrences.push(`${row.token_id}:${rid}`);
  }
}

const inventoryCounts = {
  public_domain_rows: publicRows.length,
  public_domain_occurrences: publicRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  rid_namespace_count: namespaceRows.length,
  unique_rid_count: new Set(publicRows.flatMap((row) => row.public_domain_rids || [])).size,
  rid_occurrence_count: publicRows.reduce((sum, row) => sum + (row.public_domain_rids || []).length, 0),
  bdb_prefix_rows: namespaceRows.find((row) => row.rid_prefix === 'BDB')?.row_count || 0,
  bdba_prefix_rows: namespaceRows.find((row) => row.rid_prefix === 'BDBA')?.row_count || 0,
  single_letter_prefix_count: namespaceRows.filter((row) => row.rid_prefix.length === 1).length,
  rows_with_no_public_domain_rids: publicRows.filter((row) => (row.public_domain_rids || []).length === 0).length,
  rid_occurrences_sha256: sha256(allRidOccurrences.join('\n')),
  delivered_to_agent6_now: 0,
  allowed_transform_rows_now: 0,
  candidate_text_rows_now: 0
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_public_domain_rid_namespace_inventory',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_public_domain_rid_namespace_inventory.mjs',
  status: 'public_domain_rid_namespace_inventory_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit public-domain RID namespace inventory',
  purpose: 'Record RID namespace inventory for public-domain metadata rows and preserve the blocker that RID prefixes are not sufficient source-family custody proof.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  inventory_counts: inventoryCounts,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      row_count: inventoryCounts.public_domain_rows,
      occurrence_count: inventoryCounts.public_domain_occurrences,
      rid_namespace_count: inventoryCounts.rid_namespace_count,
      unique_rid_count: inventoryCounts.unique_rid_count,
      candidate_text_rows_now: 0,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      row_count: 0,
      occurrence_count: 0,
      note: 'NC rows remain preserved in NC-specific artifacts; this packet is public-domain RID metadata only.'
    },
    {
      license_lane: 'metadata_or_link_only',
      row_count: 0,
      occurrence_count: 0
    },
    {
      license_lane: 'blocked_or_needs_review',
      row_count: 0,
      occurrence_count: 0,
      note: 'BDB Augmented Strong remains blocked/review in separate artifacts.'
    }
  ],
  rid_namespace_rows: namespaceRows,
  exact_blockers: [
    {
      blocker: 'rid_prefixes_are_metadata_not_source_family_custody_proof',
      rows: inventoryCounts.public_domain_rows,
      rid_namespace_count: inventoryCounts.rid_namespace_count,
      handoff_owner: 'Agent 6 for future source-family boundary; Agent 2 blocked now'
    },
    {
      blocker: 'rid_namespace_inventory_is_not_definition_or_candidate_text',
      rows: inventoryCounts.public_domain_rows,
      rid_occurrence_count: inventoryCounts.rid_occurrence_count,
      handoff_owner: 'Agent 1 preserves metadata custody only'
    }
  ],
  handoff_owner: {
    agent2: 'May not transform RID namespace metadata into candidate text now.',
    agent6: 'RID namespace metadata is recorded for future source-family custody boundary; delivered_to_agent6_now remains 0.',
    agent10: 'May consume namespace inventory for future boundary/package assembly only; no release route opened now.'
  },
  zero_output_counts: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    accepted_gloss_rows_now: 0,
    answer_rows_now: 0,
    definition_content_rows_now: 0,
    source_rows_emitted_now: 0,
    public_hud_rows_now: 0,
    route_jsonl_rows_now: 0,
    agent6_delivery_now: 0,
    queue_mutation_count: 0,
    render_mutation_count: 0,
    staging_count: 0,
    release_route_opened_now: 0
  },
  non_acceptance_boundary: {
    no_qa_acceptance: true,
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_candidate_text_export_authorization: true,
    no_release_action: true,
    no_public_runtime_mutation: true,
    no_queue_mutation: true,
    no_staging: true,
    no_destructive_repo_action: true
  },
  forbidden_content_fields_not_written: forbiddenFields,
  stop_condition: 'Stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action.'
};

const md = `# Agent 1 Old Dictionary Public-Domain RID Namespace Inventory - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | public-domain RID namespace inventory for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | RID prefixes are metadata, not sufficient source-family custody proof | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.citationCustody}\`; \`${paths.refGapManifest}\`; \`${paths.sourceFamilyMembership}\` | public-domain rows ${inventoryCounts.public_domain_rows} / ${inventoryCounts.public_domain_occurrences}; RID namespaces ${inventoryCounts.rid_namespace_count}; unique RIDs ${inventoryCounts.unique_rid_count}; RID occurrences ${inventoryCounts.rid_occurrence_count}; BDB-prefix rows ${inventoryCounts.bdb_prefix_rows}; BDBA-prefix rows ${inventoryCounts.bdba_prefix_rows}; single-letter prefix count ${inventoryCounts.single_letter_prefix_count}; rows with no public-domain RIDs ${inventoryCounts.rows_with_no_public_domain_rids} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Namespace Rows

| RID prefix | rows | RID occurrences | unique RIDs | token_ids_sha256 | unique_rids_sha256 |
| --- | ---: | ---: | ---: | --- | --- |
${namespaceRows.map((row) => `| ${row.rid_prefix} | ${row.row_count} | ${row.rid_occurrence_count} | ${row.unique_rid_count} | \`${row.token_ids_sha256}\` | \`${row.unique_rids_sha256}\` |`).join('\n')}

Complete token IDs and RID lists are in the JSON artifact. Surface, normalized, definition, gloss, answer, candidate text, and definition text fields are not written.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  inventory_counts: artifact.inventory_counts
}, null, 2));
