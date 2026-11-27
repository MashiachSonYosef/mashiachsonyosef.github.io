// Read-only second walk: what of each card a reader SEES without scrolling, on a first visit at a phone's width.
// For every word: whether the card folded its notes away (the page's «tight» state), which notes are shown,
// how many pills are in view, and whether the pressed pill is in view. Writes one JSON line per word.
// Usage: node walk-seen.mjs <tree root> <out dir> [width] [height]
import { writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [ROOT, OUT, WIDTH = "412", HEIGHT = "915"] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const zone = JSON.parse(gunzipSync(readFileSync(join(R, "data/zones/ruth.bin"))).toString("utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
const outFile = join(OUT, `seen-${WIDTH}.jsonl`);
writeFileSync(outFile, "");
try {
  const ctx = await browser.newContext({ viewport: { width: Number(WIDTH), height: Number(HEIGHT) } });
  const page = await ctx.newPage();
  await page.goto(`${tree.base}/ruth/1/`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
  await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  let n = 0;
  for (let si = 0; si < zone.sections.length; si += 1) {
    const sec = zone.sections[si];
    for (let e = 0; e < sec.words.length; e += 1) {
      if (sec.words[e].mark) continue;
      n += 1;
      const got = await page.evaluate(async ({ si, e }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const hud = document.getElementById("hud");
        const sec = document.querySelectorAll("section.seg")[si];
        const wb = sec.querySelectorAll(".he-text .wb")[e];
        wb.scrollIntoView({ block: "center" }); await turn(50);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        while (!settled() && performance.now() - t0 < 20000) await turn(40);
        await turn(260);
        const read = hud.querySelector(":scope > .rows > .b-read");
        const box = read ? read.querySelector(":scope > .r-pills") : null;
        const bb = box ? box.getBoundingClientRect() : null;
        const pills = box ? [...box.querySelectorAll(":scope > button")] : [];
        const inView = (x) => { const b = x.getBoundingClientRect(); return bb && b.top >= bb.top - 1 && b.bottom <= bb.bottom + 1 && b.height > 0; };
        const on = pills.findIndex((x) => x.getAttribute("aria-pressed") === "true");
        const shown = read ? [...read.querySelectorAll(":scope > p")].filter((p) => getComputedStyle(p).display !== "none" && p.getBoundingClientRect().height > 0).map((p) => p.className) : [];
        const res = { tight: hud.classList.contains("tight"), floor: hud.classList.contains("floor"), shown, pills: pills.length, inView: pills.filter(inView).length, on: on + 1, onInView: on >= 0 ? inView(pills[on]) : null, boxH: bb ? Math.round(bb.height) : 0, scrollH: box ? box.scrollHeight : 0, hudH: Math.round(hud.getBoundingClientRect().height) };
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(30);
        return res;
      }, { si, e });
      appendFileSync(outFile, JSON.stringify({ verse: sec.label, e, word_no: n, s: sec.words[e].s, ...got }) + "\n");
    }
  }
  console.log("words", n);
  await ctx.close();
} finally { await browser.close(); await tree.close(); }
