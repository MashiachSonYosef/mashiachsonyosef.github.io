#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  stamp: 'data/definitions/hud-route-release-stamp.json',
  publicManifest: 'data/definitions/hud-route-lookup/manifest.json',
  contract: 'data/definitions/hud-route-contract.json',
  sample: 'data/definitions/hud-route-lookup-sample.json',
  boundaryReport: 'reports/route-publication-boundary-audit.json',
  report: '',
  skipDriftCheck: false,
};

const options = parseArgs(process.argv.slice(2));
const issues = [];
const warnings = [];
const unsafeAnswerSampleFields = new Set([
  'context',
  'card_id',
  'normalized',
  'route_family',
  'route_type',
  'display_section',
  'answer_score',
  'unsafe_source_rows',
]);
const unsafeAnswerSampleRowFields = new Set([
  'row_index',
  'source_name',
  'source_family',
  'source_id',
  'license',
  'license_url',
]);

const stamp = readJson(options.stamp, 'release stamp');
const publicManifest = readJson(options.publicManifest, 'public lookup manifest');
const contract = readJson(options.contract, 'HUD route contract');
const sample = readJson(options.sample, 'HUD route lookup sample');
const boundaryReport = readJson(options.boundaryReport, 'route publication boundary audit');
const allowedSections = new Set((contract.route_sections || []).map((section) => section.section_id).filter(Boolean));

if (stamp.schema_version !== 1) issues.push('release stamp schema_version must be 1');
if (stamp.artifact_type !== 'hud_route_release_stamp') issues.push('release stamp artifact_type must be hud_route_release_stamp');
if (stamp.status !== 'release_candidate') issues.push(`release stamp status must be release_candidate, got ${stamp.status || 'missing'}`);
if ((stamp.issues || []).length) issues.push(`release stamp carries ${stamp.issues.length} issue(s)`);
if (stamp.reconciliation?.counts_match !== true) issues.push('release stamp reconciliation.counts_match must be true');
if (cleanPath(stamp.public_lookup?.manifest_path) !== cleanPath(options.publicManifest)) {
  issues.push(`release stamp public manifest path ${stamp.public_lookup?.manifest_path || 'missing'} does not match ${cleanPath(options.publicManifest)}`);
}
if (cleanPath(publicManifest.source_local_manifest) !== cleanPath(stamp.local_lookup?.manifest_path)) {
  issues.push('public manifest source_local_manifest does not match stamped local lookup manifest path');
}
if (publicManifest.published_at !== stamp.public_lookup?.published_at) {
  issues.push('public manifest published_at does not match release stamp public_lookup.published_at');
}

const publicManifestSummary = await fileSummary(options.publicManifest);
compareSummary(publicManifestSummary, stamp.public_lookup?.file, 'public lookup manifest');

const shardSummary = summarizePublicShards(publicManifest, options.publicManifest);
const currentReconciliation = {
  public_cards_written: Number(publicManifest.counts?.cards_written || 0),
  public_distinct_normalized_tokens: Number(publicManifest.counts?.distinct_normalized_tokens || 0),
  public_shard_count: Number(publicManifest.counts?.shard_count || 0),
  public_manifest_shards: Array.isArray(publicManifest.shards) ? publicManifest.shards.length : 0,
  public_shard_files_on_disk: shardSummary.file_count,
  public_manifest_card_sum: shardSummary.card_sum,
  public_manifest_token_sum: shardSummary.token_sum,
  public_manifest_byte_sum: shardSummary.byte_sum,
};
for (const [key, currentValue] of Object.entries(currentReconciliation)) {
  if (stamp.reconciliation?.[key] !== currentValue) {
    issues.push(`reconciliation.${key} mismatch, stamp has ${stamp.reconciliation?.[key]}, current value is ${currentValue}`);
  }
}
if (currentReconciliation.public_manifest_shards !== currentReconciliation.public_shard_count) {
  issues.push('public manifest shard list length does not match public shard_count');
}
if (currentReconciliation.public_shard_files_on_disk !== currentReconciliation.public_shard_count) {
  issues.push('public shard files on disk do not match public shard_count');
}
if (currentReconciliation.public_manifest_card_sum !== currentReconciliation.public_cards_written) {
  issues.push('public shard card sum does not match public cards_written');
}
if (currentReconciliation.public_manifest_token_sum !== currentReconciliation.public_distinct_normalized_tokens) {
  issues.push('public shard token sum does not match public distinct_normalized_tokens');
}

for (const section of Object.keys(stamp.route_store?.counts?.route_sections || {})) {
  if (!allowedSections.has(section)) issues.push(`stamped route section ${section} is not listed in HUD route contract`);
}
for (const section of ['strict_hebrew', 'strict_aramaic', 'lemma', 'citable_paraphrase_evidence', 'phrase_evidence']) {
  if (!allowedSections.has(section)) issues.push(`HUD route contract is missing expected section ${section}`);
}

const requiredCardFields = new Set(contract.card_fields || []);
for (const field of ['answer_eligible', 'answer_role', 'source_rows', 'definition', 'display_label']) {
  if (!requiredCardFields.has(field)) issues.push(`HUD route contract card_fields is missing ${field}`);
}

