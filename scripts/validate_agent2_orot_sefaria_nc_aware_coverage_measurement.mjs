import fs from 'node:fs';

const reportPath =
  'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json';
const markdownPath =
  'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.md';
const auditPath = 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json';
const previewPath =
  'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sumOccurrences(rows) {
  return rows.reduce((sum, row) => sum + (Number(row.occurrences) || 0), 0);
}

function classifyRows(rows) {
  const commercialFamilies = new Set([
    'BDB Aramaic Dictionary',
    'BDB Dictionary',
    'Jastrow Dictionary',
  ]);
  const ncFamilies = new Set(['Klein Dictionary']);
  const unresolvedFamilies = new Set(['BDB Augmented Strong']);
  const knownFamilies = new Set([
    ...commercialFamilies,
    ...ncFamilies,
    ...unresolvedFamilies,
  ]);

  const buckets = {
    commercial: [],
    ncAdditional: [],
    unresolvedOnly: [],
    noHit: [],
    ncOverlapCommercial: [],
    unresolvedOverlap: [],
    unknownOnly: [],
  };

  for (const row of rows) {
    const names = row.lexicon_names || [];
    const hasCommercial = names.some((name) => commercialFamilies.has(name));
    const hasNc = names.some((name) => ncFamilies.has(name));
    const hasUnresolved = names.some((name) => unresolvedFamilies.has(name));
    const hasUnknown = names.some((name) => !knownFamilies.has(name));
    const hasHit = (Number(row.combined_hit_count) || 0) > 0;

    if (hasCommercial) {
      buckets.commercial.push(row);
      if (hasNc) buckets.ncOverlapCommercial.push(row);
      if (hasUnresolved || hasUnknown) buckets.unresolvedOverlap.push(row);
    } else if (hasNc) {
      buckets.ncAdditional.push(row);
      if (hasUnresolved || hasUnknown) buckets.unresolvedOverlap.push(row);
    } else if (hasUnresolved || hasUnknown || hasHit) {
      buckets.unresolvedOnly.push(row);
      if (hasUnknown) buckets.unknownOnly.push(row);
    } else {
      buckets.noHit.push(row);
    }
  }

  return buckets;
}

function assertBoundary(report) {
  assert(report.boundary?.zero_emission === true, 'boundary must be zero emission');
  assert(report.boundary?.measurement_only === true, 'boundary must be measurement only');
  assert(report.boundary?.evidence_only === true, 'boundary must be evidence only');
  assert(report.boundary?.no_answer_rows === true, 'answer rows must be forbidden');
  assert(
    report.boundary?.no_answer_candidates_emitted === true,
    'answer candidates must be forbidden',
  );
  assert(report.boundary?.answer_eligible_true === 0, 'answer eligibility must remain zero');
  assert(report.boundary?.promote_to_answer_true === 0, 'promote_to_answer must remain zero');
  assert(
    report.boundary?.approved_for_public_emit_true === 0,
    'public emit approval must remain zero',
  );
  assert(report.boundary?.public_emit_ready_true === 0, 'public emit readiness must remain zero');
  assert(report.boundary?.public_hud_rows_emitted === 0, 'public HUD rows must remain zero');
  assert(report.boundary?.route_jsonl_rows_emitted === 0, 'route JSONL rows must remain zero');
  assert(report.boundary?.source_rows_emitted === 0, 'source rows must remain zero');
  assert(report.boundary?.definition_content_rows === 0, 'definition content rows must remain zero');
  assert(report.boundary?.nc_definition_content_stored === 0, 'NC definition content must be zero');
  assert(report.boundary?.runtime_files_touched === 0, 'runtime files touched must remain zero');
  assert(report.boundary?.source_files_touched === 0, 'source files touched must remain zero');
  assert(report.boundary?.token_index_files_touched === 0, 'token index files touched must remain zero');
  assert(
    report.boundary?.lexical_payload_files_touched === 0,
    'lexical payload files touched must remain zero',
  );
  assert(report.boundary?.public_mutation === false, 'public mutation must be false');
  assert(report.boundary?.no_license_acceptance === true, 'license acceptance must be rejected');
  assert(report.boundary?.no_source_provenance_acceptance === true, 'source acceptance must be rejected');
  assert(report.boundary?.no_qa_acceptance === true, 'QA acceptance must be rejected');
  assert(report.boundary?.no_definition_authority === true, 'Definition authority must be rejected');
  assert(report.boundary?.no_answer_acceptance === true, 'answer acceptance must be rejected');
  assert(report.boundary?.no_public_runtime_acceptance === true, 'runtime acceptance must be rejected');
  assert(report.boundary?.no_publication_readiness === true, 'publication readiness must be rejected');
}

