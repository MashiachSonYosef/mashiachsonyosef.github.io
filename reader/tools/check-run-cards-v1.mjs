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
//       cards and without them
//   R4  pressing a run's word opens one card for the whole run: its divisions
//       are the run as named, the run welded into one word, a fold only where
//       a dictionary published one, then every other tiling of its words by
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

// the whole book built, so every card's words exist on the page
const load = async (withRuns) => {
  await p.unroute("**/data/run-cards/**").catch(() => {});
  if (!withRuns) await p.route("**/data/run-cards/**", (r) => r.fulfill({ status: 404, body: "" }));
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // every section built, as the page builds one when the reader comes near
  // (its body waits on the section as __body); a fast scroll can pass one by
  await p.evaluate(() => { for (const el of document.querySelectorAll("section.seg")) if (el.__body) { const f = el.__body; el.__body = null; f(); } });
  await p.waitForTimeout(500);
  return p.evaluate(() => ({
    lines: [...document.querySelectorAll(".wb > .g, .wjoin > .g")].map((g) => g.textContent),
    ink: [...document.querySelectorAll("section.seg .he-text")].map((h) => { const c = h.cloneNode(true); c.querySelectorAll(".g").forEach((x) => x.remove()); return c.textContent; }).join("\n"),
    cards: window.__runCards || 0,
    marked: document.querySelectorAll(".wb.wrun").length,
  }));
};
const without = await load(false);
const withR = await load(true);
const wantWords = new Set(bookCards[BOOK].flatMap((c) => c.idx.map((i) => `${c.unit}:${i}`))).size;
check("R2  the page draws every card of its book and marks its words", withR.cards === bookCards[BOOK].length && withR.marked === wantWords && without.marked === 0,
  `${BOOK}: ${withR.cards} of ${bookCards[BOOK].length} cards · ${withR.marked} of ${wantWords} words marked · ${without.marked} marked without the file`);
const diff = withR.lines.filter((t, i) => t !== without.lines[i]).length;
check("R3  the line under every word and the Hebrew are the same with run cards and without", diff === 0 && withR.lines.length === without.lines.length && withR.ink === without.ink,
  `${withR.lines.length} lines · ${diff} differ · Hebrew ${withR.ink === without.ink ? "identical" : "CHANGED"}`);

// R4 and R5: open cards, the space runs and the chains apart
const opened = await p.evaluate(async () => {
  const out = [];
  const firsts = [...document.querySelectorAll(".wb.wrun-first")].filter((w) => w.__run);
  const pick = [...firsts.filter((w) => !w.closest(".wjoin")).slice(0, 8), ...firsts.filter((w) => w.closest(".wjoin")).slice(0, 4)];
  for (const w of pick) {
    const rc = w.__run;
    window.__pool = null;
    w.scrollIntoView({ block: "center" });
    (w.querySelector(".w span") || w.querySelector(".w")).click();
    const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector("#hud .s-pills button")) await new Promise((r) => setTimeout(r, 40));
    await new Promise((r) => setTimeout(r, 250));
    out.push({
      chain: !!w.closest(".wjoin"), n: rc.idx.length, named: rc.named, keys: rc.keys,
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
  const weld = o.keys.join("");
  const got = o.cuts.map((c) => c.t);
  const folds = got.slice(named.length + 1, got.length - (tilings.length - named.length));
  const want = [...named, weld, ...folds, ...tilings.slice(named.length)];
  const foldsOk = folds.every((f) => f !== weld && unfinal(f) === unfinal(weld));
  return JSON.stringify(got) !== JSON.stringify(want) || !foldsOk || !o.cuts[o.cuts.length - 1].on || !o.active;
});
check("R4  a run's word opens one card for the whole run: as named, welded, published folds, every tiling, words last, opened on the word as the line reads it, every word selected",
  spaceRuns.length > 0 && r4bad.length === 0,
  `${spaceRuns.length} cards opened${r4bad.length ? ` · astray: ${r4bad.slice(0, 2).map((o) => `${o.keys.join(" ")} [${o.cuts.map((c) => c.t).join(" | ")}]`).join(" ; ")}` : ""}`);
const r5bad = chains.filter((o) => {
  const got = o.cuts.map((c) => c.t);
  const words = o.keys.join(" + ");
  const named = tilingsOf(o.n, o.named).filter((t) => t.length < o.n).map((t) => asText(o.keys, t.join(" ")));
  return got[0] !== o.keys.join("־") || got[got.length - 1] !== words || named.some((t) => !got.includes(t)) || !o.active;
});
check("R5  a run that is a maqaf chain keeps the chain's divisions and adds the named ones before the words",
  chains.length === 0 || r5bad.length === 0,
  chains.length ? `${chains.length} chains opened${r5bad.length ? ` · astray: ${r5bad.slice(0, 2).map((o) => o.cuts.map((c) => c.t).join(" | ")).join(" ; ")}` : ""}` : "no chain run on this book");
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
