// Finding 9, step 1: on the first words of a book, press every division and block and say which stand on no pool
// (the read row's message) and which have pills with notes (signs off / withheld) under them.
// node f9-find.mjs <book> [max words] [extra query]
import { open, mask } from "./lib.mjs";
const [BOOK = "ruth", MAX = "20", EXTRA = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}`);
const readRow = () => p.evaluate(() => { const r = document.querySelector("#hud > .rows .b-read"); if (!r) return null; const pills = r.querySelectorAll(".r-pills button").length; const msg = [...r.querySelectorAll("p")].filter((x) => !x.classList.contains("r-label")).map((x) => `${x.className}: ${x.textContent.slice(0, 70)}`); return { pills, msg }; });
for (let i = 0; i < Number(MAX); i++) {
  const info = await p.evaluate((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb")[i]; if (!wb) return null; const sec = wb.closest("section.seg"); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return { label: (sec.querySelector(".vnum") || {}).textContent, idx: [...sec.querySelectorAll(".he-text .wb")].indexOf(wb), run: !!wb.closest(".wjoin") }; }, i);
  if (!info) break;
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 6000 }).catch(() => {});
  await p.waitForTimeout(500);
  const nCut = await p.evaluate(() => document.querySelectorAll("#hud .b-cut .s-pills button").length);
  const first = await readRow();
  console.log(`${info.label} w${info.idx}${info.run ? " run" : ""}: opens with ${first ? first.pills : "?"} pills ${JSON.stringify((first ? first.msg : []).map(mask))}; ${nCut} divisions`);
  for (let c = 0; c < nCut; c++) {
    await p.evaluate((c) => { const x = document.querySelectorAll("#hud .b-cut .s-pills button")[c]; if (x) x.click(); }, c); await p.waitForTimeout(700);
    const nCell = await p.evaluate(() => document.querySelectorAll("#hud .b-cell .s-pills button").length);
    const r0 = await readRow();
    console.log(`   division ${c} (${nCell} blocks): ${r0.pills} pills ${JSON.stringify(r0.msg.map(mask))}`);
    for (let k = 0; k < nCell; k++) {
      await p.evaluate((k) => { const x = document.querySelectorAll("#hud .b-cell .s-pills button")[k]; if (x) x.click(); }, k); await p.waitForTimeout(700);
      const r = await readRow();
      console.log(`      block ${k}: ${r.pills} pills ${JSON.stringify(r.msg.map(mask))}`);
    }
  }
  await p.keyboard.press("Escape"); await p.waitForTimeout(250);
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
