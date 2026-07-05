(function () {
  const model = window.HEBREW_RENDER_MODEL;
  const PILL_LIMIT = 5;
  const state = {
    wordUseId: model.word.id,
    passageCollapsed: false,
    compSpanId: model.defaultCompSpanId,
    lBundleByCell: new Map(),
    routeByLBundle: new Map(),
    mSupportByLBundle: new Map(),
    commentarySectionId: (
      model.passage.sections &&
      model.passage.sections[0] &&
      model.passage.sections[0].id
    ) || null,
    commentaryOpen: false,
    commentaryMode: (
      model.ledgerContracts &&
      model.ledgerContracts.commentary &&
      model.ledgerContracts.commentary.defaultMode
    ) || 'base_only'
  };

  const contentsList = document.getElementById('contents-list');
  const passageLine = document.getElementById('passage-line');
  const wordHebrew = document.getElementById('word-hebrew');
  const wordTransliteration = document.getElementById('word-transliteration');
  const selectedWordCard = document.getElementById('selected-word-card');
  const selectedGlossStack = document.getElementById('selected-gloss-stack');
  const activeSectionRef = document.getElementById('active-section-ref');
  const topCommentaryButton = document.getElementById('top-commentary-button');
  const sectionCommentaryActions = document.getElementById('section-commentary-actions');
  const commentaryScrim = document.getElementById('commentary-scrim');
  const commentaryDrawer = document.getElementById('commentary-drawer');
  const commentaryDrawerContext = document.getElementById('commentary-drawer-context');
  const commentaryDrawerBody = document.getElementById('commentary-drawer-body');
  const commentaryClose = document.getElementById('commentary-close');
  const spanOptions = document.getElementById('span-options');
  const routeStack = document.getElementById('route-stack');
  const detailStack = document.getElementById('detail-stack');

  function selectedWordUse() {
    return (
      model.passage.tokens.find((token) => token.id === state.wordUseId) ||
      model.passage.tokens[0] ||
      model.word
    );
  }

  function selectedWordIsMaterialized() {
    return selectedWordUse().useStatus === 'materialized';
  }

  function compSpansForSelectedWord() {
    const word = selectedWordUse();
    if (word.compSpanIds && word.compSpanIds.length) {
      const ids = new Set(word.compSpanIds);
      return model.compSpans.filter((span) => ids.has(span.id));
    }
    return selectedWordIsMaterialized() ? model.compSpans : [];
  }

  function selectedCompSpan() {
    const spans = compSpansForSelectedWord();
    return spans.find((span) => span.id === state.compSpanId) || spans[0] || null;
  }

  function selectedLBundle(cell) {
    const requested = state.lBundleByCell.get(cell.id) || cell.defaultLBundleId;
    return cell.lBundles.find((bundle) => bundle.id === requested) || cell.lBundles[0];
  }

  function selectedRoute(bundle) {
    const requested = state.routeByLBundle.get(bundle.id) || bundle.defaultRouteId;
    return bundle.routes.find((route) => route.id === requested) || bundle.routes[0];
  }

  function selectedMSupport(bundle) {
    const supports = mSupportsForBundle(bundle);
    const requested = state.mSupportByLBundle.get(bundle.id);
    return supports.find((support) => support.id === requested) || supports[0];
  }

  function normalizeRouteMember(text) {
    return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function routeSetKey(bundle) {
    return bundle.routes
      .map((route) => normalizeRouteMember(route.text))
      .sort()
      .join(' | ');
  }

  function pProofForBundle(bundle) {
    const proof = bundle.pProof || {};
    return {
      id: proof.id || `${bundle.id}-P`,
      label: proof.label || 'Exact R-member set',
      relation: proof.relation || 'exact-d-route-set',
      bucketKey: proof.bucketKey || routeSetKey(bundle),
      matchMode: proof.matchMode || 'Normalize R members as an exact set; ignore separator/order only.',
      mSupportIds: proof.mSupportIds || bundle.mSupports.map((support) => support.id)
    };
  }

  function mSupportsForBundle(bundle) {
    const proof = pProofForBundle(bundle);
    const proofIds = new Set(proof.mSupportIds);
    const supports = bundle.mSupports.filter((support) => proofIds.has(support.id));
    return supports.length ? supports : bundle.mSupports;
  }

  function firstSection() {
    return (model.passage.sections && model.passage.sections[0]) || null;
  }

  function sectionById(sectionId) {
    return (
      model.passage.sections &&
      model.passage.sections.find((section) => section.id === sectionId)
    ) || firstSection();
  }

  function commentaryContract() {
    return model.ledgerContracts && model.ledgerContracts.commentary;
  }

  function commentaryEdgesForSection(section) {
    const commentary = commentaryContract();
    if (!commentary) return [];
    if (!section) return commentary.availableEdges;

    const ids = new Set(section.commentaryEdgeIds || []);
    return commentary.availableEdges.filter((edge) => (
      ids.has(edge.id) || (edge.sectionIds || []).includes(section.id)
    ));
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function optionValue(option) {
    return option.id;
  }

  function visibleOptionsForActive(options, activeId) {
    const firstOptions = options.slice(0, PILL_LIMIT);
    if (firstOptions.some((option) => optionValue(option) === activeId)) return firstOptions;

    const active = options.find((option) => optionValue(option) === activeId);
    const visible = [];
    if (active) visible.push(active);

    for (const option of options) {
      if (visible.length >= PILL_LIMIT) break;
      if (optionValue(option) !== activeId) visible.push(option);
    }

    return visible.length ? visible : firstOptions;
  }

  function appendPillOverflowOptions(container, config) {
    const labelForOption = config.labelForOption || ((option) => option.label || option.text || option.selectLabel);
    const visible = visibleOptionsForActive(config.options, config.activeId);
    const visibleIds = new Set(visible.map(optionValue));
    const overflow = config.options.filter((option) => !visibleIds.has(optionValue(option)));

    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', config.ariaLabel);

    for (const option of visible) {
      const value = optionValue(option);
      const button = el('button', config.buttonClass, labelForOption(option));
      button.type = 'button';
      button.setAttribute('aria-pressed', value === config.activeId ? 'true' : 'false');
      if (config.decorateButton) config.decorateButton(button, option);
      button.addEventListener('click', () => config.onSelect(value));
      container.appendChild(button);
    }

    if (!overflow.length) return;

    const select = el('select', `${config.overflowClass} pill-overflow-select`);
    select.setAttribute('aria-label', `${config.ariaLabel} more options`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = `more (${overflow.length})`;
    select.appendChild(placeholder);

    for (const option of overflow) {
      const overflowOption = document.createElement('option');
      overflowOption.value = optionValue(option);
      overflowOption.textContent = labelForOption(option);
      select.appendChild(overflowOption);
    }

    select.value = '';
    select.addEventListener('change', () => {
      if (!select.value) return;
      config.onSelect(select.value);
    });
    container.appendChild(select);
  }

  function scrollToSelectedWord() {
    if (!selectedWordCard) return;
    const passageBar = document.querySelector('.passage-bar');
    const offset = (passageBar ? passageBar.offsetHeight : 0) + 28;
    const top = selectedWordCard.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function renderContents() {
    if (!contentsList) return;
    clear(contentsList);

    const sections = model.passage.sections || [];
    for (const section of sections) {
      const link = el('a', 'contents-link', section.label || section.ref);
      link.href = '#page-top';
      link.setAttribute('aria-current', section.id === state.commentarySectionId ? 'true' : 'false');
      contentsList.appendChild(link);
    }
  }

  function renderPassage() {
    clear(passageLine);
    const tokens = state.passageCollapsed ? [selectedWordUse()] : model.passage.tokens;
    passageLine.dataset.mode = state.passageCollapsed ? 'selected-word' : 'full-passage';

    for (const token of tokens) {
      const button = el('button', 'passage-token', token.hebrew);
      button.type = 'button';
      button.lang = 'he';
      button.dir = 'rtl';
      button.dataset.useStatus = token.useStatus || (token.active ? 'materialized' : 'held');
      button.dataset.wordUseId = token.id;
      button.setAttribute('aria-pressed', token.id === state.wordUseId ? 'true' : 'false');
      if (token.active) {
        button.title = `Jump to ${token.transliteration}`;
      } else {
        button.title = token.materializationReason || 'Not materialized in this render slice';
      }
      button.addEventListener('click', () => {
        state.wordUseId = token.id;
        state.passageCollapsed = true;
        if (token.defaultCompSpanId) state.compSpanId = token.defaultCompSpanId;
        render();
        scrollToSelectedWord();
      });
      passageLine.appendChild(button);
    }
  }

  function wirePassageTopLinks() {
    for (const link of document.querySelectorAll('a[href="#page-top"]')) {
      link.addEventListener('click', () => {
        state.passageCollapsed = false;
        renderPassage();
      });
    }
  }

  function renderSectionCommentaryActions() {
    const section = firstSection();
    if (!section || !sectionCommentaryActions) return;

    activeSectionRef.textContent = section.label || section.ref;
    clear(sectionCommentaryActions);

    const edges = commentaryEdgesForSection(section);
    if (!edges.length) return;

    const button = el('button', 'section-commentary-button', 'COMMENTARY');
    button.type = 'button';
    button.dataset.sectionId = section.id;
    button.appendChild(el('span', 'section-commentary-count', String(edges.length)));
    button.addEventListener('click', () => openCommentary(section.id));
    sectionCommentaryActions.appendChild(button);
  }

  function renderSelector() {
    clear(spanOptions);
    const spans = compSpansForSelectedWord();
    if (!spans.length) {
      const held = selectedWordUse();
      const button = el('button', 'span-option is-held', held.hebrew);
      button.type = 'button';
      button.lang = 'he';
      button.dir = 'rtl';
      button.disabled = true;
      button.setAttribute('aria-pressed', 'true');
      spanOptions.appendChild(button);
      return;
    }

    appendPillOverflowOptions(spanOptions, {
      options: spans,
      activeId: selectedCompSpan().id,
      buttonClass: 'span-option',
      overflowClass: 'span-overflow-select',
      ariaLabel: 'Hebrew span',
      labelForOption: (span) => span.selectLabel,
      decorateButton: (button, span) => {
        button.lang = 'he';
        button.dir = 'rtl';
        button.dataset.compSpanId = span.id;
      },
      onSelect: (spanId) => {
        state.compSpanId = spanId;
        render();
      }
    });
  }

  function renderWordCard() {
    const word = selectedWordUse();
    wordHebrew.textContent = word.hebrew;
    wordTransliteration.textContent = word.transliteration;
  }

  function selectedGlossText(span) {
    const parts = span.cells.map((cell) => selectedRoute(selectedLBundle(cell)).text);
    return span.isSplit ? parts.join(' + ') : parts[0];
  }

  function renderSelectedGloss(span) {
    clear(selectedGlossStack);
    if (!span) {
      const word = selectedWordUse();
      const line = el('div', 'selected-gloss-line is-held', word.useStatus === 'held' ? 'held' : 'not materialized');
      selectedGlossStack.appendChild(line);
      return;
    }

    const line = el('div', `selected-gloss-line${span.isSplit ? ' is-split' : ''}`);
    if (!span.isSplit) {
      line.textContent = selectedGlossText(span);
      selectedGlossStack.appendChild(line);
      return;
    }

    span.cells.forEach((cell, index) => {
      if (index > 0) line.appendChild(el('span', 'selected-gloss-plus', ' + '));
      line.appendChild(el('span', 'selected-gloss-part', selectedRoute(selectedLBundle(cell)).text));
    });
    selectedGlossStack.appendChild(line);
  }

  function selectedCommentaryMode(commentary) {
    const requested = state.commentaryMode || commentary.defaultMode;
    return commentary.modes.find((mode) => mode.id === requested) || commentary.modes[0];
  }

  function renderCommentaryModeButtons(commentary) {
    const modes = el('div', 'commentary-modes');
    for (const mode of commentary.modes) {
      const button = el('button', `commentary-mode${mode.enabled ? '' : ' is-held'}`, mode.label);
      button.type = 'button';
      button.disabled = !mode.enabled;
      button.setAttribute('aria-disabled', mode.enabled ? 'false' : 'true');
      button.setAttribute('aria-pressed', mode.id === state.commentaryMode ? 'true' : 'false');
      button.title = mode.copy;
      if (mode.enabled) {
        button.addEventListener('click', () => {
          state.commentaryMode = mode.id;
          renderCommentaryDrawer();
        });
      }
      modes.appendChild(button);
    }
    return modes;
  }

  function renderCommentaryMetrics(summary) {
    const metrics = el('dl', 'commentary-metrics');
    const rows = [
      ['edges audited', summary.commentaryEdgesAudited],
      ['source/license clean', summary.sourceAndLicenseCleanEdges],
      ['base split ready', summary.baseWithCommentarySplitReady],
      ['commentary-only ready', summary.commentaryOnlyReady],
      ['alignment required', summary.alignmentArtifactRequiredRows],
      ['source text appended', summary.sourceTextRowsAppended],
      ['cleanroom touched', summary.cleanroomTouched]
    ];

    for (const row of rows) {
      metrics.appendChild(el('dt', null, row[0]));
      metrics.appendChild(el('dd', null, String(row[1])));
    }

    return metrics;
  }

  function renderCommentaryDrawer() {
    const commentary = commentaryContract();
    if (!commentaryDrawerBody || !commentary || !state.commentaryOpen) return;

    const section = sectionById(state.commentarySectionId);
    const commentaryEdges = commentaryEdgesForSection(section);
    commentaryDrawerContext.textContent = section ? section.ref : model.passage.ref;
    clear(commentaryDrawerBody);
    commentaryDrawerBody.appendChild(renderCommentaryModeButtons(commentary));

    const activeMode = selectedCommentaryMode(commentary);
    const status = el('div', 'commentary-status-card');
    status.appendChild(el('strong', 'commentary-status-title', activeMode.statusLabel));
    status.appendChild(el('p', 'commentary-copy', activeMode.copy));
    commentaryDrawerBody.appendChild(status);
    commentaryDrawerBody.appendChild(renderCommentaryMetrics(commentary.summary));

    const edgeList = el('div', 'commentary-edge-list');
    edgeList.appendChild(el('h3', 'commentary-subtitle', 'Aligned here, held'));
    for (const edge of commentaryEdges) {
      const item = el('p', 'commentary-edge');
      item.appendChild(el('strong', null, edge.work));
      item.appendChild(document.createTextNode(` - ${edge.status}`));
      edgeList.appendChild(item);
    }
    commentaryDrawerBody.appendChild(edgeList);

    for (const noteText of commentary.contractNotes) {
      commentaryDrawerBody.appendChild(el('p', 'commentary-note', noteText));
    }
  }

  function openCommentary(sectionId) {
    const section = sectionById(sectionId) || firstSection();
    if (section) state.commentarySectionId = section.id;
    state.commentaryOpen = true;
    document.body.classList.add('commentary-open');
    commentaryScrim.hidden = false;
    commentaryDrawer.setAttribute('aria-hidden', 'false');
    renderCommentaryDrawer();
    commentaryDrawer.focus({ preventScroll: true });
  }

  function closeCommentary() {
    state.commentaryOpen = false;
    document.body.classList.remove('commentary-open');
    commentaryScrim.hidden = true;
    commentaryDrawer.setAttribute('aria-hidden', 'true');
  }

  function wireCommentaryControls() {
    if (topCommentaryButton) {
      topCommentaryButton.addEventListener('click', () => {
        const section = sectionById(state.commentarySectionId) || firstSection();
        openCommentary(section && section.id);
      });
    }
    if (commentaryClose) commentaryClose.addEventListener('click', closeCommentary);
    if (commentaryScrim) commentaryScrim.addEventListener('click', closeCommentary);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.commentaryOpen) closeCommentary();
    });
  }

  function renderLBundleControl(cell, bundle) {
    if (cell.lBundles.length < 2) return null;

    const wrap = el('div', 'bundle-select-wrap');
    const label = el('span', 'control-label', 'L BUNDLE');
    wrap.appendChild(label);

    const pills = el('div', 'bundle-pills ledger-pills option-pills');
    appendPillOverflowOptions(pills, {
      options: cell.lBundles,
      activeId: bundle.id,
      buttonClass: 'bundle-pill ledger-pill',
      overflowClass: 'bundle-overflow-select',
      ariaLabel: `L bundle for ${cell.transliteration}`,
      labelForOption: (optionBundle) => optionBundle.label,
      onSelect: (bundleId) => {
        state.lBundleByCell.set(cell.id, bundleId);
        render();
      }
    });
    wrap.appendChild(pills);
    return wrap;
  }

  function renderRouteControl(bundle) {
    const selected = selectedRoute(bundle);
    const wrap = el('div', 'route-select-wrap');
    const label = el('span', 'control-label', 'R ROUTE');
    wrap.appendChild(label);

    const pills = el('div', 'route-pills ledger-pills option-pills');
    appendPillOverflowOptions(pills, {
      options: bundle.routes,
      activeId: selected.id,
      buttonClass: 'route-pill ledger-pill r-route-pill',
      overflowClass: 'route-overflow-select',
      ariaLabel: `R route inside ${bundle.label}`,
      labelForOption: (route) => route.text,
      onSelect: (routeId) => {
        state.routeByLBundle.set(bundle.id, routeId);
        render();
      }
    });
    wrap.appendChild(pills);
    return wrap;
  }

  function renderBundleCard(cell, bundle) {
    const card = el('section', 'route-card bundle-card');
    card.appendChild(el('span', 'bundle-layer', 'D BUNDLE'));
    card.appendChild(el('span', 'route-title', bundle.label));
    return card;
  }

  function renderChoicePanel(span) {
    clear(routeStack);
    if (!span) {
      const word = selectedWordUse();
      const heldCard = el('article', 'span-card held-card');
      heldCard.appendChild(el('h2', 'section-kicker', 'U POINTER'));
      const hebrew = el('p', 'component-hebrew', word.hebrew);
      hebrew.lang = 'he';
      hebrew.dir = 'rtl';
      heldCard.appendChild(hebrew);
      heldCard.appendChild(el('p', 'detail-copy', word.materializationReason || 'No validated L/D/R/M sidecar is attached to this token yet.'));
      routeStack.appendChild(heldCard);
      return;
    }

    const spanCard = el('article', 'span-card');
    spanCard.appendChild(el('h2', 'section-kicker', span.kindLabel.toUpperCase()));
    const spanLabel = el('p', `span-label${span.isSplit ? ' split-label' : ''}`, span.displayLabel);
    spanCard.appendChild(spanLabel);

    for (const cell of span.cells) {
      const bundle = selectedLBundle(cell);
      const componentShell = el('section', 'component-shell');
      const hebrew = el('p', 'component-hebrew', cell.hebrew);
      hebrew.lang = 'he';
      hebrew.dir = 'rtl';
      componentShell.appendChild(hebrew);

      const bundleControl = renderLBundleControl(cell, bundle);
      if (bundleControl) componentShell.appendChild(bundleControl);
      componentShell.appendChild(renderBundleCard(cell, bundle));
      componentShell.appendChild(renderRouteControl(bundle));
      spanCard.appendChild(componentShell);
    }

    routeStack.appendChild(spanCard);
  }

  function renderSpanDetail(cell) {
    const card = el('article', 'detail-card');
    const top = el('div', 'detail-top');
    top.appendChild(el('h2', 'section-kicker', 'SPAN'));
    const hebrew = el('div', 'detail-hebrew', cell.hebrew);
    hebrew.lang = 'he';
    hebrew.dir = 'rtl';
    top.appendChild(hebrew);
    card.appendChild(top);
    card.appendChild(el('p', 'detail-kind', cell.spanKind));
    return card;
  }

  function renderDefinitionDetail(cell, bundle) {
    const route = selectedRoute(bundle);
    const card = el('article', 'detail-card');
    card.appendChild(el('h2', 'section-kicker', 'DEFINITION'));
    card.appendChild(el('h3', 'detail-title', bundle.label));
    const routeLine = el('p', 'detail-route');
    routeLine.appendChild(el('span', 'detail-route-label', 'R ROUTE'));
    routeLine.appendChild(el('strong', null, route.text));
    card.appendChild(routeLine);
    card.appendChild(el('p', 'detail-copy', `D bundle: ${bundle.label}. R route: ${route.text}.`));
    return card;
  }

  function renderMSupportControl(bundle, support) {
    const supports = mSupportsForBundle(bundle);
    if (supports.length < 2) return null;

    const wrap = el('div', 'source-select-wrap');
    const label = el('span', 'section-kicker source-kicker', 'M SOURCE');
    wrap.appendChild(label);

    const pills = el('div', 'source-pills ledger-pills option-pills');
    appendPillOverflowOptions(pills, {
      options: supports,
      activeId: support.id,
      buttonClass: 'source-pill ledger-pill',
      overflowClass: 'source-overflow-select',
      ariaLabel: `M source for ${bundle.label}`,
      labelForOption: (optionSupport) => optionSupport.label,
      onSelect: (supportId) => {
        state.mSupportByLBundle.set(bundle.id, supportId);
        render();
      }
    });
    wrap.appendChild(pills);
    return wrap;
  }

  function renderLicenseDetail(cell, bundle) {
    const support = selectedMSupport(bundle);
    const card = el('article', 'detail-card');
    card.appendChild(el('h2', 'section-kicker', 'LICENSE / SOURCE'));

    const supportControl = renderMSupportControl(bundle, support);
    if (supportControl) card.appendChild(supportControl);

    card.appendChild(el('div', 'license-title', support.title));
    card.appendChild(el('p', 'source-copy', support.copy));
    return card;
  }

  function renderDetails(span) {
    clear(detailStack);
    if (!span) {
      const word = selectedWordUse();
      const card = el('article', 'detail-card held-card');
      card.appendChild(el('h2', 'section-kicker', 'MATERIALIZATION'));
      card.appendChild(el('h3', 'detail-title', word.useStatus === 'held' ? 'held by U' : 'not materialized'));
      card.appendChild(el('p', 'detail-copy', word.materializationReason || 'This token has no local render-side L/D/R/M payload.'));
      detailStack.appendChild(card);
      return;
    }

    for (const cell of span.cells) {
      const bundle = selectedLBundle(cell);
      detailStack.appendChild(renderSpanDetail(cell));
      detailStack.appendChild(renderDefinitionDetail(cell, bundle));
      detailStack.appendChild(renderLicenseDetail(cell, bundle));
    }
  }

  function render() {
    const span = selectedCompSpan();
    renderPassage();
    renderWordCard();
    renderSelector();
    renderSelectedGloss(span);
    renderChoicePanel(span);
    renderDetails(span);
  }

  renderContents();
  wirePassageTopLinks();
  render();
}());
