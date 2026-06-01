#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const defaultReportPath = 'reports/untracked-source-scope-audit.md';
const defaultJsonPath = 'reports/untracked-source-scope-audit.json';

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeText(relativePath, text) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, text, 'utf8');
}

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedObject(map) {
  return Object.fromEntries([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function renderedSourceLicenseEvidence(pagePath) {
  if (!pagePath || !fs.existsSync(path.join(root, pagePath))) {
    return {
      page_visible_source_license_rows: false,
      page_source_license_evidence: '',
    };
  }

  const html = fs.readFileSync(path.join(root, pagePath), 'utf8');
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const hasLicenseValue = /(Public Domain|CC-BY|CC BY|CC0|CC BY-SA|GFDL)/i.test(plain);
  const hasSourceHeader = /(Hebrew version|Hebrew Version|Version source|Version Source|Digitization|Source Notes)/i.test(plain);
  const listEvidence = html.match(/<li>Hebrew version:[\s\S]*?<\/li>/i);
  const tableEvidence = html.match(/<h2>Source Notes<\/h2>[\s\S]{0,2500}?<\/table>/i);
  const source = listEvidence ? listEvidence[0] : (tableEvidence ? tableEvidence[0] : '');

  return {
    page_visible_source_license_rows: hasLicenseValue && hasSourceHeader,
    page_source_license_evidence: source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500),
  };
}

function untrackedSourceFiles(existingJsonPath) {
  try {
    const stdout = execFileSync(
      'git',
      ['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'],
      {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    return {
      files: stdout.split(/\r?\n/).filter(Boolean).sort(),
      source_discovery_method: 'git-ls-files-others',
      source_discovery_warning: '',
    };
  } catch (error) {
    const fallbackJsonPath = fs.existsSync(path.join(root, existingJsonPath))
      ? existingJsonPath
      : defaultJsonPath;

    if (fs.existsSync(path.join(root, fallbackJsonPath))) {
      const previous = readJson(fallbackJsonPath);
      return {
        files: [...(previous.untracked_source_files || [])].sort(),
        source_discovery_method: 'existing-json-fallback',
        source_discovery_warning: `git child-process discovery failed (${error.code || error.message}); reused ${fallbackJsonPath} untracked_source_files as current prompted truth`,
      };
    }
    throw error;
  }
}

const reportPath = argValue('--report', defaultReportPath);
const jsonPath = argValue('--json', defaultJsonPath);
const sourceDiscovery = untrackedSourceFiles(jsonPath);
const files = sourceDiscovery.files;
const licenseCounts = new Map();
const rows = [];

for (const sourcePath of files) {
  const data = readJson(sourcePath);
  const workId = data.work_id || path.basename(sourcePath, '.json');
  const workSlug = data.work_slug || '';
  const units = Array.isArray(data.units) ? data.units : [];
  const rowLicenseCounts = new Map();

  for (const unit of units) {
    const license = String(unit.license || data.license || '(missing)').trim() || '(missing)';
    count(licenseCounts, license);
    count(rowLicenseCounts, license);
  }

  const overlayPath = `data/overlays/${workId}.json`;
  const pagePath = workSlug ? `${workSlug}/index.html` : '';
  const pageEvidence = renderedSourceLicenseEvidence(pagePath);

  rows.push({
    source_path: sourcePath,
    work_id: workId,
    work_slug: workSlug,
    units: units.length,
    license_counts: sortedObject(rowLicenseCounts),
    overlay_path: overlayPath,
    overlay_exists: fs.existsSync(path.join(root, overlayPath)),
    page_path: pagePath,
    page_exists: pagePath ? fs.existsSync(path.join(root, pagePath)) : false,
    ...pageEvidence,
    downstream_provenance_acceptance: 'quarantined_until_source_file_is_tracked_and_source_audit_passes',
  });
}

const artifact = {
  generated_at: new Date().toISOString(),
  artifact_type: 'untracked_source_scope_audit',
  source_scope_state: files.length === 0
    ? 'tracked_source_scope_complete'
    : 'blocked_for_source_provenance_acceptance_and_future_publication_path',
  current_public_workbench_state: files.length === 0
    ? 'clear'
    : 'warning_unless_rendered_public_page_lacks_visible_source_license_attribution_rows',
  untracked_source_files: files,
  untracked_source_file_count: files.length,
  untracked_source_license_counts: sortedObject(licenseCounts),
  source_discovery_method: sourceDiscovery.source_discovery_method,
  source_discovery_warning: sourceDiscovery.source_discovery_warning,
  rows,
};

const report = [
  '# Untracked Source Scope Audit',
  '',
  `Generated: ${artifact.generated_at}`,
  '',
  '## Verdict',
  '',
  `- Source/provenance acceptance: ${artifact.source_scope_state}`,
  `- Current public/workbench state: ${artifact.current_public_workbench_state}`,
  `- Untracked source files: ${artifact.untracked_source_file_count}`,
  `- Source discovery method: ${artifact.source_discovery_method}`,
  ...(artifact.source_discovery_warning ? [`- Source discovery warning: ${artifact.source_discovery_warning}`] : []),
  '',
  '## License Counts',
  '',
  ...Object.entries(artifact.untracked_source_license_counts).map(([license, total]) => `- ${license}: ${total}`),
  '',
  '## Files',
  '',
  '| Source file | Units | Licenses | Overlay | Public page | Visible source/license rows | Downstream provenance acceptance |',
  '| --- | ---: | --- | --- | --- | --- | --- |',
  ...rows.map((row) => {
    const licenses = Object.entries(row.license_counts)
      .map(([license, total]) => `${license}: ${total}`)
      .join(', ');
    return [
      mdCell(row.source_path),
      row.units,
      mdCell(licenses),
      row.overlay_exists ? mdCell(row.overlay_path) : '(missing)',
      row.page_exists ? mdCell(row.page_path) : '(missing)',
      row.page_visible_source_license_rows ? 'yes' : 'no',
      mdCell(row.downstream_provenance_acceptance),
    ].join(' | ');
  }).map((line) => `| ${line} |`),
  '',
  '## Acceptance Boundary',
  '',
  '- These files are outside the tracked source-license audit scope until they are tracked or explicitly quarantined.',
  '- Any future publication path remains blocked while source-dependent outputs rely on these files.',
  '- Current public/workbench display remains warning-level only if rendered pages keep visible, non-misleading source/license/attribution rows.',
  '',
].join('\n');

writeText(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(reportPath, report);

console.log(JSON.stringify({
  untracked_source_files: artifact.untracked_source_file_count,
  license_counts: artifact.untracked_source_license_counts,
  report: reportPath,
  json: jsonPath,
}, null, 2));
