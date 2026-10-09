#!/usr/bin/env node
// check-hud-toggles-v1 · each part of the megacompspan family is a safe switch: the cells re-lay from the lattice the corpus lane cut for it
//
// GUARDS: hud-toggles-rule-v1-a-part-of-the-family-turned-off-re-lays-the-huds-from-the-groups-that-stand
// LEDGER: -
// no frame letter. This writes nothing: it reads data/hud-toggles/ (written by
// tools/project-hud-toggles-v1.mjs) and the page.
//
// G1  the ledger on disk: 39 books; in each the lane's tie holds in its own
//     figures and the projector's tie holds here (the all-on, entry's-own
//     runs are the served HUD runs file's, id for id and kind for kind, on
//     one record); every set's run list points inside the book's run table;
//     the index's counts are the files'
// G2  both switches at the page's default: the lanes are the served HUD
//     runs file's (nothing fetched), and the first served HUD of the first
//     book on the shelf whose head is an ink chain stands in one cell
// G3  license runs off: no run cell stands in the built sections, the run
//     cards are off too, and the chain inside that HUD stands as the ink
//     joins it with the two words after it each its own cell
// G4  the maqaf as separate words: the chain's first word stands as its own
//     cell with its own line, the run the lattice keeps over the three words
//     after it is one cell, and a chain no run holds is two cells
// G5  any naming (the record's ALL): in the first section on the shelf where
//     the ALL admission lays two or more runs and the entry's own lays none,
//     every run stands as one run cell, as the ALL/UNION branch has them
// G6  a switch moves the page without a reload: pressed on the rail, the
//     built sections re-lay in place, the word count is unchanged, and a
//     card opens on a re-laid word
// Every word, book and verse asked for is read off the zones, the sidecars
// and the served files, never typed (scope-derived: no check names a work).
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { existsSync } from "node:fs";
const PORT = process.env.SERVE_PORT || "8899";   // the runner serves 8899; a hand run says its own
let bad = 0;
const check = (name, ok, say) => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${say ? `  ·  ${say}` : ""}`); if (!ok) bad += 1; };

// G1 — the files
const ix = JSON.parse(readFileSync("data/hud-toggles/index.json", "utf8"));
const files = readdirSync("data/hud-toggles").filter((f) => f.endsWith(".json") && f !== "index.json").sort();
let runsTotal = 0; const astray = [];
for (const f of files) {
  const F = JSON.parse(readFileSync(`data/hud-toggles/${f}`, "utf8"));
  const H = JSON.parse(readFileSync(`data/hud-runs/${F.book}.json`, "utf8"));
  const inside = Object.values(F.sets).every((l) => Array.isArray(l) && l.every((n) => Number.isInteger(n) && n >= 0 && n < F.runs.length));
  const tieLane = F.tie && F.tie.lane && F.tie.lane["ALL_ON/OWN vs OWN/UNION"] && F.tie.lane["ALL_ON/OWN vs OWN/UNION"].holds === true && F.tie.lane["ALL_ON/ALL vs ALL/UNION"].holds === true;
  const here = F.tie && F.tie.here && F.tie.here.holds === true && F.tie.here.served_runs === H.cards.length;
  // asked again now, not read off the receipt: the all-on, entry's-own runs are the served file's
  const own = (F.sets["ALL_ON/OWN"] || []).map((n) => F.runs[n]);
  const served = new Map(H.cards.map((c) => [`${c.unit}:${c.idx.join(",")}`, c]));
  const same = own.filter((r) => { const c = served.get(`${r[0]}:${r[1].join(",")}`); return c && c.kind === r[3] && c.hud === r[4]; }).length;
  const counts = ix.books[F.book] && ix.books[F.book].runs === F.runs.length && Object.entries(ix.books[F.book].sets).every(([k, v]) => (F.sets[k] || []).length === v);
  runsTotal += F.runs.length;
  if (!(F.candidate_only === true && F.from && /^[0-9a-f]{64}$/.test(F.from.sha256) && F.from.relay === "FOR-ELIJAH-v66.md" && inside && tieLane && here && same === own.length && same === H.cards.length && counts)) astray.push(F.book);
}
check("G1  every book's file ties to the served HUD runs, and its sets point inside its run table",
  files.length === 39 && astray.length === 0 && ix.totals.runs === runsTotal && ix.candidate_only === true,
  `${files.length} books · ${runsTotal.toLocaleString()} distinct runs${astray.length ? ` · astray: ${astray.join(", ")}` : ""}`);

// G2-G6 — the page
const strip = (t) => String(t || "").replace(/[\u0591-\u05bd\u05bf-\u05c7]/gu, "");
const sectionOf = (book, unit) => { const z = JSON.parse(gunzipSync(readFileSync(`data/zones/${book}.bin`)).toString("utf8")); return z.sections.find((s) => s.unit === unit); };
const surfaces = (sec, idx) => idx.map((i) => strip(sec.words[i].s));
const runsIn = (book, set, unit) => { const F = JSON.parse(readFileSync(`data/hud-toggles/${book}.json`, "utf8")); return (F.sets[set] || []).map((n) => F.runs[n]).filter((r) => r[0] === unit).map((r) => r[1]); };
const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
const open = async (book, pref) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((pref) => { try { localStorage.setItem("fh.maqaf-join", pref.maqaf); localStorage.setItem("fh.runs", pref.runs); } catch { /* a device that remembers nothing still reads */ } }, pref);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`http://127.0.0.1:${PORT}/zone.html?b=${book}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(500);
  return { ctx, p };
};
const cellsOf = (p, label) => p.evaluate(([label]) => {
  const strip = (t) => String(t || "").replace(/[\u0591-\u05bd\u05bf-\u05c7]/gu, "");
  const s = [...document.querySelectorAll("section.seg")].find((s) => s.querySelector(".vnum")?.textContent === label);
  if (!s) return null;
  const out = [];
  for (const el of s.querySelector(".he-text").children) {
    if (el.classList.contains("wjoin")) out.push({ join: el.classList.contains("lic") ? "run" : "chain", words: [...el.querySelectorAll(":scope > .wj-ink > .wb > .w")].map((w) => strip(w.textContent)), line: !!el.querySelector(":scope > .g") });
    else if (el.classList.contains("wb") && !el.classList.contains("mark")) out.push({ word: strip((el.querySelector(":scope > .w") || {}).textContent), line: !!el.querySelector(":scope > .g") });
  }
  const built = [...document.querySelectorAll("section.seg .he-text")];
  return { cells: out, toggles: window.__hudToggles || null, runs: window.__hudRuns || null, runCards: window.__runCards, builtSections: built.length, runCells: built.reduce((n, h) => n + h.querySelectorAll(".wjoin.lic").length, 0), words: built.reduce((n, h) => n + h.querySelectorAll(".wb:not(.mark)").length, 0) };
}, [label]);
const find = (cells, words) => cells.find((c) => c.join && c.words.join(" ") === words.join(" "));
const alone = (cells, word) => cells.find((c) => c.word === word);
const say = (cells, from, to) => cells.map((c) => (c.join ? `[${c.join}: ${c.words.join(" ")}]` : c.word)).slice(from, to).join(" ");

