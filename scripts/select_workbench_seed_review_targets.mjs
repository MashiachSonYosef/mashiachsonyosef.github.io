#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  seedGapReport: '.local-cache/workbench-evidence/seed-gap-report.json',
  output: '.local-cache/workbench-evidence/seed-review-queue.json',
  report: 'reports/workbench-seed-review-queue.md',
  maxTargets: 24,
  maxCuesPerTarget: 10,
  maxSampleRefs: 8,
  maxRouteLinksPerTarget: 12,
  minRouteLinks: 1,
  minNearFocusCueCount: 25,
  minCueLength: 3,
  excludeAbbreviationCues: true,
};

const options = parseArgs(process.argv.slice(2));
const seedGapReport = readJson(options.seedGapReport);
if (seedGapReport.artifact_type !== 'workbench_seed_gap_report') {
  throw new Error(`${options.seedGapReport} is not a workbench seed gap report`);
}

const targets = (seedGapReport.gaps || [])
  .map(makeTarget)
  .filter(Boolean)
  .sort((a, b) => b.priority_score - a.priority_score || a.focus.token_normalized.localeCompare(b.focus.token_normalized))
  .slice(0, options.maxTargets)
  .map((target, index) => ({ ...target, review_rank: index + 1 }));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_seed_review_queue',
  generated_at: new Date().toISOString(),
  generator: 'scripts/select_workbench_seed_review_targets.mjs',
  policy: 'Ranks ambiguous workbench gaps for later project-authored frame-seed review. It does not author seeds, create definitions, translate source text, quote source phrases, rank HUD answers, or publish lookup artifacts.',
  inputs: {
    seed_gap_report: options.seedGapReport,
    max_targets: options.maxTargets,
    max_cues_per_target: options.maxCuesPerTarget,
    max_sample_refs: options.maxSampleRefs,
    max_route_links_per_target: options.maxRouteLinksPerTarget,
    min_route_links: options.minRouteLinks,
    min_near_focus_cue_count: options.minNearFocusCueCount,
    min_cue_length: options.minCueLength,
    exclude_abbreviation_cues: options.excludeAbbreviationCues,
  },
  counts: {
    input_gaps: (seedGapReport.gaps || []).length,
    emitted_targets: targets.length,
    route_linked_targets: targets.filter((target) => target.route_links_available > 0).length,
    candidate_rows_represented: targets.reduce((sum, target) => sum + target.rows_scanned, 0),
  },
  targets,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Seed review targets ${artifact.counts.emitted_targets}; candidate rows represented ${artifact.counts.candidate_rows_represented}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--seed-gap-report=')) parsed.seedGapReport = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-targets=')) parsed.maxTargets = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-cues-per-target=')) parsed.maxCuesPerTarget = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-sample-refs=')) parsed.maxSampleRefs = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-route-links-per-target=')) parsed.maxRouteLinksPerTarget = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--min-route-links=')) parsed.minRouteLinks = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--min-near-focus-cue-count=')) parsed.minNearFocusCueCount = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--min-cue-length=')) parsed.minCueLength = Number(valueAfterEquals(arg));
    else if (arg === '--include-abbreviation-cues') parsed.excludeAbbreviationCues = false;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxTargets', 'maxCuesPerTarget', 'maxSampleRefs', 'maxRouteLinksPerTarget', 'minRouteLinks', 'minNearFocusCueCount', 'minCueLength']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  if (parsed.maxTargets < 1) throw new Error('--max-targets must be at least 1');
  if (parsed.maxCuesPerTarget < 1) throw new Error('--max-cues-per-target must be at least 1');
  if (parsed.maxRouteLinksPerTarget < 1) throw new Error('--max-route-links-per-target must be at least 1');
  return parsed;
}

