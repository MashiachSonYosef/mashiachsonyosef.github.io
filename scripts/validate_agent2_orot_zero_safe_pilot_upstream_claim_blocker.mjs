import fs from 'node:fs';

const artifactPath = process.argv[2] || 'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json';
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_orot_zero_safe_pilot_upstream_claim_blocker', 'artifact_type mismatch');
expect(artifact.status === 'exact_blocker_no_safe_upstream_definition_route_claim_generator', 'status mismatch');
expect(artifact.input === 'reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-04.json', 'input path mismatch');

const counts = artifact.counts || {};
expect(counts.target_rows === 100, 'target_rows must be 100');
expect(counts.target_occurrences === 1960, 'target_occurrences must be 1960');
expect(counts.source_clean_rows === 87, 'source_clean_rows must be 87');
expect(counts.source_blocked_rows === 13, 'source_blocked_rows must be 13');
expect(counts.rows_with_exact_upstream_claim === 0, 'rows_with_exact_upstream_claim must be 0');
expect(counts.route_answer_cards === 0, 'route_answer_cards must be 0');
expect(counts.emitted_answer_rows === 0, 'emitted_answer_rows must be 0');
expect(counts.blocked_rows === 100, 'blocked_rows must be 100');
expect(counts.missing_exact_upstream_definition_claim === 100, 'missing_exact_upstream_definition_claim must be 100');
expect(counts.missing_lexicon_entry_id === 13, 'missing_lexicon_entry_id must be 13');
expect(counts.missing_orot_source_rows === 13, 'missing_orot_source_rows must be 13');

const laneSplit = artifact.lane_split || {};
expect(laneSplit.source_clean_consider_rows === 87, 'source_clean_consider_rows must be 87');
expect(laneSplit.source_linkage_blocked_rows === 13, 'source_linkage_blocked_rows must be 13');
expect(laneSplit.noncommercial_educational_candidate_rows_consumed === 0, 'NC rows consumed must be 0');
expect(laneSplit.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate text rows must be 0');

for (const [key, value] of Object.entries(artifact.transform_candidate_counts || {})) {
  expect(value === 0, `transform candidate count ${key} must be 0`);
}
for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero emission counter ${key} must be 0`);
}

expect(artifact.blocker?.exact_blocker === 'missing_machine_checkable_upstream_definition_route_claim_rejoin_morphology_homograph_gates', 'exact blocker mismatch');
expect((artifact.blocker?.missing_fields || []).includes('machine-checkable morphology safety gate'), 'missing morphology gate blocker');
expect((artifact.blocker?.missing_fields || []).includes('machine-checkable homograph safety gate'), 'missing homograph gate blocker');
expect(artifact.handoff_owner === 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner', 'handoff owner mismatch');

const forbiddenAccepted = [
  'Definition authority',
  'answer eligibility',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'candidate-text export'
];
for (const label of forbiddenAccepted) {
  expect((artifact.what_must_not_be_accepted || []).includes(label), `missing forbidden acceptance label: ${label}`);
}

if (issues.length) {
  console.error(`Agent 2 Orot zero-safe pilot upstream claim blocker validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot zero-safe pilot upstream claim blocker validation passed. Target rows: ${counts.target_rows}; transform candidates: 0.`);
