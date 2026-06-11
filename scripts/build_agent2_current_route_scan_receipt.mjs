#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-current-route-scan-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-current-route-scan-receipt-2026-06-04.md';

const latestAgent10Agent2Rows = collectReports([
  /^agent10-agent2-.*2026-06-04\.(json|md)$/,
], 10);
const latestAgent2WorksetRows = collectReports([
  /^agent2-.*workset.*2026-06-04\.(json|md)$/,
  /^agent10-agent2-ready-.*workset.*2026-06-04\.(json|md)$/,
], 10);
const latestAgent2RouteRows = collectReports([
  /^agent2-.*route.*2026-06-04\.(json|md)$/,
  /^agent10-agent2-.*route.*2026-06-04\.(json|md)$/,
], 10);
const latestHandoffBundleRows = collectReports([
  /^agent2-.*handoff.*bundle.*2026-06-04\.(json|md)$/,
], 10);

const consumptionPath = 'reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.json';
const consumption = fs.existsSync(path.join(root, consumptionPath)) ? readJson(consumptionPath) : null;

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_current_route_scan_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  scan_status: 'no_new_agent2_exact_workset_found',
  scan_scope: [
    'reports/*agent10*agent2*2026-06-04*',
    'reports/*agent2*workset*2026-06-04*',
    'reports/*agent2*route*2026-06-04*',
    'reports/*agent2*handoff*bundle*2026-06-04*',
  ],
  latest_agent10_agent2_route_rows: prioritize(latestAgent10Agent2Rows, [
    consumptionPath.replace(/\.json$/, '.md'),
    consumptionPath,
  ]),
  latest_agent2_workset_rows: latestAgent2WorksetRows,
  latest_agent2_route_rows: latestAgent2RouteRows,
  latest_handoff_bundle_rows: latestHandoffBundleRows,
  latest_agent10_agent2_consumption: consumption ? {
    path: consumptionPath,
    status: consumption.status,
    candidate_rows: consumption.agent2_summary?.candidate_rows,
    candidate_occurrences: consumption.agent2_summary?.candidate_occurrences,
    unmatched_rows: consumption.agent2_summary?.unmatched_rows,
    agent6_route_needed_now: consumption.release_owner_decision?.agent6_route_needed_now,
    changed_evidence_required_before_rerun: String(consumption.release_owner_decision?.next_action || '').includes('changed source-family/linkage/dictionary evidence'),
  } : null,
  scan_caveat: consumption
    ? 'A newer Agent10-Agent2 Orot zero-candidate consumption artifact exists, but it names no changed Agent2 workset; no newer executable Agent2 workset was observed in targeted result sets.'
    : 'No newer executable Agent2 workset was observed in targeted result sets.',
  current_exact_blocker: 'no_new_agent2_exact_workset_after_deuteronomy_return',
  current_handoff_bundle: 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
  zero_boundary: {
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligible: false,
    accepted_gloss_text: false,
    public_reader_output: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    publication_readiness: false,
    source_license_acceptance: false,
    qa_acceptance: false,
  },
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function collectReports(patterns, limit) {
  return fs.readdirSync(path.join(root, 'reports'))
    .filter((name) => patterns.some((pattern) => pattern.test(name)))
    .map((name) => {
      const relativePath = `reports/${name}`;
      const stat = fs.statSync(path.join(root, relativePath));
      return { relativePath, mtimeMs: stat.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs || a.relativePath.localeCompare(b.relativePath))
    .slice(0, limit)
    .map((entry) => entry.relativePath);
}

function prioritize(rows, preferred) {
  const out = [];
  for (const row of preferred) {
    if (fs.existsSync(path.join(root, row)) && !out.includes(row)) out.push(row);
  }
  for (const row of rows) {
    if (!out.includes(row)) out.push(row);
  }
  return out;
}

function assertReceipt(receipt) {
  if (!receipt.latest_agent10_agent2_route_rows.includes('reports/agent10-agent2-deuteronomy-phase2-transform-readiness-route-2026-06-04.md')) {
    throw new Error('expected Deuteronomy route in Agent10-Agent2 rows');
  }
  if (!receipt.latest_agent2_workset_rows.includes('reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json')) {
    throw new Error('expected next-workset blocker in Agent2 workset rows');
  }
  if (!receipt.latest_handoff_bundle_rows.includes('reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json')) {
    throw new Error('expected current handoff bundle in handoff rows');
  }
  if (receipt.latest_agent10_agent2_consumption) {
    const c = receipt.latest_agent10_agent2_consumption;
    if (c.candidate_rows !== 0 || c.candidate_occurrences !== 0 || c.unmatched_rows !== 168 || c.agent6_route_needed_now !== false || c.changed_evidence_required_before_rerun !== true) {
      throw new Error('unexpected Orot zero-candidate consumption summary');
    }
  }
  for (const value of Object.values(receipt.zero_boundary)) {
    if (value !== false) throw new Error('zero boundary must remain false');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, receipt) {
  const lines = [
    '# Agent 2 Current Route Scan Receipt - 2026-06-04',
    '',
    '## Status',
    '',
    'Targeted current-route scan found no newer exact Agent 2 workset beyond the already-returned Deuteronomy Phase-2 route.',
    receipt.latest_agent10_agent2_consumption ? 'The newer Agent10 Orot zero-candidate consumption artifact was observed, but it names no changed Agent 2 workset.' : '',
    '',
    '## Scan Scope',
    '',
    ...receipt.scan_scope.map((item) => `- \`${item}\``),
    '',
    '## Latest Rows Observed',
    '',
    ...[
      ...receipt.latest_agent10_agent2_route_rows,
      ...receipt.latest_agent2_workset_rows,
      ...receipt.latest_handoff_bundle_rows,
    ].filter((value, index, array) => array.indexOf(value) === index).map((item) => `- \`${item}\``),
    '',
    '## Caveat',
    '',
    receipt.scan_caveat,
    '',
    '## Current Blocker',
    '',
    `\`${receipt.current_exact_blocker}\``,
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, publication readiness, source/license acceptance, or QA acceptance is claimed.',
    '',
  ].filter((line) => line !== null);
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
