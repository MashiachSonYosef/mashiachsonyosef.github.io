#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = 'data/build/orot/reader-hint-placeholder-candidates.json';
const packetPath = 'reports/agent10-agent6-ready-orot-205-row-commercial-clean-subset-2026-06-04.json';
const verdictPath = 'reports/agent6-orot-205-row-commercial-clean-subset-verdict-2026-06-04.md';
const proofJsonPath = 'reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.json';
const proofMdPath = 'reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.md';

const pkg = readJson(packagePath);
const packet = readJson(packetPath);
const rows = packet.rows || [];

if (pkg.counts?.placeholder_rows !== 127 || pkg.counts?.placeholder_occurrences !== 4389) {
  throw new Error(`unexpected anchor ${pkg.counts?.placeholder_rows}/${pkg.counts?.placeholder_occurrences}`);
}
if (rows.length !== 205 || sum(rows.map((row) => row.occurrences)) !== 1767) {
  throw new Error('candidate packet is not 205 rows / 1767 occurrences');
}

const existing = new Set(pkg.rows.map((row) => row.token_id));
const duplicates = rows.filter((row) => existing.has(row.token_id));
if (duplicates.length) {
  throw new Error(`candidate rows already present: ${duplicates.map((row) => row.token_id).join(', ')}`);
}

const appendedRows = rows.map((row) => ({
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  inline_display: 'TBD',
  display: 'TBD',
  counterpart_text: 'TBD',
  label: row.label,
  label_status: row.label_status,
  placeholder_status: 'non_public_commercial_clean_planning_record',
  status: 'agent6_cleared_non_public_205_row_commercial_clean_planning_append',
  subset: 'agent6_2026_06_04_205_row_commercial_clean',
  lane: row.lane,
  family_status: row.lane,
  source_license_group: row.source_license_group,
  derived_from_nc: false,
  commercial_export_allowed: true,
  attribution_required: false,
  corpus_contamination: false,
  planned_counterpart_text: row.planned_counterpart_text,
  display_status: row.display_status,
  preview_relation_class: row.preview_relation_class,
  preview_status: row.preview_status,
  source_audit_priority: row.source_audit_priority,
  category: row.category,
  public_domain_lexicons: row.public_domain_lexicons || [],
  public_domain_headwords: row.public_domain_headwords || [],
  public_domain_rids: row.public_domain_rids || [],
  public_domain_refs_count: row.public_domain_refs_count || 0,
  public_domain_refs_sample: row.public_domain_refs_sample || [],
  public_domain_citation_metadata_present: row.public_domain_citation_metadata_present === true,
  blocked_or_unresolved_lexicons: row.blocked_or_unresolved_lexicons || [],
  transform_blockers: row.transform_blockers || [],
  missing_agent1_6_custody_disposition_preserved: (row.transform_blockers || []).includes('missing_agent1_6_custody_disposition'),
  answer_text_not_stored_by_preview_preserved: (row.transform_blockers || []).includes('answer_text_not_stored_by_preview'),
  morphology_relation_blocker_preserved: (row.transform_blockers || []).includes('missing_approved_morphology_relation'),
  definition_text_stored_now: false,
  nc_definition_content_stored_now: false,
  answer_eligible: false,
  promote_to_answer: false,
  approved_for_public_emit: false,
  public_emit_ready: false,
  public_hud_emit_allowed: false,
  route_jsonl_emit_allowed: false,
  accepted_text: false,
  public_mutation_allowed_here: false,
  runtime_mutation_allowed_here: false,
  cleared_by_agent6_verdict: verdictPath,
  non_public_candidate_planning: true,
}));

pkg.generated_at = new Date().toISOString();
pkg.generated_from = [...new Set([...(Array.isArray(pkg.generated_from) ? pkg.generated_from : [pkg.generated_from].filter(Boolean)), packetPath, verdictPath])];
pkg.rows = [...pkg.rows, ...appendedRows];
pkg.hints_by_token_id = Object.fromEntries(pkg.rows.map((row) => [row.token_id, row]));
pkg.append_history = [
  ...(pkg.append_history || []),
  {
    appended_at: new Date().toISOString(),
    candidate_packet: packetPath,
    agent6_verdict: verdictPath,
    rows_appended: appendedRows.length,
    occurrences_appended: sum(appendedRows.map((row) => row.occurrences)),
    relation_classes: relationCounts(appendedRows),
    boundary: 'non-public commercial-clean planning append only; zero public/output/answer/definition emissions',
  },
];
pkg.counts = packageCounts(pkg.rows);

writeJson(packagePath, pkg);

