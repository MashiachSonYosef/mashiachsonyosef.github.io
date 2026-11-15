#!/usr/bin/env node
// RUN: tree
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. A check opens the page and reads what it draws; it is not
// the ledger for anything.
//
// THE BOOK'S FILE LANDS WITHOUT MOVING THE CARD UNDER THE READER'S HAND, AND
// UNDER A KEPT SOURCE IT IS ASKED BESIDE THE ZONE (the
// completeness critic of 15 November 2026, of the default sources shipped
// that morning: at rest the first card asks for the book's file, and when it
// landed the card was built again at once; at 1100 by 900 its pills moved
// about 200 px and the focus fell to the page). AT REST THE CARD STANDING
// OPEN IS NOT BUILT AGAIN WHEN THE FILE LANDS, HOWEVER IT WAS OPENED (the
// review of the second fix round, 15 November 2026: H2 drove a phone-sized
// page with a mouse pointer and a focus that a touch phone never has, and
// the page held the card for a resting pointer alone; a card tapped on a
// phone, or opened and left alone, was still built again, its pills 184 px
// up). A finger has no hover: its last press on the card, or on the word that
// opened it, is its hand on the card.
//   H1  the book's file held back six seconds, at 1100 by 900: the first card
//       opened at rest, the reader's hand on its first pill (the pointer over
//       it and the focus in it), no pill of the card moves when the file
//       lands and the focus stays on that pill; the hand gone, the card still
//       stands as it opened (at rest it is not built again); opened again, it
//       carries a line of each source's own words at the place
//   H2  a phone with touch, 412 by 915: the word tapped and the card left
//       alone, no pill moves when the file lands; closed and tapped again, the
//       card carries each source's line
//   H3  under a source other than STEP kept on the device, the book's file is
//       asked beside the zone: with the zone held back three seconds, it is
//       asked before the zone arrives (the critic of the same day: under a
//       kept BDB it was asked only once the zone and every index had been
//       read, Psalms at 618 ms against the zone's 290 ms)
//   H4  the critic's own case, at 1100 by 900: the card opened by a click
//       while the pointer stands elsewhere, and left alone, no pill moves when
//       the file lands
//   H5  a source pressed while its file is on its way, on a phone with touch:
//       MACULA tapped on the row, then the word tapped; when the file lands
//       the line under the word reads MACULA's words, and the card under the
//       finger (its last press, the word that opened it) does not move;
//       closed and tapped again, the card reads its line under MACULA
//   H0  no page error
// The work and the word are found from the default picks on disk, never named
// here (check-scope-derived S1): the work with the fewest places, and its first
// word whose place MACULA, UBS and BDB each read. SERVE_BASE serves another
// build (the live build, to see these laws red before a fix).
// Usage: node tools/check-landing-holds-the-card-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { DEFAULT_PICKS_RULE_ID } from "./bake-default-picks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DP = join(K3, "data", "default-picks");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? `  ·  ${d}` : ""}`); };
console.log(`— ${DEFAULT_PICKS_RULE_ID} —`);
if (!existsSync(join(DP, "index.json"))) { console.log("SKIPPED — no default picks index in this checkout"); process.exit(3); }
const IX = JSON.parse(readFileSync(join(DP, "index.json"), "utf8"));
const works = Object.keys(IX.books || {}).filter((b) => existsSync(join(K3, "data", "zones", `${b}.bin`)) && existsSync(join(DP, IX.books[b].file)));
works.sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));
if (!works.length) { console.log("SKIPPED — no work on this disk has a book file of default picks"); process.exit(3); }
const W = works[0];
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
// the word: its section and its count among the section's words (marks not counted), the first whose place each source reads
const AT = (() => {
  const z = gz(join(K3, "data", "zones", `${W}.bin`)), bf = gz(join(DP, IX.books[W].file));
  const line = (t) => typeof t === "string" && /[\p{L}\p{N}]/u.test(t);
  let n = 0;
  for (const sec of z.sections || []) {
    let k = 0;
    for (const w of sec.words || []) {
      n += 1;
      if (w.mark) continue;
      k += 1;
      const at = bf.places[n - 1];
      if (!w.kq && at && line(at[1]) && Array.isArray(at[2]) && line(at[2][0]) && Array.isArray(at[3]) && at[3][0] && at[3][0][1]) return { label: sec.label, k };
    }
  }
  return null;
})();
if (!AT) { console.log(`SKIPPED — no word of ${W} is read by each of MACULA, UBS and BDB`); process.exit(3); }

