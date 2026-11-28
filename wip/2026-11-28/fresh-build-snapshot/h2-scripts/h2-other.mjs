// Scratch (builder H2): the works and words the place card is not for, read off S/base and off the sandbox alike: the
// Tikkunei Zohar's page (its row of switches, and the card of its first words) and a commentary's own word on a book
// of the Bible (the commentary opened by the row's switch, then a word of it pressed). Each card's whole text, its
// classes and whether it is the place card. Read only; each site root is served on a port the machine gives.
// node h2-other.mjs <site root> <out.json>
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const [SITE, OUT] = process.argv.slice(2);
const T = join(SITE, "reader", "tools");
const { serveTree } = await import(join(T, "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(T, "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(SITE);
const browser = await pw.chromium.launch(launchOptions());
const out = { tz: null, commentary: null };
const CARD = `async (sel) => {
  const turn = (ms) => new Promise((r) => setTimeout(r, ms)); const hud = document.getElementById("hud"); const got = [];
  const wbs = [...document.querySelectorAll(sel)].filter((x) => !x.classList.contains("mark")).slice(0, 8);
  for (const wb of wbs) {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    const t0 = performance.now(); const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !hud.hidden && (!!(read && read.children.length && !read.querySelector(":scope > .r-wait")) || !!hud.querySelector(":scope > .place-card [data-ready]")); };
    while (!settled() && performance.now() - t0 < 15000) await turn(50);
    await turn(700);
    got.push({ word: (wb.querySelector(".w") || wb).textContent.trim(), open: !hud.hidden, place: !!hud.querySelector(":scope > .place-card"), cls: hud.className, text: hud.innerText.replace(/\\s+/gu, " ").trim() });
  }
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return got;
}`;
const row = () => ({ pills: [...document.querySelectorAll("#modeRow button")].filter((x) => x.id && x.offsetParent !== null).map((x) => x.id), cardPick: (() => { const c = document.getElementById("cardPick"); return c ? { hidden: c.hidden, shown: c.offsetParent !== null } : null; })(), placeCard: window.__placeCard ? { here: window.__placeCard.here, on: window.__placeCard.on } : null });
try {
  {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const p = await ctx.newPage(); const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(`${tree.base}/reader/zone.html?b=tikkunei-zohar`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }); await p.waitForTimeout(1500);
    out.tz = { row: await p.evaluate(row), cards: await p.evaluate(`(${CARD})("section.seg .he-text .wb")`), errors };
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const p = await ctx.newPage(); const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(`${tree.base}/reader/zone.html?b=amos&commentary=on`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }); await p.waitForTimeout(1500);
    const r = await p.evaluate(row);
    // the first verse's commentary bar pressed (Amos carries the Targum Jonathan on Amos, verse by verse): the
    // commentary opens under the verse, and its own words are blocks of their own, read from its sidecar (bin !== zone)
    const opened = await p.evaluate(async () => {
      const turn = (ms) => new Promise((r) => setTimeout(r, ms));
      window.__materialise(0, 3); await turn(800);
      const bar = document.querySelector("section.seg .c-bar"); if (!bar) return "no commentary bar";
      bar.scrollIntoView(); bar.click(); await turn(1200);
      return document.querySelectorAll("section.seg .c-inline .wb").length;
    });
    out.commentary = { row: r, opened, cards: await p.evaluate(`(${CARD})("section.seg .c-inline .wb")`), errors };
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ tz: { row: out.tz.row, cards: out.tz.cards.length, place: out.tz.cards.filter((c) => c.place).length, errors: out.tz.errors.length }, commentary: { opened: out.commentary.opened, cards: out.commentary.cards.length, place: out.commentary.cards.filter((c) => c.place).length, errors: out.commentary.errors.length } }));
