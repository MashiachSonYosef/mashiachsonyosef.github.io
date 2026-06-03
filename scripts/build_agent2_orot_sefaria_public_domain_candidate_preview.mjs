#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  hitAudit: 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json',
  licenseScout: 'reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json',
  transformSpec: 'reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md',
  jsonReport: `reports/agent2-orot-sefaria-public-domain-candidate-preview-${dateSlug}.json`,
  report: `reports/agent2-orot-sefaria-public-domain-candidate-preview-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const hitAudit = readJson(options.hitAudit);
const licenseScout = readJson(options.licenseScout);
const familyState = buildFamilyState(licenseScout);
const issues = [];
const warnings = [];

if (hitAudit.artifact_type !== 'agent2_orot_sefaria_lexicon_hit_audit') issues.push('Input hit audit artifact type mismatch.');
if (licenseScout.artifact_type !== 'agent10_sefaria_lexicon_license_scout_addendum') issues.push('Input license scout artifact type mismatch.');
if (!fs.existsSync(path.join(root, options.transformSpec))) issues.push('Transform spec input is missing.');

const rows = (hitAudit.rows || []).map(previewRow);
const auditedOccurrences = sum(rows.map((row) => row.occurrences));
const pdRows = rows.filter((row) => row.public_domain_observed_entry_count > 0);
const strictRows = rows.filter((row) => row.preview_relation_class === 'exact_after_mark_strip');
const prefixRows = rows.filter((row) => row.preview_relation_class === 'prefix_or_clitic_possible');
const morphRows = rows.filter((row) => row.preview_relation_class === 'needs_morphology_disambiguation');
const onlyBlockedRows = rows.filter((row) => row.preview_status === 'blocked_only_non_public_domain_or_unresolved_hits');
const noHitRows = rows.filter((row) => row.preview_status === 'no_sefaria_hit');
const pdWithCitationRows = pdRows.filter((row) => row.public_domain_citation_metadata_present);

if (pdRows.length === 0) issues.push('No public-domain-observed metadata rows were identified.');
if (strictRows.length === 0) warnings.push('No strict exact-after-mark-strip public-domain metadata rows were identified.');
if (prefixRows.length > 0) warnings.push('Some public-domain-observed rows require prefix/clitic morphology proof before any answer-candidate transform.');

const output = {
  schema_version: 1,
  artifact_type: 'agent2_orot_sefaria_public_domain_candidate_preview',
  generated_at: generatedAt,
  generator: 'scripts/build_agent2_orot_sefaria_public_domain_candidate_preview.mjs',
  boundary: {
    status: issues.length ? 'blocked_public_domain_candidate_preview' : (warnings.length ? 'warn_public_domain_candidate_preview_evidence_only' : 'public_domain_candidate_preview_evidence_only'),
    evidence_only: true,
    preview_only: true,
    zero_emission: true,
    metadata_only: true,
    no_answer_rows: true,
    no_answer_candidates_emitted: true,
    answer_eligible_now: false,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_source_file_mutation: true,
    no_lexicon_payload_mutation: true,
    no_definition_content_stored: true,
    no_license_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_publication_readiness: true,
    no_qa_acceptance: true,
  },
  inputs: {
    hit_audit: options.hitAudit,
    hit_audit_sha256: sha256File(options.hitAudit),
    license_scout: options.licenseScout,
    license_scout_sha256: sha256File(options.licenseScout),
    transform_spec: options.transformSpec,
    transform_spec_sha256: sha256File(options.transformSpec),
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    answer_rows: 0,
    answer_candidate_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    source_rows: 0,
    definition_content_rows: 0,
  },
  license_boundary_used_for_preview: {
    included_observed_public_domain_families: [...familyState.publicDomain].sort(),
    excluded_noncommercial_or_unresolved_families: [...familyState.blocked].sort(),
    family_statuses: licenseScout.observations.map((row) => ({
      family: row.family,
      observed_license: row.observed_license,
      interim_status: row.interim_status,
    })),
  },
  summary: {
    status: issues.length ? 'blocked_public_domain_candidate_preview' : (warnings.length ? 'warn_public_domain_candidate_preview_evidence_only' : 'public_domain_candidate_preview_evidence_only'),
    audited_rows: rows.length,
    audited_occurrences: auditedOccurrences,
    sefaria_hit_rows: hitAudit.summary?.rows_with_any_hit ?? null,
    sefaria_hit_occurrences: hitAudit.summary?.occurrences_with_any_hit ?? null,
    public_domain_observed_rows: pdRows.length,
    public_domain_observed_occurrences: sum(pdRows.map((row) => row.occurrences)),
    public_domain_observed_row_rate: rows.length ? round(pdRows.length / rows.length) : 0,
    public_domain_observed_occurrence_rate: auditedOccurrences ? round(sum(pdRows.map((row) => row.occurrences)) / auditedOccurrences) : 0,
    strict_exact_preview_rows: strictRows.length,
    strict_exact_preview_occurrences: sum(strictRows.map((row) => row.occurrences)),
    prefix_or_clitic_preview_rows: prefixRows.length,
    prefix_or_clitic_preview_occurrences: sum(prefixRows.map((row) => row.occurrences)),
    morphology_disambiguation_rows: morphRows.length,
    morphology_disambiguation_occurrences: sum(morphRows.map((row) => row.occurrences)),
    public_domain_rows_with_citation_metadata: pdWithCitationRows.length,
    public_domain_occurrences_with_citation_metadata: sum(pdWithCitationRows.map((row) => row.occurrences)),
    blocked_only_non_public_domain_or_unresolved_rows: onlyBlockedRows.length,
    blocked_only_non_public_domain_or_unresolved_occurrences: sum(onlyBlockedRows.map((row) => row.occurrences)),
    no_sefaria_hit_rows: noHitRows.length,
    no_sefaria_hit_occurrences: sum(noHitRows.map((row) => row.occurrences)),
    projected_final_hint_occurrences_if_strict_exact_later_clears: 40073 + sum(strictRows.map((row) => row.occurrences)),
    projected_final_hint_occurrences_if_prefix_clitic_later_clears: 40073 + sum([...strictRows, ...prefixRows].map((row) => row.occurrences)),
    answer_rows_emitted: 0,
    source_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    issues: issues.length,
    warnings: warnings.length,
  },
  category_summary: summarizeBy(rows, 'category'),
  preview_relation_summary: summarizeBy(rows.filter((row) => row.public_domain_observed_entry_count > 0), 'preview_relation_class'),
  preview_status_summary: summarizeBy(rows, 'preview_status'),
  top_public_domain_preview_rows: pdRows.slice(0, 60).map((row) => ({
    token_id: row.token_id,
    source_audit_priority: row.source_audit_priority,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    category: row.category,
    preview_status: row.preview_status,
    preview_relation_class: row.preview_relation_class,
    public_domain_lexicons: row.public_domain_lexicons,
    public_domain_headwords: row.public_domain_headwords.slice(0, 8),
    public_domain_citation_metadata_present: row.public_domain_citation_metadata_present,
  })),
  rows,
  required_unblock_route: [
    'Agent 1/6 must decide whether observed Public Domain metadata for BDB, BDB Aramaic, and Jastrow is sufficient custody evidence.',
    'Agent 2 must implement only deterministic morphology rules before any prefix/clitic row can move beyond preview.',
    'Klein Dictionary remains excluded unless Agent 1/6 approves CC-BY-NC public/runtime use.',
    'BDB Augmented Strong remains excluded unless independent license/custody evidence is supplied.',
    'A later transform still must store approved answer text from a cleared source field; this preview intentionally stores none.',
  ],
  issues,
  warnings,
  what_must_not_be_accepted: [
    'QA acceptance',
    'Validated public/runtime acceptance',
    'License clearance',
    'Source custody',
    'Source/provenance acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Translation output',
    'Accepted gloss',
    'Accepted translation text',
    'Public HUD mutation',
    'Route JSONL mutation',
    'Source-file mutation',
    'Publication readiness',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Orot Sefaria public-domain candidate preview complete: ${options.report}`);
