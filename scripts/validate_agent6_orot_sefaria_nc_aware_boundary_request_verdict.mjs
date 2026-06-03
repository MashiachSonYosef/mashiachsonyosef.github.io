import fs from 'node:fs';

const paths = {
  requestJson: 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json',
  requestMd: 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.md',
  measurementJson: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json',
  measurementMd: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.md',
  oraclePolicy: 'reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md',
  licenseScoutJson: 'reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json',
  licenseScoutMd: 'reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.md',
  transformContract: 'reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md',
  verdictJson: 'reports/agent6-orot-sefaria-nc-aware-boundary-request-verdict-2026-06-03.json',
  verdictMd: 'reports/agent6-orot-sefaria-nc-aware-boundary-request-verdict-2026-06-03.md'
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

function assertArrayEmpty(value, message) {
  assertArray(value, message);
  assertEqual(value.length, 0, message);
}

function assertIncludes(array, value, message) {
  assertArray(array, message);
  assert(array.includes(value), `${message}: missing ${JSON.stringify(value)}`);
}

function sumOccurrences(rows) {
  return rows.reduce((total, row) => total + row.occurrences, 0);
}

function assertZeroEmissionOutputs(outputs, label) {
  assertEqual(outputs.answer_rows_emitted ?? outputs.answer_rows, 0, `${label} answer rows`);
  assertEqual(outputs.source_rows_emitted ?? outputs.source_rows, 0, `${label} source rows`);
  assertEqual(outputs.public_hud_rows_emitted ?? outputs.public_hud_rows, 0, `${label} public HUD rows`);
  assertEqual(outputs.route_jsonl_rows_emitted ?? outputs.route_jsonl_rows, 0, `${label} route JSONL rows`);
}

function assertZeroTouchArrays(outputs, label) {
  assertArrayEmpty(outputs.runtime_files_touched, `${label} runtime_files_touched`);
  assertArrayEmpty(outputs.source_files_touched, `${label} source_files_touched`);
  assertArrayEmpty(outputs.token_index_files_touched, `${label} token_index_files_touched`);
  assertArrayEmpty(outputs.lexical_payload_files_touched, `${label} lexical_payload_files_touched`);
}

for (const path of Object.values(paths)) {
  assert(fs.existsSync(path), `missing required file: ${path}`);
}

const request = readJson(paths.requestJson);
const measurement = readJson(paths.measurementJson);
const licenseScout = readJson(paths.licenseScoutJson);
const verdict = readJson(paths.verdictJson);
const requestMd = fs.readFileSync(paths.requestMd, 'utf8');
const measurementMd = fs.readFileSync(paths.measurementMd, 'utf8');
const oraclePolicy = fs.readFileSync(paths.oraclePolicy, 'utf8');
const licenseScoutMd = fs.readFileSync(paths.licenseScoutMd, 'utf8');
const transformContract = fs.readFileSync(paths.transformContract, 'utf8');
const verdictMd = fs.readFileSync(paths.verdictMd, 'utf8');

assertEqual(request.artifact_type, 'agent10_agent1_agent6_orot_nc_aware_boundary_request', 'request artifact_type');
assertEqual(request.boundary.request_only, true, 'request request_only');
assertEqual(request.boundary.evidence_only, true, 'request evidence_only');
assertEqual(request.boundary.zero_emission, true, 'request zero_emission');
assertEqual(request.boundary.no_nc_definition_content_storage, true, 'request no_nc_definition_content_storage');
assertEqual(request.boundary.no_public_mutation, true, 'request no_public_mutation');
assertEqual(request.boundary.no_license_acceptance, true, 'request no_license_acceptance');
assertEqual(request.boundary.no_source_provenance_acceptance, true, 'request no_source_provenance_acceptance');
assertEqual(request.boundary.no_qa_acceptance, true, 'request no_qa_acceptance');
assertEqual(request.boundary.no_definition_authority, true, 'request no_definition_authority');
assertEqual(request.boundary.no_answer_acceptance, true, 'request no_answer_acceptance');
assertEqual(request.boundary.no_publication_readiness, true, 'request no_publication_readiness');

assertEqual(measurement.artifact_type, 'agent2_orot_sefaria_nc_aware_coverage_measurement', 'measurement artifact_type');
assertEqual(measurement.boundary.measurement_only, true, 'measurement measurement_only');
assertEqual(measurement.boundary.evidence_only, true, 'measurement evidence_only');
assertEqual(measurement.boundary.zero_emission, true, 'measurement zero_emission');
assertEqual(measurement.boundary.nc_definition_content_stored, 0, 'measurement nc_definition_content_stored');
assertEqual(measurement.boundary.public_mutation, false, 'measurement public_mutation');
assertEqual(measurement.boundary.no_license_acceptance, true, 'measurement no_license_acceptance');
assertEqual(measurement.boundary.no_source_provenance_acceptance, true, 'measurement no_source_provenance_acceptance');
assertEqual(measurement.boundary.no_qa_acceptance, true, 'measurement no_qa_acceptance');
assertEqual(measurement.boundary.no_definition_authority, true, 'measurement no_definition_authority');
assertEqual(measurement.boundary.no_answer_acceptance, true, 'measurement no_answer_acceptance');

assertEqual(licenseScout.artifact_type, 'agent10_sefaria_lexicon_license_scout_addendum', 'license scout artifact_type');
assertEqual(licenseScout.boundary.evidence_only, true, 'license scout evidence_only');
assertEqual(licenseScout.boundary.no_license_acceptance, true, 'license scout no_license_acceptance');
assertEqual(licenseScout.boundary.no_source_custody, true, 'license scout no_source_custody');
assertEqual(licenseScout.outputs.answer_rows, 0, 'license scout answer rows');
assertEqual(licenseScout.outputs.public_hud_rows, 0, 'license scout public HUD rows');
assertEqual(licenseScout.outputs.route_jsonl_rows, 0, 'license scout route JSONL rows');
assertEqual(licenseScout.outputs.definition_content_rows, 0, 'license scout definition rows');

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
  assertEqual(request.measured_scope[key], expected, `request measured_scope.${key}`);
  assertEqual(verdict.measured_scope_recount[key], expected, `verdict measured_scope_recount.${key}`);
}

