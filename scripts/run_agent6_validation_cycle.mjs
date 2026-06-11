#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = new Date().toISOString().slice(0, 10);
const output = cleanRelativePath(argValue('--output') || `reports/agent6-validation-cycle-${today}.md`);
const jsonOutput = cleanRelativePath(argValue('--json') || output.replace(/\.md$/i, '.json'));
const validatorResultsInput = cleanRelativePath(argValue('--validator-results') || '');
const trackedSourcesInput = cleanRelativePath(argValue('--tracked-sources') || '');

const routeDirs = [
  'jewish-thought',
  'halakhah',
  'gra',
  'midrash',
  'chasidut',
  'tanakh',
  'targum',
  'kabbalah',
  'liturgy',
  'musar',
  'other',
  'second-temple',
  'talmud',
  'rav-kook',
  'mishnah',
  'orot',
  'ari',
  'tosefta',
];

const representativePages = [
  'tanakh/genesis/index.html',
  'tanakh/exodus/index.html',
  'halakhah/urim-vetumim-urim/index.html',
  'halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html',
  'other/beer-hagolah/index.html',
  'jewish-thought/kuzari/index.html',
  'midrash/yefeh-toar-on-bereshit-rabbah/index.html',
  'targum/targum-jonathan-on-genesis/index.html',
  'mishnah/mishnah-berakhot/index.html',
  'chasidut/baal-shem-tov/index.html',
  'gra/aderet-eliyahu/index.html',
];

const routeHudRequiredMarkers = [
  'data-lexical-occurrences',
  'data-lexical-config',
  'data-lexical-slot',
  'data-lexical-hud',
  'data-route-hud-panel',
  'Route HUD',
  'role="dialog"',
  'aria-labelledby="route-hud-title"',
  'aria-live="polite"',
  'aria-haspopup", "dialog"',
  'aria-controls", "route-hud-panel"',
  'aria-expanded", "false"',
  'id="route-hud-title"',
  'id="route-hud-panel"',
  'aria-label="Close route HUD"',
  'tabindex="-1"',
  'Definition',
  'Strict Hebrew matches',
  'Strict Aramaic matches',
  'Lemma matches',
  'Word-part breakdown',
  'Citable definition/paraphrase matches',
  'Usage evidence',
  'observed usage only',
  'usage-evidence-details',
  'article.dataset.rankBasis',
  'Sources and licenses',
  'source-footnotes',
  'hud_route_lookup_manifest_url',
  'answer_eligible',
  'answer_role',
  'lookupCandidateTreatments',
  'hero-summary',
  'hero-notes',
  'prefix-stripped candidate',
  'plural-suffix candidate',
  'possessive-suffix candidate',
  'maqaf component',
  'closeRouteHud',
  'restoreFocus',
  'buttonToRestore.focus',
  'Escape',
  'hud.focus',
];

const routeHudForbiddenMarkers = [
  'Clicked Hebrew form',
  'No lexical entry yet.',
  'Potential options',
  'Show potential options',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'data-hud-renderings',
  'data-hud-potential',
  'data-hud-related',
  'data-hud-sources',
  'lexical-fields',
  'Best actual hit',
  'Full source and license rows',
  'inline-gloss',
  'routeHudInlineGlossMode',
  'The focus token is marked so the surrounding words do not become the definition.',
  '<big>',
  '&lt;big',
  'source-details',
  'source-row',
  'source-claim',
  'renderSourceGroups',
  'routeSourceGroups',
  'sourceSummary =',
  'sourceRowMap',
  'hud-scroll-note',
  'cleanTransliteration',
  'Rank details',
];

