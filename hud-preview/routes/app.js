const data = JSON.parse(document.getElementById("hud-route-data").textContent);
const samples = data.fixtures.samples || [];
const storeSamples = new Map((data.storeSample.sample_tokens || []).map((row) => [row.normalized, row]));
const lookupSamples = new Map((data.lookupSample?.sample_tokens || []).map((row) => [row.normalized, row]));
const tokenList = document.querySelector("[data-token-list]");
const panel = document.querySelector("[data-hud-panel]");

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const confidence = (card) => Number.isFinite(card.confidence_percent) ? `${card.confidence_percent}%` : "checked";
const metaParts = (card) => [card.route_family, card.language, card.match_type || card.route_type].filter(Boolean).join(" / ");
const productionSections = new Set([
  "strict_hebrew",
  "strict_aramaic",
  "morphology",
  "lemma",
  "subphrase_evidence",
  "biblical_paraphrase_evidence",
  "citable_paraphrase_evidence",
]);

function rankCard(card) {
  const sectionRank = new Map([
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
  const adjustedScore = Number.isFinite(card.adjusted_score)
    ? card.adjusted_score
    : (Number.isFinite(card.answer_score) ? card.answer_score : null);
  const rawScore = Number.isFinite(card.raw_score)
    ? card.raw_score
    : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : null);
  return [
    -(adjustedScore ?? -1000),
    -(rawScore ?? -1000),
    sectionRank.get(card.display_section) ?? 9,
    -(Number.isFinite(card.answer_score) ? card.answer_score : 0),
    String(card.card_id || ""),
  ];
}

function compareCards(a, b) {
  const left = rankCard(a);
  const right = rankCard(b);
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] < right[i]) return -1;
    if (left[i] > right[i]) return 1;
  }
  return 0;
}

function routeRenderings(card) {
  return [card?.definition, card?.meaning_claim].map((value) => String(value || "").trim()).filter(Boolean);
}

function answerRoleAllowsDefinition(role) {
  const cleanRole = String(role || "").toLowerCase().replace(/[\s-]+/g, "_");
  return ["", "answer", "definition", "reader_answer", "primary_definition"].includes(cleanRole);
}

function cardHasAnswerContract(card) {
  return Object.prototype.hasOwnProperty.call(card || {}, "answer_eligible")
    || Object.prototype.hasOwnProperty.call(card || {}, "answer_role");
}

function isAnswerEligible(card) {
  if (!card || !productionSections.has(card.display_section) || !routeRenderings(card).length) return false;
  if (card.answer_eligible === false || !answerRoleAllowsDefinition(card.answer_role)) return false;
  if (card.answer_eligible === true) return true;
  if (cardHasAnswerContract(card)) return false;
  return card.meaning_quality === "definition" && !["phrase_evidence", "subphrase_evidence"].includes(card.display_section);
}

function answerTextKey(card) {
  return routeRenderings(card)
    .map((line) => String(line || "").replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean)
    .join(" | ");
}

function routeScore(card) {
  const base = Number.isFinite(card.adjusted_score)
    ? card.adjusted_score
    : (Number.isFinite(card.raw_score) ? card.raw_score : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0));
  const penalty = Number.isFinite(card.lookup_penalty) ? card.lookup_penalty : 0;
  return Math.max(0, Math.round(base - penalty));
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
  const candidates = cards.filter(isAnswerEligible).sort(compareCards);
  const exactAnswer = candidates.filter((card) => (card.lookup_relation || "exact") === "exact").sort(compareCards)[0];
  const selected = exactAnswer || candidates[0] || null;
  const ambiguity = answerAmbiguity(selected, candidates);
  return {
    answerCard: ambiguity.ambiguous ? null : selected,
    answerState: ambiguity.ambiguous ? "ambiguous" : (selected ? "definition" : "none"),
    ambiguityCount: ambiguity.count,
  };
}

function scoreLine(card) {
  const parts = [];
  if (Number.isFinite(card.raw_score)) parts.push(`raw ${card.raw_score}`);
  if (Number.isFinite(card.score_handicap) && card.score_handicap) parts.push(`handicap ${card.score_handicap}`);
  if (Number.isFinite(card.adjusted_score)) parts.push(`adjusted ${card.adjusted_score}`);
  return parts.length ? `<span class="rank-basis" hidden data-rank-basis="${escapeHtml(parts.join(" / "))}"></span>` : "";
}

