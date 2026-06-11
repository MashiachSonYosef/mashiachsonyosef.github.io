#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2] || 'reports/agent10-agent6-ready-orot-205-row-commercial-clean-subset-2026-06-04.json';
const packet = JSON.parse(fs.readFileSync(path.join(root, packetPath), 'utf8'));
const issues = [];

expect(packet.schema_version === 1, 'schema_version must be 1');
expect(packet.artifact_type === 'agent10_agent6_ready_orot_205_row_commercial_clean_subset', 'artifact_type mismatch');
expect(packet.status === 'agent6_review_required_nonpublic_commercial_clean_subset_only', 'status mismatch');
expect(Array.isArray(packet.rows), 'rows must be array');
expect(packet.selection_rule?.no_definition_text_storage === true, 'selection_rule.no_definition_text_storage must be true');

const subset = packet.subset || {};
expect(subset.rows === 205, `expected subset.rows 205, got ${subset.rows}`);
expect(subset.occurrences === 1767, `expected subset.occurrences 1767, got ${subset.occurrences}`);
expect(subset.source_license_lane === 'commercial_clean_candidate', 'source_license_lane must be commercial_clean_candidate');
expect(subset.observed_license_group === 'PUBLIC_DOMAIN_OBSERVED', 'observed_license_group must be PUBLIC_DOMAIN_OBSERVED');
expect(arrayEquals(subset.families, ['BDB Aramaic Dictionary', 'BDB Dictionary', 'Jastrow Dictionary']), 'families mismatch');

expect(subset.relation_class_counts?.needs_morphology_disambiguation?.rows === 71, 'needs_morphology_disambiguation row count mismatch');
expect(subset.relation_class_counts?.needs_morphology_disambiguation?.occurrences === 641, 'needs_morphology_disambiguation occurrence count mismatch');
expect(subset.relation_class_counts?.prefix_or_clitic_possible?.rows === 82, 'prefix_or_clitic_possible row count mismatch');
expect(subset.relation_class_counts?.prefix_or_clitic_possible?.occurrences === 677, 'prefix_or_clitic_possible occurrence count mismatch');
expect(subset.relation_class_counts?.exact_after_mark_strip?.rows === 52, 'exact_after_mark_strip row count mismatch');
expect(subset.relation_class_counts?.exact_after_mark_strip?.occurrences === 449, 'exact_after_mark_strip occurrence count mismatch');

expect(subset.transform_blocker_counts?.missing_agent1_6_custody_disposition === 205, 'missing_agent1_6_custody_disposition count mismatch');
expect(subset.transform_blocker_counts?.answer_text_not_stored_by_preview === 205, 'answer_text_not_stored_by_preview count mismatch');
expect(subset.transform_blocker_counts?.missing_approved_morphology_relation === 153, 'missing_approved_morphology_relation count mismatch');

const counted = countRows(packet.rows);
expect(counted.rows === 205, `actual row count mismatch: ${counted.rows}`);
expect(counted.occurrences === 1767, `actual occurrence count mismatch: ${counted.occurrences}`);
expect(counted.relationClassRows.needs_morphology_disambiguation === 71, 'actual needs_morphology_disambiguation row count mismatch');
expect(counted.relationClassRows.prefix_or_clitic_possible === 82, 'actual prefix_or_clitic_possible row count mismatch');
expect(counted.relationClassRows.exact_after_mark_strip === 52, 'actual exact_after_mark_strip row count mismatch');
expect(counted.relationClassOccurrences.needs_morphology_disambiguation === 641, 'actual needs_morphology_disambiguation occurrence count mismatch');
expect(counted.relationClassOccurrences.prefix_or_clitic_possible === 677, 'actual prefix_or_clitic_possible occurrence count mismatch');
expect(counted.relationClassOccurrences.exact_after_mark_strip === 449, 'actual exact_after_mark_strip occurrence count mismatch');
expect(counted.blockerRows.missing_agent1_6_custody_disposition === 205, 'actual missing_agent1_6_custody_disposition blocker row count mismatch');
expect(counted.blockerRows.answer_text_not_stored_by_preview === 205, 'actual answer_text_not_stored_by_preview blocker row count mismatch');
expect(counted.blockerRows.missing_approved_morphology_relation === 153, 'actual missing_approved_morphology_relation blocker row count mismatch');

