#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  oldDictionaryReaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  ncKleinMap: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json',
  downstreamAudit: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json',
  boundaryQuestionPacket: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.md'
};

const oldDictionary = readJson(paths.oldDictionaryReaudit);
const preview = readJson(paths.preview);
const ncMap = readJson(paths.ncKleinMap);
const downstreamAudit = readJson(paths.downstreamAudit);
const boundaryPacket = readJson(paths.boundaryQuestionPacket);

const family = oldDictionary.source_families.find((row) => row.source_family === 'Klein Dictionary');
const previewRows = preview.rows.filter((row) => (row.blocked_or_unresolved_lexicons || []).includes('Klein Dictionary'));
const downstreamRow = downstreamAudit.lane_alignment_rows.find((row) => row.source_family === 'Klein Dictionary');
const boundaryRow = boundaryPacket.boundary_questions.find((row) => row.source_family === 'Klein Dictionary');

assert(family, 'Klein family missing from old dictionary reaudit');
assert(downstreamRow, 'Klein row missing from downstream audit');
assert(boundaryRow, 'Klein row missing from Agent 6 boundary packet');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_klein_nc_lane_preservation',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_klein_nc_lane_preservation.mjs',
  target: 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary NC lane preservation',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  workset: oldDictionary.workset,
  status: 'klein_noncommercial_educational_candidate_preserved_separately_zero_output',
  inputs: paths,
  scope_boundary: {
    old_dictionary_klein_subset_rows: family.evidence.rows,
    old_dictionary_klein_subset_occurrences: family.evidence.occurrences,
    preview_rows_with_klein_blocked_or_unresolved: previewRows.length,
    preview_occurrences_with_klein_blocked_or_unresolved: previewRows.reduce((sum, row) => sum + (row.occurrences || 0), 0),
    prior_nc_klein_package_rows: ncMap.family_map.rows,
    prior_nc_klein_package_occurrences: ncMap.family_map.occurrences,
    scopes_are_not_interchangeable: true,
    boundary_note: 'The old-dictionary Klein subset is 214 rows / 4444 occurrences; the earlier NC package map is 17 rows / 259 occurrences. Preserve both as distinct scopes.'
  },
  source_family: {
    row_subset_id: family.row_subset_id,
    source_family: family.source_family,
    source_name: family.source_name,
    license_label: family.license_label,
    license_lane: 'noncommercial_educational_candidate',
    rows: family.evidence.rows,
    occurrences: family.evidence.occurrences,
    token_ids_sample: family.evidence.token_ids_sample || [],
    derived_from_nc: true,
    commercial_export_allowed: false,
    commercial_export_prohibited: true,
    attribution_required: true,
    corpus_contamination: false,
    nc_flags: {
      derived_from_nc: true,
      commercial_export_allowed: false,
      attribution_required: true,
      corpus_contamination: false
    }
  },
  row_field_profile: {
    row_count: previewRows.length,
    occurrence_sum: previewRows.reduce((sum, row) => sum + (row.occurrences || 0), 0),
    all_keys: [...new Set(previewRows.flatMap((row) => Object.keys(row)))].sort(),
    token_ids_sample: previewRows.slice(0, 12).map((row) => row.token_id),
    surfaces_sample: previewRows.slice(0, 12).map((row) => row.surface),
    blocked_or_unresolved_lexicons: [...new Set(previewRows.flatMap((row) => row.blocked_or_unresolved_lexicons || []))].sort(),
    emitted_answer_row_now_values: [...new Set(previewRows.map((row) => row.emitted_answer_row_now))],
    source_row_emitted_now_values: [...new Set(previewRows.map((row) => row.source_row_emitted_now))],
    answer_eligible_now_values: [...new Set(previewRows.map((row) => row.answer_eligible_now))]
  },
  nc_source_family_map_evidence: {
    artifact: paths.ncKleinMap,
    status: ncMap.status,
    highest_permissible_claim: ncMap.highest_permissible_claim,
    observed_license: ncMap.family_map.observed_license,
    observed_license_group: ncMap.family_map.observed_license_group,
    family_map_status: ncMap.family_map.status,
    metadata_only_allowed: ncMap.family_map.metadata_only_allowed,
    external_link_only_allowed: ncMap.family_map.external_link_only_allowed,
    storage_allowed: ncMap.family_map.storage_allowed,
    display_allowed: ncMap.family_map.display_allowed,
    noncommercial_display_allowed: ncMap.family_map.noncommercial_display_allowed,
    transformed_reader_hint_allowed: ncMap.family_map.transformed_reader_hint_allowed,
    attribution_text_or_link_required: ncMap.family_map.attribution_text_or_link_required,
    corpus_contamination_note: ncMap.family_map.corpus_contamination_note
  },
  downstream_boundary_alignment: {
    downstream_audit_row: {
      license_lane: downstreamRow.license_lane,
      rows: downstreamRow.rows,
      occurrences: downstreamRow.occurrences,
      derived_from_nc: downstreamRow.derived_from_nc,
      commercial_export_allowed: downstreamRow.commercial_export_allowed,
      attribution_required: downstreamRow.attribution_required,
      corpus_contamination: downstreamRow.corpus_contamination,
      exact_blocker: downstreamRow.exact_blocker
    },
    agent6_boundary_question_row: {
      license_lane: boundaryRow.license_lane,
      rows: boundaryRow.rows,
      occurrences: boundaryRow.occurrences,
      required_flags_to_preserve: boundaryRow.required_flags_to_preserve,
      current_allowed_now: boundaryRow.current_allowed_now,
      exact_blocker: boundaryRow.exact_blocker
    }
  },
  classification_lane_decision: {
    license_lane: 'noncommercial_educational_candidate',
    lane_change_from_old_dictionary_reaudit: false,
    commercial_clean_candidate: false,
    blocked_or_needs_review: false,
    metadata_or_link_only: false,
    metadata_only_allowed: true,
    external_link_only_allowed: true,
    agent2_transform_allowed_now: false,
    candidate_text_export_allowed_now: false,
    definition_content_storage_allowed_now: false,
    answer_eligible_now: false,
    public_emit_now: false,
    release_route_opened_now: false,
    agent6_delivery_now: false
  },
  exact_blockers: [
    'noncommercial_educational_candidate::klein-dictionary_no_commercial_export_authorization',
    'klein_dictionary_missing_exact_agent6_nc_boundary',
    'klein_dictionary_definition_content_storage_not_allowed_now',
    'klein_dictionary_public_or_runtime_display_not_allowed_now',
    'klein_dictionary_attribution_boundary_required_if_future_nc_use_allowed',
    'klein_dictionary_scope_boundary_214_rows_not_same_as_prior_17_row_nc_package'
  ],
  handoff_owner: {
    agent1: 'Preserve Klein as separate NC educational lane with row/subset counts and no commercial export.',
    agent2: 'No transform or candidate text export; preserve NC flags and exact blockers.',
    agent6: 'Receives exact NC row/subset boundary only if future NC candidate-use package is assembled.',
    agent10: 'No release assembly for Klein until Agent 6 NC boundary and owner/license-policy boundary exist.'
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
    agent6_deliveries: 0,
    nc_commercial_authorization_rows: 0
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
  stop_condition: 'Stop after preserving row-scoped Klein NC lane and exact blockers; do not transform, store Definition content, publish, deliver to Agent 6, or claim acceptance.'
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));
console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  status: artifact.status,
  old_dictionary_klein_subset_rows: artifact.scope_boundary.old_dictionary_klein_subset_rows,
  prior_nc_klein_package_rows: artifact.scope_boundary.prior_nc_klein_package_rows,
  license_lane: artifact.source_family.license_lane,
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