// THE FIRST BOOK ON THE SHELF: its first served HUD run whose head is an ink
// chain of exactly two words with two or more words after it; the chain's
// first word, and the run the maqaf-off lattice keeps from its second word on
const zoneOf = (book) => JSON.parse(gunzipSync(readFileSync(`data/zones/${book}.bin`)).toString("utf8"));
const isChainHead = (sec, i) => !!(sec.words[i] && sec.words[i].presentation_join && sec.words[i].presentation_join.join_next_without_separator);
// the first book on the shelf: the first the served HUD runs index names, in its own order
const BOOK_A = Object.keys(JSON.parse(readFileSync("data/hud-runs/index.json", "utf8")).books).sort()[0];
const ZA = zoneOf(BOOK_A);
const hudA = JSON.parse(readFileSync(`data/hud-runs/${BOOK_A}.json`, "utf8")).cards.find((c) => { const sec = ZA.sections.find((x) => x.unit === c.unit); return sec && c.idx.length >= 4 && isChainHead(sec, c.idx[0]) && !isChainHead(sec, c.idx[1]); });
const A = hudA ? ZA.sections.find((x) => x.unit === hudA.unit) : null;
const labelA = A ? A.label : "";
const four = hudA ? surfaces(A, hudA.idx) : [];
const chainIdx = hudA ? hudA.idx.slice(0, 2) : [], restIdx = hudA ? hudA.idx.slice(2) : [];
const firstChain = A ? A.words.findIndex((w, i) => isChainHead(A, i) && !hudA.idx.includes(i) && !hudA.idx.includes(i + 1)) : -1;
const plainChain = A && firstChain >= 0 ? surfaces(A, [firstChain, firstChain + 1]) : [];
// with the maqaf off the lattice keeps the run from the chain's second word on (the head stands alone)
const keptRun = hudA ? runsIn(BOOK_A, "ALL_BUT_P1/OWN", hudA.unit).find((idx) => idx.includes(chainIdx[1]) && !idx.includes(chainIdx[0])) : null;
const servedA = hudA ? JSON.parse(readFileSync(`data/hud-runs/${BOOK_A}.json`, "utf8")).cards.length : 0;
check(`    the first book on the shelf (${BOOK_A}) offers a served HUD whose head is a two-word chain, and a kept run beside it`, !!hudA && firstChain >= 0 && !!keptRun,
  hudA ? `${BOOK_A} ${labelA} · ${four.join(" ")} · kept ${keptRun ? keptRun.join(",") : "none"}` : "no such HUD");
