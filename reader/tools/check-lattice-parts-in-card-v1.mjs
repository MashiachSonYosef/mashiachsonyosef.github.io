#!/usr/bin/env node
// GUARDS: lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store
//
// THE PARTS BAND, PRESSED. The projection check reads this rule out of the
// tool and out of the zones; this one opens the page and presses the word.
//
// Where the catalog answers a word neither under its form nor under its
// headword, the card shows the word's own pieces — prefix, core, suffix —
// each with its role and with BOTH witnesses' English, named and licensed.
// What it must never do is put a definition on the LINE: a reading composed
// here out of pieces would be this lane supplying the displayed answer for a
// key no source answered, which the frame's folded-edge rule forbids and
// which its own ruling calls a finding, not an error.
//
// That last clause is the reason this file exists as a browser check and not
// a grep. "The line stays bare" is a fact about what a reader sees, and the
// only way to know it is to look.
//
//   P1  the band draws on a word the catalog answers nothing for
//   P2  every piece prints its role, and where the two witnesses differ both
//       readings print, neither chosen
//   P3  the band names both witnesses and prints the licence they stand under
//   P4  THE LINE STAYS BARE: the line under that word says no reading is in
//       the catalog, and carries no English the band composed
//   P5  a word the catalog does answer carries no band at all
//
// Runs against the zone on disk that carries the most parts; SKIPS by name
// when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

