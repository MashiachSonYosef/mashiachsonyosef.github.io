#!/usr/bin/env node
// GUARDS: kq-rule-v1-both-halves-as-written
//
// THE PAIR OPENS ON THE HALF THE SWITCH NAMES.
//
// The owner's rule for the pairs switch, 2026-09-23, in his words: "both
// would always open together in 1 hud ... the toggle is much smaller
// conceptually, it's just ... what english leads, so if you clicked qere,
// when you meet a qere word, the qere megacompspan would already be selected
// for you." So, on a served book with source-marked pairs:
//
//   K1  the page draws every pair the zone counts, both halves printed
//   K2  under each position of the switch (written · read · as the source
//       sets them), pressing EITHER half of a pair opens the card on the
//       switch's half — both halves in the head as always, the open one
//       lit — or, where the switch's half has no reading, on the half the
//       line fell back to; the underline on the line sits under the same
//       half the card is about; the form row holds the two forms as pills,
//       the open one pressed (the owner, 2026-10-23: "the selection happens
//       at the wrong place"). Nothing else on the card changes.
//   K3  pressing the other half in the head keeps the one card and lights it
//       instead, and the line does not move: the underline stays under the
//       half the line reads from, and the card closed and opened again
//       opens on that half, not on the pressed one (rule 1, kq-shapes:
//       "choosing a branch changes what the card is about and moves no
//       character of the line"; the owner, 2026-10-23: a pair "is just a
//       regular megacompspan, the only difference is it doesnt select the
//       hebrew showing")
//   K4  moving the switch: the pair opens on the switch's half
//   K5  the Hebrew of every pair never changed by a byte through all of it
//   K6  pressing the other form's pill in the form row does what pressing
//       the other half in the head does: the one card, that form lit, its
//       pill pressed, the line's underline and its English where they were,
//       and a reopen lands on the line's half
//   K7  a reading pressed on the form the card moved to rules that form:
//       the line reads it, the underline moves to that half, the reopen
//       lands on it; reset puts it back
//   K8  a pair inside a chain the page holds apart: its card opens with its
//       own form row, a form press moves the card and not the chain's line,
//       a reading pressed on the moved-to form reaches the chain's line
//   K9  the pairs switch moved while the card stands on the other form: the
//       card stays where it is, the line's underline follows the switch
// K4 and K9 are witnessed on the first pair whose opening half the switch
// moves (one with no reading of the source's own at the place); a zone
// with none says so.
//
// Runs against the first served zone that counts pairs. Skips, and says so,
// when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

let ZONE = null, zone = null;
for (const z of zonesServed()) {
  const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
  if (Number((s.counts || {}).kq_sites) > 0) { ZONE = z; zone = s; break; }
}
if (!ZONE) { console.log("SKIPPED — no served zone counts a source-marked pair"); process.exit(3); }
const SITES = Number(zone.counts.kq_sites);

const pw = await loadPlaywright();
const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
// build every section, so every pair is on the page
await p.evaluate(async () => {
  let g = 0;
  while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 8)); g += 1; }
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 80));
});
await p.waitForTimeout(500);
console.log(`— ${ZONE} · ${SITES} pair${SITES === 1 ? "" : "s"} —`);

// K1
const drawn = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb.kq")].map((w) => ({
  he: w.querySelector(".w").textContent, halves: w.querySelectorAll(".wr").length,
})));
check("K1  the page draws every pair the zone counts", drawn.length === SITES, `${drawn.length} drawn · ${SITES} counted`);
check("K1  both halves of every pair are printed and pressable", drawn.every((d) => d.halves === 2), drawn.map((d) => d.halves).join(","));
const heBefore = drawn.map((d) => d.he);

const setSwitch = async (label) => p.evaluate((label) => {
  const r = document.getElementById("rail"); r.open = true;
  document.querySelectorAll(".rail details").forEach((d) => { d.open = true; });
  const row = document.querySelector('.rail .row[data-toggle="pairs"]');
  const btn = row && [...row.querySelectorAll(".dfp")].find((e) => e.textContent.trim() === label);
  if (!btn) return false;
  btn.click(); return true;
}, label);

