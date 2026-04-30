import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2] || 'data/sources';
const lexicalDir = process.argv[3] || 'data/lexical';
const occurrencesDir = path.join(lexicalDir, 'occurrences');
const lexiconPath = path.join(lexicalDir, 'lexicon.json');
const lexiconLayerDir = path.join(lexicalDir, 'source-layers');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const reportPath = 'reports/orot-lexical-coverage-report.md';
const lexicalScope = {
  work_id: 'orot',
  label: 'Orot',
};
const lexicalLayerFiles = [
  {
    layer_id: 'project-overrides',
    source_family: 'workspace',
    license: 'N/A - project-authored lexical rules',
    path: 'source-layers/project-overrides.json',
    description: 'Project-authored fixed expression and grammar override entries.',
  },
  {
    layer_id: 'wikidata-cc0',
    source_family: 'wikidata',
    license: 'CC0',
    path: 'source-layers/wikidata-cc0.json',
    description: 'Entries whose source rows are entirely Wikidata Lexeme CC0 rows.',
  },
  {
    layer_id: 'openscriptures-cc-by-4',
    source_family: 'openscriptures',
    license: 'CC BY 4.0',
    path: 'source-layers/openscriptures-cc-by-4.json',
    description: 'Entries containing OpenScriptures CC BY 4.0 rows, including mixed clean-source entries.',
  },
  {
    layer_id: 'kaikki-wiktionary-cc-by-sa-gfdl',
    source_family: 'kaikki',
    license: 'CC BY-SA 4.0 / GFDL',
    path: 'source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json',
    status: 'placeholder',
    description: 'Reserved future layer for Wiktionary via Kaikki data. No data is imported in this task.',
  },
];

