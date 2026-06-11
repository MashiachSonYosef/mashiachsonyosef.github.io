#!/usr/bin/env node
import fs from 'node:fs';
import { expectedAgentIds, registryHash } from './agent_identity_hash.mjs';

const registryPath = process.argv[2] || 'data/control/agent_identity_registry.json';

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

const registry = readJson(registryPath);
expect(registry.artifact_type === 'agent_identity_registry', 'artifact_type mismatch');
expect(registry.authority_source === 'repo_registry', 'authority_source must be repo_registry');
expect(registry.publication_global_status === 'blocked_no_render', 'publication_global_status mismatch');

const agents = registry.agents || [];
const expectedIds = expectedAgentIds();
expect(agents.length === 14, `expected 14 agents, found ${agents.length}`);

const ids = agents.map((agent) => agent.agent_id);
expect(new Set(ids).size === 14, 'agent_id values must be unique');
expect(JSON.stringify([...ids].sort()) === JSON.stringify(expectedIds), 'agent_id set must be A01-A14');

for (const agent of agents) {
  expect(agent.registry_version === registry.registry_version, `${agent.agent_id} registry_version mismatch`);
  expect(Number.isInteger(agent.cycle_position), `${agent.agent_id} missing integer cycle_position`);
  expect(agent.canonical_title, `${agent.agent_id} missing canonical_title`);
  expect(agent.role, `${agent.agent_id} missing role`);
  expect(agent.authority_scope, `${agent.agent_id} missing authority_scope`);
  expect(agent.current_endpoint_id, `${agent.agent_id} missing current_endpoint_id`);
  expect(agent.endpoint_status, `${agent.agent_id} missing endpoint_status`);
  expect(agent.status, `${agent.agent_id} missing status`);
  expect(Array.isArray(agent.deprecated_aliases), `${agent.agent_id} deprecated_aliases must be array`);
  expect(
    Array.isArray(agent.forbidden_impersonation_rules) && agent.forbidden_impersonation_rules.length > 0,
    `${agent.agent_id} missing forbidden_impersonation_rules`,
  );
}

const a13 = agents.filter((agent) => agent.agent_id === 'A13');
const a14 = agents.filter((agent) => agent.agent_id === 'A14');
expect(a13.length === 1, 'exactly one A13 required');
expect(a14.length === 1, 'exactly one A14 required');
expect(/CEO|mission/i.test(a13[0].canonical_title + ' ' + a13[0].role), 'A13 must be CEO/mission lane');
expect(/comparison|check/i.test(a14[0].role), 'A14 must be comparison/check lane');
expect(!/acceptance/i.test(a14[0].authority_scope), 'A14 authority_scope must not create acceptance');

const requiredEnvelopeFields = [
  'from_agent_id',
  'from_endpoint_id',
  'acting_as',
  'target_agent_id',
  'registry_version',
  'registry_hash',
  'source_artifact',
  'authority_scope',
  'expires_at',
  'stop_condition',
];
for (const field of requiredEnvelopeFields) {
  expect(
    registry.message_envelope_required_fields?.includes(field),
    `message_envelope_required_fields missing ${field}`,
  );
}

const computedHash = registryHash(registry);
expect(registry.registry_hash === computedHash, `registry_hash mismatch: expected ${computedHash}`);

console.log(
  `Agent identity registry validation passed. Version: ${registry.registry_version}; agents: ${agents.length}; hash: ${registry.registry_hash}.`,
);