function renderMarkdown(artifact) {
  return `# Agent 1 Old-Dictionary Klein NC Lane Preservation - 2026-06-05

Status: \`${artifact.status}\`

## Lane Decision

| row subset | rows | occurrences | lane | commercial export | transform now |
| --- | ---: | ---: | --- | --- | --- |
| \`${artifact.source_family.row_subset_id}\` | ${artifact.source_family.rows} | ${artifact.source_family.occurrences} | \`${artifact.source_family.license_lane}\` | ${artifact.source_family.commercial_export_allowed} | ${artifact.classification_lane_decision.agent2_transform_allowed_now} |

## Scope Boundary

- Old-dictionary Klein subset: ${artifact.scope_boundary.old_dictionary_klein_subset_rows} rows / ${artifact.scope_boundary.old_dictionary_klein_subset_occurrences} occurrences.
- Prior NC Klein package map: ${artifact.scope_boundary.prior_nc_klein_package_rows} rows / ${artifact.scope_boundary.prior_nc_klein_package_occurrences} occurrences.
- Scopes interchangeable: false.

## Required Flags

- \`derived_from_nc=true\`
- \`commercial_export_allowed=false\`
- \`attribution_required=true\`
- \`corpus_contamination=false\`
- \`definition_content_storage_allowed_now=false\`
- \`public_emit_now=false\`

## Exact Blockers

${artifact.exact_blockers.map((blocker) => `- \`${blocker}\``).join('\n')}

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, candidate-text export authorization, release action, public/runtime mutation, NC commercial authorization, queue mutation, staging, or destructive repo action is claimed.
`;
}
