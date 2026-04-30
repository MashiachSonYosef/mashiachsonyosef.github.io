import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const manifestPath = path.join(lexicalDir, 'lexicon.json');
const occurrencePath = path.join(lexicalDir, 'occurrences', 'orot.json');
const layerPath = path.join(lexicalDir, 'source-layers', 'project-orot-technical-terms.json');
const reportPath = path.join('reports', 'orot-technical-terms-report.md');

const LAYER_ID = 'project-orot-technical-terms';
const SOURCE_NAME = 'Project Orot technical term table';
const SOURCE_FAMILY = 'workspace';
const LICENSE = 'project-authored / CC0';
const SOURCE_URL = 'local:project-orot-technical-term-table';

const cp = (...hex) => hex.map((value) => String.fromCharCode(Number.parseInt(value, 16))).join('');

const H = {
  heh: cp('05D4'),
  maqaf: cp('05BE'),
  elohit: cp('05D0', '05DC', '05D4', '05D9', '05EA'),
  haElohit: cp('05D4', '05D0', '05DC', '05D4', '05D9', '05EA'),
  elohut: cp('05D0', '05DC', '05D4', '05D5', '05EA'),
  haElohut: cp('05D4', '05D0', '05DC', '05D4', '05D5', '05EA'),
  elohiyim: cp('05D0', '05DC', '05D4', '05D9', '05D9', '05DD'),
  haElohiyim: cp('05D4', '05D0', '05DC', '05D4', '05D9', '05D9', '05DD'),
  elohiyot: cp('05D0', '05DC', '05D4', '05D9', '05D5', '05EA'),
  haElohiyot: cp('05D4', '05D0', '05DC', '05D4', '05D9', '05D5', '05EA'),
  idea: cp('05D0', '05D9', '05D3', '05D9', '05D0', '05D4'),
  haIdea: cp('05D4', '05D0', '05D9', '05D3', '05D9', '05D0', '05D4'),
  ideas: cp('05D0', '05D9', '05D3', '05D9', '05D0', '05D5', '05EA'),
  haIdeas: cp('05D4', '05D0', '05D9', '05D3', '05D9', '05D0', '05D5', '05EA'),
  ideal: cp('05D0', '05D9', '05D3', '05D9', '05D0', '05DC'),
  idealit: cp('05D0', '05D9', '05D3', '05D9', '05D0', '05DC', '05D9', '05EA'),
  haIdealit: cp('05D4', '05D0', '05D9', '05D3', '05D9', '05D0', '05DC', '05D9', '05EA'),
  haIdeali: cp('05D4', '05D0', '05D9', '05D3', '05D9', '05D0', '05DC', '05D9'),
  idealim: cp('05D0', '05D9', '05D3', '05D9', '05D0', '05DC', '05D9', '05DD'),
  haIdealim: cp('05D4', '05D0', '05D9', '05D3', '05D9', '05D0', '05DC', '05D9', '05DD'),
  mussarit: cp('05DE', '05D5', '05E1', '05E8', '05D9', '05EA'),
  haMussarit: cp('05D4', '05DE', '05D5', '05E1', '05E8', '05D9', '05EA'),
  mussariyot: cp('05DE', '05D5', '05E1', '05E8', '05D9', '05D5', '05EA'),
  haMussariyot: cp('05D4', '05DE', '05D5', '05E1', '05E8', '05D9', '05D5', '05EA'),
  homer: cp('05D7', '05DE', '05E8'),
  homrit: cp('05D7', '05DE', '05E8', '05D9', '05EA'),
  haHomrit: cp('05D4', '05D7', '05DE', '05E8', '05D9', '05EA'),
  homriim: cp('05D7', '05DE', '05E8', '05D9', '05D9', '05DD'),
  haHomriim: cp('05D4', '05D7', '05DE', '05E8', '05D9', '05D9', '05DD'),
  nishmatit: cp('05E0', '05E9', '05DE', '05EA', '05D9', '05EA'),
  haNishmatit: cp('05D4', '05E0', '05E9', '05DE', '05EA', '05D9', '05EA'),
  mekorit: cp('05DE', '05E7', '05D5', '05E8', '05D9', '05EA'),
  haMekorit: cp('05D4', '05DE', '05E7', '05D5', '05E8', '05D9', '05EA'),
};

