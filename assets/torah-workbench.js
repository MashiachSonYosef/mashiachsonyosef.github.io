(function () {
  const selectedClass = 'is-selected';
  let scrollRun = 0;
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  function rowForHash() {
    const id = decodeURIComponent(window.location.hash || '').slice(1);
    return id ? document.getElementById(id) : null;
  }

  function selectRow(row) {
    document.querySelectorAll('.word-row').forEach((item) => item.classList.remove(selectedClass));
    if (!row) return;
    row.classList.add(selectedClass);
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function slowScrollTo(target) {
    const run = ++scrollRun;
    const start = window.scrollY;
    const top = target.id === 'page-top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 8;
    const distance = top - start;
    const duration = Math.min(2200, Math.max(900, Math.abs(distance) * 0.55));
    const started = performance.now();
    function frame(now) {
      if (run !== scrollRun) return;
      const progress = Math.min(1, (now - started) / duration);
      window.scrollTo(0, start + distance * easeInOutSine(progress));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function smoothHashTarget(anchor) {
    const href = anchor?.getAttribute('href') || '';
    if (!href.startsWith('#') || href.length < 2) return false;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return false;
    window.history.pushState(null, '', href);
    if (target.id === 'page-top') selectRow(null);
    slowScrollTo(target);
    if (target.classList.contains('word-row')) selectRow(target);
    return true;
  }

  function panelValue(option, panel) {
    const direct = option?.dataset?.[panel];
    return direct || '';
  }

  function activateGloss(button) {
    const row = button.closest('.word-row');
    if (!row) return;
    const activeScope = button.closest('.selectable-column') || button.closest('.component-lane') || row;
    const scope = button.closest('.component-lane') || row;
    activeScope.querySelectorAll('.gloss-option').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');

    const selectedPart = button.dataset.selectedPart || '';
    const selectedText = button.dataset.selectedText || button.dataset.label || 'N/A';
    const compositePrefix = scope.querySelector('[data-selected-prefix-value]');
    const compositeBase = scope.querySelector('[data-selected-base-value]');
    if (selectedPart === 'prefix' && compositePrefix) {
      compositePrefix.textContent = selectedText;
    } else if (selectedPart === 'base' && compositeBase) {
      compositeBase.textContent = selectedText;
    } else {
      const selected = scope.querySelector('[data-selected-gloss-value]');
      if (selected) selected.textContent = button.dataset.label || 'N/A';
    }

    const componentHud = selectedPart ? scope.querySelector(`.hud-component-column[data-component-part="${selectedPart}"]`) : null;
    if (componentHud) {
      const componentLicenseTag = componentHud.querySelector('[data-component-license-tag]');
      if (componentLicenseTag) componentLicenseTag.textContent = button.dataset.licenseDisplay || button.dataset.licenseTag || '';
      const componentMatchBasis = componentHud.querySelector('[data-component-match-basis]');
      if (componentMatchBasis) componentMatchBasis.textContent = button.dataset.matchDisplay || button.dataset.label || 'No match detail loaded.';
      const componentMatchDetail = componentHud.querySelector('[data-component-match-detail]');
      if (componentMatchDetail) componentMatchDetail.textContent = button.dataset.matchDetail || '';
      const componentLicenseBasis = componentHud.querySelector('[data-component-license-basis]');
      if (componentLicenseBasis) componentLicenseBasis.textContent = button.dataset.licenseDisplay || button.dataset.licenseTag || 'License pending';
      const componentLicenseDetail = componentHud.querySelector('[data-component-license-detail]');
      if (componentLicenseDetail) componentLicenseDetail.textContent = button.dataset.licenseDetail || '';
    }

    const licenseTag = scope.querySelector('[data-license-tag]');
    if (licenseTag) licenseTag.textContent = button.dataset.licenseDisplay || button.dataset.licenseTag || '';

    const matchBasis = scope.querySelector('[data-match-basis]');
    if (matchBasis) matchBasis.textContent = button.dataset.matchDisplay || button.dataset.label || 'No match detail loaded.';
    const matchDetail = scope.querySelector('[data-match-detail]');
    if (matchDetail) matchDetail.textContent = button.dataset.matchDetail || '';

    const licenseBasis = scope.querySelector('[data-license-basis]');
    if (licenseBasis) licenseBasis.textContent = button.dataset.licenseDisplay || button.dataset.licenseTag || 'License pending';
    const licenseDetail = scope.querySelector('[data-license-detail]');
    if (licenseDetail) licenseDetail.textContent = button.dataset.licenseDetail || '';

    scope.querySelectorAll('.proof-panel').forEach((panel) => {
      const key = panel.dataset.panel;
      const body = panel.querySelector('p');
      const replacement = panelValue(button, key);
      if (body && replacement) body.textContent = replacement;
    });
    selectRow(row);
  }

  function optionCell(option, cellId) {
    return option?.querySelector(`.comp-option-cell[data-comp-cell-index="${CSS.escape(cellId)}"]`) || null;
  }

  function activeLaneForCell(cell) {
    return cell?.querySelector('.l-lane-option.is-active') || cell?.querySelector('.l-lane-option') || null;
  }

  function activeRouteForLane(lane) {
    return lane?.querySelector('.route-option.is-active') || null;
  }

  function compOptionById(row, optionId) {
    return optionId
      ? Array.from(row.querySelectorAll('.comp-option')).find((item) => item.dataset.compOptionId === optionId) || null
      : null;
  }

  function laneById(cell, laneId) {
    return laneId
      ? Array.from(cell?.querySelectorAll('.l-lane-option') || []).find((item) => item.dataset.laneId === laneId) || null
      : null;
  }

  function selectedValueForLane(lane) {
    const route = activeRouteForLane(lane);
    return route?.dataset.routeValue || lane?.dataset.laneSelectedValue || 'N/A';
  }

  function updateSelectedGlossFromHud(row) {
    const hud = row.querySelector('.comp-hud-set.is-active');
    const selected = row.querySelector('[data-selected-comp-cells]');
    if (!hud || !selected) return;
    const activeHudId = hud.dataset.compOptionId || '';
    const activeOption = Array.from(row.querySelectorAll('.comp-option.is-active'))
      .find((item) => (item.dataset.compOptionId || '') === activeHudId)
      || row.querySelector('.comp-option.is-active');
    if (hud.dataset.compEmpty === 'true') {
      selected.replaceChildren();
      selected.dataset.cellCount = '1';
      const piece = document.createElement('span');
      piece.className = 'selected-piece';
      piece.dataset.selectedRouteCell = '1';
      piece.textContent = 'N/A';
      selected.append(piece);
      return;
    }
    const cells = Array.from(hud.querySelectorAll('.hud-component-column'));
    selected.replaceChildren();
    selected.dataset.cellCount = String(Math.max(1, cells.length));
    cells.forEach((cell, index) => {
      const cellId = cell.dataset.componentPart || String(index + 1);
      const selectedCell = optionCell(activeOption, cellId);
      const lane = activeLaneForCell(selectedCell);
      const value = selectedValueForLane(lane) || cell.dataset.selectedValue || 'N/A';
      const piece = document.createElement('span');
      piece.className = 'selected-piece';
      piece.dataset.selectedRouteCell = cellId;
      piece.textContent = value;
      selected.append(piece);
    });
  }

  function activateCompOption(button) {
    const row = button.closest('.word-row');
    if (!row) return;
    const optionId = button.dataset.compOptionId || '';
    row.querySelectorAll('.comp-option').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    const selector = row.querySelector('.comp-option-select');
    if (selector && selector.value !== optionId) selector.value = optionId;
    row.querySelectorAll('.comp-hud-set').forEach((set) => {
      set.classList.toggle('is-active', set.dataset.compOptionId === optionId);
    });
    updateSelectedGlossFromHud(row);
    selectRow(row);
  }

  function syncLaneDisplay(row, optionId, cellId, lane, value = '') {
    if (!lane) return;
    const selectedValue = value || selectedValueForLane(lane);
    lane.dataset.laneSelectedValue = selectedValue || 'N/A';
    row.querySelectorAll('.comp-hud-set').forEach((set) => {
      if ((set.dataset.compOptionId || '') !== optionId) return;
      set.querySelectorAll('.hud-component-column').forEach((card) => {
        if ((card.dataset.componentPart || '') !== cellId) return;
        card.dataset.laneId = lane.dataset.laneId || '';
        card.dataset.selectedValue = selectedValue || 'N/A';
        const definition = card.querySelector('[data-component-match-basis]');
        if (definition) definition.textContent = lane.dataset.laneDefinition || selectedValue || 'N/A';
        const license = card.querySelector('[data-component-license-basis]');
        if (license) license.textContent = lane.dataset.laneLicense || '';
        const licenseDetail = card.querySelector('[data-component-license-detail]');
        if (licenseDetail) licenseDetail.textContent = lane.dataset.laneLicenseDetail || '';
        const selectedRoute = card.querySelector('[data-component-selected-route]');
        if (selectedRoute) selectedRoute.textContent = selectedValue && selectedValue !== 'N/A' ? `Selected: ${selectedValue}. ` : '';
        const matchText = card.querySelector('[data-component-match-text]');
        if (matchText) matchText.textContent = lane.dataset.laneMatchText || '';
        syncExactSourceSelector(card, lane);
      });
    });
  }

  function activateLane(lane, update = true) {
    const row = lane.closest('.word-row');
    if (!row) return;
    const holder = lane.closest('[data-comp-option-id]');
    const optionId = holder?.dataset.compOptionId || '';
    const cellId = lane.dataset.routeCell || '1';
    const option = compOptionById(row, optionId);
    if (option && !option.classList.contains('is-active')) activateCompOption(option);
    const cell = lane.closest('.comp-option-cell');
    cell?.querySelectorAll('.l-lane-option').forEach((item) => item.classList.toggle('is-active', item === lane));
    const laneSelect = cell?.querySelector('.l-lane-select');
    if (laneSelect && laneSelect.value !== (lane.dataset.laneId || '')) laneSelect.value = lane.dataset.laneId || '';
    syncLaneDisplay(row, optionId, cellId, lane);
    if (update) {
      updateSelectedGlossFromHud(row);
      selectRow(row);
    }
  }

  function syncRouteButtons(row, optionId, cellId, value, selectedButton = null) {
    const option = compOptionById(row, optionId);
    if (!option) return;
    const lane = selectedButton?.closest('.l-lane-option') || activeLaneForCell(optionCell(option, cellId));
    lane?.querySelectorAll('.route-option').forEach((item) => {
      if ((item.dataset.routeCell || '') !== cellId) return;
      const itemValue = item.dataset.routeValue || item.textContent || '';
      item.classList.toggle('is-active', item === selectedButton || itemValue === value);
    });
  }

  function syncRouteDisplay(row, optionId, cellId, value) {
    const option = compOptionById(row, optionId);
    const lane = activeLaneForCell(optionCell(option, cellId));
    syncLaneDisplay(row, optionId, cellId, lane, value);
  }

  function activateRoute(button) {
    const row = button.closest('.word-row');
    if (!row) return;
    const holder = button.closest('[data-comp-option-id]');
    const optionId = holder?.dataset.compOptionId || row.querySelector('.comp-hud-set.is-active')?.dataset.compOptionId || '';
    const option = compOptionById(row, optionId);
    if (option && !option.classList.contains('is-active')) activateCompOption(option);
    const lane = button.closest('.l-lane-option');
    if (lane) activateLane(lane, false);
    const value = button.dataset.routeValue || button.textContent || 'N/A';
    const cellId = button.dataset.routeCell || '1';
    syncRouteButtons(row, optionId, cellId, value, button);
    syncRouteDisplay(row, optionId, cellId, value);
    updateSelectedGlossFromHud(row);
    selectRow(row);
  }

  function activateExactSource(select) {
    const panel = select.closest('.l-card-license');
    if (!panel) return;
    const selected = select.selectedOptions?.[0];
    const basis = panel.querySelector('[data-component-license-basis]');
    const detail = panel.querySelector('[data-component-license-detail]');
    if (basis) basis.textContent = selected?.dataset.licenseBasis || '';
    if (detail) detail.textContent = selected?.dataset.licenseDetail || '';
  }

  function laneSourceOptions(lane) {
    try {
      const parsed = JSON.parse(lane?.dataset?.laneSourceOptions || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function buildSourceSelector(panel) {
    const label = document.createElement('label');
    label.className = 'm-source-selector';
    const span = document.createElement('span');
    span.textContent = 'Exact source';
    const select = document.createElement('select');
    select.className = 'm-source-select';
    select.setAttribute('aria-label', 'Exact license source');
    label.append(span, select);
    const basis = panel.querySelector('[data-component-license-basis]');
    panel.insertBefore(label, basis || null);
    return select;
  }

  function syncExactSourceSelector(card, lane) {
    const panel = card.querySelector('.l-card-license');
    if (!panel) return;
    const options = laneSourceOptions(lane);
    let wrapper = panel.querySelector('.m-source-selector');
    const basis = panel.querySelector('[data-component-license-basis]');
    const detail = panel.querySelector('[data-component-license-detail]');
    if (options.length <= 1) {
      wrapper?.remove();
      if (options[0]) {
        if (basis) basis.textContent = options[0].basis || '';
        if (detail) detail.textContent = options[0].detail || '';
      }
      return;
    }
    let select = wrapper?.querySelector('.m-source-select');
    if (!select) select = buildSourceSelector(panel);
    select.textContent = '';
    options.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = item.value || `source-${index + 1}`;
      option.textContent = item.label || `source ${index + 1}`;
      option.dataset.licenseBasis = item.basis || '';
      option.dataset.licenseDetail = item.detail || '';
      if (index === 0) option.selected = true;
      select.append(option);
    });
    activateExactSource(select);
  }

  document.addEventListener('click', (event) => {
    const routeOption = event.target.closest('.route-option');
    if (routeOption) {
      event.preventDefault();
      event.stopPropagation();
      activateRoute(routeOption);
      return;
    }

    const laneOption = event.target.closest('.l-lane-option');
    if (laneOption) {
      event.preventDefault();
      event.stopPropagation();
      activateLane(laneOption);
      return;
    }

    const compOption = event.target.closest('.comp-option');
    if (compOption) {
      event.preventDefault();
      event.stopPropagation();
      activateCompOption(compOption);
      return;
    }

    const option = event.target.closest('.gloss-option');
    if (option) activateGloss(option);

    const token = event.target.closest('.passage-token');
    if (token) {
      event.preventDefault();
      smoothHashTarget(token);
    }

    const tocLink = event.target.closest('.toc-link, .passage-ref a');
    if (tocLink) {
      event.preventDefault();
      smoothHashTarget(tocLink);
    }
  });

  document.addEventListener('change', (event) => {
    const compSelect = event.target.closest('.comp-option-select');
    if (compSelect) {
      const row = compSelect.closest('.word-row');
      const option = row ? compOptionById(row, compSelect.value) : null;
      if (option) activateCompOption(option);
      return;
    }

    const laneSelect = event.target.closest('.l-lane-select');
    if (laneSelect) {
      const cell = laneSelect.closest('.comp-option-cell');
      const lane = laneById(cell, laneSelect.value);
      if (lane) activateLane(lane);
      return;
    }

    const sourceSelect = event.target.closest('.m-source-select');
    if (sourceSelect) {
      activateExactSource(sourceSelect);
    }
  });

  window.addEventListener('hashchange', () => selectRow(rowForHash()));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => selectRow(rowForHash()), { once: true });
  } else {
    selectRow(rowForHash());
  }
})();
