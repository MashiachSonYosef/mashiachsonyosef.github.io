import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const source = readJson("data/sources/daniel.json");
const occurrences = readJson("data/lexical/occurrences/daniel.json");
const tokenIndex = readJson("data/lexical/token-indexes/tanakh/daniel.json");

const hintPath = "data/public-hud/daniel/reader-hints.json";
const hintsPayload = exists(hintPath) ? readJson(hintPath) : { hints: {} };

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const inlineDisplay = (value) => String(value || "").replace(/\s+/g, " ").trim().replace(/\.$/, "");
const compactText = (value) => String(value || "").replace(/\s+/g, " ").trim();

function firstPresent(values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function firstNumber(values) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function hintRows(payload) {
  const rows = [];
  if (payload?.hints && typeof payload.hints === "object" && !Array.isArray(payload.hints)) {
    Object.entries(payload.hints).forEach(([tokenId, hint]) => {
      rows.push({ token_id: tokenId, ...(hint && typeof hint === "object" ? hint : { display: hint }) });
    });
  }
  if (payload?.hints_by_token_id && typeof payload.hints_by_token_id === "object") {
    Object.entries(payload.hints_by_token_id).forEach(([tokenId, hint]) => {
      rows.push({ token_id: tokenId, ...(hint && typeof hint === "object" ? hint : { display: hint }) });
    });
  }
  ["reader_hints", "rows", "package_rows", "candidate_patch_rows"].forEach((key) => {
    if (Array.isArray(payload?.[key])) rows.push(...payload[key]);
  });
  return rows;
}

function normalizeHint(row) {
  const counterpart = row?.candidate_counterpart && typeof row.candidate_counterpart === "object" ? row.candidate_counterpart : {};
  const tokenId = firstPresent([row?.token_id, row?.target_token_id, row?.surface_token_id]);
  const display = firstPresent([
    row?.inline_display,
    row?.short_display,
    row?.reader_hint,
    counterpart.inline_display,
    counterpart.display,
    row?.display,
    row?.definition,
    row?.gloss,
  ]);
  if (!tokenId || !display) return null;
  const matchPercent = firstNumber([
    row?.match_percent,
    counterpart.match_percent,
    row?.confidence_percent,
    counterpart.confidence_percent,
    row?.adjusted_score,
    counterpart.adjusted_score,
    row?.raw_score,
    counterpart.raw_score,
  ]);
  return {
    token_id: tokenId,
    display: inlineDisplay(display),
    match_percent: matchPercent,
    source: firstPresent([row?.source, row?.source_name, counterpart.source, counterpart.source_name]),
    license: firstPresent([row?.license, counterpart.license]),
    status: firstPresent([row?.status, row?.candidate_status, counterpart.status, "reader_hint"]),
  };
}

const hints = new Map();
hintRows(hintsPayload).forEach((row) => {
  const hint = normalizeHint(row);
  if (hint) hints.set(hint.token_id, hint);
});

const formByTokenId = new Map(tokenIndex.forms.map((form) => [form.token_index_id, form]));
const unitById = new Map(Object.entries(occurrences.units || {}));

const chapters = new Map();
const unitsHtml = [];
let rowCount = 0;
let selectedRowCount = 0;
let missingFormCount = 0;

for (const unit of source.units) {
  const occurrenceUnit = unitById.get(unit.unit_id);
  const tokenIds = [];
  (occurrenceUnit?.paragraphs || []).forEach((paragraph) => {
    (paragraph.token_index_ids || []).forEach((tokenId) => tokenIds.push(tokenId));
  });
  if (!chapters.has(unit.chapter_number)) chapters.set(unit.chapter_number, []);
  chapters.get(unit.chapter_number).push(unit);

  const rows = tokenIds.map((tokenId, index) => {
    const form = formByTokenId.get(tokenId);
    if (!form) missingFormCount += 1;
    const hint = hints.get(tokenId);
    const hasSelection = Boolean(hint?.display);
    if (hasSelection) selectedRowCount += 1;
    rowCount += 1;
    const surface = form?.surface_word || tokenId;
    const normalized = form?.normalized_word || surface;
    const gloss = hasSelection ? hint.display : "TBD";
    const match = hasSelection && Number.isFinite(hint.match_percent) ? `${Math.round(hint.match_percent)}%` : "TBD";
    const sourceLabel = hasSelection ? "1" : "";
    const sourceBadge = sourceLabel ? `<sup class="source-ref">#${sourceLabel}</sup>` : "";
    const state = hasSelection ? "selection" : "tbd";
    return `
          <div class="prehud-row" data-prehud-row data-prehud-state="${state}">
            <button class="hebrew-token" type="button" lang="he" dir="rtl" data-token-id="${escapeHtml(tokenId)}" data-normalized="${escapeHtml(normalized)}" data-surface="${escapeHtml(surface)}" data-unit-id="${escapeHtml(unit.unit_id)}" data-source-ref="${escapeHtml(unit.source_ref)}" data-row-index="${index + 1}" aria-controls="route-hud" aria-expanded="false">${escapeHtml(surface)}</button>
            <div class="gloss-cell">
              <span class="gloss-text" data-gloss-text data-placeholder="${hasSelection ? "false" : "true"}">${escapeHtml(gloss)}</span>${sourceBadge}
            </div>
            <div class="match-cell" data-match-text>${escapeHtml(match)}</div>
          </div>`;
  }).join("");

  const sourceText = compactText((unit.hebrew || []).join(" "));
  unitsHtml.push(`
      <section class="unit" id="${escapeHtml(unit.unit_id)}" data-unit-id="${escapeHtml(unit.unit_id)}">
        <div class="unit-head">
          <h2>${escapeHtml(unit.source_ref)}</h2>
          <a href="#top">Top</a>
        </div>
        <p class="source-line" lang="he" dir="rtl">${escapeHtml(sourceText)}</p>
        <div class="prehud-table" aria-label="${escapeHtml(unit.source_ref)} token rows">
${rows}
        </div>
      </section>`);
}

const chapterLinks = [...chapters.keys()].sort((a, b) => a - b).map((chapter) => {
  const firstUnit = chapters.get(chapter)[0];
  return `<a href="#${escapeHtml(firstUnit.unit_id)}">Daniel ${chapter}</a>`;
}).join("");

const generatedAt = new Date().toISOString();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daniel Reader Pipeline | Mashiach Son Yosef Library</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0b0c;
      --panel: #111419;
      --panel-2: #171c20;
      --text: #f3ecdf;
      --muted: #b9b0a3;
      --line: rgba(214, 190, 138, 0.26);
      --line-strong: rgba(214, 190, 138, 0.48);
      --accent: #d6be8a;
      --accent-2: #9fb9aa;
      --danger: #d69b7f;
      --hebrew: #f8f1e5;
    }

    * { box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Georgia, "Times New Roman", serif;
    }

    a { color: inherit; }

    .shell {
      width: min(1220px, calc(100% - 32px));
      margin: 0 auto;
      padding: 24px 0 80px;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      color: var(--muted);
      font-size: 0.96rem;
      padding-bottom: 22px;
    }

    .topbar nav {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .hero {
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      padding: 30px 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
      gap: 28px;
      align-items: end;
    }

    .kicker {
      color: var(--accent-2);
      font-size: 0.86rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 10px;
    }

    h1 {
      margin: 0;
      font-size: 3.4rem;
      line-height: 1;
      font-weight: 400;
      letter-spacing: 0;
    }

    .lede {
      margin: 16px 0 0;
      max-width: 760px;
      color: var(--muted);
      font-size: 1.07rem;
      line-height: 1.58;
    }

    .proof-panel {
      border: 1px solid var(--line);
      background: var(--panel);
      padding: 16px;
    }

    .proof-panel strong {
      display: block;
      color: var(--accent);
      font-size: 1rem;
      margin-bottom: 10px;
    }

    .proof-panel dl {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px 14px;
      margin: 0;
      color: var(--muted);
      font-size: 0.92rem;
    }

    .proof-panel dd {
      margin: 0;
      color: var(--text);
      text-align: right;
    }

    .chapter-nav {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 0;
      background: rgba(10, 11, 12, 0.94);
      border-bottom: 1px solid var(--line);
      backdrop-filter: blur(10px);
    }

    .chapter-nav a {
      text-decoration: none;
      border: 1px solid var(--line);
      color: var(--muted);
      padding: 6px 9px;
      font-size: 0.88rem;
    }

    .unit {
      padding: 28px 0 8px;
      border-bottom: 1px solid var(--line);
    }

    .unit-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: baseline;
    }

    .unit h2 {
      margin: 0;
      font-size: 1.36rem;
      font-weight: 400;
      letter-spacing: 0;
    }

    .unit-head a {
      color: var(--muted);
      font-size: 0.86rem;
      text-decoration: none;
    }

    .source-line {
      margin: 12px 0 18px;
      color: var(--muted);
      font-size: 1.03rem;
      line-height: 1.9;
      overflow-wrap: anywhere;
    }

    .prehud-table {
      display: grid;
      gap: 7px;
    }

    .prehud-row {
      display: grid;
      grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr) 5.25rem;
      gap: 10px;
      align-items: stretch;
      min-height: 44px;
      border: 1px solid rgba(214, 190, 138, 0.18);
      background: rgba(255, 255, 255, 0.02);
    }

    .hebrew-token {
      width: 100%;
      border: 0;
      border-right: 1px solid rgba(214, 190, 138, 0.18);
      background: rgba(255, 255, 255, 0.025);
      color: var(--hebrew);
      font: 1.22rem/1.35 Georgia, "Times New Roman", serif;
      padding: 8px 10px;
      text-align: left;
      cursor: pointer;
      overflow-wrap: anywhere;
    }

    .hebrew-token:hover,
    .hebrew-token:focus-visible,
    .hebrew-token[aria-expanded="true"] {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      background: rgba(214, 190, 138, 0.12);
    }

    .gloss-cell {
      min-width: 0;
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 8px 0;
      line-height: 1.45;
    }

    .gloss-text {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .gloss-text[data-placeholder="true"] {
      color: var(--muted);
      font-style: italic;
    }

    .source-ref {
      color: var(--accent-2);
      font-size: 0.72rem;
      white-space: nowrap;
    }

    .match-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border-left: 1px solid rgba(214, 190, 138, 0.18);
      color: var(--accent);
      font-size: 0.9rem;
      padding: 8px;
      white-space: nowrap;
    }

    .hud-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0, 0, 0, 0.48);
    }

    .route-hud {
      position: fixed;
      z-index: 50;
      top: 24px;
      right: 24px;
      width: min(620px, calc(100vw - 48px));
      max-height: calc(100vh - 48px);
      overflow: auto;
      border: 1px solid var(--line-strong);
      background: #101318;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.56);
      padding: 18px;
    }

    .hud-top {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
      border-bottom: 1px solid var(--line);
      padding-bottom: 12px;
      margin-bottom: 14px;
    }

    .hud-word {
      margin: 0;
      color: var(--hebrew);
      font-size: 2rem;
      line-height: 1.2;
    }

    .hud-meta {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .hud-close {
      border: 1px solid var(--line);
      background: transparent;
      color: var(--text);
      font-size: 1.2rem;
      width: 34px;
      height: 34px;
      cursor: pointer;
    }

    .hud-status {
      margin: 0 0 12px;
      color: var(--muted);
      line-height: 1.5;
    }

    .route-card {
      border: 1px solid rgba(214, 190, 138, 0.22);
      background: rgba(255, 255, 255, 0.025);
      padding: 12px;
      margin: 10px 0;
    }

    .route-card[data-selectable="false"] {
      opacity: 0.82;
    }

    .route-card header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--accent-2);
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .route-definition {
      margin: 8px 0;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .route-details {
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .route-details summary {
      cursor: pointer;
      color: var(--accent);
    }

    .use-gloss {
      margin-top: 10px;
      border: 1px solid var(--line-strong);
      background: rgba(214, 190, 138, 0.1);
      color: var(--text);
      padding: 7px 10px;
      cursor: pointer;
      font-family: inherit;
    }

    .use-gloss:disabled {
      cursor: not-allowed;
      color: var(--muted);
      border-color: var(--line);
      background: transparent;
    }

    .empty {
      color: var(--muted);
      margin: 0;
      line-height: 1.5;
    }

    [hidden] { display: none !important; }

    @media (max-width: 760px) {
      .shell { width: min(100% - 20px, 1220px); }
      .hero { grid-template-columns: 1fr; }
      h1 { font-size: 2.35rem; }
      .prehud-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .hebrew-token {
        border-right: 0;
        border-bottom: 1px solid rgba(214, 190, 138, 0.18);
      }
      .gloss-cell {
        padding: 9px 10px;
      }
      .match-cell {
        justify-content: flex-start;
        border-left: 0;
        border-top: 1px solid rgba(214, 190, 138, 0.18);
      }
      .route-hud {
        top: 10px;
        right: 10px;
        width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
      }
    }
  </style>
</head>
<body>
  <main class="shell" id="top">
    <header class="topbar" aria-label="Site navigation">
      <a href="../../">Library</a>
      <nav>
        <a href="../../about/">About / License</a>
      </nav>
    </header>

    <section class="hero" aria-labelledby="work-title">
      <div>
        <p class="kicker">Tanakh / Ketuvim</p>
        <h1 id="work-title">Daniel</h1>
        <p class="lede">This page is rendered from the Daniel occurrence roster. Each Hebrew token gets its own row. The pre-HUD English layer shows a current reader selection when the pipeline provides one; otherwise it shows TBD. The popout HUD keeps route options, source rows, and license detail inspectable.</p>
      </div>
      <aside class="proof-panel" aria-label="Render proof">
        <strong>Pipeline Proof</strong>
        <dl>
          <dt>Units</dt><dd>${source.units.length}</dd>
          <dt>Token rows</dt><dd>${rowCount}</dd>
          <dt>Pre-HUD selections</dt><dd>${selectedRowCount}</dd>
          <dt>TBD fallbacks</dt><dd>${rowCount - selectedRowCount}</dd>
          <dt>Roster source</dt><dd>occurrence IDs</dd>
          <dt>Generated</dt><dd>${escapeHtml(generatedAt.slice(0, 10))}</dd>
        </dl>
      </aside>
    </section>

    <nav class="chapter-nav" aria-label="Daniel chapters">
      ${chapterLinks}
    </nav>

${unitsHtml.join("\n")}
  </main>

  <div class="hud-backdrop" data-hud-backdrop hidden></div>
  <aside class="route-hud" id="route-hud" aria-live="polite" hidden>
    <div class="hud-top">
      <div>
        <p class="hud-word" data-hud-word lang="he" dir="rtl"></p>
        <p class="hud-meta" data-hud-meta></p>
      </div>
      <button class="hud-close" type="button" data-hud-close aria-label="Close HUD">x</button>
    </div>
    <p class="hud-status" data-hud-status></p>
    <div data-hud-routes></div>
  </aside>

  <script>
    (() => {
      "use strict";

      const routeSectionRank = new Map([
        ["strict_hebrew", 0],
        ["strict_aramaic", 1],
        ["morphology", 2],
        ["lemma", 3],
        ["subphrase_evidence", 4],
        ["biblical_paraphrase_evidence", 5],
        ["citable_paraphrase_evidence", 6],
        ["phrase_evidence", 7],
        ["audit", 8],
      ]);
      const productionSections = new Set([
        "strict_hebrew",
        "strict_aramaic",
        "morphology",
        "lemma",
        "subphrase_evidence",
        "biblical_paraphrase_evidence",
        "citable_paraphrase_evidence",
      ]);
      const claimsCsvUrl = "../../data/public-lexical/by-work/daniel-token-claims-min60.csv";
      const localSelectionKey = "reader-pipeline:daniel:v1";
      let claimsPromise = null;
      let activeButton = null;
      let activeCards = [];

      const normalizeHebrewDisplay = (value) => typeof value === "string"
        ? value.replace(/([\\u0590-\\u05FF])'/g, "$1\\u05F3").replace(/([\\u0590-\\u05FF])\\"(?=[\\u0590-\\u05FF])/g, "$1\\u05F4")
        : value;
      const normalizeHebrewKey = (value) => normalizeHebrewDisplay(String(value || ""))
        .normalize("NFC")
        .replace(/[\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2\\u05C4-\\u05C5\\u05C7]/g, "")
        .replace(/\\u05DA/g, "\\u05DB")
        .replace(/\\u05DD/g, "\\u05DE")
        .replace(/\\u05DF/g, "\\u05E0")
        .replace(/\\u05E3/g, "\\u05E4")
        .replace(/\\u05E5/g, "\\u05E6");
      const cleanValues = (values) => Array.isArray(values) ? values.filter((value) => value !== undefined && value !== null && value !== "") : [];
      const firstPresent = (values) => {
        for (const value of values) {
          if (value !== undefined && value !== null && value !== "") return value;
        }
        return "";
      };

      function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
      }

      function routeSection(card) {
        return card.display_section || card.route_type || card.route_family || "audit";
      }

      function isUsageEvidenceCard(card) {
        const fields = [card?.display_section, card?.route_type, card?.route_family, card?.answer_role, card?.meaning_quality]
          .map((value) => String(value || "").toLowerCase().replace(/[\\s-]+/g, "_"));
        return fields.some((value) => value === "phrase_evidence" || value === "usage_evidence" || value === "source_phrase_evidence");
      }

      function routeRenderings(card) {
        if (!card) return [];
        if (isUsageEvidenceCard(card)) {
          return [firstPresent([card.linked_route_definition, card.linked_definition, card.route_definition, card.route_definition_text]) || "observed usage only"];
        }
        const genericUsage = "Usage context only; no meaning is forced by this phrase row.";
        const values = [];
        const definition = firstPresent([card.definition, card.gloss]);
        if (definition && definition !== genericUsage) values.push(definition);
        const meaningClaim = firstPresent([card.meaning_claim]);
        if (meaningClaim) values.push(meaningClaim);
        return values;
      }

      function answerRoleAllowsDefinition(role) {
        const cleanRole = String(role || "").toLowerCase().replace(/[\\s-]+/g, "_");
        return ["", "answer", "definition", "reader_answer", "primary_definition"].includes(cleanRole);
      }

      function isAnswerEligible(card) {
        if (isUsageEvidenceCard(card)) return false;
        if (!card || !productionSections.has(routeSection(card)) || !routeRenderings(card).length) return false;
        if (card.answer_eligible === false || !answerRoleAllowsDefinition(card.answer_role)) return false;
        if (card.answer_eligible === true) return true;
        if (Object.prototype.hasOwnProperty.call(card, "answer_eligible") || Object.prototype.hasOwnProperty.call(card, "answer_role")) return false;
        return card.meaning_quality === "definition" && !["phrase_evidence", "subphrase_evidence"].includes(routeSection(card));
      }

      function sourceRowHasPublicFields(row) {
        return Boolean(row && (row.source_name || row.source_id || row.source_url || row.license || row.license_url));
      }

      function canSaveGlossSelection(card) {
        return Boolean(card
          && card.answer_eligible === true
          && answerRoleAllowsDefinition(card.answer_role)
          && !isUsageEvidenceCard(card)
          && routeRenderings(card).length
          && cleanValues(card.source_rows).some(sourceRowHasPublicFields));
      }

      function routeScore(card) {
        const base = Number.isFinite(card.adjusted_score)
          ? card.adjusted_score
          : (Number.isFinite(card.raw_score) ? card.raw_score : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0));
        const penalty = Number.isFinite(card.lookup_penalty) ? card.lookup_penalty : 0;
        return Math.max(0, Math.round(base - penalty));
      }

      function answerTextKey(card) {
        return routeRenderings(card).map((line) => String(line || "").replace(/\\s+/g, " ").trim().toLowerCase()).filter(Boolean).join(" | ");
      }

      function compareRouteCards(leftCard, rightCard) {
        const left = [-(routeScore(leftCard) ?? -1000), routeSectionRank.get(routeSection(leftCard)) ?? 9, -(Number.isFinite(leftCard.answer_score) ? leftCard.answer_score : 0), String(leftCard.card_id || "")];
        const right = [-(routeScore(rightCard) ?? -1000), routeSectionRank.get(routeSection(rightCard)) ?? 9, -(Number.isFinite(rightCard.answer_score) ? rightCard.answer_score : 0), String(rightCard.card_id || "")];
        for (let index = 0; index < left.length; index += 1) {
          if (left[index] < right[index]) return -1;
          if (left[index] > right[index]) return 1;
        }
        return 0;
      }

      function answerAmbiguity(primary, candidates) {
        if (!primary) return { ambiguous: false, count: 0 };
        const topScore = routeScore(primary);
        const topRelation = primary.lookup_relation || "exact";
        const close = candidates.filter((card) => (card.lookup_relation || "exact") === topRelation && Math.abs(routeScore(card) - topScore) <= 6);
        const meanings = new Set(close.map(answerTextKey).filter(Boolean));
        return { ambiguous: meanings.size > 1, count: meanings.size };
      }

      function selectRouteAnswer(cards) {
        const candidates = cards.filter(isAnswerEligible).sort(compareRouteCards);
        const exactAnswer = candidates.filter((card) => (card.lookup_relation || "exact") === "exact").sort(compareRouteCards)[0];
        const selected = exactAnswer || candidates[0] || null;
        const ambiguity = answerAmbiguity(selected, candidates);
        return {
          answerCard: ambiguity.ambiguous ? null : selected,
          answerState: ambiguity.ambiguous ? "ambiguous" : (selected ? "definition" : "none"),
          ambiguityCount: ambiguity.count,
        };
      }

      function codepointKey(value, prefixLength) {
        const chars = [...String(value || "")].slice(0, prefixLength);
        if (!chars.length) return "empty";
        const first = chars[0].codePointAt(0);
        if (first < 0x05d0 || first > 0x05ea) return "other";
        return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, "0")).join("-");
      }

      function addLookupCandidate(map, key, relation, penalty = 0) {
        const normalized = normalizeHebrewKey(key);
        if (!normalized || map.has(normalized)) return;
        map.set(normalized, { key: normalized, relation, penalty });
      }

      function lookupCandidatesFor(clickedForm, normalized) {
        const candidates = new Map();
        addLookupCandidate(candidates, normalized || clickedForm, "exact", 0);
        const primary = normalizeHebrewKey(normalized || clickedForm);
        String(primary || "").split(/[\\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => addLookupCandidate(candidates, part, "maqaf component", 12));
        const prefixPattern = /^[\\u05D5\\u05D1\\u05DB\\u05DC\\u05DE\\u05D4\\u05E9]/;
        for (let pass = 0; pass < 3; pass += 1) {
          [...candidates.values()].slice().forEach((candidate) => {
            if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) addLookupCandidate(candidates, candidate.key.slice(1), "prefix-stripped candidate", 20 + pass * 4);
          });
        }
        const suffixRules = [
          { suffix: "\\u05D9\\u05DE", relation: "plural-suffix candidate", penalty: 18 },
          { suffix: "\\u05D5\\u05EA", relation: "plural-suffix candidate", penalty: 18 },
          { suffix: "\\u05D9\\u05D4", relation: "possessive-suffix candidate", penalty: 24 },
          { suffix: "\\u05D9\\u05D5", relation: "possessive-suffix candidate", penalty: 24 },
          { suffix: "\\u05D9\\u05DB", relation: "possessive-suffix candidate", penalty: 24 },
          { suffix: "\\u05D4\\u05DE", relation: "possessive-suffix candidate", penalty: 28 },
          { suffix: "\\u05D4\\u05E0", relation: "possessive-suffix candidate", penalty: 28 },
          { suffix: "\\u05E0\\u05D5", relation: "possessive-suffix candidate", penalty: 24 },
          { suffix: "\\u05DB", relation: "possessive-suffix candidate", penalty: 24 },
          { suffix: "\\u05D5", relation: "possessive-suffix candidate", penalty: 24 },
          { suffix: "\\u05D4", relation: "suffix-stripped candidate", penalty: 24 },
          { suffix: "\\u05D9", relation: "suffix-stripped candidate", penalty: 24 },
        ];
        [...candidates.values()].slice().forEach((candidate) => {
          suffixRules.forEach((rule) => {
            if (candidate.key.endsWith(rule.suffix) && candidate.key.length - rule.suffix.length >= 3) {
              addLookupCandidate(candidates, candidate.key.slice(0, -rule.suffix.length), rule.relation, rule.penalty);
            }
          });
        });
        return [...candidates.values()];
      }

      function parseCsv(text) {
        const rows = [];
        let row = [];
        let field = "";
        let quoted = false;
        for (let index = 0; index < text.length; index += 1) {
          const char = text[index];
          const next = text[index + 1];
          if (quoted) {
            if (char === '"' && next === '"') {
              field += '"';
              index += 1;
            } else if (char === '"') {
              quoted = false;
            } else {
              field += char;
            }
          } else if (char === '"') {
            quoted = true;
          } else if (char === ",") {
            row.push(field);
            field = "";
          } else if (char === "\\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
          } else if (char !== "\\r") {
            field += char;
          }
        }
        if (field || row.length) {
          row.push(field);
          rows.push(row);
        }
        return rows;
      }

      async function claimRows() {
        if (!claimsPromise) {
          claimsPromise = fetch(claimsCsvUrl).then(async (response) => {
            if (!response.ok) throw new Error("Daniel CSV fetch failed: " + response.status);
            const rows = parseCsv(await response.text()).filter((row) => row.some(Boolean));
            const header = rows.shift() || [];
            return rows.map((row) => Object.fromEntries(header.map((name, index) => [name, row[index] || ""])));
          });
        }
        return claimsPromise;
      }

      function cardsFromClaim(row) {
        const definitions = String(row.safe_rendering_options || "").split("|").map((value) => value.trim()).filter(Boolean);
        if (!definitions.length) return [];
        const confidence = Number(row.best_confidence_any_claim || row.safe_min_confidence || 0);
        const sources = String(row.safe_source_names || "").split("|").map((value) => value.trim()).filter(Boolean);
        const sourceIds = String(row.safe_source_ids || "").split("|").map((value) => value.trim()).filter(Boolean);
        const licenses = String(row.safe_licenses || "").split("|").map((value) => value.trim()).filter(Boolean);
        return definitions.map((definition, index) => ({
          card_id: "daniel-csv-" + normalizeHebrewKey(row.normalized_form || row.clicked_surface_form) + "-" + index,
          route_family: "daniel_csv_claim",
          route_type: "csv_evidence",
          display_section: "audit",
          display_label: "CSV evidence",
          language: "Hebrew",
          match_type: row.export_status || "csv",
          confidence_percent: Number.isFinite(confidence) ? confidence : 0,
          answer_eligible: false,
          answer_role: "evidence",
          definition,
          source_rows: [{
            source_name: sources[0] || "Daniel public lexical CSV",
            source_id: sourceIds[0] || row.safe_claim_ids || "",
            source_url: claimsCsvUrl,
            license: licenses[0] || "",
            fields_used: ["clicked_surface_form", "normalized_form", "safe_rendering_options", "safe_source_names", "safe_licenses"],
          }],
          raw_score: Number.isFinite(confidence) ? confidence : 0,
          adjusted_score: Number.isFinite(confidence) ? confidence : 0,
        }));
      }

      async function cardsForButton(button) {
        const normalized = normalizeHebrewKey(button.dataset.normalized || button.dataset.surface);
        const surface = button.dataset.surface || "";
        const rows = await claimRows();
        const cards = [];
        rows.forEach((row) => {
          const rowKey = normalizeHebrewKey(row.normalized_form || row.clicked_surface_form);
          if (rowKey === normalized || row.clicked_surface_form === surface) {
            cards.push(...cardsFromClaim(row));
          }
        });
        return cards.sort(compareRouteCards);
      }

      function sourceList(card) {
        const rows = cleanValues(card.source_rows);
        if (!rows.length) return "No public source row attached.";
        return rows.slice(0, 5).map((row, index) => {
          const label = firstPresent([row.source_name, row.source_id, "Source " + (index + 1)]);
          const license = firstPresent([row.license, row.license_url, "license not listed"]);
          return "#" + (index + 1) + " " + label + " | " + license;
        }).join("\\n");
      }

      function updatePrehudFromCard(button, card, sourceNumber) {
        const row = button.closest("[data-prehud-row]");
        const gloss = routeRenderings(card)[0] || "";
        if (!row || !gloss) return;
        row.dataset.prehudState = "local-selection";
        const glossNode = row.querySelector("[data-gloss-text]");
        const matchNode = row.querySelector("[data-match-text]");
        const sourceRef = row.querySelector(".source-ref") || document.createElement("sup");
        sourceRef.className = "source-ref";
        sourceRef.textContent = "#" + sourceNumber;
        glossNode.textContent = gloss;
        glossNode.dataset.placeholder = "false";
        if (!sourceRef.parentElement) glossNode.insertAdjacentElement("afterend", sourceRef);
        matchNode.textContent = routeScore(card) + "%";
        try {
          const selections = JSON.parse(window.localStorage.getItem(localSelectionKey) || "{}");
          selections[button.dataset.unitId + ":" + button.dataset.rowIndex + ":" + button.dataset.tokenId] = {
            token_id: button.dataset.tokenId,
            display: gloss,
            match_percent: routeScore(card),
            card_id: card.card_id || "",
            selected_at: new Date().toISOString(),
            publication_status: "local_reader_selection_not_published",
          };
          window.localStorage.setItem(localSelectionKey, JSON.stringify(selections));
        } catch (error) {
          console.warn(error);
        }
      }

      function renderCard(card, index) {
        const selectable = canSaveGlossSelection(card);
        const article = createElement("article", "route-card");
        article.dataset.selectable = selectable ? "true" : "false";
        const header = document.createElement("header");
        header.appendChild(createElement("span", "", selectable ? "Definition option" : "Evidence only"));
        header.appendChild(createElement("span", "", String(routeScore(card)) + "%"));
        article.appendChild(header);
        article.appendChild(createElement("p", "route-definition", routeRenderings(card)[0] || "No definition rendering."));
        const details = createElement("details", "route-details");
        details.open = index === 0;
        details.appendChild(createElement("summary", "", "Sources / route"));
        const body = createElement("pre", "", sourceList(card) + "\\nRoute: " + routeSection(card) + " / " + (card.match_type || card.route_type || "unknown"));
        body.style.whiteSpace = "pre-wrap";
        body.style.fontFamily = "inherit";
        details.appendChild(body);
        article.appendChild(details);
        const button = createElement("button", "use-gloss", selectable ? "Use this gloss locally" : "Evidence only");
        button.type = "button";
        button.disabled = !selectable;
        if (selectable) button.addEventListener("click", () => updatePrehudFromCard(activeButton, card, index + 1));
        article.appendChild(button);
        return article;
      }

      function closeHud() {
        document.querySelector("[data-hud-backdrop]").hidden = true;
        document.querySelector("#route-hud").hidden = true;
        if (activeButton) activeButton.setAttribute("aria-expanded", "false");
        activeButton = null;
        activeCards = [];
      }

      async function openHud(button) {
        if (activeButton && activeButton !== button) activeButton.setAttribute("aria-expanded", "false");
        activeButton = button;
        button.setAttribute("aria-expanded", "true");
        document.querySelector("[data-hud-backdrop]").hidden = false;
        const hud = document.querySelector("#route-hud");
        const routes = hud.querySelector("[data-hud-routes]");
        hud.querySelector("[data-hud-word]").textContent = button.dataset.surface || button.textContent;
        hud.querySelector("[data-hud-meta]").textContent = button.dataset.sourceRef + " | row " + button.dataset.rowIndex + " | " + button.dataset.tokenId;
        hud.querySelector("[data-hud-status]").textContent = "Loading route cards...";
        routes.replaceChildren();
        hud.hidden = false;
        try {
          activeCards = await cardsForButton(button);
          const selected = selectRouteAnswer(activeCards);
          const selectableCount = activeCards.filter(canSaveGlossSelection).length;
          hud.querySelector("[data-hud-status]").textContent = selected.answerState === "definition"
            ? "Current route answer-slot option is available in HUD. Pre-HUD fills only from a selection/hint layer or local reader choice."
            : (selected.answerState === "ambiguous" ? "Multiple close route meanings; pre-HUD remains TBD until selection." : "No selectable route answer yet; pre-HUD remains TBD.");
          if (!activeCards.length) {
            routes.appendChild(createElement("p", "empty", "No route cards are available for this token."));
            return;
          }
          const summary = createElement("p", "empty", selectableCount + " selectable option(s), " + (activeCards.length - selectableCount) + " evidence-only card(s).");
          routes.appendChild(summary);
          activeCards.slice(0, 24).forEach((card, index) => routes.appendChild(renderCard(card, index)));
        } catch (error) {
          console.error(error);
          hud.querySelector("[data-hud-status]").textContent = "HUD route lookup failed.";
          routes.appendChild(createElement("p", "empty", String(error.message || error)));
        }
      }

      document.querySelectorAll(".hebrew-token").forEach((button) => {
        button.addEventListener("click", () => openHud(button));
      });
      document.querySelector("[data-hud-close]").addEventListener("click", closeHud);
      document.querySelector("[data-hud-backdrop]").addEventListener("click", closeHud);
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeHud();
      });
    })();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "tanakh/daniel/index.html"), html, "utf8");

const report = {
  generated_at: generatedAt,
  work_id: "daniel",
  source_units: source.units.length,
  token_rows: rowCount,
  selected_prehud_rows: selectedRowCount,
  tbd_fallback_rows: rowCount - selectedRowCount,
  missing_form_count: missingFormCount,
  occurrence_total_reported: occurrences.total_occurrences,
  hint_source: exists(hintPath) ? hintPath : null,
  route_lookup_runtime_source: "data/public-lexical/by-work/daniel-token-claims-min60.csv",
  prehud_rule: "display reader hint/selection when present; otherwise TBD fallback",
};

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/daniel-reader-pipeline-page-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
