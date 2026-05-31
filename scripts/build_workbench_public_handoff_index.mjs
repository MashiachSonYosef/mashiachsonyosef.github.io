#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const defaults = {
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  handoffRoot: '.local-cache/workbench-evidence/handoff',
  sourceFreshness: '.local-cache/workbench-evidence/source-freshness.json',
  output: 'data/workbench-evidence/public-handoff-index.json',
  report: 'reports/workbench-public-handoff-index.md',
  maxIssuesPerManifest: 12,
};

const options = parseArgs(process.argv.slice(2));
const queue = readJson(options.targetQueue);
if (queue.artifact_type !== 'workbench_target_queue') {
  throw new Error(`${options.targetQueue} is not a workbench target queue`);
}
const sourceFreshness = readSourceFreshness(options.sourceFreshness);

const targets = (Array.isArray(queue.targets) ? queue.targets : [])
  .filter((target) => isSelectedSmokeTarget(target));
const manifests = targets.map((target, index) => inspectManifest(target, index));
const aggregateSourceMetadata = summarizeSourceMetadata(manifests);
const aggregateClusterMetadata = summarizeClusterMetadata(manifests);
const integritySummary = summarizeFileIntegrity(manifests);
const totals = manifests.reduce((sum, row) => {
  sum.selected_targets += 1;
  if (row.validation.status === 'passed') sum.validation_passed += 1;
  else sum.validation_failed += 1;
  if (row.validation.status === 'missing_manifest') sum.missing_manifests += 1;
  for (const key of ['occurrence_markers', 'candidate_rows', 'clusters', 'blocked_rows']) {
    sum[key] += Number(row.counts?.[key] || 0);
  }
  for (const key of ['supported', 'candidate', 'weak', 'ambiguous', 'blocked']) {
    sum.status_counts[key] += Number(row.status_counts?.[key] || 0);
  }
  sum.reader_facing_eligible_rows += Number(row.reader_facing_eligible_rows || 0);
  sum.count_only_ambiguous_rows += Number(row.status_counts?.ambiguous || 0);
  if (row.validation.status === 'passed' && Number(row.reader_facing_eligible_rows || 0) === 0) sum.zero_useful_targets += 1;
  return sum;
}, {
  selected_targets: 0,
  validation_passed: 0,
  validation_failed: 0,
  missing_manifests: 0,
  occurrence_markers: 0,
  candidate_rows: 0,
  clusters: 0,
  blocked_rows: 0,
  reader_facing_eligible_rows: 0,
  count_only_ambiguous_rows: 0,
  zero_useful_targets: 0,
  status_counts: { supported: 0, candidate: 0, weak: 0, ambiguous: 0, blocked: 0 },
});

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_public_handoff_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_public_handoff_index.mjs',
  policy: 'Public index of selected workbench usage-evidence handoff packages. It is not a definition artifact and does not choose HUD winners. Ambiguous rows are counted for audit only and are not reader-facing eligible.',
  inputs: {
    target_queue: options.targetQueue,
    handoff_root: options.handoffRoot,
    source_freshness: sourceFreshness?.path || null,
    selected_target_filter: 'known-useful-or-seeded-smoke',
  },
  coverage_boundary: {
    selection_mode: 'known_useful_or_seeded_smoke_only',
    corpus_exhaustive: false,
    source_freshness: sourceFreshness?.summary || {
      status: 'unavailable',
      notes: `No source freshness report found at ${options.sourceFreshness}`,
    },
    notes: 'This index promotes selected validated handoff packages only. It is not a current-corpus exhaustive coverage claim while source imports continue.',
  },
  reader_facing_policy: {
    eligible_statuses: ['supported', 'candidate', 'weak'],
    count_only_statuses: ['ambiguous', 'blocked'],
    ambiguous_rows_reader_facing: false,
    status_semantics: {
      supported: 'Selected usage evidence with strong cluster/frame support; not final answer authority.',
      candidate: 'Selected usage evidence with moderate cluster/frame support; not final answer authority.',
      weak: 'Selected usage evidence with low cluster/frame support; reviewable but still eligible as usage evidence.',
      ambiguous: 'Observed usage row without enough support for reader-facing display; count-only audit state.',
      blocked: 'Unavailable or invalid handoff row; count-only audit state.',
    },
    notes: 'Downstream HUD/ranking may consume eligible statuses as usage evidence. Ambiguous rows remain audit-only unless a later validated frame seed changes their status.',
  },
  consumer_contract: {
    artifact_role: 'usage_evidence_index',
    evidence_model: 'graph_first_candidate_second',
    downstream_visible_statuses: ['supported', 'candidate', 'weak'],
    audit_only_statuses: ['ambiguous', 'blocked'],
    final_ranking_authority: false,
    visible_answer_authority: false,
    carries_text_rows: false,
    notes: 'Consumers can link to selected handoff manifests and counts. They must not treat this index as final ranking, source translation, or definition discovery output.',
  },
  handoff_payload_contract: buildHandoffPayloadContract(),
  quality_gates: buildQualityGates(totals, sourceFreshness),
  aggregate_source_metadata: aggregateSourceMetadata,
  aggregate_cluster_metadata: aggregateClusterMetadata,
  integrity_summary: integritySummary,
  counts: totals,
  manifests,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Public handoff index selected ${totals.selected_targets}; validation passed ${totals.validation_passed}; failed ${totals.validation_failed}; reader-facing eligible rows ${totals.reader_facing_eligible_rows}; ambiguous count-only rows ${totals.count_only_ambiguous_rows}`);
if (totals.validation_failed > 0) process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--handoff-root=')) parsed.handoffRoot = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-freshness=')) parsed.sourceFreshness = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-issues-per-manifest=')) parsed.maxIssuesPerManifest = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxIssuesPerManifest) || parsed.maxIssuesPerManifest < 1) {
    throw new Error('--max-issues-per-manifest must be a positive integer');
  }
  return parsed;
}

function inspectManifest(target, index) {
  const slug = String(target.slug || target.slug_override || '').trim();
  const manifestPath = `${options.handoffRoot}/${slug}/manifest.json`;
  const issues = [];
  if (!slug) issues.push('missing target slug');
  if (!fs.existsSync(path.join(root, manifestPath))) {
    return makeManifestRow(target, index, slug, manifestPath, null, {
      status: 'missing_manifest',
      issues: [`missing manifest ${manifestPath}`],
    });
  }

  const manifest = readJson(manifestPath);
  if (manifest.artifact_type !== 'workbench_usage_handoff_manifest') issues.push('invalid manifest artifact_type');
  if (manifest.focus?.token_key !== target.token_key) issues.push('manifest focus.token_key differs from target token_key');
  const occurrenceRows = readJsonl(manifest.paths?.occurrences_jsonl, issues, 'occurrences_jsonl');
  const candidateRows = readJsonl(manifest.paths?.candidates_jsonl, issues, 'candidates_jsonl');
  const clusters = readJsonIfExists(manifest.paths?.clusters_json, issues, 'clusters_json');
  const blockedRows = readJsonl(manifest.paths?.blocked_jsonl, issues, 'blocked_jsonl');

  const occurrenceIds = new Set(occurrenceRows.map((row) => row.occurrence_id).filter(Boolean));
  const statusCounts = { supported: 0, candidate: 0, weak: 0, ambiguous: 0, blocked: 0 };
  const licenseCounts = new Map();
  const workCounts = new Map();
  const clusterCounts = new Map();

  for (const row of candidateRows) {
    validateCandidateRow(row, occurrenceIds, issues);
    const status = statusCounts[row.candidate_status] === undefined ? 'ambiguous' : row.candidate_status;
    statusCounts[status] += 1;
    increment(licenseCounts, row.license || 'missing');
    increment(workCounts, row.work_id || 'missing');
    increment(clusterCounts, row.cluster_id || 'unclustered');
  }
  statusCounts.blocked += blockedRows.length;

  if (Number(manifest.counts?.occurrence_markers || 0) !== occurrenceRows.length) issues.push('manifest occurrence count mismatch');
  if (Number(manifest.counts?.candidate_rows || 0) !== candidateRows.length) issues.push('manifest candidate count mismatch');
  if (Number(manifest.counts?.blocked_rows || 0) !== blockedRows.length) issues.push('manifest blocked count mismatch');

  const clusterSummaries = summarizeClusters(clusters, clusterCounts);
  const validation = issues.length ? {
    status: 'failed',
    issues: issues.slice(0, options.maxIssuesPerManifest),
  } : {
    status: 'passed',
    issues: [],
  };

  return makeManifestRow(target, index, slug, manifestPath, manifest, validation, {
    statusCounts,
    licenseCounts,
    workCounts,
    clusterSummaries,
  });
}

function makeManifestRow(target, index, slug, manifestPath, manifest, validation, details = {}) {
  const statusCounts = details.statusCounts || { supported: 0, candidate: 0, weak: 0, ambiguous: 0, blocked: 0 };
  const readerFacingEligibleRows = statusCounts.supported + statusCounts.candidate + statusCounts.weak;
  return {
    index,
    slug,
    selection: {
      target_reason: target.target_reason || null,
      target_kind: target.target_kind || null,
      known_nonzero_support: target.known_nonzero_support === true,
      source_files: Array.isArray(target.source_files) ? target.source_files.length : 0,
    },
    focus: {
      token_key: target.token_key || manifest?.focus?.token_key || null,
      token_normalized: target.token_normalized || manifest?.focus?.token_normalized || null,
    },
    manifest_path: manifestPath,
    file_integrity: buildFileIntegrity(manifestPath, manifest?.paths || null),
    source_artifacts: manifest?.source_artifacts || null,
    generated_at: manifest?.generated_at || null,
    counts: manifest?.counts || { occurrence_markers: 0, candidate_rows: 0, clusters: 0, blocked_rows: 0 },
    status_counts: statusCounts,
    reader_facing_eligible_rows: readerFacingEligibleRows,
    ambiguous_rows_reader_facing: false,
    validation,
    cluster_summaries: details.clusterSummaries || [],
    license_counts: topCounts(details.licenseCounts || new Map(), 12),
    work_counts: topCounts(details.workCounts || new Map(), 12),
  };
}

function validateCandidateRow(row, occurrenceIds, issues) {
  for (const field of ['candidate_id', 'occurrence_id', 'token_key', 'route_type', 'candidate_status', 'raw_score', 'source_ref', 'work_id', 'license', 'license_url']) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') issues.push(`candidate row missing ${field}`);
  }
  if (!occurrenceIds.has(row.occurrence_id)) issues.push(`candidate ${row.candidate_id || 'unknown'} references missing occurrence_id`);
  if (row.route_type !== 'workbench_usage_commentary') issues.push(`candidate ${row.candidate_id || 'unknown'} has invalid route_type ${row.route_type}`);
  if (row.not_a_definition !== true) issues.push(`candidate ${row.candidate_id || 'unknown'} missing not_a_definition=true`);
  if (row.observed_usage_only !== true) issues.push(`candidate ${row.candidate_id || 'unknown'} missing observed_usage_only=true`);
  if (!['supported', 'candidate', 'weak', 'ambiguous'].includes(row.candidate_status)) issues.push(`candidate ${row.candidate_id || 'unknown'} has invalid status ${row.candidate_status}`);
  if (/[A-Za-z]{4,}/.test(String(row.phrase_hebrew || ''))) issues.push(`candidate ${row.candidate_id || 'unknown'} has non-Hebrew phrase_hebrew`);
  if (!Array.isArray(row.phrase_tokens) || !row.phrase_tokens.some((token) => token.role === 'focus-token')) issues.push(`candidate ${row.candidate_id || 'unknown'} missing focus-token`);
}

function summarizeClusters(clustersArtifact, clusterCounts) {
  const clusters = Array.isArray(clustersArtifact?.clusters) ? clustersArtifact.clusters : [];
  return clusters.map((cluster) => {
    const supported = Number(cluster.supported_count || 0);
    const candidate = Number(cluster.candidate_count || 0);
    const weak = Number(cluster.weak_count || 0);
    const ambiguous = Number(cluster.ambiguous_count || 0);
    return {
      cluster_id: cluster.cluster_id || 'unclustered',
      frame_label: cluster.frame_label || '',
      occurrence_count: Number(cluster.occurrence_count || clusterCounts.get(cluster.cluster_id) || 0),
      supported,
      candidate,
      weak,
      ambiguous,
      reader_facing_eligible_rows: supported + candidate + weak,
      ambiguous_rows_reader_facing: false,
    };
  }).sort((a, b) => b.reader_facing_eligible_rows - a.reader_facing_eligible_rows || b.occurrence_count - a.occurrence_count || a.cluster_id.localeCompare(b.cluster_id));
}

function isSelectedSmokeTarget(target) {
  return target?.known_nonzero_support === true
    && target?.allow_prefix_family === false
    && ['seeded_nonzero_support_smoke', 'known_nonzero_support_smoke'].includes(String(target.target_kind || ''));
}

function readJson(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) throw new Error(`Missing file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function readJsonIfExists(relativePath, issues, label) {
  if (!relativePath) {
    issues.push(`missing ${label} path`);
    return null;
  }
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) {
    issues.push(`missing ${label} file ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function readJsonl(relativePath, issues, label) {
  if (!relativePath) {
    issues.push(`missing ${label} path`);
    return [];
  }
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) {
    issues.push(`missing ${label} file ${relativePath}`);
    return [];
  }
  const rows = [];
  const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch (error) {
      issues.push(`${label} line ${index + 1}: invalid JSON ${error.message}`);
    }
  }
  return rows;
}

function buildFileIntegrity(manifestPath, manifestPaths) {
  return {
    manifest_json: fileDigest(manifestPath),
    occurrences_jsonl: fileDigest(manifestPaths?.occurrences_jsonl),
    candidates_jsonl: fileDigest(manifestPaths?.candidates_jsonl),
    clusters_json: fileDigest(manifestPaths?.clusters_json),
    blocked_jsonl: fileDigest(manifestPaths?.blocked_jsonl),
  };
}

function fileDigest(relativePath) {
  const cleanPath = cleanRelativePath(relativePath);
  if (!cleanPath) return { path: null, exists: false, bytes: 0, sha256: null };
  const fullPath = path.join(root, cleanPath);
  if (!fs.existsSync(fullPath)) return { path: cleanPath, exists: false, bytes: 0, sha256: null };
  const bytes = fs.readFileSync(fullPath);
  return {
    path: cleanPath,
    exists: true,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

function readSourceFreshness(relativePath) {
  if (!relativePath) return null;
  const cleanPath = cleanRelativePath(relativePath);
  const fullPath = path.join(root, cleanPath);
  if (!fs.existsSync(fullPath)) return null;
  const freshness = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return {
    path: cleanPath,
    summary: {
      status: freshness.status || 'unknown',
      artifact_generated_at: freshness.artifact_snapshot?.generated_at || null,
      artifact_source_files_scanned: freshness.artifact_snapshot?.source_files_scanned ?? null,
      current_source_files: freshness.current_inventory?.source_files ?? null,
      count_delta_vs_artifact_scan: freshness.current_inventory?.count_delta_vs_artifact_scan ?? null,
      files_modified_after_artifact: freshness.current_inventory?.files_modified_after_artifact ?? null,
      files_created_after_artifact: freshness.current_inventory?.files_created_after_artifact ?? null,
    },
  };
}

function buildQualityGates(totals, freshness) {
  const warnings = [];
  const freshnessStatus = freshness?.summary?.status || 'unavailable';
  if (freshnessStatus === 'stale') warnings.push('source_freshness_stale');
  else if (freshnessStatus === 'unavailable') warnings.push('source_freshness_unavailable');
  if (totals.count_only_ambiguous_rows > 0) warnings.push('ambiguous_rows_count_only');

  const validationPassed = totals.validation_failed === 0;
  const zeroUsefulTargetsBlocked = totals.zero_useful_targets === 0;
  const ambiguousRowsAuditOnly = true;
  const downstreamConsumable = validationPassed && zeroUsefulTargetsBlocked && ambiguousRowsAuditOnly;
  return {
    overall_status: downstreamConsumable && warnings.length ? 'pass_with_warnings' : downstreamConsumable ? 'pass' : 'fail',
    downstream_consumable: downstreamConsumable,
    validation_passed: validationPassed,
    zero_useful_targets_blocked: zeroUsefulTargetsBlocked,
    ambiguous_rows_audit_only: ambiguousRowsAuditOnly,
    source_freshness_status: freshnessStatus,
    warnings,
    notes: 'Quality gates describe whether this handoff index is structurally consumable as usage evidence. They do not rank definitions or choose visible answers.',
  };
}

function buildHandoffPayloadContract() {
  return {
    contract_version: 1,
    payload_root: options.handoffRoot,
    public_index_carries_payload_rows: false,
    row_model: 'observed_usage_first_candidate_second',
    stable_ids: ['token_key', 'occurrence_id', 'candidate_id', 'cluster_id'],
    score_authority: 'raw_score_only_non_final',
    visible_statuses: ['supported', 'candidate', 'weak'],
    audit_only_statuses: ['ambiguous', 'blocked'],
    files: [
      {
        key: 'manifest_json',
        role: 'handoff_package_manifest',
        format: 'json',
        required_fields: ['schema_version', 'artifact_type', 'focus.token_key', 'paths', 'counts'],
        notes: 'Consumer entrypoint for each selected package; paths point to local payload files.',
      },
      {
        key: 'occurrences_jsonl',
        role: 'occurrence_graph_rows',
        format: 'jsonl',
        row_type: 'observed_usage',
        stable_ids: ['occurrence_id', 'token_key', 'cluster_id'],
        required_fields: ['occurrence_id', 'token_key', 'focus_normalized', 'phrase_window', 'source_ref', 'work_id', 'license', 'license_url', 'cluster_id'],
        may_include_hebrew_source_windows: true,
        may_include_english_translation: false,
        final_ranking_authority: false,
      },
      {
        key: 'candidates_jsonl',
        role: 'candidate_evidence_rows',
        format: 'jsonl',
        row_type: 'source_fit_candidate',
        stable_ids: ['candidate_id', 'occurrence_id', 'token_key', 'cluster_id'],
        required_fields: ['candidate_id', 'occurrence_id', 'token_key', 'route_type', 'candidate_status', 'not_a_definition', 'observed_usage_only', 'cluster_id', 'raw_score', 'source_ref', 'work_id', 'license', 'license_url'],
        status_field: 'candidate_status',
        score_field: 'raw_score',
        route_link_field: 'route_links',
        may_include_hebrew_source_windows: true,
        may_include_project_authored_usage_commentary: true,
        may_include_english_translation: false,
        final_ranking_authority: false,
      },
      {
        key: 'clusters_json',
        role: 'usage_frame_counts',
        format: 'json',
        row_type: 'cluster_summary',
        stable_ids: ['cluster_id'],
        required_fields: ['cluster_id', 'occurrence_count', 'supported_count', 'candidate_count', 'weak_count', 'ambiguous_count'],
        may_include_frame_labels: true,
        frame_labels_are_definitions: false,
        final_ranking_authority: false,
      },
      {
        key: 'blocked_jsonl',
        role: 'audit_only_blocked_rows',
        format: 'jsonl',
        row_type: 'blocked_or_invalid_payload',
        stable_ids: [],
        required_fields: [],
        reader_facing_eligible: false,
      },
    ],
    consumer_must_not: [
      'treat frame_label or usage_note as a definition',
      'show ambiguous or blocked rows as reader-facing evidence',
      'treat raw_score as a final HUD rank',
      'infer corpus-exhaustive coverage from selected smoke packages',
      'import or generate English translations from this contract',
    ],
  };
}

function summarizeSourceMetadata(manifests) {
  const licenseCounts = new Map();
  const workCounts = new Map();
  for (const manifest of manifests) {
    for (const row of manifest.license_counts || []) {
      incrementBy(licenseCounts, row.value, row.count);
    }
    for (const row of manifest.work_counts || []) {
      incrementBy(workCounts, row.value, row.count);
    }
  }
  return {
    license_counts: topCounts(licenseCounts, 20),
    top_work_counts: topCounts(workCounts, 40),
    work_counts_note: 'Top works are aggregated from each selected manifest summary and are for handoff triage only, not corpus-wide coverage.',
  };
}

function summarizeClusterMetadata(manifests) {
  const clusters = new Map();
  for (const manifest of manifests) {
    for (const row of manifest.cluster_summaries || []) {
      const clusterId = String(row.cluster_id || 'unclustered');
      const existing = clusters.get(clusterId) || {
        cluster_id: clusterId,
        frame_label: '',
        manifest_count: 0,
        occurrence_count: 0,
        supported: 0,
        candidate: 0,
        weak: 0,
        ambiguous: 0,
        reader_facing_eligible_rows: 0,
        ambiguous_rows_reader_facing: false,
      };
      if (!existing.frame_label && row.frame_label) existing.frame_label = row.frame_label;
      existing.manifest_count += 1;
      existing.occurrence_count += Number(row.occurrence_count || 0);
      existing.supported += Number(row.supported || 0);
      existing.candidate += Number(row.candidate || 0);
      existing.weak += Number(row.weak || 0);
      existing.ambiguous += Number(row.ambiguous || 0);
      existing.reader_facing_eligible_rows += Number(row.reader_facing_eligible_rows || 0);
      clusters.set(clusterId, existing);
    }
  }
  return {
    cluster_counts: [...clusters.values()]
      .sort((a, b) => (
        b.reader_facing_eligible_rows - a.reader_facing_eligible_rows
        || b.occurrence_count - a.occurrence_count
        || a.cluster_id.localeCompare(b.cluster_id)
      )),
    notes: 'Cluster summaries are aggregated usage-frame counts from selected handoff manifests only. They are not definition verdicts and do not make ambiguous rows reader-facing.',
  };
}

function summarizeFileIntegrity(manifests) {
  const byKind = new Map();
  for (const manifest of manifests) {
    for (const [kind, row] of Object.entries(manifest.file_integrity || {})) {
      const summary = byKind.get(kind) || {
        kind,
        files: 0,
        existing_files: 0,
        missing_files: 0,
        bytes: 0,
      };
      summary.files += 1;
      if (row?.exists === true) {
        summary.existing_files += 1;
        summary.bytes += Number(row.bytes || 0);
      } else {
        summary.missing_files += 1;
      }
      byKind.set(kind, summary);
    }
  }
  const byKindRows = [...byKind.values()].sort((a, b) => a.kind.localeCompare(b.kind));
  return {
    files: byKindRows.reduce((sum, row) => sum + row.files, 0),
    existing_files: byKindRows.reduce((sum, row) => sum + row.existing_files, 0),
    missing_files: byKindRows.reduce((sum, row) => sum + row.missing_files, 0),
    bytes: byKindRows.reduce((sum, row) => sum + row.bytes, 0),
    by_kind: byKindRows,
    notes: 'Integrity hashes identify selected local handoff artifacts without exposing row payloads.',
  };
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Public Handoff Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Selected targets: ${artifact.counts.selected_targets}`,
    `- Validation passed: ${artifact.counts.validation_passed}`,
    `- Validation failed: ${artifact.counts.validation_failed}`,
    `- Reader-facing eligible rows: ${artifact.counts.reader_facing_eligible_rows}`,
    `- Ambiguous count-only rows: ${artifact.counts.count_only_ambiguous_rows}`,
    `- Zero-useful selected targets: ${artifact.counts.zero_useful_targets}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}, ambiguous ${artifact.counts.status_counts.ambiguous}`,
    '',
    '## Quality Gates',
    '',
    `- Overall status: ${artifact.quality_gates.overall_status}`,
    `- Downstream consumable: ${artifact.quality_gates.downstream_consumable ? 'yes' : 'no'}`,
    `- Validation passed: ${artifact.quality_gates.validation_passed ? 'yes' : 'no'}`,
    `- Zero-useful targets blocked: ${artifact.quality_gates.zero_useful_targets_blocked ? 'yes' : 'no'}`,
    `- Ambiguous rows audit-only: ${artifact.quality_gates.ambiguous_rows_audit_only ? 'yes' : 'no'}`,
    `- Source freshness status: ${artifact.quality_gates.source_freshness_status}`,
    `- Warnings: ${artifact.quality_gates.warnings.length ? artifact.quality_gates.warnings.join(', ') : 'none'}`,
    '',
    '## Integrity Summary',
    '',
    `- Files: ${artifact.integrity_summary.files}`,
    `- Existing files: ${artifact.integrity_summary.existing_files}`,
    `- Missing files: ${artifact.integrity_summary.missing_files}`,
    `- Bytes: ${artifact.integrity_summary.bytes}`,
    '',
    '## Coverage Boundary',
    '',
    `- Selection mode: ${artifact.coverage_boundary.selection_mode}`,
    `- Corpus exhaustive: ${artifact.coverage_boundary.corpus_exhaustive ? 'yes' : 'no'}`,
    `- Source freshness: ${artifact.coverage_boundary.source_freshness.status}`,
    `- Artifact source files scanned: ${artifact.coverage_boundary.source_freshness.artifact_source_files_scanned ?? 'n/a'}`,
    `- Current source files: ${artifact.coverage_boundary.source_freshness.current_source_files ?? 'n/a'}`,
    `- Count delta: ${artifact.coverage_boundary.source_freshness.count_delta_vs_artifact_scan ?? 'n/a'}`,
    `- Files modified after artifact: ${artifact.coverage_boundary.source_freshness.files_modified_after_artifact ?? 'n/a'}`,
    '',
    '## Source Metadata Summary',
    '',
    '| license | rows |',
    '|---|---:|',
    ...artifact.aggregate_source_metadata.license_counts.map((row) => `| ${mdCell(row.value)} | ${row.count} |`),
    '',
    '## Top Work Summary',
    '',
    '| work | rows |',
    '|---|---:|',
    ...artifact.aggregate_source_metadata.top_work_counts.slice(0, 20).map((row) => `| ${mdCell(row.value)} | ${row.count} |`),
    '',
    '## Usage Frame Summary',
    '',
    '| cluster | frame | manifests | supported | candidate | weak | ambiguous | eligible | occurrences |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|',
    ...artifact.aggregate_cluster_metadata.cluster_counts.map((row) => `| ${mdCell(row.cluster_id)} | ${mdCell(row.frame_label)} | ${row.manifest_count} | ${row.supported} | ${row.candidate} | ${row.weak} | ${row.ambiguous} | ${row.reader_facing_eligible_rows} | ${row.occurrence_count} |`),
    '',
    '## Policy',
    '',
    `- Eligible statuses: ${artifact.reader_facing_policy.eligible_statuses.join(', ')}`,
    `- Count-only statuses: ${artifact.reader_facing_policy.count_only_statuses.join(', ')}`,
    `- Ambiguous reader-facing: ${artifact.reader_facing_policy.ambiguous_rows_reader_facing ? 'yes' : 'no'}`,
    '',
    '## Status Semantics',
    '',
    ...artifact.reader_facing_policy.eligible_statuses.concat(artifact.reader_facing_policy.count_only_statuses)
      .map((status) => `- ${status}: ${artifact.reader_facing_policy.status_semantics[status]}`),
    '',
    '## Consumer Contract',
    '',
    `- Artifact role: ${artifact.consumer_contract.artifact_role}`,
    `- Evidence model: ${artifact.consumer_contract.evidence_model}`,
    `- Downstream visible statuses: ${artifact.consumer_contract.downstream_visible_statuses.join(', ')}`,
    `- Audit-only statuses: ${artifact.consumer_contract.audit_only_statuses.join(', ')}`,
    `- Final ranking authority: ${artifact.consumer_contract.final_ranking_authority ? 'yes' : 'no'}`,
    `- Visible answer authority: ${artifact.consumer_contract.visible_answer_authority ? 'yes' : 'no'}`,
    `- Carries text rows: ${artifact.consumer_contract.carries_text_rows ? 'yes' : 'no'}`,
    '',
    '## Payload File Contract',
    '',
    `- Contract version: ${artifact.handoff_payload_contract.contract_version}`,
    `- Payload root: ${artifact.handoff_payload_contract.payload_root}`,
    `- Public index carries payload rows: ${artifact.handoff_payload_contract.public_index_carries_payload_rows ? 'yes' : 'no'}`,
    `- Row model: ${artifact.handoff_payload_contract.row_model}`,
    `- Score authority: ${artifact.handoff_payload_contract.score_authority}`,
    `- Stable ids: ${artifact.handoff_payload_contract.stable_ids.join(', ')}`,
    '',
    '| file key | role | format | final rank authority |',
    '|---|---|---|---|',
    ...artifact.handoff_payload_contract.files.map((row) => `| ${mdCell(row.key)} | ${mdCell(row.role)} | ${mdCell(row.format)} | ${row.final_ranking_authority === false || row.reader_facing_eligible === false ? 'no' : 'n/a'} |`),
    '',
    '## Manifests',
    '',
    '| slug | validation | source files | supported | candidate | weak | ambiguous | rows | clusters | manifest |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.manifests.map((row) => `| ${mdCell(row.slug)} | ${row.validation.status} | ${row.selection.source_files} | ${row.status_counts.supported} | ${row.status_counts.candidate} | ${row.status_counts.weak} | ${row.status_counts.ambiguous} | ${row.counts.candidate_rows} | ${row.counts.clusters} | ${mdCell(row.manifest_path)} |`),
    '',
    '## Validation Issues',
    '',
    ...artifact.manifests
      .filter((row) => row.validation.status !== 'passed')
      .map((row) => `- ${row.slug}: ${row.validation.issues.join('; ')}`),
    '',
    '## Boundary',
    '',
    'This public index exposes selected usage-evidence handoff packages and validation state only. It does not include candidate phrase rows, does not rank definitions, and does not make ambiguous rows reader-facing.',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function topCounts(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function increment(map, key) {
  const safeKey = String(key || '').trim();
  if (!safeKey) return;
  map.set(safeKey, (map.get(safeKey) || 0) + 1);
}

function incrementBy(map, key, count) {
  const safeKey = String(key || '').trim();
  const safeCount = Number(count || 0);
  if (!safeKey || !Number.isFinite(safeCount) || safeCount <= 0) return;
  map.set(safeKey, (map.get(safeKey) || 0) + safeCount);
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