// open pair n by pressing its half h; report the card and the line
const openPair = async (n, h) => {
  await p.evaluate(({ n, h }) => {
    const w = document.querySelectorAll("section.seg .he-text .wb.kq")[n];
    w.scrollIntoView({ block: "center" });
    w.querySelectorAll(".wr")[h].click();
  }, { n, h });
  await p.waitForTimeout(900);
  return p.evaluate((n) => {
    const w = document.querySelectorAll("section.seg .he-text .wb.kq")[n];
    const hud = document.getElementById("hud");
    // the half the card is not open on stands at the regular weight beside
    // the open half's bold, in the same red (the owner, 2026-10-18: "the
    // hebrew should still be red"); it had been the faint purple
    const headSegs = [...hud.querySelectorAll(".head b > span:not(.mq)")].map((s) => ({ t: s.textContent, lit: !s.style.color && s.style.fontWeight !== "400", pressable: s.getAttribute("role") === "button" }));
    const halves = [...w.querySelectorAll(".wr")];
    const litIdx = headSegs.findIndex((s) => s.lit);
    const roleLine = (hud.querySelector(".head .kq-role") || {}).textContent || "";
    return {
      open: !hud.hidden, litIdx, headLit: headSegs.filter((s) => s.lit).length, headSegs: headSegs.length,
      otherPressable: headSegs.some((s) => !s.lit && s.pressable),
      litRole: roleLine.startsWith("ketiv") ? "KETIV" : roleLine.startsWith("qere") ? "QERE" : null,
      extras: hud.querySelectorAll(".b-q *").length,
      // the pair's two forms as pills in the form row, the open one pressed
      // (the owner, 2026-10-23: "the selection happens at the wrong place")
      formPills: [...hud.querySelectorAll(".b-q .s-pills button")].map((q) => q.getAttribute("aria-pressed") === "true"),
      underline: halves.findIndex((x) => x.classList.contains("backs-en")),
      on: halves.findIndex((x) => x.classList.contains("on")),
      roles: halves.map((x) => (x.title.startsWith("ketiv") ? "KETIV" : "QERE")),
      line: ((w.querySelector(":scope > .g") || {}).textContent || "").replace(/\s+/g, " ").trim(),
    };
  }, n);
};
const closeCard = async () => { await p.keyboard.press("Escape"); await p.waitForTimeout(300); };

// K2
const POSITIONS = [["written (ketiv)", "KETIV"], ["read (qere)", "QERE"], ["as the source sets them", "SOURCE"]];
const N = Math.min(drawn.length, 6);
for (const [label, id] of POSITIONS) {
  check(`K2  the pairs switch offers "${label}"`, await setSwitch(label));
  await p.waitForTimeout(300);
  for (let n = 0; n < N; n += 1) {
    for (const h of [0, 1]) {
      const r = await openPair(n, h);
      const want = id === "SOURCE" ? r.roles[0] : id;
      const wantIdx = r.roles.indexOf(want);
      // the switch's half, unless the line has no reading under it and fell
      // to the other: then the card follows the line, which is what the
      // underline says
      const fell = r.underline >= 0 && r.underline !== wantIdx && r.litIdx === r.underline;
      const okIdx = r.litIdx === wantIdx || fell;
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · the card opens on the switch's half, both halves in the head, that one lit`,
        r.open && okIdx && r.headSegs === 2 && r.headLit === 1 && r.litRole === r.roles[r.litIdx],
        `lit ${r.roles[r.litIdx]} · wanted ${want}${fell ? " (the line fell back; the card followed it)" : ""} · line "${r.line.slice(0, 30)}"`);
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · the underline and the open mark sit under the half the card is about`,
        r.litIdx >= 0 && r.underline === r.litIdx && r.on === r.litIdx, `underline ${r.underline} · on ${r.on} · lit ${r.litIdx}`);
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · the form row holds the two forms as pills, the open one pressed; the other half is pressable where it stands`,
        r.formPills.length === 2 && r.formPills.filter(Boolean).length === 1 && r.formPills.indexOf(true) === r.litIdx && r.otherPressable,
        `form pills ${r.formPills.length}, pressed ${r.formPills.indexOf(true)} · lit ${r.litIdx} · pressable ${r.otherPressable}`);
      await closeCard();
    }
  }
}

