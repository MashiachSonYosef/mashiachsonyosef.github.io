// Read-only: open a book at a verse, optionally show the marks, optionally press a word; save a screenshot.
// usage: node p_shot.mjs <reader> <book> <label> <out.png> [marks] [press=<entry index>] [query=...]
import { join } from "node:path";
const [R, BOOK, LABEL, OUT, ...rest] = process.argv.slice(2);
const marks = rest.includes("marks"); const press = (rest.find((x) => x.startsWith("press=")) || "").slice(6); const q = (rest.find((x) => x.startsWith("query=")) || "").slice(6);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${tree.base}/zone.html?b=${BOOK}${q ? "&" + q : ""}`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__materialise());
  const info = await page.evaluate(async ({ label, marks, press }) => {
    const turn = (ms) => new Promise((r) => setTimeout(r, ms));
    if (marks) document.getElementById("marksToggle").click();
    const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
    if (!sec) return { fault: "no section" };
    sec.scrollIntoView({ block: "start" }); window.scrollBy(0, -80); await turn(400);
    let card = null;
    if (press !== "") {
      const wb = [...sec.querySelectorAll(".he-text .wb")][Number(press)];
      (wb.querySelector(".w .wr") || wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      await turn(2500);
      const hud = document.getElementById("hud");
      card = hud ? hud.innerText.slice(0, 3000) : null;
    }
    return { card };
  }, { label: LABEL, marks, press });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT });
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
} finally { await browser.close(); await tree.close(); }
