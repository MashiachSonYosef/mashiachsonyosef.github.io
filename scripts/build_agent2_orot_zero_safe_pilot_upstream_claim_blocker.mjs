import fs from 'node:fs';
import path from 'node:path';

const inputPath = 'reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-04.json';
const outputJson = 'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json';
const outputMd = 'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.md';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const docket = readJson(inputPath);
const summary = docket.summary || {};
const blockerCounts = docket.blocker_counts || {};

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_orot_zero_safe_pilot_upstream_claim_blocker',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  workset: 'agent10_agent2_ready_orot_zero_safe_pilot_docket',
  status: 'exact_blocker_no_safe_upstream_definition_route_claim_generator',
  input: inputPath,
  target: 'Orot top-100 no-arbitration pilot follow-up',
  files: {
    input: inputPath,
    output_json: outputJson,
    output_md: outputMd,
    builder: 'scripts/build_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs',
    validator: 'scripts/validate_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs'
  },
  counts: {
    target_rows: summary.target_rows,
    target_occurrences: summary.target_occurrences,
    source_clean_rows: summary.source_clean_rows,
    source_blocked_rows: summary.source_blocked_rows,
    rows_with_exact_upstream_claim: summary.rows_with_exact_upstream_claim,
    route_cards: summary.route_cards,
    route_answer_cards: summary.route_answer_cards,
    route_phrase_evidence_cards: summary.route_phrase_evidence_cards,
    route_citable_evidence_cards: summary.route_citable_evidence_cards,
    emitted_answer_rows: summary.emitted_answer_rows,
    blocked_rows: summary.blocked_rows,
    missing_exact_upstream_definition_claim: blockerCounts.missing_exact_upstream_definition_claim,
    missing_lexicon_entry_id: blockerCounts.missing_lexicon_entry_id,
    missing_orot_lexicon_entry: blockerCounts.missing_orot_lexicon_entry,
    missing_orot_source_rows: blockerCounts.missing_orot_source_rows
  },
  lane_split: {
    source_clean_consider_rows: summary.source_clean_rows,
    source_linkage_blocked_rows: summary.source_blocked_rows,
    noncommercial_educational_candidate_rows_consumed: 0,
    unclassified_rows_consumed_as_candidate_text: 0
  },
  transform_candidate_counts: {
    upstream_claim_generator_rows: 0,
    definition_route_claim_rows: 0,
    reader_hint_candidate_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0
  },
  blocker: {
    exact_blocker: 'missing_machine_checkable_upstream_definition_route_claim_rejoin_morphology_homograph_gates',
    missing_fields: [
      'exact upstream definition-route claim per row',
      'machine-checkable source-claim rejoin gate',
      'machine-checkable morphology safety gate',
      'machine-checkable homograph safety gate',
      'Agent 1 source/linkage disposition for 13 source-blocked rows',
      'Agent 6 exact row/subset boundary before any transform/display/source/license/Definition/public/runtime/answer use'
    ],
    reason: 'Current route cards are evidence/form references, not answer cards, and the pilot has 0 rows with exact upstream claims.'
  },
  zero_emission_counters: {
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    accepted_text_rows: 0,
    public_reader_output_rows: 0
  },
  validator: 'node scripts/validate_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json',
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Return this exact blocker until a changed workset supplies exact upstream claims plus source-claim rejoin, morphology, and homograph gates.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'candidate-text export',
    'NC commercial authorization'
  ]
};

if (artifact.counts.target_rows !== 100) throw new Error('target row count mismatch');
if (artifact.counts.source_clean_rows !== 87) throw new Error('source-clean row count mismatch');
if (artifact.counts.source_blocked_rows !== 13) throw new Error('source-blocked row count mismatch');
if (artifact.counts.rows_with_exact_upstream_claim !== 0) throw new Error('unexpected upstream claim rows');
if (artifact.counts.route_answer_cards !== 0) throw new Error('unexpected route answer cards');
if (artifact.transform_candidate_counts.answer_rows !== 0) throw new Error('answer rows must remain zero');

ensureDir(outputJson);
fs.writeFileSync(outputJson, `${JSON.stringify(artifact, null, 2)}\n`);

const md = [
  '# Agent 2 Orot Zero-Safe Pilot Upstream Claim Blocker - 2026-06-04',
  '',
  `Status: ${artifact.status}.`,
  '',
  '## Required Task Shape',
  `- Target: ${artifact.target}.`,
  `- Files: input ${inputPath}; output ${outputJson}; validator ${artifact.files.validator}.`,
  '- Command/script: `node scripts/build_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs`.',
  `- Output artifact: ${outputJson}.`,
  `- Schema/counts: ${artifact.counts.target_rows} target rows / ${artifact.counts.target_occurrences} occurrences; ${artifact.counts.source_clean_rows} source-clean rows; ${artifact.counts.source_blocked_rows} source-blocked rows; ${artifact.counts.rows_with_exact_upstream_claim} exact upstream claims; ${artifact.counts.route_answer_cards} route answer cards.`,
  `- Validator: \`${artifact.validator}\`.`,
  `- Missing-field blocker: ${artifact.blocker.exact_blocker}.`,
  `- Handoff owner: ${artifact.handoff_owner}.`,
  `- Stop condition: ${artifact.stop_condition}`,
  '',
  '## Zero Boundary',
  '- Public HUD rows, route JSONL rows, route shard writes, definition content rows, candidate-text export rows, answer rows, answer-eligible rows, accepted text rows, and public reader output rows are all 0.',
  '- This is nonpublic planning evidence only and does not accept Definition authority, answer eligibility, source/license status, accepted text, runtime/public output, or publication readiness.',
  '',
  '## Blocker',
  '- Current route cards are evidence/form references, not answer cards.',
  '- No safe upstream definition-route claim generator can run until exact source-claim rejoin, morphology safety, and homograph safety gates exist.',
  '- The 13 source-blocked rows require Agent 1 source/linkage disposition before any later Agent 2 consideration.'
].join('\n');

fs.writeFileSync(outputMd, `${md}\n`);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);