validateSampleCards(sample, publicManifest, options.publicManifest);
await validateBoundaryReport(boundaryReport, currentReconciliation);
if (options.skipDriftCheck) {
  warnings.push('skipped current route source drift check');
} else {
  await compareFrozenInputsToCurrentSources(stamp);
}

const result = {
  schema_version: 1,
  artifact_type: 'hud_route_release_gate_report',
  generated_at: new Date().toISOString(),
  status: issues.length ? 'fail' : 'pass',
  release_id: stamp.release_id || '',
  public_manifest: cleanPath(options.publicManifest),
  public_cards_written: currentReconciliation.public_cards_written,
  public_distinct_normalized_tokens: currentReconciliation.public_distinct_normalized_tokens,
  public_shard_count: currentReconciliation.public_shard_count,
  route_publication_boundary: {
    report: cleanPath(options.boundaryReport),
    generator: cleanPath(boundaryReport.generator || ''),
    generator_sha256: boundaryReport.inputs?.generator_file?.sha256 || '',
    manifest_sha256: boundaryReport.inputs?.manifest_file?.sha256 || '',
    contract: cleanPath(boundaryReport.inputs?.contract || ''),
    allowed_display_sections: boundaryReport.contract?.allowed_display_sections || [],
    issues: Number(boundaryReport.counts?.issue_count || 0),
    warnings: Number(boundaryReport.counts?.warning_count || 0),
    fixture: cleanPath(boundaryReport.inputs?.fixture || ''),
    fixture_cases: Number(boundaryReport.inputs?.fixture_cases || 0),
    fixture_sha256: boundaryReport.inputs?.fixture_file?.sha256 || '',
    shard_identity_checks: Number(boundaryReport.counts?.shard_identity_checks || 0),
    shard_identity_mismatches: Number(boundaryReport.counts?.shard_identity_mismatches || 0),
    shard_count_fields_checked: Number(boundaryReport.counts?.shard_count_fields_checked || 0),
    shard_count_field_mismatches: Number(boundaryReport.counts?.shard_count_field_mismatches || 0),
    card_ids_checked: Number(boundaryReport.counts?.card_ids_checked || 0),
    duplicate_card_ids: Number(boundaryReport.counts?.duplicate_card_ids || 0),
    normalized_lookup_key_checks: Number(boundaryReport.counts?.normalized_lookup_key_checks || 0),
    normalized_lookup_key_mismatches: Number(boundaryReport.counts?.normalized_lookup_key_mismatches || 0),
    route_card_string_fields_checked: Number(boundaryReport.counts?.route_card_string_fields_checked || 0),
    invalid_route_card_string_fields: Number(boundaryReport.counts?.invalid_route_card_string_fields || 0),
    route_score_fields_checked: Number(boundaryReport.counts?.route_score_fields_checked || 0),
    invalid_route_score_fields: Number(boundaryReport.counts?.invalid_route_score_fields || 0),
    route_score_formula_checks: Number(boundaryReport.counts?.route_score_formula_checks || 0),
    invalid_route_score_formulas: Number(boundaryReport.counts?.invalid_route_score_formulas || 0),
    route_cards_with_source_rows: Number(boundaryReport.counts?.route_cards_with_source_rows || 0),
    route_cards_missing_source_rows: Number(boundaryReport.counts?.route_cards_missing_source_rows || 0),
    route_cards_with_duplicate_source_ids: Number(boundaryReport.counts?.route_cards_with_duplicate_source_ids || 0),
    source_row_string_fields_checked: Number(boundaryReport.counts?.source_row_string_fields_checked || 0),
    source_row_duplicate_source_ids: Number(boundaryReport.counts?.source_row_duplicate_source_ids || 0),
    invalid_source_row_string_fields: Number(boundaryReport.counts?.invalid_source_row_string_fields || 0),
    source_row_fields_used_entries_checked: Number(boundaryReport.counts?.source_row_fields_used_entries_checked || 0),
    invalid_source_row_fields_used_entries: Number(boundaryReport.counts?.invalid_source_row_fields_used_entries || 0),
    reference_url_fields_checked: Number(boundaryReport.counts?.reference_url_fields_checked || 0),
    invalid_reference_url_fields: Number(boundaryReport.counts?.invalid_reference_url_fields || 0),
    answer_eligible_cards_with_answer_score: Number(boundaryReport.counts?.answer_eligible_cards_with_answer_score || 0),
    answer_eligible_cards_missing_answer_score: Number(boundaryReport.counts?.answer_eligible_cards_missing_answer_score || 0),
    answer_role_answer_cards: Number(boundaryReport.counts?.answer_role_answer_cards || 0),
    answer_role_answer_noneligible_cards: Number(boundaryReport.counts?.answer_role_answer_noneligible_cards || 0),
    form_reference_cards: Number(boundaryReport.counts?.form_reference_cards || 0),
    invalid_form_reference_cards: Number(boundaryReport.counts?.invalid_form_reference_cards || 0),
    form_reference_tag_entries_checked: Number(boundaryReport.counts?.form_reference_tag_entries_checked || 0),
    invalid_form_reference_tag_entries: Number(boundaryReport.counts?.invalid_form_reference_tag_entries || 0),
    answer_eligible_translation_output_unsafe_samples: Array.isArray(boundaryReport.samples?.answer_eligible_translation_output_unsafe_cards)
      ? boundaryReport.samples.answer_eligible_translation_output_unsafe_cards.length
      : 0,
    translation_output_unsafe_cards: Number(boundaryReport.counts?.translation_output_unsafe_cards || 0),
    answer_eligible_translation_output_unsafe_source_rows: Number(boundaryReport.counts?.answer_eligible_translation_output_unsafe_source_rows || 0),
    answer_eligible_translation_output_unsafe_cards: Number(boundaryReport.counts?.answer_eligible_translation_output_unsafe_cards || 0),
  },
  checked_sample_tokens: Array.isArray(sample.sample_tokens) ? sample.sample_tokens.length : 0,
  issues,
  warnings,
};

