#!/usr/bin/env node
// RUN: page
// GUARDS: stem-family-rule-v2-a-reading-of-another-stem-is-one-whose-stems-share-no-family-with-the-words
//
// THE POINTING GATE ASKS WHAT THE SOURCES SAY, AND NOTHING MORE (2026-11-06).
// Under "only this pointing", the default, two things withhold a record, and
// each is counted on the card:
//   - the pointing: a record whose source points the word otherwise; but only
//     where some record of the store points the word as the text does. Where
//     none does (a word in pause, a headword pointed in half) the grade cannot
//     tell a different form from this one, and nothing is withheld;
//   - the stem: a record whose stems are known (the corpus lane's binyan
//     ledger, version 2 of both files, v105.1) and none of them is in the
//     family of the word's stems.
//
//   G1  the page's stem families are the module's, name for name, and the
//       Hebrew stem and its Aramaic name are one family (qal and peal,
//       hiphil and haphel and aphel, piel and pael; stem-family-rule-v2)
//   G2  a verb whose key carries records of another stem: under the default
//       its card withholds exactly those records for the stem, after the
//       pointing has withheld its own, and says so on its withheld line,
//       naming the stem or stems the sidecar gives the word there
//   G3  the same card under "keep" withholds nothing for the stem
//   G4  a word no record of the store points as the text does: under the
//       default its card withholds nothing for the pointing, and has readings
//   G5  a word its place divides, whose whole form carries records of another
//       stem: with its whole-form division pressed, the card says the stem's
//       count there too (the page keeps a filtered copy of the pool on that
//       division, and until 13 November 2026 the copy dropped this count)
//
// VERSION 1 OF THE BINYAN FILES IS WITHDRAWN (the corpus lane, Moses,
// 2026-11-06). A fresh reader checked both by hand and found them not fit to
// withhold with: row stems, M46's own labels 6 wrong and 2 partly wrong of 40
// read, and M5's finding rule takes right readings off qal cards; place
// stems, 7 of 73,843 lines wrong. From then until version 2 was reviewed no
// sidecar carried stems, and G2 held the suspension: a word's card withholds
// nothing for the stem under the default (G3 under "keep" as before). That
// branch stands for any build whose sidecars carry no ledger. A sidecar that
// carries a ledger is checked as G2 always checked it, unless the ledger is
// one of the withdrawn files, which fails.
//
// The words are found in the data, never named: G2's verb in the first served
// zone, in book order, whose sidecar carries the binyan ledger and has such a
// word; G4's word and the suspension's word in the first served zone that has
// one (Amos, first in that order, has no word of G4's kind).
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { gradeRow, isPointed } from "./pointing-grade-v1.mjs";
import { STEM_FAMILY, isOtherStem } from "./stem-family-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";

const pw = await loadPlaywright();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const store = openRouteStore("data/route-store");
// the binyan files the corpus lane withdrew on 2026-11-06 (place stems v104, row stems v105)
const WITHDRAWN = new Map([
  ["1c54671b66f0207a7bcf9212cae2d6adb07a3b4a56acf3cc103cf7914a411569", "place-stems-v1.jsonl"],
  ["33d94ffb1c03a2407e7a503aaf7ac2d7ecea0a5199ed76477dff64cd526ecb36", "row-stems-v1.jsonl"],
]);
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);

