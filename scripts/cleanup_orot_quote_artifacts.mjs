import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const occurrencePath = path.join(lexicalDir, 'occurrences', 'orot.json');
const reportPath = path.join('reports', 'orot-quote-artifact-cleanup-report.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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

const trailingQuoteArtifactRe = /["\u05F4]+$/u;

function stripTrailingQuoteArtifact(value) {
  return String(value || '').replace(trailingQuoteArtifactRe, '');
}

function hasTrailingQuoteArtifact(value) {
  return trailingQuoteArtifactRe.test(String(value || ''));
}

function rowKey(row) {
  return `${row.surface_word || ''}|${row.normalized_word || ''}|${row.token_index_id || ''}`;
}

function main() {
  const tokenIndex = readJson(tokenIndexPath);
  const occurrences = readJson(occurrencePath);
  const forms = tokenIndex.forms || [];
  const examples = examplesByTokenId(occurrences);

  for (const row of forms) {
    if (row.match_method === 'quote_artifact_cleanup') {
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
  const bySurface = new Map();
  const byNormalized = new Map();
  for (const row of forms) {
    bySurface.set(row.surface_word, row);
    if (!byNormalized.has(row.normalized_word)) byNormalized.set(row.normalized_word, []);
    byNormalized.get(row.normalized_word).push(row);
  }

  const fixed = [];
  const skipped = [];
  for (const row of forms) {
    if (row.status === 'matched') continue;
    if (!hasTrailingQuoteArtifact(row.surface_word) && !hasTrailingQuoteArtifact(row.normalized_word)) continue;

    const strippedSurface = stripTrailingQuoteArtifact(row.surface_word);
    const strippedNormalized = stripTrailingQuoteArtifact(row.normalized_word);
    const target = bySurface.get(strippedSurface)
      || (byNormalized.get(strippedNormalized) || []).find((candidate) => candidate.status === 'matched');

    if (!target || target.status !== 'matched' || !target.lexicon_entry_id) {
      skipped.push({
        row,
        strippedSurface,
        strippedNormalized,
        reason: 'stripped token is not already resolved',
      });
      continue;
    }

    row.status = 'matched';
    row.match_method = 'quote_artifact_cleanup';
    row.lexicon_entry_id = target.lexicon_entry_id;
    row.surface_context_status = 'resolved_quote_artifact';
    row.surface_context_note = 'Resolved by removing trailing quote punctuation and using the existing lexical entry for the stripped token.';
    row.surface_renderings = Array.isArray(target.surface_renderings) ? target.surface_renderings : [];
    row.breakdown = [];
    fixed.push({
      row,
      target,
      strippedSurface,
      strippedNormalized,
    });
  }

  const afterMatched = forms.filter((row) => row.status === 'matched').length;
  tokenIndex.generated_at = new Date().toISOString();
  tokenIndex.matched_surface_forms = afterMatched;
  tokenIndex.unmatched_surface_forms = forms.length - afterMatched;
  tokenIndex.matched_quote_artifact_surface_forms = fixed.length;
  writeJson(tokenIndexPath, tokenIndex);

  const lines = [];
  lines.push('# Orot Quote Artifact Cleanup Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push('- Work: Orot only');
  lines.push('- New lexical entries added: no');
  lines.push('- New source imports: no');
  lines.push('- Rule: remove trailing ASCII double quote or Hebrew gershayim only when the stripped token already resolves through existing approved layers');
  lines.push('- Ambiguous abbreviations changed: no');
  lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Matched before cleanup: ${beforeMatched}`);
  lines.push(`- Fixed by quote/punctuation cleanup: ${fixed.length}`);
  lines.push(`- Matched after cleanup: ${afterMatched}`);
  lines.push(`- Remaining unmatched: ${forms.length - afterMatched}`);
  lines.push('');
  lines.push('## Fixed Tokens');
  lines.push('');
  lines.push('| # | Surface form | Codepoints | Stripped token | Count | Existing match method | Example refs |');
  lines.push('|---:|---|---|---|---:|---|---|');
  fixed
    .slice()
    .sort((a, b) => (b.row.occurrence_count || 0) - (a.row.occurrence_count || 0) || rowKey(a.row).localeCompare(rowKey(b.row), 'he'))
    .forEach((item, index) => {
      const refs = examples.get(item.row.token_index_id) || [item.row.first_source_ref].filter(Boolean);
      lines.push(`| ${index + 1} | ${escapeCell(item.row.surface_word)} | ${codepoints(item.row.surface_word)} | ${escapeCell(item.strippedSurface)} | ${item.row.occurrence_count || 0} | ${escapeCell(item.target.match_method)} | ${escapeCell(refs.join('; '))} |`);
    });
  lines.push('');
  lines.push('## Skipped Trailing-Quote Tokens');
  lines.push('');
  lines.push('| Surface form | Count | Reason |');
  lines.push('|---|---:|---|');
  skipped
    .slice()
    .sort((a, b) => (b.row.occurrence_count || 0) - (a.row.occurrence_count || 0) || rowKey(a.row).localeCompare(rowKey(b.row), 'he'))
    .slice(0, 50)
    .forEach((item) => {
      lines.push(`| ${escapeCell(item.row.surface_word)} | ${item.row.occurrence_count || 0} | ${escapeCell(item.reason)} |`);
    });
  lines.push('');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

  console.log(JSON.stringify({
    beforeMatched,
    fixedByQuoteArtifactCleanup: fixed.length,
    afterMatched,
    remainingUnmatched: forms.length - afterMatched,
    report: reportPath,
  }, null, 2));
}

main();
