#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  definitions: 'data/definitions/definition-route-sample.json',
  phrases: 'data/definitions/phrase-evidence-sample.json',
  contract: 'data/definitions/hud-route-contract.json',
  out: 'data/definitions/hud-route-fixtures.json',
  maxPhraseCards: 12,
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--definitions') args.definitions = argv[++i];
    else if (arg === '--phrases') args.phrases = argv[++i];
    else if (arg === '--contract') args.contract = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--max-phrase-cards') args.maxPhraseCards = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isFinite(args.maxPhraseCards) || args.maxPhraseCards < 0) {
    throw new Error(`Invalid --max-phrase-cards: ${args.maxPhraseCards}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/build_hud_route_fixtures.mjs',
    '',
    'Options:',
    '  --definitions data/definitions/definition-route-sample.json',
    '  --phrases data/definitions/phrase-evidence-sample.json',
    '  --contract data/definitions/hud-route-contract.json',
    '  --out data/definitions/hud-route-fixtures.json',
    '  --max-phrase-cards 12',
  ].join('\n');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  const output = [];
  for (const value of values || []) {
    const key = keyFn(value);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
}

function sourceKey(row) {
  return [
    row?.source_family || '',
    row?.source_id || '',
    row?.license || '',
  ].join('|');
}

function claimKey(claim) {
  return [
    claim?.claim_id || '',
    claim?.route_family || '',
    claim?.route_type || '',
    claim?.surface || '',
    claim?.gloss || '',
  ].join('|');
}

function compactSourceRow(row) {
  return {
    source_name: row?.source_name || '',
    source_family: row?.source_family || '',
    source_id: row?.source_id || '',
    source_url: row?.source_url || '',
    license: row?.license || '',
    license_url: row?.license_url || '',
    fields_used: Array.isArray(row?.fields_used) ? row.fields_used : [],
    notes: row?.notes || '',
  };
}

function definitionText(claim) {
  if (claim?.gloss) return String(claim.gloss);
  const meanings = Array.isArray(claim?.meanings) ? claim.meanings.filter(Boolean) : [];
  return meanings.join('; ');
}

function labelForClaim(claim) {
  const routeType = claim?.route_type || '';
  const routeFamily = claim?.route_family || '';
  const language = claim?.language || '';
  if (routeType === 'morphology_parse') return `Morphology explained ${language || 'strict'} match`;
  if (routeType === 'shape') return 'Token shape check';
  if (routeType === 'form') return `${language || 'Source'} form match`;
  if (routeType === 'lemma') return `${language || 'Source'} lemma match`;
  if (routeType === 'phrase_evidence') return 'Licensed phrase use';
  if (routeType === 'subphrase_evidence') return 'Subphrase evidence';
  if (routeType === 'biblical_paraphrase_evidence' || routeFamily === 'biblical_paraphrase_evidence') return 'Biblical definition/paraphrase match';
  if (routeType === 'citable_paraphrase_evidence' || routeFamily === 'citable_paraphrase_evidence') return 'Citable definition/paraphrase match';
  return `${routeFamily || 'Source'} ${routeType || 'route'}`.replace(/_/g, ' ').trim();
}

function noteForClaim(claim) {
  if (claim?.route_type === 'shape') {
    return 'Shape check only; this does not define the whole token.';
  }
  if (claim?.route_type === 'phrase_evidence') {
    return 'Licensed Hebrew phrase evidence only; this row does not force a meaning.';
  }
  if (claim?.route_type === 'biblical_paraphrase_evidence') {
    return 'Source-backed biblical paraphrase route; displayed percent is the route match percent.';
  }
  if (claim?.route_type === 'citable_paraphrase_evidence') {
    return 'Source-backed citable paraphrase route; displayed percent is the route match percent.';
  }
  if (claim?.meaning_quality === 'form_reference') {
    return 'Form-reference route; useful evidence, not a stronger definition than a sourced direct meaning.';
  }
  if (claim?.form_of?.lemma) {
    return `Points back to lemma ${claim.form_of.lemma}.`;
  }
  if (claim?.route_type === 'morphology_parse') {
    return 'Parsed word parts are shown so the user can see what was matched.';
  }
  return '';
}

function routeScoreHandicap(sectionId) {
  if (['lemma', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(sectionId)) {
    return 20;
  }
  return 0;
}

function scoreFieldsForCard(card) {
  const rawScore = Number.isFinite(card.answer_score)
    ? card.answer_score
    : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : null);
  const sectionId = groupForClaim(card);
  const scoreHandicap = routeScoreHandicap(sectionId);
  return {
    raw_score: rawScore,
    score_handicap: scoreHandicap,
    adjusted_score: rawScore === null ? null : rawScore - scoreHandicap,
  };
}

function claimToCard(claim, role = 'evidence') {
  const card = {
    card_id: claim?.claim_id || '',
    display_role: role,
    route_family: claim?.route_family || '',
    route_type: claim?.route_type || '',
    language: claim?.language || '',
    match_type: claim?.match_type || '',
    confidence_percent: Number.isFinite(claim?.confidence) ? claim.confidence : null,
    answer_score: Number.isFinite(claim?.answer_score) ? claim.answer_score : null,
    display_label: labelForClaim(claim),
    hebrew: claim?.surface || '',
    normalized: claim?.normalized || '',
    definition: definitionText(claim),
    plain_note: noteForClaim(claim),
    part_of_speech: claim?.part_of_speech || '',
    meaning_quality: claim?.meaning_quality || '',
    form_of: claim?.form_of || null,
    morphology: claim?.morphology || null,
    source_rows: (claim?.source_rows || []).map(compactSourceRow),
  };
  return {
    ...card,
    ...scoreFieldsForCard(card),
  };
}

function phraseToCard(row) {
  const card = {
    card_id: row?.evidence_id || '',
    display_role: 'evidence',
    route_family: row?.route_family || 'source_phrase_evidence',
    route_type: row?.route_type || 'phrase_evidence',
    language: row?.language || 'Hebrew/Aramaic',
    match_type: row?.match_type || 'licensed phrase occurrence',
    confidence_percent: Number.isFinite(row?.evidence_strength) ? row.evidence_strength : null,
    answer_score: null,
    display_label: 'Licensed phrase use',
    hebrew: row?.focus_surface || '',
    normalized: row?.focus_normalized || '',
    definition: 'Usage context only; no meaning is forced by this phrase row.',
    plain_note: 'The focus token is marked so the surrounding words do not become the definition.',
    phrase_hebrew: row?.phrase_hebrew || '',
    phrase_tokens: Array.isArray(row?.phrase_tokens) ? row.phrase_tokens : [],
    source_ref: row?.source_ref || row?.sefaria_ref || '',
    work_id: row?.work_id || '',
    work_title: row?.work_title || '',
    meaning_claim: row?.meaning_claim ?? null,
    source_rows: (row?.source_rows || []).map(compactSourceRow),
  };
  return {
    ...card,
    ...scoreFieldsForCard(card),
  };
}

function groupForClaim(claim) {
  const routeType = claim?.route_type || '';
  const routeFamily = claim?.route_family || '';
  const language = String(claim?.language || '').toLowerCase();
  if (routeType === 'shape') return 'audit';
  if (routeType === 'biblical_paraphrase_evidence' || routeFamily === 'biblical_paraphrase_evidence') return 'biblical_paraphrase_evidence';
  if (routeType === 'citable_paraphrase_evidence' || routeFamily === 'citable_paraphrase_evidence') return 'citable_paraphrase_evidence';
  if (routeType === 'subphrase_evidence') return 'subphrase_evidence';
  if (routeType === 'morphology_parse') return 'morphology';
  if (routeType === 'form' && language.includes('aramaic')) return 'strict_aramaic';
  if (routeType === 'form') return 'strict_hebrew';
  if (routeType === 'lemma') return 'lemma';
  return 'audit';
}

function makeRouteSections(contract, sample, phraseCards) {
  const sectionSpecs = (contract.route_sections || [])
    .filter((section) => !['answer', 'source_license', 'audit'].includes(section.section_id));
  const routeClaims = uniqueBy([
    ...(sample.supporting_routes || []),
    ...(sample.routes || []),
    ...(sample.shape_routes || []),
    ...(sample.audit_traces || []),
  ], claimKey);

  const cardsBySection = new Map(sectionSpecs.map((section) => [section.section_id, []]));
  for (const claim of routeClaims) {
    const sectionId = groupForClaim(claim);
    if (!cardsBySection.has(sectionId)) cardsBySection.set(sectionId, []);
    cardsBySection.get(sectionId).push(claimToCard(claim));
  }
  cardsBySection.set('phrase_evidence', phraseCards);

  return sectionSpecs.map((section) => {
    const cards = uniqueBy(cardsBySection.get(section.section_id) || [], (card) => [
      card.card_id,
      card.route_family,
      card.route_type,
      card.hebrew,
      card.definition,
    ].join('|'));
    return {
      section_id: section.section_id,
      title: section.title,
      display_role: section.display_role,
      card_count: cards.length,
      cards,
      empty_display: cards.length ? 'cards' : section.empty_display || 'omit',
    };
  });
}

function makeAuditChecks(sample, routeSections) {
  const byId = new Map(routeSections.map((section) => [section.section_id, section.card_count]));
  return [
    { check: 'Hebrew strict', result: byId.get('strict_hebrew') ? 'matched' : 'none', card_count: byId.get('strict_hebrew') || 0 },
    { check: 'Aramaic strict', result: byId.get('strict_aramaic') ? 'matched' : 'none', card_count: byId.get('strict_aramaic') || 0 },
    { check: 'Lemma', result: byId.get('lemma') ? 'matched' : 'none', card_count: byId.get('lemma') || 0 },
    { check: 'Answer route', result: sample.winner ? 'matched' : 'none', card_count: sample.winner ? 1 : 0 },
  ];
}

function makeSourceLicenseGroups(answerCard, routeSections) {
  const cards = [
    answerCard,
    ...routeSections.flatMap((section) => section.cards || []),
  ].filter(Boolean);
  const rows = uniqueBy(cards.flatMap((card) => card.source_rows || []), sourceKey);
  return rows.map((row) => ({
    source_name: row.source_name,
    source_family: row.source_family,
    source_id: row.source_id,
    source_url: row.source_url,
    license: row.license,
    license_url: row.license_url,
    fields_used: row.fields_used,
    notes: row.notes,
  }));
}

function buildFixture({ definitions, phrases, contract, maxPhraseCards }) {
  const definitionData = readJson(definitions);
  const phraseData = fs.existsSync(path.join(root, phrases)) ? readJson(phrases) : { samples: [] };
  const contractData = readJson(contract);
  const phrasesByNormalized = new Map();
  for (const row of phraseData.samples || []) {
    const key = row.focus_normalized || row.containing_token_normalized || '';
    if (!key) continue;
    if (!phrasesByNormalized.has(key)) phrasesByNormalized.set(key, []);
    phrasesByNormalized.get(key).push(row);
  }

  const samples = (definitionData.samples || []).map((sample) => {
    const phraseRows = phrasesByNormalized.get(sample.normalized) || [];
    const phraseCards = phraseRows.slice(0, maxPhraseCards || phraseRows.length).map(phraseToCard);
    const answerCard = sample.winner ? claimToCard(sample.winner, 'answer') : null;
    const routeSections = makeRouteSections(contractData, sample, phraseCards);
    return {
      token: sample.token,
      normalized: sample.normalized,
      answer_card: answerCard,
      route_sections: routeSections,
      audit_checks: makeAuditChecks(sample, routeSections),
      audit_traces: (sample.audit_traces || []).map((claim) => claimToCard(claim, 'audit')),
      source_license_groups: makeSourceLicenseGroups(answerCard, routeSections),
      fixture_limits: {
        phrase_cards_included: phraseCards.length,
        phrase_cards_available: phraseRows.length,
        production_contract_supports_unbounded_cards: true,
      },
    };
  });

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source_files: {
      definitions,
      phrases,
      contract,
    },
    contract_id: contractData.contract_id,
    rendering_rules: contractData.rendering_rules,
    route_section_order: (contractData.route_sections || []).map((section) => section.section_id),
    samples,
  };
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(usage());
  process.exit(0);
}

const fixture = buildFixture(args);
writeJson(args.out, fixture);
console.log(`Wrote ${args.out}`);
console.log(`HUD route fixture samples: ${fixture.samples.length}`);
