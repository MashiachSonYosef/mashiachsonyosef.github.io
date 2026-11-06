#!/usr/bin/env node
// GUARDS: ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say
// GUARDS: zone-gloss-rule-v5-ledger-division-antiquity-1940-lastuary
//
// THE PAGE READS THE LEDGER'S DIVISION, AND THE DIVISION IS THE LEDGER'S.
//
// A dictionary's ledger (the corpus lane's declaration of every mark of every
// route, ask v1.1) reaches the page as data: tools/apply-ledger-divisions-v1
// writes the marks a row divides at into row[7], and the index names the
// ledger each source is under. This asks that the data is the ledger's and
// that the page reads the data:
//
//   D1  every source the store serves is under a ledger the index names, with
//       the rows the index counts, or is excluded with why (Strong's 1890,
//       whose ledger the owner tabled), and no served source is both or neither
//   D2  each ledger's two files on disk are the bytes the index and the
//       manifest pin, and the index's answer to every branch is the answers
//       file's, or the declaration's resting option where none was given
//   D3  rows of every ledgered source, re-classified here by the source's own
//       classifier: row[7] is exactly the marks whose shape divides under the
//       index's answers, row[8] is exactly what the print step (ledger-print-v1)
//       gives under the branch the owner answered, and no row of an unledgered
//       source carries either slot
//   D4  the store's readingsOf and the page's readingsOfRow, read out of
//       zone.html as bake-search-index reads the page's functions, give the
//       same readings for every sampled row, ledgered or not
//   D5  on the page: the card of a word whose ledgered row the generic rule
//       would have divided offers that row as its ledger says (one pill where
//       the row has no slot), and its record text prints whole
//   D6  on the page: a row that prints a part of itself (a filing tag off)
//       offers the part as its pill and not the row's whole text
//   D7  on the page: a row that prints no pill offers nothing
//   D8  the span store's rows (data/span-store/<book>.json): every row of a
//       ledgered source carries the same slots, re-classified here, and no
//       row of an unledgered source carries one (6 November 2026, the code
//       review: 308 span rows served whole where their ledger cuts them)
//
// Run: node tools/check-ledger-divisions-v1.mjs [--store data/route-store] [--per-source 400]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { printOf, PRINT_RULES } from "./ledger-print-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const PER = Number(arg("per-source", 400));
const ONLY = arg("only", null);   // one of D1..D7, for a quick rerun
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");

const store = openRouteStore(STORE);
const index = store.index;
const L = index.ledgers;
if (!L || !L.sources) { console.log("SKIPPED — the store's index names no ledgers (index.ledgers)"); process.exit(3); }
const manifest = JSON.parse(readFileSync(join(K3, "data", "ledgers-v1", "manifest.json"), "utf8"));
const answersPath = join(K3, "data", "ledger-branch-answers-v1.json");
const answers = existsSync(answersPath) ? JSON.parse(readFileSync(answersPath, "utf8")) : { answers: {} };

// ---- the rows, every one, counted per source and sampled per ledger -----------------
const rowsOfM = {}; const sample = {}; const slotOnUnledgered = []; let rowsSeen = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    rowsSeen += 1;
    const m = String(row[3]); rowsOfM[m] = (rowsOfM[m] || 0) + 1;
    const src = index.m_sources[m]; if (!src) continue;
    if (!src.ledger) { if (Array.isArray(row[7]) || Array.isArray(row[8])) slotOnUnledgered.push(`${m} ${k}#${row[0]}`); continue; }
    const s = (sample[src.ledger] ||= { n: 0, rows: [] });
    s.n += 1;
    // every PER-th row, and every row with a slot, so a division or a print is never unsampled
    const slotted = Array.isArray(row[7]) || Array.isArray(row[8]);
    if (slotted || s.n % Math.max(1, Math.ceil(s.n / PER)) === 0 || s.rows.length < PER) { if (s.rows.length < PER * 3 || slotted) s.rows.push([k, row]); }
  }
}

