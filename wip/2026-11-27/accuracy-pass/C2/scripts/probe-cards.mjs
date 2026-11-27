// Read-only probe: opens the page as served from the frozen tree, presses each chosen word, reads the card
// (the pool as the pills print it, who carries each pill), presses the pill of the chosen reading and reads its record
// (text, credit, wording year, license). Writes nothing in the tree. After s29w/tools/probe-cards-20.mjs.
// Usage: node probe-cards.mjs <reader dir> <cards.json> <out.json> [off|printed]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [R, PLACES, OUT, SIGNS = "off"] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
let places = JSON.parse(readFileSync(PLACES, "utf8"));
if (SIGNS === "printed") places = places.filter((p) => p.signs === "printed");
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
const out = [];
const byBook = new Map();
for (const p of places) (byBook.get(p.book) || byBook.set(p.book, []).get(p.book)).push(p);
const save = () => writeFileSync(OUT, JSON.stringify(out, null, 0));
try {
  for (const [book, ps] of byBook) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    if (SIGNS === "printed") await ctx.addInitScript(() => { try { localStorage.setItem("fh.parked-2026-10-24", "1"); localStorage.setItem("fh.signs", "printed"); } catch {} });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle", timeout: 120000 });
      await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
      await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(800);
    } catch (e) { out.push({ book, fault: `the book did not open: ${String(e.message).slice(0, 200)}` }); await ctx.close(); save(); continue; }
    for (const p of ps) {
      let got;
      try {
        got = await page.evaluate(async ({ si, e, reading, m }) => {
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
          const heb = (wb.querySelector(".w") || wb).textContent;
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const t0 = performance.now();
          const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          while (!settled() && performance.now() - t0 < 20000) await turn(50);
          await turn(350);
          const read = hud.querySelector(":scope > .rows > .b-read");
          const pillEls = read ? [...read.querySelectorAll(":scope > .r-pills > button")] : [];
          const pills = pillEls.map((x) => [x.textContent.replace(/\s+/gu, " ").trim(), (x.title || "").slice(0, 90), x.getAttribute("aria-pressed") === "true" ? 1 : 0]);
          const pool = Array.isArray(window.__pool) ? [...window.__pool] : [], by = Array.isArray(window.__poolBy) ? [...window.__poolBy] : [], lead = Array.isArray(window.__poolLead) ? [...window.__poolLead] : [];
          const held = hud.querySelector(".withheld-line");
          const sgn = hud.querySelector(".signs-off");
          const wn = hud.querySelector(":scope > .head .wn");
          const here = read ? [...read.querySelectorAll(":scope > .r-piece")].map((x) => x.textContent.replace(/\s+/gu, " ").trim().slice(0, 100)) : [];
          const bands = [...hud.querySelectorAll(":scope > .rows > .band:not(.b-read)")].map((b) => b.textContent.replace(/\s+/gu, " ").trim().slice(0, 160));
          const key = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
          const want = key(reading);
          let at = pool.findIndex((t, i) => key(t) === want && String(by[i] || "").split(" ").includes(m));
          const atAny = pool.findIndex((t) => key(t) === want);
          const mine = pool.map((t, i) => [t, by[i]]).filter((x) => String(x[1] || "").split(" ").includes(m)).map((x) => x[0]);
          const res = { heb, line, credit, head: wn ? wn.textContent : null, pills_n: pills.length, pool, by, lead, pressed: pills.filter((x) => x[2]).map((x) => x[0]), held: held ? held.textContent.replace(/\s+/gu, " ").trim() : "", signs_note: sgn ? sgn.textContent : "", here, bands, found_at: at, found_any_at: atAny, mine, settled: settled() };
          if (at >= 0 && pillEls[at]) {
            pillEls[at].click(); await turn(450);
            const card = hud.querySelector(".d-card");
            res.record = card ? card.innerText.replace(/\s+/gu, " ").trim().slice(0, 900) : null;
            res.att = card ? [...card.querySelectorAll(".att")].map((x) => x.textContent.replace(/\s+/gu, " ").trim()) : [];
            res.dtext = card ? [...card.querySelectorAll(".d-text")].map((x) => x.textContent.replace(/\s+/gu, " ").trim().slice(0, 400)) : [];
            res.cutnote = card && card.querySelector(".d-cut") ? card.querySelector(".d-cut").textContent : "";
            res.notes = [...hud.querySelectorAll(".sense-notes")].map((x) => x.textContent.replace(/\s+/gu, " ").trim().slice(0, 400));
            const lineAfter = wb.querySelector(":scope > .g"); res.line_after_press = lineAfter ? lineAfter.textContent : null;
            const pill2 = [...read.querySelectorAll(":scope > .r-pills > button")][at]; res.pill_text = pill2 ? pill2.textContent.replace(/\s+/gu, " ").trim() : null; res.pill_title = pill2 ? pill2.title : null;
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          await turn(120);
          return res;
        }, { si: p.si, e: p.e, reading: p.reading, m: p.m });
      } catch (e) { got = { fault: String(e.message).slice(0, 200) }; }
      out.push({ ...p, signs_state: SIGNS, ...got });
    }
    if (errors.length) out.push({ book, pageerror: errors[0] });
    await ctx.close(); save();
    console.log(book, ps.length, "done");
  }
} finally { await browser.close(); await tree.close(); save(); }
console.log("cards", out.length);
