import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const issues = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

function issue(message) {
  issues.push(message);
}

function requireMatch(name, ok) {
  if (!ok) issue(name);
}

function occurrenceRowCount(occurrences) {
  return Object.values(occurrences.units || {}).reduce((sum, unit) => {
    const paragraphs = Array.isArray(unit.paragraphs) ? unit.paragraphs : [];
    return sum + paragraphs.reduce((paragraphSum, paragraph) => {
      const ids = Array.isArray(paragraph.token_index_ids) ? paragraph.token_index_ids : [];
      return paragraphSum + ids.length;
    }, 0);
  }, 0);
}

const catalog = readJson("data/site/hebrew-workbench-catalog.json");
const indexHtml = read("index.html");
const workflow = read(".github/workflows/deploy-lightweight-pages.yml");

const corpora = Array.isArray(catalog.corpora) ? catalog.corpora : [];
const corpusBuckets = corpora.filter((corpus) => corpus.id !== "featured");
const corpusIds = corpora.map((corpus) => corpus.id);
const tanakh = corpora.find((corpus) => corpus.id === "tanakh");
const featured = corpora.find((corpus) => corpus.id === "featured");
const workHrefs = corpora.flatMap((corpus) => (corpus.works || []).map((work) => ({
  id: work.id,
  corpus: corpus.id,
  href: work.href,
  label: work.label,
})));

requireMatch("catalog must define exactly 10 counted corpus buckets", corpusBuckets.length === 10);
requireMatch("catalog must include tanakh", corpusIds.includes("tanakh"));
requireMatch("catalog must include featured", corpusIds.includes("featured"));
requireMatch("tanakh must list Daniel", Boolean((tanakh?.works || []).some((work) => work.id === "daniel" && work.href === "tanakh/daniel/")));
requireMatch("featured must list Daniel", Boolean((featured?.works || []).some((work) => work.id === "daniel" && work.href === "tanakh/daniel/")));
requireMatch("catalog must not expose Ezekiel", !JSON.stringify(catalog).includes("ezekiel"));

for (const work of workHrefs) {
  if (work.href.endsWith("/")) {
    requireMatch(`work path exists for ${work.corpus}/${work.label}`, exists(`${work.href}index.html`));
  }
}