const TERM_GROUPS = [
  {
    key: 'elohit',
    cluster: 'A: אלהי / אלהות field',
    lemma: H.elohit,
    baseRenderings: ['divine', 'godly'],
    surfaces: [
      { surface: H.haElohit, renderings: ['the divine', 'the godly'], base: H.elohit },
      { surface: H.elohit, renderings: ['divine', 'godly'] },
    ],
  },
  {
    key: 'elohut',
    cluster: 'A: אלהי / אלהות field',
    lemma: H.elohut,
    baseRenderings: ['divinity', 'godhood'],
    surfaces: [
      { surface: H.haElohut, renderings: ['the divinity', 'the godhood'], base: H.elohut },
    ],
  },
  {
    key: 'elohiyim',
    cluster: 'A: אלהי / אלהות field',
    lemma: H.elohiyim,
    baseRenderings: ['divine', 'godly'],
    surfaces: [
      { surface: H.haElohiyim, renderings: ['the divine', 'the godly'], base: H.elohiyim },
    ],
  },
  {
    key: 'elohiyot',
    cluster: 'A: אלהי / אלהות field',
    lemma: H.elohiyot,
    baseRenderings: ['divine', 'godly'],
    surfaces: [
      { surface: H.haElohiyot, renderings: ['the divine', 'the godly'], base: H.elohiyot },
    ],
  },
  {
    key: 'idea',
    cluster: 'B: אידיאה / אידיאל field',
    lemma: H.idea,
    baseRenderings: ['idea'],
    surfaces: [
      { surface: H.haIdea, renderings: ['the idea'], base: H.idea },
      { surface: H.haIdeas, renderings: ['the ideas'], base: H.ideas },
    ],
  },
  {
    key: 'ideal',
    cluster: 'B: אידיאה / אידיאל field',
    lemma: H.ideal,
    baseRenderings: ['ideal'],
    surfaces: [
      { surface: H.haIdealit, renderings: ['the ideal'], base: H.idealit },
      { surface: H.idealit, renderings: ['ideal'] },
      { surface: H.haIdeali, renderings: ['the ideal'], base: H.ideal },
      { surface: H.haIdealim, renderings: ['the ideals'], base: H.idealim },
    ],
  },
  {
    key: 'mussari',
    cluster: 'C: מוסר field',
    lemma: H.mussarit,
    baseRenderings: ['moral', 'ethical'],
    surfaces: [
      { surface: H.haMussarit, renderings: ['the moral', 'the ethical'], base: H.mussarit },
      { surface: H.haMussariyot, renderings: ['the moral', 'the ethical'], base: H.mussariyot },
    ],
  },
  {
    key: 'homri',
    cluster: 'D: חומר field',
    lemma: H.homer,
    baseRenderings: ['material', 'physical'],
    surfaces: [
      { surface: H.homrit, renderings: ['material', 'physical'] },
      { surface: H.haHomrit, renderings: ['the material', 'the physical'], base: H.homrit },
      { surface: H.homriim, renderings: ['material', 'physical'] },
      { surface: H.haHomriim, renderings: ['the material', 'the physical'], base: H.homriim },
    ],
  },
  {
    key: 'nishmati',
    cluster: 'E: נשמה / פנימיות / מקור field',
    lemma: H.nishmatit,
    baseRenderings: ['soul-related', 'spiritual-soul'],
    surfaces: [
      { surface: H.haNishmatit, renderings: ['the soul-related', 'the spiritual-soul'], base: H.nishmatit },
    ],
  },
  {
    key: 'mekori-prefixed',
    cluster: 'E: נשמה / פנימיות / מקור field',
    lemma: H.mekorit,
    baseRenderings: ['original', 'source-like'],
    surfaces: [
      { surface: H.haMekorit, renderings: ['the original', 'the source-like'], base: H.mekorit },
    ],
  },
];

