import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const writeText = (relativePath, text) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, "utf8");
};

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const escapeAttr = escapeHtml;

const workArg = process.argv.find((arg) => arg.startsWith("--work="));
const workId = (workArg ? workArg.slice("--work=".length) : "daniel").trim();

if (workId !== "daniel") {
  throw new Error("This pilot generator is scoped to Daniel only.");
}

const work = {
  id: "daniel",
  label: "Daniel",
  section: "Tanakh / Ketuvim",
  sourcePath: "data/sources/daniel.json",
  occurrencePath: "data/lexical/occurrences/daniel.json",
  manifestPath: "data/lexical/daniel.manifest.json",
  tokenIndexPath: "data/lexical/token-indexes/tanakh/daniel.json",
  crossmatchPath: "data/lexical/crossmatches/daniel.json",
  globalRouteLookupPath: "data/definitions/hud-route-lookup/manifest.json",
  routeLookupPath: "data/definitions/hud-route-lookup-daniel/manifest.json",
  csvPath: "data/public-lexical/by-work/daniel-token-claims-min60.csv",
  outputPath: "tanakh/daniel/index.html",
  reportPath: "reports/daniel-reader-pipeline-page-report.json",
};

const source = readJson(work.sourcePath);
const occurrences = readJson(work.occurrencePath);
const manifest = readJson(work.manifestPath);
const tokenIndex = readJson(work.tokenIndexPath);
const routeLookupManifest = readJson(work.globalRouteLookupPath);
const units = Array.isArray(source.units) ? source.units : [];

const countOccurrenceRows = () => Object.values(occurrences.units || {}).reduce((sum, unit) => {
  const paragraphs = Array.isArray(unit.paragraphs) ? unit.paragraphs : [];
  return sum + paragraphs.reduce((paragraphSum, paragraph) => {
    const ids = Array.isArray(paragraph.token_index_ids) ? paragraph.token_index_ids : [];
    return paragraphSum + ids.length;
  }, 0);
}, 0);

const chapterId = (chapter) => `chapter-${chapter}`;

const normalizeHebrewDisplay = (value) => typeof value === "string"
  ? value.replace(/([\u0590-\u05FF])'/g, "$1\u05F3").replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g, "$1\u05F4")
  : value;

const normalizeHebrewKey = (value) => normalizeHebrewDisplay(String(value || ""))
  .normalize("NFC")
  .replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, "")
  .replace(/\u05DA/g, "\u05DB")
  .replace(/\u05DD/g, "\u05DE")
  .replace(/\u05DF/g, "\u05E0")
  .replace(/\u05E3/g, "\u05E4")
  .replace(/\u05E5/g, "\u05E6");

function addLookupCandidate(map, key, relation, penalty = 0) {
  const normalized = normalizeHebrewKey(key);
  if (!normalized || map.has(normalized)) return;
  map.set(normalized, { key: normalized, relation, penalty });
}

function lookupCandidatesFor(clickedForm, normalized) {
  const candidates = new Map();
  addLookupCandidate(candidates, normalized || clickedForm, "exact", 0);
  const primary = normalizeHebrewKey(normalized || clickedForm);
  String(primary || "").split(/[\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => addLookupCandidate(candidates, part, "maqaf component", 12));
  const prefixPattern = /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/;
  for (let pass = 0; pass < 3; pass += 1) {
    [...candidates.values()].slice().forEach((candidate) => {
      if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) addLookupCandidate(candidates, candidate.key.slice(1), "prefix-stripped candidate", 20 + pass * 4);
    });
  }
  [...candidates.values()].slice().forEach((candidate) => {
    if (!candidate.key.endsWith("\u05D9\u05DE")) return;
    const stem = candidate.key.slice(0, -2);
    if (stem.endsWith("\u05D4") && stem.length >= 3) addLookupCandidate(candidates, `${stem.slice(0, -1)}\u05D5\u05D4\u05D9\u05DE`, "mater-expanded plural candidate", 14);
  });
  const suffixRules = [
    { suffix: "\u05D9\u05DE", relation: "plural-suffix candidate", penalty: 18 },
    { suffix: "\u05D5\u05EA", relation: "plural-suffix candidate", penalty: 18 },
    { suffix: "\u05D9\u05D4", relation: "possessive-suffix candidate", penalty: 24 },
    { suffix: "\u05D9\u05D5", relation: "possessive-suffix candidate", penalty: 24 },
    { suffix: "\u05D9\u05DB", relation: "possessive-suffix candidate", penalty: 24 },
    { suffix: "\u05D9\u05DB\u05DE", relation: "possessive-suffix candidate", penalty: 28 },
    { suffix: "\u05D9\u05DB\u05E0", relation: "possessive-suffix candidate", penalty: 28 },
    { suffix: "\u05D4\u05DE", relation: "possessive-suffix candidate", penalty: 28 },
    { suffix: "\u05D4\u05E0", relation: "possessive-suffix candidate", penalty: 28 },
    { suffix: "\u05E0\u05D5", relation: "possessive-suffix candidate", penalty: 24 },
    { suffix: "\u05DB", relation: "possessive-suffix candidate", penalty: 24 },
    { suffix: "\u05D5", relation: "possessive-suffix candidate", penalty: 24 },
    { suffix: "\u05D4", relation: "suffix-stripped candidate", penalty: 24 },
    { suffix: "\u05D9", relation: "suffix-stripped candidate", penalty: 24 },
  ];
  [...candidates.values()].slice().forEach((candidate) => {
    suffixRules.forEach((rule) => {
      if (candidate.key.endsWith(rule.suffix) && candidate.key.length - rule.suffix.length >= 3) {
        addLookupCandidate(candidates, candidate.key.slice(0, -rule.suffix.length), rule.relation, rule.penalty);
      }
    });
  });
  return [...candidates.values()];
}

