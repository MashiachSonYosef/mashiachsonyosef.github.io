import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const pages = [];
const pageLists = [];
const structureShards = [];
const issues = [];
const readCache = new Map();
let allReaderPages = false;
let maxPages = null;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--page") {
    const value = args[index + 1];
    if (!value) {
      issues.push("--page requires a value");
    } else {
      pages.push(value.replace(/\\/g, "/"));
      index += 1;
    }
    continue;
  }
  if (arg === "--structure-shard") {
    const value = args[index + 1];
    if (!value) {
      issues.push("--structure-shard requires a value");
    } else {
      structureShards.push(value.replace(/\\/g, "/"));
      index += 1;
    }
    continue;
  }
  if (arg === "--page-list") {
    const value = args[index + 1];
    if (!value) {
      issues.push("--page-list requires a value");
    } else {
      pageLists.push(value.replace(/\\/g, "/"));
      index += 1;
    }
    continue;
  }
  if (arg === "--all-reader-pages") {
    allReaderPages = true;
    continue;
  }
  if (arg === "--max-pages") {
    const value = Number(args[index + 1]);
    if (!Number.isFinite(value) || value <= 0) {
      issues.push("--max-pages requires a positive number");
    } else {
      maxPages = Math.floor(value);
      index += 1;
    }
    continue;
  }
  if (arg === "--help" || arg === "-h") {
    console.log("Usage: node scripts/validate_reader_page_contract.mjs --page <path> [--page <path>...] [--page-list <path>] [--all-reader-pages] [--max-pages <n>] [--structure-shard <path>...]");
    process.exit(0);
  }
  if (!arg.startsWith("--")) {
    pages.push(arg.replace(/\\/g, "/"));
  } else {
    issues.push(`unknown argument ${arg}`);
  }
}

