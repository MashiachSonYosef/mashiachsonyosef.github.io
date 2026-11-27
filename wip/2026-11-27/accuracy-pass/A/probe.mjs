// Read-only probe (helper A): for each place given (book, section index si, entry index e), the page as a first
// visit opens it; a press on the word opens its card; the block the card opens on is read (its label, its pills, what
// the card says each gate withheld, the sources behind each pill), then each other block of the division is pressed
// in turn and read the same way (a block press keeps nothing on the device). Where a place asks it (whole: true) the
// whole form's division is pressed last. Serves the tree on a port the machine gives and writes nothing in the tree.
// Usage: node probe.mjs <reader dir> <places.json> [query string, e.g. "maqaf=maqaf"] > out.json
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [R, PLACES, QUERY = ""] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
const out = [];
const byBook = new Map();
for (const p of places) { const k = p.whole ? `${p.book}\u0000${p.si}\u0000${p.e}` : p.book; (byBook.get(k) || byBook.set(k, []).get(k)).push(p); }
try {
  for (const [, ps] of byBook) {
    const book = ps[0].book;
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${tree.base}/zone.html?b=${book}${QUERY ? `&${QUERY}` : ""}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    for (const p of ps) {
      const got = await page.evaluate(async ({ si, e, whole }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const hud = document.getElementById("hud");
        const sec = document.querySelectorAll("section.seg")[si];
        if (!sec) return { fault: `no section ${si}` };
        sec.scrollIntoView(); await turn(300);
        { const t0 = performance.now(); while (!sec.querySelector(".he-text .wb") && performance.now() - t0 < 15000) { sec.scrollIntoView(); await turn(150); } }
        const wbs = [...sec.querySelectorAll(".he-text .wb")];
        const wb = wbs[e];
        if (!wb) return { fault: `no entry ${e} of ${wbs.length}` };
        const g = wb.querySelector(":scope > .g");
        const line = g ? g.textContent : null;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(80);
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        const wait = async () => { const t0 = performance.now(); await turn(60); while (!settled() && performance.now() - t0 < 20000) await turn(50); await turn(350); };
        const readNow = () => {
          const read = hud.querySelector(":scope > .rows > .b-read");
          const lab = read ? read.querySelector(":scope > .r-label") : null;
          const heq = lab ? lab.querySelector(".he-q") : null;
          const pillsEl = read ? read.querySelector(":scope > .r-pills") : null;
          const ds = pillsEl ? { ...pillsEl.dataset } : null;
          const pills = pillsEl ? [...pillsEl.querySelectorAll(":scope > button")].map((x) => [x.textContent.replace(/\s+/gu, " ").trim(), (x.title || "").slice(0, 90), x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [];
          const cut = hud.querySelector(":scope > .rows > .b-cut");
          const cell = hud.querySelector(":scope > .rows > .b-cell");
          const cuts = cut ? [...cut.querySelectorAll(".s-pills button")].map((x) => [x.textContent, x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [];
          const cells = cell ? [...cell.querySelectorAll(".s-pills button")].map((x) => [x.textContent, x.getAttribute("aria-pressed") === "true" ? 1 : 0, x.title || ""]) : [];
          const held = hud.querySelector(".withheld-line");
          const signs = read ? read.querySelector(".signs-off") : null;
          const chain = hud.querySelector(":scope > .rows > .b-chain");
          return {
            label: lab ? lab.textContent : null, block: heq ? heq.textContent : null, dataset: ds, pills,
            pool: pillsEl ? [...(window.__pool || [])] : [], poolBy: pillsEl ? [...(window.__poolBy || [])] : [], poolLead: pillsEl ? [...(window.__poolLead || [])] : [],
            poolOv: pillsEl ? [...(window.__poolOv || [])] : [], poolPlace: pillsEl ? [...(window.__poolPlace || [])] : [],
            cuts, cells, held: held ? held.textContent.replace(/\s+/gu, " ").trim() : "", signs: signs ? signs.textContent : "",
            here: read ? [...read.querySelectorAll(":scope > .r-piece, :scope > .r-dflt")].map((x) => x.textContent.replace(/\s+/gu, " ").trim().slice(0, 140)) : [],
            notes: read ? [...read.querySelectorAll(".r-note, .r-notes li, .r-opens")].length : 0,
            said: read ? [...read.querySelectorAll(":scope > p")].map((x) => `${x.className}: ${x.textContent.replace(/\s+/gu, " ").trim().slice(0, 160)}`) : [],
            chain: chain ? chain.textContent.replace(/\s+/gu, " ").trim().slice(0, 200) : "",
            settled: settled(),
          };
        };
        await wait();
        const head = hud.querySelector(":scope > .head .wn");
        const res = { line, head: head ? head.textContent : null, entry: window.__cardEntry || "", name: window.__cardName || "", gradedBy: window.__cardGradedBy || "", place: window.__cardPlace || "",
          kinds: window.__kinds, signsPref: window.__signs, opened: readNow(), blocks: [] };
        // each block of the division open, pressed in turn (nothing is kept on the device by a block press)
        const nBlocks = res.opened.cells.length;
        if (nBlocks > 1) for (let i = 0; i < nBlocks; i += 1) {
          const cell = hud.querySelector(":scope > .rows > .b-cell");
          const btn = cell ? [...cell.querySelectorAll(".s-pills button")][i] : null;
          if (!btn) break;
          btn.click(); await wait();
          res.blocks.push({ i, ...readNow() });
        }
        if (whole) {
          const cut = hud.querySelector(":scope > .rows > .b-cut");
          const btns = cut ? [...cut.querySelectorAll(".s-pills button")] : [];
          const one = btns.find((b) => !b.textContent.includes(" + "));
          if (one) { one.click(); await wait(); res.whole = readNow(); }
        }
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(100);
        return res;
      }, { si: p.si, e: p.e, whole: !!p.whole });
      out.push({ ...p, ...got });
    }
    if (errors.length) out.push({ book, pageerror: errors.slice(0, 3) });
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
console.log(JSON.stringify(out));
