#!/usr/bin/env node
// GUARDS: color-channel-rule-v2-the-materials-are-the-ledgers-the-channels-are-the-owners-ruling-and-the-values-are-ours
//
// The page paints the channels the contract records, and this reads the
// contract to find out what they are.
//
// A channel is not a decoration: it says who is speaking. The corpus speaks in
// tola'at shani, the reading offered for one of its words speaks in tekhelet
// because a dictionary said it and not the source, and this project speaks in
// argaman. Gold is the frame around any of them, and gold at its amber value
// is the reader's own hand on it.
//
// WHAT THIS CHECK STOPPED ASSERTING, AND WHY.
// Under v1 the load-bearing assertion was that structure and reader selection
// were more than 60 degrees apart on the wheel — written when one gold was
// doing both jobs and nothing looked different because you had chosen it. v2
// repeals that on the owner's ruling of 2026-09-10: gold is not a final color,
// it is the in-process one, and a selection is the most in-process thing on
// the page, so the two are deliberately one family now. Deleting the assertion
// and putting nothing in its place would have left the original fault
// unguarded, so it is replaced by the thing v2 actually claims — that a
// selection is known by BEHAVING like one. It appears under the reader's hand
// and it leaves when the hand does, and what a reader sees come to rest is
// never gold. That is asserted below by clicking a word and letting it go.
//
// In exchange the check got stricter where v2 is stricter: the three final
// channels must be mutually far apart, so a reader can always tell the corpus
// from a dictionary from us.
//
// What is checked is the channel, never the value. Exodus names tekhelet,
// argaman, tola'at shani and shesh over and over and never says what any of
// them looked like; the hexes are this page's and always were.
//
// Run: node tools/check-color-channels-v1.mjs [url]

import { readFileSync, existsSync } from "node:fs";
import { zonesWithCommentary } from "./zones-on-disk-v1.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RECORD = join(HERE, "..", "data", "color-contract-v1.json");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(RECORD)) {
  console.log("SKIPPED — no color contract record is here (data/color-contract-v1.json)");
  process.exit(3);
}
const contract = JSON.parse(readFileSync(RECORD, "utf8"));
const channels = contract.channels || {};

// The record must say what it replaced and what moved. v1 gave selection to
// electric blue; v2 moved it, and a move that does not say where it came from
// is a value quietly changing its mind.
{
  check("the record names what it supersedes", typeof contract.supersedes === "string" && contract.supersedes.includes("colour-role-rule-v1"));
  check("the ruling says who decided the channels, not just what they are",
    !!(contract.who_decided_what && contract.who_decided_what.the_owner && contract.who_decided_what.the_ledger));
  check("the channel that moved off its v1 value says where it moved from",
    typeof (channels.reader_selection || {}).moved_from === "string");
  // the fixture this all descends from still has to agree about structure,
  // which is the one channel v2 did not touch
  const LEDGER = join(HERE, "..", "data", "y-genesis-navigation-v1.js");
  if (existsSync(LEDGER)) {
    const m = readFileSync(LEDGER, "utf8").match(/"color_contract":(\{[^}]*\})/);
    if (m) {
      const old = JSON.parse(m[1]);
      // The fixture's two surfaces described the tent's dark face, which this
      // edition dropped on 2026-09-10. They cannot be carried forward against
      // a face that does not exist, and quietly dropping the comparison would
      // read as though it still passed. So the surviving half is asserted, and
      // the other half is stated as retired rather than deleted.
      check("the fixture's structure role is carried forward unchanged",
        old.structure === (channels.structure || {}).material,
        `fixture ${old.structure} vs contract ${(channels.structure || {}).material}`);
      const retired = [old.base_surface, old.commentary_surface].filter(Boolean);
      console.log(`  --    the fixture's surfaces (${retired.join(", ")}) described the dark face, `
        + `dropped ${contract.faces.dropped_on}; there is no face left to carry them onto`);
    }
  }
}

