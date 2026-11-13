// A picture of one word's card, as a first visit finds it: the page opened at a section, the word pressed, the card
// photographed when its readings have arrived. For showing a person what a change looks like.
// node card-shot.mjs <reader dir (for its tools)> <zone.html address> <book> <section label> <word number> <out.png> [a pill's text to press]
// Nothing is written but the picture.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, address, book, label, wordArg, out, pill = ""] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
try {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(`${address}?b=${book}&at=${encodeURIComponent(label)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(900);
  const said = await p.evaluate(async ({ label, n, pill }) => {
    const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
    const words = sec ? [...sec.querySelectorAll(".he-text .wb")].filter((x) => !x.classList.contains("mark")) : [];
    const wb = words[n - 1];
    if (!wb) return { fault: "the word is not on the page" };
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    const hud = document.getElementById("hud");
    const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
    const t0 = Date.now(); while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
    await new Promise((r) => setTimeout(r, 700));
    if (pill) { const x = [...hud.querySelectorAll(".r-pills > button")].find((y) => y.textContent === pill); if (x) { x.click(); await new Promise((r) => setTimeout(r, 500)); } else return { fault: `no pill reads ${pill}` }; }
    return { head: (hud.querySelector(".head .wn") || {}).textContent || "", withheld: (hud.querySelector(".withheld-line") || {}).textContent || "", pills: [...hud.querySelectorAll(".r-pills > button")].slice(0, 6).map((x) => x.textContent) };
  }, { label, n: Number(wordArg), pill });
  console.log(JSON.stringify(said));
  if (!said.fault) await p.locator("#hud").screenshot({ path: out });
} finally { await b.close(); }