// K3 — under "written", press the other half in the head at pair 1
await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
const first = await openPair(0, 0);
const otherIdx = first.litIdx === 0 ? 1 : 0;
await p.evaluate((j) => { document.querySelectorAll("#hud .head b > span:not(.mq)")[j].click(); }, otherIdx);
await p.waitForTimeout(900);
const flipped = await p.evaluate(() => {
  const w = document.querySelectorAll("section.seg .he-text .wb.kq")[0];
  const hud = document.getElementById("hud");
  const segs = [...hud.querySelectorAll(".head b > span:not(.mq)")];
  const lit = segs.findIndex((s) => !s.style.color && s.style.fontWeight !== "400");
  const halves = [...w.querySelectorAll(".wr")];
  const pills = [...hud.querySelectorAll(".b-q .s-pills button")].map((q) => q.getAttribute("aria-pressed") === "true");
  return { open: !hud.hidden, segs: segs.length, lit, pressed: pills.indexOf(true), on: halves.findIndex((x) => x.classList.contains("on")),
    role: ((hud.querySelector(".head .kq-role") || {}).textContent || "").split(" ")[0],
    underline: halves.findIndex((x) => x.classList.contains("backs-en")), line: ((w.querySelector(":scope > .g") || {}).textContent || "").replace(/\s+/g, " ").trim() };
});
check("K3  pressing the other half in the head keeps the one card and lights that half instead: head, role line, form pill and open mark all on it",
  flipped.open && flipped.segs === 2 && flipped.lit === otherIdx && flipped.pressed === otherIdx && flipped.on === otherIdx && flipped.role === first.roles[otherIdx].toLowerCase(),
  `lit ${flipped.lit} · pressed ${flipped.pressed} · on ${flipped.on} · role "${flipped.role}" · wanted ${otherIdx} ${first.roles[otherIdx].toLowerCase()}`);
check("K3  the line did not move: the underline stays under the half the line reads from", flipped.underline === first.litIdx && flipped.line === first.line, `underline ${flipped.underline} · wanted ${first.litIdx} · line "${flipped.line}" was "${first.line}"`);
await closeCard();
const again = await openPair(0, 0);
check("K3  closed and opened again, the pair opens on the half the line reads from, not on the pressed one", again.litIdx === first.litIdx, `lit ${again.litIdx} · wanted ${first.litIdx}`);
await closeCard();

// K4 — the switch governs the opening half, in both directions: at "read"
// the pair opens on the qere, at "written" on the ketiv, each with the
// underline under it; a pair whose other half has no reading (the line fell
// back) is skipped here, K2 having said so
let k4Witness = -1, k4 = null;
for (let n = 0; n < N && k4Witness < 0; n += 1) {
  const got = [];
  for (const [label, role] of [["read (qere)", "QERE"], ["written (ketiv)", "KETIV"]]) {
    await setSwitch(label); await p.waitForTimeout(300);
    const r = await openPair(n, 1);
    got.push({ label, role, lit: r.roles[r.litIdx], underline: r.underline, litIdx: r.litIdx, wantIdx: r.roles.indexOf(role) });
    await closeCard();
  }
  if (got[0].litIdx !== got[1].litIdx) { k4Witness = n; k4 = got; }
}
if (k4Witness < 0) console.log(`  --  K4 not witnessed on this zone: on each of its first ${N} pairs the opening half is the source's own place, which outranks the switch`);
else check(`K4  moving the switch moves the opening half (pair ${k4Witness + 1}): read opens the qere, written opens the ketiv, the underline under each`,
  k4.every((x) => x.litIdx === x.wantIdx && x.underline === x.litIdx), k4.map((x) => `${x.label}: lit ${x.lit}, underline ${x.underline}`).join(" · "));

// K5
const heAfter = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb.kq")].map((w) => w.querySelector(".w").textContent));
check("K5  the Hebrew of every pair never changed by a byte", heAfter.length === heBefore.length && heAfter.every((t, i) => t === heBefore[i]));

