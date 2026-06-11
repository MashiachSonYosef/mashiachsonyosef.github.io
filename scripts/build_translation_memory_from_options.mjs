#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'data/translation-options/orot-sample.json',
  outputDir: 'data/translation-memory/occurrence-decisions',
  index: 'data/translation-memory/translation-memory-index.json',
  contract: 'data/translation-memory/translation-decision-contract.json',
  sourceLabel: 'translation-options scaffold',
};

const options = parseArgs(process.argv.slice(2));
const input = readJson(options.input);
const contract = readJson(options.contract);
const generatedAt = new Date().toISOString();
const workId = input.units?.[0]?.work?.work_id || path.basename(options.input, '.json').replace(/-sample$/, '');
const outputPath = path.join(options.outputDir, `${workId}-sample.jsonl`).replace(/\\/g, '/');
const rows = [];

for (const unit of input.units || []) {
  const sourceAnchors = sourceAnchorsForUnit(unit);
  for (const token of unit.tokens || []) {
    rows.push(decisionRow(unit, token, sourceAnchors.get(tokenOccurrenceKey(token))));
  }
}

writeJsonl(outputPath, rows);
writeIndex(rows, outputPath);

console.log(JSON.stringify({
  input: cleanRelativePath(options.input),
  output: outputPath,
  rows: rows.length,
  index: cleanRelativePath(options.index),
}, null, 2));

function decisionRow(unit, token, sourceAnchor) {
  const safeOptions = asArray(token.safe_options);
  const cautionOptions = asArray(token.caution_options);
  const candidateRenderings = [
    ...safeOptions.map((option) => renderingOption(option, 'safe')),
    ...cautionOptions.map((option) => renderingOption(option, 'caution')),
  ].filter((option) => option.text);
  const safeTexts = unique(safeOptions.map((option) => option.text));
  const status = decisionStatus(token, safeTexts, cautionOptions);
  const sourceRows = uniqueSourceRows(candidateRenderings.flatMap((option) => option.source_rows || []));
  if (!sourceRows.length) sourceRows.push(workspaceSourceRow());
  const licenseProfile = licenseProfileForSourceRows(sourceRows);
  const exactRendering = status === 'candidate' && safeTexts.length === 1 ? safeTexts[0] : '';
  return {
    schema_version: 1,
    artifact_type: 'translation_decision',
    decision_id: stableId('td', [unit.work?.work_id, unit.unit_id, token.position, token.token_index_id, token.normalized_form]),
    work_id: unit.work?.work_id || '',
    unit_id: unit.unit_id || '',
    source_ref: unit.source_ref || unit.ref || '',
    surface_occurrence_id: stableId('occ', [unit.work?.work_id, unit.unit_id, token.position, token.clicked_surface_form, token.normalized_form]),
    surface_token_id: token.token_index_id || '',
    surface_text: token.clicked_surface_form || '',
    normalized: token.normalized_form || '',
    source_anchor: sourceAnchor || fallbackSourceAnchor(unit, token),
    scope: 'token',
    decision_status: status,
    english_rendering: exactRendering,
    literal_gloss: safeTexts.join(' | '),
    idiomatic_gloss: '',
    route_card_ids: [],
    usage_evidence_ids: [],
    morphology_ids: asArray(token.breakdown).map((part) => part.source_entry_id || part.role || '').filter(Boolean),
    ambiguity_notes: ambiguityNotes(token, safeTexts, cautionOptions, status),
    rejection_reason: '',
    license_safe: licenseProfile.workbench_display_ok,
    license_profile: licenseProfile,
    not_a_translation_yet: true,
    candidate_renderings: candidateRenderings,
    translation_notes: [
      token.context_note || '',
      'Generated from existing translation-options scaffold; this is not a translation release.',
    ].filter(Boolean),
    upstream_artifacts: upstreamArtifacts(),
    source_option_status: token.option_status || '',
    source_lexical_status: token.lexical_status || '',
    source_rows: sourceRows,
    created_by: 'scripts/build_translation_memory_from_options.mjs',
    created_at: generatedAt,
    validated_by: [],
  };
}

