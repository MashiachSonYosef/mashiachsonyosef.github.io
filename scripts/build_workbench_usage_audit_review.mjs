#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  index: 'data/workbench-evidence/public-handoff-index.json',
  output: '.local-cache/workbench-evidence/usage-audit-only-review.json',
  report: 'reports/workbench-usage-audit-only-review.md',
  maxSamples: 80,
};
const readerStatuses = new Set(['supported', 'candidate', 'weak']);

const options = parseArgs(process.argv.slice(2));
const index = readJson(options.index);
if (index.artifact_type !== 'workbench_public_handoff_index') {
  throw new Error(`${options.index} is not a workbench public handoff index`);
}

const rows = [];
const statusCounts = { ambiguous: 0, blocked: 0 };
const frameCounts = new Map();
const workCounts = new Map();

for (const manifest of index.manifests || []) {
  if (manifest.validation?.status !== 'passed') continue;
  const candidatePath = manifest.file_integrity?.candidates_jsonl?.path;
  for (const row of readJsonl(candidatePath)) {
    const status = String(row.candidate_status || 'ambiguous');
    if (readerStatuses.has(status)) continue;
    const auditRow = buildAuditRow(row, manifest, status);
    rows.push(auditRow);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    increment(frameCounts, auditRow.usage_frame.frame_label || auditRow.usage_frame.cluster_id || 'unlabeled');
    increment(workCounts, auditRow.source.work_title || auditRow.source.work_id || 'unknown');
  }
}

rows.sort((a, b) => (
  a.status.candidate_status.localeCompare(b.status.candidate_status)
  || a.source.source_ref.localeCompare(b.source.source_ref)
  || a.ids.candidate_id.localeCompare(b.ids.candidate_id)
));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_audit_only_review',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_audit_review.mjs',
  policy: 'Audit-only review queue for selected workbench usage rows. These rows are not reader-facing, do not rank routes, and do not select visible answers.',
  inputs: {
    public_handoff_index: options.index,
  },
  reader_facing_policy: {
    reader_facing: false,
    included_statuses: Object.keys(statusCounts).sort(),
    excluded_reader_statuses: [...readerStatuses],
  },
  counts: {
    rows: rows.length,
    status_counts: statusCounts,
    top_frames: topEntries(frameCounts),
    top_works: topEntries(workCounts),
  },
  samples: rows.slice(0, options.maxSamples),
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage audit-only review rows ${artifact.counts.rows}; ambiguous ${statusCounts.ambiguous || 0}; blocked ${statusCounts.blocked || 0}; reader-facing no`);

function buildAuditRow(row, manifest, status) {
  return {
    row_role: 'usage_audit_only_review',
    reader_facing: false,
    ids: {
      token_key: row.token_key || manifest.focus?.token_key || null,
      occurrence_id: row.occurrence_id || null,
      candidate_id: row.candidate_id || null,
      cluster_id: row.cluster_id || null,
    },
    token: {
      token_surface: row.token_surface || null,
      token_normalized: row.token_normalized || null,
      focus_surface: row.focus_surface || null,
      focus_normalized: row.focus_normalized || null,
    },
    usage_frame: {
      cluster_id: row.cluster_id || null,
      frame_label: row.frame_label || '',
    },
    status: {
      candidate_status: status,
      raw_score: Number(row.raw_score || 0),
    },
    occurrence_links: {
      source_ref: {
        label: row.source_ref || row.sefaria_ref || '',
        href: row.source_url || null,
      },
      work_anchor: {
        label: row.source_ref || row.unit_id || '',
        href: buildWorkAnchor(row),
      },
    },
    source: {
      source_ref: row.source_ref || null,
      work_id: row.work_id || null,
      work_title: row.work_title || null,
      source_url: row.source_url || null,
      license: row.license || null,
      license_url: row.license_url || null,
    },
    phrase: {
      phrase_hebrew: row.phrase_hebrew || '',
      phrase_tokens: Array.isArray(row.phrase_tokens) ? row.phrase_tokens.map(compactPhraseToken) : [],
    },
    audit_note: row.usage_note || (Array.isArray(row.evidence_basis) ? row.evidence_basis.join(' ') : ''),
  };
}

function compactPhraseToken(token) {
  return {
    surface: token?.surface || '',
    normalized: token?.normalized || '',
    role: token?.role || 'context',
    distance_from_focus: token?.distance_from_focus ?? null,
  };
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Audit-Only Review',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Reader-facing: ${artifact.reader_facing_policy.reader_facing ? 'yes' : 'no'}`,
    `- Status counts: ${formatCounts(artifact.counts.status_counts)}`,
    '',
    '## Top Frames',
    '',
    '| frame | rows |',
    '|---|---:|',
    ...artifact.counts.top_frames.map((entry) => `| ${mdCell(entry.key)} | ${entry.count} |`),
    '',
    '## Top Works',
    '',
    '| work | rows |',
    '|---|---:|',
    ...artifact.counts.top_works.map((entry) => `| ${mdCell(entry.key)} | ${entry.count} |`),
    '',
    '## Audit Samples',
    '',
    'These rows are for review only. They are not reader-facing and do not make lexical claims.',
    '',
    '| candidate | token | status | source | work anchor | note | context |',
    '|---|---|---|---|---|---|---|',
    ...artifact.samples.map((row) => [
      mdCell(row.ids.candidate_id),
      mdCell(row.token.focus_normalized || row.token.token_normalized || ''),
      mdCell(row.status.candidate_status),
      mdLink(row.occurrence_links.source_ref.label, row.occurrence_links.source_ref.href),
      mdLink(row.occurrence_links.work_anchor.label, row.occurrence_links.work_anchor.href ? `../${row.occurrence_links.work_anchor.href}` : null),
      mdCell(row.audit_note),
      mdCell(markFocusSnippet(row.phrase.phrase_tokens)),
    ].join(' | ')).map((line) => `| ${line} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function buildWorkAnchor(row) {
  if (!row.work_slug || !row.unit_id) return null;
  return `${cleanRelativePath(row.work_slug)}/index.html#${row.unit_id}`;
}

function markFocusSnippet(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return '';
  return tokens.map((token) => (token.role === 'focus-token' ? `[${token.surface}]` : token.surface)).join(' ');
}

function topEntries(map, limit = 20) {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--index=')) parsed.index = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxSamples) || parsed.maxSamples < 0) {
    throw new Error('--max-samples must be a non-negative integer');
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function readJsonl(relativePath) {
  if (!relativePath) return [];
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return [];
  return fs.readFileSync(fullPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
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

function formatCounts(counts) {
  return Object.entries(counts || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => `${key} ${count}`)
    .join(', ') || 'none';
}

function mdLink(label, href) {
  if (!href) return mdCell(label || '');
  return `[${mdCell(label || href)}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
