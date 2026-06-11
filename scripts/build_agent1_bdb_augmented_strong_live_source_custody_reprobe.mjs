#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const root = process.cwd();
const paths = {
  baseBlocker: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.json',
  baseBlockerValidationResult: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-validation-result-2026-06-05.json',
  oldDictionaryReaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  outputJson: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-2026-06-05.json',
  outputMd: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-2026-06-05.md'
};

const probeUrls = [
  {
    role: 'sefaria_versions_endpoint',
    url: 'https://www.sefaria.org/api/texts/versions/BDB%20Augmented%20Strong',
    expected_observation: 'Sefaria versions endpoint for the exact family name.'
  },
  {
    role: 'sefaria_raw_index_endpoint',
    url: 'https://www.sefaria.org/api/v2/raw/index/BDB%20Augmented%20Strong',
    expected_observation: 'Sefaria raw index endpoint for the exact family name.'
  },
  {
    role: 'sefaria_index_endpoint',
    url: 'https://www.sefaria.org/api/index/BDB%20Augmented%20Strong',
    expected_observation: 'Sefaria index endpoint for the exact family name.'
  },
  {
    role: 'openscriptures_hebrewlexicon_readme',
    url: 'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/readme.md',
    expected_observation: 'External candidate project readme with AugIndex and license statements.'
  },
  {
    role: 'openscriptures_hebrewlexicon_augindex',
    url: 'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/AugIndex.xml',
    expected_observation: 'External candidate AugIndex file for augmented Strong mappings.'
  }
];

const baseBlocker = readJson(paths.baseBlocker);
const baseResult = readJson(paths.baseBlockerValidationResult);
const oldDictionary = readJson(paths.oldDictionaryReaudit);
const liveProbeResults = [];
for (const probe of probeUrls) {
  liveProbeResults.push(await fetchProbe(probe));
}

const sourceProbe = sourceRepositoryProbe();
const readmeProbe = liveProbeResults.find((row) => row.role === 'openscriptures_hebrewlexicon_readme');
const augIndexProbe = liveProbeResults.find((row) => row.role === 'openscriptures_hebrewlexicon_augindex');
const sefariaProbes = liveProbeResults.filter((row) => row.role.startsWith('sefaria_'));