assertEqual(measurement.measurement_scope.audited_rows, 500, 'measurement audited rows');
assertEqual(measurement.measurement_scope.audited_occurrences, 8427, 'measurement audited occurrences');
assertEqual(measurement.coverage_summary.commercial_clean_candidate.rows, 297, 'measurement commercial clean rows');
assertEqual(measurement.coverage_summary.commercial_clean_candidate.occurrences, 5747, 'measurement commercial clean occurrences');
assertEqual(measurement.coverage_summary.additional_nc_educational_candidate.rows, 17, 'measurement additional NC rows');
assertEqual(measurement.coverage_summary.additional_nc_educational_candidate.occurrences, 259, 'measurement additional NC occurrences');
assertEqual(measurement.coverage_summary.commercial_clean_plus_nc_educational_candidate.rows, 314, 'measurement combined rows');
assertEqual(measurement.coverage_summary.commercial_clean_plus_nc_educational_candidate.occurrences, 6006, 'measurement combined occurrences');
assertEqual(measurement.coverage_summary.no_hit_or_unusable_in_scoped_sefaria_lane.rows, 186, 'measurement no-hit rows');
assertEqual(measurement.coverage_summary.no_hit_or_unusable_in_scoped_sefaria_lane.occurrences, 2421, 'measurement no-hit occurrences');

assertEqual(
  request.measured_scope.commercial_clean_candidate_rows + request.measured_scope.additional_nc_educational_candidate_rows,
  request.measured_scope.commercial_clean_plus_nc_rows,
  'request combined row arithmetic'
);
assertEqual(
  request.measured_scope.commercial_clean_candidate_occurrences + request.measured_scope.additional_nc_educational_candidate_occurrences,
  request.measured_scope.commercial_clean_plus_nc_occurrences,
  'request combined occurrence arithmetic'
);
assertEqual(
  request.measured_scope.commercial_clean_plus_nc_rows + request.measured_scope.remaining_no_hit_or_unusable_rows,
  request.measured_scope.scoped_rows,
  'request remaining row arithmetic'
);
assertEqual(
  request.measured_scope.commercial_clean_plus_nc_occurrences + request.measured_scope.remaining_no_hit_or_unusable_occurrences,
  request.measured_scope.scoped_occurrences,
  'request remaining occurrence arithmetic'
);

const requiredStatusOptions = [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_only',
  'external_link_only',
  'blocked'
];

for (const status of requiredStatusOptions) {
  assertIncludes(request.requested_status_options, status, 'request requested_status_options');
  assertIncludes(verdict.required_status_options_recount, status, 'verdict required_status_options_recount');
}

