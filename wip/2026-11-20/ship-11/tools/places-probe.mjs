// Ship 11: at each place named, the line under the word, its neighbors, and what its card says it holds back.
// node six-probe.mjs <base, e.g. http://127.0.0.1:8912/reader>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const base = process.argv[2];
const PLACES = JSON.parse(process.argv[3]);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
let book = null, p = null;
for (const [bk, verse, n] of PLACES) {
  if (bk !== book) {
    if (p) await p.close();
    p = await ctx.newPage(); book = bk;
    p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
    await p.goto(`${base}/zone.html?b=${bk}`, { waitUntil: "load" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 });
    await p.waitForTimeout(1200);
  }
  const line = await p.evaluate(({ verse, n }) => {
    const secs = [...document.querySelectorAll("section.seg")];
    const i = secs.findIndex((s) => s.__sec && s.__sec.label === verse);
    if (i < 0) return null;
    if (secs[i].__body && window.__materialise) window.__materialise(i, i + 1);
    const wb = [...secs[i].querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
    if (!wb) return null;
    wb.scrollIntoView({ block: "center" });
    const all = [...secs[i].querySelectorAll(".he-text .wb:not(.mark)")];
    const g = all.slice(Math.max(0, n - 2), n + 2).map((x, j) => `${j + Math.max(0, n - 2) + 1 === n ? ">" : ""}${((x.querySelector(":scope > .g") || {}).textContent || "").replace(/CC BY[-A-Z ]*[0-9.]*|Public Domain|PD/gu, "").trim()}`).join(" | ");
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    return g;
  }, { verse, n });
  await p.waitForTimeout(2500);
  const card = await p.evaluate(() => {
    const hud = document.querySelector("#hud");
    if (!hud) return null;
    const pills = [...hud.querySelectorAll(".rows .b-read .r-pills button")].map((x) => x.textContent.trim()).slice(0, 8);
    const notes = [...hud.querySelectorAll("*")].filter((e) => e.children.length === 0 && /withheld|held back/iu.test(e.textContent || "") && (e.textContent || "").length < 200).map((e) => e.textContent.trim());
    return { now: ((hud.querySelector(".r-now .v") || {}).textContent || "").trim(), pills, notes: [...new Set(notes)].slice(0, 6) };
  });
  console.log(`${bk} ${verse} word ${n} · line «${line}» · ${JSON.stringify(card)}`);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
}
await b.close();