if (options.report) writeReport(options.report, result);

if (issues.length) {
  console.error(`HUD route release gate failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  if (warnings.length) {
    console.error(`Warnings: ${warnings.length}`);
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log(`HUD route release gate passed: ${result.release_id}; public cards ${result.public_cards_written}; public shards ${result.public_shard_count}.`);
if (warnings.length) {
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--stamp') parsed.stamp = args[++index];
    else if (arg === '--public-manifest') parsed.publicManifest = args[++index];
    else if (arg === '--contract') parsed.contract = args[++index];
    else if (arg === '--sample') parsed.sample = args[++index];
    else if (arg === '--boundary-report') parsed.boundaryReport = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--skip-drift-check') parsed.skipDriftCheck = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_hud_route_release_gate.mjs',
      '',
      'Options:',
      '  --stamp data/definitions/hud-route-release-stamp.json',
      '  --public-manifest data/definitions/hud-route-lookup/manifest.json',
      '  --contract data/definitions/hud-route-contract.json',
      '  --sample data/definitions/hud-route-lookup-sample.json',
      '  --boundary-report reports/route-publication-boundary-audit.json',
      '  --report reports/hud-route-release-gate.md',
      '  --skip-drift-check',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath || '');
  if (!fs.existsSync(filePath)) throw new Error(`Missing ${label}: ${relativePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function fileSummary(relativePath) {
  const filePath = path.join(root, relativePath);
  return {
    path: cleanPath(relativePath),
    byte_length: fs.statSync(filePath).size,
    sha256: await sha256File(filePath),
  };
}

function compareSummary(current, stamped, label) {
  if (!stamped) {
    issues.push(`${label}: missing stamped file metadata`);
    return;
  }
  if (current.byte_length !== stamped.byte_length) {
    issues.push(`${label}: byte_length mismatch, stamp has ${stamped.byte_length}, current value is ${current.byte_length}`);
  }
  if (current.sha256 !== stamped.sha256) issues.push(`${label}: sha256 mismatch`);
}

function summarizePublicShards(manifest, manifestPath) {
  const publicDir = path.join(root, path.dirname(manifestPath));
  const shardDir = path.join(publicDir, 'shards');
  const manifestShardPaths = new Set((manifest.shards || []).map((shard) => shard.path));
  const diskShardPaths = fs.existsSync(shardDir)
    ? fs.readdirSync(shardDir).filter((file) => file.endsWith('.json')).map((file) => `shards/${file}`)
    : [];
  for (const shardPath of diskShardPaths) {
    if (!manifestShardPaths.has(shardPath)) issues.push(`stale public lookup shard not listed in manifest: ${shardPath}`);
  }
  for (const shard of manifest.shards || []) {
    const filePath = path.join(publicDir, shard.path || '');
    if (!fs.existsSync(filePath)) {
      issues.push(`missing public lookup shard: ${shard.path || 'missing path'}`);
      continue;
    }
    const actualBytes = fs.statSync(filePath).size;
    if (actualBytes !== shard.byte_length) {
      issues.push(`public lookup shard byte mismatch ${shard.path}: expected ${shard.byte_length}, got ${actualBytes}`);
    }
  }
  return {
    file_count: diskShardPaths.length,
    card_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.card_count || 0), 0),
    token_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.token_count || 0), 0),
    byte_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.byte_length || 0), 0),
  };
}

