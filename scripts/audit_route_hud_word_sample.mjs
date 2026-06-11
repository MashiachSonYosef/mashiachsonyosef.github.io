#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  pages: [
    'tanakh/genesis/index.html',
    'tanakh/ibn-ezra-on-genesis/index.html',
    'orot/index.html',
  ],
  maxTokensPerPage: 160,
  manifest: 'data/definitions/hud-route-lookup/manifest.json',
  report: 'reports/agent5-route-hud-word-sample-audit.md',
  json: 'reports/agent5-route-hud-word-sample-audit.json',
};

const options = parseArgs(process.argv.slice(2));
const manifest = readJson(options.manifest);
const shardCache = new Map();
const results = [];
const routeSectionRank = new Map([
  ['strict_hebrew', 0],
  ['strict_aramaic', 1],
  ['morphology', 2],
  ['lemma', 3],
  ['subphrase_evidence', 4],
  ['biblical_paraphrase_evidence', 5],
  ['citable_paraphrase_evidence', 6],
  ['usage_evidence', 7],
  ['phrase_evidence', 8],
  ['audit', 9],
]);
const answerCandidateSections = new Set(['strict_hebrew', 'strict_aramaic', 'morphology', 'lemma', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence']);

for (const page of options.pages) {
  if (!fs.existsSync(path.join(root, page))) {
    results.push({
      page,
      issue: 'missing_page',
      severity: 'error',
      detail: 'Page does not exist.',
    });
    continue;
  }
  auditPage(page);
}

const summary = summarize(results);
writeJson(options.json, { generated_at: new Date().toISOString(), options, summary, results });
writeReport(options.report, summary, results);

const issueCount = results.filter((row) => row.severity === 'error').length;
console.log(JSON.stringify({
  pages: options.pages.length,
  rows: results.length,
  errors: issueCount,
  warnings: results.filter((row) => row.severity === 'warning').length,
  report: cleanRelativePath(options.report),
}, null, 2));

function auditPage(page) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const paragraphs = [...html.matchAll(/<p\b[^>]*class="[^"]*\bhebrew\b[^"]*\blexical-inline\b[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)];
  const tokenRows = [];
  const fragmentRows = [];
  for (const [paragraphIndex, match] of paragraphs.entries()) {
    const innerHtml = match[1];
    const strippedText = htmlToText(innerHtml);
    const strippedTokens = tokenizeHebrewText(strippedText, true);
    const runtimeSegments = textSegments(innerHtml);
    const runtimeTokens = runtimeSegments.flatMap((segment) => tokenizeHebrewText(htmlToText(segment), false));
    if (strippedTokens.length !== runtimeTokens.length) {
      const tokenDiff = tokenWindowDiff(strippedTokens, runtimeTokens);
      fragmentRows.push({
        page,
        severity: 'error',
        issue: 'split_token_mismatch',
        paragraph_index: paragraphIndex,
        source_text: compactText(strippedText),
        detail: `Markup-stripped token count ${strippedTokens.length} differs from runtime text-node token count ${runtimeTokens.length}.`,
        ...tokenDiff,
        stripped_tokens: strippedTokens.slice(0, 16).map((token) => token.surface),
        runtime_tokens: runtimeTokens.slice(0, 16).map((token) => token.surface),
      });
    } else if (hasInlineHebrewMarkup(innerHtml)) {
      const mismatched = strippedTokens.find((token, index) => token.surface !== runtimeTokens[index]?.surface);
      if (mismatched) {
        const tokenDiff = tokenWindowDiff(strippedTokens, runtimeTokens);
        fragmentRows.push({
          page,
          severity: 'error',
          issue: 'split_token_boundary',
          paragraph_index: paragraphIndex,
          source_text: compactText(strippedText),
          detail: `Runtime token ${runtimeTokens[strippedTokens.indexOf(mismatched)]?.surface || ''} differs from whole-token ${mismatched.surface}.`,
          ...tokenDiff,
          stripped_tokens: strippedTokens.slice(0, 16).map((token) => token.surface),
          runtime_tokens: runtimeTokens.slice(0, 16).map((token) => token.surface),
        });
      }
    }
    if (options.maxTokensPerPage > 0) {
      tokenRows.push(...strippedTokens.map((token, index) => ({
        ...token,
        page,
        paragraph_index: paragraphIndex,
        token_index: tokenRows.length + index,
        context: compactText(strippedText),
      })));
    }
  }

  results.push(...fragmentRows.slice(0, 20));
  if (options.maxTokensPerPage <= 0) return;
  const selectedTokens = selectTokens(tokenRows, options.maxTokensPerPage);
  for (const token of selectedTokens) {
    auditToken(token);
  }
}

function auditToken(token) {
  const candidates = lookupCandidatesFor(token.surface, token.normalized);
  const cards = [];
  for (const candidate of candidates) {
    for (const card of loadRouteCards(candidate.key)) {
      cards.push({ ...card, lookup_key: candidate.key, lookup_relation: candidate.relation, lookup_penalty: candidate.penalty });
    }
  }
  const uniqueCards = uniqueCardsByIdAndLookup(cards);
  const answer = selectRouteAnswer(uniqueCards);
  const exactCards = uniqueCards.filter((card) => (card.lookup_relation || 'exact') === 'exact');
  const answerCards = uniqueCards.filter(isAnswerEligibleCard);

  if (!uniqueCards.length) {
    addIssue(token, 'warning', 'no_route_cards', 'No route cards were found for exact/prefix/suffix/maqaf lookup candidates.', { candidates });
    return;
  }

  if (token.hasMaqaf) {
    addIssue(token, 'info', 'maqaf_compound_lookup_note', 'Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.', { candidates });
  }

  if (answer.answerState === 'ambiguous') {
    addIssue(token, 'warning', 'ambiguous_answer_slot', `Answer slot suppresses definition because ${answer.ambiguityCount} close answer meanings compete.`, {
      answer_candidates: answerCards.slice(0, 5).map(compactCard),
    });
  }

  if (answer.answerState === 'none' && exactCards.length) {
    addIssue(token, 'warning', 'evidence_without_answer', 'Exact route cards exist, but none are answer-eligible for the definition slot.', {
      exact_cards: exactCards.slice(0, 5).map(compactCard),
    });
  }

  if (answer.answerCard) {
    const renderings = routeRenderings(answer.answerCard);
    if (!renderings.length) {
      addIssue(token, 'error', 'answer_without_rendering', 'Selected answer card has no rendering text.', { answer: compactCard(answer.answerCard) });
    }
    if (!Array.isArray(answer.answerCard.source_rows) || !answer.answerCard.source_rows.length) {
      addIssue(token, 'error', 'answer_without_sources', 'Selected answer card has no source_rows.', { answer: compactCard(answer.answerCard) });
    } else {
      const incompleteRows = answer.answerCard.source_rows.filter((row) => !publicSourceRow(row));
      if (incompleteRows.length) {
        addIssue(token, 'error', 'answer_source_row_missing_public_fields', 'Selected answer card has source rows missing source_name, source_id, or license display fields.', {
          answer: compactCard(answer.answerCard),
          source_rows: incompleteRows.slice(0, 5).map((row) => ({
            source_name: row.source_name || '',
            source_id: row.source_id || '',
            license: displayLicense(row),
          })),
        });
      }
    }
    if ((answer.answerCard.lookup_relation || 'exact') !== 'exact') {
      addIssue(token, 'warning', 'non_exact_answer', 'Selected answer comes from a generated lookup candidate rather than exact token lookup.', { answer: compactCard(answer.answerCard) });
    }
    if (looksLikeFormReference(renderings.join(' | '))) {
      addIssue(token, 'warning', 'form_reference_answer_text', 'Selected answer text looks like a form-reference rather than a definition.', { answer: compactCard(answer.answerCard) });
    }
  }

  const emptyLabelCards = uniqueCards.filter((card) => !String(card.display_label || card.route_type || card.route_family || '').trim());
  if (emptyLabelCards.length) {
    addIssue(token, 'error', 'empty_route_label', 'One or more cards has no display label, route type, or route family.', {
      cards: emptyLabelCards.slice(0, 5).map(compactCard),
    });
  }

  const undefinedish = uniqueCards.filter((card) => [
    card.display_label,
    card.definition,
    card.plain_note,
    card.match_type,
  ].some(looksUndefinedishText));
  if (undefinedish.length) {
    addIssue(token, 'error', 'undefinedish_card_text', 'One or more cards contains undefined/null-like text.', {
      cards: undefinedish.slice(0, 5).map(compactCard),
    });
  }
}

function addIssue(token, severity, issue, detail, extra = {}) {
  results.push({
    page: token.page,
    severity,
    issue,
    paragraph_index: token.paragraph_index,
    token_index: token.token_index,
    surface: token.surface,
    normalized: token.normalized,
    context: token.context,
    detail,
    ...extra,
  });
}

function selectTokens(tokens, maxTokens) {
  const selected = [];
  const seenKeys = new Set();
  const preferred = [
    (token) => token.hasMaqaf,
    (token) => /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/u.test(token.normalized) && token.normalized.length >= 4,
    (token) => /[\u05DD\u05DF\u05E5\u05E3\u05DA]$/u.test(token.surface),
    () => true,
  ];
  for (const predicate of preferred) {
    for (const token of tokens) {
      if (selected.length >= maxTokens) return selected;
      const key = `${token.page}|${token.paragraph_index}|${token.token_index}`;
      if (seenKeys.has(key) || !predicate(token)) continue;
      seenKeys.add(key);
      selected.push(token);
    }
  }
  return selected;
}

function htmlToText(value) {
  return decodeEntities(String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
}

function textSegments(innerHtml) {
  return String(innerHtml || '')
    .split(/<[^>]+>/g)
    .filter((segment) => segment.trim());
}

function hasInlineHebrewMarkup(innerHtml) {
  return /<[^>]+>/.test(innerHtml) && /[\u05D0-\u05EA]/u.test(innerHtml);
}

function tokenizeHebrewText(text, preserveMaqaf) {
  const pattern = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"״׳\u05BE-]*/gu;
  return [...String(text || '').matchAll(pattern)].map((match) => ({
    surface: normalizeHebrewDisplay(match[0]),
    normalized: normalizeHebrewKey(match[0]),
    hasMaqaf: /[\u05BE-]/u.test(match[0]),
  })).filter((token) => token.normalized);
}

function tokenWindowDiff(leftTokens, rightTokens) {
  const limit = Math.min(leftTokens.length, rightTokens.length);
  let index = 0;
  while (index < limit && leftTokens[index]?.surface === rightTokens[index]?.surface) index += 1;
  const start = Math.max(0, index - 5);
  const end = index + 8;
  return {
    first_diff_index: index,
    stripped_window: leftTokens.slice(start, end).map((token) => token.surface),
    runtime_window: rightTokens.slice(start, end).map((token) => token.surface),
  };
}

function normalizeHebrewDisplay(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/g, (_, letter) => `${letter}\u05F3`)
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g, (_, letter) => `${letter}\u05F4`);
  return String(value || '').replace(/([\u0590-\u05FF])'/g, '$1׳').replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g, '$1״');
}

function normalizeHebrewKey(value) {
  return normalizeHebrewDisplay(String(value || ''))
    .normalize('NFC')
    .replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, '')
    .replace(/\u05DA/g, '\u05DB')
    .replace(/\u05DD/g, '\u05DE')
    .replace(/\u05DF/g, '\u05E0')
    .replace(/\u05E3/g, '\u05E4')
    .replace(/\u05E5/g, '\u05E6');
}

function codepointKey(value, prefixLength) {
  const chars = [...String(value || '')].slice(0, prefixLength);
  if (!chars.length) return 'empty';
  const first = chars[0].codePointAt(0);
  if (first < 0x05d0 || first > 0x05ea) return 'other';
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

function loadRouteCards(normalized) {
  if (!normalized) return [];
  const shardKey = codepointKey(normalized, Number(manifest.prefix_length || 2));
  const shardInfo = (manifest.shards || []).find((shard) => shard.shard === shardKey);
  if (!shardInfo?.path) return [];
  if (!shardCache.has(shardKey)) {
    shardCache.set(shardKey, readJson(path.join(path.dirname(options.manifest), shardInfo.path)));
  }
  const shard = shardCache.get(shardKey);
  return (((shard || {}).routes_by_normalized || {})[normalized] || []).slice();
}

function lookupCandidatesFor(clickedForm, normalized) {
  const candidates = new Map();
  addLookupCandidate(candidates, normalized || clickedForm, 'exact', 0);
  const primary = normalizeHebrewKey(normalized || clickedForm);
  String(primary || '').split(/[\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => addLookupCandidate(candidates, part, 'maqaf component', 12));
  const prefixPattern = /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/u;
  for (let pass = 0; pass < 3; pass += 1) {
    [...candidates.values()].slice().forEach((candidate) => {
      if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) addLookupCandidate(candidates, candidate.key.slice(1), 'prefix-stripped candidate', 20 + pass * 4);
    });
  }
  const suffixRules = [
    { suffix: '\u05D9\u05DE', relation: 'plural-suffix candidate', penalty: 18 },
    { suffix: '\u05D5\u05EA', relation: 'plural-suffix candidate', penalty: 18 },
    { suffix: '\u05D9\u05D4', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D9\u05D5', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D9\u05DB', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D9\u05DB\u05DE', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05D9\u05DB\u05E0', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05D4\u05DE', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05D4\u05E0', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05E0\u05D5', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05DB', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D5', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D4', relation: 'suffix-stripped candidate', penalty: 24 },
    { suffix: '\u05D9', relation: 'suffix-stripped candidate', penalty: 24 },
  ];
  [...candidates.values()].slice().forEach((candidate) => {
    for (const rule of suffixRules) {
      if (candidate.key.endsWith(rule.suffix) && candidate.key.length - rule.suffix.length >= 3) {
        addLookupCandidate(candidates, candidate.key.slice(0, -rule.suffix.length), rule.relation, rule.penalty);
      }
    }
  });
  return [...candidates.values()];
}

function addLookupCandidate(map, key, relation, penalty = 0) {
  const normalized = normalizeHebrewKey(key);
  if (!normalized || map.has(normalized)) return;
  map.set(normalized, { key: normalized, relation, penalty });
}

function routeSection(card) {
  if (isUsageEvidenceCard(card)) return 'usage_evidence';
  return card?.display_section || card?.route_type || 'audit';
}

function isUsageEvidenceCard(card) {
  if (!card) return false;
  const usageTypes = new Set(['usage_evidence', 'workbench_usage', 'workbench_usage_evidence', 'workbench_usage_commentary', 'biblical_workbench', 'biblical_workbench_usage', 'source_workbench_usage', 'observed_usage']);
  const routeFields = [card.display_section, card.route_type, card.route_family, card.answer_role, card.meaning_quality]
    .map((value) => String(value || '').toLowerCase().replace(/[\s-]+/g, '_'))
    .filter(Boolean);
  return routeFields.some((value) => usageTypes.has(value)) || Boolean(card.usage_note || card.frame_label);
}

function routeScore(card) {
  const base = Number.isFinite(card?.adjusted_score)
    ? card.adjusted_score
    : (Number.isFinite(card?.raw_score) ? card.raw_score : (Number.isFinite(card?.confidence_percent) ? card.confidence_percent : 0));
  const penalty = Number.isFinite(card?.lookup_penalty) ? card.lookup_penalty : 0;
  return Math.max(0, Math.round(base - penalty));
}

function rankCardParts(card) {
  const adjusted = Number.isFinite(card?.adjusted_score) ? card.adjusted_score : routeScore(card);
  const raw = Number.isFinite(card?.raw_score) ? card.raw_score : (Number.isFinite(card?.confidence_percent) ? card.confidence_percent : 0);
  return [-(adjusted - (card.lookup_penalty || 0)), -raw, routeSectionRank.get(routeSection(card)) ?? 9, -(Number.isFinite(card.answer_score) ? card.answer_score : 0), String(card.card_id || '')];
}

function compareRouteCards(leftCard, rightCard) {
  const left = rankCardParts(leftCard);
  const right = rankCardParts(rightCard);
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return 0;
}

function routeRenderings(card) {
  if (!card) return [];
  if (isUsageEvidenceCard(card)) {
    return [firstPresentValue([card.linked_route_definition, card.linked_definition, card.route_definition, card.route_definition_text]) || 'observed usage only'];
  }
  const genericUsage = 'Usage context only; no meaning is forced by this phrase row.';
  const values = [];
  const definition = firstPresentValue([card.definition]);
  if (definition && definition !== genericUsage) values.push(definition);
  const meaningClaim = firstPresentValue([card.meaning_claim]);
  if (meaningClaim) values.push(meaningClaim);
  return values;
}

function isAnswerEligibleCard(card) {
  if (!card || !answerCandidateSections.has(routeSection(card)) || !routeRenderings(card).some((line) => String(line || '').trim())) return false;
  if (card.answer_eligible === false || !answerRoleAllowsDefinition(card.answer_role)) return false;
  if (card.answer_eligible === true) return true;
  if (Object.hasOwn(card, 'answer_eligible') || Object.hasOwn(card, 'answer_role')) return false;
  return card.meaning_quality === 'definition' && !['phrase_evidence', 'subphrase_evidence'].includes(routeSection(card));
}

function answerRoleAllowsDefinition(role) {
  const cleanRole = String(role || '').toLowerCase().replace(/[\s-]+/g, '_');
  return ['', 'answer', 'definition', 'reader_answer', 'primary_definition'].includes(cleanRole);
}

function answerTextKey(card) {
  return routeRenderings(card).map((line) => String(line || '').replace(/\s+/g, ' ').trim().toLowerCase()).filter(Boolean).join(' | ');
}

function selectRouteAnswer(cards) {
  const candidates = asArray(cards).filter(isAnswerEligibleCard).sort(compareRouteCards);
  const exactAnswer = candidates.filter((card) => (card.lookup_relation || 'exact') === 'exact').sort(compareRouteCards)[0];
  const selected = exactAnswer || candidates[0] || null;
  const ambiguity = answerAmbiguity(selected, candidates);
  return {
    answerCard: ambiguity.ambiguous ? null : selected,
    answerCandidates: candidates,
    answerState: ambiguity.ambiguous ? 'ambiguous' : (selected ? 'definition' : 'none'),
    ambiguityCount: ambiguity.count,
  };
}

function answerAmbiguity(primary, candidates) {
  if (!primary) return { ambiguous: false, count: 0 };
  const topScore = routeScore(primary);
  const topRelation = primary.lookup_relation || 'exact';
  const close = candidates.filter((card) => (card.lookup_relation || 'exact') === topRelation && Math.abs(routeScore(card) - topScore) <= 6);
  const meanings = new Set(close.map(answerTextKey).filter(Boolean));
  return { ambiguous: meanings.size > 1, count: meanings.size };
}

function uniqueCardsByIdAndLookup(cards) {
  const seen = new Set();
  const output = [];
  for (const card of cards) {
    const key = `${card.card_id || ''}|${card.lookup_key || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(card);
  }
  return output;
}

function compactCard(card) {
  return {
    card_id: card.card_id || '',
    route_family: card.route_family || '',
    route_type: card.route_type || '',
    display_section: card.display_section || '',
    display_label: card.display_label || '',
    answer_eligible: card.answer_eligible === true,
    answer_role: card.answer_role || '',
    score: routeScore(card),
    lookup_relation: card.lookup_relation || 'exact',
    definition: firstPresentValue(routeRenderings(card)),
    source_rows: Array.isArray(card.source_rows) ? card.source_rows.length : 0,
  };
}

function looksLikeFormReference(text) {
  return /\b(form of|plural of|singular of|construct of|alternative form|inflection of|definite form)\b/i.test(String(text || ''));
}

function looksUndefinedishText(value) {
  if (value === undefined || value === null) return false;
  return /\b(undefined|null)\b/i.test(String(value));
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&thinsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function compactText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
}

function firstPresentValue(values) {
  return asArray(values).map((value) => String(value || '').trim()).find(Boolean) || '';
}

function displayLicense(row) {
  const license = String(row && row.license || '').trim();
  if (String(row && row.source_family || '').toLowerCase() === 'workspace' && /^N\/A\s*-\s*project/i.test(license)) {
    return 'project-authored / CC0';
  }
  return license;
}

function publicSourceRow(row) {
  return Boolean(
    firstPresentValue([row && row.source_name])
    && firstPresentValue([row && row.source_id])
    && firstPresentValue([displayLicense(row)])
  );
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []);
}

function summarize(rows) {
  const byIssue = {};
  const bySeverity = {};
  const byPage = {};
  for (const row of rows) {
    byIssue[row.issue] = (byIssue[row.issue] || 0) + 1;
    bySeverity[row.severity] = (bySeverity[row.severity] || 0) + 1;
    byPage[row.page] = (byPage[row.page] || 0) + 1;
  }
  return { by_issue: byIssue, by_severity: bySeverity, by_page: byPage };
}

function writeReport(filePath, summary, rows) {
  const errors = rows.filter((row) => row.severity === 'error');
  const warnings = rows.filter((row) => row.severity !== 'error');
  const lines = [
    '# Agent 5 Route HUD Word Sample Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Scope',
    '',
    `- Pages: ${options.pages.join(', ')}`,
    `- Max tokens per page: ${options.maxTokensPerPage}`,
    `- Lookup manifest: ${options.manifest}`,
    '- This is a targeted sampler, not a full validator or browser render.',
    '',
    '## Summary',
    '',
    ...Object.entries(summary.by_severity).map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Issue Counts',
    '',
    ...Object.entries(summary.by_issue).sort((a, b) => b[1] - a[1]).map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Error Findings',
    '',
    ...(errors.length ? errors.slice(0, 80).map((row) => findingLine(row)) : ['- None.']),
    '',
    '## Warning Samples',
    '',
    ...(warnings.length ? warnings.slice(0, 80).map((row) => findingLine(row)) : ['- None.']),
    '',
    '## Boundary',
    '',
    'This script checks static rendered HTML and public route lookup JSON. It does not execute browser click handlers, does not load lexical chunks, and does not validate every page.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), `${lines.join('\n')}\n`, 'utf8');
}

function findingLine(row) {
  const token = row.surface ? ` ${row.surface} (${row.normalized || ''})` : '';
  const paragraph = Number.isFinite(row.paragraph_index) ? ` p${row.paragraph_index}` : '';
  const windowNote = row.stripped_window?.length || row.runtime_window?.length
    ? ` First diff ${row.first_diff_index}: stripped [${(row.stripped_window || []).join(' | ')}] vs runtime [${(row.runtime_window || []).join(' | ')}].`
    : '';
  return `- ${row.severity} / ${row.issue} / ${row.page}${paragraph}${token}: ${row.detail}${windowNote}`;
}

function readJson(relativePath) {
  const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function parseArgs(args) {
  const parsed = { ...defaults, pages: [...defaults.pages] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--page') parsed.pages.push(cleanRelativePath(args[++index]));
    else if (arg === '--pages') parsed.pages = args[++index].split(',').map((page) => cleanRelativePath(page.trim())).filter(Boolean);
    else if (arg === '--max-tokens-per-page') parsed.maxTokensPerPage = Number.parseInt(args[++index], 10);
    else if (arg === '--manifest') parsed.manifest = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/audit_route_hud_word_sample.mjs',
      '',
      'Options:',
      '  --pages tanakh/genesis/index.html,orot/index.html',
      '  --page tanakh/genesis/index.html',
      '  --max-tokens-per-page 160',
      '  --manifest data/definitions/hud-route-lookup/manifest.json',
      '  --report reports/agent5-route-hud-word-sample-audit.md',
    ].join('\n'));
    process.exit(0);
  }
  parsed.pages = [...new Set(parsed.pages.map(cleanRelativePath))];
  if (!Number.isFinite(parsed.maxTokensPerPage) || parsed.maxTokensPerPage < 0) parsed.maxTokensPerPage = defaults.maxTokensPerPage;
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