// D1
if (!ONLY || ONLY === "D1") {
  const faults = [];
  for (const [m, src] of Object.entries(index.m_sources)) {
    const served = rowsOfM[m] || 0;
    if (src.ledger) {
      const S = L.sources[src.ledger];
      if (!S) faults.push(`${m} is under ${src.ledger}, which index.ledgers does not name`);
      else if (!S.m_ids.includes(m)) faults.push(`${m} is under ${src.ledger}, whose m_ids omit it`);
      if (src.key !== src.ledger) faults.push(`${m}: key ${src.key}, ledger ${src.ledger}`);
    } else if (served && !(L.excluded || {})[src.key]) faults.push(`${m} (${src.key}) serves ${nf(served)} rows under no ledger and is not excluded`);
  }
  for (const [key, S] of Object.entries(L.sources)) {
    const recount = S.m_ids.reduce((a, m) => a + (rowsOfM[m] || 0), 0);
    if (recount !== S.rows) faults.push(`${key}: the index counts ${nf(S.rows)} rows, the shards hold ${nf(recount)}`);
    for (const m of S.m_ids) if ((index.m_sources[m] || {}).ledger !== key) faults.push(`${key} names ${m}, which is not under it`);
  }
  check("D1  every served source is under a ledger the index names, with the rows it counts, or excluded with why", faults.length === 0,
    faults.length ? faults.slice(0, 4).join(" · ") : `${Object.keys(L.sources).length} ledgers over ${nf(Object.values(L.sources).reduce((a, s) => a + s.rows, 0))} rows · excluded: ${Object.entries(L.excluded || {}).map(([k, v]) => `${k} (${nf(v.rows)} rows)`).join(", ") || "none"}`);
}

// D2
const classifiers = new Map();
if (!ONLY || ONLY === "D2" || ONLY === "D3" || ONLY === "D8") {
  const faults = [];
  for (const [key, S] of Object.entries(L.sources)) {
    const M = manifest.ledgers[key];
    if (!M) { faults.push(`${key}: not in the manifest`); continue; }
    for (const [what, file, want] of [["declaration", M.declaration.file, S.declaration_sha256], ["classifier", M.classifier.file, S.classifier_sha256]]) {
      const p = join(K3, file);
      if (!existsSync(p)) { faults.push(`${key}: ${file} missing`); continue; }
      const got = sha256(readFileSync(p));
      if (got !== want) faults.push(`${key}: ${what} on disk ${got.slice(0, 10)}…, index ${String(want).slice(0, 10)}…`);
      if (M[what].sha256 !== want) faults.push(`${key}: ${what} manifest ${M[what].sha256.slice(0, 10)}…, index ${String(want).slice(0, 10)}…`);
    }
    const decl = JSON.parse(readFileSync(join(K3, M.declaration.file), "utf8"));
    const dividing = new Set();
    const printing = new Map();   // shape -> the print step's entry (source:branch) for the branch the owner answered
    for (const s of decl.shapes || []) if (s.divides) dividing.add(s.id);
    for (const b of decl.branches || []) {
      const a = ((answers.answers || {})[key] || {})[b.id];
      const want = a ? a.option : b.resting;
      const have = (S.branches || {})[b.id];
      if (!have) faults.push(`${key} ${b.id}: the index carries no answer`);
      else if (have.option !== want) faults.push(`${key} ${b.id}: index says ${have.option}, ${a ? "the answers file" : "the resting option"} says ${want}`);
      if (want === "divides") for (const id of b.shapes || []) dividing.add(id);
      else if (want !== b.resting) {
        if (!have || have.prints !== `${key}:${b.id}`) faults.push(`${key} ${b.id}: answered "${want}", and the index does not name the print step for it`);
        for (const id of b.shapes || []) printing.set(id, `${key}:${b.id}`);
      }
    }
    const idxDiv = new Set(S.shapes_dividing || []);
    if ([...dividing].sort().join() !== [...idxDiv].sort().join()) faults.push(`${key}: the dividing shapes the index names differ from the declaration under its answers`);
    classifiers.set(key, { dividing, printing, cls: join(K3, M.classifier.file) });
  }
  check("D2  each ledger's files are the bytes the index and the manifest pin, and every branch answer is the answers file's or the resting option", faults.length === 0,
    faults.length ? faults.slice(0, 4).join(" · ") : `${classifiers.size} ledgers · answers file ${existsSync(answersPath) ? "present" : "absent (every branch at rest)"}`);
}

