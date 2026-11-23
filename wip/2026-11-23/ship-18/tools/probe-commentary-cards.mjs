// read-only probe (23 November 2026): for each place given (book, verse label, the commentary unit, word index in the
// unit's words), the page as a first visit opens it with the commentary shown (?commentary=on): the line under the
// commentary's word and the card it opens (its pills, its withheld line). Serves <tree>/reader on a port the machine
// gives (serve-tree-v1) and writes nothing. Usage: node probe-commentary-cards.mjs <reader dir> <places.json> [pointing]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [R, PLACES, POINTING] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
const out = [];
const byBook = new Map();
for (const p of places) (byBook.get(p.book) || byBook.set(p.book, []).get(p.book)).push(p);
for (const [book, ps] of byBook) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => out.push({ book, pageerror: e.message }));
  if (POINTING) await page.addInitScript((v) => { try { localStorage.setItem("fh.masorah", v); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch {} }, POINTING);
  await page.goto(`${tree.base}/zone.html?b=${book}&commentary=on`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb");
  await page.waitForTimeout(500);
  for (const p of ps) {
    const got = await page.evaluate(async ({ unit, i }) => {
      const turn = (ms) => new Promise((r) => setTimeout(r, ms));
      const store = window.__commentaryStore;
      const base = Object.entries(store.units).find(([, u]) => (u.section || []).some((e) => e.unit === unit));
      if (!base) return { fault: "no unit" };
      const secs = [...document.querySelectorAll("section.seg")];
      const sec = secs.find((s) => s.__sec && (s.id === base[0] || s.__sec.id === base[0] || s.__sec.unit === base[0] || (s.dataset && s.dataset.unit === base[0])));
      if (!sec) return { fault: `no section for ${base[0]}`, ids: secs.slice(0, 3).map((s) => [s.id, s.__sec && Object.keys(s.__sec).slice(0, 8)]) };
      sec.scrollIntoView(); await turn(300);
      let inl = [...sec.querySelectorAll(".c-inline")];
      if (!inl.length || inl.every((x) => x.hidden)) { const bar = sec.querySelector(".c-bar"); if (bar) { bar.click(); await turn(400); } }
      inl = [...sec.querySelectorAll(".c-inline")].filter((x) => !x.hidden);
      if (!inl.length) return { fault: "no inline commentary shown" };
      const wbs = [...inl[0].querySelectorAll(".wb")];
      const wb = wbs[i];
      if (!wb) return { fault: `no word ${i} of ${wbs.length}` };
      const word = (wb.querySelector(".w") || wb).textContent.trim();
      const line = (wb.querySelector(":scope > .g") || {}).textContent;
      (wb.querySelector(".w span") || wb.querySelector(".w")).click();
      await turn(900);
      const h = document.getElementById("hud");
      const pills = h ? [...h.querySelectorAll(".r-pills button, .r-pills .r-pill")].map((x) => x.textContent.replace(/\s+/gu, " ").trim()) : [];
      const pl = h ? h.querySelector(".r-pills") : null;
      const wl = h ? h.querySelector(".withheld-line") : null;
      const sw = h ? h.querySelector(".sources-withheld") : null;
      const pressed = h ? [...h.querySelectorAll(".r-pills [aria-pressed=true], .r-pills .on")].map((x) => x.textContent.replace(/\s+/gu, " ").trim()) : [];
      const res = { word, line: line === " " ? "" : line, card_open: !!(h && !h.hidden), pills, pressed, withheld_line: wl ? wl.textContent.trim() : "", emptied: sw ? sw.textContent.trim() : "", place_held: pl ? pl.dataset.placeHeld ?? null : null, card_held: window.__cardHeld ?? null, masorah: window.__masorah };
      if (h) h.hidden = true;
      return res;
    }, { unit: p.unit, i: p.i });
    out.push({ ...p, ...got });
  }
  await page.close();
}
await browser.close();
await tree.close();
console.log(JSON.stringify(out, null, 1));
