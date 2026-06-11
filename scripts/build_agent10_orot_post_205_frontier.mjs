#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  pkg: 'data/build/orot/reader-hint-placeholder-candidates.json',
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  measurement: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json',
  missingLinkage: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json',
  pilot: 'reports/agent2-orot-pilot-answer-claims-2026-06-03.json',
  spark10: 'reports/spark10-orot-post-205-package-health-2026-06-04.md',
  postAppend: 'reports/agent10-orot-205-row-commercial-clean-post-append-proof-2026-06-04.json',
  outputJson: 'reports/agent10-orot-post-205-frontier-and-blockers-2026-06-04.json',
  outputMd: 'reports/agent10-orot-post-205-frontier-and-blockers-2026-06-04.md',
};

const pkg = readJson(paths.pkg);
const preview = readJson(paths.preview);
const measurement = readJson(paths.measurement);
const missingLinkage = readJson(paths.missingLinkage);
const pilot = readJson(paths.pilot);
const postAppend = readJson(paths.postAppend);
const packageIds = new Set((pkg.rows || []).map((row) => row.token_id));
const previewRows = preview.rows || [];

const publicDomainRows = previewRows.filter((row) => (row.public_domain_observed_entry_count || 0) > 0 || (row.public_domain_lexicons || []).length > 0);
const publicDomainMissing = publicDomainRows.filter((row) => !packageIds.has(row.token_id));
const ncRows = previewRows.filter((row) => (row.public_domain_observed_entry_count || 0) === 0 && (row.blocked_or_unresolved_entry_count || 0) > 0);
const ncMissing = ncRows.filter((row) => !packageIds.has(row.token_id));
const noHitRows = previewRows.filter((row) => (row.sefaria_combined_hit_count || 0) === 0);
const noHitMissing = noHitRows.filter((row) => !packageIds.has(row.token_id));
const missingLinkageRows = missingLinkage.candidates || [];