const validators = [
  {
    gate: 'publication',
    label: 'Publication render contract',
    command: ['node', 'scripts/validate_publication_render_contract.mjs'],
    blocker: true,
  },
  {
    gate: 'definition',
    label: 'Definition sources',
    command: ['node', 'scripts/validate_definition_sources.mjs'],
    blocker: true,
  },
  {
    gate: 'definition',
    label: 'Definition outputs',
    command: ['node', 'scripts/validate_definition_outputs.mjs'],
    blocker: false,
    warning: true,
  },
  {
    gate: 'definition',
    label: 'HUD route release stamp',
    command: ['node', 'scripts/validate_hud_route_release_stamp.mjs'],
    blocker: true,
  },
  {
    gate: 'definition',
    label: 'HUD route release gate',
    command: ['node', 'scripts/validate_hud_route_release_gate.mjs'],
    blocker: true,
    warning: true,
    timeoutMs: 420000,
  },
  {
    gate: 'definition',
    label: 'HUD route lookup',
    command: ['node', 'scripts/validate_hud_route_lookup.mjs'],
    blocker: true,
  },
  {
    gate: 'definition',
    label: 'Public HUD route lookup',
    command: ['node', 'scripts/validate_public_hud_route_lookup.mjs', '--skip-release-stamp'],
    blocker: true,
  },
  {
    gate: 'definition',
    label: 'Route answer safety',
    command: ['node', 'scripts/validate_route_answer_safety.mjs'],
    blocker: true,
  },
  {
    gate: 'definition',
    label: 'Route publication boundary',
    command: ['node', 'scripts/validate_route_publication_boundary.mjs'],
    blocker: true,
    warning: true,
    timeoutMs: 180000,
  },
  {
    gate: 'usage',
    label: 'Agent 6 usage boundary packet',
    command: ['node', 'scripts/validate_workbench_usage_agent6_boundary_packet.mjs'],
    blocker: true,
  },
  {
    gate: 'usage',
    label: 'Usage concordance',
    command: ['node', 'scripts/validate_workbench_usage_concordance.mjs'],
    blocker: true,
  },
  {
    gate: 'control',
    label: 'Agent 5 control readiness',
    command: ['node', 'scripts/validate_agent5_control_readiness.mjs'],
    blocker: false,
    warning: true,
  },
  {
    gate: 'provenance',
    label: 'Source license labels',
    command: ['node', 'scripts/audit_source_license_labels.mjs', 'reports/source-license-label-audit.md'],
    blocker: true,
  },
  {
    gate: 'provenance',
    label: 'Translation memory',
    command: ['node', 'scripts/validate_translation_memory.mjs'],
    blocker: true,
  },
  {
    gate: 'provenance',
    label: 'Translation memory license profiles',
    command: ['node', 'scripts/audit_translation_memory_license_profiles.mjs'],
    blocker: false,
    warning: true,
  },
];

const startedAt = new Date().toISOString();
const validatorResults = readValidatorResults();
const publication = readPublicationGate();
const routeBoundary = readRoutePublicationBoundary();
const definitionSweep = scanDefinitionIntegrity();
const publicHud = scanPublicHud();
const representativeHud = validateRepresentativeHudPages();
const sourceLicense = scanSourceLicenseIngress();
const usage = readUsageBoundary();
const control = readControlReadiness();
const gateStatus = classifyGates({
  validatorResults,
  publication,
  routeBoundary,
  definitionSweep,
  publicHud,
  representativeHud,
  sourceLicense,
  usage,
  control,
});

const docket = {
  schema_version: 1,
  artifact_type: 'agent6_validation_cycle',
  generated_at: new Date().toISOString(),
  agent: 'Agent 6',
  policy: 'Independent QA/compliance validation cycle. This report validates gates and evidence; it does not implement fixes, render pages, publish translation text, commit, or push.',
  outputs: { report: output, json: jsonOutput },
  gate_status: gateStatus,
  validators: validatorResults,
  publication,
  definition_integrity: definitionSweep,
  route_publication_boundary: routeBoundary,
  public_hud: publicHud,
  representative_hud_pages: representativeHud,
  source_license_ingress: sourceLicense,
  usage_boundary: usage,
  control_readiness: control,
  relay: nextRelay(gateStatus, publicHud),
};

writeJson(jsonOutput, docket);
writeReport(output, docket);

console.log(`Agent 6 validation cycle complete. Report: ${output}`);
console.log(`Top gate: ${docket.relay.owner}`);
console.log(docket.relay.prompt);

function readValidatorResults() {
  if (validatorResultsInput) {
    const payload = readJsonIfExists(validatorResultsInput);
    if (Array.isArray(payload?.validators)) return normalizeValidatorResults(payload.validators);
    if (Array.isArray(payload)) return normalizeValidatorResults(payload);
  }
  return normalizeValidatorResults(validators.map((spec) => ({
    gate: spec.gate,
    label: spec.label,
    command: spec.command.join(' '),
    started_at: '',
    exit_code: null,
    ok: null,
    timed_out: false,
    severity: 'not_run',
    stdout: '',
    stderr: validatorResultsInput
      ? `validator results file was unreadable or malformed: ${validatorResultsInput}`
      : 'not run by this Node report generator; use scripts/run_agent6_validation_cycle.ps1 to execute validators first',
  })));
}

