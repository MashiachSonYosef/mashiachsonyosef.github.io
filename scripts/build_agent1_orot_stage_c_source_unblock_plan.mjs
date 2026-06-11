#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  sourceRowEvidence: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  sourceRowValidator: 'reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json',
  sourceRowEvidenceMd: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.md',
  sourceRowQueueCandidate: 'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.json',
  sourceRowQueueValidator: 'reports/agent1-orot-fill-source-row-queue-validator-result-2026-06-03.json',
  writerScript: 'scripts/write_lexical_payloads.mjs',
  readerHintsScript: '.codex-tmp/hud-deploy-live/scripts/build_public_hud_reader_hints.mjs',
  routePackageScript: '.codex-tmp/hud-deploy-live/scripts/build_public_hud_route_package.mjs',
  openscripturesLayer: 'data/lexical/source-layers/openscriptures-cc-by-4.json',
  wikidataLayer: 'data/lexical/source-layers/wikidata-cc0.json',
  orotManifest: 'data/lexical/orot.manifest.json',
  orotChunksDir: 'data/lexical/orot-chunks',
  outputJson: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.json',
  outputMd: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.md'
};

const TARGETS = [
  {
    entry_id: 'lex-aph-h639',
    incomplete_curated_row_id: 'curated|lex-aph-h639|source metadata incomplete'
  },
  {
    entry_id: 'lex-mashiach-h4899',
    incomplete_curated_row_id: 'curated|lex-mashiach-h4899|source metadata incomplete'
  },
  {
    entry_id: 'lex-ruach-h7307',
    incomplete_curated_row_id: 'curated|lex-ruach-h7307|source metadata incomplete'
  },
  {
    entry_id: 'lex-yhwh-h3068',
    incomplete_curated_row_id: 'curated|lex-yhwh-h3068|source metadata incomplete'
  }
];

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

const BOUNDARY = {
  publication_state: 'blocked_no_render',
  source_provenance_custody_claimed: false,
  source_provenance_acceptance_claimed: false,
  source_publication_claimed: false,
  source_file_tracking_approval_claimed: false,
  qa_acceptance_claimed: false,
  public_runtime_acceptance_claimed: false,
  route_publication_support_claimed: false,
  definition_authority_claimed: false,
  product_data_acceptance_claimed: false,
  usage_as_definition_authority_claimed: false,
  translation_output_claimed: false,
  accepted_translation_text_claimed: false
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pathExists(relativePath) {
  return fs.existsSync(fullPath(relativePath));
}

function scanDeployScript(relativePath) {
  const text = readText(relativePath);
  return {
    path: relativePath,
    exists: true,
    default_deny_entries: TARGETS.filter((target) => text.includes(`'${target.entry_id}'`)).map((target) => target.entry_id),
    has_generic_incomplete_curated_deny_needle: text.includes('curated|${entry}|source metadata incomplete'),
    has_denylist_output_scan_total: text.includes('denylist_output_scan_total'),
    has_denylist_proof: text.includes('denylist_proof'),
    has_denied_token_skip: text.includes('skippedDeniedToken'),
    has_denied_card_skip: text.includes('skippedDeniedCard') || text.includes('deniedCardCount')
  };
}

function scanWriterScript() {
  const text = readText(PATHS.writerScript);
  return {
    path: PATHS.writerScript,
    has_entry_source_keys: text.includes('function entrySourceKeys(entry)') && text.includes('source_row_keys'),
    has_fallback_source_row: text.includes('function fallbackSourceRow(entry)'),
    has_incomplete_metadata_license: text.includes("license: 'source metadata incomplete'"),
    has_add_fallback_source_rows: text.includes('function addFallbackSourceRows(sourceRows, entries)'),
    fallback_rows_selected_for_possible_entries: text.includes('const selectionSourceRows = addFallbackSourceRows(entry.source_rows || [], rawPossibleEntries)')
  };
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function renderMarkdown(plan) {
  const rows = plan.row_dispositions.map((row) => `| \`${row.entry_id}\` | \`${row.blocking_row}\` | ${row.chunk_entry_count} | ${row.token_occurrence_count} | \`${row.current_chunk_state}\` | ${row.clean_source_layer_rows_available} | \`${row.disposition}\` |`).join('\n');
  const sourceRowsClear = plan.status === 'source_rows_clear_awaiting_agent6_disposition';
  const regenerationBoundary = sourceRowsClear
    ? `## Current Clear-State Boundary

The current Orot chunk evidence has zero attached \`source metadata incomplete\` rows for the four target IDs and complete source rows attached. This is evidence for Agent 6 review only. It does not accept source/provenance custody, source/provenance acceptance, QA, publication readiness, route publication support, or runtime behavior.
`
    : `## Why Regeneration Alone Does Not Clear

\`${PATHS.writerScript}\` still contains fallback logic that can reconstruct source rows with \`license: source metadata incomplete\` from retained possible-entry metadata when complete \`source_row_keys\` are absent. Therefore plain Orot regeneration is not a clearance proof while all four incomplete curated rows remain attached in current Orot chunks.

Writer proof:

- fallback source row function present: ${plan.writer_fallback_proof.has_fallback_source_row}
- incomplete metadata license emitted by fallback: ${plan.writer_fallback_proof.has_incomplete_metadata_license}
- fallback rows added for possible entries: ${plan.writer_fallback_proof.has_add_fallback_source_rows}
- possible-entry fallback participates in source-row selection: ${plan.writer_fallback_proof.fallback_rows_selected_for_possible_entries}
`;
  const remainingBlockers = plan.remaining_blockers.length
    ? formatList(plan.remaining_blockers.map((blocker) => `\`${blocker.blocking_row}\`: ${blocker.reason}`))
    : '- none';

  return `# Agent 1 Orot Stage C Source Unblock Plan

Generated: ${plan.generated_at}

Status: \`${plan.status}\`

Highest permissible claim: source/provenance blocker evidence prepared for Orot Stage C route selection.

This artifact is source/provenance blocker-route evidence only. It does not claim runtime QA, publication readiness, source/provenance acceptance, source custody, Definition authority, usage-as-definition authority, accepted translation text, or route publication support.

## Task

Determine the smallest pipeline-only route to quarantine now or clear later for these Orot fill blocker rows:

${formatList(plan.target_rows.map((row) => `\`${row.incomplete_curated_row_id}\``))}

