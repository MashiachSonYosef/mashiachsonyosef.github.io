#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const repoRoot = process.cwd();
const inputRoot = 'data/workbench-evidence';
const outputJson = 'reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json';
const outputMd = 'reports/agent1-workbench-source-name-custody-partitions-2026-06-04.md';

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
  artifact_type: 'agent1_workbench_source_name_custody_partitions',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_workbench_source_name_custody_partitions.mjs',
  status: 'agent1_workbench_source_name_custody_partitions_prepared_for_agent6_boundary_only',
  input_root: inputRoot,
  input_file_count: files.length,
  counts: {
    parsed_rows: parsedRows,
    source_row_count: sourceRowCount,
    unique_source_id_count: sourceIds.size,
    unique_work_count: works.size,
    source_name_partition_count: partitionRows.length
  },
  license_partition_counts: licenseCounts,
  top_partitions: partitionRows.slice(0, 100),
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    cc_by_sa_requires_share_alike_boundary: true,
    public_emit_now: false,
    answer_eligible_now: false
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  agent6_boundary: 'Agent 6/legal boundary is required before source/license custody acceptance, public display, answer use, definition text use, or export behavior.',
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

const rows = artifact.top_partitions.slice(0, 20).map((row) => (
  `| ${row.source_name} | ${row.license_label} | ${row.source_row_count} | ${row.unique_source_id_count} | ${row.unique_work_count} | ${row.attribution_required} | ${row.commercial_export_allowed} | ${row.share_alike_required} |`
)).join('\n');

const markdown = [
  '# Agent 1 Workbench Source-Name Custody Partitions - 2026-06-04',
  '',
  `Status: \`${artifact.status}\`.`,
  '',
  '## Counts',
  '',
  `- input files: \`${artifact.input_file_count}\``,
  `- parsed rows: \`${artifact.counts.parsed_rows}\``,
  `- source rows: \`${artifact.counts.source_row_count}\``,
  `- unique source ids: \`${artifact.counts.unique_source_id_count}\``,
  `- unique works: \`${artifact.counts.unique_work_count}\``,
  `- source-name partitions: \`${artifact.counts.source_name_partition_count}\``,
  '',
  '## Top Source-Name Partitions',
  '',
  '| source name | license | source rows | source ids | works | attribution | commercial export flag | share alike |',
  '| --- | --- | ---: | ---: | ---: | --- | --- | --- |',
  rows,
  '',
  '## Boundary',
  '',
  'This is source/license/custody partition evidence only. It does not accept source/provenance, license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, NC commercial authorization, or CC-BY-SA commercial export authorization.',
  ''
].join('\n');

writeJson(outputJson, artifact);
writeText(outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  artifact: outputJson,
  report: outputMd,
  counts: artifact.counts,
  license_partition_counts: artifact.license_partition_counts
}, null, 2));