// ---- the words, from the data -----------------------------------------------
const plain = (w) => w && !w.mark && w.k && typeof w.s === "string" && !w.kq && !w.s.includes("\u05BE") && isPointed(w.s);
let ledgered = 0, verb = null, unattested = null, any = null, divided = null;
const withdrawnIn = [];
for (const z of zonesServed()) {
  const p = `data/zones/${z}.lattice.bin`;
  if (!existsSync(p)) continue;
  const side = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  const hasLedger = !!(side.stems && side.binyan);
  if (hasLedger) {
    ledgered += 1;
    for (const f of side.binyan.files || []) if (WITHDRAWN.has(f.sha256)) withdrawnIn.push(`${z}: ${f.file}`);
  }
  if (unattested && any && ((verb && divided) || !hasLedger)) continue;
  const zone = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
  for (const sec of zone.sections || []) {
    const ws = (sec.words || []).filter((w) => !w.mark);
    ws.forEach((w, i) => {
      if (!plain(w) || (i > 0 && String(ws[i - 1].s || "").endsWith("\u05BE"))) return;
      const g = side.grades[w.s];
      const rows = rowsOf(w.k);
      if (!rows.length) return;
      const grades = rows.map((r) => gradeRow(r, w.s));
      const attested = grades.includes("m");
      if (!any && attested) any = { zone: z, label: sec.label, s: w.s, k: w.k };
      if (hasLedger && !verb && g && Array.isArray(g.st) && g.st.length && side.stems[w.k]) {
        const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[`${r[3]}\u0001${r[0]}\u0001${r[1]}`], g.st)).length;
        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: attested ? grades.filter((x) => x === "x").length : 0 };
      }
      // G5's word: one its place divides into pieces that spell it, whose whole form's records the stem filters
      if (hasLedger && !divided && g && Array.isArray(g.st) && g.st.length && side.stems[w.k] && Array.isArray(w.pg) && w.pg.length > 1 && w.pg.map((x) => (x && x.k) || "").join("") === w.k) {
        const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[`${r[3]}\u0001${r[0]}\u0001${r[1]}`], g.st)).length;
        if (other > 0) divided = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other };
      }
      if (!unattested && !attested && grades.includes("x") && (w.pg || []).length === 0) unattested = { zone: z, label: sec.label, s: w.s, k: w.k, x: grades.filter((x) => x === "x").length, rows: rows.length };
    });
    if (unattested && any && ((verb && divided) || !hasLedger)) break;
  }
}

// the Hebrew stem and its Aramaic name: one family each (stem-family-rule-v2)
const JOINS = [["qal", "peal"], ["qal", "peil"], ["hiphil", "haphel"], ["hiphil", "aphel"], ["piel", "pael"], ["hophal", "hephal"]];
const g1 = (r) => {
  const wrong = (r.fam || []).filter(([n, f]) => f !== (STEM_FAMILY[n] || n));
  const famOf = new Map(r.fam || []);
  const apart = JOINS.filter(([a, b]) => (famOf.get(a) || a) !== (famOf.get(b) || b));
  check("G1  the page's stem families are the module's, name for name, and each Hebrew stem shares its family with its Aramaic name", !!r.fam && wrong.length === 0 && apart.length === 0,
    r.fam ? `${r.fam.length} names${wrong.length ? ` · ${wrong.map(([n, f]) => `${n}: ${f}`).join(", ")}` : ""} · ${apart.length ? `apart: ${apart.map((x) => x.join("/")).join(", ")}` : JOINS.map((x) => x.join("/")).join(", ")}` : "the page exposes no stem families");
};

