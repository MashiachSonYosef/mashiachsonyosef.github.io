#!/usr/bin/env node
// RUN: page
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
//   M1  the toggle is on the rail with three positions, "only this pointing"
//       in force: the pointing stands by default (the owner, 2026-11-06,
//       asked whether it becomes the default: "1 seems like it")
//   M2  ONLY, the default, withholds: the card says how many records and why
//       on one line under the readings, and its head says nothing (the
//       default is the page's own statement, not a setting the reader made)
//   M3  KEEP is the pointing as printed: the head shows the pointed word, no
//       record is withheld, and the default's pool is never larger
//   M4  ONLY moves the line under the word to the sidecar's own row-level
//       leader (o.l, or its place's own where the entry or the names gate
//       moves it), and the card's first pill says the same — one answer,
//       two places
//   M4b the lenient leader names its carriers; with every one switched off
//       the line reads the filter's own alternate (o.la) and the card opens
//       pressed on it, or goes bare where no kept reading remains
//   M5  LETTERS: the card's head is the word as the page writes it, once, in
//       the corpus's red (the owner, 2026-11-09: "we shouldn't write the
//       hebrew twice just write the pointed version not the stripped
//       version"; until then the head led with the bare consonants and set
//       the pointed form faint beside them); the position is said in words
//       under it; every reading is back; a lattice order in "reads first"
//       has fallen back to oldest
//   M6  and across all three, the Hebrew of the section never changed by a
//       byte, and neither did the number of words on it
//   M7  ONLY again, pressed by the reader, restores exactly the first pool,
//       and the head now names the setting
//   M8  NO CARD CARRIES A POINTING SWITCH OF ITS OWN (the owner,
//       2026-10-03: "lets just take that toggle off individual cards for now
//       id put it in the collapsed"): the card opens with no checkbox in it,
//       the pointing is the book's, chosen in the switches' fold, and the
//       Hebrew of the page stays byte-identical
//
// Runs against the first served zone that carries the lattice layer; SKIPS
// by name when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { onlyLeaders } from "./place-leaders-v1.mjs";
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
// THE ORDER THESE CLAIMS ARE WRITTEN AGAINST: oldest first. The owner made
// "at this place" the default (2026-10-03: "we dont do blanket oldest first
// anymore thats a subtoggle"); it leads wherever TAHOT reads the word, and it
// has its own check (check-line-reads-the-place-v1). A stored choice is kept.
await p.addInitScript(() => { try { if (!localStorage.getItem("fh.def.order")) localStorage.setItem("fh.def.order", "oldest"); } catch { /* a device that remembers nothing still reads */ } });
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
  // the ink and only the ink: the words' own Hebrew, never the English
  // lines standing under them, which the letters switch is allowed to move
  // (the line follows the card's leader, licence-columns-rule-v1) while
  // the Hebrew above them never changes by a byte
  const he = s.querySelector(".he-text");
  const ink = he ? [...he.querySelectorAll(".wb > .w")].map((w) => w.textContent).join(" ") : "";
  return { text: ink, words: s.querySelectorAll(".he-text .wb").length };
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
    headInk: head ? getComputedStyle(head).color : "",
    wordInk: wb ? getComputedStyle(wb.querySelector(".w")).color : "",
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
check("M1  the pointing toggle is on the rail with three positions, \"only this pointing\" in force",
  rail && rail.labs.length === 3 && rail.on.length === 1 && rail.on[0] === "only this pointing" && !rail.dead, rail ? `${rail.labs.join(" · ")} · on: ${rail.on.join(",")}` : "no row");

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
// the card as it opens, under the default
const only = await cardNow();
const gr = side.grades[target ? target.s : ""];
// the leaders under "only" at the word's own place: its own where its gates move them (its entry's tags
// and whether it is a name; a book whose places were not read for names reads every place as one)
const at = target ? await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i].__word; return { tags: w && w.tg ? [].concat(w.tg) : null, np: !!(w && w.np) }; }, target.i) : { tags: null, np: false };
const lead = onlyLeaders(gr, at.tags, !side.names || at.np);

