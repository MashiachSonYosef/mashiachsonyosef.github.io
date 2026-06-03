#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  licenseScout: 'reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json',
  hitAudit: 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json',
  publicDomainPreview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json',
  transformContract: 'reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md',
  missingLinkage: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json',
  missingLinkageDocket: 'reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.json',
  sourceRowEvidence: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  routingCallback: 'reports/agent10-agent8-orot-support-matrix-routing-callback-2026-06-03.md',
  jsonReport: `reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-${dateSlug}.json`,
  report: `reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-${dateSlug}.md`,
  ...parseArgs(process.argv.slice(2)),
};

const generatedAt = new Date().toISOString();
const licenseScout = readJson(options.licenseScout);
const hitAudit = readJson(options.hitAudit);
const preview = readJson(options.publicDomainPreview);
const missingLinkage = readJson(options.missingLinkage);
const missingLinkageDocket = readJson(options.missingLinkageDocket);
const sourceRowEvidence = readJson(options.sourceRowEvidence);
const issues = [];
const warnings = [];

if (licenseScout.artifact_type !== 'agent10_sefaria_lexicon_license_scout_addendum') issues.push('license scout artifact type mismatch');
if (hitAudit.artifact_type !== 'agent2_orot_sefaria_lexicon_hit_audit') issues.push('hit audit artifact type mismatch');
if (preview.artifact_type !== 'agent2_orot_sefaria_public_domain_candidate_preview') issues.push('public-domain preview artifact type mismatch');
if (missingLinkage.artifact_type !== 'agent1_orot_missing_lexicon_linkage_candidates') issues.push('missing-linkage artifact type mismatch');
if (missingLinkageDocket.artifact_type !== 'agent10_agent1_ready_orot_missing_linkage_review_docket') issues.push('missing-linkage docket artifact type mismatch');
if (sourceRowEvidence.artifact_type !== 'agent1_orot_fill_source_row_evidence') issues.push('source-row evidence artifact type mismatch');

const lexiconSummary = new Map((hitAudit.lexicon_summary || []).map((row) => [row.lexicon, row]));
const previewRowsByFamily = buildPreviewRowsByFamily(preview.rows || []);
const familyRequests = (licenseScout.observations || []).map((row) => familyRequest(row, lexiconSummary.get(row.family), previewRowsByFamily.get(row.family)));
const linkageRows = missingLinkage.candidates || [];
const missingCounts = missingLinkage.counts || missingLinkage.summary || {};
const sourceSummary = sourceRowEvidence.summary || {};

if (familyRequests.length !== 5) issues.push('expected five Sefaria lexicon family requests');
if ((missingCounts.missing_lexicon_linkage_rows || 0) !== 13) warnings.push('missing-linkage row count is not 13');
if ((sourceSummary.target_count || 0) < 1) warnings.push('source-row evidence target count is empty');

