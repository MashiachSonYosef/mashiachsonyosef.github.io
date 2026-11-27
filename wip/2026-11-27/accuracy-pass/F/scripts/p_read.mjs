// Read-only: for each chosen place, how the page draws it on a first visit, how with the scribes' marks shown, and what a press shows.
// usage: node p_read.mjs <reader dir> <targets.json> <out.json>
import { join } from "node:path"; import { readFileSync, writeFileSync } from "node:fs";
const [R, TARGETS, OUT, ORDER = ""] = process.argv.slice(2);
import { existsSync } from "node:fs";
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const targets = JSON.parse(readFileSync(TARGETS, "utf8")).filter((t) => t.e !== null && t.e !== undefined);
const byBook = new Map(); for (const t of targets) (byBook.get(t.book) || byBook.set(t.book, []).get(t.book)).push(t);
const pw = await loadPlaywright(); const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const done = new Set(out.map((x) => x.book));
const first = ORDER.split(",").filter(Boolean);
const books = [...first.filter((b) => byBook.has(b)), ...[...byBook.keys()].filter((b) => !first.includes(b))].filter((b) => !done.has(b));
try {
  for (const book of books) { const ts = byBook.get(book);
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.evaluate((sis) => { for (const si of sis) window.__materialise(Math.max(0, si - 2), si + 3); }, [...new Set(ts.map((t) => t.si))]);
    await page.waitForTimeout(700);
    // at rest
    const rest = await page.evaluate((ts) => ts.map((t) => {
      const sec = document.querySelectorAll("section.seg")[t.si]; const wb = sec && [...sec.querySelectorAll(".he-text .wb")][t.e];
      if (!wb) return { fault: "no entry" };
      const w = wb.querySelector(":scope > .w"), g = wb.querySelector(":scope > .g");
      const cs = getComputedStyle(wb), ws = w ? getComputedStyle(w) : null;
      const nx = wb.nextSibling; const gapAfter = nx && nx.nodeType === 3 ? JSON.stringify(nx.data) : nx ? `<${nx.className || nx.nodeName}>` : "end";
      const gg = g ? g.cloneNode(true) : null; if (gg) gg.querySelectorAll(".g-lic").forEach((x) => x.remove());
      const lm = [...wb.querySelectorAll(".lm")].map((x) => { const s = getComputedStyle(x); return { cls: x.className, text: x.textContent, size: s.fontSize, word_size: ws.fontSize, valign: s.verticalAlign, color: s.color, title: x.title }; });
      const mq = [...wb.querySelectorAll(".mq, .mg-all")].map((x) => ({ text: x.textContent, color: getComputedStyle(x).color, fill: getComputedStyle(x).webkitTextFillColor }));
      const r0 = w ? w.getBoundingClientRect() : null;
      return { text: w ? w.textContent : null, cls: wb.className, mark: wb.dataset.mark || null, display: cs.display, title: wb.title || null, line: gg ? gg.textContent : null, credit: g && g.querySelector(".g-lic") ? g.querySelector(".g-lic").dataset.line : null,
        gapAfter, inJoin: wb.closest(".wjoin") ? wb.closest(".wjoin").className : null, lm, mq, wr: [...wb.querySelectorAll(".wr")].map((x) => [x.textContent, x.className, x.title]),
        stroke: wb.querySelector(".kq-stroke") ? wb.querySelector(".kq-stroke").dataset.s : null, wColor: ws ? ws.color : null, box: r0 ? [Math.round(r0.width), Math.round(r0.height)] : null, sectionMarksAtRest: null };
    }), ts);
    // the scribes' marks shown
    await page.evaluate(() => { const b = document.getElementById("marksToggle"); if (b && !b.hidden && !document.body.classList.contains("marks-on")) b.click(); });
    await page.waitForTimeout(300);
    const on = await page.evaluate((ts) => ts.map((t) => {
      const sec = document.querySelectorAll("section.seg")[t.si]; const wb = sec && [...sec.querySelectorAll(".he-text .wb")][t.e];
      if (!wb) return {};
      const w = wb.querySelector(":scope > .w"); const st = wb.querySelector(".kq-stroke");
      const r0 = w ? w.getBoundingClientRect() : null;
      return { display: getComputedStyle(wb).display, strokeDrawn: st ? getComputedStyle(st, "::before").content : null, box: r0 ? [Math.round(r0.width), Math.round(r0.height)] : null, border: w ? getComputedStyle(w).borderTopWidth + " " + getComputedStyle(w).borderTopStyle : null, wSize: w ? getComputedStyle(w).fontSize : null };
    }), ts);
    // a press on each (marks shown, so a hidden mark can be pressed)
    const pressed = [];
    for (const t of ts) {
      const got = await page.evaluate(async (t) => {
        const turn = (ms) => new Promise((r) => setTimeout(r, ms));
        const hud = document.getElementById("hud");
        const sec = document.querySelectorAll("section.seg")[t.si]; const wb = sec && [...sec.querySelectorAll(".he-text .wb")][t.e];
        if (!wb) return { fault: "no entry" };
        sec.scrollIntoView({ block: "center" }); await turn(120);
        const press = async (el) => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await turn(60);
          el.click();
          const t0 = performance.now();
          const read = () => hud && hud.querySelector(":scope > .rows > .b-read");
          const settled = () => { const r = read(); return !!(r && r.children.length && !r.querySelector(":scope > .r-wait")); };
          const isMark = wb.classList.contains("mark");
          while (!settled() && performance.now() - t0 < (isMark ? 300 : 1800)) await turn(50);
          await turn(150);
          const head = hud.querySelector(":scope > .head");
          const r = read();
          const pills = r ? [...r.querySelectorAll(":scope > .r-pills > button")].slice(0, 6).map((x) => x.textContent.replace(/\s+/gu, " ").trim() + (x.getAttribute("aria-pressed") === "true" ? " *" : "")) : [];
          const res = { open: hud && !hud.hidden && getComputedStyle(hud).display !== "none", head: head ? head.innerText.replace(/\n+/gu, " | ").slice(0, 600) : null, roles: head ? [...head.querySelectorAll(".kq-role")].map((x) => x.textContent) : [], keys: head ? [...head.querySelectorAll(".kq-key")].map((x) => x.textContent) : [], pills, now: (hud.querySelector(".r-now") || {}).innerText || null, whole: hud.innerText.replace(/\n+/gu, " | ").slice(0, 380) };
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await turn(60);
          return res;
        };
        const regs = [...wb.querySelectorAll(".wr")];
        if (wb.classList.contains("kq") && regs.length) { const o = []; for (const el of regs.slice(0, 4)) o.push({ on: el.textContent, ...(await press(el)) }); return { regions: o }; }
        const el = wb.querySelector(".w .wr") || wb.querySelector(".w span") || wb.querySelector(".w") || wb;
        return { one: await press(el) };
      }, t);
      pressed.push(got);
    }
    ts.forEach((t, i) => out.push({ ...t, rest: rest[i], on: on[i], press: pressed[i] }));
    writeFileSync(OUT, JSON.stringify(out));
    console.log(`${book}\t${ts.length}\terrors=${errors.length}${errors.length ? " " + errors[0] : ""}`);
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); writeFileSync(OUT, JSON.stringify(out)); }
