import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  sourceRowEvidence: 'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json',
  sourceRowEvidenceMd: 'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.md',
  sourceRowValidator: 'reports/agent1-wartime-public-hud-source-row-evidence-validator-result-2026-06-03.json',
  blockerMap: 'reports/agent1-wartime-source-provenance-surface-blocker-map-2026-06-02.md',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.json',
  outputMd: 'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md'
};

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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  for (const key of [
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function main() {
  const evidence = readJson(PATHS.sourceRowEvidence);
  const validator = readJson(PATHS.sourceRowValidator);

  assert(evidence.artifact_type === 'agent1_wartime_public_hud_source_row_evidence', 'unexpected source-row evidence type');
  assert(validator.ok === true, 'source-row evidence validator must pass');
  assertBoundary(evidence.boundary);
  assert(evidence.summary.surfaces_checked === 5, 'expected five surfaces');
  assert(evidence.summary.endpoint_count === 20, 'expected 20 endpoints');
  assert(evidence.summary.endpoint_ok_count === 20, 'expected 20 OK endpoints');
  assert(evidence.summary.route_card_count_extracted > 0, 'expected positive route-card count');
  assert(evidence.summary.source_row_count_extracted > 0, 'expected positive source/license row count');
  assert(evidence.summary.missing_source_row_field_count === 0, 'expected zero missing source/license fields');

  const requestedQueueItem = {
    request_id: 'agent6-agent1-public-hud-source-row-review',
    submitted_by: 'Agent 5',
    agent1_evidence_origin: 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
    gate: 'source_provenance_custody_gate/public_hud_route_card_source_row_gate',
    scope: 'Candidate public reader surfaces #1-#5 public-HUD route-card source/license rows from bounded live JSON endpoints',
    status: 'candidate_for_agent5_queue_relay_awaiting_agent6_review',
    priority: 0,
    evidence_artifacts: [
      PATHS.sourceRowEvidenceMd,
      PATHS.sourceRowEvidence,
      PATHS.sourceRowValidator,
      PATHS.blockerMap,
      PATHS.agent1State,
      'scripts/build_agent1_wartime_public_hud_source_row_evidence.mjs',
      'scripts/validate_agent1_wartime_public_hud_source_row_evidence.mjs',
      'scripts/build_agent1_wartime_public_hud_source_row_queue_candidate.mjs'
    ],
    requested_verdict: 'pass_warn_block_public_hud_source_row_evidence_only',
    claimed_boundary: 'Agent 1 produced bounded public-HUD route-card source/license row evidence for candidate public reader surfaces #1-#5. This is source/provenance blocker evidence only. It is not source/provenance custody, source/provenance acceptance, source publication, source-file tracking approval, QA acceptance, public/runtime acceptance, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, or accepted translation text. Publication remains blocked_no_render.',
    known_risks: [
      'The packet uses live public-HUD JSON endpoints, so it records current source-row evidence and can drift after fetch time.',
      'Exodus and Leviticus current live JSON was HTTP 200 in the evidence packet even though older local prep reports recorded 404; that drift needs Agent 6 or Agent 7 interpretation before any runtime/publication claim.',
      'Visible source/license rows do not clear the separate 23 untracked source-file tracking review or six modified tracked license-normalization review.',
      'Agent 1 evidence and this queue candidate are not Agent 6 acceptance.'
    ],
    what_changed_since_last_agent6_ruling: `No Agent 6 ruling was observed for this public-HUD source-row evidence. Since the prior blocker map, Agent 1 fetched bounded live JSON for five surfaces and extracted ${evidence.summary.route_card_count_extracted} route cards and ${evidence.summary.source_row_count_extracted} source/license rows with ${evidence.summary.missing_source_row_field_count} missing required source/license fields.`,
    what_must_not_be_accepted: MUST_NOT_ACCEPT,
    next_agent6_action: 'Issue a dated pass/warn/block verdict on the public-HUD source-row evidence only, preserving all runtime/publication/source-custody boundaries unless explicitly narrowed by Agent 6.'
  };

  const candidate = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_wartime_public_hud_source_row_queue_candidate',
    requested_queue_item: requestedQueueItem,
    current_evidence_summary: evidence.summary,
    current_evidence_boundary: evidence.boundary,
    surfaces: evidence.surfaces.map((surface) => ({
      ordinal: surface.ordinal,
      work_id: surface.work_id,
      route: surface.route,
      route_shard_path: surface.route_shard.path,
      route_card_count_extracted: surface.route_card_count_extracted,
      source_row_count_extracted: surface.source_row_count_extracted,
      missing_source_row_field_count: surface.missing_source_row_field_count,
      unique_licenses: surface.unique_licenses,
      local_status_evidence: surface.local_status_evidence
    })),
    boundary: evidence.boundary
  };

  writeJson(PATHS.outputJson, candidate);
  writeText(PATHS.outputMd, `# Agent 1 Wartime Public-HUD Source Row Queue Candidate

Generated: ${candidate.generated_at}

Boundary: candidate for Agent 5 relay / Agent 6 review only. This does not mutate the validation queue, stage files, commit, render, publish, run browser/runtime validation, or claim source/provenance acceptance.

## Requested Queue Item

- Request ID: \`${requestedQueueItem.request_id}\`
- Gate: \`${requestedQueueItem.gate}\`
- Status: \`${requestedQueueItem.status}\`
- Requested verdict: \`${requestedQueueItem.requested_verdict}\`

## Current Evidence Summary

- Surfaces checked: ${evidence.summary.surfaces_checked}
- JSON endpoints checked: ${evidence.summary.endpoint_count}
- JSON endpoints OK: ${evidence.summary.endpoint_ok_count}
- Route cards extracted: ${evidence.summary.route_card_count_extracted}
- Source/license rows extracted: ${evidence.summary.source_row_count_extracted}
- Missing required source/license fields: ${evidence.summary.missing_source_row_field_count}
- Unique source labels: ${evidence.summary.unique_sources.map((value) => `\`${value}\``).join(', ')}
- Unique licenses: ${evidence.summary.unique_licenses.map((value) => `\`${value}\``).join(', ')}

## Surfaces

${candidate.surfaces.map((surface) => `- #${surface.ordinal} \`${surface.route}\`: ${surface.route_card_count_extracted} route cards, ${surface.source_row_count_extracted} source/license rows, ${surface.missing_source_row_field_count} missing source/license fields, shard \`${surface.route_shard_path}\``).join('\n')}

## Evidence Artifacts

${formatList(requestedQueueItem.evidence_artifacts)}

## Known Risks

${formatList(requestedQueueItem.known_risks)}

## Must Not Be Accepted

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: public-HUD source-row queue candidate produced; evidence-ready / awaiting-Agent-6 only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: Agent 6 has not docketed this source-row evidence; source/provenance custody remains unresolved; runtime/publication status is out of Agent 1 scope
- next action needed: Agent 5/Agent 8 may relay \`${requestedQueueItem.request_id}\` to Agent 6 if the active public-reader slice needs source/provenance-sensitive row review
- continue condition: continue without render, staging, commit, publication, runtime validation, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    requested_queue_item: requestedQueueItem.request_id,
    summary: evidence.summary
  }, null, 2));
}

main();
