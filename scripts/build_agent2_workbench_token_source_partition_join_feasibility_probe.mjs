import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const tokenInventoryPath = '.local-cache/workbench-evidence/token-inventory-5000.json';
const tokenInventoryJsonlPath = '.local-cache/workbench-evidence/token-inventory-5000.tokens.jsonl';
const sourcePartitionPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const outputJson = 'reports/agent2-workbench-token-source-partition-join-feasibility-probe-2026-06-04.json';
const outputMd = 'reports/agent2-workbench-token-source-partition-join-feasibility-probe-2026-06-04.md';

const tokenInventory = readJson(tokenInventoryPath);
const sourcePartitions = readJson(sourcePartitionPath);
const tokenRows = await readJsonlPrefix(tokenInventoryJsonlPath, 5000);

const topTokens = tokenRows.slice(0, 5000);
const topWorkEdges = [];
const firstRefEdges = [];

for (const token of topTokens) {
  for (const work of token.top_works || []) {
    topWorkEdges.push({
      token_key: token.token_key,
      work_id: work.work_id,
      work_title: work.work_title,
      occurrence_count_in_top_work_edge: work.count,
      source_partition_join_available: false,
    });
  }
  for (const ref of token.first_refs || []) {
    firstRefEdges.push({
      token_key: token.token_key,
      source_ref: ref.source_ref,
      work_id: ref.work_id,
      work_title: ref.work_title,
    });
  }
}

const uniqueTopWorkIds = new Set(topWorkEdges.map((edge) => edge.work_id));

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_workbench_token_source_partition_join_feasibility_probe',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'nonpublic_join_feasibility_probe_exact_schema_blocker',
  target: 'determine whether current 5000-token inventory can be deterministically joined to Agent 1 source-name partitions',
  files: {
    token_inventory: tokenInventoryPath,
    token_inventory_jsonl: tokenInventoryJsonlPath,
    source_name_partitions: sourcePartitionPath,
    builder: 'scripts/build_agent2_workbench_token_source_partition_join_feasibility_probe.mjs',
    validator: 'scripts/validate_agent2_workbench_token_source_partition_join_feasibility_probe.mjs',
    output_json: outputJson,
    output_md: outputMd,
  },
  exact_command_or_script: {
    build: 'node scripts/build_agent2_workbench_token_source_partition_join_feasibility_probe.mjs',
    validate: `node scripts/validate_agent2_workbench_token_source_partition_join_feasibility_probe.mjs ${outputJson}`,
  },
  schema_counts: {
    token_inventory_top_rows: topTokens.length,
    distinct_normalized_tokens: tokenInventory.counts.distinct_normalized_tokens,
    total_tokens: tokenInventory.counts.total_tokens,
    source_name_partition_rows: sourcePartitions.counts.full_partition_count,
    source_rows: sourcePartitions.counts.source_row_count,
    top_work_edges_available: topWorkEdges.length,
    top_work_unique_work_ids: uniqueTopWorkIds.size,
    top_work_edges_with_source_partition_join: 0,
    top_work_unique_work_ids_with_source_partition_join: 0,
    first_ref_edges_available: firstRefEdges.length,
    complete_token_occurrence_source_partition_edges_available: 0,
  },
  feasible_now: {
    can_join_capped_top_work_edges_to_work_level_source_metadata: false,
    can_join_complete_token_occurrences_to_source_name_partitions: false,
    can_emit_definition_lemma_reader_hint_candidates: false,
    can_emit_candidate_text: false,
    can_emit_public_or_answer_rows: false,
  },
  exact_blocker: {
    id: 'token_inventory_lacks_complete_occurrence_level_source_partition_edges',
    reason: 'The current token inventory stores capped top_works and first_refs, not a complete per-token occurrence/source_name/source_family/license/source_url/source_name_partition_id edge table.',
    required_next_artifact: '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl',
    required_fields: [
      'token_key',
      'token_normalized',
      'source_ref',
      'work_id',
      'work_title',
      'source_name',
      'source_family',
      'license_label',
      'license_lane',
      'source_url_or_citation',
      'source_name_partition_id',
      'agent6_boundary_required',
    ],
  },
  transform_candidate_counts: {
    definition_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    lemma_candidate_rows: 0,
    candidate_text_rows: 0,
  },
  zero_emission_counters: {
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
  },
  sample_unjoined_top_work_edges: topWorkEdges.slice(0, 20),
  validator: `node scripts/validate_agent2_workbench_token_source_partition_join_feasibility_probe.mjs ${outputJson}`,
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop at feasibility probe until a complete token-source-partition edge artifact exists; do not infer candidate rows from capped top_work or first_ref samples.',
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertArtifact(value) {
  if (value.schema_counts.token_inventory_top_rows !== 5000) throw new Error('expected 5000 token rows');
  if (value.schema_counts.source_name_partition_rows !== 351) throw new Error('expected 351 source-name partitions');
  if (value.schema_counts.complete_token_occurrence_source_partition_edges_available !== 0) throw new Error('complete edge count must be 0');
  if (value.feasible_now.can_join_complete_token_occurrences_to_source_name_partitions !== false) throw new Error('complete join must remain false');
  for (const count of Object.values(value.transform_candidate_counts)) {
    if (count !== 0) throw new Error('candidate counts must remain 0');
  }
  for (const count of Object.values(value.zero_emission_counters)) {
    if (count !== 0) throw new Error('zero emission counters must remain 0');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

async function readJsonlPrefix(relativePath, limit) {
  const rows = [];
  const input = fs.createReadStream(path.join(root, relativePath), { encoding: 'utf8' });
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    rows.push(JSON.parse(line));
    if (rows.length >= limit) {
      rl.close();
      input.destroy();
      break;
    }
  }
  return rows;
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Workbench Token Source Partition Join Feasibility Probe - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Target',
    value.target,
    '',
    '## Commands',
    `- Build: \`${value.exact_command_or_script.build}\`.`,
    `- Validate: \`${value.exact_command_or_script.validate}\`.`,
    '',
    '## Counts',
    `- Token inventory top rows: ${value.schema_counts.token_inventory_top_rows}.`,
    `- Source-name partitions: ${value.schema_counts.source_name_partition_rows}.`,
    `- Top-work edges available / source-partition-joined: ${value.schema_counts.top_work_edges_available} / ${value.schema_counts.top_work_edges_with_source_partition_join}.`,
    `- First-ref edges available: ${value.schema_counts.first_ref_edges_available}.`,
    '- Complete token occurrence source-partition edges available: 0.',
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.',
    '',
    '## Blocker',
    `${value.exact_blocker.id}: ${value.exact_blocker.reason}`,
    '',
    'Required next artifact:',
    '',
    `- \`${value.exact_blocker.required_next_artifact}\``,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'This is a nonpublic feasibility probe only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
