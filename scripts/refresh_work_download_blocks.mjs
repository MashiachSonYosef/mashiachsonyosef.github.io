import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'data', 'sources');
const publicLexicalDir = path.join(root, 'data', 'public-lexical', 'by-work');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function rootHrefForSlug(slug) {
  const depth = String(slug).split(/[\\/]/).filter(Boolean).length;
  return depth <= 0 ? './' : '../'.repeat(depth);
}

function buildBlock(source) {
  const workId = String(source.work_id || '');
  const rootHref = rootHrefForSlug(source.work_slug || '');
  const links = [];
  const manifestPath = `data/lexical/${workId}.manifest.json`;
  if (exists(manifestPath)) {
    links.push(`<a class="export-button" href="${rootHref}${manifestPath}">Lexical manifest</a>`);
  }
  const workClaims = `data/public-lexical/by-work/${workId}.csv`;
  if (exists(workClaims)) {
    links.push(`<a class="export-button" href="${rootHref}${workClaims}" download>Book claims CSV</a>`);
  }
  const tokenStatus = `data/public-lexical/by-work/${workId}-token-status.csv`;
  if (exists(tokenStatus)) {
    links.push(`<a class="export-button" href="${rootHref}${tokenStatus}" download>Token status CSV</a>`);
  }
  const tokenClaims = `data/public-lexical/by-work/${workId}-token-claims-min60.csv`;
  if (exists(tokenClaims)) {
    links.push(`<a class="export-button" href="${rootHref}${tokenClaims}" download>Token claims CSV</a>`);
  }
  const aiOptions = `data/public-lexical/by-work/${workId}-ai-options-min60.csv`;
  if (exists(aiOptions)) {
    links.push(`<a class="export-button" href="${rootHref}${aiOptions}" download>AI options CSV</a>`);
  }
  if (!links.length) return '';
  return [
    '        <div class="license-notice lexical-downloads">',
    '          <strong>Downloads:</strong> Book-local lexical files. CSV rows are lexical options, not translations; preserve row-level source/license columns.',
    `          <p class="export-actions">${links.join('')}</p>`,
    '        </div>',
    '',
  ].join('\n');
}

let updated = 0;
let skipped = 0;

for (const name of fs.readdirSync(sourceDir).filter((entry) => entry.endsWith('.json')).sort()) {
  const source = readJson(path.join(sourceDir, name));
  if (!source.work_slug || !source.work_id) {
    skipped += 1;
    continue;
  }
  const htmlPath = path.join(root, source.work_slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    skipped += 1;
    continue;
  }
  const block = buildBlock(source);
  let html = fs.readFileSync(htmlPath, 'utf8');
  const original = html;
  const blockPattern = /        <div class="license-notice lexical-downloads">\r?\n[\s\S]*?        <\/div>\r?\n/;
  if (blockPattern.test(html)) {
    html = html.replace(blockPattern, block);
  } else if (block) {
    html = html.replace(
      /(        <p class="meta lexical-coverage">[\s\S]*?<\/p>\r?\n)/,
      `$1${block}`,
    );
  }
  if (html !== original) {
    fs.writeFileSync(htmlPath, html.replace(/\r\n/g, '\n'), 'utf8');
    updated += 1;
  }
}

console.log(`Refreshed lexical download blocks on ${updated} work pages; skipped ${skipped}.`);
console.log(`Public lexical by-work files available: ${fs.existsSync(publicLexicalDir) ? fs.readdirSync(publicLexicalDir).length : 0}`);