for (const [index, row] of packet.rows.entries()) {
  const label = `row ${index} ${row.token_id || ''}`.trim();
  expect(typeof row.token_id === 'string' && row.token_id.length > 0, `${label} token_id required`);
  expect(row.lexicon_entry_id === null || (typeof row.lexicon_entry_id === 'string' && row.lexicon_entry_id.length > 0), `${label} lexicon_entry_id must be string or null`);
  expect(Number.isInteger(row.occurrences) && row.occurrences > 0, `${label} occurrences must be positive integer`);
  expect(row.lane === 'commercial_clean_candidate', `${label} lane must be commercial_clean_candidate`);
  expect(row.source_license_group === 'PUBLIC_DOMAIN_OBSERVED', `${label} source_license_group must be PUBLIC_DOMAIN_OBSERVED`);
  expect(row.planned_counterpart_text === 'TBD', `${label} planned_counterpart_text must remain TBD`);
  expect(row.display_status === 'non_public_commercial_clean_planning_only', `${label} display_status mismatch`);
  expect(row.definition_text_stored_now === false, `${label} definition_text_stored_now must be false`);
  expect(row.nc_definition_content_stored_now === false, `${label} nc_definition_content_stored_now must be false`);
  expect(row.answer_eligible === false, `${label} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `${label} promote_to_answer must be false`);
  expect(row.approved_for_public_emit === false, `${label} approved_for_public_emit must be false`);
  expect(row.public_emit_ready === false, `${label} public_emit_ready must be false`);
  expect(row.public_hud_emit_allowed === false, `${label} public_hud_emit_allowed must be false`);
  expect(row.route_jsonl_emit_allowed === false, `${label} route_jsonl_emit_allowed must be false`);
  expect(row.accepted_text === false, `${label} accepted_text must be false`);
  expect(row.public_mutation_allowed_here === false, `${label} public_mutation_allowed_here must be false`);
  expect(row.runtime_mutation_allowed_here === false, `${label} runtime_mutation_allowed_here must be false`);
  expect(Array.isArray(row.transform_blockers), `${label} transform_blockers must be array`);
  expect(row.transform_blockers.includes('missing_agent1_6_custody_disposition'), `${label} must preserve custody blocker`);
  expect(row.transform_blockers.includes('answer_text_not_stored_by_preview'), `${label} must preserve answer-text blocker`);
}

for (const [key, value] of Object.entries(packet.zero_counts || {})) {
  expect(Number(value) === 0, `zero_counts.${key} must remain zero`);
}

expect(String(packet.requested_agent6_review_question || '').includes('non-public Orot reader-hint placeholder package'), 'requested_agent6_review_question must preserve non-public placeholder package scope');
expect(String(packet.requested_agent6_review_question || '').includes('zero public/runtime/output/answer/definition/accepted-text emissions'), 'requested_agent6_review_question must preserve zero-emission boundary');
expect(String(packet.stop_condition || '').includes('Append only rows explicitly cleared by Agent6'), 'stop_condition must preserve Agent6 row/subset disposition boundary');
expect(String(packet.highest_permissible_claim || '').includes('non-public planning review only'), 'highest_permissible_claim must remain planning-only');
expect(Array.isArray(packet.not_accepted), 'not_accepted must be array');
for (const claim of ['Definition authority', 'answer acceptance', 'public/runtime acceptance', 'publication readiness', 'accepted text', 'public reader output']) {
  expect(packet.not_accepted.includes(claim), `not_accepted must include ${claim}`);
}

if (issues.length) {
  console.error(`Agent 10 Orot 205-row commercial-clean subset validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  validated_packet: packetPath,
  rows: subset.rows,
  occurrences: subset.occurrences,
  relation_class_counts: subset.relation_class_counts,
  transform_blocker_counts: subset.transform_blocker_counts,
  zero_counts: packet.zero_counts,
  boundary: 'Orot 205-row commercial-clean subset validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.',
}, null, 2));

function countRows(rows) {
  const result = {
    rows: rows.length,
    occurrences: 0,
    relationClassRows: Object.create(null),
    relationClassOccurrences: Object.create(null),
    blockerRows: Object.create(null),
  };
  for (const row of rows) {
    result.occurrences += Number(row.occurrences || 0);
    const relation = row.preview_relation_class || 'missing';
    result.relationClassRows[relation] = (result.relationClassRows[relation] || 0) + 1;
    result.relationClassOccurrences[relation] = (result.relationClassOccurrences[relation] || 0) + Number(row.occurrences || 0);
    for (const blocker of row.transform_blockers || []) {
      result.blockerRows[blocker] = (result.blockerRows[blocker] || 0) + 1;
    }
  }
  return result;
}

function arrayEquals(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && expected.every((value, index) => actual[index] === value);
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
