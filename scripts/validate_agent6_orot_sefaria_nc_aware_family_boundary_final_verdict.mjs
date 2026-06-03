import fs from 'node:fs';

const paths = {
  agent1Json: 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json',
  agent1Md: 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.md',
  requestJson: 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json',
  requestMd: 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.md',
  preVerdictJson: 'reports/agent6-orot-sefaria-nc-aware-boundary-request-verdict-2026-06-03.json',
  preVerdictMd: 'reports/agent6-orot-sefaria-nc-aware-boundary-request-verdict-2026-06-03.md',
  measurementJson: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json',
  measurementMd: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.md',
  oraclePolicy: 'reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md',
  finalJson: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json',
  finalMd: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.md'
};

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertArray(value, message) {
  assert(Array.isArray(value), `${message}: expected array`);
}

function assertIncludes(array, value, message) {
  assertArray(array, message);
  assert(array.includes(value), `${message}: missing ${JSON.stringify(value)}`);
}

function assertZeroOutputs(outputs, label) {
  assertEqual(outputs.answer_rows_emitted ?? outputs.answer_rows, 0, `${label} answer rows`);
  assertEqual(outputs.source_rows_emitted ?? outputs.source_rows, 0, `${label} source rows`);
  assertEqual(outputs.public_hud_rows_emitted ?? outputs.public_hud_rows, 0, `${label} public HUD rows`);
  assertEqual(outputs.route_jsonl_rows_emitted ?? outputs.route_jsonl_rows, 0, `${label} route JSONL rows`);
  assertEqual(outputs.definition_content_rows ?? outputs.definition_content_rows_emitted ?? 0, 0, `${label} definition content rows`);
  assertEqual(outputs.nc_definition_content_rows ?? outputs.nc_definition_content_rows_stored ?? 0, 0, `${label} NC definition content rows`);
}

function assertZeroTouchArrays(outputs, label) {
  for (const key of [
    'runtime_files_touched',
    'source_files_touched',
    'token_index_files_touched',
    'lexical_payload_files_touched',
    'public_mutation_files_touched'
  ]) {
    assertArray(outputs[key], `${label}.${key}`);
    assertEqual(outputs[key].length, 0, `${label}.${key}`);
  }
}

function sumOccurrences(rows) {
  return rows.reduce((total, row) => total + row.occurrences, 0);
}

for (const path of Object.values(paths)) {
  assert(fs.existsSync(path), `missing required file: ${path}`);
}

const agent1 = readJson(paths.agent1Json);
const request = readJson(paths.requestJson);
const preVerdict = readJson(paths.preVerdictJson);
const measurement = readJson(paths.measurementJson);
const finalVerdict = readJson(paths.finalJson);
const agent1Md = fs.readFileSync(paths.agent1Md, 'utf8');
const requestMd = fs.readFileSync(paths.requestMd, 'utf8');
const preVerdictMd = fs.readFileSync(paths.preVerdictMd, 'utf8');
const measurementMd = fs.readFileSync(paths.measurementMd, 'utf8');
const oraclePolicy = fs.readFileSync(paths.oraclePolicy, 'utf8');
const finalMd = fs.readFileSync(paths.finalMd, 'utf8');

assertEqual(agent1.artifact_type, 'agent1_orot_sefaria_nc_aware_family_custody_boundary', 'Agent 1 artifact_type');
assertEqual(request.artifact_type, 'agent10_agent1_agent6_orot_nc_aware_boundary_request', 'Agent 10 request artifact_type');
assertEqual(preVerdict.artifact_type, 'agent6_orot_sefaria_nc_aware_boundary_request_verdict', 'Agent 6 pre-verdict artifact_type');
assertEqual(measurement.artifact_type, 'agent2_orot_sefaria_nc_aware_coverage_measurement', 'Agent 2 measurement artifact_type');
assertEqual(finalVerdict.artifact_type, 'agent6_orot_sefaria_nc_aware_family_boundary_final_verdict', 'final artifact_type');