## Current Facts

- Existing Agent 1 Orot evidence validator OK: ${plan.current_facts.existing_orot_evidence_validator_ok}
- Existing Agent 1 Orot evidence status: \`${plan.current_facts.existing_orot_evidence_status}\`
- Target rows: ${plan.current_facts.target_count}
- Orot chunk entries containing target IDs: ${plan.current_facts.chunk_entry_count}
- Orot token occurrences affected: ${plan.current_facts.token_occurrence_count}
- Incomplete curated rows still attached in Orot chunks: ${plan.current_facts.incomplete_curated_rows_attached}
- Targets with expected clean source-layer rows available: ${plan.current_facts.targets_with_expected_clean_source_layer_row}
- Targets missing clean chunk attachment: ${plan.current_facts.targets_missing_clean_chunk_attachment}
- Route lookup shard hits for target IDs/source rows: ${plan.current_facts.route_lookup_shard_hit_count}

## Row Disposition

| entry | blocker row | chunk entries | token occurrences | current chunk state | clean source-layer rows available | disposition |
|---|---|---:|---:|---|---:|---|
${rows}

${regenerationBoundary}

## Smallest Safe Route

Immediate quarantine route:

- Status: \`${plan.immediate_quarantine_route.status}\`
- Evidence basis: static script denylist proof only; output proof still required before release-owner use.
- Required future proof before use: \`${plan.immediate_quarantine_route.required_future_proof}\`
- Reader hints script: \`${plan.immediate_quarantine_route.reader_hints_script.path}\`
- Route package script: \`${plan.immediate_quarantine_route.route_package_script.path}\`

Clearance route:

- Status: \`${plan.clearance_route.status}\`
- Required owner action: ${plan.clearance_route.required_owner_action}
- Required validation: ${plan.clearance_route.required_validation}

## Remaining Blockers

${remainingBlockers}

## Agent 1 Direction

- Keep the four target rows denied from public Orot reader hints and public route-package output until denylist output scans prove zero target/incomplete-row hits.
- Treat any clearance attempt as blocked until a bounded pipeline rule suppresses incomplete curated fallback rows and attaches complete source-layer rows.
- Route formal source/provenance-sensitive disposition to Agent 6 if these rows are used for Orot fill expansion or clearance.

## Evidence Inspected

${formatList(plan.evidence_inspected.map((item) => `\`${item}\``))}

