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
//       half the card is about. Nothing else on the card changes.
//   K3  pressing the other half in the head keeps the one card, lights it
//       instead, and moves the line's underline with it
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
    const headSegs = [...hud.querySelectorAll(".head b span:not(.mq)")].map((s) => ({ t: s.textContent, lit: !s.style.color, pressable: s.getAttribute("role") === "button" }));
    const halves = [...w.querySelectorAll(".wr")];
    const litIdx = headSegs.findIndex((s) => s.lit);
    const roleLine = (hud.querySelector(".head .kq-role") || {}).textContent || "";
    return {
      open: !hud.hidden, litIdx, headLit: headSegs.filter((s) => s.lit).length, headSegs: headSegs.length,
      otherPressable: headSegs.some((s) => !s.lit && s.pressable),
      litRole: roleLine.startsWith("ketiv") ? "KETIV" : roleLine.startsWith("qere") ? "QERE" : null,
      extras: hud.querySelectorAll(".b-q *").length,
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
      check(`K2  ${label} · pair ${n + 1} half ${h + 1} · nothing was added to the card for this; the other half is pressable where it stands`,
        r.extras === 0 && r.otherPressable, `extras ${r.extras} · pressable ${r.otherPressable}`);
      await closeCard();
    }
  }
}

// K3 — under "written", press the other half in the head at pair 1
await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
const first = await openPair(0, 0);
const otherIdx = first.litIdx === 0 ? 1 : 0;
await p.evaluate((j) => { document.querySelectorAll("#hud .head b span:not(.mq)")[j].click(); }, otherIdx);
await p.waitForTimeout(900);
const flipped = await p.evaluate(() => {
  const w = document.querySelectorAll("section.seg .he-text .wb.kq")[0];
  const hud = document.getElementById("hud");
  const segs = [...hud.querySelectorAll(".head b span:not(.mq)")];
  const lit = segs.findIndex((s) => !s.style.color);
  const halves = [...w.querySelectorAll(".wr")];
  return { open: !hud.hidden, segs: segs.length, lit,
    underline: halves.findIndex((x) => x.classList.contains("backs-en")), line: ((w.querySelector(":scope > .g") || {}).textContent || "").replace(/\s+/g, " ").trim() };
});
check("K3  pressing the other half in the head keeps the one card and lights that half instead",
  flipped.open && flipped.segs === 2 && flipped.lit === otherIdx, `lit ${flipped.lit} · wanted ${otherIdx}`);
check("K3  the line's underline moved to the half the card is now about", flipped.underline === otherIdx, `underline ${flipped.underline}`);
await closeCard();
const again = await openPair(0, 0);
check("K3  reopened at the same place, the pair still opens on the pressed half", again.litIdx === otherIdx, `lit ${again.litIdx}`);
await closeCard();

// K4
await setSwitch("read (qere)"); await p.waitForTimeout(300);
await setSwitch("written (ketiv)"); await p.waitForTimeout(300);
const reset = await openPair(0, 1);
check("K4  moving the switch forgets the press: the pair opens on the switch's half again",
  reset.litIdx === reset.roles.indexOf("KETIV") || reset.litIdx === reset.underline, `lit ${reset.roles[reset.litIdx]}`);
await closeCard();

// K5
const heAfter = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb.kq")].map((w) => w.querySelector(".w").textContent));
check("K5  the Hebrew of every pair never changed by a byte", heAfter.length === heBefore.length && heAfter.every((t, i) => t === heBefore[i]));

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
