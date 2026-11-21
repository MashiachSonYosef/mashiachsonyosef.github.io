// Finding 8, every place: for each word on disk whose pieces are MACULA's (data-macula.out), open its card at rest and
// print the chip under the word and the card's label. Flags any label that names TAHOT or STEP over a MACULA chip.
// node f8-all.mjs [extra query, e.g. &default=macula] [only this book]
import fs from "node:fs";
import { chromium, BASE, mask, ready } from "./lib.mjs";
const [EXTRA = "", ONLY = ""] = process.argv.slice(2);
const places = fs.readFileSync(new URL("./data-macula.out", import.meta.url), "utf8").split("\n").map((l) => /^(\S+) (\d+:\d+) word (\d+) \(0-based\)(?: (kq\.[kq]))? pieces=(\d+) pair=(\w+) all-macula=(\w+)/u.exec(l)).filter(Boolean).map((m) => ({ book: m[1], label: m[2], idx: Number(m[3]), side: m[4] || "", pieces: m[5], pair: m[6], all: m[7] })).filter((x) => !ONLY || x.book === ONLY);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
let bad = 0, seen = 0;
for (const pl of places) {
  const p = await ctx.newPage();
  try {
    await p.goto(`${BASE}?b=${pl.book}${EXTRA}#${pl.label}`, { waitUntil: "domcontentloaded" });
    await ready(p);
    await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label), pl.label, { timeout: 20000 });
    await p.waitForTimeout(600);
    const r = await p.evaluate(async ({ label, idx }) => {
      const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
      const wb = [...sec.querySelectorAll(".he-text .wb")][idx]; if (!wb) return { err: "no such word box" };
      const g = wb.querySelector(":scope > .g") || (wb.closest(".wjoin") ? wb.closest(".wjoin").querySelector(":scope > .g") : null);
      const chips = g ? [...g.querySelectorAll(".g-lic")].map((x) => x.dataset.line || "") : [];
      const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
      wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click();
      const t0 = Date.now();
      while (Date.now() - t0 < 8000 && !document.querySelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece")) await new Promise((r) => setTimeout(r, 100));
      await new Promise((r) => setTimeout(r, 700));
      return { line: c ? c.textContent.trim() : null, chips, label: (document.querySelector("#hud .r-now .k") || {}).textContent || null, here: [...document.querySelectorAll("#hud .r-piece, #hud .r-dflt")].map((x) => x.textContent.slice(0, 60)).slice(0, 2), run: !!wb.closest(".wjoin"), kq: wb.className };
    }, pl);
    seen++;
    const mac = (r.chips || []).some((c) => /MACULA/u.test(c));
    const wrong = mac && /TAHOT|STEP/u.test(String(r.label || "").split(" · ").slice(0, 2).join(" · "));
    if (wrong) bad++;
    console.log(`${wrong ? "WRONG " : ""}${pl.book} ${pl.label} w${pl.idx}${pl.side ? " " + pl.side : ""} pair=${pl.pair} all-macula=${pl.all} | line ${JSON.stringify(mask(r.line))} chips ${JSON.stringify(r.chips)} | label ${JSON.stringify(mask(r.label))} | ${JSON.stringify((r.here || []).map(mask))}${r.err ? " " + r.err : ""}`);
  } catch (e) { console.log(`${pl.book} ${pl.label} w${pl.idx}: could not read (${String(e.message).split("\n")[0].slice(0, 80)})`); }
  await p.close();
}
console.log(`places read: ${seen} of ${places.length}; labels naming TAHOT/STEP over a MACULA chip: ${bad}`);
await b.close();
