#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  pkg: 'data/build/orot/reader-hint-placeholder-candidates.json',
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  missingLinkage: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json',
  outputJson: 'reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json',
  outputMd: 'reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.md',
};

const pkg = readJson(paths.pkg);
const preview = readJson(paths.preview);
const missingLinkage = readJson(paths.missingLinkage);
const packageIds = new Set((pkg.rows || []).map((row) => row.token_id));
const missingLinkageIds = new Set((missingLinkage.candidates || []).map((row) => row.token_id));
const noHitRows = (preview.rows || [])
  .filter((row) => (row.sefaria_combined_hit_count || 0) === 0)
  .map((row) => ({
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    queue_id: row.queue_id,
    source_audit_priority: row.source_audit_priority,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    category: row.category,
    agent2_lane: row.agent2_lane,
    current_route_card_count: row.current_route_card_count,
    current_answer_eligible_count: row.current_answer_eligible_count,
    current_ambiguity_count: row.current_ambiguity_count,
    current_candidate_count: row.current_candidate_count,
    current_dominant_failure_reason: row.current_dominant_failure_reason,
    already_in_placeholder_package: packageIds.has(row.token_id),
    in_missing_linkage_inventory: missingLinkageIds.has(row.token_id),
    source_route_needed: classifySourceRoute(row),
    recommended_next_owner: recommendedOwner(row),
    mutation_allowed_here: false,
    public_emit_allowed_here: false,
    answer_eligible_now: false,
    definition_text_stored_now: false,
  }));

const byRoute = countBy(noHitRows, (row) => row.source_route_needed);
const packet = {
  schema_version: 1,
  artifact_type: 'agent10_orot_186_row_nohit_inventory_packet',
  generated_at: new Date().toISOString(),
  status: 'bounded_existing_artifact_inventory_no_broad_lookup_no_mutation',
  package_anchor: {
    path: paths.pkg,
    sha256: sha(paths.pkg),
    rows: pkg.counts?.placeholder_rows,
    occurrences: pkg.counts?.placeholder_occurrences,
    commercial_clean_rows: pkg.counts?.commercial_clean_rows,
    commercial_clean_occurrences: pkg.counts?.commercial_clean_occurrences,
    noncommercial_educational_rows: pkg.counts?.noncommercial_educational_rows,
    noncommercial_educational_occurrences: pkg.counts?.noncommercial_educational_occurrences,
    display_integrity_tbd_rows: pkg.counts?.display_integrity_tbd_rows,
    display_integrity_tbd_occurrences: pkg.counts?.display_integrity_tbd_occurrences,
  },
  inputs: {
    public_domain_preview: withHash(paths.preview),
    missing_linkage_inventory: withHash(paths.missingLinkage),
  },
  summary: {
    nohit_rows: noHitRows.length,
    nohit_occurrences: sum(noHitRows.map((row) => row.occurrences)),
    already_in_placeholder_package_rows: noHitRows.filter((row) => row.already_in_placeholder_package).length,
    already_in_placeholder_package_occurrences: sum(noHitRows.filter((row) => row.already_in_placeholder_package).map((row) => row.occurrences)),
    missing_from_placeholder_package_rows: noHitRows.filter((row) => !row.already_in_placeholder_package).length,
    missing_from_placeholder_package_occurrences: sum(noHitRows.filter((row) => !row.already_in_placeholder_package).map((row) => row.occurrences)),
    in_missing_linkage_inventory_rows: noHitRows.filter((row) => row.in_missing_linkage_inventory).length,
    in_missing_linkage_inventory_occurrences: sum(noHitRows.filter((row) => row.in_missing_linkage_inventory).map((row) => row.occurrences)),
    source_route_counts: byRoute,
    mutation_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    answer_rows_emitted: 0,
    definition_content_rows_emitted: 0,
  },
  rows: noHitRows,
  next_exact_routes: [
    {
      target: 'Agent 3 / Spark-3',
      objective: 'Dedupe and source-route the 186 no-Sefaria-hit rows using existing local artifacts only.',
      output: 'no-hit source-route/dedupe matrix for Agent 10 consumption',
      stop_condition: 'stop after complete 186-row matrix or exact missing-input blocker',
    },
    {
      target: 'Agent 1 / Spark-1 replacement',
      objective: 'For rows with existing local route cards or missing-linkage overlap, classify source/linkage allow/exclude/block; no mutation.',
      output: 'row-level source/linkage map',
      stop_condition: 'stop after designated rows are classified or exact missing-source/linkage blocker',
    },
    {
      target: 'Agent 2 / Spark-2',
      objective: 'Run zero-or-safe transform only after Agent 10 designates a source-cleared subset.',
      output: 'non-public transform/blocker packet',
      stop_condition: 'stop after validator-backed dry-run or exact transform blocker',
    },
  ],
  zero_counts: {
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
  },
  highest_permissible_claim: 'Agent 10 prepared a bounded no-hit inventory packet from existing evidence only.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss',
    'accepted text',
    'public reader output',
  ],
};

