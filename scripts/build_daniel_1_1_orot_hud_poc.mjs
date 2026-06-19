import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const writeText = (relativePath, text) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, "utf8");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const extractBetween = (text, startPattern, endPattern, label) => {
  const start = text.indexOf(startPattern);
  if (start === -1) throw new Error(`missing ${label} start`);
  const end = text.indexOf(endPattern, start);
  if (end === -1) throw new Error(`missing ${label} end`);
  return text.slice(start, end + endPattern.length);
};

const work = {
  sourcePath: "data/sources/daniel.json",
  occurrencePath: "data/lexical/occurrences/daniel.json",
  routeManifestPath: "data/definitions/hud-route-lookup-daniel/manifest.json",
  shellPath: "tanakh/daniel/index.html",
  outputPath: "tanakh/daniel/poc-1-1.html",
  reportPath: "reports/daniel-1-1-orot-hud-poc-report.json",
  unitId: "daniel-1-1",
};

const source = readJson(work.sourcePath);
const occurrences = readJson(work.occurrencePath);
const routeManifest = readJson(work.routeManifestPath);
const shellHtml = read(work.shellPath);
const unit = source.units.find((entry) => entry.unit_id === work.unitId);
const occurrenceUnit = occurrences.units[work.unitId];

if (!unit) throw new Error(`missing source unit ${work.unitId}`);
if (!occurrenceUnit) throw new Error(`missing occurrence unit ${work.unitId}`);

const tokenIds = occurrenceUnit.paragraphs.flatMap((paragraph) => paragraph.token_index_ids || []);
if (!tokenIds.length) throw new Error(`missing token ids for ${work.unitId}`);

const shellStyle = extractBetween(shellHtml, "<style>", "</style>", "Daniel shell style");
const hudShell = extractBetween(
  shellHtml,
  '<section class="lexical-hud"',
  "</section>",
  "Route HUD shell",
);

const lexicalConfig = {
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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daniel 1:1 A10/Orot HUD POC | Hebrew Workbench</title>
  <link rel="stylesheet" href="../../assets/css/reader-workbench.css">
  ${shellStyle}
</head>
<body>
  <div class="reader-shell" id="work-top">
    <header class="topbar">
      <a href="../../">Hebrew Source Workbench</a>
      <span>Daniel 1:1 disposable POC</span>
    </header>

    <section class="hero">
      <p class="kicker">A10/Orot HUD contract proof</p>
      <h1>Daniel 1:1</h1>
      <p>Uses the shared Route HUD runtime and Daniel occurrence roster. No definitions are promoted in the pre-HUD layer unless the current route/default-selection layer marks a selectable candidate.</p>
    </section>

    <main class="layout">
      <article class="work" aria-label="Daniel 1:1">
        <h2>Daniel 1</h2>
        <section class="unit" id="${escapeHtml(unit.unit_id)}" data-unit data-lexical-unit data-unit-id="${escapeHtml(unit.unit_id)}" data-source-ref="${escapeHtml(unit.source_ref)}">
          <div class="unit-head">
            <div><h4>${escapeHtml(unit.source_ref)}</h4></div>
            <a class="anchor" href="#${escapeHtml(unit.unit_id)}" aria-label="Copy link to ${escapeHtml(unit.source_ref)}">#</a>
          </div>
          <div class="unit-grid">
            <div>
              <p class="hebrew hebrew-source lexical-inline" lang="he" dir="rtl" data-lexical-paragraph="0">${escapeHtml(unit.hebrew.join(" "))}</p>
            </div>
          </div>
          <div class="lexical-slot" data-lexical-slot></div>
          <nav class="unit-nav" aria-label="Unit navigation">
            <a href="#work-top">Back to top</a>
          </nav>
        </section>
      </article>
    </main>
  </div>

  ${hudShell}
  <script type="application/json" data-lexical-occurrences data-src="../../${work.occurrencePath}">{}</script>
  <script type="application/json" data-lexical-config>${JSON.stringify(lexicalConfig)}</script>
  <script src="../../assets/js/reader-workbench.js?v=visible-na-3916cf24" defer></script>
</body>
</html>
`;

const report = {
  schema_version: 1,
  artifact_type: "daniel_1_1_orot_hud_poc",
  generated_at: new Date().toISOString(),
  target: work.unitId,
  output_path: work.outputPath,
  source_path: work.sourcePath,
  occurrence_path: work.occurrencePath,
  route_manifest_path: work.routeManifestPath,
  source_ref: unit.source_ref,
  source_license: unit.license,
  source_version_title: unit.version_title,
  source_url: unit.source_url,
  token_rows: tokenIds.length,
  occurrence_token_ids: tokenIds,
  route_lookup_card_count: routeManifest.counts?.card_count ?? null,
  selected_prehud_rows: 0,
  tbd_fallback_rows: tokenIds.length,
  exact_visual_changes: [
    "Daniel 1:1 pre-HUD uses shared reader_layout_mode=prehud_rows for one Hebrew token row per occurrence token.",
    "Daniel 1:1 pre-HUD uses shared reader-workbench wrapping/no-cutoff CSS for full selected gloss text or quiet N/A.",
  ],
  reused_a10_orot_contract: {
    css: "assets/css/reader-workbench.css",
    runtime: "assets/js/reader-workbench.js",
    route_hud_shell: "data-lexical-hud / data-route-hud-panel",
    click_target: "data-lexical-token generated by makePrehudRow",
    fail_closed_flags: {
      hud_validated_only: lexicalConfig.hud_validated_only,
      hud_hide_unvalidated_routes: lexicalConfig.hud_hide_unvalidated_routes,
      hud_allow_lemma_only: lexicalConfig.hud_allow_lemma_only,
    },
  },
  boundary: {
    public_release: false,
    definition_acceptance: false,
    accepted_gloss_text: false,
    source_license_acceptance: false,
    orot_mutation: false,
  },
};

writeText(work.outputPath, html);
writeText(work.reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Daniel 1:1 A10/Orot HUD POC written: ${work.outputPath}`);
console.log(`POC report written: ${work.reportPath}`);
console.log(`Token rows: ${tokenIds.length}; route cards: ${report.route_lookup_card_count}`);
