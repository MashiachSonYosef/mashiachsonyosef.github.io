#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const date = '2026-06-04';
const packagePath = 'data/build/orot/reader-hint-placeholder-candidates.json';
const outputPath = `reports/agent13-orot-ufm-matrix-${date}.json`;
const reportPath = `reports/agent13-orot-ufm-matrix-${date}.md`;

const pkg = readJson(packagePath);
const rows = pkg.rows || [];

const matrixRows = rows.map((row) => {
  const displayStatus = getDisplayStatus(row);
  return {
    token_id: row.token_id,
    hebrew_surface: row.surface,
    occurrence_count: Number(row.occurrences || 0),
    current_inline_english_display: row.inline_display || row.display || 'TBD',
    display_status: displayStatus,
    label: row.label,
    source_license_lane: getSourceLicenseLane(row),
    public_emit_status: getPublicEmitStatus(row),
    blocker: getBlocker(row),
    next_owner: getNextOwner(row),
  };
});

const counts = {
  rows: matrixRows.length,
  occurrences: sum(matrixRows.map((row) => row.occurrence_count)),
  commercial_clean_rows: count(rows, (row) => row.lane === 'commercial_clean_candidate'),
  commercial_clean_occurrences: sum(rows.filter((row) => row.lane === 'commercial_clean_candidate').map((row) => row.occurrences)),
  noncommercial_educational_rows: count(rows, (row) => row.lane === 'noncommercial_educational_candidate'),
  noncommercial_educational_occurrences: sum(rows.filter((row) => row.lane === 'noncommercial_educational_candidate').map((row) => row.occurrences)),
  tbd_display_integrity_rows: count(rows, (row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd'),
  tbd_display_integrity_occurrences: sum(rows.filter((row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd').map((row) => row.occurrences)),
  answer_rows: count(rows, (row) => row.answer_eligible === true || row.promote_to_answer === true),
  public_hud_rows: count(rows, (row) => row.public_hud_emit_allowed === true || row.public_emit_ready === true),
  route_jsonl_rows: count(rows, (row) => row.route_jsonl_emit_allowed === true),
  definition_content_rows: count(rows, (row) => row.definition_text_stored_now === true),
  nc_definition_content_rows: count(rows, (row) => row.nc_definition_content_stored_now === true),
};

const blockers = histogram(matrixRows.map((row) => row.blocker));
const nextOwners = histogram(matrixRows.map((row) => row.next_owner));
const displayStatuses = histogram(matrixRows.map((row) => row.display_status));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent13_orot_user_facing_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent13_orot_ufm_matrix.mjs',
  package_path: packagePath,
  package_sha256: sha256(packagePath),
  boundary: {
    status: 'ufm_non_public_planning_matrix_only',
    no_public_hud_output: true,
    no_route_jsonl_rows: true,
    no_route_shard_writes: true,
    no_runtime_files: true,
    no_public_mutation: true,
    no_source_files: true,
    no_definition_content_rows: true,
    no_nc_definition_content_rows: true,
    no_answer_eligibility: true,
    no_accepted_text: true,
    no_qa_acceptance: true,
    no_source_acceptance: true,
    no_license_acceptance: true,
    no_definition_authority: true,
    no_publication_readiness: true,
  },
  label_policy: {
    allowed_labels: ['counterpart candidate', 'project-preferred counterpart candidate'],
    tbd_semantics: 'display separator only; not definition, gloss, translation, or answer',
  },
  counts,
  histograms: {
    display_status: displayStatuses,
    blocker: blockers,
    next_owner: nextOwners,
  },
  rows: matrixRows,
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(path.join(root, reportPath), buildReport(artifact));

console.log(`wrote ${outputPath}`);
console.log(`wrote ${reportPath}`);

function getDisplayStatus(row) {
  if (row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd' || row.display_separator_only === true) {
    return 'tbd_display_separator_only';
  }
  if (row.lane === 'noncommercial_educational_candidate') {
    return 'pending_review_nc_educational_placeholder';
  }
  return 'pending_review_counterpart_placeholder';
}

function getSourceLicenseLane(row) {
  if (row.lane === 'noncommercial_educational_candidate') {
    return 'noncommercial_educational_candidate: CC_BY_NC; commercial_export_allowed=false';
  }
  if (row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd') {
    return 'display_integrity_tbd_placeholder: no usable definition candidate stored';
  }
  return `${row.lane || 'unknown'}: ${row.source_license_group || 'UNKNOWN'}`;
}

function getPublicEmitStatus(row) {
  if (row.public_emit_ready || row.public_hud_emit_allowed || row.route_jsonl_emit_allowed) {
    return 'unexpected_public_emit_flag';
  }
  return 'blocked_non_public_planning_only';
}

function getBlocker(row) {
  if (row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd' || row.display_separator_only === true) {
    return 'needs usable definition candidate; TBD is only a visual separator';
  }
  if (row.lane === 'noncommercial_educational_candidate') {
    return 'needs Agent 6-cleared NC educational display boundary before public use';
  }
  return 'needs Agent 6-cleared public mutation package before public use';
}

function getNextOwner(row) {
  if (row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd' || row.display_separator_only === true) {
    return 'Agent 2 via Agent 10';
  }
  return 'Agent 10 to Agent 6';
}

function buildReport(artifact) {
  const topRows = artifact.rows.slice(0, 20).map((row) => (
    `| ${escapeMd(row.token_id)} | ${escapeMd(row.hebrew_surface)} | ${row.occurrence_count} | ${escapeMd(row.current_inline_english_display)} | ${escapeMd(row.display_status)} | ${escapeMd(row.next_owner)} |`
  )).join('\n');
  return `# Agent 13 Orot UFM Matrix\n\n` +
    `Date: ${date}\n` +
    `Status: non-public planning matrix only\n\n` +
    `## Basis\n\n` +
    `- Package: \`${artifact.package_path}\`\n` +
    `- Package SHA-256: \`${artifact.package_sha256}\`\n` +
    `- Rows: \`${artifact.counts.rows}\`\n` +
    `- Occurrences: \`${artifact.counts.occurrences}\`\n` +
    `- Public HUD rows: \`${artifact.counts.public_hud_rows}\`\n` +
    `- Route JSONL rows: \`${artifact.counts.route_jsonl_rows}\`\n` +
    `- Answer rows: \`${artifact.counts.answer_rows}\`\n` +
    `- Definition-content rows: \`${artifact.counts.definition_content_rows}\`\n\n` +
    `## Lane Counts\n\n` +
    `- Commercial-clean placeholders: \`${artifact.counts.commercial_clean_rows}\` rows / \`${artifact.counts.commercial_clean_occurrences}\` occurrences\n` +
    `- Noncommercial educational placeholders: \`${artifact.counts.noncommercial_educational_rows}\` rows / \`${artifact.counts.noncommercial_educational_occurrences}\` occurrences\n` +
    `- TBD display-integrity placeholders: \`${artifact.counts.tbd_display_integrity_rows}\` rows / \`${artifact.counts.tbd_display_integrity_occurrences}\` occurrences\n\n` +
    `## First Rows\n\n` +
    `| token id | Hebrew | occurrences | inline English | display status | next owner |\n` +
    `| --- | --- | ---: | --- | --- | --- |\n` +
    `${topRows}\n\n` +
    `## Boundary\n\n` +
    `This matrix does not create public output, route rows, answer eligibility, accepted definitions, accepted glosses, translations, source acceptance, license acceptance, QA acceptance, or publication readiness.\n`;
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function sha256(relPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relPath))).digest('hex');
}

function count(values, predicate) {
  return values.filter(predicate).length;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function histogram(values) {
  const out = {};
  for (const value of values) out[value] = (out[value] || 0) + 1;
  return out;
}

function escapeMd(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}
