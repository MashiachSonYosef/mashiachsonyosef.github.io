// Read-only: on the Genesis chapter page of the frozen tree, as a first visit, for every word of the sections given:
// the line as drawn under the word, then a press on the word and the card it opens (head, notes, the reading named,
// the blocks, the pills with their sources, the record shown under the pills). For every word whose number in the run
// is a multiple of ten, and for the words listed as doubted, each other block of the card is pressed too.
// Serves the tree on a port the machine gives and writes only to the out dir.
// Usage: node cards.mjs <tree root> <out dir> <first section> <last section> [doubted.json]
import { appendFileSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT, S0 = "0", S1 = "137", DOUBT = ""] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const doubted = new Set(DOUBT && existsSync(DOUBT) ? JSON.parse(readFileSync(DOUBT, "utf8")) : []);   // "chapter:verse:word", the word counted without the marks
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
const outFile = join(OUT, `cards-${S0}-${S1}.jsonl`);
writeFileSync(outFile, "");
const errors = [];
let n = 0;
const started = Date.now();
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${tree.base}/genesis/1/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await page.waitForTimeout(3000);
  // the run's word numbers continue from the sections before the first one asked for
  n = await page.evaluate((s0) => [...document.querySelectorAll("section.seg")].slice(0, s0).reduce((a, s) => a + s.querySelectorAll(".he-text .wb:not(.mark)").length, 0), Number(S0));
  for (let si = Number(S0); si <= Number(S1); si += 1) {
    const marksAt = await page.evaluate((si) => { const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); return { label: s.querySelector(".vnum").textContent.trim(), marks: [...s.querySelectorAll(".he-text .wb")].map((w) => (w.classList.contains("mark") ? w.dataset.mark || "MARK" : "")) }; }, si);
    await page.waitForTimeout(250);
    let wordNo = 0;
    for (let wi = 0; wi < marksAt.marks.length; wi += 1) {
      if (marksAt.marks[wi]) continue;
      n += 1; wordNo += 1;
      const deep = n % 10 === 0 || doubted.has(`${marksAt.label}:${wordNo}`);
      const got = await page.evaluate(async ({ si, wi, deep }) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const txt = (el) => (el ? el.textContent.replace(/\s+/gu, " ").trim() : null);
        const hud = document.getElementById("hud");
        const sec = document.querySelectorAll("section.seg")[si];
        const wbs = [...sec.querySelectorAll(".he-text .wb")];
        const wb = wbs[wi];
        const label = txt(sec.querySelector(".vnum"));
        const he = wb.querySelector(".w").textContent;
        // the line as drawn: a word of a maqaf run reads its own part of the run's line
        const join = wb.closest(".wjoin");
        let gEl = wb.querySelector(":scope > .g"), inRun = false;
        if (join) {
          const idx = [...join.querySelectorAll(".wj-ink .wb")].indexOf(wb);
          const part = join.querySelector(`:scope > .g.parts > .g-part[data-wi="${idx}"]`);
          if (part) { gEl = part; inRun = true; }
        }
        let line = null, credit = null, creditTitle = null;
        if (gEl) {
          const c = gEl.cloneNode(true); const lic = c.querySelector(".g-lic");
          if (lic) { credit = lic.dataset.line || null; creditTitle = lic.getAttribute("title"); lic.remove(); }
          line = c.textContent;
        }
        const shown = gEl ? getComputedStyle(gEl).display !== "none" && getComputedStyle(gEl).visibility !== "hidden" : false;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(30);
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        while (!settled() && performance.now() - t0 < 25000) await turn(40);
        await turn(220);
        const ms = Math.round(performance.now() - t0);
        const readCard = () => {
          const read = hud.querySelector(":scope > .rows > .b-read");
          const pillsEl = read ? read.querySelector(":scope > .r-pills") : null;
          const pills = pillsEl ? [...pillsEl.querySelectorAll(":scope > button")].map((x) => [txt(x), x.dataset.by || "", x.dataset.grade || "", x.title || "", x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [];
          const vis = (el) => !!el && el.getClientRects().length > 0;
          return {
            label: txt(read && read.querySelector(":scope > .r-label")),
            pieces: read ? [...read.querySelectorAll(":scope > .r-piece, :scope > .r-dflt")].map((x) => [vis(x) ? 1 : 0, txt(x)]) : [],
            withheld: txt(hud.querySelector(".withheld-line")),
            signsOff: txt(hud.querySelector(".kq-role.signs-off")),
            ds: pillsEl ? { ...pillsEl.dataset } : null,
            pills,
            rec: { text: txt(hud.querySelector(".d-slot .d-text")), notes: txt(hud.querySelector(".d-slot .sense-notes")), att: txt(hud.querySelector(".d-slot .att")), row: (hud.querySelector(".d-slot .d-card") || { dataset: {} }).dataset.row || null, key: (hud.querySelector(".d-slot .d-card") || { dataset: {} }).dataset.key || null },
            prov: (() => { const p = hud.querySelector(":scope > .prov"); return p && !p.hidden ? txt(p) : null; })(),
          };
        };
        const blocksEl = [...hud.querySelectorAll(".b-cell .s-pills button")];
        const res = {
          label, he, line, credit, creditTitle, inRun, shown, ms, settled: settled(),
          head: txt(hud.querySelector(":scope > .head .wn")),
          headHe: txt(hud.querySelector(":scope > .head b")),
          roles: [...hud.querySelectorAll(":scope > .head .kq-role")].map(txt),
          now: [txt(hud.querySelector(".r-now .k")), txt(hud.querySelector(".r-now .v"))],
          blocks: blocksEl.map((b) => [txt(b), b.getAttribute("aria-pressed") === "true" ? 1 : 0]),
          card: readCard(),
          text: deep ? hud.innerText.slice(0, 6000) : null,
        };
        if (deep && blocksEl.length > 1) {
          res.others = [];
          for (let bi = 0; bi < blocksEl.length; bi += 1) {
            const b = hud.querySelectorAll(".b-cell .s-pills button")[bi];
            if (!b || b.getAttribute("aria-pressed") === "true") continue;
            const name = txt(b);
            b.click();
            const t1 = performance.now();
            await turn(120);
            while (!settled() && performance.now() - t1 < 15000) await turn(40);
            await turn(200);
            res.others.push({ block: name, blocks: [...hud.querySelectorAll(".b-cell .s-pills button")].map((x) => [txt(x), x.getAttribute("aria-pressed") === "true" ? 1 : 0]), now: [txt(hud.querySelector(".r-now .k")), txt(hud.querySelector(".r-now .v"))], card: readCard() });
          }
        }
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await turn(40);
        return res;
      }, { si, wi, deep });
      appendFileSync(outFile, JSON.stringify({ n, si, wi, wordNo, deep, ...got }) + "\n");
    }
    if (si % 10 === 0) console.log(`section ${si} done, word ${n}, ${Math.round((Date.now() - started) / 1000)}s`);
  }
} catch (e) { console.log("FAULT", e.message); } finally { await browser.close(); await tree.close(); }
console.log(JSON.stringify({ words: n, seconds: Math.round((Date.now() - started) / 1000), pageerrors: errors.slice(0, 5) }));