const tokenRe = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"]*/gu;
const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCompactJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, 'utf8');
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 12)}`;
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4');
}

function normalizeHebrewToken(value) {
  const stripped = normalizeHebrewPunctuation(value).replace(niqqudRe, '');
  return Array.from(stripped, (char) => finalLetters.get(char) || char).join('');
}

function hasAbbreviationMark(value) {
  return /[\u05F3\u05F4'"]/.test(value);
}

function normalizeHebrewTokenWithQubutsMater(value) {
  const text = normalizeHebrewPunctuation(value);
  const output = [];
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!/[\u05D0-\u05EA]/u.test(char)) continue;
    output.push(finalLetters.get(char) || char);
    let markIndex = index + 1;
    let hasQubuts = false;
    while (markIndex < text.length && /[\u0591-\u05C7]/u.test(text[markIndex])) {
      if (text[markIndex] === '\u05BB') hasQubuts = true;
      markIndex += 1;
    }
    if (hasQubuts && text[markIndex] !== '\u05D5') output.push('\u05D5');
  }
  return output.join('');
}

function getTokens(text) {
  return Array.from(String(text || '').matchAll(tokenRe), (match) => normalizeHebrewPunctuation(match[0]));
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

const fixedExpressions = [
  {
    normalized_word: '\u05E9\u05DC',
    hebrew_word: '\u05E9\u05DC',
    surface_forms: [
      '\u05E9\u05DC',
      '\u05E9\u05B6\u05C1\u05DC',
    ],
    surface_renderings: [
      'of',
      'belonging to',
    ],
    surface_context_status: 'resolved_particle',
    surface_context_note: 'Resolved as a fixed Hebrew possessive/relational particle.',
    breakdown: [],
    possible_entry: {
      entry_key: 'grammar-particle:\u05E9\u05DC',
      lemma: '\u05E9\u05DC',
      match_key: '\u05E9\u05DC',
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-particle:\u05E9\u05DC',
      transliteration: '',
      strict_renderings: [
        'of',
        'belonging to',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|grammar-particle:\u05E9\u05DC'],
    },
    source_row: {
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-particle:\u05E9\u05DC',
      source_url: 'local:grammar-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:grammar-rules',
      fields_used: ['fixed Hebrew particle lookup', 'strict renderings'],
      notes: 'Project-maintained grammar rule. No external dictionary text imported.',
    },
  },
  {
    normalized_word: '\u05D1\u05EA\u05D5\u05E8',
    hebrew_word: '\u05D1\u05EA\u05D5\u05E8',
    surface_forms: [
      '\u05D1\u05EA\u05D5\u05E8',
      '\u05D1\u05B0\u05BC\u05EA\u05D5\u05B9\u05E8',
    ],
    surface_renderings: [
      'as',
      'in the capacity of',
      'in the role of',
    ],
    surface_context_status: 'resolved_fixed_expression',
    surface_context_note: 'Resolved as a fixed prefixed expression.',
    breakdown: [
      {
        hebrew: '\u05D1\u05B0\u05BC\u05BE',
        strict_renderings: ['in', 'as', 'with'],
      },
      {
        hebrew: '\u05EA\u05D5\u05B9\u05E8',
        strict_renderings: ['turn', 'row', 'order'],
      },
    ],
    possible_entry: {
      entry_key: 'fixed-expression:\u05D1\u05EA\u05D5\u05E8',
      lemma: '\u05D1\u05EA\u05D5\u05E8',
      match_key: '\u05D1\u05EA\u05D5\u05E8',
      source_name: 'Workspace fixed-expression rule',
      source_family: 'workspace',
      source_id: 'fixed-expression:\u05D1\u05EA\u05D5\u05E8',
      transliteration: '',
      strict_renderings: [
        'as',
        'in the capacity of',
        'in the role of',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|fixed-expression:\u05D1\u05EA\u05D5\u05E8'],
    },
    source_row: {
      source_name: 'Workspace fixed-expression rule',
      source_family: 'workspace',
      source_id: 'fixed-expression:\u05D1\u05EA\u05D5\u05E8',
      source_url: 'local:fixed-expression-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:fixed-expression-rules',
      fields_used: ['fixed expression lookup', 'strict renderings', 'mechanical breakdown'],
      notes: 'Project-maintained fixed-expression rule. No external dictionary text imported.',
    },
  },
  {
    normalized_word: '\u05D0\u05D9\u05E0\u05E0\u05D4',
    hebrew_word: '\u05D0\u05D9\u05E0\u05E0\u05D4',
    surface_forms: [
      '\u05D0\u05D9\u05E0\u05E0\u05D4',
      '\u05D0\u05B5\u05D9\u05E0\u05B6\u05E0\u05B8\u05BC\u05D4\u05BC',
    ],
    surface_renderings: [
      'is not',
      'is not it',
      'is not her',
    ],
    surface_context_status: 'resolved_negative_particle_pronominal',
    surface_context_note: 'Resolved as a closed-class negative particle with pronominal ending.',
    breakdown: [
      {
        hebrew: '\u05D0\u05D9\u05DF',
        strict_renderings: ['is not', 'there is not'],
      },
      {
        hebrew: '\u05BE\u05D4\u05BC',
        strict_renderings: ['it', 'her'],
      },
    ],
    possible_entry: {
      entry_key: 'grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4',
      lemma: '\u05D0\u05D9\u05E0\u05E0\u05D4',
      match_key: '\u05D0\u05D9\u05E0\u05E0\u05D4',
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4',
      transliteration: '',
      strict_renderings: [
        'is not',
        'is not it',
        'is not her',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4'],
    },
    source_row: {
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4',
      source_url: 'local:grammar-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:grammar-rules',
      fields_used: ['closed-class Hebrew grammar form lookup', 'strict renderings', 'mechanical breakdown'],
      notes: 'Project-maintained grammar rule for the Orot opening canary. No external dictionary text imported.',
    },
  },
];

const fixedExpressionByNormalized = new Map(fixedExpressions.map((expression) => [expression.normalized_word, expression]));

const prefixRules = new Map([
  ['\u05D5', { hebrew: '\u05D5\u05BE', renderings: ['and'] }],
  ['\u05D4', { hebrew: '\u05D4\u05BE', renderings: ['the'] }],
  ['\u05D1', { hebrew: '\u05D1\u05BE', renderings: ['in', 'with', 'by'] }],
  ['\u05DB', { hebrew: '\u05DB\u05BE', renderings: ['as', 'like'] }],
  ['\u05DC', { hebrew: '\u05DC\u05BE', renderings: ['to', 'for', 'of'] }],
  ['\u05DE', { hebrew: '\u05DE\u05BE', renderings: ['from', 'of'] }],
  ['\u05E9', { hebrew: '\u05E9\u05BE', renderings: ['that', 'which', 'who'] }],
]);

const acceptedPrefixSequences = new Set([
  '',
  '\u05D5',
  '\u05D4',
  '\u05D1',
  '\u05DB',
  '\u05DC',
  '\u05DE',
  '\u05E9',
  '\u05D5\u05D4',
  '\u05D5\u05D1',
  '\u05D5\u05DC',
  '\u05D5\u05DB',
  '\u05DE\u05D4',
  '\u05E9\u05D4',
  '\u05D1\u05D4',
  '\u05DC\u05D4',
  '\u05DB\u05D4',
]);

const suffixRules = [
  { normalized: '\u05D9\u05D4\u05DD', hebrew: '\u05BE\u05D9\u05D4\u05DD', renderings: ['their'] },
  { normalized: '\u05D9\u05D4\u05DF', hebrew: '\u05BE\u05D9\u05D4\u05DF', renderings: ['their'] },
  { normalized: '\u05D9\u05D5', hebrew: '\u05BE\u05D9\u05D5', renderings: ['his', 'its'] },
  { normalized: '\u05D9\u05D4', hebrew: '\u05BE\u05D9\u05D4', renderings: ['her', 'its'] },
  { normalized: '\u05E0\u05D5', hebrew: '\u05BE\u05E0\u05D5', renderings: ['our'] },
  { normalized: '\u05DB\u05DD', hebrew: '\u05BE\u05DB\u05DD', renderings: ['your'] },
  { normalized: '\u05DB\u05DF', hebrew: '\u05BE\u05DB\u05DF', renderings: ['your'] },
  { normalized: '\u05D5', hebrew: '\u05BE\u05D5', renderings: ['his', 'its'] },
  { normalized: '\u05D4', hebrew: '\u05BE\u05D4', renderings: ['her', 'its'] },
  { normalized: '\u05DD', hebrew: '\u05BE\u05DD', renderings: ['their'] },
  { normalized: '\u05DF', hebrew: '\u05BE\u05DF', renderings: ['their'] },
  { normalized: '\u05DE', hebrew: '\u05BE\u05DD', renderings: ['their'] },
  { normalized: '\u05E0', hebrew: '\u05BE\u05DF', renderings: ['their'] },
].sort((a, b) => b.normalized.length - a.normalized.length);

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function percent(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function emptyLexicon() {
  return {
    schema_version: 2,
    title: 'Lexical HUD lexicon source-layer manifest',
    scope: 'Reusable lexical entries for HUD rendering. Token occurrence files reference these entries by lexicon_entry_id.',
    import_date: new Date().toISOString().slice(0, 10),
    license_policy: 'Lexical source rows remain separately attributed. Lexical data is not part of the owner\'s CC0 English translation overlay unless a row is itself CC0 or public domain.',
    layer_files: lexicalLayerFiles,
    entries: [],
  };
}

function loadLayerEntries(manifest) {
  const entries = [];
  for (const layer of manifest.layer_files || []) {
    if (!layer.path) continue;
    const layerPath = path.join(lexicalDir, layer.path);
    if (!fs.existsSync(layerPath)) continue;
    const layerJson = readJson(layerPath);
    entries.push(...(layerJson.entries || []));
  }
  return entries;
}

function loadLexicon() {
  if (!fs.existsSync(lexiconPath)) {
    return emptyLexicon();
  }
  const lexicon = readJson(lexiconPath);
  const entries = Array.isArray(lexicon.entries) && lexicon.entries.length
    ? lexicon.entries
    : loadLayerEntries(lexicon);
  return {
    ...emptyLexicon(),
    ...lexicon,
    layer_files: lexicon.layer_files || lexicalLayerFiles,
    entries,
  };
}

function entryLayerId(entry) {
  const families = unique((entry.source_rows || []).map((row) => row.source_family || row.source_name).filter(Boolean));
  if (families.some((family) => family === 'kaikki' || family === 'wiktionary')) return 'kaikki-wiktionary-cc-by-sa-gfdl';
  if (families.length && families.every((family) => family === 'workspace')) return 'project-overrides';
  if (families.length && families.every((family) => family === 'wikidata')) return 'wikidata-cc0';
  if (families.some((family) => family === 'openscriptures')) return 'openscriptures-cc-by-4';
  return 'project-overrides';
}

function writeLexicon(lexicon) {
  const entriesByLayer = new Map(lexicalLayerFiles.map((layer) => [layer.layer_id, []]));
  for (const entry of lexicon.entries || []) {
    const layerId = entryLayerId(entry);
    if (!entriesByLayer.has(layerId)) entriesByLayer.set(layerId, []);
    entriesByLayer.get(layerId).push(entry);
  }

  for (const layer of lexicalLayerFiles) {
    const entries = (entriesByLayer.get(layer.layer_id) || [])
      .slice()
      .sort((a, b) => String(a.entry_id).localeCompare(String(b.entry_id)));
    writeCompactJson(path.join(lexicalDir, layer.path), {
      schema_version: 1,
      layer_id: layer.layer_id,
      source_family: layer.source_family,
      license: layer.license,
      status: layer.status || 'active',
      description: layer.description,
      generated_at: new Date().toISOString(),
      entries,
    });
  }

  const layerFiles = lexicalLayerFiles.map((layer) => ({
    ...layer,
    entries: (entriesByLayer.get(layer.layer_id) || []).length,
  }));

  writeJson(lexiconPath, {
    schema_version: 2,
    title: 'Lexical HUD lexicon source-layer manifest',
    scope: lexicon.scope || emptyLexicon().scope,
    import_date: lexicon.import_date || new Date().toISOString().slice(0, 10),
    generated_at: new Date().toISOString(),
    license_policy: lexicon.license_policy || emptyLexicon().license_policy,
    layer_files: layerFiles,
    entries: [],
  });
}

function ensureFixedExpressionEntries(lexicon) {
  let changed = false;
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  for (const expression of fixedExpressions) {
    const entryId = stableId('lex-expr', expression.normalized_word);
    const nextEntry = {
      entry_id: entryId,
      hebrew_word: expression.hebrew_word,
      surface_forms: expression.surface_forms,
      transliteration: '',
      strict_renderings: expression.surface_renderings,
      root: '',
      root_transliteration: '',
      root_meaning: [],
      disambiguation_status: 'likely',
      context_note: expression.surface_context_note,
      possible_entries_truncated: 0,
      possible_entries: [expression.possible_entry],
      source_rows: [expression.source_row],
    };

    const existingIndex = entries.findIndex((entry) => entry.entry_id === entryId);
    if (existingIndex >= 0) {
      if (JSON.stringify(entries[existingIndex]) !== JSON.stringify(nextEntry)) {
        entries[existingIndex] = nextEntry;
        changed = true;
      }
    } else {
      entries.push(nextEntry);
      changed = true;
    }
    expression.entry_id = entryId;
  }
  lexicon.entries = entries;
  return changed;
}

function sourceFamiliesFor(row) {
  const entry = lexiconById.get(row.lexicon_entry_id);
  return unique((entry?.source_rows || []).map((sourceRow) => sourceRow.source_family || sourceRow.source_name));
}

function renderingsFor(row) {
  const entry = lexiconById.get(row.lexicon_entry_id);
  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  const surfaceRenderings = row.surface_renderings?.length ? row.surface_renderings : null;
  return (surfaceRenderings || likely?.strict_renderings || entry?.strict_renderings || []).slice(0, 3).join(', ') || 'N/A';
}

function entryRenderings(entry) {
  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  return unique([
    ...(likely?.strict_renderings || []),
    ...(entry?.strict_renderings || []),
  ])
    .map((rendering) => String(rendering || '').trim())
    .map((rendering) => rendering.replace(/\.$/, ''))
    .filter((rendering) => {
      if (!rendering || rendering.length > 40) return false;
      if (/[()[\];]/.test(rendering)) return false;
      if (/\b(i\.e|literally|figuratively|concretely|implication|name of)\b/i.test(rendering)) return false;
      if (/\b(good|bad|properly|direct|implied|transitive|advise|appear|compare|enemy|coffee|sea|water|Mediterranean|whether|specifically|infix|hello|salutation|greeting|lust)\b/i.test(rendering)) return false;
      if (/^(to|be|being|become|became)\s+/i.test(rendering)) return false;
      if (/^(a|an|the)\s+(good|bad|sea)\b/i.test(rendering)) return false;
      if (/^[A-Z]/.test(rendering) && !/^(Torah|God|Israel|Jerusalem)\b/.test(rendering)) return false;
      return true;
    })
    .slice(0, 4);
}

function prefixPhrase(prefixes) {
  if (!prefixes.length) return [''];
  const sequence = prefixes.join('');
  const fixed = {
    ['\u05D5\u05D4']: ['and the'],
    ['\u05D5\u05D1']: ['and in', 'and with', 'and by'],
    ['\u05D5\u05DC']: ['and to', 'and for', 'and of'],
    ['\u05D5\u05DB']: ['and as', 'and like'],
    ['\u05DE\u05D4']: ['from the', 'of the'],
    ['\u05E9\u05D4']: ['that the', 'which the'],
    ['\u05D1\u05D4']: ['in the', 'with the', 'by the'],
    ['\u05DC\u05D4']: ['to the', 'for the', 'of the'],
    ['\u05DB\u05D4']: ['as the', 'like the'],
  }[sequence];
  if (fixed) return fixed;
  let phrases = [''];
  for (const prefix of prefixes) {
    const rule = prefixRules.get(prefix);
    if (!rule) return [];
    const next = [];
    for (const phrase of phrases) {
      for (const rendering of rule.renderings) {
        next.push(`${phrase} ${rendering}`.trim());
      }
    }
    phrases = next.slice(0, 6);
  }
  return phrases;
}

function stripLeadingEnglishArticle(value) {
  return String(value || '').replace(/^(a|an|the)\s+/i, '');
}

function combineSurfaceRenderings(prefixes, baseRenderings, suffix) {
  const prefixPhrases = prefixPhrase(prefixes);
  const suffixRenderings = suffix?.renderings || [];
  const results = [];
  for (const base of baseRenderings) {
    const baseText = String(base || '').trim();
    if (!baseText) continue;
    const basePhraseOptions = suffixRenderings.length
      ? suffixRenderings.map((suffixRendering) => `${suffixRendering} ${baseText}`.trim())
      : [baseText];
    for (const prefix of prefixPhrases) {
      for (const basePhrase of basePhraseOptions) {
        const baseForPrefix = /\bthe$/i.test(prefix) ? stripLeadingEnglishArticle(basePhrase) : basePhrase;
        const phrase = prefix ? `${prefix} ${baseForPrefix}` : basePhrase;
        results.push(phrase);
        if (results.length >= 8) return unique(results);
      }
    }
  }
  return unique(results).slice(0, 8);
}

function getPrefixSequences(normalized) {
  const sequences = [''];
  for (let length = 1; length <= 2 && length < normalized.length; length += 1) {
    const sequence = normalized.slice(0, length);
    if (acceptedPrefixSequences.has(sequence)) sequences.push(sequence);
  }
  return sequences.sort((a, b) => b.length - a.length);
}

function analyzeAffixSurfaceForm(surfaceWord, normalizedWord) {
  if (!normalizedWord || normalizedWord.length < 3 || hasAbbreviationMark(normalizedWord)) return null;
  const attempts = [];
  for (const prefixSequence of getPrefixSequences(normalizedWord)) {
    const afterPrefix = normalizedWord.slice(prefixSequence.length);
    if (afterPrefix.length < 2) continue;
    attempts.push({ prefixSequence, suffix: null, baseNormalized: afterPrefix });
    for (const suffix of suffixRules) {
      if (!afterPrefix.endsWith(suffix.normalized)) continue;
      const baseNormalized = afterPrefix.slice(0, afterPrefix.length - suffix.normalized.length);
      if (baseNormalized.length < 3) continue;
      if (suffix.normalized.length < 2) continue;
      attempts.push({ prefixSequence, suffix, baseNormalized });
    }
  }

  for (const attempt of attempts) {
    const entryId = lexiconByNormalized.get(attempt.baseNormalized);
    if (!entryId) continue;
    if ((observedNormalizedCounts.get(attempt.baseNormalized) || 0) < 5) continue;
    const entry = lexiconById.get(entryId);
    const baseRenderings = entryRenderings(entry);
    if (!baseRenderings.length) continue;
    const prefixes = Array.from(attempt.prefixSequence);
    const surfaceRenderings = combineSurfaceRenderings(prefixes, baseRenderings, attempt.suffix);
    if (!surfaceRenderings.length) continue;
    const breakdown = [
      ...prefixes.map((prefix) => ({
        hebrew: prefixRules.get(prefix)?.hebrew || `${prefix}\u05BE`,
        strict_renderings: prefixRules.get(prefix)?.renderings || [],
      })),
      {
        hebrew: entry?.hebrew_word || attempt.baseNormalized,
        strict_renderings: baseRenderings,
      },
    ];
    if (attempt.suffix) {
      breakdown.push({
        hebrew: attempt.suffix.hebrew,
        strict_renderings: attempt.suffix.renderings,
      });
    }
    return {
      lexicon_entry_id: entryId,
      entry,
      surfaceAnalysis: {
        surface_transliteration: '',
        surface_renderings: surfaceRenderings,
        surface_context_status: 'resolved_affix_parser',
        surface_context_note: 'Resolved by conservative prefix/suffix parser using an existing base lexical entry.',
        breakdown,
      },
    };
  }
  return null;
}

function getLeadingLamedBase(surfaceWord) {
  const normalized = normalizeHebrewPunctuation(surfaceWord);
  if (!normalized.startsWith('\u05DC')) return null;
  let index = 1;
  while (index < normalized.length && /[\u0591-\u05C7]/u.test(normalized[index])) index += 1;
  const baseSurface = normalized.slice(index);
  if (!baseSurface) return null;
  return {
    prefix_surface: '\u05DC\u05B8\u05BE',
    prefix_transliteration: 'la-',
    prefix_renderings: ['to', 'for', 'toward', 'belonging-to'],
    base_surface: baseSurface,
    base_normalized: normalizeHebrewTokenWithQubutsMater(baseSurface),
  };
}

function analyzeSurfaceForm(surfaceWord, entry) {
  const fixedExpression = fixedExpressionByNormalized.get(normalizeHebrewToken(surfaceWord));
  if (fixedExpression) {
    return {
      surface_transliteration: '',
      surface_renderings: fixedExpression.surface_renderings,
      surface_context_status: fixedExpression.surface_context_status,
      surface_context_note: fixedExpression.surface_context_note,
      breakdown: fixedExpression.breakdown,
    };
  }

  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  const lamed = getLeadingLamedBase(surfaceWord);
  if (!likely || !lamed) return null;

  const likelyLemmaNormal = normalizeHebrewTokenWithQubutsMater(likely.lemma || '');
  const possibleEntries = entry?.possible_entries || [];
  const baseRenderings = unique([
    ...(likely.strict_renderings || []),
    ...possibleEntries
      .filter((possibleEntry) => normalizeHebrewTokenWithQubutsMater(possibleEntry.lemma || '') === lamed.base_normalized)
      .flatMap((possibleEntry) => possibleEntry.strict_renderings || []),
  ]);
  const hasNation = likelyLemmaNormal === '\u05D0\u05D5\u05DE\u05D4'
    || lamed.base_normalized === '\u05D0\u05D5\u05DE\u05D4'
    || baseRenderings.some((rendering) => /nation|people/i.test(rendering));

  if (!hasNation) return null;

  return {
    surface_transliteration: 'la-ummah',
    surface_renderings: [
      'to the nation',
      'for the nation',
      'belonging to the nation',
      'of the nation',
    ],
    surface_context_status: 'resolved_prefix_base',
    surface_context_note: 'Resolved as lamed prefix plus the likely base lemma.',
    breakdown: [
      {
        hebrew: lamed.prefix_surface,
        transliteration: lamed.prefix_transliteration,
        strict_renderings: lamed.prefix_renderings,
      },
      {
        hebrew: lamed.base_surface,
        transliteration: 'ummah',
        strict_renderings: ['nation', 'people'],
      },
    ],
  };
}

function formatMatchedSample(row) {
  const families = sourceFamiliesFor(row).join(' + ') || 'source metadata available';
  return `${row.surface_word} -> ${renderingsFor(row)} (${families}) -- ${row.first_source_ref} (#${row.first_anchor_id})`;
}

