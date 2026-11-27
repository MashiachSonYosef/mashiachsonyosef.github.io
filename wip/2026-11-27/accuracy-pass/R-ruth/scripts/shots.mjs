// Read-only: for each place given, open its chapter page as a first visit, picture the verse as it stands,
// press the word and picture the card. Usage: node shots.mjs <tree root> <out dir> <places.json>
// places.json: [{ "ch": 3, "verse": "3:12", "e": 4, "name": "3-12-w5-im" }, ...]
import { readFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [ROOT, OUT, PLACES] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const zone = JSON.parse(gunzipSync(readFileSync(join(R, "data/zones/ruth.bin"))).toString("utf8"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
mkdirSync(join(OUT, "shots"), { recursive: true });
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
try {
  const byCh = new Map();
  for (const p of places) (byCh.get(p.ch) || byCh.set(p.ch, []).get(p.ch)).push(p);
  for (const [ch, ps] of byCh) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    await page.goto(`${tree.base}/ruth/${ch}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
    await page.waitForTimeout(1500);
    for (const p of ps) {
      const si = zone.sections.findIndex((s) => s.label === p.verse);
      await page.evaluate(({ si }) => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); const sec = document.querySelectorAll("section.seg")[si]; sec.scrollIntoView({ block: "start" }); window.scrollBy(0, -20); }, { si });
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(OUT, "shots", `${p.name}-verse.png`) });
      if (p.e === undefined) continue;
      await page.evaluate(async ({ si, e }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const sec = document.querySelectorAll("section.seg")[si];
        const wb = sec.querySelectorAll(".he-text .wb")[e];
        wb.scrollIntoView({ block: "start" }); window.scrollBy(0, -120); await turn(200);
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const hud = document.getElementById("hud");
        const t0 = performance.now();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        while (!settled() && performance.now() - t0 < 20000) await turn(50);
        await turn(600);
      }, { si, e: p.e });
      await page.screenshot({ path: join(OUT, "shots", `${p.name}-card.png`) });
      console.log("pictured", p.name);
    }
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