// THE FIRST SECTION ON THE SHELF where any naming lays two or more runs of
// plain words (no chain inside) and the entry's own naming lays none, with
// no run card on it, among a book's first six sections (built at load)
let BOOK_G = null, G = null, gRuns = [], gAll = 0;
for (const book of Object.keys(ix.books).sort()) {
  const F = JSON.parse(readFileSync(`data/hud-toggles/${book}.json`, "utf8"));
  const byUnit = (set) => { const m = new Map(); for (const n of F.sets[set] || []) { const r = F.runs[n]; if (!m.has(r[0])) m.set(r[0], []); m.get(r[0]).push(r[1]); } return m; };
  const all = byUnit("ALL_ON/ALL"), own = byUnit("ALL_ON/OWN");
  const rcPath = `data/run-cards/${book}.json`;
  const rcUnits = new Set(existsSync(rcPath) ? (JSON.parse(readFileSync(rcPath, "utf8")).cards || []).map((c) => c.unit) : []);
  const z = zoneOf(book);
  const sec = z.sections.slice(0, 6).find((x) => (all.get(x.unit) || []).length >= 2 && !(own.get(x.unit) || []).length && !rcUnits.has(x.unit) && (all.get(x.unit) || []).every((idx) => idx.every((i) => !isChainHead(x, i))));
  if (sec) { BOOK_G = book; G = sec; gRuns = all.get(sec.unit); gAll = (F.sets["ALL_ON/ALL"] || []).length; break; }
}
check(`    and a section on the shelf where any naming lays runs and the entry's own lays none`, !!G, G ? `${BOOK_G} ${G.label} · ${gRuns.length} runs under any naming` : "none found");
// G2
{ const { ctx, p } = await open(BOOK_A, { maqaf: "maqaf", runs: "own" }); const r = await cellsOf(p, labelA);
  const cell = find(r.cells, four);
  check(`G2  at the default the lanes are the served HUD runs (nothing fetched) and ${BOOK_A} ${labelA}'s HUD is one cell`,
    !!hudA && r.toggles && r.toggles.set === "hud-runs" && r.toggles.file === false && r.runs && r.runs.cards === servedA && r.runs.laid > 0 && !!cell && cell.join === "run",
    `set ${r.toggles && r.toggles.set} · file fetched ${r.toggles && r.toggles.file} · ${r.runs && r.runs.cards} HUD runs, ${r.runs && r.runs.laid} laid beside the run cards · ${cell ? `[run: ${cell.words.join(" ")}]` : "no such cell"}`);
  await ctx.close(); }
