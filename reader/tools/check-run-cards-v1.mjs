// check-run-cards-v1 · one card for a run a license names, and nothing else moves
//
// GUARDS: run-cards-rule-v1-one-card-for-a-run-a-license-names-and-its-rungs-are-every-tiling
// LEDGER: -
// no frame letter. This writes nothing: it reads data/run-cards/ and the page
// the reader draws from it.
//
// The owner, 2026-10-03: "1 single hud whereever words happen to match across
// xyz span. A+...+V". What must hold:
//
//   R1  every card on the shelf stands on its book's own words: each word's key
//       is the zone's key at that place, every run named inside it lies inside
//       it, and the index lists exactly the books that have a file
//   R2  the page draws every card of the book it opens, and marks its words
//   R3  the line under every word, and the Hebrew, are the same with the run
//       cards and without them (known red since the span store, 2026-10-16:
//       a run card around a place the store names, as at Numbers 33:7, reads
//       its line word by word where the place's own cell read the span; the
//       run cards are off for readers, and the owner's word is awaited)
//   R4  pressing a run's word opens one card for the whole run: its divisions
//       are the run as named, a fold only where a dictionary published one
//       (never the run welded into one word: no weld, 2026-10-17), then
//       every other tiling of its words by
//       its named runs and single words, the words one by one last; it opens
//       word by word on the word pressed, as the line reads it, and every word
//       of the run wears the selection
//   R5  a run that is exactly a maqaf chain keeps the chain's own divisions,
//       with the named ones added before the words one by one
//
// Run: node tools/check-run-cards-v1.mjs [zone url]   (with python3 -m http.server 8899 in reader/)
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const DIR = join("data", "run-cards");
const ixPath = join(DIR, "index.json");
if (!existsSync(ixPath)) { console.log("SKIPPED — no run-card index (data/run-cards/index.json)"); process.exit(3); }
const ix = JSON.parse(readFileSync(ixPath, "utf8"));
const listed = Object.keys(ix.books || {}).sort();
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "index.json").map((f) => f.replace(/\.json$/u, "")).sort();
if (!listed.length && !files.length) { console.log("SKIPPED — the index lists no book: no run card is served yet"); process.exit(3); }

// R1
const tilingsOf = (n, named) => {
  const out = [];
  const walk = (i, acc) => {
    if (out.length >= 64) return;
    if (i === n) { out.push(acc); return; }
    for (const [f, t] of named) if (f === i) walk(t + 1, [...acc, `${f}-${t}`]);
    walk(i + 1, [...acc, `${i}-${i}`]);
  };
  walk(0, []);
  return out;
};
const bookCards = {};
let r1bad = [];
for (const book of listed) {
  const rec = JSON.parse(readFileSync(join(DIR, `${book}.json`), "utf8"));
  const zone = JSON.parse(gunzipSync(readFileSync(join("data", "zones", `${book}.bin`))).toString("utf8"));
  const secs = new Map((zone.sections || []).map((s) => [s.unit, s]));
  for (const c of rec.cards) {
    const sec = secs.get(c.unit);
    if (!sec || c.idx.length < 2 || c.idx.some((i, j) => !sec.words[i] || sec.words[i].k !== c.keys[j])) r1bad.push(`${book} ${c.label} ${c.text}`);
    else if ((c.named || []).some(([f, t]) => !(f >= 0 && t < c.idx.length && t > f))) r1bad.push(`${book} ${c.label}: a named run outside its card`);
  }
  if ((ix.books[book] || {}).cards !== rec.cards.length) r1bad.push(`${book}: index says ${(ix.books[book] || {}).cards}, file holds ${rec.cards.length}`);
  bookCards[book] = rec.cards;
}
const unlisted = files.filter((f) => !listed.includes(f));
check("R1  every card stands on its book's own words, and the index lists exactly the books with a file",
  r1bad.length === 0 && unlisted.length === 0,
  `${listed.length} books · ${Object.values(bookCards).reduce((n, l) => n + l.length, 0)} cards${r1bad.length ? ` · astray: ${r1bad.slice(0, 3).join(" | ")}` : ""}${unlisted.length ? ` · files the index does not list: ${unlisted.join(", ")}` : ""}`);

// the browser half, on the listed book with the most cards
const BOOK = listed.slice().sort((a, b) => bookCards[b].length - bookCards[a].length)[0];
const BASE = defaultZoneUrl().split("?")[0];
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
// the run cards are off by default this week (the owner, 2026-10-15: "not serving extraneous things we arent ready to serve yet"); this check judges the file's cards themselves, so it switches them on, the entry's own
await p.addInitScript(() => { try { localStorage.setItem("fh.runs", "own"); } catch { /* a device that remembers nothing still reads */ } });

