import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const manifestPath = path.join(lexicalDir, 'lexicon.json');
const occurrencePath = path.join(lexicalDir, 'occurrences', 'orot.json');
const sourcePath = path.join('data', 'sources', 'orot.json');
const layerPath = path.join(lexicalDir, 'source-layers', 'project-abbreviations.json');
const reportPath = path.join('reports', 'orot-abbreviation-enrichment-report.md');

const cp = (...hex) => hex.map((value) => String.fromCharCode(Number.parseInt(value, 16))).join('');

const ABBREVIATIONS = [
  {
    key: 'ayin-yod',
    surface: cp('05E2', '05F4', '05D9'),
    expansion: cp('05E2', '05DC', '0020', '05D9', '05D3', '05D9'),
    renderings: ['by', 'through', 'by means of'],
    breakdown: [],
  },
  {
    key: 'vav-ayin-yod',
    surface: cp('05D5', '05E2', '05F4', '05D9'),
    expansion: cp('05E2', '05DC', '0020', '05D9', '05D3', '05D9'),
    renderings: ['and by', 'and through', 'and by means of'],
    breakdown: [
      { hebrew: cp('05D5', '05BE'), strict_renderings: ['and'] },
      { hebrew: cp('05E2', '05F4', '05D9'), strict_renderings: ['by', 'through', 'by means of'] },
    ],
  },
  {
    key: 'shin-ayin-yod',
    surface: cp('05E9', '05E2', '05F4', '05D9'),
    expansion: cp('05E2', '05DC', '0020', '05D9', '05D3', '05D9'),
    renderings: ['that by', 'which through', 'by which'],
    breakdown: [
      { hebrew: cp('05E9', '05BE'), strict_renderings: ['that', 'which'] },
      { hebrew: cp('05E2', '05F4', '05D9'), strict_renderings: ['by', 'through', 'by means of'] },
    ],
  },
  {
    key: 'gimel-kaf',
    surface: cp('05D2', '05F4', '05DB'),
    expansion: cp('05D2', '05DD', '0020', '05DB', '05DF'),
    renderings: ['also', 'likewise'],
    breakdown: [],
  },
  {
    key: 'af-al-pi',
    surface: cp('05D0', '05E2', '05F4', '05E4'),
    expansion: cp('05D0', '05E3', '0020', '05E2', '05DC', '0020', '05E4', '05D9'),
    renderings: ['although', 'even though'],
    breakdown: [],
  },
  {
    key: 'kaf-kaf',
    surface: cp('05DB', '05F4', '05DB'),
    expansion: cp('05DB', '05DC', '0020', '05DB', '05DA'),
    renderings: ['so much', 'so', 'to such an extent'],
    breakdown: [],
  },
  {
    key: 'mem-mem',
    surface: cp('05DE', '05F4', '05DE'),
    expansion: cp('05DE', '05DB', '05DC', '0020', '05DE', '05E7', '05D5', '05DD'),
    renderings: ['nevertheless', 'in any case'],
    breakdown: [],
  },
  {
    key: 'ayin-pe',
    surface: cp('05E2', '05F4', '05E4'),
    expansion: cp('05E2', '05DC', '0020', '05E4', '05D9'),
    renderings: ['according to', 'based on', 'by'],
    breakdown: [],
  },
  {
    key: 'ayin-kaf',
    surface: cp('05E2', '05F4', '05DB'),
    expansion: cp('05E2', '05DC', '0020', '05DB', '05DF'),
    renderings: ['therefore', 'therefore so', 'on account of this'],
    breakdown: [],
  },
  {
    key: 'ayin-dalet',
    surface: cp('05E2', '05F4', '05D3'),
    expansion: cp('05E2', '05DC', '0020', '05D3', '05D1', '05E8'),
    renderings: ['concerning', 'regarding', 'about'],
    breakdown: [],
  },
];

const AMBIGUOUS = [
  {
    surface: cp('05DB', '05F4', '05D0'),
    likelyExpansions: [
      `${cp('05DB', '05D9', '0020', '05D0', '05DD')} - rather / but only / except`,
      `${cp('05DB', '05DC', '0020', '05D0', '05D7', '05D3')} - each one`,
    ],
  },
];

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