const output = {
  schema_version: 1,
  artifact_type: 'agent10_agent1_ready_orot_sefaria_family_custody_matrix_request',
  generated_at: generatedAt,
  generator: 'scripts/build_agent10_agent1_orot_sefaria_family_custody_matrix_request.mjs',
  boundary: {
    status: issues.length ? 'blocked_agent1_family_custody_matrix_request' : (warnings.length ? 'warn_agent1_family_custody_matrix_request_not_accepted' : 'agent1_family_custody_matrix_request_not_accepted'),
    evidence_only: true,
    request_only: true,
    matrix_request_only: true,
    no_license_acceptance: true,
    no_source_custody: true,
    no_source_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_translation_text: true,
    no_answer_rows: true,
    no_answer_candidates_emitted: true,
    no_source_rows_emitted: true,
    no_lexicon_entry_id_assignment: true,
    no_public_hud_mutation: true,
    no_route_jsonl_mutation: true,
    no_runtime_mutation: true,
    no_publication_readiness: true,
    no_qa_acceptance: true,
  },
  inputs: {
    license_scout: options.licenseScout,
    license_scout_sha256: sha256File(options.licenseScout),
    hit_audit: options.hitAudit,
    hit_audit_sha256: sha256File(options.hitAudit),
    public_domain_preview: options.publicDomainPreview,
    public_domain_preview_sha256: sha256File(options.publicDomainPreview),
    transform_contract: options.transformContract,
    transform_contract_sha256: sha256File(options.transformContract),
    missing_linkage: options.missingLinkage,
    missing_linkage_sha256: sha256File(options.missingLinkage),
    missing_linkage_docket: options.missingLinkageDocket,
    missing_linkage_docket_sha256: sha256File(options.missingLinkageDocket),
    source_row_evidence: options.sourceRowEvidence,
    source_row_evidence_sha256: sha256File(options.sourceRowEvidence),
    routing_callback: options.routingCallback,
    routing_callback_sha256: sha256File(options.routingCallback),
  },
  outputs: {
    json_report: options.jsonReport,
    markdown_report: options.report,
    answer_rows: 0,
    answer_candidate_rows: 0,
    source_rows: 0,
    lexicon_entry_id_assignments: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    runtime_files_touched: [],
    source_files_touched: [],
  },
  summary: {
    status: issues.length ? 'blocked_agent1_family_custody_matrix_request' : (warnings.length ? 'warn_agent1_family_custody_matrix_request_not_accepted' : 'agent1_family_custody_matrix_request_not_accepted'),
    family_requests: familyRequests.length,
    candidate_public_domain_families: familyRequests.filter((row) => row.requested_default_status === 'candidate_public_domain_needs_custody_review').length,
    blocked_or_unresolved_families: familyRequests.filter((row) => row.requested_default_status !== 'candidate_public_domain_needs_custody_review').length,
    top500_hit_rows: hitAudit.summary?.rows_with_any_hit || 0,
    top500_hit_occurrences: hitAudit.summary?.occurrences_with_any_hit || 0,
    public_domain_observed_rows: preview.summary?.public_domain_observed_rows || 0,
    public_domain_observed_occurrences: preview.summary?.public_domain_observed_occurrences || 0,
    strict_exact_preview_rows: preview.summary?.strict_exact_preview_rows || 0,
    strict_exact_preview_occurrences: preview.summary?.strict_exact_preview_occurrences || 0,
    prefix_or_clitic_preview_rows: preview.summary?.prefix_or_clitic_preview_rows || 0,
    prefix_or_clitic_preview_occurrences: preview.summary?.prefix_or_clitic_preview_occurrences || 0,
    missing_linkage_rows: missingCounts.missing_lexicon_linkage_rows || 0,
    missing_linkage_occurrences: missingCounts.missing_lexicon_linkage_occurrences || 0,
    source_row_evidence_targets: sourceSummary.target_count || 0,
    source_row_evidence_token_occurrences: sourceSummary.token_occurrence_count || 0,
    answer_rows_emitted: 0,
    answer_candidate_rows_emitted: 0,
    source_rows_emitted: 0,
    lexicon_entry_ids_assigned: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    issues: issues.length,
    warnings: warnings.length,
  },
  requested_agent1_matrix_schema: {
    target_agent: 'Agent 1',
    required_status_values: [
      'cleared_for_storage_and_display_candidate',
      'cleared_for_metadata_only',
      'cleared_for_external_link_or_citation_only',
      'blocked_unresolved_license',
      'blocked_source_custody_gap',
      'blocked_attribution_gap',
      'blocked_noncommercial_or_policy_gap',
    ],
    required_family_fields: [
      'family',
      'observed_license',
      'observed_version_title',
      'observed_version_source',
      'custody_status',
      'storage_allowed',
      'display_allowed',
      'metadata_only_allowed',
      'external_link_only_allowed',
      'required_attribution',
      'source_manifest_requirement',
      'definition_text_storage_scope',
      'agent1_evidence_path',
      'exact_blocker_if_blocked',
    ],
    required_linkage_fields: [
      'token_id',
      'surface',
      'normalized',
      'occurrences',
      'linkage_candidate_bucket',
      'recommended_agent1_status',
      'acceptable_later_linkage_rule',
      'source_evidence_path',
      'exact_blocker_if_blocked',
    ],
  },
  family_requests: familyRequests,
  missing_linkage_review_request: {
    source_artifact: options.missingLinkage,
    rows: linkageRows.length,
    occurrences: missingCounts.missing_lexicon_linkage_occurrences || 0,
    bucket_counts: missingCounts.bucket_counts || {},
    bucket_occurrences: missingCounts.bucket_occurrences || {},
    rows_for_agent1: linkageRows.map((row) => ({
      token_id: row.token_id,
      surface: row.surface,
      normalized: row.normalized,
      occurrences: row.occurrences,
      prefix_class: row.prefix_class,
      prefix_stem_key: row.prefix_stem_key,
      linkage_candidate_bucket: row.linkage_candidate_bucket,
      candidate_edge_count: row.candidate_edge_count,
      project_preferred_edge_count: row.project_preferred_edge_count,
      requested_agent1_status: requestedLinkageStatus(row),
      mutation_allowed_here: false,
    })),
  },
  source_row_evidence_request: {
    source_artifact: options.sourceRowEvidence,
    target_count: sourceSummary.target_count || 0,
    chunk_entry_count: sourceSummary.chunk_entry_count || 0,
    token_occurrence_count: sourceSummary.token_occurrence_count || 0,
    targets_with_expected_clean_source_layer_row: sourceSummary.targets_with_expected_clean_source_layer_row || 0,
    targets_missing_clean_chunk_attachment: sourceSummary.targets_missing_clean_chunk_attachment || 0,
    requested_agent1_review: 'Confirm whether these source-row evidence targets are sufficient as evidence inputs for later Agent 6 review; do not claim custody acceptance from this request.',
  },
  next_route_after_agent1: {
    target_agent: 'Agent 6',
    objective: 'Review Agent 1 family/source/linkage matrix plus Agent 10 transform contract and issue pass/warn/block boundary before any Agent 2 fill-producing dry run.',
    agent2_allowed_after_agent6_only: 'zero-or-safe dry run over cleared families and cleared linkage rows only; no public/runtime output without later approval.',
    agent4_allowed_after_package_change_only: 'runtime proof only after Agent 10 creates a changed candidate package.',
  },
  agent8_callback: {
    status: 'Agent 1-ready Sefaria family custody and Orot linkage matrix request produced.',
    artifact_path: options.report,
    current_bottleneck: 'Agent 1 source/license/linkage matrix.',
    next_executable_route: 'Route this packet to Agent 1; freeze Agent 2 fill-producing work and Agent 4 runtime proof until Agent 1 returns.',
    agent1_needed: true,
    agent2_needed_now: false,
    agent4_needed_now: false,
    agent6_needed_after_agent1: true,
    agent13_needed_now: 'Only for policy exceptions, candidate-label policy, project-preferred arbitration, or top-N expansion.',
  },
  issues,
  warnings,
  what_must_not_be_accepted: [
    'QA acceptance',
    'Source/provenance acceptance',
    'License acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Answer acceptance',
    'Public/runtime acceptance',
    'Publication readiness',
    'Route publication support',
    'Product/data acceptance',
    'Translation output',
    'Accepted text',
  ],
};

