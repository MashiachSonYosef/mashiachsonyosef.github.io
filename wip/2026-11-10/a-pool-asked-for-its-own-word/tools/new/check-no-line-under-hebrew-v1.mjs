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
// A BROWSER THAT STOPS ANSWERING IS SAID AND THE PAGE READ AGAIN, NEVER
// WAITED ON (11 November 2026). Scrolled past 16,384 pixels, the test
// browser now and then stops answering: every one of its processes idle, the
// page's script not running (it cannot even be paused), the same scroll
// height each time, once in some hundreds of readings of one page under the
// suite's load, on the build of 10 November before this check existed as on
// the builds after. This check reads twelve pages that far, and met it in
// the suite, where it sat without a verdict until the runner stopped it.
// So each page is given a time; one that runs out is named, the browser is
// closed whole and opened again, and the page is read once more. A page that
// cannot be read twice running fails the check, in words.
// The pages are the served zones, never named here (check-scope-derived S1).
// Usage: node tools/check-no-line-under-hebrew-v1.mjs [url] (one page; with
// none, the first three served pages). PAGE_STALL_MS sets the time a page is
// given (to try the stall's own path; 120000 at rest).
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const ARG = /^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "";
const URLS = ARG ? [ARG] : zoneUrls().slice(0, 3);
const VIEW = { viewport: { width: 412, height: 915 } };
// the time one page is given: a page is read in ten to twenty seconds
const PAGE_MS = Number(process.env.PAGE_STALL_MS) || 120000;
const pw = await loadPlaywright();
let b = await pw.chromium.launch(launchOptions());
let ctx = await b.newContext(VIEW);
const sum = { looked: 0, runs: 0, title: 0, lined: [], thin: [], typed: 0, typedBad: [], hovered: 0, hoverLined: [], pressed: 0, pressLined: [], settings: new Set() };
const stalled = [], unread = [];
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
// one page under one setting, read whole: what it found is returned and joins the sums only when the page was read
// to its end, so a page read twice is counted once
const readPage = async (url0, en, nums) => {
  const part = { looked: 0, runs: 0, title: 0, typed: 0, lined: [], thin: [], typedBad: [], hovered: 0, hoverLined: [], pressed: 0, pressLined: [], state: "" };
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
  part.state = state;
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
  for (const k of ["looked", "runs", "title", "typed"]) part[k] += r[k];
  for (const k of ["lined", "thin", "typedBad"]) part[k].push(...r[k].map((x) => `${book} (${state}) ${x}`));
  // under the hand, then pressed: the first words standing alone and the first runs
  for (const [sel, inkSel] of [[".he-text > .wb:not(.mark):not(.kq):not(.typed-here)", ":scope > .w"], [".he-text .wjoin:not(.apart)", ":scope > .wj-ink"]]) {
    const n = await p.evaluate((sel) => document.querySelectorAll(sel).length, sel);
    for (let i = 0; i < Math.min(n, 4); i += 1) {
      const box = await p.evaluate(({ sel, i }) => { const el = document.querySelectorAll(sel)[i]; el.scrollIntoView({ block: "center" }); const w = el.querySelector(".w"); const q = w.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, { sel, i });
      const read = () => p.evaluate(({ sel, inkSel, i }) => { const lines = window.__linesOn; const el = document.querySelectorAll(sel)[i]; return [el.querySelector(inkSel), ...el.querySelectorAll(".wb > .w")].filter(Boolean).flatMap((x) => lines(x)); }, { sel, inkSel, i });
      await p.mouse.move(box.x, box.y); await p.waitForTimeout(90);
      part.hovered += 1; const h = await read(); if (h.length) part.hoverLined.push(`${book} (${state}) ${inkSel.includes("wj-ink") ? "run" : "word"} ${i + 1}: ${h.join(", ")}`);
      await p.mouse.click(box.x, box.y); await p.waitForTimeout(350);
      const open = await p.evaluate(({ sel, i }) => { const el = document.querySelectorAll(sel)[i]; return el.classList.contains("active") || !!el.querySelector(".active"); }, { sel, i });
      if (open) { part.pressed += 1; const c = await read(); if (c.length) part.pressLined.push(`${book} (${state}) ${inkSel.includes("wj-ink") ? "run" : "word"} ${i + 1}: ${c.join(", ")}`); }
      await p.keyboard.press("Escape"); await p.mouse.move(2, 2); await p.waitForTimeout(120);
    }
  }
  await p.close();
  return part;
};
for (const [url0, en, nums] of URLS.flatMap((u) => [[u, false, false], [u, false, true], [u, true, false], [u, true, true]])) {
  const name = `${(url0.split("b=")[1] || url0).split("&")[0]} (${en ? "English" : "Hebrew"} reader, numbers ${nums ? "on" : "off"})`;
  let part = null;
  for (let attempt = 1; attempt <= 2 && !part; attempt += 1) {
    let timer = null;
    // a fault of the page still fails the check as it did: only a browser that does not answer is read again
    const got = await Promise.race([readPage(url0, en, nums).then((x) => ({ part: x }), (e) => ({ error: e })), new Promise((res) => { timer = setTimeout(() => res({ stalled: true }), PAGE_MS); })]);
    clearTimeout(timer);
    if (got.part) { part = got.part; break; }
    if (got.error) throw got.error;
    stalled.push(`${name}${attempt === 2 ? " again" : ""}`);
    // a page that does not answer does not close either: the browser is closed whole and opened again
    await Promise.race([b.close().catch(() => {}), new Promise((res) => setTimeout(res, 8000))]);
    b = await pw.chromium.launch(launchOptions());
    ctx = await b.newContext(VIEW);
  }
  if (!part) { unread.push(name); continue; }
  sum.settings.add(part.state);
  for (const k of ["looked", "runs", "title", "typed", "hovered", "pressed"]) sum[k] += part[k];
  for (const k of ["lined", "thin", "typedBad", "hoverLined", "pressLined"]) sum[k].push(...part[k]);
}
await Promise.race([b.close().catch(() => {}), new Promise((res) => setTimeout(res, 8000))]);
const few = (a) => (a.length ? `: ${a.slice(0, 4).join("; ")}${a.length > 4 ? ` and ${a.length - 4} more` : ""}` : "");
if (stalled.length) console.log(`  --  the browser stopped answering ${stalled.length} time${stalled.length === 1 ? "" : "s"} within ${PAGE_MS / 1000}s and the page was read again: ${stalled.join("; ")}`);
if (unread.length) check("every page was read: a page the browser stops answering on twice running is not passed over", false, `not read: ${unread.join("; ")}`);
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