const readmeEvidence = extractReadmeEvidence(readmeProbe?.body_sample || '');
const bdbFamily = baseBlocker.source_family;

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_bdb_augmented_strong_live_source_custody_reprobe',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_bdb_augmented_strong_live_source_custody_reprobe.mjs',
  target: 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong live source/license/custody re-probe',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  workset: baseBlocker.workset,
  status: 'external_candidate_observed_exact_custody_linkage_still_blocked',
  inputs: paths,
  source_family: {
    row_subset_id: bdbFamily.row_subset_id,
    source_family: bdbFamily.source_family,
    source_name: bdbFamily.source_name,
    rows: bdbFamily.rows,
    occurrences: bdbFamily.occurrences,
    current_license_lane: bdbFamily.license_lane,
    current_license_label: bdbFamily.license_label,
    derived_from_nc: bdbFamily.derived_from_nc,
    commercial_export_allowed: false,
    corpus_contamination: false,
    nc_flags: null
  },
  live_probe_scope: {
    probed_at: new Date().toISOString(),
    urls: probeUrls.map((row) => row.url),
    raw_bodies_stored: false,
    body_samples_are_bounded: true,
    repo_source_probe: sourceProbe
  },
  live_probe_results: liveProbeResults.map((row) => summarizeProbe(row)),
  external_candidate_evidence: {
    candidate_project: 'OpenScriptures HebrewLexicon',
    candidate_urls: [
      'https://github.com/openscriptures/HebrewLexicon',
      'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/readme.md',
      'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/AugIndex.xml'
    ],
    readme_status: readmeProbe?.status || null,
    readme_sha256: readmeProbe?.sha256 || null,
    augindex_status: augIndexProbe?.status || null,
    augindex_sha256: augIndexProbe?.sha256 || null,
    observed_readme_signals: readmeEvidence,
    candidate_source_license_basis_observed: readmeEvidence.has_augindex_statement && readmeEvidence.has_cc_by_4_statement && readmeEvidence.has_public_domain_dictionary_statement && readmeEvidence.has_attribution_statement,
    exact_linkage_to_current_imported_row_subset_proven: false,
    exact_linkage_blocker: 'Current repo/API evidence does not prove that the old-dictionary BDB Augmented Strong row subset is sourced from OpenScriptures HebrewLexicon AugIndex.xml under the observed license/custody chain.'
  },
  sefaria_current_observation: {
    exact_title_endpoints: sefariaProbes.map((row) => ({
      role: row.role,
      url: row.url,
      http_status: row.status,
      sha256: row.sha256,
      json_error_key_present: row.json_error_key_present,
      observed_license: row.observed_license,
      observed_version_source: row.observed_version_source,
      observed_version_title: row.observed_version_title
    })),
    source_or_license_fields_found_for_exact_title: false
  },
  classification_lane_decision: {
    license_lane: 'blocked_or_needs_review',
    lane_change_from_base_blocker: false,
    metadata_or_link_only_allowed: true,
    transformed_reader_hint_allowed: false,
    agent2_transform_allowed_now: false,
    candidate_text_export_allowed_now: false,
    answer_eligible_now: false,
    public_emit_now: false,
    release_route_opened_now: false,
    agent6_delivery_now: false,
    rationale: 'External candidate source/license evidence is plausible but does not establish exact custody linkage to this imported row subset; Sefaria exact-title endpoints still do not expose source/license fields.'
  },
  exact_blockers: [
    'bdb_augmented_strong_exact_custody_linkage_to_external_candidate_not_proven',
    'bdb_augmented_strong_sefaria_exact_title_source_license_fields_missing',
    'bdb_augmented_strong_import_row_subset_source_mapping_missing',
    'bdb_augmented_strong_agent6_boundary_required_if_evidence_becomes_linked'
  ],
  handoff_owner: {
    agent1: 'Continue source/license/custody evidence gathering and prove or reject the OpenScriptures linkage before lane change.',
    agent2: 'No transform. May consume only blocked/review lane evidence and exact blockers.',
    agent6: 'Receives boundary question only after exact source/custody linkage is assembled.',
    agent10: 'No release assembly for this subset until Agent 1 linkage evidence and Agent 6 boundary exist.'
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
  stop_condition: 'Stop after recording live candidate evidence and exact remaining custody blockers; do not reclassify, transform, publish, deliver to Agent 6, or claim acceptance.'
};

assert(baseResult.ok === true, 'base BDB blocker must validate before live re-probe');
assert(oldDictionary.workset === artifact.workset, 'old-dictionary workset mismatch');

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));
console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  status: artifact.status,
  candidate_source_license_basis_observed: artifact.external_candidate_evidence.candidate_source_license_basis_observed,
  exact_linkage_to_current_imported_row_subset_proven: false,
  license_lane: artifact.classification_lane_decision.license_lane,
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

function sourceRepositoryProbe() {
  const sourceDir = path.join(root, 'data/sources');
  const names = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir) : [];
  const candidates = names
    .filter((name) => /\.json$/i.test(name))
    .filter((name) => /bdb|strong|brown|driver|briggs|augmented|hebrewlexicon|lexicon/i.test(name))
    .map((name) => `data/sources/${name}`)
    .sort();
  return {
    search_scope: 'filename-only probe over data/sources/*.json',
    search_terms: ['bdb', 'strong', 'brown', 'driver', 'briggs', 'augmented', 'hebrewlexicon', 'lexicon'],
    candidate_source_files: candidates,
    candidate_source_file_count: candidates.length
  };
}

