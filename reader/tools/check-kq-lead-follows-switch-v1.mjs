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
//       sets them), pressing EITHER half of a pair opens ONE card that
//       carries both halves as pills, with the switch's half pressed — or,
//       where the switch's half has no reading and the line fell back, the
//       card says so in words; the underline on the line sits under the
//       same half the card is about
//   K3  pressing the other half ON THE CARD keeps the one card, flips the
//       pressed pill, and moves the line's underline with it, and the card
//       says the reader pressed it here
//   K4  moving the switch forgets that press: the pair opens on the switch's
//       half again
//   K5  the Hebrew of every pair never changed by a byte through all of it
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
    const pills = [...hud.querySelectorAll(".b-q .kq-pills button")];
    const pressed = pills.filter((x) => x.getAttribute("aria-pressed") === "true");
    const label = (hud.querySelector(".b-q .r-label") || {}).textContent || "";
    const headSegs = [...hud.querySelectorAll(".head b span:not(.mq)")].map((s) => ({ t: s.textContent, lit: !s.style.color }));
    const halves = [...w.querySelectorAll(".wr")];
    return {
      open: !hud.hidden, pills: pills.length, pressedRole: pressed.length === 1 ? pressed[0].dataset.role : null,
      pressedIdx: pressed.length === 1 ? pills.indexOf(pressed[0]) : -1,
      firstPillRole: pills[0] ? pills[0].dataset.role : null,
      label, headLit: headSegs.filter((s) => s.lit).length, headSegs: headSegs.length,
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
      const fell = /has no reading here/.test(r.label);
      const okRole = r.pressedRole === want || (fell && r.pressedRole && r.pressedRole !== want);
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · one card, both halves as pills, the switch's half pressed`,
        r.open && r.pills === 2 && okRole && r.headSegs === 2 && r.headLit === 1,
        `pressed ${r.pressedRole} · wanted ${want}${fell ? " (fell back, said so)" : ""} · pills ${r.pills} · line "${r.line.slice(0, 30)}"`);
      const idx = r.pressedIdx;
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · the underline and the open mark sit under the half the card is about`,
        idx >= 0 && r.underline === idx && r.on === idx, `underline ${r.underline} · on ${r.on} · pressed ${idx}`);
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · the card says why this half opened`,
        /as the pairs switch says|has no reading here|you ruled on it/.test(r.label), r.label.slice(0, 80));
      await closeCard();
    }
  }
}

// K3 — under "written", press the other half on the card at pair 1
await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
const first = await openPair(0, 0);
const otherIdx = first.pressedIdx === 0 ? 1 : 0;
await p.evaluate((j) => { document.querySelectorAll("#hud .b-q .kq-pills button")[j].click(); }, otherIdx);
await p.waitForTimeout(900);
const flipped = await p.evaluate(() => {
  const w = document.querySelectorAll("section.seg .he-text .wb.kq")[0];
  const hud = document.getElementById("hud");
  const pills = [...hud.querySelectorAll(".b-q .kq-pills button")];
  const pressed = pills.findIndex((x) => x.getAttribute("aria-pressed") === "true");
  const halves = [...w.querySelectorAll(".wr")];
  return { open: !hud.hidden, pills: pills.length, pressed, label: (hud.querySelector(".b-q .r-label") || {}).textContent || "",
    underline: halves.findIndex((x) => x.classList.contains("backs-en")), line: ((w.querySelector(":scope > .g") || {}).textContent || "").replace(/\s+/g, " ").trim() };
});
check("K3  pressing the other half on the card keeps the one card and flips the pressed pill",
  flipped.open && flipped.pills === 2 && flipped.pressed === otherIdx, `pressed ${flipped.pressed} · wanted ${otherIdx}`);
check("K3  the line's underline moved to the half the card is now about", flipped.underline === otherIdx, `underline ${flipped.underline}`);
check("K3  the card says the reader pressed it here", /because you pressed it/.test(flipped.label), flipped.label.slice(0, 80));
await closeCard();
const again = await openPair(0, 0);
check("K3  reopened at the same place, the pair still opens on the pressed half", again.pressedIdx === otherIdx, `pressed ${again.pressedIdx}`);
await closeCard();

// K4
await setSwitch("read (qere)"); await p.waitForTimeout(300);
await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
const reset = await openPair(0, 1);
check("K4  moving the switch forgets the press: the pair opens on the switch's half again",
  reset.pressedRole === "KETIV" || /has no reading here/.test(reset.label), `pressed ${reset.pressedRole} · ${reset.label.slice(0, 60)}`);
await closeCard();

// K5
const heAfter = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb.kq")].map((w) => w.querySelector(".w").textContent));
check("K5  the Hebrew of every pair never changed by a byte", heAfter.length === heBefore.length && heAfter.every((t, i) => t === heBefore[i]));

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
