import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const issues = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const catalog = JSON.parse(read("data/site/hebrew-workbench-catalog.json"));
const indexHtml = read("index.html");

function issue(message) {
  issues.push(message);
}

function requireMatch(name, ok) {
  if (!ok) issue(name);
}

const corpora = Array.isArray(catalog.corpora) ? catalog.corpora : [];
const corpusIds = corpora.map((corpus) => corpus.id);
const tanakh = corpora.find((corpus) => corpus.id === "tanakh");
const featured = corpora.find((corpus) => corpus.id === "featured");
const workHrefs = corpora.flatMap((corpus) => (corpus.works || []).map((work) => ({
  id: work.id,
  corpus: corpus.id,
  href: work.href,
  label: work.label,
})));
const expectedWorkIds = ["daniel", "ezekiel"];

requireMatch("catalog must define exactly 11 corpus buckets", corpora.length === 11);
requireMatch("catalog must include tanakh", corpusIds.includes("tanakh"));
requireMatch("catalog must include featured", corpusIds.includes("featured"));
expectedWorkIds.forEach((workId) => {
  requireMatch(`tanakh must list ${workId}`, Boolean((tanakh?.works || []).some((work) => work.id === workId && work.href === `tanakh/${workId}/`)));
  requireMatch(`featured must list ${workId}`, Boolean((featured?.works || []).some((work) => work.id === workId && work.href === `tanakh/${workId}/`)));
});

for (const work of workHrefs) {
  if (work.href.endsWith("/")) {
    requireMatch(`work path exists for ${work.corpus}/${work.label}`, exists(`${work.href}index.html`));
  }
}

requireMatch("root title must be plain", indexHtml.includes("<title>hebrew work bench</title>"));
requireMatch("root must use expandable tanakh card", /<details class="corpus-card" data-live="true" id="tanakh" open>/.test(indexHtml));
requireMatch("root must use expandable featured card", /<details class="corpus-card" data-live="true" id="featured" open>/.test(indexHtml));
requireMatch("root must not link corpus tile straight to daniel", !/<a class="corpus-link"[^>]+tanakh\/daniel\//.test(indexHtml));
expectedWorkIds.forEach((workId) => {
  requireMatch(`root must expose ${workId} from tanakh and featured only as work links`, (indexHtml.match(new RegExp(`<a class="work-link" href="tanakh/${workId}/">${workId}</a>`, "g")) || []).length === 2);
  requireMatch(`root must expose ${workId} csv download`, indexHtml.includes(`<a class="download-link" href="data/public-lexical/by-work/${workId}-token-claims-min60.csv" download>${workId} csv</a>`));
});

const workResults = expectedWorkIds.map((workId) => {
  const html = read(`tanakh/${workId}/index.html`);
  const report = JSON.parse(read(`reports/${workId}-reader-pipeline-page-report.json`));
  const rowCount = (html.match(/<div class="prehud-row"/g) || []).length;
  requireMatch(`${workId} title must be plain`, html.includes(`<title>${workId} | hebrew work bench</title>`));
  requireMatch(`${workId} row count must match report`, rowCount === report.token_rows && rowCount > 0);
  requireMatch(`${workId} unresolved rows must remain TBD`, report.tbd_fallback_rows === report.token_rows && report.selected_prehud_rows === 0);
  requireMatch(`${workId} Hebrew tokens must be button controls`, /<button class="hebrew-token"[\s\S]*?aria-controls="route-hud"/.test(html));
  requireMatch(`${workId} Hebrew token CSS must look clickable`, /box-shadow: inset 3px 0 0 var\(--accent\);/.test(html) && /text-decoration: underline;/.test(html));
  requireMatch(`${workId} HUD must be full screen`, /\.route-hud \{[\s\S]*?inset: 0;[\s\S]*?display: flex;/.test(html));
  requireMatch(`${workId} section tracker must be collapsible`, html.includes("data-section-tracker") && html.includes("data-section-toggle"));
  requireMatch(`${workId} HUD public wording must be plain`, html.includes("gloss found. choose it to fill the row.") && html.includes("details found. row stays TBD.") && html.includes("no gloss yet. row stays TBD."));
  requireMatch(`${workId} HUD must not show old public wording`, !/Definition option|Evidence only|Current route answer-slot|route cards|Pipeline Proof|About \/ License/.test(html));
  return {
    work_id: workId,
    rows: rowCount,
    tbd_rows: report.tbd_fallback_rows,
    route_lookup_runtime_source: report.route_lookup_runtime_source,
  };
});

const result = {
  ok: issues.length === 0,
  checked_at: new Date().toISOString(),
  corpus_count: corpora.length,
  work_links: workHrefs,
  works: workResults,
  issues,
};

console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
