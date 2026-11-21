// Finding 2, step 1: find words whose card carries a "same wording, standing under..." or "same record, carried by..." line.
// node f2-scan.mjs <book> [max words] [start]
import { open, mask } from "./lib.mjs";
const [BOOK = "ruth", MAX = "120", START = "0"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length);
console.log("words drawn:", n);
let hits = 0;
for (let i = Number(START); i < Math.min(n, Number(START) + Number(MAX)) && hits < 8; i++) {
  const info = await p.evaluate((i) => {
    const wb = document.querySelectorAll("section.seg .he-text .wb")[i]; if (!wb) return null;
    const sec = wb.closest("section.seg"); const label = (sec.querySelector(".vnum") || {}).textContent;
    const idx = [...sec.querySelectorAll(".he-text .wb")].indexOf(wb);
    wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    return { label, idx, run: !!wb.closest(".wjoin") };
  }, i);
  if (!info) break;
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 6000 }).catch(() => {});
  await p.waitForTimeout(500);
  const labs = await p.evaluate(() => [...document.querySelectorAll("#hud .d-also")].map((l) => ({ lab: (l.querySelector(".d-also-lab") || {}).textContent, n: l.querySelectorAll(".d-also-m").length, sel: !!l.querySelector("select") })));
  const pills = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].length);
  if (labs.length) { hits++; console.log(`${info.label} word ${info.idx}${info.run ? " (in a run)" : ""} pills=${pills}`, JSON.stringify(labs)); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(250);
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
