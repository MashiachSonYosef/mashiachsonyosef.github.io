import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const issues = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const catalog = JSON.parse(read("data/site/hebrew-workbench-catalog.json"));
const indexHtml = read("index.html");
const danielHtml = read("tanakh/daniel/index.html");
const danielReport = JSON.parse(read("reports/daniel-reader-pipeline-page-report.json"));

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
  corpus: corpus.id,
  href: work.href,
  label: work.label,
})));

requireMatch("catalog must define exactly 11 corpus buckets", corpora.length === 11);
requireMatch("catalog must include tanakh", corpusIds.includes("tanakh"));
requireMatch("catalog must include featured", corpusIds.includes("featured"));
requireMatch("tanakh must list daniel", Boolean((tanakh?.works || []).some((work) => work.id === "daniel" && work.href === "tanakh/daniel/")));
requireMatch("featured must list daniel", Boolean((featured?.works || []).some((work) => work.id === "daniel" && work.href === "tanakh/daniel/")));

for (const work of workHrefs) {
  if (work.href.endsWith("/")) {
    requireMatch(`work path exists for ${work.corpus}/${work.label}`, exists(`${work.href}index.html`));
  }
}

requireMatch("root title must be plain", indexHtml.includes("<title>hebrew work bench</title>"));
requireMatch("root must use expandable tanakh card", /<details class="corpus-card" data-live="true" id="tanakh" open>/.test(indexHtml));
requireMatch("root must use expandable featured card", /<details class="corpus-card" data-live="true" id="featured" open>/.test(indexHtml));
requireMatch("root must not link corpus tile straight to daniel", !/<a class="corpus-link"[^>]+tanakh\/daniel\//.test(indexHtml));
requireMatch("root must expose daniel from tanakh and featured only as work links", (indexHtml.match(/<a class="work-link" href="tanakh\/daniel\/">daniel<\/a>/g) || []).length === 2);
requireMatch("root must expose full csv download", indexHtml.includes('<a class="download-link" href="data/public-lexical/by-work/daniel-token-claims-min60.csv" download>full csv</a>'));

const rowCount = (danielHtml.match(/<div class="prehud-row"/g) || []).length;
requireMatch("Daniel title must be plain", danielHtml.includes("<title>daniel | hebrew work bench</title>"));
requireMatch("Daniel row count must match report", rowCount === danielReport.token_rows && rowCount === 5456);
requireMatch("Daniel unresolved rows must remain TBD", danielReport.tbd_fallback_rows === 5456 && danielReport.selected_prehud_rows === 0);
requireMatch("Hebrew tokens must be button controls", /<button class="hebrew-token"[\s\S]*?aria-controls="route-hud"/.test(danielHtml));
requireMatch("Hebrew token CSS must look clickable", /box-shadow: inset 3px 0 0 var\(--accent\);/.test(danielHtml) && /text-decoration: underline;/.test(danielHtml));
requireMatch("HUD must be full screen", /\.route-hud \{[\s\S]*?inset: 0;[\s\S]*?display: flex;/.test(danielHtml));
requireMatch("section tracker must be collapsible", danielHtml.includes("data-section-tracker") && danielHtml.includes("data-section-toggle"));
requireMatch("HUD public wording must be plain", danielHtml.includes("gloss found. choose it to fill the row.") && danielHtml.includes("details found. row stays TBD.") && danielHtml.includes("no gloss yet. row stays TBD."));
requireMatch("HUD must not show old public wording", !/Definition option|Evidence only|Current route answer-slot|route cards|Pipeline Proof|About \/ License/.test(danielHtml));

const result = {
  ok: issues.length === 0,
  checked_at: new Date().toISOString(),
  corpus_count: corpora.length,
  work_links: workHrefs,
  daniel_rows: rowCount,
  daniel_tbd_rows: danielReport.tbd_fallback_rows,
  issues,
};

console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