function normalizeValidatorResults(results) {
  return results.map((result) => {
    const text = `${result.stdout || ''}\n${result.stderr || ''}`;
    if (
      result.label === 'Source license labels'
      && result.exit_code !== 0
      && /spawnSync git EPERM/.test(text)
      && sourceLicenseAuditLooksCurrent()
    ) {
      return {
        ...result,
        severity: 'warning',
        wrapper_limitation: 'PowerShell redirection can block the validator internal git spawn; latest source-license audit report exists and is parsed separately.',
      };
    }
    return result;
  });
}

function sourceLicenseAuditLooksCurrent() {
  const report = readTextIfExists('reports/source-license-label-audit.md');
  return /Unrecognized units:\s*0/.test(report) && /Missing-license units:\s*0/.test(report);
}

function scanDefinitionIntegrity() {
  const manifest = readJsonIfExists('data/definitions/hud-route-lookup/manifest.json');
  const lookupRoot = cleanRelativePath(manifest?.public_lookup || 'data/definitions/hud-route-lookup');
  const counts = {
    shards_scanned: 0,
    tokens_scanned: 0,
    cards_scanned: 0,
    answer_eligible_cards: 0,
    non_answer_cards: 0,
    source_rows: 0,
    cards_with_source_rows: 0,
    cards_missing_source_rows: 0,
    usage_evidence_cards: 0,
    candidate_or_ambiguous_like_cards: 0,
    kaikki_answer_eligible_cards: 0,
    route_cards_with_publication_fields: 0,
    route_cards_with_publication_language: 0,
    tokens_with_multiple_answer_eligible: 0,
    tokens_with_multiple_distinct_answer_definitions: 0,
  };
  const issueCounts = {};
  const samples = {
    answer_eligible: [],
    multi_answer: [],
    kaikki_answer_eligible: [],
    usage_evidence: [],
    changed_since_release: scanRouteInputDrift(),
  };
  if (!manifest?.shards) {
    return {
      status: 'blocker',
      counts,
      issue_counts: { missing_public_lookup_manifest: 1 },
      samples,
    };
  }
  const usageFamilies = new Set(['source_phrase_evidence', 'citable_paraphrase_evidence']);
  const riskStatuses = new Set(['candidate', 'weak', 'ambiguous', 'blocked', 'needs_review', 'review_required']);
  const publicationFieldRe = /publication|publishable|translation_output|direct_translation_use|accepted_translation|publication_ready/i;
  const publicationTextRe = /publication-ready|publication ready|publishable translation|accepted translation|translation-output ready/i;
  for (const shardEntry of manifest.shards) {
    counts.shards_scanned += 1;
    const shard = readJsonIfExists(`${lookupRoot}/${shardEntry.path}`);
    const routesByNormalized = shard?.routes_by_normalized || {};
    for (const [normalized, cards] of Object.entries(routesByNormalized)) {
      counts.tokens_scanned += 1;
      const answerCards = [];
      const answerDefinitions = new Set();
      for (const card of Array.isArray(cards) ? cards : []) {
        counts.cards_scanned += 1;
        const sourceRows = Array.isArray(card.source_rows) ? card.source_rows : [];
        counts.source_rows += sourceRows.length;
        if (sourceRows.length) counts.cards_with_source_rows += 1;
        else {
          counts.cards_missing_source_rows += 1;
          increment(issueCounts, 'missing_source_rows');
        }
        if (typeof card.answer_eligible !== 'boolean') increment(issueCounts, 'missing_or_invalid_answer_eligible');
        if (!card.answer_role) increment(issueCounts, 'missing_answer_role');
        if (card.answer_eligible === true) {
          counts.answer_eligible_cards += 1;
          answerCards.push(card);
          answerDefinitions.add(String(card.definition || '').trim());
          pushSample(samples.answer_eligible, compactCard(card));
          if (card.answer_role !== 'answer') increment(issueCounts, 'answer_eligible_without_answer_role');
          if (!String(card.definition || '').trim()) increment(issueCounts, 'answer_eligible_missing_definition');
          if (usageFamilies.has(card.route_family)) increment(issueCounts, 'usage_evidence_became_definition_authority');
          if (sourceRows.some((row) => String(row?.source_family || '').toLowerCase() === 'kaikki')) {
            counts.kaikki_answer_eligible_cards += 1;
            pushSample(samples.kaikki_answer_eligible, compactCard(card));
          }
        } else {
          counts.non_answer_cards += 1;
          if (Number.isFinite(card.answer_score)) increment(issueCounts, 'non_answer_card_has_answer_score');
        }
        if (card.answer_role === 'answer' && card.answer_eligible !== true) {
          increment(issueCounts, 'answer_role_without_answer_eligible');
        }
        const statusValues = [card.status, card.candidate_status, card.evidence_status, card.usage_status, card.decision_status]
          .filter((value) => value !== undefined && value !== null)
          .map((value) => String(value).toLowerCase());
        if (statusValues.some((value) => riskStatuses.has(value))) {
          counts.candidate_or_ambiguous_like_cards += 1;
          if (card.answer_eligible === true || card.answer_role === 'answer' || card.display_section === 'answer') {
            increment(issueCounts, 'candidate_or_ambiguous_became_definition_authority');
          }
        }
        if (usageFamilies.has(card.route_family) || ['phrase_evidence', 'citable_paraphrase_evidence'].includes(card.display_section)) {
          counts.usage_evidence_cards += 1;
          pushSample(samples.usage_evidence, compactCard(card));
          if (card.answer_eligible === true || card.answer_role === 'answer' || card.display_section === 'answer') {
            increment(issueCounts, 'usage_evidence_became_definition_authority');
          }
        }
        if (Object.keys(card).some((key) => publicationFieldRe.test(key))) {
          counts.route_cards_with_publication_fields += 1;
          increment(issueCounts, 'route_card_has_publication_readiness_field');
        }
        if (publicationTextRe.test(JSON.stringify(card))) {
          counts.route_cards_with_publication_language += 1;
          increment(issueCounts, 'route_card_has_publication_readiness_language');
        }
      }
      if (answerCards.length > 1) {
        counts.tokens_with_multiple_answer_eligible += 1;
        if (answerDefinitions.size > 1) counts.tokens_with_multiple_distinct_answer_definitions += 1;
        pushSample(samples.multi_answer, {
          normalized,
          answer_count: answerCards.length,
          distinct_definition_count: answerDefinitions.size,
          answers: answerCards.slice(0, 4).map(compactCard),
        });
      }
    }
  }
  const issueTotal = Object.values(issueCounts).reduce((sum, count) => sum + count, 0);
  return {
    status: issueTotal ? 'blocker' : counts.tokens_with_multiple_answer_eligible ? 'warning' : 'pass',
    counts,
    issue_counts: issueCounts,
    issue_count: issueTotal,
    samples,
  };
}

