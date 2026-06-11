#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  inputRows: 'reports/agent1-third-missed-source-family-input-rows-2026-06-05.json',
  sourceIndex: 'data/search/lemma-form-index.jsonl',
  outputJson: 'reports/agent1-orot-third-missed-source-family-map-2026-06-05.json',
  outputMd: 'reports/agent1-orot-third-missed-source-family-map-2026-06-05.md'
};

const LICENSE_RULES = [
  {
    key: 'CC_BY_NC',
    patterns: [/cc\s*by\s*-?\s*nc/i],
    lane: 'noncommercial_educational_candidate',
    licenseLabel: 'CC_BY_NC'
  },
  {
    key: 'CC0',
    patterns: [/^cc0$/i, /public domain/i, /public-domain/i, /cc0-1\.0/i],
    lane: 'commercial_clean_candidate',
    licenseLabel: 'CC0'
  },
  {
    key: 'PUBLIC_DOMAIN',
    patterns: [/public\s*domain/i, /pd-?public/i, /unlicensed/i],
    lane: 'commercial_clean_candidate',
    licenseLabel: 'public_domain'
  },
  {
    key: 'CC_BY',
    patterns: [/cc\s*by-/i, /cc\s*by$/i, /cc by/i],
    lane: 'blocked_or_needs_review',
    licenseLabel: 'CC_BY'
  },
  {
    key: 'UNKNOWN',
    patterns: [],
    lane: 'blocked_or_needs_review',
    licenseLabel: 'license_unknown'
  }
];

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeLicense(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function classifyLicense(license) {
  const normalized = normalizeLicense(license).toLowerCase();
  for (const rule of LICENSE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return { lane: rule.lane, licenseLabel: rule.licenseLabel };
    }
  }
  return { lane: 'blocked_or_needs_review', licenseLabel: normalized || 'license_unknown' };
}

function readLemmaSourceMap(inputRowsPath, sourceIndexPath) {
  const input = readJson(inputRowsPath);
  const wanted = new Set((input.rows_data || []).map((row) => row.lexicon_entry_id).filter(Boolean));
  const map = new Map();
  const sourceRows = fs.readFileSync(fullPath(sourceIndexPath), 'utf8').split(/\r?\n/);
  for (const line of sourceRows) {
    if (!line) continue;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (_) {
      continue;
    }
    if (!wanted.has(parsed.entry_id)) continue;
    const bucket = map.get(parsed.entry_id) || [];
    bucket.push(parsed);
    map.set(parsed.entry_id, bucket);
  }
  return map;
}

function buildSourceFingerprint(entries) {
  const unique = new Map();
  for (const row of entries || []) {
    const sourceName = normalizeLicense(row.source_name);
    const sourceUrl = normalizeLicense(row.source_url);
    const license = normalizeLicense(row.lexical_license);
    const layer = normalizeLicense(row.layer_id);
    const key = `${sourceName}|${sourceUrl}|${license}|${layer}`;
    unique.set(key, {
      source_name: sourceName || 'source_name_unknown',
      source_family: sourceName || 'source_family_unknown',
      source_url: sourceUrl || 'missing_source_url_or_citation',
      license,
      layer
    });
  }
  return [...unique.values()];
}

const input = readJson(PATHS.inputRows);
const matrix = readLemmaSourceMap(PATHS.inputRows, PATHS.sourceIndex);
const rows = input.rows_data || [];
const contractPath = 'reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json';
const contractExists = fs.existsSync(fullPath(contractPath));
const contract = contractExists ? readJson(contractPath) : null;