/** t is a run of text's own characters in their own order (code points, not code units) */
const inOrder = (text, t) => { const cs = [...t]; let j = 0; for (const ch of text) if (ch === cs[j]) j += 1; return j === cs.length; };

// D3
if (!ONLY || ONLY === "D3") {
  const faults = []; let rows = 0, divided = 0, printed = 0, noPill = 0;
  for (const [key, C] of classifiers) {
    const { classify } = await import(pathToFileURL(resolve(C.cls)).href);
    for (const [k, row] of (sample[key] || { rows: [] }).rows) {
      rows += 1;
      const text = String(row[1]);
      let marks;
      try { marks = classify(text); } catch { marks = null; }
      // a route the classifier has no shape for is uncovered: the receipt names it, and it stands whole
      const want = marks ? [...new Set(marks.filter((g) => C.dividing.has(g.shape)).map((g) => g.i))].sort((a, b) => a - b) : [];
      const have = Array.isArray(row[7]) ? row[7] : [];
      if (have.length) divided += 1;
      if (JSON.stringify(want) !== JSON.stringify(have)) faults.push(`${key} ${k}#${row[0]}: the ledger divides at [${want}], the row says [${have}]`);
      // the print slot: exactly what the print step gives for the one answered branch whose shapes the row holds
      const rules = marks ? [...new Set(marks.map((g) => C.printing.get(g.shape)).filter(Boolean))] : [];
      let wantPrint = null;
      const none = rules.find((r) => PRINT_RULES[r].kind === "none");   // a row that renders nothing has no pill whatever else its marks say
      if (rules.length > 1 && !none) faults.push(`${key} ${k}#${row[0]}: two print steps reach one row (${rules.join(", ")})`);
      else if (rules.length) { const rule = none || rules[0]; try { const r = printOf(rule, text, marks.filter((g) => C.printing.get(g.shape) === rule), want); wantPrint = r ? r.texts : null; } catch (e) { faults.push(`${key} ${k}#${row[0]}: ${e.message}`); } }
      const havePrint = Array.isArray(row[8]) ? row[8] : null;
      if (havePrint) { if (havePrint.length) printed += 1; else noPill += 1; }
      if (JSON.stringify(wantPrint) !== JSON.stringify(havePrint)) faults.push(`${key} ${k}#${row[0]}: the print step gives ${JSON.stringify(wantPrint)}, the row says ${JSON.stringify(havePrint)}`);
      // and every printed text is the route's own characters, in their order (both walked by code point)
      for (const t of havePrint || []) if (!inOrder(text, t)) faults.push(`${key} ${k}#${row[0]}: «${t}» is not the route's characters in order`);
    }
  }
  if (slotOnUnledgered.length) faults.push(`${slotOnUnledgered.length} rows of unledgered sources carry a slot: ${slotOnUnledgered.slice(0, 3).join(", ")}`);
  check("D3  every sampled row's slots are exactly the marks its source's own classifier divides at and the texts the print step gives under the index's answers; no unledgered row carries one", faults.length === 0,
    faults.length ? faults.slice(0, 4).join(" · ") : `${nf(rows)} rows re-classified over ${classifiers.size} ledgers · ${nf(divided)} divided · ${nf(printed)} print a part · ${nf(noPill)} print no pill · ${nf(rowsSeen)} rows walked`);
}