// the zone with the most parts, so a failure is not a story about one word
let ZONE = null, best = 0;
for (const z of zonesOnDisk()) {
  let s;
  try { s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")); } catch { continue; }
  let n = 0;
  for (const sec of s.sections || []) for (const w of sec.words || []) if (w.pc) n += 1;
  if (n > best) { best = n; ZONE = z; }
}
if (!ZONE) { console.log("SKIPPED — no zone on disk carries a word's parts, so check-lattice-parts-in-card-v1 has nothing to press"); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
console.log(`— ${ZONE} · ${best} word${best === 1 ? "" : "s"} the catalog answers nothing for —`);

// Where the parts sit, asked of the zone the page itself loaded rather than
// of the file: what is checked is what was served.
const sites = await p.evaluate(() => {
  const z = window.__zone; if (!z) return null;
  const out = [];
  for (const s of z.sections || []) {
    const on = (s.words || []).filter((w) => !w.mark);
    on.forEach((w, i) => { if (w.pc) out.push({ ref: s.label, ix: i, n: w.pc.length, pc: w.pc }); });
  }
  return out;
});
if (!sites || !sites.length) {
  check("the page serves the parts the zone carries", false, sites ? "the served zone carries none" : "the page exposes no zone to ask");
  await b.close(); process.exit(1);
}
// the richest word, so every clause of the rule has something to stand on
const pick = sites.slice().sort((a, x) => x.n - a.n)[0];

// A WORD OPENS ON THE PIECE THAT WAS PRESSED, NOT ON ITS BOX. A pair's halves
// and a joined word's atoms each carry their own listener, so pressing the
// block around them reaches nothing. The targets are the regions where there
// are regions and the block where there are none — the same list the page
// wires.
const press = async (ref, ix) => p.evaluate(([lab, i]) => {
  const s = [...document.querySelectorAll("section.seg")].find((x) => x.textContent.trimStart().startsWith(lab));
  if (!s) return { err: "the section is not rendered" };
  s.scrollIntoView({ block: "center" });
  const targets = [...s.querySelectorAll(".wb")].filter((e) => !e.classList.contains("mark"))
    .flatMap((wb) => { const rs = [...wb.querySelectorAll(".wr")]; return rs.length ? rs : [wb]; });
  if (!targets[i]) return { err: `the verse draws ${targets.length} pressable pieces, wanted the one at ${i}` };
  targets[i].scrollIntoView({ block: "center" });
  targets[i].click();
  return { ok: true };
}, [ref, ix]);

await press(pick.ref, pick.ix);
await p.waitForTimeout(400);
const r = await press(pick.ref, pick.ix);   // twice: the first scroll renders the verse
await p.waitForTimeout(2500);
if (r.err) { check("the word opens", false, r.err); await b.close(); process.exit(1); }

const card = await p.evaluate(() => {
  const box = document.querySelector("#hud .parts");
  if (!box) return { drawn: false, line: (document.querySelector("#hud .r-now") || {}).textContent || "" };
  const pieces = [...box.querySelectorAll(".pb")].map((e) => ({
    role: (e.querySelector(".prole") || {}).textContent || "",
    he: (e.querySelector(".pw") || {}).textContent || "",
    en: [...e.querySelectorAll(".pen")].map((x) => ({ wit: (x.querySelector(".pwit") || {}).textContent || "", t: x.textContent.replace(/^[TM]/, "").trim() })),
  }));
  const foot = box.querySelector(".parts-src");
  return {
    drawn: true,
    said: (box.querySelector(".parts-say") || {}).textContent || "",
    pieces,
    foot: foot ? foot.textContent.replace(/\s+/g, " ").trim() : "",
    chips: foot ? [...foot.querySelectorAll(".lic-chip")].map((c) => c.textContent.trim()) : [],
    line: (document.querySelector("#hud .r-now") || {}).textContent || "",
    hud: document.querySelector("#hud").textContent.replace(/\s+/g, " "),
  };
});

check("P1  the band draws on a word the catalog answers nothing for",
  card.drawn && card.pieces.length === pick.n,
  card.drawn ? `${pick.ref} · ${card.pieces.length} of ${pick.n} pieces drawn` : `${pick.ref} · no band`);

if (card.drawn) {
  const rolesOk = card.pieces.every((x) => x.role.trim().length > 0);
  const expectBoth = pick.pc.filter((x) => x.t && x.m && x.t !== x.m).length;
  const gotBoth = card.pieces.filter((x) => x.en.length === 2).length;
  check("P2  every piece prints its role, and where the witnesses differ both readings print",
    rolesOk && gotBoth === expectBoth,
    `${card.pieces.map((x) => x.role).join(" + ")} · ${gotBoth} of ${expectBoth} pieces carry two readings`);

  // The two witnesses are named by their own labels off the receipt, and the
  // licence is the posture record's name for what they were released under.
  // A band that showed English without saying whose it is would be this lane
  // asserting a reading.
  check("P3  the band names both witnesses and prints the licence they stand under",
    /STEP Bible/i.test(card.foot) && /MACULA/i.test(card.foot) && card.chips.length >= 1,
    `${card.foot.slice(0, 120)}`);

  // THE LINE. Nothing the band says may reach it — not a piece, not a join.
  const joined = pick.pc.map((x) => x.t || x.m).filter(Boolean).join(" ");
  const lineHasAPiece = pick.pc.some((x) => (x.t && card.line.includes(x.t)) || (x.m && card.line.includes(x.m)));
  check("P4  the line stays bare: it says no reading is in the catalog, and carries nothing the band composed",
    /no reading in the catalog/i.test(card.hud) && !card.line.includes(joined) && !lineHasAPiece,
    `line: "${card.line.replace(/\s+/g, " ").trim().slice(0, 80)}"`);
}

// And the other way: a word the catalog DOES answer carries no band, or the
// rule would be "every word gets pieces", which is a different rule and one
// this lane did not make.
const answered = await p.evaluate(() => {
  const z = window.__zone;
  for (const s of z.sections || []) {
    const on = (s.words || []).filter((w) => !w.mark);
    for (let i = 0; i < on.length; i += 1) {
      const w = on[i];
      if (w.pc) continue;
      const ks = w.w ? w.w.map((x) => x.k).filter(Boolean) : (w.k ? [w.k] : []);
      if (ks.some((k) => z.gloss && z.gloss[k])) return { ref: s.label, ix: i };
    }
  }
  return null;
});
if (answered) {
  await press(answered.ref, answered.ix);
  await p.waitForTimeout(400);
  await press(answered.ref, answered.ix);
  await p.waitForTimeout(2000);
  const none = await p.evaluate(() => !document.querySelector("#hud .parts"));
  check("P5  a word the catalog answers carries no band at all", none, `${answered.ref} word ${answered.ix}`);
} else {
  check("P5  a word the catalog answers carries no band at all", true, "this zone has no answered word to press");
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
