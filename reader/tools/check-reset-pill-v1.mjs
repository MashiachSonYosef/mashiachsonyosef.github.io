// THE RESET PILL (the owner, 2026-10-18: "maybe we need a reset to default
// toggling button", a pill in the toggles row; "it would be: english toggle
// off, blobs off, numbers on, concordance off").
//   R1  the pill stands in the toggles row; it says "default" and cannot be
//       pressed only while the switches stand at their default and nothing
//       is picked
//   R2  a reading pressed on a word's card moves the word's line, and the
//       pill counts the pick
//   R3  reset forgets it: the card closes, every line drawn on the page is
//       the line it opened as, and the pill says "default" again
//   R4  reset puts the switches at their default: the English reader off,
//       blobs off, card numbering on, the concordance hud off, whatever they
//       stood at
//   R5  with the concordance on, a pick from its dropdown is counted too, and
//       reset puts that line back as well, and the concordance off
//   R6  the book's title word, which stands outside the sections, goes back
//       too, its chosen mark with it
// The words are found on the page, never named here (check-scope-derived S1).
// Usage: node tools/check-reset-pill-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(1500);
const waitFor = async (sel, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.$(sel)) return true; await p.waitForTimeout(100); } return false; };
const pill = () => p.evaluate(() => { const x = document.getElementById("resetPill"); return x ? { inRow: !!x.closest("#modeRow"), disabled: x.disabled, state: (document.getElementById("resetState") || {}).textContent } : null; });
// every line drawn on the page, by its section and place in it
const lines = () => p.evaluate(() => {
  const out = {};
  for (const sec of document.querySelectorAll("section.seg")) {
    const wbs = [...sec.querySelectorAll(".he-text .wb")];
    if (!wbs.length) continue;
    out[sec.id || sec.dataset.label || String(Object.keys(out).length)] = wbs.map((wb) => { const g = wb.querySelector(":scope > .g"); if (!g) return ""; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); });
  }
  return out;
});
const same = (a, b2) => Object.keys(a).every((k) => !b2[k] || JSON.stringify(a[k]) === JSON.stringify(b2[k]));
const diff = (a, b2) => Object.keys(a).flatMap((k) => (b2[k] || []).map((t, i) => (t !== a[k][i] ? `${k}#${i + 1} "${a[k][i]}" -> "${t}"` : null)).filter(Boolean));
const lineOf = () => p.evaluate(() => { const act = document.querySelector(".wb.active"); const g = act && act.querySelector(":scope > .g"); if (!g) return ""; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); });
// open words in turn until one whose card offers a reading the line does not read
const pickOnCard = async (from = 0) => {
  for (let i = from; i < from + 30; i += 1) {
    const ok = await p.evaluate((i) => { const wb = [...document.querySelectorAll(".he-text .wb:not(.mark)")].filter((x) => x.querySelector(".g:not(.bare)") && !x.__run)[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
    if (!ok) return null;
    if (!(await waitFor('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', 8000))) { await p.keyboard.press("Escape"); continue; }
    await p.waitForTimeout(400);
    const before = await lineOf();
    const text = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.getAttribute("aria-pressed") !== "true"); if (!x) return null; const t = x.textContent.trim(); x.click(); return t; });
    if (!text) { await p.keyboard.press("Escape"); continue; }
    await p.waitForTimeout(1000);
    return { i, before, text, after: await lineOf() };
  }
  return null;
};

// the row's switches, as their pills say they stand
const switches = () => p.evaluate(() => { const on = (id) => (document.getElementById(id) || { getAttribute: () => null }).getAttribute("aria-pressed") === "true"; return { en: on("modeEn"), blobs: on("blobPill"), nums: on("numsPill"), dict: on("dictPill") }; });
const atDefault = (w) => !w.en && !w.blobs && w.nums && !w.dict;
const p0 = await pill(), w0 = await switches();
check("R1  the pill stands in the toggles row; it says \"default\" and cannot be pressed only while the switches stand at their default and nothing is picked",
  !!p0 && p0.inRow && p0.disabled === atDefault(w0) && p0.state === (atDefault(w0) ? "default" : ""), `${JSON.stringify(p0)} · switches ${JSON.stringify(w0)}`);

const first = await lines();
const pk = await pickOnCard(0);
await p.keyboard.press("Escape"); await p.waitForTimeout(300);
const p1 = await pill();
check("R2  a reading pressed on a word's card moves the word's line, and the pill counts the pick",
  !!pk && pk.after !== pk.before && pk.after.includes(pk.text) && !p1.disabled && /^1 picked$/u.test(p1.state),
  pk ? `"${pk.before}" -> "${pk.after}" · pill ${JSON.stringify(p1)}` : "no word offered another reading");