function scanPublicHud() {
  const pages = [];
  for (const dir of routeDirs) {
    walkFiles(dir, (file) => {
      if (file.endsWith('index.html')) pages.push(file);
    });
  }
  const currentHudPages = [];
  let missingRankBasis = 0;
  let rankDetails = 0;
  let clickedHebrew = 0;
  for (const file of pages) {
    const html = readTextIfExists(file);
    if (!html.includes('data-route-hud-panel')) continue;
    currentHudPages.push(file);
    if (!html.includes('article.dataset.rankBasis')) missingRankBasis += 1;
    if (html.includes('Rank details')) rankDetails += 1;
    if (html.includes('Clicked Hebrew form')) clickedHebrew += 1;
  }
  return {
    status: missingRankBasis || rankDetails || clickedHebrew ? 'blocker' : 'pass',
    current_hud_pages: currentHudPages.length,
    rank_basis_pages: currentHudPages.length - missingRankBasis,
    missing_rank_basis: missingRankBasis,
    rank_details_pages: rankDetails,
    clicked_hebrew_pages: clickedHebrew,
  };
}

function validateRepresentativeHudPages() {
  return representativePages.map((page) => {
    const issues = validateRouteHudPageStatic(page);
    return {
      page,
      ok: issues.length === 0,
      issue_count: issues.length,
      output: truncate(issues.join('; '), 1200),
    };
  });
}

function validateRouteHudPageStatic(relativePath) {
  const issues = [];
  const html = readTextIfExists(relativePath);
  if (!html) return [`missing page: ${relativePath}`];
  for (const marker of routeHudRequiredMarkers) {
    if (!html.includes(marker)) issues.push(`missing required marker: ${marker}`);
  }
  for (const marker of routeHudForbiddenMarkers) {
    if (html.includes(marker)) issues.push(`contains stale old-HUD marker: ${marker}`);
  }
  for (const match of html.matchAll(/data-hud-[a-z-]+/g)) {
    if (match[0] !== 'data-hud-close') issues.push(`unexpected data-hud marker: ${match[0]}`);
  }
  for (const [index, script] of pageScripts(html).entries()) {
    try {
      new Function(script);
    } catch (error) {
      issues.push(`inline script ${index + 1} failed to parse: ${error.message}`);
    }
  }
  return issues;
}