if (issues.length) process.exit(1);

function previewRow(row) {
  const entries = row.query_results.flatMap((result) => result.entries.map((entry) => ({
    ...entry,
    query_kind: result.query_kind,
    query: result.query,
  })));
  const publicDomainEntries = entries.filter((entry) => familyState.publicDomain.has(entry.parent_lexicon));
  const blockedEntries = entries.filter((entry) => !familyState.publicDomain.has(entry.parent_lexicon));
  const relationClass = relationFor(row, publicDomainEntries);
  const citationMetadataPresent = publicDomainEntries.some((entry) => Boolean(entry.rid) || Number(entry.refs_count || 0) > 0 || Boolean(entry.parent_lexicon_details?.source_url));
  return {
    queue_id: row.queue_id,
    source_audit_priority: row.source_audit_priority,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    category: row.category,
    agent2_lane: row.agent2_lane,
    current_route_card_count: row.current_route_card_count,
    current_answer_eligible_count: row.current_answer_eligible_count,
    current_ambiguity_count: row.current_ambiguity_count,
    current_candidate_count: row.current_candidate_count,
    current_dominant_failure_reason: row.current_dominant_failure_reason,
    sefaria_combined_hit_count: row.combined_hit_count,
    public_domain_observed_entry_count: publicDomainEntries.length,
    blocked_or_unresolved_entry_count: blockedEntries.length,
    public_domain_lexicons: [...new Set(publicDomainEntries.map((entry) => entry.parent_lexicon).filter(Boolean))].sort(),
    blocked_or_unresolved_lexicons: [...new Set(blockedEntries.map((entry) => entry.parent_lexicon).filter(Boolean))].sort(),
    public_domain_headwords: [...new Set(publicDomainEntries.map((entry) => entry.headword).filter(Boolean))].sort(),
    public_domain_rids: [...new Set(publicDomainEntries.map((entry) => entry.rid).filter(Boolean))].sort().slice(0, 12),
    public_domain_refs_count: sum(publicDomainEntries.map((entry) => entry.refs_count)),
    public_domain_refs_sample: [...new Set(publicDomainEntries.flatMap((entry) => entry.refs_sample || []))].slice(0, 8),
    public_domain_citation_metadata_present: citationMetadataPresent,
    preview_relation_class: relationClass,
    preview_status: previewStatus(row, publicDomainEntries, blockedEntries, relationClass),
    answer_eligible_now: false,
    emitted_answer_row_now: false,
    source_row_emitted_now: false,
    transform_blockers: transformBlockers(publicDomainEntries, relationClass, citationMetadataPresent),
  };
}

