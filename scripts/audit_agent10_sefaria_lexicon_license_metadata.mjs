#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  jsonReport: `reports/agent10-sefaria-lexicon-license-scout-addendum-${dateSlug}.json`,
  report: `reports/agent10-sefaria-lexicon-license-scout-addendum-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const lexiconFamilies = [
  {
    family: 'Klein Dictionary',
    version_endpoint_title: 'Klein Dictionary',
    word_api_name: 'Klein Dictionary',
    interim_status: 'blocked_unresolved_noncommercial_license',
    note: 'Sefaria version metadata reports CC-BY-NC; public/runtime reuse needs Agent 1/6 decision before any storage/display of answer text.',
  },
  {
    family: 'BDB Dictionary',
    version_endpoint_title: 'BDB',
    word_api_name: 'BDB Dictionary',
    interim_status: 'candidate_public_domain_needs_agent1_6_custody',
    note: 'Sefaria version metadata reports Public Domain; still requires Agent 1 custody and Agent 6 boundary review before repo/public use.',
  },
  {
    family: 'BDB Aramaic Dictionary',
    version_endpoint_title: 'BDB Aramaic',
    word_api_name: 'BDB Aramaic Dictionary',
    interim_status: 'candidate_public_domain_needs_agent1_6_custody',
    note: 'Sefaria version metadata reports Public Domain; still requires Agent 1 custody and Agent 6 boundary review before repo/public use.',
  },
  {
    family: 'Jastrow Dictionary',
    version_endpoint_title: 'Jastrow',
    word_api_name: 'Jastrow Dictionary',
    interim_status: 'candidate_public_domain_needs_agent1_6_custody',
    note: 'Sefaria version metadata reports Public Domain; still requires Agent 1 custody and Agent 6 boundary review before repo/public use.',
  },
  {
    family: 'BDB Augmented Strong',
    version_endpoint_title: 'BDB Augmented Strong',
    word_api_name: 'BDB Augmented Strong',
    interim_status: 'blocked_no_independent_license_observed',
    note: 'Sefaria words API reports Open Scriptures source metadata, but the version endpoint did not provide a usable license object in this probe.',
  },
];

const generatedAt = new Date().toISOString();
const issues = [];
const warnings = [];
const observations = [];
for (const family of lexiconFamilies) {
  observations.push(await observeFamily(family));
}

if (!observations.some((row) => row.observed_license === 'Public Domain')) warnings.push('No public-domain license metadata observed.');
if (!observations.some((row) => row.observed_license === 'CC-BY-NC')) warnings.push('No CC-BY-NC metadata observed for Klein boundary.');
if (observations.some((row) => row.http_status !== 200)) warnings.push('At least one Sefaria version endpoint returned a non-200 status.');

const output = {
  schema_version: 1,
  artifact_type: 'agent10_sefaria_lexicon_license_scout_addendum',
  generated_at: generatedAt,
  generator: 'scripts/audit_agent10_sefaria_lexicon_license_metadata.mjs',
  boundary: {
    status: issues.length ? 'blocked_license_metadata_scout' : (warnings.length ? 'warn_license_metadata_scout' : 'license_metadata_scout_evidence_only'),
    evidence_only: true,
    no_license_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_publication_readiness: true,
    no_qa_acceptance: true,
  },
  inputs: {
    docs: {
      lexicon_docs: 'https://developers.sefaria.org/docs/lexicon-docs',
      words_api_docs: 'https://developers.sefaria.org/reference/get-words',
      copyright_guidance: 'https://developers.sefaria.org/docs/usage-of-our-name-and-logo',
    },
    version_endpoint_template: 'https://www.sefaria.org/api/texts/versions/{title}',
    related_audit: 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json',
    related_transform_spec: 'reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md',
    related_license_request: 'reports/agent10-agent1-sefaria-lexicon-license-boundary-request-2026-06-03.md',
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    answer_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
  },
  summary: {
    status: issues.length ? 'blocked_license_metadata_scout' : (warnings.length ? 'warn_license_metadata_scout' : 'license_metadata_scout_evidence_only'),
    families_checked: observations.length,
    public_domain_observed: observations.filter((row) => row.observed_license === 'Public Domain').length,
    noncommercial_observed: observations.filter((row) => row.observed_license === 'CC-BY-NC').length,
    unresolved_or_blocked: observations.filter((row) => row.interim_status.startsWith('blocked')).length,
    answer_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    issues: issues.length,
    warnings: warnings.length,
  },
  observations,
  requested_agent1_6_disposition: [
    'Confirm whether Sefaria version metadata is sufficient custody evidence for BDB, BDB Aramaic, and Jastrow.',
    'Decide whether Klein CC-BY-NC can be used at all in public/runtime reader hints; default remains blocked.',
    'Resolve BDB Augmented Strong license/custody from Open Scriptures or keep it blocked.',
    'Define whether metadata-only audit storage can remain in reports while answer text stays omitted.',
  ],
  issues,
  warnings,
  what_must_not_be_accepted: [
    'License clearance',
    'Source custody',
    'Source/provenance acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Translation output',
    'Accepted gloss',
    'Accepted translation text',
    'QA acceptance',
    'Public/runtime acceptance',
    'Publication readiness',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Sefaria lexicon license metadata scout complete: ${options.report}`);
