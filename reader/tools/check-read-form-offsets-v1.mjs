#!/usr/bin/env node
// RUN: page
// GUARDS: read-form-offsets-rule-v1-a-read-forms-piece-without-letters-takes-the-lanes-alignment-or-none
//
// THE READ FORM'S PIECES ANSWER THEIR OWN BLOCKS (the corpus lane's v108,
// 6 November 2026). At a ketiv/qere place the piece store leaves some piece
// of the read form without letters, and a claim with no letters answers no
// cell. The lane aligned them; the card reads that alignment where the store
// gives none (data/read-form-offsets-v1.json).
//
//   R1  the served file holds only groups that tile their side: the pieces'
//       letter runs follow one another from 0 to the side's last letter, the
//       side's letters are the zone's own read (or written) side at that
//       place, and the pieces' own letters, joined, are that side
//   R2  where the store gives a piece letters, the file gives the same (the
//       store's stand, and the file never contradicts them)
//   R3  on the page, a read form's block whose piece the store left without
//       letters offers that piece's own reading at the place, and the page
//       says it placed the claim by the lane's alignment
//       (window.__readFormPlaced: the claims it placed so)
//
// The word is found in the data, never named: the first served place, in
// book order, whose read form the card divides into blocks one of which is
// such a piece, and whose piece reads what no store row on the block's
// letters reads (so that only the piece can put it on the card). SKIPS by
// name when there is none.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { openRouteStore, readingKey } from "./gloss-store-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const FILE = "data/read-form-offsets-v1.json";
if (!existsSync(FILE)) { console.log(`SKIPPED — no ${FILE}, so check-read-form-offsets-v1 has nothing to hold`); process.exit(3); }
const rf = JSON.parse(readFileSync(FILE, "utf8"));
const letters = (t) => [...String(t || "").normalize("NFKD")].filter((c) => c >= "\u05D0" && c <= "\u05EA").join("");

// ---- R1, R2: the file against the zones and the piece store ----------------
let groups = 0, sideOff = 0, tileOff = 0, joinOff = 0, held = 0, heldOff = 0;
const offEx = [];
let found = null;
const store = openRouteStore("data/route-store");
const storeSays = (key) => new Set(store.readingPool((store.routesFor(key) || []).filter((r) => store.index.m_sources[r[3]]), "oldest").map((g) => readingKey(g.text)));
for (const book of zonesServed()) {
  const byPlace = (rf.books || {})[book];
  const pf = `data/piece-store/${book}.json`, zf = `data/zones/${book}.bin`;
  if (!byPlace || !existsSync(pf) || !existsSync(zf)) continue;
  const pb = JSON.parse(readFileSync(pf, "utf8"));
  const zone = JSON.parse(gunzipSync(readFileSync(zf)).toString("utf8"));
  // the zone's own sides at each place: a side of two words is its words joined
  const sides = new Map(), words = new Map();
  for (const sec of zone.sections || []) {
    let n = 0;
    for (const w of sec.words || []) {
      if (w.mark) continue;
      n += 1;
      const place = `${sec.label}:${n}`;
      words.set(place, w);
      for (const br of w.w || []) {
        const role = String(br.role || "").toLowerCase();
        if (role === "qere" || role === "ketiv") sides.set(`${place}|${role}`, (sides.get(`${place}|${role}`) || "") + letters(br.k || br.s));
      }
    }
  }
  for (const [place, bySrc] of Object.entries(byPlace)) {
    for (const [sr, pieces] of Object.entries(bySrc)) {
      groups += 1;
      const [src, rd] = sr.split("|");
      const side = sides.get(`${place}|${rd}`);
      if (!side) { sideOff += 1; if (offEx.length < 3) offEx.push(`${book} ${place} ${sr}: no ${rd} side on the page`); continue; }
      const tiles = pieces.every((p, i) => p[1] === (i ? pieces[i - 1][2] + 1 : 0) && p[2] >= p[1]) && pieces[pieces.length - 1][2] === side.length - 1;
      if (!tiles) { tileOff += 1; if (offEx.length < 3) offEx.push(`${book} ${place} ${sr}: pieces do not tile ${side}`); continue; }
      const claims = (pb.places[place] || []).filter((c) => c[1] === src && c[3] === rd && c[2] === "DIVISION").sort((x, y) => x[0] - y[0]);
      // each piece's own letters, from its record: a MACULA record is the
      // piece; a TAHOT record is the whole word, its parts at "/", its marks
      // after a backslash
      const own = src === "tahot"
        ? String((pb.records[(claims[0] || [])[7]] || [])[1] || "").split("\\")[0].split("/").map(letters)
        : claims.map((c) => letters((pb.records[c[7]] || [])[1]));
      if (own.join("") !== side || own.length !== pieces.length) { joinOff += 1; if (offEx.length < 3) offEx.push(`${book} ${place} ${sr}: the pieces spell ${own.join("+")}, the side ${side}`); continue; }
      for (const c of claims) {
        const p = pieces.find((x) => x[0] === c[0]);
        if (c[4] !== null && c[5] !== null) { held += 1; if (!p || p[1] !== c[4] || p[2] !== c[5]) heldOff += 1; continue; }
        // a candidate for R3: the store left it without letters, the file
        // places it, it carries its own reading, and the card divides the read
        // form into blocks one of which is exactly this piece
        if (found || !p || !c[6] || c[9] || rd !== "qere") continue;
        const w = words.get(place);
        const pg = w && Array.isArray(w.pg) ? w.pg : [];
        if (pg.map((x) => letters(x.k)).join("") !== side) continue;
        let at = 0; const blocks = pg.map((x) => { const k = letters(x.k); const b = [at, at + k.length - 1, k]; at += k.length; return b; });
        const block = blocks.find((b) => b[0] === p[1] && b[1] === p[2]);
        if (block && blocks.length > 1 && !storeSays(block[2]).has(readingKey(c[6]))) found = { book, place, label: place.split(":").slice(0, 2).join(":"), n: Number(place.split(":")[2]), block: block[2], reading: String(c[6]).trim(), src };
      }
    }
  }
}
check("R1  every group in the file tiles its side, the zone's own side at that place, and its pieces spell it",
  groups > 0 && !sideOff && !tileOff && !joinOff,
  `${groups} groups${sideOff ? ` · ${sideOff} with no such side on the page` : ""}${tileOff ? ` · ${tileOff} that do not tile` : ""}${joinOff ? ` · ${joinOff} whose pieces spell another side` : ""}${offEx.length ? ` · ${offEx.join(" | ")}` : ""}`);
