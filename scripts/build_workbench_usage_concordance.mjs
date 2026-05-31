#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const defaults = {
  index: 'data/workbench-evidence/public-handoff-index.json',
  output: 'data/workbench-evidence/usage-concordance.json',
  report: 'reports/workbench-usage-concordance.md',
  manifest: 'data/workbench-evidence/usage-concordance-manifest.json',
  maxReportRows: 5000,
};
const eligibleStatuses = new Set(['supported', 'candidate', 'weak']);
const auditOnlyStatuses = new Set(['ambiguous', 'blocked']);

const options = parseArgs(process.argv.slice(2));
const index = readJson(options.index);
if (index.artifact_type !== 'workbench_public_handoff_index') {
  throw new Error(`${options.index} is not a workbench public handoff index`);
}

const rows = [];
const auditOnlyCounts = { ambiguous: 0, blocked: 0 };
const statusCounts = { supported: 0, candidate: 0, weak: 0 };
const routeLinkStateCounts = {
  route_linked_observed_usage: 0,
  observed_usage_only: 0,
};

for (const manifest of index.manifests || []) {
  if (manifest.validation?.status !== 'passed') continue;
  const candidatePath = manifest.file_integrity?.candidates_jsonl?.path;
  for (const row of readJsonl(candidatePath)) {
    const status = String(row.candidate_status || 'ambiguous');
    if (eligibleStatuses.has(status)) {
      const concordanceRow = buildConcordanceRow(row, manifest);
      rows.push(concordanceRow);
      statusCounts[status] += 1;
      routeLinkStateCounts[concordanceRow.route_link_state] += 1;
    } else if (auditOnlyStatuses.has(status)) {
      auditOnlyCounts[status] += 1;
    } else {
      auditOnlyCounts.ambiguous += 1;
    }
  }
  auditOnlyCounts.blocked += Number(manifest.status_counts?.blocked || 0);
}

rows.sort((a, b) => (
  b.status.raw_score - a.status.raw_score
  || a.source.source_ref.localeCompare(b.source.source_ref)
  || a.ids.candidate_id.localeCompare(b.ids.candidate_id)
));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_concordance',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_concordance.mjs',
  policy: 'Usage-navigation concordance for selected workbench evidence. It exposes clickable occurrence links and source-backed usage context only; it is not a definition layer, ranking authority, or visible-answer selector.',
  inputs: {
    public_handoff_index: options.index,
  },
  reader_facing_policy: {
    emitted_statuses: [...eligibleStatuses],
    audit_only_statuses: [...auditOnlyStatuses],
    ambiguous_rows_reader_facing: false,
    no_route_label: 'observed usage only',
    route_linked_label: 'route-linked observed usage',
  },
  counts: {
    rows: rows.length,
    selected_manifests: (index.manifests || []).filter((manifest) => manifest.validation?.status === 'passed').length,
    status_counts: statusCounts,
    route_link_state_counts: routeLinkStateCounts,
    audit_only_counts: auditOnlyCounts,
  },
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
const manifest = buildManifest(artifact, options);
writeJson(options.manifest, manifest);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Wrote ${options.manifest}`);
console.log(`Usage concordance rows ${artifact.counts.rows}; supported ${statusCounts.supported}; candidate ${statusCounts.candidate}; weak ${statusCounts.weak}; audit-only ambiguous ${auditOnlyCounts.ambiguous}`);

function buildManifest(artifact, options) {
  return {
    schema_version: 1,
    artifact_type: 'workbench_usage_navigation_concordance_manifest',
    generated_at: artifact.generated_at,
    generator: 'scripts/build_workbench_usage_concordance.mjs',
    handoff_role: 'compact tracked manifest for a regenerated usage-navigation concordance',
    inputs: {
      public_handoff_index: options.index,
    },
    outputs: {
      concordance_json: {
        path: options.output,
        tracked_in_git: false,
        reason: 'high-volume generated workbench JSON is intentionally ignored; regenerate with the command below',
        sha256: fileSha256(options.output),
      },
      concordance_report: {
        path: options.report,
        tracked_in_git: true,
        sha256: fileSha256(options.report),
      },
      manifest: {
        path: options.manifest,
        tracked_in_git: true,
      },
    },
    commands: {
      regenerate: `node scripts/build_workbench_usage_concordance.mjs --index=${options.index} --output=${options.output} --report=${options.report} --manifest=${options.manifest}`,
      validate: `node scripts/validate_workbench_usage_concordance.mjs ${options.output} --manifest=${options.manifest}`,
    },
    authority_policy: {
      usage_navigation_only: true,
      ranks_routes: false,
      selects_visible_result: false,
      ambiguous_rows_reader_facing: false,
      no_route_label: 'observed usage only',
    },
    emitted_row_statuses: [...eligibleStatuses],
    audit_only_statuses: [...auditOnlyStatuses],
    counts: artifact.counts,
    row_contract: {
      required_sections: [
        'ids',
        'token',
        'usage_frame',
        'status',
        'occurrence_links',
        'phrase',
        'source',
        'agent2_route_ids',
        'route_links',
      ],
      clickable_links: [
        'occurrence_links.source_ref.href',
        'occurrence_links.work_anchor.href',
      ],
      forbidden_row_fields: [
        'definition',
        'definition_text',
        'meaning',
        'meaning_claim',
        'translation',
        'translation_text',
        'english',
        'english_text',
        'english_translation',
        'imported_translation',
        'final_answer',
      ],
    },
  };
}

function buildConcordanceRow(row, manifest) {
  const routeLinks = Array.isArray(row.route_links) ? row.route_links.map(compactRouteLink).filter((link) => link.route_id) : [];
  const routeLinkState = routeLinks.length ? 'route_linked_observed_usage' : 'observed_usage_only';
  return {
    row_role: 'usage_navigation',
    observed_usage_only: true,
    navigation_label: routeLinks.length ? 'route-linked observed usage' : 'observed usage only',
    route_link_state: routeLinkState,
    authority: {
      usage_navigation_only: true,
      ranks_routes: false,
      selects_visible_result: false,
    },
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
      candidate_status: row.candidate_status || null,
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
        work_slug: row.work_slug || null,
        unit_id: row.unit_id || null,
      },
    },
    phrase: {
      phrase_hebrew: row.phrase_hebrew || '',
      phrase_tokens: Array.isArray(row.phrase_tokens) ? row.phrase_tokens.map(compactPhraseToken) : [],
    },
    source: {
      source_ref: row.source_ref || null,
      sefaria_ref: row.sefaria_ref || null,
      work_id: row.work_id || null,
      work_title: row.work_title || null,
      work_slug: row.work_slug || null,
      unit_id: row.unit_id || null,
      source_url: row.source_url || null,
      version_title: row.version_title || null,
      version_source: row.version_source || null,
      license: row.license || null,
      license_url: row.license_url || null,
    },
    agent2_route_ids: routeLinks.map((link) => link.route_id),
    route_links: routeLinks,
  };
}

function compactRouteLink(link) {
  return {
    route_id: link?.route_id || null,
    route_source: link?.route_source || null,
    route_family: link?.route_family || null,
    route_type: link?.route_type || null,
    display_section: link?.display_section || null,
    normalized: link?.normalized || null,
    surface: link?.surface || null,
    raw_score: link?.raw_score ?? null,
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

function buildWorkAnchor(row) {
  if (!row.work_slug || !row.unit_id) return null;
  return `${cleanRelativePath(row.work_slug)}/index.html#${row.unit_id}`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--index=')) parsed.index = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-rows=')) parsed.maxReportRows = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxReportRows) || parsed.maxReportRows < 1) {
    throw new Error('--max-report-rows must be a positive integer');
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
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function fileSha256(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  return crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
}