// What each material the contract names means as a measurement. Hue is degrees
// on the wheel; lightness separates a brown from a gold and an argaman ink
// from the argaman ground, which are the same angle.
const FAMILY = {
  "gold": { hue: [35, 60], minSat: 0.25, light: [0.30, 0.85] },
  // amber is allowed darker than gold, and on the day face it has to be: a
  // selection is normal-size text and holds the 4.5 floor on linen, where
  // structure sits at display sizes and holds 4. So the value that keeps the
  // selection legible is the same value that holds it apart from the frame.
  "gold, at its amber value": { hue: [35, 60], minSat: 0.25, light: [0.26, 0.85] },
  "tola'at shani": { hue: [-15, 25], minSat: 0.20, light: [0.25, 0.75] },
  "tekhelet": { hue: [185, 235], minSat: 0.25, light: [0.30, 0.85] },
  // the field ink is argaman too, brought down to a neutral, so the box has
  // to reach the light end where the night face writes
  "argaman": { hue: [250, 320], minSat: 0.15, light: [0.30, 0.92] },
  // the grounds, which are surfaces and not channels
  "purple": { hue: [250, 320], minSat: 0.05, light: [0.01, 0.30] },
  "brown": { hue: [15, 50], minSat: 0.05, light: [0.01, 0.30] },
  "linen": { hue: [30, 60], minSat: 0.03, light: [0.82, 0.97] },
  "parchment": { hue: [30, 60], minSat: 0.03, light: [0.76, 0.95] },
};

const rgb = (s) => {
  const p = String(s).match(/(\d+(?:\.\d+)?)/g);
  return p && p.length >= 3 ? p.slice(0, 3).map(Number) : null;
};
const hsl = ([r, g, b]) => {
  const R = r / 255, G = g / 255, B = b / 255;
  const mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn;
  const l = (mx + mn) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (mx === R) h = 60 * (((G - B) / d) % 6);
    else if (mx === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: sat, l };
};
const inFamily = (colour, name) => {
  const c = rgb(colour); if (!c) return { ok: false, why: "unreadable" };
  const { h, s, l } = hsl(c);
  const f = FAMILY[name]; if (!f) return { ok: false, why: `no measurement declared for "${name}"` };
  const lo = f.hue[0], hi = f.hue[1];
  const hueOk = lo < 0 ? (h >= 360 + lo || h <= hi) : (h >= lo && h <= hi);
  const ok = hueOk && s >= f.minSat && l >= f.light[0] && l <= f.light[1];
  return { ok, why: `hue ${h.toFixed(0)}° sat ${s.toFixed(2)} light ${l.toFixed(2)}` };
};
// CIE L*, because a ground has to be judged by how big a STEP it makes and a
// contrast ratio cannot say that. A ratio is built for reading text off a
// background, and it compresses hard at the dark end: the same ratio is a
// different amount of visible change on linen than it is on the tent's ground,
// which is exactly what left the two faces not matching when they were tuned
// to the same ratio. L* is perceptually even, so one number means one thing on
// both faces. About 1 unit is a just-noticeable difference.
const Lstar = (c) => {
  const lin = (v) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  const y = 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
};
const alphaOf = (c) => { const m = String(c).match(/[\d.]+/gu); return m && m.length > 3 ? Number(m[3]) : 1; };
// shortest way round the wheel
const apartOn = (a, c) => { const d = Math.abs(hsl(a).h - hsl(c).h) % 360; return Math.min(d, 360 - d); };

// One representative of each channel, taken off the live page. A channel with
// no bearer on this zone is said to be absent, never scored as a fault.
const SAMPLE = {
  text_as_written: ["section.seg .he-text .wb:not(.active):not(.chosen) .w", "backgroundColor"],
  reading_as_shown: ["section.seg .he-text .g:not(.bare)", "backgroundColor"],
  // the inks, kept beside the washes: every glyph is argaman now, and what
  // has to be proved is that each one still reads on the ground its own
  // channel puts behind it
  text_ink: ["section.seg .he-text .wb:not(.active):not(.chosen) .w", "color"],
  reading_ink: ["section.seg .he-text .g:not(.bare)", "color"],
  our_own_voice: ["header.top p#meta", "color"],
  structure: [".vnum", "borderColor"],
  reader_selection: [".mode-btn.on", "color"],
};
const FINAL = ["text_as_written", "reading_as_shown", "our_own_voice"];

