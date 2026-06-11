#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const repoRoot = process.cwd();
const inputRoot = 'data/workbench-evidence';
const outputJson = 'reports/agent1-workbench-source-license-custody-inventory-2026-06-04.json';
const outputMd = 'reports/agent1-workbench-source-license-custody-inventory-2026-06-04.md';

const licensePolicies = {
  'Public Domain': {
    license_lane: 'commercial_clean_candidate',
    attribution_required: false,
    derived_from_nc: false,
    commercial_export_allowed: true,
    share_alike_required: false
  },
  CC0: {
    license_lane: 'commercial_clean_candidate',
    attribution_required: false,
    derived_from_nc: false,
    commercial_export_allowed: true,
    share_alike_required: false
  },
  'CC-BY': {
    license_lane: 'commercial_clean_candidate',
    attribution_required: true,
    derived_from_nc: false,
    commercial_export_allowed: true,
    share_alike_required: false
  },
  'CC-BY-SA': {
    license_lane: 'commercial_clean_candidate',
    attribution_required: true,
    derived_from_nc: false,
    commercial_export_allowed: false,
    share_alike_required: true
  }
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
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

function inc(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function topEntries(map, limit = 20) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

const files = listCandidateFiles(inputRoot);
const counts = {
  input_file_count: files.length,
  jsonl_rows: 0,
  parsed_rows: 0,
  rows_with_source_rows: 0,
  source_row_count: 0,
  row_parse_errors: 0
};

const licenseCounts = new Map();
const sourceFamilyCounts = new Map();
const sourceNameCounts = new Map();
const versionTitleCounts = new Map();
const workIds = new Set();
const sourceIds = new Set();
const missing = {
  source_family: 0,
  source_name: 0,
  source_id: 0,
  source_url: 0,
  version_title: 0,
  version_source: 0,
  license: 0,
  license_url: 0
};
const sourceSamples = [];

for (const file of files) {
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath(file), { encoding: 'utf8' }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    counts.jsonl_rows += 1;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      counts.row_parse_errors += 1;
      continue;
    }
    counts.parsed_rows += 1;
    if (row.work_id) workIds.add(row.work_id);
    const sourceRows = Array.isArray(row.source_rows) ? row.source_rows : [];
    if (sourceRows.length > 0) counts.rows_with_source_rows += 1;
    for (const sourceRow of sourceRows) {
      counts.source_row_count += 1;
      if (!sourceRow.source_family) missing.source_family += 1;
      if (!sourceRow.source_name) missing.source_name += 1;
      if (!sourceRow.source_id) missing.source_id += 1;
      if (!sourceRow.source_url) missing.source_url += 1;
      if (!sourceRow.version_title) missing.version_title += 1;
      if (!sourceRow.version_source) missing.version_source += 1;
      if (!sourceRow.license) missing.license += 1;
      if (!sourceRow.license_url) missing.license_url += 1;
      inc(sourceFamilyCounts, sourceRow.source_family || 'missing');
      inc(sourceNameCounts, sourceRow.source_name || 'missing');
      inc(versionTitleCounts, sourceRow.version_title || 'missing');
      inc(licenseCounts, sourceRow.license || 'missing');
      if (sourceRow.source_id) sourceIds.add(sourceRow.source_id);
      if (sourceSamples.length < 10) {
        sourceSamples.push({
          input_file: file,
          candidate_id: row.candidate_id || null,
          source_ref: row.source_ref || null,
          source_name: sourceRow.source_name || null,
          source_family: sourceRow.source_family || null,
          source_id: sourceRow.source_id || null,
          license: sourceRow.license || null,
          license_url: sourceRow.license_url || null,
          fields_used: sourceRow.fields_used || []
        });
      }
    }
  }
}

