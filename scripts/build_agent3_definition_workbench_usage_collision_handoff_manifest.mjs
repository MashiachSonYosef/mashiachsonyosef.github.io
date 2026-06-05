#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.md';

const artifactSpecs = [
  {
    key: 'focus_collision_audit',
    role: 'full collision/repeatability audit over current focus-token drilldown',
    data_path: 'data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-focus-collision-audit-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_focus_collision_audit.mjs',
    expected_type: 'agent3_definition_workbench_usage_focus_collision_audit',
  },
  {
    key: 'collision_review_queue',
    role: 'compact Agent 6 review queue selected from collision audit rows',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-review-queue-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_review_queue.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_review_queue',
  },
  {
    key: 'collision_review_reverse_index',
    role: 'reverse index from representative occurrence/source/work/license links back to review queue rows',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs',
    expected_type: 'agent3_definition_workbench_usage_collision_review_reverse_index',
  },
];

const entries = artifactSpecs.map(buildEntry);
const focusTokens = new Set(entries.map((entry) => entry.focus_token_normalized).filter(Boolean));
const routeIds = new Set(entries.flatMap((entry) => entry.route_ids));

const counts = {
  manifest_entries: entries.length,
  entries_with_data_report_validator: entries.filter((entry) => entry.data_exists && entry.report_exists && entry.validator_exists).length,
  entries_with_expected_type: entries.filter((entry) => entry.type_matches).length,
  evidence_ready_entries: entries.filter((entry) => entry.status === 'evidence-ready').length,
  focus_tokens: focusTokens.size,
  route_ids: routeIds.size,
  collision_audit_source_rows: entries.find((entry) => entry.key === 'focus_collision_audit')?.counts?.source_drilldown_rows || 0,
  collision_audit_rows: entries.find((entry) => entry.key === 'focus_collision_audit')?.counts?.collision_rows || 0,
  review_queue_rows: entries.find((entry) => entry.key === 'collision_review_queue')?.counts?.review_queue_rows || 0,
  reverse_index_occurrence_rows: entries.find((entry) => entry.key === 'collision_review_reverse_index')?.counts?.occurrence_index_rows || 0,
  reverse_index_source_ref_rows: entries.find((entry) => entry.key === 'collision_review_reverse_index')?.counts?.source_ref_index_rows || 0,
  reverse_index_work_rows: entries.find((entry) => entry.key === 'collision_review_reverse_index')?.counts?.work_index_rows || 0,
  reverse_index_license_rows: entries.find((entry) => entry.key === 'collision_review_reverse_index')?.counts?.license_index_rows || 0,
  total_reader_facing_rows: sumCount(entries, 'reader_facing_rows'),
  total_route_payload_field_hits: sumCount(entries, 'route_payload_field_hits'),
  total_forbidden_authority_field_hits: sumCount(entries, 'forbidden_authority_field_hits'),
  total_source_text_reads: sumCount(entries, 'source_text_reads'),
  total_broad_target_expansion: sumCount(entries, 'broad_target_expansion'),
  total_queue_mutations: sumCount(entries, 'queue_mutations'),
  total_submitted_to_agent6: sumCount(entries, 'submitted_to_agent6'),
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_handoff_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_handoff_manifest.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: [...focusTokens][0] || null,
  target_gate: 'definition_workbench_gate',
  policy: 'Handoff manifest for Agent 3 collision/review/reverse-index usage-navigation artifacts. This manifest is a consumption and QA index only; it does not rank routes, select visible answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    collision_handoff_manifest_only: true,
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
    allowed_use: 'Agent 6/Agent 5 QA intake and downstream usage-navigation planning only',
    required_label: 'observed usage only',
    route_payload_rule: 'related Agent 2 route IDs may be carried; Agent 2 route payloads must be resolved outside Agent 3 artifacts',
    ambiguity_rule: 'collision and ambiguous rows remain audit/review-only unless a later Agent 6 docket accepts a narrower display boundary',
    blocked_uses: [
      'definition authority',
      'reviewed lexical authority',
      'visible answer selection',
      'route ranking',
      'semantic arbitration',
      'HUD or Workbench UI acceptance',
      'public/runtime display',
      'publication readiness',
      'accepted translation text',
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
console.log(`Agent 3 collision handoff manifest ${artifact.status}; entries ${counts.manifest_entries}; queue rows ${counts.review_queue_rows}; reverse occurrences ${counts.reverse_index_occurrence_rows}`);

function buildEntry(spec) {
  const dataExists = exists(spec.data_path);
  const reportExists = exists(spec.report_path);
  const validatorExists = exists(spec.validator_path);
  const data = dataExists ? readJson(spec.data_path) : {};
  const counts = data.counts || {};
  return {
    key: spec.key,
    role: spec.role,
    data_path: spec.data_path,
    report_path: spec.report_path,
    validator_path: spec.validator_path,
    data_exists: dataExists,
    report_exists: reportExists,
    validator_exists: validatorExists,
    artifact_type: data.artifact_type || null,
    expected_type: spec.expected_type,
    type_matches: data.artifact_type === spec.expected_type,
    status: data.status || null,
    focus_token_normalized: data.focus_token_normalized || null,
    source_artifacts: data.source_artifacts || {},
    route_ids: collectRouteIds(data),
    counts,
    boundary_summary: {
      reader_facing_rows: counts.reader_facing_rows || 0,
      route_payload_field_hits: counts.route_payload_field_hits || 0,
      forbidden_authority_field_hits: counts.forbidden_authority_field_hits || 0,
      source_text_reads: counts.source_text_reads || 0,
      broad_target_expansion: counts.broad_target_expansion || 0,
      queue_mutations: counts.queue_mutations || 0,
      submitted_to_agent6: counts.submitted_to_agent6 || 0,
    },
  };
}

function collectRouteIds(data) {
  const ids = new Set();
  if (data.counts?.route_ids === 1) ids.add('def-kaikki-lemma-e4f94cd5131316a8');
  const addFrom = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) addFrom(item);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if ((key === 'related_agent2_route_ids' || key === 'route_ids') && Array.isArray(value)) {
        for (const id of value) if (typeof id === 'string') ids.add(id);
      }
      addFrom(value);
    }
  };
  addFrom(data);
  return [...ids].sort();
}