function formatUnmatchedSample(row) {
  return `${row.surface_word} -- ${row.first_source_ref} (#${row.first_anchor_id})`;
}

const lexicon = loadLexicon();
const lexiconChanged = ensureFixedExpressionEntries(lexicon);
writeLexicon(lexicon);
const lexiconByNormalized = new Map();
const lexiconById = new Map((lexicon.entries || []).map((entry) => [entry.entry_id, entry]));
for (const expression of fixedExpressions) {
  lexiconByNormalized.set(expression.normalized_word, expression.entry_id);
}
for (const entry of lexicon.entries || []) {
  const forms = [entry.hebrew_word, ...(entry.surface_forms || [])].filter(Boolean);
  for (const form of forms) {
    const normalized = normalizeHebrewToken(form);
    if (normalized && !lexiconByNormalized.has(normalized)) {
      lexiconByNormalized.set(normalized, entry.entry_id);
    }
  }
}

fs.mkdirSync(occurrencesDir, { recursive: true });
for (const oldFile of fs.readdirSync(occurrencesDir).filter((name) => name.endsWith('.json'))) {
  fs.unlinkSync(path.join(occurrencesDir, oldFile));
}

const tokenRows = new Map();
const sourceFiles = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).sort();
const observedNormalizedCounts = new Map();

