// THE NO-BLANKS PILL (the owner, 2026-10-23: "our next 2 toggles for easy
// wins could be: 'no names' and 'no blanks'"): the source signs switch,
// promoted to the row's pills, so a reader can fill the gaps a sign-only
// piece leaves (the object marker's "<obj.>", a preposition's "<to>").
//   P1  the pill stands in the row, off on a fresh visit, and the bottom
//       Menu mirrors it
//   P2  pressed, no piece on the page stands as a gap: every sign-only piece
//       prints its sign as the source printed it
//   P3  pressed again, the gaps stand as before, as many as before
//   P4  the choice is kept on the device: a reload opens with the pill on
//       and no gaps
//   P5  reset puts the pill off, the gaps back, and says "default"
//   P6  the rail's own switch is the same switch: with the pill on, its row
//       stands at "as printed"; a press there to "off" puts the pill off
// The page is the first served zone, never named here (check-scope-derived
// S1). Usage: node tools/check-blanks-pill-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const URL0 = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const RAIL = `${URL0}${URL0.includes("?") ? "&" : "?"}rail=all`;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });
const open = async (url) => {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // a stretch of the page, so its later sections are built and read too
  for (let y = 0; y < 6000; y += 1500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(80); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await settled();
};
// the pieces are counted in the sections built when the page was first read
// (a section built later would move the count), and only where they are
// seen: a word inside a run keeps its own hidden pieces beside the run's
let SECS = null;
// the pieces are laid in slices after the sections build: read once the
// count holds still
const settled = async () => { let last = -1; for (let i = 0; i < 20; i += 1) { await p.waitForTimeout(400); const n = await p.evaluate(() => document.querySelectorAll(".he-text .g-pc, .he-text .g-part").length); if (n === last) break; last = n; } };
const state = () => p.evaluate((secs) => {
  const pill = document.getElementById("blanksPill");
  const built = [...document.querySelectorAll("section.seg")].filter((x) => x.querySelector(".he-text .wb")).map((x) => x.id);
  const inScope = secs ? new Set(secs) : new Set(built);
  const pieces = [...document.querySelectorAll(".he-text .g-pc, .he-text .g-part")].filter((x) => x.offsetParent !== null && inScope.has((x.closest("section.seg") || {}).id));
  return { built,
    inRow: !!(pill && pill.closest("#modeRow")), pressed: pill ? pill.getAttribute("aria-pressed") : null, on: !!(pill && pill.classList.contains("on")),
    gaps: pieces.filter((x) => x.classList.contains("gap")).length,
    signs: [...document.querySelectorAll(".he-text .g")].filter((x) => x.offsetParent !== null && inScope.has((x.closest("section.seg") || {}).id) && /<[^>]+>|\[[^\]]+\]/u.test(x.textContent)).length,
    stored: (() => { try { return localStorage.getItem("fh.signs"); } catch { return null; } })(),
    resetSays: (document.getElementById("resetState") || {}).textContent,
    rail: (() => { const row = document.querySelector('#railRows [data-toggle="signs"]'); return row ? [...row.querySelectorAll("button")].map((x) => `${x.textContent.trim()}${x.getAttribute("aria-pressed") === "true" || x.classList.contains("on") ? "*" : ""}`) : null; })(),
  };
}, SECS);
const menuHas = async () => {
  await p.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight - innerHeight, 2400))); await p.waitForTimeout(400);
  await p.waitForSelector("#nav:not([hidden])", { timeout: 5000 }).catch(() => {});
  if (await p.evaluate(() => document.getElementById("menuPick").hidden)) await p.click("#navMenu");
  await p.waitForTimeout(200);
  const m = await p.evaluate(() => { const x = document.querySelector('#menuPick button[data-for="blanksPill"]'); return x ? { text: x.firstChild.textContent, pressed: x.getAttribute("aria-pressed") } : null; });
  await p.click("#navMenu"); await p.waitForTimeout(150);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
  return m;
};
await open(URL0);
const s0 = await state(); SECS = s0.built;
const m0 = await menuHas();
check("P1 the pill stands in the row, off on a fresh visit, and the Menu mirrors it", s0.inRow && s0.pressed === "false" && !!m0 && m0.text === "no blanks" && m0.pressed === "false",
  `in the row ${s0.inRow} \u00B7 pressed ${s0.pressed} \u00B7 menu ${m0 ? `"${m0.text}" ${m0.pressed}` : "absent"} \u00B7 ${s0.gaps} gaps, ${s0.signs} signs printed`);
await p.click("#blanksPill"); await settled();
const s1 = await state();
check("P2 pressed, no piece stands as a gap and the signs print as the source printed them", s0.gaps > 0 && s1.pressed === "true" && s1.on && s1.gaps === 0 && s1.signs > s0.signs,
  `${s0.gaps} gaps before \u00B7 ${s1.gaps} after \u00B7 ${s1.signs} lines with a sign printed (${s0.signs} before) \u00B7 stored "${s1.stored}"`);
await p.click("#blanksPill"); await settled();
const s2 = await state();
check("P3 pressed again, the gaps stand as before", s2.pressed === "false" && s2.gaps === s0.gaps && s2.signs === s0.signs, `${s2.gaps} gaps (${s0.gaps} before) \u00B7 ${s2.signs} lines with a sign (${s0.signs} before)`);
await p.click("#blanksPill"); await p.waitForTimeout(600);
await open(URL0);
const s3 = await state();
check("P4 the choice is kept on the device over a reload", s3.pressed === "true" && s3.gaps === 0 && s3.stored === "printed", `pressed ${s3.pressed} \u00B7 ${s3.gaps} gaps \u00B7 stored "${s3.stored}"`);
await p.click("#resetPill"); await settled();
const s4 = await state();
check("P5 reset puts the pill off, the gaps back, and says default", s4.pressed === "false" && s4.gaps === s0.gaps && s4.resetSays === "default", `pressed ${s4.pressed} \u00B7 ${s4.gaps} gaps \u00B7 reset says "${s4.resetSays}"`);
// P6: the rail's row and the pill are one switch
await open(RAIL);
await p.click("#blanksPill"); await p.waitForTimeout(800);
const s5 = await state();
const railOn = s5.rail ? s5.rail.find((x) => x.endsWith("*")) : null;
await p.evaluate(() => { const row = document.querySelector('#railRows [data-toggle="signs"]'); const off = row && [...row.querySelectorAll("button")].find((x) => x.textContent.trim() === "off"); if (off) off.click(); });
await p.waitForTimeout(800);
const s6 = await state();
check("P6 the rail's own switch is the same switch: the pill on puts its row at \"as printed\", and its \"off\" puts the pill off", !!s5.rail && railOn === "as printed*" && s6.pressed === "false" && s6.gaps > 0,
  `rail with the pill on: ${s5.rail ? s5.rail.join(" | ") : "no row"} \u00B7 after off there: pill ${s6.pressed}, ${s6.gaps} gaps`);
await b.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