const expectedCounts = {
  scoped_rows: 500,
  scoped_occurrences: 8427,
  commercial_clean_candidate_rows: 297,
  commercial_clean_candidate_occurrences: 5747,
  additional_nc_educational_candidate_rows: 17,
  additional_nc_educational_candidate_occurrences: 259,
  commercial_clean_plus_nc_rows: 314,
  commercial_clean_plus_nc_occurrences: 6006,
  remaining_no_hit_or_unusable_rows: 186,
  remaining_no_hit_or_unusable_occurrences: 2421
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  assertEqual(agent1.measurement_scope[key], expected, `Agent 1 measurement_scope.${key}`);
  assertEqual(request.measured_scope[key], expected, `Agent 10 measured_scope.${key}`);
  assertEqual(preVerdict.measured_scope_recount[key], expected, `Agent 6 pre-verdict measured_scope_recount.${key}`);
  assertEqual(finalVerdict.measured_scope_recount[key], expected, `final measured_scope_recount.${key}`);
}

assertEqual(measurement.measurement_scope.audited_rows, 500, 'Agent 2 audited rows');
assertEqual(measurement.measurement_scope.audited_occurrences, 8427, 'Agent 2 audited occurrences');
assertEqual(measurement.coverage_summary.commercial_clean_candidate.rows, 297, 'Agent 2 commercial-clean rows');
assertEqual(measurement.coverage_summary.commercial_clean_candidate.occurrences, 5747, 'Agent 2 commercial-clean occurrences');
assertEqual(measurement.coverage_summary.additional_nc_educational_candidate.rows, 17, 'Agent 2 additional NC rows');
assertEqual(measurement.coverage_summary.additional_nc_educational_candidate.occurrences, 259, 'Agent 2 additional NC occurrences');
assertEqual(measurement.coverage_summary.commercial_clean_plus_nc_educational_candidate.rows, 314, 'Agent 2 combined rows');
assertEqual(measurement.coverage_summary.commercial_clean_plus_nc_educational_candidate.occurrences, 6006, 'Agent 2 combined occurrences');
assertEqual(measurement.coverage_summary.no_hit_or_unusable_in_scoped_sefaria_lane.rows, 186, 'Agent 2 remaining rows');
assertEqual(measurement.coverage_summary.no_hit_or_unusable_in_scoped_sefaria_lane.occurrences, 2421, 'Agent 2 remaining occurrences');

assertEqual(
  finalVerdict.measured_scope_recount.commercial_clean_candidate_rows + finalVerdict.measured_scope_recount.additional_nc_educational_candidate_rows,
  finalVerdict.measured_scope_recount.commercial_clean_plus_nc_rows,
  'final combined rows arithmetic'
);
assertEqual(
  finalVerdict.measured_scope_recount.commercial_clean_candidate_occurrences + finalVerdict.measured_scope_recount.additional_nc_educational_candidate_occurrences,
  finalVerdict.measured_scope_recount.commercial_clean_plus_nc_occurrences,
  'final combined occurrences arithmetic'
);
assertEqual(
  finalVerdict.measured_scope_recount.commercial_clean_plus_nc_rows + finalVerdict.measured_scope_recount.remaining_no_hit_or_unusable_rows,
  finalVerdict.measured_scope_recount.scoped_rows,
  'final remaining rows arithmetic'
);
assertEqual(
  finalVerdict.measured_scope_recount.commercial_clean_plus_nc_occurrences + finalVerdict.measured_scope_recount.remaining_no_hit_or_unusable_occurrences,
  finalVerdict.measured_scope_recount.scoped_occurrences,
  'final remaining occurrences arithmetic'
);

const expectedFamilies = {
  'BDB Dictionary': 'commercial_clean_candidate',
  'BDB Aramaic Dictionary': 'commercial_clean_candidate',
  'Jastrow Dictionary': 'commercial_clean_candidate',
  'Klein Dictionary': 'noncommercial_educational_candidate',
  'BDB Augmented Strong': 'blocked'
};

const expectedLicenseGroups = {
  'BDB Dictionary': 'PUBLIC_DOMAIN_OBSERVED',
  'BDB Aramaic Dictionary': 'PUBLIC_DOMAIN_OBSERVED',
  'Jastrow Dictionary': 'PUBLIC_DOMAIN_OBSERVED',
  'Klein Dictionary': 'CC_BY_NC',
  'BDB Augmented Strong': 'UNRESOLVED'
};

const agent1Families = Object.fromEntries(agent1.family_boundaries.map((row) => [row.family, row]));
const requestFamilies = Object.fromEntries(request.family_boundary_requests.map((row) => [row.family, row]));
const finalFamilies = Object.fromEntries(finalVerdict.family_status_verdict.map((row) => [row.family, row]));

