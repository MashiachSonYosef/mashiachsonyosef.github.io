#!/usr/bin/env node
import fs from 'node:fs';

const sopPath = process.argv[2] || 'reports/sop-024-agent-identity-integrity-and-roster-sync.md';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

let text;
try {
  text = fs.readFileSync(sopPath, 'utf8');
} catch (error) {
  fail(`could not read ${sopPath}: ${error.message}`);
}

for (const needle of [
  'SOP ID: SOP-024',
  'data/control/agent_identity_registry.json',
  'data/control/agent_identity_ack_ledger.json',
  'SOP-024 runs before SOP-022',
  'SOP-024 runs first',
  'IDENTITY_FREEZE_ALL',
  'VERIFY_REGISTRY',
  'REJECT_SPOOF_OR_STALE_AUTHORITY',
  'A13_REVIEW',
  'BROADCAST_SENT',
  'ACK_COMPLETE',
  'RESUMED',
  'from_agent_id | from_endpoint_id | acting_as | target_agent_id | registry_version | registry_hash | source_artifact | authority_scope | expires_at | stop_condition',
  'SPOOF_OR_FORWARD_UNVERIFIED',
  'multi_agent_v1.send_input | target_agent_id | target_endpoint_id | interrupt: true | packet | timeout | stop_condition',
  'identity_interrupt_timeout',
  'CHANGE_REQUESTED -> A13_REVIEW -> REGISTRY_UPDATED -> DEPENDENCIES_UPDATED -> BROADCAST_SENT -> ACK_COMPLETE -> OLD_ALIAS_DEPRECATED -> RESUMED',
  'Publication remains `blocked_no_render`',
]) {
  expect(text.includes(needle), `missing required SOP text: ${needle}`);
}

const machineRowPattern =
  /^\| `[^`]+` \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \|$/gm;
const rows = [...text.matchAll(machineRowPattern)];
expect(rows.length >= 9, `expected at least 9 executable state-machine rows, found ${rows.length}`);

for (const row of rows) {
  const cells = row[0].split('|').slice(1, -1).map((cell) => cell.trim());
  expect(cells.length === 8, `state-machine row must have 8 cells: ${row[0]}`);
  for (const cell of cells) expect(cell.length > 0, `empty state-machine cell: ${row[0]}`);
}

console.log(`SOP-024 validation passed. Executable rows: ${rows.length}.`);
