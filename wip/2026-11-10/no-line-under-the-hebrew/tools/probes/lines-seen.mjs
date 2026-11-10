// Every line the page draws on or beside its Hebrew: a bottom border that can be seen, a shadow drawn as a line over a
// row, a row's own ::after drawn as a line, and a text decoration. Counted by where it stands and what wears it, in
// both readers, with the card numbers off and on.
// node lines-seen.mjs <reader dir> <zone url base> <book> [--scroll N]
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const SCROLL = Number(flag("--scroll", "24000"));
const [reader, base, book] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
for (const en of [false, true]) for (const nums of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript((on) => { try { localStorage.setItem("fh.nums", on ? "1" : "0"); } catch { /* nothing remembered */ } }, nums);
  await p.goto(`${base}?b=${book}${en ? "&mode=en" : ""}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // the numbers as the page's own switch sets them, whatever it remembers them under
  await p.evaluate((on) => { const pill = document.getElementById("numsPill"); if (pill && (pill.getAttribute("aria-pressed") === "true") !== on) pill.click(); }, nums);
  for (let y = 0; y < SCROLL; y += 1500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(70); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const clear = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/u.test(c);
    const where = (el) => (el.closest(".he-text") ? "the text" : el.closest("#workTitle") ? "the title" : el.closest("#hud") ? "the card" : "elsewhere");
    const what = (el) => {
      const wb = el.closest(".wb"), run = el.closest(".wjoin");
      const bits = [];
      if (el.classList.contains("wj-ink")) bits.push("a run's ink row");
      else if (el.classList.contains("wr")) bits.push("a half of a word in two forms");
      else if (el.classList.contains("w")) bits.push(run ? "a word inside a run" : "a word alone");
      else bits.push(el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? `.${el.className.split(/\s+/u).join(".")}` : ""));
      if (run) { if (run.classList.contains("lic")) bits.push("named by a license"); if (run.classList.contains("apart")) bits.push("with no card of its own"); if (run.classList.contains("active")) bits.push("open"); }
      if (wb) { if (wb.classList.contains("kq")) bits.push("written and read"); if (wb.classList.contains("typed-here")) bits.push("typed by the page"); if (wb.classList.contains("mark")) bits.push("a scribal mark"); }
      return bits.join(", ");
    };
    const out = new Map(); let looked = 0;
    const add = (kind, el) => { const k = `${where(el)} · ${what(el)} · ${kind}`; out.set(k, (out.get(k) || 0) + 1); };
    for (const el of document.querySelectorAll(".he-text .w, .he-text .wr, .he-text .wj-ink, #workTitle .w, #workTitle .wr, #workTitle .wj-ink")) {
      looked += 1;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && !clear(cs.borderBottomColor)) add(`a ${cs.borderBottomStyle} line under, ${cs.borderBottomWidth}`, el);
      const sh = /(-?[\d.]+)px\s+(-?[\d.]+)px\s+0px\s+0px/u.exec(cs.boxShadow || "");
      if (sh && parseFloat(sh[1]) === 0 && parseFloat(sh[2]) !== 0 && !/rgba\([^)]*,\s*0\)/u.test(cs.boxShadow)) add(`a line drawn as a shadow ${parseFloat(sh[2]) < 0 ? "over" : "under"}`, el);
      if (cs.textDecorationLine && cs.textDecorationLine !== "none") add(`a text decoration (${cs.textDecorationLine} ${cs.textDecorationStyle})`, el);
      const af = getComputedStyle(el, "::after");
      if (el.classList.contains("wj-ink") && af.content && af.content !== "none" && parseFloat(af.height) > 0 && parseFloat(af.height) < 3 && (af.backgroundImage !== "none" || !clear(af.backgroundColor))) add(`its own ::after drawn as a line, ${af.height}${af.backgroundImage !== "none" ? ", parted for a number" : ""}`, el);
    }
    return { looked, rows: [...out].sort((x, y) => y[1] - x[1]), nums: document.body.classList.contains("nums"), en: document.body.classList.contains("en"), runs: document.querySelectorAll(".he-text .wjoin").length, runsJoined: document.querySelectorAll(".he-text .wjoin:not(.apart)").length };
  });
  console.log(`${book} · ${r.en ? "the English reader" : "the Hebrew reader"} · card numbers ${r.nums ? "on" : "off"} · ${r.looked} letter rows looked at · ${r.runs} runs built, ${r.runsJoined} of them one card${errors.length ? ` · PAGE ERRORS: ${errors.slice(0, 2).join(" | ")}` : ""}`);
  if (!r.rows.length) console.log("   no line is drawn");
  for (const [k, n] of r.rows) console.log(`   ${String(n).padStart(5)} · ${k}`);
  await ctx.close();
}
await b.close();
