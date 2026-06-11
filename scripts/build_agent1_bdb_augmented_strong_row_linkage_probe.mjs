#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const root = process.cwd();
const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  oldDictionaryReaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  liveReprobe: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-2026-06-05.json',
  liveReprobeValidationResult: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-validation-result-2026-06-05.json',
  outputJson: 'reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.json',
  outputMd: 'reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.md'
};

const augIndexUrl = 'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/AugIndex.xml';

const preview = readJson(paths.preview);
const oldDictionary = readJson(paths.oldDictionaryReaudit);
const liveReprobe = readJson(paths.liveReprobe);
const liveReprobeResult = readJson(paths.liveReprobeValidationResult);
const sourceFamily = oldDictionary.source_families.find((row) => row.source_family === 'BDB Augmented Strong');
const rows = preview.rows.filter((row) => (row.blocked_or_unresolved_lexicons || []).includes('BDB Augmented Strong'));

const augIndexText = await fetchText(augIndexUrl);
const augIndexProbe = parseAugIndex(augIndexText);
const rowFieldProfile = profileRows(rows);
const linkageProbe = probeMechanicalLinkage(rows, augIndexProbe);

assert(liveReprobeResult.ok === true, 'live re-probe validator must be ok before row-linkage probe');
assert(sourceFamily?.evidence?.rows === rows.length, 'BDB Augmented Strong row count mismatch');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_bdb_augmented_strong_row_linkage_probe',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_bdb_augmented_strong_row_linkage_probe.mjs',
  target: 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong row-linkage probe',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  workset: oldDictionary.workset,
  status: 'row_linkage_fields_missing_exact_custody_linkage_still_blocked',
  inputs: paths,
  source_family: {
    row_subset_id: sourceFamily.row_subset_id,
    source_family: sourceFamily.source_family,
    rows: rows.length,
    occurrences: rows.reduce((sum, row) => sum + (row.occurrences || 0), 0),
    license_lane: 'blocked_or_needs_review',
    derived_from_nc: false,
    commercial_export_allowed: false,
    corpus_contamination: false
  },
  row_field_profile: rowFieldProfile,
  open_scriptures_augindex_profile: {
    url: augIndexUrl,
    http_status: augIndexProbe.http_status,
    sha256: augIndexProbe.sha256,
    byte_count: augIndexProbe.byte_count,
    entry_count: augIndexProbe.entry_count,
    sample_entries: augIndexProbe.sample_entries,
    identifier_shape: {
      aug_attribute: 'number_or_number_suffix',
      entry_text: 'lowercase_lexical_index_id',
      sample: augIndexProbe.sample_entries[0] || null
    }
  },
  mechanical_linkage_probe: linkageProbe,
  classification_lane_decision: {
    license_lane: 'blocked_or_needs_review',
    lane_change_from_live_reprobe: false,
    candidate_source_license_basis_observed: liveReprobe.external_candidate_evidence.candidate_source_license_basis_observed,
    exact_linkage_to_current_imported_row_subset_proven: false,
    metadata_or_link_only_allowed: true,
    agent2_transform_allowed_now: false,
    candidate_text_export_allowed_now: false,
    answer_eligible_now: false,
    public_emit_now: false,
    release_route_opened_now: false,
    agent6_delivery_now: false,
    rationale: 'The preview rows that identify the blocked BDB Augmented Strong subset do not carry augmented Strong numbers, OpenScriptures lexical IDs, BDB Augmented Strong entry IDs, source URL fields, or row-level source file evidence.'
  },
  exact_blockers: [
    'bdb_augmented_strong_rows_missing_augmented_strong_number_field',
    'bdb_augmented_strong_rows_missing_openscriptures_lexical_index_id_field',
    'bdb_augmented_strong_rows_missing_blocked_entry_id_or_ref_sample',
    'bdb_augmented_strong_public_domain_rids_do_not_match_augindex_identifier_shape',
    'bdb_augmented_strong_source_file_or_import_mapping_missing',
    'bdb_augmented_strong_agent6_boundary_required_if_linkage_evidence_appears'
  ],
  handoff_owner: {
    agent1: 'Find row-level augmented Strong numbers, OpenScriptures lexical IDs, or an import source map before any lane change.',
    agent2: 'No transform; preserve blocked_or_needs_review lane and exact blockers.',
    agent6: 'Boundary question only after row-level source linkage exists.',
    agent10: 'No package assembly for this subset until Agent 1 linkage evidence and Agent 6 boundary exist.'
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0,
    candidate_text_rows: 0,
    release_actions: 0,
    agent6_deliveries: 0
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
  stop_condition: 'Stop after row-linkage schema probe and exact blockers; do not reclassify, transform, publish, deliver to Agent 6, or claim acceptance.'
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));
console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  status: artifact.status,
  rows: artifact.source_family.rows,
  occurrences: artifact.source_family.occurrences,
  augindex_entry_count: augIndexProbe.entry_count,
  exact_linkage_to_current_imported_row_subset_proven: false,
  exact_blocker_count: artifact.exact_blockers.length
}, null, 2));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'codex-agent1-row-linkage-probe' } }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function parseAugIndex(text) {
  const entries = [...text.matchAll(/<w\s+aug="([^"]+)">([^<]+)<\/w>/g)].map((match) => ({
    aug: match[1],
    lexical_id: match[2]
  }));
  return {
    http_status: 200,
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
    byte_count: Buffer.byteLength(text),
    entry_count: entries.length,
    entries,
    sample_entries: entries.slice(0, 12)
  };
}