const tree = process.env.SERVE_BASE ? { base: process.env.SERVE_BASE.replace(/\/$/u, ""), close: async () => {} } : await serveTree(K3);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const pageErrors = [];
const card = (p) => p.evaluate(() => {
  const h = document.getElementById("hud");
  if (!h || h.hidden) return null;
  const a = document.activeElement;
  const pills = [...h.querySelectorAll(":scope > .rows .b-read .r-pills button")];
  const pressed = pills.find((b) => b.getAttribute("aria-pressed") === "true");
  return {
    pills: pills.slice(0, 8).map((b) => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.left), Math.round(r.top)]; }),
    focus: a && h.contains(a) ? a.textContent.trim() : null,
    sources: h.querySelectorAll(".r-dflt").length,
    pressed: pressed ? pressed.textContent.trim() : null,
    said: ((h.querySelector(".r-now .k") || {}).textContent || "").trim(),
  };
});
// IN THE PAGE: the word's block, found by its section and its count among the section's words
const FIND = ({ label, k }) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); return sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")][k - 1] || null : null; };
// the word brought to the middle of the window; where it is drawn, for a tap
const wordBox = (p) => p.evaluate(({ at, find }) => {
  const wb = (0, eval)(find)(at);
  if (!wb) return null;
  wb.scrollIntoView({ block: "center" });
  const t = wb.querySelector(".w span") || wb.querySelector(".w") || wb, r = t.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, { at: AT, find: String(FIND) });
// the card opened on the word: by a script's click, the pointer wherever it stands, or by a tap of a finger
const openWord = async (p, tap) => {
  const box = await wordBox(p);
  if (!box) return false;
  await p.waitForTimeout(300);
  if (tap) await p.touchscreen.tap(box.x, box.y);
  else await p.evaluate(({ at, find }) => { const wb = (0, eval)(find)(at); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, { at: AT, find: String(FIND) });
  await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1200);
  return true;
};
// the line under the word as it is drawn (its own, or the part of the run it stands in), and the source it is said to be
const lineNow = (p) => p.evaluate(({ at, find }) => {
  const wb = (0, eval)(find)(at);
  if (!wb) return null;
  let g = wb.querySelector(":scope > .g");
  const run = wb.closest(".wjoin"), rg = run ? run.querySelector(":scope > .g") : null;
  if (rg && rg.classList.contains("parts")) { const wi = [...run.querySelectorAll(".wb")].indexOf(wb); g = [...rg.querySelectorAll(":scope > .g-part")].find((x) => Number(x.dataset.wi) <= wi && wi < Number(x.dataset.wi) + Number(x.dataset.wn || 1)) || g; }
  else if (rg) g = rg;
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return { text: c.textContent.trim(), src: g.dataset.src || null };
}, { at: AT, find: String(FIND) });
const movedOf = (before, after) => (before && after ? before.pills.filter(([t, x, y], i) => !after.pills[i] || after.pills[i][0] !== t || Math.abs(after.pills[i][1] - x) > 1 || Math.abs(after.pills[i][2] - y) > 1) : null);
const sayMoved = (moved, before, after) => `${moved.length} of ${before.pills.length} pill(s) moved${moved.length ? ` (${moved.slice(0, 2).map(([t, x, y]) => { const a = after.pills.find((q) => q[0] === t); return `«${t}» ${a ? `${a[1] - x},${a[2] - y}` : "gone"}`; }).join(", ")})` : ""}`;
// a page at rest with the book's file held back six seconds, at the size given, a finger's or a mouse's
const atRest = async (vw, vh, touch, tag) => {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, ...(touch ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("lhc-check")) { localStorage.clear(); sessionStorage.setItem("lhc-check", "1"); } } catch { /* a page with no memory is a first visit */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => pageErrors.push(`${W} ${tag}: ${String((e && e.message) || e).slice(0, 160)}`));
  const s = { ctx, p, landed: null };
  s.landing = new Promise((res) => { s.land = res; });
  await p.route(`**/data/default-picks/${IX.books[W].file}*`, async (r) => { await new Promise((res) => setTimeout(res, 6000)); await r.continue(); s.landed = Date.now(); s.land(); });
  await p.goto(`${tree.base}/zone.html?b=${W}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(800);
  return s;
};
// the file landed, and the lines the page draws stand
const landed = async (s) => {
  await Promise.race([s.landing, s.p.waitForTimeout(12000)]);
  await s.p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
  await s.p.waitForTimeout(1500);
};
// closed, and opened again the same way
const again = async (s, tap) => { await s.p.keyboard.press("Escape"); await s.p.waitForTimeout(400); return (await openWord(s.p, tap)) ? card(s.p) : null; };
const where = `${W} ${AT.label}:${AT.k}`;
try {
  // H1: the mouse's hand on the first pill
  {
    const s = await atRest(1100, 900, false, "H1");
    const opened = await openWord(s.p, false);
    const pill = s.p.locator("#hud > .rows .b-read .r-pills button").first();
    const box = opened ? await pill.boundingBox() : null;
    if (box) { await s.p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await pill.focus(); }
    await s.p.waitForTimeout(300);
    const before = await card(s.p);
    await landed(s);
    const after = await card(s.p);
    // the hand leaves: the pointer off the card, the focus out of it
    await s.p.mouse.move(2, 2);
    await s.p.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    await s.p.waitForTimeout(1500);
    const left = await card(s.p);
    const reopened = await again(s, false);
    const moved = movedOf(before, after), stood = movedOf(before, left);
    const ok = !!before && !!after && !!s.landed && moved.length === 0 && !!before.focus && after.focus === before.focus && !!left && stood.length === 0 && left.sources === 0 && !!reopened && reopened.sources > 0;
    check(`H1  at 1100 by 900, ${where}'s card at rest with the hand on its first pill: when the book's file lands no pill moves and the focus stays; the hand gone, the card stands as it opened; opened again, it carries each source's line`, ok,
      !before ? "no card opened" : !s.landed ? "the book's file never landed" : `${sayMoved(moved, before, after)}; the focus ${before.focus ? `on «${before.focus}»` : "nowhere"} then ${after && after.focus ? `on «${after.focus}»` : "out of the card"}; the hand gone, ${left ? `${stood.length} pill(s) moved and ${left.sources} source line(s) added` : "no card"}; opened again, ${reopened ? `${reopened.sources} source line(s)` : "no card"}`);
    await s.ctx.close();
  }
  // H2: a finger's tap on a phone, the card left alone
  {
    const s = await atRest(412, 915, true, "H2");
    const opened = await openWord(s.p, true);
    const before = opened ? await card(s.p) : null;
    await landed(s);
    const after = await card(s.p);
    const reopened = await again(s, true);
    const moved = movedOf(before, after);
    check(`H2  on a phone with touch, 412 by 915, ${where} tapped and its card left alone: when the book's file lands no pill moves; tapped again, the card carries each source's line`,
      !!before && !!after && !!s.landed && moved.length === 0 && !!reopened && reopened.sources > 0,
      !before ? "no card opened" : !s.landed ? "the book's file never landed" : `${sayMoved(moved, before, after)}${after ? `, ${after.sources} source line(s) added` : ", the card gone"}; tapped again, ${reopened ? `${reopened.sources} source line(s)` : "no card"}`);
    await s.ctx.close();
  }
  // H3: a kept source, the zone held back
  {
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("lhc-check")) { localStorage.clear(); localStorage.setItem("fh.defaults", "ubs"); sessionStorage.setItem("lhc-check", "1"); } } catch { /* a page with no memory keeps nothing */ } });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => pageErrors.push(`${W} kept UBS: ${String((e && e.message) || e).slice(0, 160)}`));
    const t0 = Date.now();
    let zoneAt = null, bookAt = null;
    p.on("request", (r) => { if (bookAt === null && r.url().split("?")[0].endsWith(`/data/default-picks/${IX.books[W].file}`)) bookAt = Date.now() - t0; });
    await p.route(`**/data/zones/${W}.bin*`, async (r) => { await new Promise((res) => setTimeout(res, 3000)); zoneAt = Date.now() - t0; await r.continue(); });
    await p.goto(`${tree.base}/zone.html?b=${W}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    const said = await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).then(() => true, () => false);
    const on = await p.evaluate(() => (window.__default || {}).on || null);
    check(`H3  ${W} with UBS kept and its zone held back 3 s: the book's file is asked before the zone arrives`, bookAt !== null && zoneAt !== null && bookAt < zoneAt && said && on === "ubs",
      `the book's file asked ${bookAt === null ? "never" : `at ${bookAt} ms`}, the zone let through at ${zoneAt === null ? "never" : `${zoneAt} ms`}; the page ${said ? "said its lines stand" : "did not say in 30 s that its lines stand"} under ${on || "nothing"}`);
    await ctx.close();
  }
  // H4: the critic's own case, opened while the pointer stands elsewhere, and left alone
  {
    const s = await atRest(1100, 900, false, "H4");
    await s.p.mouse.move(2, 2);
    const opened = await openWord(s.p, false);
    const before = opened ? await card(s.p) : null;
    await landed(s);
    const after = await card(s.p);
    const moved = movedOf(before, after);
    check(`H4  at 1100 by 900, ${where}'s card opened while the pointer stands elsewhere, and left alone: when the book's file lands no pill moves`,
      !!before && !!after && !!s.landed && moved.length === 0,
      !before ? "no card opened" : !s.landed ? "the book's file never landed" : `${sayMoved(moved, before, after)}${after ? `, ${after.sources} source line(s) added` : ", the card gone"}`);
    await s.ctx.close();
  }
  // H5: MACULA pressed while its file is on its way, then the word tapped, on a phone with touch
  {
    const s = await atRest(412, 915, true, "H5");
    const pb = await s.p.evaluate(() => { const b = document.getElementById("default-macula"); if (!b || b.disabled || b.closest("[hidden]")) return null; b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); return r.width && r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
    if (pb) await s.p.touchscreen.tap(pb.x, pb.y);
    await s.p.waitForTimeout(500);
    const opened = pb ? await openWord(s.p, true) : false;
    const before = opened ? await card(s.p) : null;
    const was = await lineNow(s.p);
    await landed(s);
    const after = await card(s.p);
    const now = await lineNow(s.p);
    const reopened = await again(s, true);
    const moved = movedOf(before, after);
    const read = !!reopened && !!now && !!reopened.pressed && reopened.pressed.toLowerCase() === now.text.toLowerCase() && /MACULA/u.test(reopened.said);
    check(`H5  on a phone with touch, MACULA tapped while its file is on its way and ${where} tapped: when the file lands the line reads MACULA's words and the card under the finger does not move; tapped again, the card reads its line under MACULA`,
      !!before && !!after && !!s.landed && !!now && now.src === "macula" && moved.length === 0 && read,
      !pb ? "no MACULA pill on the row" : !before ? "no card opened" : !s.landed ? "the book's file never landed" : `the line ${was ? `«${was.text}» [${was.src || "as it rests"}]` : "unread"} then ${now ? `«${now.text}» [${now.src || "as it rests"}]` : "unread"}; ${sayMoved(moved, before, after)}; tapped again, ${reopened ? `the card says «${reopened.said}» and presses «${reopened.pressed}»` : "no card"}`);
    await s.ctx.close();
  }
  check("H0  no page error", !pageErrors.length, pageErrors.slice(0, 2).join(" | "));
} finally {
  await browser.close();
  await tree.close();
}
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