const mappedRows = rows.map((row) => {
  const sourceId = row.lexicon_entry_id;
  const sourceRows = sourceId ? matrix.get(sourceId) || [] : [];
  const uniqueSources = buildSourceFingerprint(sourceRows);
  let status = 'blocked_or_needs_review';
  let lane = 'blocked_or_needs_review';
  let licenseLabel = 'license_unknown';
  let sourceFamily = row.source_family || 'missing_source_family_evidence';
  let sourceName = row.source_name || 'missing_source_name_evidence';
  let sourceUrl = row.source_url_or_citation || 'missing_source_url_or_citation';
  let attributionRequired = Boolean(row.agent6_boundary_required) || true;
  let derivedFromNc = false;
  let ownerUseAttestation = null;
  let corpusContamination = false;
  let blockerReason = null;
  let exactBlocked = false;
  let metadataSource = false;

  if (!sourceId) {
    status = 'blocked_or_needs_review';
    blockerReason = 'missing_lexicon_entry_id_in_input_row';
    exactBlocked = true;
  } else if (uniqueSources.length === 0) {
    status = 'blocked_or_needs_review';
    blockerReason = 'exact source-layer evidence missing from lemma-form index';
    exactBlocked = true;
  } else if (uniqueSources.length > 1) {
    status = 'blocked_or_needs_review';
    blockerReason = 'multiple source-layer candidates for lexicon entry; exact source-family/lane split requires per-entry source partition join.';
    exactBlocked = true;
    const [sample] = uniqueSources;
    sourceFamily = sample.source_family;
    sourceName = sample.source_name;
    sourceUrl = sample.source_url;
    licenseLabel = sample.license || 'license_unknown';
    lane = 'blocked_or_needs_review';
    metadataSource = true;
  } else {
    const evidence = uniqueSources[0];
    sourceFamily = evidence.source_family || sourceFamily;
    sourceName = evidence.source_name || sourceName;
    sourceUrl = evidence.source_url || sourceUrl;
    const inferred = classifyLicense(evidence.license || row.license_label);
    lane = inferred.lane;
    licenseLabel = inferred.licenseLabel;
    status = lane;
    const isNc = /cc_by_nc/i.test(licenseLabel) || /noncommercial/i.test(inferred.licenseLabel);
    derivedFromNc = isNc;
    attributionRequired = true;
    corpusContamination = false;
    if (isNc) {
      ownerUseAttestation = 'noncommercial_educational_zero_profit_zero_kickback';
      blockerReason = null;
    } else if (lane === 'commercial_clean_candidate') {
      blockerReason = 'blocked by Agent 6 boundary until exact export/storage behavior is approved';
      metadataSource = true;
    } else {
      blockerReason = 'blocked_or_needs_review: source/license lane requires boundary and independent source/license proof before candidate use.';
      metadataSource = true;
    }
  }

  return {
    row_subset_id: row.row_subset_id || row.token_id_or_row_id,
    token_id_or_row_id: row.token_id_or_row_id,
    target_token_id: row.token_id_or_row_id,
    lexicon_entry_id: sourceId || null,
    source_family: sourceFamily,
    source_name: sourceName,
    license_label: licenseLabel,
    license_lane: lane,
    attribution_required: attributionRequired,
    derived_from_nc: derivedFromNc,
    commercial_export_allowed: false,
    owner_use_attestation: ownerUseAttestation,
    corpus_contamination: corpusContamination,
    source_url_or_citation: sourceUrl,
    agent6_boundary_required: true,
    answer_eligible: false,
    public_emit: false,
    rows: row.rows || 1,
    occurrences: row.occurrences || 0,
    blocker_reason: blockerReason,
    status,
    source_audit_priority: row.source_audit_priority,
    category: row.category,
    source_route_needed: row.source_route_needed,
    surface: row.surface || null,
    normalized: row.normalized || null,
    metadata_source_only: metadataSource,
    exact_blocker: exactBlocked ? 'exact source-family/license split requires additional evidence for candidate use' : null
  };
});

const countsByLane = mappedRows.reduce((acc, row) => {
  acc.byLane[row.license_lane] = (acc.byLane[row.license_lane] || 0) + 1;
  acc.occurrencesByLane[row.license_lane] = (acc.occurrencesByLane[row.license_lane] || 0) + Number(row.occurrences || 0);
  return acc;
}, { byLane: {}, occurrencesByLane: {} });

const totalRows = mappedRows.length;
const totalOccurrences = mappedRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
const laneBlockedRows = mappedRows.filter((row) => row.license_lane === 'blocked_or_needs_review').length;
const laneMetadataRows = mappedRows.filter((row) => row.metadata_source_only).length;

