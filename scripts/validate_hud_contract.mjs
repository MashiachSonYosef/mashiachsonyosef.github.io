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
const renderer = read('scripts/render_site.ps1');
const previewScripts = [...preview.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n');

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
assert(preview.includes('grid-auto-flow: column'), 'preview must include horizontal card lanes', issues);
assert(preview.includes('grid-auto-columns: clamp(250px, 38%, 380px)'), 'preview card lanes must show partial overflow cards', issues);
assert(preview.includes('document.addEventListener("wheel"'), 'preview must translate hovered wheel movement into horizontal lane scrolling', issues);
assert(preview.includes('passive: false'), 'preview wheel handler must be cancelable for horizontal lane scrolling', issues);
assert(!/\bPotential\b|potential option/i.test(preview), 'preview must not use vague Potential labeling', issues);

assert(!renderer.includes('Potential options'), 'renderer must not label route groups as Potential options', issues);
assert(!renderer.includes('status === "Potential"'), 'renderer must not score any claim as Potential', issues);
assert(renderer.includes('Other source matches'), 'renderer must label non-winning real routes as other source matches', issues);
assert(renderer.includes('Audit-only checks'), 'renderer must label low-confidence/noisy rows as audit-only checks', issues);
assert(renderer.includes('<details class="source-details" open>'), 'renderer source/license details must default open', issues);
assert(renderer.includes('details.open = true'), 'renderer must keep source/license details open after loading a token', issues);
assert(renderer.includes('hud-card-lane'), 'renderer must expose horizontal card lane styles for multi-card route groups', issues);
assert(renderer.includes('document.addEventListener("wheel"'), 'renderer must support horizontal card lane wheel scrolling', issues);
assert(!/Click anywhere/i.test(renderer), 'renderer must not use click-anywhere-to-close copy', issues);

fail(issues);