// every switch away from its default before the press
for (const [id, want] of [["modeEn", true], ["blobPill", true], ["numsPill", false]]) { const w = await switches(); const k = { modeEn: "en", blobPill: "blobs", numsPill: "nums" }[id]; if (w[k] !== want) { await p.click(`#${id}`); await p.waitForTimeout(400); } }
const settingsBefore = await switches();
await p.click("#resetPill"); await p.waitForTimeout(1500);
const after = await lines();
const p2 = await pill();
const hudOpen = await p.evaluate(() => !document.getElementById("hud").hidden);
check("R3  reset forgets the pick: the card is closed, every line on the page is the line it opened as, and the pill says \"default\"",
  !!pk && same(first, after) && !hudOpen && p2.disabled && p2.state === "default",
  `${diff(first, after).slice(0, 3).join("; ") || "lines as first drawn"} · ${Object.keys(after).length} sections · pill ${JSON.stringify(p2)}`);
const settingsAfter = await switches();
const stored = await p.evaluate(() => { try { return { mode: localStorage.getItem("fh.mode"), nums: localStorage.getItem("fh.nums"), dict: localStorage.getItem("fh.dict") }; } catch { return null; } });
check("R4  reset puts the switches at their default: the English reader off, blobs off, card numbering on, the concordance hud off",
  settingsBefore.en && settingsBefore.blobs && !settingsBefore.nums && atDefault(settingsAfter) && !!stored && stored.mode === "he" && stored.nums === "on",
  `before ${JSON.stringify(settingsBefore)} · after ${JSON.stringify(settingsAfter)} · kept ${JSON.stringify(stored)}`);

// R5: the concordance's dropdown
await p.click("#dictPill"); await p.waitForTimeout(200);
let r5 = null;
for (let i = 0; i < 30 && !r5; i += 1) {
  const ok = await p.evaluate((i) => { const wb = [...document.querySelectorAll(".he-text .wb:not(.mark)")].filter((x) => x.querySelector(".g:not(.bare)") && !x.__run)[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
  if (!ok) break;
  if (!(await waitFor("#hud .dict-tab table", 15000))) { await p.keyboard.press("Escape"); continue; }
  await waitFor('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', 8000); await p.waitForTimeout(500);
  const before = await lineOf();
  await p.evaluate(() => { const b2 = document.querySelector("#hud .dict-tab tr.pick .r-pills button[aria-expanded=\"false\"]"); if (b2) b2.click(); });
  await p.waitForTimeout(300);
  const text = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud .dict-tab tr.sub.reads .opts:not(.rest) .opt .r-pills button")].find((y) => y.getAttribute("aria-pressed") !== "true"); if (!x) return null; const t = x.textContent.trim(); x.click(); return t; });
  if (!text) { await p.keyboard.press("Escape"); continue; }
  await p.waitForTimeout(1200);
  const moved = await lineOf();
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  const counted = await pill();
  await p.click("#resetPill"); await p.waitForTimeout(1500);
  r5 = { before, text, moved, counted, back: await lines(), p3: await pill(), dict: await p.evaluate(() => document.getElementById("dictPill").getAttribute("aria-pressed")) };
}
check("R5  with the concordance on, a pick from its dropdown is counted, and reset puts the line back and the concordance off",
  !!r5 && r5.moved.includes(r5.text) && /^1 picked$/u.test(r5.counted.state) && same(first, r5.back) && r5.p3.state === "default" && r5.dict === "false",
  r5 ? `"${r5.before}" -> "${r5.moved}" · counted ${r5.counted.state} · after reset ${diff(first, r5.back).slice(0, 2).join("; ") || "lines as first drawn"} · concordance ${r5.dict === "true" ? "still on" : "off"}` : "no dropdown pick found");
// R6: the title's word
const titleNow = () => p.evaluate(() => { const wb = document.querySelector("#workTitle .he-t .wb"); if (!wb) return null; const g = wb.querySelector(":scope > .g"); const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return { line: c ? c.textContent.trim() : "", chosen: wb.classList.contains("chosen") }; });
let r6 = null;
await p.click("#dictPill"); await p.waitForTimeout(200);
const title0 = await titleNow();
if (title0) {
  await p.evaluate(() => { const wb = document.querySelector("#workTitle .he-t .wb"); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); });
  await waitFor('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', 10000); await p.waitForTimeout(500);
  const text = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.getAttribute("aria-pressed") !== "true"); if (!x) return null; const t2 = x.textContent.trim(); x.click(); return t2; });
  await p.waitForTimeout(1000); await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  const moved = await titleNow();
  await p.click("#resetPill"); await p.waitForTimeout(1500);
  r6 = { title0, text, moved, back: await titleNow(), pill: await pill() };
}
check("R6  the book's title word goes back too, its chosen mark with it",
  !title0 || (!!r6 && !!r6.text && r6.moved.line !== r6.title0.line && r6.back.line === r6.title0.line && r6.back.chosen === r6.title0.chosen && r6.pill.state === "default"),
  title0 ? (r6 ? `"${r6.title0.line}" -> "${r6.moved.line}" (${r6.moved.chosen ? "chosen" : "not chosen"}) -> "${r6.back.line}" (${r6.back.chosen ? "chosen" : "not chosen"})` : "no reading to pick on the title's card") : "no title word on this page");
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