function validateSampleCards(routeSample, manifest, manifestPath) {
  if (routeSample.schema_version !== 1) issues.push('HUD route lookup sample schema_version must be 1');
  const publicDir = path.join(root, path.dirname(manifestPath));
  const manifestShardPaths = new Set((manifest.shards || []).map((shard) => shard.path));
  for (const [tokenIndex, token] of (routeSample.sample_tokens || []).entries()) {
    const context = `sample_tokens[${tokenIndex}]`;
    if (!token.normalized) issues.push(`${context}: missing normalized`);
    if (!token.shard_path) issues.push(`${context}: missing shard_path`);
    if (token.shard_path && !manifestShardPaths.has(token.shard_path)) issues.push(`${context}: shard_path is not listed in public manifest`);
    const shardPath = path.join(publicDir, token.shard_path || '');
    if (!fs.existsSync(shardPath)) {
      issues.push(`${context}: missing public shard ${token.shard_path || 'missing path'}`);
      continue;
    }
    const shard = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    const cards = shard.routes_by_normalized?.[token.normalized] || [];
    if (Number.isFinite(token.card_count) && cards.length !== token.card_count) {
      issues.push(`${context}: card_count mismatch, sample has ${token.card_count}, public shard has ${cards.length}`);
    }
    for (const [cardIndex, card] of cards.slice(0, 12).entries()) {
      validateCard(card, `${context}.cards[${cardIndex}]`);
    }
  }
}

