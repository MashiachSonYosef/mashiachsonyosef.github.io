#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  agent3Package: 'reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.json',
  spark10Matrix: 'reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json',
  nohitInventory: 'reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json',
  packageAnchor: 'data/build/orot/reader-hint-placeholder-candidates.json',
  outputJson: 'reports/agent1-third-missed-source-family-target-or-blocker-2026-06-04.json',
  outputMd: 'reports/agent1-third-missed-source-family-target-or-blocker-2026-06-04.md'
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const agent3 = readJson(PATHS.agent3Package);
const spark10 = readJson(PATHS.spark10Matrix);
const nohit = readJson(PATHS.nohitInventory);
const packageAnchor = readJson(PATHS.packageAnchor);

const counts = agent3.package_counts || {};
assert(counts.matrix_rows === 169, 'Agent 3 matrix_rows must be 169');
assert(counts.matrix_occurrences === 2148, 'Agent 3 matrix_occurrences must be 2148');
assert(counts.rows_with_exact_linkage_blocker === 168, 'Agent 3 exact linkage blocker rows must be 168');
assert(counts.occurrences_with_exact_linkage_blocker === 2117, 'Agent 3 exact linkage blocker occurrences must be 2117');

const spark10Rows = spark10.rows || spark10.matrix_rows || spark10.candidates || [];
const hasRowLevelSourceFamily = Array.isArray(spark10Rows) && spark10Rows.some((row) => (
  row && typeof row === 'object' && (
    row.source_family ||
    row.source_families ||
    row.source_license_group ||
    row.license_group ||
    row.observed_license
  )
));

const output = {
  schema_version: 1,
  artifact_type: 'agent1_third_missed_source_family_target_or_blocker',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_orot_third_missed_source_family_target_or_blocker.mjs',
  status: hasRowLevelSourceFamily ? 'candidate_workset_detected_needs_agent1_review' : 'missing_workset_blocker',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model',
  sequence_slot: 3,
  prior_completed_pipelines: [
    {
      name: 'Orot NC/Klein educational source-family pipeline',
      rows: 17,
      occurrences: 259,
      status: 'runnable_validated'
    },
    {
      name: 'Orot next missed source-family pipeline',
      rows: 50,
      occurrences: 1193,
      status: 'runnable_validated'
    }
  ],
  candidate_evidence_checked: [
    PATHS.agent3Package,
    PATHS.spark10Matrix,
    PATHS.nohitInventory,
    PATHS.packageAnchor
  ],
  counts_found: {
    source_no_hit_inventory_rows: counts.source_inventory_rows,
    source_no_hit_inventory_occurrences: counts.source_inventory_occurrences,
    local_route_card_matrix_rows: counts.matrix_rows,
    local_route_card_matrix_occurrences: counts.matrix_occurrences,
    rows_already_in_placeholder_package: counts.rows_already_in_placeholder_package,
    occurrences_already_in_placeholder_package: counts.occurrences_already_in_placeholder_package,
    rows_with_exact_linkage_blocker: counts.rows_with_exact_linkage_blocker,
    occurrences_with_exact_linkage_blocker: counts.occurrences_with_exact_linkage_blocker,
    route_cards_total: counts.route_card_count_total,
    candidate_cards_total: counts.candidate_card_count_total,
    ambiguity_cards_total: counts.ambiguity_card_count_total,
    package_anchor_rows: packageAnchor.counts?.placeholder_rows,
    package_anchor_occurrences: packageAnchor.counts?.placeholder_occurrences
  },
  source_family_detection: {
    spark10_row_count_observed: Array.isArray(spark10Rows) ? spark10Rows.length : null,
    has_row_level_source_family_or_license_fields: hasRowLevelSourceFamily,
    reason: hasRowLevelSourceFamily
      ? 'At least one Spark-10 matrix row exposes source-family/license fields; Agent 1 review can be requested.'
      : 'The checked 169-row matrix is linkage/dedupe/navigation evidence and lacks row-level source-family/license split needed for an Agent 1 source/license/custody contract.'
  },
  blocker_reason: hasRowLevelSourceFamily
    ? null
    : 'The 169-row matrix is a linkage/dedupe/navigation workset, not an Agent 1 source/license/custody source-family workset.',
  missing_fields: hasRowLevelSourceFamily ? [] : [
    'exact source family or source-family buckets',
    'row-level source/license split',
    'commercial-clean / noncommercial_educational_candidate / metadata-link-only / blocked classification',
    'derived_from_nc flags where applicable',
    'commercial_export_allowed flags where applicable',
    'attribution requirements',
    'source/custody manifest requirements',
    'Agent 1 output path/schema for source-family contract',
    'Agent 1 build script name for source-family contract',
    'Agent 1 validator/gate command for source-family contract',
    'Agent 6 boundary question'
  ],
  next_command: hasRowLevelSourceFamily
    ? 'Author Agent 1 source-family contract from detected source-family/license rows.'
    : null,
  spark1_route_allowed_now: hasRowLevelSourceFamily,
  handoff_owner: {
    agent1: 'source/license/custody package owner once exact source-family workset exists',
    agent3_agent2: 'likely prerequisite mechanics owners if the 169-row matrix must be converted into source-family evidence',
    spark1: hasRowLevelSourceFamily ? 'may run after complete Contract 3 exists' : 'not routable for Contract 3 yet'
  },
  agent6_boundary: hasRowLevelSourceFamily
    ? 'Agent 6 boundary question must be authored after Agent 1 source/license/custody split is produced.'
    : 'No Agent 6 source/license/custody boundary question can be asked yet because exact source family/license split is missing.',
  stop_condition: hasRowLevelSourceFamily
    ? 'Stop after candidate workset detection; next step is authoring a full Contract 3 source/license/custody pipeline.'
    : 'Stop until exact third missed source-family workset, contract-ready Agent 1 input artifact, or explicit owner route to convert the 169-row matrix is supplied.',
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  what_must_not_be_accepted: [
    'source/license acceptance',
    'NC flattening',
    'QA acceptance',
    'Definition authority',
    'runtime/public acceptance',
    'publication readiness',
    'product/data acceptance',
    'answer acceptance',
    'accepted gloss/text',
    'public/runtime mutation'
  ]
};