// K6 — the other form's pill
await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
const before6 = await openPair(0, 0);
const other6 = before6.litIdx === 0 ? 1 : 0;
await p.evaluate((j) => { document.querySelectorAll("#hud .b-q .s-pills button")[j].click(); }, other6);
await p.waitForTimeout(900);
const flipped6 = await p.evaluate(() => {
  const w = document.querySelectorAll("section.seg .he-text .wb.kq")[0];
  const hud = document.getElementById("hud");
  const segs = [...hud.querySelectorAll(".head b > span:not(.mq)")];
  const lit = segs.findIndex((s) => !s.style.color && s.style.fontWeight !== "400");
  const pills = [...hud.querySelectorAll(".b-q .s-pills button")].map((q) => q.getAttribute("aria-pressed") === "true");
  const halves = [...w.querySelectorAll(".wr")];
  return { open: !hud.hidden, segs: segs.length, lit, pressed: pills.indexOf(true), pills: pills.length, on: halves.findIndex((x) => x.classList.contains("on")),
    underline: halves.findIndex((x) => x.classList.contains("backs-en")), line: ((w.querySelector(":scope > .g") || {}).textContent || "").replace(/\s+/g, " ").trim(),
    resetSays: (document.getElementById("resetState") || {}).textContent };
});
check("K6  pressing the other form's pill keeps the one card, lights that form in the head, presses its pill and moves the open mark",
  flipped6.open && flipped6.segs === 2 && flipped6.lit === other6 && flipped6.pills === 2 && flipped6.pressed === other6 && flipped6.on === other6,
  `lit ${flipped6.lit} · pressed ${flipped6.pressed} · on ${flipped6.on} · wanted ${other6}`);
check("K6  the line's underline and its English stayed where they were, and nothing was counted as a pick", flipped6.underline === before6.litIdx && flipped6.line === before6.line && !/picked/u.test(flipped6.resetSays || ""),
  `underline ${flipped6.underline} · wanted ${before6.litIdx} · line "${flipped6.line}" was "${before6.line}" · reset says "${flipped6.resetSays}"`);
await closeCard();
const again6 = await openPair(0, 0);
check("K6  closed and opened again, the pair opens on the half the line reads from", again6.litIdx === before6.litIdx, `lit ${again6.litIdx} · wanted ${before6.litIdx}`);

// K7 — a reading on the form the card moved to
await p.evaluate((j) => { document.querySelectorAll("#hud .b-q .s-pills button")[j].click(); }, other6);
await p.waitForTimeout(900);
await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
const ruled7 = await p.evaluate(async () => {
  const wait = (ms) => new Promise((x) => setTimeout(x, ms));
  const pill = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((x) => x.getAttribute("aria-pressed") !== "true");
  if (!pill) return { err: "no second reading to press on this form" };
  const text = pill.textContent.trim(); pill.click(); await wait(900);
  const w = document.querySelectorAll("section.seg .he-text .wb.kq")[0];
  const halves = [...w.querySelectorAll(".wr")];
  const c = (w.querySelector(":scope > .g") || document.createElement("i")).cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return { text, line: c.textContent.replace(/\s+/g, " ").trim(), underline: halves.findIndex((x) => x.classList.contains("backs-en")), on: halves.findIndex((x) => x.classList.contains("on")), resetSays: (document.getElementById("resetState") || {}).textContent };
});
const fold = (t) => String(t).replace(/\.$/u, "").trim().toLowerCase();
check("K7  a reading pressed on the form the card moved to rules that form: the line reads it, the underline moves to that half, and it counts as a pick",
  !ruled7.err && fold(ruled7.line) === fold(ruled7.text) && ruled7.underline === other6 && ruled7.on === other6 && ruled7.resetSays !== "default",
  ruled7.err ? ruled7.err : `pressed "${ruled7.text}" · line "${ruled7.line}" · underline ${ruled7.underline} · on ${ruled7.on} · wanted ${other6} · reset says "${ruled7.resetSays}"`);
await closeCard();
const again7 = await openPair(0, 0);
check("K7  closed and opened again, the pair opens on the ruled half", again7.litIdx === other6, `lit ${again7.litIdx} · wanted ${other6}`);
await closeCard();
await p.click("#resetPill"); await p.waitForTimeout(900);
const after7 = await openPair(0, 0);
check("K7  reset puts the line back: the pair opens on the switch's half again", after7.litIdx === before6.litIdx && after7.line === before6.line, `lit ${after7.litIdx} · wanted ${before6.litIdx} · line "${after7.line}"`);
await closeCard();

