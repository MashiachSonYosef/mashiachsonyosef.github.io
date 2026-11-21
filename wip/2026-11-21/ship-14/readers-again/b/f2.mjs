// Finding 2: a reading chosen through a witness is remembered under a key that never matches.
// Control: press a pill, close, reopen (the card must reopen on it). Test: then press a witness of that pill's record,
// close, reopen, and compare the pressed pill with the line under the word.
// node f2.mjs <book> <label> <idx> <pill index to press> [witness index]
import { open, mask, cellSrc, clickWord, lineOf } from "./lib.mjs";
const [BOOK, LABEL, IDX, PILL, WIT = "0"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
const src = cellSrc(LABEL, IDX);
const pressed = () => p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const i = xs.findIndex((x) => x.getAttribute("aria-pressed") === "true"); return `pill ${i} of ${xs.length} ${JSON.stringify(i >= 0 ? xs[i].textContent : null)}`; });
const now = () => p.evaluate(() => { const k = document.querySelector("#hud .r-now"); return k ? k.textContent : null; });
const dtext = () => p.evaluate(() => { const d = document.querySelector("#hud .d-card"); return d ? d.textContent.slice(0, 90) : null; });
console.log("line at rest:", JSON.stringify(mask(await lineOf(p, src))));
await clickWord(p, src);
console.log("card opens on:", mask(await pressed()));
await p.evaluate((k) => document.querySelectorAll("#hud .b-read .r-pills button")[k].click(), Number(PILL)); await p.waitForTimeout(500);
console.log("after pressing pill", PILL + ":", mask(await pressed()));
await p.keyboard.press("Escape"); await p.waitForTimeout(500);
console.log("CONTROL line:", JSON.stringify(mask(await lineOf(p, src))));
await clickWord(p, src);
console.log("CONTROL card reopens on:", mask(await pressed()));
const wit = await p.evaluate((w) => { const xs = [...document.querySelectorAll("#hud .d-also .d-also-m")]; const lab = (document.querySelector("#hud .d-also .d-also-lab") || {}).textContent; const x = xs[w]; if (x) x.click(); return x ? `${lab} :: ${x.textContent}` : null; }, Number(WIT));
await p.waitForTimeout(600);
console.log("witness pressed:", JSON.stringify(mask(wit)));
console.log("after the witness:", mask(await pressed()), "| card label:", JSON.stringify(mask(await now())));
// the key the page wrote, read off the page's own memory where a hook shows it
console.log("record card:", JSON.stringify(mask(await dtext())));
await p.keyboard.press("Escape"); await p.waitForTimeout(500);
console.log("TEST line:", JSON.stringify(mask(await lineOf(p, src))));
await clickWord(p, src);
console.log("TEST card reopens on:", mask(await pressed()));
console.log("record card:", JSON.stringify(mask(await dtext())));
console.log("TEST line with the card open:", JSON.stringify(mask(await lineOf(p, src))));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