function licenseProfileForSourceRows(sourceRows) {
  const families = unique(sourceRows.map((row) => row.source_family || 'unknown'));
  const licenses = unique(sourceRows.map((row) => row.license || 'unknown'));
  const sourceClasses = licenses.map(classifyLicense);
  const hasUnknown = sourceClasses.some((item) => item.publication_class === 'unknown_or_restricted');
  const hasShareAlike = sourceClasses.some((item) => item.share_alike_required || item.copyleft_review_required);
  const hasAttribution = sourceClasses.some((item) => item.attribution_required);
  const publicationClass = hasUnknown
    ? 'blocked_until_license_review'
    : hasShareAlike
      ? 'workbench_ok_publication_review'
      : hasAttribution
        ? 'publication_ok_with_attribution'
        : 'publication_ok';
  return {
    profile_version: 1,
    publication_class: publicationClass,
    workbench_display_ok: !hasUnknown,
    direct_translation_use_ok: publicationClass === 'publication_ok' || publicationClass === 'publication_ok_with_attribution',
    attribution_required: hasAttribution,
    share_alike_required: sourceClasses.some((item) => item.share_alike_required),
    copyleft_review_required: sourceClasses.some((item) => item.copyleft_review_required),
    source_families: families,
    licenses,
    notes: licenseProfileNotes(publicationClass),
  };
}

function classifyLicense(license) {
  const text = String(license || '').toLowerCase();
  if (/cc0|public domain|project-authored|project lexical rule|n\/a - project/.test(text)) {
    return {
      publication_class: 'publication_ok',
      attribution_required: false,
      share_alike_required: false,
      copyleft_review_required: false,
    };
  }
  if (/cc by-sa|gfdl/.test(text)) {
    return {
      publication_class: 'workbench_ok_publication_review',
      attribution_required: true,
      share_alike_required: /cc by-sa/.test(text),
      copyleft_review_required: /gfdl/.test(text),
    };
  }
  if (/cc by\b/.test(text)) {
    return {
      publication_class: 'publication_ok_with_attribution',
      attribution_required: true,
      share_alike_required: false,
      copyleft_review_required: false,
    };
  }
  return {
    publication_class: 'unknown_or_restricted',
    attribution_required: true,
    share_alike_required: false,
    copyleft_review_required: true,
  };
}

function licenseProfileNotes(publicationClass) {
  if (publicationClass === 'publication_ok') return 'Project/CC0/public-domain style evidence; keep provenance but no external attribution burden is inferred by this classifier.';
  if (publicationClass === 'publication_ok_with_attribution') return 'Evidence may support future translation decisions if attribution is preserved.';
  if (publicationClass === 'workbench_ok_publication_review') return 'Evidence is acceptable in workbench mode, but direct publication use needs share-alike/GFDL review and an explicit output-license decision.';
  return 'License is unknown or restricted; use only after source/license review.';
}

function sourceAnchorsForUnit(unit) {
  const anchors = new Map();
  const unitText = String(unit.hebrew_unit_text || '');
  const unitTextSha1 = sha1(unitText);
  let cursor = 0;
  for (const token of unit.tokens || []) {
    const surface = String(token.clicked_surface_form || '');
    const match = findSurfaceMatch(unitText, surface, cursor);
    const start = match.start;
    const end = match.end;
    const exact = match.exact || surface;
    const anchor = {
      anchor_model: 'source-ref + token-position + text-quote',
      selector_standard: 'W3C Web Annotation inspired',
      source_ref: unit.source_ref || unit.ref || '',
      unit_id: unit.unit_id || '',
      anchor_id: unit.anchor_id || '',
      unit_text_sha1: unitTextSha1,
      token_position: Number.isFinite(token.position) ? token.position : null,
      token_index_id: token.token_index_id || '',
      text_quote_selector: {
        type: 'TextQuoteSelector',
        exact,
        prefix: start >= 0 ? unitText.slice(Math.max(0, start - 24), start) : '',
        suffix: end >= 0 ? unitText.slice(end, Math.min(unitText.length, end + 24)) : '',
      },
      text_position_selector: start >= 0 && end >= 0
        ? {
            type: 'TextPositionSelector',
            start,
            end,
          }
        : null,
    };
    anchors.set(tokenOccurrenceKey(token), anchor);
    if (end >= 0) cursor = end;
  }
  return anchors;
}

