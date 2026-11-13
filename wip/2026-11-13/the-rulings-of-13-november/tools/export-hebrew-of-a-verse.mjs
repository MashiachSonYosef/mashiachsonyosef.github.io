// A verse's Hebrew as the page's export writes it: press the section's Hebrew export twice and read the line under
// the section's heading in the file. Changes nothing.
// node export-hebrew-of-a-verse.mjs <reader dir> <reader base url> <book> <label> [<label> ...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const [reader, base, book, ...labels] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
await page.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg", { state: "attached", timeout: 60000 });
for (const label of labels) {
  const ok = await page.evaluate(async (label) => {
    const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
    if (!sec) return false;
    sec.scrollIntoView({ block: "center" });
    for (let i = 0; i < 150 && !sec.querySelector(".he-text .wb"); i += 1) await new Promise((r) => setTimeout(r, 100));
    document.querySelectorAll(".xp.armed").forEach((x) => x.click());
    sec.setAttribute("data-probe", "1");
    const open = sec.querySelector(".xp-open");
    if (open && !sec.querySelector(".xp-menu .xp-row .xp")) open.click();
    for (let i = 0; i < 50 && !sec.querySelector(".xp-menu .xp-row .xp"); i += 1) await new Promise((r) => setTimeout(r, 100));
    return !!sec.querySelector(".xp-menu .xp-row .xp");
  }, label);
  if (!ok) { console.log(`${label}: no section or no export button`); continue; }
  const sel = "section.seg[data-probe='1'] .xp-menu .xp-row:first-of-type .xp:nth-of-type(1)";
  await page.click(sel);
  await page.waitForFunction(() => /Press again/.test(document.querySelector("section.seg[data-probe='1'] .xp-note")?.textContent || ""), { timeout: 25000 });
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 25000 }), page.click("section.seg[data-probe='1'] .xp-row .xp.armed")]);
  const text = readFileSync(await dl.path(), "utf8").split("\n");
  const at = text.findIndex((l) => l === `## ${label}`);
  let line = null;
  for (let i = at + 1; at >= 0 && i < text.length; i += 1) { const l = text[i]; if (!l || l.startsWith("unit:")) continue; line = l; break; }
  console.log(JSON.stringify({ label, line }));
  await page.evaluate(() => { const s = document.querySelector("section.seg[data-probe='1']"); if (s) s.removeAttribute("data-probe"); });
}
await browser.close();
