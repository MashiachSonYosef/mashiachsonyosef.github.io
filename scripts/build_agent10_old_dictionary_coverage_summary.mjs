#!/usr/bin/env node
import fs from 'node:fs';

const outputJson =
  process.argv[2] ||
  'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.json';
const outputMd =
  process.argv[3] ||
  'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.md';

function fail(message) {
  console.error(`Build failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function write(path, text) {
  fs.writeFileSync(path, text);
}

const morphologyPath = 'reports/agent6-old-dictionary-morphology-planning-boundary-verdict-2026-06-05.json';
const sourceFamilyPath =
  'reports/agent6-old-dictionary-source-family-overlap-matrix-boundary-verdict-2026-06-05.json';
const subsetPath =
  'reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json';
const agent1HandoffPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json';
const agent2MorphologyPath =
  'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';

const morphology = readJson(morphologyPath);
const sourceFamily = readJson(sourceFamilyPath);
const subset = readJson(subsetPath);
const agent1Handoff = readJson(agent1HandoffPath);
const agent2Morphology = readJson(agent2MorphologyPath);

const commercialRows = (agent1Handoff.transform_rows || []).filter(
  (row) => row.license_lane === 'commercial_clean_candidate',
);

const artifact = {
  artifact_type: 'agent10_old_dictionary_commercial_clean_source_family_morphology_coverage_summary',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  owner: 'Agent 10',
  status: 'current_prior_agent6_planning_coverage_summary_no_transform_or_use_route',
  inputs: {
    morphology_verdict: morphologyPath,
    source_family_overlap_verdict: sourceFamilyPath,
    exact_row_subset_manifest_verdict: subsetPath,
    agent1_transform_lane_handoff: agent1HandoffPath,
    agent2_morphology_relation_matrix: agent2MorphologyPath,
  },
  prior_agent6_coverage: {
    morphology_planning: {
      disposition: morphology.disposition,
      scope: morphology.scope,
      rows: morphology.accepted_boundary?.rows,
      occurrences: morphology.accepted_boundary?.occurrences,
      selector: morphology.accepted_boundary?.selector,
      blocked_rows_preserved_outside_subset: morphology.independent_recount?.blocked_rows_preserved_outside_subset,
      blockers_preserved: morphology.blockers_preserved || [],
    },
    source_family_overlap: {
      disposition: sourceFamily.disposition,
      scope: sourceFamily.scope,
      source_families: sourceFamily.accepted_boundary?.source_families,
      exact_source_family_combinations: sourceFamily.accepted_boundary?.exact_source_family_combinations,
      total_exact_combination_rows: sourceFamily.accepted_boundary?.total_exact_combination_rows,
      total_exact_combination_occurrences: sourceFamily.accepted_boundary?.total_exact_combination_occurrences,
      exact_blockers: sourceFamily.accepted_boundary?.exact_blockers,
      lane_counts: sourceFamily.independent_recount?.source_family_lane_counts,
    },
    exact_row_subset_manifest: {
      disposition: subset.disposition,
      scope: subset.scope,
      subset_manifests: subset.accepted_boundary?.subset_manifests,
      rows: subset.accepted_boundary?.rows,
      occurrences: subset.accepted_boundary?.occurrences,
      total_token_ids: subset.independent_recount?.total_token_ids,
      unique_token_ids: subset.independent_recount?.unique_token_ids,
      total_queue_ids: subset.independent_recount?.total_queue_ids,
      unique_queue_ids: subset.independent_recount?.unique_queue_ids,
      duplicate_token_ids: subset.independent_recount?.duplicate_token_ids,
      duplicate_queue_ids: subset.independent_recount?.duplicate_queue_ids,
      nonzero_zero_counters: subset.independent_recount?.nonzero_zero_counters,
    },
  },
  commercial_clean_source_family_subsets: commercialRows.map((row) => ({
    row_subset_id: row.row_subset_id,
    source_family: row.source_family,
    license_lane: row.license_lane,
    transform_lane: row.transform_lane,
    evidence_path: row.evidence_path,
    rows: row.rows,
    occurrences: row.occurrences,
    derived_from_nc: row.derived_from_nc,
    commercial_export_allowed: row.commercial_export_allowed,
    attribution_required: row.attribution_required,
    corpus_contamination: row.corpus_contamination,
    agent6_boundary_required: row.agent6_boundary_required,
    agent2_transform_allowed_now: row.agent2_transform_allowed_now,
    answer_eligible: row.answer_eligible,
    public_emit: row.public_emit,
    handoff_owner: row.handoff_owner,
  })),
  agent2_morphology_summary: {
    status: agent2Morphology.status,
    counts: agent2Morphology.counts,
  },
  release_package_decision: {
    may_carry_forward_as_nonpublic_planning_evidence: true,
    agent6_packet_ready_now: false,
    reason_no_packet_now:
      'Prior Agent 6 dockets already cover planning evidence and preserve blockers; a later packet needs concrete candidate-use or transform intent for a specific subset.',
    next_boundary_type: 'exact_candidate_use_or_transform_boundary_for_specific_selected_subset',
  },
  exact_blockers: [
    'candidate_use_or_transform_intent_not_supplied_for_specific_subset',
    'missing_exact_agent6_row_subset_boundary_for_candidate_use',
    'missing_agent10_exact_agent6_candidate_use_packet_for_the_specific_planning_rows',
    'overlap_buckets_require_later_exact_agent6_source_family_selection_boundary_before_use',
    'no_transform_authorization_now',
    'candidate_text_export_blocked',
    'definition_lemma_reader_hint_content_storage_blocked',
    'answer_eligibility_blocked',
    'public_runtime_mutation_blocked',
    'route_writes_blocked',
    'accepted_text_blocked',
    'release_action_blocked',
  ],
  global_zero_counters: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    route_writes: 0,
    public_runtime_mutation: 0,
    accepted_text_rows: 0,
    release_actions: 0,
  },
  stop_condition:
    'Stop at current coverage summary. Do not route Agent 6, transform, store text, emit source rows, write routes, mutate public/runtime, export, or release until a concrete candidate-use/transform packet exists.',
};

const md = `# Agent 10 Old-Dictionary Coverage Summary

Generated: ${artifact.generated_at}

Status: \`${artifact.status}\`

## Prior Agent 6 Coverage

| docket | disposition | scope | counts |
|---|---|---|---:|
| morphology planning | \`${artifact.prior_agent6_coverage.morphology_planning.disposition}\` | \`${artifact.prior_agent6_coverage.morphology_planning.scope}\` | ${artifact.prior_agent6_coverage.morphology_planning.rows} rows / ${artifact.prior_agent6_coverage.morphology_planning.occurrences} occurrences |
| source-family overlap | \`${artifact.prior_agent6_coverage.source_family_overlap.disposition}\` | \`${artifact.prior_agent6_coverage.source_family_overlap.scope}\` | ${artifact.prior_agent6_coverage.source_family_overlap.total_exact_combination_rows} rows / ${artifact.prior_agent6_coverage.source_family_overlap.total_exact_combination_occurrences} occurrences |
| exact row-subset manifest | \`${artifact.prior_agent6_coverage.exact_row_subset_manifest.disposition}\` | \`${artifact.prior_agent6_coverage.exact_row_subset_manifest.scope}\` | ${artifact.prior_agent6_coverage.exact_row_subset_manifest.rows} rows / ${artifact.prior_agent6_coverage.exact_row_subset_manifest.occurrences} occurrences |

## Commercial-Clean Subsets

| source family | rows | occurrences | transform allowed now |
|---|---:|---:|---|
${artifact.commercial_clean_source_family_subsets
  .map((row) => `| ${row.source_family} | ${row.rows} | ${row.occurrences} | ${row.agent2_transform_allowed_now} |`)
  .join('\n')}

## Decision

May carry forward as non-public planning evidence only. No Agent 6 packet is ready now because there is no concrete candidate-use or transform intent for a specific selected subset.

Exact blocker: \`candidate_use_or_transform_intent_not_supplied_for_specific_subset\`

Zero public/runtime/output/answer/Definition/accepted-text/release counters remain preserved.
`;

write(outputJson, `${JSON.stringify(artifact, null, 2)}\n`);
write(outputMd, md);

console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);