const BASE = (process.argv[2] || "http://127.0.0.1:8899/zone.html").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${zonesOnDisk()[0]}&c=open`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(2600);

const commentaryHere = zonesWithCommentary().length > 0;
// ONE FACE since 2026-09-10. The loop is kept at one pass rather than
// unrolled, so that a second face costs one line here if one is ever
// wanted again, and so every message below still says which face it read.
for (const face of ["day"]) {
// The page turns its face over a 0.12s transition, and a fixed wait sampled
// the pressed button mid-turn when the machine was busy. What is judged is
// the face as painted, so the read waits until two frames 100ms apart paint
// the same colors, up to 3s.
await p.waitForFunction(() => new Promise((resolve) => {
  const paint = () => [document.body, document.querySelector(".mode-btn.on"), document.querySelector(".vnum")]
    .map((e) => (e ? getComputedStyle(e).backgroundColor + "/" + getComputedStyle(e).color : "")).join("|");
  const a = paint();
  setTimeout(() => resolve(paint() === a), 100);
}), null, { timeout: 3000, polling: 50 }).catch(() => console.log("  note: the face did not settle within 3s; measuring as painted now"));
console.log(`— the ${face} face, as the page paints it —`);
console.log(`  channels: ${Object.entries(channels).filter(([k]) => k !== "rule").map(([k, v]) => `${k}=${v.material}`).join(" · ")}`);

const painted = await p.evaluate((sample) => {
  const cs = (sel, prop) => { const e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : null; };
  const out = {};
  for (const [k, [sel, prop]] of Object.entries(sample)) out[k] = cs(sel, prop);
  out.base_surface = cs("body", "backgroundColor");
  out.commentary_surface = cs("section.seg .c-mark-slot:not(.c-choose)", "backgroundColor") || cs("#cIndex", "backgroundColor");
  return out;
}, SAMPLE);

// each channel wears the family its material names
for (const [key, decl] of Object.entries(channels)) {
  if (key === "rule") continue;
  const got = painted[key];
  if (!got) { check(`  ${key.replace(/_/gu, " ")} is painted at all`, false, "nothing on this page carries it"); continue; }
  const r = inFamily(got, decl.material);
  check(`  ${key.replace(/_/gu, " ")} is ${decl.material}`, r.ok, `${got} · ${r.why}`);
}
// the two grounds
for (const [key, name] of [["base_surface", contract.faces[face].base_surface], ["commentary_surface", contract.faces[face].commentary_surface]]) {
  const got = painted[key];
  if (!got) {
    if (!commentaryHere && key === "commentary_surface") { console.log(`  --    ${key}: no served work carries a commentary, so it has nothing to check against`); continue; }
    check(`  ${key.replace(/_/gu, " ")} is painted at all`, false, "nothing on the page carries it"); continue;
  }
  const r = inFamily(got, name);
  check(`  the ${key.replace(/_/gu, " ")} is ${name}`, r.ok, `${got} · ${r.why}`);
}

// WHO IS SPEAKING — the three final channels must be mutually far apart, so a
// reader can always tell the corpus from a dictionary from us. This is the
// assertion v2 added in exchange for the one it repealed.
// Two inks are distinguishable if they are far apart on the wheel OR if one is
// saturated and the other is not. The second clause is not a loophole, it is
// the design: our own voice is the page's field, argaman held down to a
// neutral, and a reader tells it from a channel precisely BECAUSE it is not
// insisting on a color. Hue alone called a grey and a blue confusable at 46
// degrees, which no eye ever would.
for (let i = 0; i < FINAL.length; i += 1) for (let j = i + 1; j < FINAL.length; j += 1) {
  const a = rgb(painted[FINAL[i]]), c = rgb(painted[FINAL[j]]);
  const d = a && c ? apartOn(a, c) : 0;
  const ds = a && c ? Math.abs(hsl(a).s - hsl(c).s) : 0;
  check(`  ${FINAL[i].replace(/_/gu, " ")} and ${FINAL[j].replace(/_/gu, " ")} cannot be confused`,
    d >= 45 || ds >= 0.30,
    `${d.toFixed(0)} degrees apart, saturation differs by ${ds.toFixed(2)} \u00b7 ${painted[FINAL[i]]} vs ${painted[FINAL[j]]}`);
}

// Legibility is attested, not assumed: WCAG relative-luminance ratios measured
// off the live page, per face, against the ground the page actually paints.
{
  const lum = ([r, g, bl]) => {
    const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : (((c + 0.055) / 1.055) ** 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const ground = rgb(painted.base_surface);
  // A WASH IS SEE-THROUGH, so what a reader's eye meets is the wash laid over
  // the ground. Composite it, then ask the two questions this design owes:
  // can the reader SEE the channel, and can they still READ the ink on it.
  // An opaque reading of a 14% wash would answer neither.
  const over = (fg, bg) => {
    const f = rgb(fg), b = rgb(bg), a = alphaOf(fg);
    if (!f || !b) return null;
    return [0, 1, 2].map((i) => Math.round(f[i] * a + b[i] * (1 - a)));
  };
  for (const [what, wash, ink] of [
    ["the corpus", painted.text_as_written, painted.text_ink],
    ["a reading", painted.reading_as_shown, painted.reading_ink],
  ]) {
    const laid = over(wash, painted.base_surface);
    if (!laid || !rgb(ink)) { check(`  ${what} carries a channel behind it`, false, `wash ${wash}, ink ${ink}`); continue; }
    // seen: the wash has to be separable from the bare ground, or it is a
    // channel nobody can perceive and the page is lying about marking anything
    // 3 L* is three times a just-noticeable difference. It is a floor and not
    // a target: both faces are tuned to about 4.5 and 5.1, which is where the
    // day face already sat when it was called right.
    const step = Math.abs(Lstar(laid) - Lstar(ground));
    check(`  ${what}'s channel is visible behind it (>= 3.0 L* against the bare ground)`,
      step >= 3.0, `${step.toFixed(2)} L* \u00b7 wash ${wash} lays down rgb(${laid.join(", ")})`);
    // read: the ink has to survive the ground its own channel puts under it
    const legible = ratio(rgb(ink), laid);
    check(`  ${what} still reads on top of its own channel (>= 4.5:1)`,
      legible >= 4.5, `${legible.toFixed(1)}:1 \u00b7 ${ink} on rgb(${laid.join(", ")})`);
  }
  for (const [what, colour, floor] of [
    // our own voice runs small and italic in several places, so it is held to
    // the normal-text floor rather than the large-text one
    ["our own voice on the ground", painted.our_own_voice, 4.5],
    ["the selection on the ground", painted.reader_selection, 4.5],
    // structure is line work now, so it is held to the floor a rule has to
    // clear to be seen (3:1) rather than the one a paragraph has to clear to
    // be read. It got brighter when it stopped being text, and this is the
    // number that says brighter was allowed.
    ["structure, as a rule on the ground", painted.structure, 3],
  ]) {
    const c = rgb(colour);
    const r2 = c && ground ? ratio(c, ground) : 0;
    check(`  ${what} reads (>= ${floor}:1)`, r2 >= floor, `${r2.toFixed(1)}:1`);
  }
}
if (commentaryHere) {
  const a = rgb(painted.base_surface), c = rgb(painted.commentary_surface);
  const apart = a && c && a.some((x, i) => Math.abs(x - c[i]) >= 3);
  check("  a commentary does not sit on the text's own surface", apart,
    `${painted.base_surface} vs ${painted.commentary_surface}`);
}
}


