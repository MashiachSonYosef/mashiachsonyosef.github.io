#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generatorScript = 'scripts/validate_route_publication_boundary.mjs';
const defaults = {
  manifest: 'data/definitions/hud-route-lookup/manifest.json',
  contract: 'data/definitions/hud-route-contract.json',
  fixture: 'data/definitions/route-publication-boundary-fixtures.json',
  output: 'reports/route-publication-boundary-audit.json',
  report: 'reports/route-publication-boundary-audit.md',
  maxIssues: 100,
  maxWarnings: 25,
  fixturesOnly: false,
  help: false,
};

const publicationReadinessFields = [
  'accepted_translation',
  'accepted_translation_ready',
  'accepted_translation_status',
  'publication_ready',
  'publication_role',
  'publication_status',
  'render_ready',
  'translation_ready',
  'translation_status',
];
const machineAuthorityStatusFields = [
  'status',
  'review_status',
  'authority_status',
  'lexical_authority_status',
];

const hudAllowedLicensePatterns = [
  /^project-authored \/ CC0$/i,
  /^CC0$/i,
  /^CC BY 4\.0$/i,
  /^CC-BY(?: 4\.0)?$/i,
  /^CC BY-SA 4\.0$/i,
  /^CC-BY-SA(?: 4\.0)?$/i,
  /^CC BY-SA 4\.0 \/ GFDL$/i,
  /^CC BY-SA 4\.0\/GFDL$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^N\/A - project lexical rule$/i,
  /^N\/A - project-authored lexical rules$/i,
];
const translationOutputSafeLicensePatterns = [
  /^project-authored \/ CC0$/i,
  /^CC0$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^N\/A - project lexical rule$/i,
  /^N\/A - project-authored lexical rules$/i,
];
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const allowedAnswerRoles = new Set(['answer', 'evidence', 'form_reference']);
const allowedSourceFamilies = new Set(['fixture', 'hebrew_source_text', 'kaikki', 'openscriptures', 'wikidata', 'workspace']);
const requiredRouteCardStringFields = ['card_id', 'normalized', 'surface', 'route_family', 'route_type', 'display_section', 'display_label', 'language', 'match_type', 'definition'];
const requiredSourceRowStringFields = ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url', 'notes'];
const routeScoreFields = ['confidence_percent', 'raw_score', 'score_handicap', 'adjusted_score'];

const options = parseArgs(process.argv.slice(2));
const contract = readJson(options.contract);
const auditRuntimeState = new WeakMap();
let fixtureCaseCount = 0;
fixtureCaseCount = runFixtureSelfTest(options.fixture, contract);
if (options.fixturesOnly) {
  console.log(`Route publication boundary fixture self-test passed. Cases: ${fixtureCaseCount}.`);
  process.exit(0);
}
const manifest = readJson(options.manifest);
const audit = createAudit(manifest, contract);
validateManifestPublicationBoundary(manifest.publication_boundary, audit);
validatePublicLookupPath(manifest, audit);

for (const [index, shard] of (manifest.shards || []).entries()) auditShard(shard, index);

writeJson(options.output, audit);
writeReport(options.report, audit);

if (audit.counts.issue_count > 0) {
  console.error(`Route publication boundary validation failed with ${audit.counts.issue_count} issue(s).`);
  console.error(`Wrote ${options.output}`);
  console.error(`Wrote ${options.report}`);
  process.exit(1);
}

console.log(`Route publication boundary validation passed. Cards: ${audit.counts.cards}. Answer-eligible: ${audit.counts.answer_eligible_cards}. Translation-output unsafe cards flagged: ${audit.counts.translation_output_unsafe_cards}.`);
console.log(`Fixture self-test passed. Cases: ${fixtureCaseCount}.`);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);

function createAudit(manifestData = {}, contractData = contract) {
  const includeInputFileSummaries = manifestData.include_input_file_summaries !== false;
  const allowedDisplaySections = contractSectionIds(contractData);
  return {
    schema_version: 1,
    artifact_type: 'route_publication_boundary_audit',
    generated_at: new Date().toISOString(),
    generator: generatorScript,
    policy: [
      'HUD route answer eligibility may select a definition card inside the lexical HUD.',
      'It is not publication readiness for accepted translation output.',
      'Route cards must keep source/license rows; translation-output safety is flagged separately from HUD route safety.',
    ].join(' '),
    publication_boundary: {
      publication_status: 'blocked_no_render',
      validates: [
        'route_publication_boundary_audit',
        'route_card_publication_boundary',
        'public_hud_route_lookup_publication_boundary',
      ],
      does_not_clear: [
        'translation_output',
        'source_publication',
        'public_lexical_export_reuse',
        'accepted_definition_authority',
      ],
      answer_eligible_scope: 'hud_answer_slot_only_not_translation_or_publication_readiness',
      warning_status_blocks_publication_claim: true,
      current_route_inputs_reconciled: 'not_checked_by_route_publication_boundary_audit',
    },
    inputs: {
      manifest: options.manifest,
      manifest_file: includeInputFileSummaries ? fileSummary(options.manifest) : null,
      contract: options.contract,
      fixture: options.fixture,
      fixture_cases: fixtureCaseCount,
      fixture_file: includeInputFileSummaries ? fileSummary(options.fixture) : null,
      generator_file: includeInputFileSummaries ? fileSummary(generatorScript) : null,
      public_lookup: manifestData.public_lookup || 'data/definitions/hud-route-lookup',
      max_issues: options.maxIssues,
      max_warnings: options.maxWarnings,
    },
    contract: {
      contract_id: contractData.contract_id || '',
      allowed_display_sections: allowedDisplaySections,
    },
    counts: {
      shards: 0,
      manifest_shard_path_checks: 0,
      invalid_manifest_shard_paths: 0,
      duplicate_manifest_shard_paths: 0,
      duplicate_manifest_shard_ids: 0,
      shard_identity_checks: 0,
      shard_identity_mismatches: 0,
      shard_count_fields_checked: 0,
      shard_count_field_mismatches: 0,
      tokens: 0,
      cards: 0,
      card_ids_checked: 0,
      duplicate_card_ids: 0,
      normalized_lookup_key_checks: 0,
      normalized_lookup_key_mismatches: 0,
      route_card_string_fields_checked: 0,
      invalid_route_card_string_fields: 0,
      route_score_fields_checked: 0,
      invalid_route_score_fields: 0,
      route_score_formula_checks: 0,
      invalid_route_score_formulas: 0,
      route_cards_with_source_rows: 0,
      route_cards_missing_source_rows: 0,
      route_cards_with_duplicate_source_ids: 0,
      answer_eligible_cards: 0,
      answer_eligible_cards_with_source_rows: 0,
      answer_eligible_cards_with_answer_score: 0,
      answer_eligible_cards_missing_answer_score: 0,
      answer_role_answer_cards: 0,
      answer_role_answer_noneligible_cards: 0,
      form_reference_cards: 0,
      invalid_form_reference_cards: 0,
      form_reference_tag_entries_checked: 0,
      invalid_form_reference_tag_entries: 0,
      source_rows: 0,
      source_row_duplicate_source_ids: 0,
      source_row_string_fields_checked: 0,
      invalid_source_row_string_fields: 0,
      source_row_fields_used_entries_checked: 0,
      invalid_source_row_fields_used_entries: 0,
      fields_used_exclusion_entries_checked: 0,
      forbidden_fields_used_entries: 0,
      source_family_checks: 0,
      invalid_source_family_values: 0,
      reference_url_fields_checked: 0,
      invalid_reference_url_fields: 0,
      source_row_notes_checked: 0,
      forbidden_source_row_notes: 0,
      source_url_compatibility_checks: 0,
      invalid_source_url_compatibility: 0,
      license_url_compatibility_checks: 0,
      invalid_license_url_compatibility: 0,
      hud_safe_source_rows: 0,
      hud_unsafe_source_rows: 0,
      translation_output_safe_source_rows: 0,
      translation_output_unsafe_source_rows: 0,
      answer_eligible_translation_output_unsafe_source_rows: 0,
      translation_output_unsafe_cards: 0,
      answer_eligible_translation_output_unsafe_cards: 0,
      route_cards_with_publication_fields: 0,
      route_cards_with_authority_status_overclaims: 0,
      issue_count: 0,
      warning_count: 0,
    },
    licenses: {},
    unsafe_translation_output_licenses: {},
    answer_eligible_unsafe_translation_output_licenses: {},
    route_families: {},
    route_types: {},
    display_sections: {},
    answer_roles: {},
    answer_eligible_route_families: {},
    answer_eligible_route_types: {},
    answer_eligible_display_sections: {},
    answer_eligible_match_types: {},
    samples: {
      answer_eligible_translation_output_unsafe_cards: [],
    },
    issues: [],
    warnings: [],
  };
}

