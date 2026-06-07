import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "data/site/hebrew-workbench-catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const featuredCorpus = (catalog.corpora || []).find((corpus) => corpus.id === "featured") || null;
const corpusBuckets = (catalog.corpora || []).filter((corpus) => corpus.id !== "featured");

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const escapeAttr = escapeHtml;

function workLinks(works = []) {
  return works.map((work) => `
            <a class="work-link" href="${escapeAttr(work.href)}">${escapeHtml(work.label)}</a>`).join("");
}

function corpusCard(corpus) {
  const works = Array.isArray(corpus.works) ? corpus.works : [];
  if (works.length) {
    return `
        <details class="corpus-card" data-live="true" id="${escapeAttr(corpus.id)}"${corpus.open ? " open" : ""}>
          <summary>${escapeHtml(corpus.label)}</summary>
          <div class="work-list">
${workLinks(works)}
          </div>
        </details>`;
  }
  return `
        <div class="corpus-card" id="${escapeAttr(corpus.id)}">
          <span>${escapeHtml(corpus.label)}</span>
        </div>`;
}

function downloadLink(download) {
  return `
        <a class="download-link" href="${escapeAttr(download.href)}" download>${escapeHtml(download.label)}</a>`;
}

function downloadsSection(downloads = []) {
  if (!downloads.length) return "";
  return `
    <footer class="downloads" aria-labelledby="downloads-title">
      <h2 id="downloads-title">${escapeHtml(catalog.downloads_heading)}</h2>
      <div class="download-list">
${downloads.map(downloadLink).join("\n")}
      </div>
    </footer>`;
}

function featuredSection(corpus) {
  const works = Array.isArray(corpus?.works) ? corpus.works : [];
  if (!works.length) return "";
  return `
    <section aria-labelledby="featured-title">
      <h2 id="featured-title">${escapeHtml(corpus.label || "Featured")}</h2>
      <div class="work-list featured-list">
${workLinks(works)}
      </div>
    </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(catalog.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d0d0b;
      --text: #f4efe5;
      --muted: #bdb5a7;
      --line: rgba(214, 190, 138, 0.32);
      --accent: #d8c38d;
      --panel: #141411;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Georgia, "Times New Roman", serif;
    }

    main {
      width: min(920px, calc(100% - 32px));
      min-height: 100vh;
      margin: 0 auto;
      padding: 44px 0;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 34px;
    }

    h1,
    h2 {
      margin: 0;
      font-weight: 400;
      letter-spacing: 0;
    }

    h1 {
      font-size: 3.15rem;
      line-height: 1;
    }

    h2 {
      color: var(--text);
      font-size: 1.18rem;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .corpus-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-top: 16px;
    }

    .corpus-card,
    .download-link {
      border: 1px solid var(--line);
      background: var(--panel);
      line-height: 1.25;
    }

    .corpus-card {
      min-height: 64px;
    }

    .corpus-card[data-live="true"] {
      border-color: var(--accent);
    }

    .corpus-card > span,
    .corpus-card > summary {
      min-height: 64px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .corpus-card > summary {
      cursor: pointer;
      color: var(--accent);
      list-style: none;
    }

    .corpus-card > summary::-webkit-details-marker {
      display: none;
    }

    .corpus-card > summary::after {
      content: "+";
      margin-left: auto;
      color: var(--muted);
    }

    .corpus-card[open] > summary::after {
      content: "-";
    }

    .corpus-card > summary:hover,
    .corpus-card > summary:focus-visible,
    .work-link:hover,
    .work-link:focus-visible,
    .download-link:hover,
    .download-link:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .work-list {
      display: grid;
      gap: 6px;
      padding: 8px;
      border-top: 1px solid var(--line);
    }

    .work-link {
      display: block;
      padding: 9px 10px;
      border: 1px solid rgba(214, 190, 138, 0.22);
      color: var(--text);
      background: rgba(255, 255, 255, 0.025);
    }

    .downloads {
      display: grid;
      gap: 10px;
    }

    .download-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .download-link {
      min-height: 44px;
      color: var(--muted);
      display: flex;
      align-items: center;
      padding: 14px;
    }

    @media (max-width: 720px) {
      main { width: min(100% - 22px, 920px); }
      h1 { font-size: 2.35rem; }
      .corpus-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(catalog.title)}</h1>
    </header>

    <section aria-labelledby="corpus-title">
      <h2 id="corpus-title">${escapeHtml(catalog.corpus_heading)}</h2>
      <div class="corpus-grid">
${corpusBuckets.map(corpusCard).join("\n")}
      </div>
    </section>

${featuredSection(featuredCorpus)}
${downloadsSection(catalog.downloads || [])}
  </main>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html, "utf8");
console.log(JSON.stringify({
  generated: "index.html",
  corpora: corpusBuckets.length,
  featured_works: (featuredCorpus?.works || []).length,
}, null, 2));
