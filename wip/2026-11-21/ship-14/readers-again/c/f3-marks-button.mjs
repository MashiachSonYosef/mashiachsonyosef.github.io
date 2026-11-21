// Finding 3, the part that is left: the scribes' marks button after the rail is drawn a second time.
// Also read here, for X1: how tall the switches row is while the reset pill's line is empty, "1 picked" or "default".
// node f3-marks-button.mjs [book] [query, "-" for none]
import { open } from "./lib.mjs";
const [BOOK = "obadiah", Q = "&rail=all"] = process.argv.slice(2);
const QUERY = Q === "-" ? "" : Q;
const { b, p, errors } = await open(`b=${BOOK}${QUERY}`);
const marks = () => p.evaluate(() => {
  const m = document.getElementById("marksToggle"), row = document.querySelector("#railRows .marks-row"), fold = document.querySelector("#railRows details.more-switches");
  return { button: m ? `${m.hidden ? "hidden" : "shown"}: "${m.textContent}"` : "NOT IN THE PAGE", marksRow: !!row, foldDrawn: fold ? !fold.hidden : null, foldCount: fold ? fold.querySelector("summary").textContent : null, rowsUnderFold: fold ? fold.querySelectorAll(":scope > .row").length : null,
    strip: document.querySelectorAll("#sourcesRow .src-row").length, switchesRow: Math.round(document.getElementById("modeRow").getBoundingClientRect().height * 10) / 10, reset: document.getElementById("resetState").textContent };
});
console.log(`${BOOK}${QUERY}`);
console.log("at load:            ", JSON.stringify(await marks()));
await p.click("#sensesPill"); await p.waitForTimeout(1200);
console.log("word senses pressed:", JSON.stringify(await marks()));
await p.click("#resetPill"); await p.waitForTimeout(1500);
console.log("reset pressed:      ", JSON.stringify(await marks()));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
