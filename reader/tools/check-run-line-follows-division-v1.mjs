#!/usr/bin/env node
// RUN: page
// GUARDS: run-cards-rule-v1-one-card-for-a-run-a-license-names-and-its-rungs-are-every-tiling, run-reads-its-words-rule-v1-a-run-whose-every-word-has-its-own-reading-at-the-place-reads-word-by-word-the-joined-reading-a-press-away
//
// THE RUN'S LINE FOLLOWS THE DIVISION THE READER PRESSED (the owner,
// 2026-11-05, of a run a dictionary names whole, its card switched to the
// words one by one: "our default doesnt show on the runner when i simply
// switched megacompspans without pushing any R pills yet"). Pressing the
// words' division opens the first word's own card (the nesting of
// 2026-10-16) and recorded nothing, so the line under the run went on
// reading the dictionary's entry for the whole run.
//
//   D1  before anything is pressed, the run's line reads the span store's
//       entry for the whole run (the run this check opens is one it names)
//       where some word of the run has no reading of its own at the place;
//       where every word has one, the line reads the words, piece by piece,
//       the entry a press away (run-reads-its-words-rule-v1, call 3 of relay
//       v189 as the lead landed it, 15 November 2026: a word's own reading is
//       its place's pieces, every one saying something, or a place where
//       STEP's own words stand, call 4's stands in the default picks' index)
//   D2  pressing the words' division on the run's card puts the words' own
//       lines under the run, piece by piece, and no longer the whole entry
//   D3  the division stays: the card closed, the run's line still reads
//       the words, and still after the run's card is opened again and
//       closed with nothing pressed
//
// The run is found in the data, never named: the first served zone whose
// span store names a run of two or more words apart (no maqaf) at a place
// of its own, one that still reads whole at rest where any does (call 3
// leaves seven of 1,717 so on 15 November 2026), else the first. SKIPS by
// name when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";

const pw = await loadPlaywright();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ---- the run, from the data -------------------------------------------------
// call 3: whether every word of a place has its own reading at the place (its place's pieces, every one saying
// something, or call 4's stands, the default picks' index: step_words whose third element is 1), the marks aside
const STANDS = (() => { try { const dp = JSON.parse(readFileSync("data/default-picks/index.json", "utf8")); return new Map(Object.entries(dp.books || {}).map(([bk, e]) => [bk, new Set((e.step_words || []).filter((r) => r[2] === 1).map((r) => r[0]))])); } catch { return new Map(); } })();
// a place's words in its zone, the marks aside, with the word before them; a place whose first word follows a maqaf or
// whose last word ends in one is drawn inside a compound's cell, not a run of its own
const ZONES = new Map();
const wordsOf = (slug, place) => {
  if (!ZONES.has(slug)) { const f = `data/zones/${slug}.bin`; ZONES.set(slug, existsSync(f) ? JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) : null); }
  const z = ZONES.get(slug);
  let n = 0, ws = null;
  for (const sec of (z && z.sections) || []) { const own = []; for (const w of sec.words || []) { n += 1; if (!w.mark) own.push({ w, n }); } if (String(sec.label) === String(place.ref)) ws = own; }
  return { mine: (ws || []).slice(place.first - 1, place.last), before: (ws || [])[place.first - 2] || null };
};
const halfOfCompound = (q) => !!q && /\u05BE$/u.test(String(q.w.s || "").trim());
const ownCell = (slug, place) => { const { mine, before } = wordsOf(slug, place); return mine.length > 1 && !halfOfCompound(before) && !halfOfCompound(mine[mine.length - 1]); };
const readsItsWords = (slug, place) => {
  const stands = STANDS.get(slug) || new Set();
  const says = (w) => Array.isArray(w.pg) && w.pg.length > 0 && w.pg.every((x) => x && String(x.g || "").trim());
  const { mine } = wordsOf(slug, place);
  return mine.length > 0 && mine.every((q) => says(q.w) || stands.has(q.n));
};
let found = null, first = null;
for (const slug of zonesServed()) {
  const p = `data/span-store/${slug}.json`;
  if (!existsSync(p)) continue;
  const s = JSON.parse(readFileSync(p, "utf8"));
  const places = (s.placesList || []).filter((x) => x && / /u.test(x.key) && !/\u05BE/u.test(x.key) && !x.inside_of
    && Number.isInteger(x.first) && Number.isInteger(x.last) && x.last > x.first && ownCell(slug, x));
  if (places.length && !first) first = { slug, ...places[0], words: readsItsWords(slug, places[0]) };
  const whole = places.find((x) => !readsItsWords(slug, x));
  if (whole) { found = { slug, ...whole, words: false }; break; }
}
if (!found) found = first;
if (!found) { console.log("SKIPPED \u2014 no served zone's span store names a run of words apart at a place of its own"); process.exit(3); }
console.log(`\u2014 ${found.slug} ${found.ref}, words ${found.first} to ${found.last}${found.words ? ", every word reading its own at the place (no run of the span store reads whole here)" : ", some word with no reading of its own at the place"} \u2014`);