for (const fileName of sourceFiles) {
  const source = readJson(path.join(sourceDir, fileName));
  if (source.work_id !== lexicalScope.work_id) continue;
  for (const unit of source.units || []) {
    for (const paragraph of unit.hebrew || []) {
      for (const surfaceWord of getTokens(paragraph)) {
        const normalizedWord = normalizeHebrewToken(surfaceWord);
        if (!normalizedWord) continue;
        observedNormalizedCounts.set(
          normalizedWord,
          (observedNormalizedCounts.get(normalizedWord) || 0) + 1,
        );
      }
    }
  }
}

let totalOccurrences = 0;
let totalUnits = 0;
let directMatchedUnique = 0;
let affixResolvedUnique = 0;

for (const fileName of sourceFiles) {
  const source = readJson(path.join(sourceDir, fileName));
  if (source.work_id !== lexicalScope.work_id) continue;

  const occurrenceUnits = {};
  let workOccurrences = 0;

  for (const unit of source.units || []) {
    totalUnits += 1;
    let unitOrdinal = 0;
    const paragraphs = [];

    for (let paragraphIndex = 0; paragraphIndex < (unit.hebrew || []).length; paragraphIndex += 1) {
      const rawParagraph = String(unit.hebrew[paragraphIndex] || '');
      const tokenIndexIds = [];
      for (const surfaceWord of getTokens(rawParagraph)) {
        unitOrdinal += 1;
        totalOccurrences += 1;
        workOccurrences += 1;

        const normalizedWord = normalizeHebrewToken(surfaceWord);
        const tokenIndexId = stableId('tok', surfaceWord);
        const directLexiconEntryId = lexiconByNormalized.get(normalizedWord) || '';
        let lexiconEntryId = directLexiconEntryId;
        let entry = lexiconEntryId ? lexiconById.get(lexiconEntryId) : null;
        let surfaceAnalysis = entry ? analyzeSurfaceForm(surfaceWord, entry) : null;
        let matchMethod = lexiconEntryId ? 'direct' : 'unmatched';

        if (!lexiconEntryId) {
          const affixAnalysis = analyzeAffixSurfaceForm(surfaceWord, normalizedWord);
          if (affixAnalysis) {
            lexiconEntryId = affixAnalysis.lexicon_entry_id;
            entry = affixAnalysis.entry;
            surfaceAnalysis = affixAnalysis.surfaceAnalysis;
            matchMethod = 'affix_parser';
          }
        }

        const status = lexiconEntryId ? 'matched' : 'unmatched';

        if (!tokenRows.has(tokenIndexId)) {
          if (matchMethod === 'direct') directMatchedUnique += 1;
          if (matchMethod === 'affix_parser') affixResolvedUnique += 1;
          tokenRows.set(tokenIndexId, {
            token_index_id: tokenIndexId,
            surface_word: surfaceWord,
            normalized_word: normalizedWord,
            lexicon_entry_id: lexiconEntryId,
            status,
            match_method: matchMethod,
            surface_transliteration: surfaceAnalysis?.surface_transliteration || '',
            surface_renderings: surfaceAnalysis?.surface_renderings || [],
            surface_context_status: surfaceAnalysis?.surface_context_status || '',
            surface_context_note: surfaceAnalysis?.surface_context_note || '',
            breakdown: surfaceAnalysis?.breakdown || [],
            first_source_ref: unit.source_ref,
            first_anchor_id: unit.anchor_id,
            occurrence_count: 0,
          });
        }
        tokenRows.get(tokenIndexId).occurrence_count += 1;

        tokenIndexIds.push(tokenIndexId);
      }

      paragraphs.push({
        paragraph_index: paragraphIndex,
        token_index_ids: tokenIndexIds,
      });
    }

    occurrenceUnits[unit.unit_id] = {
      unit_id: unit.unit_id,
      anchor_id: unit.anchor_id,
      source_ref: unit.source_ref,
      paragraphs,
    };
  }

  writeJson(path.join(occurrencesDir, `${source.work_id}.json`), {
    schema_version: 1,
    work_id: source.work_id,
    work_title: source.work_title,
    work_slug: source.work_slug,
    scope_label: lexicalScope.label,
    generated_at: new Date().toISOString(),
    total_occurrences: workOccurrences,
    units: occurrenceUnits,
  });
}

