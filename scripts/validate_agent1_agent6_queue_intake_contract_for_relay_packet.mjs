#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  queue: 'data/control/agent6_validation_queue.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  docket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  resultJson: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.md'
};

const REQUIRED_NO_ACCEPTANCE_TERMS = [
  'source/provenance custody',
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

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
].sort((a, b) => a.localeCompare(b));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected) {
  const left = sorted(actual);
  const right = sorted(expected);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
}

function assertBoundary(boundary, findings) {
  if (boundary?.publication_state !== 'blocked_no_render') {
    findings.push({
      severity: 'block',
      request_id: '(relay packet)',
      field: 'boundary.publication_state',
      message: `expected blocked_no_render, got ${boundary?.publication_state || 'missing'}`
    });
  }

  for (const key of [
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'downstream_direct_artifact_acceptance_claimed',
    'downstream_content_reference_acceptance_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    if (boundary?.[key] !== false) {
      findings.push({
        severity: 'block',
        request_id: '(relay packet)',
        field: `boundary.${key}`,
        message: `expected false, got ${String(boundary?.[key])}`
      });
    }
  }
}

function validateEvidenceArtifacts(item, findings) {
  if (!Array.isArray(item.evidence_artifacts) || item.evidence_artifacts.length === 0) {
    findings.push({
      severity: 'block',
      request_id: item.request_id || '(missing request_id)',
      field: 'evidence_artifacts',
      message: 'missing or empty evidence_artifacts array'
    });
    return;
  }

  for (const artifact of item.evidence_artifacts) {
    if (!fs.existsSync(path.join(repoRoot, artifact))) {
      findings.push({
        severity: 'block',
        request_id: item.request_id,
        field: 'evidence_artifacts',
        message: `missing evidence artifact: ${artifact}`
      });
    }
  }
}

function validateNoAcceptanceTerms(item, findings) {
  const terms = item.what_must_not_be_accepted || [];
  for (const term of REQUIRED_NO_ACCEPTANCE_TERMS) {
    if (!terms.includes(term)) {
      findings.push({
        severity: 'block',
        request_id: item.request_id,
        field: 'what_must_not_be_accepted',
        message: `missing required no-acceptance term: ${term}`
      });
    }
  }
}

function validateQueueItem(item, rules, findings) {
  const requestId = item.request_id || '(missing request_id)';

  for (const field of rules.required_request_fields || []) {
    if (!hasValue(item[field])) {
      findings.push({
        severity: 'block',
        request_id: requestId,
        field,
        message: 'missing required Agent 6 intake field'
      });
    }
  }

  if (!(rules.allowed_submitters || []).includes(item.submitted_by)) {
    findings.push({
      severity: 'block',
      request_id: requestId,
      field: 'submitted_by',
      message: `submitter ${item.submitted_by || 'missing'} is not in allowed submitters: ${(rules.allowed_submitters || []).join(', ')}`
    });
  }

  if (item.agent1_evidence_origin !== 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review') {
    findings.push({
      severity: 'block',
      request_id: requestId,
      field: 'agent1_evidence_origin',
      message: 'missing Agent 1 evidence-origin provenance field'
    });
  }

  if (item.what_changed_since_prior_blocker_map !== undefined) {
    findings.push({
      severity: 'block',
      request_id: requestId,
      field: 'what_changed_since_prior_blocker_map',
      message: 'legacy field must not replace what_changed_since_last_agent6_ruling'
    });
  }

  if (String(item.status || '') !== 'candidate_for_agent5_queue_relay_awaiting_agent6_review') {
    findings.push({
      severity: 'block',
      request_id: requestId,
      field: 'status',
      message: `unexpected status: ${item.status || 'missing'}`
    });
  }

  const requestedVerdict = String(item.requested_verdict || '').toLowerCase();
  if (requestedVerdict.includes('accept') || requestedVerdict.includes('publication_readiness')) {
    findings.push({
      severity: 'block',
      request_id: requestId,
      field: 'requested_verdict',
      message: `requested verdict contains forbidden acceptance/readiness wording: ${item.requested_verdict}`
    });
  }

  validateEvidenceArtifacts(item, findings);
  validateNoAcceptanceTerms(item, findings);
}

