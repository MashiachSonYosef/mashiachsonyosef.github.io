#!/usr/bin/env node
// RUN: tree
// LEDGER: -
// no frame letter. A check opens the page and reads what it draws; it is not the ledger for anything.
//
// FAULTS READERS REPORTED, PROVEN ON THE LIVE PAGE AND MENDED (ship 14, 21 November 2026): the panel of switches, the search and a section laid again (the third reader's findings 3, 4, 6, 9, 13 and 15).
// Each law is a short scenario that failed on the build before the mend (c1ed776b65) and holds after it.
// The readers' reports are of 10 November 2026; each was decided again in a browser before it was mended.
//
// The rail's mends of 21 November 2026, held: one law for each of the third reader's findings 3, 4, 6, 9, 13 and 15.
//
//   usage: node tools/check-readers-faults-rail-v1.mjs [--base <a served reader>]
//
// Each law is a short scenario on a phone (412 by 915) with nothing kept on the device, and each opens its own page.
// It prints one line per law and exits 1 if any law fails. Words are addressed by verse and word number (the marks
// not counted); no Hebrew letter is typed in this file: the letters a search is asked for are read off the page.
//
//   F9   the rail's one line says switched off what the fold's own line says: chips, not ledger ids
//   F4   the box on a "whole source" line switches its source off and on as its chip does, its panel still open
//   F15  a word typed without its final letter shows the readings line of the word the search found
//   F3   (rail=all) the scribes' marks button still stands, and works, after a switch draws the rail again
//   F6   (commentary=on) a section laid again keeps one bar row and its opened commentary
//   F13  the pairs' ledger and the ledger of where each form stands hold nothing that left the page
//
// F13 reads two registries that are private to the page's script, so that law's page is served to this browser
// with one line added in transit that names them on window; no file on a disk is touched.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
const { chromium } = await loadPlaywright();
// the tree is served here, unless --base or SERVE_BASE names another (the live build, to see these laws red)
const TREE = process.argv.includes("--base") || process.env.SERVE_BASE ? null : await serveTree(join(dirname(fileURLToPath(import.meta.url)), ".."));
const SERVED = process.env.SERVE_BASE || (TREE ? TREE.base : "");

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : null; };
const BASE = (arg("base") || SERVED).replace(/\/+$/u, "");
const DOT = String.fromCodePoint(0xb7);
let bad = 0;
const verdict = (ok, id, law, saw) => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${id}  ${law}  ${DOT}  ${saw}`); };
const short = (t, n = 60) => { const s = String(t == null ? "" : t).replace(/\s+/gu, " ").trim(); return s.length > n ? `${s.slice(0, n - 1)}...` : s; };

const browser = await chromium.launch(launchOptions());
const ready = async (p) => {
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 180000 });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(1200);
};
// a page of its own, nothing kept on the device; named: the registries are named on window as the page is served
const load = async (query, named = false) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(60000);
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e && e.message)));
  if (named) {
    await p.route(/\/zone\.html(\?|$)/u, async (route) => {
      const r = await route.fetch(); let body = await r.text();
      const at = "const GLOSS_STANDS = [];";
      if (body.split(at).length === 2) body = body.replace(at, `${at} window.__reg = { KQ_STANDS, standsOf, GLOSS_STANDS };`);
      await route.fulfill({ response: r, body });
    });
  }
  await p.goto(`${BASE}/zone.html?${query}`, { waitUntil: "networkidle", timeout: 180000 });
  await ready(p);
  return { p, ctx, errors };
};
const law = async (id, sentence, run) => {
  let ctx = null;
  try {
    const got = await run((c) => { ctx = c; });
    verdict(got.ok, id, sentence, got.saw);
  } catch (e) { verdict(false, id, sentence, `the scenario did not finish: ${short(e && e.message, 200)}`); }
  if (ctx) await ctx.close().catch(() => {});
};
// the section of a verse, marked so a selector finds it; null where the page holds no such verse
const markSection = (p, label) => p.evaluate((l) => {
  const s = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent === l);
  if (!s) return false;
  s.scrollIntoView({ block: "start" }); s.dataset.check = l; return true;
}, label);
// a reading pressed on the card of one word of a marked section, the card closed, then the reset pill: the sections a
// ruling stands in are laid again. Answers what was pressed and how many sections were laid again.
const pickThenReset = async (p, label, n) => {
  const before = await p.evaluate(() => window.__hudRelaid || 0);
  await p.evaluate(([l, k]) => {
    const s = document.querySelector(`section.seg[data-check="${l}"]`);
    const wb = [...s.querySelectorAll(":scope > .he-text .wb:not(.mark)")][k - 1];
    wb.scrollIntoView({ block: "center" });
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
  }, [label, n]);
  // (attached, not visible: the first of these in the card may be one a tight card folds away)
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { state: "attached", timeout: 60000 });
  await p.waitForTimeout(900);
  const pressed = await p.evaluate(() => {
    const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")];
    const x = xs.find((y) => !y.disabled && y.getAttribute("aria-pressed") !== "true" && !y.classList.contains("on"));
    if (x) x.click();
    return x ? x.textContent : null;
  });
  await p.waitForTimeout(900);
  await p.keyboard.press("Escape");
  await p.waitForFunction(() => document.getElementById("hud").hidden, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  const chosen = await p.evaluate(() => document.querySelectorAll("section.seg .wb.chosen, section.seg .wjoin.chosen").length);
  await p.evaluate(() => document.getElementById("resetPill").scrollIntoView({ block: "center" }));
  await p.click("#resetPill");
  await p.waitForFunction((b) => (window.__hudRelaid || 0) > b, before, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1200);
  return { pressed, chosen, relaid: (await p.evaluate(() => window.__hudRelaid || 0)) - before };
};

// ---- F9 --------------------------------------------------------------------------------------------------------
await law("F9", "the rail's one line says switched off what the fold's own line says, at a fresh load and with a chip of several ledger ids off", async (keep) => {
  const { p, ctx } = await load("b=obadiah"); keep(ctx);
  const read = () => p.evaluate(() => {
    const chips = [...document.querySelectorAll("#sourcesRow .src-row")];
    const rail = ((document.querySelector('#railNow b[data-toggle="sources"]') || {}).textContent || "").trim();
    const fold = ((document.querySelector("#sourcesRow .src-sum") || {}).textContent || "").trim();
    const n = (re, t) => { const m = re.exec(t); return m ? Number(m[1]) : 0; };
    return { rail, fold, railOff: n(/(\d+) off\b/u, rail), foldOff: n(/(\d+) switched off/u, fold), chipsOff: chips.filter((c) => c.classList.contains("off")).length, chips: chips.length, ids: (window.__sourcesOff || []).length };
  });
  const rest = await read();
  await p.evaluate(() => { document.getElementById("rail").open = true; });
  // the chip that carries the most ledger ids, its box pressed as a reader presses it
  const most = await p.evaluate(() => {
    const on = [...document.querySelectorAll("#sourcesRow .src-row")].filter((c) => c.querySelector("button.dfp").getAttribute("aria-pressed") === "true");
    const c = on.sort((a, b) => b.querySelector("button.dfp").dataset.ids.split(" ").length - a.querySelector("button.dfp").dataset.ids.split(" ").length)[0];
    if (!c) return null;
    c.querySelector("button.dfp").dataset.check = "chip";
    return { name: c.querySelector(".src-name").textContent, ids: c.querySelector("button.dfp").dataset.ids.split(" ").length };
  });
  if (!most) return { ok: false, saw: `no chip stands on the strip (${rest.chips} chips)` };
  await p.locator('#sourcesRow button.dfp[data-check="chip"]').click();
  await p.waitForTimeout(1500);
  const off = await read();
  const ok = rest.chips > 0 && rest.railOff === rest.foldOff && rest.foldOff === rest.chipsOff
    && off.chipsOff === rest.chipsOff + 1 && off.railOff === off.foldOff && off.foldOff === off.chipsOff;
  return { ok, saw: `Obadiah at a fresh load: «${rest.rail}» over «${rest.fold}» (${rest.ids} ledger id${rest.ids === 1 ? "" : "s"} off, ${rest.chipsOff} of ${rest.chips} chips off); ${most.name}'s chip (${most.ids} ids) switched off: «${off.rail}» over «${off.fold}» (${off.ids} ids off, ${off.chipsOff} chip off)` };
});

