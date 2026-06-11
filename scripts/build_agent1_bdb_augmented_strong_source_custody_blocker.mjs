#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  oldDictionaryReaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  agent1FamilyCustody: 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json',
  agent6FamilyVerdict: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json',
  agent10BoundaryPacket: 'reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json',
  outputJson: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.json',
  outputMd: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.md'
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pickFamily(rows, name) {
  return (rows || []).find((row) => row.family === name || row.source_family === name);
}

function sourceRepositoryProbe() {
  const sourceDir = fullPath('data/sources');
  const names = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir) : [];
  const candidates = names
    .filter((name) => /\.json$/i.test(name))
    .filter((name) => /bdb|strong|brown|driver|briggs|augmented/i.test(name))
    .map((name) => `data/sources/${name}`)
    .sort();
  return {
    search_scope: 'filename-only probe over data/sources/*.json',
    search_terms: ['bdb', 'strong', 'brown', 'driver', 'briggs', 'augmented'],
    candidate_source_files: candidates,
    candidate_source_file_count: candidates.length
  };
}

const oldDictionary = readJson(PATHS.oldDictionaryReaudit);
const agent1FamilyCustody = readJson(PATHS.agent1FamilyCustody);
const agent6FamilyVerdict = readJson(PATHS.agent6FamilyVerdict);
const agent10BoundaryPacket = readJson(PATHS.agent10BoundaryPacket);

const oldDictionaryFamily = pickFamily(oldDictionary.source_families, 'BDB Augmented Strong');
const agent1Family = pickFamily(agent1FamilyCustody.family_boundaries, 'BDB Augmented Strong');
const agent6Family = pickFamily(agent6FamilyVerdict.family_status_verdict, 'BDB Augmented Strong');
const agent10Family = pickFamily(agent10BoundaryPacket.source_family_lanes, 'BDB Augmented Strong');

assert(oldDictionaryFamily, 'BDB Augmented Strong missing from Agent 1 old-dictionary reaudit packet');
assert(agent1Family, 'BDB Augmented Strong missing from Agent 1 family-custody scout');
assert(agent6Family, 'BDB Augmented Strong missing from Agent 6 family verdict');
assert(agent10Family, 'BDB Augmented Strong missing from Agent 10 boundary packet');

const repositoryProbe = sourceRepositoryProbe();
const exactBlocker = {
  id: 'bdb_augmented_strong_missing_independent_source_license_custody_basis',
  row_subset_id: oldDictionaryFamily.row_subset_id,
  source_family: 'BDB Augmented Strong',
  license_lane: 'blocked_or_needs_review',
  missing_evidence: [
    'independent source/license/custody basis',
    'source URL or version source',
    'license label and allowed fields',
    'Agent 6 boundary if evidence appears'
  ],
  observed_endpoint: agent1Family.observed_license_source_basis?.version_endpoint_url || null,
  observed_endpoint_http_status: agent1Family.observed_license_source_basis?.http_status || null,
  observed_response_sha256: agent1Family.observed_license_source_basis?.response_sha256 || null,
  observed_license: agent1Family.observed_license_source_basis?.observed_license || null,
  observed_version_source: agent1Family.observed_license_source_basis?.observed_version_source || null,
  observed_status: agent1Family.observed_license_source_basis?.observed_status || null,
  repository_candidate_source_file_count: repositoryProbe.candidate_source_file_count,
  handoff_owner: 'Agent 1 if independent evidence appears; otherwise blocked/review',
  stop_condition: 'Remain out of Agent 2 candidate text transform until independent source/license/custody evidence and Agent 6 boundary are supplied.'
};