function findSurfaceMatch(text, surface, cursor) {
  const variants = unique([
    surface,
    surface.replace(/\u05F3/g, "'").replace(/\u05F4/g, '"'),
  ]).filter(Boolean);
  for (const variant of variants) {
    const start = text.indexOf(variant, cursor);
    if (start >= 0) return { start, end: start + variant.length, exact: text.slice(start, start + variant.length) };
  }
  for (const variant of variants) {
    const start = text.indexOf(variant);
    if (start >= 0) return { start, end: start + variant.length, exact: text.slice(start, start + variant.length) };
  }
  return { start: -1, end: -1, exact: '' };
}

function fallbackSourceAnchor(unit, token) {
  const surface = String(token.clicked_surface_form || '');
  return {
    anchor_model: 'source-ref + token-position + text-quote',
    selector_standard: 'W3C Web Annotation inspired',
    source_ref: unit.source_ref || unit.ref || '',
    unit_id: unit.unit_id || '',
    anchor_id: unit.anchor_id || '',
    unit_text_sha1: sha1(unit.hebrew_unit_text || ''),
    token_position: Number.isFinite(token.position) ? token.position : null,
    token_index_id: token.token_index_id || '',
    text_quote_selector: {
      type: 'TextQuoteSelector',
      exact: surface,
      prefix: '',
      suffix: '',
    },
    text_position_selector: null,
  };
}

function decisionStatus(token, safeTexts, cautionOptions) {
  if (token.unresolved === true || token.option_status === 'unresolved') return 'needs_review';
  if (safeTexts.length === 1) return 'candidate';
  if (safeTexts.length > 1) return 'ambiguous';
  if (cautionOptions.length) return 'needs_review';
  return 'needs_review';
}

function ambiguityNotes(token, safeTexts, cautionOptions, status) {
  if (status === 'candidate') return token.context_note || 'Single safe rendering candidate from translation-options scaffold.';
  if (safeTexts.length > 1) return `Multiple safe rendering candidates require review: ${safeTexts.join(' | ')}`;
  if (cautionOptions.length) return 'Only caution-level lexical options are present; human review required before translation use.';
  return token.context_note || 'No safe rendering candidate is available yet.';
}

function renderingOption(option, safety) {
  return {
    text: option?.text || '',
    role: option?.role || '',
    safety,
    origin_layers: asArray(option?.origin_layers),
    source_entry_id: option?.source_entry_id || '',
    source_rows: asArray(option?.source_rows).map(compactSourceRow).filter(Boolean),
  };
}

function compactSourceRow(row) {
  if (!row) return null;
  return {
    source_name: row.source_name || '',
    source_family: row.source_family || '',
    source_id: row.source_id || '',
    source_url: row.source_url || '',
    license: row.license || '',
    license_url: row.license_url || '',
    fields_used: asArray(row.fields_used),
    notes: row.notes || '',
  };
}

function workspaceSourceRow() {
  return {
    source_name: 'Project-authored translation memory scaffold',
    source_family: 'workspace',
    source_id: 'translation-memory-from-options',
    source_url: `local:${cleanRelativePath(options.input)}`,
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fields_used: ['translation option status', 'token identity', 'decision scaffolding'],
    notes: 'Fallback source row for unresolved decision scaffolding only. No English translation claim is made.',
  };
}

