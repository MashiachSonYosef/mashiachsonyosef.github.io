#!/usr/bin/env node
// GUARDS: source-switch-rule-v1-a-reading-remembers-who-carried-it
//
// THE SOURCE SWITCHES, PRESSED.
//
// The primary toggle the two lanes settled on: the source itself, each one
// removable, on every card. A source turned off is not asked — its rows never
// enter the pool — and the line under every word follows without a fetch,
// from the carriers and the alternate baked on the key. Two harms, told
// apart: a line that CHANGES because another carrier remains or an alternate
// leads, and a line that goes DARK because nobody else carries anything.
//
//   S1  the sources row is on the rail: one chip per source key, every one
//       ON, each carrying two numbers (change · dark) and its ledger ids
//   S2  the receipt's sources agree with the chips, and its counts with the
//       zone's own gloss_m (every printed reading carries its carriers)
//   S3  a source with SOLE carriage of some line, switched off: that line
//       moves to the baked alternate, the chip on the line names the
//       alternate's witness, and the card's first pill says the same
//   S4  a line the same source carries WITH another carrier does not move
//   S5  the card says how many records the switch withheld, and no pill on
//       it is carried only by the switched-off ids
//   S6  the Hebrew of the section never changed by a byte
//   S7  switched back on, the line and the pool are exactly what they were
//   S8  a key whose every carrier is off and whose alternate is absent goes
//       bare on the line, marked as the reader's own doing — found on this
//       shelf or stated absent, never assumed
//
// Runs against the first served zone whose receipt carries the switches.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

let ZONE = null, zone = null;
for (const z of zonesServed()) {
  const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
  if (s.emitted_from && s.emitted_from.toggles && s.emitted_from.toggles.sources && s.emitted_from.toggles.sources.sources) { ZONE = z; zone = s; break; }
}
if (!ZONE) { console.log("SKIPPED — no served zone carries the source switches' receipt; run tools/regloss-zone.mjs"); process.exit(3); }
const rec = zone.emitted_from.toggles.sources;

const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
console.log(`— ${ZONE} —`);

// S1
const rail = await p.evaluate(() => {
  const row = document.querySelector('.rail .row[data-toggle="sources"]'); if (!row) return null;
  const chips = [...row.querySelectorAll(".dfp")];
  return {
    dead: row.classList.contains("dead"),
    n: chips.length,
    allOn: chips.every((c) => c.getAttribute("aria-pressed") === "true"),
    withNumbers: chips.filter((c) => /\d+·\d+/u.test(c.textContent)).length,
    withIds: chips.filter((c) => /^M\d+( M\d+)*$/u.test(c.dataset.ids || "")).length,
    keys: chips.map((c) => c.dataset.key),
  };
});
const keysInReceipt = new Set(Object.values(rec.sources).map((s) => s.key || ""));
check("S1  the sources row is on the rail, every chip on, each with its two numbers and its ids",
  rail && !rail.dead && rail.n > 0 && rail.allOn && rail.withNumbers === rail.n && rail.withIds === rail.n,
  rail ? `${rail.n} chips · ${rail.withNumbers} numbered · ${rail.withIds} with ids` : "no row");
// S2
const byCount = Object.values(zone.gloss_m || {}).filter((e) => Array.isArray(e.by) && e.by.length).length;
check("S2  the receipt agrees with the chips and with gloss_m",
  rail && rail.n === keysInReceipt.size && rec.counts.keys_with_carriers === byCount && byCount > 0,
  `${rail ? rail.n : "?"} chips vs ${keysInReceipt.size} source keys · ${byCount} keys carry their carriers (receipt ${rec.counts.keys_with_carriers})`);

// pick the switch: a source key whose ids solely carry some visible line with
// a baked alternate, AND carry some other visible line with a second carrier
const visible = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb")].slice(0, 120).map((wb, i) => {
  const g = wb.querySelector(".g"); const w = wb.querySelector(".w");
  return { i, s: w ? w.textContent.trim() : "", bare: !g || g.classList.contains("bare"), regions: wb.querySelectorAll(".wr").length, line: g ? g.textContent.replace(/\s+/g, " ").trim() : "" };
}));
const kOf = (s) => { for (const sec of zone.sections) for (const w of sec.words || []) if (w.s === s) return w.k || (w.w && w.w[0] && w.w[0].k) || null; return null; };
const groups = new Map();
for (const [id, s] of Object.entries(rec.sources)) { const gk = s.key || id; if (!groups.has(gk)) groups.set(gk, []); groups.get(gk).push(id); }
let pick = null;
for (const [gk, ids] of groups) {
  const set = new Set(ids);
  let sole = null, shared = null, dark = null;
  for (const v of visible) {
    if (v.bare || v.regions > 1) continue;
    const k = kOf(v.s); const gm = k && zone.gloss_m[k]; if (!gm || !gm.by) continue;
    const all = gm.by.every((m) => set.has(m)), some = gm.by.some((m) => set.has(m));
    if (all && gm.alt && !gm.alt.by.every((m) => set.has(m)) && !sole) sole = { ...v, k, gm };
    if (all && !gm.alt && !dark) dark = { ...v, k, gm };
    if (some && !all && !shared) shared = { ...v, k, gm };
  }
  if (sole && shared) { pick = { gk, ids, sole, shared, dark }; break; }
}
check("  a source that solely carries one visible line (with an alternate) and shares another stands on the page", !!pick,
  pick ? `${pick.gk} (${pick.ids.join(" ")}) · sole: ${pick.sole.s} "${pick.sole.line}" · shared: ${pick.shared.s}` : "none in the first 120 words");
