// Finding 6: with empty storage (license runs resting "off"), which of the three run files does a book page ask
// for, when against its first drawn word, and how much of them does it lay?
// node f6-run-files.mjs <book>
import { chromium, BASE } from "./lib.mjs";
const book = process.argv[2] || "genesis";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const reqs = [];
const t0 = Date.now();
p.on("request", (r) => { const u = r.url(); if (/data\/(run-cards|hud-runs|hud-toggles)\//u.test(u)) reqs.push({ u: u.replace(/^.*\/data\//u, "data/"), asked: Date.now() - t0 }); });
p.on("requestfinished", async (r) => { const x = reqs.find((q) => r.url().endsWith(q.u) && q.done === undefined); if (x) { x.done = Date.now() - t0; try { const s = await r.sizes(); x.bytes = s.responseBodySize; } catch { /* no sizes */ } } });
await p.addInitScript(() => {
  try { localStorage.clear(); } catch { /* fresh */ }
  const t = performance.now();
  const mo = new MutationObserver(() => { if (document.querySelector("section.seg .he-text .wb")) { window.__firstWord = Math.round(performance.now() - t); mo.disconnect(); } });
  document.addEventListener("DOMContentLoaded", () => mo.observe(document.body, { childList: true, subtree: true }));
});
const nav = Date.now() - t0;
await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(1500);
const st = await p.evaluate(() => ({ firstWordMs: window.__firstWord, hudRuns: window.__hudRuns, runCards: window.__runCards, hudToggles: window.__hudToggles, runsUnderlined: document.querySelectorAll(".wjoin.run, .wjoin[data-run]").length, stored: localStorage.getItem("fh.runs") }));
for (const r of reqs) console.log(`${r.u}  asked at ${r.asked - nav} ms, done ${r.done - nav} ms, ${r.bytes ?? "?"} bytes on the wire`);
console.log("first word drawn at about", st.firstWordMs, "ms after the document began");
console.log("laid:", JSON.stringify({ hudRuns: st.hudRuns, runCards: st.runCards, hudToggles: st.hudToggles }));
await b.close();
