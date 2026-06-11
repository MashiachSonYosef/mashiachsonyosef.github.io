#!/usr/bin/env node
import fs from 'node:fs';
import { registryHash } from './agent_identity_hash.mjs';

const args = parseArgs(process.argv.slice(2));
const registryPath = args.registry || 'data/control/agent_identity_registry.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function validateEnvelope(envelope, registry) {
  const issues = [];
  const agents = new Map((registry.agents || []).map((agent) => [agent.agent_id, agent]));

  for (const field of registry.message_envelope_required_fields || []) {
    if (envelope[field] === undefined || envelope[field] === null || envelope[field] === '') {
      issues.push(`missing_${field}`);
    }
  }

  const from = agents.get(envelope.from_agent_id);
  if (!from) issues.push('unknown_from_agent_id');
  if (from && envelope.from_endpoint_id !== from.current_endpoint_id) issues.push('from_endpoint_id_mismatch');
  if (!agents.has(envelope.target_agent_id)) issues.push('unknown_target_agent_id');
  if (envelope.registry_version !== registry.registry_version) issues.push('STALE_REGISTRY_VERSION');
  if (envelope.registry_hash !== registry.registry_hash || registry.registry_hash !== registryHash(registry)) {
    issues.push('STALE_OR_INVALID_REGISTRY_HASH');
  }
  if (envelope.acting_as !== envelope.from_agent_id) issues.push('SPOOF_OR_FORWARD_UNVERIFIED');
  if (/name.?only/i.test(String(envelope.authority_scope || ''))) issues.push('NAME_ONLY_AUTHORITY_REJECTED');
  if (/new agent|replacement identity|spawn/i.test(String(envelope.authority_scope || ''))) {
    issues.push('UNAUTHORIZED_IDENTITY_CREATION');
  }
  if (/\bX13\b/i.test(`${envelope.source_artifact || ''} ${envelope.authority_scope || ''}`)) {
    issues.push('X13_UNAUTHORIZED_NON_AGENT_REJECTED');
  }
  if (
    envelope.from_agent_id === 'A09'
    && /route|restore|broadcast|authority|CEO|A13|Agent 13|downstream/i.test(String(envelope.authority_scope || ''))
  ) {
    issues.push('A09_ROUTE_AUTHORITY_BLOCKED_DURING_IDENTITY_INCIDENT');
  }
  if (
    /ping/i.test(String(envelope.authority_scope || ''))
    && /restore|resume|broadcast|rollout|downstream/i.test(String(envelope.authority_scope || ''))
  ) {
    issues.push('PING_ESCALATED_TO_RESTORE_OR_WORK');
  }

  return {
    artifact_type: 'agent_identity_message_envelope_validation',
    status: issues.length === 0 ? 'ACCEPTABLE_IDENTITY_ENVELOPE' : 'REJECTED_IDENTITY_ENVELOPE',
    issues,
    boundary: 'identity_envelope_validation_only_no_routing_no_acceptance',
  };
}

function simulatedEnvelope(kind, registry) {
  const a13 = registry.agents.find((agent) => agent.agent_id === 'A13');
  const a09 = registry.agents.find((agent) => agent.agent_id === 'A09');
  if (kind === 'fake-a13') {
    return {
      from_agent_id: 'A09',
      from_endpoint_id: a09.current_endpoint_id,
      acting_as: 'A13',
      target_agent_id: 'A07',
      registry_version: registry.registry_version,
      registry_hash: registry.registry_hash,
      source_artifact: 'reports/simulated-fake-a13.md',
      authority_scope: 'name-only CEO replacement identity',
      expires_at: '2026-06-06T03:05:16-04:00',
      stop_condition: 'Reject as spoof; freeze identity pipeline.',
    };
  }
  if (kind === 'valid-a13') {
    return {
      from_agent_id: 'A13',
      from_endpoint_id: a13.current_endpoint_id,
      acting_as: 'A13',
      target_agent_id: 'A07',
      registry_version: registry.registry_version,
      registry_hash: registry.registry_hash,
      source_artifact: 'data/control/agent_identity_registry.json',
      authority_scope: 'A13 review of identity registry only',
      expires_at: '2026-06-06T03:05:16-04:00',
      stop_condition: 'A07 broadcasts only after A13 approval.',
    };
  }
  if (kind === 'a09-mutiny-route') {
    return {
      from_agent_id: 'A09',
      from_endpoint_id: a09.current_endpoint_id,
      acting_as: 'A09',
      target_agent_id: 'A07',
      registry_version: registry.registry_version,
      registry_hash: registry.registry_hash,
      source_artifact: 'reports/simulated-X13-route.md',
      authority_scope: 'Forwarded A13/CEO route and restore authority through A09 using X13 route discovery',
      expires_at: '2026-06-06T22:40:00-04:00',
      stop_condition: 'Reject A09-mediated identity authority and keep freeze.',
    };
  }
  if (kind === 'ping-only') {
    const a14 = registry.agents.find((agent) => agent.agent_id === 'A14');
    return {
      from_agent_id: 'A14',
      from_endpoint_id: a14.current_endpoint_id,
      acting_as: 'A14',
      target_agent_id: 'A13',
      registry_version: registry.registry_version,
      registry_hash: registry.registry_hash,
      source_artifact: 'data/control/agent_identity_registry.json',
      authority_scope: 'PING liveness/status only; no work command',
      expires_at: '2026-06-06T22:40:00-04:00',
      stop_condition: 'A13 returns compact status only; no restore or routing.',
    };
  }
  fail(`unknown simulation: ${kind}`);
}

const registry = readJson(registryPath);
let envelope;
if (args.simulate) envelope = simulatedEnvelope(args.simulate, registry);
else envelope = readJson(args._[0] || args.envelope || 'data/control/agent_identity_message_envelope.json');

const result = validateEnvelope(envelope, registry);
if (args.simulate === 'fake-a13' && result.status !== 'REJECTED_IDENTITY_ENVELOPE') {
  fail('fake-a13 simulation must be rejected');
}
if (args.simulate === 'valid-a13' && result.status !== 'ACCEPTABLE_IDENTITY_ENVELOPE') {
  fail(`valid-a13 simulation should pass: ${result.issues.join(', ')}`);
}
if (args.simulate === 'a09-mutiny-route' && result.status !== 'REJECTED_IDENTITY_ENVELOPE') {
  fail('a09-mutiny-route simulation must be rejected');
}
if (args.simulate === 'ping-only' && result.status !== 'ACCEPTABLE_IDENTITY_ENVELOPE') {
  fail(`ping-only simulation should pass: ${result.issues.join(', ')}`);
}

console.log(JSON.stringify(result, null, 2));