// the whole book built, so every card's words exist on the page
// the HUD record's runs (data/hud-runs, check-hud-runs-v1) ride the same lane;
// this check reads the run cards alone, so both loads go without them
const load0 = async (withRuns, cards) => {
  await p.unroute("**/data/run-cards/**").catch(() => {});
  await p.unroute("**/data/hud-runs/**").catch(() => {});
  await p.route("**/data/hud-runs/**", (r) => r.fulfill({ status: 404, body: "" }));
  if (!withRuns) await p.route("**/data/run-cards/**", (r) => r.fulfill({ status: 404, body: "" }));
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // every section built, as the page builds one when the reader comes near
  // (its body waits on the section as __body); a fast scroll can pass one by
  await p.evaluate(() => { for (const el of document.querySelectorAll("section.seg")) if (el.__body) { const f = el.__body; el.__body = null; f(); } });
  await p.waitForTimeout(500);
  // word by word: each word's own line (in a cell, the part under it; a part
  // the signs switch drops reads as none), and each word's Hebrew
  return p.evaluate((cards) => ({
    at: [...document.querySelectorAll("section.seg .he-text .wb")].map((wb) => `${((wb.closest("section.seg") || {}).querySelector(".vnum") || {}).textContent || "?"} ${(wb.querySelector(":scope > .w") || {}).textContent || ""}`),
    lines: [...document.querySelectorAll("section.seg .he-text .wb")].map((wb) => {
      const j = wb.closest(".wjoin");
      if (!j) return (wb.querySelector(":scope > .g") || { textContent: "" }).textContent;
      const wi = [...j.querySelectorAll(":scope > .wj-ink > .wb")].indexOf(wb);
      const part = j.querySelector(`:scope > .g.parts > .g-part[data-wi="${wi}"]`);
      return part ? part.textContent : "";
    }),
    ink: [...document.querySelectorAll("section.seg .he-text .wb > .w")].map((w) => w.textContent).join("\n"),
    cards: window.__runCards || 0,
    held: window.__runCardsHeld || [],
    // a card's word is marked by the card's own cell, or by the cell of a
    // span the store names over the card's words (the span leads there, the
    // card's names inside it); a span's cell marks no word for a card
    marked: (() => {
      const labels = new Map(((window.__zone || {}).sections || []).map((s) => [s.unit, s.label]));
      const secs = new Map([...document.querySelectorAll("section.seg")].map((s) => [(s.querySelector(".vnum") || {}).textContent, s]));
      const seen = new Set();
      for (const c of cards) { const el = secs.get(labels.get(c.unit)); const wbs = el ? [...el.querySelectorAll(".he-text .wb")] : []; for (const i of c.idx) if (wbs[i] && wbs[i].__run && wbs[i].closest(".wjoin.lic")) seen.add(`${c.unit}:${i}`); }
      return seen.size;
    })(),
    byCards: [...document.querySelectorAll(".wjoin.lic .wb")].filter((w) => w.__run && !w.__run.spanKey).length,
  }), cards);
};
const cardsOfBook = bookCards[BOOK].map((c) => ({ unit: c.unit, idx: c.idx }));
const load = ((f) => (withRuns) => f(withRuns, cardsOfBook))(load0);
const without = await load(false);
const withR = await load(true);
// a card the page holds (it shares words with a place the span store names,
// neither inside it nor around it) is not drawn; the place's cell stands
const heldSet = new Set(withR.held);
const drawn = bookCards[BOOK].filter((c) => !heldSet.has(`${c.unit}:${c.idx.join(",")}`));
const wantWords = new Set(drawn.flatMap((c) => c.idx.map((i) => `${c.unit}:${i}`))).size;
check("R2  the page draws every card of its book and marks its words", withR.cards + withR.held.length === bookCards[BOOK].length && withR.marked >= wantWords && without.byCards === 0,
  `${BOOK}: ${withR.cards} of ${bookCards[BOOK].length} cards${withR.held.length ? ` (${withR.held.length} held beside a place the store names)` : ""} · ${withR.marked} of ${wantWords} words marked · ${without.byCards} marked by a card without the file`);
const diffs = withR.lines.map((t, i) => (t !== without.lines[i] ? i : -1)).filter((i) => i >= 0);
const diff = diffs.length;
check("R3  the line under every word and the Hebrew are the same with run cards and without", diff === 0 && withR.lines.length === without.lines.length && withR.ink === without.ink,
  `${withR.lines.length} lines · ${diff} differ · Hebrew ${withR.ink === without.ink ? "identical" : "CHANGED"}${diff ? ` · ${diffs.slice(0, 3).map((i) => `${withR.at[i]}: "${without.lines[i]}" → "${withR.lines[i]}"`).join(" | ")}` : ""}`);