for (const [family, status] of Object.entries(expectedFamilies)) {
  assert(agent1Families[family], `missing Agent 1 family ${family}`);
  assert(requestFamilies[family], `missing Agent 10 family ${family}`);
  assert(finalFamilies[family], `missing final family ${family}`);
  assertEqual(agent1Families[family].status, status, `Agent 1 ${family} status`);
  assertEqual(requestFamilies[family].requested_status, status, `Agent 10 ${family} status`);
  assertEqual(finalFamilies[family].agent1_status, status, `final ${family} agent1_status`);
  assertEqual(finalFamilies[family].agent6_final_status_for_non_public_planning, status, `final ${family} planning status`);
  assertEqual(finalFamilies[family].observed_license_group, expectedLicenseGroups[family], `final ${family} license group`);
  assertEqual(finalFamilies[family].public_or_runtime_use_authorized, false, `final ${family} public/runtime authorization`);
}

assertEqual(finalVerdict.family_status_counts.commercial_clean_candidate, 3, 'commercial-clean family count');
assertEqual(finalVerdict.family_status_counts.noncommercial_educational_candidate, 1, 'NC family count');
assertEqual(finalVerdict.family_status_counts.metadata_only, 0, 'metadata-only family count');
assertEqual(finalVerdict.family_status_counts.external_link_only, 0, 'external-link-only family count');
assertEqual(finalVerdict.family_status_counts.blocked, 1, 'blocked family count');

assertEqual(finalFamilies['BDB Dictionary'].planning_use_allowed, true, 'BDB planning use');
assertEqual(finalFamilies['BDB Aramaic Dictionary'].planning_use_allowed, true, 'BDB Aramaic planning use');
assertEqual(finalFamilies['Jastrow Dictionary'].planning_use_allowed, true, 'Jastrow planning use');
assertEqual(finalFamilies['Klein Dictionary'].planning_use_allowed, true, 'Klein planning use');
assertEqual(finalFamilies['Klein Dictionary'].noncommercial_display_planning_allowed, true, 'Klein NC planning');
assertEqual(finalFamilies['Klein Dictionary'].commercial_export_allowed, false, 'Klein commercial export');
assertEqual(finalFamilies['Klein Dictionary'].derived_from_nc, true, 'Klein derived_from_nc');
assertEqual(finalFamilies['Klein Dictionary'].attribution_required, true, 'Klein attribution');
assertEqual(finalFamilies['Klein Dictionary'].corpus_contamination, false, 'Klein corpus contamination');
assertEqual(finalFamilies['BDB Augmented Strong'].planning_use_allowed, false, 'BDB Augmented Strong planning use');
assert(finalFamilies['BDB Augmented Strong'].exact_blocker.includes('no independent license/version source basis'), 'BDB Augmented Strong exact blocker');

assertEqual(finalVerdict.disposition, 'warn_accepted', 'final disposition');
assertEqual(finalVerdict.pass_warn_block, 'warn', 'final pass_warn_block');
assertEqual(finalVerdict.family_statuses_sufficient_for_non_public_planning_evidence, true, 'family status planning sufficiency');
assertEqual(finalVerdict.non_public_transform_spec_or_dry_run_may_proceed, true, 'non-public next step');
assertEqual(finalVerdict.noncommercial_display_planning_permitted, true, 'NC display planning permitted');
assertEqual(finalVerdict.noncommercial_display_public_or_runtime_authorized, false, 'NC display public/runtime authorization');
assertEqual(finalVerdict.storage_or_display_eligibility_authorized, false, 'storage/display authorization');
assertEqual(finalVerdict.public_mutation_blocked, true, 'public mutation blocked');
assertEqual(finalVerdict.agent4_remains_held, true, 'Agent 4 held');

for (const [key, expected] of Object.entries({
  answer_eligibility_authorized: false,
  definition_authority_authorized: false,
  usage_as_definition_authorized: false,
  license_acceptance_authorized: false,
  source_provenance_acceptance_authorized: false,
  qa_acceptance_authorized: false,
  publication_readiness_authorized: false,
  route_publication_support_authorized: false,
  product_data_acceptance_authorized: false,
  translation_output_authorized: false,
  accepted_gloss_authorized: false,
  accepted_text_authorized: false,
  nc_definition_content_storage_authorized: false
})) {
  assertEqual(finalVerdict[key], expected, `final ${key}`);
}

