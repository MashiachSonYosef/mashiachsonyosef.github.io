import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const issues = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const requireTrue = (condition, issue) => {
  if (!condition) issues.push(issue);
};

const work = {
  pagePath: "tanakh/daniel/poc-1-1.html",
  reportPath: "reports/daniel-1-1-orot-hud-poc-report.json",
  sourcePath: "data/sources/daniel.json",
  occurrencePath: "data/lexical/occurrences/daniel.json",
  routeManifestPath: "data/definitions/hud-route-lookup-daniel/manifest.json",
  cssPath: "assets/css/reader-workbench.css",
  runtimePath: "assets/js/reader-workbench.js",
  unitId: "daniel-1-1",
};

for (const relativePath of Object.values(work).filter((value) => String(value).includes("."))) {
  requireTrue(exists(relativePath), `missing required path: ${relativePath}`);
}

if (!issues.length) {
  const page = read(work.pagePath);
  const report = readJson(work.reportPath);
  const source = readJson(work.sourcePath);
  const occurrences = readJson(work.occurrencePath);
  const routeManifest = readJson(work.routeManifestPath);
  const css = read(work.cssPath);
  const runtime = read(work.runtimePath);
  const unit = source.units.find((entry) => entry.unit_id === work.unitId);
  const occurrenceUnit = occurrences.units[work.unitId];
  const tokenIds = occurrenceUnit?.paragraphs?.flatMap((paragraph) => paragraph.token_index_ids || []) || [];

  requireTrue(Boolean(unit), `missing source unit ${work.unitId}`);
  requireTrue(Boolean(occurrenceUnit), `missing occurrence unit ${work.unitId}`);
  requireTrue(tokenIds.length === 12, `expected 12 Daniel 1:1 token rows, found ${tokenIds.length}`);
  requireTrue(report.token_rows === tokenIds.length, "report token_rows does not match occurrence roster");
  requireTrue(report.tbd_fallback_rows === tokenIds.length, "report tbd fallback rows does not match occurrence roster");
  requireTrue(report.selected_prehud_rows === 0, "report must keep selected pre-HUD rows at zero");
  requireTrue(routeManifest.counts?.card_count === 0, "Daniel POC must fail closed with zero scoped route cards");

  requireTrue(page.includes('<link rel="stylesheet" href="../../assets/css/reader-workbench.css">'), "page must reuse shared reader-workbench CSS");
  requireTrue(page.includes('<script src="../../assets/js/reader-workbench.js?v=visible-na-3916cf24" defer></script>'), "page must reuse shared reader-workbench runtime");
  requireTrue(page.includes('data-unit-id="daniel-1-1"'), "page must target actual Daniel 1:1 unit");
  requireTrue(page.includes('data-lexical-slot'), "page must expose lexical slot for runtime-generated pre-HUD rows");
  requireTrue(page.includes('data-lexical-hud'), "page must include canonical lexical HUD shell");
  requireTrue(page.includes('data-route-hud-panel'), "page must include canonical Route HUD panel");
  requireTrue(page.includes('data-lexical-occurrences data-src="../../data/lexical/occurrences/daniel.json"'), "page must load actual Daniel occurrence roster");
  requireTrue(page.includes('"reader_layout_mode":"prehud_rows"'), "page must enable one-token-per-row pre-HUD layout");
  requireTrue(page.includes('"hud_validated_only":true'), "page must keep validated-only HUD gate");
  requireTrue(page.includes('"hud_hide_unvalidated_routes":true'), "page must hide unvalidated routes");
  requireTrue(page.includes('"hud_allow_lemma_only":false'), "page must not allow lemma-only pre-HUD promotion");

  requireTrue(runtime.includes("function makePrehudRow"), "runtime missing makePrehudRow contract");
  requireTrue(runtime.includes("dataset.glossPlaceholder"), "runtime missing quiet placeholder contract");
  requireTrue(runtime.includes("config?.reader_layout_mode === 'prehud_rows'"), "runtime missing prehud_rows gate");
  requireTrue(runtime.includes("document.querySelectorAll('[data-lexical-token]')") || runtime.includes("closest('[data-lexical-token]')"), "runtime missing lexical token click binding");

  requireTrue(css.includes(".reader-token-wrap.prehud-row"), "CSS missing one-token-per-row pre-HUD row rule");
  requireTrue(css.includes("grid-template-columns: minmax(4.8rem, 8rem) minmax(0, 1fr) minmax(4rem, auto);"), "CSS missing Hebrew-left/gloss/match pre-HUD columns");
  requireTrue(css.includes(".prehud-gloss .reader-gloss-line"), "CSS missing pre-HUD gloss wrapping selector");
  requireTrue(css.includes("max-width: none;"), "CSS missing no-cutoff max-width rule for selected/full gloss text");
  requireTrue(css.includes("overflow-wrap: break-word;"), "CSS missing wrapped full-text overflow rule");
  requireTrue(css.includes(".prehud-source-link"), "CSS missing pre-HUD source affordance");

  requireTrue(report.boundary?.orot_mutation === false, "report must state no Orot mutation");
  requireTrue(report.boundary?.definition_acceptance === false, "report must state no Definition acceptance");
  requireTrue(report.boundary?.accepted_gloss_text === false, "report must state no accepted gloss text");
}

if (issues.length) {
  console.error(JSON.stringify({ ok: false, issues }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      page: work.pagePath,
      report: work.reportPath,
      target: work.unitId,
      token_rows: 12,
      selected_prehud_rows: 0,
      tbd_fallback_rows: 12,
      render_runtime: "shared_reader_workbench",
    },
    null,
    2,
  ),
);
