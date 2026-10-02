#!/usr/bin/env node
// GUARDS: licence-columns-rule-v1-the-licence-preference-is-a-baked-order-column-so-the-line-and-the-card-answer-as-one, reading-order-rule-v1-the-first-reading-is-the-sorted-pools-first-and-not-the-stores-first-stored-row
// LEDGER: -
// no frame letter. A check reads the page and judges it; it is not the
// ledger for one.
//
// THE LINE AND THE CARD ANSWER AS ONE, UNDER EVERY SETTING THE DEVICE
// REMEMBERS. A reader's switches are kept on their own device and are
// there again on the next load, so the page is opened cold under each one
// and asked, at its first words, whether the reading under the word, the
// card's own reading row and the pressed pill are one reading. They were
// not (the owner, 2026-09-27): the licence preference and the letters switch
// sorted the card and never reached the line, so a fresh load pressed one
// reading and printed another under the same word.
//
//   C1  under every remembered setting, on every word opened: the pressed
//       pill is the card's reading row is the line under the word
//   C2  and where the setting is baked as a column or an order the line can
//       read, the card's FIRST pill is that reading — the sort and the line
//       agree, not only the press
//
// A setting whose column is not baked on this book is reported, not failed,
// on C2: the rail says so in words, and C1 still holds there.
//
// Run: node tools/check-card-opens-on-the-line-v1.mjs [zone url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

const URL = process.argv[2] || defaultZoneUrl();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const WORDS = 5;

const trials = [["(default)", null]];
for (const v of ["corpus", "masoretic", "cites", "characters", "vowels-differ", "outside-era", "witnessed_same_place", "witnessed_entry", "witnessed_entry_and_lists", "oldest"]) trials.push(["fh.def.order", v]);
for (const v of ["pd", "by", "by-sa"]) trials.push(["fh.licence", v]);
trials.push(["fh.names", "sound"], ["fh.lookup", "headword"], ["fh.masorah", "only"], ["fh.masorah", "letters"], ["fh.edition", "diff"], ["fh.order.kq", "QERE"]);
// settings the line is not expected to follow pill for pill: names-as-sound
// sorts the card alone by the lattice's transliteration flag; under "look up
// by the headword" the card opens on the headword's lemma-sorted first
// reading, which the line prints, while its pills stand in the headword
// pool's own order (the open says so on the card)
const CARD_ONLY = new Set(["fh.names=sound", "fh.lookup=headword"]);

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const c1 = [], c2 = [], unbaked = [];
let opened = 0;
for (const [k, v] of trials) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  if (v !== null) await ctx.addInitScript(([kk, vv]) => { try { localStorage.setItem(kk, vv); } catch { /* a device that remembers nothing still reads */ } }, [k, v]);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  const tag = v === null ? k : `${k}=${v}`;
  try {
    await p.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
    await p.waitForTimeout(800);
    const r = await p.evaluate(async (n) => {
      const wait = (ms) => new Promise((x) => setTimeout(x, ms));
      const out = [];
      const wbs = [...document.querySelectorAll("section.seg .he-text .wb:has(.g:not(.bare))")].filter((w) => !w.closest(".wjoin")).slice(0, n);
      const h = document.getElementById("hud");
      for (const wb of wbs) {
        const g = wb.querySelector(":scope > .g");
        wb.querySelector(".w").click();
        const t0 = Date.now(); while (Date.now() - t0 < 12000 && !h.querySelector(".r-pills button, .b-read p:not(.r-label)")) await wait(50);
        await wait(700);
        const pills = [...h.querySelectorAll(".r-pills button")];
        const pressed = pills.find((x) => x.getAttribute("aria-pressed") === "true");
        out.push({ w: (wb.querySelector(".w")?.textContent || "").replace(/[֑-ׇ]/g, ""), line: (g?.title || "").trim(), now: (h.querySelector(".r-now .v")?.textContent || "").trim(), first: pills[0] ? pills[0].textContent.trim() : null, pressed: pressed ? pressed.textContent.trim() : null });
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await wait(150);
      }
      // the switch's own words on the rail: a column the book does not carry
      // is said there, and C2 reports rather than fails such a setting
      const rail = [...document.querySelectorAll("b[data-toggle]")].map((e) => e.textContent).join(" ");
      return { out, unbaked: /not baked on this book/.test(rail) };
    }, WORDS);
    opened += r.out.length;
    for (const x of r.out) {
      if (x.pressed === null) continue;   // a card that says a reason instead of readings is not this check's
      if (!(x.pressed === x.now && x.now === x.line)) c1.push(`${tag} · ${x.w}: line "${x.line}" · row "${x.now}" · pressed "${x.pressed}"`);
      if (!CARD_ONLY.has(tag) && x.first !== x.line) {
        if (r.unbaked) unbaked.push(`${tag} · ${x.w}`);
        else c2.push(`${tag} · ${x.w}: first "${x.first}" · line "${x.line}"`);
      }
    }
  } catch (e) { c1.push(`${tag}: could not open — ${String(e.message).slice(0, 120)}`); }
  await ctx.close();
}
await b.close();
console.log(`— ${trials.length} settings · ${opened} cards opened cold —`);
check("C1  under every remembered setting the pressed pill, the reading row and the line are one reading", c1.length === 0, c1.slice(0, 3).join(" | "));
check("C2  and the card's first pill is the line wherever the setting is baked for this book", c2.length === 0, c2.slice(0, 3).join(" | ") || (unbaked.length ? `${unbaked.length} not baked here (reported, not failed): ${unbaked.slice(0, 2).join(", ")}` : "every sort and the line agree"));
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
