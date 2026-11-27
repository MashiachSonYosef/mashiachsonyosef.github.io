// Read-only probe: opens the page as a first visit, presses one word, and prints the card's text and markup.
// Usage: node probe-one.mjs <reader dir> <book> <section index> <entry index> [rest|open]
import { join } from "node:path";
const [R, book, si, e, STATE = "rest"] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  page.on("pageerror", (x) => console.log("PAGEERROR", x.message));
  await page.goto(`${tree.base}/zone.html?b=${book}${STATE === "open" ? "&kinds=open" : ""}`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.waitForTimeout(800);
  const got = await page.evaluate(async ({ si, e }) => {
    const turn = (ms) => new Promise((r) => setTimeout(r, ms));
    const hud = document.getElementById("hud");
    const sec = document.querySelectorAll("section.seg")[si];
    sec.scrollIntoView(); await turn(250);
    const wb = [...sec.querySelectorAll(".he-text .wb")][e];
    const g = wb.querySelector(":scope > .g");
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    const t0 = performance.now();
    const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
    while (!settled() && performance.now() - t0 < 20000) await turn(50);
    await turn(400);
    return { word: wb.outerHTML.slice(0, 1500), line: g ? g.textContent : null, text: hud.innerText, html: hud.outerHTML };
  }, { si: Number(si), e: Number(e) });
  console.log("WORD", got.word); console.log("LINE", JSON.stringify(got.line)); console.log("TEXT\n" + got.text); console.log("HTML\n" + got.html.slice(0, 14000));
} finally { await browser.close(); await tree.close(); }