function writeReport(relativePath, artifact) {
  const reportRows = artifact.rows.slice(0, options.maxReportRows);
  const lines = [
    '# Workbench Usage Navigation Concordance',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Selected manifests: ${artifact.counts.selected_manifests}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_link_state_counts.route_linked_observed_usage}, observed-only ${artifact.counts.route_link_state_counts.observed_usage_only}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_counts.ambiguous}, blocked ${artifact.counts.audit_only_counts.blocked}`,
    `- Ambiguous reader-facing: ${artifact.reader_facing_policy.ambiguous_rows_reader_facing ? 'yes' : 'no'}`,
    '',
    '## Policy',
    '',
    'This is a usage-navigation/concordance artifact. It does not emit a definition authority field, does not select visible answers, and does not rank HUD routes. Rows without related route IDs are labeled observed usage only. Ambiguous rows are audit-only.',
    '',
    '## Rows',
    '',
    '| candidate | token | status | score | frame | source | work anchor | route ids | label | context |',
    '|---|---|---|---:|---|---|---|---|---|---|',
    ...reportRows.map((row) => [
      mdCell(row.ids.candidate_id),
      mdCell(row.token.focus_normalized || row.token.token_normalized || ''),
      mdCell(row.status.candidate_status),
      row.status.raw_score,
      mdCell(row.usage_frame.frame_label || row.usage_frame.cluster_id || ''),
      mdLink(row.occurrence_links.source_ref.label, row.occurrence_links.source_ref.href),
      mdLink(row.occurrence_links.work_anchor.label, row.occurrence_links.work_anchor.href ? `../${row.occurrence_links.work_anchor.href}` : null),
      mdCell(row.agent2_route_ids.join(', ') || 'none'),
      mdCell(row.navigation_label),
      mdCell(markFocusSnippet(row.phrase.phrase_tokens)),
    ].join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Boundary',
    '',
    'Rows are selected usage occurrences only. They carry source links, local work anchors, phrase context, usage frame, status, raw score, and route IDs where available. They are not definition claims.',
  ];
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function markFocusSnippet(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return '';
  return tokens.map((token) => (token.role === 'focus-token' ? `[${token.surface}]` : token.surface)).join(' ');
}

function mdLink(label, href) {
  if (!href) return mdCell(label || '');
  return `[${mdCell(label || href)}](${href})`;
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