// R4 and R5: open cards, the space runs and the chains apart
const opened = await p.evaluate(async () => {
  const out = [];
  // a run's first word, from its cell; a chain is a run that is exactly a maqaf chain
  // the run cards' own cells; a span the store names is judged by check-span-store-v1
  const firsts = [...document.querySelectorAll(".wjoin.lic")].filter((j) => j.__run && !j.__run.spanKey && j.__run.__els).map((j) => j.__run.__els.get(j.__run.idx[0])).filter((w) => w && w.isConnected && w.closest(".wjoin"));
  const pick = [...firsts.filter((w) => !w.closest(".wjoin").__chain).slice(0, 8), ...firsts.filter((w) => w.closest(".wjoin").__chain).slice(0, 4)];
  for (const w of pick) {
    const rc = w.__run;
    window.__pool = null;
    w.scrollIntoView({ block: "center" });
    (w.querySelector(".w span") || w.querySelector(".w")).click();
    const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector("#hud .s-pills button")) await new Promise((r) => setTimeout(r, 40));
    await new Promise((r) => setTimeout(r, 250));
    out.push({
      chain: !!w.closest(".wjoin").__chain, n: rc.idx.length, named: rc.named, keys: rc.keys,
      // the divisions row only: the block row under it holds the open division's cells
      cuts: [...((document.querySelector("#hud .s-pills") || { querySelectorAll: () => [] }).querySelectorAll("button"))].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true" })),
      active: [...rc.__els.values()].every((el) => el.classList.contains("active")),
    });
    const x = document.querySelector("#hud .head button"); if (x) x.click();
    await new Promise((r) => setTimeout(r, 150));
  }
  return out;
});
const asText = (keys, t) => t.split(" ").map((x) => x.split("-").map(Number)).map(([f, to]) => keys.slice(f, to + 1).join(" ")).join(" + ");
const spaceRuns = opened.filter((o) => !o.chain), chains = opened.filter((o) => o.chain);
// a fold is the weld with a seam letter written final: the same letters
const FINAL = { "\u05da": "\u05db", "\u05dd": "\u05de", "\u05df": "\u05e0", "\u05e3": "\u05e4", "\u05e5": "\u05e6" };
const unfinal = (t) => [...t].map((c) => FINAL[c] || c).join("");
const r4bad = spaceRuns.filter((o) => {
  const tilings = tilingsOf(o.n, o.named).sort((a, b) => a.length - b.length).map((t) => asText(o.keys, t.join(" ")));
  const named = tilings[0] && !tilings[0].includes("+") ? [tilings[0]] : [];
  // NO WELD (the owner, 2026-10-17: "drop welding ... no exceptions";
  // coversOfRun, check-run-card-forms R1): the card never offers the run's
  // words closed up; a fold a dictionary published still stands
  const weld = o.keys.join("");
  const got = o.cuts.map((c) => c.t);
  const folds = got.slice(named.length, got.length - (tilings.length - named.length));
  const want = [...named, ...folds, ...tilings.slice(named.length)];
  const foldsOk = folds.every((f) => f !== weld && unfinal(f) === unfinal(weld));
  return JSON.stringify(got) !== JSON.stringify(want) || !foldsOk || !o.cuts[o.cuts.length - 1].on || !o.active;
});
check("R4  a run's word opens one card for the whole run: as named, published folds (never welded), every tiling, words last, opened on the word as the line reads it, every word selected",
  spaceRuns.length > 0 && r4bad.length === 0,
  `${spaceRuns.length} cards opened${r4bad.length ? ` · astray: ${r4bad.slice(0, 2).map((o) => `${o.keys.join(" ")} [${o.cuts.map((c) => c.t).join(" | ")}]`).join(" ; ")}` : ""}`);
const r5bad = chains.filter((o) => {
  const got = o.cuts.map((c) => c.t);
  const words = o.keys.join(" + ");
  const named = tilingsOf(o.n, o.named).filter((t) => t.length < o.n).map((t) => asText(o.keys, t.join(" ")));
  return got[0] !== o.keys.join("\u05be") || got[got.length - 1] !== words || named.some((t) => !got.includes(t)) || !o.active;
});
check("R5  a run that is a maqaf chain keeps the chain's divisions and adds the named ones before the words",
  chains.length === 0 || r5bad.length === 0,
  chains.length ? `${chains.length} chains opened${r5bad.length ? ` · astray: ${r5bad.slice(0, 2).map((o) => o.cuts.map((c) => c.t).join(" | ")).join(" ; ")}` : ""}` : "no chain run on this book");
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
