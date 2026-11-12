// RUN: page
// A LINE READ LIVE IS ASKED FOR ITS OWN WORD (10 November 2026; the review's
// first reader, finding 5). When a reader switches sources off, a word whose
// baked leader and baked alternate are both carried only by sources now off
// is read live from the store (repaintLive). The pool that answers is asked
// for that word itself, so the word's own pointing gates it as it gates the
// word's card. Until this day the pool read "the word standing open" from the
// page's memory whoever asked: a live line was gated by no pointing at all,
// or by the pointing of whichever card was opened last on the same letters,
// and with five sources off the first book's lines read readings pointed
// otherwise that the word's own card withholds.
//   V1  with the sources that carry the most lines switched off, the page
//       reads lines live, so there is something to judge (said, not failed,
//       on a page where nothing goes live)
//   V2  every live line that prints is a reading its word's own card offers;
//       a line never prints where the card has no reading
//   V3  where a live line is not the first reading the card has from the
//       store, a row of a source the store does not hold (an overlay's, the
//       place's pieces) stands behind that first reading: such a row ranks a
//       reading on the card and never on the line, which is the store's
//       alone (the owner's ruling; how the two should meet is the owner's
//       open call, and is counted here, not judged)
// The sources switched off are read off the page's own records, never named
// here: the source of the place's own reading and the four that carry the
// most of the table's lines, with whatever rests off already. Every line is
// read before any card is opened, so no card's word stands in the page's
// memory when the lines are painted; that is the state the fault showed in.
// A BROWSER THAT STOPS ANSWERING IS SAID AND THE PAGE READ AGAIN, NEVER
// WAITED ON (11 November 2026; check-no-line-under-hebrew-v1 says what was
// measured). Each page is given a time; one that runs out is named, the
// browser is closed whole and opened again, and the page is read once more.
// A page that cannot be read twice running fails the check, in words.
// The pages are the served zones, never named here (check-scope-derived S1).
// Usage: node tools/check-live-line-asks-its-own-word-v1.mjs [url] (one
// page; with none, the first two served pages). PAGE_STALL_MS sets the time
// a page is given (to try the stall's own path; 300000 at rest).
import { readFileSync } from "node:fs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const ARG = /^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "";
const URLS = ARG ? [ARG] : zoneUrls().slice(0, 2);
const SECTIONS = 60, ASK = 40;
const VIEW = { viewport: { width: 412, height: 915 } };
// the time one page is given: a page and its forty cards are read in about a minute
const PAGE_MS = Number(process.env.PAGE_STALL_MS) || 300000;
// a source the store's own index holds; any other id behind a reading is an overlay's or the place's pieces
const STORE = new Set(Object.keys(JSON.parse(readFileSync(new URL("../data/route-store/index.json", import.meta.url), "utf8")).m_sources || {}));
const norm = (t) => String(t ?? "").replace(/\s+/gu, " ").trim();
// a reading as the line draws it with the signs switch at rest: a piece that is a source's sign and nothing else is
// left out of both sides (zone.html trimSigns), a closing period is not drawn, case is folded as the pills fold it
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
const printed = (t) => {
  const pieces = norm(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").split(" + ").map((x) => x.replace(/​/gu, "").trim());
  const kept = pieces.filter((x) => x && !signOnly(x));
  return (kept.length ? kept : pieces.filter(Boolean)).join(" + ").toLowerCase();
};
const pw = await loadPlaywright();
let b = await pw.chromium.launch(launchOptions());
const sum = { pages: 0, words: 0, live: 0, asked: 0, onCard: 0, first: 0, behindOverlay: 0, bare: 0, notOnCard: [], lineNoCard: [], unranked: [], noCard: 0, off: [] };
const stalled = [], unread = [];
// one page, read whole: what it found is returned and joins the sums only when the page was read to its end
const readPage = async (url) => {
  const part = { words: 0, live: 0, asked: 0, onCard: 0, first: 0, behindOverlay: 0, bare: 0, notOnCard: [], lineNoCard: [], unranked: [], noCard: 0, off: 0 };
  const ctx = await b.newContext(VIEW);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // which sources to switch off, read off the page's own records
  const pick = await p.evaluate(() => {
    const z = window.__zone || {}, by = {};
    for (const sec of z.sections || []) for (const w of sec.words || []) {
      if (!w || w.mark || !w.k) continue;
      const gm = z.gloss_m ? z.gloss_m[w.k] : null;
      for (const id of (gm && gm.by) || []) by[id] = (by[id] || 0) + 1;
    }
    const wit = ((((z.emitted_from || {}).toggles || {}).lattice || {}).pieces || {}).witnesses || {};
    return { top: Object.entries(by).sort((a, c) => c[1] - a[1] || (a[0] < c[0] ? -1 : a[0] > c[0] ? 1 : 0)).map(([id]) => id), place: wit.english_tahot ? wit.english_tahot.m : null, resting: window.__sourcesOff || [] };
  });
  const off = [...new Set([...pick.resting, ...(pick.place ? [pick.place] : []), ...pick.top.slice(0, 4)])];
  await p.evaluate((ids) => { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); }, off);
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(600);
  // bring the first sections into being, and let the live lines settle
  for (let i = 0; i < SECTIONS; i += 1) {
    const there = await p.evaluate(async (i) => { const s = document.getElementById(`s${i}`); if (!s) return false; s.scrollIntoView({ block: "center" }); for (let g = 0; g < 200 && !s.querySelector(".he-text .wb"); g += 1) await new Promise((r) => setTimeout(r, 20)); return true; }, i);
    if (!there) break;
    await p.waitForTimeout(40);
  }
  { let last = -1, still = 0; for (let t = 0; t < 120 && still < 6; t += 1) { await p.waitForTimeout(400); const n = await p.evaluate(() => document.querySelectorAll('.he-text .g[data-live="sources"]').length); if (n === last) still += 1; else { still = 0; last = n; } } }
  const read = await p.evaluate((N) => {
    const out = []; let words = 0, live = 0;
    for (let i = 0; i < N; i += 1) {
      const s = document.getElementById(`s${i}`); if (!s) break;
      const label = (s.querySelector(".vnum") || {}).textContent || `s${i}`;
      [...s.querySelectorAll(".he-text .wb:not(.mark)")].forEach((wb, j) => {
        words += 1;
        const g = wb.querySelector(":scope > .g"); if (!g || g.dataset.live !== "sources") return;
        live += 1;
        // a word standing alone: a run's card and a pair's card answer for more than this word
        if (wb.closest(".wjoin") || wb.classList.contains("kq") || wb.classList.contains("multi")) return;
        const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
        out.push({ i, j, label, line: c.textContent, bare: g.classList.contains("bare") });
      });
    }
    return { out, words, live, off: window.__sourcesOff || [] };
  }, SECTIONS);
  part.words = read.words; part.live = read.live; part.off = read.off.length;
  const book = (url.split("b=")[1] || url).split("&")[0];
  // spread over what was read: every k-th line, so the cards asked are not all in the first verses
  const step = Math.max(1, Math.floor(read.out.length / ASK));
  for (const one of read.out.filter((x, n) => n % step === 0).slice(0, ASK)) {
    part.asked += 1;
    await p.keyboard.press("Escape");
    await p.evaluate(({ i, j }) => { const wb = [...document.querySelectorAll(`#s${i} .he-text .wb:not(.mark)`)][j]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, one);
    // the card is read once its readings stand, or once its reading row has stood unchanged for a second
    { const t0 = Date.now(); let last = null, since = Date.now();
      while (Date.now() - t0 < 9000) {
        if (await p.$("#hud .b-read .r-pills button")) break;
        const now = await p.evaluate(() => { const hud = document.getElementById("hud"); const r = hud && !hud.hidden ? hud.querySelector(".b-read") : null; return r ? r.textContent : null; });
        if (now !== last) { last = now; since = Date.now(); } else if (now !== null && Date.now() - since > 1000) break;
        await p.waitForTimeout(80);
      } }
    await p.waitForTimeout(400);
    const card = await p.evaluate(() => {
      const hud = document.getElementById("hud"); if (!hud || hud.hidden) return null;
      const n = hud.querySelectorAll(".b-read .r-pills button").length;
      // the card's own account of its pool, which it sets only when it has readings
      return { n, several: hud.querySelectorAll(".head b > span:not(.mq)").length > 1, pool: n ? (window.__pool || []) : [], ov: n ? (window.__poolOv || []) : [], by: n ? (window.__poolBy || []) : [] };
    });
    const at = `${book} ${one.label} word ${one.j + 1}`;
    if (!card || card.several) { part.noCard += 1; continue; }
    if (one.bare) { part.bare += 1; continue; }
    const want = printed(one.line), pool = card.pool.map(printed);
    if (!card.n) { part.lineNoCard.push(`${at}: the line reads ${JSON.stringify(norm(one.line))} and the card has no reading`); continue; }
    if (!pool.includes(want)) { part.notOnCard.push(`${at}: the line reads ${JSON.stringify(norm(one.line))}, which is not on its card (first there: ${JSON.stringify(card.pool[0] || "")})`); continue; }
    part.onCard += 1;
    const si = card.pool.findIndex((t, k) => !card.ov[k]);
    if (si >= 0 && pool[si] === want) { part.first += 1; continue; }
    const behind = si >= 0 ? String(card.by[si] || "").split(" ").filter(Boolean) : [];
    if (behind.some((id) => !STORE.has(id))) part.behindOverlay += 1;
    else part.unranked.push(`${at}: the line reads ${JSON.stringify(norm(one.line))}, the card's first from the store is ${JSON.stringify(si >= 0 ? card.pool[si] : "")} and no overlay's row stands behind it`);
  }
  await p.keyboard.press("Escape");
  await ctx.close();
  return part;
};
for (const url of URLS) {
  const name = (url.split("b=")[1] || url).split("&")[0];
  let part = null;
  for (let attempt = 1; attempt <= 2 && !part; attempt += 1) {
    let timer = null;
    // a fault of the page still fails the check as it did: only a browser that does not answer is read again
    const got = await Promise.race([readPage(url).then((x) => ({ part: x }), (e) => ({ error: e })), new Promise((res) => { timer = setTimeout(() => res({ stalled: true }), PAGE_MS); })]);
    clearTimeout(timer);
    if (got.part) { part = got.part; break; }
    if (got.error) throw got.error;
    stalled.push(`${name}${attempt === 2 ? " again" : ""}`);
    // a page that does not answer does not close either: the browser is closed whole and opened again
    await Promise.race([b.close().catch(() => {}), new Promise((res) => setTimeout(res, 8000))]);
    b = await pw.chromium.launch(launchOptions());
  }
  if (!part) { unread.push(name); continue; }
  sum.pages += 1; sum.off.push(part.off);
  for (const k of ["words", "live", "asked", "onCard", "first", "behindOverlay", "bare", "noCard"]) sum[k] += part[k];
  for (const k of ["notOnCard", "lineNoCard", "unranked"]) sum[k].push(...part[k]);
}
await Promise.race([b.close().catch(() => {}), new Promise((res) => setTimeout(res, 8000))]);
const few = (a) => (a.length ? `: ${a.slice(0, 4).join("; ")}${a.length > 4 ? ` and ${a.length - 4} more` : ""}` : "");
if (stalled.length) console.log(`  --  the browser stopped answering ${stalled.length} time${stalled.length === 1 ? "" : "s"} within ${PAGE_MS / 1000}s and the page was read again: ${stalled.join("; ")}`);
if (unread.length) check("every page was read: a page the browser stops answering on twice running is not passed over", false, `not read: ${unread.join("; ")}`);
if (sum.live) check("V1 with the sources that carry the most lines switched off, the page reads lines live", sum.asked > 0, `${sum.pages} pages · ${sum.off.join(" and ")} sources off · ${sum.words.toLocaleString("en-US")} words built · ${sum.live.toLocaleString("en-US")} lines read live · ${sum.asked} words standing alone asked, ${sum.bare} of them bare, ${sum.noCard} with no card of their own`);
else if (!unread.length) console.log(`  --  V1 no line goes live on these pages with ${sum.off.join(" and ")} sources off: nothing to judge`);
check("V2 every live line that prints is a reading its word's own card offers, and none prints where the card has no reading", !sum.notOnCard.length && !sum.lineNoCard.length,
  `${sum.onCard} on their cards · ${sum.notOnCard.length} not on the card${few(sum.notOnCard)} · ${sum.lineNoCard.length} printed where the card has none${few(sum.lineNoCard)}`);
check("V3 a live line that is not the card's first reading from the store stands behind a reading an overlay's row ranks", !sum.unranked.length,
  `${sum.first} are the card's first from the store · ${sum.behindOverlay} stand behind a reading an overlay's row ranks (the owner's open call, counted) · ${sum.unranked.length} with no such row${few(sum.unranked)}`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
