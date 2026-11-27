// Helper G · read-only: on how many cards the lines the chain records as "above the pills" are drawn at all.
// A card the page fits tight (#hud.tight) folds those lines away (display: none). Every word of the books given is
// pressed at the viewport the chain was read at (412 by 915) and at a desk's (1280 by 900), and for each card: whether
// it is tight, and whether each line above the pills is displayed. Writes tight-census.tsv beside this script.
// Usage: node tight.mjs <book,...>
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const T = (f) => import(join(R, "tools", f));
const { serveTree } = await T("serve-tree-v1.mjs");
const { loadPlaywright, launchOptions } = await T("playwright-v1.mjs");
const books = String(process.argv[2] || "obadiah").split(",");
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
const rows = [["book", "viewport", "cards", "tight", "cards_with_a_here_line", "here_line_displayed", "here_line_hidden", "source_lines", "source_lines_displayed", "suggested_lines", "suggested_displayed", "withheld_line_cards", "withheld_line_displayed"]];
try {
  for (const book of books) for (const vp of [{ width: 412, height: 915 }, { width: 1280, height: 900 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    try {
      const p = await ctx.newPage();
      await p.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await p.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
      const total = await p.evaluate(() => window.__materialise(0));
      await p.waitForFunction(() => !!(window.__latticeStore || window.__latticeRefused), null, { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(1200);
      for (let k = 0; k < 6; k += 1) {
        await p.evaluate((at) => { const ws = [...document.querySelectorAll("section.seg .he-text > .wb:not(.mark):not(.kq)")]; const wb = ws[at]; if (wb) (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, k);
        await p.waitForTimeout(600);
        const ok = await p.evaluate(() => { const d = window.__default; return window.__suggested !== undefined && !!(d && (d.ready || d.failed || !d.book)); });
        await p.keyboard.press("Escape");
        if (ok) break;
      }
      const t = { cards: 0, tight: 0, here: 0, hereShown: 0, hereHidden: 0, src: 0, srcShown: 0, sug: 0, sugShown: 0, wl: 0, wlShown: 0 };
      for (let a = 0; a < total; a += 12) {
        const got = await p.evaluate(async ([from, to]) => {
          const hud = document.getElementById("hud");
          const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
          const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
          const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          const shown = (el) => getComputedStyle(el).display !== "none";
          const secs = [...document.querySelectorAll("section.seg")];
          const t = { cards: 0, tight: 0, here: 0, hereShown: 0, hereHidden: 0, src: 0, srcShown: 0, sug: 0, sugShown: 0, wl: 0, wlShown: 0 };
          for (let i = from; i < Math.min(to, secs.length); i += 1) {
            secs[i].scrollIntoView({ block: "center" });
            for (const wb of secs[i].querySelectorAll(".he-text .wb:not(.mark)")) {
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
              (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
              const t0 = performance.now();
              while (!settled() && performance.now() - t0 < 15000) await turn();
              await frame(); await frame();
              const read = hud.querySelector(":scope > .rows > .b-read");
              if (!read) continue;
              t.cards += 1;
              if (hud.classList.contains("tight")) t.tight += 1;
              const here = read.querySelector(":scope > .r-piece:not(.r-sug)");
              if (here) { t.here += 1; if (shown(here)) t.hereShown += 1; else t.hereHidden += 1; }
              for (const d of read.querySelectorAll(":scope > .r-dflt")) { t.src += 1; if (shown(d)) t.srcShown += 1; }
              const sug = read.querySelector(":scope > .r-piece.r-sug");
              if (sug) { t.sug += 1; if (shown(sug)) t.sugShown += 1; }
              const wl = read.querySelector(":scope > .withheld-line");
              if (wl) { t.wl += 1; if (shown(wl)) t.wlShown += 1; }
            }
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return t;
        }, [a, Math.min(a + 12, total)]);
        for (const k of Object.keys(t)) t[k] += got[k];
      }
      rows.push([book, `${vp.width}x${vp.height}`, t.cards, t.tight, t.here, t.hereShown, t.hereHidden, t.src, t.srcShown, t.sug, t.sugShown, t.wl, t.wlShown]);
      console.log(rows[rows.length - 1].join("\t"));
    } catch (e) { console.log(`${book} ${vp.width}: FAILED ${String((e && e.message) || e).split("\n")[0]}`); } finally { await ctx.close(); }
  }
} finally { await browser.close().catch(() => {}); await tree.close(); }
writeFileSync(join(OUT, "tight-census.tsv"), rows.map((r) => r.join("\t")).join("\n") + "\n");
