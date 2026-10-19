// A LINE ONLY UNDER WORDS ONE CARD JOINS (the owner, 2026-10-19: "lets move
// to only underlining when it actually combines words / same as how we do no
// blob if its a single 1:1, we do no underline if its a 1:1 (word:hud)").
//   U1  a word that opens its own card alone shows no line under its letters,
//       at rest and under the hand: a word standing alone, a ketiv-qere pair,
//       and each word of a run that has no card of its own
//   U2  a card that joins words (a maqaf compound, a named run, a span) shows
//       one line under the whole, and its words none of their own
//   U3  the line keeps its room where it is unseen, so nothing moves: every
//       word's letters keep a bottom border of the width they had
//   U4  a word the page typed keeps its dashed mark, which is no card's line
//       (said, not failed, on a page with no such word)
// The pages are the served zones, never named here (check-scope-derived S1).
// Usage: node tools/check-underline-joins-v1.mjs [url] (one page; with none,
// the first three served pages)
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const ARG = /^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "";
const URLS = ARG ? [ARG] : zoneUrls().slice(0, 3);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const sum = { alone: 0, aloneLined: [], kq: 0, apart: 0, joins: 0, joinBad: [], innerLined: 0, hovered: 0, hoverLined: [], thin: [], typed: 0, typedBad: [] };
for (const url of URLS) {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // build a stretch of the page, so the page's later sections are read too
  for (let y = 0; y < 30000; y += 1500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(80); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const seen = (cs) => parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && !/rgba\([^)]*,\s*0\)$/u.test(cs.borderBottomColor) && cs.borderBottomColor !== "transparent";
    const at = (el) => { const sec = el.closest("section.seg"); return `${sec ? (sec.querySelector(".vnum") || {}).textContent : "?"}`; };
    const o = { alone: 0, aloneLined: [], kq: 0, apart: 0, joins: 0, joinBad: [], innerLined: 0, thin: [], typed: 0, typedBad: [] };
    for (const wb of document.querySelectorAll(".he-text .wb:not(.mark)")) {
      const w = wb.querySelector(":scope > .w");
      if (!w) continue;
      const cs = getComputedStyle(w), join = wb.closest(".wjoin");
      if (parseFloat(cs.borderBottomWidth) < 1) o.thin.push(at(wb));
      if (wb.classList.contains("typed-here")) { o.typed += 1; if (cs.borderBottomStyle !== "dashed" || !seen(cs)) o.typedBad.push(at(wb)); continue; }
      if (!join || join.classList.contains("apart")) {
        o.alone += 1; if (wb.classList.contains("kq")) o.kq += 1; if (join) o.apart += 1;
        if (seen(cs)) o.aloneLined.push(`${at(wb)} ${wb.className}`);
      } else if (seen(cs)) o.innerLined += 1;
    }
    for (const j of document.querySelectorAll(".he-text .wjoin:not(.apart)")) {
      if (j.querySelectorAll(".wb:not(.mark)").length < 2) continue;
      o.joins += 1;
      const ink = j.querySelector(":scope > .wj-ink");
      if (!ink || !seen(getComputedStyle(ink))) o.joinBad.push(at(j));
    }
    return o;
  });
  // under the hand: the first words standing alone, hovered one by one
  const n = await p.evaluate(() => document.querySelectorAll(".he-text .wb:not(.mark):not(.wjoin .wb):not(.typed-here)").length);
  for (let i = 0; i < Math.min(n, 8); i += 1) {
    const box = await p.evaluate((i) => { const wb = document.querySelectorAll(".he-text .wb:not(.mark):not(.wjoin .wb):not(.typed-here)")[i]; wb.scrollIntoView({ block: "center" }); const q = wb.querySelector(":scope > .w").getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, i);
    await p.mouse.move(box.x, box.y); await p.waitForTimeout(80);
    const lined = await p.evaluate((i) => { const w = document.querySelectorAll(".he-text .wb:not(.mark):not(.wjoin .wb):not(.typed-here)")[i].querySelector(":scope > .w"); const cs = getComputedStyle(w); return parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && !/rgba\([^)]*,\s*0\)$/u.test(cs.borderBottomColor); }, i);
    sum.hovered += 1; if (lined) sum.hoverLined.push(`${url.split("b=")[1]} word ${i + 1}`);
  }
  for (const k of ["alone", "kq", "apart", "joins", "innerLined", "typed"]) sum[k] += r[k];
  for (const k of ["aloneLined", "joinBad", "thin", "typedBad"]) sum[k].push(...r[k].map((x) => `${url.split("b=")[1]} ${x}`));
  await p.close();
}
await b.close();
check("U1 a word that opens its own card alone shows no line under its letters, at rest and under the hand",
  sum.alone > 0 && !sum.aloneLined.length && sum.hovered > 0 && !sum.hoverLined.length,
  `${sum.alone} words alone (${sum.kq} ketiv-qere, ${sum.apart} in a run with no card of its own) \u00B7 ${sum.aloneLined.length} lined${sum.aloneLined.length ? `: ${sum.aloneLined.slice(0, 3).join("; ")}` : ""} \u00B7 ${sum.hovered} hovered, ${sum.hoverLined.length} lined`);
check("U2 a card that joins words shows one line under the whole, and its words none of their own",
  sum.joins > 0 && !sum.joinBad.length && sum.innerLined === 0,
  `${sum.joins} joined cards \u00B7 ${sum.joinBad.length} without the line${sum.joinBad.length ? `: ${sum.joinBad.slice(0, 3).join("; ")}` : ""} \u00B7 ${sum.innerLined} words inside one lined on their own`);
check("U3 the line keeps its room where it is unseen", !sum.thin.length, sum.thin.length ? `${sum.thin.length} words with no bottom border: ${sum.thin.slice(0, 3).join("; ")}` : "every word's letters keep their bottom border");
if (sum.typed) check("U4 a word the page typed keeps its dashed mark", !sum.typedBad.length, `${sum.typed} typed words \u00B7 ${sum.typedBad.length} without it`);
else console.log("  --  U4 no word the page typed on these pages: nothing to keep");
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