const forms = Array.from(tokenRows.values()).sort((a, b) => {
  const normalized = a.normalized_word.localeCompare(b.normalized_word, 'he');
  if (normalized !== 0) return normalized;
  return a.surface_word.localeCompare(b.surface_word, 'he');
});

const matchedForms = forms.filter((row) => row.status === 'matched');
const unmatchedForms = forms.filter((row) => row.status !== 'matched');
const directMatchedForms = matchedForms.filter((row) => row.match_method === 'direct');
const affixResolvedForms = matchedForms.filter((row) => row.match_method === 'affix_parser');
const wikidataMatchedForms = matchedForms.filter((row) => sourceFamiliesFor(row).includes('wikidata'));
const openScripturesMatchedForms = matchedForms.filter((row) => sourceFamiliesFor(row).includes('openscriptures'));

writeJson(tokenIndexPath, {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source_dir: sourceDir,
  scope: lexicalScope,
  normalization_policy: {
    geresh: "ASCII apostrophe after Hebrew letters is normalized to Hebrew geresh U+05F3 for display/indexing.",
    gershayim: "ASCII double quote between Hebrew letters is normalized to Hebrew gershayim U+05F4 for display/indexing.",
    niqqud: 'Hebrew combining marks are stripped from normalized_word.',
    final_letters: 'Final kaf/mem/nun/pe/tsadi are normalized to medial forms in normalized_word.',
    surface_word: 'surface_word preserves the displayed source token apart from safe geresh normalization.',
  },
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_unique_surface_forms: forms.length,
  direct_matched_surface_forms: directMatchedForms.length,
  newly_resolved_affix_surface_forms: affixResolvedForms.length,
  matched_surface_forms: matchedForms.length,
  matched_wikidata_surface_forms: wikidataMatchedForms.length,
  enriched_openscriptures_surface_forms: openScripturesMatchedForms.length,
  unmatched_surface_forms: unmatchedForms.length,
  forms,
});

