(function () {
  const model = window.HEBREW_RENDER_MODEL;
  const PILL_LIMIT = 5;
  const state = {
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

  function selectedCompSpan() {
    return model.compSpans.find((span) => span.id === state.compSpanId) || model.compSpans[0];
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
    const requested = state.mSupportByLBundle.get(bundle.id);
    return bundle.mSupports.find((support) => support.id === requested) || bundle.mSupports[0];
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

  function scrollToSelectedWord() {
    if (!selectedWordCard) return;
    const passageBar = document.querySelector('.passage-bar');
    const offset = (passageBar ? passageBar.offsetHeight : 0) + 12;
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
    for (const token of model.passage.tokens) {
      const button = el('button', 'passage-token', token.hebrew);
      button.type = 'button';
      button.lang = 'he';
      button.dir = 'rtl';
      button.disabled = !token.active;
      button.setAttribute('aria-pressed', token.active ? 'true' : 'false');
      if (token.active) {
        button.title = 'Jump to selected word';
        button.addEventListener('click', scrollToSelectedWord);
      } else {
        button.title = 'Not materialized in this render slice';
      }
      passageLine.appendChild(button);
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
    for (const span of model.compSpans) {
      const button = el('button', 'span-option', span.selectLabel);
      button.type = 'button';
      button.lang = 'he';
      button.dir = 'rtl';
      button.dataset.compSpanId = span.id;
      button.setAttribute('aria-pressed', span.id === selectedCompSpan().id ? 'true' : 'false');
      button.addEventListener('click', () => {
        state.compSpanId = span.id;
        render();
      });
      spanOptions.appendChild(button);
    }
  }

  function renderWordCard() {
    wordHebrew.textContent = model.word.hebrew;
    wordTransliteration.textContent = model.word.transliteration;
  }

  function selectedGlossText(span) {
    const parts = span.cells.map((cell) => selectedRoute(selectedLBundle(cell)).text);
    return span.isSplit ? parts.join(' + ') : parts[0];
  }

  function renderSelectedGloss(span) {
    clear(selectedGlossStack);
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

    if (cell.lBundles.length <= PILL_LIMIT) {
      const pills = el('div', 'bundle-pills ledger-pills');
      pills.setAttribute('role', 'group');
      pills.setAttribute('aria-label', `L bundle for ${cell.transliteration}`);

      for (const optionBundle of cell.lBundles) {
        const button = el('button', 'bundle-pill ledger-pill', optionBundle.label);
        button.type = 'button';
        button.setAttribute('aria-pressed', optionBundle.id === bundle.id ? 'true' : 'false');
        button.addEventListener('click', () => {
          state.lBundleByCell.set(cell.id, optionBundle.id);
          render();
        });
        pills.appendChild(button);
      }

      wrap.appendChild(pills);
      return wrap;
    }

    const select = el('select', 'bundle-select');
    select.id = `l-${cell.id}`;
    select.dataset.cellId = cell.id;
    for (const optionBundle of cell.lBundles) {
      const option = document.createElement('option');
      option.value = optionBundle.id;
      option.textContent = optionBundle.label;
      select.appendChild(option);
    }
    select.value = bundle.id;
    select.addEventListener('change', () => {
      state.lBundleByCell.set(cell.id, select.value);
      render();
    });
    wrap.appendChild(select);
    return wrap;
  }

  function renderRouteControl(bundle) {
    const selected = selectedRoute(bundle);
    const wrap = el('div', 'route-select-wrap');
    const label = el('span', 'control-label', 'R ROUTE');
    wrap.appendChild(label);

    if (bundle.routes.length <= PILL_LIMIT) {
      const pills = el('div', 'route-pills ledger-pills');
      pills.setAttribute('role', 'group');
      pills.setAttribute('aria-label', `R route inside ${bundle.label}`);

      for (const route of bundle.routes) {
        const button = el('button', 'route-pill ledger-pill r-route-pill', route.text);
        button.type = 'button';
        button.setAttribute('aria-pressed', route.id === selected.id ? 'true' : 'false');
        button.addEventListener('click', () => {
          state.routeByLBundle.set(bundle.id, route.id);
          render();
        });
        pills.appendChild(button);
      }

      wrap.appendChild(pills);
      return wrap;
    }

    const select = el('select', 'route-select');
    select.id = `r-${bundle.id}`;
    for (const route of bundle.routes) {
      const option = document.createElement('option');
      option.value = route.id;
      option.textContent = route.text;
      select.appendChild(option);
    }
    select.value = selected.id;
    select.addEventListener('change', () => {
      state.routeByLBundle.set(bundle.id, select.value);
      render();
    });
    wrap.appendChild(select);
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

  function renderPProofDetail(cell, bundle) {
    const proof = pProofForBundle(bundle);
    const route = selectedRoute(bundle);
    const support = selectedMSupport(bundle);
    const card = el('article', 'detail-card proof-card');
    card.appendChild(el('h2', 'section-kicker', 'P PROOF'));
    card.appendChild(el('h3', 'detail-title', proof.label));

    const rows = el('dl', 'proof-rows');
    const proofRows = [
      ['relation', proof.relation],
      ['R active', route.text],
      ['R set', bundle.routes.map((item) => item.text).join(' | ')],
      ['P key', proof.bucketKey],
      ['M bucket', `${proof.mSupportIds.length} support${proof.mSupportIds.length === 1 ? '' : 's'}`],
      ['M active', support.label]
    ];

    for (const row of proofRows) {
      rows.appendChild(el('dt', null, row[0]));
      rows.appendChild(el('dd', null, row[1]));
    }

    card.appendChild(rows);
    card.appendChild(el('p', 'proof-copy', proof.matchMode));
    return card;
  }

  function renderMSupportControl(bundle, support) {
    if (bundle.mSupports.length < 2) return null;

    const wrap = el('div', 'source-select-wrap');
    const label = el('span', 'section-kicker source-kicker', 'M SOURCE');
    wrap.appendChild(label);

    if (bundle.mSupports.length <= PILL_LIMIT) {
      const pills = el('div', 'source-pills ledger-pills');
      pills.setAttribute('role', 'group');
      pills.setAttribute('aria-label', `M source for ${bundle.label}`);

      for (const optionSupport of bundle.mSupports) {
        const button = el('button', 'source-pill ledger-pill', optionSupport.label);
        button.type = 'button';
        button.setAttribute('aria-pressed', optionSupport.id === support.id ? 'true' : 'false');
        button.addEventListener('click', () => {
          state.mSupportByLBundle.set(bundle.id, optionSupport.id);
          render();
        });
        pills.appendChild(button);
      }

      wrap.appendChild(pills);
      return wrap;
    }

    const select = el('select', 'source-select');
    select.id = `m-${bundle.id}`;
    for (const optionSupport of bundle.mSupports) {
      const option = document.createElement('option');
      option.value = optionSupport.id;
      option.textContent = optionSupport.label;
      select.appendChild(option);
    }
    select.value = support.id;
    select.addEventListener('change', () => {
      state.mSupportByLBundle.set(bundle.id, select.value);
      render();
    });
    wrap.appendChild(select);
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
    for (const cell of span.cells) {
      const bundle = selectedLBundle(cell);
      detailStack.appendChild(renderSpanDetail(cell));
      detailStack.appendChild(renderDefinitionDetail(cell, bundle));
      detailStack.appendChild(renderPProofDetail(cell, bundle));
      detailStack.appendChild(renderLicenseDetail(cell, bundle));
    }
  }

  function render() {
    const span = selectedCompSpan();
    renderSelector();
    renderSelectedGloss(span);
    renderChoicePanel(span);
    renderDetails(span);
  }

  renderContents();
  renderPassage();
  renderWordCard();
  render();
}());