async function validateBoundaryReport(report, reconciliation) {
  const count = (name) => Number(report.counts?.[name] || 0);
  if (report.schema_version !== 1) issues.push('route publication boundary report schema_version must be 1');
  if (report.artifact_type !== 'route_publication_boundary_audit') {
    issues.push(`route publication boundary report artifact_type must be route_publication_boundary_audit, got ${report.artifact_type || 'missing'}`);
  }
  if (cleanPath(report.generator) !== 'scripts/validate_route_publication_boundary.mjs') {
    issues.push(`route publication boundary report generator mismatch: ${report.generator || 'missing'}`);
  } else {
    const currentGenerator = await fileSummary(cleanPath(report.generator));
    if (!report.inputs?.generator_file) {
      issues.push('route publication boundary report is missing generator file summary');
    } else {
      compareSummary(currentGenerator, report.inputs.generator_file, 'route publication boundary generator file');
    }
  }
  const reportGeneratedAt = Date.parse(report.generated_at || '');
  const publicPublishedAt = Date.parse(publicManifest.published_at || '');
  if (!Number.isFinite(reportGeneratedAt)) {
    issues.push('route publication boundary report generated_at is missing or invalid');
  } else if (Number.isFinite(publicPublishedAt) && reportGeneratedAt < publicPublishedAt) {
    issues.push('route publication boundary report is older than the public lookup manifest');
  }
  if (cleanPath(report.inputs?.manifest) !== cleanPath(options.publicManifest)) {
    issues.push('route publication boundary report manifest does not match public manifest under validation');
  } else if (!report.inputs?.manifest_file) {
    issues.push('route publication boundary report is missing public manifest file summary');
  } else {
    compareSummary(publicManifestSummary, report.inputs.manifest_file, 'route publication boundary public manifest file');
  }
  if (cleanPath(report.inputs?.public_lookup) !== cleanPath(path.dirname(options.publicManifest))) {
    issues.push('route publication boundary report public_lookup does not match public manifest directory');
  }
  if (cleanPath(report.inputs?.contract) !== cleanPath(options.contract)) {
    issues.push('route publication boundary report contract does not match HUD route contract under validation');
  }
  const reportAllowedSections = new Set(report.contract?.allowed_display_sections || []);
  for (const section of allowedSections) {
    if (!reportAllowedSections.has(section)) {
      issues.push(`route publication boundary report is missing contract display_section ${section}`);
    }
  }
  for (const section of reportAllowedSections) {
    if (!allowedSections.has(section)) {
      issues.push(`route publication boundary report lists unknown contract display_section ${section}`);
    }
  }
  if (Number(report.counts?.issue_count || 0) !== 0) {
    issues.push(`route publication boundary report has ${report.counts.issue_count} issue(s)`);
  }
  if (count('shard_identity_checks') !== count('shards')) {
    issues.push('route publication boundary report did not check every public shard identity');
  }
  if (count('shard_identity_mismatches') !== 0) {
    issues.push(`route publication boundary report found ${count('shard_identity_mismatches')} public shard identity mismatch(es)`);
  }
  if (count('shard_count_fields_checked') !== count('shards') * 4) {
    issues.push('route publication boundary report did not check every public shard manifest/self count field');
  }
  if (count('shard_count_field_mismatches') !== 0) {
    issues.push(`route publication boundary report found ${count('shard_count_field_mismatches')} public shard count mismatch(es)`);
  }
  if (count('card_ids_checked') !== count('cards')) {
    issues.push('route publication boundary report did not check every card_id');
  }
  if (count('duplicate_card_ids') !== 0) {
    issues.push(`route publication boundary report found ${count('duplicate_card_ids')} duplicate card_id value(s)`);
  }
  if (count('normalized_lookup_key_checks') !== count('cards')) {
    issues.push('route publication boundary report did not check every card normalized value against its lookup key');
  }
  if (count('normalized_lookup_key_mismatches') !== 0) {
    issues.push(`route publication boundary report found ${count('normalized_lookup_key_mismatches')} normalized lookup key mismatch(es)`);
  }
  if (count('route_card_string_fields_checked') !== count('cards') * 10) {
    issues.push('route publication boundary report did not check every required route-card string field');
  }
  if (count('invalid_route_card_string_fields') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_route_card_string_fields')} invalid route-card string field(s)`);
  }
  if (count('route_score_fields_checked') !== count('cards') * 4) {
    issues.push('route publication boundary report did not check every route score field');
  }
  if (count('invalid_route_score_fields') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_route_score_fields')} invalid route score field(s)`);
  }
  if (count('route_score_formula_checks') !== count('cards')) {
    issues.push('route publication boundary report did not check every route score formula');
  }
  if (count('invalid_route_score_formulas') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_route_score_formulas')} invalid route score formula(s)`);
  }
  if (count('route_cards_with_source_rows') !== count('cards')) {
    issues.push('route publication boundary report found route cards without source rows');
  }
  if (count('route_cards_missing_source_rows') !== 0) {
    issues.push(`route publication boundary report found ${count('route_cards_missing_source_rows')} route card(s) missing source_rows`);
  }
  if (count('route_cards_with_duplicate_source_ids') !== 0) {
    issues.push(`route publication boundary report found ${count('route_cards_with_duplicate_source_ids')} route card(s) with duplicate source_id rows`);
  }
  if (count('source_row_duplicate_source_ids') !== 0) {
    issues.push(`route publication boundary report found ${count('source_row_duplicate_source_ids')} duplicate source_id row(s) within route cards`);
  }
  if (count('source_row_string_fields_checked') !== count('source_rows') * 7) {
    issues.push('route publication boundary report did not check every required source-row string field');
  }
  if (count('invalid_source_row_string_fields') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_source_row_string_fields')} invalid source-row string field(s)`);
  }
  if (count('source_row_fields_used_entries_checked') < count('source_rows')) {
    issues.push('route publication boundary report checked fewer fields_used entries than source rows');
  }
  if (count('invalid_source_row_fields_used_entries') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_source_row_fields_used_entries')} invalid fields_used entrie(s)`);
  }
  if (count('reference_url_fields_checked') !== count('source_rows') * 2) {
    issues.push('route publication boundary report did not check both source_url and license_url for every source row');
  }
  if (count('invalid_reference_url_fields') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_reference_url_fields')} invalid source/license URL field(s)`);
  }
  if (count('answer_eligible_cards_with_source_rows') > count('answer_eligible_cards')) {
    issues.push('route publication boundary report has more answer-eligible source-row cards than answer-eligible cards');
  }
  if (count('answer_eligible_cards_with_answer_score') !== count('answer_eligible_cards')) {
    issues.push('route publication boundary report found answer-eligible cards without numeric answer_score');
  }
  if (count('answer_eligible_cards_missing_answer_score') !== 0) {
    issues.push(`route publication boundary report found ${count('answer_eligible_cards_missing_answer_score')} answer-eligible card(s) missing numeric answer_score`);
  }
  if (count('answer_role_answer_cards') !== count('answer_eligible_cards')) {
    issues.push('route publication boundary answer-role count does not match answer-eligible card count');
  }
  if (count('answer_role_answer_noneligible_cards') !== 0) {
    issues.push(`route publication boundary report found ${count('answer_role_answer_noneligible_cards')} non-answer-eligible card(s) with answer role`);
  }
  if (count('form_reference_cards') !== Number(report.answer_roles?.form_reference || 0)) {
    issues.push('route publication boundary form-reference count does not match answer_roles.form_reference');
  }
  if (count('invalid_form_reference_cards') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_form_reference_cards')} invalid form-reference card(s)`);
  }
  if (count('form_reference_cards') > 0 && count('form_reference_tag_entries_checked') < count('form_reference_cards')) {
    issues.push('route publication boundary checked fewer form-reference tag entries than form-reference cards');
  }
  if (count('invalid_form_reference_tag_entries') !== 0) {
    issues.push(`route publication boundary report found ${count('invalid_form_reference_tag_entries')} invalid form-reference tag entrie(s)`);
  }
  if (count('answer_eligible_translation_output_unsafe_cards') > count('answer_eligible_cards')) {
    issues.push('route publication boundary report has more answer-eligible unsafe cards than answer-eligible cards');
  }
  if (count('answer_eligible_translation_output_unsafe_cards') > 0) {
    const unsafeSamples = report.samples?.answer_eligible_translation_output_unsafe_cards;
    if (!Array.isArray(unsafeSamples) || unsafeSamples.length < 1) {
      issues.push('route publication boundary report is missing answer-eligible unsafe sample cards');
    }
    const expectedSampleCount = Math.min(
      Number(report.inputs?.max_warnings || 0),
      count('answer_eligible_translation_output_unsafe_cards'),
    );
    if (expectedSampleCount < 1) {
      issues.push('route publication boundary report cannot prove unsafe answer samples because max_warnings is below 1');
    } else if (Array.isArray(unsafeSamples) && unsafeSamples.length !== expectedSampleCount) {
      issues.push(`route publication boundary unsafe answer sample count mismatch, expected ${expectedSampleCount}, got ${unsafeSamples.length}`);
    }
  }
  validateUnsafeAnswerSamples(report);
  if (count('translation_output_unsafe_cards') > count('cards')) {
    issues.push('route publication boundary report has more translation-output unsafe cards than cards');
  }
  if (count('hud_safe_source_rows') + count('hud_unsafe_source_rows') !== count('source_rows')) {
    issues.push('route publication boundary HUD-safe and HUD-unsafe source-row counts do not add up to source_rows');
  }
  if (count('translation_output_safe_source_rows') + count('translation_output_unsafe_source_rows') !== count('source_rows')) {
    issues.push('route publication boundary translation-output source-row counts do not add up to source_rows');
  }
  if (sumMap(report.licenses) !== count('source_rows')) {
    issues.push('route publication boundary license map total does not equal source_rows');
  }
  if (sumMap(report.unsafe_translation_output_licenses) !== count('translation_output_unsafe_source_rows')) {
    issues.push('route publication boundary unsafe translation-output license map total does not equal translation_output_unsafe_source_rows');
  }
  if (sumMap(report.answer_eligible_unsafe_translation_output_licenses) !== count('answer_eligible_translation_output_unsafe_source_rows')) {
    issues.push('route publication boundary answer-eligible unsafe license map total does not equal answer_eligible_translation_output_unsafe_source_rows');
  }
  if (sumMap(report.route_families) !== count('cards')) {
    issues.push('route publication boundary route_families total does not equal cards');
  }
  if (sumMap(report.route_types) !== count('cards')) {
    issues.push('route publication boundary route_types total does not equal cards');
  }
  if (sumMap(report.display_sections) !== count('cards')) {
    issues.push('route publication boundary display_sections total does not equal cards');
  }
  for (const section of Object.keys(report.display_sections || {})) {
    if (!allowedSections.has(section)) {
      issues.push(`route publication boundary found display_section outside HUD contract: ${section}`);
    }
  }
  if (sumMap(report.answer_roles) !== count('cards')) {
    issues.push('route publication boundary answer_roles total does not equal cards');
  }
  if (sumMap(report.answer_eligible_route_families) !== count('answer_eligible_cards')) {
    issues.push('route publication boundary answer_eligible_route_families total does not equal answer_eligible_cards');
  }
  if (sumMap(report.answer_eligible_route_types) !== count('answer_eligible_cards')) {
    issues.push('route publication boundary answer_eligible_route_types total does not equal answer_eligible_cards');
  }
  if (sumMap(report.answer_eligible_display_sections) !== count('answer_eligible_cards')) {
    issues.push('route publication boundary answer_eligible_display_sections total does not equal answer_eligible_cards');
  }
  if (sumMap(report.answer_eligible_match_types) !== count('answer_eligible_cards')) {
    issues.push('route publication boundary answer_eligible_match_types total does not equal answer_eligible_cards');
  }
  if (count('answer_eligible_translation_output_unsafe_source_rows') < count('answer_eligible_translation_output_unsafe_cards')) {
    issues.push('route publication boundary answer-eligible unsafe source-row count is lower than answer-eligible unsafe card count');
  }
  if (!report.inputs?.fixture) {
    issues.push('route publication boundary report is missing fixture input path');
  } else if (!fs.existsSync(path.join(root, cleanPath(report.inputs.fixture)))) {
    issues.push(`route publication boundary fixture file is missing: ${report.inputs.fixture}`);
  } else {
    const currentFixture = await fileSummary(cleanPath(report.inputs.fixture));
    if (!report.inputs.fixture_file) {
      issues.push('route publication boundary report is missing fixture file summary');
    } else {
      compareSummary(currentFixture, report.inputs.fixture_file, 'route publication boundary fixture file');
    }
  }
  if (Number(report.inputs?.fixture_cases || 0) < 1) {
    issues.push('route publication boundary report must include at least one fixture case');
  }
  if (Number(report.counts?.cards || 0) !== reconciliation.public_cards_written) {
    issues.push(`route publication boundary card count mismatch, report has ${report.counts?.cards}, public manifest has ${reconciliation.public_cards_written}`);
  }
  if (Number(report.counts?.tokens || 0) !== reconciliation.public_distinct_normalized_tokens) {
    issues.push(`route publication boundary token count mismatch, report has ${report.counts?.tokens}, public manifest has ${reconciliation.public_distinct_normalized_tokens}`);
  }
  if (Number(report.counts?.shards || 0) !== reconciliation.public_shard_count) {
    issues.push(`route publication boundary shard count mismatch, report has ${report.counts?.shards}, public manifest has ${reconciliation.public_shard_count}`);
  }
  if (Number(report.counts?.answer_eligible_cards || 0) !== Number(report.counts?.answer_eligible_cards_with_source_rows || 0)) {
    issues.push('route publication boundary report found answer-eligible cards without source rows');
  }
  if (Number(report.counts?.hud_unsafe_source_rows || 0) !== 0) {
    issues.push(`route publication boundary report found ${report.counts.hud_unsafe_source_rows} HUD-unsafe source row(s)`);
  }
  if (Number(report.counts?.route_cards_with_publication_fields || 0) !== 0) {
    issues.push(`route publication boundary report found ${report.counts.route_cards_with_publication_fields} route card(s) with publication-readiness fields`);
  }
}