check("R2  where the store gives a piece letters, the file gives the same", heldOff === 0, `${held} pieces with the store's own letters · ${heldOff} differ`);

// ---- R3: the page ------------------------------------------------------------
if (!found) { console.log("  --  R3 skipped: no served read form has a block that only the file places"); console.log(bad ? `\n${bad} FAILED` : "\nall checks passed"); process.exit(bad ? 1 : 0); }
const pw = await loadPlaywright();
const BASE = defaultZoneUrl().replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* a fresh reader */ } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}${BASE.includes("?") ? "&" : "?"}b=${found.book}&at=${encodeURIComponent(found.label)}`, { waitUntil: "networkidle", timeout: 90000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.waitForTimeout(900);
const r = await p.evaluate(async ({ label, n, block }) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
  const wb = sec ? [...sec.querySelectorAll(".he-text .wb")][n - 1] : null;
  if (!wb) return { error: "word not on the page" };
  // the read half opens the card on the read form
  const halves = [...wb.querySelectorAll(".wr")];
  (halves.find((h) => /^qere/u.test(h.title || "")) || halves[halves.length - 1] || wb).click();
  const wait = async (f) => { const t0 = Date.now(); while (Date.now() - t0 < 15000 && !f()) await new Promise((x) => setTimeout(x, 50)); };
  await wait(() => [...document.querySelectorAll("#hud button")].some((x) => x.textContent.trim() === block && !x.closest(".r-pills")));
  await new Promise((x) => setTimeout(x, 700));
  const btn = [...document.querySelectorAll("#hud button")].find((x) => x.textContent.trim() === block && !x.closest(".r-pills"));
  if (!btn) return { error: `the card offers no block ${block}` };
  btn.click();
  await wait(() => document.querySelector("#hud .r-pills button"));
  await new Promise((x) => setTimeout(x, 1500));
  return { pills: [...document.querySelectorAll("#hud .r-pills button")].map((x) => x.textContent.trim()), placed: window.__readFormPlaced || 0 };
}, found);
await b.close();
check("R3  a read form's block that only the file places offers its piece's own reading at the place",
  !r.error && r.pills.includes(found.reading) && r.placed > 0,
  r.error ? `${found.book} ${found.place} ${found.block}: ${r.error}` : `${found.book} ${found.place}, block ${found.block}: ${found.src}'s "${found.reading}" ${r.pills.includes(found.reading) ? "among" : "not among"} ${r.pills.length} readings · ${r.placed} claim${r.placed === 1 ? "" : "s"} placed by the lane's alignment`);
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
