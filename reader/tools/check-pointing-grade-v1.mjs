#!/usr/bin/env node
// GUARDS: pointing-grade-rule-v1-a-row-is-graded-by-its-own-headwords-against-the-open-word
//
// THE GRADE FROM THE ROW'S OWN HEADWORDS, HELD.
//
// The card grades a store row against the word standing open by the row's
// own pointed headwords ([6]) when it carries them, and by the lattice card's
// grade when it does not. One definition, two copies (the module and the
// page), one recount, and the card pressed:
//
//   P1  the page's vowelForm, isPointed, rowCarriesHeadwords and gradeRow are
//       the module's, to the character
//   P2  the module grades as the rule says: a pointed headword equal to the
//       word is a match; a pointed headword that differs is a mismatch; no
//       pointed headword is silence; no slot is ungraded; two headwords with
//       one matching is a match (any of, never the first); U+034F and the
//       cantillation never decide
//   P3  every served lattice sidecar was projected under this rule, so the
//       baked leaders rest on the same grade the card computes
//   P4  the recount record (data/pointing-grade-recount-v1.json) was written
//       against the store on disk, and one book recounted here lands on its
//       numbers to the unit
//   P5  in the browser: every pill carries its grade; under "only" no pill
//       graded x survives, and what the card says it withheld is what this
//       check counts from the shard with the same two steps
//
// SKIPS by name when no served zone carries the lattice layer.
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { vowelForm, isPointed, rowCarriesHeadwords, gradeRow, POINTING_GRADE_RULE_ID } from "./pointing-grade-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { fnv1a } from "./lattice-lib-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { recountBook } from "./emit-pointing-grade-recount-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const cp = (...xs) => String.fromCodePoint(...xs);

// P1 — the two copies, to the character (leading indentation aside)
const body = (src, name) => { const m = src.match(new RegExp(`const ${name} = [\\s\\S]*?;\\n`, "u")); return m ? m[0].replace(/^[ \t]+/gmu, "") : null; };
const page = readFileSync("zone.html", "utf8"), mod = readFileSync("tools/pointing-grade-v1.mjs", "utf8");
const names = ["vowelForm", "isPointed", "rowCarriesHeadwords", "gradeRow"];
const differ = names.filter((n) => !body(page, n) || body(page, n) !== body(mod, n).replace(/^export /u, ""));
check("P1  the page's copy of the grade is the module's, to the character", differ.length === 0, differ.length ? `differ: ${differ.join(", ")}` : `${names.join(", ")}`);

// P2 — the rule on fixtures: dalet-bet-resh under three pointings
const DAVAR = cp(0x05d3, 0x05b8, 0x05d1, 0x05b8, 0x05e8), DIBBER = cp(0x05d3, 0x05b4, 0x05d1, 0x05bc, 0x05b5, 0x05e8), BARE = cp(0x05d3, 0x05d1, 0x05e8);
const DAVAR_ACCENTED = cp(0x05d3, 0x05b8, 0x05d1, 0x05b8, 0x0597, 0x05e8), DAVAR_CGJ = cp(0x05d3, 0x05b8, 0x034f, 0x05d1, 0x05b8, 0x05e8);
const row = (hw) => [1, "word", "a word", "M1", "1906", null, hw];
const p2 = [
  ["pointed and equal is a match", gradeRow(row([DAVAR]), DAVAR) === "m"],
  ["pointed and other is a mismatch", gradeRow(row([DIBBER]), DAVAR) === "x"],
  ["no pointed headword is silence", gradeRow(row([BARE]), DAVAR) === "n" && gradeRow(row([]), DAVAR) === "n"],
  ["no slot is ungraded", gradeRow([1, "word", "a word", "M1", "1906"], DAVAR) === "-" && gradeRow([1, "word", "a word", "M1", "1906", null], DAVAR) === "-"],
  ["any one matching headword among several is a match", gradeRow(row([DIBBER, DAVAR]), DAVAR) === "m" && gradeRow(row([BARE, DIBBER]), DAVAR) === "x"],
  ["cantillation and U+034F never decide", gradeRow(row([DAVAR_ACCENTED]), DAVAR) === "m" && gradeRow(row([DAVAR]), DAVAR_CGJ) === "m" && vowelForm(DAVAR_ACCENTED) === vowelForm(DAVAR)],
  ["pointed means a vowel point after NFKD", isPointed(DAVAR) && !isPointed(BARE) && isPointed(DAVAR.normalize("NFC"))],
  ["a bare page word can never match a pointed headword", gradeRow(row([DAVAR]), BARE) === "x"],
];
check("P2  the module grades as the rule says", p2.every((x) => x[1]), p2.filter((x) => !x[1]).map((x) => x[0]).join("; ") || `${p2.length} cases`);