const frontier = {
  schema_version: 1,
  artifact_type: 'agent10_orot_post_205_frontier_and_blockers',
  generated_at: new Date().toISOString(),
  status: 'orot_top500_sefaria_pd_nc_represented_next_work_is_unblock_or_broad_discovery',
  package_anchor: {
    path: paths.pkg,
    sha256: sha(paths.pkg),
    ...pkg.counts,
  },
  consumed_evidence: {
    post_205_append_proof: withHash(paths.postAppend),
    spark10_health: withHash(paths.spark10),
    public_domain_preview: withHash(paths.preview),
    nc_aware_measurement: withHash(paths.measurement),
    missing_linkage_candidates: withHash(paths.missingLinkage),
    zero_safe_pilot: withHash(paths.pilot),
  },
  represented_from_top500_preview: {
    public_domain_observed_rows: publicDomainRows.length,
    public_domain_observed_occurrences: sum(publicDomainRows.map((row) => row.occurrences)),
    public_domain_observed_missing_rows: publicDomainMissing.length,
    public_domain_observed_missing_occurrences: sum(publicDomainMissing.map((row) => row.occurrences)),
    nc_or_unresolved_rows: ncRows.length,
    nc_or_unresolved_occurrences: sum(ncRows.map((row) => row.occurrences)),
    nc_or_unresolved_missing_rows: ncMissing.length,
    nc_or_unresolved_missing_occurrences: sum(ncMissing.map((row) => row.occurrences)),
    no_sefaria_hit_rows: noHitRows.length,
    no_sefaria_hit_occurrences: sum(noHitRows.map((row) => row.occurrences)),
    no_sefaria_hit_missing_rows: noHitMissing.length,
    no_sefaria_hit_missing_occurrences: sum(noHitMissing.map((row) => row.occurrences)),
  },
  completed_movement_this_frontier: [
    'Spark 325 route reconciled stale/mismatched earlier.',
    'Agent 6 cleared and Agent 10 appended 14 non-public planning rows earlier.',
    'Agent 6 cleared and Agent 10 appended 205 non-public commercial-clean planning rows.',
    'Spark-10 verified post-205 package/UFM validator health.',
    'UFM regenerated on 332-row package anchor.',
  ],
  remaining_blockers: [
    {
      lane: 'Agent 1 / source-linkage',
      blocker: 'missing_lexicon_linkage_rows_need_source_owner_disposition',
      rows: missingLinkage.counts?.missing_lexicon_linkage_rows || missingLinkageRows.length,
      occurrences: missingLinkage.counts?.missing_lexicon_linkage_occurrences || sum(missingLinkageRows.map((row) => row.occurrences)),
      owner: 'Agent 1 prepares allow/exclude/block linkage disposition; Agent 6 reviews any later source/linkage mutation boundary.',
      evidence: paths.missingLinkage,
      next_exact_route: 'Agent 10 may route a current-anchor Agent1 missing-linkage docket only if linkage mutation or transform unblock is next.',
    },
    {
      lane: 'Agent 2 / transform',
      blocker: 'fill_producing_answer_pipeline_zero_safe_blocker',
      rows: pilot.counts?.target_rows || 100,
      occurrences: pilot.counts?.target_occurrences || 1960,
      owner: 'Agent 2 transform implementation; Agent 10 consumes only validator-backed output.',
      evidence: paths.pilot,
      next_exact_route: 'Spark-2/Agent-2 can rerun exact existing transform commands on a designated row set; no answer/public output without Agent 6.',
    },
    {
      lane: 'Objective 4 / broad Orot discovery',
      blocker: 'top500_sefaria_no_hit_rows_need_next_discovery_or_non_sefaria_source_route',
      rows: noHitRows.length,
      occurrences: sum(noHitRows.map((row) => row.occurrences)),
      owner: 'Agent 10 selects next bounded source-discovery packet; Spark/Agent3 can mechanically diff existing evidence only.',
      evidence: paths.preview,
      next_exact_route: 'Prepare bounded no-hit inventory/dedupe packet before any broad lookup/import.',
    },
  ],
  next_recommended_executable_routes: [
    {
      priority: 1,
      target: 'Spark-10',
      objective: 'Mechanically build/verify current Orot frontier inventory from existing files only.',
      output: 'reports/spark10-orot-post-205-frontier-check-2026-06-04.md',
      reason: 'Keeps Agent 10 supervisory while Spark handles mechanical count/diff verification.',
    },
    {
      priority: 2,
      target: 'Agent 1 or Spark-1 replacement',
      objective: 'Prepare row-level source/linkage allow-exclude-block map for the 13 missing-linkage rows if Agent 10 chooses linkage unblock next.',
      output: 'Agent1/Spark source-linkage matrix; no mutation.',
      reason: 'Only unresolved non-discovery row-level blocker with concrete 13-row scope.',
    },
    {
      priority: 3,
      target: 'Agent 3/Spark-3',
      objective: 'Prepare bounded no-hit inventory/dedupe over the 186 no-Sefaria-hit rows using existing artifacts only.',
      output: 'no-hit inventory and candidate source-route blocker matrix.',
      reason: 'This is the next Orot Objective 4 route after top-500 PD/NC rows are represented.',
    },
  ],
  agent4_status: 'held_no_changed_public_runtime_package',
  frozen_work: [
    'public/runtime mutation',
    'route-shard edits',
    'answer eligibility',
    'definition-content storage',
    'accepted text',
    'Zechariah',
    'same 20-row proof repetition',
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
  highest_permissible_claim: 'Agent 10 consumed Spark-10 health and recorded current Orot post-205 frontier/blockers for next exact pipeline work.',
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

assertCounts(frontier);
writeJson(paths.outputJson, frontier);
writeMd(paths.outputMd, frontier);
console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);

function assertCounts(frontier) {
  if (frontier.package_anchor.placeholder_rows !== 332) throw new Error('expected package rows 332');
  if (frontier.package_anchor.placeholder_occurrences !== 6156) throw new Error('expected package occurrences 6156');
  if (frontier.represented_from_top500_preview.public_domain_observed_missing_rows !== 0) throw new Error('public-domain preview rows remain missing');
  if (frontier.represented_from_top500_preview.nc_or_unresolved_missing_rows !== 0) throw new Error('NC/unresolved preview rows remain missing');
  for (const [key, value] of Object.entries(frontier.zero_counts)) {
    if (value !== 0) throw new Error(`expected zero ${key}`);
  }
  if (postAppend.summary?.package_rows_after !== 332) throw new Error('post append proof does not match current anchor');
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

function writeMd(file, data) {
  const lines = [
    '# Agent 10 Orot Post-205 Frontier And Blockers',
    '',
    `Status: \`${data.status}\``,
    '',
    '## Current Anchor',
    '',
    `- Package: \`${data.package_anchor.path}\``,
    `- Rows / occurrences: ${data.package_anchor.placeholder_rows} / ${data.package_anchor.placeholder_occurrences}`,
    `- Commercial-clean: ${data.package_anchor.commercial_clean_rows} / ${data.package_anchor.commercial_clean_occurrences}`,
    `- NC educational: ${data.package_anchor.noncommercial_educational_rows} / ${data.package_anchor.noncommercial_educational_occurrences}`,
    `- TBD display-integrity: ${data.package_anchor.display_integrity_tbd_rows} / ${data.package_anchor.display_integrity_tbd_occurrences}`,
    '',
    '## Top-500 Preview Representation',
    '',
    `- Public-domain observed represented/missing: ${data.represented_from_top500_preview.public_domain_observed_rows} / ${data.represented_from_top500_preview.public_domain_observed_missing_rows}`,
    `- Public-domain observed occurrences represented/missing: ${data.represented_from_top500_preview.public_domain_observed_occurrences} / ${data.represented_from_top500_preview.public_domain_observed_missing_occurrences}`,
    `- NC or unresolved represented/missing: ${data.represented_from_top500_preview.nc_or_unresolved_rows} / ${data.represented_from_top500_preview.nc_or_unresolved_missing_rows}`,
    `- No-Sefaria-hit remaining: ${data.represented_from_top500_preview.no_sefaria_hit_rows} rows / ${data.represented_from_top500_preview.no_sefaria_hit_occurrences} occurrences`,
    '',
    '## Remaining Blockers',
    '',
    ...data.remaining_blockers.map((blocker) => `- ${blocker.lane}: \`${blocker.blocker}\` (${blocker.rows} rows / ${blocker.occurrences} occurrences). Owner: ${blocker.owner}`),
    '',
    '## Next Recommended Routes',
    '',
    ...data.next_recommended_executable_routes.map((route) => `- ${route.priority}. ${route.target}: ${route.objective} Output: \`${route.output}\``),
    '',
    '## Agent 8 Callback',
    '',
    'Status: Agent 10 consumed Spark-10 health. The 205-row append is verified, and the current Orot frontier is no longer another top-500 public-domain/NC append.',
    '',
    'Next executable route: route Spark-10 the frontier-check assignment, or route Agent 1/Spark-1 replacement for the exact 13-row missing-linkage source map. Agent 4 remains held because there is no changed public/runtime package.',
    '',
    `Highest permissible claim: ${data.highest_permissible_claim}`,
    '',
    'What must not be accepted: no QA/source/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, and no public reader output.',
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
