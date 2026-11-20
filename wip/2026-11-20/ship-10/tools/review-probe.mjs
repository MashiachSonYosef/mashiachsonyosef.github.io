// Ship 10a: the review's findings on the page, each asked of the build. node review-probe.mjs <base>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const base = process.argv[2] || "http://127.0.0.1:8915/reader";
const b = await chromium.launch();
const out = {};
const open = async (book, query = "", store = {}) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((kv) => { try { if (!sessionStorage.getItem("rp")) { localStorage.clear(); for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); sessionStorage.setItem("rp", "1"); } } catch {} }, store);
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${base}/zone.html?b=${book}${query}`, { waitUntil: "load" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await p.waitForFunction(() => !!window.__hudToggles, null, { timeout: 60000 });
  await p.waitForTimeout(1200);
  return { ctx, p, errs };
};
const spanCells = (p) => p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((j) => j.__run && j.__run.spanKey).length);
const state = (p) => p.evaluate(() => ({ masorah: window.__masorah, kinds: window.__kinds, rested: window.__spanStore ? window.__spanStore.rested : null, cards: window.__spanStore ? window.__spanStore.cards : null, relaid: window.__hudRelaid || 0 }));
// 1 and 5: a word of a sign's cell, landed on and pressed (Genesis 1:16)
{
  const { ctx, p, errs } = await open("genesis");
  const r = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === "1:16");
    if (sec.__body && window.__materialise) { const i = [...document.querySelectorAll("section.seg")].indexOf(sec); window.__materialise(i, i + 1); }
    const wbs = [...sec.querySelectorAll(".he-text .wb:not(.mark)")];
    const cell = wbs.map((w) => w.closest(".wjoin")).find((j) => j && !j.__key);
    if (!cell) return { fault: "no keyless cell in 1:16" };
    const inCell = [...cell.querySelectorAll(".wb")];
    const res = [];
    for (const wb of inCell) {
      const j = [...cell.__ink.querySelectorAll(":scope > .wb")].indexOf(wb);
      wb.scrollIntoView({ block: "center" });
      wb.__openWord(j); await sleep(900);
      const h = document.getElementById("hud");
      res.push({ how: "landed", n: wbs.indexOf(wb) + 1, chain: !!h.querySelector(".b-chain"), wn: (h.querySelector(".wn") || {}).textContent, head: (h.querySelector(".hd, .head, h3") || h).textContent.slice(0, 40) });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await sleep(200);
      (wb.querySelector(".w span") || wb.querySelector(".w")).click(); await sleep(900);
      res.push({ how: "pressed", n: wbs.indexOf(wb) + 1, chain: !!h.querySelector(".b-chain"), wn: (h.querySelector(".wn") || {}).textContent });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await sleep(200);
    }
    return res;
  });
  out["1,5 a sign's cell at Genesis 1:16"] = r; out["1,5 errors"] = errs;
  // 4: kinds opened from a card, the card closed by the English pill
  const before = await spanCells(p), s0 = await state(p);
  const pressed = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const wb of [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")].slice(0, 30)) {
      if (wb.closest(".wjoin")) continue;
      (wb.querySelector(":scope > .w span") || wb.querySelector(":scope > .w")).click(); await sleep(900);
      const sw = document.querySelector("#hud .kinds-switch");
      if (sw) { sw.click(); await sleep(1500); return true; }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await sleep(150);
    }
    return false;
  });
  const mid = { cells: await spanCells(p), ...(await state(p)), open: await p.evaluate(() => !document.getElementById("hud").hidden) };
  await p.click("#modeEn"); await p.waitForTimeout(2500);
  const after = { cells: await spanCells(p), ...(await state(p)), open: await p.evaluate(() => !document.getElementById("hud").hidden) };
  out["4 kinds from a card, closed by the English pill"] = { pressed, before: { cells: before, ...s0 }, mid, after };
  await ctx.close();
}
// 3: the pointing settled by itself at first load (look up by the headword stored), Deuteronomy
{
  const a = await open("deuteronomy");
  const rest = await state(a.p); await a.ctx.close();
  const k = await open("deuteronomy", "", { "fh.lookup": "headword" });
  const moved = await state(k.p);
  const cell = await k.p.evaluate(() => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === "8:2"); if (!sec) return "no 8:2"; if (sec.__body && window.__materialise) { const i = [...document.querySelectorAll("section.seg")].indexOf(sec); window.__materialise(i, i + 1); } return [...sec.querySelectorAll(".he-text .wjoin")].filter((j) => j.__run && j.__run.spanKey).map((j) => j.__run.span.first); });
  out["3 first load, the headword lookup stored (Deuteronomy)"] = { atRest: rest, stored: moved, "8:2 span cells at words": cell, errors: k.errs };
  // 6: a source switched off on the rail, no card open
  const srcs = await k.p.evaluate(() => [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp')].map((c) => `${c.dataset.key}:${c.getAttribute("aria-pressed")}`).slice(0, 40));
  out["6 sources on the rail (first)"] = srcs.slice(0, 8);
  await k.ctx.close();
}
// 6: genesis 3:1, BDB the only standing row: off on the rail
{
  const { ctx, p } = await open("genesis");
  const at31 = () => p.evaluate(() => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === "3:1"); if (sec.__body && window.__materialise) { const i = [...document.querySelectorAll("section.seg")].indexOf(sec); window.__materialise(i, i + 1); } return [...sec.querySelectorAll(".he-text .wjoin")].filter((j) => j.__run && j.__run.spanKey).map((j) => `${j.__run.span.first}:${(j.querySelector(":scope > .g") || {}).textContent}`); });
  const before = { cells: await at31(), ...(await state(p)) };
  const which = await p.evaluate(() => { const cs = [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp')]; const c = cs.find((x) => /brown|bdb/i.test(x.dataset.key || "") && !/unabridged/i.test(x.dataset.key || "")) || null; if (c) c.click(); return c ? c.dataset.key : cs.map((x) => x.dataset.key).join(","); });
  await p.waitForTimeout(2500);
  const off = { cells: await at31(), ...(await state(p)) };
  out["6 Genesis 3:1 with a source off"] = { which, before, off };
  await ctx.close();
}
// 9: the held line's chip at Daniel 1:8:8 under MACULA
{
  const { ctx, p } = await open("daniel", "&default=macula");
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 });
  await p.waitForTimeout(1000);
  const chip = await p.evaluate(() => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === "1:8"); if (sec.__body && window.__materialise) { const i = [...document.querySelectorAll("section.seg")].indexOf(sec); window.__materialise(i, i + 1); } const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][7]; const g = wb.querySelector(":scope > .g"); const c = g && g.querySelector(".g-lic"); return { line: g ? g.textContent : null, chip: c ? c.title : null, layer: g ? g.dataset.layer : null }; });
  out["9 Daniel 1:8:8 under MACULA"] = chip;
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
