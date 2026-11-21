// Finding 7: first visit with the Samaritan overlay's index failing once (the request aborted), then a plain reload.
// Is the resting-off source (MSAM2, Uhlemann, Latin) off on the second visit, and what does the page remember?
// node f7-defaults-stamp.mjs [fail|ok]
import { chromium, BASE, ready } from "./lib.mjs";
const mode = process.argv[2] || "fail";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
let failed = 0;
if (mode === "fail") await p.route("**/data/overlays/samaritan/index.json", (route) => { failed += 1; route.abort("failed"); });
const state = () => p.evaluate(() => ({ off: window.__sourcesOff, overlays: window.__overlays, stamp: localStorage.getItem("fh.sources.defaults"), kept: localStorage.getItem("fh.sources.off"),
  chip: (() => { const x = document.querySelector('#sourcesRow button.kind-chip[data-ids~="MSAM2"], #sourcesRow button.dfp[data-ids~="MSAM2"]'); return x ? `${x.className} pressed=${x.getAttribute("aria-pressed")} disabled=${x.disabled}` : "no chip"; })() }));
await p.goto(`${BASE}?b=amos`, { waitUntil: "networkidle" }); await ready(p);
console.log(`visit 1 (${mode === "fail" ? `the overlay's index aborted ${failed} time(s)` : "nothing failing"}):`, JSON.stringify(await state()));
await p.unroute("**/data/overlays/samaritan/index.json").catch(() => {});
await p.reload({ waitUntil: "networkidle" }); await ready(p);
console.log("visit 2 (nothing failing):", JSON.stringify(await state()));
await p.reload({ waitUntil: "networkidle" }); await ready(p);
console.log("visit 3 (nothing failing):", JSON.stringify(await state()));
await b.close();
