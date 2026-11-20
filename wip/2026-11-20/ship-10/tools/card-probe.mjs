// Ship 10: what a word's card holds, by the maqaf switch. node card-probe.mjs <base> <book> <maqaf|pieces> <label:wordIndex,...> [query]
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, mode, places, query = ""] = process.argv.slice(2);
const b = await pw.chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
await ctx.addInitScript((m) => { try { localStorage.setItem("fh.maqaf-join", m); } catch {} }, mode);
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${book}${query}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
await p.waitForTimeout(1200);
for (const pl of places.split(",")) {
  const [lab, ix] = pl.split("@");
  const ok = await p.evaluate(([lab, ix]) => {
    for (const s of document.querySelectorAll("section.seg")) {
      if (((s.querySelector(".vnum") || {}).textContent || "").trim() !== lab) continue;
      const wbs = [...s.querySelectorAll(".he-text .wb:not(.mark)")];
      const wb = wbs[+ix]; if (!wb) return false;
      wb.scrollIntoView({ block: "center" });
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      return true;
    }
    return false;
  }, [lab, ix]);
  if (!ok) { console.log(pl, "no such word"); continue; }
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const hud = document.getElementById("hud");
    const txt = (el) => el.textContent.replace(/\s+/g, " ").trim();
    const head = hud.querySelector(".h-he, .hud-he, h2, .head"); 
    const labels = [...hud.querySelectorAll(".r-label")].map(txt);
    const bands = [...hud.querySelectorAll(".rows > .band")].map((bd) => ({ c: bd.className.replace("band ", ""), label: txt(bd.querySelector(".r-label") || { textContent: "" }), pills: [...bd.querySelectorAll(".s-pills button, .r-pills button, button.r")].length }));
    const reads = [...hud.querySelectorAll(".b-read button, .rows .r-pill, .rows button.r")].map(txt).slice(0, 14);
    return { hidden: hud.hidden, gradedBy: window.__cardGradedBy, entry: window.__cardEntry, name: window.__cardName, head: head ? txt(head).slice(0, 60) : "", labels, bands: bands.filter((x) => x.label || x.pills), reads };
  });
  console.log(mode, pl, JSON.stringify(r));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
}
await b.close();
