import fs from 'node:fs';
import path from 'node:path';

const layerDir = path.join('data', 'lexical', 'source-layers');
const reportPath = path.join('reports', 'orot-opening-canary-diagnosis.md');

const canaries = [
  {
    label: 'אֶרֶץ',
    expected: 'land / earth',
    layer: 'openscriptures-cc-by-4.json',
    entry_id: 'lex-48497cac8b05',
    preferred_entry_key: 'openscriptures:H776',
    strict_renderings: ['land', 'earth'],
    reason: 'Existing OpenScriptures H776 is an exact vocalized lemma match; prior default used Wikidata country/Earth and left land secondary.',
  },
  {
    label: 'יִשְׂרָאֵל',
    expected: 'Israel',
    layer: 'openscriptures-cc-by-4.json',
    entry_id: 'lex-7810f5bcd243',
    preferred_entry_key: 'openscriptures:H3479',
    strict_renderings: ['Israel'],
    reason: 'Existing OpenScriptures H3479 supplies the plain Israel rendering; prior entry was possible-only.',
  },
  {
    label: 'דָּבָר',
    expected: 'thing / matter / word',
    layer: 'openscriptures-cc-by-4.json',
    entry_id: 'lex-3eee938058d5',
    preferred_entry_key: 'openscriptures:H1697',
    strict_renderings: ['thing', 'matter', 'word'],
    reason: 'Existing OpenScriptures H1697 matches the vocalized noun דָּבָר; prior homographs stayed possible-only.',
  },
  {
    label: 'חִיצוֹנִי',
    expected: 'external / outer',
    layer: 'wikidata-cc0.json',
    entry_id: 'lex-9aea7f99d57c',
    preferred_entry_key: 'wikidata:L210877',
    strict_renderings: ['external', 'exterior'],
    reason: 'Existing Wikidata L210877 is the exact חיצוני lexical entry; prior entry was possible-only behind חיצון.',
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, 'utf8');
}

function codepoints(value) {
  return Array.from(String(value || ''), (char) => char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

function renderings(entry) {
  const likely = (entry.possible_entries || []).find((candidate) => candidate.context_role === 'likely_contextual');
  return (entry.strict_renderings?.length ? entry.strict_renderings : likely?.strict_renderings || []).join('; ') || 'N/A';
}

const beforeRows = [];
const afterRows = [];

for (const canary of canaries) {
  const filePath = path.join(layerDir, canary.layer);
  const layer = readJson(filePath);
  const entry = (layer.entries || []).find((item) => item.entry_id === canary.entry_id);
  if (!entry) throw new Error(`Entry not found for ${canary.label}: ${canary.entry_id}`);

  const beforeLikely = (entry.possible_entries || []).find((candidate) => candidate.context_role === 'likely_contextual');
  beforeRows.push({
    label: canary.label,
    codepoints: codepoints(canary.label),
    layer: canary.layer,
    status: beforeLikely ? `likely ${beforeLikely.entry_key}` : 'possible-only or unresolved',
    renderings: renderings(entry),
  });

  let found = false;
  entry.possible_entries = (entry.possible_entries || []).map((candidate) => {
    if (candidate.entry_key !== canary.preferred_entry_key) {
      return {
        ...candidate,
        context_role: 'other_possible',
        relation_label: 'other possible entry',
      };
    }
    found = true;
    return {
      ...candidate,
      strict_renderings: canary.strict_renderings,
      context_role: 'likely_contextual',
      relation_label: '',
    };
  });
  if (!found) throw new Error(`Preferred source candidate not found for ${canary.label}: ${canary.preferred_entry_key}`);

  entry.strict_renderings = canary.strict_renderings;
  entry.disambiguation_status = 'likely';
  entry.context_note = `Resolved for the Orot opening canary from an existing approved lexical source. ${canary.reason}`;

  const afterLikely = entry.possible_entries.find((candidate) => candidate.context_role === 'likely_contextual');
  afterRows.push({
    label: canary.label,
    codepoints: codepoints(canary.label),
    layer: canary.layer,
    status: `likely ${afterLikely.entry_key}`,
    renderings: renderings(entry),
    reason: canary.reason,
  });

  layer.generated_at = new Date().toISOString();
  writeJson(filePath, layer);
}

const lines = [];
lines.push('# Orot 1:1 Opening Canary Diagnosis');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Scope');
lines.push('');
lines.push('- Phrase: אֶרֶץ יִשְׂרָאֵל אֵינֶנָּהּ דָּבָר חִיצוֹנִי');
lines.push('- New broad vocabulary added: no');
lines.push('- New external sources imported: no');
lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
lines.push('- Closed-class grammar rule added separately for אֵינֶנָּהּ in the build script.');
lines.push('');
lines.push('## Source-Layer Promotions');
lines.push('');
lines.push('| Token | Codepoints | Layer | Before | After | Renderings | Reason |');
lines.push('|---|---|---|---|---|---|---|');
for (const row of afterRows) {
  const before = beforeRows.find((item) => item.label === row.label);
  lines.push(`| ${row.label} | ${row.codepoints} | ${row.layer} | ${before.status} | ${row.status} | ${row.renderings} | ${row.reason} |`);
}
lines.push('');
lines.push('## Grammar Canary');
lines.push('');
lines.push('| Token | Codepoints | Layer | Resolution | Renderings |');
lines.push('|---|---|---|---|---|');
lines.push(`| אֵינֶנָּהּ | ${codepoints('אֵינֶנָּהּ')} | project-overrides.json | Workspace closed-class grammar form | is not; is not it; is not her |`);
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

console.log(JSON.stringify({
  source_layer_promotions: afterRows.length,
  grammar_rule: 'אֵינֶנָּהּ',
  report: reportPath,
}, null, 2));