function previewStatus(row, publicDomainEntries, blockedEntries, relationClass) {
  if (publicDomainEntries.length > 0 && relationClass === 'exact_after_mark_strip') return 'strict_public_domain_metadata_hit_pending_agent1_6_custody';
  if (publicDomainEntries.length > 0 && relationClass === 'prefix_or_clitic_possible') return 'public_domain_metadata_hit_pending_morphology_and_agent1_6_custody';
  if (publicDomainEntries.length > 0) return 'public_domain_metadata_hit_pending_disambiguation_and_agent1_6_custody';
  if (blockedEntries.length > 0 || row.combined_hit_count > 0) return 'blocked_only_non_public_domain_or_unresolved_hits';
  return 'no_sefaria_hit';
}

function transformBlockers(publicDomainEntries, relationClass, citationMetadataPresent) {
  const blockers = ['missing_agent1_6_custody_disposition', 'answer_text_not_stored_by_preview'];
  if (!publicDomainEntries.length) blockers.push('no_public_domain_observed_entry');
  if (relationClass !== 'exact_after_mark_strip') blockers.push('missing_approved_morphology_relation');
  if (!citationMetadataPresent) blockers.push('missing_public_domain_citation_metadata');
  return blockers;
}

function relationFor(row, entries) {
  if (!entries.length) return 'none';
  const normalized = stripHebrewMarks(row.normalized || row.surface || '');
  const surface = stripHebrewMarks(row.surface || row.normalized || '');
  const headwords = entries.map((entry) => stripHebrewMarks(entry.headword || '')).filter(Boolean);
  if (headwords.some((headword) => headword === normalized || headword === surface)) return 'exact_after_mark_strip';
  if (headwords.some((headword) => normalized.endsWith(headword) || surface.endsWith(headword))) return 'prefix_or_clitic_possible';
  return 'needs_morphology_disambiguation';
}

function buildFamilyState(scout) {
  const publicDomain = new Set();
  const blocked = new Set();
  for (const row of scout.observations || []) {
    if (row.observed_license === 'Public Domain' && String(row.interim_status || '').startsWith('candidate_public_domain')) publicDomain.add(row.family);
    else blocked.add(row.family);
  }
  return { publicDomain, blocked };
}