// D8 — the span store's rows carry the same slots (data/span-store/<book>.json)
if (!ONLY || ONLY === "D8") {
  const SPAN = join(K3, "data", "span-store");
  const faults = []; let rows = 0, ledgered = 0, divided = 0, printed = 0, noPill = 0, books = 0;
  if (!existsSync(join(SPAN, "index.json"))) console.log("  --  D8  no span store on this disk");
  else {
    const spanIndex = JSON.parse(readFileSync(join(SPAN, "index.json"), "utf8"));
    const keyOfSpanM = (m) => ((index.m_sources[m] || {}).key) || (((spanIndex.m_sources || {})[m] || {}).key) || null;
    const loaded = new Map();
    const clsOf = async (key) => { if (!loaded.has(key)) loaded.set(key, (await import(pathToFileURL(resolve(classifiers.get(key).cls)).href)).classify); return loaded.get(key); };
    if (!spanIndex.ledgers || spanIndex.ledgers.rule_id !== L.rule_id) faults.push(`the span store's index names ${spanIndex.ledgers ? spanIndex.ledgers.rule_id : "no rule"}, the store's index ${L.rule_id}`);
    for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
      const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
      if (!file.keys) continue;
      books += 1;
      for (const [k, rs] of Object.entries(file.keys)) for (const r of rs) {
        const row = r.slots; if (!Array.isArray(row)) { faults.push(`${f} ${k}: a row with no slots`); continue; }
        rows += 1;
        const key = keyOfSpanM(String(row[3]));
        const C = key && classifiers.get(key);
        if (!C) { if (row.length !== 7) faults.push(`${f} ${k} (${row[3]}): a row of a source under no ledger carries ${row.length - 7} slot(s) beyond the lane's seven`); continue; }
        ledgered += 1;
        if (row.length < 7 || row.length > 9) { faults.push(`${f} ${k}: ${row.length} slots`); continue; }
        const text = String(row[1]);
        const classify = await clsOf(key);
        let marks; try { marks = classify(text); } catch { marks = null; }
        const want = marks ? [...new Set(marks.filter((g) => C.dividing.has(g.shape)).map((g) => g.i))].sort((a, b) => a - b) : [];
        const have = Array.isArray(row[7]) ? row[7] : [];
        if (have.length) divided += 1;
        if (JSON.stringify(want) !== JSON.stringify(have)) faults.push(`${f} ${k} (${row[3]}): the ledger divides at [${want}], the span row says [${have}]`);
        const rules = marks ? [...new Set(marks.map((g) => C.printing.get(g.shape)).filter(Boolean))] : [];
        let wantPrint = null;
        const none = rules.find((x) => PRINT_RULES[x].kind === "none");
        if (rules.length > 1 && !none) faults.push(`${f} ${k} (${row[3]}): two print steps reach one span row`);
        else if (rules.length) { const rule = none || rules[0]; try { const pr = printOf(rule, text, marks.filter((g) => C.printing.get(g.shape) === rule), want); wantPrint = pr ? pr.texts : null; } catch (e) { faults.push(`${f} ${k}: ${e.message}`); } }
        const havePrint = Array.isArray(row[8]) ? row[8] : null;
        if (havePrint) { if (havePrint.length) printed += 1; else noPill += 1; }
        if (JSON.stringify(wantPrint) !== JSON.stringify(havePrint)) faults.push(`${f} ${k} (${row[3]}): the print step gives ${JSON.stringify(wantPrint)}, the span row says ${JSON.stringify(havePrint)}`);
        for (const t of havePrint || []) if (!inOrder(text, t)) faults.push(`${f} ${k}: «${t}» is not the span row's characters in order`);
      }
    }
    const sc = (spanIndex.ledgers || {}).counts || {};
    if (sc.rows !== undefined && (sc.rows !== rows || sc.rows_of_ledgered_sources !== ledgered || sc.rows_dividing !== divided)) faults.push(`the span store's index counts ${sc.rows} rows, ${sc.rows_of_ledgered_sources} ledgered, ${sc.rows_dividing} dividing; the files hold ${rows}, ${ledgered}, ${divided}`);
    check("D8  every span-store row of a ledgered source carries the slots its source's own classifier gives under the index's answers, and no other row carries one", faults.length === 0,
      faults.length ? faults.slice(0, 4).join(" · ") : `${books} books · ${nf(rows)} span rows, ${nf(ledgered)} of ledgered sources re-classified · ${nf(divided)} divided · ${nf(printed)} print a part · ${nf(noPill)} print no pill`);
  }
}

