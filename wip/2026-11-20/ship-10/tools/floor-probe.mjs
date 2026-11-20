// Ship 10: the floor of the readings on a short window, one word's card with its record opened whole. node floor-probe.mjs <base> <book> <word index> <out.png> [query]
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, ix, out, query = ""] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await (await b.newContext({ viewport: { width: 640, height: 360 } })).newPage();
await p.goto(`${base}/zone.html?b=${book}${query}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
for (const state of ["default", "whole"]) {
  await p.evaluate(({ i, at }) => { const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i]; wb.scrollIntoView({ block: "center" }); window.scrollBy(0, wb.getBoundingClientRect().bottom - at); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, { i: +ix, at: 100 });
  await p.waitForTimeout(900);
  if (state === "whole") { await p.evaluate(() => { const g = document.querySelector("#hud .d-foot .d-grow"); if (g) g.click(); }); await p.waitForTimeout(500); }
  const r = await p.evaluate(() => {
    const hud = document.getElementById("hud"); if (!hud || hud.hidden) return null;
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), Math.round(r.height)]; };
    const box = hud.querySelector(":scope > .rows .b-read .r-pills");
    return { inner: innerHeight, hud: q(hud), cls: hud.className, head: q(hud.querySelector(".head")), headText: (hud.querySelector(".head") || {}).textContent.replace(/\s+/g, " ").replace(/[֐-׿]/g, "?").slice(0, 150), rows: q(hud.querySelector(":scope > .rows")), bands: [...hud.querySelectorAll(":scope > .rows > .band")].map((x) => `${x.className.replace("band ", "")}:${q(x).join("/")}`), pills: q(box), firstPill: box && box.children[0] ? q(box.children[0]) : null, floor: hud.dataset.readFloor || "", dict: q(hud.querySelector(".d-body, .d-text")), scrollTop: hud.querySelector(":scope > .rows") ? hud.querySelector(":scope > .rows").scrollTop : null };
  });
  console.log(state, JSON.stringify(r));
  if (state === "whole") await p.screenshot({ path: out });
  await p.keyboard.press("Escape"); await p.waitForTimeout(150);
}
await b.close();
