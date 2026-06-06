#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  agentRegistry: 'data/control/agent_registry.json',
  sourceCitationDependencyCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
  agent10SourceCitationRouteBlocker:
    'reports/agent10-agent1-old-dictionary-78-row-source-citation-enrichment-live-route-blocker-2026-06-06.json',
  agent10SourceCitationWorkset:
    'reports/agent10-agent1-ready-old-dictionary-78-row-source-citation-enrichment-workset-2026-06-06.json',
  output: 'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const agentRegistry = readJson(options.agentRegistry);
const sourceCitationDependencyCrossmatch = readJson(options.sourceCitationDependencyCrossmatch);
const agent10SourceCitationRouteBlocker = readJson(options.agent10SourceCitationRouteBlocker);
const agent10SourceCitationWorkset = readJson(options.agent10SourceCitationWorkset);

assertArtifact(
  sourceCitationDependencyCrossmatch,
  'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch',
  options.sourceCitationDependencyCrossmatch,
);
assertArtifact(
  agent10SourceCitationRouteBlocker,
  'agent10_agent1_old_dictionary_78_row_source_citation_enrichment_live_route_blocker',
  options.agent10SourceCitationRouteBlocker,
);
assertArtifact(
  agent10SourceCitationWorkset,
  'agent10_agent1_ready_old_dictionary_78_row_source_citation_enrichment_workset',
  options.agent10SourceCitationWorkset,
);

const agent1 = (agentRegistry.agents || []).find((entry) => entry.agent === 'Agent 1') || {};
const registryStat = fs.statSync(path.resolve(root, options.agentRegistry));
const routeAttempt = agent10SourceCitationRouteBlocker.live_route_attempt || {};
const routeBlockerGeneratedAt = Date.parse(agent10SourceCitationRouteBlocker.generated_at || '');
const registryMtime = registryStat.mtime.getTime();
const routeTargetMatchesRegistry =
  routeAttempt.target_attempted &&
  routeAttempt.target_attempted === agent1.target_id &&
  routeAttempt.target_attempted === agent1.current_live_thread_id;
const registryPostdatesRouteBlocker =
  Number.isFinite(routeBlockerGeneratedAt) && registryMtime > routeBlockerGeneratedAt;
const dependencyCounts = sourceCitationDependencyCrossmatch.counts || {};
const workset = agent10SourceCitationWorkset.workset || {};

const routeRecheckRows = [
  {
    row_id: 'agent3-agent1-route-recheck-source-citation-workset',
    attempted_target_id: routeAttempt.target_attempted || '',
    registry_target_id: agent1.target_id || '',
    registry_current_live_thread_id: agent1.current_live_thread_id || '',
    registry_thread_title: agent1.thread_title || '',
    registry_discovery_status: agent1.discovery_status || '',
    registry_routing_blocker: agent1.routing_blocker || '',
    registry_current_goal_status: agent1.current_goal_status || '',
    route_attempt_result: routeAttempt.result || '',
    route_blocker_generated_at: agent10SourceCitationRouteBlocker.generated_at || '',
    registry_mtime: registryStat.mtime.toISOString(),
    route_target_matches_registry: Boolean(routeTargetMatchesRegistry),
    registry_postdates_route_blocker: Boolean(registryPostdatesRouteBlocker),
    route_recheck_status:
      routeTargetMatchesRegistry && registryPostdatesRouteBlocker
        ? 'recheck_required_current_registry_contradicts_older_route_blocker'
        : 'route_blocker_preserved_no_current_registry_contradiction',
    evidence_role: 'route_recheck_navigation_only_no_delivery_or_acceptance',
    dedupe_key: sha256([routeAttempt.target_attempted || '', agent1.target_id || '', registryStat.mtime.toISOString()].join('|')),
  },
];