const BASE = defaultZoneUrl().replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const b = await pw.chromium.launch(launchOptions());
const open = async (w, masorah, wholeForm = false) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((m) => { try { localStorage.clear(); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); if (m) localStorage.setItem("fh.masorah", m); } catch { /* fresh reader */ } }, masorah || null);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}${BASE.includes("?") ? "&" : "?"}b=${w.zone}&at=${encodeURIComponent(w.label)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(900);
  const r = await p.evaluate(async ({ s, label, wholeForm }) => {
    const strip = (t) => String(t || "").replace(/[\u0591-\u05C7]/gu, "").trim();
    const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
    const wb = sec && [...sec.querySelectorAll(".he-text .wb")].find((x) => !x.closest(".wjoin") && strip(x.querySelector(".w")?.textContent) === strip(s));
    if (!wb) return { error: "word not on the page" };
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    const t0 = Date.now(); while (Date.now() - t0 < 15000 && !document.querySelector("#hud .r-pills button")) await new Promise((x) => setTimeout(x, 50));
    await new Promise((x) => setTimeout(x, 600));
    // the whole-form division of a word its place divides: the one button of the divisions' row that joins nothing
    if (wholeForm) {
      const whole = [...document.querySelectorAll("#hud > .rows > .b-cut .s-pills button")].find((x) => !x.textContent.includes("+"));
      if (!whole) return { error: "the card offers no whole-form division" };
      whole.click();
      const settled = () => { const read = document.querySelector("#hud > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
      const t1 = Date.now(); while (Date.now() - t1 < 15000 && !settled()) await new Promise((x) => setTimeout(x, 50));
      await new Promise((x) => setTimeout(x, 600));
    }
    const pills = document.querySelector("#hud .r-pills");
    return {
      none: (document.querySelector("#hud > .rows > .b-read > p.sources-withheld") || {}).textContent || "",
      pills: pills ? pills.querySelectorAll("button").length : 0,
      withheld: pills ? Number(pills.dataset.withheld || 0) : -1,
      stem: pills ? Number(pills.dataset.stemWithheld || 0) : -1,
      stems: pills ? String(pills.dataset.stems || "") : "",
      line: (document.querySelector("#hud .withheld-line") || {}).textContent || "",
      families: window.__stemFamily ? null : "the page exposes no stem families",
    };
  }, { s: w.s, label: w.label, wholeForm });
  const fam = await p.evaluate((names) => (window.__stemFamily ? names.map((n) => [n, window.__stemFamily(n)]) : null), [...new Set([...Object.keys(STEM_FAMILY), ...Object.values(STEM_FAMILY), "qal", "niphal", "hiphil", "hophal", "hishtaphel"])]);
  await ctx.close();
  return { ...r, fam };
};

if (withdrawnIn.length) check("G2  no sidecar carries a binyan file the corpus lane withdrew", false, withdrawnIn.slice(0, 6).join(" · "));
else if (!ledgered) {
  // the suspension: no stems anywhere, so nothing is withheld for the stem
  if (!any) check("G2  the stem withholds nothing while the binyan files are withdrawn", false, "no served word has a record pointed as the text points it");
  else {
    const r = await open(any);
    g1(r);
    check("G2  the stem withholds nothing while the binyan files are withdrawn (Moses, 2026-11-06)", !r.error && r.stem === 0 && !/of another stem/u.test(r.line),
      r.error || `no served sidecar carries stems · ${any.zone} ${any.label} ${any.k}: stem ${r.stem} · "${r.line}"`);
    const k = await open(any, "keep");
    check("G3  under \"keep\" the same card withholds nothing for the stem", !k.error && k.stem === 0 && k.withheld === 0, k.error || `stem ${k.stem} · pointing ${k.withheld} · ${k.pills} readings`);
  }
} else if (!verb) check("G2  a verb's card withholds exactly the records of another stem", false, "no word of a served zone has a record of another stem on its key");
else {
  const r = await open(verb);
  g1(r);
  // the pointing's own count also grades the overlays' records, which this
  // check does not load (check-masorah-toggle-v1 holds that count); the stem
  // is asked of the store's records only, and so is this count
  check("G2  a verb's card withholds exactly the records of another stem, after the pointing's own, and names the stem it held them to", !r.error && r.stem === verb.other && r.withheld >= verb.pointed
    && r.line.includes(`${verb.other} of another stem than ${verb.st.join(" or ")}, withheld`) && r.stems === verb.st.join("|"),
    r.error || `${verb.zone} ${verb.label} ${verb.k} (${verb.st.join(", ")}) · stem ${r.stem} of the store's ${verb.other} · pointing ${r.withheld} (the store's own ${verb.pointed}) · "${r.line}"`);
  const k = await open(verb, "keep");
  check("G3  under \"keep\" the same card withholds nothing for the stem", !k.error && k.stem === 0 && k.withheld === 0, k.error || `stem ${k.stem} · pointing ${k.withheld} · ${k.pills} readings`);
}
if (!unattested) check("G4  a word no record points as the text does withholds nothing for the pointing", false, "no placeless word of a served zone is pointed as no record of the store points it");
else {
  const u = await open(unattested);
  check("G4  a word no record points as the text does withholds nothing for the pointing, and has readings", !u.error && u.withheld === 0 && u.pills > 0,
    u.error || `${unattested.zone} ${unattested.label} ${unattested.k}: ${unattested.x} of ${unattested.rows} records point it otherwise and none as the text does · withheld ${u.withheld} · ${u.pills} readings`);
}
if (ledgered && !withdrawnIn.length) {
  if (!divided) check("G5  a divided word's whole form says what the stem withheld", false, "no served word its place divides has a record of another stem on its whole form");
  else {
    const d = await open(divided, null, true);
    // with pills left the count stands on the withheld line; with none left, in the sentence that says why
    const named = `than ${divided.st.join(" or ")}`;
    const onLine = d.stem === divided.other && d.line.includes(`${divided.other} of another stem ${named}, withheld`);
    const inWords = d.pills === 0 && d.none.includes(`${divided.other} record${divided.other === 1 ? "" : "s"} withheld by the stem`) && d.none.includes(named);
    check("G5  a divided word's whole form says what the stem withheld, on its withheld line or in the sentence that says no record is left", !d.error && (onLine || inWords),
      d.error || `${divided.zone} ${divided.label} ${divided.k} (${divided.st.join(", ")}) · the store's ${divided.other} · ${d.pills} readings · stem ${d.stem} · "${d.line || d.none}"`);
  }
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
