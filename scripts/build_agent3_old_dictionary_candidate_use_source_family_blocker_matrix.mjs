#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  continuityCrossmatch: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
  output: 'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const continuityCrossmatch = readJson(options.continuityCrossmatch);

if (continuityCrossmatch.artifact_type !== 'agent3_old_dictionary_candidate_use_continuity_crossmatch') {
  throw new Error(`${options.continuityCrossmatch} is not an Agent 3 candidate-use continuity crossmatch`);
}

const candidateRows = continuityCrossmatch.rows || [];
const blockerByFamily = buildBlockerByFamily(candidateRows);
const sourceFamilyRows = buildSourceFamilyRows(candidateRows, blockerByFamily);
const sourceFamilySetRows = buildSourceFamilySetRows(candidateRows, blockerByFamily);
const familyMembershipCounts = countBy(candidateRows, (row) => String(row.source_families?.length || 0));
const multiFamilyRows = candidateRows.filter((row) => (row.source_families || []).length > 1);
const singleFamilyRows = candidateRows.filter((row) => (row.source_families || []).length === 1);

const counts = {
  candidate_use_rows: candidateRows.length,
  candidate_use_occurrences: sum(candidateRows, (row) => row.occurrences),
  unique_queue_ids: new Set(candidateRows.map((row) => row.queue_id)).size,
  unique_token_ids: new Set(candidateRows.map((row) => row.token_id)).size,
  duplicate_queue_ids: duplicateValues(candidateRows.map((row) => row.queue_id)).length,
  duplicate_token_ids: duplicateValues(candidateRows.map((row) => row.token_id)).length,
  source_family_rows: sourceFamilyRows.length,
  source_family_set_rows: sourceFamilySetRows.length,
  source_family_membership_rows: sum(sourceFamilyRows, (row) => row.candidate_rows),
  source_family_membership_occurrences: sum(sourceFamilyRows, (row) => row.candidate_occurrences),
  multi_family_candidate_rows: multiFamilyRows.length,
  multi_family_candidate_occurrences: sum(multiFamilyRows, (row) => row.occurrences),
  single_family_candidate_rows: singleFamilyRows.length,
  single_family_candidate_occurrences: sum(singleFamilyRows, (row) => row.occurrences),
  row_overlap_sample_linked_rows: Number(continuityCrossmatch.counts?.row_overlap_sample_linked_rows || 0),
  row_overlap_sample_unlinked_rows: Number(continuityCrossmatch.counts?.row_overlap_sample_unlinked_rows || 0),
  source_family_rows_with_blocker_links: sourceFamilyRows.filter((row) => row.blocker_link !== null).length,
  source_family_set_rows_with_blocker_links: sourceFamilySetRows.filter((row) => row.blocker_links.length > 0).length,
  exact_blocker_rows: sourceFamilyRows.filter((row) => row.status.startsWith('exact_blocker')).length,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_rows: 0,
  answer_eligible_rows: 0,
  route_jsonl_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_source_family_blocker_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_family_blocker_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'source-family membership and blocker dedupe matrix for old-dictionary candidate-use planning rows',
  inputs: {
    continuity_crossmatch: options.continuityCrossmatch,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    source_family_membership_dedupe_only: true,
    blocker_navigation_only: true,
    candidate_use_planning_evidence_only: true,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    lemma_content_storage: false,
    reader_hint_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    answer_eligibility: false,
    route_ranking: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  counts,
  family_membership_counts: familyMembershipCounts,
  source_family_rows: sourceFamilyRows,
  source_family_set_rows: sourceFamilySetRows,
  downstream_handoff: {
    package_owner: continuityCrossmatch.downstream_handoff?.package_owner || 'Agent 10',
    transform_owner_after_exact_boundary:
      continuityCrossmatch.downstream_handoff?.transform_owner_after_exact_boundary || 'Agent 2',
    qa_boundary_owner_if_needed:
      continuityCrossmatch.downstream_handoff?.qa_boundary_owner_if_needed || 'Agent 6',
    current_exact_blocker:
      continuityCrossmatch.downstream_handoff?.agent10_current_exact_blocker ||
      'missing_exact_agent1_agent6_boundary_fields_for_old_dictionary_transform_reaudit_row_subsets',
    stop_condition:
      'Use this matrix only to distinguish unique candidate rows from duplicated source-family memberships and blocker rows. Do not emit candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this matrix.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 candidate-use source-family blocker matrix candidate_rows=${counts.candidate_use_rows} memberships=${counts.source_family_membership_rows} families=${counts.source_family_rows} family_sets=${counts.source_family_set_rows} blockers=${counts.exact_blocker_rows}`,
);

function buildSourceFamilyRows(rows, blockerMap) {
  const grouped = new Map();
  for (const row of rows) {
    for (const family of row.source_families || []) {
      if (!grouped.has(family)) grouped.set(family, []);
      grouped.get(family).push(row);
    }
  }
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceFamily, familyRows]) => {
      const blocker = blockerMap.get(sourceFamily) || null;
      const linkedRows = familyRows.filter(
        (row) => row.row_overlap_sample_status === 'sample_linked_to_row_overlap_bucket',
      );
      return {
        row_id: `agent3-candidate-use-source-family-${slug(sourceFamily)}`,
        source_family: sourceFamily,
        row_subset_id: blocker?.row_subset_id || '',
        license_lane: blocker?.license_lane || '',
        blocker_link: blocker,
        candidate_rows: familyRows.length,
        candidate_occurrences: sum(familyRows, (row) => row.occurrences),
        row_overlap_sample_linked_rows: linkedRows.length,
        row_overlap_sample_unlinked_rows: familyRows.length - linkedRows.length,
        source_family_set_count: new Set(familyRows.map((row) => familySetKey(row.source_families || []))).size,
        queue_id_sample: familyRows.slice(0, 12).map((row) => row.queue_id),
        token_id_sample: familyRows.slice(0, 12).map((row) => row.token_id),
        status: blocker
          ? 'exact_blocker_missing_exact_agent1_agent6_boundary_fields'
          : 'exact_blocker_missing_source_family_blocker_link',
        dedupe_key: sha256([sourceFamily, blocker?.row_subset_id || '', familyRows.length].join('|')),
      };
    });
}

