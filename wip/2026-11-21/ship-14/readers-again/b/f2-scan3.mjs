// Finding 2, step 4: look for a "same wording, standing under N other readings" line on any pill of any word.
// node f2-scan3.mjs <book> [max words] [start] [max pills per word]
import { open, mask } from "./lib.mjs";
const [BOOK = "ruth", MAX = "60", START = "0", MAXP = "14"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length);
let hits = 0;
for (let i = Number(START); i < Math.min(n, Number(START) + Number(MAX)) && hits < 3; i++) {
  const info = await p.evaluate((i) => {
    const wb = document.querySelectorAll("section.seg .he-text .wb")[i]; if (!wb) return null;
    const sec = wb.closest("section.seg"); const label = (sec.querySelector(".vnum") || {}).textContent;
    const idx = [...sec.querySelectorAll(".he-text .wb")].indexOf(wb);
    wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    return { label, idx, run: !!wb.closest(".wjoin") };
  }, i);
  if (!info) break;
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 6000 }).catch(() => {});
  await p.waitForTimeout(400);
  const np = await p.evaluate(() => document.querySelectorAll("#hud .b-read .r-pills button").length);
  const opened = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].findIndex((x) => x.getAttribute("aria-pressed") === "true"));
  for (let k = -1; k < Math.min(np, Number(MAXP)); k++) {
    let t = "(as opened)";
    if (k >= 0) { if (k === opened) continue; t = await p.evaluate((k) => { const x = document.querySelectorAll("#hud .b-read .r-pills button")[k]; if (!x) return null; x.click(); return x.textContent; }, k); await p.waitForTimeout(100); }
    const labs = await p.evaluate(() => [...document.querySelectorAll("#hud .d-also")].filter((l) => /same wording/u.test((l.querySelector(".d-also-lab") || {}).textContent || "")).map((l) => `${(l.querySelector(".d-also-lab") || {}).textContent} :: ${[...l.querySelectorAll(".d-also-m")].map((x) => x.textContent).join(" || ")}`));
    if (labs.length) { hits++; console.log(`${info.label} word ${info.idx}${info.run ? " (in a run)" : ""} opened on pill ${opened} of ${np}; pill ${k} ${JSON.stringify(mask(t))}`, JSON.stringify(labs.map(mask))); }
  }
  await p.keyboard.press("Escape"); await p.waitForTimeout(150);
}
console.log("scanned to word", Math.min(n, Number(START) + Number(MAX)), "of", n, "hits", hits);
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
