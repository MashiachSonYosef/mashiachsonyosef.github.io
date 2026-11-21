// Findings 6 and 13: laying a built section again (a reset with a pick; or "joined words" out and back).
// 6: is an empty bar row left behind, and is an opened commentary lost for good?  13: are KQ_STANDS and standsOf pruned?
// The two registries are private to the page's script, so the page is served to this browser with ONE line added
// that names them on window (the file on disk is not touched): window.__reg = { KQ_STANDS, standsOf, GLOSS_STANDS }.
// node f6-f13-relay.mjs <book> <road: reset|joined> [extra query, default &commentary=on]
import { createRequire } from "node:module";
import { BASE, ready, mask } from "./lib.mjs";
const { chromium } = createRequire(import.meta.url)("playwright");
const [BOOK = "ruth", ROAD = "reset", EXTRA = "&commentary=on", LABEL = ""] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const errors = []; p.on("pageerror", (e) => errors.push(String(e && e.message)));
let injected = 0;
await p.route(/\/zone\.html(\?|$)/u, async (route) => {
  const r = await route.fetch(); let body = await r.text();
  const at = "const GLOSS_STANDS = [];";
  if (body.includes(at)) { body = body.replace(at, `${at} window.__reg = { KQ_STANDS, standsOf, GLOSS_STANDS };`); injected += 1; }
  await route.fulfill({ response: r, body });
});
await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
await p.goto(`${BASE}?b=${BOOK}${EXTRA}`, { waitUntil: "networkidle" });
await ready(p);
console.log(`${BOOK}${EXTRA}, road: ${ROAD}; registries named on window: ${injected === 1}`);
// the first built section that carries a commentary bar; or the section named, brought within reach by scrolling to it
if (LABEL) { await p.evaluate((l) => { const s = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent === l); if (s) s.scrollIntoView({ block: "start" }); }, LABEL); await p.waitForTimeout(1500); }
const SEC = LABEL ? `[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(LABEL)})`
  : `[...document.querySelectorAll("section.seg")].find((s) => s.querySelector(":scope > .c-barrow > .c-bar") && s.querySelector(".he-text .wb"))`;
