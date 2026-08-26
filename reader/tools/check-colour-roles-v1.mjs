#!/usr/bin/env node
// GUARDS: colour-role-rule-v1-the-roles-are-the-ledgers-and-the-values-are-ours
//
// The page paints the roles the ledger records, and this reads the ledger to
// find out what they are.
//
// Y-GENESIS-NAVIGATION-V1 carries a color_contract: structure gold, reader
// selection electric blue, commentary attachment crimson, base surface purple,
// commentary surface brown. It is a record, not a preference, and it had been
// half-kept and half-invented: gold was on the structure, which is right, and
// also on every selection a reader made, which the contract gives to blue — so
// one colour did two jobs and the second job had none. The two surfaces were
// not painted at all. A note in the stylesheet meanwhile handed the roles out
// by itself, which is deciding a thing the record had already decided.
//
// What is checked is the role, never the value. Exodus names tekhelet,
// argaman, tola'at shani and shesh over and over and never says what any of
// them looked like; the hexes are this page's and always were. So each role is
// measured for the family the ledger names it by — an angle on the wheel, and
// for the two surfaces a darkness as well, since brown is a dark orange and
// would otherwise pass for gold.
//
// And the failure that started this is asserted directly: structure and
// selection must not be the same colour. A page where they are is a page where
// nothing looks different because you chose it.
//
// Run: node tools/check-colour-roles-v1.mjs [url]

import { readFileSync, existsSync } from "node:fs";
import { zonesWithCommentary } from "./zones-on-disk-v1.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RECORD = join(HERE, "..", "data", "colour-contract-v1.json");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(RECORD)) {
  console.log("SKIPPED — no colour contract record is here (data/colour-contract-v1.json)");
  process.exit(3);
}
const contract = JSON.parse(readFileSync(RECORD, "utf8"));
// the record names its lineage; where the old fixture is present, the roles
// it carried forward must still agree with it
{
  const LEDGER = join(HERE, "..", "data", "y-genesis-navigation-v1.js");
  if (existsSync(LEDGER)) {
    const m = readFileSync(LEDGER, "utf8").match(/"color_contract":(\{[^}]*\})/);
    if (m) {
      const old = JSON.parse(m[1]);
      check("the record carries the fixture's roles forward",
        old.structure === contract.roles.structure &&
        old.reader_selection === contract.roles.reader_selection &&
        old.commentary_attachment === contract.roles.commentary_attachment &&
        old.base_surface === contract.faces.night.base_surface &&
        old.commentary_surface === contract.faces.night.commentary_surface);
    }
  }
}

// What each name the ledger uses means as a measurement. Hue is degrees on the
// wheel; lightness separates a brown from a gold, which are the same angle.
const FAMILY = {
  gold: { hue: [35, 60], minSat: 0.25, light: [0.30, 0.85] },
  electric_blue: { hue: [185, 235], minSat: 0.25, light: [0.30, 0.85] },
  crimson: { hue: [-15, 25], minSat: 0.20, light: [0.25, 0.75] },
  purple: { hue: [250, 320], minSat: 0.05, light: [0.01, 0.30] },
  brown: { hue: [15, 50], minSat: 0.05, light: [0.01, 0.30] },
  // the day face's grounds: linen well below paper white, parchment a shade
  // warmer and dimmer beneath it, both barely saturated
  linen: { hue: [30, 60], minSat: 0.03, light: [0.82, 0.97] },
  parchment: { hue: [30, 60], minSat: 0.03, light: [0.76, 0.95] },
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

const BASE = (process.argv[2] || "http://127.0.0.1:8899/zone.html").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${zonesOnDisk()[0]}&c=open`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(2600);

const commentaryHere = zonesWithCommentary().length > 0;
for (const face of ["night", "day"]) {
const CONTRACT = { ...contract.roles, base_surface: contract.faces[face].base_surface, commentary_surface: contract.faces[face].commentary_surface };
await p.evaluate((f) => window.__face.set(f), face);
await p.waitForTimeout(150);
console.log(`— the ${face} face, as the page paints it —`);
console.log(`  contract: ${Object.entries(CONTRACT).map(([k, v]) => `${k}=${v}`).join(" · ")}`);

// One representative of each role, taken off the live page.
const painted = await p.evaluate(() => {
  const cs = (sel, prop = "color") => { const e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : null; };
  // put a word into the reader's own selection so the state is real
  document.querySelector("section.seg .he-text .wb")?.click();
  return {
    structure: cs(".vnum"),
    structure2: cs("header.top h1 .en-t"),
    reader_selection: cs(".mode-btn.on", "backgroundColor"),
    commentary_attachment: cs("section.seg .c-mark") || cs("#cIndex .ci-head b"),
    base_surface: cs("body", "backgroundColor"),
    commentary_surface: cs("section.seg .c-mark-slot:not(.c-choose)", "backgroundColor") || cs("#cIndex", "backgroundColor"),
  };
});

// A commentary role can only be painted where a commentary stands. With no
// sidecar served, the roles are unpainted because their bearers are absent —
// the corpus's state, said as such, never scored as a colour fault.
for (const [role, name] of Object.entries(CONTRACT)) {
  const got = painted[role];
  if (!got) {
    if (!commentaryHere && role.startsWith("commentary")) {
      console.log(`  --    ${role}: no served work carries a commentary, so it has nothing to check against`);
      continue;
    }
    check(`  ${role} is painted at all`, false, "nothing on the page carries it"); continue;
  }
  const r = inFamily(got, name);
  check(`  ${role} is ${name.replace("_", " ")}`, r.ok, `${got} · ${r.why}`);
}
// the book's own English name is structure too, and was gold before any of this
{
  const r = inFamily(painted.structure2, CONTRACT.structure);
  check(`  and the book's name with it`, r.ok, `${painted.structure2} · ${r.why}`);
}
// the fault this rule exists for
{
  const a = rgb(painted.structure), c = rgb(painted.reader_selection);
  const apart = a && c && (Math.abs(hsl(a).h - hsl(c).h) > 60);
  check("  structure and selection are not the same colour", apart,
    `${painted.structure} vs ${painted.reader_selection}`);
}
// Legibility is attested, not assumed: WCAG relative-luminance ratios
// measured off the live page, per face. Body text holds the AA+ floor;
// readings and selections hold AA for normal text; structure sits at
// display sizes, where the large-text floor applies, held with margin.
{
  const lum = ([r, g, bl]) => {
    const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : (((c + 0.055) / 1.055) ** 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const inks = await p.evaluate(() => {
    const cs = (sel, prop = "color") => { const e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : null; };
    // not the clicked word — an earlier sample landed on the active word and
    // measured the selection twice while calling it ink
    return { ink: cs("section.seg .he-text .wb:not(.active):not(.chosen) .w"), gloss: cs("section.seg .he-text .g:not(.bare)") };
  });
  const ground = rgb(painted.base_surface);
  for (const [what, colour, floor] of [
    ["the text's ink on the ground", inks.ink, 7],
    ["a reading's gloss on the ground", inks.gloss, 4.5],
    ["the selection on the ground", painted.reader_selection, 4.5],
    ["structure on the ground", painted.structure, 4],
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

// the face button turns the page and names where it turns to
{
  const before = await p.evaluate(() => document.documentElement.dataset.scheme);
  const label = await p.evaluate(() => document.getElementById("face")?.textContent);
  await p.click("#face");
  await p.waitForTimeout(120);
  const after = await p.evaluate(() => document.documentElement.dataset.scheme);
  check("the face button turns the page to the face it names",
    !!label && after === label && after !== before, `${before} → pressed "${label}" → ${after}`);
}

await p.close(); await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
