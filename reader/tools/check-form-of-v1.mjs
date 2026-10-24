// A READING THAT POINTS AT ANOTHER WORD'S READING (the corpus lane's relay
// v85, form-of/zone-pills-v1.jsonl: a source's reading written as "singular
// construct state form of <Hebrew>" or "passive of <Hebrew>" points at a
// reading under the pointed word's key; the lane resolved 2,268 of 3,048
// such pointers to a row of the same source under the target key; baked by
// tools/bake-form-of-pills-v1.mjs into data/form-of-pills-v1.json). The
// owner's law (data/rule-demonstrations-v1.json): the C0 never moves;
// selection governs what is defined, never what is displayed. So:
//   F1  the record stands: a map keyed by route key, each entry naming the
//       pointer's source, its text, its relation and target, and, where the
//       lane resolved it, the resolved reading's key and text; its counts are
//       its own entries (the pills it carries; JUDGMENT, USAGE_NOTE and NOT
//       pointers are read and counted but wait on the owner's branch)
//   F2  the page loads the map after its first paint and says so
//       (window.__formOf: keys, pills, resolved as the record counts them)
//   F3  a cell whose lead reading is a resolved pointer prints the resolved
//       reading with the pointer's relation and target in parentheses; the
//       pointer's bare text stands on no cell of that key; the Hebrew is the
//       Hebrew
//   F4  its card's pressed pill prints the same and carries the pointer's own
//       text as data-pointer (the pill is the source's row; what it prints is
//       the resolution)
//   F5  a ruling: another pill pressed moves the line to that reading; the
//       pointer pill pressed again puts the resolved text back on the line,
//       and the Hebrew never moved
// The word is found from the data on disk, never named here
// (check-scope-derived S1).
// Usage: node tools/check-form-of-v1.mjs [url-base]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls, zoneIdOf } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const RECORD = "data/form-of-pills-v1.json";
const noDot = (t) => String(t).replace(/\.$/u, "");
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const says = (e) => `${e.resolved.text} (${e.relation} ${target(e)})`;

// F1 the record
const rec = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : null;
const entries = rec ? Object.values(rec.keys).flat() : [];
const resolved = entries.filter((e) => e.resolved);
const wellFormed = entries.every((e) => e.m && e.t && e.relation && e.target && (!e.resolved || (e.resolved.key && e.resolved.text)));
check("F1  the record: a map by route key of pointers with source, text, relation and target, and the resolution the lane found; its counts are its own entries",
  !!rec && rec.keys && wellFormed && rec.counts.carried === entries.length && rec.counts.pills >= entries.length && rec.counts.resolved === resolved.length && resolved.length > 0,
  rec ? `${Object.keys(rec.keys).length} keys · ${entries.length} pointers carried (record says ${rec.counts.carried} of ${rec.counts.pills} read) · ${resolved.length} resolved (record says ${rec.counts.resolved}) · well formed ${wellFormed}` : "no record");
if (!rec) { console.log("\nFAIL"); process.exit(1); }

// the word: the first served zone with a cell whose lead is a resolved pointer
const urls = zoneUrls();
const base = /^https?:/u.test(process.argv[2] || "") ? process.argv[2].replace(/\/zone\.html.*$/u, "") : null;
const candidates = [];
const MAX = 40;
for (const u of urls) {
  if (candidates.length >= MAX) break;
  const id = zoneIdOf(u); const path = `data/zones/${id}.bin`;
  if (!existsSync(path)) continue;
  const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  if (!z.sections || !z.gloss) continue;
  for (const sec of z.sections) {
    for (let i = 0; i < (sec.words || []).length && candidates.length < MAX; i += 1) {
      const w = sec.words[i]; const l = rec.keys[w.k]; if (!l) continue;
      // a word a source reads at its place (pg) leads with that reading, a word
      // in a span prints its division: the key's lead reads only where neither holds
      if ((z.spans && z.spans[w.k]) || (Array.isArray(w.pg) && w.pg.length) || /\u05BE/u.test(w.s || "")) continue;
      const lead = z.gloss[w.k]; if (lead == null) continue;
      const by = z.gloss_m && z.gloss_m[w.k] ? z.gloss_m[w.k].by || [] : [];
      const e = l.find((x) => by.includes(x.m) && noDot(x.t) === noDot(lead)) || l.find((x) => noDot(x.t) === noDot(lead));
      if (e && e.resolved) candidates.push({ url: base ? `${base}/zone.html?b=${id}` : u, id, label: sec.label, w: i + 1, key: w.k, surface: w.s, e });
    }
  }
}
check("F0  served zones hold undivided cells whose lead reading is a resolved pointer (found from the zones on disk)", candidates.length > 0,
  candidates.length ? `${candidates.length} candidate cell(s) in ${new Set(candidates.map((c) => c.id)).size} zone(s); first ${candidates[0].id} ${candidates[0].label} word ${candidates[0].w} · pointer "${candidates[0].e.t}" (${candidates[0].e.m}) · resolves to "${candidates[0].e.resolved.text}" under ${candidates[0].e.resolved.key}` : `none among ${urls.length} zones`);
