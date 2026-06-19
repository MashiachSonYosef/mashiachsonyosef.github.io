#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const expectedRuntimeVersion = 'visible-na-3916cf24';
const versionedRuntime = `reader-workbench.js?v=${expectedRuntimeVersion}`;

const checks = [
  {
    path: 'scripts/render_site.ps1',
    must_include: [versionedRuntime, 'reader_layout_mode = "prehud_rows"'],
    must_not_include: ['<script src=""$($rootHref)assets/js/reader-workbench.js""></script>'],
  },
  {
    path: 'scripts/build_daniel_reader_pipeline_page.mjs',
    must_include: [versionedRuntime, 'fail-closed to N/A'],
    must_not_include: [
      '<script src="../../assets/js/reader-workbench.js"></script>',
      'fail-closed to TBD',
      'remain fail-closed to TBD',
    ],
  },
  {
    path: 'scripts/build_daniel_1_1_orot_hud_poc.mjs',
    must_include: [versionedRuntime, 'quiet N/A'],
    must_not_include: [
      '<script src="../../assets/js/reader-workbench.js" defer></script>',
      'quiet TBD',
    ],
  },
  {
    path: 'scripts/validate_daniel_1_1_orot_hud_poc.mjs',
    must_include: [versionedRuntime],
    must_not_include: ['<script src="../../assets/js/reader-workbench.js" defer></script>'],
  },
  {
    path: 'scripts/validate_hebrew_workbench_public_surface.mjs',
    must_include: ['unresolved rows must remain N/A'],
    must_not_include: [
      'unresolved rows must remain TBD',
      'TBD until validated',
    ],
  },
];

const errors = [];
for (const check of checks) {
  const file = path.join(root, check.path);
  let text = '';
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (error) {
    errors.push(`${check.path}: read failed: ${error.message}`);
    continue;
  }
  for (const needle of check.must_include || []) {
    if (!text.includes(needle)) errors.push(`${check.path}: missing ${JSON.stringify(needle)}`);
  }
  for (const needle of check.must_not_include || []) {
    if (text.includes(needle)) errors.push(`${check.path}: stale ${JSON.stringify(needle)}`);
  }
}

const output = {
  ok: errors.length === 0,
  expected_runtime_version: expectedRuntimeVersion,
  checked_files: checks.map((check) => check.path),
  errors,
};

console.log(JSON.stringify(output, null, 2));
if (!output.ok) process.exit(1);