function fetchProbe(probe) {
  return new Promise((resolve) => {
    https.get(probe.url, { headers: { 'User-Agent': 'codex-agent1-source-custody-probe' } }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const sha256 = crypto.createHash('sha256').update(body).digest('hex');
        const json = parseJson(body);
        resolve({
          ...probe,
          status: res.statusCode,
          content_type: res.headers['content-type'] || null,
          byte_count: Buffer.byteLength(body),
          sha256,
          json_error_key_present: Boolean(json && Object.prototype.hasOwnProperty.call(json, 'error')),
          observed_license: json?.license ?? null,
          observed_version_source: json?.versionSource ?? json?.version_source ?? null,
          observed_version_title: json?.versionTitle ?? json?.version_title ?? null,
          observed_status: json?.status ?? null,
          body_sample: body.slice(0, 5000),
          error: null
        });
      });
    }).on('error', (error) => {
      resolve({
        ...probe,
        status: null,
        content_type: null,
        byte_count: 0,
        sha256: null,
        json_error_key_present: false,
        observed_license: null,
        observed_version_source: null,
        observed_version_title: null,
        observed_status: null,
        body_sample: '',
        error: error.message
      });
    });
  });
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function summarizeProbe(row) {
  return {
    role: row.role,
    url: row.url,
    http_status: row.status,
    content_type: row.content_type,
    byte_count: row.byte_count,
    sha256: row.sha256,
    json_error_key_present: row.json_error_key_present,
    observed_license: row.observed_license,
    observed_version_source: row.observed_version_source,
    observed_version_title: row.observed_version_title,
    observed_status: row.observed_status,
    error: row.error
  };
}

function extractReadmeEvidence(sample) {
  return {
    has_augindex_statement: sample.includes('AugIndex.xml') && sample.includes('augmented Strong numbers'),
    has_cc_by_4_statement: sample.includes('Creative Commons Attribution 4.0'),
    has_public_domain_dictionary_statement: sample.includes('dictionary remain in the public domain'),
    has_attribution_statement: sample.includes('credit the Open Scriptures Hebrew Bible Project')
  };
}

function renderMarkdown(artifact) {
  const probeRows = artifact.live_probe_results.map((row) => {
    return `| ${row.role} | ${row.http_status ?? 'error'} | \`${row.sha256 ?? 'null'}\` | ${row.json_error_key_present ? 'yes' : 'no'} | ${row.observed_license ?? 'null'} | ${row.observed_version_source ?? 'null'} |`;
  }).join('\n');
  return `# Agent 1 BDB Augmented Strong Live Source/Custody Re-probe - 2026-06-05

Status: \`${artifact.status}\`

## Lane Decision

| row subset | rows | occurrences | lane | exact linkage proven | transform now | stop condition |
| --- | ---: | ---: | --- | --- | --- | --- |
| \`${artifact.source_family.row_subset_id}\` | ${artifact.source_family.rows} | ${artifact.source_family.occurrences} | \`${artifact.classification_lane_decision.license_lane}\` | ${artifact.external_candidate_evidence.exact_linkage_to_current_imported_row_subset_proven} | ${artifact.classification_lane_decision.agent2_transform_allowed_now} | ${artifact.stop_condition} |

## Live Probe

| probe | status | sha256 | error key | observed license | observed version source |
| --- | ---: | --- | --- | --- | --- |
${probeRows}

## External Candidate Evidence

- Candidate project: OpenScriptures HebrewLexicon.
- Candidate source/license basis observed: ${artifact.external_candidate_evidence.candidate_source_license_basis_observed}.
- Observed signals: AugIndex statement ${artifact.external_candidate_evidence.observed_readme_signals.has_augindex_statement}; CC BY 4.0 statement ${artifact.external_candidate_evidence.observed_readme_signals.has_cc_by_4_statement}; public-domain dictionary statement ${artifact.external_candidate_evidence.observed_readme_signals.has_public_domain_dictionary_statement}; attribution statement ${artifact.external_candidate_evidence.observed_readme_signals.has_attribution_statement}.
- Exact linkage blocker: ${artifact.external_candidate_evidence.exact_linkage_blocker}

## Exact Blockers

${artifact.exact_blockers.map((blocker) => `- \`${blocker}\``).join('\n')}

## Handoff

- Agent 1: ${artifact.handoff_owner.agent1}
- Agent 2: ${artifact.handoff_owner.agent2}
- Agent 6: ${artifact.handoff_owner.agent6}
- Agent 10: ${artifact.handoff_owner.agent10}

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, candidate-text export authorization, release action, public/runtime mutation, NC commercial authorization, queue mutation, staging, or destructive repo action is claimed.
`;
}
