#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const issues = [];
const releaseRunnerPath = 'scripts/run_hud_route_release_candidate.mjs';
const publishPath = 'scripts/publish_hud_route_lookup.mjs';
const stampPath = 'scripts/stamp_hud_route_release.mjs';
const routeCardsPath = 'scripts/validate_public_hud_route_cards.mjs';
const normalizedKeysPath = 'scripts/validate_public_hud_normalized_keys.mjs';
const localLookupPath = 'scripts/validate_hud_route_lookup.mjs';
const publicLookupPath = 'scripts/validate_public_hud_route_lookup.mjs';
const routeBoundaryPath = 'scripts/validate_route_publication_boundary.mjs';
const routeAnswerSafetyPath = 'scripts/validate_route_answer_safety.mjs';
const routeBoundaryCoherencePath = 'scripts/validate_route_publication_boundary_coherence.mjs';
const releaseGatePath = 'scripts/validate_hud_route_release_gate.mjs';
const releaseGateReportPath = 'scripts/validate_hud_route_release_gate_report.mjs';
const inputFreezePath = 'scripts/validate_hud_route_input_freeze.mjs';
const freezeVolumePath = 'scripts/validate_hud_route_freeze_volume.mjs';
const releaseVolumePath = 'scripts/validate_hud_route_release_volume.mjs';
const releaseStampValidatorPath = 'scripts/validate_hud_route_release_stamp.mjs';
const releaseRunnerSource = read(releaseRunnerPath);
const publishSource = read(publishPath);
const stampSource = read(stampPath);
const routeCardsSource = read(routeCardsPath);
const normalizedKeysSource = read(normalizedKeysPath);
const localLookupSource = read(localLookupPath);
const publicLookupSource = read(publicLookupPath);
const routeBoundarySource = read(routeBoundaryPath);
const routeAnswerSafetySource = read(routeAnswerSafetyPath);
const routeBoundaryCoherenceSource = read(routeBoundaryCoherencePath);
const releaseGateSource = read(releaseGatePath);
const releaseGateReportSource = read(releaseGateReportPath);
const inputFreezeSource = read(inputFreezePath);
const freezeVolumeSource = read(freezeVolumePath);
const releaseVolumeSource = read(releaseVolumePath);
const releaseStampValidatorSource = read(releaseStampValidatorPath);

validateReleaseRunnerGuards();
validatePublishGuards();
validateStampGuards();
validatePublicValidatorGuards(routeCardsSource, routeCardsPath, {
  '--report': 'reports/public-hud-route-card-scan.md',
});
validatePublicValidatorGuards(normalizedKeysSource, normalizedKeysPath, {
  '--report': 'reports/public-hud-normalized-key-audit.md',
  '--json': 'reports/public-hud-normalized-key-audit.json',
});
validateLocalLookupValidatorGuards();
validatePublicLookupStructureValidatorGuards();
validateRouteBoundaryValidatorGuards();
validateRouteAnswerSafetyValidatorGuards();
validateRouteBoundaryCoherenceValidatorGuards();
validateReleaseGateValidatorGuards();
validateReleaseGateReportValidatorGuards();
validateInputFreezeValidatorGuards();
validateFreezeVolumeValidatorGuards();
validateReleaseVolumeValidatorGuards();
validateReleaseStampValidatorGuards();