const PROMOTION_REVIEW = [
  {
    surface: H.mekorit,
    note: 'Existing Kaikki possible match gives "original"; retained as-is to avoid mutating the existing Kaikki source layer in this pass.',
  },
];

const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  [cp('05DA'), cp('05DB')],
  [cp('05DD'), cp('05DE')],
  [cp('05DF'), cp('05E0')],
  [cp('05E3'), cp('05E4')],
  [cp('05E5'), cp('05E6')],
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 12)}`;
}

function normalizeHebrew(value) {
  const stripped = String(value || '')
    .normalize('NFC')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4')
    .replace(niqqudRe, '');
  return Array.from(stripped, (char) => finalLetters.get(char) || char).join('');
}

function codepoints(value) {
  return Array.from(String(value || '')).map((char) => char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function examplesByTokenId(occurrences) {
  const examples = new Map();
  for (const unit of Object.values(occurrences.units || {})) {
    const seen = new Set();
    for (const paragraph of unit.paragraphs || []) {
      for (const tokenId of paragraph.token_index_ids || []) seen.add(tokenId);
    }
    for (const tokenId of seen) {
      const refs = examples.get(tokenId) || [];
      if (refs.length < 3 && unit.source_ref && !refs.includes(unit.source_ref)) refs.push(unit.source_ref);
      examples.set(tokenId, refs);
    }
  }
  return examples;
}

function makeSourceRow(key) {
  return {
    source_name: SOURCE_NAME,
    source_family: SOURCE_FAMILY,
    source_id: `project-orot-technical:${key}`,
    source_url: SOURCE_URL,
    license: LICENSE,
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fields_used: ['surface form', 'mechanical normalization', 'short lexical renderings'],
    notes: 'Project-authored Orot technical term row. Short lexical renderings only; no external dictionary prose imported.',
  };
}

function makeBreakdown(surfaceSpec) {
  if (!surfaceSpec.base) return [];
  if (!surfaceSpec.surface.startsWith(H.heh)) return [];
  return [
    { hebrew: `${H.heh}${H.maqaf}`, strict_renderings: ['the'] },
    { hebrew: surfaceSpec.base, strict_renderings: surfaceSpec.renderings.map((rendering) => rendering.replace(/^the\s+/i, '')) },
  ];
}

function makeEntry(group) {
  const sourceRow = makeSourceRow(group.key);
  const sourceKey = `${sourceRow.source_family}|${sourceRow.source_id}`;
  return {
    entry_id: stableId('lex-orot-term', group.key),
    hebrew_word: group.lemma,
    surface_forms: group.surfaces.map((item) => item.surface),
    transliteration: '',
    strict_renderings: group.baseRenderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: 'Resolved as a repeated Orot technical term.',
    possible_entries_truncated: 0,
    possible_entries: [
      {
        entry_key: sourceRow.source_id,
        lemma: group.lemma,
        match_key: normalizeHebrew(group.lemma),
        source_name: SOURCE_NAME,
        source_family: SOURCE_FAMILY,
        source_id: sourceRow.source_id,
        transliteration: '',
        strict_renderings: group.baseRenderings,
        root: '',
        root_transliteration: '',
        root_meaning: [],
        context_role: 'likely_contextual',
        relation_label: 'project Orot technical term',
        source_row_keys: [sourceKey],
      },
    ],
    source_rows: [sourceRow],
  };
}

function updateManifest(manifest, entryCount) {
  manifest.layer_files = (manifest.layer_files || []).filter((layer) => layer.layer_id !== LAYER_ID);
  const layer = {
    layer_id: LAYER_ID,
    source_family: SOURCE_FAMILY,
    license: LICENSE,
    path: 'source-layers/project-orot-technical-terms.json',
    status: 'active',
    description: 'Project-authored conservative Orot technical term rows. Short lexical renderings only; no external dictionary prose imported.',
    entries: entryCount,
  };
  const abbreviationIndex = manifest.layer_files.findIndex((item) => item.layer_id === 'project-abbreviations');
  const insertIndex = abbreviationIndex >= 0 ? abbreviationIndex + 1 : 1;
  manifest.layer_files.splice(insertIndex, 0, layer);
  manifest.generated_at = new Date().toISOString();
}

function topUnmatched(forms, limit) {
  return forms
    .filter((row) => row.status !== 'matched')
    .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
    .slice(0, limit);
}

function writeReport({
  beforeMatched,
  afterMatched,
  entries,
  addedRows,
  retainedRows,
  forms,
  examples,
  rejected,
}) {
  const lines = [];
  lines.push('# Orot Technical Term Enrichment Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push('- Work: Orot only');
  lines.push('- Source added: project-authored Orot technical term table only');
  lines.push('- Broad vocabulary added: no');
  lines.push('- Existing Wikidata/OpenScriptures/Kaikki/source-layer entries overwritten: no');
  lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Matched before pass: ${beforeMatched}`);
  lines.push(`- Newly matched by project technical term layer: ${addedRows.length}`);
  lines.push('- Kaikki possible entries promoted to likely contextual: 0');
  lines.push(`- Total matched after: ${afterMatched}`);
  lines.push(`- Still unmatched: ${forms.length - afterMatched}`);
  lines.push(`- Project technical term entries created: ${entries.length}`);
  lines.push('');
  lines.push('## Candidate Diagnosis');
  lines.push('');
  lines.push('| Cluster | Surface form | Codepoints | Base/lemma | Strict renderings | Count | Example refs | Decision |');
  lines.push('|---|---|---|---|---|---:|---|---|');
  for (const row of addedRows) {
    const refs = examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean);
    lines.push(`| ${escapeCell(row.cluster)} | ${escapeCell(row.surface_word)} | ${codepoints(row.surface_word)} | ${escapeCell(row.lemma)} | ${escapeCell((row.surface_renderings || []).join('; '))} | ${row.occurrence_count || 0} | ${escapeCell(refs.join('; '))} | added project technical term |`);
  }
  for (const row of retainedRows) {
    const refs = examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean);
    lines.push(`| ${escapeCell(row.cluster)} | ${escapeCell(row.surface_word)} | ${codepoints(row.surface_word)} | ${escapeCell(row.lemma)} | ${escapeCell((row.renderings || []).join('; '))} | ${row.occurrence_count || 0} | ${escapeCell(refs.join('; '))} | retained existing Kaikki possible match; no source-layer mutation |`);
  }
  lines.push('');
  lines.push('## Layer Entries Added');
  lines.push('');
  lines.push('| Entry lemma | Codepoints | Strict renderings | Source/license |');
  lines.push('|---|---|---|---|');
  for (const entry of entries) {
    const sourceRow = entry.source_rows[0];
    lines.push(`| ${escapeCell(entry.hebrew_word)} | ${codepoints(entry.hebrew_word)} | ${escapeCell((entry.strict_renderings || []).join('; '))} | ${escapeCell(`${sourceRow.source_name} | ${sourceRow.license}`)} |`);
  }
  lines.push('');
  lines.push('## Rejected Or Deferred Candidates');
  lines.push('');
  lines.push('| Surface form | Reason |');
  lines.push('|---|---|');
  for (const item of rejected) {
    lines.push(`| ${escapeCell(item.surface)} | ${escapeCell(item.reason)} |`);
  }
  lines.push('');
  lines.push('## Top 50 Still Unmatched');
  lines.push('');
  lines.push('| # | Surface form | Normalized form | Count | Example refs |');
  lines.push('|---:|---|---|---:|---|');
  topUnmatched(forms, 50).forEach((row, index) => {
    const refs = examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean);
    lines.push(`| ${index + 1} | ${escapeCell(row.surface_word)} | ${escapeCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${escapeCell(refs.join('; '))} |`);
  });
  lines.push('');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}