// ---- F4 --------------------------------------------------------------------------------------------------------
await law("F4", "the box on a whole-source line switches its source off and on as its chip does, and the panel being read stays open", async (keep) => {
  const { p, ctx } = await load("b=obadiah"); keep(ctx);
  await p.evaluate(() => { document.getElementById("rail").open = true; });
  const keys = await p.evaluate(() => [...document.querySelectorAll("#sourcesRow .src-open")].map((x) => x.dataset.key));
  // the first dictionary of the strip whose panel draws a live box
  let key = null;
  for (const k of keys) {
    await p.evaluate((x) => { [...document.querySelectorAll("#sourcesRow .src-open")].find((y) => y.dataset.key === x).click(); }, k);
    await p.waitForSelector("#sourcesRow .decl", { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(300);
    if (await p.evaluate(() => document.querySelectorAll("#sourcesRow .decl .decl-bx:not(:disabled)").length)) { key = k; break; }
  }
  if (!key) return { ok: false, saw: `none of the ${keys.length} dictionaries on Obadiah's strip draws a live box` };
  const state = () => p.evaluate((k) => {
    const chip = [...document.querySelectorAll("#sourcesRow .src-row")].find((x) => x.dataset.key === k);
    const name = chip && chip.querySelector(".src-open");
    const panel = document.querySelector("#sourcesRow .decl");
    const bx = panel && panel.querySelector(".decl-bx:not(:disabled)");
    const a = document.activeElement;
    return { chip: chip ? chip.querySelector("button.dfp").getAttribute("aria-pressed") : null, fold: ((document.querySelector("#sourcesRow .src-sum") || {}).textContent || "").trim(),
      panel: panel ? panel.dataset.key === k : false, expanded: name ? name.getAttribute("aria-expanded") : null,
      box: bx ? bx.getAttribute("aria-pressed") : null, label: bx ? bx.getAttribute("aria-label") : null, focus: !!(a && a.classList && a.classList.contains("decl-bx")) };
  }, key);
  const press = async () => { const bx = p.locator("#sourcesRow .decl .decl-bx:not(:disabled)").first(); await bx.scrollIntoViewIfNeeded(); await bx.click(); await p.waitForTimeout(1500); };
  const s0 = await state();
  await press();
  const s1 = await state();
  if (s1.panel && s1.box) await press();
  const s2 = await state();
  const ok = s0.chip === "true" && s0.box === "true"
    && s1.chip === "false" && /\b1 switched off$/u.test(s1.fold) && s1.panel && s1.expanded === "true" && s1.box === "false" && s1.focus
    && s2.chip === "true" && /all on$/u.test(s2.fold) && s2.panel && s2.expanded === "true" && s2.box === "true" && s2.focus;
  const say = (s) => `chip ${s.chip === "true" ? "on" : s.chip === "false" ? "off" : "absent"}, «${s.fold}», panel ${s.panel ? "open" : "closed"}, box ${s.box === null ? "absent" : s.box === "true" ? "checked" : "unchecked"}${s.label ? ` («${short(s.label.split(":")[0], 12)}»)` : ""}${s.focus ? ", holding the focus" : ""}`;
  return { ok, saw: `Obadiah, ${short(key, 28)}: before ${say(s0)}; the box pressed: ${say(s1)}; pressed again: ${say(s2)}` };
});

// ---- F15 -------------------------------------------------------------------------------------------------------
await law("F15", "a word typed without its final letter shows the readings line the same word shows typed with it", async (keep) => {
  const { p, ctx } = await load("b=obadiah"); keep(ctx);
  // three words of Obadiah that end in a final letter (read off the page, never typed here). Under the letters
  // of 1:1 word 1 without their final the dictionary store holds nothing; under those of 1:2 word 2 and of 1:3
  // word 13 it holds a key of its own, the same letters where they stand inside longer words
  const places = [["1:1", 1], ["1:2", 2], ["1:3", 13]];
  const cp = (c) => c.codePointAt(0);
  const lettersOf = (s) => [...String(s || "").normalize("NFD")].filter((c) => cp(c) >= 0x5d0 && cp(c) <= 0x5ea).join("");
  const FINALS = new Set([0x5da, 0x5dd, 0x5df, 0x5e3, 0x5e5]);   // each final form stands one below its letter
  const ask = async (q) => {
    await p.click("#searchIn");
    await p.keyboard.press("Escape");            // the box and the list are emptied at once
    await p.fill("#searchIn", q);
    await p.keyboard.press("Enter");             // asked now, whole
    await p.waitForFunction(() => { const o = document.getElementById("searchOut"); return o && !o.hidden && !/searching/u.test(o.textContent) && o.querySelector(".hit, .note"); }, null, { timeout: 60000 });
    await p.waitForTimeout(300);
    return p.evaluate(() => {
      const o = document.getElementById("searchOut"), h = o.querySelector(".lab + .hit");
      if (!h) return { word: null, places: null, reads: null };
      return { word: h.querySelector(".he").textContent, places: h.querySelector(".meta").textContent.split(" ")[0], reads: (h.querySelector(".rd") || { textContent: null }).textContent };
    });
  };
  const seen = []; let ok = true;
  for (const [label, n] of places) {
    if (await markSection(p, label)) await p.waitForTimeout(800);   // within reach, so built
    const text = await p.evaluate(([l, k]) => {
      const s = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent === l);
      const wb = s ? [...s.querySelectorAll(":scope > .he-text .wb:not(.mark)")][k - 1] : null;
      return wb ? (wb.querySelector(".w") || wb).textContent : null;
    }, [label, n]);
    const L = lettersOf(text), last = L ? cp([...L].pop()) : 0;
    if (!FINALS.has(last)) { ok = false; seen.push(`${label} word ${n}: ${L ? "does not end in a final letter" : "not on the page"}`); continue; }
    const plain = [...L].slice(0, -1).join("") + String.fromCodePoint(last + 1);
    const withFinal = await ask(L), without = await ask(plain);
    const same = !!withFinal.word && withFinal.word === without.word && withFinal.reads !== null && withFinal.reads === without.reads;
    if (!same) ok = false;
    seen.push(`${label} word ${n} (${withFinal.places} places): with its final «${short(withFinal.reads, 44)}», without it ${without.word !== withFinal.word ? "another word" : without.reads === null ? "no readings line" : same ? "the same line" : `«${short(without.reads, 44)}»`}`);
  }
  return { ok, saw: `Obadiah ${seen.join("; ")}` };
});

// ---- F3 --------------------------------------------------------------------------------------------------------
await law("F3", "(rail=all) the scribes' marks button still stands under the fold, and works, after a switch draws the rail again", async (keep) => {
  const { p, ctx } = await load("b=obadiah&rail=all"); keep(ctx);
  const marks = () => p.evaluate(() => {
    const m = document.getElementById("marksToggle");
    return { inPage: !!m, row: !!(m && m.closest("#railRows details.more-switches .marks-row")), shown: !!m && !m.hidden, text: m ? m.textContent : "", pressed: m ? m.getAttribute("aria-pressed") : null, on: document.body.classList.contains("marks-on") };
  });
  const s0 = await marks();
  await p.click("#sensesPill");                  // the word senses: the rail is drawn again
  await p.waitForTimeout(1500);
  const s1 = await marks();
  if (s1.inPage) {
    await p.evaluate(() => { document.getElementById("rail").open = true; const f = document.querySelector("#railRows details.more-switches"); if (f) f.open = true; });
    await p.locator("#marksToggle").click();
    await p.waitForTimeout(400);
  }
  const s2 = await marks();
  const ok = s0.inPage && s0.row && s0.shown && s1.inPage && s1.row && s1.shown && s1.text === s0.text && s2.on && s2.pressed === "true";
  const say = (s) => (s.inPage ? `${s.row ? "under the fold" : "outside the fold"}, ${s.shown ? `«${short(s.text, 44)}»` : "hidden"}` : "not in the page");
  return { ok, saw: `Obadiah: at load ${say(s0)}; the word senses pressed: ${say(s1)}; ${s1.inPage ? `the button pressed: the marks ${s2.on ? "show" : "do not show"}, «${short(s2.text, 30)}»` : "nothing to press"}` };
});

// ---- F6 --------------------------------------------------------------------------------------------------------
await law("F6", "(commentary=on) a section laid again keeps one bar row and its opened commentary, and the bar still closes and opens it", async (keep) => {
  const { p, ctx } = await load("b=ruth&commentary=on"); keep(ctx);
  const LABEL = "1:1";
  if (!(await markSection(p, LABEL))) return { ok: false, saw: `Ruth ${LABEL} is not on the page` };
  await p.waitForTimeout(800);
  const SEC = `section.seg[data-check="${LABEL}"]`;
  const state = () => p.evaluate((sel) => {
    const s = document.querySelector(sel), bar = s.querySelector(".c-bar");
    return { rows: s.querySelectorAll(":scope > .c-barrow").length, empty: document.querySelectorAll("section.seg > .c-barrow:empty").length,
      bar: bar ? bar.getAttribute("aria-expanded") : null, shown: s.querySelectorAll(".c-inline:not([hidden])").length, built: s.querySelectorAll(".c-inline").length, height: Math.round(s.getBoundingClientRect().height) };
  }, SEC);
  const pressBar = async () => { const bar = p.locator(`${SEC} .c-bar`).first(); await bar.scrollIntoViewIfNeeded(); await bar.click(); await p.waitForTimeout(800); };
  const s0 = await state();
  if (s0.bar === null) return { ok: false, saw: `Ruth ${LABEL} draws no commentary bar` };
  await pressBar();
  const s1 = await state();
  const r = await pickThenReset(p, LABEL, 2);
  const s2 = await state();
  await pressBar();
  const s3 = await state();
  await pressBar();
  const s4 = await state();
  const ok = s0.rows === 1 && s1.shown > 0 && s1.bar === "true" && r.relaid > 0
    && s2.rows === 1 && s2.empty === 0 && s2.shown === s1.shown && s2.bar === "true" && Math.abs(s2.height - s1.height) <= 1
    && s3.shown === 0 && s3.bar === "false" && s4.shown === s1.shown && s4.bar === "true" && s4.rows === 1;
  const say = (s) => `${s.rows} bar row${s.rows === 1 ? "" : "s"}${s.empty ? ` (${s.empty} empty on the page)` : ""}, ${s.shown} commentar${s.shown === 1 ? "y" : "ies"} shown, the bar says ${s.bar === "true" ? "open" : "closed"}, ${s.height}px`;
  return { ok, saw: `Ruth ${LABEL}: opened by its bar: ${say(s1)}; word 2 ruled «${short(r.pressed, 20)}» and reset (${r.relaid} section${r.relaid === 1 ? "" : "s"} laid again): ${say(s2)}; the bar pressed: ${s3.shown} shown; again: ${s4.shown} shown` };
});

// ---- F13 -------------------------------------------------------------------------------------------------------
await law("F13", "after sections are laid again, the pairs' ledger and the ledger of where each form stands hold no element that left the page", async (keep) => {
  const { p, ctx } = await load("b=ruth", true); keep(ctx);
  const LABEL = "3:3";   // a verse with two pairs
  if (!(await p.evaluate(() => !!window.__reg))) return { ok: false, saw: "the registries could not be named on window as the page was served" };
  if (!(await markSection(p, LABEL))) return { ok: false, saw: `Ruth ${LABEL} is not on the page` };
  await p.waitForTimeout(1500);
  const read = () => p.evaluate(() => {
    const reg = window.__reg, so = [...reg.standsOf.values()].flat();
    return { kq: reg.KQ_STANDS.length, kqGone: reg.KQ_STANDS.filter((x) => !x.ge || !x.ge.isConnected).length, so: so.length, soGone: so.filter((x) => !x.wb || !x.wb.isConnected).length,
      gloss: reg.GLOSS_STANDS.length, glossGone: reg.GLOSS_STANDS.filter((x) => !x.ge || !x.ge.isConnected).length };
  });
  const s0 = await read();
  const rounds = [];
  for (let n = 1; n <= 2; n += 1) { const r = await pickThenReset(p, LABEL, 2); rounds.push({ r, s: await read() }); }
  const ok = s0.kq > 0 && s0.kqGone === 0 && s0.soGone === 0 && rounds.every(({ r, s }) => r.relaid > 0 && s.kqGone === 0 && s.soGone === 0 && s.glossGone === 0 && s.kq === s0.kq);
  const say = (s) => `the pairs' ledger ${s.kq} (${s.kqGone} gone from the page), where forms stand ${s.so} (${s.soGone} gone)`;
  return { ok, saw: `Ruth ${LABEL}, word 2 ruled and reset, twice: at load ${say(s0)}; ${rounds.map(({ r, s }, i) => `after relay ${i + 1} (${r.relaid} laid again) ${say(s)}`).join("; ")}` };
});

await browser.close();
console.log(bad ? `\n${bad} law${bad === 1 ? "" : "s"} failed against ${BASE}` : `\nevery law holds against ${BASE}`);
process.exit(bad ? 1 : 0);