function runFixtureSelfTest(relativePath, contractData) {
  const fixture = readJson(relativePath);
  const issues = [];
  if (fixture.schema_version !== 1) issues.push('fixture schema_version must be 1');
  if (fixture.artifact_type !== 'route_publication_boundary_fixtures') {
    issues.push(`fixture artifact_type must be route_publication_boundary_fixtures, got ${fixture.artifact_type || 'missing'}`);
  }
  for (const [index, testCase] of (fixture.cases || []).entries()) {
    const target = createAudit({ public_lookup: 'fixture', include_input_file_summaries: false }, contractData);
    if (Array.isArray(testCase.shards)) {
      for (const [shardIndex, shardCase] of testCase.shards.entries()) {
        auditShardRecord(
          shardCase.shard_entry || { shard: `fixture-${shardIndex}`, path: `shards/fixture-${shardIndex}.json` },
          prepareFixtureShard(shardCase.shard),
          `fixture:${testCase.label || index}.shards[${shardIndex}]`,
          target,
        );
      }
    } else if (testCase.shard) {
      auditShardRecord(
        testCase.shard_entry || { shard: 'fixture', path: 'shards/fixture.json' },
        prepareFixtureShard(testCase.shard),
        `fixture:${testCase.label || index}.shard`,
        target,
      );
    } else {
      const expectedNormalized = testCase.lookup_normalized === undefined ? null : String(testCase.lookup_normalized);
      const fixtureCards = Array.isArray(testCase.cards) ? testCase.cards : [testCase.card];
      for (const [cardIndex, fixtureCard] of fixtureCards.entries()) {
        auditCard(prepareFixtureCard(fixtureCard), `fixture:${testCase.label || index}[${cardIndex}]`, target, expectedNormalized);
      }
    }
    for (const [countName, expectedValue] of Object.entries(testCase.expected_counts || {})) {
      const actualValue = Number(target.counts[countName] || 0);
      if (actualValue !== expectedValue) {
        issues.push(`${testCase.label || `case ${index}`}: expected counts.${countName}=${expectedValue}, got ${actualValue}`);
      }
    }
    for (const [mapName, expectedValues] of Object.entries(testCase.expected_map_counts || {})) {
      const actualValues = target[mapName] || {};
      for (const [key, expectedValue] of Object.entries(expectedValues || {})) {
        const actualValue = Number(actualValues[key] || 0);
        if (actualValue !== expectedValue) {
          issues.push(`${testCase.label || `case ${index}`}: expected ${mapName}.${key}=${expectedValue}, got ${actualValue}`);
        }
      }
    }
    assertFixtureSubstrings(issues, testCase, 'expected_issue_substrings', target.issues, index);
    assertFixtureSubstrings(issues, testCase, 'expected_warning_substrings', target.warnings, index);
  }
  if (issues.length) {
    console.error(`Route publication boundary fixture self-test failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  return (fixture.cases || []).length;
}

function prepareFixtureCard(card) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) return card;
  return {
    confidence_percent: 100,
    raw_score: 100,
    score_handicap: 0,
    adjusted_score: 100,
    surface: 'fixture',
    language: 'Fixture Hebrew',
    match_type: 'fixture',
    ...card,
  };
}

function prepareFixtureShard(shard) {
  if (!shard || typeof shard !== 'object' || Array.isArray(shard)) return shard;
  const routes = {};
  for (const [normalized, cards] of Object.entries(shard.routes_by_normalized || {})) {
    routes[normalized] = Array.isArray(cards) ? cards.map((card) => prepareFixtureCard(card)) : cards;
  }
  return { ...shard, routes_by_normalized: routes };
}

function assertFixtureSubstrings(issues, testCase, fieldName, rows, index) {
  for (const expected of testCase[fieldName] || []) {
    const needle = String(expected);
    const found = rows.some((row) => `${row.context || ''} ${row.detail || ''}`.includes(needle));
    if (!found) {
      issues.push(`${testCase.label || `case ${index}`}: missing ${fieldName} match: ${needle}`);
    }
  }
}

function auditShard(shardEntry, manifestIndex) {
  const lookupRoot = 'data/definitions/hud-route-lookup';
  const validation = validateManifestShardEntry(shardEntry, `${options.manifest}:shards[${manifestIndex}]`, audit);
  if (!validation.safeToRead) {
    audit.counts.shards += 1;
    return;
  }
  const shardPath = cleanRelativePath(`${lookupRoot}/${shardEntry.path}`);
  const shard = readJson(shardPath);
  auditShardRecord(shardEntry, shard, shardPath, audit, { entryAlreadyValidated: true });
}

function auditShardRecord(shardEntry, shard, shardPath, target = audit, options = {}) {
  target.counts.shards += 1;
  if (!options.entryAlreadyValidated) {
    const validation = validateManifestShardEntry(shardEntry, shardPath, target);
    if (!validation.safeToRead) return;
  }
  const byToken = shard.routes_by_normalized || {};
  const tokenEntries = Object.entries(byToken);
  const actualTokenCount = tokenEntries.length;
  const actualCardCount = tokenEntries.reduce((sum, [, cards]) => sum + (Array.isArray(cards) ? cards.length : 0), 0);
  checkShardIdentity(shardEntry, shard, shardPath, target);
  checkShardCountField(`${shardPath}:manifest.token_count`, shardEntry?.token_count, actualTokenCount, target);
  checkShardCountField(`${shardPath}:manifest.card_count`, shardEntry?.card_count, actualCardCount, target);
  checkShardCountField(`${shardPath}:shard.token_count`, shard?.token_count, actualTokenCount, target);
  checkShardCountField(`${shardPath}:shard.card_count`, shard?.card_count, actualCardCount, target);
  for (const [normalized, cards] of tokenEntries) {
    target.counts.tokens += 1;
    if (!Array.isArray(cards)) {
      addIssue(`${shardPath}:${normalized}`, 'routes_by_normalized value is not an array', target);
      continue;
    }
    for (const [index, card] of cards.entries()) {
      auditCard(card, `${shardPath}:${normalized}[${index}]`, target, normalized);
    }
  }
}

function validateManifestShardEntry(shardEntry, context, target = audit) {
  target.counts.manifest_shard_path_checks += 1;
  const state = runtimeState(target);
  const shardId = typeof shardEntry?.shard === 'string' ? shardEntry.shard.trim() : '';
  let shardPath = '';
  let shardPathError = '';
  if (typeof shardEntry?.path === 'string') {
    try {
      shardPath = cleanRelativePath(shardEntry.path.trim());
    } catch (error) {
      shardPathError = error.message;
    }
  }
  let valid = true;
  if (!shardId || !/^[A-Za-z0-9_-]+(?:-[A-Za-z0-9_-]+)*$/.test(shardId)) {
    valid = false;
    target.counts.invalid_manifest_shard_paths += 1;
    addIssue(context, `invalid public shard id: ${shardEntry?.shard || 'missing'}`, target);
  }
  const expectedPath = shardId ? `shards/${shardId}.json` : '';
  if (shardPathError || !shardPath || shardPath !== expectedPath || shardPath.includes('..') || shardPath.includes('//') || path.isAbsolute(shardPath)) {
    valid = false;
    target.counts.invalid_manifest_shard_paths += 1;
    const detail = shardPathError ? `${shardPathError}; ` : '';
    addIssue(context, `${detail}invalid public shard path: ${shardEntry?.path || 'missing'}; expected ${expectedPath || 'shards/<shard>.json'}`, target);
  }
  if (shardPath) {
    if (state.seenShardPaths.has(shardPath)) {
      target.counts.duplicate_manifest_shard_paths += 1;
      addIssue(context, `duplicate public shard path in manifest: ${shardPath}`, target);
    } else {
      state.seenShardPaths.add(shardPath);
    }
  }
  if (shardId) {
    if (state.seenShardIds.has(shardId)) {
      target.counts.duplicate_manifest_shard_ids += 1;
      addIssue(context, `duplicate public shard id in manifest: ${shardId}`, target);
    } else {
      state.seenShardIds.add(shardId);
    }
  }
  return { safeToRead: valid };
}

function checkShardIdentity(shardEntry, shard, context, target = audit) {
  target.counts.shard_identity_checks += 1;
  if (!shardEntry?.shard || !shard?.shard || shardEntry.shard !== shard.shard) {
    target.counts.shard_identity_mismatches += 1;
    addIssue(context, `shard identity mismatch: manifest=${shardEntry?.shard || 'missing'}, shard=${shard?.shard || 'missing'}`, target);
  }
}

function checkShardCountField(context, value, expectedValue, target = audit) {
  target.counts.shard_count_fields_checked += 1;
  if (!Number.isInteger(value) || value !== expectedValue) {
    target.counts.shard_count_field_mismatches += 1;
    addIssue(context, `shard count mismatch: expected ${expectedValue}, got ${value ?? 'missing'}`, target);
  }
}

function auditCard(card, context, target = audit, expectedNormalized = null) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    target.counts.cards += 1;
    increment(target.route_families, 'missing');
    increment(target.route_types, 'missing');
    increment(target.display_sections, 'missing');
    increment(target.answer_roles, 'missing');
    addIssue(context, 'route card is not an object', target);
    return;
  }
  target.counts.cards += 1;
  if (typeof card?.card_id === 'string' && card.card_id.trim()) {
    target.counts.card_ids_checked += 1;
    const state = runtimeState(target);
    if (state.seenCardIds.has(card.card_id)) {
      target.counts.duplicate_card_ids += 1;
      addIssue(context, `duplicate card_id: ${card.card_id}`, target);
    } else {
      state.seenCardIds.add(card.card_id);
    }
  }
  if (expectedNormalized !== null) {
    target.counts.normalized_lookup_key_checks += 1;
    if (card?.normalized !== expectedNormalized) {
      target.counts.normalized_lookup_key_mismatches += 1;
      addIssue(context, `normalized lookup key mismatch: bucket=${expectedNormalized}, card=${card?.normalized || 'missing'}`, target);
    }
  }
  increment(target.route_families, card?.route_family || 'missing');
  increment(target.route_types, card?.route_type || 'missing');
  increment(target.display_sections, card?.display_section || 'missing');
  increment(target.answer_roles, card?.answer_role || 'missing');

  for (const field of requiredRouteCardStringFields) {
    target.counts.route_card_string_fields_checked += 1;
    if (typeof card?.[field] !== 'string' || !card[field].trim()) {
      target.counts.invalid_route_card_string_fields += 1;
      addIssue(context, `missing non-empty string ${field}`, target);
    }
  }
  for (const field of routeScoreFields) {
    target.counts.route_score_fields_checked += 1;
    if (!validRouteScoreField(field, card?.[field])) {
      target.counts.invalid_route_score_fields += 1;
      addIssue(context, `invalid numeric ${field}`, target);
    }
  }
  checkRouteScoreFormula(card, context, target);
  if (card?.display_section && !target.contract.allowed_display_sections.includes(card.display_section)) {
    addIssue(context, `unknown display_section: ${card.display_section}`, target);
  }

  const publicationFields = findPublicationReadinessPaths(card);
  if (publicationFields.length) {
    target.counts.route_cards_with_publication_fields += 1;
    addIssue(context, `route card carries publication-readiness field(s): ${publicationFields.slice(0, 10).join(', ')}`, target);
  }
  const authorityStatusOverclaims = findMachineAuthorityStatusOverclaims(card);
  if (authorityStatusOverclaims.length) {
    target.counts.route_cards_with_authority_status_overclaims += 1;
    addIssue(context, `route card carries reviewed-lexical-authority status claim(s): ${authorityStatusOverclaims.slice(0, 10).join(', ')}`, target);
  }

  const hasSourceRows = Array.isArray(card?.source_rows) && card.source_rows.length > 0;
  const sourceRows = hasSourceRows ? card.source_rows : [];
  if (hasSourceRows) {
    target.counts.route_cards_with_source_rows += 1;
  } else {
    target.counts.route_cards_missing_source_rows += 1;
    addIssue(context, 'missing source_rows', target);
  }
  if (typeof card?.answer_eligible !== 'boolean') addIssue(context, 'missing boolean answer_eligible', target);
  if (!card?.answer_role) addIssue(context, 'missing answer_role', target);
  else if (!allowedAnswerRoles.has(card.answer_role)) addIssue(context, `unknown answer_role: ${card.answer_role}`, target);
  if (card?.answer_role === 'answer' && card?.answer_eligible !== true) {
    target.counts.answer_role_answer_noneligible_cards += 1;
    addIssue(context, 'answer_role=answer requires answer_eligible=true', target);
  }
  if (card?.answer_role === 'answer') target.counts.answer_role_answer_cards += 1;
  if (card?.answer_eligible !== true && Number.isFinite(card?.answer_score)) {
    addIssue(context, 'non-answer card must not carry answer_score', target);
  }
  if (card?.answer_role === 'form_reference') validateFormReferenceCard(card, context, target);
  if (card?.answer_eligible === true) {
    target.counts.answer_eligible_cards += 1;
    increment(target.answer_eligible_route_families, card?.route_family || 'missing');
    increment(target.answer_eligible_route_types, card?.route_type || 'missing');
    increment(target.answer_eligible_display_sections, card?.display_section || 'missing');
    increment(target.answer_eligible_match_types, card?.match_type || 'missing');
    if (card.answer_role !== 'answer') addIssue(context, 'answer_eligible card must use answer_role=answer', target);
    if (!Number.isFinite(card.answer_score)) {
      target.counts.answer_eligible_cards_missing_answer_score += 1;
      addIssue(context, 'answer_eligible card missing numeric answer_score', target);
    } else if (card.answer_score < 0 || card.answer_score > 100) {
      addIssue(context, 'answer_eligible card answer_score must be between 0 and 100', target);
    } else {
      target.counts.answer_eligible_cards_with_answer_score += 1;
    }
    if (hasSourceRows) target.counts.answer_eligible_cards_with_source_rows += 1;
  }

  let cardHasTranslationUnsafeRow = false;
  let cardHasDuplicateSourceId = false;
  const sourceIdsSeen = new Set();
  const cardTranslationUnsafeRows = [];
  for (const [rowIndex, row] of sourceRows.entries()) {
    target.counts.source_rows += 1;
    const sourceId = String(row?.source_id || '').trim();
    if (sourceId) {
      if (sourceIdsSeen.has(sourceId)) {
        cardHasDuplicateSourceId = true;
        target.counts.source_row_duplicate_source_ids += 1;
        addIssue(`${context}.source_rows[${rowIndex}]`, `duplicate source_id within route card: ${sourceId}`, target);
      } else {
        sourceIdsSeen.add(sourceId);
      }
    }
    const license = String(row?.license || '').trim();
    increment(target.licenses, license || 'missing');
    if (!hudSafe(row)) {
      target.counts.hud_unsafe_source_rows += 1;
      addIssue(`${context}.source_rows[${rowIndex}]`, `unsafe HUD source license profile: ${license || 'missing'}`, target);
    } else {
      target.counts.hud_safe_source_rows += 1;
    }
    if (translationOutputSafe(row)) {
      target.counts.translation_output_safe_source_rows += 1;
    } else {
      target.counts.translation_output_unsafe_source_rows += 1;
      cardHasTranslationUnsafeRow = true;
      increment(target.unsafe_translation_output_licenses, license || 'missing');
      cardTranslationUnsafeRows.push({
        row_index: rowIndex,
        source_name: row?.source_name || '',
        source_family: row?.source_family || '',
        source_id: row?.source_id || '',
        license: license || 'missing',
        license_url: row?.license_url || '',
      });
      if (card?.answer_eligible === true) {
        target.counts.answer_eligible_translation_output_unsafe_source_rows += 1;
        increment(target.answer_eligible_unsafe_translation_output_licenses, license || 'missing');
      }
    }
    for (const field of requiredSourceRowStringFields) {
      target.counts.source_row_string_fields_checked += 1;
      if (typeof row?.[field] !== 'string' || !row[field].trim()) {
        target.counts.invalid_source_row_string_fields += 1;
        addIssue(`${context}.source_rows[${rowIndex}]`, `missing non-empty string ${field}`, target);
      }
    }
    target.counts.source_family_checks += 1;
    if (!sourceFamilyRecognized(row)) {
      target.counts.invalid_source_family_values += 1;
      addIssue(`${context}.source_rows[${rowIndex}]`, `unknown source_family: ${row?.source_family || 'missing'}`, target);
    }
    target.counts.source_row_notes_checked += 1;
    if (forbiddenSourceRowNote(row?.notes)) {
      target.counts.forbidden_source_row_notes += 1;
      addIssue(`${context}.source_rows[${rowIndex}]`, `source row notes cite excluded translation/example/quotation material: ${row.notes}`, target);
    }
    for (const field of ['source_url', 'license_url']) {
      if (!row?.[field]) continue;
      target.counts.reference_url_fields_checked += 1;
      if (!safeReferenceUrl(row[field])) {
        target.counts.invalid_reference_url_fields += 1;
        addIssue(`${context}.source_rows[${rowIndex}]`, `unsafe ${field}: ${row[field]}`, target);
      }
    }
    target.counts.source_url_compatibility_checks += 1;
    if (!sourceUrlCompatible(row)) {
      target.counts.invalid_source_url_compatibility += 1;
      addIssue(
        `${context}.source_rows[${rowIndex}]`,
        `source_url is not compatible with source_family: ${row?.source_family || 'missing'} -> ${row?.source_url || 'missing'}`,
        target,
      );
    }
    target.counts.license_url_compatibility_checks += 1;
    if (!licenseUrlCompatible(row)) {
      target.counts.invalid_license_url_compatibility += 1;
      addIssue(`${context}.source_rows[${rowIndex}]`, `license_url is not compatible with license label: ${license || 'missing'} -> ${row?.license_url || 'missing'}`, target);
    }
    if (!Array.isArray(row?.fields_used) || !row.fields_used.length) {
      addIssue(`${context}.source_rows[${rowIndex}]`, 'missing fields_used', target);
    } else {
      for (const [fieldIndex, fieldUsed] of row.fields_used.entries()) {
        target.counts.source_row_fields_used_entries_checked += 1;
        target.counts.fields_used_exclusion_entries_checked += 1;
        if (typeof fieldUsed !== 'string' || !fieldUsed.trim()) {
          target.counts.invalid_source_row_fields_used_entries += 1;
          addIssue(`${context}.source_rows[${rowIndex}].fields_used[${fieldIndex}]`, 'fields_used entry must be a non-empty string', target);
        } else if (forbiddenFieldsUsedEntry(fieldUsed)) {
          target.counts.forbidden_fields_used_entries += 1;
          addIssue(`${context}.source_rows[${rowIndex}].fields_used[${fieldIndex}]`, `fields_used entry cites excluded translation/example/quotation material: ${fieldUsed}`, target);
        }
      }
    }
  }
  if (cardHasDuplicateSourceId) target.counts.route_cards_with_duplicate_source_ids += 1;

  if (cardHasTranslationUnsafeRow) {
    target.counts.translation_output_unsafe_cards += 1;
    if (card?.answer_eligible === true) {
      target.counts.answer_eligible_translation_output_unsafe_cards += 1;
      addAnswerEligibleUnsafeSample(context, card, cardTranslationUnsafeRows, target);
    }
    addWarning(context, 'card is HUD-route usable but not automatically safe as accepted translation-output support without downstream license handling', target);
  }
}

function findMachineAuthorityStatusOverclaims(card) {
  const paths = [];
  for (const field of machineAuthorityStatusFields) {
    if (String(card?.[field] || '').trim().toLowerCase() === 'verified') {
      paths.push(`${field}=verified`);
    }
  }
  if (card?.reviewed_lexical_authority === true) {
    paths.push('reviewed_lexical_authority=true');
  }
  return paths;
}

function runtimeState(target) {
  let state = auditRuntimeState.get(target);
  if (!state) {
    state = { seenCardIds: new Set(), seenShardPaths: new Set(), seenShardIds: new Set() };
    auditRuntimeState.set(target, state);
  }
  return state;
}

function validateFormReferenceCard(card, context, target = audit) {
  target.counts.form_reference_cards += 1;
  let invalid = false;
  const markInvalid = (detail) => {
    invalid = true;
    addIssue(context, detail, target);
  };
  if (card.answer_eligible !== false) markInvalid('form_reference must not be answer_eligible');
  if (Number.isFinite(card.answer_score)) markInvalid('form_reference must not carry answer_score');
  if (!/^form of\b/i.test(String(card.definition || ''))) {
    markInvalid('form_reference definition must display as "form of [lemma]"');
  }
  const formOf = card.form_of;
  if (
    !formOf
    || typeof formOf !== 'object'
    || Array.isArray(formOf)
    || typeof formOf.lemma !== 'string'
    || !formOf.lemma.trim()
    || typeof formOf.normalized_lemma !== 'string'
    || !formOf.normalized_lemma.trim()
    || !Array.isArray(formOf.tags)
    || formOf.tags.length < 1
  ) {
    markInvalid('form_reference requires form_of.lemma, form_of.normalized_lemma, and non-empty form_of.tags');
  } else {
    for (const [tagIndex, tag] of formOf.tags.entries()) {
      target.counts.form_reference_tag_entries_checked += 1;
      if (typeof tag !== 'string' || !tag.trim()) {
        target.counts.invalid_form_reference_tag_entries += 1;
        markInvalid(`form_reference form_of.tags[${tagIndex}] must be a non-empty string`);
      }
    }
  }
  if (invalid) target.counts.invalid_form_reference_cards += 1;
}

function findPublicationReadinessPaths(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  const paths = [];
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      paths.push(...findPublicationReadinessPaths(item, `${prefix}[${index}]`));
    }
    return paths;
  }
  for (const [key, item] of Object.entries(value)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (publicationReadinessFields.includes(key)) paths.push(currentPath);
    paths.push(...findPublicationReadinessPaths(item, currentPath));
  }
  return paths;
}

function addAnswerEligibleUnsafeSample(context, card, rows, target = audit) {
  const samples = target.samples.answer_eligible_translation_output_unsafe_cards;
  if (samples.length >= options.maxWarnings) return;
  samples.push({
    context,
    card_id: card?.card_id || '',
    normalized: card?.normalized || '',
    route_family: card?.route_family || '',
    route_type: card?.route_type || '',
    display_section: card?.display_section || '',
    answer_score: Number.isFinite(card?.answer_score) ? card.answer_score : null,
    unsafe_source_rows: rows.slice(0, 5),
  });
}

function hudSafe(row) {
  const license = String(row?.license || '').trim();
  if (!license || forbiddenLicenseRe.test(license)) return false;
  return hudAllowedLicensePatterns.some((pattern) => pattern.test(license));
}

function translationOutputSafe(row) {
  const license = String(row?.license || '').trim();
  if (!license || forbiddenLicenseRe.test(license)) return false;
  return translationOutputSafeLicensePatterns.some((pattern) => pattern.test(license));
}

function safeReferenceUrl(value) {
  return /^(https:\/\/|local:)/i.test(String(value || '').trim());
}

function sourceUrlCompatible(row) {
  const sourceFamily = String(row?.source_family || '').trim().toLowerCase();
  const sourceUrl = String(row?.source_url || '').trim();
  if (!sourceUrl) return false;
  if (!sourceFamilyRecognized(row)) return true;
  if (sourceFamily === 'hebrew_source_text') return /^https:\/\/www\.sefaria\.org\//i.test(sourceUrl);
  if (sourceFamily === 'kaikki') return /^https:\/\/kaikki\.org\/dictionary\/Hebrew\/index\.html$/i.test(sourceUrl);
  if (sourceFamily === 'openscriptures') return /^https:\/\/github\.com\/openscriptures\/(?:morphhb|HebrewLexicon)\//i.test(sourceUrl);
  if (sourceFamily === 'wikidata') return /^https:\/\/www\.wikidata\.org\/wiki\/Lexeme:L\d+$/i.test(sourceUrl);
  if (sourceFamily === 'workspace') return /^local:/i.test(sourceUrl);
  return true;
}

function sourceFamilyRecognized(row) {
  return allowedSourceFamilies.has(String(row?.source_family || '').trim().toLowerCase());
}

function forbiddenSourceRowNote(value) {
  const text = String(value || '');
  if (!/quotation|example|translation(?!-output)/i.test(text)) return false;
  if (/excluded|not imported/i.test(text)) return false;
  if (/no\s+english[\s\S]{0,80}translation[\s\S]{0,80}imported/i.test(text)) return false;
  if (/no[\s\S]{0,80}translation[\s\S]{0,80}imported/i.test(text)) return false;
  return true;
}

function licenseUrlCompatible(row) {
  const license = String(row?.license || '').trim();
  const licenseUrl = String(row?.license_url || '').trim();
  if (!license || !licenseUrl) return false;
  if (/^Public Domain$/i.test(license)) return /^https:\/\/creativecommons\.org\/publicdomain\/mark\/1\.0\/?$/i.test(licenseUrl);
  if (/^CC BY 4\.0$/i.test(license) || /^CC-BY(?: 4\.0)?$/i.test(license)) {
    return /^https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/?$/i.test(licenseUrl);
  }
  if (/^CC BY-SA 4\.0 \/ GFDL$/i.test(license) || /^CC BY-SA 4\.0\/GFDL$/i.test(license)) {
    return /^https:\/\/en\.wiktionary\.org\/wiki\/Wiktionary:Copyrights$/i.test(licenseUrl);
  }
  if (/^CC0$/i.test(license)) {
    return /^https:\/\/creativecommons\.org\/publicdomain\/zero\/1\.0\/?$/i.test(licenseUrl)
      || /^https:\/\/www\.wikidata\.org\/wiki\/Wikidata:Licensing$/i.test(licenseUrl);
  }
  if (/^project-authored \/ CC0$/i.test(license)) {
    return /^local:/i.test(licenseUrl) || /^https:\/\/creativecommons\.org\/publicdomain\/zero\/1\.0\/?$/i.test(licenseUrl);
  }
  if (/^N\/A - project lexical rule$/i.test(license) || /^N\/A - project-authored lexical rules$/i.test(license)) {
    return /^local:/i.test(licenseUrl);
  }
  return false;
}

function forbiddenFieldsUsedEntry(value) {
  const text = String(value || '');
  return /translation|quotation/i.test(text) || (/example/i.test(text) && !/without examples/i.test(text));
}

function validRouteScoreField(field, value) {
  if (!Number.isFinite(value)) return false;
  if (field === 'score_handicap') return value >= -100 && value <= 100;
  return value >= 0 && value <= 100;
}

function checkRouteScoreFormula(card, context, target = audit) {
  target.counts.route_score_formula_checks += 1;
  if (
    Number.isFinite(card?.raw_score)
    && Number.isFinite(card?.score_handicap)
    && Number.isFinite(card?.adjusted_score)
    && card.adjusted_score === card.raw_score - card.score_handicap
  ) {
    return;
  }
  target.counts.invalid_route_score_formulas += 1;
  addIssue(context, 'invalid route score formula: adjusted_score must equal raw_score - score_handicap', target);
}

function addIssue(context, detail, target = audit) {
  target.counts.issue_count += 1;
  if (target.issues.length >= options.maxIssues) return;
  target.issues.push({ context, detail: String(detail).slice(0, 300) });
}

function validateManifestPublicationBoundary(boundary, target = audit) {
  if (!boundary || typeof boundary !== 'object') {
    addIssue('public lookup manifest publication_boundary', 'publication_boundary object is required', target);
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    addIssue('public lookup manifest publication_boundary', `publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`, target);
  }
  for (const item of ['public_hud_route_lookup_manifest', 'public_hud_route_lookup_shards']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      addIssue('public lookup manifest publication_boundary', `validates missing ${item}`, target);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      addIssue('public lookup manifest publication_boundary', `does_not_clear missing ${item}`, target);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    addIssue('public lookup manifest publication_boundary', 'answer_eligible_scope must block translation/publication readiness overclaim', target);
  }
  if (!String(boundary.route_lookup_scope || '').includes('not_publication_readiness')) {
    addIssue('public lookup manifest publication_boundary', 'route_lookup_scope must state not_publication_readiness', target);
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    addIssue('public lookup manifest publication_boundary', 'warning_status_blocks_publication_claim must be true', target);
  }
  if (boundary.current_route_inputs_reconciled !== 'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift') {
    addIssue('public lookup manifest publication_boundary', 'current_route_inputs_reconciled must defer to release stamp and drift validation', target);
  }
}

function validatePublicLookupPath(manifestData, target = audit) {
  const context = 'public lookup manifest public_lookup';
  if (!manifestData || typeof manifestData !== 'object') {
    addIssue(context, 'manifest object is required', target);
    return;
  }
  if (!manifestData.public_lookup) {
    addIssue(context, 'public_lookup is required', target);
    return;
  }
  let publicLookup = '';
  try {
    publicLookup = cleanRelativePath(manifestData.public_lookup);
  } catch (error) {
    addIssue(context, error.message, target);
    return;
  }
  if (publicLookup !== 'data/definitions/hud-route-lookup') {
    addIssue(context, `public_lookup must be data/definitions/hud-route-lookup: ${publicLookup}`, target);
  }
}

function addWarning(context, detail, target = audit) {
  target.counts.warning_count += 1;
  if (target.warnings.length >= options.maxWarnings) return;
  target.warnings.push({ context, detail: String(detail).slice(0, 300) });
}

function increment(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Route Publication Boundary Audit',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- `answer_eligible` means the route card can be considered for the HUD answer slot.',
    '- `answer_eligible` is not accepted translation-output readiness.',
    '- Publication readiness must come from a later renderer/translation gate, not from this route lookup.',
    '',
    '## Publication Boundary',
    '',
    `- Publication status: ${data.publication_boundary.publication_status}`,
    `- Validates: ${data.publication_boundary.validates.join(', ')}`,
    `- Does not clear: ${data.publication_boundary.does_not_clear.join(', ')}`,
    `- Answer eligibility scope: ${data.publication_boundary.answer_eligible_scope}`,
    `- Warning status blocks publication claim: ${data.publication_boundary.warning_status_blocks_publication_claim}`,
    `- Current route inputs reconciled: ${data.publication_boundary.current_route_inputs_reconciled}`,
    '',
    '## Counts',
    '',
    `- Shards scanned: ${data.counts.shards}`,
    `- Manifest shard path checks: ${data.counts.manifest_shard_path_checks}`,
    `- Invalid manifest shard paths: ${data.counts.invalid_manifest_shard_paths}`,
    `- Duplicate manifest shard paths: ${data.counts.duplicate_manifest_shard_paths}`,
    `- Duplicate manifest shard IDs: ${data.counts.duplicate_manifest_shard_ids}`,
    `- Shard identity checks: ${data.counts.shard_identity_checks}`,
    `- Shard identity mismatches: ${data.counts.shard_identity_mismatches}`,
    `- Shard count fields checked: ${data.counts.shard_count_fields_checked}`,
    `- Shard count field mismatches: ${data.counts.shard_count_field_mismatches}`,
    `- Tokens scanned: ${data.counts.tokens}`,
    `- Cards scanned: ${data.counts.cards}`,
    `- Card IDs checked: ${data.counts.card_ids_checked}`,
    `- Duplicate card IDs: ${data.counts.duplicate_card_ids}`,
    `- Normalized lookup key checks: ${data.counts.normalized_lookup_key_checks}`,
    `- Normalized lookup key mismatches: ${data.counts.normalized_lookup_key_mismatches}`,
    `- Route-card string fields checked: ${data.counts.route_card_string_fields_checked}`,
    `- Invalid route-card string fields: ${data.counts.invalid_route_card_string_fields}`,
    `- Route score fields checked: ${data.counts.route_score_fields_checked}`,
    `- Invalid route score fields: ${data.counts.invalid_route_score_fields}`,
    `- Route score formula checks: ${data.counts.route_score_formula_checks}`,
    `- Invalid route score formulas: ${data.counts.invalid_route_score_formulas}`,
    `- Cards with source rows: ${data.counts.route_cards_with_source_rows}`,
    `- Cards missing source rows: ${data.counts.route_cards_missing_source_rows}`,
    `- Cards with duplicate source IDs: ${data.counts.route_cards_with_duplicate_source_ids}`,
    `- Answer-eligible cards: ${data.counts.answer_eligible_cards}`,
    `- Answer-eligible cards with source rows: ${data.counts.answer_eligible_cards_with_source_rows}`,
    `- Answer-eligible cards with numeric answer score: ${data.counts.answer_eligible_cards_with_answer_score}`,
    `- Answer-eligible cards missing numeric answer score: ${data.counts.answer_eligible_cards_missing_answer_score}`,
    `- Cards with answer role: ${data.counts.answer_role_answer_cards}`,
    `- Cards with answer role but not answer-eligible: ${data.counts.answer_role_answer_noneligible_cards}`,
    `- Form-reference cards: ${data.counts.form_reference_cards}`,
    `- Invalid form-reference cards: ${data.counts.invalid_form_reference_cards}`,
    `- Form-reference tag entries checked: ${data.counts.form_reference_tag_entries_checked}`,
    `- Invalid form-reference tag entries: ${data.counts.invalid_form_reference_tag_entries}`,
    `- Source rows checked: ${data.counts.source_rows}`,
    `- Duplicate source IDs within route cards: ${data.counts.source_row_duplicate_source_ids}`,
    `- Source-row string fields checked: ${data.counts.source_row_string_fields_checked}`,
    `- Invalid source-row string fields: ${data.counts.invalid_source_row_string_fields}`,
    `- Source-row fields_used entries checked: ${data.counts.source_row_fields_used_entries_checked}`,
    `- Invalid source-row fields_used entries: ${data.counts.invalid_source_row_fields_used_entries}`,
    `- Fields_used exclusion entries checked: ${data.counts.fields_used_exclusion_entries_checked}`,
    `- Forbidden fields_used entries: ${data.counts.forbidden_fields_used_entries}`,
    `- Source family checks: ${data.counts.source_family_checks}`,
    `- Invalid source family values: ${data.counts.invalid_source_family_values}`,
    `- Source-row notes checked: ${data.counts.source_row_notes_checked}`,
    `- Forbidden source-row notes: ${data.counts.forbidden_source_row_notes}`,
    `- Reference URL fields checked: ${data.counts.reference_url_fields_checked}`,
    `- Invalid reference URL fields: ${data.counts.invalid_reference_url_fields}`,
    `- Source URL compatibility checks: ${data.counts.source_url_compatibility_checks}`,
    `- Invalid source URL compatibility rows: ${data.counts.invalid_source_url_compatibility}`,
    `- License URL compatibility checks: ${data.counts.license_url_compatibility_checks}`,
    `- Invalid license URL compatibility rows: ${data.counts.invalid_license_url_compatibility}`,
    `- HUD-unsafe source rows: ${data.counts.hud_unsafe_source_rows}`,
    `- Translation-output unsafe source rows flagged: ${data.counts.translation_output_unsafe_source_rows}`,
    `- Translation-output unsafe cards flagged: ${data.counts.translation_output_unsafe_cards}`,
    `- Answer-eligible translation-output unsafe source rows flagged: ${data.counts.answer_eligible_translation_output_unsafe_source_rows}`,
    `- Answer-eligible translation-output unsafe cards flagged: ${data.counts.answer_eligible_translation_output_unsafe_cards}`,
    `- Cards with publication-readiness fields: ${data.counts.route_cards_with_publication_fields}`,
    `- Cards with reviewed-authority status overclaims: ${data.counts.route_cards_with_authority_status_overclaims}`,
    `- Issues: ${data.counts.issue_count}`,
    `- Warnings: ${data.counts.warning_count}`,
    `- Manifest SHA-256: \`${data.inputs.manifest_file?.sha256 || 'missing'}\``,
    `- Validator SHA-256: \`${data.inputs.generator_file?.sha256 || 'missing'}\``,
    `- Fixture cases checked: ${data.inputs.fixture_cases}`,
    `- Fixture bytes: ${data.inputs.fixture_file?.byte_length || 0}`,
    `- Fixture SHA-256: \`${data.inputs.fixture_file?.sha256 || 'missing'}\``,
    `- HUD contract: \`${data.inputs.contract}\``,
    `- Allowed display sections: ${data.contract.allowed_display_sections.join(', ')}`,
    '',
    '## Unsafe For Accepted Translation Output',
    '',
    'These rows may still be valid HUD route evidence, but they are not automatically safe as accepted translation-output support without downstream attribution/license handling.',
    '',
    ...topCounts(data.unsafe_translation_output_licenses, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Unsafe For Accepted Translation Output',
    '',
    'These are answer-slot candidates whose source rows remain HUD-safe but require downstream attribution/license handling before use as accepted translation-output support.',
    '',
    ...topCounts(data.answer_eligible_unsafe_translation_output_licenses, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Unsafe Samples',
    '',
    data.samples.answer_eligible_translation_output_unsafe_cards.length
      ? `Stored in ${options.output} with ${data.samples.answer_eligible_translation_output_unsafe_cards.length} capped sample card(s).`
      : 'None.',
    '',
    '## Route Families',
    '',
    ...topCounts(data.route_families, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Display Sections',
    '',
    ...topCounts(data.display_sections, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer Roles',
    '',
    ...topCounts(data.answer_roles, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Route Families',
    '',
    ...topCounts(data.answer_eligible_route_families, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Route Types',
    '',
    ...topCounts(data.answer_eligible_route_types, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Display Sections',
    '',
    ...topCounts(data.answer_eligible_display_sections, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Answer-Eligible Match Types',
    '',
    ...topCounts(data.answer_eligible_match_types, 20).map((row) => `- ${row.value}: ${row.count}`),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue.context}: ${issue.detail}`) : ['None.']),
    '',
    '## Warning Contexts',
    '',
    data.warnings.length
      ? `Stored in ${options.output} with a capped sample of ${data.warnings.length} warning context(s).`
      : 'None.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function topCounts(object, limit) {
  return Object.entries(object || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--manifest') parsed.manifest = cleanRelativePath(args[++index]);
    else if (arg.startsWith('--contract=')) parsed.contract = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--contract') parsed.contract = cleanRelativePath(args[++index]);
    else if (arg.startsWith('--fixture=')) parsed.fixture = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--fixture') parsed.fixture = cleanRelativePath(args[++index]);
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--output') parsed.output = cleanRelativePath(args[++index]);
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg.startsWith('--max-issues=')) parsed.maxIssues = Number(valueAfterEquals(arg));
    else if (arg === '--max-issues') parsed.maxIssues = Number(args[++index]);
    else if (arg.startsWith('--max-warnings=')) parsed.maxWarnings = Number(valueAfterEquals(arg));
    else if (arg === '--max-warnings') parsed.maxWarnings = Number(args[++index]);
    else if (arg === '--fixtures-only') parsed.fixturesOnly = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_route_publication_boundary.mjs',
      '',
      'Options:',
      '  --manifest=data/definitions/hud-route-lookup/manifest.json',
      '  --contract=data/definitions/hud-route-contract.json',
      '  --fixture=data/definitions/route-publication-boundary-fixtures.json',
      '  --output=reports/route-publication-boundary-audit.json',
      '  --report=reports/route-publication-boundary-audit.md',
      '  --max-issues=100',
      '  --max-warnings=25',
      '  --fixtures-only',
      '  --help',
    ].join('\n'));
    process.exit(0);
  }
  for (const key of ['maxIssues', 'maxWarnings']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) throw new Error(`--${key} must be a non-negative integer`);
  }
  parsed.manifest = cleanRelativePath(parsed.manifest);
  parsed.contract = cleanRelativePath(parsed.contract);
  parsed.fixture = cleanRelativePath(parsed.fixture);
  parsed.output = cleanRelativePath(parsed.output);
  parsed.report = cleanRelativePath(parsed.report);
  assertExactPath('--manifest', parsed.manifest, 'data/definitions/hud-route-lookup/manifest.json');
  assertExactPath('--contract', parsed.contract, 'data/definitions/hud-route-contract.json');
  assertExactPath('--fixture', parsed.fixture, 'data/definitions/route-publication-boundary-fixtures.json');
  assertExactPath('--output', parsed.output, 'reports/route-publication-boundary-audit.json');
  assertExactPath('--report', parsed.report, 'reports/route-publication-boundary-audit.md');
  assertFileExtension('--output', parsed.output, '.json');
  assertFileExtension('--report', parsed.report, '.md');
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be a relative in-repo path: ${value}`);
  }
  return normalized;
}

function assertExactPath(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label} must be ${expected}: ${actual}`);
}

function assertPathUnder(label, actual, expectedPrefix) {
  if (actual !== expectedPrefix && !actual.startsWith(`${expectedPrefix}/`)) {
    throw new Error(`${label} must stay under ${expectedPrefix}: ${actual}`);
  }
}

function assertFileExtension(label, actual, expectedExtension) {
  if (!actual.endsWith(expectedExtension)) throw new Error(`${label} must end with ${expectedExtension}: ${actual}`);
}

function readJson(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function contractSectionIds(contractData) {
  const ids = (contractData.route_sections || [])
    .map((section) => String(section?.section_id || '').trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  if (!ids.length) throw new Error(`HUD route contract has no route_sections: ${options.contract}`);
  return [...new Set(ids)];
}

function fileSummary(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  const bytes = fs.readFileSync(fullPath);
  return {
    path: cleanRelativePath(relativePath),
    byte_length: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
