// Read-only first look: open a chapter page as a first visit, write what the page says outside the verses,
// a screenshot, and the whole markup of one opened card, so the reading script knows the card's shape.
// Usage: node probe1.mjs <tree root (holds reader/ and ruth/)> <out dir> <chapter>
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT, CH = "1"] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  const t0 = Date.now();
  await page.goto(`${tree.base}/ruth/${CH}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.waitForTimeout(1500);
  const t1 = Date.now();
  await page.screenshot({ path: join(OUT, `shot-ch${CH}-top.png`) });
  const info = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("section.seg")];
    const outside = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.replace(/\s+/gu, " ").trim();
      if (!t) continue;
      const el = n.parentElement;
      if (el.closest("section.seg") || el.closest("script") || el.closest("style")) continue;
      const cs = getComputedStyle(el);
      const shown = cs.display !== "none" && cs.visibility !== "hidden" && el.getClientRects().length > 0;
      outside.push([shown ? "shown" : "hidden", el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/u).join(".") : ""), t.slice(0, 400)]);
    }
    return { title: document.title, sections: secs.length, first: secs[0] ? secs[0].outerHTML.slice(0, 6000) : null, labels: secs.slice(0, 5).map((s) => s.querySelector(".lbl, .label, h2, h3")?.textContent || s.id || ""), outside };
  });
  writeFileSync(join(OUT, `probe1-ch${CH}.json`), JSON.stringify({ load_ms: t1 - t0, errors, ...info }, null, 1));
  // one card
  const card = await page.evaluate(async () => {
    const turn = (ms) => new Promise((r) => setTimeout(r, ms));
    const sec = document.querySelectorAll("section.seg")[0];
    const wb = sec.querySelectorAll(".he-text .wb")[2];
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    const hud = document.getElementById("hud");
    const t0 = performance.now();
    const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
    while (!settled() && performance.now() - t0 < 20000) await turn(50);
    await turn(500);
    return { html: hud ? hud.outerHTML : null, text: hud ? hud.innerText : null };
  });
  writeFileSync(join(OUT, `probe1-card.html`), card.html || "");
  writeFileSync(join(OUT, `probe1-card.txt`), card.text || "");
  await page.screenshot({ path: join(OUT, `shot-ch${CH}-card.png`) });
  console.log("load ms", t1 - t0, "sections", info.sections, "errors", errors.length, "card html bytes", (card.html || "").length);
  await ctx.close();
} finally { await browser.close(); await tree.close(); }