// GOLD IS THREAD, AND A THREAD HAS NO SURFACE. Exodus 39:3 is the whole of
// this one: they beat the gold into thin plates and cut it into threads, to
// work it into the tekhelet, into the argaman, into the tola'at shani and into
// the shesh. Worked INTO the dyed cloth — never laid over it. So gold may be a
// hairline, a rule, an underline, a caret or an ink, and it may never be a
// filled ground. The moment it has a surface it has stopped being thread, and
// the page is back to a gold that means whatever it is sitting on.
{
  const grounds = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll("body *")) {
      const bg = getComputedStyle(e).backgroundColor;
      const m = String(bg).match(/(\d+(?:\.\d+)?)/gu);
      if (!m || m.length < 3) continue;
      const alpha = m.length > 3 ? Number(m[3]) : 1;
      if (alpha < 0.02) continue;                       // transparent is no ground
      const r = Number(m[0]), g = Number(m[1]), b = Number(m[2]);
      out.push({ bg, r, g, b, where: e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/u).join(".") : "") });
    }
    return out;
  });
  // a ground counts as gold if it lands in the gold family AND is saturated
  // enough to read as gold rather than as the warm neutral the page is written
  // on — the linen day ground is hue 41 and must not be scored as a gold fill
  const golden = grounds.filter((x) => {
    const { h, s: sat, l } = hsl([x.r, x.g, x.b]);
    return h >= 30 && h <= 62 && sat >= 0.45 && l >= 0.20 && l <= 0.80;
  });
  check("no gold is laid down as a ground \u2014 it is thread, and thread has no surface",
    golden.length === 0, golden.length ? `${golden.length} filled: ${golden.slice(0, 4).map((x) => x.where + " " + x.bg).join(" · ")}` : "checked every element on the page");

  // AND GOLD IS NEVER INK AT REST. Ruled 2026-09-10 with the field: gold is
  // rules, borders and boxes, and the only glyph it may reach is one the
  // reader is holding, which it leaves with them. So nothing on a page at rest
  // should be readable in gold. Anything the reader has hold of is skipped,
  // because that is exactly the case the rule allows.
  const restInks = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll("body *")) {
      if (e.closest('.active, .chosen, [aria-pressed="true"], [aria-expanded="true"], .on, .at, .armed')) continue;
      if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const c = getComputedStyle(e).color;
      const m = String(c).match(/(\d+(?:\.\d+)?)/gu);
      if (!m || m.length < 3) continue;
      out.push({ c, r: +m[0], g: +m[1], b: +m[2], where: e.tagName.toLowerCase() + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/u).join(".") : "") });
    }
    return out;
  });
  const goldInk = restInks.filter((x) => {
    const { h, s: sat, l } = hsl([x.r, x.g, x.b]);
    return h >= 30 && h <= 62 && sat >= 0.45 && l >= 0.20 && l <= 0.80;
  });
  check("no glyph is left gold at rest, so gold reaches a word only under the reader's hand",
    goldInk.length === 0, goldInk.length ? `${goldInk.length} in gold: ${goldInk.slice(0, 4).map((x) => x.where + " " + x.c).join(" / ")}` : "checked every text-bearing element at rest");
}