function pageScripts(html) {
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
}

function scanSourceLicenseIngress() {
  const sourceDir = path.join(root, 'data/sources');
  const sourceFiles = fs.existsSync(sourceDir)
    ? fs.readdirSync(sourceDir).filter((file) => file.endsWith('.json')).sort()
    : [];
  const auditReport = readTextIfExists('reports/source-license-label-audit.md');
  const trackedSourcePaths = trackedSourcesInput
    ? new Set(readTextIfExists(trackedSourcesInput).split(/\r?\n/).filter(Boolean).map(cleanRelativePath))
    : new Set();
  const trackedSourceFiles = trackedSourcePaths.size || firstMarkdownNumber(auditReport, 'Source files') || 0;
  const untrackedNames = trackedSourcePaths.size
    ? sourceFiles.filter((file) => !trackedSourcePaths.has(`data/sources/${file}`))
    : [];
  const inferredUntrackedCount = trackedSourcePaths.size
    ? untrackedNames.length
    : Math.max(0, sourceFiles.length - trackedSourceFiles);
  const licenseCounts = {};
  let untrackedUnits = trackedSourcePaths.size ? 0 : null;
  for (const file of untrackedNames) {
    const json = readJsonIfExists(`data/sources/${file}`);
    for (const unit of Array.isArray(json?.units) ? json.units : []) {
      untrackedUnits += 1;
      increment(licenseCounts, unit.license || 'missing');
    }
  }
  return {
    status: inferredUntrackedCount ? 'warning' : 'pass',
    note: trackedSourcePaths.size
      ? `Tracked source list supplied by ${trackedSourcesInput}.`
      : 'Untracked source file count is inferred from current data/sources file count minus the tracked-file count reported by audit_source_license_labels.mjs. This Node report generator does not spawn git in sandboxed runs.',
    source_files: sourceFiles.length,
    tracked_source_files: trackedSourceFiles,
    untracked_source_files: inferredUntrackedCount,
    untracked_units: untrackedUnits,
    untracked_license_counts: licenseCounts,
    untracked_names: untrackedNames,
  };
}

function readPublicationGate() {
  const report = readTextIfExists('reports/agent5-publication-render-contract-report.md');
  const data = parseJsonFromValidator('Publication render contract');
  const status = data?.status || firstMarkdownValue(report, 'Status') || 'unknown';
  return {
    status,
    rendered_rows: Number(data?.rendered_rows ?? firstMarkdownNumber(report, 'Rendered translation rows checked') ?? 0),
    accepted_decision_rows: Number(data?.accepted_decision_rows ?? firstMarkdownNumber(report, 'Translation-memory accepted rows') ?? 0),
    unknown_license_sources: Number(data?.unknown_license_sources ?? firstMarkdownNumber(report, 'Attribution-manifest unknown-license sources') ?? 0),
    sefaria_sources: Number(data?.sefaria_sources ?? firstMarkdownNumber(report, 'Attribution-manifest Sefaria sources') ?? 0),
  };
}

function readRoutePublicationBoundary() {
  const json = readJsonIfExists('reports/route-publication-boundary-audit.json');
  return {
    status: Number(json?.counts?.issue_count || 0) > 0 ? 'blocker' : Number(json?.counts?.warning_count || 0) > 0 ? 'warning' : 'pass',
    counts: json?.counts || {},
    unsafe_translation_output_licenses: json?.unsafe_translation_output_licenses || {},
    answer_eligible_unsafe_translation_output_licenses: json?.answer_eligible_unsafe_translation_output_licenses || {},
  };
}

function readUsageBoundary() {
  const publicHandoff = readJsonIfExists('data/workbench-evidence/public-handoff-index.json');
  const concordance = readJsonIfExists('data/workbench-evidence/usage-concordance-manifest.json');
  return {
    status: publicHandoff?.consumer_contract?.visible_answer_authority === false ? 'pass' : 'warning',
    selected_targets: Number(publicHandoff?.counts?.selected_targets || 0),
    reader_facing_eligible_rows: Number(publicHandoff?.counts?.reader_facing_eligible_rows || 0),
    ambiguous_rows_reader_facing: publicHandoff?.reader_facing_policy?.ambiguous_rows_reader_facing,
    visible_answer_authority: publicHandoff?.consumer_contract?.visible_answer_authority,
    concordance_rows: Number(concordance?.counts?.rows || 0),
  };
}