const output = {
  schema_version: 1,
  artifact_type: 'agent1_orot_third_missed_source_family_map',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs',
  status: totalRows === 169 && totalOccurrences === 2148
    ? 'agent1_orot_third_missed_source_family_map_built_for_agent6_boundary_only'
    : 'agent1_orot_third_missed_source_family_map_status_unvalidated',
  contract: contract ? contractPath : null,
  pipeline_runnable_inputs: {
    inputRows: PATHS.inputRows,
    sourceIndex: PATHS.sourceIndex
  },
  source_review_basis: {
    source_index_lookup: PATHS.sourceIndex,
    source_rows_found: matrix.size,
    exact_linkage_blocker_rows: input.exact_linkage_blocker_rows || 0,
    exact_linkage_blocker_occurrences: input.exact_linkage_blocker_occurrences || 0
  },
  target_counts: {
    candidate_rows: 169,
    candidate_occurrences: 2148,
    commercial_clean_candidate_rows: countsByLane.byLane.commercial_clean_candidate || 0,
    commercial_clean_candidate_occurrences: countsByLane.occurrencesByLane.commercial_clean_candidate || 0,
    noncommercial_educational_candidate_rows: countsByLane.byLane.noncommercial_educational_candidate || 0,
    noncommercial_educational_candidate_occurrences: countsByLane.occurrencesByLane.noncommercial_educational_candidate || 0,
    metadata_or_link_only_rows: countsByLane.byLane.metadata_or_link_only || 0,
    blocked_or_needs_review_rows: countsByLane.byLane.blocked_or_needs_review || 0,
    metadata_source_rows: laneMetadataRows
  },
  rows,
  row_status_counts: {
    by_lane: countsByLane.byLane,
    by_blocked: {
      exact_missing_lexicon_entry_id: mappedRows.filter((row) => row.blocker_reason === 'missing_lexicon_entry_id_in_input_row').length,
      exact_missing_source_layer_evidence: mappedRows.filter((row) => row.blocker_reason === 'exact source-layer evidence missing from lemma-form index').length,
      multiple_source_candidates: mappedRows.filter((row) => row.blocker_reason && row.blocker_reason.includes('multiple source-layer candidates')).length
    }
  },
  source_family_blockers: [
    {
      lane: 'blocked_or_needs_review',
      reason: 'Multiple-source entries or missing source-layer evidence remain exact blockers before candidate text use.',
      rows: laneBlockedRows
    }
  ],
  export_partition_rule: {
    commercial_clean_exports_exclude_nc_by_default: true,
    nc_educational_export_separate: true,
    do_not_mix_nc_into_commercial_clean_csv: true,
    blocked_or_needs_review_emits_no_candidate_text: true,
    metadata_or_link_only_emits_citation_only: true
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    accepted_text_rows: 0
  },
  agent6_boundary_required_now: true,
  agent6_boundary_question: 'Can noncommercial, commercial-clean, and blocked/review row-level subsets be accepted for this third-missed family after exact source-name partition evidence is reviewed?',
  non_acceptance_boundary: {
    no_source_license_acceptance: true,
    no_qa_acceptance: true,
    no_definition_authority: true,
    no_public_runtime_mutation: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_public_runtime_mutation_repeated: true,
    no_nc_commercial_authorization: true
  }
};

assert(totalRows === 169, 'mapped row count must be 169');
assert(totalOccurrences === 2148, 'mapped occurrence sum must be 2148');

output.rows = mappedRows;

const markdown = [
  '# Agent 1 Third-Missed Source Family Map - 2026-06-05',
  '',
  `Status: \`${output.status}\`.`,
  `Input: \`${PATHS.inputRows}\`.`,
  `Source evidence index: \`${PATHS.sourceIndex}\`.`,
  '',
  '## Counts',
  '',
  `- candidate rows / occurrences: \`${totalRows}\` / \`${totalOccurrences}\``,
  `- commercial-clean: \`${output.target_counts.commercial_clean_candidate_rows}\` / \`${output.target_counts.commercial_clean_candidate_occurrences}\``,
  `- noncommercial-educational: \`${output.target_counts.noncommercial_educational_candidate_rows}\` / \`${output.target_counts.noncommercial_educational_candidate_occurrences}\``,
  `- blocked/review: \`${output.target_counts.blocked_or_needs_review_rows}\` / \`${countsByLane.occurrencesByLane.blocked_or_needs_review || 0}\``,
  `- metadata/source-only rows: \`${laneMetadataRows}\``,
  '',
  '## Row/Subset Assignments',
  '',
  '| Row | License Lane | Source Family | Source Name | License Label | Attrib Req | Derived From NC | Commercial Export Allowed | Blocker |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...mappedRows.map((row) => `| ${row.row_subset_id} | ${row.license_lane} | ${row.source_family} | ${row.source_name} | ${row.license_label} | ${row.attribution_required} | ${row.derived_from_nc} | ${row.commercial_export_allowed} | ${row.blocker_reason || ''} |`)
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  artifact: PATHS.outputJson,
  rows: totalRows,
  occurrences: totalOccurrences,
  lanes: countsByLane.byLane
}, null, 2));