## Not Accepted

${formatList(plan.must_not_accept)}

## Agent 8 Callback

- status: Orot Stage C source-unblock plan prepared as validator-backed source/provenance blocker-route evidence
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${sourceRowsClear ? 'no attached incomplete curated Orot rows in current chunks; Agent 6/owner disposition still required before custody/publication reliance' : 'four incomplete curated Orot rows remain attached; quarantine requires future denylist output scan proof; clearance requires a future bounded pipeline rule and Agent 6-sensitive review'}
- next action needed: Agent 10/release owner can run denylist output proof if Orot public package use is needed; Agent 6 can docket formal source/provenance disposition if requested
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, runtime validation, regeneration, filtering, or custody acceptance
`;
}

function main() {
  const evidence = readJson(PATHS.sourceRowEvidence);
  const validator = readJson(PATHS.sourceRowValidator);
  assert(evidence.artifact_type === 'agent1_orot_fill_source_row_evidence', 'unexpected Orot evidence artifact type');
  assert(['block', 'pipeline_source_rows_clear'].includes(evidence.status), 'Orot evidence status must be a known review state');
  assert(validator.ok === true, 'Orot evidence validator must be ok');
  const sourceRowsClear = evidence.status === 'pipeline_source_rows_clear';

  const readerHintsScript = scanDeployScript(PATHS.readerHintsScript);
  const routePackageScript = scanDeployScript(PATHS.routePackageScript);
  const writerProof = scanWriterScript();
  const targetRows = TARGETS.map((target) => {
    const current = evidence.targets.find((item) => item.entry_id === target.entry_id);
    assert(current, `missing Orot evidence target: ${target.entry_id}`);
    const currentChunkState = current.exact_incomplete_curated_row_present
      ? (
          current.chunk_clean_attachment_status === 'clean_source_row_not_attached_to_orot_chunk_entry'
            ? 'incomplete_curated_row_attached_no_clean_chunk_attachment'
            : 'incomplete_curated_row_attached_clean_rows_also_attached_or_nearby'
        )
      : 'clean_source_row_attached_no_incomplete_curated_row';
    const canBeClearedWithCurrentPipeline = sourceRowsClear &&
      current.exact_incomplete_curated_row_present === false &&
      current.expected_clean_source_layer_row_count > 0 &&
      current.chunk_clean_attachment_status === 'clean_source_row_attached_no_incomplete_curated_row';
    return {
      entry_id: target.entry_id,
      incomplete_curated_row_id: target.incomplete_curated_row_id,
      chunk_entry_count: current.chunk_entry_count,
      token_occurrence_count: current.token_occurrence_count,
      current_chunk_state: currentChunkState,
      clean_source_layer_rows_available: current.expected_clean_source_layer_row_count,
      clean_chunk_attachment_status: current.chunk_clean_attachment_status,
      exact_incomplete_curated_row_present: current.exact_incomplete_curated_row_present,
      can_be_cleared_with_current_pipeline_unchanged: canBeClearedWithCurrentPipeline,
      can_be_quarantined_now_after_output_scan_proof: true
    };
  });

  const plan = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_orot_stage_c_source_unblock_plan',
    status: sourceRowsClear ? 'source_rows_clear_awaiting_agent6_disposition' : 'quarantine_now_clear_after_pipeline_rule_change',
    highest_permissible_claim: sourceRowsClear
      ? 'Orot source-row clear-state evidence prepared; no source/provenance acceptance claimed'
      : 'source/provenance blocker evidence prepared for Orot Stage C route selection',
    target_rows: targetRows,
    evidence_inspected: [
      PATHS.sourceRowEvidenceMd,
      PATHS.sourceRowEvidence,
      PATHS.sourceRowValidator,
      PATHS.sourceRowQueueCandidate,
      PATHS.sourceRowQueueValidator,
      PATHS.writerScript,
      PATHS.readerHintsScript,
      PATHS.routePackageScript,
      PATHS.openscripturesLayer,
      PATHS.wikidataLayer,
      PATHS.orotManifest,
      `${PATHS.orotChunksDir}/*.json`
    ],
    current_facts: {
      existing_orot_evidence_validator_ok: validator.ok,
      existing_orot_evidence_status: evidence.status,
      ...evidence.summary
    },
    row_dispositions: targetRows.map((target) => ({
      entry_id: target.entry_id,
      blocking_row: target.incomplete_curated_row_id,
      chunk_entry_count: target.chunk_entry_count,
      token_occurrence_count: target.token_occurrence_count,
      current_chunk_state: target.current_chunk_state,
      clean_source_layer_rows_available: target.clean_source_layer_rows_available,
      can_be_cleared_with_current_pipeline_unchanged: target.can_be_cleared_with_current_pipeline_unchanged,
      can_be_quarantined_now_after_output_scan_proof: target.can_be_quarantined_now_after_output_scan_proof,
      disposition: target.can_be_cleared_with_current_pipeline_unchanged
        ? 'source_rows_clear_awaiting_agent6_disposition'
        : 'quarantine_now_clear_after_pipeline_rule_change'
    })),
    writer_fallback_proof: writerProof,
    deploy_denylist_static_proof: {
      reader_hints_script: readerHintsScript,
      route_package_script: routePackageScript,
      default_deny_entries_match_targets: readerHintsScript.default_deny_entries.length === TARGETS.length &&
        routePackageScript.default_deny_entries.length === TARGETS.length,
      output_scan_total_required_before_release_owner_use: true
    },
    immediate_quarantine_route: {
      status: sourceRowsClear
        ? 'not_required_for_current_clear_chunks_but_available_as_release_safety'
        : 'recommended_but_requires_output_scan_proof_before_release_owner_use',
      required_future_proof: 'denylist_output_scan_total: 0 for reader hints and route package outputs',
      reader_hints_script: readerHintsScript,
      route_package_script: routePackageScript,
      release_owner_boundary: 'Agent 1 provides source/provenance blocker evidence only; Agent 10 remains release owner for public package use.'
    },
    clearance_route: {
      status: sourceRowsClear
        ? 'current_chunks_clear_requires_agent6_disposition_before_release'
        : 'blocked_until_pipeline_rule_change_and_followup_validation',
      required_owner_action: sourceRowsClear
        ? 'Agent 6/owner disposition is still required before treating this clear-state evidence as release or custody clearance'
        : 'add a bounded pipeline rule that suppresses incomplete curated fallback rows for the four target entry IDs when complete source-layer rows are available',
      required_validation: sourceRowsClear
        ? 'current validator proof must remain zero attached source metadata incomplete rows for the four target IDs and complete replacement source rows from source layers'
        : 'future clearance validator must prove zero attached source metadata incomplete rows for the four target IDs and complete replacement source rows from source layers',
      current_clearance_claimed: false
    },
    remaining_blockers: sourceRowsClear
      ? []
      : targetRows.map((target) => ({
          entry_id: target.entry_id,
          blocking_row: target.incomplete_curated_row_id,
          reason: 'Exact incomplete curated source row remains attached to current Orot chunk evidence.'
        })),
    owner_decisions_needed: [
      {
        owner: 'Agent 10 / release owner',
        decision: 'whether to run public reader-hint and route-package denylist output proof before any Orot public-package use'
      },
      {
        owner: 'pipeline owner / Agent 10 release support',
        decision: 'whether to implement bounded source-row remap/filter rule for future clearance'
      },
      {
        owner: 'Agent 6',
        decision: 'formal pass/warn/block disposition if quarantine proof or future clearance proof is docketed'
      }
    ],
    boundary: BOUNDARY,
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, plan);
  writeText(PATHS.outputMd, renderMarkdown(plan));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: plan.status,
    target_count: plan.current_facts.target_count,
    incomplete_curated_rows_attached: plan.current_facts.incomplete_curated_rows_attached,
    immediate_quarantine_route_status: plan.immediate_quarantine_route.status,
    clearance_route_status: plan.clearance_route.status
  }, null, 2));
}

main();