// G3
{ const { ctx, p } = await open(BOOK_A, { maqaf: "maqaf", runs: "off" }); const r = await cellsOf(p, labelA);
  const chain = find(r.cells, surfaces(A, chainIdx));
  check("G3  license runs off: no run cell in the built sections, no run card, and the chain at the HUD's head stands as the ink joins it",
    r.toggles && r.toggles.set === "ALL_BUT_P2/OWN" && r.runCells === 0 && r.runCards === 0 && !!chain && chain.join === "chain" && surfaces(A, restIdx).every((w) => !!alone(r.cells, w)),
    `set ${r.toggles && r.toggles.set} · ${r.runCells} run cells over ${r.builtSections} built sections · ${r.runCards} run cards · ${say(r.cells, 12, 18)}`);
  await ctx.close(); }
// G4
{ const { ctx, p } = await open(BOOK_A, { maqaf: "pieces", runs: "own" }); const r = await cellsOf(p, labelA);
  const head = alone(r.cells, surfaces(A, [chainIdx[0]])[0]), run = keptRun ? find(r.cells, surfaces(A, keptRun)) : null;
  check("G4  the maqaf as separate words: the chain's head its own cell with its own line, the run the lattice keeps one cell, a plain chain two cells",
    r.toggles && r.toggles.set === "ALL_BUT_P1/OWN" && !!keptRun && !!head && head.line && !!run && run.join === "run" && run.line && plainChain.every((w) => !!alone(r.cells, w)) && !find(r.cells, plainChain),
    `set ${r.toggles && r.toggles.set} · ${r.runs && r.runs.laid} HUD runs laid · ${say(r.cells, 12, 19)}`);
  await ctx.close(); }
// G5 and G6: the derived section under any naming, then pressed back to the entry's own
{ const { ctx, p } = await open(BOOK_G, { maqaf: "maqaf", runs: "all" }); const r = await cellsOf(p, G.label);
  const cells = gRuns.map((idx) => find(r.cells, surfaces(G, idx)));
  check(`G5  any naming: every run the lattice lays over ${BOOK_G} ${G.label} stands as one run cell, as the ALL/UNION branch has them`,
    r.toggles && r.toggles.set === "ALL_ON/ALL" && gRuns.length >= 2 && cells.every((c) => c && c.join === "run") && r.runs && r.runs.cards === gAll,
    `set ${r.toggles && r.toggles.set} · ${gRuns.length} runs in ${G.label} · ${r.runs && r.runs.cards} runs in the set, ${r.runs && r.runs.laid} laid beside the run cards · ${say(r.cells, 0, 8)}`);
  const before = await cellsOf(p, G.label);
  await p.evaluate(() => { const d = document.querySelector('.rail .row[data-toggle="runs"]'); let x = d; while (x) { if (x.tagName === "DETAILS") x.open = true; x = x.parentElement; } [...d.querySelectorAll("button")].find((b) => b.textContent === "the entry\u2019s own").click(); });
  await p.waitForTimeout(1200);
  const after = await cellsOf(p, G.label);
  const card = await p.evaluate(async ([label]) => { const s = [...document.querySelectorAll("section.seg")].find((s) => s.querySelector(".vnum")?.textContent === label); const w = s.querySelector(".he-text .wb .w span") || s.querySelector(".he-text .wb .w"); w.click(); await new Promise((x) => setTimeout(x, 1500)); const h = document.getElementById("hud"); return !h.hidden && h.querySelectorAll(".r-pills button").length > 0; }, [G.label]);
  const relaid = await p.evaluate(() => window.__hudRelaid || 0);
  const firstRun = surfaces(G, gRuns[0]);
  check("G6  a switch pressed on the rail re-lays the built sections in place: the run cells go, the words stay, a card opens",
    after.toggles && after.toggles.set === "hud-runs" && !find(after.cells, firstRun) && !!alone(after.cells, firstRun[0]) && after.words === before.words && after.builtSections === before.builtSections && relaid >= before.builtSections && card,
    `relaid ${relaid} of ${before.builtSections} built sections · words ${before.words} → ${after.words} · card ${card}`);
  await ctx.close(); }
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
