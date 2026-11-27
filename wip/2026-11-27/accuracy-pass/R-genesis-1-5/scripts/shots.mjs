// Read-only: pictures of the places this reader flags, taken on the Genesis chapter page of the frozen tree as a first visit:
// the verse, then the card a press opens (and, where a block is named, the card after a press on that block).
// Also presses the "dictionaries" pill at the top of the page and writes what it lists.
// Usage: node shots.mjs <tree root> <out dir>
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
mkdirSync(join(OUT, "shots"), { recursive: true });
// [section index, word number without marks, block to press or null, file name]
const places = [
  [16, 2, null, "1-17-w2-otam-card-opens-on-self"],
  [0, 6, null, "1-1-w6-veet-card-opens-on-self"],
  [1, 9, null, "1-2-w9-veruach-pressed-pill-53rd-of-57"],
  [104, 16, null, "4-25-w16-zera-spring"],
  [104, 11, null, "4-25-w11-seth-buttocks"],
  [6, 17, null, "1-7-w17-ken-mosquito"],
  [127, 4, "ה", "5-22-w4-haelohim-article-block-whether"],
  [56, 14, null, "3-1-w14-af-ki-run-card"],
  [3, 6, null, "1-4-w6-tov-and-plus-or"],
  [28, 19, null, "1-29-w19-asher-bdb-fragments"],
];
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
const notes = {};
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${tree.base}/genesis/1/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await page.waitForTimeout(3000);
  // the dictionaries pill at the top of the page
  await page.evaluate(() => window.scrollTo(0, 0));
  notes.dictionaries = await page.evaluate(async () => {
    const turn = (ms) => new Promise((r) => setTimeout(r, ms));
    const b = [...document.querySelectorAll("button, summary, [role=button]")].find((x) => /dictionaries\s*▾/u.test(x.textContent));
    if (!b) return { fault: "no dictionaries pill found" };
    const before = b.textContent.trim();
    b.scrollIntoView({ block: "center" }); b.click(); await turn(700);
    const host = b.closest("div, section, p") || b.parentElement;
    return { pill: before, after: (host.parentElement || host).innerText.slice(0, 3000) };
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "shots", "page-top-dictionaries-open.png") });
  await page.keyboard.press("Escape");
  for (const [si, wordNo, block, name] of places) {
    await page.evaluate(({ si }) => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); window.scrollBy(0, -30); }, { si });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(OUT, "shots", `${name}-verse.png`) });
    notes[name] = await page.evaluate(async ({ si, wordNo, block }) => {
      const turn = (ms) => new Promise((r) => setTimeout(r, ms));
      const hud = document.getElementById("hud");
      const sec = document.querySelectorAll("section.seg")[si];
      const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][wordNo - 1];
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
      let t0 = performance.now();
      while (!settled() && performance.now() - t0 < 20000) await turn(50);
      await turn(400);
      if (block) {
        const b = [...hud.querySelectorAll(".b-cell .s-pills button")].find((x) => x.textContent.trim() === block);
        if (b) { b.click(); t0 = performance.now(); await turn(150); while (!settled() && performance.now() - t0 < 15000) await turn(50); await turn(400); }
      }
      return hud.innerText.slice(0, 1800);
    }, { si, wordNo, block });
    await page.screenshot({ path: join(OUT, "shots", `${name}-card.png`) });
  }
  writeFileSync(join(OUT, "shots", "notes.json"), JSON.stringify(notes, null, 1));
  console.log("done", Object.keys(notes).length);
} finally { await browser.close(); await tree.close(); }
