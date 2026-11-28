// Scratch (builder H2): pressing a pill on the live reader's card at rest (the place answers' pills). For each word
// given it opens the word's card, presses a pill that is not the resting one, and reads the line under the word,
// the verse's export, and the line after reset; for each word given as a division word it presses another division
// and a cell and reads what the card does. Read only; the site root is served on a port the machine gives.
// node h2-press.mjs <site root> <words.json> <out.json>    words: [{ book, label, n, divide: bool }]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [SITE, WORDS, OUT] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const words = JSON.parse(readFileSync(WORDS, "utf8"));
const key = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
const rep = { words: 0, opened: 0, pressed: 0, line_shows_it: 0, export_shows_it: 0, reset_returns: 0, no_other_pill: [], fails: [], divide: { words: 0, division_pressed: 0, band_redrawn: 0, cell_pressed: 0, cell_band_redrawn: 0, reset_returns: 0, fails: [] }, page_errors: [] };
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  let open = null;
  const wbOf = (label, n) => page.evaluateHandle(([label, n]) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); if (!sec) return null; const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1]; return wb || null; }, [label, n]);
  const lineOf = (label, n) => page.evaluate(([label, n]) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); const wb = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1] : null; const g = wb ? wb.querySelector(":scope > .g") : null; return g ? g.textContent : null; }, [label, n]);
  const settled = () => page.waitForFunction(() => { const h = document.getElementById("hud"); const b = h && !h.hidden ? h.querySelector(".b-read") : null; return !!b && !b.querySelector(".r-wait") && !!(b.querySelector(".r-pills button") || b.querySelector("p:not(.r-label)")); }, null, { timeout: 15000 });
  const reset = async () => { await page.keyboard.press("Escape"); const off = await page.evaluate(() => document.getElementById("resetPill").disabled); if (!off) { await page.click("#resetPill"); await page.waitForTimeout(900); } };
  for (const w of words) {
    if (open !== `${w.book}|${!!w.spelling}`) {
      await page.goto(`${tree.base}/reader/zone.html?b=${w.book}${w.spelling ? "&card=spelling" : ""}`, { waitUntil: "networkidle" });
      await page.waitForSelector("section.seg", { timeout: 60000 });
      await page.waitForFunction(() => window.__placeCard && typeof window.__materialise === "function", null, { timeout: 60000 });
      await page.waitForTimeout(500); open = `${w.book}|${!!w.spelling}`;
    }
    const at = `${w.book} ${w.label} word ${w.n}`;
    await page.evaluate((label) => { const all = [...document.querySelectorAll("section.seg")]; const i = all.findIndex((s) => s.__sec && s.__sec.label === label); if (i >= 0) window.__materialise(Math.max(0, i - 1), i + 2); }, w.label);
    await page.waitForTimeout(200);
    const h = await wbOf(w.label, w.n); if (!(await h.evaluate((x) => !!x))) { rep.fails.push(`${at}: no word`); continue; }
    rep.words += 1;
    const rest = await lineOf(w.label, w.n);
    await h.evaluate((x) => x.scrollIntoView({ block: "center" })); await page.waitForTimeout(100);
    await h.evaluate((x) => (x.querySelector(".w span") || x.querySelector(".w") || x).click());
    try { await settled(); } catch { rep.fails.push(`${at}: the card's readings did not settle`); await reset(); continue; }
    rep.opened += 1;
    if (w.divide) {
      rep.divide.words += 1;
      // a cell of the division standing that is not the one open, then another division
      const c = await page.evaluate(() => { const h = document.getElementById("hud"); const cells = [...h.querySelectorAll(".b-cell .s-pills button")]; const other = cells.find((b) => b.getAttribute("aria-pressed") !== "true"); if (!other) return null; const before = (h.querySelector(".b-read .r-label") || {}).textContent; other.click(); return { cell: other.textContent, before }; });
      if (c) { rep.divide.cell_pressed += 1; try { await settled(); const after = await page.evaluate(() => (document.querySelector("#hud .b-read .r-label") || {}).textContent); if (after !== c.before) rep.divide.cell_band_redrawn += 1; else rep.divide.fails.push(`${at}: the cell «${c.cell}» pressed, the band still reads «${after}»`); } catch { rep.divide.fails.push(`${at}: the cell «${c.cell}» pressed, the band did not settle`); } }
      const d = await page.evaluate(async () => { const h = document.getElementById("hud"); const cuts = [...h.querySelectorAll(".b-cut .s-pills button")]; const other = cuts.find((b) => b.getAttribute("aria-pressed") !== "true"); if (!other) return null; const before = (h.querySelector(".b-read .r-label") || {}).textContent; other.click(); return { cut: other.textContent, before }; });
      if (d) {
        rep.divide.division_pressed += 1;
        try { await settled(); const after = await page.evaluate(() => (document.querySelector("#hud .b-read .r-label") || {}).textContent); if (after !== d.before) rep.divide.band_redrawn += 1; else rep.divide.fails.push(`${at}: the division «${d.cut}» pressed, the band still reads «${after}»`); } catch { rep.divide.fails.push(`${at}: the division «${d.cut}» pressed, the band did not settle`); }
      }
      if (c || d) {
        await reset(); if ((await lineOf(w.label, w.n)) === rest) rep.divide.reset_returns += 1; else rep.divide.fails.push(`${at}: after reset the line reads «${await lineOf(w.label, w.n)}», at rest «${rest}»`);
        continue;
      }
    }
    // a pill that is not the one standing
    const pieceCell = await page.evaluate(() => document.querySelectorAll("#hud .b-cell .s-pills button").length > 1);
    const pick = await page.evaluate(() => { const bs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const on = bs.find((b) => b.getAttribute("aria-pressed") === "true"); const other = bs.find((b) => b !== on && b.getAttribute("aria-pressed") !== "true"); if (!other) return null; const t = other.dataset.pointer || other.textContent; other.click(); return t; });
    if (!pick) { rep.no_other_pill.push(at); await reset(); continue; }
    rep.pressed += 1; await page.waitForTimeout(350);
    const line = await lineOf(w.label, w.n);
    if (line && key(line).includes(key(pick))) rep.line_shows_it += 1; else rep.fails.push(`${at}: pressed «${pick}», the line reads «${line}»`);
    await page.keyboard.press("Escape"); await page.waitForTimeout(150);
    // the verse's export: its first press arms it, its second writes the file
    const xp = await page.evaluateHandle((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); return sec ? sec.querySelector(".xp-open") : null; }, w.label);
    if (await xp.evaluate((x) => !!x)) {
      // the menu opened where it stands shut (a press on its button toggles it), its first row's third kind armed
      await page.evaluate((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); const b = sec && sec.querySelector(".xp-menu .xp-row .xp"); if (!(b && b.getClientRects().length)) sec.querySelector(".xp-open").click(); }, w.label);
      await page.waitForTimeout(250);
      await page.evaluate((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); const row = sec && sec.querySelector(".xp-menu .xp-row"); const b = row ? row.querySelectorAll(".xp")[2] : null; if (b) b.click(); }, w.label);
      await page.waitForFunction((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); return !!(sec && sec.querySelector(".xp.armed")); }, w.label, { timeout: 8000 }).catch(() => null);
      try {
        const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 30000 }), page.evaluate((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); const a = sec && sec.querySelector(".xp.armed"); if (a) a.click(); }, w.label)]);
        const text = readFileSync(await dl.path(), "utf8");
        const tally = rep[w.spelling ? "todays_card" : pieceCell ? "piece_cells" : "whole_word_cells"] || (rep[w.spelling ? "todays_card" : pieceCell ? "piece_cells" : "whole_word_cells"] = { pressed: 0, export_shows_it: 0 });
        tally.pressed += 1; if (key(text).includes(key(pick))) tally.export_shows_it += 1;
        if (key(text).includes(key(pick))) rep.export_shows_it += 1; else { rep.fails.push(`${at}: pressed «${pick}»${pieceCell ? " in a cell of a divided word" : w.spelling ? " on today's card" : " in the whole word's cell"}, the export does not carry it`); if (!rep.export_sample) rep.export_sample = text.split("\n").filter((l) => !/attribution|license|Provider/u.test(l)).join("\n"); }
      } catch (e) { rep.fails.push(`${at}: no export file (${String(e.message).slice(0, 60)})`); }
    } else rep.fails.push(`${at}: no export control on the verse`);
    await reset();
    const back = await lineOf(w.label, w.n);
    if (back === rest) rep.reset_returns += 1; else rep.fails.push(`${at}: after reset the line reads «${back}», at rest «${rest}»`);
  }
  rep.page_errors = errors;
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(rep, null, 1));
const { fails, divide, no_other_pill, page_errors, ...brief } = rep;
console.log(JSON.stringify({ ...brief, fails: fails.length, no_other_pill: no_other_pill.length, page_errors: page_errors.length, divide: { ...divide, fails: divide.fails.length } }));
