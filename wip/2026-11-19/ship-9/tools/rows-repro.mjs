// Ship 9: check-reading-rows-v1 R1 at 390x750, the word at 120px: the card's bands measured
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, wi, W, H, AT] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: Number(W), height: Number(H) } })).newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(({ i, at }) => {
  const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i];
  wb.scrollIntoView({ block: "center" });
  window.scrollBy(0, wb.getBoundingClientRect().bottom - at);
  (wb.querySelector(".w span") || wb.querySelector(".w")).click();
}, { i: Number(wi), at: Number(AT) });
await p.waitForTimeout(Number(process.env.WAIT || 1500));
const r = await p.evaluate(() => {
  const hud = document.getElementById("hud"), rows = hud.querySelector(":scope > .rows");
  const hb = (el) => el ? Math.round(el.getBoundingClientRect().height) : null;
  const kids = rows ? [...rows.children].map((x) => `${x.className.split(" ")[0]}:${hb(x)}`) : [];
  const read = hud.querySelector(":scope > .rows > .b-read");
  const readKids = read ? [...read.children].map((x) => `${(x.className || x.tagName).toString().split(" ")[0]}:${hb(x)}${getComputedStyle(x).display === "none" ? "(none)" : ""}`) : [];
  const box = read && read.querySelector(".r-pills");
  const rowsOf = (() => { if (!box) return null; const top = box.getBoundingClientRect().top, rr = []; for (const el of box.children) { const q = el.getBoundingClientRect(), t = q.top - top + box.scrollTop, bt = q.bottom - top + box.scrollTop; const row = rr.find((x) => Math.abs(x.t - t) < 2); if (row) row.b = Math.max(row.b, bt); else rr.push({ t, b: bt }); } return rr.slice(0, 4).map((x) => `${Math.round(x.t)}-${Math.round(x.b)}`).join(" "); })();
  return { rowsOf, hud: hb(hud), maxH: hud.style.maxHeight, tight: hud.classList.contains("tight") || (rows && rows.classList.contains("tight")), rowsH: rows ? rows.clientHeight : null, kids, readKids, pillsClient: box ? box.clientHeight : null, pillsScroll: box ? box.scrollHeight : null, readRows: hud.dataset.readRows || "", wl: (hud.querySelector(".withheld-line") || {}).textContent || "" };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
