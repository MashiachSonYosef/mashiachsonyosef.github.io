#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ROOT = process.cwd();
const OUTPUT_JSON = 'reports/a14-dictionary-nc-corpus-coverage-matrix-2026-06-11.json';
const OUTPUT_MD = 'reports/a14-dictionary-nc-corpus-coverage-matrix-2026-06-11.md';

const INPUTS = {
  safeAddContract: 'reports/a13-old-dictionary-safe-add-contract-2026-06-11.json',
  sourceFamilyManifest: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  gapManifest: 'data/definitions/definition-expansion-gap-manifest.json',
  routeLookupManifest: 'data/definitions/hud-route-lookup/manifest.json',
  coverageDir: 'data/reports/coverage',
  unresolvedDir: 'data/lexical/unresolved',
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function listFiles(relativeDir, ext) {
  const absoluteDir = path.join(ROOT, relativeDir);
  return fs.readdirSync(absoluteDir)
    .filter((name) => name.endsWith(ext))
    .sort()
    .map((name) => path.join(relativeDir, name).replaceAll('\\', '/'));
}

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function percent(part, whole) {
  if (!whole) return 0;
  return Number(((part / whole) * 100).toFixed(2));
}

function laneForSourceFamily(sourceFamily, licenseLane) {
  if (licenseLane === 'commercial_clean_candidate') return 'commercial_clean_candidate';
  if (licenseLane === 'noncommercial_educational_candidate') return 'noncommercial_educational_candidate';
  if (licenseLane === 'blocked_or_needs_review' || sourceFamily === 'BDB Augmented Strong') return 'blocked_or_needs_review';
  return licenseLane || 'unknown';
}

function addMetric(target, sourceFamily, lane, occurrenceCount) {
  if (!target[sourceFamily]) {
    target[sourceFamily] = {
      source_family: sourceFamily,
      license_lane: lane,
      matched_unique_token_ids: 0,
      matched_occurrences: 0,
    };
  }
  target[sourceFamily].matched_unique_token_ids += 1;
  target[sourceFamily].matched_occurrences += occurrenceCount;
}

function topRows(rows, field, limit = 10) {
  return [...rows]
    .sort((a, b) => (b[field] || 0) - (a[field] || 0) || a.work_id.localeCompare(b.work_id))
    .slice(0, limit);
}

function summarizeSourceFamilies(sourceFamilyManifest) {
  const tokenToFamilies = new Map();
  const sourceFamilies = [];
  for (const family of sourceFamilyManifest.source_family_manifests || []) {
    const lane = laneForSourceFamily(family.source_family, family.license_lane);
    sourceFamilies.push({
      source_family: family.source_family,
      license_lane: lane,
      row_count: family.row_count || 0,
      occurrence_count: family.occurrence_count || 0,
      transform_allowed_now: false,
      active_output_allowed: false,
      prehud_allowed: false,
      display_eligible: false,
    });
    for (const tokenId of family.token_ids || []) {
      const existing = tokenToFamilies.get(tokenId) || [];
      existing.push({
        source_family: family.source_family,
        license_lane: lane,
      });
      tokenToFamilies.set(tokenId, existing);
    }
  }
  return { sourceFamilies, tokenToFamilies };
}

function readCoverageRows(coverageFiles) {
  return coverageFiles.map((relativePath) => {
    const coverage = readJson(relativePath);
    return {
      work_id: coverage.work_id,
      work_title: coverage.work_title,
      category: coverage.category,
      coverage_path: relativePath,
      source_units: coverage.source_units || 0,
      total_tokens: coverage.total_tokens || 0,
      matched_tokens: coverage.matched_tokens || 0,
      strict_tokens: coverage.strict_tokens || 0,
      potential_tokens: coverage.potential_tokens || 0,
      unresolved_tokens: coverage.unresolved_tokens || 0,
      lexical_coverage_percent: coverage.lexical_coverage_percent || 0,
      top_unresolved_count: Array.isArray(coverage.top_unresolved_by_frequency)
        ? coverage.top_unresolved_by_frequency.length
        : 0,
    };
  });
}

async function scanUnresolvedCsv(relativePath, tokenToFamilies) {
  const absolutePath = path.join(ROOT, relativePath);
  const stream = fs.createReadStream(absolutePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let header;
  let rowCount = 0;
  let workId = path.basename(relativePath, '.csv');
  let workTitle = workId;
  const sourceFamilyMetrics = {};
  const laneMetrics = {};
  const matchedTokenIds = new Set();
  const matchedTokenEvidence = new Map();

  for await (const rawLine of rl) {
    const line = rawLine.replace(/^\uFEFF/, '');
    if (!line.trim()) continue;
    if (!header) {
      header = parseCsvLine(line);
      continue;
    }
    const cells = parseCsvLine(line);
    rowCount += 1;
    const row = Object.fromEntries(header.map((name, index) => [name, cells[index] ?? '']));
    workId = row.work_id || workId;
    workTitle = row.work_title || workTitle;
    const tokenId = row.token_index_id;
    const families = tokenToFamilies.get(tokenId);
    if (!families) continue;
    const occurrenceCount = Number.parseInt(row.occurrence_count || '0', 10) || 0;
    matchedTokenIds.add(tokenId);
    if (!matchedTokenEvidence.has(tokenId)) {
      matchedTokenEvidence.set(tokenId, {
        token_id: tokenId,
        surface_word: row.surface_word || '',
        normalized_word: row.normalized_word || '',
        occurrence_count: occurrenceCount,
        example_refs: row.example_refs || '',
        source_families: [],
        license_lanes: [],
        active_output_allowed: false,
        prehud_allowed: false,
        display_eligible: false,
      });
    }
    const tokenEvidence = matchedTokenEvidence.get(tokenId);
    for (const family of families) {
      addMetric(sourceFamilyMetrics, family.source_family, family.license_lane, occurrenceCount);
      tokenEvidence.source_families.push(family.source_family);
      tokenEvidence.license_lanes.push(family.license_lane);
      if (!laneMetrics[family.license_lane]) {
        laneMetrics[family.license_lane] = {
          license_lane: family.license_lane,
          matched_unique_token_ids: 0,
          matched_occurrences: 0,
        };
      }
      laneMetrics[family.license_lane].matched_unique_token_ids += 1;
      laneMetrics[family.license_lane].matched_occurrences += occurrenceCount;
    }
  }

  return {
    work_id: workId,
    work_title: workTitle,
    unresolved_path: relativePath,
    unresolved_unique_rows: rowCount,
    matched_unique_token_ids: matchedTokenIds.size,
    matched_token_evidence: Array.from(matchedTokenEvidence.values()).map((item) => ({
      ...item,
      source_families: [...new Set(item.source_families)].sort(),
      license_lanes: [...new Set(item.license_lanes)].sort(),
    })),
    source_family_metrics: Object.values(sourceFamilyMetrics),
    lane_metrics: Object.values(laneMetrics),
  };
}

function mergeRows(coverageRows, unresolvedRows) {
  const unresolvedByWork = new Map(unresolvedRows.map((row) => [row.work_id, row]));
  return coverageRows.map((coverage) => {
    const unresolved = unresolvedByWork.get(coverage.work_id) || {
      unresolved_unique_rows: 0,
      matched_unique_token_ids: 0,
      source_family_metrics: [],
      lane_metrics: [],
    };
    const laneTotals = Object.fromEntries(
      unresolved.lane_metrics.map((metric) => [metric.license_lane, metric]),
    );
    return {
      ...coverage,
      unresolved_unique_rows: unresolved.unresolved_unique_rows,
      old_dictionary_candidate_unique_token_ids: unresolved.matched_unique_token_ids,
      old_dictionary_candidate_occurrences: unresolved.lane_metrics.reduce(
        (sum, metric) => sum + metric.matched_occurrences,
        0,
      ),
      commercial_clean_candidate_occurrences:
        laneTotals.commercial_clean_candidate?.matched_occurrences || 0,
      noncommercial_educational_candidate_occurrences:
        laneTotals.noncommercial_educational_candidate?.matched_occurrences || 0,
      blocked_or_needs_review_occurrences:
        laneTotals.blocked_or_needs_review?.matched_occurrences || 0,
      old_dictionary_candidate_source_families: unresolved.source_family_metrics,
      old_dictionary_candidate_lanes: unresolved.lane_metrics,
      old_dictionary_candidate_tokens: unresolved.matched_token_evidence || [],
      old_dictionary_active_output_allowed: false,
      old_dictionary_prehud_allowed: false,
      old_dictionary_display_eligible: false,
    };
  });
}

function aggregateLaneTotals(workRows) {
  const totals = {};
  for (const row of workRows) {
    for (const laneMetric of row.old_dictionary_candidate_lanes) {
      if (!totals[laneMetric.license_lane]) {
        totals[laneMetric.license_lane] = {
          license_lane: laneMetric.license_lane,
          matched_unique_work_count: 0,
          matched_unique_token_ids_nonexclusive: 0,
          matched_occurrences_nonexclusive: 0,
        };
      }
      totals[laneMetric.license_lane].matched_unique_work_count += 1;
      totals[laneMetric.license_lane].matched_unique_token_ids_nonexclusive +=
        laneMetric.matched_unique_token_ids;
      totals[laneMetric.license_lane].matched_occurrences_nonexclusive +=
        laneMetric.matched_occurrences;
    }
  }
  return Object.values(totals).sort((a, b) => a.license_lane.localeCompare(b.license_lane));
}

function chooseExampleCandidates(workRows) {
  const byAny = topRows(
    workRows.filter((row) => row.old_dictionary_candidate_occurrences > 0),
    'old_dictionary_candidate_occurrences',
    12,
  );
  const byCommercial = topRows(
    workRows.filter((row) => row.commercial_clean_candidate_occurrences > 0),
    'commercial_clean_candidate_occurrences',
    8,
  );
  const byNc = topRows(
    workRows.filter((row) => row.noncommercial_educational_candidate_occurrences > 0),
    'noncommercial_educational_candidate_occurrences',
    8,
  );
  const byBlocked = topRows(
    workRows.filter((row) => row.blocked_or_needs_review_occurrences > 0),
    'blocked_or_needs_review_occurrences',
    8,
  );

  return {
    review_purpose:
      'Lock examples only after A1/A6/A10 review; these are evidence targets, not display acceptance.',
    highest_any_old_dictionary_candidate_occurrences: byAny,
    commercial_clean_candidate_examples: byCommercial,
    nc_evidence_only_examples: byNc,
    blocked_review_examples: byBlocked,
  };
}

function buildMarkdown(matrix) {
  const lines = [];
  lines.push('# A14 Dictionary / NC Corpus Coverage Matrix');
  lines.push('');
  lines.push(`Generated: ${matrix.generated_at}`);
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push('- Evidence matrix only; no active lexical/source-layer mutation.');
  lines.push('- Old dictionaries and NC rows remain lane-preserved, fail-closed evidence.');
  lines.push('- No preHUD, answer, Definition, source/license/legal, publication, or release acceptance.');
  lines.push('');
  lines.push('## Corpus Scope');
  lines.push('');
  lines.push(`- Coverage JSON files: ${matrix.counts.coverage_json_files}`);
  lines.push(`- Unresolved CSV files: ${matrix.counts.unresolved_csv_files}`);
  lines.push(`- Works with coverage rows: ${matrix.counts.work_rows}`);
  lines.push(`- Works with old-dictionary candidate hits: ${matrix.counts.works_with_old_dictionary_candidate_hits}`);
  lines.push(`- Works with NC evidence-only hits: ${matrix.counts.works_with_nc_evidence_hits}`);
  lines.push(`- Total corpus tokens: ${matrix.counts.total_tokens}`);
  lines.push(`- Total unresolved tokens: ${matrix.counts.unresolved_tokens}`);
  lines.push(`- Corpus lexical coverage: ${matrix.counts.lexical_coverage_percent}%`);
  lines.push('');
  lines.push('## Old Dictionary Lane Totals');
  lines.push('');
  lines.push('| lane | works | token ids | occurrences | active output | preHUD |');
  lines.push('| --- | ---: | ---: | ---: | --- | --- |');
  for (const row of matrix.old_dictionary_lane_match_totals) {
    lines.push(
      `| ${row.license_lane} | ${row.matched_unique_work_count} | ${row.matched_unique_token_ids_nonexclusive} | ${row.matched_occurrences_nonexclusive} | false | false |`,
    );
  }
  lines.push('');
  lines.push('## Example Lock Candidates');
  lines.push('');
  lines.push('These are review targets only. They do not authorize display text.');
  lines.push('');
  lines.push('| work | title | old-dict occ | commercial occ | NC occ | blocked occ | coverage |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |');
  for (const row of matrix.example_lock_candidates.highest_any_old_dictionary_candidate_occurrences.slice(0, 10)) {
    lines.push(
      `| ${row.work_id} | ${row.work_title} | ${row.old_dictionary_candidate_occurrences} | ${row.commercial_clean_candidate_occurrences} | ${row.noncommercial_educational_candidate_occurrences} | ${row.blocked_or_needs_review_occurrences} | ${row.lexical_coverage_percent}% |`,
    );
  }
  lines.push('');
  lines.push('## Pipeline Position');
  lines.push('');
  for (const step of matrix.pipeline_position) {
    lines.push(`- ${step.step}: ${step.status}; next owner ${step.next_owner}; blocker ${step.blocker}`);
  }
  lines.push('');
  lines.push('## Stop Condition');
  lines.push('');
  lines.push(matrix.stop_condition);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const safeAddContract = readJson(INPUTS.safeAddContract);
  const sourceFamilyManifest = readJson(INPUTS.sourceFamilyManifest);
  const gapManifest = readJson(INPUTS.gapManifest);
  const routeLookupManifest = readJson(INPUTS.routeLookupManifest);
  const coverageFiles = listFiles(INPUTS.coverageDir, '.json');
  const unresolvedFiles = listFiles(INPUTS.unresolvedDir, '.csv');
  const { sourceFamilies, tokenToFamilies } = summarizeSourceFamilies(sourceFamilyManifest);
  const coverageRows = readCoverageRows(coverageFiles);
  const unresolvedRows = [];

  for (const csvFile of unresolvedFiles) {
    unresolvedRows.push(await scanUnresolvedCsv(csvFile, tokenToFamilies));
  }

  const workRows = mergeRows(coverageRows, unresolvedRows);
  const laneTotals = aggregateLaneTotals(workRows);
  const totalTokens = workRows.reduce((sum, row) => sum + row.total_tokens, 0);
  const matchedTokens = workRows.reduce((sum, row) => sum + row.matched_tokens, 0);
  const unresolvedTokens = workRows.reduce((sum, row) => sum + row.unresolved_tokens, 0);
  const matchedWorks = workRows.filter((row) => row.old_dictionary_candidate_occurrences > 0);

  const matrix = {
    schema_version: 1,
    artifact_type: 'a14_dictionary_nc_corpus_coverage_matrix',
    generated_at: new Date().toISOString(),
    status: 'evidence_matrix_ready_no_active_dictionary_or_nc_output',
    inputs: INPUTS,
    boundary: {
      purpose:
        'Corpus-wide evidence matrix for old/missed dictionary and NC lane planning across current coverage/unresolved outputs.',
      does_not_clear: [
        'source_license_legal_acceptance',
        'Definition_authority',
        'accepted_gloss_or_answer_text',
        'active_lexical_source_layer_mutation',
        'prehud_display_promotion',
        'public_runtime_release',
      ],
      old_dictionary_active_output_allowed: false,
      old_dictionary_prehud_allowed: false,
      old_dictionary_display_eligible: false,
      nc_policy:
        'Klein/noncommercial rows remain noncommercial educational evidence only; no commercial export, active display, preHUD, or accepted definition output.',
    },
    counts: {
      coverage_json_files: coverageFiles.length,
      unresolved_csv_files: unresolvedFiles.length,
      work_rows: workRows.length,
      works_with_old_dictionary_candidate_hits: matchedWorks.length,
      works_with_nc_evidence_hits: workRows.filter(
        (row) => row.noncommercial_educational_candidate_occurrences > 0,
      ).length,
      works_with_commercial_clean_candidate_hits: workRows.filter(
        (row) => row.commercial_clean_candidate_occurrences > 0,
      ).length,
      works_with_blocked_review_hits: workRows.filter(
        (row) => row.blocked_or_needs_review_occurrences > 0,
      ).length,
      total_tokens: totalTokens,
      matched_tokens: matchedTokens,
      unresolved_tokens: unresolvedTokens,
      lexical_coverage_percent: percent(matchedTokens, totalTokens),
      gap_manifest_rows: gapManifest.counts?.manifest_rows || 0,
      gap_manifest_rows_with_any_route: gapManifest.counts?.rows_with_any_route || 0,
      gap_manifest_prehud_allowed_rows: gapManifest.counts?.rows_prehud_allowed || 0,
      route_lookup_distinct_normalized_tokens:
        routeLookupManifest.counts?.distinct_normalized_tokens || 0,
      route_lookup_cards_written: routeLookupManifest.counts?.cards_written || 0,
    },
    source_lane_summary: {
      status_from_safe_add_contract: safeAddContract.status,
      active_destination_safe_for_old_dictionaries_now:
        safeAddContract.source_layer_destination_found?.active_destination_safe_for_old_dictionaries_now,
      source_families: sourceFamilies,
      membership_counts: sourceFamilyManifest.membership_counts,
      lane_counts: sourceFamilyManifest.lane_counts,
      safe_add_lane_separation: safeAddContract.lane_separation,
    },
    old_dictionary_lane_match_totals: laneTotals,
    work_rows: workRows,
    example_lock_candidates: chooseExampleCandidates(workRows),
    pipeline_position: [
      {
        step: 'corpus_evidence_matrix',
        status: 'complete_in_this_artifact',
        next_owner: 'A14/A10',
        blocker: 'none_for_evidence_matrix',
      },
      {
        step: 'source_family_row_clearance',
        status: 'blocked_pending_exact_A1_A6_subset_clearance',
        next_owner: 'A1/A6',
        blocker: 'active destination is unsafe for old dictionaries now',
      },
      {
        step: 'candidate_transform',
        status: 'blocked_until_A1_A6_clear_rows',
        next_owner: 'A2',
        blocker: 'allowed_transform_rows_now is 0 in source-family manifest',
      },
      {
        step: 'crossmatch_navigation',
        status: 'evidence_only_after_subset_selection',
        next_owner: 'A3',
        blocker: 'do not treat crossmatch as display authority',
      },
      {
        step: 'page_render_examples',
        status: 'blocked_until_safe_route_backed_candidate_package_exists',
        next_owner: 'A4/A10',
        blocker: 'no active dictionary/NC display package exists',
      },
    ],
    stop_condition:
      'Review matrix, choose a small example set, then request A1/A6 row-clearance packet before any active dictionary/NC transform or render work.',
  };

  fs.writeFileSync(path.join(ROOT, OUTPUT_JSON), `${JSON.stringify(matrix, null, 2)}\n`);
  fs.writeFileSync(path.join(ROOT, OUTPUT_MD), buildMarkdown(matrix));
  console.log(`wrote ${OUTPUT_JSON}`);
  console.log(`wrote ${OUTPUT_MD}`);
  console.log(
    `coverage=${matrix.counts.coverage_json_files} unresolved=${matrix.counts.unresolved_csv_files} matchedWorks=${matrix.counts.works_with_old_dictionary_candidate_hits}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
