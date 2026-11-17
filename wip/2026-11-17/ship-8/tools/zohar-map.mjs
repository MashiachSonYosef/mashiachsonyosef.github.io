import { loadPlaywright, launchOptions } from "./tools/playwright-v1.mjs";
const pw = await loadPlaywright(); const b = await pw.chromium.launch(launchOptions()); const p = await b.newPage();
const asked = []; p.on("request", (r) => { if (/form-of-pills/.test(r.url())) asked.push(Date.now()); });
const t0 = Date.now();
await p.goto("http://127.0.0.1:8899/zone.html?b=tikkunei-zohar", { waitUntil: "domcontentloaded" });
let got;
for (let i = 0; i < 120; i++) { got = await p.evaluate(() => ({ f: window.__formOf === undefined ? "undefined" : window.__formOf, ric: typeof window.requestIdleCallback })); if (got.f !== "undefined") break; await p.waitForTimeout(500); }
console.log("after", Date.now() - t0, "ms:", JSON.stringify(got), "map asked at", asked.map((t) => t - t0));
await b.close();