const markdown = [
  '# Agent 1 Third Missed Source-Family Target Or Blocker - 2026-06-04',
  '',
  `Status: \`${output.status}\`.`,
  '',
  '## Target',
  '',
  'Requested lane: Agent 1 source/license/custody.',
  'Requested sequence slot: third missed dictionary/source-family after the two validated Orot pipelines.',
  '',
  '## Files',
  '',
  ...output.candidate_evidence_checked.map((file) => `- \`${file}\``),
  '',
  '## Counts / Rows Found',
  '',
  `- source no-hit inventory: \`${output.counts_found.source_no_hit_inventory_rows}\` rows / \`${output.counts_found.source_no_hit_inventory_occurrences}\` occurrences`,
  `- local-route-card matrix: \`${output.counts_found.local_route_card_matrix_rows}\` rows / \`${output.counts_found.local_route_card_matrix_occurrences}\` occurrences`,
  `- rows already in placeholder package: \`${output.counts_found.rows_already_in_placeholder_package}\``,
  `- exact linkage blockers: \`${output.counts_found.rows_with_exact_linkage_blocker}\` rows / \`${output.counts_found.occurrences_with_exact_linkage_blocker}\` occurrences`,
  `- route cards / candidate cards / ambiguity cards: \`${output.counts_found.route_cards_total}\` / \`${output.counts_found.candidate_cards_total}\` / \`${output.counts_found.ambiguity_cards_total}\``,
  '',
  '## Source-Family Detection',
  '',
  `- row-level source-family/license fields observed: \`${output.source_family_detection.has_row_level_source_family_or_license_fields}\``,
  `- reason: ${output.source_family_detection.reason}`,
  '',
  '## Missing Fields',
  '',
  ...(output.missing_fields.length ? output.missing_fields.map((field) => `- ${field}`) : ['- none']),
  '',
  '## Handoff',
  '',
  `next command: ${output.next_command ? `\`${output.next_command}\`` : 'none'}`,
  `Spark-1 route allowed now: \`${output.spark1_route_allowed_now}\``,
  `Agent 6 boundary: ${output.agent6_boundary}`,
  '',
  '## Boundary',
  '',
  'No source/license acceptance, no NC flattening, no QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or public/runtime mutation.',
  ''
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  output_json: PATHS.outputJson,
  output_md: PATHS.outputMd,
  status: output.status,
  rows: output.counts_found.local_route_card_matrix_rows,
  occurrences: output.counts_found.local_route_card_matrix_occurrences,
  spark1_route_allowed_now: output.spark1_route_allowed_now
}, null, 2));