function sourceSummary(rows = []) {
  const names = [...new Set(rows.map((row) => `${row.source_name || "Source"}${row.source_id ? ` ${row.source_id}` : ""}`))];
  const licenses = [...new Set(rows.map((row) => row.license || "license missing"))];
  return {
    source: names.length > 2 ? `${names.slice(0, 2).join("; ")}; +${names.length - 2} more` : names.join("; "),
    license: licenses.join(" / "),
  };
}

function phraseHtml(card) {
  if (!Array.isArray(card.phrase_tokens) || !card.phrase_tokens.length) return "";
  const phrase = card.phrase_tokens.map((token) => {
    const cls = token.role === "focus-token" || token.role === "focus-part" ? "phrase-focus" : "phrase-context";
    return `<span class="${cls}" lang="he" dir="rtl">${escapeHtml(token.surface)}</span>`;
  }).join(" ");
  return `<p class="phrase-line" lang="he" dir="rtl">${phrase}</p>`;
}

function renderCard(card, role = "evidence") {
  const isAnswer = role === "answer";
  return `
    <article class="route-card ${isAnswer ? "answer-card" : ""}">
      <div class="route-head">
        <span class="route-kind">${escapeHtml(isAnswer ? "Definition" : (card.display_label || card.route_type || "Route"))}</span>
        <span class="confidence">${escapeHtml(confidence(card))}</span>
      </div>
      ${isAnswer ? "" : `<div class="route-form" lang="he" dir="rtl">${escapeHtml(card.hebrew || card.surface || "")}</div>`}
      ${isAnswer ? "" : `<p class="route-meta">${escapeHtml(metaParts(card))}</p>`}
      ${card.definition ? `<p class="definition">${escapeHtml(card.definition)}</p>` : ""}
      ${phraseHtml(card)}
      ${card.plain_note ? `<p class="plain-note">${escapeHtml(card.plain_note)}</p>` : ""}
      ${scoreLine(card)}
    </article>`;
}

const renderLane = (cards) => `<div class="route-lane">${cards.map((card) => renderCard(card)).join("")}</div>`;

function renderSection(section) {
  if (!section.cards || !section.cards.length) return "";
  return `
    <section class="section-card">
      <div class="section-title">
        <h3>${escapeHtml(section.title)}</h3>
        <span>${section.card_count} card${section.card_count === 1 ? "" : "s"}</span>
      </div>
      ${renderLane(section.cards)}
    </section>`;
}

function renderAudit(sample, storeRow) {
  const checks = [...(sample.audit_checks || [])];
  checks.push({
    check: "Route store direct cards",
    result: storeRow && storeRow.card_count ? "matched" : "none",
    card_count: storeRow ? storeRow.card_count : 0,
  });
  return `
    <section class="audit-card">
      <h3>Tiny checks only</h3>
      <div class="audit-grid">
        ${checks.map((check) => `<p><strong>${escapeHtml(check.check)}:</strong> ${escapeHtml(check.result)}${Number.isFinite(check.card_count) ? ` (${check.card_count})` : ""}</p>`).join("")}
      </div>
    </section>`;
}

function renderLookupMeta(sample, row) {
  const normalized = row?.normalized || sample.normalized || "";
  return `
    <section class="audit-card">
      <h3>Lookup shard path</h3>
      <div class="audit-grid">
        <p><strong>Normalized key:</strong> <span lang="he" dir="rtl">${escapeHtml(normalized)}</span></p>
        <p><strong>Shard:</strong> ${escapeHtml(row?.shard_path || row?.shard || "not present in lookup sample")}</p>
        <p><strong>Cards for this key:</strong> ${escapeHtml(row?.card_count ?? 0)}</p>
        <p><strong>Sample cards shown:</strong> ${escapeHtml(row?.sample_card_count ?? 0)}</p>
      </div>
    </section>`;
}

