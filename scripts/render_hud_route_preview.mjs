#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  fixtures: 'data/definitions/hud-route-fixtures.json',
  storeSample: 'data/definitions/hud-route-store-sample.json',
  contract: 'data/definitions/hud-route-contract.json',
  out: 'hud-preview/routes/index.html',
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fixtures') args.fixtures = argv[++i];
    else if (arg === '--store-sample') args.storeSample = argv[++i];
    else if (arg === '--contract') args.contract = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/render_hud_route_preview.mjs',
    '',
    'Options:',
    '  --fixtures data/definitions/hud-route-fixtures.json',
    '  --store-sample data/definitions/hud-route-store-sample.json',
    '  --contract data/definitions/hud-route-contract.json',
    '  --out hud-preview/routes/index.html',
  ].join('\n');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function jsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function renderPage({ fixtures, storeSample, contract }) {
  const payload = jsonForHtml({ fixtures, storeSample, contract });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Route Contract HUD Preview | Hebrew Source Workbench</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #07100e;
      --panel: #111b18;
      --paper: #efe4ca;
      --text: #f2ead8;
      --muted: #bfb49b;
      --line: rgba(239, 228, 202, 0.18);
      --line-strong: rgba(239, 228, 202, 0.42);
      --accent: #d6b15f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at 20% 0%, rgba(139, 191, 138, 0.14), transparent 34rem),
        radial-gradient(circle at 90% 10%, rgba(214, 177, 95, 0.12), transparent 28rem),
        linear-gradient(180deg, #07100e 0%, #0e1513 100%);
      color: var(--text);
      font-family: Georgia, "Times New Roman", serif;
    }
    main { width: min(1280px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 80px; }
    a { color: var(--accent); }
    .shell { border: 1px solid var(--line); background: rgba(7, 16, 14, 0.76); box-shadow: 0 28px 90px rgba(0,0,0,0.36); }
    .hero { padding: clamp(18px, 4vw, 38px); border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 14px; font-weight: 400; line-height: 0.92; font-size: clamp(2.35rem, 7vw, 5.8rem); }
    h2, h3, p { margin-top: 0; }
    p { color: var(--muted); line-height: 1.6; }
    .layout { display: grid; grid-template-columns: minmax(230px, 320px) 1fr; gap: 18px; padding: clamp(14px, 3vw, 24px); }
    .token-list { align-self: start; position: sticky; top: 14px; display: grid; gap: 10px; }
    .token-list button { border: 1px solid var(--line); background: var(--panel); color: var(--text); padding: 12px; text-align: left; cursor: pointer; font: inherit; }
    .token-list button[aria-pressed="true"] { border-color: var(--accent); background: rgba(214, 177, 95, 0.1); }
    .token-list span { display: block; color: var(--paper); font-size: 1.55rem; text-align: right; }
    .token-list small { display: block; color: var(--muted); margin-top: 4px; }
    .hud-panel { display: grid; gap: 14px; min-width: 0; }
    .selected-token { border: 1px solid var(--line-strong); background: rgba(239, 228, 202, 0.06); color: var(--paper); padding: clamp(14px, 4vw, 26px); text-align: center; font-size: clamp(2.4rem, 8vw, 5.6rem); line-height: 1.05; overflow-wrap: anywhere; }
    .route-card, .section-card, .audit-card, .source-license-card { border: 1px solid var(--line); background: rgba(17, 27, 24, 0.94); padding: clamp(14px, 3vw, 20px); }
    .answer-card { border-color: var(--line-strong); background: linear-gradient(145deg, rgba(214, 177, 95, 0.18), rgba(139, 191, 138, 0.08)); }
    .route-head, .section-title { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; flex-wrap: wrap; }
    .route-kind, .section-title span { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }
    .confidence { border: 1px solid var(--line-strong); border-radius: 999px; padding: 1px 8px; color: var(--accent); white-space: nowrap; }
    .route-form { color: var(--paper); font-size: clamp(1.45rem, 4vw, 2.5rem); line-height: 1.18; text-align: right; overflow-wrap: anywhere; }
    .route-meta, .plain-note, .source-mini, .scroll-note { color: var(--muted); font-size: 0.9rem; margin-bottom: 7px; }
    .definition { color: var(--text); font-size: clamp(1.03rem, 2vw, 1.22rem); margin-bottom: 8px; }
    .route-lane { display: grid; grid-auto-flow: column; grid-auto-columns: clamp(260px, 40%, 390px); gap: 10px; overflow-x: auto; padding-bottom: 7px; scroll-snap-type: x proximity; overscroll-behavior-inline: contain; scrollbar-color: var(--accent) rgba(255,255,255,0.08); scrollbar-width: thin; }
    .route-lane::after { content: ""; width: 18px; }
    .route-lane > .route-card { scroll-snap-align: start; }
    .phrase-line { color: var(--paper); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 8px 0; margin: 8px 0; font-size: 1.25rem; text-align: right; }
    .phrase-focus { color: var(--accent); border-bottom: 1px solid var(--accent); }
    .phrase-context { color: var(--paper); opacity: 0.72; }
    .audit-grid, .source-grid { display: grid; gap: 10px; }
    .audit-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .audit-grid p { margin: 0; border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 8px; font-size: 0.88rem; }
    .source-row { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 10px; }
    .source-row p { margin-bottom: 5px; font-size: 0.9rem; }
    @media (max-width: 820px) {
      main { width: min(100% - 18px, 1280px); }
      .layout { grid-template-columns: 1fr; }
      .token-list { position: static; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
      .route-lane { grid-auto-columns: minmax(245px, 84%); }
    }
  </style>
</head>
<body>
  <main>
    <section class="shell">
      <div class="hero">
        <p><a href="../">Back to HUD preview</a> | <a href="../../">Back to library</a></p>
        <h1>Route Contract HUD Preview</h1>
        <p>This preview is generated from the committed HUD route contract, route fixtures, and route-store sample. It is the bridge between the data pipeline and a future sitewide HUD replacement.</p>
        <p>No public English source translation is imported here. Definition cards are source-layered lexical claims; phrase cards are Hebrew usage evidence only.</p>
      </div>
      <div class="layout">
        <nav class="token-list" data-token-list aria-label="HUD route samples"></nav>
        <section class="hud-panel" data-hud-panel aria-live="polite"></section>
      </div>
    </section>
  </main>
  <script type="application/json" id="hud-route-data">${payload}</script>
  <script src="app.js"></script>
</body>
</html>
`;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(usage());
  process.exit(0);
}

const fixtures = readJson(args.fixtures);
const storeSample = readJson(args.storeSample);
const contract = readJson(args.contract);
const html = renderPage({ fixtures, storeSample, contract });
const outPath = path.join(root, args.out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Wrote ${args.out}`);
