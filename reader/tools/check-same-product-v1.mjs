// SAME PRODUCT (the rebuild, 2026-10-23: "a full rebuild, same product,
// lighter weight"). Two builds of the site, the one shipped and the one
// proposed, served at two origins, print the same thing to a reader:
//   S1  on every sampled chapter page, every word's line and its chip are
//       the same, under the default switches, with no blanks on, with no
//       names on, and in the English reader (a switch one build lacks is
//       reported, not compared)
//   S2  the cards of the first words of the chapter carry the same pills in
//       the same order with the same one pressed
// The sample: every fifth served book with a chapter page, the first and the
// last among them, chapter 1 and the middle chapter of each; no book is
// named here (check-scope-derived S1). Without two origins the check skips.
// Usage: node tools/check-same-product-v1.mjs --old <origin> --new <origin> [--every 5] [--chapters 2]
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const OLD = arg("old", ""), NEW = arg("new", ""), EVERY = Number(arg("every", "5")), CHAPTERS = Number(arg("chapters", "2"));
if (!/^https?:/u.test(OLD) || !/^https?:/u.test(NEW)) { console.log("SKIPPED — needs two builds to compare: --old <origin> --new <origin>"); process.exit(3); }
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const withPages = zonesServed().filter((z) => existsSync(join(SITE, z, "1", "index.html")));
const books = withPages.filter((z, i) => i % EVERY === 0 || i === withPages.length - 1);
const chaptersOf = (z) => readdirSync(join(SITE, z)).filter((d) => /^\d+$/u.test(d)).map(Number).sort((a, c) => a - c);
const pages = [];
for (const z of books) { const chs = chaptersOf(z); if (!chs.length) continue; const pick = [chs[0]]; if (CHAPTERS > 1 && chs.length > 1) pick.push(chs[Math.floor(chs.length / 2)]); for (const ch of pick.slice(0, CHAPTERS)) pages.push({ z, ch }); }
console.log(`${books.length} of ${withPages.length} served books with chapter pages · ${pages.length} pages · old ${OLD} · new ${NEW}`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const STATES = [["default", null], ["no blanks", "blanksPill"], ["no names", "namesPill"], ["English reader", "modeEn"]];
const read = async (origin, z, ch) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  const errors = []; p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
  const out = { states: {}, cards: null, errors, absent: [] };
  try {
    await p.goto(`${origin}/${z}/${ch}/`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    // the chapter and what follows it, built: a stretch below the arrival
    const y0 = await p.evaluate(() => window.scrollY);
    for (let y = 0; y < 3000; y += 1000) { await p.evaluate((y) => window.scrollTo(0, y), y0 + y); await p.waitForTimeout(120); }
    await p.evaluate((y) => window.scrollTo(0, y), y0); await p.waitForTimeout(600);
    const lines = () => p.evaluate(() => {
      const out = {};
      document.querySelectorAll("section.seg").forEach((sec) => {
        const wbs = [...sec.querySelectorAll(".he-text .wb")]; if (!wbs.length) return;
        out[sec.id] = wbs.map((wb) => { const g = wb.querySelector(":scope > .g") || wb.closest(".wjoin")?.querySelector(":scope > .g"); if (!g) return [wb.querySelector(".w")?.textContent || "", "", ""]; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return [wb.querySelector(".w")?.textContent || "", c.textContent.trim(), (g.querySelector(".g-lic") || {}).textContent || ""]; });
      });
      return out;
    });
    out.states.default = await lines();
    // the cards of the first three words of the chapter, at the default
    out.cards = [];
    for (let i = 0; i < 3; i += 1) {
      const ok = await p.evaluate((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
      if (!ok) break;
      await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(700);
      out.cards.push(await p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.trim()}`)));
      await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    }
    for (const [name, id] of STATES.slice(1)) {
      const has = await p.evaluate((id) => { const x = document.getElementById(id); return !!(x && !x.disabled); }, id);
      if (!has) { out.absent.push(name); continue; }
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(100);
      await p.click(`#${id}`); await p.waitForTimeout(1500);
      out.states[name] = await lines();
      await p.click(`#${id}`); await p.waitForTimeout(800);
    }
  } catch (e) { out.failed = String(e.message || e).slice(0, 160); }
  await ctx.close();
  return out;
};
const s1 = [], s2 = [], skipped = [], failed = [];
let linesCompared = 0, cardsCompared = 0;
for (const { z, ch } of pages) {
  const [a, c] = [await read(OLD, z, ch), await read(NEW, z, ch)];
  if (a.failed || c.failed) { failed.push(`${z} ${ch}: ${a.failed || ""}${c.failed ? ` / new: ${c.failed}` : ""}`); continue; }
  for (const [name] of STATES) {
    const A = a.states[name], C = c.states[name];
    if (!A || !C) { if (name !== "default") skipped.push(`${z} ${ch} ${name}: ${!A ? "old" : "new"} lacks the switch`); continue; }
    const common = Object.keys(A).filter((k) => C[k]);
    if (!common.length) { s1.push(`${z} ${ch} ${name}: no section built on both`); continue; }
    for (const k of common) {
      const n = Math.max(A[k].length, C[k].length);
      for (let i = 0; i < n; i += 1) {
        linesCompared += 1;
        const x = A[k][i] || ["", "", ""], y = C[k][i] || ["", "", ""];
        if (x[0] !== y[0] || x[1] !== y[1] || x[2] !== y[2]) { s1.push(`${z} ${ch} ${name} ${k} #${i + 1} ${x[0]}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); if (s1.length > 400) break; }
      }
    }
  }
  const n = Math.max(a.cards.length, c.cards.length);
  for (let i = 0; i < n; i += 1) { cardsCompared += 1; const x = (a.cards[i] || []).join(" | "), y = (c.cards[i] || []).join(" | "); if (x !== y) s2.push(`${z} ${ch} card ${i + 1}: ${x.slice(0, 80)} → ${y.slice(0, 80)}`); }
}
await b.close();
check("S1 every sampled line and its chip are the same on both builds, under every switch both carry", !failed.length && pages.length > 0 && !s1.length,
  `${linesCompared.toLocaleString()} lines compared on ${pages.length} pages${s1.length ? ` · ${s1.length} differ: ${s1.slice(0, 4).join("; ")}` : ""}${skipped.length ? ` · not compared: ${[...new Set(skipped.map((x) => x.split(": ")[1]))].join(", ")} (${skipped.length})` : ""}${failed.length ? ` · failed to read: ${failed.slice(0, 3).join("; ")}` : ""}`);
check("S2 the first cards of every sampled chapter carry the same pills, the same one pressed", !failed.length && cardsCompared > 0 && !s2.length, `${cardsCompared} cards compared${s2.length ? ` · ${s2.length} differ: ${s2.slice(0, 3).join("; ")}` : ""}`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