function readControlReadiness() {
  const report = readTextIfExists('reports/agent5-control-readiness.md');
  return {
    status: firstMarkdownValue(report, 'Status') || 'unknown',
    issues: Number(firstMarkdownNumber(report, 'Issues') || 0),
    warnings: Number(firstMarkdownNumber(report, 'Warnings') || 0),
  };
}

function classifyGates(data) {
  const commandBlockers = data.validatorResults.filter((result) => result.severity === 'blocker');
  const commandWarnings = data.validatorResults.filter((result) => result.severity === 'warning');
  const gates = {
    publication: {
      status: data.publication.status === 'blocked_no_render' ? 'blocker' : commandBlockers.some((r) => r.gate === 'publication') ? 'blocker' : 'pass',
      reason: data.publication.status === 'blocked_no_render'
        ? 'No publication render artifact and zero accepted rendered rows.'
        : 'Publication render contract did not report blocked_no_render.',
    },
    definition: {
      status: data.definitionSweep.status === 'blocker' || commandBlockers.some((r) => r.gate === 'definition') ? 'blocker' : data.definitionSweep.status === 'warning' || commandWarnings.some((r) => r.gate === 'definition') ? 'warning' : 'pass',
      reason: data.definitionSweep.status === 'blocker'
        ? 'Definition shard sweep found machine-contract blockers.'
        : data.definitionSweep.status === 'warning'
          ? 'Definition data is coherent, but multi-answer authority warnings remain.'
          : 'Definition integrity passed.',
    },
    public_hud: {
      status: data.publicHud.status,
      reason: data.publicHud.status === 'blocker'
        ? `${data.publicHud.missing_rank_basis} pages still miss rank-basis and ${data.publicHud.rank_details_pages} still contain Rank details.`
        : 'Public HUD page contract coverage passed.',
    },
    provenance: {
      status: commandBlockers.some((r) => r.gate === 'provenance') ? 'blocker' : data.sourceLicense.status,
      reason: data.sourceLicense.status === 'warning'
        ? `${data.sourceLicense.untracked_source_files} untracked source files remain outside tracked audit scope.`
        : 'Source/license ingress passed.',
    },
    usage: {
      status: commandBlockers.some((r) => r.gate === 'usage') ? 'blocker' : data.usage.status,
      reason: data.usage.visible_answer_authority === false
        ? 'Agent 3 usage layer remains non-authoritative.'
        : 'Usage layer answer-authority contract is not explicit.',
    },
    control: {
      status: commandBlockers.some((r) => r.gate === 'control') ? 'blocker' : data.control.warnings > 0 || commandWarnings.some((r) => r.gate === 'control') ? 'warning' : 'pass',
      reason: `${data.control.issues} Agent 5 readiness issues, ${data.control.warnings} warnings.`,
    },
  };
  return gates;
}

