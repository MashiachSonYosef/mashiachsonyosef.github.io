#!/usr/bin/env node
// GUARDS: piece-class-rule-v1-a-one-letter-piece-is-asked-as-a-prefix-or-a-suffix-under-the-pointing
//
// THE POINTING STANDS FOR A PIECE TOO (the owner, 2026-11-06: the pointing
// stands, and "only this pointing" is the default). A one-letter piece at the
// head of a word is a prefix and at its end a suffix, and with one letter the
// two are different words: the conjunction and the suffix "him" are both a
// vav. Before this rule a prefix vav's card opened on Strong's entries filed
// under the bare letter and on MACULA's "him" (the owner's screenshot of
// 2 Kings 2:1, word 10, "and + Elisha").
//
//   C1  the page's classes are the rule's: vav with holam a suffix; with
//       shewa, hiriq, segol, patah or qamats a prefix; with dagesh alone
//       either; he with mappiq a suffix; with patah, hataf patah or segol a
//       prefix; with qamats either; no vowel, or another letter, says nothing
//   C2  a prefix vav's card, under the default, withholds exactly the store
//       rows whose pointed headwords make the letter only a suffix, and its
//       first pill is carried by a row pointed as a prefix
//   C3  a suffix vav's card withholds exactly the rows pointed only as a
//       prefix, and its first pill is carried by a row pointed as a suffix
//   C4  under "keep" the same prefix card withholds nothing for the pointing
//
// The words are found in the data, never named: the first served zone whose
// piece store divides a word into a one-letter vav at its head, and the
// first that divides one at its end. SKIPS by name when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { vowelForm, isPointed } from "./pointing-grade-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";

const pw = await loadPlaywright();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const VAV = "\u05D5";
// the rule's classes, written here a second time from its words
const marksOf = (v, letter) => (v.replace(/[\u05B0-\u05BC\u05C1\u05C2]/gu, "") === letter ? v.replace(/[^\u05B0-\u05BC\u05C1\u05C2]/gu, "") : null);
const classOfVav = (v) => {
  const m = marksOf(v, VAV);
  if (m === null) return null;
  if (/[\u05B9\u05BA]/u.test(m)) return "suffix";
  if (/[\u05B0-\u05B8]/u.test(m)) return "prefix";
  if (/\u05BC/u.test(m)) return "either";
  return null;
};
const kindOf = (row, at) => {
  if (!Array.isArray(row) || !Array.isArray(row[6])) return "silent";
  const ks = row[6].filter(isPointed).map((h) => classOfVav(vowelForm(h)));
  if (!ks.length || ks.some((k) => k === null)) return "silent";
  if (ks.includes(at)) return "this";
  if (ks.includes("either")) return "silent";
  return "other";
};

// ---- the words, from the data ----------------------------------------------
const store = openRouteStore("data/route-store");
const vavRows = store.routesFor(VAV) || [];
const found = { prefix: null, suffix: null };
for (const slug of zonesServed()) {
  if (found.prefix && found.suffix) break;
  const pf = `data/piece-store/${slug}.json`, zf = `data/zones/${slug}.bin`;
  if (!existsSync(pf) || !existsSync(zf)) continue;
  const places = JSON.parse(readFileSync(pf, "utf8")).places || {};
  const z = JSON.parse(gunzipSync(readFileSync(zf)).toString("utf8"));
  for (const sec of z.sections || []) {
    const [c, v] = String(sec.label || "").split(":");
    if (!v) continue;
    // the piece store numbers a verse's words with its marks not counted, as
    // the page does (openSite): a paseq before a word moved every place after
    // it by one, so the example could be read off another word's pieces
    let n = 0;
    (sec.words || []).forEach((w, i) => {
      if (w.mark) return;
      n += 1;
      if (!w.k || w.k.length < 3 || w.s.includes("\u05BE") || String((sec.words[i - 1] || {}).s || "").endsWith("\u05BE")) return;
      const pcs = places[`${c}:${v}:${n}`];
      if (!Array.isArray(pcs)) return;
      for (const pc of pcs) {
        const a = pc[4], b = pc[5];
        if (pc[2] !== "DIVISION" || a !== b || !Number.isInteger(a) || w.k[a] !== VAV) continue;
        const at = a === 0 ? "prefix" : b === w.k.length - 1 ? "suffix" : null;
        if (at && !found[at]) found[at] = { slug, label: sec.label, s: w.s, k: w.k, at };
      }
    });
    if (found.prefix && found.suffix) break;
  }
}
if (!found.prefix && !found.suffix) { console.log("SKIPPED — no served zone divides a word into a one-letter vav, so check-piece-class-v1 has nothing to open"); process.exit(3); }

const BASE = defaultZoneUrl().replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const b = await pw.chromium.launch(launchOptions());

