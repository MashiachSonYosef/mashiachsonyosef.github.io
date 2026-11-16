import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [URL] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage();
await p.addInitScript(() => { const f = window.fetch; window.__asks = []; window.fetch = function (u, ...r) { const s = String(u && u.url || u); if (/lattice\.bin|piece-store|default-picks|source-suggested|form-of-pills/u.test(s)) window.__asks.push({ u: s.replace(/^.*\/data\//u, ""), t: Math.round(performance.now()), words: document.querySelectorAll(".he-text .wb").length, stack: (new Error().stack || "").split("\n").slice(2, 7).map((x) => x.trim().replace(/\(?https?:\/\/[^)]*:(\d+):\d+\)?/u, "@$1")).join(" < ") }); return f.call(this, u, ...r); }; });
await p.goto(URL, { waitUntil: "load" }); await p.waitForTimeout(6000);
for (const a of await p.evaluate(() => window.__asks)) console.log(`${String(a.t).padStart(6)} ms  words ${String(a.words).padStart(4)}  ${a.u.slice(0, 40).padEnd(40)} ${a.stack.slice(0, 260)}`);
await b.close();
