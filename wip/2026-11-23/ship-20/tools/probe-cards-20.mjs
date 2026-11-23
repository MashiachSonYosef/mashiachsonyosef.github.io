// Read-only probe (23 November 2026): for each place given (book, section index, entry index), the page as a first
// visit opens it (or with the dictionaries that rest shut opened: "open"), the line under the word and the card a press
// on the word opens: its pills (text, source title, pressed), its held-back line and the words its head says it stands
// on. Serves the reader on a port the machine gives (serve-tree-v1) and writes nothing.
// Usage: node probe-cards-20.mjs <reader dir> <places.json> [rest|open]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [R, PLACES, STATE = "rest"] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
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
    await page.goto(`${tree.base}/zone.html?b=${book}${STATE === "open" ? "&kinds=open" : ""}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    for (const p of ps) {
      const got = await page.evaluate(async ({ si, e }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const hud = document.getElementById("hud");
        const sec = document.querySelectorAll("section.seg")[si];
        if (!sec) return { fault: `no section ${si}` };
        sec.scrollIntoView(); await turn(250);
        const wbs = [...sec.querySelectorAll(".he-text .wb")];
        const wb = wbs[e];
        if (!wb) return { fault: `no entry ${e} of ${wbs.length}` };
        const g = wb.querySelector(":scope > .g");
        const line = g ? g.textContent : null, credit = g ? (g.dataset.by || g.title || "") : "";
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        while (!settled() && performance.now() - t0 < 20000) await turn(50);
        await turn(300);
        const read = hud.querySelector(":scope > .rows > .b-read");
        const pills = read ? [...read.querySelectorAll(":scope > .r-pills > button")].map((x) => [x.textContent.replace(/\s+/gu, " ").trim(), (x.title || "").slice(0, 60), x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [];
        const held = hud.querySelector(".withheld-line");
        const wn = hud.querySelector(":scope > .head .wn");
        const here = read ? [...read.querySelectorAll(":scope > .r-piece")].map((x) => x.textContent.replace(/\s+/gu, " ").trim().slice(0, 80)) : [];
        const nameWithheld = read && read.querySelector(":scope > .r-pills") ? read.querySelector(":scope > .r-pills").dataset.nameWithheld ?? null : null;
        const res = { line, credit, head: wn ? wn.textContent : null, pills, pressed: pills.filter((x) => x[2]).map((x) => x[0]), held: held ? held.textContent.replace(/\s+/gu, " ").trim() : "", here, name_withheld: nameWithheld, settled: settled() };
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(100);
        return res;
      }, { si: p.si, e: p.e });
      out.push({ ...p, state: STATE, ...got });
    }
    if (errors.length) out.push({ book, pageerror: errors[0] });
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
console.log(JSON.stringify(out, null, 1));