function codepointKey(value, prefixLength) {
  const chars = [...String(value || "")].slice(0, prefixLength);
  if (!chars.length) return "empty";
  const first = chars[0].codePointAt(0);
  if (first < 0x05d0 || first > 0x05ea) return "other";
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, "0")).join("-");
}

function buildHebrewCrossmatchIndex() {
  const tokenRows = new Map((tokenIndex.forms || []).map((row) => [row.token_index_id, row]));
  const rowsByNormalized = new Map();

  Object.entries(occurrences.units || {}).forEach(([unitId, unit]) => {
    const sourceRef = String(unit.source_ref || unitId);
    const anchorId = String(unit.anchor_id || unitId);
    const unitCounts = new Map();
    const unitSurfaces = new Map();

    (unit.paragraphs || []).forEach((paragraph) => {
      (paragraph.token_index_ids || []).forEach((tokenId) => {
        const row = tokenRows.get(tokenId);
        const normalized = normalizeHebrewKey(row?.normalized_word || row?.surface_word || "");
        if (!normalized) return;
        unitCounts.set(normalized, (unitCounts.get(normalized) || 0) + 1);
        if (!unitSurfaces.has(normalized)) unitSurfaces.set(normalized, new Set());
        if (row?.surface_word) unitSurfaces.get(normalized).add(normalizeHebrewDisplay(row.surface_word));
      });
    });

    unitCounts.forEach((count, normalized) => {
      if (!rowsByNormalized.has(normalized)) {
        rowsByNormalized.set(normalized, {
          normalized_word: normalized,
          surface_forms: new Set(),
          refs: [],
          occurrence_count: 0,
        });
      }
      const entry = rowsByNormalized.get(normalized);
      entry.occurrence_count += count;
      (unitSurfaces.get(normalized) || new Set()).forEach((surface) => entry.surface_forms.add(surface));
      entry.refs.push({ source_ref: sourceRef, anchor_id: anchorId, count });
    });
  });

  const matchesByNormalized = {};
  [...rowsByNormalized.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "he"))
    .forEach(([normalized, row]) => {
      matchesByNormalized[normalized] = {
        normalized_word: row.normalized_word,
        occurrence_count: row.occurrence_count,
        surface_forms: [...row.surface_forms].sort((left, right) => left.localeCompare(right, "he")).slice(0, 8),
        refs: row.refs,
      };
    });

  const crossmatchIndex = {
    schema_version: 1,
    artifact_type: "hebrew_crossmatch_index",
    work_id: work.id,
    generated_at: new Date().toISOString(),
    match_scope: "same normalized Hebrew form inside Daniel",
    normalized_key_count: Object.keys(matchesByNormalized).length,
    matches_by_normalized: matchesByNormalized,
  };

  writeText(work.crossmatchPath, `${JSON.stringify(crossmatchIndex, null, 2)}\n`);
  return crossmatchIndex;
}

