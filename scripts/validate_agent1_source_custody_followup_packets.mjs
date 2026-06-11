import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const PATHS = {
  packetA: 'reports/agent1-source-custody-packet-a-tracking-review.json',
  packetB: 'reports/agent1-source-custody-packet-b-missing-manifest.json',
  packetC: 'reports/agent1-source-custody-packet-c-license-label-normalization.json',
  index: 'reports/agent1-source-custody-followup-packets-index.json',
  queueCandidate: 'reports/agent1-source-custody-followup-queue-intake-candidate.json',
  closureOptions: 'reports/agent1-source-custody-closure-options.json',
  preflight: 'reports/agent1-source-custody-reconciliation-preflight.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  validatorResult: 'reports/agent1-source-custody-followup-packets-validator-result.json'
};

const REQUIRED_TRACK_SOURCES = [
  'data/sources/beer-hagolah.json',
  'data/sources/brief-commentary-on-peah.json',
  'data/sources/brief-commentary-on-rosh-hashanah.json',
  'data/sources/brief-commentary-on-shabbat.json',
  'data/sources/brief-commentary-on-shekalim.json',
  'data/sources/brief-commentary-on-sheviit.json',
  'data/sources/brief-commentary-on-sotah.json',
  'data/sources/brief-commentary-on-taanit.json',
  'data/sources/brief-commentary-on-terumot.json',
  'data/sources/brief-commentary-on-yevamot.json',
  'data/sources/brief-commentary-on-yoma.json',
  'data/sources/derashat-shabbat-hagadol.json',
  'data/sources/derush-al-hatorah.json',
  'data/sources/gevurot-hashem.json',
  'data/sources/ner-mitzvah.json',
  'data/sources/netivot-olam.json',
  'data/sources/netzach-yisrael.json'
].sort();

const REQUIRED_MISSING_MANIFEST_SOURCES = [
  'data/sources/machzor-rosh-hashanah-ashkenaz-linear.json',
  'data/sources/machzor-rosh-hashanah-ashkenaz.json',
  'data/sources/machzor-yom-kippur-ashkenaz-linear.json',
  'data/sources/selichot-nusach-lita-linear.json',
  'data/sources/shabbat-siddur-sefard-linear.json',
  'data/sources/siddur-sefard.json'
].sort();

const REQUIRED_MODIFIED_TRACKED = [
  'data/sources/abarbanel-on-guide-for-the-perplexed.json',
  'data/sources/crescas-on-guide-for-the-perplexed.json',
  'data/sources/efodi-on-guide-for-the-perplexed.json',
  'data/sources/narboni-on-guide-for-the-perplexed.json',
  'data/sources/shem-tov-on-guide-for-the-perplexed.json',
  'data/sources/yahel-ohr-on-zohar.json'
].sort();

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sortedPaths(rows) {
  return rows.map((row) => row.source_path).sort();
}

