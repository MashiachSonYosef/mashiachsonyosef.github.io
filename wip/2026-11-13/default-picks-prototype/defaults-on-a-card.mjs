// The prototype's defaults on a word's card: the reading row's label, the row of each source's pick, and the card
// after choosing another source's default. Pictures of each state. Changes nothing outside the browser.
// node defaults-on-a-card.mjs <reader dir> <reader base url> <book> <label> <word number> <shot dir> [<source to choose> ...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const [reader, base, book, label, nArg, shots, ...choose] = process.argv.slice(2);
const n = Number(nArg);
mkdirSync(shots, { recursive: true });
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 520, height: 980 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.removeItem("fh.default"); } catch (e) { /* a first visit */ } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message || e)));
await page.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg", { state: "attached", timeout: 60000 });
await page.evaluate(async ({ label, n }) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
  sec.scrollIntoView({ block: "start" });
  for (let i = 0; i < 150 && !sec.querySelector(".he-text .wb"); i += 1) await new Promise((r) => setTimeout(r, 100));
  const wb = [...sec.querySelectorAll(".he-text .wb")].filter((b) => !b.classList.contains("mark"))[n - 1];
  (wb.querySelector(".wr") || wb).click();
}, { label, n });
await page.waitForFunction(() => { const h = document.getElementById("hud"); return h && !h.hidden && h.querySelector(".r-now"); }, null, { timeout: 30000 });
await page.waitForFunction(() => document.querySelectorAll("#hud .dflt-row button").length > 0, null, { timeout: 30000 }).catch(() => null);
const say = async (tag) => {
  const got = await page.evaluate(() => ({
    label: (document.querySelector("#hud .r-now .k") || {}).textContent || "",
    reading: (document.querySelector("#hud .r-now .v") || {}).textContent || "",
    row: [...document.querySelectorAll("#hud .dflt-row button")].map((b) => `${b.getAttribute("aria-pressed") === "true" ? "*" : ""}${b.textContent}`),
  }));
  console.log(`${tag}: ${JSON.stringify(got)}`);
  await page.locator("#hud").screenshot({ path: join(shots, `${book}-${label.replace(":", "-")}-${n}-${tag}.png`) });
};
await say("rest");
await page.click("#hud .r-now .dflt");
await page.waitForTimeout(300);
await say("open");
for (const who of choose) {
  const ok = await page.evaluate((who) => {
    const b = [...document.querySelectorAll("#hud .dflt-row button")].find((x) => (x.querySelector(".who") || {}).textContent?.startsWith(`${who} default`));
    if (b) b.click();
    return !!b;
  }, who);
  if (!ok) { console.log(`${who}: no such default here`); continue; }
  await page.waitForTimeout(300);
  await say(who.toLowerCase());
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await browser.close();