assertArray(request.family_boundary_requests, 'request family_boundary_requests');
assertEqual(request.family_boundary_requests.length, 5, 'request family_boundary_requests length');
const familyMap = Object.fromEntries(request.family_boundary_requests.map((row) => [row.family, row]));
const expectedFamilies = {
  'BDB Dictionary': ['PUBLIC_DOMAIN_OBSERVED', 'commercial_clean_candidate'],
  'BDB Aramaic Dictionary': ['PUBLIC_DOMAIN_OBSERVED', 'commercial_clean_candidate'],
  'Jastrow Dictionary': ['PUBLIC_DOMAIN_OBSERVED', 'commercial_clean_candidate'],
  'Klein Dictionary': ['CC_BY_NC', 'noncommercial_educational_candidate'],
  'BDB Augmented Strong': ['UNRESOLVED', 'blocked']
};

for (const [family, [licenseGroup, status]] of Object.entries(expectedFamilies)) {
  assert(familyMap[family], `missing family request ${family}`);
  assertEqual(familyMap[family].observed_license_group, licenseGroup, `${family} observed_license_group`);
  assertEqual(familyMap[family].requested_status, status, `${family} requested_status`);
  const pre = verdict.family_request_pre_disposition.find((row) => row.family === family);
  assert(pre, `verdict missing family pre-disposition ${family}`);
  assertEqual(pre.observed_license_group, licenseGroup, `${family} verdict observed_license_group`);
  assertEqual(pre.requested_status, status, `${family} verdict requested_status`);
  assertEqual(pre.acceptance_created, false, `${family} acceptance_created`);
}

const kleinRequest = familyMap['Klein Dictionary'];
assertEqual(kleinRequest.required_nc_flags.license_group, 'CC_BY_NC', 'Klein required license_group');
assertEqual(kleinRequest.required_nc_flags.derived_from_nc, true, 'Klein required derived_from_nc');
assertEqual(kleinRequest.required_nc_flags.commercial_export_allowed, false, 'Klein required commercial_export_allowed');
assertEqual(kleinRequest.required_nc_flags.noncommercial_display_allowed, false, 'Klein required noncommercial_display_allowed');
assertEqual(kleinRequest.required_nc_flags.attribution_required, true, 'Klein required attribution_required');
assertEqual(kleinRequest.required_nc_flags.corpus_contamination, false, 'Klein required corpus_contamination');

assertArray(request.nc_commercial_export_exclusion_rows, 'request nc_commercial_export_exclusion_rows');
assertEqual(request.nc_commercial_export_exclusion_rows.length, 17, 'request NC row length');
assertEqual(sumOccurrences(request.nc_commercial_export_exclusion_rows), 259, 'request NC occurrence sum');

for (const row of request.nc_commercial_export_exclusion_rows) {
  assertEqual(row.family, 'Klein Dictionary', `NC row ${row.token_id} family`);
  assertEqual(row.license_group, 'CC_BY_NC', `NC row ${row.token_id} license_group`);
  assertEqual(row.derived_from_nc, true, `NC row ${row.token_id} derived_from_nc`);
  assertEqual(row.commercial_export_allowed, false, `NC row ${row.token_id} commercial_export_allowed`);
  assertEqual(row.noncommercial_display_allowed, false, `NC row ${row.token_id} noncommercial_display_allowed`);
  assertEqual(row.attribution_required, true, `NC row ${row.token_id} attribution_required`);
  assertEqual(row.corpus_contamination, false, `NC row ${row.token_id} corpus_contamination`);
  assertEqual(row.agent1_agent6_boundary_required, true, `NC row ${row.token_id} boundary required`);
}

assertEqual(verdict.nc_flag_recount.all_nc_rows_family_klein_dictionary, true, 'verdict all NC rows family');
assertEqual(verdict.nc_flag_recount.all_nc_rows_license_group_cc_by_nc, true, 'verdict all NC rows license_group');
assertEqual(verdict.nc_flag_recount.all_nc_rows_derived_from_nc_true, true, 'verdict all NC rows derived_from_nc');
assertEqual(verdict.nc_flag_recount.all_nc_rows_commercial_export_allowed_false, true, 'verdict all NC rows commercial_export_allowed');
assertEqual(verdict.nc_flag_recount.all_nc_rows_noncommercial_display_allowed_false_until_boundary, true, 'verdict all NC rows noncommercial_display_allowed');
assertEqual(verdict.nc_flag_recount.all_nc_rows_attribution_required_true, true, 'verdict all NC rows attribution_required');
assertEqual(verdict.nc_flag_recount.all_nc_rows_corpus_contamination_false, true, 'verdict all NC rows corpus_contamination');
assertEqual(verdict.nc_flag_recount.all_nc_rows_agent1_agent6_boundary_required, true, 'verdict all NC rows boundary required');

