(() => {
  'use strict';

  const STORAGE_KEY = 'reader-workbench:g1';
  const DB_NAME = 'reader-workbench';
  const DB_VERSION = 1;
  const DB_STORE = 'state';
  const DB_STATE_KEY = 'gloss-selections';
  const HEBREW_TOKEN_RE = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"\u05BE-]*/gu;
  const PREHUD_PLACEHOLDER_TEXT = 'N/A';
  const PRODUCT_STATUS = 'not_a_translation';
  const productionSections = new Set([
    'strict_hebrew',
    'strict_aramaic',
    'morphology',
    'lemma',
    'subphrase_evidence',
    'biblical_paraphrase_evidence',
    'citable_paraphrase_evidence',
  ]);
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
  const routeSectionTitles = new Map([
    ['strict_hebrew', 'Strict Hebrew matches'],
    ['strict_aramaic', 'Strict Aramaic matches'],
    ['morphology', 'Word-part breakdown'],
    ['lemma', 'Lemma / base form'],
    ['subphrase_evidence', 'Phrasing evidence'],
    ['biblical_paraphrase_evidence', 'Biblical phrasing/paraphrase evidence'],
    ['citable_paraphrase_evidence', 'Citable phrasing/paraphrase evidence'],
    ['usage_evidence', 'Usage evidence'],
    ['phrase_evidence', 'Licensed phrase uses'],
  ]);
  const normalizeRouteLabel = (value) => String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  const usageEvidenceRouteTypes = new Set([
    'usage_evidence',
    'workbench_usage',
    'workbench_usage_evidence',
    'workbench_usage_commentary',
    'biblical_workbench',
    'biblical_workbench_usage',
    'source_workbench_usage',
    'observed_usage',
  ]);
  const prehudEvidenceOnlyRouteTypes = new Set([
    ...usageEvidenceRouteTypes,
    'lemma',
    'lemma_only',
    'morphology',
    'form_reference',
    'form_reference_evidence',
    'morphology_reference',
    'morphology_form_reference',
    'usage_only',
    'phrase_evidence',
  ]);
  const requiredSelectionFields = [
    'schema_version',
    'artifact_type',
    'selection_id',
    'work_id',
    'unit_id',
    'source_ref',
    'surface_occurrence_id',
    'surface_token_id',
    'surface_token_key',
    'surface_text',
    'normalized',
    'selected_card_id',
    'selected_definition',
    'answer_eligible',
    'answer_role',
    'confidence_percent',
    'source_rows',
    'study_status',
    'publication_status',
    'created_at',
    'updated_at',
  ];
  const requiredSourceRowFields = ['source_name', 'source_id', 'source_url', 'license', 'license_url'];
  const allowedStudyStatuses = new Set(['draft', 'review', 'user_final']);
  const localSourceUrlMap = {
    'local:project-zohar-ari-technical-term-table': 'data/lexical/source-layers/project-zohar-ari-technical-terms.json',
    'local:project-abbreviation-table': 'data/lexical/source-layers/project-abbreviations.json',
    'local:project-aramaic-grammar-table': 'data/lexical/source-layers/project-aramaic-grammar.json',
    'local:project-function-word-table': 'data/lexical/source-layers/project-function-words.json',
    'local:project-midrash-formula-table': 'data/lexical/source-layers/project-midrash-formulas.json',
    'local:grammar-rules': 'data/lexical/source-layers/project-overrides.json',
    'local:fixed-expression-rules': 'data/lexical/source-layers/project-overrides.json',
  };

  let siteApi = null;
  let activeHudButton = null;
  let selectionDbPromise = null;

  const cleanValues = (values) => Array.isArray(values) ? values.filter(Boolean) : (values ? [values] : []);
  const uniqueValues = (values) => [...new Set(cleanValues(values))];
  const firstPresentValue = (values) => cleanValues(values).map((value) => String(value || '').trim()).find(Boolean) || '';
  const waitForIdle = () => new Promise((resolve) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(resolve, { timeout: 250 });
    else window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
  const toAbsoluteUrl = (url, base = document.baseURI || location.href) => new URL(url, base).toString();
  const fetchJson = async (url, base = document.baseURI || location.href) => {
    const response = await fetch(toAbsoluteUrl(url, base));
    if (!response.ok) throw new Error(`Unable to load Reader Workbench payload: ${response.status} ${url}`);
    return response.json();
  };
  const fetchOptionalJson = async (url, base = document.baseURI || location.href) => {
    if (!url) return null;
    const response = await fetch(toAbsoluteUrl(url, base));
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Unable to load optional Reader Workbench payload: ${response.status} ${url}`);
    return response.json();
  };
  const parseJsonNode = (selector, fallback) => {
    const node = document.querySelector(selector);
    if (!node || !node.textContent.trim()) return fallback;
    return JSON.parse(node.textContent);
  };
  const normalizeHebrewDisplay = (value) => typeof value === 'string'
    ? value.replace(/([\u0590-\u05FF])'/g, '$1\u05F3').replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g, '$1\u05F4')
    : value;
  const normalizeHebrewKey = (value) => normalizeHebrewDisplay(String(value || ''))
    .normalize('NFC')
    .replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, '')
    .replace(/\u05DA/g, '\u05DB')
    .replace(/\u05DD/g, '\u05DE')
    .replace(/\u05DF/g, '\u05E0')
    .replace(/\u05E3/g, '\u05E4')
    .replace(/\u05E5/g, '\u05E6');
  const lexicalRootUrl = (config) => toAbsoluteUrl(config.root_href || './');
  const routeLookupManifestUrl = (config) => toAbsoluteUrl(
    config.hud_route_lookup_manifest_url || 'data/definitions/hud-route-lookup/manifest.json',
    lexicalRootUrl(config),
  );
  const readerHintsUrl = (config) => config.reader_hints_url || config.reader_hint_url || '';
  const visibleDisplaySlotManifestUrl = (config) => config.visible_display_slot_manifest_url || config.visible_display_slots_url || '';
  const hebrewCrossmatchIndexUrl = (config) => config.hebrew_crossmatch_url || config.hebrew_crossmatches_url || '';
  const resolveSourceUrl = (url, config) => {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (/^(https?:|mailto:)/i.test(raw)) return raw;
    const mapped = localSourceUrlMap[raw];
    if (mapped) return toAbsoluteUrl(mapped, lexicalRootUrl(config));
    if (/^(?:\.{0,2}\/|data\/)/.test(raw)) return toAbsoluteUrl(raw, lexicalRootUrl(config));
    return '';
  };

  function inlineHintDisplay(value) {
    const raw = String(value || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    return raw.replace(/\.$/, '');
  }

  function isUnsafePrehudDisplay(value) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return false;
    return [
      /^observed usage only$/i,
      /^usage context only/i,
      /^form of\b/i,
      /:\s*form of\b/i,
      /\b(?:singular|plural|dual)(?:\s+\S+){0,6}\s+form of\b/i,
      /\b(?:construct state|absolute state|infinitive(?: absolute| construct)?|bare infinitive|participle)\b.*\bof\b/i,
      /^(?:first|second|third)-person\b.*\bof\b/i,
      /\bvav-consecutive\b.*\bof\b/i,
    ].some((pattern) => pattern.test(text));
  }

  const approvedPrehudDisplayEligibility = new Set([
    'pre_hud_selected',
    'book_page_selected',
    'explicitly_selected_for_book_page',
  ]);

  function hasApprovedPrehudDisplayEligibility(row, counterpart) {
    return [
      row?.display_eligibility,
      row?.book_page_display_eligibility,
      row?.prehud_display_eligibility,
      counterpart?.display_eligibility,
      counterpart?.book_page_display_eligibility,
      counterpart?.prehud_display_eligibility,
    ].some((value) => approvedPrehudDisplayEligibility.has(String(value || '').trim()));
  }

  function firstNumericValue(values) {
    for (const value of values) {
      if (value === undefined || value === null || value === '') continue;
      const numeric = Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }
    return null;
  }

  function formatGlossLine(display, percent) {
    const text = String(display || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const numeric = firstNumericValue([percent]);
    return Number.isFinite(numeric) ? `${text} ${Math.round(numeric)}%` : text;
  }

  function normalizeReaderHint(row) {
    const counterpart = row?.candidate_counterpart && typeof row.candidate_counterpart === 'object' ? row.candidate_counterpart : {};
    const tokenId = firstPresentValue([row?.token_id, row?.target_token_id, row?.surface_token_id]);
    const routeCardId = firstPresentValue([row?.route_card_id, counterpart.route_card_id]);
    const placeholderKind = firstPresentValue([row?.placeholder_kind]);
    const reviewState = firstPresentValue([row?.review_state, row?.display_state]);
    const placeholderText = firstPresentValue([row?.placeholder_text]);
    const attributionNotice = firstPresentValue([row?.attribution_notice]);
    const isPendingReview = placeholderKind === 'reader_hint_pending_review'
      || reviewState === 'placeholder_pending_review'
      || reviewState === 'pending_reader_hint_review';
    if (tokenId && isPendingReview && placeholderText) {
      const inlinePlaceholder = attributionNotice
        ? `${placeholderText} pending review (${attributionNotice})`
        : `${placeholderText} pending review`;
      return {
        token_id: tokenId,
        display: placeholderText,
        inline_display: inlinePlaceholder,
        label: firstPresentValue([row?.label, counterpart.label]),
        match_percent: null,
        placeholder_kind: placeholderKind,
        review_state: reviewState,
      };
    }
    if (
      firstPresentValue([row?.candidate_status, counterpart.candidate_status]) === 'candidate_not_authority'
      && !hasApprovedPrehudDisplayEligibility(row, counterpart)
    ) {
      return null;
    }
    const display = firstPresentValue([
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
    const inlineDisplay = firstPresentValue([row?.inline_display, row?.short_display]) || inlineHintDisplay(display);
    if (isUnsafePrehudDisplay(display) || isUnsafePrehudDisplay(inlineDisplay)) return null;
    const matchPercent = firstNumericValue([
      row?.route_score_percent,
      counterpart.route_score_percent,
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
      display,
      inline_display: inlineDisplay,
      label: firstPresentValue([row?.label, counterpart.label]),
      match_percent: matchPercent,
      route_card_id: routeCardId,
    };
  }

  function readerHintRows(payload) {
    if (!payload || typeof payload !== 'object') return [];
    const rows = [];
    if (payload.hints_by_token_id && typeof payload.hints_by_token_id === 'object') {
      Object.entries(payload.hints_by_token_id).forEach(([tokenId, hint]) => {
        rows.push({ token_id: tokenId, ...(hint && typeof hint === 'object' ? hint : { display: hint }) });
      });
    }
    if (payload.hints && typeof payload.hints === 'object') {
      Object.entries(payload.hints).forEach(([tokenId, hint]) => {
        rows.push({ token_id: tokenId, ...(hint && typeof hint === 'object' ? hint : { display: hint }) });
      });
    }
    [
      payload.hints,
      payload.reader_hints,
      payload.rows,
      payload.package_rows,
      payload.candidate_patch_rows,
    ].forEach((value) => {
      if (Array.isArray(value)) rows.push(...value);
    });
    return rows;
  }

  async function loadReaderHints(config) {
    const url = readerHintsUrl(config);
    if (!url) return new Map();
    try {
      const payload = await fetchOptionalJson(url, lexicalRootUrl(config));
      const hints = new Map();
      readerHintRows(payload).forEach((row) => {
        const hint = normalizeReaderHint(row);
        if (hint) hints.set(hint.token_id, hint);
      });
      return hints;
    } catch (error) {
      console.warn(error);
      return new Map();
    }
  }

  function visibleDisplaySlotRows(payload) {
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.slots)) return payload.slots;
    if (payload.slots && typeof payload.slots === 'object') {
      return Object.entries(payload.slots).map(([tokenId, slot]) => ({
        token_id: tokenId,
        ...(slot && typeof slot === 'object' ? slot : {}),
      }));
    }
    return [];
  }

  function normalizeVisibleDisplaySlot(row, manifest, config) {
    if (!row || typeof row !== 'object') return null;
    const tokenId = firstPresentValue([row.token_id, row.surface_token_id, row.target_token_id]);
    if (!tokenId) return null;
    const manifestWorkId = firstPresentValue([manifest?.work_id]);
    const configWorkId = firstPresentValue([config?.work_id]);
    const rowWorkId = firstPresentValue([row.work_id, manifestWorkId]);
    if (configWorkId && rowWorkId && rowWorkId !== configWorkId) return null;
    const displayState = firstPresentValue([row.display_state]) || PREHUD_PLACEHOLDER_TEXT;
    const approvedText = firstPresentValue([row.approved_visible_text]);
    const approvedBy = firstPresentValue([row.approved_by]);
    const isApproved = displayState === 'approved_gloss'
      && approvedText
      && approvedBy === 'A13'
      && firstPresentValue([row.approval_packet_id])
      && firstPresentValue([row.source_gate_packet_id])
      && firstPresentValue([row.structure_gate_packet_id])
      && firstPresentValue([row.package_truth_packet_id])
      && firstPresentValue([row.wording_packet_id])
      && firstPresentValue([row.boundary_packet_id])
      && firstPresentValue([row.validation_packet_id]);
    return {
      token_id: tokenId,
      display_state: displayState,
      approved_visible_text: isApproved ? approvedText : '',
      approved_by: approvedBy,
      source_ref: firstPresentValue([row.source_ref]),
      source_id: firstPresentValue([row.source_id]),
      source_lane: firstPresentValue([row.source_lane]),
      license_label: firstPresentValue([row.license_label]),
      a7_hud_gloss_packet_id: firstPresentValue([row.a7_hud_gloss_packet_id]),
      a7_hud_selected_gloss_card_id: firstPresentValue([row.a7_hud_selected_gloss_card_id]),
      a7_hud_cited_evidence_card_id: firstPresentValue([row.a7_hud_cited_evidence_card_id]),
      approval_packet_id: firstPresentValue([row.approval_packet_id]),
      wording_packet_id: firstPresentValue([row.wording_packet_id]),
      boundary_packet_id: firstPresentValue([row.boundary_packet_id]),
      validation_packet_id: firstPresentValue([row.validation_packet_id]),
    };
  }

  async function loadVisibleDisplaySlots(config) {
    const url = visibleDisplaySlotManifestUrl(config);
    if (!url) return new Map();
    try {
      const payload = await fetchOptionalJson(url, lexicalRootUrl(config));
      const slots = new Map();
      visibleDisplaySlotRows(payload).forEach((row) => {
        const slot = normalizeVisibleDisplaySlot(row, payload, config);
        if (slot) slots.set(slot.token_id, slot);
      });
      return slots;
    } catch (error) {
      console.warn(error);
      return new Map();
    }
  }

  function tokenWrapFor(button) {
    return button ? (button.closest('.reader-token-wrap') || button.parentElement) : null;
  }

  function findTokenGlossLine(button) {
    const wrap = tokenWrapFor(button);
    return wrap ? wrap.querySelector('.reader-gloss-line') : null;
  }

  function ensureTokenGlossLine(button) {
    const wrap = tokenWrapFor(button);
    if (!wrap) return null;
    let line = findTokenGlossLine(button);
    if (line) return line;
    line = createElement('span', 'reader-gloss-line');
    const slot = wrap.querySelector('.prehud-gloss') || wrap;
    slot.appendChild(line);
    return line;
  }

  function setTokenGlossDisplay(button, display, matchPercent, placeholder = false) {
    const wrap = tokenWrapFor(button);
    const isPrehudRow = wrap && wrap.classList.contains('prehud-row');
    const line = ensureTokenGlossLine(button);
    const text = display ? (isPrehudRow ? display : formatGlossLine(display, matchPercent)) : PREHUD_PLACEHOLDER_TEXT;
    if (line) {
      line.textContent = text;
      line.dataset.glossPlaceholder = placeholder ? 'true' : 'false';
      line.dataset.glossText = display || '';
    }
    const match = wrap ? wrap.querySelector('[data-match-text]') : null;
    if (match) {
      const percent = Number(matchPercent ?? NaN);
      match.textContent = display && Number.isFinite(percent) ? `${percent}%` : PREHUD_PLACEHOLDER_TEXT;
      match.dataset.matchText = match.textContent;
    }
    return line;
  }

  function applyVisibleDisplaySlotOrNA(button, slot) {
    if (!button) return null;
    if (slot?.display_state === 'approved_gloss' && slot.approved_visible_text) {
      const line = setTokenGlossDisplay(button, slot.approved_visible_text, null, false);
      const wrap = tokenWrapFor(button);
      const match = wrap ? wrap.querySelector('[data-match-text]') : null;
      if (match) {
        match.hidden = false;
        match.textContent = 'approved';
        match.dataset.matchText = match.textContent;
        match.dataset.visibleDisplayState = 'approved_gloss';
      }
      if (line) {
        line.dataset.visibleDisplayState = 'approved_gloss';
        line.dataset.approvalPacketId = slot.approval_packet_id || '';
      }
      button.dataset.visibleDisplayState = 'approved_gloss';
      return line;
    }
    const line = setTokenGlossDisplay(button, '', null, true);
    if (line) line.dataset.visibleDisplayState = slot?.display_state || PREHUD_PLACEHOLDER_TEXT;
    button.dataset.visibleDisplayState = slot?.display_state || PREHUD_PLACEHOLDER_TEXT;
    const wrap = tokenWrapFor(button);
    const match = wrap ? wrap.querySelector('[data-match-text]') : null;
    if (match) {
      match.textContent = PREHUD_PLACEHOLDER_TEXT;
      match.dataset.matchText = PREHUD_PLACEHOLDER_TEXT;
      match.dataset.visibleDisplayState = slot?.display_state || PREHUD_PLACEHOLDER_TEXT;
      match.hidden = true;
    }
    return line;
  }

  function applyVisibleDisplaySlots(slots) {
    if (!(slots instanceof Map)) return;
    document.querySelectorAll('[data-lexical-token]').forEach((button) => {
      const tokenIds = String(button.dataset.lexicalTokenIds || button.dataset.lexicalIndex || '')
        .split(/\s+/)
        .filter(Boolean);
      const tokenSlots = tokenIds.map((tokenId) => slots.get(tokenId)).filter(Boolean);
      const slot = tokenSlots.find((item) => item.display_state === 'approved_gloss') || tokenSlots[0] || null;
      applyVisibleDisplaySlotOrNA(button, slot);
    });
  }

  function isA13PresentationMode(config) {
    return config?.hud_presentation_mode === 'a13_visible_poc';
  }

  function visibleSlotForButton(button) {
    const slots = siteApi?.visibleDisplaySlots;
    if (!(slots instanceof Map) || !button) return null;
    const tokenIds = String(button.dataset.lexicalTokenIds || button.dataset.surfaceTokenId || button.dataset.lexicalIndex || '')
      .split(/\s+/)
      .filter(Boolean);
    const tokenSlots = tokenIds.map((tokenId) => slots.get(tokenId)).filter(Boolean);
    return tokenSlots.find((slot) => slot.display_state === 'approved_gloss' && slot.approved_visible_text) || tokenSlots[0] || null;
  }

  function routeCardById(cards, cardId) {
    if (!cardId) return null;
    return cleanValues(cards).find((card) => String(card.card_id || '') === String(cardId)) || null;
  }

  function appendA13GlossHudSection(panel, slot, selectedCard) {
    const section = createElement('section', 'route-section-card route-answer-card a13-gloss-card');
    const title = createElement('div', 'route-section-title');
    title.appendChild(createElement('h3', '', 'Gloss selectable'));
    title.appendChild(createElement('span', '', slot?.approved_visible_text ? 'A13 approved' : PREHUD_PLACEHOLDER_TEXT));
    section.appendChild(title);

    if (slot?.display_state === 'approved_gloss' && slot.approved_visible_text) {
      section.appendChild(createElement('p', 'a13-gloss-word', slot.approved_visible_text));
      const meta = [
        slot.source_ref,
        slot.source_id,
        slot.license_label,
        selectedCard ? `${routeScore(selectedCard)}% match` : '',
      ].filter(Boolean).join(' | ');
      if (meta) section.appendChild(createElement('p', 'reader-gloss-meta', meta));
      section.appendChild(createElement('p', 'placeholder', 'Approved for this exact token scope. Evidence and source/license details remain below.'));
    } else {
      section.appendChild(createElement('p', 'placeholder', 'No A13-approved visible gloss for this token yet. The book-page display remains N/A.'));
    }
    panel.appendChild(section);
  }

  function appendA13ApprovedEvidenceSection(panel, slot, selectedCard, evidenceCard, sourceCardMap) {
    if (!slot?.approved_visible_text || (!selectedCard && !evidenceCard)) return;
    const section = createElement('section', 'route-section-card a13-approved-evidence');
    const title = createElement('div', 'route-section-title');
    title.appendChild(createElement('h3', '', 'A13 approved evidence'));
    title.appendChild(createElement('span', '', slot.approved_visible_text));
    section.appendChild(title);
    const lead = createElement('p', 'placeholder', `Selected gloss: ${slot.approved_visible_text}`);
    section.appendChild(lead);
    if (evidenceCard) {
      appendRouteCard(section, evidenceCard, 'evidence', 1, sourceCardMap ? sourceCardMap.get(evidenceCard) : []);
    }
    if (selectedCard && selectedCard !== evidenceCard) {
      const details = createElement('details', 'route-audit-card a13-selected-card-detail');
      details.appendChild(createElement('summary', '', 'Selectable gloss source card'));
      appendRouteCard(details, selectedCard, 'evidence', 1, sourceCardMap ? sourceCardMap.get(selectedCard) : []);
      section.appendChild(details);
    }
    panel.appendChild(section);
  }

  function appendCollapsedHudEvidence(panel, summaryText, build) {
    const details = createElement('details', 'route-audit-card hud-collapsed-evidence');
    details.appendChild(createElement('summary', '', summaryText));
    const body = createElement('div', 'hud-collapsed-evidence-body');
    build(body);
    if (!body.childElementCount) return;
    details.appendChild(body);
    panel.appendChild(details);
  }

  function applyReaderHint(button, hint) {
    if (!button || !hint) return;
    const display = hint.inline_display || inlineHintDisplay(hint.display);
    if (!display) return;
    const line = setTokenGlossDisplay(button, display, hint.match_percent, false);
    if (!line) return;
    line.dataset.glossLabel = hint.label || '';
    button.dataset.readerHint = line.textContent;
    button.dataset.readerHintLabel = hint.label || '';
  }

  function applyReaderHints(hints) {
    if (!(hints instanceof Map) || !hints.size) return;
    document.querySelectorAll('[data-lexical-token]').forEach((button) => {
      const tokenIds = String(button.dataset.lexicalTokenIds || button.dataset.lexicalIndex || '')
        .split(/\s+/)
        .filter(Boolean);
      const hint = tokenIds.map((tokenId) => hints.get(tokenId)).find(Boolean);
      applyReaderHint(button, hint);
    });
  }

  function defaultSelectionStore() {
    return { schema_version: 1, storage: 'local', selections: {} };
  }

  function normalizeSelectionStore(store) {
    return {
      ...defaultSelectionStore(),
      ...(store && typeof store === 'object' ? store : {}),
      selections: store && typeof store.selections === 'object' && store.selections ? store.selections : {},
    };
  }

  function loadSelectionStore() {
    try {
      return normalizeSelectionStore(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{"selections":{}}'));
    } catch {
      return defaultSelectionStore();
    }
  }

  function openSelectionDb() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    if (selectionDbPromise) return selectionDbPromise;
    selectionDbPromise = new Promise((resolve) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
    return selectionDbPromise;
  }

  async function readSelectionStoreFromIndexedDb() {
    const db = await openSelectionDb();
    if (!db) return null;
    return new Promise((resolve) => {
      const request = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(DB_STATE_KEY);
      request.onsuccess = () => resolve(request.result ? normalizeSelectionStore(request.result) : null);
      request.onerror = () => resolve(null);
    });
  }

  async function writeSelectionStoreToIndexedDb(store) {
    const db = await openSelectionDb();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put({ ...normalizeSelectionStore(store), storage: 'indexeddb', updated_at: new Date().toISOString() }, DB_STATE_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  }

  async function hydrateSelectionStoreFromIndexedDb() {
    const indexedStore = await readSelectionStoreFromIndexedDb();
    if (!indexedStore) return loadSelectionStore();
    const localStore = loadSelectionStore();
    const merged = normalizeSelectionStore({
      ...localStore,
      selections: {
        ...(indexedStore.selections || {}),
        ...(localStore.selections || {}),
      },
      storage: 'indexeddb+localStorage',
      updated_at: new Date().toISOString(),
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // IndexedDB remains the primary store when localStorage is unavailable.
    }
    return merged;
  }

  function saveSelectionStore(store) {
    const normalized = normalizeSelectionStore(store);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Keep working with IndexedDB-only persistence if localStorage is blocked.
    }
    writeSelectionStoreToIndexedDb(normalized).catch(() => {});
  }

  function tokenSelectionKey(button) {
    const unit = button.closest('[data-unit]');
    return [
      button.dataset.workId || siteApi?.config?.work_id || location.pathname,
      unit?.dataset.unitId || unit?.id || '',
      button.dataset.surfaceOccurrenceId || button.dataset.surfaceTokenId || button.dataset.lexicalIndex || '',
      button.dataset.lexicalToken || '',
    ].join('|');
  }

  function selectionId(button, card) {
    const raw = `${tokenSelectionKey(button)}|${card?.card_id || ''}`;
    let hash = 0;
    for (let index = 0; index < raw.length; index += 1) hash = ((hash << 5) - hash + raw.charCodeAt(index)) | 0;
    return `gs-${Math.abs(hash).toString(16)}`;
  }

  function selectionKeyFromSelection(selection) {
    return [
      selection.work_id || location.pathname,
      selection.unit_id || '',
      selection.surface_occurrence_id || selection.surface_token_id || '',
      selection.surface_token_key || selection.surface_token_id || '',
    ].join('|');
  }

  function sourceSummary(rows = []) {
    const sourceNames = uniqueValues(rows.map((row) => row.source_name || 'Source'));
    const licenses = uniqueValues(rows.map((row) => row.license || 'license missing'));
    return {
      source: sourceNames.length > 2 ? `${sourceNames.slice(0, 2).join('; ')}; +${sourceNames.length - 2} more` : sourceNames.join('; '),
      license: licenses.join(' / '),
    };
  }

  function displayLicense(row) {
    const license = String(row && row.license || '').trim();
    if (String(row && row.source_family || '').toLowerCase() === 'workspace' && /^N\/A\s*-\s*project/i.test(license)) {
      return 'project-authored / CC0';
    }
    return license || 'N/A';
  }

  function sourceRowHasPublicFields(row) {
    return Boolean(
      row
      && requiredSourceRowFields.every((field) => String(row[field] || '').trim())
      && displayLicense(row) !== 'N/A'
    );
  }

  function isMissingSelectionField(row, field) {
    if (row == null || row[field] === undefined || row[field] === null) return true;
    if (Array.isArray(row[field])) return row[field].length === 0;
    return typeof row[field] === 'string' && row[field].trim() === '';
  }

  function selectionContractErrors(row) {
    const errors = [];
    requiredSelectionFields.forEach((field) => {
      if (isMissingSelectionField(row, field)) errors.push(`missing ${field}`);
    });
    if (row?.schema_version !== 1) errors.push('schema_version must be 1');
    if (row?.artifact_type !== 'gloss_selection') errors.push('artifact_type must be gloss_selection');
    if (row?.publication_status !== PRODUCT_STATUS) errors.push(`publication_status must be ${PRODUCT_STATUS}`);
    if (!allowedStudyStatuses.has(row?.study_status)) errors.push('study_status must be draft, review, or user_final');
    if (row?.answer_eligible !== true || !answerRoleAllowsDefinition(row?.answer_role)) {
      errors.push('selection must be answer-eligible, not evidence-only');
    }
    if (row?.display_eligible !== true || row?.prehud_allowed !== true) {
      errors.push('selection must carry current preHUD display eligibility');
    }
    if (isUnsafePrehudDisplay(row?.selected_definition)) {
      errors.push('selected_definition is not safe for preHUD display');
    }
    const routeLabels = [
      row?.selected_route_section,
      row?.selected_route_type,
      row?.selected_route_family,
      row?.display_section,
      row?.route_type,
      row?.route_family,
      row?.match_family,
      row?.route_match_family,
    ].map(normalizeRouteLabel).filter(Boolean);
    if (routeLabels.some((label) => prehudEvidenceOnlyRouteTypes.has(label))) {
      errors.push('selection route evidence is HUD-only, not preHUD display eligible');
    }
    const sourceRows = cleanValues(row?.source_rows);
    if (!sourceRows.length || sourceRows.some((sourceRow) => !sourceRowHasPublicFields(sourceRow))) {
      errors.push('source_rows must include source_name, source_id, source_url, license, and license_url');
    }
    return errors;
  }

  function routeSection(card) {
    return card.display_section || card.route_type || card.route_family || 'audit';
  }

  function isUsageEvidenceCard(card) {
    if (!card) return false;
    const routeFields = [card.display_section, card.route_type, card.route_family, card.answer_role, card.meaning_quality]
      .map(normalizeRouteLabel)
      .filter(Boolean);
    return routeFields.some((value) => usageEvidenceRouteTypes.has(value)) || Boolean(card.usage_note || card.frame_label);
  }

  function routeRenderings(card) {
    if (!card) return [];
    if (isUsageEvidenceCard(card)) {
      return [firstPresentValue([card.linked_route_definition, card.linked_definition, card.route_definition, card.route_definition_text]) || 'observed usage only'];
    }
    const genericUsage = 'Usage context only; no meaning is forced by this phrase row.';
    const values = [];
    const definition = firstPresentValue([card.definition, card.gloss]);
    if (definition && definition !== genericUsage) values.push(definition);
    const meaningClaim = firstPresentValue([card.meaning_claim]);
    if (meaningClaim) values.push(meaningClaim);
    return values;
  }

  function answerRoleAllowsDefinition(role) {
    const cleanRole = String(role || '').toLowerCase().replace(/[\s-]+/g, '_');
    return ['', 'answer', 'definition', 'reader_answer', 'primary_definition'].includes(cleanRole);
  }

  function cardHasAnswerContract(card) {
    return Object.prototype.hasOwnProperty.call(card || {}, 'answer_eligible')
      || Object.prototype.hasOwnProperty.call(card || {}, 'answer_role');
  }

  function isAnswerEligible(card) {
    if (isUsageEvidenceCard(card)) return false;
    if (!card || !productionSections.has(routeSection(card)) || !routeRenderings(card).length) return false;
    if (card.answer_eligible === false || !answerRoleAllowsDefinition(card.answer_role)) return false;
    if (card.answer_eligible === true) return true;
    if (cardHasAnswerContract(card)) return false;
    return card.meaning_quality === 'definition' && !['phrase_evidence', 'subphrase_evidence'].includes(routeSection(card));
  }

  function isValidatedStructureEvidence(card) {
    if (!card || card.answer_eligible !== false) return false;
    const labels = [routeSection(card), card.route_type, card.route_family, card.meaning_quality, card.answer_role]
      .map(normalizeRouteLabel)
      .filter(Boolean);
    const isStructureEvidence = labels.includes('token_structure')
      || labels.includes('structure_evidence')
      || labels.includes('token_structure_rule');
    if (!isStructureEvidence || !labels.includes('evidence')) return false;
    const sourceRows = cleanValues(card.source_rows);
    return sourceRows.length > 0 && sourceRows.every((row) => (
      normalizeRouteLabel(row?.source_family) === 'token_structure_rule'
      && normalizeRouteLabel(row?.license) === 'not_a_definition_source'
    ));
  }

  function isLemmaEvidenceCard(card) {
    if (!card) return false;
    const labels = [routeSection(card), card.route_type, card.route_family, card.match_type, card.answer_role, card.meaning_quality]
      .map(normalizeRouteLabel)
      .filter(Boolean);
    if (!labels.some((label) => label === 'lemma' || label === 'lemma_only' || label.includes('lemma'))) return false;
    return cleanValues(card.source_rows).some(sourceRowHasPublicFields);
  }

  function isPrehudDisplayEligibleCard(card) {
    if (!isAnswerEligible(card)) return false;
    const routeLabels = [routeSection(card), card.route_type, card.route_family, card.match_family, card.route_match_family]
      .map(normalizeRouteLabel)
      .filter(Boolean);
    if (routeLabels.some((label) => prehudEvidenceOnlyRouteTypes.has(label))) return false;
    return !routeRenderings(card).some((line) => isUnsafePrehudDisplay(line));
  }

  function canSaveGlossSelection(card) {
    return Boolean(
      card
      && isPrehudDisplayEligibleCard(card)
      && card.answer_eligible === true
      && answerRoleAllowsDefinition(card.answer_role)
      && !isUsageEvidenceCard(card)
      && routeRenderings(card).length
      && cleanValues(card.source_rows).some(sourceRowHasPublicFields)
    );
  }

  function routeScore(card) {
    const base = Number.isFinite(card.adjusted_score)
      ? card.adjusted_score
      : (Number.isFinite(card.raw_score) ? card.raw_score : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0));
    const penalty = Number.isFinite(card.lookup_penalty) ? card.lookup_penalty : 0;
    return Math.max(0, Math.round(base - penalty));
  }

  function routeScoreBasis(card) {
    const parts = [];
    if (Number.isFinite(card.raw_score)) parts.push(`raw ${card.raw_score}`);
    if (Number.isFinite(card.score_handicap) && card.score_handicap) parts.push(`handicap ${card.score_handicap}`);
    if (Number.isFinite(card.adjusted_score)) parts.push(`adjusted ${card.adjusted_score}`);
    if (card.lookup_relation && card.lookup_relation !== 'exact') parts.push(`${card.lookup_relation} -${card.lookup_penalty || 0}`);
    if (card.source_ref) parts.push(card.source_ref);
    return parts;
  }

  function definitionMatchLabel(card) {
    if (!card) return 'no match';
    const section = routeSection(card);
    const matchKind = section === 'strict_hebrew'
      ? 'Hebrew match'
      : (section === 'strict_aramaic' ? 'Aramaic match' : (routeSectionTitles.get(section) || 'route match'));
    const relation = card.lookup_relation && card.lookup_relation !== 'exact' ? card.lookup_relation : 'direct';
    return `${routeScore(card)}% | ${matchKind} | ${relation}`;
  }

  function compareRouteCards(leftCard, rightCard) {
    const left = [
      -(routeScore(leftCard) ?? -1000),
      routeSectionRank.get(routeSection(leftCard)) ?? 9,
      -(Number.isFinite(leftCard.answer_score) ? leftCard.answer_score : 0),
      String(leftCard.card_id || ''),
    ];
    const right = [
      -(routeScore(rightCard) ?? -1000),
      routeSectionRank.get(routeSection(rightCard)) ?? 9,
      -(Number.isFinite(rightCard.answer_score) ? rightCard.answer_score : 0),
      String(rightCard.card_id || ''),
    ];
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] < right[index]) return -1;
      if (left[index] > right[index]) return 1;
    }
    return 0;
  }

  function answerTextKey(card) {
    return routeRenderings(card)
      .map((line) => String(line || '').replace(/\s+/g, ' ').trim().toLowerCase())
      .filter(Boolean)
      .join(' | ');
  }

  function answerAmbiguity(primary, candidates) {
    if (!primary) return { ambiguous: false, count: 0 };
    const topScore = routeScore(primary);
    const topRelation = primary.lookup_relation || 'exact';
    const close = candidates.filter((card) => (card.lookup_relation || 'exact') === topRelation && Math.abs(routeScore(card) - topScore) <= 6);
    const meanings = new Set(close.map(answerTextKey).filter(Boolean));
    return { ambiguous: meanings.size > 1, count: meanings.size };
  }

  function selectRouteAnswer(cards) {
    const candidates = cards.filter(isPrehudDisplayEligibleCard).sort(compareRouteCards);
    const exactAnswer = candidates.filter((card) => (card.lookup_relation || 'exact') === 'exact').sort(compareRouteCards)[0];
    const selected = exactAnswer || candidates[0] || null;
    const ambiguity = answerAmbiguity(selected, candidates);
    return {
      answerCard: ambiguity.ambiguous ? null : selected,
      answerState: ambiguity.ambiguous ? 'ambiguous' : (selected ? 'definition' : 'none'),
      ambiguityCount: ambiguity.count,
    };
  }

  function addLookupCandidate(map, key, relation, penalty = 0) {
    const normalized = normalizeHebrewKey(key);
    if (!normalized || map.has(normalized)) return;
    map.set(normalized, { key: normalized, relation, penalty });
  }

  function lookupCandidateTreatments(lookupCandidates) {
    return cleanValues(lookupCandidates)
      .filter((candidate) => candidate.relation && candidate.relation !== 'exact')
      .map((candidate) => ({
        text: candidate.key,
        note: `${candidate.relation} -${candidate.penalty || 0}`,
      }));
  }

  function lookupCandidatesFor(clickedForm, normalized) {
    const candidates = new Map();
    addLookupCandidate(candidates, normalized || clickedForm, 'exact', 0);
    const primary = normalizeHebrewKey(normalized || clickedForm);
    String(primary || '').split(/[\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => addLookupCandidate(candidates, part, 'maqaf component', 12));
    const prefixPattern = /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/;
    for (let pass = 0; pass < 3; pass += 1) {
      [...candidates.values()].slice().forEach((candidate) => {
        if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) addLookupCandidate(candidates, candidate.key.slice(1), 'prefix-stripped candidate', 20 + pass * 4);
      });
    }
    [...candidates.values()].slice().forEach((candidate) => {
      if (!candidate.key.endsWith('\u05D9\u05DE')) return;
      const stem = candidate.key.slice(0, -2);
      if (stem.endsWith('\u05D4') && stem.length >= 3) addLookupCandidate(candidates, `${stem.slice(0, -1)}\u05D5\u05D4\u05D9\u05DE`, 'mater-expanded plural candidate', 14);
    });
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
      suffixRules.forEach((rule) => {
        if (candidate.key.endsWith(rule.suffix) && candidate.key.length - rule.suffix.length >= 3) {
          addLookupCandidate(candidates, candidate.key.slice(0, -rule.suffix.length), rule.relation, rule.penalty);
        }
      });
    });
    return [...candidates.values()];
  }

  function crossmatchesFromIndex(index, normalized, currentRef) {
    const key = normalizeHebrewKey(normalized || '');
    const row = index?.matches_by_normalized?.[key] || null;
    if (!row) return { normalized_word: key, occurrence_count: 0, refs: [], surface_forms: [] };
    const current = String(currentRef || '').trim();
    const refs = cleanValues(row.refs).filter((ref) => {
      const refName = String(ref.source_ref || ref.anchor_id || '').trim();
      return refName && refName !== current;
    });
    return {
      ...row,
      refs,
    };
  }

  function codepointKey(value, prefixLength) {
    const chars = [...String(value || '')].slice(0, prefixLength);
    if (!chars.length) return 'empty';
    const first = chars[0].codePointAt(0);
    if (first < 0x05d0 || first > 0x05ea) return 'other';
    return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function appendPhraseLine(card, parent) {
    const tokens = cleanValues(card.phrase_tokens);
    const phraseText = firstPresentValue([card.phrase_hebrew, card.phrase_text_hebrew, card.phrase]);
    if (!tokens.length && !phraseText) return;
    const phrase = createElement('p', 'phrase-line');
    phrase.lang = 'he';
    phrase.dir = 'rtl';
    if (!tokens.length) {
      phrase.textContent = normalizeHebrewDisplay(phraseText);
      parent.appendChild(phrase);
      return;
    }
    tokens.forEach((token, index) => {
      if (index) phrase.append(' ');
      const span = createElement('span', token.role === 'focus-token' || token.role === 'focus-part' ? 'phrase-focus' : 'phrase-context', normalizeHebrewDisplay(token.surface || ''));
      phrase.appendChild(span);
    });
    parent.appendChild(phrase);
  }

  function appendSourceDetails(parent, rows, config) {
    const cleanRows = cleanValues(rows);
    if (!cleanRows.length) return;
    const summary = sourceSummary(cleanRows);
    parent.appendChild(createElement('p', 'reader-gloss-source', `${summary.source || 'Source'} | ${summary.license || 'license missing'}`));
    const details = createElement('details', 'reader-source-details');
    details.open = true;
    details.appendChild(createElement('summary', '', `Sources and licenses (${cleanRows.length})`));
    cleanRows.forEach((row, index) => {
      const line = createElement('p');
      const sourceHref = resolveSourceUrl(row.source_url, config || {});
      line.append(`${index + 1}. `);
      if (sourceHref) {
        const link = createElement('a', '', row.source_name || 'Source');
        link.href = sourceHref;
        line.appendChild(link);
      } else {
        line.append(row.source_name || 'Source');
      }
      line.append(` | ${row.source_id || 'N/A'} | ${displayLicense(row)}`);
      details.appendChild(line);
    });
    parent.appendChild(details);
  }

  function buildSourceNotes(cards) {
    const noteMap = new Map();
    const cardMap = new Map();
    cleanValues(cards).forEach((card) => {
      const indexes = [];
      cleanValues(card.source_rows).forEach((row) => {
        const key = `${row.source_family || ''}|${row.source_id || ''}`;
        if (!key || key === '|') return;
        if (!noteMap.has(key)) noteMap.set(key, { index: noteMap.size + 1, row });
        indexes.push(noteMap.get(key).index);
      });
      const uniqueIndexes = uniqueValues(indexes).slice(0, 4);
      if (uniqueIndexes.length) cardMap.set(card, uniqueIndexes);
    });
    return { cardMap, notes: [...noteMap.values()] };
  }

  function appendSourceFootnotes(panel, notes, config) {
    const cleanNotes = cleanValues(notes);
    if (!cleanNotes.length) {
      if (!config?.hud_show_empty_source_licenses && !config?.hud_hide_unvalidated_routes) return;
      const details = createElement('details', 'source-footnotes route-source-card');
      details.open = true;
      details.appendChild(createElement('summary', '', 'Sources and licenses (0)'));
      details.appendChild(createElement('p', 'placeholder', 'No licensed definition source selected yet.'));
      panel.appendChild(details);
      return;
    }
    const details = createElement('details', 'source-footnotes route-source-card');
    details.open = true;
    details.appendChild(createElement('summary', '', `Sources and licenses (${cleanNotes.length})`));
    cleanNotes.forEach(({ index, row }) => {
      const line = createElement('p', 'source-footnote-row');
      const marker = createElement('strong', '', `${index}. `);
      line.appendChild(marker);
      const sourceHref = resolveSourceUrl(row.source_url, config || {});
      if (sourceHref) {
        const link = createElement('a', '', row.source_name || 'Source');
        link.href = sourceHref;
        line.appendChild(link);
      } else {
        line.append(row.source_name || 'Source');
      }
      line.append(` | ${row.source_id || 'N/A'} | ${displayLicense(row)}`);
      details.appendChild(line);
    });
    panel.appendChild(details);
  }

  function applySelectionToToken(button, selection) {
    if (!button) return;
    if (selectionContractErrors(selection).length) return;
    const selectedDefinition = selection?.selected_definition || '';
    setTokenGlossDisplay(button, selectedDefinition, selection?.match_percent ?? selection?.confidence_percent, !selectedDefinition);
    button.dataset.glossSelected = selection ? 'true' : 'false';
    button.dataset.selectedGloss = selection?.selected_definition || '';
  }

  function currentAssembly() {
    const selected = [...document.querySelectorAll('[data-selected-gloss]')].map((node) => node.dataset.selectedGloss).filter(Boolean);
    return selected.join(' ');
  }

  function updateWorkbenchPanel() {
    const panel = document.querySelector('[data-reader-workbench]');
    if (!panel) return;
    const selected = [...document.querySelectorAll('[data-selected-gloss]')].map((node) => node.dataset.selectedGloss).filter(Boolean);
    panel.hidden = selected.length === 0;
    const assembly = panel.querySelector('[data-reader-assembly]');
    if (assembly) assembly.textContent = selected.join(' ');
    const status = panel.querySelector('[data-reader-status]');
    if (status) status.textContent = `${selected.length} selected gloss${selected.length === 1 ? '' : 'es'} | ${PRODUCT_STATUS}`;
  }

  function saveSelection(button, card) {
    if (!canSaveGlossSelection(card)) return null;
    const rendering = routeRenderings(card)[0] || '';
    if (!rendering) return null;
    const unit = button.closest('[data-unit]');
    const now = new Date().toISOString();
    const confidencePercent = firstNumericValue([card.confidence_percent, card.adjusted_score, card.raw_score, routeScore(card)]);
    const selection = {
      schema_version: 1,
      artifact_type: 'gloss_selection',
      selection_id: selectionId(button, card),
      work_id: button.dataset.workId || siteApi?.config?.work_id || location.pathname,
      unit_id: unit?.dataset.unitId || unit?.id || '',
      source_ref: unit?.dataset.sourceRef || '',
      surface_occurrence_id: button.dataset.surfaceOccurrenceId || '',
      surface_token_id: button.dataset.surfaceTokenId || button.dataset.lexicalIndex || '',
      surface_token_key: button.dataset.lexicalToken || '',
      surface_text: button.dataset.lexicalSurface || button.textContent.trim(),
      normalized: button.dataset.normalized || normalizeHebrewKey(button.textContent),
      selected_card_id: card.card_id || '',
      selected_definition: rendering,
      selected_route_section: routeSection(card),
      selected_route_type: card.route_type || '',
      selected_route_family: card.route_family || '',
      selected_lookup_relation: card.lookup_relation || 'exact',
      match_family: card.match_family || card.route_match_family || routeSection(card),
      display_eligible: true,
      prehud_allowed: true,
      answer_eligible: card.answer_eligible === true,
      answer_role: card.answer_role || (card.answer_eligible === true ? 'answer' : 'evidence'),
      confidence_percent: confidencePercent,
      match_percent: confidencePercent,
      source_rows: cleanValues(card.source_rows),
      user_note: '',
      study_status: 'draft',
      publication_status: PRODUCT_STATUS,
      created_at: now,
      updated_at: now,
    };
    const store = loadSelectionStore();
    store.selections[tokenSelectionKey(button)] = selection;
    saveSelectionStore(store);
    button.dataset.selectedGloss = selection.selected_definition;
    button.setAttribute('data-selected-gloss', selection.selected_definition);
    applySelectionToToken(button, selection);
    updateWorkbenchPanel();
    return selection;
  }

  function restoreSelections() {
    const store = loadSelectionStore();
    document.querySelectorAll('[data-lexical-token]').forEach((button) => {
      const selection = store.selections[tokenSelectionKey(button)];
      if (!selection) return;
      if (selectionContractErrors(selection).length) return;
      button.dataset.selectedGloss = selection.selected_definition;
      button.setAttribute('data-selected-gloss', selection.selected_definition);
      applySelectionToToken(button, selection);
    });
    updateWorkbenchPanel();
  }

  function exportStudySheet() {
    const store = loadSelectionStore();
    const currentWork = siteApi?.config?.work_id || location.pathname;
    const selections = Object.values(store.selections || {}).filter((selection) => (
      selection
      && selection.publication_status === PRODUCT_STATUS
      && selection.work_id === currentWork
      && !selectionContractErrors(selection).length
    ));
    const exportRows = {
      schema_version: 1,
      artifact_type: 'gloss_assembly',
      generated_at: new Date().toISOString(),
      page_url: location.href,
      selection_count: selections.length,
      selections,
      assembled_gloss: currentAssembly(),
      assembly_mode: 'interlinear_gloss',
      publication_status: PRODUCT_STATUS,
    };
    const blob = new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json' });
    const link = createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reader-workbench-study-sheet.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function importableSelectionsFromData(data) {
    if (data?.publication_status !== PRODUCT_STATUS) {
      throw new Error(`Reader Workbench import rejected: top-level publication_status must be ${PRODUCT_STATUS}.`);
    }
    const rows = data?.artifact_type === 'gloss_selection' ? [data] : cleanValues(data?.selections);
    const invalid = [];
    const accepted = rows
      .filter((row) => row && typeof row === 'object')
      .map((row, index) => {
        const selection = { ...row };
        const errors = selectionContractErrors(selection);
        if (errors.length) {
          invalid.push({ index, errors });
          return null;
        }
        return { ...selection, updated_at: new Date().toISOString() };
      })
      .filter(Boolean);
    if (invalid.length) {
      throw new Error(`Reader Workbench import rejected: ${invalid.length} row(s) failed the gloss_selection contract.`);
    }
    return accepted;
  }

  async function importStudySheetData(data) {
    if (!data || (data.artifact_type !== 'gloss_assembly' && data.artifact_type !== 'gloss_selection')) {
      throw new Error('Reader Workbench import expects a gloss_assembly or gloss_selection JSON file.');
    }
    const selections = importableSelectionsFromData(data);
    if (!selections.length) throw new Error('No not_a_translation gloss selections found in import file.');
    const store = loadSelectionStore();
    selections.forEach((selection) => {
      store.selections[selectionKeyFromSelection(selection)] = selection;
    });
    saveSelectionStore(store);
    restoreSelections();
    return selections.length;
  }

  async function importStudySheetFromFile(file) {
    if (!file) return 0;
    const text = await file.text();
    return importStudySheetData(JSON.parse(text));
  }

  function bindReaderImport(input, trigger) {
    if (!input || !trigger || trigger.dataset.readerImportBound === 'true') return;
    trigger.dataset.readerImportBound = 'true';
    trigger.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      try {
        const count = await importStudySheetFromFile(file);
        const status = document.querySelector('[data-reader-status]');
        if (status) status.textContent = `${count} imported gloss${count === 1 ? '' : 'es'} | ${PRODUCT_STATUS}`;
      } catch (error) {
        console.error(error);
        const status = document.querySelector('[data-reader-status]');
        if (status) status.textContent = `Import failed | ${PRODUCT_STATUS}`;
      }
    });
  }

  function renderGlossChoice(parent, button, card, config) {
    const rendering = routeRenderings(card)[0];
    if (!rendering) return;
    const selectable = canSaveGlossSelection(card);
    const article = createElement('article', 'reader-gloss-card');
    article.dataset.answerEligible = card.answer_eligible === true ? 'true' : 'false';
    article.dataset.evidenceOnly = selectable ? 'false' : 'true';
    article.dataset.rankBasis = routeScoreBasis(card).join(' / ') || 'No rank fields on this card.';
    const top = createElement('div', 'reader-gloss-top');
    top.appendChild(createElement('strong', '', selectable ? 'Definition option' : 'Evidence only'));
    top.appendChild(createElement('span', 'reader-gloss-meta', `${routeScore(card)}% | ${card.answer_role || (card.answer_eligible === true ? 'answer' : 'evidence')}`));
    article.appendChild(top);
    article.appendChild(createElement('p', 'reader-gloss-definition', normalizeHebrewDisplay(rendering)));
    if (!selectable) {
      article.appendChild(createElement('p', 'reader-gloss-meta', 'Not selectable as a gloss authority; inspect as evidence only.'));
    }
    const meta = [
      card.display_label || card.route_type || card.route_family,
      card.lookup_relation && card.lookup_relation !== 'exact' ? card.lookup_relation : '',
    ].filter(Boolean).join(' | ');
    if (meta) article.appendChild(createElement('p', 'reader-gloss-meta', meta));
    appendPhraseLine(card, article);
    appendSourceDetails(article, card.source_rows, config);
    const choose = createElement('button', 'reader-gloss-choice', selectable ? 'Use this gloss' : 'Evidence only');
    choose.type = 'button';
    choose.disabled = !selectable;
    if (selectable) choose.addEventListener('click', () => saveSelection(button, card));
    article.appendChild(choose);
    parent.appendChild(article);
  }

  function appendUsageEvidenceDetails(card, parent) {
    if (!isUsageEvidenceCard(card)) return;
    const rows = [
      ['Usage', card.usage_note],
      ['Frame', card.frame_label],
      ['Status', firstPresentValue([card.status, card.candidate_status, card.claim_status, card.display_status, card.confidence_band, card.answer_role])],
      ['Score', `${routeScore(card)}%`],
      ['Source', firstPresentValue([card.source_ref, card.ref, card.occurrence_ref])],
    ].filter((row) => firstPresentValue([row[1]]));
    if (!rows.length) return;
    const box = createElement('div', 'usage-evidence-details');
    rows.forEach(([labelText, value]) => {
      const line = createElement('p');
      const label = createElement('strong', '', `${labelText}: `);
      line.append(label, normalizeHebrewDisplay(String(value || '')));
      box.appendChild(line);
    });
    parent.appendChild(box);
  }

  function appendStructureEvidenceDetails(card, parent) {
    const morphology = card?.morphology;
    if (!morphology || typeof morphology !== 'object') return;
    const rows = [
      ['Surface', morphology.surface_form || card.surface || card.hebrew],
      ['Type', morphology.structure_type],
      ['Prefix', morphology.prefix],
      ['Suffix', morphology.suffix],
      ['Maqaf parts', Array.isArray(morphology.maqaf_parts) ? morphology.maqaf_parts.join(' | ') : morphology.maqaf_parts],
      ['Base / expansion', morphology.base_or_expansion],
      ['Route key', morphology.route_key],
      ['Relation', morphology.evidence_relation],
      ['Note', morphology.occurrence_note],
    ].filter((row) => firstPresentValue([row[1]]));
    if (!rows.length) return;
    const box = createElement('div', 'structure-evidence-details');
    rows.forEach(([labelText, value]) => {
      const line = createElement('p');
      line.appendChild(createElement('strong', '', `${labelText}: `));
      const text = createElement('span', '', normalizeHebrewDisplay(String(value || '')));
      if (/[\u0590-\u05FF]/.test(String(value || ''))) {
        text.lang = 'he';
        text.dir = 'rtl';
      }
      line.appendChild(text);
      box.appendChild(line);
    });
    box.appendChild(createElement('small', 'hud-study-note', 'structure evidence only; not a definition or preHUD gloss'));
    parent.appendChild(box);
  }

  function appendRouteCard(parent, card, role = 'evidence', order = 0, sourceIndexes = []) {
    const article = createElement('article', `claim-row route-card ${role === 'answer' ? 'route-answer-card' : ''}`);
    const cardHebrew = normalizeHebrewDisplay(card.hebrew || card.surface || '');
    article.dataset.routeHebrew = cardHebrew;
    article.dataset.rankBasis = routeScoreBasis(card).join(' / ') || 'No rank fields on this card.';
    if (role !== 'answer') {
      const head = createElement('div', 'claim-row-head');
      head.appendChild(createElement('span', 'claim-status', order ? `#${order}` : 'route'));
      const hebrew = createElement('strong', 'claim-hebrew', cardHebrew);
      hebrew.lang = 'he';
      hebrew.dir = 'rtl';
      head.appendChild(hebrew);
      article.appendChild(head);
    }
    const renderings = routeRenderings(card);
    if (renderings.length) {
      renderings.forEach((line, index) => {
        const p = createElement('p', 'claim-renderings', normalizeHebrewDisplay(line));
        if (index === 0 && sourceIndexes.length) {
          const sup = createElement('sup', 'source-note-index', sourceIndexes.join(','));
          p.appendChild(sup);
        }
        article.appendChild(p);
      });
    } else {
      article.dataset.evidenceOnly = 'true';
    }
    const meta = createElement('p', 'route-meta', [routeSectionTitles.get(routeSection(card)) || routeSection(card), `${routeScore(card)}%`, card.lookup_relation || 'direct'].filter(Boolean).join(' | '));
    article.dataset.routeMeta = meta.textContent;
    if (role !== 'answer') article.appendChild(meta);
    appendPhraseLine(card, article);
    appendStructureEvidenceDetails(card, article);
    appendUsageEvidenceDetails(card, article);
    parent.appendChild(article);
  }

  function appendRouteSection(panel, sectionId, cards, sourceCardMap, options = {}) {
    const cleanCards = cleanValues(cards);
    const section = createElement('section', 'route-section-card');
    const title = createElement('div', 'route-section-title');
    title.appendChild(createElement('h3', '', routeSectionTitles.get(sectionId) || sectionId));
    title.appendChild(createElement('span', '', `${cleanCards.length} route${cleanCards.length === 1 ? '' : 's'}`));
    section.appendChild(title);
    if (!cleanCards.length) {
      if (!options.appendEmpty) return;
      section.appendChild(createElement('p', 'placeholder', options.emptyText || `${routeSectionTitles.get(sectionId) || sectionId} not found for this token.`));
      panel.appendChild(section);
      return;
    }
    const lane = createElement('div', cleanCards.length > 1 ? 'claim-row-list hud-card-lane' : 'claim-row-list');
    cleanCards.sort(compareRouteCards).forEach((card, index) => appendRouteCard(lane, card, 'evidence', index + 1, sourceCardMap ? sourceCardMap.get(card) : []));
    section.appendChild(lane);
    panel.appendChild(section);
  }

  function validatedHudCards(cards, config) {
    const rows = cleanValues(cards);
    if (!config?.hud_validated_only) return rows;
    return rows.filter((card) => (
      (
        isAnswerEligible(card)
        && (config.hud_allow_lemma_only === true || routeSection(card) !== 'lemma')
      )
      || isLemmaEvidenceCard(card)
      || isValidatedStructureEvidence(card)
    ));
  }

  function appendSelectedHudToken(panel, clickedForm, normalized) {
    const selected = createElement('div', 'route-selected-token', normalizeHebrewDisplay(clickedForm || ''));
    selected.lang = 'he';
    selected.dir = 'rtl';
    panel.appendChild(selected);
    if (normalized) panel.appendChild(createElement('p', 'hud-token-key', `normalized: ${normalized}`));
  }

  function appendPlaceholderHudSection(panel) {
    const section = createElement('section', 'route-section-card route-answer-card');
    const title = createElement('div', 'route-section-title');
    title.appendChild(createElement('h3', '', 'Definition'));
    title.appendChild(createElement('span', '', 'no match'));
    section.appendChild(title);
    section.appendChild(createElement('p', 'placeholder', 'No validated Hebrew or Aramaic definition match for this token yet. Lemma, word-part, phrasing, and source evidence can still appear below, but evidence is not a definition.'));
    panel.appendChild(section);
  }

  function shouldAppendEmptyRouteSection(sectionId, config) {
    if ((sectionId === 'strict_hebrew' || sectionId === 'strict_aramaic') && config?.hud_collapse_empty_strict_sections === true) {
      return false;
    }
    return sectionId === 'strict_hebrew' || sectionId === 'strict_aramaic' || sectionId === 'morphology';
  }

  function lemmaRowsFromToken(tokenRow) {
    const rows = [];
    const entry = tokenRow?.lexicon_entry || {};
    cleanValues(entry.possible_entries).forEach((candidate) => {
      const lemma = firstPresentValue([candidate.lemma, candidate.match_key, candidate.entry_key]);
      const source = [candidate.source_name, candidate.source_id].filter(Boolean).join(' ');
      const relation = firstPresentValue([candidate.relation_label, candidate.context_role]);
      if (!lemma && !source && !relation) return;
      rows.push({ lemma, source, relation });
    });
    if (!rows.length && tokenRow?.lexicon_entry_id) {
      rows.push({ lemma: tokenRow.lexicon_entry_id, source: 'token manifest', relation: tokenRow.status || 'matched' });
    }
    const seen = new Set();
    return rows.filter((row) => {
      const key = `${row.lemma}|${row.source}|${row.relation}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }

  function appendLemmaHudSection(panel, tokenRow, lemmaCards = [], sourceCardMap = null) {
    const cards = cleanValues(lemmaCards).sort(compareRouteCards);
    const rows = lemmaRowsFromToken(tokenRow);
    if (!rows.length && !cards.length) {
      return;
    }

    const section = createElement('section', 'route-section-card hud-study-card');
    const title = createElement('div', 'route-section-title');
    title.appendChild(createElement('h3', '', 'Lemma / base form'));
    title.appendChild(createElement('span', '', `${cards.length + rows.length} evidence item${cards.length + rows.length === 1 ? '' : 's'}`));
    section.appendChild(title);

    if (cards.length) {
      const lane = createElement('div', cards.length > 1 ? 'claim-row-list hud-card-lane' : 'claim-row-list');
      cards.forEach((card, index) => appendRouteCard(lane, card, 'evidence', index + 1, sourceCardMap ? sourceCardMap.get(card) : []));
      section.appendChild(lane);
    }

    if (rows.length) {
      const list = createElement('ul', 'hud-lemma-list');
      rows.forEach((row) => {
        const item = createElement('li');
        const lemma = createElement('span', 'hud-hebrew-text', normalizeHebrewDisplay(row.lemma || ''));
        lemma.lang = 'he';
        lemma.dir = 'rtl';
        item.appendChild(lemma);
        const meta = [row.source, row.relation].filter(Boolean).join(' | ');
        if (meta) item.appendChild(createElement('small', '', meta));
        list.appendChild(item);
      });
      section.appendChild(list);
    }
    section.appendChild(createElement('small', 'hud-study-note', 'Plain English: a lemma is the base/root form used to explain how this word is being looked up. It is evidence, not the Definition above.'));
    panel.appendChild(section);
  }

  function appendCrossmatchHudSection(panel, crossmatch) {
    const section = createElement('section', 'route-section-card hud-study-card');
    const refs = cleanValues(crossmatch?.refs);
    const total = Number(crossmatch?.occurrence_count || refs.length || 0);
    const title = createElement('div', 'route-section-title');
    title.appendChild(createElement('h3', '', 'Same Hebrew form'));
    title.appendChild(createElement('span', '', total ? `${total} occurrence${total === 1 ? '' : 's'}` : 'none'));
    section.appendChild(title);

    if (refs.length) {
      const list = createElement('ul', 'hud-crossmatch-list');
      refs.slice(0, 16).forEach((ref) => {
        const item = createElement('li');
        const link = createElement('a', '', ref.source_ref || ref.anchor_id || 'reference');
        if (ref.anchor_id) link.href = `#${ref.anchor_id}`;
        item.appendChild(link);
        if (Number(ref.count || 0) > 1) item.appendChild(createElement('small', '', `${ref.count}x`));
        list.appendChild(item);
      });
      section.appendChild(list);
      if (refs.length > 16) section.appendChild(createElement('small', 'hud-study-note', `+${refs.length - 16} more references`));
      section.appendChild(createElement('small', 'hud-study-note', 'same Hebrew form only; not a definition'));
    } else {
      section.appendChild(createElement('p', 'placeholder', 'No matching passage uses this normalized Hebrew form.'));
      section.appendChild(createElement('small', 'hud-crossmatch-empty', 'hebrew matches not found'));
    }

    panel.appendChild(section);
  }

  function renderStudyHudFrame(panel, clickedForm, normalized, tokenRow, crossmatch, config) {
    panel.replaceChildren();
    appendSelectedHudToken(panel, clickedForm, normalized);
    appendPlaceholderHudSection(panel);
    appendRouteSection(panel, 'strict_hebrew', [], null, { appendEmpty: shouldAppendEmptyRouteSection('strict_hebrew', config), emptyText: 'Strict Hebrew matches not found for this token.' });
    appendRouteSection(panel, 'strict_aramaic', [], null, { appendEmpty: shouldAppendEmptyRouteSection('strict_aramaic', config), emptyText: 'Strict Aramaic matches not found for this token.' });
    appendRouteSection(panel, 'morphology', [], null, { appendEmpty: true, emptyText: 'Word-part breakdown not found for this token.' });
    appendLemmaHudSection(panel, tokenRow);
    appendCrossmatchHudSection(panel, crossmatch);
    appendSourceFootnotes(panel, [], config);
  }

  function renderA13PresentationHud(panel, button, clickedForm, normalized, visibleCards, lookupCandidates, config, tokenRow, crossmatch) {
    const sourceNotes = buildSourceNotes(visibleCards);
    const slot = visibleSlotForButton(button);
    const selectedCard = routeCardById(visibleCards, slot?.a7_hud_selected_gloss_card_id);
    const evidenceCard = routeCardById(visibleCards, slot?.a7_hud_cited_evidence_card_id);
    const approvedCards = new Set([selectedCard, evidenceCard].filter(Boolean));

    appendSelectedHudToken(panel, clickedForm || normalized || '', normalized);
    appendA13GlossHudSection(panel, slot, selectedCard);
    appendA13ApprovedEvidenceSection(panel, slot, selectedCard, evidenceCard, sourceNotes.cardMap);
    appendSourceFootnotes(panel, buildSourceNotes([...approvedCards]).notes, config);

    appendCollapsedHudEvidence(panel, 'Additional route evidence (hidden by default)', (body) => {
      const generatedRows = config?.hud_hide_unvalidated_routes ? [] : lookupCandidateTreatments(lookupCandidates);
      if (generatedRows.length) {
        const treatment = createElement('section', 'route-treatment-card');
        treatment.appendChild(createElement('strong', '', 'Form treatment'));
        generatedRows.forEach((item) => treatment.appendChild(createElement('p', 'route-treatment-line', `${item.text} - ${item.note}`)));
        body.appendChild(treatment);
      }

      const bySection = new Map();
      visibleCards
        .filter((card) => !approvedCards.has(card))
        .forEach((card) => {
          const section = routeSection(card);
          if (!bySection.has(section)) bySection.set(section, []);
          bySection.get(section).push(card);
        });
      const lemmaCards = bySection.get('lemma') || [];
      bySection.delete('lemma');
      appendLemmaHudSection(body, tokenRow, lemmaCards, sourceNotes.cardMap);

      ['strict_hebrew', 'strict_aramaic', 'morphology', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence', 'usage_evidence', 'phrase_evidence']
        .forEach((section) => appendRouteSection(body, section, bySection.get(section) || [], sourceNotes.cardMap, {
          appendEmpty: false,
          emptyText: `${routeSectionTitles.get(section) || section} not found for this token.`,
        }));
      [...bySection.keys()]
        .filter((section) => !routeSectionTitles.has(section))
        .sort((a, b) => (routeSectionRank.get(a) ?? 9) - (routeSectionRank.get(b) ?? 9))
        .forEach((section) => appendRouteSection(body, section, bySection.get(section) || [], sourceNotes.cardMap));

      appendCrossmatchHudSection(body, crossmatch);

      if (!config?.hud_hide_unvalidated_routes) {
        const lookup = createElement('details', 'route-audit-card');
        lookup.appendChild(createElement('summary', '', `Lookup keys (${lookupCandidates.length})`));
        lookup.appendChild(createElement('p', 'placeholder', `Normalized key: ${normalized || 'N/A'} | Cards: ${visibleCards.length} | Lookup keys: ${lookupCandidates.map((item) => `${item.key}${item.relation === 'exact' ? '' : ` (${item.relation})`}`).join(', ') || 'none'}`));
        body.appendChild(lookup);
      }
      appendSourceFootnotes(body, sourceNotes.notes, config);
    });
  }

  function renderRouteHudPanel(panel, button, clickedForm, normalized, cards, lookupCandidates, config, tokenRow, crossmatch) {
    panel.replaceChildren();
    const visibleCards = validatedHudCards(cards, config);
    panel.dataset.hudPresentationMode = config?.hud_presentation_mode || '';
    if (isA13PresentationMode(config)) {
      renderA13PresentationHud(panel, button, clickedForm, normalized, visibleCards, lookupCandidates, config, tokenRow, crossmatch);
      return;
    }
    const sourceNotes = buildSourceNotes(visibleCards);
    appendSelectedHudToken(panel, clickedForm || normalized || '', normalized);

    const answerCandidates = visibleCards.filter(isPrehudDisplayEligibleCard).sort(compareRouteCards);
    const displayChoices = answerCandidates.slice(0, 8);

    const generatedRows = config?.hud_hide_unvalidated_routes ? [] : lookupCandidateTreatments(lookupCandidates);
    if (generatedRows.length) {
      const treatment = createElement('section', 'route-treatment-card');
      treatment.appendChild(createElement('strong', '', 'Form treatment'));
      generatedRows.forEach((item) => treatment.appendChild(createElement('p', 'route-treatment-line', `${item.text} - ${item.note}`)));
      panel.appendChild(treatment);
    }

    const { answerCard, answerState, ambiguityCount } = selectRouteAnswer(visibleCards);
    if (answerCard || answerState === 'ambiguous') {
      const answerSection = createElement('section', 'route-section-card route-answer-card');
      const answerTitle = createElement('div', 'route-section-title');
      answerTitle.appendChild(createElement('h3', '', answerState === 'ambiguous' ? 'Definition candidates' : 'Definition'));
      answerTitle.appendChild(createElement('span', '', answerCard ? definitionMatchLabel(answerCard) : `${ambiguityCount || 2} options`));
      answerSection.appendChild(answerTitle);
      if (answerCard) appendRouteCard(answerSection, answerCard, 'answer', 0, sourceNotes.cardMap.get(answerCard));
      else answerSection.appendChild(createElement('p', 'placeholder', 'Ambiguous; compare options and evidence below.'));
      panel.appendChild(answerSection);
    } else {
      appendPlaceholderHudSection(panel);
    }

    const bySection = new Map();
    visibleCards.filter((card) => card !== answerCard).forEach((card) => {
      const section = routeSection(card);
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section).push(card);
    });
    const lemmaCards = bySection.get('lemma') || [];
    bySection.delete('lemma');
    appendLemmaHudSection(panel, tokenRow, lemmaCards, sourceNotes.cardMap);

    if (displayChoices.length) {
      const picker = createElement('section', 'route-section-card reader-picker-intro');
      picker.appendChild(createElement('strong', '', 'Choose a study gloss'));
      picker.appendChild(createElement('p', 'placeholder', 'Selections are local study notes, not translations.'));
      const optionList = createElement('div', 'reader-gloss-options');
      displayChoices.forEach((card) => renderGlossChoice(optionList, button, card, config));
      picker.appendChild(optionList);
      panel.appendChild(picker);
    }

    ['strict_hebrew', 'strict_aramaic', 'morphology', 'subphrase_evidence', 'biblical_paraphrase_evidence', 'citable_paraphrase_evidence', 'usage_evidence', 'phrase_evidence']
      .forEach((section) => appendRouteSection(panel, section, bySection.get(section) || [], sourceNotes.cardMap, {
        appendEmpty: shouldAppendEmptyRouteSection(section, config),
        emptyText: `${routeSectionTitles.get(section) || section} not found for this token.`,
      }));
    [...bySection.keys()]
      .filter((section) => !routeSectionTitles.has(section))
      .sort((a, b) => (routeSectionRank.get(a) ?? 9) - (routeSectionRank.get(b) ?? 9))
      .forEach((section) => appendRouteSection(panel, section, bySection.get(section) || [], sourceNotes.cardMap));

    appendCrossmatchHudSection(panel, crossmatch);

    if (!config?.hud_hide_unvalidated_routes) {
      const lookup = createElement('details', 'route-audit-card');
      lookup.appendChild(createElement('summary', '', `Lookup keys (${lookupCandidates.length})`));
      lookup.appendChild(createElement('p', 'placeholder', `Normalized key: ${normalized || 'N/A'} | Cards: ${cards.length} | Lookup keys: ${lookupCandidates.map((item) => `${item.key}${item.relation === 'exact' ? '' : ` (${item.relation})`}`).join(', ') || 'none'}`));
      panel.appendChild(lookup);
    }
    appendSourceFootnotes(panel, sourceNotes.notes, config);
  }

  function setupWorkbenchPanel() {
    let panel = document.querySelector('[data-reader-workbench]');
    if (!panel) {
      panel = createElement('section', 'reader-workbench-panel');
      panel.dataset.readerWorkbench = '';
      panel.hidden = true;
      const main = document.querySelector('main') || document.body;
      main.appendChild(panel);
    }
    if (!panel.children.length) {
      const head = createElement('div', 'reader-workbench-head');
      head.appendChild(createElement('h3', '', 'Reader Workbench'));
      head.appendChild(createElement('span', 'reader-workbench-status', '',));
      head.lastChild.dataset.readerStatus = '';
      panel.appendChild(head);
      const assembly = createElement('p', 'reader-workbench-assembly');
      assembly.dataset.readerAssembly = '';
      panel.appendChild(assembly);
      const actions = createElement('div', 'reader-workbench-actions');
      const exportButton = createElement('button', 'reader-workbench-button', 'Export study sheet');
      exportButton.type = 'button';
      exportButton.addEventListener('click', exportStudySheet);
      actions.appendChild(exportButton);
      const importInput = createElement('input');
      importInput.type = 'file';
      importInput.accept = 'application/json';
      importInput.hidden = true;
      importInput.dataset.readerImportFile = '';
      const importButton = createElement('button', 'reader-workbench-button', 'Import study sheet');
      importButton.type = 'button';
      importButton.dataset.readerImport = '';
      actions.append(importButton, importInput);
      panel.appendChild(actions);
    }
    panel.querySelectorAll('[data-reader-export]').forEach((button) => {
      if (button.dataset.readerExportBound === 'true') return;
      button.dataset.readerExportBound = 'true';
      button.addEventListener('click', exportStudySheet);
    });
    const importInput = panel.querySelector('[data-reader-import-file]');
    panel.querySelectorAll('[data-reader-import]').forEach((button) => bindReaderImport(importInput, button));
  }

  const TOKEN_SPLIT_PREFIX_KEYS = new Set(['\u05D5', '\u05D1', '\u05DB', '\u05DC', '\u05DE', '\u05D4', '\u05E9']);

  function tokenRowKey(row) {
    return normalizeHebrewKey(row?.surface_word || row?.hebrew_word || row?.normalized_word || '');
  }

  function tokenAlignmentKey(value) {
    return normalizeHebrewKey(value).replace(/[\u05BE-]/g, '');
  }

  function pickPrimaryTokenId(consumed) {
    const primary = consumed.find((item) => !TOKEN_SPLIT_PREFIX_KEYS.has(tokenRowKey(item.row))) || consumed[0];
    return primary?.id || '';
  }

  function consumeAlignedToken(text, tokenIds, state) {
    if (!Array.isArray(state.tokenRows)) {
      const tokenIndexId = tokenIds[state.index++];
      return { tokenIndexId, tokenIndexIds: tokenIndexId ? [tokenIndexId] : [] };
    }
    const target = tokenAlignmentKey(text);
    let combined = '';
    const consumed = [];
    for (let offset = 0; state.index + offset < tokenIds.length && offset < 6; offset += 1) {
      const id = tokenIds[state.index + offset];
      const row = state.tokenRows[state.index + offset] || {};
      const key = tokenAlignmentKey(row?.surface_word || row?.hebrew_word || row?.normalized_word || '');
      if (!key) break;
      combined += key;
      consumed.push({ id, row });
      if (combined === target) {
        state.index += consumed.length;
        return {
          tokenIndexId: pickPrimaryTokenId(consumed),
          tokenIndexIds: consumed.map((item) => item.id).filter(Boolean),
        };
      }
      if (!target.startsWith(combined)) break;
    }
    const tokenIndexId = tokenIds[state.index++];
    return { tokenIndexId, tokenIndexIds: tokenIndexId ? [tokenIndexId] : [] };
  }

  function makeLexicalWord(text, tokenIndexId, ordinal, config, tokenIndexIds = []) {
    const span = createElement('a', 'lexical-word');
    span.href = '#route-hud-panel';
    span.lang = 'he';
    span.tabIndex = 0;
    span.dataset.lexicalToken = `${tokenIndexId}-${ordinal}`;
    span.dataset.lexicalIndex = tokenIndexId || '';
    span.dataset.lexicalEntry = '';
    span.dataset.lexicalStatus = 'pending';
    span.dataset.lexicalTokenIds = tokenIndexIds.length ? tokenIndexIds.join(' ') : (tokenIndexId || '');
    span.dataset.surfaceTokenId = tokenIndexId || '';
    span.dataset.surfaceOccurrenceId = tokenIndexId || '';
    span.dataset.workId = config.work_id || '';
    span.dataset.lexicalSurface = normalizeHebrewDisplay(text);
    span.setAttribute('aria-haspopup', 'dialog');
    span.setAttribute('aria-controls', 'route-hud-panel');
    span.setAttribute('aria-expanded', 'false');
    span.setAttribute('aria-pressed', 'false');
    const surface = createElement('span', 'lexical-word-surface', normalizeHebrewDisplay(text));
    span.appendChild(surface);
    return span;
  }

  function makeWordSpan(text, tokenIndexId, ordinal, config, tokenIndexIds = []) {
    const wrap = createElement('span', 'reader-token-wrap');
    const span = makeLexicalWord(text, tokenIndexId, ordinal, config, tokenIndexIds);
    wrap.appendChild(span);
    const glossLine = createElement('span', 'reader-gloss-line', PREHUD_PLACEHOLDER_TEXT);
    glossLine.dataset.glossPlaceholder = 'true';
    glossLine.dataset.glossText = '';
    wrap.appendChild(glossLine);
    return wrap;
  }

  function surfaceFromTokenRow(row, fallback) {
    return normalizeHebrewDisplay(firstPresentValue([
      row?.surface_word,
      row?.hebrew_word,
      row?.normalized_word,
      fallback,
    ]));
  }

  function safeDomId(value) {
    return String(value || '')
      .replace(/[^A-Za-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'row';
  }

  function makePrehudRowId(unit, paragraph, ordinal, tokenIndexId) {
    const unitId = safeDomId(unit?.id || unit?.dataset?.unitId || 'unit');
    const paragraphId = safeDomId(paragraph?.dataset?.lexicalParagraph || '0');
    return `prehud-${unitId}-${paragraphId}-${ordinal}-${safeDomId(tokenIndexId)}`;
  }

  function focusPrehudRow(rowId) {
    const target = document.getElementById(rowId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
    target.classList.add('prehud-row-targeted');
    try {
      history.pushState(null, '', `#${rowId}`);
    } catch (error) {
      // The row still scrolls/focuses if the browser blocks hash history updates.
    }
    window.setTimeout(() => target.classList.remove('prehud-row-targeted'), 1600);
  }

  function openPrehudRowHud(rowId) {
    const target = document.getElementById(rowId);
    const word = target ? target.querySelector('[data-lexical-token]') : null;
    if (!word) return false;
    void renderWord(word);
    return true;
  }

  function makePrehudPassageLink(text, rowId) {
    const link = createElement('a', 'prehud-passage-token', normalizeHebrewDisplay(text));
    link.href = `#${rowId}`;
    link.lang = 'he';
    link.dir = 'rtl';
    link.dataset.prehudTarget = rowId;
    link.setAttribute('aria-label', `Show gloss row for ${normalizeHebrewDisplay(text)}`);
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      focusPrehudRow(rowId);
    });
    return link;
  }

  function wrapPrehudPassageTextNode(node, rowIds, state) {
    const text = node.nodeValue || '';
    const matches = Array.from(text.matchAll(HEBREW_TOKEN_RE));
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let position = 0;
    matches.forEach((match) => {
      if (match.index > position) fragment.appendChild(document.createTextNode(text.slice(position, match.index)));
      const rowId = rowIds[state.ordinal] || '';
      state.ordinal += 1;
      fragment.appendChild(rowId ? makePrehudPassageLink(match[0], rowId) : document.createTextNode(match[0]));
      position = match.index + match[0].length;
    });
    if (position < text.length) fragment.appendChild(document.createTextNode(text.slice(position)));
    node.parentNode.replaceChild(fragment, node);
  }

  function linkPrehudParagraphTokens(paragraph, rowIds) {
    if (!paragraph || paragraph.dataset.prehudPassageLinksInitialized === 'true') return;
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement && node.parentElement.closest('a')) continue;
      textNodes.push(node);
    }
    const state = { ordinal: 0 };
    textNodes.forEach((node) => wrapPrehudPassageTextNode(node, rowIds, state));
    paragraph.dataset.prehudPassageLinksInitialized = 'true';
  }

  function makePrehudRow(row, tokenIndexId, ordinal, config, visibleSlot, fallbackSurface = '', rowId = '', sectionTopId = '') {
    const rowNode = createElement('div', 'prehud-row reader-token-wrap');
    rowNode.dataset.tokenRowId = tokenIndexId || '';
    if (rowId) {
      rowNode.id = rowId;
      rowNode.tabIndex = -1;
    }
    const surface = surfaceFromTokenRow(row, fallbackSurface || '');
    const wordCell = createElement('div', 'prehud-word');
    const word = makeLexicalWord(surface, tokenIndexId, ordinal, config, tokenIndexId ? [tokenIndexId] : []);
    wordCell.appendChild(word);
    rowNode.appendChild(wordCell);
    const glossCell = createElement('div', 'prehud-gloss');
    const glossLine = createElement('span', 'reader-gloss-line', PREHUD_PLACEHOLDER_TEXT);
    glossLine.dataset.glossPlaceholder = 'true';
    glossLine.dataset.glossText = '';
    glossCell.appendChild(glossLine);
    glossCell.setAttribute('role', 'button');
    glossCell.setAttribute('tabindex', '0');
    glossCell.setAttribute('aria-label', `Open Route HUD for ${surface}`);
    rowNode.appendChild(glossCell);
    const metaCell = createElement('div', 'prehud-meta');
    const matchCell = createElement('div', 'prehud-match', PREHUD_PLACEHOLDER_TEXT);
    matchCell.dataset.matchText = PREHUD_PLACEHOLDER_TEXT;
    matchCell.setAttribute('role', 'button');
    matchCell.setAttribute('tabindex', '0');
    matchCell.setAttribute('aria-label', `Open Route HUD for ${surface}`);
    if (sectionTopId) {
      const returnLink = createElement('a', 'prehud-return-link', 'Section top');
      returnLink.href = `#${sectionTopId}`;
      returnLink.setAttribute('aria-label', `Back to section top for ${surface}`);
      returnLink.addEventListener('click', (event) => event.stopPropagation());
      metaCell.appendChild(returnLink);
    }
    metaCell.appendChild(matchCell);
    rowNode.appendChild(metaCell);
    const openHudFromRow = (event) => {
      event.preventDefault();
      event.stopPropagation();
      void renderWord(word);
    };
    const openHudFromKeyboard = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      openHudFromRow(event);
    };
    rowNode.addEventListener('click', (event) => {
      if (event.target === word || word.contains(event.target)) return;
      openHudFromRow(event);
    });
    rowNode.addEventListener('keydown', openHudFromKeyboard);
    glossCell.addEventListener('click', openHudFromRow);
    glossCell.addEventListener('keydown', openHudFromKeyboard);
    matchCell.addEventListener('click', openHudFromRow);
    matchCell.addEventListener('keydown', openHudFromKeyboard);
    applyVisibleDisplaySlotOrNA(word, visibleSlot);
    return rowNode;
  }

  function wrapTextNode(node, tokenIds, state, config) {
    const text = node.nodeValue;
    const matches = Array.from(text.matchAll(HEBREW_TOKEN_RE));
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let position = 0;
    matches.forEach((match) => {
      if (match.index > position) fragment.appendChild(document.createTextNode(text.slice(position, match.index)));
      const tokenMatch = consumeAlignedToken(match[0], tokenIds, state);
      const ordinal = ++state.ordinal;
      fragment.appendChild(tokenMatch.tokenIndexId ? makeWordSpan(match[0], tokenMatch.tokenIndexId, ordinal, config, tokenMatch.tokenIndexIds) : document.createTextNode(match[0]));
      position = match.index + match[0].length;
    });
    if (position < text.length) fragment.appendChild(document.createTextNode(text.slice(position)));
    node.parentNode.replaceChild(fragment, node);
  }

  async function wrapParagraph(paragraph, tokenIds, config, loadTokenRow, readerHints, visibleDisplaySlots) {
    if (config?.reader_layout_mode === 'prehud_rows') {
      const unit = paragraph.closest('[data-lexical-unit]');
      const slot = unit ? unit.querySelector('[data-lexical-slot]') : null;
      if (!slot || !Array.isArray(tokenIds) || !tokenIds.length) return;
      paragraph.classList.add('hebrew-source');
      if (!slot.dataset.prehudRowsInitialized) {
        slot.replaceChildren();
        slot.dataset.prehudRowsInitialized = 'true';
      }
      const visibleTokens = Array.from((paragraph.textContent || '').matchAll(HEBREW_TOKEN_RE)).map((match) => match[0]);
      const group = createElement('div', 'prehud-rows');
      group.dataset.lexicalParagraphRows = paragraph.dataset.lexicalParagraph || '';
      const rows = typeof loadTokenRow === 'function'
        ? await Promise.all(tokenIds.map((tokenId) => loadTokenRow(tokenId).catch(() => ({}))))
        : tokenIds.map(() => ({}));
      const rowIds = tokenIds.map((tokenId, index) => makePrehudRowId(unit, paragraph, index + 1, tokenId));
      linkPrehudParagraphTokens(paragraph, rowIds);
      tokenIds.forEach((tokenId, index) => {
        const visibleSlot = visibleDisplaySlots instanceof Map ? visibleDisplaySlots.get(tokenId) : null;
        group.appendChild(makePrehudRow(rows[index], tokenId, index + 1, config, visibleSlot, visibleTokens[index] || '', rowIds[index] || '', unit?.id || ''));
      });
      slot.appendChild(group);
      return;
    }
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const visibleTokenCount = textNodes.reduce((count, node) => count + Array.from(node.nodeValue.matchAll(HEBREW_TOKEN_RE)).length, 0);
    const tokenRows = visibleTokenCount !== tokenIds.length && typeof loadTokenRow === 'function'
      ? await Promise.all(tokenIds.map((tokenId) => loadTokenRow(tokenId)))
      : null;
    const state = { index: 0, ordinal: 0, tokenRows };
    textNodes.forEach((node) => wrapTextNode(node, tokenIds, state, config));
  }

  function setRouteHudScrollLock(locked) {
    document.documentElement.classList.toggle('route-hud-open', Boolean(locked));
  }

  function closeRouteHud({ restoreFocus = false } = {}) {
    const hud = document.querySelector('[data-lexical-hud]');
    const buttonToRestore = activeHudButton;
    if (hud) hud.hidden = true;
    setRouteHudScrollLock(false);
    if (buttonToRestore) {
      buttonToRestore.setAttribute('aria-pressed', 'false');
      buttonToRestore.setAttribute('aria-expanded', 'false');
    }
    activeHudButton = null;
    if (restoreFocus && buttonToRestore) buttonToRestore.focus({ preventScroll: true });
  }

  function positionHudNearButton(button) {
    const hud = document.querySelector('[data-lexical-hud]');
    if (!button || !hud || hud.hidden) return;
    const margin = 12;
    const width = Math.max(320, window.innerWidth - margin * 2);
    hud.style.width = `${width}px`;
    hud.style.left = `${Math.max(margin, Math.round((window.innerWidth - width) / 2))}px`;
    hud.style.maxHeight = `${Math.max(260, window.innerHeight - margin * 2)}px`;
    hud.style.top = `${margin}px`;
  }

  function scheduleHudPosition() {
    if (!activeHudButton) return;
    window.requestAnimationFrame(() => positionHudNearButton(activeHudButton));
  }

  async function renderWord(button) {
    const unit = button.closest('[data-lexical-unit]');
    if (!unit) return;
    if (activeHudButton && activeHudButton !== button) {
      activeHudButton.setAttribute('aria-pressed', 'false');
      activeHudButton.setAttribute('aria-expanded', 'false');
    }
    activeHudButton = button;
    const hud = document.querySelector('[data-lexical-hud]');
    if (!hud || !siteApi) return;
    if (hud.parentElement !== document.body) document.body.appendChild(hud);
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-expanded', 'true');
    hud.hidden = false;
    setRouteHudScrollLock(true);
    hud.focus({ preventScroll: true });
    positionHudNearButton(button);
    const panel = hud.querySelector('[data-route-hud-panel]');
    const fallbackForm = button.dataset.lexicalSurface || button.textContent.trim();
    const fallbackNormalized = normalizeHebrewKey(fallbackForm);
    const title = hud.querySelector('#route-hud-title');
    if (title) title.textContent = `Route HUD: ${normalizeHebrewDisplay(fallbackForm || '')}`;
    if (panel) renderStudyHudFrame(panel, fallbackForm, fallbackNormalized, {}, null, siteApi.config);
    try {
      const tokenRow = await siteApi.loadTokenRow(button.dataset.lexicalIndex);
      const clickedForm = fallbackForm || tokenRow.hebrew_word || tokenRow.surface_word || button.textContent.trim();
      if (title) title.textContent = `Route HUD: ${normalizeHebrewDisplay(clickedForm || '')}`;
      const clickedNormalized = normalizeHebrewKey(clickedForm);
      const rowSurfaceNormalized = normalizeHebrewKey(tokenRow.surface_word || '');
      const normalized = rowSurfaceNormalized && rowSurfaceNormalized === clickedNormalized ? (tokenRow.normalized_word || clickedNormalized) : clickedNormalized;
      button.dataset.normalized = normalized;
      const currentRef = unit.dataset.sourceRef || unit.dataset.unitId || unit.id || '';
      const [routeLookup, crossmatch] = await Promise.all([
        siteApi.loadRouteCardsForToken(clickedForm, normalized),
        siteApi.loadCrossmatchesForToken(normalized, currentRef),
      ]);
      if (button.getAttribute('aria-pressed') !== 'true') return;
      if (panel) renderRouteHudPanel(panel, button, clickedForm, normalized, routeLookup.cards, routeLookup.candidates, siteApi.config, tokenRow, crossmatch);
      positionHudNearButton(button);
    } catch (error) {
      console.error(error);
      if (panel) renderStudyHudFrame(panel, fallbackForm, fallbackNormalized, {}, null, siteApi.config);
      positionHudNearButton(button);
    }
  }

  function bindSiteEvents(hud) {
    if (document.documentElement.dataset.readerWorkbenchEventsBound === 'true') return;
    document.documentElement.dataset.readerWorkbenchEventsBound = 'true';
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lexical-token]');
      if (button) {
        event.preventDefault();
        renderWord(button);
        return;
      }
      const prehudTrigger = event.target.closest('.prehud-gloss, .prehud-match');
      const prehudButton = prehudTrigger
        ? prehudTrigger.closest('.prehud-row')?.querySelector('[data-lexical-token]')
        : null;
      if (prehudButton) {
        event.preventDefault();
        renderWord(prehudButton);
        return;
      }
      if (!hud.hidden && !event.target.closest('[data-lexical-hud]')) closeRouteHud();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !hud.hidden) {
        event.preventDefault();
        closeRouteHud({ restoreFocus: true });
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const button = event.target.closest('[data-lexical-token]');
      if (!button) return;
      event.preventDefault();
      renderWord(button);
    });
    document.querySelectorAll('[data-hud-close]').forEach((button) => {
      button.addEventListener('click', () => closeRouteHud({ restoreFocus: true }));
    });
    window.addEventListener('resize', scheduleHudPosition);
    window.addEventListener('scroll', scheduleHudPosition, true);
  }

  async function initSite() {
    const hud = document.querySelector('[data-lexical-hud]');
    const configNode = document.querySelector('[data-lexical-config]');
    if (!hud || !configNode) return false;
    const config = JSON.parse(configNode.textContent || '{}');
    const occurrenceNode = document.querySelector('[data-lexical-occurrences]');
    let occurrences = occurrenceNode && occurrenceNode.textContent.trim() ? JSON.parse(occurrenceNode.textContent) : { units: {} };
    const tokenIndex = parseJsonNode('[data-lexical-token-index]', { forms: [] });
    const lexicon = parseJsonNode('[data-lexical-lexicon]', { entries: [] });
    const tokenRows = new Map((tokenIndex.forms || []).map((row) => [row.token_index_id, row]));
    const lexiconEntries = new Map((lexicon.entries || []).map((entry) => [entry.entry_id, entry]));
    const sourceRows = new Map();
    const chunkPromises = new Map();
    const routeShardPromises = new Map();
    let manifestPromise = null;
    let routeManifestPromise = null;
    let crossmatchPromise = null;

    const loadOccurrences = async () => {
      if (occurrences.units && Object.keys(occurrences.units).length) return occurrences;
      const occurrenceUrl = config.occurrence_url || (occurrenceNode && occurrenceNode.dataset ? occurrenceNode.dataset.src : '');
      if (occurrenceUrl) occurrences = await fetchJson(occurrenceUrl);
      return occurrences;
    };
    const loadManifest = async () => {
      if (!config.manifest_url) return null;
      if (!manifestPromise) manifestPromise = fetchJson(config.manifest_url);
      return manifestPromise;
    };
    const resolveSourceRows = (ids, inlineRows) => {
      if (Array.isArray(inlineRows) && inlineRows.length && typeof inlineRows[0] === 'object') return inlineRows;
      return (Array.isArray(ids) ? ids : []).map((id) => sourceRows.get(id)).filter(Boolean);
    };
    const cacheChunk = (chunk) => {
      Object.entries(chunk.source_rows || {}).forEach(([id, row]) => sourceRows.set(id, row));
      ((chunk.token_index && chunk.token_index.forms) || []).forEach((row) => tokenRows.set(row.token_index_id, row));
      ((chunk.lexicon && chunk.lexicon.entries) || []).forEach((entry) => {
        lexiconEntries.set(entry.entry_id, {
          ...entry,
          source_rows: resolveSourceRows(entry.source_row_ids, entry.source_rows),
          secondary_source_rows: resolveSourceRows(entry.secondary_source_row_ids, entry.secondary_source_rows),
        });
      });
      return chunk;
    };
    const loadChunk = async (chunkId) => {
      if (!chunkId) return null;
      if (!chunkPromises.has(chunkId)) {
        chunkPromises.set(chunkId, (async () => {
          const manifest = await loadManifest();
          if (!manifest) return null;
          const chunkInfo = (manifest.chunks || []).find((chunk) => chunk.chunk_id === chunkId);
          if (!chunkInfo) throw new Error(`Lexical chunk not found in manifest: ${chunkId}`);
          return cacheChunk(await fetchJson(chunkInfo.url, toAbsoluteUrl(config.manifest_url)));
        })());
      }
      return chunkPromises.get(chunkId);
    };
    const enrichTokenRow = (row) => {
      if (!row || typeof row !== 'object') return {};
      return {
        ...row,
        lexicon_entry: row.lexicon_entry_id ? (lexiconEntries.get(row.lexicon_entry_id) || null) : null,
      };
    };
    const loadTokenRow = async (tokenIndexId) => {
      if (!tokenIndexId) return {};
      if (tokenRows.has(tokenIndexId)) return enrichTokenRow(tokenRows.get(tokenIndexId));
      const manifest = await loadManifest();
      const chunkId = manifest && manifest.token_chunks ? manifest.token_chunks[tokenIndexId] : '';
      if (chunkId) await loadChunk(chunkId);
      return enrichTokenRow(tokenRows.get(tokenIndexId));
    };
    const loadCrossmatchIndex = async () => {
      const url = hebrewCrossmatchIndexUrl(config);
      if (!url) return null;
      if (!crossmatchPromise) {
        crossmatchPromise = fetchOptionalJson(url, lexicalRootUrl(config)).catch((error) => {
          console.warn(error);
          return null;
        });
      }
      return crossmatchPromise;
    };
    const loadCrossmatchesForToken = async (normalized, currentRef) => {
      const index = await loadCrossmatchIndex();
      return crossmatchesFromIndex(index, normalized, currentRef);
    };
    const loadRouteManifest = async () => {
      if (!routeManifestPromise) routeManifestPromise = fetchJson(routeLookupManifestUrl(config));
      return routeManifestPromise;
    };
    const loadRouteCards = async (normalized) => {
      if (!normalized) return [];
      const manifest = await loadRouteManifest();
      const shardKey = codepointKey(normalized, Number(manifest.prefix_length || 2));
      const shardInfo = (manifest.shards || []).find((shard) => shard.shard === shardKey);
      if (!shardInfo || !shardInfo.path) return [];
      if (!routeShardPromises.has(shardKey)) routeShardPromises.set(shardKey, fetchJson(shardInfo.path, routeLookupManifestUrl(config)));
      const shard = await routeShardPromises.get(shardKey);
      return (((shard || {}).routes_by_normalized || {})[normalized] || []).slice();
    };
    const loadRouteCardsForToken = async (clickedForm, normalized) => {
      const candidates = lookupCandidatesFor(clickedForm, normalized);
      const rows = [];
      for (const candidate of candidates) {
        const cards = await loadRouteCards(candidate.key);
        cards.forEach((card) => rows.push({ ...card, lookup_key: candidate.key, lookup_relation: candidate.relation, lookup_penalty: candidate.penalty }));
      }
      const seen = new Set();
      return {
        candidates,
        cards: rows.filter((card) => {
          const key = `${card.card_id || ''}|${card.lookup_key || ''}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      };
    };

    siteApi = { config, loadTokenRow, loadRouteCardsForToken, loadCrossmatchesForToken };
    setupWorkbenchPanel();
    bindSiteEvents(hud);
    await waitForIdle();
    const readerHints = await loadReaderHints(config);
    const visibleDisplaySlots = await loadVisibleDisplaySlots(config);
    siteApi.visibleDisplaySlots = visibleDisplaySlots;
    const loadedOccurrences = await loadOccurrences();
    const tasks = [];
    document.querySelectorAll('[data-lexical-unit]').forEach((unit) => {
      const unitData = loadedOccurrences.units ? loadedOccurrences.units[unit.id] : null;
      if (!unitData) return;
      const paragraphsByIndex = new Map((unitData.paragraphs || []).map((item) => [Number(item.paragraph_index), item]));
      unit.querySelectorAll('[data-lexical-paragraph]').forEach((paragraph) => {
        const paragraphData = paragraphsByIndex.get(Number(paragraph.dataset.lexicalParagraph));
        tasks.push({ paragraph, tokenIds: paragraphData ? (paragraphData.token_index_ids || []) : [] });
      });
    });
    for (let index = 0; index < tasks.length; index += 24) {
      await Promise.all(tasks.slice(index, index + 24).map((task) => wrapParagraph(task.paragraph, task.tokenIds, config, loadTokenRow, readerHints, visibleDisplaySlots)));
      if (index + 24 < tasks.length) await waitForIdle();
    }
    if (config?.reader_layout_mode !== 'prehud_rows') applyVisibleDisplaySlots(visibleDisplaySlots);
    await hydrateSelectionStoreFromIndexedDb();
    restoreSelections();
    return true;
  }

  function initRoutePreview() {
    const dataNode = document.getElementById('hud-route-data');
    const tokenList = document.querySelector('[data-token-list]');
    const panel = document.querySelector('[data-hud-panel]');
    if (!dataNode || !tokenList || !panel) return false;
    const data = JSON.parse(dataNode.textContent);
    const samples = data.fixtures?.samples || [];
    const storeSamples = new Map((data.storeSample?.sample_tokens || []).map((row) => [row.normalized, row]));
    const lookupSamples = new Map((data.lookupSample?.sample_tokens || []).map((row) => [row.normalized, row]));

    const collectRankedCards = (sample) => {
      const sectionCards = (sample.route_sections || [])
        .filter((section) => productionSections.has(section.section_id) || section.section_id === 'phrase_evidence')
        .flatMap((section) => section.cards || []);
      const storeRow = storeSamples.get(sample.normalized);
      const lookupRow = lookupSamples.get(sample.normalized);
      return [...sectionCards, ...(storeRow?.cards || []), ...(lookupRow?.cards || [])].sort(compareRouteCards);
    };

    const setActive = (index) => {
      const sample = samples[index] || samples[0];
      tokenList.querySelectorAll('button').forEach((button) => {
        button.setAttribute('aria-pressed', button.dataset.index === String(index) ? 'true' : 'false');
      });
      const cards = collectRankedCards(sample);
      const fakeButton = document.createElement('button');
      fakeButton.dataset.workId = 'hud-preview';
      fakeButton.dataset.lexicalSurface = sample.token || '';
      fakeButton.dataset.normalized = sample.normalized || '';
      fakeButton.dataset.surfaceTokenId = sample.normalized || sample.token || '';
      fakeButton.dataset.surfaceOccurrenceId = sample.normalized || sample.token || '';
      renderRouteHudPanel(panel, fakeButton, sample.token, sample.normalized, cards, [{ key: sample.normalized, relation: 'exact', penalty: 0 }], {});
    };

    tokenList.innerHTML = samples.map((sample, index) => `
      <button type="button" data-index="${index}" aria-pressed="${index === 0 ? 'true' : 'false'}">
        <span lang="he" dir="rtl">${normalizeHebrewDisplay(sample.token || '')}</span>
        <small>${sample.answer_card ? (sample.answer_card.display_label || 'Answer route') : 'No answer route'}</small>
      </button>`).join('');
    tokenList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-index]');
      if (button) setActive(Number(button.dataset.index));
    });
    setActive(0);
    return true;
  }

  async function init() {
    const siteStarted = await initSite();
    if (!siteStarted) initRoutePreview();
  }

  window.ReaderWorkbench = {
    init,
    initSite,
    initRoutePreview,
    exportStudySheet,
    importStudySheetData,
    importStudySheetFromFile,
    selectRouteAnswer,
    routeRenderings,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init().catch((error) => console.error(error)));
  } else {
    init().catch((error) => console.error(error));
  }
})();
