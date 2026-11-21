// Finding 8's related remark: with TAHOT switched off, is a place's reading dropped even where every piece is MACULA's?
// node f8-related.mjs <book> <label> <idx> <source name on the rail to switch off>
import { open, mask, cellSrc, clickWord, lineOf } from "./lib.mjs";
const [BOOK, LABEL, IDX, NAME = "STEP TAHOT"] = process.argv.slice(2);
const { b, p } = await open(`b=${BOOK}#${LABEL}`);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(1500);
const src = cellSrc(LABEL, IDX);
console.log("line at rest:", JSON.stringify(mask(await lineOf(p, src))));
await p.evaluate((name) => { document.querySelector("#rail > summary").click(); const o = [...document.querySelectorAll('.row[data-toggle="sources"] button.src-open')].find((x) => x.textContent === name); o.previousElementSibling.click(); }, NAME);
await p.waitForTimeout(2500);
console.log(`rail: ${await p.evaluate(() => (document.querySelector("#rail .src-sum") || {}).textContent)}`);
console.log(`line with ${NAME} off:`, JSON.stringify(mask(await lineOf(p, src))));
await clickWord(p, src);
console.log("card label:", JSON.stringify(mask(await p.evaluate(() => (document.querySelector("#hud .r-now .k") || {}).textContent))), "| lines:", JSON.stringify((await p.evaluate(() => [...document.querySelectorAll("#hud .r-piece, #hud .r-dflt")].map((x) => x.textContent.slice(0, 70)))).map(mask)));
await b.close();
