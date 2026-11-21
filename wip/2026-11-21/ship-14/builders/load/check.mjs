#!/usr/bin/env node
// check.mjs · the mends of 21 November 2026 to the reader page, findings 5, 6, 7, 10 and 11 of the first reader's
// report (wip/2026-11-21/ship-14/readers-again/a/REPORT.md)
//
// usage: node check.mjs --base http://127.0.0.1:<port> [--only 5,6,7,10,11a,11b]
//
// One law per finding (finding 11 has two halves, the load and the loaders), each a short scenario on a phone's
// screen with nothing kept on the device. This writes nothing. Words are named by verse and word number. About
// two minutes on a quiet machine; CHECK_TIMES=1 says how long each law took.
//
// 5    an exported verse is cited the same whatever card was opened last: a ruled reading is not listed as
//      withheld because a card on the same letters, pointed otherwise, was opened and shut before the export
// 6    at rest a book page asks for neither of its run files; joined words turned on afterwards (the rail's
//      row, drawn with &rail=all), and then the license runs, lay the same cells and open the same cards, a
//      chain's and a run's, as a page loaded with them kept on, and the run files are asked for only then
// 7    a source the record rests off rests off on the visit after one where its overlay's index failed, as it
//      does for a reader whose first visit failed nothing
// 10   a still press on the card's head parks nothing, by mouse or by finger: the next word's card opens under
//      its word; a real drag parks the card, and the next word's card opens where the reader left it
// 11a  a fault at load is said as a fault (the catalog's index or the book's bin dropped, the bin answered 503);
//      a book the shelf does not hold is still said to be unpublished
// 11b  a file whose first fetch failed is asked for again when next needed: the lattice, the source-suggested
//      file, the map of pointers and the toggle ledger each arrive later in the same visit
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const argOf = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const BASE = argOf("--base", "http://127.0.0.1:8899").replace(/\/+$/u, "");
const ONLY = argOf("--only", "").split(",").filter(Boolean);
const T = 120000;   // other work may be using the machine: every wait is generous
let bad = 0;
const law = (id, sentence, ok, saw) => { console.log(`${ok ? "  ok" : "FAIL"}  ${id}  ${sentence}  ·  ${saw}`); if (!ok) bad += 1; };
const want = (id) => !ONLY.length || ONLY.includes(id);
const attempt = async (id, sentence, run) => { if (!want(id)) return; const t0 = Date.now(); try { await run(); } catch (e) { law(id, sentence, false, `the scenario could not be walked: ${String((e && e.message) || e).split("\n")[0].slice(0, 200)}`); } if (process.env.CHECK_TIMES) console.error(`      (law ${id}: ${Math.round((Date.now() - t0) / 1000)}s)`); };

