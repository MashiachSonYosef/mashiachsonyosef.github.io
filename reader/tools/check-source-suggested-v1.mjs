#!/usr/bin/env node
// check-source-suggested-v1 · the BSB's whole-word rendering stands on the card, credited, and never on the line
//
// GUARDS: source-suggested-rule-v1-a-running-bible-reads-the-whole-word-and-is-credited-by-name
// LEDGER: -
// no frame letter. This writes nothing: it reads data/source-suggested/ (written
// by tools/project-source-suggested-v1.mjs) and the page.
//
// S1  the ledger on disk: every book's file lays its places on the zone's own
//     words (0 mismatched), laid + held = the lane's places, the index's
//     totals are the files' sums and the lane's 304,605 renderings over
//     305,431 places, and the credit carries the licence's two paragraphs
// S2  with the switch off, no card carries the BSB's row, and the rail's row
//     stands off
// S3  with the switch on, the first book on the shelf's first word's card
//     reads the BSB's own cell for it (the file's rendering, its spaces kept
//     in the title), credited BSB under Public Domain; the first DASH cell in
//     the book's opening sections says in words what the BSB means by it
//     (the book, the words and the cells are read off the shelf and the
//     file, never typed: no check names a work)
// S4  the switch moves the card only: the line under every word of 1:1 is the
//     same with it on and off
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const PORT = process.env.SERVE_PORT || "8899";   // the runner serves 8899; a hand run says its own
let bad = 0;
const check = (name, ok, say) => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${say ? `  ·  ${say}` : ""}`); if (!ok) bad += 1; };

// S1 — the files
const ix = JSON.parse(readFileSync("data/source-suggested/index.json", "utf8"));
const files = readdirSync("data/source-suggested").filter((f) => f.endsWith(".json") && f !== "index.json").sort();
let places = 0, laid = 0, held = 0, mismatched = 0, badFiles = [];
for (const f of files) {
  const F = JSON.parse(readFileSync(`data/source-suggested/${f}`, "utf8"));
  const z = JSON.parse(gunzipSync(readFileSync(`data/zones/${F.book}.bin`)).toString("utf8"));
  let n = 0; for (const s of z.sections || []) n += (s.words || []).length;
  const c = F.counts;
  places += c.places; laid += c.laid; held += c.held; mismatched += c.mismatched;
  const laidN = F.places.filter(Boolean).length, heldN = Object.keys(F.held || {}).length;
  if (!(F.candidate_only === true && F.places.length === n && laidN === c.laid && heldN === c.held && c.laid + c.held + c.mismatched === c.places && F.from && /^[0-9a-f]{64}$/.test(F.from.sha256) && F.from.relay === "FOR-ELIJAH-v63.1.md")) badFiles.push(F.book);
}
check("S1  every book's file lays the lane's places on the zone's own words, and says where it came from",
  files.length === 39 && mismatched === 0 && badFiles.length === 0 && ix.totals.places === places && ix.totals.laid === laid && laid === 304605 && places === 305431,
  `${files.length} books · ${places.toLocaleString()} places · ${laid.toLocaleString()} laid · ${held.toLocaleString()} held · ${mismatched} mismatched${badFiles.length ? ` · astray: ${badFiles.join(", ")}` : ""}`);
const m = ix.m || {};
check("    and the credit carries the BSB's name and its licence's two paragraphs",
  m.credit_line === "Berean Standard Bible (BSB)" && Array.isArray(m.licence_text) && m.licence_text.length === 2 && /public domain/.test(m.licence_text[0]) && /freely permitted/.test(m.licence_text[1]) && m.year === 2023,
  `${m.credit_line} · ${(m.licence_text || []).map((t) => t.length).join(" + ")} bytes · ${m.year}`);

// S2-S4 — the page: the first book on the shelf, its first word, and the first
// DASH cell among its opening sections (built at load), read off the file
// the first book on the shelf: the first the served index names, in its own order
const BOOK = Object.keys(ix.books).sort()[0];
const FILE = JSON.parse(readFileSync(`data/source-suggested/${BOOK}.json`, "utf8"));
const Z = JSON.parse(gunzipSync(readFileSync(`data/zones/${BOOK}.bin`)).toString("utf8"));
const firstLabel = Z.sections[0].label;
const firstCell = FILE.places[0];
// a word whose own card opens on a press: not a chain's part, not inside a run
const covered = new Set();
for (const f of [`data/hud-runs/${BOOK}.json`, `data/run-cards/${BOOK}.json`]) { try { for (const c of JSON.parse(readFileSync(f, "utf8")).cards || []) for (const i of c.idx) covered.add(`${c.unit}:${i}`); } catch { /* no such lane on this book */ } }
const joined = (w) => !!(w.presentation_join && (w.presentation_join.join_next_without_separator || w.presentation_join.join_previous_without_separator));
// the first sign cell (a dash, three dots, vvv or an empty cell) on a word
// that stands alone, anywhere in the book; its section is built on the way
const SAYS = { DASH: "leaves this word without English", THREE_DOTS: "the neighboring English carries it", VVV: "the neighboring English carries it", EMPTY: "the BSB's cell is empty" };
let dash = null;
{ let n = 0; for (const [si, sec] of Z.sections.entries()) for (const [wi, w] of (sec.words || []).entries()) { n += 1; const at = FILE.places[n - 1]; if (!dash && at && SAYS[at[1]] && !w.mark && !joined(w) && !covered.has(`${sec.unit}:${wi}`)) dash = { label: sec.label, secIdx: si, wordIdx: wi, cell: at[0], kind: at[1], id: sec.unit }; } }
check(`    the first book on the shelf (${BOOK}) opens with a rendered cell and a sign cell stands on a word of its own`, !!(firstCell && firstCell[1] === "WORDS" && dash),
  `${firstLabel} word 1 ${JSON.stringify(firstCell ? firstCell[0] : null)} · ${dash ? `${dash.kind} at ${dash.label} word ${dash.wordIdx + 1}` : "no sign cell on a word of its own"}`);
const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
const open = async (on) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((on) => { try { localStorage.setItem("fh.suggested", on ? "bsb" : "off"); } catch { /* a device that remembers nothing still reads */ } }, on);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`http://127.0.0.1:${PORT}/zone.html?b=${BOOK}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(600);
  const r = await p.evaluate(async ([firstLabel, dashLabel, dashIdx]) => {
    const wait = (ms) => new Promise((x) => setTimeout(x, ms));
    const secOf = (label) => [...document.querySelectorAll("section.seg")].find((s) => s.querySelector(".vnum")?.textContent === label);
    const s = secOf(firstLabel);
    const wbs = [...s.querySelectorAll(".he-text .wb")];
    const lines = wbs.map((w) => (w.querySelector(":scope > .g") || w.closest(".wjoin")?.querySelector(":scope > .g") || { textContent: "" }).textContent);
    const cardOf = async (w) => {
      (w.querySelector(".w span") || w.querySelector(".w")).click();
      const t0 = Date.now(); while (Date.now() - t0 < 8000 && !document.querySelector("#hud .r-pills button")) await wait(50);
      await wait(500);
      const sug = document.querySelector("#hud .r-sug");
      const out = { has: !!sug, text: sug ? sug.textContent.trim() : "", title: sug ? (sug.querySelector("b") || {}).title || "" : "", chip: sug ? (sug.querySelector(".g-lic") || {}).textContent || "" : "", chipTitle: sug ? (sug.querySelector(".g-lic") || {}).title || "" : "" };
      const x = document.querySelector("#hud .head button"); if (x) x.click(); await wait(150);
      return out;
    };
    let ds = secOf(dashLabel);
    if (ds && !ds.querySelector(".he-text")) { ds.scrollIntoView({ block: "center" }); const t0 = Date.now(); while (Date.now() - t0 < 8000 && !ds.querySelector(".he-text")) await wait(100); await wait(300); }
    const dwb = ds ? [...ds.querySelectorAll(".he-text .wb")][dashIdx] : null;
    const rail = [...document.querySelectorAll('.rail .row[data-toggle="suggested"] button')].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true", dead: x.disabled }));
    return { lines, first: await cardOf(wbs[0]), dash: dwb ? await cardOf(dwb) : { has: false, text: "no such word built" }, rail, state: window.__suggested || null };
  }, [firstLabel, dash ? dash.label : "", dash ? dash.wordIdx : 0]);
  await ctx.close();
  return r;
};
const off = await open(false), on = await open(true);
const shown = String(firstCell[0]).trim();
check("S2  switched off: no card carries the BSB's row, and the rail's row stands off", !off.first.has && !off.dash.has && off.rail.some((x) => x.t === "off" && x.on) && !off.rail.some((x) => x.dead),
  `rail ${off.rail.map((x) => `${x.t}${x.on ? " (on)" : ""}${x.dead ? " (dead)" : ""}`).join(" | ")}`);
check(`S3  switched on: ${BOOK} ${firstLabel}'s first word reads the BSB's own cell, credited BSB, Public Domain`,
  on.first.has && on.first.text.includes(shown) && on.first.title.includes(JSON.stringify(String(firstCell[0]))) && on.first.chip === "Public Domain" && /Berean Standard Bible/.test(on.first.chipTitle),
  `${on.first.text.slice(0, 90)} · title ${on.first.title.slice(0, 60)} · chip ${on.first.chip}`);
check(`    and the ${dash ? dash.kind : "sign"} cell at ${dash ? dash.label : "?"} is said in words`, !!dash && on.dash.has && /^source suggested/.test(on.dash.text) && on.dash.text.includes(SAYS[dash.kind]) && on.dash.title.includes(JSON.stringify(String(dash.cell))),
  on.dash.text.slice(0, 120));
check(`S4  the switch moves the card only: the line under every word of ${firstLabel} is the same on and off`,
  JSON.stringify(on.lines) === JSON.stringify(off.lines) && on.lines.length === off.lines.length,
  `${off.lines.length} words · ${on.lines.filter((t, i) => t !== off.lines[i]).length} differ`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
