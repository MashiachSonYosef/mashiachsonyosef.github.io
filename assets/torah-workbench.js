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

  document.addEventListener('click', (event) => {
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
