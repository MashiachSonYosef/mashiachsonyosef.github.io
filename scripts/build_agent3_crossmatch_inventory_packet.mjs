#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent3-crossmatch-inventory-packet-2026-06-05.json';
const outputReport = 'reports/agent3-crossmatch-inventory-packet-2026-06-05.md';
const excludedPaths = new Set([
  outputJson,
  outputReport,
  'scripts/build_agent3_crossmatch_inventory_packet.mjs',
  'scripts/validate_agent3_crossmatch_inventory_packet.mjs',
]);

const artifact = buildArtifact();
writeJson(outputJson, artifact);
writeText(outputReport, renderReport(artifact));

console.log(
  `Agent 3 crossmatch inventory packet ${artifact.blocker.status}; ` +
  `files ${artifact.counts.files_in_inventory}; dirty ${artifact.counts.dirty_or_uncommitted_files}; ` +
  `authority hits ${artifact.counts.forbidden_truthy_authority_claims}`
);

function buildArtifact() {
  const targetFiles = collectTargetFiles();
  const gitState = collectGitState(targetFiles.map((file) => file.path));
  const inspectedFiles = targetFiles.map((file) => enrichFile(file, gitState));
  const counts = buildCounts(inspectedFiles);
  const dirtyFiles = inspectedFiles.filter((file) => file.package_state !== 'committed_clean_inventory_observed');
  const blocker = dirtyFiles.length > 0
    ? {
        status: 'exact_blocker',
        blocker_id: 'crossmatch_inventory_contains_dirty_or_uncommitted_artifacts',
        blocker_detail: `${dirtyFiles.length} crossmatch/usage files are staged, modified, or untracked; treat them as inventory only until a bounded subset is validated and committed.`,
        blocked_file_count: dirtyFiles.length,
      }
    : {
        status: 'none',
        blocker_id: null,
        blocker_detail: 'No dirty or uncommitted files found in the scoped crossmatch/usage inventory.',
        blocked_file_count: 0,
      };

  return {
    schema_version: 1,
    artifact_type: 'agent3_crossmatch_inventory_packet',
    generated_at: new Date().toISOString(),
    agent: 'Agent 3',
    lane: 'crossmatch_usage_navigation_inventory',
    worker_state: 'evidence-ready',
    qa_acceptance_state: 'not_agent6_accepted',
    package_owner: 'Agent 3',
    downstream_handoff_owner: 'Agent 10 for release/package intake; Agent 6 only through explicit boundary packet',
    authority_boundary: {
      usage_navigation_only: true,
      occurrence_navigation_only: true,
      route_ids_only: true,
      definition_authority: false,
      semantic_arbitration: false,
      route_ranking: false,
      visible_answer_selection: false,
      source_license_acceptance: false,
      qa_acceptance: false,
      publication_support: false,
      accepted_translation_text: false,
    },
    inventory_scope: {
      roots: ['data/definitions', 'reports', 'scripts'],
      included_families: [
        'definition-workbench-usage',
        'agent3-definition-workbench-usage',
        'workbench-usage-crossmatch',
        'workbench-usage-concordance',
      ],
      excluded_paths: [...excludedPaths],
      broad_discovery: false,
      route_publication_support: false,
    },
    reused_evidence: [
      'reports/agent3-state.md',
      'data/definitions/definition-workbench-usage-consumer-manifest.json',
      'data/definitions/definition-workbench-usage-queue-ready-packet.json',
      'data/definitions/definition-workbench-usage-route-pointer-audit.json',
      'reports/definition-workbench-usage-consumer-manifest.md',
      'reports/definition-workbench-usage-queue-ready-packet.md',
      'reports/definition-workbench-usage-route-pointer-audit.md',
    ],
    counts,
    blocker,
    inventory_files: inspectedFiles,
    next_step: dirtyFiles.length > 0
      ? 'Select one bounded dirty/uncommitted subset, run its named builder and validator, then commit only that subset before treating it as package evidence.'
      : 'Use this inventory as the next clean crossmatch navigation baseline.',
    stop_condition: 'Stop after this inventory packet records current file/linkage status and exact blocker state; do not broaden corpus, rank routes, or publish rows.',
  };
}