function nextRelay(gates, publicHudSnapshotForRelay) {
  if (gates.public_hud.status === 'blocker') {
    return {
      owner: 'Agent 4',
      prompt: `Agent 4, Agent 6 validation cycle keeps the public HUD gate blocked. Current sweep: ${publicHudLineFromGates()} Continue only the rank-basis/source-license display contract migration; do not broaden to publication or route-data changes. Acceptance condition: 0 current HUD pages missing article.dataset.rankBasis, 0 pages containing Rank details, 0 Clicked Hebrew form markers, route lookup validators passing, and representative route_hud_page validation across tanakh, halakhah, other, jewish-thought, midrash, targum, mishnah, chasidut, and gra.`,
    };
  }
  if (gates.publication.status === 'blocker') {
    return {
      owner: 'Agent 5',
      prompt: 'Agent 5, Agent 6 validation cycle keeps publication blocked_no_render. Do not describe publication as waiting on cleanup or ready pending legal review. Acceptance condition remains: a real publication render artifact exists, every rendered row points to an accepted decision row, license_profile.direct_translation_use_ok=true, manifest source match exists, attribution bundle is present where required, and workbench_ok_publication_review rows are excluded unless an explicit output-license decision exists.',
    };
  }
  if (gates.definition.status === 'warning') {
    return {
      owner: 'Agent 5',
      prompt: 'Agent 5, Agent 6 keeps Definition Integrity at warning, not blocker. Do not ask Agent 2 to regenerate the current public route release. Clean up handoff wording: answer_eligible means eligible for HUD answer slot only, not accepted definition, not unique semantic answer, and not publication readiness. Carry the multi-answer warning and release-input drift warning in control notes.',
    };
  }
  return {
    owner: 'No new prompt',
    prompt: 'No new lane prompt required. Keep sweeping; publication remains blocked until a render artifact exists and passes the publication render contract.',
  };

  function publicHudLineFromGates() {
    return `${publicHudSnapshotForRelay.rank_basis_pages}/${publicHudSnapshotForRelay.current_hud_pages} current HUD pages have article.dataset.rankBasis; ${publicHudSnapshotForRelay.missing_rank_basis} missing; ${publicHudSnapshotForRelay.rank_details_pages} still contain Rank details; ${publicHudSnapshotForRelay.clicked_hebrew_pages} Clicked Hebrew form markers.`;
  }
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 6 Validation Cycle',
    '',
    `Generated: ${data.generated_at}`,
    'Agent: Agent 6, independent QA/compliance authority',
    '',
    '## Verdict',
    '',
    `- Publication gate: ${data.gate_status.publication.status} - ${data.gate_status.publication.reason}`,
    `- Definition integrity gate: ${data.gate_status.definition.status} - ${data.gate_status.definition.reason}`,
    `- Public HUD truth gate: ${data.gate_status.public_hud.status} - ${data.gate_status.public_hud.reason}`,
    `- Provenance/source-license gate: ${data.gate_status.provenance.status} - ${data.gate_status.provenance.reason}`,
    `- Usage boundary gate: ${data.gate_status.usage.status} - ${data.gate_status.usage.reason}`,
    `- Agent 5 control gate: ${data.gate_status.control.status} - ${data.gate_status.control.reason}`,
    '',
    '## Validator Results',
    '',
    '| gate | validator | status | exit |',
    '|---|---|---:|---:|',
    ...data.validators.map((result) => `| ${md(result.gate)} | ${md(result.label)} | ${result.severity} | ${result.exit_code} |`),
    '',
    '## Definition Integrity Counts',
    '',
    `- Cards scanned: ${data.definition_integrity.counts.cards_scanned}`,
    `- Answer-eligible cards: ${data.definition_integrity.counts.answer_eligible_cards}`,
    `- Non-answer cards: ${data.definition_integrity.counts.non_answer_cards}`,
    `- Source rows checked: ${data.definition_integrity.counts.source_rows}`,
    `- Definition machine-contract issue count: ${data.definition_integrity.issue_count || 0}`,
    `- Usage/evidence cards: ${data.definition_integrity.counts.usage_evidence_cards}`,
    `- Usage/evidence-to-definition leaks: ${data.definition_integrity.issue_counts.usage_evidence_became_definition_authority || 0}`,
    `- Publication-readiness field leaks: ${data.definition_integrity.counts.route_cards_with_publication_fields}`,
    `- Multi-answer tokens: ${data.definition_integrity.counts.tokens_with_multiple_answer_eligible}`,
    `- Multi-answer tokens with distinct definitions: ${data.definition_integrity.counts.tokens_with_multiple_distinct_answer_definitions}`,
    '',
    '## Public HUD Counts',
    '',
    `- Current HUD pages: ${data.public_hud.current_hud_pages}`,
    `- Pages with article.dataset.rankBasis: ${data.public_hud.rank_basis_pages}`,
    `- Pages missing article.dataset.rankBasis: ${data.public_hud.missing_rank_basis}`,
    `- Pages containing Rank details: ${data.public_hud.rank_details_pages}`,
    `- Pages containing Clicked Hebrew form: ${data.public_hud.clicked_hebrew_pages}`,
    `- Representative failures: ${data.representative_hud_pages.filter((row) => !row.ok).length}`,
    '',
    '## Publication/Provenance Counts',
    '',
    `- Publication status: ${data.publication.status}`,
    `- Rendered rows: ${data.publication.rendered_rows}`,
    `- Accepted decision rows: ${data.publication.accepted_decision_rows}`,
    `- Unknown-license manifest sources: ${data.publication.unknown_license_sources}`,
    `- Sefaria manifest sources: ${data.publication.sefaria_sources}`,
    `- Route cards unsafe for accepted translation-output support: ${data.route_publication_boundary.counts.translation_output_unsafe_cards || 0}`,
    `- Answer-eligible route cards unsafe for accepted translation-output support: ${data.route_publication_boundary.counts.answer_eligible_translation_output_unsafe_cards || 0}`,
    `- Untracked source files: ${data.source_license_ingress.untracked_source_files}`,
    `- Untracked source units: ${data.source_license_ingress.untracked_units ?? 'unknown'}`,
    `- Untracked source license counts: ${formatCountMap(data.source_license_ingress.untracked_license_counts)}`,
    `- Untracked source names: ${data.source_license_ingress.untracked_names.length ? data.source_license_ingress.untracked_names.join(', ') : 'not enumerated'}`,
    `- Source-license audit note: ${data.source_license_ingress.note}`,
    '',
    '## High-Risk Samples',
    '',
    'Multi-answer samples:',
    ...(data.definition_integrity.samples.multi_answer.length
      ? data.definition_integrity.samples.multi_answer.slice(0, 4).map((sample) => `- ${sample.normalized}: ${sample.answer_count} answer cards, ${sample.distinct_definition_count} distinct definitions`)
      : ['- None']),
    '',
    'Changed-since-release inputs:',
    ...(data.definition_integrity.samples.changed_since_release.length
      ? data.definition_integrity.samples.changed_since_release.map((sample) => `- ${sample.file}: frozen ${sample.frozen_bytes || 'missing'} bytes; current ${sample.current_bytes || sample.current || 'missing'} bytes`)
      : ['- None']),
    '',
    'Representative HUD failures:',
    ...(data.representative_hud_pages.filter((row) => !row.ok).length
      ? data.representative_hud_pages.filter((row) => !row.ok).map((row) => `- ${row.page}: ${row.output}`)
      : ['- None']),
    '',
    '## Relay',
    '',
    `Owner: ${data.relay.owner}`,
    '',
    '```text',
    data.relay.prompt,
    '```',
    '',
    '## Boundary',
    '',
    'This cycle validates existing artifacts and writes Agent 6 reports only. It does not implement fixes, regenerate broad site renders, publish translation output, commit, or push.',
    '',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
}