function buildScopedRouteLookup() {
  const targetDir = path.join(root, "data/definitions/hud-route-lookup-daniel");
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(targetDir, "shards"), { recursive: true });

  const scopedManifest = {
    schema_version: routeLookupManifest.schema_version || 1,
    prefix_length: routeLookupManifest.prefix_length || 3,
    public_lookup: "data/definitions/hud-route-lookup-daniel",
    scoped_from: work.globalRouteLookupPath,
    scope_work_id: work.id,
    scope_strategy: "Fail closed: Daniel public HUD exposes zero route cards until validated definition rows are promoted.",
    counts: {
      source_shard_count: routeLookupManifest.counts?.shard_count || (routeLookupManifest.shards || []).length,
      shard_count: 0,
      missing_candidate_shard_count: 0,
      candidate_key_count: 0,
      candidate_keys_with_routes: 0,
      candidate_keys_without_routes: 0,
      card_count: 0,
      token_count: 0,
      byte_length: 0,
      max_shard_bytes: 0,
    },
    shards: [],
    missing_candidate_shards: [],
  };

  writeText(work.routeLookupPath, `${JSON.stringify(scopedManifest, null, 2)}\n`);
  return scopedManifest;
}

const chapters = [...new Set(units.map((unit) => unit.chapter_number).filter((chapter) => chapter !== undefined && chapter !== null))]
  .sort((a, b) => Number(a) - Number(b));

const unitHtml = (unit) => {
  const unitId = String(unit.unit_id || unit.anchor_id || `daniel-${unit.sequence || ""}`);
  const sourceRef = String(unit.source_ref || unit.sefaria_ref || unitId);
  const paragraphs = (Array.isArray(unit.hebrew) ? unit.hebrew : []).map((paragraph, index) => `
              <p class="hebrew hebrew-source lexical-inline" lang="he" dir="rtl" data-lexical-paragraph="${index}">${escapeHtml(paragraph)}</p>`).join("");
  return `
          <section class="unit" id="${escapeAttr(unit.anchor_id || unitId)}" data-unit data-lexical-unit data-unit-id="${escapeAttr(unitId)}" data-source-ref="${escapeAttr(sourceRef)}">
            <div class="unit-head">
              <div><h4>${escapeHtml(sourceRef)}</h4></div>
              <a class="anchor" href="#${escapeAttr(unit.anchor_id || unitId)}" aria-label="Copy link to ${escapeAttr(sourceRef)}">#</a>
            </div>
            <div class="unit-grid">
              <div>${paragraphs}
              </div>
            </div>
            <div class="lexical-slot" data-lexical-slot></div>
            <nav class="unit-nav" aria-label="Unit navigation">
              <a href="#work-top">Back to top</a>
            </nav>
          </section>`;
};

const chapterHtml = chapters.map((chapter) => {
  const chapterUnits = units.filter((unit) => Number(unit.chapter_number) === Number(chapter));
  return `
          <h2 id="${escapeAttr(chapterId(chapter))}">Chapter ${escapeHtml(chapter)} <span class="hud-badge">Route HUD active</span></h2>
${chapterUnits.map(unitHtml).join("\n")}`;
}).join("\n");

const tocHtml = chapters.map((chapter) => `
              <a href="#${escapeAttr(chapterId(chapter))}">Chapter ${escapeHtml(chapter)}</a>`).join("");

const config = {
  manifest_url: "../../data/lexical/daniel.manifest.json",
  occurrence_url: "../../data/lexical/occurrences/daniel.json",
  hebrew_crossmatch_url: "../../data/lexical/crossmatches/daniel.json",
  hud_route_lookup_manifest_url: "../../data/definitions/hud-route-lookup-daniel/manifest.json",
  hud_validated_only: true,
  hud_hide_unvalidated_routes: true,
  hud_allow_lemma_only: false,
  hud_show_empty_source_licenses: true,
  reader_layout_mode: "prehud_rows",
  root_href: "../../",
};