// D4 — the page's function, read out of the page
if (!ONLY || ONLY === "D4") {
  const zone = readFileSync(join(K3, "zone.html"), "utf8");
  const grab = (head, end) => { const a = zone.indexOf(head); if (a < 0 || zone.indexOf(head, a + 1) >= 0) throw new Error(`zone.html does not hold exactly one "${head.trim()}"`); const b = zone.indexOf(end, a); return zone.slice(a, b + end.length); };
  let pageFn = null, why = "";
  try {
    pageFn = new Function("index", `${grab("\n  const readingSplit = (text) => {\n", "\n  };\n")}${grab("\n  const senseSplit = (text) => {\n", "\n  };\n")}${grab("\n  const readingsOfRow = (row, damagedWhole = false) => {\n", "\n  };\n")} return readingsOfRow;`)(index);
  } catch (e) { why = e.message; }
  const faults = []; let rows = 0;
  if (pageFn) {
    for (const key of Object.keys(sample)) for (const [k, row] of sample[key].rows) {
      rows += 1;
      const a = JSON.stringify(store.readingsOf(row)), b = JSON.stringify(pageFn(row));
      if (a !== b) faults.push(`${k}#${row[0]} ${row[3]}: store ${a.slice(0, 60)}, page ${b.slice(0, 60)}`);
    }
    // and the generic rule, on the unledgered source's rows
    let generic = 0;
    for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort().slice(0, 24)) {
      const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
      for (const [k, rs] of Object.entries(body)) for (const row of rs) {
        const src = index.m_sources[row[3]]; if (!src || src.ledger) continue;
        generic += 1;
        const a = JSON.stringify(store.readingsOf(row)), b = JSON.stringify(pageFn(row));
        if (a !== b) faults.push(`${k}#${row[0]} ${row[3]} (generic): store ${a.slice(0, 60)}, page ${b.slice(0, 60)}`);
      }
    }
    rows += generic;
  }
  check("D4  the store's readingsOf and the page's readingsOfRow give the same readings for every sampled row", !!pageFn && faults.length === 0,
    !pageFn ? `the page's function could not be read: ${why}` : faults.length ? faults.slice(0, 3).join(" · ") : `${nf(rows)} rows agree`);
}