const proof = {
  schema_version: 1,
  artifact_type: 'agent10_orot_205_row_commercial_clean_post_append_proof',
  generated_at: new Date().toISOString(),
  package_path: packagePath,
  candidate_packet: packetPath,
  agent6_verdict: verdictPath,
  source_hashes: {
    package_sha256_after: sha(packagePath),
    candidate_packet_sha256: sha(packetPath),
    agent6_verdict_sha256: sha(verdictPath),
  },
  summary: {
    rows_appended: appendedRows.length,
    occurrences_appended: sum(appendedRows.map((row) => row.occurrences)),
    package_rows_after: pkg.counts.placeholder_rows,
    package_occurrences_after: pkg.counts.placeholder_occurrences,
    commercial_clean_rows_after: pkg.counts.commercial_clean_rows,
    commercial_clean_occurrences_after: pkg.counts.commercial_clean_occurrences,
    noncommercial_educational_rows_after: pkg.counts.noncommercial_educational_rows,
    noncommercial_educational_occurrences_after: pkg.counts.noncommercial_educational_occurrences,
    display_integrity_tbd_rows_after: pkg.counts.display_integrity_tbd_rows,
    display_integrity_tbd_occurrences_after: pkg.counts.display_integrity_tbd_occurrences,
  },
  relation_classes_appended: relationCounts(appendedRows),
  controls: {
    only_agent6_cleared_205_rows_appended: true,
    planned_counterpart_text_preserved_as_tbd: appendedRows.every((row) => row.planned_counterpart_text === 'TBD'),
    display_fields_preserved_as_tbd: appendedRows.every((row) => row.inline_display === 'TBD' && row.display === 'TBD' && row.counterpart_text === 'TBD'),
    source_metadata_preserved: appendedRows.every((row) => Array.isArray(row.public_domain_lexicons) && Array.isArray(row.public_domain_headwords) && Array.isArray(row.transform_blockers)),
    blockers_preserved: appendedRows.every((row) => row.missing_agent1_6_custody_disposition_preserved && row.answer_text_not_stored_by_preview_preserved),
    non_exact_rows_not_transform_ready: appendedRows.filter((row) => row.preview_relation_class !== 'exact_after_mark_strip').every((row) => row.morphology_relation_blocker_preserved),
  },
  outputs_now: zeroOutputs(),
  stop_condition: 'Stop after post-append proof and validation; no public/runtime/output mutation or answer eligibility created.',
  highest_permissible_claim: 'Only the 205 rows explicitly cleared by Agent 6 were appended to the non-public Orot placeholder package under exact planning-only boundary.',
  not_accepted: [
    'QA acceptance beyond exact docket',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss',
    'accepted text',
    'public reader output',
  ],
};

writeJson(proofJsonPath, proof);
writeMd(proofMdPath, proof);

function packageCounts(rows) {
  const commercial = rows.filter((row) => row.lane === 'commercial_clean_candidate');
  const nc = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');
  const tbd = rows.filter((row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd');
  return {
    placeholder_rows: rows.length,
    placeholder_occurrences: sum(rows.map((row) => row.occurrences)),
    commercial_clean_rows: commercial.length,
    commercial_clean_occurrences: sum(commercial.map((row) => row.occurrences)),
    noncommercial_educational_rows: nc.length,
    noncommercial_educational_occurrences: sum(nc.map((row) => row.occurrences)),
    display_integrity_tbd_rows: tbd.length,
    display_integrity_tbd_occurrences: sum(tbd.map((row) => row.occurrences)),
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    accepted_text_rows: 0,
  };
}

function relationCounts(rows) {
  const counts = {};
  for (const row of rows) {
    const key = row.preview_relation_class || 'unknown';
    counts[key] ||= { rows: 0, occurrences: 0 };
    counts[key].rows += 1;
    counts[key].occurrences += Number(row.occurrences || 0);
  }
  return counts;
}

function zeroOutputs() {
  return {
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, proof) {
  fs.writeFileSync(path.join(root, file), [
    '# Agent 10 Orot 205-Row Commercial-Clean Post-Append Proof',
    '',
    `- Package: \`${proof.package_path}\``,
    `- Candidate packet: \`${proof.candidate_packet}\``,
    `- Agent 6 verdict: \`${proof.agent6_verdict}\``,
    `- Rows appended: ${proof.summary.rows_appended}`,
    `- Occurrences appended: ${proof.summary.occurrences_appended}`,
    `- Package after: ${proof.summary.package_rows_after} rows / ${proof.summary.package_occurrences_after} occurrences`,
    `- Commercial-clean after: ${proof.summary.commercial_clean_rows_after} rows / ${proof.summary.commercial_clean_occurrences_after} occurrences`,
    `- NC educational after: ${proof.summary.noncommercial_educational_rows_after} rows / ${proof.summary.noncommercial_educational_occurrences_after} occurrences`,
    `- TBD display-integrity after: ${proof.summary.display_integrity_tbd_rows_after} rows / ${proof.summary.display_integrity_tbd_occurrences_after} occurrences`,
    '',
    '## Relation Classes Appended',
    '',
    ...Object.entries(proof.relation_classes_appended).map(([key, value]) => `- \`${key}\`: ${value.rows} rows / ${value.occurrences} occurrences`),
    '',
    '## Zero Outputs',
    '',
    ...Object.entries(proof.outputs_now).map(([key, value]) => `- \`${key}\`: ${value}`),
    '',
    '## Boundary',
    '',
    proof.highest_permissible_claim,
    '',
    'No QA/source/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, and no public reader output are created by this append.',
    '',
  ].join('\n'));
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