const output = {
  schema_version: 1,
  artifact_type: 'agent1_bdb_augmented_strong_source_custody_blocker',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_bdb_augmented_strong_source_custody_blocker.mjs',
  target: 'BDB Augmented Strong independent source/license/custody basis',
  workset: oldDictionary.workset,
  status: 'exact_blocker_preserved_no_independent_source_license_custody_basis',
  inputs: PATHS,
  source_family: {
    source_family: 'BDB Augmented Strong',
    source_name: oldDictionaryFamily.source_name,
    row_subset_id: oldDictionaryFamily.row_subset_id,
    license_label: oldDictionaryFamily.license_label,
    license_lane: oldDictionaryFamily.license_lane,
    rows: oldDictionaryFamily.evidence?.rows,
    occurrences: oldDictionaryFamily.evidence?.occurrences,
    token_ids_sample: oldDictionaryFamily.evidence?.token_ids_sample || [],
    derived_from_nc: oldDictionaryFamily.derived_from_nc,
    commercial_export_allowed: oldDictionaryFamily.commercial_export_allowed,
    attribution_required: oldDictionaryFamily.attribution_required,
    corpus_contamination: oldDictionaryFamily.corpus_contamination,
    nc_flags: oldDictionaryFamily.nc_flags
  },
  scout_evidence: {
    agent1_status: agent1Family.status,
    metadata_only_allowed: agent1Family.metadata_only_allowed,
    external_link_only_allowed: agent1Family.external_link_only_allowed,
    transformed_reader_hint_allowed: agent1Family.transformed_reader_hint_allowed,
    observed_license_source_basis: agent1Family.observed_license_source_basis,
    exact_blocker_if_blocked: agent1Family.exact_blocker_if_blocked
  },
  agent6_verdict: {
    agent1_status: agent6Family.agent1_status,
    agent6_final_status_for_non_public_planning: agent6Family.agent6_final_status_for_non_public_planning,
    observed_license_group: agent6Family.observed_license_group,
    planning_use_allowed: agent6Family.planning_use_allowed,
    public_or_runtime_use_authorized: agent6Family.public_or_runtime_use_authorized,
    exact_blocker: agent6Family.exact_blocker
  },
  release_boundary_packet_row: {
    license_label: agent10Family.license_label,
    license_lane: agent10Family.license_lane,
    rows: agent10Family.rows,
    occurrences: agent10Family.occurrences,
    missing_evidence: agent10Family.missing_evidence || []
  },
  source_repository_probe: repositoryProbe,
  exact_blocker: exactBlocker,
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
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
    no_public_runtime_mutation: true,
    no_queue_mutation: true,
    no_staging: true
  },
  next_safe_agent1_work: [
    'If a candidate source/version file appears, rerun this blocker builder and then produce source/license/custody evidence before changing the lane.',
    'Keep BDB Augmented Strong in blocked_or_needs_review until independent evidence and Agent 6 boundary exist.',
    'Keep Klein Dictionary separate as noncommercial_educational_candidate; this BDB Augmented Strong blocker does not alter NC rows.'
  ]
};

const markdown = [
  '# Agent 1 BDB Augmented Strong Source-Custody Blocker - 2026-06-05',
  '',
  `Status: \`${output.status}\``,
  `Workset: \`${output.workset}\``,
  '',
  '## Source Family',
  '',
  `- Source family: \`${output.source_family.source_family}\``,
  `- Row subset: \`${output.source_family.row_subset_id}\``,
  `- License lane: \`${output.source_family.license_lane}\``,
  `- Rows / occurrences: \`${output.source_family.rows}\` / \`${output.source_family.occurrences}\``,
  `- Derived from NC: \`${output.source_family.derived_from_nc}\``,
  `- Commercial export allowed: \`${output.source_family.commercial_export_allowed}\``,
  `- Corpus contamination: \`${output.source_family.corpus_contamination}\``,
  '',
  '## Scout Evidence',
  '',
  `- Endpoint: \`${exactBlocker.observed_endpoint}\``,
  `- HTTP status: \`${exactBlocker.observed_endpoint_http_status}\``,
  `- Response SHA-256: \`${exactBlocker.observed_response_sha256}\``,
  `- Observed license: \`${exactBlocker.observed_license}\``,
  `- Observed version source: \`${exactBlocker.observed_version_source}\``,
  `- Observed status: \`${exactBlocker.observed_status}\``,
  `- data/sources candidate source files: \`${repositoryProbe.candidate_source_file_count}\``,
  '',
  '## Exact Blocker',
  '',
  `- \`${exactBlocker.id}\``,
  ...exactBlocker.missing_evidence.map((item) => `- missing: ${item}`),
  '',
  '## Boundary',
  '',
  'BDB Augmented Strong remains `blocked_or_needs_review`. This artifact emits no answer rows, source rows, public HUD rows, route JSONL rows, definition content rows, or accepted text rows. No QA, source/license/legal, Definition, runtime, publication, product, answer, accepted text, queue, staging, or NC-commercial authorization is claimed.',
  ''
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  output_json: PATHS.outputJson,
  output_md: PATHS.outputMd,
  status: output.status,
  rows: output.source_family.rows,
  occurrences: output.source_family.occurrences,
  repository_candidate_source_file_count: repositoryProbe.candidate_source_file_count
}, null, 2));