function canonicalAbbreviation(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/"/g, '\u05F4')
    .replace(/'/g, '\u05F3')
    .trim();
}

function codepoints(value) {
  return Array.from(String(value || '')).map((char) => char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

function assertCodepoints(label, actual, expectedHex) {
  const actualHex = codepoints(actual);
  if (actualHex !== expectedHex.join(' ')) {
    throw new Error(`${label} codepoint mismatch. Expected ${expectedHex.join(' ')}, got ${actualHex}`);
  }
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

function sourceSnippetByRef(source) {
  const snippets = new Map();
  for (const unit of source.units || []) {
    snippets.set(unit.source_ref, (unit.hebrew || []).join(' ').replace(/\s+/g, ' '));
  }
  return snippets;
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function makeEntry(item) {
  const sourceId = `project-abbreviation:${item.key}`;
  const rowKey = `workspace|${sourceId}`;
  return {
    entry_id: stableId('lex-abbrev', item.key),
    hebrew_word: item.surface,
    surface_forms: [
      item.surface,
      item.surface.replace(/\u05F4/g, '"'),
    ],
    transliteration: '',
    strict_renderings: item.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: `Resolved as a common abbreviation: ${item.expansion}.`,
    expansion: item.expansion,
    possible_entries_truncated: 0,
    possible_entries: [
      {
        entry_key: sourceId,
        lemma: item.surface,
        match_key: item.surface,
        expansion: item.expansion,
        source_name: 'Project-authored abbreviation table',
        source_family: 'workspace',
        source_id: sourceId,
        transliteration: '',
        strict_renderings: item.renderings,
        root: '',
        root_transliteration: '',
        root_meaning: [],
        context_role: 'likely_contextual',
        relation_label: `common abbreviation for ${item.expansion}`,
        source_row_keys: [rowKey],
      },
    ],
    source_rows: [
      {
        source_name: 'Project-authored abbreviation table',
        source_family: 'workspace',
        source_id: sourceId,
        source_url: 'local:project-abbreviation-table',
        license: 'N/A - project-authored lexical rule',
        license_url: 'local:project-abbreviation-table',
        fields_used: ['abbreviation surface form', 'expansion', 'strict renderings'],
        notes: 'Project-maintained abbreviation expansion. No external dictionary text imported.',
      },
    ],
  };
}

function updateManifest(manifest, entryCount) {
  manifest.layer_files = (manifest.layer_files || []).filter((layer) => layer.layer_id !== 'project-abbreviations');
  const insertIndex = Math.max(1, manifest.layer_files.findIndex((layer) => layer.layer_id === 'wikidata-cc0'));
  const layer = {
    layer_id: 'project-abbreviations',
    source_family: 'workspace',
    license: 'N/A - project-authored lexical rules',
    path: 'source-layers/project-abbreviations.json',
    description: 'Project-authored conservative Hebrew abbreviation expansions.',
    entries: entryCount,
  };
  manifest.layer_files.splice(insertIndex, 0, layer);
  manifest.generated_at = new Date().toISOString();
}

function topUnmatched(forms, limit) {
  return forms
    .filter((row) => row.status !== 'matched')
    .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
    .slice(0, limit);
}

function writeReport({ beforeMatched, afterMatched, newlyMatched, forms, examples, ambiguousRows, snippets }) {
  const lines = [];
  lines.push('# Orot Abbreviation Enrichment Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push('- Work: Orot only');
  lines.push('- Source added: project-authored abbreviation table only');
  lines.push('- Broad vocabulary added: no');
  lines.push('- Existing Wikidata/OpenScriptures/Kaikki behavior changed: no');
  lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Matched before abbreviation pass: ${beforeMatched}`);
  lines.push(`- Newly matched by abbreviation table: ${newlyMatched.length}`);
  lines.push(`- Total matched after abbreviation pass: ${afterMatched}`);
  lines.push(`- Still unmatched: ${forms.length - afterMatched}`);
  lines.push('');
  lines.push('## Abbreviations Added');
  lines.push('');
  lines.push('| Surface | Surface codepoints | Expansion | Expansion codepoints | Strict renderings | Token occurrences | Sample refs |');
  lines.push('|---|---|---|---|---|---:|---|');
  for (const item of ABBREVIATIONS) {
    const rows = newlyMatched.filter((row) => canonicalAbbreviation(row.normalized_word) === item.surface);
    const refs = rows.flatMap((row) => examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)).slice(0, 3);
    const occurrences = rows.reduce((sum, row) => sum + (row.occurrence_count || 0), 0);
    lines.push(`| ${escapeCell(item.surface)} | ${codepoints(item.surface)} | ${escapeCell(item.expansion)} | ${codepoints(item.expansion)} | ${escapeCell(item.renderings.join('; '))} | ${occurrences} | ${escapeCell(refs.join('; '))} |`);
  }
  lines.push('');
  lines.push('## Ambiguous Abbreviations Left Unresolved');
  lines.push('');
  lines.push('| Surface | Count | Likely expansions to review | Example refs | Example snippets |');
  lines.push('|---|---:|---|---|---|');
  for (const item of AMBIGUOUS) {
    const rows = ambiguousRows.filter((row) => canonicalAbbreviation(row.normalized_word) === item.surface);
    const refs = rows.flatMap((row) => examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)).slice(0, 3);
    const sampleSnippets = refs.map((ref) => snippets.get(ref) || '').map((text) => {
      const variants = [item.surface, item.surface.replace(/\u05F4/g, '"'), item.surface.replace(/\u05F4/g, "'")];
      const i = variants.map((variant) => text.indexOf(variant)).find((index) => index >= 0) ?? -1;
      if (i < 0) return text.slice(0, 140);
      return text.slice(Math.max(0, i - 55), Math.min(text.length, i + 85));
    });
    lines.push(`| ${escapeCell(item.surface)} | ${rows.reduce((sum, row) => sum + (row.occurrence_count || 0), 0)} | ${escapeCell(item.likelyExpansions.join('; '))} | ${escapeCell(refs.join('; '))} | ${escapeCell(sampleSnippets.join(' / '))} |`);
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
  ABBREVIATIONS.forEach((item) => {
    assertCodepoints(`surface ${item.key}`, item.surface, codepoints(item.surface).split(' '));
    assertCodepoints(`expansion ${item.key}`, item.expansion, codepoints(item.expansion).split(' '));
  });

  assertCodepoints('surface ayin-yod', ABBREVIATIONS[0].surface, ['05E2', '05F4', '05D9']);
  assertCodepoints('expansion ayin-yod', ABBREVIATIONS[0].expansion, ['05E2', '05DC', '0020', '05D9', '05D3', '05D9']);
  assertCodepoints('surface vav-ayin-yod', ABBREVIATIONS[1].surface, ['05D5', '05E2', '05F4', '05D9']);
  assertCodepoints('surface shin-ayin-yod', ABBREVIATIONS[2].surface, ['05E9', '05E2', '05F4', '05D9']);
  assertCodepoints('surface gimel-kaf', ABBREVIATIONS[3].surface, ['05D2', '05F4', '05DB']);
  assertCodepoints('surface af-al-pi', ABBREVIATIONS[4].surface, ['05D0', '05E2', '05F4', '05E4']);
  assertCodepoints('surface kaf-kaf', ABBREVIATIONS[5].surface, ['05DB', '05F4', '05DB']);
  assertCodepoints('surface mem-mem', ABBREVIATIONS[6].surface, ['05DE', '05F4', '05DE']);
  assertCodepoints('surface ayin-pe', ABBREVIATIONS[7].surface, ['05E2', '05F4', '05E4']);
  assertCodepoints('surface ayin-kaf', ABBREVIATIONS[8].surface, ['05E2', '05F4', '05DB']);
  assertCodepoints('surface ayin-dalet', ABBREVIATIONS[9].surface, ['05E2', '05F4', '05D3']);
  assertCodepoints('ambiguous kaf-alef', AMBIGUOUS[0].surface, ['05DB', '05F4', '05D0']);

  const tokenIndex = readJson(tokenIndexPath);
  const manifest = readJson(manifestPath);
  const occurrences = readJson(occurrencePath);
  const source = readJson(sourcePath);
  const forms = tokenIndex.forms || [];

  for (const row of forms) {
    if (row.match_method === 'project_abbreviation' || String(row.lexicon_entry_id || '').startsWith('lex-abbrev-')) {
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
  const entries = ABBREVIATIONS.map(makeEntry);
  const entriesBySurface = new Map(ABBREVIATIONS.map((item, index) => [item.surface, { item, entry: entries[index] }]));
  const newlyMatched = [];
  const ambiguousRows = [];

  for (const row of forms) {
    const key = canonicalAbbreviation(row.normalized_word || row.surface_word);
    if (row.status !== 'matched' && entriesBySurface.has(key)) {
      const { item, entry } = entriesBySurface.get(key);
      row.status = 'matched';
      row.match_method = 'project_abbreviation';
      row.lexicon_entry_id = entry.entry_id;
      row.surface_context_status = 'resolved_abbreviation';
      row.surface_context_note = `Resolved as common abbreviation: ${item.expansion}.`;
      row.surface_renderings = item.renderings;
      row.breakdown = item.breakdown && item.breakdown.length
        ? item.breakdown
        : [{ hebrew: item.expansion, strict_renderings: item.renderings }];
      newlyMatched.push(row);
    }
    if (AMBIGUOUS.some((item) => item.surface === key)) ambiguousRows.push(row);
  }

  const layer = {
    schema_version: 1,
    layer_id: 'project-abbreviations',
    source_family: 'workspace',
    license: 'N/A - project-authored lexical rules',
    status: 'active',
    description: 'Project-authored conservative Hebrew abbreviation expansions. No external dictionary text imported.',
    generated_at: new Date().toISOString(),
    entries,
  };
  writeJson(layerPath, layer);

  updateManifest(manifest, entries.length);
  writeJson(manifestPath, manifest);

  const afterMatched = forms.filter((row) => row.status === 'matched').length;
  tokenIndex.generated_at = new Date().toISOString();
  tokenIndex.matched_surface_forms = afterMatched;
  tokenIndex.unmatched_surface_forms = forms.length - afterMatched;
  tokenIndex.matched_project_abbreviation_surface_forms = newlyMatched.length;
  writeJson(tokenIndexPath, tokenIndex);

  writeReport({
    beforeMatched,
    afterMatched,
    newlyMatched,
    forms,
    examples: examplesByTokenId(occurrences),
    ambiguousRows,
    snippets: sourceSnippetByRef(source),
  });

  console.log(JSON.stringify({
    beforeMatched,
    newlyMatchedByAbbreviationTable: newlyMatched.length,
    afterMatched,
    unmatchedAfterAbbreviations: forms.length - afterMatched,
    ambiguousLeftUnresolved: ambiguousRows.map((row) => ({
      surface: row.surface_word,
      normalized: row.normalized_word,
      count: row.occurrence_count,
      status: row.status,
      first_ref: row.first_source_ref,
    })),
    report: reportPath,
  }, null, 2));
}

main();