// K8 — a pair inside a chain the page holds apart
const inRun = await p.evaluate(() => { const w = document.querySelector("section.seg .he-text .wjoin .wb.kq"); return w ? [...document.querySelectorAll("section.seg .he-text .wb.kq")].indexOf(w) : -1; });
if (inRun < 0) console.log("  --  K8 not witnessed on this zone: no pair stands inside a chain");
else {
  await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
  const r8 = await openPair(inRun, 0);
  const other8 = r8.litIdx === 0 ? 1 : 0;
  const runLine = () => p.evaluate((n) => { const w = document.querySelectorAll("section.seg .he-text .wb.kq")[n]; const run = w.closest(".wjoin"); const g = run.querySelector(":scope > .g"); const c = (g || document.createElement("i")).cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, " ").trim(); }, inRun);
  const line8a = await runLine();
  await p.evaluate((j) => { document.querySelectorAll("#hud .b-q .s-pills button")[j].click(); }, other8);
  await p.waitForTimeout(900);
  const moved8 = await p.evaluate((n) => { const w = document.querySelectorAll("section.seg .he-text .wb.kq")[n]; const hud = document.getElementById("hud"); const segs = [...hud.querySelectorAll(".head b > span:not(.mq)")]; const halves = [...w.querySelectorAll(".wr")];
    return { open: !hud.hidden, formRow: hud.querySelectorAll(".b-q .s-pills button").length, chainRow: hud.querySelectorAll(".b-chain-cell button").length, lit: segs.findIndex((s) => !s.style.color && s.style.fontWeight !== "400"), underline: halves.findIndex((x) => x.classList.contains("backs-en")) }; }, inRun);
  const line8b = await runLine();
  check("K8  a pair inside a chain opens with its own form row, and a form press moves the card and not the chain's line",
    r8.open && r8.formPills.length === 2 && moved8.open && moved8.formRow === 2 && moved8.chainRow === 0 && moved8.lit === other8 && moved8.underline === r8.litIdx && line8b === line8a,
    `form pills ${r8.formPills.length} · after the press: lit ${moved8.lit} (wanted ${other8}), underline ${moved8.underline} (wanted ${r8.litIdx}), chain row ${moved8.chainRow} · chain's line "${line8b}" was "${line8a}"`);
  await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
  const ruled8 = await p.evaluate(async () => { const wait = (ms) => new Promise((x) => setTimeout(x, ms)); const pill = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((x) => x.getAttribute("aria-pressed") !== "true"); if (!pill) return { err: "no second reading on this form" }; const text = pill.textContent.trim(); pill.click(); await wait(900); return { text }; });
  const line8c = await runLine();
  check("K8  a reading pressed on the moved-to form reaches the chain's line", !ruled8.err && fold(line8c).includes(fold(ruled8.text)), ruled8.err ? ruled8.err : `pressed "${ruled8.text}" · chain's line "${line8c}"`);
  await closeCard();
  await p.click("#resetPill"); await p.waitForTimeout(900);
}

// K9 — the switch moved while the card stands on the other form (on the K4 witness)
if (k4Witness < 0) console.log("  --  K9 not witnessed on this zone: no pair's opening half is the switch's to move");
else {
  await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
  const r9 = await openPair(k4Witness, 0);
  const other9 = r9.litIdx === 0 ? 1 : 0;
  await p.evaluate((j) => { document.querySelectorAll("#hud .b-q .s-pills button")[j].click(); }, other9);
  await p.waitForTimeout(900);
  await setSwitch("read (qere)"); await p.waitForTimeout(600);
  const s9 = await p.evaluate((n) => { const w = document.querySelectorAll("section.seg .he-text .wb.kq")[n]; const hud = document.getElementById("hud"); const segs = [...hud.querySelectorAll(".head b > span:not(.mq)")]; const halves = [...w.querySelectorAll(".wr")]; const pills = [...hud.querySelectorAll(".b-q .s-pills button")].map((q) => q.getAttribute("aria-pressed") === "true");
    return { open: !hud.hidden, lit: segs.findIndex((s) => !s.style.color && s.style.fontWeight !== "400"), pressed: pills.indexOf(true), underline: halves.findIndex((x) => x.classList.contains("backs-en")) }; }, k4Witness);
  check("K9  the switch moved while the card stands on the other form: the card stays where it is and the line's underline follows the switch",
    s9.open && s9.lit === other9 && s9.pressed === other9 && s9.underline === r9.roles.indexOf("QERE"),
    `open ${s9.open} · lit ${s9.lit} · pressed ${s9.pressed} (wanted ${other9}) · underline ${s9.underline} (wanted ${r9.roles.indexOf("QERE")})`);
  await closeCard();
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
