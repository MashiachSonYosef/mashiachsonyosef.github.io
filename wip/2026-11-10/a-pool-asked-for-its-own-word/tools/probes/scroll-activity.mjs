// What a page does while it is scrolled at rest: the files it asks the server for, by kind, and how the lines stand
// afterwards (how many were read live, how many are marked off or unreachable), so two builds can be set side by side.
// node scroll-activity.mjs <reader dir> <zone url with its query> [--to px] [--step px]
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const TO = Number(flag("--to", "24000")), STEP = Number(flag("--step", "1500"));
const [reader, url] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const asked = { load: {}, scroll: {} }; let phase = "load";
const kind = (u) => { const x = new URL(u).pathname; const m = /\/data\/([a-z0-9-]+)\//u.exec(x); return m ? (x.includes("/shards/") ? `${m[1]} shard` : m[1]) : x.split("/").pop().replace(/[0-9a-f]{8,}/u, "#"); };
p.on("request", (r) => { const k = kind(r.url()); asked[phase][k] = (asked[phase][k] || 0) + 1; });
const errors = []; p.on("pageerror", (e) => errors.push(e.message));
const t0 = Date.now();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
phase = "scroll";
const times = [];
for (let y = 0; y <= TO; y += STEP) { const t = Date.now(); await p.evaluate((y) => window.scrollTo(0, y), y); times.push(Date.now() - t); await p.waitForTimeout(80); }
await p.waitForTimeout(1500);
const lines = await p.evaluate(() => {
  const g = [...document.querySelectorAll(".he-text .g")];
  const c = (f) => g.filter(f).length;
  return { lines: g.length, live: c((x) => x.dataset.live === "sources"), off: c((x) => !!x.dataset.off), bare: c((x) => x.classList.contains("bare")), sourcesOff: window.__sourcesOff || [], built: document.querySelectorAll("section.seg:not(.seg-wait)").length };
});
const say = (o) => Object.entries(o).sort((a, c) => c[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ") || "nothing";
console.log(`${url.split("/").pop()} · sources off: ${lines.sourcesOff.join(" ") || "none"} · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(`  asked while loading: ${say(asked.load)}`);
console.log(`  asked while scrolled to ${TO}px: ${say(asked.scroll)}`);
console.log(`  the longest a scroll took to come back: ${Math.max(...times)}ms · ${lines.built} sections built · ${lines.lines} lines: ${lines.live} read live, ${lines.off} marked off, ${lines.bare} bare${errors.length ? ` · page errors: ${errors[0]}` : ""}`);
await b.close();