// M2
check("M2  only, the default, withholds, and the card says how many and why, with nothing in its head",
  only && only.withheld > 0 && only.rows > only.withheld && /withheld/u.test(only.note) && /otherwise/u.test(only.note) && only.headLine === "",
  only ? `${only.withheld} of ${only.rows} withheld · ${only.pills.length} readings · "${only.note}"` : "no card");

// M3
const pressedKeep = await press("keep");
check("  \"keep\" can be pressed", pressedKeep);
await p.waitForTimeout(900);
const keep = await cardNow();
check("M3  keep is the pointing as printed: pointed head, nothing withheld, readings present",
  keep && keep.pills.length > 0 && keep.withheld === 0 && keep.headMode === "" && keep.head === keep.surface,
  keep ? `${keep.pills.length} readings · head "${keep.head}"` : "no card");
check("    and the default's pool is smaller or equal, never larger", only && keep && only.pills.length <= keep.pills.length, `${only ? only.pills.length : "?"} ≤ ${keep ? keep.pills.length : "?"}`);
// M4
check("M4  the line under the word is the sidecar's lenient leader at its place, and the first pill says the same",
  only && lead.l && only.line.toLowerCase().startsWith(String(lead.l[0]).toLowerCase().slice(0, 12)) && only.pills[0] && only.pills[0].toLowerCase() === String(lead.l[0]).toLowerCase(),
  only ? `line "${only.line}" · pill "${only.pills[0]}" · the leader "${lead.l ? lead.l[0] : "—"}"${at.tags ? ` (at a place of ${at.tags.join(" ")})` : ""}` : "no card");