assertEqual(finalVerdict.nc_flag_recount.rows, 17, 'final NC rows');
assertEqual(finalVerdict.nc_flag_recount.occurrences, 259, 'final NC occurrences');
assertEqual(finalVerdict.nc_flag_recount.family, 'Klein Dictionary', 'final NC family');
assertEqual(finalVerdict.nc_flag_recount.license_group, 'CC_BY_NC', 'final NC license group');
assertEqual(finalVerdict.nc_flag_recount.derived_from_nc, true, 'final NC derived_from_nc');
assertEqual(finalVerdict.nc_flag_recount.commercial_export_allowed, false, 'final NC commercial export');
assertEqual(finalVerdict.nc_flag_recount.noncommercial_display_planning_allowed, true, 'final NC planning display');
assertEqual(finalVerdict.nc_flag_recount.noncommercial_display_public_or_runtime_authorized, false, 'final NC public/runtime display');
assertEqual(finalVerdict.nc_flag_recount.attribution_required, true, 'final NC attribution');
assertEqual(finalVerdict.nc_flag_recount.corpus_contamination, false, 'final NC corpus contamination');
assertEqual(finalVerdict.nc_flag_recount.commercial_export_exclusion_required, true, 'final NC export exclusion');
assertEqual(finalVerdict.nc_flag_recount.nc_definition_content_stored, 0, 'final NC content stored');

assertEqual(agent1.nc_commercial_export_exclusion_rows.length, 17, 'Agent 1 NC rows');
assertEqual(request.nc_commercial_export_exclusion_rows.length, 17, 'Agent 10 request NC rows');
assertEqual(measurement.row_lists.nc_commercial_export_exclusion_rows.length, 17, 'Agent 2 NC rows');
assertEqual(finalVerdict.nc_commercial_export_exclusion_rows.length, 17, 'final NC rows list');
assertEqual(sumOccurrences(agent1.nc_commercial_export_exclusion_rows), 259, 'Agent 1 NC occurrences');
assertEqual(sumOccurrences(request.nc_commercial_export_exclusion_rows), 259, 'Agent 10 NC occurrences');
assertEqual(sumOccurrences(measurement.row_lists.nc_commercial_export_exclusion_rows), 259, 'Agent 2 NC occurrences');
assertEqual(sumOccurrences(finalVerdict.nc_commercial_export_exclusion_rows), 259, 'final NC occurrences sum');

const agent1NcIds = agent1.nc_commercial_export_exclusion_rows.map((row) => row.token_id).sort();
const finalNcIds = finalVerdict.nc_commercial_export_exclusion_rows.map((row) => row.token_id).sort();
assertEqual(JSON.stringify(finalNcIds), JSON.stringify(agent1NcIds), 'final NC token IDs match Agent 1');

for (const row of finalVerdict.nc_commercial_export_exclusion_rows) {
  assertEqual(row.family, 'Klein Dictionary', `${row.token_id} family`);
  assertEqual(row.license_group, 'CC_BY_NC', `${row.token_id} license_group`);
  assertEqual(row.derived_from_nc, true, `${row.token_id} derived_from_nc`);
  assertEqual(row.commercial_export_allowed, false, `${row.token_id} commercial_export_allowed`);
  assertEqual(row.noncommercial_display_planning_allowed, true, `${row.token_id} noncommercial_display_planning_allowed`);
  assertEqual(row.noncommercial_display_public_or_runtime_authorized, false, `${row.token_id} noncommercial_display_public_or_runtime_authorized`);
  assertEqual(row.attribution_required, true, `${row.token_id} attribution_required`);
  assertEqual(row.corpus_contamination, false, `${row.token_id} corpus_contamination`);
  assertEqual(row.allowed_now_by_this_artifact, false, `${row.token_id} allowed_now_by_this_artifact`);
}

assertZeroOutputs(agent1.outputs, 'Agent 1 outputs');
assertZeroOutputs(request.outputs, 'Agent 10 request outputs');
assertZeroOutputs(preVerdict.outputs, 'Agent 6 pre-verdict outputs');
assertZeroOutputs(finalVerdict.outputs, 'final outputs');
assertZeroTouchArrays(finalVerdict.outputs, 'final outputs');

