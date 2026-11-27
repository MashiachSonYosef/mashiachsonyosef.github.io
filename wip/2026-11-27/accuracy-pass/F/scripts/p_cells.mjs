// Read-only: the joined cells the page draws on a first visit, with the key each cell carries and the span row its line reads.
import { join } from "node:path"; import { writeFileSync } from "node:fs";
const [R, OUT, ...BOOKS] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const book of BOOKS) {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.__materialise());
    await page.waitForTimeout(1200);
    const got = await page.evaluate(() => {
      const out = [];
      for (const sec of document.querySelectorAll("section.seg")) {
        const lab = (sec.querySelector(".vnum") || {}).textContent;
        for (const j of sec.querySelectorAll(".he-text .wjoin")) {
          const key = j.__key || null, run = j.__run || null;
          const rec = { ref: lab, cls: j.className, key, chain: !!j.__chain, words: (j.__words || []).map((w) => w.s), run: run ? { spanKey: run.spanKey || null, kind: run.kind || null, rids: run.span ? (run.span.row_ids || []) : null } : null };
          if (key && window.__spanLine) { try { rec.line = window.__spanLine(run && run.spanKey ? run.spanKey : key); } catch (e) { rec.lineErr = String(e); } }
          const g = j.querySelector(":scope > .g"); if (g) { const lic = g.querySelector(".g-lic"); rec.gs = lic ? lic.dataset.line : null; const gg = g.cloneNode(true); gg.querySelectorAll(".g-lic").forEach((x) => x.remove()); rec.g = gg.textContent; }
          out.push(rec);
        }
      }
      return out;
    });
    writeFileSync(join(OUT, `${book}.json`), JSON.stringify(got));
    console.log(`${book}\t${got.length}`);
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
