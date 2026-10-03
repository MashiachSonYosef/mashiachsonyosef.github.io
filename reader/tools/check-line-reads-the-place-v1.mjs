#!/usr/bin/env node
// check-line-reads-the-place-v1 · under "at this place", the line is TAHOT's reading here
//
// GUARDS: place-order-rule-v1-the-line-reads-what-the-source-gives-at-this-place
// LEDGER: -
// no frame letter. This reads a served zone and the page drawn from it, and
// writes nothing.
//
// The owner, 2026-10-03: "we dont do blanket oldest first anymore thats a
// subtoggle", and, circling Daniel 1:2's line ("X common", "puts ~ toshame",
// "a house + ? + God"), asking whether it was fixed. The fix is the reads-first
// position "at this place", the default wherever a book carries the corpus
// lane's piece gloss: each word's line is what STEP's TAHOT gives at this very
// place, divided and worded as it reads here (word.pg, relay v59), and the
// card opens on it. Claims:
//
//   P1  it is the default: with nothing remembered, reads-first is "at this place"
//   P2  every single word that carries the pieces, and stands outside a pair or
//       a run, prints exactly them on its line ("/" joined, as the store packs
//       a divided reading, drawn with " + ")
//   P3  each card opens pressed on its line, and the line's reading is its
//       first pill
//   P4  a word whose reading here no row of the store prints still opens on
//       it, as TAHOT's own row (the page stands it up from the piece gloss)
//   P5  TAHOT switched off: no line reads the place any more where oldest
//       first reads otherwise, and every such line is the baked one
//   P6  back at "oldest first", every such line is the baked one again
//
// Run: node tools/check-line-reads-the-place-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

const pw = await loadPlaywright();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl();
const b = await pw.chromium.launch(launchOptions());

// the page's lines against the zone's own words, section by section, for every
// rendered section whose blocks line up one to one with its words
const LINES = () => {
  const z = window.__zone;
  const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
  const lineOf = (wb) => { const g = wb.querySelector(":scope > .g"); if (!g) return null; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return (c.textContent || "").trim(); };
  const secs = [...document.querySelectorAll("section.seg")];
  const out = [];
  let judged = 0, skipped = 0;
  for (let si = 0; si < Math.min(secs.length, z.sections.length, 60); si += 1) {
    const wbs = [...secs[si].querySelectorAll(".he-text .wb")];
    const words = z.sections[si].words || [];
    if (wbs.length !== words.length) { skipped += 1; continue; }
    judged += 1;
    words.forEach((w, i) => {
      if (!w.k || w.w || !Array.isArray(w.pg) || !w.pg.length) return;
      const wb = wbs[i];
      if (wb.classList.contains("kq")) return;
      // source signs off (the page's own default since 2026-10-03): a piece
      // that is a sign and nothing else is not drawn on the line, unless every
      // piece is one, and then the sign is the whole reading and stands
      const all = w.pg.map((p) => String(p.g || "").trim());
      const plain = all.filter((t) => !(window.__signs === "off" && /^(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)$/u.test(t)));
      out.push({ si, i, k: w.k, line: lineOf(wb), place: spanJoin((plain.length ? plain : all).join("/")), base: z.gloss && z.gloss[w.k] ? spanJoin(z.gloss[w.k]) : null, by: (z.gloss_m && z.gloss_m[w.k] && z.gloss_m[w.k].by) || [] });
    });
  }
  return { out, judged, skipped };
};
const ready = async (p) => {
  await p.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForFunction(() => !!window.__zone, null, { timeout: 30000 });
  await p.waitForTimeout(1200);
};