function renderSources(rows = []) {
  return `
    <section class="source-license-card">
      <h3>Sources and licenses</h3>
      <div class="source-grid">
        ${rows.length ? rows.map((row) => `
          <article class="source-row">
            <p><strong>${escapeHtml(row.source_name || "Source")}</strong> | ${escapeHtml(row.source_id || "source id missing")}</p>
            <p>License: ${escapeHtml(row.license || "license missing")}</p>
            ${row.source_url ? `<p>URL: ${escapeHtml(row.source_url)}</p>` : ""}
            ${row.notes ? `<p>${escapeHtml(row.notes)}</p>` : ""}
          </article>`).join("") : '<p class="plain-note">No source/license rows for this sample.</p>'}
      </div>
    </section>`;
}

function collectRankedCards(sample, storeRow, lookupRow) {
  const sectionCards = (sample.route_sections || [])
    .filter((section) => productionSections.has(section.section_id))
    .flatMap((section) => section.cards || []);
  const directStoreCards = storeRow?.cards || [];
  const directLookupCards = lookupRow?.cards || [];
  return [...sectionCards, ...directStoreCards, ...directLookupCards]
    .filter((card) => productionSections.has(card.display_section))
    .sort(compareCards);
}

function setActive(index) {
  const sample = samples[index] || samples[0];
  const storeRow = storeSamples.get(sample.normalized);
  const lookupRow = lookupSamples.get(sample.normalized);
  tokenList.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.index === String(index) ? "true" : "false");
  });
  const routeSections = (sample.route_sections || []).filter((section) => section.cards && section.cards.length);
  const rankedCards = collectRankedCards(sample, storeRow, lookupRow);
  const { answerCard: rankedAnswer, answerState, ambiguityCount } = selectRouteAnswer(rankedCards);
  const storeCards = storeRow && storeRow.cards && storeRow.cards.length ? {
    title: "Route-store direct cards",
    card_count: storeRow.cards.length,
    cards: storeRow.cards.map((card) => ({ ...card, hebrew: card.surface })),
  } : null;
  const lookupCards = lookupRow && lookupRow.cards && lookupRow.cards.length ? {
    title: "Lookup shard direct cards",
    card_count: lookupRow.cards.length,
    cards: lookupRow.cards.map((card) => ({ ...card, hebrew: card.surface })),
  } : null;
  const fixtureMismatch = sample.answer_card && rankedAnswer && sample.answer_card.card_id !== rankedAnswer.card_id;
  panel.innerHTML = `
    <div class="selected-token" lang="he" dir="rtl">${escapeHtml(sample.token)}</div>
    ${rankedAnswer ? renderCard(rankedAnswer, "answer") : `<section class="answer-card"><div class="route-head"><span class="route-kind">${answerState === "ambiguous" ? "Definition candidates" : "Definition"}</span><span class="confidence">${answerState === "ambiguous" ? `${ambiguityCount || 2} options` : "not answer-eligible"}</span></div><p class="definition">${answerState === "ambiguous" ? "Ambiguous; compare evidence below." : "No winning route for this token yet."}</p></section>`}
    ${fixtureMismatch ? `<section class="audit-card"><h3>Ranking override</h3><p class="plain-note">The HUD-ranked answer differs from the fixture answer. Fixture: ${escapeHtml(sample.answer_card.display_label || sample.answer_card.card_id || "unknown")} -> Live rank: ${escapeHtml(rankedAnswer.display_label || rankedAnswer.card_id || "unknown")}.</p></section>` : ""}
    ${routeSections.map(renderSection).join("")}
    ${renderLookupMeta(sample, lookupRow)}
    ${renderAudit(sample, storeRow)}
    ${renderSources(sample.source_license_groups || [])}`;
  panel.scrollIntoView({ block: "nearest" });
}

tokenList.innerHTML = samples.map((sample, index) => `
  <button type="button" data-index="${index}" aria-pressed="${index === 0 ? "true" : "false"}">
    <span lang="he" dir="rtl">${escapeHtml(sample.token)}</span>
    <small>${escapeHtml(sample.answer_card ? sample.answer_card.display_label : "No answer route")}</small>
  </button>`).join("");

tokenList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (button) setActive(Number(button.dataset.index));
});

setActive(0);