console.log("pairs in the section:", await p.evaluate((src) => { const s = eval(src); return s ? s.querySelectorAll(".he-text .wb.kq").length : null; }, SEC));
const state = () => p.evaluate((src) => {
  const s = eval(src); if (!s) return { section: null };
  const reg = window.__reg || null;
  const stale = (xs, f) => xs.filter((x) => { const e = f(x); return e && !e.isConnected; }).length;
  const so = reg ? [...reg.standsOf.values()].flat() : [];
  return {
    section: (s.querySelector(".vnum") || {}).textContent,
    barRows: s.querySelectorAll(":scope > .c-barrow").length, emptyBarRows: s.querySelectorAll(":scope > .c-barrow:empty").length,
    emptyBarRowsOnPage: document.querySelectorAll("section.seg > .c-barrow:empty").length,
    emptyRowHeights: [...s.querySelectorAll(":scope > .c-barrow:empty")].map((r) => { const cs = getComputedStyle(r); return `${r.getBoundingClientRect().height}h+${cs.marginTop}/${cs.marginBottom}`; }),
    bar: (() => { const c = s.querySelector(".c-bar"); return c ? `aria-expanded=${c.getAttribute("aria-expanded")}` : null; })(),
    commentaryShown: s.querySelectorAll(".c-inline:not([hidden])").length, commentaryBuilt: s.querySelectorAll(".c-inline").length,
    sectionHeight: Math.round(s.getBoundingClientRect().height),
    registries: reg ? { GLOSS_STANDS: `${reg.GLOSS_STANDS.length} (${stale(reg.GLOSS_STANDS, (x) => x.ge)} gone from the page)`, KQ_STANDS: `${reg.KQ_STANDS.length} (${stale(reg.KQ_STANDS, (x) => x.ge)} gone from the page)`, standsOf: `${so.length} (${stale(so, (x) => x.wb)} gone from the page)` } : "not named",
  };
}, SEC);
console.log("at load:           ", JSON.stringify(await state()));
// the reader opens the section's commentary by its bar
await p.evaluate((src) => { const s = eval(src); s.scrollIntoView({ block: "start" }); window.scrollBy(0, -120); }, SEC);
await p.evaluate((src) => { eval(src).dataset.probe = "1"; }, SEC);
const HAS_BAR = await p.evaluate((src) => !!eval(src).querySelector(":scope > .c-barrow > .c-bar"), SEC);
if (HAS_BAR) { await p.locator('section.seg[data-probe="1"] > .c-barrow > .c-bar').click(); await p.waitForTimeout(700); console.log("commentary opened: ", JSON.stringify(await state())); }
else console.log("no commentary bar is drawn on this section (commentary is off): the registries alone are read");
const PSEC = `document.querySelector('section.seg[data-probe="1"]')`;
const pstate = () => p.evaluate((src) => src, SEC).then(() => p.evaluate(() => 0)).then(() => state());
const stateP = () => p.evaluate((psrc) => {
  const s = eval(psrc); const reg = window.__reg || null;
  const stale = (xs, f) => xs.filter((x) => { const e = f(x); return e && !e.isConnected; }).length;
  const so = reg ? [...reg.standsOf.values()].flat() : [];
  return {
    barRows: s.querySelectorAll(":scope > .c-barrow").length, emptyBarRows: s.querySelectorAll(":scope > .c-barrow:empty").length,
    emptyBarRowsOnPage: document.querySelectorAll("section.seg > .c-barrow:empty").length,
    emptyRowBox: [...s.querySelectorAll(":scope > .c-barrow:empty")].map((r) => { const cs = getComputedStyle(r); return `margin ${cs.marginTop} ${cs.marginBottom}`; }),
    bar: (() => { const c = s.querySelector(".c-bar"); return c ? `aria-expanded=${c.getAttribute("aria-expanded")}` : null; })(),
    commentaryShown: s.querySelectorAll(".c-inline:not([hidden])").length, commentaryBuilt: s.querySelectorAll(".c-inline").length,
    openAllLit: (() => { const x = document.querySelector("#cAll, .c-all, [data-c-all]"); return x ? x.getAttribute("aria-pressed") : undefined; })(),
    slots: s.querySelectorAll(":scope > .c-slot").length, sectionHeight: Math.round(s.getBoundingClientRect().height),
    registries: reg ? { GLOSS_STANDS: `${reg.GLOSS_STANDS.length} (${stale(reg.GLOSS_STANDS, (x) => x.ge)} gone)`, KQ_STANDS: `${reg.KQ_STANDS.length} (${stale(reg.KQ_STANDS, (x) => x.ge)} gone)`, standsOf: `${so.length} (${stale(so, (x) => x.wb)} gone)` } : "not named",
  };
}, PSEC);
const relayOnce = async (n) => {
  if (ROAD === "reset") {
    // a pick: open the card of a word of this section and press a reading that is not the one lit
    const word = await p.evaluate((psrc) => { const s = eval(psrc); const wbs = [...s.querySelectorAll(":scope > .he-text .wb:not(.mark):not(.kq)")]; const wb = wbs[Math.min(1, wbs.length - 1)]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return wbs.indexOf(wb); }, PSEC);
    await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(900);
    const pressed = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = xs.find((y) => !y.disabled && y.getAttribute("aria-pressed") !== "true" && !y.classList.contains("on")) || xs[0]; if (x) x.click(); return x ? x.textContent : null; });
    await p.waitForTimeout(900);
    await p.keyboard.press("Escape"); await p.waitForTimeout(600);
    const picked = await p.evaluate(() => ({ chosen: document.querySelectorAll("section.seg .wb.chosen, section.seg .wjoin.chosen").length, reset: `${document.getElementById("resetPill").disabled ? "dead" : "live"} "${document.getElementById("resetState").textContent}"` }));
    console.log(`  round ${n}: word ${word}, pressed ${JSON.stringify(mask(pressed))}; chosen marks ${picked.chosen}; reset pill ${picked.reset}`);
    await p.evaluate(() => document.getElementById("resetPill").scrollIntoView({ block: "center" }));
    await p.click("#resetPill"); await p.waitForTimeout(1800);
  } else {
    const flip = (label) => p.evaluate((label) => { const l = [...document.querySelectorAll("#railRows .row .lab")].find((x) => x.textContent.startsWith("joined words")); const x = l && [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === label); const seen = !!(x && x.getClientRects().length); if (x) x.click(); return x ? (seen ? "pressed" : "pressed (the row is not drawn for a reader: under the fold)") : "no such button"; }, label);
    const now = await p.evaluate(() => (window.__hudToggles || {}).maqaf);
    const [out, back] = now === "pieces" ? ["as written", "as separate words"] : ["as separate words", "as written"];
    console.log(`  round ${n}: joined words "${out}": ${await flip(out)}`); await p.waitForTimeout(2000);
    console.log(`  round ${n}: joined words "${back}": ${await flip(back)}`); await p.waitForTimeout(2500);
  }
};
for (let n = 1; n <= 2; n += 1) {
  await relayOnce(n);
  console.log(`after relay ${n}:     `, JSON.stringify(await stateP()), `relaid so far: ${await p.evaluate(() => window.__hudRelaid || 0)}`);
  if (n === 1 && HAS_BAR) {
    // the reader presses the bar to get the commentary back
    await p.evaluate((psrc) => eval(psrc).querySelector(".c-bar").scrollIntoView({ block: "center" }), PSEC);
    await p.locator('section.seg[data-probe="1"] .c-bar').click(); await p.waitForTimeout(700);
    console.log("bar pressed again: ", JSON.stringify(await stateP()));
    await p.locator('section.seg[data-probe="1"] .c-bar').click(); await p.waitForTimeout(700);
    console.log("and once more:     ", JSON.stringify(await stateP()));
  }
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
