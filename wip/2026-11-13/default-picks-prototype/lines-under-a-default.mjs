// The prototype's line under each word, read by each source's default in turn: a default is chosen on a word's card,
// the card is closed, and the verses are pictured. Changes nothing outside the browser.
// node lines-under-a-default.mjs <reader dir> <reader base url> <book> <first label> <last label> <shot dir> <source> [<source> ...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const [reader, base, book, from, to, shots, ...sources] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.removeItem("fh.default"); } catch (e) { /* a first visit */ } });
const page = await ctx.newPage();
await page.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg", { state: "attached", timeout: 60000 });
const labels = await page.evaluate(async ({ from, to }) => {
  const secs = [...document.querySelectorAll("section.seg")];
  const a = secs.findIndex((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === from);
  const b = secs.findIndex((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === to);
  const mine = secs.slice(a, b + 1);
  mine[0].scrollIntoView({ block: "start" });
  for (const s of mine) for (let i = 0; i < 150 && !s.querySelector(".he-text .wb"); i += 1) { s.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 100)); }
  mine[0].scrollIntoView({ block: "start" });
  mine.forEach((s) => s.setAttribute("data-shot", "1"));
  return mine.map((s) => (s.querySelector(".vnum") || {}).textContent.trim());
}, { from, to });
const shoot = async (tag) => {
  await page.waitForTimeout(400);
  const box = await page.evaluate(() => {
    const els = [...document.querySelectorAll("section.seg[data-shot]")];
    const r = els.map((e) => e.getBoundingClientRect());
    return { x: Math.min(...r.map((q) => q.left)), y: Math.min(...r.map((q) => q.top)) + window.scrollY, w: Math.max(...r.map((q) => q.right)) - Math.min(...r.map((q) => q.left)), h: Math.max(...r.map((q) => q.bottom)) - Math.min(...r.map((q) => q.top)) };
  });
  await page.screenshot({ path: join(shots, `${book}-${from.replace(":", "-")}-lines-${tag}.png`), clip: { x: Math.max(0, box.x), y: box.y, width: box.w, height: box.h }, fullPage: true });
  const lines = await page.evaluate(() => [...document.querySelectorAll("section.seg[data-shot]")].map((s) => [...s.querySelectorAll(".he-text .wb:not(.mark) > .g")].map((g) => g.textContent.trim()).join(" | ")));
  console.log(`${tag}: ${JSON.stringify(lines)}`);
};
await shoot("step");
for (const who of sources) {
  await page.evaluate(() => { const sec = document.querySelector("section.seg[data-shot]"); const wb = [...sec.querySelectorAll(".he-text .wb")].filter((b) => !b.classList.contains("mark"))[1]; (wb.querySelector(".wr") || wb).click(); });
  await page.waitForFunction(() => document.querySelectorAll("#hud .dflt-row button").length > 0, null, { timeout: 30000 });
  await page.evaluate((who) => { const b = [...document.querySelectorAll("#hud .dflt-row button")].find((x) => (x.querySelector(".who") || {}).textContent?.startsWith(`${who} default`)); if (b) b.click(); }, who);
  await page.keyboard.press("Escape");
  await shoot(who.toLowerCase());
}
console.log("verses:", labels.join(", "));
await browser.close();
