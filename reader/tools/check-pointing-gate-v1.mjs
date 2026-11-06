#!/usr/bin/env node
// GUARDS: stem-family-rule-v1-a-reading-of-another-stem-is-one-whose-stems-share-no-family-with-the-words
//
// THE POINTING GATE ASKS WHAT THE SOURCES SAY, AND NOTHING MORE (2026-11-06).
// Under "only this pointing", the default, two things withhold a record, and
// each is counted on the card:
//   - the pointing: a record whose source points the word otherwise; but only
//     where some record of the store points the word as the text does. Where
//     none does (a word in pause, a headword pointed in half) the grade cannot
//     tell a different form from this one, and nothing is withheld;
//   - the stem: a record whose stems are known (the corpus lane's binyan
//     ledger, v104 and v105) and none of them is in the family of the word's
//     stems.
//
//   G1  the page's stem families are the module's, name for name
//   G2  a verb whose key carries records of another stem: under the default
//       its card withholds exactly those records for the stem, after the
//       pointing has withheld its own, and says so on its withheld line
//   G3  the same card under "keep" withholds nothing for the stem
//   G4  a word no record of the store points as the text does: under the
//       default its card withholds nothing for the pointing, and has readings
//
// The words are found in the data, never named: each in the first served
// zone, in book order, whose sidecar carries the binyan ledger and has such a
// word (Amos, first in that order, has no word of G4's kind). SKIPS by name
// when no served zone's sidecar carries the ledger.
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
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);

// ---- the words, from the data -----------------------------------------------
const plain = (w) => w && !w.mark && w.k && typeof w.s === "string" && !w.kq && !w.s.includes("\u05BE") && isPointed(w.s);
let ledgered = 0, verb = null, unattested = null;
for (const z of zonesServed()) {
  if (verb && unattested) break;
  const p = `data/zones/${z}.lattice.bin`;
  if (!existsSync(p)) continue;
  const side = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  if (!side.stems || !side.binyan) continue;
  ledgered += 1;
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
      if (!verb && g && Array.isArray(g.st) && g.st.length && side.stems[w.k]) {
        const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[`${r[3]}\u0001${r[0]}\u0001${r[1]}`], g.st)).length;
        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: attested ? grades.filter((x) => x === "x").length : 0 };
      }
      if (!unattested && !attested && grades.includes("x") && (w.pg || []).length === 0) unattested = { zone: z, label: sec.label, s: w.s, k: w.k, x: grades.filter((x) => x === "x").length, rows: rows.length };
    });
    if (verb && unattested) break;
  }
}
if (!ledgered) { console.log("SKIPPED — no served zone's sidecar carries the binyan ledger, so check-pointing-gate-v1 has nothing to open"); process.exit(3); }

const BASE = defaultZoneUrl().replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const b = await pw.chromium.launch(launchOptions());
const open = async (w, masorah) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((m) => { try { localStorage.clear(); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); if (m) localStorage.setItem("fh.masorah", m); } catch { /* fresh reader */ } }, masorah || null);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}${BASE.includes("?") ? "&" : "?"}b=${w.zone}&at=${encodeURIComponent(w.label)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(900);
  const r = await p.evaluate(async ({ s, label }) => {
    const strip = (t) => String(t || "").replace(/[\u0591-\u05C7]/gu, "").trim();
    const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
    const wb = sec && [...sec.querySelectorAll(".he-text .wb")].find((x) => !x.closest(".wjoin") && strip(x.querySelector(".w")?.textContent) === strip(s));
    if (!wb) return { error: "word not on the page" };
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    const t0 = Date.now(); while (Date.now() - t0 < 15000 && !document.querySelector("#hud .r-pills button")) await new Promise((x) => setTimeout(x, 50));
    await new Promise((x) => setTimeout(x, 600));
    const pills = document.querySelector("#hud .r-pills");
    return {
      pills: pills ? pills.querySelectorAll("button").length : 0,
      withheld: pills ? Number(pills.dataset.withheld || 0) : -1,
      stem: pills ? Number(pills.dataset.stemWithheld || 0) : -1,
      line: (document.querySelector("#hud .withheld-line") || {}).textContent || "",
      families: window.__stemFamily ? null : "the page exposes no stem families",
    };
  }, { s: w.s, label: w.label });
  const fam = await p.evaluate((names) => (window.__stemFamily ? names.map((n) => [n, window.__stemFamily(n)]) : null), [...new Set([...Object.keys(STEM_FAMILY), ...Object.values(STEM_FAMILY), "qal", "niphal", "hiphil", "hophal", "hishtaphel"])]);
  await ctx.close();
  return { ...r, fam };
};

if (!verb) check("G2  a verb's card withholds exactly the records of another stem", false, "no word of a served zone has a record of another stem on its key");
else {
  const r = await open(verb);
  const wrong = (r.fam || []).filter(([n, f]) => f !== (STEM_FAMILY[n] || n));
  check("G1  the page's stem families are the module's, name for name", !!r.fam && wrong.length === 0, r.fam ? `${r.fam.length} names${wrong.length ? ` · ${wrong.map(([n, f]) => `${n}: ${f}`).join(", ")}` : ""}` : "the page exposes no stem families");
  // the pointing's own count also grades the overlays' records, which this
  // check does not load (check-masorah-toggle-v1 holds that count); the stem
  // is asked of the store's records only, and so is this count
  check("G2  a verb's card withholds exactly the records of another stem, after the pointing's own", !r.error && r.stem === verb.other && r.withheld >= verb.pointed && /of another stem, withheld/u.test(r.line),
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
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
