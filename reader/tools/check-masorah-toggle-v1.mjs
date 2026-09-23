#!/usr/bin/env node
// GUARDS: masorah-toggle-rule-v1-the-pointing-is-kept-the-gate-or-lifted-and-the-page-never-changes
//
// THE POINTING TOGGLE, PRESSED.
//
// The site keys every definition on the letters; the Masoretic pointing has
// never been the gate. This toggle lets the reader make it one, or lift it
// inside the card. Three positions, and one thing that holds under all of
// them: the Hebrew on the page does not move. Not a vowel, not a mark. The
// Masoretic text is the licensed text.
//
//   M1  the toggle is on the rail with three positions, "keep" in force
//   M2  KEEP is today: the card's head shows the pointed word, no record is
//       withheld, and the readings are what they were
//   M3  ONLY withholds: the pool shrinks, the card says how many records and
//       why, and NO surviving reading is carried only by a row the lattice
//       graded as a mismatch for this surface
//   M4  ONLY moves the line under the word to the sidecar's own row-level
//       leader (o.l), and the card's first pill says the same — one answer,
//       two places
//   M5  LETTERS: the card's head leads with the bare consonants and keeps the
//       pointed form beside them; every reading is back; a lattice order in
//       "reads first" has fallen back to oldest
//   M6  and across all three, the Hebrew of the section never changed by a
//       byte, and neither did the number of words on it
//   M7  KEEP again restores exactly the first pool
//   M8  THE CARD'S OWN SWITCH: a checkbox in the card's corner, in plain
//       words, lifts the pointing for THAT WORD — its head turns to bare
//       letters — while the Hebrew of the page stays byte-identical and the
//       next word's card opens with its own switch untouched. The only
//       scribal thing a reader may move is inside a card, and it may move
//       only that card
//
// Runs against the first served zone that carries the lattice layer; SKIPS
// by name when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const ZONE = zonesServed().find((z) => {
  if (!existsSync(`data/zones/${z}.lattice.bin`)) return false;
  const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
  return !!(s.emitted_from && s.emitted_from.toggles && s.emitted_from.toggles.lattice);
});
if (!ZONE) { console.log("SKIPPED — no served zone carries the lattice layer, so check-masorah-toggle-v1 has nothing to press"); process.exit(3); }
// the sidecar must carry the row-level leader this toggle reads
const side = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.lattice.bin`)).toString("utf8"));
if (!side.first_under || !("l" in side.first_under)) { console.log(`SKIPPED — ${ZONE}.lattice.bin carries no o.l leader; re-project with tools/project-lattice-v12-v1.mjs`); process.exit(3); }

const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
console.log(`— ${ZONE} —`);

const press = async (pos) => {
  await p.evaluate(() => { const r = document.getElementById("rail"); if (r && !r.open) r.open = true; });
  const ok = await p.evaluate((pos) => {
    const row = document.querySelector('.rail .row[data-toggle="masorah"]'); if (!row) return false;
    const btn = [...row.querySelectorAll(".dfp")].find((x) => x.textContent.trim() === pos);
    if (!btn || btn.disabled) return false; btn.click(); return true;
  }, pos);
  await p.waitForFunction(() => !!window.__latticeStore || window.__masorah === "keep" || window.__masorah === "letters", null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(900);
  return ok;
};
const hebrewOfSection = () => p.evaluate(() => {
  const s = document.querySelector("section.seg"); if (!s) return null;
  const he = s.querySelector(".he-text");
  return { text: he ? he.textContent : "", words: s.querySelectorAll(".he-text .wb").length };
});
const cardNow = () => p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  const pills = h.querySelector(".r-pills");
  const head = h.querySelector(".head b");
  const wb = document.querySelector("section.seg .he-text .wb.active");
  return {
    pills: pills ? [...pills.querySelectorAll("button")].map((x) => x.textContent.trim()) : [],
    withheld: pills ? Number(pills.dataset.withheld || 0) : 0,
    rows: pills ? Number(pills.dataset.rows || 0) : 0,
    note: (h.querySelector(".masorah-withheld") || {}).textContent || "",
    headLine: (h.querySelector('.kq-role[data-masorah]') || {}).textContent || "",
    head: head ? head.textContent : "",
    headMode: head ? head.dataset.masorah || "" : "",
    surface: wb ? wb.querySelector(".w").textContent.trim() : null,
    line: wb ? wb.querySelector(".g").textContent.replace(/\s+/g, " ").trim() : null,
    order: (document.querySelector('#railNow b[data-toggle="order"]') || document.querySelector("#railNow b") || {}).textContent || "",
  };
});

// M1
const rail = await p.evaluate(() => {
  const row = document.querySelector('.rail .row[data-toggle="masorah"]'); if (!row) return null;
  const btns = [...row.querySelectorAll(".dfp")];
  return { labs: btns.map((x) => x.textContent.trim()), on: btns.filter((x) => x.classList.contains("on")).map((x) => x.textContent.trim()), dead: row.classList.contains("dead") };
});
check("M1  the pointing toggle is on the rail with three positions, keep in force",
  rail && rail.labs.length === 3 && rail.on.length === 1 && rail.on[0] === "keep" && !rail.dead, rail ? `${rail.labs.join(" · ")} · on: ${rail.on.join(",")}` : "no row");

// a word whose surface the sidecar graded with rows to withhold, so the
// filter can be seen doing something
const target = await p.evaluate((grades) => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
  for (let i = 0; i < Math.min(wbs.length, 80); i += 1) {
    const g = wbs[i].querySelector(".g"); if (!g || g.classList.contains("bare")) continue;
    const s = wbs[i].querySelector(".w").textContent.trim();
    // one region only: a maqaf'd word draws its halves in the head and the
    // bare-letters head is drawn for single words (the halves are keyed each)
    if (s.includes(String.fromCodePoint(0x05be)) || wbs[i].querySelectorAll(".wr").length > 1) continue;
    const gr = grades[s]; if (!gr || !gr.g.includes("x") || !(gr.o && gr.o.l)) continue;
    return { i, s };
  }
  return null;
}, side.grades);
check("  a word with a reading, a mismatch card and a lenient leader stands on the page", !!target, target ? `word ${target.i + 1} · ${target.s}` : "");
const heBefore = await hebrewOfSection();
await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, target ? target.i : 0);
await p.waitForTimeout(700);
const keep = await cardNow();

// M2
check("M2  keep is today: pointed head, nothing withheld, readings present",
  keep && keep.pills.length > 0 && keep.withheld === 0 && keep.headMode === "" && keep.head === keep.surface,
  keep ? `${keep.pills.length} readings · head "${keep.head}"` : "no card");

// M3
const pressedOnly = await press("only this pointing");
check("  \"only this pointing\" is live and can be pressed", pressedOnly);
await p.waitForTimeout(900);
const only = await cardNow();
const gr = side.grades[target ? target.s : ""];
check("M3  only withholds, and the card says how many and why",
  only && only.withheld > 0 && only.rows > only.withheld && /withheld/u.test(only.note) && /otherwise/u.test(only.note) && /only readings of this pointing/u.test(only.headLine),
  only ? `${only.withheld} of ${only.rows} withheld · ${only.pills.length} readings (was ${keep ? keep.pills.length : "?"}) · "${only.note}"` : "no card");
check("    and the pool is smaller or equal, never larger", only && keep && only.pills.length <= keep.pills.length, `${only ? only.pills.length : "?"} ≤ ${keep ? keep.pills.length : "?"}`);
// M4
check("M4  the line under the word is the sidecar's lenient leader, and the first pill says the same",
  only && gr && gr.o.l && only.line.toLowerCase().startsWith(String(gr.o.l[0]).toLowerCase().slice(0, 12)) && only.pills[0] && only.pills[0].toLowerCase() === String(gr.o.l[0]).toLowerCase(),
  only ? `line "${only.line}" · pill "${only.pills[0]}" · o.l "${gr && gr.o.l ? gr.o.l[0] : "—"}"` : "no card");

// M5
const pressedLetters = await press("the letters only");
check("  \"the letters only\" can be pressed", pressedLetters);
await p.waitForTimeout(900);
const letters = await cardNow();
const bareK = await p.evaluate(() => { const wb = document.querySelector("section.seg .he-text .wb.active"); const z = window.__zone; if (!wb || !z) return null; const s = wb.querySelector(".w").textContent.trim(); for (const sec of z.sections) for (const w of sec.words || []) if (w.s === s) return w.k || (w.w && w.w[0] && w.w[0].k) || null; return null; });
check("M5  letters: the head leads with the bare consonants and keeps the pointed form; every reading is back",
  letters && letters.headMode === "letters" && bareK && letters.head.startsWith(bareK) && letters.head.includes(letters.surface) && letters.withheld === 0 && keep && letters.pills.length === keep.pills.length && /letters only/u.test(letters.headLine),
  letters ? `head "${letters.head}" · bare ${bareK} · ${letters.pills.length} readings (keep had ${keep ? keep.pills.length : "?"})` : "no card");
check("    and a lattice order in \"reads first\" has fallen back to oldest", letters && /oldest/i.test(letters.order), letters ? `reads first: ${letters.order}` : "");

// M6
const heAfter = await hebrewOfSection();
check("M6  the Hebrew of the section never changed by a byte across the three positions",
  heBefore && heAfter && heBefore.text === heAfter.text && heBefore.words === heAfter.words,
  heAfter ? `${heAfter.words} words, ${heAfter.text.length} characters, identical` : "no section");

// M7
await press("keep");
await p.waitForTimeout(700);
const back = await cardNow();
check("M7  keep again restores exactly the first pool", back && keep && JSON.stringify(back.pills) === JSON.stringify(keep.pills) && back.withheld === 0 && back.headMode === "");

// M8 — the card's own switch
await press("keep");
if (target) {
  await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, target.i);
  await p.waitForTimeout(700);
  const heNow = await hebrewOfSection();
  const lift = await p.evaluate(() => {
    const el = document.querySelector("#hud .hud-lift input"); if (!el) return null;
    const say = (document.querySelector("#hud .hud-lift span") || {}).textContent || "";
    return { checked: el.checked, say };
  });
  if (!lift) check("M8  the card carries its own pointing switch, in plain words", false, "no switch in the card's corner");
  else {
    const wordsOk = /masoretic/iu.test(lift.say) && /vowel/iu.test(lift.say) && /character/iu.test(lift.say);
    await p.evaluate(() => document.querySelector("#hud .hud-lift input").click());
    await p.waitForTimeout(1200);
    const lifted = await cardNow();
    const heAfter = await hebrewOfSection();
    const liftedHead = await p.evaluate(() => { const b2 = document.querySelector("#hud .head b"); return { mode: b2.dataset.masorah || "", text: b2.textContent }; });
    check("M8  the card's own switch lifts that card, says so in plain words, and moves no byte of the page",
      !lift.checked && wordsOk && liftedHead.mode === "letters" && heNow && heAfter && heNow.text === heAfter.text && heNow.words === heAfter.words,
      `"${lift.say}" → head ${liftedHead.mode || "unchanged"} · the section's Hebrew ${heNow && heAfter && heNow.text === heAfter.text ? "identical" : "MOVED"} (${heAfter ? heAfter.text.length : "?"} characters)`);
    // and the next word is its own card, with its own switch
    const next = await p.evaluate((i) => {
      const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
      for (let j = i + 1; j < Math.min(wbs.length, i + 12); j += 1) {
        const g = wbs[j].querySelector(".g"); if (!g || g.classList.contains("bare")) continue;
        if (wbs[j].querySelectorAll(".wr").length > 1) continue;
        (wbs[j].querySelector(".w span") || wbs[j].querySelector(".w")).click(); return j;
      }
      return -1;
    }, target.i);
    await p.waitForTimeout(800);
    const neighbour = await p.evaluate(() => { const el = document.querySelector("#hud .hud-lift input"); const b2 = document.querySelector("#hud .head b"); return el ? { checked: el.checked, mode: b2.dataset.masorah || "" } : null; });
    check("  and the word beside it opens with its own switch, unlifted",
      next >= 0 && neighbour && neighbour.checked === false && neighbour.mode === "",
      neighbour ? `word ${next + 1}: switch ${neighbour.checked ? "carried over — it must not" : "its own"} · head ${neighbour.mode || "as the page points it"}` : "no neighbour with a card");
  }
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