function summarizeBy(rowsToSummarize, field) {
  const out = {};
  for (const row of rowsToSummarize) {
    const key = row[field] || 'none';
    out[key] ||= { rows: 0, occurrences: 0 };
    out[key].rows += 1;
    out[key].occurrences += Number(row.occurrences || 0);
  }
  return out;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 2 Orot Sefaria Public-Domain Candidate Preview',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only public-domain-observed preview derived from the Sefaria top-500 hit audit and license scout addendum.',
    '- This is not an answer transform and not a source-custody disposition.',
    '- It emits zero answer rows, source rows, route JSONL rows, public HUD rows, and definition-content rows.',
    '- Public Domain means observed in Sefaria version metadata only. Agent 1/6 must still decide custody and use.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Audited rows / occurrences: ${data.summary.audited_rows} / ${data.summary.audited_occurrences}`,
    `- Sefaria hit rows / occurrences: ${data.summary.sefaria_hit_rows} / ${data.summary.sefaria_hit_occurrences}`,
    `- Public-domain-observed rows / occurrences: ${data.summary.public_domain_observed_rows} / ${data.summary.public_domain_observed_occurrences}`,
    `- Public-domain-observed occurrence rate: ${pct(data.summary.public_domain_observed_occurrence_rate)}`,
    `- Strict exact preview rows / occurrences: ${data.summary.strict_exact_preview_rows} / ${data.summary.strict_exact_preview_occurrences}`,
    `- Prefix/clitic preview rows / occurrences: ${data.summary.prefix_or_clitic_preview_rows} / ${data.summary.prefix_or_clitic_preview_occurrences}`,
    `- Morphology-disambiguation rows / occurrences: ${data.summary.morphology_disambiguation_rows} / ${data.summary.morphology_disambiguation_occurrences}`,
    `- Public-domain rows with citation metadata: ${data.summary.public_domain_rows_with_citation_metadata}`,
    `- Blocked-only non-public-domain or unresolved rows / occurrences: ${data.summary.blocked_only_non_public_domain_or_unresolved_rows} / ${data.summary.blocked_only_non_public_domain_or_unresolved_occurrences}`,
    `- No Sefaria hit rows / occurrences: ${data.summary.no_sefaria_hit_rows} / ${data.summary.no_sefaria_hit_occurrences}`,
    `- Projected final hint occurrences if strict exact rows later clear: ${data.summary.projected_final_hint_occurrences_if_strict_exact_later_clears}`,
    `- Projected final hint occurrences if prefix/clitic rows later clear too: ${data.summary.projected_final_hint_occurrences_if_prefix_clitic_later_clears}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Source rows emitted: ${data.summary.source_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## License Boundary Used For Preview',
    '',
    `- Included observed-public-domain families: ${data.license_boundary_used_for_preview.included_observed_public_domain_families.join(', ')}`,
    `- Excluded noncommercial/unresolved families: ${data.license_boundary_used_for_preview.excluded_noncommercial_or_unresolved_families.join(', ')}`,
    '',
    '## Relation Summary',
    '',
    ...Object.entries(data.preview_relation_summary).map(([key, value]) => `- ${key}: ${value.rows} rows / ${value.occurrences} occurrences`),
    '',
    '## Top Public-Domain Preview Rows',
    '',
    '| Priority | Token | Surface | Occurrences | Status | Relation | Public-Domain Lexicons | Headwords |',
    '| ---: | --- | --- | ---: | --- | --- | --- | --- |',
    ...data.top_public_domain_preview_rows.slice(0, 40).map((row) => `| ${row.source_audit_priority} | ${row.token_id} | ${escapeMd(row.surface)} | ${row.occurrences} | ${row.preview_status} | ${row.preview_relation_class} | ${escapeMd(row.public_domain_lexicons.join('; '))} | ${escapeMd(row.public_domain_headwords.join('; '))} |`),
    '',
    '## Required Unblock Route',
    '',
    ...data.required_unblock_route.map((item) => `- ${item}`),
    '',
    '## Agent 8 Callback',
    '',
    '- Status: public-domain-observed candidate preview produced.',
    `- Artifact path: ${data.outputs.markdown_report}`,
    '- Selected page or blocker: Orot flagship data-fill preview; no public page mutation.',
    '- Agent 1 needed: yes, for custody and license verification by public-domain-observed family.',
    '- Agent 2 needed: yes, for deterministic morphology and later zero-or-safe transform after custody boundary.',
    '- Agent 4 needed: no, because no public/runtime artifact changed.',
    '- Agent 7/13 decision needed: only if noncommercial/unresolved lexicons are proposed for storage or display.',
    '- Next recommended executable route: Agent 1/6 disposition for BDB/Jastrow/BDB Aramaic, then Agent 2 strict-exact transform dry run.',
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
    if (arg === '--hit-audit') parsed.hitAudit = cleanRelativePath(argv[++index]);
    else if (arg === '--license-scout') parsed.licenseScout = cleanRelativePath(argv[++index]);
    else if (arg === '--transform-spec') parsed.transformSpec = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent2_orot_sefaria_public_domain_candidate_preview.mjs');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sha256File(relativePath) {
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function stripHebrewMarks(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0591-\u05C7]/g, '');
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

function pct(value) {
  return `${Math.round(Number(value || 0) * 1000) / 10}%`;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function escapeMd(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
}