for (const [key, expected] of Object.entries({
  answer_rows_emitted: 0,
  source_rows_emitted: 0,
  public_hud_rows_emitted: 0,
  route_jsonl_rows_emitted: 0,
  definition_content_rows: 0,
  nc_definition_content_rows: 0,
  nc_definition_content_stored: 0,
  runtime_files_touched: 0,
  source_files_touched: 0,
  token_index_files_touched: 0,
  lexical_payload_files_touched: 0,
  public_mutation_files_touched: 0,
  public_mutation: false
})) {
  assertEqual(finalVerdict.zero_emission_and_mutation_recount[key], expected, `final zero_emission_and_mutation_recount.${key}`);
}

assertEqual(finalVerdict.next_route.agent10_next, true, 'next Agent 10');
assert(finalVerdict.next_route.agent10_objective.includes('zero-emission'), 'next Agent 10 objective zero-emission');
assertEqual(finalVerdict.next_route.agent2_next, false, 'next Agent 2');
assertEqual(finalVerdict.next_route.agent4_next, false, 'next Agent 4');
assertEqual(finalVerdict.next_route.agent6_next, false, 'next Agent 6');
assertEqual(finalVerdict.next_route.agent8_next, true, 'next Agent 8');
assertEqual(finalVerdict.next_route.agent13_or_user_decision_needed_now, false, 'next Agent 13/user decision');

for (const blocker of [
  'Public mutation remains blocked.',
  'No answer rows, source rows, public HUD rows, route JSONL rows, runtime/source/token-index/lexical-payload mutation, or NC definition-content storage are authorized.',
  'Klein remains noncommercial educational planning only: derived_from_nc=true, commercial_export_allowed=false, attribution_required=true, corpus_contamination=false.',
  'BDB Augmented Strong remains blocked or metadata/external-link-only until independent license/source basis is supplied.',
  'Agent 4 remains held because no changed public/runtime package is authorized.'
]) {
  assertIncludes(finalVerdict.remaining_blockers, blocker, 'final remaining_blockers');
}

const requiredNotAccepted = [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'translation output',
  'accepted gloss',
  'accepted text',
  'public HUD mutation',
  'route JSONL mutation',
  'runtime mutation',
  'source mutation',
  'token-index mutation',
  'lexical-payload mutation',
  'NC definition content storage'
];

for (const item of requiredNotAccepted) {
  assertIncludes(finalVerdict.not_accepted, item, 'final not_accepted');
  assert(finalMd.includes(item), `final markdown missing not-accepted item: ${item}`);
}

for (const text of [
  'noncommercial_educational_candidate',
  'derived_from_nc=true',
  'commercial_export_allowed=false',
  'attribution_required=true',
  'corpus_contamination=false'
]) {
  assert(agent1Md.includes(text), `Agent 1 markdown missing ${text}`);
  assert(requestMd.includes(text), `Agent 10 request markdown missing ${text}`);
  assert(preVerdictMd.includes(text), `Agent 6 pre-verdict markdown missing ${text}`);
  assert(oraclePolicy.includes(text), `Oracle policy missing ${text}`);
  assert(finalMd.includes(text), `final markdown missing ${text}`);
}

for (const text of [
  'Commercial-clean candidate | 297 | 5747',
  'Additional NC educational candidate | 17 | 259',
  'Commercial-clean + NC educational candidate | 314 | 6006',
  'Remaining no-hit/unusable | 186 | 2421',
  'Public mutation remains blocked',
  'Agent 4 remains held',
  '## Agent 8 Callback',
  'Agent 8 direct callback delivery unavailable in this environment; callback requires relay.',
  'Highest permissible claim: Agent 6 final NC-aware family boundary verdict produced for Agent 10/Agent 8 routing.'
]) {
  assert(finalMd.includes(text), `final markdown missing ${text}`);
}

assert(measurementMd.includes('| Commercial-clean candidate | 297 | 5747 |'), 'measurement markdown missing commercial-clean count');
assert(measurementMd.includes('| Additional NC educational candidate | 17 | 259 |'), 'measurement markdown missing NC count');

console.log(`Agent 6 Orot/Sefaria NC-aware family boundary final verdict validation passed for ${paths.finalJson}.`);
