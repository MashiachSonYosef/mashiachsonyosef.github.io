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
      const componentMatchScore = componentHud.querySelector('[data-component-match-score]');
      if (componentMatchScore) componentMatchScore.textContent = button.dataset.matchScore || 'pending';
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

    const matchStatus = scope.querySelector('[data-match-status]');
    if (matchStatus) matchStatus.textContent = '% Match';

    const matchScore = scope.querySelector('[data-match-score]');
    if (matchScore) matchScore.textContent = button.dataset.matchScore || 'pending';

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

  function updateSelectedGlossFromHud(row) {
    const hud = row.querySelector('.comp-hud-set.is-active');
    const selected = row.querySelector('[data-selected-comp-cells]');
    if (!hud || !selected) return;
    const cells = Array.from(hud.querySelectorAll('.hud-component-column'));
    selected.replaceChildren();
    selected.dataset.cellCount = String(Math.max(1, cells.length));
    cells.forEach((cell, index) => {
      const route = cell.querySelector('.route-option.is-active');
      const fallback = cell.querySelector('[data-component-match-score]');
      const value = route?.dataset.routeValue || fallback?.textContent || 'N/A';
      const piece = document.createElement('span');
      piece.className = 'selected-piece';
      piece.dataset.selectedRouteCell = route?.dataset.routeCell || cell.dataset.componentPart || String(index + 1);
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
    row.querySelectorAll('.comp-hud-set').forEach((set) => {
      set.classList.toggle('is-active', set.dataset.compOptionId === optionId);
    });
    updateSelectedGlossFromHud(row);
    selectRow(row);
  }

  function syncRouteButtons(row, optionId, cellId, value) {
    row.querySelectorAll('.route-option').forEach((item) => {
      const holder = item.closest('[data-comp-option-id]');
      if ((holder?.dataset.compOptionId || '') !== optionId) return;
      if ((item.dataset.routeCell || '') !== cellId) return;
      item.classList.toggle('is-active', (item.dataset.routeValue || item.textContent || '') === value);
    });
  }

  function activateRoute(button) {
    const row = button.closest('.word-row');
    if (!row) return;
    const holder = button.closest('[data-comp-option-id]');
    const optionId = holder?.dataset.compOptionId || row.querySelector('.comp-hud-set.is-active')?.dataset.compOptionId || '';
    const option = optionId ? Array.from(row.querySelectorAll('.comp-option')).find((item) => item.dataset.compOptionId === optionId) : null;
    if (option && !option.classList.contains('is-active')) activateCompOption(option);
    const value = button.dataset.routeValue || button.textContent || 'N/A';
    const cellId = button.dataset.routeCell || '1';
    syncRouteButtons(row, optionId, cellId, value);
    updateSelectedGlossFromHud(row);
    selectRow(row);
  }

  document.addEventListener('click', (event) => {
    const routeOption = event.target.closest('.route-option');
    if (routeOption) {
      activateRoute(routeOption);
      return;
    }

    const compOption = event.target.closest('.comp-option');
    if (compOption) {
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

  window.addEventListener('hashchange', () => selectRow(rowForHash()));
  selectRow(rowForHash());
})();