function sameSet(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} mismatch\nactual=${JSON.stringify(actual)}\nexpected=${JSON.stringify(expected)}`);
}

function assertBoundary(boundary, label) {
  assert(boundary, `${label} missing boundary`);
  assert(boundary.publication_state === 'blocked_no_render', `${label} publication_state must remain blocked_no_render`);
  for (const key of [
    'source_provenance_acceptance_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'page_render_acceptance_claimed'
  ]) {
    assert(boundary[key] === false, `${label} boundary ${key} must be false`);
  }
}

function countDirect(rows) {
  return new Set(rows.flatMap((row) => row.downstream_direct_artifact_paths || [])).size;
}

function countContent(rows) {
  return new Set(rows.flatMap((row) => row.downstream_content_reference_paths || [])).size;
}

function main() {
  const packetA = readJson(PATHS.packetA);
  const packetB = readJson(PATHS.packetB);
  const packetC = readJson(PATHS.packetC);
  const index = readJson(PATHS.index);
  const queueCandidate = fs.existsSync(PATHS.queueCandidate) ? readJson(PATHS.queueCandidate) : null;
  const closure = readJson(PATHS.closureOptions);
  const preflight = readJson(PATHS.preflight);
  const decision = readJson(PATHS.decisionPacket);

  assertBoundary(packetA.boundary, 'packet A');
  assertBoundary(packetB.boundary, 'packet B');
  assertBoundary(packetC.boundary, 'packet C');
  assertBoundary(index.boundary, 'index');

  sameSet(sortedPaths(packetA.track_candidate_sources), REQUIRED_TRACK_SOURCES, 'Packet A source set');
  sameSet(sortedPaths(packetB.missing_manifest_sources), REQUIRED_MISSING_MANIFEST_SOURCES, 'Packet B source set');
  sameSet(sortedPaths(packetC.modified_tracked_sources), REQUIRED_MODIFIED_TRACKED, 'Packet C source set');

  assert(packetA.summary.track_candidate_source_files === 17, 'Packet A must have 17 source files');
  assert(packetB.summary.missing_manifest_source_files === 6, 'Packet B must have 6 source files');
  assert(packetB.summary.expected_lexical_manifest_paths === 6, 'Packet B must have 6 expected manifest paths');
  assert(packetC.summary.modified_tracked_source_files === 6, 'Packet C must have 6 source files');
  assert(packetC.summary.total_scalar_diff_count === 1406, 'Packet C must prove 1406 scalar diffs');
  assert(packetC.summary.total_non_license_diff_count === 0, 'Packet C must have zero non-license diffs');
  assert(packetC.summary.total_non_pd_to_public_domain_diff_count === 0, 'Packet C must have zero non-PD-to-Public-Domain diffs');
  assert(packetC.summary.all_diffs_are_license_fields === true, 'Packet C all_diffs_are_license_fields must be true');
  assert(packetC.summary.all_diffs_are_pd_to_public_domain === true, 'Packet C all_diffs_are_pd_to_public_domain must be true');

  assert(packetA.summary.blocked_downstream_direct_paths === preflight.summary.track_candidate_downstream_direct_paths, 'Packet A direct downstream count must match preflight');
  assert(packetB.summary.blocked_downstream_direct_paths === preflight.summary.missing_manifest_downstream_direct_paths, 'Packet B direct downstream count must match preflight');
  assert(packetC.summary.blocked_downstream_direct_paths === preflight.summary.modified_tracked_downstream_direct_paths, 'Packet C direct downstream count must match preflight');
  assert(packetA.summary.blocked_downstream_direct_paths === countDirect(packetA.track_candidate_sources), 'Packet A direct downstream summary mismatch');
  assert(packetB.summary.blocked_downstream_direct_paths === countDirect(packetB.missing_manifest_sources), 'Packet B direct downstream summary mismatch');
  assert(packetC.summary.blocked_downstream_direct_paths === countDirect(packetC.modified_tracked_sources), 'Packet C direct downstream summary mismatch');
  assert(packetA.summary.blocked_downstream_content_reference_paths === countContent(packetA.track_candidate_sources), 'Packet A content-reference summary mismatch');
  assert(packetB.summary.blocked_downstream_content_reference_paths === countContent(packetB.missing_manifest_sources), 'Packet B content-reference summary mismatch');
  assert(packetC.summary.blocked_downstream_content_reference_paths === countContent(packetC.modified_tracked_sources), 'Packet C content-reference summary mismatch');

  for (const row of packetB.missing_manifest_sources) {
    assert(row.expected_lexical_manifest_paths.length > 0, `Packet B row ${row.source_path} missing expected manifest path`);
    for (const p of row.expected_lexical_manifest_paths) {
      assert(!fs.existsSync(p), `Packet B expected manifest path unexpectedly exists: ${p}`);
    }
  }

  for (const row of packetC.modified_tracked_sources) {
    assert(row.scalar_diff_proof.scalar_diff_count === row.diff_count_from_closure_packet, `Packet C scalar diff proof mismatch for ${row.source_path}`);
    assert(row.scalar_diff_proof.all_diffs_are_license_fields === true, `Packet C non-license proof failure for ${row.source_path}`);
    assert(row.scalar_diff_proof.all_diffs_are_pd_to_public_domain === true, `Packet C PD normalization proof failure for ${row.source_path}`);
    assert(row.scalar_diff_proof.non_license_diff_count === 0, `Packet C non-license count failure for ${row.source_path}`);
    assert(row.scalar_diff_proof.non_pd_to_public_domain_diff_count === 0, `Packet C non-PD normalization count failure for ${row.source_path}`);
  }

  assert(index.packets.packet_a_tracking_review_candidates.summary.track_candidate_source_files === packetA.summary.track_candidate_source_files, 'Index Packet A summary mismatch');
  assert(index.packets.packet_b_missing_manifest_remediation_or_exclusion.summary.missing_manifest_source_files === packetB.summary.missing_manifest_source_files, 'Index Packet B summary mismatch');
  assert(index.packets.packet_c_license_label_normalization.summary.modified_tracked_source_files === packetC.summary.modified_tracked_source_files, 'Index Packet C summary mismatch');
  if (queueCandidate) {
    assert(queueCandidate.artifact_type === 'agent1_source_custody_followup_queue_intake_candidate', 'Queue candidate artifact_type mismatch');
    assert(queueCandidate.requested_queue_item.request_id === 'agent6-agent1-source-custody-followup-packets', 'Queue candidate request_id mismatch');
    assert(queueCandidate.requested_queue_item.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', 'Queue candidate status mismatch');
    assert(queueCandidate.current_packet_summaries.packet_a.track_candidate_source_files === packetA.summary.track_candidate_source_files, 'Queue candidate Packet A summary mismatch');
    assert(queueCandidate.current_packet_summaries.packet_b.missing_manifest_source_files === packetB.summary.missing_manifest_source_files, 'Queue candidate Packet B summary mismatch');
    assert(queueCandidate.current_packet_summaries.packet_c.modified_tracked_source_files === packetC.summary.modified_tracked_source_files, 'Queue candidate Packet C summary mismatch');
    assert(queueCandidate.current_packet_summaries.packet_c.total_scalar_diff_count === 1406, 'Queue candidate Packet C scalar diff mismatch');
    assert(queueCandidate.boundary.publication_state === 'blocked_no_render', 'Queue candidate publication state mismatch');
    assert(queueCandidate.boundary.source_provenance_acceptance_claimed === false, 'Queue candidate must not claim source/provenance acceptance');
    assert(queueCandidate.boundary.source_file_tracking_approval_claimed === false, 'Queue candidate must not claim source-file tracking approval');
    assert(queueCandidate.boundary.source_file_staging_claimed === false, 'Queue candidate must not claim source-file staging');
  }
  assert(decision.summary.track_candidate_source_files === 17, 'Decision packet track-candidate source count drift');
  assert(decision.summary.missing_manifest_source_files === 6, 'Decision packet missing-manifest source count drift');
  assert(decision.summary.modified_tracked_source_files === 6, 'Decision packet modified-tracked source count drift');
  assert(closure.summary.untracked_track_candidates_with_lexical_manifest === 17, 'Closure options track-candidate count drift');
  assert(closure.summary.untracked_requires_missing_lexical_manifest_remediation === 6, 'Closure options missing-manifest count drift');
  assert(closure.summary.modified_tracked_license_label_only_rows === 6, 'Closure options modified-tracked count drift');

  const liveUntracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'], {
    encoding: 'utf8'
  }).trim().split(/\r?\n/).filter(Boolean).sort();
  assert(liveUntracked.length === 23, `live untracked source count drifted: ${liveUntracked.length}`);
  for (const sourcePath of [...REQUIRED_TRACK_SOURCES, ...REQUIRED_MISSING_MANIFEST_SOURCES]) {
    assert(liveUntracked.includes(sourcePath), `follow-up untracked source missing from live git discovery: ${sourcePath}`);
  }

  const result = {
    ok: true,
    generated_at: new Date().toISOString(),
    packet_a: packetA.summary,
    packet_b: packetB.summary,
    packet_c: packetC.summary,
    queue_candidate: queueCandidate ? {
      request_id: queueCandidate.request_id,
      status: queueCandidate.requested_queue_item.status,
      output: PATHS.queueCandidate
    } : null,
    live_untracked_sources: liveUntracked.length,
    boundary: index.boundary
  };
  writeJson(PATHS.validatorResult, result);
  console.log(JSON.stringify(result, null, 2));
}

main();