const counts = {
  route_recheck_rows: routeRecheckRows.length,
  attempted_target_matches_registry_rows: routeRecheckRows.filter((row) => row.route_target_matches_registry).length,
  registry_postdates_route_blocker_rows: routeRecheckRows.filter((row) => row.registry_postdates_route_blocker).length,
  route_recheck_required_rows: routeRecheckRows.filter(
    (row) => row.route_recheck_status === 'recheck_required_current_registry_contradicts_older_route_blocker',
  ).length,
  route_blocker_preserved_rows: routeRecheckRows.filter(
    (row) => row.route_recheck_status !== 'recheck_required_current_registry_contradicts_older_route_blocker',
  ).length,
  row_dependency_rows: Number(dependencyCounts.row_dependency_rows || 0),
  row_dependency_occurrences: Number(dependencyCounts.row_dependency_occurrences || 0),
  source_citation_missing_rows: Number(dependencyCounts.source_citation_missing_rows || 0),
  transform_rule_missing_rows: Number(dependencyCounts.transform_rule_missing_rows || 0),
  agent10_workset_rows: Number(workset.rows || 0),
  agent10_workset_occurrences: Number(workset.occurrences || 0),
  source_rid_references: Number(dependencyCounts.source_rid_references || 0),
  unique_source_rids: Number(dependencyCounts.unique_source_rids || 0),
  exact_blocker_rows: Number(dependencyCounts.exact_blocker_rows || 0),
  source_citation_supplied_rows: 0,
  transform_ready_rows: 0,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_rows: 0,
  answer_eligible_rows: 0,
  route_jsonl_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  export_rows: 0,
  release_actions: 0,
  source_acceptance_claims: 0,
  delivery_attempts_by_agent3: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'crossmatch the old-dictionary 78-row source-citation dependency blocker against current Agent 1 registry route evidence',
  inputs: {
    agent_registry: options.agentRegistry,
    source_citation_dependency_crossmatch: options.sourceCitationDependencyCrossmatch,
    agent10_source_citation_route_blocker: options.agent10SourceCitationRouteBlocker,
    agent10_source_citation_workset: options.agent10SourceCitationWorkset,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    route_recheck_crossmatch_only: true,
    external_route_status_observation_only: true,
    source_citation_supplied_by_agent3: false,
    source_provenance_acceptance: false,
    source_license_acceptance: false,
    source_legal_acceptance: false,
    transform_authority: false,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    lemma_content_storage: false,
    reader_hint_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    answer_eligibility: false,
    route_ranking: false,
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    delivery_attempted_by_agent3: false,
    release_action: false,
  },
  counts,
  route_recheck_rows: routeRecheckRows,
  dependency_summary: {
    missing_field_to_supply:
      sourceCitationDependencyCrossmatch.dependency_summary?.missing_field_to_supply || workset.missing_field_to_supply || '',
    prior_route_blocker: agent10SourceCitationRouteBlocker.exact_blocker || '',
    prior_route_attempt_result: routeAttempt.result || '',
    current_registry_target_id: agent1.target_id || '',
    current_registry_live_thread_id: agent1.current_live_thread_id || '',
    current_registry_discovery_status: agent1.discovery_status || '',
    current_registry_routing_blocker: agent1.routing_blocker || '',
    source_citation_or_url_supplied_now: false,
    transform_rule_supplied_now: false,
  },
  downstream_handoff: {
    package_owner: 'Agent 10',
    coordination_owner_for_recheck: 'Agent 5 / coordination',
    source_citation_owner: 'Agent 1',
    transform_owner_after_exact_dependency: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_current_blocker:
      'route_recheck_required_before_reusing_stale_agent1_route_blocker; source_citation_or_url_and_transform_rule_still_missing',
    stop_condition:
      'Use this route-recheck crossmatch only to show that current registry evidence should be checked before reusing the older Agent 10 live-route blocker. It does not deliver the workset, supply source citations, supply transform rules, create candidate text, create definition or lemma content, authorize answer eligibility, write routes, accept source/license/legal status, claim QA acceptance, mutate public/runtime, accept or emit accepted text, export, claim publication readiness, or release.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 Agent1 route recheck rows=${counts.route_recheck_rows} recheck=${counts.route_recheck_required_rows} missing_citation=${counts.source_citation_missing_rows}`,
);

function writeMarkdown(outputPath, artifact) {
  const rows = [
    '# Agent 3 Old-Dictionary Candidate-Use Agent 1 Route Recheck Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: route recheck/navigation only; no delivery attempt, source citation supplied, source/license/legal acceptance, transform output, definition authority, accepted text, public/runtime mutation, export, publication readiness, or release action.',
    '',
    '## Counts',
    '',
    `- Route recheck rows / recheck required / preserved blockers: ${artifact.counts.route_recheck_rows}/${artifact.counts.route_recheck_required_rows}/${artifact.counts.route_blocker_preserved_rows}`,
    `- Target matches registry / registry postdates blocker: ${artifact.counts.attempted_target_matches_registry_rows}/${artifact.counts.registry_postdates_route_blocker_rows}`,
    `- Dependency rows / occurrences: ${artifact.counts.row_dependency_rows}/${artifact.counts.row_dependency_occurrences}`,
    `- Source citation missing / transform rule missing rows: ${artifact.counts.source_citation_missing_rows}/${artifact.counts.transform_rule_missing_rows}`,
    `- Agent 10 workset rows / occurrences: ${artifact.counts.agent10_workset_rows}/${artifact.counts.agent10_workset_occurrences}`,
    `- Source RID refs / unique RIDs / exact blocker rows: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.exact_blocker_rows}`,
    `- Delivery attempts by Agent 3 / source acceptance claims / transform-ready / forbidden payload / acceptance claims: ${artifact.counts.delivery_attempts_by_agent3}/${artifact.counts.source_acceptance_claims}/${artifact.counts.transform_ready_rows}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Route Evidence',
    '',
    `- Prior route result: ${artifact.dependency_summary.prior_route_attempt_result}`,
    `- Current registry target: \`${artifact.dependency_summary.current_registry_target_id}\``,
    `- Current registry live thread: \`${artifact.dependency_summary.current_registry_live_thread_id}\``,
    `- Current registry routing blocker: \`${artifact.dependency_summary.current_registry_routing_blocker}\``,
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];

  fs.writeFileSync(path.resolve(root, outputPath), `${rows.join('\n')}\n`);
}

function countForbiddenPayloadKeys(value) {
  let hits = 0;
  walk(value, (key, child, parentKey) => {
    if (parentKey === 'authority_boundary') return;
    if (
      [
        'surface',
        'normalized',
        'token_surface',
        'token_normalized',
        'focus_surface',
        'focus_normalized',
        'candidate_text',
        'definition_text',
        'source_text',
        'accepted_text',
        'display_text',
        'route_payload',
        'public_domain_headwords',
        'public_domain_rids',
        'source_headwords',
      ].includes(key)
    ) {
      hits += 1;
    }
  });
  return hits;
}

function walk(value, callback, parentKey = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback, parentKey);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child, parentKey);
    walk(child, callback, key);
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assertArtifact(value, artifactType, filePath) {
  if (value.artifact_type !== artifactType) {
    throw new Error(`${filePath} artifact_type mismatch: expected ${artifactType}; got ${value.artifact_type || 'missing'}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function writeJson(outputPath, value) {
  fs.writeFileSync(path.resolve(root, outputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1 ? '' : arg.slice(index + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--agent-registry=')) parsed.agentRegistry = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-citation-dependency-crossmatch=')) {
      parsed.sourceCitationDependencyCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-source-citation-route-blocker=')) {
      parsed.agent10SourceCitationRouteBlocker = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--agent10-source-citation-workset=')) {
      parsed.agent10SourceCitationWorkset = cleanRelativePath(valueAfterEquals(arg));
    } else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}