const heBefore = await p.evaluate(() => document.querySelector("section.seg .he-text").textContent);

// switch it off
const pressed = await p.evaluate((gk) => {
  const r = document.getElementById("rail"); if (r && !r.open) r.open = true;
  const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`);
  if (!btn) return false; btn.click(); return true;
}, pick ? pick.gk : "");
await p.waitForTimeout(700);
const after = await p.evaluate((idx) => idx.map((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb")[i]; const g = wb.querySelector(".g"); return { line: g.textContent.replace(/\s+/g, " ").trim(), chip: (g.querySelector(".g-lic") || {}).title || "", bare: g.classList.contains("bare") }; }), pick ? [pick.sole.i, pick.shared.i] : [0, 0]);
// S3
const altText = pick ? String(pick.sole.gm.alt.text) : "";
check("S3  the solely-carried line moved to the baked alternate, and its chip names the alternate's witness",
  pressed && pick && after[0].line.toLowerCase().startsWith(altText.toLowerCase().slice(0, 12)) && after[0].chip.includes(pick.sole.gm.alt.m.slice(0, 20)),
  pick ? `"${pick.sole.line}" -> "${after[0].line}" · alt "${altText}" · chip "${after[0].chip.slice(0, 50)}"` : "");
// S4
check("S4  the shared line did not move", pick && after[1].line === pick.shared.line && !after[1].bare, pick ? `"${pick.shared.line}" stands (carriers ${pick.shared.gm.by.join(",")})` : "");

// S5 · open the card on the moved word
await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, pick ? pick.sole.i : 0);
await p.waitForTimeout(900);
const card = await p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  const pills = h.querySelector(".r-pills");
  return { withheld: Number(pills.dataset.withheldBySources || 0), rows: Number(pills.dataset.rows || 0), note: (h.querySelector(".sources-withheld") || {}).textContent || "", first: (pills.querySelector("button") || {}).textContent || "", bys: [...pills.querySelectorAll("button")].map((x) => x.dataset.by || "") };
});
const off = new Set(pick ? pick.ids : []);
const creditsOff = card ? card.bys.filter((by) => by.split(" ").every((m) => off.has(m))).length : -1;
check("S5  the card says how many records the switch withheld, and no pill is carried only by the switched-off ids",
  card && card.withheld > 0 && /withheld by your source switch/u.test(card.note) && creditsOff === 0,
  card ? `${card.withheld} of ${card.rows} withheld · "${card.note}" · pills credited only to the off ids: ${creditsOff}` : "no card");
check("    and the card's first pill is the line", card && pick && card.first.trim().toLowerCase() === after[0].line.replace(/\s*(CC|Public|License).*$/u, "").trim().toLowerCase(), card ? `pill "${card.first}" · line "${after[0].line}"` : "");

// S6
const heAfter = await p.evaluate(() => document.querySelector("section.seg .he-text").textContent);
check("S6  the Hebrew of the section never changed by a byte", heBefore === heAfter, `${heAfter.length} characters`);

// S7 · back on
await p.evaluate(() => { const h = document.getElementById("hud"); const x = h && h.querySelector(".head button"); if (x) x.click(); });
await p.evaluate((gk) => { const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`); if (btn) btn.click(); }, pick ? pick.gk : "");
await p.waitForTimeout(700);
const back = await p.evaluate((i) => { const g = document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g"); return g.textContent.replace(/\s+/g, " ").trim(); }, pick ? pick.sole.i : 0);
const onAgain = await p.evaluate(() => [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp')].every((c) => c.getAttribute("aria-pressed") === "true"));
check("S7  switched back on, the line is what it was and every chip is on", pick && back === pick.sole.line && onAgain, pick ? `"${back}"` : "");

// S8 · the dark case, if this book has one in view
if (pick && pick.dark) {
  await p.evaluate((gk) => { const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`); if (btn) btn.click(); }, pick.gk);
  await p.waitForTimeout(700);
  const d = await p.evaluate((i) => { const g = document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g"); return { bare: g.classList.contains("bare"), line: g.textContent.trim() }; }, pick.dark.i);
  check("S8  a line whose every carrier is off and which has no alternate goes bare", d.bare && d.line === "", `${pick.dark.s} · was "${pick.dark.line}"`);
  await p.evaluate((gk) => { const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`); if (btn) btn.click(); }, pick.gk);
} else {
  console.log(`  --  S8  no visible word in the first 120 is solely carried by ${pick ? pick.gk : "the chosen source"} with no alternate — the dark case has no site here today`);
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
