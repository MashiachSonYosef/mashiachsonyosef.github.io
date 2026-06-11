import fs from "node:fs";
import path from "node:path";

const sourcePath = "data/sources/daniel.json";
const claimsPath = "data/public-lexical/by-work/daniel-token-claims-min60.csv";
const outputPath = "reports/daniel-prehud-fullbook-preview.html";
const reportPath = "reports/daniel-prehud-fullbook-preview-report.json";

const stripMarks = (value = "") =>
  value
    .normalize("NFKD")
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[׃,.;:!?()[\]{}"״׳'־–—]/g, "")
    .trim();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const parseCsvLine = (line) => {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"' && quoted && line[i + 1] === '"') {
      cur += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
};

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const claims = parseCsv(fs.readFileSync(claimsPath, "utf8"));
const claimBySurface = new Map();
const claimByNormalized = new Map();
for (const claim of claims) {
  claimBySurface.set(claim.clicked_surface_form, claim);
  const normalized = claim.normalized_form || stripMarks(claim.clicked_surface_form);
  if (!claimByNormalized.has(normalized)) claimByNormalized.set(normalized, claim);
}

const tokens = [];
for (const unit of source.units) {
  const text = (unit.hebrew || []).join(" ");
  const parts = text.split(/\s+/).filter(Boolean);
  parts.forEach((surface, index) => {
    const normalized = stripMarks(surface);
    const claim = claimBySurface.get(surface) || claimByNormalized.get(normalized) || null;
    tokens.push({
      row_id: `daniel-token-${tokens.length + 1}`,
      unit_id: unit.unit_id,
      source_ref: unit.source_ref,
      source_url: unit.source_url,
      surface,
      normalized,
      position_in_unit: index + 1,
      selectable: false,
      prehud_gloss: "TBD",
      match_percent: "TBD",
      claim: claim
        ? {
            export_status: claim.export_status,
            best_confidence_any_claim: claim.best_confidence_any_claim,
            safe_min_confidence: claim.safe_min_confidence,
            safe_rendering_options: claim.safe_rendering_options,
            safe_source_names: claim.safe_source_names,
            safe_source_ids: claim.safe_source_ids,
            safe_licenses: claim.safe_licenses,
            notes: claim.notes
          }
        : null
    });
  });
}

const rowsHtml = tokens.map((token, index) => {
  const hudId = `daniel-hud-${index + 1}`;
  const sourceId = `daniel-src-${index + 1}`;
  return `<div class="prehud-row" data-hud-row data-hud-target="${hudId}" data-token-row-id="${escapeHtml(token.row_id)}" data-selectable="false">
    <div class="prehud-word" lang="he" dir="rtl"><a href="#${hudId}" data-hud-open="${hudId}">${escapeHtml(token.surface)}</a></div>
    <div class="prehud-gloss"><span data-gloss-text>TBD</span><a href="#${sourceId}" data-hud-open="${hudId}" data-hud-source="${sourceId}" aria-label="Source evidence for ${escapeHtml(token.surface)}"><sup>${index + 1}</sup></a></div>
    <div class="prehud-match" data-match-text>TBD</div>
  </div>`;
}).join("\n");

const tokenData = Object.fromEntries(tokens.map((token, index) => [`daniel-hud-${index + 1}`, {
  source: `daniel-src-${index + 1}`,
  ...token
}]));

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Daniel Pre-HUD Full-Book Preview</title>
  <style>
    :root { --bg:#101113; --panel:#18191c; --panel2:#202126; --text:#efe6d2; --muted:#c8bca5; --line:#3a3329; --line2:#6f5c3c; --accent:#d6be8a; --hebrew:#f4ead8; --warn:#d6be8a; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font:16px/1.55 Georgia, "Times New Roman", serif; }
    a { color: inherit; }
    main { padding: 28px 16px 48px; }
    .shell { width:min(1180px, 100%); margin:0 auto; }
    .hero, .unit { border:1px solid var(--line); background:rgba(255,255,255,0.018); padding:18px; }
    .hero { background:var(--panel); margin-bottom:18px; }
    .crumbs { margin:0 0 10px; color:var(--accent); font-size:.82rem; letter-spacing:.06em; text-transform:uppercase; }
    h1, h2, h3 { font-weight:400; line-height:1.18; }
    h1 { margin:0; font-size:clamp(2rem,5vw,4.3rem); }
    .summary { display:flex; flex-wrap:wrap; gap:8px 14px; margin:16px 0 0; color:var(--muted); font-size:.92rem; }
    .notice { margin:16px 0 0; color:var(--muted); max-width:86ch; }
    .toolbar { position:sticky; top:0; z-index:5; display:flex; flex-wrap:wrap; gap:10px; align-items:center; border:1px solid var(--line); background:rgba(24,25,28,.96); padding:10px; margin-bottom:14px; }
    .toolbar a { color:var(--accent); text-decoration:none; border-bottom:1px solid rgba(214,190,138,.38); }
    .source-strip { display:flex; flex-wrap:wrap; gap:10px 16px; margin:0 0 16px; padding:8px 10px; border:1px solid rgba(214,190,138,.16); background:rgba(255,255,255,.018); }
    .source-ref { color:var(--accent); font-size:.78rem; letter-spacing:.04em; text-transform:uppercase; }
    .hebrew-source { margin:0; color:var(--hebrew); direction:rtl; unicode-bidi:plaintext; text-align:right; font-size:1rem; line-height:1.35; opacity:.82; overflow-wrap:anywhere; }
    .prehud-rows { display:grid; gap:10px; direction:ltr; }
    .prehud-row { display:grid; grid-template-columns:minmax(5.75rem,.22fr) minmax(20rem,1fr) minmax(5.25rem,.16fr); align-items:stretch; border:1px solid rgba(214,190,138,.24); background:rgba(10,11,13,.72); }
    .prehud-word, .prehud-gloss, .prehud-match { min-width:0; padding:12px 14px; display:flex; align-items:flex-start; }
    .prehud-word { color:var(--hebrew); font-size:1.24rem; line-height:1.1; direction:rtl; unicode-bidi:isolate; border-right:1px solid rgba(214,190,138,.18); background:rgba(214,190,138,.055); }
    .prehud-word a { text-decoration:none; border-bottom:1px solid rgba(214,190,138,.38); }
    .prehud-gloss { display:block; color:var(--text); font-size:.97rem; line-height:1.48; overflow-wrap:anywhere; word-break:normal; white-space:normal; background:rgba(255,255,255,.018); }
    .prehud-gloss [data-gloss-text] { display:block; overflow-wrap:anywhere; max-width:76ch; }
    .prehud-gloss a { color:var(--accent); text-decoration:none; margin-left:.26rem; }
    .prehud-match { justify-content:flex-end; color:var(--warn); font-size:.88rem; line-height:1.2; font-variant-numeric:tabular-nums; border-left:1px solid rgba(214,190,138,.18); }
    .lexical-hud { position:fixed; z-index:1000; top:12px; left:12px; width:calc(100vw - 24px); max-width:calc(100vw - 24px); max-height:calc(100vh - 24px); border:1px solid var(--line); background:var(--panel2); padding:18px; box-shadow:0 18px 60px rgba(0,0,0,.42); overflow:auto; }
    .lexical-hud[hidden] { display:none; }
    .hud-head { position:sticky; top:0; z-index:2; display:flex; justify-content:space-between; gap:14px; margin:-18px -18px 14px; padding:14px 18px 10px; background:linear-gradient(180deg,var(--panel2) 78%,rgba(0,0,0,0)); }
    .hud-close, .reader-gloss-choice { border:1px solid var(--line2); background:transparent; color:var(--accent); padding:4px 8px; font:inherit; cursor:pointer; }
    .route-hud-panel { display:grid; gap:12px; min-width:0; }
    .route-selected-token { border:1px solid var(--line2); background:rgba(214,190,138,.06); color:var(--hebrew); padding:12px 14px; text-align:center; font-size:clamp(2rem,7vw,4rem); line-height:1.05; overflow-wrap:anywhere; }
    .route-section-card, .route-source-card, .reader-gloss-card { border:1px solid var(--line); background:rgba(255,255,255,.018); padding:12px; }
    .route-section-title { display:flex; justify-content:space-between; gap:12px; color:var(--muted); }
    .reader-gloss-definition, .reader-gloss-source, .source-citation { overflow-wrap:anywhere; word-break:break-word; }
    .placeholder { color:var(--muted); margin:0; }
    @media (max-width:720px) { main{padding-inline:10px}.hero,.unit{padding:14px}.prehud-row{grid-template-columns:minmax(4.8rem,.32fr) minmax(0,1fr)}.prehud-word,.prehud-gloss,.prehud-match{padding:8px}.prehud-match{grid-column:2; justify-content:flex-start; border-left:0; border-top:1px solid rgba(214,190,138,.18)}.lexical-hud{inset:8px auto auto 8px; width:calc(100vw - 16px); max-width:calc(100vw - 16px); max-height:calc(100vh - 16px)}}
  </style>
</head>
<body>
  <main>
    <div class="shell">
      <section class="hero">
        <p class="crumbs">Library &middot; Tanakh &middot; Writings</p>
        <h1>Daniel</h1>
        <p class="summary"><span>owner-review preview</span><span>full-book token roster</span><span>Route HUD popout</span><span>pre-HUD TBD gate enforced</span></p>
        <p class="notice">Every Hebrew token from the Daniel source roster has one pre-HUD row. No current selectable/default route layer is present, so pre-HUD gloss and match cells stay TBD. HUD cards expose lexical/source evidence only and do not promote lemma cards into pre-HUD glosses.</p>
      </section>
      <nav class="toolbar" aria-label="Daniel owner review navigation">
        <a href="#daniel-preview">Daniel preview</a>
        <span>${tokens.length} token rows</span>
        <span>${source.units.length} source units</span>
      </nav>
      <section class="unit" id="daniel-preview">
        <div class="source-strip"><span class="source-ref">Daniel</span><p class="hebrew-source" lang="he" dir="rtl">${escapeHtml(source.units[0].hebrew[0])}</p></div>
        <div class="prehud-rows" aria-label="Daniel pre-HUD rows">
${rowsHtml}
        </div>
      </section>
    </div>
  </main>
  <section class="lexical-hud" data-lexical-hud hidden role="dialog" aria-labelledby="route-hud-title" tabindex="-1">
    <div class="hud-head"><h2 id="route-hud-title">Route HUD</h2><button class="hud-close" type="button" data-hud-close>Close</button></div>
    <div class="route-hud-panel" data-route-hud-panel><p class="placeholder">Click a Hebrew token to inspect route evidence.</p></div>
  </section>
  <script type="application/json" id="daniel-token-data">${escapeHtml(JSON.stringify(tokenData))}</script>
  <script>
    (() => {
      const tokenRows = JSON.parse(document.querySelector("#daniel-token-data").textContent);
      const hud = document.querySelector("[data-lexical-hud]");
      const panel = document.querySelector("[data-route-hud-panel]");
      const title = document.querySelector("#route-hud-title");
      const create = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
      const evidenceSummary = (claim) => {
        if (!claim) return "No lexical route/card evidence found for this token in the Daniel token-claims CSV.";
        return claim.safe_rendering_options || claim.notes || "Lexical evidence row present; no selectable default route gloss.";
      };
      const sourceSummary = (claim) => claim ? [
        claim.safe_source_names || "source missing",
        claim.safe_source_ids || "source id missing",
        claim.safe_licenses || "license missing",
        claim.export_status || "status missing"
      ].join(" | ") : "Source row missing";
      const renderHud = (target, sourceId) => {
        const tokenRow = tokenRows[target];
        if (!tokenRow) return;
        panel.replaceChildren();
        title.textContent = "Route HUD: " + tokenRow.surface;
        const token = create("div", "route-selected-token", tokenRow.surface);
        token.lang = "he"; token.dir = "rtl"; panel.appendChild(token);
        const gate = create("section", "route-section-card");
        const gateTitle = create("div", "route-section-title");
        gateTitle.appendChild(create("h3", "", "Pre-HUD gate"));
        gateTitle.appendChild(create("span", "", "TBD"));
        gate.appendChild(gateTitle);
        gate.appendChild(create("p", "placeholder", "No selectable current route/default-selection card exists in this preview. Lemma evidence remains HUD-only and does not fill the pre-HUD row."));
        panel.appendChild(gate);
        const card = create("article", "reader-gloss-card");
        card.dataset.evidenceOnly = "true";
        card.dataset.selectable = "false";
        const top = create("div", "route-section-title");
        top.appendChild(create("h3", "", "HUD evidence only"));
        top.appendChild(create("span", "", tokenRow.claim ? "token-claims CSV" : "no claim"));
        card.appendChild(top);
        card.appendChild(create("p", "reader-gloss-definition", evidenceSummary(tokenRow.claim)));
        const button = create("button", "reader-gloss-choice", "HUD evidence only");
        button.type = "button"; button.disabled = true; card.appendChild(button);
        panel.appendChild(card);
        const sources = create("details", "route-source-card");
        sources.open = true;
        sources.appendChild(create("summary", "", "Sources / licenses"));
        const line = create("p", "reader-gloss-source source-citation", sourceSummary(tokenRow.claim));
        line.id = sourceId || tokenRow.source;
        sources.appendChild(line);
        sources.appendChild(create("p", "reader-gloss-source", tokenRow.source_ref + " / " + tokenRow.source_url));
        panel.appendChild(sources);
        hud.hidden = false;
        hud.focus({ preventScroll: true });
      };
      document.querySelectorAll("[data-hud-open]").forEach((link) => link.addEventListener("click", (event) => {
        event.preventDefault();
        renderHud(link.dataset.hudOpen, link.dataset.hudSource);
      }));
      document.querySelector("[data-hud-close]")?.addEventListener("click", () => { hud.hidden = true; });
      document.addEventListener("keydown", (event) => { if (event.key === "Escape") hud.hidden = true; });
      window.__danielPreview = { tokenRowCount: Object.keys(tokenRows).length, sourceUnitCount: ${source.units.length}, selectableRows: 0 };
    })();
  </script>
</body>
</html>`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
fs.writeFileSync(reportPath, JSON.stringify({
  artifact_type: "daniel_prehud_fullbook_preview_report",
  generated_at: new Date().toISOString(),
  source: sourcePath,
  claims: claimsPath,
  output: outputPath,
  source_units: source.units.length,
  token_rows: tokens.length,
  selectable_rows: 0,
  prehud_tbd_rows: tokens.length,
  hud_evidence_rows: tokens.filter((token) => token.claim).length,
  blocker: "no_current_selectable_route_default_selection_layer_for_daniel"
}, null, 2), "utf8");

console.log(`Daniel pre-HUD preview written: ${outputPath}`);
console.log(`Rows: ${tokens.length}; source units: ${source.units.length}; selectable rows: 0`);
