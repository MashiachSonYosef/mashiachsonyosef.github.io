#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = 'reports/usage-navigation-boundary-summary-validation.md';
const jsonPath = 'reports/usage-navigation-boundary-summary-validation.json';

const artifacts = [
  {
    id: 'source_diversity',
    path: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
    required: {
      selected_occurrence_refs: 49,
      reader_facing_rows: 0,
      route_payload_field_hits: 0,
      missing_signature_independence_rows: 0,
    },
  },
  {
    id: 'provenance_matrix',
    path: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
    required: {
      selected_rows: 49,
      rows_with_license_metadata: 49,
      rows_with_version_metadata: 49,
      missing_or_unrecognized_license_rows: 0,
      reader_facing_rows: 0,
      route_payload_field_hits: 0,
    },
  },
  {
    id: 'route_provenance',
    path: '.local-cache/workbench-evidence/usage-selected-route-provenance-audit.json',
    required: {
      selected_route_links: 49,
      unresolved_route_rows: 0,
      missing_provenance_rows: 0,
      route_payload_copied_rows: 0,
      sample_occurrences: 49,
      reader_facing_rows: 0,
      route_payload_field_hits: 0,
    },
  },
  {
    id: 'collision_audit',
    path: '.local-cache/workbench-evidence/usage-selected-collision-audit.json',
    required: {
      collision_buckets: 16,
      collision_occurrence_rows: 38,
      cross_frame_collision_buckets: 4,
      cross_frame_collision_rows: 14,
      sample_occurrences: 38,
      reader_facing_rows: 0,
      route_payload_field_hits: 0,
    },
    expected_warning: 'cross-frame collisions remain visible for QA',
  },
  {
    id: 'occurrence_navigation',
    path: '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json',
    required: {
      rows: 49,
      rows_with_source_link: 49,
      rows_with_work_anchor: 49,
      rows_with_hebrew_context: 49,
      rows_with_focus_marker: 49,
      rows_with_provenance: 49,
      observed_usage_only_rows: 49,
      reader_facing_rows: 0,
      route_payload_field_hits: 0,
    },
  },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeFile(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '/');
}

function flattenCounts(counts = {}) {
  const flat = {};
  for (const [key, value] of Object.entries(counts)) {
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      flat[key] = value;
    }
  }
  return flat;
}

function validationRows() {
  const rows = [];
  for (const item of artifacts) {
    const fullPath = path.join(root, item.path);
    if (!fs.existsSync(fullPath)) {
      rows.push({
        id: item.id,
        path: item.path,
        present: false,
        artifact_type: '',
        quality: '',
        counts: {},
        issues: [`missing artifact: ${item.path}`],
        warnings: [],
      });
      continue;
    }
    const artifact = readJson(item.path);
    const counts = flattenCounts(artifact.counts || {});
    const issues = [];
    const warnings = [];
    for (const [field, expected] of Object.entries(item.required)) {
      if (counts[field] !== expected) {
        issues.push(`${field}=${counts[field]} expected ${expected}`);
      }
    }
    if (String(artifact.policy || artifact.authority_policy || '').match(/translate|definition|authority/i) == null) {
      warnings.push('policy text does not mention translation/definition/authority boundary');
    }
    if (item.expected_warning) warnings.push(item.expected_warning);
    rows.push({
      id: item.id,
      path: item.path,
      present: true,
      artifact_type: artifact.artifact_type || '',
      quality: artifact.quality || '',
      counts,
      issues,
      warnings,
    });
  }
  return rows;
}

