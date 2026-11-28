// Scratch (builder H2): pictures of the live reader (reader/zone.html) with the place card, at a phone's size (412 x
// 915, deviceScaleFactor 2). Each job opens a book, brings a verse's word to a set height, presses it, waits for its
// card and its dictionaries, does what the job asks, and takes the window. Read only: the site root is served on a
// port the machine gives.
// node h2-shot.mjs <site root> <out dir> <job.json>
//   a job: { name, book, label, n (word number, marks not counted), card ("spelling" for the older card), at (px from
//            the top for the word, default 120), open: [dictionary key, …] (whole entries to open, scrolled to),
//            scroll: "dicts" | "unabridged" | "here-unabridged" | number (the card's body scrolled), menu: true (the bottom bar's menu opened, no word),
//            top: true (the page's head, no word) }
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const [SITE, OUTDIR, JOBS] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const jobs = JSON.parse(readFileSync(JOBS, "utf8"));
mkdirSync(OUTDIR, { recursive: true });
const pw = await loadPlaywright();
const tree = await serveTree(SITE);
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const job of jobs) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage(); const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${tree.base}/reader/zone.html?b=${job.book}${job.card ? `&card=${job.card}` : ""}${job.query ? `&${job.query}` : ""}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg", { timeout: 60000 });
    await page.waitForFunction(() => window.__placeCard && typeof window.__materialise === "function", null, { timeout: 60000 });
    await page.waitForTimeout(1200);
    if (job.top) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500); }
    else if (job.menu) {
      // the reader a little way in, where the bar stands, and its menu opened
      await page.evaluate((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); const i = [...document.querySelectorAll("section.seg")].indexOf(sec); window.__materialise(Math.max(0, i - 2), i + 3); sec.scrollIntoView({ block: "start" }); }, job.label);
      await page.waitForTimeout(900);
      await page.evaluate(() => { const b = document.getElementById("navMenu"); if (b) b.click(); });
      await page.waitForTimeout(600);
    } else {
      const handle = await page.evaluateHandle(async ([label, n, at]) => {
        const all = [...document.querySelectorAll("section.seg")];
        const sec = all.find((s) => s.__sec && s.__sec.label === label); const i = all.indexOf(sec);
        window.__materialise(Math.max(0, i - 3), i + 4);
        await new Promise((r) => setTimeout(r, 300));
        let wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
        if (typeof n === "string") { const cell = [...sec.querySelectorAll(".wjoin")].find((x) => (n === "chain" ? x.__chain : x.__key && !x.__chain)); wb = cell ? cell.querySelector(".wb") : null; }
        const r = wb.getBoundingClientRect(); window.scrollBy(0, r.top - at);
        return wb.querySelector(".w span") || wb.querySelector(".w") || wb;
      }, [job.label, job.n, job.at ?? 120]);
      await page.waitForTimeout(600);
      await handle.tap();
      await page.waitForFunction(() => { const hud = document.getElementById("hud"); if (hud.hidden) return false; const c = hud.querySelector(":scope > .place-card"); if (c) { const boxes = [...c.querySelectorAll("h3")].filter((h) => h.textContent === "In the dictionaries").map((h) => h.parentElement); return !!(window.__placeCard.open && window.__placeCard.open.drawn) && boxes.every((b) => b.dataset.ready === "1"); } const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); }, null, { timeout: 30000 });
      await page.waitForTimeout(900);
      const settled = () => page.waitForFunction(() => { const b = document.querySelector("#hud .b-read"); return !!b && !b.querySelector(".r-wait") && !!(b.querySelector(".r-pills button") || b.querySelector("p:not(.r-label)")); }, null, { timeout: 15000 }).catch(() => null);
      await settled();
      if (job.otherCell) { await page.evaluate(() => { const c = [...document.querySelectorAll("#hud .b-cell .s-pills button")].find((b) => b.getAttribute("aria-pressed") !== "true"); if (c) c.click(); }); await page.waitForTimeout(400); await settled(); await page.waitForTimeout(600); }
      if (job.pill) { const ok = await page.evaluate((t) => { const b = [...document.querySelectorAll("#hud .b-read .r-pills button")].find((x) => x.textContent === t); if (b) b.click(); return !!b; }, job.pill); if (!ok) errors.push(`no pill «${job.pill}»`); await page.waitForTimeout(900); }
      for (const key of job.open || []) {
        const ok = await page.evaluate(async (key) => { const b = document.querySelector(`#hud .place-card button.open[data-src="${key}"]`); if (!b) return false; b.click(); for (let k = 0; k < 300 && b.nextElementSibling.dataset.ready !== "1"; k += 1) await new Promise((r) => setTimeout(r, 20)); const c = document.querySelector("#hud .place-card"); c.scrollTop += b.getBoundingClientRect().top - c.getBoundingClientRect().top - 8; return true; }, key);
        if (!ok) errors.push(`no entry of ${key} to open`);
        await page.waitForTimeout(500);
      }
      if (job.credits) await page.evaluate(() => { const c = document.querySelector("#hud .place-card"); const b = [...c.querySelectorAll("button.more-btn")].find((x) => /credits in full/.test(x.textContent)); b.click(); const f = c.querySelector(".credits-full"); c.scrollTop += f.getBoundingClientRect().top - c.getBoundingClientRect().top - 40; });
      if (job.scroll === "unabridged") await page.evaluate(() => { const c = document.querySelector("#hud .place-card"); const row = [...c.querySelectorAll(".row")].find((r) => (r.querySelector(".src b") || {}).textContent === "Brown-Driver-Briggs, unabridged" && r.querySelector("button.open")); if (row) c.scrollTop += row.getBoundingClientRect().top - c.getBoundingClientRect().top - 4; });
      else if (job.scroll === "here-unabridged") await page.evaluate(() => { const c = document.querySelector("#hud .place-card"); const h = [...c.querySelectorAll("h3")].find((x) => x.textContent === "At this word"); const row = h ? [...h.nextElementSibling.querySelectorAll(".row")].find((r) => (r.querySelector(".src b") || {}).textContent === "Brown-Driver-Briggs, unabridged") : null; if (row) c.scrollTop += row.getBoundingClientRect().top - c.getBoundingClientRect().top - 4; });
      else if (job.scroll === "listing") await page.evaluate(() => { const c = document.querySelector("#hud > .place-card"); const h = document.getElementById("hud"); if (c) h.scrollTop += 0; if (c) c.scrollTop = 0; });
      else if (job.scroll === "uhal") await page.evaluate(() => { const c = document.querySelector("#hud .place-card"); const row = [...c.querySelectorAll(".row")].find((r) => (r.querySelector(".src b") || {}).textContent === "unfoldingWord Hebrew and Aramaic Lexicon"); if (row) c.scrollTop += row.getBoundingClientRect().top - c.getBoundingClientRect().top - 4; });
      else if (job.scroll === "dicts") await page.evaluate(() => { const c = document.querySelector("#hud .place-card"); const h = [...c.querySelectorAll("h3")].find((x) => x.textContent === "In the dictionaries"); if (h) c.scrollTop += h.getBoundingClientRect().top - c.getBoundingClientRect().top - 4; });
      else if (typeof job.scroll === "number") await page.evaluate((y) => { const c = document.querySelector("#hud .place-card") || document.querySelector("#hud .rows"); if (c) c.scrollTop = y; }, job.scroll);
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: join(OUTDIR, `${job.name}.png`) });
    const said = await page.evaluate(() => ({ place: document.getElementById("hud").classList.contains("place"), on: window.__placeCard.on, faults: window.__placeCard.faults }));
    console.log(`${job.name}: ${JSON.stringify(said)}${errors.length ? ` · errors: ${errors.join(" | ")}` : ""}`);
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
