#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  manifest: 'data/workbench-evidence/usage-concordance-manifest.json',
  occurrenceLinkCheck: '.local-cache/workbench-evidence/usage-concordance-link-check.json',
  routeLinkCheck: '.local-cache/workbench-evidence/usage-route-link-check.json',
  auditReview: '.local-cache/workbench-evidence/usage-audit-only-review.json',
  clusterIndex: '.local-cache/workbench-evidence/usage-cluster-index.json',
  routeCoverage: '.local-cache/workbench-evidence/usage-route-coverage.json',
  sampleIndex: '.local-cache/workbench-evidence/usage-sample-index.json',
  lookupIndex: '.local-cache/workbench-evidence/usage-lookup-index.json',
  selectedSlice: '.local-cache/workbench-evidence/usage-slice-tanakh.json',
  selectedSlicesIndex: '.local-cache/workbench-evidence/usage-selected-slices-index.json',
  smokeValidation: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  skipSmokeValidation: false,
  output: '.local-cache/workbench-evidence/usage-navigation-handoff-index.json',
  report: 'reports/workbench-usage-navigation-handoff.md',
};

const options = parseArgs(process.argv.slice(2));
const manifest = readJson(options.manifest);
const occurrenceLinkCheck = readJsonIfExists(options.occurrenceLinkCheck);
const routeLinkCheck = readJsonIfExists(options.routeLinkCheck);
const auditReview = readJsonIfExists(options.auditReview);
const clusterIndex = readJsonIfExists(options.clusterIndex);
const routeCoverage = readJsonIfExists(options.routeCoverage);
const sampleIndex = readJsonIfExists(options.sampleIndex);
const lookupIndex = readJsonIfExists(options.lookupIndex);
const selectedSlice = readJsonIfExists(options.selectedSlice);
const selectedSlicesIndex = readJsonIfExists(options.selectedSlicesIndex);
const smokeValidation = options.smokeValidation ? readJsonIfExists(options.smokeValidation) : null;