function makeTarget(gap) {
  const focusNormalized = String(gap.focus?.token_normalized || '');
  const selectedCues = (gap.top_context_cues || [])
    .filter((cue) => isUsableCue(cue, focusNormalized))
    .slice(0, options.maxCuesPerTarget)
    .map((cue) => ({
      cue: cue.cue,
      count: Number(cue.count || 0),
      near_focus_count: Number(cue.near_focus_count || 0),
      top_surfaces: (cue.top_surfaces || []).slice(0, 5),
      top_distances: (cue.top_distances || []).slice(0, 6),
    }));
  if (Number(gap.route_links_available || 0) < options.minRouteLinks) return null;
  if (!selectedCues.length) return null;

  const rowsScanned = Number(gap.rows_scanned || 0);
  const routeLinks = Number(gap.route_links_available || 0);
  const sampledRouteLinks = loadCandidateRouteLinks(gap.path).slice(0, options.maxRouteLinksPerTarget);
  const nearFocusTotal = selectedCues.reduce((sum, cue) => sum + cue.near_focus_count, 0);
  const cueDiversity = selectedCues.length;
  const priorityScore = Math.round(
    (Math.log10(rowsScanned + 1) * 24)
    + (Math.log10(nearFocusTotal + 1) * 45)
    + Math.min(90, routeLinks * 3)
    + cueDiversity * 4
  );

  return {
    review_id: `seed-review-${gap.slug}`,
    candidate_artifact: gap.path,
    focus: {
      token_normalized: gap.focus?.token_normalized || '',
      token_key: gap.focus?.token_key || '',
    },
    priority_score: priorityScore,
    rows_scanned: rowsScanned,
    route_links_available: routeLinks,
    route_families: (gap.route_families || []).slice(0, 12),
    route_types: (gap.route_types || []).slice(0, 12),
    sample_route_links: sampledRouteLinks,
    source_licenses: (gap.source_licenses || []).slice(0, 12),
    source_families: (gap.source_families || []).slice(0, 12),
    selected_context_cues: selectedCues,
    sample_refs: (gap.sample_refs || []).slice(0, options.maxSampleRefs),
    next_action: 'manual_project_frame_seed_review',
    review_checks: [
      'Confirm selected cues describe one coherent usage frame before authoring any seed.',
      'Confirm route selectors come from already licensed route data, not from the cue list itself.',
      'Do not quote source phrases or add definitions in this queue artifact.',
    ],
  };
}

function isUsableCue(cue, focusNormalized) {
  const value = String(cue?.cue || '');
  return value.length >= options.minCueLength
    && /^[\u0590-\u05FF-]+$/u.test(value)
    && value !== focusNormalized
    && (!options.excludeAbbreviationCues || !/[\u05F3\u05F4]/u.test(value))
    && Number(cue.near_focus_count || 0) >= options.minNearFocusCueCount;
}

function loadCandidateRouteLinks(relativePath) {
  const candidate = readJson(relativePath);
  return (Array.isArray(candidate.route_links_available) ? candidate.route_links_available : [])
    .map((route) => ({
      route_id: route.route_id || '',
      route_source: route.route_source || '',
      route_family: route.route_family || '',
      route_type: route.route_type || '',
      display_section: route.display_section || '',
      normalized: route.normalized || '',
      surface: route.surface || '',
      answer_score: Number.isFinite(route.answer_score) ? route.answer_score : null,
      raw_score: Number.isFinite(route.raw_score) ? route.raw_score : null,
      source_row_count: Number(route.source_row_count || 0),
    }));
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, data) {
  const lines = [
    '# Workbench Seed Review Queue',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Scope',
    '',
    `- Input gaps: ${data.counts.input_gaps}`,
    `- Emitted targets: ${data.counts.emitted_targets}`,
    `- Candidate rows represented: ${data.counts.candidate_rows_represented}`,
    `- Min near-focus cue count: ${data.inputs.min_near_focus_cue_count}`,
    `- Min cue length: ${data.inputs.min_cue_length}`,
    `- Exclude abbreviation cues: ${data.inputs.exclude_abbreviation_cues ? 'yes' : 'no'}`,
    '',
    '## Targets',
    '',
  ];

  for (const target of data.targets) {
    lines.push(`### ${target.review_rank}. ${target.focus.token_normalized}`);
    lines.push('');
    lines.push(`- Review ID: \`${target.review_id}\``);
    lines.push(`- Candidate artifact: \`${target.candidate_artifact}\``);
    lines.push(`- Priority score: ${target.priority_score}`);
    lines.push(`- Rows scanned: ${target.rows_scanned}`);
    lines.push(`- Route links: ${target.route_links_available}`);
    lines.push(`- Sample route IDs: ${target.sample_route_links.map((route) => `\`${route.route_id}\``).join(', ') || 'none'}`);
    lines.push('');
    lines.push('| cue | count | near focus | top surfaces |');
    lines.push('|---|---:|---:|---|');
    for (const cue of target.selected_context_cues) {
      lines.push(`| ${mdCell(cue.cue)} | ${cue.count} | ${cue.near_focus_count} | ${mdCell(cue.top_surfaces.join(', '))} |`);
    }
    lines.push('');
  }

  lines.push('## Boundary');
  lines.push('');
  lines.push('This queue selects review targets only. It does not define tokens, does not translate source text, does not quote source phrases, and does not choose HUD winners.');
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}
