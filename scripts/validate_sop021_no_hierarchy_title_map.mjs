import fs from 'node:fs';

const requiredTitles = {
  'Agent 1': 'Agent 1 - source',
  'Agent 2': 'Agent 2 - definition',
  'Agent 3': 'Agent 3 - linkage',
  'Agent 4': 'Agent 4 - validation',
  'Agent 5': 'Agent 5 - queue',
  'Agent 6': 'Agent 6 - qa',
  'Agent 7': 'Agent 7 - execution',
  'Agent 8': 'Agent 8 - pressure',
  'Agent 9': 'Agent 9 - oracle',
  'Agent 10': 'Agent 10 - release',
  'Agent 11': 'Agent 11 - reception',
  'Agent 12': 'Agent 12 - limiter',
  'Agent 13': 'Agent 13 - mission',
  'Agent 14': 'Agent 14 - override'
};

const blockedCurrentPatterns = [
  /\bCEO\b/i,
  /\bmanager\b/i,
  /\bboss\b/i,
  /reporting_structure/i,
  /reports_to/i,
  /Agent 13 - CEO/i,
  /Agent 7 - manager/i,
  /Agent 9 - oracler/i,
  /Agent 10 - ITer/i,
  /Agent 11 - translater/i,
  /Agent 14 - abover/i
];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function assertTitleMap(map, label) {
  for (const [agent, title] of Object.entries(requiredTitles)) {
    const actual = map?.[agent]?.title;
    if (actual !== title) fail(`${label} ${agent} title is ${actual || 'missing'}, expected ${title}`);
  }
}

function scanCurrentSurface(value, label, path = label) {
  if (value == null) return;
  if (typeof value === 'string') {
    for (const pattern of blockedCurrentPatterns) {
      if (pattern.test(value)) fail(`${path} contains blocked current-control wording: ${value}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanCurrentSurface(entry, label, `${path}[${index}]`));
    return;
  }
  if (typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith('wartime_user_override') || key.startsWith('historical_')) continue;
    scanCurrentSurface(entry, label, `${path}.${key}`);
  }
}

const registry = readJson('data/control/agent_registry.json');
assertTitleMap(registry.current_thread_locator?.agents, 'current_thread_locator');
assertTitleMap(registry.thread_title_canonical_restore_lock?.canonical, 'thread_title_canonical_restore_lock');

if (registry.current_agent13_locator?.thread_title !== requiredTitles['Agent 13']) {
  fail(`current_agent13_locator title is ${registry.current_agent13_locator?.thread_title || 'missing'}`);
}

const currentSurfaces = {
  registry_policy: registry.policy,
  current_thread_locator: registry.current_thread_locator,
  current_agent13_locator: registry.current_agent13_locator,
  organization_state: registry.organization_state,
  thread_title_canonical_restore_lock: registry.thread_title_canonical_restore_lock,
  agent13_organization_state: readJson('data/control/agent13_organization_state.json'),
  pulse_state: readJson('data/control/pulse_state.json'),
  agent7_pulse_state: readJson('data/control/agent7_pulse_state.json')
};

for (const [label, surface] of Object.entries(currentSurfaces)) {
  scanCurrentSurface(surface, label);
}

const sop021 = fs.readFileSync('reports/sop-021-current-action-preservation-and-drift-control.md', 'utf8');
if (!sop021.includes('pipeline_pending_control_posture_proposal')) {
  fail('SOP-021 must remain pipeline_pending_control_posture_proposal until Agent 6/7 publication path is complete');
}
if (!sop021.includes('blocked_no_render')) {
  fail('SOP-021 must preserve blocked_no_render publication boundary');
}

if (!process.exitCode) {
  pass('SOP-021 title map and no-hierarchy current control surfaces are consistent');
}