function renderMarkdown(result) {
  const lines = [
    '# Agent 1 / Agent 6 Queue Intake Contract Validator',
    '',
    `Generated: ${result.completed_at}`,
    '',
    'Highest permissible claim: source/provenance blocker evidence prepared for candidate public reader surfaces and related Agent 1 custody follow-up packets.',
    '',
    'This validator does not mutate `data/control/agent6_validation_queue.json`, stage files, commit, render, publish, run browser/runtime validation, or claim Agent 6 acceptance.',
    '',
    '## Summary',
    '',
    `- OK: ${result.ok ? 'true' : 'false'}`,
    `- Relay packet: \`${PATHS.relayPacket}\``,
    `- Intake contract source: \`${PATHS.queue}\``,
    `- Candidate queue items checked: ${result.queue_items_checked}`,
    `- Blocking findings: ${result.blocking_findings}`,
    `- Publication state: ${result.publication_state}`,
    `- Queue mutation performed: ${result.queue_mutation_performed}`,
    '',
    '## Request IDs',
    '',
    ...result.request_ids.map((requestId) => `- \`${requestId}\``),
    '',
    '## Findings',
    ''
  ];

  if (result.findings.length === 0) {
    lines.push('- No blocking intake-contract findings in the relay packet queue items.');
  } else {
    for (const finding of result.findings) {
      lines.push(`- ${finding.severity.toUpperCase()} \`${finding.request_id}\` ${finding.field}: ${finding.message}`);
    }
  }

  lines.push(
    '',
    '## Agent 8 Callback',
    '',
    `- status: ${result.ok ? 'relay packet queue items satisfy Agent 6 intake-field contract; evidence-ready / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only' : 'relay packet queue items have intake-contract blockers; evidence not relay-ready until fixed'}`,
    `- artifact: \`${PATHS.resultMd}\``,
    `- machine artifact: \`${PATHS.resultJson}\``,
    `- blockers: ${result.ok ? `${result.request_ids.length} request IDs remain absent from checked control surfaces; Agent 6 has not docketed or accepted these requests` : `${result.blocking_findings} intake-contract blocker(s) remain`}`,
    '- next action needed: Agent 5/Agent 8 may relay the queue items only if authorized, preserving boundaries and avoiding any acceptance claim',
    '- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance',
    ''
  );

  return lines.join('\n');
}

function main() {
  const startedAt = new Date().toISOString();
  const queue = readJson(PATHS.queue);
  const relayPacket = readJson(PATHS.relayPacket);
  const docket = readJson(PATHS.docket);
  const findings = [];

  const rules = queue.intake_rules || {};
  const queueItems = relayPacket.requested_agent5_action?.queue_items || [];
  const requestIds = sorted(queueItems.map((item) => item.request_id).filter(Boolean));
  const docketRequestIds = sorted((docket.review_items || []).map((item) => item.request_id));

  if (queue.publication_global_status !== 'blocked_no_render') {
    findings.push({
      severity: 'block',
      request_id: '(queue contract)',
      field: 'publication_global_status',
      message: `expected blocked_no_render, got ${queue.publication_global_status || 'missing'}`
    });
  }

  if (!sameSet(requestIds, EXPECTED_REQUEST_IDS)) {
    findings.push({
      severity: 'block',
      request_id: '(relay packet)',
      field: 'request_ids',
      message: `request IDs do not match expected Agent 1 set: ${requestIds.join(', ')}`
    });
  }

  if (!sameSet(requestIds, sorted(relayPacket.request_ids || []))) {
    findings.push({
      severity: 'block',
      request_id: '(relay packet)',
      field: 'request_ids',
      message: 'requested_agent5_action.queue_items request IDs do not match relay packet request_ids'
    });
  }

  if (!sameSet(requestIds, docketRequestIds)) {
    findings.push({
      severity: 'block',
      request_id: '(docket)',
      field: 'review_items',
      message: 'relay queue item request IDs do not match Agent 6-ready docket review_items'
    });
  }

  if (relayPacket.boundary?.queue_mutation_performed !== false) {
    findings.push({
      severity: 'block',
      request_id: '(relay packet)',
      field: 'boundary.queue_mutation_performed',
      message: `expected false, got ${String(relayPacket.boundary?.queue_mutation_performed)}`
    });
  }

  assertBoundary(relayPacket.boundary, findings);

  for (const item of queueItems) {
    validateQueueItem(item, rules, findings);
  }

  const blockingFindings = findings.filter((finding) => finding.severity === 'block').length;
  const result = {
    ok: blockingFindings === 0,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validator: 'scripts/validate_agent1_agent6_queue_intake_contract_for_relay_packet.mjs',
    intake_contract_source: PATHS.queue,
    relay_packet: PATHS.relayPacket,
    docket: PATHS.docket,
    required_request_fields: rules.required_request_fields || [],
    allowed_submitters: rules.allowed_submitters || [],
    request_ids: requestIds,
    queue_items_checked: queueItems.length,
    publication_state: queue.publication_global_status || '(missing)',
    queue_mutation_performed: relayPacket.boundary?.queue_mutation_performed,
    blocking_findings: blockingFindings,
    findings,
    boundary: {
      publication_state: 'blocked_no_render',
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
    }
  };

  writeJson(PATHS.resultJson, result);
  writeText(PATHS.resultMd, renderMarkdown(result));
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(1);
  }
}

main();