if (issues.length) {
  console.error(`HUD route publication script guard validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('HUD route publication script guard validation passed.');

function validateReleaseRunnerGuards() {
  requireSource(releaseRunnerSource, releaseRunnerPath, [
    'const defaults = {',
    "sourceDir: '.local-cache/definition-routes',",
    "freezeDir: '.local-cache/definition-route-freeze/current',",
    "storeDir: '.local-cache/hud-route-store',",
    "lookupDir: '.local-cache/hud-route-lookup',",
    "publicDir: 'data/definitions/hud-route-lookup',",
    "storeSample: 'data/definitions/hud-route-store-sample.json',",
    "lookupSample: 'data/definitions/hud-route-lookup-sample.json',",
    "releaseStamp: 'data/definitions/hud-route-release-stamp.json',",
    "releaseReport: 'reports/hud-route-release-stamp.md',",
    "gateReport: 'reports/hud-route-release-gate.md',",
    "gateJson: 'reports/hud-route-release-gate.json',",
    "freezeVolumeReport: 'reports/hud-route-freeze-volume-gate.md',",
    "freezeVolumeJson: 'reports/hud-route-freeze-volume-gate.json',",
    "volumeReport: 'reports/hud-route-release-volume-gate.md',",
    "volumeJson: 'reports/hud-route-release-volume-gate.json',",
    'for (const key of pathOptionKeys) parsed[key] = cleanPath(parsed[key]);',
    'validatePathScopes(parsed);',
    "assertExactPath('source-dir', parsed.sourceDir, '.local-cache/definition-routes');",
    "assertExactPath('freeze-dir', parsed.freezeDir, '.local-cache/definition-route-freeze/current');",
    "assertExactPath('store-dir', parsed.storeDir, '.local-cache/hud-route-store');",
    "assertExactPath('lookup-dir', parsed.lookupDir, '.local-cache/hud-route-lookup');",
    "assertExactPath('public-dir', parsed.publicDir, 'data/definitions/hud-route-lookup');",
    "assertExactPath('release-stamp', parsed.releaseStamp, 'data/definitions/hud-route-release-stamp.json');",
    "assertExactPath('release-report', parsed.releaseReport, 'reports/hud-route-release-stamp.md');",
    "assertExactPath('gate-report', parsed.gateReport, 'reports/hud-route-release-gate.md');",
    "assertExactPath('gate-json', parsed.gateJson, 'reports/hud-route-release-gate.json');",
    'function validateReleasePlan(plannedSteps)',
    "'validate HUD route publication script guards',",
    "'publish public HUD route lookup',",
    "'validate public HUD route lookup structure',",
    "'validate route answer safety contract',",
    "'scan public HUD route cards',",
    "'validate route publication boundary',",
    "'audit public HUD normalized keys',",
    "'stamp HUD route release',",
    "'validate HUD route release stamp',",
    "'validate frozen route inputs against current sources',",
    "'validate HUD route release gate',",
    "'validate HUD route release gate report',",
    "'validate route publication boundary coherence',",
    '/render/i.test(step.label)',
    '/render_site\\.ps1$/i.test(script)',
    '/upgrade_route_hud_pages\\.mjs$/i.test(script)',
    'HUD route release plan must not include broad render or page-upgrade step',
  ]);
  assertSourceOrder(releaseRunnerSource, releaseRunnerPath, 'const options = parseArgs(process.argv.slice(2));', 'const steps = [');
  assertSourceOrder(releaseRunnerSource, releaseRunnerPath, 'validateReleasePlan(steps);', 'for (const step of steps) runStep(step);');
  assertSourceOrder(releaseRunnerSource, releaseRunnerPath, "'validate route answer safety contract',", "'validate HUD route publication script guards',");
  assertSourceOrder(releaseRunnerSource, releaseRunnerPath, "'validate HUD route publication script guards',", "'publish public HUD route lookup',");
  assertSourceOrder(releaseRunnerSource, releaseRunnerPath, "'validate public HUD route lookup structure',", "'stamp HUD route release',");
  assertSourceOrder(releaseRunnerSource, releaseRunnerPath, "'validate HUD route release stamp',", "'validate frozen route inputs against current sources',");
}

function validatePublishGuards() {
  requireSource(publishSource, publishPath, [
    "args.localDir = cleanRelativePath(args.localDir);",
    "args.publicDir = cleanRelativePath(args.publicDir);",
    "assertExactPath('--local-dir', args.localDir, '.local-cache/hud-route-lookup');",
    "assertExactPath('--public-dir', args.publicDir, 'data/definitions/hud-route-lookup');",
    'function cleanRelativePath(value)',
    'function cleanManifestShardPath(value)',
    'function assertExactPath(label, value, expected)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    "cleanShardPath.startsWith('shards/')",
    "cleanShardPath.endsWith('.json')",
    'const shardPath = cleanManifestShardPath(shard.path);',
  ]);
  assertSourceOrder(publishSource, publishPath, 'const args = parseArgs(process.argv.slice(2));', 'fs.rmSync(publicDir');
  assertSourceOrder(publishSource, publishPath, 'validateSourceManifest(localManifest, args);', 'fs.rmSync(publicDir');
}

function validateStampGuards() {
  requireSource(stampSource, stampPath, [
    'const pathOptionKeys = [',
    'for (const key of pathOptionKeys) parsed[key] = cleanRelativePath(parsed[key]);',
    'validatePathScopes(parsed);',
    "assertExactPath('--freeze-manifest', parsed.freezeManifest, '.local-cache/definition-route-freeze/current/route-input-freeze.json');",
    "assertExactPath('--store-manifest', parsed.storeManifest, '.local-cache/hud-route-store/manifest.json');",
    "assertExactPath('--lookup-manifest', parsed.lookupManifest, '.local-cache/hud-route-lookup/manifest.json');",
    "assertExactPath('--public-manifest', parsed.publicManifest, 'data/definitions/hud-route-lookup/manifest.json');",
    "assertExactPath('--route-audit', parsed.routeAudit, '.local-cache/definition-route-freeze/current/definition-route-claim-audit.json');",
    "assertExactPath('--output', parsed.output, 'data/definitions/hud-route-release-stamp.json');",
    "assertExactPath('--report', parsed.report, 'reports/hud-route-release-stamp.md');",
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, value, expected)',
    'function expectedFrozenInputPath(fileName)',
    'function assertFileExtension(label, value, expectedExtension)',
    'function cleanRelativePath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'const frozenPath = cleanRelativePath(input.frozen_path ||',
    'const expectedFrozenPath = expectedFrozenInputPath(input.file);',
    'frozen input path must be',
  ]);
  assertSourceOrder(stampSource, stampPath, 'const options = parseArgs(process.argv.slice(2));', 'const freezeManifest = readJson(options.freezeManifest);');
  assertSourceOrder(stampSource, stampPath, 'const expectedFrozenPath = expectedFrozenInputPath(input.file);', 'const fullPath = path.join(root, frozenPath);');
}

function validatePublicValidatorGuards(source, filePath, outputArgs) {
  requireSource(source, filePath, [
    'parsed.manifest = cleanRelativePath(parsed.manifest);',
    "assertExactPath('--manifest', parsed.manifest, 'data/definitions/hud-route-lookup/manifest.json');",
    'function cleanRelativePath(value)',
    'function cleanManifestShardPath(value)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    "manifestShardPath.startsWith('shards/')",
    "manifestShardPath.endsWith('.json')",
  ]);
  for (const [arg, expectedPath] of Object.entries(outputArgs)) {
    requireSource(source, filePath, [
      `assertExactPath('${arg}', parsed.${arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase())}, '${expectedPath}');`,
    ]);
  }
  assertSourceOrder(source, filePath, 'const options = parseArgs(process.argv.slice(2));', 'const manifestPath = path.join(root, options.manifest);');
}

function validateLocalLookupValidatorGuards() {
  requireSource(localLookupSource, localLookupPath, [
    "const manifestPath = path.join(root, '.local-cache', 'hud-route-lookup', 'manifest.json');",
    "const samplePath = path.join(root, 'data', 'definitions', 'hud-route-lookup-sample.json');",
    "if (arg === '--fixtures-only') parsed.fixturesOnly = true;",
    'const allowedLicensePatterns = [',
    'function safeLicense(row)',
    'function validateCard(card, context, issues)',
    'function validateMachineAuthorityStatus(card, context, issues)',
    'function validateFixtures(issues)',
    'function validateSamplePublicationBoundary(boundary, sampleType, issues)',
    'if (options.fixturesOnly) {',
    'validateFixtures(issues);',
    'status=verified fixture must be rejected as reviewed-authority overclaim',
    'review_status=verified fixture must be rejected as reviewed-authority overclaim',
    'reviewed_lexical_authority=true fixture must be rejected on machine route cards',
    "validateSamplePublicationBoundary(sample.publication_boundary, 'hud_route_lookup', issues);",
    "if (!safeLicense(row)) issues.push",
    "sample publication_boundary.publication_status must be blocked_no_render",
    "sample publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim",
    "sample publication_boundary.sample_scope must state not_publication_readiness",
    "sample publication_boundary.current_route_inputs_reconciled must defer to release stamp and drift validation",
    "for (const field of ['status', 'review_status', 'authority_status', 'lexical_authority_status'])",
    "verified is reserved for reviewed lexical authority, not machine route cards",
    "reviewed_lexical_authority=true is not allowed on machine route cards",
  ]);
  assertSourceOrder(localLookupSource, localLookupPath, 'function validateCard(card, context, issues)', 'function validateMachineAuthorityStatus(card, context, issues)');
  assertSourceOrder(localLookupSource, localLookupPath, 'validateMachineAuthorityStatus(card, context, issues);', "if (typeof card.answer_eligible !== 'boolean')");
}

function validatePublicLookupStructureValidatorGuards() {
  requireSource(publicLookupSource, publicLookupPath, [
    "const publicDir = path.join(root, 'data', 'definitions', 'hud-route-lookup');",
    "const manifestPath = path.join(publicDir, 'manifest.json');",
    "const releaseStampPath = path.join(root, 'data', 'definitions', 'hud-route-release-stamp.json');",
    "const samplePath = path.join(root, 'data', 'definitions', 'hud-route-lookup-sample.json');",
    "if (arg === '--skip-release-stamp') parsed.checkReleaseStamp = false;",
    'const allowedLicensePatterns = [',
    'function safeLicense(row)',
    'function validateCard(card, context, issues)',
    'function validateMachineAuthorityStatus(card, context, issues)',
    'function validateReleaseStamp(manifest, issues)',
    'function validatePublicationBoundary(boundary, context, requiredValidates, issues)',
    'function validateSamplePublicationBoundary(boundary, context, sampleType, issues)',
    "validatePublicationBoundary(manifest.publication_boundary, 'public lookup manifest', [",
    "validateSamplePublicationBoundary(sample.publication_boundary, 'public lookup sample', 'hud_route_lookup', issues);",
    "if (options.checkReleaseStamp) validateReleaseStamp(manifest, issues);",
    "if (!safeLicense(row)) issues.push",
    "publication_status must be blocked_no_render",
    "does_not_clear missing ${item}",
    "answer_eligible_scope must block translation/publication readiness overclaim",
    "route_lookup_scope must state not_publication_readiness",
    "sample_scope must state not_publication_readiness",
    "warning_status_blocks_publication_claim must be true",
    "current_route_inputs_reconciled must defer to release stamp and drift validation",
    "for (const field of ['status', 'review_status', 'authority_status', 'lexical_authority_status'])",
    "verified is reserved for reviewed lexical authority, not machine route cards",
    "reviewed_lexical_authority=true is not allowed on machine route cards",
  ]);
  assertSourceOrder(publicLookupSource, publicLookupPath, 'const options = parseArgs(process.argv.slice(2));', 'const issues = [];');
  assertSourceOrder(publicLookupSource, publicLookupPath, "validatePublicationBoundary(manifest.publication_boundary, 'public lookup manifest'", 'if (options.checkReleaseStamp) validateReleaseStamp(manifest, issues);');
  assertSourceOrder(publicLookupSource, publicLookupPath, "validateSamplePublicationBoundary(sample.publication_boundary, 'public lookup sample'", 'if (options.checkReleaseStamp) validateReleaseStamp(manifest, issues);');
}

function validateRouteBoundaryValidatorGuards() {
  requireSource(routeBoundarySource, routeBoundaryPath, [
    'validatePublicLookupPath(manifest, audit);',
    "const lookupRoot = 'data/definitions/hud-route-lookup';",
    'parsed.manifest = cleanRelativePath(parsed.manifest);',
    "assertExactPath('--manifest', parsed.manifest, 'data/definitions/hud-route-lookup/manifest.json');",
    "assertExactPath('--contract', parsed.contract, 'data/definitions/hud-route-contract.json');",
    "assertExactPath('--fixture', parsed.fixture, 'data/definitions/route-publication-boundary-fixtures.json');",
    "assertExactPath('--output', parsed.output, 'reports/route-publication-boundary-audit.json');",
    "assertExactPath('--report', parsed.report, 'reports/route-publication-boundary-audit.md');",
    "assertFileExtension('--output', parsed.output, '.json');",
    "assertFileExtension('--report', parsed.report, '.md');",
    'function validatePublicLookupPath(manifestData, target = audit)',
    'function cleanRelativePath(value)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
  ]);
  assertSourceOrder(routeBoundarySource, routeBoundaryPath, 'const options = parseArgs(process.argv.slice(2));', 'const contract = readJson(options.contract);');
  assertSourceOrder(routeBoundarySource, routeBoundaryPath, 'const manifest = readJson(options.manifest);', 'validatePublicLookupPath(manifest, audit);');
}

function validateRouteAnswerSafetyValidatorGuards() {
  requireSource(routeAnswerSafetySource, routeAnswerSafetyPath, [
    "import { compareCards } from './build_hud_route_lookup.mjs';",
    "answer-eligible card must outrank higher-scoring evidence in lookup sort",
    "evidence card must not carry answer_score",
    "form reference card must not be answer_eligible",
    'form reference card must display "form of [lemma]"',
    "const boundaryFixturePath = path.join(root, 'data', 'definitions', 'citable-boundary-regression-fixtures.json');",
    'missing citable boundary regression fixture',
    'boundary fixture must include bat-yam/mermaid vs batim/houses must-not-match case',
    'const claimKey = lookupKeyForClaim(testCase.claim_surface, testCase.claim_normalized || testCase.claim_surface);',
    'const tokenKey = lookupKeyForSurface(testCase.source_surface);',
    'if (matched !== testCase.expected_match) {',
    'function normalizeHebrewBoundaryKey(value)',
    'function lookupKeyForSurface(value)',
    'function lookupKeyForClaim(surface, normalized)',
    'hasWordBoundary(surface) ? normalizeHebrewBoundaryKey(surface) : normalizeHebrew(normalized || surface)',
  ]);
  assertSourceOrder(routeAnswerSafetySource, routeAnswerSafetyPath, 'const sorted = [evidenceCard, answerCard].sort(compareCards);', "assert(sorted[0].card_id === answerCard.card_id");
  assertSourceOrder(routeAnswerSafetySource, routeAnswerSafetyPath, 'const boundaryFixturePath = path.join(root,', 'function lookupKeyForClaim(surface, normalized)');
}

function validateRouteBoundaryCoherenceValidatorGuards() {
  requireSource(routeBoundaryCoherenceSource, routeBoundaryCoherencePath, [
    'validatePathScopes(parsed);',
    'parsed.stampJson = cleanRelativePath(parsed.stampJson);',
    "assertExactPath('--stamp-json', parsed.stampJson, 'data/definitions/hud-route-release-stamp.json');",
    "assertExactPath('--gate-json', parsed.gateJson, 'reports/hud-route-release-gate.json');",
    "assertExactPath('--gate-validation-json', parsed.gateValidationJson, 'reports/hud-route-release-gate-validation.json');",
    "assertExactPath('--summary-json', parsed.summaryJson, 'reports/route-boundary-report-summary-validation.json');",
    "assertExactPath('--audit-json', parsed.auditJson, 'reports/route-publication-boundary-audit.json');",
    "assertExactPath('--output', parsed.outputJson, 'reports/route-publication-boundary-coherence.json');",
    "assertExactPath('--report', parsed.outputReport, 'reports/route-publication-boundary-coherence.md');",
    "assertFileExtension('--output', parsed.outputJson, '.json');",
    "assertFileExtension('--report', parsed.outputReport, '.md');",
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'function cleanRelativePath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'path.join(root, cleanRelativePath(relativePath))',
  ]);
  assertSourceOrder(routeBoundaryCoherenceSource, routeBoundaryCoherencePath, 'const options = parseArgs(process.argv.slice(2));', 'const stamp = readJson(options.stampJson);');
}

function validateReleaseGateValidatorGuards() {
  requireSource(releaseGateSource, releaseGatePath, [
    'validatePathScopes(parsed);',
    'parsed.stamp = cleanPath(parsed.stamp);',
    "assertExactPath('--stamp', parsed.stamp, 'data/definitions/hud-route-release-stamp.json');",
    "assertExactPath('--public-manifest', parsed.publicManifest, 'data/definitions/hud-route-lookup/manifest.json');",
    "assertExactPath('--contract', parsed.contract, 'data/definitions/hud-route-contract.json');",
    "assertExactPath('--sample', parsed.sample, 'data/definitions/hud-route-lookup-sample.json');",
    "assertExactPath('--boundary-report', parsed.boundaryReport, 'reports/route-publication-boundary-audit.json');",
    "assertExactPath('--drift-report', parsed.driftReport, 'reports/hud-route-input-freeze-drift.md');",
    "assertExactPath('--report', parsed.report, 'reports/hud-route-release-gate.md');",
    "assertExactPath('--json', parsed.json, 'reports/hud-route-release-gate.json');",
    "assertFileExtension('--report', parsed.report, '.md');",
    "assertFileExtension('--json', parsed.json, '.json');",
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'function cleanPath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'path.join(root, cleanPath(relativePath))',
  ]);
  assertSourceOrder(releaseGateSource, releaseGatePath, 'const options = parseArgs(process.argv.slice(2));', "const stamp = readJson(options.stamp, 'release stamp');");
}

function validateReleaseGateReportValidatorGuards() {
  requireSource(releaseGateReportSource, releaseGateReportPath, [
    'validatePathScopes(parsed);',
    "assertExactPath('--gate-json', parsed.gateJson, 'reports/hud-route-release-gate.json');",
    "assertExactPath('--gate-report', parsed.gateReport, 'reports/hud-route-release-gate.md');",
    "assertExactPath('--output', parsed.output, 'reports/hud-route-release-gate-validation.json');",
    "assertExactPath('--report', parsed.report, 'reports/hud-route-release-gate-validation.md');",
    "assertFileExtension('--output', parsed.output, '.json');",
    "assertFileExtension('--report', parsed.report, '.md');",
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'function cleanPath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'path.join(root, cleanPath(relativePath))',
  ]);
  assertSourceOrder(releaseGateReportSource, releaseGateReportPath, 'const options = parseArgs(process.argv.slice(2));', 'const gate = readJson(options.gateJson);');
}

function validateInputFreezeValidatorGuards() {
  requireSource(inputFreezeSource, inputFreezePath, [
    'validatePathScopes(parsed);',
    'parsed.stamp = cleanPath(parsed.stamp);',
    'parsed.sourceDir = cleanPath(parsed.sourceDir);',
    'parsed.report = cleanPath(parsed.report);',
    'validateResolvedSourceDir(sourceDir);',
    "assertExactPath('--stamp', parsed.stamp, 'data/definitions/hud-route-release-stamp.json');",
    "assertExactPath('--source-dir', parsed.sourceDir, '.local-cache/definition-routes');",
    "assertExactPath('--report', parsed.report, 'reports/hud-route-input-freeze-drift.md');",
    "assertFileExtension('--report', parsed.report, '.md');",
    'function validatePathScopes(parsed)',
    'function validateResolvedSourceDir(sourceDir)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'function cleanPath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'path.join(root, cleanPath(relativePath))',
    'path.join(sourceDir, cleanPath(input.file))',
    'path.join(sourceDir, cleanPath(optional.file))',
  ]);
  assertSourceOrder(inputFreezeSource, inputFreezePath, 'const options = parseArgs(process.argv.slice(2));', "const stamp = readJson(options.stamp, 'HUD route release stamp');");
  assertSourceOrder(inputFreezeSource, inputFreezePath, 'validateResolvedSourceDir(sourceDir);', "if (!sourceDir) issues.push('missing source route directory; pass --source-dir or stamp frozen_inputs.source_dir');");
}

function validateFreezeVolumeValidatorGuards() {
  requireSource(freezeVolumeSource, freezeVolumePath, [
    'validatePathScopes(parsed);',
    'parsed.freezeManifest = cleanPath(parsed.freezeManifest);',
    'parsed.report = cleanPath(parsed.report);',
    'parsed.json = cleanPath(parsed.json);',
    "assertExactPath('--freeze-manifest', parsed.freezeManifest, '.local-cache/definition-route-freeze/current/route-input-freeze.json');",
    "assertExactPath('--report', parsed.report, 'reports/hud-route-freeze-volume-gate.md');",
    "assertExactPath('--json', parsed.json, 'reports/hud-route-freeze-volume-gate.json');",
    "assertFileExtension('--report', parsed.report, '.md');",
    "assertFileExtension('--json', parsed.json, '.json');",
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'function cleanPath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'const fullPath = path.join(root, clean);',
  ]);
  assertSourceOrder(freezeVolumeSource, freezeVolumePath, 'const options = parseArgs(process.argv.slice(2));', 'const manifest = readJson(options.freezeManifest);');
}

function validateReleaseVolumeValidatorGuards() {
  requireSource(releaseVolumeSource, releaseVolumePath, [
    'validatePathScopes(parsed);',
    'parsed.routeAudit = cleanPath(parsed.routeAudit);',
    'parsed.report = cleanPath(parsed.report);',
    'parsed.json = cleanPath(parsed.json);',
    "assertExactPath('--route-audit', parsed.routeAudit, '.local-cache/definition-route-freeze/current/definition-route-claim-audit.json');",
    "assertExactPath('--report', parsed.report, 'reports/hud-route-release-volume-gate.md');",
    "assertExactPath('--json', parsed.json, 'reports/hud-route-release-volume-gate.json');",
    "assertFileExtension('--report', parsed.report, '.md');",
    "assertFileExtension('--json', parsed.json, '.json');",
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, actual, expected)',
    'function assertPathUnder(label, actual, expectedPrefix)',
    'function assertFileExtension(label, actual, expectedExtension)',
    'function cleanPath(value)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'const fullPath = path.join(root, clean);',
  ]);
  assertSourceOrder(releaseVolumeSource, releaseVolumePath, 'const options = parseArgs(process.argv.slice(2));', 'const audit = readJson(options.routeAudit);');
}

function validateReleaseStampValidatorGuards() {
  requireSource(releaseStampValidatorSource, releaseStampValidatorPath, [
    "assertExactPath('release stamp path', stampPath, 'data/definitions/hud-route-release-stamp.json');",
    "assertExactPath('route_store manifest path', routeStoreManifestPath, '.local-cache/hud-route-store/manifest.json');",
    "assertExactPath('local_lookup manifest path', localLookupManifestPath, '.local-cache/hud-route-lookup/manifest.json');",
    "assertExactPath('public_lookup manifest path', publicLookupManifestPath, 'data/definitions/hud-route-lookup/manifest.json');",
    "assertExactPath('frozen input path', frozenPath, expectedFrozenInputPath(input.file));",
    "assertExactPath('public shard manifest path', cleanManifestPath, 'data/definitions/hud-route-lookup/manifest.json');",
    'function cleanRelativePath(value)',
    'function cleanPublicShardPath(value)',
    'function assertExactPath(label, actual, expected)',
    'function expectedFrozenInputPath(fileName)',
    'function validateReleaseArtifactPath(relativePath, context)',
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    "clean.startsWith('shards/')",
    "clean.endsWith('.json')",
    'const clean = cleanRelativePath(relativePath);',
    'validateReleaseArtifactPath(clean, context);',
    'const clean = cleanRelativePath(relativePath);',
    'validateReleaseArtifactPath(clean, `readJson ${clean}`);',
    'const shardRelativePath = cleanPublicShardPath(shard.path);',
    'const shardPath = path.join(root, path.dirname(publicLookupManifestPath), shardRelativePath);',
  ]);
  assertSourceOrder(releaseStampValidatorSource, releaseStampValidatorPath, 'const stampPath = cleanRelativePath(', 'const stamp = readJson(stampPath);');
  assertSourceOrder(releaseStampValidatorSource, releaseStampValidatorPath, "assertExactPath('release stamp path'", 'const stamp = readJson(stampPath);');
  assertSourceOrder(releaseStampValidatorSource, releaseStampValidatorPath, 'const frozenPath = cleanRelativePath(input.frozen_path);', 'const actualRows = await countJsonlRows(path.join(root, frozenPath));');
}

function requireSource(source, filePath, needles) {
  for (const needle of needles) {
    if (!source.includes(needle)) issues.push(`${filePath} missing guard source: ${needle}`);
  }
}

function assertSourceOrder(source, filePath, earlier, later) {
  const earlierIndex = source.indexOf(earlier);
  const laterIndex = source.indexOf(later);
  if (earlierIndex === -1) issues.push(`${filePath} missing source before-order marker: ${earlier}`);
  if (laterIndex === -1) issues.push(`${filePath} missing source after-order marker: ${later}`);
  if (earlierIndex !== -1 && laterIndex !== -1 && earlierIndex >= laterIndex) {
    issues.push(`${filePath} requires "${earlier}" before "${later}"`);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}