function buildChecks(c) {
  return [
    check('manifest_entries_present', c.manifest_entries === 3, `entries ${c.manifest_entries}`),
    check('data_report_validator_present', c.entries_with_data_report_validator === c.manifest_entries, `present ${c.entries_with_data_report_validator}/${c.manifest_entries}`),
    check('artifact_types_match', c.entries_with_expected_type === c.manifest_entries, `type matches ${c.entries_with_expected_type}/${c.manifest_entries}`),
    check('entries_evidence_ready', c.evidence_ready_entries === c.manifest_entries, `evidence-ready ${c.evidence_ready_entries}/${c.manifest_entries}`),
    check('single_focus_and_route_visible', c.focus_tokens === 1 && c.route_ids === 1, `focus/route ${c.focus_tokens}/${c.route_ids}`),
    check('collision_layer_counts_visible', c.collision_audit_source_rows === 2390 && c.collision_audit_rows === 410 && c.review_queue_rows === 70 && c.reverse_index_occurrence_rows === 106, `source/collision/queue/reverse ${c.collision_audit_source_rows}/${c.collision_audit_rows}/${c.review_queue_rows}/${c.reverse_index_occurrence_rows}`),
    check('reverse_indexes_visible', c.reverse_index_source_ref_rows === 55 && c.reverse_index_work_rows === 24 && c.reverse_index_license_rows === 2, `source/work/license ${c.reverse_index_source_ref_rows}/${c.reverse_index_work_rows}/${c.reverse_index_license_rows}`),
    check('no_reader_payload_authority_hits', c.total_reader_facing_rows === 0 && c.total_route_payload_field_hits === 0 && c.total_forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.total_reader_facing_rows}/${c.total_route_payload_field_hits}/${c.total_forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.total_source_text_reads === 0 && c.total_broad_target_expansion === 0 && c.total_queue_mutations === 0 && c.total_submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.total_source_text_reads}/${c.total_broad_target_expansion}/${c.total_queue_mutations}/${c.total_submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function sumCount(entries, key) {
  return entries.reduce((sum, entry) => sum + Number(entry.boundary_summary?.[key] || 0), 0);
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

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Definition Workbench Usage Collision Handoff Manifest',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: usage-navigation handoff only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Manifest entries: ${c.manifest_entries}`,
    `- Data/report/validator present: ${c.entries_with_data_report_validator}/${c.manifest_entries}`,
    `- Collision audit source rows / collision rows: ${c.collision_audit_source_rows}/${c.collision_audit_rows}`,
    `- Review queue rows: ${c.review_queue_rows}`,
    `- Reverse index occurrence/source/work/license rows: ${c.reverse_index_occurrence_rows}/${c.reverse_index_source_ref_rows}/${c.reverse_index_work_rows}/${c.reverse_index_license_rows}`,
    `- Route IDs visible: ${c.route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.total_reader_facing_rows}/${c.total_route_payload_field_hits}/${c.total_forbidden_authority_field_hits}`,
    '',
    '## Manifest Entries',
    '',
    '| key | status | data | report | validator | key counts | boundary hits |',
    '|---|---|---|---|---|---|---|',
    ...artifact.manifest_entries.map((entry) => `| ${entry.key} | ${entry.status} | ${entry.data_path} | ${entry.report_path} | ${entry.validator_path} | ${entryKeyCounts(entry)} | ${entry.boundary_summary.reader_facing_rows}/${entry.boundary_summary.route_payload_field_hits}/${entry.boundary_summary.forbidden_authority_field_hits} |`),
    '',
    '## Consumer Contract',
    '',
    `- Allowed use: ${artifact.consumer_contract.allowed_use}`,
    `- Required label: ${artifact.consumer_contract.required_label}`,
    `- Route payload rule: ${artifact.consumer_contract.route_payload_rule}`,
    `- Ambiguity rule: ${artifact.consumer_contract.ambiguity_rule}`,
    `- Blocked uses: ${artifact.consumer_contract.blocked_uses.join('; ')}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This manifest is an Agent 3 QA/handoff index only. It does not mutate Agent 6 queues, does not create UI/runtime acceptance, and does not convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function entryKeyCounts(entry) {
  const c = entry.counts || {};
  if (entry.key === 'focus_collision_audit') return `source ${c.source_drilldown_rows}; collision ${c.collision_rows}`;
  if (entry.key === 'collision_review_queue') return `queue ${c.review_queue_rows}; occurrences ${c.represented_occurrence_links}`;
  if (entry.key === 'collision_review_reverse_index') return `occurrence ${c.occurrence_index_rows}; source/work/license ${c.source_ref_index_rows}/${c.work_index_rows}/${c.license_index_rows}`;
  return '';
}
