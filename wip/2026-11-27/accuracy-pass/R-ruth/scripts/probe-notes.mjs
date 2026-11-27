// Read-only: are the notes above the pills («here … reads», the withheld line) shown to a reader on a first visit?
// Opens one card at a narrow and a wide window and reports each note's display and box.
// Usage: node probe-notes.mjs <tree root> <out dir>
import { join } from "node:path";
const [ROOT, OUT] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const [w, h] of [[412, 915], [1280, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(`${tree.base}/ruth/2/`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
    await page.waitForTimeout(1500);
    const got = await page.evaluate(async () => {
      const turn = (ms) => new Promise((r) => setTimeout(r, ms));
      const secs = [...document.querySelectorAll("section.seg")];
      const sec = secs.find((s) => /2:7/.test(s.textContent.slice(0, 40))) || secs[28];
      const wb = sec.querySelectorAll(".he-text .wb")[11];
      wb.scrollIntoView({ block: "start" }); window.scrollBy(0, -120); await turn(200);
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      const hud = document.getElementById("hud");
      const t0 = performance.now();
      const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
      while (!settled() && performance.now() - t0 < 20000) await turn(50);
      await turn(500);
      const read = hud.querySelector(":scope > .rows > .b-read");
      const hb = hud.getBoundingClientRect();
      return {
        hudClass: hud.className, head: hud.querySelector(".head .wn")?.textContent,
        notes: [...read.querySelectorAll(":scope > p")].map((p) => { const cs = getComputedStyle(p); const b = p.getBoundingClientRect(); return { cls: p.className, display: cs.display, visibility: cs.visibility, h: Math.round(b.height), top: Math.round(b.top - hb.top), inside: b.top >= hb.top && b.bottom <= hb.bottom, text: p.textContent.replace(/\s+/gu, " ").slice(0, 90) }; }),
        rows: (() => { const rw = hud.querySelector(":scope > .rows"); const cs = getComputedStyle(rw); return { overflowY: cs.overflowY, h: rw.clientHeight, sh: rw.scrollHeight }; })(),
        readBand: (() => { const cs = getComputedStyle(read); return { overflowY: cs.overflowY, h: read.clientHeight, sh: read.scrollHeight }; })(),
      };
    });
    console.log(JSON.stringify({ width: w, ...got }, null, 1));
    await page.screenshot({ path: join(OUT, "shots", `notes-${w}.png`) });
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
