#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.md';

const artifactSpecs = [
  {
    key: 'work_category_index',
    role: 'category/work/license navigation index over collision review representative occurrences',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-work-category-index-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_index.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_work_category_index',
  },
  {
    key: 'work_category_occurrence_locator',
    role: 'concrete source/local anchor occurrence locator for work/category rows',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_work_category_occurrence_locator',
  },
  {
    key: 'work_category_provenance_locator',
    role: 'license/version-source provenance navigation over concrete occurrence rows',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_work_category_provenance_locator',
  },
  {
    key: 'work_category_source_ref_repeat_locator',
    role: 'source-ref, anchor, and repeated snippet navigation over occurrence rows',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator',
  },
  {
    key: 'work_category_cross_work_snippet_locator',
    role: 'review-focus locator for repeated snippets crossing works or categories',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator',
  },
  {
    key: 'work_category_validation_run',
    role: 'validator-run evidence over the current work/category index and Agent 3 state',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_validation_run.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_work_category_validation_run',
  },
];

const entries = artifactSpecs.map(buildEntry);
const routeIds = new Set(entries.flatMap((entry) => entry.route_ids));
const focusTokens = new Set(entries.map((entry) => entry.focus_token_normalized).filter(Boolean));
const indexEntry = entries.find((entry) => entry.key === 'work_category_index');
const occurrenceEntry = entries.find((entry) => entry.key === 'work_category_occurrence_locator');
const provenanceEntry = entries.find((entry) => entry.key === 'work_category_provenance_locator');
const repeatEntry = entries.find((entry) => entry.key === 'work_category_source_ref_repeat_locator');
const crossWorkEntry = entries.find((entry) => entry.key === 'work_category_cross_work_snippet_locator');
const validationEntry = entries.find((entry) => entry.key === 'work_category_validation_run');