function read(relativePath) {
  if (!readCache.has(relativePath)) {
    readCache.set(relativePath, fs.readFileSync(path.join(root, relativePath), "utf8"));
  }
  return readCache.get(relativePath);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function issue(message) {
  issues.push(message);
}

function requireMatch(name, ok) {
  if (!ok) issue(name);
}

function relPathFromUrl(pagePath, url) {
  if (!url || /^(?:https?:|data:|#)/i.test(url)) return "";
  const cleanUrl = url.split("#")[0].split("?")[0];
  return path.normalize(path.join(path.dirname(pagePath), cleanUrl)).replace(/\\/g, "/");
}

function extractJsonScript(html, attribute) {
  const re = new RegExp(`<script[^>]*${attribute}[^>]*>([\\s\\S]*?)<\\/script>`, "i");
  const match = html.match(re);
  if (!match) return null;
  return JSON.parse(match[1]);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hasPrivateDefinitionMarker(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return [
    "project-abbreviation:",
    "Project-authored abbreviation table",
    "local:project-abbreviation-table",
    "project-abbreviations",
    "project-authored / CC0",
  ].some((marker) => text.includes(marker));
}

function collectRouteCards(payload) {
  return Object.values(payload.routes_by_normalized || {})
    .flatMap((cards) => (Array.isArray(cards) ? cards : []));
}

function findReaderPages(startDir = ".", limit = null) {
  const found = [];
  const skipDirs = new Set([
    ".git",
    ".codex-tmp",
    ".local-cache",
    ".venv",
    "data",
    "node_modules",
    "reports",
  ]);

  function visit(relativeDir) {
    if (limit && found.length >= limit) return;
    const absoluteDir = path.join(root, relativeDir);
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
    for (const entry of entries) {
      if (limit && found.length >= limit) return;
      const relativePath = path.normalize(path.join(relativeDir, entry.name)).replace(/\\/g, "/").replace(/^\.\//, "");
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) visit(relativePath);
        continue;
      }
      if (entry.isFile() && entry.name === "index.html") {
        const html = read(relativePath);
        if (html.includes("data-lexical-config")) found.push(relativePath);
      }
    }
  }

  visit(startDir);
  return found.sort((a, b) => a.localeCompare(b));
}

function isStructureCard(card) {
  return normalize(card.route_family) === "token_structure"
    || normalize(card.route_type) === "structure_evidence"
    || normalize(card.display_label).includes("token structure")
    || normalize(card.display_label).includes("structure evidence");
}

function validateStructureShard(relativePath) {
  if (!exists(relativePath)) {
    issue(`structure shard missing: ${relativePath}`);
    return { path: relativePath, structure_cards: 0 };
  }
  const payload = JSON.parse(read(relativePath));
  const cards = collectRouteCards(payload);
  const structureCards = cards.filter(isStructureCard);
  requireMatch(`structure shard must contain structure evidence: ${relativePath}`, structureCards.length > 0);
  for (const card of structureCards) {
    const cardName = `${relativePath} ${card.card_id || card.normalized || "unnamed"}`;
    requireMatch(`${cardName} must be evidence-only`, card.answer_eligible === false && normalize(card.answer_role) === "evidence");
    requireMatch(`${cardName} must not carry definition text`, !String(card.definition || "").trim());
    requireMatch(`${cardName} must not carry private definition markers`, !hasPrivateDefinitionMarker(card));
    requireMatch(`${cardName} must expose structure morphology`, Boolean(card.morphology && typeof card.morphology === "object"));
    if (card.morphology && typeof card.morphology === "object") {
      requireMatch(`${cardName} morphology evidence source must be token_structure_rule`, card.morphology.evidence_source === "token_structure_rule");
      requireMatch(`${cardName} morphology license lane must not be a definition source`, card.morphology.license_lane === "not_a_definition_source");
      requireMatch(`${cardName} morphology must not be display/preHUD eligible`, card.morphology.display_eligible === false && card.morphology.prehud_allowed === false);
    }
    const sourceRows = Array.isArray(card.source_rows) ? card.source_rows : [];
    requireMatch(`${cardName} must include source/license evidence rows`, sourceRows.length > 0);
    for (const row of sourceRows) {
      requireMatch(`${cardName} source family must be token_structure_rule`, row.source_family === "token_structure_rule");
      requireMatch(`${cardName} source license must not be a definition source`, row.license === "not_a_definition_source");
    }
  }
  return { path: relativePath, structure_cards: structureCards.length };
}

function validatePage(pagePath) {
  if (!exists(pagePath)) {
    issue(`page missing: ${pagePath}`);
    return null;
  }

  const html = read(pagePath);
  const config = extractJsonScript(html, "data-lexical-config");
  requireMatch(`${pagePath} must use shared reader CSS`, html.includes("assets/css/reader-workbench.css"));
  requireMatch(`${pagePath} must use shared reader JS`, html.includes("assets/js/reader-workbench.js"));
  requireMatch(`${pagePath} must use generated shell`, html.includes('class="shell"'));
  requireMatch(`${pagePath} must use reader shell`, html.includes('class="reader-shell"'));
  requireMatch(`${pagePath} must declare lexical config`, Boolean(config));
  requireMatch(`${pagePath} must declare lexical occurrences`, html.includes("data-lexical-occurrences"));
  requireMatch(`${pagePath} must declare lexical HUD root`, html.includes("data-lexical-hud"));
  requireMatch(`${pagePath} must declare route HUD panel`, html.includes("data-route-hud-panel"));
  requireMatch(`${pagePath} must render lexical units`, html.includes("data-lexical-unit"));
  requireMatch(`${pagePath} must render clickable lexical words`, html.includes("lexical-word"));
  requireMatch(`${pagePath} must not leak old inline tag markup`, !/<big|&lt;big|<\/big|&lt;\/big/i.test(html));
  requireMatch(`${pagePath} must not include replacement characters`, !html.includes("\uFFFD"));
  requireMatch(`${pagePath} must contain Hebrew codepoints`, /[\u0590-\u05FF]/.test(html));
  requireMatch(`${pagePath} must not include Daniel-specific HUD wording`, !/Same Hebrew form in Daniel|No other Daniel passage/.test(html));

  if (!config) return null;
  for (const key of ["work_id", "work_slug", "work_title", "manifest_url", "occurrence_url", "hud_route_lookup_manifest_url", "root_href"]) {
    requireMatch(`${pagePath} config must include ${key}`, Boolean(config[key]));
  }
  requireMatch(`${pagePath} must use preHUD row mode`, config.reader_layout_mode === "prehud_rows");
  requireMatch(`${pagePath} must avoid private definition markers in config`, !hasPrivateDefinitionMarker(config));

  for (const key of ["manifest_url", "occurrence_url", "hud_route_lookup_manifest_url"]) {
    const relative = relPathFromUrl(pagePath, config[key]);
    requireMatch(`${pagePath} ${key} must resolve: ${relative}`, Boolean(relative) && exists(relative));
  }
  if (config.reader_hints_url || config.reader_hint_url) {
    const hintUrl = config.reader_hints_url || config.reader_hint_url;
    const relative = relPathFromUrl(pagePath, hintUrl);
    requireMatch(`${pagePath} optional reader hints must resolve when declared: ${relative}`, Boolean(relative) && exists(relative));
  }

  const routeManifestPath = relPathFromUrl(pagePath, config.hud_route_lookup_manifest_url);
  let routeManifest = null;
  if (routeManifestPath && exists(routeManifestPath)) {
    routeManifest = JSON.parse(read(routeManifestPath));
    requireMatch(`${pagePath} route manifest must include shards/counts`, Boolean(routeManifest.counts && Array.isArray(routeManifest.shards)));
    requireMatch(`${pagePath} route manifest must avoid private definition markers`, !hasPrivateDefinitionMarker(routeManifest));
    const shards = Array.isArray(routeManifest.shards) ? routeManifest.shards : [];
    for (const shard of shards.slice(0, 20)) {
      const shardPath = path.normalize(path.join(path.dirname(routeManifestPath), shard.path || "")).replace(/\\/g, "/");
      requireMatch(`${pagePath} route shard must resolve: ${shardPath}`, Boolean(shard.path) && exists(shardPath));
    }
  }

  return {
    page: pagePath,
    work_id: config.work_id || "",
    work_title: config.work_title || "",
    route_manifest: routeManifestPath,
    route_shards: routeManifest?.counts?.shard_count ?? null,
  };
}

if (allReaderPages) {
  const discovered = findReaderPages(".", maxPages);
  pages.push(...discovered);
}

for (const pageList of pageLists) {
  if (!exists(pageList)) {
    issue(`page list missing: ${pageList}`);
    continue;
  }
  const listedPages = read(pageList)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.replace(/\\/g, "/"));
  pages.push(...listedPages);
}

const uniquePages = [...new Set(pages)];

if (uniquePages.length === 0) {
  issue("no pages supplied");
}

const runtime = exists("assets/js/reader-workbench.js") ? read("assets/js/reader-workbench.js") : "";
requireMatch("reader runtime must be present", Boolean(runtime));
requireMatch("reader runtime must accept singular/plural reader hint URL keys", runtime.includes("config.reader_hints_url || config.reader_hint_url"));
requireMatch("reader runtime must preserve structure evidence in validated-only HUDs", runtime.includes("function isValidatedStructureEvidence") && runtime.includes("token_structure_rule") && runtime.includes("not_a_definition_source"));
requireMatch("reader runtime must not contain Daniel-specific crossmatch wording", !/Same Hebrew form in Daniel|No other Daniel passage/.test(runtime));
requireMatch(
  "reader runtime must render a blank evidence HUD for TBD tokens",
  runtime.includes("function renderRouteHudPanel")
    && runtime.includes("renderStudyHudFrame(panel, fallbackForm, fallbackNormalized")
    && runtime.includes("appendPlaceholderHudSection(panel)")
    && runtime.includes("Strict Hebrew matches not found for this token.")
    && runtime.includes("Strict Aramaic matches not found for this token.")
);
requireMatch(
  "reader runtime must open the HUD from preHUD passage-token clicks",
  runtime.includes("function openPrehudRowHud")
    && runtime.includes("target.querySelector('[data-lexical-token]')")
    && runtime.includes("event.stopPropagation()")
    && runtime.includes("openPrehudRowHud(rowId)")
);
requireMatch(
  "reader runtime must keep Word-part breakdown as a dedicated HUD section",
  runtime.includes("['morphology', 'Word-part breakdown']")
    && runtime.includes("appendStructureEvidenceDetails")
    && runtime.includes("!isValidatedStructureEvidence(card) && routeRenderings(card).length")
    && runtime.includes("structure evidence only; not a definition or preHUD gloss")
);
requireMatch(
  "reader runtime must keep HUD popout target behavior",
  runtime.includes("span.href = '#route-hud-panel'")
    && runtime.includes("aria-haspopup")
    && runtime.includes("dialog")
    && runtime.includes("document.querySelector('[data-lexical-hud]')")
    && runtime.includes("data-route-hud-panel")
);

const pageResults = uniquePages.map(validatePage).filter(Boolean);
const structureResults = structureShards.map(validateStructureShard);

const result = {
  ok: issues.length === 0,
  checked_at: new Date().toISOString(),
  page_count: uniquePages.length,
  pages_checked: pageResults,
  structure_shards_checked: structureResults,
  issue_count: issues.length,
  issues: issues.slice(0, 200),
  issues_truncated: issues.length > 200,
};

console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