// P3 — every served sidecar under this rule
const served = zonesServed().filter((z) => existsSync(`data/zones/${z}.lattice.bin`));
if (!served.length) { console.log("SKIPPED — no served zone carries a lattice sidecar; nothing here to hold"); process.exit(3); }
const notUnder = served.filter((z) => { const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.lattice.bin`)).toString("utf8")); return !(s.first_under && s.first_under.row_grade && s.first_under.row_grade.rule === POINTING_GRADE_RULE_ID); });
check("P3  every served lattice sidecar was projected under this rule", notUnder.length === 0, notUnder.length ? `${notUnder.length} not: ${notUnder.slice(0, 5).join(", ")}` : `${served.length} sidecars`);

// P4 — the recount record, and one book recounted here
const store = openRouteStore("data/route-store");
const REC = "data/pointing-grade-recount-v1.json";
const rec = existsSync(REC) ? JSON.parse(readFileSync(REC, "utf8")) : null;
const v2 = store.index.schema_version === "ROUTE_STORE_V2";
if (!rec) check("P4  the recount record stands beside the store", false, `${REC} missing — node tools/emit-pointing-grade-recount-v1.mjs`);
else {
  const book = served.includes("amos") ? "amos" : served[0];
  const here = recountBook(store, book);
  const there = rec.books[book] || {};
  const same = ["surface_slots", "surface_differ", "entry_slots", "entry_differ", "rows_without_headwords"].every((k) => here[k] === there[k]);
  const sums = ["surface_slots", "surface_differ", "entry_slots", "entry_differ"].every((k) => Object.values(rec.books).reduce((a, b) => a + (b[k] || 0), 0) === rec.totals[k]);
  check("P4  the recount record is against the store on disk, its totals are its books' sums, and one book recounted here lands on it to the unit",
    rec.store_version === store.index.store_version && rec.rule === POINTING_GRADE_RULE_ID && same && sums,
    `${book}: here ${here.surface_differ}/${here.surface_slots} on surfaces, ${here.entry_differ}/${here.entry_slots} on entries · record ${there.surface_differ}/${there.surface_slots}, ${there.entry_differ}/${there.entry_slots} · store ${store.index.store_version}${rec.store_version === store.index.store_version ? "" : " ≠ record " + rec.store_version}`);
}

// P5 — the card, pressed
const { loadPlaywright, launchOptions } = await import("./playwright-v1.mjs");
const pw = await loadPlaywright();
const ZONE = served.find((z) => { const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")); return !!(s.emitted_from && s.emitted_from.toggles && s.emitted_from.toggles.lattice); });
if (!ZONE) { console.log("SKIPPED — no served zone carries the lattice layer, so the card cannot be pressed under only"); process.exit(bad ? 1 : 3); }
const side = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.lattice.bin`)).toString("utf8"));
const BASE = defaultZoneUrl().split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
console.log(`— ${ZONE} · store ${store.index.schema_version} ${store.index.store_version} —`);
// the same two steps as the page, in node: the row's own headwords, else the lattice card
const expectFor = (s) => {
  const gr = side.grades[s]; const lat = gr && side.routes[gr.k]; const rows = gr ? (store.routesFor(gr.k) || []) : [];
  const fp = lat ? new Map(lat.f.map((f, i) => [f, i])) : null;
  const grades = rows.filter((r) => store.index.m_sources[r[3]]).map((r) => { const sg = gradeRow(r, s); if (sg !== "-") return sg; if (!fp) return "-"; const src = store.index.m_sources[r[3]]; const i = fp.get(fnv1a(`${r[1]}|${src.label}`)); return i === undefined ? "-" : (gr.g[i] || "-"); });
  return { rows: rows.length, x: grades.filter((g) => g === "x").length, fromHeadwords: rows.filter(rowCarriesHeadwords).length };
};
const target = await p.evaluate((grades) => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
  for (let i = 0; i < Math.min(wbs.length, 80); i += 1) {
    const g = wbs[i].querySelector(".g"); if (!g || g.classList.contains("bare")) continue;
    const s = wbs[i].querySelector(".w").textContent.trim();
    if (s.includes(String.fromCodePoint(0x05be)) || wbs[i].querySelectorAll(".wr").length > 1) continue;
    const gr = grades[s]; if (!gr || !gr.g.includes("x")) continue;
    return { i, s };
  }
  return null;
}, side.grades);
check("  a word with a reading and a mismatch card stands on the page", !!target, target ? `word ${target.i + 1} · ${target.s}` : "");
const cardNow = () => p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  const pills = h.querySelector(".r-pills"); if (!pills) return null;
  return { grades: [...pills.querySelectorAll("button")].map((x) => x.dataset.grade || ""), withheld: Number(pills.dataset.withheld || 0), rows: Number(pills.dataset.rows || 0) };
});
const press = async (pos) => {
  await p.evaluate(() => { const r = document.getElementById("rail"); if (r && !r.open) r.open = true; });
  const ok = await p.evaluate((pos) => { const row = document.querySelector('.rail .row[data-toggle="masorah"]'); if (!row) return false; const btn = [...row.querySelectorAll(".dfp")].find((x) => x.textContent.trim() === pos); if (!btn || btn.disabled) return false; btn.click(); return true; }, pos);
  await p.waitForFunction(() => !!window.__latticeStore || window.__masorah === "keep", null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(900);
  return ok;
};
if (target) {
  await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, target.i);
  await p.waitForTimeout(700);
  const keep = await cardNow();
  const okGrades = keep && keep.grades.length && keep.grades.every((g) => ["m", "n", "x", "-"].includes(g));
  check("P5a every pill carries its grade", !!okGrades, keep ? `${keep.grades.length} pills · ${JSON.stringify(Object.fromEntries(["m", "n", "x", "-"].map((g) => [g, keep.grades.filter((x) => x === g).length])))}` : "no card");
  const pressed = await press("only this pointing");
  const only = await cardNow();
  const want = expectFor(target.s);
  check("P5b under only, no pill graded x survives, and the card's withheld count is this check's own count from the shard",
    pressed && only && !only.grades.includes("x") && only.withheld === want.x && only.rows === want.rows,
    only ? `withheld ${only.withheld} of ${only.rows} · counted ${want.x} of ${want.rows} · ${want.fromHeadwords} rows graded from their own headwords${v2 ? "" : " (v1 store: the lattice graded every row)"}` : "no card");
  await press("keep");
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
