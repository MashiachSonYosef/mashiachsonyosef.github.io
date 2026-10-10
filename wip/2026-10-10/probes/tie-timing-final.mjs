// How long the reader takes to draw every word's blob again after a switch
// that repaints a whole book (Ruth, all sections built, page at the top):
// the words near the screen are drawn at once, the rest in slices, and
// window.__tiePending counts the words still waiting. This measures when
// it reaches 0, beside the probe's own settle time (about 0.8 s), to tell
// whether the probe's "drawn where the English no longer stands" on a far
// word is a word measured before its slice came, or a word never drawn.
// Run: node tie-timing-final.mjs
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";

const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:8912/reader/zone.html?b=ruth&blobs=every", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await page.evaluate(async () => {
  for (let g = 0; g < 4000; g += 1) {
    const n = document.querySelector("section.seg.seg-wait");
    if (!n) break;
    n.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 8));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(3000);
for (const lab of ["oldest first", "the source here"]) {
  const out = await page.evaluate(async (lab) => {
    const row = document.querySelector('.rail .row[data-toggle="reads"]');
    const b = [...row.querySelectorAll(".dfp")].find((x) => x.textContent.trim() === lab);
    const t0 = performance.now();
    b.click();
    const samples = [];
    let peak = 0, zeroAt = null;
    while (performance.now() - t0 < 30000) {
      await new Promise((r) => setTimeout(r, 25));
      const n = window.__tiePending || 0;
      peak = Math.max(peak, n);
      const t = Math.round(performance.now() - t0);
      if (samples.length < 400) samples.push([t, n]);
      if (t > 300 && n === 0) { zeroAt = t; break; }
    }
    const at800 = samples.filter(([t]) => t <= 800).pop();
    return { lab, words: document.querySelectorAll(".he-text > .wb").length, peak, pendingNear800ms: at800 ? at800[1] : null, zeroAtMs: zeroAt };
  }, lab);
  console.log(JSON.stringify(out));
  await page.waitForTimeout(1500);
}
await browser.close();
