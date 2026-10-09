#!/usr/bin/env node
// GUARDS: proper-name-rule-v1-a-name-leads-with-the-name-when-the-witness-reading-the-place-and-the-entry-it-belongs-to-name-it-alike
// LEDGER: -
// no frame letter. A check reads the zones and the page and judges them; it
// is not the ledger for one.
//
// A NAME LEADS WITH THE NAME, AND ONLY WHERE TWO WITNESSES NAME IT ALIKE.
// tools/proper-name-v1.mjs is the rule; tools/regloss-zone.mjs bakes it into
// the table the line reads. This holds the bake to the rule and the page to
// the bake.
//
//   N1  on every stamped book, the keys the zone says lead with a name are
//       exactly the keys the rule derives today over the store on disk, with
//       the same readings — nothing baked the rule would not bake, nothing
//       the rule bakes left out
//   N2  every name lead is the line (zone.gloss[k]), a Strong's record is
//       among its carriers (the chip names the oldest wording's witness,
//       gloss-m-rule-v1, which can be another source carrying the same
//       1890 wording), it is a bare capitalised form, and it is the name
//       TAHOT prints at every place the key stands
//   N3  the derivation is not lost: wherever the name displaced the oldest
//       reading, that reading still pools, so the card shows it beneath
//   N4  in a browser, on the first named word of the book: the line prints
//       the name without Strong's closing period, the card opens pressed on
//       it, its first pill is it, another pill carries the entry's other
//       sense, and the card says why the name leads
//   N5  the switches still govern it: with the name's every carrier switched
//       off the line moves off the name and the card opens pressed on what
//       the line then says
//
// Run: node tools/check-proper-name-v1.mjs [zone url]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { nameLeadsFor, tahotNameOf, isStrongs } from "./proper-name-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = process.argv[2] || defaultZoneUrl();
const BOOK = (URL.match(/[?&]b=([^&#]+)/) || [])[1] || "amos";
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
const NAME_FORM = /^[A-Z][A-Za-z'À-ſ-]+\.?$/u;

const store = openRouteStore(join(K3, "data", "route-store"));
const stamped = [];
for (const f of readdirSync(ZONES)) {
  if (!f.endsWith(".bin") || f.slice(0, -4).includes(".") || f.startsWith("fixture-")) continue;
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  if (z.count_stamp) stamped.push({ slug: f.slice(0, -4), z });
}
if (!stamped.length) { console.log("SKIPPED — no stamped book on this disk"); process.exit(3); }
if (!stamped.some(({ z }) => z.gloss_names)) { console.log("SKIPPED — no stamped book carries gloss_names; re-project with tools/regloss-zone.mjs"); process.exit(3); }

const n1 = [], n2 = [], n3 = [];
let ledKeys = 0, ledWords = 0, booksLed = 0;
for (const { slug, z } of stamped) {
  const baked = z.gloss_names || {};
  const today = nameLeadsFor(store, z, z.gloss || {});
  const keys = new Set([...Object.keys(baked), ...Object.keys(today.leads)]);
  for (const k of keys) if (baked[k] !== today.leads[k]) { n1.push(`${slug} ${k}: baked ${JSON.stringify(baked[k] ?? null)}, the rule gives ${JSON.stringify(today.leads[k] ?? null)}`); }
  if (Object.keys(baked).length) booksLed += 1;
  // the places, for N2
  const places = new Map();
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    if (!w || w.w || w.kq || !w.k) continue;
    if (!places.has(w.k)) places.set(w.k, []);
    places.get(w.k).push(w);
  }
  for (const [k, text] of Object.entries(baked)) {
    ledKeys += 1; ledWords += (places.get(k) || []).length;
    if (z.gloss[k] !== text) { n2.push(`${slug} ${k}: gloss_names says ${JSON.stringify(text)}, the line reads ${JSON.stringify(z.gloss[k])}`); continue; }
    const m = z.gloss_m && z.gloss_m[k];
    const by = m && Array.isArray(m.by) ? m.by : [];
    if (!m || !(isStrongs(m.m) || by.some((id) => isStrongs((store.index.m_sources[id] || {}).label)))) { n2.push(`${slug} ${k}: credited to ${JSON.stringify(m && m.m)}, carriers ${JSON.stringify(by)}`); continue; }
    if (!NAME_FORM.test(text)) { n2.push(`${slug} ${k}: ${JSON.stringify(text)} is not a bare capitalised form`); continue; }
    const wits = (places.get(k) || []).map(tahotNameOf).filter((x) => x !== null);
    if (!wits.length || wits.some((w) => w.toLowerCase() !== text.replace(/\.$/u, "").toLowerCase())) { n2.push(`${slug} ${k}: TAHOT prints ${JSON.stringify([...new Set(wits)])}, the line ${JSON.stringify(text)}`); continue; }
    const pool = store.readingPool(store.routesFor(k) || [], "oldest");
    if (pool.length && pool[0].text !== text && !pool.some((r) => r.text === pool[0].text)) n3.push(`${slug} ${k}: ${JSON.stringify(pool[0].text)} no longer pools`);
  }
}
console.log(`— ${stamped.length} stamped books · ${booksLed} carry name leads · ${ledKeys.toLocaleString()} keys · ${ledWords.toLocaleString()} words lead with a name —`);
check("N1  the keys baked as name leads are exactly the keys the rule derives today, reading for reading", n1.length === 0, n1.slice(0, 3).join(" | "));
check("N2  every name lead is the line, carried by Strong's, a bare capitalised form, and TAHOT's name at every place", n2.length === 0, n2.slice(0, 3).join(" | "));
check("N3  the reading a name displaced still pools beneath it, so nothing is hidden", n3.length === 0, n3.slice(0, 3).join(" | "));

// N4, N5 — the page
const pick = stamped.find((s) => s.slug === BOOK && s.z.gloss_names && Object.keys(s.z.gloss_names).length) || stamped.find((s) => s.z.gloss_names && Object.keys(s.z.gloss_names).length);
const zone = pick.z;
// the first named word whose baked form carries Strong's closing period, so
// the page's display of it is exercised too; else the first named word
let target = null, first = null;
outer: for (let si = 0; si < (zone.sections || []).length; si += 1) for (const w of zone.sections[si].words || []) {
  if (!(w && !w.w && !w.kq && w.k && Object.prototype.hasOwnProperty.call(zone.gloss_names, w.k))) continue;
  const t = { sec: si, k: w.k, s: w.s, text: zone.gloss_names[w.k] };
  if (!first) first = t;
  if (/\.$/u.test(t.text)) { target = t; break outer; }
}
target = target || first;
if (!target) { console.log(`SKIPPED — ${pick.slug} carries gloss_names but no named word stands in its sections`); process.exit(bad ? 1 : 3); }
const base = URL.replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const url = `${base}${base.includes("?") ? "&" : "?"}b=${pick.slug}&at=${encodeURIComponent(String(zone.sections[target.sec].label || ""))}`;
const carriers = (zone.gloss_m[target.k] && zone.gloss_m[target.k].by) || [];
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
// THE ORDER THESE CLAIMS ARE WRITTEN AGAINST: oldest first. The owner made
// "at this place" the default (2026-10-03: "we dont do blanket oldest first
// anymore thats a subtoggle"); it leads wherever TAHOT reads the word, and it
// has its own check (check-line-reads-the-place-v1). A stored choice is kept.
const openNamed = async (ctx) => {
  await ctx.addInitScript(() => { try { if (!localStorage.getItem("fh.def.order")) localStorage.setItem("fh.def.order", "oldest"); } catch { /* a device that remembers nothing still reads */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  await p.waitForTimeout(800);
  // every section built: the name is sought on its own, outside any run (a
  // word in a run opens the run's card), and the first such may stand far
  // from the section the page opened at, in a section not yet built
  await p.evaluate(() => { for (const el of document.querySelectorAll("section.seg")) if (el.__body) { const f = el.__body; el.__body = null; f(); } });
  await p.waitForTimeout(400);
  return p.evaluate(async (surface) => {
    const wait = (ms) => new Promise((x) => setTimeout(x, ms));
    const MARKS = new RegExp("[\\u0591-\\u05C7]", "g");
    const strip = (t) => String(t || "").replace(MARKS, "").trim();
    const wb = [...document.querySelectorAll("section.seg .he-text .wb")].find((x) => !x.closest(".wjoin") && strip(x.querySelector(".w")?.textContent) === strip(surface));
    if (!wb) return { found: false };
    const g = wb.querySelector(":scope > .g");
    wb.querySelector(".w").click();
    const h = document.getElementById("hud");
    const t0 = Date.now(); while (Date.now() - t0 < 12000 && !h.querySelector(".r-pills button")) await wait(50);
    await wait(700);
    const pills = [...h.querySelectorAll(".r-pills button")].map((x) => ({ t: x.textContent.trim(), on: x.getAttribute("aria-pressed") === "true" }));
    return { found: true, line: (g?.title || "").trim(), lineText: (g ? g.childNodes[0]?.textContent : "").trim(), now: (h.querySelector(".r-now .v")?.textContent || "").trim(),
      note: (h.querySelector(".r-now .n")?.textContent || "").trim(), pills };
  }, target.s);
};
{
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const r = await openNamed(ctx);
  const want = spanJoin(target.text);
  const pressed = r.pills && r.pills.find((x) => x.on);
  check(`N4  ${pick.slug} ${target.k}: the line prints the name, the card opens pressed on it and leads with it, and says why`,
    r.found && r.line === want && r.lineText === want && pressed && pressed.t === want && r.pills[0].t === want && /name it alike/.test(r.note) && r.pills.some((x) => x.t !== want),
    r.found ? `line "${r.line}" · pressed "${pressed ? pressed.t : "—"}" · first "${r.pills[0] ? r.pills[0].t : "—"}" · ${r.pills.length} pills · note ${/name it alike/.test(r.note)}` : "the word was not found on the page");
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((ids) => { try { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* a device that remembers nothing still reads */ } }, carriers);
  const r = await openNamed(ctx);
  const want = spanJoin(target.text);
  const pressed = r.pills && r.pills.find((x) => x.on);
  check(`N5  with the name's carriers off (${carriers.join(", ")}) the line moves off the name and the card opens pressed on what it says`,
    r.found && r.line !== want && (!pressed || pressed.t === r.line) && !r.pills.some((x) => x.t === want),
    r.found ? `line "${r.line}" · pressed "${pressed ? pressed.t : "—"}" · name still pooled ${r.pills.some((x) => x.t === want)}` : "the word was not found on the page");
  await ctx.close();
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