const licenseRows = [...licenseCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([license_label, source_row_count]) => {
    const policy = licensePolicies[license_label] || {
      license_lane: 'blocked_or_needs_review',
      attribution_required: true,
      derived_from_nc: false,
      commercial_export_allowed: false,
      share_alike_required: false
    };
    return {
      license_label,
      source_row_count,
      source_family: 'hebrew_source_text',
      source_name: 'multiple',
      license_lane: policy.license_lane,
      attribution_required: policy.attribution_required,
      derived_from_nc: policy.derived_from_nc,
      commercial_export_allowed: policy.commercial_export_allowed,
      share_alike_required: policy.share_alike_required,
      owner_use_attestation: null,
      corpus_contamination: false,
      source_url_or_citation: 'source_rows[].source_url and source_rows[].version_source in candidate-evidence.jsonl',
      agent6_boundary_required: true
    };
  });

const laneCounts = licenseRows.reduce((acc, row) => {
  const lane = row.license_lane;
  acc[lane] ||= { license_count: 0, source_row_count: 0 };
  acc[lane].license_count += 1;
  acc[lane].source_row_count += row.source_row_count;
  return acc;
}, {});

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_source_license_custody_inventory',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_workbench_source_license_custody_inventory.mjs',
  status: 'agent1_workbench_source_license_custody_inventory_prepared_for_agent6_boundary_only',
  input_root: inputRoot,
  input_files: files,
  counts: {
    ...counts,
    unique_work_count: workIds.size,
    unique_source_id_count: sourceIds.size
  },
  required_field_missing_counts: missing,
  license_rows: licenseRows,
  lane_counts: laneCounts,
  top_source_names: topEntries(sourceNameCounts),
  top_version_titles: topEntries(versionTitleCounts),
  source_family_counts: Object.fromEntries([...sourceFamilyCounts.entries()].sort((a, b) => b[1] - a[1])),
  source_samples: sourceSamples,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    metadata_or_link_only_emits_citation_link_only: true,
    blocked_or_needs_review_emits_no_candidate_text: true,
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
  agent6_boundary: 'Agent 6/legal boundary is required before any source/license custody acceptance, commercial export, public display, answer use, or definition text use.',
  spark1_handoff: {
    command: 'node scripts/build_agent1_workbench_source_license_custody_inventory.mjs',
    validator: 'node scripts/validate_agent1_workbench_source_license_custody_inventory.mjs',
    stop_condition: 'Stop after inventory plus validator pass, or exact missing input/schema/validator/count blocker.'
  },
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

const licenseTable = licenseRows.map((row) => (
  `| ${row.license_label} | ${row.license_lane} | ${row.source_row_count} | ${row.attribution_required} | ${row.commercial_export_allowed} | ${row.share_alike_required} |`
)).join('\n');

const markdown = [
  '# Agent 1 Workbench Source/License/Custody Inventory - 2026-06-04',
  '',
  `Status: \`${artifact.status}\`.`,
  '',
  '## Counts',
  '',
  `- input files: \`${artifact.counts.input_file_count}\``,
  `- candidate-evidence rows parsed: \`${artifact.counts.parsed_rows}\``,
  `- rows with source rows: \`${artifact.counts.rows_with_source_rows}\``,
  `- source rows: \`${artifact.counts.source_row_count}\``,
  `- unique works: \`${artifact.counts.unique_work_count}\``,
  `- unique source ids: \`${artifact.counts.unique_source_id_count}\``,
  '',
  '## License Rows',
  '',
  '| license | lane | source rows | attribution required | commercial export allowed | share alike required |',
  '| --- | --- | ---: | --- | --- | --- |',
  licenseTable,
  '',
  '## Missing Required Source Fields',
  '',
  ...Object.entries(missing).map(([key, value]) => `- ${key}: \`${value}\``),
  '',
  '## Boundary',
  '',
  'This is source/license/custody inventory evidence only. It does not accept source/license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, or NC commercial authorization.',
  ''
].join('\n');

writeJson(outputJson, artifact);
writeText(outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  artifact: outputJson,
  report: outputMd,
  counts: artifact.counts,
  lane_counts: artifact.lane_counts
}, null, 2));
