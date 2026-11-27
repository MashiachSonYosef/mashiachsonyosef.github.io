// Read-only: for every sampled placing, the page with the off-by-default sources opened (?kinds=open), a press on the
// word, and the card as it opens: the block it stands on, every pill (text, the M ids behind it, whether it is of a
// source off by default), the line under the word. Serves the frozen tree on a port the machine picks; writes nothing there.
// Usage: node probe-samples.mjs <reader dir> <samples.json> <out.jsonl>
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const [R, SAMPLES, OUT] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const samples = JSON.parse(readFileSync(SAMPLES, "utf8"));
const done = new Set(existsSync(OUT) ? readFileSync(OUT, "utf8").split("\n").filter(Boolean).map((l) => { const j = JSON.parse(l); return `${j.book}|${j.si}|${j.e}`; }) : []);
const byBook = new Map();
for (const p of samples) { const k = `${p.book}|${p.si}|${p.e}`; if (done.has(k)) continue; const b = byBook.get(p.book) || byBook.set(p.book, new Map()).get(p.book); if (!b.has(k)) b.set(k, { book: p.book, si: p.si, e: p.e, label: p.label, n: p.n }); }
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const [book, ps] of byBook) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try { await page.goto(`${tree.base}/zone.html?b=${book}&kinds=open`, { waitUntil: "load", timeout: 120000 }); break; }
      catch (e) { if (attempt === 2) throw e; }
    }
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    for (const p of ps.values()) {
      const got = await page.evaluate(async ({ si, e }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const hud = document.getElementById("hud");
        const sec = document.querySelectorAll("section.seg")[si];
        if (!sec) return { fault: `no section ${si}` };
        sec.scrollIntoView(); await turn(200);
        { const t1 = performance.now(); while (!sec.querySelector(".he-text .wb") && performance.now() - t1 < 15000) { sec.scrollIntoView(); await turn(150); } }
        const wbs = [...sec.querySelectorAll(".he-text .wb")];
        const wb = wbs[e];
        if (!wb) return { fault: `no entry ${e} of ${wbs.length}` };
        const g = wb.querySelector(":scope > .g");
        const line = g ? g.textContent : null;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        while (!settled() && performance.now() - t0 < 20000) await turn(50);
        await turn(350);
        const read = hud.querySelector(":scope > .rows > .b-read");
        const box = read ? read.querySelector(":scope > .r-pills") : null;
        const pills = box ? [...box.querySelectorAll(":scope > button")].map((x) => [x.textContent.replace(/\s+/gu, " ").trim(), x.dataset.by || "", x.dataset.rests ? 1 : 0]) : [];
        const wn = hud.querySelector(":scope > .head .wn");
        const heq = read ? read.querySelector(".he-q") : null;
        const held = hud.querySelector(".withheld-line");
        const res = { line, head: wn ? wn.textContent : null, block: heq ? heq.textContent : null, pills, ds: box ? { ...box.dataset } : null, held: held ? held.textContent.replace(/\s+/gu, " ").trim().slice(0, 300) : "", settled: settled() };
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(80);
        return res;
      }, { si: p.si, e: p.e });
      appendFileSync(OUT, JSON.stringify({ ...p, ...got }) + "\n");
    }
    if (errors.length) appendFileSync(OUT.replace(/\.jsonl$/u, ".errors.txt"), `${book}: ${errors[0]}\n`);
    await ctx.close();
    process.stderr.write(`${book} ${ps.size}\n`);
  }
} finally { await browser.close(); await tree.close(); }
