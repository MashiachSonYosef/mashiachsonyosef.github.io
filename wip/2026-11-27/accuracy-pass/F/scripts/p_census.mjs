// Read-only census of the page as drawn on a first visit: every section of every book given is built by the
// page's own function (window.__materialise) and every entry of its Hebrew line is recorded as the page drew it.
// usage: node p_census.mjs <reader dir> <out dir> <book> [<book> ...]
import { join } from "node:path";
import { writeFileSync } from "node:fs";
const [R, OUT, ...BOOKS] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const book of BOOKS) {
    const t0 = Date.now();
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    const n = await page.evaluate(() => window.__materialise());
    await page.waitForTimeout(1500);
    const got = await page.evaluate(() => {
      const head = { marksOn: document.body.classList.contains("marks-on"), btn: (document.getElementById("marksToggle") || {}).textContent || null, bodyClass: document.body.className, toggles: window.__hudToggles || null, masorah: window.__masorah || null };
      const disp = {};   // computed display of the first entry of each mark kind, at rest
      const secs = [];
      for (const sec of document.querySelectorAll("section.seg")) {
        const he = sec.querySelector(".he-text"); if (!he) { secs.push({ l: (sec.querySelector(".vnum") || {}).textContent, e: null }); continue; }
        const joins = [...he.querySelectorAll(".wjoin")];
        const e = [];
        for (const wb of he.querySelectorAll(".wb")) {
          const w = wb.querySelector(":scope > .w"), g = wb.querySelector(":scope > .g");
          const rec = { t: w ? w.textContent : null };
          if (wb.dataset.mark) { rec.m = wb.dataset.mark; if (!(rec.m in disp)) disp[rec.m] = getComputedStyle(wb).display; if (wb.classList.contains("in-read-form") && !("PASEQ.in-read-form" in disp)) disp["PASEQ.in-read-form"] = getComputedStyle(wb).display; }
          const c = wb.className.replace(/\bwb\b/u, "").trim(); if (c) rec.c = c;
          if (g) { const gg = g.cloneNode(true); gg.querySelectorAll(".g-lic").forEach((x) => x.remove()); const tx = gg.textContent; if (tx.trim()) rec.g = tx; const lic = g.querySelector(".g-lic"); if (lic && lic.dataset.line) rec.gs = lic.dataset.line; }
          const lm = [...wb.querySelectorAll(".lm")].map((x) => [x.className.replace(/^lm\s+lm-/u, "").replace(/\s+mg.*$/u, ""), x.textContent]); if (lm.length) rec.lm = lm;
          const wr = [...wb.querySelectorAll(".wr")].map((x) => [x.textContent, x.className.replace(/\bwr\b/u, "").trim(), x.title.slice(0, 5)]); if (wr.length) rec.wr = wr;
          const mq = wb.querySelectorAll(".mq").length; if (mq) rec.mq = mq;
          const ks = wb.querySelector(".kq-stroke"); if (ks) rec.ks = [ks.dataset.s, ks.parentElement.className, ks.previousSibling ? (ks.previousSibling.textContent || "").slice(-12) : ""];
          if (wb.dataset.ld) { rec.ld = wb.dataset.ld; rec.ti = wb.title; }
          const j = wb.closest(".wjoin"); if (j) { rec.j = joins.indexOf(j); rec.jc = j.className; const jg = j.querySelector(":scope > .g"); if (jg && e.every((x) => x.j !== rec.j)) { const gg = jg.cloneNode(true); gg.querySelectorAll(".g-lic").forEach((x) => x.remove()); rec.jg = gg.textContent; } }
          e.push(rec);
        }
        // the ink as drawn: every text node of the Hebrew line that is not under an English line
        let ink = "", rest = "";
        const walk = document.createTreeWalker(he, NodeFilter.SHOW_TEXT);
        for (let t = walk.nextNode(); t; t = walk.nextNode()) {
          const p = t.parentElement; if (p.closest(".g")) continue;
          ink += t.data; if (!p.closest(".mark-off")) rest += t.data;
        }
        secs.push({ l: (sec.querySelector(".vnum") || {}).textContent, e, ink, rest });
      }
      return { head, disp, secs };
    });
    // the same marks with the switch on: what display each kind takes
    const on = await page.evaluate(() => {
      const btn = document.getElementById("marksToggle"); if (!btn || btn.hidden) return null;
      btn.click(); const disp = {};
      for (const wb of document.querySelectorAll(".he-text .wb.mark")) { const k = wb.dataset.mark + (wb.classList.contains("in-read-form") ? ".in-read-form" : ""); if (!(k in disp)) disp[k] = getComputedStyle(wb).display; }
      const st = document.querySelector(".kq-stroke"); const stroke = st ? getComputedStyle(st, "::before").content : null;
      btn.click();
      return { disp, stroke };
    });
    writeFileSync(join(OUT, `${book}.json`), JSON.stringify({ book, sections: n, errors, head: got.head, disp_rest: got.disp, disp_on: on, secs: got.secs }));
    console.log(`${book}\t${n}\t${got.secs.length}\t${Date.now() - t0}ms\terrors=${errors.length}`);
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
