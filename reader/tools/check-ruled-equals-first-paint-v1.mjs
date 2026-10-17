// A RULED CELL IS THE CELL THE PAGE DRAWS FOR THAT READING (the owner,
// 2026-10-17: "the default serve is specialized or hand selected and in the
// systems after you dive in such as selected gloss it immediately relies on
// the actual pipeline and isnt tailored the same way as the default ... what
// about all cards sizing after selected gloss changes"; asked whether a
// picked cell keeps its width: "Same as default"). One paint path.
//   E1  in the Hebrew reader and in the English reader, cells ruled to a
//       reading (a one-piece word to its longest pill, a split word's last
//       piece to its longest pill) measure the same after the ruling as after
//       the page lays the same section again at first paint ("joined words"
//       out and back keeps the rulings): width and height within 1px, the
//       same line text, chip and row of pieces
//   E2  no cell holds a size of its own: after the rulings, and after a card
//       opened and closed with nothing chosen, no cell or line carries an
//       inline width or height
//   E3  the page never scrolls sideways
// The words are found on the page, never named here (check-scope-derived S1).
// Usage: node tools/check-ruled-equals-first-paint-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
for (const mode of ["he", "en"]) {
  const reader = mode === "en" ? "the English reader" : "the Hebrew reader";
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.addInitScript((mode) => { try { localStorage.clear(); if (mode === "en") localStorage.setItem("fh.mode", "en"); } catch { /* fresh reader */ } }, mode);
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(1200);
  const docW0 = await p.evaluate(() => document.documentElement.scrollWidth);
  // the cells under test: the first sections' lone words, each named by its
  // section and its place among the section's cells
  const targets = await p.evaluate(() => {
    const out = []; let single = 0, split = 0, open = 0;
    for (const sec of [...document.querySelectorAll("section.seg")].slice(0, 8)) {
      const label = (sec.querySelector(".vnum") || {}).textContent;
      const cells = [...sec.querySelectorAll(".he-text > .wb")];
      cells.forEach((wb, i) => {
        if (wb.classList.contains("kq") || wb.classList.contains("mark") || !wb.__word) return;
        const isSplit = !!wb.querySelector(":scope > .g > .g-pcs") && Array.isArray(wb.__word.pg) && wb.__word.pg.length > 1;
        if (isSplit && split < 3) { split += 1; out.push({ label, i, kind: "split" }); }
        else if (!isSplit && single < 3) { single += 1; out.push({ label, i, kind: "single" }); }
        else if (!isSplit && open < 1) { open += 1; out.push({ label, i, kind: "open" }); }
      });
    }
    return out;
  });
  const cellOf = (t) => `[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(t.label)}).querySelectorAll(".he-text > .wb")[${t.i}]`;
  const measure = (t) => p.evaluate((src) => {
    const wb = eval(src); if (!wb) return null;
    const g = wb.querySelector(":scope > .g"); const row = g && g.querySelector(":scope > .g-pcs");
    const r = wb.getBoundingClientRect(), gr = g ? g.getBoundingClientRect() : null;
    const chip = g && g.querySelector(":scope > .g-lic");
    const text = g ? [...g.childNodes].filter((n) => !(n.nodeType === 1 && n.classList.contains("g-lic"))).map((n) => n.textContent).join("") : "";
    return { w: Math.round(r.width), h: Math.round(r.height), gh: gr ? Math.round(gr.height) : 0, text, chip: chip ? chip.textContent : "",
      row: row ? [...row.querySelectorAll(":scope > .g-pc")].length : 0,
      inline: !!(wb.style.width || wb.style.height || (g && (g.style.width || g.style.height))) };
  }, cellOf(t));
  const pressed = async (sel, pick) => { const ok = await p.evaluate(({ sel, pick }) => { const xs = [...document.querySelectorAll(sel)]; const x = new Function("xs", pick)(xs); if (x) x.click(); return !!x; }, { sel, pick }); await p.waitForTimeout(900); return ok; };
  const ruled = [];
  for (const t of targets) {
    await p.evaluate((src) => { const wb = eval(src); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, cellOf(t));
    const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(80);
    await p.waitForTimeout(400);
    let ok = true;
    if (t.kind === "split") {
      ok = await pressed("#hud .b-cut .s-pills button", "return xs.find((x) => x.textContent.includes('+'));")
        && await pressed("#hud .b-cell .s-pills button", "return xs[xs.length - 1];");
    }
    if (ok && t.kind !== "open") ok = await pressed("#hud .b-read .r-pills button", "const now = (document.querySelector('#hud .r-now .v') || {}).textContent || ''; const s = xs.filter((x) => !x.textContent.includes('+') && x.textContent.trim() !== now.trim()).sort((a, c) => c.textContent.length - a.textContent.length); return s[0];");
    await p.keyboard.press("Escape"); await p.waitForTimeout(700);
    if (ok) ruled.push(t);
  }
  const after = []; for (const t of ruled) after.push(await measure(t));
  const docW1 = await p.evaluate(() => document.documentElement.scrollWidth);
  // the same sections laid again at first paint, the rulings kept
  const relay = (label) => p.evaluate((label) => { const l = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith("joined words")); const x = l && [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === label); if (x) x.click(); return !!x; }, label);
  const relayed = await relay("as separate words"); await p.waitForTimeout(1500); await relay("as written"); await p.waitForTimeout(2500);
  const fresh = []; for (const t of ruled) fresh.push(await measure(t));
  const diffs = [];
  ruled.forEach((t, k) => {
    const a = after[k], f = fresh[k]; if (!a || !f) { diffs.push(`${t.label}#${t.i} not found`); return; }
    const d = [];
    if (Math.abs(a.w - f.w) > 1) d.push(`width ${a.w} vs ${f.w}`);
    if (Math.abs(a.h - f.h) > 1) d.push(`height ${a.h} vs ${f.h}`);
    if (a.text !== f.text) d.push(`text "${a.text.slice(0, 40)}" vs "${f.text.slice(0, 40)}"`);
    if (a.chip !== f.chip) d.push(`chip "${a.chip}" vs "${f.chip}"`);
    if (a.row !== f.row) d.push(`pieces ${a.row} vs ${f.row}`);
    if (d.length) diffs.push(`${t.label}#${t.i} (${t.kind}): ${d.join(", ")}`);
  });
  const kinds = ruled.reduce((m, t) => ((m[t.kind] = (m[t.kind] || 0) + 1), m), {});
  check(`E1  ${reader}: a ruled cell measures as the page lays it at first paint`, relayed && ruled.filter((t) => t.kind !== "open").length >= 4 && !diffs.length,
    `${ruled.length} cells (${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(", ")})${relayed ? "" : " · the joined-words switch was not found"}${diffs.length ? " · " + diffs.slice(0, 4).join(" | ") : ""}`);
  const held = ruled.filter((t, k) => after[k] && after[k].inline).map((t) => `${t.label}#${t.i} (${t.kind})`);
  check(`E2  ${reader}: no cell holds a size of its own after a ruling or an open`, !held.length, held.length ? held.join(", ") : `${ruled.length} cells free`);
  check(`E3  ${reader}: the page never scrolls sideways`, docW1 === docW0 && docW0 === 412, `${docW0}px → ${docW1}px`);
  await p.close();
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