function validateCard(card, context) {
  for (const field of ['card_id', 'normalized', 'route_family', 'route_type', 'display_section', 'display_label']) {
    if (!card?.[field]) issues.push(`${context}: missing ${field}`);
  }
  if (card.display_section && !allowedSections.has(card.display_section)) {
    issues.push(`${context}: display_section ${card.display_section} is not listed in HUD route contract`);
  }
  if (typeof card.answer_eligible !== 'boolean') issues.push(`${context}: missing boolean answer_eligible`);
  if (!card.answer_role) issues.push(`${context}: missing answer_role`);
  if (card.answer_role === 'answer' && card.answer_eligible !== true) {
    issues.push(`${context}: answer_role=answer requires answer_eligible=true`);
  }
  if (card.answer_eligible === true && card.answer_role !== 'answer') {
    issues.push(`${context}: answer_eligible card must use answer_role=answer`);
  }
  if (card.answer_eligible === true) {
    if (!Number.isFinite(card.answer_score)) {
      issues.push(`${context}: answer_eligible card missing numeric answer_score`);
    } else if (card.answer_score < 0 || card.answer_score > 100) {
      issues.push(`${context}: answer_eligible card answer_score must be between 0 and 100`);
    }
  }
  if (card.answer_eligible !== true && Number.isFinite(card.answer_score)) {
    issues.push(`${context}: non-answer card must not carry answer_score`);
  }
  if (card.answer_role === 'form_reference') {
    if (card.answer_eligible !== false) issues.push(`${context}: form_reference must not be answer_eligible`);
    if (!/^form of\b/i.test(String(card.definition || ''))) {
      issues.push(`${context}: form_reference definition must display as "form of [lemma]"`);
    }
  }
  if (card.display_section !== 'audit' && card.route_type !== 'shape' && !card.definition) {
    issues.push(`${context}: missing definition`);
  }
  if (!Array.isArray(card.source_rows) || !card.source_rows.length) {
    issues.push(`${context}: missing source_rows`);
  }
  if (['biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(card.route_type)) {
    if (card.score_handicap !== 20) issues.push(`${context}: paraphrase score_handicap must be 20`);
    if (Number.isFinite(card.raw_score) && card.adjusted_score !== card.raw_score - 20) {
      issues.push(`${context}: paraphrase adjusted_score must equal raw_score - 20`);
    }
    if (card.boundary_safe === false && card.answer_eligible === true) {
      issues.push(`${context}: boundary-unsafe paraphrase must not be answer_eligible`);
    }
  }
}

function validateUnsafeAnswerSamples(report) {
  const samples = report.samples?.answer_eligible_translation_output_unsafe_cards;
  if (!Array.isArray(samples)) return;
  for (const [sampleIndex, sample] of samples.entries()) {
    const context = `route publication boundary unsafe sample ${sampleIndex}`;
    if (!sample || typeof sample !== 'object' || Array.isArray(sample)) {
      issues.push(`${context}: sample must be an object`);
      continue;
    }
    for (const key of Object.keys(sample)) {
      if (!unsafeAnswerSampleFields.has(key)) {
        issues.push(`${context}: disallowed sample field ${key}`);
      }
    }
    if (!Array.isArray(sample.unsafe_source_rows) || !sample.unsafe_source_rows.length) {
      issues.push(`${context}: missing unsafe_source_rows`);
      continue;
    }
    for (const [rowIndex, row] of sample.unsafe_source_rows.entries()) {
      const rowContext = `${context}.unsafe_source_rows[${rowIndex}]`;
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        issues.push(`${rowContext}: row must be an object`);
        continue;
      }
      for (const key of Object.keys(row)) {
        if (!unsafeAnswerSampleRowFields.has(key)) {
          issues.push(`${rowContext}: disallowed row field ${key}`);
        }
      }
    }
  }
}

