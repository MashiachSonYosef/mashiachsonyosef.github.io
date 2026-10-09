#!/usr/bin/env node
// check-hud-runs-v1 · the HUD record's runs stand on the page as the file lays them
//
// RULE: hud-runs-rule-v1-a-stretch-the-record-puts-in-one-hud-wears-one-line
// LEDGER: data/hud-runs/<book>.json (tools/project-hud-runs-v1.mjs)
//
// H1  the page lays the book's HUD runs: every card in the file whose words
//     are the zone's stands as one run on the page (the run cards' lane), or
//     under a run card on the same words
// H2  a run is one cell, as a maqaf run is: its words stand in one cell that
//     carries the run, the cell's ink row wears one gold line under all of
//     it, and its parts row holds one part per word under the words
// H3  a cell never runs past the page: a run too wide for the page wraps
//     inside its cell (its ink row on more lines than one), and the cell's
//     box stays inside the page's width
// H4  the order of a run's English is the text's: the parts read in the
//     words' order under the words (no reordering)
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync } from "node:fs";
const PORT = process.env.SERVE_PORT || "8911";
const BOOKS = (process.argv.slice(2).filter((a) => !a.startsWith("--")));
const books = BOOKS.length ? BOOKS : ["amos", "joshua"];
let bad = 0;
const check = (name, ok, say) => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${say ? `  ·  ${say}` : ""}`); if (!ok) bad += 1; };
const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
for (const book of books) {
  const file = JSON.parse(readFileSync(`data/hud-runs/${book}.json`, "utf8"));
  const p = await b.newPage({ viewport: { width: 412, height: 900 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`http://127.0.0.1:${PORT}/zone.html?b=${book}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForFunction(() => !!window.__hudRuns, null, { timeout: 30000 });
  const r = await p.evaluate(async (cards) => {
    const secs = [...document.querySelectorAll("section.seg")];
    for (const s of secs) { s.scrollIntoView(); await new Promise((x) => setTimeout(x, 8)); }
    await new Promise((x) => setTimeout(x, 600));
    const z = window.__zone; const units = new Map(z.sections.map((s, i) => [s.unit, secs[i]]));
    const pageW = document.documentElement.clientWidth;
    const out = { cards: cards.length, laid: 0, missing: [], cellBad: 0, lineBad: 0, partsBad: 0, pastPage: 0, wrapped: 0, orderBad: 0, examples: [], astray: [] };
    for (const c of cards) {
      const sec = units.get(c.unit); if (!sec) { out.missing.push(c.text); continue; }
      const wbs = [...sec.querySelectorAll(".he-text .wb")];
      const els = c.idx.map((i) => wbs[i]);
      if (els.some((e) => !e)) { out.missing.push(c.text); continue; }
      // H1: every word of the card stands in one run (this one, or a longer run card over the same words)
      const run = els[0].__run;
      if (!run || !els.every((e) => e.__run === run) || !c.idx.every((i) => run.idx.includes(i))) { out.missing.push(c.text); continue; }
      out.laid += 1;
      if (run.idx.length !== c.idx.length) continue;   // a longer run card holds these words; its cell is its own
      // H2: one cell carrying the run, one line under its ink, one part per word
      const cell = els[0].closest(".wjoin");
      if (!cell || cell.__run !== run || !cell.classList.contains("lic") || !els.every((e) => e.closest(".wjoin") === cell)) { out.cellBad += 1; if (out.astray.length < 3) out.astray.push(`cell ${c.text}`); continue; }
      const ink = cell.querySelector(":scope > .wj-ink");
      const cs = ink && getComputedStyle(ink);
      if (!cs || parseFloat(cs.borderBottomWidth) <= 0 || cs.borderBottomStyle === "none" || /rgba\(.*,\s*0\)$/.test(cs.borderBottomColor) || cs.borderBottomColor === "transparent") { out.lineBad += 1; if (out.astray.length < 3) out.astray.push(`line ${c.text}`); }
      const parts = [...cell.querySelectorAll(":scope > .g.parts > .g-part")];
      const want = els.filter((e) => e.querySelector(":scope > .g") && e.querySelector(":scope > .g").textContent.trim()).length;
      if (parts.length < Math.min(want, 1) || parts.length > els.length) { out.partsBad += 1; if (out.astray.length < 3) out.astray.push(`parts ${c.text} (${parts.length} of ${els.length})`); }
      // H3: the cell inside the page; a wide run wraps inside it
      const box = cell.getBoundingClientRect();
      if (box.right > pageW + 0.5 || box.left < -0.5) { out.pastPage += 1; if (out.astray.length < 3) out.astray.push(`past ${c.text} (${Math.round(box.left)}..${Math.round(box.right)} of ${pageW})`); }
      const tops = new Set(els.map((e) => Math.round(e.querySelector(":scope > .w").getBoundingClientRect().top)));
      if (tops.size > 1) out.wrapped += 1;
      // H4: the parts stand in the words' order (document order, by the word each part reads)
      const wis = parts.map((pt) => Number(pt.dataset.wi));
      if (wis.some((w, j) => j > 0 && w <= wis[j - 1])) out.orderBad += 1;
      if (out.examples.length < 2) out.examples.push(`${c.label} ${c.text} → ${parts.map((pt) => pt.textContent.trim()).join(" + ")}`);
    }
    return out;
  }, file.cards);
  console.log(`— ${book}: ${file.counts.runs} runs in the file, branch ${file.branch} —`);
  check("H1  every HUD run of the file stands as one run on the page", r.missing.length === 0, `${r.laid} of ${r.cards} laid${r.missing.length ? ` · missing ${r.missing.slice(0, 3).join(" | ")}` : ""}`);
  check("H2  a run is one cell: one line under all its ink, one part per word", r.cellBad === 0 && r.lineBad === 0 && r.partsBad === 0, `${r.cellBad} cells wrong, ${r.lineBad} lines missing, ${r.partsBad} parts rows wrong${r.astray.length ? ` · ${r.astray.join(" | ")}` : ""}`);
  check("H3  no cell runs past the page; a wide run wraps inside its cell", r.pastPage === 0, `${r.wrapped} runs wrap inside their cell at 412px, ${r.pastPage} past the page`);
  check("H4  the parts of a run stand in the text's order", r.orderBad === 0, r.examples.join(" ‖ "));
  await p.close();
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