assertZeroEmissionOutputs(request.outputs, 'request outputs');
assertEqual(request.outputs.nc_definition_content_rows, 0, 'request NC definition content rows');
assertZeroTouchArrays(request.outputs, 'request outputs');

assertZeroEmissionOutputs(verdict.outputs, 'verdict outputs');
assertEqual(verdict.outputs.definition_content_rows, 0, 'verdict definition_content_rows');
assertEqual(verdict.outputs.nc_definition_content_rows, 0, 'verdict NC definition content rows');
assertZeroTouchArrays(verdict.outputs, 'verdict outputs');

assertEqual(verdict.zero_emission_and_mutation_recount.request_zero_emission, true, 'verdict request_zero_emission');
assertEqual(verdict.zero_emission_and_mutation_recount.measurement_zero_emission, true, 'verdict measurement_zero_emission');
assertEqual(verdict.zero_emission_and_mutation_recount.answer_rows_emitted, 0, 'verdict recount answer rows');
assertEqual(verdict.zero_emission_and_mutation_recount.source_rows_emitted, 0, 'verdict recount source rows');
assertEqual(verdict.zero_emission_and_mutation_recount.public_hud_rows_emitted, 0, 'verdict recount public HUD rows');
assertEqual(verdict.zero_emission_and_mutation_recount.route_jsonl_rows_emitted, 0, 'verdict recount route JSONL rows');
assertEqual(verdict.zero_emission_and_mutation_recount.definition_content_rows, 0, 'verdict recount definition content rows');
assertEqual(verdict.zero_emission_and_mutation_recount.nc_definition_content_rows, 0, 'verdict recount NC definition content rows');
assertEqual(verdict.zero_emission_and_mutation_recount.nc_definition_content_stored, 0, 'verdict recount NC definition stored');
assertEqual(verdict.zero_emission_and_mutation_recount.runtime_files_touched, 0, 'verdict recount runtime touched');
assertEqual(verdict.zero_emission_and_mutation_recount.source_files_touched, 0, 'verdict recount source touched');
assertEqual(verdict.zero_emission_and_mutation_recount.token_index_files_touched, 0, 'verdict recount token index touched');
assertEqual(verdict.zero_emission_and_mutation_recount.lexical_payload_files_touched, 0, 'verdict recount lexical payload touched');
assertEqual(verdict.zero_emission_and_mutation_recount.public_mutation, false, 'verdict recount public mutation');

assertEqual(verdict.artifact_type, 'agent6_orot_sefaria_nc_aware_boundary_request_verdict', 'verdict artifact_type');
assertEqual(verdict.lane, 'bounded_boundary_review', 'verdict lane');
assertEqual(verdict.review_type, 'pre_disposition_request_and_measurement_sufficiency_only', 'verdict review_type');
assertEqual(verdict.disposition, 'warn_accepted', 'verdict disposition');
assertEqual(verdict.pass_warn_block, 'warn', 'verdict pass_warn_block');
assertEqual(verdict.request_sufficient_for_agent1_family_custody_display_review, true, 'verdict request sufficiency');
assertEqual(verdict.later_agent6_final_boundary_review_required, true, 'verdict final Agent 6 required');
assertEqual(verdict.public_mutation_blocked, true, 'verdict public_mutation_blocked');
assertEqual(verdict.agent4_remains_held, true, 'verdict Agent 4 held');
assertEqual(verdict.answer_eligibility_authorized, false, 'verdict answer eligibility authorized');
assertEqual(verdict.definition_authority_authorized, false, 'verdict definition authority authorized');
assertEqual(verdict.usage_as_definition_authorized, false, 'verdict usage as definition authorized');
assertEqual(verdict.license_acceptance_authorized, false, 'verdict license acceptance authorized');
assertEqual(verdict.source_provenance_acceptance_authorized, false, 'verdict source provenance acceptance authorized');
assertEqual(verdict.publication_readiness_authorized, false, 'verdict publication readiness authorized');
assertEqual(verdict.route_publication_support_authorized, false, 'verdict route publication support authorized');
assertEqual(verdict.product_data_acceptance_authorized, false, 'verdict product data acceptance authorized');
assertEqual(verdict.nc_definition_content_storage_authorized, false, 'verdict NC content storage authorized');