const browser = await chromium.launch();
const visit = async ({ kept = {}, touch = false } = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: touch, acceptDownloads: true });
  // the device's memory is emptied once, at the first load of the visit, and holds only what the scenario keeps
  await ctx.addInitScript((kept) => { try { if (!sessionStorage.getItem("check")) { localStorage.clear(); for (const [k, v] of Object.entries(kept)) localStorage.setItem(k, v); sessionStorage.setItem("check", "1"); } } catch { /* a device that remembers nothing still reads */ } }, kept);
  const p = await ctx.newPage();
  return { ctx, p };
};
const ready = async (p) => {
  await p.waitForSelector("section.seg .he-text .wb", { timeout: T });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: T }).catch(() => {});
  await p.waitForTimeout(1200);
};
const load = async (p, book, extra = "") => { await p.goto(`${BASE}/zone.html?b=${book}${extra}`, { waitUntil: "networkidle", timeout: T }); await ready(p); };
// a card's rows arrive after it opens; they are waited for as they are attached (the first pill of a card may be
// one the card holds back from view, and a wait for a pill in view would then wait out its whole time)
const cardUp = async (p) => { await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { state: "attached", timeout: 30000 }).catch(() => {}); await p.waitForTimeout(900); };
const shut = async (p) => { await p.keyboard.press("Escape"); await p.waitForTimeout(600); };
// a word by its verse's label and its number among the verse's words (1 the first, the scribes' marks not
// counted): its verse is brought into view and its cell tagged; null where the book has no such word
const cellAt = (p, label, n) => p.evaluate(async ({ label, n }) => {
  const z = window.__zone; const si = z.sections.findIndex((s) => String(s.label) === label);
  if (si < 0) return null;
  const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" });
  await new Promise((r) => setTimeout(r, 1500));
  const word = z.sections[si].words.filter((w) => !w.mark)[n - 1];
  const wb = [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === word);
  if (!wb) return null;
  wb.dataset.check = `v${si}-${n}`;
  return { si, sel: `[data-check="v${si}-${n}"]` };
}, { label, n });
const openCard = async (p, sel) => { await p.evaluate((sel) => { const wb = document.querySelector(sel); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, sel); await cardUp(p); };
// a position of one of the rail's rows, pressed by its place in the row (the rail drawn whole: &rail=all)
const pressRail = (p, toggle, nth) => p.evaluate(({ toggle, nth }) => { const d = document.querySelector(`.rail .row[data-toggle="${toggle}"]`); if (!d) return null; let x = d; while (x) { if (x.tagName === "DETAILS") x.open = true; x = x.parentElement; } const bt = d.querySelectorAll("button")[nth]; if (!bt) return null; bt.click(); return bt.textContent; }, { toggle, nth });

// ---- 5 ------------------------------------------------------------------------------------------------------
await attempt("5", "an exported verse is cited the same whatever card was opened last", async () => {
  const { ctx, p } = await visit();
  await load(p, "amos");
  const exportVerse = async (si, label, n) => {
    await p.evaluate(async (si) => { const sec = document.getElementById(`s${si}`); sec.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); const o = sec.querySelector(".xp-open"); const m = sec.querySelector(".xp-menu"); if (!m || !m.offsetParent || o.getAttribute("aria-expanded") !== "true") o.click(); }, si);
    await p.waitForTimeout(500);
    const btn = p.locator(`#s${si} .xp-menu .xp-row`).first().locator('button[aria-label="Export Hebrew + English"]');
    await btn.click();
    await p.waitForFunction((si) => { const x = document.querySelector(`#s${si} .xp-menu .xp-row button[aria-label="Export Hebrew + English"]`); return x && x.classList.contains("armed"); }, si, { timeout: T });
    const note = await p.evaluate((si) => document.querySelector(`#s${si} .xp-menu .xp-row .xp-note`).textContent, si);
    const [dl] = await Promise.all([p.waitForEvent("download", { timeout: T }), btn.click()]);
    const text = readFileSync(await dl.path(), "utf8");
    const cited = text.split(/\n\n+/u).some((blk) => new RegExp(`\\bfor: [^\\n]*\\b${label}:${n}\\b`, "u").test(blk) && /\n\s*source: /u.test(blk));
    return { withheld: Number((note.match(/(\d+) readings? withheld/u) || [0, 0])[1]), cited };
  };
  // Amos 4:10 word 3: a reading ruled on its card (the first pill not already pressed)
  const A = await cellAt(p, "4:10", 3);
  await openCard(p, A.sel);
  const ruled = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = xs.find((y) => !(y.classList.contains("on") || y.getAttribute("aria-pressed") === "true")); if (!x) return null; x.click(); return x.textContent.trim(); });
  await p.waitForTimeout(900); await shut(p);
  const first = await exportVerse(A.si, "4:10", 3);
  // Amos 3:7 word 6: the same letters under another pointing and entry, its card only opened and shut
  const B = await cellAt(p, "3:7", 6);
  await openCard(p, B.sel); await shut(p);
  const second = await exportVerse(A.si, "4:10", 3);
  const say = (x) => `${x.cited ? "cited from a record" : "not cited"}, ${x.withheld} withheld`;
  law("5", "an exported verse is cited the same whatever card was opened last",
    !!ruled && first.cited && first.withheld === 0 && second.cited && second.withheld === 0,
    `Amos 4:10 word 3 ruled «${ruled}» · exported after its own card: ${say(first)} · after the card at 3:7 word 6 was opened and shut: ${say(second)}`);
  await ctx.close();
});