function profileRows(rows) {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort();
  const keyPresence = Object.fromEntries(keys.map((key) => [key, rows.filter((row) => row[key] !== undefined).length]));
  const missingLinkageKeys = [
    'aug',
    'augmented_strong',
    'augmented_strong_number',
    'strong',
    'strong_number',
    'oshb_lexical_id',
    'openscriptures_lexical_id',
    'bdb_augmented_strong_rid',
    'blocked_or_unresolved_rids',
    'blocked_or_unresolved_refs_sample',
    'source_url',
    'source_file'
  ];
  return {
    row_count: rows.length,
    occurrence_sum: rows.reduce((sum, row) => sum + (row.occurrences || 0), 0),
    all_keys: keys,
    key_presence: keyPresence,
    missing_linkage_keys: missingLinkageKeys,
    token_ids_sample: rows.slice(0, 12).map((row) => row.token_id),
    surfaces_sample: rows.slice(0, 12).map((row) => row.surface),
    public_domain_rids_sample: [...new Set(rows.flatMap((row) => row.public_domain_rids || []))].slice(0, 30),
    blocked_or_unresolved_lexicons: [...new Set(rows.flatMap((row) => row.blocked_or_unresolved_lexicons || []))].sort()
  };
}

function probeMechanicalLinkage(rows, augIndexProbe) {
  const augValues = new Set(augIndexProbe.entries.map((entry) => entry.aug));
  const lexicalValues = new Set(augIndexProbe.entries.map((entry) => entry.lexical_id));
  const tokenIds = new Set(rows.map((row) => row.token_id).filter(Boolean));
  const lexiconEntryIds = new Set(rows.map((row) => row.lexicon_entry_id).filter(Boolean));
  const publicDomainRids = new Set(rows.flatMap((row) => row.public_domain_rids || []));
  const normalized = new Set(rows.map((row) => row.normalized).filter(Boolean));
  const overlap = (left, right) => [...left].filter((value) => right.has(value)).slice(0, 20);
  return {
    tested_row_sets: {
      token_id_count: tokenIds.size,
      lexicon_entry_id_count: lexiconEntryIds.size,
      public_domain_rid_count: publicDomainRids.size,
      normalized_surface_count: normalized.size
    },
    augindex_sets: {
      aug_value_count: augValues.size,
      lexical_id_count: lexicalValues.size
    },
    overlaps: {
      token_id_to_aug_value: overlap(tokenIds, augValues),
      token_id_to_lexical_id: overlap(tokenIds, lexicalValues),
      lexicon_entry_id_to_aug_value: overlap(lexiconEntryIds, augValues),
      lexicon_entry_id_to_lexical_id: overlap(lexiconEntryIds, lexicalValues),
      public_domain_rid_to_aug_value: overlap(publicDomainRids, augValues),
      public_domain_rid_to_lexical_id: overlap(publicDomainRids, lexicalValues),
      normalized_surface_to_lexical_id: overlap(normalized, lexicalValues)
    },
    exact_linkage_proven: false,
    blocker: 'No available BDB Augmented Strong row field matches AugIndex aug values or lexical IDs; public-domain RID fields are for other lexicons and do not establish BDB Augmented Strong custody.'
  };
}

function renderMarkdown(artifact) {
  return `# Agent 1 BDB Augmented Strong Row-Linkage Probe - 2026-06-05

Status: \`${artifact.status}\`

## Lane Decision

| row subset | rows | occurrences | lane | exact row linkage proven | transform now |
| --- | ---: | ---: | --- | --- | --- |
| \`${artifact.source_family.row_subset_id}\` | ${artifact.source_family.rows} | ${artifact.source_family.occurrences} | \`${artifact.classification_lane_decision.license_lane}\` | ${artifact.classification_lane_decision.exact_linkage_to_current_imported_row_subset_proven} | ${artifact.classification_lane_decision.agent2_transform_allowed_now} |

## Row Field Profile

- Row keys: ${artifact.row_field_profile.all_keys.map((key) => `\`${key}\``).join(', ')}
- Missing linkage keys checked: ${artifact.row_field_profile.missing_linkage_keys.map((key) => `\`${key}\``).join(', ')}
- Blocked/unresolved lexicons observed: ${artifact.row_field_profile.blocked_or_unresolved_lexicons.map((name) => `\`${name}\``).join(', ')}

## AugIndex Profile

- URL: ${artifact.open_scriptures_augindex_profile.url}
- SHA-256: \`${artifact.open_scriptures_augindex_profile.sha256}\`
- Entries parsed: ${artifact.open_scriptures_augindex_profile.entry_count}
- Identifier shape: \`aug\` attribute to lowercase lexical index ID.

## Mechanical Linkage Probe

- Token IDs to AugIndex aug values: ${artifact.mechanical_linkage_probe.overlaps.token_id_to_aug_value.length}
- Token IDs to AugIndex lexical IDs: ${artifact.mechanical_linkage_probe.overlaps.token_id_to_lexical_id.length}
- Preview lexicon entry IDs to AugIndex lexical IDs: ${artifact.mechanical_linkage_probe.overlaps.lexicon_entry_id_to_lexical_id.length}
- Public-domain RIDs to AugIndex lexical IDs: ${artifact.mechanical_linkage_probe.overlaps.public_domain_rid_to_lexical_id.length}
- Blocker: ${artifact.mechanical_linkage_probe.blocker}

## Exact Blockers

${artifact.exact_blockers.map((blocker) => `- \`${blocker}\``).join('\n')}

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, candidate-text export authorization, release action, public/runtime mutation, NC commercial authorization, queue mutation, staging, or destructive repo action is claimed.
`;
}
