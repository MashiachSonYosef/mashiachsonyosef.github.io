#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = 'reports/agent5-control-readiness.md';
const issues = [];
const warnings = [];
const checks = [];

const routeStamp = readJsonIfExists('data/definitions/hud-route-release-stamp.json');
const publicHandoff = readJsonIfExists('data/workbench-evidence/public-handoff-index.json');
const legacyHandoff = readJsonIfExists('data/workbench-evidence/handoff-index.json');
const translationMemory = readJsonIfExists('data/translation-memory/translation-memory-index.json');
const translationContract = readJsonIfExists('data/translation-memory/translation-decision-contract.json');
const attributionManifest = readJsonIfExists('data/translation-memory/attribution-manifest.json');
const hudAccessibilityAudit = readJsonIfExists('reports/agent5-route-hud-accessibility-audit.json');

checkRouteReleaseStamp(routeStamp);
checkHudRouteReleaseGate(routeStamp);
checkWorkbenchPublicHandoff(publicHandoff, legacyHandoff);
checkWorkbenchUsageNavigation();
checkTranslationMemory(translationMemory, translationContract);
checkAttributionManifest(translationMemory, attributionManifest);
checkReportMarkers();
checkHudAccessibilityAudit(hudAccessibilityAudit);
checkKnownContractDrift();

writeReport();

