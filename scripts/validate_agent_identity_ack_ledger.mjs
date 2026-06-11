#!/usr/bin/env node
import fs from 'node:fs';
import { expectedAgentIds, registryHash } from './agent_identity_hash.mjs';

const args = parseArgs(process.argv.slice(2));
const registryPath = args.registry || 'data/control/agent_identity_registry.json';
const ledgerPath = args.ledger || 'data/control/agent_identity_ack_ledger.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function expect(condition, message) {
  if (!condition) fail(message);
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

function validateLedger(ledger, registry, label = 'ledger') {
  expect(ledger.artifact_type === 'agent_identity_ack_ledger', `${label}: artifact_type mismatch`);
  expect(ledger.registry_version === registry.registry_version, `${label}: registry_version mismatch`);
  expect(ledger.registry_hash === registry.registry_hash, `${label}: registry_hash mismatch`);
  expect(ledger.registry_hash === registryHash(registry), `${label}: registry_hash does not match registry`);
  expect(Number.isInteger(ledger.ack_timeout_minutes) && ledger.ack_timeout_minutes > 0, `${label}: timeout missing`);
  expect(Number.isInteger(ledger.ack_retry_limit), `${label}: retry limit missing`);

  const expectedIds = expectedAgentIds();
  const rows = ledger.acks || [];
  expect(rows.length === 14, `${label}: expected 14 ack rows, found ${rows.length}`);
  const ids = rows.map((row) => row.agent_id);
  expect(new Set(ids).size === 14, `${label}: duplicate ack agent_id`);
  expect(JSON.stringify([...ids].sort()) === JSON.stringify(expectedIds), `${label}: ack IDs must be A01-A14`);

  const registryAgents = new Map((registry.agents || []).map((agent) => [agent.agent_id, agent]));
  for (const row of rows) {
    const registryAgent = registryAgents.get(row.agent_id);
    expect(registryAgent, `${label}: unknown ack agent ${row.agent_id}`);
    expect(row.endpoint_id === registryAgent.current_endpoint_id, `${label}: ${row.agent_id} endpoint mismatch`);
    expect(row.registry_version === registry.registry_version, `${label}: ${row.agent_id} registry_version mismatch`);
    expect(row.registry_hash === registry.registry_hash, `${label}: ${row.agent_id} registry_hash mismatch`);
    expect(Array.isArray(row.other_13_ids_seen), `${label}: ${row.agent_id} other_13_ids_seen must be array`);
    expect(Array.isArray(row.mismatches), `${label}: ${row.agent_id} mismatches must be array`);
    expect(row.ack_status, `${label}: ${row.agent_id} missing ack_status`);
    expect(row.stop_condition, `${label}: ${row.agent_id} missing stop_condition`);
  }

  const ackedRows = rows.filter((row) => row.ack_status === 'ACKED');
  if (ledger.resume_authorized) {
    expect(ackedRows.length === 14, `${label}: resume_authorized requires all 14 ACKED`);
    for (const row of rows) {
      const otherIds = row.other_13_ids_seen;
      expect(otherIds.length === 13, `${label}: ${row.agent_id} must list 13 other IDs when ACKED`);
      expect(!otherIds.includes(row.agent_id), `${label}: ${row.agent_id} cannot list self as other`);
      expect(row.mismatches.length === 0, `${label}: ${row.agent_id} ACKED with mismatches`);
      expect(row.ack_time, `${label}: ${row.agent_id} ACKED without ack_time`);
    }
  } else {
    expect(
      String(ledger.control_state || '').startsWith('IDENTITY_FREEZE')
        || String(ledger.control_state || '').startsWith('IDENTITY_MONITOR'),
      `${label}: non-resumed ledger must remain in an identity freeze or monitor state`,
    );
    if (String(ledger.control_state || '').startsWith('IDENTITY_MONITOR')) {
      expect(
        ledger.partial_resume_authorized?.status === 'A09_A13_REINSTATED_BY_OWNER_UNDER_MONITOR',
        `${label}: identity monitor state requires explicit partial_resume_authorized status`,
      );
      expect(ledger.identity_monitor?.status, `${label}: identity monitor state requires identity_monitor details`);
    }
  }

  return { acked: ackedRows.length, total: rows.length, control_state: ledger.control_state };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function runEndpointReplacementSimulation(registry, ledger) {
  const nextRegistry = clone(registry);
  const a01 = nextRegistry.agents.find((agent) => agent.agent_id === 'A01');
  a01.current_endpoint_id = 'simulated-replacement-endpoint';
  delete nextRegistry.registry_hash;
  nextRegistry.registry_hash = registryHash(nextRegistry);

  const nextLedger = clone(ledger);
  nextLedger.registry_hash = nextRegistry.registry_hash;
  nextLedger.control_state = 'IDENTITY_FREEZE_ALL_ENDPOINT_REPLACEMENT_PENDING_ACK';
  nextLedger.resume_authorized = false;
  for (const row of nextLedger.acks) {
    row.registry_hash = nextRegistry.registry_hash;
    row.ack_status = 'PENDING_ENDPOINT_REPLACEMENT_ACK';
    row.other_13_ids_seen = [];
    row.mismatches = ['endpoint_replacement_not_acknowledged'];
    if (row.agent_id === 'A01') row.endpoint_id = 'simulated-replacement-endpoint';
  }
  return validateLedger(nextLedger, nextRegistry, 'endpoint-replacement simulation');
}

function runTimeoutSimulation(registry, ledger) {
  const nextLedger = clone(ledger);
  nextLedger.control_state = 'IDENTITY_FREEZE_WITH_UNREACHABLE_AGENT';
  nextLedger.resume_authorized = false;
  const a09 = nextLedger.acks.find((row) => row.agent_id === 'A09');
  a09.ack_status = 'UNREACHABLE';
  a09.mismatches = ['ack_timeout_after_one_retry'];
  a09.stop_condition = 'Owner/A13 repairs A09 endpoint or explicitly authorizes degraded mode.';
  return validateLedger(nextLedger, registry, 'timeout-a09 simulation');
}

const registry = readJson(registryPath);
const ledger = readJson(ledgerPath);

let result;
if (args.simulate === 'endpoint-replacement') result = runEndpointReplacementSimulation(registry, ledger);
else if (args.simulate === 'timeout-a09') result = runTimeoutSimulation(registry, ledger);
else result = validateLedger(ledger, registry);

console.log(
  `Agent identity ack ledger validation passed. State: ${result.control_state}; ACKED: ${result.acked}/${result.total}.`,
);