// ---- P1–P4 · a fresh reader --------------------------------------------
{
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await ready(p);
  const order = await p.evaluate(() => { const row = document.querySelector('.rail .row[data-toggle="order"]'); const on = row && row.querySelector('.dfp[aria-pressed="true"], .dfp.on'); return on ? on.textContent.trim() : null; });
  check("P1  with nothing remembered, reads first is \"at this place\"", /at this place/i.test(order || ""), `pressed: ${order}`);

  const { out, judged, skipped } = await p.evaluate(LINES);
  const off = out.filter((x) => x.line !== x.place);
  check("P2  every single word carrying the pieces prints exactly them on its line", out.length > 0 && off.length === 0,
    `${out.length.toLocaleString()} words in ${judged} sections (${skipped} not lined up)${off.length ? ` · ${off.length} differ, e.g. ${off.slice(0, 3).map((x) => `${x.k}: "${x.line}" not "${x.place}"`).join(" | ")}` : ""}`);

  // P3 · the cards, on the first glossed words
  const wbs = await p.$$("section.seg .he-text .wb:has(.g:not(.bare))");
  let n = 0, same = 0; const diff = [];
  for (const w of wbs.slice(0, 30)) {
    const line = await w.evaluate((e) => { const g = e.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); });
    await w.click();
    try { await p.waitForSelector("#hud .r-pills button", { timeout: 15000 }); } catch { continue; }
    await p.waitForTimeout(200);
    // under source signs off the line draws the pressed reading without its
    // sign-only pieces (all of them a sign, it draws them), so the pill is
    // read the way the line draws it
    const r = await p.evaluate(() => {
      const trim = (all) => { const keep = all.filter((x) => !/^(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)$/u.test(x.trim())); return keep.length ? keep : all; };
      const drawn = (t) => (t && window.__signs === "off" ? trim(t.split(" + ")).join(" + ") : t);
      return { pressed: drawn(document.querySelector('#hud .r-pills button[aria-pressed="true"]')?.textContent.trim()), first: drawn(document.querySelector("#hud .r-pills button")?.textContent.trim()) };
    });
    n += 1;
    if (r.pressed === line && r.first === line) same += 1; else if (diff.length < 3) diff.push(`line "${line}" · pressed "${r.pressed}" · first "${r.first}"`);
    await p.keyboard.press("Escape"); await p.waitForTimeout(40);
  }
  check("P3  each card opens pressed on its line, and the line's reading is its first pill", n > 0 && same === n, `${same} of ${n}${diff.length ? ` · ${diff.join(" | ")}` : ""}`);

  await ctx.close();
}