function main() {
  const tokenIndex = readJson(tokenIndexPath);
  const manifest = readJson(manifestPath);
  const occurrences = readJson(occurrencePath);
  const forms = tokenIndex.forms || [];
  const examples = examplesByTokenId(occurrences);

  for (const row of forms) {
    if (row.match_method === 'project_orot_technical_term' || String(row.lexicon_entry_id || '').startsWith('lex-orot-term-')) {
      row.status = 'unmatched';
      row.match_method = 'unmatched';
      row.lexicon_entry_id = '';
      row.surface_context_status = '';
      row.surface_context_note = '';
      row.surface_renderings = [];
      row.breakdown = [];
    }
  }

  const beforeMatched = forms.filter((row) => row.status === 'matched').length;
  const entries = TERM_GROUPS.map(makeEntry);
  const entryByGroupKey = new Map(entries.map((entry, index) => [TERM_GROUPS[index].key, entry]));
  const surfaceSpecs = new Map();
  for (const group of TERM_GROUPS) {
    for (const spec of group.surfaces) {
      surfaceSpecs.set(normalizeHebrew(spec.surface), { ...spec, group });
    }
  }

  const addedRows = [];
  const retainedRows = [];

  for (const row of forms) {
    const spec = surfaceSpecs.get(normalizeHebrew(row.surface_word || row.normalized_word));
    if (!spec) continue;
    if (row.status === 'matched') {
      retainedRows.push({
        ...row,
        cluster: spec.group.cluster,
        lemma: spec.group.lemma,
        renderings: row.surface_renderings && row.surface_renderings.length ? row.surface_renderings : spec.renderings,
      });
      continue;
    }

    const entry = entryByGroupKey.get(spec.group.key);
    row.status = 'matched';
    row.match_method = 'project_orot_technical_term';
    row.lexicon_entry_id = entry.entry_id;
    row.surface_context_status = 'resolved_project_technical_term';
    row.surface_context_note = 'Resolved as a repeated Orot technical term.';
    row.surface_renderings = spec.renderings;
    row.breakdown = makeBreakdown(spec);
    addedRows.push({
      ...row,
      cluster: spec.group.cluster,
      lemma: spec.group.lemma,
    });
  }

  const activeEntries = entries.filter((entry) => addedRows.some((row) => row.lexicon_entry_id === entry.entry_id));
  writeJson(layerPath, {
    schema_version: 1,
    layer_id: LAYER_ID,
    source_family: SOURCE_FAMILY,
    license: LICENSE,
    status: 'active',
    description: 'Project-authored conservative Orot technical term rows. Short lexical renderings only; no external dictionary prose imported.',
    generated_at: new Date().toISOString(),
    entries: activeEntries,
  });

  updateManifest(manifest, activeEntries.length);
  writeJson(manifestPath, manifest);

  const afterMatched = forms.filter((row) => row.status === 'matched').length;
  tokenIndex.generated_at = new Date().toISOString();
  tokenIndex.matched_surface_forms = afterMatched;
  tokenIndex.unmatched_surface_forms = forms.length - afterMatched;
  tokenIndex.matched_project_orot_technical_surface_forms = addedRows.length;
  tokenIndex.project_orot_technical_source_layer = 'data/lexical/source-layers/project-orot-technical-terms.json';
  writeJson(tokenIndexPath, tokenIndex);

  const rejected = PROMOTION_REVIEW.map((item) => ({
    surface: item.surface,
    reason: item.note,
  }));
  writeReport({
    beforeMatched,
    afterMatched,
    entries: activeEntries,
    addedRows,
    retainedRows,
    forms,
    examples,
    rejected,
  });

  console.log(JSON.stringify({
    beforeMatched,
    newlyMatchedByProjectTechnicalTerms: addedRows.length,
    kaikkiPossibleEntriesPromoted: 0,
    afterMatched,
    stillUnmatched: forms.length - afterMatched,
    entries: activeEntries.length,
    retainedExistingMatches: retainedRows.map((row) => ({
      surface: row.surface_word,
      status: row.status,
      method: row.match_method,
      entry: row.lexicon_entry_id,
    })),
    report: reportPath,
  }, null, 2));
}

main();