const openPiece = async (w, masorah) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((m) => { try { localStorage.clear(); if (m) { localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", m); } } catch { /* fresh reader */ } }, masorah || null);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}${BASE.includes("?") ? "&" : "?"}b=${w.slug}&at=${encodeURIComponent(w.label)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(900);
  const r = await p.evaluate(async ({ s, piece }) => {
    const MARKS = new RegExp("[\\u0591-\\u05C7]", "g");
    const strip = (t) => String(t || "").replace(MARKS, "").trim();
    const wb = [...document.querySelectorAll("section.seg .he-text .wb")].find((x) => !x.closest(".wjoin") && strip(x.querySelector(".w")?.textContent) === strip(s));
    if (!wb) return { error: "word not on the page" };
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    const wait = async (f) => { const t0 = Date.now(); while (Date.now() - t0 < 12000 && !f()) await new Promise((x) => setTimeout(x, 50)); };
    // the card draws its block row again once the word's own pool is in:
    // a press before that lands on a row about to be replaced
    await wait(() => document.querySelector("#hud .r-pills button"));
    await new Promise((x) => setTimeout(x, 700));
    const btn = [...document.querySelectorAll("#hud button")].find((x) => !x.closest(".r-pills") && x.textContent.trim() === piece);
    if (!btn) return { error: "no block for the letter on the card" };
    btn.click();
    await wait(() => [...document.querySelectorAll("#hud .he-q")].some((q) => q.textContent.trim() === piece) && document.querySelector("#hud .r-pills button"));
    await new Promise((x) => setTimeout(x, 300));
    const pills = document.querySelector("#hud .r-pills");
    return {
      pills: pills ? [...pills.querySelectorAll("button")].map((x) => x.textContent.trim()) : [],
      withheld: pills ? Number(pills.dataset.withheld || 0) : -1,
      classes: window.__pieceClass ? Object.keys(window.__pieceClass) : null,
    };
  }, { s: w.s, piece: VAV });
  const classes = await p.evaluate(() => {
    const P = window.__pieceClass; if (!P) return null;
    const V = "\u05D5", H = "\u05D4";
    const cases = [[V, "\u05B9", "suffix"], [V, "\u05B0", "prefix"], [V, "\u05B4", "prefix"], [V, "\u05B6", "prefix"], [V, "\u05B7", "prefix"], [V, "\u05B8", "prefix"], [V, "\u05BC", "either"], [V, "", null],
      [H, "\u05BC", "suffix"], [H, "\u05B7", "prefix"], [H, "\u05B2", "prefix"], [H, "\u05B6", "prefix"], [H, "\u05B8", "either"], [H, "", null]];
    const wrong = cases.filter(([l, m, want]) => P[l](l + m) !== want).map(([l, m, want]) => `${l}${m}: ${P[l](l + m)} not ${want}`);
    const other = P[V]("\u05D1\u05B8") === null && P[V](V + V) === null;
    return { n: cases.length, wrong, other };
  });
  await ctx.close();
  return { ...r, classCheck: classes };
};

const expectWithheld = (at) => vavRows.filter((row) => kindOf(row, at) === "other").length;
const carriedBy = (pill, at) => vavRows.some((row) => kindOf(row, at) === "this" && String(row[1]).toLowerCase().split(/[;,]/u).map((x) => x.trim()).concat(String(row[1]).toLowerCase().trim()).includes(String(pill).toLowerCase()));

let c1done = false;
for (const at of ["prefix", "suffix"]) {
  const w = found[at];
  if (!w) { check(`${at === "prefix" ? "C2" : "C3"}  a ${at} vav's card`, false, `no served zone divides a word into a ${at} vav`); continue; }
  const r = await openPiece(w);
  if (!c1done && r.classCheck) {
    c1done = true;
    check("C1  the page's classes are the rule's", r.classCheck.wrong.length === 0 && r.classCheck.other, `${r.classCheck.n} cases${r.classCheck.wrong.length ? ` · ${r.classCheck.wrong.join(" | ")}` : ""}${r.classCheck.other ? "" : " · another letter was classed"}`);
  }
  if (r.error) { check(`${at === "prefix" ? "C2" : "C3"}  a ${at} vav's card`, false, `${w.slug} ${w.label} ${w.k}: ${r.error}`); continue; }
  const want = expectWithheld(at);
  const first = r.pills[0];
  check(`${at === "prefix" ? "C2" : "C3"}  a ${at} vav's card withholds exactly the rows pointed only as the other kind, and opens on its own kind`,
    r.withheld === want && want > 0 && !!first && carriedBy(first, at),
    `${w.slug} ${w.label} ${w.k} · withheld ${r.withheld}, the store's rows of the other kind ${want} · first pill "${first}"`);
  if (at === "prefix") {
    const k = await openPiece(w, "keep");
    check("C4  under \"keep\" the same card withholds nothing for the pointing", !k.error && k.withheld === 0, k.error || `withheld ${k.withheld} · ${k.pills.length} readings`);
  }
}
if (!c1done) check("C1  the page's classes are the rule's", false, "the page exposes no window.__pieceClass");

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
