#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-agent6-boundary-packet.json');
const packet = JSON.parse(fs.readFileSync(path.join(root, packetPath), 'utf8'));
const issues = [];

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'workbench_usage_agent6_boundary_packet') {
  issues.push('artifact_type must be workbench_usage_agent6_boundary_packet');
}
if (packet.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (packet.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (packet.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (packet.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (packet.authority_policy?.route_ids_only !== true) issues.push('authority_policy.route_ids_only must be true');
if (packet.authority_policy?.copies_route_payloads !== false) issues.push('authority_policy.copies_route_payloads must be false');

const checks = Array.isArray(packet.checks) ? packet.checks : [];
if (!checks.length) issues.push('checks must be non-empty');
for (const check of checks) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}

const selectedRows = Number(packet.counts?.selected_occurrence_rows || 0);
if (selectedRows <= 0) issues.push('selected_occurrence_rows must be positive');
for (const field of ['rows_with_source_href', 'rows_with_work_anchor_href', 'rows_with_context_focus_marked', 'rows_with_route_ids', 'rows_with_license', 'rows_with_license_url']) {
  if (Number(packet.counts?.[field] || 0) !== selectedRows) issues.push(`${field} must equal selected_occurrence_rows`);
}
if (Number(packet.counts?.route_links_unresolved || 0) !== 0) issues.push('route_links_unresolved must be 0');
if (Number(packet.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
if (Number(packet.counts?.forbidden_field_hits || 0) !== 0) issues.push('forbidden_field_hits must be 0');
if (Number(packet.counts?.selected_audit_status_rows || 0) !== 0) issues.push('selected_audit_status_rows must be 0');
if (Number(packet.counts?.selected_qa_package_items || 0) < 24) issues.push('selected_qa_package_items must be at least 24');
if (packet.counts?.selected_source_hub_status !== 'present') issues.push('selected_source_hub_status must be present');
if (packet.counts?.selected_work_hub_status !== 'present') issues.push('selected_work_hub_status must be present');
if (Number(packet.counts?.selected_source_hub_occurrence_rows || 0) !== selectedRows) {
  issues.push('selected_source_hub_occurrence_rows must equal selected_occurrence_rows');
}
if (Number(packet.counts?.selected_work_hub_occurrence_rows || 0) !== selectedRows) {
  issues.push('selected_work_hub_occurrence_rows must equal selected_occurrence_rows');
}
if (Number(packet.counts?.selected_source_hub_target_links || 0) !== Number(packet.counts?.selected_occurrence_adjacency_target_links || 0)) {
  issues.push('selected_source_hub_target_links must equal selected_occurrence_adjacency_target_links');
}
if (Number(packet.counts?.selected_work_hub_target_links || 0) !== Number(packet.counts?.selected_occurrence_adjacency_target_links || 0)) {
  issues.push('selected_work_hub_target_links must equal selected_occurrence_adjacency_target_links');
}
if (Number(packet.counts?.selected_source_hub_reader_facing_rows || 0) !== 0) {
  issues.push('selected_source_hub_reader_facing_rows must be 0');
}
if (Number(packet.counts?.selected_work_hub_reader_facing_rows || 0) !== 0) {
  issues.push('selected_work_hub_reader_facing_rows must be 0');
}
if (Number(packet.counts?.selected_source_hub_route_payload_field_hits || 0) !== 0) {
  issues.push('selected_source_hub_route_payload_field_hits must be 0');
}
if (Number(packet.counts?.selected_work_hub_route_payload_field_hits || 0) !== 0) {
  issues.push('selected_work_hub_route_payload_field_hits must be 0');
}
if (packet.graph_boundary?.source_hub_present !== true) issues.push('graph_boundary.source_hub_present must be true');
if (packet.graph_boundary?.work_hub_present !== true) issues.push('graph_boundary.work_hub_present must be true');
if (packet.graph_boundary?.source_hub_complete !== true) issues.push('graph_boundary.source_hub_complete must be true');
if (packet.graph_boundary?.work_hub_complete !== true) issues.push('graph_boundary.work_hub_complete must be true');
if (packet.audit_boundary?.audit_review_reader_facing !== false) issues.push('audit_review_reader_facing must be false');
if (Number(packet.counts?.smoke_failed_steps || 0) !== 0) issues.push('smoke_failed_steps must be 0');

if (issues.length) {
  console.error(`Workbench usage Agent 6 boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated Agent 6 usage boundary packet ${packetPath}: checks ${checks.length}; selected rows ${selectedRows}`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