assertEqual(verdict.measurement_sufficiency.agent10_request_matches_agent2_nc_measurement_counts, true, 'verdict measurement count match');
assertEqual(verdict.measurement_sufficiency.agent10_request_includes_required_status_options, true, 'verdict status options included');
assertEqual(verdict.measurement_sufficiency.agent10_request_includes_nc_export_exclusion_rows, true, 'verdict NC exclusion rows included');
assertEqual(verdict.measurement_sufficiency.nc_export_exclusion_rows, 17, 'verdict NC exclusion row count');
assertEqual(verdict.measurement_sufficiency.nc_export_exclusion_occurrences, 259, 'verdict NC exclusion occurrence count');
assertEqual(verdict.measurement_sufficiency.commercial_clean_plus_nc_arithmetic_reconciles, true, 'verdict combined arithmetic');
assertEqual(verdict.measurement_sufficiency.scoped_remaining_arithmetic_reconciles, true, 'verdict remaining arithmetic');
assertEqual(verdict.measurement_sufficiency.measurement_is_sufficient_to_route_request, true, 'verdict route sufficiency');
assertEqual(verdict.measurement_sufficiency.measurement_is_not_license_or_source_acceptance, true, 'verdict not license/source acceptance');
assertEqual(verdict.measurement_sufficiency.measurement_is_not_definition_or_answer_acceptance, true, 'verdict not definition/answer acceptance');

assertEqual(verdict.next_route.agent1_next, true, 'verdict Agent 1 next');
assertEqual(verdict.next_route.agent2_next, false, 'verdict Agent 2 next');
assertEqual(verdict.next_route.agent4_next, false, 'verdict Agent 4 next');
assertEqual(verdict.next_route.agent6_final_boundary_review_after_agent1, true, 'verdict Agent 6 final after Agent 1');
assertEqual(verdict.next_route.agent13_or_user_decision_needed_now, false, 'verdict Agent 13/user decision needed now');

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
  assertIncludes(verdict.not_accepted, item, 'verdict not_accepted');
  assert(verdictMd.includes(item), `verdict markdown missing not-accepted item ${item}`);
}

for (const text of [
  'noncommercial_educational_candidate',
  'derived_from_nc=true',
  'commercial_export_allowed=false',
  'noncommercial_display_allowed=false until boundary',
  'attribution_required=true',
  'corpus_contamination=false'
]) {
  assert(requestMd.includes(text), `request markdown missing ${text}`);
  assert(verdictMd.includes(text), `verdict markdown missing ${text}`);
}

assert(oraclePolicy.includes('noncommercial_educational_candidate'), 'oracle policy missing noncommercial status');
assert(oraclePolicy.includes('derived_from_nc=true'), 'oracle policy missing derived_from_nc flag');
assert(oraclePolicy.includes('commercial_export_allowed=false'), 'oracle policy missing commercial export flag');
assert(oraclePolicy.includes('corpus_contamination=false'), 'oracle policy missing corpus contamination flag');
assert(measurementMd.includes('| Commercial-clean candidate | 297 | 5747 |'), 'measurement markdown missing commercial clean count');
assert(measurementMd.includes('| Additional NC educational candidate | 17 | 259 |'), 'measurement markdown missing NC count');
assert(licenseScoutMd.includes('Klein Dictionary'), 'license scout markdown missing Klein');
assert(/zero-emission/i.test(transformContract), 'transform contract missing zero-emission boundary');

assert(verdictMd.includes('## Agent 8 Callback'), 'verdict markdown missing Agent 8 Callback');
assert(verdictMd.includes('Disposition: `WARN-ACCEPTED` for request and measurement sufficiency only.'), 'verdict markdown missing disposition');
assert(verdictMd.includes('Route the Agent 10 NC-aware request packet to Agent 1'), 'verdict markdown missing next route');
assert(verdictMd.includes('Public mutation remains blocked'), 'verdict markdown missing public mutation blocker');
assert(verdictMd.includes('NC definition-content storage remains blocked'), 'verdict markdown missing NC storage blocker');
assert(verdictMd.includes('Agent 4 remains held: yes'), 'verdict markdown missing Agent 4 held callback');
assert(verdictMd.includes('Agent 8 direct callback delivery unavailable in this environment; callback requires relay.'), 'verdict markdown missing callback delivery blocker');

console.log(`Agent 6 Orot/Sefaria NC-aware boundary request verdict validation passed for ${paths.verdictJson}.`);