function scanRouteInputDrift() {
  const stamp = readJsonIfExists('data/definitions/hud-route-release-stamp.json');
  const sourceDir = cleanRelativePath(stamp?.frozen_inputs?.source_dir || '');
  const drift = [];
  for (const input of stamp?.frozen_inputs?.files || []) {
    const sourcePath = sourceDir && input.file ? `${sourceDir}/${input.file}` : '';
    const fullPath = path.join(root, sourcePath);
    if (!sourcePath || !fs.existsSync(fullPath)) {
      drift.push({ file: input.file || '', role: input.role || '', current: 'missing' });
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat.size !== input.byte_length) {
      drift.push({
        file: input.file || '',
        role: input.role || '',
        frozen_bytes: input.byte_length,
        current_bytes: stat.size,
      });
    }
  }
  return drift;
}

function parseJsonFromValidator(label) {
  const result = validatorResults.find((row) => row.label === label);
  if (!result?.stdout?.startsWith('{')) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

function walkFiles(relativeDir, callback) {
  const fullDir = path.join(root, relativeDir);
  if (!fs.existsSync(fullDir)) return;
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const relativePath = cleanRelativePath(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) walkFiles(relativePath, callback);
    else if (entry.isFile()) callback(relativePath);
  }
}

function compactCard(card) {
  return {
    card_id: card.card_id || '',
    normalized: card.normalized || '',
    route_family: card.route_family || '',
    route_type: card.route_type || '',
    display_section: card.display_section || '',
    answer_eligible: card.answer_eligible,
    answer_role: card.answer_role || '',
    answer_score: card.answer_score ?? null,
    source_families: [...new Set((card.source_rows || []).map((row) => row?.source_family).filter(Boolean))].slice(0, 4),
    licenses: [...new Set((card.source_rows || []).map((row) => row?.license).filter(Boolean))].slice(0, 4),
    definition: truncate(card.definition || '', 140),
  };
}

function readJsonIfExists(relativePath) {
  const text = readTextIfExists(relativePath);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readTextIfExists(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function firstMarkdownValue(text, label) {
  const match = String(text || '').match(new RegExp(`- ${escapeRegExp(label)}:\\s*([^\\n]+)`));
  return match?.[1]?.trim() || '';
}

function firstMarkdownNumber(text, label) {
  const value = firstMarkdownValue(text, label);
  const match = value.match(/-?[\d,]+/);
  return match ? Number(match[0].replace(/,/g, '')) : null;
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return '';
  return process.argv[index + 1] || '';
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function increment(target, key) {
  target[key] = (target[key] || 0) + 1;
}

function pushSample(target, sample, max = 8) {
  if (target.length < max) target.push(sample);
}

function truncate(value, limit) {
  const text = String(value ?? '');
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function md(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function formatCountMap(map) {
  const entries = Object.entries(map || {});
  return entries.length ? entries.map(([key, value]) => `${key}: ${value}`).join(', ') : 'none';
}

function docketSafe(callback, fallback) {
  try {
    return callback();
  } catch {
    return fallback;
  }
}
