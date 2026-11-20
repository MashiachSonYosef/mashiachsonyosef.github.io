import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const base = process.argv[2] || "http://127.0.0.1:8915/reader";
const q = process.argv[3] ?? "&default=macula";
const at = process.argv[4] || "1:8:8";
const book = process.argv[5] || "daniel";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const PREF = process.argv[6] || "";
if (PREF) await ctx.addInitScript((v) => { try { localStorage.setItem("fh.maqaf-join", v); } catch {} }, PREF);
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await p.goto(`${base}/zone.html?b=${book}${q}`, { waitUntil: "load" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 });
await p.waitForTimeout(1500);
const findWb = (at) => {
  const m = /^(.*):(\d+)$/u.exec(at);
  const secs = [...document.querySelectorAll("section.seg")];
  const i = secs.findIndex((s) => s.__sec && s.__sec.label === m[1]);
  if (i < 0) return null;
  if (secs[i].__body && window.__materialise) window.__materialise(i, i + 1);
  return [...secs[i].querySelectorAll(".he-text .wb:not(.mark)")][Number(m[2]) - 1] || null;
};
const info = await p.evaluate(({ at, f }) => {
  const wb = (0, eval)(`(${f})`)(at); if (!wb) return "not found";
  const sec = wb.closest("section.seg");
  return [...sec.querySelectorAll(".he-text .wb:not(.mark)")].map((x, i) => `${i + 1}:${(x.querySelector(":scope > .g") || {}).textContent || ""}${x.closest(".wjoin") ? " [J]" : ""}`).join(" | ");
}, { at, f: findWb.toString() });
console.log(info);
await p.evaluate(({ at, f }) => { const wb = (0, eval)(`(${f})`)(at); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, { at, f: findWb.toString() });
for (const ms of [3000]) {
  await p.waitForTimeout(ms);
  console.log(ms, JSON.stringify(await p.evaluate(() => ({ k: (document.querySelector("#hud .r-now .k") || {}).textContent, v: (document.querySelector("#hud .r-now .v") || {}).textContent, pills: document.querySelectorAll("#hud > .rows .b-read .r-pills button").length, anyPills: document.querySelectorAll("#hud .r-pills button").length, rows: [...document.querySelectorAll("#hud > .rows > *")].map((x) => x.className).slice(0, 12), read: ((document.querySelector("#hud > .rows .b-read") || {}).textContent || "").slice(0, 400) }))));
}
await b.close();