if (!candidates.length) { console.log(bad ? "\nFAIL" : "\nall checks passed"); process.exit(bad ? 1 : 0); }

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });
// the printed reading of a cell: its gloss without the license chip; the cell
// itself is found by its Hebrew letters (marks set aside), then opened
const readCell = ({ bare, want, letters }) => {
  const strip = (t) => String(t || "").normalize("NFC").replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C7\s]/gu, "");
  const cells = [...document.querySelectorAll(".he-text .wb:not(.mark)")];
  const glossOf = (wb) => { const g = wb.querySelector(":scope > .g"); if (!g) return ""; const c = g.cloneNode(true); for (const x of c.querySelectorAll(".g-lic, .lic-chip, .lic")) x.remove(); return c.textContent.trim(); };
  const heOf = (wb) => ((wb.querySelector(":scope > .w") || {}).textContent || "").trim();
  const mine = cells.filter((wb) => strip(heOf(wb)) === strip(letters));
  const hit = mine.find((wb) => glossOf(wb) === want) || mine[0] || null;
  if (hit && !hit.classList.contains("active")) { hit.scrollIntoView({ block: "center" }); (hit.querySelector(".w span") || hit.querySelector(".w") || hit).click(); }
  return { active: !!hit, activeGloss: hit ? glossOf(hit) : null, activeHe: hit ? heOf(hit) : null, sameLetters: mine.length, bareOn: cells.filter((wb) => glossOf(wb) === bare).length, wantOn: cells.filter((wb) => glossOf(wb) === want).length };
};
let found = null, map = null, cell = null, want = null;
const tried = [];
for (const c of candidates.slice(0, 12)) {
  await p.goto(`${c.url}#${c.label}:${c.w}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // the map arrives after the first paint
  await p.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
  map = await p.evaluate(() => window.__formOf === undefined ? "never" : window.__formOf);
  await p.waitForTimeout(1500);
  want = says(c.e);
  cell = await p.evaluate(readCell, { bare: noDot(c.e.t), want, letters: c.surface });
  await p.waitForTimeout(600);
  tried.push(`${c.id} ${c.label}:${c.w} "${cell.activeGloss}" (${cell.sameLetters} cell(s) of these letters)`);
  if (cell.active && cell.activeGloss === want) { found = c; break; }
}
check("F2  the page loads the map after its first paint and says so", !!map && map !== "never" && map.keys === Object.keys(rec.keys).length && map.pills === rec.counts.pills && map.resolved === rec.counts.resolved,
  JSON.stringify(map));
if (!found) { found = candidates[0]; want = says(found.e); }
// the letters alone: accents, meteg, rafe, masora circle, paseq, sof pasuq and the
// marks U+05C4 to U+05C7 set aside (points are kept: a resolution moves no point either)
const MARKS = new RegExp("[\\u0591-\\u05AF\\u05BD\\u05BF\\u05C0\\u05C3-\\u05C7\\s]", "gu");
const sameHe = (a, b) => String(a || "").normalize("NFC").replace(MARKS, "") === String(b || "").normalize("NFC").replace(MARKS, "");
check("F3  the cell prints the resolved reading with the relation and target in parentheses; the pointer's bare text stands on no cell; the Hebrew is the Hebrew",
  cell.active && cell.activeGloss === want && cell.bareOn === 0 && cell.wantOn >= 1 && sameHe(cell.activeHe, found.surface),
  `${found.id} ${found.label} word ${found.w}: line "${cell.activeGloss}" · wanted "${want}" · bare pointer on ${cell.bareOn} cell(s) · resolved on ${cell.wantOn} · Hebrew ${sameHe(cell.activeHe, found.surface) ? "unmoved" : `"${cell.activeHe}" vs "${found.surface}"`}${tried.length > 1 ? ` · tried ${tried.join(" | ")}` : ""}`);
// F4 the card's pressed pill
const waitFor = async (sel, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.$(sel)) return true; await p.waitForTimeout(100); } return false; };
await waitFor('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', 15000); await p.waitForTimeout(500);
const pills = () => p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), pointer: x.dataset.pointer || null, pressed: x.getAttribute("aria-pressed") === "true" })));
const p1 = await pills();
const pressed = p1.find((x) => x.pressed);
check("F4  the card's pressed pill prints the resolution and carries the pointer's own text as data-pointer",
  !!pressed && pressed.t === want && !!pressed.pointer && noDot(pressed.pointer).includes(found.e.target),
  pressed ? `pressed "${pressed.t}" · data-pointer "${pressed.pointer}" · ${p1.filter((x) => x.pointer).length} pointer pill(s) of ${p1.length}` : `no pressed pill among ${p1.length}`);
// F5 a ruling and back
const other = p1.findIndex((x) => !x.pressed && !x.pointer);
let f5 = null;
if (other >= 0) {
  const line = () => p.evaluate(() => (((document.querySelector(".he-text .wb.active > .g") || {}).textContent) || "").trim());
  const he = () => p.evaluate(() => (((document.querySelector(".he-text .wb.active > .w") || {}).textContent) || "").trim());
  const he0 = await he();
  await p.evaluate((i) => document.querySelectorAll("#hud > .rows .b-read .r-pills button")[i].click(), other); await p.waitForTimeout(700);
  const moved = await line(); const p2 = await pills();
  const back = p2.findIndex((x) => x.pointer && x.t === want);
  if (back >= 0) { await p.evaluate((i) => document.querySelectorAll("#hud > .rows .b-read .r-pills button")[i].click(), back); await p.waitForTimeout(700); }
  f5 = { other: p1[other].t, moved, back: back >= 0, restored: await line(), he0, he1: await he() };
}
check("F5  another pill pressed moves the line to it; the pointer pill pressed again puts the resolution back; the Hebrew never moved",
  !!f5 && f5.moved !== want && f5.moved.includes(noDot(f5.other).split(" + ")[0].slice(0, 12)) && f5.back && f5.restored === want && f5.he0 === f5.he1,
  f5 ? `"${f5.other}" -> line "${f5.moved}" · back -> "${f5.restored}" · Hebrew ${f5.he0 === f5.he1 ? "unmoved" : "MOVED"}` : "the card offers no other plain pill to press");
await b.close();
console.log(bad ? `\nFAIL ${bad}` : "\nall checks passed");
process.exit(bad ? 1 : 0);