function validate() {
  const rows = validationRows();
  const issues = rows.flatMap((row) => row.issues.map((issue) => `${row.id}: ${issue}`));
  const warnings = rows.flatMap((row) => row.warnings.map((warning) => `${row.id}: ${warning}`));
  const qaPackage = fs.existsSync(path.join(root, 'reports/workbench-usage-selected-qa-package.md'))
    ? fs.readFileSync(path.join(root, 'reports/workbench-usage-selected-qa-package.md'), 'utf8')
    : '';
  if (!qaPackage.includes('package_failed_checks_zero')) {
    issues.push('qa package missing package_failed_checks_zero check');
  }
  if (!qaPackage.includes('| route_payload_absent | passed |')) {
    issues.push('qa package missing passed route_payload_absent check');
  }
  if (!qaPackage.includes('| reader_facing_zero | passed |')) {
    issues.push('qa package missing passed reader_facing_zero check');
  }

  const occurrence = rows.find((row) => row.id === 'occurrence_navigation')?.counts || {};
  const routeProvenance = rows.find((row) => row.id === 'route_provenance')?.counts || {};
  const provenance = rows.find((row) => row.id === 'provenance_matrix')?.counts || {};
  const collision = rows.find((row) => row.id === 'collision_audit')?.counts || {};

  const result = {
    generated_at: new Date().toISOString(),
    artifact_type: 'usage_navigation_boundary_summary_validation',
    verdict: issues.length ? 'fail' : (warnings.length ? 'pass_with_warnings' : 'pass'),
    counts: {
      selected_rows: occurrence.rows || provenance.selected_rows || routeProvenance.selected_route_links || 0,
      observed_usage_only_rows: occurrence.observed_usage_only_rows || 0,
      reader_facing_rows: Math.max(...rows.map((row) => Number(row.counts.reader_facing_rows || 0))),
      route_payload_field_hits: Math.max(...rows.map((row) => Number(row.counts.route_payload_field_hits || 0))),
      unresolved_route_rows: routeProvenance.unresolved_route_rows || 0,
      route_payload_copied_rows: routeProvenance.route_payload_copied_rows || 0,
      rows_with_license_metadata: provenance.rows_with_license_metadata || 0,
      missing_or_unrecognized_license_rows: provenance.missing_or_unrecognized_license_rows || 0,
      collision_buckets: collision.collision_buckets || 0,
      cross_frame_collision_rows: collision.cross_frame_collision_rows || 0,
    },
    issues,
    warnings,
    rows,
  };
  const markdown = [
    '# Usage Navigation Boundary Summary Validation',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Verdict: ${result.verdict}`,
    '',
    '## Summary',
    '',
    `- Selected rows: ${result.counts.selected_rows}`,
    `- Observed-usage-only rows: ${result.counts.observed_usage_only_rows}`,
    `- Reader-facing rows: ${result.counts.reader_facing_rows}`,
    `- Route payload field hits: ${result.counts.route_payload_field_hits}`,
    `- Unresolved route rows: ${result.counts.unresolved_route_rows}`,
    `- Route payload copied rows: ${result.counts.route_payload_copied_rows}`,
    `- Rows with license metadata: ${result.counts.rows_with_license_metadata}`,
    `- Missing or unrecognized license rows: ${result.counts.missing_or_unrecognized_license_rows}`,
    `- Collision buckets: ${result.counts.collision_buckets}`,
    `- Cross-frame collision rows: ${result.counts.cross_frame_collision_rows}`,
    '',
    '## Artifacts',
    '',
    '| id | artifact | quality | issues | warnings |',
    '|---|---|---|---|---|',
    ...rows.map((row) => `| ${mdCell(row.id)} | ${mdCell(row.path)} | ${mdCell(row.quality || 'n/a')} | ${mdCell(row.issues.join('; ') || 'none')} | ${mdCell(row.warnings.join('; ') || 'none')} |`),
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${mdCell(issue)}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((warning) => `- ${mdCell(warning)}`) : ['- none']),
    '',
    '## Boundary',
    '',
    '- This validates existing Agent 3 selected-usage artifacts only; it does not expand the usage corpus.',
    '- Usage navigation remains evidence/navigation only, not definition authority, not accepted translation text, and not publication support.',
    '- Cross-frame collisions remain visible as QA warnings instead of being hidden.',
    '- Publication remains blocked_no_render.',
    '',
  ].join('\n');
  writeFile(reportPath, `${markdown}\n`);
  writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const result = validate();
if (result.issues.length) {
  console.error(`Usage navigation boundary summary validation failed with ${result.issues.length} issue(s). Report: ${reportPath}`);
  process.exit(1);
}
console.log(`Usage navigation boundary summary validation ${result.verdict}: ${reportPath}`);
