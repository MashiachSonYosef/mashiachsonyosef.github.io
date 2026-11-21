// The words of one verse as the page draws them: index among the verse's words, the line under each, the run it stands in.
// node verse-cells.mjs <zone url> <section label> [default]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [URL, LABEL, DFLT] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
await p.goto(DFLT ? `${URL}&default=${DFLT}` : URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1200);
const out = await p.evaluate((label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
  const noHe = (t) => String(t || "").replace(/[֐-׿]+/gu, "<he>");
  return [...sec.querySelectorAll(".he-text .wb")].map((wb, i) => {
    const run = wb.closest(".wjoin"), g = wb.querySelector(":scope > .g"), rg = run ? run.querySelector(":scope > .g") : null;
    const txt = (el) => { if (!el) return null; const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
    return `${i} ${run ? "run" : "own"} pieces=${wb.querySelectorAll(".w span").length} line=${JSON.stringify(noHe(txt(g) || (rg ? `[run] ${txt(rg)}` : "")))} classes=${wb.className}`;
  });
}, LABEL);
console.log(out.join("\n"));
await b.close();
