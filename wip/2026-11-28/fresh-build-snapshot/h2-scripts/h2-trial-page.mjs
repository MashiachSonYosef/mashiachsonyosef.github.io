// Scratch (builder H2): the trial page (reader/place.html) still opens its card through the one block: a chapter
// opened, every word pressed, «At this word» and the dictionaries drawn, no page error; and its foot's credits.
// node h2-trial-page.mjs <site root> <book> <chapter>
import { join } from "node:path";
const [SITE, BOOK, CH] = process.argv.slice(2);
const { serveTree } = await import(join(SITE, "reader", "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(SITE, "reader", "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
try {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${tree.base}/reader/place.html?b=${BOOK}&c=${CH}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__place && window.__place.ready);
  const got = await page.evaluate(async () => {
    const tick = () => new Promise((r) => setTimeout(r, 4)); const body = document.getElementById("cBody"); let words = 0, drawn = 0, ready = 0, uhal = 0;
    for (const wb of document.querySelectorAll(".wb:not(.mark)")) {
      wb.click(); words += 1;
      const here = () => { const h = [...body.querySelectorAll("h3")].find((x) => x.textContent === "At this word"); return h ? h.nextElementSibling : null; };
      const boxes = () => [...body.querySelectorAll("h3")].filter((h) => h.textContent === "In the dictionaries").map((h) => h.parentElement);
      for (let k = 0; k < 3000 && ((here() || {}).dataset || {}).ready !== "1"; k += 1) await tick();
      for (let k = 0; k < 3000 && boxes().some((b) => b.dataset.ready !== "1"); k += 1) await tick();
      if (here() && here().dataset.ready === "1") drawn += 1; if (boxes().every((b) => b.dataset.ready === "1")) ready += 1;
      uhal += [...body.querySelectorAll(".row .src b")].filter((b) => b.textContent === "unfoldingWord Hebrew and Aramaic Lexicon").length;
      document.getElementById("cClose").click();
    }
    const foot = document.getElementById("credits").innerText;
    return { words, drawn, ready, uhal_rows: uhal, foot_says_part: /Only part of this lexicon is on hand here/.test(foot), errors: window.__place.errors.slice() };
  });
  console.log(JSON.stringify({ ...got, page_errors: errors }));
} finally { await browser.close(); await tree.close(); }