if (manifest.artifact_type !== 'workbench_usage_navigation_concordance_manifest') {
  throw new Error(`${options.manifest} is not a usage concordance manifest`);
}

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_handoff_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_handoff_index.mjs',
  policy: 'Compact handoff index for the usage-navigation/concordance lane. It summarizes artifacts and validation state only; it does not rank routes, select visible answers, or make meaning claims.',
  inputs: {
    manifest: options.manifest,
    occurrence_link_check: options.occurrenceLinkCheck,
    route_link_check: options.routeLinkCheck,
    audit_review: options.auditReview,
    cluster_index: options.clusterIndex,
    route_coverage: options.routeCoverage,
    sample_index: options.sampleIndex,
    lookup_index: options.lookupIndex,
    selected_slice: options.selectedSlice,
    selected_slices_index: options.selectedSlicesIndex,
    smoke_validation: options.smokeValidation || null,
    smoke_validation_mode: options.skipSmokeValidation ? 'skipped_self_reference' : 'external_artifact',
  },
  authority_policy: manifest.authority_policy,
  artifacts: {
    concordance_json: manifest.outputs?.concordance_json || null,
    concordance_report: manifest.outputs?.concordance_report || null,
    manifest: manifest.outputs?.manifest || null,
    occurrence_link_check_report: 'reports/workbench-usage-concordance-link-check.md',
    route_link_check_report: 'reports/workbench-usage-route-link-check.md',
    audit_only_review_report: 'reports/workbench-usage-audit-only-review.md',
    cluster_index_report: 'reports/workbench-usage-cluster-index.md',
    route_coverage_report: 'reports/workbench-usage-route-coverage.md',
    sample_index_report: 'reports/workbench-usage-sample-index.md',
    lookup_index_report: 'reports/workbench-usage-lookup-index.md',
    selected_slice_report: 'reports/workbench-usage-slice-tanakh.md',
    selected_slices_index_report: 'reports/workbench-usage-selected-slices-index.md',
    smoke_validation_report: 'reports/workbench-smoke-pipeline-validation.md',
  },
  commands: buildCommands(options, manifest),
  counts: {
    concordance_rows: manifest.counts?.rows ?? null,
    selected_manifests: manifest.counts?.selected_manifests ?? null,
    supported: manifest.counts?.status_counts?.supported ?? null,
    candidate: manifest.counts?.status_counts?.candidate ?? null,
    weak: manifest.counts?.status_counts?.weak ?? null,
    audit_only_ambiguous: manifest.counts?.audit_only_counts?.ambiguous ?? null,
    audit_only_blocked: manifest.counts?.audit_only_counts?.blocked ?? null,
    route_linked_rows: manifest.counts?.route_link_state_counts?.route_linked_observed_usage ?? null,
    observed_only_rows: manifest.counts?.route_link_state_counts?.observed_usage_only ?? null,
    usage_clusters: clusterIndex?.counts?.clusters ?? null,
    unique_route_ids: routeCoverage?.counts?.unique_route_ids ?? null,
    sample_rows: sampleIndex?.counts?.sample_rows ?? null,
    lookup_occurrence_refs: lookupIndex?.counts?.occurrence_refs ?? null,
    lookup_works: lookupIndex?.counts?.works ?? null,
    selected_slice_rows: selectedSlice?.counts?.slice_rows ?? null,
    selected_slice_works: selectedSlice?.counts?.works ?? null,
    selected_slices_index_slices: selectedSlicesIndex?.counts?.slices ?? null,
    selected_slices_index_rows: selectedSlicesIndex?.counts?.rows ?? null,
  },
  validation: {
    occurrence_link_check_status: occurrenceLinkCheck?.quality?.status ?? 'not_run',
    occurrence_source_url_bad: occurrenceLinkCheck?.counts?.source_url_bad ?? null,
    occurrence_work_anchor_bad: occurrenceLinkCheck?.counts?.work_anchor_bad ?? null,
    route_link_check_status: routeLinkCheck?.quality?.status ?? 'not_run',
    route_links_resolved: routeLinkCheck?.counts?.route_links_resolved ?? null,
    route_links_unresolved: routeLinkCheck?.counts?.route_links_unresolved ?? null,
    route_metadata_mismatches: routeLinkCheck?.counts?.route_metadata_mismatch ?? null,
    audit_review_rows: auditReview?.counts?.rows ?? null,
    audit_review_reader_facing: auditReview?.reader_facing_policy?.reader_facing ?? null,
    cluster_index_status: clusterIndex?.artifact_type === 'workbench_usage_navigation_cluster_index' ? 'present' : 'not_run',
    cluster_index_rows: clusterIndex?.counts?.rows ?? null,
    route_coverage_status: routeCoverage?.artifact_type === 'workbench_usage_route_coverage_index' ? 'present' : 'not_run',
    route_coverage_links: routeCoverage?.counts?.route_links ?? null,
    sample_index_status: sampleIndex?.artifact_type === 'workbench_usage_navigation_sample_index' ? 'present' : 'not_run',
    sample_index_rows: sampleIndex?.counts?.sample_rows ?? null,
    lookup_index_status: lookupIndex?.artifact_type === 'workbench_usage_navigation_lookup_index' ? 'present' : 'not_run',
    lookup_index_occurrence_refs: lookupIndex?.counts?.occurrence_refs ?? null,
    selected_slice_status: selectedSlice?.artifact_type === 'workbench_usage_navigation_slice_index' ? 'present' : 'not_run',
    selected_slice_id: selectedSlice?.filter?.slice_id ?? null,
    selected_slice_rows: selectedSlice?.counts?.slice_rows ?? null,
    selected_slices_index_status: selectedSlicesIndex?.artifact_type === 'workbench_usage_navigation_selected_slices_index' ? 'present' : 'not_run',
    selected_slices_index_slices: selectedSlicesIndex?.counts?.slices ?? null,
    smoke_validation_status: options.skipSmokeValidation
      ? 'skipped_self_reference'
      : smokeValidation ? (smokeValidation.counts?.failed_steps === 0 ? 'passed' : 'failed') : 'not_run',
    smoke_steps: smokeValidation?.counts?.steps ?? null,
    smoke_failed_steps: smokeValidation?.counts?.failed_steps ?? null,
  },
  consumer_boundary: {
    observed_usage_not_meaning_claim: true,
    ambiguous_rows_reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    broad_target_expansion: false,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage handoff index rows ${artifact.counts.concordance_rows}; occurrence links ${artifact.validation.occurrence_link_check_status}; route links ${artifact.validation.route_link_check_status}; smoke ${artifact.validation.smoke_validation_status}`);

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Navigation Handoff',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Concordance rows: ${artifact.counts.concordance_rows}`,
    `- Selected manifests: ${artifact.counts.selected_manifests}`,
    `- Reader-facing statuses: supported ${artifact.counts.supported}, candidate ${artifact.counts.candidate}, weak ${artifact.counts.weak}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_ambiguous}, blocked ${artifact.counts.audit_only_blocked}`,
    `- Route-linked rows: ${artifact.counts.route_linked_rows}`,
    `- Observed-only rows: ${artifact.counts.observed_only_rows}`,
    `- Usage clusters: ${artifact.counts.usage_clusters}`,
    `- Unique route IDs: ${artifact.counts.unique_route_ids}`,
    `- Sample rows: ${artifact.counts.sample_rows}`,
    `- Lookup occurrence refs: ${artifact.counts.lookup_occurrence_refs}`,
    `- Lookup works: ${artifact.counts.lookup_works}`,
    `- Selected slice rows: ${artifact.counts.selected_slice_rows}`,
    `- Selected slice works: ${artifact.counts.selected_slice_works}`,
    `- Selected slices index: ${artifact.counts.selected_slices_index_slices}`,
    `- Selected slices index rows: ${artifact.counts.selected_slices_index_rows}`,
    '',
    '## Validation',
    '',
    `- Occurrence links: ${artifact.validation.occurrence_link_check_status}, bad source URLs ${artifact.validation.occurrence_source_url_bad}, bad work anchors ${artifact.validation.occurrence_work_anchor_bad}`,
    `- Route links: ${artifact.validation.route_link_check_status}, resolved ${artifact.validation.route_links_resolved}, unresolved ${artifact.validation.route_links_unresolved}, metadata mismatches ${artifact.validation.route_metadata_mismatches}`,
    `- Audit review: rows ${artifact.validation.audit_review_rows}, reader-facing ${artifact.validation.audit_review_reader_facing ? 'yes' : 'no'}`,
    `- Cluster index: ${artifact.validation.cluster_index_status}, rows ${artifact.validation.cluster_index_rows}, clusters ${artifact.counts.usage_clusters}`,
    `- Route coverage: ${artifact.validation.route_coverage_status}, links ${artifact.validation.route_coverage_links}, unique route IDs ${artifact.counts.unique_route_ids}`,
    `- Sample index: ${artifact.validation.sample_index_status}, samples ${artifact.validation.sample_index_rows}`,
    `- Lookup index: ${artifact.validation.lookup_index_status}, occurrence refs ${artifact.validation.lookup_index_occurrence_refs}`,
    `- Selected slice: ${artifact.validation.selected_slice_status}, id ${artifact.validation.selected_slice_id}, rows ${artifact.validation.selected_slice_rows}`,
    `- Selected slices index: ${artifact.validation.selected_slices_index_status}, slices ${artifact.validation.selected_slices_index_slices}`,
    `- Smoke validation: ${artifact.validation.smoke_validation_status}, steps ${artifact.validation.smoke_steps}, failed ${artifact.validation.smoke_failed_steps}`,
    '',
    '## Artifacts',
    '',
    '| artifact | path | tracked |',
    '|---|---|---|',
    `| concordance JSON | ${mdCell(artifact.artifacts.concordance_json?.path)} | ${artifact.artifacts.concordance_json?.tracked_in_git ? 'yes' : 'no'} |`,
    `| concordance report | ${mdCell(artifact.artifacts.concordance_report?.path)} | ${artifact.artifacts.concordance_report?.tracked_in_git ? 'yes' : 'no'} |`,
    `| manifest | ${mdCell(artifact.artifacts.manifest?.path)} | ${artifact.artifacts.manifest?.tracked_in_git ? 'yes' : 'no'} |`,
    `| occurrence link check | ${mdCell(artifact.artifacts.occurrence_link_check_report)} | yes |`,
    `| route link check | ${mdCell(artifact.artifacts.route_link_check_report)} | yes |`,
    `| audit-only review | ${mdCell(artifact.artifacts.audit_only_review_report)} | yes |`,
    `| cluster index | ${mdCell(artifact.artifacts.cluster_index_report)} | yes |`,
    `| route coverage | ${mdCell(artifact.artifacts.route_coverage_report)} | yes |`,
    `| sample index | ${mdCell(artifact.artifacts.sample_index_report)} | yes |`,
    `| lookup index | ${mdCell(artifact.artifacts.lookup_index_report)} | yes |`,
    `| selected slice | ${mdCell(artifact.artifacts.selected_slice_report)} | yes |`,
    `| selected slices index | ${mdCell(artifact.artifacts.selected_slices_index_report)} | yes |`,
    `| smoke validation | ${mdCell(artifact.artifacts.smoke_validation_report)} | yes |`,
    '',
    '## Commands',
    '',
    '| command | value |',
    '|---|---|',
    ...Object.entries(artifact.commands || {}).map(([key, value]) => `| ${mdCell(key)} | ${mdCell(value)} |`),
    '',
    '## Boundary',
    '',
    'This handoff is for usage navigation and concordance only. It preserves observed usage, route links, validation state, and audit-only ambiguous rows without ranking routes, selecting visible answers, or making meaning claims.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--occurrence-link-check=')) parsed.occurrenceLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-link-check=')) parsed.routeLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--audit-review=')) parsed.auditReview = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--cluster-index=')) parsed.clusterIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-coverage=')) parsed.routeCoverage = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--sample-index=')) parsed.sampleIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--lookup-index=')) parsed.lookupIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-slice=')) parsed.selectedSlice = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-slices-index=')) parsed.selectedSlicesIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--smoke-validation=')) parsed.smokeValidation = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--no-smoke-validation') {
      parsed.smokeValidation = null;
      parsed.skipSmokeValidation = true;
    }
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function buildCommands(options, manifest) {
  const concordancePath = manifest.outputs?.concordance_json?.path || 'data/workbench-evidence/usage-concordance.json';
  const commands = { ...(manifest.commands || {}) };
  commands.build_cluster_index = `node scripts/build_workbench_usage_cluster_index.mjs --concordance=${concordancePath} --output=${options.clusterIndex} --report=reports/workbench-usage-cluster-index.md --max-samples=8`;
  commands.validate_cluster_index = `node scripts/validate_workbench_usage_cluster_index.mjs ${options.clusterIndex}`;
  commands.build_route_coverage = `node scripts/build_workbench_usage_route_coverage.mjs --concordance=${concordancePath} --output=${options.routeCoverage} --report=reports/workbench-usage-route-coverage.md --max-samples=8`;
  commands.validate_route_coverage = `node scripts/validate_workbench_usage_route_coverage.mjs ${options.routeCoverage}`;
  commands.build_sample_index = `node scripts/build_workbench_usage_sample_index.mjs --concordance=${concordancePath} --output=${options.sampleIndex} --report=reports/workbench-usage-sample-index.md --max-samples-per-status=5`;
  commands.validate_sample_index = `node scripts/validate_workbench_usage_sample_index.mjs ${options.sampleIndex}`;
  commands.build_lookup_index = `node scripts/build_workbench_usage_lookup_index.mjs --concordance=${concordancePath} --output=${options.lookupIndex} --report=reports/workbench-usage-lookup-index.md --max-works=25`;
  commands.validate_lookup_index = `node scripts/validate_workbench_usage_lookup_index.mjs ${options.lookupIndex}`;
  commands.build_selected_slice = `node scripts/build_workbench_usage_slice_index.mjs --concordance=${concordancePath} --work-prefix=tanakh/ --slice-id=tanakh-workbench-section --label="Tanakh workbench section" --output=${options.selectedSlice} --report=reports/workbench-usage-slice-tanakh.md --max-samples=30`;
  commands.validate_selected_slice = `node scripts/validate_workbench_usage_slice_index.mjs ${options.selectedSlice}`;
  commands.build_selected_slice_jeremiah = `node scripts/build_workbench_usage_slice_index.mjs --concordance=${concordancePath} --source-ref-prefix=Jeremiah --slice-id=jeremiah-workbench-section --label="Jeremiah workbench section" --output=${path.posix.dirname(options.selectedSlice)}/usage-slice-jeremiah.json --report=reports/workbench-usage-slice-jeremiah.md --max-samples=30`;
  commands.validate_selected_slice_jeremiah = `node scripts/validate_workbench_usage_slice_index.mjs ${path.posix.dirname(options.selectedSlice)}/usage-slice-jeremiah.json`;
  commands.build_selected_slices_index = `node scripts/build_workbench_usage_selected_slices_index.mjs --slices-dir=${path.posix.dirname(options.selectedSlice)} --output=${options.selectedSlicesIndex} --report=reports/workbench-usage-selected-slices-index.md`;
  commands.validate_selected_slices_index = `node scripts/validate_workbench_usage_selected_slices_index.mjs ${options.selectedSlicesIndex}`;
  commands.build_handoff_index = [
    'node scripts/build_workbench_usage_handoff_index.mjs',
    `--manifest=${options.manifest}`,
    `--occurrence-link-check=${options.occurrenceLinkCheck}`,
    `--route-link-check=${options.routeLinkCheck}`,
    `--audit-review=${options.auditReview}`,
    `--cluster-index=${options.clusterIndex}`,
    `--route-coverage=${options.routeCoverage}`,
    `--sample-index=${options.sampleIndex}`,
    `--lookup-index=${options.lookupIndex}`,
    `--selected-slice=${options.selectedSlice}`,
    `--selected-slices-index=${options.selectedSlicesIndex}`,
    options.smokeValidation ? `--smoke-validation=${options.smokeValidation}` : '--no-smoke-validation',
    `--output=${options.output}`,
    `--report=${options.report}`,
  ].join(' ');
  commands.validate_handoff_index = `node scripts/validate_workbench_usage_handoff_index.mjs ${options.output}`;
  return commands;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