function assertNcRows(report, buckets) {
  const rows = report.row_lists?.nc_commercial_export_exclusion_rows || [];
  assert(rows.length === buckets.ncAdditional.length, 'NC exclusion row count mismatch');
  assert(sumOccurrences(rows) === sumOccurrences(buckets.ncAdditional), 'NC exclusion occurrence mismatch');

  const expectedTokenIds = buckets.ncAdditional.map((row) => row.token_id).sort();
  const actualTokenIds = rows.map((row) => row.token_id).sort();
  assert(
    JSON.stringify(actualTokenIds) === JSON.stringify(expectedTokenIds),
    'NC exclusion token id list mismatch',
  );

  for (const row of rows) {
    assert(row.license_group === 'CC_BY_NC', `missing CC_BY_NC flag for ${row.token_id}`);
    assert(row.derived_from_nc === true, `missing derived_from_nc=true for ${row.token_id}`);
    assert(
      row.commercial_export_allowed === false,
      `commercial export must be false for ${row.token_id}`,
    );
    assert(
      row.noncommercial_display_allowed === false,
      `noncommercial display must stay false until boundary for ${row.token_id}`,
    );
    assert(row.attribution_required === true, `attribution flag missing for ${row.token_id}`);
    assert(row.corpus_contamination === false, `corpus contamination flag mismatch for ${row.token_id}`);

    for (const forbiddenKey of [
      'entry_body',
      'entry_body_text',
      'definition_text',
      'answer_text',
      'accepted_gloss',
      'accepted_text',
      'notes_text',
    ]) {
      assert(!(forbiddenKey in row), `forbidden content key ${forbiddenKey} present on ${row.token_id}`);
    }
  }
}

const report = readJson(reportPath);
const markdown = fs.readFileSync(markdownPath, 'utf8');
const audit = readJson(auditPath);
const preview = readJson(previewPath);
const buckets = classifyRows(audit.rows || []);

assert(
  report.artifact_type === 'agent2_orot_sefaria_nc_aware_coverage_measurement',
  'unexpected artifact type',
);
assertBoundary(report);

assert(report.measurement_scope?.audited_rows === 500, 'scoped audited rows must be 500');
assert(report.measurement_scope?.audited_occurrences === 8427, 'scoped audited occurrences must be 8427');
assert(report.measurement_scope?.network_calls_performed === 0, 'network calls must be zero');

assert(
  report.coverage_summary?.commercial_clean_candidate?.rows === buckets.commercial.length,
  'commercial-clean row count mismatch',
);
assert(
  report.coverage_summary?.commercial_clean_candidate?.occurrences === sumOccurrences(buckets.commercial),
  'commercial-clean occurrence count mismatch',
);
assert(
  report.coverage_summary?.additional_nc_educational_candidate?.rows === buckets.ncAdditional.length,
  'additional NC row count mismatch',
);
assert(
  report.coverage_summary?.additional_nc_educational_candidate?.occurrences ===
    sumOccurrences(buckets.ncAdditional),
  'additional NC occurrence count mismatch',
);
assert(
  report.coverage_summary?.commercial_clean_plus_nc_educational_candidate?.rows ===
    buckets.commercial.length + buckets.ncAdditional.length,
  'commercial-clean plus NC row count mismatch',
);
assert(
  report.coverage_summary?.commercial_clean_plus_nc_educational_candidate?.occurrences ===
    sumOccurrences(buckets.commercial) + sumOccurrences(buckets.ncAdditional),
  'commercial-clean plus NC occurrence count mismatch',
);
assert(
  report.coverage_summary?.unresolved_or_blocked_only?.rows === buckets.unresolvedOnly.length,
  'unresolved-only row count mismatch',
);
assert(
  report.coverage_summary?.no_hit_or_unusable_in_scoped_sefaria_lane?.rows === buckets.noHit.length,
  'no-hit row count mismatch',
);

assert(
  report.reconciliation_with_existing_preview?.public_domain_preview_rows ===
    preview.summary.public_domain_observed_rows,
  'preview row reconciliation mismatch',
);
assert(
  report.reconciliation_with_existing_preview?.matches_current_commercial_clean_measurement === true,
  'preview must reconcile with commercial-clean measurement',
);

assertNcRows(report, buckets);

const statuses = report.agent1_6_matrix_schema_request?.statuses || [];
for (const status of [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_only',
  'external_link_only',
  'blocked',
]) {
  assert(statuses.includes(status), `missing matrix status ${status}`);
}

assert(
  markdown.includes('Agent 8 direct callback delivery unavailable; callback requires relay'),
  'markdown must include Agent 8 direct callback delivery blocker',
);
assert(markdown.includes('No network/API calls were performed.'), 'markdown must state zero network/API calls');
assert(markdown.includes('What Must Not Be Accepted'), 'markdown must include non-acceptance boundary');

console.log(
  `Agent 2 Orot/Sefaria NC-aware coverage measurement validation passed: ` +
    `${buckets.commercial.length} commercial-clean rows / ${sumOccurrences(buckets.commercial)} occurrences; ` +
    `${buckets.ncAdditional.length} additional NC rows / ${sumOccurrences(buckets.ncAdditional)} occurrences.`,
);