function buildSourceFamilySetRows(rows, blockerMap) {
  const grouped = new Map();
  for (const row of rows) {
    const key = familySetKey(row.source_families || []);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceFamilySet, setRows]) => {
      const families = sourceFamilySet.split('|').filter(Boolean);
      const linkedRows = setRows.filter(
        (row) => row.row_overlap_sample_status === 'sample_linked_to_row_overlap_bucket',
      );
      return {
        row_id: `agent3-candidate-use-source-family-set-${sha256(sourceFamilySet).slice(0, 12)}`,
        source_family_set: families,
        blocker_links: families.map((family) => blockerMap.get(family)).filter(Boolean),
        candidate_rows: setRows.length,
        candidate_occurrences: sum(setRows, (row) => row.occurrences),
        row_overlap_sample_linked_rows: linkedRows.length,
        row_overlap_sample_unlinked_rows: setRows.length - linkedRows.length,
        queue_id_sample: setRows.slice(0, 12).map((row) => row.queue_id),
        token_id_sample: setRows.slice(0, 12).map((row) => row.token_id),
        status: 'exact_blocker_source_family_set_requires_boundary_selection_before_transform',
        dedupe_key: sha256([sourceFamilySet, setRows.length, sum(setRows, (row) => row.occurrences)].join('|')),
      };
    });
}

function buildBlockerByFamily(rows) {
  const map = new Map();
  for (const row of rows) {
    for (const blocker of row.source_family_blocker_links || []) {
      if (!blocker.source_family || map.has(blocker.source_family)) continue;
      map.set(blocker.source_family, {
        row_subset_id: blocker.row_subset_id || '',
        source_family: blocker.source_family || '',
        license_lane: blocker.license_lane || '',
        missing_before_transform: blocker.missing_before_transform || [],
        handoff_owner: blocker.handoff_owner || '',
      });
    }
  }
  return map;
}

function familySetKey(families) {
  return [...families].sort().join('|');
}

function countForbiddenPayloadKeys(value) {
  const forbidden = new Set([
    'surface',
    'normalized',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'candidate_text',
    'definition_text',
    'source_text',
    'accepted_text',
    'display_text',
    'route_payload',
    'public_domain_headwords',
  ]);
  let count = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) count += 1;
  });
  return count;
}

function countBy(values, callback) {
  const counts = {};
  for (const value of values) {
    const key = callback(value);
    counts[key] = Number(counts[key] || 0) + 1;
  }
  return counts;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function sum(values, callback) {
  return values.reduce((total, value) => total + Number(callback(value) || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function writeMarkdown(relativePath, data) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Family Blocker Matrix',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${options.output}\``,
    `- Status: \`${data.status}\``,
    `- Candidate rows / occurrences: ${data.counts.candidate_use_rows} / ${data.counts.candidate_use_occurrences}`,
    `- Source-family membership rows / occurrences: ${data.counts.source_family_membership_rows} / ${data.counts.source_family_membership_occurrences}`,
    `- Source families / source-family sets: ${data.counts.source_family_rows} / ${data.counts.source_family_set_rows}`,
    `- Single-family / multi-family candidate rows: ${data.counts.single_family_candidate_rows} / ${data.counts.multi_family_candidate_rows}`,
    `- Exact blocker rows: ${data.counts.exact_blocker_rows}`,
    '',
    '## Source Families',
    '',
    '| source_family | candidate rows | occurrences | linked sample rows | unlinked sample rows | blocker |',
    '|---|---:|---:|---:|---:|---|',
    ...data.source_family_rows.map(
      (row) =>
        `| ${mdCell(row.source_family)} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.row_overlap_sample_linked_rows} | ${row.row_overlap_sample_unlinked_rows} | ${mdCell(row.status)} |`,
    ),
    '',
    '## Source-Family Sets',
    '',
    '| source_family_set | candidate rows | occurrences | linked sample rows | unlinked sample rows | blocker links |',
    '|---|---:|---:|---:|---:|---:|',
    ...data.source_family_set_rows.map(
      (row) =>
        `| ${mdCell(row.source_family_set.join(', '))} | ${row.candidate_rows} | ${row.candidate_occurrences} | ${row.row_overlap_sample_linked_rows} | ${row.row_overlap_sample_unlinked_rows} | ${row.blocker_links.length} |`,
    ),
    '',
    '## Boundary',
    '',
    '- Navigation/dedupe evidence only.',
    '- Membership occurrence counts intentionally duplicate candidate rows when a row belongs to multiple source families.',
    '- This matrix does not emit source text, candidate text, definitions, lemma content, reader hints, accepted text, answer rows, route writes, public/runtime changes, commercial export, or release actions.',
    '',
    '## Stop Condition',
    '',
    data.downstream_handoff.stop_condition,
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--continuity-crossmatch=')) parsed.continuityCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
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
