#!/usr/bin/env node
// check-source-suggested-v1 · the BSB's whole-word rendering stands on the card, credited, and never on the line
//
// GUARDS: source-suggested-rule-v1-a-running-bible-reads-the-whole-word-and-is-credited-by-name
// LEDGER: data/source-suggested/<book>.json (tools/project-source-suggested-v1.mjs)
//
// S1  the ledger on disk: every book's file lays its places on the zone's own
//     words (0 mismatched), laid + held = the lane's places, the index's
//     totals are the files' sums and the lane's 304,605 renderings over
//     305,431 places, and the credit carries the licence's two paragraphs
// S2  with the switch off, no card carries the BSB's row, and the rail's row
//     stands off
// S3  with the switch on, Genesis 1:1's first word's card reads the BSB's own
//     cell (" In the beginning ", its spaces kept in the title), credited BSB
//     under Public Domain; the fourth word (אֵת, a DASH cell) says in words
//     what the BSB means by it
// S4  the switch moves the card only: the line under every word of 1:1 is the
//     same with it on and off
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const PORT = process.env.SERVE_PORT || "8911";
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

// S2-S4 — the page
const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
const open = async (on) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((on) => { try { localStorage.setItem("fh.suggested", on ? "bsb" : "off"); } catch { /* a device that remembers nothing still reads */ } }, on);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`http://127.0.0.1:${PORT}/zone.html?b=genesis`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(600);
  const r = await p.evaluate(async () => {
    const wait = (ms) => new Promise((x) => setTimeout(x, ms));
    const s = [...document.querySelectorAll("section.seg")].find((s) => s.querySelector(".vnum")?.textContent === "1:1");
    const wbs = [...s.querySelectorAll(".he-text .wb")];
    const lines = wbs.map((w) => (w.querySelector(":scope > .g") || w.closest(".wjoin")?.querySelector(":scope > .g") || { textContent: "" }).textContent);
    const cardOf = async (i) => {
      const w = wbs[i]; (w.querySelector(".w span") || w.querySelector(".w")).click();
      const t0 = Date.now(); while (Date.now() - t0 < 8000 && !document.querySelector("#hud .r-pills button")) await wait(50);
      await wait(500);
      const sug = document.querySelector("#hud .r-sug");
      const out = { has: !!sug, text: sug ? sug.textContent.trim() : "", title: sug ? (sug.querySelector("b") || {}).title || "" : "", chip: sug ? (sug.querySelector(".g-lic") || {}).textContent || "" : "", chipTitle: sug ? (sug.querySelector(".g-lic") || {}).title || "" : "" };
      const x = document.querySelector("#hud .head button"); if (x) x.click(); await wait(150);
      return out;
    };
    const rail = [...document.querySelectorAll('.rail .row[data-toggle="suggested"] button')].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true", dead: x.disabled }));
    return { lines, first: await cardOf(0), fourth: await cardOf(3), rail, state: window.__suggested || null };
  });
  await ctx.close();
  return r;
};
const off = await open(false), on = await open(true);
check("S2  switched off: no card carries the BSB's row, and the rail's row stands off", !off.first.has && !off.fourth.has && off.rail.some((x) => x.t === "off" && x.on) && !off.rail.some((x) => x.dead),
  `rail ${off.rail.map((x) => `${x.t}${x.on ? " (on)" : ""}${x.dead ? " (dead)" : ""}`).join(" | ")}`);
check("S3  switched on: Genesis 1:1's first word reads the BSB's own cell, credited BSB, Public Domain",
  on.first.has && /In the beginning/.test(on.first.text) && on.first.title.includes("\" In the beginning \"") && on.first.chip === "Public Domain" && /Berean Standard Bible/.test(on.first.chipTitle),
  `${on.first.text.slice(0, 90)} · title ${on.first.title.slice(0, 60)} · chip ${on.first.chip}`);
check("    and the fourth word's DASH cell is said in words", on.fourth.has && /^source suggested/.test(on.fourth.text) && /leaves this word without English/.test(on.fourth.text) && on.fourth.title.includes("\" - \""),
  on.fourth.text.slice(0, 120));
check("S4  the switch moves the card only: the line under every word of 1:1 is the same on and off",
  JSON.stringify(on.lines) === JSON.stringify(off.lines) && on.lines.length === off.lines.length,
  `${off.lines.length} words · ${on.lines.filter((t, i) => t !== off.lines[i]).length} differ`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