// ---- 6 ------------------------------------------------------------------------------------------------------
await attempt("6", "at rest a book asks for neither run file, and the switches turned on afterwards lay what a page loaded with them on lays", async () => {
  const BOOK = "genesis";
  const cells = (p) => p.evaluate(() => { const out = {}; for (const s of document.querySelectorAll("section.seg")) { const he = s.querySelector(".he-text"); if (!he) continue; out[s.id] = [...he.children].map((el) => { const g = el.querySelector(":scope > .g"); const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return `${el.classList.contains("wjoin") ? (el.classList.contains("lic") ? "run" : "chain") : "word"}:${el.querySelectorAll(".wb").length || 1}:${c ? c.textContent.trim() : ""}`; }).join(" | "); } return out; });
  const tally = (sig) => { const all = Object.values(sig).join(" | "); return { sections: Object.keys(sig).length, chains: (all.match(/chain:/gu) || []).length, runs: (all.match(/run:/gu) || []).length }; };
  // the sections built on both pages hold the same cells (a card opened lower down builds more of one page), and
  // those are at least the sections a page builds as it loads
  let atLoad = 0;
  const same = (a, b) => { const ks = Object.keys(a).filter((k) => k in b); return ks.length > 0 && ks.length >= atLoad && ks.every((k) => a[k] === b[k]); };
  const counts = (p) => p.evaluate(() => ({ hud: window.__hudRuns ? `${window.__hudRuns.laid} of ${window.__hudRuns.cards}` : "none", runCards: window.__runCards, set: window.__hudToggles ? window.__hudToggles.set : null }));
  // the card of the first cell of a kind on the page (a chain the scribes joined, a license run): its words lit
  // and what it prints
  const CHAIN = "chain", RUN = "run";
  const cellCard = async (p, kind) => {
    const ok = await p.evaluate((kind) => { const c = [...document.querySelectorAll("section.seg .he-text .wjoin")].find((x) => (kind === "run" ? x.classList.contains("lic") : !x.classList.contains("lic") && !!x.__chain)); if (!c) return false; c.scrollIntoView({ block: "center" }); const w = c.querySelector(".wb .w span") || c.querySelector(".wb .w"); w.click(); return true; }, kind);
    if (!ok) return "";
    await cardUp(p); await p.waitForTimeout(1200);
    const t = await p.evaluate(() => { const h = document.getElementById("hud"); return h.hidden ? "" : `${document.querySelectorAll(".wjoin.active .wb, .wb.active").length} words lit · ${h.querySelectorAll(".r-pills button").length} pills · ${h.innerText.replace(/\s+/gu, " ")}`; });
    await shut(p);
    return t;
  };
  // the page at rest, the rail drawn whole, and what it asks for
  const { ctx, p } = await visit();
  const asked = [];
  p.on("request", (r) => { const m = /data\/(run-cards|hud-runs)\/([^/?]+)\.json/u.exec(r.url()); if (m && m[2] !== "index") asked.push(m[1]); });
  await load(p, BOOK, "&rail=all");
  await p.waitForTimeout(1000);
  const atRest = asked.length, rest = tally(await cells(p));
  atLoad = rest.sections;
  // joined words: as written, pressed on the rail
  await pressRail(p, "maqaf", 0);
  await p.waitForFunction(() => window.__hudToggles && window.__hudToggles.maqaf === "maqaf", null, { timeout: T });
  await p.waitForTimeout(2500);
  const joined = await cells(p), chain1 = await cellCard(p, CHAIN), askedJoined = asked.length;
  // license runs: the entry's own, pressed on the rail
  await pressRail(p, "runs", 1);
  await p.waitForFunction(() => window.__hudToggles && window.__hudToggles.runs === "own" && window.__hudRuns && window.__hudRuns.cards > 0, null, { timeout: T }).catch(() => {});
  await p.waitForTimeout(2500);
  const withRuns = await cells(p), n1 = await counts(p), askedRuns = [...asked];
  const card1 = await cellCard(p, RUN);
  await ctx.close();
  // the same two states on pages loaded with the switches kept on (the files asked for under the first paint)
  const kept = async (store) => { const v = await visit({ kept: store }); await load(v.p, BOOK, "&rail=all"); await v.p.waitForTimeout(2500); return v; };
  const J = await kept({ "fh.maqaf-join": "maqaf" });
  const joinedKept = await cells(J.p), chain2 = await cellCard(J.p, CHAIN); await J.ctx.close();
  const R = await kept({ "fh.maqaf-join": "maqaf", "fh.runs": "own" });
  const runsKept = await cells(R.p), n2 = await counts(R.p);
  const card2 = await cellCard(R.p, RUN);
  await R.ctx.close();
  const tj = tally(joined), tr = tally(withRuns);
  law("6", "at rest a book asks for neither run file, and the switches turned on afterwards lay what a page loaded with them on lays",
    atRest === 0 && askedJoined === 0 && tj.chains > rest.chains && same(joined, joinedKept) && !!chain1 && chain1 === chain2
      && askedRuns.length === 2 && askedRuns.includes("run-cards") && askedRuns.includes("hud-runs") && tr.runs > 0 && same(withRuns, runsKept)
      && n1.hud === n2.hud && n1.runCards === n2.runCards && n1.set === n2.set && !!card1 && card1 === card2,
    `${BOOK} at rest: ${atRest} run file${atRest === 1 ? "" : "s"} asked for, ${rest.chains} joined cell${rest.chains === 1 ? "" : "s"} in ${rest.sections} built sections · joined words as written: ${tj.chains} joined cells, ${askedJoined} asked for, ${same(joined, joinedKept) ? "the cells" : "NOT the cells"} of a page loaded so, a chain’s card ${chain1 && chain1 === chain2 ? `the same on both (${chain1.split(" · ").slice(0, 2).join(", ")})` : "DIFFERS or did not open"} · license runs the entry’s own: ${askedRuns.join(" + ") || "none"} asked for, ${tr.runs} run cells, HUD runs ${n1.hud} and ${n1.runCards} run cards (loaded so: ${n2.hud} and ${n2.runCards}), ${same(withRuns, runsKept) ? "the cells" : "NOT the cells"} of a page loaded so · a run’s card ${card1 && card1 === card2 ? `the same on both (${card1.split(" · ").slice(0, 2).join(", ")})` : "DIFFERS or did not open"}`);
});

