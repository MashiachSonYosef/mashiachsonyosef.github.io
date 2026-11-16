// The gate's S2 cards, read on the new build under «keep» (every pointing): does every pill the live build showed at
// rest still stand? Then the only difference at rest is the pointing gate's (unpointed-row-rule-v1, v5).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [DIFF, ORIGIN] = process.argv.slice(2);
const cards = new Map();   // `${book} ${n}` -> old pills
let cur = null;
for (const ln of readFileSync(DIFF, "utf8").split("\n")) {
  const m = ln.match(/^== (\S+) \d+ card (\d+)/); if (m) { cur = `${m[1]} ${m[2]}`; continue; }
  const o = ln.match(/^  old: (.*)$/); if (o && cur && !cards.has(cur)) cards.set(cur, o[1].split(" | ").map((x) => x.replace(/^\*/u, "").trim()));
}
const findWb = (at) => {
  const m = /^(.*):(\d+)$/u.exec(at);
  const secs = [...document.querySelectorAll("section.seg")];
  const i = secs.findIndex((s) => s.__sec && s.__sec.label === m[1]);
  if (i < 0) return null;
  if (secs[i].__body && window.__materialise) window.__materialise(i, i + 1);
  return [...secs[i].querySelectorAll(".he-text .wb:not(.mark)")][Number(m[2]) - 1] || null;
};
const browser = await chromium.launch();
let all = 0, missing = 0;
for (const [id, old] of cards) {
  const [b, n] = id.split(" ");
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => { try { localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); } catch {} });
  const p = await ctx.newPage();
  await p.goto(`${ORIGIN}/zone.html?b=${b}`, { waitUntil: "load" });
  await p.waitForFunction(() => document.querySelectorAll("section.seg").length > 0, null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.evaluate(({ at, f }) => { const wb = (0, eval)(`(${f})`)(at); if (!wb) return; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, { at: `1:1:${n}`, f: findWb.toString() });
  let pills = [];
  for (let k = 0; k < 40; k += 1) { await p.waitForTimeout(250); pills = await p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => x.textContent.trim())); if (pills.length) { await p.waitForTimeout(1200); pills = await p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => x.textContent.trim())); break; } }
  const norm = (x) => x.replace(/\s+/gu, " ").toLowerCase().replace(/[.;,]+$/u, "");
  const have = new Set(pills.map(norm));
  const lost = old.filter((x) => !have.has(norm(x)));
  all += old.length; missing += lost.length;
  console.log(`${b} 1:1:${n}: old ${old.length} pills, new under «keep» ${pills.length}, missing ${lost.length}${lost.length ? ": " + lost.slice(0, 6).join(" | ") + " · near: " + pills.filter((x) => lost.some((l) => norm(x).includes(norm(l).slice(0, 12)))).slice(0, 6).join(" | ") : ""}`);
  await ctx.close();
}
await browser.close();
console.log(`TOTAL old pills ${all}, missing under keep ${missing}`);