// ---- P4 · a reading here that no row of the store prints -----------------
// found in the data (the first served book, in order, with a single word whose
// TAHOT reading here no row under its key prints whole), and opened at its verse
{
  const { zonesServed } = await import("./zones-on-disk-v1.mjs");
  const { openRouteStore } = await import("./gloss-store-v1.mjs");
  const { readFileSync, existsSync } = await import("node:fs");
  const { gunzipSync } = await import("node:zlib");
  const { join } = await import("node:path");
  const ZONES = process.env.ZONES_DIR || "data/zones";
  const storeDir = "data/route-store";
  const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
  // candidates, on the data's narrower reading of a row (split at ";"); the
  // page splits a row's readings further, so it is the page that says which
  // of them stands on TAHOT's own row
  const cands = [];
  const seenK = new Set();
  if (existsSync(join(storeDir, "index.json"))) {
    const store = openRouteStore(storeDir);
    for (const slug of zonesServed(ZONES)) {
      const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${slug}.bin`))).toString("utf8"));
      for (const sec of z.sections || []) {
        for (const w of sec.words || []) {
          if (!w.k || w.w || !Array.isArray(w.pg) || !w.pg.length) continue;
          const place = spanJoin(w.pg.map((p) => String(p.g || "").trim()).join("/"));
          const rows = store.routesFor(w.k) || [];
          if (seenK.has(w.k) || !rows.length || rows.some((r) => String(r[1]).split(/;/).some((x) => spanJoin(x).toLowerCase() === place.toLowerCase()))) continue;
          seenK.add(w.k);
          cands.push({ slug, label: sec.label, k: w.k, s: w.s, place });
          if (cands.length >= 12) break;
        }
        if (cands.length >= 12) break;
      }
      if (cands.length >= 12) break;
    }
  }
  const results = [];
  for (const found of cands) {
    const base = URL.replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
    const url = `${base}${base.includes("?") ? "&" : "?"}b=${found.slug}&at=${encodeURIComponent(String(found.label || ""))}`;
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
    await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
    await p.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(async (s) => {
      const MARKS = new RegExp("[\\u0591-\\u05C7]", "g");
      const strip = (t) => String(t || "").replace(MARKS, "").trim();
      const wb = [...document.querySelectorAll("section.seg .he-text .wb")].find((x) => !x.closest(".wjoin") && strip(x.querySelector(".w")?.textContent) === strip(s));
      if (!wb) return null;
      (wb.querySelector(".w span") || wb.querySelector(".w")).click();
      const t0 = Date.now();
      while (Date.now() - t0 < 12000 && !document.querySelector("#hud .r-pills button")) await new Promise((x) => setTimeout(x, 50));
      await new Promise((x) => setTimeout(x, 300));
      return { first: (window.__pool || [])[0], lead: (window.__poolLead || [])[0], placeRow: (window.__poolPlace || [])[0],
        pressed: document.querySelector('#hud .r-pills button[aria-pressed="true"]')?.textContent.trim() };
    }, found.s);
    await ctx.close();
    if (r) results.push({ ...found, ...r });
  }
  const opened = results.filter((x) => x.first === x.place && x.pressed === x.place);
  const own = results.filter((x) => x.placeRow === true && x.lead === "M4" && x.first === x.place);
  check("P4  a reading here opens its card on it, first and pressed, where the store prints it and where it does not",
    results.length > 0 && opened.length === results.length,
    `${opened.length} of ${results.length} candidates${results.length !== opened.length ? ` · e.g. ${results.filter((x) => !opened.includes(x)).slice(0, 2).map((x) => `${x.slug} ${x.label} ${x.k}: "${x.place}" · first "${x.first}" · pressed "${x.pressed}"`).join(" | ")}` : ""}`);
  check("    and where no row of the store prints it, it stands as TAHOT's own row", own.length > 0,
    own.length ? `${own.length} of ${results.length} · e.g. ${own[0].slug} ${own[0].label} ${own[0].k}: "${own[0].place}"` : `none of ${results.length}: ${results.slice(0, 3).map((x) => `${x.k} lead ${x.lead}`).join(", ")}`);
}

// ---- P5 · TAHOT switched off ---------------------------------------------
{
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.sources.off", JSON.stringify(["M4"])); } catch { /* fresh reader */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await ready(p);
  await p.waitForFunction(() => (window.__livePending || 0) === 0, null, { timeout: 600000 }).catch(() => {});
  await p.waitForTimeout(500);
  const { out } = await p.evaluate(LINES);
  const judged = out.filter((x) => x.base && x.base !== x.place && !x.by.includes("M4"));
  const wrong = judged.filter((x) => x.line !== x.base);
  check("P5  TAHOT switched off, a word oldest first reads otherwise reads the baked line, not the place", judged.length > 0 && wrong.length === 0,
    `${judged.length.toLocaleString()} words${wrong.length ? ` · ${wrong.length} not baked, e.g. ${wrong.slice(0, 3).map((x) => `${x.k}: "${x.line}" not "${x.base}"`).join(" | ")}` : ""}`);
  await ctx.close();
}

// ---- P6 · back at oldest first ------------------------------------------
{
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await ready(p);
  const pressed = await p.evaluate(async () => {
    const row = document.querySelector('.rail .row[data-toggle="order"]');
    const btn = row && [...row.querySelectorAll(".dfp")].find((x) => /oldest first/i.test(x.textContent));
    if (!btn) return false;
    btn.click(); await new Promise((r) => setTimeout(r, 600));
    return true;
  });
  const { out } = await p.evaluate(LINES);
  const judged = out.filter((x) => x.base && x.base !== x.place);
  const wrong = judged.filter((x) => x.line !== x.base);
  check("P6  back at oldest first, every word that moved reads its baked line again", pressed && judged.length > 0 && wrong.length === 0,
    `${pressed ? "" : "no oldest first position · "}${judged.length.toLocaleString()} words${wrong.length ? ` · ${wrong.length} not baked, e.g. ${wrong.slice(0, 3).map((x) => `${x.k}: "${x.line}" not "${x.base}"`).join(" | ")}` : ""}`);
  await ctx.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