// THE SECOND FACE IS GONE, AND HAS TO BE GONE EVERYWHERE. A half-removed face
// is worse than either state: a stray data-scheme rule or a leftover button
// would paint some elements from a palette nothing else uses. So what is
// checked is the absence, not the toggle.
{
  const left = await p.evaluate(() => ({
    button: !!document.getElementById("face"),
    attr: document.documentElement.dataset.scheme || null,
    api: typeof window.__face !== "undefined",
    kept: (() => { try { return localStorage.getItem("scheme"); } catch { return null; } })(),
  }));
  check("no face button survives the second face",
    !left.button && !left.api, `button ${left.button}, window.__face ${left.api}`);
  check("nothing paints from a face the page no longer has",
    !left.attr, left.attr ? `data-scheme="${left.attr}" is still on the root` : "no data-scheme on the root");
  check("and a device that remembered a face has been let go of it",
    !left.kept, left.kept ? `localStorage still holds scheme="${left.kept}"` : "nothing kept");
  const sheet = await p.evaluate(() => [...document.querySelectorAll("style")].map((e) => e.textContent).join("\n"));
  const strays = (sheet.match(/\[data-scheme[^\]]*\]/gu) || []).length;
  check("and no rule is still written for one", strays === 0, `${strays} data-scheme rules in the stylesheet`);
}

// THE FAULT V1 EXISTED FOR, ASSERTED THE WAY V2 STATES IT. Structure and
// selection are one family now, so hue cannot tell them apart. What tells them
// apart is that a selection comes and goes: a word wears the corpus's own ink,
// wears the selection while the reader is holding it, and returns to the
// corpus's ink when the reader lets go. Nothing a reader sees settle is gold.
{
  const first = "section.seg .he-text .wb";
  const inkOf = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e.querySelector(".w") || e).color : null; }, sel);
  const atRest = await inkOf(first);
  await p.evaluate((s) => document.querySelector(s + " .w")?.click(), first);
  await p.waitForTimeout(400);
  const held = await inkOf(first);
  const selInk = await p.evaluate(() => { const e = document.querySelector(".mode-btn.on"); return e ? getComputedStyle(e).color : null; });
  check("a word changes color when the reader takes hold of it", !!atRest && !!held && atRest !== held, `${atRest} → ${held}`);
  check("and what it changes to is the selection color", held === selInk, `${held} vs the selection's ${selInk}`);
  // let go: press Escape, which the reader binds to closing the card
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  const released = await inkOf(first);
  check("and it returns to its own channel when the reader lets go", released === atRest, `${held} → ${released} (at rest it was ${atRest})`);
  // What it settles at is argaman, because every glyph on this page is. This
  // assertion used to read "the corpus's own color" and meant shani, back when
  // the ink carried the channel; the ink carries nothing now, so what has to
  // be true is narrower and stricter: it settles at the page's one ink, and
  // the channel it belongs to comes back behind it.
  const r = inFamily(atRest, "argaman");
  check("so the color it settles at is the page's one ink, never gold", r.ok, `${atRest} · ${r.why}`);
  const washBack = await p.evaluate((q) => {
    const e = document.querySelector(q);
    // the wash rides the glyph, not the block around it — same element inkOf reads
    const t = e && (e.querySelector(".w") || e);
    return t ? getComputedStyle(t).backgroundColor : null;
  }, first);
  const washOk = !!washBack && alphaOf(washBack) > 0.02;
  check("and the channel comes back behind it, having been lifted while held",
    washOk, `${washBack} behind the released word`);
}

await p.close(); await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
