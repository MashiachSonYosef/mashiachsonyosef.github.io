import fs from 'node:fs';
import path from 'node:path';

const sourceDir = 'data/sources';
const lexicalDir = 'data/lexical';
const siteRoot = '.';
const reportPath = 'reports/sitewide-hud-readiness-report.md';

const functionCanaries = ['את', 'כי', 'על', 'לא', 'הוא', 'אשר', 'מן', 'כל', 'אם', 'אין'];
const formulaCanaries = ['ד״א', 'זש״ה', 'שנאמר', 'כתיב', 'וגומר', 'א״ר', 'א״ל'];
const badParserNeedles = [
  'from of',
  'in of',
  'with of',
  'by of',
  'the not',
  'the no',
  'clear liquid H',
  'dotted with a segol',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeUtf8(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function percent(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function getGroup(source) {
  const slug = String(source.work_slug || '');
  const first = slug.split(/[\\/]/).filter(Boolean)[0] || '';
  if (first === 'tanakh') return 'Tanakh';
  if (first === 'midrash') return 'Midrash / Aggadah';
  if (first === 'rav-kook' || source.work_id === 'orot') return 'Rav Kook School';
  if (first === 'gra') return 'Gra School';
  if (first === 'ari') return 'Ari / Kabbalah';
  if (first === 'talmud') return 'Talmud / Commentary';
  return 'Other';
}

function isMidrash(source) {
  const slug = String(source.work_slug || '').toLowerCase();
  const title = String(source.work_title || '').toLowerCase();
  return slug.startsWith('midrash/') || title.includes('midrash') || title.includes('rabbah') || title.includes('pesikta') || title.includes('sifrei') || title.includes('sifra');
}

function sourcePathFor(source) {
  const candidates = [
    path.join(sourceDir, `${source.work_id}.json`),
    path.join(sourceDir, `${String(source.work_slug || '').replace(/[\\/]/g, '-')}.json`),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || '';
}

function indexPathFor(row) {
  return path.join(lexicalDir, row.path || '');
}

function pagePathFor(source) {
  return path.join(siteRoot, String(source.work_slug || ''), 'index.html');
}

function manifestPathFor(source) {
  return path.join(lexicalDir, `${source.work_id}.manifest.json`);
}

function chunkDirFor(source) {
  return path.join(lexicalDir, `${source.work_id}-chunks`);
}

function loadSources() {
  return fs.readdirSync(sourceDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson(path.join(sourceDir, file)))
    .sort((a, b) => String(a.work_title || '').localeCompare(String(b.work_title || '')));
}

function loadLayerEntries() {
  const manifest = readJson(path.join(lexicalDir, 'lexicon.json'));
  const entries = new Map();
  const sourceRows = new Map();
  for (const layer of manifest.layer_files || []) {
    if (!layer.path) continue;
    const layerPath = path.join(lexicalDir, layer.path);
    if (!fs.existsSync(layerPath)) continue;
    const json = readJson(layerPath);
    for (const entry of json.entries || []) {
      entries.set(entry.entry_id, { ...entry, _layer_id: layer.layer_id, _layer_license: layer.license, _layer_path: layer.path });
      for (const row of entry.source_rows || []) {
        sourceRows.set(`${entry.entry_id}|${row.source_family || ''}|${row.source_id || ''}`, row);
      }
    }
  }
  return { entries, sourceRows };
}

function hasUsableSourceRows(entry) {
  const rows = entry?.source_rows || [];
  return rows.some((row) => row.source_name && row.source_id && row.license);
}

function canaryStatus(formsBySurface, canaries) {
  return canaries.map((word) => {
    const row = formsBySurface.get(word);
    if (!row) return `${word}:absent`;
    if (row.status === 'matched' && row.lexicon_entry_id) return `${word}:ok`;
    return `${word}:miss`;
  });
}

function summarizeCanaries(statuses) {
  const missed = statuses.filter((item) => item.endsWith(':miss'));
  const absent = statuses.filter((item) => item.endsWith(':absent'));
  if (!missed.length && !absent.length) return 'all ok';
  return [...missed, ...absent].join(', ');
}

function chunkStats(source) {
  const dir = chunkDirFor(source);
  if (!fs.existsSync(dir)) return { count: 0, largest: 0, largestFile: '' };
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));
  let largest = 0;
  let largestFile = '';
  for (const file of files) {
    const size = fs.statSync(path.join(dir, file)).size;
    if (size > largest) {
      largest = size;
      largestFile = file;
    }
  }
  return { count: files.length, largest, largestFile };
}

function badParserRows(forms) {
  return forms.filter((row) => {
    if (row.match_method !== 'affix_parser') return false;
    const haystack = [
      ...(row.surface_renderings || []),
      ...(row.breakdown || []).flatMap((part) => part.strict_renderings || []),
    ].join(' ').toLowerCase();
    return badParserNeedles.some((needle) => haystack.includes(needle.toLowerCase()));
  });
}

function topUnmatched(forms, limit = 12) {
  return forms
    .filter((row) => row.status !== 'matched' || !row.lexicon_entry_id)
    .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0))
    .slice(0, limit)
    .map((row) => `${row.surface_word} (${row.occurrence_count || 0})`)
    .join(', ');
}

