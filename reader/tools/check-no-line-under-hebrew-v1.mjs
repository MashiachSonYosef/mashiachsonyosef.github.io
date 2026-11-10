// RUN: page
// NO LINE UNDER THE HEBREW (the owner, 2026-11-10: "i think we can get rid of
// underlining because when things are underlined theyre already put into 1
// card, 1 hud. it doesnt benefit i think. and maqafs are already obvious but
// even for 2 words itll be on one visible card already"). The words one card
// joins say so by their one cell and by the card; no line says it again.
//   L1  at rest nothing draws a line on the Hebrew: no word's letters, no
//       run's ink row and no word of the title wears a bottom border that
//       can be seen, a line drawn as a shadow, a line drawn by the row's own
//       ::after, or a text decoration; in the Hebrew reader and the English,
//       with the card numbers off and on
//   L2  nor under the hand, nor with its card standing open: a word alone
//       and a run of words, hovered and then pressed
//   L3  the line's room is kept, so nothing moved the day it went: every
//       word's letters and every run's ink row keep a bottom border at least
//       a pixel wide, unseen
//   L4  a word the page typed keeps its dashed mark, which says that and was
//       never a card's line (said, not failed, on a page with no such word)
// What this does not hold, because the ruling was of the line that marked
// joined words: a half of a word written one way and read another keeps its
// dashed line under the hand, which says which half the press opens; a
// scribal mark keeps its own box; the dotted mark of an edition's difference
// stands when its switch is on.
// This replaces check-underline-joins-v1, which held the rule of 2026-10-19
// (a line only under the words one card joins) until the line went.
// The pages are the served zones, never named here (check-scope-derived S1).
// Usage: node tools/check-no-line-under-hebrew-v1.mjs [url] (one page; with
// none, the first three served pages)
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const ARG = /^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "";
const URLS = ARG ? [ARG] : zoneUrls().slice(0, 3);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const sum = { looked: 0, runs: 0, title: 0, lined: [], thin: [], typed: 0, typedBad: [], hovered: 0, hoverLined: [], pressed: 0, pressLined: [], settings: new Set() };
// every line an element's letters could wear, read off the page as it is drawn
// (set on the page under a name of the check's own, once it has loaded)
const LINES = `window.__linesOn = (el) => {
  const clear = (c) => !c || c === "transparent" || /rgba\\([^)]*,\\s*0\\)$/u.test(c);
  const cs = getComputedStyle(el), out = [];
  if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && !clear(cs.borderBottomColor)) out.push("a " + cs.borderBottomStyle + " line under");
  const sh = /(-?[\\d.]+)px\\s+(-?[\\d.]+)px\\s+0px\\s+0px/u.exec(cs.boxShadow || "");
  if (sh && parseFloat(sh[1]) === 0 && parseFloat(sh[2]) !== 0 && !/rgba\\([^)]*,\\s*0\\)/u.test(cs.boxShadow)) out.push("a line drawn as a shadow");
  if (cs.textDecorationLine && cs.textDecorationLine !== "none") out.push("a text decoration");
  if (el.classList.contains("wj-ink")) { const af = getComputedStyle(el, "::after"); if (af.content && af.content !== "none" && af.content !== "normal" && parseFloat(af.height) > 0 && parseFloat(af.height) < 3 && (af.backgroundImage !== "none" || !clear(af.backgroundColor))) out.push("a line drawn by its own ::after"); }
  return out;
};`;
for (const [url0, en, nums] of URLS.flatMap((u) => [[u, false, false], [u, false, true], [u, true, false], [u, true, true]])) {
  const url = en ? `${url0}${url0.includes("?") ? "&" : "?"}mode=en` : url0;
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.addScriptTag({ content: LINES });
  // the card numbers as the page's own switch sets them
  await p.evaluate((on) => { const pill = document.getElementById("numsPill"); if (pill && (pill.getAttribute("aria-pressed") === "true") !== on) pill.click(); }, nums);
  // build a stretch of the page, so the page's later sections are read too
  for (let y = 0; y < 24000; y += 1500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(80); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const state = await p.evaluate(() => `${document.body.classList.contains("en") ? "English" : "Hebrew"} reader, numbers ${document.body.classList.contains("nums") ? "on" : "off"}`);
  sum.settings.add(state);
  const book = (url0.split("b=")[1] || url0).split("&")[0];
  const r = await p.evaluate(() => {
    const lines = window.__linesOn;
    const at = (el) => { const sec = el.closest("section.seg"); return sec ? (sec.querySelector(".vnum") || {}).textContent || "?" : "the title"; };
    const o = { looked: 0, runs: 0, title: 0, lined: [], thin: [], typed: 0, typedBad: [] };
    for (const w of document.querySelectorAll(".he-text .wb:not(.mark) > .w, #workTitle .wb > .w")) {
      const wb = w.parentElement, cs = getComputedStyle(w);
      o.looked += 1; if (w.closest("#workTitle")) o.title += 1;
      if (parseFloat(cs.borderBottomWidth) < 1) o.thin.push(`${at(w)} a word's letters`);
      if (wb.classList.contains("typed-here")) { o.typed += 1; if (cs.borderBottomStyle !== "dashed" || !lines(w).length) o.typedBad.push(at(w)); continue; }
      const found = lines(w);
      if (found.length) o.lined.push(`${at(w)} a word's letters: ${found.join(", ")}`);
    }
    for (const ink of document.querySelectorAll(".he-text .wjoin > .wj-ink")) {
      o.runs += 1;
      if (parseFloat(getComputedStyle(ink).borderBottomWidth) < 1) o.thin.push(`${at(ink)} a run's ink row`);
      const found = lines(ink);
      if (found.length) o.lined.push(`${at(ink)} a run's ink row: ${found.join(", ")}`);
    }
    return o;
  });
  for (const k of ["looked", "runs", "title", "typed"]) sum[k] += r[k];
  for (const k of ["lined", "thin", "typedBad"]) sum[k].push(...r[k].map((x) => `${book} (${state}) ${x}`));
  // under the hand, then pressed: the first words standing alone and the first runs
  for (const [sel, inkSel] of [[".he-text > .wb:not(.mark):not(.kq):not(.typed-here)", ":scope > .w"], [".he-text .wjoin:not(.apart)", ":scope > .wj-ink"]]) {
    const n = await p.evaluate((sel) => document.querySelectorAll(sel).length, sel);
    for (let i = 0; i < Math.min(n, 4); i += 1) {
      const box = await p.evaluate(({ sel, i }) => { const el = document.querySelectorAll(sel)[i]; el.scrollIntoView({ block: "center" }); const w = el.querySelector(".w"); const q = w.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, { sel, i });
      const read = () => p.evaluate(({ sel, inkSel, i }) => { const lines = window.__linesOn; const el = document.querySelectorAll(sel)[i]; return [el.querySelector(inkSel), ...el.querySelectorAll(".wb > .w")].filter(Boolean).flatMap((x) => lines(x)); }, { sel, inkSel, i });
      await p.mouse.move(box.x, box.y); await p.waitForTimeout(90);
      sum.hovered += 1; const h = await read(); if (h.length) sum.hoverLined.push(`${book} (${state}) ${inkSel.includes("wj-ink") ? "run" : "word"} ${i + 1}: ${h.join(", ")}`);
      await p.mouse.click(box.x, box.y); await p.waitForTimeout(350);
      const open = await p.evaluate(({ sel, i }) => { const el = document.querySelectorAll(sel)[i]; return el.classList.contains("active") || !!el.querySelector(".active"); }, { sel, i });
      if (open) { sum.pressed += 1; const c = await read(); if (c.length) sum.pressLined.push(`${book} (${state}) ${inkSel.includes("wj-ink") ? "run" : "word"} ${i + 1}: ${c.join(", ")}`); }
      await p.keyboard.press("Escape"); await p.mouse.move(2, 2); await p.waitForTimeout(120);
    }
  }
  await p.close();
}
await b.close();
const few = (a) => (a.length ? `: ${a.slice(0, 4).join("; ")}${a.length > 4 ? ` and ${a.length - 4} more` : ""}` : "");
check("L1 at rest nothing draws a line on the Hebrew: no word's letters, no run's ink row, no word of the title, in either reader, the card numbers off or on",
  sum.looked > 0 && sum.runs > 0 && sum.settings.size === 4 && !sum.lined.length,
  `${sum.looked} words' letters (${sum.title} in titles) and ${sum.runs} runs' ink rows read under ${sum.settings.size} settings · ${sum.lined.length} wear a line${few(sum.lined)}`);
check("L2 nor under the hand, nor with its card standing open", sum.hovered > 0 && sum.pressed > 0 && !sum.hoverLined.length && !sum.pressLined.length,
  `${sum.hovered} words and runs hovered, ${sum.pressed} pressed open · ${sum.hoverLined.length} lined under the hand${few(sum.hoverLined)} · ${sum.pressLined.length} lined open${few(sum.pressLined)}`);
check("L3 the line's room is kept: every word's letters and every run's ink row keep a bottom border, unseen", !sum.thin.length,
  sum.thin.length ? `${sum.thin.length} without it${few(sum.thin)}` : "every one at least a pixel wide");
if (sum.typed) check("L4 a word the page typed keeps its dashed mark", !sum.typedBad.length, `${sum.typed} typed words · ${sum.typedBad.length} without it`);
else console.log("  --  L4 no word the page typed on these pages: nothing to keep");
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