const counts = {
  manifest_entries: entries.length,
  entries_with_data_report_validator: entries.filter((entry) => entry.data_exists && entry.report_exists && entry.validator_exists).length,
  entries_with_expected_type: entries.filter((entry) => entry.type_matches).length,
  evidence_ready_entries: entries.filter((entry) => entry.status === 'evidence-ready').length,
  focus_tokens: focusTokens.size,
  route_ids: routeIds.size,
  source_occurrence_rows: numberFrom(indexEntry, 'source_occurrence_rows'),
  category_index_rows: numberFrom(indexEntry, 'category_index_rows'),
  work_index_rows: numberFrom(indexEntry, 'work_index_rows'),
  category_license_index_rows: numberFrom(indexEntry, 'category_license_index_rows'),
  queue_links: numberFrom(indexEntry, 'occurrence_queue_links') || numberFrom(indexEntry, 'queue_links'),
  categories_with_multiple_works: numberFrom(indexEntry, 'categories_with_multiple_works'),
  works_with_multiple_source_refs: numberFrom(indexEntry, 'works_with_multiple_source_refs'),
  category_license_rows_with_multiple_works: numberFrom(indexEntry, 'category_license_rows_with_multiple_works'),
  rows_with_complete_metadata: numberFrom(indexEntry, 'rows_with_complete_metadata'),
  rows_labeled_observed_usage_only: numberFrom(indexEntry, 'rows_labeled_observed_usage_only'),
  occurrence_locator_rows: numberFrom(occurrenceEntry, 'unique_locator_rows'),
  occurrence_locator_duplicate_grouped_rows: numberFrom(occurrenceEntry, 'duplicate_grouped_occurrence_rows'),
  provenance_locator_rows: numberFrom(provenanceEntry, 'source_locator_rows'),
  provenance_license_buckets: numberFrom(provenanceEntry, 'license_index_rows'),
  provenance_version_source_buckets: numberFrom(provenanceEntry, 'version_source_index_rows'),
  source_ref_repeat_buckets: numberFrom(repeatEntry, 'source_ref_repeat_buckets'),
  source_ref_repeat_rows: numberFrom(repeatEntry, 'source_ref_repeat_rows'),
  phrase_context_repeat_buckets: numberFrom(repeatEntry, 'phrase_context_repeat_buckets'),
  phrase_context_repeat_rows: numberFrom(repeatEntry, 'phrase_context_repeat_rows'),
  cross_work_snippet_buckets: numberFrom(crossWorkEntry, 'cross_work_snippet_buckets'),
  cross_work_snippet_occurrence_rows: numberFrom(crossWorkEntry, 'cross_work_snippet_occurrence_rows'),
  validation_commands: numberFrom(validationEntry, 'validation_commands'),
  validation_commands_passed: numberFrom(validationEntry, 'commands_passed'),
  validation_commands_failed: numberFrom(validationEntry, 'commands_failed'),
  total_reader_facing_rows: sumBoundary('reader_facing_rows'),
  total_route_payload_field_hits: sumBoundary('route_payload_field_hits'),
  total_forbidden_authority_field_hits: sumBoundary('forbidden_authority_field_hits'),
  total_source_text_reads: sumBoundary('source_text_reads'),
  total_broad_target_expansion: sumBoundary('broad_target_expansion'),
  total_queue_mutations: sumBoundary('queue_mutations'),
  total_submitted_to_agent6: sumBoundary('submitted_to_agent6'),
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_handoff_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_handoff_manifest.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: [...focusTokens][0] || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: Object.fromEntries(artifactSpecs.map((spec) => [spec.key, spec.data_path])),
  policy: 'Work/category handoff manifest for Agent 3 usage-navigation evidence. This manifest organizes already-built occurrence navigation artifacts for Agent 5/6 QA intake only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    work_category_handoff_manifest_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_route_payloads: false,
    accepted_text_output: false,
    publication_claim: false,
    source_text_read: false,
    broad_target_expansion: false,
    agent6_accepted: false,
  },
  consumer_contract: {
    allowed_use: 'Agent 5/Agent 6 QA intake and downstream usage-navigation planning only',
    required_label: 'observed usage only',
    route_payload_rule: 'carry Agent 2 route IDs only; resolve route payloads outside Agent 3 artifacts',
    ambiguity_rule: 'review/collision rows remain audit-only unless a later Agent 6 docket accepts a narrower display boundary',
    blocked_uses: [
      'Definition authority',
      'reviewed lexical authority',
      'visible answer selection',
      'route ranking',
      'semantic arbitration',
      'HUD or Workbench UI acceptance',
      'public/runtime display',
      'publication readiness',
      'accepted text',
    ],
  },
  manifest_entries: entries,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 work/category handoff manifest ${artifact.status}; entries ${counts.manifest_entries}; source rows ${counts.source_occurrence_rows}; queue links ${counts.queue_links}`);

function buildEntry(spec) {
  const dataExists = exists(spec.data_path);
  const data = dataExists ? readJson(spec.data_path) : {};
  const counts = data.counts || {};
  return {
    key: spec.key,
    role: spec.role,
    data_path: spec.data_path,
    report_path: spec.report_path,
    validator_path: spec.validator_path,
    data_exists: dataExists,
    report_exists: exists(spec.report_path),
    validator_exists: exists(spec.validator_path),
    artifact_type: data.artifact_type || null,
    expected_type: spec.expected_type,
    type_matches: data.artifact_type === spec.expected_type,
    status: data.status || null,
    focus_token_normalized: data.focus_token_normalized || null,
    source_artifacts: data.source_artifacts || {},
    route_ids: collectRouteIds(data),
    counts,
    boundary_summary: {
      reader_facing_rows: Number(counts.reader_facing_rows || 0),
      route_payload_field_hits: Number(counts.route_payload_field_hits || 0),
      forbidden_authority_field_hits: Number(counts.forbidden_authority_field_hits || 0),
      source_text_reads: Number(counts.source_text_reads || 0),
      broad_target_expansion: Number(counts.broad_target_expansion || 0),
      queue_mutations: Number(counts.queue_mutations || 0),
      submitted_to_agent6: Number(counts.submitted_to_agent6 || 0),
    },
  };
}

function buildChecks(c) {
  return [
    check('manifest_entries_present', c.manifest_entries === 6, `entries ${c.manifest_entries}`),
    check('data_report_validator_present', c.entries_with_data_report_validator === c.manifest_entries, `present ${c.entries_with_data_report_validator}/${c.manifest_entries}`),
    check('artifact_types_match', c.entries_with_expected_type === c.manifest_entries, `type matches ${c.entries_with_expected_type}/${c.manifest_entries}`),
    check('entries_evidence_ready', c.evidence_ready_entries === c.manifest_entries, `evidence-ready ${c.evidence_ready_entries}/${c.manifest_entries}`),
    check('single_focus_and_route_visible', c.focus_tokens === 1 && c.route_ids === 1, `focus/route ${c.focus_tokens}/${c.route_ids}`),
    check('work_category_counts_visible', c.source_occurrence_rows === 106 && c.category_index_rows === 8 && c.work_index_rows === 24 && c.category_license_index_rows === 8, `source/category/work/category-license ${c.source_occurrence_rows}/${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`),
    check('queue_and_coverage_visible', c.queue_links === 200 && c.categories_with_multiple_works === 7 && c.works_with_multiple_source_refs === 12 && c.category_license_rows_with_multiple_works === 7, `queue/category/work/category-license ${c.queue_links}/${c.categories_with_multiple_works}/${c.works_with_multiple_source_refs}/${c.category_license_rows_with_multiple_works}`),
    check('metadata_and_observed_usage_complete', c.rows_with_complete_metadata === 106 && c.rows_labeled_observed_usage_only === 106, `metadata/observed ${c.rows_with_complete_metadata}/${c.rows_labeled_observed_usage_only}`),
    check('occurrence_locator_visible', c.occurrence_locator_rows === 96 && c.occurrence_locator_duplicate_grouped_rows === 10, `locator/duplicates ${c.occurrence_locator_rows}/${c.occurrence_locator_duplicate_grouped_rows}`),
    check('provenance_locator_visible', c.provenance_locator_rows === 96 && c.provenance_license_buckets === 2 && c.provenance_version_source_buckets === 22, `rows/license/version-source ${c.provenance_locator_rows}/${c.provenance_license_buckets}/${c.provenance_version_source_buckets}`),
    check('repeat_locator_visible', c.source_ref_repeat_buckets === 23 && c.source_ref_repeat_rows === 70 && c.phrase_context_repeat_buckets === 7 && c.phrase_context_repeat_rows === 14, `source-ref buckets/rows ${c.source_ref_repeat_buckets}/${c.source_ref_repeat_rows}; snippet buckets/rows ${c.phrase_context_repeat_buckets}/${c.phrase_context_repeat_rows}`),
    check('cross_work_snippet_locator_visible', c.cross_work_snippet_buckets === 3 && c.cross_work_snippet_occurrence_rows === 6, `buckets/rows ${c.cross_work_snippet_buckets}/${c.cross_work_snippet_occurrence_rows}`),
    check('validation_run_visible', c.validation_commands === 2 && c.validation_commands_passed === 2 && c.validation_commands_failed === 0, `validation commands passed/failed ${c.validation_commands}/${c.validation_commands_passed}/${c.validation_commands_failed}`),
    check('no_reader_payload_authority_hits', c.total_reader_facing_rows === 0 && c.total_route_payload_field_hits === 0 && c.total_forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.total_reader_facing_rows}/${c.total_route_payload_field_hits}/${c.total_forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.total_source_text_reads === 0 && c.total_broad_target_expansion === 0 && c.total_queue_mutations === 0 && c.total_submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.total_source_text_reads}/${c.total_broad_target_expansion}/${c.total_queue_mutations}/${c.total_submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Collision Work/Category Handoff Manifest',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is work/category handoff only and not Definition authority.',
    '',
    '## Scope',
    '',
    'This packet joins the Agent 3 work/category navigation index, occurrence locator, provenance locator, repeat locator, cross-work snippet locator, and validator-run evidence into one QA-ready handoff. It is a usage-navigation/concordance organization artifact only.',
    '',
    '## Handoff Entries',
    '',
    '| key | status | data | report | validator |',
    '|---|---|---|---|---|',
    ...value.manifest_entries.map((entry) => `| ${entry.key} | ${entry.status} | ${entry.data_exists ? 'present' : 'missing'} | ${entry.report_exists ? 'present' : 'missing'} | ${entry.validator_exists ? 'present' : 'missing'} |`),
    '',
    '## Counts',
    '',
    `- Manifest entries / evidence-ready: ${c.manifest_entries}/${c.evidence_ready_entries}`,
    `- Data/report/validator-present entries: ${c.entries_with_data_report_validator}/${c.manifest_entries}`,
    `- Source occurrence rows: ${c.source_occurrence_rows}`,
    `- Category / work / category-license rows: ${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`,
    `- Queue links preserved: ${c.queue_links}`,
    `- Multi-work categories / multi-source works / multi-work category-license rows: ${c.categories_with_multiple_works}/${c.works_with_multiple_source_refs}/${c.category_license_rows_with_multiple_works}`,
    `- Complete metadata / observed-usage rows: ${c.rows_with_complete_metadata}/${c.rows_labeled_observed_usage_only}`,
    `- Occurrence locator rows / duplicate grouped rows: ${c.occurrence_locator_rows}/${c.occurrence_locator_duplicate_grouped_rows}`,
    `- Provenance locator rows / license buckets / version-source buckets: ${c.provenance_locator_rows}/${c.provenance_license_buckets}/${c.provenance_version_source_buckets}`,
    `- Source-ref repeat buckets / rows: ${c.source_ref_repeat_buckets}/${c.source_ref_repeat_rows}`,
    `- Phrase-context repeat buckets / rows: ${c.phrase_context_repeat_buckets}/${c.phrase_context_repeat_rows}`,
    `- Cross-work snippet buckets / rows: ${c.cross_work_snippet_buckets}/${c.cross_work_snippet_occurrence_rows}`,
    `- Validation commands passed/failed: ${c.validation_commands_passed}/${c.validation_commands_failed}`,
    `- Route IDs visible: ${c.route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.total_reader_facing_rows}/${c.total_route_payload_field_hits}/${c.total_forbidden_authority_field_hits}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.total_source_text_reads}/${c.total_broad_target_expansion}/${c.total_queue_mutations}/${c.total_submitted_to_agent6}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This handoff packet exposes ${c.source_occurrence_rows} observed-usage occurrence rows, ${c.occurrence_locator_rows} concrete locator rows, ${c.source_ref_repeat_buckets} repeated source-ref buckets, and ${c.cross_work_snippet_buckets} cross-work snippet buckets, with ${c.queue_links} queue links and ${c.validation_commands_passed}/${c.validation_commands} validator commands passed. It preserves one Agent 2 route ID pointer only and does not copy route payloads.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This manifest is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function collectRouteIds(data) {
  const ids = new Set();
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if ((key === 'related_agent2_route_ids' || key === 'route_ids') && Array.isArray(value)) {
        for (const id of value) if (typeof id === 'string') ids.add(id);
      }
      visit(value);
    }
  };
  visit(data);
  return [...ids].sort();
}

function numberFrom(entry, key) {
  return Number(entry?.counts?.[key] || 0);
}

function sumBoundary(key) {
  return entries.reduce((sum, entry) => sum + Number(entry.boundary_summary[key] || 0), 0);
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}
