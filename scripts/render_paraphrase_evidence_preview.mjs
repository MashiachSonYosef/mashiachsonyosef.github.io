import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || '.local-cache/paraphrase-evidence/prototype-reshit.json';
const outputPath = process.argv[3] || artifactPath.replace(/\.json$/i, '-preview.html');
const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), 'utf8'));

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
const clusters = Array.isArray(artifact.clusters) ? artifact.clusters : [];
const jeremiahRows = rows.filter((row) => row.source_ref === 'Jeremiah 2:3');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Paraphrase Evidence Prototype</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #171713;
      --muted: #66675f;
      --line: #d9d5c8;
      --panel: #fffdf6;
      --field: #f4f7f2;
      --accent: #315c4b;
      --accent-2: #9b3d2f;
      --gold: #b8860b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f8f6ed;
      color: var(--ink);
      font: 15px/1.45 Georgia, "Times New Roman", serif;
    }
    header {
      padding: 20px 24px 14px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(90deg, #fffdf6, #edf4ec);
    }
    h1 {
      margin: 0 0 6px;
      font-size: clamp(24px, 4vw, 42px);
      font-weight: 700;
      letter-spacing: 0;
    }
    .subtitle {
      max-width: 980px;
      color: var(--muted);
    }
    main { padding: 18px 24px 28px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-bottom: 18px;
    }
    .stat, .cluster, .row {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--panel);
    }
    .stat {
      padding: 12px;
    }
    .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .value {
      margin-top: 3px;
      font-size: 24px;
      font-weight: 700;
    }
    section { margin-top: 22px; }
    h2 {
      margin: 0 0 10px;
      font-size: 18px;
    }
    .rail {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(280px, 420px);
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
    .cluster {
      padding: 12px;
      min-height: 142px;
    }
    .cluster h3 {
      margin: 0 0 8px;
      font-size: 16px;
      color: var(--accent);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 3px 8px;
      background: var(--field);
      font-size: 13px;
    }
    .row-list {
      display: grid;
      gap: 10px;
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 130px;
      gap: 12px;
      padding: 12px;
    }
    .ref {
      color: var(--accent-2);
      font-weight: 700;
    }
    .phrase {
      margin: 7px 0;
      direction: rtl;
      font-size: 19px;
      line-height: 1.7;
    }
    .focus {
      outline: 2px solid var(--gold);
      background: #fff3bf;
      padding: 0 2px;
      border-radius: 3px;
    }
    .meta {
      color: var(--muted);
      font-size: 13px;
    }
    .score {
      text-align: right;
      font-family: Cambria, Georgia, serif;
    }
    .score strong {
      display: block;
      font-size: 26px;
      color: var(--accent);
    }
    code {
      font-family: Consolas, monospace;
      font-size: 12px;
      background: #ece8da;
      padding: 2px 4px;
      border-radius: 3px;
    }
    @media (max-width: 680px) {
      main, header { padding-left: 14px; padding-right: 14px; }
      .row { grid-template-columns: 1fr; }
      .score { text-align: left; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Paraphrase Evidence Prototype</h1>
    <div class="subtitle">
      Focus <code>${escapeHtml(artifact.focus?.token_normalized || '')}</code>.
      Generated ${escapeHtml(artifact.generated_at || '')}.
      Artifact <code>${escapeHtml(artifactPath)}</code>.
    </div>
  </header>
  <main>
    <div class="stats">
      ${stat('Occurrences', artifact.counts?.occurrence_markers)}
      ${stat('Candidates', artifact.counts?.candidate_rows)}
      ${stat('Visible Rows', artifact.counts?.evidence_rows)}
      ${stat('Clusters', artifact.counts?.clusters)}
      ${stat('Blocked Units', artifact.counts?.blocked_source_units)}
    </div>
    <section>
      <h2>Clusters</h2>
      <div class="rail">
        ${clusters.map(renderCluster).join('\n')}
      </div>
    </section>
    <section>
      <h2>Jeremiah 2:3</h2>
      <div class="row-list">
        ${(jeremiahRows.length ? jeremiahRows : rows.filter((row) => row.work_id === 'jeremiah').slice(0, 3)).map(renderRow).join('\n')}
      </div>
    </section>
    <section>
      <h2>Top Visible Rows</h2>
      <div class="row-list">
        ${rows.slice(0, 40).map(renderRow).join('\n')}
      </div>
    </section>
  </main>
</body>
</html>
`;

fs.writeFileSync(path.join(root, outputPath), html, 'utf8');
console.log(`Wrote ${outputPath}`);

function stat(label, value) {
  return `<div class="stat"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(String(value ?? 0))}</div></div>`;
}

function renderCluster(cluster) {
  const cues = (cluster.matched_cues || []).slice(0, 8).map((cue) => (
    `<span class="chip" dir="rtl">${escapeHtml(cue.cue)}:${escapeHtml(String(cue.count))}</span>`
  )).join('');
  return `<article class="cluster">
    <h3>${escapeHtml(cluster.cluster_id)}</h3>
    <div class="meta">${escapeHtml(cluster.occurrence_count)} occurrence(s), best raw ${escapeHtml(cluster.best_raw_score)}</div>
    <div class="chips">${cues || '<span class="chip">no cues</span>'}</div>
  </article>`;
}

function renderRow(row) {
  const phrase = (row.phrase_tokens || []).map((token) => {
    const text = escapeHtml(token.surface || '');
    return token.role === 'focus-token' ? `<span class="focus">${text}</span>` : text;
  }).join(' ');
  const cues = (row.matched_frame_cues || []).map((cue) => cue.cue).join(', ');
  return `<article class="row">
    <div>
      <div class="ref">${escapeHtml(row.source_ref)} | ${escapeHtml(row.work_title)}</div>
      <div class="phrase">${phrase}</div>
      <div class="meta">${escapeHtml(row.cluster_id)}${cues ? ` | cues: ${escapeHtml(cues)}` : ''}</div>
      <div class="meta">${escapeHtml(row.license)} | ${escapeHtml(row.version_title)}</div>
    </div>
    <div class="score">
      <span class="label">raw / adjusted</span>
      <strong>${escapeHtml(row.raw_score)} / ${escapeHtml(row.adjusted_score)}</strong>
      <span class="meta">${escapeHtml(row.route_type)}</span>
    </div>
  </article>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
