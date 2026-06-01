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

function splitGitLines(stdout) {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/\\/g, '/'))
    .sort();
}

function gitLsFilesOthers() {
  const stdout = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return splitGitLines(stdout);
}

function gitStatusOthers() {
  const stdout = execFileSync(
    'git',
    ['status', '--short', '--', 'data/sources'],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('?? data/sources/') && line.endsWith('.json'))
    .map((line) => line.slice(3).replace(/\\/g, '/'))
    .sort();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function readUntrackedListFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  const files = splitGitLines(fs.readFileSync(fullPath, 'utf8'))
    .map((line) => line.replace(/^\?\?\s+/, ''))
    .filter((line) => line.startsWith('data/sources/') && line.endsWith('.json'));

  return {
    files: uniqueSorted(files),
    source_discovery_method: 'provided-untracked-list',
    source_discovery_warning: `git child-process discovery bypassed with provided live list: ${relativePath}`,
    source_discovery_authoritative: true,
    source_discovery_counts: {
      provided_untracked_list: files.length,
      union: files.length,
    },
  };
}

function untrackedSourceFiles(existingJsonPath) {
  const listPath = argValue('--untracked-list', '');
  if (listPath) {
    return readUntrackedListFile(listPath);
  }

  const discoveryErrors = [];
  let lsFiles = null;
  let statusFiles = null;

  try {
    lsFiles = gitLsFilesOthers();
  } catch (error) {
    discoveryErrors.push(`git ls-files failed (${error.code || error.message})`);
  }

  try {
    statusFiles = gitStatusOthers();
  } catch (error) {
    discoveryErrors.push(`git status failed (${error.code || error.message})`);
  }

  if (lsFiles && statusFiles) {
    const same = JSON.stringify(lsFiles) === JSON.stringify(statusFiles);
    const files = same ? lsFiles : uniqueSorted([...lsFiles, ...statusFiles]);
    return {
      files,
      source_discovery_method: same
        ? 'git-ls-files-others-with-status-crosscheck'
        : 'git-discovery-union-after-ls-files-status-mismatch',
      source_discovery_warning: same
        ? ''
        : `git ls-files reported ${lsFiles.length}; git status reported ${statusFiles.length}; using union ${files.length} and keeping publication path blocked`,
      source_discovery_authoritative: same,
      source_discovery_counts: {
        git_ls_files_others: lsFiles.length,
        git_status_short_others: statusFiles.length,
        union: files.length,
      },
    };
  }

  if (lsFiles || statusFiles) {
    const method = lsFiles ? 'git-ls-files-others-status-crosscheck-failed' : 'git-status-short-others-ls-files-failed';
    const files = lsFiles || statusFiles;
    return {
      files,
      source_discovery_method: method,
      source_discovery_warning: `${discoveryErrors.join('; ')}; using single successful git discovery path and keeping publication path blocked`,
      source_discovery_authoritative: false,
      source_discovery_counts: {
        git_ls_files_others: lsFiles ? lsFiles.length : null,
        git_status_short_others: statusFiles ? statusFiles.length : null,
        union: files.length,
      },
    };
  }

  const fallbackJsonPath = fs.existsSync(path.join(root, existingJsonPath))
    ? existingJsonPath
    : defaultJsonPath;

  if (fs.existsSync(path.join(root, fallbackJsonPath))) {
    const previous = readJson(fallbackJsonPath);
      return {
        files: [...(previous.untracked_source_files || [])].sort(),
      source_discovery_method: 'existing-json-stale-fallback-non-authoritative',
      source_discovery_warning: `${discoveryErrors.join('; ')}; reused ${fallbackJsonPath} only as stale fallback, not current truth`,
      source_discovery_authoritative: false,
      source_discovery_counts: {
        git_ls_files_others: null,
        git_status_short_others: null,
        stale_fallback_files: previous.untracked_source_file_count || (previous.untracked_source_files || []).length,
      },
      };
  }

  throw new Error(`Unable to discover untracked source files: ${discoveryErrors.join('; ')}`);
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
  source_scope_state: sourceDiscovery.source_discovery_authoritative === false
    ? 'blocked_for_source_provenance_acceptance_audit_discovery_not_authoritative'
    : files.length === 0
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
  source_discovery_authoritative: sourceDiscovery.source_discovery_authoritative !== false,
  source_discovery_counts: sourceDiscovery.source_discovery_counts || {},
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