if (issues.length) process.exit(1);

async function observeFamily(family) {
  const url = `https://www.sefaria.org/api/texts/versions/${encodeURIComponent(family.version_endpoint_title)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  const version = Array.isArray(json) ? json[0] : (Array.isArray(json?.versions) ? json.versions[0] : json);
  return {
    family: family.family,
    word_api_name: family.word_api_name,
    version_endpoint_title: family.version_endpoint_title,
    version_endpoint_url: url,
    http_status: response.status,
    response_sha256: createHash('sha256').update(text).digest('hex'),
    observed_license: stringOrNull(version?.license),
    observed_version_title: stringOrNull(version?.versionTitle),
    observed_version_source: stringOrNull(version?.versionSource),
    observed_status: stringOrNull(version?.status),
    observed_digitized_by_sefaria: version?.digitizedBySefaria ?? null,
    observed_language: stringOrNull(version?.language),
    observed_source: stringOrNull(version?.source),
    raw_version_body_stored: false,
    interim_status: family.interim_status,
    note: family.note,
  };
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Sefaria Lexicon License Scout Addendum',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only license metadata scout for Sefaria lexicon families surfaced by the Orot audit.',
    '- This addendum records Sefaria version metadata observations only.',
    '- It does not clear licenses, accept source custody, store definition content, emit answer rows, mutate public HUD data, or claim QA/publication readiness.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Families checked: ${data.summary.families_checked}`,
    `- Public Domain observed: ${data.summary.public_domain_observed}`,
    `- CC-BY-NC observed: ${data.summary.noncommercial_observed}`,
    `- Unresolved or blocked interim statuses: ${data.summary.unresolved_or_blocked}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    '',
    '## Observations',
    '',
    '| Family | Endpoint Title | HTTP | Observed License | Version | Source | Interim Status |',
    '| --- | --- | ---: | --- | --- | --- | --- |',
    ...data.observations.map((row) => `| ${escapeMd(row.family)} | ${escapeMd(row.version_endpoint_title)} | ${row.http_status} | ${escapeMd(row.observed_license || 'none')} | ${escapeMd(row.observed_version_title || 'none')} | ${escapeMd(row.observed_version_source || 'none')} | ${escapeMd(row.interim_status)} |`),
    '',
    '## Agent 1/6 Disposition Needed',
    '',
    ...data.requested_agent1_6_disposition.map((item) => `- ${item}`),
    '',
    '## Agent 8 Callback',
    '',
    '- Status: Sefaria lexicon license metadata addendum produced.',
    `- Artifact path: ${data.outputs.markdown_report}`,
    '- Selected page or blocker: Orot flagship data-fill license/custody boundary.',
    '- Agent 1 needed: yes, for custody and license verification by lexicon family.',
    '- Agent 2 needed: after Agent 1/6 boundary, for zero-or-safe transform dry run.',
    '- Agent 4 needed: no, because no public/runtime artifact changed.',
    '- Agent 7/13 decision needed: only if unresolved/noncommercial lexicon text is proposed for storage or display.',
    '- Next recommended executable route: Agent 1/6 lexicon-family disposition, then Agent 2 transform dry run with only cleared families.',
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${warning}`) : ['- None']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/audit_agent10_sefaria_lexicon_license_metadata.mjs');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function stringOrNull(value) {
  return typeof value === 'string' && value.length ? value : null;
}

function escapeMd(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
}