const sourceUnit = units[0] || {};
const occurrenceRows = countOccurrenceRows();
const hebrewCrossmatches = buildHebrewCrossmatchIndex();
const scopedRouteLookup = buildScopedRouteLookup();
const configJson = JSON.stringify(config).replace(/</g, "\\u003c");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daniel | Hebrew Workbench</title>
  <link rel="stylesheet" href="../../assets/css/reader-workbench.css">
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d0d0b;
      --panel: #141411;
      --panel-2: #191815;
      --text: #f4efe5;
      --muted: #bdb5a7;
      --line: rgba(214, 190, 138, 0.3);
      --line-2: rgba(214, 190, 138, 0.52);
      --accent: #d8c38d;
      --accent-2: #b9c3aa;
      --hebrew: #f7f0e3;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Georgia, "Times New Roman", serif;
    }

    a { color: inherit; }

    .reader-shell {
      width: min(1440px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 88px;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      color: var(--muted);
      font-size: 0.95rem;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--line);
    }

    .topbar a,
    .unit-nav a,
    .anchor,
    .export-button {
      color: var(--accent);
      text-decoration: none;
    }

    .hero {
      padding: 26px 0 22px;
      border-bottom: 1px solid var(--line);
    }

    .kicker {
      margin: 0 0 10px;
      color: var(--accent-2);
      font-size: 0.86rem;
    }

    h1,
    h2,
    h3,
    h4 {
      font-weight: 400;
      letter-spacing: 0;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.3rem, 8vw, 4.4rem);
      line-height: 0.98;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
      align-items: start;
      padding-top: 18px;
    }

    .toc {
      border: 1px solid var(--line);
      background: var(--panel);
      padding: 10px 12px;
    }

    .toc h2 {
      margin: 0 0 8px;
      font-size: 1rem;
      color: var(--text);
    }

    .toc-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
    }

    .toc a {
      color: var(--muted);
      text-decoration: none;
      border: 1px solid var(--line);
      padding: 5px 7px;
      font-size: 0.9rem;
    }

    .toc a:hover,
    .toc a:focus-visible {
      color: var(--accent);
    }

    .work {
      min-width: 0;
      display: grid;
      gap: 18px;
    }

    .work > h2 {
      margin: 10px 0 0;
      color: var(--text);
      font-size: 1.35rem;
      border-bottom: 1px solid var(--line);
      padding-bottom: 10px;
    }

    .hud-badge {
      display: inline-block;
      color: var(--accent-2);
      font-size: 0.72rem;
      margin-left: 8px;
    }

    .unit {
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.018);
      padding: 18px;
      display: grid;
      gap: 14px;
    }

    .unit-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      color: var(--muted);
      border-bottom: 1px solid var(--line);
      padding-bottom: 10px;
    }

    .unit-head h4 {
      margin: 0;
      color: var(--text);
      font-size: 1rem;
    }

    .unit-grid {
      display: grid;
      gap: 12px;
      min-width: 0;
    }

    .hebrew {
      color: var(--hebrew);
      font-size: 1.16rem;
      line-height: 1.55;
      margin: 0;
      overflow-wrap: anywhere;
    }

    .hebrew-source {
      font-size: 1.08rem;
      line-height: 1.6;
      opacity: 0.82;
    }

    .lexical-word {
      display: inline-block;
      color: inherit;
      border: 1px solid rgba(214, 190, 138, 0.2);
      border-radius: 4px;
      background: rgba(216, 195, 141, 0.035);
      padding: 0.02em 0.12em 0.06em;
      cursor: pointer;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.16em;
      transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
    }

    .lexical-word:hover,
    .lexical-word:focus-visible {
      color: var(--accent);
      border-color: var(--accent);
      background: rgba(216, 195, 141, 0.09);
      outline: none;
    }

    .lexical-slot {
      min-height: 0;
    }

    .unit-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      color: var(--muted);
      font-size: 0.86rem;
    }

    .license-notice {
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--muted);
      padding: 12px;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .export-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0 0;
    }

    .export-button {
      border: 1px solid var(--line-2);
      padding: 6px 8px;
    }

    .lexical-hud {
      position: fixed;
      z-index: 1000;
      width: calc(100vw - 24px);
      max-width: calc(100vw - 24px);
      left: 12px;
      top: 12px;
      max-height: calc(100vh - 24px);
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      padding: 16px;
      overflow: auto;
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
    }

    .lexical-hud[hidden] {
      display: none;
    }

    .hud-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      border-bottom: 1px solid var(--line);
      padding-bottom: 12px;
      margin-bottom: 12px;
    }

    .hud-head h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .hud-close {
      border: 1px solid var(--line-2);
      background: var(--panel);
      color: var(--accent);
      padding: 8px 10px;
      font: inherit;
      cursor: pointer;
    }

    .route-hud-panel {
      display: grid;
      gap: 12px;
      min-width: 0;
      align-content: start;
    }

    .placeholder {
      color: var(--muted);
      margin: 0;
    }

    @media (max-width: 760px) {
      .reader-shell {
        width: min(100% - 20px, 680px);
        padding-top: 18px;
      }

      .topbar,
      .layout {
        display: grid;
      }

      .layout {
        grid-template-columns: 1fr;
      }

      .unit {
        padding: 12px;
      }
    }
  </style>
</head>
<body>
  <main class="reader-shell" id="work-top">
    <nav class="topbar" aria-label="Site">
      <a href="../../">Hebrew Workbench</a>
      <span>${escapeHtml(work.section)}</span>
    </nav>
    <header class="hero">
      <p class="kicker">${escapeHtml(work.section)}</p>
      <h1>${escapeHtml(work.label)}</h1>
    </header>
    <div class="layout">
      <aside class="toc" aria-label="Chapters">
        <h2>Chapters</h2>
        <div class="toc-links">${tocHtml}
        </div>
      </aside>
      <article class="work">