const BASE = defaultZoneUrl().replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 430, height: 950 } });
await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* a fresh reader */ } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}${BASE.includes("?") ? "&" : "?"}b=${found.slug}&at=${encodeURIComponent(found.ref)}`, { waitUntil: "networkidle", timeout: 90000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.waitForTimeout(1200);

// the run's line, read off the page: its text, whether it reads the span
// entry, whether it stands in parts, and the words' own lines under it
const read = () => p.evaluate(({ ref, key }) => {
  const strip = (t) => String(t || "").replace(/[\u0591-\u05C7]/gu, "").replace(/\s+/gu, " ").trim();
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === ref);
  if (!sec) return { error: "the verse is not on the page" };
  const run = [...sec.querySelectorAll(".wjoin")].find((j) => strip([...j.querySelectorAll(":scope .wj-ink > .wb > .w")].map((w) => w.textContent).join(" ")) === key);
  if (!run) return { error: "no run on the page stands on the span's words" };
  const g = run.querySelector(":scope > .g");
  const cells = g ? [...g.querySelectorAll(":scope > .g-part")].map((c) => { const x = c.cloneNode(true); x.querySelectorAll(".g-lic, .g-pcs-lic").forEach((y) => y.remove()); return x.textContent.replace(/\s+/gu, " ").trim(); }) : [];
  return { text: g ? g.textContent.replace(/\s+/gu, " ").trim() : "", span: g ? g.dataset.span || null : null, parts: !!(g && g.classList.contains("parts")), cells };
}, { ref: found.ref, key: found.key });
const open = () => p.evaluate(({ ref, key }) => {
  const strip = (t) => String(t || "").replace(/[\u0591-\u05C7]/gu, "").replace(/\s+/gu, " ").trim();
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === ref);
  const run = [...sec.querySelectorAll(".wjoin")].find((j) => strip([...j.querySelectorAll(":scope .wj-ink > .wb > .w")].map((w) => w.textContent).join(" ")) === key);
  (run.querySelector(".wj-ink .w span") || run.querySelector(".wj-ink .w")).click();
}, { ref: found.ref, key: found.key });
const wordsCut = found.key.split(" ").join(" + ");
const divisionButton = (name) => p.evaluate((name) => {
  const row = [...document.querySelectorAll("#hud .r-label")].find((l) => /Complete divisions/iu.test(l.textContent));
  const pills = row && row.nextElementSibling;
  const btn = pills ? [...pills.querySelectorAll("button")].find((x) => x.textContent.trim() === name) : null;
  return btn ? { pressed: btn.getAttribute("aria-pressed") === "true" } : null;
}, name);

const before = await read();
const D1 = found.words ? "D1  every word of the run reads its own at the place, so before anything is pressed its line reads the words, piece by piece, the entry a press away (call 3)" : "D1  the run's line reads the span entry before anything is pressed, some word of it having no reading of its own at the place";
if (before.error) { check(D1, false, before.error); await b.close(); process.exit(1); }
check(D1, found.words ? before.span === null && before.parts && before.cells.length === found.last - found.first + 1 : before.span === found.key && !before.parts,
  before.cells.length ? before.cells.map((c) => `"${c}"`).join(" + ") : `"${before.text}"`);

await open();
await p.waitForTimeout(1500);
const offered = await divisionButton(wordsCut);
if (!offered) { check("D2  pressing the words' division puts the words' own lines under the run", false, `the card offers no division "${wordsCut}"`); await b.close(); process.exit(1); }
await p.evaluate((name) => {
  const row = [...document.querySelectorAll("#hud .r-label")].find((l) => /Complete divisions/iu.test(l.textContent));
  [...row.nextElementSibling.querySelectorAll("button")].find((x) => x.textContent.trim() === name).click();
}, wordsCut);
await p.waitForTimeout(1500);
const after = await read();
const wordsN = found.last - found.first + 1;
check("D2  pressing the words' division puts the words' own lines under the run",
  !after.error && after.span === null && after.parts && after.cells.length === wordsN && after.cells.every((c) => c && c !== "\u2014"),
  after.error || `"${before.text}" → ${after.cells.map((c) => `"${c}"`).join(" + ")}`);

// the card closed, the run's line still reads the words; opened again and
// closed with nothing pressed, it still does
await p.keyboard.press("Escape");
await p.waitForTimeout(600);
const closed = await read();
await open();
await p.waitForTimeout(1500);
await p.keyboard.press("Escape");
await p.waitForTimeout(600);
const reopened = await read();
const words = (r) => !r.error && r.span === null && r.parts && r.cells.length === wordsN;
check("D3  the division stays: the line keeps the words after the card closes, and after it opens and closes again",
  words(closed) && words(reopened),
  closed.error || reopened.error || `closed ${closed.cells.map((c) => `"${c}"`).join(" + ") || `"${closed.text}"`} · reopened ${reopened.cells.map((c) => `"${c}"`).join(" + ") || `"${reopened.text}"`}`);

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