function readinessFor({ source, index, forms, formsBySurface, missingSourceRows, badRows, staleFunctionMisses, formulaStatuses, chunks, pageSize }) {
  const matched = index.matched_surface_forms || 0;
  const unique = index.total_unique_surface_forms || forms.length || 0;
  const pct = unique ? (matched / unique) * 100 : 0;
  if (badRows.length || missingSourceRows > 0) return 'fix HUD integrity';
  if (staleFunctionMisses.length) return 'repair stale cache/wiring';
  if (isMidrash(source) && formulaStatuses.some((item) => item.endsWith(':miss'))) return 'needs Midrash formula layer';
  if (pct >= 70) return 'ready/hardened';
  if (pct >= 35) return 'usable; content coverage remains';
  if (chunks.count === 0 || pageSize === 0) return 'pipeline missing';
  return 'low coverage; leave until family pass';
}

function main() {
  const sources = loadSources();
  const tokenManifest = readJson(path.join(lexicalDir, 'token-index.json'));
  const workIndexRows = new Map((tokenManifest.work_indexes || []).map((row) => [row.work_id, row]));
  const { entries } = loadLayerEntries();
  const rows = [];
  const issues = [];
  const ready = [];
  const familyStats = new Map();

  for (const source of sources) {
    const manifestRow = workIndexRows.get(source.work_id);
    const indexPath = manifestRow ? indexPathFor(manifestRow) : '';
    if (!manifestRow || !fs.existsSync(indexPath)) {
      issues.push({ work: source.work_title, issue: 'missing token index', detail: indexPath || 'no manifest row' });
      continue;
    }

    const index = readJson(indexPath);
    const forms = index.forms || [];
    const formsBySurface = new Map(forms.map((row) => [row.surface_word, row]));
    const fnStatuses = canaryStatus(formsBySurface, functionCanaries);
    const formulaStatuses = isMidrash(source) ? canaryStatus(formsBySurface, formulaCanaries) : [];
    const staleFunctionMisses = fnStatuses.filter((item) => item.endsWith(':miss'));
    const badRows = badParserRows(forms);
    let missingSourceRows = 0;
    let sourceBackedMatched = 0;

    for (const row of forms) {
      if (row.status !== 'matched' || !row.lexicon_entry_id) continue;
      const entry = entries.get(row.lexicon_entry_id);
      if (!entry || !hasUsableSourceRows(entry)) {
        missingSourceRows += 1;
      } else {
        sourceBackedMatched += 1;
      }
    }

    const chunks = chunkStats(source);
    const pageSize = fileSize(pagePathFor(source));
    const group = getGroup(source);
    const summary = {
      work_id: source.work_id,
      title: source.work_title,
      group,
      unique: index.total_unique_surface_forms || forms.length || 0,
      matched: index.matched_surface_forms || 0,
      unmatched: index.unmatched_surface_forms || 0,
      occurrences: index.total_occurrences || 0,
      matchedPct: percent(index.matched_surface_forms || 0, index.total_unique_surface_forms || forms.length || 0),
      functionCanaries: summarizeCanaries(fnStatuses),
      formulaCanaries: formulaStatuses.length ? summarizeCanaries(formulaStatuses) : 'n/a',
      missingSourceRows,
      sourceBackedMatched,
      badParserCount: badRows.length,
      badParserExamples: badRows.slice(0, 5).map((row) => `${row.surface_word}: ${(row.surface_renderings || []).join('/')}`).join('; '),
      chunks,
      pageSize,
      topUnmatched: topUnmatched(forms),
    };
    summary.readiness = readinessFor({
      source,
      index,
      forms,
      formsBySurface,
      missingSourceRows,
      badRows,
      staleFunctionMisses,
      formulaStatuses,
      chunks,
      pageSize,
    });
    rows.push(summary);
    if (summary.readiness === 'ready/hardened') ready.push(summary);
    if (!familyStats.has(group)) {
      familyStats.set(group, { works: 0, unique: 0, matched: 0, unmatched: 0, occurrences: 0, badParser: 0, missingSourceRows: 0 });
    }
    const family = familyStats.get(group);
    family.works += 1;
    family.unique += summary.unique;
    family.matched += summary.matched;
    family.unmatched += summary.unmatched;
    family.occurrences += summary.occurrences;
    family.badParser += summary.badParserCount;
    family.missingSourceRows += summary.missingSourceRows;
  }

  rows.sort((a, b) => {
    const priority = (row) => {
      if (row.readiness === 'fix HUD integrity') return 0;
      if (row.readiness === 'repair stale cache/wiring') return 1;
      if (row.readiness === 'needs Midrash formula layer') return 2;
      if (row.readiness === 'pipeline missing') return 3;
      return 4;
    };
    return priority(a) - priority(b) || (b.occurrences - a.occurrences) || a.title.localeCompare(b.title);
  });

  const generatedAt = new Date().toISOString();
  const lines = [];
  lines.push('# Sitewide HUD Readiness Report');
  lines.push('');
  lines.push(`Generated: ${generatedAt}`);
  lines.push('');
  lines.push('This report is diagnostic only. It does not import sources, add definitions, or change lexical ranking.');
  lines.push('');
  lines.push('## Global Summary');
  lines.push('');
  const totals = Array.from(familyStats.values()).reduce((acc, stat) => {
    for (const key of ['works', 'unique', 'matched', 'unmatched', 'occurrences', 'badParser', 'missingSourceRows']) acc[key] += stat[key] || 0;
    return acc;
  }, { works: 0, unique: 0, matched: 0, unmatched: 0, occurrences: 0, badParser: 0, missingSourceRows: 0 });
  lines.push(`- Works scanned: ${totals.works}`);
  lines.push(`- Unique work-surface rows: ${totals.unique}`);
  lines.push(`- Matched: ${totals.matched} (${percent(totals.matched, totals.unique)})`);
  lines.push(`- Unmatched: ${totals.unmatched}`);
  lines.push(`- Token occurrences: ${totals.occurrences}`);
  lines.push(`- Rows with missing source/license metadata: ${totals.missingSourceRows}`);
  lines.push(`- Suspect parser rows: ${totals.badParser}`);
  lines.push('');
  lines.push('## Family Summary');
  lines.push('');
  lines.push('| Family | Works | Matched | Unmatched | Coverage | Occurrences | Missing source rows | Suspect parser rows |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const [family, stat] of Array.from(familyStats.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`| ${escapeCell(family)} | ${stat.works} | ${stat.matched} | ${stat.unmatched} | ${percent(stat.matched, stat.unique)} | ${stat.occurrences} | ${stat.missingSourceRows} | ${stat.badParser} |`);
  }
  lines.push('');
  lines.push('## Priority Queue');
  lines.push('');
  lines.push('| Work | Family | Coverage | Function canaries | Formula canaries | Missing sources | Suspect parser | Largest chunk | Page | Readiness |');
  lines.push('|---|---|---:|---|---|---:|---:|---:|---:|---|');
  for (const row of rows) {
    lines.push(`| ${escapeCell(row.title)} | ${escapeCell(row.group)} | ${row.matched}/${row.unique} (${row.matchedPct}) | ${escapeCell(row.functionCanaries)} | ${escapeCell(row.formulaCanaries)} | ${row.missingSourceRows} | ${row.badParserCount} | ${escapeCell(formatBytes(row.chunks.largest))} | ${escapeCell(formatBytes(row.pageSize))} | ${escapeCell(row.readiness)} |`);
  }
  lines.push('');
  lines.push('## Top Integrity Issues');
  lines.push('');
  const integrityRows = rows.filter((row) => row.badParserCount || row.missingSourceRows).slice(0, 50);
  if (!integrityRows.length) {
    lines.push('- No missing source/license rows or suspect parser rows were detected from token-index data.');
  } else {
    for (const row of integrityRows) {
      lines.push(`- ${row.title}: missing source rows ${row.missingSourceRows}; suspect parser rows ${row.badParserCount}${row.badParserExamples ? `; examples: ${row.badParserExamples}` : ''}`);
    }
  }
  lines.push('');
  lines.push('## Stale Cache / Wiring Suspects');
  lines.push('');
  const staleRows = rows.filter((row) => row.functionCanaries.includes(':miss'));
  if (!staleRows.length) {
    lines.push('- No works had missing existing function-word canaries by exact surface form.');
  } else {
    for (const row of staleRows.slice(0, 80)) {
      lines.push(`- ${row.title}: ${row.functionCanaries}`);
    }
  }
  lines.push('');
  lines.push('## Midrash Formula Layer Candidates');
  lines.push('');
  const formulaRows = rows.filter((row) => row.group === 'Midrash / Aggadah' && row.formulaCanaries !== 'all ok' && row.formulaCanaries !== 'n/a');
  if (!formulaRows.length) {
    lines.push('- Midrash formula canaries are already applied where those exact surface forms occur.');
  } else {
    for (const row of formulaRows.slice(0, 80)) {
      lines.push(`- ${row.title}: ${row.formulaCanaries}`);
    }
  }
  lines.push('');
  lines.push('## Ready / Hardened Candidates');
  lines.push('');
  for (const row of ready.slice(0, 80)) {
    lines.push(`- ${row.title}: ${row.matched}/${row.unique} (${row.matchedPct}), largest chunk ${formatBytes(row.chunks.largest)}`);
  }
  if (!ready.length) lines.push('- None by the current threshold.');
  lines.push('');
  lines.push('## Top Remaining Unmatched By Work');
  lines.push('');
  for (const row of rows) {
    lines.push(`### ${row.title}`);
    lines.push('');
    lines.push(`- Readiness: ${row.readiness}`);
    lines.push(`- Top unmatched: ${row.topUnmatched || 'n/a'}`);
    lines.push('');
  }
  lines.push('## Missing Work Indexes');
  lines.push('');
  if (!issues.length) {
    lines.push('- None.');
  } else {
    for (const issue of issues) {
      lines.push(`- ${issue.work}: ${issue.issue} (${issue.detail})`);
    }
  }
  lines.push('');

  while (lines.at(-1) === '') lines.pop();
  writeUtf8(reportPath, `${lines.join('\n')}\n`);
  console.log(`Wrote ${reportPath}`);
  console.log(`Scanned ${totals.works} works; matched ${totals.matched}/${totals.unique}; suspect parser rows ${totals.badParser}; missing source rows ${totals.missingSourceRows}.`);
}

function fileSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
}

main();