// M4b — THE FILTER'S OWN ALTERNATE (7 November 2026). The lenient leader
// names its carriers (o.l[4]); with every one of them switched off, the line
// reads the sidecar's own alternate (o.la, the leader among the kept rows
// with those carriers out) and the card opens pressed on it, or the word goes
// bare where no kept reading remains. The table's alternate (gloss_m.alt),
// baked over every row, may name a row the filter withholds, and before this
// the line read it while the card pressed another reading.
{
  const l = lead.l;
  const ids = l && Array.isArray(l[4]) && l[4].length ? l[4] : null;
  const la = lead.la;
  let r = null;
  if (ids) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
    await ctx.addInitScript((off) => { try { localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.sources.off", JSON.stringify(off)); } catch { /* a device that remembers nothing still reads */ } }, ids);
    const q = await ctx.newPage();
    q.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
    await q.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
    await q.waitForSelector("section.seg .he-text .wb");
    await q.waitForTimeout(600);
    r = await q.evaluate(async (i) => {
      const wait = (ms) => new Promise((x) => setTimeout(x, ms));
      const w = document.querySelectorAll("section.seg .he-text .wb")[i];
      const g = w.querySelector(":scope > .g");
      (w.querySelector(".w span") || w.querySelector(".w")).click();
      const h = document.getElementById("hud");
      const t0 = Date.now(); while (Date.now() - t0 < 12000 && !h.querySelector(".r-pills button")) await wait(50);
      await wait(700);
      const pills = [...h.querySelectorAll(".r-pills button")].map((x) => ({ t: x.textContent.trim(), on: x.getAttribute("aria-pressed") === "true", by: String(x.dataset.by || "").split(" ").filter(Boolean) }));
      return { line: ((g && g.childNodes[0] && g.childNodes[0].textContent) || "").trim(), bare: !!(g && g.classList.contains("bare")), pills };
    }, target ? target.i : 0);
    await ctx.close();
  }
  const norm = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
  const pressed = r && r.pills.find((x) => x.on);
  const offIds = new Set(ids || []);
  const onlyOff = r ? r.pills.filter((x) => x.by.length && x.by.every((m) => offIds.has(m))).length : -1;
  const ok = !!ids && !!r && onlyOff === 0 && (la
    ? norm(r.line) === norm(la[0]) && !!pressed && norm(pressed.t) === norm(la[0])
    : r.bare);
  check("M4b the lenient leader names its carriers, and with every one switched off the line reads the filter's own alternate (o.la) and the card opens pressed on it, or goes bare where none remains",
    ok, !ids ? "the sidecar's o.l names no carriers; re-project with tools/project-lattice-v12-v1.mjs" : !r ? "no card" : `off ${ids.join(",")} · line "${r.line}"${r.bare ? " (bare)" : ""} · pressed "${pressed ? pressed.t : "—"}" · o.la "${la ? la[0] : "—"}" · pills credited only to the off ids: ${onlyOff}`);
}

// M5
const pressedLetters = await press("the letters only");
check("  \"the letters only\" can be pressed", pressedLetters);
await p.waitForTimeout(900);
const letters = await cardNow();
const bareK = await p.evaluate(() => { const wb = document.querySelector("section.seg .he-text .wb.active"); const z = window.__zone; if (!wb || !z) return null; const s = wb.querySelector(".w").textContent.trim(); for (const sec of z.sections) for (const w of sec.words || []) if (w.s === s) return w.k || (w.w && w.w[0] && w.w[0].k) || null; return null; });
check("M5  letters: the head is the word as the page writes it, once, in the word's own red; every reading is back",
  letters && letters.headMode === "letters" && bareK && letters.head.trim() === letters.surface && letters.headInk === letters.wordInk && letters.withheld === 0 && keep && letters.pills.length === keep.pills.length && /letters only/u.test(letters.headLine),
  letters ? `head "${letters.head}" (the line's word "${letters.surface}") · ink ${letters.headInk} (the word's ${letters.wordInk}) · ${letters.pills.length} readings (keep had ${keep ? keep.pills.length : "?"})` : "no card");
check("    and a lattice order in \"reads first\" has fallen back to oldest", letters && /oldest/i.test(letters.order), letters ? `reads first: ${letters.order}` : "");

// M6
const heAfter = await hebrewOfSection();
check("M6  the Hebrew of the section never changed by a byte across the three positions",
  heBefore && heAfter && heBefore.text === heAfter.text && heBefore.words === heAfter.words,
  heAfter ? `${heAfter.words} words, ${heAfter.text.length} characters, identical` : "no section");

// M7
const pressedOnly = await press("only this pointing");
check("  \"only this pointing\" is live and can be pressed", pressedOnly);
await p.waitForTimeout(700);
const back = await cardNow();
check("M7  only again, pressed, restores exactly the first pool and names the setting in the head", back && only && JSON.stringify(back.pills) === JSON.stringify(only.pills) && back.withheld === only.withheld && back.headMode === "" && /only readings of this pointing/u.test(back.headLine),
  back ? `head "${back.headLine}"` : "no card");

// M8 — no card carries a pointing switch of its own; the setting is the book's
await press("keep");
if (target) {
  const heBefore = await hebrewOfSection();
  await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, target.i);
  await p.waitForTimeout(700);
  const heNow = await hebrewOfSection();
  const inCard = await p.evaluate(() => document.querySelectorAll('#hud input[type="checkbox"], #hud .hud-lift').length);
  const inFold = await p.evaluate(() => { const el = document.querySelector('.rail .row[data-toggle="masorah"]'); return el ? !!el.closest(".more-switches") : null; });
  check("M8  the card carries no pointing switch of its own; the pointing is the book's, in the switches' fold, and the page's Hebrew never moves",
    inCard === 0 && inFold === true && heBefore && heNow && heBefore.text === heNow.text && heBefore.words === heNow.words,
    `${inCard} switch(es) in the card · the book's switch ${inFold === null ? "not found" : inFold ? "in the fold" : "outside the fold"} · the section's Hebrew ${heBefore && heNow && heBefore.text === heNow.text ? "identical" : "MOVED"}`);
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
