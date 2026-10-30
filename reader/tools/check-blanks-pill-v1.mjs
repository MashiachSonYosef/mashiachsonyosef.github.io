// NO BLANKS, PARKED (the owner, 2026-10-24: "dont overworry about the no
// blanks toggle if anything we could move it to /toggles/ for now"). The
// source signs switch stood in the row as a pill for a day (the owner,
// 2026-10-23: "our next 2 toggles for easy wins could be: 'no names' and
// 'no blanks'"); it is off the row now and stays on the rail (?rail=all) and
// on /toggles/, where a reader can still fill the gaps a sign-only piece
// leaves (the object marker's "<obj.>", a preposition's "<to>").
//   P1  nothing on the book page offers it: no pill in the row, no entry in
//       the bottom Menu; the rail's row stands at "off" on a fresh visit
//   P2  pressed to "as printed" on the rail, no piece on the page stands as
//       a gap: every sign-only piece prints its sign as the source printed it
//   P3  pressed back to "off", the gaps stand as before, as many as before
//   P4  the choice is kept on the device: a reload opens with no gaps
//   P5  reset puts the switch off, the gaps back, and says "default"
//   P6  /toggles/ lists the switch among the rail's, drawn only with the
//       switches, never on every book page
// The page is the first served zone, never named here (check-scope-derived
// S1). Usage: node tools/check-blanks-pill-v1.mjs [url]
import { readFileSync } from "node:fs";
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
const railPress = async (lab) => {
  const did = await p.evaluate((lab) => { const row = document.querySelector('#railRows [data-toggle="signs"]'); const btn = row && [...row.querySelectorAll("button")].find((x) => x.textContent.trim() === lab); if (btn) { btn.click(); return true; } return false; }, lab);
  if (!did) { console.log(`PAGE: the rail has no "${lab}" on the signs row`); bad += 1; }
  await settled();
};
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
await open(RAIL);
const s0 = await state(); SECS = s0.built;
const m0 = await menuHas();
const railAt = (x) => (x.rail ? x.rail.find((y) => y.endsWith("*")) : null);
check("P1 nothing on the book page offers it: no pill in the row, no entry in the Menu; the rail's row stands at \"off\"", !s0.inRow && s0.pressed === null && !m0 && !!s0.rail && railAt(s0) === "off*",
  `pill ${s0.inRow ? "in the row" : "absent"} \u00B7 menu ${m0 ? `"${m0.text}"` : "absent"} \u00B7 rail ${s0.rail ? s0.rail.join(" | ") : "no row"} \u00B7 ${s0.gaps} gaps, ${s0.signs} signs printed`);
await railPress("as printed");
const s1 = await state();
check("P2 pressed to \"as printed\" on the rail, no piece stands as a gap and the signs print as the source printed them", s0.gaps > 0 && railAt(s1) === "as printed*" && s1.gaps === 0 && s1.signs > s0.signs,
  `${s0.gaps} gaps before \u00B7 ${s1.gaps} after \u00B7 ${s1.signs} lines with a sign printed (${s0.signs} before) \u00B7 stored "${s1.stored}"`);
await railPress("off");
const s2 = await state();
check("P3 pressed back to \"off\", the gaps stand as before", railAt(s2) === "off*" && s2.gaps === s0.gaps && s2.signs === s0.signs, `${s2.gaps} gaps (${s0.gaps} before) \u00B7 ${s2.signs} lines with a sign (${s0.signs} before)`);
await railPress("as printed");
await open(RAIL);
const s3 = await state();
check("P4 the choice is kept on the device over a reload", railAt(s3) === "as printed*" && s3.gaps === 0 && s3.stored === "printed", `rail ${railAt(s3)} \u00B7 ${s3.gaps} gaps \u00B7 stored "${s3.stored}"`);
await p.click("#resetPill"); await settled();
const s4 = await state();
check("P5 reset puts the switch off, the gaps back, and says default", railAt(s4) === "off*" && s4.gaps === s0.gaps && s4.resetSays === "default", `rail ${railAt(s4)} \u00B7 ${s4.gaps} gaps \u00B7 reset says "${s4.resetSays}"`);
// P6: /toggles/ lists it, as the rail's switch, not the book page's
const togglesPage = (() => { try { return readFileSync(new URL("../../toggles/index.html", import.meta.url), "utf8"); } catch { return null; } })();
const section = togglesPage ? (togglesPage.split(/id="signs"/u)[1] || "").split("</section>")[0] : "";
check("P6 /toggles/ lists the switch among the rail's, drawn only with the switches, never on every book page", !!section && /drawn only with the switches/u.test(section) && !/on every book page/u.test(section),
  `${togglesPage ? "page read" : "no toggles page beside the reader"} \u00B7 section ${section ? "found" : "missing"}`);
await b.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
