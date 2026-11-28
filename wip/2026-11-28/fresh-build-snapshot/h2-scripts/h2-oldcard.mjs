// Scratch (builder H2): the card a press opens at each place given, read off a tree's live reader, in the way of
// S/s29w/tools/probe-cards-20.mjs (its pills, its held-back line, its head, the pieces it says stand here), and the
// card's whole text besides. With "switch", the page is opened at rest and the row's «readings matched by spelling»
// is pressed first, as a reader turns the older card on. Read only; the site root is served on a port the machine gives.
// node h2-oldcard.mjs <site root> <places.json> <base|switch|rest> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [SITE, PLACES, MODE, OUT] = process.argv.slice(2);
// a longer wait before a card is first read, for a second reading of places whose cards differed (H2_EXTRA_MS)
const EXTRA = Number(process.env.H2_EXTRA_MS || 0), TWICE = !!process.env.H2_TWICE, NUDGE = Number(process.env.H2_NUDGE || 0);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(SITE);
const browser = await pw.chromium.launch(launchOptions());
const out = [];
const byBook = new Map();
for (const p of places) (byBook.get(p.book) || byBook.set(p.book, []).get(p.book)).push(p);
try {
  for (const [book, ps] of byBook) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const failed = []; page.on("requestfailed", (r) => failed.push(`${r.url().replace(tree.base, "")} (${(r.failure() || {}).errorText})`));
    await page.goto(`${tree.base}/reader/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    // the files that land after the first paint and change what a card holds, waited for as the page says them
    await page.waitForFunction(() => { const d = window.__default; return !d || !d.book || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1500 + EXTRA);
    let switched = null;
    if (MODE === "switch") {
      switched = await page.evaluate(() => { const b = document.getElementById("cardPill"); if (!b || b.closest("[hidden]")) return "no switch on this book"; b.click(); return window.__placeCard.on; });
      await page.waitForTimeout(300);
    }
    for (const p of ps) {
      const got = await page.evaluate(async ({ si, e, EXTRA, TWICE, NUDGE }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const hud = document.getElementById("hud");
        const secs = document.querySelectorAll("section.seg");
        const sec = secs[si];
        if (!sec) return { fault: `no section ${si}` };
        window.__materialise(Math.max(0, si - 1), si + 2);
        sec.scrollIntoView(); await turn(250);
        const word = sec.__sec.words[e];
        const wb = [...sec.querySelectorAll(".wb")].find((x) => x.__word === word);
        if (!wb) return { fault: `no entry ${e}` };
        // the word brought to the same height of the window on every tree (100 px from the top), so that a page whose
        // head is taller or shorter does not set the word a pixel apart and tip a card fitted at its edge
        window.scrollBy(0, wb.getBoundingClientRect().top - 100 + NUDGE); await turn(200);
        const before = wb.getBoundingClientRect().top;
        const g = wb.querySelector(":scope > .g");
        const line = g ? g.textContent : null, credit = g ? (g.dataset.by || g.title || "") : "";
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        // with H2_TWICE, the card is opened, let stand, shut, and opened again, and the second is read: what a file
        // that landed meanwhile adds comes with the next card opened, by the page's own rule
        if (TWICE) { (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); await turn(3000); document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await turn(300); window.scrollBy(0, wb.getBoundingClientRect().top - 100 + NUDGE); await turn(250); }
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); const place = hud.querySelector(":scope > .place-card"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")) || !!(place && window.__placeCard.open && window.__placeCard.open.drawn); };
        while (!settled() && performance.now() - t0 < 20000) await turn(50);
        // a card is read once it stands still: read again every 700 ms until two readings agree (the layers that land
        // late, the source suggested and the lattice's other numbers, are let land), at most ten times
        const look = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return JSON.stringify([hud.innerText, [...hud.classList].filter((c) => c !== "pop").sort()]); };
        await turn(EXTRA); let was = null; for (let k = 0; k < 10; k += 1) { await turn(700); const now = look(); if (now === was) break; was = now; }
        const read = hud.querySelector(":scope > .rows > .b-read");
        const pills = read ? [...read.querySelectorAll(":scope > .r-pills > button")].map((x) => [x.textContent.replace(/\s+/gu, " ").trim(), (x.title || "").slice(0, 60), x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [];
        const held = hud.querySelector(".withheld-line");
        const wn = hud.querySelector(":scope > .head .wn");
        const here = read ? [...read.querySelectorAll(":scope > .r-piece")].map((x) => x.textContent.replace(/\s+/gu, " ").trim().slice(0, 80)) : [];
        const res = { line, credit, head: wn ? wn.textContent : null, pills, held: held ? held.textContent.replace(/\s+/gu, " ").trim() : "", here, settled: settled(),
          geo: (() => { const w = wb.getBoundingClientRect(), h = hud.getBoundingClientRect(); return { before, maxH: hud.style.maxHeight, data: { ...hud.dataset }, rowsH: (hud.querySelector(":scope > .rows") || {}).clientHeight, kids: [...hud.children].map((k) => `${k.className}:${k.offsetHeight}`).join(" "), word: [Math.round(w.top), Math.round(w.bottom)], card: [Math.round(h.top), Math.round(h.height)], scrollY: Math.round(window.scrollY), page: document.documentElement.scrollHeight, inner: window.innerHeight }; })(),
          place: !!hud.querySelector(":scope > .place-card"), cls: [...hud.classList].filter((c) => c !== "pop").sort().join(" "), text: hud.innerText.replace(/\s+/gu, " ").trim() };
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(100);
        return res;
      }, { si: p.si, e: p.e, EXTRA, TWICE, NUDGE });
      out.push({ ...p, mode: MODE, switched, ...got });
    }
    if (errors.length) out.push({ book, pageerror: errors });
    if (failed.length) out.push({ book, requestfailed: failed });
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`${out.filter((x) => x.settled).length} settled of ${places.length}; place cards ${out.filter((x) => x.place).length}; page errors ${out.filter((x) => x.pageerror).length}`);
