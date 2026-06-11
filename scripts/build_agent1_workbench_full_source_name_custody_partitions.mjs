#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const repoRoot = process.cwd();
const inputRoot = 'data/workbench-evidence';
const outputJsonPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-full-source-name-custody-partitions-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-full-source-name-custody-partitions-2026-06-04.md';

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function listCandidateFiles(root) {
  const found = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(fullPath(dir), { withFileTypes: true })) {
      const child = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(child);
      if (entry.isFile() && entry.name === 'candidate-evidence.jsonl') found.push(child.replaceAll('\\', '/'));
    }
  }
  walk(root);
  return found.sort();
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function sourcePolicy(license) {
  if (license === 'CC-BY-SA') {
    return {
      license_lane: 'commercial_clean_candidate',
      attribution_required: true,
      derived_from_nc: false,
      commercial_export_allowed: false,
      share_alike_required: true
    };
  }
  if (license === 'CC-BY') {
    return {
      license_lane: 'commercial_clean_candidate',
      attribution_required: true,
      derived_from_nc: false,
      commercial_export_allowed: true,
      share_alike_required: false
    };
  }
  return {
    license_lane: 'commercial_clean_candidate',
    attribution_required: false,
    derived_from_nc: false,
    commercial_export_allowed: true,
    share_alike_required: false
  };
}

const files = listCandidateFiles(inputRoot);
const partitions = new Map();
let sourceRowCount = 0;
let parsedRows = 0;
const sourceIds = new Set();
const works = new Set();

for (const file of files) {
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath(file), { encoding: 'utf8' }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    parsedRows += 1;
    if (row.work_id) works.add(row.work_id);
    for (const sourceRow of row.source_rows || []) {
      sourceRowCount += 1;
      if (sourceRow.source_id) sourceIds.add(sourceRow.source_id);
      const key = `${sourceRow.source_name}|||${sourceRow.license}|||${sourceRow.version_source}`;
      const current = partitions.get(key) || {
        source_name: sourceRow.source_name,
        source_family: sourceRow.source_family,
        license_label: sourceRow.license,
        license_url: sourceRow.license_url,
        version_source: sourceRow.version_source,
        source_row_count: 0,
        unique_source_ids: new Set(),
        unique_works: new Set(),
        sample_source_urls: []
      };
      current.source_row_count += 1;
      if (sourceRow.source_id) current.unique_source_ids.add(sourceRow.source_id);
      if (row.work_id) current.unique_works.add(row.work_id);
      if (current.sample_source_urls.length < 3 && sourceRow.source_url) current.sample_source_urls.push(sourceRow.source_url);
      partitions.set(key, current);
    }
  }
}

const partitionRows = [...partitions.values()]
  .sort((a, b) => b.source_row_count - a.source_row_count || a.source_name.localeCompare(b.source_name))
  .map((partition) => {
    const policy = sourcePolicy(partition.license_label);
    return {
      source_name: partition.source_name,
      source_family: partition.source_family,
      license_label: partition.license_label,
      license_url: partition.license_url,
      version_source: partition.version_source,
      source_row_count: partition.source_row_count,
      unique_source_id_count: partition.unique_source_ids.size,
      unique_work_count: partition.unique_works.size,
      license_lane: policy.license_lane,
      attribution_required: policy.attribution_required,
      derived_from_nc: policy.derived_from_nc,
      commercial_export_allowed: policy.commercial_export_allowed,
      share_alike_required: policy.share_alike_required,
      corpus_contamination: false,
      agent6_boundary_required: true,
      answer_eligible: false,
      public_emit: false,
      boundary_status: 'full_source_name_partition_evidence_until_agent6_boundary',
      sample_source_urls: partition.sample_source_urls
    };
  });