assertPacket(packet);
writeJson(paths.outputJson, packet);
writeMd(paths.outputMd, packet);
console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);

function classifySourceRoute(row) {
  if (missingLinkageIds.has(row.token_id)) return 'missing_lexicon_linkage_review';
  if ((row.current_route_card_count || 0) > 0) return 'local_route_card_dedupe_review';
  if ((row.current_candidate_count || 0) > 0 || (row.current_ambiguity_count || 0) > 0) return 'local_candidate_or_ambiguity_review';
  return 'new_source_discovery_needed_after_existing_evidence';
}

function recommendedOwner(row) {
  const route = classifySourceRoute(row);
  if (route === 'missing_lexicon_linkage_review') return 'Agent 1';
  if (route === 'local_route_card_dedupe_review' || route === 'local_candidate_or_ambiguity_review') return 'Agent 3 then Agent 2';
  return 'Agent 10 then Agent 3/Spark-3';
}

function assertPacket(packet) {
  if (packet.package_anchor.rows !== 332) throw new Error('expected package rows 332');
  if (packet.package_anchor.occurrences !== 6156) throw new Error('expected package occurrences 6156');
  if (packet.summary.nohit_rows !== 186) throw new Error('expected 186 no-hit rows');
  if (packet.summary.nohit_occurrences !== 2421) throw new Error('expected 2421 no-hit occurrences');
  for (const [key, value] of Object.entries(packet.zero_counts)) {
    if (value !== 0) throw new Error(`expected zero ${key}`);
  }
}

function countBy(rows, keyFn) {
  const out = {};
  for (const row of rows) {
    const key = keyFn(row);
    out[key] ||= { rows: 0, occurrences: 0 };
    out[key].rows += 1;
    out[key].occurrences += Number(row.occurrences || 0);
  }
  return out;
}

function withHash(file) {
  return { path: file, sha256: sha(file) };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, packet) {
  const routeLines = Object.entries(packet.summary.source_route_counts)
    .map(([key, value]) => `- \`${key}\`: ${value.rows} rows / ${value.occurrences} occurrences`);
  const lines = [
    '# Agent 10 Orot 186-Row No-Hit Inventory Packet',
    '',
    `Status: \`${packet.status}\``,
    '',
    '## Anchor',
    '',
    `- Package: \`${packet.package_anchor.path}\``,
    `- Rows / occurrences: ${packet.package_anchor.rows} / ${packet.package_anchor.occurrences}`,
    '',
    '## Inventory',
    '',
    `- No-Sefaria-hit rows: ${packet.summary.nohit_rows}`,
    `- No-Sefaria-hit occurrences: ${packet.summary.nohit_occurrences}`,
    `- Already in placeholder package: ${packet.summary.already_in_placeholder_package_rows} rows / ${packet.summary.already_in_placeholder_package_occurrences} occurrences`,
    `- Missing from placeholder package: ${packet.summary.missing_from_placeholder_package_rows} rows / ${packet.summary.missing_from_placeholder_package_occurrences} occurrences`,
    `- Missing-linkage overlap: ${packet.summary.in_missing_linkage_inventory_rows} rows / ${packet.summary.in_missing_linkage_inventory_occurrences} occurrences`,
    '',
    '## Source Route Buckets',
    '',
    ...routeLines,
    '',
    '## Next Exact Routes',
    '',
    ...packet.next_exact_routes.map((route, index) => `${index + 1}. ${route.target}: ${route.objective} Output: \`${route.output}\``),
    '',
    '## Boundary',
    '',
    'This is inventory only. It emits no source rows, answer rows, public HUD rows, route JSONL rows, definition-content rows, accepted text, or public reader output.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
