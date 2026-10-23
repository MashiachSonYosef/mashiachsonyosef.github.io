// THE READINGS STAND THREE ROWS HIGH WHEREVER THE CARD OPENS (the owner,
// 2026-10-22, of a card of twenty-one readings showing one row of them: "this
// is like our main product and we are still crunching the R pills into less
// than a single row, it really should try to be at least 3 singles high").
//   R1  a card whose readings run to three rows or more shows three whole
//       rows of them, with its word anywhere on the screen, on a phone, a
//       short phone and a phone of ordinary height
//   R2  and the card still stands clear of its word: beneath it or above it,
//       never over it
// How often the page had to bring the word up to give the readings their
// rows is said, not failed. The word is the first of the first served page
// whose card holds the most readings, never named here (check-scope-derived
// S1). Usage: node tools/check-reading-rows-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const URL = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const VIEWPORTS = [[412, 915], [390, 750], [390, 664]];
const LOOK = 40;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const short = [], over = [], moved = [];
let opened = 0, word = null, deep = 0;   // deep: cards whose readings run to three rows or more
for (const [w, h] of VIEWPORTS) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const open = async (i, at) => {
    await p.evaluate(({ i, at }) => {
      const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i];
      wb.scrollIntoView({ block: "center" });
      if (at != null) window.scrollBy(0, wb.getBoundingClientRect().bottom - at);
      (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    }, { i, at });
    await p.waitForTimeout(900);
  };
  const close = async () => { await p.keyboard.press("Escape"); await p.waitForTimeout(150); };
  // the word: the most readings on its card among the first words
  if (word === null) {
    let best = -1, most = 0;
    for (let i = 0; i < LOOK; i += 1) {
      await open(i, null);
      const n = await p.evaluate(() => document.querySelectorAll("#hud > .rows .b-read .r-pills button").length);
      if (n > most) { most = n; best = i; }
      await close();
    }
    word = { i: best, n: most };
  }
  if (word.i < 0) break;
  for (let at = 120; at <= h - 60; at += 60) {
    const y0 = await p.evaluate(() => window.scrollY);
    await open(word.i, at);
    const r = await p.evaluate((i) => {
      const box = document.querySelector("#hud > .rows .b-read .r-pills");
      if (!box || !box.children.length) return null;
      const top = box.getBoundingClientRect().top, rows = [];
      for (const el of box.children) {
        const q = el.getBoundingClientRect(), t = q.top - top + box.scrollTop, bt = q.bottom - top + box.scrollTop;
        const row = rows.find((x) => Math.abs(x.t - t) < 2);
        if (row) row.b = Math.max(row.b, bt); else rows.push({ t, b: bt });
      }
      const whole = rows.filter((x) => x.b <= box.clientHeight + 1).length;
      const hud = document.getElementById("hud").getBoundingClientRect();
      const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i].getBoundingClientRect();
      const clear = hud.top >= wb.bottom - 1 || hud.bottom <= wb.top + 1;
      return { rows: rows.length, whole, clear, moved: Number(document.getElementById("hud").dataset.moved || 0) };
    }, word.i);
    const y1 = await p.evaluate(() => window.scrollY);
    await close();
    if (!r) continue;
    opened += 1; if (r.rows >= 3) deep += 1;
    const tag = `${w}x${h} word at ${at}px`;
    if (r.whole < Math.min(3, r.rows)) short.push(`${tag}: ${r.whole} of ${r.rows} rows`);
    if (!r.clear) over.push(tag);
    if (r.moved) moved.push(`${tag} (${r.moved}px)`);
    void y0; void y1;
  }
  await p.close();
}
await b.close();
console.log(`the word: number ${word ? word.i + 1 : "-"} of the page, ${word ? word.n : 0} readings; ${opened} cards opened`);
check("R1 the readings stand three whole rows high wherever the card opens", opened > 0 && deep > 0 && word && word.n > 3 && !short.length,
  short.length ? `${short.length} short: ${short.slice(0, 4).join("; ")}` : deep ? `${opened} cards, ${deep} with readings past three rows, every one three rows or more` : `${opened} cards, none with readings running to three rows: nothing to hold to`);
check("R2 the card stands clear of its word", opened > 0 && !over.length, over.length ? `${over.length} over the word: ${over.slice(0, 4).join("; ")}` : "beneath it or above it, every time");
console.log(`  --  the page brought the word up ${moved.length} time${moved.length === 1 ? "" : "s"} of ${opened}${moved.length ? `: ${moved.slice(0, 6).join("; ")}` : ""}`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
