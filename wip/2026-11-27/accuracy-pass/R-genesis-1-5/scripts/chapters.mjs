// Read-only: opens each chapter page /genesis/1/ … /genesis/5/ of the frozen tree as a first visit and writes: the page title,
// the time to the first words, the verse standing at the top of the window, the chapter heading's own words, page errors,
// requests that answered 404; a picture of each.
// Usage: node chapters.mjs <tree root> <out dir>
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
mkdirSync(join(OUT, "shots"), { recursive: true });
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
const out = [];
try {
  for (const ch of [1, 2, 3, 4, 5]) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errors = [], bad = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("requestfailed", (r) => bad.push(["failed", r.url().replace(tree.base, "")]));
    page.on("response", (r) => { if (r.status() >= 400) bad.push([r.status(), r.url().replace(tree.base, "")]); });
    const t0 = Date.now();
    await page.goto(`${tree.base}/genesis/${ch}/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    const first = Date.now() - t0;
    await page.waitForTimeout(3500);
    const info = await page.evaluate(() => {
      const secs = [...document.querySelectorAll("section.seg")];
      const top = secs.find((s) => s.getBoundingClientRect().bottom > 60);
      const heads = [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /^(chapter title|commonly read as)$/iu.test(e.textContent.trim())).map((e) => (e.parentElement ? e.parentElement.innerText.replace(/\s+/gu, " ").trim().slice(0, 120) : ""));
      return { title: document.title, scrollY: Math.round(window.scrollY), topVerse: top ? top.querySelector(".vnum").textContent.trim() : null, heads: heads.slice(0, 12), sections: secs.length };
    });
    await page.screenshot({ path: join(OUT, "shots", `chapter-page-${ch}.png`) });
    out.push({ ch, first_words_ms: first, ...info, errors, bad });
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(join(OUT, "chapter-pages.json"), JSON.stringify(out, null, 1));
for (const o of out) console.log(o.ch, o.title, "| first words", o.first_words_ms, "ms | top verse", o.topVerse, "| errors", o.errors.length, "| bad", JSON.stringify(o.bad).slice(0, 200));
