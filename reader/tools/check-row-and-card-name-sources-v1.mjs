#!/usr/bin/env node
// RUN: tree
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. A check opens the page and reads what it draws; it is not
// the ledger for anything.
//
// THE ROW AND THE CARD SAY WHAT A PRESS DOES AND WHOSE A READING IS, IN ONE
// NAME (the completeness critic of 15 November 2026, of the default sources
// shipped that morning: with STEP's TAHOT switched off, MACULA lit said
// «press again to go back to STEP» while STEP's pill was dead; and one card
// said «reading · TAHOT at this place» over «here STEP reads» for the same
// pieces of the place).
//   W1  with STEP's TAHOT switched off on the switches, MACULA pressed: its
//       title promises no STEP and says what a second press does (no pill
//       lit), and a second press does that: no pill of the row lit
//   W2  at rest, on the first cards of a work whose place pieces are STEP's
//       (TAHOT's): the card's label names the source of the place's reading
//       as the piece line names it and as the source's pill prints it
//   W0  no page error
// The work is found from the default picks on disk, never named here
// (check-scope-derived S1): the work with the fewest places. SERVE_BASE
// serves another build (the live build, to see these laws red before a fix).
// Usage: node tools/check-row-and-card-name-sources-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { DEFAULT_PICKS_RULE_ID } from "./bake-default-picks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DP = join(K3, "data", "default-picks");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? `  \u00b7  ${d}` : ""}`); };
console.log(`\u2014 ${DEFAULT_PICKS_RULE_ID} \u2014`);
if (!existsSync(join(DP, "index.json"))) { console.log("SKIPPED \u2014 no default picks index in this checkout"); process.exit(3); }
const IX = JSON.parse(readFileSync(join(DP, "index.json"), "utf8"));
const works = Object.keys(IX.books || {}).filter((b) => existsSync(join(K3, "data", "zones", `${b}.bin`)) && existsSync(join(DP, IX.books[b].file)));
works.sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));
if (!works.length) { console.log("SKIPPED \u2014 no work on this disk has a book file of default picks"); process.exit(3); }
const W = works[0];
const step = (IX.sources || []).find((s) => s && s.id === "step");
const STEP_M = step && step.m ? (typeof step.m === "string" ? step.m : step.m.r) : null;
const CARDS = 12;

const tree = process.env.SERVE_BASE ? { base: process.env.SERVE_BASE.replace(/\/$/u, ""), close: async () => {} } : await serveTree(K3);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const pageErrors = [];
const open = async (kept = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript((kv) => { try { if (!sessionStorage.getItem("rcn-check")) { localStorage.clear(); for (const [a, b] of Object.entries(kv)) localStorage.setItem(a, b); sessionStorage.setItem("rcn-check", "1"); } } catch { /* a page with no memory is a first visit */ } }, kept);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => pageErrors.push(`${W}: ${String((e && e.message) || e).slice(0, 160)}`));
  await p.goto(`${tree.base}/zone.html?b=${W}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(800);
  return { ctx, p };
};
const row = (p) => p.evaluate(() => ["step", "macula", "ubs", "bdb"].map((id) => { const b = document.getElementById(`default-${id}`); return b ? { id, text: b.textContent.trim(), lit: b.getAttribute("aria-pressed") === "true", dead: b.disabled, title: b.title } : null; }).filter(Boolean));
const press = async (p, id) => { await p.evaluate((x) => document.getElementById(x).click(), id); await p.waitForTimeout(700); await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(300); };
try {
  // W1: STEP's TAHOT switched off
  if (!STEP_M) check("W1", false, "the index names no M for STEP");
  else {
    const { ctx, p } = await open({ "fh.sources.off": JSON.stringify([STEP_M]) });
    const r0 = await row(p);
    await press(p, "default-macula");
    const r1 = await row(p), mac = r1.find((x) => x.id === "macula");
    await press(p, "default-macula");
    const r2 = await row(p);
    const stepDead = !!(r0.find((x) => x.id === "step") || {}).dead;
    const ok = stepDead && !!mac && mac.lit && !/back to STEP/u.test(mac.title) && /no pill lit/u.test(mac.title) && !r2.some((x) => x.lit);
    check(`W1  ${W} with STEP's ${STEP_M} switched off: MACULA lit says what a second press does, and a second press leaves no pill lit`, ok,
      `STEP's pill ${stepDead ? "dead" : "alive"}; MACULA ${mac && mac.lit ? "lit" : "not lit"}, its title \u00ab${mac ? mac.title : ""}\u00bb; after a second press ${r2.filter((x) => x.lit).map((x) => x.text).join(", ") || "no pill"} lit`);
    await ctx.close();
  }
  // W2: at rest, the first cards whose place reading is STEP's pieces
  {
    const { ctx, p } = await open();
    const pill = ((await row(p)).find((x) => x.id === "step") || {}).text || "";
    const said = [], faults = [];
    const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb:not(.mark)").length);
    for (let i = 0; i < n && said.length < CARDS; i += 1) {
      const ok = await p.evaluate((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[i]; if (!wb || wb.closest(".wjoin") || wb.classList.contains("kq")) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); return true; }, i);
      if (!ok) continue;
      await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(500);
      const c = await p.evaluate(() => {
        const h = document.getElementById("hud");
        const k = h.querySelector(".r-now .k"), piece = [...h.querySelectorAll(".r-piece:not(.r-sug) i")].map((x) => x.textContent).find((t) => /^here /u.test(t));
        return { label: k ? k.textContent.trim() : "", piece: piece || "" };
      });
      await p.keyboard.press("Escape"); await p.waitForTimeout(200);
      const lm = /^reading \u00b7 (.+?) at this place/u.exec(c.label), pm = /^here (.+?) reads/u.exec(c.piece);
      if (!lm || !pm) continue;
      said.push(`${lm[1]}/${pm[1]}`);
      if (pm[1] === pill && lm[1] !== pill) faults.push(`card ${said.length}: the label \u00ab${c.label.slice(0, 50)}\u00bb, the piece line \u00ab${c.piece.trim()}\u00bb`);
    }
    check(`W2  ${W} at rest: on ${said.length} card(s) whose place reading the label and the piece line both name, a reading of STEP's pieces is named \u00ab${pill}\u00bb by both, as its pill prints it`, said.length > 0 && !faults.length,
      faults.length ? faults.slice(0, 3).join(" | ") : `named ${[...new Set(said)].join(", ")}`);
    await ctx.close();
  }
  check("W0  no page error", !pageErrors.length, pageErrors.slice(0, 2).join(" | "));
} finally {
  await browser.close();
  await tree.close();
}
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