writeJson(options.jsonReport, output);
writeReport(options.report, output);
console.log(`Agent 1 Orot Sefaria family custody matrix request complete: ${options.report}`);
if (issues.length) process.exit(1);

function familyRequest(row, hitSummary, previewSummary) {
  const isCandidatePublicDomain = row.observed_license === 'Public Domain' && String(row.interim_status || '').startsWith('candidate_public_domain');
  return {
    family: row.family,
    word_api_name: row.word_api_name,
    version_endpoint_title: row.version_endpoint_title,
    version_endpoint_url: row.version_endpoint_url,
    observed_license: row.observed_license,
    observed_version_title: row.observed_version_title,
    observed_version_source: row.observed_version_source,
    observed_status: row.observed_status,
    observed_digitized_by_sefaria: row.observed_digitized_by_sefaria,
    observed_language: row.observed_language,
    scout_interim_status: row.interim_status,
    requested_default_status: isCandidatePublicDomain ? 'candidate_public_domain_needs_custody_review' : 'blocked_or_metadata_only_until_agent1_review',
    top500_hit_rows: hitSummary?.row_hits || 0,
    top500_hit_occurrences: hitSummary?.occurrence_hits || 0,
    top500_entry_hits: hitSummary?.entry_hits || 0,
    preview_public_domain_rows: previewSummary?.rows || 0,
    preview_public_domain_occurrences: previewSummary?.occurrences || 0,
    requested_agent1_questions: [
      'Is the observed license/version metadata sufficient for a later source-custody packet?',
      'Is metadata-only storage allowed in reports while answer text remains omitted?',
      'Can definition text be stored locally if later selected by Agent 2?',
      'Can answer text be displayed publicly as a reader hint if later selected by Agent 2?',
      'What attribution text, source URL, and source manifest row are required?',
      'If blocked, what exact source/license/custody evidence would unblock the family?',
    ],
    current_agent10_boundary: isCandidatePublicDomain ? 'planning_metadata_only_until_agent1_6_disposition' : 'blocked_or_metadata_only_until_explicit_disposition',
    answer_rows_allowed_now: false,
    public_hud_rows_allowed_now: false,
    route_jsonl_rows_allowed_now: false,
  };
}