function collectTargetFiles() {
  const specs = [
    {
      rootDir: 'data/definitions',
      kind: 'data_artifact',
      include: (name) => (
        (name.startsWith('definition-workbench-usage-') || name.startsWith('agent3-definition-workbench-usage-'))
        && name.endsWith('.json')
      ),
    },
    {
      rootDir: 'reports',
      kind: 'report_artifact',
      include: (name) => (
        (name.startsWith('definition-workbench-usage-') || name.startsWith('agent3-definition-workbench-usage-'))
        && (name.endsWith('.json') || name.endsWith('.md'))
      ),
    },
    {
      rootDir: 'scripts',
      kind: 'pipeline_script',
      include: (name) => (
        (name.includes('definition_workbench_usage') || name.includes('workbench_usage_crossmatch') || name.includes('workbench_usage_concordance') || name.includes('agent3_crossmatch_inventory_packet'))
        && name.endsWith('.mjs')
        && !name.startsWith('validate_agent2_')
        && !name.startsWith('build_agent2_')
      ),
    },
  ];

  const files = [];
  for (const spec of specs) {
    const fullDir = path.join(root, spec.rootDir);
    if (!fs.existsSync(fullDir)) continue;
    for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
      if (!entry.isFile() || !spec.include(entry.name)) continue;
      const relativePath = `${spec.rootDir}/${entry.name}`;
      if (excludedPaths.has(relativePath)) continue;
      files.push({
        path: relativePath,
        kind: spec.kind,
        owner_hint: ownerHint(entry.name),
        size_bytes: fs.statSync(path.join(root, relativePath)).size,
      });
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function collectGitState(targetPaths) {
  const headTracked = new Set(gitLines(['ls-tree', '-r', '--name-only', 'HEAD', '--', 'data/definitions', 'reports', 'scripts']));
  const indexTracked = new Set(gitLines(['ls-files', '--', 'data/definitions', 'reports', 'scripts']));
  const cachedDiff = parseNameStatus(gitText(['diff', '--cached', '--name-status', '--', ...targetPaths]));
  const worktreeDiff = parseNameStatus(gitText(['diff', '--name-status', '--', ...targetPaths]));

  return { headTracked, indexTracked, cachedDiff, worktreeDiff };
}

function enrichFile(file, gitState) {
  const fullPath = path.join(root, file.path);
  const text = fs.readFileSync(fullPath, 'utf8');
  const statuses = [];
  const cachedStatus = gitState.cachedDiff.get(file.path);
  const worktreeStatus = gitState.worktreeDiff.get(file.path);
  const headTracked = gitState.headTracked.has(file.path);
  const indexTracked = gitState.indexTracked.has(file.path);

  if (!indexTracked) statuses.push('untracked');
  else if (!headTracked) statuses.push(cachedStatus ? `staged_${statusName(cachedStatus)}` : 'index_added');
  else if (cachedStatus) statuses.push(`staged_${statusName(cachedStatus)}`);

  if (worktreeStatus) statuses.push(`worktree_${statusName(worktreeStatus)}`);
  if (statuses.length === 0 && headTracked) statuses.push('committed_clean');

  const jsonSummary = file.path.endsWith('.json') ? summarizeJson(file.path, text) : null;
  const authorityHits = jsonSummary?.authority_hits || {
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
    forbidden_truthy_authority_claims: 0,
  };

  return {
    ...file,
    git_statuses: statuses,
    package_state: statuses.length === 1 && statuses[0] === 'committed_clean'
      ? 'committed_clean_inventory_observed'
      : 'dirty_or_uncommitted_exact_blocker',
    artifact_type: jsonSummary?.artifact_type || null,
    top_level_array_counts: jsonSummary?.top_level_array_counts || [],
    selected_counts: jsonSummary?.selected_counts || {},
    authority_hits: authorityHits,
  };
}

function summarizeJson(relativePath, text) {
  let data;
  try {
    data = JSON.parse(stripJsonBom(text));
  } catch (error) {
    return {
      artifact_type: null,
      parse_error: error.message,
      top_level_array_counts: [],
      selected_counts: {},
      authority_hits: {
        reader_facing_rows: 0,
        route_payload_field_hits: 0,
        forbidden_authority_field_hits: 1,
        forbidden_truthy_authority_claims: 1,
      },
    };
  }

  const topLevelArrayCounts = Object.entries(data)
    .filter(([key, value]) => Array.isArray(value) && /(rows|links|buckets|items|files|artifacts|validators|entries|occurrences)/i.test(key))
    .map(([key, value]) => ({ key, count: value.length }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, 8);

  const counts = isPlainObject(data.counts) ? data.counts : {};
  const selectedCounts = {};
  for (const key of [
    'rows',
    'occurrence_rows',
    'occurrence_link_rows',
    'navigation_rows',
    'support_rows',
    'selected_support_rows',
    'neighbor_link_rows',
    'route_ids',
    'source_refs',
    'works',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ]) {
    if (Number.isFinite(Number(counts[key]))) selectedCounts[key] = Number(counts[key]);
  }

  return {
    artifact_type: data.artifact_type || null,
    top_level_array_counts: topLevelArrayCounts,
    selected_counts: selectedCounts,
    authority_hits: {
      reader_facing_rows: sumNumericKey(data, 'reader_facing_rows'),
      route_payload_field_hits: sumNumericKey(data, 'route_payload_field_hits'),
      forbidden_authority_field_hits: sumNumericKey(data, 'forbidden_authority_field_hits'),
      forbidden_truthy_authority_claims: collectTruthyAuthorityClaims(data, relativePath).length,
    },
  };
}

function buildCounts(files) {
  const byKind = countBy(files, (file) => file.kind);
  const byOwner = countBy(files, (file) => file.owner_hint);
  const byPackageState = countBy(files, (file) => file.package_state);
  const byArtifactType = countBy(files.filter((file) => file.artifact_type), (file) => file.artifact_type);
  const byGitStatus = {};
  for (const file of files) {
    for (const status of file.git_statuses) byGitStatus[status] = (byGitStatus[status] || 0) + 1;
  }

  return {
    files_in_inventory: files.length,
    data_artifacts: byKind.data_artifact || 0,
    report_artifacts: byKind.report_artifact || 0,
    pipeline_scripts: byKind.pipeline_script || 0,
    agent3_owned_files: byOwner.agent3 || 0,
    shared_definition_workbench_usage_files: byOwner.shared_definition_workbench_usage || 0,
    committed_clean_files: byPackageState.committed_clean_inventory_observed || 0,
    dirty_or_uncommitted_files: byPackageState.dirty_or_uncommitted_exact_blocker || 0,
    staged_added_files: byGitStatus.staged_added || 0,
    staged_modified_files: byGitStatus.staged_modified || 0,
    worktree_modified_files: byGitStatus.worktree_modified || 0,
    untracked_files: byGitStatus.untracked || 0,
    reader_facing_rows: sum(files.map((file) => file.authority_hits.reader_facing_rows)),
    route_payload_field_hits: sum(files.map((file) => file.authority_hits.route_payload_field_hits)),
    forbidden_authority_field_hits: sum(files.map((file) => file.authority_hits.forbidden_authority_field_hits)),
    forbidden_truthy_authority_claims: sum(files.map((file) => file.authority_hits.forbidden_truthy_authority_claims)),
    git_status_counts: byGitStatus,
    kind_counts: byKind,
    owner_counts: byOwner,
    artifact_type_counts: byArtifactType,
  };
}

function renderReport(data) {
  const dirtyRows = data.inventory_files
    .filter((file) => file.package_state !== 'committed_clean_inventory_observed')
    .slice(0, 40)
    .map((file) => `| ${mdCell(file.path)} | ${mdCell(file.kind)} | ${mdCell(file.git_statuses.join(', '))} | ${mdCell(file.artifact_type || '')} |`);

  const artifactRows = Object.entries(data.counts.artifact_type_counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 30)
    .map(([type, count]) => `| ${mdCell(type)} | ${count} |`);

  return [
    '# Agent 3 Crossmatch Inventory Packet',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Lane: crossmatch/usage navigation inventory.',
    '- This packet records observed file/linkage state only.',
    '- No definition authority, route ranking, visible answer selection, source/license acceptance, QA acceptance, publication support, accepted gloss, or accepted text is claimed.',
    '',
    '## Counts',
    '',
    `- Files inspected: ${data.counts.files_in_inventory}`,
    `- Data/report/script files: ${data.counts.data_artifacts}/${data.counts.report_artifacts}/${data.counts.pipeline_scripts}`,
    `- Committed-clean / dirty-or-uncommitted files: ${data.counts.committed_clean_files}/${data.counts.dirty_or_uncommitted_files}`,
    `- Staged added / staged modified / worktree modified / untracked: ${data.counts.staged_added_files}/${data.counts.staged_modified_files}/${data.counts.worktree_modified_files}/${data.counts.untracked_files}`,
    `- Reader-facing / route-payload / forbidden-authority / truthy-authority hits: ${data.counts.reader_facing_rows}/${data.counts.route_payload_field_hits}/${data.counts.forbidden_authority_field_hits}/${data.counts.forbidden_truthy_authority_claims}`,
    '',
    '## Blocker',
    '',
    `- Status: ${data.blocker.status}`,
    `- Blocker: ${data.blocker.blocker_id || 'none'}`,
    `- Detail: ${data.blocker.blocker_detail}`,
    '',
    '## Dirty Or Uncommitted Sample',
    '',
    dirtyRows.length
      ? '| path | kind | git statuses | artifact type |\n| --- | --- | --- | --- |\n' + dirtyRows.join('\n')
      : 'No dirty or uncommitted files in the scoped inventory.',
    '',
    '## Artifact Types',
    '',
    artifactRows.length
      ? '| artifact type | files |\n| --- | ---: |\n' + artifactRows.join('\n')
      : 'No JSON artifact types found.',
    '',
    '## Stop Condition',
    '',
    data.stop_condition,
    '',
    '## Next Step',
    '',
    data.next_step,
    '',
  ].join('\n');
}

function ownerHint(name) {
  if (name.startsWith('agent3') || name.includes('agent3_')) return 'agent3';
  if (name.startsWith('definition-workbench-usage-') || name.includes('definition_workbench_usage')) return 'shared_definition_workbench_usage';
  if (name.includes('workbench_usage_')) return 'shared_workbench_usage_pipeline';
  return 'unknown';
}

function statusName(status) {
  if (status.startsWith('A')) return 'added';
  if (status.startsWith('M')) return 'modified';
  if (status.startsWith('D')) return 'deleted';
  if (status.startsWith('R')) return 'renamed';
  if (status.startsWith('C')) return 'copied';
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function parseNameStatus(text) {
  const out = new Map();
  for (const line of text.split(/\r?\n/).filter(Boolean)) {
    const parts = line.split(/\t+/);
    const status = parts[0] || '';
    const filePath = normalizePath(parts[parts.length - 1] || '');
    if (filePath) out.set(filePath, status);
  }
  return out;
}

function gitText(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
  } catch {
    return '';
  }
}

function gitLines(args) {
  return gitText(args)
    .split(/\r?\n/)
    .map(normalizePath)
    .filter(Boolean);
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function sumNumericKey(value, targetKey) {
  let total = 0;
  visit(value, (key, item) => {
    if (key === targetKey && Number.isFinite(Number(item))) total += Number(item);
  });
  return total;
}

function collectTruthyAuthorityClaims(value) {
  const hits = [];
  visit(value, (key, item, trail) => {
    if (!isAuthorityGrantKey(key)) return;
    if (item === true || (typeof item === 'number' && item > 0)) {
      hits.push({ path: [...trail, key].join('.'), value: item });
    }
  });
  return hits;
}

function isAuthorityGrantKey(key) {
  const normalized = String(key || '').toLowerCase();
  if (
    normalized.startsWith('not_')
    || normalized.includes('_not_')
    || normalized.includes('forbidden')
    || normalized.includes('blocked')
    || normalized.includes('blocker')
    || normalized.includes('disallowed')
    || normalized.includes('denied')
    || normalized.includes('audit_only')
  ) {
    return false;
  }

  const grantTerms = [
    'definition_authority',
    'usage_as_definition_authority',
    'answer_authority',
    'visible_answer_authority',
    'visible_answer_selection',
    'final_ranking_authority',
    'route_ranking',
    'semantic_arbitration',
    'qa_acceptance',
    'agent6_accepted',
    'source_license_acceptance',
    'publication_support',
    'accepted_translation_text',
    'accepted_gloss',
    'accepted_text',
  ];

  return grantTerms.some((term) => (
    normalized === term
    || normalized.endsWith(`_${term}`)
    || normalized === `${term}_allowed`
    || normalized.endsWith(`_${term}_allowed`)
    || normalized === `${term}_allowed_rows`
    || normalized.endsWith(`_${term}_allowed_rows`)
  ));
}

function visit(value, callback, trail = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, callback, [...trail, String(index)]));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, item] of Object.entries(value)) {
    callback(key, item, trail);
    if (isPlainObject(item) || Array.isArray(item)) visit(item, callback, [...trail, key]);
  }
}

function countBy(values, keyFn) {
  const out = {};
  for (const value of values) {
    const key = keyFn(value) || 'missing';
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
