import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(issues) {
  if (!issues.length) {
    console.log('HUD contract validation passed.');
    return;
  }
  console.error(`HUD contract validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

function assert(condition, message, issues) {
  if (!condition) issues.push(message);
}

const issues = [];
const preview = read('hud-preview/index.html');
const routePreview = read('hud-preview/routes/index.html');
const routePreviewApp = read('hud-preview/routes/app.js');
const renderer = read('scripts/render_site.ps1');
const previewScripts = [...preview.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n');
const previewQuarantined = preview.includes('data-public-runtime-quarantine="hud-preview"');
const routePreviewQuarantined = routePreview.includes('data-public-runtime-quarantine="hud-preview-routes"');

if (!previewQuarantined) {
  try {
    new Function(previewScripts);
  } catch (error) {
    issues.push(`hud-preview inline JavaScript syntax failed: ${error.message}`);
  }

  assert(!/Click anywhere/i.test(preview), 'preview must not instruct users to click anywhere to close', issues);
  assert(!preview.includes('hud.addEventListener("click", closeHud)'), 'preview must not close when any HUD interior is clicked', issues);
  assert(preview.includes('data-close'), 'preview needs an explicit close control', issues);
  assert(preview.includes('license-panel'), 'preview must keep source/license rows expanded', issues);
  assert(!preview.includes('<details'), 'preview source/license rows should not be hidden behind details', issues);
  assert(preview.includes('grid-auto-flow: column') || preview.includes('hud-card-lane'), 'preview must expose multi-card route groups', issues);
  assert(!/\bPotential\b|potential option/i.test(preview), 'preview must not use vague Potential labeling', issues);
}

if (!routePreviewQuarantined) {
  try {
    new Function(routePreviewApp);
  } catch (error) {
    issues.push(`hud-preview/routes app JavaScript syntax failed: ${error.message}`);
  }

  assert(routePreview.includes('hud-route-data'), 'route preview must embed route contract data', issues);
  assert(routePreview.includes('app.js'), 'route preview must load its renderer script', issues);
  assert(routePreview.includes('Sources and licenses'), 'route preview must expose source/license footnotes', issues);
  assert(routePreview.includes('grid-template-columns: repeat(auto-fit'), 'route preview must use compact card grids', issues);
  assert(routePreviewApp.includes('selectRouteAnswer'), 'route preview app must use the same answer-selection contract as the live renderer', issues);
  assert(routePreviewApp.includes('answerAmbiguity'), 'route preview app must suppress ambiguous answer slots like the live renderer', issues);
  assert(!routePreview.includes('Best actual hit'), 'route preview must not use stale answer label', issues);
  assert(!routePreview.includes('Full source and license rows'), 'route preview must not use stale source label', issues);
  assert(!/<details/i.test(routePreview), 'route preview source/license rows should not be hidden behind details', issues);
  assert(!/\bPotential\b|potential option|low confidence/i.test(`${routePreview}\n${routePreviewApp}`), 'route preview must not use vague or demoting labels', issues);
}

assert(!renderer.includes('Potential options'), 'renderer must not label route groups as Potential options', issues);
assert(!renderer.includes('status === "Potential"'), 'renderer must not score any claim as Potential', issues);
assert(renderer.includes('selectRouteAnswer'), 'renderer must own route answer selection', issues);
assert(renderer.includes('lookupCandidateTreatments'), 'renderer must expose generated form treatment rows', issues);
assert(renderer.includes('Sources and licenses'), 'renderer must expose source/license footnotes', issues);
assert(renderer.includes('source-footnotes'), 'renderer must use compact source/license footnotes', issues);
assert(renderer.includes('hud-card-lane'), 'renderer must expose compact card grids for multi-card route groups', issues);
assert(!renderer.includes('Best actual hit'), 'renderer must not use stale answer label', issues);
assert(!renderer.includes('Full source and license rows'), 'renderer must not use stale source label', issues);
assert(!/Click anywhere/i.test(renderer), 'renderer must not use click-anywhere-to-close copy', issues);

fail(issues);