if (issues.length) {
  console.error(`Agent 5 control readiness failed with ${issues.length} issue(s), ${warnings.length} warning(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 5 control readiness passed with ${warnings.length} warning(s). Report: ${reportPath}`);

function checkRouteReleaseStamp(stamp) {
  const label = 'HUD route release stamp';
  if (!stamp) {
    fail(label, 'missing data/definitions/hud-route-release-stamp.json');
    return;
  }
  if (stamp.artifact_type !== 'hud_route_release_stamp') fail(label, 'invalid artifact_type');
  if (stamp.status !== 'release_candidate') fail(label, `status is ${stamp.status || 'missing'}, expected release_candidate`);
  if ((stamp.issues || []).length) fail(label, `stamp has ${stamp.issues.length} issue(s)`);
  if (stamp.reconciliation?.counts_match !== true) fail(label, 'reconciliation.counts_match is not true');
  if (!Number.isFinite(stamp.reconciliation?.public_cards_written) || stamp.reconciliation.public_cards_written <= 0) {
    fail(label, 'public_cards_written missing or zero');
  }
  pass(label, `release ${stamp.release_id || 'unknown'}; public cards ${stamp.reconciliation?.public_cards_written || 0}; public shards ${stamp.reconciliation?.public_shard_count || 0}`);
}

function checkHudRouteReleaseGate(stamp) {
  const label = 'HUD route release gate';
  const report = readTextIfExists('reports/hud-route-release-gate.md');
  if (!report) {
    warn(label, 'missing reports/hud-route-release-gate.md');
    return;
  }
  const status = firstReportValue(report, 'Status');
  const releaseId = firstReportValue(report, 'Release ID');
  const cards = parseInteger(firstBulletValue(report, 'Cards'));
  const shards = parseInteger(firstBulletValue(report, 'Shards'));
  if (status === 'pass_with_warnings') {
    warn(label, `status ${status}; route lookup integrity passed but frozen route-source reconciliation has warnings`);
  } else if (status !== 'pass') {
    fail(label, `release gate status is ${status || 'missing'}, expected pass or pass_with_warnings`);
  }
  if (stamp?.release_id && releaseId && releaseId !== stamp.release_id) {
    fail(label, `release gate ${releaseId} does not match stamp ${stamp.release_id}`);
  }
  if (!cards || !shards) fail(label, 'public cards or shards count missing from release gate');
  if (status === 'pass') {
    pass(label, `status ${status || 'unknown'}; release ${releaseId || 'unknown'}; cards ${cards || 0}; shards ${shards || 0}`);
  }
}

function checkWorkbenchPublicHandoff(index, legacyIndex) {
  const label = 'Workbench public handoff index';
  if (!index) {
    fail(label, 'missing data/workbench-evidence/public-handoff-index.json');
    return;
  }
  if (index.artifact_type !== 'workbench_public_handoff_index') fail(label, 'invalid artifact_type');
  if (Number(index.counts?.selected_targets || 0) <= 0) fail(label, 'selected_targets is zero');
  if (Number(index.counts?.validation_failed || 0) !== 0) fail(label, 'validation_failed is nonzero');
  if (Number(index.counts?.reader_facing_eligible_rows || 0) <= 0) fail(label, 'reader-facing eligible rows is zero');
  if (index.reader_facing_policy?.ambiguous_rows_reader_facing !== false) fail(label, 'ambiguous_rows_reader_facing must be false');
  if (index.consumer_contract?.visible_answer_authority !== false) fail(label, 'visible_answer_authority must be false');
  pass(label, `${index.counts?.selected_targets || 0} selected targets; ${index.counts?.reader_facing_eligible_rows || 0} eligible usage rows; ${index.counts?.count_only_ambiguous_rows || 0} ambiguous count-only rows`);

  if (legacyIndex?.counts?.manifests === 0 && Number(index.counts?.selected_targets || 0) > 0) {
    warn('Workbench handoff authority drift', 'legacy data/workbench-evidence/handoff-index.json still reports 0 manifests; use public-handoff-index.json as the current authority');
  }
}

function checkWorkbenchUsageNavigation() {
  const label = 'Workbench usage navigation links';
  const concordanceReport = readTextIfExists('reports/workbench-usage-concordance-link-check.md');
  const routeLinkReport = readTextIfExists('reports/workbench-usage-route-link-check.md');
  if (!concordanceReport) {
    warn(label, 'missing reports/workbench-usage-concordance-link-check.md');
    return;
  }
  if (!routeLinkReport) {
    warn(label, 'missing reports/workbench-usage-route-link-check.md');
    return;
  }
  const concordanceStatus = firstReportValue(concordanceReport, 'Status') || firstBulletValue(concordanceReport, 'Status');
  const routeStatus = firstReportValue(routeLinkReport, 'Status') || firstBulletValue(routeLinkReport, 'Status');
  const rowsChecked = parseInteger(firstBulletValue(concordanceReport, 'Rows checked'));
  const badUrls = parseInteger(firstInlineSummaryValue(concordanceReport, 'Source URLs', 'bad'));
  const missingAnchors = parseInteger(firstBulletValue(concordanceReport, 'Missing anchors'));
  const unresolvedLinks = parseInteger(firstBulletValue(routeLinkReport, 'Unresolved route links'));
  if (concordanceStatus !== 'passed') fail(label, `concordance link status is ${concordanceStatus || 'missing'}, expected passed`);
  if (routeStatus !== 'passed') fail(label, `route link status is ${routeStatus || 'missing'}, expected passed`);
  if (!rowsChecked || rowsChecked <= 0) fail(label, 'rows checked is zero or missing');
  if (badUrls !== 0) fail(label, `bad source URLs: ${badUrls}`);
  if (missingAnchors !== 0) fail(label, `missing anchors: ${missingAnchors}`);
  if (unresolvedLinks !== 0) fail(label, `unresolved route links: ${unresolvedLinks}`);
  pass(label, `${rowsChecked || 0} concordance links checked; bad URLs ${badUrls || 0}; unresolved route links ${unresolvedLinks || 0}`);
}

function checkTranslationMemory(index, contract) {
  const label = 'Translation memory scaffold';
  if (!contract) fail(label, 'missing translation decision contract');
  if (!index) {
    fail(label, 'missing translation memory index');
    return;
  }
  if (index.artifact_type !== 'translation_memory_index') fail(label, 'invalid index artifact_type');
  if (index.contract !== 'data/translation-memory/translation-decision-contract.json') fail(label, 'index contract path mismatch');
  if (Number(index.counts?.decision_files || 0) <= 0) fail(label, 'decision_files is zero');
  if (Number(index.counts?.decision_rows || 0) <= 0) warn(label, 'decision_rows is zero; schema exists but no occurrence scaffolding is populated');
  if (contract?.contract_id !== 'translation-decision-contract') fail(label, 'invalid contract_id');
  pass(label, `${index.counts?.decision_rows || 0} scaffold rows; accepted ${index.counts?.accepted || 0}; candidate ${index.counts?.candidate || 0}; ambiguous ${index.counts?.ambiguous || 0}; needs_review ${index.counts?.needs_review || 0}`);
  checkTranslationMemoryAnchors(index);
}

function checkTranslationMemoryAnchors(index) {
  const label = 'Translation memory source anchors';
  const expectedRows = Number(index.counts?.decision_rows || 0);
  if (expectedRows > 10000) {
    warn(label, `skipped row-level anchor scan for ${expectedRows} rows; use scripts/validate_translation_memory.mjs for full validation`);
    return;
  }
  const seenDecisionIds = new Set();
  const seenOccurrenceIds = new Set();
  let rows = 0;
  let quoteAnchors = 0;
  let positionAnchors = 0;
  const licenseProfiles = {};
  let directTranslationUseOk = 0;
  let publicationReviewRequired = 0;
  for (const file of index.decision_files || []) {
    const text = readTextIfExists(file.path || '');
    for (const line of text.split(/\r?\n/).filter(Boolean)) {
      rows += 1;
      let row;
      try {
        row = JSON.parse(line);
      } catch (error) {
        fail(label, `${file.path}: invalid JSONL row ${rows}: ${error.message}`);
        continue;
      }
      if (seenDecisionIds.has(row.decision_id)) fail(label, `duplicate decision_id ${row.decision_id}`);
      else seenDecisionIds.add(row.decision_id);
      if (seenOccurrenceIds.has(row.surface_occurrence_id)) fail(label, `duplicate surface_occurrence_id ${row.surface_occurrence_id}`);
      else seenOccurrenceIds.add(row.surface_occurrence_id);
      if (row.source_anchor?.text_quote_selector?.exact) quoteAnchors += 1;
      if (row.source_anchor?.text_position_selector) positionAnchors += 1;
      const publicationClass = row.license_profile?.publication_class || 'missing';
      licenseProfiles[publicationClass] = (licenseProfiles[publicationClass] || 0) + 1;
      if (row.license_profile?.direct_translation_use_ok === true) directTranslationUseOk += 1;
      else publicationReviewRequired += 1;
    }
  }
  if (rows !== expectedRows) fail(label, `row count mismatch, expected ${expectedRows}, got ${rows}`);
  if (quoteAnchors !== rows) fail(label, `quote anchor count ${quoteAnchors} does not match rows ${rows}`);
  if (rows > 0 && positionAnchors === 0) warn(label, 'no position anchors found; quote anchors still preserve portability');
  pass(label, `${rows} rows; ${quoteAnchors} quote anchors; ${positionAnchors} position anchors; unique decision/occurrence IDs`);
  pass(
    'Translation memory license profiles',
    `${directTranslationUseOk} direct-use rows; ${publicationReviewRequired} publication-review rows; ${Object.entries(licenseProfiles).map(([key, count]) => `${key}:${count}`).join(', ')}`,
  );
}

function checkAttributionManifest(index, manifest) {
  const label = 'Translation attribution manifest';
  if (!manifest) {
    warn(label, 'missing data/translation-memory/attribution-manifest.json; future publication attribution bundle not exported');
    return;
  }
  if (manifest.artifact_type !== 'translation_memory_attribution_manifest') fail(label, 'invalid artifact_type');
  if (Number(manifest.counts?.decision_rows || 0) !== Number(index?.counts?.decision_rows || 0)) {
    fail(label, `decision row count mismatch, manifest ${manifest.counts?.decision_rows || 0}, index ${index?.counts?.decision_rows || 0}`);
  }
  if (Number(manifest.counts?.sources || 0) <= 0) fail(label, 'source count is zero');
  pass(label, `${manifest.counts?.sources || 0} sources; ${manifest.counts?.attribution_required_sources || 0} attribution-required; ${manifest.counts?.publication_review_sources || 0} publication-review`);
}

function checkReportMarkers() {
  const routeReport = readTextIfExists('reports/route-hud-page-upgrade-report.md');
  const smokeReport = readTextIfExists('reports/workbench-smoke-pipeline-validation.md');
  if (!routeReport) {
    warn('Route HUD page report', 'missing reports/route-hud-page-upgrade-report.md');
  } else {
    const currentHudSweepMatch = routeReport.match(/Static HUD-shell sweep:\s*([\d,]+)\s+pages containing both `data-lexical-hud` and `hud_route_lookup_manifest_url` checked;\s*0 contain `Rank details`;\s*0 are missing `article\.dataset\.rankBasis`/);
    const currentPublicSpreadMatch = routeReport.match(/Public HUD static spread:\s*([\d,]+)\s+HUD pages checked/);
    const currentRankBasisClear = /Rank-basis blocker:\s*0 pages contain `Rank details`;\s*0 current HUD pages are missing `article\.dataset\.rankBasis`/.test(routeReport);
    const currentOldMarkersClear = /Stale old-HUD marker blocker:\s*0 pages contain `Best actual hit`, `Full source and license rows`, or `Clicked Hebrew form`/.test(routeReport);
    const currentRouteLookupPass = /Route lookup:\s*`node scripts\\validate_public_hud_route_lookup\.mjs --skip-release-stamp` passed/.test(routeReport);
    const currentHudCount = parseInteger(currentHudSweepMatch?.[1]) || parseInteger(currentPublicSpreadMatch?.[1]);
    if (currentHudCount && currentRankBasisClear && currentOldMarkersClear && currentRouteLookupPass) {
      pass('Route HUD page report', `current static HUD-shell sweep count ${currentHudCount}; rank-basis, stale markers, and route lookup clear`);
      return;
    }

    const inventoryMatches = [...routeReport.matchAll(/Source-page static inventory:\s*([\d,]+)\s+data-source pages checked/g)];
    const routeHudInventoryMatches = [...routeReport.matchAll(/all\s+([\d,]+)\s+route-HUD pages contain/g)];
    const validatorMatches = [...routeReport.matchAll(/Source-page strict validator:\s*passed for all\s+([\d,]+)\s+current data-source pages/g)];
    const inventoryCount = parseInteger(inventoryMatches.at(-1)?.[1]) || parseInteger(routeHudInventoryMatches.at(-1)?.[1]);
    const validatorCount = parseInteger(validatorMatches.at(-1)?.[1]);
    if (!inventoryCount || !validatorCount) {
      if (inventoryCount && /Source-page strict validator:\s*passed for the 9 established sample pages and representative pages/.test(routeReport)) {
        warn('Route HUD page report', `current inventory reports ${inventoryCount} route-HUD pages; only sample/representative strict validation is current`);
      } else {
        warn('Route HUD page report', 'latest source inventory or strict validator count marker missing');
      }
    } else if (inventoryCount !== validatorCount) {
      warn('Route HUD page report', `current inventory count ${inventoryCount} does not match latest full strict validator count ${validatorCount}`);
    } else {
      pass('Route HUD page report', `latest source-page strict validator count ${validatorCount}`);
    }
  }

  if (!smokeReport) {
    warn('Workbench smoke pipeline report', 'missing reports/workbench-smoke-pipeline-validation.md');
  } else {
    if (!/- Failed steps: 0/.test(smokeReport)) warn('Workbench smoke pipeline report', 'failed step count marker missing or nonzero');
    if (/Source freshness: stale/.test(smokeReport)) warn('Workbench source freshness', 'smoke evidence is stale against newer source set; treat as bounded smoke coverage, not site-wide coverage');
    pass('Workbench smoke pipeline report', 'smoke pipeline report present');
  }
}

function checkHudAccessibilityAudit(audit) {
  const label = 'Route HUD accessibility audit';
  if (!audit) {
    warn(label, 'missing reports/agent5-route-hud-accessibility-audit.json; run scripts/audit_route_hud_accessibility.mjs before polish claims');
    return;
  }
  const errors = Number(audit.summary?.by_severity?.error || 0);
  const warningsCount = Number(audit.summary?.by_severity?.warning || 0);
  if (errors > 0) {
    warn(label, `${errors} accessibility control error(s), ${warningsCount} warning(s); modal semantics remain unresolved`);
    return;
  }
  if (warningsCount > 0) {
    warn(label, `0 errors, ${warningsCount} warning(s); review before marketing polish claims`);
    return;
  }
  pass(label, '0 errors, 0 warnings');
}

function checkKnownContractDrift() {
  const staleNeedles = [
    ['scripts/validate_sources.mjs', 'Best actual hit'],
    ['scripts/upgrade_route_hud_pages.mjs', 'Best actual hit'],
    ['scripts/validate_hud_route_preview.mjs', 'Best actual hit'],
    ['scripts/validate_hud_contract.mjs', 'Full source and license rows'],
    ['hud-preview/routes/app.js', 'Full source and license rows'],
    ['data/definitions/hud-route-contract.json', 'Best actual hit'],
    ['data/definitions/hud-route-contract.json', 'Full source and license rows'],
  ];
  const staleHits = [];
  for (const [file, needle] of staleNeedles) {
    const text = readTextIfExists(file);
    if (!text?.includes(needle)) continue;
    const lines = text.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      if (!line.includes(needle)) continue;
      const context = lines.slice(Math.max(0, index - 8), index + 2).join('\n');
      const isNegativeControl = /for\s*\(\s*const\s+forbidden\s+of\s+\[/.test(context)
        || /assert\(!/.test(line)
        || /must not use stale/.test(line)
        || /must not use stale/.test(context)
        || /forbids? old labels?/i.test(context);
      if (!isNegativeControl) {
        staleHits.push({ file, needle, line: index + 1 });
        break;
      }
    }
  }
  if (staleHits.length) {
    const details = staleHits
      .map((hit) => `${hit.file}:${hit.line} (${hit.needle})`)
      .join('; ');
    warn('Stale HUD contract tools', `${staleHits.length} positive legacy marker assumption(s) remain: ${details}; keep scripts/validate_route_hud_page.mjs and release stamps as current authority`);
  } else {
    pass('Stale HUD contract tools', 'no positive legacy marker assumptions found in known stale files');
  }
}

function pass(name, detail) {
  checks.push({ status: 'pass', name, detail });
}

function warn(name, detail) {
  warnings.push(`${name}: ${detail}`);
  checks.push({ status: 'warn', name, detail });
}

function fail(name, detail) {
  issues.push(`${name}: ${detail}`);
  checks.push({ status: 'fail', name, detail });
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function readTextIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

function writeReport() {
  const lines = [
    '# Agent 5 Control Readiness',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Status: ${issues.length ? 'failed' : 'passed'}`,
    `- Issues: ${issues.length}`,
    `- Warnings: ${warnings.length}`,
    '',
    '## Checks',
    '',
    '| status | check | detail |',
    '|---|---|---|',
    ...checks.map((check) => `| ${check.status} | ${escapeCell(check.name)} | ${escapeCell(check.detail)} |`),
    '',
    '## Control Interpretation',
    '',
    '- This is a lightweight control check only. It does not hash large route inputs, run renders, run builds, or validate generated pages.',
    '- A pass means the current architecture-level stamps exist and agree at the metadata level.',
    '- Warnings identify bounded-scope or authority-drift risks that should be carried into Agent 5 control notes.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
  fs.writeFileSync(path.join(root, reportPath), `${lines.join('\n')}\n`, 'utf8');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function parseInteger(value) {
  if (!value) return null;
  const parsed = Number.parseInt(String(value).replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstReportValue(text, label) {
  const match = String(text || '').match(new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}

function firstBulletValue(text, label) {
  const match = String(text || '').match(new RegExp(`^-\\s*${escapeRegExp(label)}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}

function firstInlineSummaryValue(text, label, key) {
  const lineMatch = String(text || '').match(new RegExp(`^-\\s*${escapeRegExp(label)}:\\s*(.+)$`, 'm'));
  if (!lineMatch) return null;
  const valueMatch = lineMatch[1].match(new RegExp(`${escapeRegExp(key)}\\s+([\\d,]+)`));
  return valueMatch?.[1] || null;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