// ---- 7 ------------------------------------------------------------------------------------------------------
await attempt("7", "a source the record rests off rests off on the visit after one where its file failed", async () => {
  // which overlay's index carries a source the record rests off: read off the record and the indexes themselves
  const record = await (await fetch(`${BASE}/data/source-defaults-v1.json`)).json();
  const restsOff = new Set(Object.keys(record.off || {}).filter((k) => record.off[k]));
  const state = (p) => p.evaluate(() => ({ off: [...(window.__sourcesOff || [])].sort(), stamp: localStorage.getItem("fh.sources.defaults") }));
  const { ctx, p } = await visit();
  let failed = 0, which = "";
  const fault = async (route) => {
    const url = route.request().url();
    if (failed || /\/route-store\//u.test(url)) return route.continue();
    let j = null; try { j = await (await route.fetch()).json(); } catch { j = null; }
    const carries = !!(j && j.m_sources && Object.values(j.m_sources).some((m) => m && restsOff.has(m.key)));
    if (!carries || failed) return route.continue();
    failed += 1; which = new URL(url).pathname.replace(/^.*\/data\//u, "data/");
    return route.abort("failed");
  };
  await p.route("**/data/**/index.json", fault);
  await load(p, "amos");
  const v1 = await state(p);
  await p.unroute("**/data/**/index.json", fault);
  await p.reload({ waitUntil: "networkidle", timeout: T }); await ready(p);
  const v2 = await state(p);
  await ctx.close();
  // a reader whose first visit failed nothing
  const C = await visit(); await load(C.p, "amos");
  const clean = await state(C.p);
  await C.ctx.close();
  law("7", "a source the record rests off rests off on the visit after one where its file failed",
    failed === 1 && clean.off.length > 0 && JSON.stringify(v2.off) === JSON.stringify(clean.off) && v2.stamp === clean.stamp,
    `${which || "no index"} failed once on visit 1: off ${JSON.stringify(v1.off)}, stamp ${v1.stamp} · visit 2, nothing failing: off ${JSON.stringify(v2.off)}, stamp ${v2.stamp} · a clean first visit: off ${JSON.stringify(clean.off)}, stamp ${clean.stamp}`);
});

// ---- 10 -----------------------------------------------------------------------------------------------------
await attempt("10", "a still press on the card's head parks nothing, and a real drag parks the card where the reader leaves it", async () => {
  const walk = async (touch) => {
    const { ctx, p } = await visit({ touch });
    await load(p, "amos");
    const rectOf = (sel) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
    const tapAt = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else { await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.up(); } };
    // a word pressed where it stands, and its card up: the card stands on that word, and has stood still a moment
    // (a card is placed as it opens and once more as its rows arrive)
    const tapWord = async (sel) => {
      const r = await rectOf(`${sel} .w`); await tapAt(r.x + r.w / 2, r.y + r.h / 2);
      await p.waitForFunction((sel) => { const a = document.querySelector(".wb.active"); return !document.getElementById("hud").hidden && !!a && a.matches(sel); }, sel, { timeout: 30000 });
      await p.waitForTimeout(1800);
    };
    const hud = () => p.evaluate(() => { const h = document.getElementById("hud"); const r = h.getBoundingClientRect(); const a = document.querySelector(".wb.active"); const ar = a ? a.getBoundingClientRect() : null; return { open: !h.hidden, moved: h.classList.contains("moved"), top: Math.round(r.top), left: Math.round(r.left), bottom: Math.round(r.bottom), on: a ? a.dataset.check || "" : "", under: ar ? Math.round(r.top - ar.bottom) : null }; });
    // a word still in view that the card does not cover, the farthest from the card, tagged with the given name
    const farWord = (name) => p.evaluate((name) => { const h = document.getElementById("hud").getBoundingClientRect(); let best = null, far = -1; for (const x of document.querySelectorAll("section.seg .he-text .wb:not(.mark)")) { if (x.dataset.check) continue; const w = x.querySelector(".w"); if (!w) continue; const r = w.getBoundingClientRect(); if (r.top < 4 || r.bottom > window.innerHeight - 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const e = document.elementFromPoint(cx, cy); if (!e || !x.contains(e)) continue; const d = cy < h.top ? h.top - cy : cy - h.bottom; if (d > far) { far = d; best = x; } } if (best) best.dataset.check = name; return !!best; }, name);
    // the fourth verse at the top of the screen; word A on the second line in view, so its card opens under it and
    // leaves the lines above it free
    await p.evaluate(() => document.getElementById("s3").scrollIntoView({ block: "start" })); await p.waitForTimeout(1500);
    await p.evaluate(() => { const wbs = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")].filter((x) => { const r = x.getBoundingClientRect(); return r.top > 60 && r.bottom < 900; }); const tops = [...new Set(wbs.map((x) => Math.round(x.getBoundingClientRect().top)))].sort((a, c) => a - c); wbs.filter((x) => Math.round(x.getBoundingClientRect().top) === tops[1])[0].dataset.check = "A"; const rest = wbs.filter((x) => !x.dataset.check && !x.closest(".wjoin")); rest[rest.length - 1].dataset.check = "W"; });
    // the visit's first card, opened and shut: the book's source-suggested file arrives with it and builds that
    // card again, which lets go of a card once and would hide what is asked here
    await tapWord('[data-check="W"]'); await p.waitForTimeout(1500); await shut(p);
    await tapWord('[data-check="A"]');
    // one still press on the head's Hebrew word
    const hw = await rectOf("#hud .head b");
    await tapAt(hw.x + hw.w / 2, hw.y + hw.h / 2); await p.waitForTimeout(500);
    const still = await hud();
    if (!(await farWord("B"))) throw new Error("no uncovered word in view for the next card");
    await tapWord('[data-check="B"]');
    const next = await hud();
    const out = { still: still.moved, nextOn: next.on, nextUnder: next.under };
    if (!touch) {
      // a real drag of the card on B: down on the head, sixty pixels down in six steps, up; then another word
      const before = await hud();
      const hb = await rectOf("#hud .head b");
      const x = hb.x + hb.w / 2, y = hb.y + hb.h / 2;
      await p.mouse.move(x, y); await p.mouse.down();
      for (let i = 1; i <= 6; i += 1) { await p.mouse.move(x, y + i * 10); await p.waitForTimeout(30); }
      await p.mouse.up(); await p.waitForTimeout(500);
      const parked = await hud();
      if (!(await farWord("C"))) throw new Error("no uncovered word in view after the drag");
      await tapWord('[data-check="C"]');
      const after = await hud();
      Object.assign(out, { dragMoved: parked.moved, dragBy: parked.top - before.top, afterOn: after.on, afterTop: after.top, parkedTop: parked.top, afterOpen: after.open });
    }
    await ctx.close();
    return out;
  };
  const m = await walk(false), t = await walk(true);
  const stillOk = (x) => x.still === false && x.nextOn === "B" && x.nextUnder !== null && x.nextUnder >= 0 && x.nextUnder <= 16;
  law("10", "a still press on the card's head parks nothing, and a real drag parks the card where the reader leaves it",
    stillOk(m) && stillOk(t) && m.dragMoved === true && Math.abs(m.dragBy - 60) <= 2 && m.afterOpen && m.afterOn === "C" && m.afterTop === m.parkedTop,
    `one still press on the head: marked as moved ${m.still} by mouse, ${t.still} by finger; the next word’s card stands ${m.nextUnder}px under its word by mouse, ${t.nextUnder}px by finger · a drag of sixty pixels: marked as moved ${m.dragMoved}, the card moved ${m.dragBy}px, and the next word’s card ${m.afterTop === m.parkedTop ? `stays where it was left (top ${m.afterTop})` : `moved from top ${m.parkedTop} to ${m.afterTop}`}`);
});

// ---- 11a ----------------------------------------------------------------------------------------------------
await attempt("11a", "a fault at load is said as a fault, and a book the shelf does not hold is said to be unpublished", async () => {
  const ABSENT = "No book is published on this page yet";
  const said = async (book, pat, how) => {
    const { ctx, p } = await visit();
    if (pat) await p.route(pat, (route) => (how === "abort" ? route.abort("connectionreset") : route.fulfill({ status: 503, body: "Service Unavailable" })));
    await p.goto(`${BASE}/zone.html?b=${book}`, { waitUntil: "networkidle", timeout: T }).catch(() => {});
    await p.waitForFunction(() => document.querySelector("section.seg .he-text .wb") || ((document.getElementById("meta") || {}).textContent || "").trim().length > 20, null, { timeout: T }).catch(() => {});
    await p.waitForTimeout(800);
    const s = await p.evaluate(() => ({ meta: ((document.getElementById("meta") || {}).textContent || "").trim(), sections: document.querySelectorAll("section.seg").length }));
    await ctx.close();
    return s;
  };
  const rows = [
    ["the catalog’s index dropped", await said("amos", "**/data/route-store/index.json*", "abort"), false],
    ["the book’s bin dropped", await said("amos", "**/data/zones/amos.bin*", "abort"), false],
    ["the book’s bin answered 503", await said("amos", "**/data/zones/amos.bin*", "503"), false],
    ["a book the shelf does not hold", await said("no-such-book-on-this-shelf", null, null), true],
  ];
  const ok = rows.every(([, s, absent]) => s.sections === 0 && s.meta.length > 20 && s.meta.startsWith(ABSENT) === absent);
  law("11a", "a fault at load is said as a fault, and a book the shelf does not hold is said to be unpublished", ok,
    rows.map(([what, s]) => { const why = /\(([^()]*)\)\. That is a fault/u.exec(s.meta); return `${what}: «${s.meta.slice(0, 37)}…»${why ? ` (${why[1]})` : ""}`; }).join(" · "));
});

// ---- 11b ----------------------------------------------------------------------------------------------------
await attempt("11b", "a file whose first fetch failed is asked for again when next needed", async () => {
  // the first request for the file is dropped, every later one let through
  const once = async (p, pat) => { const n = { asked: 0, failed: 0 }; await p.route(pat, (route) => { n.asked += 1; if (n.failed === 0) { n.failed += 1; return route.abort("connectionreset"); } return route.continue(); }); return n; };
  const card = async (p, label, w) => { const c = await cellAt(p, label, w); await openCard(p, c.sel); await p.waitForTimeout(1500); const bsb = await p.evaluate(() => !!document.querySelector("#hud .r-sug")); await shut(p); return bsb; };
  const out = [];
  { // the lattice: asked for at the load under this book's resting pointing; the next thing that needs it asks again
    const { ctx, p } = await visit(); const n = await once(p, "**/data/zones/amos.lattice.bin*");
    await load(p, "amos"); await card(p, "1:2", 3); await p.waitForTimeout(800);
    const here = await p.evaluate(() => !!window.__latticeStore);
    out.push(["the lattice", n.failed === 1 && here, `asked for ${n.asked} times, ${here ? "here" : "never here"}`]);
    await ctx.close(); }
  { // the source-suggested file: asked for by the first card; the second card asks again and wears its row
    const { ctx, p } = await visit(); const n = await once(p, "**/data/source-suggested/amos.json*");
    await load(p, "amos"); const c1 = await card(p, "1:2", 3); const c2 = await card(p, "1:3", 5);
    out.push(["the source-suggested file", n.failed === 1 && !c1 && c2, `asked for ${n.asked} times, its row on the second card ${c2 ? "yes" : "no"}`]);
    await ctx.close(); }
  { // the map of pointers: asked for once, after the first paint; the next card asks again
    const { ctx, p } = await visit(); const n = await once(p, "**/data/form-of-pills-v1.json*");
    await load(p, "amos"); await p.waitForFunction(() => window.__formOf !== undefined, null, { timeout: T }).catch(() => {});
    const before = await p.evaluate(() => !!window.__formOf);
    await card(p, "1:2", 3); await p.waitForFunction(() => !!window.__formOf, null, { timeout: 15000 }).catch(() => {});
    const here = await p.evaluate(() => !!window.__formOf);
    out.push(["the map of pointers", n.failed === 1 && !before && here, `asked for ${n.asked} times, ${here ? "here" : "never here"}`]);
    await ctx.close(); }
  { // the toggle ledger: asked for by a lay under «any naming»; moved off it and back, the lay asks again
    const { ctx, p } = await visit({ kept: { "fh.maqaf-join": "maqaf", "fh.runs": "all" } }); const n = await once(p, "**/data/hud-toggles/amos.json*");
    await load(p, "amos", "&rail=all");
    const before = await p.evaluate(() => !!(window.__hudToggles && window.__hudToggles.file));
    await pressRail(p, "runs", 1); await p.waitForTimeout(1500);
    await pressRail(p, "runs", 2); await p.waitForFunction(() => window.__hudToggles && window.__hudToggles.runs === "all" && window.__hudToggles.file, null, { timeout: 15000 }).catch(() => {});
    const t = await p.evaluate(() => window.__hudToggles || {});
    out.push(["the toggle ledger", n.failed === 1 && !before && t.file === true && t.set === "ALL_ON/ALL", `asked for ${n.asked} times, ${t.file ? `here (the lanes laid from ${t.set})` : "never here"}`]);
    await ctx.close(); }
  law("11b", "a file whose first fetch failed is asked for again when next needed", out.every(([, ok]) => ok),
    out.map(([what, , saw]) => `${what}: ${saw}`).join(" · "));
});

await browser.close();
console.log(bad ? `\n${bad} FAILED` : "\nall laws hold");
process.exit(bad ? 1 : 0);
