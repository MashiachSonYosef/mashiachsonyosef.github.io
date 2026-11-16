// Plan of 17 November, big picture 2: a chapter opened as a reader on a phone would. A Pixel 5 profile, a throttled
// network (about 1.6 Mbit/s down, 150 ms round trip) and the CPU slowed four times. Measures the time to the Hebrew
// words, the time to the lines (the page's own signal, window.__default.ready), the bytes fetched, and a card opened
// on the third word: the time to its pills, and how many.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const [ORIGIN, ...PAGES] = process.argv.slice(2);
const browser = await chromium.launch();
for (const path of PAGES) {
  for (const slow of [false, true]) {
    const ctx = await browser.newContext({ ...devices["Pixel 5"] });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    if (slow) { await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 90000 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
    let bytes = 0; p.on("response", async (r) => { try { const b = await r.body(); bytes += b.length; } catch {} });
    const t0 = Date.now();
    await p.goto(`${ORIGIN}${path}`, { waitUntil: "domcontentloaded", timeout: 180000 });
    await p.waitForSelector(".he-text .wb", { timeout: 180000 });
    const tWords = Date.now() - t0;
    await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 180000 }).catch(() => {});
    const tLines = Date.now() - t0;
    const t1 = Date.now();
    await p.evaluate(() => { const w = document.querySelectorAll(".he-text .wb:not(.mark)")[2]; if (w) (w.querySelector(".w span") || w.querySelector(".w") || w).click(); });
    let pills = 0;
    for (let k = 0; k < 240 && !pills; k += 1) { await p.waitForTimeout(250); pills = await p.evaluate(() => document.querySelectorAll("#hud > .rows .b-read .r-pills button").length); }
    const tCard = Date.now() - t1;
    console.log(`${path.padEnd(14)} ${slow ? "phone, slow net" : "phone, local  "}  words ${(tWords / 1000).toFixed(1)} s · lines ${(tLines / 1000).toFixed(1)} s · ${(bytes / 1e6).toFixed(2)} MB fetched · card ${(tCard / 1000).toFixed(1)} s, ${pills} pills`);
    await ctx.close();
  }
}
await browser.close();