requireMatch("root title must be plain", indexHtml.includes("<title>Hebrew Workbench</title>"));
requireMatch("root corpus heading must use organization", indexHtml.includes("10 Corpus Organization Chart"));
requireMatch("root must use expandable tanakh card", /<details class="corpus-card" data-live="true" id="tanakh" open>/.test(indexHtml));
requireMatch("root featured work list must be outside counted corpus grid", indexHtml.includes('<h2 id="featured-title">Featured</h2>'));
requireMatch("root must not link corpus tile straight to Daniel", !/<a class="corpus-link"[^>]+tanakh\/daniel\//.test(indexHtml));
requireMatch("root must expose Daniel from tanakh and featured only as work links", (indexHtml.match(/<a class="work-link" href="tanakh\/daniel\/">Daniel<\/a>/g) || []).length === 2);
requireMatch("root must not expose csv download", !indexHtml.includes("Daniel CSV") && !indexHtml.includes("data/public-lexical/by-work/daniel-token-claims-min60.csv"));
requireMatch("root must not expose Ezekiel", !/Ezekiel|ezekiel/.test(indexHtml));

const html = read("tanakh/daniel/index.html");
const report = readJson("reports/daniel-reader-pipeline-page-report.json");
const occurrences = readJson("data/lexical/occurrences/daniel.json");
const crossmatches = readJson("data/lexical/crossmatches/daniel.json");
const scopedRouteLookup = readJson("data/definitions/hud-route-lookup-daniel/manifest.json");
const occurrenceRows = occurrenceRowCount(occurrences);

requireMatch("Daniel title must be plain", html.includes("<title>Daniel | Hebrew Workbench</title>"));
requireMatch("Daniel must use shared reader css", html.includes('../../assets/css/reader-workbench.css'));
requireMatch("Daniel must use shared reader js", html.includes('../../assets/js/reader-workbench.js'));
requireMatch("Daniel must declare lexical config", html.includes("data-lexical-config"));
requireMatch("Daniel must declare lexical occurrences", html.includes("data-lexical-occurrences"));
requireMatch("Daniel must not point to reader hints before validation", !html.includes("reader-hints"));
requireMatch("Daniel must declare route HUD panel", html.includes("data-route-hud-panel"));
requireMatch("Daniel must render lexical units", html.includes("data-lexical-unit"));
const readerCss = read("assets/css/reader-workbench.css");
requireMatch("Shared CSS must keep Orot-style popout HUD shell", /\.lexical-hud \{[\s\S]*?position: fixed;[\s\S]*?width: calc\(100vw - 24px\);/.test(readerCss) && !/\.lexical-hud \{[\s\S]*?inset: 0;/.test(readerCss));
requireMatch("Daniel must not fork shared HUD styling inline", !/\.lexical-hud \{/.test(html));
requireMatch("Daniel must keep Hebrew forms visibly clickable", /\.lexical-word \{[\s\S]*?cursor: pointer;[\s\S]*?text-decoration: underline;/.test(html));
requireMatch("Reader runtime must render Hebrew tokens as HUD hyperlinks", read("assets/js/reader-workbench.js").includes("createElement('a', 'lexical-word')") && read("assets/js/reader-workbench.js").includes("span.href = '#route-hud-panel'") && read("assets/js/reader-workbench.js").includes("event.preventDefault();"));
requireMatch("Daniel must use one-token-per-row pre-HUD mode", html.includes('"reader_layout_mode":"prehud_rows"'));
requireMatch("Daniel must keep compact Hebrew source above pre-HUD rows", html.includes('class="hebrew hebrew-source lexical-inline"'));
requireMatch("Reader runtime must render pre-HUD rows from token occurrences", read("assets/js/reader-workbench.js").includes("function makePrehudRow") && read("assets/css/reader-workbench.css").includes(".reader-token-wrap.prehud-row"));
requireMatch("Reader pre-HUD rows must expose quiet source links into the HUD", read("assets/js/reader-workbench.js").includes("prehud-source-link") && read("assets/css/reader-workbench.css").includes(".prehud-source-link") && read("assets/css/reader-workbench.css").includes(".prehud-gloss .reader-gloss-line[data-gloss-placeholder=\"true\"]"));
requireMatch("Daniel must not use standalone Hebrew token buttons", !html.includes('class="hebrew-token"'));
requireMatch("Daniel must not inline standalone HUD route payload", !html.includes("data-hud-routes"));
requireMatch("Daniel report must use shared runtime", report.render_runtime === "shared_reader_workbench");
requireMatch("Daniel report row count must match occurrences", report.token_rows === occurrenceRows && report.occurrence_total_reported === occurrences.total_occurrences);
requireMatch("Daniel unresolved rows must remain N/A until validated definitions exist", report.tbd_fallback_rows === report.token_rows && report.selected_prehud_rows === 0);
requireMatch("Daniel HUD must fail closed before validated definitions", html.includes('"hud_validated_only":true') && html.includes('"hud_hide_unvalidated_routes":true') && html.includes('"hud_allow_lemma_only":false'));
requireMatch("Daniel HUD must keep source-license placeholder while fail-closed", html.includes('"hud_show_empty_source_licenses":true') && read("assets/js/reader-workbench.js").includes("Sources and licenses (0)"));
requireMatch("Daniel must publish Hebrew crossmatch index to the HUD", html.includes('"hebrew_crossmatch_url":"../../data/lexical/crossmatches/daniel.json"'));
requireMatch("Daniel must keep actual book CSV at bottom of book page", html.includes("../../data/public-lexical/by-work/daniel-token-claims-min60.csv"));
requireMatch("Daniel must point to page-scoped route lookup", html.includes("../../data/definitions/hud-route-lookup-daniel/manifest.json"));
requireMatch("Daniel scoped route lookup must expose zero public route shards before validation", scopedRouteLookup.scope_work_id === "daniel" && scopedRouteLookup.counts?.shard_count === 0);
requireMatch("Daniel scoped route lookup must expose zero public route cards before validation", scopedRouteLookup.counts?.card_count === 0 && scopedRouteLookup.counts?.candidate_keys_with_routes === 0);
requireMatch("Daniel crossmatch index must be scoped to Daniel", crossmatches.artifact_type === "hebrew_crossmatch_index" && crossmatches.work_id === "daniel");
requireMatch("Daniel 1:1 first word must have Hebrew crossmatch refs", (crossmatches.matches_by_normalized?.["בשנת"]?.refs || []).some((ref) => ref.source_ref === "Daniel 7:1"));
requireMatch("Reader runtime must show no-match message for empty Hebrew crossmatches", read("assets/js/reader-workbench.js").includes("hebrew matches not found"));

[
  "/assets/css/reader-workbench.css",
  "/assets/js/reader-workbench.js",
  "/data/lexical/daniel.manifest.json",
  "/data/lexical/daniel-chunks",
  "/data/lexical/crossmatches/daniel.json",
  "/data/lexical/occurrences/daniel.json",
  "/data/definitions/hud-route-lookup-daniel/manifest.json",
].forEach((requiredPath) => {
  requireMatch(`Pages workflow must publish ${requiredPath}`, workflow.includes(requiredPath));
});
requireMatch("Pages workflow must not publish Ezekiel", !/ezekiel/i.test(workflow));
requireMatch("Pages workflow must not publish reader hints", !/reader-hints/i.test(workflow));
requireMatch("Pages workflow must not publish Daniel route shards before validation", !/hud-route-lookup-daniel\/shards/.test(workflow));

const result = {
  ok: issues.length === 0,
  checked_at: new Date().toISOString(),
  corpus_count: corpusBuckets.length,
  work_links: workHrefs,
  works: [{
    work_id: "daniel",
    source_units: report.source_units,
    token_rows: report.token_rows,
    tbd_rows: report.tbd_fallback_rows,
    selected_prehud_rows: report.selected_prehud_rows,
    render_runtime: report.render_runtime,
  }],
  issues,
};

console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