// ---- the page: open a served word's card and read its pills -------------------------
// a served word whose rows satisfy `want(rows)`: the first such row, with the word's place on the page
const findWord = (zonesServed, want) => {
  for (const b of zonesServed()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
    for (const sec of z.sections || []) for (const w of sec.words || []) {
      const ks = w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : [];
      for (const k of ks) {
        const rows = (store.routesFor(k) || []).filter((r) => index.m_sources[r[3]]);
        const row = want(rows);
        if (row) return { book: b, label: sec.label, key: k, row, surface: w.s };
      }
    }
  }
  return null;
};
// the card's pills for a pick, with the overlays' sources off so every pill stands on a store row; null where the word or the card is not found
const pillsOnCard = async (pw, launchOptions, defaultZoneUrl, pick) => {
  const br = await pw.chromium.launch(launchOptions());
  const p = await br.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  const OV_DIR = join(K3, "data", "overlays");
  const OV_IDS = existsSync(OV_DIR) ? readdirSync(OV_DIR).filter((d) => existsSync(join(OV_DIR, d, "index.json")))
    .flatMap((d) => Object.keys(JSON.parse(readFileSync(join(OV_DIR, d, "index.json"), "utf8")).m_sources || {})) : [];
  await p.addInitScript((ids) => { try { localStorage.clear(); localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* a device that remembers nothing still reads */ } }, OV_IDS);
  const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
  await p.goto(`${BASE}?b=${pick.book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const opened = await p.evaluate(async ({ label, surface }) => {
    let g = 0;
    while (g < 5000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 8)); g += 1; }
    const secs = [...document.querySelectorAll("section.seg")];
    const sec = secs.find((s) => (s.dataset.label || s.getAttribute("data-label") || s.querySelector(".ref, .seg-ref, h2, h3")?.textContent || "").trim().endsWith(label));
    const wbs = [...(sec || document).querySelectorAll(".he-text .wb")];
    const wb = wbs.find((x) => (x.querySelector(".he, .hw, .w")?.textContent || x.textContent || "").includes(surface));
    if (!wb) return null;
    wb.scrollIntoView({ block: "center" }); wb.click();
    return true;
  }, { label: pick.label, surface: pick.surface });
  let got = null;
  if (opened) {
    const ok = await p.waitForSelector("#hud .r-pills button", { timeout: 15000 }).then(() => true).catch(() => false);
    if (ok) got = await p.evaluate(() => [...document.querySelectorAll("#hud .r-pills button")].map((x) => x.textContent.trim()));
  }
  await br.close();
  return { opened, got };
};

// D5 — on the page
if (!ONLY || ONLY === "D5") {
  const { loadPlaywright, launchOptions } = await import("./playwright-v1.mjs");
  const { defaultZoneUrl, zonesServed } = await import("./zones-on-disk-v1.mjs");
  const pw = await loadPlaywright();
  // a served word whose ledgered row the generic rule would divide and whose row has no slot
  const pick = findWord(zonesServed, (rows) => rows.find((r) => {
            if (!index.m_sources[r[3]].ledger || Array.isArray(r[7]) || Array.isArray(r[8]) || !/,/u.test(String(r[1])) || store.packSplit(String(r[1])).length !== 1) return false;
            // a list of short glosses, so every generic piece is a piece and none is the whole text
            const whole = String(r[1]).trim().toLowerCase();
            const pieces = store.readingSplit(String(r[1])).readings.map((x) => x.toLowerCase());
            if (pieces.length < 2 || pieces.includes(whole)) return false;
            // no other row under this key offers any of those pieces, nor the whole text
            const others = new Set(rows.filter((o) => o !== r).flatMap((o) => store.readingsOf(o).map((x) => x.toLowerCase())));
            return pieces.every((pc) => !others.has(pc)) && !others.has(String(r[1]).trim().toLowerCase());
          }));
  if (!pick) check("D5  a ledgered row the generic rule would divide stands on the page as its ledger says", false, "no served word carries such a row");
  else {
    const { opened, got } = await pillsOnCard(pw, launchOptions, defaultZoneUrl, pick);
    const whole = String(pick.row[1]).trim();
    const pieces = store.readingSplit(whole).readings.filter((pc) => pc.trim().toLowerCase() !== whole.toLowerCase());
    const wholeShown = got ? got.some((t) => t.toLowerCase() === whole.toLowerCase().replace(/\/\s*/gu, " + ").replace(/\.$/u, "") || t.toLowerCase() === whole.toLowerCase()) : false;
    const pieceShown = got ? pieces.some((pc) => got.some((t) => t.toLowerCase() === pc.toLowerCase())) : false;
    check("D5  a ledgered row the generic rule would divide stands on the page as its ledger says: one pill, none of the generic pieces", !!got && wholeShown && !pieceShown,
      !opened ? `${pick.book} ${pick.label} ${pick.surface}: the word was not found on the page` : !got ? `${pick.book} ${pick.label}: the card did not open` : `${pick.book} ${pick.label} ${pick.key} · «${whole.slice(0, 50)}» ${wholeShown ? "shown whole" : "NOT shown whole"}${pieceShown ? " · a generic piece is also offered" : ""} · ${got.length} pills`);
  }
}

// D6 — on the page: a row that prints a part of itself
if (!ONLY || ONLY === "D6") {
  const { loadPlaywright, launchOptions } = await import("./playwright-v1.mjs");
  const { defaultZoneUrl, zonesServed } = await import("./zones-on-disk-v1.mjs");
  const pw = await loadPlaywright();
  // a served word with a row that prints one part, where no other row under the key offers the row's whole text
  const pick = findWord(zonesServed, (rows) => rows.find((r) => {
    if (!index.m_sources[r[3]].ledger || !Array.isArray(r[8]) || r[8].length !== 1 || r[8][0] === String(r[1]).trim()) return false;
    const whole = String(r[1]).trim().toLowerCase();
    return !rows.some((o) => o !== r && store.readingsOf(o).some((x) => x.toLowerCase() === whole));
  }));
  if (!pick) check("D6  a row that prints a part of itself offers the part on the page", false, "no served word carries such a row");
  else {
    const { opened, got } = await pillsOnCard(pw, launchOptions, defaultZoneUrl, pick);
    const whole = String(pick.row[1]).trim(), part = pick.row[8][0];
    const partShown = got ? got.some((t) => t.toLowerCase() === part.toLowerCase()) : false;
    const wholeShown = got ? got.some((t) => t.toLowerCase() === whole.toLowerCase()) : false;
    check("D6  a row that prints a part of itself offers the part on the page, and not its whole text", !!got && partShown && !wholeShown,
      !opened ? `${pick.book} ${pick.label} ${pick.surface}: the word was not found on the page` : !got ? `${pick.book} ${pick.label}: the card did not open` : `${pick.book} ${pick.label} ${pick.key} · «${whole.slice(0, 50)}» prints «${part}»: ${partShown ? "offered" : "NOT offered"}${wholeShown ? " · the whole text is offered too" : ""} · ${got.length} pills`);
  }
}

// D7 — on the page: a row that prints no pill
if (!ONLY || ONLY === "D7") {
  const { loadPlaywright, launchOptions } = await import("./playwright-v1.mjs");
  const { defaultZoneUrl, zonesServed } = await import("./zones-on-disk-v1.mjs");
  const pw = await loadPlaywright();
  // a served word with a row that prints no pill, where no other row under the key offers the row's text, and some row offers something
  const pick = findWord(zonesServed, (rows) => rows.find((r) => {
    if (!index.m_sources[r[3]].ledger || !Array.isArray(r[8]) || r[8].length !== 0) return false;
    const whole = String(r[1]).trim().toLowerCase();
    return rows.some((o) => o !== r && store.readingsOf(o).length) && !rows.some((o) => o !== r && store.readingsOf(o).some((x) => x.toLowerCase() === whole));
  }));
  if (!pick) check("D7  a row that prints no pill offers nothing on the page", false, "no served word carries such a row");
  else {
    const { opened, got } = await pillsOnCard(pw, launchOptions, defaultZoneUrl, pick);
    const whole = String(pick.row[1]).trim();
    const wholeShown = got ? got.some((t) => t.toLowerCase() === whole.toLowerCase()) : false;
    check("D7  a row that prints no pill offers nothing on the page", !!got && !wholeShown,
      !opened ? `${pick.book} ${pick.label} ${pick.surface}: the word was not found on the page` : !got ? `${pick.book} ${pick.label}: the card did not open` : `${pick.book} ${pick.label} ${pick.key} · «${whole.slice(0, 50)}» ${wholeShown ? "IS offered" : "not offered"} · ${got.length} pills`);
  }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