async function compareFrozenInputsToCurrentSources(releaseStamp) {
  for (const input of releaseStamp.frozen_inputs?.files || []) {
    if (!input.source_path || !fs.existsSync(path.join(root, input.source_path))) continue;
    const current = await fileSummary(input.source_path);
    if (current.sha256 !== input.sha256 || current.byte_length !== input.byte_length) {
      warnings.push(`current route source differs from frozen release input: ${input.source_path}`);
    }
  }
}

async function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function writeReport(relativePath, result) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    '# HUD Route Release Gate',
    '',
    `Generated: ${result.generated_at}`,
    `Status: ${result.status}`,
    `Release ID: ${result.release_id}`,
    '',
    '## Public Lookup',
    '',
    `- Manifest: \`${result.public_manifest}\``,
    `- Cards: ${result.public_cards_written}`,
    `- Normalized tokens: ${result.public_distinct_normalized_tokens}`,
    `- Shards: ${result.public_shard_count}`,
    `- Sample tokens checked: ${result.checked_sample_tokens}`,
    '',
    '## Route Publication Boundary',
    '',
    `- Report: \`${result.route_publication_boundary.report}\``,
    `- Generator: \`${result.route_publication_boundary.generator || 'missing'}\``,
    `- Validator SHA-256: \`${result.route_publication_boundary.generator_sha256 || 'missing'}\``,
    `- Manifest SHA-256: \`${result.route_publication_boundary.manifest_sha256 || 'missing'}\``,
    `- HUD contract: \`${result.route_publication_boundary.contract || 'missing'}\``,
    `- Allowed display sections: ${(result.route_publication_boundary.allowed_display_sections || []).join(', ')}`,
    `- Boundary issues: ${result.route_publication_boundary.issues}`,
    `- Boundary warnings: ${result.route_publication_boundary.warnings}`,
    `- Fixture: \`${result.route_publication_boundary.fixture}\``,
    `- Fixture cases: ${result.route_publication_boundary.fixture_cases}`,
    `- Fixture SHA-256: \`${result.route_publication_boundary.fixture_sha256 || 'missing'}\``,
    `- Shard identity checks: ${result.route_publication_boundary.shard_identity_checks}`,
    `- Shard identity mismatches: ${result.route_publication_boundary.shard_identity_mismatches}`,
    `- Shard count fields checked: ${result.route_publication_boundary.shard_count_fields_checked}`,
    `- Shard count field mismatches: ${result.route_publication_boundary.shard_count_field_mismatches}`,
    `- Card IDs checked: ${result.route_publication_boundary.card_ids_checked}`,
    `- Duplicate card IDs: ${result.route_publication_boundary.duplicate_card_ids}`,
    `- Normalized lookup key checks: ${result.route_publication_boundary.normalized_lookup_key_checks}`,
    `- Normalized lookup key mismatches: ${result.route_publication_boundary.normalized_lookup_key_mismatches}`,
    `- Route-card string fields checked: ${result.route_publication_boundary.route_card_string_fields_checked}`,
    `- Invalid route-card string fields: ${result.route_publication_boundary.invalid_route_card_string_fields}`,
    `- Route score fields checked: ${result.route_publication_boundary.route_score_fields_checked}`,
    `- Invalid route score fields: ${result.route_publication_boundary.invalid_route_score_fields}`,
    `- Route score formula checks: ${result.route_publication_boundary.route_score_formula_checks}`,
    `- Invalid route score formulas: ${result.route_publication_boundary.invalid_route_score_formulas}`,
    `- Cards with source rows: ${result.route_publication_boundary.route_cards_with_source_rows}`,
    `- Cards missing source rows: ${result.route_publication_boundary.route_cards_missing_source_rows}`,
    `- Cards with duplicate source IDs: ${result.route_publication_boundary.route_cards_with_duplicate_source_ids}`,
    `- Source-row string fields checked: ${result.route_publication_boundary.source_row_string_fields_checked}`,
    `- Duplicate source IDs within route cards: ${result.route_publication_boundary.source_row_duplicate_source_ids}`,
    `- Invalid source-row string fields: ${result.route_publication_boundary.invalid_source_row_string_fields}`,
    `- Source-row fields_used entries checked: ${result.route_publication_boundary.source_row_fields_used_entries_checked}`,
    `- Invalid source-row fields_used entries: ${result.route_publication_boundary.invalid_source_row_fields_used_entries}`,
    `- Reference URL fields checked: ${result.route_publication_boundary.reference_url_fields_checked}`,
    `- Invalid reference URL fields: ${result.route_publication_boundary.invalid_reference_url_fields}`,
    `- Answer-eligible cards with numeric answer score: ${result.route_publication_boundary.answer_eligible_cards_with_answer_score}`,
    `- Answer-eligible cards missing numeric answer score: ${result.route_publication_boundary.answer_eligible_cards_missing_answer_score}`,
    `- Cards with answer role: ${result.route_publication_boundary.answer_role_answer_cards}`,
    `- Cards with answer role but not answer-eligible: ${result.route_publication_boundary.answer_role_answer_noneligible_cards}`,
    `- Form-reference cards: ${result.route_publication_boundary.form_reference_cards}`,
    `- Invalid form-reference cards: ${result.route_publication_boundary.invalid_form_reference_cards}`,
    `- Form-reference tag entries checked: ${result.route_publication_boundary.form_reference_tag_entries_checked}`,
    `- Invalid form-reference tag entries: ${result.route_publication_boundary.invalid_form_reference_tag_entries}`,
    `- Answer-eligible unsafe sample cards: ${result.route_publication_boundary.answer_eligible_translation_output_unsafe_samples}`,
    `- Translation-output unsafe cards flagged: ${result.route_publication_boundary.translation_output_unsafe_cards}`,
    `- Answer-eligible translation-output unsafe source rows flagged: ${result.route_publication_boundary.answer_eligible_translation_output_unsafe_source_rows}`,
    `- Answer-eligible translation-output unsafe cards flagged: ${result.route_publication_boundary.answer_eligible_translation_output_unsafe_cards}`,
    '',
    '## Issues',
    '',
    ...(result.issues.length ? result.issues.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${warning}`) : ['- None']),
  ];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function cleanPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function sumMap(object) {
  return Object.values(object || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}