const matchedSamples = matchedForms.filter((row) => renderingsFor(row) !== 'N/A').slice(0, 20).map(formatMatchedSample);
const affixSamples = affixResolvedForms
  .filter((row) => renderingsFor(row) !== 'N/A')
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.surface_word.localeCompare(b.surface_word, 'he'))
  .slice(0, 20)
  .map(formatMatchedSample);
const unmatchedSamples = unmatchedForms
  .filter((row) => row.normalized_word.length > 2 && !/[\u05F3\u05F4'"]/.test(row.normalized_word))
  .slice(0, 20)
  .map(formatUnmatchedSample);
const topRemainingUnmatched = unmatchedForms
  .slice()
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.surface_word.localeCompare(b.surface_word, 'he'))
  .slice(0, 50)
  .map((row) => `${row.occurrence_count}x ${formatUnmatchedSample(row)}`);
const testRefs = [
  'Orot, Lights from Darkness, Land of Israel 1:1',
  'Orot, Lights from Darkness, War 1:1',
  'Orot, Lights from Darkness, Lights of Rebirth 70:5',
];

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `# Orot Lexical Coverage Report

Generated: ${new Date().toISOString()}

## Scope

- Work: Orot only
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: existing local lexical cache generated from Wikidata Lexemes first; OpenScriptures morphHB + HebrewLexicon as fallback/enrichment
- Sources not used: Kaikki, Wiktionary, copyrighted translations
- New parser: conservative prefix/suffix parser; accepts only when the remaining base is already present in the approved local lexical layer
- Count source: generated HUD token index, which is the page-render source of truth
- Payload: Orot lexical details are externalized through data/lexical/orot.manifest.json and data/lexical/orot-chunks/

## Counts

- Total Orot unique surface forms: ${forms.length}
- Total Orot token occurrences: ${totalOccurrences}
- Matched before prefix/suffix parser: ${directMatchedForms.length}
- Newly resolved by prefix/suffix parser: ${affixResolvedForms.length}
- Total matched after parser: ${matchedForms.length}
- Percent matched: ${percent(matchedForms.length, forms.length)}
- Matched via Wikidata: ${wikidataMatchedForms.length}
- Enriched via OpenScriptures: ${openScripturesMatchedForms.length}
- Unmatched: ${unmatchedForms.length}

## Newly Resolved Parsed Forms

${formatList(affixSamples)}

## Sample Matched Words With Refs To Test

${formatList(matchedSamples)}

## Sample Unmatched Words

${formatList(unmatchedSamples)}

## Top 50 Remaining Unmatched By Frequency

${formatList(topRemainingUnmatched)}

## Exact Orot Refs To Test

${formatList(testRefs)}
`, 'utf8');

console.log(JSON.stringify({
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_unique_surface_forms: forms.length,
  direct_matched_surface_forms: directMatchedForms.length,
  newly_resolved_affix_surface_forms: affixResolvedForms.length,
  matched_surface_forms: matchedForms.length,
  matched_wikidata_surface_forms: wikidataMatchedForms.length,
  enriched_openscriptures_surface_forms: openScripturesMatchedForms.length,
  unmatched_surface_forms: unmatchedForms.length,
}, null, 2));