function upstreamArtifacts() {
  const artifacts = [];
  const routeStamp = readJsonIfExists('data/definitions/hud-route-release-stamp.json');
  if (routeStamp) {
    artifacts.push({
      artifact_type: 'hud_route_release_stamp',
      path: 'data/definitions/hud-route-release-stamp.json',
      release_id: routeStamp.release_id || '',
      generated_at: routeStamp.generated_at || '',
      status: routeStamp.status || '',
    });
  }
  const handoffIndex = readJsonIfExists('data/workbench-evidence/public-handoff-index.json');
  if (handoffIndex) {
    artifacts.push({
      artifact_type: 'workbench_public_handoff_index',
      path: 'data/workbench-evidence/public-handoff-index.json',
      generated_at: handoffIndex.generated_at || '',
      selected_targets: handoffIndex.counts?.selected_targets || 0,
      reader_facing_eligible_rows: handoffIndex.counts?.reader_facing_eligible_rows || 0,
    });
  }
  artifacts.push({
    artifact_type: 'translation_options_scaffold',
    path: cleanRelativePath(options.input),
    generated_at: input.generated_at || '',
    export_type: input.export_type || '',
  });
  return artifacts;
}

function writeIndex(decisions, decisionPath) {
  const counts = {
    decision_files: 1,
    decision_rows: decisions.length,
    accepted: countStatus(decisions, 'accepted'),
    candidate: countStatus(decisions, 'candidate'),
    ambiguous: countStatus(decisions, 'ambiguous'),
    rejected: countStatus(decisions, 'rejected'),
    blocked: countStatus(decisions, 'blocked'),
    needs_review: countStatus(decisions, 'needs_review'),
  };
  const index = {
    schema_version: 1,
    artifact_type: 'translation_memory_index',
    generated_at: generatedAt,
    generator: 'scripts/build_translation_memory_from_options.mjs',
    contract: cleanRelativePath(options.contract),
    policy: 'Early scaffold for future translation mode. Rows are not public translations; they preserve decision scaffolding and evidence links captured during workbench mode.',
    upstream_artifacts: upstreamArtifacts(),
    counts,
    decision_files: [
      {
        path: cleanRelativePath(decisionPath),
        scope: 'token',
        work_id: workId,
        status: 'scaffold_from_translation_options',
        row_count: decisions.length,
        notes: 'Generated from existing translation-options scaffold. Not a translation release.',
      },
    ],
    source_rows: [
      {
        source_name: 'Project-authored translation memory index',
        source_family: 'workspace',
        source_id: 'translation-memory-index-v1',
        source_url: `local:${cleanRelativePath(options.index)}`,
        license: 'project-authored / CC0',
        license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
        fields_used: ['index schema', 'decision file registry', 'counts'],
        notes: 'Index only. It does not publish a translation.',
      },
    ],
  };
  writeJson(options.index, index);
}

function countStatus(decisions, status) {
  return decisions.filter((row) => row.decision_status === status).length;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--input') parsed.input = args[++index];
    else if (arg === '--output-dir') parsed.outputDir = args[++index];
    else if (arg === '--index') parsed.index = args[++index];
    else if (arg === '--contract') parsed.contract = args[++index];
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/build_translation_memory_from_options.mjs',
      '',
      'Options:',
      '  --input data/translation-options/orot-sample.json',
      '  --output-dir data/translation-memory/occurrence-decisions',
      '  --index data/translation-memory/translation-memory-index.json',
      '  --contract data/translation-memory/translation-decision-contract.json',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function stableId(prefix, payload) {
  return `${prefix}-${sha1(JSON.stringify(payload)).slice(0, 16)}`;
}

function tokenKey(token) {
  return token.token_index_id || `position:${token.position || ''}`;
}

function tokenOccurrenceKey(token) {
  return `${token.position || ''}|${tokenKey(token)}`;
}

function sha1(value) {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex');
}

function unique(values) {
  return [...new Set(asArray(values).filter(Boolean))];
}

function uniqueSourceRows(rows) {
  const seen = new Set();
  const output = [];
  for (const row of rows.map(compactSourceRow).filter(Boolean)) {
    const key = [row.source_family, row.source_id, row.license, row.source_url].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readJson(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeJsonl(relativePath, values) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${values.map((row) => JSON.stringify(row)).join('\n')}\n`, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