function buildPreviewRowsByFamily(rows) {
  const byFamily = new Map();
  for (const row of rows) {
    for (const family of row.public_domain_lexicons || []) {
      const current = byFamily.get(family) || { rows: 0, occurrences: 0 };
      current.rows += 1;
      current.occurrences += Number(row.occurrences || 0);
      byFamily.set(family, current);
    }
  }
  return byFamily;
}

function requestedLinkageStatus(row) {
  if (row.linkage_candidate_bucket === 'no_current_stem_source_candidate_found') return 'blocked_no_current_stem_source_candidate_found';
  if (row.linkage_candidate_bucket === 'multi_stem_no_project_preferred_candidate') return 'needs_agent13_or_agent1_linkage_arbitration_policy';
  if (row.linkage_candidate_bucket === 'project_preferred_function_word_stem_candidate_exists') return 'candidate_needs_project_preferred_policy_and_source_review';
  return 'candidate_needs_source_linkage_review';
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Agent 1-Ready Orot Sefaria Family Custody Matrix Request',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence-only request packet for Agent 1 source/license/linkage review.',
    '- This packet does not accept license, source custody, source provenance, definitions, answers, QA, public/runtime state, or publication readiness.',
    '- It emits zero answer rows, source rows, public HUD rows, route JSONL rows, and lexicon-entry assignments.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Family requests: ${data.summary.family_requests}`,
    `- Candidate public-domain families needing custody review: ${data.summary.candidate_public_domain_families}`,
    `- Blocked or unresolved families: ${data.summary.blocked_or_unresolved_families}`,
    `- Top-500 Sefaria hit rows / occurrences: ${data.summary.top500_hit_rows} / ${data.summary.top500_hit_occurrences}`,
    `- Public-domain-observed rows / occurrences: ${data.summary.public_domain_observed_rows} / ${data.summary.public_domain_observed_occurrences}`,
    `- Strict exact preview rows / occurrences: ${data.summary.strict_exact_preview_rows} / ${data.summary.strict_exact_preview_occurrences}`,
    `- Prefix/clitic preview rows / occurrences: ${data.summary.prefix_or_clitic_preview_rows} / ${data.summary.prefix_or_clitic_preview_occurrences}`,
    `- Missing-linkage rows / occurrences: ${data.summary.missing_linkage_rows} / ${data.summary.missing_linkage_occurrences}`,
    `- Source-row evidence targets / occurrences: ${data.summary.source_row_evidence_targets} / ${data.summary.source_row_evidence_token_occurrences}`,
    `- Answer rows emitted: ${data.summary.answer_rows_emitted}`,
    `- Source rows emitted: ${data.summary.source_rows_emitted}`,
    `- Public HUD rows emitted: ${data.summary.public_hud_rows_emitted}`,
    `- Route JSONL rows emitted: ${data.summary.route_jsonl_rows_emitted}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Family Requests',
    '',
    '| Family | Observed License | Current Status | Hit Rows | Hit Occurrences | Preview Rows | Preview Occurrences |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: |',
    ...data.family_requests.map((row) => `| ${escapeMd(row.family)} | ${escapeMd(row.observed_license || 'none')} | ${escapeMd(row.requested_default_status)} | ${row.top500_hit_rows} | ${row.top500_hit_occurrences} | ${row.preview_public_domain_rows} | ${row.preview_public_domain_occurrences} |`),
    '',
    '## Requested Matrix Schema',
    '',
    `- Required family status values: ${data.requested_agent1_matrix_schema.required_status_values.join(', ')}`,
    `- Required family fields: ${data.requested_agent1_matrix_schema.required_family_fields.join(', ')}`,
    `- Required linkage fields: ${data.requested_agent1_matrix_schema.required_linkage_fields.join(', ')}`,
    '',
    '## Missing Linkage Review Request',
    '',
    `- Rows: ${data.missing_linkage_review_request.rows}`,
    `- Occurrences: ${data.missing_linkage_review_request.occurrences}`,
    `- Bucket counts: ${JSON.stringify(data.missing_linkage_review_request.bucket_counts)}`,
    '',
    '## Source Row Evidence Request',
    '',
    `- Targets: ${data.source_row_evidence_request.target_count}`,
    `- Chunk entries: ${data.source_row_evidence_request.chunk_entry_count}`,
    `- Token occurrences: ${data.source_row_evidence_request.token_occurrence_count}`,
    `- Request: ${data.source_row_evidence_request.requested_agent1_review}`,
    '',
    '## Next Route After Agent 1',
    '',
    `- Target: ${data.next_route_after_agent1.target_agent}`,
    `- Objective: ${data.next_route_after_agent1.objective}`,
    `- Agent 2 boundary: ${data.next_route_after_agent1.agent2_allowed_after_agent6_only}`,
    `- Agent 4 boundary: ${data.next_route_after_agent1.agent4_allowed_after_package_change_only}`,
    '',
    '## Agent 8 Callback',
    '',
    `- Status: ${data.agent8_callback.status}`,
    `- Artifact path: ${data.agent8_callback.artifact_path}`,
    `- Current bottleneck: ${data.agent8_callback.current_bottleneck}`,
    `- Next executable route: ${data.agent8_callback.next_executable_route}`,
    `- Agent 1 needed: ${data.agent8_callback.agent1_needed}`,
    `- Agent 2 needed now: ${data.agent8_callback.agent2_needed_now}`,
    `- Agent 4 needed now: ${data.agent8_callback.agent4_needed_now}`,
    `- Agent 6 needed after Agent 1: ${data.agent8_callback.agent6_needed_after_agent1}`,
    `- Agent 13 needed now: ${data.agent8_callback.agent13_needed_now}`,
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
    if (arg === '--license-scout') parsed.licenseScout = cleanRelativePath(argv[++index]);
    else if (arg === '--hit-audit') parsed.hitAudit = cleanRelativePath(argv[++index]);
    else if (arg === '--public-domain-preview') parsed.publicDomainPreview = cleanRelativePath(argv[++index]);
    else if (arg === '--transform-contract') parsed.transformContract = cleanRelativePath(argv[++index]);
    else if (arg === '--missing-linkage') parsed.missingLinkage = cleanRelativePath(argv[++index]);
    else if (arg === '--missing-linkage-docket') parsed.missingLinkageDocket = cleanRelativePath(argv[++index]);
    else if (arg === '--source-row-evidence') parsed.sourceRowEvidence = cleanRelativePath(argv[++index]);
    else if (arg === '--routing-callback') parsed.routingCallback = cleanRelativePath(argv[++index]);
    else if (arg === '--json-report') parsed.jsonReport = cleanRelativePath(argv[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/build_agent10_agent1_orot_sefaria_family_custody_matrix_request.mjs');
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

function escapeMd(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
}