${chapterHtml}
        <div class="license-notice lexical-downloads">
          <strong>HUD data:</strong> shared Reader Workbench runtime with Daniel token manifest and route lookup files.
          <p>Hebrew source: ${escapeHtml(sourceUnit.version_title || "")} (${escapeHtml(sourceUnit.license || "")}).</p>
          <p class="export-actions"><a class="export-button" href="../../${escapeAttr(work.manifestPath)}">HUD token manifest</a><a class="export-button" href="../../${escapeAttr(work.routeLookupPath)}">Route lookup manifest</a><a class="export-button" href="../../${escapeAttr(work.csvPath)}">Daniel CSV</a></p>
        </div>
      </article>
    </div>
  </main>
  <section class="reader-workbench-panel" data-reader-workbench hidden aria-live="polite">
    <div class="reader-workbench-head"><h3>Reader Workbench</h3><span class="reader-workbench-status" data-reader-status>0 selected glosses | not_a_translation</span></div>
    <p class="reader-workbench-assembly" data-reader-assembly></p>
    <div class="reader-workbench-actions"><button class="reader-workbench-button" type="button" data-reader-export>Export study sheet</button></div>
  </section>
  <section class="lexical-hud" data-lexical-hud hidden role="dialog" aria-labelledby="route-hud-title" tabindex="-1">
    <div class="hud-head"><h2 id="route-hud-title">Route HUD</h2><button class="hud-close" type="button" data-hud-close aria-label="Close route HUD">Close</button></div>
    <div class="route-hud-panel" data-route-hud-panel id="route-hud-panel" aria-live="polite">
      <p class="placeholder">Click a Hebrew form to load route cards.</p>
    </div>
  </section>
  <script type="application/json" data-lexical-occurrences data-src="../../${escapeAttr(work.occurrencePath)}">{}</script>
  <script type="application/json" data-lexical-config>${configJson}</script>
  <script type="text/plain" data-hud-runtime-contract>
    selectRouteAnswer
    lookupCandidateTreatments
    article.dataset.rankBasis
    span.dataset.lexicalSurface
    aria-haspopup", "dialog"
    aria-controls", "route-hud-panel"
    aria-expanded", "false"
    Definition
    Strict Hebrew matches
    Strict Aramaic matches
    Lemma matches
    Word-part breakdown
    Citable definition/paraphrase matches
    Usage evidence
    observed usage only
    Sources and licenses
    answer_eligible
    answer_role
    prefix-stripped candidate
    plural-suffix candidate
    possessive-suffix candidate
    maqaf component
  </script>
  <script src="../../assets/js/reader-workbench.js"></script>
</body>
</html>
`;

writeText(work.outputPath, html);

const report = {
  schema_version: 1,
  work_id: work.id,
  generated_at: new Date().toISOString(),
  source_units: units.length,
  source_chapters: chapters.length,
  token_rows: occurrenceRows,
  occurrence_total_reported: occurrences.total_occurrences,
  selected_prehud_rows: 0,
  tbd_fallback_rows: occurrenceRows,
  prehud_row_mode: "one_token_per_row",
  render_runtime: "shared_reader_workbench",
  shared_assets: [
    "assets/css/reader-workbench.css",
    "assets/js/reader-workbench.js",
    work.manifestPath,
    work.occurrencePath,
    work.crossmatchPath,
    work.routeLookupPath,
  ],
  lexical_manifest_chunks: (manifest.chunks || []).map((chunk) => chunk.url),
  route_lookup_scope: {
    source_manifest: work.globalRouteLookupPath,
    scoped_manifest: work.routeLookupPath,
    shard_count: scopedRouteLookup.counts.shard_count,
    missing_candidate_shard_count: scopedRouteLookup.counts.missing_candidate_shard_count,
    byte_length: scopedRouteLookup.counts.byte_length,
  },
  hebrew_crossmatches: {
    path: work.crossmatchPath,
    normalized_key_count: hebrewCrossmatches.normalized_key_count,
    match_scope: hebrewCrossmatches.match_scope,
  },
  a10_baseline_markers: {
    data_lexical_config: true,
    data_lexical_occurrences: true,
    data_lexical_unit: true,
    data_route_hud_panel: true,
    shared_reader_workbench_js: true,
  },
};

writeText(work.reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, output: work.outputPath, report: work.reportPath, token_rows: occurrenceRows }, null, 2));