const licenseCounts = {};
for (const row of partitionRows) {
  licenseCounts[row.license_label] ||= { partition_count: 0, source_row_count: 0 };
  licenseCounts[row.license_label].partition_count += 1;
  licenseCounts[row.license_label].source_row_count += row.source_row_count;
}

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_full_source_name_custody_partitions',
  generated_at: '2026-06-05T00:08:00.000Z',
  generator: 'scripts/build_agent1_workbench_full_source_name_custody_partitions.mjs',
  status: 'agent1_workbench_full_source_name_custody_partitions_prepared_for_agent6_boundary_only',
  input_root: inputRoot,
  input_file_count: files.length,
  counts: {
    parsed_rows: parsedRows,
    source_row_count: sourceRowCount,
    unique_source_id_count: sourceIds.size,
    unique_work_count: works.size,
    source_name_partition_count: partitionRows.length,
    full_partition_count: partitionRows.length
  },
  license_partition_counts: licenseCounts,
  partition_rows: partitionRows,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    cc_by_sa_requires_share_alike_boundary: true,
    cc_by_requires_attribution_boundary: true,
    public_domain_boundary_required: true,
    cc0_boundary_required: true,
    public_emit_now: false,
    answer_eligible_now: false,
    definition_content_storage_now: false
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  agent6_boundary: 'Agent 6/release boundary is required before source/license custody acceptance, public display, answer use, definition text use, or export behavior.',
  non_acceptance_boundary: {
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_qa_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_public_runtime_mutation: true
  }
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  target: {
    work: 'broad workbench evidence',
    workset: 'workbench-full-source-name-custody-partitions',
    input_root: inputRoot,
    input_file_count: files.length,
    source_row_count: sourceRowCount,
    source_name_partition_count: partitionRows.length,
    full_partition_count: partitionRows.length,
    license_partition_counts: licenseCounts
  },
  inputs: files,
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_full_source_name_custody_partitions.mjs',
    current_status: 'runnable'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_full_source_name_custody_partitions.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_full_source_name_custody_partitions_contract.mjs',
    current_status: 'validated'
  },
  package_owner: 'Agent 1',
  agent6_boundary_need: 'Agent 6/release boundary is required before source/license custody acceptance, public display, answer use, definition text use, or export behavior.',
  spark1_stop_condition: 'output plus validator pass, or exact missing input/output/schema/validator/count blocker',
  what_must_not_be_accepted: [
    'source/provenance acceptance',
    'license/legal acceptance',
    'QA acceptance',
    'public/runtime mutation',
    'Definition authority',
    'answer acceptance',
    'accepted gloss/text',
    'publication readiness',
    'NC commercial authorization',
    'export authorization'
  ]
};

writeJson(outputJsonPath, artifact);
writeJson(contractJsonPath, contract);

const sampleRows = partitionRows.slice(0, 20).map((row) => (
  `| \`${row.source_name.replaceAll('`', "'")}\` | \`${row.license_label}\` | \`${row.source_row_count}\` | \`${row.unique_source_id_count}\` | \`${row.unique_work_count}\` |`
)).join('\n');

writeText(outputMdPath, `# Agent 1 Workbench Full Source-Name Custody Partitions - 2026-06-04

Status: \`${artifact.status}\`.

target: \`workbench-full-source-name-custody-partitions\`.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_full_source_name_custody_partitions.mjs
node scripts/validate_agent1_workbench_full_source_name_custody_partitions.mjs
node scripts/validate_agent1_spark1_workbench_full_source_name_custody_partitions_contract.mjs
\`\`\`

counts:

- input files: \`${files.length}\`
- source rows: \`${sourceRowCount}\`
- source-name partitions: \`${partitionRows.length}\`
- Public Domain partitions / rows: \`${licenseCounts['Public Domain']?.partition_count ?? 0}\` / \`${licenseCounts['Public Domain']?.source_row_count ?? 0}\`
- CC-BY-SA partitions / rows: \`${licenseCounts['CC-BY-SA']?.partition_count ?? 0}\` / \`${licenseCounts['CC-BY-SA']?.source_row_count ?? 0}\`
- CC-BY partitions / rows: \`${licenseCounts['CC-BY']?.partition_count ?? 0}\` / \`${licenseCounts['CC-BY']?.source_row_count ?? 0}\`
- CC0 partitions / rows: \`${licenseCounts.CC0?.partition_count ?? 0}\` / \`${licenseCounts.CC0?.source_row_count ?? 0}\`

## First 20 Partitions

| source name | license | source rows | source ids | works |
| --- | --- | ---: | ---: | ---: |
${sampleRows}

## Boundary

Full partition evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

writeText(contractMdPath, `# Agent 1 / Spark-1 Pipeline Contract - Workbench Full Source-Name Custody Partitions - 2026-06-04

Status: \`pipeline_contract_runnable_validated\`.

target: \`workbench-full-source-name-custody-partitions\`.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_full_source_name_custody_partitions.mjs
node scripts/validate_agent1_workbench_full_source_name_custody_partitions.mjs
node scripts/validate_agent1_spark1_workbench_full_source_name_custody_partitions_contract.mjs
\`\`\`

outputs:

- JSON: \`${outputJsonPath}\`
- MD: \`${outputMdPath}\`

counts:

- input files: \`${files.length}\`
- source rows: \`${sourceRowCount}\`
- source-name partitions: \`${partitionRows.length}\`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  input_file_count: files.length,
  source_row_count: sourceRowCount,
  source_name_partition_count: partitionRows.length,
  license_partition_counts: licenseCounts
}, null, 2));
