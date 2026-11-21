// X1: A WORD'S CARD STAYS AT ITS WORD WHEN A PILL IS PRESSED ON IT (the readers' report of 21 November 2026:
// on a phone, at Obadiah 1:1 word 1, the second pill pressed moved the card's top 80px up and left 124.6px of page
// between the card and its word, where the page's own placement leaves 8.2px).
//   X1  after any pill press a card the page placed stands at the page's own gap from its word: beneath it or
//       above it, never over it, 8px away (the clamp's own 4px allowed either way). Asked on a phone (412x915)
//       and a short phone (390x664), of a word low on the screen (its card stands above it) and a word high on
//       the screen (its card stands beneath it), on the first card of a visit and on the cards after it: Obadiah
//       1:1 words 1, 2 and 5, the second, third and fourth pill of each. One fresh load per window and place.
// How far the first pick of each visit moved the word on the screen is said, not failed (the pick writes "1 picked"
// under the reset pill; the open card's word is pinned in the window while it is written).
// Usage: node check.mjs --base http://127.0.0.1:8934        (exit 1 if the law fails)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const BASE = arg("--base", "http://127.0.0.1:8899").replace(/\/$/u, "");
const BOOK = "obadiah", VERSE = "1:1", WORDS = [1, 2, 5], PILLS = [2, 3, 4];
const WINDOWS = [[412, 915], [390, 664]], PLACES = ["low", "high"];
const GAP = 8, SLACK = 4;            // the placement's own gap, and what the clamp counts as the same place
const r1 = (x) => Math.round(x * 10) / 10;
let bad = 0;
const check = (id, law, ok, saw) => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${id}  ${law}  ·  ${saw}`); };

const b = await chromium.launch();
const errors = [], off = [], missed = [], said = [];
const firstPick = [];
let presses = 0, own = null;
for (const [vw, vh] of WINDOWS) {
  for (const place of PLACES) {
    // a fresh reader: a new context holds nothing from the load before it
    const ctx = await b.newContext({ viewport: { width: vw, height: vh } });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.goto(`${BASE}/zone.html?b=${BOOK}`, { waitUntil: "networkidle", timeout: 120000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(1200);
    // the word, by its verse and its number among the verse's words as written (marks not counted)
    const wordAt = (n) => `(() => { const s = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === ${JSON.stringify(VERSE)}); return s ? [...s.querySelectorAll(".he-text .wb:not(.mark)")][${n - 1}] : null; })()`;
    const at = (src) => p.evaluate((src) => {
      const hud = document.getElementById("hud"), wb = eval(src);
      if (!wb || hud.hidden) return null;
      const c = hud.getBoundingClientRect(), w = wb.getBoundingClientRect();
      const above = c.bottom <= w.top + 0.5, beneath = c.top >= w.bottom - 0.5;
      return { top: c.top, foot: c.bottom, h: c.height, wTop: w.top, wFoot: w.bottom, side: above ? "above" : beneath ? "beneath" : "over", gap: above ? w.top - c.bottom : beneath ? c.top - w.bottom : -1, y: window.scrollY };
    }, src);
    // the card as it comes to rest: read until two looks a quarter of a second apart agree
    const rest = async (src, first = 1500) => {
      await p.waitForTimeout(first);
      let was = await at(src);
      for (let i = 0; i < 24; i += 1) {
        await p.waitForTimeout(250);
        const now = await at(src);
        if (was && now && Math.abs(now.top - was.top) < 0.05 && Math.abs(now.foot - was.foot) < 0.05 && Math.abs(now.wTop - was.wTop) < 0.05 && Math.abs(now.wFoot - was.wFoot) < 0.05) return now;
        was = now;
      }
      return was;
    };
    let cards = 0;
    for (const n of WORDS) {
      const src = wordAt(n);
      if (!(await p.evaluate((src) => !!eval(src), src))) { missed.push(`${vw}x${vh} ${place}: ${VERSE} has no word ${n}`); continue; }
      await p.keyboard.press("Escape"); await p.waitForTimeout(200);
      // the word brought low on the screen (130px above its foot) or high (70px under its top)
      await p.evaluate(([src, place, H]) => { const r = eval(src).getBoundingClientRect(); window.scrollBy(0, r.top - (place === "high" ? 70 : H - 130)); }, [src, place, vh]);
      await p.waitForTimeout(400);
      const target = await p.evaluateHandle((src) => { const wb = eval(src); return wb.querySelector(".w span") || wb.querySelector(".w") || wb; }, src);
      await target.asElement().click();
      const drew = await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 30000 }).then(() => true, () => false);
      if (!drew) { missed.push(`${vw}x${vh} ${place}: the card of ${VERSE} word ${n} drew no pills`); continue; }
      let before = await rest(src);
      cards += 1;
      for (const k of PILLS) {
        const pills = await p.$$("#hud > .rows .b-read .r-pills button");
        if (pills.length < k) break;
        // a pill out of its band's sight is brought into the band, the band alone, and pressed where it stands
        const pt = await pills[k - 1].evaluate((x) => {
          const box = x.parentElement, t = x.offsetTop - box.offsetTop;
          if (t < box.scrollTop || t + x.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = t;
          const r = x.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, el = document.elementFromPoint(cx, cy);
          return el === x || x.contains(el) ? [cx, cy] : null;
        });
        if (!pt) { missed.push(`${vw}x${vh} ${place}: pill ${k} of ${VERSE} word ${n} cannot be pressed where it stands`); continue; }
        await p.mouse.click(pt[0], pt[1]);
        const after = await rest(src, 1200);
        presses += 1;
        const ok = !!after && after.side !== "over" && Math.abs(after.gap - GAP) <= SLACK + 0.7;
        const where = `${vw}x${vh} ${VERSE} word ${n} pill ${k}`;
        if (!ok) off.push(`${where}: ${after ? `${after.side}, ${r1(after.gap)}px from its word (top ${r1(before.top)} -> ${r1(after.top)}, foot ${r1(before.foot)} -> ${r1(after.foot)}, height ${r1(before.h)} -> ${r1(after.h)}; the word's top ${r1(before.wTop)} -> ${r1(after.wTop)}, its foot ${r1(before.wFoot)} -> ${r1(after.wFoot)})` : "no card"}`);
        if (cards === 1 && k === PILLS[0] && after) firstPick.push(`${vw}x${vh} ${place} ${r1(after.wTop - before.wTop)}px`);
        // the report's own case: a phone, the word where the page opens it low, the second pill
        if (vw === 412 && place === "low" && n === 1 && k === 2 && after) own = `${VERSE} word 1 pill 2 on a phone: top ${r1(before.top)} -> ${r1(after.top)}, ${r1(before.gap)}px -> ${r1(after.gap)}px from its word`;
        if (after) before = after;
      }
    }
    said.push(`${vw}x${vh} ${place}: ${cards} cards`);
    await ctx.close();
  }
}
await b.close();
check("X1", `after any pill press a placed card stands at the page's own gap from its word (${GAP}px, ${SLACK}px either way), above it or beneath it, on a phone and a short phone, on the first card of a visit and the next`,
  presses > 0 && !off.length && !missed.length && !errors.length,
  `${presses} presses on ${said.join(", ")}: ${off.length} left the card off its word${off.length ? ` (${off.slice(0, 4).join(" | ")}${off.length > 4 ? ` | and ${off.length - 4} more` : ""})` : ""}; ${own || "the report's own case not reached"}; the first pick of each visit moved its word ${firstPick.join(", ") || "-"}${missed.length ? `; NOT ASKED: ${missed.slice(0, 3).join(" | ")}` : ""}${errors.length ? `; PAGE ERRORS: ${errors.slice(0, 2).join(" | ")}` : ""}`);
process.exit(bad ? 1 : 0);
